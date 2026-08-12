/**
 * entrada.ts (QuienJuegaScene) — el `<script>` que de verdad se ejecuta.
 *
 * Mismo patrón que `game/entrada.ts` de Modo Historia: separado de `main.ts`
 * para que éste siga siendo una función pura, fácil de importar desde una
 * prueba sin tocar el DOM.
 *
 * ─── La mejora progresiva vive AQUÍ, no en `QuienJuegaScene` ───────────────
 *
 * `kids/index.astro` sigue siendo la pantalla real, en HTML, sin JavaScript
 * (D-012, mc-33) — este script solo se ejecuta si el navegador SÍ corrió
 * hasta aquí. Si Phaser arranca bien, se oculta la rejilla de HTML
 * (`.rejilla`) porque ya está reemplazada visualmente por el `<canvas>`; si
 * algo truena antes de esa línea, la rejilla de HTML se queda exactamente
 * como estaba — nunca una pantalla en blanco.
 */
import { arrancarQuienJuega } from "./main";
import { alVolver } from "../spa/enrutador";
import { registrarJuego, faseActual, fijarFase, detenerEscenaHistoriaActual } from "../spa/estado";

const datosCrudos = document.getElementById("quien-juega-datos")?.textContent;
if (datosCrudos) {
  try {
    const datos = JSON.parse(datosCrudos);
    const game = arrancarQuienJuega("quien-juega-mount", datos);
    registrarJuego(game);
    document.querySelector(".rejilla")?.setAttribute("hidden", "");
    const vacio = document.querySelector(".vacio");
    vacio?.setAttribute("hidden", "");

    /**
     * D-200.1: el botón atrás del sistema. `mostrarPin`/`arrancarHistoriaEn
     * Sesion` empujan una entrada de historial cada uno — este manejador
     * deshace UN paso desde donde esté la sesión ahora mismo, usando
     * `estado.ts` para saber cuál. Deshacer desde "historia" salta directo
     * a la rejilla en vez de a la pantalla de PIN intermedia — un atajo
     * deliberado (ver el encabezado de `estado.ts`): volver a mostrar el
     * PIN solo para tener que tocarlo otra vez no ayuda a nadie, y a nadie
     * le gusta ver un formulario de un intento que ya pasó.
     */
    alVolver(() => {
      const fase = faseActual();
      if (fase === "historia") {
        detenerEscenaHistoriaActual();
        game.scene.start("QuienJuegaScene", datos);
      }
      // El PIN es una escena (D-201): se detiene, no se «oculta» un overlay.
      // `isSleeping` cubre el caso de volver con la rejilla dormida debajo.
      if (game.scene.isActive("PinScene") || game.scene.isSleeping("PinScene")) {
        game.scene.stop("PinScene");
        game.scene.wake("QuienJuegaScene");
      }
      fijarFase("rejilla");
    });
  } catch (err) {
    // Si Phaser no pudo arrancar, la rejilla de HTML nunca se ocultó: sigue
    // siendo la pantalla real. No hay nada que reportar a un niño.
    console.error("quien-juega: no se pudo montar Phaser", String(err).slice(0, 200));
  }
}
