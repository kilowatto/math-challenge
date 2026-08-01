# Bucles de hábito, mecánicas de retención y notificaciones push para una PWA de matemáticas para niños

> Investigación Math Challenge — 2026-07-31 — tema 19

## Resumen ejecutivo (ES)

La formación de hábitos en aplicaciones se apoya en tres marcos clásicos que se complementan: el bucle **señal‑rutina‑recompensa** de Duhigg [7], el modelo **B=MAP** (Motivación, Habilidad, Prompt) de BJ Fogg [1] y el modelo **Hook** de Nir Eyal (disparador, acción, recompensa variable, inversión) [8][9]. Los tres coinciden en un mecanismo central: la **recompensa variable**, heredada del condicionamiento operante de Skinner, es el ingrediente que convierte una rutina en un hábito difícil de extinguir porque el cerebro libera dopamina anticipando la recompensa, no solo al recibirla [11]. Este mismo mecanismo sustenta las máquinas tragamonedas y las loot boxes, lo que obliga a Math Challenge a decidir conscientemente dónde trazar la línea entre «hábito saludable» y «compulsión». El propio Eyal, después de escribir el manual de la persuasión (*Hooked*, 2014), redactó su contraparte (*Indistractable*, 2019) reconociendo la tensión ética del modelo y defendiendo el «tiempo por elección» sobre el «tiempo por distracción» [9]. Duolingo es el caso de estudio obligado: su racha (streak) con aversión a la pérdida, sus ligas competitivas y su algoritmo de notificaciones personalizado («bandit algorithm») impulsan un compromiso enorme, pero también han generado críticas por incentivar trampas y «aprendizaje superficial» para no romper la racha [15]. Las intenciones de implementación («si ocurre X, entonces haré Y», Gollwitzer) presentan tamaños de efecto grandes y documentados (p. ej. +100 % vs 53 % en autoexámenes) [4] y resultan más aplicables a un recordatorio bien diseñado que a la pura repetición.

En el plano técnico: Web Push funciona en Safari de iOS/iPadOS **solo a partir de la versión 16,4**, **solo si la PWA está instalada en la pantalla de inicio**, y el permiso debe solicitarse tras una interacción directa del usuario [2]. Chrome/Android soporta la API Push de forma completa y sin las restricciones de instalación de Apple [5][3]. La API de “Notification Triggers” (notificaciones locales programadas sin red) nunca llegó a estandarizarse entre navegadores y no debe asumirse disponible en 2026. Cloudflare Workers puede firmar y enviar Web Push (VAPID) de forma nativa: soporta la Web Crypto API completamente y, desde abril de 2025, `node:crypto` bajo el flag `nodejs_compat` [16][17], lo que hace viable reescribir o ejecutar librerías como `web-push` en el edge.

## Executive summary (EN)
La formación de hábitos en aplicaciones se apoya en tres marcos clásicos y complementarios: el bucle de **señal‑rutina‑recompensa** de Duhigg [7], el modelo **B=MAP** de Fogg (Motivación, Habilidad, Señal) [1] y el modelo **Hook** de Eyal (activador, acción, recompensa variable, inversión) [8][9]. Los tres convergen en el mismo mecanismo: la **recompensa variable**, heredada del condicionamiento operante skinneriano, es lo que convierte una rutina en un hábito que resiste la extinción, porque el cerebro libera dopamina en anticipación a una recompensa, no solo al recibirla [11]. Ese es el mismo mecanismo que subyace a las máquinas tragamonedas y a las cajas de botín, lo que obliga a Math Challenge a decidir deliberadamente dónde termina la «healthy habit» y comienza la «compulsion». El propio Eyal, tras escribir el manual de campo para el diseño persuasivo (*Hooked*, 2014), redactó su contraparte (*Indistractable*, 2019), reconociendo la tensión ética en su propio modelo y defendiendo la «traction» (tiempo bien empleado por elección) sobre la «distraction» [9]. Duolingo es el caso de estudio obligatorio: su racha impulsada por aversión a la pérdida, ligas competitivas y algoritmo bandido de notificaciones personalizadas generan un compromiso enorme, pero también han suscitado críticas por incentivar trampas y aprendizaje superficial para evitar romper una racha [15]. Las intenciones de implementación («si X, entonces haré Y», Gollwitzer) presentan tamaños de efecto grandes y documentados (p. ej., +100 % frente a 53 % en la finalización de auto‑exámenes) [4] y constituyen un objetivo de diseño mejor que la repetición cruda.

