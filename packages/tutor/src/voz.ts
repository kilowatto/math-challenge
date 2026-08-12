/**
 * La voz de Larry — contrato, regímenes y elección de fuente.
 *
 * F6 #135, `docs/planes/f6-larry-profe.md` §4, `mc-42`, `mc-20`, D-022, D-073.
 *
 * ═══ Una corrección de lectura, primero, porque cambia el diseño ═══════════
 *
 * Circula la idea de que `speechSynthesis` no existe en iOS Safari «en ninguna
 * versión, de la 3.2 a la 26.5». **Eso no es lo que dice `mc-42`.** Esa frase
 * es de su §6 y habla de la **Vibration API**. La tabla de capacidades de
 * `mc-42` dice de `speechSynthesis`, literal: *«Supported since Safari 7; voice
 * count/quality per language is an OS property»*. Los hápticos son el canal que
 * no existe en iPhone; la síntesis de voz sí existe.
 *
 * Importa porque las dos lecturas llevan a productos distintos: si la síntesis
 * no existiera en iOS, la voz grabada sería la única vía posible y bloquearía
 * el producto entero. Como sí existe, la voz grabada se elige por otras tres
 * razones —que siguen siendo buenas— y la síntesis se queda como red.
 *
 * ═══ Por qué la voz es PREGENERADA de todos modos ═════════════════════════
 *
 * Tres razones independientes, cada una suficiente (plan §4.1):
 *
 * 1. **Latencia.** El dispositivo de referencia es Android de gama baja sobre
 *    4G lento (`mc-47` §4). Una llamada de síntesis por enunciado mete un viaje
 *    de red donde hoy no hay ninguno.
 * 2. **Offline.** D-047 exige modo avión, y una voz que necesita red no existe
 *    a diez mil metros.
 * 3. **Revisión.** Pregenerado hace que la voz pase por revisión humana ANTES
 *    de sonar (CLAUDE.md § Contenido). En vivo es imposible.
 *
 * Y dos razones más contra `speechSynthesis` como vía principal, que no
 * dependen de la plataforma: la disponibilidad de voz **por idioma** es
 * propiedad del sistema operativo y no hay API web para forzar la instalación
 * de un paquete —un Android sin paquete de francés deja a un pre-lector frente
 * a una pantalla muda, que no es degradación sino producto roto—, y la voz que
 * da el sistema es la del **teléfono**, no la de Larry, que es un personaje de
 * marca con canon (D-004).
 *
 * ═══ Lo que bloquea, dicho aquí y no solo en el informe ═══════════════════
 *
 * Ningún clip existe todavía, y no es un pendiente de código: **P-19 y P-20 de
 * `docs/dudas.md` están sin contestar.** Workers AI no tiene voz verificada
 * para `fr-FR`, `pt-BR`, `pt-PT` ni `de-DE` —cuatro de los siete locales— y
 * generarla fuera de Cloudflare toca D-035, que el dueño amplió a «solo vamos a
 * trabajar con Cloudflare». Ese permiso lo da él o no lo da nadie. Este archivo
 * deja el contrato listo para el día que se conteste; no inventa la respuesta.
 *
 * ═══ Larry NUNCA escucha ══════════════════════════════════════════════════
 *
 * Línea roja #1, sin matiz de edad: «nunca micrófono… a nadie, en ninguna
 * banda». Este módulo no importa, no expone y no describe ninguna entrada de
 * audio. La voz es de salida y solo de salida. Está escrito aquí porque el
 * criterio de #135 dice «Larry habla» y no decía en ninguna parte que el niño
 * no habla — y un hueco textual en una línea roja es cómo se cruza sin que
 * nadie lo decida.
 */

import { LOCALES, type Locale } from "../../motor/src/convenciones.ts";

// ───────────────────────────────────────────────────────────────────────────
// 1. Los dos regímenes, con presupuestos SEPARADOS
// ───────────────────────────────────────────────────────────────────────────

/**
 * `mc-42` §3 es explícito y es la parte que más fácil se ignora: el sonido
 * irrelevante durante la tarea **perjudica de forma medible**. El efecto de
 * habla irrelevante degrada el recuerdo serial aunque no se atienda, y el
 * principio de coherencia de Mayer pide quitar el material decorativo porque
 * compite por capacidad limitada. Ninguno de los dos argumenta contra un sonido
 * **momentáneo y con significado**.
 *
 * De ahí que sean dos presupuestos y no uno: mezclarlos produce una app con
 * musiquita de fondo mientras un niño cuenta.
 *
 * ═══ D-198 reversa `musica` a `true` en los dos regímenes ═════════════════
 *
 * El dueño vio esta misma evidencia explicada y confirmó que quiere música de
 * fondo real, incluyendo mientras se resuelve un ítem — no se borra el
 * argumento de arriba, se anota que se decidió en contra de él. Lo que SÍ
 * mitiga el riesgo que `mc-42`/Mayer señalan: la música nunca es
 * `espontanea` (no arranca sola a mitad de una pregunta, ver `MusicManager.ts`,
 * que solo la cambia entre escenas completas) y queda lista para agacharse
 * (`MusicManager.agachar()`) en cuanto exista voz de Larry que la dispare —
 * hoy no existe (P-19/P-20 de `docs/dudas.md`, sin contestar), así que el
 * ducking está construido pero inerte.
 */
