#!/usr/bin/env node
// Auditor determinista — una función de puerta escrita y jamás invocada
//
// Hace cumplir: issue #311, D-012, D-038, D-052.
//
// ─── El bug que este auditor existe para no repetir ─────────────────────────
//
// `marcarDispositivoDelHogar()` vivía en `lib/sesiones.ts`. Estaba escrita, tenía
// sus casos en `sesiones.prueba.mjs`, y **no la llamaba nadie**. Ninguna página,
// ningún endpoint.
//
// La consecuencia no era un error. Era que la cookie `mc_h` no se podía poner
// nunca, así que `/app/kids/` rebotaba siempre a otra pantalla y **todo lo que
// F3, F4 y F5 construyeron era inalcanzable desde una cuenta real**: el motor
// adaptativo, el programador de repaso, los 344 ítems del banco. Desplegado,
// probado, verde, y sin ningún camino hasta un niño.
//
// Lo encontró el dueño entrando en su teléfono. No lo encontró ninguna prueba, y
// no podía: una prueba unitaria llama a la función: **es el único llamador que
// tiene, y eso es exactamente lo que la hace parecer viva.**
//
// ─── Qué comprueba ─────────────────────────────────────────────────────────
//
// Una lista corta y explícita de funciones que son PUERTAS — abren o cierran
// acceso — tiene que ser invocada desde código de producto que no sea su propia
// prueba. Si solo la llama su prueba, bloquea.
//
// La lista es a mano a propósito. Un detector genérico de «exportado y sin usar»
// marca cientos de utilidades legítimas y se apaga a la semana; estas cinco son
// las que, al no llamarse, dejan una puerta cerrada sin que nada falle.
//
// LO QUE NO PUEDE COMPROBAR: que el llamador esté en un camino ALCANZABLE. Una
// llamada dentro de una rama muerta pasa este auditor. Eso exige recorrer el
// grafo de rutas y no cabe en una expresión regular — lo que sí cabe es esta
// diferencia entre «existe» y «nadie la usa», que es donde estuvo el fallo.

import { archivos, leer, informar, SOLO_PRODUCTO } from "./lib/repo.mjs";

/**
 * Las puertas. Cada una con el porqué de estar en la lista, porque una lista de
 * nombres sin razón es una lista que alguien amplía sin pensar.
 */
//
// **`olvidarModelo` NO está en esta lista**, y la ausencia es deliberada. Hoy no
// tiene llamador porque **no existe ninguna ruta que borre un perfil**: su hueco
// no es que a un flujo le falte una llamada, es que el flujo entero está sin
// construir. Lo vigila `audits/borrado-alcanza-al-modelo.mjs`, que bloquea el
// día que alguien escriba esa ruta sin llamarla. Dos auditores diciendo lo
// mismo con distinta severidad es cómo se apaga uno de los dos.
const PUERTAS = [
  ["marcarDispositivoDelHogar", "sin ella `mc_h` no existe y ningún niño puede jugar (D-012)"],
  ["abrirSesionNino", "sin ella no hay sesión de niño y `/api/jugar` responde 401 siempre"],
  ["abrirSesionAdulto", "sin ella nadie queda autenticado tras registrarse o entrar"],
  ["cerrarSesionAdulto", "sin ella no se puede salir, y la sesión dura 30 días (D-052)"],

];

const problemas = [];
const notas = [];

// El producto sin sus pruebas: una función a la que solo llama su propia prueba
// es justo el caso que se busca.
const fuentes = archivos(/\.(ts|tsx|astro|js|mjs)$/).filter(
  (f) => SOLO_PRODUCTO.test(f) && !/\.prueba\.mjs$/.test(f) && !/\/audits\//.test(f),
);

const textos = new Map();
for (const f of fuentes) textos.set(f, leer(f) ?? "");

for (const [nombre, porQue] of PUERTAS) {
  // La declaración no cuenta como llamada. Se busca `nombre(` en archivos que
  // NO sean el que la exporta.
  const declara = /export\s+(async\s+)?function\s+/;
  const llamadores = [];
  let declarada = false;

  for (const [f, t] of textos) {
    const declaraAqui = new RegExp(declara.source + nombre + "\\b").test(t);
    if (declaraAqui) declarada = true;
    // Una llamada real: el nombre seguido de paréntesis, fuera de su declaración.
    const usos = t.match(new RegExp("\\b" + nombre + "\\s*\\(", "g"))?.length ?? 0;
    const propias = declaraAqui ? 1 : 0;
    if (usos - propias > 0) llamadores.push(f);
  }

  if (!declarada) {
    notas.push(`${nombre}: todavía no existe; el auditor la espera`);
    continue;
  }
  if (llamadores.length === 0) {
    problemas.push(
      `\`${nombre}()\` está escrita y NO la llama ningún archivo de producto. ` +
        `${porQue}. Una función con prueba y sin llamador no falla nada: deja una puerta ` +
        "cerrada, y el sistema entero sigue reportando verde (issue #311).",
    );
  } else {
    notas.push(`${nombre}: ${llamadores.length} llamador(es) — ${llamadores[0]}`);
  }
}

notas.push(
  "NO comprobado aquí: que el llamador esté en un camino ALCANZABLE. Una llamada dentro de una " +
    "rama muerta pasa este auditor; recorrer el grafo de rutas no cabe en una expresión regular.",
);

informar({
  nombre: "funcion-sin-llamar",
  problemas,
  notas,
  resumen: `${PUERTAS.length} puerta(s) vigiladas · ${fuentes.length} archivo(s) de producto`,
  cita: "issue #311, D-012, D-038, D-052",
  porQueBloquea:
    "Lo encontró el dueño entrando en su teléfono, no una prueba — y no podía encontrarlo una " +
    "prueba, porque la prueba ES el único llamador y eso es lo que hace parecer viva a la función.",
});
