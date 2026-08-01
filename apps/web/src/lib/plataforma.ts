/**
 * Qué plataforma está al otro lado. D-031, criterio #128 de F2.
 *
 * ─── D-031 en una frase, y lo que cuesta ───────────────────────────────────
 *
 * «La interfaz **cambia de personalidad según la plataforma**: Material 3 con
 * color dinámico en Android, Human Interface Guidelines en iOS y macOS,
 * controles del sistema en Windows — incluyendo tipografía del sistema, barras
 * de navegación y pestañas nativas, modales propios y los gestos que cada
 * plataforma espera.»
 *
 * La decisión dice también lo que cuesta: **aproximadamente el doble** en
 * componentes, diseño y pruebas, pagado en cada función nueva y no una sola vez.
 * Y lo que compra: que no se sienta web. `mc-22` documenta que los adolescentes
 * abandonan sin diagnosticar el problema — «no se culpan a sí mismos, te culpan
 * a ti».
 *
 * ─── Se resuelve en el SERVIDOR, y eso no es una preferencia ───────────────
 *
 * `docs/guia-de-estilo.md` lo dice sin matiz: **«No se detecta la plataforma en
 * JavaScript. Una detección en JS fallaría justo en la primera pintura, que es
 * donde importa.»**
 *
 * Un tema que se aplica después del primer render es el destello que ve alguien
 * en un Android de gama baja sobre 4G lento — el mismo argumento por el que
 * `data-band` lo escribe el servidor en `app/kids`. Así que aquí se lee la
 * cabecera y se escribe `data-platform` en el `<html>` **antes de que salga el
 * primer byte**.
 *
 * ─── Qué se lee, en orden de fiabilidad ────────────────────────────────────
 *
 *  1. `Sec-CH-UA-Platform` — la pista de cliente. Es la vía correcta y la que
 *     Chromium manda sin pedirla. Llega entrecomillada: `"Android"`.
 *  2. El `User-Agent`, solo como respaldo. Safari y Firefox no mandan la pista
 *     de cliente, y son la mitad del mercado de iOS y de escritorio.
 *
 * ─── Lo que esto NO es ─────────────────────────────────────────────────────
 *
 * **No es huella del dispositivo.** Se leen dos cabeceras que el navegador manda
 * a todo el mundo, no se combinan señales, no se guarda nada y no se identifica
 * a nadie. Una huella de dispositivo sería biometría de comportamiento y la
 * línea roja #1 la prohíbe.
 *
 * **No son controles nativos de verdad.** Una PWA no puede instanciar un
 * `UIButton` ni un `MaterialButton`: adopta su lenguaje —forma, elevación,
 * radios, dónde vive la navegación, qué gesto se espera— y usa la tipografía
 * del sistema, que sí es la real. Decir lo contrario sería mentir sobre lo que
 * la plataforma permite.
 */

export type Plataforma = "android" | "ios" | "macos" | "windows" | "otro";

/**
 * Todas las plataformas, para que las hojas de estilo y el auditor puedan
 * comprobar que ninguna se quedó sin su bloque.
 */
export const PLATAFORMAS: Plataforma[] = ["android", "ios", "macos", "windows", "otro"];

/**
 * El iPad es la trampa clásica de esta detección.
 *
 * Desde iPadOS 13 Safari se anuncia como **Macintosh** por defecto. Un iPad
 * tratado como macOS recibiría la personalidad de escritorio en un aparato
 * táctil, y D-041 dice que el iPad es de primera clase. Se distingue por la
 * pista de móvil o por el máximo de puntos de contacto, que en un Mac es 0 y en
 * un iPad es 5 — pero eso último solo se sabe en el cliente.
 *
 * Aquí, en el servidor, se usa lo que sí llega: si la petición dice `Macintosh`
 * **y** trae la marca de móvil, es un iPad.
 */
export function plataformaDe(headers: Headers): Plataforma {
  // 1. La pista de cliente. Llega como `"Android"`, con comillas incluidas.
  const pista = (headers.get("sec-ch-ua-platform") ?? "").replace(/"/g, "").trim().toLowerCase();
  const movil = headers.get("sec-ch-ua-mobile") === "?1";

  if (pista) {
    if (pista === "android") return "android";
    if (pista === "ios") return "ios";
    if (pista === "windows") return "windows";
    // Un «macOS» con marca de móvil es un iPad (ver arriba).
    if (pista === "macos") return movil ? "ios" : "macos";
    // `Chrome OS`, `Linux`, `Unknown` y lo que venga.
    return "otro";
  }

  // 2. Respaldo por User-Agent. Safari y Firefox no mandan la pista.
  const ua = headers.get("user-agent") ?? "";
  // El orden importa: `iPad` y `iPhone` antes que `Macintosh`, porque un iPad
  // moderno dice las dos cosas.
  if (/\bAndroid\b/i.test(ua)) return "android";
  if (/\b(iPhone|iPad|iPod)\b/i.test(ua)) return "ios";
  // Un `Macintosh` con soporte táctil declarado es un iPad enmascarado.
  if (/\bMacintosh\b/i.test(ua)) return /\bMobile\b/i.test(ua) ? "ios" : "macos";
  if (/\bWindows\b/i.test(ua)) return "windows";
  return "otro";
}

/**
 * ¿Es una plataforma donde la navegación vive ABAJO?
 *
 * Android e iOS ponen la navegación principal al alcance del pulgar — barra de
 * navegación de Material 3 y barra de pestañas de HIG. En escritorio va arriba,
 * porque ahí el pulgar no existe y el borde inferior es donde vive la barra de
 * tareas o el Dock.
 *
 * Se exporta como función y no se decide en CSS con una consulta de medios
 * porque **no es una cuestión de ancho**: un iPad en horizontal es ancho y sigue
 * queriendo la barra abajo, y una ventana estrecha en un escritorio no la quiere.
 */
export function navegacionAbajo(p: Plataforma): boolean {
  return p === "android" || p === "ios";
}
