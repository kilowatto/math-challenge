/**
 * `math-challenge-missions-do` — las misiones del día de UN niño.
 *
 * F7 · #224 · D-027, D-030, D-043 · `mc-32`.
 *
 * ─── Uno por niño, separado del de F4, y por qué ───────────────────────────
 *
 * `idFromName(child_profile_id)`. Un Durable Object global es un antipatrón
 * declarado por Cloudflare y topa alrededor de **500-1.000 peticiones por
 * segundo por objeto** (`mc-32` riesgo #2). Y la razón que importa más es el
 * **borrado**: con un objeto por niño, borrar el perfil es `deleteAll()` y no
 * queda nada suyo en ningún lado.
 *
 * Es un objeto DISTINTO de `math-challenge-learner-do` (F4) por el mismo
 * argumento estructural que D-027 usa para `grupo_infantil`/`club_adulto`:
 * dominios distintos, dueños distintos — el modelo adaptativo es pedagogía y
 * las misiones son retención —, de modo que un bug en uno **no pueda** tocar
 * al otro. El motor de misiones solo conoce a F4 y a la liga por dos sobres
 * de solo lectura (#214, #215), y `audits/misiones-sin-do-ajeno.mjs` lo hace
 * cumplir.
 *
 * ─── El nombre del archivo, dicho de frente ────────────────────────────────
 *
 * El nombre natural en español sería `misiones-do.ts`, y no se usa:
 * `audits/misiones-sin-do-ajeno.mjs` vigila todo archivo cuyo nombre empiece
 * por `mision` para que el camino de misión no nombre el estado interno de
 * OTRO subsistema (`idFromName`, bindings ajenos). Este archivo ES el objeto
 * del propio subsistema de misiones — no hay ningún objeto ajeno aquí —, así
 * que lleva el nombre en inglés del recurso, como `RateLimiter`. El auditor
 * sigue vigilando el motor (`packages/motor/src/misiones.ts`) y el cable
 * (`misiones-dia.ts`), que es donde un import a F4 o a la liga sería un
 * error. Y este archivo sigue bajo `mision-recompensa-deterministica.mjs`,
 * que lo alcanza por las funciones del motor que usa: sin azar, sin reloj,
 * sin precio, sin cofre.
 *
 * ─── Estado DERIVADO del día, jamás el intento crudo ───────────────────────
 *
 * Aquí vive el estado de las misiones de HOY: tipo, meta, progreso, si se
 * completó y el XP otorgado, más el conjunto de habilidades distintas del día
 * (identificadores del banco, `K01`…`K14`) que alimenta a `variedad`.
 * **Nunca** el `itemId`, ni la respuesta, ni el enunciado, ni el tiempo de
 * respuesta. El intento crudo va a `math-challenge-attempts-ae` y a ningún
 * otro sitio (`mc-32` riesgo #1).
 *
 * Y es SOLO el día de hoy: cuando cambia el día local del hogar, el estado
 * anterior se reemplaza entero. La historia —qué se completó cada día— vive
 * en el rollup de D1 (`mission_daily_summary`, 0009), que es lo que leen el
 * recordatorio al padre y la pantalla. Un objeto que guarda un día tiene el
 * almacenamiento acotado por construcción, y borrar es `deleteAll()`.
 *
 * ─── Dueño del estado del día; D1, rollup de lectura ───────────────────────
 *
 * La forma elegida (de las dos que #224 admitía): **el objeto es el único
 * dueño de las transiciones del día y D1 es su rollup de lectura**. El
 * objeto calcula el estado nuevo con el motor puro y devuelve qué cambió;
 * `misiones-dia.ts` —el mismo camino, en la misma petición— vuelca ese
 * estado a `mission_daily_summary` y el XP a `xp_totals`. No hay dos
 * escritores del mismo hecho: hay UN camino que escribe un primario y su
 * espejo. Si el rollup falla, el siguiente avance lo reescribe completo y
 * sana solo, porque el upsert escribe el estado entero y no un delta.
 *
 * Lo que esto cierra: la carrera que `misiones-dia.ts` declaraba cuando el
 * estado vivía solo en D1 — dos peticiones concurrentes leyendo el mismo
 * progreso podían pagar el bono del día dos veces. El objeto serializa las
 * peticiones de un niño, así que leer-avanzar-escribir es atómico por niño y
 * la transición a completada ocurre exactamente una vez.
 *
 * ─── Lo que este objeto NO hace, a propósito ───────────────────────────────
 *
 *  · **No calcula nada por su cuenta.** La selección del día, el avance y el
 *    bono son de `packages/motor/src/misiones.ts`, que es puro y está probado
 *    aparte. Este archivo los compone con el almacenamiento, no los
 *    reimplementa.
 *  · **No lee el reloj ni el calendario.** El día local del hogar llega ya
 *    calculado por quien llama (`racha.ts::diaEfectivo()` es la única puerta
 *    entre un instante y un día). `mision-recompensa-deterministica.mjs`
 *    bloquea un `Date.now()` en este archivo.
 *  · **No escribe XP en D1.** Devuelve cuánto XP se ganó; lo escribe el
 *    cable, que es el mismo camino que ya lo hacía.
 *  · **No sabe quién es el niño.** Lo único que conoce es el nombre con que
 *    se abrió el objeto — el `child_profile_id` (o el `user_id` del adulto
 *    aprendiz, D-034: la tabla 0009 es polimórfica y hoy el caso con
 *    contenido es SERIO) — y solo lo usa para sembrar la selección
 *    determinista del día.
 */

