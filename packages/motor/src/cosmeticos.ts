/**
 * El evaluador de cosméticos. Determinista, cero azar (#252, #254, D-014).
 *
 * Módulo PURO, mismo contrato que `puntuacion.ts` y `historia.ts`: recibe un
 * logro y las reglas del catálogo, devuelve qué cosméticos se ganan. No toca la
 * red, ni el reloj, ni la base, y —esto sí es propio de este archivo— **no toca
 * el azar**.
 *
 * ─── Por qué el azar está prohibido aquí, y no es una preferencia ─────────
 *
 * Línea roja #5: sin moneda comprable y sin recompensas aleatorias de pago. Las
 * cajas de botín fueron declaradas juego ilegal en Bélgica y Países Bajos en
 * 2018 (`mc-17` §7), y el Parlamento del Reino Unido recomendó en 2019
 * restringir su venta a menores. `mc-17` es explícito en que el radio de esa
 * historia alcanza a lo cosmético y a lo gratuito:
 *
 *   «any future "mystery reward" or "surprise box" mechanic — even cosmetic,
 *    even free — sits in the blast radius of this regulatory history if it uses
 *    randomization to drive engagement»
 *
 * Y su tabla de líneas rojas propone el sustituto que este archivo implementa:
 * *«fixed, previewable rewards tied to demonstrated mastery»*. De ahí sale la
 * garantía dura del módulo: **misma entrada, misma salida, siempre**. Sin
 * `Math.random`, sin `crypto.getRandomValues`, sin `Date.now()`, sin iterar un
 * `Set` u objeto cuyo orden dependa de la inserción. La salida va ordenada.
 *
 * `audits/cosmeticos-deterministas.mjs` lo hace cumplir de dos maneras
 * independientes: mira este archivo por dentro, y lo EJECUTA dos veces con la
 * misma entrada barajada de otra forma y compara.
 *
 * ─── La advertencia honesta ───────────────────────────────────────────────
 *
 * `mc-16` es la fuente del mecanismo, y trae su propio desmentido: la evidencia
 * de Duolingo es fuerte en enganche y **débil en aprendizaje**. Sailer & Homner
 * (2020) miden efectos conductuales pequeños (g=0.25); Hamari et al. (2014)
 * advierten del efecto novedad. Un cosmético no enseña matemáticas. Existe para
 * que alguien vuelva, y eso es otra cosa.
 *
 * `mc-17` §2 agrega el matiz que decide el diseño: las recompensas
 * **informativas** (que confirman competencia) no dañan la motivación
 * intrínseca; las **controladoras** sí, y el efecto es más severo en niños que
 * en universitarios (Deci, Koestner & Ryan 1999, 128 estudios). Por eso todo
 * cosmético de aquí se ata a maestría demostrada y nunca a volumen ni a haberle
 * ganado a otro niño.
 *
 * ─── Lo que este módulo NO hace ───────────────────────────────────────────
 *
 *  · No escribe en `child_cosmetics_unlocked`. Devuelve qué desbloquear.
 *  · No sabe qué está equipado ni lo decide. Eso es `child_profiles.avatar_parts`.
 *  · No conoce precios porque no existen. Ninguna función de aquí acepta un
 *    monto, un SKU ni una moneda, y el auditor bloquea el commit que lo agregue.
 *  · No habla. Ningún texto vive aquí: el catálogo guarda claves i18n (#255).
 */

/**
 * Los SEIS tipos de evento que pueden desbloquear algo (#254).
 *
 * Es un enum CERRADO a propósito, y `audits/cosmeticos-deterministas.mjs` cruza
 * esta constante contra lo que el esquema acepte en `cosmetic_unlock_rules`. Que
 * sean dos fuentes independientes es el punto (D-070): si el SQL admite un
 * séptimo valor que este archivo no conoce, la regla existiría en la base y
 * nunca se dispararía — un cosmético que nadie puede ganar y que nadie sabe que
 * no puede ganar.
 *
 * Los tres últimos pueden no tener ninguna regla que los use en v1. El caso
 * existe igual: `nivel_alcanzado` en particular es el que consume el
 * `EventoDeRango` del subsistema de XP (D-055), y sin él ese evento no tendría
 * dónde aterrizar.
 */
