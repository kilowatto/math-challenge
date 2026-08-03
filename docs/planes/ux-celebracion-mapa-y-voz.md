# UX · Celebración, navegación del reto, mapa y voz — análisis y propuesta

> **2026-08-03.** Petición del dueño: (1) hacer el producto más amistoso en
> todos los niveles — frases variadas que casi no se repitan, con efectos
> especiales que se puedan apagar; (2) repensar la interfaz del reto —
> «siguiente» medio automático, «ya terminé» como salida de esquina;
> (3) selección de niveles con imágenes de apoyo, un catálogo mejor
> presentado; (4) mejorar la voz del navegador: emoción, dicción,
> sentimiento.
>
> **Cómo se produjo:** análisis del código real (mapa exacto en §1),
> investigación web (2025-2026, citada en §2), y revisión de las líneas
> rojas que esta petición puede cruzar (§3) — una de ellas sí la cruza y
> hay que decirlo de frente.

## 1. Lo que existe hoy, medido en el código

### 1.1 El reto (`components/reto/Pantalla.astro`, una sola pantalla para niño y adulto)

- Botones: `#confirmar` («Ya está»), `#reintentar` (solo tras fallo),
  `#siguiente` (tras veredicto), y **«Ya terminé», que es un `<a href>`
  siempre visible** (`Pantalla.astro:251`) — navegación pura, **sin
  señal al servidor**. Por eso el bono `reto_completado` nunca se otorga
  (`apps/web/src/lib/progreso.ts:51-53`: «hoy nadie observa el final de
  un reto»).
- **Al acertar NO pasa nada festivo**: el texto `acierto` («Eso es.») y
  un borde de color. Está prohibido por comentario del código
  (`:934-947`, mc-17 §11: recompensa informativa sí, controladora no).
  El XP «cambia el número y ya».
- **No hay avance automático**: todo es manual por «Siguiente»
  (`:879-910`). No hay contador de ítems, ni reloj, ni puntaje en la
  pantalla del niño.
- Frases: **86 claves por locale en `i18n/reto/*.json`**, elegidas en el
  servidor (`explicacion.ts:337-408`) — acierto, error con causa
  nombrada, par «inesperada» con respaldo inglés.
- `/api/larry` (camino en vivo) existe y **ninguna pantalla lo llama**.

### 1.2 El mapa (`app/mapa.astro` + `components/mapa/*`)

- El sendero KINDER y el árbol PRIMARIA/SECUNDARIA **están construidos
  pero no los sirve ninguna ruta** (`Sendero.astro:33-37`: «no está en
  el camino de nadie»). Lo único visible hoy es el tablero SERIO (dos
  cifras: XP y racha).
- **No hay ninguna imagen**: el compañero es un hueco declarado (`◍`
  con `data-hueco-de-arte="larry"`, `Companero.astro:62-79`).
- **El mapa no enlaza a ningún reto**: el niño entra por reja de caras
  + PIN directo a jugar; no existe selección de nivel (la elige el
  motor, D-017/D-060).

### 1.3 La voz (`speechSynthesis`, script inline de Pantalla.astro)

- Detección por coincidencia **exacta** de región (`pt-BR` no sirve
  para `pt-PT`, `:470-475`); sin voz exacta, botones ocultos + aviso
  (D-078).
- Atributos hoy: `rate = 0.9`, **sin pitch**, `cancel()` antes de cada
  frase (`:496-519`). Se lee el enunciado y el veredicto.
- El contrato de `packages/tutor/src/voz.ts` define regímenes
  (`mientras_resuelve` 6 s, `al_resolver` 500/800 ms, celebración de
  sesión 2.5 s) — **sin implementación visual ni de audio detrás**.
- Los números hablados autorados (`i18n/voz/*.json`, 23 por locale)
  existen y **no están cableados a ninguna pantalla**.

### 1.4 Efectos

- **Cero sonidos** (ningún `Audio`, `AudioContext`, mp3). Animaciones
  mínimas: 120 ms en opciones, `aparece` de 220 ms solo bajo
  `prefers-reduced-motion: no-preference`. No hay toggle de efectos
  propio; `tokens.css:224-230` ya aplana todo bajo reduced-motion.

