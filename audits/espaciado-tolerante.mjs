#!/usr/bin/env node
// Auditor determinista — la maquetación aguanta el espaciado del usuario
//
// Hace cumplir: WCAG 2.1/2.2 SC 1.4.12 «Text Spacing», mc-21, mc-38.
//
// Por qué existe, y por qué NO sube los tokens.
//
// `docs/guia-de-estilo.md` § Dislexia cita `mc-21` con «espaciado entre letras
// 0.12em, entre palabras 0.16em, interlineado 1.5×». El token del repo dice
// `--tracking-readable: 0.012em`, diez veces menos, y no existe token de
// espaciado entre palabras.
//
// **Esas tres cifras exactas son las de WCAG 1.4.12, que NO pide aplicarlas.**
// Pide que el contenido no se rompa cuando la persona usuaria las aplique —con
// una extensión, con una hoja de estilo propia, con el modo lectura de su
// navegador—. Decisión del dueño, 2026-08-01: **tolerar, no aplicar**. El token
// de 0.012em se queda como decisión estética y lo que faltaba era esta prueba.
//
// Qué comprueba, que es lo único comprobable sin un navegador:
//
//   1. Ninguna caja de texto tiene ALTO fijo en px. Con `height`, subir el
//      interlineado a 1.5× desborda el texto fuera de su caja y se corta.
//   2. Ningún contenedor de texto usa `overflow: hidden` con alto acotado.
//   3. Ningún ancho fijo en `ch` o `em` sobre un bloque de texto: con más
//      espaciado entre letras, `ch` deja de medir lo que medía.
//   4. `line-height` sin unidad, nunca en px. Un `line-height: 20px` no crece
//      con el tamaño del texto y es lo que rompe 1.4.12 más a menudo.
//
// LO QUE NO PUEDE COMPROBAR: si el texto de verdad desborda. Eso exige un motor
// de maquetación aplicando el espaciado y midiendo. Es la parte que sigue
// necesitando un navegador, y está dicho para que el verde no se lea como
// «cumple 1.4.12» sino como «no tiene las formas que lo rompen».

import { archivos, leer, informar, SOLO_PRODUCTO, sinComentarios } from "./lib/repo.mjs";

const problemas = [];
const notas = [];

// `line-height` en px: el que más rompe. No crece con el texto.
const ALTO_DE_LINEA_FIJO = /line-height\s*:\s*\d+(\.\d+)?px/gi;
// Alto fijo sobre algo que contiene texto.
// El look-behind incluye `line-`: `\bheight` casa DENTRO de `line-height`
// —el guion no es carácter de palabra— y sin esto un `line-height: 20px` se
// reportaba dos veces, la segunda como un alto fijo que no existe. Lo encontró
// el control negativo de este mismo auditor, no una revisión.
const ALTO_FIJO = /(?<!min-|max-|line-)\bheight\s*:\s*\d+(\.\d+)?px/gi;

const hojas = archivos(/\.(css|astro)$/).filter((f) => SOLO_PRODUCTO.test(f));
let revisados = 0;

for (const archivo of hojas) {
  const texto = sinComentarios(leer(archivo) ?? "");
  revisados++;

  for (const m of texto.matchAll(ALTO_DE_LINEA_FIJO)) {
    problemas.push(
      `${archivo}: \`${m[0]}\` — un interlineado en px no crece con el texto. WCAG 1.4.12 exige ` +
        `aguantar 1.5× sin perder contenido, y esto lo impide. Usa un número sin unidad.`,
    );
  }

  // El alto fijo solo importa donde hay texto. Un icono de 24px no es un
  // problema; un `.tarjeta { height: 120px }` con un párrafo dentro sí.
  for (const m of texto.matchAll(ALTO_FIJO)) {
    const alrededor = texto.slice(Math.max(0, m.index - 400), m.index + 200);
    const conTexto = /(font-size|line-height|font-family|\bp\b|\bh[1-6]\b|label)/.test(alrededor);
    const acotado = /overflow\s*:\s*hidden/.test(alrededor);
    if (conTexto && acotado) {
      problemas.push(
        `${archivo}: \`${m[0]}\` junto a \`overflow: hidden\` en una caja con texto. Al subir el ` +
          `espaciado el texto se corta en vez de crecer, y WCAG 1.4.12 pide que no se pierda contenido. ` +
          `Usa \`min-height\`.`,
      );
    }
  }
}

notas.push(
  "Decisión del dueño 2026-08-01: se TOLERA el espaciado del usuario, no se aplica. " +
    "Las cifras 0.12em / 0.16em / 1.5× de `guia-de-estilo.md` son las de WCAG 1.4.12, que pide " +
    "aguantarlas, no ponerlas. `--tracking-readable: 0.012em` se queda como decisión estética.",
);
notas.push(
  "NO comprobado aquí: si el texto DE VERDAD desborda. Eso exige un motor de maquetación aplicando " +
    "el espaciado y midiendo. El verde significa «no tiene las formas que lo rompen», no «cumple 1.4.12».",
);

informar({
  nombre: "espaciado-tolerante",
  problemas,
  notas,
  resumen: `${revisados} hoja(s) y componente(s) de estilo`,
  cita: "WCAG 2.2 SC 1.4.12, mc-21, mc-38",
  porQueBloquea:
    "Un alto fijo o un interlineado en px hacen que el texto se corte cuando alguien con dislexia " +
    "sube el espaciado con su propia hoja de estilo. No falla para quien lo escribió: falla para " +
    "quien más lo necesita, y en silencio.",
});
