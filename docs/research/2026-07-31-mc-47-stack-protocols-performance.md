# Stack, protocolos y rendimiento real: qué está de verdad a la vanguardia sobre Cloudflare

> Math Challenge research — 2026-07-31 — topic 47

## Resumen ejecutivo (ES)

- **gRPC no es viable aquí, y no por falta de ganas.** Workers y Durable Objects **no pueden hacer llamadas gRPC salientes** porque el runtime no soporta streaming bidireccional HTTP/2; hay un issue abierto en `cloudflare/workerd` pidiéndolo [1].
- **Y el navegador tampoco habla gRPC.** El cliente web implementa un protocolo distinto al gRPC nativo: los navegadores no exponen las funciones de HTTP/2 que gRPC necesita, así que gRPC-Web usa HTTP/1.1 — *"lo cual cancela algunas de las ventajas de usar gRPC"* — y **no soporta llamadas con streaming de cliente ni bidireccionales** [2][3].
- **El RPC nativo de Workers gana por arquitectura, no por poco.** Con Service Bindings *"no hay sobrecarga ni latencia añadida"*, y el Worker llamado *"normalmente ni siquiera cruza una red, y suele correr en el mismo hilo que quien lo llama, reduciendo la latencia a cero"* [4][5].
- **HTTP/3 sobre QUIC es un interruptor, no un proyecto.** Está disponible en todos los planes de Cloudflare y se activa desde la configuración de optimización de protocolo [6][7].
- **El número que importa para redes malas:** en conexiones con 1-3% de pérdida de paquetes —el móvil real— HTTP/3 da **10-30% de mejora en tiempo de carga**, porque la recuperación de pérdida por stream evita que un solo paquete perdido atore la página entera [8].
- Con **0-RTT** para visitantes recurrentes el ahorro puede **superar los 300 ms**, suficiente para mover una página de "necesita mejorar" a "bueno" en Core Web Vitals [8].
- **INP es la métrica que se falla.** 43% de los sitios no pasa el umbral de 200 ms, y es la más difícil de 2026 porque mide **cada** interacción, no la primera; el enemigo son las tareas largas de JavaScript que bloquean el hilo principal [9].
- **Google rankea con datos de campo, no de laboratorio:** *"un 100 perfecto en Lighthouse no significa nada si los usuarios reales en redes 3G sufren"* [9].
- **AVIF y WebP dan archivos 25-50% más chicos**; precargar la imagen de LCP con `fetchpriority="high"` es de lo más eficaz para LCP [9].
- Implicación central: lo que está a la vanguardia **en esta plataforma** es RPC nativo + HTTP/3 + presupuesto duro de INP, no gRPC. Adoptar gRPC aquí sería adoptar la generación anterior con más trabajo.

## Executive summary (EN)

- **gRPC is not viable here.** Workers and Durable Objects **cannot make outbound gRPC calls** because the runtime lacks HTTP/2 bidirectional streaming; an open `cloudflare/workerd` issue tracks it [1].
- **Browsers don't speak gRPC either.** The web client implements a different protocol from native gRPC: browsers don't expose the HTTP/2 features gRPC needs, so gRPC-Web falls back to HTTP/1.1 — *"which cancels out some of the advantages of using gRPC"* — and **does not support client-streaming or bidirectional calls** [2][3].
- **Workers' native RPC wins on architecture.** With Service Bindings *"there is zero overhead or added latency"*, and the callee *"usually does not even cross a network, and usually runs in the very same thread as the caller, reducing latency to zero"* [4][5].
- **HTTP/3 over QUIC is a toggle, not a project** — available on all Cloudflare plans [6][7].
- **The number that matters for bad networks:** on 1-3% packet-loss connections, HTTP/3 delivers **10-30% page-load improvement**, because per-stream loss recovery stops one dropped packet from stalling everything [8]. With **0-RTT**, savings can **exceed 300 ms** [8].
- **INP is the one that fails.** 43% of sites miss the 200 ms threshold; it is 2026's hardest vital because it measures **every** interaction [9].
- **Google ranks on field data, not lab data** [9]. AVIF/WebP cut files 25-50% [9].
- Core implication: the leading edge **on this platform** is native RPC + HTTP/3 + a hard INP budget — not gRPC.

## Findings

### 1. Por qué gRPC no entra

Tres hechos independientes, cada uno suficiente por sí solo.

**Del lado del servidor.** El issue `cloudflare/workerd#6455` documenta que Workers y Durable Objects no pueden hacer llamadas gRPC salientes porque el runtime no soporta streaming bidireccional HTTP/2; el propio issue señala que incluso soportar solo gRPC unario —un POST HTTP/2 con cuerpo protobuf más trailers— desbloquearía la mayoría de los casos de uso, y todavía no existe [1].

