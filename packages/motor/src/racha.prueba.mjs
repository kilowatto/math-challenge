#!/usr/bin/env node
// Casos del motor de racha — D-014 (línea roja #6), D-016, #200 a #204, #209.
//
//     node --experimental-strip-types packages/motor/src/racha.prueba.mjs
//
// Por qué existen. Un error aquí no rompe nada visible: produce un número que
// baja cuando no debía, o un escudo que se gasta cuando el corte lo puso el
// padre. Nadie ve un error 500; se ve un niño al que se le rompió la racha por
// respetar su límite de pantalla, que es literalmente lo que D-014 prohíbe.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import {
  ESTADO_INICIAL,
  TOPE_ESCUDOS,
  PAUSAS_POR_ANIO,
  DIAS_MAXIMOS_DE_PAUSA,
  VENTANA_DE_REPARACION,
  ZONA_DE_RESPALDO,
  zonaValida,
  diaEfectivo,
  diasEntre,
  sumarDias,
  anioDe,
  registrarDia,
  ganarEscudos,
  declararPausa,
  PausaRechazada,
} from "./racha.ts";

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

const RETO = { tipo: "RETO_COMPLETADO" };
const LIMITE = { tipo: "LIMITE_DE_PANTALLA_CORTO_LA_SESION" };

/** Un estado con lo que se le quiera cambiar encima. */
const con = (parcial) => ({ ...ESTADO_INICIAL, ...parcial });

/** Corre una seguidilla de días consecutivos desde `desde`. */
function correrDias(estado, desde, cuantos, motivo = RETO) {
  let e = estado;
  for (let i = 0; i < cuantos; i++) e = registrarDia(e, sumarDias(desde, i), motivo);
  return e;
}

console.log("\n== motor de racha — D-014 línea roja #6 ==\n");

// --- El día efectivo (#200) -------------------------------------------------

caso("el día es LOCAL del hogar: 19:00 en Ciudad de México sigue siendo ese día", () => {
  // 2026-08-03T01:00:00Z son las 19:00 del 2 de agosto en America/Mexico_City.
  const t = Date.parse("2026-08-03T01:00:00Z");
  igual(diaEfectivo(t, "America/Mexico_City"), "2026-08-02", "México");
  igual(diaEfectivo(t, "UTC"), "2026-08-03", "UTC");
});

caso("Kiribati y Hawái, el mismo instante, dos días distintos", () => {
  const t = Date.parse("2026-08-02T12:00:00Z");
  igual(diaEfectivo(t, "Pacific/Kiritimati"), "2026-08-03", "Kiribati (UTC+14)");
  igual(diaEfectivo(t, "Pacific/Honolulu"), "2026-08-02", "Hawái (UTC-10)");
});

caso("una zona desconocida lanza; el respaldo lo decide quien llama", () => {
  lanza(() => diaEfectivo(Date.now(), "Marte/Olympus"), "zona horaria desconocida");
  igual(zonaValida("Marte/Olympus"), false, "zona inventada");
  igual(zonaValida(ZONA_DE_RESPALDO), true, "el respaldo tiene que ser válido");
});

caso("viajar de México a Madrid no cuenta el mismo día dos veces ni lo hace retroceder", () => {
  // El niño juega a las 23:00 del 1 de agosto, hora de México (= 05:00 UTC del 2).
  const antes = Date.parse("2026-08-02T05:00:00Z");
  const diaOrigen = diaEfectivo(antes, "America/Mexico_City");
  igual(diaOrigen, "2026-08-01", "día en origen");

  // La familia vuela; ocho horas después, ya en Madrid, vuelve a jugar.
  const despues = Date.parse("2026-08-02T13:00:00Z");
  const diaDestino = diaEfectivo(despues, "Europe/Madrid");
  igual(diaDestino, "2026-08-02", "día en destino");

  let e = registrarDia(ESTADO_INICIAL, diaOrigen, RETO);
  e = registrarDia(e, diaDestino, RETO);
  igual(e.current_streak, 2, "dos días seguidos, no uno ni tres");

  // Y al revés: volar hacia el oeste NO puede hacer que el día retroceda y se
  // cuente dos veces. Aquí el día efectivo repite, y repetir es un no-op.
  const regreso = Date.parse("2026-08-02T23:00:00Z"); // 17:00 en México
  igual(diaEfectivo(regreso, "America/Mexico_City"), "2026-08-02", "día de vuelta");
  const f = registrarDia(e, diaEfectivo(regreso, "America/Mexico_City"), RETO);
  igual(f, e, "el mismo día otra vez no avanza nada");
});

