/**
 * El catálogo de 16 animales que un perfil puede elegir como avatar (D-194,
 * reversa D-080). Módulo PURO — sin `D1Database`, sin `fetch`, sin nada que le
 * impida vivir también en el bundle de cliente de `QuienJuegaScene.ts`.
 *
 * ─── Dos rosters, por el mismo umbral que ya fijó D-191 ────────────────────
 *
 * KINDER y PRIMARIA eligen entre 8 personajes ILUSTRADOS (mismo lenguaje
 * visual que Larry). SECUNDARIA, SERIO, PRO y el adulto de la cuenta eligen
 * entre 8 FOTORREALISTAS antropomórficos — el mismo umbral "fotorrealista"
 * que D-191 ya declaró para el Modo Historia del adulto, no una banda nueva.
 * Las especies NUNCA se repiten entre los dos rosters ni con Larry
 * (rinoceronte): el dueño lo pidió explícito para que un niño y un adulto de
 * la misma casa nunca "elijan el mismo animal" con dos acabados distintos en
 * una pantalla que los muestra a los dos a la vez (`¿Quién juega?`).
 *
 * El arte vive en `apps/web/public/avatares/avatar_<id>.{avif,webp}`,
 * generado por `scripts/gen-avatares-animal.mjs` con revisión humana previa
 * (D-080 sigue exigiéndola, solo cambia QUÉ se revisa).
 */
import type { TemaVisual } from "./quien-juega-datos";

export const ROSTER_ILUSTRADO = [
  "elefante",
  "jirafa",
  "cebra",
  "mono",
  "suricata",
  "avestruz",
  "hipopotamo",
  "leon",
] as const;

export const ROSTER_FOTORREALISTA = [
  "foto_guepardo",
  "foto_bufalo",
  "foto_cocodrilo",
  "foto_aguila",
  "foto_hiena",
  "foto_nu",
  "foto_gacela",
  "foto_chacal",
] as const;

export type AnimalId = (typeof ROSTER_ILUSTRADO)[number] | (typeof ROSTER_FOTORREALISTA)[number];

/** Todos los ids válidos, para validar sin duplicar las dos listas de arriba. */
export const TODOS_LOS_ANIMALES: readonly AnimalId[] = [...ROSTER_ILUSTRADO, ...ROSTER_FOTORREALISTA];

/** KINDER/PRIMARIA ven el roster ilustrado; SECUNDARIA en adelante (y el adulto) ven el fotorrealista — mismo umbral que D-191. */
export function rosterPara(tema: TemaVisual): readonly AnimalId[] {
  return tema === "KINDER" || tema === "PRIMARIA" ? ROSTER_ILUSTRADO : ROSTER_FOTORREALISTA;
}

/**
 * El animal que este perfil ya eligió, o `null` si todavía no ha elegido
 * ninguno (no hay picker todavía — D-194 lo deja para una fase siguiente).
 * `avatarPartsJson` es el mismo campo `avatar_parts` que ya usa `caraDe()`
 * en `kids/index.astro`, ahora también en `users` (migración 0026).
 *
 * Un id que no pertenece al roster de ESTA banda (p. ej. guardado antes de
 * que el perfil cambiara de banda) se trata como "sin elegir" — nunca se
 * enseña un fotorrealista en una tarjeta de KINDER ni viceversa.
 */
export function animalElegido(avatarPartsJson: string | null | undefined, tema: TemaVisual): AnimalId | null {
  let elegido: { animal?: unknown } = {};
  try {
    elegido = JSON.parse(avatarPartsJson || "{}");
  } catch {
    return null;
  }
  if (typeof elegido.animal !== "string") return null;
  const roster = rosterPara(tema);
  return (roster as readonly string[]).includes(elegido.animal) ? (elegido.animal as AnimalId) : null;
}

/** La clave de textura/URL de un animal — un solo lugar que sabe el nombre de archivo. */
export function claveDeAnimal(id: AnimalId): string {
  return `avatar_${id}`;
}