En el plano técnico: Web Push en iOS/iPadOS Safari funciona **solo a partir de la versión 16,4**, **solo si la PWA está instalada en la pantalla de inicio**, y el permiso debe solicitarse tras una interacción directa del usuario [2]. Chrome/Android soporta la Push API de forma completa, sin la barrera de instalación de Apple [5][3]. La Notification Triggers API (notificaciones locales programadas sin un viaje de red) nunca alcanzó la estandarización cruzada entre navegadores y no debe suponerse disponible en 2026. Cloudflare Workers pueden firmar y enviar Web Push (VAPID) de forma nativa: soporta plenamente la Web Crypto API y, desde April 2025, `node:crypto` bajo la bandera `nodejs_compat` [16][17], lo que hace práctico ejecutar o portar bibliotecas como `web-push` en el edge.

## Findings — Part 1: The psychology of habit and retention

### 1,1 Los tres modelos principales y cómo se anidan

- **Cue‑Routine‑Reward (Duhigg)** [7]: la señal pone al cerebro en «modo automático»; la rutina es el comportamiento; la recompensa es lo que hace que el cerebro codifique el bucle como digno de repetirse. Duhigg documenta el bucle a través de casos comerciales (Febreze de P&G) en lugar de experimentos originales — es una síntesis de la ciencia del comportamiento dirigida a profesionales, no un modelo revisado por pares en sí mismo.  
- **B=MAP (Fogg)** [1]: el comportamiento ocurre solo cuando la Motivación, la Habilidad y un Recordatorio convergen en el mismo momento. El corolario práctico de Fogg — «hazlo diminuto», reducir la fricción de la Habilidad en lugar de intentar fabricar Motivación — es la mitad más accionable del modelo para el diseño de productos, precisamente porque la motivación es poco fiable y difícil de diseñar, mientras que la fricción es directamente controlable.  
- **Hook Model (Eyal)** [8]: Disparador externo → Acción → Recompensa variable → Inversión, repitiéndose hasta que el disparador se vuelve interno (aburrimiento, soledad, una necesidad percibida activan la app sin un empujón externo). El propio autor del modelo publicó después una corrección: *Indistractable* replantea las mismas mecánicas como algo que se puede resistir, y Eyal se ha opuesto públicamente a una regulación general de la tecnología que genera hábitos, mientras los críticos han trazado un paralelismo explícito con los mensajes de «responsabilidad personal» de la industria del tabaco que ocultaban un diseño intencionalmente adictivo [9]. Esa crítica es directamente relevante para **Math Challenge**, un producto infantil: las mismas mecánicas de Hook que Eyal vendió a empresas de apps de consumo en 2014 son las que él defendió después que requieren un contra‑diseño activo en un producto dirigido a niños.

### 1,2 El refuerzo de razón variable es el mecanismo estructural

El programa de refuerzo de razón variable del condicionamiento operante — recompensa tras un número impredecible de respuestas — produce «una tasa de respuesta muy alta y persistente» que resiste la extinción más que los programas fijos [11]. Este es explícitamente el mecanismo detrás de las máquinas tragamonedas y las loot boxes, y la misma fuente señala que «la mayoría de los videojuegos están diseñados alrededor de un bucle de compulsión» usando este programa [11]. Para una app de práctica matemática, esto constituye una bifurcación de diseño, no un detalle: una recompensa fija (el mismo número de monedas por cada respuesta correcta) construye una rutina; una recompensa variable (multiplicadores de bonificación aleatorios, insignias de racha sorpresa, desbloqueos de cajas misteriosas) construye un bucle de compulsión indistinguible en mecanismo de una máquina tragamonedas. Dado que el público objetivo incluye a niños, este es el hallazgo psicológico de mayor riesgo para este proyecto.

### 1,3 Las intenciones de implementación superan a los recordatorios vagos

