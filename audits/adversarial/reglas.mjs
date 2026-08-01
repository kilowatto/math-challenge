// Las dos reglas de D-032 y la regla de qué bloquea, en un solo lugar.
//
// Están aquí y no dentro del corredor porque son la parte que sostiene la
// flota: si esta clasificación se equivoca, un auditor bloquea lo que no debe
// (y la gente aprende a rodear la flota) o deja pasar lo que sí importa. Vive
// aparte para poder probarse sin gastar una llamada de LLM — ver prueba.mjs.

import { verificarCita } from "./citas.mjs";
import { huella } from "./anulaciones.mjs";
import { verificarEvidencia, archivoFueMostrado } from "./evidencia.mjs";

/**
 * Reparte los hallazgos de un auditor en cuatro cubetas.
 *
 *   bloqueantes · cita válida + autorizada + puede bloquear + gravedad bloqueante
 *   reportados  · cita válida y autorizada, pero no detiene el PR
 *   invalidos   · regla 1: sin cita real o sin autoridad para invocarla
 *   anulados    · regla 2: bloqueaba, y alguien escribió por qué no debe
 */
export function clasificar(hallazgos, carta, universo, anulaciones = new Map(), turnoMostrado = null, archivosMostrados = null) {
  const bloqueantes = [];
  const reportados = [];
  const invalidos = [];
  const anulados = [];

  for (const h of hallazgos ?? []) {
    const hallazgo = { ...h, auditor: carta.id };
    const v = verificarCita(h.cita_id, universo);

    // Regla 1, primera mitad: la cita tiene que existir en el repo.
    if (!v.valida) {
      invalidos.push({ ...hallazgo, motivo: `cita \`${h.cita_id}\` no existe en el repo` });
      continue;
    }

    // Regla 1, segunda mitad: y tiene que ser una que ESTA carta autoriza.
    // Sin esto, cualquier auditor podría invocar cualquier decisión y la
    // división de trabajo entre los 23 sería decorativa.
    if (!carta.cita.includes(h.cita_id)) {
      invalidos.push({
        ...hallazgo,
        motivo: `\`${h.cita_id}\` existe, pero no está en la carta de \`${carta.id}\``,
      });
      continue;
    }

    // D-032: "Los adversariales bloquean únicamente cuando citan una línea roja
    // o una decisión explícita; el resto reporta sin detener el PR."
    if (!(v.puedeBloquear && h.gravedad === "bloqueante")) {
      reportados.push({ ...hallazgo, clase: v.clase });
      continue;
    }

    // Regla 1, tercera capa: la cita existe, pero ¿la evidencia también?
    // Un auditor citó D-022 —real— y afirmó ver la cadena "versión" en un
    // archivo que dice "versão". La cita válida lo hizo bloqueante. Un hallazgo
    // cuyas citas textuales no aparecen en nada de lo que se le mostró deja de
    // bloquear: sigue reportándose, porque puede tener razón de fondo, pero no
    // detiene a nadie con una prueba que nadie puede encontrar.
    // ¿Y el hallazgo es sobre un archivo que este auditor llegó a ver?
    if (archivosMostrados && !archivoFueMostrado(h.archivo, archivosMostrados)) {
      reportados.push({
        ...hallazgo,
        clase: v.clase,
        archivoNoMostrado: true,
      });
      continue;
    }

    if (turnoMostrado) {
      const ev = verificarEvidencia(h, turnoMostrado);
      if (!ev.verificable) {
        reportados.push({
          ...hallazgo,
          clase: v.clase,
          evidenciaNoVerificable: true,
          citasFaltantes: ev.faltantes,
        });
        continue;
      }
    }

    // Regla 2: anular exige haberlo escrito, y queda en el historial.
    const anulacion = anulaciones.get(huella(carta.id, h.archivo, h.cita_id));
    if (anulacion) anulados.push({ ...hallazgo, anulacion });
    else bloqueantes.push({ ...hallazgo, clase: v.clase });
  }

  return { bloqueantes, reportados, invalidos, anulados };
}
