#!/usr/bin/env node
// Casos del evaluador de cosméticos — D-014, línea roja #5, #252, #254.
//
//     node --experimental-strip-types packages/motor/src/cosmeticos.prueba.mjs
//
// Por qué existen. «Determinista» es una palabra que se puede escribir en un
// comentario y no cumplir: basta con iterar un objeto, ordenar por el orden de
// llegada de una consulta a D1, o meter un `Math.random()` en un desempate «que
// da igual». Lo que sigue lo mide en vez de afirmarlo.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import {
  TIPOS_DE_EVENTO,
  cosmeticosQueDesbloquea,
  validarReglas,
  ReglaInvalida,
} from "./cosmeticos.ts";
import { calificar } from "./puntuacion.ts";

let fallos = 0;
let corridos = 0;

function caso(nombre, fn) {
  corridos++;
  try {
    fn();
    console.log(`  ✓ ${nombre}`);
  } catch (err) {
    fallos++;
    console.error(`  ✗ ${nombre}`);
    console.error(`      ${err.message}`);
  }
}

const igual = (a, b, msg) => {
  const [x, y] = [JSON.stringify(a), JSON.stringify(b)];
  if (x !== y) throw new Error(`${msg ?? "valor"}: esperaba ${y}, obtuve ${x}`);
};
const lanza = (fn, fragmento) => {
  try {
    fn();
  } catch (err) {
    if (fragmento && !String(err.message).includes(fragmento)) {
      throw new Error(`lanzó, pero por otra razón: "${err.message}"`);
    }
    return err;
  }
  throw new Error("no lanzó");
};

const regla = (cosmeticId, tipoEvento, parametro = null, umbral = null) => ({
  cosmeticId,
  tipoEvento,
  parametro,
  umbral,
});

// Un catálogo mínimo que usa los SEIS tipos de evento.
const CATALOGO = [
  regla("melena_k01", "habilidad_dominada", "K01"),
  regla("melena_k02", "habilidad_dominada", "K02"),
  regla("marco_bienvenida", "primer_intento"),
  regla("marco_cinco", "habilidades_dominadas_conteo", null, 5),
  regla("marco_catorce", "habilidades_dominadas_conteo", null, 14),
  regla("sombrero_semana", "racha_dias", null, 7),
  regla("capa_liga", "liga_top_pct", null, 10),
  regla("insignia_rango", "nivel_alcanzado", null, 5),
];

console.log("\n== evaluador de cosméticos — línea roja #5, cero azar ==\n");

// --- Los seis tipos de evento (#254) ----------------------------------------

caso("el enum tiene los SEIS tipos, ni cinco ni siete", () => {
  igual([...TIPOS_DE_EVENTO].sort(), [
    "habilidad_dominada",
    "habilidades_dominadas_conteo",
    "liga_top_pct",
    "nivel_alcanzado",
    "primer_intento",
    "racha_dias",
  ], "enum cerrado");
});

caso("habilidad_dominada desbloquea la pieza de ESA habilidad y ninguna otra", () => {
  igual(
    cosmeticosQueDesbloquea({ tipo: "habilidad_dominada", skillId: "K01" }, CATALOGO),
    ["melena_k01"],
  );
  igual(
    cosmeticosQueDesbloquea({ tipo: "habilidad_dominada", skillId: "K02" }, CATALOGO),
    ["melena_k02"],
  );
  igual(
    cosmeticosQueDesbloquea({ tipo: "habilidad_dominada", skillId: "K99" }, CATALOGO),
    [],
    "una habilidad sin cosmético no desbloquea nada",
  );
});

caso("primer_intento desbloquea el marco de bienvenida", () => {
  igual(cosmeticosQueDesbloquea({ tipo: "primer_intento" }, CATALOGO), ["marco_bienvenida"]);
});

