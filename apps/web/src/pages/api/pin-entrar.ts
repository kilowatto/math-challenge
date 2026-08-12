/**
 * `POST /api/pin-entrar` — el niño toca sus tres dibujos (o sus cuatro
 * dígitos) y entra a su perfil (D-201).
 *
 * Es lo que hacía el `POST` de `kids/pin.astro` antes de que esa página se
 * borrara, con las mismas protecciones y las mismas ausencias deliberadas.
 *
 * ─── Lo que este endpoint NO hace, y son decisiones ────────────────────────
 *
 *  · **No dice en qué falló.** Un PIN incorrecto y un PIN mal formado
 *    responden lo mismo: `{ ok: false }`, HTTP 200. Ni 401 ni 403 — un código
 *    distinto por caso convertiría la ruta en un oráculo.
 *  · **No deja pasar a un perfil sin PIN.** Aquí está el cambio de verdad
 *    frente a `kids/pin.astro`, que abría sesión de niño a cualquier perfil
 *    sin `pin_hash` — y como no existía pantalla para elegir uno, TODO perfil
 *    nuevo caía en esa rama y un hermano abría el perfil de otro tocando su
 *    cara. Ahora se responde `sin_pin` y la escena manda a elegir. El hueco se
 *    cierra por construcción: no queda ninguna ruta que abra sesión sin PIN.
 *
 * ─── El límite de intentos SÍ existe, desde D-202 ──────────────────────────
 *
 * Esta cabecera decía, con fecha de antes de D-202: «no bloquea tras fallar
 * — son 504 combinaciones y D-012 dice que la protección real la da el
 * dispositivo». D-202 quitó el orden del PIN de imágenes (KINDER no
 * memoriza secuencias) y el espacio bajó a 84. Con 504 se podía vivir sin
 * límite; con 84 ya no. El diseño completo, con los números y el porqué de
 * cada uno, vive en `lib/pin-intentos.ts` — en corto: sin contador visible,
 * sin mensaje de castigo (línea roja #7), y el adulto puede desbloquear
 * desde su panel (`api/pin-desbloquear.ts`) sin que el niño tenga que
 * esperar. El PIN numérico (PRIMARIA/SECUNDARIA) usa el mismo límite: es un
 * solo contador por perfil, no por tipo de PIN.
 */
import type { APIRoute } from "astro";
import { accesoAlPin, esEarlyData, json, localeSeguro, tipoDePin, type Env } from "../../lib/pin-acceso.ts";
import { COOKIE_NINO, abrirSesionNino, leerCookies } from "../../lib/sesiones.ts";
import { puedeIntentar, anotarFallo, limpiarFallos } from "../../lib/pin-intentos.ts";
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

  /**
   * El gate del límite de intentos, ANTES de tocar el PIN que llegó.
   *
   * A propósito antes de comparar: si se dejara comparar durante el bloqueo,
   * un hermano que por azar tocara los tres correctos entraría igual, y toda
   * la fricción de `pin-intentos.ts` no protegería nada. La respuesta es
   * `no_eran_esos` — la misma de un PIN mal tocado — porque el niño nunca
   * debe poder distinguir "estás bloqueado" de "no eran esos".
   */
  if (env?.SESSION_KV && !(await puedeIntentar(env.SESSION_KV, perfil.id))) {
    return json({ ok: false, error: "no_eran_esos" });
  }

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

  // Se vuelve a empezar sin penalización VISIBLE de ningún tipo (líneas rojas
  // #4 y #8) — pero el fallo SÍ se cuenta, en silencio, para el límite de
  // arriba. `anotarFallo` no cambia esta respuesta ni la retrasa: el niño ve
  // exactamente lo mismo al primer fallo que al quinto.
  if (!acerto) {
    if (env?.SESSION_KV) await anotarFallo(env.SESSION_KV, perfil.id);
    return json({ ok: false, error: "no_eran_esos" });
  }
  if (env?.SESSION_KV) await limpiarFallos(env.SESSION_KV, perfil.id);

  const cookies = leerCookies(request.headers.get("cookie"));
  const { cookie } = await abrirSesionNino(
    env!.SESSION_KV,
    { childProfileId: perfil.id, parentUserId: perfil.parent_user_id, creadaEn: Date.now() },
    cookies[COOKIE_NINO],
  );

  const locale = localeSeguro(perfil.locale);
  return json({ ok: true, destino: rutaMapaKids(locale) }, 200, { "set-cookie": cookie });
};
