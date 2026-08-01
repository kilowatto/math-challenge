#!/usr/bin/env node
// Auditor determinista — blancos táctiles por banda
//
// Hace cumplir:
//   mc-38 / WCAG 2.2 AA 2.5.8 — 24×24 px CSS, el piso absoluto, para todos
//   mc-38 §tabla / HIG de Apple — 44 px para interfaz de menores de 8
//   mc-20 §201 — 88 px en KINDER: 23.7 mm es el tamaño con el que un niño de 4
//                años acierta el 90% de las veces, casi el doble del mínimo de
//                Apple. No es un capricho de diseño, es motricidad medida.
//   D-017 — qué banda es cada edad (KINDER 4-6, PRIMARIA 7-11, ...)
//
// Por qué existe, y por qué existe ANTES que la interfaz que vigila.
//
// El 88 se pierde solo. Un diseñador que ya interiorizó "44 es el mínimo de
// Apple" pone 44 en kinder de buena fe, la pantalla se ve perfectamente bien en
// su monitor, y el error solo aparece cuando un niño de 4 años falla la mitad de
// los taps — que es exactamente el momento en el que ya nadie va a atribuir el
// problema al tamaño del botón. Un número que solo vive en un documento de
// investigación no sobrevive seis meses.
//
// De ahí la forma de este archivo: el motor de medición y la escalera de bandas
// están completos y probados contra casos sintéticos que corren SIEMPRE, aunque
// los componentes por banda sean F2. La lógica no espera a la interfaz; espera
// a tener qué medir. Lo que hoy sí mide de verdad son los tokens de
// `apps/web/src/styles/tokens.css` y los blancos táctiles reales del layout.
//
// LO QUE ESTE AUDITOR NO PUEDE COMPROBAR, dicho de frente para que nadie
// suponga que sí:
//   · El ancho renderizado. Se mide el eje de bloque (alto), que la hoja de
//     estilo sí determina; el ancho de un enlace depende del texto traducido y
//     de la fuente que efectivamente cargó. Eso exige navegador — es el trabajo
//     de `axe-a11y` en F2, no de éste.
//   · El espaciado entre blancos vecinos. WCAG 2.5.8 acepta un blanco menor a
//     24 px si hay 24 px de separación libre; medir eso exige geometría real.
//     Aquí se exige el tamaño, que es el camino estricto y el único estático.
//   · La fuente de respaldo. Si Raleway no carga, la caja de línea cambia de
//     alto. Por eso un blanco que llega al piso SOLO por `line-height` es más
//     frágil que uno con `min-block-size` declarado, y el reporte lo dice.
//   · Estilos en línea (`style="..."`) y clases calculadas en JavaScript.
//   · La cadena de imports de Astro: se asume que toda hoja de
//     `src/styles/` es global. Es permisivo a propósito y está anotado.
//
// Uso:  node audits/touch-targets.mjs [--casos]

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const raiz = new URL("..", import.meta.url).pathname;

// --- La escalera de pisos, por banda (D-017) ------------------------------
// Las bandas de adulto y la superficie pública se quedan en el piso de WCAG:
// no hay evidencia de que un adulto necesite más, y exigirlo de más convertiría
// al auditor en una opinión de diseño disfrazada de accesibilidad.
const PISOS = {
  PUBLICO:    { px: 24, fuente: "WCAG 2.2 AA 2.5.8 (mc-38)" },
  SERIO:      { px: 24, fuente: "WCAG 2.2 AA 2.5.8 (mc-38)" },
  JR:         { px: 24, fuente: "WCAG 2.2 AA 2.5.8 (mc-38)" },
  PRO:        { px: 24, fuente: "WCAG 2.2 AA 2.5.8 (mc-38)" },
  SECUNDARIA: { px: 44, fuente: "HIG de Apple, 44pt (mc-38)" },
  PRIMARIA:   { px: 44, fuente: "HIG de Apple + mc-38 '≥44px para menores de 8'" },
  KINDER:     { px: 88, fuente: "mc-20 §201 — 23.7mm, 90% de acierto a los 4 años" },
};

// Los tokens que tienen que existir en tokens.css, con su piso. Un token que no
// existe es peor que uno mal puesto: obliga a cada componente a inventar su
// propio número, y ahí es donde reaparece el 44 en kinder.
const TOKENS_ESPERADOS = [
  ["--tap-min",      24, "WCAG 2.2 AA 2.5.8 — piso absoluto (mc-38)"],
  ["--tap-primaria", 44, "HIG de Apple, 44pt (mc-38)"],
  ["--tap-kinder",   88, "mc-20 §201 — 23.7mm a los 4 años"],
];

// ==========================================================================
// Motor: CSS
// ==========================================================================

