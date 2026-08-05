import { PISO_MS, type Banda } from "./puntuacion.ts";

export interface EstadoPiso {
  consecutivas: number;
}

export interface ResultadoPiso {
  estado: EstadoPiso;
  señal: boolean;
}

/** Señal derivada, nunca un registro de tiempos crudos. */
export function registrarPiso(
  estado: EstadoPiso,
  banda: Banda,
  rtMs: number,
): ResultadoPiso {
  if (banda === "KINDER") return { estado: { consecutivas: 0 }, señal: false };
  const consecutivas = rtMs < PISO_MS ? estado.consecutivas + 1 : 0;
  return { estado: { consecutivas }, señal: consecutivas >= 3 };
}
