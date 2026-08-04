#!/usr/bin/env node
// Auditor determinista — un grupo infantil no tiene chat ni texto libre
//
// Hace cumplir: línea roja #3 ("ningún niño escribe texto libre, en ninguna
// superficie"), D-027, F9 §7, issues #380 y #385.
//
// Por qué existe. `child-free-text` vigila las tablas DONDE UN NIÑO ES EL
// SUJETO. Las tablas de grupo son otra cosa: ahí un ADULTO sin ser el padre
// convive con datos de niños, y el hueco ya no es solo «un niño escribe» sino
// «un adulto le escribe a un niño». Un `message TEXT` en
// `child_group_membership`, o un `<textarea>` en la pantalla del grupo, es un
// canal adulto→niño — y un canal así no se modera a nuestra escala, se
// elimina (mc-46 §4: Roblox tiene 1,600 moderadores y no le alcanza).
//
// Tres comprobaciones:
//
//   A. Ninguna tabla de grupo tiene una columna TEXT sin dominio acotado que
//      no esté en la lista blanca ESCRITA A MANO de abajo, con su razón.
//   B. El catálogo de `reason_code` es el mismo en tres sitios que no se
//      importan entre sí: la lista de abajo (escrita a mano), el CHECK de la
//      migración 0017 y `CODIGOS_DE_REPORTE` del motor. Si solo se compararan
//      migración y motor, un cambio las movería a las dos y nadie notaría —
//      la tercera lista, a mano, es la segunda fuente de D-070.
//   C. Ninguna superficie de grupo tiene dónde componer un mensaje:
//      `<textarea>`, `contenteditable` o un identificador de chat. Un
//      `<input type="text">` SÍ puede aparecer — el nombre de la escuela lo
//      escribe un adulto sobre su propia institución (D-086) y se muestra con
//      la insignia de qué tan comprobado está; prohibirlo prohibiría el
//      registro de escuelas, no el chat.
//
// LO QUE NO PUEDE COMPROBAR: que el texto autorado de un locale no invite a
// escribir. Eso es prosa, y lo revisa la carta adversarial `privacidad`.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { archivos, leer, informar, sinComentarios, SOLO_PRODUCTO } from "./lib/repo.mjs";

const MIGRATIONS = "migrations";

const TABLAS_DE_GRUPO = [
  "school",
  "school_teacher",
  "child_group",
  "child_group_membership",
  "child_group_report",
];

/**
 * Las columnas TEXT permitidas sin CHECK, con su razón. Todo lo demás que sea
 * TEXT en una tabla de grupo se reporta. Es la anulación por escrito de D-032:
 * añadir una columna aquí exige escribir por qué no es un canal.
 */
const PERMITIDAS = {
  id: "identificador",
  user_id: "referencia",
  owner_user_id: "referencia",
  school_id: "referencia",
  child_group_id: "referencia",
  child_profile_id: "referencia",
  reported_by: "referencia",
  reviewed_by: "referencia",
  verified_by: "users.id del revisor único (D-089) o 'auto' del atajo de dominio",
  decided_by: "users.id del padre que decidió — la membresía ES el consentimiento",
  name: "el nombre de la escuela lo escribe un ADULTO sobre su institución (D-086), jamás un niño, y se muestra junto a la insignia de assurance",
  country: "país de la escuela, declarado por el adulto que la registra",
};

/** El catálogo de motivos, REESCRITO AQUÍ A MANO — la segunda fuente (D-070). */
const MOTIVOS_A_MANO = [
  "IDENTIDAD_SOSPECHOSA",
  "CONTACTO_INDEBIDO",
  "CONTENIDO_INAPROPIADO",
  "TAMANIO_O_COMPOSICION_SOSPECHOSA",
  "OTRO",
];

const problemas = [];
const notas = [];
let revisados = 0;

