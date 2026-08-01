#!/usr/bin/env node
// Auditor determinista — un Durable Object por entidad, jamás uno global
//
// Hace cumplir: `mc-32` (arquitectura Cloudflare), D-030, D-043.
//
// Por qué existe. Un Durable Object es de un solo hilo: todas las peticiones a
// una misma instancia se serializan. Eso es exactamente lo que lo hace útil —da
// consistencia sin transacciones— y exactamente lo que lo vuelve un cuello de
// botella si hay una sola instancia para todo el producto.
//
// `idFromName("global")` es el error, y es tentador porque funciona
// perfectamente hasta que hay tráfico: con cinco usuarios de prueba nadie nota
// que están haciendo cola. Se descubre en producción, el día bueno, con el
// producto entero detrás de un hilo.
//
// La forma correcta la fija `mc-32`: el identificador es la entidad. Un DO por
// `child_group`, uno por `adult_club` (D-043), uno por sesión de reto. Cada
// grupo hace cola consigo mismo y con nadie más.
//
// LO QUE NO PUEDE COMPROBAR: si la entidad elegida es la correcta. Un DO por
// "país" también es por entidad y también es un cuello de botella. Eso es diseño,
// y lo revisa el auditor adversarial de arquitectura.

import { archivos, leer, informar, SOLO_PRODUCTO, palabra } from "./lib/repo.mjs";

/** Nombres que significan «uno para todos». */
const NOMBRE_GLOBAL = palabra(
  "global", "singleton", "main", "default", "shared", "unico", "todos", "all", "app", "root", "master",
);

const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs)$/).filter((f) => SOLO_PRODUCTO.test(f));
const problemas = [];
const notas = [];
let usosDeDO = 0;

for (const archivo of fuentes) {
  const texto = leer(archivo) ?? "";
  const lineas = texto.split("\n");

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i].replace(/\/\/.*$/, "").replace(/^\s*\*.*$/, "");
    if (!linea.trim()) continue;

    // `idFromName(...)` con literal: es donde se decide el reparto.
    const m = linea.match(/idFromName\s*\(\s*(["'`])([^"'`]*)\1\s*\)/);
    if (m) {
      usosDeDO++;
      const nombre = m[2];
      if (NOMBRE_GLOBAL.test(nombre) || nombre === "") {
        problemas.push(
          `${archivo}:${i + 1}: \`idFromName("${nombre}")\` — un Durable Object para todo el producto. ` +
            "Un DO es de un solo hilo: con una instancia global, cada petición hace cola detrás " +
            "de la anterior. Funciona con cinco usuarios de prueba y se descubre en producción. " +
            "mc-32: el identificador es la entidad (un grupo, un club, una sesión).",
        );
      }
      continue;
    }

    // `idFromName` con una expresión: se acepta, pero se cuenta.
    if (/idFromName\s*\(/.test(linea)) {
      usosDeDO++;
      notas.push(`${archivo}:${i + 1} reparte por expresión — revisar que sea la entidad`);
    }

    // `newUniqueId()` para algo que debería ser estable por entidad: un DO nuevo
    // en cada petición pierde todo su estado, que es lo contrario de su propósito.
    if (/newUniqueId\s*\(/.test(linea) && /(get|fetch|stub|obtener)\w*\s*\(/.test(lineas.slice(i, i + 4).join(" "))) {
      usosDeDO++;
      notas.push(`${archivo}:${i + 1} usa newUniqueId — correcto solo si la entidad es efímera y su id se guarda`);
    }
  }
}


// --- Los DO declarados, no solo los usados ---------------------------------
//
// La primera versión solo miraba llamadas a `idFromName(...)`, así que informaba
// "todavía no hay Durable Objects" con uno declarado en `wrangler.jsonc` y su
// clase exportada. Un auditor que no ve el recurso que vigila no lo vigila: la
// declaración llega siempre antes que la primera llamada, y es el momento en que
// alguien decide si el reparto va a ser por entidad o no.
const configs = archivos(/wrangler\.(jsonc?|toml)$/);
const declarados = [];
for (const c of configs) {
  const t = leer(c) ?? "";
  for (const m of t.matchAll(/"class_name"\s*:\s*"([^"]+)"/g)) declarados.push({ archivo: c, clase: m[1] });
  for (const m of t.matchAll(/class_name\s*=\s*"([^"]+)"/g)) declarados.push({ archivo: c, clase: m[1] });
}

for (const { archivo, clase } of declarados) {
  // Una clase con nombre de "todo el producto" delata el reparto antes de que
  // exista la primera llamada.
  if (NOMBRE_GLOBAL.test(clase)) {
    problemas.push(
      `${archivo}: el Durable Object \`${clase}\` tiene nombre de instancia única. ` +
        "mc-32: el identificador es la entidad — una sesión, un grupo, un club.",
    );
  }
}

notas.unshift(
  declarados.length > 0
    ? `${declarados.length} Durable Object(s) declarado(s): ${declarados.map((d) => d.clase).join(", ")}` +
      ` · ${usosDeDO} uso(s) de reparto, ninguno global`
    : "todavía no hay Durable Objects; el auditor está listo para el primero (F3)",
);

informar({
  nombre: "do-por-entidad",
  problemas,
  notas: notas.slice(0, 6),
  cita: "mc-32, D-030, D-043",
  revisados: fuentes.length,
  resumen: `${fuentes.length} archivo(s) de producto`,
  porQueBloquea:
    "un Durable Object es de un solo hilo. Uno global pone el producto entero detrás de " +
    "una cola, funciona perfecto en desarrollo, y se descubre el día que hay tráfico.",
  noComprueba: [
    "si la entidad elegida es la correcta. Un DO por «país» también es por entidad y " +
      "también es un cuello de botella.",
  ],
});
