#!/usr/bin/env node
// Auditor determinista 06 — marca, paleta e imágenes
//
// Hace cumplir:
//   docs/guia-de-estilo.md  — la paleta Ignia y Raleway
//   mc-38 / WCAG 2.2 AA     — 4.5:1 texto normal, 3:1 texto grande y gráficos
//   mc-47 §5                — AVIF/WebP, 25-50% menos peso que PNG/JPG
//   CLAUDE.md § Imágenes    — Recraft es la herramienta oficial; las llaves
//                             viven en .env local y NUNCA se commitean
//
// Por qué existe: el naranja de Ignia —el color de Larry— NO alcanza el
// contraste de texto normal sobre blanco. Es el error que un diseñador comete
// de buena fe el primer día, y sin auditor no se detecta hasta la revisión de
// accesibilidad, cuando ya está en cien pantallas.
//
// Uso:  node audits/brand-image.mjs [--tabla]

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { execSync } from "node:child_process";

// --- La paleta, de "Color y tipografia.pdf" de Ignia -----------------------
export const PALETTE = {
  "naranja-ignia":   { hex: "#F36B1C", rol: "principal · el color de Larry" },
  "azul-ignia":      { hex: "#0B6AB0", rol: "principal" },
  "naranja-claro":   { hex: "#F8A337", rol: "complementario" },
  "naranja-oscuro":  { hex: "#CE4912", rol: "complementario" },
  "gris-900":        { hex: "#434547", rol: "grises" },
  "gris-600":        { hex: "#727476", rol: "grises" },
  "gris-400":        { hex: "#A4A6A8", rol: "grises" },
  "negro":           { hex: "#000000", rol: "grises" },
  "blanco":          { hex: "#FFFFFF", rol: "grises" },

  // --- Neutros DERIVADOS: no están en el PDF de Ignia ---------------------
  // El PDF no cubre tema oscuro, y su gris más oscuro (#434547) es demasiado
  // claro para servir de fondo. Estos cuatro se derivaron aquí y se declaran
  // como derivados para que nadie los confunda con color de marca.
  // Justificación de contraste en docs/guia-de-estilo.md.
  "superficie-clara": { hex: "#F7F7F8", rol: "derivado · superficie en tema claro" },
  "fondo-oscuro":     { hex: "#16181A", rol: "derivado · fondo en tema oscuro" },
  "superficie-oscura":{ hex: "#1F2224", rol: "derivado · superficie en tema oscuro" },
  "texto-oscuro":     { hex: "#ECEDEE", rol: "derivado · texto en tema oscuro" },
};

const HEXES = new Set(Object.values(PALETTE).map((c) => c.hex.toUpperCase()));

// --- Contraste WCAG -------------------------------------------------------
function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// Umbrales WCAG 2.2 AA
const AA_TEXT = 4.5;   // texto normal
const AA_LARGE = 3.0;  // texto grande (>=18.66px bold o >=24px) y gráficos/UI

// --- 1. Tabla de contraste contra blanco y negro --------------------------
function contrastTable() {
  const rows = [];
  for (const [name, { hex, rol }] of Object.entries(PALETTE)) {
    if (hex === "#FFFFFF" || hex === "#000000") continue;
    const onWhite = contrast(hex, "#FFFFFF");
    const onBlack = contrast(hex, "#000000");
    rows.push({
      name, hex, rol,
      onWhite: +onWhite.toFixed(2),
      onBlack: +onBlack.toFixed(2),
      textoEnBlanco: onWhite >= AA_TEXT,
      graficoEnBlanco: onWhite >= AA_LARGE,
      textoEnNegro: onBlack >= AA_TEXT,
    });
  }
  return rows;
}

// --- 2. Hex sueltos en el código que no son de la paleta ------------------
function scanStrayHex() {
  const problems = [];
  const roots = ["apps", "packages"].filter(existsSync);
  const exts = new Set([".css", ".scss", ".astro", ".ts", ".tsx", ".js", ".jsx", ".svelte", ".vue"]);

  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (["node_modules", "dist", ".astro"].includes(entry.name)) continue;
        walk(p);
      } else if (exts.has(extname(entry.name))) {
        const src = readFileSync(p, "utf8");
        for (const m of src.matchAll(/#([0-9a-fA-F]{6})\b/g)) {
          const hex = `#${m[1].toUpperCase()}`;
          if (HEXES.has(hex)) continue;
          const line = src.slice(0, m.index).split("\n").length;
          problems.push(`${p}:${line} — ${hex} no está en la paleta Ignia`);
        }
      }
    }
  };
  for (const r of roots) walk(r);
  return problems;
}

