/**
 * El cable entre los motores de F7 y una persona de verdad.
 *
 * `packages/motor/src/racha.ts` y `packages/motor/src/xp.ts` estaban escritos,
 * probados, auditados por cuatro guardianes… **y no los llamaba nadie**. Las
 * tablas `child_streak` y `xp_totals` estaban en `migrations/0007` y `0008` sin
 * aplicar. Un jugador podía contestar mil ítems y su racha seguía sin existir.
 *
 * Este módulo es lo único que faltaba: leer el estado, pasarlo por el motor,
 * escribir el estado nuevo. **No contiene ni una fórmula** — misma regla que
 * `pages/api/jugar.ts` se impone a sí mismo, y por la misma razón: una segunda
 * copia de la aritmética es cómo la pantalla y el motor acaban discrepando sin
 * que nadie cambie nada a propósito.
 *
 * ─── La línea roja #6, y por qué aquí se cumple por construcción ──────────
 *
 * D-014, textual: «si el límite de pantalla corta la sesión, **la racha del día
 * se da por cumplida**». La forma barata de cumplirlo sería una rama —«si el
 * corte fue del límite, registra igual»— y una rama es justo lo que se puede
 * escribir mal.
 *
 * Aquí no hace falta ninguna rama, porque **el día se registra en el PRIMER
 * ítem contestado, no al cerrar el reto**. Cuando el límite de pantalla corta
 * una sesión, el día ya está cumplido desde hace minutos: el camino que podría
 * romper la racha no existe. `motivo` viaja como parámetro para que F8
 * (`docs/planes/f8-limite-pantalla.md` §8, que es quien produce el segundo
 * motivo) no tenga que tocar esta función — y `registrarDia` ya garantiza que
 * los dos motivos producen el mismo estado, medido por
 * `audits/racha-limite-no-rompe.mjs` sobre 1 620 estados.
 *
 * ─── La zona horaria sale del hogar, JAMÁS del aparato del niño ───────────
 *
 * `users.timezone` — la misma columna que D-016 usa para el corte nocturno, y
 * la que `racha.ts` nombra en su encabezado. Para un perfil de niño se resuelve
 * subiendo a `child_profiles.parent_user_id`: el niño no es un usuario (línea
 * roja #2) y no tiene zona propia. Nada de este archivo lee un reloj del
 * navegador ni acepta uno del cuerpo de la petición.
 *
 * ─── Dos ejes, dos tablas, cero conversiones (#225, D-055) ────────────────
 *
 * La racha y el XP se escriben en la misma función y **no se tocan**: ninguna
 * consulta los suma, ninguna deriva uno del otro, y ni siquiera comparten fila.
 * Los puntos del tablero (`score_totals`, D-025) no se mencionan aquí una sola
 * vez.
 *
 * ─── Lo que este módulo NO hace ───────────────────────────────────────────
 *
 *  · **No escribe un intento en D1.** Escribe dos agregados por jugador, una
 *    fila cada uno (`mc-32` riesgo #1). Los intentos crudos siguen yendo a
 *    Analytics Engine desde el Worker de ingesta.
 *  · **No otorga el bono de finalización de reto** (`XP_POR_TIPO.reto_completado`).
 *    Hoy nadie observa el final de un reto: «Ya terminé» es un `<a href>` que
 *    navega. Queda dicho en el PR como alcance diferido, no escondido aquí.
 *  · **No decide qué se enseña.** Devuelve números; qué pantalla los pinta lo
 *    deciden D-060, el criterio #100 y #206, en la pantalla.
 */
import {
  DIAS_MAXIMOS_DE_PAUSA,
  ESTADO_INICIAL,
  ZONA_DE_RESPALDO,
  declararPausa,
  diaEfectivo,
  diasEntre,
  ganarEscudos,
  PausaRechazada,
  registrarDia,
  zonaValida,
  SQL_UPSERT_RACHA,
  type DiaLocal,
  type EstadoRacha,
  type MotivoDelDia,
} from "../../../../packages/motor/src/racha.ts";
import {
  SQL_UPSERT_XP,
  rangoDeXp,
  xpDeItem,
} from "../../../../packages/motor/src/xp.ts";
import {
  diaCumplidoPorCorte,
  type MotivoDeCierre,
} from "../../../../packages/motor/src/limite-pantalla.ts";
import { formatear } from "../../../../packages/motor/src/numeros.ts";
import type { Locale } from "../i18n";

