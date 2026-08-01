#!/usr/bin/env node
// Auditor determinista — una sola tabla de bandas y niveles
//
// Hace cumplir: D-002, D-017, D-034, D-046, `mc-15` (escaleras de grado).
//
// Por qué existe. D-017 fija la escalera de niveles y D-002 fija cómo se asigna
// el nivel. Las dos describen la MISMA tabla, y una tabla descrita en dos sitios
// se copia a un tercero en cuanto alguien la necesita en el cliente: un arreglo
// de bandas en la interfaz "para pintar el selector", otro en el worker "para
// validar", y un CHECK en SQL. Tres copias, tres verdades.
//
// El síntoma cuando divergen no es un error: es un niño colocado en N4 por el
// servidor al que la interfaz le enseña "Nivel 3".
//
// Y una regla que D-046 añadió y que es fácil de romper sin querer: **la edad no
// limita el nivel**. Un mapa de edad a nivel máximo es exactamente lo que la
// decisión prohíbe — un niño de 5 años que se coloca en N5 juega N5.
//
// LO QUE NO PUEDE COMPROBAR: si los cortes entre bandas son pedagógicamente
// correctos. Eso es `mc-15` y revisión humana.

import { archivos, leer, informar, SOLO_PRODUCTO, palabra } from "./lib/repo.mjs";

const DECLARA_BANDAS = /\b(BANDAS|BANDS|NIVELES|LEVELS|LADDER|ESCALERA)\b\s*[:=]\s*[[{]/;
const NIVEL = /\bN(?:[1-9]|10)\b/g;
// `palabra()` y no `\b`: `nivel_max_por_edad` no tiene frontera después de
// "max" porque `_` es carácter de palabra. El arnés lo cazó.
const EDAD_LIMITA = palabra(
  "max_?level", "nivel_?max\\w*", "limite_?nivel", "level_?cap", "cap_?por_?edad",
  "age_?to_?level", "edad_?a_?nivel", "\\w*_?por_?edad",
);

const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs|json|sql)$/).filter((f) => SOLO_PRODUCTO.test(f));
const problemas = [];
const notas = [];
const declaradores = [];

for (const archivo of fuentes) {
  const texto = leer(archivo) ?? "";
  const esSql = archivo.endsWith(".sql");

  if (DECLARA_BANDAS.test(texto)) declaradores.push(archivo);

  // Un CHECK en SQL que enumera niveles es una segunda tabla, aunque se llame
  // restricción. Se acepta —es la defensa de la base— pero se anota, porque si
  // la enumeración deja de coincidir con la del código, el insert falla en
  // producción y en ninguna prueba.
  if (esSql && /CHECK\s*\([^)]*\bN(?:[1-9]|10)\b/i.test(texto)) {
    notas.push(`${archivo}: CHECK con niveles — tiene que coincidir con la tabla del código`);
  }

  const lineas = texto.split("\n");
  for (let i = 0; i < lineas.length; i++) {
    const linea = (esSql ? lineas[i].replace(/--.*$/, "") : lineas[i].replace(/\/\/.*$/, "")).replace(/^\s*\*.*$/, "");
    if (!linea.trim()) continue;

    if (EDAD_LIMITA.test(linea)) {
      problemas.push(
        `${archivo}:${i + 1}: la edad limita el nivel — \`${linea.trim().slice(0, 80)}\`. ` +
          "D-046: la ubicación es opcional y la edad NO limita el nivel. Un niño de 5 años " +
          "que se coloca en N5 juega N5, con el tema de kinder.",
      );
    }
  }
}

if (declaradores.length > 1) {
  problemas.push(
    `${declaradores.length} archivos declaran la tabla de bandas o niveles (${declaradores.join(", ")}). ` +
      "D-002 y D-017 describen UNA. Dos copias divergen, y el síntoma no es un error: es un " +
      "niño colocado en N4 por el servidor al que la interfaz le enseña «Nivel 3».",
  );
}

notas.unshift(
  declaradores.length === 1
    ? `una sola tabla de bandas: ${declaradores[0]}`
    : declaradores.length === 0
      ? "todavía no hay tabla de bandas; el auditor está listo para la primera (F3)"
      : "",
);

informar({
  nombre: "tabla-bandas",
  problemas,
  notas: notas.filter(Boolean).slice(0, 6),
  cita: "D-002, D-017, D-034, D-046, mc-15",
  revisados: fuentes.length,
  resumen: `${fuentes.length} archivo(s) de producto`,
  porQueBloquea:
    "dos tablas de niveles divergentes no producen un error, producen un niño colocado " +
    "en un nivel al que la interfaz le pone otro nombre.",
  noComprueba: ["si los cortes entre bandas son pedagógicamente correctos — eso es mc-15 y revisión humana."],
});
