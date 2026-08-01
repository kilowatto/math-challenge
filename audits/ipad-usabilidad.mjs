#!/usr/bin/env node
// Auditor determinista 09 — usabilidad y diseño en iPad
//
// Hace cumplir: D-041, D-031, `mc-20`, `mc-38`, y WCAG 2.2 AA 1.3.4, 2.1.1, 2.4.7.
//
// Por qué existe. El dueño pidió al principio que la orientación en iPad fuera
// siempre horizontal. No se puede y no se debe —Apple ignora el `orientation`
// del manifest, y bloquearla donde sí funciona violaría WCAG 2.2 AA 1.3.4—, así
// que D-041 lo resolvió al revés: **horizontal óptimo, vertical digno**. Esa
// decisión solo se sostiene si algo comprueba que vertical sigue funcionando;
// si no, "vertical digno" dura hasta el primer diseño que lo olvide.
//
// LO QUE ESTE AUDITOR NO PUEDE COMPROBAR, dicho antes de que alguien lo suponga.
// Es análisis estático: lee CSS y marcado, no renderiza. Por lo tanto NO ve
// si un elemento se desborda de verdad a 320 px, si el foco es visible con el
// contraste suficiente, ni si el orden de tabulación sigue al visual. Eso exige
// un navegador real en las resoluciones de iPad, y sigue pendiente. Lo que este
// auditor sí atrapa son las causas estáticas más comunes de esos fallos —que es
// distinto de atrapar los fallos.

import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const raiz = new URL("..", import.meta.url).pathname;
const archivos = (patron) =>
  execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: raiz, encoding: "utf8" })
    .split("\n")
    .map((s) => s.trim())
    .filter((f) => f && patron.test(f) && !/^(node_modules|dist|\.astro)/.test(f));

const css = archivos(/\.(css|astro)$/);
if (css.length === 0) {
  console.error("✗ ipad-usabilidad — 0 archivos de estilo escaneados.");
  console.error("  Un escáner que no ve nada aprueba siempre. Revisa el patrón.");
  process.exit(1);
}

const problemas = [];
const ok = [];

// --- 1. La orientación no se bloquea (D-041, WCAG 1.3.4) -------------------
// En iPad da igual porque Apple lo ignora; en Android SÍ se aplica, y ahí sería
// una violación real. Se comprueba el manifest, no la intención.
const manifestRuta = `${raiz}apps/web/public/manifest.webmanifest`;
if (existsSync(manifestRuta)) {
  const m = JSON.parse(readFileSync(manifestRuta, "utf8"));
  if (m.orientation && !/^any$/i.test(m.orientation)) {
    problemas.push(
      `manifest declara orientation: "${m.orientation}". D-041 y WCAG 2.2 AA 1.3.4 lo prohíben — ` +
        `en iPad Apple lo ignora, y en Android sí se aplica y deja fuera a quien tiene el ` +
        `dispositivo en un soporte fijo.`,
    );
  } else {
    ok.push("el manifest no bloquea la orientación");
  }
}

