/**
 * El banco de la franja adulta (SERIO, N8–N10 de D-017). F5b (#159–#167, D-034).
 *
 * Es el mismo patrón que `banco-primaria.ts` — el ítem es ESTRUCTURA, jamás
 * texto ya formado— con las tres diferencias que D-034 manda:
 *
 *  1. **Una sola autoría, siete renders de notación.** Cada ítem tiene UNA
 *     `enunciado.clave`; sus números viajan como `vars` y los escribe
 *     `formatear()` al servir (`3.5` en en/es-MX, `3,5` en los demás, `10 000`
 *     con espacio fino insecable en fr-FR — mc-34). Los SIGNOS los autora la
 *     plantilla del locale en `i18n/reto/`: de-DE multiplica con `·` y divide
 *     con `:` porque en un aula alemana el `×` se lee como la variable x. No
 *     hay siete autorías del ítem: hay una estructura y siete presentaciones.
 *  2. **~150 ítems, no 400.** «Es una franja, no una banda» (D-034). El número
 *     exacto lo mide y lo publica `audits/franja-adulta.mjs`, que BLOQUEA por
 *     encima de 200 para que «mínima» no crezca sola.
 *  3. **Sin Sabana, sin modo historia, sin series curadas.** La Sabana es de
 *     kinder. Estos ítems no llevan `contexto`, no referencian ningún lugar
 *     del sendero y no entran en serie curada: la franja compone retos del
 *     banco con el MISMO motor adaptativo de F4 — no se le escribió uno
 *     «para adultos» (D-034, #164).
 *
 * ─── De plantilla o a mano, y por qué se DECLARA ────────────────────────────
 *
 * mc-40 documenta que la proporción paramétrica BAJA con el nivel: ~70% en
 * kinder, 20–35% en esta franja. Por eso cada plantilla declara su `tipo`:
 *
 *  · `parametrica` — muchos ítems salen de un mismo modelo con los
 *    distractores calculados (¿cuánto es el 25% de 400?).
 *  · `manual` — UN ítem por juego de parámetros, autorado de uno en uno (la
 *    media que se confunde con la mediana necesita cuatro números escogidos
 *    para que las dos salgan distintas; eso no se parametriza, se escoge).
 *
 * El auditor cuenta y PUBLICA la proporción (#165): si la plantilla no da de
 * sí, el costo real de autoría aparece en el número, no en una sorpresa.
 *
 * ─── El formato: `toca_la_respuesta`, y lo que se difiere ───────────────────
 *
 * Es el único formato que funciona en producción (medido por el dueño el
 * 2026-08-02) y es el primero de la lista de mc-36 para adulto: **MCQ con
 * distractores de misconcepción** — cada distractor ES un error documentado
 * con causa nombrada (el aditivo en vez del multiplicativo en regla de tres,
 * «menos por menos da menos», la media confundida con la mediana). El hueco en
 * ecuación se presenta como MCQ («Si 3x + 5 = 20, ¿cuánto vale x?»).
 *
 * Lo que mc-36 pide y aquí NO está, declarado en el PR: la **entrada numérica
 * con tolerancia** (el formato Fermi) y el **Open Middle** necesitan un formato
 * nuevo en `components/reto/` — no existen, y este frente no los construye.
 *
 * ─── El registro cambia, el respeto no (línea roja #7) ─────────────────────
 *
 * Las causas `error.a.*` se autoraRAN en los siete locales con registro de
 * adulto: se nombra qué pasó y cuál es el siguiente paso (mc-11), sin tutear
 * la inteligencia de nadie y sin el tono infantil del banco de kinder. Un
 * adulto también merece que Larry sepa QUÉ error cometió (#166).
 *
 * LO QUE ESTE ARCHIVO NO ES: el banco curado. mc-40 es explícito — los modelos
 * escriben distractores matemáticamente válidos y son malos anticipando los
 * errores que la gente real comete, así que **las plantillas y su salida pasan
 * por revisión humana** (declarado en el PR, con los checkboxes sin marcar).
 */

import type { Item, Proposito, Variacion, ErrorNombrado } from "./item.ts";

/** Las trece habilidades de la franja adulta (plan de F5b, #159). */
export const HABILIDADES_ADULTO = {
  A01: "porcentaje de una cantidad",
  A02: "aumentos y descuentos porcentuales",
  A03: "fracciones: de una cantidad y como decimal",
  A04: "proporcionalidad (regla de tres)",
  A05: "potencias y raíces exactas",
  A06: "orden de las operaciones",
  A07: "operaciones con enteros",
  A08: "ecuación con una incógnita",
  A09: "media aritmética",
  A10: "estimación y orden de magnitud",
  A11: "máximo común divisor y mínimo común múltiplo",
  A12: "secuencias y patrones",
  A13: "división exacta mental",
} as const;

export type HabilidadAdulto = keyof typeof HABILIDADES_ADULTO;

/**
 * Una plantilla de la franja: parámetros dentro, ítem fuera.
 *
 * `tipo` es la declaración que hace MEDIBLE la proporción de plantilla (#165):
 * `parametrica` produce muchos ítems por modelo; `manual` produce uno por
 * juego de parámetros, escogido a mano. El nivel viaja por juego de parámetros
 * porque una misma forma («¿cuánto es 144 : 12?») no cuesta lo mismo con
 * números de dos cifras que de cuatro.
 */
export interface PlantillaAdulto {
  habilidad: HabilidadAdulto;
  proposito: Proposito;
  tipo: "parametrica" | "manual";
  generar(params: Record<string, number>, variacion: Variacion, nivel: number): Item;
  parametros(): Array<{ params: Record<string, number>; variacion: Variacion; nivel: number }>;
}

const id = (h: string, p: Record<string, number>) =>
  `${h.toLowerCase()}-${Object.values(p).join("-")}`;

/**
 * Los distractores de un ítem de la franja, sin colisiones.
 *
 * A diferencia del de primaria, aquí SÍ se admiten negativos y decimales: los
 * enteros son materia de la franja (A07) y «1/4 como decimal» es 0,25. Se
 * filtran los valores no finitos y los no representables con limpieza (la
 * división invertida 200 × 5/3 no produce un botón), se normaliza el ruido de
 * punto flotante a cuatro decimales, se quitan los que valen lo mismo que la
 * respuesta y los repetidos — quedándose la PRIMERA causa, que es la más
 * específica por cómo se construyen las listas — y se recorta a tres.
 */
function distractores(respuesta: number, candidatos: Array<{ valor: number; causa: string }>): ErrorNombrado[] {
  const limpio = (v: number) => {
    const r = Math.round(v * 10000) / 10000;
    return Object.is(r, -0) ? 0 : r;
  };
  const vistos = new Set<number>([limpio(respuesta)]);
  const out: ErrorNombrado[] = [];
  for (const c of candidatos) {
    if (!Number.isFinite(c.valor)) continue;
    const v = limpio(c.valor);
    if (vistos.has(v)) continue;
    vistos.add(v);
    out.push({ valor: v, causa: c.causa });
    if (out.length === 3) break;
  }
  return out;
}

