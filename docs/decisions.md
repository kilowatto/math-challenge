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

> **Enmendado por D-035 (2026-07-31).** El punto 2 ya no es "API de Claude":
> **todo corre sobre Workers AI**, que es lo que Larry ya corre en IOS. Los
> puntos 1 y 3 no cambian — el ruteo por complejidad sigue, con otros modelos.
> El punto 1 (explicación pregenerada y revisada) gana peso: es lo que no
> depende de ningún modelo, y es la salida si la banda Pro no pasa evaluación.

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

**Resuelto después:** el reparto entre bandas lo cerró **D-009** — los 2,500 son
**todos de kinder**, no repartidos por la escalera. La mezcla de origen la cerró
`mc-40`: ~40% plantillas paramétricas, ~29% redactado con IA y revisado por
humano, ~31% escrito a mano; en kinder la proporción de plantilla sube a ~70%
porque contar patos del 1 al 20 es una plantilla, no veinte ítems. Ver
`mc-40-item-bank-content-operations.md` y `mc-36-problem-design-item-formats.md`.

**Ojo con la unidad:** los 2,500 de esta decisión son **retos jugables**,
compuestos a partir de ~400 **ítems** de kinder (D-018). El plan de 2,500
*ítems* de `mc-40`, con sus ~1,053 días-persona, cubre todas las bandas de N1 a
N12 — es otro número, para otro alcance.

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

