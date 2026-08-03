/**
 * El motor del límite de pantalla. Uno solo (D-016, #265, #266).
 *
 * Es un módulo PURO, con el mismo contrato que `racha.ts`: entra un estado y
 * sale un estado, y no toca la red, ni el reloj, ni la base. Aquí «no toca el
 * reloj» tampoco es una comodidad de pruebas — es la regla. El único instante
 * que este archivo conoce es el que le pasan, y siempre lo convierte a la zona
 * del hogar (`users.timezone`) antes de compararlo con nada. La zona del
 * DISPOSITIVO del niño no aparece en ninguna firma, y no puede aparecer: el
 * límite es del padre, y un límite que se evade cambiando el reloj del
 * teléfono no es un límite.
 *
 * ─── Lo que este módulo garantiza, y de dónde sale ────────────────────────
 *
 *  1. **Cuando el límite corta, el día se da por cumplido** (línea roja #6,
 *     D-014 textual: «si el límite de pantalla corta la sesión, la racha del
 *     día se da por cumplida»). `racha.ts` sostiene el otro extremo del mismo
 *     cable — allí el motivo no entra en la aritmética, así que «paré por el
 *     límite» y «terminé el reto» producen estados idénticos. Aquí se sostiene
 *     este extremo: `diaCumplidoPorCorte()` devuelve SIEMPRE el motivo de
 *     racha, para los dos motivos de cierre, y **no tiene rama que devuelva
 *     nada más**. Un camino donde el corte deja al niño sin su día sería un
 *     `null` en ese tipo de retorno, y no lo hay.
 *
 *     Este archivo **no calcula la racha** y no puede: no nombra
 *     `current_streak`, ni `shields_available`, ni ninguna columna de
 *     `child_streak`. `audits/limite-no-rompe-el-dia.mjs` sigue el grafo y
 *     bloquea el commit que las traiga.
 *
 *  2. **El límite no se levanta pagando** (línea roja #4, D-057). Ninguna
 *     función de este archivo acepta un precio, un plan, un SKU ni una
 *     bandera de suscripción, y `audits/limite-nunca-se-levanta-pagando.mjs`
 *     lo comprueba dos veces: leyendo las firmas, y **ejecutando** `decidir()`
 *     con campos de pago inyectados en la entrada para exigir que la decisión
 *     no cambie. D-057 ya decidió que el panel, los reportes y el límite de
 *     pantalla se construyen gratis para todo padre; la línea roja #4 dice por
 *     qué eso no es una concesión comercial sino un límite del producto.
 *
 *  3. **El corte nunca cae a media respuesta** (D-016, textual: «Nunca corte
 *     seco a media respuesta»). `decidir()` recibe `puntoSeguro` y **devuelve
 *     `SEGUIR` sin mirar nada más** cuando es `false`. La noción de punto
 *     seguro no se inventa aquí: la calcula `sesion.ts::puntoSeguroDeCorte`
 *     (F3, #33), cuyo propio comentario dice «F8 pregunta, no impone».
 *
 *  4. **El descanso se ofrece, no se impone** (#271, D-024, `mc-21`). No hay
 *     en este archivo ninguna constante de segundos de espera, ningún
 *     temporizador y ninguna cuenta regresiva, porque no puede haberlos: el
 *     descanso es una decisión (`DESCANSO`) que la pantalla muestra con su
 *     botón de seguir disponible desde el primer instante. `mc-26` implicación
 *     #6 marca el 20-20-20 como heurística razonable **no validada por
 *     ensayo**, así que forzar una espera cronometrada sobre una heurística
 *     sin ensayo sería cobrarle al niño la incertidumbre de la evidencia.
 *
 *  5. **Nunca se bloquea el navegador de un menor** (línea roja #1). El corte
 *     termina la sesión: deja de servir ítems. No hay aquí pantalla completa
 *     forzada, ni bloqueo del aparato, ni nada que impida cerrar la pestaña.
 *
 * ─── La honestidad que D-016 exige, y que se hereda aquí ──────────────────
 *
 * D-016 lo escribe en su propio texto: **solo el tope de 60 min para 2-4 años
 * viene de fuente primaria (OMS). De los 5 años en adelante ninguna autoridad
 * publica una cifra.** Todo lo demás de `LIMITES_POR_BANDA` es
 * `[criterio propio]`, y se marca como tal renglón por renglón. `mc-26` §7
 * añade el contrapeso que obliga a no exagerar en el copy: Orben & Przybylski
 * (2019), con ~355 000 adolescentes, miden que el uso digital explica **como
 * máximo 0.4%** de la varianza en bienestar — comparable a comer papas.
 *
 * Traducido a este archivo: los minutos existen para que un padre pueda poner
 * un límite y para que el producto lo respete. **Ninguna decisión de aquí
 * puede justificarse diciendo «así el niño está mejor»,** porque la
 * investigación que la respalda no dice eso. La única pieza con evidencia
 * experimental es el corte nocturno (el ECA de la Universidad de Bath,
 * `mc-26` §5), y por eso es la única que corta por hora y no por acumulado.
 *
 * ─── Nombres de campo: por qué son las columnas de D1 ─────────────────────
 *
 * `UsoDelDia` y `ConfiguracionDeLimite` usan los mismos nombres que
 * `screen_time_daily_usage` (migración 0011) y `screen_time_settings`
 * (0002/0003). Misma razón que `EstadoRacha`: los auditores vigilan el grafo
 * de lo que toca estas columnas, y una capa de traducción entre
 * `minutes_used` y `minutosUsados` sería exactamente el punto donde el auditor
 * deja de ver.
 *
 * ─── El calendario compartido: #268, ya hecho ─────────────────────────────
 *
 * `diaEfectivo`, `zonaValida` y `horaLocal` viven en `tiempo-local.ts`, el
 * módulo neutral que F7 y F8 comparten. Aquí solo se reexportan para que quien
 * use el límite no tenga que importar de dos sitios el mismo concepto de «día
 * local del hogar». Es la misma función, no una copia:
 * `audits/limite-pantalla-motor-unico.mjs` comprueba la identidad por
 * referencia, porque una copia sería un segundo calendario.
 */

