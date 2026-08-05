import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migration = fs.readFileSync(path.join(root, "migrations/0023_nucleo_familiar.sql"), "utf8");
const roster = fs.readFileSync(path.join(root, "apps/web/src/pages/api/familia.ts"), "utf8");
const link = fs.readFileSync(path.join(root, "apps/web/src/pages/api/familia-vinculo.ts"), "utf8");
const problems = [];
if (!/CREATE TABLE household_link/.test(migration)) problems.push("falta household_link");
if (!/CREATE TABLE family_challenge/.test(migration)) problems.push("falta family_challenge");
if (!/CREATE TABLE family_challenge_result/.test(migration)) problems.push("falta family_challenge_result");
if (!/CREATE TABLE family_cheer/.test(migration)) problems.push("falta family_cheer");
if (/UNION\s+ALL|UNION\s+SELECT/i.test(roster)) problems.push("la vista familiar une las listas con UNION");
if (/chat|mensaje|texto libre/i.test(migration + roster + link)) problems.push("la superficie familiar contiene canal de texto");
if (!/REACCIONES_FAMILIA/.test(roster)) problems.push("las porras no usan el conjunto cerrado");
if (!/invite_code/.test(link) || !/revoked_at/.test(link)) problems.push("el vínculo no tiene código revocable");
if (problems.length) {
  console.error("✗ familia-nunca-mezcla\n\n  · " + problems.join("\n  · "));
  process.exit(1);
}
console.log("familia-nunca-mezcla: PASS (listas separadas · vínculo revocable · porras cerradas)");
