// @ts-check
import { writeFileSync, readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import { redirecciones } from "./src/i18n/rutas-tabla.mjs";

/**
 * Escribe `dist/_redirects` con las 301 desde las URLs anteriores a D-049.
 *
 * Va aquí y no en `public/` porque un archivo en `public/` es una copia: se
 * escribe a mano una vez y se queda viejo la siguiente vez que alguien toque la
 * tabla de segmentos. Generarlo en cada build lo hace imposible de olvidar.
 *
 * `_redirects` es el formato de Cloudflare para redirecciones de assets, así
 * que estas son 301 de verdad —el navegador y el rastreador ven el código de
 * estado— y no un `<meta refresh>`, que Google trata como una señal débil.
 */
function redireccionesD049() {
  return {
    name: "mc-redirecciones-d049",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const lineas = redirecciones();
        const cabecera = [
          "# Generado por astro.config.mjs desde src/i18n/rutas-tabla.mjs (D-049).",
          "# NO editar a mano: se reescribe en cada build.",
          "#",
          "# Antes de D-049 los siete locales compartían el segmento español.",
          "# Estas URLs se publicaron y están en el sitemap; siguen resolviendo.",
          "",
        ];
        writeFileSync(
          fileURLToPath(new URL("_redirects", dir)),
          cabecera.concat(lineas).join("\n") + "\n",
          "utf8",
        );
        logger.info(`_redirects — ${lineas.length} redirección(es) 301 desde las URLs previas a D-049`);
      },
    },
  };
}

/**
 * Escribe `dist/assets-version.json` con un hash de los BYTES reales de
 * `public/{juego,mapa,avatares}` (D-200).
 *
 * El dueño pidió explícito "un sistema de versiones... que si sube sepa que
 * tiene que bajar de nuevo toda la aplicación" — para que `CargaGlobalScene`
 * sepa cuándo el catálogo de Phaser (imágenes/audio) cambió y hay que
 * refrescar el caché del service worker, en vez de servir bytes viejos para
 * siempre. Automático a propósito, y limitado a estas tres carpetas — no a
 * `dist` entero — por la MISMA razón que `sw.js` fija su `VERSION` a mano:
 * un hash del sitio completo invalidaría el catálogo en cada deploy de HTML
 * aunque ni una imagen hubiera cambiado, y en 4G lento eso son megabytes que
 * el niño vuelve a pagar sin motivo. Solo cambia cuando de verdad cambia un
 * archivo dentro de estas tres carpetas — agregar uno nuevo, borrar uno,
 * o regenerar el mismo nombre con arte distinto.
 */
function activosVersionD200() {
  // "esqui" agregado 2026-08-12: el modo Esquí/Deslizada precarga su arte
  // igual que el resto (decisión del dueño) — sin esta carpeta aquí, un
  // cambio futuro a esos archivos nunca subiría la versión y un dispositivo
  // ya precargado se quedaría con bytes viejos para siempre.
  const CARPETAS = ["juego", "mapa", "avatares", "esqui"];

  function archivosOrdenados(base) {
    const resultado = [];
    const recorrer = (ruta) => {
      for (const nombre of readdirSync(ruta).sort()) {
        const completa = `${ruta}/${nombre}`;
        if (statSync(completa).isDirectory()) recorrer(completa);
        else resultado.push(completa);
      }
    };
    recorrer(base);
    return resultado;
  }

  return {
    name: "mc-activos-version-d200",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const hash = createHash("sha256");
        let total = 0;
        for (const carpeta of CARPETAS) {
          const base = fileURLToPath(new URL(`${carpeta}/`, dir));
          let archivos;
          try {
            archivos = archivosOrdenados(base);
          } catch {
            continue; // Carpeta ausente en este build — no es un error.
          }
          for (const ruta of archivos) {
            hash.update(ruta.slice(base.length));
            hash.update(readFileSync(ruta));
            total++;
          }
        }
        const version = hash.digest("hex").slice(0, 16);
        writeFileSync(
          fileURLToPath(new URL("assets-version.json", dir)),
          JSON.stringify({ version, archivos: total }),
          "utf8",
        );
        logger.info(`assets-version.json — ${version} (${total} archivos en ${CARPETAS.join("/")})`);
      },
    },
  };
}

