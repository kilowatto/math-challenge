#!/usr/bin/env node
// Auditor determinista — ningún slot de misión queda vacío, y ninguna es incumplible
//
// Hace cumplir: #211, #217, #218, #228, D-018, D-034, y el mismo principio que
// el criterio de F4 «el programador nunca dice vuelve mañana».
//
// ─── Por qué existe ───────────────────────────────────────────────────────
//
// Una misión que no se puede cumplir es peor que no tener misión. Y hay cuatro
// formas de llegar ahí, ninguna de las cuales rompe nada visible:
//
//   1. **El perfil nuevo.** Sin liga, sin nada dominado, sin F4 desplegado: seis
//      de los diez tipos son inelegibles el primer día. Si el algoritmo no
//      rellena, el niño abre la aplicación y ve un menú de una misión, o de
//      ninguna. Es el caso que ataca la autocrítica §10.6 del diseño.
//   2. **F4 todavía no existe** (#228). `resumenF4 === null` no significa «no
//      hay nada que repasar»: significa que no hay a quién preguntar. Si eso
//      bloqueara la asignación, F7 no se podría desplegar hasta que F4 aterrice.
//   3. **`duelo` sin opt-in** (#218). D-018 lo decidió opt-in y 8+. Enseñarlo
//      —aunque sea «bloqueado, actívalo para intentarlo»— es un empujón hacia una
//      función que ya se decidió opcional, y roza el *nagging* que `mc-17`
//      nombra por su nombre.
//   4. **Dos slots con el mismo tipo.** Sale de un fallback escrito de buena fe:
//      «si no hay nada elegible, pon `volumen`» — dos veces.
//
// ─── Cómo comprueba ───────────────────────────────────────────────────────
//
//   · ESTÁTICO — que no haya un segundo selector de misiones fuera del motor,
//     mismo patrón que `motor-puntuacion` y `motor-xp` imponen para sus
//     fórmulas. Dos selectores dan dos menús para el mismo niño el mismo día, y
//     el que se vea depende de quién llamó.
//   · DINÁMICO — **ejecuta** el motor sobre la matriz entera de estados en los
//     que puede estar un aprendiz: 8 perfiles × 7 días × 5 bandas × 6 formas del
//     resumen de F4 (incluida su ausencia) × 6 formas del resumen de liga. En
//     cada una exige las misiones de su banda (D-103: 3 en PRIMARIA y
//     SECUNDARIA, 4 en SERIO/JR/PRO), distintas entre sí, y **todas cumplibles
//     con los insumos de ese día**. Es la única forma de saberlo: la regla no se
//     lee en el código, se mide sobre la salida.
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Si la misión es cumplible con el CONTENIDO que existe. `descubre` pide
//    jugar un modo que no jugaste esta semana, y si el banco no tiene retos de
//    ese modo en esa banda, la misión es formalmente elegible e imposible en la
//    práctica. Eso es contenido (mc-40) y lo revisa una persona.
//  · Si 3 y 4 son los números correctos. Son `[criterio propio]` con la
//    evidencia escrita al lado, decididos por el dueño el 2026-08-03 (D-103).

import { archivos, leer, informar, sinComentarios, existe } from "./lib/repo.mjs";
import {
  TIPOS_DE_MISION,
  MISIONES_POR_DIA,
  ORDEN_DE_RESPALDO,
  ORDEN_DE_BANDAS,
  definicionDe,
  tieneMenuDeMisiones,
  elegirMisionesDelDia,
} from "../packages/motor/src/misiones.ts";

const MODULO = "packages/motor/src/misiones.ts";

/**
 * La tabla de precondiciones de §3 del diseño, **reescrita aquí a mano**.
 *
 * No se importa `definicionDe(t).elegible` para juzgar la salida, y ésa es toda
 * la diferencia entre este auditor y uno decorativo. Si la comprobación usara la
 * misma función que el motor usa para elegir, sería cierta por construcción:
 * ablandar una precondición ablandaría a la vez la regla y su guardián, y el
 * auditor **aprobaría su propia violación** (D-070).
 *
 * Que sean dos fuentes independientes es el punto — igual que
 * `cosmeticos-deterministas` cruza el enum del módulo contra el CHECK del
 * esquema. Cambiar una precondición de verdad exige cambiar el módulo, el
 * diseño y este renglón, que es exactamente el trámite que debe costar.
 */