import { diaEfectivo, zonaValida, horaLocal, type DiaLocal, type HoraLocal } from "./tiempo-local.ts";
import type { MotivoDelDia } from "./racha.ts";
import type { TemaVisual } from "./bandas.ts";

export { diaEfectivo, zonaValida, horaLocal, type DiaLocal, type HoraLocal };

// ─── La tabla de D-016, y solo aquí (#266) ───────────────────────────────────

/**
 * Las bandas que tienen límite de pantalla.
 *
 * SERIO / JR / PRO no aparecen, y su ausencia es la decisión: el adulto
 * aprendiz no tiene `child_profiles` ni `screen_time_settings`, así que «sin
 * límite» **es la ausencia de fila**, no una fila con valores infinitos. Un
 * `Infinity` en esta tabla sería un número que alguien acaba comparando.
 *
 * D-016 marca al adulto con «recordatorio» en la columna de descanso. Eso es
 * producto de otra superficie (la del adulto, que no es un menor y decide por
 * sí mismo), no una fila de este mapa.
 */
export type BandaConLimite = Extract<TemaVisual, "KINDER" | "PRIMARIA" | "SECUNDARIA">;

export interface LimiteDeBanda {
  /** Lo que se aplica mientras el padre no elija otra cosa. */
  readonly defaultMin: number;
  /** El piso del rango que el padre puede elegir. */
  readonly minMin: number;
  /** El techo del rango que el padre puede elegir. */
  readonly maxMin: number;
  /** Cada cuántos minutos se OFRECE un descanso. Nunca se impone (#271). */
  readonly descansoCadaMin: number;
  /** Cuántos minutos antes de `bedtime_local` empieza la ventana nocturna. */
  readonly corteNocturnoMinAntes: number;
}

