/**
 * `/api/jugar` — el bucle. Es lo que conecta F4 con una pantalla de verdad.
 *
 * Dos verbos y nada más:
 *
 *   · **`?accion=siguiente`** — el servidor decide qué ítem toca y lo sirve.
 *   · **`?accion=responder`** — el servidor califica, actualiza el modelo y
 *     escribe la telemetría.
 *
 * ─── Quién decide qué, y por qué está repartido así ────────────────────────
 *
 * El **selector** vive aquí, en el Worker web, porque aquí está el binding
 * `LEARNER_DO` — el modelo del niño. El **banco** vive en `math-challenge-ingest`
 * junto con la calificación, porque la respuesta correcta no debe estar en el
 * mismo sitio que la pantalla. Y las **reglas** viven en `packages/motor`, que
 * es puro y no sabe que existe la red.
 *
 * Ese reparto tiene una consecuencia buena que conviene nombrar: **este archivo
 * no contiene ni una fórmula**. Si aquí apareciera un `Math.exp`, sería una
 * segunda copia del motor, y `audits/motor-puntuacion.mjs` bloquearía el commit.
 *
 * ─── Lo que este endpoint NO hace ──────────────────────────────────────────
 *
 *  · **No manda el tiempo al cliente ni lo acepta de él.** Los dos sellos los
 *    pone `math-challenge-sesion-reto-do` (F3 #32). Aquí no se lee ningún reloj
 *    del navegador.
 *  · **No marca cuál opción es la correcta.** `presentarItem` las baraja sin
 *    bandera; el servidor califica lo que el niño tocó.
 *  · **No escribe telemetría de niño a ningún beacon** (D-037, línea roja #2).
 *    El intento va a Analytics Engine desde el Worker de ingesta, indexado por
 *    habilidad y **nunca por niño**.
 *  · **No dice nunca «vuelve mañana».** Si no hay nada vencido, sirve práctica
 *    (criterio #94, línea roja #4). Si el banco de una habilidad se agota,
 *    cambia de habilidad en vez de cerrar la sesión.
 */
import type { APIRoute } from "astro";
import {
  COOKIE_NINO,
  COOKIE_ADULTO,
  leerCookies,
  leerSesionNino,
  leerSesionAdulto,
} from "../../lib/sesiones";
import { registrarEnModelo, leerModelo, type Resumen } from "../../lib/aprendiz";
import {
  estadoInicial,
  actualizar,
  elegirSiguiente,
  kPara,
  estaUbicando,
  nivelSemilla,
  nivelDeHabilidad,
  dificultadDeNivel,
  FALLOS_ANTES_DE_BAJAR,
  type Candidato,
} from "../../../../../packages/motor/src/adaptativo.ts";
import {
  repasoInicial,
  ordenDeSesion,
  type HabilidadEnRotacion,
} from "../../../../../packages/motor/src/programador.ts";
import {
  sellarSobre,
  explicarEnLocale,
} from "../../../../../packages/motor/src/explicacion.ts";
import {
  registrarItem,
  registrarDiaPorLimite,
  textoDeXp,
  zonaDelHogar,
  type Jugador,
  type Progreso,
} from "../../lib/progreso";
import { sumarPuntosDeLiga } from "../../lib/liga-membresia";
import {
  anotarPuntoDeDuelo,
  servirItemDeDuelo,
  validarTurnoDeDuelo,
} from "../../lib/duelo-superficie";
import { limiteAlServir, limiteAlResponder } from "../../lib/limite-dia";
import { registrarAvanceDeHoy } from "../../lib/misiones-dia";
import { escribirNotaPatronInusual, escribirNotaHabilidadPausada } from "../../lib/nota-anti-trampa";
import { bancoPrimariaD1 } from "../../lib/banco-primaria";
import { bancoAdultoD1 } from "../../lib/banco-adulto";
import { isLocale, DEFAULT_LOCALE, type Locale } from "../../i18n";

/*
 * ─── Los siete diccionarios del reto, en el SERVIDOR ──────────────────────
 *
 * La explicación se compone aquí y viaja ya escrita. Las tres razones, en
 * orden de importancia:
 *
 *  1. **El sobre se sella del lado del servidor.** El navegador no compone la
 *     explicación, igual que no califica: ni siquiera recibe los quince textos
 *     de error, solo el que le tocó.
 *  2. **Un catálogo en el cliente son los siete locales en un teléfono de gama
 *     baja**, que es el dispositivo de referencia (`mc-47` §5). Es el mismo
 *     argumento por el que `Pantalla.astro` recibe `rotulos` ya resueltos.
 *  3. Una sola implementación. Componer en las dos puntas es cómo una se queda
 *     sin el arreglo de la otra.
 *
 * Son ~12 kB crudos de JSON dentro del Worker y **cero** bytes de red por
 * respuesta: el criterio #137 —«funciona offline y sin modelo»— es literal aquí,
 * porque no hay nada que llamar.
 */
import retoEN from "../../i18n/reto/en.json";
import retoESMX from "../../i18n/reto/es-MX.json";
import retoESES from "../../i18n/reto/es-ES.json";
import retoFRFR from "../../i18n/reto/fr-FR.json";
import retoPTBR from "../../i18n/reto/pt-BR.json";
import retoPTPT from "../../i18n/reto/pt-PT.json";
import retoDEDE from "../../i18n/reto/de-DE.json";

const RETO: Record<string, Record<string, unknown>> = {
  "en": retoEN,
  "es-MX": retoESMX,
  "es-ES": retoESES,
  "fr-FR": retoFRFR,
  "pt-BR": retoPTBR,
  "pt-PT": retoPTPT,
  "de-DE": retoDEDE,
};

export const prerender = false;

interface Ingest {
  catalogoAdaptativo(): Promise<Array<{ id: string; habilidad: string; nivel: number; dificultad: number; hastaNivel?: number }>>;
  presentarItem(itemId: string, locale: string): Promise<null | {
    id: string; habilidad: string; nivel: number; formato: string;
    enunciado: string; vars: Record<string, string>;
    opciones: Array<{
      valor: number | string;
      texto: string;
      /** Cómo se DIBUJA la opción cuando no es un número (#349). */
      dibujo?: { glifo: string; cuantos: number; grande: boolean };
    }>;
  }>;
  calificarContraBanco(itemId: string, eleccion: number | string): Promise<{
    acc: 0 | 1; causa: string | null; razonAlterna: string | null;
    inesperada: boolean; nivel: number; habilidad: string;
    /** La banda del ítem calificado. La ingesta no la manda: es KINDER. */
    banda?: "KINDER" | "PRIMARIA" | "SERIO";
  }>;
  recordAttempt(input: Record<string, unknown>): Promise<{ puntos: number; imposible?: boolean }>;
  iniciarSesionReto(sesionId: string, banda: "KINDER" | "PRIMARIA" | "SECUNDARIA" | "SERIO" | "JR" | "PRO"): Promise<unknown>;
  servirSesionReto(sesionId: string, item: { orden: number; itemId: string; nivel: number }): Promise<unknown>;
  medirRespuestaSesion(
    sesionId: string,
    respuesta: { orden: number; eleccion: string },
    correcta: boolean,
    contexto: { itemId: string; skillId: string; locale: string },
  ): Promise<{ rtMs: number; señalPiso: boolean; repetida: boolean }>;
  /**
   * El corte del límite de pantalla llega a la sesión de reto (F8 #404):
   * `puedeCortar()` → `cerrarPorLimite(motivo)` sobre el Durable Object. Ver
   * el comentario de `avisarCorteALaSesion` abajo — hoy `/api/jugar` no abre
   * ese DO, así que la llamada es el sitio donde el corte tocará la sesión
   * cuando el cableado de F3 aterrice aquí.
   */
  cerrarRetoPorLimite(perfilId: string, motivo: string): Promise<unknown>;
}

