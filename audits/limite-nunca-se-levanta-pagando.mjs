#!/usr/bin/env node
// Auditor determinista — el límite de pantalla no se levanta pagando
//
// Hace cumplir: línea roja #4, línea roja #2, D-016, D-021, D-057, #265.
//
// ─── Por qué existe ───────────────────────────────────────────────────────
//
// La línea roja #4 dice «nunca se cobra por dejar que un niño practique», y la
// forma en que eso se rompe **no es cobrar por jugar**: es cobrar por que el
// límite no aplique. Un «desbloquea 30 minutos más» es exactamente la misma
// transacción con otro nombre, y además es peor, porque convierte la
// herramienta que el padre usa para proteger a su hijo en la palanca de venta.
//
// D-057 ya decidió que el panel, los reportes y el límite de pantalla se
// construyen **gratis para todo padre**, y D-021 —el Plan Familia— nunca listó
// el límite entre lo de pago. Esto es esa decisión convertida en un comando.
//
// Y hay una trampa concreta que este archivo cierra: el límite se puede
// levantar **sin escribir una sola palabra de dinero**, con un `plan` o un
// `premium` que ensanche `daily_minutes`. Nadie escribe `venderMinutos()`;
// alguien agrega «un campo que hace falta».
//
// ─── Cómo comprueba, y por qué de cuatro formas (D-070) ──────────────────
//
//   1. LAS FIRMAS — ninguna función del motor recibe un monto, un SKU, un plan
//      ni una bandera de suscripción. Es lo más barato y lo primero que se
//      rompería.
//   2. DINÁMICO — **ejecuta** `decidir()` con campos de pago inyectados en la
//      entrada y exige que la decisión no se mueva ni un byte. Es el eje que un
//      grep no puede dar: prueba que pagar no cambia el resultado, en vez de
//      que la palabra «pago» no aparezca.
//   3. EL GRAFO — ningún archivo que toque el límite puede importar un cliente
//      de pagos ni una ruta de cobro.
//   4. LOS LOCALES — una cadena de suscripción cerca de una cadena de límite es
//      la tienda ya pintada, en los siete idiomas.
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Un cobro fuera del repositorio: un enlace de pago en un correo, una compra
//    dentro de la tienda de la plataforma.
//  · Si el límite es generoso o tacaño. Eso es D-016 y producto.
//  · Un gateo hecho en infraestructura — una regla de WAF que sirva otra cosa a
//    quien no paga. Ningún auditor de archivos puede cerrar eso.

import { archivos, leer, informar, sinComentarios, palabra, existe } from "./lib/repo.mjs";
import {
  decidir,
  decidirAlIniciar,
  configuracionVigente,
  minutosDiariosPermitidos,
  usoInicial,
  LIMITES_POR_BANDA,
} from "../packages/motor/src/limite-pantalla.ts";

const MOTOR = "packages/motor/src/limite-pantalla.ts";

/** Lo que el límite de pantalla ES, en las dos lenguas en que se escribe el repo. */
const LIMITE = palabra(
  "daily_minutes", "break_every_min", "bedtime_cutoff_min", "bedtime_local",
  "screen_?time", "screentime", "screen_?limit", "limite_?de_?pantalla",
  "tiempoDePantalla", "LIMITES_?POR_?BANDA", "minutosDiariosPermitidos",
  "screen_time_daily_usage", "screen_time_settings", "minutes_used",
);

/** Vocabulario de cobro. `plan`, `tier` y `premium` incluidos: es como llega envuelto. */
const COBRO = palabra(
  "price", "precio", "cost", "costo", "coste", "amount_cents", "amount",
  "sku", "cupon", "coupon", "checkout", "stripe", "paypal", "purchase", "comprar",
  "buy", "iap", "in_?app_?purchase", "subscription", "suscripcion", "subscribe",
  "premium", "paywall", "upgrade", "mejora_?de_?plan", "gems", "gemas", "coins",
  "monedas", "currency", "moneda", "trial", "plan_?familia", "billing",
);

