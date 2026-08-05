import { generarCodigoDeUnion } from "./grupo.ts";

export const MAX_MIEMBROS_CLUB_ADULTO = 20;
export const VENTANA_RETO_CLUB_MS = 72 * 60 * 60 * 1000;
export const LOCALES_CLUB = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"] as const;
export type LocaleClub = (typeof LOCALES_CLUB)[number];

const NOMBRES: Record<LocaleClub, readonly string[]> = {
  en: ["club.rinoceronte", "club.sabana", "club.cometa"],
  "es-MX": ["club.rinoceronte", "club.sabana", "club.cometa"],
  "es-ES": ["club.rinoceronte", "club.sabana", "club.cometa"],
  "fr-FR": ["club.rinoceronte", "club.sabana", "club.cometa"],
  "pt-BR": ["club.rinoceronte", "club.sabana", "club.cometa"],
  "pt-PT": ["club.rinoceronte", "club.sabana", "club.cometa"],
  "de-DE": ["club.rinoceronte", "club.sabana", "club.cometa"],
};

export function nombresDeClub(locale: string): readonly string[] {
  return NOMBRES[(LOCALES_CLUB as readonly string[]).includes(locale) ? locale as LocaleClub : "en"];
}

export function nombreDeClubValido(locale: string, nameKey: string): boolean {
  return nombresDeClub(locale).includes(nameKey);
}

export function maximoDeClubValido(maxSize: number): boolean {
  return Number.isInteger(maxSize) && maxSize >= 1 && maxSize <= MAX_MIEMBROS_CLUB_ADULTO;
}

export function ventanaDeRetoValida(startsAt: number, expiresAt: number): boolean {
  return Number.isFinite(startsAt) && Number.isFinite(expiresAt) &&
    expiresAt > startsAt && expiresAt - startsAt <= VENTANA_RETO_CLUB_MS;
}

export function nivelDeClubValido(nivel: number): boolean {
  return Number.isInteger(nivel) && nivel >= 8 && nivel <= 10;
}

export function adolescentePuedeEntrar(banda: string): boolean {
  return banda === "SECUNDARIA";
}

export function nuevoCodigoClub(azar?: () => number): string {
  return generarCodigoDeUnion(azar);
}
