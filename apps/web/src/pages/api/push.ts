/**
 * `/api/push` — la suscripción del recordatorio, del ADULTO (F7 #207, D-105).
 *
 * Acciones, todas exigiendo `mc_s` (la sesión del adulto):
 *
 *   · **`?accion=estado`** — ¿tiene la cuenta suscripciones? ¿está silenciado?
 *     ¿hay clave VAPID instalada? Es lo que la superficie necesita para pintar
 *     su estado inicial.
 *   · **`?accion=clave`** — la clave pública VAPID, para
 *     `pushManager.subscribe({ applicationServerKey })`. Es pública por
 *     diseño; la PRIVADA es el secreto y nunca sale del Worker.
 *   · **`?accion=suscribir`** — guarda el endpoint y las claves del navegador.
 *     **No limpia el silencio**: volver a suscribirse no es des-silenciar
 *     (D-026 — lo descartado no reaparece, y reactivarlo «de paso» sería
 *     reactivación sin acción explícita, exactamente lo que el criterio de
 *     aceptación #5 prohíbe).
 *   · **`?accion=baja`** — borra UNA suscripción (este aparato). No silencia:
 *     la baja es técnica, el silencio es una decisión.
 *   · **`?accion=silencio`** — apaga el recordatorio PARA SIEMPRE, en un
 *     toque. No se vuelve a preguntar: no hay ruta que limpie `silenciado_at`
 *     y no hay superficie que ofrezca reactivarlo (mc-19 rec. #4: el opt-out
 *     fácil es lo que evita el opt-out nuclear).
 *
 * ─── El niño no existe en esta ruta ────────────────────────────────────────
 *
 * El destinatario es siempre la cuenta de la sesión (`sesion.userId`). No hay
 * parámetro de perfil de niño, ni de id, ni indirecto — es el criterio de
 * aceptación #1 del issue y `audits/recordatorio-sin-culpa.mjs` lo verifica
 * de forma estática. La suscripción vive en el área de adulto y un niño no
 * tiene sesión de adulto: sin `mc_s` la respuesta es 401 y nada más.
 */
import type { APIRoute } from "astro";
import {
  COOKIE_ADULTO,
  leerCookies,
  leerSesionAdulto,
  nuevoToken,
} from "../../lib/sesiones";

export const prerender = false;

interface Env {
  DB?: D1Database;
  SESSION_KV: KVNamespace;
  VAPID_PUBLIC_KEY?: string;
}

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // La respuesta depende de la cookie de sesión: jamás se cachea.
      "cache-control": "no-store",
      vary: "Cookie",
    },
  });

/** Un endpoint de push es una URL https razonable. Nada más se acepta. */
function esEndpointValido(valor: unknown): valor is string {
  if (typeof valor !== "string" || valor.length > 512) return false;
  try {
    return new URL(valor).protocol === "https:";
  } catch {
    return false;
  }
}

/** Una clave del par del suscriptor: base64url corta, sin sorpresas. */
function esClaveValida(valor: unknown): valor is string {
  return typeof valor === "string" && /^[A-Za-z0-9_-]{8,256}$/.test(valor);
}

export const POST: APIRoute = async ({ request, locals, url }) => {
  const env = (locals as { runtime?: { env: Env } }).runtime?.env;
  if (!env?.SESSION_KV) return json({ error: "sin_bindings" }, 503);

  const cookies = leerCookies(request.headers.get("cookie"));
  const sesion = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!sesion) return json({ error: "sin_sesion" }, 401);

  const accion = url.searchParams.get("accion");

  if (accion === "estado") {
    if (!env.DB) return json({ error: "sin_base" }, 503);
    const subs = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM push_subscription WHERE user_id = ?",
    )
      .bind(sesion.userId)
      .first<{ n: number }>();
    const rec = await env.DB.prepare(
      "SELECT silenciado_at FROM push_recordatorio WHERE user_id = ?",
    )
      .bind(sesion.userId)
      .first<{ silenciado_at: number | null }>();
    return json({
      suscripciones: subs?.n ?? 0,
      silenciado: rec?.silenciado_at != null,
      // Si el servidor no tiene VAPID instalado, la superficie NO ofrece el
      // botón de activar: prometer un recordatorio que no puede salir es el
      // peor estado posible (mc-19 impl. 11).
      vapidListo: Boolean(env.VAPID_PUBLIC_KEY),
    });
  }

  if (accion === "clave") {
    // Sin clave instalada, `null` — el cliente degrada, no explota.
    return json({ clavePublica: env.VAPID_PUBLIC_KEY ?? null });
  }

  if (accion === "suscribir") {
    if (!env.DB) return json({ error: "sin_base" }, 503);
    let cuerpo: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
    try {
      cuerpo = await request.json();
    } catch {
      return json({ error: "cuerpo_invalido" }, 400);
    }
    const { endpoint, keys } = cuerpo;
    if (!esEndpointValido(endpoint) || !esClaveValida(keys?.p256dh) || !esClaveValida(keys?.auth)) {
      return json({ error: "suscripcion_invalida" }, 400);
    }
    const ahora = Date.now();
    // El endpoint es UNIQUE: re-suscribir el mismo aparato actualiza la fila
    // en vez de duplicarla. **`silenciado_at` no se toca aquí ni en ningún
    // sitio** — es la mitad escrita de «el silencio es permanente».
    await env.DB.prepare(
      `INSERT INTO push_subscription (id, user_id, endpoint, p256dh, auth, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(endpoint) DO UPDATE SET
         p256dh = excluded.p256dh,
         auth = excluded.auth,
         updated_at = excluded.updated_at`,
    )
      .bind(nuevoToken(), sesion.userId, endpoint, keys!.p256dh, keys!.auth, ahora, ahora)
      .run();
    return json({ ok: true });
  }

  if (accion === "baja") {
    if (!env.DB) return json({ error: "sin_base" }, 503);
    let cuerpo: { endpoint?: unknown };
    try {
      cuerpo = await request.json();
    } catch {
      return json({ error: "cuerpo_invalido" }, 400);
    }
    if (!esEndpointValido(cuerpo.endpoint)) return json({ error: "suscripcion_invalida" }, 400);
    // Solo las de la propia cuenta: el endpoint es el identificador y la
    // sesión es la frontera.
    await env.DB.prepare(
      "DELETE FROM push_subscription WHERE endpoint = ? AND user_id = ?",
    )
      .bind(cuerpo.endpoint, sesion.userId)
      .run();
    return json({ ok: true });
  }

  if (accion === "silencio") {
    if (!env.DB) return json({ error: "sin_base" }, 503);
    const ahora = Date.now();
    // Un toque y para siempre (D-026). Solo se PONE; ninguna ruta lo limpia.
    // `audits/recordatorio-sin-culpa.mjs` comprueba que esta sea la única
    // escritura de `silenciado_at` en el repositorio.
    await env.DB.prepare(
      `INSERT INTO push_recordatorio (user_id, silenciado_at, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         silenciado_at = excluded.silenciado_at,
         updated_at = excluded.updated_at`,
    )
      .bind(sesion.userId, ahora, ahora)
      .run();
    return json({ ok: true });
  }

  return json({ error: "accion_desconocida" }, 400);
};
