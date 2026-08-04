/**
 * El cable entre el motor del límite de pantalla y `/api/jugar` (F8 #270,
 * #271, #273).
 *
 * `packages/motor/src/limite-pantalla.ts` estaba escrito, probado, con sus
 * auditores encima… y no lo llamaba nadie, que es exactamente el bug de #311
 * otra vez: `screen_time_daily_usage` existía desde la migración 0011 sin una
 * sola ruta que la leyera, así que un niño podía jugar tres horas seguidas y
 * el límite de D-016 no existía en la práctica. Este módulo es lo que faltaba:
 * leer la fila del día, pasarla por el motor, escribir el estado nuevo,
 * componer los textos ya autorados de `i18n/limite-pantalla/`.
 *
 * **No contiene ni una fórmula** — la misma regla que `progreso.ts` se impone,
 * y por la misma razón: la tabla de decisión vive en el motor y es única
 * (`audits/limite-pantalla-motor-unico.mjs`), así que una segunda copia aquí
 * sería el sitio donde la pantalla y el motor acaban discrepando.
 *
 * ─── Dónde se consulta, y por qué esos dos puntos son seguros ─────────────
 *
 * El endpoint sirve UN ítem a la vez y el cliente solo pide el siguiente desde
 * la pantalla de veredicto. Por eso los dos momentos en que este módulo corre
 * son puntos seguros de corte **por construcción del flujo**, no por fe:
 *
 *  · **Al responder** (`limiteAlResponder`): el ítem servido acaba de ser
 *    contestado — ya no hay nada esperando respuesta de este jugador.
 *  · **Al servir** (`limiteAlServir`): todavía no se sirvió nada nuevo, y el
 *    arranque de una sesión es un punto seguro por definición (esa es la
 *    premisa entera de `decidirAlIniciar`).
 *
 * Un corte calculado aquí nunca le quita a un niño un problema de la pantalla:
 * en el peor caso (dos pestañas) la otra pestaña termina su ítem y recibe la
 * despedida DESPUÉS de contestar. D-016, textual: «Nunca corte seco a media
 * respuesta». `SesionReto.puedeCortar()` sigue existiendo para cuando aterrice
 * el cableado completo de la sesión de F3 — hoy `/api/jugar` no abre ese
 * Durable Object (residuo declarado en su propio encabezado), y abrirlo solo
 * para preguntar el punto seguro duplicaría servir/responder entero.
 *
 * ─── Los minutos: quién los mide y cuándo se cobran ───────────────────────
 *
 * Los mide el SERVIDOR, como la resta de dos sellos suyos (`updated_at` de la
 * fila contra el reloj de ahora) — nunca un tiempo que mande el cliente,
 * porque el límite que se evade cambiando el reloj del teléfono no es un
 * límite. Se cobran solo al responder: el delta va de «se sirvió el ítem» a
 * «se contestó», y el sello se renueva en cada servir y en cada responder.
 * Lo que el niño pasa leyendo el veredicto de Larry no se cobra. Un aparato
 * que se durmió con la sesión abierta tampoco cuesta más de
 * `TOPE_DE_CHECKPOINT_MIN` — el recorte es del motor, no de aquí.
 *
 * Se acumulan CON O SIN configuración (D-139): sin fila en
 * `screen_time_settings` no hay límite y `decidir()` devuelve `SEGUIR`, pero
 * la fila del día se escribe igual — el «hoy jugó X minutos» de la pantalla
 * del padre (#269) tiene dato desde antes de que el padre configure nada, y
 * el día que configure, el tope ya sabe cuánto se jugó hoy.
 *
 * ─── La línea roja #6, y por qué aquí no hay rama que escribir mal ────────
 *
 * Este módulo NO llama a la racha y no la nombra en una condición. El día ya
 * se contó en el primer ítem contestado (D-091, `registrarItem` en
 * `/api/jugar`), así que cuando el límite corta, el día lleva minutos
 * cumplido: no hay camino por el que el corte deje al niño sin su día, y por
 * eso tampoco hay rama que alguien pueda escribir mal después.
 *
 * ─── Lo que este módulo NO hace ───────────────────────────────────────────
 *
 *  · **No niega el juego por un fallo de infraestructura.** Sin base de datos
 *    o con una consulta rota devuelve `null` — misma regla que `progreso.ts`:
 *    lo que se pierde es la protección de un rato, no el reto de un niño.
 *  · **No decide qué se pinta ni cómo.** Compone textos; la interstitial, el
 *    aviso y la despedida los pinta `components/reto/Pantalla.astro`.
 *  · **No toca al adulto que practica.** Sin `child_profiles` no hay fila que
 *    leer: SERIO/JR/PRO no tienen límite y su ausencia ES la decisión (D-016).
 *  · **No formatea el «5» del aviso con `numeros.ts`.** Es una constante fija
 *    de D-016, no un dato: va horneada en el copy autorado por locale, y el
 *    criterio de #270 lo pide documentado para que nadie lo «corrija» a pasar
 *    por `formatear()` sin necesidad.
 */