/**
 * Quién juega.
 *
 * `child_streak` y `xp_totals` son polimórficas a propósito (0007): un perfil de
 * niño **o** una cuenta de adulto aprendiz (D-034), nunca las dos ni ninguna, y
 * la base lo obliga con un `CHECK`. `/api/jugar` ya distingue los dos casos para
 * elegir el Durable Object del modelo; aquí se reusa la misma distinción en vez
 * de inventar otra.
 */
export interface Jugador {
  readonly id: string;
  readonly esAdulto: boolean;
}

/** Lo que la pantalla recibe. Números crudos: el texto lo compone quien pinta. */
export interface Progreso {
  readonly racha: {
    readonly actual: number;
    /** `max_streak`. Viaja SIEMPRE con el actual (#206, mc-17 §83). */
    readonly mejor: number;
    /**
     * `days_played_total`: los días jugados de por vida (#205).
     *
     * Es el único número de racha que una superficie de KINDER puede conocer,
     * y aun así no se pinta como cifra: es la posición del sendero de Larry,
     * un paso por día jugado. A diferencia de `actual`, NUNCA baja — ni con un
     * escudo de por medio, ni con la racha reiniciada (`mc-43` §6).
     */
    readonly diasJugadosTotal: number;
  };
  readonly xp: {
    readonly total: number;
    /** Derivado de `total`, nunca guardado (#194). */
    readonly rango: number;
    /** Lo que sumó ESTE ítem. Nunca negativo (D-055). */
    readonly ganado: number;
  };
}

interface Env {
  DB?: D1Database;
}

interface FilaRacha {
  current_streak: number;
  max_streak: number;
  last_completed_local_date: string | null;
  shields_available: number;
  shields_earned_total: number;
  shields_earned_this_streak: number;
  pause_until_local_date: string | null;
  pause_uses_this_year: number;
  pause_year: number | null;
  days_played_total: number;
}

const SQL_LEER_RACHA_NINO = `
SELECT current_streak, max_streak, last_completed_local_date,
       shields_available, shields_earned_total, shields_earned_this_streak,
       pause_until_local_date, pause_uses_this_year, pause_year,
       days_played_total
FROM child_streak WHERE child_profile_id = ?
`.trim();

const SQL_LEER_RACHA_ADULTO = `
SELECT current_streak, max_streak, last_completed_local_date,
       shields_available, shields_earned_total, shields_earned_this_streak,
       pause_until_local_date, pause_uses_this_year, pause_year,
       days_played_total
FROM child_streak WHERE user_id = ?
`.trim();

/**
 * Los mismos dos upserts de los motores, con la otra llave.
 *
 * `child_streak` y `xp_totals` son polimórficas (0007) y los motores escriben la
 * columna del NIÑO: nombran `child_profile_id` en la lista de columnas y en el
 * `ON CONFLICT`, que es el índice único parcial de esa migración. Un adulto
 * aprendiz (D-034) escribe la misma tabla por `user_id`, así que necesita la
 * otra columna **y** el otro conflicto.
 *
 * Se derivan con un `replaceAll` sobre el SQL del motor en vez de copiarse a
 * mano, y no es economía de teclas: el día que la 0011 le añada una columna a
 * `child_streak`, la variante del adulto la gana sola. Una copia a mano es cómo
 * la fila del adulto se queda sin la columna que la del niño sí tiene.
 *
 * ─── Por qué esto no era obvio, y cómo se descubrió ────────────────────────
 *
 * `SQL_UPSERT_RACHA` **no tiene columna `user_id` en absoluto** — se escribió
 * para el caso del niño. La primera versión de este archivo reemplazaba solo el
 * `ON CONFLICT` y ataba un valor de más contra los huecos de entonces.
 * No lo vio ningún auditor, ningún tipo y ninguna prueba: `registrarItem` atrapa
 * su propia excepción a propósito, así que el síntoma era `progreso: null` en la
 * respuesta y una tabla vacía. Se encontró jugando de verdad contra un D1 local
 * y contando las filas, que es la única forma en que se podía encontrar.
 */
const paraAdulto = (sql: string) => sql.replaceAll("child_profile_id", "user_id");

