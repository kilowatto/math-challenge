/**
 * El cable entre el motor de misiones diarias y una persona de verdad.
 *
 * `packages/motor/src/misiones.ts` estaba escrito, probado y auditado por cuatro
 * guardianes — y no lo llamaba nadie, igual que le pasó a la racha hasta que
 * existió `progreso.ts`. Este módulo es la otra mitad. **No contiene ni una
 * fórmula**: elegir, avanzar y cerrar son del motor; aquí solo se lee y se
 * escribe.
 *
 * ─── El Durable Object es el dueño del día (#224, 2026-08-03) ──────────────
 *
 * Desde #224 el estado del día lo posee `math-challenge-missions-do`
 * (`missions-do.ts`): UN objeto por niño —`idFromName(child_profile_id)`—
 * separado del de F4 por el argumento estructural de D-027. El objeto calcula
 * las transiciones con el motor puro y devuelve qué cambió; ESTE módulo vuelca
 * ese resultado a D1 en la misma petición. La forma, de las dos que el issue
 * admitía: **el DO es el dueño del estado del día y D1
 * (`mission_daily_summary`) es el rollup de lectura** — lo que pinta la
 * pantalla y lo que consulta el recordatorio al padre. No hay dos escritores
 * del mismo hecho: hay UN camino (este) que escribe un primario y su espejo,
 * y el espejo se escribe con el estado completo, así que un rollup fallido se
 * sana solo en el siguiente avance.
 *
 * Lo que la forma cierra: la carrera de las dos peticiones concurrentes que
 * podían pagar el bono del día dos veces — el objeto serializa las peticiones
 * de un niño y la transición a completada ocurre exactamente una vez. Y lo que
 * NO cambia: si el objeto no responde, se pierde un contador y no el juego —
 * este módulo sigue sin lanzar nunca.
 *
 * ─── Quién ve menú y quién no ──────────────────────────────────────────────
 *
 * KINDER no tiene menú de misiones (#213, D-092 §5): su «misión» es el reto
 * HISTORIA del día, una etiqueta interna sin UI. `elegirMisionesDelDia()` le
 * devuelve una lista vacía, así que por aquí no se escribe ni una fila para
 * KINDER — no hay rama que escribir mal.
 *
 * El caso con contenido HOY es el adulto aprendiz (SERIO, D-034): la migración
 * 0009 es polimórfica (`child_profile_id` XOR `user_id`) precisamente porque
 * PRIMARIA/SECUNDARIA no tienen contenido todavía (D-007, D-009).
 *
 * ─── Los resúmenes de F4 y de la liga ──────────────────────────────────────
 *
 * `resumenF4` se manda SIEMPRE `null`: F4 no está desplegado y el motor degrada
 * el slot adaptativo a `volumen` (#228). El día que F4 aterrice, este archivo
 * gana una función que lo lea — el motor no se toca.
 *
 * `resumenLiga` sí se construye de verdad: `dueloOptIn` sale de `child_consents`
 * (código `DUEL`, D-018: opt-in, 8+) y `enLiga` de `league_membership` (0012).
 * Hoy nadie está en liga, así que el caso real es `{ enLiga: false,
 * dueloOptIn: false, metaColectivaHoy: null }` — pero la consulta está escrita
 * para que el enchufe futuro sea no tocar este archivo. `metaColectivaHoy` es
 * `null` siempre: el contador colectivo lo expone el DO de liga, que no existe
 * todavía. D-PENDIENTE: el opt-in de duelo del ADULTO no tiene tabla hoy (los
 * códigos LEAGUE/DUEL viven en `child_consents`); mientras no exista, un adulto
 * nunca es elegible para `duelo`.
 *
 * ─── Qué evento alimenta cada tipo, dicho de frente ────────────────────────
 *
 * Lo único que `/api/jugar?accion=responder` puede observar hoy es **un ítem
 * confirmado, con su habilidad**. Con eso se alimentan dos tipos:
 *
 *   · `volumen` — +1 por ítem confirmado. **Desviación consciente (D-PENDIENTE):**
 *     la meta se diseñó en RETOS (§3 del diseño: «N retos de cualquier modo») y
 *     hoy no existe un evento de fin de reto — «Ya terminé» es un `<a href>`,
 *     mismo residuo que `progreso.ts` declara para `reto_completado`. Hasta que
 *     la sesión de reto de F3 emita ese evento, `volumen` cuenta ítems.
 *   · `variedad` — +1 cuando la habilidad del ítem es NUEVA hoy. El conjunto de
 *     habilidades del día vive dentro del Durable Object, como parte del estado
 *     del día que posee: no es un intento crudo (son identificadores del banco,
 *     `K01`…`K14`) y no pisa D1 (mc-32 riesgo #1).
 *
 * Los demás tipos no tienen fuente de eventos todavía: `repaso`, `dominio` y
 * `fluidez` necesitan F4 (y con `resumenF4 = null` ni siquiera son elegibles);
 * `problema`, `precision` y `descubre` necesitan los modos de reto de D-018, que
 * la API no conoce; `duelo` y `meta_de_liga` necesitan una liga. **No se les
 * asigna progreso falso**: quedan en el menú con su meta visible y simplemente
 * no se completan — y el resumen de fin de día lista solo lo logrado (#222),
 * así que ninguna misión sin fuente se convierte en un «te faltó esto».
 * D-PENDIENTE: el cable de estos cinco tipos llega con F4, con la sesión de
 * reto de F3 y con F7 · Ligas.
 *
 * ─── El XP: en la transición, una sola vez ─────────────────────────────────
 *
 * `avanzarMision()` devuelve **el mismo objeto** cuando no hay nada nuevo; el
 * objeto compara por referencia y solo reporta lo que cambió. El XP se suma a
 * `xp_totals` cuando `xp_awarded` sube (la transición a completada), y el bono
 * del día (`BONO_DIA_COMPLETO`) cuando el avance deja las misiones del día
 * completas y antes no lo estaban. La doble petición concurrente que podía
 * pagar el bono dos veces quedó cerrada por la serialización del Durable
 * Object (#224): leer-avanzar-escribir es atómico por niño.
 *
 * ─── La línea roja #6, heredada ────────────────────────────────────────────
 *
 * El progreso parcial (2 de 3) vive en el objeto del niño —y en su rollup de
 * D1— desde el ítem que lo produjo: un corte por límite de pantalla no lo
 * borra ni lo muestra como fracaso, porque no hay ningún camino por el que el
 * corte toque ese estado.
 */
