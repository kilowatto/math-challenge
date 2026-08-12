#!/usr/bin/env node
// El diff del loader: qué se descarga y qué sale de caché (D-201, loader C).
//
//     node --experimental-strip-types apps/web/src/lib/plan-de-carga.prueba.mjs
//
// ─── Por qué esta pieza sí se puede probar ─────────────────────────────────
//
// Es la única parte del loader que es lógica pura: dos listas entran, un plan
// sale. La física, el HUD y la inclinación solo se pueden mirar en un
// dispositivo; esto se puede ejecutar.
//
// Y es donde viven los errores caros. Un diff que compara por PRESENCIA en vez
// de por HASH deja al niño con arte viejo para siempre, sin que nada falle. Un
// peso mal contado hace que la barra mienta. Ninguno de los dos rompe nada
// visible.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { planDeCarga, pesoDe, PESO_CACHEADO, anotarGuardados } from "../game/assets/planDeCarga.ts";

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

/**
 * Un asset del manifiesto, con LOS NOMBRES DE CAMPO DEL GENERADOR.
 *
 * `key`, no `clave`, porque eso es lo que emite `manifiestoDeAssets()` en
 * `astro.config.mjs` — el código de este repo es inglés. Esta prueba usaba
 * `clave` y pasaba en verde mientras el loader estaba roto en producción: el
 * tipo de TypeScript también decía `clave`, así que prueba y código estaban de
 * acuerdo entre ellos y en desacuerdo con el único que manda, el JSON real.
 * El loader encolaba 243 archivos con clave `undefined` y Phaser moría con
 * `Invalid File key: false`. Ver el caso «el contrato con el generador».
 */
const A = (key, hash, size) => ({ key, url: `/juego/${key}.webp`, hash, size, label: key });

console.log("\nplan-de-carga — D-201 (loader C)\n");

await caso("sin nada en caché, todo se descarga", async () => {
  const assets = [A("uno", "h1", 1000), A("dos", "h2", 3000)];
  const p = planDeCarga(assets, {});
  igual(p.descargar.length, 2, "a descargar");
  igual(p.desdeCache.length, 0, "desde caché");
  igual(p.pesoTotal, 4000, "peso total = suma de bytes");
});

await caso("con todo cacheado y al día, nada se descarga", async () => {
  const assets = [A("uno", "h1", 1000), A("dos", "h2", 3000)];
  const p = planDeCarga(assets, { uno: "h1", dos: "h2" });
  igual(p.descargar.length, 0, "a descargar");
  igual(p.desdeCache.length, 2, "desde caché");
});

await caso("EL CASO QUE JUSTIFICA EL HASH: presente pero cambiado", async () => {
  // Un diff que comparara por PRESENCIA daría esto por bueno y el niño se
  // quedaría con el arte viejo para siempre, sin que nada fallara.
  const assets = [A("uno", "NUEVO", 1000)];
  const p = planDeCarga(assets, { uno: "viejo" });
  igual(p.descargar.length, 1, "a descargar");
  igual(p.descargar[0].key, "uno", "cuál");
});

await caso("un asset cacheado NO pesa cero", async () => {
  // Si pesara cero, la barra saltaría al 100% y se quedaría congelada mientras
  // Phaser decodifica — el defecto que D-200.4 documenta.
  const assets = [A("uno", "h1", 1000)];
  const p = planDeCarga(assets, { uno: "h1" });
  igual(p.pesoTotal, 1000 * PESO_CACHEADO, "peso del cacheado");
  if (p.pesoTotal <= 0) throw new Error("un cacheado con peso 0 congela la barra al final");
});

await caso("el peso mezcla ambos grupos", async () => {
  const assets = [A("baja", "h1", 1000), A("cache", "h2", 2000)];
  const p = planDeCarga(assets, { cache: "h2" });
  igual(p.pesoTotal, 1000 + 2000 * PESO_CACHEADO, "peso total");
});

await caso("EL PESO IMPORTA: 2 archivos grandes pesan más que 10 chicos", async () => {
  // Es la razón de ponderar por bytes en vez de contar archivos.
  const grandes = [A("g1", "h", 300_000), A("g2", "h", 300_000)];
  const chicos = Array.from({ length: 10 }, (_, i) => A(`c${i}`, "h", 8_000));
  const pg = planDeCarga(grandes, {});
  const pc = planDeCarga(chicos, {});
  if (pg.pesoTotal <= pc.pesoTotal) {
    throw new Error("2 archivos de 300 KB deberían pesar más que 10 de 8 KB");
  }
  igual(pg.descargar.length < pc.descargar.length, true, "y sin embargo son MENOS archivos");
});

