/**
 * El compañero del mapa — Larry con accesorios. D-080, #235.
 *
 * Módulo PURO. No toca la red, ni la base, y —esto es lo propio de este
 * archivo— **no toca el reloj**. Ver «sin decaimiento», abajo.
 *
 * ─── No es una mascota nueva, y eso lo decidió el dueño ────────────────────
 *
 * D-080 (2026-08-02): el compañero es Larry, que ya existe, ya tiene canon
 * (D-004) y ya tiene continuidad de avatar generada en Recraft. Los cosméticos
 * son **accesorios suyos**, no de un personaje aparte. `mc-43` §7 lo respalda
 * con la investigación de Calvert: un personaje YA familiar enseña mejor que
 * uno nuevo, y la familiaridad de Larry ya está pagada.
 *
 * ─── Sin vida, sin hambre, sin decaimiento. POR CONSTRUCCIÓN ───────────────
 *
 * `mc-43` §6 documenta el caso Tamagotchi con precisión incómoda: tres
 * medidores que bajan solos y una muerte de verdad como estado de fracaso. Le
 * dio 40 millones de unidades en dos años, y le dio funerales de mentira en
 * patios de escuela. **El mecanismo de retención y el patrón oscuro son el
 * mismo mecanismo**: el aparato no funciona como compañero sin la amenaza.
 *
 * La forma barata de evitarlo es una regla escrita. La forma que sobrevive un
 * año es que **no exista un campo que pueda decaer**:
 *
 *   · `EstadoCompanero` tiene DOS campos y los dos son del usuario: si se ve, y
 *     qué lleva puesto. Ninguno se mueve solo.
 *   · Ninguna función de aquí recibe un instante, una fecha ni un «días desde
 *     la última vez». No hay parámetro por el que el tiempo pueda entrar.
 *   · `companion_state` (migración 0010) tiene exactamente esas dos columnas
 *     más las llaves. No hay una tercera en la que meter «felicidad».
 *
 * `audits/companero-sin-decaimiento.mjs` lo hace cumplir por tres vías
 * independientes (D-070): mira este archivo, mira el esquema, y **ejecuta** el
 * módulo comprobando que el estado inicial no tiene una tercera clave.
 *
 * ─── #257: Larry nunca comenta el avatar ni los cosméticos ─────────────────
 *
 * Con D-080 esto importa MÁS, no menos. El tutor que explica el error y el
 * compañero que lleva el sombrero son la misma criatura, así que la frontera
 * entre «te explico qué pasó» y «qué bonito tu sombrero» ya no la dibuja el
 * personaje: hay que dibujarla a mano.
 *
 * `mc-43` implicación 10 dice por qué no es cortesía: *un bot que «felicita» un
 * nombre implícitamente también puede juzgarlo*. Un niño que oye a Larry
 * elogiar su sombrero aprende que Larry mira su sombrero.
 *
 * Aquí se dibuja de la forma más aburrida posible y por eso funciona: **este
 * módulo no puede hablar**. No exporta un solo texto, no importa el tutor, y
 * `ASUNTOS_FUERA_DE_LARRY` existe para que el auditor tenga una lista contra la
 * que cruzar el vocabulario del tutor.
 *
 * ─── Lo que este módulo NO hace ────────────────────────────────────────────
 *
 *  · No otorga cosméticos. Eso es `cosmeticos.ts` y ya existe (#254): este
 *    módulo recibe la lista ya desbloqueada. **No se escribe otro.**
 *  · No conoce precios porque no existen (línea roja #5).
 *  · No sabe qué arte tiene cada accesorio. Guarda ids; el arte es de Recraft y
 *    lo genera el dueño (CLAUDE.md § Imágenes).
 */

import type { TemaVisual } from "./bandas.ts";

/* ────────────────────────────────────────────────────────────────────────────
 * Dónde aparece Larry, que no es lo mismo en las tres formas del mapa
 * ──────────────────────────────────────────────────────────────────────────*/

/**
 * Las tres presencias de `mc-43` §9, tal como D-080 las fijó.
 *
 *   `camina`       — KINDER: avanza por el sendero. Es el mapa.
 *   `en_cada_nodo` — PRIMARIA/SECUNDARIA: aparece en cada nodo alcanzado.
 *   `bajo_peticion`— SERIO/JR/PRO: existe, y solo si lo pides.
 */
export type Presencia = "camina" | "en_cada_nodo" | "bajo_peticion";

/**
 * `Record` completo, no `switch` con `default`: un tema visual nuevo en D-017
 * tiene que romper la compilación aquí, no caer callado en «bajo petición».
 */
export const PRESENCIA_POR_TEMA: Readonly<Record<TemaVisual, Presencia>> = Object.freeze({
  KINDER: "camina",
  PRIMARIA: "en_cada_nodo",
  SECUNDARIA: "en_cada_nodo",
  SERIO: "bajo_peticion",
  PRO: "bajo_peticion",
});

/**
 * Si el compañero se ve **al crear el perfil**.
 *
 * Apagado en SERIO y PRO, y es el primer criterio de #234: *«`visible` se crea
 * en 0 para perfiles cuya `theme_band` corresponde a SERIO/JR/PRO»*. `mc-43` §8
 * lo dice para la banda adulta sin rodeos — *«gamified skin optional and off by
 * default»*— y `mc-23` es de donde sale.
 *
 * No es una opinión sobre los adultos: es que un adulto que abre una
 * herramienta de estudio y encuentra un rinoceronte saludándolo cierra la
 * herramienta. Encenderlo es un toque (`alternarVisible`), y el criterio 2 de
 * #234 exige que ese toque exista y sea del propio usuario.
 */
