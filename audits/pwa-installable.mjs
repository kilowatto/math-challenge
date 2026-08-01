#!/usr/bin/env node
// Auditor determinista 08 — instalabilidad de la PWA
//
// Hace cumplir: F0 ("PWA instalable") y mc-33 §1.
//
// Por qué existe: "PWA instalable" era una afirmación que nadie podía comprobar.
// Los criterios de Chrome son concretos y verificables sin navegador — HTTPS,
// manifest con los campos correctos, íconos de 192 y 512 en PNG — así que se
// comprueban.
//
// Lo que este auditor NO puede comprobar, y por eso se dice aquí en vez de
// fingir que sí: en iOS la instalación es MANUAL (Compartir → Añadir a inicio),
// no existe `beforeinstallprompt`, y el push exige que la app esté instalada
// (mc-33 §2). Nada de eso se verifica desde la línea de comandos; requiere un
// dispositivo real, y sigue pendiente.
//
// Uso: node audits/pwa-installable.mjs [https://origen]

const origin = process.argv[2] ?? "https://math.kilowatto.com";
const problems = [];
const ok = [];

if (!origin.startsWith("https://")) {
  problems.push("el origen no es HTTPS — requisito duro de instalabilidad");
}

let manifest;
try {
  const res = await fetch(`${origin}/manifest.webmanifest`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  manifest = await res.json();
  ok.push("manifest servido y es JSON válido");
} catch (err) {
  console.error(`✗ pwa-installable — no se pudo leer el manifest: ${err.message}`);
  process.exit(1);
}

// Criterios de instalabilidad de Chrome (mc-33 §1).
const checks = [
  ["name o short_name", !!(manifest.name || manifest.short_name)],
  ["start_url", !!manifest.start_url],
  [
    "display en {standalone, fullscreen, minimal-ui}",
    ["standalone", "fullscreen", "minimal-ui", "window-controls-overlay"].includes(manifest.display),
  ],
  [
    "prefer_related_applications ausente o false",
    manifest.prefer_related_applications !== true,
  ],
  [
    "ícono PNG de 192x192",
    !!manifest.icons?.some((i) => i.sizes?.includes("192x192") && i.type === "image/png"),
  ],
  [
    "ícono PNG de 512x512",
    !!manifest.icons?.some((i) => i.sizes?.includes("512x512") && i.type === "image/png"),
  ],
  // No es criterio de Chrome, pero sin él el ícono se ve recortado en Android:
  // solo el 80% central está garantizado en un recorte maskable.
  [
    "al menos un ícono maskable",
    !!manifest.icons?.some((i) => String(i.purpose ?? "").includes("maskable")),
  ],
];

for (const [label, pass] of checks) {
  if (pass) ok.push(label);
  else problems.push(`manifest: falta ${label}`);
}

// Los íconos declarados tienen que existir de verdad.
for (const icon of manifest.icons ?? []) {
  const url = new URL(icon.src, origin).href;
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) problems.push(`ícono ${icon.src} devuelve HTTP ${res.status}`);
    else ok.push(`ícono ${icon.src} servido`);
  } catch {
    problems.push(`ícono ${icon.src} no se pudo alcanzar`);
  }
}

// El service worker no es criterio de instalabilidad desde que Chrome lo quitó
// de la lista (mc-33 §1), pero mc-33 implicación 3 dice enviarlo igual.
try {
  const res = await fetch(`${origin}/sw.js`);
  if (res.ok) ok.push("service worker servido");
  else problems.push(`/sw.js devuelve HTTP ${res.status}`);
} catch {
  problems.push("/sw.js no se pudo alcanzar");
}

if (problems.length > 0) {
  console.error("✗ pwa-installable\n");
  for (const p of problems) console.error(`  · ${p}`);
  console.error(`\n  Hace cumplir: F0 ("PWA instalable"), mc-33 §1`);
  process.exit(1);
}

console.log(`✓ pwa-installable — ${ok.length} criterio(s) en ${origin}`);
console.log(`  · pendiente de dispositivo real: instalación manual en iOS y push`);
console.log(`    tras instalar (mc-33 §2) — no verificable desde la terminal`);
