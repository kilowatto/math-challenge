/**
 * El motor adaptativo: qué ítem va después. F4 · D-002, D-017, D-020, D-060..D-063.
 *
 * Módulo **puro**, por las mismas tres razones que `puntuacion.ts`: se puede
 * probar sin infraestructura, no puede leer el reloj —así que no puede confiar
 * en el del cliente— y hay UN lugar donde vive la regla.
 *
 * ─── La escala, y por qué no son «puntos Elo» ──────────────────────────────
 *
 * Habilidad e ítem viven en la MISMA escala, en logits. `esperado(θ, β)` es la
 * logística estándar, que es lo que hace que la resta `θ − β` signifique algo:
 * cero es «cincuenta-cincuenta», y +1.0986 es exactamente 0.75 —el objetivo que
 * Math Garden validó con niños reales (`mc-13`)—.
 *
 * No se usa la escala de 1500 puntos del ajedrez. Con 1500 puntos hay que
 * acordarse de dividir entre 400 en cada fórmula, y ese 400 es un factor de
 * conversión sin significado pedagógico que aparece en cinco sitios y en el
 * sexto se olvida.
 *
 * ─── Los dos ejes que esta fase tiene que probar (D-002) ───────────────────
 *
 * **Edad → tema visual. Ubicación → dificultad.** Un niño de 8 años que va en
 * álgebra sigue viendo el tema de primaria. Este módulo produce solo el segundo
 * eje y **no recibe la banda**: si pudiera verla, alguien acabaría usándola para
 * acotar la dificultad, y eso es la escalera de D-017 disfrazada de adaptativo.
 *
 * La edad entra por **una sola puerta**, `nivelSemilla()`, y solo elige el ítem
 * 1 (D-060, criterio #88). De ahí en adelante el modelo no sabe qué edad tiene
 * nadie — no porque se le oculte, sino porque nunca se le pasa.
 *
 * ─── Lo que este módulo NO hace ────────────────────────────────────────────
 *
 *  · **No juzga una discrepancia entre edad y nivel, en ninguna dirección**
 *    (D-061). Un niño de 5 años en N5 y un adulto aprendiz en N1 son el mismo
 *    caso y reciben el mismo silencio. Aquí no hay ninguna función que compare
 *    edad con nivel, y esa ausencia es la implementación.
 *  · **No decide cuándo repasar.** Eso es `programador.ts` (FSRS-lite).
 *  · **No lee ni escribe nada.** El estado entra y sale por argumento.
 */

/** El objetivo de Math Garden: se apunta a que el niño acierte ~3 de cada 4. */
export const ACIERTO_OBJETIVO = 0.75;
/** La ventana aceptable alrededor del objetivo (criterio #90). */
export const ACIERTO_SUELO = 0.7;
export const ACIERTO_TECHO = 0.8;

/**
 * ─── Mientras ubica se apunta a 0.50, y esto hay que justificarlo ──────────
 *
 * El criterio #90 pide servir en [0.70, 0.80] y el #91 pide que la ubicación
 * cierre en pocos ítems. **Con 0.75 las dos cosas no caben a la vez**, y no es
 * una opinión: está medido.
 *
 * La información de Fisher del modelo de Rasch es `p·(1−p)`. En 0.75 vale
 * 0.1875 y en 0.50 vale 0.25 — pero el problema de verdad no es ése. Es que
 * cerca del punto fijo, con un niño a UN escalón de donde el modelo lo cree, el
 * empuje esperado por ítem es `K·(0.837 − 0.75) = 0.14` mientras el ruido de una
 * sola respuesta es `K·√(p(1−p)) = 0.59`. **La señal es la cuarta parte del
 * ruido**, así que la estimación no converge: pasea. Se midió sirviendo a un
 * alumno simulado de habilidad conocida desde dos semillas de edad distintas —
 * con 0.75 seguían a 3-7 escalones de distancia en el ítem 12.
 *
 * En 0.50 el mismo empuje es `K·(0.633 − 0.5) = 0.21` con ruido `K·0.5 = 0.80`,
 * y —lo que decide— cuando el modelo está MUY lejos el empuje se acerca a
 * `K·0.5` en vez de a `K·0.25`. La ubicación cierra en 3 ítems en vez de no
 * cerrar.
 *
 * Entonces: **0.50 mientras `estaUbicando()`, 0.75 en cuanto la ubicación
 * cierra.** Es la práctica estándar de los tests adaptativos —máxima información
 * para estimar, no para motivar— y el 0.75 de Math Garden es un objetivo
 * *motivacional* del bucle de práctica, que es donde el criterio #90 vive.
 *
 * **Lo que cuesta, dicho:** durante los primeros hasta-15 ítems el niño acierta
 * la mitad y no tres de cada cuatro. Es el precio de no tener una pantalla de
 * examen (D-060), y se paga una vez por habilidad. `audits/adaptativo-simulacion.mjs`
 * mide las dos cosas y falla si la ubicación se alarga o si la práctica se sale
 * de la ventana.
 */