La planificación «si‑entonces» de Gollwitzer («Si la situación X, entonces haré Y») produce efectos grandes y replicados: +4,1 puntos en la participación electoral, 100 % frente a 53 % de finalización de auto‑exámenes de mama, mayor pérdida de peso (4,2 kg frente a 2,1 kg en dos meses) y mayor consumo de fruta/verdura, todo frente a grupos de control con solo metas [4]. La implicación de diseño es concreta: una notificación que dice «Haz tu práctica de matemáticas» es un recordatorio genérico de objetivo; una notificación que ayuda a la familia o al niño a precomprometerse con un «si‑entonces» específico («Después del desayuno, haz 5 minutos de Math Challenge») es un recordatorio de intención de implementación y debería superarla. Esto aboga por una incorporación que extraiga un compromiso concreto de tiempo y lugar de la familia, y por notificaciones que devuelvan ese compromiso en lugar de copiar genérica de re‑enganche.

### 1,4 Rachas: aversión a la pérdida, coste hundido y efecto de progreso otorgado

La aversión a la pérdida (Kahneman & Tversky) sostiene que las pérdidas se sienten aproximadamente el doble de intensamente que las ganancias equivalentes [12]. Las mecánicas de racha reformulan el compromiso de buscar ganancias («gana más») a evitar pérdidas («no pierdas lo que tienes»), lo que constituye la palanca psicológica más potente [12]. La falacia del coste hundido — continuar invirtiendo por lo ya invertido, en parte para evitar «parecer derrochador» — potencia esto: una racha de 47 días no es solo un número, es una inversión hundida que el usuario (o el padre, de forma vicaria) no quiere desperdiciar [13]. Esta familia de efectos (aversión a la pérdida, coste hundido y el estrechamente relacionado efecto de progreso otorgado de la investigación de programas de fidelidad, donde a los usuarios que reciben una ventaja inicial hacia una meta la completan más rápido que quienes parten de cero) es precisamente el mecanismo sobre el que se construyen la racha, los tokens de congelación y las compras de reparación de racha de Duolingo [15].

**Duolingo as worked example** [15]: racha (con una variante social «Racha de amigos»), ligas semanales que clasifican cohortes de hasta 30 usuarios, insignias y un sistema de notificaciones personalizado mediante algoritmo bandido que selecciona qué empujón recibe cada usuario. La personalidad «recordatorio agresivo» de su mascota se convirtió en meme, que Duolingo explotó deliberadamente en su marketing. La desventaja documentada: críticos de la enseñanza de idiomas afirman que la gamificación «llevó a trampas, hackeos y estrategias de juego incentivadas que entran en conflicto con el aprendizaje real», y un estudio financiado por Duolingo en 2023 encontró que sus estudiantes de inglés «no aprendieron significativamente gramática» [15]. La lección para **Math Challenge**: las métricas de compromiso y los resultados de aprendizaje pueden divergir, y una racha optimizada únicamente para el número de aperturas diarias puede desplazar mediblemente el objetivo pedagógico real — un riesgo que importa más, no menos, en un producto para niños donde un padre confía en la app para el tiempo de aprendizaje, no solo para la atención.

### 1,5 Eficacia, frecuencia y fatiga de las notificaciones push

Los datos de campo directamente reproducibles sobre curvas de desistimiento por frecuencia de notificaciones resultaron más difíciles de obtener en esta sesión que la literatura psicológica anterior (varias URLs de informes industriales — Airship, OneSignal, Business of Apps — devolvieron 404/403 durante esta pasada de investigación y no se citan a continuación; se trata de una laguna, no de un hallazgo nulo, y está señalada en Preguntas abiertas). Lo que es verificable a partir de fuentes técnicas/comportamentales primarias:

- La **solicitud de permiso es la decisión de mayor palanca**. La propia guía para desarrolladores de Chrome es explícita: «Lo peor que puedes hacer es mostrar el cuadro de diálogo de permiso a los usuarios tan pronto como llegan a tu sitio. No tienen ningún contexto… bloquear permisos en este punto por frustración no es raro» [6]. Una vez que un usuario bloquea el permiso, el sitio **no puede volver a solicitarlo programáticamente** — el usuario debe ir a la configuración del navegador para cambiarlo [6]. Esto convierte la *primera* solicitud en una oportunidad única más que en un recurso que se pueda gastar barato.
- El patrón recomendado es un flujo de **soft‑ask / doble permiso**: mostrar primero una explicación dentro de la app del valor, y solo activar el cuadro de diálogo nativo del navegador después de que el usuario acepte esa explicación, además de ofrecer a los usuarios una forma siempre visible de gestionar o desistir de las notificaciones más adelante en lugar de forzar una decisión de todo o nada al primer contacto [6].
- La investigación psicológica sobre la anticipación de recompensas en razón variable [11] implica que el texto de la notificación que ocasionalmente sorprende («el bono misterioso de hoy está activo») superará al texto monótono en la tasa de apertura — pero este es el mismo mecanismo señalado en el §1.2 como adyacente a la compulsión, por lo que debería usarse, si se usa, de forma esporádica y transparente en lugar de explotarse.

