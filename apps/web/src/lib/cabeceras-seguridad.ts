/**
 * Las seis cabeceras de seguridad, para las respuestas que SÍ genera el Worker
 * (issue #337).
 *
 * ─── Por qué este módulo existe ────────────────────────────────────────────
 *
 * `apps/web/public/_headers` es el formato de Cloudflare para ASSETS estáticos:
 * ahí llegan las seis cabeceras a las ~400 páginas prerrenderizadas del sitio
 * público. Pero las rutas SSR —`/app/**` (el área privada: la casa del adulto,
 * los perfiles de los hijos, la pantalla de jugar) y `/api/**` (sesión,
 * passkeys, el reto)— no lo leen. El resultado medido era que la parte con la
 * sesión y los datos de los menores era exactamente la que no tenía CSP, ni
 * `X-Frame-Options`, ni `Permissions-Policy` — y la parte pública, que no tiene
 * nada que perder, sí.
 *
 * Las mismas seis cabeceras con los mismos valores viven ahora en dos sitios:
 * aquí (para el Worker, vía `src/middleware.ts`) y en `_headers` (para los
 * assets). La duplicidad es obligada por la plataforma —Cloudflare no ofrece un
 * solo lugar para ambos— y lo que la hace segura es el auditor
 * `audits/cabeceras-ssr.mjs`, que compara los dos textos y bloquea si se
 * separan.
 *
 * ─── Las decisiones que estos valores cargan ───────────────────────────────
 *
 * · **CSP en modo OBSERVACIÓN (`Report-Only`).** Decisión del dueño
 *   (2026-08-02, en `_headers` desde #329): estricta cuando pasen días sin
 *   reportes. Una CSP mal puesta no degrada: rompe la página entera. El riesgo
 *   aceptado y escrito es quedarse en este modo para siempre. `'unsafe-inline'`
 *   en script-src es real y hace falta: hay scripts inline propios (passkeys,
 *   PIN, detección de plataforma, el bucle de juego), y con páginas estáticas
 *   los nonces no sirven — el hash sí, y es el siguiente paso.
 *
 * · **HSTS sin `preload`.** Salir de la lista de precarga tarda meses y afecta
 *   a TODO `kilowatto.com`, incluidos otros proyectos del dueño.
 *
 * · **`Permissions-Policy` es la línea roja #1 hecha cabecera.** Nunca cámara,
 *   nunca micrófono, nunca biometría, nunca geolocalización — que lo haga
 *   cumplir el navegador aunque alguien escriba el código que la cruza. En una
 *   pantalla de niño es donde más importa, y era justo donde no estaba.
 *
 *   **`gyroscope`/`accelerometer` sí se abrieron (D-196, 2026-08-09)** para el
 *   parallax 2.5D del Larry fotorrealista de `QuienJuegaScene` — orientación
 *   del aparato, no captura del entorno ni dato biométrico, así que NO es la
 *   línea roja #1 (que sigue intacta: cámara/micrófono/biometría/geolocalización
 *   sin tocar). El dueño lo autorizó explícito viendo el conflicto. Como esta
 *   cabecera es una sola para TODO `/app/**`+`/api/**` (no hay forma de acotarla
 *   por ruta), el techo se abre en todo el sitio, pero solo `QuienJuegaScene`
 *   de hecho pide el evento — abrir el permiso no hace que otra pantalla lo
 *   use. `magnetometer` se queda cerrado a propósito: no hace falta para
 *   este efecto, y no hay razón para abrir más de lo que se usa.
 *
 * ─── Lo que este módulo NO toca ────────────────────────────────────────────
 *
 * `Cache-Control`. Cada ruta SSR ya pone su propio `no-store` (un perfil
 * servido desde caché a la persona equivocada en un aparato compartido es
 * privacidad, no rendimiento), y una cabecera global aquí podría pisarlo.
 */
export const CABECERAS_SEGURIDAD: Readonly<Record<string, string>> = {
  "content-security-policy-report-only":
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; " +
    "style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; " +
    "frame-src https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; " +
    "form-action 'self'; object-src 'none'",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-frame-options": "DENY",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), " +
    "magnetometer=(), gyroscope=(self), accelerometer=(self)",
};
