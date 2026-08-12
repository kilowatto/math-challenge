/**
 * El límite de intentos del PIN de KINDER (D-202, consecuencia obligatoria).
 *
 * ─── Por qué esto pasó de opcional a obligatorio ───────────────────────────
 *
 * `pin-entrar.ts` decía, con fecha de antes de D-202: «Son 504 combinaciones
 * y D-012 dice que la protección real la da el dispositivo del hogar». D-202
 * quitó el orden del PIN de imágenes para que KINDER pudiera recordarlo —no
 * memoriza secuencias— y el espacio bajó a **84**. Con 504 se podía vivir sin
 * límite; con 84, un hermano con el dispositivo ya desbloqueado (que es
 * exactamente contra quién protege este PIN, D-012) puede agotarlas a mano en
 * minutos. El límite deja de ser un adorno.
 *
 * ─── El diseño, y por qué es conservador ───────────────────────────────────
 *
 * **Sin mensaje de castigo (línea roja #7).** El niño nunca ve un contador,
 * nunca ve «espera», nunca ve que algo cambió. Durante el bloqueo,
 * `pin-entrar` sigue respondiendo exactamente `{ ok: false, error:
 * "no_eran_esos" }` — el mismo mensaje amable de siempre, diga o no diga la
 * verdad el PIN que tocó. Para el niño que sabe su PIN esto casi nunca ocurre:
 * el bloqueo solo se dispara tras varios fallos SEGUIDOS, y un niño que
 * reconoce sus tres dibujos rara vez falla más de una vez.
 *
 * **Sin bloqueo permanente.** Se cuenta, se espera un rato corto, se vuelve a
 * intentar — nunca hace falta una intervención humana para que un niño vuelva
 * a jugar. El adulto puede saltarse la espera desde su panel
 * (`pin-desbloquear.ts`), pero no tiene que hacerlo para que se resuelva sola.
 *
 * **Por perfil, no por dispositivo.** Dos hermanos con el mismo dispositivo no
 * se bloquean entre sí: cada `childProfileId` lleva su propio contador.
 *
 * ─── Los números, y por qué éstos ───────────────────────────────────────────
 *
 * `MAX_FALLOS = 5`: generoso para un niño de cuatro años con el dedo torpe —
 * el PIN de imágenes ya no depende del orden, así que 5 fallos seguidos es una
 * señal real de que no es quien dice ser, no un accidente de puntería.
 *
 * `ESPERA_S = 30`: corto a propósito. No es una muralla, es fricción: retrasa
 * lo bastante para que agotar 84 combinaciones a mano deje de ser práctico
 * (84 combinaciones × 30s cada 5 intentos son ~8 minutos mínimo, con un
 * dispositivo real y un niño mirando), sin que un niño legítimo que tropezó
 * sienta que su juego se rompió.
 */
export const MAX_FALLOS = 5;
export const ESPERA_S = 30;

/** `expirationTtl` del contador: se olvida solo si nadie vuelve a fallar. */
const TTL_CONTADOR_S = 60 * 60; // 1 hora

const llave = (childProfileId: string) => `pin-fallos:${childProfileId}`;

interface Estado {
  fallos: number;
  /** Epoch ms del último fallo que llevó a `fallos` a un múltiplo de `MAX_FALLOS`. */
  bloqueadoDesde: number | null;
}

async function leer(kv: KVNamespace, childProfileId: string): Promise<Estado> {
  const crudo = await kv.get(llave(childProfileId));
  if (!crudo) return { fallos: 0, bloqueadoDesde: null };
  try {
    const j = JSON.parse(crudo) as Partial<Estado>;
    return { fallos: Number(j.fallos) || 0, bloqueadoDesde: typeof j.bloqueadoDesde === "number" ? j.bloqueadoDesde : null };
  } catch {
    return { fallos: 0, bloqueadoDesde: null };
  }
}

/**
 * ¿Puede este perfil intentar ahora?
 *
 * Se llama ANTES de comparar el PIN — un intento que llega durante la espera
 * no debe ni gastar el ciclo de verificación, y sobre todo no debe poder
 * acertar: si se dejara comparar, un hermano que por azar tocara los tres
 * correctos durante el bloqueo entraría igual, y la fricción de arriba no
 * protegería nada.
 */
export async function puedeIntentar(kv: KVNamespace, childProfileId: string): Promise<boolean> {
  const { fallos, bloqueadoDesde } = await leer(kv, childProfileId);
  if (fallos < MAX_FALLOS || bloqueadoDesde === null) return true;
  return Date.now() - bloqueadoDesde >= ESPERA_S * 1000;
}

/**
 * Anota un fallo. Si con éste se alcanza `MAX_FALLOS` (o ya se había
 * alcanzado y la espera no había pasado), queda bloqueado desde ahora.
 */
export async function anotarFallo(kv: KVNamespace, childProfileId: string): Promise<void> {
  const estado = await leer(kv, childProfileId);
  const fallos = estado.fallos + 1;
  const bloqueadoDesde = fallos >= MAX_FALLOS ? Date.now() : estado.bloqueadoDesde;
  await kv.put(llave(childProfileId), JSON.stringify({ fallos, bloqueadoDesde }), {
    expirationTtl: TTL_CONTADOR_S,
  });
}

/**
 * Borra el contador entero. Dos llamadores, mismo borrado: un acierto del
 * niño ya demostró quién es, y el adulto que desbloquea desde su panel decide
 * confiar sin esperar. Ninguno de los dos necesita una función propia.
 */
export async function limpiarFallos(kv: KVNamespace, childProfileId: string): Promise<void> {
  await kv.delete(llave(childProfileId));
}

/**
 * ¿Está bloqueado AHORA MISMO? Solo para que el panel del adulto sepa si
 * mostrar el botón de desbloqueo — nunca se usa para decidir si el niño entra
 * (eso es `puedeIntentar`, con la misma lógica pero pensada desde el otro lado).
 */
export async function estaBloqueado(kv: KVNamespace, childProfileId: string): Promise<boolean> {
  return !(await puedeIntentar(kv, childProfileId));
}
