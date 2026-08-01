#!/usr/bin/env node
// Auditor determinista — contraste WCAG 2.2 AA sobre los tokens de color
//
// Hace cumplir:
//   D-032                   — "contraste" es uno de los deterministas de la flota
//   mc-38 §1.4.3 / §1.4.11  — 4.5:1 texto normal, 3:1 texto grande y gráficos,
//                             "checked against actual palette"
//   docs/guia-de-estilo.md  — la paleta Ignia y lo que puede y no puede hacer
//
// Por qué existe, y por qué no basta con `brand-image.mjs`. Aquél mide la paleta
// cruda contra blanco y negro: es un recordatorio de que el naranja de Ignia da
// 3.03:1 y no sirve para texto chico. Pero el color que llega a la pantalla no es
// la paleta cruda, es el **token semántico**, y un token se define contra un fondo
// concreto que también es un token. `--color-text-muted` sobre `--color-bg` pasa
// con 4.69:1; el mismo gris sobre `--color-surface` —que es apenas 1.07:1 más
// oscuro que el fondo— ya no pasa. Ese margen que se evapora es invisible leyendo
// el CSS y obvio calculándolo, y por eso esto es un auditor y no una revisión.
//
// Qué mide: el producto cruzado de todo primer plano contra todo fondo, en cada
// tema declarado — el claro de `:root` y el oscuro de `prefers-color-scheme`,
// incluidos sus neutros derivados, que no vienen del PDF de Ignia.
//
// Lo que NO puede comprobar, dicho antes de que alguien lo suponga:
//   · **Si el token se usa donde dice su nombre.** Un `--color-text-muted`
//     pintado sobre una imagen, o un `--color-accent` usado como texto de 12 px,
//     pasa por aquí sin ruido. Eso lo ve `axe-a11y` sobre el DOM renderizado (F2).
//   · **Texto sobre imagen, degradados, sombras y transparencias.** Solo se
//     evalúan colores opacos resolubles a hex.
//   · **`color-mix()`, `rgb()`, `oklch()` y `currentColor`.** No se adivinan: un
//     token que no resuelve a hex se reporta como fallo, no se salta en silencio.
//   · **Qué tamaño tiene el texto.** El umbral de 4.5:1 se aplica salvo que el
//     token declare en su propio comentario que solo lleva texto grande.
//
// Uso:  node audits/contrast.mjs [--tabla]

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, extname, relative } from "node:path";

const raiz = new URL("..", import.meta.url).pathname;
const rel = (p) => relative(raiz, p) || p;

// --- Umbrales de WCAG 2.2 AA ----------------------------------------------
// 1.4.3 Contrast (Minimum): 4.5:1 para texto normal, 3:1 para texto grande
// (≥18.66 px negrita o ≥24 px). 1.4.11 Non-text Contrast: 3:1 para gráficos,
// bordes de control y el indicador de foco.
const AA_TEXTO = 4.5;
const AA_GRANDE = 3.0;
const AA_GRAFICO = 3.0;

// --- Luminancia relativa y razón de contraste ------------------------------
// Se implementa aquí en vez de traer una dependencia: son veinte líneas y una
// dependencia de terceros para esto sería peso de mantenimiento sin nada a
// cambio.
//
// Fórmula, WCAG 2.2 §Relative luminance:
//   L = 0.2126·R + 0.7152·G + 0.0722·B
//   donde para cada canal C en [0,1]:
//     C ≤ 0.03928  →  C / 12.92
//     C >  0.03928 →  ((C + 0.055) / 1.055) ^ 2.4
// Y §Contrast ratio:
//   (L1 + 0.05) / (L2 + 0.05), con L1 el más claro de los dos.
//
// El umbral 0.03928 es el de la especificación; sRGB usa 0.04045 y la diferencia
// no cambia ninguna decisión de este auditor. Se deja el de WCAG porque es el que
// implementan las herramientas contra las que alguien va a contrastar estas
// cifras — y una cifra que no reproduce la de axe genera una discusión inútil.
function luminancia(hex) {
  const n = parseInt(hex.slice(1), 16);
  const canales = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * canales[0] + 0.7152 * canales[1] + 0.0722 * canales[2];
}

