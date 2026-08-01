/**
 * `math-challenge-ratelimiter-do` — el limitador de tasa. Criterio #113.
 *
 * ─── Por qué un Durable Object y no KV ─────────────────────────────────────
 *
 * Un contador necesita **leer y escribir sin carrera**. KV es eventualmente
 * consistente y admite una escritura por segundo por llave: dos peticiones
 * simultáneas leerían el mismo valor y escribirían el mismo incremento, así que
 * el contador subiría de uno en uno mientras el atacante manda diez. Un Durable
 * Object serializa: es la única primitiva de Cloudflare que da un contador que
 * no miente.
 *
 * ─── UN objeto por llave, jamás uno global ─────────────────────────────────
 *
 * `mc-32` y D-030 lo dicen para las ligas y los salones, y aplica igual aquí:
 * un objeto global sería un cuello de botella que serializa **todo el tráfico
 * del producto** en un solo hilo. La llave es la IP más la acción, así que dos
 * personas distintas nunca esperan la una por la otra.
 *
 * ─── Turnstile NO es un limitador de tasa ──────────────────────────────────
 *
 * Turnstile dice «esto parece una persona». No dice «esta persona ya lo intentó
 * cuarenta veces». Sin este objeto, el único costo de probar direcciones era un
 * desafío resuelto y 36 ms — el oráculo de enumeración está cerrado, pero el
 * volumen no lo estaba.
 *
 * ─── La ventana es deslizante, no fija ─────────────────────────────────────
 *
 * Una ventana fija de un minuto permite el doble del límite justo en el borde:
 * diez al final de un minuto y diez al principio del siguiente son veinte en dos
 * segundos. Se guardan las marcas de tiempo y se cuenta hacia atrás.
 */

/** Cuántos intentos y en cuánto tiempo, por acción. */
export const LIMITES: Record<string, { intentos: number; ventanaMs: number }> = {
  // Registro: generoso, porque un padre que se equivoca de contraseña dos veces
  // no es un atacante y quedarse fuera de crear la cuenta de su hijo es peor.
  registro: { intentos: 10, ventanaMs: 10 * 60 * 1000 },
  // Entrada: más estrecho. Aquí sí hay algo que adivinar.
  entrar: { intentos: 8, ventanaMs: 10 * 60 * 1000 },
  // El PIN de imágenes son 504 combinaciones. Sin límite, se agotan en
  // segundos — y aquí el «atacante» realista es un hermano mayor.
  pin: { intentos: 12, ventanaMs: 15 * 60 * 1000 },
};

export interface Veredicto {
  permitido: boolean;
  /** Cuántos quedan en la ventana. Se devuelve al cliente como cabecera. */
  restantes: number;
  /** Segundos hasta que vuelva a haber cupo. 0 si hay cupo ahora. */
  esperaS: number;
}

/**
 * El Durable Object. Una instancia por `(acción, llave)`.
 *
 * El estado vive en memoria y se persiste: un objeto puede desalojarse entre
 * peticiones, y un contador que se reinicia al desalojarse no limita nada.
 */
export class RateLimiter {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const accion = url.searchParams.get("accion") ?? "";
    const limite = LIMITES[accion];
    if (!limite) {
      // Una acción desconocida NO se deja pasar: sería la forma de saltarse el
      // limitador escribiendo cualquier cosa en el parámetro.
      return Response.json({ permitido: false, restantes: 0, esperaS: 60 } satisfies Veredicto);
    }

    const ahora = Date.now();
    const desde = ahora - limite.ventanaMs;

    // `blockConcurrencyWhile` no hace falta: el DO ya serializa sus propias
    // peticiones. Lo que sí hace falta es que la lectura y la escritura estén
    // en el mismo turno, y lo están.
    const previas = ((await this.state.storage.get<number[]>("marcas")) ?? []).filter((t) => t > desde);

    if (previas.length >= limite.intentos) {
      // La más vieja de la ventana decide cuándo vuelve a haber cupo.
      const esperaS = Math.max(1, Math.ceil((previas[0] + limite.ventanaMs - ahora) / 1000));
      return Response.json({ permitido: false, restantes: 0, esperaS } satisfies Veredicto);
    }

    previas.push(ahora);
    await this.state.storage.put("marcas", previas);
    // Se programa el borrado del estado cuando la ventana expire: sin esto, cada
    // IP que pase una vez deja un objeto con estado para siempre.
    await this.state.storage.setAlarm(ahora + limite.ventanaMs);

    return Response.json({
      permitido: true,
      restantes: limite.intentos - previas.length,
      esperaS: 0,
    } satisfies Veredicto);
  }

  /** La ventana expiró y no volvió nadie: se borra el estado. */
  async alarm(): Promise<void> {
    await this.state.storage.deleteAll();
  }
}

/**
 * Consulta el limitador desde una ruta.
 *
 * **Falla ABIERTO a propósito, y hay que decir por qué.** Si el Durable Object
 * no responde, se permite el intento. Es la decisión contraria a la de Turnstile
 * —que falla cerrado— y la diferencia es qué se protege: Turnstile protege
 * contra bots y su ausencia deja el formulario indefenso; el limitador protege
 * contra volumen, y su ausencia deja el formulario **lento**, no abierto. Fallar
 * cerrado aquí significaría que un fallo de infraestructura impide a un padre
 * crear la cuenta de su hijo.
 *
 * La consecuencia, dicha: un atacante que pueda tirar el DO se salta el límite.
 * Sigue teniendo Turnstile delante.
 */
export async function consultarLimite(
  ns: DurableObjectNamespace | undefined,
  accion: keyof typeof LIMITES,
  llave: string,
): Promise<Veredicto> {
  if (!ns) return { permitido: true, restantes: 0, esperaS: 0 };
  try {
    const id = ns.idFromName(`${accion}:${llave}`);
    const stub = ns.get(id);
    const r = await stub.fetch(`https://ratelimiter/?accion=${encodeURIComponent(accion)}`);
    return (await r.json()) as Veredicto;
  } catch {
    return { permitido: true, restantes: 0, esperaS: 0 };
  }
}