const variacionDe = (varia: string, constante: string, por_que: string): Variacion => ({
  varia,
  constante,
  por_que,
});

// ---------------------------------------------------------------------------
// A01 — porcentaje de una cantidad (N8, PARAMÉTRICA)
// ---------------------------------------------------------------------------
//
// El 25% de 400. Los tres distractores son los tres errores documentados del
// porcentaje: correr la coma a la izquierda (÷10 en vez de ÷100), correrla de
// más (÷1000) y restar los puntos como si fueran unidades (400 − 25). Los
// parámetros se escogen para que los tres salgan enteros: un distractor con
// decimales delataría por descarte cuál es la respuesta.
export const A01: PlantillaAdulto = {
  habilidad: "A01",
  proposito: "interpretar",
  tipo: "parametrica",
  generar({ p, n }, variacion, nivel) {
    const r = (n * p) / 100;
    return {
      id: id("A01", { p, n }),
      habilidad: "A01",
      nivel,
      formato: "toca_la_respuesta",
      enunciado: { clave: "a.pct.de", vars: { p, n } },
      respuesta: { valor: r, tol: 0 },
      errores: distractores(r, [
        { valor: (n * p) / 10, causa: "error.a.pct_coma_corrida" },
        { valor: (n * p) / 1000, causa: "error.a.pct_dividio_de_mas" },
        { valor: n - p, causa: "error.a.pct_resto_puntos" },
      ]),
      proposito: "interpretar",
      variacion,
    };
  },
  parametros() {
    const juegos: Array<[number, number]> = [
      [5, 400], [5, 600], [10, 200], [10, 400], [20, 150], [20, 250],
      [25, 200], [25, 400], [50, 160], [50, 240], [75, 200], [75, 400],
    ];
    return juegos.map(([p, n]) => ({
      params: { p, n },
      nivel: 8,
      variacion: variacionDe(
        `el porcentaje y la cantidad (${p}% de ${n})`,
        "la pregunta es siempre «qué vale esta parte del todo»",
        "cambiar el porcentaje sin cambiar la pregunta obliga a calcular la proporción " +
          "cada vez, en vez de memorizar «la mitad» o «la cuarta parte» como atajos",
      ),
    }));
  },
};

// ---------------------------------------------------------------------------
// A02 — aumentos y descuentos porcentuales (N9)
// ---------------------------------------------------------------------------
//
// Dos formas de la misma habilidad, y sus errores no son los de A01: aquí el
// error típico es contestar EL PORCENTAJE (el descuento) en vez del precio
// final, o moverse en la dirección equivocada (sumar el descuento, quitar la
// propina). La familia del descuento tiene una tanda paramétrica y otra a mano;
// la propina se autora entera a mano.
function itemDescuento(n: number, p: number, variacion: Variacion, nivel: number): Item {
  const descuento = (n * p) / 100;
  const r = n - descuento;
  return {
    id: id("A02", { forma: 0, n, p }),
    habilidad: "A02",
    nivel,
    formato: "toca_la_respuesta",
    enunciado: { clave: "a.pct.descuento", vars: { n, p } },
    respuesta: { valor: r, tol: 0 },
    errores: distractores(r, [
      { valor: descuento, causa: "error.a.pct_solo_el_porcentaje" },
      { valor: n - p, causa: "error.a.pct_resto_puntos" },
      { valor: n + descuento, causa: "error.a.pct_sumo_en_vez_de_quitar" },
    ]),
    proposito: "analizar",
    variacion,
  };
}

function itemAumento(n: number, p: number, variacion: Variacion, nivel: number): Item {
  const extra = (n * p) / 100;
  const r = n + extra;
  return {
    id: id("A02", { forma: 1, n, p }),
    habilidad: "A02",
    nivel,
    formato: "toca_la_respuesta",
    enunciado: { clave: "a.pct.aumento", vars: { n, p } },
    respuesta: { valor: r, tol: 0 },
    errores: distractores(r, [
      { valor: extra, causa: "error.a.pct_solo_el_porcentaje" },
      { valor: n + p, causa: "error.a.pct_sumo_puntos" },
      { valor: n - extra, causa: "error.a.pct_quito_en_vez_de_sumar" },
    ]),
    proposito: "analizar",
    variacion,
  };
}

export const A02_PARAM: PlantillaAdulto = {
  habilidad: "A02",
  proposito: "analizar",
  tipo: "parametrica",
  generar({ n, p }, variacion, nivel) {
    return itemDescuento(n, p, variacion, nivel);
  },
  parametros() {
    const juegos: Array<[number, number]> = [
      [90, 10], [250, 10], [80, 20], [300, 20], [120, 25], [400, 25],
    ];
    return juegos.map(([n, p]) => ({
      params: { n, p },
      nivel: 9,
      variacion: variacionDe(
        `el precio y el descuento (${n} con ${p}%)`,
        "hay que quitar una parte del todo y decir lo que queda, no la parte",
        "el salto de «cuánto es el descuento» a «cuánto se paga» es el paso que " +
          "distingue calcular un porcentaje de usarlo — por eso varía el precio, no la forma",
      ),
    }));
  },
};

export const A02_MANUAL: PlantillaAdulto = {
  habilidad: "A02",
  proposito: "analizar",
  tipo: "manual",
  generar({ forma, n, p }, variacion, nivel) {
    return forma === 0 ? itemDescuento(n, p, variacion, nivel) : itemAumento(n, p, variacion, nivel);
  },
  parametros() {
    const descuentos: Array<[number, number]> = [[45, 20], [75, 12], [350, 30], [240, 15]];
    const aumentos: Array<[number, number]> = [[80, 15], [120, 10], [60, 20], [250, 8]];
    return [
      ...descuentos.map(([n, p]) => ({
        params: { forma: 0, n, p },
        nivel: 9,
        variacion: variacionDe(
          `un precio no redondo (${n} con ${p}% de descuento)`,
          "se pide el precio final, no el descuento",
          "los porcentajes de la vida no son 10% de 100: este juego se escogió a mano " +
            "para que la cuenta pida trabajar, no reconocer",
        ),
      })),
      ...aumentos.map(([n, p]) => ({
        params: { forma: 1, n, p },
        nivel: 9,
        variacion: variacionDe(
          `la dirección del cambio (aquí se AÑADE el ${p}%)`,
          "la misma mecánica porcentual que el descuento",
          "quien aprende «porcentaje es quitar» falla la propina: cambiar la dirección " +
            "sin cambiar la mecánica es lo que separa el procedimiento de la comprensión",
        ),
      })),
    ];
  },
};

