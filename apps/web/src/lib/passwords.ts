/**
 * La contraseña de respaldo. Criterio #112 de F2, D-038.
 *
 * **No es el camino principal y el código no debe hacerla parecer uno.** D-038
 * dice passkey primero; esto existe porque el mercado objetivo incluye Android de
 * gama baja donde el autenticador falla o no está, y porque dejar a alguien
 * fuera de su propia cuenta por no tener el teléfono bueno es peor que un hash.
 *
 * ─── PBKDF2 y no Argon2id, y hay que decir por qué ──────────────────────────
 *
 * Argon2id es la recomendación de OWASP para contraseñas nuevas. **No corre
 * nativo en Workers**: exige WASM, y meter un WASM de cripto en el bundle de un
 * producto cuyo dispositivo de referencia es Android de gama baja sobre 4G lento
 * cuesta bytes en la primera carga (`mc-47` §5). PBKDF2-HMAC-SHA256 sí está en
 * WebCrypto, que ya está en el runtime y pesa cero.
 *
 * El costo de esa elección, dicho sin adornos: PBKDF2 es más barato de atacar
 * con GPU que Argon2id, porque no usa memoria. Se compensa con iteraciones —
 * abajo— pero no se elimina. El día que Workers traiga Argon2id nativo, esto se
 * migra, y por eso el hash guarda su algoritmo adentro (ver `PHC`).
 *
 * ─── 600 000 iteraciones, MEDIDAS ──────────────────────────────────────────
 *
 * El criterio #112 dice literal que «el costo de CPU de las iteraciones se mide
 * dentro del límite del Worker antes de fijar el número; hoy nadie lo ha
 * medido». Se midió, dentro de **workerd** —el runtime real, no Node—, con
 * `crypto.subtle.deriveBits`, 7 repeticiones por punto y una vuelta en frío
 * descartada:
 *
 *     100 000 iter →  6 ms      600 000 iter → 36 ms
 *     210 000 iter → 12 ms    1 000 000 iter → 60 ms
 *     310 000 iter → 18 ms
 *
 * El límite de CPU por invocación en el plan de pago es **30 000 ms** por
 * defecto (hasta 300 000 con `limits.cpu_ms`). A 600 000 iteraciones se gasta el
 * **0.12%** de ese presupuesto.
 *
 * **La CPU no es la restricción, y esa es la conclusión de la medición.** Se
 * eligen 600 000 porque es lo que OWASP recomienda para PBKDF2-SHA256, no porque
 * el límite obligue a bajar de ahí.
 *
 * **Lo que la medición NO dice.** Se corrió en workerd local, sobre un Apple
 * Silicon. Una máquina del borde de Cloudflare es más lenta; si lo fuera 5×,
 * serían ~180 ms, que sigue siendo el 0.6% del límite y sigue siendo una latencia
 * aceptable para un inicio de sesión. Volver a medirlo contra el borde real es
 * trabajo pendiente y está dicho aquí para que no se suponga hecho.
 */

const ENC = new TextEncoder();

/**
 * Iteraciones. Ver el bloque de arriba: no sale de una tabla copiada, sale de
 * OWASP y de una medición que dice que caben de sobra.
 */
export const ITERACIONES = 600_000;

/** 16 bytes de sal. Es lo que recomienda NIST SP 800-132 como mínimo. */
const BYTES_SAL = 16;

/** 256 bits de salida, que es el tamaño natural de SHA-256. */
const BITS_DERIVADOS = 256;

const b64 = (b: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(b as ArrayBuffer)));

const deB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function derivar(password: string, sal: Uint8Array, iteraciones: number): Promise<ArrayBuffer> {
  const material = await crypto.subtle.importKey("raw", ENC.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: sal as BufferSource, iterations: iteraciones },
    material,
    BITS_DERIVADOS,
  );
}

/**
 * La cadena PHC que se guarda en `user_password.password_hash`.
 *
 *     $pbkdf2-sha256$i=600000$<sal base64>$<hash base64>
 *
 * **El algoritmo y las iteraciones van DENTRO del hash**, y eso no es adorno: es
 * lo que permite subir las iteraciones —o cambiar de algoritmo— sin adivinar
 * cómo se hasheó cada fila. Sin ese prefijo, el día que 600 000 se quede corto
 * habría que elegir entre invalidar todas las contraseñas o dejarlas débiles para
 * siempre. La migración `0001_identity.sql` ya lo pedía por escrito: «cadena PHC
 * completa, con el algoritmo adentro».
 */