/**
 * D-016, tabla completa. **Es lo único que este archivo declara de esa tabla**,
 * y no está en ninguna otra parte del repositorio: ni en el esquema, ni en la
 * interfaz, ni en la ruta que guarda la configuración.
 *
 * `audits/limite-pantalla-motor-unico.mjs` lee la tabla de `docs/decisions.md`
 * y la cruza contra esto renglón por renglón. Si difieren, el auditor no decide
 * cuál tiene razón: dice que difieren y para el commit. Manda el documento.
 *
 * `[criterio propio]` en las tres filas salvo por el tope de 45 de KINDER, que
 * tampoco es de fuente primaria — el único número con fuente primaria en toda
 * D-016 es el tope de 60 min de la OMS para 2-4 años, y esa franja de edad
 * está **por debajo** del producto (que empieza a los 4). Es decir: en la
 * práctica, **ningún número de esta tabla viene de una autoridad**, y decirlo
 * así es más honesto que citar a la OMS de refilón. Ver D-016 y `mc-26` §2.
 */
export const LIMITES_POR_BANDA: Record<BandaConLimite, LimiteDeBanda> = Object.freeze({
  KINDER: Object.freeze({ defaultMin: 20, minMin: 10, maxMin: 45, descansoCadaMin: 15, corteNocturnoMinAntes: 60 }),
  PRIMARIA: Object.freeze({ defaultMin: 30, minMin: 15, maxMin: 60, descansoCadaMin: 20, corteNocturnoMinAntes: 60 }),
  SECUNDARIA: Object.freeze({ defaultMin: 45, minMin: 15, maxMin: 90, descansoCadaMin: 25, corteNocturnoMinAntes: 30 }),
});

/**
 * Cuántos minutos antes del corte se avisa. **Fijo en las tres bandas.**
 *
 * D-016 lo escribe así, textual («aviso a los 5 minutos»), sin columna por
 * banda — a diferencia de todo lo demás de la tabla. Por eso es una constante y
 * no una quinta propiedad de `LimiteDeBanda`: una propiedad por banda invitaría
 * a que alguien le pusiera tres valores distintos, y D-016 no los da.
 */
export const AVISO_MINUTOS_ANTES = 5;

/**
 * La hora local a la que termina la ventana de corte nocturno.
 *
 * `[criterio propio, no hay fuente que fije esta hora]` — la misma honestidad
 * que D-016 usa para su tabla. Hace falta porque `bedtime_local` marca dónde
 * EMPIEZA la noche y ninguna decisión dice dónde termina; sin un final, la
 * ventana sería un punto y un niño despierto a la una de la mañana podría
 * jugar sin tropezar con ella — que es exactamente el caso que el ECA de Bath
 * (`mc-26` §5) motiva.
 */
export const FIN_DE_LA_NOCHE: HoraLocal = "05:00";

/** ¿Esta banda tiene límite de pantalla, o es el adulto aprendiz? */
export function tieneLimite(banda: TemaVisual): banda is BandaConLimite {
  return Object.prototype.hasOwnProperty.call(LIMITES_POR_BANDA, banda);
}

/**
 * ¿Puede el padre guardar este valor para esta banda?
 *
 * **La llaman el cliente y el servidor, nunca uno solo.** El cliente para
 * deshabilitar «Guardar» antes de someter; el servidor porque no confía en el
 * cliente. Es aritmética pura sin red, así que cabe en el navegador sin costo,
 * y tener una sola función evita el rango copiado a un segundo sitio — que es
 * cómo la interfaz acaba ofreciendo un valor que el servidor rechaza.
 *
 * Rechaza los no enteros a propósito: `screen_time_settings.daily_minutes` es
 * `INTEGER`, y 22.5 minutos se guardarían como 22 sin que nadie lo dijera.
 */
export function minutosDiariosPermitidos(banda: BandaConLimite, minutos: number): boolean {
  const limite = LIMITES_POR_BANDA[banda];
  if (limite === undefined) return false;
  return Number.isInteger(minutos) && minutos >= limite.minMin && minutos <= limite.maxMin;
}