// ---------------------------------------------------------------------------
// A03 — fracciones: de una cantidad, y como decimal (N8)
// ---------------------------------------------------------------------------
//
// «2/5 de 150» se resuelve dividir-y-multiplicar; los errores documentados son
// quedarse en la división (150 : 5 = 30), dar la parte COMPLEMENTARIA (lo que
// NO es 2/5), invertir la fracción y multiplicar sin dividir. La fracción como
// decimal es la segunda forma: el error canónico es «pegar» las cifras
// (3/4 → 3,4), y solo se ofrece la división invertida cuando termina — una
// división que no termina no es un botón honesto.
export const A03_FRAC: PlantillaAdulto = {
  habilidad: "A03",
  proposito: "interpretar",
  tipo: "parametrica",
  generar({ a, b, n }, variacion, nivel) {
    const r = (n * a) / b;
    return {
      id: id("A03", { forma: 0, a, b, n }),
      habilidad: "A03",
      nivel,
      formato: "toca_la_respuesta",
      enunciado: { clave: "a.frac.de", vars: { a, b, n } },
      respuesta: { valor: r, tol: 0 },
      errores: distractores(r, [
        { valor: n / b, causa: "error.a.frac_sin_numerador" },
        { valor: n - r, causa: "error.a.frac_complemento" },
        { valor: (n * b) / a, causa: "error.a.frac_invertida" },
        { valor: n * a, causa: "error.a.frac_sin_dividir" },
      ]),
      proposito: "interpretar",
      variacion,
    };
  },
  parametros() {
    const juegos: Array<[number, number, number]> = [
      [2, 5, 150], [5, 8, 160], [3, 5, 200], [7, 10, 300],
      [2, 3, 180], [3, 4, 120], [4, 7, 210], [5, 6, 240],
    ];
    return juegos.map(([a, b, n]) => ({
      params: { a, b, n },
      nivel: 8,
      variacion: variacionDe(
        `la fracción y la cantidad (${a}/${b} de ${n})`,
        "se pide una parte del todo, con la fracción como operador",
        "cambiar el numerador sin cambiar la pregunta enseña que la fracción es " +
          "UNA operación de dos pasos — dividir y multiplicar — y no «parte de» vago",
      ),
    }));
  },
};

export const A03_DECIMAL: PlantillaAdulto = {
  habilidad: "A03",
  proposito: "interpretar",
  tipo: "manual",
  generar({ a, b }, variacion, nivel) {
    const r = a / b;
    return {
      id: id("A03", { forma: 1, a, b }),
      habilidad: "A03",
      nivel,
      formato: "toca_la_respuesta",
      enunciado: { clave: "a.frac.decimal", vars: { a, b } },
      respuesta: { valor: r, tol: 0 },
      errores: distractores(r, [
        // «Pegar» las cifras: 1/4 → 1,4. EL error de esta forma.
        { valor: a + b / 10, causa: "error.a.frac_pegada" },
        { valor: b / a, causa: "error.a.frac_reves_decimal" },
        { valor: r / 10, causa: "error.a.dec_coma_corrida" },
      ]),
      proposito: "interpretar",
      variacion,
    };
  },
  parametros() {
    // Numerador 1 salvo (4,5) y (5,8): con a=1 la división invertida SIEMPRE
    // termina (b/1 = b) y es un distractor honesto; las fracciones se escogieron
    // para que las tres opciones salgan distintas y terminadas.
    const juegos: Array<[number, number]> = [[1, 2], [1, 4], [1, 5], [4, 5], [5, 8], [1, 8]];
    return juegos.map(([a, b]) => ({
      params: { a, b },
      nivel: 8,
      variacion: variacionDe(
        `la fracción (${a}/${b})`,
        "se pide el MISMO valor escrito como decimal",
        "fracción y decimal son dos escrituras de un mismo número: variar la fracción " +
          "sin cambiar la petición es lo que convierte «me la sé» en «la calculo»",
      ),
    }));
  },
};

// ---------------------------------------------------------------------------
// A04 — proporcionalidad, la regla de tres (N9)
// ---------------------------------------------------------------------------
//
// El error documentado por antonomasia (mc-36, literatura de razón y
// proporción): el razonamiento ADITIVO donde toca multiplicativo — «si en 2
// horas hace 30, en 5 hace 33». Va de distractor en todos, junto al «olvidé
// dividir» y a la razón invertida; cuando ninguno de los anteriores cabe,
// quedarse en la tasa de una hora. La máquina y las piezas evitan moneda:
// el símbolo monetario NO es el mismo en los siete locales y el ítem es uno.
export const A04: PlantillaAdulto = {
  habilidad: "A04",
  proposito: "analizar",
  tipo: "parametrica",
  generar({ a, c, b }, variacion, nivel) {
    const r = (c * b) / a;
    return {
      id: id("A04", { a, c, b }),
      habilidad: "A04",
      nivel,
      formato: "toca_la_respuesta",
      enunciado: { clave: "a.prop.maquina", vars: { c, a, b } },
      respuesta: { valor: r, tol: 0 },
      errores: distractores(r, [
        { valor: c + (b - a), causa: "error.a.prop_aditivo" },
        { valor: c * b, causa: "error.a.prop_sin_dividir" },
        { valor: (c * a) / b, causa: "error.a.prop_invertida" },
        { valor: c / a, causa: "error.a.prop_solo_la_tasa" },
      ]),
      proposito: "analizar",
      variacion,
    };
  },
  parametros() {
    const juegos: Array<[number, number, number]> = [[2, 30, 5], [3, 120, 5], [4, 80, 7], [5, 250, 8]];
    return juegos.map(([a, c, b]) => ({
      params: { a, c, b },
      nivel: 9,
      variacion: variacionDe(
        `las horas y las piezas (${c} en ${a} h, ¿y en ${b} h?)`,
        "el ritmo es constante y se pide el total a otra escala",
        "la proporcionalidad solo se distingue de la suma cuando los números no la " +
          "dejan pasar: 2 → 5 horas no es +3 piezas — varía la escala, no la regla",
      ),
    }));
  },
};

export const A04_MANUAL: PlantillaAdulto = {
  habilidad: "A04",
  proposito: "analizar",
  tipo: "manual",
  generar({ a, c, b }, variacion, nivel) {
    return A04.generar({ a, c, b }, variacion, nivel);
  },
  parametros() {
    const juegos: Array<[number, number, number]> = [
      [2, 90, 5], [3, 45, 8], [4, 140, 6], [6, 180, 4], [8, 240, 5], [10, 80, 4],
    ];
    return juegos.map(([a, c, b]) => ({
      params: { a, c, b },
      nivel: 9,
      variacion: variacionDe(
        `otra escogida a mano (${c} en ${a} h, ¿y en ${b} h?)`,
        "el ritmo es constante y se pide el total a otra escala",
        "estas seis se escogieron una a una para que el error aditivo quede cerca " +
          "de la respuesta — si el atajo y el cálculo dan lejos, el ítem no diagnostica nada",
      ),
    }));
  },
};

