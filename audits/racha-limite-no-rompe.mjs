#!/usr/bin/env node
// Auditor determinista — el límite de pantalla nunca rompe la racha
//
// Hace cumplir: línea roja #6, D-014 (textual), D-016, #202.
//
// ─── Por qué existe ───────────────────────────────────────────────────────
//
// D-014 lo dice con estas palabras: «si el límite de pantalla corta la sesión,
// **la racha del día se da por cumplida**», y explica por qué en una frase que
// no es técnica: *«castigar a un niño por respetar un límite sano lo pone en
// contra de su padre»*. El master-plan §15 lo instrumenta como KPI: una racha
// rota por el límite **es un defecto**, no un caso de uso.
//
// Este es el fallo que ninguna prueba de humo encuentra. No hay error 500, no
// hay pantalla en blanco: hay un número que amaneció en 1 y un niño que no sabe
// por qué. Se descubre semanas después, por un padre.
//
// ─── Cómo comprueba, y por qué de dos formas independientes ───────────────
//
// D-070: si la comprobación mira el mismo lugar que produce el valor, es
// decorativa. Aquí hay dos ejes que no comparten fuente.
//
//   · DINÁMICO — **ejecuta** `registrarDia()` sobre un barrido de 1 620 estados
//     (racha × banco de escudos × pausa vigente × día que llega) y exige que el
//     motivo `LIMITE_DE_PANTALLA_CORTO_LA_SESION` produzca un estado **idéntico**
//     al de `RETO_COMPLETADO`. No es que se «trate bien» al límite: es que el
//     motivo no puede entrar en la aritmética. Cualquier rama que lo distinga
//     aparece aquí, incluida una que lo distinga a favor.
//   · ESTÁTICO — busca en TODO el repositorio el vocabulario del corte de
//     pantalla cerca de una escritura que reinicie la racha o descuente un
//     escudo. Es el eje que cubre lo que el motor no puede: una ruta de API que
//     decida, por su cuenta, no llamar a `registrarDia` cuando el corte fue del
//     límite. El motor puede ser perfecto y la racha romperse igual porque
//     nadie lo llamó.
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Que la ruta de cierre de sesión llame a `registrarDia` **siempre**. Ver
//    arriba: aquí se caza el reinicio explícito, no la omisión silenciosa. Esa
//    la cierra el KPI de Analytics Engine de #202 (sesiones con corte por límite
//    donde la racha no avanzó — debe ser 0 por construcción) y `funcion-sin-llamar`.
//  · Si el límite de pantalla en sí está bien puesto. Eso es D-016 y F8.

import { archivos, leer, informar, sinComentarios, palabra, existe } from "./lib/repo.mjs";
import { ESTADO_INICIAL, registrarDia } from "../packages/motor/src/racha.ts";

const MOTOR = "packages/motor/src/racha.ts";
const MOTIVO_LIMITE = "LIMITE_DE_PANTALLA_CORTO_LA_SESION";

const problemas = [];
const notas = [];
let revisados = 0;

// ─── 1. Dinámico: el motivo no entra en la aritmética ────────────────────────

if (!existe(MOTOR)) {
  problemas.push(
    `${MOTOR} no existe. Este auditor lo ejecuta, así que sin él no comprueba nada.`,
  );
} else {
  revisados++;
  const RETO = { tipo: "RETO_COMPLETADO" };
  const LIMITE = { tipo: MOTIVO_LIMITE };

  const rachas = [0, 1, 2, 6, 7, 13, 14, 40, 365];
  const bancos = [0, 1, 2];
  const pausas = [null, "2026-08-01", "2026-08-05", "2026-08-31", "2027-01-01"];
  const dias = [
    "2026-08-02", // el mismo día que el último cumplido: idempotencia
    "2026-08-03", // consecutivo
    "2026-08-04", // un día perdido
    "2026-08-05", // dos días perdidos
    "2026-08-06", // tres: más de los escudos que caben
    "2026-08-20", // dos semanas
    "2026-09-30", // dos meses
    "2027-02-01", // cruzando el año
    "2026-08-01", // ANTERIOR al último cumplido: llegada fuera de orden
    "2026-07-01", // muy anterior
    "2026-08-07", // cuatro perdidos
    "2026-08-10", // una semana
  ];

  let combinaciones = 0;
  let rotas = 0;

  for (const current_streak of rachas) {
    for (const shields_available of bancos) {
      for (const pause_until_local_date of pausas) {
        for (const dia of dias) {
          const base = {
            ...ESTADO_INICIAL,
            current_streak,
            max_streak: current_streak,
            last_completed_local_date: "2026-08-02",
            shields_available,
            shields_earned_total: shields_available,
            pause_until_local_date,
            pause_uses_this_year: pause_until_local_date === null ? 0 : 1,
            pause_year: pause_until_local_date === null ? null : 2026,
          };
          combinaciones++;

          const conReto = JSON.stringify(registrarDia(base, dia, RETO));
          const conLimite = JSON.stringify(registrarDia(base, dia, LIMITE));
          if (conReto !== conLimite && rotas++ < 3) {
            problemas.push(
              `${MOTOR}: el motivo ENTRA en la aritmética. Con racha ${current_streak}, ` +
                `${shields_available} escudo(s), pausa ${pause_until_local_date} y el día ${dia}, ` +
                `el límite de pantalla dio ${conLimite} y el reto completado dio ${conReto}. ` +
                "D-014, textual: «si el límite de pantalla corta la sesión, la racha del día se " +
                "da por cumplida». Los dos motivos tienen que producir el MISMO estado — una " +
                "rama que los distinga es una rama que se puede escribir mal.",
            );
          }

          // Y la garantía dura por separado, por si algún día los dos caminos
          // se rompieran a la vez: un día consecutivo con motivo de límite
          // nunca puede bajar la racha ni descontar un escudo.
          if (dia === "2026-08-03") {
            const d = registrarDia(base, dia, LIMITE);
            if (d.current_streak < current_streak) {
              problemas.push(
                `${MOTOR}: un día consecutivo cortado por el límite BAJÓ la racha de ` +
                  `${current_streak} a ${d.current_streak}. Línea roja #6.`,
              );
            }
            if (d.shields_available < shields_available) {
              problemas.push(
                `${MOTOR}: un día consecutivo cortado por el límite consumió un escudo ` +
                  `(${shields_available} → ${d.shields_available}). #202: ningún escudo se ` +
                  "consume ni se descuenta cuando el motivo es el límite de pantalla; los " +
                  "escudos son un recurso para otra causa.",
              );
            }
          }
        }
      }
    }
  }
  notas.push(`ejecutado: ${combinaciones} estados, límite ≡ reto completado en todos`);
}

