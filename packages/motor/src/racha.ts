/**
 * El motor de racha. Uno solo (D-014, línea roja #6).
 *
 * Es un módulo PURO, con el mismo contrato que `puntuacion.ts`: entra un estado
 * y un día, sale un estado, y no toca la red, ni el reloj, ni la base. La
 * diferencia con `puntuacion.ts` es que aquí «no toca el reloj» no es una
 * comodidad de pruebas — es la regla:
 *
 *   · Un día es un día LOCAL del hogar (D-016 ya usa `users.timezone` para el
 *     corte nocturno; la racha reusa esa misma columna). Si este módulo pudiera
 *     leer `Date.now()`, la tentación sería comparar en UTC, y una familia en
 *     `America/Mexico_City` que juega a las 19:00 vería su día contado como el
 *     siguiente durante media vida del producto.
 *   · `diaEfectivo()` es la ÚNICA puerta entre un instante y un día. Recibe la
 *     zona IANA; no la adivina, no la lee del dispositivo del niño. Vive en
 *     `tiempo-local.ts` desde #268 y se reexporta aquí: este módulo fijó la
 *     puerta, y medio repo la importa de aquí.
 *
 * ─── Lo que este módulo garantiza, y de dónde sale ────────────────────────
 *
 *  1. **El límite de pantalla nunca rompe la racha** (D-014, textual: «si el
 *     límite de pantalla corta la sesión, la racha del día se da por cumplida»).
 *     La forma en que se garantiza importa: el `motivo` **no entra en la
 *     aritmética**. `RETO_COMPLETADO` y `LIMITE_DE_PANTALLA_CORTO_LA_SESION`
 *     producen exactamente el mismo estado. El motivo existe para que quien
 *     llama no tenga que preguntarse «¿completó la meta?» cuando el corte fue
 *     del padre y no del niño — no para que aquí haya una rama que trate peor a
 *     uno de los dos. Una rama es justo lo que se puede escribir mal.
 *
 *  2. **La protección nunca se vende** (línea roja #6, D-014, D-021). Ninguna
 *     función de este archivo acepta un precio, un SKU, un cupón ni un
 *     identificador de transacción, y `audits/racha-nunca-se-vende.mjs` bloquea
 *     el commit que se lo agregue. `mc-16` documenta el patrón exacto que esto
 *     prohíbe: Duolingo mezcla las vías de obtención del Streak Freeze con
 *     gemas comprables, y sus corazones son «el mecanismo más criticado; la
 *     prensa lo describe como diseñado para empujar la suscripción».
 *
 *  3. **Nunca hay lenguaje de pérdida, porque no hay evento de pérdida.** Este
 *     módulo no emite «perdiste tu racha» ni «te queda 1 escudo». Devuelve un
 *     estado. `mc-17` §5 de sus implicaciones: sustituir «you'll lose your
 *     streak!» por un contador que sencillamente no avanza — el *confirm-shaming*
 *     y la urgencia fabricada son categorías nombradas por la FTC.
 *
 * ─── La advertencia honesta que va con esto ───────────────────────────────
 *
 * `mc-16` es la fuente de casi todo el diseño de arriba, y trae su propio
 * desmentido: la evidencia de Duolingo es fuerte en INGENIERÍA DE ENGANCHE y
 * **débil en aprendizaje** — su propio CEO compara la app con «una elíptica»
 * [9]. Sailer & Homner (2020) miden efectos pequeños-moderados de la
 * gamificación (conductual g=0.25), y Hamari et al. (2014) advierten
 * explícitamente del **efecto novedad**: la mejora inicial se debe en parte a
 * que la mecánica es nueva, y decae.
 *
 * Traducido a este archivo: la racha existe para que alguien VUELVA. No
 * enseña. Ninguna decisión de aquí puede justificarse diciendo «así aprende
 * más», porque la investigación que la respalda no dice eso.
 *
 * ─── Nombres de campo: por qué son las columnas de D1 y no camelCase ──────
 *
 * `EstadoRacha` usa los mismos nombres que la tabla `child_streak` de la issue
 * #201. No es descuido de estilo: `audits/racha-nunca-se-vende.mjs` vigila el
 * grafo de lo que toca `shields_available`, y una capa de traducción entre
 * `shields_available` y `escudosDisponibles` sería exactamente el punto donde
 * el auditor deja de ver y donde un mapeo mal escrito se esconde.
 */