caso("la aritmética de días es de calendario, no de horas: el cambio de horario no la mueve", () => {
  // En America/Los_Angeles el 8 de marzo de 2026 dura 23 horas reales.
  igual(diasEntre("2026-03-08", "2026-03-09"), 1, "salto de primavera");
  igual(diasEntre("2026-11-01", "2026-11-02"), 1, "salto de otoño");
  igual(diasEntre("2028-02-28", "2028-03-01"), 2, "año bisiesto");
  igual(sumarDias("2026-12-31", 1), "2027-01-01", "cambio de año");
  igual(sumarDias("2026-01-01", -1), "2025-12-31", "hacia atrás");
  igual(anioDe("2026-08-02"), 2026, "año");
});

// --- Registrar un día (#201) ------------------------------------------------

caso("el primer día de la vida del perfil deja la racha en 1", () => {
  const e = registrarDia(ESTADO_INICIAL, "2026-08-02", RETO);
  igual(e.current_streak, 1, "racha");
  igual(e.max_streak, 1, "máxima");
  igual(e.last_completed_local_date, "2026-08-02", "último día");
});

caso("llamarla dos veces con el mismo día es un no-op — y devuelve el MISMO objeto", () => {
  const uno = registrarDia(ESTADO_INICIAL, "2026-08-02", RETO);
  const dos = registrarDia(uno, "2026-08-02", RETO);
  igual(dos, uno, "identidad de referencia");
  igual(dos.current_streak, 1, "la racha no se duplicó");
});

caso("un día que llega FUERA DE ORDEN no hace retroceder la racha", () => {
  // Pasa de verdad al sincronizar una cola offline (#209).
  const e = correrDias(ESTADO_INICIAL, "2026-08-01", 3);
  igual(e.current_streak, 3, "tres días");
  const f = registrarDia(e, "2026-07-30", RETO);
  igual(f, e, "el día viejo no cambia nada");
});

caso("max_streak nunca baja, ni cuando current_streak se resetea", () => {
  let e = correrDias(ESTADO_INICIAL, "2026-08-01", 10); // racha 10
  igual(e.max_streak, 10, "máxima tras 10");
  e = registrarDia(e, "2026-09-01", RETO); // un mes después, sin escudos
  igual(e.current_streak, 1, "vuelve a empezar");
  igual(e.max_streak, 10, "la mejor marca se queda");
});

caso("dos días de vuelo sin señal sincronizados juntos avanzan 2, no 0 ni 1 (#209)", () => {
  let e = registrarDia(ESTADO_INICIAL, "2026-08-01", RETO);
  // Al aterrizar se drena la cola en orden.
  e = registrarDia(e, "2026-08-02", RETO);
  e = registrarDia(e, "2026-08-03", RETO);
  igual(e.current_streak, 3, "racha");
});

caso("un día mal formado lanza antes de tocar el estado", () => {
  lanza(() => registrarDia(ESTADO_INICIAL, "2026-8-2", RETO), "mal formado");
  lanza(() => registrarDia(ESTADO_INICIAL, "ayer", RETO), "mal formado");
  lanza(() => registrarDia(ESTADO_INICIAL, "2026-08-02", { tipo: "PORQUE_SI" }), "motivo desconocido");
});

// --- El límite de pantalla nunca rompe la racha (#202, D-014, línea roja #6) --

caso("una sesión cortada por el límite con CERO ítems contestados avanza la racha igual", () => {
  const e = registrarDia(ESTADO_INICIAL, "2026-08-02", LIMITE);
  igual(e.current_streak, 1, "racha");
  // Y al día siguiente, otra vez cortada: sigue sumando.
  const f = registrarDia(e, "2026-08-03", LIMITE);
  igual(f.current_streak, 2, "racha");
});