const SQL_UPSERT_RACHA_ADULTO = paraAdulto(SQL_UPSERT_RACHA);
const SQL_UPSERT_XP_ADULTO = paraAdulto(SQL_UPSERT_XP);

const SQL_LEER_XP_NINO = "SELECT total_xp FROM xp_totals WHERE child_profile_id = ?";
const SQL_LEER_XP_ADULTO = "SELECT total_xp FROM xp_totals WHERE user_id = ?";

/**
 * La zona IANA del hogar, de `users.timezone`.
 *
 * Nunca del aparato: `Intl.DateTimeFormat().resolvedOptions().timeZone` en el
 * navegador de un niño convierte un viaje en una racha rota, y peor, convierte
 * cambiar la hora del teléfono en una forma de fabricar días. Si la columna está
 * vacía —se llena de `request.cf.timezone` al registrarse, y puede faltar— se
 * usa `ZONA_DE_RESPALDO`, que es lo que `racha.ts` pide explícitamente que
 * decida quien llama.
 */
export async function zonaDelHogar(env: Env, quien: Jugador): Promise<string> {
  if (!env.DB) return ZONA_DE_RESPALDO;
  try {
    const fila = quien.esAdulto
      ? await env.DB.prepare("SELECT timezone FROM users WHERE id = ?")
          .bind(quien.id)
          .first<{ timezone: string | null }>()
      : await env.DB.prepare(
          "SELECT u.timezone AS timezone FROM child_profiles c " +
            "JOIN users u ON u.id = c.parent_user_id WHERE c.id = ?",
        )
          .bind(quien.id)
          .first<{ timezone: string | null }>();
    const zona = fila?.timezone;
    return typeof zona === "string" && zonaValida(zona) ? zona : ZONA_DE_RESPALDO;
  } catch {
    return ZONA_DE_RESPALDO;
  }
}

function estadoDeFila(fila: FilaRacha | null): EstadoRacha {
  if (!fila) return ESTADO_INICIAL;
  return {
    current_streak: fila.current_streak,
    max_streak: fila.max_streak,
    last_completed_local_date: fila.last_completed_local_date,
    shields_available: fila.shields_available,
    shields_earned_total: fila.shields_earned_total,
    shields_earned_this_streak: fila.shields_earned_this_streak,
    pause_until_local_date: fila.pause_until_local_date,
    pause_uses_this_year: fila.pause_uses_this_year,
    pause_year: fila.pause_year,
    days_played_total: fila.days_played_total,
  };
}

/** El progreso que hay hoy, sin tocar nada. Lo usa la pantalla al cargar. */
export async function leerProgreso(env: Env, quien: Jugador): Promise<Progreso | null> {
  if (!env.DB) return null;
  try {
    const [racha, xp] = await Promise.all([
      env.DB.prepare(quien.esAdulto ? SQL_LEER_RACHA_ADULTO : SQL_LEER_RACHA_NINO)
        .bind(quien.id)
        .first<FilaRacha>(),
      env.DB.prepare(quien.esAdulto ? SQL_LEER_XP_ADULTO : SQL_LEER_XP_NINO)
        .bind(quien.id)
        .first<{ total_xp: number }>(),
    ]);
    const estado = estadoDeFila(racha ?? null);
    const total = xp?.total_xp ?? 0;
    return {
      racha: {
        actual: estado.current_streak,
        mejor: estado.max_streak,
        diasJugadosTotal: estado.days_played_total,
      },
      xp: { total, rango: rangoDeXp(total), ganado: 0 },
    };
  } catch {
    return null;
  }
}

/**
 * Un ítem contestado: el día cuenta, y el XP sube.
 *
 * @param nivel  el nivel del ítem, tal como lo devolvió la calificación del banco
 * @param acc    1 o 0. Nunca un parcial (D-010, D-048)
 * @param motivo por qué cuenta el día. **No cambia el resultado** — ver el
 *   encabezado de este archivo y la nota 1 de `racha.ts`
 * @param ahora  el instante, medido por quien llama. Este módulo no lee relojes
 *   para poder probarse sin viajar en el tiempo
 *
 * Devuelve `null` si no hay base de datos o si algo falló: **nunca se le niega
 * el juego a un niño por un fallo de infraestructura**, y una racha que no se
 * pudo escribir no puede convertirse en una pantalla rota.
 *
 * ─── Idempotencia, en los dos ejes y por vías distintas ────────────────────
 *
 *  · La racha la trae `registrarDia`, que devuelve **el mismo objeto** cuando el
 *    día ya estaba registrado. Se compara por referencia y no se escribe nada:
 *    diez ítems en la misma tarde son una escritura, no diez.
 *  · El XP no puede ser idempotente por sí solo —sumar dos veces el mismo ítem
 *    da el doble— y quien lo evita es el llamador: `/api/jugar` no llama a esta
 *    función en un reintento del mismo ítem (línea roja #8, #348). Un reenvío de
 *    la MISMA petición HTTP sí contaría dos veces; queda dicho en el PR como
 *    residuo conocido, y su arreglo es la sesión de reto de F3 que todavía no se
 *    abre aquí.
 */