## 2. Lo que hay afuera, verificado en vivo

**Efectos de celebración (librerías):**
- `canvas-confetti` es la librería estándar de facto: «the most-used
  confetti library — battle-tested, tiny, and visually polished»
  `[verificado en vivo: pkgpulse.com/guides/canvas-confetti-vs-tsparticles-vs-party-js-celebration-2026]`.
  ~6 KB min+gz, MIT, configurable (colores, partículas, origen).
- Alternativas: `party.js`, `tsparticles` (más pesada), `spawn-confetti`
  (más simple) `[verificado en vivo: GitHub alyshukry/spawn-confetti]`.
- La vía sin dependencia: keyframes CSS (el producto ya usa esa técnica
  en `reto.css:513-515`) — cero peso nuevo, cero dependencia que
  auditar.

**Celebración y avance en apps de aprendizaje:**
- Duolingo: la pantalla de celebración es un **momento propio** (la
  mascota cobra vida) y el avance es por botón «Continue» — el feedback
  correcto no espera a que el usuario decida, la app ya está lista para
  seguir `[verificado en vivo: blog.duolingo.com/new-duolingo-home-screen-design/,
  60fps.design/shots/duolingo-button-tactile-interaction]`.
- La literatura de gamificación 2025 insiste en lo mismo que D-014:
  celebrar el proceso, nunca crear escasez `[verificado en vivo:
  theeduassist.com/gamification-guide-2025-learning-experience-design/]`.
- Bebras (mc-52) confirma que tareas de 1-4 minutos con feedback
  inmediato son el formato que sostiene atención a estas edades.

**Voz y expresividad:**
- La Web Speech API **no tiene SSML**: no hay `<prosody>`, `<break>` ni
  `<emphasis>` en `speechSynthesis` — eso es de los servicios de nube
  (Azure SSML) `[verificado en vivo: learn.microsoft.com SSML]`. Lo que
  sí controla: `rate` (0.1-10), `pitch` (0-2), `volume`, la elección de
  voz, y **dónde se corta el texto** (varias utterances con pausas).
- La prosodia ES el canal de la emoción en síntesis: la literatura de
  conversión de emoción trabaja sobre todo con pitch y ritmo
  `[verificado en vivo: ijiset.com prosody conversion]`.
- Las voces del SO varían muchísimo por calidad: Safari/iOS trae voces
  «premium/enhanced» descargables por idioma; Chrome desktop prefiere
  las de Google; Android las de Google TTS. Una heurística de selección
  (preferir nombres con «natural», «neural», «premium», «enhanced») es
  la palanca más barata y real.

## 3. Las líneas que esta petición toca (y la que cruza)

- **«Haciendo booo» NO entra.** Un efecto de abucheo al fallar cruza la
  línea roja #7 (Larry nunca avergüenza), `mc-11` (el feedback a la
  persona empeora el desempeño) y `mc-10` (la presión de rendimiento
  empeora el desempeño, no el ánimo). Al fallar, el producto ya hace lo
  correcto: explicar la causa sin juicio. Lo que SÍ puede haber al
  fallar es un matiz visual amable (Larry pensativo), nunca sonido de
  reprobación ni marca de error sobre el niño.
- **Las frases se autoran por locale, nunca se traducen** (D-022), y
  siguen las reglas de `mc-11`/`anti-humillacion`: elogio al proceso
  («lo intentaste otra vez y salió»), jamás al rasgo («qué inteligente
  eres»), jamás comparación, jamás conteo de fallos.
- **Nada aleatorio** (D-014, D-092: ni siquiera gratis). «Que casi
  nunca se repitan» se logra con **rotación determinista** (índice por
  día y contador de aciertos), no con azar — y así es además
  reproducible y auditable.
- **El toggle es requisito de accesibilidad**, no cortesía:
  `prefers-reduced-motion` ya aplana todo (`tokens.css`); el toggle de
  efectos propio va encima y se persiste (mc-38 implicación 6 pide
  control persistente de movimiento/sonido).