export type Regimen = "mientras_resuelve" | "al_resolver";

export const PRESUPUESTO: Record<Regimen, {
  /** Techo de audio, en milisegundos. */
  audioMs: number;
  /** Techo de animación, en milisegundos. */
  animacionMs: number;
  /** Si puede sonar música de fondo. */
  musica: boolean;
  /** Si el sonido puede empezar sin que el niño lo pida. */
  espontaneo: boolean;
}> = {
  /**
   * Silencio por defecto. Lo único que suena es el enunciado, y suena porque el
   * niño no lee: es el canal de instrucción, no decoración. Se puede repetir a
   * petición —«dilo otra vez» va a ser el botón más usado del producto— y no
   * arranca solo una segunda vez.
   */
  mientras_resuelve: { audioMs: 6_000, animacionMs: 0, musica: true, espontaneo: false },
  /**
   * El instante de recompensa o de error. Aquí sí hay juice, y cabe entero en
   * menos de lo que tarda en llegar la siguiente pregunta (`mc-42` §12).
   */
  al_resolver: { audioMs: 500, animacionMs: 800, musica: true, espontaneo: true },
};

/**
 * El techo de la celebración de sesión — racha, nivel completo.
 *
 * Va aparte porque no es «al resolver un ítem»: `mc-42` §12 le da 2.5 s, y pide
 * que sea saltable y que nunca bloquee «continuar» más allá de ese techo.
 */
export const CELEBRACION_DE_SESION_MS = 2_500;

// ───────────────────────────────────────────────────────────────────────────
// 2. De dónde sale el sonido
// ───────────────────────────────────────────────────────────────────────────

export type Fuente =
  /** Clip pregenerado y revisado por una persona. La vía principal. */
  | "clip"
  /** `speechSynthesis` del sistema. Red de última instancia, nunca por defecto. */
  | "sintesis_del_sistema"
  /** Sin sonido. **Vía de primera clase**, no un modo degradado. */
  | "muda";

export interface CapacidadesDeVoz {
  /** Si el clip de esa clave está en caché o empaquetado. */
  clipDisponible: boolean;
  /** Qué encontró la sonda de voces del sistema para este locale. */
  vozDelSistema: CoberturaDeVoz;
  /** El interruptor del padre, o el ícono de bocina que el niño puede tocar. */
  silenciado: boolean;
  /** Si el primer toque de la sesión ya desbloqueó el `AudioContext`. */
  audioDesbloqueado: boolean;
}

/**
 * Elige la fuente. Pura, sin DOM, sin red — para poder probarla.
 *
 * El orden no es una preferencia: es el plan §4.1 hecho función.
 */
export function elegirFuente(cap: CapacidadesDeVoz): Fuente {
  if (cap.silenciado) return "muda";
  // La política de autoplay bloquea todo audio con sonido antes de un gesto
  // (`mc-42` §9). Intentarlo igual no da error visible: da silencio, que se
  // diagnostica como «el audio no funciona» y no como «faltó el gesto».
  if (!cap.audioDesbloqueado) return "muda";
  if (cap.clipDisponible) return "clip";
  if (cap.vozDelSistema === "exacta") return "sintesis_del_sistema";
  // `misma_lengua_otra_region` NO se acepta en silencio: ver `coberturaDeVoz`.
  return "muda";
}

// ───────────────────────────────────────────────────────────────────────────
// 3. La sonda de voces del sistema
// ───────────────────────────────────────────────────────────────────────────

export type CoberturaDeVoz = "exacta" | "misma_lengua_otra_region" | "ninguna";

/**
 * La etiqueta BCP-47 que se le pide al sistema por locale.
 *
 * Seis de los siete locales YA son etiquetas BCP-47 y se pasan tal cual. El
 * único que necesita expandirse es `en`, que en este producto no lleva región;
 * se pide `en-GB` porque los textos ya autorados de `en` están en ortografía
 * británica («practising», «recognising») y una voz que lee ortografía
 * británica con fonología estadounidense es exactamente el tipo de detalle que
 * un adulto oye y un niño imita.
 */
export const ETIQUETA_DE_VOZ: Record<Locale, string> = {
  "en": "en-GB",
  "es-MX": "es-MX",
  "es-ES": "es-ES",
  "fr-FR": "fr-FR",
  "pt-BR": "pt-BR",
  "pt-PT": "pt-PT",
  "de-DE": "de-DE",
};