// ---------------------------------------------------------------------------
// A05 — potencias y raíces exactas (N8 los cuadrados, N9 las raíces)
// ---------------------------------------------------------------------------
//
// El cuadrado paramétrico: n² con n fuera de la tabla de multiplicar. Los
// errores: duplicar (n² = 2n es LA misconcepción), elevar el vecino y
// multiplicar por el siguiente. La raíz, a mano: dividir entre dos es el
// error canónico (√196 = 98), y las cifras invertidas (14 → 41) el segundo.
export const A05_CUADRADO: PlantillaAdulto = {
  habilidad: "A05",
  proposito: "interpretar",
  tipo: "parametrica",
  generar({ n }, variacion, nivel) {
    const r = n * n;
    return {
      id: id("A05", { forma: 0, n }),
      habilidad: "A05",
      nivel,
      formato: "toca_la_respuesta",
      enunciado: { clave: "a.pot.cuadrado", vars: { n } },
      respuesta: { valor: r, tol: 0 },
      errores: distractores(r, [
        { valor: 2 * n, causa: "error.a.pot_duplico" },
        { valor: (n - 1) * (n - 1), causa: "error.a.pot_vecino_cuadrado" },
        { valor: n * (n + 1), causa: "error.a.pot_por_el_siguiente" },
      ]),
      proposito: "interpretar",
      variacion,
    };
  },
  parametros() {
    return [12, 13, 14, 15, 16, 17, 18, 21].map((n) => ({
      params: { n },
      nivel: 8,
      variacion: variacionDe(
        `la base (${n}²)`,
        "se pide el cuadrado exacto, fuera de la tabla de multiplicar",
        "los cuadrados del 12 al 21 no se recitan: se calculan — y cada uno ejercita " +
          "la misma descomposición con otro número",
      ),
    }));
  },
};

export const A05_RAIZ: PlantillaAdulto = {
  habilidad: "A05",
  proposito: "interpretar",
  tipo: "manual",
  generar({ c }, variacion, nivel) {
    const r = Math.sqrt(c);
    const cifras = r >= 10 && r <= 99 ? (r % 10) * 10 + Math.floor(r / 10) : -1;
    return {
      id: id("A05", { forma: 1, c }),
      habilidad: "A05",
      nivel,
      formato: "toca_la_respuesta",
      enunciado: { clave: "a.pot.raiz", vars: { c } },
      respuesta: { valor: r, tol: 0 },
      errores: distractores(r, [
        { valor: c / 2, causa: "error.a.raiz_mitad" },
        { valor: r - 1, causa: "error.a.raiz_vecino" },
        { valor: cifras, causa: "error.a.raiz_cifras_invertidas" },
        { valor: r + 1, causa: "error.a.raiz_vecino" },
      ]),
      proposito: "interpretar",
      variacion,
    };
  },
  parametros() {
    return [196, 256, 324, 441, 529, 729].map((c) => ({
      params: { c },
      nivel: 9,
      variacion: variacionDe(
        `el cuadrado perfecto (√${c})`,
        "la raíz es exacta y hay que encontrarla o comprobarla",
        "raíz es la operación INVERSA del cuadrado: estos seis se escogieron para que " +
          "«la mitad» quede lejos y solo quepa buscar qué número al cuadrado da ése",
      ),
    }));
  },
};

// ---------------------------------------------------------------------------
// A06 — orden de las operaciones (N8, a mano)
// ---------------------------------------------------------------------------
//
// «7 + 6 × 8». El error documentado es resolver de izquierda a derecha
// ((7 + 6) × 8 = 104); los otros dos son multiplicar el par equivocado y sumar
// todo. Con paréntesis, el error es ignorarlos. Seis y cuatro ítems, todos
// escogidos para que el error de izquierda a derecha no coincida con la
// respuesta — cuando coincide, el ítem no diagnostica.
export const A06: PlantillaAdulto = {
  habilidad: "A06",
  proposito: "evaluar",
  tipo: "manual",
  generar({ forma, a, b, c }, variacion, nivel) {
    const sinParentesis = forma === 0;
    const r = sinParentesis ? a + b * c : (a + b) * c;
    return {
      id: id("A06", { forma, a, b, c }),
      habilidad: "A06",
      nivel,
      formato: "toca_la_respuesta",
      enunciado: {
        clave: sinParentesis ? "a.orden.suma_mult" : "a.orden.parentesis",
        vars: { a, b, c },
      },
      respuesta: { valor: r, tol: 0 },
      errores: sinParentesis
        ? distractores(r, [
            { valor: (a + b) * c, causa: "error.a.orden_izquierda" },
            { valor: a * c + b, causa: "error.a.orden_par_mal" },
            { valor: a + b + c, causa: "error.a.orden_sumo_todo" },
          ])
        : distractores(r, [
            { valor: a + b * c, causa: "error.a.orden_ignoro_parentesis" },
            { valor: a * c + b, causa: "error.a.orden_par_mal" },
            { valor: a + b + c, causa: "error.a.orden_sumo_todo" },
          ]),
      proposito: "evaluar",
      variacion,
    };
  },
  parametros() {
    const sin: Array<[number, number, number]> = [
      [7, 6, 8], [12, 9, 7], [25, 8, 4], [40, 6, 5], [9, 15, 6], [100, 25, 3],
    ];
    const con: Array<[number, number, number]> = [[8, 4, 7], [15, 5, 6], [12, 8, 25], [9, 11, 4]];
    return [
      ...sin.map(([a, b, c]) => ({
        params: { forma: 0, a, b, c },
        nivel: 8,
        variacion: variacionDe(
          `los tres números (${a} + ${b} × ${c})`,
          "sin paréntesis: la multiplicación va primero por convenio",
          "el orden de operaciones es un CONVENIO, no una deducción — varían los " +
            "números para que el atajo de izquierda a derecha falle cada vez distinto",
        ),
      })),
      ...con.map(([a, b, c]) => ({
        params: { forma: 1, a, b, c },
        nivel: 8,
        variacion: variacionDe(
          `el paréntesis ((${a} + ${b}) × ${c})`,
          "la misma suma y el mismo producto, con el orden forzado",
          "misma cara que la forma sin paréntesis y respuesta distinta: es la forma " +
            "más barata de enseñar que el paréntesis ES información, no decoración",
        ),
      })),
    ];
  },
};