/**
 * Los tres verbos que el bucle necesita de un banco de ítems, venga de donde
 * venga. Hoy hay DOS orígenes (F5c #356, D-072): la ingesta, que sirve KINDER
 * desde código, y `item_bank` en D1, que sirve PRIMARIA. El endpoint elige
 * origen UNA vez por petición y el resto del camino — rotación, adaptativo,
 * modelo, telemetría — no sabe ni le importa cuál fue.
 */
type OrigenDeItems = {
  catalogoAdaptativo: Ingest["catalogoAdaptativo"];
  presentarItem: Ingest["presentarItem"];
  /**
   * `null` cuando el ítem no está en ESTE origen: el banco de primaria en D1
   * no lanza, deja que el endpoint caiga al de kinder (ver `recibirRespuesta`).
   */
  calificarContraBanco(
    itemId: string,
    eleccion: number | string,
  ): Promise<null | Awaited<ReturnType<Ingest["calificarContraBanco"]>>>;
};

interface Env {
  INGEST: Ingest;
  SESSION_KV: KVNamespace;
  LEARNER_DO?: DurableObjectNamespace;
  LEAGUE_DO?: DurableObjectNamespace;
  CLASSROOM_DO?: DurableObjectNamespace;
  // Las misiones del día (F7 #224): un objeto por niño, dueño del estado del
  // día; `lib/misiones-dia.ts` lo llama en cada ítem que cuenta.
  MISSIONS_DO?: DurableObjectNamespace;
  DB?: D1Database;
}

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Una respuesta de juego jamás se cachea: lleva el ítem de UN niño.
      "cache-control": "no-store",
    },
  });

/**
 * Cuántos huecos se planean. No es un límite de sesión: es el largo del plan del
 * que sale la habilidad de cada ítem.
 *
 * **Tiene que ser al menos tantos como habilidades haya en rotación.** Con 12
 * huecos y las 14 habilidades de F5, las dos últimas —K13 formas y K14
 * patrones— no entraban al plan **nunca**: existían en el banco, se generaban
 * sus 52 ítems, y ningún niño las iba a ver jamás. Se descubrió jugando 24
 * ítems seguidos y contando cuántas habilidades distintas salían: 12 de 14.
 *
 * No falla, no avisa, y no se ve leyendo el código: hay que contar.
 */
const HUECOS_MINIMOS = 12;

export const POST: APIRoute = async ({ request, locals, url }) => {
  const env = (locals as { runtime?: { env: Env } }).runtime?.env;
  if (!env?.INGEST) return json({ error: "sin ingesta" }, 503);

  /**
   * ─── La puerta: un NIÑO o un ADULTO que practica ──────────────────────────
   *
   * Se falla CERRADO en los dos casos. Un endpoint de juego abierto sería una
   * forma de leer el banco entero —con sus opciones— sin cuenta.
   *
   * **Por qué el adulto entra por aquí y no por un endpoint propio.** D-034 dice
   * que el caso del adulto que practica solo es el que empezó el proyecto: «un
   * adulto a veinticinco años de haber estudiado matemáticas que quiere retar su
   * propia mente». Y hay tres razones más que el dueño nombró y que ninguna
   * decisión había escrito: ver qué van a hacer sus hijos, ganar confianza de
   * que el producto es seguro antes de dárselo a un menor, y jugar por gusto.
   *
   * Ninguna de las tres necesita un motor distinto. Duplicar el endpoint sería
   * duplicar la selección, el modelo y la telemetría para servir exactamente los
   * mismos ítems — y el segundo se quedaría sin los arreglos del primero.
   *
   * **La identidad del modelo cambia y eso importa.** Para un niño el objeto del
   * Durable Object es su `child_profile_id`; para un adulto es su `userId`. Son
   * espacios de identificadores distintos —UUID contra UUID— así que no pueden
   * chocar, y el modelo de un adulto no se mezcla nunca con el de sus hijos.
   */
  const cookies = leerCookies(request.headers.get("cookie"));
  const nino = await leerSesionNino(env.SESSION_KV, cookies[COOKIE_NINO]);

  let quien: { id: string; esAdulto: boolean } | null = nino
    ? { id: nino.childProfileId, esAdulto: false }
    : null;

  if (!quien) {
    const adulto = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
    if (adulto) quien = { id: adulto.userId, esAdulto: true };
  }
  if (!quien) return json({ error: "sin_sesion" }, 401);

  /**
   * ─── La banda REAL, leída una vez (D-185) ─────────────────────────────────
   *
   * Antes esta lectura pasaba dos veces por el mismo `SELECT theme_band` —una
   * para elegir el origen del banco (nunca existía, un niño siempre caía a
   * `env.INGEST`) y otra dentro de `puedeElegirNivel()`—. Ahora se lee UNA vez
   * aquí y las dos decisiones —qué banco sirve, y si puede elegir nivel— la
   * reutilizan. Un adulto es "SERIO" siempre; un niño sin fila o sin lectura
   * posible cae a "KINDER" — ante la duda, la banda más protegida gana.
   */
  const banda = await bandaRealDe(env, quien);

  /**
   * ─── El origen de los ítems (F5c #356, D-072; F5b #159, D-034) ───────────
   *
   * Hasta el 2026-08-07 esto decía «un niño siempre juega KINDER» — y era
   * literal: `quien.esAdulto ? bancoAdultoD1 : env.INGEST` no miraba la banda
   * del niño para nada, así que un niño de PRIMARIA/SECUNDARIA recibía
   * contenido de KINDER fuera de un duelo. Se encontró verificando Modo
   * Historia (D-185) — el árbol mostraba el progreso real, pero jugar
   * hubiera servido la pregunta equivocada. Ahora el niño de PRIMARIA o
   * SECUNDARIA juega desde `item_bank` en D1 (D-072), igual que el adulto y
   * que un duelo — mismo motor para todos (D-034). Si la siembra de este
   * ambiente no corre todavía o `item_bank` está vacío, el respaldo de abajo
   * (`servirSiguiente`) cae a `env.INGEST`: nunca se le niega el juego a
   * nadie por infraestructura.
   */
  const origen: OrigenDeItems =
    quien.esAdulto && env.DB
      ? bancoAdultoD1(env.DB, RETO)
      : (banda === "PRIMARIA" || banda === "SECUNDARIA") && env.DB
        ? bancoPrimariaD1(env.DB, RETO)
        : env.INGEST;

  const accion = url.searchParams.get("accion");
  let cuerpo: Record<string, unknown>;
  try {
    cuerpo = (await request.json()) as Record<string, unknown>;
  } catch {
    cuerpo = {};
  }

  const locale = typeof cuerpo.locale === "string" ? cuerpo.locale : "en";

  /*
   * ─── El DUELO (F7 #244): el MISMO reto contra el `item_set` congelado ──────
   *
   * La pantalla manda `duelo` con el id del `league_duel` cuando la serie es
   * de un duelo. Todo lo demás sigue igual —califica el servidor, se
   * actualiza el modelo, corre la racha y la liga— porque los puntos del
   * duelo son puntos NORMALES (#237: no es un sistema paralelo). Lo único que
   * cambia es QUÉ ítem se sirve (el congelado, en orden, el mismo para los
   * dos) y que el marcador del set se anota en la fila del duelo.
   *
   * El acceso a ítems prueba primero el banco de primaria en D1 (D-072) y
   * cae a la ingesta: un NIÑO de PRIMARIA jugando un duelo recibe ítems de
   * `item_bank`, y su `origen` de siempre —la ingesta, que sirve kinder— no
   * los tiene. Es el mismo respaldo, al revés, que el del adulto de arriba.
   */
  const dueloId = typeof cuerpo.duelo === "string" ? cuerpo.duelo : null;
  const accesoDuelo = {
    presentar: async (itemId: string, loc: string) => {
      if (env.DB) {
        const item = await bancoPrimariaD1(env.DB, RETO).presentarItem(itemId, loc);
        if (item) return item;
      }
      return env.INGEST.presentarItem(itemId, loc);
    },
    calificarContraBanco: async (itemId: string, eleccion: number | string) => {
      if (env.DB) {
        const v = await bancoPrimariaD1(env.DB, RETO).calificarContraBanco(itemId, eleccion);
        if (v) return v;
      }
      return env.INGEST.calificarContraBanco(itemId, eleccion);
    },
  };

  // El año de nacimiento siembra el ítem 1 y **nada más** (D-060, criterio #88).
  // Se lee aquí, una vez, y no entra a ninguna función del motor salvo
  // `nivelSemilla`. El motor no recibe la edad ni la banda.
  const semilla = await nivelSemillaDe(env, quien.id, quien.esAdulto);

  if (accion === "siguiente") {
    return servirSiguiente(env, quien, locale, semilla, banda, cuerpo, origen, dueloId, accesoDuelo.presentar);
  }
  if (accion === "responder") {
    return recibirRespuesta(env, quien, locale, semilla, cuerpo, origen, dueloId, accesoDuelo.calificarContraBanco);
  }
  return json({ error: "accion_desconocida" }, 400);
};

