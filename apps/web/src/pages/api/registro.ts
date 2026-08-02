/**
 * `POST /api/registro` — nace la cuenta de un ADULTO. Criterios #111, #112, #113.
 *
 * ─── Lo que este endpoint no acepta, aunque se lo manden ───────────────────
 *
 * **Nada de un niño.** No hay campo para el nombre del hijo, ni para su edad, ni
 * para su foto. El perfil del niño se crea después, en su propia pantalla, y ni
 * ahí se pide nombre real ni fecha de nacimiento (línea roja #2). Si alguien
 * manda esos campos por curl, se ignoran: no se leen del cuerpo.
 *
 * **Ningún campo que el formulario no tenga.** Se leen exactamente tres cosas —
 * correo, contraseña e intención— y la intención no la escribe nadie: viene del
 * `hidden` que la puerta puso, y se valida contra la lista cerrada. Un `intent`
 * inventado no crea una cuenta con un rol raro; falla.
 *
 * ─── Las tres cosas que hace, en orden, y por qué ese orden ────────────────
 *
 *  1. Valida. Barato, y sin tocar la base.
 *  2. **Hashea antes de consultar si el correo existe.** Ver `MISMO_TIEMPO`.
 *  3. Escribe usuario + contraseña, abre sesión, responde con `Set-Cookie`.
 *
 * ─── Por qué la respuesta no dice si el correo ya existía ──────────────────
 *
 * Un "ese correo ya está registrado" convierte el formulario en un oráculo:
 * cualquiera puede preguntarle a la aplicación si una dirección tiene cuenta.
 * En un producto para familias eso es decir quién usa un producto infantil, que
 * es exactamente el tipo de dato que `mc-25` protege.
 *
 * Así que las dos ramas —correo nuevo y correo repetido— devuelven **la misma
 * forma de respuesta**, y las dos pagan el mismo costo de CPU: el hash se
 * calcula SIEMPRE, incluso cuando ya se sabe que no se va a guardar. Sin eso, la
 * rama del correo repetido volvería 36 ms antes y el oráculo seguiría ahí,
 * medible con un cronómetro.
 *
 * Lo que sí ocurre es distinto: al correo nuevo se le abre sesión; al repetido,
 * no. Quien ya tiene cuenta recibe la misma pantalla y un correo —cuando el
 * envío exista— diciéndole que alguien intentó registrarse con su dirección.
 */
import type { APIRoute } from "astro";
import { terminarBien, terminarMal } from "../../lib/respuesta-de-formulario";
import { rutaPerfilNuevo } from "../../lib/rutas-app";
import { ruta } from "../../i18n/rutas";
import type { Locale } from "../../i18n";
import { hashear, largoValido, LARGO_MINIMO, LARGO_MAXIMO } from "../../lib/passwords";
import { abrirSesionAdulto } from "../../lib/sesiones";
import { verificar as verificarTurnstile, CAMPO_TOKEN } from "../../lib/turnstile";
import { consultarLimite } from "../../lib/ratelimiter";
import { anotarPaso } from "../../lib/embudo";

export const prerender = false;

/** Las tres puertas de D-026. Cerrada a propósito: coincide con el CHECK de 0003. */
const INTENCIONES = new Set(["PADRE", "MAESTRO", "ADULTO_APRENDE"]);

/**
 * Validación de correo deliberadamente laxa.
 *
 * No se valida el correo con una expresión regular estricta, y eso es una
 * decisión, no una omisión: las direcciones válidas del mundo real son mucho más
 * raras que cualquier regex razonable, y rechazar una dirección legítima en el
 * primer campo de un formulario de dos es el peor sitio posible para
 * equivocarse. Se exige lo mínimo indiscutible —una arroba con algo a cada lado,
 * sin espacios— y la verificación de verdad la hace el correo que se envía.
 */
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Env {
  DB: D1Database;
  SESSION_KV: KVNamespace;
  /** Secreto de Turnstile. Se sube con `wrangler secret put`, nunca se commitea. */
  TURNSTILE_SECRET_KEY?: string;
  /** El limitador de tasa (criterio #113). Turnstile NO es uno. */
  RATE_LIMITER?: DurableObjectNamespace;
  /** El embudo de activación. Mide al ADULTO, nunca a un niño (D-037). */
  FUNNEL_AE?: AnalyticsEngineDataset;
}

/**
 * Respuesta común. Nunca dice si el correo existía (ver el encabezado).
 *
 * Redirige si vino de un `<form>` y devuelve JSON si vino de `fetch`. Antes
 * devolvía JSON siempre, y el dueño creó una cuenta en su teléfono y se quedó
 * mirando `{"ok":true}` a pantalla completa, sin siguiente paso ni forma de
 * volver. El registro había funcionado. El producto estaba roto igual.
 * Ver `lib/respuesta-de-formulario.ts`.
 */
