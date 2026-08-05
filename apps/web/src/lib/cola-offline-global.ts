import { encolar, engancharVaciado, type IntentoPendiente } from "./cola-offline";

type Solicitud = {
  sesionId: string;
  orden: number;
  itemId: string;
  eleccion: number | string;
  payload: { url: string; body: string };
};

const api = {
  async encolarRespuesta(solicitud: Solicitud): Promise<boolean> {
    try {
      await encolar({ ...solicitud, contestadoEn: Date.now() });
      return true;
    } catch {
      return false;
    }
  },
  arrancar(): void {
    engancharVaciado(async (intento: IntentoPendiente) => {
      if (!intento.payload) return false;
      try {
        const respuesta = await fetch(intento.payload.url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: intento.payload.body,
        });
        return respuesta.ok;
      } catch {
        return false;
      }
    });
  },
};

(globalThis as typeof globalThis & { __mathChallengeOffline?: typeof api }).__mathChallengeOffline = api;