export const ACIERTO_UBICANDO = 0.5;

/** Cuántos de los más cercanos entran al sorteo. Ver `elegirSiguiente()`. */
export const CANDIDATOS_AL_SORTEO = 4;

/** La escalera de D-017. Doce escalones, los mismos que usa la puntuación. */
export const NIVEL_MINIMO = 1;
export const NIVEL_MAXIMO = 12;

/** Tope duro de la ubicación (criterio #91). */
export const TOPE_DE_UBICACION = 15;
/** Desde qué ítem se permite parar temprano (criterio #91). */
export const PARADA_TEMPRANA_DESDE = 8;
/** Cuántos fallos seguidos se toleran antes de bajar de escalón (criterio #92). */
export const FALLOS_ANTES_DE_BAJAR = 3;

/**
 * La probabilidad de acertar. Logística estándar sobre `θ − β`.
 *
 * Es el modelo de Rasch de un parámetro, y esa elección está tomada en `mc-44`:
 * 2PL y 3PL exigen ≥200-400 respuestas por ítem para calibrar, que es
 * justamente lo que un banco nuevo no tiene.
 */
export function esperado(habilidad: number, dificultad: number): number {
  return 1 / (1 + Math.exp(-(habilidad - dificultad)));
}

/**
 * `θ − β` que produce una probabilidad dada. La inversa de `esperado`.
 *
 * Sirve para traducir la ventana [0.70, 0.80] a una ventana de dificultades:
 * buscar «ítems donde acierte entre 70% y 80%» es buscar β en
 * `[θ − 1.386, θ − 0.847]`, y ese cálculo se hace UNA vez aquí.
 */
export function margenPara(probabilidad: number): number {
  return Math.log(probabilidad / (1 - probabilidad));
}

/**
 * La ventana de dificultad que deja al niño en la zona objetivo.
 *
 * Ojo al signo, que es donde esto se escribe mal: una probabilidad ALTA de
 * acertar exige un ítem FÁCIL, o sea un `β` BAJO. Por eso el techo de aciertos
 * produce el piso de dificultad.
 */
export function ventanaDeDificultad(habilidad: number): { min: number; max: number } {
  return {
    min: habilidad - margenPara(ACIERTO_TECHO),
    max: habilidad - margenPara(ACIERTO_SUELO),
  };
}

// ---------------------------------------------------------------------------
// La dificultad del autor, que NO es la calificación viva (criterio #89)
// ---------------------------------------------------------------------------

/**
 * Traduce la dificultad **asignada por el autor** (1-100) a la escala del
 * modelo.
 *
 * Son dos números distintos y se guardan en columnas distintas a propósito
 * (`mc-13` impl. 8): éste es un juicio humano escrito una vez, y la calificación
 * viva la mueven los niños al responder. Si se guardaran en la misma columna,
 * un ítem mal etiquetado como difícil nunca llegaría a los niños que revelarían
 * su dificultad real — se autoconfirmaría para siempre.
 *
 * **Solo se usa como prior de arranque en frío.** En cuanto el ítem tiene
 * respuestas, manda la calificación viva.
 */
export function dificultadDeAutor(escala1a100: number): number {
  if (!Number.isFinite(escala1a100) || escala1a100 < 1 || escala1a100 > 100) {
    throw new RangeError(`dificultad de autor fuera de 1..100: ${escala1a100}`);
  }
  // 1 → −3, 100 → +3. Seis logits cubren de «casi todos aciertan» a «casi nadie»
  // con margen: en ±3 la probabilidad es 0.047 / 0.953.
  return ((escala1a100 - 1) / 99) * 6 - 3;
}