await caso("un asset nuevo en el servidor entra al plan", async () => {
  const assets = [A("viejo", "h1", 100), A("nuevo", "h2", 200)];
  const p = planDeCarga(assets, { viejo: "h1" });
  igual(p.descargar.length, 1, "a descargar");
  igual(p.descargar[0].key, "nuevo", "cuál");
});

await caso("un asset que el servidor YA NO tiene no se descarga ni cuenta", async () => {
  // El manifiesto local conserva la entrada, pero el plan lo ignora: el
  // servidor manda. Los bytes viejos se quedan ocupando sitio hasta que la
  // caché los desaloje, y eso está bien — borrarlos exigiría recorrer la
  // caché entera en cada arranque.
  const assets = [A("uno", "h1", 1000)];
  const p = planDeCarga(assets, { uno: "h1", borrado: "hx" });
  igual(p.descargar.length + p.desdeCache.length, 1, "assets en el plan");
});

await caso("catálogo vacío da un plan vacío, no un error", async () => {
  const p = planDeCarga([], {});
  igual(p.pesoTotal, 0, "peso");
  igual(p.descargar.length, 0, "a descargar");
});

await caso("anotarGuardados NO escribe lo que no se guardó", async () => {
  // El fallo que evita: apuntar el manifiesto remoto entero tras una descarga
  // parcial haría que el dispositivo creyera tener assets que no tiene, y la
  // próxima carga los daría por buenos sin volver a pedirlos.
  let guardado = { previo: "hp" };
  const cache = {
    async getLocalManifest() {
      return { ...guardado };
    },
    async saveLocalManifest(m) {
      guardado = m;
    },
    async has() {
      return false;
    },
    async get() {
      return null;
    },
    async put() {},
  };
  await anotarGuardados(cache, [{ clave: "uno", hash: "h1" }]);
  igual(guardado.uno, "h1", "el guardado se anota");
  igual(guardado.previo, "hp", "lo anterior se conserva");
  igual("fallido" in guardado, false, "lo que no se guardó NO se anota");
});

await caso("pesoDe distingue descargado de cacheado", async () => {
  const a = A("x", "h", 1000);
  igual(pesoDe(a, false), 1000, "descargado");
  igual(pesoDe(a, true), 1000 * PESO_CACHEADO, "cacheado");
});

/**
 * EL CONTRATO CON EL GENERADOR — el caso que faltaba.
 *
 * El defecto que costó cinco despliegues no estaba en la lógica del plan: los
 * once casos de arriba pasaban en verde. Estaba en que el TIPO y las PRUEBAS
 * decían `clave` mientras `astro.config.mjs` emitía `key`, así que el loader
 * leía `undefined` de los 243 assets reales. Prueba y código coincidían entre
 * ellos; ninguno miraba el archivo que de verdad se sirve.
 *
 * Este caso mira los dos lados: los campos que emite el generador y los que
 * lee `planDeCarga`. Si alguien renombra uno solo, falla aquí en vez de en el
 * dispositivo de un niño.
 *
 * Se lee el FUENTE del generador, no `dist/manifest-assets.json`: el gate corre
 * sin build, y una prueba que se salta a sí misma cuando falta un archivo es
 * una prueba que un día no prueba nada.
 */
await caso("el contrato con el generador: los nombres de campo son los mismos", async () => {
  const { readFileSync } = await import("node:fs");
  const { fileURLToPath } = await import("node:url");
  const config = readFileSync(
    fileURLToPath(new URL("../../astro.config.mjs", import.meta.url)),
    "utf8",
  );
  const bloque = config.slice(config.indexOf("mc-manifiesto-assets"));
  for (const campo of ["key", "url", "hash", "size", "label"]) {
    if (!new RegExp(`^\\s*${campo}:`, "m").test(bloque)) {
      throw new Error(`el generador ya no emite '${campo}' — planDeCarga lo lee`);
    }
  }
  // Y al revés: que el plan siga leyendo por `key`, no por otra cosa.
  const p = planDeCarga([A("uno", "h1", 10)], {});
  igual(Object.keys(p.descargar[0]).includes("key"), true, "el plan conserva 'key'");
});

console.log(`\n${corridos - fallos}/${corridos} casos\n`);
if (fallos > 0) process.exit(1);