**Del lado del navegador.** Esto no es una limitación de Cloudflare sino del protocolo: la biblioteca cliente web *implementa un protocolo distinto al gRPC nativo* precisamente porque los navegadores no exponen las funciones de HTTP/2 que gRPC requiere [3]. En consecuencia gRPC-Web usa HTTP/1.1, *"lo cual cancela algunas de las ventajas de usar gRPC"*, y **el streaming de cliente y el bidireccional quedan fuera de alcance** [2].

**Del lado de la infraestructura intermedia.** Cloudflare documenta en su propio blog que los trailers de HTTP —que gRPC necesita para el estado— *no estaban plenamente soportados* por su proxy de borde, y hay reportes de cuerpos y trailers de gRPC siendo removidos a través de túneles incluso con TLS+ALPN+h2 en el origen [10][11].

**Conclusión.** No es que gRPC sea difícil aquí: es que el caso de uso que lo justificaría —streaming binario eficiente y bidireccional— es exactamente el que no está disponible ni en el runtime ni en el navegador. Lo que quedaría sería protobuf sobre HTTP/1.1 con un proxy extra: más piezas, más latencia, peor depuración, y sin la ventaja.

### 2. Lo que sí es la vanguardia en esta plataforma

Cloudflare tiene RPC nativo de JavaScript sobre Service Bindings, diseñado para *"sentirse lo más parecido posible a llamar una función JavaScript dentro del mismo Worker"* [4]. Su característica de rendimiento no admite comparación con ninguna arquitectura de red: *"no hay sobrecarga ni latencia añadida. Por defecto, ambos Workers corren en el mismo hilo del mismo servidor de Cloudflare"*, y el RPC hacia otro Worker *"normalmente ni siquiera cruza una red"* [4][5].

Un RPC que no cruza la red no puede ser superado por un RPC que sí la cruza, por eficiente que sea su serialización. Esa es toda la comparación.

Los Service Bindings soportan dos estilos: reenvío de `fetch` (se pasa un `Request` completo) y RPC tipado (se invocan métodos directamente) [5]. El segundo es el que corresponde al motor de reto llamando al modelo del alumno, al calificador y al tutor.

### 3. HTTP/3, QUIC y lo que realmente pasa en una red congestionada

HTTP/3 está disponible en todos los planes de Cloudflare y se activa con un interruptor en la configuración de optimización de protocolo [6][7]. No hay trabajo de implementación, solo de verificación.

Lo que gana, con números:

- **Pérdida de paquetes.** En conexiones con 1-3% de pérdida —el rango típico del móvil real— estudios de Google y Cloudflare reportan **10-30% de mejora en tiempo de carga**, porque el aislamiento a nivel de stream impide que un paquete perdido bloquee todas las peticiones [8]. Esto es exactamente el escenario de "Android de gama baja en LatAm" que el plan maestro nombra como mercado objetivo.
- **Establecimiento de conexión.** QUIC fue construido para 0-RTT/1-RTT; con 0-RTT en visitantes recurrentes el ahorro puede **superar los 300 ms**, lo bastante para cambiar la evaluación de Core Web Vitals de una página [8].

**Lo que no arregla:** HTTP/3 acelera el transporte, no el trabajo. Un bundle de JavaScript pesado sigue bloqueando el hilo principal exactamente igual sobre QUIC que sobre TCP. Por eso el presupuesto de INP (§4) importa más que el protocolo.

### 4. INP: la métrica que este producto está en riesgo de fallar

Los umbrales de "bueno" en 2026: LCP bajo 2.5 s, CLS bajo 0.1, INP bajo 200 ms — y los sitios de más alto desempeño apuntan a **INP bajo 150 ms** [9].

**El 43% de los sitios falla el umbral de 200 ms de INP**, lo que la convierte en la vital más comúnmente fallada de 2026 [9]. La razón por la que es más difícil que las otras: **mide cada toque y cada clic, no solo el primero**, y el enemigo son las tareas largas del hilo principal — JavaScript pesado que impide al navegador responder cuando el usuario interactúa [9].

Esto es un riesgo específico y nombrable para Math Challenge: el motor de reto son islas React, el niño toca muchas veces por sesión, y cada toque se mide. Un juego de matemáticas es, por su naturaleza, una aplicación de alta frecuencia de interacción — el perfil exacto donde INP se rompe.

Y el marco de evaluación cierra la puerta al autoengaño: **Google rankea con datos de campo, no de laboratorio**; *"un 100 perfecto en Lighthouse no significa nada si los usuarios reales en redes 3G sufren"* [9].

### 5. Imágenes

