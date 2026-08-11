/**
 * Los textos del PIN, en el idioma del PERFIL (D-201).
 *
 * ─── Por qué el servidor resuelve estos textos y no la escena ──────────────
 *
 * El idioma de esta pantalla es el del NIÑO, no el de la página: en una tablet
 * compartida, el hermano mayor puede tener la app en inglés y el pequeño en
 * español. `kids/pin.astro` ya lo hacía con `t(perfil.locale)`. Al pasar la
 * pantalla a Phaser hay que conservarlo, y una escena de cliente no puede
 * cargar siete catálogos para elegir uno.
 *
 * ─── Por qué se importa el JSON y no `i18n/index.ts` ───────────────────────
 *
 * `i18n/index.ts` importa estos mismos siete archivos **sin**
 * `with { type: "json" }`. Astro lo resuelve en el build, pero Node no puede
 * importarlo — y `pin-endpoints.prueba.mjs` ejecuta los handlers de verdad con
 * Node. Con el atributo puesto, el mismo import funciona en los dos sitios.
 *
 * El coste es real y está aceptado: son siete catálogos completos en el bundle
 * del Worker por unas quince claves. Es el mismo trato que ya hace
 * `api/cierre.ts` con los catálogos de reto, y se paga en el servidor —nunca
 * en el dispositivo del niño, que recibe solo el objeto ya resuelto.
 */
import en from "../i18n/en.json" with { type: "json" };
import esMX from "../i18n/es-MX.json" with { type: "json" };
import esES from "../i18n/es-ES.json" with { type: "json" };
import frFR from "../i18n/fr-FR.json" with { type: "json" };
import ptBR from "../i18n/pt-BR.json" with { type: "json" };
import ptPT from "../i18n/pt-PT.json" with { type: "json" };
import deDE from "../i18n/de-DE.json" with { type: "json" };

const CATALOGOS: Record<string, Record<string, string>> = {
  en,
  "es-MX": esMX,
  "es-ES": esES,
  "fr-FR": frFR,
  "pt-BR": ptBR,
  "pt-PT": ptPT,
  "de-DE": deDE,
};

/** Lo que `PinScene` necesita pintar, ya resuelto. Nunca una clave suelta. */
export interface RotulosPin {
  /** Modo «entrar»: verificar el PIN que ya existe. */
  titulo: string;
  ayuda: string;
  reintenta: string;
  /** Modo «elegir»: fijarlo por primera vez. */
  tituloElegir: string;
  ayudaElegir: string;
  /** Modo «confirmar»: repetirlo para que un toque accidental no lo fije. */
  tituloConfirmar: string;
  ayudaConfirmar: string;
  noCoincide: string;
  /** Comunes. */
  borrar: string;
  progreso: string;
  rejilla: string;
  /** El nombre accesible de cada dibujo, para el lector de pantalla. */
  dibujos: Record<string, string>;
}

/**
 * Los nombres accesibles de los 24, por clave de catálogo.
 *
 * Vive aquí y no en `pin-imagenes.ts` a propósito: el motor guarda QUÉ dibujos
 * hay, y cómo se llaman en cada idioma es cosa de la interfaz — el propio
 * `pin-imagenes.ts` lo dice («la imagen concreta la resuelve la interfaz»).
 */
const CLAVE_DE_DIBUJO: Record<string, string> = {
  sol: "pinDrawSun", luna: "pinDrawMoon", estrella: "pinDrawStar", nube: "pinDrawCloud",
  arbol: "pinDrawTree", flor: "pinDrawFlower", manzana: "pinDrawApple", platano: "pinDrawBanana",
  pez: "pinDrawFish", gato: "pinDrawCat", perro: "pinDrawDog", pajaro: "pinDrawBird",
  mariposa: "pinDrawButterfly", abeja: "pinDrawBee", rana: "pinDrawFrog", tortuga: "pinDrawTurtle",
  casa: "pinDrawHouse", coche: "pinDrawCar", barco: "pinDrawBoat", avion: "pinDrawPlane",
  pelota: "pinDrawBall", globo: "pinDrawBalloon", tambor: "pinDrawDrum", campana: "pinDrawBell",
};

/**
 * @param locale el del perfil, ya pasado por `localeSeguro()`
 * @param numerico si este perfil usa teclado de dígitos en vez de dibujos
 */
export function rotulosPin(locale: string, numerico: boolean): RotulosPin {
  const c = CATALOGOS[locale] ?? CATALOGOS.en;
  const s = (clave: string) => c[clave] ?? CATALOGOS.en[clave] ?? "";
  // Cada texto tiene su gemelo numérico autorado (no es el mismo con otra
  // palabra: «toca tus tres dibujos» y «escribe tu PIN» no se parecen en
  // ningún idioma), así que la rama se elige aquí una vez y la escena nunca
  // vuelve a preguntar de qué tipo es.
  const v = (base: string) => s(numerico ? `${base}Numeric` : base);

  const dibujos: Record<string, string> = {};
  for (const [id, clave] of Object.entries(CLAVE_DE_DIBUJO)) dibujos[id] = s(clave);

  return {
    titulo: v("pinTitle"),
    ayuda: v("pinHelp"),
    reintenta: v("pinTryAgain"),
    tituloElegir: v("pinChooseTitle"),
    ayudaElegir: v("pinChooseHelp"),
    tituloConfirmar: v("pinConfirmTitle"),
    ayudaConfirmar: v("pinConfirmHelp"),
    noCoincide: v("pinMismatch"),
    borrar: s("pinClear"),
    progreso: v("pinProgress"),
    rejilla: v("pinGridLabel"),
    dibujos,
  };
}