import {
  BONO_DIA_COMPLETO,
  SQL_UPSERT_MISION,
  cierreDelDia,
  elegirMisionesDelDia,
  estadoInicialDeMision,
  tieneMenuDeMisiones,
  type CierreDelDia,
  type EstadoDeMision,
  type Mision,
  type ResumenDeLigaParaMisiones,
} from "../../../../packages/motor/src/misiones.ts";
import { diaEfectivo, type DiaLocal } from "../../../../packages/motor/src/tiempo-local.ts";
import { SQL_UPSERT_XP } from "../../../../packages/motor/src/xp.ts";
import type { Banda } from "../../../../packages/motor/src/puntuacion.ts";
import { zonaDelHogar, type Jugador } from "./progreso.ts";
import { avanzarEnMisiones } from "./missions-do.ts";

// Para la pantalla: el bono se muestra como una suma con ESTE número, que es el
// mismo que se escribe en `xp_totals`. Dos copias del número es cómo la
// pantalla acaba prometiendo un premio que el motor no da.
export { BONO_DIA_COMPLETO };

interface Env {
  DB?: D1Database;
  MISSIONS_DO?: DurableObjectNamespace;
}

/** Una misión del día con su estado persistido (o el inicial, si no hay fila). */
export interface MisionConEstado {
  readonly mision: Mision;
  readonly estado: EstadoDeMision;
}