import {
  decidir,
  decidirAlIniciar,
  acumular,
  marcarAvisado,
  marcarCierre,
  reiniciarDescanso,
  tieneLimite,
  usoInicial,
  diaEfectivo,
  horaLocal,
  SQL_UPSERT_USO,
  type BandaConLimite,
  type ConfiguracionDeLimite,
  type Decision,
  type MotivoDeCierre,
  type UsoDelDia,
} from "../../../../packages/motor/src/limite-pantalla.ts";
import type { Locale } from "../i18n/index.ts";
import type { Jugador } from "./progreso";

/*
 * Los siete diccionarios del límite, en el SERVIDOR — mismo argumento que los
 * del reto en `/api/jugar`: la pantalla recibe las frases ya escritas en su
 * locale y no compone nada, y un catálogo en el cliente son los siete locales
 * en un teléfono de gama baja (`mc-47` §5). El copy está autorado por locale
 * (D-022) y auditado por `audits/limite-no-rompe-el-dia.mjs` contra el léxico
 * de vergüenza: aquí solo se elige, nunca se redacta.
 */
import limiteEN from "../i18n/limite-pantalla/en.json" with { type: "json" };
import limiteESMX from "../i18n/limite-pantalla/es-MX.json" with { type: "json" };
import limiteESES from "../i18n/limite-pantalla/es-ES.json" with { type: "json" };
import limiteFRFR from "../i18n/limite-pantalla/fr-FR.json" with { type: "json" };
import limitePTBR from "../i18n/limite-pantalla/pt-BR.json" with { type: "json" };
import limitePTPT from "../i18n/limite-pantalla/pt-PT.json" with { type: "json" };
import limiteDEDE from "../i18n/limite-pantalla/de-DE.json" with { type: "json" };

const TEXTOS: Record<string, Record<string, string>> = {
  "en": limiteEN,
  "es-MX": limiteESMX,
  "es-ES": limiteESES,
  "fr-FR": limiteFRFR,
  "pt-BR": limitePTBR,
  "pt-PT": limitePTPT,
  "de-DE": limiteDEDE,
};

interface Env {
  DB?: D1Database;
}

/**
 * El locale con el que se compone, o el de respaldo.
 *
 * Se deriva del propio mapa de diccionarios —«¿tenemos textos en este
 * locale?»— y no de una segunda lista: la pregunta correcta aquí es si hay
 * copy que servir, y la respuesta la tiene `TEXTOS` y nadie más.
 */
function localeVigente(locale: string): Locale {
  return Object.prototype.hasOwnProperty.call(TEXTOS, locale) ? (locale as Locale) : "en";
}

/**
 * Lo que la pantalla recibe. **Hecho del motor + textos ya escritos**, nada
 * más: ni minutos crudos (un número de minutos en la pantalla de un niño es el
 * reloj que D-024 prohíbe en KINDER y la presión que D-045 prohíbe en el
 * puntaje), ni la hora, ni cuánto falta más allá del «5» fijo que el copy ya
 * lleva autorado.
 */
