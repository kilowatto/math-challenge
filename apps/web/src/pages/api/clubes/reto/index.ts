import type { APIRoute } from "astro";
import { COOKIE_ADULTO, COOKIE_NINO, leerCookies, leerSesionAdulto, leerSesionNino } from "../../../../lib/sesiones.ts";
import { itemsDelReto } from "../../../../lib/club-retos.ts";
import { crearRetoClub } from "../../../../lib/club-adulto.ts";
import { generarBancoAdulto } from "../../../../../../../packages/motor/src/banco-adulto.ts";
import { presentarItemEstructura } from "../../../../../../../packages/motor/src/presentar.ts";
import { rutaClub } from "../../../../lib/rutas-app";
import type { Locale } from "../../../../i18n";
import retoEN from "../../../../i18n/reto/en.json";
import retoESMX from "../../../../i18n/reto/es-MX.json";
import retoESES from "../../../../i18n/reto/es-ES.json";
import retoFR from "../../../../i18n/reto/fr-FR.json";
import retoPTBR from "../../../../i18n/reto/pt-BR.json";
import retoPTPT from "../../../../i18n/reto/pt-PT.json";
import retoDE from "../../../../i18n/reto/de-DE.json";

export const prerender = false;
interface Env { DB: D1Database; SESSION_KV: KVNamespace }
const RETO_POR_LOCALE: Record<Locale, Record<string, unknown>> = {
  en: retoEN,
  "es-MX": retoESMX,
  "es-ES": retoESES,
  "fr-FR": retoFR,
  "pt-BR": retoPTBR,
  "pt-PT": retoPTPT,
  "de-DE": retoDE,
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export const GET: APIRoute = async ({ request, locals, url, params }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!env?.DB || !env.SESSION_KV) return json({ ok: false, motivo: "sin_bindings" }, 503);
  const cookies = leerCookies(request.headers.get("cookie"));
  const adulto = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  const nino = adulto ? null : await leerSesionNino(env.SESSION_KV, cookies[COOKIE_NINO]);
  if (!adulto && !nino) return json({ ok: false, motivo: "sin_sesion" }, 401);
  const challengeId = url.searchParams.get("challenge") ?? "";
  const localeParam = url.searchParams.get("locale") ?? params.locale;
  const locale = (typeof localeParam === "string" && localeParam in RETO_POR_LOCALE ? localeParam : "en") as Locale;
  const participant = adulto ? { column: "m.user_id", id: adulto.userId } : { column: "m.child_profile_id", id: nino!.childProfileId };
  const challenge = await env.DB.prepare(`SELECT c.item_set, c.nivel, c.starts_at, c.expires_at, c.status FROM club_challenge c JOIN adult_club_membership m ON m.adult_club_id = c.adult_club_id AND ${participant.column} = ? AND m.left_at IS NULL WHERE c.id = ?`).bind(participant.id, challengeId).first<{ item_set: string; nivel: number; starts_at: number; expires_at: number; status: string }>();
  if (!challenge) return json({ ok: false, motivo: "reto_desconocido" }, 404);
  const now = Math.floor(Date.now() / 1000);
  if (challenge.status !== "open" || now < challenge.starts_at || now >= challenge.expires_at) return json({ ok: false, motivo: "reto_cerrado" }, 410);
  const items = itemsDelReto(challenge.item_set, generarBancoAdulto());
  return json({ ok: true, challengeId, nivel: challenge.nivel, items: items.map((item) => presentarItemEstructura(item, locale, RETO_POR_LOCALE[locale])) });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!env?.DB || !env.SESSION_KV) return json({ ok: false, motivo: "sin_bindings" }, 503);
  const cookies = leerCookies(request.headers.get("cookie"));
  const session = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!session) return json({ ok: false, motivo: "sin_sesion" }, 401);
  let body: Record<string, unknown>;
  let esFormulario = false;
  try {
    const type = request.headers.get("content-type") ?? "";
    esFormulario = type.includes("form");
    if (esFormulario) {
      const form = await request.formData();
      body = { clubId: form.get("club_id"), nivel: Number(form.get("nivel")), locale: form.get("locale") };
    } else body = (await request.json()) as Record<string, unknown>;
  } catch { return json({ ok: false, motivo: "cuerpo_ilegible" }, 400); }
  const clubId = typeof body.clubId === "string" ? body.clubId : "";
  const nivel = Number(body.nivel);
  const locale = typeof body.locale === "string" ? body.locale : "en";
  const result = await crearRetoClub(env.DB, session.userId, clubId, nivel, Math.floor(Date.now() / 1000));
  if (!result.ok) return json(result, 400);
  if (esFormulario) return Response.redirect(rutaClub(locale, clubId), 303);
  return json(result);
};