Servir formatos modernos —AVIF o WebP— da archivos **25-50% más chicos** [9]. Para LCP, lo más eficaz es precargar la imagen de LCP con `fetchpriority="high"` además de optimizar su peso [9].

Para este producto el volumen de imagen es real: ~30 piezas de arte de la Sabana más ilustraciones de ítems (`mc-40`, D-019), servidas desde R2 a los siete locales. Como el arte se reusa entre idiomas —la Sabana no habla (D-019)— el catálogo de imágenes es compartido y por lo tanto altamente cacheable.

### 6. Nativo en cuatro plataformas

Las guías de plataforma son explícitas y distintas: Android sigue Material Design, con **Material 3** introduciendo color dinámico y design tokens; Apple cubre todas sus plataformas con las Human Interface Guidelines [12][13]. Para que una PWA no se sienta web, la recomendación práctica converge en tres cosas: **tipografía preferida del sistema**, distinta por iOS/Android/Windows; **barras de navegación, pestañas y modales al estilo de la plataforma**; y **gestos esperados** — desplazamiento suave, pellizcar para acercar, deslizar [13][14].

Las restricciones duras por plataforma ya están documentadas en `mc-33` y no cambian: en iOS la instalación es manual y el push exige estar instalada; en Android no hay reja de instalación; en macOS Safari 17+ hay "Añadir al Dock"; en Windows la instalación desde Edge/Chromium es la más integrada de las cuatro.

El costo de la adaptación por plataforma no es de investigación sino de ingeniería: duplica componentes, pruebas y decisiones de diseño. Es una decisión de producto, no técnica.

### 7. La flota de auditores

Un despliegue con auditores adversariales es implementable y encaja con cómo se construyó este proyecto. Se divide en dos clases con costos y velocidades distintas.

**Deterministas (12), en cada commit, en segundos:** presupuesto de bundle · Core Web Vitals con umbrales de §4 · axe-core · contraste · tamaño de blancos táctiles por banda (24 px WCAG AA / 44 px HIG / 88 px kinder, per `mc-38` y `mc-20`) · completitud de las siete llaves de idioma · validación de JSON-LD · reciprocidad de `hreflang` · escaneo de secretos · prefijo `math-challenge-` (`CLAUDE.md` § Cloudflare) · seguridad de migraciones · presupuesto de precaché offline (~5 MB de audio, `mc-42`).

**Adversariales con LLM (23), en cada PR, instruidos para encontrar la violación y no para aprobar:** líneas rojas (las ocho) · privacidad COPPA/GDPR-K · anti-humillación · anti-trampa · patrones oscuros · pedagogía · rigor matemático · rigor científico (toda afirmación factual rastreable) · canon de Larry · rachas y tiempo de pantalla · kinder · PWA iOS · PWA Android · PWA-first/offline · rendimiento en red lenta · UX por banda de edad · y **uno por locale**: `en`, `es-MX`, `es-ES`, `fr-FR`, `pt-BR`, `pt-PT`, `de-DE`.

Total: **35**.

**Las dos reglas que los hacen servir en vez de estorbar.** Primero: **cada auditor cita la decisión o el documento que hace cumplir** — un auditor que no puede señalar una decisión de `decisions.md` o un hallazgo de `research/` está opinando, y su veredicto no bloquea. Segundo: **anular a un auditor exige escribir por qué**, y esa razón queda en el historial. Sin lo primero, la flota genera ruido; sin lo segundo, se vuelve un obstáculo que la gente aprende a rodear en silencio.

**Riesgo conocido, dicho de frente:** 23 auditores con LLM por PR tienen un costo por PR y una tasa de falsos positivos. La mitigación es que solo los deterministas bloquean por defecto, y los adversariales bloquean únicamente cuando citan una línea roja o una decisión explícita; el resto reporta sin bloquear.

## Design implications

1. **Nada de gRPC ni gRPC-Web.** RPC nativo de Workers sobre Service Bindings para todo lo interno (§1, §2).
2. **HTTP/3 verificado, no asumido**, incluyendo 0-RTT para recurrentes; es configuración, y hay que confirmar que está activo antes de reclamarlo (§3).
3. **Presupuesto duro de INP ≤ 150 ms**, no 200 — es un juego de alta frecuencia de interacción y el umbral flojo es donde falla el 43% de la web (§4).
4. **Medición con datos de campo desde el primer día**, no con Lighthouse; un 100 de laboratorio no dice nada del niño en 3G (§4).
5. **AVIF con respaldo WebP para todo el arte**, con `fetchpriority="high"` en la imagen de LCP de cada pantalla (§5).
6. **El arte de la Sabana se cachea una vez y sirve a los siete locales**, porque no contiene texto (D-019) — es la palanca de peso más barata que tiene el producto.
7. **Interfaz adaptativa por plataforma**: Material 3 en Android, HIG en iOS/macOS, controles del sistema en Windows, con tipografía del sistema en cada uno (§6).
8. **Presupuesto de rendimiento como auditor determinista que bloquea**, no como reporte que se ignora (§7).
9. **35 auditores, con las dos reglas de §7**: citar la decisión que hacen cumplir, y anulación por escrito.
10. **Solo los deterministas bloquean por defecto**; los adversariales bloquean solo al citar una línea roja o una decisión explícita (§7).

