/**
 * Nombre + `@usuario` del adulto (D-197) — la PRIMERA superficie de texto
 * libre de todo el producto visible a otros usuarios.
 *
 * ─── Por qué esto existe y por qué es distinto de `alias.ts` ───────────────
 *
 * `alias.ts` genera un identificador — el niño y el adulto (D-003,
 * `migrations/0012`) nunca ESCRIBEN el suyo, así que nunca hacía falta
 * filtrar nada: lo único que podía aparecer en un tablero público era una
 * combinación ya aprobada de una lista corta y curada.
 *
 * D-197 reversa esa regla PUNTUALMENTE para el adulto: su nombre y su
 * `@usuario` ahora sí son texto que él mismo escribe, y sí son públicos. Eso
 * convierte esto en la primera superficie del producto que necesita un
 * filtro de contenido — nadie más escribe texto que otros usuarios vean.
 *
 * **Esto es un filtro V1, deliberadamente no exhaustivo.** Lista de bloqueo
 * por substring, sin aprendizaje, sin variantes leetspeak más allá de la
 * normalización de acentos/mayúsculas. No hay reporte de usuarios, no hay
 * revisión humana, no hay apelación — ese pipeline de moderación completo
 * queda fuera de este alcance (D-197, D-032: se anota como residuo
 * conocido, no como resuelto). Ampliar la lista es contenido — igual que
 * `alias.ts` dice de la suya — y se hace con cuidado, no en automático.
 *
 * El niño NUNCA gana estos campos: no hay `display_name`/`username` en
 * `child_profiles`, por diseño (D-013, línea roja #2, línea roja #3).
 */

/**
 * Normaliza para comparar contra la lista de bloqueo — misma técnica que
 * `alias.ts::normalizar()`: sin acentos, sin mayúsculas, sin espacios ni
 * signos. Un nombre real SÍ puede llevar espacios/acentos al guardarse
 * ("Esteban Rey") — esta función es solo para la comparación contra la
 * lista, nunca para transformar el valor que se guarda.
 */
export function normalizarParaFiltro(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Lista de bloqueo por substring, sin distinguir locale — a diferencia de
 * `alias.ts` (donde cada locale tiene su propia lista de combinaciones
 * curadas), aquí el texto es libre y arbitrario, así que un insulto en
 * cualquiera de los idiomas del producto debe bloquearse sin importar en
 * qué locale esté la cuenta. Corta a propósito en esta primera versión —
 * ver el encabezado del archivo.
 */
const BLOQUEO: readonly string[] = [
  // Inglés
  "fuck", "shit", "bitch", "asshole", "nigger", "faggot", "cunt",
  // Español (ambos dialectos)
  "puta", "puto", "pendejo", "mierda", "cabron", "verga", "chinga",
  // Francés
  "putain", "merde", "connard", "salope",
  // Portugués (ambos dialectos)
  "porra", "caralho", "buceta", "puta",
  // Alemán
  "scheisse", "arschloch", "hurensohn",
  // Suplantación del equipo/la mascota — nadie se hace pasar por soporte ni por Larry.
  // (El dueño de este producto SE LLAMA "Kilowatto" — no se bloquea su propia marca.)
  "admin", "administrador", "moderador", "soporte", "larry",
];

/** ¿Esta cadena, tal cual se guardaría, contiene algo de la lista de bloqueo? */
export function contieneBloqueado(texto: string): boolean {
  const n = normalizarParaFiltro(texto);
  return BLOQUEO.some((malo) => n.includes(normalizarParaFiltro(malo)));
}

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const DISPLAY_NAME_MAX = 40;

export interface ResultadoValidacion {
  valido: boolean;
  /** Motivo, en clave — nunca texto ya traducido, igual que el resto de errores del API (ver `api/perfil-nuevo.ts`). */
  razon?: "formato" | "bloqueado" | "vacio";
}

/**
 * `username` — el handle público (`@algo`). Reglas de formato: minúsculas,
 * dígitos y guion bajo, empieza con letra, sin guiones bajos consecutivos.
 * El `@` NO se guarda como parte del valor — es un adorno de presentación,
 * igual que el signo de la moneda nunca se guarda junto al número.
 */
export function validarUsername(valor: string): ResultadoValidacion {
  if (!valor) return { valido: false, razon: "vacio" };
  const formato = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
  if (
    valor.length < USERNAME_MIN ||
    valor.length > USERNAME_MAX ||
    !formato.test(valor)
  ) {
    return { valido: false, razon: "formato" };
  }
  if (contieneBloqueado(valor)) return { valido: false, razon: "bloqueado" };
  return { valido: true };
}

/**
 * `display_name` — el nombre para mostrar. Menos restringido en formato
 * (permite espacios, acentos, mayúsculas — es un nombre real) pero pasa
 * por el mismo filtro de bloqueo.
 */
export function validarDisplayName(valor: string): ResultadoValidacion {
  const recortado = valor.trim();
  if (!recortado) return { valido: false, razon: "vacio" };
  if (recortado.length > DISPLAY_NAME_MAX) return { valido: false, razon: "formato" };
  if (contieneBloqueado(recortado)) return { valido: false, razon: "bloqueado" };
  return { valido: true };
}
