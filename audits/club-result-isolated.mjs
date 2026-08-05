import fs from "node:fs";
const files = [
  "apps/web/src/lib/club-retos.ts",
  "apps/web/src/pages/api/clubes/reto/index.ts",
  "apps/web/src/pages/api/clubes/reto/resolver.ts",
];
const source = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
if (/score_totals|league_duel|leaderboard/i.test(source)) {
  console.error("club-result-isolated: FAIL — el reto toca una superficie global");
  process.exit(1);
}
for (const needle of ["club_challenge_result", "club_challenge", "puntuarRespuestas"]) {
  if (!source.includes(needle)) {
    console.error(`club-result-isolated: FAIL — falta ${needle}`);
    process.exit(1);
  }
}
console.log("club-result-isolated: PASS");
