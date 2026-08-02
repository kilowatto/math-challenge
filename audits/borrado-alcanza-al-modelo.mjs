#!/usr/bin/env node
// Auditor determinista — borrar el perfil borra también el modelo del niño
//
// Hace cumplir: F4 criterio #104, D-030, D-043, `mc-32` riesgo #8, GDPR art. 17
// y COPPA § 312.6 (derecho de borrado del padre).
//
// ─── Por qué existe, y por qué es un auditor y no una prueba ───────────────
//
// El estado adaptativo de un niño vive en `math-challenge-learner-do`, un
// Durable Object por niño. Borrarlo es una línea: `deleteAll()` sobre su
// almacenamiento, envuelto en `olvidarModelo()`.
//
// **Ese borrado hoy no lo llama nadie, porque todavía no existe ninguna ruta
// que borre un perfil.** Ese es exactamente el problema que este auditor
// resuelve: el día que alguien escriba esa ruta, la escribirá pensando en D1
// —que es donde está la fila que se ve— y el Durable Object se quedará ahí, con
// las estimaciones de un niño cuyo perfil el padre pidió borrar, en un objeto
// que ya nadie puede encontrar porque la llave que lo abría era el
// `child_profile_id` que se acaba de borrar.
//
// No es un fallo que produzca un error. Es un fallo que produce un silencio.
//
// ─── Qué comprueba ─────────────────────────────────────────────────────────
//
// Si un archivo de producto borra un perfil de niño —`DELETE FROM child_profiles`
// o una escritura de `deleted_at` sobre esa tabla— tiene que llamar también a
// `olvidarModelo`. Si no lo hace, bloquea.
//
// ─── El orden, que también importa y aquí solo se avisa ────────────────────
//
// Primero el Durable Object, después la fila de D1. Al revés, si el DO falla ya
// no existe la llave para reintentarlo. Comprobar el ORDEN exige entender el
// flujo de control y eso no cabe en una expresión regular: se avisa en la nota y
// se comprueba leyendo, que es honesto decirlo.
//
// LO QUE NO PUEDE COMPROBAR: que `olvidarModelo` haya devuelto `true`. Llamarla
// e ignorar el resultado pasa este auditor y deja el mismo agujero. Por eso esa
// función devuelve `boolean` y su encabezado dice, con esas palabras, que quien
// la llame tiene que tratar el `false` como un fallo del borrado.

import { archivos, leer, informar, SOLO_PRODUCTO, sinComentarios } from "./lib/repo.mjs";

const BORRA_PERFIL =
  /(DELETE\s+FROM\s+child_profiles|UPDATE\s+child_profiles\s+SET\s+deleted_at)/i;
const OLVIDA_MODELO = /olvidarModelo\s*\(/;

const problemas = [];
const notas = [];

const fuentes = archivos(/\.(ts|tsx|js|mjs|astro)$/).filter((f) => SOLO_PRODUCTO.test(f));
const borradores = [];

for (const archivo of fuentes) {
  const texto = sinComentarios(leer(archivo) ?? "");
  if (!BORRA_PERFIL.test(texto)) continue;
  borradores.push(archivo);

  if (!OLVIDA_MODELO.test(texto)) {
    problemas.push(
      `${archivo}: borra un perfil de niño y NO llama a \`olvidarModelo()\`. El estado adaptativo ` +
        "vive en `math-challenge-learner-do`, un objeto por niño, y sobrevive al borrado de la " +
        "fila de D1. Peor: el `child_profile_id` que abría ese objeto acaba de desaparecer, así " +
        "que después ya nadie puede encontrarlo. Primero el DO, después la fila (F4 #104).",
    );
  }
}

notas.push(
  borradores.length === 0
    ? "todavía no hay ninguna ruta que borre un perfil de niño — el auditor espera a la primera, " +
        "que es justo cuando este error se comete"
    : `${borradores.length} ruta(s) que borran un perfil, todas llamando a olvidarModelo()`,
);
notas.push(
  "NO comprobado aquí: el ORDEN (primero el DO, después D1) ni que se mire el `false` que " +
    "devuelve `olvidarModelo`. Llamarla e ignorar el resultado pasa este auditor y deja el mismo " +
    "agujero — por eso devuelve `boolean` y su encabezado dice qué hacer con él.",
);

informar({
  nombre: "borrado-alcanza-al-modelo",
  problemas,
  notas,
  resumen: `${fuentes.length} archivo(s) de producto · ${borradores.length} borran perfiles`,
  cita: "F4 #104, D-030, D-043, mc-32 riesgo #8, GDPR art. 17, COPPA §312.6",
  porQueBloquea:
    "Un borrado que deja vivo el modelo del niño no falla: confirma. El padre ve el perfil " +
    "desaparecer y las estimaciones siguen ahí, en un objeto que ya nadie sabe abrir.",
});