/**
 * De dónde sale el nivel del ítem 1.
 *
 * `birth_year` puede ser 0 —«no se preguntó», porque el adulto pudo saltarse el
 * paso y el niño practica igual (línea roja #4)— y `nivelSemilla` ya trata ese
 * caso. Sin base de datos también se arranca: **nunca se le niega el juego a un
 * niño por un fallo de infraestructura.**
 */
async function nivelSemillaDe(env: Env, childProfileId: string, esAdulto = false): Promise<number> {
  /*
    Un adulto no tiene fila en `child_profiles` y **no se le pregunta la edad**:
    la cuenta no la guarda y preguntarla para sembrar un ítem sería pedir un dato
    personal por una decisión que el motor corrige en tres respuestas (D-060,
    criterio #88). Arranca donde arranca «no se preguntó».
  */
  if (esAdulto) return nivelSemilla(0, new Date().getUTCFullYear());
  if (!env.DB) return nivelSemilla(0, new Date().getUTCFullYear());
  try {
    const fila = await env.DB.prepare("SELECT birth_year FROM child_profiles WHERE id = ?")
      .bind(childProfileId)
      .first<{ birth_year: number }>();
    return nivelSemilla(fila?.birth_year ?? 0, new Date().getUTCFullYear());
  } catch {
    return nivelSemilla(0, new Date().getUTCFullYear());
  }
}

/**
 * ─── El nivel elegido por la PERSONA (enmienda de D-017, ver decisions.md) ──
 *
 * D-017 seguía diciendo «el mapa presenta lugares, no pregunta niveles» — la
 * materia sí se elige (arriba, `lugarPedido`), la dificultad la elegía siempre
 * el motor. El dueño pidió otra vez, con nombre, poder elegir también el
 * nivel — y esta vez la respuesta no es la misma para todas las bandas.
 *
 * **KINDER nunca.** `mc-10` mide que ver la propia dificultad empeora el
 * desempeño en matemáticas, y a los 4-6 años ni siquiera hay con qué
 * interpretar «difícil» como una elección informada — es la misma razón por
 * la que D-002 separa edad de dificultad. `audits/mapa-sin-numero-de-nivel.mjs`
 * ya vigila que ninguna superficie de kinder interpole un nivel; esto no le
 * abre una puerta nueva porque kinder nunca llega a `NIVEL_FIJO_A_ESCALON`.
 *
 * **SERIO (adulto) y PRIMARIA sí.** Un adulto ya decide por sí mismo qué tan
 * difícil quiere su práctica, y PRIMARIA (7-11) ya lee y ya puede sostener la
 * idea de «esto va a estar más difícil a propósito» sin que sea un examen.
 *
 * Las tres opciones son CUALITATIVAS y no un número de escalón — ni una
 * calificación ni un grado escolar (D-017 sigue viva en esa parte): se
 * traducen a un escalón fijo de la escalera de `dificultadDeNivel()` y de ahí
 * a un theta, nunca al revés.
 */
const NIVEL_FIJO_A_ESCALON: Record<string, number> = { facil: 2, medio: 6, dificil: 10 };

type Banda = "KINDER" | "PRIMARIA" | "SECUNDARIA" | "SERIO";

/**
 * La banda REAL de quien juega — nunca un supuesto (D-185). Un adulto es
 * "SERIO" siempre. Un niño sin fila, sin base de datos o con la lectura
 * fallida cae a "KINDER": ante la duda, la banda más protegida gana, la
 * misma regla que ya usaba `puedeElegirNivel` antes de fusionarse con esta
 * función.
 *
 * Se lee UNA vez por petición y decide DOS cosas que antes se resolvían por
 * separado con dos lecturas de D1: qué banco de ítems sirve (`origen`, en el
 * handler principal) y si la persona puede fijar su propio nivel
 * (`puedeElegirNivel` más abajo, ahora una función pura sobre este valor).
 */
async function bandaRealDe(env: Env, quien: Jugador): Promise<Banda> {
  if (quien.esAdulto) return "SERIO";
  if (!env.DB) return "KINDER";
  try {
    const fila = await env.DB.prepare("SELECT theme_band FROM child_profiles WHERE id = ?")
      .bind(quien.id)
      .first<{ theme_band: string }>();
    if (fila?.theme_band === "PRIMARIA" || fila?.theme_band === "SECUNDARIA") return fila.theme_band;
    return "KINDER";
  } catch {
    return "KINDER";
  }
}

/**
 * ¿Puede ESTE jugador fijar su propio nivel? Un adulto, siempre. Un niño,
 * solo si su banda real es PRIMARIA o SECUNDARIA — nunca KINDER. Pura sobre
 * `bandaRealDe()`: ya no repite la lectura de D1.
 */
function puedeElegirNivel(banda: Banda): boolean {
  return banda === "SERIO" || banda === "PRIMARIA" || banda === "SECUNDARIA";
}