/** Un símbolo de moneda escrito a mano. */
const SIMBOLO = /(?:^|[\s(:="'`\[{])(?:[$€£¥]\s?\d|\d+\s?(?:USD|EUR|MXN|BRL|GBP)\b)/;

/**
 * Nombres de parámetro que jamás pueden aparecer en las firmas del motor.
 *
 * Sin frontera de palabra a propósito, igual que en `racha-nunca-se-vende` y por
 * la misma razón medida allí: los parámetros del motor son seis nombres
 * controlados, así que no hay falso positivo posible — y con frontera se escapa
 * justo la forma en que esto se escribiría de verdad, `planDelHogar`, porque la
 * `D` mayúscula es carácter de palabra para `\b`.
 */
const PARAMETRO_PROHIBIDO =
  /(precio|price|monto|amount|sku|cupon|coupon|transaccion|transaction|pago|payment|plan|tier|premium|checkout|stripe|suscrip|subscri|paywall|upgrade)/i;

const RADIO = 6;

const problemas = [];
const notas = [];
let revisados = 0;

// ─── 1. Las firmas del motor ─────────────────────────────────────────────────

if (!existe(MOTOR)) {
  problemas.push(
    `${MOTOR} no existe. Este auditor lee sus firmas y lo ejecuta, así que sin él no comprueba ` +
      "lo principal — y «no comprobé» no puede leerse como «está bien».",
  );
} else {
  revisados++;
  const texto = sinComentarios(leer(MOTOR) ?? "");

  for (const nombre of [
    "minutosDiariosPermitidos", "configuracionVigente", "configuracionPorDefecto",
    "decidir", "decidirAlIniciar", "acumular", "diaCumplidoPorCorte", "enVentanaNocturna",
  ]) {
    const m = texto.match(new RegExp(`function\\s+${nombre}\\s*\\(([\\s\\S]*?)\\)\\s*:`));
    if (!m) {
      problemas.push(
        `${MOTOR}: no se encontró la firma de \`${nombre}\`. Si se renombró, este auditor deja de ` +
          "vigilarla en silencio, que es peor que si bloqueara.",
      );
      continue;
    }
    if (PARAMETRO_PROHIBIDO.test(m[1])) {
      problemas.push(
        `${MOTOR}: \`${nombre}\` recibe un parámetro de pago — ` +
          `\`${m[1].replace(/\s+/g, " ").trim().slice(0, 90)}\`. Línea roja #4: nunca se cobra por ` +
          "dejar que un niño practique, y levantar el límite pagando es esa misma transacción con " +
          "otro nombre. D-057: el límite de pantalla se construye gratis para todo padre.",
      );
    }
  }

  // Y la interfaz de entrada, que es donde de verdad se colaría: `decidir`
  // recibe un objeto, así que un campo nuevo no toca la firma.
  const entrada = texto.match(/interface\s+EntradaDeDecision\s*\{([\s\S]*?)\n\}/);
  if (!entrada) {
    problemas.push(
      `${MOTOR}: no se encontró \`interface EntradaDeDecision\`. Es donde un campo de pago se ` +
        "colaría sin tocar ninguna firma, así que perderla de vista es perder el eje entero.",
    );
  } else if (PARAMETRO_PROHIBIDO.test(entrada[1])) {
    problemas.push(
      `${MOTOR}: \`EntradaDeDecision\` declara un campo de pago — ` +
        `\`${entrada[1].replace(/\s+/g, " ").trim().slice(0, 120)}\`. No es que se ignore: es que ` +
        "no puede haber dónde ponerlo (línea roja #4, D-057).",
    );
  }

  if (/from\s+["'][^"']*(pagos|payments?|stripe|billing|checkout)/i.test(texto)) {
    problemas.push(
      `${MOTOR} importa algo de un módulo de pagos. El motor del límite no puede conocer el cobro ` +
        "ni de lejos (línea roja #4, D-057).",
    );
  }
}

// ─── 2. Dinámico: pagar no mueve la decisión ni un byte ─────────────────────

if (existe(MOTOR)) {
  revisados++;
  /** Cómo llegaría el pago si alguien lo colara: como un campo más de la entrada. */
  const DISFRACES = [
    { plan: "familia" },
    { plan: "premium", tier: 2 },
    { premium: true },
    { suscripcion_activa: 1 },
    { subscription: { status: "active" } },
    { pagado: true, sku: "minutos_extra", precio: 999 },
    { trial: true },
    { daily_minutes: 600 },
    { minutosExtra: 60 },
  ];

  let combinaciones = 0;
  let rotas = 0;

  for (const banda of Object.keys(LIMITES_POR_BANDA)) {
    const limite = LIMITES_POR_BANDA[banda];
    for (const minutos of [0, 5, limite.defaultMin - 5, limite.defaultMin, limite.defaultMin + 30]) {
      for (const desdeDescanso of [0, limite.descansoCadaMin, limite.descansoCadaMin + 10]) {
        for (const hora of ["09:00", "16:00", "19:45", "21:30", "02:00"]) {
          for (const bedtime of [null, "20:30"]) {
            const base = {
              banda,
              config: {
                daily_minutes: limite.defaultMin,
                break_every_min: limite.descansoCadaMin,
                bedtime_cutoff_min: limite.corteNocturnoMinAntes,
                bedtime_local: bedtime,
              },
              uso: {
                ...usoInicial("2026-08-02"),
                minutes_used: minutos,
                minutes_since_break: desdeDescanso,
              },
              horaAhora: hora,
              puntoSeguro: true,
            };
            const limpio = JSON.stringify(decidir(base));
            const limpioInicio = JSON.stringify(decidirAlIniciar(base));

            for (const disfraz of DISFRACES) {
              combinaciones++;
              const conPago = JSON.stringify(decidir({ ...base, ...disfraz }));
              const conPagoInicio = JSON.stringify(decidirAlIniciar({ ...base, ...disfraz }));
              if ((conPago !== limpio || conPagoInicio !== limpioInicio) && rotas++ < 3) {
                problemas.push(
                  `${MOTOR}: el campo ${JSON.stringify(disfraz)} MUEVE la decisión. Con ${banda}, ` +
                    `${minutos} min usados y las ${hora}, sin él da ${limpio} y con él da ${conPago}. ` +
                    "Línea roja #4: el límite de pantalla no se levanta pagando, ni por el padre. " +
                    "D-057 lo decidió por escrito: el límite se construye gratis para todo padre.",
                );
              }
            }
          }
        }
      }
    }
  }

  // Y la otra puerta: una fila de configuración con más minutos de los que la
  // banda permite tampoco los da, venga de donde venga.
  for (const banda of Object.keys(LIMITES_POR_BANDA)) {
    const inflada = configuracionVigente(banda, {
      daily_minutes: 600,
      break_every_min: 999,
      bedtime_cutoff_min: 0,
      bedtime_local: null,
    });
    if (inflada.daily_minutes > LIMITES_POR_BANDA[banda].maxMin) {
      problemas.push(
        `${MOTOR}: \`configuracionVigente("${banda}", …)\` aceptó ${inflada.daily_minutes} minutos, ` +
          `y el máximo de D-016 es ${LIMITES_POR_BANDA[banda].maxMin}. Una fila escrita por una vía ` +
          "que no validó —o comprada— no puede convertirse en un límite que D-016 no permite.",
      );
    }
    if (minutosDiariosPermitidos(banda, 600)) {
      problemas.push(`${MOTOR}: \`minutosDiariosPermitidos("${banda}", 600)\` dijo que sí.`);
    }
  }

  notas.push(`ejecutado: ${combinaciones} decisiones con campos de pago inyectados, ninguna se movió`);
}

// ─── 3 y 4. El grafo, la vecindad y los locales ──────────────────────────────

/**
 * Los archivos de prueba se quedan fuera de la vecindad, y hay que decir por qué.
 *
 * `limite-pantalla.prueba.mjs` contiene, a propósito, `{ premium: true }` y
 * `{ pagado: true, sku: "…", precio: 999 }`: son los disfraces con los que
 * comprueba que pagar NO mueve la decisión. Bloquear ahí sería castigar a la
 * prueba que hace cumplir esta misma regla — la cuarta vez que este repositorio
 * tropieza con esa forma exacta de falso positivo (ver `sinComentarios` en
 * `lib/repo.mjs`), y la forma en que un auditor se acaba anulando por costumbre.
 *
 * El hueco que abre es real y pequeño: un precio escondido en un archivo de
 * prueba. No se despliega, y el eje DINÁMICO de arriba —que ejecuta el motor de
 * verdad— no depende de este filtro.
 */
const ES_PRUEBA = /\.(prueba|test|spec)\.(mjs|ts|js)$|\/simulacion-/;

for (const archivo of archivos(/\.(ts|tsx|js|jsx|mjs|astro|json|sql)$/).filter(
  (f) => /^(apps|packages|workers|migrations)\//.test(f) && !ES_PRUEBA.test(f),
)) {
  const crudo = leer(archivo) ?? "";
  revisados++;
  // Los comentarios se quitan salvo en JSON, donde no los hay y donde el
  // contenido ES el texto que un padre leería.
  const texto = archivo.endsWith(".json") ? crudo : sinComentarios(crudo);
  if (!LIMITE.test(texto)) continue;

  const importa = texto.match(
    /(?:import[^\n]*from\s*|require\s*\(\s*)["']([^"']*(?:pagos|payments?|stripe|billing|checkout)[^"']*)["']/i,
  );
  if (importa) {
    problemas.push(
      `${archivo}: toca el límite de pantalla y además importa \`${importa[1]}\`. D-021 nunca listó ` +
        "el límite entre lo de pago y D-057 lo decidió gratis; la línea roja #4 dice por qué eso no " +
        "es una concesión comercial sino un límite del producto.",
    );
  }

  const lineas = texto.split("\n");
  const tocaLimite = [];
  for (let i = 0; i < lineas.length; i++) if (LIMITE.test(lineas[i])) tocaLimite.push(i);

  for (const i of tocaLimite) {
    for (let j = Math.max(0, i - RADIO); j <= Math.min(lineas.length - 1, i + RADIO); j++) {
      if (!COBRO.test(lineas[j]) && !SIMBOLO.test(lineas[j])) continue;
      problemas.push(
        `${archivo}:${j + 1}: dinero a ${Math.abs(j - i)} línea(s) del límite de pantalla ` +
          `(línea ${i + 1}) — \`${lineas[j].trim().slice(0, 80)}\`. Línea roja #4: nunca se cobra ` +
          "por dejar que un niño practique. Un «desbloquea 30 minutos más» es esa misma " +
          "transacción con otro nombre, y convierte la herramienta con la que el padre protege a " +
          "su hijo en la palanca de venta.",
      );
      break;
    }
  }
}

notas.push("firmas verificadas: ninguna función del límite recibe monto, SKU, plan ni suscripción");
notas.push(`vecindad de ±${RADIO} líneas entre el límite de pantalla y vocabulario de cobro`);
notas.push("D-057: el panel, los reportes y el límite de pantalla se construyen gratis para todo padre");

informar({
  nombre: "limite-nunca-se-levanta-pagando",
  problemas,
  notas,
  cita: "líneas rojas #4 y #2, D-016, D-021, D-057, #265",
  revisados,
  resumen: `${revisados} archivo(s) de producto, esquema y locales, y el motor ejecutado con pagos inyectados`,
  porQueBloquea:
    "cobrar por levantar el límite convierte la herramienta con la que un padre protege a su " +
    "hijo en la palanca de venta, y es la línea roja #4 rota sin que aparezca la palabra «jugar».",
  noComprueba: [
    "un cobro hecho fuera del repositorio — un enlace en un correo, una compra en la tienda de " +
      "la plataforma.",
    "si el límite es generoso o tacaño. Eso es D-016 y producto.",
    "un gateo hecho en infraestructura, por ejemplo una regla que sirva otra cosa a quien no paga.",
    "vocabulario de cobro dentro de un archivo de PRUEBA. Se excluye a propósito: la prueba del " +
      "motor inyecta `{ premium: true }` para demostrar que no cambia nada, y bloquearla sería " +
      "castigar a la prueba que hace cumplir esta regla. El eje dinámico no depende de ese filtro.",
  ],
});
