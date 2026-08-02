#!/usr/bin/env node
// Auditor determinista — una página que sirve su propio <html> llega vestida
//
// Hace cumplir: D-065, D-070, D-031/D-036 (los tokens), #341, #345.
//
// ─── Por qué existe, y por qué volvió DOS veces ────────────────────────────
//
// 1. `layouts/Privada.astro` se sirvió sin `tokens.css` durante tres commits.
//    Se arregló en `4ceae86` y **volvió al resolver un conflicto de merge con
//    `--theirs`**: toda `/app/**` en Times, negro sobre blanco, mientras el
//    encabezado del propio archivo afirmaba que «comparte los tokens con
//    Base.astro». Un arreglo que un `git checkout --theirs` deshace y que nada
//    vuelve a comprobar no es un arreglo.
//
// 2. La pantalla del reto — `components/reto/Pantalla.astro` — importaba
//    `reto.css` y no `tokens.css`. `reto.css` pide `var(--color-surface)`,
//    `var(--color-border)` y `var(--color-accent)`, y **un `var()` sin definir
//    no cae a un valor por defecto: invalida la declaración entera en tiempo de
//    cómputo**. Los bordes de 3px de los botones de respuesta desaparecían y la
//    pantalla donde el niño contesta se veía como HTML sin diseñar.
//
// Los dos son el mismo fallo: el archivo que emite `<html>` no carga lo que su
// propio CSS necesita. Ninguno rompe el build, ninguno rompe una prueba, y los
// dos se ven idénticos a «así se diseñó» para quien no conoce la paleta.
//
// ─── Las tres partes, y por qué la 2 y la 3 no pueden ser ciertas por
//     construcción (D-070) ─────────────────────────────────────────────────
//
// La parte 1 es la regla literal de #341: los layouts cargan las tres hojas.
// Es una lista fija contra unos imports, y se puede satisfacer escribiendo tres
// líneas — o sea que sirve contra el olvido, no contra el descuido de fondo.
//
// Las partes 2 y 3 cruzan **dos fuentes independientes**, que es lo que D-070
// pide:
//
//   · Parte 2: los tokens que el CSS de la página USA contra los que sus hojas
//     DEFINEN. Nadie escribe las dos listas: una sale de `var(--x)` en las
//     hojas, la otra de `--x:` en las hojas que la página decidió importar.
//     Coinciden solo si la página importó de verdad lo que necesita.
//
//   · Parte 3: los atributos `data-*` que la página escribe en su `<html>`
//     contra los selectores `[data-*]` de las hojas que importa. `bandas.css`
//     lo dice con todas sus letras en su propio encabezado: «una pantalla que
//     emita `data-band` y no importe este archivo se ve exactamente como la
//     base y no falla nada — es el modo de romperlo que no deja rastro».
//
// ─── LO QUE ESTE AUDITOR NO COMPRUEBA ──────────────────────────────────────
//
//  · Que la página se VEA bien. Un token definido con el valor equivocado pasa
//    entero por aquí; eso es `contrast.mjs` y un dispositivo real.
//  · Que la hoja se sirva de verdad. Esto lee el código fuente, no `dist/` ni
//    producción: si Astro dejara de emitir un `<link>`, este auditor seguiría
//    en verde. Eso lo ve `node audits/live.mjs`.
//  · El orden de los imports. `bandas.css` tiene que ir DESPUÉS de `tokens.css`
//    porque varios selectores empatan en especificidad con `:root`; aquí solo
//    se comprueba presencia.
//  · Tokens que JavaScript define con `setProperty` en tiempo de ejecución: se
//    aceptan como definidos, no se comprueba que la rama que los define corra.
//  · Los `.ts`/`.js` importados desde el frontmatter. El cierre sigue `.astro`
//    y `.css` únicamente; una hoja importada desde un módulo TypeScript sería
//    invisible aquí (hoy no existe ninguna).

import { archivos, leer, informar, separarDeuda } from "./lib/repo.mjs";

