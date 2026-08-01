# Audio, música, hápticos, movimiento y "juice" en juegos de aprendizaje

> Investigación Math Challenge — 2026-07-31 — tema 42

## Resumen ejecutivo (ES)

El "juice" (retroalimentación sensorial exagerada: sonido, partículas, sacudida
de pantalla) hace que un juego se sienta mejor sin cambiar su lógica — tesis
central de *Game Feel* de Steve Swink y de la charla de 2012 "Juice It or Lose
It" de Jonasson y Purho [1][2]. Pero Math Challenge es software educativo, y
ahí aparece una tensión real: el "efecto del sonido irrelevante" muestra que
el habla y la música de fondo degradan la memoria de trabajo aunque no se les
preste atención consciente [3], y el principio de coherencia de Mayer dice
que el material decorativo —incluida la música de fondo— debe eliminarse
porque compite por recursos cognitivos limitados [4]. Ninguno de los dos
lados es falso: el juice ayuda a la motivación; la música de fondo durante el
cálculo activo puede perjudicar el rendimiento. La resolución práctica es
separar los momentos: silencio durante el intento, juice completo solo en el
instante de recompensa/error.

Para niños de 4 años que no leen, el audio no es decorativo — es el canal de
instrucciones. La Vibration API no funciona en Safari de iOS en ninguna
versión probada, así que la vibración no puede ser el canal principal en
iPad/iPhone [5][6]. `speechSynthesis` tiene soporte amplio de navegador, pero
la calidad y disponibilidad de voces por idioma depende del sistema
operativo, no del navegador [7][8]. Las políticas de autoplay bloquean
cualquier audio con sonido antes de un gesto del usuario [9][10][11] —esto
define la pantalla de inicio—, y la regla de accesibilidad "ninguna
información esencial solo por audio" [12] exige que cada sonido tenga
también un equivalente visual.

## Executive summary (EN)
«Juice» — retroalimentación exagerada (sonido, partículas, sacudida de pantalla) — hace que un juego se sienta mejor sin cambiar su lógica, según *Game Feel* de Steve Swink y la charla de 2012 «Juice It or Lose It» [1][2]. Math Challenge es un software educativo, sin embargo, y surge una auténtica tensión: el efecto de sonido irrelevante muestra que el discurso/música de fondo degrada la memoria de trabajo incluso cuando no se presta atención [3], y el principio de coherencia de Mayer indica que el audio decorativo debe eliminarse del material instruccional porque compite por la capacidad cognitiva limitada [4]. Ambos tienen razón en su marco — el «juice» ayuda a la motivación; el sonido ambiental durante cálculos activos puede perjudicar el rendimiento. La solución práctica es separar los momentos: silencio mientras se resuelve, «juice» completo solo en el instante de recompensa/error.

Para niños de 4 años que aún no leen, el audio es el canal de instrucción, no una decoración. La Vibration API no tiene soporte en iOS Safari en ninguna versión probada, por lo que no puede ser el canal de recompensa principal en iPad/iPhone [5][6]. `speechSynthesis` tiene amplio soporte en navegadores, pero la calidad/disponibilidad de la voz por idioma es una propiedad del SO, no del navegador [7][8]. La política de reproducción automática bloquea cualquier audio sin silenciar antes de un gesto del usuario [9][10][11], lo que define la pantalla de inicio, y la norma de accesibilidad «no sound-only feedback» [12] exige un equivalente visual para cada señal de audio.

## Resultados

### 1. Sensación del juego y «juice»

*Game Feel* de Steve Swink (2008) plantea el «feel» como control + espacio simulado + pulido, donde el pulido incluye sonido, partículas, sacudida de pantalla y easing que comunican el estado sin cambiar las reglas [1]. La charla de GDC Europe 2012 «Juice It or Lose It» (Jonasson & Purho) es la demostración práctica más citada: un juego básico se va «jugando» progresivamente con squash‑and‑stretch, partículas, sacudida de cámara y sonido hasta que resulta mucho más satisfactorio, sin ningún cambio mecánico [2]. Para *Math Challenge* la conclusión es que el «juice» es barato y eleva directamente la recompensa percibida de una respuesta correcta — lo que importa sobre todo a niños de 4 años, cuya implicación se impulsa más por la recompensa sensorial inmediata que por el seguimiento del progreso a largo plazo.

### 2. Sonidos de recompensa