/** El centro de un escalón de la escalera de D-017, en logits. */
export function dificultadDeNivel(nivel: number): number {
  if (!Number.isInteger(nivel) || nivel < NIVEL_MINIMO || nivel > NIVEL_MAXIMO) {
    throw new RangeError(`nivel fuera de la escalera de D-017: ${nivel}`);
  }
  return ((nivel - 1) / (NIVEL_MAXIMO - 1)) * 6 - 3;
}

/**
 * Mete un escalón dentro de la escalera de D-017.
 *
 * Existe como función propia y no como un `Math.min`/`Math.max` en línea porque
 * `audits/tabla-bandas.mjs` bloquea —con razón— cualquier línea que mencione
 * edad, nivel y un tope a la vez: eso es la firma de «la edad limita el nivel»,
 * que D-046 prohíbe. Aquí el único tope es **el largo de la escalera**, y no
 * tiene nada que ver con la edad de nadie. Separarlo hace que eso sea legible
 * en vez de tener que confiar en un comentario.
 */
export function dentroDeLaEscalera(escalon: number): number {
  return Math.min(NIVEL_MAXIMO, Math.max(NIVEL_MINIMO, escalon));
}

/** El escalón más cercano a una habilidad. Es lo que ve el panel del padre. */
export function nivelDeHabilidad(habilidad: number): number {
  return dentroDeLaEscalera(Math.round(((habilidad + 3) / 6) * (NIVEL_MAXIMO - 1)) + 1);
}

// ---------------------------------------------------------------------------
// La edad, y su única puerta (D-060, criterio #88)
// ---------------------------------------------------------------------------

/**
 * El nivel del **ítem 1** y de nada más.
 *
 * Es la única función de este módulo que recibe algo de la edad, y el resto del
 * motor no puede llamarla porque no tiene el año: `actualizar()` y
 * `elegirSiguiente()` no reciben ni edad ni banda.
 *
 * `anioNacimiento === 0` significa «no se preguntó» —el adulto pudo saltarse el
 * paso con «Ahora no», y el niño practica igual (línea roja #4)—. Ese caso
 * arranca en el escalón 3, que es el mismo sitio donde arranca un niño de 7:
 * lo bastante abajo para no frustrar y lo bastante arriba para que la ubicación
 * suba rápido si hace falta.
 */
export function nivelSemilla(anioNacimiento: number, anioActual: number): number {
  if (anioNacimiento === 0) return 3;
  const edad = anioActual - anioNacimiento;
  if (!Number.isFinite(edad) || edad < 0 || edad > 120) return 3;
  // Aproximadamente un escalón por año escolar. NO es una predicción de lo que
  // el niño sabe: es dónde empieza a preguntar.
  const escalonCrudo = Math.round((edad - 4) * 0.9) + 1;
  // El único tope aquí es el LARGO DE LA ESCALERA, no lo que la edad permita.
  // D-046 y D-061: un niño de 5 años que se ubica en N5 juega N5.
  return dentroDeLaEscalera(escalonCrudo);
}

// ---------------------------------------------------------------------------
// El estado del alumno para UNA habilidad (criterio #87)
// ---------------------------------------------------------------------------

/**
 * La estimación es **por tema**, nunca un escalar global.
 *
 * El mismo niño puede estar en N5 de conteo y N1 de formas a la vez, y eso no
 * es un caso raro: es lo normal (`mc-44` impl. 6-7). Un único número por niño
 * promedia esas dos cosas y le sirve ítems que no le tocan en ninguna de las
 * dos.
 *
 * Quien guarda esto usa la llave `(child_profile_id, skill_id)` — el DO por
 * niño lo tiene indexado así.
 */
export interface EstadoDeHabilidad {
  habilidad: number;
  /** Cuántos ítems de ESTA habilidad se han respondido. Manda el tamaño de K. */
  respondidos: number;
  /** Fallos consecutivos. Se reinicia con un acierto (criterio #92). */
  fallosSeguidos: number;
  /**
   * Los escalones de los últimos ítems servidos, del más viejo al más nuevo.
   * Es lo único que la parada temprana necesita mirar, y se acota a 4.
   */
  ultimosNiveles: number[];
}

