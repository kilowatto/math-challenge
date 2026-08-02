/**
 * math-challenge-ingest — esqueleto de RPC.
 *
 * Esto es lo que F0 llama "esqueleto de RPC nativo entre Workers", y existe para
 * demostrar que el camino funciona antes de que F3 dependa de él.
 *
 * Por qué RPC nativo y no gRPC (D-030, mc-47 §1):
 *   · Workers NO puede hacer llamadas gRPC salientes — el runtime no soporta
 *     streaming bidireccional HTTP/2.
 *   · El navegador no habla gRPC; gRPC-Web cae a HTTP/1.1 y pierde la ventaja.
 *   · Este RPC, en cambio, "normalmente ni siquiera cruza una red" y corre en
 *     el mismo hilo que quien llama. Latencia añadida: cero.
 *
 * Este Worker NO tiene ruta pública. Solo se alcanza por service binding.
 */

import { WorkerEntrypoint } from "cloudflare:workers";
import { calificar, pareceImposible, type Veredicto } from "../../../packages/motor/src/puntuacion.ts";
import { generarBanco } from "../../../packages/motor/src/banco-kinder.ts";
import { calificarRespuesta, type VeredictoDeItem } from "../../../packages/motor/src/item.ts";
import { dificultadDeNivel } from "../../../packages/motor/src/adaptativo.ts";
import { formatear } from "../../../packages/motor/src/numeros.ts";

// Los textos del reto en los siete locales. Se importan como JSON porque son
// CONTENIDO, no código: el enunciado de un ítem de kinder se autora, no se
// traduce (`CLAUDE.md` § Idiomas), y vive junto a las causas de error que
// `retro-completa.mjs` ya vigila.
import retoEn from "../../web/src/i18n/reto/en.json" with { type: "json" };
import retoEsMx from "../../web/src/i18n/reto/es-MX.json" with { type: "json" };
import retoEsEs from "../../web/src/i18n/reto/es-ES.json" with { type: "json" };
import retoFr from "../../web/src/i18n/reto/fr-FR.json" with { type: "json" };
import retoPtBr from "../../web/src/i18n/reto/pt-BR.json" with { type: "json" };
import retoPtPt from "../../web/src/i18n/reto/pt-PT.json" with { type: "json" };
import retoDe from "../../web/src/i18n/reto/de-DE.json" with { type: "json" };

const MENSAJES_DE_RETO: Record<string, Record<string, unknown>> = {
  en: retoEn,
  "es-MX": retoEsMx,
  "es-ES": retoEsEs,
  "fr-FR": retoFr,
  "pt-BR": retoPtBr,
  "pt-PT": retoPtPt,
  "de-DE": retoDe,
};
import { agregar, validarLote, SQL_UPSERT } from "../../../packages/motor/src/rollup.ts";

interface Env {
  DB: D1Database;
  SESION_RETO_DO: DurableObjectNamespace;
  ATTEMPTS_AE: AnalyticsEngineDataset;
}

/** Lo que el motor de reto mandará en F3. Aquí solo se define la forma. */
export interface AttemptInput {
  childProfileId: string;
  itemId: string;
  skillId: string;
  /** 1 o 0. La regla de kinder es `valor · acc`, sin tiempo (D-024). */
  correct: 0 | 1;
  /** 1 a 10, la escalera de D-017. Fija el valor del ítem: 10 × 1.6^(nivel−1). */
  level: number;
  /** Milisegundos medidos EN EL SERVIDOR, nunca reportados por el cliente. */
  responseTimeMs: number;
  themeBand: "KINDER" | "PRIMARIA" | "SECUNDARIA" | "SERIO" | "JR" | "PRO";
  locale: string;

