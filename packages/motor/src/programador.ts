/**
 * El programador de repaso: **cuándo** vuelve una habilidad. F4 · mc-05, D-018, D-063.
 *
 * Módulo puro, igual que `adaptativo.ts`. La diferencia entre los dos importa y
 * conviene decirla de una vez:
 *
 *   · `adaptativo.ts` decide **qué tan difícil** — la estimación por habilidad.
 *   · éste decide **cuándo vuelve** — la fecha del próximo repaso.
 *
 * Están separados porque fallan distinto. Una estimación mala sirve ítems que
 * no tocan; un calendario malo hace olvidar. Y sobre todo: **el calendario
 * jamás decide si el niño puede jugar** (D-063, criterio #94).
 *
 * ─── FSRS-lite con arranque Leitner ────────────────────────────────────────
 *
 * `mc-05` recomienda exactamente esto y la razón es de datos, no de gusto: FSRS
 * completo tiene 17-21 pesos que hay que ajustar sobre historial real, y una
 * habilidad nueva no tiene ninguno. Mientras hay pocos datos se usa la escalera
 * de Leitner —1 → 3 → 7 → 16 → 35 días, se reinicia al fallar— que no necesita
 * ajustar nada. Pasados `DATOS_PARA_FSRS` intentos se cambia a la fórmula de
 * intervalo de FSRS-6 sembrada con la estabilidad que la escalera ya produjo.
 *
 * ─── Lo que aquí es una línea roja, no una preferencia ─────────────────────
 *
 * **Todo repaso es RECUPERACIÓN** (`mc-05` impl. 2 y 6): el niño produce una
 * respuesta ANTES de ver ninguna explicación. Re-exponer la explicación y
 * llamarlo repaso se siente igual de bien y no enseña — es el efecto de prueba,
 * el hallazgo más replicado del área. Este módulo no puede hacer cumplir eso
 * solo, porque no dibuja pantallas; lo que sí hace es no tener ninguna función
 * que devuelva «muéstrale otra vez la explicación».
 *
 * **El programador nunca dice «vuelve mañana»** (criterio #94, línea roja #4).
 * `queToca()` devuelve siempre algo que jugar: si no hay nada vencido, práctica.
 * Un cronograma que agota el contenido del día es una vida disfrazada, y
 * cobrarlo sería vender lo que la línea roja #4 prohíbe cobrar.
 *
 * **La maestría no bloquea** (D-063). Marca `mastered_at` y cambia el
 * calendario; el avance va por la estimación de habilidad, que es otro eje.
 */

/**
 * Los intervalos de Leitner, **en días**. `mc-05` los fija con estas cinco cifras.
 *
 * Se llamaba `ESCALERA_LEITNER` y lo detuvo `audits/tabla-bandas.mjs`, con razón:
 * en este proyecto «escalera» son los doce escalones de D-017, y llamar igual a
 * una lista de días es la ambigüedad exacta que ese auditor existe para evitar —
 * un niño colocado en N4 al que la interfaz le enseña otro número.
 */
export const INTERVALOS_LEITNER = [1, 3, 7, 16, 35] as const;

/** Cuántos intentos hacen falta antes de dejar Leitner por FSRS. */
export const DATOS_PARA_FSRS = 20;

/**
 * Retención objetivo: la probabilidad de acordarse en el momento del repaso.
 *
 * 0.90 en general y **0.85 en kinder**, y esa rebaja no es capricho: con 0.90 un
 * niño de 4 años se encuentra más repasos de los que su paciencia aguanta, y la
 * frustración cuesta más que el olvido a esa edad (`mc-05` impl. 2). Bajarla
 * alarga los intervalos.
 */
export const RETENCION_OBJETIVO = 0.9;
export const RETENCION_KINDER = 0.85;

/** Aciertos seguidos que marcan «provisionalmente aprendido» (`mc-05` impl. 3). */
export const RACHA_PROVISIONAL = 3;

