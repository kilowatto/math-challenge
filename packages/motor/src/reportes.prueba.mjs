/**
 * Pruebas del motor de reportes (F8 #288). Se corren con:
 *
 *     node packages/motor/src/reportes.prueba.mjs
 *
 * Las dos invariantes que importan más que todas las demás juntas, porque son
 * las que protegen a una persona y no a un número:
 *
 *   · **Ningún campo de un hijo depende de otro hijo** (D-025, mc-18). No se
 *     prueba leyendo el código — se prueba MOVINEDO los números de un hermano
 *     y exigiendo que la sección del otro salga idéntica, byte a byte.
 *   · **El orden es el alias, jamás el desempeño** — un correo ordenado por
 *     puntos sería la comparación prohibida, dibujada sin números.
 */

import {
  construirReporteHogar,
  decidirEnvioReporte,
  ventanaDelPeriodo,
  CADENCIA_POR_DEFECTO,
  HORA_POR_DEFECTO,
  HORA_MINIMA,
  HORA_MAXIMA,
} from "./reportes.ts";

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
const profundo = (a, b, msg) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error(`${msg ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`);
  }
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

/** Un instante UTC legible. */
const utc = (iso) => Date.parse(iso);

const PERIODO = { desde: utc("2026-08-03T00:00:00Z"), hasta: utc("2026-08-10T00:00:00Z") };

/** Una fila de hijo con lo que se le quiera cambiar encima. */
const fila = (parcial) => ({
  childProfileId: "cp_1",
  alias: "Ajolote42",
  scoreAllTime: 1000,
  xpTotal: 120,
  currentStreak: 5,
  maxStreak: 9,
  pauseUntilLocalDate: null,
  skillsMasteredInPeriod: ["suma-llevando", "tabla-del-3"],
  skillsDueForReview: 2,
  minutosPracticados: 95,
  diasActivos: 4,
  snapshot: { lastScoreAllTime: 800, lastXpTotal: 100 },
  ...parcial,
});

const CDMX = "America/Mexico_City";
const TOKIO = "Asia/Tokyo";

console.log("\n== motor de reportes — F8 #288, D-025, mc-18 ==\n");

// --- puntosGanados: contra el PROPIO snapshot, nunca negativo (#288) --------

caso("puntosGanados es la diferencia contra el propio snapshot", () => {
  const r = construirReporteHogar("u1", PERIODO, [fila({})]);
  igual(r.hijos[0].puntosGanados, 200, "1000 - 800");
  igual(r.hijos[0].puntosTotales, 1000, "el acumulado viaja aparte");
});

caso("puntosGanados NUNCA sale negativo: una temporada reseteada se trata como 0", () => {
  // `score_totals` se resetea por temporada: el acumulado de hoy puede ser
  // MENOR que el snapshot del último correo. Eso no es «perdió puntos» y el
  // padre no debe leer un número confuso (#288, criterio explícito).
  const r = construirReporteHogar("u1", PERIODO, [
    fila({ scoreAllTime: 50, snapshot: { lastScoreAllTime: 800, lastXpTotal: 100 } }),
  ]);
  igual(r.hijos[0].puntosGanados, 0, "el reseteo de temporada no es una pérdida");
  igual(r.hijos[0].puntosTotales, 50, "el acumulado dice la verdad");
});

caso("sin movimiento en el periodo, puntosGanados es 0", () => {
  const r = construirReporteHogar("u1", PERIODO, [
    fila({ scoreAllTime: 800, snapshot: { lastScoreAllTime: 800, lastXpTotal: 100 } }),
  ]);
  igual(r.hijos[0].puntosGanados, 0, "nada ganado");
});

// --- null y 0 no se confunden (#288) ----------------------------------------

caso("sin F7 desplegado, XP y racha salen null — nunca 0 ni undefined", () => {
  const r = construirReporteHogar("u1", PERIODO, [
    fila({ xpTotal: undefined, currentStreak: undefined, maxStreak: undefined }),
  ]);
  const s = r.hijos[0];
  igual(s.xpTotal, null, "xpTotal ausente → null");
  igual(s.xpGanado, null, "xpGanado ausente → null");
  igual(s.rachaActual, null, "racha ausente → null");
  igual(s.rachaMaxima, null, "mejor marca ausente → null");
  if (s.xpTotal === undefined || s.rachaActual === undefined) {
    throw new Error("undefined se coló en la salida: «no hay dato» y «vale cero» se confunden");
  }
});

