#!/usr/bin/env node
// Casos del DUELO — D-018, D-053, D-081, #244.
//
//     node --experimental-strip-types packages/motor/src/duelo.prueba.mjs
//
// Por qué existen. Los tres portones son lo único que separa un duelo de un
// canal entre dos menores, y ninguno falla ruidosamente: un portón mal escrito
// no da error, deja pasar. El caso límite de la edad importa el doble porque
// D-053 quitó el mes, así que la edad de este producto se calcula con un año de
// imprecisión conocida y hay que saber hacia qué lado cae.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import {
  EDAD_MINIMA,
  VENTANA_MS,
  MAXIMO_PENDIENTES,
  puedeRetar,
  crearDuelo,
  haExpirado,
  resolver,
  verDuelo,
} from "./duelo.ts";

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
  if (a !== b) throw new Error(`${msg ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`);
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

const ANIO = 2026;
const listo = { banda: "PRIMARIA", birth_year: 2015, opt_in: true, pendientes_salientes: 0 };
const nuevo = (ahora = 0) =>
  crearDuelo({
    id: "d1",
    cohort_id: "c1",
    challenger_membership_id: "reta",
    challenged_membership_id: "retado",
    item_set: ["i1", "i2", "i3"],
    ahora,
  });

console.log("\n== DUELO ==\n");

// --- Los tres portones (#244) ----------------------------------------------

caso("un participante elegible puede retar — el control positivo", () => {
  igual(puedeRetar(listo, ANIO).puede, true, "PRIMARIA, 11 años, opt-in, sin pendientes");
});

caso("KINDER no duela, y es la banda entera, no la edad", () => {
  const r = puedeRetar({ ...listo, banda: "KINDER", birth_year: 2016 }, ANIO);
  igual(r.puede, false, "un niño de 10 años con tema de kinder tampoco duela");
  igual(r.motivo, "banda_kinder");
});

caso("por debajo de 8 años no se duela", () => {
  igual(EDAD_MINIMA, 8, "D-018 y D-081: 8+");
  const r = puedeRetar({ ...listo, birth_year: ANIO - 7 }, ANIO);
  igual(r.puede, false);
  igual(r.motivo, "edad_insuficiente");
  igual(puedeRetar({ ...listo, birth_year: ANIO - 8 }, ANIO).puede, true, "justo 8 sí");
});

caso("la edad se calcula SOLO desde birth_year, y el sesgo adelanta el acceso", () => {
  // D-053 quitó el mes, así que quien cumple 8 en diciembre ya cuenta como de 8
  // en enero. Es la imprecisión conocida, y va documentada en docs/dudas.md.
  igual(puedeRetar({ ...listo, birth_year: 2018 }, 2026).puede, true, "2026 − 2018 = 8");
  igual(puedeRetar({ ...listo, birth_year: 2019 }, 2026).puede, false, "2026 − 2019 = 7");
});

caso("sin opt-in no se duela: el default de un niño es apagado", () => {
  const r = puedeRetar({ ...listo, opt_in: false }, ANIO);
  igual(r.puede, false);
  igual(r.motivo, "sin_opt_in");
});

caso("un adulto aprendiz no tiene birth_year y no puede quedar fuera por eso", () => {
  const r = puedeRetar({ banda: "SERIO", birth_year: null, opt_in: true, pendientes_salientes: 0 }, ANIO);
  igual(r.puede, true, "D-053 solo le pide el año AL NIÑO");
});

caso("el tope de duelos salientes pendientes es 3", () => {
  igual(MAXIMO_PENDIENTES, 3);
  igual(puedeRetar({ ...listo, pendientes_salientes: 2 }, ANIO).puede, true, "dos todavía");
  const r = puedeRetar({ ...listo, pendientes_salientes: 3 }, ANIO);
  igual(r.puede, false);
  igual(r.motivo, "tope_de_pendientes");
});

caso("los portones se comprueban en orden: la banda antes que la edad", () => {
  // Un niño de kinder de 5 años incumple los dos. El motivo tiene que ser la
  // banda: es el que se le explica al padre, y «demasiado pequeño» diría que
  // con esperar tres años bastaría, que es falso.
  const r = puedeRetar({ banda: "KINDER", birth_year: 2021, opt_in: false, pendientes_salientes: 9 }, ANIO);
  igual(r.motivo, "banda_kinder");
});

// --- El set congelado (#244) ------------------------------------------------

caso("los dos reciben el mismo set, en el mismo orden, y no se puede reordenar", () => {
  const d = nuevo();
  igual(d.item_set.join(","), "i1,i2,i3");
  lanza(() => d.item_set.push("i4"));
  lanza(() => d.item_set.sort());
  igual(d.item_set.join(","), "i1,i2,i3", "el set sigue congelado");
});

