/**
 * `POST /api/perfil-identidad` — el adulto fija/cambia su nombre y su
 * `@usuario` públicos (D-197, reversa puntual de D-003).
 *
 * Nunca toca `child_profiles` — el niño no gana estos campos bajo ninguna
 * circunstancia (D-013, línea roja #2, línea roja #3). Esto es
 * exclusivamente la identidad del ADULTO dueño de la sesión, nunca la de
 * otro id que llegue en el cuerpo — por eso no hay `userId` en el body.
 *
 * JSON-only: esta pantalla vive dentro del engrane de `QuienJuegaScene`
 * (Phaser), que ya requiere JavaScript para existir — a diferencia de
 * `perfil-nuevo.ts`, no hay una versión HTML de este ajuste que progresar.
 */
import type { APIRoute } from "astro";
import { leerSesionAdulto, COOKIE_ADULTO, leerCookies } from "../../lib/sesiones";
import { validarDisplayName, validarUsername } from "../../../../../packages/motor/src/identidad-adulto";

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

  let body: { displayName?: unknown; username?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "cuerpo_ilegible" }, 400);
  }

  const displayName = String(body.displayName ?? "").trim();
  // El `@` es un adorno de presentación — nunca se guarda como parte del valor.
  const username = String(body.username ?? "").trim().replace(/^@/, "").toLowerCase();

  const vDisplay = validarDisplayName(displayName);
  if (!vDisplay.valido) return json({ error: `nombre_invalido:${vDisplay.razon}` }, 422);

  const vUser = validarUsername(username);
  if (!vUser.valido) return json({ error: `usuario_invalido:${vUser.razon}` }, 422);

  const choque = await env.DB.prepare(
    "SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id <> ? AND deleted_at IS NULL",
  )
    .bind(username, sesion.userId)
    .first();
  if (choque) return json({ error: "usuario_repetido" }, 409);

  await env.DB.prepare("UPDATE users SET display_name = ?, username = ?, updated_at = ? WHERE id = ?")
    .bind(displayName, username, Math.floor(Date.now() / 1000), sesion.userId)
    .run();

  return json({ ok: true, displayName, username });
};