/**
 * Lo que este auditor encontró roto en el producto el día que se escribió, y
 * que NO se arregla desde aquí: `audits/` no toca `apps/web/src/`.
 *
 * Cada renglón bloquea el día que deje de reproducirse — ver `separarDeuda`.
 */
const DEUDA = [
  {
    id: "apps/web/src/layouts/Privada.astro escribe data-band",
    issue: "#341 · encontrado 2026-08-02 al escribir este auditor",
    porQue:
      "Privada.astro pone data-band=\"SERIO\" en su <html> y no importa styles/bandas.css, así que la " +
      "paleta de noche y la tipografía de la banda SERIO no se aplican nunca. O falta el import, o sobra " +
      "el atributo; las dos son cambios en apps/web/src/ y este auditor no los hace.",
  },
];

const problemas = [];
const notas = [];

// ───────────────────────────────────────────────────────────────────────────
// Utilidades de lectura
// ───────────────────────────────────────────────────────────────────────────

const sinComentariosCss = (css) => css.replace(/\/\*[\s\S]*?\*\//g, " ");

/** El frontmatter de un `.astro` (lo de entre los dos `---`). */
function frontmatter(texto) {
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : "";
}

/** La plantilla: lo que queda después del frontmatter. */
function plantilla(texto) {
  const m = texto.match(/^---\r?\n[\s\S]*?\r?\n---([\s\S]*)$/);
  return m ? m[1] : texto;
}

/** Los `<style>` de un `.astro`, concatenados. */
function estilosInline(texto) {
  return [...plantilla(texto).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1])
    .join("\n");
}

/** Resuelve `../../styles/tokens.css` relativo a `apps/web/src/layouts/X.astro`. */
function resolver(desde, especificador) {
  const partes = desde.split("/");
  partes.pop();
  for (const trozo of especificador.split("/")) {
    if (trozo === "." || trozo === "") continue;
    if (trozo === "..") partes.pop();
    else partes.push(trozo);
  }
  return partes.join("/");
}

