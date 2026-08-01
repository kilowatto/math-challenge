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
 * ─── El trabajo total son 600 000 iteraciones, y se midió ────────────────
 *
 * El criterio #112 dice literal que «el costo de CPU de las iteraciones se mide
 * dentro del límite del Worker antes de fijar el número; hoy nadie lo ha
 * medido». Se midió dentro de **workerd**, con `crypto.subtle.deriveBits`, 7
 * repeticiones por punto y una vuelta en frío descartada:
 *
 *     100 000 iter →  6 ms      600 000 iter → 36 ms
 *     210 000 iter → 12 ms    1 000 000 iter → 60 ms
 *     310 000 iter → 18 ms
 *
 * El límite de CPU del plan de pago es **30 000 ms** por invocación (hasta
 * 300 000 con `limits.cpu_ms`). 36 ms es el **0.12%** de ese presupuesto: la CPU
 * no es la restricción, ni de lejos.
 *
 * **Pero había un segundo límite que esa medición no podía ver, y es el que
 * mandó.** Está explicado abajo, en `ITERACIONES_POR_RONDA`: el runtime
 * desplegado rechaza cualquier PBKDF2 de más de 100 000 iteraciones, y workerd
 * local no. Las 600 000 se consiguen encadenando seis rondas de 100 000, con el
 * mismo costo medido y el mismo trabajo para quien ataque.
 */

const ENC = new TextEncoder();

/**
 * ─── EL TOPE QUE LA MEDICIÓN NO VIO, Y CÓMO SE RODEA ────────────────────────
 *
 * **Cloudflare no acepta más de 100 000 iteraciones de PBKDF2 en producción.**
 * No es lentitud: es un rechazo duro del runtime desplegado.
 *
 *     NotSupportedError: Pbkdf2 failed: iteration counts above 100000
 *     are not supported (requested 600000).
 *
 * **`workerd` local NO aplica ese tope.** Ahí se midió hasta 1 000 000 sin una
 * sola queja, y el número quedó fijado en 600 000 con la conciencia tranquila.
 * El fallo apareció en el primer POST real contra el borde, con el registro ya
 * desplegado: 500 en la cara de quien intentara crear una cuenta.
 *
 * Es la lección más cara de esta fase y hay que dejarla escrita: **medir en
 * workerd local mide el TIEMPO, no las restricciones del runtime desplegado.**
 * Lo que el criterio #112 pedía —«se mide dentro del límite del Worker»— tiene
 * dos límites, y solo uno se ve desde la laptop.
 *
 * ─── La vuelta: encadenar, no rendirse ─────────────────────────────────────
 *
 * Se hacen `RONDAS` derivaciones de `ITERACIONES_POR_RONDA` cada una,
 * alimentando cada salida a la siguiente. El atacante tiene que hacer las mismas
 * 600 000 evaluaciones del PRF que haría con una sola llamada de 600 000: el
 * trabajo total es idéntico, y ninguna ronda se puede saltar porque cada una
 * necesita la salida de la anterior.
 *
 * No es la construcción del estándar, así que **el número de rondas va dentro
 * de la cadena PHC** (`r=6`). Un hash sin esa marca no se puede verificar sin
 * adivinar, y adivinar es exactamente lo que el formato PHC existe para evitar.
 *
 * El costo medido no cambia: 6 rondas × 6 ms = 36 ms, lo mismo que una llamada
 * de 600 000 habría costado si se hubiera podido hacer.
 */
export const ITERACIONES_POR_RONDA = 100_000;
export const RONDAS = 6;

/** El trabajo total, que es lo que un atacante tiene que repetir. */
export const ITERACIONES = ITERACIONES_POR_RONDA * RONDAS;

/** 16 bytes de sal. Es lo que recomienda NIST SP 800-132 como mínimo. */
const BYTES_SAL = 16;

/**
 * El tope del runtime desplegado, escrito como constante para que quien suba
 * `ITERACIONES_POR_RONDA` choque contra un nombre y no contra un 500.
 */
export const TOPE_DEL_RUNTIME = 100_000;

/** 256 bits de salida, que es el tamaño natural de SHA-256. */
const BITS_DERIVADOS = 256;

const b64 = (b: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(b as ArrayBuffer)));

const deB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

