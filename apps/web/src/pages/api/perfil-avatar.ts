/**
 * `POST /api/perfil-avatar` — el adulto cambia el avatar-animal de un hijo,
 * eligiendo del roster que ya existe (D-194, wiring nuevo en D-197).
 *
 * `avatar_parts` es JSON de "piezas predefinidas" — se conserva cualquier
 * otra clave que ya tuviera (hoy solo existe `animal`, pero el comentario de
 * `avatares-animal.ts` deja la puerta abierta a más piezas) en vez de
 * sobrescribir la columna entera.
 */
import type { APIRoute } from "astro";
import { leerSesionAdulto, COOKIE_ADULTO, leerCookies } from "../../lib/sesiones";
import { hogarIds } from "../../lib/familia";
import { rosterPara, type AnimalId } from "../../lib/avatares-animal";
import type { TemaVisual } from "../../lib/quien-juega-datos";

export const prerender = false;

interface Env {
  DB: D1Database;
  SESSION_KV: KVNamespace;
}

const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env as Env | undefined;
  if (!env?.DB || !env?.SESSION_KV) return json({ error: "sin_bindings" }, 503);

  const sesion = await leerSesionAdulto(env.SESSION_KV, leerCookies(request.headers.get("cookie"))[COOKIE_ADULTO]);
  if (!sesion) return json({ error: "sin_sesion" }, 401);

  let body: { childId?: unknown; animal?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "cuerpo_ilegible" }, 400);
  }
  const childId = String(body.childId ?? "");
  const animal = String(body.animal ?? "");
  if (!childId) return json({ error: "hijo_invalido" }, 400);

  const links = (
    await env.DB.prepare(
      "SELECT inviter_user_id, user_id FROM household_link WHERE revoked_at IS NULL AND (inviter_user_id = ? OR user_id = ?)",
    )
      .bind(sesion.userId, sesion.userId)
      .all()
  ).results as Array<{ inviter_user_id: string; user_id: string }>;
  const ids = hogarIds(links, sesion.userId);
  const marcadores = ids.map(() => "?").join(",");

  const hijo = (await env.DB.prepare(
    `SELECT id, parent_user_id, theme_band, avatar_parts FROM child_profiles WHERE id = ? AND parent_user_id IN (${marcadores}) AND deleted_at IS NULL`,
  )
    .bind(childId, ...ids)
    .first()) as { id: string; parent_user_id: string; theme_band: TemaVisual; avatar_parts: string } | null;
  if (!hijo) return json({ error: "hijo_fuera_del_hogar" }, 403);

  const roster = rosterPara(hijo.theme_band);
  if (!(roster as readonly string[]).includes(animal)) return json({ error: "animal_fuera_de_roster" }, 422);

  let piezas: Record<string, unknown> = {};
  try {
    piezas = JSON.parse(hijo.avatar_parts || "{}");
  } catch {
    piezas = {};
  }
  piezas.animal = animal as AnimalId;

  await env.DB.prepare("UPDATE child_profiles SET avatar_parts = ?, updated_at = ? WHERE id = ? AND parent_user_id = ?")
    .bind(JSON.stringify(piezas), Math.floor(Date.now() / 1000), childId, hijo.parent_user_id)
    .run();

  return json({ ok: true, animal });
};