// ─── La hora local del hogar (#273) ────────────────────────────────────────
//
// `horaLocal` y el tipo `HoraLocal` viven en `tiempo-local.ts` desde #268 y
// llegan por la reexportación de arriba. `FORMA_HORA` se queda aquí porque su
// único uso es `minutosDelDia`.

const FORMA_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Minutos transcurridos desde la medianoche local. `"19:30"` → 1170. */
export function minutosDelDia(hora: HoraLocal): number {
  const m = FORMA_HORA.exec(hora);
  if (!m) throw new RangeError(`hora local mal formada: "${hora}" (se esperaba HH:MM de 00:00 a 23:59)`);
  return Number(m[1]) * 60 + Number(m[2]);
}

const MINUTOS_DEL_DIA_COMPLETO = 24 * 60;

/**
 * ¿Cae `ahora` dentro de la ventana de corte nocturno?
 *
 * La ventana va de `bedtime − corteNocturnoMinAntes` hasta `FIN_DE_LA_NOCHE`, y
 * **da la vuelta a la medianoche**, que es el caso normal: con una hora de
 * dormir a las 20:30 y una hora de antelación, la ventana es de 19:30 a 05:00
 * del día siguiente. Compararla con `<` y `>` sin pensar en la vuelta es cómo
 * el corte nocturno deja de existir entre medianoche y el amanecer.
 *
 * `bedtime === null` significa «sin corte nocturno», que la migración 0003
 * distingue explícitamente de medianoche. Devuelve `false` y no mira nada más:
 * no se inventa una hora de dormir a partir del año de nacimiento, porque sería
 * un dato que el producto no tiene y no debería fingir tener (D-053).
 */
export function enVentanaNocturna(
  ahora: HoraLocal,
  bedtime: HoraLocal | null,
  corteNocturnoMinAntes: number,
): boolean {
  if (bedtime === null) return false;

  const t = minutosDelDia(ahora);
  const fin = minutosDelDia(FIN_DE_LA_NOCHE);
  const inicio =
    (minutosDelDia(bedtime) - corteNocturnoMinAntes + MINUTOS_DEL_DIA_COMPLETO) % MINUTOS_DEL_DIA_COMPLETO;

  // Sin vuelta: la ventana cabe dentro del mismo día. Pasa solo con horas de
  // dormir de madrugada, que son un disparate del padre y no un caso a servir —
  // pero se calcula bien igual, que es más barato que rechazarlo.
  if (inicio <= fin) return t >= inicio && t < fin;
  // Con vuelta, el caso normal.
  return t >= inicio || t < fin;
}

// ─── La configuración: lo que el padre eligió (`screen_time_settings`) ───────

/**
 * Una fila de `screen_time_settings`. **La escribe el padre, nunca el niño.**
 *
 * `bedtime_cutoff_min` está en la tabla desde la 0002 y aquí no se expone como
 * algo editable: D-016 publica un solo valor por banda para esa columna, sin
 * rango, así que ofrecerla como número editable inventaría un rango que ninguna
 * fuente sugiere. `configuracionVigente` la fuerza al valor de la banda.
 */
export interface ConfiguracionDeLimite {
  readonly daily_minutes: number;
  readonly break_every_min: number;
  readonly bedtime_cutoff_min: number;
  readonly bedtime_local: HoraLocal | null;
}

/**
 * La configuración con la que nace un perfil, antes de que el padre toque nada.
 *
 * `bedtime_local: null` — sin corte nocturno hasta que el padre lo encienda.
 * El límite diario, en cambio, aplica desde el primer minuto con el default de
 * la banda: la protección no espera a que un adulto visite una pantalla que
 * nada lo obliga a visitar. Es la respuesta A de la pregunta 3 de #265, y se
 * anota en `docs/dudas.md` como implementada a la espera de confirmación.
 */
export function configuracionPorDefecto(banda: BandaConLimite): ConfiguracionDeLimite {
  const limite = LIMITES_POR_BANDA[banda];
  return Object.freeze({
    daily_minutes: limite.defaultMin,
    break_every_min: limite.descansoCadaMin,
    bedtime_cutoff_min: limite.corteNocturnoMinAntes,
    bedtime_local: null,
  });
}