## Findings — Part 2: The technical reality of web push in 2026

### 2,1 iOS/iPadOS Safari — requisitos estrictos

Según la entrada del blog de ingeniería de WebKit sobre Web Push para aplicaciones web [2]:

- **Versión mínima del SO 16,4.** No hay Web Push en versiones anteriores de iOS/iPadOS.  
- **La instalación en la pantalla de inicio es obligatoria.** El manifiesto debe declarar `display: "standalone"` o `"fullscreen"`, y el usuario debe añadir la aplicación mediante Compartir → «Añadir a la pantalla de inicio». Web Push **no funciona** para el mismo sitio abierto en pestañas habituales de Safari o mediante un marcador; la instalación es una barrera rígida, no una preferencia.  
- **El permiso debe seguir un gesto directo del usuario** (p. ej., pulsar un botón «Suscribirse») — Apple no permite solicitudes de permiso ambientales o automáticas.  
- **Basado en estándares**: utiliza la misma pila W3C Web Push que macOS Ventura/Safari, apoyándose en la infraestructura del servicio Apple Push Notification, y — notablemente — **no requiere pertenecer al Apple Developer Program** para enviar Web Push, a diferencia del push nativo de iOS.  
- **La API de insignias está soportada** para aplicaciones web instaladas (`navigator.setAppBadge()` / `clearAppBadge()`), y las notificaciones respetan los modos de enfoque del sistema, con la configuración por aplicación sincronizada entre los dispositivos del usuario mediante el campo `id` del manifiesto.  
- Los datos de `caniuse` corroboran la barrera de versión: Safari en iOS muestra soporte **parcial** a partir de la 16,4 hasta la versión más reciente rastreada en esta investigación, frente a soporte **completo** en Safari macOS desde la versión 18 [3]. Esa marca «parcial» es una advertencia real y actual, no datos obsoletos — trate cualquier afirmación de «soporte completo en iOS» con sospecha hasta volver a verificarla contra caniuse o las publicaciones propias de WebKit.

### 2,2 Android / Chrome — soporte más amplio, sin barrera de instalación

La Push API ha estado «Ampliamente disponible» (base cruzada de navegadores) desde marzo de 2023 [5], y `caniuse` muestra soporte completo en Chrome para Android y en los equivalentes de escritorio Chrome/Firefox/Samsung Internet, alcanzando aproximadamente el 95 % de la cuota de uso global de navegadores cuando se incluye el soporte parcial [3]. A diferencia de iOS, **no es necesario instalar en la pantalla de inicio** para recibir push en Chrome Android — una página con un service worker registrado y activo puede suscribirse y recibir push mientras se ejecuta como una pestaña de navegador ordinaria, aunque las PWAs instaladas/standalone ofrecen una experiencia de notificación y apertura más nativa. Chrome no impone un límite de cuota al volumen de mensajes push; Firefox sí impone una cuota (renovada por visita al sitio) a menos que el mensaje produzca de forma fiable una notificación visible [5].

### 2,3 Escritorio — maduro, pero no implementado de forma homogénea

Safari de escritorio solo alcanzó soporte completo de la Push API en Safari 18 (parcial en 16,1–17,6) [3]; Chrome de escritorio lleva soporte completo desde la v50, Firefox desde la v44 [3]. En escritorio, generalmente no se aplica el requisito de instalación de Apple en la pantalla de inicio — la asimetría principal es Safari macOS, que heredó las mismas reglas de gesto de permiso y (para las versiones más recientes) de integración con los modos de enfoque que su contraparte iOS [2].

### 2,4 Disparadores de notificación / notificaciones locales programadas — no viables en 2026