caso("habilidades_dominadas_conteo desbloquea todos los umbrales alcanzados a la vez", () => {
  igual(cosmeticosQueDesbloquea({ tipo: "habilidades_dominadas_conteo", conteo: 4 }, CATALOGO), []);
  igual(cosmeticosQueDesbloquea({ tipo: "habilidades_dominadas_conteo", conteo: 5 }, CATALOGO), ["marco_cinco"]);
  igual(
    cosmeticosQueDesbloquea({ tipo: "habilidades_dominadas_conteo", conteo: 14 }, CATALOGO),
    ["marco_catorce", "marco_cinco"],
    "quien llega de golpe a 14 se lleva los dos, en orden estable",
  );
});

caso("racha_dias y nivel_alcanzado comparan hacia arriba", () => {
  igual(cosmeticosQueDesbloquea({ tipo: "racha_dias", dias: 6 }, CATALOGO), []);
  igual(cosmeticosQueDesbloquea({ tipo: "racha_dias", dias: 7 }, CATALOGO), ["sombrero_semana"]);
  igual(cosmeticosQueDesbloquea({ tipo: "nivel_alcanzado", nivel: 4 }, CATALOGO), []);
  igual(cosmeticosQueDesbloquea({ tipo: "nivel_alcanzado", nivel: 9 }, CATALOGO), ["insignia_rango"]);
});

caso("liga_top_pct compara al revés: un porcentaje MENOR es mejor", () => {
  // La única comparación invertida del módulo. Escribirla como las demás daría
  // el cosmético a quien quedó último.
  igual(cosmeticosQueDesbloquea({ tipo: "liga_top_pct", pct: 3 }, CATALOGO), ["capa_liga"]);
  igual(cosmeticosQueDesbloquea({ tipo: "liga_top_pct", pct: 10 }, CATALOGO), ["capa_liga"]);
  igual(cosmeticosQueDesbloquea({ tipo: "liga_top_pct", pct: 40 }, CATALOGO), []);
});

// --- Determinismo (línea roja #5) -------------------------------------------

caso("misma entrada, misma salida: mil evaluaciones dan el mismo arreglo", () => {
  const logro = { tipo: "habilidades_dominadas_conteo", conteo: 14 };
  const primera = cosmeticosQueDesbloquea(logro, CATALOGO);
  for (let i = 0; i < 1000; i++) {
    igual(cosmeticosQueDesbloquea(logro, CATALOGO), primera, `evaluación ${i}`);
  }
});

caso("el orden de las reglas NO cambia el resultado — 40 barajadas fijas", () => {
  // La baraja es determinista a propósito (un LCG con semilla): esta prueba no
  // puede ser la que introduzca el azar que el módulo prohíbe.
  const logro = { tipo: "habilidades_dominadas_conteo", conteo: 14 };
  const esperado = cosmeticosQueDesbloquea(logro, CATALOGO);
  let semilla = 12345;
  const siguiente = () => (semilla = (semilla * 1103515245 + 12345) % 2147483648) / 2147483648;

  for (let v = 0; v < 40; v++) {
    const barajado = [...CATALOGO];
    for (let i = barajado.length - 1; i > 0; i--) {
      const j = Math.floor(siguiente() * (i + 1));
      [barajado[i], barajado[j]] = [barajado[j], barajado[i]];
    }
    igual(cosmeticosQueDesbloquea(logro, barajado), esperado, `baraja ${v}`);
  }
});

caso("una regla duplicada no produce una entrada duplicada", () => {
  const conRepetida = [...CATALOGO, regla("marco_cinco", "habilidades_dominadas_conteo", null, 5)];
  igual(cosmeticosQueDesbloquea({ tipo: "habilidades_dominadas_conteo", conteo: 5 }, conRepetida), [
    "marco_cinco",
  ]);
});

// --- Idempotencia (#254) ----------------------------------------------------

