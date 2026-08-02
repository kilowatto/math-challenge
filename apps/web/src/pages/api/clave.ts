/**
 * `/api/clave` — cambiar la contraseña **estando dentro**. Issue #313.
 *
 * ─── Pide la contraseña ACTUAL, y la sesión no basta ───────────────────────
 *
 * Podría no pedirla: hay `mc_s` válida, así que quien pregunta ya demostró ser
 * el dueño. Y sería un error. La sesión dura 30 días (D-052) y vive en el
 * teléfono; quien toma un teléfono desbloqueado de la mesa tiene la sesión y no
 * tiene la contraseña. Si no se pidiera, ese alguien cambia la contraseña, la
 * víctima queda fuera de su propia cuenta, y **fuera de las cuentas de sus
 * hijos**.
 *
 * ─── Cambiarla cierra las demás sesiones ───────────────────────────────────
 *
 * Es la mitad que casi siempre falta. Cambiar la contraseña porque sospechas
 * que alguien entró no sirve de nada si la sesión de ese alguien sigue viva —
 * y las de este producto duran un mes.
 *
 * Aquí se hace de la única forma que KV permite sin listar: **se cierra la
 * sesión actual y se abre una nueva**, así que quien está cambiando la clave
 * sigue dentro y cualquier otro token que existiera queda huérfano. Un token
 * huérfano todavía apunta a un valor en KV hasta que expire, y eso es un
 * residuo real: **las otras sesiones no se invalidan al instante**, se quedan
 * hasta 30 días. Cerrarlas de verdad exige guardar la lista de tokens por
 * usuario, que es exactamente el dato que D-052 evita guardar.
 *
 * Está dicho aquí y no escondido, porque la diferencia entre «cerré las otras
 * sesiones» y «abrí una nueva» importa cuando alguien la usa por miedo.
 */
import type { APIRoute } from "astro";
import {
  COOKIE_ADULTO,
  leerCookies,
  leerSesionAdulto,
  cerrarSesionAdulto,
  abrirSesionAdulto,
} from "../../lib/sesiones";
import { hashear, verificar, LARGO_MINIMO, LARGO_MAXIMO } from "../../lib/passwords";

export const prerender = false;

interface Env {
  DB?: D1Database;
  SESSION_KV: KVNamespace;
}

const json = (cuerpo: unknown, status = 200, cookies: string[] = []) => {
  const h = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  for (const c of cookies) h.append("set-cookie", c);
  return new Response(JSON.stringify(cuerpo), { status, headers: h });
};

/** Cuenta puntos de código, no unidades UTF-16: un emoji es UN carácter. */
const largo = (s: string) => [...s].length;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env: Env } }).runtime?.env;
  if (!env?.SESSION_KV || !env.DB) return json({ error: "sin_bindings" }, 503);

  const token = leerCookies(request.headers.get("cookie"))[COOKIE_ADULTO];
  const sesion = await leerSesionAdulto(env.SESSION_KV, token);
  if (!sesion) return json({ error: "sin_sesion" }, 401);

  let cuerpo: { actual?: unknown; nueva?: unknown };
  try {
    cuerpo = (await request.json()) as { actual?: unknown; nueva?: unknown };
  } catch {
    return json({ error: "cuerpo_ilegible" }, 400);
  }
  const actual = typeof cuerpo.actual === "string" ? cuerpo.actual : "";
  const nueva = typeof cuerpo.nueva === "string" ? cuerpo.nueva : "";

  // NIST 800-63B: entre 8 y 64, sin reglas de composición. La longitud es lo
  // único que importa, y exigir un símbolo produce `Password1!` en todas partes.
  if (largo(nueva) < LARGO_MINIMO || largo(nueva) > LARGO_MAXIMO) {
    return json({ error: "clave_fuera_de_rango" }, 400);
  }
  // La misma de antes no es un cambio, y aceptarla en silencio deja a quien la
  // cambió por miedo creyendo que hizo algo.
  if (nueva === actual) return json({ error: "clave_igual" }, 400);

  const fila = await env.DB.prepare("SELECT password_hash FROM user_password WHERE user_id = ?")
    .bind(sesion.userId)
    .first<{ password_hash: string }>();

  // Quien entró con passkey y nunca puso contraseña no tiene fila. No se le
  // dice «no tienes contraseña» —eso es información sobre la cuenta— sino que
  // la actual no coincide, que es cierto: no coincide con ninguna.
  if (!fila) return json({ error: "credenciales" }, 403);

  const ok = await verificar(actual, fila.password_hash);
  if (!ok.ok) return json({ error: "credenciales" }, 403);

  const hash = await hashear(nueva);
  const ahora = Math.floor(Date.now() / 1000);
  await env.DB.prepare("UPDATE user_password SET password_hash = ?, updated_at = ? WHERE user_id = ?")
    .bind(hash, ahora, sesion.userId)
    .run();

  // La sesión se renueva: el token viejo se borra de KV y se emite otro. Ver el
  // encabezado sobre qué cubre esto y qué no.
  const fuera = await cerrarSesionAdulto(env.SESSION_KV, token);
  const { cookie } = await abrirSesionAdulto(env.SESSION_KV, {
    userId: sesion.userId,
    creadaEn: ahora,
    intent: sesion.intent,
  });

  return json({ ok: true }, 200, [fuera, cookie]);
};