Un sonido corto, distintivo y de afecto positivo para la respuesta correcta funciona como reforzador secundario, al estilo de los sonidos de «moneda» en los juegos — elogio instantáneo e independiente del idioma. Para un niño de 4 años, el timbre *es* el elogio, entregado antes de que pueda leerse cualquier texto. Mantenga esos sonidos breves (~300‑500 ms para un pitido; hasta ~1‑2 s para una celebración mayor) de modo que nunca retrasen la siguiente pregunta.

### 3. Música de fondo: una tensión genuina e irresuelta

**En contra.** El efecto de sonido irrelevante es un hallazgo sólido de la psicología cognitiva: un sonido de fondo no relacionado — discurso, música u otro estímulo no silencioso — degrada la memoria serial y la memoria de trabajo incluso cuando se ignora y no se evalúa directamente [3]. La explicación estándar es que el material auditivo variable interfiere con el bucle fonológico usado para el repaso verbal, y se aplica a la música, no solo al discurso [3]. El principio de coherencia de Mayer, de su *Cognitive Theory of Multimedia Learning*, afirma de forma independiente que el material extrínseco — incluida la música decorativa de fondo — debe excluirse porque consume la capacidad de procesamiento limitada necesaria para la lección misma [4]; es uno de los hallazgos más replicados en la investigación educativa‑multimedia.

**A favor.** Ningún hallazgo rechaza el sonido *momentáneo y significativo*: un timbre de respuesta correcta/incorrecta, instrucciones habladas previas a la lectura, o un breve fragmento de celebración. Ambos se refieren a decoración *continua y concurrente*, no a retroalimentación vinculada a un evento discreto (§1).

**Síntesis:** trate «mientras se resuelve» y «al resolverse» como regímenes de audio separados. Por defecto, silencio mientras se resuelve; si existe música, será opcional y desactivada por defecto. Al resolverse, el sonido corto de recompensa/error + animación constituye el momento de «juice» — menos de dos segundos, y luego se reanuda el silencio.

### 4. Audio para prelectores

Para edades de 4‑6 años, el texto en pantalla es inaccesible sin un adulto, de modo que el audio es la interfaz principal, no un complemento. Dos vías:

- **`speechSynthesis` (TTS).** Gratuito, con capacidad offline una vez que la voz del SO está disponible, puede leer contenido dinámico (problemas generados) sin necesidad de pre‑grabar cada combinación. Pero la calidad y cobertura de la voz dependen del SO, no del navegador [7][8]; un dispositivo sin paquete de voz en español o francés recurre silenciosamente a una opción predeterminada inferior, sin que la API web permita forzar la instalación de una.

- **Voz en off grabada (VO).** Calidad constante independientemente del dispositivo, pero fija y finita — cada frase, por idioma, debe grabarse y enviarse. Asequible para un vocabulario limitado (etiquetas de menú, «¡Correcto!», números, nombres de operadores); no escala a texto de problemas generado arbitrariamente.

**Híbrido recomendado:** VO grabada para el vocabulario fijo de UI/celebración en los 5 idiomas; TTS (o clips VO concatenados) para cualquier contenido combinatorio (lectura de problemas generados) — el patrón que usan Khan Academy Kids y Duolingo en la práctica.

### 5. Animación de celebración: ¿ayuda o distrae?

Los confetis, contadores de estrellas y animaciones de mascota son motivadores extrínsecos que se suman a la recompensa intrínseca de una respuesta correcta. Una celebración larga y lenta retrasa el siguiente problema y corre el riesgo de convertirse en el tipo de atención extrínseca que la literatura sobre coherencia/sonido irrelevante advierte. Una celebración corta y no bloqueante (menos de ~1,5 s) captura el beneficio motivacional sin interrumpir el flujo — «pequeña y frecuente supera a grande y ocasional» para mantener la implicación sin desplazar el tiempo de tarea.

### 6. Hápticos en la web

`navigator.vibrate()` está disponible pero de forma desigual: Chrome (escritorio/Android), Edge, Samsung Internet y la mayoría de navegadores Chromium Android lo admiten; Firefox de escritorio lo soportó solo hasta la v128, y se eliminó en la 129+; y — de forma crítica — **iOS Safari nunca lo ha admitido, en ninguna versión desde la 3,2 hasta la 26,5** [5][6]. Dado que cualquier WebView de iOS usa WebKit, no se trata de un problema de «cambiar de navegador». La vibración es, a lo sumo, un acento en Android/Chromium, nunca el canal principal de retroalimentación, pues una parte significativa del parque objetivo (todos los iPad/iPhone) no recibe nada. Ninguna API web expone el Taptic Engine de iOS como alternativa.

