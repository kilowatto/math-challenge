/**
 * DUELO: un reto asíncrono contra un miembro de tu propia liga.
 *
 * #244 · D-018, D-053, D-081 · `mc-17`, `mc-19`.
 *
 * Módulo puro, igual que `liga.ts`: los tres portones se comprueban aquí, sin
 * red y sin reloj propio —el instante lo mide quien llama— para que la
 * elegibilidad se pueda probar exhaustivamente en vez de con una cuenta de
 * verdad.
 *
 * ─── Las tres cosas que un duelo NO tiene ──────────────────────────────────
 *
 *  1. **No tiene chat.** Ni mensajes, ni emotes escritos, ni un campo donde
 *     teclear. Línea roja #3: ningún niño escribe texto libre, en ninguna
 *     superficie. `league_duel` no tiene columna de texto salvo `item_set`, que
 *     lo escribe el servidor.
 *  2. **No tiene presencia.** Ninguna estructura de este archivo dice si el
 *     otro está conectado, cuándo se conectó por última vez, ni si «está
 *     jugando ahora». Es la condición 2 de D-081, y su razón es concreta: la
 *     presencia en vivo es lo que hace que un niño se quede esperando delante
 *     de una pantalla a que el otro aparezca.
 *  3. **No tiene prisa.** `expiraEn` existe para que el duelo caduque solo, no
 *     para pintar una cuenta regresiva. `mc-17` y `mc-19` nombran la urgencia
 *     fabricada como categoría de patrón oscuro reconocida por la FTC, y
 *     `audits/racha-lexico.mjs` bloquea un `countdown` en una superficie de
 *     liga igual que en una de racha.
 *
 * ─── Lo que el duelo NO decide ─────────────────────────────────────────────
 *
 * No calcula puntos. Los calcula `calificar()` de `puntuacion.ts`, la misma
 * fórmula de D-010 y sin ninguna variante — «los puntos del duelo cuentan hacia
 * el total semanal normal, no es un sistema de puntuación paralelo» (#237).
 * Este módulo suma los que ya vienen calculados y compara.
 *
 * Y no otorga nada. `winner_membership_id` queda expuesto en el esquema como
 * gancho para un subsistema futuro; **ningún cosmético y ninguna recompensa se
 * dan aquí** (D-014, criterio explícito de #244).
 */

import type { Banda } from "./puntuacion.ts";

// ─── Los tres portones (#244, D-053, D-081) ──────────────────────────────────

/**
 * La edad mínima para duelar, en años cumplidos.
 *
 * D-018 dice «8+» y D-081 lo confirma. Se calcula desde `birth_year` y solo
 * desde ahí: D-053 quitó el mes, así que la edad de este producto es
 * `anioActual − birth_year` y **puede equivocarse en hasta un año hacia
 * arriba**. Se acepta a propósito: pedir el mes sería doce veces más precisión
 * sobre la identidad de un menor de la que hace falta para esto.
 *
 * El sesgo va hacia el lado seguro por construcción — un niño que cumple 8 en
 * diciembre cuenta como de 8 desde enero, y eso ADELANTA el acceso. Quien
 * quiera el sesgo contrario tiene que pedir el mes, y D-053 ya dijo que no.
 * Está anotado en `docs/dudas.md`.
 */
export const EDAD_MINIMA = 8;

/** La ventana para responder un duelo. #244: 48 horas, ni una notificación más. */
export const VENTANA_MS = 48 * 60 * 60 * 1000;

/** Cuántos duelos salientes puede tener pendientes un participante (#244). */
export const MAXIMO_PENDIENTES = 3;

/** Quién quiere retar. Lo mínimo, y ni un campo más. */
export interface Retador {
  readonly banda: Banda;
  /** `child_profiles.birth_year`. `null` para un adulto: su cuenta ya es adulta. */
  readonly birth_year: number | null;
  /** El opt-in vigente. Default apagado para un niño, encendido para un adulto. */
  readonly opt_in: boolean;
  /** Duelos salientes en estado PENDIENTE ahora mismo. */
  readonly pendientes_salientes: number;
}

export type Elegibilidad =
  | { readonly puede: true }
  | { readonly puede: false; readonly motivo: MotivoDeRechazo };

