/**
 * enrutador.ts — navegar sin recargar la página, reusando las páginas
 * reales como fuente de datos (D-200.1).
 *
 * ─── Por qué esto existe ─────────────────────────────────────────────────
 *
 * El dueño probó "¿quién juega?" → PIN → mapa y vio una recarga real entre
 * cada paso — cada pantalla es hoy una página nueva, con su propio
 * `Phaser.Game` desde cero. Pidió explícito que se sienta como una sola
 * sesión, sin recargas.
 *
 * ─── Por qué NO hay endpoints JSON nuevos ───────────────────────────────
 *
 * `QuienJuegaMount.astro` y `HistoriaMount.astro` YA serializan los datos
 * de su pantalla en un `<script type="application/json" id="...">` dentro
 * del HTML real que el servidor ya arma (con toda su autenticación:
 * `mc_h`/`mc_k`, D-012). Construir un endpoint JSON paralelo duplicaría esa
 * lógica de servidor — el mismo riesgo que `assets-manifest.ts` ya evitó
 * hoy para los assets: dos copias que un día se separan sin que nadie lo
 * note. En vez de eso, `irA()` pide la MISMA URL con `fetch`, deja que el
 * navegador siga la redirección si la hay, y extrae la isla de datos (o un
 * fragmento de DOM, para pantallas sin isla como el PIN) del HTML devuelto.
 *
 * ─── La garantía de D-012 no se toca ─────────────────────────────────────
 *
 * `/kids/`, `/kids/pin/`, `/kids/mapa/` siguen siendo páginas completas,
 * reales, sin JavaScript — nada de esto las reemplaza. `irA()` es una
 * mejora puramente progresiva: si cualquier paso falla (sin red, HTML
 * inesperado, isla ausente), devuelve `null` y el llamador cae a
 * `window.location.href` — la navegación real de siempre, nunca un estado
 * roto a medias.
 */

export interface ResultadoNavegacion {
  /** La URL final, después de seguir cualquier redirección (303 del PIN, por ejemplo). */
  url: string;
  documento: Document;
}

/**
 * Pide `url` sin dejar que el navegador navegue. `fetch` sigue las
 * redirecciones solo, así que un 303 (PIN correcto) devuelve directamente
 * el HTML del destino — el llamador nunca necesita saber que hubo una
 * redirección de por medio, salvo por `url` (para `pushState`).
 */
export async function irA(url: string, opts?: RequestInit): Promise<ResultadoNavegacion | null> {
  try {
    const res = await fetch(url, { credentials: "same-origin", ...opts });
    if (!res.ok) return null;
    const texto = await res.text();
    const documento = new DOMParser().parseFromString(texto, "text/html");
    return { url: res.url || url, documento };
  } catch {
    // Sin red, CORS, lo que sea: el llamador decide el respaldo (navegación real).
    return null;
  }
}

/** La isla de datos server-side (`id="quien-juega-datos"`/`id="historia-datos"`), ya parseada. `null` si no existe o no es JSON válido. */
export function extraerIsla<T>(documento: Document, id: string): T | null {
  const texto = documento.getElementById(id)?.textContent;
  if (!texto) return null;
  try {
    return JSON.parse(texto) as T;
  } catch {
    return null;
  }
}

/**
 * `extraerFragmento()` VIVÍA AQUÍ y se borró con D-201.
 *
 * Extraía un trozo de DOM del HTML de otra página para meterlo sobre el
 * canvas. Su único consumidor era `puente-pin.ts`, que transplantaba el
 * `<main>` de `kids/pin.astro` — el atajo que costó una sesión entera de
 * defectos en cadena y por el que se escribió D-201. Con el PIN convertido en
 * escena (`PinScene`), no queda nada que transplantar.
 *
 * `extraerIsla()` se queda: leer un `<script type="application/json">` es
 * datos, no marcado. `audits/spa-phaser.mjs` distingue las dos cosas.
 */

/**
 * Actualiza la barra de direcciones sin navegar — para que refrescar,
 * compartir el enlace o el botón atrás/adelante del sistema sigan
 * funcionando contra la MISMA URL real que ya existe.
 *
 * SOLO para la PRIMERA salida de la rejilla ("¿quién juega?" → PIN). Las
 * transiciones DENTRO de la sesión (PIN → mapa, salir del reto → mapa
 * fresco) usan `reemplazarHistorial`, nunca esto — el dueño probó en vivo
 * que empujar una entrada por cada paso hacía que "la flecha" se
 * comportara "como el navegador" (cada toque de atrás deshacía UN paso
 * interno sin que se notara nada, hasta que por fin cruzaba a una página
 * real) en vez de salir de la sesión completa de un solo toque. Con una
 * sola entrada empujada por sesión, un solo "atrás" basta para volver a
 * lo que había antes de tocar una tarjeta — "Tu casa" o lo que sea.
 */
export function empujarHistorial(url: string): void {
  try {
    window.history.pushState({ mcSpa: true }, "", url);
  } catch {
    // Sin `pushState` la navegación en sí ya ocurrió — solo se pierde que la
    // URL se refleje, no la función del botón.
  }
}

/** Actualiza la URL de la entrada de historial ACTUAL, sin agregar una nueva — para no apilar un paso de "atrás" por cada transición interna de la sesión. */
export function reemplazarHistorial(url: string): void {
  try {
    window.history.replaceState({ mcSpa: true }, "", url);
  } catch {
  }
}

/** `manejador(url)` corre cuando el usuario usa atrás/adelante DENTRO de una entrada que este enrutador empujó. */
export function alVolver(manejador: (url: string) => void): () => void {
  const oyente = (ev: PopStateEvent) => {
    if (!(ev.state as { mcSpa?: boolean } | null)?.mcSpa) return;
    manejador(window.location.href);
  };
  window.addEventListener("popstate", oyente);
  return () => window.removeEventListener("popstate", oyente);
}
