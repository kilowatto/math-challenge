#!/usr/bin/env node
// `GET /api/historia-datos`, ejecutado de verdad (D-201, fusión de las dos
// instancias de Phaser).
//
//     node --experimental-strip-types apps/web/src/lib/historia-datos.prueba.mjs
//
// ─── Por qué existe ────────────────────────────────────────────────────────
//
// Este endpoint es lo que permite entrar al mapa SIN recargar la página. Al
// sacar esos datos del frontmatter de `kids/mapa.astro` y ponerlos en una ruta
// propia, hay tres cosas que se pueden perder sin que nada se vea roto:
//
//  1. **La puerta.** `kids/mapa.astro` redirige a la rejilla sin sesión de
//     niño. Un endpoint que devuelva el árbol sin comprobar `mc_k` expone el
//     progreso de un menor a cualquiera con la URL.
//  2. **La frontera de banda.** Modo Historia en Phaser es de PRIMARIA en
//     adelante (D-184); KINDER tiene otra pantalla. Servírselo a KINDER no
//     revienta: le da un mapa que no le toca.
//  3. **El fallo abierto de `leerModelo`.** Devuelve `[]` cuando no puede leer
//     el progreso, y eso significa «un mapa entero por visitar». Si el
//     endpoint se cayera en vez de servir el árbol vacío, el juego se negaría
//     a arrancar por no poder leer un dato que es opcional por diseño.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { GET } from "../pages/api/historia-datos.ts";

const TOKEN = "k".repeat(43); // FORMA_TOKEN: 43 caracteres base64url

/** Un D1 de mentira: solo tiene que devolver la fila del perfil. */
function baseCon(perfil) {
  return {
    prepare() {
      return {
        bind() {
          return this;
        },
        async first() {
          return perfil;
        },
        async all() {
          return { results: [] };
        },
        async run() {},
      };
    },
  };
}

const kvCon = (sesion) => ({
  async get(llave) {
    return llave === `k:${TOKEN}` && sesion ? JSON.stringify(sesion) : null;
  },
});

function contexto({ perfil, sesion = { childProfileId: "ana", parentUserId: "p1", creadaEn: 0 }, sinBindings = false }) {
  if (sinBindings) return { runtime: { env: {} } };
  return { runtime: { env: { DB: baseCon(perfil), SESSION_KV: kvCon(sesion) } } };
}

const peticion = (token = TOKEN) =>
  new Request("https://math.kilowatto.com/api/historia-datos", {
    headers: token ? { cookie: `mc_k=${token}` } : {},
  });

let fallos = 0;
let corridos = 0;

async function caso(nombre, fn) {
  corridos++;
  try {
    await fn();
    console.log(`  ✓ ${nombre}`);
  } catch (err) {
    fallos++;
    console.error(`  ✗ ${nombre}\n      ${String(err).split("\n")[0]}`);
  }
}

function igual(real, esperado, que) {
  if (real !== esperado) throw new Error(`${que}: esperaba ${JSON.stringify(esperado)}, fue ${JSON.stringify(real)}`);
}

console.log("\nhistoria-datos — D-201\n");

const PRIMARIA = { theme_band: "PRIMARIA", locale: "es-MX" };

await caso("sin cookie de niño: 403, y ni un dato del árbol", async () => {
  const res = await GET({ request: peticion(null), locals: contexto({ perfil: PRIMARIA }) });
  igual(res.status, 403, "estado");
  const cuerpo = await res.json();
  igual(cuerpo.error, "sin_sesion", "error");
  if ("arbol" in cuerpo) throw new Error("devolvió el árbol sin sesión");
});

await caso("una cookie que no está en KV tampoco entra", async () => {
  const res = await GET({ request: peticion("x".repeat(43)), locals: contexto({ perfil: PRIMARIA }) });
  igual(res.status, 403, "estado");
});

await caso("sin bindings: 503, nunca un árbol inventado", async () => {
  const res = await GET({ request: peticion(), locals: contexto({ perfil: PRIMARIA, sinBindings: true }) });
  igual(res.status, 503, "estado");
});

await caso("KINDER no recibe Modo Historia (D-184)", async () => {
  const res = await GET({
    request: peticion(),
    locals: contexto({ perfil: { theme_band: "KINDER", locale: "es-MX" } }),
  });
  igual(res.status, 409, "estado");
  igual((await res.json()).error, "sin_historia", "error");
});

await caso("una banda ilegible cae a KINDER, nunca a PRIMARIA", async () => {
  // Ante cualquier duda gana la banda más protegida. Si esto se invirtiera, un
  // perfil sin fila legible recibiría el mapa de una banda que no es la suya.
  const res = await GET({ request: peticion(), locals: contexto({ perfil: null }) });
  igual(res.status, 409, "estado");
});

await caso("PRIMARIA recibe el árbol, el modo y los rótulos", async () => {
  const res = await GET({ request: peticion(), locals: contexto({ perfil: PRIMARIA }) });
  igual(res.status, 200, "estado");
  const c = await res.json();
  igual(c.ok, true, "ok");
  igual(c.modo, "camino", "modo (D-190: camino en PRIMARIA)");
  igual(c.locale, "es-MX", "locale del perfil");
  igual(c.puedeElegirNivel, true, "puedeElegirNivel");
  if (!c.arbol || !Array.isArray(c.arbol.grupos)) throw new Error("sin árbol");
  if (!c.rotulosReto?.bien) throw new Error("sin rótulos de reto");
  if (!c.rotulos?.jugar) throw new Error("sin rótulos de mapa");
});

await caso("SECUNDARIA recibe modo «arbol», no «camino»", async () => {
  const res = await GET({
    request: peticion(),
    locals: contexto({ perfil: { theme_band: "SECUNDARIA", locale: "en" } }),
  });
  igual((await res.json()).modo, "arbol", "modo");
});

await caso("los rótulos salen en el idioma del PERFIL, no en inglés por defecto", async () => {
  const res = await GET({ request: peticion(), locals: contexto({ perfil: PRIMARIA }) });
  const c = await res.json();
  const enRes = await GET({
    request: peticion(),
    locals: contexto({ perfil: { theme_band: "PRIMARIA", locale: "en" } }),
  });
  const cEn = await enRes.json();
  if (c.rotulosReto.bien === cEn.rotulosReto.bien) {
    throw new Error(`es-MX y en devolvieron el MISMO texto («${c.rotulosReto.bien}») — el locale no se está usando`);
  }
});

await caso("sin LEARNER_DO el árbol viene vacío, pero la ruta responde 200", async () => {
  // `leerModelo` falla ABIERTO por diseño. El mapa se enseña vacío; no se
  // niega el juego por no poder leer un progreso que puede no existir.
  const res = await GET({ request: peticion(), locals: contexto({ perfil: PRIMARIA }) });
  igual(res.status, 200, "estado");
  igual((await res.json()).arbol.grupos.length, 0, "grupos con progreso vacío");
});

await caso("la respuesta no se puede cachear y varía por cookie", async () => {
  const res = await GET({ request: peticion(), locals: contexto({ perfil: PRIMARIA }) });
  igual(res.headers.get("cache-control"), "no-store, private", "cache-control");
  igual(res.headers.get("vary"), "cookie", "vary");
});

console.log(`\n${corridos - fallos}/${corridos} casos\n`);
if (fallos > 0) process.exit(1);
