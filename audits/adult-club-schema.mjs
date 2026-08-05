#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { RAIZ, informar, sqlSinComentarios } from "./lib/repo.mjs";

const archivo = "migrations/0022_clubs_adultos.sql";
const sql = sqlSinComentarios(readFileSync(`${RAIZ}/${archivo}`, "utf8"));
const tablas = [
  "adult_club",
  "adult_club_membership",
  "club_challenge",
  "club_challenge_result",
  "club_stake",
  "club_stake_acceptance",
  "stake_moderation_log",
];
const problemas = [];
for (const tabla of tablas) {
  if (!new RegExp(`CREATE TABLE ${tabla}\\b`, "i").test(sql)) problemas.push(`falta ${tabla}`);
}
for (const prohibido of ["loser_membership_id", "penalty", "forfeit", "score_totals_adulto"]) {
  if (new RegExp(`\\b${prohibido}\\b`, "i").test(sql)) problemas.push(`aparece campo prohibido ${prohibido}`);
}
if (!/max_size INTEGER NOT NULL DEFAULT 20 CHECK \(max_size BETWEEN 1 AND 20\)/i.test(sql)) problemas.push("falta el tope estructural de 20");
if (!/expires_at - starts_at <= 259200/i.test(sql)) problemas.push("falta el máximo estructural de 72 horas");
if (!/\(\(user_id IS NOT NULL\) <> \(child_profile_id IS NOT NULL\)\)/i.test(sql)) problemas.push("membresía no es polimórfica XOR");
if (!/adult_club_membership[\s\S]*approved_by[\s\S]*approved_at/i.test(sql)) problemas.push("falta aprobación parental en membresía");
for (const ruta of [
  "apps/web/src/pages/api/clubes/crear.ts",
  "apps/web/src/pages/api/clubes/unirse.ts",
  "apps/web/src/pages/api/clubes/reto/index.ts",
  "apps/web/src/pages/api/clubes/reto/resolver.ts",
  "apps/web/src/pages/api/larry/moderar.ts",
  "apps/web/src/pages/api/clubes/prenda/aceptar.ts",
  "apps/web/src/pages/api/clubes/prenda/apelar.ts",
]) {
  if (!existsSync(`${RAIZ}/${ruta}`)) problemas.push(`falta ruta F10 ${ruta}`);
}
informar({
  nombre: "adult-club-schema",
  problemas,
  cita: "D-043, D-117–D-121, F10 #412",
  revisados: 1,
  resumen: `${tablas.length} tablas · tope 20 · ventana 72 h · membresía XOR`,
  noComprueba: ["no ejecuta las rutas contra una D1 desplegada; eso pertenece al gate de producción"],
});