/**
 * El estado del motor para una habilidad, reconstruido desde el resumen del DO.
 *
 * Se reconstruye con la estimación CRUDA en logits, no con el nivel redondeado.
 * La primera versión usaba `estadoInicial(fila.nivel)` y estaba mal por dos
 * motivos que se ven en cuanto se juega: el redondeo a escalón pierde hasta
 * medio escalón en cada ida y vuelta —así que la estimación camina sola sin que
 * el niño haga nada— y `respondidos` volvía a cero, así que `kPara()` devolvía
 * K de arranque para siempre y el modelo nunca se asentaba.
 *
 * `ultimosNiveles` sí se pierde, y eso solo afecta a la parada temprana: la
 * ubicación puede cerrarse por el tope de 15 en vez de por estabilidad. Es un
 * residuo conocido, no una omisión.
 */
function estadoDe(resumen: Resumen[], skillId: string, semilla: number) {
  const fila = resumen.find((r) => r.skillId === skillId);
  if (!fila) return { estado: estadoInicial(semilla), ubicando: true };
  return {
    estado: {
      habilidad: fila.habilidad,
      respondidos: fila.respondidos,
      fallosSeguidos: fila.fallosSeguidos ?? 0,
      ultimosNiveles: [],
    },
    ubicando: fila.ubicando,
  };
}

/**
 * El corte, dicho también a la sesión de reto de F3 (F8 #404).
 *
 * El corte real se enforcea con el estado de `screen_time_daily_usage` — vive
 * en D1, así que sobrevive a cerrar y reabrir la app (`lib/limite-dia.ts`).
 * Esta llamada es el OTRO extremo del diseño del plan (§8.1): el RPC
 * `puedeCortar()` → `cerrarPorLimite(motivo)` del Durable Object de sesión
 * tenía cero llamadores, que es el patrón «código correcto que ninguna ruta
 * alcanza» para el que existe `audits/funcion-sin-llamar.mjs`.
 *
 * Honestidad de alcance, dicha aquí y en el PR: **hoy `/api/jugar` no abre
 * ese DO** (residuo declarado desde F4: servir/responder viven en esta ruta,
 * no en la sesión), así que el DO no tiene estado que cerrar y el RPC
 * contesta `cerrada: false`. La llamada se hace igual, por dos razones: el
 * patrón de corte queda cableado en la ruta de verdad —el día que esta ruta
 * abra la sesión de F3 bajo el mismo nombre (`idFromName(childProfileId)`),
 * el corte la cerrará sin tocar este archivo—, y el RPC deja de ser código
 * inalcanzable. Lo que NO se hace: abrir la sesión aquí solo para cerrarla,
 * que duplicaría servir/responder enteros.
 *
 * Best effort, como la telemetría: si el RPC falla, el corte ya viaja en la
 * respuesta y está escrito en D1. Nunca se le niega la despedida a un niño
 * por un Durable Object.
 */
async function avisarCorteALaSesion(env: Env, quien: Jugador, motivo: string): Promise<void> {
  try {
    await env.INGEST.cerrarRetoPorLimite(quien.id, motivo);
  } catch {
    // Silencio a propósito: el corte no depende de esta llamada.
  }
}

