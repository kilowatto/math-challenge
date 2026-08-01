/**
 * El embudo de activación. Criterio #122 · D-037, línea roja #2.
 *
 * ─── Mide al ADULTO, y la frontera tiene que ser mecánica ──────────────────
 *
 * D-037 y la línea roja #2: **ninguna telemetría sobre un niño**. Este archivo
 * escribe tres momentos, y los tres son actos de un adulto en su propia cuenta:
 *
 *   · `registro`     — se creó una cuenta
 *   · `primer_perfil`— ese adulto creó su primer perfil de niño
 *   · `primer_hogar` — marcó su primer dispositivo de la casa
 *
 * ─── Lo que NO se escribe, y por qué cada uno ──────────────────────────────
 *
 *  · **Ningún identificador de niño.** Ni el `child_profile_id`, ni el alias, ni
 *    la banda. Que un adulto creó *un* perfil es un hecho sobre el adulto; que
 *    creó el perfil de *este* niño es un hecho sobre el niño.
 *  · **Ningún identificador de adulto tampoco.** No hace falta: un embudo
 *    cuenta pasos, no persigue personas. Sin `user_id`, el conjunto de datos no
 *    puede convertirse en una línea de tiempo de nadie ni por accidente ni por
 *    una consulta curiosa.
 *  · **Ninguna IP, ninguna ciudad.** El país sí, porque es lo que decide en qué
 *    mercado funciona el registro y `mc-25` distingue país de geolocalización.
 *
 * ─── El índice, que es donde se rompería ───────────────────────────────────
 *
 * Analytics Engine admite **un solo índice y de ≤96 bytes**. Si se indexara por
 * usuario, el conjunto de datos se convertiría en una línea de tiempo por
 * persona — que es exactamente lo que `mc-25` impl. 6 prohíbe. Se indexa por
 * **paso**, que tiene cinco valores posibles y no identifica a nadie.
 */

export type PasoDelEmbudo = "registro" | "primer_perfil" | "primer_hogar";

/** Los pasos, para que un auditor pueda comprobar que no aparece uno de niño. */
export const PASOS: PasoDelEmbudo[] = ["registro", "primer_perfil", "primer_hogar"];

interface Contexto {
  /** ISO 3166-1 alfa-2, de `request.cf.country`. País, no ciudad (mc-25). */
  pais?: string | null;
  /** Locale del producto. Dice en qué idioma se activa la gente, no quién es. */
  locale?: string | null;
  /** Por qué puerta entró. Intención observada (migración 0003). */
  intent?: string | null;
}

/**
 * Escribe un paso del embudo.
 *
 * **No lanza nunca.** Un fallo de telemetría no puede impedir que un padre cree
 * la cuenta de su hijo — es la misma regla que hace que el veredicto de un reto
 * jamás espere a Larry.
 */
export function anotarPaso(
  ae: AnalyticsEngineDataset | undefined,
  paso: PasoDelEmbudo,
  ctx: Contexto = {},
): void {
  if (!ae) return;
  try {
    ae.writeDataPoint({
      // UN índice, ≤96 bytes, y es el PASO. Nunca el usuario: ver el encabezado.
      indexes: [paso],
      // Dimensiones. Ninguna identifica a una persona ni a un niño.
      blobs: [paso, ctx.pais ?? "", ctx.locale ?? "", ctx.intent ?? ""],
      // Un `1` por evento: el embudo cuenta pasos.
      doubles: [1],
    });
  } catch {
    // Silencio deliberado. Ver arriba.
  }
}
