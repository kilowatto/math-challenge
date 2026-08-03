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
 *     zona IANA; no la adivina, no la lee del dispositivo del niño.
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

/** Un día local del hogar, `YYYY-MM-DD`. Nunca un instante, nunca UTC crudo. */
export type DiaLocal = string;

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
  readonly pause_until_local_date: DiaLocal | null;
  readonly pause_uses_this_year: number;
  readonly pause_year: number | null;
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
  pause_until_local_date: null,
  pause_uses_this_year: 0,
  pause_year: null,
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

/** ¿Es `zona` una zona IANA que este runtime entiende? */
export function zonaValida(zona: string): boolean {
  try {
    // El locale lleva región (`en-US`) aunque aquí sea irrelevante: lo único
    // que se prueba es si el runtime conoce la zona. `audits/notacion-locale.mjs`
    // bloquea todo `Intl` con idioma sin región, y tiene razón en general —
    // `es-MX` y `es-ES` no comparten separador decimal (mc-34 §1). Escribirlo
    // completo cuesta tres caracteres y evita la excepción que mañana alguien
    // copia a un sitio donde sí importa.
    new Intl.DateTimeFormat("en-US", { timeZone: zona });
    return true;
  } catch {
    return false;
  }
}

/**
 * El día local del hogar para un instante dado.
 *
 * @param instanteUTC milisegundos desde la época — lo mide quien llama, no esto
 * @param zonaIana    `users.timezone` del padre dueño del perfil, p.ej. `America/Mexico_City`
 *
 * Se arma con `formatToParts` y no con `toLocaleDateString("en-CA")`. El truco
 * de `en-CA` da `YYYY-MM-DD` en la mayoría de los ICU pero no es una garantía
 * del estándar: depende de los datos de locale del runtime, y este código corre
 * en un Worker cuyo ICU no elegimos nosotros. `formatToParts` pide año, mes y
 * día por nombre, y el orden lo decidimos aquí.
 */
export function diaEfectivo(instanteUTC: number, zonaIana: string): DiaLocal {
  if (!Number.isFinite(instanteUTC)) {
    throw new RangeError(`instante no finito: ${instanteUTC}`);
  }
  if (!zonaValida(zonaIana)) {
    throw new RangeError(
      `zona horaria desconocida: "${zonaIana}". Quien llama decide el respaldo ` +
        `(el último users.timezone conocido, o ZONA_DE_RESPALDO); este módulo no lo adivina.`,
    );
  }
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: zonaIana,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(instanteUTC));

  const de = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
  const anio = de("year").padStart(4, "0");
  const mes = de("month").padStart(2, "0");
  const dia = de("day").padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

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
  };
}

// ─── Escudos (#203) ──────────────────────────────────────────────────────────

/**
 * Los escudos que la racha ya se ganó.
 *
 * Función pura de `current_streak` y `shields_available`, y **de nada más**. No
 * hay parámetro de pago, de cupón, de SKU ni de transacción, y no puede
 * haberlo: `audits/racha-nunca-se-vende.mjs` bloquea el commit que agregue uno.
 * D-014 lo dice por nombre («nunca se vende protección de racha») y `mc-16`
 * documenta que ese es exactamente el punto donde Duolingo cruza la línea —
 * sus vías de obtención del freeze se mezclan con gemas comprables.
 *
 * La fórmula es la de #203: `min(2, floor(current_streak / 7))`.
 *
 * **La consecuencia que hay que decir en voz alta:** el banco se REPONE al
 * crecer la racha. Un niño que gasta un escudo con racha 15 vuelve a tener 2
 * cuando llegue a 21, porque `floor(21/7) = 3`, capado a 2. Es decir: pasado el
 * día 14, saltarse un día de cada siete no cuesta prácticamente nada. La
 * alternativa —contar los escudos ganados DENTRO de la racha actual— necesita
 * una columna que `child_streak` no tiene, y agregarla es una migración, que
 * este trabajo no toca. Queda como decisión pendiente del dueño.
 *
 * Nunca quita un escudo: si el banco tiene más de lo que la fórmula da, se
 * queda como está. Un escudo que aparece y desaparece solo es peor que no
 * tenerlo.
 */
export function ganarEscudos(estado: EstadoRacha): EstadoRacha {
  const merecidos = Math.floor(estado.current_streak / DIAS_POR_ESCUDO);
  const objetivo = Math.min(TOPE_ESCUDOS, merecidos);
  if (objetivo <= estado.shields_available) return estado;

  const nuevos = objetivo - estado.shields_available;
  return {
    ...estado,
    shields_available: objetivo,
    shields_earned_total: estado.shields_earned_total + nuevos,
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
