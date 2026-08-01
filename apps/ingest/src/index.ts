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
   * F3 implementará esto de verdad. Se deja declarado y lanzando para que la
   * forma del contrato quede fijada desde F0 y nadie invente otra.
   *
   * Cuando se implemente, tres reglas que ya están decididas:
   *   · El servidor cronometra y califica. Un puntaje calculado en el cliente y
   *     sincronizado después es el vector de trampa más obvio (mc-33 impl. 7).
   *   · El intento crudo va a ATTEMPTS_AE, jamás a D1 (mc-32 riesgo #1).
   *   · Kinder usa `valor_del_ítem · acc`, sin tiempo. La regla HSHS con a=0
   *     da cero para toda respuesta (D-024).
   */
  async recordAttempt(_input: AttemptInput): Promise<never> {
    throw new Error("recordAttempt se implementa en F3 (motor de reto)");
  }

  /** Sin ruta pública: cualquier petición directa se rechaza. */
  override async fetch(): Promise<Response> {
    return new Response("math-challenge-ingest: solo accesible por RPC", {
      status: 404,
    });
  }
}

export default Ingest;
