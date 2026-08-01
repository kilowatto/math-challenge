// Casos de las tres cookies (F2 #113, D-052, mc-25 impl. 6).
//
//   node --experimental-strip-types --no-warnings apps/web/src/lib/sesiones.prueba.mjs
//
// KV y D1 se sustituyen por dobles en memoria: lo que se prueba aquí es el
// CONTRATO —opacidad, atributos, vidas, el borrado del token anterior—, no
// Cloudflare. Lo que Cloudflare hace se comprueba en `audits/live.mjs` contra el
// despliegue real, leyendo los `Set-Cookie` que salen de verdad.

import {
  nuevoToken,
  esTokenOpaco,
  armarCookie,
  borrarCookie,
  leerCookies,
  abrirSesionAdulto,
  leerSesionAdulto,
  cerrarSesionAdulto,
  abrirSesionNino,
  leerSesionNino,
  marcarDispositivoDelHogar,
  leerDispositivoDelHogar,
  cerrarTodo,
  COOKIE_ADULTO,
  COOKIE_HOGAR,
  COOKIE_NINO,
  VIDA_ADULTO_S,
  VIDA_HOGAR_S,
  VIDA_NINO_S,
} from "./sesiones.ts";

let fallos = 0;
const ok = (cond, nombre) => {
  console.log(`  ${cond ? "✓" : "✗"} ${nombre}`);
  if (!cond) fallos++;
};

const kvFalso = () => {
  const m = new Map();
  return {
    m,
    async put(k, v, o) { m.set(k, { v, ttl: o?.expirationTtl }); },
    async get(k) { return m.has(k) ? m.get(k).v : null; },
    async delete(k) { m.delete(k); },
  };
};

const d1Falso = () => {
  const filas = [];
  return {
    filas,
    prepare(sql) {
      let args = [];
      return {
        bind(...a) { args = a; return this; },
        async run() { filas.push({ device_token: args[0], owner_user_id: args[1], label: args[2], approved_at: args[3], revoked_at: null }); return { success: true }; },
        async first() {
          if (!/household_devices/.test(sql)) return null;
          return filas.find((f) => f.device_token === args[0] && f.revoked_at === null) ?? null;
        },
      };
    },
  };
};

console.log("sesiones — tres cookies opacas (D-052, mc-25 impl. 6)\n");

// --- opacidad ---------------------------------------------------------------
const t = nuevoToken();
ok(t.length === 43, "el token son 43 caracteres (256 bits en base64url sin relleno)");
ok(/^[A-Za-z0-9_-]+$/.test(t), "solo caracteres base64url: sin +, / ni =");
ok(esTokenOpaco(t), "un token nuestro se reconoce como opaco");
ok(nuevoToken() !== nuevoToken(), "dos tokens seguidos son distintos");

// Lo que NO es un token nuestro. El caso que importa es el JWT: a ojo se parece,
// y una comprobación de "¿parece aleatorio?" lo dejaría pasar con el id del niño
// dentro.
const JWT = "eyJhbGciOiJIUzI1NiJ9.eyJjaGlsZF9pZCI6IjEyMyJ9.abcdefghijklmnopqrst";
ok(!esTokenOpaco(JWT), "un JWT NO pasa por token opaco (lleva puntos y otro largo)");
ok(!esTokenOpaco(btoa("child_id=123")), "un base64 con datos adentro no pasa");
ok(!esTokenOpaco(""), "la cadena vacía no pasa");
ok(!esTokenOpaco("a".repeat(42)), "42 caracteres no pasa");
ok(!esTokenOpaco("a".repeat(44)), "44 caracteres no pasa");

// --- atributos --------------------------------------------------------------
const c = armarCookie(COOKIE_ADULTO, t, { maxAge: VIDA_ADULTO_S });
for (const attr of ["HttpOnly", "Secure", "SameSite=Lax", "Path=/"]) {
  ok(c.includes(attr), `la cookie lleva ${attr}`);
}
ok(c.includes(`Max-Age=${VIDA_ADULTO_S}`), "mc_s dura 30 días");
ok(armarCookie(COOKIE_HOGAR, t, { maxAge: VIDA_HOGAR_S }).includes("Max-Age=34560000"), "mc_h dura 400 días (el techo de Chrome)");
ok(armarCookie(COOKIE_NINO, t, { maxAge: VIDA_NINO_S }).includes("Max-Age=43200"), "mc_k dura 12 horas");
ok(borrarCookie(COOKIE_ADULTO).includes("Max-Age=0"), "borrar es Max-Age=0");
ok(borrarCookie(COOKIE_ADULTO).includes("HttpOnly"), "y conserva los atributos, o el navegador no la reconoce como la misma");