## Open questions for the project owner

1. ¿Qué se hace cuando un auditor adversarial y otro se contradicen — por ejemplo, rendimiento pidiendo menos JavaScript y accesibilidad pidiendo más lógica de foco? ¿Hay un orden de precedencia escrito?
2. ¿Los 23 auditores con LLM corren en cada PR o solo en los que tocan rutas sensibles? El costo por PR y el tiempo de espera cambian mucho.
3. ¿El presupuesto de INP de 150 ms se mide en qué dispositivo de referencia? `mc-33` propone un Android de gama media sobre 3G lento; hay que fijarlo o el presupuesto no es comprobable.
4. ¿La interfaz adaptativa incluye Windows y macOS desde el inicio, o solo móvil en v1?

## Sources

1. GitHub, `cloudflare/workerd` issue #6455 — "Support HTTP/2 bidirectional streaming (gRPC) in Workers/Durable Objects" — https://github.com/cloudflare/workerd/issues/6455
2. GitHub, `cloudflare/workerd` issue #3150 — "[Question] gRPC/gRPC-web (+streaming) support for Cloudflare Workers" — https://github.com/cloudflare/workerd/issues/3150
3. gRPC Core documentation, "gRPC Web" (PROTOCOL-WEB) — https://grpc.github.io/grpc/core/md_doc__p_r_o_t_o_c_o_l-_w_e_b.html
4. Cloudflare Blog, "We've added JavaScript-native RPC to Cloudflare Workers" — https://blog.cloudflare.com/javascript-native-rpc/
5. Cloudflare Workers docs, "Service bindings — RPC (WorkerEntrypoint)" — https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/rpc/
6. Cloudflare Speed docs, "HTTP/3 (with QUIC)" — https://developers.cloudflare.com/speed/optimization/protocol/http3/
7. Cloudflare Speed docs, "Protocol optimization" — https://developers.cloudflare.com/speed/optimization/protocol/
8. Calmops, "HTTP/3 and QUIC Protocol Complete Guide 2026" — https://calmops.com/network/http3-quic-protocol-complete-guide/ — fuente de las cifras de 10-30% con 1-3% de pérdida y del ahorro >300 ms con 0-RTT.
9. Digital Applied, "Core Web Vitals 2026: INP, LCP & CLS Optimization" — https://www.digitalapplied.com/blog/core-web-vitals-2026-inp-lcp-cls-optimization-guide — fuente de los umbrales, del 43% que falla INP, del ahorro 25-50% de AVIF/WebP y de la distinción campo-vs-laboratorio.
10. Cloudflare Blog, "Road to gRPC" — https://blog.cloudflare.com/road-to-grpc/
11. GitHub, `cloudflare/cloudflared` issue #1641 — trailers de gRPC removidos a través de túnel — https://github.com/cloudflare/cloudflared/issues/1641
12. UXPin, "iOS vs. Android UI Design: 9 Key Differences (2026)" — https://www.uxpin.com/studio/blog/ios-vs-andoid-ui-design-for-mobile/
13. DEV Community, "Designing Native-Like Progressive Web Apps for iOS" — https://dev.to/oskarlarsson/designing-native-like-progressive-web-apps-for-ios-510o
14. MagicBell, "4 Essential PWA Strategies for Enhanced iOS Performance" — https://www.magicbell.com/blog/essential-pwa-strategies-for-enhanced-ios-performance
15. Investigación interna: `mc-32-cloudflare-architecture.md`, `mc-33-pwa-first-reality.md`, `mc-38-accessibility-learning-differences.md`, `mc-42-audio-haptics-game-feel.md`.

**Calidad de fuentes.** Las fuentes [1]-[7] y [10]-[11] son primarias: documentación oficial de Cloudflare, de gRPC, e issues públicos de sus repositorios. Las fuentes [8], [9], [12]-[14] son publicaciones de la industria; sus cifras (10-30%, 43%, 25-50%) deben tratarse como **orden de magnitud direccional** y reverificarse contra el Web Almanac o el CrUX antes de usarse en material público. La conclusión sobre gRPC (§1) descansa **solo en fuentes primarias** y es la más firme de este documento.
