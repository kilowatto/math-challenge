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
hueco no era teórico — bloqueaba F2.

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
   ordenar por una estimación sin datos, o retrasar F6 detrás de F3.
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
| T-5 | Modo maestro: quién verifica que un adulto que abre un "salón" es un maestro real | **Abierta.** D-011 propone un stack de mitigación y dice explícitamente que no es garantía | `mc-28-teacher-classroom-mode.md` |
| T-6 | Nivel PhD: qué se puede calificar automáticamente de verdad y qué no | **Abierta.** No bloquea el MVP (solo kinder), pero define si el modo Pro es viable | `mc-12-advanced-proof-olympiad-phd.md` |