export async function registrarItem(
  env: Env,
  quien: Jugador,
  entrada: {
    nivel: number;
    acc: 0 | 1;
    motivo: MotivoDelDia;
    ahora: number;
    zona: string;
  },
): Promise<Progreso | null> {
  if (!env.DB) return null;

  try {
    const hoy = diaEfectivo(entrada.ahora, entrada.zona);

    const [filaRacha, filaXp] = await Promise.all([
      env.DB.prepare(quien.esAdulto ? SQL_LEER_RACHA_ADULTO : SQL_LEER_RACHA_NINO)
        .bind(quien.id)
        .first<FilaRacha>(),
      env.DB.prepare(quien.esAdulto ? SQL_LEER_XP_ADULTO : SQL_LEER_XP_NINO)
        .bind(quien.id)
        .first<{ total_xp: number }>(),
    ]);

    const antes = estadoDeFila(filaRacha ?? null);
    const conDia = registrarDia(antes, hoy, entrada.motivo);
    // `registrarDia` devuelve el MISMO objeto si el día ya estaba contado. Con
    // el día ya contado tampoco hay escudos nuevos que ganar, así que la
    // comparación por referencia decide las dos cosas.
    const despues = conDia === antes ? antes : ganarEscudos(conDia);

    /*
     * El XP en su propio `try`, y el día por fuera.
     *
     * `xpDeItem` lanza si el nivel se sale de la escalera de D-017 — un ítem del
     * banco mal formado, que es un fallo de contenido y no de este jugador. Sin
     * este anidado, ese ítem se llevaría por delante también el registro del
     * día, y perder una racha por un ítem defectuoso es exactamente la clase de
     * castigo que D-014 no admite. El día se cuenta igual; ese ítem vale 0 XP.
     */
    let ganado = 0;
    try {
      ganado = xpDeItem(entrada.nivel, entrada.acc);
    } catch {
      ganado = 0;
    }
    const escrituras: D1PreparedStatement[] = [];

    if (despues !== antes) {
      escrituras.push(
        env.DB.prepare(quien.esAdulto ? SQL_UPSERT_RACHA_ADULTO : SQL_UPSERT_RACHA).bind(
          // Trece valores para trece columnas. La segunda es la llave del dueño —
          // `child_profile_id` o `user_id` según el SQL elegido arriba—, y la
          // otra ni siquiera aparece en la sentencia: se queda NULL sola, que es
          // lo que el `CHECK` de exactamente-un-dueño exige.
          crypto.randomUUID(),
          quien.id,
          despues.current_streak,
          despues.max_streak,
          despues.last_completed_local_date,
          despues.shields_available,
          despues.shields_earned_total,
          despues.shields_earned_this_streak,
          despues.pause_until_local_date,
          despues.pause_uses_this_year,
          despues.pause_year,
          despues.days_played_total,
          entrada.ahora,
        ),
      );
    }
    if (ganado > 0) {
      escrituras.push(
        env.DB.prepare(quien.esAdulto ? SQL_UPSERT_XP_ADULTO : SQL_UPSERT_XP).bind(
          quien.id,
          ganado,
          entrada.ahora,
        ),
      );
    }
    if (escrituras.length > 0) await env.DB.batch(escrituras);

    const total = (filaXp?.total_xp ?? 0) + ganado;
    return {
      racha: {
        actual: despues.current_streak,
        mejor: despues.max_streak,
        diasJugadosTotal: despues.days_played_total,
      },
      xp: { total, rango: rangoDeXp(total), ganado },
    };
  } catch {
    // Silencio deliberado, misma regla que la telemetría de `/api/jugar`: lo que
    // se pierde si esto falla es un contador, no el juego.
    return null;
  }
}

