import fs from "node:fs";
const file = fs.readFileSync("apps/web/src/pages/api/larry/moderar.ts", "utf8");
const required = [
  "if (!env.AI)",
  "moderacion_no_disponible",
  "verdict === \"pasa\" ? \"aprobada\" : \"rechazada\"",
  "stake_moderation_log",
  "club_stake",
];
const missing = required.filter((needle) => !file.includes(needle));
if (missing.length) {
  console.error(`prenda-falla-cerrada: FAIL (${missing.join(", ")})`);
  process.exit(1);
}
console.log("prenda-falla-cerrada: PASS");