// --- 2. Ningún ancho mínimo rompe Split View (D-041) -----------------------
// El tercio de un iPad son ~320 px. Un contenedor que exige más se rompe en
// multitarea sin que nadie lo note en pantalla completa.
const TERCIO = 320;
let anchosRevisados = 0;
for (const f of css) {
  const t = readFileSync(`${raiz}${f}`, "utf8");
  for (const m of t.matchAll(/min-(?:width|inline-size)\s*:\s*(\d+)px/g)) {
    anchosRevisados++;
    const px = Number(m[1]);
    // Un min-width dentro de una media query de escritorio es legítimo: solo
    // aplica por encima de ese ancho. Se mira si hay una consulta que lo acote.
    const antes = t.slice(Math.max(0, m.index - 400), m.index);
    const acotado = /@media[^{]*min-width\s*:\s*(\d+)px/.test(antes);
    if (px > TERCIO && !acotado) {
      problemas.push(
        `${f}: min-width ${px}px sin acotar por media query. El tercio de un iPad en Split View ` +
          `son ~${TERCIO}px, así que esto se rompe en multitarea (D-041).`,
      );
    }
  }
}
if (anchosRevisados > 0 && problemas.length === 0) ok.push(`${anchosRevisados} ancho(s) mínimo(s) compatibles con Split View`);

// --- 3. Vertical existe en el CSS (D-041) ----------------------------------
// "Vertical digno" no se cumple solo. Si no hay ni una regla que contemple
// vertical, es que nadie lo pensó — y eso es exactamente lo que la decisión
// quería evitar.
const hayVertical = css.some((f) => /orientation\s*:\s*portrait/.test(readFileSync(`${raiz}${f}`, "utf8")));
const hayHorizontal = css.some((f) => /orientation\s*:\s*landscape/.test(readFileSync(`${raiz}${f}`, "utf8")));
if (hayHorizontal && !hayVertical) {
  problemas.push(
    `hay reglas para orientation: landscape y ninguna para portrait. D-041 dice "horizontal ` +
      `óptimo, vertical digno": si solo se estiliza horizontal, vertical es lo que quede por accidente.`,
  );
} else if (hayVertical) {
  ok.push("vertical tiene estilos propios, no es lo que quede");
}

// --- 4. Áreas seguras (D-041) ----------------------------------------------
// El indicador de inicio se come el borde inferior en horizontal, que es donde
// un diseño de teléfono suele poner la barra de acciones.
const hayInsets = css.some((f) => /env\(\s*safe-area-inset/.test(readFileSync(`${raiz}${f}`, "utf8")));
const hayViewportFit = archivos(/\.astro$/).some((f) => /viewport-fit\s*=\s*cover/.test(readFileSync(`${raiz}${f}`, "utf8")));
if (hayViewportFit && !hayInsets) {
  problemas.push(
    `el viewport declara viewport-fit=cover y ningún estilo usa env(safe-area-inset-*). ` +
      `Eso mete el contenido bajo el indicador de inicio y bajo las esquinas redondeadas (D-041).`,
  );
} else if (hayInsets) {
  ok.push("se respetan las áreas seguras");
}

// --- 5. Foco visible para teclado físico (WCAG 2.1.1, 2.4.7) ---------------
// Con Magic Keyboard el iPad es un equipo de escritorio. Quitar el contorno de
// foco sin reponerlo deja la navegación por tabulador invisible.
for (const f of css) {
  const t = readFileSync(`${raiz}${f}`, "utf8");
  const quita = /outline\s*:\s*(none|0)\b/.test(t);
  const repone = /:focus-visible/.test(t);
  if (quita && !repone) {
    problemas.push(
      `${f}: quita el outline sin definir :focus-visible. Con teclado físico —uso normal en ` +
        `iPad con Magic Keyboard— la navegación se vuelve invisible (WCAG 2.1.1 y 2.4.7, D-041).`,
    );
  }
}
if (css.some((f) => /:focus-visible/.test(readFileSync(`${raiz}${f}`, "utf8")))) {
  ok.push("hay estilos de :focus-visible para teclado físico");
}

// --- 6. Hover que esconde función (D-041) ----------------------------------
// Lo que solo aparece al pasar el cursor existe con trackpad y NO existe con el
// dedo. Es el fallo más silencioso de los cuatro modos de entrada del iPad.
for (const f of css) {
  const t = readFileSync(`${raiz}${f}`, "utf8");
  for (const m of t.matchAll(/:hover[^{]*\{([^}]*)\}/g)) {
    const cuerpo = m[1];
    if (/(display\s*:\s*(?!none)|visibility\s*:\s*visible|opacity\s*:\s*1\b)/.test(cuerpo)) {
      const acotado = /@media[^{]*hover\s*:\s*hover/.test(t.slice(Math.max(0, m.index - 300), m.index));
      if (!acotado) {
        problemas.push(
          `${f}: una regla :hover revela contenido sin estar dentro de @media (hover: hover). ` +
            `Con el dedo eso no existe nunca (D-041).`,
        );
      }
    }
  }
}

// --- Informe ---------------------------------------------------------------
if (problemas.length > 0) {
  console.error("✗ ipad-usabilidad\n");
  for (const p of problemas) console.error(`  · ${p}`);
  console.error(`\n  Hace cumplir: D-041, D-031, mc-20, mc-38, WCAG 2.2 AA 1.3.4 / 2.1.1 / 2.4.7`);
  process.exit(1);
}

console.log(`✓ ipad-usabilidad — ${css.length} archivo(s) de estilo`);
for (const o of ok) console.log(`  · ${o}`);
console.log(`  · NO comprobado aquí: desbordes reales a 320px, contraste del foco y orden de`);
console.log(`    tabulación. Eso exige un navegador en resoluciones de iPad y sigue pendiente.`);