### 7. `prefers-reduced-motion`

Esta característica de medios CSS (baseline desde enero 2020) expone una preferencia a nivel de SO para reducir el movimiento no esencial, porque las animaciones de escalado/desplazamiento pueden desencadenar trastornos vestibulares [13]. Cada celebración de alto movimiento (confetis, sacudida, rebote) necesita una alternativa más calmada con `prefers-reduced-motion: reduce` (desvanecimiento/cambio de color) que siga transmitiendo «correcto», sin eliminar simplemente la retroalimentación.

### 8. Diseño con silencio por defecto

Aulas, salas de espera y dispositivos familiares compartidos son contextos donde el audio suele ser indeseado, independientemente de la capacidad de la plataforma. Combinado con la política de reproducción automática (§9), el silencio debe ser la opción segura por defecto, con un control de silencio persistente y siempre visible de un solo toque, y el bucle central (leer → responder → ver resultado) debe ser totalmente usable en silencio — requisito también impuesto por §10.

### 9. Política de reproducción automática

Chrome y Safari bloquean el audio con sonido antes de un gesto del usuario a menos que esté silenciado [9][10]. El Media Engagement Index de Chrome puede permitir una lista blanca de orígenes de escritorio visitados con frecuencia; la reproducción automática silenciada siempre está permitida [9]. Safari en iOS requiere `playsinline` para vídeo en línea y trata el vídeo sin sonido o silenciado de forma permisiva [10][11]. Firefox expone preferencias granulares por dominio, incluida una que bloquea específicamente la reproducción automática de la Web Audio API sin gesto [11]. En la práctica: el primer sonido de una sesión (incluidas instrucciones habladas) no puede reproducirse automáticamente — debe activarse tras pulsar «Start»/«¡Empezar!», y ese mismo toque debe crear/reanudar el `AudioContext` compartido (más un búfer de arranque casi silencioso) para que cada sonido posterior se reproduzca al instante.

### 10. La retroalimentación nunca debe ser solo sonora

WCAG 1.2.1 exige un equivalente basado en texto para contenido exclusivamente auditivo, ya que el texto se puede percibir a través de cualquier modalidad sensorial [12]. Las Game Accessibility Guidelines son más directas: «asegúrese de que ninguna información esencial se transmita solo mediante sonidos», y la información auditiva suplementaria debe replicarse en forma visual/textual [14]. Para *Math Challenge* cada señal de acierto/error, instrucción y celebración necesita una forma visual (y, cuando corresponda, textual) que funcione por sí sola con el sonido totalmente silenciado — una restricción que además exigen de forma independiente §8 y §9.

### 11. Canal de activos

**Sprites.** Agrupar los efectos breves (correcto, error, tick, tap) en un único búfer de sprite de audio reproducido mediante `AudioBufferSourceNode` de Web Audio con desplazamientos, evitando numerosas peticiones pequeñas y la sobrecarga por instancia del elemento `<audio>`.

**Latencia de Web Audio vs `<audio>`.** El elemento `<audio>` en móvil presenta latencia/errores documentados y carece de filtros, cronometraje preciso y audio posicional; la API Web Audio es la vía de baja latencia para sonidos tipo juego, mientras que `<audio>` sigue siendo útil para la transmisión de música de fondo larga sin bloquear una descarga completa — a menudo puenteado mediante `MediaElementAudioSourceNode` dentro de un `AudioContext` [15][17]. Ambas API cuentan con amplio soporte a nivel de referencia, incluido iOS Safari [16][7] — a diferencia de la vibración, la reproducción de audio no supone un riesgo multiplataforma.

**Presupuesto de tamaño de archivo.** Objetivo de trabajo pendiente de confirmación del propietario: sonidos cortos de UI/retroalimentación de ~10‑30 KB cada uno (comprimidos, en un sprite); un vocabulario limitado de VO grabado (~150‑300 frases) de ~15‑40 KB cada uno ocupa varios MB por idioma — el mayor impulsor de activos offline si los 5 idiomas se incluyen en la instalación. Mejor: empaquetar solo el idioma seleccionado en la instalación y obtener/almacenar en caché los demás bajo demanda mediante service worker.

