/**
 * Entrar a Modo Historia sin recargar la página (D-201).
 *
 * ─── Qué reemplaza ─────────────────────────────────────────────────────────
 *
 * Dos `window.location.href` que hacían lo mismo por dos caminos:
 *
 *   · `PinScene`, al acertar el PIN → iba al mapa.
 *   · `GameplayScene.volverAlMapa()`, al terminar un reto → volvía al mapa.
 *
 * Los dos destruían la sesión de Phaser entera y construían otra. Con una sola
 * instancia (`game/juego.ts`) eso deja de tener sentido: los datos se piden a
 * `/api/historia-datos` y la sesión que ya está viva arranca la cadena de
 * Modo Historia.
 *
 * ─── Por qué se arranca `BootScene` y no `MapScene` directamente ───────────
 *
 * Porque `BootScene → PreloadScene → MenuScene|MapScene` **ya decide** a dónde
 * ir según el modo del árbol (`PreloadScene`), y duplicar ese `if` aquí sería
 * una segunda copia de la misma regla, que se separa el día que una cambie.
 * Arrancar la cadena entera es exactamente lo que hace hoy `kids/mapa.astro`
 * al cargarse: máxima paridad, cero lógica nueva.
 *
 * Repetir la precarga no cuesta lo que parece: el `Loader` de Phaser salta las
 * claves que ya existen en la caché de texturas de esta misma sesión, que es
 * justo lo que la fusión hace posible.
 *
 * ─── Y por qué se piden datos FRESCOS cada vez ─────────────────────────────
 *
 * `GameplayScene.volverAlMapa()` navegaba a propósito, y su comentario decía
 * el motivo: `resume()` mostraría la pericia que había ANTES de jugar, no la
 * que el servidor acaba de recalcular al calificar la última respuesta.
 * `packages/motor/src/mapa.ts` (#231) prohíbe una segunda fuente de verdad
 * para el árbol. **Esa razón sigue intacta** — lo único que cambia es cómo se
 * piden los datos frescos: una petición, no un documento entero.
 */
import Phaser from "phaser";
import { sembrarHistoria } from "./juego";
import type { DatosDeArranque } from "./managers/ProgressManager";

/** Lo que `/api/historia-datos` devuelve cuando todo va bien. */
interface RespuestaHistoria extends DatosDeArranque {
  ok: true;
}

/**
 * @param scene la escena viva desde la que se entra (PinScene, GameplayScene…)
 * @param respaldo a dónde navegar si la petición falla — nunca dejar al niño
 *   mirando una pantalla que no responde
 * @param empujarHistorial `true` solo la PRIMERA salida de la rejilla.
 *   D-200.3: tres `pushState` seguidos hacían que el botón atrás se comportara
 *   «como el del navegador» y hicieran falta varios toques para salir. Las
 *   transiciones internas usan `replaceState`.
 */
export async function entrarAHistoria(
  scene: Phaser.Scene,
  respaldo: string,
  empujarHistorial = false,
): Promise<void> {
  let datos: RespuestaHistoria | null = null;
  try {
    const res = await fetch("/api/historia-datos", { credentials: "same-origin" });
    if (res.ok) {
      const cuerpo = (await res.json()) as RespuestaHistoria & { error?: string };
      if (cuerpo.ok) datos = cuerpo;
    }
  } catch {
    datos = null;
  }

  // Sin datos no hay mapa que pintar. Se navega de verdad: la página del mapa
  // sabe redirigir a la rejilla si la sesión caducó, y sabe servir KINDER, que
  // este endpoint no cubre a propósito (D-184).
  if (!datos) {
    window.location.href = respaldo;
    return;
  }

  // `salirA` lo consume `GameplayScene` para volver aquí. Se conserva el
  // respaldo real: si algún día la vuelta falla, navegar sigue funcionando.
  const arranque: DatosDeArranque = { ...datos, salirA: respaldo };

  try {
    if (empujarHistorial) window.history.pushState({ mcSpa: true }, "", respaldo);
    else window.history.replaceState({ mcSpa: true }, "", respaldo);
  } catch {
    /* un navegador que no deja tocar el historial no impide jugar */
  }

  sembrarHistoria(scene.game, arranque);
  vigilarAtras(scene.game);
  scene.scene.start("BootScene");
}

/** Una sola suscripción por sesión, aunque se entre y salga varias veces. */
let vigilando = false;

/**
 * El botón «atrás» del sistema, cuando la pantalla ya no es un documento.
 *
 * ─── El bug que esto arregla, encontrado con el dedo ────────────────────────
 *
 * Sin esto, tocar «atrás» desde el mapa deshacía la entrada de historial —la
 * URL volvía a `/app/kids/`— pero **la escena de Phaser se quedaba en el
 * menú**. La barra decía una cosa y la pantalla otra, y el segundo toque
 * sacaba del sitio entero.
 *
 * No es un descuido evitable leyendo el código: con dos instancias de Phaser
 * el problema no existía, porque «atrás» era una navegación de verdad y el
 * navegador repintaba la página anterior él solo. Al fusionarlas, deshacer el
 * historial dejó de deshacer la pantalla. Lo encontró un toque en el
 * simulador, con `astro check` en 0 errores y el gate en verde.
 *
 * ─── Por qué se relee la isla del DOM ──────────────────────────────────────
 *
 * `QuienJuegaScene` necesita sus tarjetas, y siguen exactamente donde estaban:
 * **no hubo recarga**, así que `#quien-juega-datos` continúa en el documento.
 * Releerla es más barato y más honesto que guardarnos una copia en memoria,
 * que sería una segunda fuente de verdad de los perfiles.
 *
 * Si la isla no está —se llegó por carga directa a `/mapa/`, donde nunca hubo
 * rejilla— se navega de verdad. Ahí «atrás» sí es un documento anterior.
 */
function vigilarAtras(game: Phaser.Game): void {
  if (vigilando) return;
  vigilando = true;

  window.addEventListener("popstate", () => {
    const isla = document.getElementById("quien-juega-datos");
    if (!isla?.textContent) {
      window.location.reload();
      return;
    }
    try {
      const datos = JSON.parse(isla.textContent);
      // `stop` de todo lo de Historia antes de volver: `scene.start` sobre una
      // escena solo detiene la que lo llama, y aquí puede haber varias vivas
      // (MapScene con ChallengeScene lanzada encima).
      for (const clave of ["BootScene", "PreloadScene", "MenuScene", "MapScene", "ChallengeScene", "DialogueScene", "GameplayScene"]) {
        if (game.scene.isActive(clave) || game.scene.isPaused(clave) || game.scene.isSleeping(clave)) {
          game.scene.stop(clave);
        }
      }
      game.scene.start("QuienJuegaScene", datos);
    } catch {
      window.location.reload();
    }
  });
}
