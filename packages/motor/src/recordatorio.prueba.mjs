#!/usr/bin/env node
// Casos del decisor del recordatorio push al padre — F7 #207, D-105, mc-19.
//
//     node --experimental-strip-types packages/motor/src/recordatorio.prueba.mjs
//
// Por qué existen. Un error aquí no rompe nada visible: produce un push a las
// 21:00, o dos pushes el mismo día, o un «no pierdas la racha» disfrazado de
// recordatorio en un día ya completado. Nadie ve un error 500 — lo ve un padre
// que apagó el recordatorio para siempre, que es exactamente el daño que
// mc-19 rec. #4 y D-026 existen para impedir.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import {
  UN_PUSH_POR_HOGAR_POR_DIA,
  HORA_MAS_TEMPRANA,
  HORA_MAS_TARDE,
  HORA_RECORDATORIO_POR_DEFECTO,
  decidirRecordatorio,
} from "./recordatorio.ts";

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

// Un instante UTC fijo y la zona del hogar, para que «qué hora es aquí» sea
// reproducible. 2026-08-03T23:30:00Z en America/Mexico_City (UTC-6 en agosto)
// son las 17:30 locales del 2026-08-03 — dentro de horario, después de las
// 17:00 por defecto.
const ZONA = "America/Mexico_City";
const TARDE_UTC = Date.parse("2026-08-03T23:30:00Z"); // 17:30 locales

/** Estado base: un hogar con un aprendiz pendiente, nada enviado, sin silencio. */
const base = {
  ahoraUtc: TARDE_UTC,
  zonaIana: ZONA,
  ventanaInicio: null,
  aprendicesPendientes: 1,
  aprendicesCompletados: 0,
  enviadosHoy: 0,
  silenciado: false,
};

// ─── Las constantes, por nombre y por valor (criterio #2 del issue) ────────

caso("el tope es 1 y se llama UN_PUSH_POR_HOGAR_POR_DIA", () => {
  igual(UN_PUSH_POR_HOGAR_POR_DIA, 1, "UN_PUSH_POR_HOGAR_POR_DIA");
});

caso("las horas de silencio son 07:00–20:00 y el defecto 17:00 (mc-19 rec. #13)", () => {
  igual(HORA_MAS_TEMPRANA, "07:00", "HORA_MAS_TEMPRANA");
  igual(HORA_MAS_TARDE, "20:00", "HORA_MAS_TARDE");
  igual(HORA_RECORDATORIO_POR_DEFECTO, "17:00", "HORA_RECORDATORIO_POR_DEFECTO");
});

// ─── El caso feliz: toca enviar ─────────────────────────────────────────────

caso("tarde, meta sin completar, nada enviado: ENVÍA", () => {
  const d = decidirRecordatorio(base);
  cierto(d.enviar, `esperaba enviar, salió ${d.motivo}`);
  igual(d.motivo, "enviar", "motivo");
  igual(d.diaLocal, "2026-08-03", "día local del hogar");
  igual(d.hora, "17:30", "hora local del hogar");
});

// ─── Meta completada → no envía (criterio #3, mc-19 pregunta abierta #2) ───

caso("un aprendiz completó la meta hoy: NO envía", () => {
  const d = decidirRecordatorio({ ...base, aprendicesCompletados: 1, aprendicesPendientes: 0 });
  cierto(!d.enviar, "con la meta completada no se empuja nunca");
  igual(d.motivo, "meta_completada", "motivo");
});

caso("un hermano completó y otro no: TAMPOCO envía (un completado silencia el día)", () => {
  const d = decidirRecordatorio({ ...base, aprendicesCompletados: 1, aprendicesPendientes: 2 });
  cierto(!d.enviar, "un solo completado silencia el hogar entero");
  igual(d.motivo, "meta_completada", "motivo");
});

// ─── Dos hijos pendientes → UN push agregado (issue #207) ──────────────────

caso("dos aprendices pendientes: una sola decisión de envío, agregada", () => {
  const d = decidirRecordatorio({ ...base, aprendicesPendientes: 2 });
  cierto(d.enviar, `esperaba enviar, salió ${d.motivo}`);
  igual(d.pendientes, 2, "la decisión lleva el conteo para la plantilla plural");
  igual(UN_PUSH_POR_HOGAR_POR_DIA, 1, "y el tope por hogar sigue siendo uno");
});

// ─── Horario: 21:00 local → no envía (mc-19 rec. #13) ──────────────────────

caso("21:00 local: NO envía", () => {
  // 2026-08-04T03:00:00Z son las 21:00 del 2026-08-03 en Mexico_City.
  const d = decidirRecordatorio({ ...base, ahoraUtc: Date.parse("2026-08-04T03:00:00Z") });
  cierto(!d.enviar, "después de las 20:00 no suena");
  igual(d.motivo, "fuera_de_horario", "motivo");
  igual(d.diaLocal, "2026-08-03", "sigue siendo el mismo día local");
});

caso("06:59 local: NO envía; 07:00 local: SÍ (la orilla de la mañana)", () => {
  // 12:59Z = 06:59 locales; 13:00Z = 07:00 locales.
  const antes = decidirRecordatorio({ ...base, ahoraUtc: Date.parse("2026-08-03T12:59:00Z") });
  cierto(!antes.enviar, "antes de las 07:00 no suena");
  igual(antes.motivo, "fuera_de_horario", "motivo 06:59");
  const justo = decidirRecordatorio({
    ...base,
    ahoraUtc: Date.parse("2026-08-03T13:00:00Z"),
    ventanaInicio: "07:00",
  });
  cierto(justo.enviar, `a las 07:00 con ventana a las 07:00 suena, salió ${justo.motivo}`);
});

