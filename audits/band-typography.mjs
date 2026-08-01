#!/usr/bin/env node
// Auditor determinista — la tipografía por banda, y quién habla en qué voz
//
// Hace cumplir: D-036, D-031, `mc-20` (3-6 años), `mc-21` (7-11), `mc-22` (12-17),
// `mc-38` (accesibilidad y diferencias de aprendizaje).
//
// Por qué existe. D-036 resolvió la tensión T-8, que fue la primera que levantó
// la flota adversarial y no una persona: `guia-de-estilo.md` fijaba Raleway y
// D-031 exigía "tipografía del sistema" por plataforma. En el mismo elemento no
// pueden ser ciertas a la vez.
//
// La resolución: **la marca habla en Raleway, los controles en la voz del
// sistema.** Un botón, un campo y la navegación usan `--font-sistema`; los
// títulos y el cuerpo de la marca usan `--font-marca`. Eso no es gusto: la voz
// del sistema es la que el usuario ya reconoce como "control con el que se
// interactúa", y en iOS y Android trae además el ajuste de tamaño accesible del
// sistema operativo, que `mc-38` pide respetar.
//
// La otra mitad es el TAMAÑO por banda. `mc-20` documenta que en 3-6 años el
// texto tiene que ser sustancialmente mayor, y `mc-22` que en adolescentes un
// tamaño infantil se lee como condescendencia y se abandona. Un solo tamaño para
// las tres bandas falla en las tres.
//
// LO QUE NO PUEDE COMPROBAR: cómo se ve. El contraste lo mide `contrast.mjs`, el
// desbordamiento real necesita un navegador, y si una fuente se siente infantil
// o adulta lo juzga una persona.

import { archivos, leer, informar, SOLO_PRODUCTO } from "./lib/repo.mjs";

/** Los controles: lo que tiene que hablar en la voz del sistema (D-036). */
const SELECTOR_DE_CONTROL = /(^|[\s,{])(button|input|select|textarea|nav|\[role=["']?(button|tab|menuitem))/i;

const estilos = archivos(/\.(css|astro|svelte|vue)$/).filter((f) => SOLO_PRODUCTO.test(f));
const problemas = [];
const notas = [];
let bloques = 0;

for (const archivo of estilos) {
  const texto = leer(archivo) ?? "";

  // `@font-face` es donde la familia SE DECLARA, y ahí el literal es obligatorio:
  // `font-family: "Raleway"` dentro de un @font-face es el nombre que después
  // resuelve `--font-marca`. Marcarlo bloqueaba el único sitio que no puede
  // usar la variable, que es la definición de la variable misma.
  const sinFontFace = texto.replace(/@font-face\s*\{[^}]*\}/gi, "");

  // Una familia literal en vez de la variable: es la forma de saltarse D-036 sin
  // darse cuenta, porque el resultado se ve bien en la máquina de quien lo escribe.
  for (const m of sinFontFace.matchAll(/font-family\s*:\s*([^;}]+)[;}]/gi)) {
    bloques++;
    const valor = m[1].trim();
    // Cualquier token `--font-*` vale. La regla no es "usa una de estas tres
    // variables", es "usa un token y no un literal": `--font-sans` es un alias
    // de `--font-marca` y exigir la lista cerrada lo marcaba como violación.
    if (/var\(\s*--font-/.test(valor)) continue;
    if (/^(inherit|initial|unset|revert)$/i.test(valor)) continue;
    problemas.push(
      `${archivo}: \`font-family: ${valor.slice(0, 60)}\` literal. D-036 fija dos voces y ` +
        "dos variables: `--font-marca` para la marca, `--font-sistema` para los controles. " +
        "Una familia literal se ve bien en la máquina de quien la escribe y se salta el " +
        "ajuste de tamaño accesible del sistema (mc-38).",
    );
  }

  // Un control con la voz de la marca: al revés de D-036.
  const reglas = [...sinFontFace.matchAll(/([^{}]+)\{([^}]*)\}/g)];
  for (const [, selector, cuerpo] of reglas) {
    if (!SELECTOR_DE_CONTROL.test(selector)) continue;
    if (/var\(\s*--font-marca/.test(cuerpo)) {
      problemas.push(
        `${archivo}: el selector \`${selector.trim().slice(0, 50)}\` usa --font-marca. ` +
          "D-036: los controles y la navegación hablan en la voz del sistema. Raleway es la " +
          "marca; un botón en Raleway deja de parecer un control del sistema operativo.",
      );
    }
  }

  // Tamaño en px absoluto para texto: rompe el ajuste del usuario.
  for (const m of texto.matchAll(/font-size\s*:\s*(\d+)px/gi)) {
    const px = Number(m[1]);
    if (px > 0 && px < 32) {
      notas.push(`${archivo}: font-size ${px}px absoluto — rem respeta el ajuste del usuario (mc-38)`);
    }
  }
}

notas.unshift(`${bloques} declaración(es) de font-family revisadas`);
notas.push("el tamaño POR BANDA (mc-20 / mc-21 / mc-22) todavía no se puede comprobar: no hay bandas en la interfaz");

informar({
  nombre: "band-typography",
  problemas,
  notas: notas.slice(0, 6),
  cita: "D-036, D-031, mc-20, mc-21, mc-22, mc-38",
  revisados: estilos.length,
  resumen: `${estilos.length} archivo(s) de estilo`,
  porQueBloquea:
    "la voz del sistema es la que el usuario reconoce como control, y trae el ajuste de " +
    "tamaño accesible del sistema operativo que mc-38 pide respetar.",
  noComprueba: [
    "cómo se ve. El contraste lo mide contrast.mjs; el desbordamiento necesita un navegador; " +
      "si una fuente se siente infantil o adulta lo juzga una persona.",
  ],
});
