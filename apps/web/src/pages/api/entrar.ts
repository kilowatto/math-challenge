/**
 * `POST /api/entrar` — la puerta de vuelta. Criterio #112, D-038, D-052.
 *
 * ─── Un solo mensaje de error, y esa es la decisión que importa ────────────
 *
 * Correo desconocido y contraseña incorrecta devuelven **exactamente lo mismo**.
 * Distinguirlos convierte el formulario en un oráculo: cualquiera puede
 * preguntarle a la aplicación si una dirección tiene cuenta. En un producto para
 * familias eso es decir quién usa un producto infantil, que es la clase de dato
 * que `mc-25` protege.
 *
 * Y las dos ramas **cuestan lo mismo en CPU**. Cuando el correo no existe se
 * verifica igualmente contra un hash señuelo, porque si no, la rama del correo
 * desconocido volvería ~36 ms antes y el oráculo seguiría ahí, medible con un
 * cronómetro. Es la misma técnica que usa `/api/registro`, y por la misma razón.
 *
 * ─── Re-hashear cuando el trabajo sube ─────────────────────────────────────
 *
 * `verificar()` devuelve si el hash está desactualizado. **Este es el único
 * momento en que existe la contraseña en claro**, así que es el único momento en
 * que se puede re-hashear. Sin esto, subir `ITERACIONES` no protegería a nadie
 * que ya tuviera cuenta.
 */
import type { APIRoute } from "astro";
import { terminarMal } from "../../lib/respuesta-de-formulario";
import { ruta } from "../../i18n/rutas";
import { rutaCasa } from "../../lib/rutas-app";
import type { Locale } from "../../i18n";
import { verificar, hashear, largoValido } from "../../lib/passwords";
import { abrirSesionAdulto } from "../../lib/sesiones";
import { verificar as verificarTurnstile, CAMPO_TOKEN } from "../../lib/turnstile";
import { consultarLimite } from "../../lib/ratelimiter";

export const prerender = false;

interface Env {
  DB: D1Database;
  SESSION_KV: KVNamespace;
  TURNSTILE_SECRET_KEY?: string;
  /** El limitador de tasa (criterio #113). Turnstile NO es uno. */
  RATE_LIMITER?: DurableObjectNamespace;
  /** El embudo de activación. Mide al ADULTO, nunca a un niño (D-037). */
  FUNNEL_AE?: AnalyticsEngineDataset;
}

/**
 * Un hash real contra el que verificar cuando el correo no existe.
 *
 * Tiene que ser un hash VÁLIDO con el trabajo de hoy, no una cadena cualquiera:
 * `verificar()` sobre basura devuelve `false` de inmediato, sin derivar nada, y
 * entonces la rama del correo desconocido volvería a costar cero. Se genera una
 * vez por instancia del Worker.
 */
let senuelo: string | null = null;
async function hashSenuelo(): Promise<string> {
  if (!senuelo) senuelo = await hashear("contrasena senuelo que nadie usa jamas");
  return senuelo;
}

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * El error vuelve al FORMULARIO, no a una pantalla de JSON.
 *
 * Escribir mal la contraseña y recibir `{"ok":false,"motivo":"credenciales"}` a
 * pantalla completa es el mismo bug que el dueño encontró en el registro, con
 * peor cara: la persona no hizo nada raro y el producto le contesta con un
 * objeto. Ver `lib/respuesta-de-formulario.ts`.
 */
function error(request: Request, locale: Locale, motivo: string, estado = 400) {
  return terminarMal(request, ruta(locale, "entrar"), motivo, estado);
}