export const VISIBLE_AL_CREAR: Readonly<Record<TemaVisual, boolean>> = Object.freeze({
  KINDER: true,
  PRIMARIA: true,
  SECUNDARIA: true,
  SERIO: false,
  PRO: false,
});

/* ────────────────────────────────────────────────────────────────────────────
 * El estado — dos campos, y los dos son del usuario
 * ──────────────────────────────────────────────────────────────────────────*/

/**
 * Todo lo que el compañero tiene.
 *
 * Si algún día alguien añade un tercer campo, que lea el bloque «sin
 * decaimiento» de arriba y después el auditor, que va a bloquear el commit.
 * No es un obstáculo burocrático: es el único momento en que se puede detener,
 * porque un medidor de felicidad no rompe nada visible el día que se añade.
 */
export interface EstadoCompanero {
  /** Si se pinta. Lo decide la persona; nada más lo puede cambiar. */
  readonly visible: boolean;
  /** Ids de accesorios equipados, ordenados. Nunca precios, nunca cantidades. */
  readonly accesorios: readonly string[];
}

/**
 * El estado con el que nace un perfil.
 *
 * Sin accesorios: no se regala nada al crear la cuenta. `mc-17` §2 separa las
 * recompensas **informativas** (confirman competencia; no dañan la motivación
 * intrínseca) de las **controladoras** (sí la dañan, y más en niños que en
 * universitarios — Deci, Koestner & Ryan 1999, 128 estudios). Un accesorio
 * regalado por existir no confirma ninguna competencia.
 */
export function estadoInicial(tema: TemaVisual): EstadoCompanero {
  return { visible: VISIBLE_AL_CREAR[tema], accesorios: [] };
}

/**
 * Enciende o apaga el compañero. Es la única forma de que `visible` cambie.
 *
 * Recibe el valor, no lo alterna a ciegas: un interruptor idempotente es el que
 * aguanta un doble toque en un Android de gama baja sin dejar la pantalla
 * diciendo lo contrario de lo que el servidor guardó.
 */
export function ponerVisible(estado: EstadoCompanero, visible: boolean): EstadoCompanero {
  return estado.visible === visible ? estado : { ...estado, visible };
}

/**
 * Equipa accesorios, y **solo los que ya están desbloqueados**.
 *
 * Determinista y ordenado, mismo contrato que `cosmeticosQueDesbloquea()`: dos
 * consultas a D1 que devuelvan las mismas filas en otro orden tienen que dar el
 * mismo Larry. Un compañero que cambia de sombrero al recargar no es un bug
 * gracioso: es la señal de que en algún sitio hay azar, y el azar en el camino
 * de recompensa es lo que la línea roja #5 prohíbe.
 *
 * Lo que se pide y no está desbloqueado **se descarta en silencio**, no lanza:
 * la lista de desbloqueados encoge de verdad —un cosmético retirado del
 * catálogo— y un perfil no puede quedarse sin poder pintar su mapa por eso.
 */
export function equipar(
  estado: EstadoCompanero,
  pedidos: readonly string[],
  desbloqueados: readonly string[],
): EstadoCompanero {
  const permitidos = new Set(desbloqueados);
  const puestos = new Set<string>();
  for (const id of pedidos) {
    if (permitidos.has(id)) puestos.add(id);
  }
  return { ...estado, accesorios: [...puestos].sort() };
}

/* ────────────────────────────────────────────────────────────────────────────
 * La frontera con el tutor (#257)
 * ──────────────────────────────────────────────────────────────────────────*/

/**
 * De qué NO habla Larry, ni para bien.
 *
 * Es una lista de asuntos, no de palabras: el auditor la usa para cruzar el
 * vocabulario del tutor, y quien añada una superficie de identidad nueva la
 * añade aquí en vez de recordar la regla.
 *
 * «Ni para bien» es la parte que se olvida. `mc-43` implicación 10: un bot que
 * felicita un nombre es el mismo bot que puede juzgarlo, y el niño no distingue
 * las dos cosas — distingue que lo están mirando.
 */
export const ASUNTOS_FUERA_DE_LARRY: readonly string[] = Object.freeze([
  "alias",
  "avatar",
  "accesorio",
  "cosmetico",
  "apariencia",
]);

/**
 * `true` si el compañero puede aparecer en esta forma de mapa sin que nadie lo
 * pida. Es la lectura de `PRESENCIA_POR_TEMA` que la plantilla necesita, escrita
 * una vez para que no se escriba dos.
 */
export function apareceSolo(tema: TemaVisual): boolean {
  return PRESENCIA_POR_TEMA[tema] !== "bajo_peticion";
}

/* ────────────────────────────────────────────────────────────────────────────
 * El SQL — declarado aquí para que el esquema y el código no se separen
 * ──────────────────────────────────────────────────────────────────────────*/

/**
 * Las columnas de `companion_state`, en el orden de la migración 0010.
 *
 * Se declara aquí y el auditor la cruza contra el `CREATE TABLE`. Es el mismo
 * patrón de dos fuentes independientes que `cosmeticos-deterministas.mjs` usa
 * con `TIPOS_DE_EVENTO`: si el SQL gana una columna que este arreglo no conoce,
 * existe un campo que nadie lee — y el campo que nadie lee es exactamente donde
 * aterriza un medidor de hambre dentro de un año.
 */
export const COLUMNAS_COMPANION_STATE: readonly string[] = Object.freeze([
  "id",
  "child_profile_id",
  "user_id",
  "visible",
  "accessory_ids",
]);

export const SQL_UPSERT_COMPANERO = `
INSERT INTO companion_state (id, child_profile_id, user_id, visible, accessory_ids)
VALUES (?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  visible       = excluded.visible,
  accessory_ids = excluded.accessory_ids
`.trim();