export const TIPOS_DE_EVENTO = [
  "habilidad_dominada",
  "primer_intento",
  "habilidades_dominadas_conteo",
  "racha_dias",
  "liga_top_pct",
  "nivel_alcanzado",
] as const;

export type TipoDeEvento = (typeof TIPOS_DE_EVENTO)[number];

/**
 * Lo que le pasó al niño, ya calculado por quien sabe calcularlo.
 *
 * Unión discriminada, no un objeto con campos opcionales — mismo patrón que
 * `Intento`/`IntentoKinder`/`IntentoCronometrado` de `puntuacion.ts` y por la
 * misma razón: un campo opcional compila donde no debería. Con
 * `{ tipo, skillId?, conteo? }`, un `{ tipo: "racha_dias" }` sin días compilaría
 * y evaluaría `undefined >= umbral` como `false` — silenciosamente, para
 * siempre, sin que ninguna prueba lo viera.
 */
export type LogroDeterminista =
  | { readonly tipo: "habilidad_dominada"; readonly skillId: string }
  | { readonly tipo: "primer_intento" }
  | { readonly tipo: "habilidades_dominadas_conteo"; readonly conteo: number }
  | { readonly tipo: "racha_dias"; readonly dias: number }
  | { readonly tipo: "liga_top_pct"; readonly pct: number }
  | { readonly tipo: "nivel_alcanzado"; readonly nivel: number };

/**
 * Una fila de `cosmetic_unlock_rules` (#253).
 *
 * `parametro` es el `skill_id` para `habilidad_dominada` y `null` para todo lo
 * demás. `umbral` es el número a alcanzar en los tipos que cuentan, y `null`
 * en `habilidad_dominada` y `primer_intento`, que no cuentan nada.
 *
 * No hay campo de precio, de moneda ni de probabilidad. No es que estén en
 * `null`: no existen.
 */
export interface ReglaDeDesbloqueo {
  readonly cosmeticId: string;
  readonly tipoEvento: TipoDeEvento;
  readonly parametro: string | null;
  readonly umbral: number | null;
}

/** Una regla que no se puede evaluar, con su porqué en una frase. */
export class ReglaInvalida extends Error {
  readonly cosmeticId: string;
  constructor(cosmeticId: string, porQue: string) {
    super(`regla de "${cosmeticId}" inválida: ${porQue}`);
    this.name = "ReglaInvalida";
    this.cosmeticId = cosmeticId;
  }
}

const CUENTAN: ReadonlySet<string> = new Set([
  "habilidades_dominadas_conteo",
  "racha_dias",
  "liga_top_pct",
  "nivel_alcanzado",
]);

/**
 * Revisa el catálogo entero antes de que se despliegue.
 *
 * Devuelve una lista de problemas en texto, vacía si todo está bien — mismo
 * contrato que `validarItem()` en `item.ts`. Es la vía «explícita y nombrada»
 * que pide el criterio adversarial de #254: una regla cuyo `parametro` no
 * corresponde a ningún `skill_id` real no revienta en producción con un
 * `TypeError` a mitad de una sesión; se caza aquí, con el id del cosmético
 * escrito.
 *
 * @param habilidadesReales los `skill_id` que existen de verdad. Si se pasa
 *   `null`, no se comprueba la correspondencia (útil antes de que F5 cierre las
 *   14 habilidades de kinder) y se dice en el mensaje, no se calla.
 */
