/**
 * `math-challenge-classroom-do` — el estado vivo de UN grupo infantil.
 *
 * F9 · issues #379-#387 · D-027, D-086, D-087, D-098 (el DO por grupo, según
 * el reparto del orquestador) · `mc-32`.
 *
 * ─── Uno por grupo, jamás uno global ────────────────────────────────────────
 *
 * `idFromName(group_id)`. Un Durable Object es de un solo hilo y topa alrededor
 * de 500-1.000 peticiones por segundo por objeto (`mc-32` riesgo #2): un objeto
 * para todos los grupos sería un cuello de botella que funciona perfecto con
 * cinco salones de prueba y se descubre en producción.
 * `audits/do-por-entidad.mjs` bloquea el commit si algún `idFromName` recibe
 * un literal.
 *
 * Y la razón que importa más: **el borrado**. Cuando se borra el grupo (o a su
 * dueño, en cascada), lo que queda aquí se borra entero con `deleteAll()`. Con
 * un objeto compartido habría que ir a buscar las filas de cada niño dentro —
 * la clase de borrado que se hace mal una vez y nadie se entera.
 *
 * ─── Qué guarda, y qué jamás ────────────────────────────────────────────────
 *
 * Por miembro: alias generado, avatar, banda (solo para calcular la posición
 * visible), puntos y racha **ya calculados**, y la marca de opt-in. Nunca el
 * intento crudo (eso va a `math-challenge-attempts-ae` y a ningún otro sitio,
 * `mc-32` riesgo #1 — `audits/no-attempts-in-d1.mjs` vigila las clases de DO),
 * nunca nombre real, nunca edad exacta, nunca los otros grupos del niño
 * (D-027). No hay `last_seen` ni contador de sockets: la presencia en vivo es
 * lo que hace que un niño se quede esperando (condición 2 de D-081).
 *
 * ─── La regla que hace distinto a este objeto: el opt-in ────────────────────
 *
 * `/tabla` —la vista ordenada por posición— **excluye a los miembros con
 * `leaderboard_opt_in = 0`** (D-087: opt-in, apagado por default, en toda
 * banda). Un niño sin opt-in sigue en el roster del dueño —alias, racha y
 * puntos, la visibilidad mínima de D-027— pero ninguna vista ordenada por
 * posición lo incluye. El filtro vive AQUÍ y no en cada lector: una consulta
 * que lo olvide no puede escribirse, porque el objeto no ofrece otra tabla.
 * `audits/grupo-visibilidad-minima.mjs` lo verifica contra una tabla de
 * precondiciones escrita a mano (D-070).
 *
 * ─── Lo que este objeto NO sabe, a propósito ────────────────────────────────
 *
 *  · **No sabe quién está conectado.** La difusión manda la tabla entera y
 *    nunca «fulano acaba de sumar»: ese mensaje es presencia con otro nombre.
 *  · **No calcula puntos ni rachas.** Llegan con cada `/sumar` ya calculados
 *    por el servidor (D-010) y aquí solo se copian.
 *  · **No tiene canal de entrada.** Los mensajes del cliente se ignoran: un
 *    socket donde el cliente puede mandar contenido es un chat esperando a que
 *    alguien lo lea (línea roja #3), y un grupo infantil no tiene chat en
 *    ninguna dirección.
 */

import {
  ordenar,
  posicionVisible,
  type Membresia,
} from "../../../../packages/motor/src/liga.ts";
import {
  visibleEnTablaDePosiciones,
  type OrigenDeGrupo,
} from "../../../../packages/motor/src/grupo.ts";
import type { Banda } from "../../../../packages/motor/src/puntuacion.ts";

/** El prefijo de las llaves de miembro dentro del almacenamiento del objeto. */
const PREFIJO = "m:";

/** La llave del encabezado del grupo: origen y tope. */
const CABECERA = "grupo";

/**
 * Lo que el objeto guarda por miembro.
 *
 * `alias`, `avatar_parts` y `banda` se guardan aquí —duplicados de D1— porque
 * la difusión tiene que poder armarse sin ir a la base en cada reto cerrado.
 * Es la única duplicación del objeto, con la consecuencia dicha en `liga-do`:
 * si un padre cambia el avatar, el grupo lo refleja al siguiente cierre de
 * reto, no al instante.
 *
 * `banda` se almacena y NO se proyecta: sirve únicamente para que
 * `posicionVisible()` dé tercios en KINDER y número exacto de PRIMARIA en
 * adelante (D-081). Un miembro nunca ve la banda de otro.
 */