/**
 * Por qué no se puede retar. Unión cerrada, no una cadena.
 *
 * Cerrada porque estos motivos llegan a una pantalla y tienen que poder
 * traducirse en los siete locales sin que nadie invente el texto en el punto de
 * uso. Y porque `audits/duelo-elegibilidad.mjs` comprueba que los tres portones
 * existan por nombre: un motivo que se construya concatenando cadenas es un
 * motivo que el auditor no puede contar.
 */
export type MotivoDeRechazo =
  | "banda_kinder"
  | "edad_insuficiente"
  | "sin_opt_in"
  | "tope_de_pendientes";

/**
 * Los tres portones de #244, más el tope de pendientes.
 *
 * Se comprueban **todos aquí y en ningún otro sitio**. La forma en que esta
 * regla se rompe no es que alguien la borre: es que una segunda ruta cree un
 * duelo sin pasar por esta función porque «ya se comprobó antes». Por eso
 * `audits/duelo-elegibilidad.mjs` mira que toda creación de `league_duel` pase
 * por aquí, y no solo que esta función exista.
 *
 * @param anioActual el año en curso, medido por quien llama. Este módulo no lee el reloj.
 */
export function puedeRetar(retador: Retador, anioActual: number): Elegibilidad {
  // 1. KINDER no duela. No es por edad: es la banda entera. Un niño de 8 años
  //    con tema de kinder (D-046 permite esa combinación) tampoco duela.
  if (retador.banda === "KINDER") return { puede: false, motivo: "banda_kinder" };

  // 2. Edad ≥ 8, calculada desde `birth_year` y nada más (D-053).
  if (retador.birth_year !== null) {
    if (!Number.isInteger(anioActual)) {
      throw new RangeError(`año actual inválido: ${anioActual}`);
    }
    const edad = anioActual - retador.birth_year;
    if (edad < EDAD_MINIMA) return { puede: false, motivo: "edad_insuficiente" };
  }

  // 3. Opt-in vigente. Default apagado en un perfil de niño (D-081), encendido
  //    en una cuenta de adulto, que consiente por sí misma.
  if (!retador.opt_in) return { puede: false, motivo: "sin_opt_in" };

  // Y el tope de salientes, que no es un portón de elegibilidad sino de
  // volumen: sin él, un participante puede llenar la bandeja de media liga.
  if (retador.pendientes_salientes >= MAXIMO_PENDIENTES) {
    return { puede: false, motivo: "tope_de_pendientes" };
  }

  return { puede: true };
}

// ─── El set congelado ────────────────────────────────────────────────────────

export interface Duelo {
  readonly id: string;
  readonly cohort_id: string;
  readonly challenger_membership_id: string;
  readonly challenged_membership_id: string;
  /** Los ítems, en orden. Congelados al crear y nunca reordenados. */
  readonly item_set: readonly string[];
  readonly created_at: number;
  readonly expires_at: number;
}

/**
 * Crea el duelo con su set **congelado**.
 *
 * La equidad de un duelo no viene de que el motor adaptativo elija bien para
 * cada uno: viene de que los dos reciben exactamente los mismos `itemId` en el
 * mismo orden. Por eso el duelo no depende de F4, y por eso el set se congela
 * aquí en vez de resolverse al abrir cada sesión.
 *
 * El mismo array se sirve a las dos instancias de `math-challenge-sesion-reto-do`
 * (F3, que no se toca). `Object.freeze` no es decoración: sin él, cualquier
 * consumidor puede barajar el array que le llega y el segundo jugador recibiría
 * otro orden sin que nadie escribiera una línea de trampa.
 */
export function crearDuelo(entrada: {
  id: string;
  cohort_id: string;
  challenger_membership_id: string;
  challenged_membership_id: string;
  item_set: readonly string[];
  ahora: number;
}): Duelo {
  if (entrada.challenger_membership_id === entrada.challenged_membership_id) {
    throw new RangeError("nadie se reta a sí mismo");
  }
  if (entrada.item_set.length === 0) {
    throw new RangeError("un duelo sin ítems no es un duelo");
  }
  if (new Set(entrada.item_set).size !== entrada.item_set.length) {
    throw new RangeError(
      "el set congelado tiene ítems repetidos: los dos jugadores verían el mismo ítem dos veces " +
        "y el segundo ya sabría la respuesta.",
    );
  }
  if (!Number.isFinite(entrada.ahora)) throw new RangeError(`instante no finito: ${entrada.ahora}`);

  return Object.freeze({
    id: entrada.id,
    cohort_id: entrada.cohort_id,
    challenger_membership_id: entrada.challenger_membership_id,
    challenged_membership_id: entrada.challenged_membership_id,
    item_set: Object.freeze([...entrada.item_set]),
    created_at: entrada.ahora,
    expires_at: entrada.ahora + VENTANA_MS,
  });
}