caso("ningún escudo se consume cuando el motivo es el límite de pantalla", () => {
  const base = con({
    current_streak: 9,
    max_streak: 9,
    last_completed_local_date: "2026-08-02",
    shields_available: 2,
    shields_earned_total: 2,
  });
  const e = registrarDia(base, "2026-08-03", LIMITE);
  igual(e.shields_available, 2, "el banco no se toca");
  igual(e.current_streak, 10, "y la racha avanza");
});

caso("una familia que topa el límite TODOS los días nunca gasta un escudo", () => {
  let e = con({ shields_available: 2, shields_earned_total: 2 });
  e = correrDias(e, "2026-08-01", 60, LIMITE);
  igual(e.current_streak, 60, "dos meses de cortes");
  igual(e.shields_available, 2, "los dos escudos siguen ahí");
});

caso("el motivo NO entra en la aritmética: LIMITE y RETO dan el mismo estado, siempre", () => {
  // Es la garantía dura de la línea roja #6, y se comprueba por barrido en vez
  // de con un caso: cualquier rama que trate distinto al límite aparece aquí.
  const dias = ["2026-08-03", "2026-08-04", "2026-08-06", "2026-08-10", "2026-09-01"];
  const bancos = [0, 1, 2];
  const rachas = [0, 1, 6, 7, 13, 40];
  const pausas = [null, "2026-08-05", "2026-08-31"];
  let combinaciones = 0;

  for (const dia of dias) {
    for (const shields_available of bancos) {
      for (const current_streak of rachas) {
        for (const pause_until_local_date of pausas) {
          const base = con({
            current_streak,
            max_streak: current_streak,
            last_completed_local_date: "2026-08-02",
            shields_available,
            pause_until_local_date,
          });
          const conReto = registrarDia(base, dia, RETO);
          const conLimite = registrarDia(base, dia, LIMITE);
          igual(
            JSON.stringify(conLimite),
            JSON.stringify(conReto),
            `${dia} · racha ${current_streak} · escudos ${shields_available} · pausa ${pause_until_local_date}`,
          );
          combinaciones++;
        }
      }
    }
  }
  igual(combinaciones, dias.length * bancos.length * rachas.length * pausas.length, "barrido");
});

// --- Escudos (#203) ---------------------------------------------------------

caso("racha de 13 con banco vacío gana 1 escudo, no 2 — floor(13/7)=1", () => {
  const e = ganarEscudos(con({ current_streak: 13 }));
  igual(e.shields_available, 1, "banco");
  igual(e.shields_earned_total, 1, "acumulado histórico");
});

caso("racha de 14 con banco vacío gana 2", () => {
  const e = ganarEscudos(con({ current_streak: 14 }));
  igual(e.shields_available, 2, "banco");
});

caso("racha de 21 con el banco ya en 2 sigue en 2, sin error ni evento de desperdicio", () => {
  // `shields_earned_this_streak: 2` no es decoración del fixture: con D-079 un
  // banco de 2 ganado en ESTA racha implica que el cupo ya se agotó. Un estado
  // con 2 en el banco y 0 en el cupo es imposible de alcanzar por el motor.
  const base = con({
    current_streak: 21,
    shields_available: 2,
    shields_earned_total: 2,
    shields_earned_this_streak: 2,
  });
  const e = ganarEscudos(base);
  igual(e, base, "el mismo objeto: no hay nada que escribir");
  igual(e.shields_available, TOPE_ESCUDOS, "tope");
  igual(e.shields_earned_total, 2, "no se contó un escudo que no se ganó");
});

// ─── D-079: el tope de 2 es POR RACHA, no cada siete días ───────────────────
//
// Los tres casos que siguen son el hueco que la fórmula literal de #203 dejaba
// abierto, y que ninguna prueba anterior podía ver porque `ganarEscudos` medía
// contra el banco disponible: gastar un escudo creaba espacio para otro.

caso("D-079: gastar un escudo NO crea espacio para otro dentro de la misma racha", () => {
  // Racha 21, cupo agotado (2 ganados), y uno gastado salvando un día.
  const gastado = con({
    current_streak: 21,
    shields_available: 1,
    shields_earned_total: 2,
    shields_earned_this_streak: 2,
  });
  const e = ganarEscudos(gastado);
  igual(e.shields_available, 1, "el banco NO se repone: el cupo de esta racha ya se agotó");
  igual(e.shields_earned_total, 2, "no se contó un escudo nuevo");
});