// --- 3. Formatos de imagen (mc-47 §5) -------------------------------------
function scanImages() {
  const problems = [];
  const notes = [];
  const roots = ["apps", "public", "assets"].filter(existsSync);
  const LEGACY = new Set([".png", ".jpg", ".jpeg"]);
  let modern = 0;

  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (["node_modules", "dist", ".astro"].includes(entry.name)) continue;
        walk(p);
      } else {
        const ext = extname(entry.name).toLowerCase();
        if (ext === ".avif" || ext === ".webp") modern++;
        if (LEGACY.has(ext)) {
          const kb = Math.round(statSync(p).size / 1024);
          // Los íconos del manifest tienen que ser PNG por compatibilidad.
          if (/icon|favicon|apple-touch/i.test(entry.name)) {
            notes.push(`${p} — PNG permitido: ícono de instalación`);
          } else {
            problems.push(`${p} (${kb} KB) — usa AVIF o WebP: 25-50% menos peso (mc-47 §5)`);
          }
        }
      }
    }
  };
  for (const r of roots) walk(r);
  return { problems, notes, modern };
}

// --- 4. Llaves de generación de imagen commiteadas ------------------------
// El escaneo general vive en audits/secrets.mjs; aquí van las específicas de
// las herramientas de imagen, que es de lo que trata este auditor.
function scanImageKeys() {
  const problems = [];
  const PATTERNS = [
    [/\bupl[A-Za-z0-9]{40,}\b/, "posible llave de API de Recraft"],
    [/\bAQ\.Ab8RN6[A-Za-z0-9_\-]{20,}\b/, "posible token de Google"],
    [/\bAIza[0-9A-Za-z_\-]{35}\b/, "posible llave de API de Google"],
  ];
  const SKIP = [/^docs\//, /^audits\//, /\.example$/, /^CLAUDE\.md$/];

  let files = [];
  try {
    files = execSync("git ls-files --cached --others --exclude-standard", { encoding: "utf8" })
      .split("\n").filter(Boolean);
  } catch { return problems; }

  for (const f of files) {
    if (SKIP.some((re) => re.test(f))) continue;
    try {
      if (statSync(f).size > 2_000_000) continue;
      const src = readFileSync(f, "utf8");
      for (const [re, label] of PATTERNS) {
        if (re.test(src)) problems.push(`${f} — ${label}`);
      }
    } catch { /* binario */ }
  }
  return problems;
}

// --- Ejecución ------------------------------------------------------------
const rows = contrastTable();

if (process.argv.includes("--tabla")) {
  console.log("\nContraste de la paleta Ignia (WCAG 2.2)\n");
  console.log("color".padEnd(17), "hex".padEnd(9), "s/blanco".padStart(9), "s/negro".padStart(8), "  texto en blanco");
  for (const r of rows) {
    const verdict = r.textoEnBlanco ? "✓ sí"
      : r.graficoEnBlanco ? "solo texto grande y gráficos"
      : "✗ decorativo únicamente";
    console.log(
      r.name.padEnd(17),
      r.hex.padEnd(9),
      String(r.onWhite).padStart(9),
      String(r.onBlack).padStart(8),
      "  " + verdict,
    );
  }
  console.log();
  process.exit(0);
}

const strayHex = scanStrayHex();
const img = scanImages();
const keys = scanImageKeys();
const problems = [...strayHex, ...img.problems, ...keys];

// El naranja de Ignia no puede llevar texto normal sobre blanco. No es un
// error a corregir: es un hecho de la marca que la guía de estilo declara y
// este auditor recuerda cada vez que corre.
const naranja = rows.find((r) => r.name === "naranja-ignia");

if (problems.length > 0) {
  console.error("✗ auditor brand-image\n");
  for (const p of problems) console.error(`  · ${p}`);
  console.error(`\n  Hace cumplir: docs/guia-de-estilo.md, mc-38 (WCAG 2.2 AA),`);
  console.error(`  mc-47 §5 (AVIF/WebP), CLAUDE.md § Imágenes`);
  if (keys.length > 0) {
    console.error(`\n  ⚠ Una llave de imagen commiteada sigue en el historial de git`);
    console.error(`  aunque la borres en el siguiente commit. RÓTALA, no la borres.`);
  }
  process.exit(1);
}

console.log(`✓ brand-image — paleta, formatos y llaves limpios`);
console.log(`  · ${Object.keys(PALETTE).length} colores en la paleta, ${img.modern} imagen(es) en formato moderno`);
console.log(`  · recordatorio: ${naranja.hex} da ${naranja.onWhite}:1 sobre blanco —`);
console.log(`    ${naranja.textoEnBlanco ? "apto" : "NO apto"} para texto normal, sí para texto grande y gráficos`);
for (const n of img.notes) console.log(`  · ${n}`);
