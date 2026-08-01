/**
 * De la edad al tema visual. Criterio #114 de F2 · D-002, D-017, D-053.
 *
 * ─── La edad y la dificultad son ejes SEPARADOS ────────────────────────────
 *
 * Esto es D-002 y es lo que más fácil se rompe al implementarlo. La edad decide
 * **cómo se ve** el producto —tamaños, tipografía, densidad, si hay cronómetro
 * visible— y **no decide dónde empieza el niño**. Un niño de siete años puede
 * estar en el nivel 2 y otro de siete en el nivel 5; los dos ven PRIMARIA.
 *
 * Mezclarlos produce el error que `mc-15` documenta: las fracciones se
 * introducen entre los 6 y los 9 años **según el país**, así que atar el
 * contenido a la edad exporta el currículo de un país a los otros seis.
 *
 * ─── Y por eso la banda se puede MOVER ─────────────────────────────────────
 *
 * El criterio dice que `theme_band` «se muestra ya elegida, movible dentro de un
 * rango». Se deriva del año de nacimiento y se le enseña al adulto ya puesta —
 * un campo menos que llenar— pero él manda: un niño de seis años que lee bien
 * puede querer PRIMARIA, y uno de ocho con dificultades puede estar mejor en
 * KINDER. Lo que el adulto **no** puede es saltar tres bandas, porque entonces
 * no está ajustando el tema visual: está eligiendo un producto distinto.
 *
 * ─── Solo el AÑO ───────────────────────────────────────────────────────────
 *
 * D-053: del niño se pide el año de nacimiento y nada más. El mes no alimenta
 * ninguna decisión del producto, y es 12 veces más precisión sobre la identidad
 * de un menor de la que hace falta. La edad se calcula como `año actual − año de
 * nacimiento`, que puede errar por uno según el mes — y eso da igual, porque la
 * banda es movible y cubre rangos de tres a cinco años.
 */

import { NIVELES_POR_BANDA, type Banda } from "./puntuacion.ts";

/**
 * El tema visual es una BANDA, no un tipo paralelo.
 *
 * `audits/tabla-bandas.mjs` bloqueó la primera versión de este archivo por
 * declarar su propia tabla, y tenía razón: dos tablas de niveles divergentes no
 * producen un error, producen «un niño colocado en N4 por el servidor al que la
 * interfaz le enseña Nivel 3». Así que aquí no se declara ninguna — se importa
 * la única que hay.
 *
 * Se excluye `JR` porque D-017 lista CINCO temas visuales y `JR` no es uno: JR y
 * PRO comparten N11-N12 y comparten pantalla. Es un alias de dificultad, no un
 * tema.
 */
export type TemaVisual = Exclude<Banda, "JR">;

/** El orden, que es el que define «una banda de distancia». */
export const ORDEN_TEMAS: TemaVisual[] = ["KINDER", "PRIMARIA", "SECUNDARIA", "SERIO", "PRO"];

/**
 * Edad → tema. **Es lo único que este archivo declara**, y no está en ninguna
 * otra parte: `puntuacion.ts` mapea banda → NIVELES, que es un eje distinto.
 * D-002 dice que la edad y la dificultad son ejes separados; esta tabla es el
 * primer eje y `NIVELES_POR_BANDA` es el segundo.
 *
 * `max` es inclusivo. Los huecos no existen: cada edad cae en exactamente una
 * fila, y por encima de 17 cae en SERIO — un adulto que aprende para sí mismo
 * es de primera clase (D-034), no un caso raro.
 */
const EDADES: Array<{ tema: TemaVisual; min: number; max: number }> = [
  { tema: "KINDER", min: 0, max: 6 },
  { tema: "PRIMARIA", min: 7, max: 11 },
  { tema: "SECUNDARIA", min: 12, max: 17 },
  { tema: "SERIO", min: 18, max: 200 },
];

/**
 * La edad, del año de nacimiento y el año actual.
 *
 * Puede errar por uno según el mes, y es a propósito: D-053 no pide el mes. La
 * banda cubre rangos de tres a cinco años y es movible, así que un año de error
 * no cambia nada que importe.
 */
export function edadDesdeAnio(anioNacimiento: number, anioActual: number): number {
  return anioActual - anioNacimiento;
}

/** El tema que le toca a una edad. Nunca devuelve `null`: la tabla no tiene huecos. */
export function temaPorEdad(edad: number): TemaVisual {
  const fila = EDADES.find((f) => edad >= f.min && edad <= f.max);
  // PRO no sale de la edad: es una elección del adulto (Jr / profesional), no
  // algo que se derive de cuándo nació. Por eso la tabla acaba en SERIO.
  return fila?.tema ?? "SERIO";
}

/**
 * Hasta dónde puede mover el adulto la banda derivada.
 *
 * **Una banda arriba o una abajo, nunca más.** Con dos de margen, un niño de
 * cuatro años podría acabar en SECUNDARIA — y ahí no hay audio en cada
 * instrucción, que es lo que `mc-20` dice que un niño que no lee necesita para
 * poder usar el producto.
 */
export const MARGEN = 1;

export function temasPermitidos(derivado: TemaVisual): TemaVisual[] {
  const i = ORDEN_TEMAS.indexOf(derivado);
  return ORDEN_TEMAS.slice(Math.max(0, i - MARGEN), i + MARGEN + 1);
}

export function temaPermitido(derivado: TemaVisual, elegido: TemaVisual): boolean {
  return temasPermitidos(derivado).includes(elegido);
}

/**
 * El rango de años que se ofrece en el `<select>` de la puerta del padre.
 *
 * De 3 a 17 años cumplidos. Arriba: a los 18 la persona ya no es un perfil
 * dentro de la cuenta de otro, es un adulto con su propia cuenta (D-034). Abajo:
 * el producto empieza a los 4 y se deja un año de margen porque un padre puede
 * estar creando el perfil unos meses antes del cumpleaños.
 *
 * Se devuelve del más reciente al más antiguo: el caso común es un niño pequeño,
 * y ponerlo primero ahorra desplazamiento en un teléfono.
 */
export function aniosOfrecidos(anioActual: number): number[] {
  const anios: number[] = [];
  for (let edad = 3; edad <= 17; edad++) anios.push(anioActual - edad);
  return anios;
}

/**
 * Los niveles de un tema, para poder explicarle al adulto qué va a ver.
 *
 * **Reenvía a `NIVELES_POR_BANDA` y no copia nada.** Publicarlo aquí evita que
 * alguien escriba «N3-N6» a mano en siete idiomas; copiarlo aquí sería la
 * divergencia que `tabla-bandas` bloquea.
 *
 * **No se usan para colocar al niño** — eso lo hace el motor adaptativo (D-002,
 * `mc-44`). Son para la frase que lee el padre.
 */
export function nivelesDe(tema: TemaVisual): { min: number; max: number } {
  return NIVELES_POR_BANDA[tema];
}
