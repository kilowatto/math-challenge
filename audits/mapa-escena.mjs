#!/usr/bin/env node
import { leer, informar, sinComentarios, existe } from "./lib/repo.mjs";

const ESCENA = "apps/web/src/components/mapa/EscenaSabana.astro";
const HOJA = "apps/web/src/styles/mapa.css";
const problemas = [];
const notas = [];

if (!existe(ESCENA)) {
  problemas.push(`${ESCENA} no existe: el sendero KINDER necesita una escena continua.`);
} else {
  const texto = sinComentarios(leer(ESCENA) ?? "");
  const exigencias = [
    ["contenedor de cámara", /sabana__viewport/],
    ["mundo continuo", /sabana__world/],
    ["camino decorativo accesible", /<svg[^>]+aria-hidden="true"/],
    ["camino con trayectoria", /<path[^>]+d="[^"]+"/],
    ["sendero semántico existente", /<Sendero[\s\S]*destinoDe/],
    ["etiqueta accesible localizada", /aria-label=\{m\.mapaSenderoNombre\}/],
  ];
  for (const [nombre, patron] of exigencias) {
    if (!patron.test(texto)) problemas.push(`${ESCENA}: falta ${nombre}.`);
  }
  notas.push("escena, cámara y camino revisados con una tabla independiente");
}

if (!existe(HOJA)) {
  problemas.push(`${HOJA} no existe: la escena no tiene composición visual.`);
} else {
  const css = sinComentarios(leer(HOJA) ?? "");
  const exigencias = [
    ["14 posiciones de lugar", (css.match(/\.sabana \.sendero__lugar:nth-child\(/g) ?? []).length === 14],
    ["scroll vertical de la cámara", /overflow-y:\s*auto/.test(css)],
    ["camino visible", /\.sabana__camino\s*\{/.test(css) && /stroke:\s*(?:var\(--ignia-naranja-claro\)|#f4c66b)/.test(css)],
    ["estado terminado", /data-estado="terminado"/.test(css)],
    ["estado en curso", /data-estado="en_curso"/.test(css)],
    ["estado por visitar", /data-estado="por_visitar"/.test(css)],
    ["movimiento reducido", /prefers-reduced-motion/.test(css)],
    ["responsive móvil", /max-width:\s*40rem/.test(css)],
  ];
  for (const [nombre, cumple] of exigencias) {
    if (!cumple) problemas.push(`${HOJA}: falta ${nombre}.`);
  }
  notas.push("14 lugares, estados, cámara, responsive y movimiento reducido revisados");
}

informar({
  nombre: "mapa-escena",
  problemas,
  notas,
  cita: "F7, #498, D-019",
  revisados: 2,
  resumen: "escena continua, cámara, camino y estados del mapa KINDER",
  noComprueba: ["calidad artística subjetiva", "rendimiento en un dispositivo físico"],
});