/**
 * El hueco mínimo que convierte «provisional» en «dominado»: **3 días**.
 *
 * Tres seguidas en el momento no prueban nada durable —es la lección entera del
 * efecto de prueba—, así que `mastered_at` no se escribe hasta que la habilidad
 * sobreviva un repaso espaciado de verdad.
 */
export const DIAS_PARA_DOMINIO = 3;

const MS_POR_DIA = 86_400_000;

/** Las constantes de la curva de olvido de FSRS-6. No se inventan aquí. */
const DECAIMIENTO = -0.5;
const FACTOR = 19 / 81;

/**
 * El estado de UNA habilidad para UN niño. Es exactamente lo que guarda
 * `skill_state` en D1, sin campos de más.
 */
export interface EstadoDeRepaso {
  /** Aciertos seguidos. Se reinicia con un fallo. */
  rachaCorrectas: number;
  /** Cuándo llegó a 3 seguidas. `null` si todavía no. */
  provisionalEn: number | null;
  /** Cuándo sobrevivió un repaso a ≥3 días. `null` si todavía no. */
  dominadoEn: number | null;
  /** Estabilidad en días: cuánto aguanta el recuerdo. `null` antes del primer intento. */
  estabilidad: number | null;
  /** Dificultad percibida, 1-10, al estilo FSRS. `null` antes del primer intento. */
  dificultad: number | null;
  /** Cuándo vuelve. `null` significa «nunca se ha visto». */
  venceEn: number | null;
  intentos: number;
  /** Cuándo fue el último intento. Lo necesita el hueco de los 3 días. */
  ultimoIntento: number | null;
}

export function repasoInicial(): EstadoDeRepaso {
  return {
    rachaCorrectas: 0,
    provisionalEn: null,
    dominadoEn: null,
    estabilidad: null,
    dificultad: null,
    venceEn: null,
    intentos: 0,
    ultimoIntento: null,
  };
}

/**
 * El intervalo de FSRS para una estabilidad y una retención deseada.
 *
 * `I = S · (R^(1/decaimiento) − 1) / factor`. Con R = 0.9 da algo muy cercano a
 * la propia S, que es lo que «estabilidad» significa: los días que aguanta el
 * recuerdo antes de caer al 90%.
 */
export function intervaloFsrs(estabilidad: number, retencion: number): number {
  return (estabilidad * (Math.pow(retencion, 1 / DECAIMIENTO) - 1)) / FACTOR;
}

/** La retención que le toca a una banda. KINDER es la única distinta. */
export function retencionDe(banda: string): number {
  return banda === "KINDER" ? RETENCION_KINDER : RETENCION_OBJETIVO;
}

/**
 * Qué pasó con esta habilidad. **Solo la respuesta final** — misma razón que en
 * `adaptativo.ts`: si el rastro de correcciones estuviera aquí, alguien acabaría
 * alargando el intervalo de quien no dudó (línea roja #8, `mc-30`).
 */
export interface RepasoHecho {
  correcto: boolean;
  /** El instante del servidor. Nunca el del cliente. */
  ahora: number;
  /** La banda, solo para saber qué retención aplicar. */
  banda: string;
}

/**
 * Un paso del programador. Devuelve estado nuevo; no muta el que recibe.
 *
 * ─── Por qué fallar reinicia la escalera pero NO la estabilidad ────────────
 *
 * En Leitner puro, un fallo manda la tarjeta al primer escalón y se pierde todo
 * lo aprendido sobre ella. En FSRS un fallo baja la estabilidad pero no la
 * borra: el recuerdo de algo que se supo durante un mes no vuelve a valer lo
 * mismo que el de algo visto ayer. Aquí se hace lo segundo desde el principio —
 * la escalera de Leitner se usa para el INTERVALO mientras hay pocos datos, y la
 * estabilidad se lleva aparte desde el primer intento para que el cambio a FSRS
 * no empiece de cero.
 */
