// Las 28 cartas de la flota adversarial (D-032, fase F1).
//
// Una "carta" es el encargo de un auditor: qué caza, qué puede citar, y sobre
// qué archivos despierta. No es un prompt suelto — es lo que hace que la regla 1
// de D-032 sea verificable: si un auditor no puede señalar una decisión de
// `decisions.md`, un hallazgo de `research/` o una línea roja de CLAUDE.md,
// está opinando, y su veredicto no bloquea.
//
// `cita` lista lo que ESTE auditor tiene autoridad para invocar. El corredor
// valida contra el repo que cada id exista de verdad (audits/adversarial/citas.mjs),
// así que una carta que cite un documento inventado falla al arrancar, no en
// medio de una revisión.
//
// `alcance` decide cuándo despierta. Un cambio solo de documentación no debe
// despertar al auditor de PWA en iOS: 28 llamadas de LLM por revisión tienen
// costo, y D-032 nombra ese costo como el riesgo conocido de la flota.

/** Las ocho líneas que no se cruzan (CLAUDE.md). Citables como LR-1..LR-8. */
export const LINEAS_ROJAS = [
  "Nunca cámara, nunca micrófono, nunca biometría, nunca navegador bloqueado. A nadie, en ninguna banda, en ningún nivel de anti-trampa.",
  "El niño nunca es un usuario. Es un perfil dentro de la cuenta del padre. No se pide nombre real, correo, foto ni fecha exacta de nacimiento.",
  "Ningún niño escribe texto libre, en ninguna superficie del producto.",
  "Nunca se cobra por dejar que un niño practique. Sin corazones, sin vidas, sin energía que se agote.",
  "Sin moneda comprable y sin recompensas aleatorias de pago. Las cajas de botín fueron declaradas juego ilegal en Bélgica y Países Bajos.",
  "La racha nunca se rompe por respetar el límite de pantalla, y la protección de racha jamás se vende.",
  "Larry nunca avergüenza a un niño por equivocarse, y nunca calcula: recibe el veredicto ya calculado y solo lo explica.",
  "Nunca se penaliza borrar o corregir una respuesta. Cambiar una respuesta mejora la calificación el 79% de las veces (mc-30).",
];

/** Los siete locales del lanzamiento (D-022). Siete, no cinco idiomas. */
export const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