// ─── A. El esquema ─────────────────────────────────────────────────────────
for (const file of readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort()) {
  const sql = readFileSync(join(MIGRATIONS, file), "utf8");
  for (const tabla of TABLAS_DE_GRUPO) {
    const creado = sql.match(new RegExp(`CREATE\\s+TABLE\\s+${tabla}\\s*\\(([\\s\\S]*?)\\n\\);`, "i"));
    if (!creado) continue;
    revisados++;
    // Una definición de columna puede ocupar varias líneas (el CHECK en la
    // línea siguiente). Se acumula hasta la coma que la cierra; juzgar línea
    // a línea marcaría como «libre» cualquier columna con CHECK multi-línea.
    let definicion = "";
    for (const rawLine of creado[1].split("\n")) {
      const line = rawLine.replace(/--.*$/, "").trim();
      if (!line) continue;
      definicion += (definicion ? " " : "") + line;
      if (!line.endsWith(",")) continue;
      const completa = definicion;
      definicion = "";
      if (/^(PRIMARY|FOREIGN|UNIQUE|CHECK|CONSTRAINT)\b/i.test(completa)) continue;
      const col = completa.match(/^([a-z_][a-z0-9_]*)\s+(TEXT|VARCHAR)/i);
      if (!col) continue;
      if (col[1] in PERMITIDAS) continue;
      if (/CHECK\s*\(/i.test(completa)) continue;
      problemas.push(
        `${file} · ${tabla}.${col[1]} es TEXT sin dominio acotado. En una tabla de grupo eso es un ` +
          "canal adulto↔niño en potencia (línea roja #3). Si el campo es legítimo, agrégalo a " +
          "PERMITIDAS en este auditor CON SU RAZÓN.",
      );
    }
  }
}

// ─── B. El catálogo de motivos, en tres sitios que no se importan ──────────
const migracion = leer("migrations/0017_grupos_infantiles.sql") ?? "";
const bloqueReason = migracion.match(/reason_code\s+TEXT\s+NOT\s+NULL\s+CHECK\s*\(reason_code\s+IN\s*\(([\s\S]*?)\)\)/i);
const enMigracion = bloqueReason
  ? [...bloqueReason[1].matchAll(/'([A-Z_]+)'/g)].map((m) => m[1]).sort()
  : [];

const { CODIGOS_DE_REPORTE } = await import("../packages/motor/src/grupo.ts");
const enMotor = [...CODIGOS_DE_REPORTE].sort();
const aMano = [...MOTIVOS_A_MANO].sort();
const misma = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

if (enMigracion.length === 0) {
  problemas.push("no se encontró el CHECK de reason_code en la migración 0017 — ¿cambiaron la tabla de forma?");
} else {
  if (!misma(enMigracion, aMano)) {
    problemas.push(
      `el CHECK de reason_code de la 0017 (${enMigracion.join(", ")}) no coincide con la lista ` +
        `escrita a mano en este auditor (${aMano.join(", ")}). El catálogo de motivos de reporte ` +
        "es CERRADO (issue #385): cambiarlo exige mover las tres listas a la vez, a propósito.",
    );
  }
  if (!misma(enMotor, aMano)) {
    problemas.push(
      `CODIGOS_DE_REPORTE del motor (${enMotor.join(", ")}) no coincide con la lista escrita a mano ` +
        `en este auditor (${aMano.join(", ")}). Motor y base son gemelos: uno sin el otro es un ` +
        "reporte que la base rechaza, o texto que la base acepta y la interfaz no conoce.",
    );
  }
}

// ─── C. Las superficies de grupo, sin dónde componer un mensaje ────────────
const superficies = archivos(/\.(astro|tsx|jsx|svelte|vue|ts)$/)
  .filter((f) => SOLO_PRODUCTO.test(f))
  .filter((f) => /grupo|salon|classroom/i.test(f));

for (const archivo of superficies) {
  revisados++;
  const texto = sinComentarios(leer(archivo) ?? "");
  const lineas = texto.split("\n");
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i];
    if (/<textarea\b/i.test(l)) {
      problemas.push(
        `${archivo}:${i + 1} · <textarea> en una superficie de grupo. Un grupo infantil no tiene ` +
          "chat ni mensaje directo en NINGUNA dirección (línea roja #3, D-027): un área de texto " +
          "aquí es un compositor de mensajes, no un campo de formulario.",
      );
    }
    if (/contenteditable/i.test(l)) {
      problemas.push(`${archivo}:${i + 1} · contenteditable en una superficie de grupo (línea roja #3)`);
    }
    if (/\b(chat|mensaje_?directo|direct_?message|bandeja)\b/i.test(l)) {
      problemas.push(
        `${archivo}:${i + 1} · identificador de mensajería en una superficie de grupo. No existe el ` +
          "componente: un grupo infantil se comunica por el padre, nunca dentro del producto.",
      );
    }
  }
}
if (superficies.length === 0) {
  notas.push("todavía no hay superficies de grupo; la parte de interfaz está lista para la primera (issues #382-#386)");
}

informar({
  nombre: "grupo-sin-chat",
  problemas,
  notas,
  revisados,
  resumen: `${TABLAS_DE_GRUPO.length} tabla(s) de grupo sin texto libre · catálogo de motivos gemelo en migración, motor y lista a mano · ${superficies.length} superficie(s) de grupo sin dónde componer mensajes`,
  cita: "línea roja #3, D-027, mc-46 §4, issues #380/#385",
  porQueBloquea:
    "Roblox invierte en 1,600 moderadores y el contenido inapropiado reaparece (mc-46 §4). A nuestra " +
    "escala la única garantía es que el canal no exista: ni columna libre, ni compositor, ni componente.",
});
