#!/usr/bin/env node
// Auditor determinista 09 — axe-core sobre las páginas
//
// Hace cumplir: D-032 (que nombra "axe-core" en la lista de deterministas),
// `mc-38` (accesibilidad y diferencias de aprendizaje) y WCAG 2.2 AA, que el
// master-plan fija como requisito de S0.
//
// Por qué WCAG 2.2 AA y no 2.1: la Ley Europea de Accesibilidad aplica desde el
// 28 de junio de 2025 y su referencia técnica, EN 301 549, incorpora WCAG 2.1
// completo; la regla ADA Título II de EE. UU. exige 2.1 AA a escuelas públicas
// para 2027/2028 (`mc-38` §12). 2.2 AA es un superconjunto estricto de 2.1 AA:
// apuntar a 2.2 satisface los dos regímenes con margen y no cuesta más.
//
// ── Lo que este auditor NO puede comprobar, dicho antes que nada ────────────
//
// Corre axe-core sobre un DOM de Node (happy-dom), no sobre un navegador. Ese
// DOM parsea HTML y CSS pero **no calcula layout ni pinta**: cada
// getBoundingClientRect() devuelve 0×0 y ningún color se compone contra su
// fondo. Eso deja fuera, de forma estructural y no por pereza:
//
//   · **Contraste calculado** (WCAG 1.4.3 / 1.4.11, reglas `color-contrast` y
//     `link-in-text-block`). Sin composición de fondos no hay ratio real. Lo
//     cubre `audits/brand-image.mjs` sobre la paleta, y le toca al auditor
//     `contrast` que sigue pendiente de fase.
//   · **Tamaño de objetivo táctil** (WCAG 2.5.8, regla `target-size`). Esta es
//     la peligrosa: comprobado en este repo, axe **da por APROBADOS** 7 enlaces
//     que miden 0×0 px, porque 0 no es menor que 0. Un "pasó" así es peor que
//     no medir. Le toca al auditor `touch-targets`, con los blancos por banda
//     de edad (24 px WCAG / 44 px HIG / 88 px kinder).
//   · **Foco visible y apariencia del foco** (WCAG 2.4.7 y 2.4.11). axe no
//     tiene regla para esto ni en navegador real: exige ver el anillo pintado.
//   · **Reflow a 320 px** (WCAG 1.4.10) y todo lo que dependa de viewport.
//   · **Cualquier cosa que aparezca tras interactuar**: menús abiertos,
//     diálogos, estados de error de formulario. Se audita el HTML servido, no
//     los estados de la aplicación.
//
// Y el límite que aplica incluso con un navegador real: la prueba automática de
// accesibilidad detecta una fracción de las barreras de WCAG. Cero violaciones
// aquí significa "ninguna de las que una máquina puede ver", jamás "accesible".
// La revisión con lector de pantalla y con usuarios sigue siendo obligatoria y
// está agendada en F11 del master-plan.
//
// ── Sobre las dependencias ──────────────────────────────────────────────────
//
// Este repo tiene pocas dependencias a propósito y la flota entera está escrita
// sin ninguna. Esta comprobación no se puede hacer así: axe-core necesita un
// DOM. Se midieron las tres alternativas antes de elegir:
//
//   happy-dom + axe-core   24 MB,  9 paquetes  ← elegida
//   jsdom     + axe-core   28 MB, 34 paquetes  (mismas reglas, más ruido en stderr)
//   linkedom  + axe-core    9 MB, 16 paquetes  (NO funciona: axe revienta al
//                                               precargar el CSSOM)
//   playwright/puppeteer  ~300 MB con Chromium (no se instaló; sería la única
//                                               vía para contraste y layout)
//
// Un navegador headless cubriría lo que aquí falta, y es la decisión del dueño
// pagar 300 MB por ello, no la mía. Mientras no se pague, lo que no se mide se
// dice en voz alta arriba y en cada corrida.
//
// Uso:
//   node audits/axe-a11y.mjs                          sobre apps/web/dist
//   node audits/axe-a11y.mjs https://math.kilowatto.com   sobre lo desplegado

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";

const DIST = "apps/web/dist";
const origen = process.argv[2] ?? null;

