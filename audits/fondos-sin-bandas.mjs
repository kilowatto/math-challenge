#!/usr/bin/env node
// fondos-sin-bandas.mjs — ningún fondo trae bandas sólidas horneadas.
//
// ─── El defecto que este auditor existe para que no vuelva ─────────────────
//
// `pin-imagenes-fondo.webp` se generó en D-199.2 con `ffmpeg scale=800:1600`
// sobre lo que devolvió Gemini. El modelo **ignora la proporción que se le
// pide**: para simular un 1:2 metió la foto dentro de un lienzo con franjas
// BLANCAS a los lados. El archivo medía 800x1600 —correcto— y la foto ocupaba
// 639 px centrados, con 80 px de blanco a la izquierda y 81 a la derecha.
//
// En el dispositivo se veía como una pantalla de PIN encogida con bandas
// blancas, y costó una sesión entera: Phaser dibujaba la imagen cubriendo los
// 402 pt exactos —el juego, el canvas, la cámara y el contenedor decían todos
// 402x714, verificado imprimiendo los números en el propio letrero del PIN— y
// el blanco lo ponía el PNG. El código nunca tuvo la culpa, así que cada
// hipótesis sobre el código era falsa por construcción.
//
// La proporción del contenido, 639/800 = 0.799, coincidía al tercer decimal
// con la que se medía en la captura, 319/402 = 0.794. Ese cruce fue la prueba.
//
// ─── Qué comprueba ─────────────────────────────────────────────────────────
//
// Para cada fondo de pantalla completa: que los cuatro bordes NO sean una
// franja de color uniforme. Un borde uniforme de más del 1.5% del lado es
// letterboxing: nadie compone una foto con 80 px de blanco liso a un lado.
//
// ─── Qué NO comprueba ──────────────────────────────────────────────────────
//
// Los assets con transparencia a propósito —props, dibujos del PIN, avatares—
// están fuera: ahí el borde vacío ES el diseño. Solo se miran los fondos, que
// por definición tienen que cubrir la pantalla entera.
//
//     node audits/fondos-sin-bandas.mjs

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";

const raiz = new URL("..", import.meta.url).pathname;
const DIR = `${raiz}apps/web/public/juego`;

/**
 * Solo fondos de pantalla completa, por nombre.
 *
 * Se listan por patrón y no a mano para que un fondo nuevo entre sin que nadie
 * tenga que acordarse — que es exactamente cómo `pin-imagenes-fondo` pasó
 * inadvertido desde D-199.2.
 */
const ES_FONDO = /^(fondo-|pin-imagenes-fondo|pin-numerico-fondo|loader-fondo)/;

/** Un borde uniforme mayor que esto es sospechoso. */
const TOLERANCIA = 0.015;

/**
 * Un cielo NO es una banda, y distinguirlos costó dos intentos.
 *
 * La primera versión buscaba «color plano» con una tolerancia de 6 y marcó
 * `fondo-desierto-1.webp`: 72 px de cielo-arena que varían tan despacio que
 * parecen planos. Un auditor que grita ante un cielo bonito se desactiva en una
 * semana, que es peor que no tenerlo.
 *
 * El segundo intento exigía un CORTE SECO al final de la banda, y **dejó pasar
 * el caso real**: el borde de la foto del PIN es hierba desenfocada, así que el
 * salto contra el blanco era menor que el umbral. Se comprobó volviendo a poner
 * el archivo malo: pasaba en verde. Un auditor que aprueba justo el archivo que
 * motivó su existencia es peor que ninguno.
 *
 * El criterio que sí separa los dos casos es lo que el letterbox tiene de
 * artificial: es **plano de verdad** (sin degradado ninguno) y es **blanco o
 * negro**. Ninguna foto real tiene 80 px de #FFFFFF exacto en un borde; todos
 * los cielos del catálogo tienen algún degradado. Es un criterio más estrecho y
 * más honesto que una heurística de bordes.
 */
const DERIVA_MAXIMA = 2;

const problemas = [];
const notas = [];
const ok = [];

function dimensiones(ruta) {
  const salida = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", ruta], {
    encoding: "utf8",
  });
  const w = Number(/pixelWidth:\s*(\d+)/.exec(salida)?.[1]);
  const h = Number(/pixelHeight:\s*(\d+)/.exec(salida)?.[1]);
  return { w, h };
}

/**
 * Cuántas filas/columnas de color plano hay en cada borde.
 *
 * Se muestrea cada 50 px en la dirección larga en vez de leer todo el píxel:
 * una banda de letterboxing es plana de arriba abajo, así que 30 muestras la
 * detectan igual que 1600 y el auditor sigue corriendo en un segundo dentro
 * del gancho de pre-commit.
 */