// Alcances reutilizados. Son expresiones regulares contra la ruta del archivo.
const TODO = [/.*/];
const INTERFAZ = [/^apps\/web\//, /^apps\/site\//];
const TEXTOS = [/i18n\//, /locales?\//, /\.(json|md)$/];
const ESQUEMA = [/^migrations\//, /\.sql$/, /schema/i];
const MOTOR = [/^apps\/ingest\//, /engine|scoring|attempt|intento|puntua/i];
const CONTENIDO = [/^content\//, /items?\//, /banco/i];
const SERVICIO = [/^apps\/web\/public\/(sw\.js|manifest\.webmanifest)$/, /^apps\/web\//];

/**
 * Una carta por auditor.
 *
 * id       · nombre en la línea de comandos y en el informe
 * titulo   · qué es, en una línea
 * caza     · qué busca. Instrucciones para ENCONTRAR la violación, no para
 *            aprobar (D-032 lo dice literal: "instruidos para encontrar la
 *            violación y no para aprobar").
 * ciega_a  · qué NO es asunto suyo. Sin esto, 28 auditores reportan lo mismo y
 *            la flota se vuelve ruido — el riesgo que D-032 nombra.
 * cita     · ids que tiene autoridad para invocar (LR-n, D-0nn, mc-nn)
 * alcance  · regexes de ruta; si el diff no toca ninguno, el auditor no corre
 */
export const CARTAS = [
  {
    id: "lineas-rojas",
    titulo: "Las ocho líneas que no se cruzan",
    caza:
      "Cualquier cosa que cruce una de las ocho líneas rojas de CLAUDE.md, incluso de forma indirecta o " +
      "a través de una dependencia. Ejemplos de indirecto que sí cuentan: una librería que pide permiso de " +
      "cámara aunque el producto no la use; un campo de esquema que podría almacenar texto escrito por un " +
      "niño aunque hoy no se llene; una pantalla de pago que aparece en un flujo de práctica; un contador " +
      "que penaliza borrar. Busca la línea cruzada, no la intención de quien la escribió.",
    ciega_a:
      "Estética, rendimiento, ortografía, y todo lo que no sea una de las ocho líneas. Otros 27 auditores " +
      "cubren eso.",
    cita: ["LR-1", "LR-2", "LR-3", "LR-4", "LR-5", "LR-6", "LR-7", "LR-8", "D-013", "D-014", "D-016", "D-020", "D-021"],
    alcance: TODO,
  },
  {
    id: "privacidad",
    titulo: "Privacidad infantil — COPPA y GDPR-K",
    caza:
      "Recolección, retención o salida de datos de menores que no esté justificada. En concreto: campos " +
      "que identifiquen a un niño (nombre real, correo, foto, fecha exacta de nacimiento); consentimiento " +
      "que no quede registrado; datos de menor que salgan hacia un tercero; retención sin plazo; un perfil " +
      "de niño tratado como cuenta propia; telemetría de proceso que guarde más de lo que el veredicto " +
      "necesita. También: exportaciones y logs — un log con el id del niño y su respuesta es recolección.",
    ciega_a:
      "Privacidad del adulto salvo cuando toca a un menor. Seguridad de infraestructura (secretos, permisos " +
      "de Cloudflare) — eso lo cubre un auditor determinista.",
    // `D-003`, `D-040` y `D-043` se añaden en F7 (#245), y sin ellas esta carta
    // no podía invocar lo que gobierna Ligas: que el tablero es de alias
    // generados y no de nombres (D-003), que aparecer en él es opt-in por hijo
    // con la activación registrada como un consentimiento (D-040), y que los
    // contenedores sociales están SEPARADOS en el esquema a propósito (D-043).
    // Es el mismo hueco que F6 encontró con `anti-humillacion` y `mc-11`: la
    // carta veía la violación y no tenía con qué citarla, así que su veredicto
    // no bloqueaba.
    // `D-016` y `D-051` se añaden en F8 (#274), por el mismo hueco: sin ellas
    // la carta no puede señalar con autoridad que `screen_time_daily_usage`
    // retiene más de lo necesario, ni si la fila de `child_consents` para
    // `SCREEN_TIME` se escribe por el gobierno único de consentimientos.
    // `D-086`/`D-087`/`D-088`/`D-110` se añaden en F9 (#401): sin ellas la
    // carta no puede citar con autoridad el modelo de escuela verificada, el
    // ranking opt-in del grupo, el aislamiento de contacto del club de papás
    // ni la aprobación del padre como tipo de marca.
    cita: ["LR-2", "LR-3", "D-003", "D-012", "D-013", "D-016", "D-027", "D-040", "D-043", "D-051", "mc-25", "mc-27", "mc-30", "D-086", "D-087", "D-088", "D-110"],
    // `league_|liga|duel|tablero|cohort` porque el subsistema social vive en
    // `packages/motor/` y en `migrations/`, y el alcance heredado llegaba a los
    // dos por casualidad, no por diseño: `MOTOR` filtra por `puntua|scoring` y
    // `ESQUEMA` por `.sql`, así que `packages/motor/src/liga.ts` —donde se
    // decide qué ve un niño de otro— quedaba fuera.
    alcance: [
      ...ESQUEMA,
      ...MOTOR,
      /^apps\//,
      /^docs\//,
      /league_|liga|duel|tablero|cohort|rollup-adulto/i,
    ],
  },
  {
    id: "anti-humillacion",
    titulo: "Anti-humillación",
    caza:
      "Cualquier superficie donde una persona quede expuesta ante otras por su desempeño, su lentitud o su " +
      "error. Incluye: tableros que muestren últimos lugares; comparaciones no pedidas; un texto que insinúe " +
      "vergüenza; una prenda de club con perdedor; un campo de esquema donde quepa un castigo dirigido a " +
      "alguien; notificaciones que le digan a un tercero que alguien falló. Recuerda que en D-028 no existe " +
      "una casilla para el último lugar: si un cambio la crea, eso es el hallazgo. Y la retroalimentación " +
      "misma: una explicación que elogia la CAPACIDAD («qué listo eres») en vez del proceso, que compara " +
      "con otros, que cuenta las veces que alguien falló, que minimiza el ítem («era fácil») o que menciona " +
      "la velocidad. Ninguna de esas contiene una palabra prohibida por sí sola — es la construcción lo que " +
      "humilla, y por eso el auditor determinista `larry-nunca-averguenza` no puede cazarlas todas. " +
      "**Y desde F6 #136 esto incluye el camino EN VIVO** (`packages/tutor/`, `api/larry.ts`): el prompt " +
      "que se le manda al modelo, los ejemplos autorados de cada locale y la compuerta que juzga lo que " +
      "vuelve. Ahí el riesgo es de otro orden y conviene decirlo — el texto pregenerado lo escribió una " +
      "persona y lo revisó otra; el texto en vivo no lo ha visto nadie cuando llega a la pantalla, así que " +
      "una instrucción del prompt que empuje a hablar DE la persona en vez de del pensamiento produce " +
      "humillación a escala y sin revisor. Mira también el tope de gasto: un aviso al niño de que se " +
      "agotó su cuota sería monetización apuntada a un menor, y no existe ninguno. " +
      "**Y desde F7 #257 esto incluye la apariencia y la identidad del niño**: cualquier comentario de " +
      "Larry sobre su avatar, su alias o sus cosméticos — incluso un cumplido. mc-43 §10 lo dice " +
      "literal: un bot que «elogia» un nombre también puede juzgarlo, y con D-080 el tutor y el " +
      "compañero que lleva puestos los accesorios son LA MISMA criatura, así que «qué bonito tu " +
      "sombrero» y «qué feo te quedó» entran por la misma puerta. La voz de Larry se queda en la " +
      "matemática; la frontera no es el tono del comentario, es que el comentario exista.",
    ciega_a:
      "Dificultad del contenido. Un problema difícil no es humillación. Y el léxico literal por locale, que " +
      "ya cubre `audits/larry-nunca-averguenza.mjs` con su lista de construcciones — aquí lo que se busca es " +
      "lo que ninguna lista caza: «no todos nacemos para los números» no tiene ni una palabra prohibida.",
    // `mc-11` se añade en F6 (#133). Sin ella esta carta no podía invocar el
    // hallazgo de Mueller & Dweck sobre el elogio a la capacidad —92% contra
    // 33%— ni el de Kluger & DeNisi sobre las 607 mediciones, que son
    // exactamente las dos fuentes que sostienen lo que Larry no dice.
    // `mc-43` se añade en F7 (#257): sin ella la carta no podía invocar la
    // implicación 10 —«Larry never comments on the child's alias or avatar
    // choice»— que es la fuente de la frontera de apariencia e identidad.
    // `D-107`/`D-111`/`mc-28` se añaden en F9 (#401): el «necesita atención»
    // del roster se muestra como AUSENCIA de una señal positiva, nunca como
    // alerta sobre el niño — sin estas citas la carta veía el patrón y no
    // tenía con qué bloquearlo. (Llegó escrita como `D-097`, un número que no
    // existe en `decisions.md`: la numeración de F9 se reasignó al aterrizar
    // y la referencia correcta es D-111 — la validación de citas de la propia
    // flota la cazó.)
    // `D-017`/`D-020`/`mc-15` se añaden en F8 (#280, #283): el panel del padre
    // muestra el dominio en cuatro estados categóricos, nunca porcentaje ni
    // nota escolar — D-017 es la decisión que prohíbe el «grado», mc-15 es la
    // evidencia de que no existe equivalencia de grado citable con honestidad,
    // y D-020 es la letra de la nota suave: el sujeto gramatical es el patrón,
    // nunca el niño. Sin ellas la carta veía el «72% de dominio» y no tenía
    // con qué bloquearlo.
    cita: ["LR-7", "D-003", "D-004", "D-017", "D-020", "D-025", "D-027", "D-028", "D-029", "mc-10", "mc-11", "mc-15", "mc-18", "mc-43", "mc-46", "D-107", "D-111", "mc-28"],
    // `explicacion|larry` porque el módulo de explicación vive en
    // `packages/motor/`, que ninguno de los alcances heredados alcanza: sin esta
    // línea, la carta dormía justo sobre el archivo que compone lo que un niño
    // lee al equivocarse.
    // `explicacion|larry` porque el módulo de explicación vive en `packages/motor/`;
    // `tutor|en-vivo|gasto|lexico` porque F6 #136 puso el camino en vivo, su
    // compuerta y su tope en `packages/tutor/`, que ningún alcance heredado
    // alcanzaba — y ahí el texto llega al niño SIN que nadie lo haya leído.
    // `cosmetic|avatar|alias` porque #257 extendió la caza a la apariencia y la
    // identidad del niño: `packages/motor/src/cosmeticos.ts`, `alias.ts` y el
    // catálogo de #255 no tocan ningún alcance heredado, y sin esta línea la
    // carta dormiría justo sobre el código que la frontera vigila.
    alcance: [
      ...INTERFAZ,
      ...TEXTOS,
      ...ESQUEMA,
      /club|prenda|tablero|leaderboard/i,
      /explicacion|larry/i,
      /packages\/tutor\//,
      /en-vivo|gasto\.ts|lexico/i,
      /cosmetic|avatar|alias/i,
      // F9 #401: el roster del salón y la tarjeta de identidad del dueño del
      // grupo — el «necesita atención» sin vergüenza vive ahí.
      /grupo|salon|classroom/i,
      // F8 #292: el reporte por correo al padre. El riesgo propio —la
      // comparación implícita entre hermanos en el mismo correo— vive en
      // `packages/motor/src/reportes.ts`, que no matcheaba ninguno de los
      // patrones de arriba: sin esta línea, la carta que existe exactamente
      // para ese riesgo nunca despertaba sobre el archivo donde el riesgo
      // vive.
      /reporte|informe/i,
    ],
  },
  {
    id: "anti-trampa",
    titulo: "Integridad de la evaluación",
    caza:
      "Puntajes o veredictos que el cliente pueda fabricar. En concreto: cronometraje hecho en el navegador; " +
      "calificación calculada en el cliente y sincronizada después; respuestas correctas enviadas al cliente " +
      "antes de tiempo; un endpoint que acepte un puntaje ya calculado; ausencia de límite de intentos donde " +
      "importa. Y el contrapeso, que también es tu trabajo: cualquier medida anti-trampa que cruce la línea " +
      "roja #1 (cámara, micrófono, biometría, navegador bloqueado) es un hallazgo bloqueante aunque funcione.",
    ciega_a: "Rendimiento y estética del anti-trampa. Solo importa si se puede burlar, o si vigila de más.",
    cita: ["LR-1", "LR-8", "D-010", "D-020", "D-024", "mc-29", "mc-30", "mc-31"],
    alcance: [...MOTOR, /^apps\/web\/src\/pages\/api\//, ...ESQUEMA],
  },
  {
    id: "patrones-oscuros",
    titulo: "Patrones oscuros",
    caza:
      "Diseño que empuja a gastar, a quedarse o a no cancelar. En concreto: cuenta regresiva de escasez; " +
      "cancelación más difícil que la suscripción; consentimiento preseleccionado; costo mostrado tarde; " +
      "recompensa aleatoria de pago; moneda comprable; interrupción de la práctica con una oferta; " +
      "notificación que fabrica urgencia sobre el progreso de un niño. Compara contra la lista negra " +
      "explícita de D-014, que ya nombra lo prohibido.",
    ciega_a: "Monetización legítima hacia adultos que no toque práctica infantil (D-021).",
    // `D-003`, `D-025`, `D-040` y `mc-18` entran en F7 (#245). Sin ellas, esta
    // carta no podía citar nada de Ligas — y Ligas es donde viven los patrones
    // que le tocan: una posición que se pudiera comprar (D-014 fila «moneda
    // comprable»), un tablero que ordene por algo que no sean los puntos
    // acordados (D-025), un opt-in preseleccionado (D-040), o el fondo de la
    // tabla enseñado a un niño chico (`mc-18` implicación 7 y `mc-10`).
    cita: [
      "LR-4", "LR-5", "LR-6", "D-003", "D-014", "D-016", "D-021", "D-025", "D-026", "D-040",
      "mc-16", "mc-17", "mc-18", "mc-19", "mc-41",
    ],
    // El alcance filtraba por `pago|precio|suscrip|notific|push` y por interfaz,
    // así que el código nuevo de liga —que no menciona ninguna de esas palabras
    // justamente porque nada se compra— no despertaba a esta carta.
    alcance: [
      ...INTERFAZ,
      ...TEXTOS,
      /pago|precio|suscrip|notific|push/i,
      /league_|liga|duel|tablero|leaderboard|cohort|rollup-adulto/i,
    ],
  },
  {
    id: "pedagogia",
    titulo: "Pedagogía",
    caza:
      "Secuencias que enseñan mal aunque el contenido sea correcto. En concreto: ejercicios sueltos donde " +
      "debería haber una serie (CLAUDE.md: la unidad de diseño es la serie); ausencia de ejemplo trabajado " +
      "antes de la práctica; variación mal construida — todo cambia a la vez, o nada cambia; carga cognitiva " +
      "innecesaria en la presentación; retroalimentación que solo dice bien/mal sin nombrar el error; " +
      "espaciado o intercalado ausentes donde la investigación los pide.",
    ciega_a: "Corrección matemática — la cubre `rigor-matematico`. Interfaz — la cubre `ux-banda`.",
    cita: ["D-002", "D-017", "D-018", "D-019", "mc-01", "mc-02", "mc-03", "mc-04", "mc-05", "mc-11", "mc-36", "mc-39"],
    alcance: [...CONTENIDO, ...MOTOR, /^docs\/master-plan\.md$/],
  },
  {
    id: "rigor-matematico",
    titulo: "Rigor matemático",
    caza:
      "Matemática incorrecta, ambigua o mal etiquetada. En concreto: un ítem con más de una respuesta " +
      "correcta cuando declara una; un distractor que en realidad es correcto; notación mal usada; " +
      "condiciones de borde no declaradas (división entre cero, raíces de negativos, dominios); una " +
      "clasificación de nivel que no corresponde a la dificultad real; un error nombrado que no describe " +
      "el error que realmente produce ese distractor.",
    ciega_a: "Estilo de redacción y traducción. Eso es de los auditores de locale.",
    cita: ["D-006", "D-017", "D-018", "mc-07", "mc-08", "mc-09", "mc-12", "mc-36", "mc-40"],
    alcance: [...CONTENIDO, /^docs\/master-plan\.md$/],
  },
  {
    id: "rigor-cientifico",
    titulo: "Rigor científico",
    caza:
      "Afirmaciones factuales que no se pueden re-ejecutar ni rastrear. En concreto: un número sin fuente; " +
      "una cita a investigación que no dice lo que se le atribuye; una afirmación de desempeño sin la salida " +
      "del comando que la produjo; una decisión que dice apoyarse en un documento que la contradice; una " +
      "prueba de regresión que nadie vio fallar. CLAUDE.md lo dice sin margen: una aserción en tono seguro " +
      "no es un hecho.",
    ciega_a: "Opiniones declaradas como opiniones. El problema es la certeza sin respaldo.",
    cita: ["D-008", "D-023", "mc-35", "mc-40"],
    alcance: [/^docs\//, /\.md$/],
  },
  {
    id: "canon-larry",
    titulo: "El canon de Larry",
    caza:
      "A Larry haciendo algo que Larry no hace. En concreto: calculando en vez de recibir el veredicto ya " +
      "calculado; avergonzando; dando la respuesta en vez de la pista; hablando con un niño en texto libre " +
      "de ida y vuelta sin límite; cambiando de personalidad entre bandas de edad de forma incoherente; " +
      "moderando una prenda con criterio distinto al de D-029; fallando abierto cuando D-029 exige fallar " +
      "cerrado.",
    ciega_a: "Calidad del modelo o del proveedor. El asunto es lo que Larry tiene permitido hacer.",
    cita: ["LR-7", "D-004", "D-015", "D-029", "mc-11", "mc-37"],
    // F8 #283, verificado explícitamente (no asumido): las plantillas de las
    // notas de diagnóstico (`padre.nota.*` en `apps/web/src/i18n/padre/*.json`)
    // van en la voz de Larry hacia el ADULTO — la única superficie así — y el
    // namespace `cause_code` ya queda cubierto por `TEXTOS` (`/i18n\//` y
    // `/\.(json|md)$/`). No hace falta regex nuevo; sí queda escrito que la
    // cobertura se comprobó, y que el sujeto gramatical de esas notas (el
    // patrón o la habilidad, nunca el niño) lo vigila `anti-humillacion` con
    // D-020 ya en su cita.
    alcance: [/larry/i, /prompt/i, /modera/i, ...TEXTOS],
  },
  {
    id: "rachas-pantalla",
    titulo: "Rachas y tiempo de pantalla",
    caza:
      "Cualquier camino de código donde respetar el límite de pantalla cueste la racha, y cualquier forma " +
      "de vender protección de racha. También: una racha que presione a jugar a deshoras; un límite que se " +
      "pueda saltar sin que el padre lo sepa; una notificación que empuje a romper el límite; un corte de " +
      "sesión que pierda el trabajo del niño a media respuesta.",
    ciega_a: "Otras formas de gamificación — las cubre `patrones-oscuros`.",
    cita: ["LR-6", "D-014", "D-016", "mc-16", "mc-19", "mc-26"],
    alcance: [...INTERFAZ, ...ESQUEMA, /racha|streak|pantalla|screen.?time|limite/i],
  },
  {
    id: "kinder",
    titulo: "Kinder (4–6 años)",
    caza:
      "Todo lo que un niño de 4 a 6 años no puede hacer, apareciendo en su banda. En concreto: texto que " +
      "haya que leer para poder jugar; escritura; arrastrar y soltar; blancos táctiles menores a 88 px; " +
      "reloj visible o presión de tiempo; puntuación que dependa del tiempo (D-024 la prohíbe: es " +
      "`valor_del_ítem · acc`, sin tiempo); instrucciones de más de un paso; tipografía de trazo delgado.",
    ciega_a: "Bandas mayores. Si el cambio no toca KINDER, no es tuyo.",
    // `D-016` se añade en F8 (#274): sin ella la carta no puede explicar por
    // qué el aviso y la despedida del límite de pantalla en KINDER no llevan
    // cifra ni cuenta regresiva — su `caza` la lleva exactamente ahí y no
    // tenía con qué citarlo.
    cita: ["LR-3", "D-016", "D-017", "D-020", "D-024", "mc-06", "mc-20", "mc-38"],
    alcance: [...INTERFAZ, ...CONTENIDO, ...MOTOR, /kinder/i],
  },
  {
    id: "pwa-ios",
    titulo: "PWA en iOS",
    caza:
      "Supuestos que iOS no cumple. En concreto: depender de `beforeinstallprompt` (no existe en iOS); " +
      "suponer push sin instalación previa; usar APIs que Safari no soporta sin degradar; almacenamiento " +
      "que iOS desaloja a los 7 días sin uso; suponer que el service worker sobrevive; pantalla completa " +
      "o barra de estado mal manejadas; un flujo de instalación que no explique el camino manual " +
      "(Compartir → Añadir a inicio).",
    ciega_a:
      "Android y escritorio. Y el comportamiento offline en general — eso es de `pwa-offline`; lo tuyo es " +
      "solo lo que iOS hace distinto. Si el problema existiría igual en Android, no es tuyo.",
    cita: ["D-030", "D-031", "mc-33"],
    alcance: SERVICIO,
  },
  {
    id: "pwa-android",
    titulo: "PWA en Android",
    caza:
      "Rupturas de la convención nativa de Android y de Material 3. En concreto: navegación que ignora el " +
      "botón atrás del sistema; íconos sin variante maskable (Android recorta y solo el 80% central está " +
      "garantizado); gestos que chocan con los del sistema; teclado que tapa el campo activo; barra de " +
      "estado con contraste insuficiente; instalación que no aprovecha `beforeinstallprompt` donde sí existe.",
    ciega_a:
      "iOS y escritorio. Y el comportamiento offline en general — eso es de `pwa-offline`; lo tuyo es solo " +
      "lo que Android y Material 3 esperan. Si el problema existiría igual en iOS, no es tuyo.",
    cita: ["D-030", "D-031", "mc-33"],
    alcance: SERVICIO,
  },
  {
    id: "pwa-offline",
    titulo: "PWA-first y offline",
    caza:
      "Funcionalidad que se cae sin red y no debería, y precaché que crece sin control. En concreto: una " +
      "pantalla que muestre error en vez de contenido cacheado; una respuesta del niño que se pierda al " +
      "perder conexión; una estrategia de caché que sirva contenido obsoleto sin revalidar; precaché por " +
      "encima del presupuesto; un service worker que no se actualice o que se quede atorado en una versión.",
    ciega_a: "Diferencias entre iOS y Android — las cubren sus propios auditores.",
    cita: ["D-030", "mc-32", "mc-33"],
    alcance: SERVICIO,
  },
  // --- Personalidad nativa por plataforma (D-031, D-036, D-041) -----------
  // `pwa-ios`/`pwa-android`, arriba, cazan mecánica de instalación —lo que
  // rompe si el navegador no coopera. Estas cinco cazan lo que las anteriores
  // no pueden ver aunque el código sea perfecto: que la interfaz SE VEA y SE
  // SIENTA de la plataforma. `band-typography.mjs` (determinista) ya comprobó
  // que el CSS declara la fuente correcta, pero por escrito admite que no
  // comprueba "cómo se ve" — es exactamente el hueco que este grupo cierra:
  // un enlace sin `color`/`text-decoration` propios pasa cualquier auditor
  // determinista y de todas formas se ve azul-subrayado, como una página web
  // sin diseñar, no como un control nativo.
  {
    id: "nativo-ios",
    titulo: "Personalidad nativa — iOS",
    caza:
      "Interfaz que no se lee como Human Interface Guidelines en un iPhone. En concreto: un control (enlace, " +
      "botón, campo) sin color/decoración propios que caiga al azul-subrayado por default del navegador; " +
      "radios que no sean los 10-12pt de HIG; sombra en un botón (HIG no la usa, la jerarquía es de color); " +
      "la barra de pestañas inferior sin material translúcido o sin respetar `env(safe-area-inset-bottom)`; " +
      "tipografía de marca (Raleway) en un control de sistema en vez de la fuente del sistema (D-036); el " +
      "elemento activo marcado con una píldora en vez de con color de texto (esa es la seña de Android, no " +
      "la de iOS).",
    ciega_a:
      "Android, Windows, macOS. Mecánica de instalación (`beforeinstallprompt`, almacenamiento, service " +
      "worker) — eso es `pwa-ios`. iPad específicamente — eso es `nativo-ipad`. Si el problema existiría " +
      "igual en un navegador de escritorio sin táctil, no es tuyo.",
    cita: ["D-031", "D-036", "mc-33", "mc-47"],
    alcance: [...INTERFAZ, ...TEXTOS],
  },
  {
    id: "nativo-ipad",
    titulo: "Personalidad nativa — iPad, primera clase",
    caza:
      "Lo que D-041 obliga y el teléfono no obligaba. En concreto: `orientation: landscape` forzado en el " +
      "manifest (rompe Android, y vertical tiene que funcionar con dignidad, no bloquearse); una interfaz que " +
      "no aguante Split View/Stage Manager a un tercio o a la mitad de ancho; un estado *hover* que ESCONDA " +
      "una función en vez de ser un añadido sobre lo que ya funciona con el dedo; navegación que no se pueda " +
      "completar por teclado físico con foco visible (WCAG 2.1.1/2.4.7); un gesto que Apple Pencil no puede " +
      "hacer del que algo dependa; un blanco táctil de 88px de kinder relajado por 'hay más pantalla' — D-041 " +
      "dice lo contrario, se relaja al revés.",
    ciega_a:
      "Lo que ya cubre `audits/ipad-usabilidad.mjs` (determinista) sobre orientación/desbordamiento. " +
      "Preocupaciones de iPhone puro (pantalla chica, una sola mano) — eso es `nativo-ios`. Si el problema " +
      "desaparecería en un iPhone, no es tuyo.",
    cita: ["D-041", "D-031", "mc-20", "mc-21", "mc-33", "mc-38"],
    alcance: [...INTERFAZ, ...TEXTOS],
  },
  {
    id: "nativo-android",
    titulo: "Personalidad nativa — Android, Material 3",
    caza:
      "Interfaz que no se lee como Material 3. En concreto: radios que no sean cápsula (20dp en controles, " +
      "100px en la píldora del elemento activo); sombra en un botón relleno (M3 expresa jerarquía con color, " +
      "no con elevación de sombra); el elemento activo de la navegación marcado solo con color de texto (esa " +
      "es la seña de iOS, no la de Android — aquí lleva píldora detrás del ícono); un ícono de instalación " +
      "sin variante *maskable* (Android recorta al 80% central); tipografía de marca en un control de sistema " +
      "en vez de Roboto (D-036); navegación que ignore el botón/gesto atrás del sistema.",
    ciega_a:
      "iOS, Windows, macOS. Mecánica de instalación (`beforeinstallprompt`, íconos, gestos del sistema) — " +
      "eso es `pwa-android`. Si el problema existiría igual en un navegador de escritorio, no es tuyo.",
    cita: ["D-031", "D-036", "mc-33", "mc-47"],
    alcance: [...INTERFAZ, ...TEXTOS],
  },
  {
    id: "nativo-windows",
    titulo: "Personalidad nativa — Windows, Fluent",
    caza:
      "Interfaz que no se lee como Fluent. En concreto: radios grandes o de cápsula donde Fluent usa 4px; el " +
      "elemento activo sin la línea de acento que lo subraya (la seña de Fluent, distinta de la píldora de " +
      "Android y del color-de-texto de iOS); tipografía de marca en un control de sistema en vez de Segoe UI " +
      "Variable (D-036); una interfaz que asuma táctil-primero (blancos de 88px, gestos de swipe) donde " +
      "Windows es predominantemente teclado y mouse — sin que eso relaje el mínimo WCAG de 24px, que sigue " +
      "aplicando siempre.",
    ciega_a:
      "iOS, Android, macOS. Integración de escritorio (barra de tareas, ventana) — no hay auditor propio " +
      "todavía; repórtalo igual si lo encuentras, pero no es el foco de esta carta.",
    cita: ["D-031", "D-036", "mc-33"],
    alcance: [...INTERFAZ, ...TEXTOS],
  },
  {
    id: "nativo-macos",
    titulo: "Personalidad nativa — macOS",
    caza:
      "Interfaz que no se lee como macOS. En concreto: una barra de navegación inferior pintada en macOS " +
      "(la navegación vive arriba; el borde de abajo es del Dock, no de la app — `plataformas.css` ya la " +
      "apaga con `display: none` para este `data-platform`, así que si aparece es una regresión, no una " +
      "superficie nueva sin cubrir); radios que no sean los 6px compactos de macOS; controles dimensionados " +
      "para el dedo en vez de para el cursor; tipografía de marca en un control de sistema en vez de SF Pro " +
      "(D-036); ausencia de estado *hover* en un elemento donde el mouse es la entrada primaria.",
    ciega_a:
      "iOS/iPad (comparten motor con macOS pero D-041 los trata distinto — un iPad con marca táctil no es " +
      "esta carta, es `nativo-ipad`). Windows, Android.",
    cita: ["D-031", "D-036", "mc-33"],
    alcance: [...INTERFAZ, ...TEXTOS],
  },
  {
    id: "red-lenta",
    titulo: "Rendimiento en red lenta",
    caza:
      "Lo que hace inusable el producto en un Android de gama baja sobre 4G lento. En concreto: JavaScript " +
      "que bloquea la primera pintura; fuentes que causan salto de texto; imágenes sin dimensiones (que " +
      "provocan CLS); peticiones a terceros; trabajo en el hilo principal que empuje el INP por encima de " +
      "150 ms (D-030); cascadas de peticiones donde cabía una; assets sin comprimir o en formato pesado.",
    ciega_a: "Elegancia del código. Solo importa el efecto medible en el dispositivo lento.",
    cita: ["D-030", "D-031", "mc-32", "mc-33", "mc-47"],
    alcance: [...INTERFAZ, /\.(css|js|ts|astro|woff2?|png|jpe?g|webp|avif|svg)$/],
  },
  {
    id: "ux-banda",
    titulo: "UX por banda de edad",
    caza:
      "Interfaz que no corresponde a quien la usa. En concreto: densidad de adulto en banda infantil o " +
      "juguetería en banda adulta; tema claro forzado donde la investigación pide oscuro para adolescentes " +
      "y adultos; blancos táctiles por debajo del mínimo de la banda (24 px WCAG / 44 px HIG / 88 px kinder); " +
      "jerarquía tipográfica que no distingue lo importante; una misma pantalla sirviendo a dos bandas con " +
      "necesidades opuestas.",
    ciega_a: "Kinder — tiene auditor propio. Rendimiento — lo cubre `red-lenta`.",
    cita: ["D-017", "D-031", "D-036", "D-041", "mc-20", "mc-21", "mc-22", "mc-23", "mc-38", "mc-43"],
    alcance: [...INTERFAZ, ...TEXTOS],
  },
  // --- Uno por locale (D-022, D-032) --------------------------------------
  // El contenido matemático no se traduce, se autora. Cada uno de estos siete
  // juzga SU locale y ninguno más.
  ...LOCALES.map((locale) => ({
    id: `locale-${locale}`,
    titulo: `Locale ${locale}`,
    caza:
      `Todo lo que esté mal en ${locale} específicamente. Convención numérica: separador decimal y de ` +
      `millares correctos para ESTE locale, no para su idioma en general. Nombres de números donde el ` +
      `idioma los construye distinto. Formato de fecha y hora. Traducción literal donde hacía falta ` +
      `autoría: un problema que funciona en un idioma y se rompe en el tuyo por cómo se dicen los ` +
      `números, cómo se lee de izquierda a derecha una operación, o qué currículo espera un niño de esa ` +
      `edad en ese país. Registro y tuteo apropiados para hablarle a un niño en ${locale}. Cadenas sin ` +
      `traducir, o traducidas con el locale hermano (es-MX no es es-ES; pt-BR no es pt-PT).`,
    ciega_a:
      `Los otros seis locales, y la corrección matemática en abstracto — eso es de \`rigor-matematico\`. ` +
      `Tu trabajo es si funciona en ${locale}.`,
    cita: ["D-005", "D-022", "mc-15", "mc-34"],
    alcance: [...TEXTOS, ...CONTENIDO, new RegExp(locale.replace("-", "[-_]?"), "i")],
  })),
];

/** Índice por id, para `--solo`. */
export const POR_ID = new Map(CARTAS.map((c) => [c.id, c]));

if (CARTAS.length !== 28) {
  throw new Error(
    `D-032 pide 28 auditores adversariales; cartas.mjs define ${CARTAS.length}. ` +
      `Si el número cambia a propósito, cámbialo también en decisions.md y en run.mjs.`,
  );
}
