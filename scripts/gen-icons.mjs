#!/usr/bin/env node
// gen-icons.mjs — íconos PNG de instalación, sin dependencias
//
// Por qué existe: Chrome exige íconos PNG de 192 y 512 px para considerar
// instalable una PWA. SVG no basta. Sin estos archivos, "PWA instalable" de F0
// es una afirmación que no se puede verificar.
//
// Estos son PROVISIONALES: un cuadro naranja Ignia con un signo de más blanco.
// El arte definitivo sale de Recraft, para mantener la continuidad del avatar
// de Larry (CLAUDE.md § Imágenes). Cuando llegue, este script se borra.
//
// Uso: node scripts/gen-icons.mjs

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const OUT = "apps/web/public/icons";

// Paleta Ignia (docs/guia-de-estilo.md)
const NARANJA = [0xf3, 0x6b, 0x1c];
const BLANCO = [0xff, 0xff, 0xff];

// --- CRC32, requerido por cada chunk de PNG -------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** Codifica RGB de 8 bits sin interlacing (color type 2). */
function encodePng(width, height, pixelAt) {
  const raw = Buffer.alloc(height * (1 + width * 3));
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = 0; // filtro None: el tamaño no importa a 512px y evita bugs
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelAt(x, y);
      raw[o++] = r; raw[o++] = g; raw[o++] = b;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // profundidad de bits
  ihdr[9] = 2;   // color type 2 = RGB
  ihdr[10] = 0;  // compresión deflate
  ihdr[11] = 0;  // filtro adaptativo
  ihdr[12] = 0;  // sin interlacing

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/**
 * Fondo naranja completo con un "+" blanco centrado.
 *
 * El fondo cubre el lienzo entero a propósito: un ícono maskable puede ser
 * recortado a círculo o a "squircle" según la plataforma, y solo el 80% central
 * está garantizado. Con fondo completo, cualquier recorte se ve intencional.
 */
function plusIcon(size) {
  const arm = Math.round(size * 0.44);   // largo total del brazo
  const thick = Math.round(size * 0.13); // grosor
  const c = size / 2;
  return (x, y) => {
    const dx = Math.abs(x - c + 0.5);
    const dy = Math.abs(y - c + 0.5);
    const horizontal = dx <= arm / 2 && dy <= thick / 2;
    const vertical = dy <= arm / 2 && dx <= thick / 2;
    return horizontal || vertical ? BLANCO : NARANJA;
  };
}

mkdirSync(OUT, { recursive: true });

const sizes = [192, 512];
for (const size of sizes) {
  const png = encodePng(size, size, plusIcon(size));
  const path = `${OUT}/icon-${size}.png`;
  writeFileSync(path, png);
  console.log(`✓ ${path} — ${size}×${size}, ${(png.length / 1024).toFixed(1)} KB`);
}

console.log(`\n  Provisionales. El arte definitivo sale de Recraft, para conservar`);
console.log(`  la continuidad del avatar de Larry (CLAUDE.md § Imágenes).`);