export function registrarRepaso(estado: EstadoDeRepaso, r: RepasoHecho): EstadoDeRepaso {
  const retencion = retencionDe(r.banda);
  const intentos = estado.intentos + 1;
  const rachaCorrectas = r.correcto ? estado.rachaCorrectas + 1 : 0;

  // --- la dificultad percibida, 1-10 ---------------------------------------
  const dificultadPrevia = estado.dificultad ?? 5;
  const dificultad = Math.min(10, Math.max(1, dificultadPrevia + (r.correcto ? -0.4 : 1.2)));

  // --- la estabilidad -------------------------------------------------------
  let estabilidad: number;
  if (estado.estabilidad === null) {
    // Primer intento: acertar vale más que fallar, pero fallar tampoco deja en
    // cero — el niño estuvo delante del problema.
    estabilidad = r.correcto ? INTERVALOS_LEITNER[1] : 0.5;
  } else if (r.correcto) {
    // Crece más despacio cuanto más difícil resulta la habilidad. El 11 es
    // `10 + 1` para que una dificultad de 10 todavía crezca algo.
    estabilidad = estado.estabilidad * (1 + (11 - dificultad) / 10);
  } else {
    // No se borra: se recorta. Ver el encabezado de esta función.
    estabilidad = Math.max(0.5, estado.estabilidad * 0.35);
  }

  // --- el intervalo ---------------------------------------------------------
  let dias: number;
  if (intentos < DATOS_PARA_FSRS) {
    // Arranque Leitner: el escalón lo marca la racha, y fallar vuelve al primero.
    const escalon = Math.min(rachaCorrectas, INTERVALOS_LEITNER.length) - 1;
    dias = INTERVALOS_LEITNER[Math.max(0, escalon)];
  } else {
    dias = intervaloFsrs(estabilidad, retencion);
  }
  // Nunca menos de un día ni más que el último escalón multiplicado por diez:
  // un intervalo de dos años sobre una habilidad de primaria es un olvido con
  // fecha, no un repaso.
  dias = Math.min(INTERVALOS_LEITNER[INTERVALOS_LEITNER.length - 1] * 10, Math.max(1, dias));

  // --- maestría en dos etapas (criterio #97, `mc-05` impl. 3) ---------------
  const provisionalEn =
    estado.provisionalEn ?? (rachaCorrectas >= RACHA_PROVISIONAL ? r.ahora : null);

  // `mastered_at` exige un acierto en un repaso que llegó tras ≥3 días DE
  // VERDAD. Tres seguidas en la misma sesión no lo escriben nunca, y ése es el
  // punto entero del criterio.
  const huecoDias = estado.ultimoIntento === null ? 0 : (r.ahora - estado.ultimoIntento) / MS_POR_DIA;
  const dominadoEn =
    estado.dominadoEn ??
    (provisionalEn !== null && r.correcto && huecoDias >= DIAS_PARA_DOMINIO ? r.ahora : null);

  return {
    rachaCorrectas,
    provisionalEn,
    dominadoEn,
    estabilidad,
    dificultad,
    venceEn: r.ahora + Math.round(dias * MS_POR_DIA),
    intentos,
    ultimoIntento: r.ahora,
  };
}

/**
 * Lo que el panel del padre puede decir. **«Practicado» y «aprendido» son cosas
 * distintas y se muestran distintas** (`mc-05` impl. 11).
 *
 * El error que esto evita: una racha del mismo día se ve como dominio, el padre
 * lo celebra, y a la semana siguiente el niño falla lo que «ya sabía». Nombrar
 * los tres estados hace que esa promesa no se pueda hacer sin querer.
 */
export function etapaDe(estado: EstadoDeRepaso): "sin_ver" | "practicando" | "provisional" | "aprendido" {
  if (estado.dominadoEn !== null) return "aprendido";
  if (estado.provisionalEn !== null) return "provisional";
  if (estado.intentos > 0) return "practicando";
  return "sin_ver";
}