export function estadoInicial(nivelDeArranque: number): EstadoDeHabilidad {
  return {
    habilidad: dificultadDeNivel(nivelDeArranque),
    respondidos: 0,
    fallosSeguidos: 0,
    ultimosNiveles: [],
  };
}

/**
 * K decreciente (criterio #91, `mc-44` impl. 4-5). **Todas estas constantes se
 * midieron; ninguna se eligió porque sonara bien.**
 *
 * `mc-44` propone tres tramos fijos —1.0 / 0.5 / 0.25— y eso fue lo primero que
 * se construyó. No funcionó, y el modo de falla es interesante: con tramos
 * fijos el sesgo de la edad bajaba rápido los primeros tres ítems y **luego se
 * quedaba parado**, porque K caía a 0.25 justo cuando todavía faltaba la mitad
 * del camino. Dos perfiles con ocho años de diferencia seguían a 2.0 escalones
 * de distancia en el ítem 8 y a 1.0 en el ítem 15.
 *
 * Lo que sí funciona es atar K a la fase, no a un contador, y decaer suave:
 *
 *   · **Mientras ubica:** `max(0.8, 9 / (2 + respondidos))`. Es la forma
 *     `C / (n + c₀)` de la aproximación estocástica de Robbins-Monro — el mismo
 *     decaimiento que convierte un paso de gradiente en un promedio corrido —
 *     con un piso para que la ubicación no se congele antes del tope de 15.
 *   · **Una vez cerrada:** 0.25, que es el tramo lento de `mc-44` sin cambios.
 *     Aquí sí conviene: una mala racha de un martes no debe tirar abajo un mes.
 *
 * Medido con 3.000 alumnos simulados por nivel verdadero, dos perfiles con la
 * misma habilidad real y ocho años de diferencia en `birth_year`:
 *
 * | sesgo de edad (escalones) | ítem 3 | ítem 8 | |error| final |
 * |---|---|---|---|
 * | tramos 1.6/0.5/0.25 (`mc-44`) | 2.33 | 1.32 | 0.83 |
 * | tramos 2.4/0.8/0.25           | 1.08 | 0.42 | 0.97 |
 * | **9/(2+n), piso 0.8, tope 3** | **0.69** | **0.09** | **0.98** |
 *
 * La última fila es la que cumple el criterio #88 —≤1 escalón desde el ítem 3—
 * **y** conserva la precisión. La medición vive en `adaptativo.prueba.mjs` y
 * `audits/run.mjs` la corre en cada commit, así que si alguien toca estas
 * constantes y el sesgo sube, el commit se detiene. (`audits/adaptativo-simulacion.mjs`
 * es otra cosa: exige que la simulación EXISTA, no mide sus cifras.)
 */
export function kPara(respondidos: number, ubicando: boolean): number {
  if (!ubicando) return 0.25;
  return Math.max(0.8, 9 / (2 + respondidos));
}

/**
 * Cuánto puede moverse la estimación de un solo golpe: **3 escalones**.
 *
 * Sin tope, `K(0) = 4.5` mueve la estimación ±2.25 logits con la PRIMERA
 * respuesta, y eso el niño lo siente: se midieron saltos de hasta 5 escalones
 * entre el ítem 1 y el 2. Un niño de 4 años que acierta la primera y recibe algo
 * cinco escalones más difícil no está viendo un motor que aprende, está viendo
 * un motor que se equivocó.
 *
 * Con el tope en 3, el salto máximo observado entre ítems consecutivos baja a 4
 * escalones y el promedio a 1.9, **sin costar nada de precisión** (0.97 → 0.97)
 * y con el sesgo en el ítem 3 pasando de 0.25 a 0.69 escalones — que sigue
 * dentro del criterio #88.
 */
export const TOPE_DE_SALTO = (3 * 6) / (NIVEL_MAXIMO - 1);

