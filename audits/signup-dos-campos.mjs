#!/usr/bin/env node
// Auditor determinista — el registro son dos campos, y el resto llega después
//
// Hace cumplir: D-026, D-038, `mc-45` (onboarding y activación).
//
// Por qué existe. D-026 se llama, literalmente, «Registro de 2 campos y
// onboarding contextual». La decisión ya está tomada; lo que se rompe es su
// cumplimiento, y se rompe siempre igual: alguien necesita un dato —el país para
// el impuesto, el nombre para el correo de bienvenida, la edad del hijo para la
// banda— y lo añade al formulario porque «ya que está aquí». Cada campo añadido
// tiene una justificación razonable y ninguna es tan cara como el campo.
//
// D-038 empuja en la misma dirección: passkey primero. Con passkey el registro
// puede ser un campo y un gesto biométrico del ADULTO — que no es la biometría
// que prohíbe la línea roja #1, porque no la ve ni la guarda este producto: la
// resuelve el sistema operativo y aquí solo llega una firma.
//
// LO QUE NO PUEDE COMPROBAR: si un campo es realmente necesario. Este auditor
// cuenta, no juzga. Un tercer campo se puede justificar por escrito en D-026 —
// lo que no puede es aparecer sin que nadie lo note.

import { archivos, leer, informar, SOLO_PRODUCTO } from "./lib/repo.mjs";

/** Las pantallas donde nace una cuenta. */
const ES_REGISTRO = /(signup|sign-up|registro|register|crear-?cuenta|create-?account|onboarding|alta)/i;

/**
 * Campos que no cuentan para el límite.
 *
 * Un botón no es un campo, y un `hidden` con el token CSRF tampoco. Contarlos
 * daría una cifra alta y falsa, y un auditor con una cifra falsa se apaga.
 */
const NO_ES_CAMPO = /type\s*=\s*["'`]?(hidden|submit|button|image|reset)/i;

const MAXIMO = 2;

const fuentes = archivos(/\.(astro|tsx|jsx|svelte|vue|html)$/).filter((f) => SOLO_PRODUCTO.test(f));
const problemas = [];
const notas = [];
let pantallas = 0;

for (const archivo of fuentes) {
  if (!ES_REGISTRO.test(archivo)) continue;
  pantallas++;

  const texto = leer(archivo) ?? "";

  // Cada `<input>`, `<select>` o `<textarea>` visible es un campo.
  const etiquetas = [...texto.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)];
  const visibles = etiquetas.filter(([, , attrs]) => !NO_ES_CAMPO.test(attrs));

  // Los nombres distintos, no las etiquetas: un grupo de radios con el mismo
  // `name` es UN campo, y contarlos por separado inflaría el número.
  const nombres = new Set(
    visibles
      .map(([, , attrs]) => attrs.match(/name\s*=\s*["'`]?([\w-]+)/i)?.[1])
      .filter(Boolean),
  );
  const cuenta = nombres.size || visibles.length;

  if (cuenta > MAXIMO) {
    problemas.push(
      `${archivo}: ${cuenta} campos en el registro (${[...nombres].join(", ")}). ` +
        `D-026 fija ${MAXIMO}: el resto se pide en contexto, cuando hace falta y se puede explicar ` +
        "por qué. Cada campo añadido tiene una justificación razonable, y ninguna cuesta tan " +
        "caro como el campo (mc-45).",
    );
  } else if (cuenta > 0) {
    notas.push(`${archivo}: ${cuenta} campo(s) — ${[...nombres].join(", ")}`);
  }

  // Una superficie de niño no registra a nadie: el niño es un perfil dentro de
  // la cuenta del padre (línea roja #2).
  if (/child|nino|kinder|primaria/i.test(archivo) && visibles.length > 0) {
    problemas.push(
      `${archivo}: formulario de registro en una superficie de niño. ` +
        "Línea roja #2 y D-012: el niño nunca es un usuario, es un perfil dentro de la " +
        "cuenta del padre.",
    );
  }
}

notas.unshift(
  pantallas > 0
    ? `${pantallas} pantalla(s) de registro revisadas`
    : "todavía no hay pantalla de registro; el auditor está listo para la primera (F2)",
);
notas.push("D-038: con passkey el registro puede ser un campo y un gesto del ADULTO, resuelto por el sistema operativo");

informar({
  nombre: "signup-dos-campos",
  problemas,
  notas: notas.slice(0, 6),
  cita: "D-026, D-038, D-012, línea roja #2, mc-45",
  revisados: fuentes.length,
  resumen: `${fuentes.length} archivo(s) de interfaz, ${pantallas} de registro`,
  porQueBloquea:
    "cada campo del registro cuesta activación medible, y ninguno se quita después: " +
    "quitar un campo pide una decisión, añadirlo no pide nada (mc-45).",
  noComprueba: [
    "si un campo es realmente necesario. Este auditor cuenta, no juzga — un tercero " +
      "se puede justificar por escrito en D-026, pero no aparecer sin que nadie lo note.",
  ],
});