// ---------------------------------------------------------------------------
// Qué toca ahora (criterios #94 y #99)
// ---------------------------------------------------------------------------

export interface HabilidadEnRotacion {
  skillId: string;
  estado: EstadoDeRepaso;
}

/** La mezcla que pide el criterio #98: entre 40% y 60% de repaso. */
export const REPASO_MINIMO = 0.4;
export const REPASO_MAXIMO = 0.6;

/**
 * Las habilidades vencidas, de la más atrasada a la menos.
 *
 * Una habilidad **sin ver nunca** (`venceEn === null`) no está vencida: está sin
 * empezar. Confundir las dos hace que todo lo nuevo aparezca como urgente y
 * entierre el repaso de verdad.
 */
export function vencidas(rotacion: readonly HabilidadEnRotacion[], ahora: number): HabilidadEnRotacion[] {
  return rotacion
    .filter((h) => h.estado.venceEn !== null && h.estado.venceEn <= ahora)
    .sort((a, b) => (a.estado.venceEn ?? 0) - (b.estado.venceEn ?? 0));
}

/**
 * Arma el orden de habilidades de una sesión: **intercalado, nunca en bloques**
 * (criterio #99, `mc-05` impl. 4).
 *
 * ─── Dónde SÍ y dónde NO se intercala, que es lo delicado ──────────────────
 *
 * D-018 hace de la **serie** la unidad de diseño: los ítems de una serie curada
 * varían uno a la vez a propósito y su orden es una decisión del autor. Mezclar
 * dentro de la serie destruye justo eso.
 *
 * Entonces el intercalado ocurre **entre retos**, no dentro de uno. Esta función
 * devuelve el orden de las HABILIDADES; qué ítems sirve cada una, y en qué
 * orden, lo decide la serie y no se toca.
 *
 * ─── Y el motor nunca se queda sin qué servir (criterio #94) ───────────────
 *
 * Si no hay nada vencido, la sesión entera es práctica. Si hay más vencido que
 * huecos, se sirve lo más atrasado y el resto espera —sin avisarle a nadie, que
 * es lo que separa un repaso de una tarea—.
 */