export interface PHC {
  algoritmo: "pbkdf2-sha256";
  iteraciones: number;
  sal: Uint8Array;
  hash: Uint8Array;
}

export async function hashear(password: string, iteraciones = ITERACIONES): Promise<string> {
  const sal = crypto.getRandomValues(new Uint8Array(BYTES_SAL));
  const hash = await derivar(password, sal, iteraciones);
  return `$pbkdf2-sha256$i=${iteraciones}$${b64(sal)}$${b64(hash)}`;
}

export function leerPHC(cadena: string): PHC | null {
  const m = /^\$pbkdf2-sha256\$i=(\d+)\$([A-Za-z0-9+/=]+)\$([A-Za-z0-9+/=]+)$/.exec(cadena);
  if (!m) return null;
  const iteraciones = Number(m[1]);
  if (!Number.isSafeInteger(iteraciones) || iteraciones < 1) return null;
  try {
    return { algoritmo: "pbkdf2-sha256", iteraciones, sal: deB64(m[2]), hash: deB64(m[3]) };
  } catch {
    return null;
  }
}

/**
 * Compara dos secuencias en tiempo constante.
 *
 * Un `===` sobre cadenas base64 sale antes en el primer byte distinto, y esa
 * diferencia de tiempo es medible por la red. No es un ataque teórico contra un
 * hash de contraseña —hay que adivinar el hash, no la contraseña— pero cuesta
 * cuatro líneas y quita una clase entera de preguntas incómodas.
 *
 * Se recorre SIEMPRE el largo del esperado, y la diferencia de largo se acumula
 * en el mismo acumulador en vez de salir temprano.
 */
function igualesEnTiempoConstante(a: Uint8Array, b: Uint8Array): boolean {
  let dif = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) dif |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return dif === 0;
}

/**
 * Verifica una contraseña contra su cadena PHC.
 *
 * Devuelve además si el hash está **desactualizado**: guardado con menos
 * iteraciones de las que hoy se exigen. Quien llama tiene ahí la oportunidad de
 * re-hashear con la contraseña en claro, que es el único momento en que la
 * tiene. Sin ese dato, subir `ITERACIONES` no protege a nadie que ya existiera.
 */
export async function verificar(
  password: string,
  cadena: string,
): Promise<{ ok: boolean; desactualizado: boolean }> {
  const phc = leerPHC(cadena);
  if (!phc) return { ok: false, desactualizado: false };
  const derivado = new Uint8Array(await derivar(password, phc.sal, phc.iteraciones));
  const ok = igualesEnTiempoConstante(derivado, phc.hash);
  return { ok, desactualizado: ok && phc.iteraciones < ITERACIONES };
}

/**
 * Lo mínimo que se le exige a una contraseña, y lo que deliberadamente NO.
 *
 * **No hay reglas de composición.** Nada de «una mayúscula, un número, un
 * símbolo». NIST SP 800-63B las retiró en 2017 porque producen `Password1!` —
 * predecible para una máquina y difícil para una persona— y porque empujan a
 * escribirla en un papel. Lo que queda es largo mínimo, que es lo que de verdad
 * mueve la entropía.
 *
 * **8 y no 12**: es el mínimo de NIST, y esta contraseña es el RESPALDO de una
 * passkey (D-038). Exigir 12 en el camino de respaldo de alguien cuyo
 * autenticador acaba de fallar es cobrarle dos veces el mismo problema.
 *
 * **64 de máximo, no menos**: NIST exige aceptar al menos 64. Un tope bajo es
 * señal de que alguien está guardando la contraseña sin hashear.
 */
export const LARGO_MINIMO = 8;
export const LARGO_MAXIMO = 64;

export function largoValido(password: string): boolean {
  // Se cuenta por puntos de código, no por unidades UTF-16: un emoji cuenta 1,
  // no 2. Contarlo como 2 haría que una contraseña de 5 emojis «pasara» un
  // mínimo de 8 sin tener 8 caracteres para quien la escribió.
  const largo = [...password].length;
  return largo >= LARGO_MINIMO && largo <= LARGO_MAXIMO;
}
