/**
 * El ciclo de envío de los reportes por correo (F8 #289): qué hogares tocan,
 * el encolado, y el consumidor que construye, renderiza y envía.
 *
 * ─── Por qué vive en `math-challenge-web` y no en un Worker nuevo ──────────
 *
 * El issue #289 proponía `math-challenge-reports` como Worker aparte. Se
 * queda en ESTE Worker por las mismas tres razones por las que el cron del
 * recordatorio push se quedó aquí (#207): el destinatario, la preferencia y
 * la baja son de la superficie del padre, que es este Worker; el binding
 * `EMAIL` y la base ya están declarados aquí, y duplicarlos en otro Worker es
 * otra configuración que puede desincronizarse; y un tercer objeto de cuenta
 * es otro renglón que inventariar sin problema de latencia que resolver. Lo
 * que el issue pedía separar —el presupuesto de CPU del cron— se separa con
 * la COLA: el `scheduled()` solo enumera y encola, nunca renderiza ni envía
 * inline.
 *
 * ─── Por qué hora local del hogar y no un cron semanal fijo en UTC ─────────
 *
 * Con 7 locales en zonas horarias reales, un disparo fijo en UTC golpea
 * distinto a cada mercado (#289). El cron corre CADA HORA y la decisión —hora
 * local, cadencia, ventana de silencio— es del motor puro
 * (`packages/motor/src/reportes.ts::decidirEnvioReporte`), con la zona de
 * `users.timezone`, la misma columna que la racha y el límite de pantalla.
 *
 * ─── Degradación silenciosa, el estado seguro por defecto ──────────────────
 *
 * Sin cola declarada o sin binding `EMAIL`, el ciclo corre y no envía nada —
 * el mismo patrón que el push sin VAPID: un camino en vivo no se enciende a
 * medias. Nada se marca como enviado, así que cuando el orquestador cree la
 * cola y confirme el dominio, el siguiente cron retoma donde debe.
 *
 * ─── La reputación «At Risk» manda ─────────────────────────────────────────
 *
 * Solo se escribe a direcciones VERIFICADAS (`email_verified = 1`) que ya
 * están en `users` — el criterio del issue #313 aplicado aquí entero. Una
 * dirección suprimida por el proveedor (`E_RECIPIENT_SUPPRESSED`) apaga la
 * cadencia del hogar y NO se reintenta: insistir sobre una dirección que
 * rebota es exactamente cómo se hunde la reputación del remitente.
 */

import {
  construirReporteHogar,
  decidirEnvioReporte,
  ventanaDelPeriodo,
  CADENCIA_POR_DEFECTO,
  HORA_POR_DEFECTO,
  type CadenciaReporte,
} from "../../../../packages/motor/src/reportes.ts";
import { diaEfectivo, ZONA_DE_RESPALDO } from "../../../../packages/motor/src/racha.ts";
import { asegurarSettings } from "./reportes-preferencia";
import { leerFilasHogar } from "./reportes-datos";
import {
  armarMime,
  renderizarCorreoReporte,
  REMITENTE_REPORTES,
} from "./reportes-correo";

/** Lo que el ciclo necesita del entorno. Ni una cosa más. */
export interface EntornoReportes {
  DB: D1Database;
  EMAIL?: SendEmail;
  REPORTES_QUEUE?: Queue;
  /** Origen público del sitio, para los enlaces del correo. */
  URL_BASE?: string;
}

const URL_BASE_POR_DEFECTO = "https://math.kilowatto.com";

export interface MensajeReporte {
  userId: string;
}

interface HogarElegible {
  user_id: string;
  timezone: string | null;
  cadence: CadenciaReporte | null;
  send_hour_local: number | null;
  last_sent_at: number | null;
}

export interface ResumenDelCicloReportes {
  hogaresMirados: number;
  encolados: number;
  sinCola: boolean;
}

