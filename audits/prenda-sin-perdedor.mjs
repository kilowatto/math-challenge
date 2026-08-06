import { readFileSync } from "node:fs";
import { informar, sqlSinComentarios } from "./lib/repo.mjs";

const migration = sqlSinComentarios(readFileSync("migrations/0022_clubs_adultos.sql", "utf8"));
const problemas = [];
for (const forbidden of ["loser_membership_id", "loser_user_id", "penalty", "forfeit", "castigo", "perdedor"]) {
  if (new RegExp(`\\b${forbidden}\\b`, "i").test(migration)) problemas.push(`la migración deja entrar ${forbidden}`);
}
const acceptance = migration.match(/CREATE TABLE club_stake_acceptance[\s\S]*?;/i)?.[0] ?? "";
if (!/user_id\s+TEXT\s+NOT NULL\s+REFERENCES\s+users\s*\(id\)/i.test(acceptance)) {
  problemas.push("la aceptación no está limitada a users.id");
}
if (/child_profile_id/i.test(acceptance)) problemas.push("la aceptación admite un child_profile_id");
const writes = [
  "apps/web/src/pages/api/larry/moderar.ts",
  "apps/web/src/pages/api/clubes/prenda/aceptar.ts",
  "apps/web/src/pages/api/clubes/prenda/apelar.ts",
];
for (const file of writes) {
  const text = readFileSync(file, "utf8");
  if (file.endsWith("moderar.ts")) {
    if (!/stake_moderation_log/.test(text) || !/club_stake/.test(text)) problemas.push(`${file}: no registra moderación antes de publicar`);
  } else if (/INSERT\s+INTO\s+club_stake/i.test(text)) {
    problemas.push(`${file}: escribe una prenda fuera del moderador`);
  }
}
informar({
  nombre: "prenda-sin-perdedor",
  problemas,
  cita: "D-028, D-120, F10 #417",
  revisados: writes.length + 1,
  resumen: "estructura sin perdedor · aceptación solo adulta · publicación solo tras moderación",
  noComprueba: ["no evalúa la calidad lingüística de una prenda aprobada"],
});
