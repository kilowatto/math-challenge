/**
 * El decisor del recordatorio por Web Push al PADRE (F7 #207, D-105).
 *
 * Módulo PURO, con el mismo contrato que `racha.ts` y `misiones.ts`: entra el
 * estado del hogar ya medido, sale una decisión, y no toca la red, ni el
 * reloj, ni la base. El día y la hora llegan por las dos únicas puertas que
 * existen entre un instante y el calendario del hogar —`racha.ts::diaEfectivo`
 * y `limite-pantalla.ts::horaLocal`— para que «hoy» y «qué hora es» signifiquen
 * aquí exactamente lo mismo que en la racha y en el límite de pantalla.
 *
 * ─── Las reglas, y de dónde sale cada una ──────────────────────────────────
 *
 *  1. **El destinatario es el PADRE, nunca el niño** (issue #207, mc-19 rec.
 *     #3). Este módulo no recibe ni un identificador de niño: recibe CONTEOS
 *     ya agregados por la capa de datos (`apps/web/src/lib/push-hogares.ts`).
 *     Que no haya un `childProfileId` en la firma no es cortesía, es el
 *     criterio de aceptación #1 — y `audits/recordatorio-sin-culpa.mjs` lo
 *     verifica de forma estática, sin importar este módulo (D-070: el auditor
 *     no juzga con la misma función que el código usa para decidir).
 *
 *  2. **UN push al día por HOGAR** (mc-19 rec. #4). La constante de abajo es
 *     eso: una constante, no un valor configurable por experimento — el
 *     criterio de aceptación #2 la exige por nombre.
 *
 *  3. **Solo si NADIE completó la meta hoy** (mc-19 pregunta abierta #2,
 *     resuelta en el issue: «solo empujar en un día perdido, nunca en un día
 *     ya completado»). Un solo aprendiz con la meta cumplida silencia el
 *     recordatorio del hogar entero ese día.
 *
 *  4. **Horas de silencio: nunca antes de las 07:00 ni después de las 20:00,
 *     hora local del hogar** (mc-19 rec. #13). La zona sale de
 *     `users.timezone`, jamás del dispositivo — igual que el límite de
 *     pantalla: un horario que se cambia moviendo el huso del teléfono no es
 *     un horario.
 *
 *  5. **Cerca de la ventana de pantalla aprobada por el padre** (mc-19 rec.
 *     #14, D-016). El recordatorio no suena antes de la hora en que la familia
 *     dijo que se juega. Hoy `screen_time_settings` no tiene columna de
 *     inicio de ventana —solo `bedtime_local`, que es el FINAL del día—, así
 *     que quien llama pasa `ventanaInicio: null` y se usa
 *     `HORA_RECORDATORIO_POR_DEFECTO`. Cuando esa columna exista, el decisor
 *     ya la acepta sin cambio de firma.
 *
 *  6. **El silencio es permanente** (D-026, issue #207). `silenciado: true`
 *     decide NO ENVIAR antes que cualquier otra regla y no tiene vuelta:
 *     ninguna ruta reactiva el recordatorio sin acción explícita del padre, y
 *     ni siquiera hay superficie que la ofrezca — re-preguntar lo descartado
 *     es nagging (mc-17, FTC 2022).
 *
 *  7. **Un push AGREGADO, no uno por hijo** (issue #207). Si tres hijos no
 *     completaron, la decisión es UN envío con `pendientes: 3`; la plantilla
 *     plural la elige quien compone el copy
 *     (`apps/web/src/pages/api/push-mensaje.ts`), no este módulo.
 *
 * ─── El adulto aprendiz (SERIO/JR/PRO) ─────────────────────────────────────
 *
 * Para la banda de adulto el recordatorio va al propio adulto — es su cuenta
 * y su práctica. La prohibición no es «nunca al niño» en sentido literal de
 * destinatario, es «nunca con culpa», y aplica igual (issue #207 § banda
 * adulta). Por eso este módulo habla de APRENDICES y no de hijos: el adulto
 * que aprende cuenta como un aprendiz más del hogar, con el mismo tope de
 * 1/día por cuenta.
 *
 * ─── Lo que este módulo NO sabe ────────────────────────────────────────────
 *
 * No sabe qué es una misión, ni qué es KINDER, ni que existe Web Push. Recibe
 * «cuántos aprendices del hogar no completaron hoy» y «cuántos sí», y decide.
 * La definición de «meta completada» —`mission_daily_summary.completed = 1`—
 * vive en la capa de datos; si mañana KINDER escribe su reto HISTORIA en otra
 * tabla (hoy no escribe fila, D-104), el cambio es de esa capa y la firma de
 * aquí no se mueve.
 */

import { diaEfectivo, type DiaLocal } from "./racha.ts";
import { horaLocal, minutosDelDia, type HoraLocal } from "./limite-pantalla.ts";

/**
 * El tope: UN push al día por hogar (mc-19 rec. #4, issue #207 criterio #2).
 *
 * Es una constante y no una variable de entorno ni un flag de experimento a
 * propósito: el criterio de aceptación lo exige así, y el auditor
 * `recordatorio-sin-culpa.mjs` la verifica POR NOMBRE. Un tope configurable es
 * un tope que alguien sube a 3 «para la prueba A/B», y la curva de fatiga de
 * notificaciones termina en el desinstalar, no en el opt-out amable (mc-19
 * §1.5).
 */