caso("un XP de 0 REAL sale 0, no null: las dos afirmaciones se distinguen", () => {
  const r = construirReporteHogar("u1", PERIODO, [
    fila({ xpTotal: 0, currentStreak: 0, snapshot: { lastScoreAllTime: 0, lastXpTotal: null } }),
  ]);
  igual(r.hijos[0].xpTotal, 0, "XP cero real");
  igual(r.hijos[0].xpGanado, 0, "cero ganado contra snapshot vacío");
  igual(r.hijos[0].rachaActual, 0, "racha cero real");
});

caso("xpGanado se mide contra el snapshot, y tampoco sale negativo", () => {
  const r = construirReporteHogar("u1", PERIODO, [
    fila({ xpTotal: 120, snapshot: { lastScoreAllTime: 0, lastXpTotal: 100 } }),
  ]);
  igual(r.hijos[0].xpGanado, 20, "120 - 100");
  const r2 = construirReporteHogar("u1", PERIODO, [
    fila({ xpTotal: 80, snapshot: { lastScoreAllTime: 0, lastXpTotal: 100 } }),
  ]);
  igual(r2.hijos[0].xpGanado, 0, "un XP que bajó no sale negativo");
});

caso("minutos y días activos: ausentes → null, presentes → el valor compuesto", () => {
  const sin = construirReporteHogar("u1", PERIODO, [
    fila({ minutosPracticados: undefined, diasActivos: undefined }),
  ]);
  igual(sin.hijos[0].minutosPracticados, null, "sin rollup de pantalla → null");
  igual(sin.hijos[0].diasActivos, null, "sin rollup de pantalla → null");
  const con_ = construirReporteHogar("u1", PERIODO, [fila({})]);
  igual(con_.hijos[0].minutosPracticados, 95, "la suma del periodo viaja");
  igual(con_.hijos[0].diasActivos, 4, "el conteo de días viaja");
});

// --- La pausa familiar se nombra (dueño, 2026-08-02) -------------------------

caso("la pausa vigente viaja como fecha; sin pausa sale null", () => {
  const r = construirReporteHogar("u1", PERIODO, [fila({ pauseUntilLocalDate: "2026-08-15" })]);
  igual(r.hijos[0].enPausaHasta, "2026-08-15", "la plantilla escribirá «en pausa hasta»");
  const sin = construirReporteHogar("u1", PERIODO, [fila({})]);
  igual(sin.hijos[0].enPausaHasta, null, "sin pausa no se inventa fecha");
});

// --- Estructura: copias, no referencias; campos de contexto ------------------

caso("habilidadesDominadas es una COPIA: mutar la entrada no toca la salida", () => {
  const entrada = ["suma-llevando"];
  const f = fila({ skillsMasteredInPeriod: entrada });
  const r = construirReporteHogar("u1", PERIODO, [f]);
  entrada.push("tabla-del-7");
  igual(r.hijos[0].habilidadesDominadas.length, 1, "la salida no se movió con la entrada");
});

caso("el periodo es una COPIA: mutar la entrada no toca la salida", () => {
  const p = { desde: 1, hasta: 2 };
  const r = construirReporteHogar("u1", p, [fila({})]);
  p.desde = 999;
  igual(r.periodo.desde, 1, "la salida no se movió con la entrada");
});

caso("repasosPendientes y parentUserId viajan tal cual", () => {
  const r = construirReporteHogar("u_padre", PERIODO, [fila({ skillsDueForReview: 3 })]);
  igual(r.hijos[0].repasosPendientes, 3, "el conteo de repaso");
  igual(r.parentUserId, "u_padre", "la cuenta del padre");
});

caso("un hogar sin hijos produce un reporte sin secciones", () => {
  const r = construirReporteHogar("u1", PERIODO, []);
  igual(r.hijos.length, 0, "cero secciones, sin explotar");
});

// --- El orden: alias, jamás desempeño (#288, invariante explícita) -----------

caso("el orden de hijos depende SOLO de alias.localeCompare()", () => {
  const r = construirReporteHogar("u1", PERIODO, [
    fila({ childProfileId: "cp_b", alias: "Zorrito07" }),
    fila({ childProfileId: "cp_a", alias: "Ajolote42" }),
  ]);
  igual(r.hijos[0].alias, "Ajolote42", "orden alfabético");
  igual(r.hijos[1].alias, "Zorrito07", "orden alfabético");
});