import { type DiaLocal } from "./tiempo-local.ts";

// La puerta instante→día/hora vive en `tiempo-local.ts` (#268): un solo
// calendario para F7 y F8. Se reexporta aquí porque este módulo la fijó y
// medio repo la importa de aquí — `audits/limite-pantalla-motor-unico.mjs`
// comprueba la identidad por referencia, así que una copia sería un segundo
// calendario.
export { diaEfectivo, zonaValida, type DiaLocal } from "./tiempo-local.ts";

const FORMA_DIA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * El estado completo de una racha. Una fila de `child_streak` (#201).
 *
 * Es de solo lectura a propósito: todas las funciones de este archivo devuelven
 * un objeto nuevo. Un estado mutado a medias —escudo descontado, racha sin
 * actualizar— es el defecto que ninguna prueba encuentra.
 */
export interface EstadoRacha {
  readonly current_streak: number;
  readonly max_streak: number;
  readonly last_completed_local_date: DiaLocal | null;
  readonly shields_available: number;
  readonly shields_earned_total: number;
  /**
   * Cuántos escudos ha ganado ESTA racha (D-079).
   *
   * Existe para cerrar el hueco de `min(2, floor(racha/7))`: sin ella el banco
   * se repone cada siete días para siempre, y pasado el día 14 saltarse un día
   * de cada siete no costaba nada. Vuelve a 0 cuando la racha vuelve a 1.
   *
   * La columna llega en `migrations/0008_escudos_por_racha.sql`, no en la 0007.
   * Se intentó editar la 0007 en su sitio —comprobando antes que las tablas no
   * existían en la base remota— y `audits/migration-safety.mjs` lo paró con la
   * razón correcta: **D1 lleva el control por nombre de archivo**, no por el
   * estado de las tablas, así que una 0007 ya marcada como aplicada nunca
   * volvería a correr y el cambio se habría perdido en silencio.
   */
  readonly shields_earned_this_streak: number;
  readonly pause_until_local_date: DiaLocal | null;
  readonly pause_uses_this_year: number;
  readonly pause_year: number | null;
  /**
   * Cuántos días ha jugado ESTE perfil, acumulados de por vida (#205).
   *
   * Es la posición del sendero de racha de KINDER: un paso por día JUGADO, y
   * el sendero jamás retrocede — ni cuando un escudo cubre un día, ni cuando
   * `current_streak` vuelve a 1 (`mc-43` §6: la racha perdida nunca borra ni
   * hace retroceder el mapa). Ni `current_streak` (baja a 1) ni `max_streak`
   * (la mejor racha, no la suma) pueden expresarlo, así que tiene columna
   * propia: `migrations/0013_dias_jugados_sendero.sql`.
   *
   * Solo sube, y solo en `conDia()` — el único sitio donde un día cuenta. El
   * `motivo` no entra: un día cumplido por corte de límite de pantalla suma
   * paso igual que un día de reto completado (línea roja #6).
   */
  readonly days_played_total: number;
}

/**
 * Por qué el día cuenta como cumplido.
 *
 * Unión discriminada, no un booleano `cortadaPorLimite`. La razón es la misma
 * que `puntuacion.ts` da para `Intento`/`IntentoKinder`: un campo opcional
 * compila donde no debería. Con un booleano, `registrarDia(estado, dia)` —sin
 * el tercer argumento— seguiría compilando y trataría todo como reto completado.
 *
 * `LIMITE_DE_PANTALLA_CORTO_LA_SESION` se llama así, largo y feo, para que
 * `audits/racha-limite-no-rompe.mjs` pueda buscar la cadena exacta en cualquier
 * archivo del repo y ver qué hace a su alrededor.
 */
export type MotivoDelDia =
  | { readonly tipo: "RETO_COMPLETADO" }
  | { readonly tipo: "LIMITE_DE_PANTALLA_CORTO_LA_SESION" };

/** El estado con el que nace un perfil. Racha 0, sin escudos, sin pausa. */
export const ESTADO_INICIAL: EstadoRacha = Object.freeze({
  current_streak: 0,
  max_streak: 0,
  last_completed_local_date: null,
  shields_available: 0,
  shields_earned_total: 0,
  shields_earned_this_streak: 0,
  pause_until_local_date: null,
  pause_uses_this_year: 0,
  pause_year: null,
  days_played_total: 0,
});

/** Cuántos escudos caben en el banco. #203: el mismo 2 del nivel gratuito de Duolingo. */
export const TOPE_ESCUDOS = 2;

/** Cada cuántos días de racha real se merece un escudo (#203). */
export const DIAS_POR_ESCUDO = 7;

/** Cuántas pausas familiares puede declarar un hogar por año calendario (#204). */
export const PAUSAS_POR_ANIO = 4;

/** Cuántos días puede durar una pausa (#204). */
export const DIAS_MAXIMOS_DE_PAUSA = 21;

/**
 * Cuántos días después de la ruptura se puede reparar hacia atrás (#204).
 *
 * `[criterio propio, no hay fuente que fije este número]` — la misma honestidad
 * que D-016 usa para su tabla de minutos.
 */
export const VENTANA_DE_REPARACION = 5;

/** La zona que se usa cuando no se conoce ninguna. Nunca se adivina otra. */
export const ZONA_DE_RESPALDO = "UTC";

// ─── El día efectivo (#200) ──────────────────────────────────────────────────

/**
 * El único SQL que escribe una racha (#201, #210).
 *
 * Vive aquí y no en la ruta que lo ejecuta por la misma razón que
 * `SQL_UPSERT` vive en `rollup.ts`: para que haya un solo sitio donde estas
 * columnas se escriben, y que ese sitio sea el mismo archivo que las calcula.
 * Dos escritores dan dos rachas para el mismo niño, y la que se lea depende del
 * orden — que es cómo un número se vuelve irreproducible sin que nadie mienta.
 *
 * Escribe el estado COMPLETO que devolvió el motor, no un delta. La racha no es
 * un acumulado: es una máquina de estados cuya transición ya se calculó arriba,
 * y mandar deltas obligaría a recomputarla dentro del SQL.
 *
 * La idempotencia no está aquí, está en `registrarDia`: si el día ya se
 * registró, devuelve el mismo objeto y quien llama no ejecuta nada.
 */
export const SQL_UPSERT_RACHA = `
INSERT INTO child_streak (
  id, child_profile_id, current_streak, max_streak, last_completed_local_date,
  shields_available, shields_earned_total, shields_earned_this_streak,
  pause_until_local_date, pause_uses_this_year, pause_year, days_played_total,
  updated_at
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT (child_profile_id) WHERE child_profile_id IS NOT NULL DO UPDATE SET
  current_streak            = excluded.current_streak,
  max_streak                = excluded.max_streak,
  last_completed_local_date = excluded.last_completed_local_date,
  shields_available         = excluded.shields_available,
  shields_earned_total      = excluded.shields_earned_total,
  shields_earned_this_streak = excluded.shields_earned_this_streak,
  pause_until_local_date    = excluded.pause_until_local_date,
  pause_uses_this_year      = excluded.pause_uses_this_year,
  pause_year                = excluded.pause_year,
  days_played_total         = excluded.days_played_total,
  updated_at                = excluded.updated_at
`.trim();

// `zonaValida` y `diaEfectivo` vivían aquí. Desde #268 viven en
// `tiempo-local.ts` y llegan por la reexportación de arriba: F7 y F8 comparten
// UN calendario, y su dueño neutral es ese módulo, no éste.

function comoUTC(dia: DiaLocal): number {
  if (!FORMA_DIA.test(dia)) {
    throw new RangeError(`día local mal formado: "${dia}" (se esperaba YYYY-MM-DD)`);
  }
  const [a, m, d] = dia.split("-").map(Number);
  const t = Date.UTC(a, m - 1, d);
  if (Number.isNaN(t)) throw new RangeError(`día local imposible: "${dia}"`);
  return t;
}

/**
 * Días de calendario entre dos días locales. `desde` incluido, `hasta` excluido.
 *
 * Se cuenta sobre etiquetas, no sobre instantes: `2026-03-08` → `2026-03-09` es
 * 1 aunque en `America/Los_Angeles` ese intervalo real dure 23 horas por el
 * horario de verano. La racha cuenta DÍAS, y un día de 23 horas sigue siendo un
 * día. Hacerlo con aritmética de instantes es cómo se pierde una racha en marzo.
 */
export function diasEntre(desde: DiaLocal, hasta: DiaLocal): number {
  return Math.round((comoUTC(hasta) - comoUTC(desde)) / 86_400_000);
}

/** El día local `n` días después de `dia`. `n` puede ser negativo. */
export function sumarDias(dia: DiaLocal, n: number): DiaLocal {
  const t = comoUTC(dia) + n * 86_400_000;
  const d = new Date(t);
  const anio = String(d.getUTCFullYear()).padStart(4, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${anio}-${mes}-${dd}`;
}

/** El año calendario de un día local. Para el contador anual de pausas (#204). */
export function anioDe(dia: DiaLocal): number {
  return Number(dia.slice(0, 4));
}

// ─── Registrar un día (#201, #202, #209) ─────────────────────────────────────

/**
 * El día `dia` cuenta como practicado.
 *
 * Idempotente: llamarla dos veces con el mismo `dia` devuelve **el mismo
 * objeto**, no una copia igual. Es a propósito — quien llame puede comparar por
 * referencia para saber si hay algo que escribir en D1, y así el reintento de
 * una cola offline no escribe una fila por intento.
 *
 * Fuera de orden: si `dia` es anterior o igual a `last_completed_local_date`, es
 * un no-op. Pasa de verdad con `offline.ts` (#209): una cola que se sincroniza
 * al aterrizar puede entregar el martes después del miércoles. La racha no
 * retrocede nunca; el precio es que un día viejo entregado tarde no se recupera.
 * Está anotado como residuo conocido en el PR, no escondido aquí.
 *
 * @param motivo ver `MotivoDelDia`. **No cambia el resultado.** Ver la nota 1
 *   de la cabecera del archivo: el límite de pantalla y el reto completado
 *   producen el mismo estado, y esa igualdad es la línea roja #6 hecha código.
 */
export function registrarDia(
  estado: EstadoRacha,
  dia: DiaLocal,
  motivo: MotivoDelDia,
): EstadoRacha {
  comoUTC(dia); // valida la forma antes de tocar nada
  if (motivo.tipo !== "RETO_COMPLETADO" && motivo.tipo !== "LIMITE_DE_PANTALLA_CORTO_LA_SESION") {
    throw new RangeError(`motivo desconocido: ${JSON.stringify(motivo)}`);
  }

  const ultimo = estado.last_completed_local_date;

  // Primer día de la vida del perfil.
  if (ultimo === null) {
    return conDia(estado, dia, 1, estado.shields_available);
  }

  const brecha = diasEntre(ultimo, dia);
  if (brecha <= 0) return estado; // idempotencia y llegada fuera de orden

  if (brecha === 1) {
    return conDia(estado, dia, estado.current_streak + 1, estado.shields_available);
  }

  // Hubo días de por medio. Se perdonan primero por pausa (no cuesta nada) y
  // después con escudos (uno por día). El orden importa: una familia que topa
  // el límite de pantalla todos los días nunca llega aquí, y una que declaró
  // una pausa no gasta escudos por los días que la pausa ya cubre.
  const perdidos: DiaLocal[] = [];
  for (let i = 1; i < brecha; i++) perdidos.push(sumarDias(ultimo, i));

  const hasta = estado.pause_until_local_date;
  const sinPausa = hasta === null ? perdidos : perdidos.filter((d) => diasEntre(d, hasta) < 0);

  if (sinPausa.length === 0) {
    // La pausa cubrió el hueco entero: la racha ni avanzó ni se rompió (#204).
    return conDia(estado, dia, estado.current_streak + 1, estado.shields_available);
  }

  if (sinPausa.length <= estado.shields_available) {
    return conDia(
      estado,
      dia,
      estado.current_streak + 1,
      estado.shields_available - sinPausa.length,
    );
  }

  // No alcanzó. La racha vuelve a empezar HOY, en 1 — nunca en 0, porque el
  // niño sí practicó hoy.
  //
  // Los escudos que había NO se gastan. Un escudo que no alcanzó a salvar nada
  // y aun así desapareció es pérdida sobre pérdida, y `mc-17` §5 pide justo lo
  // contrario: que un día saltado sencillamente no avance el contador, sin
  // castigo añadido. Se consumen solo cuando de verdad salvan la racha.
  return conDia(estado, dia, 1, estado.shields_available);
}

function conDia(
  estado: EstadoRacha,
  dia: DiaLocal,
  racha: number,
  escudos: number,
): EstadoRacha {
  return {
    ...estado,
    current_streak: racha,
    // `max_streak` NUNCA baja, ni cuando `current_streak` se resetea (#201).
    // Es el «contador de mejor marca personal» de mc-17 §83: lo único que la
    // racha puede decir sin lenguaje de pérdida es cuánto llegaste a hacer.
    max_streak: Math.max(estado.max_streak, racha),
    last_completed_local_date: dia,
    shields_available: escudos,
    // La racha volvió a empezar: el cupo de escudos de la anterior se cierra
    // con ella (D-079). Sin esta línea el contador nunca baja y la columna no
    // serviría de nada — es la mitad del arreglo, y la menos visible.
    shields_earned_this_streak: racha === 1 ? 0 : estado.shields_earned_this_streak,
    // Un paso más en el sendero de KINDER (#205). Sube AQUÍ y solo aquí:
    // `conDia` es el único camino por el que un día cuenta, así que el
    // acumulado es monótono por construcción y el sendero no puede retroceder
    // — ni con un escudo de por medio, ni con la racha reiniciada a 1
    // (`mc-43` §6). Y el `motivo` no entra: un día cumplido por corte de
    // límite de pantalla es un día jugado y suma su paso (línea roja #6).
    days_played_total: estado.days_played_total + 1,
  };
}

// ─── Escudos (#203) ──────────────────────────────────────────────────────────

/**
 * Los escudos que la racha ya se ganó.
 *
 * Función pura de `current_streak` y `shields_earned_this_streak`, y **de nada
 * más**. No hay parámetro de pago, de cupón, de SKU ni de transacción, y no
 * puede haberlo: `audits/racha-nunca-se-vende.mjs` bloquea el commit que
 * agregue uno. D-014 lo dice por nombre («nunca se vende protección de racha»)
 * y `mc-16` documenta que ese es exactamente el punto donde Duolingo cruza la
 * línea — sus vías de obtención del freeze se mezclan con gemas comprables.
 *
 * ─── Por qué NO se mide contra el banco disponible (D-079) ──────────────────
 *
 * La fórmula de #203 es `min(2, floor(current_streak / 7))`, y comparada contra
 * `shields_available` da los tres vectores del issue (13→1, 14→2, 21 con banco
 * lleno→2). Pero implica que el banco se REPONE cada siete días para siempre:
 * un niño que gasta un escudo con racha 15 vuelve a tener 2 al llegar a 21,
 * porque `floor(21/7) = 3` capado a 2. O sea que **pasado el día 14, saltarse
 * un día de cada siete no costaba prácticamente nada**, y la red de protección
 * dejaba de ser una red para volverse un permiso permanente.
 *
 * D-079 cierra eso: el tope de 2 es **por racha**, no cada siete días. Se
 * comparan los escudos ya ganados en esta racha, no los que quedan en el banco,
 * así que gastar uno no crea espacio para otro. Cuando la racha se rompe y
 * vuelve a 1, `conDia` pone el contador a 0 y el cupo se renueva con la racha
 * nueva — que es justo cuando la protección vuelve a tener sentido.
 *
 * Lo que NO cambia: la línea roja #6. El límite de pantalla nunca gasta un
 * escudo porque nunca rompe la racha — no llega a este camino.
 *
 * Nunca quita un escudo: si el banco tiene más de lo que el cupo da, se queda
 * como está. Un escudo que aparece y desaparece solo es peor que no tenerlo.
 */
export function ganarEscudos(estado: EstadoRacha): EstadoRacha {
  const merecidos = Math.floor(estado.current_streak / DIAS_POR_ESCUDO);
  const cupo = Math.min(TOPE_ESCUDOS, merecidos);
  // Contra lo GANADO en esta racha, no contra lo que queda en el banco: es la
  // línea entera del arreglo de D-079.
  if (cupo <= estado.shields_earned_this_streak) return estado;

  const nuevos = cupo - estado.shields_earned_this_streak;
  return {
    ...estado,
    shields_available: Math.min(TOPE_ESCUDOS, estado.shields_available + nuevos),
    shields_earned_total: estado.shields_earned_total + nuevos,
    shields_earned_this_streak: estado.shields_earned_this_streak + nuevos,
  };
}

// ─── Pausa familiar (#204) ───────────────────────────────────────────────────

/** Lo que `declararPausa` rechaza, con el tope escrito para que el padre lo lea. */
export class PausaRechazada extends Error {
  readonly motivo: string;
  constructor(motivo: string, mensaje: string) {
    super(mensaje);
    this.name = "PausaRechazada";
    this.motivo = motivo;
  }
}

/**
 * El padre —nunca el niño— declara que estos días no cuentan.
 *
 * Dos vías, mismo mecanismo y mismo tope: prospectiva (el viaje que empieza
 * mañana) y retroactiva (la racha ya se rompió y no hubo señal para avisar).
 *
 * Lo que NO hace, y es deliberado: no pide una razón escrita. Quien la declara
 * es un adulto, así que la línea roja #3 no aplica — pero un `TEXT` libre es un
 * campo más que guardar, explicar y borrar. Las categorías de #204 («viaje»,
 * «enfermedad», «otro») no se implementan aquí porque `child_streak` no tiene
 * columna para ellas y este trabajo no toca migraciones.
 *
 * @param hoy el día local del hogar, calculado por quien llama con `diaEfectivo`
 */
export function declararPausa(
  estado: EstadoRacha,
  desde: DiaLocal,
  hasta: DiaLocal,
  hoy: DiaLocal,
): EstadoRacha {
  comoUTC(desde);
  comoUTC(hasta);
  comoUTC(hoy);

  if (diasEntre(desde, hasta) < 0) {
    throw new PausaRechazada(
      "rango_invertido",
      `La pausa termina antes de empezar: ${desde} → ${hasta}.`,
    );
  }

  const dias = diasEntre(desde, hasta) + 1;
  if (dias > DIAS_MAXIMOS_DE_PAUSA) {
    throw new PausaRechazada(
      "pausa_demasiado_larga",
      `Una pausa puede durar hasta ${DIAS_MAXIMOS_DE_PAUSA} días y ésta dura ${dias} ` +
        `(${desde} → ${hasta}). Se puede declarar otra después.`,
    );
  }

  // El contador es por año calendario del hogar, y se reinicia solo.
  const anio = anioDe(hoy);
  const usadas = estado.pause_year === anio ? estado.pause_uses_this_year : 0;
  if (usadas >= PAUSAS_POR_ANIO) {
    throw new PausaRechazada(
      "tope_anual",
      `Ya se declararon las ${PAUSAS_POR_ANIO} pausas de ${anio}. El contador vuelve a ` +
        `cero el 1 de enero, y la racha no se pierde por esto: sigue contando como siempre.`,
    );
  }

  // Retroactiva: solo dentro de la ventana desde el último día cumplido.
  if (diasEntre(desde, hoy) > 0) {
    const ultimo = estado.last_completed_local_date;
    if (ultimo === null) {
      throw new PausaRechazada(
        "sin_dia_que_reparar",
        "No hay ningún día cumplido todavía, así que no hay nada que reparar hacia atrás.",
      );
    }
    const transcurridos = diasEntre(ultimo, hoy);
    if (transcurridos > VENTANA_DE_REPARACION) {
      throw new PausaRechazada(
        "fuera_de_la_ventana",
        `Una racha se puede reparar hasta ${VENTANA_DE_REPARACION} días después del último ` +
          `día cumplido (${ultimo}), y hoy es ${hoy}: han pasado ${transcurridos}. ` +
          `La racha nueva ya empezó y cuenta desde el primer día que se practique.`,
      );
    }
  }

  // Si ya había una pausa vigente que llega más lejos, se respeta la más larga.
  const vigente = estado.pause_until_local_date;
  const fin = vigente !== null && diasEntre(hasta, vigente) > 0 ? vigente : hasta;

  return {
    ...estado,
    pause_until_local_date: fin,
    pause_uses_this_year: usadas + 1,
    pause_year: anio,
  };
}
