/**
 * Presentar un ítem: de la estructura a lo que la pantalla pinta.
 *
 * Nació en el Worker de ingesta (`apps/ingest/src/index.ts`, `presentarItem`)
 * para KINDER, y se extrae aquí cuando F5c añade un SEGUNDO origen de ítems —
 * el banco de primaria en D1 (D-072), que se lee desde el Worker web. Dos
 * orígenes, una forma de presentar: si cada uno compusiera el enunciado y
 * barajara las opciones por su cuenta, las dos copias se desincronizarían, que
 * es exactamente cómo `casilla3` acabó en un botón (#349).
 *
 * Deuda declarada: la ingesta conserva su propia copia de esta lógica porque
 * `apps/ingest/` quedó fuera del territorio de F5c. Migrarla a este módulo es
 * un cambio de una línea que NO se hizo, y queda dicho en el PR.
 *
 * ─── Las dos reglas que este módulo hace cumplir ───────────────────────────
 *
 *  1. **La respuesta correcta no viaja marcada.** Las opciones salen mezcladas
 *     y sin bandera; el servidor califica lo que se tocó. Un `{correcta: true}`
 *     pondría la respuesta en el HTML de una pantalla infantil.
 *  2. **El texto de una opción jamás es su valor crudo** (#349). Un número se
 *     escribe con `formatear()` y la convención del locale (mc-34); un valor
 *     de cadena solo se presenta por su `dibujo`, que el ítem declara y
 *     `validarItem` exige.
 *
 * ─── El barajado es DETERMINISTA por ítem ──────────────────────────────────
 *
 * `Math.random()` haría que recargar la página cambiara el orden, y a un niño
 * eso le parece que las cosas se mueven solas. El orden sale de un hash del
 * `itemId`, así que el mismo ítem se ve siempre igual y dos ítems distintos no
 * comparten patrón.
 */

import { formatear, type Locale } from "./numeros.ts";
import type { Item } from "./item.ts";

/** Lo que la pantalla recibe por ítem. Nada de esto revela la respuesta. */
export interface ItemPresentado {
  id: string;
  habilidad: string;
  nivel: number;
  formato: string;
  /** El enunciado ya escrito en el locale, con sus números ya formateados. */
  enunciado: string;
  /** Las variables ya formateadas, por si la pantalla dibuja con ellas. */
  vars: Record<string, string>;
  opciones: Array<{
    valor: number | string;
    /** El texto visible si es número; el NOMBRE ACCESIBLE si es dibujo. */
    texto: string;
    /** Cómo se DIBUJA la opción cuando no es un número (#349). */
    dibujo?: { glifo: string; cuantos: number; grande: boolean };
  }>;
}

/**
 * Prepara un ítem para la pantalla.
 *
 * `mensajes` es el catálogo `i18n/reto/<locale>.json`: las plantillas de
 * enunciado y los nombres accesibles de las opciones dibujadas viven ahí,
 * autorados por locale (D-022) — este módulo no escribe ni una palabra.
 */
export function presentarItemEstructura(
  item: Item,
  locale: Locale,
  mensajes: Record<string, unknown>,
): ItemPresentado {
  const vars: Record<string, string> = {};
  for (const [k, v] of Object.entries(item.enunciado.vars)) {
    vars[k] = typeof v === "number" ? formatear(v, locale) : String(v);
  }
  const plantilla = mensajes[item.enunciado.clave];
  const enunciado =
    typeof plantilla === "string"
      ? plantilla.replace(/\{(\w+)\}/g, (_m, k) => vars[k] ?? `{${k}}`)
      : item.enunciado.clave;

  // La correcta más los distractores CON CAUSA. Un distractor sin causa no
  // entra: es lo que permite que Larry sepa qué error se cometió y no solo
  // que se falló (CLAUDE.md § Contenido).
  const crudas = [
    item.respuesta.valor,
    ...item.errores.map((e) => e.valor),
    ...(item.tambienCorrectas ?? []).map((a) => a.valor),
  ];
  const unicas = [...new Set(crudas)];

  // ── Las opciones DIBUJADAS no se barajan: su orden es la disposición ──────
  //
  // Barajar «3, 5, 4» solo cambia dónde está el 3. Barajar cuatro figuras de
  // «cuál sobra» cambia el DIBUJO — el intruso deja de estar donde el ítem lo
  // puso. Lo que el barajado protegía —que la respuesta no caiga siempre en la
  // misma casilla— es responsabilidad del banco, no de esta función.
  if (item.dibujos) {
    const declarado = Object.keys(item.dibujos);
    unicas.sort((a, b) => {
      const ia = declarado.indexOf(String(a));
      const ib = declarado.indexOf(String(b));
      return (ia === -1 ? declarado.length : ia) - (ib === -1 ? declarado.length : ib);
    });
  } else {
    // Barajado determinista: hash del id, mezcla de Fisher-Yates con ese hash
    // como semilla. Ver el encabezado.
    let semilla = 0;
    for (let i = 0; i < item.id.length; i++) semilla = (semilla * 31 + item.id.charCodeAt(i)) & 0x7fffffff;
    const siguiente = () => ((semilla = (semilla * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    for (let i = unicas.length - 1; i > 0; i--) {
      const j = Math.floor(siguiente() * (i + 1));
      [unicas[i], unicas[j]] = [unicas[j], unicas[i]];
    }
  }

  return {
    id: item.id,
    habilidad: item.habilidad,
    nivel: item.nivel,
    formato: item.formato,
    enunciado,
    vars,
    opciones: unicas.map((v) => {
      if (typeof v === "number") return { valor: v, texto: formatear(v, locale) };
      const dib = item.dibujos?.[String(v)];
      if (!dib) {
        // No debería llegar aquí: `validarItem` bloquea el ítem antes, y el
        // auditor del banco lo ejecuta sobre la siembra entera. Si llega, se
        // sirve el valor y se acepta que es feo — negarle el ítem a alguien
        // que está jugando es peor (línea roja #4).
        return { valor: v, texto: String(v) };
      }
      const nombre = mensajes[dib.clave];
      return {
        valor: v,
        texto: typeof nombre === "string" ? nombre : dib.clave,
        dibujo: {
          glifo: dib.glifo,
          cuantos: dib.cuantos ?? 1,
          grande: dib.grande === true,
        },
      };
    }),
  };
}