// Las etiquetas de axe que corresponden a WCAG 2.2 nivel AA acumulado. Se deja
// fuera "best-practice" a propósito: son recomendaciones de Deque, no criterios
// de conformidad, y mezclarlas haría que este auditor bloqueara commits citando
// algo que WCAG no exige — exactamente el ruido que D-032 teme.
const ETIQUETAS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Reglas apagadas porque sin layout ni pintado su veredicto no vale. No se
// dejan correr "por si acaso": una regla que aprueba sin poder medir reparte
// permisos. Cada una dice quién sí la va a comprobar.
const SIN_NAVEGADOR = {
  "color-contrast": "1.4.3 — sin composición de fondos no hay ratio real (→ auditor `contrast`)",
  "color-contrast-enhanced": "1.4.6 — igual que la anterior, y es AAA",
  "link-in-text-block": "1.4.1 — necesita el contraste del enlace contra su párrafo",
  "target-size": "2.5.8 — aprueba elementos de 0×0 px; miente (→ auditor `touch-targets`)",
  "scrollable-region-focusable": "2.1.1 — necesita saber qué desborda, y nada desborda sin layout",
};

const fatal = (mensaje, detalle = []) => {
  console.error(`✗ axe-a11y\n`);
  console.error(`  · ${mensaje}`);
  for (const d of detalle) console.error(`    ${d}`);
  console.error(`\n  Hace cumplir: D-032, mc-38, WCAG 2.2 AA`);
  process.exit(1);
};

// ── Dependencias ────────────────────────────────────────────────────────────
// Están declaradas en package.json. Si faltan, el entorno está roto, no la
// fase: se falla y se dice el comando. Pasar aquí sería el bug del escáner
// ciego con otro disfraz.
//
// axe-core se resuelve aquí pero se importa mucho más abajo, a propósito:
// captura `window` en el instante en que se carga, así que no puede importarse
// antes de que exista el DOM prestado. El bloque "Una sola ventana, reciclada"
// explica por qué eso obliga a todo lo demás.
let Window, urlDeAxe;
try {
  ({ Window } = await import("happy-dom"));
  urlDeAxe = import.meta.resolve("axe-core");
} catch (err) {
  fatal(`faltan dependencias del auditor: ${err.message.split("\n")[0]}`, [
    "corre: pnpm install    (axe-core y happy-dom están en devDependencies)",
  ]);
}

// ── Qué páginas se auditan ──────────────────────────────────────────────────
// Las rutas salen SIEMPRE del build, incluso al auditar producción: el build es
// la lista real de páginas. Inventarlas a mano garantiza que la ruta nueva de
// alguien nunca se audite.
if (!existsSync(DIST)) {
  console.log("○ axe-a11y — no hay build todavía (corre pnpm build)");
  process.exit(0);
}

const paginasHtml = [];
const caminar = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    // _worker.js es el servidor: no es una página y no tiene DOM que auditar.
    if (e.isDirectory()) {
      if (e.name !== "_worker.js") caminar(p);
    } else if (e.name.endsWith(".html")) {
      paginasHtml.push(p);
    }
  }
};
caminar(DIST);

if (paginasHtml.length === 0) {
  fatal("0 páginas HTML en el build. Un escáner que no ve nada pasa siempre.", [
    `revisado: ${DIST}`,
  ]);
}

// dist/en/index.html → /en/ ; dist/index.html → /
const rutaDe = (archivo) =>
  "/" + relative(DIST, archivo).replace(/index\.html$/, "").replace(/\\/g, "/");

// ── Traer el HTML y meterle su CSS ──────────────────────────────────────────
// happy-dom no descarga nada. Sin el CSS, todo lo que un `display:none` del
// stylesheet oculta se audita como si fuera visible, y salen violaciones
// fantasma. Por eso las hojas se resuelven a mano y se incrustan.
const HOJA = /<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi;
const HREF = /href=["']([^"']+)["']/i;
const hojasNoResueltas = [];