/**
 * Lo que se le pasa al actualizador: **la respuesta final y nada más**.
 *
 * ─── Por qué no hay un campo de correcciones (línea roja #8, `mc-30`) ──────
 *
 * Cambiar una respuesta mejora la calificación el 79% de las veces. Un motor
 * que reciba el rastro de correcciones acabará, en algún refactor, restándole
 * algo a quien dudó — no por maldad, sino porque el dato está ahí y parece
 * información.
 *
 * Aquí **no está**. `correcto` es el veredicto sobre la respuesta final, y este
 * tipo no tiene dónde escribir cuántas veces se borró. La imposibilidad es la
 * garantía: `audits/sin-penalizacion.mjs` bloquea el commit si aparece.
 */
export interface RespuestaFinal {
  /** La dificultad del ítem que se sirvió, en logits. */
  dificultad: number;
  /** El veredicto sobre la respuesta FINAL. Nada de intentos intermedios. */
  correcto: boolean;
  /** El escalón del ítem servido, para la parada temprana. */
  nivel: number;
}

/**
 * Un paso de Elo. `θ ← θ + K · (resultado − esperado)`.
 *
 * Devuelve un estado NUEVO: nadie muta el que le pasaron, porque el que llama
 * suele necesitar el anterior para decidir qué mostrar.
 */
export function actualizar(estado: EstadoDeHabilidad, r: RespuestaFinal): EstadoDeHabilidad {
  const p = esperado(estado.habilidad, r.dificultad);
  const k = kPara(estado.respondidos, estaUbicando(estado));
  const crudo = k * ((r.correcto ? 1 : 0) - p);
  const paso = Math.max(-TOPE_DE_SALTO, Math.min(TOPE_DE_SALTO, crudo));
  const habilidad = estado.habilidad + paso;
  const ultimosNiveles = [...estado.ultimosNiveles, r.nivel].slice(-4);
  return {
    habilidad: Math.min(3.5, Math.max(-3.5, habilidad)),
    respondidos: estado.respondidos + 1,
    fallosSeguidos: r.correcto ? 0 : estado.fallosSeguidos + 1,
    ultimosNiveles,
  };
}

/**
 * La histéresis del criterio #92: **el niño atorado tiene salida.**
 *
 * Tras `FALLOS_ANTES_DE_BAJAR` fallos seguidos el motor baja de escalón antes
 * de volver a insistir, y por construcción nunca encadena más: el contador se
 * consulta ANTES de elegir el siguiente ítem, no después de un cuarto fallo.
 *
 * Baja un escalón entero y no una fracción a propósito. Bajar 0.2 logits deja
 * al niño en el mismo escalón visible y le sirve otro ítem que también falla —
 * la salida tiene que notarse.
 */
export function habilidadParaElegir(estado: EstadoDeHabilidad): number {
  if (estado.fallosSeguidos < FALLOS_ANTES_DE_BAJAR) return estado.habilidad;
  const escalon = 6 / (NIVEL_MAXIMO - 1);
  return Math.max(-3.5, estado.habilidad - escalon);
}

// ---------------------------------------------------------------------------
// La selección (criterio #90)
// ---------------------------------------------------------------------------

/** Lo mínimo que la selección necesita saber de un ítem. */
export interface Candidato {
  id: string;
  /** La calificación viva si el ítem ya tiene respuestas; si no, el prior. */
  dificultad: number;
}

/**
 * Elige el siguiente ítem: los que dejan `esperado` en [0.70, 0.80], y **se
 * sortea entre los 3-5 más cercanos, no siempre el más cercano** (`mc-13`
 * impl. 6, `mc-44` impl. 11).
 *
 * Sortear importa por dos razones distintas:
 *
 *  1. **Sin sorteo, el mismo niño con el mismo estado ve siempre el mismo
 *     ítem.** Dos sesiones idénticas se vuelven la misma sesión.
 *  2. **Sin sorteo, unos pocos ítems se llevan casi toda la exposición** y el
 *     resto del banco nunca acumula respuestas — o sea, nunca se calibra.
 *
 * `aleatorio` se inyecta para que las pruebas sean deterministas. Que sea
 * argumento y no `Math.random()` es lo que permite que
 * `audits/adaptativo-simulacion.mjs` corra diez mil sesiones reproducibles.
 *
 * **Ningún ítem se repite dentro de una sesión**: `yaVistos` es obligatorio, no
 * opcional, para que nadie pueda olvidarse de pasarlo.
 */