// ---------------------------------------------------------------------------
// A07 — operaciones con enteros (N8, la resta del negativo en N9; a mano)
// ---------------------------------------------------------------------------
//
// Tres formas, una por regla de signos: (−a) + b, (−a) × b y a − (−b). Los
// errores son los de siempre, con nombre: ignorar el signo, hacerlo todo
// negativo, «menos por más da más», restar el negativo como si fuera positivo.
// Aquí los distractores negativos son VÁLIDOS — es la primera banda donde el
// cero y los negativos son botones honestos.
export const A07: PlantillaAdulto = {
  habilidad: "A07",
  proposito: "interpretar",
  tipo: "manual",
  generar({ forma, a, b }, variacion, nivel) {
    if (forma === 0) {
      const r = b - a;
      return {
        id: id("A07", { forma, a, b }),
        habilidad: "A07",
        nivel,
        formato: "toca_la_respuesta",
        enunciado: { clave: "a.enteros.suma", vars: { a, b } },
        respuesta: { valor: r, tol: 0 },
        errores: distractores(r, [
          { valor: a + b, causa: "error.a.signo_ignoro" },
          { valor: -(a + b), causa: "error.a.signo_todo_negativo" },
          { valor: -r, causa: "error.a.signo_al_reves" },
        ]),
        proposito: "interpretar",
        variacion,
      };
    }
    if (forma === 1) {
      const r = -(a * b);
      return {
        id: id("A07", { forma, a, b }),
        habilidad: "A07",
        nivel,
        formato: "toca_la_respuesta",
        enunciado: { clave: "a.enteros.mult", vars: { a, b } },
        respuesta: { valor: r, tol: 0 },
        errores: distractores(r, [
          { valor: a * b, causa: "error.a.signo_menos_por_mas" },
          { valor: -(a + b), causa: "error.a.signo_sumo" },
          { valor: b - a, causa: "error.a.signo_resto" },
        ]),
        proposito: "interpretar",
        variacion,
      };
    }
    const r = a + b;
    return {
      id: id("A07", { forma, a, b }),
      habilidad: "A07",
      nivel,
      formato: "toca_la_respuesta",
      enunciado: { clave: "a.enteros.resta", vars: { a, b } },
      respuesta: { valor: r, tol: 0 },
      errores: distractores(r, [
        { valor: a - b, causa: "error.a.signo_resta_doble" },
        { valor: -r, causa: "error.a.signo_todo_negativo" },
        { valor: b - a, causa: "error.a.signo_al_reves" },
      ]),
      proposito: "interpretar",
      variacion,
    };
  },
  parametros() {
    const sumas: Array<[number, number]> = [[12, 20], [25, 10], [40, 15], [18, 30]];
    const multis: Array<[number, number]> = [[6, 7], [8, 9], [12, 11]];
    const restas: Array<[number, number]> = [[14, 9], [30, 12], [25, 25]];
    return [
      ...sumas.map(([a, b]) => ({
        params: { forma: 0, a, b },
        nivel: 8,
        variacion: variacionDe(
          `qué número es el negativo y cuánto vale cada uno ((−${a}) + ${b})`,
          "un negativo más un positivo: el signo del resultado lo manda el mayor",
          "el error no es de cálculo sino de signo: varía cuál pesa más para que " +
            "«ignorar el menos» se vea como lo que es — una regla rota, no un desliz",
        ),
      })),
      ...multis.map(([a, b]) => ({
        params: { forma: 1, a, b },
        nivel: 8,
        variacion: variacionDe(
          `los factores ((−${a}) × ${b})`,
          "exactamente UN factor es negativo",
          "«menos por más» tiene una sola respuesta de signo: repetir la forma con " +
            "otros números es lo que asienta la regla sin recitarla",
        ),
      })),
      ...restas.map(([a, b]) => ({
        params: { forma: 2, a, b },
        nivel: 9,
        variacion: variacionDe(
          `los dos números (${a} − (−${b}))`,
          "restar un negativo ES sumar",
          "la doble negación es la regla que más se olvida pasados los veinte: tres " +
            "casos escogidos, incluido uno donde «restar como positivo» da cero y se nota",
        ),
      })),
    ];
  },
};

// ---------------------------------------------------------------------------
// A08 — la ecuación con una incógnita (N9 un paso, N10 dos pasos; a mano)
// ---------------------------------------------------------------------------
//
// El hueco en ecuación de mc-36, servido como MCQ: «Si 3x + 5 = 20, ¿cuánto
// vale x?». La escritura algebraica «3x» no lleva signo de multiplicar, así que
// es la MISMA en los siete locales — ni siquiera el de-DE del punto medio la
// toca. Los errores: no dividir, mover el término con el signo equivocado y
// aplicar las inversas en orden inverso (dividir antes de quitar el término).
export const A08: PlantillaAdulto = {
  habilidad: "A08",
  proposito: "analizar",
  tipo: "manual",
  generar({ forma, m, b, c }, variacion, nivel) {
    if (forma === 0) {
      const r = c / m;
      return {
        id: id("A08", { forma, m, b, c }),
        habilidad: "A08",
        nivel,
        formato: "toca_la_respuesta",
        enunciado: { clave: "a.ecu.un_paso", vars: { m, c } },
        respuesta: { valor: r, tol: 0 },
        errores: distractores(r, [
          { valor: c - m, causa: "error.a.ecu_resto" },
          { valor: c * m, causa: "error.a.ecu_multiplico" },
          { valor: c + m, causa: "error.a.ecu_sumo" },
        ]),
        proposito: "analizar",
        variacion,
      };
    }
    if (forma === 1) {
      const r = (c - b) / m;
      return {
        id: id("A08", { forma, m, b, c }),
        habilidad: "A08",
        nivel,
        formato: "toca_la_respuesta",
        enunciado: { clave: "a.ecu.dos_pasos_suma", vars: { m, b, c } },
        respuesta: { valor: r, tol: 0 },
        errores: distractores(r, [
          { valor: c - b, causa: "error.a.ecu_no_dividio" },
          { valor: (c + b) / m, causa: "error.a.ecu_sumo_en_vez_de_restar" },
          { valor: c / m - b, causa: "error.a.ecu_orden_inverso" },
        ]),
        proposito: "analizar",
        variacion,
      };
    }
    const r = (c + b) / m;
    return {
      id: id("A08", { forma, m, b, c }),
      habilidad: "A08",
      nivel,
      formato: "toca_la_respuesta",
      enunciado: { clave: "a.ecu.dos_pasos_resta", vars: { m, b, c } },
      respuesta: { valor: r, tol: 0 },
      errores: distractores(r, [
        { valor: (c - b) / m, causa: "error.a.ecu_resto_en_vez_de_sumar" },
        { valor: c + b, causa: "error.a.ecu_no_dividio" },
        { valor: c / m + b, causa: "error.a.ecu_orden_inverso" },
      ]),
      proposito: "analizar",
      variacion,
    };
  },
  parametros() {
    const unPaso: Array<[number, number]> = [[7, 91], [6, 102], [8, 144], [9, 135], [12, 156]];
    const dosSuma: Array<[number, number, number]> = [
      [4, 8, 40], [3, 6, 30], [5, 10, 75], [6, 12, 84], [7, 14, 98],
    ];
    const dosResta: Array<[number, number, number]> = [[3, 6, 9], [4, 8, 16], [5, 10, 40], [2, 4, 12]];
    return [
      ...unPaso.map(([m, c]) => ({
        params: { forma: 0, m, b: 0, c },
        nivel: 9,
        variacion: variacionDe(
          `el coeficiente y el resultado (${m}x = ${c})`,
          "un solo paso: deshacer la multiplicación",
          "antes de los dos pasos hay que dominar el uno: varía el coeficiente para " +
            "que la división se haga de verdad y no de memoria",
        ),
      })),
      ...dosSuma.map(([m, b, c]) => ({
        params: { forma: 1, m, b, c },
        nivel: 10,
        variacion: variacionDe(
          `los tres números (${m}x + ${b} = ${c})`,
          "primero se quita el término suelto, después el coeficiente — ese orden",
          "el orden de las inversas ES la habilidad: estos cinco se escogieron para " +
            "que dividir primero dé un número tentador y equivocado",
        ),
      })),
      ...dosResta.map(([m, b, c]) => ({
        params: { forma: 2, m, b, c },
        nivel: 10,
        variacion: variacionDe(
          `el signo del término (${m}x − ${b} = ${c})`,
          "el mismo despeje de dos pasos, con el término que resta",
          "mover un término que resta exige SUMAR al otro lado: cambiar el signo sin " +
            "cambiar la estructura es lo que separa el truco memorizado del despeje",
        ),
      })),
    ];
  },
};

