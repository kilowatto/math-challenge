/**
 * El motor puro de los grupos infantiles. F9 · issues #379-#387.
 *
 * D-027, D-043, D-086, D-087, D-088, y el reparto de detalle del orquestador
 * (D-099 el código de unión, D-100 los topes, D-101 el toggle de ranking en la
 * aprobación). Investigación: mc-28, mc-46.
 *
 * ─── Qué vive aquí, y por qué no en una ruta ───────────────────────────────
 *
 * Las tres reglas que un salón y un club de papás comparten SIEMPRE, porque
 * son la misma superficie con dos orígenes (F9 §2): cómo es un código de
 * unión, cuántos niños caben, y quién aparece en una vista ordenada por
 * posición. Si esto viviera en las rutas habría dos copias —una por origen—
 * y el día que alguien ablandara una, el club y el salón tendrían protecciones
 * distintas sin que nadie lo decidiera.
 *
 * ─── Lo que este módulo NO hace ─────────────────────────────────────────────
 *
 *  · **No genera alias.** Eso es `alias.ts`, el único generador;
 *    `audits/alias-nunca-nombre.mjs` bloquea un segundo.
 *  · **No calcula puntos ni rachas.** Los recibe ya calculados — este módulo
 *    solo decide quién se muestra y con qué tope.
 *  · **No sabe nada de chat.** Un grupo infantil no tiene chat en ninguna
 *    dirección (línea roja #3), así que aquí no hay ninguna forma de mensaje:
 *    no es que esté prohibido escribirlo, es que no hay función que lo lleve.
 */

// ---------------------------------------------------------------------------
// El código de unión — 6 caracteres, sin ambiguos (D-099 del reparto)
// ---------------------------------------------------------------------------

/**
 * El alfabeto del código. Sin `0/O`, sin `1/I/L`: un código que un niño le
 * dicta a su papá no puede depender de distinguir la letra O del cero.
 *
 * 32 caracteres × 6 posiciones ≈ 1.07 × 10⁹ códigos — el mismo orden de
 * entropía que las cookies `mc_h`/`mc_s` piden a D-052, y sobrado para que
 * adivinar el código de un grupo ajeno por fuerza bruta no sea una vía (a lo
 * que se suma que el código solo produce una SOLICITUD pendiente: quien entra
 * lo decide el padre del niño, no el código).
 */
export const ALFABETO_CODIGO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ" as const;

/** Los seis caracteres de D-099. La migración 0017 lleva el CHECK gemelo. */
export const LONGITUD_CODIGO = 6 as const;

/**
 * Genera un código de unión.
 *
 * `azar` es inyectable para que la prueba no dependa del azar real; en
 * producción lo alimenta `crypto.getRandomValues` desde la ruta. Con
 * `Math.random` el código sería predecible — y un código predecible es una
 * solicitud de unión que nadie pidió.
 */
export function generarCodigoDeUnion(azar: () => number): string {
  let codigo = "";
  for (let i = 0; i < LONGITUD_CODIGO; i++) {
    const r = azar();
    codigo += ALFABETO_CODIGO[Math.floor(r * ALFABETO_CODIGO.length) % ALFABETO_CODIGO.length];
  }
  return codigo;
}

/** Lo que teclea un padre puede venir en minúsculas o con espacios. */
export function normalizarCodigoDeUnion(entrada: string): string {
  return entrada.trim().toUpperCase();
}

/**
 * ¿Tiene forma de código de unión? Longitud exacta y solo caracteres del
 * alfabeto. No dice que el código EXISTA — eso solo lo sabe D1 — dice que no
 * hace falta ir a la base para rechazar un `HOLA!!`.
 */
