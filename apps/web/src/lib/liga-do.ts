/**
 * `math-challenge-league-do` — el estado vivo de UNA liga.
 *
 * F7 · #237, #242, #243 · D-030, D-043, D-081 · `mc-32`.
 *
 * ─── Uno por cohorte, y por qué eso no es un detalle de rendimiento ────────
 *
 * `idFromName(cohort_id)`. Un Durable Object global es un antipatrón declarado
 * por Cloudflare y topa alrededor de **500-1.000 peticiones por segundo por
 * objeto** (`mc-32` riesgo #2): un objeto para todas las ligas convierte el
 * tablero entero en un cuello de botella que nadie ve venir hasta que hay
 * tráfico. `audits/do-por-entidad.mjs` bloquea el commit si algún `idFromName`
 * recibe un literal.
 *
 * Y la segunda razón, que importa más: **el borrado**. Con un objeto por
 * cohorte, y una cohorte que dura una semana, lo que queda de una liga cerrada
 * se borra entero. Con un objeto compartido habría que ir a buscar las filas de
 * cada participante dentro, que es la clase de borrado que se hace mal una vez
 * y nadie se entera.
 *
 * ─── Estado DERIVADO, jamás el intento crudo (#242) ────────────────────────
 *
 * Aquí viven tres números por miembro: puntos de la semana, días activos y el
 * instante de la última escritura. **Nunca** el `itemId`, ni la respuesta, ni el
 * tiempo de respuesta, ni el enunciado. El intento crudo va a
 * `math-challenge-attempts-ae` y a ningún otro sitio (`mc-32` riesgo #1), y
 * `audits/no-attempts-in-d1.mjs` —extendido a las clases de DO en este mismo
 * PR— bloquea el commit que meta el primero.
 *
 * ─── Lo que este objeto NO sabe, a propósito ───────────────────────────────
 *
 *  · **No sabe quién está conectado.** No hay contador de sockets abiertos, no
 *    hay `last_seen`, y la difusión no lleva ninguna señal de presencia. Es la
 *    condición 2 de D-081: la presencia en vivo es lo que hace que un niño se
 *    quede esperando a que el otro aparezca.
 *  · **No sabe el nombre de nadie.** Recibe alias generados
 *    (`packages/motor/src/alias.ts`) y no tiene ningún campo donde quepa un
 *    nombre real. Línea roja #2.
 *  · **No sabe de rachas, XP ni escudos.** Condición 1 de D-081: la liga no
 *    puede quitar nada, y la forma más barata de que no pueda es que no tenga
 *    delante ningún contador de aprendizaje.
 *  · **No calcula puntos.** Los calcula `calificar()` en el servidor (F3, D-010)
 *    y aquí solo se suman.
 */

import {
  ordenar,
  posicionVisible,
  type Membresia,
  type TipoParticipante,
} from "../../../../packages/motor/src/liga.ts";
import type { Banda } from "../../../../packages/motor/src/puntuacion.ts";

/** El prefijo de las llaves de miembro dentro del almacenamiento del objeto. */
const PREFIJO = "m:";

/** La llave del encabezado de la cohorte: banda, tipo y escalon. */
const CABECERA = "cohorte";

/**
 * Lo que el objeto guarda por miembro. Tres números y dos cadenas de identidad
 * pública, y nada más.
 *
 * `alias` y `avatar_parts` se guardan aquí —duplicados de D1— porque la
 * difusión tiene que poder armarse sin ir a la base en cada reto cerrado. Es la
 * única duplicación del objeto y se paga con una consecuencia dicha: si un
 * padre cambia el avatar, la liga lo refleja al siguiente cierre de reto, no al
 * instante.
 */
interface FilaDeMiembro {
  membership_id: string;
  alias: string;
  avatar_parts: string;
  points_this_week: number;
  active_days: number;
  /** El último día local ya contado, `YYYY-MM-DD`. Evita contar dos veces. */
  ultimo_dia: string | null;
  joined_at: number;
}

interface Cabecera {
  banda: Banda;
  tipo_participante: TipoParticipante;
  escalon: number;
  week_start: string;
}

/** Lo que se le manda a un miembro cuando la tabla cambia (#242, §6.1). */
export interface FilaDifundida {
  alias: string;
  avatar_parts: string;
  points_this_week: number;
  /** Tercio en KINDER, número exacto de PRIMARIA en adelante (D-081). */
  posicion: ReturnType<typeof posicionVisible>;
}

