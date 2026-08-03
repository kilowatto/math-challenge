/**
 * `/api/push-mensaje` — el copy del recordatorio, servido al service worker.
 *
 * ─── Por qué existe esta ruta ──────────────────────────────────────────────
 *
 * El push viaja SIN payload (ver `apps/web/src/lib/push-vapid.ts`): es un
 * «tickle». Al recibirlo, el service worker pide aquí el título y el cuerpo
 * ya localizados, así que el texto —que puede llevar el alias de un niño—
 * **nunca pasa por los servidores de Google, Mozilla o Apple**, ni cifrado
 * (mc-25, D-013).
 *
 * La llave es el PROPIO endpoint de la suscripción: quien lo posee ya puede
 * empujar a ese aparato, así que usarlo para leer el copy no abre ninguna
 * puerta nueva. No hay sesión porque el service worker puede estar sirviendo
 * un push con la sesión caducada, y el recordatorio no debe depender de ella.
 *
 * ─── Qué NO es ─────────────────────────────────────────────────────────────
 *
 * No es una ruta de envío: no importa `push-vapid.ts`, no firma, no empuja.
 * LEE `push_subscription` para saber de quién es el aparato y nada más —
 * `audits/recordatorio-sin-culpa.mjs` comprueba que aquí no haya ni una
 * escritura ni una importación del remitente.
 *
 * ─── El copy: intención-implementación, nunca culpa ────────────────────────
 *
 * mc-19 §1.3 y rec. #5: el texto hace eco del compromiso de la familia
 * («es un buen momento para el momento de matemáticas de…»), sin mencionar la
 * racha, sin números en riesgo, sin exclamación y sin verbos de pérdida. Los
 * textos viven en `apps/web/src/i18n/push/`, autorados por locale, y pasan el
 * léxico de `audits/racha-lexico.mjs` en los siete.
 */
import type { APIRoute } from "astro";
import { diaEfectivo, ZONA_DE_RESPALDO } from "../../../../../packages/motor/src/racha.ts";
import { pendientesDelHogar } from "../../lib/push-hogares";

// Los textos del recordatorio en los siete locales. Se importan como JSON
// porque son CONTENIDO autorado por locale, no código (D-022, mc-34).
import pushEn from "../../i18n/push/en.json";
import pushEsMx from "../../i18n/push/es-MX.json";
import pushEsEs from "../../i18n/push/es-ES.json";
import pushFr from "../../i18n/push/fr-FR.json";
import pushPtBr from "../../i18n/push/pt-BR.json";
import pushPtPt from "../../i18n/push/pt-PT.json";
import pushDe from "../../i18n/push/de-DE.json";

const TEXTOS: Record<string, Record<string, string>> = {
  en: pushEn,
  "es-MX": pushEsMx,
  "es-ES": pushEsEs,
  "fr-FR": pushFr,
  "pt-BR": pushPtBr,
  "pt-PT": pushPtPt,
  "de-DE": pushDe,
};

export const prerender = false;

interface Env {
  DB?: D1Database;
}

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // El copy depende del día y del hogar: jamás se cachea.
      "cache-control": "no-store",
    },
  });

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env: Env } }).runtime?.env;
  if (!env?.DB) return json({ error: "sin_base" }, 503);

  let cuerpo: { endpoint?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return json({ error: "cuerpo_invalido" }, 400);
  }
  const endpoint = cuerpo.endpoint;
  if (typeof endpoint !== "string" || endpoint.length > 512) {
    return json({ error: "endpoint_invalido" }, 400);
  }

  // ¿De quién es este aparato? Solo se lee; esta ruta no escribe nada.
  const sub = await env.DB.prepare(
    `SELECT u.id AS user_id, u.locale, u.timezone, u.is_learner
       FROM push_subscription ps
       JOIN users u ON u.id = ps.user_id AND u.deleted_at IS NULL
      WHERE ps.endpoint = ?`,
  )
    .bind(endpoint)
    .first<{ user_id: string; locale: string; timezone: string | null; is_learner: number }>();
  if (!sub) return json({ error: "suscripcion_desconocida" }, 404);

  const zona = sub.timezone ?? ZONA_DE_RESPALDO;
  const diaLocal = diaEfectivo(Date.now(), zona);

  // Quién falta por completar hoy — lo mide la capa de datos, que es la única
  // autorizada a leer las tablas de aprendizaje. Aquí llegan el alias (la
  // forma pública del niño, D-003) y una marca del adulto, nada más.
  const { aliases, adultoPendiente } = await pendientesDelHogar(
    env.DB,
    sub.user_id,
    diaLocal,
    sub.is_learner === 1,
  );
  const totalPendientes = aliases.length + (adultoPendiente ? 1 : 0);

  const textos = TEXTOS[sub.locale] ?? TEXTOS.en;
  const titulo = textos["push.notif.titulo"];

  // Uno solo y es un hijo → se nombra su alias. Varios → UN push agregado sin
  // nombres (issue #207). Solo el adulto → su propio momento. Y si entre el
  // cron y esta lectura alguien completó, el genérico: suavidad, nunca culpa.
  let cuerpoTexto: string;
  if (aliases.length === 1 && !adultoPendiente) {
    cuerpoTexto = textos["push.notif.cuerpo_uno"].replace("{alias}", aliases[0]);
  } else if (totalPendientes === 1 && adultoPendiente) {
    cuerpoTexto = textos["push.notif.cuerpo_propio"];
  } else {
    cuerpoTexto = textos["push.notif.cuerpo_varios"];
  }

  // Al tocar la notificación se abre la casa del adulto — donde está el
  // progreso de sus hijos y el botón de jugar. Nunca una superficie de niño.
  return json({ titulo, cuerpo: cuerpoTexto, url: `/${sub.locale}/app/` });
};
