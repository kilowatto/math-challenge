#!/usr/bin/env node
// Auditor de regresión para interacción y composición móvil del reto.

import { leer, informar, sinComentarios } from "./lib/repo.mjs";

const pantalla = sinComentarios(leer("apps/web/src/components/reto/Pantalla.astro") ?? "");
const css = sinComentarios(leer("apps/web/src/styles/reto.css") ?? "");
const sendero = sinComentarios(leer("apps/web/src/components/racha/SenderoRacha.astro") ?? "");
const problemas = [];
const notas = [];

if (!/closest\(["']button, a, input, select, textarea["']\)/.test(pantalla)) problemas.push("la guardia touchstart no excluye controles interactivos");
if (!/function activarConToque\s*\(/.test(pantalla) || !/activarConToque\(b,\s*\(\) => elegir\(/.test(pantalla)) {
  problemas.push("las opciones del reto no tienen una ruta explícita de activación táctil");
}
if (!/@media\s*\(max-width:\s*400px\)[\s\S]*?\.opciones\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)/.test(css)) problemas.push("el reto móvil no fija dos columnas para las opciones");
if (!/\.opciones\s*\.opcion\s*\{[^}]*min-inline-size:\s*0/.test(css)) problemas.push("las opciones móviles no permiten encoger su columna");
if (!/\.sendero\s*\{[^}]*position:\s*static[^}]*pointer-events:\s*none/.test(sendero)) {
  problemas.push("el indicador de racha puede cubrir la pantalla y capturar los clics/toques de las opciones");
}

notas.push("la protección iOS conserva el bloqueo del swipe solo fuera de controles");
notas.push("las opciones KINDER forman dos columnas equilibradas en móvil");
notas.push("el sendero decorativo de la racha queda fuera del hit testing");

informar({
  nombre: "reto-opciones-moviles",
  problemas,
  notas,
  cita: "#451, mc-20, D-041",
  revisados: 3,
  resumen: "interacción táctil y grid móvil del reto",
  porQueBloquea: "un control visible pero no seleccionable congela el reto; una cuadrícula 3+1 degrada la lectura y el alcance táctil",
});
