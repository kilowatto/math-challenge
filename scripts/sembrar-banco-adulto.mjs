#!/usr/bin/env node
// La siembra de la franja adulta (SERIO, N8–N10) en D1 (F5b #159–#167, D-034, D-072).
//
//     node --experimental-strip-types scripts/sembrar-banco-adulto.mjs > /tmp/siembra-adulto.sql
//     npx wrangler d1 execute math-challenge-db --local  --file=/tmp/siembra-adulto.sql
//     npx wrangler d1 execute math-challenge-db --remote --file=/tmp/siembra-adulto.sql
//
// Mismo contrato que `sembrar-banco-primaria.mjs`, y por las mismas razones:
// es un guion y no la migración (la tabla `item_bank` ya existe — la 0016 — y
// su CHECK ya admite 'SERIO'; una corrección de contenido no puede necesitar
// una migración nueva), y el INSERT OR IGNORE es la línea más importante del
// archivo: una fila corregida a mano en D1 —la razón de ser de D-072— no la
// pisa una re-siembra.
//
// Determinista: los mismos parámetros dan los mismos ítems con los mismos ids
// y el mismo SQL, byte a byte — incluidos los sellos de tiempo, que por eso
// son una constante y no `Date.now()`.
//
// La franja no tiene techo de servicio: ninguna plantilla adulta es andamiaje
// que se apague por nivel (no hay reversión de la pericia que aplicar aquí,
// Kalyuga vía #354), así que `hasta_nivel` viaja NULL en todas las filas. El
// auditor `banco-adulto-i18n` lo comprueba fila a fila.

import { writeFileSync } from "node:fs";
import {
  generarBancoAdulto,
  HABILIDADES_ADULTO,
  proporcionDePlantilla,
} from "../packages/motor/src/banco-adulto.ts";
import { validarItem } from "../packages/motor/src/item.ts";
import { dificultadDeNivel } from "../packages/motor/src/adaptativo.ts";

/** Sello fijo: 2026-08-04T00:00:00Z. Determinista a propósito — ver encabezado. */
const SELLO_SIEMBRA = 1785801600000;

const args = process.argv.slice(2);
const SALIDA = args.includes("--salida") ? args[args.indexOf("--salida") + 1] : null;

// --- 1. Generar y validar ANTES de escribir nada ----------------------------
// Un ítem mal formado que entra a la base se descubre cuando alguien lo ve.
// `validarItem` es la misma regla que corre al leer cada fila en vivo.
const banco = generarBancoAdulto();
const invalidos = banco.map((i) => ({ i, p: validarItem(i) })).filter((x) => x.p.length);
if (invalidos.length > 0) {
  console.error(`✗ ${invalidos.length} ítem(s) no pasan validarItem; no se siembra nada.`);
  for (const { i, p } of invalidos.slice(0, 5)) console.error(`  · ${i.id}: ${p.join(" | ")}`);
  process.exit(1);
}

// --- 2. El SQL ---------------------------------------------------------------
// Cadenas con comillas duplicadas según SQL. El JSON viaja tal cual — es la
// estructura del ítem (plan §9), jamás texto ya formado.
const sql = (s) => `'${String(s).replaceAll("'", "''")}'`;

const lineas = [
  "-- siembra de la franja adulta (SERIO) — generada por scripts/sembrar-banco-adulto.mjs",
  "-- INSERT OR IGNORE a propósito: una fila curada a mano en D1 no se pisa (D-072).",
  "-- regenerar es gratis y no destruye nada; borrar huérfanos es una decisión aparte.",
  "",
];

for (const item of banco) {
  lineas.push(
    "INSERT OR IGNORE INTO item_bank " +
      "(id, banda, habilidad, nivel, hasta_nivel, dificultad, item_json, creado_en, actualizado_en) VALUES (" +
      [
        sql(item.id),
        sql("SERIO"),
        sql(item.habilidad),
        String(item.nivel),
        "NULL",
        String(dificultadDeNivel(item.nivel)),
        sql(JSON.stringify(item)),
        String(SELLO_SIEMBRA),
        String(SELLO_SIEMBRA),
      ].join(", ") +
      ");",
  );
}

const texto = lineas.join("\n") + "\n";
if (SALIDA) writeFileSync(SALIDA, texto, "utf8");
else process.stdout.write(texto);

// --- 3. El resumen, por stderr para no ensuciar el SQL ----------------------
// La proporción de plantilla se PUBLICA aquí (#165): es el número que mc-40
// dice que hay que mirar antes de comprometer una fecha de autoría.
const porHabilidad = {};
for (const i of banco) porHabilidad[i.habilidad] = (porHabilidad[i.habilidad] ?? 0) + 1;
const prop = proporcionDePlantilla();
console.error(`✓ ${banco.length} ítems de la franja adulta (SERIO, N8–N10)`);
for (const [h, n] of Object.entries(porHabilidad)) {
  console.error(`  · ${h} (${HABILIDADES_ADULTO[h]}): ${n} ítems`);
}
console.error(
  `  proporción de plantilla (mc-40, #165): ${prop.parametrica} de plantilla, ` +
    `${prop.manual} a mano — ${((100 * prop.parametrica) / prop.total).toFixed(1)}% paramétrico`,
);
console.error(SALIDA ? `  escrito en ${SALIDA}` : "  (salida por stdout)");