const PRECONDICION = {
  volumen: () => true,
  variedad: () => true,
  repaso: (f4) => f4 !== null && f4.habilidadesEnRepaso.length > 0,
  dominio: (f4) => f4 !== null && f4.habilidadesCercaDeDominio.length > 0,
  problema: () => true,
  fluidez: (f4) => f4 !== null && f4.habilidadesDominadas.length > 0,
  precision: () => true,
  descubre: () => true,
  // D-018: opt-in y 8+. Y además en una liga, porque un duelo sin liga contra
  // quién no se puede cumplir (#217).
  duelo: (_f4, liga) => liga.dueloOptIn === true && liga.enLiga === true,
  meta_de_liga: (_f4, liga) => liga.enLiga === true,
};

const problemas = [];
const notas = [];
let revisados = 0;

if (!existe(MODULO)) {
  problemas.push(
    `${MODULO} no existe. Este auditor ejecuta el motor, así que sin él no comprueba nada — y ` +
      "«no comprobé» nunca puede leerse como «está bien».",
  );
}

// ─── 1. Un solo selector de misiones ─────────────────────────────────────────

const DEFINE_SELECTOR =
  /(?:function|const)\s+\w*(?:elegirMision|seleccionarMision|escogerMision|pickMission|chooseMission|generarMision)\w*\s*[=(]/i;

for (const archivo of archivos(/\.(ts|tsx|js|jsx|mjs)$/).filter((f) => /^(apps|packages|workers)\//.test(f))) {
  revisados++;
  if (archivo === MODULO || /\.prueba\./.test(archivo)) continue;
  const texto = sinComentarios(leer(archivo) ?? "");
  if (DEFINE_SELECTOR.test(texto)) {
    problemas.push(
      `${archivo} define su propio selector de misiones fuera de ${MODULO}. Dos selectores dan ` +
        "dos menús para el mismo niño el mismo día, y el que se vea depende de quién llamó — que " +
        "es cómo «determinista desde (perfil, día)» deja de significar nada.",
    );
  }
}

// ─── 2. Se EJECUTA sobre la matriz entera ────────────────────────────────────

if (existe(MODULO)) {
  const PERFILES = ["p-01", "p-02", "p-03", "p-04", "0", "ñ-áé", "adulto-9f2", "x".repeat(64)];
  const DIAS = ["2026-01-01", "2026-02-28", "2026-03-08", "2026-06-15", "2026-08-02", "2026-11-30", "2026-12-31"];
  const VACIO = { habilidadesEnRepaso: [], habilidadesCercaDeDominio: [], habilidadesDominadas: [] };
  const F4 = [
    null, // #228: F4 no desplegado
    VACIO,
    { ...VACIO, habilidadesEnRepaso: ["K01"] },
    { ...VACIO, habilidadesCercaDeDominio: ["K02"] },
    { ...VACIO, habilidadesDominadas: ["K03"] },
    { habilidadesEnRepaso: ["K01"], habilidadesCercaDeDominio: ["K02"], habilidadesDominadas: ["K03"] },
  ];
  const LIGAS = [
    { enLiga: false, dueloOptIn: false, metaColectivaHoy: null },
    { enLiga: false, dueloOptIn: true, metaColectivaHoy: null }, // opt-in viejo, sin liga hoy
    { enLiga: true, dueloOptIn: false, metaColectivaHoy: null },
    { enLiga: true, dueloOptIn: false, metaColectivaHoy: { objetivo: 150, llevan: 0 } },
    { enLiga: true, dueloOptIn: true, metaColectivaHoy: { objetivo: 150, llevan: 40 } },
    { enLiga: true, dueloOptIn: true, metaColectivaHoy: { objetivo: 150, llevan: 150 } },
  ];

  let combinaciones = 0;
  let vacios = 0;
  let repetidos = 0;
  let incumplibles = 0;
  let duelosSinOptIn = 0;

  for (const perfil of PERFILES) {
    for (const dia of DIAS) {
      for (const banda of ORDEN_DE_BANDAS) {
        for (const f4 of F4) {
          for (const liga of LIGAS) {
            combinaciones++;
            let misiones;
            try {
              misiones = elegirMisionesDelDia(perfil, dia, banda, f4, liga);
            } catch (err) {
              problemas.push(
                `${MODULO}: lanzó con (${perfil}, ${dia}, ${banda}, F4=${f4 === null ? "null" : "presente"}, ` +
                  `liga=${JSON.stringify(liga)}): ${err.message}. Un estado real de un aprendiz no ` +
                  "puede hacer reventar la asignación del día.",
              );
              continue;
            }

            if (misiones.length !== MISIONES_POR_DIA[banda] && vacios++ < 3) {
              problemas.push(
                `${MODULO}: (${perfil}, ${dia}, ${banda}) recibió ${misiones.length} misión(es) y ` +
                  `deben ser ${MISIONES_POR_DIA[banda]} (D-103: 3 en menor, 4 en adulta). #217: ningún slot queda vacío, porque una misión ` +
                  "que no se puede cumplir es peor que no tener misión — y ninguna es peor todavía.",
              );
            }

            const tipos = misiones.map((m) => m.tipo);
            if (new Set(tipos).size !== tipos.length && repetidos++ < 3) {
              problemas.push(
                `${MODULO}: (${perfil}, ${dia}, ${banda}) recibió un tipo repetido: ${tipos.join(", ")}. ` +
                  "Varias tarjetas con la misma misión no son misiones distintas.",
              );
            }

            for (const m of misiones) {
              const precondicion = PRECONDICION[m.tipo];
              if (typeof precondicion !== "function") {
                problemas.push(
                  `${MODULO}: devolvió el tipo \`${m.tipo}\`, que no está en la tabla de ` +
                    "precondiciones de §3 del diseño reescrita en este auditor. Un tipo nuevo se " +
                    "agrega en los dos sitios, o el guardián deja de saber qué vigila.",
                );
              } else if (!precondicion(f4, liga) && incumplibles++ < 3) {
                problemas.push(
                  `${MODULO}: (${perfil}, ${dia}, ${banda}) recibió \`${m.tipo}\`, que HOY no es ` +
                    `cumplible con esos insumos (F4=${f4 === null ? "null" : "presente"}, ` +
                    `liga=${JSON.stringify(liga)}). Una misión incumplible es peor que no tener ` +
                    "misión (#217).",
                );
              }
              if (m.tipo === "duelo" && liga.dueloOptIn !== true && duelosSinOptIn++ < 3) {
                problemas.push(
                  `${MODULO}: (${perfil}, ${dia}, ${banda}) recibió \`duelo\` sin opt-in. D-018 lo ` +
                    "decidió opcional y 8+, y #218 prohíbe incluso enseñarlo bloqueado: sería un " +
                    "empujón hacia una función ya decidida opcional, que es el *nagging* que " +
                    "`mc-17` nombra por su nombre.",
                );
              }
            }
          }
        }
      }
    }
  }

  // KINDER no tiene menú, y eso no es un slot vacío: es que no hay slots.
  for (const f4 of F4) {
    for (const liga of LIGAS) {
      const m = elegirMisionesDelDia("p-01", "2026-08-02", "KINDER", f4, liga);
      if (m.length !== 0) {
        problemas.push(
          `${MODULO}: KINDER recibió ${m.length} misión(es). Su «misión diaria» es el reto ` +
            "HISTORIA del día en la Sabana (D-019): una etiqueta interna sobre lo que F5/F6 ya " +
            "construyen, sin UI, sin texto y sin audio nuevos.",
        );
      }
    }
  }
  if (tieneMenuDeMisiones("KINDER") !== false) {
    problemas.push(`${MODULO}: \`tieneMenuDeMisiones("KINDER")\` no dice que no. Ver D-018 y D-073.`);
  }

  // El catálogo del módulo contra la tabla de precondiciones de este archivo.
  // Es el cruce que hace que las dos fuentes sirvan de algo: si divergen, una de
  // las dos está mintiendo y hay que decidir cuál antes de seguir.
  let divergencias = 0;
  for (const t of TIPOS_DE_MISION) {
    const precondicion = PRECONDICION[t];
    if (typeof precondicion !== "function") {
      problemas.push(
        `el catálogo declara el tipo \`${t}\` y este auditor no tiene su precondición escrita. ` +
          "Un tipo nuevo se agrega en los dos sitios (D-070: dos fuentes independientes).",
      );
      continue;
    }
    for (const f4 of F4) {
      for (const liga of LIGAS) {
        if (definicionDe(t).elegible(f4, liga) !== precondicion(f4, liga) && divergencias++ < 3) {
          problemas.push(
            `${MODULO}: la elegibilidad de \`${t}\` no coincide con la tabla de §3 del diseño ` +
              `(F4=${f4 === null ? "null" : "presente"}, liga=${JSON.stringify(liga)}). El módulo ` +
              `dice ${definicionDe(t).elegible(f4, liga)} y el diseño dice ${precondicion(f4, liga)}.`,
          );
        }
      }
    }
  }

  // La red bajo la red: que haya más tipos incondicionales que slots. Se cuenta
  // sobre la tabla de ESTE archivo, no sobre el módulo, por lo mismo de arriba.
  const incondicionales = TIPOS_DE_MISION.filter((t) =>
    typeof PRECONDICION[t] === "function"
      ? PRECONDICION[t](null, { enLiga: false, dueloOptIn: false, metaColectivaHoy: null })
      : false,
  );
  const maximoDeSlots = Math.max(...Object.values(MISIONES_POR_DIA));
  if (incondicionales.length <= maximoDeSlots) {
    problemas.push(
      `${MODULO}: solo ${incondicionales.length} tipo(s) no tienen precondición ` +
        `(${incondicionales.join(", ")}) y hacen falta más de ${maximoDeSlots} (el máximo de D-103) para garantizar ` +
        "slots distintos a un perfil nuevo. #217 dejaría de poder cumplirse.",
    );
  }
  for (const t of ORDEN_DE_RESPALDO) {
    if (!incondicionales.includes(t)) {
      problemas.push(
        `${MODULO}: \`${t}\` está en ORDEN_DE_RESPALDO y tiene precondición. El respaldo es lo ` +
          "que se usa cuando nada más sirve; si él también puede fallar, no es un respaldo.",
      );
    }
  }

  notas.push(
    `ejecutado: ${combinaciones} estados de aprendiz (perfil × día × banda × F4 × liga), ` +
      `las misiones de su banda (D-103: 3 en PRIMARIA/SECUNDARIA, 4 en SERIO/JR/PRO) distintas y cumplibles en todos`,
  );
  notas.push(`${incondicionales.length} tipos sin precondición: ${incondicionales.join(", ")}`);
  notas.push("KINDER: 0 misiones en toda la matriz, y `tieneMenuDeMisiones` lo dice sin adivinar");
}

informar({
  nombre: "mision-slot-nunca-vacio",
  problemas,
  notas,
  cita: "#211, #217, #218, #228, D-018, D-034",
  revisados,
  resumen: `${revisados} archivo(s) de producto, y el motor ejecutado sobre la matriz de estados`,
  porQueBloquea:
    "un slot vacío o una misión incumplible se ven exactamente igual desde fuera: el niño abre " +
    "la aplicación y tiene menos de lo que se le prometió, o algo que no puede terminar. No " +
    "produce ningún error, así que se descubre semanas después y por un padre.",
  noComprueba: [
    "si la misión es cumplible con el CONTENIDO que existe. `descubre` puede ser formalmente " +
      "elegible e imposible si el banco no tiene retos de ese modo en esa banda — eso es " +
      "contenido (mc-40) y lo revisa una persona.",
    "si 3 y 4 son los números correctos de misiones simultáneas. Son `[criterio propio]` con la " +
      "evidencia escrita al lado, decididos por el dueño el 2026-08-03 (D-103).",
  ],
});
