#!/usr/bin/env node
// Auditor determinista — el panel del padre nunca toca Analytics Engine (F8 #285)
//
// Hace cumplir: mc-32 riesgo #1, D-013, criterio de aceptación de #285 y del
// paraguas #277 («Ningún archivo del panel referencia el binding de Analytics
// Engine directamente»).
//
// Por qué existe. Los intentos crudos de un niño van a `math-challenge-attempts-ae`
// (Analytics Engine), agregados y sin camino de lectura individual — eso es lo
// que hace que el producto pueda aprender sin convertir a un niño en una fila
// consultable. El panel del padre lee SOLO D1: rollups y acumulados
// (`skill_state`, `child_streak`, `xp_totals`, `screen_time_daily_usage`…),
// nunca el detalle por intento. Un `env.ATTEMPTS_AE` en un archivo del panel
// es la puerta de atrás que convierte ese principio en decoración: no da un
// error, da un padre (o un empleado con acceso al código) mirando intento por
// intento lo que un niño hizo, y nadie lo nota leyendo la pantalla, que se ve
// igual.
//
// Qué mira. Todo archivo bajo la ruta del panel —las páginas
// `app/parent/**`, sus componentes `components/parent/**` y su capa de datos
// `lib/padre-*.ts`— buscando referencias a los bindings de Analytics Engine
// (`ATTEMPTS_AE`, `VITALS_AE`), al tipo `AnalyticsEngineDataset` o a
// `writeDataPoint`, sobre el código SIN comentarios (un comentario que diga
// «no uses ATTEMPTS_AE aquí» no es una violación).
//
// LO QUE NO PUEDE COMPROBAR: que el agregado de Analytics Engine no llegue al
// panel por otra vía (un endpoint intermedio que lo lea y que el panel llame
// por HTTP). Eso lo cubre la revisión del diff y la carta `privacidad`.

import { archivos, informar, sinComentarios, leer } from "./lib/repo.mjs";

const RUTAS_DEL_PANEL = [
  /^apps\/web\/src\/pages\/\[locale\]\/app\/parent\//,
  /^apps\/web\/src\/components\/parent\//,
  /^apps\/web\/src\/lib\/padre-[^/]+\.(ts|mjs)$/,
];

// Los dos bindings declarados en wrangler.jsonc, el tipo del API y su método.
// Un binding NUEVO de Analytics Engine no queda cubierto solo por esta lista —
// por eso el patrón genérico `_AE\b` va primero: cualquier env.<ALGO>_AE en la
// ruta del panel es sospechoso por construcción.
const PROHIBIDOS = [
  { patron: /\b[A-Z][A-Z0-9_]*_AE\b/, que: "un binding de Analytics Engine (`*_AE`)" },
  { patron: /\bAnalyticsEngineDataset\b/, que: "el tipo `AnalyticsEngineDataset`" },
  { patron: /\bwriteDataPoint\b/, que: "`writeDataPoint` (escritura al dataset)" },
];

const problemas = [];
let revisados = 0;

const candidatos = archivos(/\.(astro|ts|mjs)$/).filter((f) =>
  RUTAS_DEL_PANEL.some((r) => r.test(f)),
);

for (const archivo of candidatos) {
  const texto = leer(archivo);
  if (texto === null) continue;
  // Los .astro no pasan por sinComentarios (no son JS); pero el frontmatter sí
  // es TS. Para los dos formatos vale la misma defensa: buscar los patrones en
  // el texto con los comentarios de línea y de bloque quitados — en HTML el
  // `//` no abre comentario, así que para .astro se revisa el frontmatter
  // completo (entre las dos cercas `---`), que es donde vive el código.
  let codigo;
  if (archivo.endsWith(".astro")) {
    const cercas = texto.match(/^---\n([\s\S]*?)\n---/);
    codigo = cercas ? sinComentarios(cercas[1]) : "";
  } else {
    codigo = sinComentarios(texto);
  }
  revisados++;
  for (const { patron, que } of PROHIBIDOS) {
    const m = codigo.match(patron);
    if (m) {
      problemas.push(
        `${archivo}: la ruta del panel referencia ${que} — \`${m[0]}\`. El panel solo lee D1 — ` +
          "el detalle por intento vive en Analytics Engine precisamente para que " +
          "ninguna superficie lo pueda consultar (mc-32 riesgo #1, D-013, #285).",
      );
    }
  }
}

informar({
  nombre: "panel-sin-detalle-de-intento",
  problemas,
  revisados,
  cita: "mc-32 riesgo #1, D-013, #285, #277",
  resumen: `ningún archivo de la ruta del panel toca Analytics Engine (${revisados} archivos revisados)`,
  porQueBloquea:
    "mc-32 riesgo #1: los intentos crudos no se consultan, se agregan. Un binding " +
    "de Analytics Engine en la superficie del padre abre la consulta individual " +
    "que el diseño de datos entero existe para impedir (D-013).",
  noComprueba: [
    "que el dato agregado no llegue por un endpoint intermedio — eso es revisión de diff y carta `privacidad`.",
  ],
});
