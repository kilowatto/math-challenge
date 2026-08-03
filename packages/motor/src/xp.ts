/**
 * XP y Rango. El eje de progreso personal — **nunca** los puntos del tablero.
 *
 * Módulo puro, mismo contrato que `puntuacion.ts`: entra un intento ya
 * calificado, sale un número, y no toca la red, ni el reloj, ni la base.
 *
 * ─── Por qué esto NO puede ser el mismo número que los puntos (D-055, #225) ──
 *
 * D-055 lo resolvió después de que dos sesiones construyeran cosas
 * incompatibles en la misma tanda. La tabla que decide:
 *
 * | Propiedad          | Puntos (`score_totals`, D-025) | XP (Rango)          |
 * |--------------------|--------------------------------|---------------------|
 * | ¿Puede bajar?      | Sí — fallar rápido resta (D-010) | **Nunca**         |
 * | ¿Depende del reloj?| Sí, de primaria a Pro          | **Nunca**, ni una banda |
 * | ¿Se resetea?       | Sí, por temporada              | **Nunca** — de por vida |
 * | ¿Para qué sirve?   | Ordenar el tablero (competitivo) | Progresar de Rango (personal) |
 *
 * Por eso no existe —y `audits/motor-xp.mjs` bloquea el commit que la escriba—
 * ninguna función que convierta XP en puntos o al revés, ni ninguna expresión
 * que los sume. Son dos monedas, y ninguna se cambia por la otra (#225).
 *
 * En KINDER los dos números coinciden por construcción: ni la fórmula de D-024
 * ni la de aquí usan tiempo, y ninguna puede ir negativa. KINDER es toda la
 * banda que el MVP construye, así que el lanzamiento no expone la divergencia —
 * lo cual es exactamente la razón por la que hay que escribir los dos ejes
 * separados AHORA. El día que se exponga, ya no hay dónde separarlos.
 *
 * ─── La advertencia honesta ──────────────────────────────────────────────────
 *
 * `mc-16` es la fuente de la fórmula (implicación de diseño 7) y trae su propio
 * desmentido: la evidencia de Duolingo es fuerte en enganche y **débil en
 * aprendizaje** — su propio CEO compara la app con una elíptica. Sailer &
 * Homner (2020) miden un efecto conductual pequeño (g=0.25) y Hamari et al.
 * (2014) advierten del efecto novedad. Un Rango no enseña. Existe para que
 * alguien vuelva, que es otra cosa, y `mc-17` §11 agrega el matiz que decide el
 * diseño: la recompensa **informativa** (que confirma competencia) no daña la
 * motivación intrínseca; la **controladora** sí, y el efecto es más severo en
 * niños que en universitarios.
 *
 * De ahí sale que el XP nunca baje. Un número que baja es una penalización, y
 * una penalización es lo más controlador que hay.
 */

import { valorDelItem, NIVEL_MAXIMO } from "./puntuacion.ts";

// ─── La curva de Rango (#194) ────────────────────────────────────────────────

/**
 * La escala de la curva.
 *
 * **CONDICIÓN DE REVISIÓN, explícita y con la misma forma que D-025 usa para su
 * disparador:** este 25 no sale de ningún dato de producción, porque no hay
 * producción. Se recalibra cuando exista una mediana real de XP/día por banda
 * medida sobre ≥200 perfiles activos, y no antes. Hasta entonces, cualquier
 * número de días que salga de aquí va marcado `[estimado]`.
 */
export const RANGO_ESCALA = 25;

/**
 * XP/día con el que se estiman los días de la tabla. `[estimado]`
 *
 * Misma condición de revisión que `RANGO_ESCALA`. Es la calibración de KINDER
 * (la única banda con contenido en el MVP), y no se ha medido: se dedujo de un
 * reto de ~10 ítems de N1–N3 al día.
 */
export const XP_POR_DIA_ESTIMADO = 300;

/**
 * `umbralXpParaRango(r) = 25 × (r−1) × (r+2)`
 *
 * Cuadrática, no exponencial, y la razón está medida. Reusar el 1.6 de
 * `valorDelItem()` produce umbrales inalcanzables: a 300 XP/día, el Rango 20
 * tardaría ~2 519 días (6.9 años) y el Rango 30 unos 758 años. La fuente
 * (GameDeveloper.com, «Quantitative design — How to define XP thresholds?») es
 * explícita en las dos ideas: la advertencia de *unreachable endgame values* con
 * coeficientes altos, y que lo que debe crecer linealmente es el **incremento**
 * entre umbrales, no el umbral mismo exponencialmente.
 *
 * Aquí el incremento entre el rango r y el r+1 es `25 × 2 × (r+1)` = 50(r+1):
 * lineal, como pide la fuente. Y no hay tope máximo impuesto — la curva
 * desacelera sola, sin que nadie tenga que elegir dónde se acaba el juego.
 */
