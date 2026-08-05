/**
 * `POST /api/passkey-entrar` — entrar con una passkey. Criterio #112, D-038.
 *
 * Aquí se comprueban las cuatro cosas de `lib/webauthn.ts`: firma, reto, origen
 * y **que el contador subió**. Esta ruta no las implementa — las llama, y esa
 * separación es a propósito: la criptografía vive en un archivo con sus 20 casos
 * de prueba, y esta ruta solo la conecta a la base y a la sesión.
 *
 * ─── El contador clonado se guarda, no se ignora ───────────────────────────
 *
 * Si la verificación dice `contador_no_subio`, la llave está clonada: la
 * auténtica ya iba más adelante. Se rechaza la entrada **y se marca la fila**,
 * porque un intento de clon es exactamente lo que alguien querría poder mirar
 * después — y si solo se rechaza, no queda rastro de que ocurrió.
 */
import type { APIRoute } from "astro";
import { verificarAutenticacion } from "../../lib/webauthn";
import { abrirSesionAdulto } from "../../lib/sesiones";
import { consultarLimite } from "../../lib/ratelimiter";
import { llaveDelReto } from "./passkey-reto";

export const prerender = false;

interface Env { DB?: D1Database; SESSION_KV?: KVNamespace; RATE_LIMITER?: DurableObjectNamespace }

const error = (motivo: string, estado = 400) =>
  new Response(JSON.stringify({ ok: false, motivo }), { status: estado, headers: { "content-type": "application/json" } });

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!env?.DB || !env?.SESSION_KV) return error("sin_bindings", 503);
  if (request.headers.get("early-data") === "1") return error("reintenta", 425);

  const ip = request.headers.get("cf-connecting-ip") ?? "sin-ip";
  const limite = await consultarLimite(env.RATE_LIMITER, "entrar", ip);
  if (!limite.permitido) {
    return new Response(JSON.stringify({ ok: false, motivo: "demasiados_intentos" }), {
      status: 429,
      headers: { "content-type": "application/json", "retry-after": String(limite.esperaS) },
    });
  }

  const b = await request.json().catch(() => null) as
    | { retoId?: string; credentialId?: string; clientDataJSON?: string; authenticatorData?: string; signature?: string }
    | null;
  if (!b?.retoId || !b.credentialId || !b.clientDataJSON || !b.authenticatorData || !b.signature) {
    return error("cuerpo_incompleto");
  }

  // De un solo uso: se lee y se borra. La caducidad sola no basta.
  const crudo = await env.SESSION_KV.get(llaveDelReto(b.retoId));
  await env.SESSION_KV.delete(llaveDelReto(b.retoId));
  if (!crudo) return error("reto_caducado_o_usado");
  const guardado = JSON.parse(crudo) as { reto: string; proposito: string };
  if (guardado.proposito !== "entrar") return error("reto_de_otro_proposito");

  const fila = await env.DB.prepare(
    "SELECT user_id, public_key, sign_count FROM user_passkeys WHERE credential_id = ?",
  ).bind(b.credentialId).first<{ user_id: string; public_key: ArrayBuffer; sign_count: number }>();
  // Un `credential_id` desconocido devuelve lo MISMO que una firma mala: decir
  // «esa llave no existe» diría qué llaves sí, y eso es un oráculo.
  if (!fila) return error("credenciales", 401);

  const r = await verificarAutenticacion({
    authenticatorData: b.authenticatorData,
    clientDataJSON: b.clientDataJSON,
    signature: b.signature,
    llavePublicaCose: new Uint8Array(fila.public_key),
    retoEsperado: guardado.reto,
    signCountGuardado: fila.sign_count,
  });

  if (r.ok === false) {
    if (r.motivo.startsWith("contador_no_subio")) {
      // Se deja rastro. Un intento de clon rechazado y no registrado es un
      // incidente que nadie va a poder mirar después.
      await env.DB.prepare(
        "UPDATE user_passkeys SET nickname = COALESCE(nickname,'') || ' [clon-sospechado]' WHERE credential_id = ?",
      ).bind(b.credentialId).run().catch(() => {});
      return error("credenciales", 401);
    }
    return error("credenciales", 401);
  }

  // El contador nuevo se guarda o la próxima entrada legítima se rechazaría por
  // «no subió» — la comprobación solo funciona si el estado avanza con ella.
  await env.DB.prepare(
    "UPDATE user_passkeys SET sign_count = ?, last_used_at = ? WHERE credential_id = ?",
  ).bind(r.signCount, Math.floor(Date.now() / 1000), b.credentialId).run();

  const { cookies } = await abrirSesionAdulto(env.SESSION_KV, {
    userId: fila.user_id,
    creadaEn: Math.floor(Date.now() / 1000),
    intent: null,
  });

  const h = new Headers({ "content-type": "application/json; charset=utf-8" });
  for (const c of cookies) h.append("set-cookie", c);
  return new Response(JSON.stringify({ ok: true, contadorNoDisponible: r.contadorNoDisponible }), { status: 200, headers: h });
};