/**
 * ─── Dos integraciones de assets, y por qué conviven (por ahora) ───────────
 *
 * `activosVersionD200()` (arriba) escribe `assets-version.json`: UN hash de
 * las tres carpetas. Es lo que `carga-assets.ts` lee hoy para decidir si
 * vuelve a precargar, y está en producción — quitarlo rompería el precargador
 * global.
 *
 * Ésta escribe `manifest-assets.json`: hash y tamaño POR archivo, que es lo
 * que el loader nuevo necesita para dos cosas que hoy nadie puede hacer:
 *
 *  1. **Bajar solo lo que cambió.** Con un hash global, tocar UN archivo
 *     invalida el catálogo entero y el niño vuelve a pagar 5 MB en 4G lento.
 *     Con hash por archivo, se baja el que cambió y el resto sale de caché.
 *  2. **Mostrar progreso real.** Un porcentaje por CONTEO de archivos miente:
 *     un fondo de 300 KB y un icono de 8 KB cuentan igual, así que la barra
 *     salta y se atasca. Ponderado por `size` avanza como avanza la descarga.
 *
 * El hash es del CONTENIDO y no una versión a mano: una lista que alguien
 * tiene que acordarse de subir se queda vieja el día que no lo haga, y el
 * dispositivo conserva el asset viejo sin que nada avise.
 *
 * Y cubre `cosmeticos` — 42 archivos y 1.2 MB que el candado de arriba deja
 * fuera, justo el modo de falla que advierte `scripts/gen-pin-dibujos.mjs`.
 *
 * Se unifican cuando el loader sustituya a `CargaGlobalScene`: el manifiesto
 * ya trae una `version` global derivada de los hashes individuales, así que
 * `assets-version.json` pasará a ser un campo suyo. Hasta entonces, dos
 * recorridos de directorio en el build son más baratos que un precargador
 * roto.
 */
function manifiestoDeAssets() {
  // "esqui" agregado 2026-08-12, mismo motivo que en `activosVersionD200()`
  // arriba: es la carpeta que `CargaAssetsScene` de verdad descarga (lee
  // este `manifest-assets.json`, no las listas de `assets-manifest.ts`), así
  // que sin esto aquí el modo Esquí nunca se habría precargado pese a estar
  // declarado ahí.
  const CARPETAS = ["juego", "mapa", "avatares", "cosmeticos", "esqui"];
  return {
    name: "mc-manifiesto-assets",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const { createHash } = await import("node:crypto");
        const { readdirSync, statSync, readFileSync, existsSync } = await import("node:fs");
        const { join, relative } = await import("node:path");

        const raiz = fileURLToPath(dir);
        const assets = [];

        /** Recorre en orden alfabético: dos builds del mismo árbol dan el mismo JSON. */
        const recorrer = (abs) => {
          for (const entrada of readdirSync(abs).sort()) {
            const ruta = join(abs, entrada);
            const st = statSync(ruta);
            if (st.isDirectory()) {
              recorrer(ruta);
              continue;
            }
            const url = relative(raiz, ruta).split("\\").join("/");
            const bytes = readFileSync(ruta);
            assets.push({
              // La clave es el nombre sin extensión: la misma que usan
              // `this.load.image(clave, url)` y `textures.exists(clave)`, así
              // que el manifiesto habla el idioma de Phaser sin traducir.
              key: entrada.replace(/\.[^.]+$/, ""),
              url: `/${url}`,
              hash: createHash("sha1").update(bytes).digest("hex").slice(0, 12),
              size: st.size,
              // Legible para el HUD del loader. Sin diccionario a mano: el
              // nombre del archivo YA describe la pieza, y un catálogo de
              // etiquetas por locale sería otra lista que se queda vieja.
              label: entrada
                .replace(/\.[^.]+$/, "")
                .replace(/[-_]/g, " ")
                .replace(/^\w/, (c) => c.toUpperCase()),
            });
          }
        };

        for (const carpeta of CARPETAS) {
          const abs = join(raiz, carpeta);
          if (existsSync(abs)) recorrer(abs);
        }

        /**
         * Un asset por CLAVE, quedándose con el `.webp`.
         *
         * 53 piezas están en disco dos veces, en AVIF y WebP (`mc-47` §5 pide
         * AVIF con respaldo WebP para el `<img>` del sitio). Sin deduplicar,
         * el loader bajaría **1.23 MB de AVIF que Phaser nunca pide**
         * —`load.image()` recibe UNA url, y en todo el repo es la `.webp`— y
         * la barra llegaría al 100% habiendo descargado el doble.
         */
        const porClave = new Map();
        for (const a of assets) {
          const previo = porClave.get(a.key);
          if (!previo || (previo.url.endsWith(".avif") && a.url.endsWith(".webp"))) {
            porClave.set(a.key, a);
          }
        }
        const unicos = [...porClave.values()].sort((x, y) => (x.key < y.key ? -1 : 1));
        const descartados = assets.length - unicos.length;

        // La versión global se deriva de los hashes individuales: si ninguno
        // cambió, no cambia — el loader puede saltarse el diff entero con una
        // sola comparación.
        const version = createHash("sha256")
          .update(unicos.map((a) => `${a.key}:${a.hash}`).join("\n"))
          .digest("hex")
          .slice(0, 16);
        const total = unicos.reduce((n, a) => n + a.size, 0);

        writeFileSync(
          fileURLToPath(new URL("manifest-assets.json", dir)),
          JSON.stringify({ version, total, assets: unicos }),
          "utf8",
        );
        logger.info(
          `manifest-assets.json — ${unicos.length} assets, ${(total / 1024 / 1024).toFixed(2)} MB, ` +
            `versión ${version}${descartados > 0 ? ` (${descartados} .avif duplicados descartados)` : ""}`,
        );
      },
    },
  };
}