const sinComentarios = (txt) => txt.replace(/\/\*[\s\S]*?\*\//g, "");

function parseDecls(cuerpo) {
  const decls = new Map();
  for (const trozo of cuerpo.split(";")) {
    const corte = trozo.indexOf(":");
    if (corte === -1) continue;
    const prop = trozo.slice(0, corte).trim().toLowerCase();
    const valor = trozo.slice(corte + 1).trim();
    if (!prop || /[{}]/.test(prop) || !valor) continue;
    decls.set(prop, valor);
  }
  return decls;
}

// Aplana las reglas, incluidas las de dentro de @media: una regla dentro de
// `prefers-color-scheme: dark` sigue siendo una regla que puede cambiar el alto
// de un botón, y no verla sería exactamente el tipo de ceguera que este repo ya
// pagó una vez con `secrets.mjs`.
export function parseCss(texto) {
  const reglas = [];
  const recorrer = (s) => {
    let i = 0;
    while (i < s.length) {
      const abre = s.indexOf("{", i);
      if (abre === -1) break;
      const prefijo = s.slice(i, abre).trim();
      let nivel = 1;
      let j = abre + 1;
      while (j < s.length && nivel > 0) {
        if (s[j] === "{") nivel++;
        else if (s[j] === "}") nivel--;
        j++;
      }
      const cuerpo = s.slice(abre + 1, j - 1);
      if (prefijo.startsWith("@")) {
        if (/^@(media|supports|layer|container|scope)\b/i.test(prefijo)) recorrer(cuerpo);
      } else if (prefijo) {
        const decls = parseDecls(cuerpo);
        for (const sel of prefijo.split(",").map((t) => t.trim()).filter(Boolean)) {
          reglas.push({ selector: sel, decls });
        }
      }
      i = j;
    }
  };
  recorrer(sinComentarios(texto));
  return reglas;
}

// Los tokens salen de :root y de html, que es donde se declaran las variables
// globales. Se resuelven recursivamente porque un token puede apuntar a otro.
export function tokensDe(reglas) {
  const tokens = new Map();
  for (const r of reglas) {
    if (!/^(:root|html)$/i.test(r.selector.trim())) continue;
    for (const [prop, valor] of r.decls) {
      if (prop.startsWith("--")) tokens.set(prop, valor);
    }
  }
  return tokens;
}

// Unidades absolutas. `em`, `%`, `ch`, `vw` quedan fuera a propósito: dependen
// del contexto y un auditor que las adivine miente con confianza.
const UNIDADES = { px: 1, rem: 16, pt: 4 / 3, pc: 16, mm: 96 / 25.4, cm: 96 / 2.54, in: 96, q: 96 / 101.6 };

export function resolverLongitud(valor, tokens, profundidad = 0) {
  if (valor == null || profundidad > 8) return null;
  const v = String(valor).trim().replace(/\s*!important\s*$/i, "");
  const usoVar = /^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]+))?\)$/.exec(v);
  if (usoVar) {
    const referido = tokens.get(usoVar[1]);
    if (referido != null) return resolverLongitud(referido, tokens, profundidad + 1);
    return usoVar[2] ? resolverLongitud(usoVar[2], tokens, profundidad + 1) : null;
  }
  const num = /^(-?\d*\.?\d+)([a-z]*)$/i.exec(v);
  if (!num) return null;
  const n = parseFloat(num[1]);
  const u = num[2].toLowerCase();
  if (!u) return n === 0 ? 0 : null;
  return u in UNIDADES ? n * UNIDADES[u] : null;
}

function resolverNumero(valor, tokens, profundidad = 0) {
  if (valor == null || profundidad > 8) return null;
  const v = String(valor).trim();
  const usoVar = /^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]+))?\)$/.exec(v);
  if (usoVar) {
    const referido = tokens.get(usoVar[1]);
    if (referido != null) return resolverNumero(referido, tokens, profundidad + 1);
    return usoVar[2] ? resolverNumero(usoVar[2], tokens, profundidad + 1) : null;
  }
  return /^-?\d*\.?\d+$/.test(v) ? parseFloat(v) : null;
}

// ==========================================================================
// Motor: emparejar selectores contra una cadena de ancestros
// ==========================================================================

// Una regla que solo aplica en :hover o :focus no describe el blanco táctil en
// reposo, y es justamente el truco con el que un botón chico parece cumplir.
const PSEUDO_DE_ESTADO = /:(hover|focus|focus-within|focus-visible|active|target|checked|disabled|visited)\b/i;

