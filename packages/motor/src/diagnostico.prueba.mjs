#!/usr/bin/env node
// Casos del diagnóstico del panel del padre — F8 #279, #280, #281, #282, #283.
//
//     node --experimental-strip-types packages/motor/src/diagnostico.prueba.mjs
//
// Por qué existen. Casi todas las promesas de este módulo no rompen nada
// visible al romperse: un estado de dominio calculado con un corte propio da
// un resultado plausible y equivocado; una liga reordenada a mano da una
// posición plausible y equivocada; una nota con causa desconocida pinta la
// clave cruda en la cara del padre. Ninguno se ve leyendo el código.
//
// ─── La segunda fuente, escrita a mano (D-070) ──────────────────────────────
//
// Los valores esperados de abajo NO se derivan llamando al motor: se
// calcularon a mano desde las fuentes (la maestría en dos etapas de
// mc-05/D-018, la curva de XP de D-055, el orden de liga de la 0012). Si el
// test llamara a `estadoDominio()` para decidir qué esperar de
// `componerDiagnostico()`, aprobaría su propia violación.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import {
  estadoDominio,
  componerDominio,
  componerNotas,
  componerRoadmap,
  tendenciaDe8Semanas,
  componerDiagnostico,
  esCausaDeNota,
  claveDeNota,
  habilidadesDeLaBanda,
  SEMANAS_DE_TENDENCIA,
} from "./diagnostico.ts";

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
    console.error(`    ${String(err).slice(0, 300)}`);
  }
}

function eq(real, esperado, que) {
  const a = JSON.stringify(real);
  const b = JSON.stringify(esperado);
  if (a !== b) throw new Error(`${que}: esperaba ${b}, recibió ${a}`);
}

/* ─── estadoDominio: los cuatro estados, leídos de la fila ─────────────────
 * A mano desde la 0002 y mc-05/D-018: sin fila o attempts=0 → sin_empezar;
 * mastered_at puesto → dominado (manda sobre provisional); solo
 * provisional_at → provisional; solo intentos → practicando. */

caso("sin fila es sin_empezar", () => {
  eq(estadoDominio(undefined), "sin_empezar", "sin fila");
  eq(estadoDominio(null), "sin_empezar", "fila null");
});

caso("fila con cero intentos es sin_empezar", () => {
  eq(
    estadoDominio({ attempts: 0, provisional_at: null, mastered_at: null, updated_at: 5 }),
    "sin_empezar",
    "attempts=0",
  );
});

caso("intentos sin fechas es practicando", () => {
  eq(
    estadoDominio({ attempts: 3, provisional_at: null, mastered_at: null, updated_at: 5 }),
    "practicando",
    "attempts>0 sin fechas",
  );
});

caso("provisional_at sin mastered_at es provisional", () => {
  eq(
    estadoDominio({ attempts: 3, provisional_at: 100, mastered_at: null, updated_at: 100 }),
    "provisional",
    "provisional_at puesto",
  );
});

caso("mastered_at manda sobre provisional_at", () => {
  eq(
    estadoDominio({ attempts: 9, provisional_at: 100, mastered_at: 400, updated_at: 400 }),
    "dominado",
    "las dos fechas puestas",
  );
});

/* ─── componerDominio: orden avance-primero, determinista ────────────────── */

caso("KINDER usa el catálogo de F6, no una lista propia", () => {
  const ids = habilidadesDeLaBanda("KINDER");
  eq(ids?.length, 14, "14 habilidades de kinder (D-019)");
  eq(ids?.[0], "K01", "la primera es K01");
  eq(habilidadesDeLaBanda("PRIMARIA"), null, "PRIMARIA sin catálogo todavía");
});

caso("la lista abre con lo más avanzado, nunca con lo que falta", () => {
  const lista = componerDominio("KINDER", {
    K03: { attempts: 5, provisional_at: null, mastered_at: 900, updated_at: 900 },
    K01: { attempts: 2, provisional_at: null, mastered_at: null, updated_at: 800 },
    K02: { attempts: 4, provisional_at: 850, mastered_at: null, updated_at: 850 },
  });
  // dominado → provisional → practicando → los 11 sin_empezar al final.
  eq(lista[0], { habilidad: "K03", estado: "dominado", actualizadoEn: 900 }, "primero");
  eq(lista[1], { habilidad: "K02", estado: "provisional", actualizadoEn: 850 }, "segundo");
  eq(lista[2], { habilidad: "K01", estado: "practicando", actualizadoEn: 800 }, "tercero");
  eq(lista.length, 14, "las 14 de kinder");
  eq(lista[3].estado, "sin_empezar", "lo que falta va al final");
  // Determinismo: las 11 sin_empezar se ordenan por id, no por orden de entrada.
  eq(
    lista.slice(3).map((e) => e.habilidad),
    ["K04", "K05", "K06", "K07", "K08", "K09", "K10", "K11", "K12", "K13", "K14"],
    "desempate por id",
  );
});

