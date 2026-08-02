// Casos de WebAuthn (F2 #112, D-038, #263).
//
// Se genera una llave P-256 REAL y se firma de verdad: no hay dobles. Lo que se
// prueba es que una firma buena pase y que cada comprobación, quitada, deje
// pasar algo que no debería — que es lo único que distingue una verificación de
// criptografía de un `return true` con buena prensa.

import {
  leerAuthData,
  importarLlaveCose,
  comprobarCliente,
  verificarAutenticacion,
  bytesAB64url,
  hashDelRpId,
} from "./webauthn.ts";
import { RP_ID, ORIGEN_ESPERADO } from "./passkeys.ts";

let fallos = 0;
const ok = (cond, nombre) => {
  console.log(`  ${cond ? "✓" : "✗"} ${nombre}`);
  if (!cond) fallos++;
};

const enc = new TextEncoder();
const b64url = (b) => bytesAB64url(new Uint8Array(b));

// --- Una llave P-256 de verdad ---------------------------------------------
const par = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
const jwk = await crypto.subtle.exportKey("jwk", par.publicKey);
const deB64url = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

/** Arma un mapa COSE EC2/P-256/ES256 a mano, que es lo que el autenticador manda. */
function coseDe(jwk) {
  const x = deB64url(jwk.x), y = deB64url(jwk.y);
  return new Uint8Array([
    0xa5,                    // mapa de 5
    0x01, 0x02,              // 1: kty = 2 (EC2)
    0x03, 0x26,              // 3: alg = -7 (ES256)
    0x20, 0x01,              // -1: crv = 1 (P-256)
    0x21, 0x58, 0x20, ...x,  // -2: x, 32 bytes
    0x22, 0x58, 0x20, ...y,  // -3: y, 32 bytes
  ]);
}
const cose = coseDe(jwk);

/** Arma un `authData` con el hash real del RP ID. */
async function authDataDe(signCount, flags = 0x05) {
  const a = new Uint8Array(37);
  a.set(await hashDelRpId(), 0);
  a[32] = flags;
  new DataView(a.buffer).setUint32(33, signCount, false);
  return a;
}

const clientData = (reto, origin = ORIGEN_ESPERADO, type = "webauthn.get") =>
  b64url(enc.encode(JSON.stringify({ type, challenge: reto, origin })));

/** Firma como lo haría el autenticador: `authData ‖ SHA-256(clientDataJSON)`. */
async function firmar(authData, clientDataJSONb64) {
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", deB64url(clientDataJSONb64)));
  const msg = new Uint8Array(authData.length + hash.length);
  msg.set(authData, 0); msg.set(hash, authData.length);
  const crudo = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, par.privateKey, msg));
  // WebCrypto firma en crudo; el autenticador manda DER. Se convierte para que
  // la prueba recorra el MISMO camino que producción.
  const aDer = (r) => {
    const ent = (v) => { let i = 0; while (i < v.length - 1 && v[i] === 0) i++; const t = v.slice(i);
      return t[0] & 0x80 ? new Uint8Array([0x02, t.length + 1, 0, ...t]) : new Uint8Array([0x02, t.length, ...t]); };
    const a = ent(r.slice(0, 32)), b = ent(r.slice(32));
    return new Uint8Array([0x30, a.length + b.length, ...a, ...b]);
  };
  return b64url(aDer(crudo));
}

console.log("webauthn — verificación sin librería (D-038, #112)\n");

// --- lectura de authData ----------------------------------------------------
const ad = await authDataDe(7);
const leido = leerAuthData(ad);
ok(leido.signCount === 7, "el contador de firmas se lee bien (big-endian)");
ok((leido.flags & 0x01) === 1, "el bit de presencia del usuario se lee");
ok(leido.credentialId === undefined, "sin bit de credencial adjunta no se inventa un id");

// --- la llave COSE ----------------------------------------------------------
const llave = await importarLlaveCose(cose);
ok(llave.type === "public", "una llave COSE EC2/P-256/ES256 se importa");