function compilarCompuesto(txt) {
  const spec = { tag: null, clases: [], id: null, attrs: [], universal: txt.trim() === "*" };
  const re = /(\*)|(\[[^\]]*\])|(::?[\w-]+(?:\([^)]*\))?)|(\.[\w-]+)|(#[\w-]+)|([\w-]+)/g;
  let m;
  while ((m = re.exec(txt)) !== null) {
    const t = m[0];
    if (t === "*" || t.startsWith(":")) continue;
    if (t.startsWith("[")) {
      const a = /^\[\s*([\w:-]+)\s*(?:([~|^$*]?=)\s*["']?([^"'\]]*)["']?\s*)?\]$/.exec(t);
      if (a) spec.attrs.push({ nombre: a[1].toLowerCase(), op: a[2] || null, valor: a[3] ?? null });
      continue;
    }
    if (t.startsWith(".")) { spec.clases.push(t.slice(1)); continue; }
    if (t.startsWith("#")) { spec.id = t.slice(1); continue; }
    spec.tag = t.toLowerCase();
  }
  return spec;
}

function coincideCompuesto(spec, el) {
  if (!el) return false;
  // Un compuesto que no dejó nada concreto (`:root`, `::before`) no se toma como
  // "coincide con todo": eso haría que las declaraciones de :root se aplicaran a
  // cada elemento y el auditor vería tamaños que no existen.
  if (!spec.universal && !spec.tag && spec.clases.length === 0 && !spec.id && spec.attrs.length === 0) return false;
  if (spec.tag && spec.tag !== el.tag) return false;
  if (spec.id && spec.id !== el.attrs.get("id")) return false;
  for (const c of spec.clases) if (!el.clases.includes(c)) return false;
  for (const a of spec.attrs) {
    if (!el.attrs.has(a.nombre)) return false;
    if (a.op === null) continue;
    const real = String(el.attrs.get(a.nombre));
    if (a.op === "=" && real !== a.valor) return false;
    if (a.op === "~=" && !real.split(/\s+/).includes(a.valor)) return false;
  }
  return true;
}

// `cadena` va de la raíz al elemento. El emparejado es de derecha a izquierda y
// sin retroceso: alcanza para los selectores que este repo escribe (descendiente
// e hijo directo), y no pretende ser un motor de CSS.
export function coincideSelector(selector, cadena) {
  if (PSEUDO_DE_ESTADO.test(selector)) return false;
  const partes = selector.trim().split(/\s*(>)\s*|\s+/).filter(Boolean);
  if (partes.length === 0) return false;

  let i = partes.length - 1;
  let idx = cadena.length - 1;
  if (partes[i] === ">") return false;
  if (!coincideCompuesto(compilarCompuesto(partes[i]), cadena[idx])) return false;
  i--; idx--;

  let hijoDirecto = false;
  while (i >= 0) {
    if (partes[i] === ">") { hijoDirecto = true; i--; continue; }
    const spec = compilarCompuesto(partes[i]);
    if (hijoDirecto) {
      if (idx < 0 || !coincideCompuesto(spec, cadena[idx])) return false;
      idx--; hijoDirecto = false; i--;
    } else {
      let encontrado = false;
      while (idx >= 0) {
        const actual = cadena[idx];
        idx--;
        if (coincideCompuesto(spec, actual)) { encontrado = true; break; }
      }
      if (!encontrado) return false;
      i--;
    }
  }
  return true;
}

// ==========================================================================
// Motor: leer el marcado
// ==========================================================================

const VACIOS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

const ROLES_INTERACTIVOS = new Set([
  "button", "link", "checkbox", "radio", "switch", "tab", "option", "slider",
  "spinbutton", "textbox", "combobox", "menuitem", "menuitemcheckbox", "menuitemradio",
]);

// La excepción "Inline" de WCAG 2.5.8: un enlace dentro de una frase no puede
// crecer sin romper el párrafo, y la norma lo exime. Un `li` de navegación NO
// entra aquí — no es una frase, es una lista de destinos, y ahí sí se exige.
const CONTENEDORES_DE_FRASE = new Set(["p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "figcaption", "dd", "dt", "td", "th", "label"]);

export function parseMarkup(texto) {
  let s = texto.replace(/^---[\s\S]*?\n---/, "");
  const estilos = [];
  s = s.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, cuerpo) => { estilos.push(cuerpo); return ""; });
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  s = s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

  const pila = [];
  const interactivos = [];
  const reTag = /<(\/?)([a-zA-Z][\w.:-]*)((?:"[^"]*"|'[^']*'|`[^`]*`|[^>"'`])*?)(\/?)>/g;
  let m;
  while ((m = reTag.exec(s)) !== null) {
    const cierra = m[1] === "/";
    const nombre = m[2];
    const crudoAttrs = m[3] || "";
    const autoCierra = m[4] === "/";
    // Un componente de Astro (`<Base>`) no emite un elemento con ese nombre; se
    // mantiene en la pila para no desbalancearla, pero nunca casa con CSS.
    const esComponente = /^[A-Z]/.test(nombre);
    const tag = esComponente ? null : nombre.toLowerCase();

    if (cierra) {
      for (let k = pila.length - 1; k >= 0; k--) {
        if (pila[k].nombre === nombre) { pila.length = k; break; }
      }
      continue;
    }

    const attrs = new Map();
    const reAttr = /([\w@:.\-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^{}]*)\}|([^\s>]+)))?/g;
    let a;
    while ((a = reAttr.exec(crudoAttrs)) !== null) {
      const clave = a[1].toLowerCase();
      const valor = a[2] ?? a[3] ?? a[4] ?? a[5] ?? "";
      attrs.set(clave, valor);
    }
    const clases = (attrs.get("class") || "").split(/\s+/).filter((c) => /^[\w-]+$/.test(c));
    const el = { nombre, tag, attrs, clases };

    const cadena = [...pila, el];
    if (!esComponente && esInteractivo(el)) {
      interactivos.push({ cadena, exento: exentoPorFrase(cadena) });
    }
    if (!autoCierra && !VACIOS.has(tag ?? "")) pila.push(el);
  }

  return { interactivos, estilos };
}

