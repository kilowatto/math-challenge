#!/usr/bin/env node
// Auditor determinista — el área privada nunca hereda el layout público
//
// Hace cumplir: D-065.
//
// Por qué existe. `app/index.astro` ("Tu casa") heredaba `layouts/Base.astro`
// —el nav de MARKETING, "Entrar"/"Crear cuenta" como acción principal— con
// una sesión de adulto ya abierta. El dueño lo encontró con una captura real
// del teléfono. La causa: era el único archivo bajo `/app/**` sin un
// comentario que explicara su elección de layout, en un repo donde
// `app/kids/**` documenta la suya tres veces. Un auditor que solo mira
// `app/index.astro` no cubre al siguiente archivo que alguien agregue bajo
// `/app/` sin pensarlo — este mira el patrón, no el archivo.
//
// LO QUE NO PUEDE COMPROBAR: que `Privada.astro` se vea bien, o que las
// pestañas realmente reflejen la cuenta — eso es `node --check` de un
// navegador real y datos reales, no análisis estático de texto.

import { archivos, leer, informar, SOLO_PRODUCTO } from "./lib/repo.mjs";

const problemas = [];
const notas = [];

// ─── 1. Ningún archivo de /app/** fuera de app/kids/** importa Base.astro ──
const PRIVADA_ADULTO = /^apps\/web\/src\/pages\/\[locale\]\/app\/(?!kids\/)/;
const paginasApp = archivos(/\.astro$/)
  .filter((f) => SOLO_PRODUCTO.test(f))
  .filter((f) => PRIVADA_ADULTO.test(f));

const IMPORTA_BASE = /from\s+["'`][^"'`]*layouts\/Base\.astro["'`]/;
for (const archivo of paginasApp) {
  const texto = leer(archivo) ?? "";
  if (IMPORTA_BASE.test(texto)) {
    problemas.push(
      `${archivo} importa layouts/Base.astro. D-065: ninguna pantalla autenticada de adulto usa el layout ` +
        "público — trae \"Entrar\"/\"Crear cuenta\" como acción principal para alguien que ya inició sesión, " +
        "el nav de marketing entero, y RUM banda=PUBLICO en vez de SERIO. Usa layouts/Privada.astro.",
    );
  }
}
notas.push(`${paginasApp.length} página(s) de adulto bajo /app/ (fuera de app/kids/)`);

// ─── 2. app/kids/** nunca importa NINGUNO de los dos layouts compartidos ───
// Ya documentado tres veces en el propio código de kids/index.astro — este es
// el guardián automático de esa razón, no una regla nueva.
const paginasKids = archivos(/\.astro$/)
  .filter((f) => SOLO_PRODUCTO.test(f))
  .filter((f) => /^apps\/web\/src\/pages\/\[locale\]\/app\/kids\//.test(f));

const IMPORTA_PRIVADA = /from\s+["'`][^"'`]*layouts\/Privada\.astro["'`]/;
for (const archivo of paginasKids) {
  const texto = leer(archivo) ?? "";
  if (IMPORTA_BASE.test(texto) || IMPORTA_PRIVADA.test(texto)) {
    const cual = IMPORTA_BASE.test(texto) ? "Base.astro" : "Privada.astro";
    problemas.push(
      `${archivo} importa layouts/${cual}. app/kids/** es superficie de NIÑO — ninguno de los dos layouts ` +
        "compartidos es para un niño: Base.astro trae navegación de marketing y RUM público; Privada.astro " +
        "es de adulto por construcción (D-065) y trae Instalar.astro y una franja de pestañas de cuenta. " +
        "Un niño que llegue aquí no debe encontrar nada de eso.",
    );
  }
}
notas.push(`${paginasKids.length} página(s) de niño bajo app/kids/`);

// ─── 3. Privada.astro existe, y su RUM no es PUBLICO ───────────────────────
const PRIVADA = "apps/web/src/layouts/Privada.astro";
const privada = leer(PRIVADA);
if (!privada) {
  problemas.push(`no encontré ${PRIVADA} — D-065 depende de que este layout exista.`);
} else {
  if (!/<Rum\b/.test(privada)) {
    problemas.push(`${PRIVADA} no monta <Rum>. D-037 sí permite medir superficies de adulto; sin esto no se mide nada.`);
  } else if (/<Rum\b[^>]*banda\s*=\s*["'`]PUBLICO["'`]/.test(privada)) {
    problemas.push(
      `${PRIVADA} usa banda="PUBLICO" en <Rum>. Mezcla tráfico de marketing con uso real del producto ` +
        'autenticado en el mismo balde de métricas — la banda correcta aquí es "SERIO".',
    );
  } else {
    notas.push("Privada.astro mide con una banda distinta de PUBLICO");
  }

  if (IMPORTA_BASE.test(privada)) {
    problemas.push(`${PRIVADA} importa Base.astro — un layout privado no puede envolver al público sin heredar todo lo que D-065 existe para evitar.`);
  }
}

informar({
  nombre: "area-privada",
  problemas,
  notas,
  cita: "D-065",
  revisados: paginasApp.length + paginasKids.length + (privada ? 1 : 0),
  resumen: `${paginasApp.length} página(s) de adulto, ${paginasKids.length} de niño, Privada.astro revisado`,
  porQueBloquea:
    "una pantalla autenticada con el nav público es lo que produjo la captura que abrió D-065 — un padre ya " +
    "adentro viendo \"Entrar\"/\"Crear cuenta\" como si no lo estuviera.",
  noComprueba: [
    "que Privada.astro se vea bien en un dispositivo real, o que las pestañas reflejen la cuenta de verdad " +
      "— eso es un navegador real con datos reales, no análisis estático de texto.",
  ],
});