/** Una sola ronda. Nunca se llama con más de 100 000: el runtime la rechaza. */
async function unaRonda(
  material: BufferSource,
  sal: Uint8Array,
  iteraciones: number,
): Promise<ArrayBuffer> {
  const clave = await crypto.subtle.importKey("raw", material, "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: sal as BufferSource, iterations: iteraciones },
    clave,
    BITS_DERIVADOS,
  );
}

/**
 * Encadena `rondas` derivaciones. La salida de cada una es el material de la
 * siguiente; la sal es la misma en todas.
 *
 * Se acepta `rondas = 1` para poder leer hashes viejos escritos antes de que el
 * tope apareciera — aunque hoy no exista ninguno, porque el único que llegó a
 * existir fue el de esta laptop.
 */
async function derivar(
  password: string,
  sal: Uint8Array,
  iteracionesPorRonda: number,
  rondas: number,
): Promise<ArrayBuffer> {
  let material: BufferSource = ENC.encode(password);
  for (let i = 0; i < rondas; i++) {
    material = await unaRonda(material, sal, iteracionesPorRonda);
  }
  return material as ArrayBuffer;
}

/**
 * La cadena PHC que se guarda en `user_password.password_hash`.
 *
 *     $pbkdf2-sha256$i=100000$r=6$<sal base64>$<hash base64>
 *
 * **El algoritmo, las iteraciones Y LAS RONDAS van DENTRO del hash**, y eso no es
 * adorno: es lo que permite subir el trabajo —o cambiar de algoritmo— sin
 * adivinar cómo se hasheó cada fila. Sin ese prefijo, el día que 600 000 se
 * quede corto habría que elegir entre invalidar todas las contraseñas o dejarlas
 * débiles para siempre. `r=` hace falta además porque el encadenado NO es la
 * construcción del estándar: sin él, un verificador no sabría cuántas veces
 * repetir. La migración `0001_identity.sql` ya lo pedía por escrito: «cadena PHC
 * completa, con el algoritmo adentro».
 */
export interface PHC {
  algoritmo: "pbkdf2-sha256";
  /** Iteraciones POR RONDA. Nunca más de 100 000: el runtime lo rechaza. */
  iteraciones: number;
  /** Cuántas rondas encadenadas. El trabajo total es `iteraciones * rondas`. */
  rondas: number;
  sal: Uint8Array;
  hash: Uint8Array;
}

export async function hashear(
  password: string,
  iteracionesPorRonda = ITERACIONES_POR_RONDA,
  rondas = RONDAS,
): Promise<string> {
  const sal = crypto.getRandomValues(new Uint8Array(BYTES_SAL));
  const hash = await derivar(password, sal, iteracionesPorRonda, rondas);
  return `$pbkdf2-sha256$i=${iteracionesPorRonda}$r=${rondas}$${b64(sal)}$${b64(hash)}`;
}

export function leerPHC(cadena: string): PHC | null {
  const m = /^\$pbkdf2-sha256\$i=(\d+)\$r=(\d+)\$([A-Za-z0-9+/=]+)\$([A-Za-z0-9+/=]+)$/.exec(cadena);
  if (!m) return null;
  const iteraciones = Number(m[1]);
  const rondas = Number(m[2]);
  if (!Number.isSafeInteger(iteraciones) || iteraciones < 1) return null;
  if (!Number.isSafeInteger(rondas) || rondas < 1 || rondas > 64) return null;
  // Un `i` por encima del tope no es un hash que este runtime pueda verificar:
  // se rechaza al LEERLO y no al derivar, para que el error sea "no verifica"
  // y no una excepción a mitad de un inicio de sesión.
  if (iteraciones > TOPE_DEL_RUNTIME) return null;
  try {
    return { algoritmo: "pbkdf2-sha256", iteraciones, rondas, sal: deB64(m[3]), hash: deB64(m[4]) };
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
  const derivado = new Uint8Array(await derivar(password, phc.sal, phc.iteraciones, phc.rondas));
  const ok = igualesEnTiempoConstante(derivado, phc.hash);
  // Se compara el TRABAJO TOTAL, no las iteraciones por ronda: un hash de
  // 100k×6 y uno de 600k×1 valen lo mismo, y marcar el primero como
  // desactualizado re-hashearia a todo el mundo sin ganar nada.
  return { ok, desactualizado: ok && phc.iteraciones * phc.rondas < ITERACIONES };
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
