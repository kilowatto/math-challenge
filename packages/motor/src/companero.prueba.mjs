#!/usr/bin/env node
// Casos del compañero — D-080, #235, #234, #257, mc-43 §6.
//
//     node --experimental-strip-types packages/motor/src/companero.prueba.mjs
//
// Por qué existen. Lo que este módulo promete es una AUSENCIA, y una ausencia
// no se ve al leer el código: se ve cuando alguien la llena.
//
//   · «Sin estado de vida, sin hambre, sin decaimiento» (D-080). El caso que lo
//     mide no comprueba que no haya un campo llamado `hambre` — comprueba que
//     el estado tiene exactamente dos claves, así que CUALQUIER tercera lo
//     rompe, se llame como se llame.
//   · «El tiempo no puede entrar». Se mide por la aridad de las funciones: si
//     ninguna acepta un instante, ninguna puede decaer. Un `Date.now()` interno
//     lo caza el auditor; un parámetro nuevo lo caza esto.
//   · «Apagado por defecto en SERIO/JR/PRO» (#234). Es un `false` en una tabla:
//     invertirlo no rompe nada, solo pone un rinoceronte delante de un adulto.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import {
  PRESENCIA_POR_TEMA,
  VISIBLE_AL_CREAR,
  estadoInicial,
  ponerVisible,
  equipar,
  apareceSolo,
  ASUNTOS_FUERA_DE_LARRY,
  COLUMNAS_COMPANION_STATE,
  SQL_UPSERT_COMPANERO,
} from "./companero.ts";
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

console.log("\n== el compañero — Larry con accesorios (D-080, #235) ==\n");

// --- Sin decaimiento, POR CONSTRUCCIÓN (mc-43 §6) --------------------------

caso("el estado tiene EXACTAMENTE dos claves — cualquier tercera rompe esto", () => {
  // Deliberadamente no busca «hambre» ni «felicidad»: un medidor se llamaría
  // `mood`, `bond`, `energy` o `carino` y pasaría un grep de palabras. Lo que
  // no pasa es el conteo.
  for (const tema of ORDEN_TEMAS) {
    igual(Object.keys(estadoInicial(tema)).sort(), ["accesorios", "visible"], `estado de ${tema}`);
  }
});

caso("ninguna función del módulo acepta un instante: el tiempo no tiene por dónde entrar", () => {
  // Tamagotchi necesitaba UNA cosa para funcionar: saber cuánto tiempo pasó.
  // Si ninguna firma lo recibe, no hay decaimiento posible aunque alguien lo
  // quiera — tendría que cambiar la firma, y eso se ve en un diff.
  igual(estadoInicial.length, 1, "estadoInicial(tema)");
  igual(ponerVisible.length, 2, "ponerVisible(estado, visible)");
  igual(equipar.length, 3, "equipar(estado, pedidos, desbloqueados)");
  igual(apareceSolo.length, 1, "apareceSolo(tema)");
});

caso("aplicar la misma operación mil veces no mueve nada: no hay erosión", () => {
  // Si existiera un decaimiento escondido —un contador, una probabilidad— mil
  // pasadas lo destaparían. Es la misma idea que ejecutar el evaluador de
  // cosméticos 32 veces con la entrada barajada.
  let e = estadoInicial("KINDER");
  const inicial = JSON.stringify(e);
  for (let i = 0; i < 1000; i++) e = ponerVisible(e, true);
  igual(JSON.parse(JSON.stringify(e)), JSON.parse(inicial), "estado tras mil pasadas");
});

caso("`ponerVisible` con el mismo valor devuelve el MISMO objeto (idempotente)", () => {
  const e = estadoInicial("PRIMARIA");
  cierto(ponerVisible(e, true) === e, "un doble toque no debería crear estado nuevo");
});

// --- Presencia por banda (mc-43 §9, D-080) ---------------------------------

caso("las tres presencias de D-080, una por forma de mapa", () => {
  igual(ORDEN_TEMAS.map((t) => PRESENCIA_POR_TEMA[t]), [
    "camina",        // KINDER — es el mapa
    "en_cada_nodo",  // PRIMARIA
    "en_cada_nodo",  // SECUNDARIA
    "bajo_peticion", // SERIO
    "bajo_peticion", // PRO
  ], "presencia por tema");
});

