/**
 * El enrutado del mapa de KINDER — D-152.
 *
 * Hasta hoy el sendero de la Sabana era solo lectura: círculos que se miran y
 * no se pisan. D-152 lo convierte en el catálogo visual de niveles, estilo mapa
 * de Angry Birds: **un toque en el lugar lleva al reto**, el avance es de reto
 * en reto, y los lugares completados se pueden rejugar siempre — nada se
 * bloquea hacia atrás («nada se tacha y nada regresa», `guia-de-estilo.md`).
 *
 * ─── Por qué esto es un módulo puro y no código de la página ───────────────
 *
 * Dos decisiones viven aquí y las dos son de las que se escriben mal en silencio:
 *
 *  1. **De dónde sale el estado de cada lugar.** Del resumen del Durable Object
 *     del aprendiz (F4), que ya existe — el mapa NO tiene tabla propia (#231) y
 *     este archivo no la crea: traduce lo que F4 ya mide a las fases que
 *     `construirSendero()` entiende. La máquina de historia de F3
 *     (`historia.ts`: exploración → práctica → síntesis) no tiene cable a la
 *     pantalla todavía; el estado del lugar sale del dominio medido, no de la
 *     historia, y eso queda dicho aquí y no escondido en la página.
 *  2. **Qué lugares son enlace.** El lugar en curso y los terminados llevan al
 *     reto de ese lugar; los por visitar **se ven pero no se pisan** — no es un
 *     candado de castigo, es sencillamente no-enlace (guía de estilo § mapa).
 *
 * La dificultad la sigue eligiendo el motor (D-017): el mapa presenta lugares,
 * no pregunta niveles. Por eso el destino lleva el IDENTIFICADOR del lugar
 * (`K07`) y nada más — `audits/mapa-sin-numero-de-nivel.mjs` vigila que ninguna
 * plantilla del mapa interpole un número de nivel, y aquí no hay ninguno que
 * interpolar.
 *
 * Sin reloj, sin red, sin base: mismo contrato que el resto de módulos puros.
 */

import type { Resumen } from "./aprendiz.ts";

/**
 * `lugar → fase` para `construirSendero()`, a partir del resumen del aprendiz.
 *
 * Un lugar es un id de habilidad de kinder (`K01`…`K14`, D-019). Solo entran
 * los lugares que el niño ya tocó: `construirSendero()` trata el ausente como
 * «por visitar», que es exactamente el caso sin fila — y por eso aquí no se
 * rellena ningún valor por defecto.
 *
 *   · `aprendido`        → `terminado`. Es `etapaDe()` del programador: dominio
 *                          confirmado por el repaso espaciado, no una corazonada.
 *   · cualquier otra fila con ítems respondidos → `en_curso`.
 *   · fila sin ítems respondidos → no se escribe: un lugar sin tocar no es un
 *     lugar empezado, igual que en `construirSendero()`.
 *
 * Lo que NO se mira, a propósito: la estimación en logits ni el escalón que el
 * motor asigna. El número de dificultad no sale del módulo del mapa (D-017) y
 * este archivo no lo deja escapar por la puerta de atrás.
 */
export function fasesDelSendero(resumen: readonly Resumen[]): Record<string, string> {
  const fases: Record<string, string> = {};
  for (const fila of resumen) {
    if (fila.etapa === "aprendido") {
      fases[fila.skillId] = "terminado";
    } else if (fila.respondidos > 0) {
      fases[fila.skillId] = "en_curso";
    }
  }
  return fases;
}

/** El mapa del niño. Barra final, por la misma razón que `rutaJugar`. */
export const rutaMapaKids = (locale: string) => `/${locale}/app/kids/mapa/`;

/**
 * A dónde lleva tocar un lugar del sendero.
 *
 *   · `en_curso` y `terminado` → el reto de ESE lugar (`?habilidad=K07`). El
 *     de hoy y el rejuego son la misma pantalla: una serie de ese tema, con la
 *     dificultad que el motor adaptativo decida dentro de la habilidad — D-017
 *     intacta, el mapa no pregunta nivel.
 *   · `por_visitar` → `null`: el lugar se ve y no se pisa. No es un candado
 *     visual de castigo (guía de estilo): es sencillamente no-enlace.
 *
 * El id viaja en la URL y eso es aceptable: es un identificador opaco del
 * banco, no un dato del niño — el mismo criterio que el `?p=` del PIN.
 */
export function destinoDeLugar(
  locale: string,
  lugar: string,
  estado: "por_visitar" | "en_curso" | "terminado",
): string | null {
  if (estado === "por_visitar") return null;
  return `/${locale}/app/kids/jugar/?habilidad=${encodeURIComponent(lugar)}`;
}
