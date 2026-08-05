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
  marcarCorteDeSesiones,
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
// ─── El id es largo A PROPÓSITO, y no es cosmético ────────────────────────
//
// Era `"u1"`. Dos caracteres, contra un token de 43 caracteres de base64url
// sacados al azar: la probabilidad de que `"u1"` aparezca dentro por pura
// casualidad es de 42 posiciones × (1/64)² ≈ **1%**, así que esta prueba fallaba
// una de cada cien corridas y parecía un intermitente de infraestructura.
//
// No era intermitente: era una aserción demasiado débil para ser fiable. Con un
// id largo la colisión por azar es imposible **y la comprobación dice más** —
// que no se filtró ni un trozo del identificador, no que no aparecieran dos
// letras.
const ID_ADULTO = "usuario-de-prueba-9f3c1b";
const s = await abrirSesionAdulto(kv, { userId: ID_ADULTO, creadaEn: 0, intent: "PADRE" });
ok(esTokenOpaco(s.token), "la sesión de adulto emite un token opaco");
ok(s.cookies.every((c) => !c.includes(ID_ADULTO)), "el id del usuario NO viaja en ninguna de las dos cookies");

// --- La pista de sesión, `mc_p` (#339) --------------------------------------
//
// Es la única cookie del archivo sin `HttpOnly`, y eso hay que comprobarlo en
// las dos direcciones: que efectivamente se pueda leer desde un script —o el
// arreglo de #339 no funciona— y que no lleve nada dentro que valga robar.
//
// Se comprueba también que salga JUNTO a `mc_s` en la misma llamada. Con dos
// valores sueltos, una puerta de entrada nueva pondría la sesión y olvidaría la
// pista, y el síntoma sería que solo esa puerta sigue pidiendo la contraseña a
// quien ya entró — un bug por locale o por método que nadie reproduce.
const pista = s.cookies.find((c) => c.startsWith("mc_p="));
const sesionCookie = s.cookies.find((c) => c.startsWith("mc_s="));
ok(s.cookies.length === 2, "entrar emite DOS cookies: la sesión y su pista");
ok(!!sesionCookie && !!pista, "y son exactamente mc_s y mc_p");
ok(sesionCookie.includes("HttpOnly"), "mc_s sigue siendo HttpOnly");
ok(!pista.includes("HttpOnly"), "mc_p NO es HttpOnly — un script tiene que poder leerla");
ok(pista.includes("Secure") && pista.includes("SameSite=Lax"), "mc_p conserva Secure y SameSite");
ok(/^mc_p=1;/.test(pista), "mc_p vale exactamente 1: no es un token ni identifica a nadie");
ok(!pista.includes(s.token), "el token de sesión NO viaja dentro de la pista");
ok(!pista.includes(ID_ADULTO), "ni el id del usuario");
ok((await leerSesionAdulto(kv, s.token)).userId === ID_ADULTO, "la sesión se recupera desde KV");
ok((await leerSesionAdulto(kv, JWT)) === null, "un JWT no llega a tocar KV");
ok((await leerSesionAdulto(kv, undefined)) === null, "sin token devuelve null");
ok(kv.m.get(`s:${s.token}`).ttl === VIDA_ADULTO_S, "KV recibe el TTL de 30 días");
await cerrarSesionAdulto(kv, s.token);
ok((await leerSesionAdulto(kv, s.token)) === null, "cerrar sesión borra el valor de KV");

// --- sesión de niño: el caso de los dos hermanos ----------------------------
// Mismo defecto que arriba: `"c1"` cabía por azar en un token aleatorio.
const ID_NINO = "perfil-de-prueba-4a7e02";
const k1 = await abrirSesionNino(kv, { childProfileId: ID_NINO, parentUserId: ID_ADULTO, creadaEn: 0 });
ok(!k1.cookie.includes(ID_NINO), "el id del perfil del niño NO viaja en la cookie");
const k2 = await abrirSesionNino(kv, { childProfileId: "c2", parentUserId: "u1", creadaEn: 0 }, k1.token);
ok((await leerSesionNino(kv, k1.token)) === null, "cambiar de perfil BORRA la sesión del hermano anterior");
ok((await leerSesionNino(kv, k2.token)).childProfileId === "c2", "y deja abierta solo la nueva");
ok(kv.m.get(`k:${k2.token}`).ttl === VIDA_NINO_S, "la sesión de niño caduca en 12 h");