/**
 * Una pasada del cron: enumera hogares y encola UN mensaje por hogar que
 * toca. Nunca renderiza ni envía inline — el presupuesto de CPU de una
 * invocación de cron no se arriesga con el fan-out (#289, criterio #3).
 *
 * Un solo correo POR HOGAR aunque haya varios hijos (#286), así que la
 * elegibilidad se evalúa por cuenta de adulto.
 */
export async function cicloDeReportes(
  env: EntornoReportes,
  ahoraUtc: number,
): Promise<ResumenDelCicloReportes> {
  const resumen: ResumenDelCicloReportes = { hogaresMirados: 0, encolados: 0, sinCola: false };

  // Solo hogares con al menos un perfil de niño vivo y correo VERIFICADO.
  // La cadencia NO se filtra en SQL a propósito: pasarla por el motor deja
  // el «por qué no» en un solo sitio (el mismo criterio que el ciclo del
  // recordatorio push) — un WHERE escondido aquí sería una segunda copia de
  // la regla.
  const hogares = await env.DB.prepare(
    `SELECT u.id AS user_id, u.timezone,
            s.cadence, s.send_hour_local, s.last_sent_at
       FROM users u
       LEFT JOIN parent_report_settings s ON s.user_id = u.id
      WHERE u.deleted_at IS NULL
        AND u.email_verified = 1
        AND EXISTS (
          SELECT 1 FROM child_profiles c
           WHERE c.parent_user_id = u.id AND c.deleted_at IS NULL
        )
      GROUP BY u.id`,
  ).all<HogarElegible>();

  for (const hogar of hogares.results ?? []) {
    resumen.hogaresMirados++;
    const zona = hogar.timezone ?? ZONA_DE_RESPALDO;
    const decision = decidirEnvioReporte(
      {
        cadencia: hogar.cadence ?? CADENCIA_POR_DEFECTO,
        horaLocal: hogar.send_hour_local ?? HORA_POR_DEFECTO,
        ultimoEnvioUtc: hogar.last_sent_at,
      },
      ahoraUtc,
      zona,
    );
    if (!decision.enviar) continue;

    if (!env.REPORTES_QUEUE) {
      // Degradación silenciosa declarada: el mecanismo existe, la cola no.
      resumen.sinCola = true;
      continue;
    }
    await env.REPORTES_QUEUE.send({ userId: hogar.user_id } satisfies MensajeReporte);
    resumen.encolados++;
  }

  return resumen;
}

// ─── El consumidor de la cola ────────────────────────────────────────────────

/** ¿El error del envío es una dirección suprimida por el proveedor? */
function esSuprimida(err: unknown): boolean {
  return err instanceof Error && /suppress/i.test(err.message);
}

/**
 * Construye y envía el reporte de UN hogar, y solo tras el envío CONFIRMADO
 * actualiza `last_sent_at` y los snapshots de `child_report_state` en un solo
 * lote (#289, criterio #4: nunca antes — un correo marcado como enviado que
 * falló es un padre que no vuelve a saber de nosotros en un mes).
 *
 * Devuelve por qué no se envió, cuando aplica, para el registro del ciclo.
 */
