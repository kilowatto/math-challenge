/**
 * El PIN de imágenes. Criterio #116 de F2 · línea roja #3, D-012.
 *
 * ─── El niño entra sin escribir y sin leer ─────────────────────────────────
 *
 * Nueve dibujos en una rejilla; se tocan tres, en orden. Eso es todo. No hay
 * teclado, no hay contraseña, no hay nada que leer: un niño de cuatro años que
 * no lee tiene que poder entrar a su propio perfil, y la línea roja #3 dice que
 * **ningún niño escribe texto libre en ninguna superficie**.
 *
 * El alias va debajo de cada cara como **apoyo, no como requisito**. Quien lee,
 * lee; quien no, reconoce el dibujo.
 *
 * ─── Las nueve imágenes se DERIVAN, no se guardan ──────────────────────────
 *
 * `HKDF(PIN_PAD_SECRET, child_profile_id)` decide qué nueve dibujos, de todo el
 * catálogo, le tocan a este niño y en qué orden se pintan. Dos consecuencias, y
 * las dos importan:
 *
 *  1. **El esquema no crece.** Sin esto haría falta una columna JSON en una
 *     tabla de niño guardando su rejilla — o sea un dato más de un menor que
 *     proteger, borrar y explicar. Aquí no hay nada que guardar.
 *  2. **La rejilla es distinta para cada niño.** Dos hermanos en la misma tablet
 *     ven dos rejillas distintas, así que mirar por encima del hombro no basta:
 *     hay que aprenderse las posiciones del otro, no los dibujos.
 *
 * Lo que SÍ se guarda es el PIN elegido, hasheado — `child_image_pin` en la
 * migración 0002. Nunca los dibujos.
 *
 * ─── Lo que este PIN no es ─────────────────────────────────────────────────
 *
 * No es seguridad contra un adulto decidido: son 9×8×7 = 504 combinaciones. **Y
 * no tiene que serlo.** D-012 dice que la protección real la da el dispositivo:
 * `/app/kids` no pinta una sola cara si la petición no trae `mc_h` de un
 * dispositivo que el adulto marcó como de la casa. El PIN separa a dos hermanos,
 * no defiende de un extraño — y confundir las dos cosas llevaría a pedirle a un
 * niño de cuatro años algo que no puede hacer.
 */

const ENC = new TextEncoder();

/**
 * El catálogo de dibujos. Identificadores, no rutas: la imagen concreta la
 * resuelve la interfaz, y así cambiar el arte no invalida ningún PIN.
 *
 * Son cosas que un niño de cuatro años nombra sin dudar, en cualquiera de los
 * siete locales. Nada de símbolos abstractos, nada que dependa de leer.
 */
export const CATALOGO = [
  "sol", "luna", "estrella", "nube", "arbol", "flor", "manzana", "platano",
  "pez", "gato", "perro", "pajaro", "mariposa", "abeja", "rana", "tortuga",
  "casa", "coche", "barco", "avion", "pelota", "globo", "tambor", "campana",
] as const;

export type Dibujo = (typeof CATALOGO)[number];

/** Cuántos se pintan, y cuántos se tocan. */
export const CASILLAS = 9;
export const LARGO_PIN = 3;

/**
 * HKDF-SHA256 sobre el secreto y el id del perfil.
 *
 * `info` distingue los usos del mismo secreto: derivar la rejilla y hashear el
 * PIN salen de la misma llave y **no deben producir el mismo material**. Es la
 * razón entera de que HKDF tenga ese parámetro.
 */
async function derivarBytes(secreto: string, childProfileId: string, info: string, bytes: number): Promise<Uint8Array> {
  const clave = await crypto.subtle.importKey("raw", ENC.encode(secreto), "HKDF", false, ["deriveBits"]);
  const material = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      // La sal es el id del perfil: dos niños con el mismo secreto obtienen
      // material distinto, que es lo que hace que sus rejillas difieran.
      salt: ENC.encode(childProfileId),
      info: ENC.encode(info),
    },
    clave,
    bytes * 8,
  );
  return new Uint8Array(material);
}

/**
 * Las nueve casillas de este niño, en el orden en que se pintan.
 *
 * Barajado determinista de Fisher-Yates consumiendo los bytes derivados. Es
 * determinista a propósito: el mismo niño ve **siempre** la misma rejilla, o no
 * podría recordar su PIN. Lo que cambia entre niños es el resultado, no el
 * método.
 */
export async function rejillaDe(secreto: string, childProfileId: string): Promise<Dibujo[]> {
  // Un byte por posición a barajar, con holgura: el sesgo del módulo sobre 24
  // elementos es despreciable para elegir dibujos y no vale la pena el rechazo.
  const bytes = await derivarBytes(secreto, childProfileId, "rejilla", CATALOGO.length);
  const baraja = [...CATALOGO];
  for (let i = baraja.length - 1; i > 0; i--) {
    const j = bytes[i] % (i + 1);
    [baraja[i], baraja[j]] = [baraja[j], baraja[i]];
  }
  return baraja.slice(0, CASILLAS);
}

/**
 * Hashea un PIN para guardarlo en `child_image_pin`.
 *
 * **El PIN son posiciones, no dibujos.** Guardar «sol, gato, barco» permitiría
 * que alguien con acceso a la base reconstruyera la rejilla del niño; guardar
 * «0, 4, 7» no dice nada sin la rejilla, que no está guardada en ninguna parte.
 *
 * Se sala con el `childProfileId` a través de HKDF, así que dos niños que elijan
 * las mismas tres posiciones tienen hashes distintos.
 */
export async function hashearPin(
  secreto: string,
  childProfileId: string,
  posiciones: number[],
): Promise<string> {
  if (!pinValido(posiciones)) throw new Error("pin: posiciones inválidas");
  const bytes = await derivarBytes(secreto, childProfileId, `pin:${posiciones.join(",")}`, 32);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * ¿Es válido este PIN?
 *
 * Tres posiciones distintas dentro de la rejilla. **Distintas** porque tocar la
 * misma casilla tres veces es lo que hace un niño que no entendió, y aceptarlo
 * reduciría el espacio a 9 combinaciones sin que nadie lo notara.
 */
export function pinValido(posiciones: number[]): boolean {
  if (!Array.isArray(posiciones) || posiciones.length !== LARGO_PIN) return false;
  if (!posiciones.every((p) => Number.isInteger(p) && p >= 0 && p < CASILLAS)) return false;
  return new Set(posiciones).size === LARGO_PIN;
}

/**
 * Compara dos hashes de PIN en tiempo constante.
 *
 * Misma razón que en las contraseñas: un `===` sale antes en el primer carácter
 * distinto. Aquí importa menos —504 combinaciones se agotan por fuerza bruta
 * antes que por temporización— pero cuesta cuatro líneas.
 */
export function pinesIguales(a: string, b: string): boolean {
  let dif = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) dif |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return dif === 0;
}

/** Cuántas combinaciones hay. Se publica para que nadie la confunda con seguridad. */
export const COMBINACIONES = CASILLAS * (CASILLAS - 1) * (CASILLAS - 2); // 504
