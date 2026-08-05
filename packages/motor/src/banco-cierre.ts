import type { Item } from "./item.ts";

type Especificacion = {
  id: string;
  clave: string;
  vars: Record<string, number>;
  respuesta: number;
  errores: number[];
  tipo: "fijo" | "plantilla";
};

function item(nivel: number, spec: Especificacion): Item {
  return {
    id: spec.id,
    habilidad: `CIERRE_N${nivel}`,
    nivel,
    formato: "toca_la_respuesta",
    enunciado: { clave: spec.clave, vars: spec.vars },
    respuesta: { valor: spec.respuesta, tol: 0 },
    errores: spec.errores.map((valor, index) => ({ valor, causa: `error.cierre.${nivel}.${index + 1}` })),
    proposito: "analizar",
    variacion: {
      varia: spec.tipo === "fijo" ? "la configuración escogida por autoría" : "los parámetros numéricos de la plantilla",
      constante: "la operación y la pregunta matemática",
      por_que: "la respuesta exige aplicar el procedimiento, no reconocer una cifra aislada",
    },
  };
}

const CIERRE: Record<number, Especificacion[]> = {
  7: [
    { id: "cierre-n7-fijo-01", clave: "cierre.suma", vars: { a: 125, b: 87 }, respuesta: 212, errores: [202, 298, 38], tipo: "fijo" },
    { id: "cierre-n7-fijo-02", clave: "cierre.producto", vars: { a: 14, b: 16 }, respuesta: 224, errores: [30, 210, 240], tipo: "fijo" },
    { id: "cierre-n7-plantilla-01", clave: "cierre.fraccion", vars: { p: 3, q: 4, n: 240 }, respuesta: 180, errores: [80, 237, 320], tipo: "plantilla" },
    { id: "cierre-n7-plantilla-02", clave: "cierre.cuadrado", vars: { n: 15 }, respuesta: 225, errores: [30, 214, 240], tipo: "plantilla" },
    { id: "cierre-n7-plantilla-03", clave: "cierre.operaciones", vars: { a: 2, b: 3, c: 4 }, respuesta: 20, errores: [14, 24, 9], tipo: "plantilla" },
    { id: "cierre-n7-plantilla-04", clave: "cierre.secuencia", vars: { a: 7, b: 14, c: 21 }, respuesta: 28, errores: [27, 35, 42], tipo: "plantilla" },
  ],
  11: [
    { id: "cierre-n11-fijo-01", clave: "cierre.ecuacion", vars: { a: 3, b: 5, c: 20 }, respuesta: 5, errores: [15, 25, 3], tipo: "fijo" },
    { id: "cierre-n11-fijo-02", clave: "cierre.potencia", vars: { a: 2, b: 8 }, respuesta: 256, errores: [16, 64, 512], tipo: "fijo" },
    { id: "cierre-n11-plantilla-01", clave: "cierre.raiz", vars: { n: 144 }, respuesta: 12, errores: [72, 14, 24], tipo: "plantilla" },
    { id: "cierre-n11-plantilla-02", clave: "cierre.proporcion", vars: { a: 7, b: 12, c: 84 }, respuesta: 12, errores: [7, 19, 588], tipo: "plantilla" },
    { id: "cierre-n11-plantilla-03", clave: "cierre.mcd", vars: { a: 84, b: 126 }, respuesta: 42, errores: [6, 14, 210], tipo: "plantilla" },
    { id: "cierre-n11-plantilla-04", clave: "cierre.secuencia", vars: { a: 3, b: 9, c: 27 }, respuesta: 81, errores: [45, 54, 108], tipo: "plantilla" },
  ],
  12: [
    { id: "cierre-n12-fijo-01", clave: "cierre.ecuacion", vars: { a: 5, b: 7, c: 38 }, respuesta: 9, errores: [6, 31, 45], tipo: "fijo" },
    { id: "cierre-n12-fijo-02", clave: "cierre.potencia", vars: { a: 2, b: 10 }, respuesta: 1024, errores: [20, 100, 2048], tipo: "fijo" },
    { id: "cierre-n12-plantilla-01", clave: "cierre.raiz", vars: { n: 625 }, respuesta: 25, errores: [312, 35, 50], tipo: "plantilla" },
    { id: "cierre-n12-plantilla-02", clave: "cierre.mcd", vars: { a: 180, b: 252 }, respuesta: 36, errores: [18, 24, 432], tipo: "plantilla" },
    { id: "cierre-n12-plantilla-03", clave: "cierre.proporcion", vars: { a: 9, b: 15, c: 135 }, respuesta: 25, errores: [15, 24, 1215], tipo: "plantilla" },
    { id: "cierre-n12-plantilla-04", clave: "cierre.operaciones", vars: { a: 6, b: 4, c: 3 }, respuesta: 25, errores: [18, 30, 10], tipo: "plantilla" },
  ],
};

export function generarBancoCierre(): Item[] {
  return Object.entries(CIERRE).flatMap(([nivel, specs]) => specs.map((spec) => item(Number(nivel), spec)));
}

export function nivelesDelCierre(): number[] {
  return Object.keys(CIERRE).map(Number).sort((a, b) => a - b);
}
