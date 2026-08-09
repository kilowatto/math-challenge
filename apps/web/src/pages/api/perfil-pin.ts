/**
 * `POST /api/perfil-pin` — el adulto fija o cambia el PIN de un hijo (D-197 §2).
 *
 * ─── La PRIMERA vez que algo en el repo escribe un `pin_hash` ──────────────
 *
 * `child_image_pin` existe desde la migración 0002 y `pin-imagenes.ts` ya
 * tiene toda la criptografía, pero hasta D-197 ningún archivo del repo lo
 * escribía jamás — `kids/pin.astro` deja pasar sin reto a cualquier perfil
 * sin PIN, un hueco que su propio encabezado documentaba. Este endpoint es
 * el primero que de verdad fija uno.
 *
 * ─── Band-aware: KINDER imágenes, el resto números ─────────────────────────
 *
 * La banda del perfil decide qué tipo de PIN acepta este endpoint — nunca lo
 * decide el cliente. Mandar `posiciones` para un perfil de PRIMARIA (o
 * `digitos` para uno de KINDER) se rechaza con `tipo_no_coincide`.
 */
import type { APIRoute } from "astro";
import { leerSesionAdulto, COOKIE_ADULTO, leerCookies } from "../../lib/sesiones";
import { hogarIds } from "../../lib/familia";
import { hashearPin, pinValido } from "../../../../../packages/motor/src/pin-imagenes";
import { hashearPinNumerico, pinNumericoValido } from "../../../../../packages/motor/src/pin-numerico";
import type { TemaVisual } from "../../lib/quien-juega-datos";

export const prerender = false;

interface Env {
  DB: D1Database;
  SESSION_KV: KVNamespace;
  PIN_PAD_SECRET?: string;
}

const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

/** KINDER usa imágenes; PRIMARIA/SECUNDARIA usan teclado numérico (D-197 §2). */
function tipoDePin(banda: TemaVisual): "imagenes" | "numerico" {
  return banda === "KINDER" ? "imagenes" : "numerico";
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env as Env | undefined;
  if (!env?.DB || !env?.SESSION_KV || !env?.PIN_PAD_SECRET) return json({ error: "sin_bindings" }, 503);

  const sesion = await leerSesionAdulto(env.SESSION_KV, leerCookies(request.headers.get("cookie"))[COOKIE_ADULTO]);
  if (!sesion) return json({ error: "sin_sesion" }, 401);

  let body: { childId?: unknown; posiciones?: unknown; digitos?: unknown };
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
    `SELECT id, theme_band FROM child_profiles WHERE id = ? AND parent_user_id IN (${marcadores}) AND deleted_at IS NULL`,
  )
    .bind(childId, ...ids)
    .first()) as { id: string; theme_band: TemaVisual } | null;
  if (!hijo) return json({ error: "hijo_fuera_del_hogar" }, 403);

  const tipo = tipoDePin(hijo.theme_band);

  let hash: string;
  if (tipo === "imagenes") {
    if (!Array.isArray(body.posiciones) || body.digitos !== undefined) {
      return json({ error: "tipo_no_coincide:imagenes" }, 422);
    }
    const posiciones = body.posiciones.map(Number);
    if (!pinValido(posiciones)) return json({ error: "pin_invalido" }, 422);
    hash = await hashearPin(env.PIN_PAD_SECRET, childId, posiciones);
  } else {
    if (!Array.isArray(body.digitos) || body.posiciones !== undefined) {
      return json({ error: "tipo_no_coincide:numerico" }, 422);
    }
    const digitos = body.digitos.map(Number);
    if (!pinNumericoValido(digitos)) return json({ error: "pin_invalido" }, 422);
    hash = await hashearPinNumerico(env.PIN_PAD_SECRET, childId, digitos);
  }

  const ahora = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    "INSERT INTO child_image_pin (child_profile_id, pin_hash, tipo, created_at, updated_at) VALUES (?, ?, ?, ?, ?) " +
      "ON CONFLICT (child_profile_id) DO UPDATE SET pin_hash = excluded.pin_hash, tipo = excluded.tipo, updated_at = excluded.updated_at",
  )
    .bind(childId, hash, tipo, ahora, ahora)
    .run();

  return json({ ok: true, tipo });
};
