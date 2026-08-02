/**
 * El brazo de control y las dos firmas de Rohrer. F4 · criterio #103 · mc-05, mc-13.
 *
 * ─── Por qué este archivo existe ───────────────────────────────────────────
 *
 * Un motor adaptativo siempre parece funcionar. Los niños progresan, los
 * puntajes suben, el tablero se llena — y todo eso pasaría igual con una
 * escalera fija, porque los niños aprenden con el tiempo. **Sin algo contra qué
 * comparar, no hay forma de atribuirle nada al adaptativo.**
 *
 * `mc-13` impl. 11 pide exactamente esto: que exista el modo **escalera fija**
 * como alternativa real, no como idea. Aquí está, y es real en el sentido que
 * importa: sirve ítems de verdad, con la misma firma que el selector adaptativo,
 * y se puede poner delante de un niño.
 *
 * ─── Las dos firmas de Rohrer, y por qué se miden POR SEPARADO ─────────────
 *
 * `mc-05` impl. 10. Rohrer midió dos cosas distintas y la gracia está en que se
 * mueven en direcciones OPUESTAS:
 *
 *   1. **Acierto en la misma sesión.** El intercalado lo BAJA. Practicar diez
 *      sumas seguidas da fluidez inmediata; mezclar obliga a elegir la
 *      estrategia cada vez, y eso cuesta aciertos hoy.
 *   2. **Acierto al día siguiente.** El intercalado lo DUPLICA — es el
 *      resultado central del área, replicado en aula.
 *
 * **Queda escrito aquí, y esto es lo que el criterio #103 pide de verdad: un
 * bajón en el acierto de sesión NO revierte a bloques.** Es el resultado
 * esperado, no un problema. Quien mire un tablero con el acierto de sesión
 * cayendo y decida «volvamos a agrupar por tema» estará optimizando la métrica
 * que Rohrer demostró que engaña.
 *
 * Por eso las dos se calculan con funciones distintas y con nombres distintos.
 * Un solo campo `accuracy` acaba siendo el de sesión —es el que se tiene a
 * mano— y el otro no se mira nunca.
 */

import {
  dificultadDeNivel,
  nivelDeHabilidad,
  type Candidato,
  type EstadoDeHabilidad,
} from "./adaptativo.ts";

/** Qué motor sirvió el ítem. Viaja en cada intento a Analytics Engine. */
export type ModoDeSeleccion = "adaptativo" | "escalera_fija";

/**
 * **El brazo de control: la escalera fija.**
 *
 * Sirve ítems del escalón que le toca al niño por su nivel actual y **no adapta
 * nada**: el escalón sube cuando el contenido del escalón se acaba, no cuando el
 * niño demuestra algo. Es lo que hace casi todo el software educativo, y es
 * contra esto contra lo que hay que comparar.
 *
 * Tiene la MISMA firma que `elegirSiguiente` a propósito. Si tuviera otra, el
 * sitio que sirve ítems tendría un `if` con dos caminos distintos y el brazo de
 * control dejaría de ser comparable — estaría midiendo también la diferencia
 * entre dos rutas de código.
 *
 * **No usa `aleatorio` para elegir entre cercanos**, solo para desempatar dentro
 * del mismo escalón: la falta de muestreo es parte de lo que se está comparando.
 */
export function elegirPorEscaleraFija(
  candidatos: readonly Candidato[],
  estado: EstadoDeHabilidad,
  yaVistos: ReadonlySet<string>,
  aleatorio: () => number,
): Candidato | null {
  const disponibles = candidatos.filter((c) => !yaVistos.has(c.id));
  if (disponibles.length === 0) return null;

  const escalon = nivelDeHabilidad(estado.habilidad);
  const enEscalon = disponibles.filter((c) => nivelDeHabilidad(c.dificultad) === escalon);

  // Si el escalón se acabó, se sube al siguiente que tenga algo. Ésa es la única
  // «adaptación» que hace una escalera fija: agotar y avanzar.
  if (enEscalon.length === 0) {
    const arriba = disponibles
      .filter((c) => c.dificultad > dificultadDeNivel(escalon))
      .sort((a, b) => a.dificultad - b.dificultad);
    return arriba[0] ?? disponibles[0];
  }
  return enEscalon[Math.floor(aleatorio() * enEscalon.length)];
}

