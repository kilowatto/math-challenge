/**
 * `POST /api/perfil-idioma` — el adulto cambia el idioma de práctica de un
 * hijo (D-197 §4).
 *
 * Regenera el alias en el nuevo idioma. El alias está armado con palabras
 * autoradas de UN locale (mc-34: "einundzwanzig" no es una traducción de
 * "veintiuno", es otra forma de nombrarlo) — dejar el alias viejo dejaría un
 * perfil en francés con un alias hecho de palabras en alemán. El dueño lo
 * confirmó explícito viendo el conflicto (D-197).
 *
 * `alias_locale` y `locale` cambian juntos: hoy son siempre el mismo valor
 * para un perfil de hijo (a diferencia de `users`, donde podrían divergir),
 * así que no hay razón para que este ajuste los separe.
 */
import type { APIRoute } from "astro";
import { leerSesionAdulto, COOKIE_ADULTO, leerCookies } from "../../lib/sesiones";
import { hogarIds } from "../../lib/familia";
import { generarAlias, type LocaleAlias } from "../../../../../packages/motor/src/alias";
import { LOCALES } from "../../i18n";

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

  let body: { childId?: unknown; locale?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "cuerpo_ilegible" }, 400);
  }
  const childId = String(body.childId ?? "");
  const locale = String(body.locale ?? "");
  if (!childId) return json({ error: "hijo_invalido" }, 400);
  if (!(LOCALES as readonly string[]).includes(locale)) return json({ error: "locale_invalido" }, 400);

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
    `SELECT id, parent_user_id FROM child_profiles WHERE id = ? AND parent_user_id IN (${marcadores}) AND deleted_at IS NULL`,
  )
    .bind(childId, ...ids)
    .first()) as { id: string; parent_user_id: string } | null;
  if (!hijo) return json({ error: "hijo_fuera_del_hogar" }, 403);

  // Mismo reintento que `perfil-nuevo.ts`: `idx_alias_por_padre` es
  // UNIQUE(parent_user_id, alias) — se reintenta con el DUEÑO real de la
  // fila, no con quien hizo la petición (pueden ser dos adultos distintos
  // del mismo hogar).
  const ahora = Math.floor(Date.now() / 1000);
  let alias = "";
  let actualizado = false;
  for (let intento = 0; intento < INTENTOS_ALIAS && !actualizado; intento++) {
    alias = generarAlias(locale as LocaleAlias).alias;
    try {
      await env.DB.prepare(
        "UPDATE child_profiles SET locale = ?, alias_locale = ?, alias = ?, updated_at = ? WHERE id = ? AND parent_user_id = ?",
      )
        .bind(locale, locale, alias, ahora, childId, hijo.parent_user_id)
        .run();
      actualizado = true;
    } catch (e) {
      const msg = String((e as Error)?.message ?? "");
      if (!/UNIQUE/i.test(msg)) throw e;
    }
  }
  if (!actualizado) return json({ error: "alias_repetido:reintenta" }, 409);

  return json({ ok: true, locale, alias });
};