caso("el hijo con MÁS puntos no se adelanta: el orden no es una tabla de posiciones", () => {
  // Si el correo ordenara por desempeño, el orden MISMO sería la comparación
  // que D-025 y mc-18 prohíben — sin escribir ni un número comparativo.
  const r = construirReporteHogar("u1", PERIODO, [
    fila({ childProfileId: "cp_a", alias: "Ajolote42", scoreAllTime: 5 }),
    fila({ childProfileId: "cp_z", alias: "Zorrito07", scoreAllTime: 99999 }),
  ]);
  igual(r.hijos[0].alias, "Ajolote42", "el de 5 puntos va primero si su alias va primero");
  igual(r.hijos[1].alias, "Zorrito07", "el de 99999 no se adelanta");
});

caso("INVARIANTE: la sección de un hijo no depende de los números del otro", () => {
  // La forma de probar «no compara» sin leer el código: mover TODOS los
  // números de un hermano y exigir que la sección del otro salga idéntica.
  const antes = construirReporteHogar("u1", PERIODO, [
    fila({ childProfileId: "cp_a", alias: "Ajolote42" }),
    fila({ childProfileId: "cp_b", alias: "Zorrito07" }),
  ]);
  const despues = construirReporteHogar("u1", PERIODO, [
    fila({ childProfileId: "cp_a", alias: "Ajolote42" }),
    fila({
      childProfileId: "cp_b",
      alias: "Zorrito07",
      scoreAllTime: 0,
      xpTotal: 0,
      currentStreak: 0,
      maxStreak: 0,
      skillsMasteredInPeriod: [],
      skillsDueForReview: 99,
      minutosPracticados: 0,
      diasActivos: 0,
      snapshot: { lastScoreAllTime: 0, lastXpTotal: 0 },
    }),
  ]);
  const seccion = (r) => r.hijos.find((h) => h.childProfileId === "cp_a");
  profundo(seccion(despues), seccion(antes), "la sección del primer hijo cambió por los números del segundo");
});

caso("INVARIANTE: quitar al hermano tampoco cambia la sección del que queda", () => {
  const solo = construirReporteHogar("u1", PERIODO, [fila({ childProfileId: "cp_a", alias: "Ajolote42" })]);
  const acompanado = construirReporteHogar("u1", PERIODO, [
    fila({ childProfileId: "cp_a", alias: "Ajolote42" }),
    fila({ childProfileId: "cp_b", alias: "Zorrito07" }),
  ]);
  profundo(
    acompanado.hijos.find((h) => h.childProfileId === "cp_a"),
    solo.hijos[0],
    "la sección cambió por la sola presencia de otro hijo",
  );
});

// --- decidirEnvioReporte: cadencia, hora local y ventana de silencio ---------

const ajustes = (parcial) => ({
  cadencia: "WEEKLY",
  horaLocal: 8,
  ultimoEnvioUtc: null,
  ...parcial,
});

caso("OFF no envía nunca, ni a la hora exacta del primer correo", () => {
  const d = decidirEnvioReporte(ajustes({ cadencia: "OFF" }), utc("2026-08-10T14:00:00Z"), CDMX);
  igual(d.enviar, false, "la baja de un toque se respeta");
  igual(d.motivo, "apagado", "el motivo es la cadencia, no la hora");
});

caso("fuera de la hora local del hogar no se envía", () => {
  // 14:00 UTC son las 08:00 en CDMX; a las 09:00 locales ya no es la hora.
  const d = decidirEnvioReporte(ajustes({}), utc("2026-08-10T15:00:00Z"), CDMX);
  igual(d.enviar, false, "una hora después ya no toca");
  igual(d.motivo, "fuera_de_la_hora", "motivo");
});

caso("el primer correo de un hogar sale en cuanto llega su hora", () => {
  const d = decidirEnvioReporte(ajustes({}), utc("2026-08-10T14:00:00Z"), CDMX);
  igual(d.enviar, true, "sin envío previo, toca");
  igual(d.motivo, "toca", "motivo");
});

caso("WEEKLY: a los 7 días locales toca; a los 6 no", () => {
  const enviado = utc("2026-08-03T14:00:00Z"); // lunes 08:00 en CDMX
  const seis = decidirEnvioReporte(ajustes({ ultimoEnvioUtc: enviado }), utc("2026-08-09T14:00:00Z"), CDMX);
  igual(seis.enviar, false, "seis días no son una semana");
  igual(seis.motivo, "semana_no_cumplida", "motivo");
  const siete = decidirEnvioReporte(ajustes({ ultimoEnvioUtc: enviado }), utc("2026-08-10T14:00:00Z"), CDMX);
  igual(siete.enviar, true, "siete días locales cumplen la semana");
});

caso("WEEKLY: el mismo día local del último envío no reenvía", () => {
  const enviado = utc("2026-08-10T13:00:00Z");
  const d = decidirEnvioReporte(ajustes({ ultimoEnvioUtc: enviado }), utc("2026-08-10T14:00:00Z"), CDMX);
  igual(d.enviar, false, "un correo por semana, no dos el mismo día");
});