/** Lo que la pantalla necesita para anunciar el día y para resumirlo. */
export interface MisionesDeHoy {
  readonly dia: DiaLocal;
  readonly entradas: readonly MisionConEstado[];
  readonly resumenLiga: ResumenDeLigaParaMisiones;
}

interface FilaMision {
  local_date: string;
  mission_type: Mision["tipo"];
  target: number;
  progress: number;
  completed: 0 | 1;
  xp_awarded: number;
}

const SQL_LEER_NINO = `
SELECT local_date, mission_type, target, progress, completed, xp_awarded
FROM mission_daily_summary WHERE child_profile_id = ? AND local_date = ?
`.trim();

const SQL_LEER_ADULTO = `
SELECT local_date, mission_type, target, progress, completed, xp_awarded
FROM mission_daily_summary WHERE user_id = ? AND local_date = ?
`.trim();

/*
 * El upsert del motor nombra las DOS columnas de dueño (la tabla es polimórfica
 * y el CHECK exige exactamente una). La variante del niño ata `child_profile_id`
 * y deja `user_id` en NULL; la del adulto al revés — y por eso no sirve el
 * `replaceAll` que `progreso.ts` usa para la racha y el XP: aquí la columna del
 * otro dueño SÍ existe en la lista, y renombrarla la duplicaría. Lo que cambia
 * es solo el `ON CONFLICT`, que tiene que agarrarse del índice único parcial del
 * dueño que escribe.
 */
const SQL_UPSERT_MISION_ADULTO = SQL_UPSERT_MISION.replace(
  "ON CONFLICT (child_profile_id, local_date, mission_type) WHERE child_profile_id IS NOT NULL",
  "ON CONFLICT (user_id, local_date, mission_type) WHERE user_id IS NOT NULL",
);

// La tabla de XP sí es de una sola columna de dueño: el mismo reemplazo que
// `progreso.ts`, por la misma razón — el día que xp.ts cambie, las dos
// variantes cambian solas.
const SQL_UPSERT_XP_ADULTO = SQL_UPSERT_XP.replaceAll("child_profile_id", "user_id");

/**
 * La banda con la que juega esta persona.
 *
 * El adulto aprendiz es SERIO (D-034): la franja N8-N10 es la suya aunque hoy
 * practique contenido de kinder, que es lo único autorado. La banda del niño
 * sale de `child_profiles.theme_band`. **El respaldo es KINDER a propósito:**
 * sin dato no hay menú ni escrituras, que es el fallo hacia abajo y no hacia
 * arriba — un niño sin banda que recibiera misiones sería un perfil que el
 * motor no debió alimentar.
 */
async function bandaDeJugador(env: Env, quien: Jugador): Promise<Banda> {
  if (quien.esAdulto) return "SERIO";
  if (!env.DB) return "KINDER";
  try {
    const fila = await env.DB.prepare("SELECT theme_band FROM child_profiles WHERE id = ?")
      .bind(quien.id)
      .first<{ theme_band: string }>();
    const banda = fila?.theme_band;
    return banda === "KINDER" || banda === "PRIMARIA" || banda === "SECUNDARIA" ? banda : "KINDER";
  } catch {
    return "KINDER";
  }
}

/**
 * El sobre de solo lectura con la liga (#215).
 *
 * Hoy contesta «no» a todo en la práctica — nadie está en liga todavía— pero la
 * consulta es la real: el día que F7 · Ligas empiece a escribir membresías y
 * consentimientos, esto se enciende solo. Si la tabla no existe en este entorno
 * (la 0012 no se ha aplicado), se degrada a «no» y no a un 500: las misiones de
 * liga simplemente no entran a la rotación, que es lo que el motor ya hace con
 * cualquier tipo inelegible.
 */