// Solo un algoritmo, y por eso una sola superficie.
const coseMalo = coseDe(jwk); coseMalo[4] = 0x27; // alg = -8 (EdDSA)
let lanzo = false;
try { await importarLlaveCose(coseMalo); } catch { lanzo = true; }
ok(lanzo, "un algoritmo que no es ES256 se RECHAZA, no se intenta");

// --- la firma buena ---------------------------------------------------------
const reto = "un-reto-aleatorio-de-prueba";
const cd = clientData(reto);
const firma = await firmar(ad, cd);

const r1 = await verificarAutenticacion({
  authenticatorData: b64url(ad), clientDataJSON: cd, signature: firma,
  llavePublicaCose: cose, retoEsperado: reto, signCountGuardado: 6,
});
ok(r1.ok === true, "una firma buena con el contador subiendo VERIFICA");
ok(r1.ok && r1.signCount === 7, "y devuelve el contador nuevo para guardarlo");

// --- LA COMPROBACIÓN DEL CONTADOR, que es la que más se olvida -------------
//
// Si llega un contador igual o menor al guardado, la llave está CLONADA: la
// auténtica ya iba más adelante. Sin esto, alguien que copie una credencial la
// usa para siempre y nada lo delata.
const r2 = await verificarAutenticacion({
  authenticatorData: b64url(ad), clientDataJSON: cd, signature: firma,
  llavePublicaCose: cose, retoEsperado: reto, signCountGuardado: 7,
});
ok(!r2.ok && r2.motivo.startsWith("contador_no_subio"), "un contador IGUAL se rechaza: llave clonada");

const r3 = await verificarAutenticacion({
  authenticatorData: b64url(ad), clientDataJSON: cd, signature: firma,
  llavePublicaCose: cose, retoEsperado: reto, signCountGuardado: 99,
});
ok(!r3.ok && r3.motivo.startsWith("contador_no_subio"), "y un contador MENOR también");

// Las passkeys sincronizadas de Apple y Google no llevan contador: mandan 0
// siempre. Ahí la comprobación no se puede hacer, y se DICE en vez de fingirla.
const ad0 = await authDataDe(0);
const cd0 = clientData(reto);
const r4 = await verificarAutenticacion({
  authenticatorData: b64url(ad0), clientDataJSON: cd0, signature: await firmar(ad0, cd0),
  llavePublicaCose: cose, retoEsperado: reto, signCountGuardado: 0,
});
ok(r4.ok === true, "un autenticador sin contador (0/0) sí pasa — Apple y Google no lo llevan");
ok(r4.ok && r4.contadorNoDisponible === true, "y se REPORTA que la comprobación no se pudo hacer");

// --- el reto ----------------------------------------------------------------
const r5 = await verificarAutenticacion({
  authenticatorData: b64url(ad), clientDataJSON: cd, signature: firma,
  llavePublicaCose: cose, retoEsperado: "otro-reto-distinto", signCountGuardado: 6,
});
ok(!r5.ok && r5.motivo === "reto_no_coincide", "un reto que no es el nuestro se rechaza");

// --- el origen --------------------------------------------------------------
// Un subdominio NO vale, y ese es el punto de #263: las passkeys quedan atadas
// a math.kilowatto.com y no se ofrecen en ningún otro sitio de kilowatto.com.
for (const malo of ["https://kilowatto.com", "https://otro.kilowatto.com", "http://math.kilowatto.com", "https://math.kilowatto.com.evil.mx"]) {
  const cdm = clientData(reto, malo);
  const r = await verificarAutenticacion({
    authenticatorData: b64url(ad), clientDataJSON: cdm, signature: await firmar(ad, cdm),
    llavePublicaCose: cose, retoEsperado: reto, signCountGuardado: 6,
  });
  ok(!r.ok && r.motivo === "origen_invalido", `origen rechazado: ${malo}`);
}

// --- la firma, alterada -----------------------------------------------------
const firmaRota = firma.slice(0, -4) + "AAAA";
const r6 = await verificarAutenticacion({
  authenticatorData: b64url(ad), clientDataJSON: cd, signature: firmaRota,
  llavePublicaCose: cose, retoEsperado: reto, signCountGuardado: 6,
});
ok(!r6.ok, "una firma alterada no verifica");