export function contraste(a, b) {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

const dos = (n) => Math.round(n * 100) / 100;

// --- Lectura del CSS -------------------------------------------------------
// Se recorre `apps/web/src` entero y no solo `tokens.css` a propósito: en F2 cada
// banda traerá su propia capa de tokens (`[data-banda="kinder"]`, un tema de alto
// contraste, lo que sea), y un auditor que solo mira un archivo se queda ciego
// justo cuando aparece lo que tenía que vigilar. Cualquier bloque que declare un
// `--color-*` entra solo, sin tocar este archivo.
const RAIZ_CSS = join(raiz, "apps/web/src");
const TOKENS = join(RAIZ_CSS, "styles/tokens.css");

function archivosCss(dir) {
  const salida = [];
  if (!existsSync(dir)) return salida;
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entrada.name);
    if (entrada.isDirectory()) {
      if (["node_modules", "dist", ".astro"].includes(entrada.name)) continue;
      salida.push(...archivosCss(p));
    } else if (extname(entrada.name) === ".css") {
      salida.push(p);
    }
  }
  // tokens.css primero: define la base que las demás capas sobrescriben.
  return salida.sort((a, b) => (a === TOKENS ? -1 : b === TOKENS ? 1 : a.localeCompare(b)));
}

// Los comentarios se reemplazan por espacios en vez de borrarse, para que los
// desplazamientos y los números de línea sigan siendo los del archivo original.
// El comentario en sí hace falta después: es donde un token declara su excepción.
function sinComentarios(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
}

// Recorrido carácter a carácter en lugar de expresiones regulares por bloque:
// `@media (...) { :root { ... } }` anida, y una regex que anide bien es peor de
// leer que este bucle.
function leerContextos(ruta) {
  const src = readFileSync(ruta, "utf8");
  const limpio = sinComentarios(src);
  const lineas = src.split("\n");

  const contextos = new Map();
  const pila = [];
  let buffer = "";
  let linea = 1;

  const contextoActual = () => {
    const clave = pila.join(" ⟩ ");
    if (!contextos.has(clave)) {
      contextos.set(clave, {
        ruta,
        selector: pila[pila.length - 1] ?? "",
        medias: pila.filter((s) => s.startsWith("@")),
        etiqueta: clave,
        decls: new Map(),
      });
    }
    return contextos.get(clave);
  };

  for (const ch of limpio) {
    if (ch === "\n") linea++;
    if (ch === "{") {
      pila.push(buffer.trim().replace(/\s+/g, " "));
      buffer = "";
    } else if (ch === "}") {
      pila.pop();
      buffer = "";
    } else if (ch === ";") {
      const m = buffer.match(/(--[\w-]+)\s*:\s*([\s\S]+)/);
      if (m && pila.length > 0) {
        const comentario = (lineas[linea - 1] ?? "").match(/\/\*([\s\S]*?)\*\//);
        contextoActual().decls.set(m[1], {
          valor: m[2].trim().replace(/\s+/g, " "),
          linea,
          comentario: comentario ? comentario[1].trim() : "",
        });
      }
      buffer = "";
    } else {
      buffer += ch;
    }
  }
  return [...contextos.values()];
}

// --- Resolución de valores -------------------------------------------------
// Se sigue la cadena de `var(--x)` hasta un hex. Se aceptan #abc y #aabbcc; todo
// lo demás devuelve null y el llamador lo trata como fallo, nunca como ausencia.
function normalizaHex(v) {
  const m = v.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!m) return null;
  const h = m[1];
  return "#" + (h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h).toUpperCase();
}

function resolver(nombre, mapa, vistos = new Set()) {
  if (vistos.has(nombre)) return null;
  vistos.add(nombre);
  const decl = mapa.get(nombre);
  if (!decl) return null;
  const directo = normalizaHex(decl.valor);
  if (directo) return directo;
  const m = decl.valor.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]+))?\)$/);
  if (m) {
    const porVariable = resolver(m[1], mapa, vistos);
    if (porVariable) return porVariable;
    if (m[2]) return normalizaHex(m[2].trim());
  }
  return null;
}

// --- Clasificación de tokens ----------------------------------------------
// Por convención de nombre, que es justo lo que tokens.css dice que hace: "los
// nombres semánticos codifican las restricciones de contraste". Si la convención
// se rompe, el token deja de comprobarse — por eso el auditor exige un mínimo de
// pares al final, para no volverse un escáner que no ve nada.
const esFondo = (n) => /^--color-(bg|surface)(-|$)/.test(n) || /(^|-)(bg|background|surface)$/.test(n);
const esSobre = (n) => /^--color-on-/.test(n);         // texto que va encima de OTRO token
const esTexto = (n) => /^--color-text(-|$)/.test(n);
const esGrafico = (n) => /^--color-(accent|border|icon|focus|ring|stroke|outline)(-|$)/.test(n);

