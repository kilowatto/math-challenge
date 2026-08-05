#!/usr/bin/env node
// Auditor determinista — el mapa LEE. No escribe, no guarda, no tiene tabla.
//
// Hace cumplir: #231, D-017, D-019, F5 §4.8 bloqueo 10.
//
// ─── Por qué existe ───────────────────────────────────────────────────────
//
// El criterio de #231 es literal: *«El código del mapa no escribe ningún campo
// de "progreso por habilidad" en una tabla propia de F7 — solo lee de F4/F3»*.
//
// La forma en que esto se rompe no es con mala intención. Es con una consulta
// lenta. Alguien mide que componer el mapa cuesta cuatro lecturas, decide
// «cachearlo» en una tabla, y el día siguiente hay dos verdades sobre lo que un
// niño sabe. Dos fuentes de verdad no divergen con un error rojo: divergen en
// silencio, y el síntoma llega meses después como un padre que ve «dominado» en
// el mapa mientras su hijo falla la misma habilidad en el reto.
//
// Este auditor no puede impedir que alguien decida cachear. Puede hacer que
// tenga que borrar estas líneas y explicarlo en un commit, que es exactamente
// el trámite que una decisión así necesita.
//
// ─── Cómo comprueba, y por qué de dos formas (D-070) ──────────────────────
//
//   · ESTÁTICO — `mapa.ts` no puede contener SQL, ni recibir un `env`/`DB`, ni
//     importar nada de `apps/`. Y ninguna migración puede declarar una tabla de
//     progreso por habilidad que no sea la de F4.
//   · DINÁMICO — **ejecuta** el módulo y comprueba que los cortes de pericia
//     coinciden con `ejemploSegunPericia()` de `serie.ts` en los 1001 puntos de
//     [0,1]. Es el otro criterio de #231 («los mismos cortes, no redefinidos»),
//     y es el que un grep no puede ver: copiar `0.2` y `0.6` a mano pasa
//     cualquier revisión y se descubre el día que alguien mueva el corte en
//     `serie.ts` y el mapa se quede donde estaba.
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Si F4 llega a existir y expone el método que `CONTRATO_ASUMIDO_F4`
//    declara. Mientras F4 no tenga código, eso no es comprobable por nadie.
//  · Si la página que pinta el mapa hace su propia consulta de escritura por
//    otra vía —un endpoint, un Durable Object—. Vigila el módulo y el esquema,
//    que es donde una tabla tiene que aparecer para existir.

import { archivos, leer, informar, sinComentarios, sqlSinComentarios } from "./lib/repo.mjs";
import { periciaDe } from "../packages/motor/src/mapa.ts";
import { ejemploSegunPericia } from "../packages/motor/src/serie.ts";

const MODULO = "packages/motor/src/mapa.ts";

const problemas = [];
const notas = [];
let revisados = 0;
const PAGINA_NINO = "apps/web/src/pages/[locale]/app/kids/mapa.astro";