async function servirSiguiente(
  env: Env,
  quien: Jugador,
  locale: string,
  semilla: number,
  banda: Banda,
  cuerpo: Record<string, unknown>,
  origen: OrigenDeItems,
  dueloId: string | null,
  presentarDuelo: (itemId: string, locale: string) => Promise<unknown | null>,
): Promise<Response> {
  const childProfileId = quien.id;
  /**
   * Mundo Kinder multi-bioma: qué mundo está jugando este reto — solo tiene
   * sentido en KINDER (D-190; PRIMARIA/SECUNDARIA no mandan esto). Sin
   * `bioma` en el cuerpo, `leerModelo`/`registrarEnModelo` caen en
   * `BIOMA_DEFECTO` dentro de `aprendiz.ts` — este endpoint no inventa un
   * valor, solo lo deja pasar si vino.
   */
  const bioma = typeof cuerpo.bioma === "string" ? cuerpo.bioma : undefined;

  /**
   * ─── El límite de pantalla, ANTES de servir (F8 #270, #271, #273) ────────
   *
   * Todavía no se sirvió nada nuevo, así que este es un punto seguro por
   * definición — la premisa entera de `decidirAlIniciar`. Si la decisión es
   * CERRAR (el día llegó a su tope, o la hora cayó en la ventana nocturna) NO
   * se sirve ítem: la respuesta es la despedida de Larry y nada más. Que el
   * estado viva en `screen_time_daily_usage` y no en la sesión es lo que hace
   * que el corte sobreviva a cerrar y reabrir la app.
   *
   * Un AVISO o un DESCANSO no impiden servir: viajan JUNTO al ítem y la
   * pantalla los muestra sin interrumpirlo.
   */
  const limite = await limiteAlServir(env, quien, {
    ahora: Date.now(),
    zona: await zonaDelHogar(env, quien),
    locale,
  });
  if (limite?.tipo === "CERRAR") {
    await avisarCorteALaSesion(env, quien, limite.motivo ?? "DAILY_LIMIT");
    /*
     * Aquí NO se llama a `registrarDiaPorLimite`, a propósito: el día se
     * cuenta en el PRIMER ítem contestado (D-091) y un corte al servir llega
     * antes de cualquier ítem — registrarlo convertiría «abrió la app a la
     * 1 a.m. y lo despidieron» en un día de racha, que es justo lo que D-091
     * vino a impedir. Si el niño ya jugó hoy, el día ya está contado de
     * todas formas y la racha no depende de nada de lo que pase aquí.
     */
    return json({ ok: true, corte: limite });
  }

  /*
   * El duelo (F7 #244): se sirve el `item_set` congelado en orden, validado
   * del lado del servidor (participante, ventana, turno). `fin` no es un
   * error: es el set terminado, el duelo resuelto o la ventana cerrada — la
   * pantalla vuelve a la liga, que es donde vive el resultado. El límite de
   * pantalla ya se aplicó arriba, igual que en cualquier reto.
   */
  if (dueloId) {
    const d = await servirItemDeDuelo(env, quien, dueloId, locale, presentarDuelo, Date.now());
    if (d.estado === "fin") return json({ ok: true, fin: true });
    if (d.estado === "error") {
      return json({ error: d.motivo }, d.motivo === "item_desconocido" ? 500 : 409);
    }
    return json({
      ok: true,
      item: d.item,
      limite: limite ?? undefined,
      duelo: { hechos: d.hechos, total: d.total },
    });
  }

  const [catalogoCrudo, resumen] = await Promise.all([
    origen.catalogoAdaptativo(),
    leerModelo(env.LEARNER_DO, childProfileId, bioma),
  ]);

  let catalogo = catalogoCrudo;

  /**
   * El respaldo del adulto: si los bancos de D1 de ESTE ambiente están vacíos
   * — la migración 0016 está aplicada pero ni la siembra SERIO ni la de
   * primaria corrieron todavía (`bancoAdultoD1` ya cayó a primaria y ésta
   * también devolvió cero) — el adulto juega kinder como venía haciendo, en
   * vez de encontrarse un `banco_vacio`. Un ítem por debajo de su nivel es
   * infinitamente mejor que ningún ítem (línea roja #4 en espíritu).
   */
  if (catalogo.length === 0 && origen !== env.INGEST) {
    origen = env.INGEST;
    catalogo = await origen.catalogoAdaptativo();
  }

  /**
   * El modelo que se APAGA por nivel (#354, reversión de la pericia de
   * Kalyuga, mc-04). El ejemplo resuelto con un paso en blanco enseña al
   * principiante y estorba al que ya sabe, así que su fila de D1 declara
   * `hasta_nivel` y aquí deja de existir para quien el motor ya ubica por
   * encima. El techo viaja por fila y no por plantilla precisamente para que
   * curarlo no sea un despliegue (D-072).
   */
  catalogo = catalogo.filter((c) => {
    if (c.hastaNivel == null) return true;
    const { estado } = estadoDe(resumen, c.habilidad, semilla);
    return nivelDeHabilidad(estado.habilidad) <= c.hastaNivel;
  });

  const habilidades = [...new Set(catalogo.map((c) => c.habilidad))].sort();
  if (habilidades.length === 0) return json({ error: "banco_vacio" }, 503);

  // ─── Qué habilidad toca: el programador decide, intercalando ─────────────
  const rotacion: HabilidadEnRotacion[] = habilidades.map((skillId) => {
    const fila = resumen.find((r) => r.skillId === skillId);
    return {
      skillId,
      estado: {
        ...repasoInicial(),
        // Solo hacen falta los dos campos que `vencidas()` mira. El resto del
        // estado de repaso vive en el DO y no viaja: traerlo entero solo para
        // ordenar la sesión sería copiar el modelo fuera del objeto.
        venceEn: fila?.venceEn ?? null,
        intentos: fila ? 1 : 0,
      },
    };
  });

  const plan = ordenDeSesion(rotacion, Date.now(), Math.max(HUECOS_MINIMOS, rotacion.length));

  // ─── De dónde sale la POSICIÓN dentro del plan ───────────────────────────
  //
  // Aquí estaba el error que se vio jugando y no leyendo: se servía `plan[0]`.
  // Como el plan se recalcula en cada petición, `plan[0]` es siempre la misma
  // habilidad, así que el intercalado existía en el módulo y **no llegaba al
  // niño**: diez ítems seguidos de K01. Es exactamente el fallo que `mc-05`
  // describe —el bloque sale solo— cometido en la costura entre dos piezas que
  // por separado estaban bien.
  //
  // La posición sale de cuántos ítems lleva respondidos el niño EN TOTAL, que es
  // un número que el modelo ya tiene. No hace falta guardar nada nuevo y no
  // depende de que el cliente diga la verdad.
  const respondidosEnTotal = resumen.reduce((n, r) => n + r.respondidos, 0);

  /*
   * ─── Rejugar un lugar del mapa (D-152) ───────────────────────────────────
   *
   * El niño tocó un lugar de la Sabana y la pantalla manda su id. Si es una
   * habilidad del banco, la serie es de ESE tema en vez de la rotación
   * intercalada — es la única desviación, y es la que el dueño pidió con
   * nombre: «poder tener retos de todos los niveles y poder seleccionarlos».
   *
   * Lo que NO cambia, a propósito: la dificultad la sigue eligiendo el motor
   * adaptativo dentro de la habilidad (D-017 — el mapa presenta lugares, no
   * pregunta niveles), el límite de pantalla se aplicó igual unas líneas más
   * arriba, y un id que no está en el banco se ignora y se cae al plan de
   * siempre — nunca se le niega el juego a un niño por una URL tocada.
   */
  const lugarPedido =
    typeof cuerpo.habilidad === "string" && habilidades.includes(cuerpo.habilidad)
      ? cuerpo.habilidad
      : null;

  const skillId =
    lugarPedido ?? (plan.length > 0 ? plan[respondidosEnTotal % plan.length] : habilidades[0]);

  // ─── Qué ítem de esa habilidad: el motor adaptativo ──────────────────────
  const { estado } = estadoDe(resumen, skillId, semilla);
  const candidatos: Candidato[] = catalogo
    .filter((c) => c.habilidad === skillId)
    .map((c) => ({ id: c.id, dificultad: c.dificultad }));

  // ─── Lo que NO se repite, y hasta dónde llega esa promesa ────────────────
  //
  // El cliente manda el ítem que acaba de contestar y el servidor no lo vuelve a
  // servir. Es una PISTA, no una garantía: un cliente que no lo mande recibirá
  // repeticiones. Se acepta a propósito porque el peor caso es ver dos veces el
  // mismo dibujo, no un fallo de seguridad — y porque la alternativa correcta ya
  // existe y no es ésta.
  //
  // **La garantía de verdad del criterio #90 —ningún ítem repetido en toda la
  // sesión— vive en `math-challenge-sesion-reto-do`**, que F3 ya construyó y que
  // este endpoint todavía no abre. Está dicho en el PR como residuo conocido: la
  // pieza que falta es abrir esa sesión aquí, no cambiar el motor.
  const evitar = new Set(typeof cuerpo.ultimoItemId === "string" ? [cuerpo.ultimoItemId] : []);

  /*
   * El nivel elegido por la persona (enmienda de D-017 — ver `puedeElegirNivel`
   * y `decisions.md`). `banda` ya se leyó una vez en el handler principal —
   * ver `bandaRealDe()` — así que esto es una función pura, sin otra lectura
   * a D1.
   */
  const nivelPedido = typeof cuerpo.nivel === "string" ? cuerpo.nivel : null;
  const escalonPedido = nivelPedido ? NIVEL_FIJO_A_ESCALON[nivelPedido] : undefined;
  const thetaFija =
    escalonPedido !== undefined && puedeElegirNivel(banda) ? dificultadDeNivel(escalonPedido) : undefined;

  const elegido = elegirSiguiente(candidatos, estado, evitar, Math.random, thetaFija);
  if (!elegido) return json({ error: "sin_items" }, 503);

  const item = await origen.presentarItem(elegido.id, locale);
  if (!item) return json({ error: "item_desconocido" }, 500);

  const retoSesionId = typeof cuerpo.retoSesionId === "string" && /^[A-Za-z0-9_-]{16,96}$/.test(cuerpo.retoSesionId)
    ? cuerpo.retoSesionId
    : crypto.randomUUID();
  const orden = respondidosEnTotal;
  try {
    /*
     * Antes decía `quien.esAdulto ? "SERIO" : "KINDER"` — un niño de
     * PRIMARIA/SECUNDARIA se registraba como sesión KINDER en la ingesta
     * (D-185). `banda` ya es la real; el duelo sigue fijo en "PRIMARIA" a
     * propósito (D-081: KINDER no duela nunca, así que un duelo siempre es
     * de esa banda o más, y el set congelado siempre sale de `item_bank`).
     */
    const bandaSesion = dueloId ? "PRIMARIA" : banda;
    await env.INGEST.iniciarSesionReto(retoSesionId, bandaSesion);
    await env.INGEST.servirSesionReto(retoSesionId, { orden, itemId: item.id, nivel: item.nivel });
  } catch {
    // La sesión mide y deduplica; si falla, el flujo pedagógico no se bloquea.
  }

  return json({
    ok: true,
    item,
    retoSesionId,
    // El aviso o el descanso, si tocan: la pantalla los muestra sobre el ítem
    // ya servido. `undefined` cuando no hay nada que decir — la ausencia ES el
    // «siga jugando».
    limite: limite ?? undefined,
    // Lo que el cliente necesita para devolver el intento sin que el servidor
    // tenga que volver a calcularlo. Ninguno de estos campos revela la
    // respuesta correcta.
    contexto: {
      skillId,
      orden,
      dificultad: elegido.dificultad,
      habilidadAntes: estado.habilidad,
      ubicando: estaUbicando(estado),
      kUsado: kPara(estado.respondidos, estaUbicando(estado)),
    },
  });
}

