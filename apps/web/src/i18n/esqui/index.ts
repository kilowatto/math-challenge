/**
 * Texto de interfaz del modo "Esquí / Deslizada" (D-202), los siete locales.
 *
 * Sub-namespace nuevo, no claves en los 7 archivos top-level — mismo patrón
 * que `i18n/reto/`, `i18n/voz/`, `i18n/cosmeticos/`. Tres razones: (1) el
 * modo no está conectado a ninguna pantalla todavía, así que un archivo
 * aparte no le cuesta un byte a nadie hasta que algo lo importe; (2)
 * `audits/locales-complete.mjs` exige paridad de claves solo en los 7
 * archivos top-level — tocar esos 7 por un modo sin construir arriesgaría
 * el auditor por nada; (3) mismo criterio que ya usan `reto/`/`voz/`.
 *
 * Solo `es-MX` es contenido autorado — los otros 6 son borradores
 * adaptados (no traducción literal), pendientes de revisión nativa antes
 * de aprobarse (D-080, mismo criterio que el guion de voz en
 * `scripts/datos/guion-esqui.mjs`).
 */

import type { Locale } from "../index.ts";

import esMX from "./es-MX.json";
import esES from "./es-ES.json";
import en from "./en.json";
import frFR from "./fr-FR.json";
import ptBR from "./pt-BR.json";
import ptPT from "./pt-PT.json";
import deDE from "./de-DE.json";

export interface TextoEsqui {
  esqui: {
    nombreModo: string;
    resultado: {
      victoria: string;
      descalificado: string;
    };
    tablero: {
      etiqueta: string;
    };
  };
}

export const ESQUI: Record<Locale, TextoEsqui> = {
  "es-MX": esMX as TextoEsqui,
  "es-ES": esES as TextoEsqui,
  "en": en as TextoEsqui,
  "fr-FR": frFR as TextoEsqui,
  "pt-BR": ptBR as TextoEsqui,
  "pt-PT": ptPT as TextoEsqui,
  "de-DE": deDE as TextoEsqui,
};
