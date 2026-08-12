/**
 * La caché de assets del loader: qué hay guardado en este dispositivo, y con
 * qué hash.
 *
 * ─── Qué problema resuelve ─────────────────────────────────────────────────
 *
 * `dist/manifest-assets.json` dice qué assets existen hoy en el servidor y con
 * qué hash de contenido. Esta capa dice cuáles de ellos **ya están en este
 * dispositivo**. La resta de las dos listas es lo único que hay que descargar.
 *
 * Sin ella, el loader tendría que bajar el catálogo entero —13.15 MB— cada vez
 * que cambia un solo archivo, porque el candado de D-200 es un hash global.
 *
 * ─── Por qué NO `localStorage` ─────────────────────────────────────────────
 *
 * Solo guarda texto y ronda los 5 MB. Un solo fondo de bioma no cabe, y meter
 * binarios en base64 los infla un 33% para acabar chocando con el límite a los
 * pocos archivos. `Cache API` guarda `Response` completas, sin límite fijo, y
 * es la misma pieza que ya usa el service worker del proyecto.
 *
 * ─── Dos implementaciones, una interfaz ────────────────────────────────────
 *
 * `WebAssetCache` es la que corre hoy, en el navegador y en la PWA instalada.
 * `CapacitorAssetCache` es para cuando la app se empaquete como nativa: el
 * `Filesystem` de Capacitor persiste de verdad y sin la cuota que el navegador
 * puede reclamar (`mc-33`: una PWA no instalada pierde el almacenamiento a los
 * 7 días).
 *
 * **Capacitor no está en este repo todavía** — no hay dependencia, ni
 * `capacitor.config`, ni nada. Esa implementación se escribe ahora por
 * decisión explícita del dueño, con import dinámico para que el build no
 * dependa de un paquete ausente, y **no se puede probar en ningún entorno de
 * este proyecto**. Queda dicho aquí y no en un informe aparte.
 */

/**
 * Un asset tal como lo describe `manifest-assets.json`.
 *
 * **Los nombres de campo son los que emite `manifiestoDeAssets()` en
 * `astro.config.mjs`, y son inglés porque el código de este repo es inglés.**
 * Esta interfaz decía `clave` y costó cuatro despliegues a ciegas: el loader
 * leía `a.clave` de 243 objetos que traían `key`, encolaba 243 archivos sin
 * clave, y Phaser reventaba con `Invalid File key: false` dentro del callback
 * del manifiesto — sin que `astro check` viera nada, porque `load.json()`
 * devuelve `any` y ahí no hay tipo que contrastar. Si alguien cambia un
 * nombre aquí, tiene que cambiarlo en el generador, no al revés.
 */
export interface AssetDelManifiesto {
  key: string;
  url: string;
  hash: string;
  size: number;
  label: string;
}

/** Lo que este dispositivo tiene guardado: clave → hash con el que se guardó. */
export type ManifiestoLocal = Record<string, string>;

export interface AssetCache {
  /** ¿Está esta clave guardada Y con este hash exacto? */
  has(clave: string, hash: string): Promise<boolean>;
  /** Los bytes guardados, o `null` si no están. */
  get(clave: string): Promise<Blob | null>;
  put(clave: string, hash: string, datos: Blob): Promise<void>;
  getLocalManifest(): Promise<ManifiestoLocal>;
  saveLocalManifest(manifiesto: ManifiestoLocal): Promise<void>;
}

/**
 * El manifiesto local vive en `localStorage` aunque los BYTES no.
 *
 * Es un objeto de ~250 pares clave→hash: unos 12 KB de texto plano, que es
 * justo para lo que `localStorage` sirve. Y tiene una ventaja sobre guardarlo
 * dentro de la propia caché: se lee **síncrono**, así que el loader sabe qué
 * falta antes del primer `await`.
 */
const CLAVE_MANIFIESTO_LOCAL = "mc:manifiesto-assets";
const NOMBRE_CACHE = "mc-assets-v1";

export class WebAssetCache implements AssetCache {
  private cache: Cache | null = null;

  /**
   * `caches.open()` puede fallar: Safari en navegación privada no expone
   * `caches`, y un contexto sin origen seguro tampoco. Cuando falla, esta
   * caché se comporta como una que siempre está vacía — el loader descarga
   * todo cada vez, que es lento pero correcto. Nunca revienta el arranque.
   */
  private async abrir(): Promise<Cache | null> {
    if (this.cache) return this.cache;
    try {
      if (typeof caches === "undefined") return null;
      this.cache = await caches.open(NOMBRE_CACHE);
      return this.cache;
    } catch {
      return null;
    }
  }

  /** La URL interna con la que se indexa. No es la real: lleva el hash. */
  private llave(clave: string, hash: string): string {
    // El hash va EN la llave para que un asset que cambió no pueda leerse por
    // accidente: no hace falta invalidar nada, la entrada vieja simplemente
    // deja de buscarse.
    return `/mc-cache/${encodeURIComponent(clave)}?h=${hash}`;
  }

  async has(clave: string, hash: string): Promise<boolean> {
    const c = await this.abrir();
    if (!c) return false;
    return (await c.match(this.llave(clave, hash))) !== undefined;
  }

  async get(clave: string): Promise<Blob | null> {
    const c = await this.abrir();
    if (!c) return null;
    const local = await this.getLocalManifest();
    const hash = local[clave];
    if (!hash) return null;
    const res = await c.match(this.llave(clave, hash));
    return res ? await res.blob() : null;
  }

