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
 *
 * ─── Y desde F6, el medidor de gasto del tutor ─────────────────────────────
 *
 * El mismo objeto atiende una segunda ruta, `/tutor`, con una llave distinta:
 * el seudónimo diario del perfil en vez de la IP. La aritmética del tope no vive
 * aquí sino en `packages/tutor/src/gasto.ts`, que es puro y se puede probar sin
 * gastar un centavo; aquí solo está lo que necesita un objeto: leer, decidir sin
 * carrera, escribir.
 */

import {
  ESTADO_VACIO,
  alcanza,
  costoMaximo,
  type EstadoDelDia,
} from "../../../../packages/tutor/src/gasto.ts";
import type { TemaVisual } from "../../../../packages/motor/src/bandas.ts";

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

    // El medidor del tutor vive en su propia ruta dentro del MISMO objeto.
    // El plan de F6 §5.1 lo pide así —`math-challenge-ratelimiter-do` ya está
    // inventariado «para tutor calls»— y evita una clase de Durable Object nueva
    // con su migración, su binding y su renglón. Lo que sí cambia respecto del
    // limitador de arriba es la LLAVE: allí es `(acción, IP)` y aquí es el
    // seudónimo diario del perfil, así que dos personas nunca comparten objeto.
    if (url.pathname === "/tutor") return this.tutor(url);

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

  /**
   * El medidor de gasto del tutor (F6 #136, plan §5.1 y §5.3).
   *
   * ─── Por qué el Durable Object y no el AI Gateway ────────────────────────
   *
   * El Gateway cuenta **dólares** y se entera del costo cuando ya se gastó; el
   * objeto cuenta **llamadas** y puede decidir ANTES. Y sobre todo, el Gateway
   * bajo presupuesto sabe devolver 429 o cambiar a un modelo más barato, y este
   * producto no quiere ninguna de las dos: quiere servir la explicación
   * pregenerada revisada por humano, que el Gateway no tiene. Se sigue el plan
   * §5.1, que enmienda D-015 («vía AI Gateway»), y va como enmienda a
   * `docs/dudas.md` (P-15), no como detalle de implementación.
   *
   * ─── Tres verbos, y el orden importa ─────────────────────────────────────
   *
   *  · `consultar` — no escribe nada. Sirve para calcular el peldaño ANTES de
   *    decidir. Si escribiera, una petición que acaba sin llamar al modelo
   *    consumiría cuota igual, y quien más se equivoca ya paga el precio más
   *    alto de esta escalera.
   *  · `reservar` — apunta una llamada y **aparta el costo MÁXIMO** de la banda.
   *    Es lo que hace del tope una cota superior de verdad: sin reserva previa,
   *    la última llamada del día podría rebasarlo por su cuenta.
   *  · `liquidar` — devuelve la reserva y apunta el costo real. Si el proveedor
   *    no mandó `usage`, quien llama ya convirtió eso en el máximo de la banda
   *    (`costoReal`), nunca en cero: un tope que falla abierto en silencio es
   *    peor que no tener tope, porque nadie lo revisa.
   *
   * ─── Qué se guarda, y por cuánto tiempo ──────────────────────────────────
   *
   * Tres enteros. **Ni el id del perfil, ni la banda, ni el locale, ni una sola
   * palabra de lo que nadie dijo.** El nombre del objeto es el seudónimo diario
   * `pd`, que es un HMAC con sal secreta y rota cada día, así que los contadores
   * de ayer no son vinculables con los de hoy. La alarma borra a los siete días
   * (plan §5.3), y `audits/borrado-cuatro-sistemas.mjs` tiene que alcanzar este
   * objeto o el borrado de un perfil no llega hasta aquí.
   */
  private async tutor(url: URL): Promise<Response> {
    const accion = url.searchParams.get("accion") ?? "";
    const estado = (await this.state.storage.get<EstadoDelDia>("tutor")) ?? { ...ESTADO_VACIO };

    if (accion === "consultar") {
      return Response.json({ ...estado, permitido: false, motivo: "consulta" } satisfies MedidaTutor);
    }

    const banda = (url.searchParams.get("banda") ?? "KINDER") as TemaVisual;
    const tope = {
      llamadas: Number(url.searchParams.get("topeLlamadas") ?? "0"),
      microdolares: Number(url.searchParams.get("topeMicrodolares") ?? "0"),
    };

    if (accion === "reservar") {
      if (!alcanza(estado, banda, tope)) {
        return Response.json({ ...estado, permitido: false, motivo: "tope" } satisfies MedidaTutor);
      }
      const nuevo: EstadoDelDia = {
        llamadas: estado.llamadas + 1,
        gastado: estado.gastado,
        reservado: estado.reservado + costoMaximo(banda),
      };
      await this.state.storage.put("tutor", nuevo);
      // Siete días, contados desde la última escritura. El objeto se llama por
      // el `pd` del día, así que a los siete días ya nadie va a volver a él.
      await this.state.storage.setAlarm(Date.now() + RETENCION_TUTOR_MS);
      return Response.json({ ...nuevo, permitido: true, motivo: "reservado" } satisfies MedidaTutor);
    }

    if (accion === "liquidar") {
      const cobrado = Number(url.searchParams.get("microdolares") ?? "0");
      const nuevo: EstadoDelDia = {
        llamadas: estado.llamadas,
        // La reserva se devuelve entera y el costo real se apunta. `Math.max`
        // porque una liquidación sin su reserva —un reinicio a mitad de vuelo—
        // no debe dejar el reservado en negativo, que daría cuota de regalo.
        reservado: Math.max(0, estado.reservado - costoMaximo(banda)),
        gastado: estado.gastado + (Number.isFinite(cobrado) ? cobrado : costoMaximo(banda)),
      };
      await this.state.storage.put("tutor", nuevo);
      return Response.json({ ...nuevo, permitido: true, motivo: "liquidado" } satisfies MedidaTutor);
    }

    return Response.json({ ...estado, permitido: false, motivo: "accion_desconocida" } satisfies MedidaTutor);
  }

  /** La ventana expiró y no volvió nadie: se borra el estado. */
  async alarm(): Promise<void> {
    await this.state.storage.deleteAll();
  }
}