/**
 * La configuración que de verdad se aplica, con o sin fila en la base.
 *
 * Tres cosas, y las tres importan:
 *
 *  · **Sin fila, el default de la banda.** F2 diseñó un paso de onboarding que
 *    escribe `screen_time_settings` y nunca se construyó, así que hoy ninguna
 *    ruta la llena: un perfil real no tiene fila. Si la ausencia significara
 *    «sin límite», el límite no existiría para nadie.
 *  · **Un `daily_minutes` fuera de rango se corrige al default**, no se
 *    respeta. Una fila escrita antes de que existiera la validación —o por una
 *    vía que no la usó— no puede convertirse en un límite de 600 minutos.
 *  · **`bedtime_cutoff_min` viene siempre de la banda.** Ver arriba.
 *
 * Lo que NO hace: no acepta ninguna bandera de plan, suscripción o pago que
 * ensanche el límite. No hay parámetro donde ponerla, y
 * `audits/limite-nunca-se-levanta-pagando.mjs` lo comprueba ejecutando.
 */
export function configuracionVigente(
  banda: BandaConLimite,
  fila: ConfiguracionDeLimite | null,
): ConfiguracionDeLimite {
  const porDefecto = configuracionPorDefecto(banda);
  if (fila === null) return porDefecto;

  const limite = LIMITES_POR_BANDA[banda];
  const diarios = minutosDiariosPermitidos(banda, fila.daily_minutes)
    ? fila.daily_minutes
    : porDefecto.daily_minutes;

  return Object.freeze({
    daily_minutes: diarios,
    // El descanso no se expone en la pantalla del padre en esta pasada (§5.2
    // del plan), así que una fila con un valor raro se corrige al de la banda.
    break_every_min:
      Number.isInteger(fila.break_every_min) && fila.break_every_min > 0
        ? fila.break_every_min
        : limite.descansoCadaMin,
    bedtime_cutoff_min: limite.corteNocturnoMinAntes,
    bedtime_local: fila.bedtime_local !== null && FORMA_HORA.test(fila.bedtime_local)
      ? fila.bedtime_local
      : null,
  });
}

// ─── El consumo del día (`screen_time_daily_usage`, migración 0011) ─────────

/**
 * Por qué terminó el día. Los dos valores del `CHECK` de la migración 0011.
 *
 * En inglés y en SCREAMING_SNAKE porque son valores de una columna de D1, no
 * texto de producto: nada de esto se le enseña a nadie. El copy que lee un niño
 * vive en `apps/web/src/i18n/limite-pantalla/`, autorado por locale (D-022).
 */
export type MotivoDeCierre = "DAILY_LIMIT" | "BEDTIME";

/**
 * Una fila de `screen_time_daily_usage`: **una por niño y por día local**.
 *
 * Nunca una por sesión y nunca una por intento — `mc-32` riesgo #1. Es un
 * rollup, del mismo espíritu que `score_totals` y `skill_state`. La fila no
 * lleva el identificador del niño por la misma razón que `EstadoSesion` no lo
 * lleva: quien la lee ya sabe de quién es, y repetirlo sería una copia más del
 * dato que D-020 y `mc-25` piden minimizar.
 */
export interface UsoDelDia {
  readonly local_date: DiaLocal;
  readonly minutes_used: number;
  readonly minutes_since_break: number;
  /** Instante UTC en que se avisó hoy, o `null`. Evita avisar dos veces (#270). */
  readonly warned_at: number | null;
  readonly ended_reason: MotivoDeCierre | null;
}

/** El uso con el que empieza un día. Cero minutos, sin aviso, sin cierre. */
export function usoInicial(dia: DiaLocal): UsoDelDia {
  return Object.freeze({
    local_date: dia,
    minutes_used: 0,
    minutes_since_break: 0,
    warned_at: null,
    ended_reason: null,
  });
}