function bandas(datos, w, h) {
  const px = (x, y) => {
    const i = (y * w + x) * 3;
    return [datos[i], datos[i + 1], datos[i + 2]];
  };
  const plano = (a, b) =>
    Math.abs(a[0] - b[0]) <= DERIVA_MAXIMA &&
    Math.abs(a[1] - b[1]) <= DERIVA_MAXIMA &&
    Math.abs(a[2] - b[2]) <= DERIVA_MAXIMA;
  /**
   * Blanco o negro: los dos colores con los que se rellena un lienzo.
   *
   * El umbral es 240 y no 250 porque el halo que deja la compresión en el borde
   * de una banda ronda 250,253,221 — casi blanco pero no blanco—. Con un umbral
   * demasiado alto el auditor daba por buena una imagen que en el teléfono
   * mostraba rayas blancas finas, que es lo que reportó el dueño después del
   * primer recorte.
   */
  const deRelleno = (c) =>
    (c[0] >= 240 && c[1] >= 240 && c[2] >= 240) || (c[0] <= 14 && c[1] <= 14 && c[2] <= 14);

  const columnaPlana = (x) => {
    const ref = px(x, Math.floor(h / 2));
    if (!deRelleno(ref)) return false;
    for (let y = 40; y < h - 40; y += 50) if (!plano(px(x, y), ref)) return false;
    return true;
  };
  const filaPlana = (y) => {
    const ref = px(Math.floor(w / 2), y);
    if (!deRelleno(ref)) return false;
    for (let x = 40; x < w - 40; x += 50) if (!plano(px(x, y), ref)) return false;
    return true;
  };

  let izq = 0;
  while (izq < w / 2 && columnaPlana(izq)) izq++;
  let der = 0;
  while (der < w / 2 && columnaPlana(w - 1 - der)) der++;
  let arr = 0;
  while (arr < h / 2 && filaPlana(arr)) arr++;
  let aba = 0;
  while (aba < h / 2 && filaPlana(h - 1 - aba)) aba++;

  return { izq, der, arr, aba };
}

if (!existsSync(DIR)) {
  notas.push("no hay apps/web/public/juego — nada que mirar");
} else {
  const fondos = readdirSync(DIR).filter((f) => f.endsWith(".webp") && ES_FONDO.test(f));
  for (const nombre of fondos) {
    const ruta = `${DIR}/${nombre}`;
    const { w, h } = dimensiones(ruta);
    if (!w || !h) {
      notas.push(`${nombre}: no se pudieron leer las dimensiones`);
      continue;
    }
    // `ffmpeg` a rawvideo por stdout: sin archivos temporales y sin depender de
    // ninguna librería de imagen en Node.
    const crudo = execFileSync(
      "ffmpeg",
      ["-v", "error", "-i", ruta, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
      { maxBuffer: 512 * 1024 * 1024, encoding: "buffer" },
    );
    const { izq, der, arr, aba } = bandas(crudo, w, h);
    const peorH = Math.max(izq, der) / w;
    const peorV = Math.max(arr, aba) / h;
    if (peorH > TOLERANCIA || peorV > TOLERANCIA) {
      problemas.push(
        `${nombre} (${w}x${h}): bandas de color plano en el borde — ` +
          `izq ${izq}px, der ${der}px, arriba ${arr}px, abajo ${aba}px. ` +
          "Es letterboxing horneado en el archivo: el modelo metió la foto en un lienzo " +
          "de otra proporción en vez de componerla. En el dispositivo se ve como una " +
          "pantalla encogida con franjas, y NINGÚN cambio en el código lo arregla. " +
          "Recorta el contenido real (ver `scripts/gen-pin-imagenes-fondo.mjs`).",
      );
    } else {
      ok.push(`${nombre} (${w}x${h}) cubre de borde a borde`);
    }
  }
  if (fondos.length === 0) notas.push("no se encontró ningún fondo que revisar");
}

notas.push(
  "NO comprobado aquí: si la foto es BONITA, ni si el encuadre deja sitio al HUD. " +
    "Eso es revisión humana (D-080). Esto solo mira que no haya bandas muertas.",
);

// --- Informe ---------------------------------------------------------------
if (problemas.length > 0) {
  console.error("✗ fondos-sin-bandas\n");
  for (const p of problemas) console.error(`  · ${p}`);
  console.error("\n  Hace cumplir: D-080, D-201, mc-47 §5");
  console.error(
    "  Por qué bloquea: una banda horneada en el píxel es invisible en el código y en el\n" +
      "  navegador de escritorio, y en el teléfono se ve como un defecto de maquetación.\n" +
      "  Costó una sesión entera de diagnóstico contra el motor, que era inocente.",
  );
  process.exit(1);
}

console.log(`✓ fondos-sin-bandas — ${ok.length} fondo(s)`);
for (const o of ok) console.log(`  · ${o}`);
for (const n of notas) console.log(`  · ${n}`);
