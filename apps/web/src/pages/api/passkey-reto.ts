/**
 * `POST /api/passkey-reto` — el reto aleatorio. Criterio #112, D-038.
 *
 * Un reto de WebAuthn es un número aleatorio que **solo vale una vez**. Si se
 * pudiera reusar, cualquiera que capturara una firma la podría reenviar para
 * siempre — es la definición de un ataque de repetición.
 *
 * Vive en KV con **dos minutos** de vida: suficiente para que alguien ponga el
 * dedo o mire a la cámara de su propio teléfono, y corto para que una firma
 * capturada no sirva más tarde. Y se **borra al usarse**, que es lo que lo hace
 * de un solo uso de verdad — la caducidad sola no basta.
 */
import type { APIRoute } from "astro";
import { bytesAB64url } from "../../lib/webauthn";
import { RP_ID } from "../../lib/passkeys";
import { leerSesionAdulto, COOKIE_ADULTO, leerCookies } from "../../lib/sesiones";

export const prerender = false;

/** Dos minutos. Ver el encabezado. */
export const VIDA_RETO_S = 120;
export const llaveDelReto = (id: string) => `reto:${id}`;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  if (!env?.SESSION_KV) return new Response(null, { status: 503 });

  const cuerpo = await request.json().catch(() => ({})) as { proposito?: string };
  const proposito = cuerpo.proposito === "registrar" ? "registrar" : "entrar";

  // Registrar una passkey exige sesión: se le añade una llave a una cuenta que
  // ya existe. Entrar no, obviamente — todavía no hay sesión que tener.
  let userId: string | null = null;
  if (proposito === "registrar") {
    const s = await leerSesionAdulto(env.SESSION_KV, leerCookies(request.headers.get("cookie"))[COOKIE_ADULTO]);
    if (!s) return new Response(JSON.stringify({ ok: false, motivo: "sin_sesion" }), { status: 401 });
    userId = s.userId;
  }

  // 32 bytes del CSPRNG del runtime. La especificación pide al menos 16.
  const reto = bytesAB64url(crypto.getRandomValues(new Uint8Array(32)));
  const id = bytesAB64url(crypto.getRandomValues(new Uint8Array(16)));

  await env.SESSION_KV.put(
    llaveDelReto(id),
    JSON.stringify({ reto, proposito, userId }),
    { expirationTtl: VIDA_RETO_S },
  );

    // `RP_ID` importado, nunca escrito a mano. `audits/passkey-rp-id.mjs` cazó
  // exactamente eso aquí: dos sitios con el mismo dominio se separan en el
  // primer cambio, y el síntoma sería una passkey que deja de funcionar sin que
  // nada falle al desplegar.
  /**
   * ─── Para REGISTRAR hace falta el identificador de usuario ────────────────
   *
   * `navigator.credentials.create()` exige `user.id`, y la especificación es
   * explícita en que **no debe llevar información personal**: el autenticador
   * lo guarda y puede acabar visible en el gestor de contraseñas. Va el
   * `userId` opaco de la cuenta, nunca el correo.
   *
   * `user.name` se manda vacío por lo mismo. La consecuencia, dicha: en el
   * selector del sistema la llave aparece sin nombre, y quien tenga dos cuentas
   * verá dos entradas iguales. Se prefiere eso a poner el correo de alguien en
   * el almacén del sistema operativo — donde ya no lo controlamos y no lo
   * alcanza ningún borrado nuestro (GDPR art. 17).
   *
   * Faltaba, y no lo atrapó nada: `Entrar.astro` solo hacía `.get()`, que no
   * pide `user`. El hueco apareció al construir la pantalla que sí registra
   * (issue #311) — hasta entonces **no había ninguna superficie que creara una
   * passkey después del registro**, así que el campo nunca se pidió.
   */
  return Response.json({
    ok: true,
    id,
    reto,
    rpId: RP_ID,
    ...(proposito === "registrar" && userId
      ? { usuarioId: bytesAB64url(new TextEncoder().encode(userId)), usuarioNombre: "" }
      : {}),
  });
};