Una API para programar notificaciones que se disparen en un momento futuro **sin un viaje de ida y vuelta a la red** (`Notification.showTrigger`, parte de una capacidad propuesta «Notification Triggers») se probó como un trial origin exclusivo de Chrome hace varios años, pero nunca alcanzó consenso entre navegadores ni una implementación estable, de seguimiento estándar, utilizable en producción. Los intentos en esta sesión de investigación de localizar una especificación viva o una página de característica enviada devolvieron errores 404 tanto en la URL del borrador W3C como en la del blog de Chrome — coherente con que se haya archivado en lugar de promocionarse como estándar real. **Consecuencia de diseño: no construir ninguna función (p. ej., «recuérdame en esta zona horaria exacta a las 4 de la tarde aunque la aplicación nunca abra la red») que dependa de notificaciones locales programadas del lado del cliente.** Cada recordatorio programado en Math Challenge necesita un Web Push disparado por el servidor, lo que a su vez requiere una suscripción activa y, en iOS, una PWA instalada.

### 2,5 Envío de Web Push a gran escala, del lado de Cloudflare

La biblioteca de referencia de Node.js para Web Push (`web-push` de web-push-libs) está construida sobre `Buffer` y las APIs `crypto` de Node y no está documentada como preparada para entornos edge/serverless de forma predeterminada [14]. Dos rutas nativas de Cloudflare hacen viable su uso dentro de la pila basada en Workers sin necesidad de un servidor Node independiente:

1. **API Web Crypto nativa** — Cloudflare Workers soporta plenamente la interfaz estándar `SubtleCrypto` [17], suficiente para implementar manualmente la firma JWT ES256 (ECDSA P‑256) de VAPID y el cifrado de carga útil AES‑GCM/ECDH que Web Push requiere, sin ninguna bandera de compatibilidad Node.  
2. **`node:crypto` bajo `nodejs_compat`** — desde la entrada del changelog de Cloudflare de abril de 2025, las APIs completas `node:crypto` y `node:tls` están disponibles en Workers cuando se activa la bandera de compatibilidad `nodejs_compat` [16], lo que significa que el paquete npm `web-push` existente (o un fork cercano) podría ejecutarse directamente en un Worker en lugar de requerir una reescritura sobre SubtleCrypto — vale la pena una pequeña prueba antes de comprometerse con una u otra vía.

Cualquiera de las dos opciones mantiene el envío de push dentro de la pila Workers/Queues ya utilizada en otras partes de este proyecto (según `AGENTS.md` §5.2), evitando un servicio externo a Cloudflare solo para disparar notificaciones.

## Platform support table

| Capability | iOS/iPadOS Safari | Android Chrome | Desktop (Chrome/Firefox/Safari) |
|---|---|---|---|
| Push API (server push while app closed) | Parcial; requiere 16,4+ [3] | Completo, base desde 2023 [5] | Completo en Chrome (v50+)/Firefox (v44+); Safari solo desde v18, parcial 16,1–17,6 [3] |
| Must be installed to Home Screen / standalone | **Sí, obligatorio** [2] | No — funciona desde una pestaña del navegador con un service worker activo | No (escritorio no tiene barrera de «pantalla de inicio»; Safari macOS hereda la misma regla de gesto de permiso) |
| Permission prompt rules | Debe seguir un gesto directo del usuario; no hay prompts ambientales [2] | Debe seguir gesto del usuario según la mejor práctica de Chrome [6]; menos estrictamente impuesto por el SO que iOS | Misma mejor práctica, no impuesto por el SO |
| Re-prompt after user blocks | No es posible programáticamente; el usuario debe cambiarlo en Configuración del sistema [2][6] | No es posible programáticamente; debe modificarse en la configuración del sitio del navegador [6] | Igual |
| Badging (app icon badge count) | Soportado para aplicaciones web instaladas [2] | Soportado vía API de insignias en PWAs instaladas | Varía; menos frecuente en navegadores de escritorio |
| Silent / quiet / background-only push | Manejo en segundo plano antes del permiso es posible [2]; no hay garantía documentada de «push silencioso» | Manejo estándar del evento push en service worker; la notificación es opcional si es solo datos, pero mostrar una es prácticamente obligatoria por la política del navegador para evitar abusos de «push silencioso» | Manejo estándar del evento push en service worker |
| Message volume limits | Gobernado por APNs a través del servicio de push de WebKit, no documentado separadamente aquí | No hay cuota impuesta por Chrome [5] | Firefox impone una cuota a menos que los mensajes produzcan notificaciones visibles [5] |
| Scheduled/local notifications without network (Notification Triggers) | No disponible — sin evidencia de un estándar enviado en 2026 | No disponible | No disponible |