export function codigoDeUnionEsValido(codigo: string): boolean {
  if (codigo.length !== LONGITUD_CODIGO) return false;
  for (const c of codigo) if (!ALFABETO_CODIGO.includes(c)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Los topes (D-087, D-100 del reparto)
// ---------------------------------------------------------------------------

/**
 * El tope DURO de cualquier grupo: 35 niños, el extremo alto del rango de
 * salón que fija D-087. La migración 0017 lleva el mismo número en el CHECK
 * de `max_size` y en el trigger de cupo — la constante y la base son gemelos,
 * y `audits/grupo-sin-chat.mjs` los cruza.
 */
export const TOPE_DURO_GRUPO = 35 as const;

/**
 * El tope por origen.
 *
 * Salón: 30-35 (D-087, el mismo rango que el master-plan ya citaba). El club
 * de papás va por debajo a propósito (D-027): mezcla familias sin vínculo
 * previo (D-088) y su mitigación es el aislamiento de contacto, no el tamaño —
 * pero un tope menor reduce lo que un solo dueño sin verificar puede juntar
 * antes de que cualquier padre apruebe nada (mc-28: la creación masiva es la
 * palanca principal de un abusador).
 */
export const TOPE_SALON = 35 as const;
export const TOPE_CLUB_PAPAS = 12 as const;

/**
 * Cuántos grupos puede crear una misma cuenta (D-087: «límite de creación de
 * grupos por cuenta»). Sin él, el tope de tamaño se esquiva creando veinte
 * grupos en vez de uno grande.
 */
export const GRUPOS_POR_CUENTA = 5 as const;

export type OrigenDeGrupo = "salon" | "club_papas";

/** El máximo de niños que un grupo de ese origen puede declarar. */
export function topePorOrigen(origen: OrigenDeGrupo): number {
  return origen === "salon" ? TOPE_SALON : TOPE_CLUB_PAPAS;
}

/**
 * ¿Es válido este `max_size` para este origen? La ruta de creación pasa por
 * aquí y JAMÁS escribe el número que el cliente mandó sin más: un salón con
 * `max_size = 35` es legítimo; un club de papás con `max_size = 35` es el
 * tope del salón aplicado al origen equivocado.
 */
export function maxSizeEsValido(origen: OrigenDeGrupo, maxSize: number): boolean {
  return (
    Number.isInteger(maxSize) && maxSize >= 1 && maxSize <= topePorOrigen(origen)
  );
}

// ---------------------------------------------------------------------------
// El ranking opt-in (D-087, D-101 del reparto)
// ---------------------------------------------------------------------------

/**
 * ¿Aparece esta membresía en una vista ordenada por posición?
 *
 * Solo si el PADRE lo activó (`leaderboard_opt_in = 1`) — al aprobar la
 * entrada o después, desde su propio panel; nunca lo activa el dueño del
 * grupo por el niño. Con 0, el niño sigue en el roster del dueño (alias,
 * racha y puntos — eso no es ranking, es la visibilidad mínima que D-027 ya
 * autoriza) pero no aparece en NINGUNA vista ordenada del grupo.
 *
 * Es una función y no un `if` suelto en cada consulta por la misma razón que
 * el tope: dos copias de la regla son dos oportunidades de ablandar una.
 */
export function visibleEnTablaDePosiciones(leaderboardOptIn: 0 | 1): boolean {
  return leaderboardOptIn === 1;
}

// ---------------------------------------------------------------------------
// Los motivos de reporte (issue #385)
// ---------------------------------------------------------------------------

/**
 * El catálogo CERRADO de `child_group_report.reason_code`. La migración 0017
 * lleva el CHECK gemelo con estos mismos cinco valores, y
 * `audits/grupo-sin-chat.mjs` cruza las dos listas: un motivo que exista en
 * una sola es o texto libre disfrazado o un reporte que la base rechaza.
 *
 * Nunca texto libre, aunque quien reporta sea un adulto (línea roja #3 por
 * consistencia de esquema, F9 §7): el estado del grupo al momento del reporte
 * se reconstruye de D1 — `child_group_membership` no se borra jamás — así que
 * nadie necesita describir nada.
 */
export const CODIGOS_DE_REPORTE = [
  /** La identidad declarada del dueño no parece real. */
  "IDENTIDAD_SOSPECHOSA",
  /** Intento de contacto fuera del producto. */
  "CONTACTO_INDEBIDO",
  /** Contenido inapropiado. */
  "CONTENIDO_INAPROPIADO",
  /** La mezcla de niños no parece un salón o club real. */
  "TAMANIO_O_COMPOSICION_SOSPECHOSA",
  /** Ninguno de los anteriores. Sigue sin ser texto libre. */
  "OTRO",
] as const;

export type CodigoDeReporte = (typeof CODIGOS_DE_REPORTE)[number];
