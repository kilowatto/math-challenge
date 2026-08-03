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

import { archivos, leer, informar, sinComentarios, SOLO_PRODUCTO } from "./lib/repo.mjs";

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

  // ─── Los tres motores de F7, añadidos el 2026-08-02 ───────────────────────
  //
  // El mismo bug de #311, otra vez y en otro subsistema. `racha.ts` y `xp.ts`
  // se escribieron completos, con sus pruebas, sus dos migraciones y CUATRO
  // auditores vigilándolos —`racha-nunca-se-vende`, `racha-limite-no-rompe`,
  // `racha-lexico`, `motor-xp`—, y **ninguno de ellos podía ver que no los
  // llamaba nadie**: los cuatro miran el motor, y el motor estaba perfecto.
  //
  // Un jugador podía contestar mil ítems sin que su racha existiera. No hay
  // error, no hay pantalla rota, no hay auditor rojo: hay una tabla vacía. Es
  // exactamente el modo de falla que este archivo existe para cazar, así que
  // las tres entran a la lista en vez de confiar en que se note.
  ["registrarDia", "sin ella ningún día se cuenta jamás y `child_streak` se queda vacía (#201, D-014)"],
  ["ganarEscudos", "sin ella la red de protección de la racha no se otorga nunca (#203, D-079)"],
  ["xpDeItem", "sin ella `xp_totals` no se mueve y el Rango no avanza para nadie (#192, D-055)"],

  // ─── El cable de F7 · Misiones diarias, añadido el 2026-08-03 ────────────
  //
  // La misma enfermedad una tercera vez: `misiones.ts` estaba escrito, probado
  // y con cuatro auditores — y ninguno podía ver que no lo llamaba nadie, igual
  // que le pasó a la racha hasta `progreso.ts`. Las dos entradas de la
  // superficie: la que alimenta el motor en cada ítem y la que lee el día para
  // pintarlo. Sin la primera `mission_daily_summary` se queda vacía para
  // siempre; sin la segunda el menú y el resumen no existen para nadie.
  ["registrarAvanceDeHoy", "sin ella ninguna misión avanza jamás y `mission_daily_summary` se queda vacía (#211)"],
  ["leerMisionesDeHoy", "sin ella el menú y el resumen del día no se pintan en ninguna superficie (#211)"],
];

const problemas = [];
const notas = [];

// El producto sin sus pruebas: una función a la que solo llama su propia prueba
// es justo el caso que se busca.
const fuentes = archivos(/\.(ts|tsx|astro|js|mjs)$/).filter(
  (f) => SOLO_PRODUCTO.test(f) && !/\.prueba\.mjs$/.test(f) && !/\/audits\//.test(f),
);

/*
 * Sin comentarios, y esto lo arregla una omisión que hacía fallar ABIERTO al
 * auditor entero.
 *
 * `racha.ts` documenta su propia firma con la frase «`registrarDia(estado, dia)`
 * —sin el tercer argumento— seguiría compilando». Eso es un `registrarDia(` más
 * en el archivo que la declara, así que la cuenta `usos − propias` daba 1 y el
 * MOTOR se contaba a sí mismo como su llamador. Con esa línea presente,
 * `registrarDia` podía quedarse sin un solo llamador de verdad —que es
 * exactamente el bug de #311 que este archivo existe para cazar— y el auditor
 * salía en verde.
 *
 * Se descubrió escribiendo el control negativo, no leyendo el código: el caso
 * degradaba `lib/progreso.ts` quitándole la llamada, y el auditor no bloqueó.
 */
const textos = new Map();
for (const f of fuentes) textos.set(f, sinComentarios(leer(f) ?? ""));

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
