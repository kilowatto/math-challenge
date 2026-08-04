#!/usr/bin/env node
// La siembra del banco de PRIMARIA en D1 (F5c #351/#356, D-072).
//
//     node --experimental-strip-types scripts/sembrar-banco-primaria.mjs > /tmp/siembra.sql
//     npx wrangler d1 execute math-challenge-db --local  --file=/tmp/siembra.sql
//     npx wrangler d1 execute math-challenge-db --remote --file=/tmp/siembra.sql
//
// ─── Por qué es un guion y no la migración ─────────────────────────────────
//
// D-072 pone el banco en D1 para que un ítem se corrija SIN DESPLEGAR. Si las
// filas vinieran en la migración 0016, cada corrección de contenido sería una
// migración nueva — el banco habría cambiado de sitio sin cambiar de problema.
// La migración crea la tabla; este guion la puebla.
//
// ─── INSERT OR IGNORE, y es la línea más importante del archivo ────────────
//
// Una fila que ya existe NO se pisa. D-072 compra exactamente eso: que un
// ítem se pueda corregir a mano en la base, y una re-siembra que lo
// sobrescribiera destruiría la curaduría en silencio. Lo que una re-siembra
// SÍ hace: añadir las variantes nuevas que una plantilla aprendió, y dejar
// huérfanos visibles (los ids que ya no genera — se listan con `--huerfanos`
// contra la base local, nunca se borran desde aquí).
//
// ─── Determinista ──────────────────────────────────────────────────────────
//
// Los mismos parámetros dan los mismos ítems con los mismos ids y el mismo
// SQL, byte a byte — incluidos los sellos de tiempo, que por eso son una
// constante y no `Date.now()`. Una siembra no determinista haría que dos
// corridas difirieran sin que nadie pudiera decir por qué.

import { writeFileSync } from "node:fs";
import {
  generarBancoPrimaria,
  TECHO_POR_HABILIDAD,
  HABILIDADES_PRIMARIA,
} from "../packages/motor/src/banco-primaria.ts";
import { validarItem } from "../packages/motor/src/item.ts";
import { dificultadDeNivel } from "../packages/motor/src/adaptativo.ts";

/** Sello fijo: 2026-08-03T00:00:00Z. Determinista a propósito — ver encabezado. */
const SELLO_SIEMBRA = 1785715200000;

const args = process.argv.slice(2);
const SALIDA = args.includes("--salida") ? args[args.indexOf("--salida") + 1] : null;

// --- 1. Generar y validar ANTES de escribir nada ----------------------------
// Un ítem mal formado que entra a la base se descubre cuando alguien lo ve.
// `validarItem` es la misma regla que corre al leer cada fila en vivo.
const banco = generarBancoPrimaria();
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
  "-- siembra del banco de PRIMARIA — generada por scripts/sembrar-banco-primaria.mjs",
  "-- INSERT OR IGNORE a propósito: una fila curada a mano en D1 no se pisa (D-072).",
  "-- regenerar es gratis y no destruye nada; borrar huérfanos es una decisión aparte.",
  "",
];

for (const item of banco) {
  const hasta = TECHO_POR_HABILIDAD[item.habilidad] ?? null;
  lineas.push(
    "INSERT OR IGNORE INTO item_bank " +
      "(id, banda, habilidad, nivel, hasta_nivel, dificultad, item_json, creado_en, actualizado_en) VALUES (" +
      [
        sql(item.id),
        sql("PRIMARIA"),
        sql(item.habilidad),
        String(item.nivel),
        hasta === null ? "NULL" : String(hasta),
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
const porHabilidad = {};
for (const i of banco) porHabilidad[i.habilidad] = (porHabilidad[i.habilidad] ?? 0) + 1;
console.error(`✓ ${banco.length} ítems de primaria`);
for (const [h, n] of Object.entries(porHabilidad)) {
  const techo = TECHO_POR_HABILIDAD[h];
  console.error(
    `  · ${h} (${HABILIDADES_PRIMARIA[h]}): ${n} ítems` +
      (techo ? ` — se apaga por encima de N${techo} (Kalyuga, #354)` : ""),
  );
}
console.error(SALIDA ? `  escrito en ${SALIDA}` : "  (salida por stdout)");
