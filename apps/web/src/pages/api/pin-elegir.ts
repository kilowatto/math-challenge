/**
 * `POST /api/pin-elegir` — el niño elige su PIN la PRIMERA vez (D-201).
 *
 * ─── La pantalla que faltaba, y el hueco que cierra ────────────────────────
 *
 * D-012 dice «3 imágenes que el propio niño eligió», y `child_image_pin` solo
 * tiene fila cuando esa elección ocurrió. Hasta D-201 **eso no ocurría en
 * ninguna parte del repo**: no existía pantalla donde elegir, así que todo
 * perfil recién creado llegaba sin `pin_hash`, y `kids/pin.astro` lo dejaba
 * entrar de largo. Consecuencia real: un hermano abría el perfil de otro
 * tocando su cara. El encabezado de esa página lo documentaba como residuo y
 * decía que la rama «deja de ejecutarse sola» en cuanto existiera la pantalla
 * de elección. Este endpoint es su mitad de servidor.
 *
 * ─── El candado: fijar sí, sobrescribir NUNCA ──────────────────────────────
 *
 * Esta ruta se autentica con el DISPOSITIVO (`mc_h`), no con una sesión de
 * adulto — tiene que servirle a un niño de cuatro años que está solo frente a
 * la tablet. Eso la haría el camino perfecto para que un hermano le cambiara
 * el PIN a otro… si pudiera sobrescribir. No puede: **escribe solo cuando no
 * hay `pin_hash`**, y responde 409 en cuanto lo hay.
 *
 * Cambiar un PIN que ya existe es de `/api/perfil-pin`, que exige sesión de
 * adulto. Los dos endpoints escriben la misma tabla y esa asimetría es el
 * diseño entero: fijar lo puede hacer el niño, recambiar solo su padre.
 *
 * ─── Por qué el candado se comprueba DOS veces ─────────────────────────────
 *
 * Entre el `SELECT` y el `INSERT` cabe otra petición. El `ON CONFLICT DO
 * NOTHING` hace que la segunda no pise a la primera, y la relectura posterior
 * es la que decide quién ganó: si el hash guardado no es el nuestro, alguien
 * llegó antes y se responde 409 igual. Sin esa relectura, el segundo en llegar
 * creería haber fijado un PIN que no es el que quedó guardado — y entraría con
 * una sesión abierta sobre un PIN ajeno.
 */
import type { APIRoute } from "astro";
import { accesoAlPin, esEarlyData, json, localeSeguro, tipoDePin, type Env } from "../../lib/pin-acceso.ts";
import { COOKIE_NINO, abrirSesionNino, leerCookies } from "../../lib/sesiones.ts";
import { hashearPin, pinValido } from "../../../../../packages/motor/src/pin-imagenes.ts";
import { hashearPinNumerico, pinNumericoValido } from "../../../../../packages/motor/src/pin-numerico.ts";
import { rutaMapaKids } from "../../lib/mapa-kids.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (esEarlyData(request)) return new Response(null, { status: 425 });

  let body: { childId?: unknown; posiciones?: unknown; digitos?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "cuerpo_ilegible" }, 400);
  }

  const env = (locals as any).runtime?.env as Env | undefined;
  const acceso = await accesoAlPin(env, request, String(body.childId ?? ""));
  if ("respuesta" in acceso) return acceso.respuesta;

  const { perfil, secreto } = acceso;

  // El candado, primera mitad. Ver el encabezado.
  if (perfil.pin_hash) return json({ ok: false, error: "ya_tiene_pin" }, 409);

  // Sin PIN todavía no hay `child_image_pin.tipo` que consultar, así que aquí
  // —y solo aquí— manda la banda: KINDER elige imágenes, el resto dígitos.
  const tipo = tipoDePin(perfil);

  let hash: string;
  if (tipo === "numerico") {
    const digitos = Array.isArray(body.digitos) ? body.digitos.map(Number) : [];
    if (!pinNumericoValido(digitos)) return json({ ok: false, error: "pin_invalido" }, 422);
    hash = await hashearPinNumerico(secreto, perfil.id, digitos);
  } else {
    const posiciones = Array.isArray(body.posiciones) ? body.posiciones.map(Number) : [];
    if (!pinValido(posiciones)) return json({ ok: false, error: "pin_invalido" }, 422);
    hash = await hashearPin(secreto, perfil.id, posiciones);
  }

  const ahora = Math.floor(Date.now() / 1000);
  await env!.DB.prepare(
    "INSERT INTO child_image_pin (child_profile_id, pin_hash, tipo, created_at, updated_at) " +
      "VALUES (?, ?, ?, ?, ?) ON CONFLICT (child_profile_id) DO NOTHING",
  )
    .bind(perfil.id, hash, tipo, ahora, ahora)
    .run();

  // El candado, segunda mitad: ¿quedó guardado el nuestro, o ganó otra
  // petición la carrera?
  const guardado = await env!.DB.prepare(
    "SELECT pin_hash FROM child_image_pin WHERE child_profile_id = ?",
  )
    .bind(perfil.id)
    .first<{ pin_hash: string }>();
  if (!guardado || guardado.pin_hash !== hash) {
    return json({ ok: false, error: "ya_tiene_pin" }, 409);
  }

  // Acaba de elegirlo: entra sin volver a teclearlo. Pedírselo otra vez sería
  // pedirle a un niño de cuatro años que repita lo que hizo hace un segundo —
  // la confirmación ya ocurrió en la escena, que le hizo tocarlo dos veces
  // antes de llamar aquí.
  const cookies = leerCookies(request.headers.get("cookie"));
  const { cookie } = await abrirSesionNino(
    env!.SESSION_KV,
    { childProfileId: perfil.id, parentUserId: perfil.parent_user_id, creadaEn: Date.now() },
    cookies[COOKIE_NINO],
  );

  const locale = localeSeguro(perfil.locale);
  return json({ ok: true, tipo, destino: rutaMapaKids(locale) }, 200, { "set-cookie": cookie });
};
