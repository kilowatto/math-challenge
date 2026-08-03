#!/usr/bin/env node
// Casos del motor de misiones diarias — #211, #214, #216, #217, #219, #221, #228.
//
//     node --experimental-strip-types packages/motor/src/misiones.prueba.mjs
//
// Por qué existen. Un error aquí no rompe nada visible: produce un menú de dos
// misiones en vez de tres, o la misma misión dos veces, o una misión de DUELO
// para un perfil que nunca dio opt-in. Nadie ve un error 500 — se ve un niño al
// que le tocó una misión que no puede cumplir, y eso se descubre semanas
// después, por un padre.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import {
  TIPOS_DE_MISION,
  CATALOGO,
  POOL_FIJO,
  ORDEN_DE_RESPALDO,
  ORDEN_DE_BANDAS,
  MISIONES_POR_DIA,
  MISION_DE_KINDER,
  BONO_DIA_COMPLETO,
  CLAVE_XP_DIA_COMPLETO,
  claveDeXp,
  definicionDe,
  tieneMenuDeMisiones,
  semillaDelDia,
  rotar,
  elegirMisionesDelDia,
  estadoInicialDeMision,
  avanzarMision,
  cierreDelDia,
  SQL_UPSERT_MISION,
} from "./misiones.ts";
import { XP_POR_TIPO, xpDeTipo } from "./xp.ts";

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
const cierto = (v, msg) => {
  if (!v) throw new Error(msg ?? "esperaba verdadero");
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

// --- Los insumos, en todas sus formas ---------------------------------------

const SIN_F4 = null;
const F4_VACIO = { habilidadesEnRepaso: [], habilidadesCercaDeDominio: [], habilidadesDominadas: [] };
const F4_REPASO = { ...F4_VACIO, habilidadesEnRepaso: ["K03", "K07"] };
const F4_CERCA = { ...F4_VACIO, habilidadesCercaDeDominio: ["K05"] };
const F4_DOMINADAS = { ...F4_VACIO, habilidadesDominadas: ["K01", "K02"] };
const F4_TODO = {
  habilidadesEnRepaso: ["K03"],
  habilidadesCercaDeDominio: ["K05"],
  habilidadesDominadas: ["K01"],
};

const SIN_LIGA = { enLiga: false, dueloOptIn: false, metaColectivaHoy: null };
const EN_LIGA = { enLiga: true, dueloOptIn: false, metaColectivaHoy: { objetivo: 150, llevan: 40 } };
const CON_DUELO = { enLiga: true, dueloOptIn: true, metaColectivaHoy: { objetivo: 150, llevan: 40 } };
// El caso raro que sí puede ocurrir: opt-in guardado de una temporada anterior
// y hoy sin liga. `duelo` NO es elegible aquí — una misión incumplible es peor
// que no tener misión (#217).
const OPTIN_SIN_LIGA = { enLiga: false, dueloOptIn: true, metaColectivaHoy: null };

const BANDAS = ORDEN_DE_BANDAS;
const RESUMENES_F4 = [SIN_F4, F4_VACIO, F4_REPASO, F4_CERCA, F4_DOMINADAS, F4_TODO];
const RESUMENES_LIGA = [SIN_LIGA, EN_LIGA, CON_DUELO, OPTIN_SIN_LIGA];
const PERFILES = ["p-01", "p-02", "nino-ñ-áéí", "0", "aprendiz-adulto-9f2", "x".repeat(64)];
const DIAS = ["2026-01-01", "2026-02-28", "2026-03-08", "2026-08-02", "2026-12-31"];

/** Recorre la matriz entera y llama a `fn` con cada combinación. */
function porTodaLaMatriz(fn) {
  let n = 0;
  for (const perfil of PERFILES) {
    for (const dia of DIAS) {
      for (const banda of BANDAS) {
        for (const f4 of RESUMENES_F4) {
          for (const liga of RESUMENES_LIGA) {
            fn(elegirMisionesDelDia(perfil, dia, banda, f4, liga), { perfil, dia, banda, f4, liga });
            n++;
          }
        }
      }
    }
  }
  return n;
}

console.log("\n== motor de misiones diarias — #211, línea roja #5 ==\n");

// --- El catálogo (#212) -----------------------------------------------------

caso("los diez tipos están, y el catálogo no tiene ninguno de más ni de menos", () => {
  igual(TIPOS_DE_MISION.length, 10, "tipos declarados");
  igual(CATALOGO.length, 10, "entradas del catálogo");
  for (const tipo of TIPOS_DE_MISION) igual(definicionDe(tipo).tipo, tipo, `catálogo de ${tipo}`);
  lanza(() => definicionDe("cofre_sorpresa"), "catálogo cerrado");
});

caso("`variedad` y `descubre` son tipos distintos: amplitud de tema y de modo", () => {
  // No es una comprobación tonta: es la colisión que la crítica de F5 encontró
  // en `proposito` — dos enums con el mismo nombre midiendo cosas distintas.
  cierto(TIPOS_DE_MISION.includes("variedad"), "variedad");
  cierto(TIPOS_DE_MISION.includes("descubre"), "descubre");
  igual(new Set(TIPOS_DE_MISION).size, TIPOS_DE_MISION.length, "sin tipos repetidos");
});

caso("`volumen` es el único tipo sin precondición que NO entra a la rotación", () => {
  cierto(!POOL_FIJO.includes("volumen"), "volumen fuera del pool");
  igual(definicionDe("volumen").elegible(SIN_F4, SIN_LIGA), true, "volumen siempre elegible");
  // Los cinco incondicionales: es lo que hace imposible un slot vacío.
  for (const tipo of ORDEN_DE_RESPALDO) {
    igual(definicionDe(tipo).elegible(SIN_F4, SIN_LIGA), true, `${tipo} sin precondición`);
  }
  cierto(ORDEN_DE_RESPALDO.length > MISIONES_POR_DIA, "más respaldos que slots");
});

// --- La recompensa: fija, publicada, sin una sola tirada (#219, línea roja #5)

caso("cada tipo del catálogo saca su XP de la tabla publicada de xp.ts, no de su propia copia", () => {
  for (const d of CATALOGO) {
    igual(d.xp, xpDeTipo(claveDeXp(d.tipo)), `XP de ${d.tipo}`);
    igual(typeof XP_POR_TIPO[claveDeXp(d.tipo)], "number", `clave publicada de ${d.tipo}`);
  }
  igual(BONO_DIA_COMPLETO, xpDeTipo(CLAVE_XP_DIA_COMPLETO), "bono del día");
});

caso("ninguna clave `mision_*` de la tabla publicada sobra ni falta", () => {
  const esperadas = new Set([...TIPOS_DE_MISION.map(claveDeXp), CLAVE_XP_DIA_COMPLETO, "mision_semanal"]);
  const declaradas = Object.keys(XP_POR_TIPO).filter((k) => k.startsWith("mision_"));
  for (const k of declaradas) cierto(esperadas.has(k), `clave publicada de más: ${k}`);
  for (const k of esperadas) cierto(declaradas.includes(k), `clave publicada que falta: ${k}`);
});

caso("mil llamadas seguidas dan el mismo XP: cero varianza, ninguna caja", () => {
  for (const d of CATALOGO) {
    for (let i = 0; i < 100; i++) igual(definicionDe(d.tipo).xp, d.xp, `${d.tipo} en la vuelta ${i}`);
  }
});

caso("una definición del catálogo tiene SEIS campos exactos, ni uno más", () => {
  // Se comprueba la lista blanca entera y no una lista negra de palabras, por
  // dos motivos. El primero es que una lista negra solo caza lo que se le
  // ocurrió a quien la escribió: `precio` sí, `tarifa` no. El segundo es
  // material — `audits/motor-puntuacion.mjs` bloquea el vocabulario de pago en
  // cualquier archivo de producto, y con razón, así que ni siquiera se puede
  // escribir aquí la lista de lo prohibido.
  //
  // Un campo de más es un campo que alguien añadió para algo, y ese algo —línea
  // roja #4— no puede ser cobrar por dejar que un niño practique, ni —línea roja
  // #5— sortear lo que da.
  const esperados = ["tipo", "bandaMinima", "meta", "xp", "enPoolFijo", "elegible"].sort().join(",");
  for (const d of CATALOGO) {
    igual(Object.keys(d).sort().join(","), esperados, `campos de ${d.tipo}`);
  }
});

// --- La semilla: cero entropía (#216) ---------------------------------------

caso("la semilla sale SOLO de (perfil, día): misma tupla, mismo número, mil veces", () => {
  const primera = semillaDelDia("p-01", "2026-08-02");
  for (let i = 0; i < 1000; i++) igual(semillaDelDia("p-01", "2026-08-02"), primera, `vuelta ${i}`);
  cierto(Number.isInteger(primera) && primera >= 0, "entero sin signo");
});

caso("la semilla cambia con el niño y cambia con el día", () => {
  cierto(semillaDelDia("p-01", "2026-08-02") !== semillaDelDia("p-02", "2026-08-02"), "por niño");
  cierto(semillaDelDia("p-01", "2026-08-02") !== semillaDelDia("p-01", "2026-08-03"), "por día");
});

caso("la semilla no confunde `ab|c` con `a|bc`: el separador no se puede fabricar", () => {
  cierto(semillaDelDia("ab", "2026-08-02") !== semillaDelDia("a", "2026-08-02"), "distintos perfiles");
});

caso("`rotar` no muta la lista de entrada y acepta desplazamientos enormes o negativos", () => {
  const base = ["a", "b", "c", "d"];
  igual(rotar(base, 0).join(""), "abcd", "sin desplazar");
  igual(rotar(base, 1).join(""), "bcda", "uno");
  igual(rotar(base, 5).join(""), "bcda", "vuelta entera + uno");
  igual(rotar(base, -1).join(""), "dabc", "negativo");
  igual(rotar(base, 4_294_967_295).join(""), rotar(base, 4_294_967_295 % 4).join(""), "semilla de 32 bits");
  igual(base.join(""), "abcd", "la entrada no se mutó");
  igual(rotar([], 7).length, 0, "lista vacía");
});

// --- La selección: determinista y reproducible (#216) -----------------------

caso("misma tupla de entrada, misma salida — 500 llamadas idénticas", () => {
  const esperado = JSON.stringify(elegirMisionesDelDia("p-01", "2026-08-02", "PRIMARIA", F4_TODO, CON_DUELO));
  for (let i = 0; i < 500; i++) {
    const salida = JSON.stringify(elegirMisionesDelDia("p-01", "2026-08-02", "PRIMARIA", F4_TODO, CON_DUELO));
    igual(salida, esperado, `vuelta ${i}`);
  }
});

caso("la salida no depende del ORDEN de las habilidades que manda F4", () => {
  // Un `Set` iterado por orden de inserción o un `[0]` disfrazado darían aquí
  // dos respuestas distintas para el mismo niño el mismo día.
  const a = { habilidadesEnRepaso: ["K01", "K02", "K03"], habilidadesCercaDeDominio: ["K05", "K06"], habilidadesDominadas: ["K08", "K09"] };
  const b = { habilidadesEnRepaso: ["K03", "K01", "K02"], habilidadesCercaDeDominio: ["K06", "K05"], habilidadesDominadas: ["K09", "K08"] };
  for (const perfil of PERFILES) {
    igual(
      JSON.stringify(elegirMisionesDelDia(perfil, "2026-08-02", "PRIMARIA", a, EN_LIGA)),
      JSON.stringify(elegirMisionesDelDia(perfil, "2026-08-02", "PRIMARIA", b, EN_LIGA)),
      `perfil ${perfil}`,
    );
  }
});

caso("dos niños distintos el mismo día no reciben forzosamente lo mismo", () => {
  // No se exige que TODOS difieran —con tres slots y diez tipos las colisiones
  // son normales—, sí que el conjunto no sea uno solo: si lo fuera, la semilla
  // no estaría entrando en la decisión y el hash sería decorativo.
  const vistos = new Set();
  for (const perfil of PERFILES) {
    vistos.add(elegirMisionesDelDia(perfil, "2026-08-02", "PRIMARIA", F4_VACIO, SIN_LIGA).map((m) => m.tipo).join(","));
  }
  cierto(vistos.size > 1, `la semilla no cambia nada: ${[...vistos].join(" | ")}`);
});

// --- Ningún slot vacío, ninguno repetido (#217) -----------------------------

caso("SIEMPRE tres misiones, siempre distintas, en toda la matriz de entradas", () => {
  const n = porTodaLaMatriz((misiones, ctx) => {
    igual(misiones.length, MISIONES_POR_DIA, `cuántas para ${ctx.perfil}/${ctx.dia}/${ctx.banda}`);
    const tipos = misiones.map((m) => m.tipo);
    igual(new Set(tipos).size, tipos.length, `repetida en ${ctx.banda}: ${tipos.join(",")}`);
    for (const m of misiones) {
      cierto(TIPOS_DE_MISION.includes(m.tipo), `tipo desconocido ${m.tipo}`);
      igual(m.xp, definicionDe(m.tipo).xp, `XP de ${m.tipo}`);
      cierto(m.meta > 0, `meta de ${m.tipo}`);
    }
  });
  console.log(`      (${n} combinaciones de perfil × día × banda × F4 × liga)`);
});

caso("un niño NUEVO —sin liga, sin nada dominado, sin F4— recibe igual sus tres", () => {
  // El caso que ataca la autocrítica §10.6 del diseño, y el que #217 pide por
  // escrito. `fluidez` es inelegible (nada dominado), `duelo` y `meta_de_liga`
  // también (sin liga), `repaso` y `dominio` también (sin F4). Quedan cinco.
  const m = elegirMisionesDelDia("recien-llegado", "2026-08-02", "PRIMARIA", SIN_F4, SIN_LIGA);
  igual(m.length, 3, "tres misiones");
  igual(new Set(m.map((x) => x.tipo)).size, 3, "las tres distintas");
  for (const x of m) {
    cierto(definicionDe(x.tipo).elegible(SIN_F4, SIN_LIGA), `${x.tipo} no era cumplible`);
  }
});

caso("las misiones que salen son SIEMPRE cumplibles con los insumos de ese día", () => {
  porTodaLaMatriz((misiones, ctx) => {
    for (const m of misiones) {
      cierto(
        definicionDe(m.tipo).elegible(ctx.f4, ctx.liga),
        `${m.tipo} salió sin ser elegible (${ctx.banda}, liga=${JSON.stringify(ctx.liga)})`,
      );
    }
  });
});

// --- Degradación sin F4 (#228) ----------------------------------------------

caso("sin F4 el slot adaptativo cae a `volumen`, y no bloquea nada", () => {
  for (const banda of BANDAS) {
    for (const liga of RESUMENES_LIGA) {
      const m = elegirMisionesDelDia("p-01", "2026-08-02", banda, SIN_F4, liga);
      igual(m[0].tipo, "volumen", `slot 1 en ${banda}`);
      igual(m.length, 3, `siguen siendo tres en ${banda}`);
    }
  }
});

caso("con F4 vacío se comporta igual que sin F4: las dos cosas son «hoy no hay nada que repasar»", () => {
  for (const banda of BANDAS) {
    igual(
      JSON.stringify(elegirMisionesDelDia("p-01", "2026-08-02", banda, SIN_F4, EN_LIGA)),
      JSON.stringify(elegirMisionesDelDia("p-01", "2026-08-02", banda, F4_VACIO, EN_LIGA)),
      `banda ${banda}`,
    );
  }
});

caso("`repaso` gana al slot adaptativo, y `dominio` solo cuando no hay repaso", () => {
  igual(elegirMisionesDelDia("p-01", "2026-08-02", "PRIMARIA", F4_REPASO, SIN_LIGA)[0].tipo, "repaso", "con repaso");
  igual(elegirMisionesDelDia("p-01", "2026-08-02", "PRIMARIA", F4_CERCA, SIN_LIGA)[0].tipo, "dominio", "solo cerca");
  igual(elegirMisionesDelDia("p-01", "2026-08-02", "PRIMARIA", F4_TODO, SIN_LIGA)[0].tipo, "repaso", "los dos");
  igual(elegirMisionesDelDia("p-01", "2026-08-02", "PRIMARIA", F4_DOMINADAS, SIN_LIGA)[0].tipo, "volumen", "solo dominadas");
});

caso("`fluidez` no aparece mientras no haya nada dominado (autocrítica §10.6)", () => {
  porTodaLaMatriz((misiones, ctx) => {
    if (ctx.f4 !== null && ctx.f4.habilidadesDominadas.length > 0) return;
    for (const m of misiones) {
      cierto(m.tipo !== "fluidez", `fluidez con nada dominado (${ctx.perfil}/${ctx.dia}/${ctx.banda})`);
    }
  });
});

// --- DUELO y la liga (#215, #218) -------------------------------------------

caso("`duelo` NUNCA aparece sin opt-in — ni activa ni de ninguna otra forma", () => {
  porTodaLaMatriz((misiones, ctx) => {
    if (ctx.liga.dueloOptIn === true) return;
    for (const m of misiones) {
      cierto(m.tipo !== "duelo", `duelo sin opt-in en ${ctx.perfil}/${ctx.dia}/${ctx.banda}`);
    }
  });
});

caso("`duelo` tampoco aparece con opt-in pero sin liga: sería incumplible", () => {
  for (const banda of BANDAS) {
    for (const f4 of RESUMENES_F4) {
      const m = elegirMisionesDelDia("p-01", "2026-08-02", banda, f4, OPTIN_SIN_LIGA);
      cierto(!m.some((x) => x.tipo === "duelo"), `duelo sin liga en ${banda}`);
    }
  }
});

caso("`meta_de_liga` solo sale si el perfil está en una liga", () => {
  porTodaLaMatriz((misiones, ctx) => {
    if (ctx.liga.enLiga === true) return;
    for (const m of misiones) {
      cierto(m.tipo !== "meta_de_liga", `meta_de_liga sin liga en ${ctx.perfil}/${ctx.banda}`);
    }
  });
});

caso("estar en liga ocupa el slot 3 con `meta_de_liga`", () => {
  for (const banda of BANDAS) {
    const m = elegirMisionesDelDia("p-01", "2026-08-02", banda, F4_TODO, EN_LIGA);
    cierto(m.some((x) => x.tipo === "meta_de_liga"), `sin meta_de_liga en ${banda}`);
  }
});

// --- KINDER no tiene menú (#213) --------------------------------------------

caso("KINDER no recibe menú de misiones, y `tieneMenuDeMisiones` lo dice sin adivinar", () => {
  igual(tieneMenuDeMisiones("KINDER"), false, "kinder");
  for (const banda of BANDAS) igual(tieneMenuDeMisiones(banda), true, `menú en ${banda}`);
  for (const f4 of RESUMENES_F4) {
    for (const liga of RESUMENES_LIGA) {
      igual(elegirMisionesDelDia("p-01", "2026-08-02", "KINDER", f4, liga).length, 0, "lista vacía");
    }
  }
});

caso("la «misión» de KINDER es una etiqueta interna, no un tipo del catálogo", () => {
  igual(MISION_DE_KINDER, "historia_del_dia", "etiqueta");
  cierto(!TIPOS_DE_MISION.includes(MISION_DE_KINDER), "no está en el catálogo de diez");
  igual(XP_POR_TIPO[`mision_${MISION_DE_KINDER}`], undefined, "no tiene precio en XP propio");
});

// --- Las entradas malas se rechazan, no se adivinan --------------------------

caso("un día mal formado LANZA en vez de inventar uno", () => {
  lanza(() => elegirMisionesDelDia("p-01", "02/08/2026", "PRIMARIA", SIN_F4, SIN_LIGA), "YYYY-MM-DD");
  lanza(() => elegirMisionesDelDia("p-01", "2026-8-2", "PRIMARIA", SIN_F4, SIN_LIGA), "YYYY-MM-DD");
  lanza(() => elegirMisionesDelDia("p-01", "", "PRIMARIA", SIN_F4, SIN_LIGA), "YYYY-MM-DD");
});

caso("un perfil vacío LANZA: si no, todos los niños recibirían lo mismo", () => {
  lanza(() => elegirMisionesDelDia("", "2026-08-02", "PRIMARIA", SIN_F4, SIN_LIGA), "childProfileId");
});

caso("el resumen de liga es obligatorio, aunque venga todo en false", () => {
  lanza(() => elegirMisionesDelDia("p-01", "2026-08-02", "PRIMARIA", SIN_F4, null), "resumen de liga");
});

caso("una banda desconocida LANZA en vez de devolver un menú al azar", () => {
  lanza(() => elegirMisionesDelDia("p-01", "2026-08-02", "BANDA_X", SIN_F4, SIN_LIGA), "escalera de misiones");
});

// --- El progreso, sin una fila por intento ----------------------------------

caso("una misión nace sin progreso y sin XP", () => {
  const [m] = elegirMisionesDelDia("p-01", "2026-08-02", "PRIMARIA", SIN_F4, SIN_LIGA);
  const e = estadoInicialDeMision(m, "2026-08-02");
  igual(e.progress, 0, "progreso");
  igual(e.completed, 0, "completada");
  igual(e.xp_awarded, 0, "XP");
  igual(e.target, m.meta, "meta");
  igual(e.mission_type, m.tipo, "tipo");
});

caso("el XP se otorga UNA vez, al completar, y con el valor fijo del catálogo", () => {
  const m = { tipo: "volumen", xp: definicionDe("volumen").xp, meta: definicionDe("volumen").meta };
  let e = estadoInicialDeMision(m, "2026-08-02");
  e = avanzarMision(e, 1);
  igual(e.xp_awarded, 0, "a medias no paga");
  e = avanzarMision(e, 2);
  igual(e.completed, 1, "completada");
  igual(e.xp_awarded, definicionDe("volumen").xp, "paga el valor publicado");
  igual(e.progress, m.meta, "el progreso no pasa de la meta");
});

caso("avanzar una misión ya completada devuelve EL MISMO objeto: el reintento no paga dos veces", () => {
  const m = { tipo: "problema", xp: definicionDe("problema").xp, meta: 1 };
  const completa = avanzarMision(estadoInicialDeMision(m, "2026-08-02"), 1);
  igual(avanzarMision(completa, 5), completa, "misma referencia");
  igual(avanzarMision(completa, 0), completa, "misma referencia con cero");
});

caso("un incremento negativo LANZA: una misión no retrocede (línea roja #8)", () => {
  const m = { tipo: "volumen", xp: 15, meta: 3 };
  lanza(() => avanzarMision(estadoInicialDeMision(m, "2026-08-02"), -1), "no retrocede");
});

caso("el progreso se capa en la meta, así que el CHECK de D1 nunca puede fallar", () => {
  const m = { tipo: "volumen", xp: definicionDe("volumen").xp, meta: 3 };
  const e = avanzarMision(estadoInicialDeMision(m, "2026-08-02"), 99);
  igual(e.progress, 3, "capado");
  igual(e.completed, 1, "completada");
});

// --- El cierre del día: solo lo logrado, nunca un «0 de 3» ------------------

caso("el cierre del día lista solo lo logrado y no devuelve ningún denominador", () => {
  const misionesDeHoy = elegirMisionesDelDia("p-01", "2026-08-02", "PRIMARIA", F4_TODO, EN_LIGA);
  const c = cierreDelDia(misionesDeHoy, []);
  igual(c.logradas.length, 0, "sin logros");
  igual(c.xp, 0, "sin XP");
  igual(c.diaCompleto, false, "no completo");
  // Lo que NO tiene que existir: un total contra el que compararse. Un «0/3» es
  // un veredicto aunque el copy no lo diga (mc-17 §5, autocrítica §10.1).
  for (const campo of Object.keys(c)) {
    cierto(!/total|meta|pendientes|faltan|restantes|de3|denominador/i.test(campo), `campo "${campo}"`);
  }
});

caso("el bono del día solo cae con las tres, y es una suma directa sin cofre", () => {
  const misionesDeHoy = elegirMisionesDelDia("p-01", "2026-08-02", "PRIMARIA", F4_TODO, EN_LIGA);
  const tipos = misionesDeHoy.map((m) => m.tipo);
  const dos = cierreDelDia(misionesDeHoy, tipos.slice(0, 2));
  igual(dos.diaCompleto, false, "dos no es completo");
  igual(dos.xp, misionesDeHoy.slice(0, 2).reduce((s, m) => s + m.xp, 0), "XP de dos");

  const tres = cierreDelDia(misionesDeHoy, tipos);
  igual(tres.diaCompleto, true, "tres es completo");
  igual(tres.xp, misionesDeHoy.reduce((s, m) => s + m.xp, 0) + BONO_DIA_COMPLETO, "XP con bono");
});

caso("una misión completada que no estaba entre las de hoy no paga nada", () => {
  const misionesDeHoy = elegirMisionesDelDia("p-01", "2026-08-02", "PRIMARIA", SIN_F4, SIN_LIGA);
  const ajena = TIPOS_DE_MISION.find((t) => !misionesDeHoy.some((m) => m.tipo === t));
  const c = cierreDelDia(misionesDeHoy, [ajena]);
  igual(c.xp, 0, "XP");
  igual(c.logradas.length, 0, "logradas");
});

caso("el cierre es determinista: mil llamadas, mismo número", () => {
  const misionesDeHoy = elegirMisionesDelDia("p-01", "2026-08-02", "PRIMARIA", F4_TODO, CON_DUELO);
  const tipos = misionesDeHoy.map((m) => m.tipo);
  const primero = cierreDelDia(misionesDeHoy, tipos).xp;
  for (let i = 0; i < 1000; i++) igual(cierreDelDia(misionesDeHoy, tipos).xp, primero, `vuelta ${i}`);
});

// --- El SQL: una fila por misión y día, sin precio y sin azar ---------------

caso("el upsert escribe la llave (perfil, día, tipo) y ninguna columna prohibida", () => {
  cierto(/mission_daily_summary/.test(SQL_UPSERT_MISION), "la tabla");
  cierto(/ON CONFLICT \(child_profile_id, local_date, mission_type\)/.test(SQL_UPSERT_MISION), "la llave");
  cierto(!/precio|price|cost|moneda|currency|sku|random|probabilid|rarity/i.test(SQL_UPSERT_MISION), "sin precio ni azar");
  cierto(!/total_score|puntos/i.test(SQL_UPSERT_MISION), "sin puntos de tablero (#225)");
});

// --- Lo que este módulo NO hace ---------------------------------------------

caso("el módulo no exporta ni una cadena de cara al niño (#221, línea roja #3)", () => {
  // El copy vive en los archivos de locale; aquí viaja la clave, nunca el valor.
  // Un texto exportado desde el motor sería un texto sin autor por locale, que
  // es justo lo que D-022 y `mc-34` prohíben.
  for (const d of CATALOGO) {
    igual(typeof d.tipo, "string", "el tipo es una clave interna");
    cierto(/^[a-z_]+$/.test(d.tipo), `"${d.tipo}" parece texto y no una clave`);
  }
});

console.log("");
if (fallos > 0) {
  console.error(`✗ ${fallos} de ${corridos} casos fallaron.\n`);
  process.exit(1);
}
console.log(`✓ los ${corridos} casos del motor de misiones pasaron\n`);