  async put(clave: string, hash: string, datos: Blob): Promise<void> {
    const c = await this.abrir();
    if (!c) return;
    try {
      await c.put(this.llave(clave, hash), new Response(datos));
    } catch {
      // Cuota agotada. El asset se usa igual en esta sesión —quien llama ya
      // tiene el Blob— y la próxima vez se vuelve a descargar. Preferible a
      // reventar el arranque por un disco lleno.
    }
  }

  async getLocalManifest(): Promise<ManifiestoLocal> {
    try {
      const crudo = localStorage.getItem(CLAVE_MANIFIESTO_LOCAL);
      return crudo ? (JSON.parse(crudo) as ManifiestoLocal) : {};
    } catch {
      return {};
    }
  }

  async saveLocalManifest(manifiesto: ManifiestoLocal): Promise<void> {
    try {
      localStorage.setItem(CLAVE_MANIFIESTO_LOCAL, JSON.stringify(manifiesto));
    } catch {
      /* Safari privado, o cuota — se vuelve a descargar la próxima vez */
    }
  }
}

/**
 * La implementación nativa, para cuando la app se empaquete con Capacitor.
 *
 * ─── Sin verificar, y no por descuido ──────────────────────────────────────
 *
 * Capacitor no existe en este repo: ni dependencia, ni configuración, ni
 * plataforma nativa donde correr esto. Está escrita porque el dueño la pidió
 * explícitamente, y por eso mismo **nada de este archivo se ha ejecutado
 * jamás**. El día que se empaquete, esto es un punto de partida razonable, no
 * código probado.
 *
 * ─── Por qué el import es dinámico ─────────────────────────────────────────
 *
 * Un `import { Filesystem } from "@capacitor/filesystem"` estático rompería el
 * build hoy: el paquete no está instalado. Con import dinámico dentro de un
 * `try`, este archivo compila y se despliega sin él, y la clase simplemente no
 * se puede instanciar — que es exactamente lo que debe pasar en un navegador.
 */
export class CapacitorAssetCache implements AssetCache {
  private fs: any = null;
  private readonly DIR = "mc-assets";

  private async filesystem(): Promise<any> {
    if (this.fs) return this.fs;
    // El nombre va en una VARIABLE, no como literal: con el literal,
    // TypeScript intenta resolver el módulo aunque el import sea dinámico y
    // falla con ts(2307) — el paquete no está instalado y no debe estarlo.
    // Indirectándolo, el tipo se pierde (queda `any`) y el build no depende de
    // un paquete ausente, que es exactamente lo que se quiere: esta rama solo
    // corre donde Capacitor existe de verdad.
    const NOMBRE_MODULO = "@capacitor/filesystem";
    const mod = await import(/* @vite-ignore */ NOMBRE_MODULO).catch(() => null);
    if (!mod) throw new Error("CapacitorAssetCache sin @capacitor/filesystem");
    this.fs = mod.Filesystem;
    return this.fs;
  }

  private ruta(clave: string): string {
    return `${this.DIR}/${encodeURIComponent(clave)}`;
  }

  async has(clave: string, hash: string): Promise<boolean> {
    const local = await this.getLocalManifest();
    if (local[clave] !== hash) return false;
    try {
      const fs = await this.filesystem();
      await fs.stat({ path: this.ruta(clave), directory: "DATA" });
      return true;
    } catch {
      // El manifiesto local dice que está pero el archivo no: la entrada
      // miente. Se trata como ausente y se vuelve a descargar.
      return false;
    }
  }

  async get(clave: string): Promise<Blob | null> {
    try {
      const fs = await this.filesystem();
      const r = await fs.readFile({ path: this.ruta(clave), directory: "DATA" });
      // Capacitor devuelve base64; se reconstruye el Blob.
      const bin = atob(r.data as string);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new Blob([bytes]);
    } catch {
      return null;
    }
  }

  async put(clave: string, _hash: string, datos: Blob): Promise<void> {
    try {
      const fs = await this.filesystem();
      const base64 = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result).split(",")[1] ?? "");
        fr.onerror = reject;
        fr.readAsDataURL(datos);
      });
      await fs.writeFile({
        path: this.ruta(clave),
        data: base64,
        directory: "DATA",
        recursive: true,
      });
    } catch {
      /* disco lleno o permiso denegado — se vuelve a descargar la próxima vez */
    }
  }

  async getLocalManifest(): Promise<ManifiestoLocal> {
    try {
      const fs = await this.filesystem();
      const r = await fs.readFile({ path: `${this.DIR}/manifiesto.json`, directory: "DATA" });
      return JSON.parse(String(r.data)) as ManifiestoLocal;
    } catch {
      return {};
    }
  }

  async saveLocalManifest(manifiesto: ManifiestoLocal): Promise<void> {
    try {
      const fs = await this.filesystem();
      await fs.writeFile({
        path: `${this.DIR}/manifiesto.json`,
        data: JSON.stringify(manifiesto),
        directory: "DATA",
        recursive: true,
      });
    } catch {
      /* igual que arriba */
    }
  }
}

/**
 * La caché que corresponde a este entorno.
 *
 * La detección es por la presencia del objeto global de Capacitor Y su
 * `isNativePlatform()`. En un navegador ese objeto no existe, así que la rama
 * nativa ni se toca — importante, porque su `import()` fallaría.
 */
export function cacheDeAssets(): AssetCache {
  try {
    const cap = (globalThis as any).Capacitor;
    if (cap?.isNativePlatform?.()) return new CapacitorAssetCache();
  } catch {
    /* sin Capacitor: web */
  }
  return new WebAssetCache();
}
