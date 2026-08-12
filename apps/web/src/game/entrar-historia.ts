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
import { reemplazarHistorial } from "./spa/enrutador";
import type { DatosDeArranque } from "./managers/ProgressManager";

/** Lo que `/api/historia-datos` devuelve cuando todo va bien. */
interface RespuestaHistoria extends DatosDeArranque {
  ok: true;
}

/**
 * @param scene la escena viva desde la que se entra (PinScene, GameplayScene…)
 * @param respaldo a dónde navegar si la petición falla — nunca dejar al niño
 *   mirando una pantalla que no responde
 */
export async function entrarAHistoria(scene: Phaser.Scene, respaldo: string): Promise<void> {
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

  // El historial lo lleva `spa/enrutador.ts`, que ya distingue empujar de
  // reemplazar por la lección de D-200.3: apilar una entrada por cada paso
  // interno hacía que «atrás» se comportara como el botón del navegador y
  // costara varios toques salir. Aquí SIEMPRE se reemplaza — quien empuja es
  // `QuienJuegaScene` al salir de la rejilla, una sola vez por sesión.
  reemplazarHistorial(respaldo);

  sembrarHistoria(scene.game, arranque);
  scene.scene.start("BootScene");
}