/** Siete días (plan §5.3). Lo que el objeto guarda de un perfil, y nada más. */
export const RETENCION_TUTOR_MS = 7 * 24 * 60 * 60 * 1000;

export interface MedidaTutor extends EstadoDelDia {
  permitido: boolean;
  motivo: string;
}

/**
 * Consulta el medidor del tutor. **Falla CERRADO**, al revés que `consultarLimite`.
 *
 * Y la diferencia no es un descuido: son dos cosas distintas las que se
 * protegen. El limitador de arriba protege contra volumen, y su ausencia deja el
 * formulario **lento**, no abierto — fallar cerrado ahí impediría a un padre
 * crear la cuenta de su hijo. Este medidor protege contra **gasto**, y su
 * ausencia dejaría el gasto sin cota: un objeto caído se convertiría en barra
 * libre de inferencia y nadie se enteraría hasta la factura.
 *
 * Lo que cuesta fallar cerrado aquí es exactamente nada para quien juega: se
 * sirve la explicación pregenerada, que es la misma que recibe el 95% de las
 * veces, instantánea y revisada por humano.
 */
export async function medirTutor(
  ns: DurableObjectNamespace | undefined,
  opciones: {
    pd: string;
    banda: TemaVisual;
    tope: { llamadas: number; microdolares: number };
    accion: "consultar" | "reservar" | "liquidar";
    microdolares?: number;
  },
): Promise<MedidaTutor> {
  const cerrado: MedidaTutor = { ...ESTADO_VACIO, permitido: false, motivo: "sin_medidor" };
  if (!ns || !opciones.pd) return cerrado;
  try {
    const id = ns.idFromName(`tutor:${opciones.pd}`);
    const stub = ns.get(id);
    const q = new URLSearchParams({
      accion: opciones.accion,
      banda: opciones.banda,
      topeLlamadas: String(opciones.tope.llamadas),
      topeMicrodolares: String(opciones.tope.microdolares),
    });
    if (typeof opciones.microdolares === "number") q.set("microdolares", String(opciones.microdolares));
    const r = await stub.fetch(`https://ratelimiter/tutor?${q.toString()}`);
    return (await r.json()) as MedidaTutor;
  } catch {
    return cerrado;
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