/**
 * El único SQL que escribe el consumo del día (#267).
 *
 * Vive aquí y no en la ruta que lo ejecuta por la misma razón que
 * `SQL_UPSERT_RACHA` vive en `racha.ts`: un solo sitio donde estas columnas se
 * escriben, y que sea el mismo archivo que las calcula. Dos escritores dan dos
 * consumos para el mismo niño y el mismo día, y cuál se lea depende del orden.
 *
 * Escribe el estado COMPLETO que devolvió el motor, no un delta
 * (`minutes_used = minutes_used + ?`). Un delta obligaría a recomputar la
 * decisión dentro del SQL, y sobre todo haría que un reintento de la cola
 * offline sumara dos veces los mismos minutos. La suma la hace `acumular()`,
 * que es puro y se prueba sin base.
 */
export const SQL_UPSERT_USO = `
INSERT INTO screen_time_daily_usage (
  child_profile_id, local_date, minutes_used, minutes_since_break,
  warned_at, ended_reason, updated_at
)
VALUES (?, ?, ?, ?, ?, ?, ?)
ON CONFLICT (child_profile_id, local_date) DO UPDATE SET
  minutes_used        = excluded.minutes_used,
  minutes_since_break = excluded.minutes_since_break,
  warned_at           = excluded.warned_at,
  ended_reason        = excluded.ended_reason,
  updated_at          = excluded.updated_at
`.trim();

/**
 * Suma al consumo del día los minutos de un checkpoint del servidor.
 *
 * **Los minutos los mide el servidor**, con la resta de dos sellos suyos, igual
 * que el tiempo de respuesta de `sesion.ts`. Aquí solo se suman. El riesgo que
 * eso cierra no es el puntaje: es que el límite se evada cambiando el reloj del
 * teléfono, que es lo que haría cualquiera de doce años en media tarde.
 *
 * Un delta negativo se descarta en vez de restar. Pasa de verdad cuando dos
 * pestañas del mismo niño reportan fuera de orden, y restar minutos ya jugados
 * convertiría el desorden en tiempo extra regalado.
 *
 * Un delta absurdo se recorta a `TOPE_DE_CHECKPOINT_MIN`: si el aparato se
 * durmió con la sesión abierta, el reloj del servidor sigue avanzando y el niño
 * no estaba jugando. Cobrarle esos minutos sería cortarle el día por haber
 * cerrado la tapa.
 */
export const TOPE_DE_CHECKPOINT_MIN = 10;

export function acumular(uso: UsoDelDia, minutos: number): UsoDelDia {
  if (!Number.isFinite(minutos) || minutos <= 0) return uso;
  const delta = Math.min(minutos, TOPE_DE_CHECKPOINT_MIN);
  return {
    ...uso,
    minutes_used: uso.minutes_used + delta,
    minutes_since_break: uso.minutes_since_break + delta,
  };
}

/**
 * Queda anotado que hoy ya se avisó (#270).
 *
 * Idempotente: si ya había un `warned_at`, devuelve **el mismo objeto**, no una
 * copia igual. Quien llama puede comparar por referencia para saber si hay algo
 * que escribir. Es lo que evita el caso del criterio de #270: el niño cierra la
 * app entre el aviso y el corte, la reabre, y le vuelven a avisar.
 */
export function marcarAvisado(uso: UsoDelDia, instanteUTC: number): UsoDelDia {
  if (uso.warned_at !== null) return uso;
  return { ...uso, warned_at: instanteUTC };
}

/**
 * El descanso se mostró: el contador vuelve a empezar (#271).
 *
 * `minutes_used` **no se toca**, y es la mitad de la decisión: el descanso no
 * cuenta ni a favor ni en contra del límite diario. Si descontara, el niño
 * saldría ganando tiempo por descansar y el límite dejaría de ser un límite; si
 * sumara, descansar costaría juego y nadie descansaría.
 *
 * No hay aquí ninguna espera, ningún segundo y ningún temporizador, y esa
 * ausencia es la regla de #271 («sin bloqueo cronometrado») hecha código: la
 * pantalla que muestre esto tiene su botón de seguir disponible de inmediato.
 */
