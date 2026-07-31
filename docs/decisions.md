# Math Challenge — Decisiones del dueño / Owner decisions

> Bitácora de decisiones tomadas por el dueño del proyecto (Esteban) durante la
> fase de investigación y planeación. Cada entrada lleva fecha y, cuando aplica,
> la investigación que la respalda o la contradice.
>
> Idiomas: ES (autoritativo aquí, es documentación interna). EN summaries live in
> the research documents themselves.

---

## D-001 — Dónde vive el proyecto · 2026-07-31

> **REVISADA el mismo día — ver [D-023](#d-023--repo-propio-e-independiente--2026-07-31).**

**Decisión original (superada):** carpeta `math-challenge/` dentro del monorepo
`ignia-object-storage`, compartiendo pnpm workspace, gates y convenciones.

**Lo que sobrevive de ella:** los objetos de Cloudflare llevan prefijo
`math-challenge-*`. IOS, IMP y Math Challenge siguen compartiendo **la cuenta de
Cloudflare**, aunque ya no el repositorio, así que el prefijo sigue siendo
necesario y ahora es lo único que los separa visualmente en el dashboard.

---

## D-002 — Cómo se asigna el nivel · 2026-07-31

**Decisión:** **prueba de ubicación adaptativa**. El padre captura la edad — la
edad determina el **tema visual**; la ubicación adaptativa determina la
**dificultad**. Los dos ejes van separados a propósito: un niño de 8 años que va
en álgebra sigue viendo el tema de primaria, no el de adultos.

**Investigación relacionada:** `2026-07-31-mc-44-adaptive-placement-cat.md`,
`2026-07-31-mc-13-its-knowledge-tracing-elo.md`,
`2026-07-31-mc-15-international-grade-ladders.md`.

---

## D-003 — Modelo de tableros públicos · 2026-07-31

**Decisión:** ligas de ~30 pares anónimos (estilo Duolingo) **más** un tablero
global con **alias generados** — sin nombres reales, sin foto, sin ciudad.
Tableros separados por banda de nivel. El salón (modo maestro) es su propio
tablero.

**Investigación relacionada:** `mc-18-leaderboards-competition.md`,
`mc-25-child-privacy-law.md`, `mc-43-avatars-identity-progression.md`,
`mc-10-math-anxiety-mindset-timing.md` (esta última documenta el riesgo real de
los tableros públicos con niños pequeños — leerla antes de fijar el default).

---

## D-004 — El tutor de IA es **Larry** · 2026-07-31

**Decisión:** la IA del producto es **Larry**, el mismo personaje transversal de
Ignia (rinoceronte naranja, coach honesto, "¡Ya vas!"), en su encarnación
**Larry Profe**. No es un chatbot genérico ni un personaje nuevo.

**Arquitectura decidida:** híbrido —
1. Cada reactivo trae **solución y errores comunes pregenerados y revisados**
   (rápido, barato, sin alucinaciones, funciona offline).
2. **API de Claude** en vivo cuando el alumno dice "no entendí" o comete un
   error que no está catalogado.
3. **Ruteo de modelo por complejidad**: Haiku para aritmética básica, Sonnet
   para el rango medio, Opus para lo verdaderamente avanzado (cálculo tensorial,
   integrales dobles). La llave de API la provee el dueño.

**Restricciones heredadas del canon de Larry:** el humor nunca es sobre las
características de las personas, solo sobre sí mismo; "¡Ya vas!" solo al aceptar
una tarea, nunca como saludo; nunca condescendiente. **Regla nueva y dura para
este producto:** Larry nunca avergüenza a un niño por equivocarse.

**Investigación relacionada:** `mc-37-larry-profe-port.md` (documenta la
implementación real de Larry en este repo, con `archivo:línea`),
`mc-11-feedback-formative-assessment.md` (qué feedback funciona y cuál es
contraproducente).

---

## D-005 — Idiomas · 2026-07-31

**Decisión:** Inglés, Español, Francés, Portugués, Alemán desde el diseño, no
como traducción posterior.

**Advertencia levantada por la investigación:** el contenido de los primeros
niveles **no se puede traducir**, se tiene que autorar por idioma — la
estructura de las palabras-número difiere (alemán "einundzwanzig", francés
"quatre-vingt-dix"), y la notación matemática misma cambia por país (coma
decimal, símbolo de división, formato de la división larga). Ver
`mc-34-i18n-math-notation.md`.

---

## D-006 — Tamaño del MVP de contenido · 2026-07-31

**Decisión del dueño:** **~2,500 retos** para arrancar el MVP.

**Pendiente de resolver con la investigación:** qué proporción se genera desde
plantillas parametrizadas, qué proporción se escribe a mano, y qué proporción se
redacta con asistencia de LLM y revisión humana — y cómo se reparten esos 2,500
entre las bandas de nivel. Ver `mc-40-item-bank-content-operations.md` y
`mc-36-problem-design-item-formats.md`.

---

## D-007 — Orden de construcción · 2026-07-31

**Decisión del dueño:** primero la **plataforma**, después los **niveles**. El
primer nivel a construir es el **más básico** (kinder) y de ahí se sube.

---

## D-008 — Método de planeación · 2026-07-31

**Decisión del dueño:** el plan integral se arma con **preguntas interactivas de
opción múltiple en olas de 4**, después de que toda la investigación esté
terminada. Primero las preguntas de plataforma, luego las de niveles y
contenido.

---

## D-009 — Alcance del MVP · 2026-07-31

**Decisión:** **plataforma completa, contenido de un solo grado.** El MVP incluye
todo — cuentas familiares, ubicación adaptativa, ligas, tablero, Larry, modo
maestro, límite de pantalla, PWA offline — pero **solo con contenido de kinder**.
El MVP se considera terminado cuando kinder está completo con todo. La v2 es el
siguiente grado, y así sucesivamente.

**Consecuencia:** el modo maestro entra desde el MVP, lo que sube el
consentimiento parental verificable y la verificación de identidad del maestro a
la ruta crítica.

---

## D-010 — Motor de puntuación · 2026-07-31

**Decisión:** una sola fórmula para las seis bandas —
`score = a · (d − RT) · (2·acc − 1)` (regla High-Speed High-Stakes de Math
Garden, equivalente al modelo IRT 2PL). Jr y Pro no son un caso especial: son la
misma fórmula con `d` más corto y `a` más alto.

| Banda | `d` (seg) | Peso velocidad | Reloj visible | Anti-trampa |
|-------|-----------|----------------|---------------|-------------|
| KINDER 4-7 | — | 0.0 | no | tier 0 |
| PRIMARIA 8-11 | 60 | 0.3 | opcional | tier 1-2 |
| SECUNDARIA 12-17 | 45 | 0.5 | sí | tier 3 |
| ADULTO | 40 | 0.6 | sí | tier 3 |
| JR (olimpiada) | 30 | 0.8 | sí | tier 4 |
| PRO (matemático) | 20 | 1.0 | sí | tier 5 |

**Por qué funciona sin excepciones:** `(2·acc − 1)` vale −1 al fallar, así que
fallar rápido resta más que fallar lento. El castigo a adivinar está en la
fórmula, no en una regla aparte.

**Valor del ítem por dificultad:** `10 × 1.6^(nivel−1)`. Un problema de nivel 8
vale ~268 puntos, comparable a 30 sumas de nivel 1. Ninguna estrategia domina el
tablero. Ver `mc-13` y `mc-18`.

---

## D-011 — Verificación del maestro · 2026-07-31

**Decisión:** **el padre aprueba al maestro, con identidad visible.** El maestro
crea un salón y obtiene un código de 6 caracteres; **el padre** captura el
código, ve nombre completo, escuela declarada y foto del maestro **antes** de
aprobar, y elige qué hijo y qué se comparte. Sin canal privado maestro-niño.
Tope de 35 alumnos por salón y 3 salones por maestro. Bitácora completa y botón
de reporte de un toque.

**Contexto:** ningún producto estudiado resuelve del todo quién verifica que un
adulto es maestro (`mc-28`). Este es el stack mínimo viable, no una garantía.

---

## D-012 — Cómo entra un niño · 2026-07-31

**Decisión:** rejilla de avatares + PIN de imágenes (3 imágenes que el propio
niño eligió). Sin teclado, sin leer, menos de 5 segundos. El PIN de imágenes
separa hermanos; la protección real contra un extraño la da el dispositivo
vinculado al hogar.

---

## D-013 — Consentimiento y datos del menor · 2026-07-31

**Decisión:** **el niño nunca es un usuario, es un perfil dentro de la cuenta del
padre.** No se pide nombre real, ni correo, ni foto, ni fecha exacta de
nacimiento — solo año o rango de edad. Al no recolectar datos personales
directamente del niño no se dispara el requisito de consentimiento verificable
formal (patrón Netflix / Disney+ / Nintendo).

**Nota:** con tablero público y modo maestro esta conclusión **debe revisarse con
abogado antes de lanzar**. La investigación `mc-25` marca varias afirmaciones
legales como `[unverified]` porque ftc.gov e ico.org.uk bloquean fetch
automatizado.

---

## D-014 — Gamificación: la lista negra explícita · 2026-07-31

**Decisión:** todo el motor de enganche con evidencia, ninguna de las mecánicas
con exposición regulatoria.

| Sí | No (por nombre) |
|----|-----------------|
| XP y niveles | corazones / vidas que bloquean |
| Rachas con red de protección | moneda comprable |
| Ligas de ~30 | recompensas aleatorias de pago |
| Misiones diarias | notificaciones con culpa |
| Cosméticos ganados (deterministas) | comparación pública de niños por nombre |
| Mapa de progreso, compañero | |

**Regla de racha:** si el límite de pantalla corta la sesión, **la racha del día
se da por cumplida**. Nunca se vende protección de racha. Castigar a un niño por
respetar un límite sano lo pone en contra de su padre.

---

## D-015 — Larry Profe en el MVP · 2026-07-31

**Decisión:** explicación pregenerada al cerrar el reto (instantánea, gratis,
offline) + API de Claude en vivo solo cuando el niño pide más o comete un error
no catalogado. Límite de gasto por perfil/día vía AI Gateway, caché de
explicaciones por tipo de error.

| Banda | Modelo | Costo aprox. / 1k explicaciones |
|-------|--------|--------------------------------|
| Kinder–Primaria | Haiku 4.5 | ~$1 |
| Secundaria / Adulto / Jr | Sonnet 5 | ~$6 |
| Pro | Opus 5 | ~$19-60 |

En kinder **la voz es la interfaz**: el niño no lee, Larry habla.

---

## D-016 — Límite de pantalla · 2026-07-31

**Decisión:** corte **suave** con aviso a los 5 minutos y pantalla de despedida
de Larry. Nunca corte seco a media respuesta. El padre mueve el límite dentro de
un rango, no libremente.

| Edad | Default | Mín | Máx | Descanso | Corte nocturno |
|------|---------|-----|-----|----------|----------------|
| 4-6 | 20 min | 10 | 45 | c/15 min | 1 h antes de dormir |
| 7-11 | 30 min | 15 | 60 | c/20 min | 1 h antes |
| 12-17 | 45 min | 15 | 90 | c/25 min | 30 min antes |
| adulto | sin límite | — | — | recordatorio | — |

**Honestidad requerida:** solo el tope de 60 min para 2-4 años viene de fuente
primaria (OMS). De los 5 años en adelante **ninguna autoridad publica una cifra**.
El resto de la tabla es criterio nuestro y se documenta como criterio, no como
ciencia. Ver `mc-26`.

---

## D-017 — Escalera de niveles · 2026-07-31

**Decisión:** **12 niveles de dificultad × 5 temas visuales**, que se mueven por
separado. Los niveles no llevan nombre de grado escolar porque las fracciones se
introducen entre los 6 y los 9 años según el país (`mc-15`).

| Tema visual | Edad | Niveles |
|-------------|------|---------|
| KINDER | 4-6 | N1–N3 |
| PRIMARIA | 7-11 | N3–N6 |
| SECUNDARIA | 12-17 | N6–N8 |
| SERIO | adulto | N8–N10 |
| PRO | Jr / profesional | N11–N12 |

Los rangos se traslapan a propósito.

---

## D-018 — Ítem, reto y los cinco modos · 2026-07-31

**Decisión del dueño (corrección importante):** un **reto** no es una pregunta.
Un reto puede ser **un solo ítem difícil** o **una serie de 30 ítems sencillos**.

- **Ítem** — pregunta atómica con su respuesta y su catálogo de errores.
- **Reto** — lo que el niño juega y lo que da puntos; se compone de 1..N ítems.

**Consecuencia de diseño que esto resuelve solo:** el cronómetro no depende de la
edad del niño sino del **tipo de reto**. La serie de fluidez sí se cronometra
(es fluidez de algo ya dominado); el problema profundo no (el reloj estorba al
pensamiento).

| Modo | Composición | Reloj | Nota |
|------|-------------|-------|------|
| PRÁCTICA | 6-10 ítems mezclados del nivel | no | donde se aprende |
| FLUIDEZ | 20-30 ítems fáciles seguidos | **sí** | solo de temas ya dominados |
| PROBLEMA | 1 ítem que cuesta pensar | no | vale muchos puntos, permite borrar y volver |
| DUELO | mismo set contra tu liga | **sí** | opt-in, solo 8+ años |
| HISTORIA | cadena de retos en la Sabana de Larry | según el reto | el gancho principal en kinder |

**Tamaño del MVP:** **2,500 retos jugables**, compuestos a partir de **~400
ítems de kinder** en 14 habilidades. La unidad de diseño es la **serie**, no la
pregunta suelta — es enseñanza con variación (`mc-02`), y es curaduría, no
generación al azar.

---

## D-019 — Modo historia: la Sabana de Larry · 2026-07-31

**Decisión:** el mundo del juego es **la Sabana**, el origen que Larry nunca
explica en su canon. Cada habilidad de kinder es un lugar del mapa con su
historia corta; terminarla desbloquea el siguiente lugar. 14 lugares, ~30 piezas
de arte. **El arte se reusa entre los 5 idiomas: la Sabana no habla.**

Arte con **Recraft** (continuidad con el avatar existente de Larry) y **Gemini**
para las piezas complejas de interfaz.

---

## D-020 — Anti-trampa en kinder · 2026-07-31

**Decisión:** **nada punitivo.** Un niño de 5 años no defrauda a nadie, y el
padre ayudando es juego acompañado, que a esa edad la evidencia respalda. Si el
patrón de respuestas es imposible para la edad, el sistema simplemente **no sube
el nivel** y deja una nota suave en el panel del padre. Sin bloqueos, sin
advertencias al niño.

**Regla permanente, en todas las bandas:** nunca cámara, nunca micrófono, nunca
biometría, nunca navegador bloqueado. A ningún niño, en ningún nivel.

---

## D-021 — Monetización · 2026-07-31

**Decisión:** **la práctica es gratis para siempre.** Nunca se cobra por dejar
que un niño haga matemáticas — que es exactamente lo que se le critica al sistema
de corazones. Se cobra el acompañamiento.

- **Gratis:** práctica ilimitada, 1 perfil de hijo, ligas y tablero, rachas,
  historia, Larry con explicaciones pregeneradas.
- **Plan Familia (~$8-10 USD/mes):** hasta 6 perfiles, panel del padre con
  diagnóstico, Larry en vivo ilimitado, modo sin conexión, reportes.

Referencias reales verificadas: IXL $9.95/mes +$4 por hijo extra; mediana anual
en educación $44.99; una prueba de 17-32 días convierte 1.7× mejor que una de 4
(`mc-41`).

---

## D-022 — Idiomas del lanzamiento · 2026-07-31

**Decisión del dueño:** **los 5 idiomas desde el lanzamiento de kinder.**

**Lo que esto cuesta, dicho con claridad:** el contenido de kinder **no se puede
traducir**. En alemán el 21 se dice "einundzwanzig" (uno-y-veinte) y en francés
el 90 es "quatre-vingt-dix" (cuatro-veintes-diez); esa estructura cambia cómo un
niño aprende a contar y en qué orden. Se necesitan **cinco autores nativos con
criterio didáctico de kinder**, no cinco traductores. Además: México es el único
país hispano con **punto** decimal, y Portugal usa escala larga mientras Brasil
usa escala corta — `pt-PT` y `pt-BR` son dos locales, no uno. Ver `mc-34`.

---

## Tensiones abiertas que el dueño debe resolver

Estas salieron de la investigación y **no** están decididas. Se listan aquí para
que ninguna se pierda entre 40 documentos.

| # | Tensión | Dónde está documentada |
|---|---------|------------------------|
| T-1 | "Gamificación lo más adictiva posible" vs. la evidencia de daño y la exposición regulatoria con menores en UE/RU/EUA | `mc-17-ethical-gamification-dark-patterns.md`, `mc-10-math-anxiety-mindset-timing.md` |
| T-2 | Puntos por velocidad vs. la evidencia de que el cronómetro es el origen medible de la ansiedad matemática en niños chicos | `mc-10`, `mc-04-cognitive-load-worked-examples.md`, `mc-06-early-numeracy-kinder.md` |
| T-3 | Telemetría conductual rica (escribe y borra) vs. "ultra-privacidad para menores" y las reglas de perfilado de menores en la UE | `mc-30-behavioral-telemetry-process-data.md`, `mc-25-child-privacy-law.md` |
| T-4 | Tablero público global vs. minimización de datos de menores | `mc-25`, `mc-18` |
| T-5 | Modo maestro: quién verifica que un adulto que abre un "salón" es un maestro real | `mc-28-teacher-classroom-mode.md` |
| T-6 | Nivel PhD: qué se puede calificar automáticamente de verdad y qué no | `mc-12-advanced-proof-olympiad-phd.md` |

---

## D-023 — Repo propio e independiente · 2026-07-31

**Decisión:** Math Challenge sale de `ignia-object-storage` y vive en su propio
repositorio, `kilowatto/math-challenge`, privado. Revierte a D-001.

**Por qué cambió, el mismo día:** al intentar commitear la investigación se hizo
visible el costo de vivir en un árbol de trabajo compartido — el árbol estaba en
una rama de otro proyecto con trabajo en curso sin commitear, había 24 worktrees
abandonados, y cualquier commit habría caído en la rama equivocada.

Math Challenge no comparte código con IOS: otro dominio, otros usuarios, otro
ciclo de vida, otro público. La única razón real para tenerlo dentro era reusar
los gates y el código de Larry, y ninguna de las dos compensa heredar el ruido
de un repositorio que no es suyo.

**Lo que esto cuesta, dicho de frente:**

1. **Larry hay que copiarlo o reimplementarlo, no importarlo.** La investigación
   `mc-37` cita rutas reales del repo de IOS con `archivo:línea`
   (`src/larry/prompts.ts:24-57`, `migrations/0011_larry_audit.sql`). Esas
   referencias siguen siendo documentación válida, pero el código no queda a la
   mano desde aquí.
2. **Los gates, el design system y el pipeline de iconos se rehacen.** No se
   heredan.
3. **El PR #147 en `kilowatto/iob` se cerró sin merge** y su rama remota se
   borró. El repo de IOS queda sin rastro de un producto que no le pertenece.

**Lo que se gana:** cero superposición de locks, cero worktrees ajenos, cero
riesgo de commitear en la rama equivocada, y un historial que cuenta la historia
de un solo producto.
