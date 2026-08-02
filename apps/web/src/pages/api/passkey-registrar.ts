/**
 * `POST /api/passkey-registrar` — guarda una passkey nueva. Criterio #112.
 *
 * **La atestación se ignora, y es una decisión.** Este producto no necesita
 * saber qué marca de autenticador usa una familia: eso solo sirve para
 * restringir cuáles se aceptan, y restringir aquí significaría dejar fuera a
 * quien tiene un teléfono barato. Se pide `attestation: "none"` en el cliente y
 * aquí se lee solo lo que hace falta.
 */
import type { APIRoute } from "astro";
import { authDataDeAttestation, leerAuthData, comprobarCliente, bytesAB64url, importarLlaveCose, hashDelRpId } from "../../lib/webauthn";
import { leerSesionAdulto, COOKIE_ADULTO, leerCookies } from "../../lib/sesiones";
import { llaveDelReto } from "./passkey-reto";

export const prerender = false;

const deB64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
const error = (motivo: string, estado = 400) =>
  new Response(JSON.stringify({ ok: false, motivo }), { status: estado, headers: { "content-type": "application/json" } });

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  if (!env?.DB || !env?.SESSION_KV) return error("sin_bindings", 503);
  if (request.headers.get("early-data") === "1") return error("reintenta", 425);

  const s = await leerSesionAdulto(env.SESSION_KV, leerCookies(request.headers.get("cookie"))[COOKIE_ADULTO]);
  if (!s) return error("sin_sesion", 401);

  const b = await request.json().catch(() => null) as
    | { retoId?: string; credentialId?: string; clientDataJSON?: string; authenticatorData?: string; transports?: string[] }
    | null;
  if (!b?.retoId || !b.credentialId || !b.clientDataJSON || !b.attestationObject) return error("cuerpo_incompleto");

  // El reto se lee Y SE BORRA. La caducidad sola no lo hace de un solo uso.
  const crudo = await env.SESSION_KV.get(llaveDelReto(b.retoId));
  await env.SESSION_KV.delete(llaveDelReto(b.retoId));
  if (!crudo) return error("reto_caducado_o_usado", 400);
  const guardado = JSON.parse(crudo) as { reto: string; proposito: string; userId: string | null };
  if (guardado.proposito !== "registrar" || guardado.userId !== s.userId) return error("reto_de_otro_proposito");

  const cliente = await comprobarCliente(b.clientDataJSON, guardado.reto, "webauthn.create");
  if (!cliente.ok) return error(cliente.motivo);

  let ad;
  try { ad = leerAuthData(authDataDeAttestation(deB64url(b.attestationObject))); } catch { return error("authData_ilegible"); }
  if (!ad.cosePublicKey) return error("sin_llave_publica");

  // El RP ID tiene que ser el nuestro: si no, la llave se creó para otro sitio.
  const esperado = await hashDelRpId();
  if (ad.rpIdHash.length !== esperado.length || ad.rpIdHash.some((v, i) => v !== esperado[i])) {
    return error("rp_id_no_coincide");
  }
  if (!(ad.flags & 0x01)) return error("sin_presencia_del_usuario");

  // Se comprueba que la llave sea legible ANTES de guardarla. Guardar una que
  // no se puede importar deja a la persona con una passkey que nunca va a
  // funcionar, y el síntoma llega semanas después.
  try { await importarLlaveCose(ad.cosePublicKey); } catch { return error("llave_publica_no_soportada"); }

  const ahora = Math.floor(Date.now() / 1000);
  try {
    await env.DB.prepare(
      "INSERT INTO user_passkeys (credential_id, user_id, public_key, sign_count, transports, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    ).bind(b.credentialId, s.userId, ad.cosePublicKey, ad.signCount, (b.transports ?? []).join(","), ahora).run();
  } catch (e) {
    if (/UNIQUE/i.test(String((e as Error).message))) return error("passkey_ya_registrada", 409);
    throw e;
  }

  return Response.json({ ok: true, credentialId: b.credentialId });
};
