import type { APIRoute } from "astro";
import { COOKIE_ADULTO, leerCookies, leerSesionAdulto } from "../../../lib/sesiones.ts";
import { rutaClub } from "../../../lib/rutas-app.ts";
import {
  formaPrendaValida,
  MODELOS_MODERACION_PRENDA,
  promptModeracionPrenda,
  veredictoPrenda,
  type FormaPrenda,
  type ModeloModeracionPrenda,
  type VeredictoPrenda,
} from "../../../../../../packages/motor/src/club-prendas.ts";

export const prerender = false;
interface AI { run(model: string, input: unknown, options?: unknown): Promise<unknown> }
interface Env { DB: D1Database; SESSION_KV: KVNamespace; CONFIG_KV?: KVNamespace; AI?: AI }

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!env?.DB || !env.SESSION_KV) return json({ ok: false, motivo: "sin_bindings" }, 503);
  const enabled = env.CONFIG_KV ? (await env.CONFIG_KV.get("f10_prendas_enabled")) === "1" : false;
  if (!enabled) return json({ ok: false, motivo: "apagado" }, 404);
  const cookies = leerCookies(request.headers.get("cookie"));
  const session = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!session) return json({ ok: false, motivo: "sin_sesion" }, 401);
  let body: Record<string, unknown>;
  let esFormulario = false;
  try {
    esFormulario = (request.headers.get("content-type") ?? "").includes("form");
    if (esFormulario) {
      const form = await request.formData();
      body = { challengeId: form.get("challengeId"), texto: form.get("texto"), forma: form.get("forma"), locale: form.get("locale") };
    } else body = (await request.json()) as Record<string, unknown>;
  } catch { return json({ ok: false, motivo: "cuerpo_ilegible" }, 400); }
  const challengeId = typeof body.challengeId === "string" ? body.challengeId : "";
  const texto = typeof body.texto === "string" ? body.texto.trim() : "";
  const locale = typeof body.locale === "string" ? body.locale : "en";
  const forma: FormaPrenda | null = formaPrendaValida(body.forma) ? body.forma : null;
  if (!challengeId || texto.length < 1 || texto.length > 140 || !forma) return json({ ok: false, motivo: "entrada_invalida" }, 400);
  const member = await env.DB.prepare("SELECT m.id, c.adult_club_id FROM adult_club_membership m JOIN club_challenge c ON c.adult_club_id = m.adult_club_id WHERE c.id = ? AND m.user_id = ? AND m.left_at IS NULL").bind(challengeId, session.userId).first<{ id: string; adult_club_id: string }>();
  if (!member) return json({ ok: false, motivo: "sin_membresia" }, 403);
  if (!env.AI) return json({ ok: false, motivo: "moderacion_no_disponible" }, 503);
  let verdict: VeredictoPrenda | null = null;
  let model: ModeloModeracionPrenda | null = null;
  for (const candidate of MODELOS_MODERACION_PRENDA) {
    try {
      const result = await env.AI.run(candidate, {
        messages: [
          { role: "system", content: `${promptModeracionPrenda(locale)} Devuelve solo JSON: {"veredicto":"pasa"|"rechaza_persona"|"rechaza_contenido"}.` },
          { role: "user", content: `Forma: ${forma}\nTexto: ${texto}` },
        ],
      }, { max_tokens: 64 });
      verdict = veredictoPrenda(result);
      if (verdict) {
        model = candidate;
        break;
      }
    } catch {}
  }
  if (!verdict || !model) return json({ ok: false, motivo: "moderacion_no_disponible" }, 503);
  const logId = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const stakeId = crypto.randomUUID();
  const modeloRegistro = model.endsWith("gpt-oss-120b") ? "gpt-oss-120b" : "kimi-k2.6";
  const log = env.DB.prepare("INSERT INTO stake_moderation_log (id, stake_id, texto, veredicto, modelo, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(logId, stakeId, texto, verdict, modeloRegistro, now);
  const stake = env.DB.prepare("INSERT INTO club_stake (id, challenge_id, forma, texto, propuesto_por, moderacion, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(stakeId, challengeId, forma, texto, session.userId, verdict === "pasa" ? "aprobada" : "rechazada", now);
  await env.DB.batch([stake, log]);
  if (esFormulario) return Response.redirect(`${rutaClub(typeof body.locale === "string" ? body.locale : "en", member.adult_club_id)}?prenda=${verdict}`, 303);
  return verdict === "pasa"
    ? json({ ok: true, veredicto: "pasa", stakeId })
    : json({ ok: true, veredicto: verdict, apelable: true, stakeId });
};