// Una excepción solo vale si está escrita en el propio token. Es la misma regla
// que usa `telemetria-infantil.mjs`: sin la marca no se distingue "revisado y
// acotado" de "se coló".
const soloTextoGrande = (c) => /solo texto grande/i.test(c);
const soloDecorativo = (c) => /solo bordes|decorativ/i.test(c);

// --- Construcción de temas -------------------------------------------------
// Tema = la base de `:root` con una capa encima. El tema claro es la base sola;
// el oscuro es la base más el bloque de `prefers-color-scheme: dark`; en F2, cada
// banda será una capa más y no hay que tocar nada aquí.
function construirTemas(contextos) {
  const esRaiz = (c) => /(^|,)\s*(:root|html)\b/.test(c.selector);
  const base = new Map();
  for (const c of contextos) {
    if (c.medias.length === 0 && esRaiz(c)) {
      for (const [k, v] of c.decls) base.set(k, v);
    }
  }

  const temas = [{ etiqueta: "claro · :root", ruta: TOKENS, mapa: base }];
  for (const c of contextos) {
    if (c.medias.length === 0 && esRaiz(c)) continue;
    if (![...c.decls.keys()].some((k) => k.startsWith("--color-"))) continue;
    const mapa = new Map(base);
    for (const [k, v] of c.decls) mapa.set(k, v);
    temas.push({ etiqueta: c.etiqueta, ruta: c.ruta, mapa });
  }
  return { base, temas };
}

// --- Generación de pares ---------------------------------------------------
// Tres familias, y la tercera es la que evita un falso positivo tonto:
// `--color-on-accent` es blanco, y comparado contra `--color-bg` —también
// blanco— daría 1:1 y un fallo inventado. Un token `--color-on-X` se compara
// solo contra su portador: `--color-X` y sus variantes `--color-X-*`.
function paresDe(tema) {
  const nombres = [...tema.mapa.keys()].filter((n) => n.startsWith("--color-"));
  const fondos = nombres.filter(esFondo);
  const pares = [];

  const anota = (fg, bg, umbral, clase) => pares.push({ fg, bg, umbral, clase });

  for (const fg of nombres) {
    const com = tema.mapa.get(fg).comentario;

    if (esSobre(fg)) {
      const portador = "--color-" + fg.replace(/^--color-on-/, "");
      const carriers = nombres.filter((n) => n === portador || n.startsWith(portador + "-"));
      for (const bg of carriers) {
        anota(fg, bg, soloTextoGrande(com) ? AA_GRANDE : AA_TEXTO,
          soloTextoGrande(com) ? "texto grande (declarado)" : "texto normal");
      }
      continue;
    }

    if (esTexto(fg)) {
      for (const bg of fondos) {
        anota(fg, bg, soloTextoGrande(com) ? AA_GRANDE : AA_TEXTO,
          soloTextoGrande(com) ? "texto grande (declarado)" : "texto normal");
      }
      continue;
    }

    if (esGrafico(fg)) {
      // Un token declarado decorativo no se exime de comprobarse: se comprueba,
      // se reporta como exento y su cifra queda impresa. Una excepción que no se
      // ve en la salida es una excepción que nadie va a revisar nunca.
      for (const bg of fondos) {
        anota(fg, bg, AA_GRAFICO, soloDecorativo(com) ? "exento · decorativo declarado" : "gráfico / control");
      }
    }
  }
  return pares;
}

// --- Ejecución -------------------------------------------------------------
const problemas = [];
const notas = [];

if (!existsSync(TOKENS)) {
  console.error("✗ contrast\n");
  console.error(`  · no existe ${rel(TOKENS)} — no hay tokens que medir.`);
  console.error("    Un escáner que no encuentra qué medir falla; si pasara,");
  console.error("    borrar el archivo volvería verde al auditor.");
  console.error("\n  Hace cumplir: D-032, mc-38 §1.4.3/§1.4.11, docs/guia-de-estilo.md");
  process.exit(1);
}

const archivos = archivosCss(RAIZ_CSS);
const contextos = archivos.flatMap(leerContextos);
const { base, temas } = construirTemas(contextos);