interface FilaDeMiembro {
  membership_id: string;
  alias: string;
  avatar_parts: string;
  banda: Banda;
  /** Los puntos ya calculados por el servidor. Acotados a 0 por abajo. */
  puntos: number;
  /** La racha en curso, de solo lectura: llega calculada, jamás se deriva aquí. */
  current_streak: number;
  /** La decisión del PADRE al aprobar (D-087, D-101). 0 = no aparece ordenado. */
  opt_in: 0 | 1;
  joined_at: number;
}

interface Cabecera {
  origen_tipo: OrigenDeGrupo;
  max_size: number;
}

/**
 * Lo que se le manda a un miembro del grupo cuando la tabla cambia.
 *
 * La lista cerrada de D-027: alias, avatar, puntos, racha y la posición
 * visible. **Nada más puede salir de aquí** — los campos se copian uno a uno
 * en `tabla()`, nunca con `...fila`, para que añadir un campo al
 * almacenamiento no lo publique al grupo entero sin que nadie lo decida.
 */
export interface FilaDifundida {
  alias: string;
  avatar_parts: string;
  puntos: number;
  current_streak: number;
  /** Tercio en KINDER, número exacto de PRIMARIA en adelante (D-081). */
  posicion: ReturnType<typeof posicionVisible>;
}

/**
 * El grupo, en vivo.
 *
 * Una instancia por `group_id`, con difusión por WebSocket usando la **API de
 * hibernación** (`acceptWebSocket`): sin ella, treinta sockets abiertos
 * mantienen el objeto en memoria aunque nadie esté jugando.
 */