caso("aplicar el mismo logro dos veces no produce una segunda entrada", () => {
  const logro = { tipo: "habilidad_dominada", skillId: "K01" };
  const primera = cosmeticosQueDesbloquea(logro, CATALOGO, []);
  igual(primera, ["melena_k01"], "la primera vez");
  const segunda = cosmeticosQueDesbloquea(logro, CATALOGO, primera);
  igual(segunda, [], "la segunda vez no hay nada que escribir");
});

caso("lo que ya se tiene no vuelve a salir, aunque el logro lo alcance de nuevo", () => {
  igual(
    cosmeticosQueDesbloquea(
      { tipo: "habilidades_dominadas_conteo", conteo: 14 },
      CATALOGO,
      ["marco_cinco"],
    ),
    ["marco_catorce"],
  );
});

// --- Adversarial: reglas mal formadas (#254) --------------------------------

caso("una regla sin skill_id falla de forma explícita y nombrada, no con un TypeError", () => {
  const rota = [regla("melena_huerfana", "habilidad_dominada", null)];
  const err = lanza(
    () => cosmeticosQueDesbloquea({ tipo: "habilidad_dominada", skillId: "K01" }, rota),
    "melena_huerfana",
  );
  igual(err.name, "ReglaInvalida", "clase");
  igual(err instanceof ReglaInvalida, true, "instancia");
  igual(err.cosmeticId, "melena_huerfana", "trae el id para que se arregle el catálogo");
});

caso("una regla de conteo sin umbral falla nombrada, no comparando contra undefined", () => {
  const rota = [regla("marco_sin_umbral", "habilidades_dominadas_conteo", null, null)];
  const err = lanza(
    () => cosmeticosQueDesbloquea({ tipo: "habilidades_dominadas_conteo", conteo: 99 }, rota),
    "umbral numérico",
  );
  igual(err.cosmeticId, "marco_sin_umbral", "id");
});

caso("una regla rota de OTRO tipo de evento no revienta la evaluación en curso", () => {
  const mezcla = [regla("melena_huerfana", "habilidad_dominada", null), ...CATALOGO];
  igual(cosmeticosQueDesbloquea({ tipo: "primer_intento" }, mezcla), ["marco_bienvenida"]);
});

caso("validarReglas nombra la habilidad que no existe, con el id del cosmético", () => {
  const problemas = validarReglas(CATALOGO, ["K01"]);
  igual(problemas.length, 1, "un solo problema");
  if (!problemas[0].includes("melena_k02") || !problemas[0].includes("K02")) {
    throw new Error(`el mensaje no nombra el cosmético ni la habilidad: ${problemas[0]}`);
  }
});

caso("validarReglas caza un tipo de evento fuera del enum cerrado", () => {
  const problemas = validarReglas([regla("marco_raro", "cumpleanios", null, 1)]);
  igual(problemas.length, 1, "uno");
  if (!problemas[0].includes("enum cerrado")) {
    throw new Error(`no citó el enum cerrado: ${problemas[0]}`);
  }
});

caso("validarReglas acepta el catálogo completo cuando las habilidades existen", () => {
  igual(validarReglas(CATALOGO, ["K01", "K02"]), [], "sin problemas");
});

// --- Un cosmético es una capa visual y nada más (#252, D-010) ---------------

caso("equipar un cosmético no puede cambiar el veredicto: calificar() no lo admite", () => {
  // No es una comprobación de forma: se compone el MISMO intento con un campo
  // de cosmético encima y se compara el número. Si algún día `calificar()`
  // mirara un campo así, este caso lo dice.
  const intento = { banda: "PRIMARIA", nivel: 4, acc: 1, rtMs: 12_000 };
  const conCosmetico = { ...intento, cosmeticoEquipado: "melena_k01", avatar_parts: ["melena_k01"] };
  igual(calificar(conCosmetico), calificar(intento), "el veredicto");
});

console.log(`\n${corridos - fallos}/${corridos} casos pasaron\n`);
if (fallos > 0) process.exit(1);
