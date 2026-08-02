/**
 * Verificación de WebAuthn, sin librería de terceros. Criterio #112 · D-038.
 *
 * ─── Por qué a mano y no con una dependencia ───────────────────────────────
 *
 * Lo que hace falta verificar cabe en este archivo: leer una estructura binaria
 * de campos fijos, sacar una llave pública de un mapa CBOR pequeño, y verificar
 * una firma ECDSA con WebCrypto — que ya está en el runtime.
 *
 * Una librería de WebAuthn trae además atestación, formatos de metadatos y
 * media docena de algoritmos que este producto no usa. `mc-47` §5 dice que el
 * dispositivo de referencia es Android de gama baja sobre 4G lento, y aquí cada
 * kilobyte del bundle del servidor es memoria del aislado.
 *
 * **Lo que esta decisión cuesta, dicho de frente:** esto es criptografía escrita
 * a mano, y un error aquí no falla ruidosamente — deja pasar una firma que no
 * debería. Por eso solo se admite **un** algoritmo, la atestación se ignora en
 * vez de interpretarse a medias, y cada comprobación tiene su caso que se ve
 * fallar cuando se quita.
 *
 * ─── Las cuatro comprobaciones, y ninguna es opcional ──────────────────────
 *
 *  1. La **firma** cuadra con la llave pública guardada.
 *  2. El **reto** es el que mandamos, y no se había usado.
 *  3. El **origen** es exactamente `https://math.kilowatto.com`.
 *  4. El **contador de firmas SUBIÓ**.
 *
 * La cuarta es la que más se olvida y la que más importa. `signCount` sube cada
 * vez que la llave firma. Si llega una firma con un contador igual o menor al
 * guardado, **la llave está clonada** — porque la auténtica ya iba más adelante.
 * Sin esa comprobación, alguien que copie una credencial la usa para siempre y
 * nada lo delata.
 */

import { RP_ID, origenValido } from "./passkeys.ts";

/** Solo ES256 (ECDSA P-256). Un algoritmo, y por eso una superficie. */
export const ALG_ES256 = -7;

const b64urlABytes = (s: string): Uint8Array =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

export const bytesAB64url = (b: Uint8Array): string =>
  btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/**
 * Lector de CBOR, acotado a lo que un mapa COSE necesita.
 *
 * **No es un decodificador de CBOR general y no debe usarse como tal.** Cubre
 * enteros, negativos, cadenas de bytes y mapas — que es exactamente lo que hay
 * dentro de una llave pública COSE. Cualquier otra cosa lanza, en vez de
 * devolver algo plausible: en un lector de criptografía, adivinar es peor que
 * fallar.
 */
function leerCbor(b: Uint8Array, i: number): { valor: unknown; siguiente: number } {
  const mayor = b[i] >> 5;
  const menor = b[i] & 0x1f;
  let n = menor;
  let j = i + 1;
  if (menor === 24) { n = b[j]; j += 1; }
  else if (menor === 25) { n = (b[j] << 8) | b[j + 1]; j += 2; }
  else if (menor === 26) { n = ((b[j] << 24) | (b[j + 1] << 16) | (b[j + 2] << 8) | b[j + 3]) >>> 0; j += 4; }
  else if (menor > 26) throw new Error("cbor: longitud no soportada");

  switch (mayor) {
    case 0: return { valor: n, siguiente: j };           // entero
    case 1: return { valor: -1 - n, siguiente: j };      // negativo
    case 2: return { valor: b.slice(j, j + n), siguiente: j + n }; // bytes
    case 5: {                                             // mapa
      const m = new Map<unknown, unknown>();
      let k = j;
      for (let c = 0; c < n; c++) {
        const clave = leerCbor(b, k); k = clave.siguiente;
        const valor = leerCbor(b, k); k = valor.siguiente;
        m.set(clave.valor, valor.valor);
      }
      return { valor: m, siguiente: k };
    }
    default:
      throw new Error(`cbor: tipo mayor ${mayor} no soportado en una llave COSE`);
  }
}

export interface AuthData {
  /** SHA-256 del RP ID. Se compara contra el nuestro. */
  rpIdHash: Uint8Array;
  /** Bit 0: presencia del usuario. Bit 2: verificación (PIN, huella, cara). */
  flags: number;
  signCount: number;
  credentialId?: Uint8Array;
  /** La llave pública en COSE, solo presente al registrar. */
  cosePublicKey?: Uint8Array;
}