// --- Guardias de "falla cerrado" ------------------------------------------
if (base.size === 0) {
  problemas.push(`${rel(TOKENS)} — ningún token en :root. No hay nada que medir.`);
}
if (!temas.some((t) => /prefers-color-scheme:\s*dark/.test(t.etiqueta))) {
  problemas.push(
    "no se encontró ningún bloque de tema oscuro (prefers-color-scheme: dark). " +
      "El oscuro trae neutros derivados que no están en el PDF de Ignia y son " +
      "exactamente los que nadie verificó a mano; sin ese bloque este auditor " +
      "mide la mitad del producto y no lo dice.",
  );
}

// --- Comprobación de los pares --------------------------------------------
const filas = [];
let exentos = 0;

for (const tema of temas) {
  for (const par of paresDe(tema)) {
    const cf = resolver(par.fg, tema.mapa);
    const cb = resolver(par.bg, tema.mapa);

    // Un color que no resuelve a hex no se salta: se reporta. Saltarlo sería la
    // forma silenciosa de que un `color-mix()` desactive la comprobación.
    if (!cf || !cb) {
      const cual = !cf ? par.fg : par.bg;
      const valor = tema.mapa.get(cual)?.valor ?? "(ausente)";
      problemas.push(
        `[${tema.etiqueta}] ${cual} = "${valor}" no resuelve a un color opaco. ` +
          `Este auditor solo sabe de hex y de var(); si el token tiene que ser así, ` +
          `hay que enseñárselo, no ignorarlo.`,
      );
      continue;
    }

    const razon = contraste(cf, cb);
    const exento = par.clase.startsWith("exento");
    if (exento) exentos++;
    filas.push({ tema: tema.etiqueta, ...par, cf, cb, razon: dos(razon), exento });

    if (!exento && razon < par.umbral) {
      problemas.push(
        `[${tema.etiqueta}] ${par.fg} (${cf}) sobre ${par.bg} (${cb}) — ` +
          `${dos(razon)}:1, exige ${par.umbral}:1 (${par.clase})`,
      );
    }
  }
}

if (filas.length === 0) {
  problemas.push(
    "0 pares de color comprobados. O la convención de nombres de tokens cambió " +
      "(--color-text-*, --color-on-*, --color-bg/--color-surface) o el CSS no se " +
      "está leyendo. Un auditor que no ve nada pasa siempre, así que este falla.",
  );
}

// --- El dato que tiene que seguir vivo -------------------------------------
// El naranja de Ignia da 3.03:1 sobre blanco: alcanza para gráficos y texto
// grande, no para texto normal. No es un defecto a corregir, es un hecho de la
// marca. Si alguien "arregla" el hex para que pase 4.5:1, deja de ser el color de
// Larry y `brand-image.mjs` lo cazará por otro lado; si lo oscurece por debajo de
// 3:1, deja de servir para botones. Se fija el rango, no solo el mínimo.
const NARANJA = "#F36B1C";
const srcTokens = readFileSync(TOKENS, "utf8");
if (!srcTokens.toUpperCase().includes(NARANJA)) {
  problemas.push(
    `${rel(TOKENS)} — el naranja de Ignia ${NARANJA} ya no aparece en los tokens. ` +
      `Es el color de Larry (D-004, docs/guia-de-estilo.md).`,
  );
}
const naranjaSobreBlanco = dos(contraste(NARANJA, "#FFFFFF"));
if (naranjaSobreBlanco >= AA_TEXTO || naranjaSobreBlanco < AA_GRAFICO) {
  problemas.push(
    `${NARANJA} da ${naranjaSobreBlanco}:1 sobre blanco; la guía de estilo y ` +
      `brand-image.mjs asumen 3.03:1 — entre 3:1 y 4.5:1. Cambió la fórmula o ` +
      `cambió el color, y las dos cosas exigen actualizar docs/guia-de-estilo.md.`,
  );
}

