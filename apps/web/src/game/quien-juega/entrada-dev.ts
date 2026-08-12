/**
 * Punto de entrada de `/dev/loader/` — el banco de pruebas del loader.
 *
 * Igual que `entrada.ts`, con dos diferencias que son el motivo de existir:
 *
 *  1. **Traza en consola cada paso del loader.** El loader se depuró cuatro
 *     despliegues a ciegas porque en el simulador no hay consola; aquí se
 *     imprime lo que hace, con marcas de tiempo, para poder LEER dónde se
 *     atasca en vez de deducirlo de una captura.
 *  2. **No oculta ninguna rejilla de HTML** ni toca el historial: esta página
 *     no tiene nada de eso.
 *
 * Nada de esto se carga en la app real: `entrada.ts` sigue siendo la de
 * `kids/index.astro`, sin trazas.
 */
import { crearJuego } from "../juego";

const t0 = performance.now();
const traza = (etapa: string, extra?: unknown) => {
  const ms = Math.round(performance.now() - t0);
  // eslint-disable-next-line no-console
  console.log(`[loader +${String(ms).padStart(5)}ms] ${etapa}`, extra ?? "");
};

// Cualquier excepción de Phaser acaba aquí, con su pila. Sin esto, una escena
// que revienta en `create()` deja la pantalla en blanco y nada más — que es
// exactamente lo que pasó en producción.
window.addEventListener("error", (e) => traza("‼️ ERROR", e.error?.stack ?? e.message));
window.addEventListener("unhandledrejection", (e) => traza("‼️ PROMESA RECHAZADA", e.reason));

traza("arranque");

const crudo = document.getElementById("quien-juega-datos")?.textContent;
if (!crudo) {
  traza("‼️ sin isla de datos");
} else {
  try {
    const datos = JSON.parse(crudo);
    traza("datos leídos", { tarjetas: datos.tarjetas?.length });
    const game = crearJuego("quien-juega-mount", { escena: "LoaderScene", datos });
    // Solo en el banco de pruebas: permite inspeccionar escenas y objetos desde
    // la consola del navegador. `entrada.ts` (la real) no expone nada.
    (window as unknown as { __juego: unknown }).__juego = game;
    traza("Phaser creado");

    // Qué escena está viva, cada medio segundo. Es lo que dice si el loader
    // terminó, se quedó a medias, o nunca arrancó.
    const escenas = () =>
      game.scene.getScenes(true).map((s) => (s.sys.settings.key ?? "?") as string);
    let anterior = "";
    setInterval(() => {
      const ahora = escenas().join(",");
      if (ahora !== anterior) {
        traza("escenas activas", ahora);
        anterior = ahora;
      }
    }, 500);
  } catch (err) {
    traza("‼️ no se pudo montar", String(err));
  }
}
