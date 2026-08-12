/**
 * CargaAssetsScene — la escena que descarga. No pinta ni un pixel.
 *
 * ─── Por qué son DOS escenas y no una ──────────────────────────────────────
 *
 * Ésta es la lección que costó cinco despliegues, y está aquí para que nadie
 * las vuelva a juntar «porque es más simple»:
 *
 * **Phaser no llama a `update()` ni corre la física mientras una escena está
 * en estado `LOADING`.** Renderizar sí renderiza —por eso la barra de carga
 * clásica de Phaser, que se dibuja en `preload()` y se repinta desde el evento
 * `progress`, funciona— pero el paso del mundo de Matter y el `update()` de la
 * escena solo empiezan cuando `create()` ya devolvió, y `create()` no corre
 * hasta que el último archivo terminó de cargar.
 *
 * Con carga y animación en la misma escena, el resultado es exactamente lo que
 * se vio: los 243 archivos bajaban bien, el plan se calculaba bien, y la
 * pantalla estaba **en blanco todo el rato**, para pintarse justo cuando ya no
 * hacía falta. Un loader que solo se ve cuando terminó de cargar no es un
 * loader.
 *
 * Separadas, `LoaderScene` entra en `RUNNING` de inmediato —no tiene
 * `preload()`, así que su `create()` corre en el primer fotograma— y anima los
 * 100 cuadros mientras ésta, en paralelo y sin nada que dibujar, se queda en
 * `LOADING` el tiempo que haga falta. Las escenas de Phaser son independientes:
 * una en `LOADING` no detiene el paso de las demás.
 *
 * ─── El contrato ───────────────────────────────────────────────────────────
 *
 * Habla por su emisor de eventos, nunca tocando a la otra escena:
 *
 *  · `version` (string)  — el sello del manifiesto, en cuanto llega
 *  · `progreso` (0..1)   — ponderado por bytes cuando hay plan, por archivos si no
 *  · `asset` (string)    — el rótulo del último archivo que entró
 *  · `musica-lista` ()   — `musica-calma` ya está en caché de audio (loader E)
 *  · `listo` ()          — todo dentro; se puede salir
 *  · `sin-manifiesto` () — no hubo catálogo que cargar (ver abajo)
 *
 * `sin-manifiesto` existe porque un manifiesto vacío o ilegible **no puede
 * dejar al niño encerrado en el loader**: la otra escena lo trata como carga
 * terminada y entra con lo que haya. Un catálogo roto degrada la primera
 * pantalla; no bloquea el juego.
 */
import Phaser from "phaser";
import { planDeCarga, pesoDe, anotarGuardados, type PlanDeCarga } from "../assets/planDeCarga";
import { cacheDeAssets, type AssetDelManifiesto } from "../assets/AssetCache";

const CLAVE_MANIFIESTO = "mc-manifiesto";

/**
 * Se pide PRIMERO, delante de los otros 243 archivos — es lo que hace posible
 * "música desde el primer fotograma" y no "música cuando le toque el turno".
 *
 * `musica-calma` es la única de las diez pistas del catálogo que sirve aquí:
 * es el ánimo de explorar (D-198), el mismo que suena en «¿Quién juega?»
 * justo después del loader, así que empezarla aquí no es un sonido de más —
 * es el mismo sonido, empezando un poco antes de lo que empezaría solo.
 */
const CLAVE_MUSICA_LOADER = "musica-calma";

export class CargaAssetsScene extends Phaser.Scene {
  private plan: PlanDeCarga | null = null;
  private porClave = new Map<string, AssetDelManifiesto>();
  private cacheados = new Set<string>();
  private guardados: Array<{ clave: string; hash: string }> = [];
  private hecho = 0;
  private progreso = 0;

  constructor() {
    super({ key: "CargaAssetsScene" });
  }

  init(): void {
    this.plan = null;
    this.porClave = new Map();
    this.cacheados = new Set();
    this.guardados = [];
    this.hecho = 0;
    this.progreso = 0;
  }