/**
 * El límite de pantalla cortó la sesión: el motivo del corte llega a la racha
 * (F8 #404, la frontera que D-091 dejó preparada).
 *
 * `registrarItem` se llama con `RETO_COMPLETADO` en cada ítem que cuenta, y el
 * corte se decide DESPUÉS (D-091: el día se cuenta en el primer ítem, así que
 * para cuando el límite corta, el día lleva minutos cumplido). Esta función es
 * el segundo extremo de ese diseño: cuando la decisión es `CERRAR`, la ruta la
 * llama con el motivo de cierre y aquí se convierte con `diaCumplidoPorCorte()`
 * —la única función que produce `LIMITE_DE_PANTALLA_CORTO_LA_SESION`— y entra
 * en `registrarDia` de verdad. Es la omisión que `audits/limite-no-rompe-el-dia.mjs`
 * declara como su punto ciego, hecha imposible por el cable y no por la
 * vigilancia: el camino del corte NOMBRA el motivo.
 *
 * En la práctica es casi siempre un no-op, y eso es el diseño funcionando: el
 * día ya se contó en el ítem de hace un instante, `registrarDia` devuelve el
 * mismo objeto y no se escribe nada. La llamada existe para que el motivo
 * fluya (el KPI de #202: sesiones cortadas donde la racha no avanzó = 0) y
 * para que ningún camino futuro del corte pueda olvidarse de registrar.
 *
 * **No suma XP.** El ítem que se acabó de contestar ya lo sumó `registrarItem`
 * en esta misma petición; esto no es un ítem nuevo, es el cierre del día.
 *
 * Nunca lanza, como `registrarItem`: lo que se pierde si falla es un contador,
 * no el juego — y el corte ya viaja en la respuesta de todas formas.
 */
export async function registrarDiaPorLimite(
  env: Env,
  quien: Jugador,
  entrada: {
    motivo: MotivoDeCierre;
    ahora: number;
    zona: string;
  },
): Promise<void> {
  if (!env.DB) return;

  try {
    const hoy = diaEfectivo(entrada.ahora, entrada.zona);

    const fila = await env.DB.prepare(quien.esAdulto ? SQL_LEER_RACHA_ADULTO : SQL_LEER_RACHA_NINO)
      .bind(quien.id)
      .first<FilaRacha>();

    const antes = estadoDeFila(fila ?? null);
    const conDia = registrarDia(antes, hoy, diaCumplidoPorCorte(entrada.motivo));
    // Misma comparación por referencia que `registrarItem`: el día ya contado
    // no se vuelve a escribir, y con el día nuevo tampoco hay escudos que
    // ganar dos veces.
    const despues = conDia === antes ? antes : ganarEscudos(conDia);
    if (despues === antes) return;

    await env.DB.prepare(quien.esAdulto ? SQL_UPSERT_RACHA_ADULTO : SQL_UPSERT_RACHA).bind(
      // Trece valores para trece columnas, el mismo orden que `registrarItem`.
      crypto.randomUUID(),
      quien.id,
      despues.current_streak,
      despues.max_streak,
      despues.last_completed_local_date,
      despues.shields_available,
      despues.shields_earned_total,
      despues.shields_earned_this_streak,
      despues.pause_until_local_date,
      despues.pause_uses_this_year,
      despues.pause_year,
      despues.days_played_total,
      entrada.ahora,
    ).run();
  } catch {
    // Silencio deliberado, misma regla que arriba.
    return;
  }
}

/**
 * El XP escrito para una persona. Una sola implementación, dos llamadores.
 *
 * La compone el SERVIDOR —la página al cargar y `/api/jugar` en cada respuesta—
 * por la misma razón que la explicación de Larry: el navegador no debe llevar
 * los siete catálogos ni una segunda copia de `formatear()`, que es la única
 * función que sabe que `de-DE` y `fr-FR` no agrupan los millares igual (mc-34).
 *
 * `plantilla` llega ya resuelta por locale desde `i18n/reto/*.json`, así que
 * este módulo no importa ningún catálogo y no puede elegir el idioma
 * equivocado.
 */
export function textoDeXp(plantilla: string, total: number, locale: Locale): string {
  return plantilla.replace("{n}", formatear(total, locale, 0));
}