function esInteractivo(el) {
  const rol = (el.attrs.get("role") || "").toLowerCase();
  if (ROLES_INTERACTIVOS.has(rol)) return true;
  if (el.tag === "a") return el.attrs.has("href");
  if (["button", "select", "textarea", "summary"].includes(el.tag)) return true;
  if (el.tag === "input") return (el.attrs.get("type") || "text").toLowerCase() !== "hidden";
  for (const k of el.attrs.keys()) if (/^(on[a-z]+|@click|on:click)$/i.test(k)) return true;
  return false;
}

function exentoPorFrase(cadena) {
  const el = cadena[cadena.length - 1];
  if (el.tag !== "a") return false;
  if (el.attrs.has("role")) return false;
  const padre = cadena[cadena.length - 2];
  return !!padre && CONTENEDORES_DE_FRASE.has(padre.tag ?? "");
}

// ==========================================================================
// Motor: medir el blanco táctil en el eje de bloque
// ==========================================================================

// Dos reglas distintas, y las dos importan:
//   · Entre reglas, para una MISMA propiedad, gana la última. Es una
//     aproximación de la cascada — no modela especificidad — pero evita el error
//     grande: que una regla posterior que encoge el blanco quede tapada por una
//     anterior que lo agrandaba.
//   · Entre propiedades distintas se toma el MÁXIMO, porque ésa es la semántica
//     real de CSS: `min-block-size` es un piso que gana sobre un `height` menor.
function ultimaLongitud(aplicables, props, tokens) {
  let mejor = null;
  let declarada = false;
  for (const p of props) {
    let ultima = null;
    let vista = false;
    for (const r of aplicables) {
      if (!r.decls.has(p)) continue;
      vista = true;
      ultima = resolverLongitud(r.decls.get(p), tokens);
    }
    if (!vista) continue;
    declarada = true;
    if (ultima != null && (mejor == null || ultima > mejor)) mejor = ultima;
  }
  return { valor: mejor, declarada };
}

function paddingDeBloque(aplicables, tokens) {
  let arriba = null;
  let abajo = null;
  let declarado = false;
  const partir = (v) => v.split(/\s+/).map((x) => resolverLongitud(x, tokens));
  for (const r of aplicables) {
    if (r.decls.has("padding")) {
      declarado = true;
      const v = partir(r.decls.get("padding"));
      arriba = v[0];
      abajo = v.length >= 3 ? v[2] : v[0];
    }
    if (r.decls.has("padding-block")) {
      declarado = true;
      const v = partir(r.decls.get("padding-block"));
      arriba = v[0];
      abajo = v.length > 1 ? v[1] : v[0];
    }
    for (const p of ["padding-block-start", "padding-top"]) {
      if (r.decls.has(p)) { declarado = true; arriba = resolverLongitud(r.decls.get(p), tokens); }
    }
    for (const p of ["padding-block-end", "padding-bottom"]) {
      if (r.decls.has(p)) { declarado = true; abajo = resolverLongitud(r.decls.get(p), tokens); }
    }
  }
  if (!declarado) return 0;
  if (arriba == null || abajo == null) return null;
  return arriba + abajo;
}

// La caja de línea es lo que hace que un enlace con padding llegue al piso sin
// declarar altura. Se calcula solo con valores realmente escritos en el CSS —
// si `font-size` o `line-height` no se pueden resolver, se devuelve null y el
// blanco se considera sin tamaño conocido, no "probablemente suficiente".
function cajaDeLinea(aplicables, reglas, tokens) {
  const heredables = reglas.filter((r) => /^(body|html)$/i.test(r.selector.trim()));
  const fuente = [...heredables, ...aplicables];

  const fs = ultimaLongitud(fuente, ["font-size"], tokens).valor;
  if (fs == null) return null;

  let lh = null;
  for (const r of fuente) {
    if (!r.decls.has("line-height")) continue;
    const crudo = r.decls.get("line-height");
    const comoNumero = resolverNumero(crudo, tokens);
    lh = comoNumero != null ? comoNumero * fs : resolverLongitud(crudo, tokens);
  }
  if (lh == null) return null;
  return lh;
}

