/**
 * `POST /api/perfil-nuevo` — nace el perfil de un niño. Criterios #110, #114, #119.
 *
 * ─── El niño no es un usuario, y este endpoint es donde eso se hace cierto ──
 *
 * Línea roja #2. Aquí no se crea una cuenta: se crea una **fila dentro de la
 * cuenta de un adulto**. No hay correo, no hay contraseña, no hay sesión propia
 * y no hay forma de iniciar sesión como este perfil desde fuera del dispositivo
 * del hogar (D-012).
 *
 * **Lo que este endpoint no acepta, aunque se lo manden:**
 *
 *  · nombre real — no se lee del cuerpo. El alias lo GENERA el servidor.
 *  · correo, teléfono, foto — no existen como campos.
 *  · fecha de nacimiento — solo el AÑO (D-053), y validado contra un rango.
 *  · cualquier texto libre — línea roja #3. El único campo de texto que llega
 *    es el año, y es un número.
 *
 * El alias **lo genera el servidor**, no el cliente. Si viniera del cuerpo, un
 * adulto podría escribir el nombre real de su hijo ahí y nada lo impediría — y
 * el campo se llamaría `alias` mientras contiene «Sofía Martínez». Es la
 * limitación que `audits/child-pii.mjs` declara que NO puede comprobar.
 *
 * ─── El consentimiento se escribe aquí o no existe ─────────────────────────
 *
 * D-013 y D-051: la fila de `child_consents` con código `CHILD_PROFILE` es lo
 * que hace auditable que un adulto consintió. Va en el MISMO `batch` que el
 * perfil, así que o están los dos o no está ninguno. Un perfil sin su fila de
 * consentimiento sería un menor cuyos datos guardamos sin poder demostrar que
 * alguien lo autorizó.
 *
 * ─── Y el tablero NO se activa (D-040) ─────────────────────────────────────
 *
 * No se inserta `LEADERBOARD` en ninguna parte. Aparecer en el tablero global
 * requiere un acto posterior del adulto; no requiere salirse. Es opt-in por
 * hijo, y la diferencia entre las dos cosas es la que separa un producto que
 * respeta a un menor de uno que lo publica por defecto.
 */
import type { APIRoute } from "astro";
import { terminarMal } from "../../lib/respuesta-de-formulario";
import { rutaPerfilNuevo } from "../../lib/rutas-app";
import { leerSesionAdulto, COOKIE_ADULTO, leerCookies } from "../../lib/sesiones";
import { anotarPaso } from "../../lib/embudo";
import { generarAlias, type LocaleAlias } from "../../../../../packages/motor/src/alias.ts";
import { temaPorEdad, temaPermitido, edadDesdeAnio, aniosOfrecidos, type TemaVisual } from "../../../../../packages/motor/src/bandas.ts";

export const prerender = false;

interface Env {
  DB: D1Database;
  SESSION_KV: KVNamespace;
  /** El embudo. Mide al ADULTO que crea el perfil, nunca al niño (D-037). */
  FUNNEL_AE?: AnalyticsEngineDataset;
}

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

/**
 * El error vuelve al FORMULARIO del perfil, con el motivo en la URL.
 *
 * `alias_repetido` y `edad_de_adulto` son cosas que la persona puede corregir, y
 * una pantalla de JSON no le dice cómo. Ver `lib/respuesta-de-formulario.ts`.
 *
 * El locale es el de la sesión y no el del `Referer`: aquí ya hay adulto
 * autenticado, así que se sabe en qué idioma está su cuenta.
 */
function error(request: Request, locale: string, motivo: string, estado = 400) {
  return terminarMal(request, rutaPerfilNuevo(locale), motivo, estado);
}