export interface AvisoDeLimite {
  readonly tipo: "AVISO" | "DESCANSO" | "CERRAR";
  /** Solo en CERRAR: por qué terminó el día. Para elegir la despedida. */
  readonly motivo?: MotivoDeCierre;
  readonly textos: {
    readonly titulo?: string;
    readonly cuerpo: string;
    readonly afuera?: string;
    /** El botón del descanso: disponible desde el primer instante (#271). */
    readonly seguir?: string;
    /**
     * Las plantillas del conteo de retos, con `{n}` sin sustituir. El número
     * lo pone la pantalla, que es quien sabe cuántos ítems se contestaron en
     * la sesión — el servidor no guarda ese conteo y no lo inventa. KINDER no
     * las recibe nunca: el niño no lee y ninguna de sus cadenas lleva cifra
     * (mc-20, D-024).
     */
    readonly retosUno?: string;
    readonly retosOtros?: string;
    /** La etiqueta del enlace de salida en la despedida. */
    readonly salir?: string;
  };
}

/** La fila del día tal como vuelve de D1: el estado del motor más su sello. */
interface FilaUso extends UsoDelDia {
  readonly updated_at: number;
}

const SQL_LEER_BANDA = "SELECT theme_band FROM child_profiles WHERE id = ?";

const SQL_LEER_CONFIG = `
SELECT daily_minutes, break_every_min, bedtime_cutoff_min, bedtime_local
FROM screen_time_settings WHERE child_profile_id = ?
`.trim();

const SQL_LEER_USO = `
SELECT local_date, minutes_used, minutes_since_break, warned_at, ended_reason, updated_at
FROM screen_time_daily_usage WHERE child_profile_id = ? AND local_date = ?
`.trim();

/** Lo que hace falta para decidir, ya leído de la base. `null` = sin límite. */
interface Contexto {
  banda: BandaConLimite;
  /** La fila de `screen_time_settings` tal cual, o `null`. La vigencia es del motor. */
  config: ConfiguracionDeLimite | null;
  uso: UsoDelDia;
  /** El sello del último checkpoint del servidor. La base del delta. */
  selladoEn: number | null;
}

/**
 * Lee la banda, la configuración y el consumo del día.
 *
 * La fila de configuración se pasa CRUDA a `decidir()`: corregir lo que traiga
 * de raro —un `daily_minutes` fuera de rango, un `bedtime_local` mal formado,
 * la ausencia de fila— es trabajo de `configuracionVigente`, que vive en el
 * motor, en un solo sitio. Resolverla aquí además sería la segunda copia.
 */
async function leerContexto(
  env: Env,
  quien: Jugador,
  dia: string,
): Promise<Contexto | null> {
  if (!env.DB || quien.esAdulto) return null;

  const [perfil, filaConfig, filaUso] = await Promise.all([
    env.DB.prepare(SQL_LEER_BANDA).bind(quien.id).first<{ theme_band: string }>(),
    env.DB.prepare(SQL_LEER_CONFIG).bind(quien.id).first<ConfiguracionDeLimite>(),
    env.DB.prepare(SQL_LEER_USO).bind(quien.id, dia).first<FilaUso>(),
  ]);

  const banda = perfil?.theme_band;
  if (banda !== "KINDER" && banda !== "PRIMARIA" && banda !== "SECUNDARIA") return null;
  if (!tieneLimite(banda)) return null;

  // La fila viaja CRUDA: la vigencia (sin fila = SIN LÍMITE, D-139; rango
  // corregido; `bedtime_cutoff_min` forzado al de la banda) la resuelve
  // `configuracionVigente` dentro de `decidir()`, en un solo sitio.
  return {
    banda,
    config: filaConfig ?? null,
    uso: filaUso ?? usoInicial(dia),
    selladoEn: filaUso?.updated_at ?? null,
  };
}