export const UN_PUSH_POR_HOGAR_POR_DIA = 1;

/** Nunca antes de las 07:00, hora local del hogar (mc-19 rec. #13). */
export const HORA_MAS_TEMPRANA: HoraLocal = "07:00";

/** Nunca después de las 20:00, hora local del hogar (mc-19 rec. #13). */
export const HORA_MAS_TARDE: HoraLocal = "20:00";

/**
 * La hora neutra cuando el padre no configuró ventana: 17:00 local (issue
 * #207: «si no hay ventana configurada, se usa un horario neutro fijo»).
 * Tarde después de la escuela, dentro de las horas de silencio en cualquier
 * huso.
 */
export const HORA_RECORDATORIO_POR_DEFECTO: HoraLocal = "17:00";

/** Lo que la capa de datos ya midió del hogar. Sin identificadores de nadie. */
export interface EstadoDelHogar {
  /** El instante, en ms UTC. El módulo lo convierte a día y hora LOCALES. */
  ahoraUtc: number;
  /** `users.timezone` del adulto. Nunca la del dispositivo. */
  zonaIana: string;
  /**
   * Inicio de la ventana de pantalla aprobada por el padre, o `null` si no hay
   * — hoy siempre `null`, porque `screen_time_settings` no tiene esa columna
   * (ver el encabezado, regla 5).
   */
  ventanaInicio: HoraLocal | null;
  /** Cuántos aprendices del hogar NO completaron su meta hoy (día efectivo). */
  aprendicesPendientes: number;
  /** Cuántos aprendices del hogar SÍ completaron su meta hoy. */
  aprendicesCompletados: number;
  /** Cuántos recordatorios se enviaron ya hoy a este hogar (0 o 1). */
  enviadosHoy: number;
  /** El padre lo apagó. Permanente (D-026). */
  silenciado: boolean;
}

export type MotivoDelRecordatorio =
  | "enviar"
  | "silenciado"
  | "tope_diario"
  | "meta_completada"
  | "sin_pendientes"
  | "fuera_de_horario"
  | "antes_de_la_ventana";

export interface DecisionDelRecordatorio {
  enviar: boolean;
  motivo: MotivoDelRecordatorio;
  /** Cuántos aprendices sin completar — para elegir plantilla singular/plural. */
  pendientes: number;
  /** El día local en que se decidió. Es lo que se persiste contra el tope. */
  diaLocal: DiaLocal;
  /** La hora local en que se decidió. Para bitácora y para el copy. */
  hora: HoraLocal;
}

/**
 * ¿Se envía el recordatorio a este hogar, ahora?
 *
 * El orden de las reglas es el orden en que importan: el silencio del padre y
 * el tope ya alcanzado se miran ANTES que la hora, porque son los dos
 * contratos con la persona — «me apagaste, no suenes» y «ya sonaste hoy» — y
 * ningún horario los desempata.
 */
export function decidirRecordatorio(estado: EstadoDelHogar): DecisionDelRecordatorio {
  const diaLocal = diaEfectivo(estado.ahoraUtc, estado.zonaIana);
  const hora = horaLocal(estado.ahoraUtc, estado.zonaIana);
  const minutos = minutosDelDia(hora);

  const decide = (enviar: boolean, motivo: MotivoDelRecordatorio): DecisionDelRecordatorio => ({
    enviar,
    motivo,
    pendientes: estado.aprendicesPendientes,
    diaLocal,
    hora,
  });

  // D-026: el silencio permanente manda sobre todo lo demás. Siempre.
  if (estado.silenciado) return decide(false, "silenciado");

  // mc-19 rec. #4: ya sonó hoy, no suena dos veces. El tope es POR HOGAR.
  if (estado.enviadosHoy >= UN_PUSH_POR_HOGAR_POR_DIA) return decide(false, "tope_diario");

  // mc-19 pregunta abierta #2, resuelta en #207: un solo aprendiz con la meta
  // cumplida silencia el día entero. Empujar en un día ya completado es el
  // caso que el dueño resolvió por nombre: «nunca en un día ya completado».
  if (estado.aprendicesCompletados > 0) return decide(false, "meta_completada");

  // Nadie a quien recordar: hogar sin aprendices, o todos completados (este
  // último caso ya salió arriba; queda el primero y el defensivo).
  if (estado.aprendicesPendientes <= 0) return decide(false, "sin_pendientes");

  // mc-19 rec. #13: horas de silencio, en la zona del hogar. El rango es
  // cerrado: «nunca ANTES de las 07:00 ni DESPUÉS de las 20:00» deja las dos
  // orillas dentro.
  if (minutos < minutosDelDia(HORA_MAS_TEMPRANA) || minutos > minutosDelDia(HORA_MAS_TARDE)) {
    return decide(false, "fuera_de_horario");
  }

  // mc-19 rec. #14: cerca del inicio de la ventana que el propio padre
  // aprobó, nunca antes. El cron corre cada media hora, así que «cerca» es la
  // primera pasada del ciclo a partir de la hora de la ventana — y el tope de
  // 1/día es lo que hace que la segunda pasada del mismo día no reenvíe.
  const inicio = estado.ventanaInicio ?? HORA_RECORDATORIO_POR_DEFECTO;
  if (minutos < minutosDelDia(inicio)) return decide(false, "antes_de_la_ventana");

  return decide(true, "enviar");
}
