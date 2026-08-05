import type { Item } from "./item.ts";

const variacion = null;

function figuras(
  id: string,
  habilidad: string,
  nivel: number,
  clave: string,
  vars: Record<string, number | string>,
  respuesta: string,
  distractores: Array<{ valor: string; causa: string }>,
  dibujos: Record<string, { clave: string; glifo: string; cuantos?: number }>,
): Item {
  return {
    id,
    rama: "03",
    habilidad,
    nivel,
    formato: "toca_la_respuesta",
    enunciado: { clave, vars },
    respuesta: { valor: respuesta, tol: 0 },
    errores: distractores,
    dibujos,
    proposito: nivel < 8 ? "clasificar" : "evaluar",
    variacion,
  };
}

function numero(id: string, habilidad: string, nivel: number, clave: string, vars: Record<string, number | string>, respuesta: number, errores: number[]): Item {
  return {
    id,
    rama: "03",
    habilidad,
    nivel,
    formato: "toca_la_respuesta",
    enunciado: { clave, vars },
    respuesta: { valor: respuesta, tol: 0 },
    errores: errores.map((valor, index) => ({ valor, causa: `error.logi.${index + 1}` })),
    proposito: "interpretar",
    variacion,
  };
}

const FIGURAS = {
  circulo_rojo: { clave: "logi.figura.circulo_rojo", glifo: "🔴" },
  cuadrado_rojo: { clave: "logi.figura.cuadrado_rojo", glifo: "🟥" },
  circulo_azul: { clave: "logi.figura.circulo_azul", glifo: "🔵" },
  circulo_grande_azul: { clave: "logi.figura.circulo_grande_azul", glifo: "🔵" },
  cuadrado_chico_rojo: { clave: "logi.figura.cuadrado_chico_rojo", glifo: "▫️" },
  cuadrado_chico_azul: { clave: "logi.figura.cuadrado_chico_azul", glifo: "▪️" },
  circulo_grande_rojo: { clave: "logi.figura.circulo_grande_rojo", glifo: "🔴" },
  caja_a: { clave: "logi.opcion.caja_a", glifo: "🅰️" },
  caja_b: { clave: "logi.opcion.caja_b", glifo: "🅱️" },
  caja_c: { clave: "logi.opcion.caja_c", glifo: "©️" },
  si: { clave: "logi.opcion.si", glifo: "✅" },
  no: { clave: "logi.opcion.no", glifo: "❌" },
  no_se_puede_saber: { clave: "logi.opcion.no_se_puede_saber", glifo: "❔" },
  no_es_grande_o_no_es_roja: { clave: "logi.opcion.no_es_grande_o_no_es_roja", glifo: "🔀" },
  no_es_grande_y_no_es_roja: { clave: "logi.opcion.no_es_grande_y_no_es_roja", glifo: "🔗" },
  es_chica_y_azul: { clave: "logi.opcion.es_chica_y_azul", glifo: "🔵" },
  algunos_son_rojos: { clave: "logi.opcion.algunos_son_rojos", glifo: "🔴" },
  todos_son_rojos: { clave: "logi.opcion.todos_son_rojos", glifo: "🔴🔴" },
  ninguno_es_azul: { clave: "logi.opcion.ninguno_es_azul", glifo: "⚪" },
  la_mitad_son_rojos: { clave: "logi.opcion.la_mitad_son_rojos", glifo: "🔴🔵" },
  todos_menos_uno: { clave: "logi.opcion.todos_menos_uno", glifo: "🔎" },
};

export function generarBancoLogi(): Item[] {
  return [
    figuras("n4-logi-atributos", "LOGI-ATRIBUTOS", 4, "logi.atributos.doble_regla", { regla1: "roja", regla2: "redonda" }, "circulo_rojo", [
      { valor: "cuadrado_rojo", causa: "error.logi.cumplio_una_sola_regla" },
      { valor: "circulo_azul", causa: "error.logi.cumplio_una_sola_regla" },
    ], FIGURAS),
    { ...figuras("n5-logi-regla-o", "LOGI-ATRIBUTOS", 5, "logi.atributos.regla_o", { regla1: "grande", regla2: "roja" }, "circulo_grande_azul", [
      { valor: "cuadrado_chico_azul", causa: "error.logi.no_cumple_ninguna" },
      { valor: "circulo_grande_rojo", causa: "error.logi.pidio_las_dos" },
    ], FIGURAS), tambienCorrectas: [{ valor: "cuadrado_chico_rojo", razon: "razon.logi.tambien_cumple_o" }] },
    figuras("n6-logi-cajas", "LOGI-ACERTIJOS", 6, "logi.acertijo.tres_cajas", {}, "caja_b", [
      { valor: "caja_a", causa: "error.logi.siguio_afirmacion" },
      { valor: "caja_c", causa: "error.logi.confundio_caja" },
    ], FIGURAS),
    figuras("n7-logi-contrapositiva", "LOGI-ACERTIJOS", 7, "logi.acertijo.zorbos", { criatura: "zorbo", color: "azul" }, "no", [
      { valor: "si", causa: "error.logi.asumio_inversa" },
      { valor: "no_se_puede_saber", causa: "error.logi.confundio_certeza" },
    ], FIGURAS),
    numero("n8-logi-tabla-y", "LOGI-TABLAS", 8, "logi.tabla.dos_variables_y", { regla: "roja Y redonda" }, 1, [2, 4, 0]),
    numero("n9-logi-tabla-tres", "LOGI-TABLAS", 9, "logi.tabla.tres_interruptores", { necesarios: "A y B" }, 2, [4, 1, 8]),
    figuras("n10-logi-demorgan", "LOGI-TABLAS", 10, "logi.demorgan.negar_compuesta", { regla1: "grande", regla2: "roja" }, "no_es_grande_o_no_es_roja", [
      { valor: "no_es_grande_y_no_es_roja", causa: "error.logi.nego_y_por_o" },
      { valor: "es_chica_y_azul", causa: "error.logi.nego_atributos" },
    ], FIGURAS),
    figuras("n11-logi-predicados", "LOGI-PREDICADOS", 11, "logi.predicados.pecera", { rojos: 3, azules: 2 }, "algunos_son_rojos", [
      { valor: "todos_son_rojos", causa: "error.logi.confundio_alguno" },
      { valor: "ninguno_es_azul", causa: "error.logi.nego_subconjunto" },
      { valor: "la_mitad_son_rojos", causa: "error.logi.no_conto_total" },
    ], FIGURAS),
    figuras("n12-logi-cuantificadores", "LOGI-PREDICADOS", 12, "logi.predicados.negacion", { regla: "todos los números son pares" }, "todos_menos_uno", [
      { valor: "algunos_son_rojos", causa: "error.logi.confundio_negacion" },
      { valor: "ninguno_es_azul", causa: "error.logi.nego_predicado" },
    ], FIGURAS),
  ];
}