caso("WEEKLY se mide en días LOCALES, no en días UTC", () => {
  // Enviado el 2026-08-04 05:30 UTC, que en CDMX todavía era el 3 (23:30).
  // El 2026-08-10 14:00 UTC (08:00 local) UTC diría «6 días» pero el hogar
  // ya vivió 7 días locales: con reloj UTC este hogar recibiría su correo un
  // día tarde cada semana.
  const enviado = utc("2026-08-04T05:30:00Z");
  const d = decidirEnvioReporte(ajustes({ ultimoEnvioUtc: enviado }), utc("2026-08-10T14:00:00Z"), CDMX);
  igual(d.enviar, true, "7 días LOCALES, aunque UTC cuente 6");
});

caso("la hora se evalúa en la zona del HOGAR: el mismo instante toca en una zona y no en otra", () => {
  const ahora = utc("2026-08-10T14:00:00Z"); // 08:00 en CDMX, 23:00 en Tokio
  const cdmx = decidirEnvioReporte(ajustes({}), ahora, CDMX);
  igual(cdmx.enviar, true, "08:00 locales: toca");
  const tokio = decidirEnvioReporte(ajustes({}), ahora, TOKIO);
  igual(tokio.enviar, false, "23:00 locales: no es la hora del hogar (y estaría fuera de la ventana)");
});

caso("el minuto no entra en la decisión: a las 08:59 sigue siendo la hora 8", () => {
  const d = decidirEnvioReporte(ajustes({}), utc("2026-08-10T14:59:00Z"), CDMX);
  igual(d.enviar, true, "el cron corre una vez por hora; el minuto no descarta");
});

caso("MONTHLY: un correo por mes LOCAL, medido por etiqueta y no por 30 días", () => {
  // Enviado el 31 de enero; el 1 de febrero ya toca — aunque no hayan pasado
  // 30 días. Medir mensual en instantes dejaría febrero sin correo o
  // mandaría dos en marzo.
  const enviado = utc("2026-01-31T15:00:00Z"); // 09:00 en CDMX
  const d = decidirEnvioReporte(
    ajustes({ cadencia: "MONTHLY", horaLocal: 9, ultimoEnvioUtc: enviado }),
    utc("2026-02-01T15:00:00Z"),
    CDMX,
  );
  igual(d.enviar, true, "cambió el mes local: toca");
});

caso("MONTHLY: dentro del mismo mes local no reenvía", () => {
  const enviado = utc("2026-03-01T15:00:00Z");
  const d = decidirEnvioReporte(
    ajustes({ cadencia: "MONTHLY", horaLocal: 9, ultimoEnvioUtc: enviado }),
    utc("2026-03-30T15:00:00Z"),
    CDMX,
  );
  igual(d.enviar, false, "ya salió el correo de marzo");
  igual(d.motivo, "mes_ya_enviado", "motivo");
});

caso("MONTHLY: febrero corto no deja a marzo sin su correo", () => {
  const enviado = utc("2026-02-28T15:00:00Z");
  const d = decidirEnvioReporte(
    ajustes({ cadencia: "MONTHLY", horaLocal: 9, ultimoEnvioUtc: enviado }),
    utc("2026-03-15T15:00:00Z"),
    CDMX,
  );
  igual(d.enviar, true, "el mes cambió aunque hayan pasado 15 días");
});

caso("MONTHLY cruza de año: diciembre y enero son meses distintos", () => {
  const enviado = utc("2025-12-15T15:00:00Z");
  const d = decidirEnvioReporte(
    ajustes({ cadencia: "MONTHLY", horaLocal: 9, ultimoEnvioUtc: enviado }),
    utc("2026-01-15T15:00:00Z"),
    CDMX,
  );
  igual(d.enviar, true, "la etiqueta YYYY-MM distingue el año");
});

caso("un ultimoEnvioUtc en el futuro no rompe nada: todavía no toca", () => {
  // Un reloj adelantado al escribir `last_sent_at` no debe producir envíos
  // duplicados ni una excepción corriente abajo.
  const d = decidirEnvioReporte(
    ajustes({ ultimoEnvioUtc: utc("2026-08-12T14:00:00Z") }),
    utc("2026-08-10T14:00:00Z"),
    CDMX,
  );
  igual(d.enviar, false, "la semana «negativa» no cumple");
});