export function validarReglas(
  reglas: readonly ReglaDeDesbloqueo[],
  habilidadesReales: readonly string[] | null = null,
): string[] {
  const problemas: string[] = [];
  const conocidas = habilidadesReales === null ? null : new Set(habilidadesReales);

  for (const r of reglas) {
    if (typeof r.cosmeticId !== "string" || r.cosmeticId.length === 0) {
      problemas.push("una regla sin cosmeticId");
      continue;
    }
    if (!(TIPOS_DE_EVENTO as readonly string[]).includes(r.tipoEvento)) {
      problemas.push(
        `${r.cosmeticId}: tipoEvento "${r.tipoEvento}" está fuera del enum cerrado ` +
          `(${TIPOS_DE_EVENTO.join(", ")}). Nadie agrega un tipo sin tocar cosmeticos.ts.`,
      );
      continue;
    }
    if (r.tipoEvento === "habilidad_dominada") {
      if (typeof r.parametro !== "string" || r.parametro.length === 0) {
        problemas.push(`${r.cosmeticId}: habilidad_dominada sin skill_id en parametro`);
      } else if (conocidas !== null && !conocidas.has(r.parametro)) {
        problemas.push(
          `${r.cosmeticId}: apunta a la habilidad "${r.parametro}", que no existe. ` +
            `Un cosmético atado a una habilidad inexistente no se puede ganar nunca.`,
        );
      }
    } else if (r.parametro !== null) {
      problemas.push(
        `${r.cosmeticId}: ${r.tipoEvento} no usa parametro y trae "${r.parametro}"`,
      );
    }
    if (CUENTAN.has(r.tipoEvento)) {
      if (typeof r.umbral !== "number" || !Number.isFinite(r.umbral)) {
        problemas.push(`${r.cosmeticId}: ${r.tipoEvento} necesita un umbral numérico`);
      }
    } else if (r.umbral !== null) {
      problemas.push(`${r.cosmeticId}: ${r.tipoEvento} no usa umbral y trae ${r.umbral}`);
    }
  }
  return problemas;
}

function cumple(logro: LogroDeterminista, regla: ReglaDeDesbloqueo): boolean {
  if (regla.tipoEvento !== logro.tipo) return false;

  switch (logro.tipo) {
    case "habilidad_dominada":
      if (typeof regla.parametro !== "string" || regla.parametro.length === 0) {
        throw new ReglaInvalida(regla.cosmeticId, "habilidad_dominada sin skill_id en parametro");
      }
      return regla.parametro === logro.skillId;

    case "primer_intento":
      return true;

    case "habilidades_dominadas_conteo":
      return logro.conteo >= exigirUmbral(regla);

    case "racha_dias":
      return logro.dias >= exigirUmbral(regla);

    // `liga_top_pct` es «estar en el mejor X%», así que un número MENOR es
    // mejor. Es la única comparación invertida del archivo y por eso lleva su
    // propio caso de prueba: escribirla como las otras daría el cosmético a
    // quien quedó último, que es exactamente al revés de lo que dice.
    case "liga_top_pct":
      return logro.pct <= exigirUmbral(regla);

    case "nivel_alcanzado":
      return logro.nivel >= exigirUmbral(regla);
  }
}

function exigirUmbral(regla: ReglaDeDesbloqueo): number {
  if (typeof regla.umbral !== "number" || !Number.isFinite(regla.umbral)) {
    throw new ReglaInvalida(
      regla.cosmeticId,
      `${regla.tipoEvento} necesita un umbral numérico y trae ${JSON.stringify(regla.umbral)}`,
    );
  }
  return regla.umbral;
}

/**
 * Qué cosméticos desbloquea este logro, y ninguno más.
 *
 * Pura y determinista: mismos argumentos, mismo resultado, siempre. La salida va
 * ordenada alfabéticamente para que no dependa del orden de `reglas` — dos
 * consultas a D1 que devuelvan las mismas filas en otro orden tienen que dar el
 * mismo arreglo, o «determinista» era una palabra bonita.
 *
 * **Idempotente:** lo que ya está en `yaDesbloqueados` no vuelve a salir. Aplicar
 * el mismo logro dos veces no produce una segunda entrada, y eso es lo que hace
 * que el reintento de una escritura fallida sea seguro.
 *
 * @throws {ReglaInvalida} si una regla del tipo evaluado está mal formada. Es a
 *   propósito y es lo contrario de una excepción no controlada: trae el id del
 *   cosmético y la razón, para que se arregle el catálogo y no se envuelva la
 *   llamada en un `try` que se traga el problema.
 */
export function cosmeticosQueDesbloquea(
  logro: LogroDeterminista,
  reglas: readonly ReglaDeDesbloqueo[],
  yaDesbloqueados: readonly string[] = [],
): string[] {
  const tenidos = new Set(yaDesbloqueados);
  const ganados = new Set<string>();

  for (const regla of reglas) {
    if (tenidos.has(regla.cosmeticId)) continue;
    if (cumple(logro, regla)) ganados.add(regla.cosmeticId);
  }

  return [...ganados].sort();
}