  /**
   * Todo se encola aquí dentro, y ahí está el segundo aprendizaje caro.
   *
   * La primera versión leía el manifiesto en un `async create()` y encolaba
   * después, con `load.start()` a mano. **Se quedó clavada en 0%**: fuera del
   * ciclo de `preload`, el `Loader` de Phaser 4 no vuelve a arrancar de forma
   * fiable, así que `COMPLETE` no dispara nunca.
   *
   * El patrón que SÍ funciona es éste: cargar el manifiesto como un archivo
   * más del `preload`, y encolar el resto **dentro del callback de ese
   * archivo**. Phaser acepta archivos nuevos mientras el loader sigue activo, y
   * los espera todos antes de dar por terminada la fase.
   *
   * Consecuencia: el manifiesto local se lee SÍNCRONO de `localStorage`, no por
   * la interfaz `AssetCache`. Es el mismo dato —`WebAssetCache` guarda ahí
   * mismo— y aquí no hay sitio para un `await`.
   */
  preload(): void {
    this.load.json(CLAVE_MANIFIESTO, "/manifest-assets.json");

    this.load.once(
      `filecomplete-json-${CLAVE_MANIFIESTO}`,
      (_clave: string, _tipo: string, datos: { version?: string; assets?: AssetDelManifiesto[] }) => {
        const assets = Array.isArray(datos?.assets) ? datos.assets : [];
        this.events.emit("version", String(datos?.version ?? ""));

        if (assets.length === 0) {
          this.events.emit("sin-manifiesto");
          return;
        }

        this.plan = planDeCarga(assets, this.manifiestoLocalSincrono());
        this.cacheados = new Set(this.plan.desdeCache.map((a) => a.key));
        this.porClave = new Map(assets.map((a) => [a.key, a]));

        /**
         * Los nombres de campo son los del generador (`astro.config.mjs`), en
         * inglés: `key`, no `clave`. Esta línea decía `a.clave` y encolaba 243
         * archivos con clave `undefined`; Phaser reventaba con
         * `Invalid File key: false` dentro de este mismo callback, y como el
         * throw ocurre en el ciclo del loader, la escena se quedaba viva y
         * muda. `astro check` no lo veía: `load.json()` devuelve `any`.
         */
        /**
         * `CLAVE_MUSICA_LOADER` se encola PRIMERO, sea que venga de red o de
         * caché — el orden en que se llama a `this.load.*` es el orden en que
         * Phaser abre las peticiones, y ninguna otra señal de prioridad existe
         * en este loader.
         */
        const orden = [...this.plan.descargar, ...this.plan.desdeCache].sort(
          (a, b) => Number(b.key === CLAVE_MUSICA_LOADER) - Number(a.key === CLAVE_MUSICA_LOADER),
        );
        for (const a of orden) {
          if (a.url.endsWith(".mp3")) this.load.audio(a.key, a.url);
          else this.load.image(a.key, a.url);
        }
      },
    );

    this.load.on(Phaser.Loader.Events.FILE_COMPLETE, (clave: string) => {
      const a = this.porClave.get(clave);
      if (!a) return;
      this.hecho += pesoDe(a, this.cacheados.has(a.key));
      this.guardados.push({ clave: a.key, hash: a.hash });
      this.events.emit("asset", a.label);
      if (clave === CLAVE_MUSICA_LOADER) this.events.emit("musica-lista");
    });

    /**
     * Dos señales, y el mayor gana.
     *
     * La ponderada por bytes es la buena —no miente cuando un fondo de 300 KB y
     * un icono de 8 KB van en la misma cola— pero depende del plan, que no
     * existe hasta que llega el manifiesto. `load.progress` es tosco (cuenta
     * archivos) y siempre está. Tomar el máximo da precisión cuando la hay y un
     * suelo cuando no. Nunca retrocede: el progreso de un loader que baja de
     * 60% a 40% se lee como una falla aunque sea exacto.
     */
    this.load.on(Phaser.Loader.Events.PROGRESS, (v: number) => {
      const porPeso = this.plan && this.plan.pesoTotal > 0 ? this.hecho / this.plan.pesoTotal : 0;
      this.progreso = Math.max(this.progreso, porPeso, v);
      this.events.emit("progreso", this.progreso);
    });
  }

  create(): void {
    this.events.emit("progreso", 1);
    this.events.emit("listo");
    // Solo lo que de verdad se cargó: anotar el manifiesto entero tras una
    // carga parcial haría creer al dispositivo que tiene assets que no tiene.
    void anotarGuardados(cacheDeAssets(), this.guardados);
  }

  /** El manifiesto local, leído sin `await`. Ver el porqué en `preload()`. */
  private manifiestoLocalSincrono(): Record<string, string> {
    try {
      const crudo = localStorage.getItem("mc:manifiesto-assets");
      return crudo ? (JSON.parse(crudo) as Record<string, string>) : {};
    } catch {
      return {};
    }
  }
}
