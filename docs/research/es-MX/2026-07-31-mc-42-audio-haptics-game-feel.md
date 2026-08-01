# Audio, música, hápticos, movimiento y el «juice» en los juegos de aprendizaje

> Investigación Math Challenge — 2026-07-31 — tema 42

## Resumen ejecutivo (ES)

El "juice" (retroalimentación sensorial exagerada: sonido, partículas, sacudida
de pantalla) hace que un juego se sienta mejor sin cambiar su lógica — tesis
central de *Game Feel* de Steve Swink y de la charla de 2012 "Juice It or Lose
It" de Jonasson y Purho [1][2]. Pero Math Challenge es software educativo, y
ahí aparece una tensión real: el efecto del sonido irrelevante muestra que
el habla y la música de fondo degradan la memoria de trabajo aunque no se les
preste atención consciente [3], y el principio de coherencia de Mayer dice
que el material decorativo —incluida la música de fondo— debe eliminarse
porque compite por recursos cognitivos limitados [4]. Ninguno de los dos
lados está equivocado: el juice ayuda a la motivación; la música de fondo
durante el cálculo activo puede perjudicar el desempeño. La resolución
práctica es separar los momentos: silencio durante el intento, juice completo
solo en el instante de recompensa/error.

Para niños de 4 años que no leen, el audio no es decoración — es el canal de
instrucción. La Vibration API no tiene soporte en Safari de iOS en ninguna
versión probada, así que la vibración no puede ser el canal de recompensa
principal en iPad/iPhone [5][6]. `speechSynthesis` tiene soporte amplio de
navegador, pero la calidad y disponibilidad de voces por idioma es una
propiedad del sistema operativo, no del navegador [7][8]. La política de
autoplay bloquea cualquier audio con sonido antes de un gesto del usuario
[9][10][11], lo que define la pantalla de inicio, y la regla de
accesibilidad "ninguna información esencial solo por sonido" [12] exige un
equivalente visual para cada señal de audio.

## Executive summary (EN)

"Juice" — exaggerated feedback (sound, particles, screen shake) — makes a
game feel better without changing its logic, per Steve Swink's *Game Feel*
and the 2012 talk "Juice It or Lose It" [1][2]. Math Challenge is learning
software, though, and a genuine tension follows: the irrelevant-sound effect
shows background speech/music degrades working memory even when unattended
[3], and Mayer's coherence principle says decorative audio should be stripped
from instructional material because it competes for limited cognitive
capacity [4]. Both are right in their frame — juice aids motivation; ambient
sound during active calculation can hurt performance. The practical
resolution is to separate the moments: silence while solving, full juice only
at the reward/error instant.

For 4-year-old pre-readers, audio is the instruction channel, not decoration.
The Vibration API has no iOS Safari support in any version tested, so it
cannot be the primary reward channel on iPad/iPhone [5][6]. `speechSynthesis`
has broad browser support, but voice quality/availability per language is an
OS property, not a browser one [7][8]. Autoplay policy blocks any unmuted
audio before a user gesture [9][10][11], which shapes the start screen, and
the "no sound-only feedback" accessibility rule [12] requires a visual
equivalent for every audio cue.

---

## Findings

### 1. El game feel y el "juice"

*Game Feel* (2008) de Steve Swink enmarca el "feel" (la sensación) como
control + espacio simulado + pulido, donde el pulido es el sonido, las
partículas, la sacudida de pantalla y el suavizado (easing) que comunican
estado sin cambiar las reglas [1]. La charla de GDC Europe 2012 "Juice It or
Lose It" (Jonasson y Purho) es la demostración práctica ampliamente citada:
un juego minimalista se va "juiceando" progresivamente con squash-and-stretch,
partículas, sacudida de cámara y sonido hasta que se percibe mucho más
satisfactorio, sin ningún cambio mecánico [2]. Para Math Challenge la
conclusión es que el juice es barato y eleva directamente la recompensa
percibida de una respuesta correcta — lo que importa más para niños de 4
años, cuyo enganche está impulsado más por la recompensa sensorial inmediata
que por el seguimiento del progreso a largo plazo.

### 2. Sonidos de recompensa

Un sonido corto, distintivo y de afecto positivo para la respuesta correcta
funciona como un reforzador secundario, de la misma forma que los sonidos de
"moneda" en los juegos — un elogio instantáneo e independiente del idioma.
Para un niño de 4 años, el timbre *es* el elogio, entregado antes de que se
pudiera leer cualquier texto. Mantener esos sonidos cortos (~300-500ms para
un tick; hasta ~1-2s para una celebración más grande) para que nunca
retrasen la siguiente pregunta.