caso("D-079: con la fórmula vieja, la racha 21 habría repuesto el banco a 2", () => {
  // Este caso existe para dejar el hueco por escrito, no para probar el código:
  // `floor(21/7) = 3` capado a 2, comparado contra un banco de 1, daba +1.
  // Es exactamente lo que ya NO pasa.
  const gastado = con({
    current_streak: 21,
    shields_available: 1,
    shields_earned_total: 2,
    shields_earned_this_streak: 2,
  });
  const viejo = Math.min(2, Math.floor(gastado.current_streak / 7));
  igual(viejo > gastado.shields_available, true, "la fórmula vieja SÍ habría repuesto");
  igual(ganarEscudos(gastado).shields_available, 1, "la nueva no");
});

caso("D-079: cuando la racha se rompe y vuelve a 1, el cupo se renueva", () => {
  const agotado = con({
    current_streak: 30,
    max_streak: 30,
    last_completed_local_date: "2026-03-01",
    shields_available: 0,
    shields_earned_total: 2,
    shields_earned_this_streak: 2,
  });
  // Cinco días de hueco y cero escudos: la racha se rompe y vuelve a 1.
  const roto = registrarDia(agotado, "2026-03-07", { tipo: "RETO_COMPLETADO" });
  igual(roto.current_streak, 1, "la racha vuelve a empezar HOY, en 1");
  igual(roto.shields_earned_this_streak, 0, "el cupo de la racha anterior se cierra con ella");
  igual(roto.max_streak, 30, "la mejor marca personal nunca baja");
  // Y en la racha nueva se vuelven a ganar, que es cuando protege de verdad.
  igual(ganarEscudos({ ...roto, current_streak: 14 }).shields_available, 2, "cupo renovado");
});

caso("por debajo de 7 días no hay escudo, y ganarEscudos nunca QUITA uno", () => {
  igual(ganarEscudos(con({ current_streak: 6 })).shields_available, 0, "racha 6");
  const conBanco = con({ current_streak: 1, shields_available: 2, shields_earned_total: 2 });
  igual(ganarEscudos(conBanco).shields_available, 2, "una racha corta no confisca el banco");
});

caso("un día perdido con 1 escudo lo consume y la racha continúa sin interrupción", () => {
  const base = con({
    current_streak: 9,
    max_streak: 9,
    last_completed_local_date: "2026-08-02",
    shields_available: 1,
    shields_earned_total: 1,
  });
  // Falta el 3, vuelve el 4.
  const e = registrarDia(base, "2026-08-04", RETO);
  igual(e.current_streak, 10, "la racha siguió contando");
  igual(e.shields_available, 0, "se consumió el escudo");
  igual(e.shields_earned_total, 1, "el histórico no cambia al gastar");
});

caso("dos días perdidos con 2 escudos los consume los dos y la racha sigue", () => {
  const base = con({
    current_streak: 20,
    max_streak: 20,
    last_completed_local_date: "2026-08-02",
    shields_available: 2,
  });
  const e = registrarDia(base, "2026-08-05", RETO); // faltan el 3 y el 4
  igual(e.current_streak, 21, "racha");
  igual(e.shields_available, 0, "banco");
});

caso("tres días perdidos con 2 escudos NO gastan los escudos: no alcanzaban", () => {
  const base = con({
    current_streak: 20,
    max_streak: 20,
    last_completed_local_date: "2026-08-02",
    shields_available: 2,
  });
  const e = registrarDia(base, "2026-08-06", RETO); // faltan 3, 4 y 5
  igual(e.current_streak, 1, "vuelve a empezar hoy, en 1, nunca en 0");
  igual(e.max_streak, 20, "la mejor marca se queda");
  igual(e.shields_available, 2, "pérdida sobre pérdida, no (mc-17 §5)");
});

// --- Pausa familiar (#204) --------------------------------------------------

caso("una pausa prospectiva congela el hueco entero sin gastar escudos", () => {
  let e = con({
    current_streak: 12,
    max_streak: 12,
    last_completed_local_date: "2026-08-02",
    shields_available: 0,
  });
  e = declararPausa(e, "2026-08-03", "2026-08-16", "2026-08-02"); // 14 días de viaje
  igual(e.pause_uses_this_year, 1, "usos");
  igual(e.pause_year, 2026, "año");

  const f = registrarDia(e, "2026-08-17", RETO);
  igual(f.current_streak, 13, "la racha ni avanzó de más ni se rompió");
  igual(f.shields_available, 0, "no había escudos y no hicieron falta");
});