  /**
   * ─── Los campos de ARRANQUE EN FRÍO (F4 criterio #101) ───────────────────
   *
   * `mc-13` impl. 7 y `mc-44` impl. 8: la recalibración Rasch necesita 200-400
   * respuestas POR ÍTEM, y esas respuestas solo existen si se guardaron desde el
   * primer día. Un campo que se añade en el mes seis no tiene los primeros seis
   * meses — y esos son justo los del banco sin calibrar, que son los que más
   * información traen.
   *
   * Todos son opcionales porque el motor de F3 ya está desplegado y llama a
   * `recordAttempt` sin ellos. Un campo obligatorio aquí habría roto lo que ya
   * funciona; lo que se pierde es que un intento sin estos campos no sirve para
   * recalibrar, y se escribe `-1` para que eso sea legible en la consulta en vez
   * de un cero que se confunde con un valor medido.
   */
  /** La dificultad que el AUTOR le puso al ítem, 1-100. Distinta de la Elo viva. */
  authoredDifficulty?: number;
  /** La calificación Elo del ítem antes y después de este intento, en logits. */
  itemEloBefore?: number;
  itemEloAfter?: number;
  /** La estimación del niño para esta habilidad, antes y después. En logits. */
  learnerBefore?: number;
  learnerAfter?: number;
  /** El K que se usó. Es lo que permite reconstruir el paso sin adivinarlo. */
  kUsed?: number;
  /** Qué posición ocupó dentro de la sesión, empezando en 1. */
  indexInSession?: number;
  /**
   * Qué motor lo sirvió (F4 criterio #103). Sin esto no se puede comparar el
   * adaptativo contra la escalera fija, y sin esa comparación no se le puede
   * atribuir nada al adaptativo — los niños aprenden con el tiempo de todos
   * modos.
   */
  selectionMode?: "adaptativo" | "escalera_fija";
}

export class Ingest extends WorkerEntrypoint<Env> {
  /**
   * Salud del binding. Existe para que el esqueleto sea comprobable: si esto
   * responde desde math-challenge-web, el camino de RPC está vivo.
   */
  async ping(): Promise<{ ok: true; worker: string; at: number }> {
    return { ok: true, worker: "math-challenge-ingest", at: Date.now() };
  }

  /**
   * Cuenta las tablas de D1. Prueba que el binding de base de datos llega hasta
   * aquí, no solo hasta el Worker web.
   */
  async schemaTableCount(): Promise<number> {
    const row = await this.env.DB.prepare(
      "SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
    ).first<{ n: number }>();
    return row?.n ?? 0;
  }

  /**
   * Registra un intento y devuelve el veredicto. F3.
   *
   * Tres reglas que ya estaban decididas antes de escribir una línea:
   *
   *   · **El servidor califica.** Aquí no entra ningún puntaje: entra la
   *     respuesta y el tiempo que el servidor midió. Un puntaje calculado en el
   *     cliente y sincronizado después es el vector de trampa más obvio que
   *     tiene un producto con tablero (mc-33 impl. 7, D-025).
   *   · **El intento crudo va a ATTEMPTS_AE, jamás a D1.** Una fila por intento
   *     en D1 es el único límite de esta arquitectura que se alcanza por error
   *     de diseño y no por crecimiento (mc-32 riesgo #1). `audits/no-attempts-in-d1.mjs`
   *     bloquea el commit si aparece una tabla por intento.
   *   · **Kinder no ve el tiempo.** `calificar()` lanza si le llega, así que la
   *     regla no depende de que nadie se despiste aquí (D-024, D-045).
   */
  async recordAttempt(input: AttemptInput): Promise<Veredicto & { imposible: boolean }> {
    // Kinder no puede recibir tiempo. Se corta ANTES de llamar al motor para que
    // el error diga de dónde vino, en vez de salir del módulo puro sin contexto.
    const esKinder = input.themeBand === "KINDER";

    const veredicto = calificar(
      esKinder
        ? { banda: input.themeBand, nivel: input.level, acc: input.correct }
        : {
            banda: input.themeBand,
            nivel: input.level,
            acc: input.correct,
            rtMs: input.responseTimeMs,
          },
    );

    // El piso de tiempo es SOLO bitácora (mc-29 impl. 3). No resta, no bloquea y
    // no le dice nada al niño — la línea roja #7 es explícita en que Larry no
    // avergüenza. Se guarda para que alguien pueda mirar patrones después.
    const imposible = esKinder ? false : pareceImposible(input.responseTimeMs);

    this.env.ATTEMPTS_AE.writeDataPoint({
      // Los índices son por lo que se agrupa. El perfil del niño NO va aquí: es
      // el campo de mayor cardinalidad y el que convierte una métrica en un
      // perfilamiento de menor (D-020, mc-25).
      indexes: [input.skillId],
      blobs: [
        input.itemId,
        input.skillId,
        input.themeBand,
        input.locale,
        veredicto.regla,
        imposible ? "piso" : "",
        // El brazo: `adaptativo` o `escalera_fija` (criterio #103). Va en blobs
        // y no en indexes porque **el índice ya está gastado en `skillId`** —
        // Analytics Engine admite UNO— y agrupar por habilidad es lo que más
        // consultas necesitan.
        input.selectionMode ?? "",
      ],
      doubles: [
        input.correct,
        esKinder ? 0 : input.responseTimeMs,
        veredicto.puntos,
        input.level,
        // Los campos de arranque en frío. `-1` significa «no se mandó», que no
        // es lo mismo que cero: un Elo de 0 logits es el centro de la escala y
        // un K de 0 sería un motor que no aprende. Ver `AttemptInput`.
        input.authoredDifficulty ?? -1,
        input.itemEloBefore ?? -1,
        input.itemEloAfter ?? -1,
        input.learnerBefore ?? -1,
        input.learnerAfter ?? -1,
        input.kUsed ?? -1,
        input.indexInSession ?? -1,
      ],
    });

    return { ...veredicto, imposible };
  }

