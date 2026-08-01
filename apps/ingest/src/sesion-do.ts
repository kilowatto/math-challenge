/**
 * `math-challenge-sesion-reto` — un Durable Object POR SESIÓN de reto.
 *
 * Por qué un DO y no una fila en D1. Un DO es de un solo hilo: todas las
 * peticiones a la misma instancia se serializan sin transacción. Eso es
 * exactamente lo que la idempotencia de `(sesión, orden)` necesita — sin él, dos
 * envíos simultáneos de la misma respuesta pueden leer el estado antes de que
 * ninguno escriba, y los dos puntúan.
 *
 * **Uno por sesión, jamás uno global.** `audits/do-por-entidad.mjs` bloquea el
 * commit si aparece `idFromName("global")`, y la razón está en `mc-32`: un DO
 * global pone todos los retos del producto detrás de una sola cola. Funciona
 * perfecto con cinco usuarios de prueba y se descubre el día que hay tráfico.
 *
 * La lógica NO vive aquí. Vive en `packages/motor/src/sesion.ts`, que es puro y
 * se prueba sin infraestructura; este archivo es la carcasa que le da
 * persistencia y un hilo. Separarlo no es estética: los 14 casos de la sesión
 * corren en milisegundos porque no necesitan un DO.
 */

import { DurableObject } from "cloudflare:workers";
import {
  estadoInicial,
  servir,
  responder,
  puntoSeguroDeCorte,
  progreso,
  type EstadoSesion,
  type ResultadoDeRespuesta,
} from "../../../packages/motor/src/sesion.ts";
import type { Banda } from "../../../packages/motor/src/puntuacion.ts";

interface Env {
  ATTEMPTS_AE: AnalyticsEngineDataset;
}

/**
 * Lo que se guarda. `Map` no sobrevive a `storage.put`, así que las respuestas
 * puntuadas viajan como arreglo de pares — y se convierten en los dos sentidos
 * en un solo lugar, aquí, para que el módulo puro nunca sepa de esto.
 */
interface EstadoSerializado {
  banda: Banda;
  pendiente: EstadoSesion["pendiente"];
  puntuadas: Array<[number, ResultadoDeRespuesta]>;
  puntosTotales: number;
}

const aSerializado = (e: EstadoSesion): EstadoSerializado => ({
  banda: e.banda,
  pendiente: e.pendiente,
  puntuadas: [...e.puntuadas.entries()],
  puntosTotales: e.puntosTotales,
});

const deSerializado = (s: EstadoSerializado): EstadoSesion => ({
  banda: s.banda,
  pendiente: s.pendiente,
  puntuadas: new Map(s.puntuadas),
  puntosTotales: s.puntosTotales,
});

export class SesionReto extends DurableObject<Env> {
  /**
   * El reloj del servidor, en un solo sitio.
   *
   * `Date.now()` en Workers avanza únicamente cuando hay E/S, así que dos
   * llamadas seguidas sin red devuelven lo mismo. Para medir un tiempo de
   * respuesta eso da igual —entre servir y contestar hay una petición de por
   * medio— pero conviene que quien lea esto sepa por qué no se usa
   * `performance.now()`: en un DO se reinicia con la instancia, y una sesión
   * puede sobrevivir a varias.
   */
  private ahora(): number {
    return Date.now();
  }

  private async leer(): Promise<EstadoSesion | null> {
    const s = await this.ctx.storage.get<EstadoSerializado>("estado");
    return s ? deSerializado(s) : null;
  }

  private async guardar(e: EstadoSesion): Promise<void> {
    await this.ctx.storage.put("estado", aSerializado(e));
  }

  /** Arranca la sesión. Idempotente: llamarlo dos veces no la reinicia. */
  async iniciar(banda: Banda): Promise<{ ok: true; nueva: boolean }> {
    const existente = await this.leer();
    if (existente) return { ok: true, nueva: false };
    await this.guardar(estadoInicial(banda));
    return { ok: true, nueva: true };
  }

  /** Sirve un ítem y pone el PRIMER sello del servidor. */
  async servirItem(item: { orden: number; itemId: string; nivel: number }): Promise<{ servidoEn: number }> {
    const estado = await this.leer();
    if (!estado) throw new Error("la sesión no se ha iniciado");
    const nuevo = servir(estado, item, this.ahora());
    await this.guardar(nuevo);
    return { servidoEn: nuevo.pendiente!.servidoEn };
  }

  /**
   * Recibe la respuesta, pone el SEGUNDO sello, califica y registra.
   *
   * `correcta` la resuelve quien llama, porque comparar contra el arreglo
   * `errores` del ítem es trabajo del banco de ítems y no de la sesión. Lo que
   * la sesión garantiza es que el puntaje sale de aquí y no del cliente.
   */
  async responderItem(
    respuesta: { orden: number; eleccion: string },
    correcta: boolean,
    contexto: { itemId: string; skillId: string; locale: string },
  ): Promise<ResultadoDeRespuesta> {
    const estado = await this.leer();
    if (!estado) throw new Error("la sesión no se ha iniciado");

    const { estado: nuevo, resultado } = responder(
      estado,
      respuesta,
      () => correcta,
      this.ahora(),
    );

    // Una repetición no se vuelve a escribir. Registrarla otra vez inflaría las
    // métricas exactamente en la proporción de la mala conexión de cada quien,
    // que es la peor forma posible de sesgar un dato.
    if (!resultado.repetida) {
      await this.guardar(nuevo);
      this.env.ATTEMPTS_AE.writeDataPoint({
        indexes: [contexto.skillId],
        blobs: [
          contexto.itemId,
          contexto.skillId,
          estado.banda,
          contexto.locale,
          resultado.veredicto.regla,
        ],
        doubles: [
          resultado.veredicto.detalle.acc,
          estado.banda === "KINDER" ? 0 : resultado.rtMs,
          resultado.veredicto.puntos,
          resultado.veredicto.detalle.valor,
        ],
      });
    }

    return resultado;
  }

  /**
   * ¿Puede F8 cortar ahora sin partir una respuesta? (D-016)
   *
   * El límite de pantalla pregunta; no impone. Un corte con el problema en
   * pantalla y el reloj corriendo convierte una protección en un castigo por
   * haber tardado en pensar.
   */
  async puedeCortar(): Promise<{ seguro: boolean; contestadas: number; puntos: number }> {
    const estado = await this.leer();
    if (!estado) return { seguro: true, contestadas: 0, puntos: 0 };
    return { seguro: puntoSeguroDeCorte(estado), ...progreso(estado) };
  }

  /** Sin ruta pública: una sesión se alcanza por RPC desde el Worker web. */
  override async fetch(): Promise<Response> {
    return new Response("math-challenge-sesion-reto: solo accesible por RPC", { status: 404 });
  }
}
