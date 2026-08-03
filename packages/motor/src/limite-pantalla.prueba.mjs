#!/usr/bin/env node
// Casos del motor del límite de pantalla — D-016, línea roja #6, #265 a #273.
//
//     node --experimental-strip-types packages/motor/src/limite-pantalla.prueba.mjs
//
// Por qué existen. Un error aquí no rompe nada visible. Un corte que cae a
// media respuesta se ve como «se me borró la pregunta»; un corte nocturno que
// no da la vuelta a la medianoche se ve como que nunca existió; un día que se
// cierra sin darse por cumplido se ve tres semanas después, cuando un padre
// pregunta por qué la racha de su hijo amaneció en 1 después de haber respetado
// el límite que él mismo puso. Ninguno da un error 500.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import {
  LIMITES_POR_BANDA,
  AVISO_MINUTOS_ANTES,
  FIN_DE_LA_NOCHE,
  TOPE_DE_CHECKPOINT_MIN,
  tieneLimite,
  minutosDiariosPermitidos,
  horaLocal,
  minutosDelDia,
  enVentanaNocturna,
  configuracionPorDefecto,
  configuracionVigente,
  usoInicial,
  acumular,
  marcarAvisado,
  reiniciarDescanso,
  marcarCierre,
  decidir,
  decidirAlIniciar,
  diaCumplidoPorCorte,
  diaEfectivo,
  SQL_UPSERT_USO,
} from "./limite-pantalla.ts";
import { ESTADO_INICIAL, registrarDia, diaEfectivo as diaEfectivoDeRacha } from "./racha.ts";

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
  if (v !== true) throw new Error(`${msg ?? "condición"}: esperaba true, obtuve ${JSON.stringify(v)}`);
};
const falso = (v, msg) => {
  if (v !== false) throw new Error(`${msg ?? "condición"}: esperaba false, obtuve ${JSON.stringify(v)}`);
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

console.log("\nlimite-pantalla — la tabla de D-016 (#266)\n");

// --- La tabla, y quién NO está en ella --------------------------------------

caso("solo KINDER, PRIMARIA y SECUNDARIA tienen fila", () => {
  igual(Object.keys(LIMITES_POR_BANDA).sort().join(","), "KINDER,PRIMARIA,SECUNDARIA");
});

caso("SERIO, JR y PRO no aparecen: «sin límite» es la AUSENCIA de fila", () => {
  for (const banda of ["SERIO", "JR", "PRO"]) {
    igual(LIMITES_POR_BANDA[banda], undefined, `${banda} tiene fila y no debería`);
    falso(tieneLimite(banda), `tieneLimite("${banda}")`);
  }
  // Y ningún valor infinito escondido: un Infinity es un número que alguien
  // acaba comparando, y la ausencia de fila es la decisión.
  for (const fila of Object.values(LIMITES_POR_BANDA)) {
    for (const [k, v] of Object.entries(fila)) {
      cierto(Number.isFinite(v), `${k} no es finito`);
    }
  }
});

caso("tieneLimite reconoce las tres bandas de menor", () => {
  for (const banda of ["KINDER", "PRIMARIA", "SECUNDARIA"]) cierto(tieneLimite(banda), banda);
});

caso("los valores son exactamente los de la tabla de D-016", () => {
  igual(JSON.stringify(LIMITES_POR_BANDA.KINDER), JSON.stringify({ defaultMin: 20, minMin: 10, maxMin: 45, descansoCadaMin: 15, corteNocturnoMinAntes: 60 }));
  igual(JSON.stringify(LIMITES_POR_BANDA.PRIMARIA), JSON.stringify({ defaultMin: 30, minMin: 15, maxMin: 60, descansoCadaMin: 20, corteNocturnoMinAntes: 60 }));
  igual(JSON.stringify(LIMITES_POR_BANDA.SECUNDARIA), JSON.stringify({ defaultMin: 45, minMin: 15, maxMin: 90, descansoCadaMin: 25, corteNocturnoMinAntes: 30 }));
});

caso("el aviso son 5 minutos en las tres bandas, no una columna por banda", () => {
  igual(AVISO_MINUTOS_ANTES, 5);
  for (const fila of Object.values(LIMITES_POR_BANDA)) {
    igual(Object.prototype.hasOwnProperty.call(fila, "avisoMin"), false, "una banda trae su propio aviso");
  }
});

// --- Los extremos exactos del rango (criterio de #266) ----------------------

caso("KINDER acepta 10 y 45, y rechaza 9 y 46", () => {
  cierto(minutosDiariosPermitidos("KINDER", 10), "10 aceptado");
  cierto(minutosDiariosPermitidos("KINDER", 45), "45 aceptado");
  falso(minutosDiariosPermitidos("KINDER", 9), "9 rechazado");
  falso(minutosDiariosPermitidos("KINDER", 46), "46 rechazado");
});

caso("PRIMARIA acepta 15 y 60, y rechaza 14 y 61", () => {
  cierto(minutosDiariosPermitidos("PRIMARIA", 15));
  cierto(minutosDiariosPermitidos("PRIMARIA", 60));
  falso(minutosDiariosPermitidos("PRIMARIA", 14));
  falso(minutosDiariosPermitidos("PRIMARIA", 61));
});

caso("SECUNDARIA acepta 15 y 90, y rechaza 14 y 91", () => {
  cierto(minutosDiariosPermitidos("SECUNDARIA", 15));
  cierto(minutosDiariosPermitidos("SECUNDARIA", 90));
  falso(minutosDiariosPermitidos("SECUNDARIA", 14));
  falso(minutosDiariosPermitidos("SECUNDARIA", 91));
});

caso("un valor no entero se rechaza: la columna es INTEGER y 22.5 se guardaría como 22", () => {
  falso(minutosDiariosPermitidos("KINDER", 22.5));
  falso(minutosDiariosPermitidos("KINDER", NaN));
  falso(minutosDiariosPermitidos("KINDER", Infinity));
});

caso("una banda sin fila nunca permite un valor: SERIO no configura minutos de niño", () => {
  falso(minutosDiariosPermitidos("SERIO", 30));
  falso(minutosDiariosPermitidos("PRO", 30));
});

console.log("\nla hora local del hogar (#273)\n");

caso("horaLocal usa la zona del HOGAR, no UTC", () => {
  // 2026-08-02T02:30:00Z = 20:30 del 1 de agosto en Ciudad de México (UTC-6).
  const t = Date.parse("2026-08-02T02:30:00Z");
  igual(horaLocal(t, "America/Mexico_City"), "20:30");
  igual(horaLocal(t, "UTC"), "02:30");
  igual(horaLocal(t, "Europe/Madrid"), "04:30");
});

caso("horaLocal da 24 horas, nunca 12: «08:30» de la noche y de la mañana no pueden ser la misma cadena", () => {
  const noche = Date.parse("2026-08-02T02:30:00Z"); // 20:30 en México
  const manana = Date.parse("2026-08-02T14:30:00Z"); // 08:30 en México
  igual(horaLocal(noche, "America/Mexico_City"), "20:30");
  igual(horaLocal(manana, "America/Mexico_City"), "08:30");
});

caso("medianoche es 00:00 y nunca 24:00", () => {
  igual(horaLocal(Date.parse("2026-08-02T00:00:00Z"), "UTC"), "00:00");
});

caso("una zona desconocida lanza en vez de adivinar", () => {
  lanza(() => horaLocal(Date.now(), "Marte/Olympus"), "zona horaria desconocida");
  lanza(() => horaLocal(Number.NaN, "UTC"), "instante no finito");
});

caso("minutosDelDia rechaza una hora imposible en vez de devolver un número raro", () => {
  igual(minutosDelDia("00:00"), 0);
  igual(minutosDelDia("19:30"), 1170);
  igual(minutosDelDia("23:59"), 1439);
  lanza(() => minutosDelDia("24:00"), "mal formada");
  lanza(() => minutosDelDia("7:30"), "mal formada");
  lanza(() => minutosDelDia("19:60"), "mal formada");
});

caso("diaEfectivo es LA MISMA función de racha.ts, no una copia", () => {
  cierto(diaEfectivo === diaEfectivoDeRacha, "dos calendarios distintos");
});

console.log("\nla ventana de corte nocturno (#273, mc-26 §5)\n");

caso("bedtime_local NULL desactiva el corte nocturno por completo", () => {
  for (const hora of ["00:00", "03:00", "12:00", "19:45", "23:59"]) {
    falso(enVentanaNocturna(hora, null, 60), `con bedtime null, ${hora} no puede caer en la ventana`);
  }
});

caso("con dormir a las 20:30 y una hora de antelación, la ventana empieza a las 19:30", () => {
  falso(enVentanaNocturna("19:29", "20:30", 60), "19:29 todavía no");
  cierto(enVentanaNocturna("19:30", "20:30", 60), "19:30 ya sí");
  cierto(enVentanaNocturna("20:30", "20:30", 60), "la hora de dormir");
});

caso("la ventana DA LA VUELTA a la medianoche: la una de la mañana está dentro", () => {
  // El caso del ECA de Bath: el niño que se despierta de madrugada.
  cierto(enVentanaNocturna("00:30", "20:30", 60), "00:30");
  cierto(enVentanaNocturna("01:00", "20:30", 60), "01:00");
  cierto(enVentanaNocturna("04:59", "20:30", 60), "04:59");
});

caso("la ventana termina al amanecer y no dura para siempre", () => {
  igual(FIN_DE_LA_NOCHE, "05:00");
  falso(enVentanaNocturna("05:00", "20:30", 60), "05:00 ya está fuera");
  falso(enVentanaNocturna("07:00", "20:30", 60), "las siete de la mañana");
  falso(enVentanaNocturna("15:00", "20:30", 60), "media tarde");
});

caso("SECUNDARIA usa 30 minutos de antelación, no 60", () => {
  const { corteNocturnoMinAntes } = LIMITES_POR_BANDA.SECUNDARIA;
  igual(corteNocturnoMinAntes, 30);
  falso(enVentanaNocturna("21:29", "22:00", corteNocturnoMinAntes), "21:29 con 30 min de antelación");
  cierto(enVentanaNocturna("21:30", "22:00", corteNocturnoMinAntes), "21:30 con 30 min de antelación");
});

caso("una hora de dormir justo después de medianoche no rompe la aritmética", () => {
  // Dormir a las 00:30 con una hora de antelación → ventana desde las 23:30.
  cierto(enVentanaNocturna("23:30", "00:30", 60), "23:30");
  cierto(enVentanaNocturna("02:00", "00:30", 60), "02:00");
  falso(enVentanaNocturna("22:00", "00:30", 60), "22:00 todavía no");
});

console.log("\nla configuración del padre, con o sin fila (#265 pregunta 3)\n");

caso("sin fila, aplica el default de la banda: la protección no espera al padre", () => {
  const c = configuracionVigente("KINDER", null);
  igual(c.daily_minutes, 20);
  igual(c.break_every_min, 15);
  igual(c.bedtime_cutoff_min, 60);
  igual(c.bedtime_local, null, "sin corte nocturno hasta que el padre lo encienda");
});

caso("el default nunca inventa una hora de dormir a partir del año de nacimiento", () => {
  for (const banda of ["KINDER", "PRIMARIA", "SECUNDARIA"]) {
    igual(configuracionPorDefecto(banda).bedtime_local, null, banda);
  }
});

caso("un daily_minutes fuera de rango se corrige al default, no se respeta", () => {
  const c = configuracionVigente("KINDER", {
    daily_minutes: 600,
    break_every_min: 15,
    bedtime_cutoff_min: 60,
    bedtime_local: null,
  });
  igual(c.daily_minutes, 20, "600 minutos no pueden convertirse en el límite de un niño de 5 años");
});

caso("bedtime_cutoff_min viene SIEMPRE de la banda, aunque la fila diga otra cosa", () => {
  const c = configuracionVigente("SECUNDARIA", {
    daily_minutes: 45,
    break_every_min: 25,
    bedtime_cutoff_min: 999,
    bedtime_local: "22:00",
  });
  igual(c.bedtime_cutoff_min, 30, "D-016 publica un solo valor por banda, sin rango");
});

caso("una hora de dormir mal formada se trata como «sin corte nocturno», no como medianoche", () => {
  const c = configuracionVigente("PRIMARIA", {
    daily_minutes: 30,
    break_every_min: 20,
    bedtime_cutoff_min: 60,
    bedtime_local: "veinte y media",
  });
  igual(c.bedtime_local, null);
});

console.log("\nel consumo del día (#267)\n");

caso("usoInicial empieza en cero, sin aviso y sin cierre", () => {
  const u = usoInicial("2026-08-02");
  igual(u.local_date, "2026-08-02");
  igual(u.minutes_used, 0);
  igual(u.minutes_since_break, 0);
  igual(u.warned_at, null);
  igual(u.ended_reason, null);
});

caso("acumular suma a los dos contadores", () => {
  const u = acumular(usoInicial("2026-08-02"), 3);
  igual(u.minutes_used, 3);
  igual(u.minutes_since_break, 3);
});

caso("un delta negativo o cero no resta minutos ya jugados", () => {
  const base = acumular(usoInicial("2026-08-02"), 10);
  igual(acumular(base, -5).minutes_used, 10, "restar convertiría el desorden en tiempo regalado");
  igual(acumular(base, 0).minutes_used, 10);
  igual(acumular(base, NaN).minutes_used, 10);
});

caso("un delta absurdo se recorta: la tapa cerrada no es tiempo jugado", () => {
  const u = acumular(usoInicial("2026-08-02"), 480);
  igual(u.minutes_used, TOPE_DE_CHECKPOINT_MIN);
  igual(TOPE_DE_CHECKPOINT_MIN, 10);
});

caso("marcarAvisado es idempotente y devuelve EL MISMO objeto la segunda vez", () => {
  const u = marcarAvisado(usoInicial("2026-08-02"), 1000);
  igual(u.warned_at, 1000);
  const otra = marcarAvisado(u, 2000);
  cierto(otra === u, "devolvió una copia; quien llama no puede comparar por referencia");
  igual(otra.warned_at, 1000, "el segundo aviso sobrescribió el primero");
});

caso("reiniciarDescanso pone el contador del descanso en 0 y NO toca el del día", () => {
  const base = acumular(usoInicial("2026-08-02"), 9);
  const u = reiniciarDescanso(base);
  igual(u.minutes_since_break, 0);
  igual(u.minutes_used, 9, "descansar no puede regalar ni cobrar minutos del límite diario");
});

caso("marcarCierre guarda el primer motivo y no lo sobrescribe", () => {
  const u = marcarCierre(usoInicial("2026-08-02"), "BEDTIME");
  igual(u.ended_reason, "BEDTIME");
  igual(marcarCierre(u, "DAILY_LIMIT").ended_reason, "BEDTIME");
});

caso("el SQL escribe el estado completo y su llave es (niño, día)", () => {
  cierto(SQL_UPSERT_USO.includes("ON CONFLICT (child_profile_id, local_date)"), "la llave compuesta");
  falso(/minutes_used\s*=\s*minutes_used\s*\+/.test(SQL_UPSERT_USO), "escribe un delta: un reintento sumaría dos veces");
});

console.log("\nla decisión (#270, #271, #272, #273)\n");

const usoCon = (campos) => ({ ...usoInicial("2026-08-02"), ...campos });
const entradaBase = {
  banda: "PRIMARIA",
  config: null, // 30 min de default, sin corte nocturno
  uso: usoInicial("2026-08-02"),
  horaAhora: "16:00",
  puntoSeguro: true,
};

caso("con minutos de sobra y a media tarde, se sigue jugando", () => {
  igual(decidir(entradaBase).tipo, "SEGUIR");
});

caso("SIN punto seguro NUNCA se corta, pase lo que pase", () => {
  // El barrido completo: ninguna combinación de estado puede producir algo
  // distinto de SEGUIR mientras haya un ítem servido esperando respuesta.
  let combinaciones = 0;
  for (const banda of ["KINDER", "PRIMARIA", "SECUNDARIA"]) {
    for (const minutos of [0, 5, 25, 30, 45, 90, 500]) {
      for (const desdeDescanso of [0, 14, 15, 20, 25, 999]) {
        for (const hora of ["03:00", "12:00", "19:45", "21:00", "23:59"]) {
          for (const bedtime of [null, "20:30", "22:00"]) {
            for (const avisado of [null, 1000]) {
              combinaciones++;
              const d = decidir({
                banda,
                config: {
                  daily_minutes: LIMITES_POR_BANDA[banda].defaultMin,
                  break_every_min: LIMITES_POR_BANDA[banda].descansoCadaMin,
                  bedtime_cutoff_min: LIMITES_POR_BANDA[banda].corteNocturnoMinAntes,
                  bedtime_local: bedtime,
                },
                uso: usoCon({ minutes_used: minutos, minutes_since_break: desdeDescanso, warned_at: avisado }),
                horaAhora: hora,
                puntoSeguro: false,
              });
              if (d.tipo !== "SEGUIR") {
                throw new Error(
                  `con un ítem servido sin contestar, ${banda}/${minutos}min/${hora}/${bedtime} dio ${d.tipo}. ` +
                    "D-016: «Nunca corte seco a media respuesta».",
                );
              }
            }
          }
        }
      }
    }
  }
  if (combinaciones < 1000) throw new Error(`solo se probaron ${combinaciones} combinaciones`);
  console.log(`      (${combinaciones} combinaciones, todas SEGUIR)`);
});

caso("al llegar al límite diario se cierra por DAILY_LIMIT", () => {
  const d = decidir({ ...entradaBase, uso: usoCon({ minutes_used: 30 }) });
  igual(d.tipo, "CERRAR");
  igual(d.motivo, "DAILY_LIMIT");
});

caso("a cinco minutos del límite se avisa, no se cierra", () => {
  const d = decidir({ ...entradaBase, uso: usoCon({ minutes_used: 25 }) });
  igual(d.tipo, "AVISO");
});

caso("el aviso no se repite el mismo día: warned_at ya escrito devuelve SEGUIR", () => {
  const d = decidir({ ...entradaBase, uso: usoCon({ minutes_used: 26, warned_at: 1000 }) });
  igual(d.tipo, "SEGUIR", "el niño cerró y reabrió la app entre el aviso y el corte");
});

caso("el descanso se ofrece al alcanzar los minutos de la banda", () => {
  const d = decidir({ ...entradaBase, uso: usoCon({ minutes_used: 20, minutes_since_break: 20 }) });
  igual(d.tipo, "DESCANSO");
});

caso("el descanso es una oferta, no un cierre: la decisión no lleva motivo de cierre", () => {
  const d = decidir({ ...entradaBase, uso: usoCon({ minutes_used: 20, minutes_since_break: 20 }) });
  igual(d.motivo, undefined, "un DESCANSO con motivo de cierre sería un bloqueo disfrazado");
  igual(JSON.stringify(d), JSON.stringify({ tipo: "DESCANSO" }), "el descanso no lleva segundos de espera");
});

caso("la noche gana al límite diario: es lo único con evidencia experimental", () => {
  const d = decidir({
    ...entradaBase,
    config: { daily_minutes: 30, break_every_min: 20, bedtime_cutoff_min: 60, bedtime_local: "20:30" },
    uso: usoCon({ minutes_used: 30 }),
    horaAhora: "19:45",
  });
  igual(d.tipo, "CERRAR");
  igual(d.motivo, "BEDTIME");
});

caso("dentro de la ventana nocturna se cierra aunque queden minutos del día", () => {
  const d = decidir({
    ...entradaBase,
    config: { daily_minutes: 30, break_every_min: 20, bedtime_cutoff_min: 60, bedtime_local: "20:30" },
    uso: usoCon({ minutes_used: 2 }),
    horaAhora: "01:00",
  });
  igual(d.tipo, "CERRAR");
  igual(d.motivo, "BEDTIME");
});

caso("sin fila de configuración, el límite YA protege con el default de la banda", () => {
  const d = decidir({ ...entradaBase, banda: "KINDER", config: null, uso: usoCon({ minutes_used: 20 }) });
  igual(d.tipo, "CERRAR", "un perfil sin configuración jugaría sin límite ninguno");
  igual(d.motivo, "DAILY_LIMIT");
});

caso("decidirAlIniciar bloquea empezar de madrugada (respuesta A de #265 pregunta 1)", () => {
  const d = decidirAlIniciar({
    banda: "PRIMARIA",
    config: { daily_minutes: 30, break_every_min: 20, bedtime_cutoff_min: 60, bedtime_local: "20:30" },
    uso: usoInicial("2026-08-02"),
    horaAhora: "01:00",
  });
  igual(d.tipo, "CERRAR");
  igual(d.motivo, "BEDTIME");
});

caso("decidirAlIniciar deja empezar por la mañana", () => {
  const d = decidirAlIniciar({
    banda: "PRIMARIA",
    config: { daily_minutes: 30, break_every_min: 20, bedtime_cutoff_min: 60, bedtime_local: "20:30" },
    uso: usoInicial("2026-08-02"),
    horaAhora: "09:00",
  });
  igual(d.tipo, "SEGUIR");
});

caso("decidirAlIniciar es LA MISMA tabla de decisión, no una segunda", () => {
  // Si fueran dos tablas, una regla nueva podría aplicarse a una puerta y
  // olvidarse en la otra. Se comprueba comparando las dos salidas sobre un
  // barrido, con puntoSeguro true — que es lo que el arranque es por definición.
  for (const minutos of [0, 10, 25, 29, 30, 60]) {
    for (const hora of ["09:00", "19:45", "23:00", "02:00"]) {
      const comun = {
        banda: "PRIMARIA",
        config: { daily_minutes: 30, break_every_min: 20, bedtime_cutoff_min: 60, bedtime_local: "20:30" },
        uso: usoCon({ minutes_used: minutos }),
        horaAhora: hora,
      };
      igual(
        JSON.stringify(decidirAlIniciar(comun)),
        JSON.stringify(decidir({ ...comun, puntoSeguro: true })),
        `${minutos}min ${hora}`,
      );
    }
  }
});

console.log("\nla línea roja #6: cuando el límite corta, el día se da por cumplido\n");

caso("los dos motivos de cierre dan el MISMO motivo de racha", () => {
  const a = diaCumplidoPorCorte("DAILY_LIMIT");
  const b = diaCumplidoPorCorte("BEDTIME");
  igual(a.tipo, "LIMITE_DE_PANTALLA_CORTO_LA_SESION");
  igual(JSON.stringify(a), JSON.stringify(b), "el motivo de cierre entró en la aritmética de la racha");
});

caso("no hay ningún camino donde el corte deje al niño sin su día", () => {
  // El tipo de retorno es MotivoDelDia, no MotivoDelDia | null. En tiempo de
  // ejecución se comprueba lo mismo: para todo motivo de cierre hay motivo.
  for (const cierre of ["DAILY_LIMIT", "BEDTIME"]) {
    const m = diaCumplidoPorCorte(cierre);
    if (m === null || m === undefined) throw new Error(`${cierre} devolvió ${m}`);
    igual(m.tipo, "LIMITE_DE_PANTALLA_CORTO_LA_SESION", cierre);
  }
});

caso("el corte, atravesando el motor de racha, no baja la racha ni gasta un escudo", () => {
  // Es el cable completo, extremo a extremo: el límite corta, produce su
  // motivo, y ese motivo entra en `registrarDia`. Aquí se ejecuta de verdad.
  let combinaciones = 0;
  for (const racha of [0, 1, 6, 7, 13, 14, 40]) {
    for (const escudos of [0, 1, 2]) {
      for (const cierre of ["DAILY_LIMIT", "BEDTIME"]) {
        combinaciones++;
        const base = {
          ...ESTADO_INICIAL,
          current_streak: racha,
          max_streak: racha,
          last_completed_local_date: "2026-08-01",
          shields_available: escudos,
          shields_earned_total: escudos,
        };
        const conLimite = registrarDia(base, "2026-08-02", diaCumplidoPorCorte(cierre));
        const conReto = registrarDia(base, "2026-08-02", { tipo: "RETO_COMPLETADO" });
        igual(JSON.stringify(conLimite), JSON.stringify(conReto), `racha ${racha}, escudos ${escudos}, ${cierre}`);
        if (conLimite.current_streak < racha) {
          throw new Error(`el corte bajó la racha de ${racha} a ${conLimite.current_streak}`);
        }
        if (conLimite.shields_available < escudos) {
          throw new Error(`el corte gastó un escudo (${escudos} → ${conLimite.shields_available})`);
        }
      }
    }
  }
  console.log(`      (${combinaciones} estados, límite ≡ reto completado en todos)`);
});

console.log("\nlo que no se puede vender (línea roja #4, D-057)\n");

caso("ninguna función del motor acepta un precio: las firmas se leen y se cuentan", () => {
  igual(minutosDiariosPermitidos.length, 2, "banda, minutos");
  igual(decidir.length, 1, "una sola entrada");
  igual(decidirAlIniciar.length, 1, "una sola entrada");
  igual(configuracionVigente.length, 2, "banda, fila");
  igual(acumular.length, 2, "uso, minutos");
  igual(diaCumplidoPorCorte.length, 1, "motivo de cierre");
});

caso("un campo de pago inyectado en la entrada NO cambia la decisión", () => {
  const base = {
    banda: "KINDER",
    config: null,
    uso: usoCon({ minutes_used: 20 }),
    horaAhora: "16:00",
    puntoSeguro: true,
  };
  const sinPago = JSON.stringify(decidir(base));
  for (const pago of [
    { plan: "familia" },
    { premium: true },
    { suscripcion_activa: 1 },
    { pagado: true, sku: "limite_extra", precio: 999 },
    { daily_minutes: 600 },
  ]) {
    const conPago = JSON.stringify(decidir({ ...base, ...pago }));
    igual(conPago, sinPago, `el campo ${JSON.stringify(pago)} movió la decisión`);
  }
});

console.log(`\n${corridos - fallos}/${corridos} casos pasaron\n`);
if (fallos > 0) process.exit(1);
