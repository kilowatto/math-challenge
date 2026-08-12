/**
 * MusicManager — música de fondo de Modo Historia, con ducking listo para
 * cuando exista voz (D-198).
 *
 * ─── Por qué envuelve `game.sound` y no vive en una escena ─────────────────
 *
 * La música tiene que sobrevivir a `scene.start()` (mapa → panel de nivel →
 * el reto en sí → de vuelta al mapa) sin cortarse ni reiniciarse — Phaser NO
 * detiene sonidos al cambiar de escena porque `game.sound` es del `Game`, no
 * de la `Scene`. Igual que `ProgressManager` envuelve `game.registry` en vez
 * de vivir dentro de una escena, este envuelve `game.sound` y se guarda una
 * sola vez en el registro (`game/main.ts::iniciarHistoria`).
 *
 * ─── Dos ánimos, no un catálogo (D-198) ─────────────────────────────────────
 *
 * El dueño eligió "una pista distinta por estado de ánimo (calma / energía)"
 * sobre las otras alternativas ofrecidas. "calma" sirve al mapa/menú
 * (explorar); "energía" al reto en sí (resolver) — ver `scripts/gen-musica-
 * fondo.mjs` para los prompts exactos. `reproducir()` es idempotente: llamarla
 * con el mismo ánimo que ya suena no reinicia el loop.
 *
 * ─── El ducking, sin nada todavía que lo dispare ────────────────────────────
 *
 * El dueño confirmó ducking automático bajo la voz de Larry. Pero
 * `packages/tutor/src/voz.ts` documenta, en su propio encabezado, que NINGÚN
 * clip de voz existe todavía (P-19/P-20 de `docs/dudas.md`, sin contestar).
 * `agachar()`/`restaurar()` quedan aquí, público y listo, para que el día que
 * exista un evento real de "Larry empezó/terminó de hablar" lo llame — hoy
 * nada lo hace, y eso es correcto: no hay de qué agacharse todavía.
 *
 * ─── El bloqueo de audio de iOS, encontrado leyendo el propio Phaser (D-200.5) ───
 *
 * El dueño reportó varias veces, en dispositivo real, que la música nunca
 * arrancaba sola — sin ninguna causa encontrada en el código de la
 * preferencia (`preferencia-musica.ts`) en tres intentos. La cuarta vez, un
 * video confirmó el ícono de música DESACTIVADO (no silenciado) y la
 * grabación en silencio digital absoluto — no era una preferencia guardada.
 * Leyendo el código fuente de Phaser 4.2.1 (`WebAudioSound.js::play()`,
 * `WebAudioSoundManager.js::unlock()`) se confirmó: `play()` llama
 * `createAndStartBufferSource()` INCONDICIONALMENTE, sin comprobar si el
 * `AudioContext` sigue `locked` (suspendido por la política de autoplay del
 * navegador) — y el propio `unlock()` de Phaser no reintenta la reproducción
 * una vez que el contexto de verdad se reanuda. Todo el flujo de esta app se
 * probó como PWA instalada en pantalla de inicio (sin barra de Safari en
 * ninguna captura de todo el día) — un contexto donde el bloqueo de audio de
 * iOS es un problema conocido y documentado, más frágil que en una pestaña
 * normal. `arrancar()` ahora comprueba `this.manager.locked` y, si sigue
 * bloqueado, espera el evento `UNLOCKED` de Phaser antes de reproducir — en
 * vez de confiar en que un `play()` lanzado sobre un contexto suspendido se
 * arregle solo cuando el contexto se reanude.
 */
import Phaser from "phaser";
import { leerMusicaActivada } from "../../lib/preferencia-musica";

export type Animo = "calma" | "energia";

const CLAVE_DE_PISTA: Record<Animo, string> = {
  calma: "musica-calma",
  energia: "musica-energia",
};

const VOLUMEN_NORMAL = 0.35;
/** El nivel bajo ducking — nunca cero: sigue audible como fondo, no desaparece. */
const VOLUMEN_AGACHADO = 0.08;
const FUNDIDO_MS = 300;

/**
 * `Phaser.Sound.BaseSound` no declara `volume`/`setVolume` en sus tipos —
 * solo las subclases concretas (`WebAudioSound`/`HTML5AudioSound`) los
 * tienen, y `BaseSoundManager.add()` devuelve el tipo base. El juego real
 * siempre instancia una de las dos concretas (nunca `NoAudioSound` con
 * `Phaser.AUTO` en un navegador), así que este tipo intersección es correcto
 * en tiempo de ejecución y solo le devuelve al compilador lo que ya es cierto.
 */
type SonidoConVolumen = Phaser.Sound.BaseSound & { volume: number; setVolume(valor: number): unknown };

function fundir(sonido: SonidoConVolumen, hasta: number, duracionMs: number): void {
  const desde = sonido.volume;
  const inicio = performance.now();
  const paso = (ahora: number) => {
    const t = Math.min(1, (ahora - inicio) / duracionMs);
    sonido.setVolume(desde + (hasta - desde) * t);
    if (t < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

export class MusicManager {
  private actual: SonidoConVolumen | null = null;
  private animoActual: Animo | null = null;
  private agachada = false;

  constructor(private readonly manager: Phaser.Sound.BaseSoundManager) {}

  /** Cambia (o mantiene) el ánimo que suena. Sin ruido si la música está apagada: recuerda el ánimo para cuando se reactive. */
  reproducir(animo: Animo): void {
    if (this.animoActual === animo && this.actual?.isPlaying) return;
    this.detener();
    this.animoActual = animo;
    if (leerMusicaActivada()) this.arrancar(animo);
  }

  /** Llamada por `BotonMusica` tras alternar la preferencia — nunca cambia el ánimo, solo si suena o no. */
  alSincronizarPreferencia(): void {
    if (leerMusicaActivada()) {
      if (!this.actual && this.animoActual) this.arrancar(this.animoActual);
    } else {
      this.detener();
    }
  }

  agachar(): void {
    this.agachada = true;
    if (this.actual) fundir(this.actual, VOLUMEN_AGACHADO, FUNDIDO_MS);
  }

  restaurar(): void {
    this.agachada = false;
    if (this.actual) fundir(this.actual, VOLUMEN_NORMAL, FUNDIDO_MS);
  }

  private arrancar(animo: Animo): void {
    const clave = CLAVE_DE_PISTA[animo];
    // Sin el archivo cargado (falló la red, o todavía no se generó/commiteó
    // el par de pistas) el mapa se juega en silencio — nunca una excepción
    // sin captura en el dispositivo de un niño (mismo criterio que
    // `MapScene.ts` usa para un capítulo desconocido).
    if (!this.manager.game.cache.audio.exists(clave)) return;
    const sonido = this.manager.add(clave, { loop: true, volume: 0 }) as SonidoConVolumen;
    this.actual = sonido;

    const empezar = () => {
      // Si mientras se esperaba el desbloqueo cambió de ánimo o se detuvo
      // la música, este sonido ya no es el actual — no reproducir un
      // fantasma por encima de lo que suena ahora.
      if (this.actual !== sonido) return;
      sonido.play();
      fundir(sonido, this.agachada ? VOLUMEN_AGACHADO : VOLUMEN_NORMAL, FUNDIDO_MS);
    };

    if (this.manager.locked) this.manager.once(Phaser.Sound.Events.UNLOCKED, empezar);
    else empezar();
  }

  private detener(): void {
    const previo = this.actual;
    this.actual = null;
    if (!previo) return;
    fundir(previo, 0, FUNDIDO_MS);
    setTimeout(() => previo.stop(), FUNDIDO_MS + 20);
  }
}
