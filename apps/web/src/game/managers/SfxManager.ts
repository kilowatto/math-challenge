/**
 * SfxManager — efectos de un solo disparo (toque, acierto, error), separados
 * de `MusicManager` (D-198, ronda 2).
 *
 * ─── Por qué es su propio archivo y no un método más de MusicManager ───────
 *
 * `MusicManager` existe para UN sonido en loop que sobrevive a los cambios de
 * escena, con fundidos y ducking. Un efecto es lo opuesto: dispara, suena una
 * vez, se olvida — Phaser ya libera la instancia sola al terminar
 * (`Phaser.Sound.BaseSoundManager.play()` la crea, reproduce y descarta).
 * Mezclar las dos responsabilidades en una clase habría significado que
 * cualquier cambio al fundido de la música pudiera romper el efecto de
 * "toque", que no tiene nada que ver.
 *
 * ─── Por qué comparte el interruptor de SONIDO (bocina) y no el de música ───
 *
 * Primer intento (D-198, ronda 2): se agrupó con `preferencia-musica.ts`,
 * razonando que "música y efectos" eran una sola idea de "sonido del juego"
 * frente a la voz. El dueño lo corrigió en vivo (D-199.3, ronda 4): la
 * bocina es el interruptor general de sonido de interfaz — toque, acierto,
 * error, abrir/cerrar un panel — y el ícono de nota musical es SOLO la
 * música de fondo, nada más. Apagar la música con la nota no debe apagar el
 * "ding" de acertar; los dos controles gobiernan cosas distintas.
 * `SfxManager` lee `preferencia-voz.ts` — la MISMA preferencia que
 * `BotonSonido.ts` ya usaba para la voz de Larry — no una preferencia
 * propia.
 */
import Phaser from "phaser";
import { leerVozActivada } from "../../lib/preferencia-voz";

export type Efecto = "toque" | "acierto" | "error" | "panel-abre" | "panel-cierra";

const CLAVE_DE_EFECTO: Record<Efecto, string> = {
  toque: "sfx-toque",
  acierto: "sfx-acierto",
  error: "sfx-error",
  // D-199, ronda 2: "como un videojuego, con efecto especial de sonido
  // cuando se abra y se cierre" — el panel de ajustes, no un botón suelto.
  "panel-abre": "sfx-panel-abre",
  "panel-cierra": "sfx-panel-cierra",
};

const VOLUMEN = 0.6;

export class SfxManager {
  constructor(private readonly manager: Phaser.Sound.BaseSoundManager) {}

  reproducir(efecto: Efecto): void {
    if (!leerVozActivada()) return;
    const clave = CLAVE_DE_EFECTO[efecto];
    // Sin el archivo cargado, silencio — nunca una excepción (mismo criterio
    // que `MusicManager.arrancar()`).
    if (!this.manager.game.cache.audio.exists(clave)) return;
    // D-200.5: mismo hallazgo que `MusicManager` — `play()` sobre un
    // `AudioContext` todavía bloqueado (política de autoplay de iOS, más
    // frágil en una PWA instalada) no se reintenta solo. Si sigue
    // bloqueado, se espera el desbloqueo real antes de disparar el efecto
    // — un "toque" que suena una fracción de segundo tarde sigue siendo
    // mejor que uno que nunca suena.
    if (this.manager.locked) {
      this.manager.once(Phaser.Sound.Events.UNLOCKED, () => this.manager.play(clave, { volume: VOLUMEN }));
    } else {
      this.manager.play(clave, { volume: VOLUMEN });
    }
  }
}
