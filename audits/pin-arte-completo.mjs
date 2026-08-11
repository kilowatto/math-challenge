#!/usr/bin/env node
// Auditor determinista — los 24 dibujos del PIN existen, todos
//
// Hace cumplir: D-201, D-012, mc-20.
//
// ─── Por qué existe ────────────────────────────────────────────────────────
//
// `CATALOGO` (`packages/motor/src/pin-imagenes.ts`) y los archivos de
// `public/juego/pin-dibujo-*.webp` son **dos listas que tienen que decir lo
// mismo**, y nada las ata: el motor baraja los 24 y elige nueve sin saber si
// hay arte detrás de cada uno.
//
// El fallo que esto caza es silencioso y grave a la vez. Si alguien añade un
// dibujo al catálogo del motor y no genera su imagen, la rejilla de algún niño
// —no de todos: la barajadura es por perfil— sale con **una casilla vacía**.
// Ese niño no puede entrar a su perfil, y el fallo no se reproduce en el
// dispositivo de quien lo introdujo. No hay pantalla de error que lo salve,
// porque para el sistema no es un error: es una textura que no cargó.
//
// Al revés también importa, aunque duela menos: un `.webp` que ya no está en
// el catálogo son bytes desplegados que nadie va a pedir nunca.
//
// ─── Lo que NO puede comprobar ─────────────────────────────────────────────
//
// Que el dibujo se PAREZCA a lo que dice su nombre. Un archivo llamado
// `pin-dibujo-luna.webp` que contenga una rueda de colores pasa este auditor
// sin pestañear — y pasó de verdad, cuatro rondas seguidas, mientras se
// generaba esta tanda. Eso es revisión humana (D-080), y por eso
// `gen-pin-dibujos.mjs` termina recordándolo por escrito.

import { existsSync } from "node:fs";
import { archivos, informar, RAIZ } from "./lib/repo.mjs";

const problemas = [];
const notas = [];

// El catálogo REAL, importado del motor — nunca una copia de los 24 nombres
// escrita aquí, que es justo la segunda lista que este auditor existe para
// impedir.
const mod = await import(`${RAIZ}packages/motor/src/pin-imagenes.ts`).catch(() => null);
if (!mod) {
  problemas.push("no pude importar pin-imagenes.ts: sin el catálogo esto no vigila nada");
}

const catalogo = mod?.CATALOGO ?? [];
if (mod && catalogo.length === 0) {
  problemas.push("CATALOGO vacío: un barrido sobre cero dibujos aprueba siempre");
}

// 1. Todo dibujo del catálogo tiene su archivo.
for (const id of catalogo) {
  const ruta = `apps/web/public/juego/pin-dibujo-${id}.webp`;
  if (!existsSync(`${RAIZ}${ruta}`)) {
    problemas.push(
      `falta ${ruta} — «${id}» está en CATALOGO y puede tocarle a la rejilla de cualquier niño. ` +
        "Sin el archivo, esa casilla sale vacía y ese niño no entra a su perfil (D-012). " +
        "Genera con: node scripts/gen-pin-dibujos.mjs --solo " + id,
    );
  }
}

// 2. Todo archivo corresponde a un dibujo del catálogo.
const enDisco = archivos(/^apps\/web\/public\/juego\/pin-dibujo-.*\.webp$/);
for (const ruta of enDisco) {
  const id = ruta.replace(/^.*pin-dibujo-/, "").replace(/\.webp$/, "");
  if (catalogo.length > 0 && !catalogo.includes(id)) {
    problemas.push(
      `${ruta} no corresponde a ningún dibujo de CATALOGO — o sobra, o alguien renombró el ` +
        "catálogo sin renombrar el arte. Bytes desplegados que nadie va a pedir.",
    );
  }
}

notas.push(`${catalogo.length} dibujo(s) en CATALOGO, ${enDisco.length} archivo(s) en public/juego`);

informar({
  nombre: "pin-arte-completo",
  problemas,
  notas,
  cita: "D-201, D-012, mc-20",
  // Se cuenta lo que de verdad se miró: los del catálogo MÁS los del disco.
  revisados: catalogo.length + enDisco.length,
  resumen: "los 24 dibujos del PIN existen y ninguno sobra",
  porQueBloquea:
    "la rejilla se baraja POR NIÑO, así que un dibujo sin arte deja una casilla vacía solo a " +
    "algunos perfiles — el niño afectado no puede entrar y el fallo no se reproduce en el " +
    "dispositivo de quien lo introdujo.",
  noComprueba: [
    "que el dibujo se parezca a su nombre — un `luna.webp` con una rueda de colores pasa esto sin pestañear; eso es revisión humana (D-080)",
    "que sea reconocible a 88 px, que es el tamaño real al que lo ve un niño de cuatro años",
  ],
});
