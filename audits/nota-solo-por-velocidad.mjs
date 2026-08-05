#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { RAIZ, informar, sinComentarios } from "./lib/repo.mjs";

const ruta = "apps/web/src/lib/nota-anti-trampa.ts";
const texto = sinComentarios(readFileSync(`${RAIZ}/${ruta}`, "utf8"));
const problemas = [];
const bloque = texto;
if (!bloque) problemas.push("no encontré el único escritor de PATRON_INUSUAL_PARA_EDAD");
const rutaJugar = sinComentarios(readFileSync(`${RAIZ}/apps/web/src/pages/api/jugar.ts`, "utf8"));
if (!/telemetria\?\.imposible\s*&&\s*!quien\.esAdulto\s*&&\s*env\.DB/.test(rutaJugar)) problemas.push("la ruta podría escribir la nota para una cuenta adulta");
if (!/PATRON_INUSUAL_PARA_EDAD/.test(bloque)) problemas.push("la causa de la nota no está cerrada");
if (!/skill_id, created_at, seen_at/.test(bloque) || !/NULL, \?/.test(bloque)) problemas.push("la nota no deja skill_id nulo para una señal global");
if (!/created_at\s+>=\s+\?/.test(bloque)) problemas.push("la escritura no es idempotente por ventana temporal");
if (/nivel|level|habilidad\s*[,)]/.test(bloque)) problemas.push("la nota depende de nivel o habilidad; D-061 prohíbe eso");
informar({
  nombre: "nota-solo-por-velocidad",
  problemas,
  cita: "D-061, D-020, F4 #389, F11 #425",
  revisados: 1,
  resumen: "una escritura idempotente · solo señal de velocidad · sin nivel",
  noComprueba: ["la calidad del copy de los siete locales: la flota de notas la cubre"],
});
