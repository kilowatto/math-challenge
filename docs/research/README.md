# Math Challenge — Índice de investigación / Research index

> 45 investigaciones hechas el **2026-07-31** por agentes independientes, cada uno
> con instrucción explícita de **no inventar citas** y de marcar como *unverified*
> lo que no pudiera confirmar contra una fuente primaria. Total ≈ 152,000 palabras.
>
> Las mc-45 y mc-46 se agregaron después de la ola original, al planear el
> onboarding y los clubs; llevan la misma fecha porque el proyecto entero se
> investigó ese día.
>
> **Cómo leer esto.** Cada documento trae `Resumen ejecutivo (ES)` y
> `Executive summary (EN)` arriba, hallazgos con citas numeradas en medio, y una
> sección `Design implications` al final con lo accionable. Si tienes cinco
> minutos, lee solo los resúmenes ejecutivos de los marcados ⭐.
>
> **Advertencia de método.** La cuota de WebSearch de la sesión se agotó a media
> investigación. Los agentes posteriores trabajaron por WebFetch directo contra
> fuentes primarias (MDN, WebKit, W3C, FTC, EUR-Lex, páginas de precios, PDFs de
> papers) y contra el endpoint HTML de DuckDuckGo. Cada documento declara sus
> limitaciones al final. Varios sitios (ftc.gov, ico.org.uk) bloquean fetch
> automatizado, así que ciertas afirmaciones legales están marcadas
> `[unverified]` a propósito — **esas no se pueden usar como base de cumplimiento
> sin confirmarlas con un abogado.**

---

## Pedagogía — cómo se enseñan las matemáticas

| # | Documento | De qué sirve |
|---|-----------|--------------|
| 01 | [Japón: lesson study, bansho, neriage, soroban](2026-07-31-mc-01-japan-lesson-study.md) | La estructura de 4 fases de una clase japonesa; el estudio TIMSS en video con los números duros; qué dice la evidencia real del ábaco |
| 02 | [China: enseñanza con variación y maestría](2026-07-31-mc-02-china-variation-mastery.md) | ⭐ Cómo generar **series** de ejercicios con variación sistemática en vez de números al azar. Cambia la unidad de autoría |
| 03 | [Singapur: CPA y modelo de barras](2026-07-31-mc-03-singapore-cpa-bar-models.md) | El widget de barras táctil y cómo concreto→pictórico→abstracto mapea a niveles de dificultad |
| 04 | [Carga cognitiva y ejemplos resueltos](2026-07-31-mc-04-cognitive-load-worked-examples.md) | ⭐ Cuándo mostrar la solución vs. hacer que resuelva; cómo desvanecer el andamiaje solo |
| 05 | [Espaciado, recuperación e intercalado](2026-07-31-mc-05-spacing-retrieval-interleaving.md) | ⭐ El algoritmo de repaso concreto (FSRS-lite) con parámetros y umbral de maestría |
| 06 | [Numeración temprana (3-7 años)](2026-07-31-mc-06-early-numeracy-kinder.md) | ⭐ La trayectoria de aprendizaje exacta del nivel kinder, en orden |
| 07 | [Fracciones, decimales y razón (8-14)](2026-07-31-mc-07-fractions-rational-numbers.md) | ⭐ Tabla de 13 errores con nombre → respuesta equivocada que producen → qué debe decir Larry |
| 08 | [Álgebra y sus errores (12-17)](2026-07-31-mc-08-algebra-misconceptions.md) | ⭐ Tabla de 9 "reglas mal aprendidas" → cómo repararlas |
| 09 | [Geometría y razonamiento espacial](2026-07-31-mc-09-geometry-spatial-reasoning.md) | Qué tipos de reactivo geométrico son calificables automáticamente en una PWA |
| 10 | [Ansiedad matemática, mentalidad y cronómetro](2026-07-31-mc-10-math-anxiety-mindset-timing.md) | ⭐⭐ **Leer antes de decidir el cronómetro.** Dónde la evidencia contradice el brief |
| 11 | [Retroalimentación y evaluación formativa](2026-07-31-mc-11-feedback-formative-assessment.md) | ⭐ Plantillas de feedback por banda de edad; qué feedback empeora el desempeño |
| 12 | [Demostración, olimpiada y nivel PhD](2026-07-31-mc-12-advanced-proof-olympiad-phd.md) | ⭐ 14 bandas arriba de bachillerato con su mecanismo real de calificación |
| 39 | [Kumon, ábaco, védica, rusa, húngara, finlandesa](2026-07-31-mc-39-eastern-drill-mental-math-traditions.md) | Qué tradición tiene evidencia y cuál es mercadotecnia; qué robar de cada una |
| 35 | [Evidencia de enseñar por internet](2026-07-31-mc-35-online-learning-evidence.md) | ⭐ Proporción hacer/ver, largo de video, y cómo mediríamos si la app enseña algo |

