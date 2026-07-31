/* Service worker — shell offline
 *
 * Hace cumplir de mc-33:
 *   · implicación 3 — enviar service worker aunque Chrome ya no lo exija como
 *     criterio de instalabilidad; precachear el shell y una página de respaldo
 *   · implicación 6 — la cola offline SIEMPRE se vacía en primer plano.
 *     Background Sync NO existe en Safari, en ninguna versión, y Periodic Sync
 *     además exige app instalada más "engagement score" sin frecuencia
 *     garantizada. Es acelerador de Android, nunca el camino del que se depende.
 *   · implicación 5 — en iOS sin instalar, el almacenamiento se purga a los 7
 *     días sin interacción. Lo que se guarde aquí es efímero por contrato.
 *
 * Estrategias (mc-33 §8): cache-first para estático versionado, network-first
 * para lo que cambia, y una página de respaldo cuando no hay red.
 */

// Subir esta versión invalida todo el caché anterior. Es deliberadamente
// manual: un hash automático invalidaría en cada build aunque nada cambiara,
// y en 4G lento eso son megabytes que el usuario vuelve a pagar sin razón.
const VERSION = "v1";
const SHELL = `shell-${VERSION}`;
const RUNTIME = `runtime-${VERSION}`;

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

// Solo el shell mínimo. Los siete locales NO se precachean: serían siete
// páginas completas descargadas para usar una. Se cachean al visitarse.
const PRECACHE = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      // addAll falla entero si un recurso falla. Se piden uno por uno para que
      // un 404 en un ícono no deje al service worker sin instalar.
      .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL && k !== RUNTIME)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const isHTML = (request) =>
  request.mode === "navigate" ||
  (request.headers.get("accept") ?? "").includes("text/html");

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Nunca cachear rutas autenticadas ni API: un tablero o un perfil servidos
  // desde caché a la persona equivocada en un dispositivo compartido es un
  // problema de privacidad, no de rendimiento.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/app/")) return;

  if (isHTML(request)) {
    // Network-first: el contenido cambia y queremos el fresco cuando hay red.
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME).then((c) => c.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          // Respaldo: cualquier locale que el usuario ya haya visitado, antes
          // que una pantalla de error del navegador.
          for (const loc of LOCALES) {
            const fallback = await caches.match(`/${loc}/`);
            if (fallback) return fallback;
          }
          return new Response(
            "<!doctype html><meta charset=utf-8><title>Sin conexión</title>" +
              "<p style='font-family:system-ui;padding:2rem'>Sin conexión.</p>",
            { headers: { "content-type": "text/html; charset=utf-8" }, status: 503 },
          );
        }),
    );
    return;
  }

  // Estático (íconos, CSS, fuentes): cache-first, que es lo que ahorra viajes
  // redondos en una red con pérdida de paquetes.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(RUNTIME).then((c) => c.put(request, copy));
          }
          return response;
        }),
    ),
  );
});

/* Lo que este archivo deliberadamente NO hace todavía:
 *
 * · No hay cola de intentos offline. Llega en F3, cuando exista un intento que
 *   encolar. Cuando llegue: IndexedDB con llave de idempotencia y marca de
 *   tiempo del cliente, vaciada en `visibilitychange`/focus — nunca confiando
 *   en Background Sync, que no existe en Safari.
 * · No recalcula puntuación. El servidor recalcula desde el registro crudo de
 *   respuestas; un puntaje calculado en el cliente y sincronizado después es el
 *   vector de trampa más obvio que tiene una PWA offline (mc-33 implicación 7).
 * · No precachea audio. Son ~5 MB en la primera instalación (mc-42) y el
 *   auditor precache-budget los vigilará cuando existan.
 */