export function reiniciarDescanso(uso: UsoDelDia): UsoDelDia {
  return { ...uso, minutes_since_break: 0 };
}

/**
 * El día se cerró, y por qué (#272, #273).
 *
 * `ended_reason` alimenta el «un día que terminó por el límite, nunca por
 * descuido» del panel del padre — subsistema de reportes, fuera de este PR. La
 * columna se deja escrita para que ese subsistema no tenga que tocar el esquema.
 *
 * Idempotente por la misma razón que `marcarAvisado`: el primer motivo manda.
 * Un cierre nocturno que después se sobrescribiera con `DAILY_LIMIT` le contaría
 * al padre una historia falsa sobre la noche de su hijo.
 */
export function marcarCierre(uso: UsoDelDia, motivo: MotivoDeCierre): UsoDelDia {
  if (uso.ended_reason !== null) return uso;
  return { ...uso, ended_reason: motivo };
}

// ─── La decisión (#270, #271, #272, #273) ────────────────────────────────────

/**
 * Lo que el límite decide en un momento dado. Unión discriminada, no cuatro
 * booleanos: con booleanos, «avisar y cerrar a la vez» compila.
 */
export type Decision =
  | { readonly tipo: "SEGUIR" }
  | { readonly tipo: "AVISO" }
  | { readonly tipo: "DESCANSO" }
  | { readonly tipo: "CERRAR"; readonly motivo: MotivoDeCierre };

const SEGUIR: Decision = Object.freeze({ tipo: "SEGUIR" });

/**
 * Lo que hace falta para decidir. **Todo lo que hay, y nada más.**
 *
 * No lleva plan, ni suscripción, ni bandera de pago, ni el reloj del
 * dispositivo del niño. No es que se ignoren: es que no hay dónde ponerlos, que
 * es la única forma de que no se usen.
 */
export interface EntradaDeDecision {
  readonly banda: BandaConLimite;
  /** La fila de `screen_time_settings`, o `null` si el padre nunca guardó. */
  readonly config: ConfiguracionDeLimite | null;
  readonly uso: UsoDelDia;
  /** La hora en la zona del HOGAR (`users.timezone`), calculada con `horaLocal`. */
  readonly horaAhora: HoraLocal;
  /** `sesion.ts::puntoSeguroDeCorte` — F3, #33. No se recalcula aquí. */
  readonly puntoSeguro: boolean;
}

/**
 * La única tabla de decisión del límite de pantalla.
 *
 * ─── La primera regla, y por qué está antes que todas ─────────────────────
 *
 * **Sin punto seguro, `SEGUIR`.** Se devuelve antes de mirar los minutos, la
 * hora o cualquier otra cosa, así que ninguna combinación de estado puede
 * producir un corte con un ítem servido esperando respuesta. D-016 lo dice
 * textual —«Nunca corte seco a media respuesta»— y `sesion.ts` lo dice desde el
 * otro lado: *«F8 pregunta, no impone»*. Cortar a un niño mientras piensa es
 * peor que cortarlo dos minutos después, y convierte una protección en un
 * castigo por haber tardado en pensar.
 *
 * ─── El orden de lo demás, y por qué ese ─────────────────────────────────
 *
 *  1. **Noche.** Va primero porque es lo único de D-016 con evidencia
 *     experimental detrás (el ECA de Bath, `mc-26` §5). Si la hora ya cayó en
 *     la ventana, da igual cuántos minutos queden del día.
 *  2. **Límite diario.**
 *  3. **Descanso**, que es una oferta y no un cierre.
 *  4. **Aviso**, una sola vez al día (`warned_at`).
 *
 * ─── Lo que esta función NO decide ───────────────────────────────────────
 *
 * No decide la racha. No la nombra, no la lee y no la escribe. Cuando la
 * decisión es `CERRAR`, `diaCumplidoPorCorte()` —abajo— da el motivo que
 * `racha.ts::registrarDia` espera, y ese motivo produce exactamente el mismo
 * estado que un reto terminado (línea roja #6).
 *
 * Tampoco decide cómo se ve nada. `AVISO` y `DESCANSO` y `CERRAR` son hechos;
 * la pantalla que los pinta —con cifra o sin cifra, según la banda lea o no—
 * vive en la interfaz y su copy en `i18n/limite-pantalla/` (#270, #272).
 */