// ---------------------------------------------------------------------------
// A09 — la media aritmética (N9, a mano)
// ---------------------------------------------------------------------------
//
// Dos formas. La lista: cuatro números escogidos a mano para que la MEDIANA
// salga entera y distinta de la media — la confusión media/mediana es el error
// que esta forma diagnostica, y un ítem donde coinciden no diagnostica nada.
// El dato faltante: «la media de 5 notas es 12; cuatro suman 52» — los errores
// son repetir la media, no restar lo conocido y promediar solo lo conocido.
export const A09: PlantillaAdulto = {
  habilidad: "A09",
  proposito: "analizar",
  tipo: "manual",
  generar({ forma, t1, t2, t3, t4, k, m, s }, variacion, nivel) {
    if (forma === 0) {
      const suma = t1 + t2 + t3 + t4;
      const r = suma / 4;
      const orden = [t1, t2, t3, t4].sort((x, y) => x - y);
      const mediana = (orden[1] + orden[2]) / 2;
      return {
        id: id("A09", { forma, t1, t2, t3, t4 }),
        habilidad: "A09",
        nivel,
        formato: "toca_la_respuesta",
        enunciado: { clave: "a.media.lista", vars: { t1, t2, t3, t4 } },
        respuesta: { valor: r, tol: 0 },
        errores: distractores(r, [
          { valor: suma, causa: "error.a.media_sin_dividir" },
          { valor: mediana, causa: "error.a.media_mediana" },
          { valor: suma / 2, causa: "error.a.media_pareo" },
        ]),
        proposito: "analizar",
        variacion,
      };
    }
    const r = k * m - s;
    return {
      id: id("A09", { forma, k, m, s }),
      habilidad: "A09",
      nivel,
      formato: "toca_la_respuesta",
      enunciado: { clave: "a.media.falta", vars: { k, k1: k - 1, m, s } },
      respuesta: { valor: r, tol: 0 },
      errores: distractores(r, [
        { valor: m, causa: "error.a.media_repito" },
        { valor: k * m, causa: "error.a.media_no_resto" },
        { valor: s / (k - 1), causa: "error.a.media_de_las_conocidas" },
      ]),
      proposito: "analizar",
      variacion,
    };
  },
  parametros() {
    const listas: Array<[number, number, number, number]> = [
      [10, 20, 8, 14], [20, 8, 14, 22], [9, 21, 16, 10], [30, 13, 25, 12], [46, 17, 27, 10],
    ];
    const faltan: Array<[number, number, number]> = [[4, 15, 40], [5, 12, 52], [3, 18, 30], [6, 20, 105], [4, 25, 80]];
    return [
      ...listas.map(([t1, t2, t3, t4]) => ({
        params: { forma: 0, t1, t2, t3, t4, k: 0, m: 0, s: 0 },
        nivel: 9,
        variacion: variacionDe(
          `los cuatro datos (${t1}, ${t2}, ${t3}, ${t4})`,
          "se pide la media, y la mediana queda cerca pero NO es",
          "cada lista se escogió para que la mediana salga entera y distinta: es el " +
            "único modo de que «confundió media con mediana» tenga botón propio",
        ),
      })),
      ...faltan.map(([k, m, s]) => ({
        params: { forma: 1, t1: 0, t2: 0, t3: 0, t4: 0, k, m, s },
        nivel: 9,
        variacion: variacionDe(
          `cuántas notas son y cuánto suman las conocidas (${k} con media ${m})`,
          "la media es el TOTAL repartido: hay que reconstruir el total y quitar lo conocido",
          "es la media al revés — de la parte al todo — y por eso es la forma que " +
            "distingue saber la fórmula de entender qué reparte",
        ),
      })),
    ];
  },
};

// ---------------------------------------------------------------------------
// A10 — estimación y orden de magnitud (N10, a mano)
// ---------------------------------------------------------------------------
//
// «¿Cuál es la MEJOR estimación de 49 × 51?» — 2 500. Los distractores son el
// orden de magnitud equivocado (250, 25 000) y redondear los dos a la baja
// (2 000). En el porcentaje, el cuarto error es redondear solo uno de los dos
// números (20% de 502 = 100,4). Es el format Fermi de mc-36 en su versión MCQ:
// el contrato «contiene al valor» sin teclado — la entrada numérica con
// tolerancia queda diferida y declarada.
const decena = (n: number) => Math.round(n / 10) * 10;
const centena = (n: number) => Math.round(n / 100) * 100;
const aLaBaja = (n: number) => Math.floor(n / 10) * 10;

