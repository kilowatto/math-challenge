#!/usr/bin/env node
// Auditor determinista — nunca se penaliza borrar ni corregir
//
// Hace cumplir: línea roja #8, D-020, `mc-30`.
//
// Por qué existe. La línea roja dice: *"Nunca se penaliza borrar o corregir una
// respuesta. Cambiar una respuesta mejora la calificación el 79% de las veces
// (`mc-30`)."*
//
// Ese 79% es lo que hace que esta regla no sea una preferencia. La intuición del
// diseñador —«si borra mucho es que está adivinando»— apunta al revés de la
// evidencia: la mayoría de las veces que un alumno cambia su respuesta, la
// mejora. Un producto que penaliza el borrado le enseña al niño a no revisar su
// trabajo, que es lo contrario de lo que un producto de matemáticas debería
// enseñar.
//
// El riesgo real no es que alguien escriba `puntaje -= borrados` a propósito.
// Es que llegue por la puerta de atrás: un "índice de confianza" que baja con
// las correcciones, una racha que se rompe al deshacer, un multiplicador que
// premia contestar a la primera. Los tres son lo mismo con otro nombre.
//
// LO QUE NO PUEDE COMPROBAR: que la señal de borrado no se use en un modelo que
// vive fuera del repo. D-020 permite GUARDAR la señal derivada — lo prohibido es
// que toque el puntaje. Un modelo entrenado en otra parte con esa señal está
// fuera del alcance del análisis estático.

import { archivos, leer, informar, SOLO_PRODUCTO } from "./lib/repo.mjs";

/**
 * Nombres que representan «cuántas veces cambió de opinión».
 *
 * Se listan con sus variantes en los dos idiomas del código porque el que añada
 * `correcciones` no va a leer la lista que dice `erases`.
 */
const SENAL_DE_BORRADO =
  /\b(borrad[oa]s?|erase[sd]?|erasures?|deletions?|undos?|deshacer|correccion(es)?|corrections?|changed_?answers?|respuestas_?cambiadas|rework|reintentos_?en_?el_?mismo|backspace(s|_count)?)\b/i;

/**
 * Lo que un puntaje hace: sumar, restar, multiplicar, castigar.
 *
 * `penalt` y `castig` van aparte porque nombrar la penalización es la forma más
 * clara de violar la regla y la más fácil de atrapar.
 */
const OPERACION_DE_PUNTAJE =
  /(score|scoring|puntaje|puntos|points|puntu\w*|rating|calific\w*|grade|mark|acc\b|streak|racha|confianza|confidence|multiplier|multiplicador)/i;

const PENALIZA_EXPLICITO = /\b(penal(ty|iza|izar|ize|idad)|castig|deduct|descuent|malus)\w*/i;

/**
 * Aritmética SOBRE el conteo de borrados.
 *
 * Esto solo basta por sí mismo, sin que la línea nombre el puntaje. La primera
 * versión exigía las dos cosas y dejó pasar su propio caso de prueba:
 *
 *     return 1 - borrados * 0.1;
 *
 * que es literalmente la penalización, en una línea que no dice "puntaje" en
 * ninguna parte. Restar o multiplicar por cuántas veces alguien cambió de
 * opinión no tiene otro uso: el número no sirve para nada más.
 */
const ARITMETICA_SOBRE_BORRADO =
  /[-−*]\s*[\w.]*\s*\b(borrad[oa]s?|erase[sd]?|erasures?|deletions?|undos?|correccion(es)?|corrections?|changed_?answers?|backspaces?)\b/i;

// Solo el producto. La primera corrida marcó una cadena de prosa en
// scripts/detallar-proyecto.mjs que DESCRIBE la regla, y bloqueó el commit por
// citar la línea roja que hace cumplir. Ver SOLO_PRODUCTO en lib/repo.mjs.
const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs|astro|svelte|vue|sql)$/).filter((f) => SOLO_PRODUCTO.test(f));
const problemas = [];
const notas = [];
let conSenal = 0;

for (const archivo of fuentes) {
  const texto = leer(archivo) ?? "";
  const lineas = texto.split("\n");

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];

    // Los comentarios explican la regla; citarla no es violarla. Este mismo
    // archivo y `decisions.md` estarían en rojo permanente sin esto.
    //
    // El comentario de SQL empieza con `--`, y quitar solo los de JavaScript
    // dejaba pasar `-- Borrado suave…` como si fuera una resta sobre el conteo
    // de borrados. El auditor bloqueó una migración por su propio comentario.
    const esSql = archivo.endsWith(".sql");
    const soloCodigo = (esSql ? linea.replace(/--.*$/, "") : linea.replace(/\/\/.*$/, ""))
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\*.*$/, "");
    if (!soloCodigo.trim()) continue;

    const hayBorrado = SENAL_DE_BORRADO.test(soloCodigo);
    if (!hayBorrado) continue;

    // La señal derivada PUEDE existir y guardarse: D-020 lo permite. Lo que no
    // puede es tocar el puntaje.
    const tocaPuntaje = OPERACION_DE_PUNTAJE.test(soloCodigo);
    const penaliza = PENALIZA_EXPLICITO.test(soloCodigo);
    const aritmetica = ARITMETICA_SOBRE_BORRADO.test(soloCodigo);
    // `(1 - x)` es sospechoso solo si la línea además habla de puntaje; suelto
    // aparece en mil sitios legítimos.
    const factor = tocaPuntaje && /\(\s*1\s*[-−]/.test(soloCodigo);

    if (!tocaPuntaje && !penaliza && !aritmetica) {
      conSenal++;
      continue;
    }

    if (penaliza || aritmetica || factor) {
      problemas.push(
        `${archivo}:${i + 1}: el puntaje cambia con la señal de borrado — ` +
          `\`${soloCodigo.trim().slice(0, 90)}\`. ` +
          "Línea roja #8: nunca se penaliza borrar ni corregir. Cambiar una respuesta " +
          "MEJORA la calificación el 79% de las veces (mc-30); penalizarlo enseña a no revisar.",
      );
    } else {
      // Coincide señal + puntaje pero sin forma de penalización visible. Se
      // reporta como nota, no como bloqueo: bloquear aquí sería adivinar.
      notas.push(`${archivo}:${i + 1} menciona borrado y puntaje juntos — revisado, no penaliza`);
      conSenal++;
    }
  }
}

if (conSenal > 0) notas.unshift(`${conSenal} uso(s) de la señal de borrado, ninguno tocando el puntaje (D-020 la permite guardar)`);
else notas.unshift("ningún uso de la señal de borrado en el código — nada que penalizar todavía");

informar({
  nombre: "sin-penalizacion",
  problemas,
  notas: notas.slice(0, 6),
  cita: "línea roja #8, D-020, mc-30",
  revisados: fuentes.length,
  resumen: `${fuentes.length} archivo(s) de código`,
  porQueBloquea:
    "penalizar el borrado le enseña al niño a no revisar su trabajo, y va contra la " +
    "medición: el 79% de los cambios de respuesta mejoran la calificación (mc-30).",
  noComprueba: [
    "que la señal de borrado no alimente un modelo fuera del repo. D-020 permite " +
      "guardarla; lo prohibido es que toque el puntaje.",
  ],
});
