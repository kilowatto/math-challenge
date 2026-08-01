// El contrato de salida de un auditor, y la llamada que lo obtiene.
//
// El proveedor vive en proveedores.mjs: Workers AI por defecto (D-035), Claude
// a una variable de distancia. Este archivo solo define **qué forma tiene un
// veredicto** y envuelve la llamada.

import { correr, PROVEEDOR, MODELO_PRINCIPAL, PRECIOS } from "./proveedores.mjs";

export { PROVEEDOR, MODELO_PRINCIPAL, PRECIOS };

/**
 * Un hallazgo, aplanado a propósito.
 *
 * Los esquemas anidados fallan más, y con un JSON best-effort —que es lo que
 * Workers AI garantiza— cada nivel de anidamiento es una oportunidad más de que
 * el veredicto no valide. `cita_tipo` y `cita_id` podrían ser un objeto `cita`;
 * son dos campos planos por eso.
 */
export const ESQUEMA_VEREDICTO = {
  type: "object",
  properties: {
    hallazgos: {
      type: "array",
      items: {
        type: "object",
        properties: {
          archivo: { type: "string", description: "Ruta del archivo tal como aparece en el diff." },
          linea: { type: "integer", description: "Línea del archivo nuevo. 0 si el hallazgo no es puntual." },
          gravedad: { type: "string", enum: ["bloqueante", "grave", "menor"] },
          resumen: { type: "string", description: "Una oración: qué está mal." },
          evidencia: {
            type: "string",
            description:
              "La línea concreta del diff que lo demuestra, y qué supusiste si tuviste que suponer algo.",
          },
          cita_tipo: { type: "string", enum: ["linea-roja", "decision", "investigacion"] },
          cita_id: { type: "string", description: "Exactamente LR-n, D-0nn o mc-nn. Solo ids que existan." },
          arreglo: { type: "string", description: "Qué cambiar, en concreto." },
        },
        required: ["archivo", "linea", "gravedad", "resumen", "evidencia", "cita_tipo", "cita_id", "arreglo"],
        additionalProperties: false,
      },
    },
    nota: {
      type: "string",
      description:
        "Qué revisaste y qué no pudiste revisar con lo que viste. Cadena vacía si no hay nada que aclarar.",
    },
  },
  required: ["hallazgos", "nota"],
  additionalProperties: false,
};

/**
 * Corre una carta. Devuelve `{ hallazgos, nota, uso, modelo, reintentos }`.
 *
 * No atrapa errores a propósito: quien llama decide qué hacer con un auditor
 * que no pudo correr, y en el corredor eso cuenta como fallo, nunca como
 * "revisó y no encontró nada".
 */
export async function auditar({ constitucion, turnoUsuario, sesion }) {
  return correr({
    sistema: constitucion,
    usuario: turnoUsuario,
    esquema: ESQUEMA_VEREDICTO,
    sesion,
  });
}