/**
 * La cohorte, en vivo.
 *
 * Una instancia por `cohort_id`, con difusión por WebSocket para que la tabla
 * se actualice sin refrescar. La difusión usa la **API de hibernación**
 * (`acceptWebSocket`): sin ella, treinta sockets abiertos mantienen el objeto
 * en memoria toda la semana aunque nadie esté jugando.
 */
export class Liga {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.headers.get("upgrade") === "websocket") {
      const par = new WebSocketPair();
      // Hibernación: el objeto puede descargarse de memoria con los sockets
      // abiertos y volver cuando llegue un mensaje.
      this.state.acceptWebSocket(par[1]);
      return new Response(null, { status: 101, webSocket: par[0] });
    }

    switch (url.pathname) {
      case "/abrir": {
        const c = (await request.json()) as Cabecera;
        await this.state.storage.put(CABECERA, c);
        return Response.json({ ok: true });
      }
      case "/unir": {
        const f = (await request.json()) as Omit<
          FilaDeMiembro,
          "points_this_week" | "active_days" | "ultimo_dia"
        >;
        return Response.json(await this.unir(f));
      }
      case "/sumar": {
        const p = (await request.json()) as {
          membership_id: string;
          puntos: number;
          dia_local: string;
        };
        return Response.json(await this.sumar(p));
      }
      case "/tabla":
        return Response.json(await this.tabla());
      case "/olvidar": {
        // Una cohorte cerrada, o un participante borrado, no deja nada detrás.
        const q = url.searchParams.get("membership_id");
        if (q) await this.state.storage.delete(PREFIJO + q);
        else await this.state.storage.deleteAll();
        return Response.json({ ok: true });
      }
      default:
        return Response.json({ ok: false, motivo: "ruta_desconocida" }, { status: 404 });
    }
  }

  /**
   * Los mensajes del cliente se ignoran, y eso es la línea roja #3 hecha
   * código: un socket abierto es un canal, y un canal donde el cliente puede
   * mandar contenido es un chat esperando a que alguien lo lea. Aquí no hay
   * nadie leyendo.
   */
  async webSocketMessage(_ws: WebSocket, _mensaje: string | ArrayBuffer): Promise<void> {
    /* sin canal de entrada, a propósito */
  }

  private async unir(f: Omit<FilaDeMiembro, "points_this_week" | "active_days" | "ultimo_dia">) {
    const llave = PREFIJO + f.membership_id;
    const previa = await this.state.storage.get<FilaDeMiembro>(llave);
    if (previa) return { ok: true, nuevo: false };

    const fila: FilaDeMiembro = {
      membership_id: f.membership_id,
      alias: f.alias,
      avatar_parts: f.avatar_parts,
      points_this_week: 0,
      active_days: 0,
      ultimo_dia: null,
      joined_at: f.joined_at,
    };
    await this.state.storage.put(llave, fila);
    await this.difundir();
    return { ok: true, nuevo: true };
  }

  /**
   * Suma los puntos de un reto ya calificado.
   *
   * `dia_local` es el día del hogar (`racha.ts::diaEfectivo`) y sirve para una
   * sola cosa: contar `active_days` sin contar dos veces el mismo día. Es el
   * número del que depende que un inactivo no ocupe cupo de descenso, así que
   * contarlo mal significa hacer descender a alguien que sí jugó.
   *
   * **`puntos` puede ser negativo** —la fórmula de D-010 resta al fallar
   * rápido— y por eso el acumulado se acota a 0 por abajo. Un total negativo en
   * la tabla de la liga sería lenguaje de pérdida escrito con un número, que es
   * lo que la condición 3 de D-081 prohíbe.
   */
  private async sumar(p: { membership_id: string; puntos: number; dia_local: string }) {
    const llave = PREFIJO + p.membership_id;
    const fila = await this.state.storage.get<FilaDeMiembro>(llave);
    if (!fila) return { ok: false, motivo: "sin_membresia" };

    const nueva: FilaDeMiembro = {
      ...fila,
      points_this_week: Math.max(0, fila.points_this_week + p.puntos),
      active_days:
        fila.ultimo_dia === p.dia_local ? fila.active_days : Math.min(7, fila.active_days + 1),
      ultimo_dia: p.dia_local,
    };

    await this.state.storage.put(llave, nueva);
    await this.difundir();
    return { ok: true, points_this_week: nueva.points_this_week };
  }

  /** La tabla ordenada, ya proyectada a lo que un par puede ver. */
  async tabla(): Promise<FilaDifundida[]> {
    const cab = await this.state.storage.get<Cabecera>(CABECERA);
    const banda: Banda = cab?.banda ?? "PRIMARIA";
    const filas = [...(await this.state.storage.list<FilaDeMiembro>({ prefix: PREFIJO })).values()];

    const comoMembresia: Membresia[] = filas.map((f) => ({
      id: f.membership_id,
      child_profile_id: null,
      user_id: null,
      points_this_week: f.points_this_week,
      active_days: f.active_days,
      joined_at: f.joined_at,
    }));

    const orden = ordenar(comoMembresia);
    const porId = new Map(filas.map((f) => [f.membership_id, f]));

    // Los campos se copian UNO A UNO, nunca con `...fila`. Es lo que impide que
    // añadir un campo al almacenamiento lo publique a los treinta pares sin que
    // nadie lo decida — «nunca un campo adicional porque ya estaba en la fila»
    // es criterio literal de #242.
    return orden.map((m, i) => {
      const f = porId.get(m.id)!;
      return {
        alias: f.alias,
        avatar_parts: f.avatar_parts,
        points_this_week: f.points_this_week,
        posicion: posicionVisible(banda, i + 1, orden.length),
      };
    });
  }

  /**
   * Manda la tabla a todos los sockets abiertos.
   *
   * No manda cuántos hay abiertos, ni quién acaba de conectarse, ni quién
   * acaba de jugar. Un mensaje que dijera «Nutria Veloz acaba de sumar 40» es
   * presencia con otro nombre: dice que esa persona está delante de la pantalla
   * ahora mismo. Se manda la tabla entera y quien mire verá que cambió.
   */
  private async difundir(): Promise<void> {
    const sockets = this.state.getWebSockets();
    if (sockets.length === 0) return;
    const carga = JSON.stringify({ tipo: "tabla", filas: await this.tabla() });
    for (const ws of sockets) {
      try {
        ws.send(carga);
      } catch {
        /* un socket muerto no puede tumbar el cierre de un reto */
      }
    }
  }
}