/** Los especificadores relativos que importa un `.astro`. */
function importados(texto) {
  const fm = frontmatter(texto);
  const salida = [];
  for (const m of fm.matchAll(/import\s+(?:[^"';]*?\s+from\s+)?["'`](\.[^"'`]+)["'`]/g)) {
    salida.push(m[1]);
  }
  return salida;
}

/**
 * El cierre transitivo de un `.astro`: él mismo, los `.astro` que importa, y
 * todas las hojas `.css` que aparezcan por el camino.
 *
 * Es lo que el navegador acaba recibiendo: Astro sube los `import "*.css"` de
 * cualquier componente del árbol al `<head>` de la página. Por eso
 * `app/practicar.astro` puede importar solo `reto.css` y aun así llevar
 * `tokens.css` — se lo trae `components/reto/Pantalla.astro`.
 */
function cierre(entrada) {
  const astros = new Set();
  const hojas = new Set();
  const pila = [entrada];
  while (pila.length > 0) {
    const actual = pila.pop();
    if (astros.has(actual)) continue;
    const texto = leer(actual);
    if (texto === null) continue;
    astros.add(actual);
    for (const esp of importados(texto)) {
      const destino = resolver(actual, esp);
      if (destino.endsWith(".css")) hojas.add(destino);
      else if (destino.endsWith(".astro")) pila.push(destino);
    }
  }
  return { astros: [...astros], hojas: [...hojas] };
}

// ───────────────────────────────────────────────────────────────────────────
// Quiénes emiten un <html> propio
// ───────────────────────────────────────────────────────────────────────────

const ASTRO_DE_WEB = /^apps\/web\/src\/.*\.astro$/;
const EMITE_HTML = /<html[\s>]/;

const paginas = archivos(ASTRO_DE_WEB).filter((f) => EMITE_HTML.test(plantilla(leer(f) ?? "")));

if (paginas.length === 0) {
  console.error("✗ hojas-de-estilo — no encontré un solo archivo que emita <html>.");
  console.error("  Eso no puede ser cierto en este repo: el patrón está mal.");
  process.exit(1);
}

// ───────────────────────────────────────────────────────────────────────────
// Parte 1 — todo layout con <html> completo carga las tres hojas
// ───────────────────────────────────────────────────────────────────────────
//
// Solo `src/layouts/`: es el alcance literal de #341 y el único sitio donde las
// tres hojas se pueden exigir sin discutir. Una pantalla suelta puede tener
// razones para no cargar `plataformas.css` (no pinta navegación de plataforma);
// un layout, no — es el que decide el aspecto de todo lo que envuelve.
const HOJAS_DE_LAYOUT = ["fonts.css", "tokens.css", "plataformas.css"];

/**
 * La salida escrita: `SIN-HOJA: <archivo> — <razón>`.
 *
 * Existe porque #341 dice «o declara por escrito por qué no». La razón tiene
 * que tener 40 caracteres o más: con una vacía la regla se cumpliría escribiendo
 * el encabezado, que es exactamente cómo muere una anulación (D-032, regla 2).
 */
const RENUNCIA = /SIN-HOJA:\s*([\w.-]+)\s*[—-]\s*(.{40,})/g;

function renuncias(texto) {
  const mapa = new Map();
  for (const m of texto.matchAll(RENUNCIA)) mapa.set(m[1], m[2].trim());
  return mapa;
}

const layouts = paginas.filter((f) => f.startsWith("apps/web/src/layouts/"));
if (layouts.length === 0) {
  problemas.push(
    "no hay un solo layout con <html> en apps/web/src/layouts/. O el repo cambió de forma, " +
      "o el patrón de este auditor dejó de encontrarlos — las dos cosas hay que mirarlas.",
  );
}

for (const layout of layouts) {
  const texto = leer(layout) ?? "";
  const propias = new Set(importados(texto).map((e) => e.split("/").pop()));
  const escritas = renuncias(texto);
  for (const hoja of HOJAS_DE_LAYOUT) {
    if (propias.has(hoja)) continue;
    if (escritas.has(hoja)) {
      notas.push(`${layout} renuncia a ${hoja} por escrito: «${escritas.get(hoja).slice(0, 70)}…»`);
      continue;
    }
    problemas.push(
      `${layout} sirve un <html> completo y NO importa styles/${hoja}. ` +
        "Un layout viste todo lo que envuelve: sin esa hoja, cada página que lo use se sirve sin ella. " +
        `Pasó dos veces con Privada.astro. Si de verdad no la necesita, escríbelo en el archivo: ` +
        `«SIN-HOJA: ${hoja} — <razón de 40 caracteres o más>».`,
    );
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Parte 2 — ningún var() sin respaldo se queda sin definir (D-070)
// ───────────────────────────────────────────────────────────────────────────
//
// `var(--x, algo)` NO cuenta: tiene respaldo declarado, y usar el respaldo es
// una decisión, no un accidente. `reto.css` lo hace a propósito con
// `--radius-control`, que vive en `plataformas.css` y la pantalla del reto no
// carga.
const USA_SIN_RESPALDO = /var\(\s*(--[a-z0-9-]+)\s*\)/gi;
const DEFINE = /(?:^|[;{\s])(--[a-z0-9-]+)\s*:/g;
const DEFINE_JS = /setProperty\(\s*["'`](--[a-z0-9-]+)["'`]/g;

let tokensRevisados = 0;

for (const pagina of paginas) {
  const { astros, hojas } = cierre(pagina);

  const cssDelCierre = [
    ...hojas.map((h) => sinComentariosCss(leer(h) ?? "")),
    ...astros.map((a) => sinComentariosCss(estilosInline(leer(a) ?? ""))),
  ].join("\n");

  const definidos = new Set();
  for (const m of cssDelCierre.matchAll(DEFINE)) definidos.add(m[1]);
  // Un token puesto desde un `style="--x: …"` del propio HTML, o desde
  // JavaScript, también está definido.
  for (const a of astros) {
    const t = leer(a) ?? "";
    for (const m of t.matchAll(DEFINE)) definidos.add(m[1]);
    for (const m of t.matchAll(DEFINE_JS)) definidos.add(m[1]);
  }

  const faltantes = new Set();
  for (const m of cssDelCierre.matchAll(USA_SIN_RESPALDO)) {
    tokensRevisados++;
    if (!definidos.has(m[1])) faltantes.add(m[1]);
  }

  if (faltantes.size > 0) {
    problemas.push(
      `${pagina} usa ${[...faltantes].sort().join(", ")} sin que ninguna hoja de su cierre lo defina. ` +
        "Un `var()` sin definir NO cae a un valor por defecto: invalida la declaración entera, así que el " +
        "borde, el fondo o la tipografía sencillamente no existen y la pantalla se ve como HTML crudo. " +
        `Hojas que carga hoy: ${hojas.map((h) => h.split("/").pop()).join(", ") || "ninguna"}.`,
    );
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Parte 3 — un data-* en el <html> sin la hoja que lo lee no deja rastro
// ───────────────────────────────────────────────────────────────────────────
//
// La dirección contraria —cargar una hoja de `[data-*]` sin escribir el
// atributo— NO se comprueba: `reto.css` usa `[data-acierto]` y `[data-visible]`
// sobre elementos que JavaScript marca en tiempo de ejecución, y exigir que
// aparezcan en el `<html>` sería un falso positivo garantizado.
const ATRIBUTO_EN_HTML = /<html[^>]*?\s(data-[a-z-]+)\s*=/g;

for (const pagina of paginas) {
  const texto = leer(pagina) ?? "";
  const etiqueta = plantilla(texto).match(/<html[^>]*>/);
  if (!etiqueta) continue;

  const { hojas } = cierre(pagina);
  const cssDelCierre = hojas.map((h) => sinComentariosCss(leer(h) ?? "")).join("\n");

  for (const m of etiqueta[0].matchAll(/\s(data-[a-z-]+)\s*=/g)) {
    const attr = m[1];
    if (cssDelCierre.includes(`[${attr}`)) continue;
    problemas.push(
      `${pagina} escribe ${attr} en su <html> y ninguna hoja de su cierre tiene un selector [${attr}. ` +
        "El atributo no lo lee nadie: la pantalla se ve exactamente como la base y no falla nada. " +
        "Lo dice el encabezado de styles/bandas.css con esas palabras — «es el modo de romperlo que no " +
        "deja rastro».",
    );
  }
}
void ATRIBUTO_EN_HTML;

notas.push(`${paginas.length} archivo(s) emiten su propio <html>; ${layouts.length} son layouts`);
notas.push(`${tokensRevisados} uso(s) de var() sin respaldo cruzados contra sus definiciones`);

const { bloquean, conocidos } = separarDeuda(problemas, DEUDA);
notas.push(...conocidos);

informar({
  nombre: "hojas-de-estilo",
  problemas: bloquean,
  notas,
  cita: "#341, D-065, D-070, D-031, D-036",
  revisados: paginas.length,
  resumen: `${paginas.length} página(s) con <html> propio, ${tokensRevisados} var() cruzados`,
  porQueBloquea:
    "las dos veces que esto se rompió, el build pasó, el despliegue pasó, y quien lo encontró fue el dueño " +
    "abriendo su teléfono. Un `var()` sin definir no da error: da una pantalla sin diseñar.",
  noComprueba: [
    "que la página se VEA bien — un token con el valor equivocado pasa entero (eso es contrast.mjs)",
    "que la hoja llegue de verdad al navegador: esto lee el código fuente, no dist/ ni producción",
    "el ORDEN de los imports; bandas.css tiene que ir después de tokens.css y aquí solo se mira presencia",
    "hojas importadas desde un .ts/.js del frontmatter: el cierre sigue .astro y .css nada más",
  ],
});
