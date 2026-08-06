import { generarBancoLogi } from "./banco-logi.ts";
import { validarItem, calificarRespuesta } from "./item.ts";

const banco = generarBancoLogi();
if (banco.length !== 9) throw new Error(`se esperaban 9 retos LOGI, hay ${banco.length}`);
for (const item of banco) {
  const problemas = validarItem(item);
  if (problemas.length) throw new Error(`${item.id}: ${problemas.join(" | ")}`);
  if (item.rama !== "03") throw new Error(`${item.id}: falta rama MSC 03`);
  if (calificarRespuesta(item, item.respuesta.valor).acc !== 1) throw new Error(`${item.id}: la respuesta autorada no califica`);
}
const reglaO = banco.find((item) => item.id === "n5-logi-regla-o");
if (!reglaO || calificarRespuesta(reglaO, "cuadrado_chico_rojo").acc !== 1) throw new Error("D-048: falta la segunda respuesta defendible de LOGI");
console.log("banco-logi: PASS (9 retos · rama MSC 03 · D-048)");