// F9 #399: la única mención social del niño es una lectura aprobada y neutra.
const paginaNino = sinComentarios(leer(PAGINA_NINO) ?? "");
const leeMembresiasAprobadas =
  /status\s*=\s*'approved'/.test(paginaNino) ||
  (/status\s*=\s*\?/.test(paginaNino) && /\.bind\([\s\S]*?["']approved["']/.test(paginaNino));
if (!paginaNino.includes("child_group_membership") || !leeMembresiasAprobadas) {
  problemas.push(`${PAGINA_NINO}: la mención de grupo no lee solo membresías aprobadas.`);
}
if (!paginaNino.includes("f9Habilitado") || !paginaNino.includes("CONFIG_KV")) {
  problemas.push(`${PAGINA_NINO}: la mención de grupo no está protegida por la bandera F9 del locale.`);
}
for (const campo of ["points", "puntos", "position", "posicion", "leaderboard", "current_streak", "full_name", "owner_user_id"]) {
  if (new RegExp(`\\b${campo}\\b`, "i").test(paginaNino)) {
    problemas.push(`${PAGINA_NINO}: menciona ${campo}, prohibido en la mención neutra de #399.`);
  }
}
if (/WebSocket|websocket|sumarEnSalon|tabla/i.test(paginaNino)) {
  problemas.push(`${PAGINA_NINO}: la superficie del niño no puede abrir standings ni WebSocket.`);
}
revisados++;

// ─── 1. El módulo del mapa no escribe ─────────────────────────────────────

const crudo = leer(MODULO);
if (crudo === null) {
  problemas.push(`${MODULO} no existe. El mapa de F7 vive ahí (#231).`);
} else {
  revisados++;
  const texto = sinComentarios(crudo);

  const ESCRITURA = [
    [/CREATE\s+TABLE/i, "un CREATE TABLE"],
    [/INSERT\s+INTO/i, "un INSERT"],
    [/\bUPDATE\s+\w+\s+SET\b/i, "un UPDATE"],
    [/\bDELETE\s+FROM\b/i, "un DELETE"],
    [/ALTER\s+TABLE/i, "un ALTER TABLE"],
  ];
  for (const [re, que] of ESCRITURA) {
    if (re.test(texto)) {
      problemas.push(
        `${MODULO} contiene ${que}. El mapa es una CAPA DE LECTURA (#231): no tiene tabla ` +
          "propia y no escribe progreso en ninguna parte. Dos copias del progreso de un niño " +
          "divergen en silencio.",
      );
    }
  }

  // Sin `env`, sin binding, sin D1: si no puede alcanzar la base, no puede
  // escribir en ella aunque alguien pegue el SQL en otro archivo.
  if (/\b(env\.DB|D1Database|\.prepare\s*\(|\.batch\s*\()/.test(texto)) {
    problemas.push(
      `${MODULO} toca la base directamente. Es un módulo PURO: recibe el estado ya leído por ` +
        "quien lo posee (F4/F3/XP/racha) y devuelve la forma que hay que pintar.",
    );
  }

  // `packages/` no puede depender de `apps/` — y aquí además significaría que
  // el motor está alcanzando una ruta de escritura.
  if (/from\s+["'][^"']*\/apps\//.test(texto)) {
    problemas.push(`${MODULO} importa de apps/. El motor no depende de la aplicación.`);
  }

  // Los cortes, escritos a mano. El criterio de #231 pide reuso literal.
  if (/\b0\.2\b|\b0\.6\b/.test(texto)) {
    problemas.push(
      `${MODULO} contiene el literal 0.2 o 0.6. Los cortes de pericia son los de ` +
        "`ejemploSegunPericia()` en serie.ts y se reusan LLAMÁNDOLA (#231), no copiándolos: " +
        "una copia no se entera el día que el original se mueva.",
    );
  }
  if (!/from\s+["']\.\/serie\.ts["']/.test(texto)) {
    problemas.push(
      `${MODULO} no importa serie.ts. Los cortes de pericia tienen que salir de ` +
        "`ejemploSegunPericia()`, que es donde ya viven (#231).",
    );
  }
}

// ─── 2. Ninguna migración declara una tabla de progreso del mapa ──────────
//
// `skill_state` es de F4 y es la única fuente. Lo que se busca es una SEGUNDA
// tabla que guarde progreso por habilidad — el «caché» del mapa.

const SOSPECHOSAS = /\b(map_progress|mapa_progreso|map_state|progress_map|skill_progress|map_skill_state)\b/i;

for (const f of archivos(/^migrations\/.*\.sql$/)) {
  revisados++;
  const sql = sqlSinComentarios(leer(f) ?? "");
  const creaciones = [...sql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?/gi)];
  for (const [, tabla] of creaciones) {
    if (SOSPECHOSAS.test(tabla)) {
      problemas.push(
        `${f} declara la tabla \`${tabla}\`. El mapa no tiene tabla propia (#231): compone ` +
          "`skill_state` (F4), `EstadoHistoria` (F3), `xp_totals` y `child_streak`. Si de " +
          "verdad hace falta una, el PR tiene que decir por qué y qué pasa cuando las dos " +
          "copias del progreso no coincidan.",
      );
    }
  }
}

// ─── 3. DINÁMICO — los cortes coinciden con serie.ts en TODO [0,1] ────────

const TRADUCCION = { 1: "asomando", 0.5: "en_camino", 0: "dominada" };
const desacuerdos = [];
for (let i = 0; i <= 1000; i++) {
  const s = i / 1000;
  if (periciaDe(s) !== TRADUCCION[ejemploSegunPericia(s)]) desacuerdos.push(s);
}
if (desacuerdos.length > 0) {
  problemas.push(
    `los cortes de pericia del mapa y los de serie.ts discrepan en ${desacuerdos.length} de 1001 ` +
      `puntos de [0,1] (el primero, skill_state = ${desacuerdos[0]}). El criterio de #231 pide ` +
      "que sean LOS MISMOS: con dos particiones, el mapa dice «dominada» donde el motor de " +
      "series todavía sirve el ejemplo trabajado entero.",
  );
} else {
  notas.push("1001 puntos de [0,1]: el mapa y `serie.ts` parten la pericia en el mismo sitio");
}

notas.push("contrato asumido de F4: `estadoDeHabilidades(perfilId) → EntradaDeHabilidad[]` — sin código todavía");

informar({
  nombre: "mapa-lectura-sin-tabla",
  problemas,
  notas,
  cita: "#231, D-017, D-019, F5 §4.8 bloqueo 10",
  revisados,
  resumen: `${revisados} archivo(s) de motor y esquema, más 1001 puntos ejecutados`,
  porQueBloquea:
    "una segunda copia del progreso de un niño no diverge con un error: diverge en silencio, y " +
    "el síntoma llega meses después como un padre que ve «dominado» en el mapa mientras su hijo " +
    "falla la misma habilidad en el reto.",
  noComprueba: [
    "si F4 llega a exponer el método que el mapa asume — F4 no tiene código todavía, y eso no " +
      "es comprobable por nadie.",
    "si una página pinta el mapa consultando por su cuenta. Vigila el módulo y el esquema, que " +
      "es donde una tabla tiene que aparecer para existir.",
  ],
});