## Design implications for Math Challenge

1. **Make the first permission ask a soft‑ask, not a hard ask.** Never trigger the native browser prompt on first load. Show an in‑app explainer («Le recordaremos a [child] una vez al día cuando sea hora de practicar») with a clear «Ahora no», and only fire the real OS prompt after explicit opt‑in — a denied prompt cannot be re‑shown programmatically on any platform [2][6].

2. **Gate the "install to Home Screen" step before promising push on iOS.** Because iOS Web Push is unavailable outside an installed PWA [2], the notification‑opt‑in flow on iOS must first walk the parent through «Add to Home Screen», or must silently degrade to no‑push and rely on in‑app reminders / email instead.

3. **Address notifications to the parent by default, not the child.** Given loss‑aversion/streak mechanics are the most compulsion‑adjacent lever available (§1.2, §1.4), and the audience includes children, the safer default is: streak‑at‑risk and re‑engagement nudges go to the *parent's* registered device/channel, with the child only receiving in‑app (not push) prompts during an active session.

4. **Cap push at one notification per day, hard limit, with an easy in‑app snooze/mute.** No industry frequency‑vs‑opt‑out curve could be independently re‑verified in this pass (flagged in Open Questions), so err conservative: one daily nudge, never more, plus an always‑visible per‑family control to reduce or silence it — mirroring the «give an easy opt‑out or users take the nuclear option» finding from Chrome's own guidance [6].

5. **Use implementation‑intention phrasing, not generic re‑engagement copy.** At onboarding, ask the family to pick a concrete time/place («después del desayuno», «antes de acostarse»). Notification copy should echo that commitment («Es [time] — el momento de matemáticas de [child]») rather than a bare «¡Vuelve a jugar!», consistent with the if‑then effect sizes in §1.3 [4].

6. **Use a fixed, transparent reward for the core loop; reserve variability for rare, clearly‑labeled bonus events.** Because variable‑ratio reward is mechanistically identical to slot‑machine/loot‑box design [11], the everyday correct‑answer reward (coins, stars) should be predictable. Reserve any surprise element (a «mystery star» once a week) for something infrequent, clearly bounded, and never monetizado.

7. **Do not sell streak repair or streak insurance.** Loss aversion is already doing the motivational work for free [12][13]; charging money to avoid losing a streak converts a psychological mechanic into una monetización directa de la aversión a la pérdida de un niño o familia, which is a step further than Duolingo's own model and worth avoiding on that basis alone.

8. **Treat the streak counter itself as something a parent can reset/forgive without penalty.** Sunk‑cost pressure (§1.4) can make a broken streak feel like a reason to quit entirely («ya la hemos perdido, ¿para qué seguir?»); a one‑tap «seguimos aquí, reinicia suavemente» affordance blunts the all‑or‑nothing cliff‑edge that pure streak mechanics create.

9. **Build every scheduled reminder as a server‑sent Web Push, never a client‑side scheduled/local notification.** §2.4 found no viable Notification Triggers‑style API in 2026 — any «remind me at 4pm» feature needs a server (Cloudflare Worker + Queues/cron) that pushes at the right moment per user, not a promise the client can keep offline.

10. **Send push from Cloudflare Workers using Web Crypto (or `node:crypto` under `nodejs_compat`) rather than standing up a separate Node push server.** Both paths are confirmed available on Workers today [16][17]; prototype both against the existing `web-push` library before choosing, since compatibility with that library specifically (vs. hand‑rolled VAPID) was not independently confirmed in this pass.

11. **Design the notification content to survive iOS's install gate gracefully.** For the fraction of iOS users who never install to Home Screen, fall back to email or an in‑app banner on next open rather than a broken promise of «you'll get reminded» — the gate in §2.1 is absolute, not a permission the app can work around.

12. **Distinguish "habit" from "compulsion" with an explicit internal metric, not just DAU/streak length.** Given Duolingo's own documented tension between engagement and learning outcomes [15], track a pedagogical metric (e.g., problems mastered, error‑rate improvement) alongside streak/open metrics, and treat a rising streak with a flat or falling mastery metric as a warning sign, not a win.