- **Peso**: el mercado es Android gama baja (mc-47). `canvas-confetti`
  (~6 KB) cabe si se carga solo al primer acierto; la vía CSS no cuesta
  nada. Decisión en la ola de preguntas.

## 4. La propuesta (pendiente de tus respuestas)

### 4.1 Celebración por niveles

- **150 frases de acierto por locale** (~25 por banda), autoradas, con
  rotación determinista: `indice = hash(día_local, contador_aciertos)
  mod 150`. Se agotan antes de repetir; el orden es reproducible.
  Reglas de `mc-11` en el canon de autoría, verificadas por
  `larry-nunca-averguenza` extendido al nuevo diccionario.
- **Tres intensidades de efecto**, de menor a mayor: acierto normal
  (micro-animación CSS de 220 ms + frase nueva), hito de reto
  completado (efecto mayor + frase de cierre), hito de racha/dominio
  (el momento «mascota cobra vida»). Todo detrás del toggle.
- **Al fallar:** como hoy (causa explicada sin juicio) + opción de
  matiz visual amable (Larry pensativo), nunca sonido ni marca de
  reprobación.

### 4.2 Navegación del reto

- **«Siguiente» semi-automático:** tras leerse el veredicto (o tras su
  pausa equivalente sin voz), el avance ocurre solo — con el botón
  visible siempre y la pausa instantánea al tocar cualquier cosa.
- **«Ya terminé» → salida de esquina** (ícono de puerta/X arriba a la
  izquierda, zona de 48 px) **que sí llama al servidor**: cierra la
  sesión del reto y otorga el bono de finalización — arregla el hueco
  declarado de #192/`progreso.ts:51` de paso. Para el niño, la salida
  es del mismo tamaño y lugar en todas las pantallas (regla de
  previsibilidad de `mc-38`).

### 4.3 El mapa como catálogo visual

- Enrutar el sendero KINDER y el árbol que ya existen: la entrada al
  reto pasa por el mapa (un toque en el lugar en curso → el reto), no
  solo por la reja de caras.
- **Arte por lugar** (Recraft, continuidad con Larry, AVIF/WebP): cada
  lugar de la Sabana y cada nodo del árbol con su imagen; el hueco `◍`
  se llena por fin. La Sabana no habla (D-019): el arte se autora una
  vez y sirve a los 7 locales.
- El adulto (SERIO) conserva su tablero de cifras; la selección de
  nivel sigue siendo del motor (D-017), el mapa es presentación, no
  selector de dificultad.

### 4.4 La voz con emoción (dentro de `speechSynthesis`)

- **Perfiles de prosodia por tipo de mensaje:** celebración
  (`rate ~1.05`, `pitch ~1.2`), explicación (`rate 0.9`, `pitch 1.0`),
  ánimo tras fallo (`rate 0.85`, `pitch ~0.95`), aviso de límite
  (`rate 0.85`, `pitch 1.0`, pausas). Es la única palanca de emoción
  que la API del navegador ofrece — y es real: la prosodia ES el canal
  de la emoción (§2).
- **Fraseo por frases:** cortar el veredicto en 2-3 utterances con
  pausas naturales en lugar de una sola corrida (mejora la dicción más
  que cualquier parámetro).
- **Mejor selección de voz:** heurística que prefiere voces
  «natural/neural/premium/enhanced» del SO antes que la primera
  coincidencia de región, manteniendo la regla de D-078 (si no hay voz
  del locale, no se ofrece y la pantalla lo dice).
- **Dicción de números:** cablear `numerosHablados()` (ya autorado en
  los 7 locales, hoy sin uso) para que «127 : 4 = 31,75» se lea en
  palabras, no dígito a dígito.
- **Límite honesto:** la Web Speech API no tiene SSML; la emoción
  alcanzable es prosódica, no actoral. Si algún día se quiere voz
  actoral, es audio pregenerado (la pista de F6 P-19), no esta API.

## 5. Preguntas al dueño

En dos olas: (1) librería de efectos vs CSS propio, rotación de frases,
matiz al fallar, toggle; (2) avance semi-automático, salida de esquina
con cierre en servidor, mapa con arte, perfiles de voz. Cada una con
sus pros y contras.

