/**
 * preferencia-voz.ts — el interruptor de voz/sonido, en un solo lugar (D-190).
 *
 * `RetoController.ts` ya tenía esta lógica, privada e inline
 * (`VOZ_CLAVE = "mc:voz"`, leída en el constructor y escrita en
 * `alternarVoz()`). El ícono de sonido de `MenuScene`/`MapScene` necesita
 * leer y escribir la MISMA preferencia sin tener una instancia de
 * `RetoController` a la mano — extraerla aquí es lo que evita que la clave
 * de localStorage quede duplicada en dos archivos y algún día diverja.
 *
 * `CapacidadesDeVoz.silenciado` (`packages/tutor/src/voz.ts`) es el booleano
 * INVERSO de `vozActivada` — este módulo expone el sentido "activada" porque
 * es como ya lo piensa `RetoController`/`AccessibleReto` (`vozActivada`,
 * `vozDesactivada` en los rótulos); quien construya `CapacidadesDeVoz` para
 * el motor de voz lo niega en la frontera, no aquí.
 */
const CLAVE = "mc:voz";

export function leerVozActivada(): boolean {
  try {
    return localStorage.getItem(CLAVE) !== "0";
  } catch {
    // Safari en privado lanza al leer/escribir. Sin memoria, pero con voz.
    return true;
  }
}

export function escribirVozActivada(activada: boolean): void {
  try {
    localStorage.setItem(CLAVE, activada ? "1" : "0");
  } catch {
    // El ajuste dura lo que la pantalla — no es un error que enseñar.
  }
}
