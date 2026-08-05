import { generarBancoAdulto } from "../packages/motor/src/banco-adulto.ts";
import { generarBancoCierre } from "../packages/motor/src/banco-cierre.ts";
import { generarBancoPrimaria } from "../packages/motor/src/banco-primaria.ts";
import { validarItem } from "../packages/motor/src/item.ts";

const bancos = [...generarBancoPrimaria(), ...generarBancoAdulto(), ...generarBancoCierre()];
const problemas = [];
for (let nivel = 4; nivel <= 12; nivel++) {
  const items = bancos.filter((item) => item.nivel === nivel);
  if (items.length < 6) problemas.push(`N${nivel}: ${items.length}/6`);
  for (const item of items) {
    const errores = validarItem(item);
    if (errores.length) problemas.push(`${item.id}: ${errores.join("; ")}`);
  }
}
if (problemas.length) {
  console.error("piso-seis-retos: FAIL");
  for (const problema of problemas) console.error(`- ${problema}`);
  process.exit(1);
}
console.log(`piso-seis-retos: PASS (${bancos.length} ítems; N4-N12 ≥ 6)`);