// ─── 2. Estático: nadie reinicia la racha por el corte, en ningún archivo ────

/** El vocabulario con el que llega el corte de pantalla a cualquier archivo. */
const CORTE = palabra(
  "LIMITE_DE_PANTALLA_CORTO_LA_SESION", "cortadaPorLimite", "cortada_por_limite",
  "screen_?time", "screentime", "screen_?limit", "limite_?de_?pantalla",
  "tiempoDePantalla", "cerrarPorLimite", "puntoSeguroDeCorte",
);

/** Una escritura que deshace la racha o el banco de escudos. */
const DESHACE =
  /(current_streak|racha_?actual|rachaActual|shields_available|escudos_?disponibles)\s*(?:[:=]\s*0\b|=\s*1\b|--|-=|\s*=\s*[^=\n]*-\s*1)/;

/**
 * El corte, pero DECIDIENDO algo.
 *
 * Sin esto el auditor se marca a sí mismo: la declaración del tipo
 * `MotivoDelDia` nombra el corte, y ocho líneas más abajo `ESTADO_INICIAL`
 * escribe `current_streak: 0` — que es un valor inicial, no un castigo. Un
 * auditor que bloquea por DECLARAR el motivo que existe para proteger la racha
 * se anula por costumbre a la semana, y entonces ya no guarda nada.
 *
 * Lo que sí importa es el corte usado como CONDICIÓN: «si fue el límite,
 * entonces…». Eso es lo que puede terminar en un reinicio.
 */
const DECIDE = /(?:if\s*\(|\belse\b|switch\s*\(|\bcase\s+|[!=]==|&&|\|\||\?\s|\?\.)/;

const RADIO = 8;

for (const archivo of archivos(/\.(ts|tsx|js|jsx|mjs|astro)$/).filter((f) =>
  /^(apps|packages|workers)\//.test(f),
)) {
  const texto = sinComentarios(leer(archivo) ?? "");
  revisados++;
  if (!CORTE.test(texto)) continue;

  const lineas = texto.split("\n");
  for (let i = 0; i < lineas.length; i++) {
    if (!CORTE.test(lineas[i]) || !DECIDE.test(lineas[i])) continue;
    for (let j = Math.max(0, i - RADIO); j <= Math.min(lineas.length - 1, i + RADIO); j++) {
      if (!DESHACE.test(lineas[j])) continue;
      problemas.push(
        `${archivo}:${j + 1}: el corte de pantalla (línea ${i + 1}) está a ${Math.abs(j - i)} ` +
          `línea(s) de algo que reinicia la racha o descuenta un escudo — ` +
          `\`${lineas[j].trim().slice(0, 80)}\`. D-014, textual: «si el límite de pantalla corta ` +
          "la sesión, la racha del día se da por cumplida». Castigar a un niño por respetar un " +
          "límite sano lo pone en contra de su padre, y el master-plan §15 cuenta esa racha rota " +
          "como un defecto, no como un caso de uso.",
      );
      break;
    }
  }
}

notas.push(`vecindad de ±${RADIO} líneas entre el corte de pantalla y un reinicio de racha`);
notas.push("D-014: «si el límite de pantalla corta la sesión, la racha del día se da por cumplida»");

informar({
  nombre: "racha-limite-no-rompe",
  problemas,
  notas,
  cita: "línea roja #6, D-014, D-016, #202, master-plan §15",
  revisados,
  resumen: `${revisados} archivo(s), y el motor ejecutado sobre 1 620 estados`,
  porQueBloquea:
    "una racha rota por el límite de pantalla es el único defecto de este subsistema que " +
    "pone al producto en contra del padre que puso el límite (D-014).",
  noComprueba: [
    "que la ruta de cierre llame a `registrarDia` SIEMPRE. Aquí se caza el reinicio explícito, " +
      "no la omisión silenciosa: esa la cierra el KPI agregado de #202 y `funcion-sin-llamar`.",
    "si el límite de pantalla en sí está bien puesto. Eso es D-016 y F8.",
  ],
});