## Fuentes

1. PkgPulse — canvas-confetti vs tsparticles vs party.js (2026-03) —
   https://www.pkgpulse.com/guides/canvas-confetti-vs-tsparticles-vs-party-js-celebration-2026
2. Duolingo Blog — new learning path (2022) —
   https://blog.duolingo.com/new-duolingo-home-screen-design/
3. 60fps.design — Duolingo button tactile interaction —
   https://60fps.design/shots/duolingo-button-tactile-interaction
4. The EduAssist — Gamification Guide 2025 —
   https://theeduassist.com/gamification-guide-2025-learning-experience-design/
5. Microsoft Learn — SSML (lo que la Web Speech API NO tiene) —
   https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice
6. IJISET — Prosody conversion from neutral to emotional speech —
   https://ijiset.com/vol3/v3s2/IJISET_V3_I2_19.pdf
7. Código real: `apps/web/src/components/reto/Pantalla.astro`,
   `apps/web/src/lib/progreso.ts:51`, `packages/tutor/src/voz.ts`,
   `apps/web/src/i18n/reto/*.json` (86 claves × 7 locales, medido).

---

## 6. Anexo (2026-08-03, noche) — La familia completa como núcleo de competencia sana

Petición del dueño: «falta la manera de armar a la familia completa
donde se vinculen 2 papás y tantos hijos tengan o quieran, incluidos
adolescentes y adultos, porque también pueden jugar y retarse entre
ellos — la familia es el principal núcleo de competencia sana».

### Lo que existe hoy (medido)

- **Un solo padre por cuenta**: `child_profiles.parent_user_id` es una
  sola FK (`migrations/0002:16`); los dispositivos del hogar cuelgan de
  esa misma cuenta (`household_devices.owner_user_id`, `0003:133`). No
  hay segundo padre en el esquema, y `mc-27` no lo contempla: el modelo
  documentado es «un adulto crea la cuenta y añade perfiles».
- **Los adolescentes y adultos de la familia pueden jugar ya**: como
  `users` con `is_learner = 1` (D-034/D-082), con su propia racha/XP
  polimórfica (0007) y sus puntos en `score_totals_adulto` (0012).
- **Los moldes de competencia ya existen**: la tabla de liga, el duelo
  1:1 (`league_duel`), y el reto con ventana de F10 (`club_challenge`,
  mismo `item_set` para todos). Ninguno aplica al hogar tal cual: la
  liga es anónima, el club de papás exige código y aprobación por hijo
  (D-011), y el club de adultos no admite perfiles de niño salvo
  adolescentes aprobados (D-120).
- **La regla que no se puede romper**: niño y adulto nunca en la misma
  estructura social por omisión (D-027) — una tabla familiar debe
  mostrar las dos listas **separadas en la misma pantalla**, nunca
  unidas (la prohibición de UNION de 0012 hecha principio).

### Las opciones (en la ola de preguntas)

1. **Vínculo del segundo padre**: por código de invitación al hogar
   (el patrón que F9 ya usa para todo), con registro de quién invitó y
   cuándo — revocable, y con los mismos derechos o con derechos
   acotados.
2. **El contenedor de la competencia familiar**: una **vista** sobre el
   hogar (sin estructura nueva: hijos y adultos vinculados, listas
   separadas), o un grupo automático por hogar reutilizando
   `child_group`, o una estructura `family` nueva.
3. **Quién compite**: hijos + adultos en la misma pantalla (dos
   listas), o solo los hijos.
4. **El reto familiar**: el «reto del día» compartido con el mismo set
   congelado para todos (molde `club_challenge`), o duelo 1:1 (molde
   `league_duel`), o solo la tabla.

### Por qué importa el orden de construcción

El vínculo del segundo padre es la pieza que **bloquea todo lo demás**
(sin dos adultos no hay hogar completo), y es la que toca el esquema de
consentimiento (¿los dos padres pueden aprobar/revocar lo mismo? — eso
es D-013/D-051 y hay que decidirlo con cuidado, no de paso). El reto
familiar no necesita nada de eso si sale como vista: se construye sobre
datos que ya existen.