> **ENMENDADA — ver [D-034](#d-034--franja-mínima-de-contenido-adulto-en-el-mvp--2026-07-31).**
> El MVP lleva kinder completo **más una franja mínima de contenido adulto
> (N8-N10)**, para que los clubs de adultos tengan de qué competir. El criterio
> de "MVP terminado" sigue anclado en que kinder esté completo.

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

> **REVISADA el 2026-07-31 — ver [D-024](#d-024--regla-de-puntuación-de-kinder--2026-07-31).**
> Kinder queda fuera de esta fórmula, y las edades de esta tabla se corrigieron
> para coincidir con la escalera de temas de D-017.

**Decisión:** una sola fórmula de primaria en adelante —
`score = a · (d − RT) · (2·acc − 1)` (regla High-Speed High-Stakes de Math
Garden, equivalente al modelo IRT 2PL). Jr y Pro no son un caso especial: son la
misma fórmula con `d` más corto y `a` más alto.

| Banda | `d` (seg) | Peso velocidad | Reloj visible | Anti-trampa |
|-------|-----------|----------------|---------------|-------------|
| KINDER 4-6 | — | — (regla aparte, D-024) | no | tier 0 |
| PRIMARIA 7-11 | 60 | 0.3 | opcional | tier 1-2 |
| SECUNDARIA 12-17 | 45 | 0.5 | sí | tier 3 |
| SERIO (adulto) | 40 | 0.6 | sí | tier 3 |
| JR (olimpiada) | 30 | 0.8 | sí | tier 4 |
| PRO (matemático) | 20 | 1.0 | sí | tier 5 |

**Corrección de bandas:** la versión original de esta tabla decía "KINDER 4-7" y
"PRIMARIA 8-11", en contradicción con D-017 (KINDER 4-6, PRIMARIA 7-11) y con
D-016 (límite de pantalla, 4-6 / 7-11). Un niño de 7 años caía en dos bandas
distintas según qué tabla se leyera. Manda D-017: **7 años es PRIMARIA en todo el
producto**. También se renombró ADULTO a SERIO para coincidir con el nombre del
tema visual en D-017.

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
| Kinder–Primaria | ~~Haiku 4.5~~ → `gpt-oss-120b` (D-035) | ~~~$1~~ → ~$0.22 |
| Secundaria / Adulto / Jr | ~~Sonnet 5~~ → `kimi-k2.6` (D-035) | ~~~$6~~ → ~$1.50 |
| Pro | ~~Opus 5~~ → `kimi-k2.6` (D-035) | ~~~$19-60~~ → ~$1.50 |

> **Enmendado por D-035.** Además del costo, dos razones: corre dentro del
> Worker sin viaje externo, y `mc-37` había detectado que Haiku 4.5 exige un
> prefijo de 4,096 tokens para cachear — el prompt de aritmética básica no
> llega, así que la banda barata nunca cacheaba.

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
niño aprende a contar y en qué orden. Se necesitan **autores nativos con criterio
didáctico de kinder**, no traductores.

**Son siete autores, no cinco** (corregido 2026-07-31). Cinco idiomas, siete
locales: `en`, `es-MX`, `es-ES`, `fr-FR`, `pt-BR`, `pt-PT`, `de-DE`. Los pares
que comparten idioma no comparten contenido: México es el único país hispano con
**punto** decimal, Portugal usa escala larga y Brasil corta, y la división larga
se dibuja distinto en México (anglosajona) que en Brasil y España (europea).
`pt-PT` y `pt-BR` son dos locales, no uno — y `es-MX` y `es-ES` también. Ver
`mc-34`.

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

---

## D-024 — Regla de puntuación de kinder · 2026-07-31

**Decisión:** kinder **no** usa la regla High-Speed High-Stakes. Usa una regla
propia, de solo precisión:

```
score = valor_del_ítem · acc
```

Sin tiempo permitido, sin resta al fallar, sin reloj visible ni invisible.

**Por qué, y no es pedagogía sino aritmética:** D-010 declaraba "una sola fórmula
para las seis bandas" con peso de velocidad `0.0` en kinder. Pero
`score = a · (d − RT) · (2·acc − 1)` con `a = 0` da **cero para toda respuesta**,
correcta o incorrecta. No es que kinder puntúe sin cronometrar: es que kinder no
puntúa. Y kinder es la única banda con contenido en el MVP (D-009), así que el
hueco no era teórico — bloqueaba el motor de reto (F3 en la numeración vigente
del plan maestro §13.2).

**Lo que esto cuesta, dicho de frente:** se pierde la elegancia de "una fórmula
para todas las bandas", que era un argumento de venta del diseño. A cambio se
gana que la banda que de verdad vamos a construir tenga una regla que funciona.
La afirmación correcta ahora es "una fórmula de primaria a Pro, y una regla
aparte para kinder".

**Consecuencia para el tablero:** un niño de kinder acumula puntos por dificultad
del ítem, no por velocidad — que es exactamente lo que `mc-10` y `mc-06`
recomiendan para esa edad, y lo que la línea roja del cronómetro ya exigía.

**Investigación relacionada:** `mc-13-its-knowledge-tracing-elo.md` (pregunta
abierta #2 planteaba este caso exacto: si HSHS aplica siquiera a 4-6 años),
`mc-10-math-anxiety-mindset-timing.md`, `mc-06-early-numeracy-kinder.md`.

---

## D-025 — El tablero global ordena por puntos, no por θ · 2026-07-31

**Decisión:** el tablero global se ordena por puntos acumulados, con el valor del
ítem escalado por dificultad (`10 × 1.6^(nivel−1)`, D-010). **No** se ordena por
habilidad estimada.

**Esta decisión contradice la investigación, y se toma con eso a la vista.**
`mc-18` recomienda explícitamente ordenar por θ (la habilidad latente de TRI) y
advierte que sumar puntos premia a quien resuelve muchos ejercicios fáciles
rápido; `mc-44` refuerza que θ es lo que permite comparar a un niño de 6 años
sumando con un adulto en topología, porque ambos se estiman contra ítems
calibrados por separado.

**Por qué elegimos puntos de todas formas:**

1. **θ no existe en v1.** Requiere un banco calibrado con 200-400 respuestas por
   ítem (`mc-44`). El día del lanzamiento tenemos cero. Ordenar por θ significaría
   ordenar por una estimación sin datos, o retrasar el tablero (F7) detrás del
   adaptativo (F4), en la numeración vigente del plan maestro §13.2.
2. **Un niño de 8 años no puede leer un rating.** "Tienes 1,847 puntos" se
   entiende; "tu θ es 0.42" no, y traducirlo a percentil reintroduce la
   comparación explícita que `mc-18` justamente señala como dañina abajo del
   tablero.
3. **El escalado `1.6^(nivel−1)` mitiga el problema concreto que `mc-18`
   describe.** Un problema de nivel 8 vale ~268 puntos y 30 sumas de nivel 1
   valen ~300: quedan comparables a propósito, así que la estrategia de "mil
   sumas triviales" no domina.

**Lo que NO resuelve, dicho de frente:** el punto 3 mitiga, no elimina. Con
tiempo infinito, el volumen sigue ganándole a la dificultad. `mc-18` tiene razón
en el fondo; estamos comprando legibilidad y tiempo de entrega a cambio de
justicia en la cola larga del tablero.

**Condición de revisión:** cuando el banco tenga ≥200 respuestas por ítem en las
bandas activas, se reevalúa migrar el tablero global a θ, con los puntos
quedándose como la métrica visible para las bandas de niño. Hasta entonces, esta
decisión se sostiene.

**Investigación que la respalda:** `mc-13` (Elo/Math Garden, actualización O(1)
sin calibración previa).
**Investigación que la contradice:** `mc-18-leaderboards-competition.md` §6,
`mc-44-adaptive-placement-cat.md`.

---

## D-026 — Registro de 2 campos y onboarding contextual · 2026-07-31

**Decisión:** las tres puertas de entrada — adulto, papá, maestro — se registran
con **correo y contraseña. Nada más.** Todo lo demás (perfil del hijo, banda de
edad, límite de pantalla, salón, verificación del maestro) es configuración
posterior, en pasos separados, saltables y con defaults sanos.

**Por qué:** HubSpot midió formularios de 40,000 clientes y bajar de 4 campos a 3
subió la conversión casi 50%; los benchmarks 2026 dan 23.1% con 3 campos y 11.4%
con 7, con el despeñadero justo entre 5 y 7 (`mc-45`). Registrarse y configurarse
son dos cosas, y juntarlas nos pondría en el peor tramo de esa curva.

**Sin carrusel de bienvenida, en ninguna de las cinco entradas.** Nielsen Norman
Group desaconseja el onboarding en general — *"eviten crear onboarding siempre
que sea posible y gasten esos recursos en hacer la interfaz más usable"* — y
desaconseja el carrusel de tarjetas **por nombre**: hace ver la interfaz más
compleja de lo que es, y su investigación específica encontró que **no mejora el
desempeño en la tarea** (`mc-45`).

**En su lugar, cinco marcas contextuales**, cada una disparada cuando su función
se vuelve accionable, no al abrir la app. Son las cinco cosas del producto que
un usuario no puede inferir de la interfaz:

1. La edad y la dificultad son ejes separados (D-002, D-017).
2. El niño es un perfil, no un usuario (D-013).
3. La ubicación no es un examen (D-002, `mc-44`).
4. Los clubs y salones no tienen chat, y nunca lo van a tener (D-011, D-027).
5. Las prendas no tienen perdedor (D-028).

Cada marca se ve inequívocamente como anotación y no como control (`mc-45`), y se
descarta permanentemente — reaparecer sería el patrón de *nagging* que la FTC
nombra explícitamente (`mc-17`).

**Investigación relacionada:** `mc-45-onboarding-activation.md`.

---

## D-027 — Clubs: dos sistemas separados, y ninguno con chat · 2026-07-31

**Decisión:** existen dos contenedores sociales, **separados en la base de
datos**, no una tabla con un campo `tipo`:

- **`grupo_infantil`** — cubre el salón del maestro (D-011) y el club de papás,
  con reglas de seguridad **idénticas**.
- **`club_adulto`** — con retos y prendas (D-028), solo para adultos.

**Por qué separados:** no es modelado, es modo de falla. Con una sola tabla, el
día que alguien agregue texto libre, mensajes o imágenes a "los clubs", eso
aterriza por defecto también sobre los niños, y la protección depende de que
quien escriba ese código recuerde la regla. Con dos estructuras, agregar texto
libre a los adultos **no puede** tocar a los niños aunque nadie recuerde nada.

**Un papá abre club con la misma barra que un maestro** (D-011): correo y
teléfono verificados, nombre real, y una insignia visible de "sin verificar"
cuando no hay más. El papá de **cada** niño aprueba la entrada, viendo antes esa
identidad.

**Reglas de un `grupo_infantil`, sea de maestro o de papá:**

- **Sin chat y sin mensajes directos, en ninguna dirección, nunca.**
- El dueño ve **solo alias, puntos y racha**. Ni nombre real, ni edad exacta, ni
  otros grupos del niño.
- Se invita compartiendo código **con los papás**, nunca buscando niños.
- Tope de tamaño menor que un salón, y límite de clubs por cuenta.
- Botón de reporte permanente y bitácora completa, visible para el papá.

**El estándar que estamos aproximando, y el que no podemos cumplir:** la
salvaguarda en deportes juveniles exige verificación de antecedentes para
*"cualquier voluntario con oportunidad de contacto no supervisado o uno a uno con
menores"* (`mc-46`). No podemos correr esa verificación. Lo que sí podemos es
eliminar la categoría entera: **sin contacto no supervisado, no hay canal que
proteger.** Un club de papás es seguro precisamente porque es anémico — es un
tablero compartido, no un espacio social. Cada vez que alguien pida agregarle
chat, la respuesta ya está escrita aquí.

Esto **no cierra T-5**. Lo acota: reduce la superficie, no verifica al adulto.

**Investigación relacionada:** `mc-46-clubs-social-challenges.md`,
`mc-28-teacher-classroom-mode.md`.

---

## D-028 — Prendas sin perdedor · 2026-07-31

**Decisión del dueño:** los clubs de adultos tienen retos con prendas, y **la
prenda nunca cae sobre una persona por haber quedado atrás.** Nunca hay
humillación, en ninguna forma.

Tres formas, las tres entran:

- **A · Prenda colectiva.** El grupo se compromete junto contra una meta
  compartida; se gana o no en grupo, sin tabla de posiciones.
- **B · El ganador elige.** El primer lugar no recibe tributo: **decide** algo
  para el grupo — el próximo reto, la meta, el lugar. El premio es agencia.
- **C · Compromiso propio.** Cada quien se apuesta contra su propia meta, en
  público.

**Lo que hace que esto funcione no es una regla, es el esquema.** Ninguna de las
tres formas tiene casilla de perdedor: en A el texto habla del grupo, en B lo
escribe quien ganó sobre lo que sigue, en C solo se puede escribir sobre uno
mismo. **No existe ningún campo que pregunte qué le pasa al último**, en ninguna
pantalla ni en ninguna API. La humillación no está prohibida: no tiene dónde
aterrizar.

**Prohibido por diseño:** castigo al último, tributo entre miembros, y que la
plataforma retenga, transfiera, arbitre o haga cumplir cualquier cosa de valor.

**Posición legal, y de qué depende.** El juego ilegal exige tres elementos
simultáneos — premio, azar y consideración — y basta eliminar uno (`mc-46`). Aquí
el azar está ausente porque las matemáticas son destreza medible, y la
consideración está ausente mientras la plataforma no cobre ni toque valor. Faltan
dos de tres. **Esa posición depende enteramente de que la plataforma nunca toque
valor**: el día que retenga $20 de cada participante, aparece la consideración y
el análisis se invierte. Es investigación, no asesoría legal; se revisa con
abogado antes de habilitar prendas en cualquier mercado.

**Ningún menor entra jamás a un reto con prenda.** Los grupos infantiles tienen
metas y celebraciones. Eso mantiene todo el análisis de juego lejos de los niños.

**Precedente:** el modo *Group Goal* de Strava hace exactamente la forma A, y su
documentación dice que **no tiene tabla de posiciones a propósito**, "así que
terminas comparándote menos con los demás" (`mc-46`).

**Investigación relacionada:** `mc-46-clubs-social-challenges.md`,
`mc-18-leaderboards-competition.md`, `mc-19-habit-loops-push-notifications.md`.

---

## D-029 — Larry modera las prendas · 2026-07-31

**Decisión del dueño:** los adultos escriben el texto de sus prendas libremente,
y **Larry lo revisa antes de que la prenda exista**, con criterio de juego entre
adultos: la broma pasa; el sexo, la violencia y lo denigrante no.

**El criterio, en orden de precedencia:**

1. **¿Señala a una persona?** Se rechaza, aunque venga en broma. Es la regla que
   no admite matiz, porque sostiene D-028.
2. **¿Hay sexo, violencia o denigración?** Se rechaza. Incluye lo que degrada por
   apariencia, peso, origen o capacidad — el canon ya prohíbe que el humor de
   Larry vaya sobre características de las personas, y aquí se extiende de lo que
   Larry *dice* a lo que Larry *deja pasar*.
3. **¿Es un juego entre adultos?** Si pasó 1 y 2, **pasa**. Larry no es censor de
   buen gusto: "el que gana escoge el bar" no es asunto suyo.

**Esto no rompe "Larry nunca calcula"** (D-004, D-015). Esa regla existe porque un
tutor que recalcula matemáticas enseña error. Juzgar texto es otra tarea, y es de
las que los modelos hacen bien. Lo que sí se hereda es que **es otra llamada**:
prompt propio, bitácora propia, ruteo propio, sin relación con el endpoint del
tutor.

**A prueba de fallos:** si Larry no puede revisar, **la prenda no se publica**.
Nunca hay texto sin revisar en producción. El modo de falla barato es un usuario
molesto; el caro es una humillación publicada que el producto prometió impedir.

**Tono:** Larry rechaza breve y en personaje, **sin sermón**. Un rechazo
moralizante convierte al adulto en adversario del producto (`mc-11`).

**Apelación:** Larry se va a equivocar y va a rebotar bromas legítimas. Toda
prenda rechazada se manda a revisión humana con un toque. Sin eso, se siente como
censura.

**Ruteo:** ~~Haiku 4.5~~ **`gpt-oss-120b`** para el caso claro, escalada a
**`kimi-k2.6`** en baja confianza (D-035) — el matiz entre broma y denigración es donde un modelo
chico falla en ambas direcciones. Volumen trivial: una llamada por prenda creada,
no por intento. **La escalada se conserva a propósito:** con volumen trivial el
ahorro de quitarla sería casi nulo, y el modo de falla caro es una humillación
publicada contra la línea roja #7.

**Investigación relacionada:** `mc-46-clubs-social-challenges.md` §5,
`mc-37-larry-profe-port.md`, `mc-11-feedback-formative-assessment.md`.

---

## D-030 — Protocolos: RPC nativo y HTTP/3, nada de gRPC · 2026-07-31

**Decisión:** el transporte interno es el **RPC nativo de JavaScript de Workers
sobre Service Bindings**, y hacia el cliente **HTTP/3 sobre QUIC con 0-RTT**.
**No se usa gRPC ni gRPC-Web.**

**El dueño pidió gRPC explícitamente; la investigación lo descartó por tres
hechos independientes, cada uno suficiente** (`mc-47` §1):

1. **Workers no puede hacer llamadas gRPC salientes** — el runtime no soporta
   streaming bidireccional HTTP/2 (issue abierto en `cloudflare/workerd`).
2. **El navegador no habla gRPC.** gRPC-Web implementa otro protocolo, cae a
   HTTP/1.1 —"lo cual cancela algunas de las ventajas de usar gRPC"— y no
   soporta streaming de cliente ni bidireccional.
3. **Los trailers de HTTP**, que gRPC necesita para el estado, tienen soporte
   limitado en el proxy de borde de Cloudflare, documentado por Cloudflare mismo.

**Y lo que queda es mejor, no un consuelo.** El RPC de Workers **no tiene
sobrecarga ni latencia añadida**: el Worker llamado "normalmente ni siquiera
cruza una red, y suele correr en el mismo hilo que quien lo llama". Un RPC que no
cruza la red no puede ser superado por uno que sí, por eficiente que sea su
serialización.

**Consecuencia para el discurso público:** adoptar gRPC aquí sería adoptar la
generación anterior con más trabajo. Lo que está a la vanguardia **en esta
plataforma** es RPC nativo + HTTP/3, y eso es lo que se presume, con datos.

**Presupuesto de rendimiento, que es la parte que sí cuesta trabajo:**

- **INP ≤ 150 ms**, no 200. El 43% de la web falla el umbral flojo, y este es un
  juego de alta frecuencia de interacción — el perfil exacto donde INP se rompe.
- **LCP ≤ 2.5 s, CLS ≤ 0.1.**
- **Medición con datos de campo desde el día uno**, no con Lighthouse: "un 100
  perfecto en laboratorio no significa nada si el usuario real en 3G sufre".
- **AVIF con respaldo WebP** (25-50% menos peso) y `fetchpriority="high"` en la
  imagen de LCP.

**Investigación relacionada:** `mc-47-stack-protocols-performance.md`,
`mc-32-cloudflare-architecture.md`, `mc-33-pwa-first-reality.md`.

---

## D-031 — Interfaz adaptativa por plataforma · 2026-07-31

**Decisión del dueño:** la interfaz **cambia de personalidad según la
plataforma**: Material 3 con color dinámico en Android, Human Interface
Guidelines en iOS y macOS, controles del sistema en Windows — incluyendo
tipografía del sistema, barras de navegación y pestañas nativas, modales propios
y los gestos que cada plataforma espera.

**Lo que esto cuesta, dicho de frente:** aproximadamente **el doble** en
componentes, diseño y pruebas frente a una interfaz única. No es un costo de
investigación sino de ingeniería sostenida, y se paga en cada función nueva, no
una sola vez.

**Lo que compra:** que no se sienta web, que es donde más se nota en iOS y donde
`mc-22` documenta que los adolescentes abandonan sin diagnosticar el problema —
"no se culpan a sí mismos, te culpan a ti".

Las restricciones duras por plataforma no cambian y siguen en `mc-33`: en iOS la
instalación es manual y el push la exige; en Android no hay reja de instalación;
macOS Safari 17+ tiene "Añadir al Dock"; Windows tiene la integración de
escritorio más completa.

**Investigación relacionada:** `mc-47` §6, `mc-33`, `mc-20`, `mc-21`, `mc-22`,
`mc-23`.

---

## D-032 — La flota de 35 auditores · 2026-07-31

**Decisión del dueño:** el despliegue lleva auditores adversariales, sin miedo a
que sean muchos. Son **38**, en dos clases:

**Deterministas (16), en cada commit, vía gancho `pre-commit`:** presupuesto de bundle · Core Web Vitals
con los umbrales de D-030 · axe-core · contraste · blancos táctiles por banda
(24/44/88 px) · completitud de los **siete locales** · validación de JSON-LD ·
reciprocidad de `hreflang` · escaneo de secretos · prefijo `math-challenge-` ·
seguridad de migraciones · presupuesto de precaché offline · **ningún campo de
texto libre en tablas de niño** · **ninguna tabla por intento en D1** · **paleta
Ignia, formatos de imagen y llaves de Recraft/Google** · **instalabilidad de la
PWA**.

> **Cómo se ejecutan, corregido en F0.** No hay CI. Los deterministas corren en
> un gancho `pre-commit` (`.githooks/pre-commit`), que se activa una vez por
> clon con `git config core.hooksPath .githooks`. Saltarlo exige `--no-verify`
> **y** escribir la razón en el cuerpo del commit. La verificación de producción
> vive aparte, en `audits/live.mjs`, y se corre a mano tras desplegar — mezclarla
> con la flota haría que un commit fallara por una caída del sitio, que no es
> culpa del commit.

> **Eran 12 al decidirse; son 15 al implementarse (F0).** Los tres que se
> agregaron no son adorno: `child-free-text` hace cumplir la línea roja #3 en el
> esquema —donde Roblox demuestra que la moderación no alcanza (`mc-46` §4)—,
> `no-attempts-in-d1` vigila el único límite de la arquitectura que se alcanza
> por error de diseño y no por crecimiento (`mc-32` riesgo #1), y `brand-image`
> nació al descubrir que el naranja de Ignia no pasa el contraste de texto
> normal (`docs/guia-de-estilo.md`). El total sube de 35 a 38. Cuando el código
> encuentra un auditor que faltaba, manda el código.

**Adversariales con LLM (23), en cada PR, instruidos para encontrar la violación
y no para aprobar:** líneas rojas · privacidad COPPA/GDPR-K · anti-humillación ·
anti-trampa · patrones oscuros · pedagogía · rigor matemático · rigor científico
· canon de Larry · rachas y tiempo de pantalla · kinder · PWA iOS · PWA Android ·
PWA-first/offline · rendimiento en red lenta · UX por banda de edad · **y uno por
locale**: `en`, `es-MX`, `es-ES`, `fr-FR`, `pt-BR`, `pt-PT`, `de-DE`.

**Las dos reglas sin las cuales la flota estorba en vez de servir:**

1. **Cada auditor cita la decisión o el documento que hace cumplir.** Un auditor
   que no puede señalar una decisión de `decisions.md` o un hallazgo de
   `research/` está opinando, y su veredicto no bloquea.
2. **Anular a un auditor exige escribir por qué**, y esa razón queda en el
   historial.

**Qué bloquea:** solo los deterministas bloquean por defecto. Los adversariales
bloquean únicamente cuando citan una línea roja o una decisión explícita; el
resto reporta sin detener el PR.

**Riesgo conocido:** 23 llamadas de LLM por PR tienen costo y tasa de falsos
positivos. Si la flota se vuelve ruido, la gente aprende a rodearla en silencio,
que es peor que no tenerla.

> **Cómo quedaron las dos reglas al implementarse en F1.** Ambas dejaron de ser
> prosa y pasaron a ser código que se puede ver fallar:
>
> - **Regla 1** vive en `audits/adversarial/citas.mjs`. Lee los encabezados
>   reales de este archivo y los archivos reales de `docs/research/`, y descarta
>   cualquier hallazgo que cite un id inexistente. Se le agregó una segunda
>   mitad que la decisión no anticipaba: **un auditor solo puede invocar lo que
>   su carta le autoriza**. Sin ese corte, los 23 podían citar cualquier
>   decisión y la división de trabajo entre ellos era decorativa. Las cartas se
>   validan al arrancar y en el gancho `pre-commit` — fue así como se detectó
>   que la carta de pedagogía citaba `D-036`, que no existe.
> - **Regla 2** vive en `audits/adversarial/ANULACIONES.md`, commiteado en el
>   mismo PR que la necesita: así queda fechada, firmada y junto al cambio que
>   la provocó. La huella de una anulación es `auditor · archivo · cita`, sin el
>   texto del hallazgo, porque el modelo lo redacta distinto cada corrida y una
>   huella variable dejaría de reconocer su propia anulación al día siguiente.
>   La razón mínima son 20 caracteres: si valiera una vacía, la regla se
>   cumpliría escribiendo un encabezado.
>
> **Dónde corren, corregido igual que los deterministas en F0.** No en el
> gancho. `node audits/adversarial.mjs` se corre a mano antes de abrir el PR;
> los deterministas cuestan milisegundos y los adversariales cuestan dinero, y
> bloquear cada commit con 23 llamadas de LLM es exactamente el ruido que esta
> misma decisión nombra como riesgo. El gancho sí verifica el **cableado** —las
> 23 cartas y la clasificación—, que cuesta milisegundos.
>
> **Proveedor, cambiado por D-035.** Los 23 corren sobre Workers AI
> (`kimi-k2.6` → `gpt-oss-120b`), no sobre Claude. Baja el costo ~5×, que es
> justo el riesgo que esta decisión nombra. A cambio se pierde la imposición de
> esquema en la capa de la herramienta —el JSON de Workers AI es best-effort— y
> se repone con validación propia: un veredicto que no valida cuenta como
> **auditor fallido, nunca como auditor limpio**.
>
> **Tres cosas que se agregaron y no estaban en la decisión:** cada carta declara
> también **de qué es ciega**, porque sin eso los tres auditores de PWA
> reportaban lo mismo; solo despiertan los auditores cuyo alcance toca el diff;
> y `--seco` arma las 23 llamadas sin hacer ninguna y estima el costo, para que
> el gasto se decida antes y no en la factura.

**Investigación relacionada:** `mc-47` §7.

---

## D-033 — El sitio abierto: la investigación es la estrategia · 2026-07-31

**Decisión del dueño:** se publica un sitio abierto que explica qué es Math
Challenge, los niveles y el propósito, con **las 45 investigaciones completas —
incluidas las que contradicen al producto**.

**Por qué esto no es transparencia sino estrategia:** tras la actualización de
marzo de 2026, la investigación original se volvió de los activos de contenido de
mayor valor que una organización puede producir, y las páginas con señales
fuertes de E-E-A-T tienen **2.3× más probabilidad de ser citadas en AI
Overviews** (`mc-48`). Hay 152,000 palabras con fuentes numeradas, limitaciones
declaradas y afirmaciones marcadas `[unverified]`. Publicar los pasajes donde la
evidencia contradice al propio producto es la definición operativa de
Trustworthiness, y prácticamente ningún competidor lo hace (`mc-14`).

**Atribución, en dos partes verificables:** **Math Challenge es un proyecto de
Ignia, y corre sobre Cloudflare.** Decir que el stack lo provee Ignia sería
desmentible con una consulta de DNS, y el lector de la página de arquitectura es
exactamente quien la haría. Las dos afirmaciones separadas resisten escrutinio, y
la página de arquitectura se vuelve contenido técnico citable.

**Requisitos técnicos del sitio:** siete locales con `hreflang` recíproco más
`x-default`; JSON-LD con `inLanguage` por versión y estructura idéntica entre
idiomas; el esquema **debe coincidir con lo visible en la página** o Google puede
ignorarlo por completo; `es-MX` y `es-ES` son dos páginas distintas donde haya
notación matemática, no una con dos etiquetas; y WCAG 2.2 AA como requisito de
publicación, que además de obligación legal en la UE es señal de Trustworthiness.

**La voz del sitio sale de [`por-que-existe.md`](por-que-existe.md)**, levantada
en entrevista con el dueño. Es la única fuente de *Experience* del sitio: la
investigación no la puede producir.

**Lo que esta decisión prohíbe:** reclamar resultados de aprendizaje antes de
tener el estudio propio (plan maestro §14), y presumir infraestructura que no es.
En un sitio que presume rigor, una sola afirmación sin sustento cuesta más que en
uno que no lo presume.

**Investigación relacionada:** `mc-48-public-site-seo.md`, `mc-38`, `mc-34`,
`mc-14`.

---

## D-034 — Franja mínima de contenido adulto en el MVP · 2026-07-31

> **Enmienda [D-009](#d-009--alcance-del-mvp--2026-07-31).** Cierra la tensión T-7.

**Decisión del dueño:** el MVP deja de ser estrictamente "contenido de un solo
grado". Lleva **kinder completo más una franja mínima de contenido adulto
(N8-N10)** — lo justo para que un club de adultos tenga de qué competir.

**Por qué se rompe D-009 a propósito.** Los clubs de adultos (D-028) y su caso
de uso están descritos en [`por-que-existe.md`](por-que-existe.md): un adulto a
veinticinco años de haber estudiado matemáticas que quiere retar su propia mente.
**Esa persona empezó el proyecto.** Con D-009 intacta, el producto lanzaría sin
contenido para su propio dueño, y F10 quedaría construida sobre nada.

**Lo que hace esto asequible, y no es obvio.** El costo de los siete locales que
`mc-34` documenta es un problema **de kinder**, no de adultos: lo que no se puede
traducir son las palabras-número ("einundzwanzig", "quatre-vingt-dix") y las
secuencias de conteo, porque cambian el orden en que un niño aprende. En N8-N10
eso ya no aplica. Lo que sí cambia es la **notación** — punto contra coma
decimal, símbolo de división, formato de intervalo — y eso es exactamente lo que
el almacenamiento del ítem como estructura y no como texto (§9, D-005) resuelve
en el momento de renderizar.

Es decir: **la franja adulta se autora una vez y se renderiza siete veces.** No
son siete autorías. Es el primer lugar donde el proyecto cobra la decisión de
guardar el ítem como árbol en vez de como texto.

**Barandales para que la franja no crezca sola.** Sin estos, "mínima" se
convierte en una segunda banda completa y F5 pierde el foco:

- **~150 ítems**, no 400. Es una franja, no una banda.
- **Sin modo historia y sin arte de la Sabana.** La Sabana es de kinder.
- **Sin retos curados en serie.** Los 2,500 retos curados son de kinder; la
  franja adulta compone retos del banco sin curaduría pedagógica por serie.
- **Sin ubicación adaptativa propia** más allá de la que ya da F4.
- **Una sola autoría, siete renders de notación** — nunca siete autorías.

**Lo que cuesta, dicho de frente.** Abre un segundo frente de autoría sobre la
ruta crítica, que ya era el cuello de botella. Y `mc-40` es claro en que la
proporción de plantilla **baja** conforme sube el nivel: en esta franja ronda
20-35%, contra ~70% en kinder. O sea, ítem por ítem, el contenido adulto es más
caro de producir que el infantil, aunque haya muchos menos y no se multiplique
por siete.

**Lo que esta decisión NO cambia:** las bandas N4 a N7 y N11-N12 siguen fuera del
MVP; la escalera completa sigue siendo trabajo de versiones posteriores; y el
criterio de "MVP terminado" sigue anclado en que **kinder esté completo**, no en
que la franja adulta lo esté.

**Investigación relacionada:** `mc-34-i18n-math-notation.md` (por qué el problema
de locales es de kinder), `mc-40-item-bank-content-operations.md` (proporción de
plantilla por banda), `mc-39-eastern-drill-mental-math-traditions.md` y
`mc-36-problem-design-item-formats.md` (formatos que sirven a un adulto),
`mc-12-advanced-proof-olympiad-phd.md` (qué es calificable de verdad).

---

## D-035 — Workers AI como proveedor de inferencia · 2026-07-31

**Decisión del dueño:** la inferencia se mueve a **Workers AI**, con ruteo por
dificultad entre modelos, en vez de ser Claude en todos los casos. Enmienda
D-004, D-015, D-029 y D-032.

> **Ampliada el mismo día, a petición del dueño: "solo vamos a trabajar con
> Cloudflare, es una decisión tomada".** No queda ningún camino a la API de
> Claude — ni en la flota, ni en la banda Pro de Larry, ni como escalada de
> moderación. El paquete `@anthropic-ai/sdk` se desinstaló y la variable de
> escape `MC_AUDIT_PROVEEDOR` se eliminó: dejarla habría sido una puerta trasera
> a la dependencia que esta decisión quita a propósito. Lo que esto cuesta está
> escrito abajo, en cada sección que lo pierde.

**Por qué esto no es un experimento.** `mc-37` documenta con `archivo:línea` que
**Larry ya corre hoy en IOS sobre Workers AI**: `@cf/moonshotai/kimi-k2.6` →
`@cf/openai/gpt-oss-120b` → respuesta enlatada (`src/larry/chat.ts:40-41`). Y
`mc-32` ya tenía Workers AI y Vectorize en la arquitectura. Esto alinea Math
Challenge con lo que el dueño ya opera, no lo mete en terreno nuevo.

**Verificado en la cuenta, no supuesto.** `npx wrangler ai models` sobre
`Produccion Ignia y Desici` lista 61 modelos, entre ellos `kimi-k2.6`,
`gpt-oss-120b`, `gpt-oss-20b` y `kimi-k2.7-code`.

| | entrada $/M | cacheada $/M | salida $/M | contexto |
|---|---|---|---|---|
| `@cf/moonshotai/kimi-k2.6` | 0.95 | **0.16** | 4.00 | 262k |
| `@cf/openai/gpt-oss-120b` | 0.35 | n/d | 0.75 | 128k |
| `claude-opus-5` | 5.00 | 0.50 | 25.00 | 1M |
| `claude-haiku-4-5` | 1.00 | 0.10 | 5.00 | 200k |

### La flota adversarial (F1): los 23 a Workers AI

`kimi-k2.6` primario, `gpt-oss-120b` de respaldo. Medido con `--seco`: dos
auditores pasan de **$0.34 a $0.06**.

**El asesor recomendó mixto —los de línea roja en Claude— y el dueño eligió
todo.** Queda anotado porque D-032 nombra el ruido de la flota como su propio
riesgo, y esta elección lo aumenta. La mitigación no es discutirla, es hacerla
segura:

- **Un veredicto que no valida cuenta como auditor fallido, jamás como auditor
  limpio.** El corredor ya salía con código 1 ante un auditor que no pudo
  correr; ahora eso incluye "el modelo no produjo JSON válido".
- **Validación de esquema propia, con un reintento y luego bajada de modelo.**
  Hace falta porque **el JSON Mode de Workers AI es best-effort**: su
  documentación dice literal que *"Workers AI can't guarantee that the model
  responds according to the requested JSON Schema"*. La API de Claude imponía el
  esquema en la capa de la herramienta; eso se pierde y hay que reponerlo a mano.
- **La regla 1 ya protegía contra esto de un lado.** Un modelo más débil que
  invente `D-036` queda descartado mecánicamente. Lo que la regla 1 **no** cubre
  es el falso negativo: el auditor que simplemente no ve la violación. Ese es el
  costo real de esta decisión y no tiene mitigación técnica, solo medición.
- **Control positivo en vez de comparación entre proveedores.** Al no haber
  segundo proveedor, la forma de saber si la flota se degradó es plantarle una
  violación conocida y comprobar que la caza. Se hizo al construirla: tres
  violaciones deliberadas de `mc-33` en un archivo temporal; `pwa-ios` cazó las
  tres, citó D-031 y `mc-33` correctamente, y clasificó bien qué bloquea y qué
  reporta. **La flota no está ciega**, y eso está medido, no supuesto.

**Contradicción de documentación, resuelta midiendo.** La página de modelo de
`kimi-k2.6` declaraba "structured outputs"; la de JSON Mode decía best-effort y
su lista **no incluía** ni kimi ni gpt-oss. **Se probó: ambos respetaron el
esquema** por el endpoint compatible con OpenAI (`/ai/v1/chat/completions`).
`kimi-k2.6` 8.9 s, `gpt-oss-120b` 1.1 s. La validación propia se queda de todos
modos: lo medido es que funciona hoy, no que esté garantizado.

**Tres cosas que solo aparecieron al correrlo de verdad:**

1. **Son modelos de razonamiento.** El pensamiento va en `reasoning_content` y
   consume el mismo `max_tokens` que la respuesta. Con presupuesto corto, la
   respuesta llega **vacía** con `finish_reason: "length"` — que se leería como
   "no devolvió JSON" y mandaría a reintentar con el mismo presupuesto, fallando
   igual. El default subió a 24,000 y ese caso ahora se nombra por lo que es.
2. **Faltaba timeout.** Sin él, un proveedor que no responde deja al corredor
   esperando para siempre — y con un modelo que razona, "colgado" y "pensando"
   se ven idénticos. Fue así como la primera corrida real pareció trabarse
   cuando solo estaba pensando.
3. **El costo estimado estaba a la mitad.** Suponía 1,200 tokens de salida por
   auditor; la medición dio **7,560**, casi todo razonamiento, que se cobra
   igual. Un auditor cuesta ~$0.05, no ~$0.02.

### Larry: bandas bajas a Workers AI, banda Pro se queda

Enmienda la tabla de D-015:

| Banda | D-015 decía | Ahora |
|---|---|---|
| Kinder–Primaria | Haiku 4.5 | **`gpt-oss-120b`** |
| Secundaria / Adulto / Jr | Sonnet 5 | **`kimi-k2.6`** |
| Pro | Opus 5 | **`kimi-k2.6`** |

**Lo que la banda Pro pierde, dicho de frente.** La versión anterior de esta
decisión dejaba Opus 5 en Pro porque una explicación de cálculo tensorial
incorrecta **enseña error**, y `mc-37` §3 marca eso como la diferencia entre lo
que IOS puede permitirse y lo que este producto no. Con solo Cloudflare, el
techo es `kimi-k2.6` — 1T de parámetros, frontier-scale, pero no es Opus 5 y
nadie ha medido la diferencia en matemática avanzada.

**Cómo se cubre en vez de con un modelo mejor:** la banda Pro es la última que
el MVP toca (D-009: el MVP es kinder). Antes de que exista, hay tiempo de medir
`kimi-k2.6` contra un banco de explicaciones avanzadas revisadas por humano.
**Si no pasa, la salida no es volver a Claude —es no soltar la banda Pro con
explicación en vivo—** y dejarla con explicación pregenerada y revisada, que es
el punto 1 de D-004 y nunca dependió de ningún modelo.

Dos razones que no son solo costo. Primera: corre **dentro** del Worker, sin
viaje externo — con `mc-47` apuntando a Android de gama baja sobre 4G lento, la
latencia importa tanto como el precio. Segunda: `mc-37` ya había detectado que
**Haiku 4.5 exige un prefijo de 4,096 tokens para cachear** —el mínimo más alto
de cualquier modelo actual— y el prompt de aritmética básica no llega, así que
la banda barata nunca cacheaba. `kimi-k2.6` cachea desde mucho antes y su
entrada cacheada cuesta $0.16/M.

**La banda Pro no se toca.** Una explicación de cálculo tensorial incorrecta
**enseña error**, y `mc-37` §3 marca eso como la diferencia entre lo que IOS
puede permitirse y lo que este producto no.

### Moderación de prendas (D-029): kimi con escalada a Claude

**La escalada se conserva; cambia hacia dónde.** `gpt-oss-120b` resuelve el caso
claro (1.1 s medidos) y en baja confianza escala a **`kimi-k2.6`**, que es el
techo disponible. Se conserva por lo que D-029 ya decía — *"el matiz entre broma
y denigración es donde un modelo chico falla en ambas direcciones"*— y porque el
volumen es trivial: una llamada por prenda creada, no por intento.

**Sigue siendo a prueba de fallos**, y eso es lo que no se negocia: si ninguno
de los dos puede revisar, la prenda **no se publica**. El modo de falla barato
es un usuario molesto; el caro es una humillación publicada contra la línea roja
#7. Con un techo más bajo, la apelación a revisión humana que D-029 ya exigía
deja de ser un detalle de cortesía y pasa a ser la red que sostiene la
diferencia.

### El RAG no era parte de esta disyuntiva

`mc-32` ya planeaba `math-challenge-explanations-index` en Vectorize con
embeddings `bge-m3` ($0.012/M). Los fragmentos recuperados se le pasan a
cualquier modelo: **el RAG se tenía con Claude o con Workers AI por igual**. Se
construye en su fase, cuando exista el banco de pistas que indexar.

Sigue vigente el riesgo #9 de `mc-32`: **Vectorize se queda sobre contenido
curado, nunca sobre embeddings por niño.** El borrado COPPA ya es un problema de
cuatro sistemas (D1, DO, Analytics Engine, Vectorize).

**Corrección de nomenclatura:** "GPT" en Workers AI es `gpt-oss`, los modelos de
pesos abiertos de OpenAI. No es GPT-5.

**Credenciales:** `CLOUDFLARE_API_TOKEN` (permiso Workers AI Read+Edit) y
`CLOUDFLARE_ACCOUNT_ID`, capturados por `./scripts/set-keys.sh`. El ID de cuenta
se deduce de `wrangler whoami` porque no es secreto y escribirlo a mano es una
fuente de erratas silenciosas.

**Investigación relacionada:** `mc-37` §5 (que documentaba el patrón inverso,
"Claude-first, no Workers AI, per the owner's brief" — esta decisión lo revierte
a propósito), `mc-32` §Workers AI y §Vectorize, `mc-47`.

---

## Tensiones abiertas que el dueño debe resolver

Estas salieron de la investigación. Cuatro ya se cerraron con decisiones; se
dejan listadas con su resolución para que no se vuelvan a discutir, y para que
las dos que siguen abiertas no se pierdan entre 43 documentos.

| # | Tensión | Estado | Dónde está documentada |
|---|---------|--------|------------------------|
| T-1 | "Gamificación lo más adictiva posible" vs. la evidencia de daño y la exposición regulatoria con menores en UE/RU/EUA | **Cerrada** por D-014: lista negra explícita de mecánicas, ninguna con exposición regulatoria | `mc-17`, `mc-10` |
| T-2 | Puntos por velocidad vs. la evidencia de que el cronómetro es el origen medible de la ansiedad matemática en niños chicos | **Cerrada** por D-018 (el reloj depende del tipo de reto, no de la edad) y D-024 (kinder no se cronometra en absoluto) | `mc-10`, `mc-04`, `mc-06` |
| T-3 | Telemetría conductual rica (escribe y borra) vs. "ultra-privacidad para menores" y las reglas de perfilado de menores en la UE | **Cerrada** por D-020 y la línea roja #8: se guardan señales derivadas, nunca flujos crudos de teclas, y borrar jamás penaliza | `mc-30`, `mc-25` |
| T-4 | Tablero público global vs. minimización de datos de menores | **Cerrada** por D-003: alias generados, sin nombre real, sin foto, sin ciudad | `mc-25`, `mc-18` |
| T-5 | Quién verifica que un adulto que abre un salón o un club es quien dice ser | **Abierta, y ahora más ancha.** D-011 propone un stack de mitigación que no es garantía, y D-027 extiende el mismo problema a los clubs de papás. D-027 lo acota eliminando el contacto no supervisado, pero **no verifica al adulto** | `mc-28`, `mc-46` |
| T-6 | Nivel PhD: qué se puede calificar automáticamente de verdad y qué no | **Abierta.** No bloquea el MVP, que llega hasta N10 (D-034), pero define si el modo Pro es viable | `mc-12-advanced-proof-olympiad-phd.md` |
| T-7 | La vía del adulto no tenía contenido en el MVP, y un club de adultos compitiendo en sumas de kinder no tiene sentido | **Cerrada** por D-034: el MVP lleva kinder completo más una franja mínima de contenido adulto (N8-N10), con barandales para que no crezca | D-009, D-028, D-034, `por-que-existe.md` |
