/**
 * El banco de ítems de PRIMARIA (N3–N6 de D-017), generado desde cuatro
 * plantillas paramétricas.
 *
 * F5c (#350–#355). Es el mismo patrón que `banco-kinder.ts` — contar patos del
 * 1 al 20 es UNA plantilla, no veinte ítems (mc-40: el ~40% paramétrico es lo
 * que hace que el banco se pueda revisar; nadie revisa 1 000 ítems, cualquiera
 * revisa 4 plantillas)— con dos diferencias que importan:
 *
 *  1. **No vive aquí: vive en D1.** D-072: el banco de primaria se guarda en
 *     `item_bank` para que un ítem se corrija sin desplegar. Este archivo
 *     produce la SIEMBRA (ver `scripts/sembrar-banco-primaria.mjs`); en
 *     producción manda la tabla, y una fila corregida a mano no la pisa nadie
 *     (`INSERT OR IGNORE`). KINDER sigue en código — la deuda consciente que
 *     la propia D-072 nombra.
 *  2. **Un solo formato: `toca_la_respuesta`.** Es el único de los cinco que
 *     funciona en producción (medido por el dueño en su teléfono el
 *     2026-08-02), y es exactamente lo que primaria pide: leer un enunciado y
 *     tocar un número. Cero dibujo, cero audio, cero teclado obligatorio
 *     (mc-21: «a single mandatory typed keypad» es antipatrón de la banda).
 *
 * Los cuatro modelos cubren propósitos distintos de la tipología de Swan
 * (mc-36), para que probar cuatro diga algo sobre el producto y no solo sobre
 * un tema:
 *
 *   P01 · fluidez — suma y resta, con distractores de errores REALES
 *   P02 · concepto — comparación de magnitud y valor posicional
 *   P03 · ejemplo resuelto con un paso en blanco (Sweller & Cooper vía mc-04)
 *   P04 · patrón numérico — «¿cuál sigue?», sin dibujo (mc-36, Visual Patterns)
 *
 * **Cada distractor es un error concreto con causa nombrada** (mc-36: los
 * distractores se construyen desde errores documentados, no inventados al
 * azar). Las causas se escriben aquí como CLAVES `error.p.*` y su texto —dos
 * frases: qué pasó y cuál es el siguiente paso (mc-11)— se autora en los siete
 * locales en `apps/web/src/i18n/reto/`. `audits/banco-primaria-i18n.mjs`
 * bloquea cualquier ítem cuya clave no tenga texto en los siete.
 *
 * LO QUE ESTE ARCHIVO NO ES: el banco curado. mc-40 es explícito — los modelos
 * escriben distractores matemáticamente válidos y son malos anticipando los
 * errores que los alumnos reales cometen, así que **las cuatro plantillas y su
 * salida pasan por revisión humana** (declarado en el PR, con los checkboxes
 * sin marcar para el revisor).
 */

import type { Item, Proposito, Variacion, ErrorNombrado } from "./item.ts";
import { validarItem } from "./item.ts";

/** Las cuatro habilidades de la primera tanda de PRIMARIA (plan de F5c). */
export const HABILIDADES_PRIMARIA = {
  P01: "fluidez: suma y resta de dos dígitos",
  P02: "concepto: comparación de magnitud y valor posicional",
  P03: "ejemplo resuelto con un paso en blanco",
  P04: "patrón numérico: ¿cuál sigue?",
} as const;

export type HabilidadPrimaria = keyof typeof HABILIDADES_PRIMARIA;