async function recibirRespuesta(
  env: Env,
  quien: Jugador,
  locale: string,
  semilla: number,
  cuerpo: Record<string, unknown>,
  origen: OrigenDeItems,
  dueloId: string | null,
  calificarDuelo: (
    itemId: string,
    eleccion: number | string,
  ) => Promise<null | Awaited<ReturnType<Ingest["calificarContraBanco"]>>>,
): Promise<Response> {
  const childProfileId = quien.id;
  // Mundo Kinder multi-bioma — ver el comentario gemelo en `servirSiguiente()`.
  const bioma = typeof cuerpo.bioma === "string" ? cuerpo.bioma : undefined;
  const itemId = typeof cuerpo.itemId === "string" ? cuerpo.itemId : null;
  const eleccion = cuerpo.eleccion;
  if (!itemId) return json({ error: "falta_itemId" }, 400);
  if (typeof eleccion !== "string" && typeof eleccion !== "number") {
    return json({ error: "eleccion_invalida" }, 400);
  }
  // Un niño toca un botón, no escribe un ensayo. La línea roja #3 hecha límite
  // de bytes y no solo de intención.
  if (typeof eleccion === "string" && eleccion.length > 32) {
    return json({ error: "eleccion_larga" }, 400);
  }

  /**
   * ─── El segundo intento sobre el MISMO ítem (línea roja #8, #348) ────────
   *
   * Hasta hoy, un toque y el ítem quedaba juzgado: la pantalla solo ofrecía
   * «Siguiente» y «Ya terminé». La pregunta literal del dueño jugando fue «¿y
   * puedo volverlo a hacer?», y la respuesta era no. No es que se penalizara
   * corregir — es que corregir no existía.
   *
   * Se arregla en dos sitios distintos, y conviene no confundirlos:
   *
   *  1. **Antes de confirmar.** La pantalla ya no manda al tocar: se elige, se
   *     cambia de opinión las veces que haga falta y se confirma. Eso es la
   *     línea roja #8 literal —`mc-30`: cambiar una respuesta mejora la
   *     calificación el 79% de las veces— y **no toca este archivo**, porque
   *     lo que nunca se mandó no se puede penalizar. Es la razón de que el
   *     Durable Object no tenga campo donde escribir cuántas veces alguien
   *     cambió de opinión.
   *
   *  2. **Después de un veredicto.** Volver a intentar el mismo ítem llega
   *     aquí con `reintento: true`. Se califica y se devuelve la
   *     retroalimentación —que es de lo que se aprende— y **no se vuelve a
   *     registrar en el modelo ni en la telemetría**.
   *
   * Por qué el reintento no cuenta, dicho de frente porque es discutible: la
   * medida es el primer intento, y sumar el segundo mediría cuántas veces se
   * puede repetir hasta acertar, no la habilidad. Lo que esta asimetría
   * garantiza es lo que la línea roja pide de verdad: **volver a intentarlo no
   * puede bajar el resultado**, porque no lo toca. Lo que compra el camino 1 es
   * que sí pueda subirlo.
   */
  const reintento = cuerpo.reintento === true;
  const retoSesionId = typeof cuerpo.retoSesionId === "string" && cuerpo.retoSesionId.length <= 96
    ? cuerpo.retoSesionId
    : null;
  const orden = Number.isInteger(cuerpo.orden) ? Number(cuerpo.orden) : null;

  /*
   * El turno del duelo se valida ANTES de juzgar el ítem (F7 #244): si no
   * es el que toca del set congelado —o el duelo ya no está vivo— no se
   * juzga ni entra al modelo. Un reintento no se valida: repite un ítem ya
   * contado y, como en el reto normal, no mueve nada.
   */
  if (dueloId && !reintento) {
    const turno = await validarTurnoDeDuelo(env, quien, dueloId, itemId, Date.now());
    if (turno.ok === false) return json({ error: turno.motivo }, 409);
  }

  // ─── El servidor califica. Siempre. ──────────────────────────────────────
  //
  // Si el ítem no está en el origen elegido, se prueba el otro antes de
  // rendirse: es el caso del adulto al que `servirSiguiente` le sirvió kinder
  // de respaldo porque la siembra de primaria no corre en este ambiente. La
  // ingesta conserva su comportamiento de siempre — ítem desconocido, error.
  // En duelo el orden se invierte —primaria primero, ingesta de respaldo—
  // porque el set congelado sale del banco de primaria (D-072) y quien juega
  // puede ser un niño, cuyo `origen` habitual es la ingesta.
  const veredicto = dueloId
    ? await calificarDuelo(itemId, eleccion)
    : ((await origen.calificarContraBanco(itemId, eleccion)) ??
      (await env.INGEST.calificarContraBanco(itemId, eleccion)));
  if (!veredicto) return json({ error: "item_desconocido" }, 500);

  const resumen = await leerModelo(env.LEARNER_DO, childProfileId, bioma);
  const { estado } = estadoDe(resumen, veredicto.habilidad, semilla);
  const dificultad = dificultadDeNivel(veredicto.nivel);
  const correcto = veredicto.acc === 1;

  let tiempoServidor = 0;
  let señalPiso = false;
  if (!reintento && retoSesionId && orden !== null) {
    try {
      const medido = await env.INGEST.medirRespuestaSesion(
        retoSesionId,
        { orden, eleccion: String(eleccion) },
        correcto,
        { itemId, skillId: veredicto.habilidad, locale },
      );
      tiempoServidor = medido.rtMs;
      señalPiso = medido.señalPiso;
    } catch {
      // La sesión es una mejora de medición; si falla, el juego conserva su camino seguro.
    }
  }

  const kUsado = kPara(estado.respondidos, estaUbicando(estado));
  const despues = actualizar(estado, { dificultad, correcto, nivel: veredicto.nivel });
  const disparaDescensoLateral =
    !reintento &&
    !correcto &&
    estado.fallosSeguidos < FALLOS_ANTES_DE_BAJAR &&
    despues.fallosSeguidos >= FALLOS_ANTES_DE_BAJAR;

  // ─── El modelo ───────────────────────────────────────────────────────────
  //
  // El DO recibe la respuesta FINAL y nada más. No hay campo donde escribir
  // cuántas veces el niño cambió de opinión, y esa imposibilidad es la línea
  // roja #8 (`mc-30`: corregir mejora la calificación el 79% de las veces).
  const modelo = reintento
    ? null
    : await registrarEnModelo(env.LEARNER_DO, childProfileId, {
        skillId: veredicto.habilidad,
        dificultad,
        nivel: veredicto.nivel,
        correcto,
        ahora: Date.now(),
        banda: veredicto.banda ?? "KINDER",
        nivelSemilla: semilla,
        bioma,
      });

  // ─── La telemetría, con los campos de arranque en frío (criterio #101) ───
  //
  // Se manda sin esperar: si Analytics Engine tarda, el niño no debe ver una
  // pantalla quieta. Lo que se pierde si falla es una fila de recalibración, no
  // el juego.
  //
  // Y un reintento tampoco escribe aquí. Una fila de recalibración por cada
  // vez que alguien vuelve a mirar el mismo ítem haría que el Elo del ítem
  // bajara por ser el ítem que invita a reintentar, que es lo contrario de lo
  // que ese número mide.
  //
  // Los `puntos` que devuelve —ya calculados en la ingesta con la fórmula de
  // D-010 (F3)— se capturan para la liga (F7): son los puntos del tablero, y
  // hasta hoy se descartaban.
  let puntosCalificados: number | null = null;
  try {
    if (!reintento) {
      const telemetria = await env.INGEST.recordAttempt({
        childProfileId,
        itemId,
        skillId: veredicto.habilidad,
        correct: veredicto.acc,
        level: veredicto.nivel,
        // KINDER no se cronometra (D-024) y PRIMARIA todavía tampoco: el sello
        // de tiempo del servidor es del Durable Object de sesión de reto, que
        // este endpoint todavía no abre (residuo ya declarado). Se manda 0 y,
        // en una banda que puntúa con tiempo, la ingesta lo marca `piso` —
        // dato honesto, no tiempo medido. Poner aquí un tiempo del cliente
        // sería exactamente lo que F3 prohíbe.
        responseTimeMs: tiempoServidor,
        themeBand: veredicto.banda ?? "KINDER",
        locale,
        authoredDifficulty: undefined,
        itemEloBefore: dificultad,
        itemEloAfter: dificultad,
        learnerBefore: estado.habilidad,
        learnerAfter: despues.habilidad,
        kUsed: kUsado,
        indexInSession: undefined,
        // «mapa» cuando el ítem viene del rejuego de un lugar (D-152): el id que
        // manda la pantalla coincide con la habilidad real del ítem calificado.
        // Sin la etiqueta, una serie por lugar se contaría como selección
        // adaptativa y ensuciaría la recalibración del selector.
        selectionMode: cuerpo.habilidad === veredicto.habilidad ? "mapa" : "adaptativo",
        antiTrampaSignal: señalPiso,
      });
      puntosCalificados =
        typeof telemetria?.puntos === "number" && Number.isFinite(telemetria.puntos)
          ? telemetria.puntos
          : null;

      if (telemetria?.imposible && !quien.esAdulto && env.DB) {
        await escribirNotaPatronInusual(env.DB, childProfileId, Date.now());
      }
    }
  } catch {
    // Silencio a propósito: la telemetría nunca interrumpe a un niño.
  }
  // La nota diagnóstica no depende de Analytics Engine: es un contrato D1
  // padre→F8 y debe persistir aunque la telemetría falle.
  if (disparaDescensoLateral && !quien.esAdulto && env.DB) {
    try {
      await escribirNotaHabilidadPausada(env.DB, childProfileId, veredicto.habilidad, Date.now());
    } catch {
      // El juego sigue; la telemetría y la nota son mejoras no bloqueantes.
    }
  }

  /*
   * ─── La racha y el XP (F7 #201, #192, #206, #219) ────────────────────────
   *
   * Los dos motores existían, estaban probados, tenían cuatro auditores
   * vigilándolos y **no los llamaba nadie**. Ésta es la llamada.
   *
   * Va DESPUÉS de la telemetría y ANTES del veredicto por dos razones que no son
   * de estilo: se espera —a diferencia de la telemetría— porque el número viaja
   * en esta misma respuesta y una segunda petición para pintar la racha sería
   * una petición de red por ítem en un teléfono de gama baja (`mc-47` §5); y no
   * puede fallar hacia afuera, porque `registrarItem` devuelve `null` en vez de
   * lanzar y el reto continúa sin contador.
   *
   * **La línea roja #6, dicha donde ocurre:** el día se cuenta AQUÍ, en el
   * primer ítem contestado, no al cerrar el reto. Cuando el límite de pantalla
   * corte una sesión (F8), el día llevará minutos cumplido — no hay camino por
   * el que el límite rompa la racha, así que tampoco hay rama que escribir mal.
   *
   * Un reintento del mismo ítem no pasa por aquí: ya contó una vez, y volver a
   * intentarlo no puede subir ni bajar nada (línea roja #8, #348).
   */
  let progreso: Progreso | null = null;
  let limite: Awaited<ReturnType<typeof limiteAlResponder>> = null;
  let avanceDuelo: Awaited<ReturnType<typeof anotarPuntoDeDuelo>> | null = null;
  if (!reintento) {
    const zona = await zonaDelHogar(env, quien);
    const registro = await registrarItem(env, quien, {
      nivel: veredicto.nivel,
      acc: veredicto.acc,
      // El otro motivo (`LIMITE_DE_PANTALLA_CORTO_LA_SESION`) lo produce el
      // corte de F8 y entra por `registrarDiaPorLimite`, abajo — el día ya
      // está contado para entonces (D-091). Ninguno cambia el estado que sale
      // del motor: `registrarDia` lo garantiza y
      // `audits/racha-limite-no-rompe.mjs` lo mide sobre 1 620 estados.
      motivo: { tipo: "RETO_COMPLETADO" },
      ahora: Date.now(),
      zona,
    });
    progreso = registro?.progreso ?? null;

    /*
     * Las misiones del día (F7 · #211). Misma forma que la racha: el motor
     * calcula el estado completo, el cable decide por referencia qué se
     * escribe, y si algo falla se pierde un contador y no el juego — la
     * función no lanza.
     *
     * Solo cuando el intento CUENTA: un reintento del mismo ítem no puede
     * subir el progreso de una misión, por la misma línea roja #8 que lo
     * excluye del modelo y de la racha.
     *
     * Qué tipos mueve un ítem confirmado —`volumen` y `variedad` hoy— está
     * dicho en el encabezado de `lib/misiones-dia.ts`, con sus D-PENDIENTE.
     */
    await registrarAvanceDeHoy(env, quien, {
      habilidad: veredicto.habilidad,
      ahora: Date.now(),
    });

    /*
     * La liga (F7 · #237, #242). Los puntos son los que la ingesta ya calculó
     * con la fórmula de D-010 (F3) —capturados arriba de la respuesta de
     * telemetría, que era quien los recibía y los descartaba—; el día local y
     * si es día nuevo salen del registro de arriba (D-091), y la racha viaja
     * ya calculada, de solo lectura (D-106). **Falla abierto**: si la liga no
     * responde, se pierde la posición de la semana, nunca el juego. Solo
     * cuando el intento CUENTA y hay registro: un reintento no suma, por la
     * misma línea roja #8.
     */
    if (registro && puntosCalificados !== null) {
      await sumarPuntosDeLiga(env, quien, {
        puntos: puntosCalificados,
        diaLocal: registro.diaLocal,
        diaNuevo: registro.diaNuevo,
        racha: registro.progreso.racha.actual,
        ahora: Date.now(),
      });
    }

    /*
     * El marcador del duelo (F7 #244). Va DESPUÉS de la liga a propósito: los
     * puntos ya sumaron al total semanal normal por el cable de siempre, y
     * aquí solo se anotan en la fila del duelo — la misma cifra, calculada
     * por la ingesta con la fórmula de D-010, ninguna fórmula nueva. Falla
     * abierto igual que la liga: si no se puede anotar, lo que se pierde es
     * el marcador del set, nunca el juego. Un reintento no pasa por aquí.
     */
    if (dueloId) {
      avanceDuelo = await anotarPuntoDeDuelo(
        env,
        quien,
        dueloId,
        itemId,
        puntosCalificados ?? 0,
        Date.now(),
      );
    }

    /*
     * El límite de pantalla (F8 #270, #271, #273). Va DESPUÉS de la racha a
     * propósito: el día ya quedó contado en el ítem de arriba (D-091), así que
     * cuando esta decisión sea CERRAR —hoy o cualquier día— la racha no depende
     * de nada de lo que pase aquí. Es la línea roja #6 cumplida por orden de
     * escrituras, no por una rama.
     *
     * Los minutos los mide el servidor (delta contra el sello de la fila del
     * día, nunca un tiempo del cliente) y la decisión se toma en el punto
     * seguro: el ítem servido acaba de contestarse en esta misma petición.
     * Un reintento no cobra minutos ni decide — volver a intentarlo no puede
     * costar nada (línea roja #8).
     */
    limite = await limiteAlResponder(env, quien, {
      ahora: Date.now(),
      zona,
      locale,
    });

    /*
     * El corte ocurrió: el motivo del límite llega a la racha (F8 #404).
     *
     * El día ya se contó arriba con `RETO_COMPLETADO` (D-091), así que esta
     * llamada es idempotente por construcción — `registrarDia` devuelve el
     * mismo objeto y no se escribe nada. Lo que cambia es que el camino del
     * corte NOMBRA su motivo: `LIMITE_DE_PANTALLA_CORTO_LA_SESION` entra en
     * `registrarDia` de verdad, que es la omisión silenciosa que
     * `audits/limite-no-rompe-el-dia.mjs` declara como su punto ciego y el
     * KPI de #202 (sesiones cortadas donde la racha no avanzó = 0).
     */
    if (limite?.tipo === "CERRAR" && limite.motivo) {
      await registrarDiaPorLimite(env, quien, {
        motivo: limite.motivo,
        ahora: Date.now(),
        zona,
      });
      await avisarCorteALaSesion(env, quien, limite.motivo);
    }
  }

  /**
   * ─── La explicación pregenerada (D-004 punto 1, F6 #132/#137) ────────────
   *
   * Hasta hoy `veredicto.causa` llegaba aquí, viajaba al cliente, y la pantalla
   * **la tiraba**: quien fallaba leía «Esta vez no. Vamos a intentarlo otra
   * vez.» sin importar qué hubiera hecho. El dato que hace útil a Larry existe
   * en el banco desde el primer día —es regla de CLAUDE.md § Contenido— y no
   * llegaba a nadie.
   *
   * Ahora se compone aquí, y el orden de estas tres líneas es el contrato de la
   * línea roja #7 hecho código:
   *
   *  1. `calificarContraBanco` **ya calculó** el veredicto, en el Worker de
   *     ingesta, que es donde vive la respuesta correcta.
   *  2. `sellarSobre` copia solo la lista blanca. Los operandos, la respuesta,
   *     la elección del niño, el tiempo y el id del perfil **no tienen campo**.
   *  3. `explicarEnLocale` elige palabras. No calcula: no recibe con qué.
   *
   * Nada de esto toca la red ni un modelo, así que **no puede fallar y no puede
   * tardar**: el veredicto jamás espera a Larry (`mc-20` §7 — para un niño
   * pequeño el silencio tras un toque se lee como «roto», no como «pensando»).
   */
  const locSeguro: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const explicacion = explicarEnLocale(
    sellarSobre(veredicto as unknown as Record<string, unknown>),
    locSeguro,
    RETO,
  );

  return json({
    ok: true,
    correcto,
    // La causa con nombre. Es lo que permite que Larry explique QUÉ error se
    // cometió y no solo que se falló — y llega ya resuelta, porque Larry nunca
    // calcula (línea roja #7).
    causa: veredicto.causa,
    razonAlterna: veredicto.razonAlterna,
    // Las frases ya escritas, en el locale de quien juega. La pantalla las
    // pinta y no compone nada: si aquí no hay texto, no hay texto, y eso se ve
    // en un auditor en vez de descubrirse en alemán tres semanas después.
    explicacion,
    nivel: modelo?.nivel ?? nivelDeHabilidad(despues.habilidad),
    // `etapa` y `ubicando` viajan para que la pantalla del PADRE pueda usarlos.
    // La del niño no los pinta: enterarse de que hay una ubicación en curso la
    // convertiría en un examen (D-060, criterio #100).
    etapa: modelo?.etapa ?? "practicando",
    // Lo dice el servidor y no lo supone el cliente: este intento NO movió el
    // modelo. Sin este campo la pantalla tendría que acordarse de qué mandó, y
    // «el cliente se acuerda» es como dos sistemas dejan de estar de acuerdo.
    conto: !reintento,
    /*
     * El aviso, el descanso o la despedida del límite de pantalla, ya con sus
     * textos escritos en el locale de quien juega (F8). Viaja en ESTA respuesta
     * porque el punto seguro es aquí: el niño terminó de pensar su ítem. La
     * pantalla lo muestra DESPUÉS del veredicto — primero se despide del
     * problema, después Larry se despide del día. `undefined` cuando no hay
     * nada que decir.
     */
    limite: limite ?? undefined,
    /*
     * El avance del duelo, si esta respuesta fue de uno (F7 #244): cuántos
     * ítems del set van, cuántos son, y si con éste terminé mi mitad. La
     * pantalla no compone nada con esto — el resultado se mira en la liga—;
     * es para que el cliente sepa cuándo el set se acabó. `undefined` fuera
     * de duelo.
     */
    duelo:
      dueloId && avanceDuelo?.ok
        ? { hechos: avanceDuelo.hechos, total: avanceDuelo.total, terminado: avanceDuelo.terminado }
        : undefined,
    /*
     * La racha y el XP ya escritos, para que la pantalla los pinte sin una
     * segunda petición. Números crudos y nada más: el texto lo compone quien
     * pinta, y **qué se enseña y a quién no se decide aquí** — la pantalla del
     * niño no pinta ninguno de los dos (D-060, criterio #100, #206), y esta
     * ruta la sirven las dos pantallas.
     *
     * `null` cuando no hubo base de datos o cuando la escritura falló. Nunca se
     * le niega el juego a nadie por un contador.
     *
     * `xp.texto` viaja YA ESCRITO, igual que la explicación de Larry y por la
     * misma razón: el separador de millares no es el mismo en `de-DE` que en
     * `fr-FR` (mc-34), y la única función que lo sabe es `formatear()`. Mandarla
     * al navegador sería una segunda copia de la que se desincroniza.
     */
    progreso: progreso
      ? {
          racha: progreso.racha,
          xp: {
            ...progreso.xp,
            texto: textoDeXp(
              (RETO[locSeguro]?.["juego.xp"] as string) ?? "{n} XP",
              progreso.xp.total,
              locSeguro,
            ),
          },
        }
      : null,
  });
};