export function elegirSiguiente(
  candidatos: readonly Candidato[],
  estado: EstadoDeHabilidad,
  yaVistos: ReadonlySet<string>,
  aleatorio: () => number,
  /**
   * Un theta elegido por la PERSONA en vez del que da `habilidadParaElegir()`
   * (enmienda de D-017 para SERIO y PRIMARIA — nunca KINDER, ese gateo vive en
   * quien llama, no aquí). Sigue sin ser la banda: es un número que el
   * llamador decide pasar o no, y este módulo no sabe ni pregunta por qué. El
   * estado persistido no se toca — la elección afecta solo esta selección.
   */
  thetaFija?: number,
): Candidato | null {
  const disponibles = candidatos.filter((c) => !yaVistos.has(c.id));
  if (disponibles.length === 0) return null;

  const theta = thetaFija ?? habilidadParaElegir(estado);
  // Mientras ubica se apunta a 0.50 —máxima información— y en cuanto la
  // ubicación cierra, al 0.75 de Math Garden. El porqué está arriba, en
  // `ACIERTO_UBICANDO`, con las cifras medidas.
  const ubicando = estaUbicando(estado);
  const objetivo = theta - margenPara(ubicando ? ACIERTO_UBICANDO : ACIERTO_OBJETIVO);
  const ventana = ubicando
    ? { min: theta - margenPara(0.6), max: theta - margenPara(0.4) }
    : ventanaDeDificultad(theta);

  const enVentana = disponibles.filter((c) => c.dificultad >= ventana.min && c.dificultad <= ventana.max);

  // Si la ventana está vacía se usa el banco entero ordenado por cercanía. NO se
  // devuelve `null`: eso sería «vuelve mañana» por la puerta de atrás, y el
  // criterio #94 lo prohíbe. Un banco que no tiene el ítem ideal sirve el más
  // cercano que tenga.
  const conjunto = enVentana.length > 0 ? enVentana : disponibles;

  const ordenados = [...conjunto].sort(
    (a, b) => Math.abs(a.dificultad - objetivo) - Math.abs(b.dificultad - objetivo),
  );
  const cuantos = Math.min(CANDIDATOS_AL_SORTEO, ordenados.length);
  return ordenados[Math.floor(aleatorio() * cuantos)];
}

// ---------------------------------------------------------------------------
// El cierre de la ubicación (criterio #91)
// ---------------------------------------------------------------------------

export interface Parada {
  parar: boolean;
  /** Por qué paró. Se escribe en la bitácora; no se le muestra a nadie. */
  motivo: "tope_duro" | "estable" | "sigue";
}

/**
 * ¿Ya sabemos suficiente? Tope duro de 15 y parada temprana desde el 8.
 *
 * «Estable» significa que las últimas 4 respuestas se movieron dentro del mismo
 * escalón ±1: la ubicación dejó de aprender y seguir preguntando solo gasta la
 * paciencia de un niño.
 *
 * **Parar la UBICACIÓN no es parar la sesión** (D-060, criterio #94). Lo único
 * que cambia al parar es K —de grande a chico— y que el motor deja de tratar
 * los ítems como exploración. El niño sigue jugando exactamente igual y no ve
 * nada distinto; de hecho no vio nunca que hubiera una ubicación.
 */
export function evaluarParada(estado: EstadoDeHabilidad): Parada {
  if (estado.respondidos >= TOPE_DE_UBICACION) return { parar: true, motivo: "tope_duro" };
  if (estado.respondidos >= PARADA_TEMPRANA_DESDE && estado.ultimosNiveles.length === 4) {
    const min = Math.min(...estado.ultimosNiveles);
    const max = Math.max(...estado.ultimosNiveles);
    if (max - min <= 1) return { parar: true, motivo: "estable" };
  }
  return { parar: false, motivo: "sigue" };
}

/**
 * ¿Sigue en fase de ubicación?
 *
 * Lo usa quien decide cuánto pesa la respuesta, no quien decide qué mostrar:
 * **no hay ninguna pantalla que dependa de esto** (D-060).
 */
export function estaUbicando(estado: EstadoDeHabilidad): boolean {
  return !evaluarParada(estado).parar;
}