const conCssIncrustado = async (html, base) => {
  const enlaces = html.match(HOJA) ?? [];
  let salida = html;
  for (const enlace of enlaces) {
    const href = enlace.match(HREF)?.[1];
    if (!href || /^https?:/i.test(href)) continue; // hoja de terceros: no se toca
    let css = null;
    if (origen) {
      try {
        const res = await fetch(new URL(href, origen).href);
        if (res.ok) css = await res.text();
      } catch {
        /* se sigue sin ella; abajo se cuenta como hoja no resuelta */
      }
    } else {
      const enDisco = href.startsWith("/") ? join(DIST, href.slice(1)) : join(base, href);
      if (existsSync(enDisco)) css = readFileSync(enDisco, "utf8");
    }
    if (css !== null) salida = salida.replace(enlace, `<style>${css}</style>`);
    else hojasNoResueltas.push(href);
  }
  return salida;
};

// Una ruta del build que producción no sirve no se salta en silencio: se anota
// y se falla al final, después de auditar todas las que sí respondieron. Morir
// en el primer 404 esconde el resto del reporte, y saltárselo callando deja una
// página sin auditar detrás de un "0 violaciones" — las dos maneras de mentir.
const noServidas = [];

const traer = async (archivo) => {
  const ruta = rutaDe(archivo);
  if (!origen) {
    return { ruta, html: await conCssIncrustado(readFileSync(archivo, "utf8"), dirname(archivo)) };
  }
  const url = new URL(ruta, origen).href;
  let res;
  try {
    res = await fetch(url, { headers: { "accept-language": "en" } });
  } catch (err) {
    noServidas.push(`${url} — no se pudo alcanzar (${err.message})`);
    return null;
  }
  if (!res.ok) {
    noServidas.push(`${url} — HTTP ${res.status}`);
    return null;
  }
  return { ruta, html: await conCssIncrustado(await res.text(), dirname(archivo)), url };
};

// ── Una sola ventana, reciclada ─────────────────────────────────────────────
//
// axe-core fue escrito para vivir dentro de un navegador: busca sus
// constructores en el ámbito global y **captura `window` en el instante en que
// se carga el módulo**. De ahí salen las dos reglas de este bloque, y las dos se
// aprendieron rompiéndolo:
//
//   1. Hay que prestarle los globales ANTES de importarlo. Si no, revienta con
//      "Required window or document globals not defined".
//   2. No se puede importar una vez por página. axe-core es CommonJS, y la
//      caché de require de Node ignora la query string: `import("axe-core?p=1")`
//      devuelve **exactamente la misma instancia**, todavía atada a la ventana
//      de la primera página. Con eso este auditor recorrió el build entero,
//      imprimió "0 violaciones", y estaba mirando la primera página cada vez —
//      incluida una que le plantaron con seis violaciones. Se comprobó:
//      `a === b` es `true` con queries distintas.
//
// La salida es una sola ventana que se recicla con document.open/write/close —
// que sí borra título, `lang` y árbol— y una sola importación de axe. El precio
// es que el estado de la ventana no se aísla entre páginas; el guardia de
// identidad de abajo (`r.url`) es lo que vigila que ese precio no se cobre en
// silencio, porque es justo lo que falló antes.
const GLOBALES = [
  "Node", "Element", "HTMLElement", "NodeList", "Text", "Document", "HTMLDocument",
  "DocumentFragment", "ShadowRoot", "SVGElement", "getComputedStyle", "NodeFilter",
];

const base = origen ?? "https://math.kilowatto.com";
const win = new Window({ url: base });
globalThis.window = win;
globalThis.document = win.document;
for (const k of GLOBALES) if (win[k] !== undefined) globalThis[k] = win[k];

let axe;
try {
  axe = (await import(urlDeAxe)).default;
} catch (err) {
  fatal(`axe-core no se pudo cargar: ${err.message.split("\n")[0]}`);
}

const OPCIONES = {
  runOnly: { type: "tag", values: ETIQUETAS },
  rules: Object.fromEntries(Object.keys(SIN_NAVEGADOR).map((id) => [id, { enabled: false }])),
};

const cargar = (html, url) => {
  win.happyDOM.setURL(url);
  win.document.open();
  win.document.write(html);
  win.document.close();
};

// ── Autoprueba: ¿este auditor todavía ve? ───────────────────────────────────
//
// audits/README.md lo dice para la flota adversarial y aplica igual aquí: lo
// único que distingue "el código está limpio" de "el auditor está ciego" es
// plantar una violación conocida y comprobar que la caza. Seis violaciones de
// libro, cinco criterios distintos. Si alguna se escapa, el veredicto de todo
// lo demás no vale nada y se falla antes de mirar una sola página real.
const CANARIO = `<!doctype html><html><head><meta charset="utf-8"></head>
<body><img src="x.png"><button></button><input type="text"><a href="/x"></a></body></html>`;
const ESPERADAS = ["html-has-lang", "document-title", "image-alt", "button-name", "label", "link-name"];