async function resumenLigaDeHoy(env: Env, quien: Jugador): Promise<ResumenDeLigaParaMisiones> {
  const ninguna: ResumenDeLigaParaMisiones = {
    enLiga: false,
    dueloOptIn: false,
    metaColectivaHoy: null,
  };
  if (!env.DB) return ninguna;
  try {
    // D-018: DUELO es opt-in y 8+. El consentimiento vivo va a `child_consents`
    // (D-051). Un consentimiento revocado no cuenta, y la ausencia de fila es
    // un «no» — nunca un «sí por si acaso». El adulto no tiene dónde guardarlo
    // todavía (D-PENDIENTE, ver el encabezado).
    const dueloOptIn = quien.esAdulto
      ? false
      : (await env.DB.prepare(
          "SELECT 1 AS ok FROM child_consents " +
            "WHERE child_profile_id = ? AND consent_code = 'DUEL' AND revoked_at IS NULL LIMIT 1",
        )
          .bind(quien.id)
          .first<{ ok: number }>()) !== null;

    const enLiga =
      (await env.DB.prepare(
        `SELECT 1 AS ok FROM league_membership
         WHERE ${quien.esAdulto ? "user_id" : "child_profile_id"} = ?
           AND (outcome IS NULL OR outcome != 'ARCHIVADA') LIMIT 1`,
      )
        .bind(quien.id)
        .first<{ ok: number }>()) !== null;

    return { enLiga, dueloOptIn, metaColectivaHoy: null };
  } catch {
    return ninguna;
  }
}

/**
 * Las misiones de hoy con su estado, sin escribir nada. Lo usa la pantalla al
 * cargar — el anuncio al empezar la sesión y el resumen al terminarla (§3.6 del
 * diseño: nunca dentro de un reto activo).
 *
 * @param banda la de `bandaDeJugador()`. KINDER devuelve `entradas: []` — no es
 *   un fallo, es la decisión (#213), y quien pinta no tiene que deducirlo.
 * @param ahora el instante, medido por quien llama. Este módulo no lee relojes:
 *   el día lo calcula `diaEfectivo()` con la zona del HOGAR, jamás del aparato.
 *
 * Devuelve `null` si no hay base o si algo falló: una misión que no se pudo
 * leer no puede convertirse en una pantalla rota, misma regla que
 * `progreso.ts` — nunca se le niega el juego a nadie por un contador.
 */
export async function leerMisionesDeHoy(
  env: Env,
  quien: Jugador,
  banda: Banda,
  ahora: number,
): Promise<MisionesDeHoy | null> {
  if (!env.DB) return null;
  try {
    const dia = diaEfectivo(ahora, await zonaDelHogar(env, quien));
    const resumenLiga = await resumenLigaDeHoy(env, quien);
    if (!tieneMenuDeMisiones(banda)) return { dia, entradas: [], resumenLiga };

    const misiones = elegirMisionesDelDia(quien.id, dia, banda, null, resumenLiga);
    const filas = await env.DB.prepare(quien.esAdulto ? SQL_LEER_ADULTO : SQL_LEER_NINO)
      .bind(quien.id, dia)
      .all<FilaMision>();
    const porTipo = new Map((filas.results ?? []).map((f) => [f.mission_type, f]));

    const entradas: MisionConEstado[] = misiones.map((mision) => {
      const fila = porTipo.get(mision.tipo);
      const estado: EstadoDeMision = fila
        ? {
            local_date: fila.local_date,
            mission_type: fila.mission_type,
            target: fila.target,
            progress: fila.progress,
            completed: fila.completed,
            xp_awarded: fila.xp_awarded,
          }
        : estadoInicialDeMision(mision, dia);
      return { mision, estado };
    });
    return { dia, entradas, resumenLiga };
  } catch {
    return null;
  }
}

/**
 * El cierre del día para la pantalla: solo lo logrado, nunca un «0 de 3»
 * (#222). Envoltura sobre `cierreDelDia()` del motor para que la página no
 * tenga que saber cómo se cuenta.
 */