export function umbralXpParaRango(r: number): number {
  if (!Number.isInteger(r) || r < 1) {
    throw new RangeError(`rango fuera de la escalera: ${r} (se esperaba un entero ≥ 1)`);
  }
  return RANGO_ESCALA * (r - 1) * (r + 2);
}

/**
 * El rango que corresponde a un XP, iterando. Es la definición.
 *
 * Existe para que la forma cerrada tenga contra qué compararse. Una fórmula
 * cerrada mal despejada da un número plausible y equivocado, y nadie lo nota:
 * el niño sube de rango un poco antes o un poco después y no hay con qué
 * discutirlo.
 */
export function rangoDeXpIterativo(xp: number): number {
  exigirXp(xp);
  let r = 1;
  while (umbralXpParaRango(r + 1) <= xp) r++;
  return r;
}

/**
 * El rango que corresponde a un XP, en forma cerrada.
 *
 * Despeje de `25(r−1)(r+2) ≤ xp`:
 *
 *     25r² + 25r − 50 ≤ xp
 *     r ≤ (√(4·xp + 225) − 5) / 10
 *
 * `rangoDeXpCerrado` es el despeje crudo. `rangoDeXp` —la que se usa— le añade
 * una corrección de exactitud de dos comparaciones, porque `Math.sqrt` de un
 * cuadrado perfecto puede caer un ulp por debajo y devolver el rango anterior
 * justo en el umbral, que es el único punto donde alguien se daría cuenta.
 */
export function rangoDeXpCerrado(xp: number): number {
  exigirXp(xp);
  return Math.floor((Math.sqrt(4 * xp + 225) - 5) / 10);
}

export function rangoDeXp(xp: number): number {
  let r = rangoDeXpCerrado(xp);
  if (r < 1) r = 1;
  while (umbralXpParaRango(r + 1) <= xp) r++;
  while (r > 1 && umbralXpParaRango(r) > xp) r--;
  return r;
}

function exigirXp(xp: number): void {
  if (!Number.isFinite(xp) || xp < 0) {
    throw new RangeError(`el XP nunca es negativo ni infinito: recibido ${xp} (D-055)`);
  }
}

/**
 * La tabla publicada de 15 rangos. `[estimado]` en la columna de días.
 *
 * Publicada quiere decir publicada: la línea roja #5 exige que se pueda saber
 * de antemano cuánto cuesta cada cosa. Un jugador que no puede calcular su
 * siguiente umbral está mirando una caja sorpresa con otro nombre.
 *
 * Se deriva de `umbralXpParaRango`, no se escribe a mano. Una tabla escrita a
 * mano se desincroniza de la fórmula el día que alguien toca `RANGO_ESCALA`, y
 * entonces la pantalla promete un umbral que el código no aplica.
 */
export const RANGOS_PUBLICADOS: ReadonlyArray<{
  rango: number;
  xpParaEntrar: number;
  incremento: number;
  diasEstimados: number;
}> = Object.freeze(
  Array.from({ length: 15 }, (_, i) => {
    const rango = i + 1;
    const xpParaEntrar = umbralXpParaRango(rango);
    return Object.freeze({
      rango,
      xpParaEntrar,
      incremento: rango === 1 ? 0 : xpParaEntrar - umbralXpParaRango(rango - 1),
      diasEstimados: Math.ceil(xpParaEntrar / XP_POR_DIA_ESTIMADO),
    });
  }),
);

// ─── La tabla de XP: fija, publicada, sin una sola tirada (#219) ─────────────

/**
 * El bono por terminar un reto. `mc-16` implicación de diseño 7.
 *
 * Es `valorDelItem(1)` y no un 10 escrito a mano: la constante vive en
 * `puntuacion.ts` y aquí se reusa. Dos copias del mismo número es cómo el
 * tablero y el rango acaban discrepando sin que nadie cambie nada a propósito.
 */
export const BONO_FINALIZACION_XP = Math.round(valorDelItem(1));