cargar(CANARIO, `${base}/__canario__`);
let autoprueba;
try {
  autoprueba = await axe.run(win.document, OPCIONES);
} catch (err) {
  fatal(`la autoprueba de axe reventó: ${err.message.split("\n")[0]}`);
}
const cazadas = new Set(autoprueba.violations.map((v) => v.id));
const escapadas = ESPERADAS.filter((id) => !cazadas.has(id));
if (escapadas.length > 0) {
  fatal(`el auditor está ciego: no cazó ${escapadas.join(", ")} en su propia página de prueba.`, [
    "hasta que la autoprueba cace las 6, ningún '0 violaciones' de este archivo significa nada",
  ]);
}

// axe etiqueta "wcag1410" para el criterio 1.4.10 y "wcag111" para el 1.1.1:
// el número de criterio es primer dígito, segundo dígito, y el resto junto.
const criterios = (etiquetas) =>
  etiquetas
    .filter((t) => /^wcag\d{3,4}$/.test(t))
    .map((t) => {
      const d = t.slice(4);
      return `${d[0]}.${d[1]}.${d.slice(2)}`;
    });

// ── Corrida ─────────────────────────────────────────────────────────────────
const problemas = [];
const noConcluyentes = new Map();
const reglasEjecutadas = new Set();
let nodosRevisados = 0;

let paginasAuditadas = 0;

for (const archivo of paginasHtml) {
  const traida = await traer(archivo);
  if (traida === null) continue;
  const { ruta, html, url } = traida;
  paginasAuditadas++;
  const urlDePagina = url ?? new URL(ruta, base).href;

  cargar(html, urlDePagina);

  // Si el documento llegó vacío, no hay nada que auditar y decirlo "limpio"
  // sería la mentira más cara de este archivo.
  if ((win.document.body?.querySelectorAll("*").length ?? 0) === 0) {
    fatal(`${ruta} — el DOM quedó vacío tras parsear. No se audita lo que no se ve.`);
  }

  let r;
  try {
    r = await axe.run(win.document, OPCIONES);
  } catch (err) {
    fatal(`axe reventó en ${ruta}: ${err.message.split("\n")[0]}`, [
      "un auditor que se cae no es un auditor que aprueba",
    ]);
  }

  // Guardia de identidad. axe reporta en `url` la ubicación de la ventana que
  // realmente miró. Si no coincide con la página que le dimos, está auditando
  // otra cosa — que es exactamente el bug de la caché de CommonJS descrito
  // arriba, y la única señal que lo delató. Sin esta línea vuelve a colarse.
  if (r.url !== urlDePagina) {
    fatal(`axe auditó ${r.url} cuando le pedimos ${urlDePagina}.`, [
      "la ventana prestada quedó atada a otra página: todo veredicto anterior es falso",
    ]);
  }

  for (const grupo of ["violations", "passes", "incomplete", "inapplicable"]) {
    for (const res of r[grupo]) reglasEjecutadas.add(res.id);
  }
  nodosRevisados += r.passes.reduce((a, x) => a + x.nodes.length, 0);

  for (const v of r.violations) {
    const sc = criterios(v.tags);
    problemas.push(
      `${url ?? ruta} — ${v.id} [${v.impact ?? "sin impacto"}]` +
        (sc.length ? ` · WCAG ${sc.join(", ")}` : "") +
        `\n      ${v.help}` +
        v.nodes.slice(0, 3).map((n) => `\n      → ${n.target.join(" ")}`).join("") +
        (v.nodes.length > 3 ? `\n      → …y ${v.nodes.length - 3} nodo(s) más` : "") +
        `\n      ${v.helpUrl}`,
    );
  }

  // Los "incomplete" no bloquean —axe dice que no pudo decidir, no que esté
  // mal— pero se imprimen siempre. Un no-concluyente silencioso es un
  // no-concluyente que nadie revisa nunca.
  for (const i of r.incomplete) {
    noConcluyentes.set(i.id, (noConcluyentes.get(i.id) ?? 0) + i.nodes.length);
  }
}

