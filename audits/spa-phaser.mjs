#!/usr/bin/env node
// Auditor determinista — la interfaz del niño es Phaser, nunca HTML
//
// Hace cumplir: D-201, D-200.2, línea de arquitectura de CLAUDE.md § SPA.
//
// ─── Por qué existe ────────────────────────────────────────────────────────
//
// D-201 fija que toda superficie que ve un niño es una ESCENA de Phaser dentro
// de la sesión única de la SPA, y que cualquier pantalla que se encuentre en
// HTML se migra. La regla no nació de una preferencia estética: nació de una
// sesión entera de defectos en cadena, todos consecuencia del mismo atajo.
//
// `game/spa/puente-pin.ts` extraía el `<main>` de `kids/pin.astro` y lo
// transplantaba a un `<div>` sobre el canvas — patrón que D-200.1 declaró a
// propósito ("no se reescribe como Phaser: se REUSA tal cual"). Lo que siguió:
// un overlay transparente que dejaba ver el canvas de "¿quién juega?" a través
// del PIN; el CSS de la pantalla que nunca llegaba (Astro emite el `<style>`
// grande como `<link rel=stylesheet>` y el puente solo clonaba `<style>`); y
// franjas blancas laterales de 41 pt que no se reprodujeron en Chrome a ningún
// ancho y quedaron SIN causa raíz identificada. Un `<canvas>` de Phaser llena
// el viewport por definición: la mitad de esos defectos no existen si la
// pantalla es una escena.
//
// ─── Las dos formas de romper la regla, y por qué se vigilan las DOS ────────
//
// Vigilar solo las páginas dejaría abierta la puerta por la que el proyecto ya
// se salió una vez: la página existe, se ve bien, y alguien la mete al canvas
// con `cloneNode`. Y vigilar solo el transplante dejaría la otra: una pantalla
// nueva de niño servida como página suelta, fuera de la sesión de Phaser.
//
// ─── Nace ROJO, y eso es el diseño ─────────────────────────────────────────
//
// Tres páginas de `app/kids/` incumplen la regla el día que esto se escribe.
// Van declaradas abajo con su issue, vía `separarDeuda`: bloquean lo NUEVO
// desde el primer commit, y el día que una se migra su renglón queda rancio y
// el propio auditor exige borrarlo. Es el mecanismo que `lib/repo.mjs` ya
// documenta para un guardián que nace con el producto roto — la alternativa
// (no registrarlo hasta que todo esté limpio) es cómo seis auditores acabaron
// fallando abiertos sin que nadie lo supiera.

import { archivos, leer, informar, separarDeuda } from "./lib/repo.mjs";

// Marcado que solo tiene sentido si la página PINTA una interfaz. `<div>` no
// entra: el contenedor donde monta el canvas es un `<div>`, así que exigirlo
// sería exigir que la isla no exista.
const MARCADO_DE_INTERFAZ = [
  { re: /<button\b/i, que: "un <button> propio" },
  { re: /<form\b/i, que: "un <form> propio" },
  { re: /<input\b/i, que: "un <input> propio" },
  { re: /<main\b/i, que: "un <main> con interfaz propia" },
  { re: /<style\b/i, que: "un bloque <style> propio" },
];

// Una página que monta una isla de Phaser declara su componente. El nombre
// `*Mount.astro` es la convención real del repo (`QuienJuegaMount`,
// `HistoriaMount`) — no una heurística inventada aquí.
const MONTA_ISLA = /import\s+\w*Mount\s+from|<\w*Mount\b/;