export class Salon {
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
        const f = (await request.json()) as Omit<FilaDeMiembro, "puntos" | "current_streak">;
        return Response.json(await this.unir(f));
      }
      case "/sumar": {
        const p = (await request.json()) as {
          membership_id: string;
          puntos: number;
          racha?: number;
        };
        return Response.json(await this.sumar(p));
      }
      case "/tabla":
        return Response.json(await this.tabla());
      case "/olvidar": {
        // Un niño removido, o un grupo borrado, no deja nada detrás. Remover
        // corta la visibilidad DE INMEDIATO (issue #386: no «al día siguiente»).
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

  private async unir(f: Omit<FilaDeMiembro, "puntos" | "current_streak">) {
    if (f.opt_in !== 1) return { ok: true, nuevo: false, visible: false };
    const llave = PREFIJO + f.membership_id;
    const previa = await this.state.storage.get<FilaDeMiembro>(llave);
    if (previa) return { ok: true, nuevo: false };

    const fila: FilaDeMiembro = {
      membership_id: f.membership_id,
      alias: f.alias,
      avatar_parts: f.avatar_parts,
      banda: f.banda,
      puntos: 0,
      current_streak: 0,
      opt_in: f.opt_in,
      joined_at: f.joined_at,
    };
    await this.state.storage.put(llave, fila);
    await this.difundir();
    return { ok: true, nuevo: true };
  }

  /**
   * Copia los puntos y la racha de un reto ya calificado.
   *
   * `puntos` puede ser negativo —la fórmula de D-010 resta al fallar rápido—
   * y por eso el acumulado se acota a 0 por abajo: un total negativo en la
   * tabla del grupo sería lenguaje de pérdida escrito con un número, que es lo
   * que la condición 3 de D-081 prohíbe. La racha llega ya calculada (la mide
   * `racha.ts`, no este objeto) y se copia, nunca se deriva.
   */
  private async sumar(p: { membership_id: string; puntos: number; racha?: number }) {
    const llave = PREFIJO + p.membership_id;
    const fila = await this.state.storage.get<FilaDeMiembro>(llave);
    if (!fila) return { ok: false, motivo: "sin_membresia" };

    const nueva: FilaDeMiembro = {
      ...fila,
      puntos: Math.max(0, fila.puntos + p.puntos),
      current_streak:
        typeof p.racha === "number" && Number.isFinite(p.racha)
          ? Math.max(0, Math.floor(p.racha))
          : fila.current_streak,
    };

    await this.state.storage.put(llave, nueva);
    await this.difundir();
    return { ok: true, puntos: nueva.puntos };
  }

  /**
   * La tabla ordenada, ya proyectada a lo que un miembro del grupo puede ver.
   *
   * Dos reglas hacen el trabajo entero de D-027 y D-087:
   *
   *  1. **Solo entran los miembros con opt-in.** `visibleEnTablaDePosiciones`
   *     es la función del motor, no un `if` reescrito aquí: dos copias de la
   *     regla son dos oportunidades de ablandar una.
   *  2. **Los campos se copian UNO A UNO**, nunca con `...fila` — es lo que
   *     impide que añadir un campo al almacenamiento lo publique al grupo
   *     sin que nadie lo decida.
   */
  async tabla(): Promise<FilaDifundida[]> {
    const filas = [...(await this.state.storage.list<FilaDeMiembro>({ prefix: PREFIJO })).values()]
      .filter((f) => visibleEnTablaDePosiciones(f.opt_in));

    const comoMembresia: Membresia[] = filas.map((f) => ({
      id: f.membership_id,
      child_profile_id: null,
      user_id: null,
      points_this_week: f.puntos,
      active_days: 0,
      joined_at: f.joined_at,
    }));

    const orden = ordenar(comoMembresia);
    const porId = new Map(filas.map((f) => [f.membership_id, f]));

    return orden.map((m, i) => {
      const f = porId.get(m.id)!;
      return {
        alias: f.alias,
        avatar_parts: f.avatar_parts,
        puntos: f.puntos,
        current_streak: f.current_streak,
        posicion: posicionVisible(f.banda, i + 1, orden.length),
      };
    });
  }

  /**
   * Manda la tabla a todos los sockets abiertos.
   *
   * No manda cuántos hay abiertos, ni quién acaba de conectarse, ni quién
   * acaba de jugar. Se manda la tabla entera —ya filtrada por opt-in— y quien
   * mire verá que cambió.
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
 * Abre el objeto de UN grupo.
 *
 * `groupId` es un parámetro y nunca un literal, que es exactamente lo que
 * `audits/do-por-entidad.mjs` comprueba.
 */
function objetoDe(ns: DurableObjectNamespace, groupId: string) {
  return ns.get(ns.idFromName(groupId));
}

/**
 * Suma los puntos de un reto al grupo. **Falla ABIERTO.**
 *
 * Misma clase de razón que `sumarEnLiga`: si el objeto no responde, el niño ya
 * jugó y su reto ya se calificó. Lo que se pierde es la actualización de una
 * tabla social; fallar cerrado convertiría un fallo de infraestructura en una
 * pantalla de error delante de un niño.
 */
export async function sumarEnSalon(
  ns: DurableObjectNamespace | undefined,
  groupId: string,
  entrada: { membership_id: string; puntos: number; racha?: number },
): Promise<boolean> {
  if (!ns) return false;
  try {
    const stub = objetoDe(ns, groupId);
    const r = await stub.fetch("https://salon/sumar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(entrada),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/** Nombre de dominio del mismo cable: un grupo, no necesariamente un salón. */
export const sumarEnGrupo = sumarEnSalon;

/** Une o refresca una membresía visible. Nunca envía miembros sin opt-in. */
export async function unirEnSalon(
  ns: DurableObjectNamespace | undefined,
  groupId: string,
  entrada: {
    membership_id: string;
    alias: string;
    avatar_parts: string;
    banda: Banda;
    opt_in: 0 | 1;
    joined_at: number;
  },
): Promise<boolean> {
  if (!ns || entrada.opt_in !== 1) return false;
  try {
    const stub = objetoDe(ns, groupId);
    const r = await stub.fetch("https://salon/unir", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(entrada),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/** La tabla de un grupo —solo miembros con opt-in—. Vacía si el objeto no está. */
export async function leerTablaDeSalon(
  ns: DurableObjectNamespace | undefined,
  groupId: string,
): Promise<FilaDifundida[]> {
  if (!ns) return [];
  try {
    const stub = objetoDe(ns, groupId);
    return (await (await stub.fetch("https://salon/tabla")).json()) as FilaDifundida[];
  } catch {
    return [];
  }
}

/**
 * Borra a un miembro del grupo, o el grupo entero.
 *
 * **No falla abierto**, por la misma razón que `olvidarEnLiga`: un borrado que
 * dice que sí sin haber borrado es la peor forma de este error. Quien la llame
 * tiene que tratar el `false` como fallo del borrado y reintentar **antes** de
 * quitar la fila de D1, porque el `group_id` que abre este objeto vive ahí.
 */
export async function olvidarEnSalon(
  ns: DurableObjectNamespace | undefined,
  groupId: string,
  membershipId?: string,
): Promise<boolean> {
  if (!ns) return true;
  const stub = objetoDe(ns, groupId);
  const q = membershipId ? `?membership_id=${encodeURIComponent(membershipId)}` : "";
  const r = await stub.fetch(`https://salon/olvidar${q}`);
  return r.ok;
}