// ── Guardias de fallo cerrado ───────────────────────────────────────────────
// Si el DOM prestado se degrada —un cambio de happy-dom, un global que ya no
// existe— axe no truena: simplemente evalúa menos reglas y sale limpio. Este
// piso es lo que distingue "el sitio está bien" de "el auditor se quedó ciego".
// Medido al construirlo: 59 reglas ejecutadas sobre las 22 páginas del build.
// Si producción no sirvió NINGUNA ruta del build, no se auditó nada y el
// "0 violaciones" sería del vacío.
if (paginasAuditadas === 0) {
  fatal("ninguna página se pudo auditar.", noServidas.map((n) => `· ${n}`));
}

const PISO_DE_REGLAS = 40;
if (reglasEjecutadas.size < PISO_DE_REGLAS) {
  fatal(
    `solo ${reglasEjecutadas.size} regla(s) de axe llegaron a ejecutarse, y el piso son ${PISO_DE_REGLAS}.`,
    ["el DOM prestado se degradó: axe está evaluando casi nada y saldría limpio por eso"],
  );
}

const declaradas = axe.getRules(ETIQUETAS).map((r) => r.ruleId);
const nuncaCorrieron = declaradas.filter(
  (id) => !reglasEjecutadas.has(id) && !(id in SIN_NAVEGADOR),
);

if (problemas.length > 0 || noServidas.length > 0) {
  console.error("✗ axe-a11y\n");
  for (const p of problemas) console.error(`  · ${p}\n`);
  if (noServidas.length > 0) {
    console.error(`  · ${noServidas.length} ruta(s) del build que ${origen} no sirve, y por eso`);
    console.error(`    quedaron SIN auditar — el despliegue está atrasado respecto al build:`);
    for (const n of noServidas) console.error(`      ${n}`);
    console.error("");
  }
  console.error(`  Hace cumplir: D-032, mc-38, WCAG 2.2 AA`);
  console.error(`  Base legal: EAA vigente desde 2026-06-28 vía EN 301 549;`);
  console.error(`  ADA Título II exige 2.1 AA a escuelas públicas en 2027/2028 (mc-38 §12).`);
  console.error(`  Y recuerda el techo: cero violaciones aquí nunca significó "accesible".`);
  process.exit(1);
}

const donde = origen ?? DIST;
console.log(
  `✓ axe-a11y — ${paginasAuditadas} página(s) en ${donde}, 0 violaciones WCAG 2.2 AA`,
);
console.log(
  `  · ${reglasEjecutadas.size} regla(s) ejecutadas, ${nodosRevisados} nodo(s) aprobados`,
);

console.log(`  · sin navegador real NO se comprobó nada de esto:`);
for (const [id, porque] of Object.entries(SIN_NAVEGADOR)) {
  console.log(`      ${id.padEnd(26)} ${porque}`);
}
console.log(`      foco visible               2.4.7 / 2.4.11 — axe no tiene regla, hay que verlo`);
console.log(`      reflow a 320 px            1.4.10 — depende del viewport`);
console.log(`      estados tras interactuar   menús, diálogos y errores de formulario`);

if (nuncaCorrieron.length > 0) {
  console.log(`  · ${nuncaCorrieron.length} regla(s) que axe trae apagadas por defecto ("needs review"),`);
  console.log(`    así que tampoco cuentan: ${nuncaCorrieron.join(", ")}`);
}
if (hojasNoResueltas.length > 0) {
  console.log(`  · ${hojasNoResueltas.length} hoja(s) de estilo no se pudieron incrustar: ${hojasNoResueltas.join(", ")}`);
  console.log(`    lo oculto por CSS pudo auditarse como visible`);
}
if (noConcluyentes.size > 0) {
  console.log(`  · no concluyentes (axe no pudo decidir, no bloquean):`);
  for (const [id, n] of noConcluyentes) console.log(`      ${id} — ${n} nodo(s)`);
}
console.log(`  · pendiente de revisión humana: lector de pantalla y usuarios reales (F11).`);
console.log(`    La prueba automática ve una fracción de WCAG, aquí y en un navegador.`);