/**
 * Qué cobertura hay para un locale, dada la lista de voces del sistema.
 *
 * **`misma_lengua_otra_region` no es un aprobado.** Una voz de `pt-BR` leyendo
 * texto de `pt-PT` no es un acento simpático: cambia la fonología de las
 * vocales átonas y el niño aprende a decir los números de otra manera. Se
 * devuelve como categoría propia para que quien la reciba tenga que decidir
 * qué hace, en vez de que un `||` la convierta en un sí.
 *
 * Recibe la lista ya obtenida y no llama a `getVoices()`: en varios navegadores
 * esa llamada devuelve vacío de forma asíncrona en el primer arranque, así que
 * sondear dentro de esta función produciría un falso «ninguna» justo en la
 * primera sesión — el peor momento posible. Quien la llame espera el evento
 * `voiceschanged` primero.
 */
export function coberturaDeVoz(
  vocesDelSistema: ReadonlyArray<{ lang: string }>,
  locale: Locale,
): CoberturaDeVoz {
  const pedida = ETIQUETA_DE_VOZ[locale];
  if (!pedida) return "ninguna";

  const normal = (etiqueta: string) => etiqueta.replace("_", "-").toLowerCase();
  const objetivo = normal(pedida);
  const lengua = objetivo.split("-")[0];

  let hayLengua = false;
  for (const voz of vocesDelSistema) {
    const v = normal(voz.lang ?? "");
    if (v === objetivo) return "exacta";
    if (v.split("-")[0] === lengua) hayLengua = true;
  }
  return hayLengua ? "misma_lengua_otra_region" : "ninguna";
}

// ───────────────────────────────────────────────────────────────────────────
// 4. Ningún sonido va solo
// ───────────────────────────────────────────────────────────────────────────

/**
 * Una señal audible y su equivalente visual.
 *
 * WCAG 1.2.1 y las Game Accessibility Guidelines piden que ninguna información
 * esencial vaya solo por sonido. En este producto la regla es más fuerte que la
 * letra: para un pre-lector un subtítulo no es un equivalente, así que `visual`
 * nombra una **animación**, no un texto. El bucle mudo tiene que estar completo
 * por sí solo, y con eso el niño sordo usa exactamente la misma vía — no hay
 * «modo accesible» aparte, que es el que se rompe sin que nadie lo note porque
 * nadie lo juega.
 */
export interface Senal {
  clave: string;
  regimen: Regimen;
  /** Id de la animación que dice lo mismo sin sonar. Nunca un subtítulo. */
  visual: string;
}

/** Devuelve los problemas. Vacío es verde. */
export function validarSenales(senales: ReadonlyArray<Senal>): string[] {
  const problemas: string[] = [];
  const vistas = new Set<string>();

  for (const s of senales) {
    if (!s.visual || s.visual.trim() === "") {
      problemas.push(
        `la señal \`${s.clave}\` no declara equivalente visual. Ninguna información esencial ` +
          "va solo por sonido (WCAG 1.2.1, mc-42 §10), y para un pre-lector el equivalente " +
          "tiene que ser una animación: un subtítulo cumple la letra y no sirve.",
      );
    }
    if (vistas.has(s.clave)) {
      problemas.push(`la señal \`${s.clave}\` está declarada dos veces`);
    }
    vistas.add(s.clave);

    const techo = PRESUPUESTO[s.regimen];
    if (!techo) problemas.push(`la señal \`${s.clave}\` declara un régimen desconocido`);
  }

  return problemas;
}

/**
 * A qué régimen pertenece una clave de mensaje.
 *
 * Por PREFIJO y no por lista, a propósito. Una lista de claves habladas sería
 * una segunda copia del catálogo de `i18n/reto/*.json`, y se quedaría vieja el
 * día que F5 añada una habilidad — con el síntoma más silencioso posible: una
 * clave nueva que suena en el momento equivocado, o que no suena.
 *
 * El reparto sale de `mc-42` §3: el enunciado es instrucción y suena mientras
 * el niño resuelve; el veredicto es el instante de recompensa o de error y
 * suena al resolver. La interfaz nunca suena sola.
 */
export function regimenDeClave(clave: string): Regimen | "nunca_suena_solo" {
  if (clave.startsWith("error.") || clave === "acierto" || clave === "inesperada") {
    return "al_resolver";
  }
  if (clave.startsWith("k.")) return "mientras_resuelve";
  // `juego.*`, `forma.*`, `lado.*`, `habilidad.*`: rótulos de interfaz. Se
  // pueden pronunciar si el niño toca «dilo otra vez», nunca por su cuenta.
  return "nunca_suena_solo";
}

// ───────────────────────────────────────────────────────────────────────────
// 5. Los números, que no se componen: se autoran
// ───────────────────────────────────────────────────────────────────────────