**Licencias.** Los efectos de sonido de UI suelen provenir de bibliotecas libres de derechos/CC0 o audio comisionado; confirmar la atribución y los términos de uso comercial por activo. El VO grabado necesita ya sea un acuerdo interno con el talento o un contrato con un proveedor comercial de VO con derechos claros de uso comercial y regrabación — una decisión de adquisición para el propietario, no resoluble a partir de documentos públicos.

---

## Tabla de capacidades de la plataforma

| Capacidad | iOS Safari | Android Chrome | Escritorio (Chrome/Edge/Firefox/Safari) | Fuente |
|---|---|---|---|---|
| **Vibration API** (`navigator.vibrate`) | **No compatible**, todas las versiones 3,2–26,5 probadas | Compatible (actual) | Chrome v30+/Edge v79+ compatible; Firefox v11–128 **solo**, eliminado en 129+; Safari de escritorio no compatible | caniuse.com/vibration [5]; MDN [6] |
| **Web Audio API** | Compatible desde Safari 6 | Compatible (actual) | Chrome v14+, Edge v12+, Firefox v25+, Safari v6+ todos compatibles | caniuse.com/audio-api [16]; MDN [15] |
| **Autoplay (audio con sonido)** | Bloqueado antes del gesto; vídeo sin sonido o silenciado puede reproducirse automáticamente; se requiere `playsinline` en línea | Bloqueado antes del gesto a menos que esté silenciado; Chrome MEI puede permitir orígenes frecuentes | Chrome/Edge: bloqueado a menos que esté silenciado/gesticulado/MEI; Firefox: preferencias granulares por dominio; Safari de escritorio: mismo que la política de iOS | WebKit blog [10]; Chrome blog [9]; MDN [11] |
| **`speechSynthesis`** | Compatible desde Safari 7; **el número y la calidad de voces por idioma dependen del SO** | Compatible (actual); el navegador del sistema Android no la incluye | Chrome v33+, Edge v14+, Firefox v49+, Safari v7+ todos compatibles | caniuse.com/speech-synthesis [7]; MDN [8] |

Los inventarios de voces por idioma (EN/ES/FR/PT/DE) no pueden enumerarse solo a partir de la documentación; deben verificarse en cada SO/dispositivo objetivo durante la implementación [7][8].

---

## Implicaciones de diseño

1. **Edades 4‑6.** Cada instrucción es audio (VO grabado, §4) más un pictograma grande — nunca solo texto. Sin música de fondo por defecto. Respuesta correcta: campanilla ≤500 ms + destello/rebote visual simultáneo, sin riesgo de silencio.
2. **Edades 4‑6, errores.** Tono suave y no punitivo (sin zumbidos agresivos) + señal de rebote amistosa, mantenida dentro de una amplitud segura para `prefers-reduced-motion` incluso por defecto — este grupo es más sensible a sacudidas/flash.
3. **Edades 7‑10.** El texto pasa a ser principal; el audio se vuelve opcional y conmutable mediante lectura en voz alta. 2‑3 variantes de campanilla rotativas para evitar monotonía, ≤700 ms, sin animación bloqueante.
4. **Edades 11+/adultos.** Audio desactivado por defecto tras un aviso explícito “sonido activado” (no autoplay); celebración mínima (tick de barra de progreso, no confeti) para un usuario de baja distracción y alta velocidad.
5. **Música desactivada por defecto en todas las franjas de edad** (§3). Si se ofrece, solo mediante opt‑in, con reducción automática del volumen a casi silencio durante la resolución activa y volumen completo solo en menús/pantallas inactivas.
6. **División VO/TTS (§4).** VO grabado para el vocabulario fijo limitado (~150‑300 frases) en los 5 idiomas; `speechSynthesis` (o clips concatenados) para lecturas de problemas generados combinatoriamente.
7. **Desbloqueo de audio en la primera sesión.** El primer toque (un botón “Start”, nunca autoplay) sirve también como gesto que crea/reanuda el `AudioContext` compartido y dispara un primer sonido casi silencioso, de modo que los sonidos posteriores no tengan retraso perceptible (§9).
8. **Haptics solo como acento.** Emitir un tick corto (~40‑80 ms) donde exista `navigator.vibrate` (Android Chrome); diseñar paridad total mediante sonido+animación para iOS, donde está totalmente ausente (§6).
9. **Variante `prefers-reduced-motion` para cada celebración**, incluida en el mismo PR que la celebración — un desvanecimiento/pulsación calmado que preserva la señal de recompensa sin desencadenar estímulos vestibulares (§7).
10. **Control de silencio de un solo toque persistente**, siempre visible, que recuerda la última elección por dispositivo; el bucle silenciado es un escenario de primera clase probado, no un detalle posterior (§8, §10).
11. **No hay retroalimentación solo sonora en ningún caso** — cada señal de audio se acompaña de un equivalente visual (y, cuando hay texto en pantalla, también textual), verificado con cada nuevo sonido añadido (§10).
12. **Presupuesto de duración de la celebración.** Por respuesta: audio ≤500 ms / animación ≤800 ms, sin bloqueo. A nivel de sesión (racha/nivel completado): ≤2,5 s total, saltable, nunca impidiendo “continuar” tras ese límite.
13. **Presupuesto total de tamaño de activos offline** (objetivo de trabajo, pendiente de confirmación del propietario): sprite de efectos de sonido UI ≤1,5 MB (independiente del idioma) + ≤2‑3 MB para el paquete de VO grabado del idioma predeterminado en la instalación, con los otros cuatro idiomas obtenidos/almacenados en caché bajo demanda en lugar de empaquetarse inicialmente. Huella de audio en la primera instalación: **menos de 5 MB**.

