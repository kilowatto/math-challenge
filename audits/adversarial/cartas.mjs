// Las 23 cartas de la flota adversarial (D-032, fase F1).
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
// despertar al auditor de PWA en iOS: 23 llamadas de LLM por revisión tienen
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
 * ciega_a  · qué NO es asunto suyo. Sin esto, 23 auditores reportan lo mismo y
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
      "Estética, rendimiento, ortografía, y todo lo que no sea una de las ocho líneas. Otros 22 auditores " +
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
    cita: ["LR-2", "LR-3", "D-012", "D-013", "D-027", "mc-25", "mc-27", "mc-30"],
    alcance: [...ESQUEMA, ...MOTOR, /^apps\//, /^docs\//],
  },
  {
    id: "anti-humillacion",
    titulo: "Anti-humillación",
    caza:
      "Cualquier superficie donde una persona quede expuesta ante otras por su desempeño, su lentitud o su " +
      "error. Incluye: tableros que muestren últimos lugares; comparaciones no pedidas; un texto que insinúe " +
      "vergüenza; una prenda de club con perdedor; un campo de esquema donde quepa un castigo dirigido a " +
      "alguien; notificaciones que le digan a un tercero que alguien falló. Recuerda que en D-028 no existe " +
      "una casilla para el último lugar: si un cambio la crea, eso es el hallazgo.",
    ciega_a: "Dificultad del contenido. Un problema difícil no es humillación.",
    cita: ["LR-7", "D-003", "D-025", "D-027", "D-028", "D-029", "mc-10", "mc-18", "mc-46"],
    alcance: [...INTERFAZ, ...TEXTOS, ...ESQUEMA, /club|prenda|tablero|leaderboard/i],
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
    cita: ["LR-4", "LR-5", "LR-6", "D-014", "D-016", "D-021", "D-026", "mc-16", "mc-17", "mc-19", "mc-41"],
    alcance: [...INTERFAZ, ...TEXTOS, /pago|precio|suscrip|notific|push/i],
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
    cita: ["LR-3", "D-017", "D-020", "D-024", "mc-06", "mc-20", "mc-38"],
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

if (CARTAS.length !== 23) {
  throw new Error(
    `D-032 pide 23 auditores adversariales; cartas.mjs define ${CARTAS.length}. ` +
      `Si el número cambia a propósito, cámbialo también en decisions.md y en run.mjs.`,
  );
}
