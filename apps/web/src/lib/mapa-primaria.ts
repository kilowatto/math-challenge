/**
 * El enrutado del mapa de PRIMARIA/SECUNDARIA — D-152, D-184.
 *
 * ─── Por qué este archivo existe, y por qué hoy no existía ─────────────────
 *
 * `packages/motor/src/mapa.ts` ya tenía `construirArbol()` desde F7 (#233),
 * probado por `audits/mapa-sin-numero-de-nivel.mjs` con datos de ejemplo — pero
 * **ningún llamador real lo alimentaba**. La razón está escrita en su propio
 * encabezado: `skill_state` en `[0,1]` es un «[contrato asumido]», porque F4
 * todavía no expone `estadoDeHabilidades()`. El módulo estaba listo; lo que
 * faltaba era ESTE adaptador, que traduce lo que F4 sí tiene hoy
 * (`Resumen.habilidad`, el logit crudo, y `Resumen.etapa`) a lo que
 * `construirArbol()` espera, sin inventar una segunda fuente de verdad.
 *
 * ─── El adaptador, y por qué estos números y no otros ──────────────────────
 *
 *   · `nivel` sale de `nivelDeHabilidad()` — la MISMA función que ya usa
 *     `/api/jugar` para la escalera de D-017. No es un número nuevo: es el
 *     mismo escalón 1..12, reusado, y `construirArbol()` ya lo convierte en
 *     un `orden` correlativo que nunca llega a una plantilla.
 *   · `skillState` sale de `etapa`, no de una sigmoide sobre el logit: es la
 *     MISMA señal discreta que `fasesDelSendero()` ya usa para KINDER
 *     («aprendido» → terminado), traducida a los tres cortes de `periciaDe()`
 *     (0.2/0.6/1.0) en vez de inventar una escala continua nueva.
 *
 * ─── Qué habilidades entran, y qué NO se rellena ────────────────────────────
 *
 * Solo las que el niño ya tocó (`respondidos > 0`) — igual que
 * `fasesDelSendero()` para KINDER: una fila sin ítems respondidos no es un
 * lugar empezado, y no se rellena un `nivel` de arranque por adivinanza. Un
 * niño de PRIMARIA sin datos todavía ve el árbol vacío con `mapaSinHabilidades`
 * (ya autorada en los siete locales) — nunca una fila fabricada.
 */
import { nivelDeHabilidad } from "../../../../packages/motor/src/adaptativo.ts";
import type { EntradaDeHabilidad } from "../../../../packages/motor/src/mapa.ts";
import type { Resumen } from "./aprendiz";

/**
 * `periciaDe()` corta en 0.2 y 0.6. Un valor por etapa, bien adentro de su
 * tramo, para que un redondeo de punto flotante no lo cruce por accidente.
 */
const SKILLSTATE_POR_ETAPA: Readonly<Record<Resumen["etapa"], number>> = Object.freeze({
  sin_ver: 0,
  practicando: 0.3,
  provisional: 0.45,
  aprendido: 0.8,
});

/**
 * `Resumen[]` (F4) → `EntradaDeHabilidad[]` (el contrato de `construirArbol()`).
 *
 * `habilidades` es el catálogo de rótulos YA RESUELTO por el locale de la
 * página (mismo patrón que `practicar.astro`): este módulo no importa JSON de
 * i18n directamente, para poder probarse sin ellos.
 */
export function entradasDelArbol(
  resumen: readonly Resumen[],
  habilidades: Readonly<Record<string, string>>,
): EntradaDeHabilidad[] {
  return resumen
    .filter((fila) => fila.respondidos > 0)
    .map((fila) => ({
      habilidad: fila.skillId,
      nivel: nivelDeHabilidad(fila.habilidad),
      skillState: SKILLSTATE_POR_ETAPA[fila.etapa],
      rotulo: habilidades[fila.skillId] ?? null,
      // Mundo Kinder multi-bioma: `fila.bioma` ya viene resuelto por
      // `leerModelo()` (D-200.x) — si el llamador pidió un bioma
      // específico, `resumen` ya está filtrado a ese único mundo; este
      // adaptador solo deja pasar el dato, nunca lo calcula.
      bioma: fila.bioma,
    }));
}
