// alcance.mjs — de qué archivos depende cada auditor, para que el gancho de
// pre-commit solo corra los que el diff de verdad puede afectar.
//
// ─── Por qué existe ────────────────────────────────────────────────────────
//
// `node audits/run.mjs` corre 114 auditores en cada commit, cada uno un
// proceso Node separado (arranque de ~0.5s cada uno) — ~62s por commit,
// medido, sin importar si el commit tocó una coma en `docs/decisions.md` o
// reescribió la mitad del motor. El dueño lo señaló como fricción real
// después de que el gancho por fin quedara activo (D-032, 2026-08-12).
//
// ─── Por qué NO es una lista aparte que alguien tiene que mantener ─────────
//
// Para los auditores que usan `archivos(patrón)` de `lib/repo.mjs` — la
// mayoría, 66 de 114 — el alcance se EXTRAE del propio código fuente del
// auditor, en cada corrida, leyendo su llamada real a `archivos(...)`
// (inline o vía una constante `const X = /.../` definida en el mismo
// archivo). Si el patrón de un auditor cambia, el alcance cambia solo — no
// hay una segunda lista que se pueda desincronizar de la primera, que es
// exactamente el modo de falla que este mismo proyecto ya se quemó
// corrigiendo tres veces (`manifiesto-assets.mjs`, `pin-arte-completo.mjs`,
// el propio `run.mjs`).
//
// Para los ~30 que NO usan `archivos()` (leen archivos específicos a mano —
// `wrangler.jsonc`, una migración, un puñado de endpoints de una sola
// feature) el alcance SÍ es una lista a mano, `ALCANCE_MANUAL` abajo — no
// hay forma honesta de extraerlo del código sin ejecutar JavaScript
// arbitrario. Se limita a los casos donde la lista de archivos es corta y
// cerrada — un auditor de una sola feature, no un escaneo del repo.
//
// ─── La regla de oro: en la duda, corre siempre ────────────────────────────
//
// Un auditor que se salta cuando no debía es peor que 0.5s perdidos: es
// exactamente el modo de falla silencioso que el resto de este archivo de
// auditores existe para atrapar. Todo auditor sin una entrada aquí, o cuya
// extracción no encuentra nada, corre SIEMPRE — nunca se asume alcance
// estrecho por omisión.

import { readFileSync } from "node:fs";
import { RAIZ } from "./repo.mjs";

/**
 * Auditores sin `archivos()` cuyo conjunto de archivos es corto, cerrado, y
 * se pudo determinar leyendo el código con confianza — una sola feature, no
 * un escaneo amplio. Todo lo demás (perf/build-wide, secretos, i18n
 * transversal, o cualquier cosa incierta) se deja FUERA de este mapa a
 * propósito: ausente aquí significa "corre siempre".
 */
