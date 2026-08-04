#!/usr/bin/env node
// Casos del presentador — la pieza que convierte la estructura en pantalla.
//
//     node --experimental-strip-types packages/motor/src/presentar.prueba.mjs
//
// Lo que estos casos defienden no rompe nada visible al romperse: un separador
// de millares equivocado sigue siendo un número que se puede tocar — solo que
// en ese locale se lee como OTRO número (mc-34), y un barajado que cambia al
// recargar no falla ninguna prueba de tipos, solo le mueve las cosas a quien
// juega.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { readFileSync } from "node:fs";
import { presentarItemEstructura } from "./presentar.ts";
import { generarBancoPrimaria } from "./banco-primaria.ts";

let fallos = 0, corridos = 0;
function caso(n, fn) { corridos++; try { fn(); console.log(`  ✓ ${n}`); } catch (e) { fallos++; console.error(`  ✗ ${n}`); console.error(`      ${e.message}`); } }
const es = (a, b, m) => { if (a !== b) throw new Error(`${m ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`); };

console.log("\n== presentar — estructura → pantalla, en los 7 locales (mc-34, #349) ==\n");

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
const MENSAJES = Object.fromEntries(
  LOCALES.map((l) => [l, JSON.parse(readFileSync(`apps/web/src/i18n/reto/${l}.json`, "utf8"))]),
);

const banco = generarBancoPrimaria();
// Un ítem con millares: la comparación 2 123 · 2 231 · 2 312.
const comp = banco.find((i) => i.id === "p02-0-2-1-2-3-0");
if (!comp) { console.error("no encontré p02-0-2-1-2-3-0"); process.exit(1); }

caso("el separador de millares es el de CADA locale (#353, mc-34)", () => {
  const esperado = {
    "en": "2,312",
    "es-MX": "2,312",
    "es-ES": "2.312",
    "fr-FR": "2 312",
    "pt-BR": "2.312",
    "pt-PT": "2.312",
    "de-DE": "2.312",
  };
  for (const l of LOCALES) {
    const p = presentarItemEstructura(comp, l, MENSAJES[l]);
    const correcta = p.opciones.find((o) => o.valor === 2312);
    es(correcta.texto, esperado[l], `la correcta en ${l}`);
  }
});

caso("en francés el separador es el espacio FINO insecable (U+202F), no uno normal (#322)", () => {
  const p = presentarItemEstructura(comp, "fr-FR", MENSAJES["fr-FR"]);
  const correcta = p.opciones.find((o) => o.valor === 2312);
  if (!correcta.texto.includes(" ")) throw new Error(`«${correcta.texto}» no lleva U+202F`);
  if (correcta.texto.includes(" ")) throw new Error(`«${correcta.texto}» lleva un espacio NORMAL: la línea puede partir el número`);
});

caso("los millares del ENUNCIADO también se formatean (valor posicional)", () => {
  const pos = banco.find((i) => i.enunciado.clave === "p.posicional.valor" && i.enunciado.vars.n >= 1000);
  const p = presentarItemEstructura(pos, "de-DE", MENSAJES["de-DE"]);
  const n = pos.enunciado.vars.n;
  const conPunto = `${Math.floor(n / 1000)}.${String(n % 1000).padStart(3, "0")}`;
  if (!p.enunciado.includes(conPunto)) throw new Error(`«${p.enunciado}» no contiene «${conPunto}»`);
  if (!p.vars.d) throw new Error("la cifra preguntada no viaja en vars");
});

caso("el barajado es determinista y conserva exactamente las opciones", () => {
  const item = banco.find((i) => i.habilidad === "P01");
  const a = presentarItemEstructura(item, "es-MX", MENSAJES["es-MX"]);
  const b = presentarItemEstructura(item, "es-MX", MENSAJES["es-MX"]);
  es(JSON.stringify(a.opciones.map((o) => o.valor)), JSON.stringify(b.opciones.map((o) => o.valor)), "dos presentaciones");
  const esperados = [item.respuesta.valor, ...item.errores.map((e) => e.valor)].sort((x, y) => x - y);
  es(JSON.stringify(a.opciones.map((o) => o.valor).sort((x, y) => x - y)), JSON.stringify(esperados), "el conjunto");
  // Y ninguna opción dice cuál es la buena.
  for (const o of a.opciones) {
    if ("correcta" in o || "correct" in o) throw new Error("la respuesta viaja marcada");
  }
});

caso("el enunciado sale de la plantilla del locale, nunca de la clave", () => {
  const item = banco.find((i) => i.habilidad === "P01" && i.enunciado.clave === "p.fluidez.suma");
  const p = presentarItemEstructura(item, "pt-BR", MENSAJES["pt-BR"]);
  if (p.enunciado.includes("p.fluidez")) throw new Error(`la clave cruda llegó a pantalla: «${p.enunciado}»`);
  if (!p.enunciado.startsWith("Quanto é")) throw new Error(`no es la plantilla de pt-BR: «${p.enunciado}»`);
});

caso("una plantilla que falta deja la CLAVE visible — el fallo se ve, no se esconde", () => {
  // Es el comportamiento heredado de la ingesta: mejor un identificador feo
  // que un hueco silencioso. El auditor `banco-primaria-i18n` es quien impide
  // que esto ocurra de verdad; aquí solo se fija el comportamiento.
  const item = banco.find((i) => i.habilidad === "P01");
  const p = presentarItemEstructura(item, "en", {});
  es(p.enunciado, item.enunciado.clave, "sin catálogo");
});

caso("una opción de cadena sin dibujo se sirve como su valor — feo, pero jugable (línea roja #4)", () => {
  const item = {
    ...banco.find((i) => i.habilidad === "P01"),
    respuesta: { valor: "casilla0", tol: 0 },
    errores: [{ valor: 5, causa: "error.p.no_llevo" }],
  };
  const p = presentarItemEstructura(item, "en", MENSAJES.en);
  const cruda = p.opciones.find((o) => o.valor === "casilla0");
  es(cruda.texto, "casilla0", "el respaldo documentado");
  if (cruda.dibujo) throw new Error("no debería tener dibujo");
});

console.log("");
if (fallos > 0) { console.error(`✗ ${fallos} de ${corridos} casos fallaron`); process.exit(1); }
console.log(`✓ ${corridos} casos del presentador`);