## Producto, motor y contenido

| # | Documento | De qué sirve |
|---|-----------|--------------|
| 13 | [Modelo del alumno: BKT, DKT, Elo de Math Garden](2026-07-31-mc-13-its-knowledge-tracing-elo.md) | ⭐⭐ La fórmula que combina precisión **y** tiempo en un solo puntaje, ya validada. Es la respuesta al "puntos por velocidad" |
| 14 | [Khan, Brilliant, Kumon, IXL, Prodigy, ST Math…](2026-07-31-mc-14-competitive-products.md) | ⭐ Qué copiar, qué evitar, y dónde está el hueco de mercado |
| 15 | [Escaleras de grado internacionales](2026-07-31-mc-15-international-grade-ladders.md) | ⭐ Propuesta de escalera interna de 11 bandas, neutral al país, con nombres en 5 idiomas |
| 36 | [Diseño de retos y formatos de reactivo](2026-07-31-mc-36-problem-design-item-formats.md) | ⭐ Catálogo de 20 formatos con "¿resiste un solver?" y orden de construcción del MVP |
| 40 | [Banco de 2,500 reactivos: cómo se opera](2026-07-31-mc-40-item-bank-content-operations.md) | ⭐⭐ El plan concreto de los 2,500: plantillas vs. mano vs. LLM, esquema, esfuerzo y costo |
| 44 | [Ubicación adaptativa (CAT, IRT, ALEKS)](2026-07-31-mc-44-adaptive-placement-cat.md) | ⭐ El algoritmo de ubicación construible en v1 sin banco calibrado |
| 37 | [Larry Profe: portar a Larry](2026-07-31-mc-37-larry-profe-port.md) | ⭐⭐ Qué existe hoy en el repo (con `archivo:línea`), la tabla de ruteo de modelos y el costo por explicación |

## Gamificación, competencia e identidad

| # | Documento | De qué sirve |
|---|-----------|--------------|
| 16 | [Gamificación de Duolingo](2026-07-31-mc-16-duolingo-gamification.md) | ⭐ Inventario de mecánicas con evidencia y riesgo con menores; economía de XP propuesta |
| 17 | [Gamificación ética y patrones oscuros](2026-07-31-mc-17-ethical-gamification-dark-patterns.md) | ⭐⭐ **La contraparte del "lo más adictivo posible".** Tabla de líneas rojas con exposición regulatoria |
| 18 | [Tableros y competencia](2026-07-31-mc-18-leaderboards-competition.md) | ⭐ Glicko-2, ligas de 30, y cómo normalizar puntos entre un niño sumando y un doctorando |
| 19 | [Hábito, rachas y notificaciones push](2026-07-31-mc-19-habit-loops-push-notifications.md) | ⭐ Plan de notificaciones + la realidad técnica del push en iOS |
| 42 | [Audio, háptica y "juice"](2026-07-31-mc-42-audio-haptics-game-feel.md) | Spec de sonido por banda; **iOS Safari no tiene Vibration API, en ninguna versión** |
| 43 | [Avatares, alias e identidad](2026-07-31-mc-43-avatars-identity-progression.md) | Cómo generar alias seguros en 5 idiomas y qué cosméticos no son caja de botín |

## Interfaz por banda de edad y dispositivo