export function decidir(entrada: EntradaDeDecision): Decision {
  if (!entrada.puntoSeguro) return SEGUIR;

  const config = configuracionVigente(entrada.banda, entrada.config);
  const uso = entrada.uso;

  if (enVentanaNocturna(entrada.horaAhora, config.bedtime_local, config.bedtime_cutoff_min)) {
    return { tipo: "CERRAR", motivo: "BEDTIME" };
  }

  if (uso.minutes_used >= config.daily_minutes) {
    return { tipo: "CERRAR", motivo: "DAILY_LIMIT" };
  }

  if (uso.minutes_since_break >= config.break_every_min) {
    return { tipo: "DESCANSO" };
  }

  if (uso.warned_at === null && uso.minutes_used >= config.daily_minutes - AVISO_MINUTOS_ANTES) {
    return { tipo: "AVISO" };
  }

  return SEGUIR;
}

/**
 * ¿Puede empezar una sesión nueva ahora mismo?
 *
 * Es `decidir()` con `puntoSeguro: true`, porque el arranque de una sesión es
 * un punto seguro por definición: no hay ningún ítem servido esperando. No es
 * una segunda tabla de decisión — es **la misma**, y por eso una regla nueva no
 * puede aplicarse a una de las dos puertas y olvidarse en la otra.
 *
 * Implementa la respuesta A de la pregunta 1 de #265: **el corte nocturno
 * también impide empezar de madrugada**, no solo cortar lo que ya estaba
 * abierto. Con la alternativa B, un niño que se despierta a la una de la mañana
 * y abre la app juega sin tropezar con nada, porque no había ninguna sesión «en
 * curso» al momento del corte — y ése es justo el caso que motiva el ECA de
 * Bath. Queda anotado en `docs/dudas.md` a la espera de confirmación del dueño.
 */
export function decidirAlIniciar(entrada: Omit<EntradaDeDecision, "puntoSeguro">): Decision {
  return decidir({ ...entrada, puntoSeguro: true });
}

// ─── La frontera con la racha (línea roja #6, D-014, #202) ──────────────────

/**
 * El corte cerró el día, **y el día cuenta como cumplido**.
 *
 * Es el otro extremo del cable que sostiene `racha.ts`. Allí el motivo no entra
 * en la aritmética, así que `LIMITE_DE_PANTALLA_CORTO_LA_SESION` y
 * `RETO_COMPLETADO` producen estados idénticos. Aquí se garantiza que el corte
 * **siempre produce un motivo**: el tipo de retorno es `MotivoDelDia`, no
 * `MotivoDelDia | null`, y no hay ninguna rama.
 *
 * Los dos motivos de cierre devuelven lo mismo a propósito. Un `switch` con dos
 * casos idénticos parecería más explícito y sería peor: la única forma de que
 * el corte nocturno terminara valiendo menos que el diario es que alguien
 * pudiera escribir un caso distinto, y aquí no puede.
 *
 * **Lo que esta función NO hace:** no llama a `registrarDia`, no escribe
 * `child_streak` y no toca ningún contador. Devuelve el motivo y ya. Quien
 * cierra la sesión llama a `racha.ts` con él — y `audits/racha-limite-no-rompe.mjs`
 * vigila desde el otro lado que ninguna ruta decida saltarse esa llamada.
 *
 * @param cierre por qué se cortó. No cambia el resultado, y esa igualdad es la
 *   línea roja #6 hecha código — igual que el `motivo` de `registrarDia`.
 */
export function diaCumplidoPorCorte(cierre: MotivoDeCierre): MotivoDelDia {
  void cierre;
  return { tipo: "LIMITE_DE_PANTALLA_CORTO_LA_SESION" };
}
