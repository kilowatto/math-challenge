import type { APIRoute } from "astro";
import { calificarRespuesta, type Item } from "../../../../../packages/motor/src/item.ts";
import { COOKIE_ADULTO, COOKIE_NINO, leerCookies, leerSesionAdulto, leerSesionNino } from "../../lib/sesiones";
import { hogarIds } from "../../lib/familia";

export const prerender = false;
const DURACION_MS = 72 * 60 * 60 * 1000;

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  const actor = await leerActor(env, request);
  if (!actor || !env?.DB) return json({ error: "sin_sesion" }, 401);
  const rows = (await env.DB.prepare("SELECT id, created_by_user_id, item_set, opens_at, expires_at FROM family_challenge WHERE expires_at > ? ORDER BY created_at DESC LIMIT 20").bind(Date.now()).all()).results as Array<{ id: string; created_by_user_id: string; item_set: string; opens_at: number; expires_at: number }>;
  const childOwner = actor.childProfileId
    ? await env.DB.prepare("SELECT parent_user_id FROM child_profiles WHERE id = ? AND deleted_at IS NULL").bind(actor.childProfileId).first() as { parent_user_id: string } | null
    : null;
  const visibles = [];
  for (const row of rows) {
    const household = await idsDelHogar(env.DB, row.created_by_user_id);
    if ((actor.userId && household.includes(actor.userId)) || (childOwner && household.includes(childOwner.parent_user_id))) {
      visibles.push({ id: row.id, createdBy: row.created_by_user_id, opensAt: row.opens_at, expiresAt: row.expires_at, participants: Object.keys(JSON.parse(row.item_set)) });
    }
  }
  const resultRows = (await env.DB.prepare("SELECT family_challenge_id, user_id, child_profile_id, correct_count, item_count, completed_at FROM family_challenge_result WHERE user_id = ? OR child_profile_id = ? ORDER BY completed_at DESC LIMIT 20").bind(actor.userId ?? "", actor.childProfileId ?? "").all()).results;
  return json({ retos: visibles, resultados: resultRows });
};