/**
 * El rango que el banco de kinder produce hoy: del cero al veintiuno, más el
 * veinticinco (plan §4.3, medido).
 */
export const RANGO_DE_NUMEROS: number[] = [...Array(22).keys(), 25];

/**
 * El nombre hablado de un número, del catálogo del locale.
 *
 * **No se compone y no se puede componer.** En alemán el veintiuno es
 * «einundzwanzig» —una sola palabra, con las unidades delante— y en francés el
 * noventa es «quatre-vingt-dix», que son tres. Una función que pegue decenas y
 * unidades produce palabras que no existen en dos de los cinco idiomas, y las
 * produce sin fallar. Por eso el catálogo es una tabla autorada y esta función
 * solo la consulta.
 *
 * Devuelve `null` fuera del rango en vez de inventar: quien llame decide si
 * calla o si usa el numeral escrito, y esa decisión no es de aquí.
 */
export function nombreDeNumero(
  catalogo: Record<string, string> | undefined,
  n: number,
): string | null {
  if (!catalogo) return null;
  const nombre = catalogo[String(n)];
  return typeof nombre === "string" && nombre.trim() !== "" ? nombre : null;
}

/** Valida el catálogo de números de los siete locales. Falla cerrado. */
export function validarNumeros(
  catalogo: Partial<Record<Locale, { numeros?: Record<string, string> }>>,
): string[] {
  const problemas: string[] = [];

  for (const locale of LOCALES) {
    const bloque = catalogo[locale];
    if (!bloque) {
      problemas.push(`falta el catálogo de números de \`${locale}\` (D-022: son siete)`);
      continue;
    }
    const numeros = bloque.numeros;
    if (!numeros || typeof numeros !== "object") {
      problemas.push(`${locale}: sin campo \`numeros\``);
      continue;
    }
    for (const n of RANGO_DE_NUMEROS) {
      const nombre = numeros[String(n)];
      if (typeof nombre !== "string" || nombre.trim() === "") {
        problemas.push(
          `${locale}: falta el nombre hablado del ${n}. Está en el rango que el banco produce, ` +
            "así que un ítem lo va a pedir y no va a sonar nada.",
        );
      }
    }
  }

  // Alemán y francés TIENEN que diferir de la composición ingenua: si el 21 de
  // `de-DE` no es una sola palabra, alguien compuso en vez de autorar.
  const de = catalogo["de-DE"]?.numeros?.["21"];
  if (de && de.trim().includes(" ")) {
    problemas.push(
      `de-DE: el veintiuno se autoró como «${de}», con espacio. En alemán es UNA palabra con ` +
        "las unidades delante («einundzwanzig»); un espacio ahí es la firma de una composición " +
        "mecánica de decenas y unidades (CLAUDE.md § Idiomas, mc-34).",
    );
  }

  return problemas;
}

// ───────────────────────────────────────────────────────────────────────────
// 6. El desbloqueo del audio, que decide cómo empieza la sesión
// ───────────────────────────────────────────────────────────────────────────

/**
 * El contrato del primer toque.
 *
 * Chrome y Safari bloquean todo audio con sonido antes de un gesto (`mc-42`
 * §9). No es un permiso que se pida: es un gesto que tiene que ocurrir. El plan
 * §4.5 lo resuelve con una elección de dos mosaicos con pictograma —bocina
 * encendida, bocina tachada—, sin una sola palabra, y ese mismo toque
 * desbloquea el `AudioContext` y dispara el buffer cebador para que el primer
 * sonido de verdad no llegue tarde.
 *
 * **No va en el onboarding.** D-026 fija registro de dos campos y «sin carrusel
 * de bienvenida»; meterle una pregunta de audio reabre una decisión cerrada.
 */
export const DESBLOQUEO = {
  /** El gesto ocurre dentro de la sesión de juego, no antes de ella. */
  donde: "primera pantalla del reto",
  /** Sin texto: el usuario no lee. */
  sinPalabras: true,
  /** Lado mínimo del mosaico, en píxeles (kinder, `mc-20`). */
  ladoMinimoPx: 88,
  /** El mismo toque ceba el `AudioContext`. */
  cebaElContexto: true,
  /** La elección se recuerda por dispositivo, no por perfil del niño. */
  memoria: "dispositivo",
} as const;

/**
 * `prefers-reduced-motion` NUNCA se reutiliza para silenciar.
 *
 * No existe `prefers-reduced-sound` en ningún navegador, así que el control de
 * sonido tiene que ser explícito. Son discapacidades distintas con necesidades
 * opuestas: alguien con baja visión puede querer MENOS movimiento y MÁS voz.
 * Atarlas convierte una preferencia de accesibilidad en la pérdida de la otra.
 */
export const REDUCED_MOTION_NO_SILENCIA = true;