// Los siete locales (D-022). No cinco idiomas: es-MX y es-ES no comparten
// separador decimal, pt-BR y pt-PT no comparten escala numérica (mc-34).
// El auditor audits/locales-complete.mjs verifica que esta lista y la de
// wrangler.jsonc no se separen.
const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

export default defineConfig({
  site: "https://math.kilowatto.com",
  adapter: cloudflare({
    imageService: "compile",
    // El sitio se compila como estático y no necesita levantar el proxy local
    // de bindings durante `astro build`. En CI/entornos sin un puerto local
    // disponible ese proxy falla con `getaddrinfo ENOTFOUND localhost`; las
    // rutas dinámicas siguen recibiendo sus bindings en el Worker desplegado.
    platformProxy: { enabled: false },
    // El limitador de tasa es un Durable Object, y un DO tiene que ser una
    // exportación con nombre del módulo raíz del Worker — no puede vivir dentro
    // de una ruta de Astro. `namedExports` es lo que impide que el empaquetado
    // lo tire por no estar referenciado; sin esta lista el despliegue falla con
    // «class not found» y el síntoma aparece en producción, no al construir.
    workerEntryPoint: {
      path: "src/worker.ts",
      namedExports: ["RateLimiter", "Aprendiz", "Liga", "Misiones", "Salon"],
    },
  }),
  integrations: [redireccionesD049(), activosVersionD200(), manifiestoDeAssets()],

  // D-033: mismo host, sitio en la raíz y app en rutas autenticadas, para que
  // la autoridad de dominio se concentre en un lugar (mc-48).
  output: "static",

  i18n: {
    defaultLocale: "en",
    locales: LOCALES,
    routing: {
      // `en` también lleva prefijo. Sin esto, la raíz sirve inglés sin ruta
      // propia y el hreflang recíproco de S0 no puede cerrar el ciclo.
      prefixDefaultLocale: true,
      // `false` a propósito. Con `true`, Astro genera su PROPIO stub en `/`
      // —`<meta http-equiv="refresh" content="2;url=/en/">`— que pisa a
      // `src/pages/index.astro` y es violación CRÍTICA de WCAG 2.2.1: un
      // refresco retardado le quita la página de debajo a quien lee despacio.
      // Encima el stub de Astro no lleva `lang`, así que falla también 3.1.1.
      //
      // Con `false`, la raíz la sirve nuestra página, que elige el locale del
      // navegador con `location.replace` y deja un enlace visible para quien no
      // tiene JavaScript.
      redirectToDefaultLocale: false,
    },
  },

  build: {
    // "directory" produce /en/index.html, que sirve en /en/ — la misma URL que
    // declaran el canonical y los hreflang del layout.
    //
    // Con "file" generaba /en.html: el navegador llegaba igual, pero el
    // canonical apuntaba a una URL distinta del archivo, y el ciclo de hreflang
    // no cerraba. Ese es exactamente el fallo que hace que Google ignore el
    // grupo de idiomas completo (mc-48 §3).
    format: "directory",
  },

  vite: {
    // `.env` vive en la RAÍZ del monorepo y Astro compila desde `apps/web`, así
    // que sin esto Vite busca `apps/web/.env` y no encuentra nada. El síntoma no
    // es un error: es un widget de Turnstile que simplemente no se pinta, y una
    // página que parece correcta.
    envDir: "../..",
    // Las variables sin prefijo `PUBLIC_` no llegan al build. `TURNSTILE_SITE_KEY`
    // ES pública por diseño —viaja en el HTML de cada página— pero se llama como
    // la nombra Cloudflare, no con el prefijo de Astro, así que se declara aquí.
    // La SECRETA no está en esta lista y no debe estarlo: vive en
    // `wrangler secret put` y solo la ve el servidor.
    envPrefix: ["PUBLIC_", "TURNSTILE_SITE_"],
    // Este entorno no publica `localhost` en DNS; Vite intenta resolverlo al
    // sincronizar colecciones incluso durante un build estático. Usar el
    // loopback numérico evita esa dependencia sin exponer el servidor.
    server: { host: "127.0.0.1" },
    build: {
      // El presupuesto de bundle lo hace cumplir audits/bundle-budget.mjs.
      // Este aviso es la señal temprana, antes de que el auditor bloquee.
      chunkSizeWarningLimit: 150,
    },
  },
});