export const POST: APIRoute = async ({ request, locals, url }) => {
  const env = (locals as any).runtime?.env;
  const actor = await leerActor(env, request);
  if (!actor || !env?.DB) return json({ error: "sin_sesion" }, 401);
  const accion = url.searchParams.get("accion");
  if (accion === "crear") {
    if (!actor.userId) return json({ error: "solo_adulto" }, 403);
    const ids = await idsDelHogar(env.DB, actor.userId);
    const participants = await participantes(env.DB, ids);
    if (participants.length === 0) return json({ error: "sin_participantes" }, 422);
    const itemSet: Record<string, string[]> = {};
    for (const participant of participants) {
      const band = participant.kind === "adult" ? "SERIO" : participant.band === "SECUNDARIA" ? "SECUNDARIA" : "PRIMARIA";
      const { results } = await env.DB.prepare("SELECT id FROM item_bank WHERE banda = ? ORDER BY id LIMIT 6").bind(band).all<{ id: string }>();
      if (results.length < 6) continue;
      itemSet[`${participant.kind}:${participant.id}`] = results.map((row) => row.id);
    }
    if (Object.keys(itemSet).length === 0) return json({ error: "banco_no_sembrado" }, 503);
    const now = Date.now();
    const id = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO family_challenge (id, created_by_user_id, item_set, opens_at, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(id, actor.userId, JSON.stringify(itemSet), now, now + DURACION_MS, now).run();
    return json({ id, expiresAt: now + DURACION_MS, participants: Object.keys(itemSet) }, 201);
  }
  if (accion === "resolver") {
    let body: { challengeId?: unknown; answers?: unknown };
    try { body = await request.json(); } catch { return json({ error: "cuerpo_ilegible" }, 400); }
    if (typeof body.challengeId !== "string" || !Array.isArray(body.answers)) return json({ error: "reto_invalido" }, 400);
    const challenge = await env.DB.prepare("SELECT item_set, expires_at, created_by_user_id FROM family_challenge WHERE id = ?").bind(body.challengeId).first() as { item_set: string; expires_at: number; created_by_user_id: string } | null;
    if (!challenge || challenge.expires_at <= Date.now()) return json({ error: "reto_expirado" }, 410);
    const household = await idsDelHogar(env.DB, challenge.created_by_user_id);
    if (actor.userId && !household.includes(actor.userId)) return json({ error: "reto_fuera_del_hogar" }, 403);
    if (actor.childProfileId) {
      const childOwner = await env.DB.prepare("SELECT parent_user_id FROM child_profiles WHERE id = ? AND deleted_at IS NULL").bind(actor.childProfileId).first() as { parent_user_id: string } | null;
      if (!childOwner || !household.includes(childOwner.parent_user_id)) return json({ error: "reto_fuera_del_hogar" }, 403);
    }
    const key = actor.userId ? `adult:${actor.userId}` : `child:${actor.childProfileId}`;
    let itemIds: string[];
    try { itemIds = JSON.parse(challenge.item_set)[key]; } catch { itemIds = []; }
    if (!Array.isArray(itemIds) || itemIds.length !== 6) return json({ error: "participante_no_incluido" }, 403);
    const answers = body.answers as Array<{ itemId?: unknown; eleccion?: unknown }>;
    if (answers.length !== itemIds.length || answers.some((answer) => typeof answer.itemId !== "string" || (typeof answer.eleccion !== "number" && typeof answer.eleccion !== "string"))) return json({ error: "respuestas_incompletas" }, 400);
    const ordered = new Map(answers.map((answer) => [answer.itemId as string, answer.eleccion as number | string]));
    if (itemIds.some((itemId) => !ordered.has(itemId)) || ordered.size !== itemIds.length) return json({ error: "set_alterado" }, 400);
    let correct = 0;
    for (const itemId of itemIds) {
      const row = await env.DB.prepare("SELECT item_json FROM item_bank WHERE id = ?").bind(itemId).first() as { item_json: string } | null;
      if (!row) return json({ error: "item_no_disponible" }, 503);
      const item = JSON.parse(row.item_json) as Item;
      if (calificarRespuesta(item, ordered.get(itemId) as number | string).acc === 1) correct++;
    }
    const already = await env.DB.prepare("SELECT id FROM family_challenge_result WHERE family_challenge_id = ? AND (user_id = ? OR child_profile_id = ?)").bind(body.challengeId, actor.userId ?? "", actor.childProfileId ?? "").first();
    if (already) return json({ error: "reto_ya_resuelto" }, 409);
    await env.DB.prepare("INSERT INTO family_challenge_result (id, family_challenge_id, user_id, child_profile_id, completed_at, correct_count, item_count) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), body.challengeId, actor.userId ?? null, actor.childProfileId ?? null, Date.now(), correct, itemIds.length).run();
    return json({ ok: true, correct, total: itemIds.length });
  }
  return json({ error: "accion_desconocida" }, 400);
};

async function leerActor(env: any, request: Request): Promise<{ userId?: string; childProfileId?: string } | null> {
  if (!env?.SESSION_KV) return null;
  const cookies = leerCookies(request.headers.get("cookie"));
  const child = await leerSesionNino(env.SESSION_KV, cookies[COOKIE_NINO]);
  if (child) return { childProfileId: child.childProfileId };
  const adult = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  return adult ? { userId: adult.userId } : null;
}

async function idsDelHogar(db: D1Database, userId: string): Promise<string[]> {
  const links = (await db.prepare("SELECT inviter_user_id, user_id FROM household_link WHERE revoked_at IS NULL AND (inviter_user_id = ? OR user_id = ?)").bind(userId, userId).all()).results as Array<{ inviter_user_id: string; user_id: string }>;
  return hogarIds(links, userId);
}

async function participantes(db: D1Database, ids: string[]): Promise<Array<{ kind: "adult" | "child"; id: string; band?: string }>> {
  const marks = ids.map(() => "?").join(",");
  const adults = (await db.prepare(`SELECT id FROM users WHERE id IN (${marks}) AND is_learner = 1 AND deleted_at IS NULL`).bind(...ids).all()).results as Array<{ id: string }>;
  const children = (await db.prepare(`SELECT id, theme_band AS band FROM child_profiles WHERE parent_user_id IN (${marks}) AND deleted_at IS NULL`).bind(...ids).all()).results as Array<{ id: string; band: string }>;
  return [...adults.map((row) => ({ kind: "adult" as const, id: row.id })), ...children.map((row) => ({ kind: "child" as const, id: row.id, band: row.band }))];
}

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