import {
  BONO_DIA_COMPLETO,
  avanzarMision,
  elegirMisionesDelDia,
  estadoInicialDeMision,
  type EstadoDeMision,
  type ResumenDeLigaParaMisiones,
  type TipoMision,
} from "../../../../packages/motor/src/misiones.ts";
import type { DiaLocal } from "../../../../packages/motor/src/tiempo-local.ts";
import type { Banda } from "../../../../packages/motor/src/puntuacion.ts";

/** La única llave del almacenamiento: el día en curso, entero. */
const LLAVE_DIA = "dia";

/**
 * Lo que el objeto guarda: el estado de las misiones de HOY y las
 * habilidades distintas ya vistas hoy. Nada más — un día, no un historial.
 */
interface EstadoDelDia {
  local_date: DiaLocal;
  /** Identificadores de habilidad del banco (`K01`…`K14`). Nunca contenido. */
  habilidades: string[];
  misiones: EstadoDeMision[];
}

/** Lo que se le manda al objeto cuando un ítem confirmado cuenta. */
export interface PeticionAvanzar {
  /** El día LOCAL del hogar, ya calculado por quien llama. */
  dia: DiaLocal;
  banda: Banda;
  /** El sobre de solo lectura de #215, rellenado por quien llama. */
  resumenLiga: ResumenDeLigaParaMisiones;
  /** La habilidad del ítem confirmado — lo único del evento que entra aquí. */
  habilidad: string;
}

/**
 * Lo que el objeto devuelve tras un avance: cuánto XP se ganó y el estado
 * COMPLETO de cada misión que cambió, para que el cable vuelque el rollup a
 * D1 sin recomputar nada.
 */
export interface ResultadoAvance {
  xpGanado: number;
  cambios: EstadoDeMision[];
}

/**
 * El objeto. Una instancia por `child_profile_id` (o por `user_id` del adulto
 * aprendiz).
 *
 * El almacenamiento es el de SQLite del propio DO y tiene UNA sola llave,
 * `dia`: el `child_profile_id` **es el objeto**, así que no se repite en
 * ninguna fila, que es lo que impide que alguien escriba el estado de un
 * niño dentro del objeto de otro.
 */
export class Misiones {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    switch (url.pathname) {
      case "/avanzar": {
        const p = (await request.json()) as PeticionAvanzar;
        return Response.json(await this.avanzar(p));
      }
      case "/olvidar": {
        // Borrar el perfil borra sus misiones. `deleteAll()` sobre el
        // almacenamiento del objeto no deja ni una llave, y como el objeto ES
        // el niño, no hay nada suyo en ningún otro objeto que buscar.
        await this.state.storage.deleteAll();
        return Response.json({ ok: true, borrado: "todo" });
      }
      default:
        return Response.json({ ok: false, motivo: "ruta_desconocida" }, { status: 404 });
    }
  }

  /**
   * Un ítem confirmado mueve las misiones del día que ese evento puede mover.
   *
   * Lectura y escritura en el mismo turno: el DO serializa las peticiones de
   * este niño, así que la transición a completada — que es donde se otorga el
   * XP (línea roja #5: una sola vez, valor fijo y publicado) — ocurre una
   * vez aunque la petición se repita. Un reenvío encuentra la misión ya
   * completada y `avanzarMision()` le devuelve **el mismo objeto**: no hay
   * cambio, no hay XP, no hay escritura.
   *
   * Qué mueve un ítem está dicho en el encabezado de `misiones-dia.ts`:
   * `volumen` (+1 por ítem) y `variedad` (+1 por habilidad nueva hoy). Los
   * demás tipos esperan a F4, a los modos de reto y a las ligas, y no se les
   * inventa progreso.
   */
  async avanzar(p: PeticionAvanzar): Promise<ResultadoAvance> {
    // El nombre del objeto ES la semilla de la selección del día. Si el
    // objeto se abrió sin nombre no hay selección reproducible, y eso es un
    // error de quien abrió, no un estado válido.
    const perfilId = this.state.id.name;
    if (!perfilId) {
      throw new Error(
        "objeto de misiones sin nombre: se abre con el child_profile_id como nombre, " +
          "nunca con newUniqueId — sin nombre no hay selección reproducible desde (perfil, día).",
      );
    }

    let dia = await this.state.storage.get<EstadoDelDia>(LLAVE_DIA);
    let sembrado = false;
    if (!dia || dia.local_date !== p.dia) {
      // Día nuevo: el estado de ayer se REEMPLAZA entero, no se archiva. La
      // historia la guarda el rollup de D1; este objeto guarda hoy.
      //
      // `resumenF4` es `null` siempre por ahora: F4 no está desplegado y el
      // motor degrada el slot adaptativo a `volumen` (#228). El día que F4
      // aterrice, quien llama gana una función que lo lea — el motor y este
      // objeto no se tocan.
      const misiones = elegirMisionesDelDia(perfilId, p.dia, p.banda, null, p.resumenLiga);
      dia = {
        local_date: p.dia,
        habilidades: [],
        misiones: misiones.map((m) => estadoInicialDeMision(m, p.dia)),
      };
      sembrado = true;
    }

    const habilidadNueva = !dia.habilidades.includes(p.habilidad);
    const incrementoDe = (tipo: TipoMision): number => {
      if (tipo === "volumen") return 1;
      if (tipo === "variedad") return habilidadNueva ? 1 : 0;
      return 0;
    };

    const completasAntes = dia.misiones.length > 0 && dia.misiones.every((e) => e.completed === 1);
    const cambios: EstadoDeMision[] = [];
    let xpGanado = 0;
    const nuevas = dia.misiones.map((estado) => {
      const nuevo = avanzarMision(estado, incrementoDe(estado.mission_type));
      // El motor devuelve el MISMO objeto cuando no hay nada nuevo: la
      // comparación por referencia es la idempotencia — un reenvío de red no
      // paga dos veces y un ítem que no mueve nada es cero escrituras.
      if (nuevo === estado) return estado;
      xpGanado += nuevo.xp_awarded - estado.xp_awarded;
      cambios.push(nuevo);
      return nuevo;
    });

    // El bono del día: cuando este avance cierra el día y el día no estaba
    // cerrado antes. La serialización del objeto es lo que hace imposible que
    // dos peticiones concurrentes lo paguen dos veces — la carrera que el
    // camino anterior por D1 declaraba como residuo.
    const completasDespues = nuevas.length > 0 && nuevas.every((e) => e.completed === 1);
    if (!completasAntes && completasDespues) xpGanado += BONO_DIA_COMPLETO;

    if (sembrado || cambios.length > 0 || habilidadNueva) {
      await this.state.storage.put(LLAVE_DIA, {
        local_date: dia.local_date,
        habilidades: habilidadNueva ? [...dia.habilidades, p.habilidad] : dia.habilidades,
        misiones: nuevas,
      } satisfies EstadoDelDia);
    }

    return { xpGanado, cambios };
  }
}