export function cierreDeHoy(datos: MisionesDeHoy): CierreDelDia {
  return cierreDelDia(
    datos.entradas.map((e) => e.mision),
    datos.entradas.filter((e) => e.estado.completed === 1).map((e) => e.mision.tipo),
  );
}

/**
 * Un ítem confirmado: alimenta las misiones del día que ese evento puede mover.
 *
 * La llama `/api/jugar?accion=responder`, solo cuando el intento CUENTA (nunca
 * en un reintento del mismo ítem — línea roja #8: volver a intentarlo no puede
 * subir ni bajar nada).
 *
 * El Durable Object del niño es quien avanza el estado del día (#224) y
 * devuelve qué cambió y cuánto XP se ganó; este camino vuelca ese resultado a
 * D1 — `mission_daily_summary` como rollup de lectura y `xp_totals`— en la
 * misma petición. Nadie más escribe esas dos tablas para misiones: un
 * primario y su espejo, no dos escritores.
 *
 * Nunca lanza: si el objeto no responde o algo falla, el reto continúa sin
 * contador, y el progreso que ya estaba guardado sigue ahí — un corte por
 * límite de pantalla no lo toca (línea roja #6).
 */
export async function registrarAvanceDeHoy(
  env: Env,
  quien: Jugador,
  entrada: { habilidad: string; ahora: number },
): Promise<void> {
  if (!env.DB) return;
  try {
    const banda = await bandaDeJugador(env, quien);
    if (!tieneMenuDeMisiones(banda)) return;

    const dia = diaEfectivo(entrada.ahora, await zonaDelHogar(env, quien));
    const resumenLiga = await resumenLigaDeHoy(env, quien);

    // El objeto decide. Si no responde, fallo ABIERTO: se pierde el avance de
    // un contador del día, nunca el juego — y no se escribe un rollup que el
    // dueño del estado no calculó.
    const resultado = await avanzarEnMisiones(env.MISSIONS_DO, quien.id, {
      dia,
      banda,
      resumenLiga,
      habilidad: entrada.habilidad,
    });
    if (!resultado) return;

    // El rollup: el estado COMPLETO de cada misión que cambió, tal como lo
    // calculó el objeto. El upsert escribe el estado entero y no un delta, así
    // que un rollup que falló se reescribe y sana en el siguiente avance.
    const escrituras: D1PreparedStatement[] = [];
    for (const nuevo of resultado.cambios) {
      escrituras.push(
        env.DB.prepare(quien.esAdulto ? SQL_UPSERT_MISION_ADULTO : SQL_UPSERT_MISION).bind(
          crypto.randomUUID(),
          // Las dos columnas de dueño van siempre; la que no aplica queda NULL,
          // que es lo que el CHECK de exactamente-un-dueño exige (0009).
          quien.esAdulto ? null : quien.id,
          quien.esAdulto ? quien.id : null,
          nuevo.local_date,
          nuevo.mission_type,
          nuevo.target,
          nuevo.progress,
          nuevo.completed,
          nuevo.xp_awarded,
          entrada.ahora,
        ),
      );
    }

    // El XP ya viene sumado del objeto — misión completada más bono del día— y
    // se escribe una sola vez porque la transición ocurrió una sola vez (línea
    // roja #5, y la serialización del objeto es lo que la garantiza).
    if (resultado.xpGanado > 0) {
      escrituras.push(
        env.DB.prepare(quien.esAdulto ? SQL_UPSERT_XP_ADULTO : SQL_UPSERT_XP).bind(
          quien.id,
          resultado.xpGanado,
          entrada.ahora,
        ),
      );
    }
    if (escrituras.length > 0) await env.DB.batch(escrituras);
  } catch {
    // Silencio deliberado, misma regla que `registrarItem`: lo que se pierde si
    // esto falla es un contador, no el juego — y nunca una pantalla rota.
  }
}