/**
 * Qué vale cada cosa, en XP. **Fija y publicada, sin azar de ninguna clase.**
 *
 * D-014 prohíbe por su letra la recompensa aleatoria **de pago**. Esta tabla
 * extiende la prohibición a **cualquier** recompensa, pagada o gratis, y la
 * razón no es prudencia: `mc-17` (implicación de diseño 3) y `mc-43` (hallazgo
 * 5) son explícitos en que el mecanismo dañino —el refuerzo de razón variable—
 * **no necesita dinero para funcionar sobre un niño**. Es la psicología de la
 * máquina tragamonedas que el Center for Humane Technology nombra por su nombre,
 * y Bélgica y Países Bajos declararon juego ilegal a su versión pagada en 2018.
 *
 * `[criterio propio, no hay fuente que fije estos dos números]` — la misma
 * honestidad que D-016 usa para su tabla de minutos. Lo que sí está sostenido
 * por `mc-16` es la FORMA: un bono plano por sesión terminada, para que
 * cualquier sesión completada se sienta como progreso.
 */
export const XP_POR_TIPO: Readonly<Record<string, number>> = Object.freeze({
  reto_completado: BONO_FINALIZACION_XP,
  mision_diaria: 20,
  mision_semanal: 100,
});

export type TipoDeXp = keyof typeof XP_POR_TIPO;

/**
 * Lo que vale un tipo de evento. Determinista y sin rango de valores.
 *
 * @throws si el tipo no está en la tabla publicada. Es a propósito: un tipo
 *   desconocido que devolviera 0 en silencio sería una recompensa que a veces
 *   cae y a veces no, que es literalmente lo prohibido.
 */
export function xpDeTipo(tipo: string): number {
  const v = XP_POR_TIPO[tipo];
  if (typeof v !== "number") {
    throw new RangeError(
      `tipo de XP fuera de la tabla publicada: "${tipo}" (${Object.keys(XP_POR_TIPO).join(", ")}). ` +
        "Línea roja #5: la tabla es fija y se puede saber de antemano cuánto vale cada cosa.",
    );
  }
  return v;
}

// ─── XP por ítem y por reto (#192) ──────────────────────────────────────────

/**
 * El XP de un ítem: `round(valorDelItem(nivel)) × acc`.
 *
 * Tres propiedades que lo separan del puntaje, y las tres importan:
 *
 *  · **Nunca es negativo.** Fallar da 0, no −N. El `(2·acc − 1)` de D-010 existe
 *    para que el tablero castigue adivinar; el XP no ordena a nadie contra
 *    nadie, así que castigar aquí sería castigar dos veces por lo mismo.
 *  · **Nunca ve el reloj.** No hay parámetro `rtMs` y no puede haberlo:
 *    `audits/motor-xp.mjs` bloquea el commit que se lo agregue. Ni siquiera en
 *    PRO, donde el puntaje sí lo usa.
 *  · **Reusa `valorDelItem()`.** La constante 1.6 de D-010 vive en un solo
 *    sitio.
 */
export function xpDeItem(nivel: number, acc: 0 | 1): number {
  if (acc !== 0 && acc !== 1) {
    throw new TypeError(`acc es 1 o 0, nunca un parcial: recibido ${acc} (D-010, D-048)`);
  }
  if (!Number.isInteger(nivel) || nivel < 1 || nivel > NIVEL_MAXIMO) {
    throw new RangeError(`nivel fuera de la escalera de D-017: ${nivel} (1..${NIVEL_MAXIMO})`);
  }
  return Math.round(valorDelItem(nivel)) * acc;
}

/**
 * El XP de un reto entero.
 *
 * @param items    los ítems ya calificados: nivel y acierto, **sin tiempo**
 * @param completo si el reto se cerró. El bono se otorga entonces, y también
 *   cuando lo cerró el límite de pantalla del padre: quien llama pasa `true`
 *   igual, porque D-014 da el día por cumplido y sería absurdo darlo por
 *   cumplido para la racha y no para el XP.
 *
 * **Pregunta abierta al dueño (#192, P4):** el bono se otorga siempre que el
 * reto se cierre, incluso sin un solo acierto — es lo que recomienda `mc-16`
 * (implicación 7: «so any finished session feels like progress»). La lectura
 * más estricta de «ganado» en D-014 diría cero XP sin aciertos reales. Se
 * implementa la de `mc-16` y queda anotado, no escondido.
 */
