/**
 * `POST /api/marca` — el descarte de una marca contextual. Criterio #121.
 *
 * Guarda **qué hizo la persona**, no solo que la cerró: `ACEPTO`, `RECHAZO` o
 * `CERRO`. Las tres son respuestas distintas, y tratarlas igual es cómo se acaba
 * insistiendo con algo que alguien ya rechazó.
 *
 * `contextual_marks` tiene `PRIMARY KEY (user_id, mark_code)`, así que una marca
 * se registra una vez. El `INSERT OR IGNORE` es lo que hace que pulsar dos veces
 * —o volver atrás y volver a pulsar— no reviente en la cara de nadie.
 */
import type { APIRoute } from "astro";
import { leerSesionAdulto, COOKIE_ADULTO, leerCookies } from "../../lib/sesiones";

export const prerender = false;

/** Los cinco códigos del CHECK de la migración 0003. Lista cerrada. */
const CODIGOS = new Set([
  "PRIMER_PERFIL", "PRIMER_RETO", "LIMITE_PANTALLA", "TABLERO_OPTIN", "SEGUNDO_DISPOSITIVO",
]);
const RESPUESTAS = new Set(["ACEPTO", "RECHAZO", "CERRO"]);

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const env = (locals as any).runtime?.env;
  if (!env?.DB || !env?.SESSION_KV) return new Response(null, { status: 503 });

  // Una marca cuelga de un adulto con sesión. Sin ella no hay a quién anotarle
  // nada — y anotarlo a nadie sería una fila huérfana en una tabla que existe
  // precisamente para saber a quién ya no volver a molestar.
  const sesion = await leerSesionAdulto(
    env.SESSION_KV,
    leerCookies(request.headers.get("cookie"))[COOKIE_ADULTO],
  );
  if (!sesion) return new Response(null, { status: 401 });

  const f = await request.formData().catch(() => null);
  const codigo = String(f?.get("codigo") ?? "");
  const respuesta = String(f?.get("respuesta") ?? "CERRO");
  if (!CODIGOS.has(codigo) || !RESPUESTAS.has(respuesta)) {
    return new Response(null, { status: 400 });
  }

  await env.DB.prepare(
    "INSERT OR IGNORE INTO contextual_marks (user_id, mark_code, shown_at, outcome) VALUES (?, ?, ?, ?)",
  )
    .bind(sesion.userId, codigo, Math.floor(Date.now() / 1000), respuesta)
    .run();

  // Sin JavaScript, un formulario espera volver a donde estaba. 303 para que el
  // navegador siga con GET y no reenvíe el POST al pulsar «atrás».
  const volver = request.headers.get("referer");
  return redirect(volver && volver.startsWith("https://") ? volver : "/", 303);
};