caso("un set con ítems repetidos no se acepta", () => {
  lanza(
    () =>
      crearDuelo({
        id: "d",
        cohort_id: "c",
        challenger_membership_id: "a",
        challenged_membership_id: "b",
        item_set: ["i1", "i1"],
        ahora: 0,
      }),
    "repetidos",
  );
});

caso("nadie se reta a sí mismo, y un duelo sin ítems no es un duelo", () => {
  lanza(
    () =>
      crearDuelo({
        id: "d",
        cohort_id: "c",
        challenger_membership_id: "a",
        challenged_membership_id: "a",
        item_set: ["i1"],
        ahora: 0,
      }),
    "sí mismo",
  );
  lanza(
    () =>
      crearDuelo({
        id: "d",
        cohort_id: "c",
        challenger_membership_id: "a",
        challenged_membership_id: "b",
        item_set: [],
        ahora: 0,
      }),
    "sin ítems",
  );
});

// --- La ventana de 48 h, sin cuenta regresiva ------------------------------

caso("la ventana es de 48 horas exactas", () => {
  igual(VENTANA_MS, 48 * 3600 * 1000);
  const d = nuevo(1_000_000);
  igual(d.expires_at - d.created_at, VENTANA_MS);
});

caso("caduca sola: se pregunta al leer, no se avisa", () => {
  const d = nuevo(0);
  igual(haExpirado(d, VENTANA_MS - 1), false, "todavía no");
  igual(haExpirado(d, VENTANA_MS), true, "justo al cumplirse");
});

// --- El desenlace ----------------------------------------------------------

caso("gana quien hizo más puntos del set compartido", () => {
  const d = nuevo();
  igual(resolver(d, { challenger: 90, challenged: 10 }, 1).winner_membership_id, "reta");
  igual(resolver(d, { challenger: 10, challenged: 90 }, 1).winner_membership_id, "retado");
});

caso("el empate es un desenlace de primera clase, no se rompe", () => {
  const r = resolver(nuevo(), { challenger: 50, challenged: 50 }, 1);
  igual(r.estado, "JUGADO");
  igual(r.winner_membership_id, null, "empate: sin desempate inventado y desde luego sin azar");
});

caso("mientras falte un lado y no haya caducado, el duelo está PENDIENTE", () => {
  igual(resolver(nuevo(), { challenger: 40, challenged: null }, 1).estado, "PENDIENTE");
});

caso("rechazar es silencioso: expirar NO da la victoria a nadie", () => {
  const d = nuevo(0);
  const r = resolver(d, { challenger: 40, challenged: null }, VENTANA_MS);
  igual(r.estado, "EXPIRADO");
  if ("winner_membership_id" in r) {
    throw new Error("un duelo expirado produjo ganador: el silencio de un niño sería un premio para otro");
  }
});

caso("el ganador NO depende de quién terminó antes", () => {
  // Mismo marcador, dos instantes de lectura muy distintos: el resultado es el
  // mismo. `resolver` no recibe cuándo terminó cada uno, y no puede recibirlo.
  const d = nuevo(0);
  const pronto = resolver(d, { challenger: 70, challenged: 71 }, 1);
  const tarde = resolver(d, { challenger: 70, challenged: 71 }, VENTANA_MS - 1);
  igual(pronto.winner_membership_id, tarde.winner_membership_id, "retado gana las dos veces");
  igual(resolver.length, 3, "resolver: duelo, puntos, ahora — y ningún tiempo de finalización");
});

// --- Lo que se ve, y lo que no (D-081 condición 2) -------------------------

caso("mientras el duelo esté pendiente no se revela nada del otro", () => {
  const d = nuevo();
  const v = verDuelo(d, "LinceListo4821", { mios: 40, del_otro: 90 }, { estado: "PENDIENTE" });
  igual(v.mis_puntos, null, "ni siquiera los propios: saber el marcador es saber que el otro jugó");
  igual(v.puntos_del_otro, null);
  igual(v.alias_del_otro, "LinceListo4821", "alias, jamás nombre");
});

caso("la vista de un duelo no tiene ni un campo de presencia", () => {
  const v = verDuelo(nuevo(), "LinceListo4821", { mios: 90, del_otro: 40 }, {
    estado: "JUGADO",
    winner_membership_id: "reta",
  });
  const PROHIBIDOS = ["online", "en_linea", "last_seen", "conectado", "typing", "presencia"];
  for (const k of Object.keys(v)) {
    if (PROHIBIDOS.includes(k)) throw new Error(`la vista trae \`${k}\``);
  }
  igual(v.mis_puntos, 90, "terminado: ahora sí");
});

console.log(`\n${corridos - fallos}/${corridos} casos pasaron\n`);
if (fallos > 0) process.exit(1);
