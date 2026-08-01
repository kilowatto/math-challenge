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
import { calificar, pareceImposible, type Veredicto } from "../../../packages/motor/src/puntuacion";

interface Env {
  DB: D1Database;
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
      ],
      doubles: [
        input.correct,
        esKinder ? 0 : input.responseTimeMs,
        veredicto.puntos,
        input.level,
      ],
    });

    return { ...veredicto, imposible };
  }

  /** Sin ruta pública: cualquier petición directa se rechaza. */
  override async fetch(): Promise<Response> {
    return new Response("math-challenge-ingest: solo accesible por RPC", {
      status: 404,
    });
  }
}

export default Ingest;