export function ordenDeSesion(
  rotacion: readonly HabilidadEnRotacion[],
  ahora: number,
  huecos: number,
): string[] {
  if (huecos <= 0 || rotacion.length === 0) return [];

  const debidas = vencidas(rotacion, ahora).map((h) => h.skillId);
  const frescas = rotacion.filter((h) => !debidas.includes(h.skillId)).map((h) => h.skillId);

  // Cuántos de repaso: la mitad, acotada a [40%, 60%] y a lo que de verdad hay.
  // La mitad, acotada por arriba a REPASO_MAXIMO y por abajo a REPASO_MINIMO —
  // pero solo si hay algo vencido. Con nada vencido el cupo es cero y la sesión
  // entera es práctica, que es el criterio #94.
  const ideal = Math.round(huecos * 0.5);
  const techo = Math.floor(huecos * REPASO_MAXIMO);
  const piso = Math.ceil(huecos * REPASO_MINIMO);
  const cuantosRepaso = debidas.length === 0 ? 0 : Math.max(piso, Math.min(ideal, techo));

  // Los huecos de repaso se llenan CICLANDO la lista de vencidas, no cortándola.
  // Con 3 habilidades vencidas y 10 huecos, cortar daba 3 de repaso —el 30%— y
  // se salía por abajo de la ventana 40-60% del criterio #98. Que una habilidad
  // vencida aparezca dos veces en una sesión no es un defecto: es lo que
  // significa que está vencida, y cada aparición sirve un ítem distinto de ella.
  const paraRepasar: string[] = [];
  for (let i = 0; debidas.length > 0 && paraRepasar.length < cuantosRepaso; i++) {
    paraRepasar.push(debidas[i % debidas.length]);
  }

  const paraPracticar: string[] = [];
  // Si no hay bastantes habilidades frescas se recicla la rotación entera: el
  // motor sirve práctica igual, que es exactamente el criterio #94.
  const fuente = frescas.length > 0 ? frescas : rotacion.map((h) => h.skillId);
  for (let i = 0; paraPracticar.length < huecos - paraRepasar.length; i++) {
    paraPracticar.push(fuente[i % fuente.length]);
  }

  // --- el intercalado ------------------------------------------------------
  //
  // Las dos listas ya fijan la MEZCLA —cuántos de repaso y cuántos de práctica—
  // así que cualquier orden de esos mismos elementos la conserva. Lo que falta
  // es que no haya dos iguales seguidas.
  //
  // ─── Por qué NO se alternan las dos colas ────────────────────────────────
  //
  // Alternar «una de repaso, una de práctica» es lo primero que se escribe y
  // produce bloques en cuanto una cola se vacía antes que la otra: la que queda
  // sirve dos veces seguidas y, si le queda una sola habilidad, la repite. Se
  // midió: con 4 habilidades vencidas y 10 huecos salía `A B C A B C D A A D`.
  //
  // Lo que sí funciona es el reordenamiento voraz clásico: en cada hueco se
  // sirve **la habilidad a la que le quedan más apariciones**, saltándose la
  // que acaba de salir. Es óptimo — si existe algún orden sin repeticiones
  // adyacentes, éste lo encuentra — y solo repite cuando es aritméticamente
  // imposible no hacerlo (una habilidad con más de la mitad de los huecos).
  const pendientes = new Map<string, number>();
  for (const s of [...paraRepasar, ...paraPracticar]) pendientes.set(s, (pendientes.get(s) ?? 0) + 1);

  const salida: string[] = [];
  while (salida.length < huecos) {
    const anterior = salida[salida.length - 1];
    let elegida: string | null = null;
    let mayor = 0;
    for (const [skill, cuantas] of pendientes) {
      if (cuantas <= 0 || skill === anterior) continue;
      if (cuantas > mayor) {
        mayor = cuantas;
        elegida = skill;
      }
    }
    // Solo queda la que acabamos de servir. Pasa con UNA habilidad en rotación,
    // y ahí no hay nada que intercalar: forzarlo sería servir un tema que el
    // niño no está viendo.
    if (elegida === null) {
      for (const [skill, cuantas] of pendientes) {
        if (cuantas > 0) { elegida = skill; break; }
      }
    }
    if (elegida === null) break;
    pendientes.set(elegida, (pendientes.get(elegida) ?? 0) - 1);
    salida.push(elegida);
  }
  return salida;
}

/**
 * ¿La sesión está bloqueada por tema? Lo usa `audits/intercalado.mjs` y también
 * las pruebas.
 *
 * Devuelve el bloque más largo encontrado. Con 2+ habilidades en rotación,
 * cualquier cosa mayor que 1 es un bloque.
 */
export function bloqueMasLargo(orden: readonly string[]): number {
  let mejor = 0;
  let actual = 0;
  for (let i = 0; i < orden.length; i++) {
    actual = i > 0 && orden[i] === orden[i - 1] ? actual + 1 : 1;
    if (actual > mejor) mejor = actual;
  }
  return mejor;
}

/**
 * Cierra una sesión cortada por el límite de pantalla **sin dejar el modelo a
 * medias** (criterio #95, D-016, línea roja #6).
 *
 * El ítem servido y no contestado **no se registra**. Ni como fallo —el niño no
 * falló, se le acabó el tiempo— ni como acierto. Devolver el estado tal cual es
 * la implementación entera, y existe como función con nombre para que el sitio
 * donde se corta la sesión tenga algo que llamar que diga qué hace, en vez de un
 * `return` silencioso que el siguiente lector confunda con un olvido.
 *
 * La racha tampoco se toca: la línea roja #6 dice que respetar el límite de
 * pantalla no rompe nada.
 */
export function cerrarPorCorte(estado: EstadoDeRepaso): EstadoDeRepaso {
  return estado;
}