### 3. Música de fondo: una tensión genuina y sin resolver

**En contra.** El efecto del sonido irrelevante es un hallazgo robusto de la
psicología cognitiva: el sonido de fondo no relacionado —habla, música u
otros estímulos no silenciosos— degrada el recuerdo serial y la memoria de
trabajo aun cuando se ignora y no se está evaluando directamente [3]. La
explicación estándar es que el material auditivo variable interfiere con el
bucle fonológico usado para el repaso verbal, y aplica a la música, no solo
al habla [3]. El principio de coherencia de Mayer, de su *Cognitive Theory of
Multimedia Learning*, establece de forma independiente que el material
extraño —incluida la música de fondo decorativa— debe excluirse porque
consume una capacidad de procesamiento limitada que necesita la lección
misma [4]; es uno de los hallazgos más replicados en la investigación de
multimedia educativa.

**A favor.** Ninguno de los dos hallazgos argumenta en contra del sonido
*momentáneo y significativo* — un timbre de correcto/incorrecto,
instrucciones habladas para prelectores, un sting de celebración. Ambos
apuntan a la decoración *continua y concurrente*, no a la retroalimentación
ligada a un evento puntual (§1).

**Síntesis:** tratar "mientras se resuelve" y "al resolver" como regímenes de
audio separados. El silencio es lo predeterminado mientras se resuelve; si
existe música, es opt-in y está apagada por defecto. Al resolver, el sonido
corto de recompensa/error + la animación son el momento de juice — menos de
dos segundos, y luego vuelve el silencio.

### 4. Audio para prelectores

Para edades de 4 a 6 años, el texto en pantalla es inaccesible sin un
adulto, así que el audio es la interfaz principal, no una mejora. Dos
caminos:

- **`speechSynthesis` (TTS).** Gratis, funciona sin conexión una vez que
  existe la voz del sistema operativo, puede leer contenido dinámico
  (problemas generados) sin pregrabar cada combinación. Pero la
  calidad/cobertura de la voz depende del sistema operativo, no del
  navegador [7][8]; un dispositivo sin un paquete de voz en español o
  francés instalado cae silenciosamente a una opción predeterminada
  inferior, sin ninguna API web para forzar la instalación de una.
- **Locución grabada (VO).** Calidad consistente sin importar el
  dispositivo, pero fija y finita — cada frase, por idioma, debe grabarse y
  publicarse. Costeable para un vocabulario pequeño y acotado (etiquetas de
  menú, "¡Correcto!", números, nombres de operadores); no escala a texto de
  problemas generados de forma arbitraria.

**Híbrido recomendado:** locución grabada para el vocabulario fijo de
UI/celebración en los 5 idiomas; TTS (o clips de VO concatenados) para todo
lo combinatorio (leer en voz alta problemas generados) — el patrón que Khan
Academy Kids y Duolingo usan en la práctica.

### 5. Animación de celebración: ¿ayuda o distrae?

El confeti, los contadores de estrellas y las animaciones de la mascota son
motivadores extrínsecos sobre la recompensa intrínseca de una respuesta
correcta. Una celebración larga y lenta retrasa el siguiente problema y
corre el riesgo de convertirse exactamente en el tipo de acaparador de
atención extraño contra el que advierte la literatura de
coherencia/sonido irrelevante. Una celebración corta y no bloqueante (menos
de ~1.5s) captura el beneficio motivacional sin interrumpir el flujo —
"pequeño y frecuente le gana a grande y ocasional" para sostener el enganche
sin desplazar el tiempo dedicado a la tarea.

### 6. Hápticos en la web

El soporte de `navigator.vibrate()` es real pero desigual: Chrome
(escritorio/Android), Edge, Samsung Internet y la mayoría de los navegadores
Chromium en Android lo soportan; Firefox de escritorio lo soportó solo hasta
la v128, y se eliminó en la 129+; y —de forma crítica— **Safari de iOS nunca
lo ha soportado, en ninguna versión de la 3.2 a la 26.5** [5][6]. Dado que
cualquier WebView de iOS usa WebKit, esto no es un problema de "cambiar de
navegador". La vibración es, en el mejor de los casos, un acento en
Android/Chromium, nunca el canal de retroalimentación principal, ya que una
porción significativa de la flota objetivo (todo iPad/iPhone) no recibe
nada. Ninguna API web expone el Taptic Engine de iOS como alternativa.

### 7. `prefers-reduced-motion`