  /**
   * Prueba de humo de la sesión, contra la instancia REAL de producción.
   *
   * Existe porque el criterio #33 de F3 pide la evidencia, no la afirmación:
   * *"dos envíos idénticos, un solo punto"*. Los 14 casos del módulo puro corren
   * sin infraestructura y no prueban que el Durable Object persista, ni que su
   * hilo único serialice, ni que el estado sobreviva a una llamada.
   *
   * Usa una sesión con nombre propio —`humo:<marca>`— para no tocar ninguna
   * real, y **no escribe a Analytics Engine**: pasa `skillId` vacío y una banda
   * de adulto, así que ningún dato de niño ni ninguna métrica falsa entra al
   * conjunto. Es de solo lectura para todo lo que importa.
   */
  async pruebaDeHumoSesion(marca: string): Promise<{
    dosEnviosUnPunto: boolean;
    puntosTrasUno: number;
    puntosTrasDos: number;
    segundoMarcadoRepetido: boolean;
    rtIgual: boolean;
    cortarConItemServido: boolean;
    cortarSinItemServido: boolean;
  }> {
    const id = this.env.SESION_RETO_DO.idFromName(`humo:${marca}`);
    const sesion = this.env.SESION_RETO_DO.get(id) as unknown as {
      iniciar(b: string): Promise<{ ok: true; nueva: boolean }>;
      servirItem(i: { orden: number; itemId: string; nivel: number }): Promise<{ servidoEn: number }>;
      responderItem(r: { orden: number; eleccion: string }, c: boolean, x: { itemId: string; skillId: string; locale: string }): Promise<any>;
      puedeCortar(): Promise<{ seguro: boolean; contestadas: number; puntos: number }>;
    };

    await sesion.iniciar("SERIO");
    const cortarVacio = (await sesion.puedeCortar()).seguro;

    await sesion.servirItem({ orden: 1, itemId: "humo", nivel: 8 });
    const cortarServido = (await sesion.puedeCortar()).seguro;

    const ctx = { itemId: "humo", skillId: "", locale: "en" };
    const uno = await sesion.responderItem({ orden: 1, eleccion: "bien" }, true, ctx);
    const trasUno = (await sesion.puedeCortar()).puntos;

    const dos = await sesion.responderItem({ orden: 1, eleccion: "bien" }, true, ctx);
    const trasDos = (await sesion.puedeCortar()).puntos;

    return {
      dosEnviosUnPunto: trasUno === trasDos,
      puntosTrasUno: trasUno,
      puntosTrasDos: trasDos,
      segundoMarcadoRepetido: dos.repetida === true,
      rtIgual: uno.rtMs === dos.rtMs,
      cortarConItemServido: cortarServido,
      cortarSinItemServido: cortarVacio,
    };
  }

