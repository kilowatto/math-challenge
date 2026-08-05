#!/usr/bin/env node
// Prueba focal del cable de cierre de reto hacia grupos (F9 · #400).

import { sumarPuntosEnGrupos } from "./liga-membresia.ts";

const igual = (actual, esperado, mensaje) => {
  if (actual !== esperado) throw new Error(`${mensaje}: esperaba ${esperado}, obtuve ${actual}`);
};
const afirma = (condicion, mensaje) => {
  if (!condicion) throw new Error(mensaje);
};

const llamadas = [];
const namespace = {
  idFromName(id) {
    return id;
  },
  get(id) {
    return {
      async fetch(url, opciones = {}) {
        llamadas.push({ id, url, opciones });
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      },
    };
  },
};

const db = {
  prepare() {
    return {
      bind() {
        return this;
      },
      async all() {
        return {
          results: [
            {
              membership_id: "visible",
              child_group_id: "grupo-1",
              leaderboard_opt_in: 1,
              alias: "Zorro Azul",
              avatar_parts: "{}",
              theme_band: "KINDER",
              joined_at: 10,
            },
            {
              membership_id: "oculto",
              child_group_id: "grupo-2",
              leaderboard_opt_in: 0,
              alias: "No debe viajar",
              avatar_parts: "{}",
              theme_band: "KINDER",
              joined_at: 11,
            },
          ],
        };
      },
    };
  },
};

await sumarPuntosEnGrupos(
  { DB: db, CLASSROOM_DO: namespace },
  { id: "child-1", esAdulto: false },
  { puntos: 7, racha: 2, ahora: 100 },
);

igual(llamadas.length, 3, "llamadas al grupo");
const alta = llamadas.find((llamada) => llamada.url === "https://salon/unir");
const suma = llamadas.find((llamada) => llamada.url === "https://salon/sumar");
const baja = llamadas.find((llamada) => llamada.url === "https://salon/olvidar?membership_id=oculto");
afirma(alta && suma && baja, "se ejecutan alta, suma y baja");
const cuerpo = JSON.parse(alta.opciones.body);
igual(cuerpo.membership_id, "visible", "membresía enviada");
igual(cuerpo.opt_in, 1, "solo opt-in enviado");
afirma(!JSON.stringify(llamadas).includes("No debe viajar"), "el alias opt-out no viaja al DO");

console.log("\n✓ classroom-cable — 1 caso\n");
