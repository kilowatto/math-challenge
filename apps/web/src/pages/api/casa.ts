/**
 * `/api/casa` — lo que un adulto autenticado puede hacer con su sesión.
 *
 * Tres acciones, todas exigiendo `mc_s`:
 *
 *   · **`?accion=yo`** — ¿hay sesión? Es lo único que la navegación pública
 *     necesita saber, y lo único que devuelve.
 *   · **`?accion=dispositivo`** — marca ESTE aparato como de la casa (`mc_h`).
 *   · **`?accion=salir`** — cierra la sesión del adulto **y la del niño**.
 *
 * ─── Por qué `yo` existe, y por qué no devuelve nada más que un booleano ───
 *
 * La barra de navegación seguía diciendo «Entrar» y «Crear cuenta» con la sesión
 * abierta. La causa es la de siempre en este repositorio: **las páginas públicas
 * son prerenderizadas** y no ven cookies — igual que `Astro.url.searchParams`
 * estaba vacío en el aviso de error, e igual que `Astro.request.headers` no son
 * de nadie en una página estática.
 *
 * La salida NO es volver dinámica la portada: eso convierte la página más
 * visitada del sitio en un render por visita. Es que el cliente pregunte, una
 * vez, con una petición diminuta.
 *
 * **Y por eso `yo` devuelve `{ sesion: true }` y nada más.** Ni correo, ni
 * identificador, ni cuántos hijos hay. Es una respuesta que se pinta en el
 * navegador de cualquiera que tenga el aparato en la mano, incluido un niño
 * (línea roja #2): lo único que puede llevar es si hay que enseñar «Entrar» o
 * «Mi casa».
 */
import type { APIRoute } from "astro";
import {
  COOKIE_ADULTO,
  leerCookies,
  leerSesionAdulto,
  marcarDispositivoDelHogar,
  cerrarSesionAdulto,
  borrarCookie,
  COOKIE_NINO,
} from "../../lib/sesiones";

export const prerender = false;

interface Env {
  DB?: D1Database;
  SESSION_KV: KVNamespace;
}

const json = (cuerpo: unknown, status = 200, extra: string[] = []) => {
  const h = new Headers({
    "content-type": "application/json; charset=utf-8",
    // Nunca se cachea: la respuesta depende de una cookie.
    "cache-control": "no-store",
    vary: "Cookie",
  });
  for (const c of extra) h.append("set-cookie", c);
  return new Response(JSON.stringify(cuerpo), { status, headers: h });
};

export const POST: APIRoute = async ({ request, locals, url }) => {
  const env = (locals as { runtime?: { env: Env } }).runtime?.env;
  if (!env?.SESSION_KV) return json({ error: "sin_bindings" }, 503);

  const cookies = leerCookies(request.headers.get("cookie"));
  const token = cookies[COOKIE_ADULTO];
  const sesion = await leerSesionAdulto(env.SESSION_KV, token);

  const accion = url.searchParams.get("accion");

  // `yo` es la única que contesta sin sesión, porque su respuesta ES si la hay.
  if (accion === "yo") return json({ sesion: sesion !== null });

  if (!sesion) return json({ error: "sin_sesion" }, 401);

  if (accion === "dispositivo") {
    if (!env.DB) return json({ error: "sin_base" }, 503);
    /**
     * ─── Marcar el aparato es lo que abría la puerta al niño ───────────────
     *
     * `marcarDispositivoDelHogar()` estaba escrita en `lib/sesiones.ts`, tenía
     * sus casos, y **no la llamaba nadie**. Sin ella, `mc_h` no se podía poner
     * nunca, así que `/app/kids/` rebotaba siempre a `/app/signin` y el motor
     * adaptativo entero era inalcanzable desde una cuenta real.
     *
     * Una función escrita, probada y jamás invocada no falla ninguna prueba.
     * `audits/funcion-sin-llamar.mjs` existe por esto.
     */
    const etiqueta = etiquetaDelAparato(request);
    const { cookie } = await marcarDispositivoDelHogar(
      env.DB,
      sesion.userId,
      etiqueta,
      Date.now(),
    );
    return json({ ok: true, etiqueta }, 200, [cookie]);
  }

  if (accion === "salir") {
    // Cerrar la del adulto cierra la del niño. Van juntas porque si no, el
    // aparato queda con una superficie de niño viva bajo una cuenta que ya no
    // está autenticada — el caso de la tablet que se presta.
    const fuera = await cerrarSesionAdulto(env.SESSION_KV, token);
    // `mc_h` NO se borra: el aparato sigue siendo de la casa aunque el adulto
    // salga. Borrarlo obligaría a volver a marcarlo cada vez, y marcarlo es la
    // decisión que D-012 quiere que se tome UNA vez y de forma consciente.
    return json({ ok: true }, 200, [fuera, borrarCookie(COOKIE_NINO)]);
  }

  return json({ error: "accion_desconocida" }, 400);
};

/**
 * Cómo se llama este aparato en la lista del padre.
 *
 * Sale del `User-Agent` y se reduce a una palabra —«iPhone», «Android»,
 * «iPad»— porque la etiqueta la va a leer una persona que quiere reconocer cuál
 * de sus aparatos es, no auditar una cadena de 200 caracteres. Y porque guardar
 * el `User-Agent` entero es guardar una huella de dispositivo sin necesitarla
 * (`mc-25`, D-013).
 */
function etiquetaDelAparato(request: Request): string {
  const ua = request.headers.get("user-agent") ?? "";
  if (/iPad/i.test(ua)) return "iPad";
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/Android/i.test(ua)) return "Android";
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows";
  return "este aparato";
}