// Transplantar DOM ajeno al canvas. `extraerFragmento` es la función del
// enrutador que sirve para eso y para nada más.
const TRANSPLANTE = [
  { re: /\bextraerFragmento\s*\(/, que: "extraerFragmento() — DOM de otra página traído al canvas" },
  { re: /\.cloneNode\s*\(\s*true\s*\)/, que: "cloneNode(true) — se está copiando un árbol de DOM ajeno" },
  { re: /createElement\s*\(\s*["'](?:button|form|input|select|textarea)["']/, que: "createElement de un control de formulario" },
];

/**
 * La capa de accesibilidad de D-185 es DOM a propósito, y no contradice D-201:
 * es un camino PARALELO y completo para calificar, nunca la implementación
 * principal metida encima del canvas. La distinción es la regla entera de
 * D-201, así que se nombra el archivo en vez de aflojar el patrón.
 */
const ACCESIBILIDAD_DECLARADA = [/AccessibleReto\.ts$/];

const DEUDA = [
  {
    id: "app/kids/jugar.astro",
    issue: "D-201, sin fase asignada",
    porQue:
      "sendero de racha y franja de liga en HTML — encontrado por este auditor, todavía sin plan de migración",
  },
  {
    id: "app/kids/retos.astro",
    issue: "D-201, sin fase asignada",
    porQue:
      "el marcador de posición de Retos (D-190) nació en HTML — todavía sin plan de migración",
  },
];

const problemas = [];
const notas = [];
let revisados = 0;

// --- 1. Ninguna página de niño pinta su propia interfaz ----------------------
const paginas = archivos(/^apps\/web\/src\/pages\/.*\/app\/kids\/.*\.astro$/);
if (paginas.length === 0) {
  problemas.push(
    "0 páginas encontradas bajo app/kids/ — el patrón de rutas cambió y este auditor dejó de vigilar la " +
      "superficie que existe para vigilar",
  );
}
for (const ruta of paginas) {
  const crudo = leer(ruta);
  if (crudo === null) {
    problemas.push(`${ruta}: no se pudo leer`);
    continue;
  }
  revisados++;
  if (MONTA_ISLA.test(crudo)) continue;

  const hallados = MARCADO_DE_INTERFAZ.filter(({ re }) => re.test(crudo)).map(({ que }) => que);
  if (hallados.length > 0) {
    problemas.push(
      `${ruta} pinta interfaz propia (${hallados.join(", ")}) y no monta ninguna isla de Phaser. ` +
        "D-201: toda pantalla de niño es una ESCENA. Una página de niño solo puede montar la isla " +
        "(`*Mount.astro`) o redirigir al SPA.",
    );
  }
}

// --- 2. Nadie transplanta DOM ajeno al canvas -------------------------------
const juego = archivos(/^apps\/web\/src\/game\/.*\.ts$/).filter(
  (f) => !ACCESIBILIDAD_DECLARADA.some((re) => re.test(f)),
);
if (juego.length === 0) {
  problemas.push("0 archivos de apps/web/src/game/ — el patrón cambió y la mitad 2 no vigila nada");
}
for (const ruta of juego) {
  const crudo = leer(ruta);
  if (crudo === null) continue;
  revisados++;
  for (const { re, que } of TRANSPLANTE) {
    if (re.test(crudo)) {
      problemas.push(
        `${ruta}: ${que}. D-201 prohíbe transplantar HTML sobre el canvas — costó una sesión de ` +
          "defectos en cadena (overlay transparente, CSS que no llegaba, franjas de 41 pt sin causa " +
          "raíz). Construye la pantalla como escena de Phaser.",
      );
    }
  }
}

const { bloquean, conocidos } = separarDeuda(problemas, DEUDA);
notas.push(`${paginas.length} página(s) de app/kids/ y ${juego.length} archivo(s) de game/ revisados`);
for (const c of conocidos) notas.push(c);

informar({
  nombre: "spa-phaser",
  problemas: bloquean,
  notas,
  cita: "D-201, D-200.2, CLAUDE.md § SPA",
  revisados,
  resumen: "ninguna pantalla de niño nueva nace en HTML, y nadie transplanta DOM sobre el canvas",
  porQueBloquea:
    "una pantalla de niño servida como HTML —o metida al canvas con cloneNode— reintroduce la clase " +
    "entera de defectos de D-200.1: overlay transparente, CSS que no llega, franjas laterales sin " +
    "causa raíz. Un canvas de Phaser llena el viewport por definición; el HTML encima no.",
  noComprueba: [
    "el HTML de respaldo de una página que SÍ monta su isla — si monta la isla, su marcado se trata como respaldo y no se juzga aquí",
    "que la escena de Phaser esté bien terminada (fondo ilustrado, Larry, sonido) — eso es la guía de estilo y el ojo del dueño, no un barrido",
    "los `.astro` de adulto: D-201 cubre la superficie del niño, y el sitio público sigue siendo HTML a propósito",
  ],
});