// --- dispositivo del hogar: D1, no KV (D-052) -------------------------------
const db = d1Falso();
const d = await marcarDispositivoDelHogar(db, ID_ADULTO, "la tablet de la sala", 1000);
ok(db.filas.length === 1, "marcar el dispositivo escribe una fila en D1");
ok(db.filas[0].device_token === d.token, "la fila se indexa por el token de la cookie");
ok(!d.cookie.includes(ID_ADULTO), "el dueño no viaja en la cookie del hogar");
ok((await leerDispositivoDelHogar(db, d.token)).ownerUserId === ID_ADULTO, "el dispositivo se reconoce");
ok((await leerDispositivoDelHogar(db, nuevoToken())) === null, "un token que no existe no reconoce nada");
db.filas[0].revoked_at = 2000;
ok((await leerDispositivoDelHogar(db, d.token)) === null, "un dispositivo revocado deja de reconocerse");

// --- cerrar todo ------------------------------------------------------------
const cierres = cerrarTodo();
ok(cierres.length === 3, "cerrar sesión cierra la del adulto, su pista Y la del niño");
ok(cierres.some((x) => x.startsWith(`${COOKIE_ADULTO}=;`)), "borra mc_s");
// La pista tiene que morir con la sesión. Si sobrevive, quien cerró sesión
// queda con `mc_p=1` en el navegador y el script de #339 lo redirige a la casa
// una y otra vez — que rebota a `/entrar/`, que vuelve a redirigir. Un bucle,
// y encima solo para quien acaba de salir a propósito.
ok(cierres.some((x) => x.startsWith("mc_p=;")), "borra mc_p, o cerrar sesión deja un bucle de redirección");
ok(cierres.some((x) => x.startsWith(`${COOKIE_NINO}=;`)), "borra mc_k");
ok(!cierres.some((x) => x.startsWith(`${COOKIE_HOGAR}=;`)), "y NO borra mc_h: el dispositivo sigue siendo de la casa aunque el adulto salga");

// --- el corte de sesiones (#313) ---------------------------------------------
// Cambiar la contraseña cierra las OTRAS sesiones del adulto. KV no permite
// listar llaves, así que no se borran una a una: se deja una marca por usuario
// y la lectura rechaza todo lo abierto antes de ella.
{
  const kv2 = kvFalso();
  const ahora = 1_000_000;
  const vieja = await abrirSesionAdulto(kv2, { userId: "u-corte", creadaEn: ahora - 3600, intent: null });
  const delMismoSegundo = await abrirSesionAdulto(kv2, { userId: "u-corte", creadaEn: ahora, intent: null });
  const deOtro = await abrirSesionAdulto(kv2, { userId: "u-ajeno", creadaEn: ahora - 3600, intent: null });

  ok((await leerSesionAdulto(kv2, vieja.token)) !== null, "antes del corte, la sesión vieja abre");

  await marcarCorteDeSesiones(kv2, "u-corte", ahora);

  ok((await leerSesionAdulto(kv2, vieja.token)) === null, "tras el corte, la sesión abierta ANTES ya no abre");
  ok((await leerSesionAdulto(kv2, delMismoSegundo.token)) !== null,
    "la sesión abierta EN el segundo del corte sobrevive (la comparación es estricta)");
  ok((await leerSesionAdulto(kv2, deOtro.token)) !== null, "el corte de un adulto no toca las sesiones de otro");
  ok(kv2.m.get("corte:u-corte").ttl === VIDA_ADULTO_S,
    "la marca vive 30 días: la vida de la sesión más vieja que invalida");
}

console.log(fallos === 0 ? "\n✓ sesiones — todos los casos" : `\n✗ sesiones — ${fallos} caso(s) fallaron`);
process.exit(fallos === 0 ? 0 : 1);