// --- lectura de la cabecera -------------------------------------------------
const leidas = leerCookies(`${COOKIE_ADULTO}=${t}; otra=a=b=c; ${COOKIE_NINO}=xyz`);
ok(leidas[COOKIE_ADULTO] === t, "se lee mc_s de una cabecera con varias cookies");
ok(leidas.otra === "a=b=c", "una cookie ajena con '=' dentro no se parte mal");
ok(Object.keys(leerCookies(null)).length === 0, "sin cabecera devuelve vacío, no lanza");

// --- sesión de adulto -------------------------------------------------------
const kv = kvFalso();
const s = await abrirSesionAdulto(kv, { userId: "u1", creadaEn: 0, intent: "PADRE" });
ok(esTokenOpaco(s.token), "la sesión de adulto emite un token opaco");
ok(!s.cookie.includes("u1"), "el id del usuario NO viaja en la cookie");
ok((await leerSesionAdulto(kv, s.token)).userId === "u1", "la sesión se recupera desde KV");
ok((await leerSesionAdulto(kv, JWT)) === null, "un JWT no llega a tocar KV");
ok((await leerSesionAdulto(kv, undefined)) === null, "sin token devuelve null");
ok(kv.m.get(`s:${s.token}`).ttl === VIDA_ADULTO_S, "KV recibe el TTL de 30 días");
await cerrarSesionAdulto(kv, s.token);
ok((await leerSesionAdulto(kv, s.token)) === null, "cerrar sesión borra el valor de KV");

// --- sesión de niño: el caso de los dos hermanos ----------------------------
const k1 = await abrirSesionNino(kv, { childProfileId: "c1", parentUserId: "u1", creadaEn: 0 });
ok(!k1.cookie.includes("c1"), "el id del perfil del niño NO viaja en la cookie");
const k2 = await abrirSesionNino(kv, { childProfileId: "c2", parentUserId: "u1", creadaEn: 0 }, k1.token);
ok((await leerSesionNino(kv, k1.token)) === null, "cambiar de perfil BORRA la sesión del hermano anterior");
ok((await leerSesionNino(kv, k2.token)).childProfileId === "c2", "y deja abierta solo la nueva");
ok(kv.m.get(`k:${k2.token}`).ttl === VIDA_NINO_S, "la sesión de niño caduca en 12 h");

// --- dispositivo del hogar: D1, no KV (D-052) -------------------------------
const db = d1Falso();
const d = await marcarDispositivoDelHogar(db, "u1", "la tablet de la sala", 1000);
ok(db.filas.length === 1, "marcar el dispositivo escribe una fila en D1");
ok(db.filas[0].device_token === d.token, "la fila se indexa por el token de la cookie");
ok(!d.cookie.includes("u1"), "el dueño no viaja en la cookie del hogar");
ok((await leerDispositivoDelHogar(db, d.token)).ownerUserId === "u1", "el dispositivo se reconoce");
ok((await leerDispositivoDelHogar(db, nuevoToken())) === null, "un token que no existe no reconoce nada");
db.filas[0].revoked_at = 2000;
ok((await leerDispositivoDelHogar(db, d.token)) === null, "un dispositivo revocado deja de reconocerse");

// --- cerrar todo ------------------------------------------------------------
const cierres = cerrarTodo();
ok(cierres.length === 2, "cerrar sesión cierra la del adulto Y la del niño");
ok(cierres.some((x) => x.startsWith(`${COOKIE_ADULTO}=;`)), "borra mc_s");
ok(cierres.some((x) => x.startsWith(`${COOKIE_NINO}=;`)), "borra mc_k");
ok(!cierres.some((x) => x.startsWith(`${COOKIE_HOGAR}=;`)), "y NO borra mc_h: el dispositivo sigue siendo de la casa aunque el adulto salga");

console.log(fallos === 0 ? "\n✓ sesiones — todos los casos" : `\n✗ sesiones — ${fallos} caso(s) fallaron`);
process.exit(fallos === 0 ? 0 : 1);
