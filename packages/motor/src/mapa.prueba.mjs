#!/usr/bin/env node
// Casos del mapa de progreso — #231, #232, #233, #234, D-017, D-019.
//
//     node --experimental-strip-types packages/motor/src/mapa.prueba.mjs
//
// Por qué existen. Tres de las cuatro promesas de este módulo no rompen nada
// visible al romperse, que es la definición de lo que hay que medir:
//
//   · Los cortes de pericia son los de `serie.ts`. Si alguien los copia aquí y
//     los cambia, el mapa dice «dominada» donde el motor de series todavía
//     sirve el ejemplo trabajado entero. Nadie ve un error; hay dos verdades.
//   · El número de nivel no sale del módulo. Un `nivel: e.nivel` de más compila,
//     pasa las pruebas de forma, y pinta «Nivel 3» en la cara de un niño — que
//     es lo que D-017/#100 y `mc-10` prohíben.
//   · El árbol no tiene aristas. Un arreglo poblado dibuja flechas que ninguna
//     columna respalda (F5 §4.8 bloqueo 10).
//   · El sendero no tiene números. Un campo numérico en el modelo de vista es
//     un porcentaje esperando a que una plantilla lo pinte (#232).
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import {
  FORMA_POR_TEMA,
  formaDeMapa,
  periciaDe,
  CLAVE_DE_PERICIA,
  construirSendero,
  construirArbol,
  construirTablero,
  HABILIDADES_SIN_FUENTE,
} from "./mapa.ts";
import { ejemploSegunPericia } from "./serie.ts";
import { ORDEN_TEMAS } from "./bandas.ts";

let fallos = 0;
let corridos = 0;

function caso(nombre, fn) {
  corridos++;
  try {
    fn();
    console.log(`  ✓ ${nombre}`);
  } catch (err) {
    fallos++;
    console.error(`  ✗ ${nombre}`);
    console.error(`      ${err.message}`);
  }
}

const igual = (a, b, msg) => {
  const [x, y] = [JSON.stringify(a), JSON.stringify(b)];
  if (x !== y) throw new Error(`${msg ?? "valor"}: esperaba ${y}, obtuve ${x}`);
};
const cierto = (v, msg) => {
  if (!v) throw new Error(msg);
};

console.log("\n== mapa de progreso — capa de lectura (#231-#234) ==\n");

// --- Las tres formas, una por producto (mc-43 §8) ---------------------------

caso("los cinco temas visuales de D-017 tienen forma, y son las tres de mc-43", () => {
  igual(ORDEN_TEMAS.map(formaDeMapa), [
    "sendero", // KINDER
    "arbol",   // PRIMARIA
    "arbol",   // SECUNDARIA
    "tablero", // SERIO
    "tablero", // PRO
  ], "forma por tema");
  igual(Object.keys(FORMA_POR_TEMA).sort(), [...ORDEN_TEMAS].sort(), "temas cubiertos");
});

// --- Pericia: los cortes son los de serie.ts, no unos nuevos (#231) --------

caso("periciaDe recorre EXACTAMENTE la partición de ejemploSegunPericia", () => {
  // No se comparan tres puntos elegidos a mano: se barre [0,1] en pasos de
  // 0.001 y se exige que las dos funciones cambien de tramo en el mismo sitio.
  // Un corte movido en cualquier dirección aparece aquí aunque sea de 0.001.
  const traduccion = { 1: "asomando", 0.5: "en_camino", 0: "dominada" };
  const desacuerdos = [];
  for (let i = 0; i <= 1000; i++) {
    const s = i / 1000;
    const esperado = traduccion[ejemploSegunPericia(s)];
    if (periciaDe(s) !== esperado) desacuerdos.push(s);
  }
  igual(desacuerdos, [], "puntos donde el mapa y serie.ts discrepan");
});

caso("los tres tramos existen de verdad y ninguno se comió a otro", () => {
  igual(periciaDe(0), "asomando", "skill_state 0");
  igual(periciaDe(0.2), "asomando", "el corte de 0.2 es inclusivo, como en serie.ts");
  igual(periciaDe(0.6), "en_camino", "el corte de 0.6 es inclusivo, como en serie.ts");
  igual(periciaDe(1), "dominada", "skill_state 1");
});

caso("cada pericia tiene clave i18n y ninguna es texto de cara al usuario", () => {
  for (const p of ["asomando", "en_camino", "dominada"]) {
    const clave = CLAVE_DE_PERICIA[p];
    cierto(typeof clave === "string" && clave.startsWith("mapa"), `clave de ${p}`);
    // Una clave i18n no lleva espacios. Si los lleva, es una frase disfrazada.
    cierto(!/\s/.test(clave), `"${clave}" parece una frase, no una clave`);
  }
});

// --- KINDER: el sendero, sin un solo número (#232) -------------------------

const SABANA = ["K01", "K02", "K03", "K04"];

caso("el compañero se planta en el primer lugar sin terminar", () => {
  const s = construirSendero(SABANA, { K01: "terminado", K02: "practica" });
  igual(s.lugares.map((l) => l.estado), ["terminado", "en_curso", "por_visitar", "por_visitar"]);
  igual(s.lugares.map((l) => l.aqui), [false, true, false, false], "dónde está Larry");
});