// Firmada con OTRA llave: es el ataque real, no una firma rota al azar.
const otro = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
const jwk2 = await crypto.subtle.exportKey("jwk", otro.publicKey);
const r7 = await verificarAutenticacion({
  authenticatorData: b64url(ad), clientDataJSON: cd, signature: firma,
  llavePublicaCose: coseDe(jwk2), retoEsperado: reto, signCountGuardado: 6,
});
ok(!r7.ok && r7.motivo === "firma_invalida", "una firma de OTRA llave no verifica");

// --- presencia del usuario --------------------------------------------------
const adSinPresencia = await authDataDe(8, 0x04);
const cdsp = clientData(reto);
const r8 = await verificarAutenticacion({
  authenticatorData: b64url(adSinPresencia), clientDataJSON: cdsp, signature: await firmar(adSinPresencia, cdsp),
  llavePublicaCose: cose, retoEsperado: reto, signCountGuardado: 6,
});
ok(!r8.ok && r8.motivo === "sin_presencia_del_usuario", "sin presencia del usuario se rechaza: la firma pudo hacerse sola");

// --- el tipo de ceremonia ---------------------------------------------------
const cdCrear = clientData(reto, ORIGEN_ESPERADO, "webauthn.create");
const r9 = await comprobarCliente(cdCrear, reto, "webauthn.get");
ok(!r9.ok && r9.motivo === "tipo_incorrecto", "una respuesta de REGISTRO no vale para entrar");



// ---------------------------------------------------------------------------
// attestationObject: la forma que devuelve REGISTRAR, no entrar
// ---------------------------------------------------------------------------
//
// `create()` devuelve `attestationObject` —CBOR con `{fmt, attStmt, authData}`—
// y `get()` devuelve `authenticatorData` desnudo. Son dos formas para dos
// ceremonias, y el servidor esperaba la segunda en el endpoint de la primera:
// `/api/passkey-registrar` devolvía 400 en TODO intento real, así que
// `user_passkeys` tenía cero filas y ninguna passkey del producto funcionaba.
//
// No lo atrapó nada porque estos casos probaban la librería con `authData` ya
// desenvuelto, y ninguna prueba llamaba al endpoint.
//
// SE VE FALLAR: quita el `case 3` del lector CBOR y esto lanza «tipo no
// soportado» sobre la clave "fmt".
{
  const { authDataDeAttestation } = await import("./webauthn.ts");

  /** Arma un `attestationObject` CBOR a mano: `{fmt:"none", attStmt:{}, authData}`. */
  const texto = (s) => {
    const b = new TextEncoder().encode(s);
    return new Uint8Array([0x60 | b.length, ...b]);
  };
  const bytes = (b) =>
    b.length < 24
      ? new Uint8Array([0x40 | b.length, ...b])
      : new Uint8Array([0x58, b.length, ...b]);

  const ad = await authDataDe(11);
  const attObj = new Uint8Array([
    0xa3, // mapa de 3
    ...texto("fmt"), ...texto("none"),
    ...texto("attStmt"), 0xa0, // mapa vacío
    ...texto("authData"), ...bytes(ad),
  ]);

  const sacado = authDataDeAttestation(attObj);
  ok(sacado.length === ad.length, "el authData sale del attestationObject con el mismo largo");
  ok(sacado.every((v, i) => v === ad[i]), "y byte por byte es el mismo");
  ok(leerAuthData(sacado).signCount === 11, "y se puede leer: el contador sobrevive el desenvuelto");

  let lanzo2 = false;
  try { authDataDeAttestation(new Uint8Array([0xa1, ...texto("fmt"), ...texto("none")])); }
  catch { lanzo2 = true; }
  ok(lanzo2, "un attestationObject SIN authData se rechaza en vez de devolver basura");
}

console.log(fallos === 0 ? "\n✓ webauthn — todos los casos" : `\n✗ webauthn — ${fallos} caso(s) fallaron`);
process.exit(fallos === 0 ? 0 : 1);