export const A10: PlantillaAdulto = {
  habilidad: "A10",
  proposito: "evaluar",
  tipo: "manual",
  generar({ forma, a, b, p, n }, variacion, nivel) {
    if (forma === 0) {
      const r = decena(a) * decena(b);
      return {
        id: id("A10", { forma, a, b }),
        habilidad: "A10",
        nivel,
        formato: "toca_la_respuesta",
        enunciado: { clave: "a.est.producto", vars: { a, b } },
        respuesta: { valor: r, tol: 0 },
        errores: distractores(r, [
          { valor: r / 10, causa: "error.a.est_orden_menor" },
          { valor: r * 10, causa: "error.a.est_orden_mayor" },
          { valor: aLaBaja(a) * aLaBaja(b), causa: "error.a.est_a_la_baja" },
        ]),
        proposito: "evaluar",
        variacion,
      };
    }
    const r = (decena(p) * centena(n)) / 100;
    return {
      id: id("A10", { forma, p, n }),
      habilidad: "A10",
      nivel,
      formato: "toca_la_respuesta",
      enunciado: { clave: "a.est.pct", vars: { p, n } },
      respuesta: { valor: r, tol: 0 },
      errores: distractores(r, [
        { valor: r / 10, causa: "error.a.est_orden_menor" },
        { valor: r * 10, causa: "error.a.est_orden_mayor" },
        { valor: (decena(p) * n) / 100, causa: "error.a.est_mitad" },
      ]),
      proposito: "evaluar",
      variacion,
    };
  },
  parametros() {
    const productos: Array<[number, number]> = [[49, 51], [38, 62], [19, 81], [72, 48], [29, 41], [58, 92]];
    const porcentajes: Array<[number, number]> = [[18, 502], [23, 396], [47, 210], [9, 690], [31, 495], [72, 389]];
    return [
      ...productos.map(([a, b]) => ({
        params: { forma: 0, a, b, p: 0, n: 0 },
        nivel: 10,
        variacion: variacionDe(
          `los factores (${a} × ${b})`,
          "se pide la MEJOR estimación, no la cuenta exacta",
          "estimar es redondear primero y multiplicar después: los pares se escogieron " +
            "cerca de las decenas para que el orden de magnitud sea la decisión, no la cuenta",
        ),
      })),
      ...porcentajes.map(([p, n]) => ({
        params: { forma: 1, a: 0, b: 0, p, n },
        nivel: 10,
        variacion: variacionDe(
          `el porcentaje y la cantidad (${p}% de ${n})`,
          "se pide la MEJOR estimación, no la cuenta exacta",
          "es el porcentaje de A01 visto de lejos: quien solo sabe la cuenta exacta " +
            "no tiene con qué comprobarla — este ítem construye esa comprobación",
        ),
      })),
    ];
  },
};

// ---------------------------------------------------------------------------
// A11 — máximo común divisor y mínimo común múltiplo (N10, a mano)
// ---------------------------------------------------------------------------
//
// La confusión que esta habilidad diagnostica tiene nombre propio: mcd por mcm
// y mcm por mcd. Los pares se escogieron con al menos dos divisores comunes
// propios para que «un divisor común que no es el máximo» tenga botón, y con
// factores compartidos para que «multiplicar los dos» NO dé el mcm.
const mcd = (a: number, b: number): number => (b === 0 ? a : mcd(b, a % b));
const mcm = (a: number, b: number): number => (a * b) / mcd(a, b);

export const A11: PlantillaAdulto = {
  habilidad: "A11",
  proposito: "clasificar",
  tipo: "manual",
  generar({ forma, a, b, d1, d2 }, variacion, nivel) {
    if (forma === 0) {
      const r = mcd(a, b);
      return {
        id: id("A11", { forma, a, b }),
        habilidad: "A11",
        nivel,
        formato: "toca_la_respuesta",
        enunciado: { clave: "a.div.mcd", vars: { a, b } },
        respuesta: { valor: r, tol: 0 },
        errores: distractores(r, [
          { valor: mcm(a, b), causa: "error.a.mcd_confundio_mcm" },
          { valor: d1, causa: "error.a.mcd_no_maximo" },
          { valor: d2, causa: "error.a.mcd_no_maximo" },
        ]),
        proposito: "clasificar",
        variacion,
      };
    }
    const r = mcm(a, b);
    return {
      id: id("A11", { forma, a, b }),
      habilidad: "A11",
      nivel,
      formato: "toca_la_respuesta",
      enunciado: { clave: "a.div.mcm", vars: { a, b } },
      respuesta: { valor: r, tol: 0 },
      errores: distractores(r, [
        { valor: mcd(a, b), causa: "error.a.mcm_confundio_mcd" },
        { valor: a * b, causa: "error.a.mcm_producto" },
        { valor: a + b, causa: "error.a.mcm_suma" },
      ]),
      proposito: "clasificar",
      variacion,
    };
  },
  parametros() {
    // d1/d2 son divisores comunes NO máximos, escritos a mano por par: son el
    // distractor «encontré un divisor y me detuve», y exigir que lo calcule la
    // plantilla sería fingir que hay algoritmo donde hubo elección.
    const mcds: Array<[number, number, number, number]> = [
      [12, 18, 3, 2], [24, 36, 6, 4], [20, 30, 5, 2], [16, 24, 4, 2], [28, 42, 7, 2], [18, 27, 3, 1],
    ];
    const mcms: Array<[number, number]> = [[4, 6], [6, 8], [9, 12], [10, 15]];
    return [
      ...mcds.map(([a, b, d1, d2]) => ({
        params: { forma: 0, a, b, d1, d2 },
        nivel: 10,
        variacion: variacionDe(
          `la pareja (${a} y ${b})`,
          "se pide el MAYOR divisor común, no uno cualquiera",
          "los pares tienen varios divisores comunes a propósito: detenerse en el " +
            "primero es el error que este ítem nombra",
        ),
      })),
      ...mcms.map(([a, b]) => ({
        params: { forma: 1, a, b, d1: 0, d2: 0 },
        nivel: 10,
        variacion: variacionDe(
          `la pareja (${a} y ${b})`,
          "se pide el MENOR múltiplo común, y multiplicar los dos NO lo da",
          "las parejas comparten factor a propósito: el atajo «multiplica los dos» " +
            "falla en las cuatro, que es lo que lo convierte en regla y no en truco",
        ),
      })),
    ];
  },
};