/**
 * Lee `authenticatorData`. Es un formato binario de campos fijos, no CBOR.
 *
 *     32 bytes  rpIdHash
 *      1 byte   flags
 *      4 bytes  signCount (big-endian)
 *     [16 bytes AAGUID · 2 bytes largo · credentialId · COSE]  solo al registrar
 */
export function leerAuthData(datos: Uint8Array): AuthData {
  if (datos.length < 37) throw new Error("authData: demasiado corto");
  const rpIdHash = datos.slice(0, 32);
  const flags = datos[32];
  const signCount = new DataView(datos.buffer, datos.byteOffset + 33, 4).getUint32(0, false);

  // Bit 6: hay datos de credencial adjuntos. Solo al registrar.
  if (!(flags & 0x40)) return { rpIdHash, flags, signCount };

  const largoId = new DataView(datos.buffer, datos.byteOffset + 53, 2).getUint16(0, false);
  const credentialId = datos.slice(55, 55 + largoId);
  const cosePublicKey = datos.slice(55 + largoId);
  return { rpIdHash, flags, signCount, credentialId, cosePublicKey };
}

/**
 * Convierte una llave COSE EC2 P-256 en una `CryptoKey` de WebCrypto.
 *
 * Las etiquetas COSE que importan: `1` tipo (2 = EC2), `3` algoritmo (−7 =
 * ES256), `-1` curva (1 = P-256), `-2` la coordenada x, `-3` la y.
 *
 * **Se rechaza cualquier cosa que no sea exactamente eso.** Aceptar más
 * algoritmos aquí sería aceptar más formas de equivocarse, y este producto solo
 * necesita uno.
 */
export async function importarLlaveCose(cose: Uint8Array): Promise<CryptoKey> {
  const { valor } = leerCbor(cose, 0);
  if (!(valor instanceof Map)) throw new Error("cose: no es un mapa");
  const kty = valor.get(1);
  const alg = valor.get(3);
  const crv = valor.get(-1);
  const x = valor.get(-2);
  const y = valor.get(-3);
  if (kty !== 2) throw new Error(`cose: solo EC2, recibido kty=${String(kty)}`);
  if (alg !== ALG_ES256) throw new Error(`cose: solo ES256 (-7), recibido ${String(alg)}`);
  if (crv !== 1) throw new Error(`cose: solo P-256, recibido crv=${String(crv)}`);
  if (!(x instanceof Uint8Array) || !(y instanceof Uint8Array)) throw new Error("cose: x/y ausentes");

  return crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", x: bytesAB64url(x), y: bytesAB64url(y), ext: true },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"],
  );
}

/**
 * La firma de WebAuthn viene en DER y WebCrypto quiere el formato crudo (r‖s).
 *
 * Sin esta conversión `verify` devuelve `false` **sin lanzar** — o sea, toda
 * autenticación fallaría en silencio y el síntoma sería «mi passkey no
 * funciona», sin un solo error en el registro.
 */
function derACrudo(der: Uint8Array): Uint8Array {
  if (der[0] !== 0x30) throw new Error("firma: no es DER");
  let i = 2;
  if (der[1] & 0x80) i = 2 + (der[1] & 0x7f);
  const leerEntero = (): Uint8Array => {
    if (der[i] !== 0x02) throw new Error("firma: se esperaba un entero DER");
    const largo = der[i + 1];
    let v = der.slice(i + 2, i + 2 + largo);
    i += 2 + largo;
    // DER antepone 0x00 si el byte alto está puesto, para que no se lea como
    // negativo. El formato crudo no lo lleva.
    while (v.length > 32 && v[0] === 0) v = v.slice(1);
    const out = new Uint8Array(32);
    out.set(v, 32 - v.length);
    return out;
  };
  const r = leerEntero();
  const s = leerEntero();
  const crudo = new Uint8Array(64);
  crudo.set(r, 0);
  crudo.set(s, 32);
  return crudo;
}

export interface DatosDelCliente {
  type: string;
  challenge: string;
  origin: string;
}

/**
 * Las comprobaciones comunes a las dos ceremonias.
 *
 * Devuelve el motivo del rechazo en vez de lanzar: quien llama tiene que
 * responder algo a una persona, y una excepción convierte «esa llave no vale»
 * en un 500.
 */
