import fs from "node:fs";
const files = [
  "apps/web/src/lib/club-retos.ts",
  "apps/web/src/pages/api/clubes/reto/index.ts",
  "apps/web/src/pages/api/clubes/reto/resolver.ts",
  "apps/web/src/pages/[locale]/app/clubes/[id]/reto/[challenge].astro",
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
if (!/api\/clubes\/reto\?challenge/.test(source) || !/api\/clubes\/reto\/resolver/.test(source)) {
  console.error("club-result-isolated: FAIL — falta pantalla jugable conectada al resultado aislado");
  process.exit(1);
}
console.log("club-result-isolated: PASS");
