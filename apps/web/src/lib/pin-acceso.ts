/**
 * La puerta común de los tres endpoints de PIN del niño (D-201).
 *
 * ─── Por qué existe este archivo y no tres copias ──────────────────────────
 *
 * `pin-datos`, `pin-entrar` y `pin-elegir` comparten exactamente la misma
 * pregunta antes de hacer nada: *¿viene esto de un dispositivo que el adulto
 * marcó como de la casa, y ese perfil es de esa casa?* Es la autorización de
 * D-012 entera, y triplicarla sería tres sitios donde endurecerla a medias.
 *
 * ─── La autorización es el DISPOSITIVO, no una sesión ──────────────────────
 *
 * Un niño de cuatro años no tiene cuenta (línea roja #2). Lo único que
 * demuestra que puede tocar esta superficie es `mc_h`: la cookie que el adulto
 * dejó al marcar la tablet como de la casa. Por eso estos endpoints NO piden
 * `leerSesionAdulto` — a diferencia de `/api/perfil-pin`, que sí lo hace
 * porque ahí el adulto está presente cambiando el PIN de un hijo.
 *
 * ─── Nunca un oráculo de existencia ────────────────────────────────────────
 *
 * Un `childId` que no existe y uno que existe pero es de otra casa devuelven
 * **exactamente la misma** respuesta. Distinguirlos con dos códigos convertiría
 * la ruta en un oráculo que confirma si un id es real, y estos ids viajan en la
 * URL. Es la misma razón por la que `kids/pin.astro` redirige a la raíz en los
 * dos casos en vez de responder 404 en uno y 403 en el otro.
 */
import {
  COOKIE_HOGAR,
  leerCookies,
  leerDispositivoDelHogar,
  type DispositivoDelHogar,
} from "./sesiones.ts";
import type { TemaVisual } from "./quien-juega-datos.ts";

export interface Env {
  DB: D1Database;
  SESSION_KV: KVNamespace;
  /**
   * El secreto del que salen las rejillas y los hashes. Va con
   * `wrangler secret put PIN_PAD_SECRET`, **nunca** en `wrangler.jsonc`: si se
   * filtrara, las nueve casillas de cada niño dejarían de ser un secreto
   * derivado y pasarían a ser un cálculo que cualquiera repite.
   */
  PIN_PAD_SECRET?: string;
}

/**
 * Ninguna respuesta de estas rutas se guarda en ninguna caché.
 *
 * `vary: cookie` porque la respuesta depende de `mc_h`, y `referrer-policy`
 * porque el `child_profile_id` viaja en la URL de `pin-datos`: es un id opaco y
 * no un dato personal (línea roja #2), pero no tiene por qué salir de este
 * origen. Copiadas de `kids/pin.astro`, que es de donde esta superficie viene —
 * al borrar esa página estas cabeceras se habrían ido con ella.
 */
export const CABECERAS_PRIVADAS: Record<string, string> = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store, private",
  vary: "cookie",
  "referrer-policy": "same-origin",
  "x-robots-tag": "noindex, nofollow",
};

export const json = (value: unknown, status = 200, extra?: Record<string, string>) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { ...CABECERAS_PRIVADAS, ...extra },
  });

export interface PerfilDePin {
  id: string;
  alias: string;
  locale: string;
  parent_user_id: string;
  theme_band: TemaVisual;
  avatar_parts: string | null;
  pin_hash: string | null;
  /** `null` mientras no haya `pin_hash`. Con hash SIEMPRE viene puesto (D-197 §2). */
  tipo: "imagenes" | "numerico" | null;
}

/**
 * Concedido y negado se distinguen por la PRESENCIA de `respuesta`, no por una
 * bandera `ok`.
 *
 * No es estilo: `apps/web` no tiene `tsconfig.json` propio, y sin
 * `strictNullChecks` TypeScript **no estrecha** una unión por un literal
 * booleano — `if (!acceso.ok) return acceso.respuesta` daba
 * `ts(2339): Property 'respuesta' does not exist`. El operador `in` sí
 * estrecha en ese modo. La bandera `ok` se quitó a propósito para que no
 * quede un camino que compila mal y parece bien.
 *
 *     if ("respuesta" in acceso) return acceso.respuesta;   // negado
 */
export interface AccesoConcedido {
  hogar: DispositivoDelHogar;
  perfil: PerfilDePin;
  secreto: string;
}

export interface AccesoNegado {
  respuesta: Response;
}

/**
 * 0-RTT es replicable **por diseño** (RFC 8470).
 *
 * Quien capture los bytes de un intento acertado podría reenviarlos para abrir
 * sesión otra vez. Se responde 425 y el navegador reintenta solo, ya con el
 * apretón de manos completo: el niño no ve nada. La zona tiene 0-RTT activo
 * porque ahorra un viaje entero de red en el dispositivo de referencia, así que
 * esto no es teórico.
 *
 * Solo lo llaman las rutas que ESCRIBEN (entrar, elegir). Un GET idempotente
 * no gana nada con rechazarse.
 */
