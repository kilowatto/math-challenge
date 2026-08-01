#!/usr/bin/env node
// Auditor determinista — Turnstile jamás delante de un niño
//
// Hace cumplir: línea roja #1 (nunca navegador bloqueado, a NADIE, en ninguna
// banda), línea roja #2 (el niño no es un usuario), D-054, criterio #113 de F2.
//
// Por qué existe, y por qué no basta con la promesa que ya está escrita.
//
// D-054 y el criterio #113 afirman los dos que Turnstile «no roza la línea roja
// #1» porque es defensa de bots y no verificación de edad ni biometría. Eso es
// cierto **de dónde está puesto hoy**: un formulario de registro que llena un
// adulto. Deja de serlo en el momento en que alguien lo pone en otro sitio.
//
// Turnstile es casi siempre invisible, pero **puede** mostrar un desafío
// interactivo cuando su heurística duda. Delante de un adulto eso es una casilla
// que se marca. Delante de un niño de cuatro años que no lee es una pantalla que
// no se puede pasar — es decir, un navegador bloqueado con otro nombre, que es
// exactamente lo que la línea roja #1 prohíbe.
//
// Y no hace falta mala fe para llegar ahí. Basta con que alguien reutilice el
// componente del formulario, o que la superficie del niño crezca hasta compartir
// un layout. Por eso la frontera se sostiene con un auditor y no con un párrafo.
//
// Lo que NO comprueba: si Turnstile aparece en una pantalla que un adulto abre
// pero un niño está mirando. Eso no se puede leer del código.

import { archivos, leer, informar, SOLO_PRODUCTO, palabra, sinComentarios } from "./lib/repo.mjs";

/** Cómo se reconoce a Turnstile en el código, en cualquiera de sus formas. */
const HAY_TURNSTILE =
  /(cf-turnstile|challenges\.cloudflare\.com|turnstile\.render|TURNSTILE_SITE_KEY|data-sitekey)/i;

/**
 * Qué es una superficie de niño.
 *
 * Por RUTA —el árbol `app/kids/`, que D-012 define como la superficie donde el
 * niño entra— y por CONTENIDO, porque el árbol todavía no existe y un auditor
 * que solo mire rutas pasaría en verde hasta el día en que ya fuera tarde.
 */
const RUTA_DE_NINO = /(^|\/)(kids|ninos|app\/kids)(\/|$)/i;

/**
 * Marcas de contenido de superficie de niño.
 *
 * `palabra()` y no `\b` a secas: en JavaScript `\b` NO trata `_` como frontera,
 * así que `/\bkinder\b/` no casa con `KINDER_PLACEMENT`. Ese bug apareció tres
 * veces en este repositorio antes de que `palabra()` existiera.
 */
const MARCAS_DE_NINO = [
  "KINDER",
  "child_profile",
  "childProfileId",
  "pin-imagenes",
  "rejillaDe",
  "app/kids",
];

const fuentes = archivos(/\.(astro|tsx|jsx|svelte|vue|ts|js|mjs|html)$/).filter((f) =>
  SOLO_PRODUCTO.test(f),
);

const problemas = [];
const notas = [];
let conTurnstile = 0;

for (const archivo of fuentes) {
  // Este archivo habla de Turnstile para prohibirlo; excluirlo no es una
  // excepción cómoda, es no morderse la cola.
  if (archivo.endsWith("turnstile-solo-adulto.mjs")) continue;

  const crudo = leer(archivo) ?? "";
  if (!HAY_TURNSTILE.test(crudo)) continue;

  // Los comentarios se quitan antes de buscar marcas de superficie de niño.
  // Sin esto el auditor se caza a sí mismo: `turnstile.ts` menciona `app/kids/`
  // en el párrafo que explica por qué Turnstile NO puede ir ahí, y un guardián
  // que castiga documentar su propia regla se acaba anulando por costumbre.
  //
  // El código SÍ se mira entero — un `if (esKinder)` sigue siendo código.
  const texto = sinComentarios(crudo);
  conTurnstile++;

  if (RUTA_DE_NINO.test(archivo)) {
    problemas.push(
      `${archivo}: Turnstile en una superficie de niño (por la ruta). ` +
        `Puede mostrar un desafío interactivo, y delante de un niño de cuatro años que no lee ` +
        `eso es un navegador bloqueado — línea roja #1, que no admite banda ni excepción.`,
    );
    continue;
  }

  const marcas = MARCAS_DE_NINO.filter((m) => palabra(m).test(texto));
  if (marcas.length > 0) {
    problemas.push(
      `${archivo}: Turnstile en un archivo con marcas de superficie de niño (${marcas.join(", ")}). ` +
        `Turnstile es defensa de bots sobre un formulario de ADULTO (D-054). Si este archivo ` +
        `sirve a las dos superficies, sepáralas: la frontera no puede depender de una condición ` +
        `en tiempo de ejecución que alguien invierta sin querer.`,
    );
  }
}

notas.push(
  conTurnstile === 0
    ? "todavía no hay Turnstile en el código; el auditor está listo para el primero"
    : `${conTurnstile} archivo(s) usan Turnstile, ninguno en superficie de niño`,
);
notas.push(
  "Turnstile NO es verificación de edad ni biometría: no pide permisos del navegador " +
    "y no resuelve un desafío visual. Por eso no cruza la línea roja #1 donde está hoy (D-054).",
);
notas.push(
  "NO comprobado aquí: si un niño está mirando la pantalla de un adulto. Eso no se lee del código.",
);

informar({
  nombre: "turnstile-solo-adulto",
  problemas,
  notas,
  resumen: `${fuentes.length} archivo(s) de producto, ${conTurnstile} con Turnstile`,
  cita: "línea roja #1, línea roja #2, D-054, criterio #113",
  porQueBloquea:
    "Turnstile puede mostrar un desafío interactivo. Delante de un adulto es una casilla; " +
    "delante de un niño que no lee es una pantalla que no se puede pasar, o sea un navegador " +
    "bloqueado — y la línea roja #1 no admite banda ni excepción.",
});
