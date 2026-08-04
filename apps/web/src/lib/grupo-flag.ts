/**
 * La bandera que enciende F9 por mercado. Issue #387, D-087.
 *
 * ─── Apagado por construcción ────────────────────────────────────────────────
 *
 * `CONFIG_KV.f9_enabled_<locale>` vale "1" en los mercados donde la superficie
 * de grupos está activa (`en`, `es-MX`, `es-ES`, `pt-BR` al lanzar) y NO EXISTE
 * en los demás: la llave ausente es el estado apagado, así que el default —
 * una cuenta nueva, un locale nuevo, un despliegue sin la llave— es siempre el
 * seguro. `fr-FR`, `pt-PT` y `de-DE` esperan la revisión legal de GDPR Art. 8
 * y el Children's Code británico: la condición que enciende sus llaves es una
 * confirmación legal escrita, no una fecha (criterio de la issue #387).
 *
 * Mismo patrón que `max_child_profiles_free` de F2: una llave por valor, leída
 * en el servidor en cada ruta. Las siete autorías de `i18n/grupos/` existen
 * igual — la bandera controla la ACTIVACIÓN, no la existencia del texto
 * (criterio de #387: el copy apagado no cuesta nada y evita el «locale
 * olvidado» al encender).
 *
 * ─── Sin nagging (D-026) ─────────────────────────────────────────────────────
 *
 * La bandera solo decide si la entrada a `/app/grupos/` se muestra y si las
 * rutas responden. No hay carrusel, no hay aviso de «ya está disponible», no
 * hay cuenta regresiva: el mercado apagado simplemente no ve la superficie.
 */

/** La lista de locales, escrita aquí como en `api/padre-limite.ts`: importar
 * `i18n/index.ts` arrastraría los siete JSON de mensajes a cada ruta. */
const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

/**
 * ¿Está encendida la superficie de grupos para este locale?
 *
 * Falla CERRADO en los tres sentidos: sin binding KV, sin llave, o un error
 * leyendo, la respuesta es `false`. Lo que no se puede comprobar, se niega —
 * la misma regla que la autorización del padre en `padre-limite.ts`.
 */
export async function f9Habilitado(
  kv: KVNamespace | undefined,
  locale: string,
): Promise<boolean> {
  if (!kv || !LOCALES.includes(locale)) return false;
  try {
    return (await kv.get(`f9_enabled_${locale}`)) === "1";
  } catch {
    return false;
  }
}