Esta característica multimedia de CSS (Baseline desde enero de 2020) expone
una preferencia a nivel de sistema operativo para reducir el movimiento no
esencial, porque las animaciones de escalado/desplazamiento son detonantes
conocidos de trastornos vestibulares [13]. Toda celebración de mucho
movimiento (confeti, sacudida, rebote) necesita una alternativa más calmada
bajo `prefers-reduced-motion: reduce` (desvanecido/cambio de color) que siga
transmitiendo "correcto" — nunca simplemente eliminar la retroalimentación.

### 8. Diseño con el silencio como primera opción

Los salones de clase, las salas de espera y los dispositivos familiares
compartidos son contextos donde el audio a menudo no es bienvenido sin
importar la capacidad de la plataforma. Combinado con la política de
autoplay (§9), el silencio debería ser lo predeterminado seguro, con un
control de silencio de un solo toque persistente y siempre visible, y el
ciclo principal (leer → responder → ver el resultado) debe ser totalmente
usable en silencio — requerido de forma independiente también por el §10.

### 9. Política de autoplay

Tanto Chrome como Safari bloquean el audio con sonido antes de un gesto del
usuario, a menos que esté silenciado [9][10]. El Media Engagement Index de
Chrome puede poner en lista blanca un origen de escritorio visitado con
frecuencia; el autoplay silenciado siempre está permitido [9]. Safari en iOS
requiere `playsinline` para video en línea y trata el video
silenciado/sin audio de forma permisiva [10][11]. Firefox expone
preferencias granulares por dominio, incluida una que bloquea
específicamente el autoplay de la Web Audio API sin un gesto [11]. En la
práctica: el primer sonido de una sesión (incluidas las instrucciones
habladas) no puede reproducirse automáticamente — hay que ponerlo detrás de
un toque en "Start"/"¡Empezar!", y usar ese mismo toque para reanudar/crear
el `AudioContext` compartido (más un búfer preparador casi silencioso) para
que todo sonido posterior se reproduzca al instante.

### 10. La retroalimentación nunca debe ser solo sonido

WCAG 1.2.1 exige un equivalente basado en texto para el contenido solo de
audio, ya que el texto se renderiza a través de cualquier modalidad sensorial
[12]. Las Game Accessibility Guidelines son más directas: "ensure no
essential information is conveyed by sounds alone", y la información de
audio complementaria debe replicarse en texto/visuales [14]. Para Math
Challenge, cada señal de correcto/incorrecto, instrucción y celebración
necesita una forma visual (y, donde sea relevante, textual) que funcione por
sí sola completamente en silencio — una restricción requerida de forma
independiente también por el §8 y el §9.

### 11. Canalización de recursos

**Sprites.** Empaquetar efectos cortos (correcto, incorrecto, tick, tap) en
un solo búfer de audio-sprite reproducido vía `AudioBufferSourceNode` de Web
Audio con offsets, evitando muchas solicitudes pequeñas y la sobrecarga de
`<audio>` por instancia.

**Latencia de Web Audio frente a `<audio>`.** El elemento `<audio>` en móvil
tiene latencia/fallas documentadas y carece de filtros, temporización
precisa y audio posicional; la Web Audio API es la ruta de baja latencia
para sonido tipo videojuego, mientras que `<audio>` sigue siendo útil para
transmitir música de fondo larga sin bloquear en una descarga completa — a
menudo conectado vía `MediaElementAudioSourceNode` dentro de un
`AudioContext` [15][17]. Ambas API tienen soporte amplio, a nivel Baseline,
incluyendo Safari de iOS [16][7] — a diferencia de la vibración, la
reproducción de audio en sí no es un riesgo multiplataforma.

**Presupuesto de tamaño de archivo.** Meta de trabajo pendiente de
confirmación del dueño: sonidos cortos de UI/retroalimentación de ~10-30 KB
cada uno (comprimidos, en un solo sprite); un vocabulario acotado de
locución grabada (~150-300 frases) de ~15-40 KB cada uno suma varios MB por
idioma — el mayor impulsor individual de recursos sin conexión si los 5
idiomas se envían en la instalación. Mejor: empaquetar solo el idioma
seleccionado en la instalación, y obtener/guardar en caché los demás bajo
demanda vía service worker.

**Licenciamiento.** Los efectos de sonido de UI típicamente provienen de
bibliotecas libres de regalías/CC0 o de audio encargado; confirmar los
términos de atribución/uso comercial por cada recurso. La locución grabada
necesita ya sea un acuerdo interno de talento o un contrato con un proveedor
comercial de VO con derechos claros de uso comercial y regrabación — una
decisión de adquisición para el dueño, no resoluble a partir de
documentación pública.

