#!/usr/bin/env node
// Prueba focal del gate OwnerProof y sus insignias (F9 · #402).

import { assertCanOwnChildGroup, insigniaPara } from "./owner-proof.ts";

const igual = (actual, esperado, mensaje) => {
  if (actual !== esperado) {
    throw new Error(`${mensaje}: esperaba ${JSON.stringify(esperado)}, obtuve ${JSON.stringify(actual)}`);
  }
};

const caso = (nombre, funcion) => Promise.resolve().then(funcion).then(
  () => console.log(`  ✓ ${nombre}`),
  (error) => {
    console.error(`  ✗ ${nombre}`);
    throw error;
  },
);

console.log("\nowner-proof — gate y insignias de identidad del dueño (F9 · #402)\n");

await caso("sin fila devuelve null", () => {
  igual(assertCanOwnChildGroup(null), null, "fila ausente");
});

for (const [assurance, insignia] of [
  ["declared", "sin_verificar"],
  ["school_domain", "dominio_escolar"],
  ["human_reviewed", "revisado"],
  ["school_verified", "escuela_verificada"],
]) {
  await caso(`${assurance} fabrica proof e insignia`, () => {
    const proof = assertCanOwnChildGroup({
      user_id: "adulto-1",
      assurance,
      declared_context: "adulto responsable",
    });
    igual(proof?.userId, "adulto-1", "usuario del proof");
    igual(proof?.declaredContext, "adulto responsable", "contexto declarado");
    igual(insigniaPara(proof), insignia, "insignia");
  });
}

await caso("assurance desconocido se rechaza", () => {
  igual(assertCanOwnChildGroup({
    user_id: "adulto-1",
    assurance: "inventado",
    declared_context: null,
  }), null, "assurance inválido");
});

console.log("\n✓ 6 casos\n");
