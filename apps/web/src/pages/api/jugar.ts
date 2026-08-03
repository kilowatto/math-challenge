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
  type Candidato,
} from "../../../../../packages/motor/src/adaptativo.ts";
import {
  repasoInicial,
  ordenDeSesion,
  type HabilidadEnRotacion,
} from "../../../../../packages/motor/src/programador.ts";

export const prerender = false;

interface Ingest {
  catalogoAdaptativo(): Promise<Array<{ id: string; habilidad: string; nivel: number; dificultad: number }>>;
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
  }>;
  recordAttempt(input: Record<string, unknown>): Promise<unknown>;
}

interface Env {
  INGEST: Ingest;
  SESSION_KV: KVNamespace;
  LEARNER_DO?: DurableObjectNamespace;
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
  const sesion = { childProfileId: quien.id };

  const accion = url.searchParams.get("accion");
  let cuerpo: Record<string, unknown>;
  try {
    cuerpo = (await request.json()) as Record<string, unknown>;
  } catch {
    cuerpo = {};
  }

  const locale = typeof cuerpo.locale === "string" ? cuerpo.locale : "en";

  // El año de nacimiento siembra el ítem 1 y **nada más** (D-060, criterio #88).
  // Se lee aquí, una vez, y no entra a ninguna función del motor salvo
  // `nivelSemilla`. El motor no recibe la edad ni la banda.
  const semilla = await nivelSemillaDe(env, quien.id, quien.esAdulto);

  if (accion === "siguiente") {
    return servirSiguiente(env, sesion.childProfileId, locale, semilla, cuerpo);
  }
  if (accion === "responder") {
    return recibirRespuesta(env, sesion.childProfileId, locale, semilla, cuerpo);
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
      fallosSeguidos: 0,
      ultimosNiveles: [],
    },
    ubicando: fila.ubicando,
  };
}

async function servirSiguiente(
  env: Env,
  childProfileId: string,
  locale: string,
  semilla: number,
  cuerpo: Record<string, unknown>,
): Promise<Response> {
  const [catalogo, resumen] = await Promise.all([
    env.INGEST.catalogoAdaptativo(),
    leerModelo(env.LEARNER_DO, childProfileId),
  ]);

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
  const skillId = plan.length > 0 ? plan[respondidosEnTotal % plan.length] : habilidades[0];

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
  const elegido = elegirSiguiente(candidatos, estado, evitar, Math.random);
  if (!elegido) return json({ error: "sin_items" }, 503);

  const item = await env.INGEST.presentarItem(elegido.id, locale);
  if (!item) return json({ error: "item_desconocido" }, 500);

  return json({
    ok: true,
    item,
    // Lo que el cliente necesita para devolver el intento sin que el servidor
    // tenga que volver a calcularlo. Ninguno de estos campos revela la
    // respuesta correcta.
    contexto: {
      skillId,
      dificultad: elegido.dificultad,
      habilidadAntes: estado.habilidad,
      ubicando: estaUbicando(estado),
      kUsado: kPara(estado.respondidos, estaUbicando(estado)),
    },
  });
}

async function recibirRespuesta(
  env: Env,
  childProfileId: string,
  locale: string,
  semilla: number,
  cuerpo: Record<string, unknown>,
): Promise<Response> {
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

  // ─── El servidor califica. Siempre. ──────────────────────────────────────
  const veredicto = await env.INGEST.calificarContraBanco(itemId, eleccion);

  const resumen = await leerModelo(env.LEARNER_DO, childProfileId);
  const { estado } = estadoDe(resumen, veredicto.habilidad, semilla);
  const dificultad = dificultadDeNivel(veredicto.nivel);
  const correcto = veredicto.acc === 1;

  const kUsado = kPara(estado.respondidos, estaUbicando(estado));
  const despues = actualizar(estado, { dificultad, correcto, nivel: veredicto.nivel });

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
        banda: "KINDER",
        nivelSemilla: semilla,
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
  try {
    if (!reintento) await env.INGEST.recordAttempt({
      childProfileId,
      itemId,
      skillId: veredicto.habilidad,
      correct: veredicto.acc,
      level: veredicto.nivel,
      // KINDER no se cronometra (D-024): se manda 0 y el motor de puntuación
      // ni siquiera recibe el campo. Poner aquí un tiempo del cliente sería
      // exactamente lo que F3 prohíbe.
      responseTimeMs: 0,
      themeBand: "KINDER",
      locale,
      authoredDifficulty: undefined,
      itemEloBefore: dificultad,
      itemEloAfter: dificultad,
      learnerBefore: estado.habilidad,
      learnerAfter: despues.habilidad,
      kUsed: kUsado,
      indexInSession: undefined,
      selectionMode: "adaptativo",
    });
  } catch {
    // Silencio a propósito: la telemetría nunca interrumpe a un niño.
  }

  return json({
    ok: true,
    correcto,
    // La causa con nombre. Es lo que permite que Larry explique QUÉ error se
    // cometió y no solo que se falló — y llega ya resuelta, porque Larry nunca
    // calcula (línea roja #7).
    causa: veredicto.causa,
    razonAlterna: veredicto.razonAlterna,
    nivel: modelo?.nivel ?? nivelDeHabilidad(despues.habilidad),
    // `etapa` y `ubicando` viajan para que la pantalla del PADRE pueda usarlos.
    // La del niño no los pinta: enterarse de que hay una ubicación en curso la
    // convertiría en un examen (D-060, criterio #100).
    etapa: modelo?.etapa ?? "practicando",
    // Lo dice el servidor y no lo supone el cliente: este intento NO movió el
    // modelo. Sin este campo la pantalla tendría que acordarse de qué mandó, y
    // «el cliente se acuerda» es como dos sistemas dejan de estar de acuerdo.
    conto: !reintento,
  });
};