caso("una pausa de 22 días se rechaza, y el mensaje dice el tope", () => {
  const err = lanza(
    () => declararPausa(ESTADO_INICIAL, "2026-08-01", "2026-08-22", "2026-08-01"),
    String(DIAS_MAXIMOS_DE_PAUSA),
  );
  igual(err.name, "PausaRechazada", "clase");
  igual(err instanceof PausaRechazada, true, "instancia");
  igual(err.motivo, "pausa_demasiado_larga", "motivo");
});

caso("la quinta pausa del año se rechaza; el contador se reinicia en enero", () => {
  let e = ESTADO_INICIAL;
  for (let i = 0; i < PAUSAS_POR_ANIO; i++) {
    e = declararPausa(e, `2026-0${i + 2}-01`, `2026-0${i + 2}-10`, `2026-0${i + 2}-01`);
  }
  igual(e.pause_uses_this_year, PAUSAS_POR_ANIO, "cuatro usadas");
  lanza(() => declararPausa(e, "2026-07-01", "2026-07-10", "2026-07-01"), "2026");

  // Año nuevo: el mismo estado vuelve a admitir pausas.
  const f = declararPausa(e, "2027-01-05", "2027-01-10", "2027-01-05");
  igual(f.pause_uses_this_year, 1, "el contador se reinició solo");
  igual(f.pause_year, 2027, "año");
});

caso("la reparación retroactiva se acepta al quinto día y se rechaza al sexto", () => {
  const base = con({
    current_streak: 30,
    max_streak: 30,
    last_completed_local_date: "2026-08-01",
  });
  // Quinto día después del último cumplido: entra.
  const ok = declararPausa(base, "2026-08-02", "2026-08-05", "2026-08-06");
  igual(ok.pause_until_local_date, "2026-08-05", "hasta");

  // Sexto: fuera de la ventana.
  const err = lanza(
    () => declararPausa(base, "2026-08-02", "2026-08-06", "2026-08-07"),
    String(VENTANA_DE_REPARACION),
  );
  igual(err.motivo, "fuera_de_la_ventana", "motivo");
});

caso("una pausa que termina antes de empezar se rechaza", () => {
  const err = lanza(
    () => declararPausa(ESTADO_INICIAL, "2026-08-10", "2026-08-01", "2026-08-01"),
    "termina antes de empezar",
  );
  igual(err.motivo, "rango_invertido", "motivo");
});

caso("declarar una pausa más corta no acorta la que ya estaba vigente", () => {
  let e = declararPausa(ESTADO_INICIAL, "2026-08-01", "2026-08-20", "2026-08-01");
  e = declararPausa(e, "2026-08-01", "2026-08-05", "2026-08-01");
  igual(e.pause_until_local_date, "2026-08-20", "se respeta la más larga");
});

caso("una pausa vieja no perdona los días de después", () => {
  const base = con({
    current_streak: 5,
    max_streak: 5,
    last_completed_local_date: "2026-08-02",
    pause_until_local_date: "2026-07-15",
    pause_uses_this_year: 1,
    pause_year: 2026,
  });
  const e = registrarDia(base, "2026-08-10", RETO);
  igual(e.current_streak, 1, "la pausa de julio no cubre agosto");
});

// --- Lo que NO se puede vender (línea roja #6, D-014) -----------------------

caso("ninguna función del motor acepta un precio: las firmas se leen y se cuentan", () => {
  // Es un control de forma, no de comportamiento: si mañana alguien agrega un
  // quinto parámetro a `ganarEscudos`, esto lo dice antes que el auditor.
  igual(ganarEscudos.length, 1, "ganarEscudos recibe SOLO el estado");
  igual(registrarDia.length, 3, "registrarDia: estado, día, motivo");
  igual(declararPausa.length, 4, "declararPausa: estado, desde, hasta, hoy");
});

// --- El acumulado de días jugados: el sendero de KINDER (#205, mc-43 §6) -----

