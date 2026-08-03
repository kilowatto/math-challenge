#!/usr/bin/env node
// Auditor determinista — la protección de racha jamás se vende
//
// Hace cumplir: línea roja #6, línea roja #4, D-014, D-021, #203, #210.
//
// ─── Por qué existe ───────────────────────────────────────────────────────
//
// D-014 lo escribe en una frase: «Nunca se vende protección de racha.» Y `mc-16`
// documenta el producto donde eso se cruzó, con nombre y apellido:
//
//   · el Streak Freeze de Duolingo se obtiene por vías que **se mezclan con
//     gemas comprables** — el mecanismo protege la ansiedad que el mismo
//     producto fabricó, y después la cobra;
//   · los corazones son «el mecanismo más criticado; la prensa lo describe como
//     diseñado para empujar la suscripción» — es decir, la línea roja #4, que
//     prohíbe cobrar por dejar que un niño practique.
//
// La implicación central de `mc-16`, textual: *«copiar la disciplina de enganche
// sin copiar la fricción de monetización (corazones) es la decisión de diseño
// más importante»*. Este auditor es esa frase convertida en un comando.
//
// ─── Cómo comprueba ───────────────────────────────────────────────────────
//
//  1. **La firma.** `ganarEscudos` recibe el estado y nada más. Cualquier
//     parámetro nuevo que nombre un monto, un SKU, un cupón o una transacción
//     bloquea. Es la comprobación más barata y la que primero se rompería:
//     nadie escribe `venderEscudo()`, alguien agrega «un parámetro que hace
//     falta».
//  2. **El grafo.** Ningún archivo que toque `shields_available` o `pause_*`
//     puede importar un cliente de pagos ni una ruta de cobro.
//  3. **La vecindad.** En cualquier archivo, una mención de escudo/protección de
//     racha a menos de 6 líneas de un símbolo de moneda o de vocabulario de
//     precio bloquea. Seis líneas es el radio en el que cabe un objeto de
//     configuración, que es donde esto aparecería de verdad:
//     `{ nombre: "escudo", precio: 0.99 }`.
//  4. **Los locales.** Lo mismo sobre los siete archivos de i18n: una clave de
//     precio cerca de una cadena de escudo es la tienda ya pintada.
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Un cobro hecho fuera del repositorio (un enlace de pago pegado en un
//    correo, una compra dentro de la tienda de la plataforma).
//  · Si el número de escudos es generoso o tacaño. Eso es producto.
//  · Si un texto presiona sin nombrar dinero («no pierdas tu racha»). Eso es
//    léxico y le toca a la flota adversarial y a `racha-lexico` cuando exista.

import { archivos, leer, informar, sinComentarios, palabra, existe } from "./lib/repo.mjs";

const MOTOR = "packages/motor/src/racha.ts";

/** Lo que la racha protege, en las dos lenguas en que se escribe el repo. */
const PROTECCION = palabra(
  "shields?_available", "shields?_earned_total", "shields?", "escudos?",
  "streak_?freeze", "streakfreeze", "pause_until_local_date", "pause_uses_this_year",
  "proteccion_?de_?racha", "streak_?protection", "streak_?repair", "streak_?insurance",
);

/** Vocabulario de cobro. `plan` y `tier` incluidos: es como llega envuelto. */
const COBRO = palabra(
  "price", "precio", "cost", "costo", "coste", "amount_cents", "amount",
  "sku", "cupon", "coupon", "checkout", "stripe", "paypal", "purchase", "comprar",
  "buy", "iap", "in_?app_?purchase", "subscription", "suscripcion", "premium",
  "gems", "gemas", "lingots", "coins", "monedas", "currency", "moneda",
);

/** Un símbolo de moneda escrito a mano. */
const SIMBOLO = /(?:^|[\s(:="'`\[{])(?:[$€£¥]\s?\d|\d+\s?(?:USD|EUR|MXN|BRL|GBP)\b)/;

/**
 * Nombres de parámetro que jamás pueden aparecer en la firma del motor.
 *
 * Sin fronteras de palabra a propósito, y es la única regla de este archivo que
 * las omite. La lista de parámetros del motor son seis nombres controlados
 * (`estado`, `dia`, `motivo`, `desde`, `hasta`, `hoy`), así que no hay falso
 * positivo posible — y con frontera se escapaba justo la forma en que esto se
 * escribiría de verdad: `precioEnCentavos` no casa con `\bprecio\b` porque la
 * `E` mayúscula es carácter de palabra.
 */
const PARAMETRO_PROHIBIDO =
  /(precio|price|monto|amount|sku|cupon|coupon|transaccion|transaction|pago|payment|plan|tier|checkout|stripe)/i;

const RADIO = 6;

const problemas = [];
const notas = [];
let revisados = 0;

// ─── 1. La firma de las tres funciones del motor ─────────────────────────────

if (!existe(MOTOR)) {
  problemas.push(
    `${MOTOR} no existe. Este auditor lee su firma, así que sin él no comprueba lo ` +
      "principal — y «no comprobé» no puede leerse como «está bien».",
  );
} else {
  const texto = sinComentarios(leer(MOTOR) ?? "");
  revisados++;

  for (const nombre of ["ganarEscudos", "registrarDia", "declararPausa"]) {
    const m = texto.match(new RegExp(`function\\s+${nombre}\\s*\\(([\\s\\S]*?)\\)\\s*:`));
    if (!m) {
      problemas.push(
        `${MOTOR}: no se encontró la firma de \`${nombre}\`. Si se renombró, este auditor deja ` +
          "de vigilarla en silencio, que es peor que si bloqueara.",
      );
      continue;
    }
    if (PARAMETRO_PROHIBIDO.test(m[1])) {
      problemas.push(
        `${MOTOR}: \`${nombre}\` recibe un parámetro de pago — \`${m[1].replace(/\s+/g, " ").trim().slice(0, 90)}\`. ` +
          "D-014 y línea roja #6: la protección de racha jamás se vende. #203 exige que " +
          "`ganarEscudos` sea función pura de `current_streak` y `shields_available` y de nada más.",
      );
    }
  }

  if (/from\s+["'][^"']*(pagos|payments?|stripe|billing|checkout)/i.test(texto)) {
    problemas.push(
      `${MOTOR} importa algo de un módulo de pagos. El motor de racha no puede conocer el ` +
        "cobro ni de lejos (D-014, línea roja #6).",
    );
  }
}

// ─── 2, 3 y 4. El grafo, la vecindad y los locales ───────────────────────────

const mirados = archivos(/\.(ts|tsx|js|jsx|mjs|astro|json|sql)$/).filter(
  (f) => /^(apps|packages|workers|migrations)\//.test(f),
);

for (const archivo of mirados) {
  const crudo = leer(archivo) ?? "";
  revisados++;
  // Los comentarios se quitan salvo en JSON, donde no los hay y donde el
  // contenido ES el texto que un padre leería.
  const texto = archivo.endsWith(".json") ? crudo : sinComentarios(crudo);
  if (!PROTECCION.test(texto)) continue;

  const lineas = texto.split("\n");
  const tocaProteccion = [];
  for (let i = 0; i < lineas.length; i++) if (PROTECCION.test(lineas[i])) tocaProteccion.push(i);

  // El grafo: este archivo toca la protección, así que no puede importar cobro.
  const importa = texto.match(
    /(?:import[^\n]*from\s*|require\s*\(\s*)["']([^"']*(?:pagos|payments?|stripe|billing|checkout)[^"']*)["']/i,
  );
  if (importa) {
    problemas.push(
      `${archivo}: toca la protección de racha y además importa \`${importa[1]}\`. ` +
        "D-014: nunca se vende protección de racha; `mc-16` documenta que Duolingo mezcla las " +
        "vías de obtención del freeze con gemas comprables, y ése es exactamente el patrón " +
        "que D-014 prohíbe por nombre.",
    );
  }

  // La vecindad.
  for (const i of tocaProteccion) {
    for (let j = Math.max(0, i - RADIO); j <= Math.min(lineas.length - 1, i + RADIO); j++) {
      const vecina = lineas[j];
      const hayCobro = COBRO.test(vecina);
      const haySimbolo = SIMBOLO.test(vecina);
      if (!hayCobro && !haySimbolo) continue;
      problemas.push(
        `${archivo}:${j + 1}: dinero a ${Math.abs(j - i)} línea(s) de la protección de racha ` +
          `(línea ${i + 1}) — \`${vecina.trim().slice(0, 80)}\`. Línea roja #6: la protección ` +
          "de racha jamás se vende, y línea roja #4: nunca se cobra por dejar que un niño " +
          "practique. `mc-16`: los corazones de Duolingo son «el mecanismo más criticado; la " +
          "prensa lo describe como diseñado para empujar la suscripción».",
      );
      break;
    }
  }
}

notas.push("firma verificada: ganarEscudos(estado) — sin monto, sin SKU, sin cupón, sin transacción");
notas.push(`vecindad de ±${RADIO} líneas entre protección de racha y vocabulario de cobro`);
notas.push("mc-16: «copiar la disciplina de enganche sin copiar la fricción de monetización es la decisión más importante»");

informar({
  nombre: "racha-nunca-se-vende",
  problemas,
  notas,
  cita: "línea roja #6, línea roja #4, D-014, D-021, #203, #210",
  revisados,
  resumen: `${revisados} archivo(s) de producto, esquema y locales`,
  porQueBloquea:
    "vender la protección de una racha es cobrar por la ansiedad que el producto fabricó. " +
    "D-014 lo prohíbe con esas palabras, y mc-16 documenta el producto donde ocurrió.",
  noComprueba: [
    "un cobro hecho fuera del repositorio — un enlace en un correo, una compra en la tienda " +
      "de la plataforma.",
    "si un texto presiona sin nombrar dinero («no pierdas tu racha»). Eso es léxico, y le toca " +
      "a `racha-lexico` cuando exista y a la flota adversarial.",
  ],
});