// ---------------------------------------------------------------------------
// Las dos firmas
// ---------------------------------------------------------------------------

/**
 * Un intento, reducido a lo que las dos firmas necesitan. Viene de
 * `math-challenge-attempts-ae` — nunca de D1.
 */
export interface IntentoMedido {
  skillId: string;
  correcto: boolean;
  /** El instante del SERVIDOR. */
  ahora: number;
  /** La sesión en la que ocurrió. */
  sesionId: string;
  modo: ModoDeSeleccion;
}

const MS_POR_DIA = 86_400_000;

/**
 * **Firma 1 — acierto en la misma sesión.**
 *
 * Se espera que el intercalado la BAJE. Repito lo del encabezado porque es donde
 * se toma la decisión equivocada: **una bajada aquí no revierte a bloques.**
 */
export function aciertoEnSesion(intentos: readonly IntentoMedido[], modo: ModoDeSeleccion): number | null {
  const suyos = intentos.filter((i) => i.modo === modo);
  if (suyos.length === 0) return null;
  return suyos.filter((i) => i.correcto).length / suyos.length;
}

/**
 * **Firma 2 — acierto al día siguiente.**
 *
 * El primer intento de cada habilidad en una sesión **posterior**, al menos un
 * día después de la última vez que se practicó. Es lo que Rohrer midió y lo que
 * el intercalado duplica.
 *
 * Lo delicado es el «primer intento»: si se cuentan todos los de la sesión
 * siguiente, se está midiendo otra vez el aprendizaje de esa sesión y la firma
 * se contamina con lo que se acaba de practicar. Solo cuenta el primero, que es
 * el que llega en frío.
 */
export function aciertoAlDiaSiguiente(
  intentos: readonly IntentoMedido[],
  modo: ModoDeSeleccion,
): number | null {
  const suyos = [...intentos].filter((i) => i.modo === modo).sort((a, b) => a.ahora - b.ahora);
  if (suyos.length === 0) return null;

  /** Última vez que se tocó cada habilidad, y en qué sesión. */
  const ultimo = new Map<string, { ahora: number; sesionId: string }>();
  let aciertos = 0;
  let contados = 0;

  for (const i of suyos) {
    const previo = ultimo.get(i.skillId);
    // Solo el PRIMERO en frío. Aquí había además un conjunto de «ya contadas en
    // esta sesión», y su control negativo no falló: es código muerto. `ultimo`
    // se actualiza en CADA intento, así que el segundo de la sesión ya tiene de
    // previo al primero —segundos antes— y el hueco de un día lo descarta solo.
    // Se quitó en vez de dejarlo con un comentario diciendo que protege algo.
    if (
      previo !== undefined &&
      previo.sesionId !== i.sesionId &&
      i.ahora - previo.ahora >= MS_POR_DIA
    ) {
      contados++;
      if (i.correcto) aciertos++;
    }
    ultimo.set(i.skillId, { ahora: i.ahora, sesionId: i.sesionId });
  }

  return contados === 0 ? null : aciertos / contados;
}

/**
 * Las dos firmas juntas, para los dos brazos. Es lo único que hay que mirar para
 * poder atribuirle algo al adaptativo.
 *
 * Devuelve `null` en las celdas sin datos suficientes en vez de un cero. Un cero
 * dibujado en una gráfica se lee como «el adaptativo no funciona»; un hueco se
 * lee como lo que es, que todavía no se sabe.
 */
export function tablaDeComparacion(intentos: readonly IntentoMedido[]) {
  return {
    adaptativo: {
      enSesion: aciertoEnSesion(intentos, "adaptativo"),
      alDiaSiguiente: aciertoAlDiaSiguiente(intentos, "adaptativo"),
    },
    escaleraFija: {
      enSesion: aciertoEnSesion(intentos, "escalera_fija"),
      alDiaSiguiente: aciertoAlDiaSiguiente(intentos, "escalera_fija"),
    },
    /**
     * Lo que se espera, escrito en el código y no en un documento que nadie
     * abre: **`enSesion` puede salir PEOR en el adaptativo y eso está bien.**
     * La que tiene que salir mejor es `alDiaSiguiente`.
     */
    lecturaEsperada:
      "enSesion puede bajar con el intercalado; alDiaSiguiente es la que debe subir. " +
      "Una bajada en enSesion NO revierte a bloques (mc-05 impl. 10).",
  };
}