export function xpDelReto(
  items: ReadonlyArray<{ nivel: number; acc: 0 | 1 }>,
  completo: boolean,
): number {
  let total = 0;
  for (const it of items) total += xpDeItem(it.nivel, it.acc);
  if (completo) total += BONO_FINALIZACION_XP;
  return total;
}

// ─── El evento hacia cosméticos (#192, #254) ────────────────────────────────

/**
 * Se cruzó al menos un umbral de Rango.
 *
 * Aterriza en el caso `nivel_alcanzado` de `LogroDeterminista`
 * (`cosmeticos.ts`). Se emite **una vez por lote**, aunque el lote cruce varios
 * umbrales: `rangoAnterior` y `rangoNuevo` pueden diferir en más de uno, y ése
 * es el punto — cuatro eventos seguidos serían cuatro celebraciones por una
 * sola sesión, que es la clase de ruido que `mc-17` §9 nombra como *nagging*.
 */
export interface EventoDeRango {
  readonly rangoAnterior: number;
  readonly rangoNuevo: number;
  readonly totalXp: number;
}

/** El evento, o `null` si el lote no cruzó ningún umbral. */
export function eventoDeRango(xpAntes: number, xpDespues: number): EventoDeRango | null {
  exigirXp(xpAntes);
  exigirXp(xpDespues);
  if (xpDespues < xpAntes) {
    throw new RangeError(
      `el XP nunca baja: ${xpAntes} → ${xpDespues}. D-055: «el XP es todo lo que has ` +
        "aprendido, nunca baja». Si esto se disparó, quien llama está mandando un total y no un acumulado.",
    );
  }
  const antes = rangoDeXp(xpAntes);
  const despues = rangoDeXp(xpDespues);
  if (despues === antes) return null;
  return Object.freeze({ rangoAnterior: antes, rangoNuevo: despues, totalXp: xpDespues });
}

// ─── El rollup a D1 (#192) ──────────────────────────────────────────────────

export interface PuntoDeXp {
  childProfileId: string;
  /** XP a SUMAR, nunca el total. */
  delta: number;
}

/**
 * Agrega muchos eventos de XP en pocas filas, igual que `rollup.ts` hace con los
 * puntos. Mismo motivo: D1 guarda estados, no eventos (`mc-32` riesgo #1).
 *
 * NO reusa `agregar()` de `rollup.ts` a propósito, y esto es lo contrario de
 * duplicar: la llave de allá es `(niño, periodo)` y arrastra `theme_band`
 * porque el tablero se resetea por temporada y se ordena por banda. `xp_totals`
 * no tiene ni `period` ni `theme_band` (#192) — el XP es de por vida y no
 * ordena a nadie. Una función compartida obligaría a pasar un `period` falso, y
 * un `period` falso en la tabla de XP es la primera mitad de mezclarlas.
 *
 * El intervalo y el disparador de escritura sí se reusan, porque ésos sí son la
 * misma pregunta: `INTERVALO_MIN_MS` y `tocaEscribir()` de `rollup.ts`.
 */
export function agregarXp(
  eventos: ReadonlyArray<{ childProfileId: string; xp: number }>,
): { filas: PuntoDeXp[]; eventosAgregados: number } {
  const acc = new Map<string, PuntoDeXp>();
  for (const e of eventos) {
    if (!Number.isFinite(e.xp) || e.xp < 0) {
      throw new RangeError(`XP negativo o no finito para ${e.childProfileId}: ${e.xp} (D-055)`);
    }
    const previo = acc.get(e.childProfileId);
    if (previo) previo.delta += e.xp;
    else acc.set(e.childProfileId, { childProfileId: e.childProfileId, delta: e.xp });
  }
  return { filas: [...acc.values()], eventosAgregados: eventos.length };
}

/**
 * El upsert de `xp_totals`. `total_xp = total_xp + excluded`, nunca `= ?`.
 *
 * Y no hay columna `rango`: el rango se DERIVA de `total_xp` al leer (#194).
 * Guardarlo sería guardar dos veces el mismo hecho, y el día que la curva se
 * recalibre —está escrito arriba que se recalibrará— habría miles de filas
 * afirmando un rango que la fórmula ya no da.
 */
export const SQL_UPSERT_XP = `
INSERT INTO xp_totals (child_profile_id, total_xp, updated_at)
VALUES (?, ?, ?)
ON CONFLICT (child_profile_id) WHERE child_profile_id IS NOT NULL DO UPDATE SET
  total_xp   = total_xp + excluded.total_xp,
  updated_at = excluded.updated_at
`.trim();
