/**
 * VAPID a mano con Web Crypto — sin librería, sin `nodejs_compat` (F7 #207).
 *
 * mc-19 §2.5 confirma que Workers soporta `SubtleCrypto` completo, suficiente
 * para firmar el JWT ES256 que exige RFC 8292. No se usa `web-push` de npm:
 * no está en el `package.json` del repo y añadir dependencias es una decisión
 * que hay que declarar — aquí no hace falta.
 *
 * ─── Qué se envía: un «tickle», no el mensaje ──────────────────────────────
 *
 * El push viaja SIN payload. El service worker, al recibirlo, pide el cuerpo
 * ya localizado a `/api/push-mensaje`. Es una decisión de privacidad, no de
 * comodidad: con payload cifrado (RFC 8291) el texto viaja por los servidores
 * de Google/Mozilla/Apple cifrado, pero el cifrado es un camino de código
 * nuevo (ECDH + HKDF + AES-GCM a mano) cuya única recompensa es que un
 * intermediario que ya no lee nada siga sin leer nada. Sin payload, el alias
 * del niño **jamás sale de nuestra infraestructura** — ni cifrado (mc-25,
 * D-013). Y el código de cifrado que no existe no puede tener un bug de
 * cifrado.
 *
 * ─── Las claves NO viven aquí ──────────────────────────────────────────────
 *
 * `VAPID_PRIVATE_KEY` se instala con `wrangler secret put` y `VAPID_PUBLIC_KEY`
 * como var. Si faltan, quien llama degrada en silencio (no envía, no rompe el
 * cron) — el estado seguro por defecto, el mismo patrón que `TUTOR_PD_SECRET`.
 */

/** base64url → bytes. Acepta con o sin relleno, que es como vienen las claves. */
function base64urlABytes(valor: string): Uint8Array {
  const b64 = valor.replace(/-/g, "+").replace(/_/g, "/");
  const crudo = atob(b64);
  const bytes = new Uint8Array(crudo.length);
  for (let i = 0; i < crudo.length; i++) bytes[i] = crudo.charCodeAt(i);
  return bytes;
}

/** bytes → base64url sin relleno. */
function bytesABase64url(bytes: Uint8Array): string {
  let crudo = "";
  for (const b of bytes) crudo += String.fromCharCode(b);
  return btoa(crudo).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export interface ClavesVapid {
  /** La pública: punto P-256 sin comprimir (65 bytes), base64url. */
  publica: string;
  /** La privada: escalar P-256 (32 bytes), base64url. Secreto. */
  privada: string;
}

/**
 * Importa el par VAPID como `CryptoKey` de firma.
 *
 * El formato es el que producen `web-push generate-vapid-keys` y los paneles
 * habituales: pública de 65 bytes (`0x04 ‖ X ‖ Y`) y privada de 32. De ahí se
 * arma el JWK (`x`, `y`, `d`) que `SubtleCrypto` sí importa.
 */
async function importarLlavePrivada(claves: ClavesVapid): Promise<CryptoKey> {
  const pub = base64urlABytes(claves.publica);
  if (pub.length !== 65 || pub[0] !== 0x04) {
    throw new Error("VAPID_PUBLIC_KEY no es un punto P-256 sin comprimir (65 bytes, prefijo 0x04)");
  }
  const priv = base64urlABytes(claves.privada);
  if (priv.length !== 32) {
    throw new Error("VAPID_PRIVATE_KEY no es un escalar P-256 (32 bytes)");
  }
  const jwk: JsonWebKey = {
    kty: "EC",
    crv: "P-256",
    x: bytesABase64url(pub.slice(1, 33)),
    y: bytesABase64url(pub.slice(33, 65)),
    d: bytesABase64url(priv),
  };
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
}

/**
 * Firma el JWT de VAPID (RFC 8292): ES256 sobre `{aud, exp, sub}`.
 *
 * `exp` es +12 h y no el tope de 24 h del RFC: un reloj de borde desfasado
 * unos minutos no invalida el envío, y el JWT se firma nuevo en cada ciclo
 * del cron — no se guarda.
 *
 * `SubtleCrypto` devuelve la firma en IEEE P1363 (`r ‖ s`, 64 bytes), que es
 * exactamente la codificación que JWS espera para ES256 — no hay que
 * traducir DER, que es donde suelen morir las firmas hechas a mano.
 */
export async function firmarJwtVapid(
  audiencia: string,
  asunto: string,
  claves: ClavesVapid,
): Promise<string> {
  const llave = await importarLlavePrivada(claves);
  const enc = new TextEncoder();
  const cabecera = bytesABase64url(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const carga = bytesABase64url(
    enc.encode(
      JSON.stringify({
        aud: audiencia,
        exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
        sub: asunto,
      }),
    ),
  );
  const firma = new Uint8Array(
    await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      llave,
      enc.encode(`${cabecera}.${carga}`),
    ),
  );
  return `${cabecera}.${carga}.${bytesABase64url(firma)}`;
}

export type ResultadoEnvio = "enviado" | "suscripcion_muerta" | "fallo";

/**
 * Envía el «tickle»: un push SIN payload a un endpoint.
 *
 * La audiencia de VAPID es el ORIGEN del endpoint — `https://fcm.googleapis.com`,
 * `https://web.push.apple.com`, …—, no el nuestro (RFC 8292 §3).
 *
 * El código de respuesta manda sobre la fila de D1:
 *   · 404/410 → la suscripción murió (el padre desinstaló, el navegador la
 *     rotó). Quien llama la BORRA: seguir empujando a un endpoint muerto es
 *     cómo un servicio de push te marca como remitente ruidoso.
 *   · cualquier otro fallo → se deja la fila y se reintenta el próximo ciclo;
 *     el tope de 1/día se marca solo tras un envío real, así que un fallo de
 *     red no gasta el recordatorio del día.
 */
export async function enviarTickle(
  endpoint: string,
  asunto: string,
  claves: ClavesVapid,
): Promise<ResultadoEnvio> {
  const jwt = await firmarJwtVapid(new URL(endpoint).origin, asunto, claves);
  let resp: Response;
  try {
    resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `vapid t=${jwt}, k=${claves.publica}`,
        // El recordatorio vale por horas, no por días: si el aparato está
        // apagado a la hora de la ventana, un push que despierta al día
        // siguiente a las 07:01 sería culpa con retraso. Una hora basta.
        TTL: "3600",
      },
    });
  } catch {
    return "fallo";
  }
  if (resp.status === 404 || resp.status === 410) return "suscripcion_muerta";
  if (resp.status >= 200 && resp.status < 300) return "enviado";
  return "fallo";
}
