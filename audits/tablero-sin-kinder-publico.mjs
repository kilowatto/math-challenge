#!/usr/bin/env node
// Auditor determinista — el tablero de KINDER no existe para el niño
//
// Hace cumplir: **#247** («el tablero de la banda KINDER **nunca** se
// renderiza dentro de `/app/kids/**`; solo existe como widget del panel del
// padre») y **D-081** (KINDER: opt-in del padre, default apagado, posición en
// tercios). `mc-10` mide que la presión de rendimiento empeora el desempeño en
// matemáticas, y `mc-18` implicación 7: jamás el último lugar.
//
// ─── Qué vigila, con la segunda fuente escrita A MANO (D-070) ───────────────
//
//  1. **El desvío existe.** La pantalla del tablero para el niño
//     (`app/tablero/nino.astro`) lleva el guarda que desvía KINDER a jugar,
//     escrito aquí de nuevo a mano: si alguien lo borra, el tablero de un
//     niño de cinco años se renderiza, y eso no da ningún error — se pinta.
//  2. **La pantalla del niño no conoce los tercios.** Las cadenas de tercio
//     son del widget del PADRE; si `nino.astro` las referencia, alguien le
//     está pintando la posición de KINDER al niño por la puerta de atrás.
//  3. **El árbol del niño no nombra el tablero.** Ningún archivo bajo
//     `app/kids/` o `components/kids/` puede contener la palabra — ni una
//     ruta, ni un enlace, ni una consulta. (Es la misma frontera que
//     `tablero-orden-puntos.mjs`, vigilada aquí desde la cláusula KINDER:
//     este auditor existe porque el issue la nombra por separado.)
//  4. **Quién puede llamar a la vista del niño.** Los únicos archivos que
//     importan `vistaParaNino` son la pantalla del niño (con el guarda de
//     arriba) y la del padre (bajo `app/parent/`). Un tercer llamador se
//     examina a mano antes de existir.

import { archivos, leer, informar, SOLO_PRODUCTO, sinComentarios } from "./lib/repo.mjs";

const problemas = [];
const notas = [];
let comprobaciones = 0;

const PAGINA_NINO = "apps/web/src/pages/[locale]/app/tablero/nino.astro";
const PAGINA_PADRE = "apps/web/src/pages/[locale]/app/parent/tablero/[childId].astro";

// ─── 1. El desvío de KINDER, exigido en la pantalla del niño ────────────────
//
// La forma del guarda se escribe A MANO aquí, no se importa ni se infiere:
// `theme_band === "KINDER"` y una salida que no renderiza nada. Si la pantalla
// cambia de forma —por ejemplo, un componente por banda— este auditor tiene
// que cambiar A PROPÓSITO, no pasar en verde por accidente.
comprobaciones++;
const paginaNino = leer(PAGINA_NINO);
if (paginaNino === null) {
  problemas.push(
    `${PAGINA_NINO} no existe. #247: el tablero del niño es la superficie donde la escalera de ` +
      "D-081 se hace cumplir — sin ella, no hay dónde esté el desvío de KINDER.",
  );
} else {
  const codigo = sinComentarios(paginaNino);
  if (!/theme_band\s*={0,2}===?\s*"KINDER"/.test(codigo) || !/KINDER"\)\s*(?:return|=>)/.test(codigo)) {
    problemas.push(
      `${PAGINA_NINO}: no encuentro el desvío de KINDER (\`if (hijo.theme_band === "KINDER") return …\`). ` +
        "#247: el tablero de la banda KINDER NUNCA se renderiza para el niño, en ninguna forma — " +
        "existe solo como widget del panel del padre. Sin el guarda, un niño de cinco años ve su tablero " +
        "y ningún error lo delata: se pinta.",
    );
  }
  // ─── 2. Los tercios no son para el niño ──────────────────────────────────
  comprobaciones++;
  if (/tercio/i.test(codigo)) {
    problemas.push(
      `${PAGINA_NINO}: la pantalla del niño referencia tercios. D-081: la posición en tercios es la ` +
        "forma del widget del PADRE para KINDER — y KINDER no entra a esta pantalla. Un tercio aquí " +
        "es la posición de un niño de kinder pintada por la puerta de atrás.",
    );
  }
}

// ─── 3. El árbol del niño no nombra el tablero ───────────────────────────────

const DEL_NINO = /(^|\/)(app\/kids|components\/kids)\//;
const fuentes = archivos(/\.(ts|tsx|js|mjs|astro)$/)
  .filter((f) => SOLO_PRODUCTO.test(f))
  .filter((f) => !/\.prueba\.mjs$/.test(f));
for (const archivo of fuentes.filter((f) => DEL_NINO.test(f))) {
  comprobaciones++;
  const texto = sinComentarios(leer(archivo) ?? "");
  if (/(score_totals|tablero|leaderboard)/i.test(texto)) {
    problemas.push(
      `${archivo}: el tablero aparece dentro del árbol del niño. #247: el tablero de la banda ` +
        "KINDER nunca se renderiza en `/app/kids/**`; solo existe como widget del panel del padre.",
    );
  }
}

// ─── 4. Quién llama a `vistaParaNino` ────────────────────────────────────────
//
// La lista de llamadores autorizados, escrita a mano: la pantalla del niño
// (que desvía KINDER, verificado arriba) y la del padre (superficie de
// adulto, con el widget en tercios). Un llamador nuevo rompe este auditor y
// se examina a propósito.
const LLAMADORES_AUTORIZADOS = new Set([PAGINA_NINO, PAGINA_PADRE]);
for (const archivo of fuentes) {
  const texto = leer(archivo) ?? "";
  // Llamador = quien la IMPORTA. La definición misma (`tablero-datos.ts`) no
  // es un llamador, y contarla lo sería es cómo un módulo se cuenta a sí
  // mismo como su llamador.
  if (!/import\s*\{[^}]*\bvistaParaNino\b[^}]*\}\s*from/.test(sinComentarios(texto))) continue;
  if (/^audits\//.test(archivo)) continue;
  comprobaciones++;
  if (!LLAMADORES_AUTORIZADOS.has(archivo)) {
    problemas.push(
      `${archivo}: llama a vistaParaNino y no es una superficie autorizada. La vista del tablero de ` +
        "un niño solo la pintan su pantalla (que desvía KINDER) y el panel de su padre (en tercios). " +
        "Un tercer llamador se decide a propósito, no por omisión.",
    );
  }
}

notas.push(`${comprobaciones} comprobación(es) sobre la frontera de KINDER`);
notas.push("la mitad de contenido (KINDER en tercios, nunca número) la ejecuta tablero-orden-puntos.mjs");

informar({
  nombre: "tablero-sin-kinder-publico",
  problemas,
  notas,
  cita: "#247, D-081, D-040, mc-10, mc-18",
  revisados: comprobaciones,
  resumen: `${comprobaciones} comprobación(es): el desvío de KINDER, los tercios solo al padre, el árbol del niño limpio`,
  porQueBloquea:
    "un tablero renderizado a un niño de cinco años no da error — se pinta. La única defensa es que " +
    "el desvío esté escrito y vigilado.",
  noComprueba: [
    "qué hace un navegador con JavaScript inyectado por terceros (extensiones, proxies) — fuera del " +
      "alcance de un auditor estático.",
  ],
});