export async function enviarReporteHogar(
  env: EntornoReportes,
  userId: string,
  ahoraUtc: number,
): Promise<"enviado" | "sin_remitente" | "apagado" | "sin_hijos" | "sin_usuario"> {
  const usuario = await env.DB.prepare(
    `SELECT id, email, locale, timezone FROM users
      WHERE id = ? AND deleted_at IS NULL AND email_verified = 1`,
  )
    .bind(userId)
    .first<{ id: string; email: string; locale: string; timezone: string | null }>();
  if (!usuario) return "sin_usuario";

  const settings = await asegurarSettings(env.DB, userId);
  if (settings.cadence === "OFF") return "apagado";

  const zona = usuario.timezone ?? ZONA_DE_RESPALDO;
  const periodo = ventanaDelPeriodo(settings.cadence, ahoraUtc);
  const diasLocales = {
    desde: diaEfectivo(periodo.desde, zona),
    hasta: diaEfectivo(ahoraUtc, zona),
  };

  const filas = await leerFilasHogar(env.DB, userId, periodo, diasLocales);
  if (filas.length === 0) return "sin_hijos";

  const reporte = construirReporteHogar(userId, periodo, filas);
  const base = env.URL_BASE ?? URL_BASE_POR_DEFECTO;
  const locale = (
    ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"] as const
  ).find((l) => l === usuario.locale) ?? "en";

  const urlBaja = `${base}/api/reportes?accion=baja&token=${settings.unsubscribe_token}`;
  const correo = renderizarCorreoReporte(reporte, locale, settings.cadence, {
    preferencias: `${base}/${locale}/app/parent/reportes`,
    baja: urlBaja,
  });

  if (!env.EMAIL) return "sin_remitente"; // degradación silenciosa, nada se marca

  const crudo = armarMime({
    de: REMITENTE_REPORTES,
    para: usuario.email,
    asunto: correo.asunto,
    texto: correo.texto,
    html: correo.html,
    urlBaja,
  });

  // `cloudflare:email` solo existe en el runtime de Workers: se importa en
  // caliente y con `@vite-ignore` para que el build de Astro no intente
  // resolverlo (mismo motivo por el que `cloudflare:workers` no aparece en
  // imports estáticos de este Worker).
  const { EmailMessage } = (await import(/* @vite-ignore */ "cloudflare:email")) as {
    EmailMessage: new (de: string, para: string, crudo: ReadableStream | string) => EmailMessage;
  };
  await env.EMAIL.send(new EmailMessage(REMITENTE_REPORTES, usuario.email, crudo));

  // Solo AQUÍ, con el envío confirmado, se sella el envío: `last_sent_at` del
  // hogar y el snapshot de cada hijo, en UN lote (D1 por lotes, mc-32).
  const escrituras = [
    env.DB.prepare(
      `UPDATE parent_report_settings SET last_sent_at = ?, updated_at = ? WHERE user_id = ?`,
    ).bind(ahoraUtc, ahoraUtc, userId),
    ...reporte.hijos.map((hijo) =>
      env.DB.prepare(
        `INSERT INTO child_report_state
           (child_profile_id, last_reported_at, last_score_all_time, last_xp_total, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(child_profile_id) DO UPDATE SET
           last_reported_at = excluded.last_reported_at,
           last_score_all_time = excluded.last_score_all_time,
           last_xp_total = excluded.last_xp_total,
           updated_at = excluded.updated_at`,
      ).bind(hijo.childProfileId, ahoraUtc, hijo.puntosTotales, hijo.xpTotal, ahoraUtc),
    ),
  ];
  await env.DB.batch(escrituras);

  return "enviado";
}

/**
 * El consumidor de `math-challenge-reports-queue` (lote ≤10, reintentos con
 * backoff y DLQ configurados en `wrangler.jsonc`).
 *
 * Una dirección SUPRIMIDA no se reintenta: apaga la cadencia del hogar y se
 * confirma el mensaje — reintentar contra una dirección que rebota es cómo se
 * hunde una reputación de remitente que ya está «At Risk». Cualquier otro
 * error sí se reintenta (tope 3, después DLQ): el estado no se marcó, así que
 * el reintento no puede producir un duplicado marcado como único.
 */
export async function consumirColaReportes(
  batch: MessageBatch<MensajeReporte>,
  env: EntornoReportes,
): Promise<void> {
  for (const mensaje of batch.messages) {
    try {
      await enviarReporteHogar(env, mensaje.body.userId, Date.now());
      mensaje.ack();
    } catch (err) {
      if (esSuprimida(err)) {
        await env.DB.prepare(
          `UPDATE parent_report_settings
              SET cadence = 'OFF', unsubscribed_at = COALESCE(unsubscribed_at, ?), updated_at = ?
            WHERE user_id = ?`,
        )
          .bind(Date.now(), Date.now(), mensaje.body.userId)
          .run();
        mensaje.ack();
        continue;
      }
      mensaje.retry();
    }
  }
}