export const POST: APIRoute = async ({ request, locals }) => {
  // `en` mientras no se sepa el locale real: las primeras comprobaciones fallan
  // antes de leer el cuerpo, y volver a la puerta en inglés es mejor que no
  // volver. En cuanto se lee el cuerpo, `locale` se reasigna al de verdad.
  let locale = "en";
  const env = (locals as any).runtime?.env as Env | undefined;
  if (!env?.DB || !env?.SESSION_KV) return error(request, locale, "sin_bindings", 503);

  // Crear un perfil es una escritura, y `early data` es replicable (RFC 8470).
  // Sin esto, reenviar los bytes del 0-RTT crearía perfiles duplicados.
  if (request.headers.get("early-data") === "1") return error(request, locale, "reintenta", 425);

  // ── Tiene que haber un adulto con sesión ─────────────────────────────────
  // No hay camino a este endpoint sin `mc_s`. Un perfil de niño **siempre**
  // cuelga de una cuenta de adulto: si esta comprobación cayera, existiría un
  // niño sin adulto responsable, que es la forma exacta de la línea roja #2.
  const cookies = leerCookies(request.headers.get("cookie"));
  const sesion = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!sesion) return error(request, locale, "sin_sesion", 401);

  // `locale` ya está declarado arriba: se reasigna aquí en cuanto se lee el
  // cuerpo, y hasta entonces vale `en` para poder volver a alguna parte.
  let anio = 0, temaPedido = "";
  try {
    const tipo = request.headers.get("content-type") ?? "";
    if (tipo.includes("application/json")) {
      const j = (await request.json()) as Record<string, unknown>;
      anio = Number(j.anio);
      temaPedido = String(j.tema ?? "");
      locale = String(j.locale ?? "");
    } else {
      const f = await request.formData();
      anio = Number(f.get("anio"));
      temaPedido = String(f.get("tema") ?? "");
      locale = String(f.get("locale") ?? "");
    }
  } catch {
    return error(request, locale, "cuerpo_ilegible");
  }

  // ── El año, y SOLO el año (D-053) ────────────────────────────────────────
  //
  // **«Ahora no» tiene que funcionar, y esta comprobación lo impedía.**
  //
  // El criterio #114 dice que cada paso es saltable con «Ahora no», y la pantalla
  // lo implementó bien: la primera opción del `<select>` de año es justamente
  // esa, porque no existe un año de nacimiento por defecto que sea honesto.
  // Pero este endpoint rechazaba el cuerpo sin año — así que saltarse el paso
  // daba un error en vez de un perfil, y **un niño que no puede practicar porque
  // su papá no quiso dar su año de nacimiento es la línea roja #4**.
  //
  // Sin año no se puede derivar la banda, así que se toma la **más segura**:
  // KINDER, la de quien menos lee. Un adolescente sabe usar una interfaz grande;
  // un niño de cuatro años no sabe usar una chica (`mc-20`). Equivocarse hacia
  // KINDER cuesta que un chico de doce vea botones grandes; equivocarse hacia
  // SECUNDARIA cuesta que uno de cuatro no pueda usar el producto.
  //
  // El año se vuelve a ofrecer después como marca contextual (D-026), que es
  // donde D-026 dice que van los datos que no caben en el registro.
  const anioActual = new Date().getUTCFullYear();
  const sinAnio = !anio || Number.isNaN(anio);
  if (!sinAnio && !aniosOfrecidos(anioActual).includes(anio)) {
    // Un año fuera del rango SÍ se rechaza: no es alguien saltándose el paso,
    // es alguien mandando 1974 por curl para crear un «niño» de 52 años dentro
    // de la cuenta de otro. Una fila que nadie sabría explicar.
    return error(request, locale, "anio_fuera_de_rango");
  }

  if (!LOCALES.includes(locale)) return error(request, "en", "locale_invalido");

  // ── El tema: derivado, y movible UNA banda ───────────────────────────────
  // El adulto manda sobre el derivado, dentro del margen. Fuera del margen no
  // está ajustando el tema visual: está eligiendo otro producto, y un niño de
  // cuatro años en SECUNDARIA no tiene audio en cada instrucción (mc-20).
  const derivado: TemaVisual = sinAnio ? "KINDER" : temaPorEdad(edadDesdeAnio(anio, anioActual));
  const tema: TemaVisual = temaPedido
    ? (temaPermitido(derivado, temaPedido as TemaVisual) ? (temaPedido as TemaVisual) : derivado)
    : derivado;
  // Si pidió uno fuera del margen se usa el derivado y se DICE, en vez de
  // fallar: el adulto está creando el perfil de su hijo y un error aquí es una
  // pantalla en blanco en el peor momento.
  const temaAjustado = Boolean(temaPedido) && tema !== temaPedido;

  // `child_profiles.theme_band` solo admite tres valores (migración 0002). Los
  // temas de adulto no son perfiles de niño: si la edad da SERIO o PRO, esta
  // persona necesita su propia cuenta (D-034), no un perfil dentro de otra.
  if (tema !== "KINDER" && tema !== "PRIMARIA" && tema !== "SECUNDARIA") {
    return error(request, locale, "edad_de_adulto:abre_cuenta_propia", 422);
  }

  // ── El alias lo genera el SERVIDOR ───────────────────────────────────────
  // Nunca llega del cuerpo. Ver el encabezado: un alias que viene del cliente
  // es un campo de texto libre con otro nombre.
  const { alias } = generarAlias(locale as LocaleAlias);

  const ahora = Math.floor(Date.now() / 1000);
  const childId = crypto.randomUUID();

  // `birth_month` ya no existe: la migración 0006 la retiró con el marcador de
  // minimización que exige nombrar la columna (D-053, D-013). El centinela que
  // vivía aquí —un `1` que significaba «no se preguntó», no enero— se fue con
  // ella.
  //
  // `birth_year` sí admite 0, y también significa «no se preguntó»: el adulto
  // puede saltarse el paso con «Ahora no» y el niño practica igual (línea roja
  // #4). Cero no es un año, así que no hace falta que la columna sea nullable.
  const ANIO_NO_PREGUNTADO = 0;

  try {
    await env.DB.batch([
      env.DB.prepare(
        "INSERT INTO child_profiles (id, parent_user_id, alias, alias_locale, birth_year, theme_band, locale, created_at, updated_at) " +
          "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ).bind(childId, sesion.userId, alias, locale, sinAnio ? ANIO_NO_PREGUNTADO : anio, tema, locale, ahora, ahora),
      // El consentimiento va en el MISMO batch. O están los dos o no está
      // ninguno: un perfil sin su fila sería un menor cuyos datos guardamos sin
      // poder demostrar que alguien lo autorizó (D-013, D-051).
      env.DB.prepare(
        "INSERT INTO child_consents (child_profile_id, consent_code, granted_by, granted_at, consent_version) " +
          "VALUES (?, 'CHILD_PROFILE', ?, ?, (SELECT current_version FROM consent_type_catalog WHERE code = 'CHILD_PROFILE'))",
      ).bind(childId, sesion.userId, ahora),
    ]);
  } catch (e) {
    // El alias tiene índice único por padre (migración 0003). Un choque es
    // raro —1,080,000 combinaciones— pero posible, y la respuesta correcta es
    // reintentar con otro alias, no enseñarle un error a quien está creando el
    // perfil de su hijo.
    const msg = String((e as Error)?.message ?? "");
    if (/UNIQUE/i.test(msg)) return error(request, locale, "alias_repetido:reintenta", 409);
    throw e;
  }

  // El embudo: este adulto creó un perfil. **Ningún dato del niño viaja** — ni
  // el id, ni el alias, ni la banda. Que un adulto creó *un* perfil es un hecho
  // sobre el adulto; que creó el de *este* niño es un hecho sobre el niño.
  anotarPaso(env.FUNNEL_AE, "primer_perfil", { locale });

  // ── La respuesta depende de CÓMO se envió, y eso no es cosmética ─────────
  //
  // Un `<form method="post">` sin JavaScript espera una redirección. Devolverle
  // JSON deja al adulto mirando llaves y comillas — y `mc-33` documenta que el
  // JavaScript falla más de lo que nadie cree en el dispositivo de referencia,
  // así que ese camino no es el raro: es el que hay que aguantar.
  //
  // **303 y no 302**: obliga al navegador a seguir con GET. Con 302 algunos
  // reenvían el POST, y el resultado sería un segundo perfil creado por pulsar
  // «atrás».
  const quiereJson = (request.headers.get("accept") ?? "").includes("application/json");
  if (!quiereJson) {
    return new Response(null, {
      status: 303,
      headers: { location: `/${locale}/app/kids/` },
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      alias,
      tema,
      // Se devuelve para que la pantalla pueda decir «lo puse en KINDER porque
      // SECUNDARIA queda muy lejos para su edad», en vez de cambiarlo callado.
      temaAjustado,
      derivado,
      // `true` cuando el adulto saltó el año: la pantalla siguiente puede
      // ofrecerlo como marca contextual en vez de darlo por perdido.
      sinAnio,
    }),
    { status: 201, headers: { "content-type": "application/json; charset=utf-8" } },
  );
};