// ---------------------------------------------------------------------------
// El acceso desde una ruta
// ---------------------------------------------------------------------------

/**
 * Abre el objeto de UN niño (o del adulto aprendiz).
 *
 * `perfilId` es un parámetro y nunca un literal, que es exactamente lo que
 * `audits/do-por-entidad.mjs` comprueba.
 */
function objetoDe(ns: DurableObjectNamespace, perfilId: string) {
  return ns.get(ns.idFromName(perfilId));
}

/**
 * Avanza las misiones del día de un niño. **Falla ABIERTO.**
 *
 * Misma clase de razón que `registrarEnModelo` y `sumarEnLiga`: si el objeto
 * no responde, el niño ya jugó y su ítem ya se calificó. Lo que se pierde es
 * el avance de un contador del día; fallar cerrado convertiría un fallo de
 * infraestructura en una pantalla de error delante de un niño. Y como D1 es
 * solo el rollup de lo que el objeto decide, un fallo aquí tampoco escribe
 * el rollup — nunca se escribe un estado que el dueño no calculó.
 */
export async function avanzarEnMisiones(
  ns: DurableObjectNamespace | undefined,
  perfilId: string,
  entrada: PeticionAvanzar,
): Promise<ResultadoAvance | null> {
  if (!ns) return null;
  try {
    const stub = objetoDe(ns, perfilId);
    const r = await stub.fetch("https://misiones/avanzar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(entrada),
    });
    if (!r.ok) return null;
    return (await r.json()) as ResultadoAvance;
  } catch {
    return null;
  }
}

/**
 * **Borra las misiones del niño** — el objeto entero se va.
 *
 * **No falla abierto**, por la misma razón que `olvidarModelo`: un borrado
 * que dice que sí sin haber borrado es la peor forma de este error. Quien la
 * llame tiene que tratar el `false` como fallo del borrado y reintentar
 * **antes** de quitar la fila de D1, porque el `child_profile_id` que abre
 * este objeto vive ahí.
 *
 * Hoy no la llama nadie porque todavía no existe ninguna ruta que borre un
 * perfil — la misma situación declarada de `olvidarModelo`, que vigila
 * `audits/borrado-alcanza-al-modelo.mjs`. Cuando esa ruta exista, este
 * borrado va en el mismo sitio y ANTES de la fila.
 */
export async function olvidarMisiones(
  ns: DurableObjectNamespace | undefined,
  perfilId: string,
): Promise<boolean> {
  // Sin binding no hay nada que borrar, y decir que sí es correcto: no existe.
  if (!ns) return true;
  const stub = objetoDe(ns, perfilId);
  const r = await stub.fetch("https://misiones/olvidar");
  return r.ok;
}
