import type { APIRoute } from "astro";
import { COOKIE_ADULTO, leerCookies, leerSesionAdulto } from "../../../lib/sesiones.ts";

export const prerender = false;
type Forma = "colectiva" | "ganador_elige" | "compromiso_propio";
interface AI { run(model: string, input: unknown, options?: unknown): Promise<unknown> }
interface Env { DB: D1Database; SESSION_KV: KVNamespace; CONFIG_KV?: KVNamespace; AI?: AI }

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

function leerVeredicto(value: unknown): "pasa" | "rechaza_persona" | "rechaza_contenido" | null {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  const match = text.match(/\b(rechaza_persona|rechaza_contenido|pasa)\b/);
  return (match?.[1] as "pasa" | "rechaza_persona" | "rechaza_contenido" | undefined) ?? null;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!env?.DB || !env.SESSION_KV) return json({ ok: false, motivo: "sin_bindings" }, 503);
  const enabled = env.CONFIG_KV ? (await env.CONFIG_KV.get("f10_prendas_enabled")) === "1" : false;
  if (!enabled) return json({ ok: false, motivo: "apagado" }, 404);
  const cookies = leerCookies(request.headers.get("cookie"));
  const session = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!session) return json({ ok: false, motivo: "sin_sesion" }, 401);
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch { return json({ ok: false, motivo: "cuerpo_ilegible" }, 400); }
  const challengeId = typeof body.challengeId === "string" ? body.challengeId : "";
  const texto = typeof body.texto === "string" ? body.texto.trim() : "";
  const forma = body.forma;
  if (!challengeId || texto.length < 1 || texto.length > 140 || !["colectiva", "ganador_elige", "compromiso_propio"].includes(String(forma))) return json({ ok: false, motivo: "entrada_invalida" }, 400);
  const member = await env.DB.prepare("SELECT m.id FROM adult_club_membership m JOIN club_challenge c ON c.adult_club_id = m.adult_club_id WHERE c.id = ? AND m.user_id = ? AND m.left_at IS NULL").bind(challengeId, session.userId).first<{ id: string }>();
  if (!member) return json({ ok: false, motivo: "sin_membresia" }, 403);
  if (!env.AI) return json({ ok: false, motivo: "moderacion_no_disponible" }, 503);
  let verdict: "pasa" | "rechaza_persona" | "rechaza_contenido" | null = null;
  let model = "gpt-oss-120b";
  try {
    const result = await env.AI.run(model, { messages: [{ role: "system", content: "Modera una prenda de juego entre adultos. Devuelve solo JSON con veredicto: pasa, rechaza_persona o rechaza_contenido. Rechaza señalar o humillar a una persona, sexo explícito, violencia y denigración." }, { role: "user", content: `Forma: ${String(forma)}\nTexto: ${texto}` }] }, { max_tokens: 64 });
    verdict = leerVeredicto(result);
    if (!verdict) throw new Error("veredicto_ilegible");
  } catch {
    return json({ ok: false, motivo: "moderacion_no_disponible" }, 503);
  }
  const logId = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const stakeId = crypto.randomUUID();
  const log = env.DB.prepare("INSERT INTO stake_moderation_log (id, stake_id, texto, veredicto, modelo, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(logId, stakeId, texto, verdict, model, now);
  if (verdict !== "pasa") {
    await log.run();
    return json({ ok: true, veredicto: verdict, apelable: true });
  }
  const stake = env.DB.prepare("INSERT INTO club_stake (id, challenge_id, forma, texto, propuesto_por, moderacion, created_at) VALUES (?, ?, ?, ?, ?, 'aprobada', ?)").bind(stakeId, challengeId, forma as Forma, texto, session.userId, now);
  await env.DB.batch([log, stake]);
  return json({ ok: true, veredicto: "pasa", stakeId });
};
