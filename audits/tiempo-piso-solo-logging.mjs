#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { RAIZ, informar, sinComentarios } from "./lib/repo.mjs";

const motor = sinComentarios(readFileSync(`${RAIZ}/packages/motor/src/anti-trampa.ts`, "utf8"));
const puntuacion = sinComentarios(readFileSync(`${RAIZ}/packages/motor/src/puntuacion.ts`, "utf8"));
const ingest = sinComentarios(readFileSync(`${RAIZ}/apps/ingest/src/index.ts`, "utf8"));
const jugar = sinComentarios(readFileSync(`${RAIZ}/apps/web/src/pages/api/jugar.ts`, "utf8"));
const problemas = [];
if (!/PISO_MS\s*=\s*300/.test(puntuacion)) problemas.push("el piso autorado de 300 ms desapareció");
if (!/consecutivas\s*>=\s*3/.test(motor)) problemas.push("la señal ya no exige tres respuestas consecutivas");
if (!/antiTrampaSignal\?\s*:\s*boolean/.test(ingest)) problemas.push("el ingestor acepta una señal no declarada");
if (!/input\.antiTrampaSignal\s*===\s*true/.test(ingest)) problemas.push("el ingestor vuelve a interpretar el tiempo en vez de recibir la señal derivada");
if (!/responseTimeMs:\s*tiempoServidor/.test(jugar)) problemas.push("la telemetría no usa el reloj server-side");
if (/puntos\s*=\s*0|puntaje\s*=\s*0|bloque(?:a|o)|lockout|penalty/i.test(ingest)) problemas.push("la ruta contiene una forma de bloqueo o castigo");
informar({
  nombre: "tiempo-piso-solo-logging",
  problemas,
  cita: "D-125, D-020, mc-29, línea roja #7",
  revisados: 4,
  resumen: "piso de 300 ms · tres consecutivas · señal derivada · sin castigo",
  noComprueba: ["que los tiempos provengan de un aparato honesto: los dos sellos son del DO"],
});