// ─── Pausa familiar (#204) ───────────────────────────────────────────────────
//
// La superficie de `declararPausa()`: el padre —nunca el niño— declara que unos
// días no cuentan, y el adulto aprendiz (D-034) se la declara a sí mismo. La
// validación entera (21 días, 4 por año, ventana de 5) vive en el motor; aquí
// solo hay lectura, autorización y escritura — el mismo contrato que el resto
// de este archivo, y por eso vive aquí y no en un módulo nuevo: `estadoDeFila`,
// las dos lecturas y los dos upserts de `child_streak` son privados de este
// archivo a propósito, y copiarlos sería el segundo escritor que el encabezado
// de `SQL_UPSERT_RACHA` prohibe.
//
// NO hay categoría («viaje», «enfermedad», «otro»): `child_streak` no tiene
// columna para ella — la migración 0007 la dejó fuera deliberadamente y dice
// que si el dueño la quiere entra como enumeración cerrada en un CHECK— y este
// trabajo no toca migraciones. Pedirla en la pantalla para no guardarla sería
// peor que no pedirla: un dato que se recolecta y se tira es un dato que se
// recolectó.

/** Lo que contesta `declararPausaFamiliar`. El `motivo` es una clave cerrada. */
export type ResultadoPausa =
  | {
      readonly ok: true;
      readonly estado: EstadoRacha;
      /** La pausa pedida ya estaba cubierta por una vigente: no-op, no gasta uso. */
      readonly yaCubierta: boolean;
    }
  | { readonly ok: false; readonly motivo: string; readonly mensaje: string };

const SQL_PERFIL_PROPIO = `
SELECT id, alias FROM child_profiles
WHERE id = ? AND parent_user_id = ? AND deleted_at IS NULL
`.trim();

/**
 * El perfil de niño, solo si cuelga de ESTA cuenta. La autorización entera de
 * la pausa es esta consulta: la línea roja #2 hace al niño una fila dentro de
 * la cuenta del padre, así que «puede declarar la pausa» y «es su padre» son
 * la misma pregunta. Es el patrón que F8 aplica a `screen_time_settings`:
 * nadie toca la racha de un niño que no es suyo.
 *
 * Devuelve el alias porque la pantalla lo pinta y no hay nada más que leer —
 * ni año de nacimiento, ni banda (D-013: lo que no se pinta no se pide).
 */
export async function perfilPropio(
  env: Env,
  hijoId: string,
  userId: string,
): Promise<{ id: string; alias: string } | null> {
  if (!env.DB) return null;
  try {
    return await env.DB.prepare(SQL_PERFIL_PROPIO)
      .bind(hijoId, userId)
      .first<{ id: string; alias: string }>();
  } catch {
    // Fallar cerrado: una base que no responde no es un permiso.
    return null;
  }
}

/**
 * El estado de racha tal como está en la base, sin tocar nada.
 *
 * Lo usa la pantalla de la pausa al cargar (¿hay una vigente? ¿cuántas van
 * este año?). `leerProgreso` no sirve: devuelve solo lo que la pantalla del
 * reto pinta, y las columnas de pausa no son de ese contrato.
 */
export async function leerEstadoRacha(env: Env, quien: Jugador): Promise<EstadoRacha | null> {
  if (!env.DB) return null;
  try {
    const fila = await env.DB.prepare(quien.esAdulto ? SQL_LEER_RACHA_ADULTO : SQL_LEER_RACHA_NINO)
      .bind(quien.id)
      .first<FilaRacha>();
    return estadoDeFila(fila ?? null);
  } catch {
    return null;
  }
}

/**
 * Declara la pausa y la escribe. El único camino por el que
 * `pause_until_local_date`, `pause_uses_this_year` y `pause_year` cambian
 * fuera de `registrarItem`.
 *
 * @param sesionUserId el `userId` de la sesión `mc_s` — el ADULTO. Con
 *   `hijoId` se comprueba que el perfil cuelga de él (`perfilPropio`); sin
 *   `hijoId` la pausa es para su propia racha de aprendiz (D-034), y no hace
 *   falta permiso de nadie más.
 *
 * ─── Idempotencia ──────────────────────────────────────────────────────────
 *
 * `declararPausa()` del motor **siempre** gasta un uso del año, aunque pida lo
 * mismo dos veces — es puro y no sabe lo que ya está escrito. El reenvío de un
 * formulario (doble toque, «atrás» y reenviar, un reintento de red) no puede
 * costar dos de las cuatro pausas del año: si la pausa vigente ya cubre el
 * final pedido, la petición es un eco de algo ya concedido y se responde con
 * el estado actual, sin escribir y sin gastar. El atajo solo aplica a una
 * petición que sería válida (rango bien formado, no invertido, dentro de los
 * 21 días); cualquier otra cosa cae al motor, que es quien rechaza.
 *
 * @param ahora el instante, medido por quien llama. Este módulo no lee relojes.
 */