/**
 * Escribe el estado COMPLETO del día — nunca un delta.
 *
 * `SQL_UPSERT_USO` vive en el motor por la misma razón que `SQL_UPSERT_RACHA`
 * en el suyo: un solo sitio donde estas columnas se escriben, y el mismo
 * archivo que las calcula. Escribir `minutes_used = minutes_used + ?` aquí
 * haría que un reintento de la cola offline sumara dos veces los mismos
 * minutos; la suma la hace `acumular()`, que es pura.
 */
async function escribirUso(env: Env, quien: Jugador, uso: UsoDelDia, ahora: number): Promise<void> {
  if (!env.DB) return;
  await env.DB.prepare(SQL_UPSERT_USO)
    .bind(
      quien.id,
      uso.local_date,
      uso.minutes_used,
      uso.minutes_since_break,
      uso.warned_at,
      uso.ended_reason,
      ahora,
    )
    .run();
}

/**
 * Lo que cambia en la fila cuando la decisión cae. Las tres transiciones son
 * del motor y las tres son idempotentes: `warned_at` se escribe una sola vez
 * al día (#270, el caso del niño que cierra y reabre la app entre el aviso y
 * el corte), el primer motivo de cierre manda (#273: un `BEDTIME` jamás se
 * sobrescribe con `DAILY_LIMIT`), y el descanso reinicia su contador sin
 * tocar `minutes_used` — el descanso no cuenta ni a favor ni en contra (#271).
 */
function aplicarTransicion(uso: UsoDelDia, decision: Decision, ahora: number): UsoDelDia {
  switch (decision.tipo) {
    case "AVISO":
      return marcarAvisado(uso, ahora);
    case "DESCANSO":
      return reiniciarDescanso(uso);
    case "CERRAR":
      return marcarCierre(uso, decision.motivo);
    default:
      return uso;
  }
}

/**
 * De la decisión del motor a los textos de la pantalla.
 *
 * KINDER y lector se eligen AQUÍ, por banda y no por edad cronológica: es la
 * capacidad de lectura lo que cambia el copy (criterio de #270), y la banda es
 * lo único que el servidor tiene. KINDER recibe cadenas sin una sola cifra —
 * el niño no lee (mc-20) y un número en su pantalla sería además el reloj que
 * D-024 y D-045 prohíben en esa banda; `audits/limite-no-rompe-el-dia.mjs`
 * bloquea cualquier cifra en una llave `kinder`, así que la promesa se revisa
 * sola.
 *
 * `SEGUIR` no produce aviso: la ausencia de payload ES el «siga jugando».
 */
function componer(decision: Decision, banda: BandaConLimite, locale: Locale): AvisoDeLimite | null {
  const t = TEXTOS[locale] ?? TEXTOS["en"];
  const kinder = banda === "KINDER";

  switch (decision.tipo) {
    case "AVISO":
      return {
        tipo: "AVISO",
        textos: { cuerpo: kinder ? t["limite.aviso.kinder"] : t["limite.aviso.lector"] },
      };
    case "DESCANSO":
      return {
        tipo: "DESCANSO",
        textos: {
          titulo: t["limite.descanso.titulo"],
          cuerpo: t["limite.descanso.cuerpo"],
          afuera: t["limite.descanso.afuera"],
          seguir: t["limite.descanso.seguir"],
        },
      };
    case "CERRAR": {
      const nocturno = decision.motivo === "BEDTIME";
      return {
        tipo: "CERRAR",
        motivo: decision.motivo,
        textos: {
          cuerpo: nocturno
            ? (kinder ? t["limite.nocturno.kinder"] : t["limite.nocturno.lector"])
            : (kinder ? t["limite.despedida.kinder"] : t["limite.despedida.lector"]),
          ...(kinder
            ? {}
            : {
                retosUno: t["limite.despedida.retos_uno"],
                retosOtros: t["limite.despedida.retos_otros"],
              }),
          salir: t["limite.despedida.hasta_manana"],
        },
      };
    }
    default:
      return null;
  }
}

