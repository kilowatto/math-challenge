#!/usr/bin/env node
// Auditor determinista — un script inline no puede llevar TypeScript
//
// Hace cumplir: la trampa de Astro que rompió la entrada con passkey en
// producción. D-032.
//
// ─── El bug ────────────────────────────────────────────────────────────────
//
// Astro compila los `<script>` normales: puedes escribir TypeScript y llega
// JavaScript al navegador. **Pero `is:inline` los saca de ese camino, y
// `define:vars` implica `is:inline`.** Un script con `define:vars` viaja tal
// cual, y si lleva `as HTMLButtonElement | null` el navegador lanza
// `SyntaxError` y **mata el script entero**.
//
// No falla el build. No falla el despliegue. No falla ningún auditor. La página
// se pinta perfecta y el JavaScript simplemente no existe.
//
// Estaba en producción en CINCO archivos:
//
//   · `Entrar.astro` — el botón de passkey nunca aparecía. El dueño lo reportó
//     como «no me pide la passkey ni con botón», y la causa no era la passkey.
//   · `pin.astro` — la pantalla donde el niño toca sus tres dibujos.
//   · `Registro.astro`, `PerfilNuevo.astro`, `reto-demo.astro`.
//
// `npx astro check` sí lo decía: `ts(8016) Type assertion expressions can only
// be used in TypeScript files`. Estaba entre 31 errores que se venían
// descartando como ruido preexistente, y no era ruido: era una página de
// autenticación sin JavaScript.
//
// LO QUE NO PUEDE COMPROBAR: que el JavaScript sea correcto. Un script sin
// TypeScript puede estar igual de roto por otra razón; lo que esto atrapa es la
// clase concreta que no deja rastro.

import { archivos, leer, informar, SOLO_PRODUCTO } from "./lib/repo.mjs";

// Un script es INLINE si lo declara, o si usa `define:vars` — que lo implica.
const ES_INLINE = /\bis:inline\b|\bdefine:vars\b/;

/** Las formas de TypeScript que un navegador no entiende. */
const FORMAS = [
  [/\bas\s+(?:HTML\w+|[A-Z]\w+)(?:\s*<[^>]*>)?(?:\s*\|\s*\w+)*/g, "aserción `as Tipo`"],
  [/\(\s*\w+\s*:\s*(?:string|number|boolean|unknown|any|HTML\w+|ArrayBuffer|Uint8Array)\b/g, "anotación de parámetro `: Tipo`"],
  [/\b(?:const|let|var)\s+\w+\s*:\s*(?:string|number|boolean|HTML\w+)\b/g, "anotación de variable `: Tipo`"],
  [/\binterface\s+\w+\s*\{/g, "`interface`"],
  [/\bsatisfies\s+\w+/g, "`satisfies`"],
  [/[?!]\s*:\s*\w+\s*[,)]/g, "parámetro opcional tipado"],
];

const problemas = [];
const notas = [];
let inlines = 0;

const fuentes = archivos(/\.astro$/).filter((f) => SOLO_PRODUCTO.test(f));

for (const archivo of fuentes) {
  const texto = leer(archivo) ?? "";
  for (const m of texto.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const atributos = m[1];
    const cuerpo = m[2];
    if (!ES_INLINE.test(atributos)) continue;
    inlines++;

    // Los comentarios sí pueden hablar de tipos: se quitan antes de mirar.
    const codigo = cuerpo
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

    const halladas = [];
    for (const [re, nombre] of FORMAS) {
      const hit = codigo.match(re);
      if (hit) halladas.push(`${nombre} (${hit[0].trim().slice(0, 40)})`);
    }
    if (halladas.length > 0) {
      const linea = texto.slice(0, m.index).split("\n").length;
      problemas.push(
        `${archivo}:${linea}: un script inline lleva TypeScript — ${halladas.join(", ")}. ` +
          "`define:vars` implica `is:inline`, y los scripts inline NO se compilan: esto viaja " +
          "tal cual al navegador, que lanza `SyntaxError` y **mata el script entero**. No falla " +
          "el build, no falla el despliegue, y la página se pinta perfecta sin JavaScript.",
      );
    }
  }
}

notas.push(`${inlines} script(s) inline revisados en ${fuentes.length} archivo(s) .astro`);
notas.push(
  "Un `<script>` SIN `is:inline` ni `define:vars` sí admite TypeScript: Astro lo compila. " +
    "La regla es solo para los inline.",
);
notas.push(
  "NO comprobado aquí: que el JavaScript sea correcto. Esto atrapa la clase que no deja rastro, " +
    "no los demás errores.",
);

informar({
  nombre: "script-cliente-sin-ts",
  problemas,
  notas,
  resumen: `${inlines} script(s) inline`,
  cita: "Astro `is:inline`, D-032",
  porQueBloquea:
    "Un script inline con TypeScript no falla en ningún sitio: llega roto al navegador y la " +
    "página queda sin JavaScript. Así estuvo la entrada con passkey en producción.",
});