/**
 * El techo de servicio por habilidad, en la escalera de D-017.
 *
 * **La reversión de la pericia (Kalyuga, mc-04):** el andamiaje que enseña al
 * principiante —el ejemplo resuelto— PERJUDICA a quien ya sabe. Por eso P03 no
 * se puede servir «a todo el mundo para siempre»: por encima de N4 se apaga.
 * El mecanismo vive en dos sitios a propósito — esta tabla lo DECLARA junto a
 * la plantilla, y la columna `hasta_nivel` de `item_bank` lo hace cumplir en
 * la lectura (`apps/web/src/lib/banco-primaria.ts` lo devuelve en el catálogo
 * y `/api/jugar` filtra). Dos sitios, un hecho: si se separan, el auditor
 * `banco-primaria-i18n` lo caza cruzándolos.
 */
export const TECHO_POR_HABILIDAD: Partial<Record<HabilidadPrimaria, number>> = {
  P03: 4,
};

/** Una plantilla de primaria: parámetros dentro, ítem fuera. */
export interface PlantillaPrimaria {
  habilidad: HabilidadPrimaria;
  proposito: Proposito;
  /** Genera un ítem concreto a partir de sus parámetros. El nivel lo decide la plantilla. */
  generar(params: Record<string, number>, variacion: Variacion | null): Item;
  /** Los juegos de parámetros que esta plantilla admite. */
  parametros(): Array<{ params: Record<string, number>; variacion: Variacion }>;
}

const id = (h: string, p: Record<string, number>) =>
  `${h.toLowerCase()}-${Object.values(p).join("-")}`;

/** Rango inclusivo con paso. */
const rango = (a: number, b: number, paso = 1) =>
  Array.from({ length: Math.floor((b - a) / paso) + 1 }, (_, i) => a + i * paso);

const unidades = (n: number) => n % 10;
const decenas = (n: number) => n - unidades(n);

/**
 * Los distractores de un ítem, sin colisiones.
 *
 * Reglas, en orden: se quitan los que valen lo mismo que la respuesta (un
 * distractor que ES la respuesta le enseña al motor a marcar mal un acierto),
 * se quitan los valores negativos y los repetidos — quedándose la PRIMERA
 * causa, que es la más específica por cómo se construyen las listas — y se
 * recorta a tres: cuatro opciones en pantalla es el formato que ya funciona.
 */
function distractores(respuesta: number, candidatos: Array<{ valor: number; causa: string }>): ErrorNombrado[] {
  const vistos = new Set<number>([respuesta]);
  const out: ErrorNombrado[] = [];
  for (const c of candidatos) {
    if (!Number.isInteger(c.valor) || c.valor < 0 || vistos.has(c.valor)) continue;
    vistos.add(c.valor);
    out.push({ valor: c.valor, causa: c.causa });
    if (out.length === 3) break;
  }
  return out;
}

