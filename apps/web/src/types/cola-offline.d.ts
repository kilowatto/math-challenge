export {};

declare global {
  interface Window {
    __mathChallengeOffline?: {
      encolarRespuesta(solicitud: {
        sesionId: string;
        orden: number;
        itemId: string;
        eleccion: number | string;
        payload: { url: string; body: string };
      }): Promise<boolean>;
      arrancar(): void;
    };
  }
}