caso("un día jugado suma un paso al acumulado, con cualquiera de los dos motivos", () => {
  // La línea roja #6 sobre la columna nueva: el día cumplido por corte de
  // límite de pantalla ES un día jugado, y suma su paso igual que el reto
  // completado. Si aquí hubiera una rama por motivo, éste es el caso que la
  // caza.
  const porReto = registrarDia(ESTADO_INICIAL, "2026-08-01", RETO);
  const porLimite = registrarDia(ESTADO_INICIAL, "2026-08-01", LIMITE);
  igual(porReto.days_played_total, 1, "reto completado");
  igual(porLimite.days_played_total, 1, "corte de límite de pantalla");
  igual(JSON.stringify(porReto), JSON.stringify(porLimite), "el motivo no entra en la aritmética");
});

caso("el acumulado NO baja cuando la racha se reinicia: el sendero no retrocede", () => {
  // Diez días seguidos, un hueco sin escudos que rompe la racha, y se vuelve.
  // `current_streak` cae a 1; el acumulado sigue subiendo. Es `mc-43` §6
  // escrito como caso: la racha perdida jamás borra ni hace retroceder el
  // mapa.
  let e = correrDias(ESTADO_INICIAL, "2026-08-01", 10);
  igual(e.days_played_total, 10, "diez días, diez pasos");
  e = registrarDia(e, "2026-08-15", RETO); // hueco del 11 al 14, sin escudos
  igual(e.current_streak, 1, "la racha volvió a 1");
  igual(e.days_played_total, 11, "el sendero NO retrocedió: once pasos");
  e = registrarDia(e, "2026-08-16", RETO);
  igual(e.days_played_total, 12, "y sigue caminando desde donde estaba");
});

caso("un día repetido no suma dos pasos, y uno viejo entregado tarde tampoco", () => {
  // Idempotencia sobre la columna nueva: la comparación por referencia que ya
  // decide la escritura en D1 decide también el paso. Diez ítems en una tarde
  // son UN paso, no diez.
  let e = registrarDia(ESTADO_INICIAL, "2026-08-01", RETO);
  const repetido = registrarDia(e, "2026-08-01", RETO);
  igual(repetido, e, "el mismo día devuelve el mismo objeto");
  igual(repetido.days_played_total, 1, "un paso, no dos");

  // La cola offline entrega el martes después del miércoles (#209): no suma.
  e = registrarDia(e, "2026-08-03", RETO);
  const tardio = registrarDia(e, "2026-08-02", RETO);
  igual(tardio.days_played_total, 2, "el día viejo no suma paso");
});

caso("un día cubierto por escudo NO suma paso, y el sendero no se detiene", () => {
  // «Un paso por día JUGADO»: el día que el escudo cubre, el niño no jugó, así
  // que no hay paso nuevo. Pero el sendero no se detiene ni retrocede: el
  // acumulado se queda donde estaba y el siguiente día jugado suma desde ahí.
  //
  // El estado se arma a mano porque ganar un escudo exige racha de 7 (D-079):
  // dos días jugados y un escudo ya en el banco.
  let e = con({
    current_streak: 2,
    max_streak: 2,
    last_completed_local_date: "2026-08-02",
    shields_available: 1,
    shields_earned_total: 1,
    shields_earned_this_streak: 1,
    days_played_total: 2,
  });
  e = registrarDia(e, "2026-08-04", RETO); // el 3 lo cubre el escudo
  igual(e.current_streak, 3, "la racha siguió gracias al escudo");
  igual(e.shields_available, 0, "el escudo se gastó");
  igual(e.days_played_total, 3, "tres días JUGADOS: el del escudo no cuenta");
});

caso("una pausa familiar tampoco fabrica pasos", () => {
  let e = declararPausa(ESTADO_INICIAL, "2026-08-02", "2026-08-05", "2026-08-01");
  igual(e.days_played_total, 0, "declarar la pausa no juega ningún día");
  e = registrarDia(e, "2026-08-01", RETO);
  e = registrarDia(e, "2026-08-06", RETO); // la pausa cubrió el hueco entero
  igual(e.current_streak, 2, "la racha ni avanzó ni se rompió por la pausa");
  igual(e.days_played_total, 2, "dos días jugados, dos pasos");
});

console.log(`\n${corridos - fallos}/${corridos} casos pasaron\n`);
if (fallos > 0) process.exit(1);
