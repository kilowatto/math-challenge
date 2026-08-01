/**
 * Turnstile: defensa de bots sobre el formulario público. Criterio #113 · D-054.
 *
 * ─── Por qué esto NO roza la línea roja #1 ─────────────────────────────────
 *
 * La línea roja #1 prohíbe cámara, micrófono, biometría y navegador bloqueado, a
 * nadie, en ninguna banda. Turnstile no hace ninguna de las cuatro: no pide
 * permisos del navegador, no resuelve un desafío visual —esa es la diferencia
 * entera con un CAPTCHA— y no verifica edad ni identidad.
 *
 * **Pero la frontera es real y hay que sostenerla mecánicamente**, no con una
 * promesa: Turnstile solo puede aparecer en superficies de ADULTO.
 * `audits/turnstile-solo-adulto.mjs` bloquea el commit si aparece bajo
 * `app/kids/` o en cualquier archivo con marcas de superficie de niño. Un
 * desafío interactivo —aunque sea uno que casi nunca aparece— delante de un niño
 * de cuatro años que no lee sería un navegador bloqueado con otro nombre.
 *
 * ─── Falla CERRADO, y esa es una decisión ──────────────────────────────────
 *
 * Si no hay `TURNSTILE_SECRET_KEY` configurado, `verificar` devuelve
 * `no_configurado` y el endpoint **rechaza el registro**. La alternativa —seguir
 * sin comprobar— es exactamente el modo que D-032 nombra por su nombre: «seis
 * auditores fallaban abiertos sin que nadie lo supiera». Una defensa de bots que
 * se apaga sola cuando falta su llave no es una defensa, es un adorno.
 *
 * Se puede hacer porque el registro todavía no ha salido: hoy el costo de fallar
 * cerrado es cero, y obliga a que la llave esté puesta antes del lanzamiento.
 */

/** El endpoint canónico de Cloudflare. No hay otro. */
const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Cómo se llama el campo que el widget inyecta. Lo fija Cloudflare, no nosotros. */
export const CAMPO_TOKEN = "cf-turnstile-response";

export type MotivoTurnstile = "no_configurado" | "sin_token" | "rechazado" | "red";

/**
 * El resultado.
 *
 * **`motivo` está en las dos ramas**, y no es descuido. Como unión discriminada
 * pura —`{ok:true} | {ok:false; motivo}`— TypeScript solo estrecha con un
 * `if (!x.ok)` cuando el objeto es una variable local, y aquí viaja entre
 * funciones: el resultado es `Property 'motivo' does not exist`, medido en
 * `astro check`, sobre un código que en ejecución funciona.
 *
 * Con `motivo` opcional en el caso feliz, leerlo tras comprobar `ok` compila sin
 * aserciones ni `as`, que es lo que se quería evitar.
 */
export type ResultadoTurnstile = {
  ok: boolean;
  motivo?: MotivoTurnstile;
  codigos?: string[];
};

interface RespuestaSiteverify {
  success: boolean;
  "error-codes"?: string[];
  hostname?: string;
  action?: string;
}

/**
 * Verifica el token contra Cloudflare.
 *
 * `remoteip` va cuando se tiene: Cloudflare lo usa para afinar su decisión, y
 * omitirlo hace la verificación más laxa sin avisar. Sale de `CF-Connecting-IP`,
 * que la pone el borde y **el cliente no puede falsificar** — a diferencia de
 * `X-Forwarded-For`, que cualquiera puede escribir.
 *
 * `idempotencyKey` permite reintentar la MISMA verificación sin que Cloudflare
 * la rechace por token ya usado. Importa porque un token de Turnstile es de un
 * solo uso: sin esto, un reintento tras un fallo de red daría «token duplicado»
 * y la persona tendría que volver a llenar el formulario por un problema
 * nuestro.
 */
export async function verificar(
  token: string | null | undefined,
  secreto: string | undefined,
  remoteip?: string | null,
  idempotencyKey?: string,
): Promise<ResultadoTurnstile> {
  if (!secreto) return { ok: false, motivo: "no_configurado" };
  if (!token) return { ok: false, motivo: "sin_token" };

  const cuerpo = new FormData();
  cuerpo.append("secret", secreto);
  cuerpo.append("response", token);
  if (remoteip) cuerpo.append("remoteip", remoteip);
  if (idempotencyKey) cuerpo.append("idempotency_key", idempotencyKey);

  let datos: RespuestaSiteverify;
  try {
    const r = await fetch(SITEVERIFY, { method: "POST", body: cuerpo });
    datos = (await r.json()) as RespuestaSiteverify;
  } catch {
    // Un fallo de red al verificar NO es un aprobado. Se devuelve `red` para que
    // quien llame decida — y en el registro, decide rechazar.
    return { ok: false, motivo: "red" };
  }

  if (datos.success) return { ok: true };
  return { ok: false, motivo: "rechazado", codigos: datos["error-codes"] ?? [] };
}

/**
 * El idioma del widget, a partir del locale del producto.
 *
 * Turnstile acepta códigos de idioma; los siete locales del producto se mapean
 * a los cuatro idiomas que Turnstile distingue, con la variante regional donde
 * existe. `pt-BR` y `pt-PT` **sí** son distintos para Turnstile, igual que para
 * nosotros; `es-MX` y `es-ES` no lo son para él, y ahí se manda `es` en vez de
 * inventar una variante que ignoraría.
 */
export function idiomaWidget(locale: string): string {
  const tabla: Record<string, string> = {
    "en": "en",
    "es-MX": "es",
    "es-ES": "es",
    "fr-FR": "fr",
    "pt-BR": "pt-BR",
    "pt-PT": "pt",
    "de-DE": "de",
  };
  return tabla[locale] ?? "auto";
}
