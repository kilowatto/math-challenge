/**
 * El ciclo del recordatorio: qué hogares tocan, a cuáles se empuja (F7 #207).
 *
 * Lo corre el `scheduled()` de `apps/web/src/worker.ts`. Aquí NO se decide
 * nada: la decisión es de `packages/motor/src/recordatorio.ts`, que es puro y
 * tiene sus 18 casos. Este archivo es el cable: lee suscripciones, mide el
 * hogar con `push-hogares.ts`, pregunta al motor y envía con `push-vapid.ts`.
 *
 * ─── La frontera que el auditor vigila ─────────────────────────────────────
 *
 * Este archivo está en el CAMINO DE ENVÍO: resuelve destinatarios y empuja.
 * Por eso no puede aparecer en él la cadena `child_profile_id` ni
 * `childProfileId` — el destinatario es siempre el canal del `user_id` del
 * adulto (issue #207, criterio #1; mc-19 rec. #3). Los datos de niños que la
 * decisión necesita llegan ya agregados desde `push-hogares.ts`, que es la
 * única capa autorizada a leerlos. `audits/recordatorio-sin-culpa.mjs`
 * bloquea el commit que cruce esta frontera.
 *
 * ─── Degradación silenciosa: sin VAPID no hay envío, y no pasa nada ────────
 *
 * Las claves las instala el orquestador (`wrangler secret put
 * VAPID_PRIVATE_KEY`, var `VAPID_PUBLIC_KEY`). Hasta entonces el cron corre,
 * encuentra `vapid === null` y sale sin tocar la base — el estado seguro por
 * defecto, el mismo patrón que `TUTOR_PD_SECRET` en F6: un camino en vivo no
 * se enciende a medias.
 */

import { diaEfectivo, ZONA_DE_RESPALDO } from "../../../../packages/motor/src/racha.ts";
import { decidirRecordatorio } from "../../../../packages/motor/src/recordatorio.ts";
import { conteosDelHogar } from "./push-hogares";
import { enviarTickle, type ClavesVapid } from "./push-vapid";

/** Lo que el cron necesita del entorno. Ni una cosa más. */
export interface EntornoPush {
  DB: D1Database;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  /** `mailto:` de contacto que exige RFC 8292. Configurable, con defecto. */
  VAPID_SUBJECT?: string;
}

const ASUNTO_POR_DEFECTO = "mailto:notificaciones@kilowatto.com";

/** Las claves del entorno, o `null` — y `null` significa «apagado, en paz». */
export function clavesDelEntorno(env: EntornoPush): ClavesVapid | null {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return null;
  return { publica: env.VAPID_PUBLIC_KEY, privada: env.VAPID_PRIVATE_KEY };
}

interface HogarSuscrito {
  user_id: string;
  timezone: string | null;
  silenciado_at: number | null;
  last_sent_local_date: string | null;
}

export interface ResumenDelCiclo {
  hogaresMirados: number;
  enviados: number;
  suscripcionesMuertas: number;
  sinClaves: boolean;
}

/**
 * Una pasada del ciclo. Idempotente por construcción: el tope se persiste
 * como día LOCAL del último envío, así que una segunda pasada el mismo día
 * local encuentra `enviadosHoy >= UN_PUSH_POR_HOGAR_POR_DIA` y no reenvía.
 */
export async function cicloDeRecordatorios(
  env: EntornoPush,
  ahoraUtc: number,
): Promise<ResumenDelCiclo> {
  const resumen: ResumenDelCiclo = {
    hogaresMirados: 0,
    enviados: 0,
    suscripcionesMuertas: 0,
    sinClaves: false,
  };

  const claves = clavesDelEntorno(env);
  if (!claves) {
    // Degradación silenciosa declarada: el mecanismo existe, el remitente no.
    resumen.sinClaves = true;
    return resumen;
  }

  // Un hogar por fila, con su estado. El silenciado NO se filtra en SQL a
  // propósito: pasarlo por el motor deja el «por qué no» en un solo sitio —
  // un WHERE escondido aquí sería una segunda copia de la regla de D-026.
  const hogares = await env.DB.prepare(
    `SELECT ps.user_id, u.timezone, pr.silenciado_at, pr.last_sent_local_date
       FROM push_subscription ps
       JOIN users u ON u.id = ps.user_id AND u.deleted_at IS NULL
       LEFT JOIN push_recordatorio pr ON pr.user_id = ps.user_id
      GROUP BY ps.user_id`,
  ).all<HogarSuscrito>();

  for (const hogar of hogares.results ?? []) {
    resumen.hogaresMirados++;

    // La zona es la del HOGAR (`users.timezone`), jamás la del aparato — la
    // misma regla que el límite de pantalla. Sin zona conocida, el respaldo
    // documentado de `racha.ts`, que al menos es estable y visible.
    const zona = hogar.timezone ?? ZONA_DE_RESPALDO;
    const diaLocal = diaEfectivo(ahoraUtc, zona);

    const conteos = await conteosDelHogar(env.DB, hogar.user_id, diaLocal);
    const decision = decidirRecordatorio({
      ahoraUtc,
      zonaIana: zona,
      // Hoy `screen_time_settings` no guarda inicio de ventana (solo
      // `bedtime_local`, que es el final del día), así que el decisor usa su
      // hora neutra. La firma ya acepta la ventana para cuando exista.
      ventanaInicio: null,
      aprendicesPendientes: conteos.aprendices - conteos.completados,
      aprendicesCompletados: conteos.completados,
      enviadosHoy: hogar.last_sent_local_date === diaLocal ? 1 : 0,
      silenciado: hogar.silenciado_at !== null,
    });

    if (!decision.enviar) continue;

    // Todas las suscripciones del ADULTO: el tope es por hogar y ya se midió
    // arriba, así que teléfono y laptop suenan a la vez y cuentan como uno.
    const subs = await env.DB.prepare(
      "SELECT id, endpoint FROM push_subscription WHERE user_id = ?",
    )
      .bind(hogar.user_id)
      .all<{ id: string; endpoint: string }>();

    let algunoLlego = false;
    for (const sub of subs.results ?? []) {
      try {
        const resultado = await enviarTickle(
          sub.endpoint,
          env.VAPID_SUBJECT ?? ASUNTO_POR_DEFECTO,
          claves,
        );
        if (resultado === "enviado") algunoLlego = true;
        if (resultado === "suscripcion_muerta") {
          // El aparato desinstaló o el navegador rotó el endpoint. Se borra
          // esa fila y solo esa: el hogar puede tener otros aparatos vivos.
          await env.DB.prepare("DELETE FROM push_subscription WHERE id = ?").bind(sub.id).run();
          resumen.suscripcionesMuertas++;
        }
      } catch {
        // Un endpoint mal formado o una red caída no tumban el ciclo entero:
        // los demás hogares siguen, y a este se le reintenta en la próxima
        // pasada (el tope no se marcó, porque no llegó nada).
      }
    }

    if (algunoLlego) {
      // El tope se persiste como día LOCAL del hogar: «hoy» significa aquí lo
      // mismo que en la racha y en el límite de pantalla.
      await env.DB.prepare(
        `INSERT INTO push_recordatorio (user_id, last_sent_local_date, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           last_sent_local_date = excluded.last_sent_local_date,
           updated_at = excluded.updated_at`,
      )
        .bind(hogar.user_id, diaLocal, ahoraUtc)
        .run();
      resumen.enviados++;
    }
  }

  return resumen;
}