export function medir(cadena, reglas, tokens) {
  const aplicables = reglas.filter((r) => coincideSelector(r.selector, cadena));
  const declarado = ultimaLongitud(aplicables, ["min-block-size", "min-height", "block-size", "height"], tokens);
  const padding = paddingDeBloque(aplicables, tokens);
  const linea = cajaDeLinea(aplicables, reglas, tokens);

  const candidatos = [];
  if (declarado.valor != null) candidatos.push({ px: declarado.valor, via: "declarado" });
  if (padding != null && linea != null) candidatos.push({ px: padding + linea, via: "padding + línea" });

  if (candidatos.length === 0) {
    return { px: null, via: null, reglas: aplicables.length, fragil: true };
  }
  const mejor = candidatos.reduce((a, b) => (b.px > a.px ? b : a));
  return { px: mejor.px, via: mejor.via, reglas: aplicables.length, fragil: declarado.valor == null };
}

// ==========================================================================
// Bandas
// ==========================================================================

// Hoy ningún archivo declara banda, porque no hay componentes por banda: es F2.
// La convención se fija aquí de antemano — un marcador `@banda KINDER` en el
// archivo, o un segmento de ruta — para que el primer componente de kinder ya
// nazca vigilado en vez de esperar a que alguien recuerde ampliar el auditor.
export function bandaDe(ruta, texto) {
  const marca = /@banda\s+([A-Za-z]+)/.exec(texto);
  if (marca) {
    const b = marca[1].toUpperCase();
    if (b in PISOS) return b;
  }
  const seg = /[/\\](kinder|primaria|secundaria|serio|jr|pro)[/\\]/i.exec(ruta);
  if (seg) return seg[1].toUpperCase();
  return "PUBLICO";
}

// ==========================================================================
// Casos sintéticos — la parte que hoy no tiene qué medir en el repo
// ==========================================================================
//
// Corren SIEMPRE, no solo con --casos. Un auditor cuya lógica principal duerme
// hasta F2 y no se prueba contra nada es un archivo que nadie sabe si funciona
// el día que despierta. Si un caso se pone rojo, el auditor falla aunque el repo
// esté impecable: significa que el motor se rompió, y un motor roto pasa todo.

const TOKENS_DE_PRUEBA = `
:root {
  --tap-min: 24px;
  --tap-primaria: 48px;
  --tap-kinder: 88px;
}
body { font-size: 1rem; line-height: 1.6; }
`;

