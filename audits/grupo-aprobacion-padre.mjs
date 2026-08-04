#!/usr/bin/env node
// Auditor determinista — la entrada de un niño a un grupo la aprueba SU padre
//
// Hace cumplir: D-011, D-096 (la membresía ES el consentimiento), issue #401.
//
// Por qué existe. El código de unión produce una SOLICITUD pendiente, nunca
// una entrada: quien convierte `pending` en `approved` tiene que ser el padre
// de ESE niño, y la fila tiene que quedar con `decided_by` = la sesión que
// decidió. Una ruta que apruebe sin esas tres condiciones no da error — da un
// niño dentro de un grupo que su padre nunca vio, que es exactamente el
// escenario que todo F9 existe para impedir (mc-28).
//
// El gate es estructural, no de lectura: escribir una aprobación solo puede
// hacerse desde el módulo de la lista blanca ESCRITA A MANO de abajo, y ese
// módulo tiene que contener las tres condiciones. Cualquier otro archivo de
// producto que escriba `approved` sobre `child_group_membership` bloquea el
// commit — incluida la segunda ruta que alguien añada dentro de seis meses
// «solo para importar», que es como este control se rompe siempre.
//
// LO QUE NO PUEDE COMPROBAR: que el módulo blanco tenga las condiciones BIEN
// escritas (que el `parent_user_id` comparado sea el de la sesión y no uno
// del cuerpo de la petición). Eso lo prueba la ejecución — la suite de la
// ruta contra node:sqlite, cuando la ruta exista — y lo revisa la carta
// adversarial `privacidad`.

import { archivos, leer, sinComentarios, existe, informar, SOLO_PRODUCTO } from "./lib/repo.mjs";

/**
 * El único módulo autorizado a convertir una solicitud en aprobación.
 *
 * Hoy NO EXISTE: las rutas de F9 son las issues #382-#386 y este PR entrega
 * esquema, motor, DO y auditores. La lista existe ya —con el nombre del
 * módulo que las rutas tendrán que usar— para que la primera ruta llegue
 * vigilada, no para que alguien tenga que acordarse de activar el guardián
 * (la lección de los trece auditores escritos antes que su código, D-032).
 */
const MODULOS_DE_APROBACION = ["apps/web/src/lib/padre-grupo.ts"];

/** Marca una escritura de aprobación sobre la membresía. */
const ESCRITURA_DE_APROBACION = [
  /UPDATE\s+child_group_membership[\s\S]{0,400}?'approved'/i,
  /INSERT\s+INTO\s+child_group_membership[\s\S]{0,400}?'approved'/i,
  /status\s*=\s*["']approved["']/i,
];

/**
 * Las tres condiciones de D-011/D-096, como marcadores de texto sobre el
 * módulo blanco. No es una comprobación semántica — es el recordatorio
 * mecánico de que la aprobación exige solicitud vigente, niño de la cuenta y
 * firma de quién decidió.
 */
const MARCADORES_DEL_MODULO = [
  ["pending", "la membresía tiene que estar `pending` — aprobar lo que no se pidió es inventar una entrada"],
  ["decided_by", "la fila tiene que firmar QUIÉN decidió — la membresía ES el consentimiento (D-096)"],
  ["parent_user_id", "el perfil tiene que ser de la cuenta de la sesión — nadie aprueba al hijo de otro (D-011)"],
];

const problemas = [];
const notas = [];
let revisados = 0;

const fuentes = archivos(/\.(ts|tsx|js|mjs|astro)$/)
  .filter((f) => SOLO_PRODUCTO.test(f))
  // Las pruebas ejercen la aprobación a propósito — son el único sitio donde
  // escribir `approved` sin las tres condiciones es correcto.
  .filter((f) => !/\.prueba\.mjs$/.test(f))
  // Las migraciones nombran 'approved' en CHECKs y triggers, no en rutas.
  .filter((f) => !f.startsWith("migrations/"));

for (const archivo of fuentes) {
  const texto = sinComentarios(leer(archivo) ?? "");
  if (!/child_group_membership|approved/.test(texto)) continue;
  const escribe = ESCRITURA_DE_APROBACION.some((re) => re.test(texto));
  if (!escribe) continue;
  revisados++;
  if (MODULOS_DE_APROBACION.includes(archivo)) continue;
  problemas.push(
    `${archivo} escribe una aprobación sobre child_group_membership fuera del módulo autorizado ` +
      `(${MODULOS_DE_APROBACION.join(", ")}). La entrada de un niño a un grupo la aprueba SU padre ` +
      "viendo antes la identidad del dueño (D-011): esa escritura no puede vivir en dos sitios, " +
      "porque la segunda copia es la que se escribe sin las tres condiciones.",
  );
}

// El módulo blanco, cuando exista, tiene que llevar las tres condiciones.
for (const modulo of MODULOS_DE_APROBACION) {
  if (!existe(modulo)) {
    notas.push(`${modulo} todavía no existe — la ruta de aprobación es de las issues #382-#386; el guardián ya está activo`);
    continue;
  }
  revisados++;
  const texto = sinComentarios(leer(modulo) ?? "");
  for (const [marcador, razon] of MARCADORES_DEL_MODULO) {
    if (!texto.includes(marcador)) {
      problemas.push(`${modulo} no menciona \`${marcador}\`: ${razon}.`);
    }
  }
}

if (revisados === 0) {
  // No hay módulo ni escrituras: el estado seguro. Pero `informar` falla con
  // revisados = 0 a propósito («un escáner que no ve nada aprueba siempre»),
  // así que contamos la comprobación misma: las fuentes SÍ se barrieron.
  revisados = fuentes.length;
  notas.push("ningún archivo de producto escribe aprobaciones todavía — el estado correcto antes de las rutas");
}

informar({
  nombre: "grupo-aprobacion-padre",
  problemas,
  notas,
  revisados,
  resumen: "ninguna aprobación fuera del módulo autorizado",
  cita: "D-011, D-096, mc-28, issue #401",
  porQueBloquea:
    "Un niño dentro de un grupo que su padre nunca aprobó no produce ningún error visible: es un adulto " +
    "desconocido viendo su alias, su racha y sus puntos. La escritura de la aprobación vive en UN sitio " +
    "para que no pueda olvidarse en el segundo.",
});
