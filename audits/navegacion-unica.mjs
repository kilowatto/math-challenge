#!/usr/bin/env node
// Auditor determinista — una sola navegación primaria a la vez
//
// Hace cumplir: D-064, `mc-49`.
//
// Por qué existe. D-064 nació de una captura real de un iPhone: `nav.sitio`
// (arriba) y `.barra-inferior` (abajo) se pintaban juntas en iOS/Android, y en
// una pestaña de Safari eso eran TRES navegaciones apiladas con la del propio
// navegador — la causa de que el menú se sintiera ajeno a iOS en vez de
// nativo. Construir el arreglo hizo aparecer el MISMO tipo de bug una vez más
// mientras se escribía: `.barra-inferior` no tenía un `display: none`
// incondicional, así que se habría colado en escritorio en cuanto alguien
// tocara `plataformas.css` sin saber que ese default vivía ahí. Un auditor
// que no existía cuando se cometió no lo hubiera atrapado; este existe para
// que la próxima vez sí.
//
// LO QUE NO PUEDE COMPROBAR: cómo se ve de verdad en un dispositivo — eso
// exige un navegador real y ojos, y es lo que la próxima ronda de captura de
// pantalla del dueño sigue verificando. Esto es análisis estático: los cuatro
// bloques existen, cada uno tiene su default oculto, el mecanismo de
// `display-mode` está presente, la barra instalada no excede 3-5 destinos
// (HIG/M3), y no se coló una librería ni JavaScript nuevo para la navegación.

import { leer, informar, existe, archivos, SOLO_PRODUCTO } from "./lib/repo.mjs";

const BASE = "apps/web/src/layouts/Base.astro";
const PLATAFORMAS = "apps/web/src/styles/plataformas.css";
const PKG = "apps/web/package.json";

const problemas = [];
const notas = [];

const base = leer(BASE);
const plataformas = leer(PLATAFORMAS);

if (!base || !plataformas) {
  informar({
    nombre: "navegacion-unica",
    problemas: [`no se pudo leer ${BASE} o ${PLATAFORMAS}`],
    cita: "D-064, mc-49",
    revisados: 0,
    resumen: "",
  });
}

// ─── 1. Los cuatro bloques existen ────────────────────────────────────────
const BLOQUES = [
  ["nav.sitio (escritorio)", /<nav class="sitio"/],
  ["header.compacto (móvil, pestaña de navegador)", /<header class="compacto"/],
  [".barra-inferior (móvil instalado)", /<nav class="barra-inferior"/],
  [".mas-instalada (Más, móvil instalado)", /class="mas-instalada"/],
  ["nav.riel (iPad instalado ancho)", /<nav class="riel"/],
];
for (const [nombre, patron] of BLOQUES) {
  if (!patron.test(base)) {
    problemas.push(`falta el bloque "${nombre}" en ${BASE} — D-064 exige los cuatro contextos, ninguno opcional.`);
  }
}