const CASOS = [
  {
    nombre: "KINDER a 48px reprueba el piso de 88",
    ruta: "src/components/kinder/Boton.astro",
    css: ".chip { min-block-size: var(--tap-primaria); }",
    markup: `<div><button class="chip">7</button></div>`,
    espera: "falla",
  },
  {
    nombre: "KINDER a 88px pasa",
    ruta: "src/components/kinder/Boton.astro",
    css: ".chip { min-block-size: var(--tap-kinder); }",
    markup: `<div><button class="chip">7</button></div>`,
    espera: "pasa",
  },
  {
    nombre: "KINDER declarado por marcador @banda, no por ruta",
    ruta: "src/components/Chip.astro",
    css: ".chip { min-block-size: 60px; }",
    markup: `<!-- @banda KINDER --><div><button class="chip">7</button></div>`,
    marcaBanda: "KINDER",
    espera: "falla",
  },
  {
    nombre: "SECUNDARIA a 32px reprueba el piso de 44 (HIG)",
    ruta: "src/components/secundaria/Chip.astro",
    css: ".chip { min-block-size: 32px; }",
    markup: `<div><button class="chip">x</button></div>`,
    espera: "falla",
  },
  {
    nombre: "SECUNDARIA a 44px pasa",
    ruta: "src/components/secundaria/Chip.astro",
    css: ".chip { min-block-size: 44px; }",
    markup: `<div><button class="chip">x</button></div>`,
    espera: "pasa",
  },
  {
    nombre: "PUBLICO a 24px pasa (piso de WCAG)",
    ruta: "src/layouts/X.astro",
    css: ".b { min-block-size: var(--tap-min); }",
    markup: `<div><button class="b">ok</button></div>`,
    espera: "pasa",
  },
  {
    nombre: "PUBLICO a 20px reprueba WCAG 2.5.8",
    ruta: "src/layouts/X.astro",
    css: ".b { min-block-size: 20px; line-height: 1; font-size: 10px; padding: 0; }",
    markup: `<div><button class="b">ok</button></div>`,
    espera: "falla",
  },
  {
    nombre: "44pt de Apple se convierte a 58.67px y pasa en PRIMARIA",
    ruta: "src/components/primaria/Chip.astro",
    css: ".b { min-block-size: 44pt; }",
    markup: `<div><button class="b">ok</button></div>`,
    espera: "pasa",
  },
  {
    nombre: "23.7mm de mc-20 pasa el piso de KINDER",
    ruta: "src/components/kinder/Chip.astro",
    css: ".b { min-block-size: 23.7mm; }",
    markup: `<div><button class="b">ok</button></div>`,
    espera: "pasa",
  },
  {
    // El :focus va DESPUÉS del estado en reposo, que es como se escribe CSS de
    // verdad. Si el filtro de pseudo-estados se rompiera, este caso se pondría
    // verde por la cascada y el auditor aprobaría un botón de 12px que solo
    // crece cuando ya lo tocaste.
    nombre: "una regla solo de :focus no cuenta como tamaño en reposo",
    ruta: "src/layouts/X.astro",
    css: ".b { min-block-size: 12px; font-size: 8px; line-height: 1; padding: 0; } .b:focus { min-block-size: 88px; }",
    markup: `<div><button class="b">ok</button></div>`,
    espera: "falla",
  },
  {
    // La otra mitad de la cascada: una regla posterior que ENCOGE el blanco no
    // puede quedar tapada por una anterior que lo agrandaba.
    nombre: "una regla posterior que encoge el blanco manda sobre la anterior",
    ruta: "src/layouts/X.astro",
    css: ".b { min-block-size: 88px; font-size: 8px; line-height: 1; padding: 0; } .b { min-block-size: 16px; }",
    markup: `<div><button class="b">ok</button></div>`,
    espera: "falla",
  },
  {
    // Y la semántica entre propiedades: min-block-size es un piso, gana sobre
    // un height menor declarado en la misma regla.
    nombre: "min-block-size gana sobre un height menor en la misma regla",
    ruta: "src/layouts/X.astro",
    css: ".b { height: 10px; min-block-size: 44px; }",
    markup: `<div><button class="b">ok</button></div>`,
    espera: "pasa",
  },
  {
    nombre: "padding + caja de línea llega al piso sin declarar altura",
    ruta: "src/layouts/X.astro",
    css: ".b { padding: 0.5rem 1rem; }",
    markup: `<div><a class="b" href="/x">saltar</a></div>`,
    espera: "pasa",
  },
  {
    nombre: "un enlace dentro de un párrafo está exento (excepción Inline)",
    ruta: "src/layouts/X.astro",
    css: "",
    markup: `<p>texto <a href="/x">enlace</a> más texto</p>`,
    espera: "exento",
  },
  {
    nombre: "un enlace de navegación en un li NO está exento: se mide y reprueba",
    ruta: "src/layouts/X.astro",
    css: "nav a { font-size: 10px; line-height: 1; padding: 0; }",
    markup: `<nav><ul><li><a href="/x">ES</a></li></ul></nav>`,
    espera: "falla",
  },
  {
    nombre: "el mismo enlace chico dentro de una frase sí queda exento",
    ruta: "src/layouts/X.astro",
    css: "p a { font-size: 10px; line-height: 1; padding: 0; }",
    markup: `<p>ver <a href="/x">esto</a></p>`,
    espera: "exento",
  },
  {
    nombre: "un botón sin ninguna regla de tamaño no se presume suficiente",
    ruta: "src/layouts/X.astro",
    css: ".otra { min-block-size: 99px; }",
    markup: `<div><button class="b">ok</button></div>`,
    cssSinHerencia: true,
    espera: "falla",
  },
  {
    nombre: "un var() a un token inexistente no se resuelve y no salva al blanco",
    ruta: "src/layouts/X.astro",
    css: ".b { min-block-size: var(--tap-inventado); font-size: 8px; line-height: 1; padding: 0; }",
    markup: `<div><button class="b">ok</button></div>`,
    espera: "falla",
  },
  {
    nombre: "[role=button] en un div cuenta como blanco táctil",
    ruta: "src/components/kinder/Tarjeta.astro",
    css: ".t { min-block-size: 40px; }",
    markup: `<div class="t" role="button" tabindex="0">carta</div>`,
    espera: "falla",
  },
];

function correrCasos() {
  const resultados = [];
  for (const caso of CASOS) {
    const base = caso.cssSinHerencia ? ":root { --tap-min: 24px; }" : TOKENS_DE_PRUEBA;
    const reglas = parseCss(base + "\n" + caso.css);
    const tokens = tokensDe(reglas);
    const banda = bandaDe(caso.ruta, caso.markup);
    const { interactivos } = parseMarkup(caso.markup);

    let veredicto;
    if (interactivos.length === 0) {
      veredicto = "sin-blancos";
    } else {
      const t = interactivos[0];
      if (t.exento) veredicto = "exento";
      else {
        const m = medir(t.cadena, reglas, tokens);
        veredicto = m.px != null && m.px >= PISOS[banda].px ? "pasa" : "falla";
      }
    }
    const bandaEsperada = caso.marcaBanda ?? null;
    const bandaOk = bandaEsperada == null || banda === bandaEsperada;
    resultados.push({ nombre: caso.nombre, banda, esperado: caso.espera, veredicto, ok: veredicto === caso.espera && bandaOk });
  }
  return resultados;
}