// ---------------------------------------------------------------------------
// El acceso desde una ruta
// ---------------------------------------------------------------------------

/**
 * Abre el objeto de UNA cohorte.
 *
 * `cohortId` es un parámetro y nunca un literal, que es exactamente lo que
 * `audits/do-por-entidad.mjs` comprueba.
 */
function objetoDe(ns: DurableObjectNamespace, cohortId: string) {
  return ns.get(ns.idFromName(cohortId));
}

/**
 * Suma los puntos de un reto a la liga. **Falla ABIERTO.**
 *
 * Misma clase de razón que `registrarEnModelo`: si el objeto no responde, el
 * niño ya jugó y su reto ya se calificó. Lo que se pierde es la actualización
 * de una tabla social; fallar cerrado convertiría un fallo de infraestructura
 * en una pantalla de error delante de un niño.
 *
 * La consecuencia, dicha: puntos de liga perdidos en silencio. El total del
 * tablero global (`score_totals`) no depende de esto — se escribe por su propio
 * rollup— así que lo que se pierde es la posición de la semana, no el progreso.
 */
export async function sumarEnLiga(
  ns: DurableObjectNamespace | undefined,
  cohortId: string,
  entrada: { membership_id: string; puntos: number; dia_local: string },
): Promise<boolean> {
  if (!ns) return false;
  try {
    const stub = objetoDe(ns, cohortId);
    const r = await stub.fetch("https://liga/sumar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(entrada),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/** La tabla de una liga. Devuelve vacío si el objeto no está. */
export async function leerTablaDeLiga(
  ns: DurableObjectNamespace | undefined,
  cohortId: string,
): Promise<FilaDifundida[]> {
  if (!ns) return [];
  try {
    const stub = objetoDe(ns, cohortId);
    return (await (await stub.fetch("https://liga/tabla")).json()) as FilaDifundida[];
  } catch {
    return [];
  }
}

/**
 * Borra a un participante de la liga, o la liga entera.
 *
 * **No falla abierto**, por la misma razón que `olvidarModelo`: un borrado que
 * dice que sí sin haber borrado es la peor forma de este error. Quien la llame
 * tiene que tratar el `false` como fallo del borrado y reintentar **antes** de
 * quitar la fila de D1, porque el `cohort_id` que abre este objeto vive ahí.
 */
export async function olvidarEnLiga(
  ns: DurableObjectNamespace | undefined,
  cohortId: string,
  membershipId?: string,
): Promise<boolean> {
  if (!ns) return true;
  const stub = objetoDe(ns, cohortId);
  const q = membershipId ? `?membership_id=${encodeURIComponent(membershipId)}` : "";
  const r = await stub.fetch(`https://liga/olvidar${q}`);
  return r.ok;
}