13. **Respect Focus modes and quiet hours by default.** iOS already integrates push with system Focus modes [2]; Math Challenge should additionally enforce its own app‑level quiet hours (e.g., no push before 7am or after 8pm local time) regardless of platform, since not all platforms tie into Focus automatically.

14. **Make the parental screen‑time limit and the notification cadence the same lever, not two separate settings.** Since the product's premise is a parent‑set daily limit, the notification plan should default its one‑per‑day nudge to land near the *start* of the parent‑approved window, operationalizing the implementation‑intention finding (§1.3) rather than pushing at an arbitrary marketing‑optimal hour.

## Open questions for the project owner

1. Should push notifications be **parent‑only**, **child‑only (on a child's own device)**, or **both with different content**, given the household may have a shared or child‑specific device?

2. What is the acceptable ceiling — is one push per day acceptable, or should some days have zero by policy (e.g., only push on a missed day, never on a day already completed)?

3. Should the «surprise bonus» mechanic exist at all, or does the compulsion‑mechanism overlap with slot‑machine/loot‑box design (§1.2) rule it out entirely for a children's product regardless of how it's bounded?

4. Is a streak‑repair/streak‑freeze mechanic wanted at all (even if never sold for money), or should broken streaks always restart clean to avoid sunk‑cost pressure on a child?

5. This research pass could not independently re‑verify current industry frequency‑vs‑opt‑out data (Airship/OneSignal/Business‑of‑Apps sources 404/403'd) — is it worth a follow‑up research pass specifically to pull that data from an accessible mirror, or is the conservative one‑per‑day default in item 4 above acceptable without it?

6. Should Math Challenge commit engineering time now to prototype `node:crypto`‑based `web-push` on Workers vs. hand‑rolled Web Crypto VAPID, given both are technically available but neither was validated end‑to‑end in this research pass?

## Sources

1. Modelo de comportamiento de BJ Fogg (B=MAP) — https://en.wikipedia.org/wiki/Fogg_Behavior_Model  
2. Blog de WebKit, «Web Push for web apps on iOS and iPadOS» — https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/  
3. caniuse, compatibilidad del Push API en navegadores — https://caniuse.com/push-api  
4. Intención de implementación (planificación si‑entonces de Gollwitzer) — https://en.wikipedia.org/wiki/Implementation_intention  
5. MDN, visión general del Push API — https://developer.mozilla.org/en-US/docs/Web/API/Push_API  
6. web.dev, «Permission UX: getting users to accept notifications» — https://web.dev/push-notifications-permissions-ux/  
7. Wikipedia, «The Power of Habit» (pista‑rutina‑recompensa de Duhigg) — https://en.wikipedia.org/wiki/The_Power_of_Habit  
8. Nir Eyal, «How to Manufacture Desire» (modelo de gancho) — https://www.nirandfar.com/how-to-manufacture-desire/  
9. Wikipedia, «Nir Eyal» (tensión entre Hooked e Indistractable) — https://en.wikipedia.org/wiki/Nir_Eyal  
10. web.dev, «Push notifications overview» — https://web.dev/articles/push-notifications-overview  
11. Wikipedia, «Operant conditioning» (programas de razón variable) — https://en.wikipedia.org/wiki/Operant_conditioning  
12. Wikipedia, «Loss aversion» — https://en.wikipedia.org/wiki/Loss_aversion  
13. Wikipedia, «Sunk cost» — https://en.wikipedia.org/wiki/Sunk_cost  
14. GitHub, web-push-libs/web-push — https://github.com/web-push-libs/web-push  
15. Wikipedia, «Duolingo» (rachas, ligas, algoritmo de notificaciones, críticas) — https://en.wikipedia.org/wiki/Duolingo  
16. Cloudflare Changelog, «Improved support for Node.js Crypto and TLS APIs in Workers» (2025‑04‑08) — https://developers.cloudflare.com/changelog/post/2025-04-08-nodejs-crypto-and-tls/  
17. Cloudflare Docs, compatibilidad de Node.js en Workers (tabla de soporte de la API Web Crypto) — https://developers.cloudflare.com/workers/runtime-apis/nodejs/  
18. MDN, API de notificaciones — https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API
