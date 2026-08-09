/**
 * `POST /api/perfil-alias` — el adulto pide un alias nuevo para un hijo, uno
 * a la vez, del mismo generador seguro que ya existe (D-197).
 *
 * Nunca texto libre — línea roja #3 intacta. Este endpoint solo vuelve a
 * llamar a `generarAlias()` con el `alias_locale` que el perfil ya tiene; no
 * acepta ningún alias propuesto por el cliente.
 */
import type { APIRoute } from "astro";
import { leerSesionAdulto, COOKIE_ADULTO, leerCookies } from "../../lib/sesiones";
import { hogarIds } from "../../lib/familia";
import { generarAlias, type LocaleAlias } from "../../../../../packages/motor/src/alias";

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

const INTENTOS_ALIAS = 3;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env as Env | undefined;
  if (!env?.DB || !env?.SESSION_KV) return json({ error: "sin_bindings" }, 503);

  const sesion = await leerSesionAdulto(env.SESSION_KV, leerCookies(request.headers.get("cookie"))[COOKIE_ADULTO]);
  if (!sesion) return json({ error: "sin_sesion" }, 401);

  let body: { childId?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "cuerpo_ilegible" }, 400);
  }
  const childId = String(body.childId ?? "");
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
    `SELECT id, parent_user_id, alias_locale FROM child_profiles WHERE id = ? AND parent_user_id IN (${marcadores}) AND deleted_at IS NULL`,
  )
    .bind(childId, ...ids)
    .first()) as { id: string; parent_user_id: string; alias_locale: string } | null;
  if (!hijo) return json({ error: "hijo_fuera_del_hogar" }, 403);

  const ahora = Math.floor(Date.now() / 1000);
  let alias = "";
  let actualizado = false;
  for (let intento = 0; intento < INTENTOS_ALIAS && !actualizado; intento++) {
    alias = generarAlias(hijo.alias_locale as LocaleAlias).alias;
    try {
      await env.DB.prepare("UPDATE child_profiles SET alias = ?, updated_at = ? WHERE id = ? AND parent_user_id = ?")
        .bind(alias, ahora, childId, hijo.parent_user_id)
        .run();
      actualizado = true;
    } catch (e) {
      const msg = String((e as Error)?.message ?? "");
      if (!/UNIQUE/i.test(msg)) throw e;
    }
  }
  if (!actualizado) return json({ error: "alias_repetido:reintenta" }, 409);

  return json({ ok: true, alias });
};
