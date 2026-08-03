/**
 * La clase Workflow del cierre semanal de ligas (F7 #241).
 *
 * Vive en un archivo aparte de `ciclo-liga.ts` a propósito: éste importa
 * `cloudflare:workers`, que solo existe en el runtime de Workers, y la prueba
 * (`ciclo-liga.prueba.mjs`) corre en Node desnudo contra `node:sqlite`. Con la
 * lógica del cierre en su propio módulo, la prueba ejecuta el MISMO código que
 * se despliega — no una copia.
 *
 * Lo que hace el cierre, y por qué es idempotente, está documentado en
 * `ciclo-liga.ts`. Aquí solo está la orquestación: un paso para listar las
 * cohortes vencidas y un paso con reintentos por cohorte.
 */

import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import {
  cerrarCohorte,
  cohortesVencidas,
  type EnvCicloLiga,
  type ResumenCierre,
} from "./ciclo-liga.ts";

export interface ParamsCicloLiga {
  /** El instante programado del cron (epoch ms). De él sale la semana en curso. */
  programadoPara: number;
}

/** Reintentos del paso de cierre: una corrida a medias no deja estado roto. */
const REINTENTOS = {
  retries: { limit: 5, delay: "30 seconds" as const, backoff: "exponential" as const },
  timeout: "10 minutes" as const,
};

/**
 * Una instancia por corrida del cron, con id derivado del instante programado
 * (`ciclo-liga:<scheduledTime>`): si el evento se entrega dos veces, la segunda
 * creación se salta y no hay doble corrida.
 */
export class CicloLigaSemanal extends WorkflowEntrypoint<EnvCicloLiga, ParamsCicloLiga> {
  override async run(
    event: Readonly<WorkflowEvent<ParamsCicloLiga>>,
    step: WorkflowStep,
  ): Promise<{ cohortes: number; resumenes: ResumenCierre[] }> {
    const vencidas = await step.do("listar cohortes vencidas", async () =>
      cohortesVencidas(this.env.DB, event.payload.programadoPara),
    );

    const resumenes: ResumenCierre[] = [];
    for (const id of vencidas) {
      resumenes.push(
        await step.do(`cerrar cohorte ${id}`, REINTENTOS, async () => cerrarCohorte(this.env.DB, id)),
      );
    }

    return { cohortes: resumenes.length, resumenes };
  }
}