export async function declararPausaFamiliar(
  env: Env,
  sesionUserId: string,
  entrada: {
    hijoId: string | null;
    desde: DiaLocal;
    hasta: DiaLocal;
    ahora: number;
  },
): Promise<ResultadoPausa> {
  if (!env.DB) return { ok: false, motivo: "sin_bindings", mensaje: "sin base de datos" };

  // ── Autorización, antes de leer nada del niño ────────────────────────────
  let quien: Jugador;
  if (entrada.hijoId !== null) {
    const perfil = await perfilPropio(env, entrada.hijoId, sesionUserId);
    if (!perfil) {
      return {
        ok: false,
        motivo: "sin_permiso",
        mensaje: "ese perfil no cuelga de esta cuenta",
      };
    }
    quien = { id: entrada.hijoId, esAdulto: false };
  } else {
    quien = { id: sesionUserId, esAdulto: true };
  }

  // ── Las fechas, con la forma del motor ───────────────────────────────────
  // `diasEntre` valida la forma YYYY-MM-DD de los dos extremos (viaja por
  // `comoUTC`, que lanza RangeError). El mensaje del motor llega en español;
  // la pantalla compone el suyo por locale, así que aquí basta la clave.
  try {
    diasEntre(entrada.desde, entrada.hasta);
  } catch {
    return { ok: false, motivo: "fecha_invalida", mensaje: "fecha con forma distinta de YYYY-MM-DD" };
  }

  try {
    const zona = await zonaDelHogar(env, quien);
    const hoy = diaEfectivo(entrada.ahora, zona);

    const fila = await env.DB.prepare(quien.esAdulto ? SQL_LEER_RACHA_ADULTO : SQL_LEER_RACHA_NINO)
      .bind(quien.id)
      .first<FilaRacha>();
    const antes = estadoDeFila(fila ?? null);

    // ── El atajo idempotente (ver el encabezado) ───────────────────────────
    const largoPedido = diasEntre(entrada.desde, entrada.hasta) + 1;
    const vigente = antes.pause_until_local_date;
    if (
      vigente !== null &&
      largoPedido >= 1 &&
      largoPedido <= DIAS_MAXIMOS_DE_PAUSA &&
      diasEntre(entrada.hasta, vigente) >= 0
    ) {
      return { ok: true, estado: antes, yaCubierta: true };
    }

    const despues = declararPausa(antes, entrada.desde, entrada.hasta, hoy);

    await env.DB.prepare(quien.esAdulto ? SQL_UPSERT_RACHA_ADULTO : SQL_UPSERT_RACHA).bind(
      // Trece valores para trece columnas, en el orden del SQL del motor — el
      // mismo que `registrarItem` ata arriba, y por la misma razón: dos órdenes
      // distintos para la misma sentencia es un defecto que ninguna prueba de
      // tipos ve.
      crypto.randomUUID(),
      quien.id,
      despues.current_streak,
      despues.max_streak,
      despues.last_completed_local_date,
      despues.shields_available,
      despues.shields_earned_total,
      despues.shields_earned_this_streak,
      despues.pause_until_local_date,
      despues.pause_uses_this_year,
      despues.pause_year,
      despues.days_played_total,
      entrada.ahora,
    ).run();

    return { ok: true, estado: despues, yaCubierta: false };
  } catch (e) {
    if (e instanceof PausaRechazada) {
      return { ok: false, motivo: e.motivo, mensaje: e.message };
    }
    // Una escritura que falló no es una pausa rechazada: se distingue para que
    // la pantalla no le enseñe al padre un motivo que no fue.
    return { ok: false, motivo: "error_interno", mensaje: String((e as Error)?.message ?? e) };
  }
}