---

## Platform capability table

| Capacidad | iOS Safari | Android Chrome | Escritorio (Chrome/Edge/Firefox/Safari) | Fuente |
|---|---|---|---|---|
| **Vibration API** (`navigator.vibrate`) | **No soportada**, todas las versiones 3.2–26.5 probadas | Soportada (actual) | Chrome v30+/Edge v79+ soportada; Firefox v11–128 **solamente**, eliminada en 129+; Safari de escritorio no soportada | caniuse.com/vibration [5]; MDN [6] |
| **Web Audio API** | Soportada desde Safari 6 | Soportada (actual) | Chrome v14+, Edge v12+, Firefox v25+, Safari v6+ todas soportadas | caniuse.com/audio-api [16]; MDN [15] |
| **Autoplay (audio con sonido)** | Bloqueado antes de un gesto; el video silenciado/sin audio puede reproducirse automáticamente; `playsinline` requerido en línea | Bloqueado antes de un gesto a menos que esté silenciado; el MEI de Chrome puede poner en lista blanca orígenes frecuentes | Chrome/Edge: bloqueado a menos que esté silenciado/con gesto/MEI; Firefox: preferencias granulares por dominio; Safari de escritorio: misma política que iOS | WebKit blog [10]; Chrome blog [9]; MDN [11] |
| **`speechSynthesis`** | Soportada desde Safari 7; **la cantidad/calidad de voces por idioma es una propiedad del sistema operativo** | Soportada (actual); el navegador del sistema de Android carece de ella | Chrome v33+, Edge v14+, Firefox v49+, Safari v7+ todas soportadas | caniuse.com/speech-synthesis [7]; MDN [8] |

Los inventarios de voces por idioma (EN/ES/FR/PT/DE) no se pueden enumerar
solo a partir de la documentación — deben verificarse por sistema
operativo/dispositivo objetivo durante la implementación [7][8].

---

## Implicaciones de diseño

1. **Edades 4-6.** Toda instrucción es audio (locución grabada, §4) más un
   pictograma grande — nunca solo texto. Sin música de fondo por defecto.
   Respuesta correcta: timbre ≤500ms + destello/rebote visual simultáneo,
   seguro en silencio.
2. **Edades 4-6, errores.** Tono suave y no punitivo (sin zumbadores
   ásperos) + señal amigable de rebote, mantenida dentro de una amplitud
   segura para `prefers-reduced-motion` incluso por defecto — este grupo de
   edad es más sensible a la sacudida/el destello.
3. **Edades 7-10.** El texto se vuelve primario; el audio se vuelve lectura
   en voz alta opcional y activable. 2-3 variantes de timbre rotativas para
   evitar la monotonía, ≤700ms, sin animación bloqueante.
4. **Edades 11+/adultos.** Audio apagado por defecto detrás de una petición
   explícita de "activar sonido" (no autoplay); celebración mínima (tick en
   la barra de progreso, no confeti) para un usuario de baja distracción y
   trabajo rápido.
5. **Música apagada por defecto en todas las bandas de edad** (§3). Si se
   ofrece, es solo opt-in, con auto-ducking a casi silencio durante la
   resolución activa, y volumen completo solo en pantallas de menú/inactivas.
6. **División VO/TTS (§4).** Locución grabada para el vocabulario fijo
   acotado (~150-300 frases) en los 5 idiomas; `speechSynthesis` (o clips
   concatenados) para las lecturas combinatorias de problemas generados.
7. **Desbloqueo de audio en la primera sesión.** El primer toque (un botón
   "Start", nunca autoplay) funciona a la vez como el gesto que
   reanuda/crea el `AudioContext` compartido y dispara un preparador casi
   silencioso, para que los sonidos posteriores no tengan retraso
   perceptible (§9).
8. **Los hápticos solo como acento.** Disparar un tick corto (~40-80ms)
   donde exista `navigator.vibrate` (Android Chrome); diseñar paridad
   completa solo vía sonido+animación para iOS, donde está totalmente
   ausente (§6).
9. **Variante de `prefers-reduced-motion` para cada celebración**, publicada
   en el mismo PR que la celebración — un desvanecido/pulso calmado que
   conserva la señal de recompensa sin detonantes vestibulares (§7).
10. **Control de silencio persistente de un solo toque**, siempre visible,
    que recuerda la última elección por dispositivo; el ciclo principal en
    silencio es un escenario probado de primera clase, no una ocurrencia
    tardía (§8, §10).