const ALCANCE_MANUAL = {
  // Estos siete leen `apps/web/dist` (el sitio YA construido) — su alcance
  // real es "cambió algo que afecta lo que Astro construye", que es
  // `apps/web/` entero (código y config), no un puñado de archivos. Es la
  // categoría que más importa acertar: `axe-a11y` por sí solo tarda ~40s de
  // los ~62s de la corrida completa — mucho más que los ~0.5s de arranque de
  // Node que paga cada uno de los otros 113.
  "axe-a11y": [/^apps\/web\//],
  "bundle-budget": [/^apps\/web\//],
  "contrast": [/^apps\/web\//],
  "jsonld-valid": [/^apps\/web\//],
  "sitemap-completo": [/^apps\/web\//],
  "brand-image": [/^apps\/web\//],
  "precache-budget": [/^apps\/web\//],
  "touch-targets": [/^apps\/web\//],
  "ipad-usabilidad": [/^apps\/web\//],
  "adult-club-schema": [/^apps\/web\/src\/pages\/api\/clubes\//, /^migrations\/.*club/i],
  "banco-adulto-i18n": [/banco-adulto/, /^apps\/web\/src\/i18n\//, /^apps\/web\/src\/pages\/api\/jugar\.ts$/],
  "banco-logi-i18n": [/banco-logi/, /^packages\/motor\/src\/item\.ts$/, /^apps\/web\/src\/i18n\//],
  "banco-primaria-i18n": [/banco-primaria/, /^migrations\/0016_/, /^apps\/web\/src\/i18n\//],
  "cabeceras-ssr": [/^apps\/web\/public\/_headers$/, /^apps\/web\/src\/middleware\.ts$/, /cabeceras-seguridad/],
  "cf-prefix": [/^wrangler\.jsonc$/, /^docs\/infrastructure\.md$/],
  "cierre-runtime": [/^apps\/web\/src\/lib\/banco-cierre-d1\.ts$/, /^apps\/web\/src\/pages\/api\/cierre\.ts$/],
  "club-result-isolated": [/^apps\/web\/src\/lib\/club-retos\.ts$/, /^apps\/web\/src\/pages\/api\/clubes\//],
  "club-sin-chat": [/^migrations\/0022_clubs_adultos\.sql$/, /^apps\/web\/src\/pages\/api\/clubes\//],
  "componente-sin-importar": [/^apps\/web\/src\/components\//],
  "corpus-integridad": [/^apps\/web\/src\/lib\/corpus-verificado\.json$/, /^docs\/research\//],
  "corpus-manifiesto": [/^apps\/web\/src\/lib\/corpus-verificado\.json$/, /^docs\/research\//],
  "distractores-explicables": [/^packages\/motor\/src\/banco-kinder\.ts$/],
  "familia-nunca-mezcla": [/^apps\/web\/src\/pages\/api\/familia/, /^migrations\/002[34]_/],
  "grupo-visibilidad-minima": [/^apps\/web\/src\/lib\/classroom-do\.ts$/, /^apps\/web\/src\/lib\/grupo-tabla\.ts$/],
  "hojas-de-estilo": [/^apps\/web\/src\/styles\//],
  "kinder-enunciados-i18n": [/^packages\/motor\/src\/banco-kinder\.ts$/, /^apps\/web\/src\/i18n\//],
  "larry-tope-gasto": [/^apps\/web\/src\/lib\/ratelimiter\.ts$/, /^apps\/web\/src\/pages\/api\/larry\.ts$/, /^packages\/tutor\/src\/gasto\.ts$/],
  "legal-checklist": [/^docs\/legal-checklist\.md$/],
  "locales-complete": [/^wrangler\.jsonc$/, /^migrations\//, /^apps\/web\/src\/i18n\//],
  "mapa-escena": [/^apps\/web\/src\/components\/mapa\//, /^apps\/web\/src\/styles\/mapa\.css$/],
  "migration-safety": [/^migrations\//, /^docs\/infrastructure\.md$/],
  "mision-resumen-sin-ceros": [/^packages\/motor\/src\/misiones\.ts$/, /^apps\/web\/src\/components\/misiones\//],
  "nota-solo-por-velocidad": [/^apps\/web\/src\/lib\/nota-anti-trampa\.ts$/],
  "notas-diagnostico-completas": [/^migrations\/0018_child_diagnostic_notes\.sql$/],
  "offline-ruta-real": [/^apps\/web\/src\/components\/reto\/Pantalla\.astro$/, /^apps\/web\/src\/lib\/cola-offline\.ts$/],
  "opciones-contestables": [/^packages\/motor\/src\/banco-kinder\.ts$/, /^apps\/web\/src\/components\/reto\/Pantalla\.astro$/, /^apps\/ingest\/src\/index\.ts$/],
  "piso-seis-retos": [/^packages\/motor\/src\/banco-/, /^packages\/motor\/src\/item\.ts$/],
  "prenda-aceptacion-adulto": [/^apps\/web\/src\/pages\/api\/clubes\/prenda\//],
  "prenda-falla-cerrada": [/^apps\/web\/src\/pages\/api\/larry\/moderar\.ts$/],
  "prenda-sin-perdedor": [/^apps\/web\/src\/pages\/api\/clubes\/prenda\//, /^apps\/web\/src\/pages\/api\/larry\/moderar\.ts$/, /^migrations\/0022_clubs_adultos\.sql$/],
  "push-nunca-al-nino": [/^apps\/web\/src\/lib\/push-/, /^apps\/web\/src\/pages\/api\/push\.ts$/, /^migrations\/0014_push_recordatorio_padre\.sql$/],
  "racha-salones-minima": [/^apps\/web\/src\/lib\/grupo-roster\.ts$/],
  "reporte-sin-comparacion": [/^packages\/motor\/src\/reportes\.ts$/],
  "reto-opciones-moviles": [/^apps\/web\/src\/components\/reto\/Pantalla\.astro$/, /^apps\/web\/src\/styles\/(mapa|reto)\.css$/],
};

/**
 * Extrae el/los patrón(es) de `archivos(...)` del código fuente de un
 * auditor — inline (`archivos(/regex/flags`) o vía una constante definida
 * en el mismo archivo (`archivos(NOMBRE` + `const NOMBRE = /regex/flags`).
 * `eval` es seguro aquí: el "input" es el propio código fuente confiable
 * del repo, nunca un dato externo.
 */
function extraerDeArchivos(src) {
  const patrones = [];

  const inline = /archivos\(\s*(\/(?:\\.|[^/\\\n])+\/[a-z]*)/g;
  let m;
  while ((m = inline.exec(src))) {
    try {
      const r = eval(m[1]);
      if (r instanceof RegExp) patrones.push(r);
    } catch {
      // Patrón no evaluable como literal simple — se ignora, no se adivina.
    }
  }

  const viaConst = /archivos\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*[,)]/g;
  const nombres = new Set();
  while ((m = viaConst.exec(src))) nombres.add(m[1]);

  for (const nombre of nombres) {
    const def = new RegExp(`const\\s+${nombre}\\s*=\\s*(\\/(?:\\\\.|[^/\\\\\\n])+\\/[a-z]*)`, "m");
    const dm = def.exec(src);
    if (dm) {
      try {
        const r = eval(dm[1]);
        if (r instanceof RegExp) patrones.push(r);
      } catch {
        // Igual: sin adivinar.
      }
    }
  }

  return patrones;
}

/**
 * El alcance de un auditor: un arreglo de patrones (`RegExp` o string de
 * prefijo), o `null` si debe correr siempre (sin alcance determinable con
 * confianza, o deliberadamente transversal).
 */
export function alcanceDe(nombreAuditor) {
  let src;
  try {
    src = readFileSync(`${RAIZ}audits/${nombreAuditor}.mjs`, "utf8");
  } catch {
    return null; // Sin poder leer el archivo, correr siempre es lo seguro.
  }

  const extraido = extraerDeArchivos(src);
  if (extraido.length > 0) return extraido;

  return ALCANCE_MANUAL[nombreAuditor] ?? null;
}

/** ¿Alguno de los archivos cambiados cae dentro del alcance? */
export function tocaAlcance(alcance, archivosCambiados) {
  if (alcance === null) return true; // Sin alcance = siempre corre.
  return archivosCambiados.some((f) => alcance.some((p) => p.test(f)));
}