---

## Preguntas abiertas para el propietario del proyecto

1. ¿Ofrecer música de fondo en absoluto (incluso con opt‑in), dado que la evidencia del §3 la desaconseja durante la resolución activa — o reservarla estrictamente para menús/pantallas inactivas?
2. ¿Existe presupuesto/plazo para VO profesional en los 5 idiomas para el vocabulario fijo, o el lanzamiento debe depender primero de `speechSynthesis` en todos los idiomas, añadiendo VO por idioma más adelante?
3. ¿Incluir los 5 idiomas en el paquete offline inicial, o empaquetar solo el idioma seleccionado y obtener los demás bajo demanda (mi recomendación de trabajo, ver implicación 13)?
4. ¿Cuál es el techo de tamaño de activos offline para toda la aplicación (no solo audio) — esto modifica cuán agresivo debe ser el presupuesto de audio?
5. Para despliegues en aula/dispositivo compartido, ¿debe una configuración de profesor/administrador forzar el silencio por defecto o desactivar el conmutador de sonido para los estudiantes, separado del conmutador de usuario por sesión?
6. ¿Ya se ha elegido una biblioteca de efectos de sonido con licencia, o la nota de licencias del §11 necesita alimentar una decisión de adquisición antes de que se envíe cualquier activo sonoro?

---

## Fuentes

1. Steve Swink, *Game Feel: A Game Designer's Guide to Virtual Sensation* (2008) — marco para el “feel” mediante control, espacio y pulido.
2. GDC Vault, “Juice It or Lose It” (Martin Jonasson & Petri Purho, GDC Europe 2012) — https://www.gdcvault.com/play/1016487/Juice-It-or-Lose
3. Wikipedia, “Irrelevant speech effect” — https://en.wikipedia.org/wiki/Irrelevant_speech_effect
4. Mayer, R. & Moreno, R., “A Cognitive Theory of Multimedia Learning: Implications for Design Principles” (1998) — principio de coherencia (referenciado vía https://en.wikipedia.org/wiki/Multimedia_learning).
5. caniuse.com, “Vibration API” — https://caniuse.com/vibration
6. MDN, “Vibration API” — https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
7. caniuse.com, “Speech Synthesis API” — https://caniuse.com/speech-synthesis
8. MDN, “SpeechSynthesis” — https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
9. Chrome Developers blog, “Autoplay policy in Chrome” — https://developer.chrome.com/blog/autoplay/
10. WebKit blog, “New Video Policies for iOS” — https://webkit.org/blog/6784/new-video-policies-for-ios/
11. MDN, “Autoplay guide for media and Web Audio APIs” — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
12. W3C WAI, “Understanding SC 1.2.1: Audio-only and Video-only (Prerecorded)” — https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded.html
13. MDN, “prefers-reduced-motion” — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
14. Game Accessibility Guidelines, “Ensure no essential information is conveyed by sounds alone” — http://gameaccessibilityguidelines.com/full-list/
15. MDN, “Web Audio API” — https://developer.mozilla.org/en-US/docs/Web/Web_Audio_API
16. caniuse.com, “Web Audio API” — https://caniuse.com/audio-api
17. web.dev, “Web Audio for games” — https://web.dev/articles/webaudio-games
18. W3C WAI, “Understanding SC 1.4.2: Audio Control” — https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html