function respuesta(request: Request, locale: Locale, cookies: string[] = []) {
  // A crear el perfil del hijo, que es lo único que tiene sentido hacer justo
  // después de registrarse como padre.
  return terminarBien(request, rutaPerfilNuevo(locale), cookies);
}

function error(request: Request, locale: Locale, motivo: string, estado = 400) {
  return terminarMal(request, ruta(locale, "registro-padre"), motivo, estado);
}

export const POST: APIRoute = async ({ request, locals }) => {
  // El locale se calcula ARRIBA porque ahora también decide a dónde volver
  // cuando algo falla; antes solo se usaba para la fila de `users`.
  const locale = localeDelReferente(request.headers.get("referer"));
  const env = (locals as any).runtime?.env as Env | undefined;
  if (!env?.DB || !env?.SESSION_KV) return error(request, locale, "sin_bindings", 503);

  // ── 0-RTT y por qué este endpoint lo rechaza ──────────────────────────────
  //
  // La zona tiene 0-RTT activo (verificado en `audits/live.mjs`: «0-RTT activo,
  // max early data 14336»), y eso es bueno: ahorra un viaje completo de red en
  // el dispositivo de referencia, un Android de gama baja sobre 4G lento.
  //
  // Pero **early data es replicable por diseño**. Un atacante en la ruta puede
  // capturar los bytes del 0-RTT y reenviarlos; TLS 1.3 no lo impide, y la RFC
  // 8470 dice literalmente que el servidor no debe procesar en early data nada
  // que no sea idempotente. Crear una cuenta no lo es.
  //
  // Cloudflare marca esas peticiones con `Early-Data: 1`. Se responde **425 Too
  // Early**, que es el código que la RFC 8470 define para esto: el navegador
  // reintenta solo, ya con el apretón de manos completo, y el usuario no ve
  // nada. Se pierde el ahorro de un viaje en la ÚNICA petición del registro que
  // escribe; el resto del sitio —que es todo lectura— lo conserva entero.
  if (request.headers.get("early-data") === "1") {
    // 425 «Too Early» para quien llame por `fetch`; para un formulario, de
    // vuelta a la página con el motivo. Los dos caminos los decide `terminarMal`.
    return terminarMal(request, ruta(locale, "registro-padre"), "reintenta", 425);
  }

  // Se acepta `application/x-www-form-urlencoded` porque el formulario funciona
  // SIN JavaScript: `<form method="post">` manda eso, y `mc-33` documenta que
  // el JavaScript falla más de lo que nadie cree en el dispositivo de
  // referencia. JSON se acepta además, para el camino con script.
  let correo = "", clave = "", intent = "", tokenTurnstile = "";
  const tipo = request.headers.get("content-type") ?? "";
  try {
    if (tipo.includes("application/json")) {
      const j = (await request.json()) as Record<string, unknown>;
      correo = String(j.correo ?? "");
      clave = String(j.clave ?? "");
      intent = String(j.intent ?? "");
      tokenTurnstile = String(j[CAMPO_TOKEN] ?? "");
    } else {
      const f = await request.formData();
      correo = String(f.get("correo") ?? "");
      clave = String(f.get("clave") ?? "");
      intent = String(f.get("intent") ?? "");
      tokenTurnstile = String(f.get(CAMPO_TOKEN) ?? "");
    }
  } catch {
    return error(request, locale, "cuerpo_ilegible");
  }

  correo = correo.trim().toLowerCase();
  if (!CORREO.test(correo) || correo.length > 254) return error(request, locale, "correo_invalido");
  if (!INTENCIONES.has(intent)) return error(request, locale, "intencion_invalida");
  if (!largoValido(clave)) {
    return error(request, locale, `clave_fuera_de_rango:${LARGO_MINIMO}-${LARGO_MAXIMO}`);
  }

  // ── Turnstile, y falla CERRADO ────────────────────────────────────────────
  //
  // Se verifica DESPUÉS de validar la forma del cuerpo —no vale la pena gastar
  // una llamada de red en algo que ya se sabe malformado— y ANTES de hashear,
  // porque hashear cuesta 36 ms de CPU y un bot no debería costarnos eso.
  //
  // Sin `TURNSTILE_SECRET_KEY` configurado se RECHAZA. Seguir sin comprobar
  // sería el modo que D-032 nombra por su nombre: una defensa que se apaga sola
  // cuando falta su llave no es una defensa, es un adorno. Hoy el costo de
  // fallar cerrado es cero —el registro no ha salido— y obliga a que la llave
  // esté puesta antes del lanzamiento.
  //
  // `CF-Connecting-IP` la pone el borde y el cliente NO puede falsificarla, a
  // diferencia de `X-Forwarded-For`, que cualquiera puede escribir.
  const veredicto = await verificarTurnstile(
    tokenTurnstile,
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
  const limite = await consultarLimite(env.RATE_LIMITER, "registro", ip);
  if (!limite.permitido) {
    // Se pierde el `retry-after` en el camino del formulario, y es deliberado:
    // una persona que ve la página de vuelta con «demasiados intentos» no lee
    // cabeceras. Quien llame por `fetch` recibe el 429 y puede volver a
    // preguntarle al limitador cuánto falta.
    return terminarMal(request, ruta(locale, "registro-padre"), "demasiados_intentos", 429);
  }

  // ── MISMO_TIEMPO ──────────────────────────────────────────────────────────
  // El hash se calcula ANTES de mirar si el correo existe, y se calcula siempre.
  // Es lo que hace que las dos ramas cuesten lo mismo. Invertir estas dos líneas
  // —consultar primero y hashear solo si hace falta— reabre el oráculo de
  // enumeración de cuentas con una diferencia de ~36 ms, medible por la red.
  const hash = await hashear(clave);

  const ya = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(correo)
    .first<{ id: string }>();

  if (ya) {
    // Misma forma, mismo costo, ninguna sesión. Quien ya tiene cuenta no
    // aprende nada nuevo, y quien está probando direcciones tampoco.
    return respuesta(request, locale);
  }

  const ahora = Math.floor(Date.now() / 1000);
  const userId = crypto.randomUUID();

  // Los cuatro datos derivados de la petición, ninguno preguntado (migración
  // 0003). Cloudflare ya sabe el país y la zona horaria de quien se registra;
  // preguntárselos sería cobrarle un campo por un dato que ya tenemos.
  const cf = (request as any).cf as { country?: string; timezone?: string } | undefined;
  const pais = typeof cf?.country === "string" ? cf.country : null;
  const zona = typeof cf?.timezone === "string" ? cf.timezone : null;
  // `EU` manda a la base europea (D-042). Se deriva del país y **una vez escrita
  // no se cambia sola**: mover datos de menores entre jurisdicciones es un
  // problema legal, no técnico.
  const region = pais && PAISES_UE.has(pais) ? "EU" : "GLOBAL";

  // El locale sale de la URL de la que vino el formulario, no de
  // `Accept-Language`: si alguien está leyendo la puerta en alemán, su cuenta
  // nace en alemán aunque su teléfono esté en inglés.
  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO users (id, email, email_verified, locale, is_learner, created_at, updated_at, country, timezone, data_region, signup_intent) " +
        "VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).bind(userId, correo, locale, intent === "ADULTO_APRENDE" ? 1 : 0, ahora, ahora, pais, zona, region, intent),
    env.DB.prepare(
      "INSERT INTO user_password (user_id, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?)",
    ).bind(userId, hash, ahora, ahora),
  ]);

  const { cookie } = await abrirSesionAdulto(env.SESSION_KV, {
    userId,
    creadaEn: ahora,
    intent: intent as "PADRE" | "MAESTRO" | "ADULTO_APRENDE",
  });

  // El embudo: un adulto creó una cuenta. Sin identificador de nadie — ver
  // `lib/embudo.ts`. No lanza, así que no puede impedir el registro.
  anotarPaso(env.FUNNEL_AE, "registro", { pais, locale, intent });

  return respuesta(request, locale, [cookie]);
};

/**
 * Los 27 de la Unión Europea, para `data_region` (D-042).
 *
 * No incluye Reino Unido —salió— ni Suiza ni Noruega, que tienen sus propios
 * regímenes. Es una lista de países, no una geolocalización: `mc-25` distingue
 * las dos cosas, y aquí solo se usa para decidir en qué base vive el dato.
 */
const PAISES_UE = new Set([
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HR",
  "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK",
]);

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"] as const;
const esLocale = (v: string | undefined): v is Locale =>
  typeof v === "string" && (LOCALES as readonly string[]).includes(v);

/**
 * El locale de la página desde la que se envió el formulario.
 *
 * Se lee del `Referer`, que puede faltar o venir manipulado — por eso se valida
 * contra la lista cerrada y cae a `en` si no coincide. Un locale inventado en
 * `users.locale` rompería el CHECK de la migración 0001 y tiraría el registro
 * entero por un encabezado que nadie controla.
 */
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
