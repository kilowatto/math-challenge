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

const datosCrudos = document.getElementById("quien-juega-datos")?.textContent;
if (datosCrudos) {
  try {
    const datos = JSON.parse(datosCrudos);
    arrancarQuienJuega("quien-juega-mount", datos);
    document.querySelector(".rejilla")?.setAttribute("hidden", "");
    const vacio = document.querySelector(".vacio");
    vacio?.setAttribute("hidden", "");
  } catch (err) {
    // Si Phaser no pudo arrancar, la rejilla de HTML nunca se ocultó: sigue
    // siendo la pantalla real. No hay nada que reportar a un niño.
    console.error("quien-juega: no se pudo montar Phaser", String(err).slice(0, 200));
  }
}