11. **Ninguna retroalimentación solo de sonido en ningún lugar** — cada
    señal de audio se empareja con un equivalente visual (y, donde haya
    texto en pantalla, textual), verificado en cada sonido nuevo que se
    agregue (§10).
12. **Presupuesto de duración de celebración.** Por respuesta: ≤500ms de
    audio / ≤800ms de animación, no bloqueante. A nivel de sesión
    (racha/nivel completado): ≤2.5s en total, se puede saltar, nunca
    bloqueando "continuar" más allá de ese techo.
13. **Presupuesto total de tamaño de recursos sin conexión** (meta de
    trabajo, pendiente de confirmación del dueño): ≤1.5 MB de sprite de
    efectos de sonido de UI (independiente del idioma) + ≤2-3 MB para el
    paquete de locución grabada del idioma predeterminado en la
    instalación, con los otros cuatro idiomas obtenidos/guardados en caché
    bajo demanda en lugar de empaquetarse de entrada. Meta de huella de
    audio en la primera instalación: **menos de 5 MB**.

---

## Preguntas abiertas para el dueño del proyecto

1. ¿Ofrecer música de fondo en absoluto (incluso opt-in), dada la evidencia
   del §3 en contra durante la resolución activa — o reservarla
   estrictamente para pantallas de menú/inactivas?
2. ¿Hay presupuesto/cronograma para locución profesional en los 5 idiomas
   para el vocabulario fijo, o debería el lanzamiento depender primero de
   `speechSynthesis` en todas partes, agregando la locución por idioma más
   adelante?
3. ¿Enviar los 5 idiomas en el paquete inicial sin conexión, o empaquetar
   solo el idioma seleccionado y obtener los demás bajo demanda (mi
   recomendación de trabajo, ver implicación 13)?
4. ¿Cuál es el techo de tamaño de recursos sin conexión para toda la
   aplicación (no solo audio) — esto cambia qué tan agresivo debe ser el
   presupuesto de audio?
5. Para implementaciones de salón de clases/dispositivo compartido,
   ¿debería una configuración de profesor/administrador forzar el silencio
   por defecto o deshabilitar el interruptor de sonido para los alumnos,
   aparte del interruptor de usuario por sesión?
6. ¿Ya se eligió una biblioteca de efectos de sonido con licencia, o la
   nota de licenciamiento del §11 necesita alimentar una decisión de
   adquisición antes de que se publique cualquier recurso de sonido?

---

## Fuentes

1. Steve Swink, *Game Feel: A Game Designer's Guide to Virtual Sensation*
   (2008) — marco de referencia para el "feel" (la sensación) vía control,
   espacio y pulido.
2. GDC Vault, "Juice It or Lose It" (Martin Jonasson y Petri Purho, GDC
   Europe 2012) — https://www.gdcvault.com/play/1016487/Juice-It-or-Lose
3. Wikipedia, "Irrelevant speech effect" —
   https://en.wikipedia.org/wiki/Irrelevant_speech_effect
4. Mayer, R. y Moreno, R., "A Cognitive Theory of Multimedia Learning:
   Implications for Design Principles" (1998) — principio de coherencia
   (referenciado vía https://en.wikipedia.org/wiki/Multimedia_learning).
5. caniuse.com, "Vibration API" — https://caniuse.com/vibration
6. MDN, "Vibration API" —
   https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
7. caniuse.com, "Speech Synthesis API" —
   https://caniuse.com/speech-synthesis
8. MDN, "SpeechSynthesis" —
   https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
9. Blog de Chrome Developers, "Autoplay policy in Chrome" —
   https://developer.chrome.com/blog/autoplay/
10. Blog de WebKit, "New Video Policies for iOS" —
    https://webkit.org/blog/6784/new-video-policies-for-ios/
11. MDN, "Autoplay guide for media and Web Audio APIs" —
    https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
12. W3C WAI, "Understanding SC 1.2.1: Audio-only and Video-only
    (Prerecorded)" —
    https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded.html
13. MDN, "prefers-reduced-motion" —
    https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
14. Game Accessibility Guidelines, "Ensure no essential information is
    conveyed by sounds alone" —
    http://gameaccessibilityguidelines.com/full-list/
15. MDN, "Web Audio API" —
    https://developer.mozilla.org/en-US/docs/Web/Web_Audio_API
16. caniuse.com, "Web Audio API" — https://caniuse.com/audio-api
17. web.dev, "Web Audio for games" — https://web.dev/articles/webaudio-games
18. W3C WAI, "Understanding SC 1.4.2: Audio Control" —
    https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html
