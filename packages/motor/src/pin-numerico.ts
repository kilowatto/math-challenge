/**
 * El PIN numérico — PRIMARIA y SECUNDARIA (D-197 §2).
 *
 * ─── Por qué existe junto a `pin-imagenes.ts`, no en su lugar ──────────────
 *
 * KINDER sigue con el PIN de tres dibujos (línea roja #3: un niño que no lee
 * no puede usar un teclado). PRIMARIA/SECUNDARIA sí reconocen dígitos con
 * soltura, y el dueño decidió que un teclado numérico de 4 dígitos es más
 * rápido de tocar que buscar tres dibujos en una rejilla de nueve — sigue
 * siendo tocar símbolos de un conjunto fijo (0-9), nunca texto libre, así
 * que la línea roja #3 sigue intacta.
 *
 * ─── Sin la rejilla, porque no hace falta ──────────────────────────────────
 *
 * `pin-imagenes.ts` deriva una rejilla ALEATORIA por niño porque los DIBUJOS
 * hay que elegirlos de un catálogo — la posición de "sol" no es universal.
 * Un dígito ya es universal (el "3" siempre es el mismo símbolo para
 * cualquier niño), así que no hay nada que derivar ni esconder ahí: el PIN
 * en sí (los cuatro dígitos elegidos) es el único secreto, igual que un PIN
 * de teléfono.
 *
 * ─── Guardado igual que el de imágenes: hasheado, salado con el id ─────────
 *
 * Mismo HKDF-SHA256 que `pin-imagenes.ts::hashearPin`, mismo secreto
 * (`PIN_PAD_SECRET`) — la sal es el `childProfileId`, así que dos niños con
 * el mismo PIN de cuatro dígitos tienen hashes distintos. `info` lleva un
 * prefijo distinto (`pin-numerico:` en vez de `pin:`) para que el mismo
 * secreto nunca produzca el mismo material entre los dos sistemas.
 */

const ENC = new TextEncoder();

/** Cuántos dígitos. Repetidos permitidos (un PIN de teléfono típico también los permite). */
export const LARGO_PIN_NUMERICO = 4;

async function derivarHash(secreto: string, childProfileId: string, digitos: number[]): Promise<string> {
  const clave = await crypto.subtle.importKey("raw", ENC.encode(secreto), "HKDF", false, ["deriveBits"]);
  const material = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: ENC.encode(childProfileId),
      info: ENC.encode(`pin-numerico:${digitos.join("")}`),
    },
    clave,
    32 * 8,
  );
  return [...new Uint8Array(material)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** ¿Son cuatro dígitos válidos (0-9 cada uno)? Repetidos permitidos, a diferencia del PIN de imágenes. */
export function pinNumericoValido(digitos: number[]): boolean {
  if (!Array.isArray(digitos) || digitos.length !== LARGO_PIN_NUMERICO) return false;
  return digitos.every((d) => Number.isInteger(d) && d >= 0 && d <= 9);
}

/** Hashea un PIN numérico para guardarlo en `child_image_pin` (columna `tipo = 'numerico'`). */
export async function hashearPinNumerico(
  secreto: string,
  childProfileId: string,
  digitos: number[],
): Promise<string> {
  if (!pinNumericoValido(digitos)) throw new Error("pin-numerico: dígitos inválidos");
  return derivarHash(secreto, childProfileId, digitos);
}

/**
 * Compara dos hashes de PIN en tiempo constante — misma técnica que
 * `pin-imagenes.ts::pinesIguales`, duplicada aquí a propósito: son dos
 * sistemas de PIN independientes, y una función compartida acoplaría dos
 * módulos que no necesitan saber nada el uno del otro.
 */
export function pinesNumericosIguales(a: string, b: string): boolean {
  let dif = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) dif |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return dif === 0;
}

/** Cuántas combinaciones hay. Se publica para que nadie la confunda con seguridad (D-012: el dispositivo protege, no el PIN). */
export const COMBINACIONES_PIN_NUMERICO = 10 ** LARGO_PIN_NUMERICO; // 10,000
