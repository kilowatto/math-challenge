#!/usr/bin/env node
// Casos del enrutado del mapa de KINDER — D-152.
//
//     node --experimental-strip-types apps/web/src/lib/mapa-kids.prueba.mjs
//
// Por qué existen. Las dos promesas de `mapa-kids.ts` no rompen nada visible al
// romperse, que es la definición de lo que hay que medir:
//
//   · Un lugar POR VISITAR no es enlace. Si `destinoDeLugar` devuelve una URL
//     para él, el mapa gana un candado que la guía de estilo prohíbe — y nadie
//     lo ve hasta que un niño toca un lugar que no debía llevar a ningún sitio.
//   · El estado del lugar sale del resumen de F4 y de ninguna otra parte. Una
//     fila sin ítems respondidos que marque «en curso» es un lugar fantasma: el
//     niño ve empezado lo que nunca tocó.
//
// Y una composición, que es la que importa de verdad: las fases traducidas
// alimentan `construirSendero()` del motor y el resultado tiene que seguir
// siendo un sendero válido — sin un solo campo numérico (#232) y con Larry en
// exactamente un lugar.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { fasesDelSendero, destinoDeLugar, rutaMapaKids } from "./mapa-kids.ts";
import { construirSendero } from "../../../../packages/motor/src/mapa.ts";
import { HABILIDADES_KINDER } from "../../../../packages/motor/src/banco-kinder.ts";

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
const cierto = (v, msg) => {
  if (!v) throw new Error(msg);
};

const fila = (skillId, etapa, respondidos) => ({
  skillId,
  etapa,
  respondidos,
  // El resto del resumen existe pero este módulo no lo mira — y la prueba lo
  // demuestra pasando valores que FALLARÍAN si alguien los usara: un escalón
  // altísimo no puede «subir» un lugar del mapa, porque el mapa no lo lee.
  nivel: 12,
  ubicando: false,
  venceEn: null,
  habilidad: 99,
});

console.log("\n== enrutado del mapa de KINDER (D-152) ==\n");

// --- fasesDelSendero: del resumen de F4 a las fases del sendero -------------

caso("sin resumen no hay fases: los catorce lugares quedan por visitar", () => {
  igual(fasesDelSendero([]), {}, "resumen vacío");
});

caso("aprendido es terminado; con ítems respondidos, en curso", () => {
  igual(
    fasesDelSendero([fila("K03", "aprendido", 40), fila("K07", "practicando", 3)]),
    { K03: "terminado", K07: "en_curso" },
    "traducción de etapas",
  );
});

caso("una fila sin ítems respondidos NO marca el lugar como empezado", () => {
  igual(fasesDelSendero([fila("K05", "sin_ver", 0)]), {}, "fila fantasma");
});

caso("la etapa provisional también es en curso", () => {
  igual(fasesDelSendero([fila("K11", "provisional", 12)]), { K11: "en_curso" }, "provisional");
});

// --- destinoDeLugar: qué lugares son enlace ---------------------------------

caso("el lugar por visitar NO es enlace — se ve y no se pisa", () => {
  igual(destinoDeLugar("es-MX", "K04", "por_visitar"), null, "por_visitar");
});

caso("el lugar en curso lleva al reto de ese lugar", () => {
  igual(
    destinoDeLugar("es-MX", "K04", "en_curso"),
    "/es-MX/app/kids/jugar/?habilidad=K04",
    "en_curso",
  );
});

caso("el lugar terminado se puede rejugar siempre — nada se bloquea hacia atrás", () => {
  igual(
    destinoDeLugar("de-DE", "K01", "terminado"),
    "/de-DE/app/kids/jugar/?habilidad=K01",
    "terminado",
  );
});

caso("el destino lleva el id del lugar y ningún número de dificultad (D-017)", () => {
  const url = destinoDeLugar("en", "K14", "terminado");
  cierto(url !== null && url.includes("habilidad=K14"), "lleva el lugar");
  cierto(!/dificultad|level|nivel/i.test(url), "sin dificultad en la URL");
});

// --- La composición: fases traducidas + construirSendero del motor ----------

caso("las fases traducidas alimentan un sendero válido de los 14 lugares", () => {
  const orden = Object.keys(HABILIDADES_KINDER);
  igual(orden.length, 14, "los lugares de la Sabana (D-019)");

  const sendero = construirSendero(
    orden,
    fasesDelSendero([
      fila("K01", "aprendido", 50),
      fila("K02", "aprendido", 44),
      fila("K03", "practicando", 6),
    ]),
  );

  igual(sendero.lugares.length, 14, "catorce lugares");
  igual(sendero.lugares[0].estado, "terminado", "K01 terminado");
  igual(sendero.lugares[2].estado, "en_curso", "K03 en curso");
  igual(sendero.lugares[3].estado, "por_visitar", "K04 por visitar");
  // Larry está en el primer lugar sin terminar, y solo en uno.
  igual(sendero.lugares.filter((l) => l.aqui).length, 1, "un solo «aquí»");
  igual(sendero.lugares[2].aqui, true, "Larry en K03");
  // D-190: el modelo del sendero SOLO lleva `secuencia` (posición en el
  // camino) — ningún otro número se cuela (#232 sigue vivo para todo lo
  // demás: nunca un porcentaje, nunca una cifra de dominio).
  const soloSecuencia = JSON.stringify(sendero).replace(/"secuencia":\d+/g, '"secuencia":N');
  cierto(!/:"?\d/.test(soloSecuencia), "solo `secuencia` lleva número en el modelo");
});

caso("todo terminado: Larry se queda en el último lugar, que se puede rejugar", () => {
  const orden = Object.keys(HABILIDADES_KINDER);
  const sendero = construirSendero(
    orden,
    fasesDelSendero(orden.map((k) => fila(k, "aprendido", 30))),
  );
  igual(sendero.lugares.filter((l) => l.aqui).length, 1, "un solo «aquí»");
  igual(sendero.lugares[13].aqui, true, "Larry en el último");
  // Y cada lugar sigue teniendo destino: rejugar nunca se bloquea.
  for (const l of sendero.lugares) {
    cierto(destinoDeLugar("en", l.lugar, l.estado) !== null, `${l.lugar} rejugable`);
  }
});

caso("una habilidad que no es lugar de la Sabana no cuela al sendero", () => {
  // El resumen puede traer filas de cualquier habilidad del banco; el sendero
  // solo conoce sus catorce lugares. Las de más se ignoran, no se pintan.
  const sendero = construirSendero(
    ["K01", "K02"],
    fasesDelSendero([fila("K01", "aprendido", 9), fila("X99", "aprendido", 9)]),
  );
  igual(sendero.lugares.length, 2, "solo los lugares del orden");
});

caso("la ruta del mapa del niño lleva barra final y locale", () => {
  igual(rutaMapaKids("pt-BR"), "/pt-BR/app/kids/mapa/", "ruta");
});

console.log(`\n${corridos} casos, ${fallos} fallo(s)`);
if (fallos > 0) process.exit(1);