// ==========================================================================
// Auditoría del repo de hoy
// ==========================================================================

function hojasGlobales() {
  const dir = join(raiz, "apps/web/src/styles");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".css"))
    .map((f) => join(dir, f));
}

function archivosDeInterfaz() {
  const salida = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
    cwd: raiz,
    encoding: "utf8",
  });
  return salida
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((f) => /^apps\/.*\.(astro|html)$/.test(f))
    .filter((f) => !/^apps\/[^/]+\/(node_modules|dist|\.astro)\//.test(f));
}

const problemas = [];
const notas = [];

// --- 0. Los casos sintéticos, antes que nada -----------------------------
const casos = correrCasos();
const casosRojos = casos.filter((c) => !c.ok);

if (process.argv.includes("--casos")) {
  console.log("\nCasos sintéticos de touch-targets\n");
  for (const c of casos) {
    console.log(
      `  ${c.ok ? "✓" : "✗"} [${c.banda.padEnd(10)}] esperado ${c.esperado.padEnd(10)} obtuvo ${c.veredicto.padEnd(10)} ${c.nombre}`,
    );
  }
  console.log(`\n  ${casos.length - casosRojos.length}/${casos.length} verdes\n`);
  process.exit(casosRojos.length > 0 ? 1 : 0);
}

for (const c of casosRojos) {
  problemas.push(`caso sintético "${c.nombre}" [${c.banda}]: esperaba ${c.esperado}, obtuvo ${c.veredicto}. El motor de medición está roto, y un motor roto aprueba todo.`);
}

// --- 1. Los tokens de blanco táctil --------------------------------------
const RUTA_TOKENS = join(raiz, "apps/web/src/styles/tokens.css");
let tokens = new Map();
let reglasGlobales = [];

if (!existsSync(RUTA_TOKENS)) {
  problemas.push(`no existe ${RUTA_TOKENS.replace(raiz, "")} — sin tokens no hay piso que comprobar, y un auditor sin qué medir falla, no pasa.`);
} else {
  for (const hoja of hojasGlobales()) reglasGlobales.push(...parseCss(readFileSync(hoja, "utf8")));
  tokens = tokensDe(reglasGlobales);

  for (const [nombre, piso, fuente] of TOKENS_ESPERADOS) {
    if (!tokens.has(nombre)) {
      problemas.push(`falta el token ${nombre} en tokens.css. Sin él, cada componente inventa su propio número y el 88 de kinder se pierde. Piso: ${piso}px — ${fuente}.`);
      continue;
    }
    const px = resolverLongitud(tokens.get(nombre), tokens);
    if (px == null) {
      problemas.push(`${nombre} = "${tokens.get(nombre)}" no resuelve a una longitud absoluta. Un blanco táctil en em o % depende del contexto: nadie puede afirmar que mide ${piso}px.`);
      continue;
    }
    if (px < piso) {
      problemas.push(`${nombre} = ${px}px, por debajo de su piso de ${piso}px — ${fuente}.`);
    }
  }

  // Cualquier --tap-* nuevo también tiene que resolver y respetar el piso de WCAG.
  for (const [nombre, valor] of tokens) {
    if (!/^--tap-/.test(nombre)) continue;
    if (TOKENS_ESPERADOS.some(([n]) => n === nombre)) continue;
    const px = resolverLongitud(valor, tokens);
    if (px == null) problemas.push(`${nombre} = "${valor}" no resuelve a una longitud absoluta.`);
    else if (px < PISOS.PUBLICO.px) problemas.push(`${nombre} = ${px}px, por debajo del piso absoluto de ${PISOS.PUBLICO.px}px de WCAG 2.5.8.`);
  }

  // La escalera tiene que subir. Un --tap-kinder menor que --tap-primaria es la
  // forma silenciosa de que kinder acabe con blancos de adulto.
  const escalera = ["--tap-min", "--tap-primaria", "--tap-kinder"]
    .map((n) => ({ n, px: resolverLongitud(tokens.get(n), tokens) }))
    .filter((x) => x.px != null);
  for (let i = 1; i < escalera.length; i++) {
    if (escalera[i].px < escalera[i - 1].px) {
      problemas.push(`la escalera de blancos baja: ${escalera[i].n} (${escalera[i].px}px) es menor que ${escalera[i - 1].n} (${escalera[i - 1].px}px). D-017 ordena las bandas de menor a mayor edad; el blanco táctil va al revés.`);
    }
  }
}