caso("banda sin catálogo muestra solo lo que tiene fila", () => {
  const lista = componerDominio("PRIMARIA", {
    P02: { attempts: 1, provisional_at: null, mastered_at: null, updated_at: 10 },
  });
  eq(lista.length, 1, "una sola entrada");
  eq(lista[0].habilidad, "P02", "la que tiene fila");
});

/* ─── componerNotas: causa desconocida nunca llega a la pantalla ──────────── */

caso("causa desconocida se descarta, nunca se pinta cruda", () => {
  const notas = componerNotas([
    { id: "n1", cause_code: "HABILIDAD_PAUSADA_LATERAL", skill_id: "K07", created_at: 100, seen_at: null },
    { id: "n2", cause_code: "INVENTADA_POR_OTRA_VIA", skill_id: null, created_at: 200, seen_at: null },
  ]);
  eq(notas.length, 1, "una sola nota sobrevive");
  eq(notas[0].causa, "HABILIDAD_PAUSADA_LATERAL", "la conocida");
});

caso("más reciente primero, con su seen_at", () => {
  const notas = componerNotas([
    { id: "n1", cause_code: "PATRON_INUSUAL_PARA_EDAD", skill_id: null, created_at: 100, seen_at: 150 },
    { id: "n2", cause_code: "HABILIDAD_PAUSADA_LATERAL", skill_id: "K03", created_at: 300, seen_at: null },
  ]);
  eq(notas[0].creadaEn, 300, "la nueva primero");
  eq(notas[1].vistaEn, 150, "la vieja conserva su marca de vista");
});

caso("la clave i18n de cada causa es padre.nota.<causa>", () => {
  eq(claveDeNota("PATRON_INUSUAL_PARA_EDAD"), "padre.nota.PATRON_INUSUAL_PARA_EDAD", "clave");
  eq(esCausaDeNota("HABILIDAD_PAUSADA_LATERAL"), true, "guardia sí");
  eq(esCausaDeNota("habilidad_pausada_lateral"), false, "guardia: minúsculas no");
});

/* ─── tendenciaDe8Semanas: los tres estados se distinguen ────────────────── */

caso("8 semanas, sin uso vs completa vs cortada por el límite", () => {
  eq(SEMANAS_DE_TENDENCIA, 8, "la decisión de f8-padres.md §6");
  // diaHoy = 2026-08-04. La semana actual (7 días hacia atrás) tiene dos días
  // jugados, uno cortado por DAILY_LIMIT; la semana anterior uno completo.
  const tendencia = tendenciaDe8Semanas(
    [
      { local_date: "2026-08-03", minutes_used: 20, ended_reason: "DAILY_LIMIT" },
      { local_date: "2026-08-01", minutes_used: 15, ended_reason: null },
      { local_date: "2026-07-27", minutes_used: 30, ended_reason: null },
    ],
    "2026-08-04",
  );
  eq(tendencia.length, 8, "ocho tramos");
  const actual = tendencia[7];
  eq(actual.minutos, 35, "suma de la semana actual");
  eq(actual.estado, "por_limite", "un día cortado marca la semana");
  const anterior = tendencia[6];
  eq(anterior.minutos, 30, "la semana anterior");
  eq(anterior.estado, "completa", "jugó sin corte");
  eq(tendencia[0].estado, "sin_uso", "hace 8 semanas no hay filas");
  // Los tramos son contiguos y cubren 56 días terminando hoy.
  eq(tendencia[7].desde, "2026-07-29", "la semana actual empieza hace 6 días");
  eq(tendencia[0].desde, "2026-06-10", "la más vieja empieza hace 55 días");
});

caso("BEDTIME también es un corte del padre, no una falla", () => {
  const tendencia = tendenciaDe8Semanas(
    [{ local_date: "2026-08-04", minutes_used: 10, ended_reason: "BEDTIME" }],
    "2026-08-04",
  );
  eq(tendencia[7].estado, "por_limite", "el corte nocturno cuenta como corte");
});

/* ─── componerRoadmap: leído del catálogo, nunca recalculado ──────────────── */