// ─── 2. Los tres bloques táctiles tienen un default OCULTO incondicional ──
// Es el bug real que se cometió al construir esto: sin este default, el
// bloque se pinta en cualquier plataforma donde ninguna regla lo toque —
// que es exactamente escritorio, porque plataformas.css solo lo gatea bajo
// `[data-platform="ios"]`/`[data-platform="android"]`.
const DEFAULT_OCULTO = [
  ["header.compacto", /header\.compacto\s*\{\s*display:\s*none/],
  ["nav.barra-inferior", /nav\.barra-inferior\s*\{\s*display:\s*none/],
  [".mas-instalada", /\.mas-instalada\s*\{\s*display:\s*none/],
  ["nav.riel", /nav\.riel\s*\{\s*display:\s*none/],
];
for (const [nombre, patron] of DEFAULT_OCULTO) {
  if (!patron.test(base)) {
    problemas.push(
      `"${nombre}" no tiene un "display: none" incondicional en el <style> de ${BASE}. ` +
        "Sin ese default se cuela en escritorio o en cualquier plataforma que ninguna regla de " +
        "plataformas.css toque todavía — el mismo bug que D-064 vino a corregir, otra vez.",
    );
  }
}

// ─── 3. nav.sitio se oculta en táctil ─────────────────────────────────────
if (!/\[data-platform="ios"\]\s*nav\.sitio/.test(plataformas) || !/\[data-platform="android"\]\s*nav\.sitio/.test(plataformas)) {
  problemas.push(
    `${PLATAFORMAS} no oculta nav.sitio en [data-platform="ios"] y [data-platform="android"]. ` +
      "Sin esto, el nav de escritorio vuelve a competir con la barra táctil — el bug original.",
  );
}

// ─── 4. El mecanismo display-mode existe ──────────────────────────────────
const OCURRENCIAS_DISPLAY_MODE = (plataformas.match(/display-mode:\s*(standalone|browser|minimal-ui|fullscreen)/g) ?? []).length;
if (OCURRENCIAS_DISPLAY_MODE < 3) {
  problemas.push(
    `${PLATAFORMAS} solo usa "display-mode" ${OCURRENCIAS_DISPLAY_MODE} vez(veces). D-064 necesita distinguir ` +
      "instalada de pestaña de navegador para al menos tres bloques (compacto, barra+más, riel); menos de " +
      "eso sugiere que uno de los tres perdió su condición.",
  );
} else {
  notas.push(`${OCURRENCIAS_DISPLAY_MODE} consulta(s) de display-mode en plataformas.css`);
}

// ─── 5. La barra instalada: 3-5 destinos, nunca más (HIG, Material 3) ─────
const arregloCinco = base.match(/const CINCO:[^=]*=\s*\[([\s\S]*?)\n\];/);
if (!arregloCinco) {
  problemas.push(
    `no encontré el arreglo de destinos de la barra instalada (esperaba "const CINCO" en ${BASE}). ` +
      "Si se renombró, este auditor necesita actualizarse — no asumas que 0 destinos significa 0 problemas.",
  );
} else {
  const destinos = (arregloCinco[1].match(/\{\s*seccion:/g) ?? []).length;
  if (destinos > 5) {
    problemas.push(
      `la barra instalada tiene ${destinos} destinos. HIG y Material 3 coinciden en el máximo: 3-5, nunca ` +
        "más — cada destino adicional aumenta la dificultad de encontrar información (mc-49 hallazgo #1-2). " +
        'Si algo más necesita un toque directo, el resto va al "Más", no a una 6ª pestaña.',
    );
  } else if (destinos < 3) {
    problemas.push(`la barra instalada tiene ${destinos} destino(s) — HIG/M3 piden 3-5, no menos de 3.`);
  } else {
    notas.push(`barra instalada: ${destinos} destinos (HIG/M3: 3-5)`);
  }
}

// ─── 6. Sin JavaScript nuevo para la NAVEGACIÓN ───────────────────────────
//
// Antes de D-064, Base.astro tenía exactamente 2 `<script is:inline>`. El menú
// de D-064 se construyó a propósito con `<details>/<summary>` nativo para no
// sumar un tercero — la decisión "sin librería" del punto 7.
//
// Contar scripts a secas resultó ser la regla equivocada, y se vio en cuanto
// hizo falta un script que NO es de navegación: el de #339, que redirige a
// quien ya tiene sesión y pide `/entrar/`. Bloqueó, y bloqueó por la razón
// equivocada — subir el número a 3 sin más habría apagado la comprobación para
// el cuarto script, que sí podría ser un menú.
//
// Así que ahora la lista es NOMINAL: cada `is:inline` de `Base.astro` está
// declarado aquí con lo que hace y por qué se le permite. Uno nuevo bloquea
// igual que antes, y además obliga a escribir a qué vino.
const SCRIPTS_PERMITIDOS = [
  ["data-platform", "detección de plataforma sin destello (D-031)"],
  ["serviceWorker", "registro del service worker (mc-33)"],
  ["mc_p", "redirección de quien ya tiene sesión fuera de /entrar/ (#339)"],
];
const scripts = (base.match(/<script\s+is:inline\b/g) ?? []).length;
if (scripts > SCRIPTS_PERMITIDOS.length) {
  problemas.push(
    `${BASE} tiene ${scripts} <script is:inline> y solo ${SCRIPTS_PERMITIDOS.length} están declarados ` +
      `(${SCRIPTS_PERMITIDOS.map(([m]) => m).join(", ")}). D-064 eligió <details>/<summary> nativo ` +
      "exactamente para no sumar JavaScript a la navegación. Si el script nuevo NO es de navegación, " +
      "añádelo a SCRIPTS_PERMITIDOS con lo que hace; si lo es, la decisión se está revirtiendo.",
  );
}
// Y cada uno declarado tiene que seguir existiendo: si alguien borra el de
// plataforma y añade un menú, el conteo cuadraría y la regla no vería nada.
for (const [marca, para] of SCRIPTS_PERMITIDOS) {
  if (!base.includes(marca)) {
    problemas.push(
      `${BASE} ya no contiene "${marca}" (${para}), pero sigue declarado en SCRIPTS_PERMITIDOS. ` +
        "Un conteo que cuadra por casualidad no comprueba nada: quita el renglón o restaura el script.",
    );
  }
}
notas.push(`${scripts} <script is:inline> en Base.astro, los ${SCRIPTS_PERMITIDOS.length} declarados`);

// ─── 7. Ninguna librería de "look nativo" declarada en package.json ───────
const pkg = leer(PKG);
const LIBRERIAS_PROHIBIDAS = /"(framework7|framework7-\w+|ionic|@ionic\/\w+|onsenui|onsen-ui)"\s*:/i;
if (pkg && LIBRERIAS_PROHIBIDAS.test(pkg)) {
  const encontrada = pkg.match(LIBRERIAS_PROHIBIDAS)?.[1];
  problemas.push(
    `${PKG} declara "${encontrada}". D-064 punto 7 descartó explícitamente Framework7/Ionic/Onsen UI: ` +
      "cuestan peso de JS real en TODAS las páginas del sitio, no solo donde se usan, y mc-49 no encontró " +
      "evidencia de que el resultado supere a CSS bien hecho para una barra de pestañas.",
  );
}

// ─── 8. …ni importada directamente en el código, con o sin declarar en package.json ──
// El punto 7 lee `package.json`; este lee el CÓDIGO. Un `import` puede llegar
// por un paquete transitivo o copiado a mano sin pasar por `npm install`, y esa
// vía no toca `package.json` en absoluto — es la diferencia entre "no está
// declarada" y "no se usa".
const IMPORT_PROHIBIDO = /from\s+["'`](framework7|onsenui|onsen-ui|@ionic\/[\w-]+)["'`]/i;
for (const archivo of archivos(/\.(astro|ts|tsx|js|jsx)$/).filter((f) => SOLO_PRODUCTO.test(f))) {
  const texto = leer(archivo) ?? "";
  const hallazgo = texto.match(IMPORT_PROHIBIDO);
  if (hallazgo) {
    problemas.push(
      `${archivo} importa "${hallazgo[1]}". D-064 punto 7 descartó explícitamente Framework7/Ionic/Onsen UI ` +
        "para la navegación — el costo de JS cae en todas las páginas, no solo donde se usa.",
    );
  }
}

informar({
  nombre: "navegacion-unica",
  problemas,
  notas,
  cita: "D-064, mc-49",
  revisados: existe(BASE) && existe(PLATAFORMAS) && existe(PKG) ? 3 : 0,
  resumen: `${BASE}, ${PLATAFORMAS} y ${PKG} revisados`,
  porQueBloquea:
    "dos navegaciones primarias a la vez es el bug que produjo la captura que abrió D-064 — un iPhone real " +
    "mostrando tres barras apiladas. El costo de repetirlo es visible en la primera pantalla que ve cualquier " +
    "visita nueva.",
  noComprueba: [
    "cómo se ve de verdad en un dispositivo — eso es un navegador real y ojos, no análisis estático.",
    "si el riel de iPad o el menú compacto son usables — solo que existen, están ocultos por defecto donde " +
      "corresponde, y nadie sumó una librería o un script para construirlos.",
  ],
});