// --- La tabla de la guía de estilo no puede mentir -------------------------
// La guía dice de sí misma que sus cifras las calcula un auditor y no están
// escritas a mano. Eso solo es cierto mientras alguien lo comprueba: una tabla de
// contraste desactualizada es peor que ninguna, porque se cita con confianza.
const GUIA = join(raiz, "docs/guia-de-estilo.md");
if (!existsSync(GUIA)) {
  problemas.push("no existe docs/guia-de-estilo.md — es la fuente de la paleta.");
} else {
  const filasGuia = [
    ...readFileSync(GUIA, "utf8").matchAll(
      /^\|\s*`(#[0-9A-Fa-f]{6})`[^|]*\|\s*\**([\d.]+)\**\s*\|\s*\**([\d.]+)\**\s*\|/gm,
    ),
  ];
  if (filasGuia.length < 5) {
    problemas.push(
      `docs/guia-de-estilo.md — se leyeron ${filasGuia.length} filas de la tabla de ` +
        `contraste y deberían ser al menos 5. Si la tabla cambió de formato, este ` +
        `control quedó ciego y hay que arreglar el patrón, no bajarlo.`,
    );
  }
  for (const [, hex, blanco, negro] of filasGuia) {
    const h = hex.toUpperCase();
    const realBlanco = dos(contraste(h, "#FFFFFF"));
    const realNegro = dos(contraste(h, "#000000"));
    if (Math.abs(realBlanco - Number(blanco)) > 0.01 || Math.abs(realNegro - Number(negro)) > 0.01) {
      problemas.push(
        `docs/guia-de-estilo.md — ${h} está documentado como ${blanco}/${negro} ` +
          `(blanco/negro) y da ${realBlanco}/${realNegro}.`,
      );
    }
  }
}

// La separación entre fondo y superficie no es un fallo de contraste: WCAG 1.4.11
// pide 3:1 a los bordes que identifican un componente, no a dos superficies
// contiguas que ya llevan borde. Se imprime porque es el número que alguien va a
// querer discutir, y es mejor tenerlo a la vista que descubrirlo en la revisión.
for (const tema of temas) {
  const bg = resolver("--color-bg", tema.mapa);
  const sf = resolver("--color-surface", tema.mapa);
  if (bg && sf) notas.push(`${tema.etiqueta}: superficie contra fondo ${dos(contraste(sf, bg))}:1 — separación, nunca texto`);
}

// --- Salida ----------------------------------------------------------------
if (process.argv.includes("--tabla")) {
  console.log("\nContraste de los tokens semánticos (WCAG 2.2 AA)\n");
  let temaActual = "";
  for (const f of filas.sort((a, b) => a.tema.localeCompare(b.tema) || a.fg.localeCompare(b.fg))) {
    if (f.tema !== temaActual) {
      temaActual = f.tema;
      console.log(`── ${temaActual}`);
    }
    const veredicto = f.exento ? "exento" : f.razon >= f.umbral ? "✓" : "✗";
    console.log(
      `  ${veredicto} ${f.fg.padEnd(26)} sobre ${f.bg.padEnd(22)} ` +
        `${String(f.razon).padStart(6)}:1  (exige ${f.umbral}) ${f.clase}`,
    );
  }
  console.log();
  for (const n of notas) console.log(`  · ${n}`);
  console.log();
  process.exit(0);
}

if (problemas.length > 0) {
  console.error("✗ contrast\n");
  for (const p of problemas) console.error(`  · ${p}`);
  console.error(`\n  Umbrales: ${AA_TEXTO}:1 texto normal · ${AA_GRANDE}:1 texto grande · ${AA_GRAFICO}:1 gráficos y controles`);
  console.error(`  Un token solo baja a ${AA_GRANDE}:1 si su propia declaración dice "solo texto grande".`);
  console.error(`\n  Hace cumplir: D-032, mc-38 §1.4.3/§1.4.11, docs/guia-de-estilo.md`);
  process.exit(1);
}

const medidos = filas.filter((f) => !f.exento);
const ajustado = medidos.reduce((a, b) => (b.razon / b.umbral < a.razon / a.umbral ? b : a), medidos[0]);

console.log(`✓ contrast — ${filas.length} par(es) en ${temas.length} tema(s), ninguno por debajo de su umbral`);
console.log(`  · el más ajustado: ${ajustado.fg} sobre ${ajustado.bg} — ${ajustado.razon}:1 (exige ${ajustado.umbral}) [${ajustado.tema}]`);
console.log(`  · recordatorio: ${NARANJA} da ${naranjaSobreBlanco}:1 sobre blanco — gráficos y texto grande, nunca texto normal`);
if (exentos > 0) {
  for (const f of filas.filter((x) => x.exento)) {
    console.log(`  · exento por declaración: ${f.fg} sobre ${f.bg} — ${f.razon}:1 (${f.clase}) [${f.tema}]`);
  }
}
for (const n of notas) console.log(`  · ${n}`);
console.log(`  · pendiente de F2: que el token se use donde dice su nombre lo ve axe-a11y sobre el DOM, no esto`);