// --- 2. Los blancos táctiles que ya existen ------------------------------
const archivos = archivosDeInterfaz();
if (archivos.length === 0) {
  problemas.push("0 archivos de interfaz escaneados. Un escáner que no ve nada pasa siempre — revisa el patrón de archivos.");
}

let totalBlancos = 0;
let totalExentos = 0;
let totalFragiles = 0;
const porBanda = new Map();

for (const archivo of archivos) {
  let texto;
  try {
    texto = readFileSync(join(raiz, archivo), "utf8");
  } catch {
    continue;
  }
  const { interactivos, estilos } = parseMarkup(texto);
  if (interactivos.length === 0) continue;

  const banda = bandaDe(archivo, texto);
  const piso = PISOS[banda];
  porBanda.set(banda, (porBanda.get(banda) ?? 0) + interactivos.length);

  const reglas = [...reglasGlobales, ...estilos.flatMap((c) => parseCss(c))];

  for (const { cadena, exento } of interactivos) {
    const el = cadena[cadena.length - 1];
    const donde = `${el.nombre}${el.clases.length ? "." + el.clases.join(".") : ""}`;
    if (exento) { totalExentos++; continue; }
    totalBlancos++;

    const m = medir(cadena, reglas, tokens);
    if (m.px == null) {
      problemas.push(`${archivo} · <${donde}> — blanco táctil sin tamaño de bloque determinable (${m.reglas} regla(s) aplicables). Banda ${banda}, piso ${piso.px}px — ${piso.fuente}.`);
      continue;
    }
    if (m.px < piso.px) {
      problemas.push(`${archivo} · <${donde}> — ${m.px.toFixed(1)}px en el eje de bloque, por debajo de ${piso.px}px. Banda ${banda} — ${piso.fuente}.`);
      continue;
    }
    if (m.fragil) {
      totalFragiles++;
      notas.push(`${archivo} · <${donde}> — llega a ${m.px.toFixed(1)}px por ${m.via}, sin min-block-size. Pasa, pero depende de que cargue la fuente correcta.`);
    }
  }
}

if (totalBlancos === 0 && problemas.length === 0) {
  problemas.push("0 blancos táctiles no exentos encontrados en toda la interfaz. Eso no es una interfaz limpia, es un escáner ciego: falla cerrado.");
}

// --- 3. Veredicto --------------------------------------------------------
if (problemas.length > 0) {
  console.error("✗ touch-targets\n");
  for (const p of problemas) console.error(`  · ${p}`);
  console.error(`\n  Hace cumplir: D-017, mc-20, mc-38`);
  console.error(`  Pisos: 24px WCAG 2.2 AA 2.5.8 · 44px HIG de Apple · 88px KINDER.`);
  console.error(`  Los 88px de kinder salen de motricidad medida: a los 4 años el`);
  console.error(`  90% de acierto llega en 23.7mm, casi el doble del mínimo de Apple`);
  console.error(`  (mc-20 §201). No es una preferencia de diseño y no se negocia`);
  console.error(`  para que quepan más botones en pantalla.`);
  process.exit(1);
}

const bandasVistas = [...porBanda.entries()].map(([b, n]) => `${b}:${n}`).join(" ");
const conBanda = [...porBanda.keys()].filter((b) => b !== "PUBLICO");

console.log(`✓ touch-targets — ${totalBlancos} blanco(s) táctil(es) ≥ su piso de banda, ${totalExentos} exento(s) por la excepción Inline`);
console.log(`  · tokens: ${TOKENS_ESPERADOS.map(([n]) => `${n}=${resolverLongitud(tokens.get(n), tokens)}px`).join(" · ")}`);
console.log(`  · pisos: 24px WCAG 2.5.8 · 44px HIG de Apple · 88px KINDER (mc-20)`);
console.log(`  · ${casos.length}/${casos.length} casos sintéticos verdes (node audits/touch-targets.mjs --casos)`);
console.log(`  · escaneado: ${archivos.length} archivo(s) de interfaz · ${bandasVistas || "ninguna banda con blancos"}`);
if (conBanda.length === 0) {
  console.log(`  · INACTIVO hasta F2: ningún archivo declara banda todavía, así que todo`);
  console.log(`    se juzga como PUBLICO con el piso de 24px. Los ejes de 44px y 88px`);
  console.log(`    están escritos y probados contra los casos sintéticos, pero no tienen`);
  console.log(`    qué medir hasta que existan los componentes por banda.`);
  console.log(`    Convención lista de antemano: marcador "@banda KINDER" en el archivo,`);
  console.log(`    o un segmento de ruta src/components/kinder/.`);
}
for (const n of notas) console.log(`  · frágil: ${n}`);
console.log(`  · no comprueba: ancho renderizado, espaciado entre blancos vecinos, ni`);
console.log(`    estilos aplicados desde JavaScript. Eso es navegador — axe-a11y, F2.`);