caso("apareceSolo es falso exactamente donde la presencia es bajo petición", () => {
  igual(ORDEN_TEMAS.map(apareceSolo), [true, true, true, false, false], "aparece solo");
});

// --- Apagado por defecto en SERIO/JR/PRO (#234, mc-43 §8, mc-23) -----------

caso("SERIO y PRO nacen con el compañero APAGADO; las tres bandas de niño, no", () => {
  igual(ORDEN_TEMAS.map((t) => VISIBLE_AL_CREAR[t]), [true, true, true, false, false]);
  igual(estadoInicial("SERIO").visible, false, "SERIO");
  igual(estadoInicial("PRO").visible, false, "PRO");
  igual(estadoInicial("KINDER").visible, true, "KINDER — Larry ES el mapa aquí");
});

caso("el adulto lo enciende él mismo, sin pasar por nadie (criterio 2 de #234)", () => {
  const e = ponerVisible(estadoInicial("SERIO"), true);
  igual(e.visible, true, "encendido");
  igual(ponerVisible(e, false).visible, false, "y se puede volver a apagar");
});

caso("nadie nace con accesorios regalados (mc-17 §2: informativas, no controladoras)", () => {
  for (const tema of ORDEN_TEMAS) igual(estadoInicial(tema).accesorios, [], `accesorios de ${tema}`);
});

// --- Equipar: determinista y solo lo ganado (línea roja #5) ----------------

caso("equipar descarta lo que no está desbloqueado, y no lanza por ello", () => {
  const e = estadoInicial("KINDER");
  igual(equipar(e, ["sombrero", "capa"], ["sombrero"]).accesorios, ["sombrero"]);
});

caso("el mismo Larry sale igual con la lista en cualquier orden", () => {
  const e = estadoInicial("KINDER");
  const desbloqueados = ["capa", "gafas", "sombrero"];
  const a = equipar(e, ["sombrero", "capa", "gafas"], desbloqueados);
  const b = equipar(e, ["gafas", "sombrero", "capa"], [...desbloqueados].reverse());
  igual(a, b, "accesorios equipados");
  igual(a.accesorios, ["capa", "gafas", "sombrero"], "y van ordenados");
});

caso("un accesorio pedido dos veces se pone una vez", () => {
  const e = estadoInicial("KINDER");
  igual(equipar(e, ["capa", "capa"], ["capa"]).accesorios, ["capa"]);
});

caso("equipar no toca la visibilidad", () => {
  const e = estadoInicial("SERIO");
  igual(equipar(e, ["capa"], ["capa"]).visible, false, "sigue apagado");
});

// --- #257: la frontera con el tutor ----------------------------------------

caso("el módulo no exporta un solo texto de cara al usuario: no puede hablar", () => {
  // `ASUNTOS_FUERA_DE_LARRY` son asuntos en minúscula sin espacios, es decir
  // etiquetas para el auditor — no frases. Si alguna llevara espacio o
  // mayúscula inicial, sería copy colándose en un módulo que no habla.
  for (const a of ASUNTOS_FUERA_DE_LARRY) {
    cierto(!/\s/.test(a) && a === a.toLowerCase(), `"${a}" parece una frase, no un asunto`);
  }
  cierto(ASUNTOS_FUERA_DE_LARRY.includes("accesorio"), "el accesorio propio tiene que estar");
  cierto(ASUNTOS_FUERA_DE_LARRY.includes("avatar"), "mc-43 implicación 10");
});

// --- El esquema y el código, dos fuentes que tienen que coincidir ----------

caso("las columnas declaradas son cinco, y ninguna es un medidor", () => {
  igual([...COLUMNAS_COMPANION_STATE], ["id", "child_profile_id", "user_id", "visible", "accessory_ids"]);
});

caso("el upsert solo escribe las dos columnas que la persona decide", () => {
  cierto(/visible\s*=\s*excluded\.visible/.test(SQL_UPSERT_COMPANERO), "visible");
  cierto(/accessory_ids\s*=\s*excluded\.accessory_ids/.test(SQL_UPSERT_COMPANERO), "accessory_ids");
  cierto(!/DELETE|DROP/i.test(SQL_UPSERT_COMPANERO), "el upsert no borra nada");
});

console.log(`\n${corridos - fallos}/${corridos} casos pasaron\n`);
if (fallos > 0) process.exit(1);
