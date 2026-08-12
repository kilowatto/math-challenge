/**
 * carga-assets.ts — el candado de versión + el cargador con progreso,
 * compartidos entre `CargaGlobalScene` (quien-juega) y `PreloadScene`
 * (Modo Historia) — D-200.
 *
 * Extraído después de encontrar que `PreloadScene` seguía dibujando su
 * barra de carga SIEMPRE, sin importar si los archivos ya estaban en
 * caché — el candado de versión solo se había aplicado a la escena nueva.
 * Ambas escenas necesitan la MISMA pregunta ("¿ya se precargó todo para
 * esta versión?") y el MISMO patrón de carga por lotes con progreso — vivir
 * en dos copias habría hecho que la próxima corrección solo llegara a una.
 */
import Phaser from "phaser";
import type { Activo } from "./assets-manifest";

const CLAVE_MARCADOR = "mc:activos-version";

export async function leerVersionRemota(): Promise<string | null> {
  try {
    const res = await fetch("/assets-version.json", { cache: "no-store" });
    if (!res.ok) return null;
    const datos = (await res.json()) as { version?: unknown };
    return typeof datos.version === "string" ? datos.version : null;
  } catch {
    // Sin red: se sigue de largo y se intenta cargar igual (falla en
    // silencio, mismo criterio que el resto del juego con assets ausentes).
    return null;
  }
}

export function leerMarcadorVersion(): string | null {
  try {
    return localStorage.getItem(CLAVE_MARCADOR);
  } catch {
    return null;
  }
}

export function escribirMarcadorVersion(version: string): void {
  try {
    localStorage.setItem(CLAVE_MARCADOR, version);
  } catch {
    // Safari privado: no persiste, pero tampoco rompe nada — se vuelve a
    // precargar la próxima vez, que es el peor caso, no un error.
  }
}

/** `true` si el catálogo de assets de ESTE deploy ya se precargó en este dispositivo — el llamador decide si eso significa "no dibujes UI de carga". */
export async function activosYaPrecargados(): Promise<boolean> {
  const version = await leerVersionRemota();
  return !!version && leerMarcadorVersion() === version;
}

/** Marca el catálogo actual como precargado — llamarlo solo tras cargar TODO (imágenes + audio), nunca a medias. */
export async function marcarActivosPrecargados(): Promise<void> {
  const version = await leerVersionRemota();
  if (version) escribirMarcadorVersion(version);
}

/**
 * Carga un lote (todas imágenes, o todo audio) y resuelve cuando termina.
 * Salta por completo el archivo que YA existe en la caché de ESTE
 * `Phaser.Game` (una textura no se vuelve a pedir si esta misma escena ya
 * la cargó antes) — no tiene forma de saber si el NAVEGADOR ya tiene los
 * bytes en su propia caché (eso lo decide `sw.js`, transparente para
 * Phaser), así que igual dispara la petición de red; si el service worker
 * ya la cacheó, esa petición resuelve casi al instante.
 */
export function cargarLoteConProgreso(
  scene: Phaser.Scene,
  activos: readonly Activo[],
  tipo: "imagen" | "audio",
  onProgreso?: (valor: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    let haceFalta = false;
    for (const { clave, url } of activos) {
      const yaExiste = tipo === "imagen" ? scene.textures.exists(clave) : scene.cache.audio.exists(clave);
      if (yaExiste) continue;
      haceFalta = true;
      if (tipo === "imagen") scene.load.image(clave, url);
      else scene.load.audio(clave, url);
    }
    if (!haceFalta) {
      resolve();
      return;
    }
    onProgreso?.(0);
    const alProgresar = (valor: number) => onProgreso?.(valor);
    scene.load.on(Phaser.Loader.Events.PROGRESS, alProgresar);
    scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
      scene.load.off(Phaser.Loader.Events.PROGRESS, alProgresar);
      resolve();
    });
    scene.load.start();
  });
}