export const POST: APIRoute = async ({ request, locals }) => {
  // Arriba porque ahora también decide a dónde volver si algo falla.
  const locale = localeDelReferente(request.headers.get("referer"));
  const env = (locals as any).runtime?.env as Env | undefined;
  if (!env?.DB || !env?.SESSION_KV) return error(request, locale, "sin_bindings", 503);

  // Iniciar sesión escribe una sesión, y `early data` es replicable (RFC 8470).
  if (request.headers.get("early-data") === "1") return error(request, locale, "reintenta", 425);

  let correo = "", clave = "", token = "";
  try {
    const tipo = request.headers.get("content-type") ?? "";
    if (tipo.includes("application/json")) {
      const j = (await request.json()) as Record<string, unknown>;
      correo = String(j.correo ?? "");
      clave = String(j.clave ?? "");
      token = String(j[CAMPO_TOKEN] ?? "");
    } else {
      const f = await request.formData();
      correo = String(f.get("correo") ?? "");
      clave = String(f.get("clave") ?? "");
      token = String(f.get(CAMPO_TOKEN) ?? "");
    }
  } catch {
    return error(request, locale, "cuerpo_ilegible");
  }

  correo = correo.trim().toLowerCase();

  // Se comprueba la FORMA antes de Turnstile: no vale gastar una llamada de red
  // en un cuerpo que ya se sabe malformado.
  if (!CORREO.test(correo) || correo.length > 254) return error(request, locale, "credenciales");
  if (!largoValido(clave)) return error(request, locale, "credenciales");

  const veredicto = await verificarTurnstile(
    token,
    env.TURNSTILE_SECRET_KEY,
    request.headers.get("cf-connecting-ip"),
  );
  if (!veredicto.ok) {
    return error(request, locale, `turnstile:${veredicto.motivo}`, veredicto.motivo === "no_configurado" ? 503 : 403);
  }

  // ── El límite de tasa, DESPUÉS de Turnstile ──────────────────────────────
  // Ese orden importa: un bot que no pasa Turnstile no debe gastar una consulta
  // al Durable Object. Y Turnstile NO es un limitador — dice «esto parece una
  // persona», no «esta persona ya lo intentó cuarenta veces».
  const ip = request.headers.get("cf-connecting-ip") ?? "sin-ip";
  const limite = await consultarLimite(env.RATE_LIMITER, "entrar", ip);
  if (!limite.permitido) {
    // El `retry-after` se pierde en el camino del formulario a propósito: quien
    // ve la página de vuelta no lee cabeceras. Quien llame por `fetch` recibe
    // el 429 y puede volver a preguntarle al limitador.
    return terminarMal(request, ruta(locale, "entrar"), "demasiados_intentos", 429);
    // eslint-disable-next-line no-unreachable
    return new Response(JSON.stringify({ ok: false, motivo: "demasiados_intentos" }), {
      status: 429,
      headers: {
        "content-type": "application/json; charset=utf-8",
        // `Retry-After` en segundos: es lo que un cliente educado respeta, y lo
        // que convierte un 429 en información en vez de en una pared muda.
        "retry-after": String(limite.esperaS),
      },
    });
  }

  const fila = await env.DB.prepare(
    "SELECT u.id AS id, p.password_hash AS hash FROM users u LEFT JOIN user_password p ON p.user_id = u.id WHERE u.email = ?",
  )
    .bind(correo)
    .first<{ id: string; hash: string | null }>();

  // El señuelo cuando no hay fila o no hay contraseña —una cuenta que solo tiene
  // passkey, cuando esa vía exista—. Las dos ramas derivan, las dos tardan lo
  // mismo, y ninguna dice cuál ocurrió.
  const hash = fila?.hash ?? (await hashSenuelo());
  const r = await verificar(clave, hash);

  if (!fila?.hash || !r.ok) return error(request, locale, "credenciales", 401);

  // Único momento con la contraseña en claro: si el hash quedó por debajo del
  // trabajo de hoy, se re-escribe ahora o no se re-escribe nunca.
  if (r.desactualizado) {
    const nuevo = await hashear(clave);
    await env.DB.prepare("UPDATE user_password SET password_hash = ?, updated_at = ? WHERE user_id = ?")
      .bind(nuevo, Math.floor(Date.now() / 1000), fila.id)
      .run();
  }

  const { cookie } = await abrirSesionAdulto(env.SESSION_KV, {
    userId: fila.id,
    creadaEn: Math.floor(Date.now() / 1000),
    // La intención se observó al registrarse; iniciar sesión no la cambia.
    intent: null,
  });

  // Sin JavaScript, un `<form method="post">` espera una redirección. 303 y no
  // 302: obliga a seguir con GET, y con 302 algunos navegadores reenvían el POST
  // al pulsar «atrás» — aquí eso sería una segunda sesión abierta.
  const quiereJson = (request.headers.get("accept") ?? "").includes("application/json");
  if (!quiereJson) {
    // A la CASA, no a la pantalla de los niños. `/app/kids/` exige `mc_h` y sin
    // esa cookie rebotaba a un relleno — el adulto entraba y no llegaba a
    // ninguna parte (issue #311). El literal vive en `lib/rutas-app.ts`.
    const h = new Headers({ location: rutaCasa(locale) });
    h.append("set-cookie", cookie);
    return new Response(null, { status: 303, headers: h });
  }

  const h = new Headers({ "content-type": "application/json; charset=utf-8" });
  h.append("set-cookie", cookie);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: h });
};

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"] as const;
const esLocale = (v: string | undefined): v is Locale =>
  typeof v === "string" && (LOCALES as readonly string[]).includes(v);

function localeDelReferente(referer: string | null): Locale {
  if (!referer) return "en";
  try {
    const primero = new URL(referer).pathname.split("/").filter(Boolean)[0];
    // `includes` no estrecha el tipo por sí solo: hace falta el predicado, y sin
    // él TypeScript deja pasar cualquier cadena hacia `ruta()`, que sí exige un
    // locale de la lista.
    return esLocale(primero) ? primero : "en";
  } catch {
    return "en";
  }
}