// ---------------------------------------------------------------------------
// A12 — secuencias y patrones (N10, a mano)
// ---------------------------------------------------------------------------
//
// Tres familias adultas: la fibonáccica (cada término es la suma de los dos
// anteriores), la geométrica ×3 y tres reglas mixtas (n²+1, ×2+1 y los primos). El error que diagnostican
// es heredero directo del de primaria —«siguió sumando la última diferencia»—
// subido de nivel: aquí además hay que resistir la tentación de duplicar o de
// sumar vecinos equivocados.
export const A12: PlantillaAdulto = {
  habilidad: "A12",
  proposito: "analizar",
  tipo: "manual",
  generar({ forma, t1, t2, t3, t4, r }, variacion, nivel) {
    // Las reglas limpias se calculan; las mixtas traen el siguiente término
    // declarado en los parámetros — n²+1 y «los primos» no tienen una fórmula
    // de una línea que valga para las dos, y fingirla sería peor que escribirla.
    let respuesta: number;
    if (forma === 0) respuesta = t3 + t4; // fibonáccica
    else if (forma === 1) respuesta = t4 * 3; // geométrica ×3
    else respuesta = r; // mixta, declarada a mano
    const candidatos = [
      { valor: t4 + (t4 - t3), causa: "error.a.sec_diferencia" },
      { valor: t4 * 2, causa: "error.a.sec_duplico" },
      { valor: t2 + t4, causa: "error.a.sec_vecinos" },
    ];
    return {
      id: id("A12", { forma, t1, t2, t3, t4 }),
      habilidad: "A12",
      nivel,
      formato: "toca_la_respuesta",
      enunciado: { clave: "a.sec.sigue", vars: { t1, t2, t3, t4 } },
      respuesta: { valor: respuesta, tol: 0 },
      errores: distractores(respuesta, candidatos),
      proposito: "analizar",
      variacion,
    };
  },
  parametros() {
    const fib: Array<[number, number, number, number]> = [[2, 3, 5, 8], [1, 4, 5, 9], [3, 4, 7, 11], [4, 5, 9, 14]];
    const geo: Array<[number, number, number, number]> = [[2, 6, 18, 54], [3, 9, 27, 81], [4, 12, 36, 108]];
    // n²+1: 2, 5, 10, 17 → 26 · ×2+1: 3, 7, 15, 31 → 63 · los primos: → 11.
    // En los primos, «9» cae en `sec_diferencia` (la última diferencia ES 2):
    // quien contesta 9 repitió el paso anterior, y esa es la explicación justa.
    const mixtas: Array<[number, number, number, number, number]> = [
      [2, 5, 10, 17, 26], [3, 7, 15, 31, 63], [2, 3, 5, 7, 11],
    ];
    return [
      ...fib.map(([t1, t2, t3, t4]) => ({
        params: { forma: 0, t1, t2, t3, t4 },
        nivel: 10,
        variacion: variacionDe(
          `los dos primeros términos (${t1}, ${t2}, …)`,
          "cada término es la suma de los dos anteriores",
          "la regla fibonáccica no se ve en una diferencia: hay que mirar PAREJAS — " +
            "varía el arranque para que la regla se descubra, no se recite",
        ),
      })),
      ...geo.map(([t1, t2, t3, t4]) => ({
        params: { forma: 1, t1, t2, t3, t4 },
        nivel: 10,
        variacion: variacionDe(
          `el arranque (${t1}, …)`,
          "cada término es el triple del anterior",
          "misma presentación que una aritmética y regla multiplicativa: «siguió " +
            "sumando la última diferencia» tiene botón propio porque ES el error",
        ),
      })),
      ...mixtas.map(([t1, t2, t3, t4, r]) => ({
        params: { forma: 2, t1, t2, t3, t4, r },
        nivel: 10,
        variacion: variacionDe(
          `la regla escondida (${t1}, ${t2}, ${t3}, ${t4}, …)`,
          "las diferencias cambian con regla — no basta con medir una",
          "después de las dos familias limpias, éstas castigan el piloto automático: " +
            "la respuesta no sale de repetir ni de duplicar",
        ),
      })),
    ];
  },
};

// ---------------------------------------------------------------------------
// A13 — división exacta mental (N8 y N9, a mano)
// ---------------------------------------------------------------------------
//
// «144 : 12» — o «144 ÷ 12», según el locale: es el ítem que obliga a la
// plantilla de cada idioma a escribir SU signo de división, y el auditor lo
// comprueba contra la tabla de mc-34 escrita a mano (D-070). Los distractores
// son el múltiplo vecino del divisor y, cuando el cociente tiene dos cifras,
// las cifras invertidas (12 → 21).
export const A13: PlantillaAdulto = {
  habilidad: "A13",
  proposito: "interpretar",
  tipo: "manual",
  generar({ a, b }, variacion, nivel) {
    const r = a / b;
    const cifras = r >= 10 && r <= 99 ? (r % 10) * 10 + Math.floor(r / 10) : -1;
    return {
      id: id("A13", { a, b }),
      habilidad: "A13",
      nivel,
      formato: "toca_la_respuesta",
      enunciado: { clave: "a.div.exacta", vars: { a, b } },
      respuesta: { valor: r, tol: 0 },
      errores: distractores(r, [
        { valor: r - 1, causa: "error.a.div_multiplo_vecino" },
        { valor: r + 1, causa: "error.a.div_multiplo_vecino" },
        { valor: cifras, causa: "error.a.div_cifras" },
      ]),
      proposito: "interpretar",
      variacion,
    };
  },
  parametros() {
    const n8: Array<[number, number]> = [[96, 8], [144, 12], [156, 12], [225, 15], [1000, 8], [720, 9]];
    const n9: Array<[number, number]> = [[2100, 12], [1936, 11], [2025, 15], [1444, 19]];
    return [
      ...n8.map(([a, b]) => ({
        params: { a, b },
        nivel: 8,
        variacion: variacionDe(
          `dividendo y divisor (${a} entre ${b})`,
          "la división es exacta y sale sin lápiz",
          "dividir mentalmente es multiplicar al revés: estos pares se escogieron " +
            "para que el múltiplo vecino quede a UNO de distancia y el error se nombre",
        ),
      })),
      ...n9.map(([a, b]) => ({
        params: { a, b },
        nivel: 9,
        variacion: variacionDe(
          `dividendo y divisor (${a} entre ${b})`,
          "la división es exacta, con dividendos de cuatro cifras",
          "el salto de dificultad es el TAMAÑO, no la regla: es la misma habilidad " +
            "un escalón arriba en la escalera de D-017",
        ),
      })),
    ];
  },
};

export const PLANTILLAS_ADULTO: PlantillaAdulto[] = [
  A01, A02_PARAM, A02_MANUAL, A03_FRAC, A03_DECIMAL, A04, A04_MANUAL,
  A05_CUADRADO, A05_RAIZ, A06, A07, A08, A09, A10, A11, A12, A13,
];

/**
 * Genera la siembra de la franja adulta desde las plantillas.
 *
 * Determinista, igual que `generarBancoPrimaria()`: los mismos parámetros dan
 * los mismos ítems con los mismos ids, corrida tras corrida. En producción el
 * banco se LEE de `item_bank` con `banda = 'SERIO'` (D-072); esta función es la
 * fuente de la siembra y de los auditores, no del camino en vivo.
 */
export function generarBancoAdulto(): Item[] {
  return PLANTILLAS_ADULTO.flatMap((p) =>
    p.parametros().map(({ params, variacion, nivel }) => p.generar(params, variacion, nivel)),
  );
}

/**
 * La proporción de plantilla, MEDIDA (#165, mc-40).
 *
 * Cuenta cuántos ítems salieron de plantillas declaradas `parametrica` y
 * cuántos de `manual`, que es lo que mc-40 dice que hay que publicar: si la
 * plantilla no da de sí en esta franja, el número lo dice antes de comprometer
 * una fecha. `audits/franja-adulta.mjs` lo imprime en cada corrida.
 */
export function proporcionDePlantilla(): { parametrica: number; manual: number; total: number } {
  let parametrica = 0;
  let manual = 0;
  for (const p of PLANTILLAS_ADULTO) {
    const n = p.parametros().length;
    if (p.tipo === "parametrica") parametrica += n;
    else manual += n;
  }
  return { parametrica, manual, total: parametrica + manual };
}
