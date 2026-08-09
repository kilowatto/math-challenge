/**
 * `POST /api/perfil-nivel` — el adulto cambia el nivel de arranque
 * (KINDER/PRIMARIA/SECUNDARIA) de un hijo, después de la creación (D-197 §5).
 *
 * Mismo margen ±1 que ya usa `perfil-nuevo.ts` al crear el perfil
 * (`temaPermitido`/`temasPermitidos`, `packages/motor/src/bandas.ts`) —
 * esta pantalla reusa la regla, no inventa una nueva. Caso que motivó la
 * pregunta: un niño de 1º de primaria (banda derivada PRIMARIA) que necesita
 * reforzar KINDER — `temasPermitidos("PRIMARIA")` ya incluye KINDER, así que
 * este caso funciona sin ampliar el margen.
 */
import type { APIRoute } from "astro";
import { leerSesionAdulto, COOKIE_ADULTO, leerCookies } from "../../lib/sesiones";
import { hogarIds } from "../../lib/familia";
import { temaPorEdad, temaPermitido, edadDesdeAnio, type TemaVisual } from "../../../../../packages/motor/src/bandas";

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

  let body: { childId?: unknown; banda?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "cuerpo_ilegible" }, 400);
  }
  const childId = String(body.childId ?? "");
  const bandaPedida = String(body.banda ?? "");
  if (!childId) return json({ error: "hijo_invalido" }, 400);
  if (!["KINDER", "PRIMARIA", "SECUNDARIA"].includes(bandaPedida)) {
    return json({ error: "banda_invalida" }, 400);
  }

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
    `SELECT id, parent_user_id, birth_year FROM child_profiles WHERE id = ? AND parent_user_id IN (${marcadores}) AND deleted_at IS NULL`,
  )
    .bind(childId, ...ids)
    .first()) as { id: string; parent_user_id: string; birth_year: number } | null;
  if (!hijo) return json({ error: "hijo_fuera_del_hogar" }, 403);

  const anioActual = new Date().getUTCFullYear();
  // `birth_year = 0` significa "no se preguntó" (ver `perfil-nuevo.ts`) — la
  // banda derivada más segura ante esa falta de dato sigue siendo KINDER.
  const derivado: TemaVisual = hijo.birth_year
    ? temaPorEdad(edadDesdeAnio(hijo.birth_year, anioActual))
    : "KINDER";

  if (!temaPermitido(derivado, bandaPedida as TemaVisual)) {
    return json({ error: "banda_fuera_de_margen", derivado }, 422);
  }

  await env.DB.prepare("UPDATE child_profiles SET theme_band = ?, updated_at = ? WHERE id = ? AND parent_user_id = ?")
    .bind(bandaPedida, Math.floor(Date.now() / 1000), childId, hijo.parent_user_id)
    .run();

  return json({ ok: true, banda: bandaPedida });
};