// ---------------------------------------------------------------------------
// P01 — fluidez: suma y resta con distractores de errores reales (#352)
// ---------------------------------------------------------------------------
//
// mc-36: «los distractores de opción múltiple deben construirse desde errores
// reales documentados (no inventados al azar)». Aquí cada distractor ES un
// error de algoritmo con nombre: olvidar la llevada, llevar sin que toque,
// restar el menor del mayor por columna, pedir sin falta, comerse el cero,
// alinear mal el sumando de una cifra.
//
// **Radical** (lo que cambia la dificultad): el tamaño de los números y si hay
// reagrupación — por eso el NIVEL lo decide la plantilla: sin reagrupación es
// N3, con reagrupación es N4. **Incidental**: los números concretos.
export const P01: PlantillaPrimaria = {
  habilidad: "P01",
  proposito: "interpretar",
  generar({ op, a, b }, variacion) {
    const esSuma = op === 0;
    const lleva = esSuma ? unidades(a) + unidades(b) >= 10 : unidades(a) < unidades(b);
    const respuesta = esSuma ? a + b : a - b;
    const errores = esSuma
      ? distractores(respuesta, [
          // La llevada olvidada solo existe cuando HAY llevada; inventarla
          // solo existe cuando no la hay. Un distractor del otro caso no es un
          // error real: es un número equivocado al azar, que es justo lo que
          // mc-36 prohíbe sembrar.
          { valor: lleva ? respuesta - 10 : -1, causa: "error.p.no_llevo" },
          { valor: lleva ? -1 : respuesta + 10, causa: "error.p.llevo_de_mas" },
          { valor: Math.abs(a - b), causa: "error.p.resto_en_vez_de_sumar" },
          // «Olvidar el cero»: 38 + 42 = 8. Solo existe cuando el resultado
          // termina en cero — por eso no se puede escribir a mano por ítem.
          { valor: respuesta / 10, causa: "error.p.olvido_el_cero" },
          // El sumando de una cifra alineado a la izquierda: 34 + 5 = 84.
          // Solo existe cuando el sumando TIENE una cifra — con b de dos
          // dígitos daría un número absurdo que nadie produciría.
          { valor: b < 10 ? a + b * 10 : -1, causa: "error.p.alineo_mal" },
        ])
      : distractores(respuesta, [
          // Restar el menor del mayor EN CADA COLUMNA: 52 − 27 = 35. Es el
          // error que #352 nombra literalmente, y solo ocurre cuando hace
          // falta pedir: sin préstamo coincide con la respuesta y se filtra.
          { valor: decenas(a) - decenas(b) + Math.abs(unidades(a) - unidades(b)), causa: "error.p.resto_menor_del_mayor" },
          { valor: a + b, causa: "error.p.sumo_en_vez_de_restar" },
          // Misma regla que en la suma: «no pidió» solo cuando hacía falta
          // pedir; «pidió sin falta» solo cuando no hacía.
          { valor: lleva ? respuesta + 10 : -1, causa: "error.p.no_pidio" },
          { valor: lleva ? -1 : respuesta - 10, causa: "error.p.pidio_sin_faltar" },
          { valor: respuesta / 10, causa: "error.p.olvido_el_cero" },
        ]);
    return {
      id: id("P01", { op, a, b }),
      habilidad: "P01",
      nivel: lleva ? 4 : 3,
      formato: "toca_la_respuesta",
      enunciado: { clave: esSuma ? "p.fluidez.suma" : "p.fluidez.resta", vars: { a, b } },
      respuesta: { valor: respuesta, tol: 0 },
      errores,
      proposito: "interpretar",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    const mete = (op: number, a: number, b: number, radical: string) => {
      out.push({
        params: { op, a, b },
        variacion: {
          varia: radical,
          constante: op === 0 ? "sumar dos cantidades" : "restar dos cantidades",
          por_que:
            "el tamaño y la reagrupación son el eje radical: cambian la dificultad sin cambiar " +
            "la operación, así que la estrategia —no el número— es lo que se practica",
        },
      });
    };
    // Suma de dos dígitos sin llevada (N3).
    for (const a of rango(21, 86)) {
      for (const b of rango(11, 88, 4)) {
        if (a + b > 99 || unidades(a) + unidades(b) >= 10) continue;
        mete(0, a, b, "suma de dos dígitos sin reagrupación");
      }
    }
    // Suma de dos dígitos con llevada (N4).
    for (const a of rango(14, 89, 3)) {
      for (const b of rango(13, 88, 4)) {
        if (a + b > 99 || unidades(a) + unidades(b) < 10) continue;
        mete(0, a, b, "suma de dos dígitos CON reagrupación");
      }
    }
    // Suma con sumando de una cifra: aquí vive el error de alineación (N3).
    for (const a of rango(21, 92, 5)) {
      for (const b of rango(3, 9)) {
        if (a + b > 99) continue;
        mete(0, a, b, "un sumando de una sola cifra — alinear a la derecha es la dificultad");
      }
    }
    // Resta sin préstamo (N3) y con préstamo (N4).
    for (const a of rango(32, 99, 3)) {
      for (const b of rango(12, 87, 4)) {
        if (b >= a - 9) continue;
        if (unidades(a) >= unidades(b)) mete(1, a, b, "resta de dos dígitos sin préstamo");
        else mete(1, a, b, "resta de dos dígitos CON préstamo");
      }
    }
    return out;
  },
};

// ---------------------------------------------------------------------------
// P02 — concepto: comparación de magnitud y valor posicional (#353)
// ---------------------------------------------------------------------------
//
// mc-06: la precisión del sistema numérico aproximado, medida ANTES de la
// instrucción formal, predice el rendimiento matemático posterior controlando
// habilidad verbal. Comparar magnitudes no es un calentamiento: es de lo que
// más información da.
//
// **Aquí aparece por primera vez el separador de millares en el producto.**
// Los candidatos son de cuatro cifras a propósito, y el separador lo pone
// `formatear()` al servir, no la plantilla: 4 738 es `4,738` en en y es-MX,
// `4.738` en es-ES/pt-PT/de-DE y `4 738` con espacio fino insecable en fr-FR
// (mc-34). `notacion-locale` lo vigila desde #321/#322.
//
// Dos formas de la misma habilidad, con sus errores nombrados:
//
//  · **¿Cuál es el mayor?** Tres números con el mismo millar y las mismas tres
//    cifras permutadas. Un distractor gana en las unidades (comparó de derecha
//    a izquierda); otro gana en una sola posición (comparación parcial).
//  · **¿Cuánto vale la cifra?** El 7 en 4 738 vale 700. Decir «7» es nombrar
//    la cifra y no su valor; decir 7 000 u 70 es correrse un lugar.
export const P02: PlantillaPrimaria = {
  habilidad: "P02",
  proposito: "clasificar",
  generar({ forma, m, d1, d2, d3, pos }, variacion) {
    if (forma === 0) {
      // Los tres candidatos: mismo millar, las tres cifras en las tres
      // rotaciones. Con d1 < d2 < d3 el mayor es el que empieza en d3, el que
      // gana en unidades es el que TERMINA en d3, y el tercero gana solo en
      // las decenas — cada distractor tiene su error.
      const candidatos = [
        m * 1000 + d1 * 100 + d2 * 10 + d3,
        m * 1000 + d2 * 100 + d3 * 10 + d1,
        m * 1000 + d3 * 100 + d1 * 10 + d2,
      ];
      const mayor = Math.max(...candidatos);
      const ganaEnUnidades = Math.max(unidades(candidatos[0]), unidades(candidatos[1]), unidades(candidatos[2]));
      const errores = distractores(
        mayor,
        candidatos
          .filter((c) => c !== mayor)
          .map((c) => ({
            valor: c,
            causa: unidades(c) === ganaEnUnidades
              ? "error.p.comparo_desde_las_unidades"
              : "error.p.comparo_solo_una_posicion",
          })),
      );
      return {
        id: id("P02", { forma, m, d1, d2, d3, pos }),
        habilidad: "P02",
        nivel: 4,
        formato: "toca_la_respuesta",
        enunciado: { clave: "p.comparar.mayor", vars: {} },
        respuesta: { valor: mayor, tol: 0 },
        errores,
        proposito: "clasificar",
        variacion,
      };
    }

    // Valor posicional: el dígito `d` en la posición `pos` de `n`.
    // pos 3 = millares, 2 = centenas, 1 = decenas. Las unidades no se
    // preguntan: «cuánto vale el 8 en …8» se responde leyendo la cifra, sin
    // valor posicional de por medio.
    const cifras = [d3, d2, d1, m]; // unidades, decenas, centenas, millares
    const n = m * 1000 + d1 * 100 + d2 * 10 + d3;
    const d = cifras[pos === 3 ? 3 : pos]; // pos 3 → m, 2 → d1, 1 → d2
    const respuesta = d * 10 ** pos;
    const errores = distractores(respuesta, [
      { valor: d, causa: "error.p.dijo_la_cifra" },
      { valor: d * 10 ** (pos + 1), causa: "error.p.corrio_un_lugar" },
      { valor: d * 10 ** (pos - 1), causa: "error.p.cayo_un_lugar" },
      { valor: d * 10 ** (pos + 2), causa: "error.p.corrio_un_lugar" },
    ]);
    return {
      id: id("P02", { forma, m, d1, d2, d3, pos }),
      habilidad: "P02",
      nivel: 5,
      formato: "toca_la_respuesta",
      enunciado: { clave: "p.posicional.valor", vars: { n, d } },
      respuesta: { valor: respuesta, tol: 0 },
      errores,
      proposito: "interpretar",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    // Comparación: tres cifras distintas en orden creciente (así cada
    // rotación tiene un error distinto que nombrar), tres millares distintos.
    for (const m of [2, 4, 7]) {
      for (const d1 of rango(1, 7)) {
        for (const d2 of rango(d1 + 1, 8)) {
          for (const d3 of rango(d2 + 1, 9)) {
            out.push({
              params: { forma: 0, m, d1, d2, d3, pos: 0 },
              variacion: {
                varia: `las cifras ${d1}, ${d2} y ${d3} permutadas bajo el millar ${m}`,
                constante: "los tres candidatos tienen las mismas cifras y el mismo millar",
                por_que:
                  "con las cifras repetidas no ataja «el que empieza distinto»: hay que comparar " +
                  "posición por posición desde la izquierda, que es exactamente la habilidad",
              },
            });
          }
        }
      }
    }
    // Valor posicional: cuatro cifras distintas y no nulas, tres posiciones.
    for (const m of rango(1, 9)) {
      for (const d1 of rango(1, 7)) {
        const d2 = d1 + 1;
        const d3 = d2 + 1;
        if (new Set([m, d1, d2, d3]).size !== 4) continue;
        for (const pos of [1, 2, 3]) {
          out.push({
            params: { forma: 1, m, d1, d2, d3, pos },
            variacion: {
              varia: `se pregunta la cifra de la posición ${pos} de otro número de cuatro cifras`,
              constante: "la pregunta es «cuánto vale», no «qué cifra es»",
              por_que:
                "mover la posición preguntada sin cambiar la pregunta es lo que separa saber el " +
                "valor de una cifra de recitar «unidades, decenas, centenas»",
            },
          });
        }
      }
    }
    return out;
  },
};

// ---------------------------------------------------------------------------
// P03 — ejemplo resuelto con un paso en blanco (#354)
// ---------------------------------------------------------------------------
//
// mc-04 (Sweller y Cooper, 1985): para principiantes, estudiar un ejemplo
// resuelto enseña más, en menos tiempo y con menos errores, que resolver el
// mismo problema desde cero. El camino práctico es el desvanecimiento de
// Renkl: ejemplo completo → un paso en blanco → problema completo. Este modelo
// es el peldaño del medio: se enseña la solución con el ÚLTIMO paso hueco.
//
// **Se apaga por nivel, y eso no es opcional.** La reversión de la pericia
// (Kalyuga) documenta que este mismo andamiaje perjudica a quien ya sabe. El
// techo es N4 y está declarado en `TECHO_POR_HABILIDAD`: un ítem de P03 no se
// sirve a quien el motor ya ubica por encima — el filtro vive en `/api/jugar`
// y la columna en `item_bank.hasta_nivel`.
export const P03: PlantillaPrimaria = {
  habilidad: "P03",
  proposito: "analizar",
  generar({ op, a, b }, variacion) {
    const esSuma = op === 0;
    const au = unidades(a);
    const bu = unidades(b);
    if (esSuma) {
      // La descomposición: 46 + 38 → 40 + 30 = 70; 6 + 8 = 14; 70 + 14 = ?
      const sd = decenas(a) + decenas(b);
      const su = au + bu;
      const respuesta = a + b;
      return {
        id: id("P03", { op, a, b }),
        habilidad: "P03",
        nivel: 3,
        formato: "toca_la_respuesta",
        enunciado: {
          clave: "p.ejemplo.suma",
          vars: { a, b, ad: decenas(a), bd: decenas(b), sd, au, bu, su },
        },
        respuesta: { valor: respuesta, tol: 0 },
        errores: distractores(respuesta, [
          { valor: respuesta - 10, causa: "error.p.no_llevo" },
          { valor: sd, causa: "error.p.se_quedo_en_el_paso" },
          { valor: (Math.floor(a / 10) + unidades(a)) + (Math.floor(b / 10) + unidades(b)), causa: "error.p.sumo_las_cifras" },
        ]),
        proposito: "analizar",
        variacion,
      };
    }
    // Restar por partes: 63 − 28 → 63 − 20 = 43; 43 − 8 = ?
    const paso1 = a - decenas(b);
    const respuesta = a - b;
    return {
      id: id("P03", { op, a, b }),
      habilidad: "P03",
      nivel: 3,
      formato: "toca_la_respuesta",
      enunciado: {
        clave: "p.ejemplo.resta",
        vars: { a, b, bd: decenas(b), paso1, bu },
      },
      respuesta: { valor: respuesta, tol: 0 },
      errores: distractores(respuesta, [
        // Sumó de vuelta lo que quedaba por quitar: 43 + 8 = 51.
        { valor: paso1 + bu, causa: "error.p.sumo_el_final" },
        { valor: respuesta + 10, causa: "error.p.no_pidio" },
        { valor: decenas(a) - decenas(b) + Math.abs(au - bu), causa: "error.p.resto_menor_del_mayor" },
        // Se quedó en el paso que SÍ se muestra resuelto: contestó 43.
        { valor: paso1, causa: "error.p.se_quedo_en_el_paso" },
      ]),
      proposito: "analizar",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    // Suma con llevada: sin ella el «truco» del ejemplo no se ve.
    for (const a of rango(24, 89, 3)) {
      for (const b of rango(16, 88, 3)) {
        if (a + b > 99 || unidades(a) + unidades(b) < 10) continue;
        out.push({
          params: { op: 0, a, b },
          variacion: {
            varia: `los sumandos ${a} y ${b}`,
            constante: "el ejemplo se resuelve por descomposición y se pide el último paso",
            por_que:
              "mismos pasos con números distintos es lo que convierte un ejemplo visto en un " +
              "procedimiento propio — el desvanecimiento de Renkl necesita que el paso hueco se repita",
          },
        });
      }
    }
    // Resta con préstamo, misma razón. Se excluye `unidades(a) === 0`: con un
    // cero en las unidades, «sumó el final», «no pidió» y «restó al revés por
    // columna» colapsan al MISMO número, y el ítem se queda con un solo
    // distractor que además describe tres errores distintos.
    for (const a of rango(31, 99, 3)) {
      for (const b of rango(14, 89, 3)) {
        if (b >= a || unidades(a) >= unidades(b) || unidades(a) === 0) continue;
        out.push({
          params: { op: 1, a, b },
          variacion: {
            varia: `el minuendo ${a} y el sustraendo ${b}`,
            constante: "el ejemplo quita primero las decenas y se pide el último paso",
            por_que:
              "quitar por partes solo enseña cuando hace falta pedir: sin préstamo el ejemplo " +
              "resuelve una dificultad que el ítem no tiene",
          },
        });
      }
    }
    return out;
  },
};

// ---------------------------------------------------------------------------
// P04 — patrón numérico: «¿cuál sigue?» (#355)
// ---------------------------------------------------------------------------
//
// De Visual Patterns (mc-36), pero expresado en números —«2, 5, 8, 11, …»—
// para que no necesite dibujo: es el formato más barato de parametrizar y el
// que más variantes da por modelo.
//
// Tres familias, y NO son tres adornos de la misma: la aritmética enseña «el
// paso es constante», la geométrica enseña «no todo patrón suma» (el error
// documentado es seguir sumando la última diferencia) y los cuadrados enseñan
// «la diferencia también puede cambiar con regla» (el error documentado es
// repetir la última diferencia). #355 pide progresiones aritméticas y AL MENOS
// un tipo no aritmético: aquí hay dos.
//
// El separador de la lista lo escribe la PLANTILLA del locale, no este archivo:
// donde el decimal es coma, la lista se separa con punto y coma («2; 5; 8»),
// porque «2, 5» se leería como un solo número (mc-34). Por eso los términos
// viajan como variables {t1}…{t4} y no como una cadena ya pegada.
export const P04: PlantillaPrimaria = {
  habilidad: "P04",
  proposito: "analizar",
  generar({ familia, t1, d }, variacion) {
    if (familia === 0 || familia === 1) {
      // Aritmética, ascendente (0) o descendente (1).
      const paso = familia === 0 ? d : -d;
      const ts = [t1, t1 + paso, t1 + 2 * paso, t1 + 3 * paso];
      const respuesta = t1 + 4 * paso;
      const t4 = ts[3];
      return {
        id: id("P04", { familia, t1, d }),
        habilidad: "P04",
        // El salto grande y la dirección descendente son el eje radical.
        nivel: familia === 1 ? 4 : d <= 5 ? 3 : 4,
        formato: "toca_la_respuesta",
        enunciado: { clave: "p.patron.sigue", vars: { t1: ts[0], t2: ts[1], t3: ts[2], t4 } },
        respuesta: { valor: respuesta, tol: 0 },
        errores: distractores(respuesta, [
          { valor: t4 + paso + (familia === 0 ? 1 : -1), causa: "error.p.paso_disparejo" },
          { valor: t4 + 2 * paso, causa: "error.p.sumo_dos_pasos" },
          { valor: t4, causa: "error.p.repitio_el_ultimo_numero" },
        ]),
        proposito: "analizar",
        variacion,
      };
    }
    if (familia === 2) {
      // Geométrica ×2: 3, 6, 12, 24, …
      const ts = [t1, t1 * 2, t1 * 4, t1 * 8];
      const respuesta = t1 * 16;
      return {
        id: id("P04", { familia, t1, d }),
        habilidad: "P04",
        nivel: 5,
        formato: "toca_la_respuesta",
        enunciado: { clave: "p.patron.sigue", vars: { t1: ts[0], t2: ts[1], t3: ts[2], t4: ts[3] } },
        respuesta: { valor: respuesta, tol: 0 },
        errores: distractores(respuesta, [
          // Siguió sumando la última diferencia: 24 + 12. EL error de «todo
          // patrón suma» — por eso esta familia existe.
          { valor: ts[3] + (ts[3] - ts[2]), causa: "error.p.siguio_sumando" },
          { valor: ts[3], causa: "error.p.repitio_el_ultimo_numero" },
          { valor: respuesta + t1, causa: "error.p.paso_disparejo" },
        ]),
        proposito: "analizar",
        variacion,
      };
    }
    // Cuadrados consecutivos: 4, 9, 16, 25, … (empieza en t1²).
    const ts = [t1 ** 2, (t1 + 1) ** 2, (t1 + 2) ** 2, (t1 + 3) ** 2];
    const respuesta = (t1 + 4) ** 2;
    const ultimaDiferencia = ts[3] - ts[2];
    return {
      id: id("P04", { familia, t1, d }),
      habilidad: "P04",
      nivel: 6,
      formato: "toca_la_respuesta",
      enunciado: { clave: "p.patron.sigue", vars: { t1: ts[0], t2: ts[1], t3: ts[2], t4: ts[3] } },
      respuesta: { valor: respuesta, tol: 0 },
      errores: distractores(respuesta, [
        // Repitió la última diferencia: la diferencia de los cuadrados CRECE
        // (de dos en dos), y repetirla es el error que esta familia diagnostica.
        { valor: ts[3] + ultimaDiferencia, causa: "error.p.repitio_la_diferencia" },
        { valor: ts[3] + ultimaDiferencia + 1, causa: "error.p.paso_disparejo" },
        { valor: ts[3], causa: "error.p.repitio_el_ultimo_numero" },
      ]),
      proposito: "analizar",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    for (const t1 of rango(1, 24)) {
      for (const d of rango(2, 12)) {
        out.push({
          params: { familia: 0, t1, d },
          variacion: {
            varia: `empieza en ${t1} y el paso es +${d}`,
            constante: "el paso es constante y se muestran cuatro términos",
            por_que:
              "cambiar el arranque sin cambiar el paso enseña que la regla es el paso, no los " +
              "números — y cambiar el paso sin cambiar el arranque, que hay que medirlo y no adivinarlo",
          },
        });
      }
    }
    for (const t1 of rango(35, 95, 4)) {
      for (const d of rango(2, 9)) {
        // Que la serie cruce el cero no es «más difícil»: es otro tema. Los
        // negativos no son de esta banda (PRIMARIA, N3–N6), y un distractor
        // negativo se filtraría dejando el ítem cojo.
        if (t1 - 4 * d < 0) continue;
        out.push({
          params: { familia: 1, t1, d },
          variacion: {
            varia: `empieza en ${t1} y el paso es −${d}`,
            constante: "el paso es constante y se muestran cuatro términos",
            por_que:
              "un patrón que baja rompe el atajo «siempre crece»: la regla se tiene que medir " +
              "en los datos, no suponerse de la familia anterior",
          },
        });
      }
    }
    for (const t1 of rango(1, 7)) {
      out.push({
        params: { familia: 2, t1, d: 0 },
        variacion: {
          varia: `empieza en ${t1} y cada término es el doble del anterior`,
          constante: "se muestran cuatro términos, como en las aritméticas",
          por_que:
            "misma presentación que una aritmética y regla distinta: es la forma más barata de " +
            "enseñar que «el paso constante» era una propiedad de la familia, no de los patrones",
        },
      });
    }
    for (const t1 of rango(1, 6)) {
      out.push({
        params: { familia: 3, t1, d: 0 },
        variacion: {
          varia: `los cuadrados desde ${t1}²`,
          constante: "se muestran cuatro términos, como en las demás",
          por_que:
            "aquí la DIFERENCIA cambia con regla (crece de dos en dos): quien repite la última " +
            "diferencia falla de una forma nombrada, que es lo que este ítem diagnostica",
        },
      });
    }
    return out;
  },
};

export const PLANTILLAS_PRIMARIA: PlantillaPrimaria[] = [P01, P02, P03, P04];

/**
 * Genera la siembra del banco de primaria desde las plantillas.
 *
 * Determinista, igual que `generarBanco()`: los mismos parámetros dan los
 * mismos ítems con los mismos ids, corrida tras corrida. En producción el
 * banco se LEE de `item_bank` (D-072); esta función es la fuente de la siembra
 * y de los auditores, no del camino en vivo.
 *
 * VALIDA cada ítem antes de devolverlo, igual que `generarBanco()` (issue
 * #366): si la siembra produce un ítem mal formado, revienta AQUÍ —en el
 * script que siembra— y no como una fila rota en `item_bank` que un niño
 * reciba semanas después.
 */
export function generarBancoPrimaria(): Item[] {
  const banco = PLANTILLAS_PRIMARIA.flatMap((p) =>
    p.parametros().map(({ params, variacion }) => p.generar(params, variacion)),
  );
  const malos = banco.flatMap((item) =>
    validarItem(item).map((problema) => `${item.id}: ${problema}`),
  );
  if (malos.length > 0) {
    throw new Error(
      `generarBancoPrimaria(): ${malos.length} ítem(s) mal formados — la siembra NO se construye:\n  · ` +
        malos.join("\n  · "),
    );
  }
  return banco;
}