  /**
   * El banco de kinder, generado una vez por instancia del Worker.
   *
   * Se genera y no se lee de D1 a propósito: son plantillas paramétricas
   * deterministas (`mc-40`, ~40% del banco), así que el mismo código produce los
   * mismos 185 ítems con los mismos ids en cada isolate. Una tabla de ítems en
   * D1 sería una copia que puede desincronizarse del código que la genera.
   *
   * Los otros dos tercios del banco —redactados con IA y revisados, y escritos a
   * mano— sí vivirán en almacenamiento, porque no se derivan de nada.
   */
  #banco: Map<string, ReturnType<typeof generarBanco>[number]> | null = null;

  private banco() {
    if (!this.#banco) this.#banco = new Map(generarBanco().map((i) => [i.id, i]));
    return this.#banco;
  }

  /**
   * Califica una respuesta contra el banco, **nombrando la causa del error**.
   *
   * Es lo que separa «fallaste» de «multiplicaste en vez de sumar». Larry recibe
   * esto ya resuelto y solo lo explica — nunca calcula (línea roja #7).
   */
  async calificarContraBanco(
    itemId: string,
    eleccion: number | string,
  ): Promise<VeredictoDeItem & { nivel: number; habilidad: string }> {
    const item = this.banco().get(itemId);
    if (!item) throw new Error(`ítem desconocido: ${itemId}`);
    return { ...calificarRespuesta(item, eleccion), nivel: item.nivel, habilidad: item.habilidad };
  }

  /**
   * El catálogo que el selector adaptativo necesita, y **nada más** (F4 #90).
   *
   * Devuelve `id`, `habilidad`, `nivel` y la dificultad en logits. NO devuelve
   * el enunciado ni las respuestas: quien elige el siguiente ítem no necesita
   * saber qué dice, y mandárselo pondría el banco entero —con sus respuestas
   * correctas— a viajar en cada selección.
   *
   * `dificultad` sale hoy de `nivel`, que es el prior de arranque en frío. La
   * calificación Elo viva vivirá en otra columna cuando el banco tenga
   * respuestas suficientes; son dos números distintos a propósito (F4 #89,
   * `mc-13` impl. 8).
   */
  async catalogoAdaptativo(): Promise<Array<{ id: string; habilidad: string; nivel: number; dificultad: number }>> {
    return [...this.banco().values()].map((i) => ({
      id: i.id,
      habilidad: i.habilidad,
      nivel: i.nivel,
      dificultad: dificultadDeNivel(i.nivel),
    }));
  }

  /**
   * Prepara un ítem para la pantalla: enunciado ya escrito y opciones barajadas.
   *
   * ─── Por qué la respuesta correcta NO viaja marcada ────────────────────────
   *
   * Las opciones salen mezcladas y **sin bandera de cuál es la buena**. El
   * cliente manda el valor que el niño tocó y el servidor lo califica contra el
   * banco (`calificarContraBanco`). Mandar `{correcta: true}` pondría la
   * respuesta en el HTML de una pantalla infantil, que es la forma más tonta de
   * que un hermano mayor «ayude».
   *
   * ─── El barajado es DETERMINISTA por ítem ─────────────────────────────────
   *
   * `Math.random()` haría que recargar la página cambiara el orden, y a un niño
   * de cuatro años eso le parece que las cosas se mueven solas. El orden sale de
   * un hash del `itemId`, así que el mismo ítem se ve siempre igual y dos ítems
   * distintos no comparten patrón.
   *
   * Los números se escriben con `formatear()` y la convención del locale
   * (`mc-34`): en México punto decimal, en el resto del mundo hispano coma.
   */
  async presentarItem(
    itemId: string,
    locale: string,
  ): Promise<{
    id: string;
    habilidad: string;
    nivel: number;
    formato: string;
    enunciado: string;
    vars: Record<string, string>;
    opciones: Array<{ valor: number | string; texto: string }>;
  } | null> {
    const item = this.banco().get(itemId);
    if (!item) return null;

    const textos = MENSAJES_DE_RETO[locale] ?? MENSAJES_DE_RETO.en;
    const vars: Record<string, string> = {};
    for (const [k, v] of Object.entries(item.enunciado.vars)) {
      vars[k] = typeof v === "number" ? formatear(v, locale) : String(v);
    }
    const plantilla = (textos as Record<string, unknown>)[item.enunciado.clave];
    const enunciado =
      typeof plantilla === "string"
        ? plantilla.replace(/\{(\w+)\}/g, (_m, k) => vars[k] ?? `{${k}}`)
        : item.enunciado.clave;

    // La correcta más los distractores CON CAUSA. Un distractor sin causa no
    // entra: es lo que permite que Larry sepa qué error se cometió y no solo
    // que se falló (CLAUDE.md § Contenido).
    const crudas = [
      item.respuesta.valor,
      ...item.errores.map((e) => e.valor),
      ...(item.tambienCorrectas ?? []).map((a) => a.valor),
    ];
    const unicas = [...new Set(crudas)];

    // Barajado determinista: hash del id, mezcla de Fisher-Yates con ese hash
    // como semilla. Ver el encabezado.
    let semilla = 0;
    for (let i = 0; i < itemId.length; i++) semilla = (semilla * 31 + itemId.charCodeAt(i)) & 0x7fffffff;
    const siguiente = () => ((semilla = (semilla * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    for (let i = unicas.length - 1; i > 0; i--) {
      const j = Math.floor(siguiente() * (i + 1));
      [unicas[i], unicas[j]] = [unicas[j], unicas[i]];
    }

    return {
      id: item.id,
      habilidad: item.habilidad,
      nivel: item.nivel,
      formato: item.formato,
      enunciado,
      vars,
      opciones: unicas.map((v) => ({
        valor: v,
        texto: typeof v === "number" ? formatear(v, locale) : String(v),
      })),
    };
  }

  /** Cuántos ítems tiene el banco vivo. Para comprobar el despliegue. */
  async tamanoDelBanco(): Promise<{ items: number; habilidades: number }> {
    const b = [...this.banco().values()];
    return { items: b.length, habilidades: new Set(b.map((i) => i.habilidad)).size };
  }

  /**
   * Escribe el acumulado del tablero a D1, **por lotes** (criterio #35).
   *
   * D1 guarda estados, no eventos: mil intentos de treinta niños salen como
   * treinta escrituras. `validarLote` rechaza cualquier campo que no sea del
   * estado agregado — un `itemId` aquí convertiría esta tabla en una tabla por
   * intento con otro nombre (`mc-32` riesgo #1).
   */
  async escribirRollup(
    intentos: Array<{ childProfileId: string; period: string; themeBand: string; puntos: number }>,
  ): Promise<{ filas: number; intentos: number }> {
    const lote = agregar(intentos);
    const problemas = validarLote(lote);
    if (problemas.length > 0) {
      throw new Error(`lote inválido para D1: ${problemas.join(" | ")}`);
    }

    const ahora = Date.now();
    await this.env.DB.batch(
      lote.filas.map((f) =>
        this.env.DB.prepare(SQL_UPSERT).bind(f.childProfileId, f.period, f.themeBand, f.delta, ahora),
      ),
    );

    return { filas: lote.filas.length, intentos: lote.intentosAgregados };
  }

  /** Sin ruta pública: cualquier petición directa se rechaza. */
  override async fetch(): Promise<Response> {
    return new Response("math-challenge-ingest: solo accesible por RPC", {
      status: 404,
    });
  }
}

// El Durable Object de la sesión de reto. Se exporta desde aquí porque Workers
// exige que la clase viva en el mismo módulo de entrada que la declara.
export { SesionReto } from "./sesion-do.ts";

export default Ingest;