| # | Documento | De qué sirve |
|---|-----------|--------------|
| 20 | [3-6 años · KINDER](2026-07-31-mc-20-ui-ages-3-6-kinder.md) | ⭐ Blancos táctiles de ~88px con su fuente; por qué arrastrar es un error a esta edad |
| 21 | [7-11 años · PRIMARIA](2026-07-31-mc-21-ui-ages-7-11-primary.md) | El punto medio: ya no infantil, todavía no adolescente |
| 22 | [12-17 años · SECUNDARIA](2026-07-31-mc-22-ui-teens-12-17.md) | ⭐ Qué hace que una app **no** se lea como app de niños; modo oscuro por defecto |
| 23 | [Adulto / universidad / experto](2026-07-31-mc-23-ui-adult-expert.md) | ⭐ KaTeX vs MathJax vs MathLive con licencias y accesibilidad; entrada de matemáticas por dispositivo |
| 38 | [Accesibilidad y diferencias de aprendizaje](2026-07-31-mc-38-accessibility-learning-differences.md) | ⭐ Cómo un juego cronometrado puede cumplir WCAG 2.2 (la excepción textual); modo discalculia |
| 34 | [i18n de la notación matemática](2026-07-31-mc-34-i18n-math-notation.md) | ⭐⭐ México usa **punto** decimal y el resto del mundo hispano **coma**; la división larga se dibuja de 4 formas distintas |

## Plataforma, seguridad y negocio

| # | Documento | De qué sirve |
|---|-----------|--------------|
| 32 | [Arquitectura Cloudflare](2026-07-31-mc-32-cloudflare-architecture.md) | ⭐⭐ **Inventario completo de objetos `math-challenge-*`** con nombre, tipo, propósito EN/ES y binding |
| 33 | [Realidad de la PWA en 2026](2026-07-31-mc-33-pwa-first-reality.md) | ⭐ Matriz de capacidades iOS/Android/escritorio; push en iOS exige instalación en pantalla de inicio |
| 25 | [Ley de privacidad infantil](2026-07-31-mc-25-child-privacy-law.md) | ⭐⭐ COPPA 2025, GDPR art. 8, Children's Code, LGPD art. 14, LFPDPPP tras la desaparición del INAI |
| 26 | [Tiempo de pantalla saludable](2026-07-31-mc-26-screen-time-healthy-defaults.md) | ⭐ Tabla de límites por edad — default, mínimo y máximo que un padre puede poner |
| 27 | [Cuentas familiares y consentimiento](2026-07-31-mc-27-family-accounts-parental-consent.md) | ⭐ Modelo de entidades; cómo entra un niño de 5 años en menos de 5 segundos sin leer |
| 28 | [Modo maestro / salón](2026-07-31-mc-28-teacher-classroom-mode.md) | ⭐⭐ **El hueco legal:** un maestro sin escuela detrás no puede invocar la excepción escolar |
| 29 | [Integridad y anti-trampa](2026-07-31-mc-29-assessment-integrity-anticheat.md) | ⭐ Escalera progresiva de 6 niveles y la lista de lo que jamás se le hace a un niño |
| 30 | [Telemetría conductual](2026-07-31-mc-30-behavioral-telemetry-process-data.md) | ⭐⭐ Corregir una respuesta **mejora** la calificación en 79% de los casos: penalizar el borrado es un error |
| 31 | [Resistencia a solvers de IA](2026-07-31-mc-31-ai-solver-resistance.md) | ⭐ Qué formatos sobreviven a Photomath y a un modelo de frontera, y qué no se puede impedir |
| 41 | [Monetización y precios](2026-07-31-mc-41-monetization-pricing.md) | Precios reales de la competencia, métodos de pago por mercado, IVA y derecho de desistimiento |
| 45 | [Onboarding, registro y activación](2026-07-31-mc-45-onboarding-activation.md) | ⭐ Cuánto cuesta cada campo de registro, y por qué NN/g desaconseja el carrusel de bienvenida **por nombre** |
| 46 | [Clubs, retos de grupo y prendas](2026-07-31-mc-46-clubs-social-challenges.md) | ⭐⭐ Los tres elementos del juego ilegal y cómo se elimina uno; el *Group Goal* de Strava; cómo tener apuestas sin perdedor |

---

## Documentos relacionados fuera de esta carpeta

- [`../decisions.md`](../decisions.md) — las 29 decisiones del dueño (D-001 …
  D-029), con fecha, y las dos tensiones que siguen abiertas.
- [`../master-plan.md`](../master-plan.md) — el plan integral, en 15 secciones.
- [`../infrastructure.md`](../infrastructure.md) — los 27 objetos
  `math-challenge-*` de Cloudflare.

## Numeración

Los números son identificadores de tema, no un orden de lectura. **No existe un
mc-24**: el tema "métodos de entrada matemática por dispositivo" se fusionó en
el mc-23 durante el diseño de la investigación, y el hueco se deja a propósito
para no renumerar 20 archivos ni romper referencias cruzadas ya escritas.
