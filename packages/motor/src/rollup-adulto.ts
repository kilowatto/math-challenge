/**
 * El acumulado del tablero **del adulto aprendiz**: `score_totals_adulto` en D1.
 *
 * #250 · D-025, D-027, D-034 · `mc-32` riesgo #1.
 *
 * ─── Por qué existe un segundo archivo y no un parámetro más en `rollup.ts` ─
 *
 * `score_totals.child_profile_id` tiene `REFERENCES child_profiles(id)`, y
 * `child_profiles.theme_band` solo admite KINDER/PRIMARIA/SECUNDARIA. Un adulto
 * que juega para sí mismo no tiene fila de `child_profiles` —`/api/perfil-nuevo`
 * la rechaza para bandas de adulto (D-034)— así que hasta la migración 0011 no
 * había ningún sitio donde pudiera acumular puntos. `api/health.ts` ya lo decía:
 * su prueba de humo no puede probar el rollup porque «un niño de humo es
 * rechazado por la base».
 *
 * Dos tablas y dos módulos, no uno con un discriminador. Es el precedente que
 * D-027 fijó para `child_group`/`adult_club` y su razón vale igual aquí: con
 * una sola tabla, el día que alguien escriba «todo `score_totals`» para el
 * tablero de niños, un adulto se cuela por descuido. Con dos, esa consulta
 * **no puede** alcanzarlo aunque nadie recuerde la regla.
 *
 * El precio, dicho: este archivo es casi una copia de `rollup.ts`, y las copias
 * divergen. Se mitiga con `validarLoteAdulto`, que reusa la misma lista blanca
 * de campos permitidos — si alguien mete `itemId` en cualquiera de los dos, los
 * dos lo rechazan por la misma razón.
 */

export interface PuntoDeRollupAdulto {
  userId: string;
  /** `all_time` o `season:<id>` — la columna `period` de la tabla. */
  period: string;
  themeBand: string;
  /** Puntos a SUMAR, no el total. El total lo calcula la base. */
  delta: number;
}

export interface LoteDeRollupAdulto {
  filas: PuntoDeRollupAdulto[];
  intentosAgregados: number;
}

/** Las cuatro bandas donde un adulto puede acumular (migración 0011). */
export const PERMITIDAS_PARA_ADULTO = ["SECUNDARIA", "SERIO", "JR", "PRO"] as const;

/**
 * Agrega muchos intentos de adulto en pocas filas. Misma compresión que
 * `rollup.ts`: mil intentos de treinta cuentas salen como treinta filas.
 */
export function agregarAdulto(
  intentos: Array<{ userId: string; period: string; themeBand: string; puntos: number }>,
): LoteDeRollupAdulto {
  const acc = new Map<string, PuntoDeRollupAdulto>();

  for (const i of intentos) {
    const k = `${i.userId} ${i.period}`;
    const previo = acc.get(k);
    if (previo) previo.delta += i.puntos;
    else acc.set(k, { userId: i.userId, period: i.period, themeBand: i.themeBand, delta: i.puntos });
  }

  return { filas: [...acc.values()], intentosAgregados: intentos.length };
}

/**
 * El upsert. `total_score = total_score + excluded.total_score`: se manda el
 * incremento, nunca el total. Mandar el total obligaría a leer antes de
 * escribir, y entre la lectura y la escritura cabe otro lote — que es cómo se
 * pierden puntos sin que nadie lo note, porque el resultado sigue siendo un
 * número plausible.
 */
export const SQL_UPSERT_ADULTO = `
INSERT INTO score_totals_adulto (user_id, period, theme_band, total_score, updated_at)
VALUES (?, ?, ?, ?, ?)
ON CONFLICT (user_id, period) DO UPDATE SET
  total_score = total_score + excluded.total_score,
  theme_band  = excluded.theme_band,
  updated_at  = excluded.updated_at
`.trim();

/**
 * Comprueba que un lote no lleve nada que no deba ir a D1.
 *
 * Misma lista blanca que `rollup.ts::validarLote`, con `userId` en vez de
 * `childProfileId`. La forma en que este diseño se rompe no es que alguien cree
 * una tabla `attempts` —eso lo bloquea `audits/no-attempts-in-d1.mjs`— sino que
 * alguien meta el `itemId` o el tiempo de respuesta «para poder depurar», y
 * entonces la fila deja de ser un estado agregado y vuelve a ser un evento con
 * otro nombre.
 */
export function validarLoteAdulto(lote: LoteDeRollupAdulto): string[] {
  const p: string[] = [];
  const PERMITIDO = new Set(["userId", "period", "themeBand", "delta"]);

  for (const fila of lote.filas) {
    for (const k of Object.keys(fila)) {
      if (!PERMITIDO.has(k)) {
        p.push(
          `la fila lleva "${k}", que no es un estado agregado. D1 guarda estados, no eventos ` +
            "(mc-32 riesgo #1): un itemId o un tiempo de respuesta aquí convierte esta tabla " +
            "en una tabla por intento con otro nombre.",
        );
      }
    }
    if (!Number.isFinite(fila.delta)) p.push(`delta no finito para ${fila.userId}`);
    if (!(PERMITIDAS_PARA_ADULTO as readonly string[]).includes(fila.themeBand)) {
      p.push(
        `banda "${fila.themeBand}" en un lote de adulto. Un adulto no acumula en la banda de ` +
          "un niño ni aunque juegue su contenido: el CHECK de la tabla lo rechazaría, y aquí " +
          "se ve antes de escribir.",
      );
    }
  }

  if (lote.filas.length > lote.intentosAgregados) {
    p.push(
      `${lote.filas.length} filas para ${lote.intentosAgregados} intentos: el lote no está ` +
        "agregando nada. «Por lotes» tiene que comprimir, o es «por intento» con más pasos.",
    );
  }

  return p;
}
