/**
 * `POST /api/pin-entrar` — el niño toca sus tres dibujos (o sus cuatro
 * dígitos) y entra a su perfil (D-201).
 *
 * Es lo que hacía el `POST` de `kids/pin.astro` antes de que esa página se
 * borrara, con las mismas protecciones y las mismas ausencias deliberadas.
 *
 * ─── Lo que este endpoint NO hace, y son decisiones ────────────────────────
 *
 *  · **No bloquea tras fallar.** Sin contador de intentos, sin retraso, sin
 *    candado. Son 504 combinaciones (o 10 000) y D-012 dice que la protección
 *    real la da el dispositivo del hogar, ya comprobado antes de leer nada. Un
 *    candado por intentos castigaría a un niño de cuatro años por equivocarse
 *    — justo lo que la línea roja #4 y el espíritu de la #8 prohíben.
 *  · **No dice en qué falló.** Un PIN incorrecto y un PIN mal formado
 *    responden lo mismo: `{ ok: false }`, HTTP 200. Ni 401 ni 403 — un código
 *    distinto por caso convertiría la ruta en un oráculo.
 *  · **No deja pasar a un perfil sin PIN.** Aquí está el cambio de verdad
 *    frente a `kids/pin.astro`, que abría sesión de niño a cualquier perfil
 *    sin `pin_hash` — y como no existía pantalla para elegir uno, TODO perfil
 *    nuevo caía en esa rama y un hermano abría el perfil de otro tocando su
 *    cara. Ahora se responde `sin_pin` y la escena manda a elegir. El hueco se
 *    cierra por construcción: no queda ninguna ruta que abra sesión sin PIN.
 */
import type { APIRoute } from "astro";
import { accesoAlPin, esEarlyData, json, localeSeguro, tipoDePin, type Env } from "../../lib/pin-acceso.ts";
import { COOKIE_NINO, abrirSesionNino, leerCookies } from "../../lib/sesiones.ts";
import {
  hashearPin,
  hashearPinConOrden,
  pinValido,
  pinesIguales,
} from "../../../../../packages/motor/src/pin-imagenes.ts";
import {
  hashearPinNumerico,
  pinNumericoValido,
  pinesNumericosIguales,
} from "../../../../../packages/motor/src/pin-numerico.ts";
import { rutaMapaKids } from "../../lib/mapa-kids.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // 0-RTT es replicable por diseño (RFC 8470): reenviar los bytes de un
  // acierto abriría sesión otra vez. El navegador reintenta solo con el
  // apretón de manos completo y el niño no ve nada.
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

  // Un perfil sin PIN no se verifica: se manda a elegir uno. Ver el encabezado.
  if (!perfil.pin_hash) return json({ ok: false, error: "sin_pin" });

  // El tipo lo dice la BASE (`child_image_pin.tipo`), nunca el cliente: es lo
  // único que sabe cómo se calculó el hash guardado.
  const tipo = tipoDePin(perfil);

  let acerto = false;
  if (tipo === "numerico") {
    const digitos = Array.isArray(body.digitos) ? body.digitos.map(Number) : [];
    if (pinNumericoValido(digitos)) {
      const hash = await hashearPinNumerico(secreto, perfil.id, digitos);
      acerto = pinesNumericosIguales(hash, perfil.pin_hash);
    }
  } else {
    const posiciones = Array.isArray(body.posiciones) ? body.posiciones.map(Number) : [];
    if (pinValido(posiciones)) {
      acerto = pinesIguales(await hashearPin(secreto, perfil.id, posiciones), perfil.pin_hash);

      /**
       * El camino de migración de D-202, y por qué está aquí y no en un script.
       *
       * Desde D-202 el orden no cuenta: el hash se deriva de las posiciones
       * ORDENADAS. Los PIN elegidos antes llevan el orden dentro del hash, así
       * que el de arriba no los reconoce. Reescribirlos en masa es imposible:
       * el hash no se puede invertir, y el servidor no sabe qué tres dibujos
       * eligió cada niño hasta que el niño los toca.
       *
       * Así que se migra en el único momento en que el dato existe: cuando el
       * niño acierta. Si el hash nuevo falla y el viejo acierta, es el mismo
       * PIN de siempre —el niño entra— y de paso se guarda ya sin orden. Cada
       * perfil migra solo, en su primera entrada, sin que nadie note nada.
       *
       * Si el `UPDATE` falla, se entra igual: el niño acertó, y castigarlo por
       * un problema de base de datos cruzaría la línea roja #7. Migrará en la
       * siguiente.
       */
      if (!acerto) {
        const viejo = await hashearPinConOrden(secreto, perfil.id, posiciones);
        if (pinesIguales(viejo, perfil.pin_hash)) {
          acerto = true;
          const nuevo = await hashearPin(secreto, perfil.id, posiciones);
          try {
            await env!.DB.prepare(
              "UPDATE child_image_pin SET pin_hash = ?1 WHERE child_profile_id = ?2 AND pin_hash = ?3",
            )
              .bind(nuevo, perfil.id, perfil.pin_hash)
              .run();
          } catch {
            /* se entra igual; migrará en la siguiente. Ver arriba. */
          }
        }
      }
    }
  }

  // Se vuelve a empezar sin penalización de ningún tipo (líneas rojas #4 y #8).
  if (!acerto) return json({ ok: false, error: "no_eran_esos" });

  const cookies = leerCookies(request.headers.get("cookie"));
  const { cookie } = await abrirSesionNino(
    env!.SESSION_KV,
    { childProfileId: perfil.id, parentUserId: perfil.parent_user_id, creadaEn: Date.now() },
    cookies[COOKIE_NINO],
  );

  const locale = localeSeguro(perfil.locale);
  return json({ ok: true, destino: rutaMapaKids(locale) }, 200, { "set-cookie": cookie });
};