export async function comprobarCliente(
  clientDataJSON: string,
  retoEsperado: string,
  tipoEsperado: "webauthn.create" | "webauthn.get",
): Promise<{ ok: true; datos: DatosDelCliente } | { ok: false; motivo: string }> {
  let datos: DatosDelCliente;
  try {
    datos = JSON.parse(new TextDecoder().decode(b64urlABytes(clientDataJSON)));
  } catch {
    return { ok: false, motivo: "clientData_ilegible" };
  }
  if (datos.type !== tipoEsperado) return { ok: false, motivo: "tipo_incorrecto" };

  // El reto se compara en tiempo constante. Un `!==` sale antes en el primer
  // byte distinto, y el reto es lo único que un atacante puede ir tanteando.
  if (!igualEnTiempoConstante(datos.challenge, retoEsperado)) {
    return { ok: false, motivo: "reto_no_coincide" };
  }

  // El origen EXACTO. `origenValido` no acepta subdominios: no existe ninguno,
  // y aceptar los que pudieran existir mañana sería abrir la puerta antes de
  // que nadie la pida (#263).
  if (!origenValido(datos.origin)) return { ok: false, motivo: "origen_invalido" };

  return { ok: true, datos };
}

function igualEnTiempoConstante(a: string, b: string): boolean {
  let dif = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) dif |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return dif === 0;
}

/** El SHA-256 del RP ID, para comparar contra `rpIdHash`. */
export async function hashDelRpId(): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(RP_ID)));
}

function bytesIguales(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let dif = 0;
  for (let i = 0; i < a.length; i++) dif |= a[i] ^ b[i];
  return dif === 0;
}

/**
 * Verifica una autenticación. Las cuatro comprobaciones del encabezado.
 *
 * `signCountGuardado` es lo que hay en `user_passkeys`. **La comprobación de que
 * subió no es opcional**: si llega un contador igual o menor, la llave está
 * clonada, porque la auténtica ya iba más adelante.
 *
 * La excepción es `0`: algunos autenticadores —las passkeys sincronizadas de
 * Apple y de Google, entre ellos— **no llevan contador y mandan siempre 0**. Ahí
 * la comprobación no se puede hacer, y eso hay que decirlo en vez de fingir que
 * se hizo: se devuelve `contadorNoDisponible` para que quien llame lo registre.
 */
export async function verificarAutenticacion(opts: {
  authenticatorData: string;
  clientDataJSON: string;
  signature: string;
  llavePublicaCose: Uint8Array;
  retoEsperado: string;
  signCountGuardado: number;
}): Promise<
  | { ok: true; signCount: number; contadorNoDisponible: boolean }
  | { ok: false; motivo: string }
> {
  const cliente = await comprobarCliente(opts.clientDataJSON, opts.retoEsperado, "webauthn.get");
  if (!cliente.ok) return cliente;

  const authData = b64urlABytes(opts.authenticatorData);
  const leido = leerAuthData(authData);

  if (!bytesIguales(leido.rpIdHash, await hashDelRpId())) {
    return { ok: false, motivo: "rp_id_no_coincide" };
  }
  // Bit 0: la persona estuvo presente. Sin él, la firma pudo hacerse sola.
  if (!(leido.flags & 0x01)) return { ok: false, motivo: "sin_presencia_del_usuario" };

  // ── LA COMPROBACIÓN DEL CONTADOR ─────────────────────────────────────────
  const contadorNoDisponible = leido.signCount === 0 && opts.signCountGuardado === 0;
  if (!contadorNoDisponible && leido.signCount <= opts.signCountGuardado) {
    return { ok: false, motivo: "contador_no_subio:llave_posiblemente_clonada" };
  }

  // Lo firmado es `authData ‖ SHA-256(clientDataJSON)`.
  const hashCliente = new Uint8Array(
    await crypto.subtle.digest("SHA-256", b64urlABytes(opts.clientDataJSON)),
  );
  const firmado = new Uint8Array(authData.length + hashCliente.length);
  firmado.set(authData, 0);
  firmado.set(hashCliente, authData.length);

  let llave: CryptoKey;
  try {
    llave = await importarLlaveCose(opts.llavePublicaCose);
  } catch {
    return { ok: false, motivo: "llave_publica_ilegible" };
  }

  let crudo: Uint8Array;
  try {
    crudo = derACrudo(b64urlABytes(opts.signature));
  } catch {
    return { ok: false, motivo: "firma_mal_formada" };
  }

  const valida = await crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    llave,
    crudo as BufferSource,
    firmado as BufferSource,
  );
  if (!valida) return { ok: false, motivo: "firma_invalida" };

  return { ok: true, signCount: leido.signCount, contadorNoDisponible };
}
