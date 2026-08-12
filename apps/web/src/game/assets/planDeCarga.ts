/**
 * El diff: qué hay que descargar y qué sale de la caché local.
 *
 * ─── Por qué es un módulo aparte y no parte de la escena ───────────────────
 *
 * Es la única pieza del loader que es **lógica pura** —dos listas entran, un
 * plan sale— y por eso es la única que se puede probar sin navegador, sin
 * Phaser y sin red. `planDeCarga.prueba.mjs` la ejercita entera. Todo lo demás
 * (la física, el HUD, la inclinación) solo se puede mirar.
 *
 * ─── El peso, que es de lo que va todo esto ────────────────────────────────
 *
 * Un porcentaje por CONTEO de archivos miente: el catálogo tiene un fondo de
 * 300 KB y un icono de 8 KB, y contar «2 de 243» los trata igual. La barra
 * salta al principio y se atasca al final, que es la peor forma de esperar.
 *
 * Ponderado por bytes avanza como avanza la descarga de verdad.
 *
 * ─── Y por qué un asset cacheado NO pesa cero ──────────────────────────────
 *
 * Leerlo de la caché es rápido, pero **decodificarlo no**: un WebP hay que
 * pasarlo a textura de GPU y un MP3 a `AudioBuffer`, y eso ocurre igual esté
 * el archivo en disco o en la red. En un Android de gama baja (`mc-47` §5) ese
 * paso es medible.
 *
 * Contarlo como 0 haría que la barra saltara al 100% y luego se quedara
 * congelada mientras Phaser decodifica 243 archivos — exactamente el defecto
 * que D-200.4 documenta: «el caché del navegador acelera la RED, no elimina el
 * paso de Phaser», con una pantalla en blanco de ~30 archivos como síntoma.
 * `PESO_CACHEADO` es la fracción del tamaño que se le atribuye a ese trabajo.
 */
import type { AssetCache, AssetDelManifiesto, ManifiestoLocal } from "./AssetCache";

/**
 * Cuánto pesa, para la barra, un asset que ya está en caché.
 *
 * 5% de su tamaño. No es una medición: es un valor elegido para que
 * decodificar 243 archivos cacheados no se vea como un salto instantáneo al
 * 100%, y para que una descarga real siga dominando la barra. Si algún día se
 * mide el coste de decodificación de verdad, este número es lo que se cambia.
 */
export const PESO_CACHEADO = 0.05;

export interface PlanDeCarga {
  /** Hay que pedirlos a la red. */
  descargar: AssetDelManifiesto[];
  /** Están en la caché local con el hash correcto. */
  desdeCache: AssetDelManifiesto[];
  /** La suma ponderada de los dos grupos: el 100% de la barra. */
  pesoTotal: number;
}

/** El peso que aporta un asset al total, según de dónde salga. */
export const pesoDe = (a: AssetDelManifiesto, cacheado: boolean): number =>
  cacheado ? a.size * PESO_CACHEADO : a.size;

/**
 * Compara el manifiesto del servidor con lo que hay en el dispositivo.
 *
 * @param assets lo que el servidor dice que existe hoy
 * @param local  clave → hash de lo guardado aquí
 */
export function planDeCarga(
  assets: readonly AssetDelManifiesto[],
  local: ManifiestoLocal,
): PlanDeCarga {
  const descargar: AssetDelManifiesto[] = [];
  const desdeCache: AssetDelManifiesto[] = [];

  for (const a of assets) {
    // La comparación es por HASH, no por presencia: un asset que existe pero
    // cambió de contenido tiene que volver a bajarse, y ese es justo el caso
    // que un candado global no distingue.
    if (local[a.key] === a.hash) desdeCache.push(a);
    else descargar.push(a);
  }

  const pesoTotal =
    descargar.reduce((n, a) => n + pesoDe(a, false), 0) +
    desdeCache.reduce((n, a) => n + pesoDe(a, true), 0);

  return { descargar, desdeCache, pesoTotal };
}

/**
 * Baja el manifiesto del servidor.
 *
 * `cache: "no-store"` a propósito: es el archivo que dice si todo lo demás
 * cambió, así que servirlo de una caché intermedia derrotaría el mecanismo
 * entero — el dispositivo creería estar al día para siempre.
 *
 * Devuelve `null` ante cualquier fallo. Sin manifiesto no hay plan, y el
 * loader tiene que poder seguir: precarga a ciegas como hacía antes.
 */
export async function leerManifiestoRemoto(): Promise<{
  version: string;
  total: number;
  assets: AssetDelManifiesto[];
} | null> {
  try {
    const res = await fetch("/manifest-assets.json", { cache: "no-store" });
    if (!res.ok) return null;
    const j = (await res.json()) as { version?: string; total?: number; assets?: unknown };
    if (!Array.isArray(j.assets)) return null;
    return {
      version: String(j.version ?? ""),
      total: Number(j.total ?? 0),
      assets: j.assets as AssetDelManifiesto[],
    };
  } catch {
    return null;
  }
}

/**
 * Escribe en el manifiesto local lo que de verdad quedó guardado.
 *
 * Se llama con la lista de lo que se consiguió, NUNCA con el manifiesto
 * remoto entero: si una descarga falló o la cuota se agotó a medias, apuntar
 * el catálogo completo haría que el dispositivo creyera tener assets que no
 * tiene, y la próxima carga los daría por buenos sin volver a pedirlos.
 */
export async function anotarGuardados(
  cache: AssetCache,
  guardados: ReadonlyArray<{ clave: string; hash: string }>,
): Promise<void> {
  const local = await cache.getLocalManifest();
  for (const { clave, hash } of guardados) local[clave] = hash;
  await cache.saveLocalManifest(local);
}
