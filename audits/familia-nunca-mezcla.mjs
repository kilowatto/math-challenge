import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migration = fs.readFileSync(path.join(root, "migrations/0023_nucleo_familiar.sql"), "utf8");
const roster = fs.readFileSync(path.join(root, "apps/web/src/pages/api/familia.ts"), "utf8");
const link = fs.readFileSync(path.join(root, "apps/web/src/pages/api/familia-vinculo.ts"), "utf8");
const challenge = fs.readFileSync(path.join(root, "apps/web/src/pages/api/familia-reto.ts"), "utf8");
const player = fs.readFileSync(path.join(root, "apps/web/src/pages/[locale]/app/familia/reto/[id].astro"), "utf8");
const problems = [];
if (!/CREATE TABLE household_link/.test(migration)) problems.push("falta household_link");
if (!/CREATE TABLE family_challenge/.test(migration)) problems.push("falta family_challenge");
if (!/CREATE TABLE family_challenge_result/.test(migration)) problems.push("falta family_challenge_result");
if (!/CREATE TABLE family_cheer/.test(migration)) problems.push("falta family_cheer");
if (/UNION\s+ALL|UNION\s+SELECT/i.test(roster)) problems.push("la vista familiar une las listas con UNION");
if (/chat|mensaje|texto libre/i.test(migration + roster + link)) problems.push("la superficie familiar contiene canal de texto");
if (!/REACCIONES_FAMILIA/.test(roster)) problems.push("las porras no usan el conjunto cerrado");
if (!/invite_code/.test(link) || !/revoked_at/.test(link)) problems.push("el vínculo no tiene código revocable");
if (!/family_challenge/.test(challenge) || !/calificarRespuesta/.test(challenge)) problems.push("el reto familiar no se resuelve en servidor");
if (!/reto_fuera_del_hogar/.test(challenge) || !/set_alterado/.test(challenge)) problems.push("el reto familiar no valida hogar y set congelado");
if (!/familia-reto\?challengeId/.test(player) || !/accion=resolver/.test(player)) problems.push("el reto familiar no tiene pantalla jugable conectada al servidor");
if (!/itemIds/.test(challenge) || !/item_fuera_del_reto/.test(challenge)) problems.push("la pantalla no recibe un set de ítems restringido al participante");
if (/score|leaderboard|ranking/i.test(challenge)) problems.push("el reto familiar mezcla un tablero global");
if (problems.length) {
  console.error("✗ familia-nunca-mezcla\n\n  · " + problems.join("\n  · "));
  process.exit(1);
}
console.log("familia-nunca-mezcla: PASS (listas separadas · vínculo revocable · porras cerradas)");