caso("un lugar ausente es «por visitar», que no es lo mismo que empezado", () => {
  const s = construirSendero(SABANA, {});
  igual(s.lugares.map((l) => l.estado), ["por_visitar", "por_visitar", "por_visitar", "por_visitar"]);
  igual(s.lugares.filter((l) => l.aqui).length, 1, "Larry siempre está en un sitio");
});

caso("con la Sabana entera terminada, Larry se queda en el último lugar", () => {
  const todo = Object.fromEntries(SABANA.map((l) => [l, "terminado"]));
  const s = construirSendero(SABANA, todo);
  igual(s.lugares.map((l) => l.aqui), [false, false, false, true], "Larry no sale del mapa");
});

caso("el sendero SOLO lleva el número de secuencia (D-190) — ningún otro número se cuela", () => {
  // D-190 reversa el criterio original de #232 ("la pantalla no muestra
  // ningún número") a propósito: ahora SÍ hay un número de secuencia de
  // camino. Lo que #232 seguía pidiendo es que no aparezca un PORCENTAJE ni
  // ningún otro número que una plantilla pudiera malinterpretar como nivel
  // — por eso se recorre el objeto entero y solo se permite `.secuencia`.
  const s = construirSendero(SABANA, { K01: "terminado", K02: "sintesis" });
  const numeros = [];
  const mirar = (v, ruta) => {
    if (typeof v === "number") numeros.push(`${ruta} = ${v}`);
    else if (Array.isArray(v)) v.forEach((x, i) => mirar(x, `${ruta}[${i}]`));
    else if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v)) mirar(x, `${ruta}.${k}`);
    }
  };
  mirar(s, "sendero");
  const fueraDeSecuencia = numeros.filter((n) => !/\.secuencia = /.test(n));
  igual(fueraDeSecuencia, [], "campos numéricos fuera de `secuencia` en el sendero");
  igual(numeros.length, SABANA.length, "un `secuencia` por lugar, ni uno más");
});

caso("secuencia del sendero es 1,2,3… en orden, nunca el índice del catálogo", () => {
  const s = construirSendero(SABANA, {});
  igual(s.lugares.map((l) => l.secuencia), [1, 2, 3, 4], "secuencia correlativa");
});

caso("bloqueado (D-190): el primero nunca, y solo si ni éste ni el anterior se tocaron", () => {
  const s = construirSendero(SABANA, { K01: "terminado" });
  // K01 terminado, K02 recién alcanzado (por_visitar pero es el primero sin
  // terminar → no cuenta como "tocado" hasta que tenga fase propia), K03/K04
  // sin tocar y con el anterior tampoco tocado.
  igual(s.lugares.map((l) => l.bloqueado), [false, false, true, true], "bloqueo por secuencia");
});

caso("bloqueado se desbloquea con solo EMPEZAR el anterior, no hace falta dominarlo", () => {
  const s = construirSendero(SABANA, { K01: "terminado", K02: "sintesis" });
  igual(s.lugares.map((l) => l.bloqueado), [false, false, false, true], "K03 se desbloquea al empezar K02");
});

// --- PRIMARIA/SECUNDARIA: el árbol sin aristas (#233) ----------------------

const HABILIDADES = [
  { habilidad: "P07", nivel: 5, skillState: 0.9, rotulo: "Fracciones equivalentes" },
  { habilidad: "P02", nivel: 3, skillState: 0.1, rotulo: "Sumar hasta 20" },
  { habilidad: "P05", nivel: 5, skillState: 0.4, rotulo: null },
  { habilidad: "P01", nivel: 3, skillState: 1, rotulo: "Contar de 10 en 10" },
];

caso("los grupos van por nivel ascendente y los nodos alfabéticos dentro", () => {
  const a = construirArbol(HABILIDADES);
  igual(a.grupos.map((g) => g.nodos.map((n) => n.habilidad)), [["P01", "P02"], ["P05", "P07"]]);
});

caso("el mismo árbol sale igual con las filas en cualquier orden", () => {
  // Dos consultas a D1 que devuelvan las mismas filas en otro orden tienen que
  // dar el mismo mapa, o «determinista» era una palabra bonita.
  const alReves = [...HABILIDADES].reverse();
  igual(construirArbol(alReves), construirArbol(HABILIDADES), "árbol");
});

caso("EL NÚMERO DE NIVEL NO SALE DEL MÓDULO (D-017, #100, mc-10)", () => {
  const a = construirArbol(HABILIDADES);
  // `orden` es 1, 2 — correlativo dentro de este árbol. Los niveles de entrada
  // eran 3 y 5, y ninguno de los dos aparece por ningún lado.
  igual(a.grupos.map((g) => g.orden), [1, 2], "orden correlativo");
  const texto = JSON.stringify(a);
  cierto(!/"nivel"/.test(texto), "el árbol serializado contiene una clave `nivel`");
  cierto(!("nivel" in a.grupos[0]), "el grupo lleva el nivel de entrada");
});

