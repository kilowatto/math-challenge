/**
 * Qué le pinta la tarjeta de cada perfil en "¿Quién juega?" (D-190/D-191).
 *
 * ─── Dos formas de mostrar progreso, nunca las mismas dos reglas ───────────
 *
 * El dueño pidió mostrar "en qué va" cada quien, pero las reglas que ya
 * existen no son iguales para todas las bandas, y este módulo las respeta en
 * vez de inventar una tercera:
 *
 *   · **SECUNDARIA, SERIO, PRO y el adulto de la cuenta** — un Rango
 *     gamificado (`packages/motor/src/xp.ts::rangoDeXp()`, ya en producción
 *     para el panel del padre) más el XP crudo. Es un número DISTINTO del
 *     N1-N12 que D-017 prohíbe enseñar — por eso el módulo se llama "Rango" y
 *     no "Nivel", la misma distinción que ya hace `xp.ts`.
 *   · **PRIMARIA** — nunca un número. El rótulo en palabras de la habilidad
 *     en la que va ("Sumas básicas"), tomada de la MISMA construcción del
 *     árbol que ya usa `kids/mapa.astro` (`construirArbol`/`entradasDelArbol`)
 *     — nunca un cálculo paralelo.
 *   · **KINDER** — nada. D-024/D-045 dicen, con evidencia, que kinder nunca ve
 *     un puntaje ni antes ni durante el juego; D-019 dice que kinder nunca ve
 *     texto porque no lee. Las dos siguen intactas: la tarjeta de un perfil
 *     KINDER no lleva esta información, nunca la llevó.
 *
 * Ningún cálculo nuevo vive aquí — este archivo solo ORQUESTA llamadas a
 * módulos que ya existen y ya se prueban solos.
 */
import { rangoDeXp } from "../../../../packages/motor/src/xp.ts";
import { construirArbol } from "../../../../packages/motor/src/mapa.ts";
import { entradasDelArbol } from "./mapa-primaria";
import { leerModelo } from "./aprendiz";

export type TemaVisual = "KINDER" | "PRIMARIA" | "SECUNDARIA" | "SERIO" | "PRO";

export type DatoDeTarjeta =
  | { tipo: "rango"; rango: number; xp: number }
  | { tipo: "habilidad"; rotulo: string }
  | { tipo: "ninguno" };

/**
 * El Rango+XP de un perfil, de la MISMA tabla que ya lee el panel del padre
 * (`padre-panel.ts`) y el mapa del adulto (`app/mapa.astro`) — nunca una
 * consulta nueva con su propio criterio.
 */
export async function rangoYXpDe(
  db: D1Database | undefined,
  quien: { childProfileId: string } | { userId: string },
): Promise<{ rango: number; xp: number } | null> {
  if (!db) return null;
  try {
    const columna = "childProfileId" in quien ? "child_profile_id" : "user_id";
    const valor = "childProfileId" in quien ? quien.childProfileId : quien.userId;
    const fila = await db
      .prepare(`SELECT total_xp FROM xp_totals WHERE ${columna} = ?`)
      .bind(valor)
      .first<{ total_xp: number }>();
    const xp = fila?.total_xp ?? 0;
    return { rango: rangoDeXp(xp), xp };
  } catch {
    return null;
  }
}

/**
 * La habilidad actual de un niño de PRIMARIA, en palabras.
 *
 * "Actual" se define exactamente como ya lo hace `construirSendero()` para el
 * compañero de KINDER (`packages/motor/src/mapa.ts`): la primera, en el orden
 * real del árbol (`secuencia`), que no está todavía dominada. Si ya domina
 * todo lo que tocó, se enseña la última — nunca "nada que mostrar" para quien
 * ya lo logró todo.
 */
export async function habilidadActualDe(
  learnerDo: DurableObjectNamespace | undefined,
  childProfileId: string,
  habilidades: Readonly<Record<string, string>>,
): Promise<string | null> {
  const resumen = await leerModelo(learnerDo, childProfileId);
  const arbol = construirArbol(entradasDelArbol(resumen, habilidades));
  const nodos = arbol.grupos.flatMap((g) => g.nodos).filter((n) => n.rotulo);
  if (nodos.length === 0) return null;
  const enCurso = nodos.find((n) => n.pericia !== "dominada");
  return (enCurso ?? nodos[nodos.length - 1]).rotulo;
}

/**
 * El dato completo de una tarjeta, según la banda real del perfil.
 *
 * `esAdulto` decide si `xp_totals` se busca por `user_id` (la cuenta) o por
 * `child_profile_id` — el mismo criterio que ya usa `progreso.ts`.
 */
export type PerfilParaTarjeta =
  | { tema: TemaVisual; childProfileId: string; esAdulto: false }
  | { tema: TemaVisual; userId: string; esAdulto: true };

/** Guarda de tipos explícita: más robusta que un `if (perfil.esAdulto)` inline contra este `switch` de arriba. */
function esPerfilAdulto(
  perfil: PerfilParaTarjeta,
): perfil is { tema: TemaVisual; userId: string; esAdulto: true } {
  return perfil.esAdulto;
}

export async function datoDeTarjeta(
  env: { DB?: D1Database; LEARNER_DO?: DurableObjectNamespace },
  perfil: PerfilParaTarjeta,
  habilidades: Readonly<Record<string, string>>,
): Promise<DatoDeTarjeta> {
  if (perfil.tema === "KINDER") return { tipo: "ninguno" };

  if (esPerfilAdulto(perfil)) {
    // SECUNDARIA, SERIO, PRO — el adulto de la cuenta nunca es "PRIMARIA".
    const dato = await rangoYXpDe(env.DB, { userId: perfil.userId });
    return dato ? { tipo: "rango", rango: dato.rango, xp: dato.xp } : { tipo: "ninguno" };
  }

  if (perfil.tema === "PRIMARIA") {
    const rotulo = await habilidadActualDe(env.LEARNER_DO, perfil.childProfileId, habilidades);
    return rotulo ? { tipo: "habilidad", rotulo } : { tipo: "ninguno" };
  }

  // SECUNDARIA, SERIO, PRO — para un niño (JR/PRO son elección del adulto, D-066, nunca de un perfil de niño en la práctica).
  const dato = await rangoYXpDe(env.DB, { childProfileId: perfil.childProfileId });
  return dato ? { tipo: "rango", rango: dato.rango, xp: dato.xp } : { tipo: "ninguno" };
}
