#!/usr/bin/env node
// Auditor determinista — el alias del niño tiene índice único, y nadie lo quita
//
// Hace cumplir: D-003, issue #259.
//
// ─── Por qué existe ────────────────────────────────────────────────────────
//
// `perfil-nuevo.ts` capturaba `/UNIQUE/i` del error de D1 para reintentar con
// otro alias, y su comentario juraba que el índice existía «desde la migración
// 0003». Era falso: ninguna migración lo tenía, el catch era código muerto, y
// con ~1,080,000 combinaciones por locale la probabilidad de al menos un
// choque es del 37% con solo 1,000 niños en es-MX (cálculo re-ejecutable en
// el issue). El comentario falso es la clase exacta que D-052 señala como el
// motivo por el que «alguien construye la mitad equivocada dentro de un año».
//
// El índice llegó en la 0006 y la 0021 lo garantiza sobre datos deduplicados.
// Lo que este auditor vigila es que NO vuelva a pasar en silencio: recorre las
// migraciones EN ORDEN, como D1 las aplica, y exige que al final del recorrido
// exista un índice UNIQUE sobre `child_profiles` que cubra `alias`. Un
// `DROP INDEX` en una migración posterior —la forma exacta en que este bug
// reaparecería— bloquea aquí, no en producción.
//
// LO QUE NO PUEDE COMPROBAR: si la migración ya se aplicó al D1 remoto (ese
// estado vive en `d1_migrations`, no en el repo), ni si el catch de la ruta
// sigue probando `/UNIQUE/i` — eso lo ejecuta
// `apps/web/src/lib/alias-unico.prueba.mjs` contra `node:sqlite`.

import { archivos, leer, informar } from "./lib/repo.mjs";

const migraciones = archivos(/\.sql$/)
  .filter((f) => /^migrations\/\d{4}_/.test(f))
  .sort();

const problemas = [];
const notas = [];

if (migraciones.length === 0) {
  // Un auditor que no ve nada aprueba siempre. Falla cerrado.
  problemas.push(
    "no se encontró ninguna migración en migrations/. Sin ellas no hay forma " +
      "de saber si el índice único de alias existe — revisa que el patrón no se haya roto.",
  );
}

// Índices únicos vivos sobre child_profiles que cubren alias, en el orden en
// que D1 los aplicaría. Se rastrean por nombre para que un DROP posterior los
// apague: el esquema final es lo que cuenta, no lo que alguna vez se escribió.
const vivos = new Map(); // nombre → migración que lo creó

const CREADOR =
  /CREATE\s+UNIQUE\s+INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?["'`[]?(\w+)["'`\]]?\s+ON\s+["'`[]?child_profiles["'`\]]?\s*\(([^)]*)\)/gi;
const DESTRUCTOR = /DROP\s+INDEX\s+(?:IF\s+EXISTS\s+)?["'`[]?(\w+)["'`\]]?/gi;

for (const archivo of migraciones) {
  const texto = leer(archivo) ?? "";
  // En orden de aparición dentro del archivo: un CREATE seguido de su DROP en
  // la misma migración deja el índice apagado, y eso es lo que hay que ver.
  const eventos = [];
  for (const m of texto.matchAll(CREADOR)) eventos.push({ pos: m.index, tipo: "crear", nombre: m[1], columnas: m[2] });
  for (const m of texto.matchAll(DESTRUCTOR)) eventos.push({ pos: m.index, tipo: "borrar", nombre: m[1] });
  eventos.sort((a, b) => a.pos - b.pos);

  for (const ev of eventos) {
    if (ev.tipo === "crear") {
      const columnas = ev.columnas.split(",").map((c) => c.trim().replace(/["'`\]]/g, "").toLowerCase());
      if (columnas.includes("alias")) vivos.set(ev.nombre.toLowerCase(), archivo);
    } else {
      vivos.delete(ev.nombre.toLowerCase());
    }
  }
}

if (vivos.size === 0) {
  problemas.push(
    "ninguna migración deja VIVO un índice UNIQUE sobre child_profiles que cubra `alias`. " +
      "Sin él, el catch de `perfil-nuevo.ts` vuelve a ser código muerto y dos hijos del mismo " +
      "padre pueden quedar con el mismo alias (issue #259: 37% de al menos un choque con 1,000 " +
      "niños en es-MX). El índice es `idx_alias_por_padre`, UNIQUE (parent_user_id, alias) " +
      "WHERE deleted_at IS NULL — creado en la 0006, garantizado en la 0021.",
  );
} else {
  for (const [nombre, donde] of vivos) {
    notas.push(`índice único de alias vivo: ${nombre} (${donde})`);
  }
}

informar({
  nombre: "alias-unico",
  problemas,
  notas,
  cita: "D-003, issue #259",
  revisados: `${migraciones.length} migraciones`,
  resumen: "el alias del niño tiene índice único por padre, y nadie lo quita",
  porQueBloquea:
    "sin el índice, la base acepta alias repetidos y el reintento de la ruta es código muerto: " +
    "dos hijos del mismo padre acaban indistinguibles en su propia casa",
  noComprueba: [
    "si la migración ya corrió en el D1 remoto — eso vive en d1_migrations, no en el repo",
    "que la ruta siga probando /UNIQUE/i — lo ejecuta alias-unico.prueba.mjs",
  ],
});