export function esEarlyData(request: Request): boolean {
  return request.headers.get("early-data") === "1";
}

/**
 * ¿Puede esta petición tocar el PIN de este perfil?
 *
 * @param childId el `child_profile_id`, tal como viene del cliente
 */
export async function accesoAlPin(
  env: Env | undefined,
  request: Request,
  childId: string,
): Promise<AccesoConcedido | AccesoNegado> {
  if (!env?.DB || !env?.SESSION_KV || !env?.PIN_PAD_SECRET) {
    // Sin el secreto no se puede derivar ni verificar nada, y una rejilla
    // inventada sería peor que un error: el niño tocaría sus tres dibujos y no
    // entraría nunca.
    return { respuesta: json({ error: "sin_bindings" }, 503) };
  }

  const cookies = leerCookies(request.headers.get("cookie"));

  // El `try` no es adorno defensivo, y es el mismo de `kids/pin.astro`: si la
  // consulta revienta —tabla que no existe, base caída— un fallo de lectura
  // significa operativamente que no se pudo demostrar que este aparato sea de
  // la casa. Así que no lo es: se falla CERRADO y en silencio.
  let hogar: DispositivoDelHogar | null = null;
  try {
    hogar = await leerDispositivoDelHogar(env.DB, cookies[COOKIE_HOGAR]);
  } catch (err) {
    console.error("pin: no se pudo leer el dispositivo del hogar", String(err).slice(0, 200));
  }
  if (!hogar) return { respuesta: json({ error: "sin_permiso" }, 403) };

  if (!childId) return { respuesta: json({ error: "sin_permiso" }, 403) };

  let perfil: PerfilDePin | null = null;
  try {
    // El `parent_user_id = ?` contra el dueño del dispositivo ES la
    // autorización: un id de otro hogar no devuelve fila. El `LEFT JOIN` es a
    // propósito — un perfil sin PIN elegido todavía es un caso real, no un
    // error de datos, y es justo el que manda a la pantalla de elegir.
    perfil = await env.DB.prepare(
      "SELECT c.id, c.alias, c.locale, c.parent_user_id, c.theme_band, c.avatar_parts, " +
        "p.pin_hash, p.tipo " +
        "FROM child_profiles c LEFT JOIN child_image_pin p ON p.child_profile_id = c.id " +
        "WHERE c.id = ? AND c.parent_user_id = ? AND c.deleted_at IS NULL",
    )
      .bind(childId, hogar.ownerUserId)
      .first<PerfilDePin>();
  } catch (err) {
    console.error("pin: no se pudo leer el perfil", String(err).slice(0, 200));
  }

  // Mismo error para «no existe» y «es de otra casa». Ver el encabezado.
  if (!perfil) return { respuesta: json({ error: "sin_permiso" }, 403) };

  return { hogar, perfil, secreto: env.PIN_PAD_SECRET };
}

/**
 * Qué tipo de PIN usa este perfil.
 *
 * **Lo decide la BASE, nunca el cliente ni la banda a secas.** `child_image_pin
 * .tipo` es lo que de verdad dice cómo se calculó el hash guardado, y es lo
 * único con lo que se puede verificar. La banda solo manda cuando todavía no
 * hay PIN — o sea, cuando estamos a punto de crear el primero.
 */
export function tipoDePin(perfil: PerfilDePin): "imagenes" | "numerico" {
  if (perfil.tipo) return perfil.tipo;
  return perfil.theme_band === "KINDER" ? "imagenes" : "numerico";
}

/**
 * El locale del perfil, con la FORMA validada — no la pertenencia a la lista.
 *
 * ─── Por qué no se usa `isLocale()` de `i18n/index.ts` ─────────────────────
 *
 * Ese módulo importa los siete catálogos `.json` sin `with { type: "json" }`.
 * Astro lo resuelve en el build, pero **Node no puede importarlo directamente**
 * — y estos endpoints se ejecutan de verdad, con Node, en
 * `pin-endpoints.prueba.mjs`. Traer `isLocale` haría imposible probarlos, que
 * es un precio mucho más alto que el que compra.
 *
 * Y compra poco aquí: este valor no elige ningún catálogo de textos (estas
 * rutas no pintan una sola palabra), solo se interpola en la URL de destino.
 * El riesgo real es la inyección de segmentos —un `../` o una barra en el
 * locale—, y contra eso una comprobación de forma es exacta. Un locale que
 * pase la forma pero no exista daría un 404 en su propia URL, que es un fallo
 * visible y acotado; un `//evil.com` en la ruta no lo sería.
 *
 * El valor por defecto duplica a propósito el `DEFAULT_LOCALE` de `i18n`: una
 * constante de dos letras es más barata de repetir que un import que rompe las
 * pruebas, y si algún día divergen el síntoma es un idioma, no un fallo.
 */
export function localeSeguro(valor: string | null | undefined): string {
  return valor && /^[a-z]{2}(-[A-Z]{2})?$/.test(valor) ? valor : "en";
}