/**
 * ¿Este duelo ya caducó?
 *
 * Se pregunta al leer, no se avisa. No hay recordatorio, no hay segundo aviso y
 * no hay cuenta regresiva: #244 pide **una sola** notificación al retado, en
 * tono neutro, y `mc-19` documenta el «nagging» como el patrón que hay que
 * evitar cuando el destinatario es un niño.
 */
export function haExpirado(duelo: Duelo, ahora: number): boolean {
  return ahora >= duelo.expires_at;
}

// ─── El desenlace ────────────────────────────────────────────────────────────

export type Desenlace =
  | { readonly estado: "PENDIENTE" }
  | { readonly estado: "EXPIRADO" }
  | { readonly estado: "JUGADO"; readonly winner_membership_id: string | null };

/**
 * Quién ganó. **Por puntos del set compartido, jamás por quién terminó antes.**
 *
 * Criterio explícito de #244, y la razón es la que atraviesa todo este
 * subsistema: decidir por tiempo de finalización relativo convertiría un reto
 * asíncrono en una carrera, y una carrera necesita saber cuándo empezó el otro
 * — que es presencia con otro nombre.
 *
 * `winner_membership_id === null` es EMPATE, y es un desenlace de primera
 * clase: no se rompe con un desempate inventado, y desde luego no con azar
 * (D-014, y `audits/liga-ascenso-determinista.mjs` no admite `Math.random` en
 * este archivo).
 *
 * Un duelo que expira sin respuesta **no produce ganador**. Es el criterio de
 * «rechazar es silencioso»: si expirar diera la victoria al retador, el
 * silencio de un niño se convertiría en un premio para otro, y en un mensaje
 * sobre él.
 */
export function resolver(
  duelo: Duelo,
  puntos: { readonly challenger: number | null; readonly challenged: number | null },
  ahora: number,
): Desenlace {
  const faltaAlguno = puntos.challenger === null || puntos.challenged === null;

  if (faltaAlguno) {
    return haExpirado(duelo, ahora) ? { estado: "EXPIRADO" } : { estado: "PENDIENTE" };
  }

  const a = puntos.challenger as number;
  const b = puntos.challenged as number;
  if (a === b) return { estado: "JUGADO", winner_membership_id: null };
  return {
    estado: "JUGADO",
    winner_membership_id: a > b ? duelo.challenger_membership_id : duelo.challenged_membership_id,
  };
}

/**
 * Lo que un participante puede ver de su duelo.
 *
 * Sin nombre, sin presencia, sin racha y sin nada del otro que no sea su alias
 * y —cuando ya jugó— sus puntos de este set. Que el rival haya jugado ya o no
 * **no se revela mientras el duelo esté pendiente**: saber que el otro ya
 * terminó es media presencia, y es exactamente lo que produce la espera.
 */
export interface VistaDeDuelo {
  readonly duelo_id: string;
  readonly alias_del_otro: string;
  readonly estado: Desenlace["estado"];
  /** Solo cuando el duelo terminó. Antes es `null` para los dos lados. */
  readonly mis_puntos: number | null;
  readonly puntos_del_otro: number | null;
}

export function verDuelo(
  duelo: Duelo,
  aliasDelOtro: string,
  puntos: { readonly mios: number | null; readonly del_otro: number | null },
  desenlace: Desenlace,
): VistaDeDuelo {
  const terminado = desenlace.estado === "JUGADO";
  return {
    duelo_id: duelo.id,
    alias_del_otro: aliasDelOtro,
    estado: desenlace.estado,
    mis_puntos: terminado ? puntos.mios : null,
    puntos_del_otro: terminado ? puntos.del_otro : null,
  };
}
