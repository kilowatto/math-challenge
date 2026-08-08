/**
 * DialogueScene — plomería de diálogo/cutscene, SIN contenido todavía (D-184).
 *
 * Ningún `WorldChapter` de `data/story.ts` define líneas de diálogo hoy: no
 * hay narrativa autorada para Modo Historia, y esta escena no la inventa —
 * inventar diálogo de personajes sería contenido de producto, y ese pasa por
 * la misma revisión humana que cualquier ítem del banco (CLAUDE.md §
 * Contenido). Lo que sí se construye es el MECANISMO, completo y probado, para
 * cuando ese contenido exista: `scene.launch("DialogueScene", { lineas })`
 * desde donde haga falta, con `lineas: DialogueLine[]`.
 *
 * `scene.launch()` sobre `MapScene` en pausa (mismo patrón que
 * `ChallengeScene`) — nunca `scene.start()`, que destruiría el mapa detrás.
 */
import Phaser from "phaser";

export interface DialogueLine {
  /** Ya resuelto por el locale — nunca una clave i18n cruda. */
  speaker: string;
  text: string;
  /** Clave de textura del retrato. `null` = sin retrato (línea narrada). */
  portraitKey: string | null;
}

const VELOCIDAD_MS_POR_CARACTER = 22;

export class DialogueScene extends Phaser.Scene {
  private lineas: DialogueLine[] = [];
  private indice = 0;
  private texto!: Phaser.GameObjects.Text;
  private nombre!: Phaser.GameObjects.Text;
  private escribiendo = false;
  private eventoEscritura: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super("DialogueScene");
  }

  create(data: { lineas: DialogueLine[] }): void {
    this.lineas = data.lineas ?? [];
    this.indice = 0;

    const { width, height } = this.scale;
    const cajaAlto = 140;
    const caja = this.add
      .rectangle(0, height - cajaAlto, width, cajaAlto, 0x16181a, 0.88) // fondo-oscuro (paleta Ignia)
      .setOrigin(0, 0);
    this.nombre = this.add
      .text(24, height - cajaAlto + 16, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "15px",
        fontStyle: "600",
        color: "#F8A337", // naranja-claro (paleta Ignia)
      });
    this.texto = this.add.text(24, height - cajaAlto + 44, "", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "16px",
      color: "#ffffff",
      wordWrap: { width: width - 48 },
    });

    caja.setInteractive().on("pointerdown", () => this.avanzar());
    this.mostrarLinea();
  }

  private mostrarLinea(): void {
    const linea = this.lineas[this.indice];
    if (!linea) {
      this.terminar();
      return;
    }
    this.nombre.setText(linea.speaker);
    this.texto.setText("");
    this.escribiendo = true;
    let i = 0;
    this.eventoEscritura?.remove();
    this.eventoEscritura = this.time.addEvent({
      delay: VELOCIDAD_MS_POR_CARACTER,
      loop: true,
      callback: () => {
        i++;
        this.texto.setText(linea.text.slice(0, i));
        if (i >= linea.text.length) {
          this.escribiendo = false;
          this.eventoEscritura?.remove();
        }
      },
    });
  }

  /** Tocar adelanta: si está escribiendo, completa la línea; si no, pasa a la siguiente. */
  private avanzar(): void {
    if (this.escribiendo) {
      this.eventoEscritura?.remove();
      this.texto.setText(this.lineas[this.indice]?.text ?? "");
      this.escribiendo = false;
      return;
    }
    this.indice++;
    this.mostrarLinea();
  }

  /** Botón "skip" externo (HUD) puede llamar esto directamente. */
  saltarTodo(): void {
    this.terminar();
  }

  private terminar(): void {
    this.eventoEscritura?.remove();
    this.scene.stop();
    this.scene.resume("MapScene");
  }
}
