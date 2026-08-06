import fs from "node:fs";
const file = fs.readFileSync("apps/web/src/pages/api/clubes/prenda/aceptar.ts", "utf8");
for (const needle of ["leerSesionAdulto", "solo_adultos", "club_stake_acceptance", "m.user_id"]) {
  if (!file.includes(needle)) {
    console.error(`prenda-aceptacion-adulto: FAIL (${needle})`);
    process.exit(1);
  }
}
console.log("prenda-aceptacion-adulto: PASS");
