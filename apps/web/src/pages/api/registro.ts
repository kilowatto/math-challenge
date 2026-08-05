/**
 * `POST /api/registro` — nace la cuenta de un ADULTO. Criterios #111, #112, #113.
 *
 * ─── D-082: una sola alta, y siempre nace en modo solo ─────────────────────
 *
 * Antes de #390 había tres puertas simétricas y la que usaste decidía dos
 * cosas: qué se insertaba (`is_learner`) y a dónde aterrizabas. D-082 lo
 * elimina: **toda cuenta nace con `is_learner = 1`** y aterriza en la casa del
 * adulto; «agregar un hijo» y «crear un salón» son acciones que se toman
 * después, desde dentro, nunca una elección en la puerta.
 *
 * Lo que la puerta sí deja es `signup_intent`: el `hidden` del formulario dice
 * por qué CTA de marketing entró la persona. Es **dato de embudo** (D-037) y
 * nada más — no condiciona el INSERT ni el aterrizaje, y por eso es opcional:
 * una alta sin `intent` es igual de válida. La escritura vive en
 * `lib/registro-nucleo.ts`, que es quien tiene la prueba.
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
 * inventado no crea una cuenta con un dato raro; falla.
 *
 * ─── Las tres cosas que hace, en orden, y por qué ese orden ────────────────
 *
 *  1. Valida. Barato, y sin tocar la base.
 *  2. Turnstile y el limitador de tasa, en ese orden (abajo, el porqué).
 *  3. El núcleo escribe usuario + contraseña, abre sesión, anota el embudo.
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
 * calcula SIEMPRE en el núcleo (`MISMO_TIEMPO`), incluso cuando ya se sabe que
 * no se va a guardar. Sin eso, la rama del correo repetido volvería 36 ms antes
 * y el oráculo seguiría ahí, medible con un cronómetro.
 *
 * Lo que sí ocurre es distinto: al correo nuevo se le abre sesión; al repetido,
 * no. Quien ya tiene cuenta recibe la misma pantalla y un correo —cuando el
 * envío exista— diciéndole que alguien intentó registrarse con su dirección.
 */
import type { APIRoute } from "astro";
import { terminarBien, terminarMal } from "../../lib/respuesta-de-formulario";
import { rutaCasa } from "../../lib/rutas-app";
import { ruta } from "../../i18n/rutas";
import type { Locale } from "../../i18n";
import { largoValido, LARGO_MINIMO, LARGO_MAXIMO } from "../../lib/passwords";
import { verificar as verificarTurnstile, CAMPO_TOKEN } from "../../lib/turnstile";
import { consultarLimite } from "../../lib/ratelimiter";
import { intentDeFormulario, registrarCuentaNueva } from "../../lib/registro-nucleo";

export const prerender = false;

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
 * El aterrizaje es la CASA del adulto (D-082): la pantalla del aprendiz solo,
 * con «agregar un hijo» y «crear un salón» como acciones opcionales. Antes se
 * aterrizaba en `perfil-nuevo` — crear el perfil del hijo como primer paso—,
 * que es exactamente la bifurcación que la decisión elimina.
 *
 * Redirige si vino de un `<form>` y devuelve JSON si vino de `fetch`. Antes
 * devolvía JSON siempre, y el dueño creó una cuenta en su teléfono y se quedó
 * mirando `{"ok":true}` a pantalla completa, sin siguiente paso ni forma de
 * volver. El registro había funcionado. El producto estaba roto igual.
 * Ver `lib/respuesta-de-formulario.ts`.
 */
function respuesta(request: Request, locale: Locale, cookies: string[] = []) {
  return terminarBien(request, rutaCasa(locale), cookies);
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
  // La intención es opcional (es telemetría, no una elección), pero si viene
  // tiene que ser de la lista cerrada — ver `lib/registro-nucleo.ts`.
  const intencion = intentDeFormulario(intent);
  if (!intencion.ok) return error(request, locale, "intencion_invalida");
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

  // Los cuatro datos derivados de la petición, ninguno preguntado (migración
  // 0003). Cloudflare ya sabe el país y la zona horaria de quien se registra;
  // preguntárselos sería cobrarle un campo por un dato que ya tenemos.
  const cf = (request as any).cf as { country?: string; timezone?: string } | undefined;
  const pais = typeof cf?.country === "string" ? cf.country : null;
  const zona = typeof cf?.timezone === "string" ? cf.timezone : null;

  // El locale sale de la URL de la que vino el formulario, no de
  // `Accept-Language`: si alguien está leyendo la puerta en alemán, su cuenta
  // nace en alemán aunque su teléfono esté en inglés.
  const alta = await registrarCuentaNueva(env, {
    correo,
    clave,
    locale,
    intent: intencion.intent,
    pais,
    zona,
  });

  // El correo repetido recibe la misma forma de respuesta y ninguna sesión:
  // no aprende nada nuevo, y quien está probando direcciones tampoco.
  if (alta.estado === "duplicado") return respuesta(request, locale);

  return respuesta(request, locale, alta.cookies);
};

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
