/**
 * preferencia-musica.ts — el interruptor de MÚSICA, separado del de voz (D-198).
 *
 * `preferencia-voz.ts` ya existía para la voz/sonido de interfaz. El dueño,
 * al confirmar el alcance de la música de fondo, pidió explícito "dos
 * controles separados" en vez de uno solo: un niño (o el padre) puede querer
 * la música apagada sin perder el enunciado hablado, o viceversa. Mismo
 * patrón exacto que `preferencia-voz.ts`, clave de localStorage propia para
 * que las dos preferencias vivan y fallen de forma independiente.
 */
const CLAVE = "mc:musica";

export function leerMusicaActivada(): boolean {
  try {
    return localStorage.getItem(CLAVE) !== "0";
  } catch {
    // Safari en privado lanza al leer/escribir. Sin memoria, pero con música.
    return true;
  }
}

export function escribirMusicaActivada(activada: boolean): void {
  try {
    localStorage.setItem(CLAVE, activada ? "1" : "0");
  } catch {
    // El ajuste dura lo que la pantalla — no es un error que enseñar.
  }
}
