#!/usr/bin/env node
// Auditor determinista — `school_verified` solo lo escribe la verificación
//
// Hace cumplir: D-086, la corrección del 2026-08-03 de la issue #380, issue
// #401. Investigación: mc-28.
//
// Por qué existe. `group_owner_identity.assurance = 'school_verified'` es la
// insignia «✓ Escuela verificada» que un padre ve antes de dejar entrar a su
// hijo a un salón (issue #382). Si ese valor se puede escribir desde
// cualquier ruta —un endpoint de administración, un script, un formulario—,
// la insignia deja de significar lo que dice: alguien se presenta como
// afiliado a una escuela verificada sin que ninguna escuela lo haya
// autorizado. No da error. Solo lo ve el padre que confió en la insignia.
//
// La regla es de UN solo escritor: los triggers de la migración 0017
// (`trg_school_verificada`, `trg_school_teacher_alta`, y los dos que bajan el
// valor al revocar o degradar). Todo lo demás son lecturas o comparaciones.
// Este auditor separa las dos cosas: COMPARAR con 'school_verified' es
// legítimo (la tarjeta de identidad lo hace); ESCRIBIRLO fuera de la
// migración es el fallo.
//
// Además: ninguna ruta puede insertar un `child_group` con `school_id` —
// afiliado a escuela — fuera del módulo de creación autorizado (que hoy no
// existe: las rutas son de las issues #381-#383). Un salón afiliado creado
// por un camino que no verifica la escuela es el estado intermedio que D-086
// prohíbe.
//
// LO QUE NO PUEDE COMPROBAR: que los triggers estén BIEN escritos. Eso lo
// prueba la ejecución — `apps/web/src/lib/grupo-esquema.prueba.mjs` los
// ejercita contra SQLite de verdad, incluido el caso de revocación.

import { archivos, leer, sinComentarios, informar, SOLO_PRODUCTO } from "./lib/repo.mjs";

/**
 * Los únicos archivos que pueden ESCRIBIR `school_verified`.
 *
 * La migración 0017 (los triggers) y nadie más. La lista es a mano a
 * propósito: ampliarla exige escribir aquí por qué, y esa es la anulación por
 * escrito que pide D-032.
 */
const ESCRITORES_DE_ASSURANCE = ["migrations/0017_grupos_infantiles.sql"];

/**
 * Los únicos archivos que pueden crear un grupo afiliado a escuela. Hoy
 * ninguno: la ruta de creación es de la issue #381. Cuando exista, entra aquí
 * — y con ella la obligación de comprobar `verification_status = 'verified'`.
 */
const CREADORES_DE_SALON_AFILIADO = [];

/** Escritura del valor: `= 'school_verified'` como asignación, no comparación. */
const ESCRITURA = [
  /SET\s+assurance\s*=\s*'school_verified'/i,
  /assurance\s*=\s*['"]school_verified['"]\s*[,;)\n]/i,   // objeto JS: { assurance = 'school_verified' }
  /assurance:\s*['"]school_verified['"]/i,                // objeto JS: { assurance: 'school_verified' }
  /VALUES\s*\([^)]*'school_verified'/i,
];

const problemas = [];
const notas = [];
let revisados = 0;

const fuentes = archivos(/\.(ts|tsx|js|mjs|astro|sql)$/)
  .filter((f) => SOLO_PRODUCTO.test(f))
  // Las pruebas ejercitan el valor a propósito — el caso de revocación de la
  // issue #380 vive en una.
  .filter((f) => !/\.prueba\.mjs$/.test(f));

for (const archivo of fuentes) {
  const texto = sinComentarios(leer(archivo) ?? "");
  if (!texto.includes("school_verified") && !/INSERT\s+INTO\s+child_group/i.test(texto)) continue;
  revisados++;

  if (!ESCRITORES_DE_ASSURANCE.includes(archivo)) {
    for (const re of ESCRITURA) {
      if (re.test(texto)) {
        problemas.push(
          `${archivo} ESCRIBE assurance = 'school_verified' fuera de la migración 0017. Ese valor es ` +
            "la insignia que un padre lee antes de dejar entrar a su hijo (D-086, issue #382): solo la " +
            "escriben los triggers de verificación de escuela, en la misma transacción. Compararlo " +
            "(`assurance === 'school_verified'`) es legítimo; asignarlo aquí no.",
        );
        break;
      }
    }
  }

  // Un INSERT en child_group que menciona school_id es la creación de un salón
  // afiliado: solo desde el módulo autorizado.
  if (
    /INSERT\s+INTO\s+child_group/i.test(texto) &&
    /school_id/.test(texto) &&
    !CREADORES_DE_SALON_AFILIADO.includes(archivo) &&
    !archivo.startsWith("migrations/")
  ) {
    problemas.push(
      `${archivo} crea un child_group afiliado a escuela (INSERT con school_id) fuera del módulo ` +
        "autorizado. Un salón afiliado solo nace donde se comprueba `verification_status = 'verified'` " +
        "(D-086): creado por otro camino, el grupo se presenta como afiliado sin estarlo.",
    );
  }
}

if (revisados === 0) {
  revisados = fuentes.length;
  notas.push("nadie escribe school_verified ni crea salones afiliados todavía — el estado correcto antes de las rutas");
}

informar({
  nombre: "school-verification-required",
  problemas,
  notas,
  revisados,
  resumen: "un solo escritor para la insignia de escuela verificada",
  cita: "D-086, mc-28, issues #380/#381/#401",
  porQueBloquea:
    "La insignia «Escuela verificada» es la única señal fuerte que tiene un padre para confiar en un " +
    "maestro. Si cualquier ruta puede escribirla, la insignia miente y nadie lo nota: no hay error, " +
    "solo un adulto presentándose como verificado ante familias que no lo comprobaron.",
});