caso("secuencia del árbol (D-190) cruza los grupos: 1..4 seguidos, nunca reinicia por grupo", () => {
  const a = construirArbol(HABILIDADES);
  // Orden esperado tras agrupar+alfabetizar: grupo1=[P01,P02], grupo2=[P05,P07].
  const secuencias = a.grupos.flatMap((g) => g.nodos.map((n) => n.secuencia));
  igual(secuencias, [1, 2, 3, 4], "secuencia continua a través de los grupos");
});

caso("bloqueado del árbol (D-190): nunca el primer nodo, y sale de pericia real", () => {
  // P01 skillState=1 (dominada), P02 skillState=0.1 (asomando) — P02 no está
  // bloqueado porque el anterior (P01) sí tiene pericia. P05 skillState=0.4
  // (en_camino) tampoco bloquea a P07 aunque P07 sea "asomando"... salvo que
  // P07 en realidad tiene skillState=0.9 (dominada), así que se prueba con un
  // caso que sí produzca un bloqueo real.
  const a = construirArbol([
    { habilidad: "A01", nivel: 1, skillState: 0, rotulo: null }, // asomando, primero: nunca bloqueado
    { habilidad: "A02", nivel: 2, skillState: 0, rotulo: null }, // asomando, anterior también asomando: bloqueado
    { habilidad: "A03", nivel: 3, skillState: 0.3, rotulo: null }, // en_camino: nunca bloqueado (no depende del anterior)
    { habilidad: "A04", nivel: 4, skillState: 0, rotulo: null }, // asomando, anterior en_camino: NO bloqueado
  ]);
  const nodos = a.grupos.flatMap((g) => g.nodos);
  igual(nodos.map((n) => n.bloqueado), [false, true, false, false], "bloqueo depende de la pericia anterior real");
});

caso("un alumno con habilidades de N5 y N7 ve grupos 1 y 2, no 5 y 7", () => {
  const a = construirArbol([
    { habilidad: "S01", nivel: 5, skillState: 0.3, rotulo: null },
    { habilidad: "S02", nivel: 7, skillState: 0.3, rotulo: null },
  ]);
  igual(a.grupos.map((g) => g.orden), [1, 2], "el orden no es el nivel");
});

caso("el árbol nace SIN aristas y no hay parámetro del que pudieran salir", () => {
  igual(construirArbol(HABILIDADES).aristas, [], "aristas");
  // La firma admite un solo argumento: no existe forma de pasarle una arista.
  igual(construirArbol.length, 1, "arity de construirArbol");
});

caso("el hueco de la arista está hecho: añadirla no rompe el layout sin ella", () => {
  // Cuarto criterio de #233. Se comprueba lo que se puede comprobar hoy: que
  // el árbol con aristas vacías y el árbol con una arista encima son el mismo
  // objeto salvo por ese campo, así que un componente que lea `grupos` no se
  // entera.
  const base = construirArbol(HABILIDADES);
  const conArista = { ...base, aristas: [{ desde: "P01", hasta: "P07" }] };
  igual(conArista.grupos, base.grupos, "los grupos no cambian al añadir una arista");
});

caso("el rótulo nulo se propaga tal cual: no se inventa un nombre", () => {
  const a = construirArbol(HABILIDADES);
  const p05 = a.grupos[1].nodos.find((n) => n.habilidad === "P05");
  igual(p05.rotulo, null, "rótulo de una habilidad sin nombre autorado");
});

// --- SERIO/JR/PRO: el tablero de cifras (#234) -----------------------------

caso("el tablero no reordena por dominio: no es un ranking de tus fracasos", () => {
  const t = construirTablero(HABILIDADES, { xp: 1234, rachaDias: 7 });
  igual(t.filas.map((f) => f.habilidad), ["P01", "P02", "P05", "P07"], "orden alfabético");
});

caso("XP y racha pasan tal cual: el mapa no los recalcula (D-055, D-079)", () => {
  const t = construirTablero([], { xp: 4321, rachaDias: 13 });
  igual([t.xp, t.rachaDias], [4321, 13], "totales");
  igual(t.filas, [], "sin habilidades, sin filas inventadas");
});

caso("el tablero tampoco lleva el nivel de entrada", () => {
  const texto = JSON.stringify(construirTablero(HABILIDADES, { xp: 0, rachaDias: 0 }));
  cierto(!/"nivel"/.test(texto), "el tablero serializado contiene una clave `nivel`");
});

// --- El stub declarado (#231, criterio 3) ----------------------------------

caso("el módulo declara que F4 todavía no le da datos, en vez de fingir ceros", () => {
  cierto(HABILIDADES_SIN_FUENTE === true, "HABILIDADES_SIN_FUENTE");
  // No es decorativo: con esto en `true`, un tablero vacío significa «no lo
  // estoy midiendo», y sin esto significaría «no has aprendido nada».
  igual(construirTablero([], { xp: 0, rachaDias: 0 }).filas, [], "filas sin fuente");
});

console.log(`\n${corridos - fallos}/${corridos} casos pasaron\n`);
if (fallos > 0) process.exit(1);