/**
 * Se va a servir un ítem: ¿se puede, o el día ya terminó?
 *
 * Es la puerta de `decidirAlIniciar` — el arranque de una sesión es un punto
 * seguro por definición, así que el corte nocturno también impide EMPEZAR de
 * madrugada y no solo cortar lo que estaba abierto (respuesta A de la
 * pregunta 1 de #265, `docs/dudas.md` §23.1).
 *
 * Además renueva el sello del checkpoint: el delta del próximo responder se
 * mide desde aquí, así que el tiempo que el niño pasa en la pantalla de
 * veredicto no se cobra.
 *
 * Devuelve el aviso listo para la pantalla, o `null` si se sigue normal. Un
 * `CERRAR` aquí significa **no servir**: el endpoint devuelve la despedida en
 * vez del ítem.
 */
export async function limiteAlServir(
  env: Env,
  quien: Jugador,
  entrada: { ahora: number; zona: string; locale: string },
): Promise<AvisoDeLimite | null> {
  if (!env.DB || quien.esAdulto) return null;
  try {
    const dia = diaEfectivo(entrada.ahora, entrada.zona);
    const contexto = await leerContexto(env, quien, dia);
    if (!contexto) return null;

    const decision = decidirAlIniciar({
      banda: contexto.banda,
      config: contexto.config,
      uso: contexto.uso,
      horaAhora: horaLocal(entrada.ahora, entrada.zona),
    });

    const despues = aplicarTransicion(contexto.uso, decision, entrada.ahora);
    await escribirUso(env, quien, despues, entrada.ahora);

    const locale = localeVigente(entrada.locale);
    return componer(decision, contexto.banda, locale);
  } catch {
    // Nunca se le niega el juego a un niño por un fallo de infraestructura —
    // la misma regla que `registrarItem`. Lo que se pierde es la protección
    // de un rato, no el reto.
    return null;
  }
}

/**
 * Se contestó un ítem: se cobran los minutos y se decide.
 *
 * El delta es el tiempo del SERVIDOR desde el último checkpoint —el servir de
 * este ítem, o el responder anterior si aquél no escribió— y lo recorta
 * `acumular()`: negativo se descarta (dos pestañas reportando fuera de orden)
 * y absurdo se recorta al tope (el aparato que se durmió con la sesión
 * abierta).
 *
 * Solo la llama el intento que CUENTA: un reintento del mismo ítem no vuelve
 * a cobrar, por la misma línea roja #8 que lo excluye del modelo y de la
 * racha — volver a intentarlo no puede costar nada.
 *
 * Devuelve el aviso listo para la pantalla, o `null` si se sigue normal. La
 * despedida viaja EN ESTA RESPUESTA, después del veredicto: el niño termina
 * de pensar su ítem y entonces se despide Larry — nunca al revés.
 */
export async function limiteAlResponder(
  env: Env,
  quien: Jugador,
  entrada: { ahora: number; zona: string; locale: string },
): Promise<AvisoDeLimite | null> {
  if (!env.DB || quien.esAdulto) return null;
  try {
    const dia = diaEfectivo(entrada.ahora, entrada.zona);
    const contexto = await leerContexto(env, quien, dia);
    if (!contexto) return null;

    const deltaMin =
      contexto.selladoEn === null ? 0 : (entrada.ahora - contexto.selladoEn) / 60_000;
    const conMinutos = acumular(contexto.uso, deltaMin);

    const decision = decidir({
      banda: contexto.banda,
      config: contexto.config,
      uso: conMinutos,
      horaAhora: horaLocal(entrada.ahora, entrada.zona),
      // El ítem servido acaba de contestarse en esta misma petición: no hay
      // nada esperando respuesta de este jugador. Es el punto seguro por
      // construcción del flujo — ver el encabezado.
      puntoSeguro: true,
    });

    const despues = aplicarTransicion(conMinutos, decision, entrada.ahora);
    await escribirUso(env, quien, despues, entrada.ahora);

    const locale = localeVigente(entrada.locale);
    return componer(decision, contexto.banda, locale);
  } catch {
    return null;
  }
}
