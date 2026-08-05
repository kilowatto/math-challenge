import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const migration = fs.readFileSync(path.join(root, "migrations/0022_clubs_adultos.sql"), "utf8");
const forbidden = /loser|penalty|forfeit|castigo|chat|mensaje|message/i;
const violations = [];
for (const line of migration.split("\n")) {
  if (/CREATE TABLE|\bTEXT\b/i.test(line) && forbidden.test(line)) violations.push(line.trim());
}
const pages = path.join(root, "apps/web/src/pages/[locale]/app/clubes");
if (fs.existsSync(pages)) {
  const files = fs.readdirSync(pages, { recursive: true }).filter((name) => String(name).endsWith(".astro"));
  for (const name of files) {
    const body = fs.readFileSync(path.join(pages, name), "utf8");
    if (/chat|mensaj|message/i.test(body)) violations.push(`${name}: superficie de mensajería`);
  }
}
if (violations.length) {
  console.error("club-sin-chat: FAIL");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}
console.log("club-sin-chat: PASS");