caso("dos hijos con el MISMO alias producen dos secciones, y el orden no explota", () => {
  // Los alias se generan con sufijo aleatorio, así que un empate es rarísimo
  // pero posible. `localeCompare` da 0 y el sort es estable: nadie se pierde.
  const r = construirReporteHogar("u1", PERIODO, [
    fila({ childProfileId: "cp_a", alias: "Ajolote42" }),
    fila({ childProfileId: "cp_b", alias: "Ajolote42" }),
  ]);
  igual(r.hijos.length, 2, "los dos hermanos tienen su sección");
});

caso("MONTHLY sin envío previo también sale a su hora", () => {
  const d = decidirEnvioReporte(
    ajustes({ cadencia: "MONTHLY", horaLocal: 9 }),
    utc("2026-08-10T15:00:00Z"),
    CDMX,
  );
  igual(d.enviar, true, "primer correo mensual");
});

caso("WEEKLY en otra zona: 7 días locales en Tokio", () => {
  const enviado = utc("2026-08-03T11:00:00Z"); // 20:00 en Tokio, dentro de la ventana
  const seis = decidirEnvioReporte(
    ajustes({ horaLocal: 20, ultimoEnvioUtc: enviado }),
    utc("2026-08-09T11:00:00Z"),
    TOKIO,
  );
  igual(seis.enviar, false, "seis días en Tokio tampoco son una semana");
  const siete = decidirEnvioReporte(
    ajustes({ horaLocal: 20, ultimoEnvioUtc: enviado }),
    utc("2026-08-10T11:00:00Z"),
    TOKIO,
  );
  igual(siete.enviar, true, "siete días locales en Tokio");
});

caso("la ventana de silencio es estructural: hora 6 y hora 21 no son ajustes válidos", () => {
  lanza(() => decidirEnvioReporte(ajustes({ horaLocal: 6 }), utc("2026-08-10T14:00:00Z"), CDMX), "ventana");
  lanza(() => decidirEnvioReporte(ajustes({ horaLocal: 21 }), utc("2026-08-10T14:00:00Z"), CDMX), "ventana");
});

caso("los bordes de la ventana (7 y 20) sí son válidos", () => {
  const siete = decidirEnvioReporte(ajustes({ horaLocal: 7 }), utc("2026-08-10T13:00:00Z"), CDMX);
  igual(siete.enviar, true, "07:00 es la primera hora permitida");
  const veinte = decidirEnvioReporte(ajustes({ horaLocal: 20 }), utc("2026-08-11T02:00:00Z"), CDMX);
  igual(veinte.enviar, true, "20:00 es la última hora permitida");
});

caso("una hora no entera no es un ajuste válido", () => {
  lanza(() => decidirEnvioReporte(ajustes({ horaLocal: 8.5 }), utc("2026-08-10T14:00:00Z"), CDMX), "ventana");
});

caso("una cadencia desconocida lanza, no se inventa un ritmo", () => {
  lanza(
    () => decidirEnvioReporte(ajustes({ cadencia: "DIARIA" }), utc("2026-08-10T14:00:00Z"), CDMX),
    "cadencia desconocida",
  );
});

caso("una zona desconocida lanza: el respaldo lo decide quien llama, no el motor", () => {
  lanza(
    () => decidirEnvioReporte(ajustes({}), utc("2026-08-10T14:00:00Z"), "Marte/Olimpo"),
    "zona horaria desconocida",
  );
});

caso("los defaults son los del dueño: WEEKLY a las 8, dentro de la ventana", () => {
  igual(CADENCIA_POR_DEFECTO, "WEEKLY", "decisión del 2026-08-02 (#286 pregunta 1)");
  igual(HORA_POR_DEFECTO, 8, "mañana, dentro de la ventana");
  if (HORA_POR_DEFECTO < HORA_MINIMA || HORA_POR_DEFECTO > HORA_MAXIMA) {
    throw new Error("la hora por defecto quedó fuera de la ventana de silencio");
  }
});

// --- ventanaDelPeriodo -------------------------------------------------------

caso("la ventana del periodo es de 7 días (WEEKLY) o 30 (MONTHLY)", () => {
  const hasta = utc("2026-08-10T00:00:00Z");
  const semanal = ventanaDelPeriodo("WEEKLY", hasta);
  igual(semanal.hasta - semanal.desde, 7 * 86_400_000, "una semana");
  const mensual = ventanaDelPeriodo("MONTHLY", hasta);
  igual(mensual.hasta - mensual.desde, 30 * 86_400_000, "un mes de treinta días");
});

console.log(`\n${corridos - fallos}/${corridos} casos pasaron\n`);
if (fallos > 0) process.exit(1);