caso("inicial o desbloqueada es desbloqueado; la condición viaja como clave", () => {
  const roadmap = componerRoadmap([
    { cosmetic_id: "a", nombre_clave: "cosmetico.a.nombre", condicion_clave: null, arte_avif_url: "/a.avif", arte_webp_url: "/a.webp", arte_silueta_url: null, es_inicial: 1, unlocked_at: null },
    { cosmetic_id: "b", nombre_clave: "cosmetico.b.nombre", condicion_clave: "cosmetico.b.condicion", arte_avif_url: "/b.avif", arte_webp_url: "/b.webp", arte_silueta_url: "/b-sil.avif", es_inicial: 0, unlocked_at: 99 },
    { cosmetic_id: "c", nombre_clave: "cosmetico.c.nombre", condicion_clave: "cosmetico.c.condicion", arte_avif_url: null, arte_webp_url: null, arte_silueta_url: "/c-sil.avif", es_inicial: 0, unlocked_at: null },
  ]);
  eq(roadmap[0].desbloqueado, true, "inicial siempre desbloqueada");
  eq(roadmap[1].desbloqueado, true, "con fila en unlocked");
  eq(roadmap[2].desbloqueado, false, "bloqueada");
  eq(roadmap[2].condicionClave, "cosmetico.c.condicion", "la clave, nunca la fórmula");
  eq(roadmap[2].siluetaUrl, "/c-sil.avif", "la silueta viaja para la cuadrícula");
  eq(roadmap[2].nombreClave, "cosmetico.c.nombre", "el nombre también es clave");
});

/* ─── componerDiagnostico: la composición entera ────────────────────────────
 * Esperados a mano:
 *  · Rango (D-055, umbralXpParaRango(r) = 25(r−1)(r+2)): rango 2 entra en
 *    100 XP, rango 3 en 250. Con 120 XP → rango 2.
 *  · Liga (orden de la 0012: puntos desc, días activos desc, joined_at asc,
 *    id asc): propio con 50 puntos y 3 días; otro con 50 puntos y 5 días le
 *    gana el desempate → propio es 2º de 3. */

const FILAS_BASE = {
  hijoId: "hijo1",
  banda: "KINDER",
  estados: {
    K03: { attempts: 6, provisional_at: 100, mastered_at: 200, updated_at: 200 },
  },
  racha: { current_streak: 4, max_streak: 9, shields_available: 2, pause_until_local_date: "2026-08-10" },
  xpTotal: 120,
  puntos: [{ period: "all_time", theme_band: "KINDER", total_score: 340 }],
  liga: {
    membresiaPropiaId: "m-propio",
    miembros: [
      { id: "m-propio", child_profile_id: "hijo1", user_id: null, points_this_week: 50, active_days: 3, joined_at: 10 },
      { id: "m-otro", child_profile_id: "hijo2", user_id: null, points_this_week: 50, active_days: 5, joined_at: 20 },
      { id: "m-tercero", child_profile_id: "hijo3", user_id: null, points_this_week: 10, active_days: 1, joined_at: 30 },
    ],
  },
  notas: [],
  pantalla: {
    hoyMinutos: 12,
    terminoPorLimiteHoy: true,
    dias: [{ local_date: "2026-08-04", minutes_used: 12, ended_reason: "DAILY_LIMIT" }],
  },
  cosmeticos: [],
  diaHoy: "2026-08-04",
};

caso("compone racha, XP/Rango y liga leyendo a los dueños", () => {
  const d = componerDiagnostico(FILAS_BASE);
  eq(d.racha, { actual: 4, maxima: 9, escudosDisponibles: 2, pausaHasta: "2026-08-10" }, "racha tal cual");
  eq(d.xp, { total: 120, rango: 2 }, "rango derivado al leer, nunca guardado");
  eq(d.liga, { posicion: 2, total: 3, puntosSemana: 50 }, "posición por ordenar() de F7");
  eq(d.pantalla.terminoPorLimiteHoy, true, "el corte de hoy visible");
  eq(d.sinDatosDeHabilidades, false, "hay filas");
  eq(d.dominio[0].habilidad, "K03", "lo dominado primero");
});

caso("sin consentimiento LEADERBOARD la liga es null, no un ranking inferido", () => {
  const d = componerDiagnostico({ ...FILAS_BASE, liga: null });
  eq(d.liga, null, "la sección desaparece (D-040)");
});

caso("membresía propia ausente de la cohorte: sección omitida, nunca inventada", () => {
  const d = componerDiagnostico({
    ...FILAS_BASE,
    liga: { membresiaPropiaId: "m-fantasma", miembros: FILAS_BASE.liga.miembros },
  });
  eq(d.liga, null, "dato roto no es una posición");
});

caso("perfil sin una sola fila de skill_state es primer uso, no lista acusatoria", () => {
  const d = componerDiagnostico({ ...FILAS_BASE, estados: {} });
  eq(d.sinDatosDeHabilidades, true, "#285: bienvenida, no 14 sin_empezar");
});

caso("sin filas de racha ni XP, los contadores son 0 y el rango es 1", () => {
  const d = componerDiagnostico({ ...FILAS_BASE, racha: null, xpTotal: null });
  eq(d.racha.actual, 0, "racha en cero");
  eq(d.xp, { total: 0, rango: 1 }, "rango 1 con 0 XP (umbral del rango 2: 100)");
});

/* ─── Cierre ──────────────────────────────────────────────────────────────── */

console.log(`\n${corridos} casos, ${fallos} fallos`);
if (fallos > 0) process.exit(1);