caso("20:00 local: SÍ (la orilla de la noche es cerrada); 20:01: NO", () => {
  // 2026-08-04T02:00:00Z = 20:00 locales; 02:01Z = 20:01.
  const justo = decidirRecordatorio({ ...base, ahoraUtc: Date.parse("2026-08-04T02:00:00Z") });
  cierto(justo.enviar, `a las 20:00 en punto aún suena, salió ${justo.motivo}`);
  const despues = decidirRecordatorio({ ...base, ahoraUtc: Date.parse("2026-08-04T02:01:00Z") });
  cierto(!despues.enviar, "20:01 ya es después de las 20:00");
});

// ─── Antes de la ventana → no envía (mc-19 rec. #14) ───────────────────────

caso("16:30 local sin ventana configurada (defecto 17:00): NO envía todavía", () => {
  const d = decidirRecordatorio({ ...base, ahoraUtc: Date.parse("2026-08-03T22:30:00Z") }); // 16:30
  cierto(!d.enviar, "antes de la hora de la ventana no suena");
  igual(d.motivo, "antes_de_la_ventana", "motivo");
});

caso("con ventana del padre a las 18:30, a las 17:30 NO suena y a las 18:45 SÍ", () => {
  const antes = decidirRecordatorio({ ...base, ventanaInicio: "18:30", ahoraUtc: TARDE_UTC }); // 17:30
  cierto(!antes.enviar, "la ventana del padre manda sobre el defecto");
  igual(antes.motivo, "antes_de_la_ventana", "motivo");
  const dentro = decidirRecordatorio({
    ...base,
    ventanaInicio: "18:30",
    ahoraUtc: Date.parse("2026-08-04T00:45:00Z"), // 18:45
  });
  cierto(dentro.enviar, `a las 18:45 con ventana 18:30 suena, salió ${dentro.motivo}`);
});

// ─── Ya se envió hoy → no envía (mc-19 rec. #4, tope por hogar) ────────────

caso("ya se envió hoy: NO envía", () => {
  const d = decidirRecordatorio({ ...base, enviadosHoy: 1 });
  cierto(!d.enviar, "el tope de 1/día por hogar ya se gastó");
  igual(d.motivo, "tope_diario", "motivo");
});

caso("el tope se reinicia al día siguiente LOCAL, no a medianoche UTC", () => {
  // 2026-08-04T05:30:00Z es el 2026-08-03 23:30 en Mexico_City: nuevo día UTC,
  // MISMO día local. Enviado hoy = todavía no.
  const mismoDiaLocal = decidirRecordatorio({
    ...base,
    enviadosHoy: 1,
    ahoraUtc: Date.parse("2026-08-04T05:30:00Z"),
  });
  igual(mismoDiaLocal.diaLocal, "2026-08-03", "medianoche UTC no cambia el día del hogar");
  cierto(!mismoDiaLocal.enviar, "el tope no se reinicia a medianoche UTC");
});

// ─── Silenciado → no envía JAMÁS (D-026) ───────────────────────────────────

caso("silenciado: NO envía, aunque todo lo demás diga que sí", () => {
  const d = decidirRecordatorio({ ...base, silenciado: true });
  cierto(!d.enviar, "el silencio permanente manda");
  igual(d.motivo, "silenciado", "motivo");
});

caso("el silencio manda sobre el tope y sobre la hora: se mira PRIMERO", () => {
  // Silenciado y además fuera de horario y además con el tope gastado: el
  // motivo tiene que ser el silencio, porque es el contrato con la persona.
  const d = decidirRecordatorio({
    ...base,
    silenciado: true,
    enviadosHoy: 1,
    ahoraUtc: Date.parse("2026-08-04T03:00:00Z"), // 21:00 local
  });
  igual(d.motivo, "silenciado", "el silencio se decide antes que cualquier horario");
});

// ─── Sin aprendices → no envía ──────────────────────────────────────────────

caso("hogar sin aprendices pendientes: NO envía", () => {
  const d = decidirRecordatorio({ ...base, aprendicesPendientes: 0 });
  cierto(!d.enviar, "nadie a quien recordar");
  igual(d.motivo, "sin_pendientes", "motivo");
});

// ─── El adulto aprendiz es un aprendiz más (issue #207 § banda adulta) ──────

caso("adulto aprendiz sin hijos, sin completar: ENVÍA (a su propia cuenta)", () => {
  // Para la capa de datos el adulto es un aprendiz pendiente más; el decisor
  // no distingue — y no debe: «nunca con culpa» aplica igual, mismo tope.
  const d = decidirRecordatorio({ ...base, aprendicesPendientes: 1, aprendicesCompletados: 0 });
  cierto(d.enviar, `esperaba enviar, salió ${d.motivo}`);
  igual(d.pendientes, 1, "un aprendiz pendiente: plantilla singular");
});

// ─── La zona la manda el hogar, no el dispositivo ni UTC ───────────────────

caso("el mismo instante decide distinto según users.timezone", () => {
  // 2026-08-03T23:30:00Z: 17:30 en Mexico_City (suena) pero 01:30+1 en
  // Europe/Madrid del 2026-08-04 (fuera de horario, y ya es OTRO día local).
  const madrid = decidirRecordatorio({ ...base, zonaIana: "Europe/Madrid" });
  cierto(!madrid.enviar, "en Madrid es de madrugada: no suena");
  igual(madrid.motivo, "fuera_de_horario", "motivo Madrid");
  igual(madrid.diaLocal, "2026-08-04", "y ya es el día siguiente allá");
});

console.log("");
if (fallos > 0) {
  console.error(`✗ ${fallos} de ${corridos} casos fallaron`);
  process.exit(1);
}
console.log(`✓ ${corridos} casos del decisor del recordatorio`);
