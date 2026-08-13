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

> **Reafirmado el 2026-07-31.** Un agente detectó que el tablero tenía F9 como
> "Ruta crítica: No", contradiciendo esta decisión. El dueño confirmó que **F9
> sigue en el MVP y T-5 hay que cerrarla**: el MVP no sale sin resolver quién
> verifica al adulto que abre un salón. T-5 pasa a ruta crítica, y la
> verificación previa del maestro es criterio de **F2**, no de F9.

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

> **Enmendado el 2026-07-31 por decisión del dueño.** La serie es la unidad de
> diseño **en kinder**; en la franja adulta N8-N10 (D-034) **no**. La
> contradicción la levantó el auditor `pedagogia` en la primera corrida real de
> la flota, y era real: D-034 dice "sin curaduría por serie" y esta decisión
> decía que la serie es la unidad, sin excepción.
>
> Se enmienda en vez de curar la franja adulta por series porque eso rompería el
> barandal de "mínima" que D-034 puso a propósito, y porque `mc-40` documenta que
> la proporción de plantilla baja a 20-35% en esa banda contra ~70% en kinder —
> es decir, curar por series ahí cuesta varias veces más.
>
> **La renuncia queda escrita aquí, no escondida en el plan.** CLAUDE.md § Contenido
> también dice "la unidad de diseño es la serie": léase con esta excepción.

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

> **Enmendada el 2026-08-01: los adversariales son 28, no 23.** Se añadieron seis
> cartas de locale —una por idioma— cuando el corpus traducido empezó a
> servirse: sin ellas, 242 documentos en seis lenguas no tenían quien los mirara
> con hostilidad en su propio idioma, y el auditor determinista de integridad
> comprueba cifras y enlaces, no si un párrafo alemán dice lo que el original
> decía.
>
> El número vive escrito a mano en `audits/adversarial/prueba.mjs` y **no
> derivado de `CARTAS.length`**, que sería una prueba incapaz de fallar. Existe
> para que añadir una carta obligue a tocar esta decisión — que es lo que acaba
> de pasar: la prueba bloqueó un commit hasta que alguien vino a escribir esto.
>
> **Enmendada el 2026-08-01: `navegacion-unica` se suma a los deterministas.**
> D-064 (una sola navegación primaria a la vez) necesitaba su guardián — y
> escribirlo hizo aparecer el MISMO tipo de bug que D-064 corrigió, una
> segunda vez, mientras se construía el arreglo (un `display: none`
> incondicional que faltaba). Vive en `audits/navegacion-unica.mjs`, con caso
> en `pruebas-auditores.mjs`.

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

> **Enmienda del 2026-08-01: son 45 construidos, y trece nacieron antes que su
> código.** El dueño decidió construir de una vez los trece auditores que la
> planeación de F2-F4 identificó, sin esperar a que existiera lo que vigilan:
> `child-pii` · `sin-penalizacion` · `kinder-sin-examen` ·
> `borrado-cuatro-sistemas` · `puntaje-servidor` · `motor-puntuacion` ·
> `tabla-bandas` · `notacion-locale` · `signup-dos-campos` · `band-typography` ·
> `do-por-entidad` · `intercalado` · `adaptativo-simulacion`.
>
> **Están ACTIVOS, no pendientes**, y eso corrige la intención original. La lista
> PENDIENTE no ejecuta nada: de los ocho que llevaban ahí, seis fallaban abiertos
> sin que nadie lo supiera. Un guardián que espera su turno en una lista no
> vigila. Los trece son análisis estático, cuestan milisegundos y pasan en verde
> sobre el repo de hoy, así que el primer commit de F2 ya llega vigilado en vez
> de depender de que alguien se acuerde de moverlos.
>
> **Y trae su propio guardián.** Un auditor escrito antes que su código no se
> puede ver fallar contra código real, y CLAUDE.md § Git regla 3 dice que una
> prueba que nunca se vio fallar no prueba nada. `audits/pruebas-auditores.mjs`
> escribe una violación de cada regla, comprueba que el auditor bloquea **y que
> lo dice por la razón correcta**, y la borra. Corre en el gancho.
>
> Encontró tres huecos el primer día, en auditores que ya estaban en verde: dos
> por buscar el contexto en la línea en vez del archivo, y uno porque `\b` no
> reconoce el guion bajo como frontera —`/\bkinder\b/` **no** encuentra
> `KINDER_PLACEMENT_REQUIRED`, que es justo la forma en que se escriben las
> constantes de configuración.
>
> Total: 45 construidos, 8 esperando fase, 53 planeados.

> **Eran 12 al decidirse; son 15 al implementarse (F0).** Los tres que se
> agregaron no son adorno: `child-free-text` hace cumplir la línea roja #3 en el
> esquema —donde Roblox demuestra que la moderación no alcanza (`mc-46` §4)—,
> `no-attempts-in-d1` vigila el único límite de la arquitectura que se alcanza
> por error de diseño y no por crecimiento (`mc-32` riesgo #1), y `brand-image`
> nació al descubrir que el naranja de Ignia no pasa el contraste de texto
> normal (`docs/guia-de-estilo.md`). El total sube de 35 a 38. Cuando el código
> encuentra un auditor que faltaba, manda el código.

**Adversariales con LLM (28), en cada PR, instruidos para encontrar la violación
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

**Riesgo conocido:** 28 llamadas de LLM por PR tienen costo y tasa de falsos
positivos. Si la flota se vuelve ruido, la gente aprende a rodearla en silencio,
que es peor que no tenerla.

> **Cómo quedaron las dos reglas al implementarse en F1.** Ambas dejaron de ser
> prosa y pasaron a ser código que se puede ver fallar:
>
> - **Regla 1** vive en `audits/adversarial/citas.mjs`. Lee los encabezados
>   reales de este archivo y los archivos reales de `docs/research/`, y descarta
>   cualquier hallazgo que cite un id inexistente. Se le agregó una segunda
>   mitad que la decisión no anticipaba: **un auditor solo puede invocar lo que
>   su carta le autoriza**. Sin ese corte, los 28 podían citar cualquier
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
> bloquear cada commit con 28 llamadas de LLM es exactamente el ruido que esta
> misma decisión nombra como riesgo. El gancho sí verifica el **cableado** —las
> 28 cartas y la clasificación—, que cuesta milisegundos.
>
> **Proveedor, cambiado por D-035.** Los 28 corren sobre Workers AI
> (`kimi-k2.6` → `gpt-oss-120b`), no sobre Claude. Baja el costo ~5×, que es
> justo el riesgo que esta decisión nombra. A cambio se pierde la imposición de
> esquema en la capa de la herramienta —el JSON de Workers AI es best-effort— y
> se repone con validación propia: un veredicto que no valida cuenta como
> **auditor fallido, nunca como auditor limpio**.
>
> **Tres cosas que se agregaron y no estaban en la decisión:** cada carta declara
> también **de qué es ciega**, porque sin eso los tres auditores de PWA
> reportaban lo mismo; solo despiertan los auditores cuyo alcance toca el diff;
> y `--seco` arma las 28 llamadas sin hacer ninguna y estima el costo, para que
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

### La flota adversarial (F1): los 28 a Workers AI

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

## D-036 — La marca habla en Raleway, los controles en la voz del sistema · 2026-07-31

**Decisión del dueño:** si una tipografía no funciona en un sistema en
particular, **no se insiste**: se busca la más parecida que ese sistema sí tenga
y queda escrita en la guía de estilo como la excepción de ese sistema.

**Cierra la tensión T-8**, que levantó el auditor `pwa-android` en la primera
corrida real de la flota citando D-031 correctamente: D-031 exige "tipografía
del sistema" por plataforma y `guia-de-estilo.md` fija Raleway. En el mismo
elemento no pueden ser ciertas a la vez.

**La salida no es elegir una y perder la otra**, sino repartir por superficie:

| Superficie | Tipografía | Por qué |
|---|---|---|
| Títulos, cuerpo, textos de Larry | **Raleway** (`--font-marca`) | Es donde se lee a Ignia |
| Botones, campos, selects, navegación | **la del sistema** (`--font-sistema`) | Un control con tipografía ajena se siente web, y `mc-22` documenta que los adolescentes abandonan sin diagnosticar por qué — "no se culpan a sí mismos, te culpan a ti" |

`system-ui` resuelve solo a Roboto en Android, SF Pro en iOS y macOS, Segoe UI
Variable en Windows. **No se detecta la plataforma en JavaScript:** fallaría
justo en la primera pintura, que es donde importa.

**Lo que esto cuesta, dicho de frente.** En Android la cara del sistema es
Roboto, una neo-grotesca, y Raleway es humanista: es la más lejana de las tres y
la que más se va a notar. Se acepta igual, porque Roboto **es** la tipografía de
Material 3 y sustituirla por algo "más parecido a Raleway" anularía el motivo
mismo de la excepción.

**La excepción de kinder manda sobre esta tabla.** `mc-20` exige alto grosor de
trazo de 3 a 6 años; si la cara del sistema resulta más delgada, en KINDER los
controles también van en Raleway Medium o Bold.

**Investigación relacionada:** `mc-21`, `mc-22`, `mc-23`, `mc-47` §6.

---

## D-037 — Rendimiento medido, y nunca sobre un niño · 2026-07-31

**Decisión del dueño:** se mide el rendimiento con datos de campo usando Cloudflare
Web Analytics, **con cuidado con los niños, incluido no medir cuando está en retos
de niños**.

**Por qué hacía falta.** D-030 fija umbrales —**INP ≤150 ms, LCP ≤2.5 s, CLS ≤0.1**—
y hasta hoy nadie los medía. `bundle-budget` pesa el bundle, que es una causa del
rendimiento, no el rendimiento. `red-lenta` es un LLM leyendo el diff: en su primera
corrida real, **4 de sus 6 hallazgos eran falsos**, incluido inventar que el bundle
pesaba 240 KB cuando la medición da 2.3 KB. Sospechar no es medir.

**Por qué de campo y no de laboratorio.** `mc-47` documenta que **Google rankea con
datos de campo**. Un Lighthouse local mide una máquina rápida en una red rápida; el
número que decide el ranking —y que describe la experiencia real— viene de usuarios
reales en sus dispositivos reales.

### La asimetría que esta decisión crea, dicha de frente

Los Core Web Vitals de campo los mide **el navegador del usuario**, con un beacon. Sin
beacon no hay dato de campo — no es una limitación de Cloudflare, es física de la
medición. Así que al no medir en superficies de niño:

**Nunca vamos a tener datos de campo justo donde está el mercado objetivo.** `mc-47`
apunta a Android de gama baja sobre 4G lento, y esos son en buena parte los niños. Se
acepta el hueco a cambio de no instrumentar a un menor, y **se compensa donde se
puede, no se ignora**: en superficies de niño se mide en **laboratorio** con
estrangulamiento de CPU y red, etiquetado siempre como laboratorio y nunca reportado
como si fuera campo.

### Qué se permite y qué no

| Superficie | Medición | Cómo |
|---|---|---|
| Sitio abierto, panel de padres, bandas adultas | **campo** | Beacon de Cloudflare Web Analytics |
| Retos, práctica y cualquier pantalla de niño | **jamás campo** | Solo laboratorio, con estrangulamiento, etiquetado como tal |

Cloudflare Web Analytics **no usa cookies ni huella de dispositivo**, que es lo único
por lo que sería aceptable siquiera en superficies de adulto. Aun así no toca a un
niño: la línea roja #2 dice que el niño no es un usuario, y medir su navegación es
tratarlo como uno.

**La inyección automática de la zona se queda APAGADA.** Cloudflare puede inyectar el
beacon a nivel de zona, y eso lo pondría en todas las páginas sin pasar por el
código — incluidas las de niños. Se activa por código, página por página, o no se
activa. Anotado en `docs/infrastructure.md`.

### Cómo se hace cumplir

`audits/telemetria-infantil.mjs`, determinista y bloqueando en cada commit. Falla si
encuentra telemetría en una superficie de niño, y también si encuentra telemetría en
cualquier sitio **sin citar D-037** — porque si no se declara, no se distingue
"revisado y acotado" de "se coló". Se le vio fallar en ambos casos antes de existir.

**Investigación relacionada:** `mc-47` §4, `mc-25`, `mc-32`.

---


> **Enmendada por D-076 (2026-08-02).** «Cero terceros» pasa a «cero terceros
> en el CÓDIGO del producto». Zaraz está encendido en la zona de Cloudflare y el
> dueño no puede apagarlo; queda declarado como excepción conocida, no como algo
> que se cumple. Ver D-076 para la exposición de consentimiento que deja abierta.

## D-038 — Passkey primero, contraseña como respaldo · 2026-07-31

**Decisión del dueño, tomada en F0 y escrita hoy.** El dueño la contestó al
arrancar F0 —*"passkey first, password fallback"*— y se implementó en
`migrations/0001_identity.sql`, pero **nunca se escribió aquí**. Esta entrada
repara esa omisión.

**Cómo salió.** La levantó un agente auditando F2: el comentario de la migración
citaba **D-035** como *"passkey primero, contraseña como respaldo"*, y D-035 es
*"Workers AI como proveedor de inferencia"*. Cité un número que en su momento no
existía y que después se asignó a otra cosa. La decisión era real; la cita, no.

**Lo que esto enseña sobre la flota, y hay que decirlo:** `citas.mjs` valida que
el id **exista**, no que **diga lo que se le atribuye**. `D-035` existe, así que
esta cita habría pasado los tres filtros deterministas. La atrapó un agente
leyendo. **No todo se puede volver determinista**, y este es el ejemplo.

**Qué se implementa:**
- `user_passkeys` es el camino principal: WebAuthn, sin contraseña que robar.
- `user_password` es el respaldo, y existe porque el mercado objetivo incluye
  Android de gama baja donde el autenticador falla o no está.
- **En Workers, sin WASM, el hash disponible es PBKDF2 por WebCrypto.** Argon2id
  no corre nativo. PBKDF2 es más débil frente a hardware dedicado, y decirlo es
  parte de la decisión: se compensa con límite de tasa por Durable Object y con
  que la contraseña sea el camino secundario, no el principal.

**Investigación relacionada:** `mc-45` §registro.

---

## D-039 — Licencia AGPL-3.0 · 2026-07-31

**Decisión del dueño:** el proyecto se licencia bajo **AGPL-3.0**.

Es copyleft fuerte y de red: quien lo use **como servicio** tiene que publicar
sus cambios. Protege contra que alguien tome el motor y el banco de ítems y
lance un competidor cerrado y de pago — que es el escenario que más importa
aquí, porque el banco de ítems **es** el producto (CLAUDE.md § Contenido) y
representa el grueso del trabajo real.

**Lo que cuesta, dicho de frente:** la AGPL espanta a empresas que podrían
contribuir; muchas la prohíben por política interna. Se acepta a cambio de que
la promesa central —*"que llegue a quien no puede pagar"* (`por-que-existe.md`)—
no pueda ser capturada por alguien que sí cobre.

`LICENSE` en la raíz, con el texto íntegro. La página de código abierto de S2 lo
declara sin inventar nada.

---

## D-040 — El tablero global es opt-in por hijo · 2026-07-31

**Decisión del dueño:** un perfil de hijo recién creado **no aparece** en el
tablero global. El padre lo activa.

Lo recomienda `mc-25` implicación 5, y hay una razón que suele pasarse por alto:
**un alias sigue siendo dato personal mientras nosotros guardemos el mapeo
alias→identidad** (GDPR recital 26). "Anónimo hacia afuera" no es "anónimo".

**Consecuencia de esquema:** no se inserta fila en el tablero global al crear el
perfil. Se inserta cuando el padre lo enciende, y esa acción se registra igual
que el consentimiento — quién, cuándo, y qué se comparte.

Enmienda D-003, que creó el tablero global con alias generados y no fijó el
default.

---

## D-041 — iPad es primera clase, y la orientación no se bloquea · 2026-08-01

**Decisión del dueño:** el iPad y el teléfono se diseñan **los dos como primera
clase**, no uno derivado del otro. En iPad la experiencia se optimiza para
**horizontal**, y **vertical sigue funcionando con dignidad** — no se bloquea.

### Por qué no se bloquea, con los dos motivos separados

El dueño pidió al principio que la orientación fuera siempre horizontal. No se
hace, y por dos razones independientes que se sostienen solas:

**1. En iPad es técnicamente imposible.** iOS y iPadOS **ignoran el campo
`orientation` del manifest**: WebKit lo reconoce y no lo aplica, y la Screen
Orientation API no permite bloquear. No es difícil, no existe la forma. Hay
además casos reportados en iPadOS 26 donde **incluso apps nativas** que declaran
solo horizontal aparecen en vertical si el bloqueo del dispositivo está apagado.

**2. Violaría WCAG 2.2 AA.** El criterio **1.3.4 Orientation** prohíbe restringir
el contenido a una sola orientación *salvo que sea esencial*. Una app de
matemáticas no califica: quien tiene el iPad en un soporte fijo, o montado en una
silla de ruedas, quedaría fuera. Este proyecto se comprometió con AA (`mc-38`, y
los criterios de cierre de F11), y `orientation: landscape` en el manifest —que
Android sí respeta— sería una violación real en Android sin arreglar nada en iPad.

**Lo que se hace en su lugar:** horizontal es donde vive la experiencia buena;
vertical se reduce a una columna y funciona. El auditor comprueba **las dos**.

### Lo que iPad primera clase obliga, y que el teléfono no obligaba

- **Multitarea.** Split View y Stage Manager son uso normal en un aula, no una
  excepción. La interfaz aguanta a un tercio, la mitad y dos tercios de ancho.
- **Teclado físico y ratón.** Con Magic Keyboard el iPad es un equipo de
  escritorio: navegación completa por teclado con foco visible (WCAG 2.1.1 y
  2.4.7), y estados de *hover* que **nunca escondan función** — existen con
  trackpad y no existen con el dedo.
- **Apple Pencil.** Nada puede depender de un gesto que el Pencil no hace.
- **Áreas seguras** y el indicador de inicio: un blanco táctil correcto en
  teléfono puede quedar mal colocado en tablet.
- **88 px en kinder también en iPad.** El mínimo de `mc-20` no se relaja porque
  haya más pantalla; se relaja al revés, hay sitio de sobra.

**Cómo se hace cumplir:** `audits/ipad-usabilidad.mjs`, determinista y bloqueando.
La tabla de reglas vive en `docs/guia-de-estilo.md`.

**Investigación relacionada:** `mc-20`, `mc-38`, `mc-33`, `mc-21`. Enmienda D-031
añadiendo iPad como plataforma de primera clase junto a Android, iOS y Windows.

---

## D-042 — La base europea se crea ahora, el enrutamiento después · 2026-08-01

**Decisión del dueño:** se crea `math-challenge-db-eu` con jurisdicción **EU**
desde ya, y el enrutamiento por país se implementa cuando haga falta.

**Por qué las dos mitades por separado.** La jurisdicción de D1 **se fija al
crear la base y no se puede cambiar** — `math-challenge-db` es WNAM para
siempre. Crear la base europea después no la hace europea retroactivamente para
los datos que ya se escribieron, y mover datos de menores entre jurisdicciones no
es un problema técnico sino legal, que es justo lo que GDPR-K mira con lupa.

Crear la base hoy compra una opción irreversible por casi nada; el enrutamiento
es trabajo que se puede diferir sin perder nada.

**Quien la cree escribe su renglón en `docs/infrastructure.md` en el mismo PR.**

---

## D-043 — Los grupos se llaman `child_group` y `adult_club` · 2026-08-01

**Decisión del dueño:** en el esquema, `child_group` / `child_group_membership` /
`adult_club`. En inglés, como manda CLAUDE.md.

Resuelve una contradicción entre tres documentos que un agente levantó al
detallar F2: D-027 escribió `grupo_infantil`/`club_adulto`, el master-plan dice
`classroom`, y CLAUDE.md manda que el código vaya en inglés.

**Se conserva lo único que D-027 protege de verdad: dos estructuras separadas**,
no una con un campo de tipo. Los nombres en español de D-027 eran conceptuales.

`classroom` se descarta porque presupone escuela, y D-027 creó la estructura
precisamente para que la usen también los papás.

---

## D-044 — El dueño de un grupo se verifica sin SMS · 2026-08-01

**Decisión del dueño:** se cambia el requisito de teléfono verificado de D-027.
**Cloudflare no ofrece SMS**, y meter un proveedor externo de pago sería la
primera dependencia externa del proyecto para una fase que ni siquiera es del MVP.

En su lugar, la barrera se apoya en lo que sí controlamos y que D-027 ya había
puesto: **cada niño lo aprueba su propio padre**, sin chat en ninguna dirección,
y el dueño del grupo ve solo alias, puntos y racha.

**Esto NO cierra T-5.** Sigue sin haber verificación de identidad del adulto que
abre un grupo; lo que se quita es una barrera que no podíamos implementar, no el
problema. T-5 sigue en ruta crítica y sigue siendo decisión pendiente del dueño.

Enmienda D-027.

---

## D-045 — En kinder el tiempo se mide, y el puntaje nunca lo ve · 2026-08-01

**Decisión del dueño:** el sello de tiempo existe en kinder como **señal
derivada** que va a Analytics Engine para detectar patrones imposibles, y
**la fórmula de puntuación de kinder no lo toca jamás**.

Resuelve una tensión entre D-024 —"sin reloj visible ni invisible"— y `mc-29`
tier 0, que sugiere conservar la señal para anti-trampa. La lectura que queda:
D-024 prohíbe que el tiempo **puntúe** o se **muestre**, no que exista.

El niño no siente ningún reloj: no lo ve, no lo oye, y no le cuesta puntos.
Precisa D-024 sin enmendarla.

---

## D-046 — La ubicación es opcional, y la edad no limita el nivel · 2026-08-01

**Decisión del dueño**, dos partes:

**La prueba de ubicación es opcional.** El niño juega de inmediato en el nivel
que sugiere su edad, con un botón de recalibrar. `mc-45` documenta que cada paso
antes del primer valor real cuesta activación, y una prueba es el paso más caro
que existe.

**Cuando la ubicación contradice fuerte a la edad, se muestra tal cual.** Un niño
de 5 años que ubica en N5 juega N5, con el tema visual de kinder. Es D-002
aplicado sin peros —la edad manda el tema, la ubicación manda la dificultad— y es
lo que distingue a este producto de los que atan el nivel al grado escolar.

Se descartó pedir confirmación al padre: añade una pantalla en el momento de
mayor abandono, y suavizar el salto habría contradicho D-002 de frente.

---

## D-047 — Offline: precisión sin tablero, y modo avión · 2026-08-01

**Decisión del dueño**, dos partes, y la segunda es un requisito nuevo.

**Un intento offline en banda cronometrada puntúa solo por precisión y no cuenta
para el tablero.** Sin servidor no hay reloj confiable (`mc-33` impl. 7), así que
`d − RT` no se puede calcular con integridad. Nadie pierde el trabajo hecho en el
metro, y **un puntaje no verificable nunca compite contra uno verificado**.

**Modo avión.** El padre o el usuario adulto puede **descargar retos por
adelantado** para jugar sin conexión — el caso literal que dio el dueño es un
vuelo. Implica:

- **Cuánto se descarga: el nivel actual y el siguiente completos** (enmienda del
  dueño, 2026-08-01). Se eligió sobre "un paquete por nivel" porque el caso que
  importa es precisamente el que un solo nivel no cubre: el niño **avanza durante
  el vuelo** y se queda sin contenido a diez mil metros, donde nadie puede
  arreglarlo. Cuesta el doble de peso y hay que vigilar que el audio de los dos
  niveles no reviente el presupuesto de precaché — el audio se comparte entre
  niveles siempre que se pueda, y si no cabe, se baja el audio del nivel
  siguiente y se conserva su contenido.
- Que quepa en el presupuesto de precaché (`mc-42` pone ≤5 MB de audio en la
  primera instalación; esto es aparte y se suma).
- Una cola de intentos que sincroniza al volver la conexión, sin perder nada.
- Que la cola **no guarde intentos crudos en D1** al sincronizar (`mc-32` riesgo
  #1) ni texto libre de un niño (línea roja #3).
- Que la descarga sea explícita: nada se baja solo, porque el mercado objetivo
  paga sus datos.

Es criterio de F3 (motor y cola) y de F5 (qué contenido cabe).

---

## D-048 — En «cuál sobra», toda elección autorada vale acierto · 2026-08-01

**Decisión del dueño:** si un ítem de «cuál sobra» tiene varias respuestas
defendibles y el autor las registró, **todas valen `acc = 1`**.

Es lo que hace valioso al formato: «sobra el 8 porque es par» y «sobra el 9
porque no está en la tabla del 2» son las dos buen razonamiento, y un producto
que castiga la segunda enseña a adivinar lo que el autor pensaba en vez de a
razonar.

El ítem guarda **una justificación por opción correcta**, y Larry explica la que
el niño eligió — no la que el autor puso primero.

No enmienda D-010: `acc` sigue siendo 1 o 0. Lo que cambia es cuántas opciones
producen un 1.

---

## D-049 — El segmento de URL se traduce en cada locale · 2026-08-01

**Decisión del dueño.** La ruta del corpus deja de ser `investigacion` en los
siete locales y pasa a estar en el idioma de cada uno:

| Locale | Segmento | URL de ejemplo |
|--------|----------|----------------|
| `en` | `research` | `/en/research/mc-05-spacing-retrieval-interleaving/` |
| `es-MX` | `investigacion` | `/es-MX/investigacion/mc-05-…/` |
| `es-ES` | `investigacion` | `/es-ES/investigacion/mc-05-…/` |
| `fr-FR` | `recherche` | `/fr-FR/recherche/mc-05-…/` |
| `pt-BR` | `pesquisa` | `/pt-BR/pesquisa/mc-05-…/` |
| `pt-PT` | `investigacao` | `/pt-PT/investigacao/mc-05-…/` |
| `de-DE` | `forschung` | `/de-DE/forschung/mc-05-…/` |

**Por qué.** El idioma de la URL es una señal de coincidencia local — débil
comparada con el contenido, pero real, y visible para la persona antes de hacer
clic. Una URL en español bajo `/de-DE/` le dice a un lector alemán que la página
no es para él, que es exactamente lo contrario de lo que queremos.

Tres cosas que esto obliga y que no son opcionales:

1. **`hreflang` recíproco sobre rutas distintas.** Hasta ahora las siete
   variantes compartían ruta y el `hreflang` era trivial. Ya no: cada variante
   apunta a una URL con segmento distinto, y todas tienen que apuntarse entre sí
   más `x-default`. `audits/hreflang-recip.mjs` deja de ser decorativo.
2. **301 permanentes desde lo ya publicado.** Las URL con `investigacion` llevan
   horas en producción y están en el `sitemap.xml`. Llevan horas, no meses — el
   costo es mínimo, pero un 404 en una URL que ya publicamos es un 404 igual.
3. **`pt-PT` es `investigacao` sin cedilla ni tilde**, no `investigação`. Los
   segmentos van sin diacríticos: un carácter no-ASCII en una ruta se
   porcentualiza (`investiga%C3%A7%C3%A3o`), y una URL porcentualizada es peor de
   leer, de compartir y de citar que una sin acentos. Es la misma razón por la que
   `sarif.mjs` codifica las rutas antes de escribirlas.

**Los slugs de documento NO se traducen.** `mc-05-spacing-retrieval-interleaving`
es el mismo en los siete. El identificador `mc-NN` es citable y estable (D-033), y
traducir el slug rompería la única forma que tiene alguien de encontrar el mismo
documento en otro idioma.

Investigación: `mc-34` (notación e i18n), `mc-48` (citabilidad).

---

## D-050 — La traducción del corpus se pausa; el manual es el entregable · 2026-08-01

**Decisión del dueño**, textual: *"Para en traducirlo por el momento, y solo deja
un md que explique qué y cómo traducir. Con todo detalle por si olvidamos cómo
traducir."*

Estado al pausar, medido con `node scripts/medir-traduccion.mjs`:

| Locale | Traducidos | Con hallazgo de integridad |
|--------|-----------:|---------------------------:|
| `pt-BR` | 47/47 | 28 |
| `pt-PT` | 47/47 | 29 |
| `de-DE` | 39/47 | 16 de 29 medidos |
| `es-ES` | 10/47 | 1 de 8 medidos |
| `es-MX` | 0/47 | — |
| `fr-FR` | 0/47 | — |
| **Total** | **143/282** | **74 de 131 medidos** |

**El número que justifica la pausa no es el costo.** Traducir el corpus entero
cuesta ~$4.54 USD medidos, no estimados — es barato. Lo caro es que **el 56% de
lo traducido tiene hallazgos de integridad**: cifras perdidas, inventadas, o
escritas con la convención decimal equivocada. Seguir traduciendo sin arreglar
antes el bucle de reintento solo aumenta la pila de documentos que alguien tiene
que revisar a mano.

El manual está en [`docs/traduccion.md`](traduccion.md) y cubre: qué se traduce y
qué nunca, la ficha de cada locale, cómo se corre el guion, qué cuesta y qué
tarda con números medidos, cómo trocea y por qué así, el fallo de
`reasoning_content` que parece un fallo de traducción y no lo es, la verificación
con `corpus-integridad`, y el bucle de reintento que falta construir.

**Consecuencia que se acepta a propósito:** seis locales sirven texto en inglés
bajo su propia URL, y las páginas lo declaran con `inLanguage: "en"`.
`audits/jsonld-valid.mjs` bloquea por eso y **tiene razón** — declarar `de-DE`
sobre un cuerpo en inglés sería mentirle al buscador sobre el idioma del
contenido. El auditor rojo aquí es información correcta, no un obstáculo.

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
| T-6 | Nivel PhD: qué se puede calificar automáticamente de verdad y qué no | **Cerrada operativamente por D-124.** N11-N12 usan formatos de respuesta cerrada, CAS, detección de errores y ordenamiento; la pista Lean 4 es aditiva y la prosa libre nunca se puntúa por LLM | `mc-12-advanced-proof-olympiad-phd.md`, D-124 |
| T-8 | Tipografía: D-031 exige "tipografía del sistema" por plataforma; `guia-de-estilo.md` fija Raleway. En el mismo elemento no pueden ser ciertas a la vez | **Cerrada** por D-036: la marca habla en Raleway, los controles en la voz del sistema. Fue la primera tensión que levantó la flota adversarial, no una persona | D-031, D-036, `docs/guia-de-estilo.md`, `mc-22` |
| T-7 | La vía del adulto no tenía contenido en el MVP, y un club de adultos compitiendo en sumas de kinder no tiene sentido | **Cerrada** por D-034: el MVP lleva kinder completo más una franja mínima de contenido adulto (N8-N10), con barandales para que no crezca | D-009, D-028, D-034, `por-que-existe.md` |

---

## D-051 — Un solo consentimiento con gobierno: manda `child_consents` · 2026-08-01

**Decisión del dueño:** `child_consents` + `consent_type_catalog` (migración
0003) es donde vive el consentimiento; `consent_records` (migración 0001) se
retira.

**El problema que resuelve, que no era de estilo.** Las dos tablas guardaban el
mismo hecho —un adulto consintiendo sobre un menor— y no se hablaban.
`consent_records.consent_type` es `TEXT` libre, sin catálogo ni restricción;
`child_consents.consent_code` pasa por `trg_consent_tipo_conocido`, que rechaza
cualquier código que no esté en el catálogo. **La fila que prueba que un padre
consintió podía caer en cualquiera de las dos, y solo una tenía gobierno.**

Lo encontró la crítica adversarial de la espina de entrada de F2, y se verificó a
mano: `migrations/0001_identity.sql:110` y `migrations/0003_accounts_onboarding.sql:75`.

**Se congela, no se borra.** `consent_records` está en la lista de INTOCABLES de
`audits/migration-safety.mjs`: su borrado va por el runbook de erasure, que toca
cuatro sistemas (`mc-32` riesgo #7). La migración 0004 le pone
`trg_consent_records_congelada`, que aborta todo `INSERT` con un mensaje que dice
a dónde ir — un ABORT sin instrucción produce un reintento, no una corrección.
Las filas que hubiera se quedan legibles.

**Y el criterio #114 se enmienda.** Pedía
`consent_type='child_profile_creation'`; ese string no existe en el esquema, el
catálogo lo llama `CHILD_PROFILE`. Con el trigger de 0003 puesto, insertarlo
habría fallado en tiempo de ejecución — o sea, un padre creando el perfil de su
hijo y viendo un error. Se conserva `CHILD_PROFILE`.

**Lo que faltaba al mover el gobierno:** `consent_records` tenía
`consent_version` y `child_consents` no. Sin ella se puede probar QUE alguien
consintió pero no QUÉ texto aceptó, que es la mitad que un regulador pide. La
0004 añade `child_consents.consent_version` y
`consent_type_catalog.current_version`.

Verificado en local y en remoto: el `INSERT` con `child_profile_creation`
devuelve `SQLITE_CONSTRAINT_TRIGGER` con el mensaje de D-051.

---

## D-052 — La cookie del dispositivo del hogar es `mc_h`, y respalda en D1 · 2026-08-01

**Decisión del dueño:** manda el criterio #113, no el comentario de la migración.

El bloque final de `0003_accounts_onboarding.sql:201` decía que las tres cookies
de F2 son `mc_s`/`mc_k`/`mc_d` y que **las tres viven en KV**. Las dos cosas
están mal, y el archivo se contradecía a sí mismo: `household_devices` es una
tabla de **D1** cuya llave primaria es `device_token`, que es exactamente lo que
la cookie del dispositivo lleva dentro.

| cookie | qué identifica | respaldo | vida |
|---|---|---|---|
| `mc_s` | el adulto | KV | 30 días |
| `mc_h` | el dispositivo del hogar (D-012) | **D1**, `household_devices` | 400 días |
| `mc_k` | el perfil de niño activo | KV | 12 horas |

Las tres `HttpOnly; Secure; SameSite=Lax` y **opacas**: un token que indexa, sin
payload. `mc-25` impl. 6 —nada de perfilado sobre menores— es más fácil de
sostener cuando no hay payload que perfilar.

No hay cambio de esquema: `household_devices` ya servía. Lo que cambia es que el
comentario dejaba de ser cierto, y un comentario falso sobre dónde vive una
sesión es cómo alguien construye la mitad equivocada dentro de un año.

---

## D-053 — Del niño se pide el AÑO de nacimiento, no el mes · 2026-08-01

**Decisión del dueño:** la puerta del padre pregunta **solo el año**. Enmienda el
criterio #114, que pedía año y mes en dos `<select>`.

**Por qué.** La banda se deriva del año. `birth_month` no alimenta ninguna
decisión del producto, y es **12 veces más precisión sobre la identidad de un
menor** de la que hace falta para nada que hagamos. La línea roja #2 prohíbe la
fecha exacta; el mes no es la fecha exacta, pero tampoco es gratis: es un campo
más en la puerta y un dato más que proteger, borrar y explicar.

Lo que **no** cambia: sigue prohibido `<input type="date">` en esa ruta. Un
selector de fecha *tiene* día, y el día no se pide. Que ahora haya un solo
`<select>` en vez de dos no relaja esa prohibición, la hace más fácil de cumplir.

**Lo que esta decisión NO resolvió, y está en `docs/dudas.md`:** cómo quitar la
columna. `child_profiles.birth_month` es `NOT NULL`, y quitarla exige la
reconstrucción de 12 pasos de SQLite, que `audits/migration-safety.mjs` bloquea
sobre `child_profiles` sin posibilidad de anulación por comentario — a propósito.
El auditor protege la regla correcta contra el caso contrario al nuestro (perder
datos de un menor sin querer); aquí perderlos **es** el objetivo. Resolver esa
tensión toca un guardián de línea roja y no se hace de paso. Sale en la migración
`0005` con el mecanismo decidido antes.

---

## D-054 — El widget de Turnstile se reusa: pertenece al dominio, no al proyecto · 2026-08-01

**Decisión del dueño, con su razón:** *"se reusa porque math. está dentro de
kilowatto.com"*. El widget se llama **`kilowatto`** y no
`math-challenge-turnstile-signup`.

**Por qué esto NO es una excepción a la regla del prefijo, sino un límite de
ella.** `CLAUDE.md` dice «todo objeto lleva prefijo `math-challenge-`, sin
excepción, ni en pruebas», y esa regla existe para que dentro de un año alguien
pueda mirar la cuenta de Cloudflare y saber qué objeto es de qué proyecto, para
poder borrarlo sin miedo.

Un widget de Turnstile no encaja en ese modelo: **está atado a una lista de
hostnames, no a un proyecto.** El widget de `kilowatto.com` cubre
`math.kilowatto.com` porque es el mismo dominio. Crear un segundo widget para el
subdominio no daría aislamiento — daría dos widgets sobre el mismo dominio y una
lista de hostnames duplicada que se desincroniza.

**Lo que esta decisión cuesta, dicho aquí para que no sorprenda:**

- **Las analíticas de Turnstile son compartidas.** El tráfico de bots contra el
  registro de Math Challenge se ve mezclado con el del resto de `kilowatto.com`.
  Si algún día hace falta separarlos, hará falta el segundo widget.
- **La lista de hostnames es compartida.** Quien la edite para otro sitio de
  `kilowatto.com` puede dejar fuera a `math.kilowatto.com` sin notarlo, y el
  síntoma sería que nadie puede registrarse.
- **`audits/cf-prefix.mjs` no lo vigila** — hoy no conoce los widgets de
  Turnstile, así que no hay un auditor que se queje ni que lo permita. Queda
  como hueco conocido.

**Lo que NO cambia:** el `secret key` sigue siendo secreto y se captura con
`./scripts/set-keys.sh --solo TURNSTILE --remote`, que lo lee sin eco. El `site
key` es público por diseño —viaja en el HTML— y va como variable, no como
secreto.

**Y la línea roja que esto roza y no cruza:** Turnstile es defensa de bots sobre
un formulario de **adulto**. No verifica edad, no recoge biometría y no bloquea
el navegador. La línea roja #1 prohíbe cámara, micrófono, biometría y navegador
bloqueado — nada de eso ocurre aquí. Lo que sí hay que impedir mecánicamente es
que el widget aparezca alguna vez en una superficie de niño, y para eso se
escribe `audits/turnstile-solo-adulto.mjs` en este mismo PR.

---

## D-055 — XP es un eje separado de los puntos del tablero, nunca el mismo número · 2026-08-01

**Decisión:** el eje de progreso de F7 (XP → Rango) es una segunda fórmula,
deliberadamente distinta de los puntos que D-025 usa para el tablero. Nunca se
deriva de `score_totals`.

**Por qué hacía falta decidir esto.** Diseñando F7 en paralelo, dos de los siete
subsistemas llegaron a issues de GitHub incompatibles sobre la misma pregunta:
uno construía XP como una fórmula nueva (`xpDeItem`/`xpDelReto`, tabla
`xp_totals` propia); el otro afirmaba, en la misma tanda, que "XP es el mismo
valor que produce `calificar()`... sin segunda fórmula". Las dos no pueden ser
ciertas a la vez, y ninguna de las dos issues lo señalaba.

**Por qué XP no puede ser el mismo número que los puntos, dicho con la
propiedad que decide todo:**

| Propiedad | Puntos (`score_totals`, D-025) | XP (Rango) |
|---|---|---|
| ¿Puede bajar? | Sí — fallar rápido resta más que fallar lento (D-010) | Nunca |
| ¿Depende del reloj? | Sí, de PRIMARIA a Pro | Nunca, en ninguna banda |
| ¿Se resetea? | Sí, por temporada (`period`) | Nunca — acumulado de por vida |
| ¿Para qué sirve? | Ordenar el tablero/ligas (competitivo) | Progresar de Rango (personal) |

Un sistema de niveles construido sobre un número que puede bajar o resetearse
le quitaría a un niño un Rango ya ganado. Eso no es un detalle de
implementación: es exactamente lo que D-014 prohíbe con "cosméticos ganados
(**deterministas**)" — un desbloqueo que se puede perder no es determinista,
es una promesa rota. La misma garantía que protege un cosmético tiene que
proteger el número que decide cuándo se otorga.

**Lo que esto cuesta, dicho de frente:** un niño de 8 años ve dos números que
suben con su desempeño y tiene que entender por qué no son el mismo. Se mitiga
por lo que HACEN, no por su aritmética — "los puntos son tu marcador de esta
liga, puede subir y bajar"; "el XP es todo lo que has aprendido, nunca baja" —
y por una regla de interfaz dura: **nunca se muestran los dos números en la
misma pantalla sin una etiqueta que los distinga**, y ninguno se deriva del
otro en código.

**Caso especial que hace que el lanzamiento no exponga el problema todavía:**
en KINDER, la fórmula de puntos (D-024, `valor_del_ítem · acc`, sin tiempo, sin
signo negativo posible) y la fórmula de XP son matemáticamente el mismo número
por construcción. Kinder es toda la banda que el MVP construye (D-009/D-034),
así que el primer release no muestra la divergencia — pero el código de XP
tiene que existir como eje separado desde el día uno, o la migración futura a
SERIO/JR/PRO (D-034, la banda cronometrada) rompe un Rango ya otorgado.

**Investigación relacionada:** `mc-16` (Duolingo separa XP de gemas/rachas por
la misma razón: un número competitivo y uno de progreso personal no deben
mezclarse), `mc-43` (visualización de progreso e identidad).

---

## D-056 — Ligas: ascenso 23.3% (7/30), descenso 16.7% (5/30) — las cifras reales de Duolingo, no el 10% sin verificar de master-plan · 2026-08-01

**Decisión:** el ciclo semanal de ascenso/descenso de liga usa
`round(tamaño × 7/30)` para ascender y `round(tamaño × 5/30)` para descender,
mínimo 1 en ambos casos, escalado por tamaño real de la cohorte (una liga de
menos de 30 no asciende/desciende los mismos absolutos que una completa).

**Enmienda explícita.** `docs/master-plan.md` §6 dice, sin cifra de ascenso:
*"Descenso suave (solo el 10% inferior, solo entre activos)"*. Esa cifra nunca
se verificó contra el producto que la inspira. Al diseñar F7, se confirmó en
vivo (fetch directo a duolingoguides.com) el mecanismo real de Duolingo: liga
de 30, **7 ascienden (23.3%)**, **5 descienden (16.7%)**, el tier superior
(Diamante) solo puede descender. Esta decisión adopta esas cifras y corrige la
mención de master-plan.

**Por qué las cifras reales y no las de master-plan.** `mc-18`
(Leaderboards & competition) documenta el mismo mecanismo con una
recomendación algo más conservadora ("promote the top 15-20%... demote only
the bottom 10%") — ninguna de las dos coincide exactamente con lo que Duolingo
hace en producción, que es lo que master-plan cita como modelo ("estilo
Duolingo", D-003). Entre inventar un número propio, usar la recomendación de
`mc-18`, o replicar el producto real que D-003 ya nombra como referencia, se
eligió lo último: **es la única de las tres opciones que se puede verificar
contra un sistema que de verdad opera a esta escala**, no una recomendación de
investigación sin desplegar.

**Lo que NO resuelve, dicho de frente:** `mc-18` tiene una objeción de fondo
que ninguna cifra de porcentaje arregla — el ranking dentro de la liga sigue
siendo por puntos (D-025), con el mismo sesgo hacia volumen sobre dificultad
que D-025 ya reconoce y no resuelve del todo. Cambiar el porcentaje de
ascenso/descenso no toca esa objeción.

**Condición de revisión:** si el producto real de Duolingo cambia su mecánica
(lo ha hecho antes — antes de 2022 no existía la zona de descenso suave), esta
decisión se revisa. Hasta entonces, replicar el número real gana sobre
inventar uno propio.

**Investigación que la respalda:** producto real de Duolingo, verificado en
vivo el 2026-08-01 (duolingoguides.com).
**Investigación que la matiza:** `mc-18-leaderboards-competition.md`
implicación 5 (recomienda 15-20%/10%, más conservador que lo adoptado).

---

## D-057 — F8 pospone el cobro: panel, reportes y límite de pantalla se construyen gratis para todo padre · 2026-08-01

**Decisión del dueño:** al diseñar F8 ("Padres"), instrucción explícita — *"no vamos a cobrar nada.
Por lo que tenemos que ser muy cuidadosos con eso."* Ninguna de las funciones de F8 (panel con
diagnóstico, límite de pantalla con corte suave, reportes) queda gateada detrás de una suscripción.

**Por qué hacía falta esta entrada.** D-021 (Monetización) lista *"panel del padre con diagnóstico...
reportes"* como funciones del Plan Familia de pago (~$8-10 USD/mes). Al diseñar F8 en detalle, tres
documentos de subsistema repitieron, cada uno por su cuenta, la misma corrección de alcance sin que
quedara registrada en el lugar que CLAUDE.md manda consultar primero: *"Toda decisión nueva se anota
[en decisions.md] con fecha... Si una decisión ya está en decisions.md, no se vuelve a discutir."*
Sin esta entrada, una sesión futura que abra `decisions.md` antes que las issues de F8 (el orden que
CLAUDE.md exige) leería D-021 tal cual está — panel y reportes como función de pago — y no
encontraría la corrección.

**Alcance exacto de esta pausa:**
- **Panel con diagnóstico** y **Reportes** — D-021 los listaba como Plan Familia. Se construyen
  completos y disponibles para cualquier padre, sin verificar suscripción ni plan.
- **Límite de pantalla con corte suave** — D-021, verificado línea por línea, **nunca** lo listó como
  función de pago (el agrupamiento de `master-plan.md` §13.2, que junta "límite de pantalla" con
  "Stripe" en la misma fila de F8, es un artefacto de esa tabla resumen, no de la decisión real). No
  necesita esta pausa porque nunca estuvo gateado.
- **Stripe en sí** (el flujo de suscripción, checkout, webhooks) — pospuesto por completo. Ninguna
  issue de F8 depende de que exista.

**Lo que NO cambia:** D-021 sigue siendo la decisión de monetización del proyecto — el Plan Familia
a ~$8-10 USD/mes sigue existiendo en el plan. Lo que se pospone es la implementación del cobro en sí
y el gateo de panel/reportes detrás de él, no la intención de monetizar en algún momento futuro. El
tope de 6 perfiles gratis con bandera en `CONFIG_KV` (issue #120, F2) tampoco se resuelve aquí —
sigue en 6 hasta que exista una decisión de monetización real que lo reemplace formalmente.

**Condición de revisión:** cuando exista una decisión de negocio sobre cobro real, esta entrada se
enmienda (mismo patrón que D-035 enmendó D-015) para especificar el mecanismo de gateo — no se
reescribe D-021, que sigue siendo la fuente del *qué* se cobra; esta entrada gobierna el *cuándo*.

---

## D-058 — La superficie clara sube a blanco puro; el naranja de la marca no se toca · 2026-08-01

**Decisión del dueño**, preguntada en modo interactivo y contra mi recomendación, que era
oscurecer el naranja para bordes.

`--color-surface: #F7F7F8` → `#FFFFFF`. Los tres pares que `audits/contrast.mjs` reportaba
por debajo de umbral pasan, y **ningún color de marca cambió** — que es exactamente lo que mi
recomendación no conseguía: un `--color-accent-borde` más oscuro habría metido un segundo
naranja al producto para siempre.

| par | antes | después | exige |
|---|---|---|---|
| `--color-accent` sobre superficie | 2.83:1 | **3.03:1** | 3:1 (gráfico) |
| `--color-text-muted` | 4.38:1 | **4.58:1** | 4.5:1 (texto) |
| `--color-text-brand-warm` | 4.28:1 | **4.69:1** | 4.5:1 (texto) |

**El 3.03:1 pasa por 0.03 y eso no se celebra.** El naranja de Ignia sigue sin servir para
texto normal sobre ningún fondo —CLAUDE.md ya lo decía— y cualquier superficie que no sea
blanco puro lo vuelve a tumbar. Por eso `contrast` pasó de PENDING a ACTIVO en la flota: no
para dejar constancia del verde, sino para que el día que alguien vuelva a poner un gris de
fondo el commit se detenga solo.

**Lo que se pierde:** `#F7F7F8` existía para que las tarjetas se distinguieran del fondo. Con
la superficie en blanco, esa separación pasa a depender del borde y de la sombra. No está
medido si alcanza en un teléfono de gama baja con luz de sol, que es nuestro dispositivo de
referencia — queda dicho como residuo conocido.

---

## D-059 — El espaciado accesible se TOLERA, no se aplica · 2026-08-01

**Decisión del dueño.** `docs/guia-de-estilo.md` § Dislexia cita `mc-21` con «0.12em entre
letras, 0.16em entre palabras, 1.5× de interlineado». El token del repo es
`--tracking-readable: 0.012em` — **diez veces menos** — y no existe token de espaciado entre
palabras. Parecía un error de implementación durante meses.

No lo era. **Esas tres cifras exactas son las de WCAG 2.1/2.2 SC 1.4.12 «Text Spacing», que
NO pide aplicarlas.** Pide que el contenido no se rompa cuando la persona usuaria las aplique
por su cuenta: con una extensión, con una hoja de estilo propia, con el modo lectura de su
navegador. Aplicarlas por defecto a todo el producto no es lo que la pauta pide y cambia la
tipografía para las seis personas de cada siete que no lo necesitan.

Entonces: el token de 0.012em **se queda como decisión estética**, y lo que faltaba —lo único
que faltaba— era la prueba de que la maquetación aguanta. Es
`audits/espaciado-tolerante.mjs`, activo en el gancho: prohíbe `line-height` en px y alto
fijo con `overflow: hidden` sobre cajas con texto.

**Lo que ese auditor NO comprueba, dicho para que su verde no se lea de más:** si el texto de
verdad desborda. Eso exige un motor de maquetación aplicando el espaciado y midiendo cajas.
Su verde significa «no tiene las formas que lo rompen», no «cumple 1.4.12». La comprobación
real sigue necesitando un navegador y no está hecha.

---

## D-060 — La primera sesión ES la ubicación; no existe pantalla de examen · 2026-08-01

**Decisión del dueño** (mc-44 Q1, criterio #100 de F4).

No hay secuencia dedicada de ubicación. El niño entra a jugar, `birth_year` siembra el ítem 1,
y el motor ubica con los primeros hasta-15 ítems **mientras el niño juega retos de verdad**. El
criterio #100 ya pedía esto para kinder —«no se llama prueba ni lo parece»— y esta decisión lo
extiende a las seis bandas.

**Lo que cuesta y no se esconde:** los primeros ítems tienen más ruido que un examen dedicado, y
hasta el ítem 8 la dificultad puede oscilar de forma perceptible. Se compra con K decreciente
(criterio #91) y con la parada temprana, no con una pantalla de examen.

**Lo que NO se puede construir después de esta decisión:** una puerta de ubicación. Si alguien
escribe una pantalla que hay que terminar antes de practicar, contradice esta entrada y la
línea roja #4 en su forma no-económica: una barrera entre un niño y la práctica.

---

## D-061 — Una discrepancia entre edad y nivel NO se interpreta, en ninguna dirección · 2026-08-01

**Decisión del dueño**, y no es la opción que le ofrecí. Sus palabras: *«Pueden pasar varias
razones, un niño prodigio o un adulto con problemas. No juzguemos.»*

Yo pregunté qué hacer cuando la ubicación contradice fuerte a la edad —un niño de 5 años
ubicando en N5— y ofrecí tres salidas que asumían todas lo mismo: que la discrepancia significa
algo. La corrección es que **no significa nada que el producto pueda saber**.

Concretamente:

- **La dificultad se muestra tal cual.** D-002 ya separa los ejes: la edad decide el TEMA
  visual, la ubicación decide la DIFICULTAD. El niño de 5 años ve la Sabana de kinder con
  matemáticas de N5, y eso no se suaviza.
- **Nadie recibe una alerta.** Ni el padre, ni Larry, ni el panel.
- **Y va en las DOS direcciones.** Un adulto aprendiz ubicando en N1 es exactamente el mismo
  caso, y merece exactamente el mismo silencio. El producto va «de los 4 años al matemático
  profesional» y eso incluye a un adulto que empieza por abajo.

**Esto acota D-020.** D-020 permite una nota suave al padre por «patrón imposible para la
edad»; esta entrada la deja **solo** para el patrón temporal que sugiere que alguien más está
respondiendo —velocidad sobrehumana sostenida— y **nunca** para un nivel alto en sí. Un nivel
alto no es evidencia de nada. `audits/adaptativo-simulacion.mjs` tiene que poder demostrar que
la nota no se dispara por nivel.

---

## D-062 — No hay re-ubicación periódica: la estimación siempre está viva · 2026-08-01

**Decisión del dueño** (mc-44 Q6). El Elo se actualiza en cada respuesta, así que la ubicación
nunca envejece y no hay nada que re-ejecutar. Lo que sí entra en v1 es la histéresis del
criterio #92: tras N fallos seguidos el motor baja de escalón solo, sin ceremonia.

**El hueco, dicho:** un niño que estuvo tres meses sin entrar vuelve con la estimación de hace
tres meses y el sistema no lo sabe. No se tapa en v1. La opción de subir K tras una ausencia
larga quedó descartada por una constante que nadie ha medido con niños reales, y meterla a
ciegas sería peor que el hueco.

---

## D-063 — La maestría en dos etapas NO bloquea el avance · 2026-08-01

**Decisión del dueño** (mc-05 Q5). El avance va por su propio umbral —la estimación de
habilidad— y la maestría en dos etapas (3 seguidas → `provisional_at`; repaso correcto a ≥3
días → `mastered_at`) **solo** decide cuándo toca repasar y qué ve el padre como «aprendido»
frente a «practicado».

**Por qué la alternativa fiel a la evidencia se rechazó:** bloquear hasta el repaso a ≥3 días
le dice al niño «vuelve en tres días», y el criterio #94 lo prohíbe con esas palabras — un
cronograma que agota el contenido del día es una vida disfrazada, y cobrarlo sería línea
roja #4.

**Lo que cuesta:** un niño puede avanzar sobre un nodo que todavía no probó durable y arrastrar
el hueco. Lo que lo atrapa es el repaso: el nodo sigue vencido y vuelve a aparecer intercalado,
solo que sin puerta.

---

## D-064 — Una sola navegación primaria a la vez, nunca dos apiladas · 2026-08-01

**Origen:** el dueño reportó, con una captura de su iPhone, que el menú del sitio "no se ve
orgánico, no se ve nativo". La causa raíz, confirmada leyendo `Base.astro`: `nav.sitio` (arriba)
y `.barra-inferior` (abajo) se pintaban **las dos a la vez** en iOS/Android, sin condicionar a
si la página corre instalada o en una pestaña de navegador. En una pestaña normal de Safari eso
son **tres** navegaciones apiladas — las dos del sitio más la barra de direcciones del
navegador —, confirmado en la propia captura del dueño.

**Decisión del dueño**, resuelta en dos rondas de preguntas de opción múltiple tras investigar
HIG, Material 3, NavigationView de Fluent y varias fuentes de patrones de PWA (`mc-49`):

1. **La barra inferior de app solo existe instalada** (`display-mode: standalone`, la misma
   señal que ya usa `Instalar.astro`). En una pestaña de navegador no compite con la barra del
   propio navegador.
2. **La barra inferior instalada se limita a 5 destinos, todos de UN toque**: Inicio, Niveles,
   Investigación, Entrar, Crear cuenta. El dueño pidió explícitamente que Entrar no pase por un
   segundo nivel — así que los 5 slots que HIG/M3 permiten como máximo se llenan con las 5
   acciones que importan a diario, y no queda slot para una pestaña "Más".
3. **Origen, Arquitectura y Código abierto viven en un `<details>/<summary>` nativo** ("Más"),
   en la franja superior del modo instalado — cero JavaScript, mismo elemento HTML que ya se usa
   para el menú de la pestaña de navegador (punto 5).
4. **Ícono + texto** en cada destino de la barra instalada — se aparta de "solo texto", que era
   la opción de menor costo, porque el dueño prefirió fidelidad a HIG/M3 (que casi siempre
   emparejan ambos) sobre el ahorro de no generar un set de 5 glifos nuevos.
5. **En pestaña de navegador (no instalada): encabezado compacto** — marca + Entrar + Crear
   cuenta siempre visibles + un botón que despliega las 6 secciones **debajo**, empujando el
   contenido (mismo `<details>/<summary>`, nunca un overlay de pantalla completa — `mc-49`
   documenta rarezas específicas de iOS Safari con overlays que este patrón evita por
   construcción).
6. **iPad en horizontal completo (1024-1366px, la fila de D-041) usa un riel lateral**, no la
   barra inferior de iPhone — coincide con dónde Material 3 documenta que cambia el patrón. Por
   debajo de ese ancho, iPad se comporta como iPhone.
7. **Sin librería nueva** (se descartó Framework7/Ionic/Onsen UI): HTML semántico + CSS con
   `data-platform` y `display-mode`, el mismo patrón que el repo ya usa. `mc-49` no encontró
   evidencia de que una librería dé mejor resultado que CSS bien hecho para una barra de
   pestañas, y sí un costo real de peso de JS en todas las páginas, no solo donde se usa.
8. **Escritorio no cambia.** La barra horizontal de hoy coincide con el modo "Top" de Fluent
   `NavigationView` y con la convención de apps web de macOS.

**Investigación relacionada:** `mc-49`. Enmienda D-031 (que ya pedía "barras de navegación y
pestañas nativas" pero nunca dijo "una sola, no dos") y `docs/guia-de-estilo.md` § Navegación.

**Lo que esto no resuelve todavía:** de dónde salen los 5 íconos (el punto 4 crea una
dependencia nueva — no encaja en "arte" de Recraft ni en "pieza compleja de interfaz" de Gemini
per CLAUDE.md § Imágenes, así que se resuelve como glifo de línea simple, monocromo, en SVG
inline con `currentColor`, sin pasar por ninguna de las dos herramientas de imagen); y el
detalle exacto del riel de iPad, que queda para cuando se construya esa pieza.

---

## D-065 — El área privada tiene su propio layout, y sus pestañas dependen de la cuenta real · 2026-08-02

**Origen:** el dueño reportó, con una captura real de "Tu casa" (el panel del padre) ya con
sesión abierta, que seguía enseñando el nav de MARKETING — "Entrar"/"Crear cuenta" como acción
principal para alguien que ya había entrado. La investigación interna confirmó que era omisión,
no decisión: los tres archivos de `app/kids/**` tienen razonamiento extenso y citado para NO usar
`Base.astro` (cero telemetría de niño, cero navegación de marca, cero JavaScript — línea roja
#2, D-037); `app/index.astro` y `app/signin.astro` eran los dos únicos archivos bajo `/app/**`
sin un solo comentario que explicara su elección de layout.

**El hallazgo de fondo no era de layout: era de modelo de datos.** La pantalla asumía que todo
adulto es un padre. `users.is_learner` existe desde la migración 0001 —"¿este adulto usa el
producto para sí mismo?"— y nada río abajo lo leía nunca. Un adulto que se registró por
`registro-aprendo` veía la misma sección "Tus hijos" vacía, sin sentido para él, y **sin ningún
lugar a donde ir**: no existe pantalla de práctica para un adulto que aprende solo (F5b/F10, D-034,
sin construir todavía).

**Decisión del dueño**, tras investigar `mc-20`/`mc-21`/`mc-22`/`mc-23`, `mc-49`, y el análogo
real más cercano (Google Family Link, `mc-50`), en dos rondas de preguntas de opción múltiple más
una petición explícita de replantear el primer borrador cuando el dueño señaló el hueco de
"modo solo":

1. **`layouts/Privada.astro`**, no `Base.astro`, para toda pantalla autenticada de adulto fuera
   de `app/kids/**`. Tokens SERIO (`bandas.css`, oscuro por defecto), detección de plataforma
   igual que el sitio público (D-031), `Instalar.astro` (esta SÍ es superficie donde instalar
   tiene sentido), y `Rum banda="SERIO"` — no `PUBLICO`, que mezclaría tráfico de marketing con
   uso real del producto en el mismo balde de métricas.
2. **Una franja de pestañas simple, fija arriba — no los cuatro bloques de D-064.** Esta pantalla
   tiene 2-5 destinos, no "6 secciones + desbordamiento compitiendo con un nav de marketing": el
   problema que la máquina de D-064 resuelve no existe aquí. Family Link usa exactamente este
   patrón (3 pestañas fijas) para el mismo tipo de cuenta —un adulto gestionando el uso de un
   menor.
3. **Las pestañas se derivan de lo que la cuenta REALMENTE tiene, no de por dónde se registró.**
   `esFamilia` = tiene ≥1 hijo. `esSolo` = `users.is_learner = 1`. No son excluyentes — la
   migración ya documentaba que una persona puede ser las dos cosas (cita al propio dueño como
   ejemplo). Con ninguna de las dos (ej. cuenta de maestro, F9 sin construir), la página redirige
   directo a `/app/perfil/`: una pantalla con una sola pestaña no es una pantalla.
4. **Tope de 5** (HIG, Material 3 — mismo límite que `mc-49` ya fijó para el sitio público).
5. **Progreso, Límite de pantalla (F8, D-057) y Practicar (F5b/F10, D-034) se enseñan ya,
   marcadas "Próximamente".** El dueño prefirió explícitamente dejar el hueco visible ahora a
   rehacer la navegación cuando esas fases lleguen de verdad.
6. **La pestaña de aterrizaje es la primera REAL, no la primera de la lista** — un aprendiz solo
   vería "Practicar" (próximamente) como bienvenida si el orden mandara, un callejón sin salida
   en la primera pantalla que ve. "Cuenta" siempre es real.
7. **"Cuenta" (passkey, contraseña) vive en `/app/perfil/`, una ruta separada — no una vista
   dentro de `app/index.astro`.** División de trabajo en paralelo con otra sesión: el layout y las
   pestañas van aquí; el contenido de cuenta, aparte. "Salir" queda en el propio `Privada.astro`
   (la navegación compartida), porque es transversal y no depende de qué pestaña se esté viendo.
8. **El lineamiento para las bandas de niño futuras (PRIMARIA, SECUNDARIA) se escribe ya, no se
   pospone** (el dueño lo pidió explícitamente en vez de esperar a que esas fases arranquen): cero
   navegación de cuenta, siempre — la rejilla de caras sigue siendo la navegación completa en
   cualquier banda de niño. Lo que cambia por banda es la DENSIDAD de contenido dentro de la
   pantalla de práctica (`mc-21`: franja ligera de "dónde estoy"; `mc-22`: riel lateral solo en
   escritorio), nunca una estructura de cuenta. Un niño nunca llega a `Privada.astro` — ese layout
   es de adulto por construcción.

**Investigación relacionada:** `mc-50`. Enmienda implícita de D-064 (aclara que su alcance era
siempre el sitio público, nunca `/app/**`) y agrega `docs/guia-de-estilo.md` § Navegación privada.

**Lo que esto no resuelve todavía:** cuándo "Practicar" pasa de próximamente a real depende de
F5b/F10, sin fecha. Si F9 (maestro/salón) llega a construirse, esta decisión no dice si el
maestro recibe una 6ª pestaña aquí o un área separada — el tope de 5 asumía familia+aprendiz, no
maestro; queda como pregunta abierta para quien construya F9.

---

## D-066 — Lo que separa JR de PRO es el PERFIL, no el ítem · 2026-08-02

**Decisión del dueño**, cierra la duda §9.

D-017 le da a JR y PRO la misma fila (`N11–N12`) y D-010 les da parámetros
distintos (`d=30, a=0.8` contra `d=20, a=1.0`). Los dos documentos son correctos
por separado y juntos no decidían nada: dado un ítem de N11, no había regla que
dijera cómo puntuarlo.

**La banda sale de la cuenta.** El mismo problema de olimpiada vale distinto
según quién lo resuelve — igual que un tiempo de 100 metros se juzga distinto en
juvenil que en absoluto. El ítem no lleva banda.

**Lo que cuesta, y hay que decirlo en la interfaz:** dos personas resolviendo
exactamente el mismo reto ven puntajes distintos. En un tablero eso parece un
error si nadie lo explica. La explicación no está escrita todavía.

**Lo que esto NO resuelve:** cómo se decide si una cuenta es JR o PRO. Hoy
`users` no tiene esa columna y no hay forma de elegirlo. Queda abierto.

---

## D-067 — `es-MX` y `fr-FR` se reintentan: nunca corrieron · 2026-08-02

**Decisión del dueño**, cierra la duda §12. **Enmienda acotada a D-050.**

De los nueve agentes de traducción, dos murieron antes de traducir una línea:
`blocked by safety classifier: Stage 2 classifier error`. El propio mensaje dice
que suele ser transitorio.

Son exactamente los dos locales que seguían en cero y los dos mercados grandes.

**Reintentar esos dos NO es traducción nueva** — que es lo que D-050 pausa. Es
terminar la que ya se lanzó y no llegó a ejecutarse. Se anota como enmienda
explícita y con fecha para que nadie lea después que la pausa se saltó.

**El límite es estricto: SOLO esos dos.** Cualquier otro locale sigue pausado.

**Lo que no se investigó:** por qué el clasificador bloqueó justo esos dos de
nueve. Puede ser azar y puede ser algo del contenido; el dueño eligió reintentar
antes que averiguarlo, y si vuelve a bloquear, eso ya no es azar.

---

## D-068 — Las 421 páginas se miran con capturas automáticas · 2026-08-02

**Decisión del dueño**, cierra la duda §8 — «el hueco más grande que tiene hoy el
proyecto», escrito así desde que se abrió.

Hay 421 páginas verificadas con `curl`: códigos 200, JSON-LD, hreflang,
presupuestos de peso. **Ninguna persona ha mirado cómo se ven.** Un `curl` no ve
un texto que se sale de su caja, ni un contraste insuficiente, ni una tabla que
desborda en un iPad en Split View — que es literalmente lo que
`ipad-usabilidad.mjs` declara que no puede comprobar.

**Un navegador real recorre las 421 y guarda una imagen de cada una.** Encuentra
la clase de fallo que ningún auditor estático ve.

**Lo que cuesta:** 421 imágenes que alguien tiene que mirar, y la mayoría estarán
bien. Es trabajo humano real y no se puede automatizar la parte de mirar.

**Y lo que esto NO sustituye:** que un niño de cuatro años se siente delante. Una
captura dice si el marco de diez se dibuja; no dice si se entiende.

---

## D-069 — Ningún reporte de un agente se actúa sin verificarlo con un comando · 2026-08-02

**Decisión del dueño**, cierra la duda §13. **Es una regla, no una preferencia.**

Ya pasó dos veces. Un agente reportó que `de-DE/mc-48` tenía «7 literales
perdidos, `WCAG 2.2` convertido a `WCAG 2,2` siete veces» — con conteo exacto y
una explicación correcta de por qué sería grave: una versión de norma no es una
cantidad y no lleva coma. `grep "WCAG 2,2"` no devuelve nada. El defecto no
existía. Antes había pasado igual con `locale-pt-PT`.

**El patrón es el peligroso: la explicación es buena y el hecho es falso.** Un
informe convincente sobre un defecto inventado cuesta más que uno confuso, porque
se actúa sobre él.

**La regla:** un hallazgo de agente no se toca hasta re-ejecutar la comprobación
que lo demuestra. Es la regla 2 de commit —«toda afirmación factual debe poder
re-ejecutarse»— aplicada a los agentes.

**Lo que cuesta:** un paso extra en cada hallazgo, incluidos los ciertos. Se paga
igual, porque distinguirlos antes de verificar es exactamente lo imposible.

---

## D-070 — Ninguna comprobación de un auditor puede ser cierta por construcción · 2026-08-02

**Encontrado arreglando `#319`**, y es la razón de que 52 páginas estuvieran mal
durante semanas con el gate en verde.

`audits/jsonld-valid.mjs` comprobaba que `inLanguage` coincidiera con el locale
de la ruta. La comprobación era correcta y el auditor estaba bien escrito. El
problema es que `Base.astro` escribía `inLanguage: locale` **sin condición**:
comparar ese valor con el locale de la ruta era comparar `locale` con `locale`.
La aserción no podía fallar nunca. Verde garantizado, para siempre, sin importar
lo que dijera la página.

Mientras tanto la misma página declaraba su titular inglés como francés en el
nodo `WebPage` y como inglés en el `ScholarlyArticle` — porque **ese** nodo sí
calculaba el idioma de verdad.

**La decisión:** al escribir un auditor, la pregunta no es «¿esta regla es
correcta?» sino **«¿existe alguna entrada que la haga fallar?»**. Si el código
vigilado escribe el valor esperado por construcción, la comprobación es
decorativa. La forma de arreglarla suele ser comparar **dos fuentes
independientes** en vez de una fuente contra sí misma: aquí, los nodos de la
página entre ellos, que solo pueden coincidir si el layout sabe de verdad en qué
idioma está el texto.

**Cómo se demuestra:** el control negativo de `pruebas-auditores.mjs` no basta si
el caso de prueba se escribe a mano. Aquí se degradó el HTML **ya construido**
—el archivo real de `/fr-FR/recherche/mc-05-…/`— y se vio al auditor bloquear con
el nombre de esa página. Una prueba que nunca se vio fallar no prueba nada
(CLAUDE.md § Git, regla 3), y una que solo puede pasar tampoco.

---

## D-071 — Se formatea con el separador canónico y se lee cualquiera · 2026-08-02

**Encontrado arreglando `#321`/`#322`.** El auditor de la flota lo cazó antes que
un usuario, y solo porque la prueba de ida y vuelta probaba los siete locales.

`fr-FR` agrupa los millares con **espacio fino insecable** (U+202F) y `pt-PT` con
**punto**; los dos estaban escritos con un espacio normal. No es cosmética: con un
espacio normal el navegador puede partir «157 000» en dos líneas —«157» al final
de una y «000» al principio de la siguiente— y eso es un número roto en un
producto de matemáticas.

Al corregir la tabla, `parsear("1 543,2", "fr-FR")` empezó a devolver `null`:
comparaba el separador con `" "` literal y U+202F no es `" "`. **Nadie teclea
U+202F.** Un francés que escribe un número con millares escribe un espacio
normal.

**La decisión, que vale para todo dato de entrada del producto:**

- **Al escribir**, el canónico y solo el canónico. El formateador no negocia.
- **Al leer**, cualquier forma razonable que una persona real produzca con su
  teclado. Rechazar la entrada de alguien porque usó el espacio que su teclado
  produce es castigarle por no ser Unicode.

Lo mismo aplica al apóstrofo: se escribe `’` y se acepta `'`.

**Lo que cuesta:** el lector tiene que ser más permisivo que el escritor, así que
las dos mitades no son simétricas y no se pueden derivar la una de la otra. Es
más código, y es el correcto.

---

## D-072 — El banco de ítems de primaria vive en D1, no en código · 2026-08-02

**Decisión del dueño**, tomada al abrir F5c y **en contra de mi recomendación**.
Queda escrito qué compra y qué cuesta, porque las dos cosas son reales.

**Lo que compra:** el banco deja de ser código. Un ítem se corrige sin
desplegar, y quien autora contenido no necesita TypeScript ni esperar un build.
Para un producto cuyo cuello de botella declarado es el contenido (`mc-40`), eso
no es un detalle: es la diferencia entre corregir un enunciado en un minuto o en
un ciclo de despliegue.

**Lo que cuesta:** una migración, un camino de lectura nuevo en el motor, y **un
banco híbrido** — KINDER seguirá en `banco-kinder.ts` (código) y PRIMARIA en D1.
Dos fuentes para el mismo tipo de ítem es deuda desde el día uno. La forma de
que no se pudra es que KINDER migre después; si en seis meses sigue siendo la
excepción, la excepción se volvió la regla.

**Lo que NO cambia, y conviene decirlo porque se parece:** los **intentos**
siguen fuera de D1 (`mc-32` riesgo #1, auditor `no-attempts-in-d1`). Un banco de
ítems es lectura alta y escritura casi nula; un intento es exactamente lo
contrario, y esa asimetría es la razón entera de aquella decisión. Que el banco
entre a D1 no abre la puerta a que entren los intentos.

---

## D-073 — Primaria antes que kinder, y por qué no es rendirse · 2026-08-02

**Decisión del dueño** tras jugar los primeros retos reales en su teléfono y
encontrar seis fallos en quince minutos.

Su razón fue «kinder requiere mucha atención». La investigación la respalda más
de lo que él planteó, y por dos caminos independientes:

**1. Kinder está bloqueado por F6, no retrasado.** `mc-20` no lista el audio
como mejora: lista su ausencia como **antipatrón** — *«text-only prompts or
instructions with no audio equivalent — unusable by the age band»*. Y `mc-06`
subraya que el Number Knowledge Test de Number Worlds es **oral**, «algo
directamente relevante para una app pre-lectora». Sin voz, kinder no es un
producto peor: es un producto que su usuario no puede usar. `mc-21` no dice nada
equivalente de los 7-11.

**2. De los cinco formatos, exactamente uno funciona hoy — y es el único que
primaria necesita.** Medido sobre producción: `flash` no dibuja el estímulo,
`toca_para_contar` dibuja patos diga lo que diga el enunciado, `arma_el_numero`
sale como un borrón, `cual_sobra` ofrece `casilla3` como respuesta. El que
funciona es `toca_la_respuesta`, que es leer y tocar un número — exactamente lo
que primaria pide.

**Lo que esta decisión NO dice:** que kinder se abandone. #345, #347 y #349
siguen abiertos y siguen siendo necesarios. Lo que cambia es que el producto
deja de estar bloqueado detrás de ellos.

**Y un hallazgo que sale de aquí:** `mc-36` describe *Which One Doesn't Belong*
como «sin respuesta única, **discurso obligatorio**» — el valor está en que el
niño **explique**. La línea roja #3 prohíbe el texto libre de un niño. Ese
formato **no encaja en este producto tal como está concebido**, y eso explica
por qué `cual_sobra` salió deformado: no es solo mala implementación, es un
molde que no cabe. Queda como pregunta abierta para el dueño.

---

## D-074 — En bandas avanzadas Larry explica el PROCEDIMIENTO, no solo el resultado · 2026-08-02

**Matiz del dueño al confirmar D-004**, al abrir F6:

> «Solo un matiz para ejercicios más complejos donde se pueda: también debe ver
> el procedimiento y explicar por qué está bien o mal. No solo el resultado.
> Estoy pensando en cosas avanzadas.»

Es correcto y hay respaldo: `mc-30` es exactamente sobre **datos de proceso** —
lo que alguien hizo para llegar a la respuesta, no solo a qué llegó— y de ahí
sale el dato que ya sostiene la línea roja #8 (cambiar una respuesta mejora la
calificación el 79% de las veces). Un producto que solo mira el resultado tira
esa información.

### La tensión con la línea roja #7, y cómo se resuelve

La línea roja #7 dice que **Larry nunca calcula**: recibe el veredicto ya
calculado y solo lo explica. Si Larry mira una derivación y dictamina si el paso
3 está bien, **está calculando**, y una alucinación se convierte en «tu
procedimiento está mal» dicho a alguien que lo tenía bien.

**La salida no es renunciar al matiz. Es que el veredicto deje de ser un
booleano.**

Hoy el motor devuelve *correcto / incorrecto*. Para esto tiene que devolver **un
juicio por paso**, calculado por el motor de forma determinista y del lado del
servidor. Larry recibe esa lista y la explica — exactamente el mismo contrato de
siempre, solo que con cinco juicios en vez de uno.

La regla operativa, para que no se erosione: **si un dictamen puede cambiar la
calificación, lo emite el motor. Si solo cambia las palabras, lo emite Larry.**

### Lo que esto abre y todavía no está decidido

1. **Cómo entra un procedimiento.** Tocar opciones no basta. `mc-23` cubre los
   métodos de entrada matemática por dispositivo (el tema de `mc-24` se fusionó
   ahí). Es trabajo de interfaz, no de Larry, y no existe.
2. **Qué es «un paso» en cada tema.** En una suma con reagrupación se puede
   verificar por columna. En una integral doble, «paso» no tiene una definición
   mecánica, y ahí el motor **no puede** emitir un juicio determinista.
3. **Dónde deja de aplicar.** Donde el motor no pueda juzgar el paso, Larry
   tampoco debe pronunciarse sobre él: describe, no dictamina. Es la misma
   frontera que D-035 pone para Pro — *«una explicación de cálculo tensorial
   incorrecta enseña error»*.

> **Enmendado el mismo día por el dueño: el disparador es la MATERIA, no la
> banda.** Le pregunté «¿desde qué banda?» y contestó que no es una pregunta de
> banda: aplica donde las matemáticas tienen procedimiento que explicar —
> topología, cálculo avanzado, la hipótesis de Riemann. Es mejor que lo que yo
> había escrito, y encaja con D-066, que ya separa lo que es del ÍTEM de lo que
> es del PERFIL. Un adulto haciendo aritmética no necesita esto; un adolescente
> haciendo una demostración sí.

### Lo que NO cambia

- **Los niños siguen sin escribir texto libre** (línea roja #3). Nada de esto
  toca una superficie de niño.
- **Larry sigue sin calcular.** Recibe más juicios, no la facultad de emitirlos.


---

## D-075 — La línea roja #1 se enmienda: cámara para un ADULTO, jamás para un menor · 2026-08-02

**Decisión del dueño, tomada explícitamente tras plantearle el conflicto.** Es
**la primera enmienda a una de las ocho líneas** desde que se escribieron.

### Qué cambia

La línea decía: *«Nunca cámara, nunca micrófono, nunca biometría, nunca
navegador bloqueado. A nadie, en ninguna banda, en ningún nivel de anti-trampa.»*
«A nadie, en ninguna banda» no dejaba hueco.

Ahora un **adulto verificado, en una banda avanzada**, puede subir la foto de su
propio trabajo —un pizarrón, una hoja— para que Larry lo lea y explique el
procedimiento (D-074). **La prohibición para menores no se toca.**

### Por qué se aceptó

El riesgo que la línea protege es de **menores**: `mc-25` es derecho de
privacidad infantil, y COPPA/GDPR-K son sobre ellos. Un adulto fotografiando su
propia derivación no está en ese supuesto. Y sin alguna entrada, D-074 —que
Larry explique el procedimiento— no se puede cumplir en las materias donde más
falta hace.

### El candado, que es la parte que importa

Una línea con excepción es una línea más débil. Por eso la excepción es estrecha
y está escrita para que no se generalice sola:

- **Solo cámara.** El micrófono, la biometría y el bloqueo del navegador siguen
  prohibidos para todos, sin excepción.
- **Solo bajo acción explícita de la persona.** Jamás una captura automática y
  jamás anti-trampa — ese uso es lo que la línea existe para impedir.
- **Jamás en una superficie donde pueda haber un menor.**
- **La respuesta por defecto a ampliarla es no.**

### Lo que esto abre y todavía no está decidido

1. **Almacenamiento de imágenes de usuario**, que hoy no existe: dónde viven,
   cuánto, y qué borra el borrado de cuenta (D-013 exige que borrar borre en los
   cuatro sistemas).
2. **Qué pasa si en la foto sale un menor.** Un adulto puede fotografiar la
   libreta de su hijo. La línea dice «jamás en una superficie donde pueda haber
   un menor», y eso hay que hacerlo cumplir, no solo escribirlo.
3. **Los auditores que hoy bloquean `getUserMedia`** tienen que aprender a
   distinguir el camino permitido del prohibido — sin que la excepción se
   convierta en un agujero.

### La alternativa que NO necesita esta enmienda

El **pizarrón en línea propio** —entrada nuestra, sin cámara— resuelve el mismo
problema sin tocar ninguna línea. El dueño quiere los dos; se construye primero
el pizarrón, y la foto después, con su candado.

---

## D-076 — Zaraz se queda: D-037 pasa de «cero terceros» a «cero terceros en el CÓDIGO» · 2026-08-02

**Decisión del dueño.** Zaraz está encendido en la zona de Cloudflare y él no
puede apagarlo. Medido, dos veces, el mismo día:

    curl -s -o /dev/null -w '%{http_code}' https://math.kilowatto.com/cdn-cgi/zaraz/s.js
    → 400   «Invalid Zaraz parameters»

**400, no 404: el endpoint existe.**

### Qué cambia D-037

Decía **cero terceros**. Pasa a decir **cero terceros en el código del
producto** — que es lo que este repositorio puede garantizar y lo que sus
auditores comprueban de verdad. La inyección de la zona queda **declarada como
excepción conocida**, no como algo que se cumple.

La razón de escribirlo y no dejarlo en un issue: **una decisión que el producto
contradice envenena a las demás.** Quien abra `decisions.md` dentro de un año no
tendría forma de saber cuáles se cumplen y cuáles son aspiración.

### La exposición que esto deja abierta, dicha una vez

Zaraz pone un identificador en **las mismas páginas donde un padre teclea su
correo** — las tres puertas de registro y `/entrar/`. En la UE eso normalmente
exige consentimiento previo, y hoy no hay banner. No es una objeción a la
decisión: es exposición real, y queda escrita para que se decida a sabiendas
cuando el tráfico lo justifique.

### Lo que sí se arregló, porque era peor que el propio Zaraz

`audits/live.mjs` afirmaba **«sin beacon inyectado por la zona (D-037)»** y
pasaba en verde. Buscaba cadenas en el HTML servido, y **Zaraz se inyecta en el
borde y no deja ninguna**. Un auditor que no puede ver lo que vigila y aun así
pasa da confianza falsa — es lo que D-070 llama una aserción cierta por
construcción, con otra cara. Ahora pregunta al endpoint e informa el estado real.

---

## D-077 — La voz de Larry sale con 3 locales de 7, y la pantalla lo dice · 2026-08-02

**Decisión del dueño**, tomada sobre cuatro alternativas y **en contra de mi
recomendación**, que era sacar la voz de F6 y cerrar la fase con 5 de 6.

Workers AI **no tiene voz verificada para `fr-FR`, `pt-BR`, `pt-PT` ni
`de-DE`** — cuatro de los siete. D-035 acota el proyecto a Cloudflare, así que
generar la voz fuera exigiría enmendarla. El dueño eligió **salir con los tres
que sí cubre** en vez de esperar.

### La condición que añado, y no es opcional

Si la voz sale en 3 de 7, **la pantalla tiene que decirlo en los otros cuatro.**
Un niño alemán que se encuentra silencio sin explicación no vive un producto
incompleto: vive uno roto. `mc-20` es explícito en que un pre-lector no puede
usar una interfaz sin equivalente hablado — así que en esos cuatro locales,
kinder no debe presentarse como disponible y callarse, sino decir que todavía no
habla ese idioma.

Sin esa parte, esta decisión sirve a tres niños y deja a cuatro sin salida.

### Lo que esto NO resuelve

- **Kinder sigue bloqueado en 4 de 7 locales.** D-073 ya lo había aplazado, así
  que hoy no cambia nada que se vea; cambiará el día que kinder se retome.
- **Nadie ha escuchado todavía ninguna voz.** Hace falta un revisor pedagógico
  por locale que **oiga** los clips antes de que un niño los oiga. Que existan
  tres voces técnicamente disponibles no es que tres voces estén aprobadas.

---

## D-078 — La voz de Larry sale con los 7 locales, con `speechSynthesis` · 2026-08-02

**Enmienda D-077, tomada el mismo día, sobre evidencia que estaba en nuestra
propia investigación y que yo no había puesto sobre la mesa cuando el dueño
decidió.** D-077 no se equivocó con lo que sabía: se decidió sobre una
alternativa incompleta.

### Lo que faltaba en D-077

D-077 planteó el problema como «Workers AI cubre 3 de 7 idiomas», y las cuatro
alternativas que le ofrecí al dueño eran todas variantes de **generar audio en
el servidor**. `mc-42` §7 documenta un camino que no estaba en ninguna:

| API | iOS Safari | Chrome / Edge / Firefox |
|---|---|---|
| `speechSynthesis` | **Soportado desde Safari 7** | Chrome 33+, Edge 14+, Firefox 49+ |

La voz del sistema operativo lee texto generado, **en los siete idiomas, gratis,
sin red, sin cuota y sin tope de gasto**. No hay clip que almacenar ni pipeline
que construir.

Que esa fila estuviera en la investigación desde el 31 de julio y no en las
alternativas es un defecto mío, no del dueño. Es exactamente el patrón que
`CLAUDE.md` manda evitar: investigar primero, y **preguntar con las alternativas
explicadas**. Una alternativa que no se explica es una alternativa que no
existe.

### Lo que se decide

**La voz sale con los siete locales, con `speechSynthesis`.**

### Lo que esto cuesta, y es real

`mc-42` §4 lo dice sin adornos: **la calidad y el inventario de voces son
propiedad del sistema operativo, no del navegador.** Un Android de gama baja sin
paquete de voz en portugués cae a una voz peor **en silencio**, y no existe API
web para forzar la instalación de una. Y el mercado objetivo de este producto es
justamente Android de gama baja (`mc-47` §5).

O sea: el problema de cobertura **no desaparece, cambia de eje**. D-077 lo tenía
por idioma —cuatro idiomas mudos para todo el mundo—; aquí es por aparato —todos
los idiomas hablan en casi todos los aparatos, y en algunos concretos suenan
peor o no hay voz.

Ese eje es mejor por tres razones medibles, no por gusto:

1. **Nadie queda mudo por su idioma.** Un niño alemán con voz alemana instalada
   —el caso normal, porque la instala el propio sistema— oye a Larry hoy.
2. **Se puede detectar en el aparato**, que es donde ocurre. `getVoices()`
   filtrado por idioma dice la verdad sobre ESE teléfono, y la pantalla puede
   decirlo. La cobertura de Workers AI no se podía detectar: se sabía o no se
   sabía.
3. **Cero gasto y cero red.** Sin tope por perfil, sin latencia, y funciona en
   avión. `mc-42` §4 lo llama «offline-capable once the OS voice exists».

### La condición de D-077 no se cae: cambia de sitio

D-077 exigía que **la pantalla dijera** dónde no hay voz, y eso sigue en pie
palabra por palabra. Lo que cambia es cuándo se evalúa: ya no es una lista fija
de cuatro locales horneada en el build, es una comprobación **en el aparato, en
el momento**. Si `getVoices()` no devuelve ninguna voz del idioma de la página,
el botón de escuchar no se ofrece y la pantalla lo dice. Un botón que no suena
es peor que ningún botón.

### Las líneas rojas que esto toca, y cómo queda cada una

- **Línea roja #1 — nunca micrófono para un menor.** `speechSynthesis` es
  **salida**. `SpeechRecognition` —la API de entrada, que sí es micrófono— no
  entra en este producto y un auditor determinista lo vigila por nombre, junto
  con `getUserMedia`. La enmienda de hoy (D-075) abrió la cámara para un ADULTO
  verificado y nada más; el micrófono sigue cerrado para todos.
- **Línea roja #7 — Larry nunca avergüenza.** La voz **no redacta nada**: lee en
  voz alta exactamente el texto que el servidor ya sirvió y que ya está en
  pantalla. No hay una copia hablada distinta de la escrita que pudiera decir
  algo que la escrita no dice, y por tanto tampoco hay una superficie nueva que
  auditar por tono.

### Lo que esto NO resuelve

- **Nadie ha escuchado todavía ninguna voz** — esto no cambia con D-077. Sigue
  haciendo falta que una persona por locale **oiga** cómo suena el enunciado
  matemático real. `mc-34` es la razón: «einundzwanzig» y «quatre-vingt-dix» son
  problemas de autoría, y una voz de sistema que lea «21» mal en alemán no la
  arregla ningún prompt.
- **Kinder sigue aplazado** (D-073). Esto quita el bloqueo técnico que `mc-20`
  imponía —texto sin equivalente hablado es antipatrón para un pre-lector—, no
  reordena la fase.
- **Workers AI no se descarta**, se aplaza. El día que la voz del sistema no
  alcance para una superficie concreta, `mc-42` §4 ya tiene escrita la
  recomendación: **híbrido** — clips grabados para el vocabulario fijo y corto,
  voz del sistema para el texto generado.

---

## D-079 — El tope de 2 escudos es POR RACHA, no cada siete días · 2026-08-02

**Decisión del dueño**, sobre el hueco 22.1 de `docs/dudas.md` que salió de
construir el motor de racha.

`ganarEscudos` implementaba la fórmula literal de #203 —`min(2, floor(racha /
7))`— comparada contra el banco disponible. Da los tres vectores que el issue
escribe (13→1, 14→2, 21 con banco lleno→2) y **abre un hueco que el issue no
menciona**: el banco se repone al crecer la racha. Un niño que gasta un escudo
con racha 15 vuelve a tener 2 al llegar a 21, porque `floor(21/7) = 3` capado a
2. Es decir: **pasado el día 14, saltarse un día de cada siete no costaba
prácticamente nada.**

Una red de protección que se repone para siempre deja de ser una red y se
vuelve un permiso permanente. `mc-16` documenta que la racha es la palanca
fuerte de retención de Duolingo precisamente porque **cuesta algo**; una que no
cuesta nada no sostiene el hábito que dice sostener.

### Lo que se decide

**El tope de 2 es por racha.** Se comparan los escudos ya ganados en la racha
actual, no los que quedan en el banco, así que gastar uno no crea espacio para
otro. Cuando la racha se rompe y vuelve a 1, el cupo vuelve a 0 y se renueva con
la racha nueva — que es justo cuando la protección vuelve a tener sentido.

Cuesta una columna, `shields_earned_this_streak`, y dos líneas de lógica.

### Lo que NO cambia, y hay que decirlo

- **La línea roja #6 no se toca.** El límite de pantalla nunca gasta un escudo
  porque **nunca rompe la racha**: no llega a ese camino. El `motivo` del día no
  entra en la aritmética, y `audits/racha-limite-no-rompe.mjs` lo mide
  ejecutando el motor sobre 1 620 estados.
- **La protección de racha sigue sin venderse jamás** (D-014, línea roja #6).
  `ganarEscudos` es función pura de la racha y del cupo, y de nada más:
  `audits/racha-nunca-se-vende.mjs` bloquea el commit que le agregue un
  parámetro de pago, cupón, SKU o transacción.
- **22.2 se queda como está**: los escudos que no alcanzan a salvar la racha
  **no se gastan**. `mc-17` §5 pide que un día saltado sencillamente no avance
  el contador, sin castigo añadido, y quemar escudos que no salvaron nada es
  pérdida sobre pérdida.
- **22.3 se queda como está**: un día que llega fuera de orden es un no-op
  documentado.

### Por qué se corrigió la migración en su sitio y no con otra encadenada

`migrations/0007_racha_y_xp.sql` **no se había aplicado a ninguna base**;
comprobado contra `math-challenge-db` remota antes de tocarla — `child_streak` y
`xp_totals` no existían. Editar una migración ya aplicada sería otra cosa y
exigiría `0008`.

---

## D-080 — El compañero es Larry con accesorios, no una mascota nueva · 2026-08-02

**Decisión del dueño.** #235 estaba bloqueado por escrito esperando esto.

Larry ya existe, tiene canon (D-004) y continuidad de avatar generada en
Recraft. En el mapa de progreso camina en KINDER, aparece en cada nodo alcanzado
en PRIMARIA y SECUNDARIA, y está bajo demanda de SERIO en adelante (`mc-43` §9).
**Los cosméticos son accesorios suyos**, no de un personaje aparte.

### Lo que esto compra

**Sin vida, sin hambre, sin decaimiento.** `mc-43` §6 documenta el riesgo
Tamagotchi —un compañero que se «muere» si no vuelves convierte el juego en una
obligación con culpa—, y aquí desaparece **por construcción y no por regla**:
Larry no tiene estado que decaiga, así que no hay nada que alguien pueda
encender por accidente dentro de un año.

Y cero arte nuevo: una mascota aparte habría exigido canon propio, generación en
Recraft y continuidad que mantener en siete locales.

### Lo que esto obliga

**#257 se vuelve más importante, no menos**: Larry nunca comenta el avatar ni
los cosméticos de un niño. Si el tutor y el compañero son la misma criatura, la
frontera entre «te explico tu error» y «qué bonito tu sombrero» tiene que ser
explícita — y el que explica es el mismo que lleva puestos los accesorios.

---

## D-081 — La escalera de visibilidad social sale completa · 2026-08-02

**Decisión del dueño**, sobre tres alternativas y **en contra de mi
recomendación**, que era construir el motor entero y encenderlo solo para
adultos hasta ver a un niño real usarlo.

Ligas de ~30, tablero global y duelo asíncrono salen con la escalera que #243 ya
especifica:

- **KINDER**: opt-in del padre, **default apagado**. Si se activa, la posición
  se muestra **en tercios**, nunca el número exacto.
- **PRIMARIA en adelante**: default encendido, posición numérica.
- **Duelo**: banda distinta de KINDER, edad ≥8 desde `birth_year` (D-053),
  opt-in, default apagado en `child_profile`.
- **Siempre alias generado**, jamás nombre (línea roja #2, `packages/motor/src/alias.ts`).

### Mi objeción, escrita porque el dueño decidió sobre ella y no a pesar de ella

`mc-10` mide que **la presión de rendimiento empeora el desempeño en
matemáticas**, y nadie de los dos ha visto todavía a un niño real usar una liga
en este producto. La escalera de `mc-18` es buena teoría; lo que no existe es la
observación.

El dueño decidió salir con ella completa. Queda escrito para que el día que se
mida algo distinto se pueda volver aquí y ver qué se sabía.

### Las condiciones que añado, y no son opcionales

1. **La liga nunca puede quitar nada.** Descender no borra XP, no quita
   escudos, no toca la racha y no cambia el mapa. #225 ya separa XP de puntos de
   tablero; esto lo extiende: **ningún resultado social modifica un contador de
   aprendizaje.**
2. **Sin presencia en vivo.** El duelo es asíncrono con ventana de 48 h y no
   revela si el otro está conectado — que ya es lo que #244 especifica, y es lo
   que impide que un niño se quede esperando.
3. **Sin lenguaje de pérdida en ninguna banda.** Es la misma regla que la racha
   (D-014) y le toca a `racha-lexico` extendido, no a la buena voluntad de quien
   escriba el texto.

---

## D-091 — El día de racha se cuenta en el PRIMER ítem contestado, no al cerrar el reto · 2026-08-03

**Decisión tomada al cablear F7** (#201, #206, #192), y es la que hace que la
línea roja #6 no dependa de que nadie escriba mal una rama.

D-014 dice, textual: «si el límite de pantalla corta la sesión, **la racha del
día se da por cumplida**». La lectura obvia es que quien cierre el reto llame a
`registrarDia` con el motivo del corte, y que haya dos caminos. Dos caminos es
justo lo que se puede escribir mal, y `audits/racha-limite-no-rompe.mjs` ya
avisaba de su propio hueco: *«que la ruta de cierre llame a `registrarDia`
SIEMPRE… aquí se caza el reinicio explícito, no la omisión silenciosa»*.

**Lo que se decide:** `/api/jugar?accion=responder` registra el día en **cada
respuesta que cuenta**, no al final. `registrarDia` ya es idempotente —devuelve
el mismo objeto si el día está registrado— así que diez ítems en una tarde son
una escritura, no diez.

La consecuencia es la que importa: cuando F8 construya el corte por límite de
pantalla, **el día llevará minutos cumplido**. No hay camino por el que el
límite rompa la racha, así que tampoco hay rama que auditar. El `motivo` sigue
viajando como parámetro para que F8 se enchufe sin tocar el cable, y sigue sin
entrar en la aritmética.

### Y la racha NO se repinta en vivo; el XP sí

En la pantalla del reto, el número de días se pinta al cargar y no se vuelve a
tocar, aunque el ítem recién contestado sea el que estrena el día. Es literal de
#206: *ningún cambio de racha produce un push ni un modal — se ve el número
nuevo la próxima vez que se abre la pantalla, sin evento que lo señale*. Por eso
`Racha.astro` no lleva ni una línea de script, y por eso la pantalla del reto no
le pone una por fuera.

El XP sí se actualiza en cada respuesta, sin animación, sin sonido y sin «+10»
flotando. La diferencia no es un descuido: el XP es el eje de progreso personal
que sube con cada ítem (D-055), y un eje que no se mueve es un eje invisible.
`mc-17` §11 mide que la recompensa **informativa** no daña la motivación
intrínseca y la **controladora** sí, con efecto más severo en niños que en
universitarios: un número que sube es lo primero, una celebración que interrumpe
es lo segundo.

### Lo que esto NO decide

- **Si en KINDER se enseña la racha.** Hoy no se enseña —se registra en D1 y no
  se pinta—, y la pregunta está abierta en `docs/dudas.md` §23.1 con las tres
  salidas escritas. #205 pide el camino de Larry en la Sabana, sin número, y ese
  componente no existe.
- **El bono de finalización de reto.** `XP_POR_TIPO.reto_completado` sigue sin
  otorgarse porque **nadie observa el final de un reto**: «Ya terminé» es un
  enlace que navega. `docs/dudas.md` §23.2.

**Investigación relacionada:** `mc-17` §83 y §11, `mc-16`.
## D-092 — El precio de una misión se publica POR TIPO, y ninguna misión se sortea ni se cobra · 2026-08-03

**Decisión:** las misiones diarias salen con un catálogo cerrado de diez tipos,
un precio en XP **por tipo** publicado en un solo sitio, y selección
**determinista desde `(perfil, día)`**. Implementa #211 (#212, #213, #214, #215,
#216, #217, #218, #219, #221, #228) en `packages/motor/src/misiones.ts`, un
módulo puro con el mismo contrato que `racha.ts`.

### 1. La tabla de XP es por TIPO, y `mision_diaria` se retira

`XP_POR_TIPO` en `packages/motor/src/xp.ts` tenía un solo renglón,
`mision_diaria: 20`, escrito cuando F7 todavía no tenía catálogo. Ahora lo tiene,
y los diez tipos no valen lo mismo: `dominio` —tres correctas seguidas en algo
que casi se domina— no cuesta lo que `descubre` —jugar un modo que no jugaste
esta semana—.

Con un solo número había **dos respuestas posibles** a «¿cuánto vale una misión
diaria?»: la genérica y la del tipo. Eso es exactamente lo que la línea roja #5
no admite —el jugador tiene que poder saber **de antemano** cuánto vale cada
cosa— y, sobre todo, es un par de números que va a divergir: nadie los mantiene
sincronizados porque nadie sabe que son el mismo hecho escrito dos veces.

| Tipo | XP `[criterio propio]` | Eje que mide |
|---|---|---|
| `volumen` | 15 | cantidad (el único sin precondición que no rota) |
| `variedad` | 15 | amplitud de **tema** |
| `repaso` | 20 | adaptativo (vencimiento, no debilidad) |
| `dominio` | 25 | adaptativo |
| `problema` | 20 | modo PROBLEMA (D-018, sin reloj) |
| `fluidez` | 15 | modo FLUIDEZ (D-018, solo temas dominados) |
| `precision` | 15 | calidad |
| `descubre` | 10 | amplitud de **modo** |
| `duelo` | 20 | liga, individual |
| `meta_de_liga` | 10 | liga, cooperativo |
| bono por las tres | +15 | suma directa, jamás un cofre |

La tabla vive **solo** en `xp.ts`. `misiones.ts` la **deriva** con
`xpDeTipo(claveDeXp(tipo))` en vez de escribir los números otra vez, y
`audits/mision-recompensa-deterministica.mjs` cruza los dos archivos en las dos
direcciones: cada tipo del catálogo tiene su clave publicada, y ninguna clave
`mision_*` sobra.

**`docs/dudas.md` §22.5 queda superada por esta entrada.** Esa sección documenta
`mision_diaria: 20` y `mision_semanal: 100` como los dos números sin fuente de la
tabla de XP; el primero ya no existe. Los once que lo sustituyen siguen siendo
`[criterio propio]` con la misma honestidad que D-016 usa para su tabla de
minutos — lo que sí sostiene `mc-16` (implicación de diseño 7) es la FORMA, no
las cifras. `mision_semanal` se queda publicado y sin usar: las misiones
semanales están diferidas a propósito, porque complicarían la lógica de «día» con
dos horizontes a la vez y D-014 solo nombra las **diarias**.

### 2. Ninguna recompensa de misión es aleatoria — ni de pago ni gratis

**Es más estricto que la letra de D-014, y se documenta así en vez de fingir que
D-014 ya lo decía.** La columna «No» de D-014 dice literalmente *«recompensas
aleatorias de **pago**»*. Tres cosas cierran esa rendija:

1. La columna «Sí» exige **cosméticos ganados, deterministas** — no dice
   «deterministas si se cobran».
2. `mc-17` (implicación de diseño 3) y `mc-43` (hallazgo 5) son explícitos en que
   el mecanismo dañino —el refuerzo de razón variable— **no necesita dinero para
   funcionar sobre un niño**.
3. Bélgica y Países Bajos declararon juego ilegal a las cajas de botín en 2018
   por ser **aleatorias**, no por ser de pago.

Y la otra mitad la cierra la línea roja #4: **nunca se cobra por dejar que un
niño practique**, así que ninguna misión puede estar detrás de un pago. La
migración `0009_misiones_diarias.sql` no tiene columna de precio, moneda, cupón,
plan, probabilidad ni rareza — no es que estén vacías: no existen.

### 3. Selección determinista, nunca `Math.random()`

`semillaDelDia()` es un FNV-1a de 32 bits sobre `(childProfileId, fechaLocal)`.
No es preferencia de estilo:

- Es **reproducible**: se puede contestar «¿por qué le tocó esta misión a mi
  hijo?» sin guardar una semilla aparte.
- `Math.random()` y `Date.now()` **no existen** en varios de nuestros entornos de
  prueba.
- El día es un día **local del hogar** y llega ya calculado por
  `racha.ts::diaEfectivo()`, que sigue siendo la única puerta entre un instante y
  un día. Un reloj dentro de este módulo sería entropía con otro nombre.

### 4. Tres desviaciones conscientes del diseño de `docs/planes/f7-juego.md`

**a. `duelo` exige `dueloOptIn` Y `enLiga`.** El diseño solo pedía el opt-in
(D-018: opcional, 8+). Se añade la liga porque **un duelo sin liga es contra
nadie**, y #217 dice que una misión que no se puede cumplir es peor que no tener
misión. Un perfil sin opt-in no la ve de ninguna forma —tampoco «bloqueada,
actívala para intentarlo» (#218)—: enseñarla bloqueada es un empujón hacia una
función que D-018 ya decidió opcional, y roza el *nagging* que `mc-17` nombra por
su nombre.

**b. `MISIONES_POR_DIA = 3`, un solo número para todas las bandas, SERIO
incluida.** `[criterio propio, la evidencia es débil en las dos direcciones]`. No
existe un estudio de HCI con la cifra. Duolingo usa 3, corroborado en fuentes
secundarias pero sin post oficial. Cowan (2010) fija ~4±1 como techo de memoria
de trabajo **adulta**, con los niños de 7-11 todavía **subiendo** hacia ese techo.
Queda como pregunta abierta al dueño en `docs/dudas.md`.

**c. `EstadoDeMision` no tiene `completed_at`.** Un sello de tiempo obligaría a
este módulo a leer el reloj. `completed` es 0 o 1, y el `updated_at` de la fila lo
pone quien escribe, que sí sabe qué hora es.

### 5. KINDER no recibe nada, y eso es la decisión

En KINDER «misión diaria» no es una función nueva: es una etiqueta interna sobre
el reto HISTORIA del día en la Sabana (D-019), que F5/F6 construyen de todas
formas. `elegirMisionesDelDia()` devuelve una lista **vacía** y
`tieneMenuDeMisiones()` existe para que nadie lo deduzca de un arreglo vacío. **No
cuesta ni una cadena de audio nueva**, y kinder sigue aplazado (D-073), así que
esto es la forma del hueco y no una promesa de pantalla.

### 6. Los cuatro auditores, y el que se cazó a sí mismo

- `mision-recompensa-deterministica` — sin azar, sin reloj, sin precio, sin
  metáfora de cofre; cruza el catálogo del módulo contra el `CHECK` del esquema y
  contra la tabla publicada de `xp.ts`; y **ejecuta** el motor 360 tuplas × 64
  repeticiones.
- `mision-slot-nunca-vacio` — 10 080 estados de aprendiz: siempre tres misiones,
  siempre distintas, siempre cumplibles.
- `misiones-sin-do-ajeno` — el contrato con F4 y con la liga es de solo lectura y
  las dos listas blancas no crecen.
- `mision-silenciosa` — ninguna superficie de reto activo importa ni nombra el
  motor de misiones (#221, `mc-42` §3).

**Y una lección que esta entrada existe para dejar escrita:
`mision-slot-nunca-vacio` aprobaba su propia violación.** Juzgaba la salida con
`definicionDe(t).elegible` —la MISMA función que el motor usa para elegir—, así
que ablandar una precondición ablandaba a la vez la regla y su guardián: el caso
«`fluidez` se asigna a un niño que no domina nada» pasaba **en verde**. Se
descubrió **escribiendo el control negativo, no leyendo el código**, que es
exactamente por qué D-070 existe. El arreglo es que el auditor lleva la tabla de
precondiciones de §3 del diseño **reescrita a mano**: dos fuentes independientes,
como `cosmeticos-deterministas` cruza el enum del módulo contra el CHECK del
esquema.

### Lo que esta decisión NO decide

No hay **ninguna interfaz** de misión: ni pantalla, ni componente, ni texto en
los siete locales (#220, ~210 cadenas, autoradas por locale y diferidas). No hay
Durable Object de misiones —el módulo es puro y `mission_daily_summary` basta— y
por tanto **cero recursos nuevos de Cloudflare**. No hay ninguna ruta que llame
al motor todavía. Y no decide nada del mecanismo interno de ligas ni de DUELO:
F7 · Misiones solo **lee** su estado por `ResumenDeLigaParaMisiones`.
## D-082 — El registro es uno solo: siempre aterriza en modo solo; familia y escuela se activan después, nunca se eligen en la puerta · 2026-08-02

**Decisión del dueño**, corrigiendo una queja repetida más de una vez: *"Sigues
insistiendo en el tema de padres e hijos… ¿por qué no puedo hacerlo sin hijos,
como adulto?"* — y la respuesta encontrada al auditar los documentos es que
**hoy sí puede**, pero el diseño lo trata como una de tres opciones simétricas
en la puerta de entrada, no como el estado natural de cualquier cuenta nueva.
Eso es lo que se corrige aquí.

**Enmienda explícita a D-026.** D-026 fijó *"las tres puertas de entrada —
adulto, papá, maestro— se registran con correo y contraseña. Nada más."* Esa
mitad no cambia: el registro sigue siendo exactamente 2 campos, sin carrusel,
sin fricción añadida (`mc-45`). Lo que cambia es que **deja de haber tres
puertas simétricas**. Hay una sola alta, y lo que hoy son "Puerta B" (papá) y
"Puerta C" (maestro) pasan de ser una elección en `/app/join?as=` a ser
**acciones que el propio adulto toma después, desde dentro de la app**.

### El modelo nuevo

1. **Toda cuenta nueva nace con `is_learner = 1`.** No se pregunta "¿para
   quién es esto?" en el registro — se pregunta implícitamente al aterrizar en
   `/app/home`: la pantalla del aprendiz solo (`Puerta A` original) es ahora
   **la pantalla de aterrizaje de cualquiera**, con dos acciones visibles y
   opcionales: "Agregar un hijo" y "Crear un salón".
2. **"Agregar un hijo" activa `esFamilia`** (D-065 ya define esto como
   `tiene ≥1 hijo`, no como un tipo de cuenta) — dispara el flujo
   `setup/child` **sin ningún cambio interno**: mismo formulario de año/mes,
   mismos defaults saltables, misma marca contextual. Lo único que cambia es
   *cuándo* se ofrece: después de la cuenta, no en la puerta.
3. **"Crear un salón" activa la verificación de identidad** (`owner/identity`)
   **sin ningún cambio interno** — y de hecho ya seguía este principio para el
   maestro: `f2-cuentas-onboarding.md` §3.3 ya decía *"la fricción de identidad
   va antes de crear un salón, no antes de registrarse"* (D-011, `mc-45`
   implicación 7). Esta decisión **extiende el mismo principio al papá**: la
   fricción de "agregar un hijo" también va después de la cuenta, no en la
   puerta — es la misma lógica aplicada a la otra mitad del producto.
4. **No son excluyentes, y eso ya estaba escrito.** D-065 ya documentó que
   `esFamilia` y `esSolo` "no son excluyentes — la migración ya documentaba
   que una persona puede ser las dos cosas (cita al propio dueño como
   ejemplo)". Esta decisión no inventa esa regla, la usa: por eso "agregar un
   hijo" es una activación, no una migración de un modo a otro.
5. **`signup_intent` deja de ser una bifurcación de producto y pasa a ser
   dato de embudo.** La columna (migración `0003`, `CHECK IN ('learner',
   'parent', 'teacher')`) ya llevaba el comentario correcto desde que se
   escribió: *"NO ES UN ROL... esto solo sirve para aterrizar al usuario y
   para leer el embudo"* — hoy decide a qué UI aterriza; con esta decisión dejará de decidir nada, y sirve solo para saber por qué CTA de marketing entró alguien (útil para medir qué mensaje convierte, D-037).

### Qué implica en código — no solo en documentos

Verificado que esto **no es un cambio de documentación únicamente**:
`apps/web/src/components/paginas/Registro.astro`,
`apps/web/src/pages/api/registro.ts`, `apps/web/src/components/app/DoorPicker.astro`
y la ruta `join.astro` implementan hoy el modelo de tres puertas simétricas en
código real, ya desplegado. Esta decisión fija el **destino**, no la
implementación: el trabajo de ingeniería (retirar el `DoorPicker` de la
primera pantalla, mover "agregar hijo"/"crear salón" a acciones de
`/app/home`, dejar `signup_intent` como campo de solo lectura para analítica)
es una issue de F2 pendiente de abrirse, no algo que esta entrada de
`decisions.md` ejecute por sí sola. **Ejecutada por la issue de F2 #390.**

### Qué NO cambia

- El registro sigue siendo 2 campos, sin excepción (D-026).
- `child_profile` sigue sin pedir nombre real, correo, foto ni fecha exacta
  (D-013) — "agregar un hijo" es la misma pantalla de siempre, solo se
  alcanza distinto.
- La verificación de identidad del maestro/papá-que-abre-club (D-011, D-027)
  sigue exactamente igual — ya vivía después del registro.

**Investigación relacionada:** `mc-45` (fricción de registro, activación
diferida), `mc-27` (cuentas familiares). Cierra la lectura de la queja del
dueño documentada en `[[dos-modos-familia-y-solo]]` (memoria de esta sesión).

---

## D-083 — Racha y XP del adulto solo viven en sus propias tablas, nunca en las del niño · 2026-08-02

> **SUPERADA el 2026-08-03 — el código real ya resolvió esto distinto, y
> mejor.** Esta decisión se escribió mirando `migrations/` en un momento en
> que solo llegaba a `0006` (sin ninguna tabla de F7 todavía) y nunca se
> volvió a verificar después. `migrations/0007_racha_y_xp.sql`, ya real y
> committeada, construyó `child_streak`/`xp_totals` con **`child_profile_id`
> y `user_id` como columnas alternativas en la misma tabla**, protegidas por
> `CHECK ((child_profile_id IS NOT NULL) <> (user_id IS NOT NULL))` — exactamente
> un dueño por fila, nunca los dos, nunca ninguno. Es la solución polimórfica
> que esta decisión rechazó por el argumento de modo de falla de D-027 — pero
> ese argumento asumía una columna polimórfica **sin** el `CHECK` de
> exclusividad mutua que el esquema real sí tiene, que es precisamente lo que
> cierra el riesgo de que una fila de niño y una de adulto se confundan.
> Construir `learner_streak`/`learner_xp_totals` ahora sería una segunda
> fuente de verdad para el mismo hecho — el error exacto que D-025/`mc-32`
> ya advierten en otras partes del proyecto. **No se construyen las tablas
> nuevas de esta decisión.** El resto de esta entrada (el recordatorio
> retargeteado al propio adulto, el tono de misiones pendiente de autorar)
> sigue vigente — solo el esquema cambia: donde dice `learner_streak`/
> `learner_xp_totals`, léase `child_streak`/`xp_totals` con `user_id` en vez
> de `child_profile_id`.

**Decisión del dueño**, cerrando un hueco que el propio proyecto ya se había
encontrado y nunca resuelto. `docs/planes/f7-juego.md`, en su autocrítica
cruzada, ya lo dejó escrito sin resolver: *"El diseño entero asume que solo
existen niños con un padre detrás… `child_streak` es literalmente 'una fila
por niño'… un adulto aprendiz no tiene dónde acumular el XP que la propia
fórmula dice que gana."* Verificado contra `migrations/`: las tablas de F7
(`child_streak`/`xp_totals`) son de niño exclusivamente.

**Decisión:** dos tablas nuevas, paralelas a las del niño, nunca compartidas:

```sql
-- learner_streak — mismo mecanismo que child_streak (F7), sujeto = users.id
-- donde is_learner = 1. Los escudos y la pausa siguen la misma lógica pura
-- de racha.ts — se reusa la función, no se reescribe.
CREATE TABLE learner_streak (
  user_id             TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak      INTEGER NOT NULL DEFAULT 0,
  max_streak          INTEGER NOT NULL DEFAULT 0,
  shields_available   INTEGER NOT NULL DEFAULT 0,
  pause_until_local_date TEXT,   -- autodeclarada por el propio adulto — no hay
                                 -- "padre" que la declare por él
  updated_at          INTEGER NOT NULL
);

-- learner_xp_totals — mismo mecanismo que xp_totals (F7), sujeto = users.id.
-- rangoDeXp() se reusa tal cual: es una función pura de un número, nunca
-- dependió de child_profile_id.
CREATE TABLE learner_xp_totals (
  user_id     TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_xp    INTEGER NOT NULL DEFAULT 0,
  updated_at  INTEGER NOT NULL
);
```

**Por qué tablas separadas y no una columna polimórfica
(`child_profile_id | user_id`) en las tablas existentes.** Mismo argumento de
modo de falla que D-027 ya usó para separar `grupo_infantil` de `club_adulto`:
*"no es modelado, es modo de falla. Con una sola tabla, el día que alguien
agregue algo pensado solo para adultos, eso aterriza por defecto también
sobre los niños."* Aquí es al revés — el riesgo es que una consulta pensada
para el adulto (sin restricciones) toque por accidente una fila de niño — pero
el argumento es idéntico: dos tablas hacen que ese error **no pueda pasar**
aunque nadie lo recuerde, en vez de depender de un `WHERE` correcto en cada
consulta.

**El recordatorio de racha, retargeteado, no suavizado.** F7 documentó *"va al
padre, nunca al niño"* — regla que no tiene sentido para un adulto sin hijos.
Para `learner_streak`, el recordatorio va **al propio adulto**, a toda la
frecuencia que D-084 autoriza — nunca moderado por la lógica de "no le eches
la culpa a un padre por su hijo", porque aquí no hay niño de por medio.

**Misiones y liga:** reusan el catálogo existente sin tabla nueva. Lo que sí
queda pendiente, ya señalado por la propia autocrítica de F7: el tono de copy
para SERIO/JR/PRO todavía no se autoró distinto al de PRIMARIA — D-084 fija
que ese tono, cuando se autore, es de **enganche competitivo pleno**, no la
voz suave que protege a un niño.

**Investigación relacionada:** `f7-juego.md` (autocrítica cruzada), D-027
(precedente del argumento de modo de falla).

---

## D-084 — El adulto solo no tiene supervisión: el techo es la ley, no la protección de menor · 2026-08-02

**Decisión del dueño**, tras plantearle el conflicto directo: pidió que el
enganche del adulto solo sea *"tan adictivo como Candy Crush o Angry Birds"*.
Se le señaló que dos de las ocho líneas rojas de `CLAUDE.md` no están escritas
como protección de menor sino como regla de **todo el producto** — línea roja
#5 (sin moneda comprable, sin recompensas aleatorias de pago — cajas de botín
ilegales en Bélgica/Países Bajos, para cualquier edad) y línea roja #6
(protección de racha jamás se vende) — y eligió, con esa información delante,
**enganche no monetizado, al máximo legal, sin tocar esas dos líneas.**

### Qué se apaga para el adulto solo — todo lo que hoy suaviza algo por ser protección de MENOR, y solo por eso

| Mecanismo | Para el niño (se queda igual) | Para el adulto solo (`users.is_learner=1`) |
|---|---|---|
| Límite de pantalla | D-016, corte suave por edad | **No aplica — ya estaba así** (D-016: "adulto: sin límite"), se reafirma aquí para que quede citable junto al resto |
| Anti-trampa | Tier 0 (kinder, nada punitivo, D-020) | Tier 3-5 según banda (SERIO/JR/PRO, D-010/`mc-29`) — **no es una relajación, nunca estuvo en tier 0** |
| Ayuda a Larry visible al padre | P-17: nunca por hijo, nunca sugiere "practica más" (`f6-larry-profe.md`) | **No aplica** — esa restricción es sobre un padre viendo datos de SU HIJO; un adulto viendo sus propias estadísticas no cruza esa lógica en absoluto |
| Frecuencia de recordatorio/notificación | mc-19: cadencia moderada, nunca con culpa, dirigido al padre sobre el hijo | **Frecuencia completa**, dirigida al propio adulto sobre sí mismo — sigue pasando por la carta `patrones-oscuros` (no manipulador), pero sin el freno adicional que existía para no involucrar a un niño |
| Ranking/posición de liga | Tercios en KINDER (nunca número exacto, D-003/`mc-18`), número exacto desde PRIMARIA | El adulto solo ya recibía número exacto (SERIO no es KINDER) — se reafirma, no cambia |
| Racha — intensidad | Roja con red, lenguaje sin pérdida (D-014) | Misma mecánica (con red — Duolingo demuestra que la red retiene, no que suaviza), pero el copy puede ser de presión competitiva real, no del tono protector que existe para no generar ansiedad matemática en un menor (`mc-10`) |
| Clubs / retos entre pares | No aplica — ningún menor entra a un club de adulto (D-028) | Ya sin restricción (`club_adulto`, D-027/D-028) — se reafirma |

### El techo que NO se mueve, para nadie, de ninguna edad

**Líneas rojas #5 y #6 de `CLAUDE.md` son producto-completo, no
menor-específicas, y esta decisión no las toca:**

- **Sin moneda comprable. Sin recompensas aleatorias de pago** (cajas de
  botín) — la base legal (Bélgica, Países Bajos) no depende de la edad del
  jugador, y D-028 ya hizo el mismo análisis para las prendas de adulto: *"el
  día que la plataforma retenga valor real, aparece la consideración y el
  análisis de juego se invierte."*
- **La protección de racha jamás se vende** — a nadie, ninguna banda.
- **Sin patrones oscuros** — la carta `patrones-oscuros` ya tiene
  `alcance: [...INTERFAZ, ...TEXTOS, /pago|precio|suscrip|notific|push/i]`,
  que cubre cualquier superficie del producto, no solo las de niño. "Adictivo
  al máximo legal" pasa por esa carta igual que cualquier otra pantalla.
- **Larry nunca humilla a nadie** (`anti-humillacion`, `canon-larry`) — no es
  una regla de supervisión infantil, es dignidad básica, aplica al adulto
  igual que al niño.

**Si algún día se quiere cruzar la línea 5/6 para el adulto** (mecánica de
gasto real, protección de racha vendible) — el dueño ya decidió que **no** es
esta decisión: exigiría enmendar CLAUDE.md explícitamente, con revisión legal
previa (mismo estándar que D-028 ya fija para cualquier mecánica con dinero
real), y quedaría escrito como su propia decisión, no como parte de esta.

**Investigación relacionada:** D-014 (lista negra de gamificación), D-028
(análisis de los tres elementos del juego ilegal), `mc-16`, `mc-17`, `mc-19`.

---

## D-085 — Todo el producto es gratis para cualquier tipo de cuenta, sin excepción · 2026-08-02

**Decisión del dueño**, ampliando D-057 más allá de F8. D-057 pospuso el cobro
solo para panel/reportes/límite de pantalla, del lado del padre. **Esta
decisión lo extiende a todo el producto y a todo tipo de cuenta**, dicho
así, textual: *"Todo siempre es gratis, no importa si es escuela, profesor,
alumno o lo que sea. Usuario."*

**Enmienda explícita a D-021.** D-021 seguía describiendo un Plan Familia de
pago (~$8-10 USD/mes) con panel, Larry en vivo, offline y reportes detrás de
una suscripción. Esa tabla queda **retirada como plan activo**: hoy no existe
ningún camino de código, ninguna issue y ninguna fase que dependa de que
exista un plan de pago. `master-plan.md` §12 se reescribe para no listar un
"Plan Familia" de pago junto al gratuito — se deja una sola columna.

**Lo que esto NO decide:** que el proyecto nunca vaya a cobrar nada, jamás. Es
la misma distinción que D-057 ya hizo para F8: se pospone el cobro, no se
renuncia a la posibilidad. El día que exista una decisión de negocio real
sobre monetización, esta entrada se enmienda (mismo patrón que D-035 enmendó
D-015, y que D-057 ya preveía para sí misma) — hasta entonces, **ninguna
issue, ninguna pantalla y ningún documento presenta un plan de pago como
parte del producto actual.**

**Consecuencia directa para el tope de perfiles.** El tope de 6 perfiles
gratis con bandera en `CONFIG_KV` (issue #120, F2) seguía existiendo "hasta
que haya Plan Familia que lo reemplace" — con esta decisión, esa condición ya
no aplica: el tope se revisita como una decisión de producto (¿cuántos
perfiles tiene sentido permitir por hogar, sin relación a ningún cobro?), no
como una espera a monetización.

**Investigación relacionada:** D-057 (el precedente directo, ya escrito para
F8). `mc-41` (precios de la competencia) pasa de ser referencia para fijar un
precio propio a ser solo contexto de mercado — no se borra, deja de ser
accionable mientras esta decisión esté vigente.

---

## D-086 — El maestro se verifica a través de su escuela: escuela verificada crea maestros · 2026-08-02

**Decisión del dueño**, al abrir F9, cerrando la pregunta 1 de `mc-28` de una
forma que ninguna de las dos alternativas que ese documento planteaba
resolvía del todo: *"lanzar solo afiliado a escuela"* vs. *"abierto a
cualquier adulto"*. La respuesta real es una tercera forma — **se verifica la
escuela una vez, como institución, y la escuela es quien autoriza a sus
maestros** — que además es la única que `mc-28` identifica como capaz de
invocar limpiamente la excepción de "school official" de FERPA (34 CFR
99.31(a)(1)): esa excepción exige que **una institución real** determine el
interés educativo legítimo y mantenga *"control directo"* sobre el uso de los
datos — algo que un maestro suelto, sin escuela detrás, no puede ofrecer,
pero que una escuela verificada sí.

### El modelo

1. **Entidad nueva: `school`** (o `escuela_verificada`) — `id`, `nombre`,
   `país`/`locale`, `estado_verificacion` (`pendiente`/`verificada`/
   `rechazada`), `metodo_verificacion` (`dominio_institucional`/
   `documento_revisado`), `verificado_por` (quién de revisión humana la
   aprobó), `verificado_en`.
2. **Verificación de la escuela, no del maestro individual.** Dos vías,
   combinadas:
   - **Atajo automático por dominio institucional conocido** — si el correo
     de quien registra la escuela pertenece a un dominio que el producto ya
     reconoce como institucional, se verifica sin intervención humana.
   - **Documento + revisión humana** — para toda escuela sin dominio
     reconocido (la mayoría en varios de los 7 mercados, donde escuelas
     privadas pequeñas usan correo genérico): sube un documento (constancia,
     RFC/CCT en México, equivalente por país) y una persona del equipo lo
     revisa. **Esto exige staffear una cola de revisión** — la misma
     pregunta que `mc-28` (pregunta abierta 4) ya dejó sin dueño; se resuelve
     aquí operativamente: la cola existe desde el lanzamiento de F9, no
     después.
3. **Una vez verificada, la escuela invita/autoriza maestros**, sin que cada
   uno pase individualmente por T-5 — el maestro hereda el estatus de
   "afiliado a [Escuela X], verificada" mientras la escuela pueda revocarlo.
   Esto es lo que sostiene el argumento de "control directo" de FERPA: la
   institución, no el producto, decide quién es maestro bajo su nombre, y
   puede quitarle ese estatus.
4. **`salón`/`grupo_infantil` gana un `school_id` opcional.** Con escuela
   detrás, el salón es "afiliado, vía FERPA/COPPA school-official" (sujeto a
   revisión legal, master-plan §14 punto 2, antes de presentarlo como tal en
   cualquier mercado real). Sin escuela (`school_id IS NULL`), sigue el
   modelo ya construido por D-011: consentimiento parental directo,
   verificación declarada (correo + teléfono), insignia de "sin verificar".
5. **El club de papás nunca pasa por este modelo** (ver D-088) — no hay
   institución que verificar en un grupo de familias.

### Lo que esto NO resuelve

- **T-5 sigue sin cerrar del todo.** Se resuelve para el maestro afiliado a
  escuela verificada (la institución vale como control); para el maestro sin
  escuela y para quien abre club de papás, la barra sigue siendo correo +
  teléfono (D-044), y sigue siendo consentimiento parental directo, no
  atajo institucional.
- **Quién staffea la cola de revisión de documentos de escuela** — resuelto
  por D-089: el dueño, manual, mientras el volumen lo permita.
- **El estándar de documento aceptado varía por país** — resuelto por D-090:
  un estándar laxo y universal, no un registro por país.

**Investigación relacionada:** `mc-28` (hallazgo central de FERPA/COPPA,
preguntas 1, 2, 4, 6), D-011 (verificación declarada del maestro sin
escuela), D-044 (por qué no hay SMS).

> **Corrección (2026-08-03).** El esquema de `school`/`school_teacher` de
> este documento se propuso sin haber leído `migrations/0005_group_owner_identity.sql`,
> que ya reservaba exactamente este nivel de confianza como un cuarto valor
> pendiente de `assurance` (`declared`/`school_domain`/`human_reviewed`,
> con el comentario propio de esa migración: *"el valor está para que el
> día que exista no haga falta otra migración"*). `school`/`school_teacher`
> no crean una segunda fuente de verdad sobre qué tan confiable es un dueño
> de grupo — alimentan el campo que ya existe, agregando `school_verified`
> al `CHECK` de `assurance`. Detalle completo en
> `docs/planes/f9-grupos-infantiles.md` §3 y en las issues #380-382.

---

## D-087 — F9: tamaño de grupo, ranking siempre opt-in, y lanzamiento acotado por mercado · 2026-08-02

**Decisión del dueño**, tres piezas cerradas juntas por venir del mismo
paraguas de preguntas.

**1. Tope de tamaño y creación.** Salón: **30-35 niños**, mismo rango que
`master-plan.md` ya citaba para el maestro. Club de papás: tope menor (ya
exigido por D-027, sin cambiar). Límite de creación de grupos por cuenta,
para que la creación masiva —la palanca que `mc-28` nombra como el principal
recurso de un abusador sin verificación real— tenga un techo.

**2. El ranking dentro de un salón/club es opt-in, apagado por default —
en TODA banda, no solo kinder.** Investigación externa dirigida (agosto
2026) confirma esto más allá de Domínguez et al. 2013 (ya citado por
`mc-28`): Li et al. 2024 (revisión sistemática, 29 intervenciones) encuentra
efectividad muy dependiente del diseño; un estudio de 2025 en *Journal of
Computing in Higher Education* encuentra que las tablas de posición
**reducen el compromiso social**, no solo el académico, en estudiantes que no
valoran la competencia por sí mismos, independientemente de su nivel; la
literatura 2024-2025 se inclina por **opt-out por default con un toggle fácil
y sin estigma** antes que un ranking siempre encendido. Un aula real
concentra el daño de participación de forma distinta a un tablero anónimo
global (donde D-025/D-003 ya permiten default encendido fuera de kinder) —
la diferencia es que aquí los compañeros de clase se conocen entre sí, así
que el mismo argumento de F7 no traslada limpio. Un niño puede practicar
dentro de un salón sin aparecer nunca en ninguna vista de ranking de ese
salón.

**3. Lanzamiento geográfico acotado.** F9 se documenta y se construye para
los 7 locales, pero **se activa primero solo en `en`, `es-MX`, `es-ES` y
`pt-BR`** — los mercados donde `mc-25`/`mc-28` no dejaron ningún requisito
legal marcado `[unverified]`. `fr-FR`, `pt-PT`, `de-DE` (GDPR Art. 8, el
Children's Code británico) esperan revisión legal real antes de activarse —
`ico.org.uk` bloqueó el fetch automatizado durante la investigación, así que
el estándar exacto no está confirmado, y no se construye sobre una cifra sin
confirmar.

**Investigación relacionada:** `mc-28` (preguntas 3, 5, 7), `mc-18`, y la
literatura de leaderboard 2024-2025 citada arriba (Li et al. 2024; estudio
2025 de compromiso social en JCHE) — marcada como investigación externa
dirigida, no parte del corpus original de 47 documentos.

---

## D-088 — Club de papás: se une con el código, cualquiera, pero nunca se comparte contacto · 2026-08-02

**Decisión del dueño**, cerrando la pregunta que `mc-46` dejó abierta ("¿se
permite mezclar familias que no se conocen entre sí?"). **Sí se permite** —
cualquier familia con el código puede unirse, sin exigir un vínculo previo
verificable. La mitigación no es restringir quién se une: **es que ningún
dato de contacto se comparte jamás entre miembros**, sin importar cuánto se
conozcan o no fuera del producto.

**Lo que esto confirma, no lo que agrega:** D-027 ya fijaba que el dueño de
un `grupo_infantil` ve *"solo alias, puntos y racha. Ni nombre real, ni edad
exacta, ni otros grupos del niño."* Esta decisión hace explícito que esa
regla es la mitigación completa para el riesgo de familias-extrañas, no una
capa adicional sobre un requisito de vínculo previo que `mc-46` sugería como
alternativa. **No hay ninguna pantalla, en ningún punto de F9, donde un
miembro del club vea el correo, teléfono o nombre real de otro miembro** —
ese aislamiento es lo que hace seguro un club abierto por código.

**Investigación relacionada:** `mc-46` (pregunta abierta, numerada 6 en el
documento), D-027 (la regla de minimización que esta decisión confirma como
suficiente).

---

## D-089 — Las colas de revisión de F9 las atiende el dueño, manual, hasta que exista alguien más · 2026-08-03

**Decisión del dueño**, cerrando la pregunta operativa que `mc-28` (pregunta
abierta 4) dejó sin dueño y que D-086/`#385` heredaron sin resolver.

**Quién atiende:** el propio dueño del proyecto, a mano, sin equipo dedicado
todavía — ni la cola de verificación de escuela (D-086) ni la de reportes de
grupo (issue #385) tienen un revisor asignado más allá de él. **Esto no es
una decisión de diseño, es una restricción real de recursos**, y se
documenta como tal para que nadie construya sobre el supuesto de que existe
un equipo de confianza y seguridad.

**Consecuencia directa, dicha de frente:** `mc-28` advierte que un mecanismo
de seguridad sin quien lo opere "no protege a nadie" — el botón de reporte y
la verificación de escuela son, mientras esto sea cierto, tan fuertes como
la disponibilidad de una sola persona. Si el volumen de escuelas o reportes
supera lo que el dueño puede atender en un tiempo razonable, la mitigación
real se degrada silenciosamente, sin que ningún auditor lo detecte (no hay
forma de que un auditor estático mida "tiempo de respuesta humano").

**Lo que esto exige de las issues #381 y #385, agregado como criterio:**

- [ ] Ninguna de las dos colas se construye asumiendo un equipo — la interfaz
  de revisión es de una sola persona operando, sin flujo de asignación entre
  revisores
- [ ] Se registra `created_at` de cada solicitud/reporte pendiente, para que
  el propio dueño pueda medir su tiempo de respuesta real y decidir cuándo
  esto deja de ser sostenible manualmente
- [ ] La activación de F9 (`CONFIG_KV.f9_enabled_<locale>`, issue #387) no
  depende de tener un equipo — depende de que el dueño acepte operar las dos
  colas él mismo mientras dure esta decisión

**Condición de revisión:** cuando el volumen lo exija, esta decisión se
enmienda con quién se contrata/asigna — no antes, y no se construye
infraestructura de equipo (roles, turnos, asignación) especulativamente
hoy.

**Investigación relacionada:** `mc-28` (pregunta abierta 4, "is a
human-review queue staffable, and who owns it?").

---

## D-090 — Verificación de escuela: un estándar laxo y universal, no un registro por país · 2026-08-03

**Decisión del dueño**, cerrando la segunda mitad de la pregunta que D-086
dejó explícitamente sin resolver ("el estándar de documento aceptado varía
por país... trabajo de la fase, no de esta decisión").

**El estándar, para los 4 mercados de lanzamiento de D-087 (`en`, `es-MX`,
`es-ES`, `pt-BR`) y sin distinción entre ellos:** cualquier documento con
membrete oficial de la escuela, el nombre de la institución y una dirección
— revisado a ojo por quien atiende la cola (D-089). **No se valida contra
ningún registro oficial** (la clave CCT de México ante la SEP, el registro
autonómico español, el código INEP brasileño, o el hecho de que EE.UU./UK
no tienen un registro central único) — construir esa validación exigiría
investigar y mantener cuatro integraciones distintas, cada una con su
propio riesgo de bloqueo de acceso automatizado (mismo problema que ya
sufrió `mc-28` con `ico.org.uk`, 403 en cada intento).

**Lo que esto compra:** la issue #381 se puede construir sin bloquear en
investigación adicional por país.

**Lo que esto cuesta, dicho de frente:** un documento con membrete es
falsificable con herramientas comunes de edición de imagen. La barrera real
contra un abuso sistemático no es este documento — es D-089 (una persona
revisando) más el tope de tamaño y la tasa de creación (D-087) más el hecho
de que el padre sigue aprobando la entrada de cada niño individualmente
(D-011). Este estándar de documento es la primera capa, no la única.

**Condición de revisión:** si se detecta abuso real del atajo de documento,
esta decisión se enmienda con validación contra un registro oficial — por
país, empezando por el mercado donde se detecte el problema, no los cuatro
a la vez.

**Investigación relacionada:** D-086 (el modelo de escuela verificada que
esta decisión completa), `mc-28`.

## D-103 — Misiones por día: 3 en PRIMARIA y SECUNDARIA, 4 en SERIO · 2026-08-03

**Decisión:** `MISIONES_POR_DIA` deja de ser una constante única. PRIMARIA y
SECUNDARIA juegan **3 misiones simultáneas**; SERIO (la banda adulta con
contenido en el MVP, D-034) juega **4**. Responde las dos preguntas abiertas
de `docs/dudas.md` §23 (misiones diarias), contestadas por el dueño el
2026-08-03.

El 3 de las bandas de menor se queda como estaba implementado en D-092: es el
número de Duolingo (bronce/plata/oro, corroborado en fuentes secundarias) y
está justo por debajo del techo de memoria de trabajo que Cowan (2010, «The
Magical Mystery Four») fija en ~4±1 **para adultos** — los niños de 7-11
todavía están subiendo hacia ese techo, no lo han alcanzado.

El 4 de SERIO usa exactamente esa misma fuente: la memoria de trabajo adulta
sí alcanza el techo de Cowan, así que la banda adulta puede aprovecharlo. El
número es `[criterio propio]` con la fuente escrita al lado, misma honestidad
que la tabla de D-016.

**Lo que esto cuesta:** una tabla por banda en vez de una constante. El cambio
vive solo en `packages/motor/src/misiones.ts`; la interfaz pinta lo que
`elegirMisionesDelDia()` devuelva y no conoce el número.

**Condición de revisión:** cuando haya datos reales de tasas de completado por
banda, se recalibran los dos números midiendo, no discutiendo.

**Investigación relacionada:** `mc-16` (el 3 de Duolingo), Cowan (2010) citado
en `docs/dudas.md` §23.1. Implementa la respuesta del dueño a §23.1 y §23.2.

## D-104 — KINDER no escribe `mission_daily_summary` · 2026-08-03

**Decisión:** el avance en la Sabana de KINDER **no cuenta como «misión
completada»** en el panel del padre. KINDER no escribe ninguna fila en
`mission_daily_summary`: `elegirMisionesDelDia()` le devuelve una lista vacía
(D-092 §5) y así se queda. Responde §23.3 de `docs/dudas.md`, contestada por
el dueño el 2026-08-03.

La alternativa —contarlo— infla una tasa de «misiones completadas» hasta
hacerla indistinguible de «jugó hoy», y una métrica que mide dos cosas no mide
ninguna. El precio aceptado, dicho: KINDER queda sin fila en esa métrica del
panel, y su avance se lee por la vía del mapa (F7 §4), no por la de misiones.

Si un día se quiere mostrar «jugó hoy» en el panel, se muestra como eso —con
sus palabras—, no como misión.

## D-105 — El recordatorio por push se construye ahora, no se aplaza a F8 · 2026-08-03

**Decisión:** el mecanismo de recordatorio de misión por Web Push **se
coordina ahora**, dentro del cierre de F7, y no se aplaza al diseño de F8 ·
Padres. Revierte el «fuera de alcance» que el agente había asumido en
`docs/dudas.md` §23.4 por no haber superficie; el dueño lo contestó distinto
el 2026-08-03.

Las reglas del canal no cambian y vienen de `mc-19`, no de esta decisión: el
push va **al padre, nunca al niño**; máximo **uno al día por hogar**; copy de
intención-implementación (eco de un compromiso hora/lugar elegido por la
familia, Gollwitzer vía `mc-19`), **sin culpa y sin mencionar la racha**;
silencio permanente en un toque que no se vuelve a preguntar (D-026). iOS
exige 16.4+ con la PWA instalada (puerta absoluta), y el primer *ask* es
siempre *soft-ask*: el permiso rechazado no se puede re-pedir.

Implementa #207. La superficie de suscripción vive del lado del padre;
`audits/recordatorio-sin-culpa.mjs` (escrito en la especificación de #207) es
condición de cierre: ninguna ruta de push toma `childProfileId`.

## D-106 — La racha SÍ se muestra entre pares de liga · 2026-08-03

**Decisión:** la fila que una liga difunde entre pares incluye la **racha**,
junto a alias, avatar, puntos y posición. **Enmienda #243** («nunca se muestra
racha… entre pares de liga») y supera la lectura restrictiva que el PR #395
implementó al encontrar la contradicción con #242 («avatar, alias, puntos,
racha, posición»). Contestada por el dueño el 2026-08-03.

El conflicto y su historia, para que quede por qué se dudó: el agente eligió
el restrictivo porque una racha es el patrón de presencia diaria de un menor,
y `mc-25` recital 26 recuerda que un alias sigue siendo dato personal mientras
se guarde el mapeo. Esa lectura era la prudente *sin dueño disponible*; con el
dueño disponible, la decisión es suya y es la contraria: la racha es, con los
puntos, la señal de constancia que la liga existe para hacer visible (D-081),
y va protegida por las mismas tres condiciones de siempre — la liga no puede
quitarla, no hay presencia en vivo, y ningún texto la nombra con lenguaje de
pérdida (`racha-lexico` vigila los siete locales).

**Lo que NO cambia:** la racha entre pares es `current_streak` y nada más. Ni
`max_streak` (#208 lo prohíbe para salones y clubs, y el mismo criterio se
extiende aquí), ni escudos, ni pausas, ni histórico. Sin nombre real jamás
(línea roja #2, D-081).

---

## D-107 — El dueño de un grupo ve siempre alias, racha y puntos; el opt-in de D-087 gobierna solo las vistas ordenadas · 2026-08-03

**Decisión del dueño** (F9), cerrando una contradicción interna del primer
diseño de F9: su §5 omitía racha y puntos del roster para el niño sin
`leaderboard_opt_in`, y su §6 afirmaba que alias/racha/puntos son siempre
visibles al dueño del grupo como la visibilidad mínima de D-027.

**Queda el §6.** D-027 fijó que el dueño de un `grupo_infantil` ve «solo
alias, puntos y racha» de cada miembro aprobado — eso no es ranking, es la
condición mínima para que un salón o un club sirva. El opt-in de D-087
gobierna únicamente las **vistas ordenadas por posición**: un niño con
`leaderboard_opt_in = 0` aparece en el roster con sus tres datos, y no
aparece en ninguna tabla ordenada, posición ni tercio.

**Lo que esto NO cambia:** la lista cerrada sigue siendo esos tres datos.
Ni nombre real, ni edad exacta, ni otros grupos (D-027), y la aprobación
del padre sigue siendo la puerta (D-011).

**Nota de numeración:** esta decisión se escribió primero como D-093 y se
renumeró al integrarla — D-093 a D-106 las ocupó el cierre de F7 en una
sesión paralela (dudas §24.5 y AGENTS.md §1: los números los reparte el
orquestador).

**Investigación relacionada:** `mc-28`, `mc-18`, D-027, D-087.

---

## D-108 — F9 entra al área de adulto como área propia `/app/grupos/`, no como sexta pestaña · 2026-08-03

**Decisión del dueño** (F9), cerrando la pregunta que D-065 dejó abierta
(«si F9 llega: ¿6ª pestaña o área separada?»).

**Área separada.** El tope de 5 pestañas de D-065 no se toca (máximo HIG /
Material 3 que D-064 ya invocó). La entrada a los grupos es una **acción
desde `/app/home`** — el patrón de D-082: acciones posteriores, nunca una
elección en la puerta ni una pestaña permanente que no aplica a la mayoría
de las cuentas.

**Consecuencia:** `apps/web/src/lib/pestanas-privadas.ts` no gana claves.
Las pantallas de grupo viven bajo `/[locale]/app/grupos/` con
`layouts/Privada.astro` (D-065). Una cuenta cuyo único vínculo es ser
dueña de grupo aterriza en `/app/grupos/` desde `/app/home`.

**Investigación relacionada:** D-064, D-065, D-082, `mc-49`.

---

## D-109 — El reporte de un grupo no lleva captura de pantalla: el estado se reconstruye de D1 · 2026-08-03

**Decisión del dueño** (F9), retirando `screenshot_r2_key` del primer
diseño de F9 (captura automática de la pantalla del padre al reportar,
patrón Roblox julio 2026).

**Por qué se retira:** el patrón de Roblox captura la pantalla del
INFRACTOR dentro de su plataforma; aquí la captura sería de la pantalla
del padre que reporta, que puede mostrar datos de **otros** niños
(hermanos en el panel del hogar). Copiar esa imagen a R2 es recolectar
datos de menores ajenos sin consentimiento de sus padres — la línea roja
#2 no la salva que el botón lo presione un adulto. Y D-075 fijó el
principio: ninguna captura que no sea acción explícita, y «la respuesta
por defecto a ampliarla es no».

**Lo que lo reemplaza:** `child_group_report` guarda el `reason_code`
(CHECK cerrado) y las referencias; el revisor reconstruye el estado desde
D1 (grupo, dueño, `assurance`, código, membresías) con una consulta, sin
imagen.

**Investigación relacionada:** D-075, línea roja #2, `mc-25`.

---

## D-110 — La membresía del grupo ES el consentimiento; no se añade `CLASSROOM_JOIN` al catálogo · 2026-08-03

**Decisión del dueño** (F9), resolviendo una promesa incumplida del plan
de F2: su §3.3 anunció el código `classroom_join` en
`consent_type_catalog` «a llenar en F9», y la migración `0003` real nunca
lo insertó (los códigos vivos son `CHILD_PROFILE`, `LEADERBOARD`,
`SCREEN_TIME`, `DATA_RETENTION`, más `LEAGUE`/`DUEL` de la `0012`).

**No se inserta.** `child_group_membership` ya guarda lo que el
consentimiento exige demostrar: **quién aprobó** (`decided_by`, siempre
el padre dueño del perfil), **cuándo** (`decided_at`), **qué se
comparte** (`leaderboard_opt_in`, D-107), y la revocación es una
transición de estado (`removed`), nunca un borrado. Registrar además la
aprobación en `child_consents` crearía dos filas que afirman lo mismo y
pueden desincronizarse — el defecto exacto que D-051 cerró congelando
`consent_records`.

**Diferencia con el tablero y la liga:** `LEADERBOARD`/`LEAGUE`/`DUEL` sí
son códigos de `child_consents` porque esos consentimientos **no tienen
tabla de membresía propia** donde vivir. Aquí la tabla existe y es la
fuente única.

**Investigación relacionada:** D-011, D-051, `mc-25`.

---

## D-111 — El niño ve una mención neutra de su grupo en su mapa, sin números ni posiciones · 2026-08-03

**Decisión del dueño** (F9), en contra de la recomendación presentada
(que era no mostrar nada en v1).

**La forma, con las restricciones de cada banda:**

- **Sin números, sin posiciones, sin comparación, en ninguna banda.** La
  mención es identidad («estás en el salón de…»), nunca desempeño.
  `mapa-sin-numero-de-nivel` y D-017 aplican sin excepción.
- **KINDER:** sello visual (ícono) con `aria-label` autorado, nunca texto
  obligatorio — el niño de 4-6 no lee (D-019, `mc-20`).
- **PRIMARIA/SECUNDARIA:** una línea de texto autorada por locale, fuera
  del árbol de habilidades — no es un nodo de dominio.
- **Nada dentro de un reto activo** (la regla de `mision-silenciosa`).
- **Lo que el niño NUNCA ve:** el roster, el tablero del grupo aunque
  tenga opt-in (la vista ordenada es de adultos en v1), la identidad del
  dueño más allá de la mención, ni los demás miembros.

**Por qué aun así:** un niño cuyo maestro usa el producto en clase va a
oír hablar del salón; que su propia app lo niegue sería lo raro. La
mención responde «¿por qué mi maestra sabe que jugué?» sin abrir ninguna
superficie social — el ranking entre compañeros que se conocen sigue
fuera (`mc-28` §6, Domínguez et al. 2013).

**Investigación relacionada:** `mc-28` (implicaciones 6 y 8), `mc-18`,
D-017, D-019, D-107.

---

## D-112 — `math-challenge-classroom-do` sí se usa: un Durable Object por grupo para standings en vivo · 2026-08-03

**Decisión del dueño** (F9), en contra de la recomendación presentada
(que era declararlo innecesario, como `math-challenge-tutor`).

- **Un objeto por grupo** (`idFromName(child_group_id)`), clase `Grupo` —
  mismo patrón que `Liga` por cohorte (`mc-32` riesgo #2; borrar el
  grupo es `deleteAll()`).
- **Solo standings, nunca presencia.** Hereda la condición 2 de D-081:
  sin contador de sockets, sin `last_seen`, sin «fulano acaba de jugar».
  La difusión manda la tabla entera del grupo y nada más.
- **Solo miembros con `leaderboard_opt_in = 1`** (D-107): el DO no recibe
  jamás datos de un niño sin opt-in — no es que no los difunda, no los
  tiene.
- **El roster se lee de D1, no del DO.** El objeto guarda estado
  derivado para difundir (alias, avatar, puntos, racha — la lista de
  D-027); el registro maestro sigue siendo la base.
- **El niño no es cliente de este DO** (D-111): ningún WebSocket llega a
  una superficie de niño.

**Investigación relacionada:** `mc-32` (riesgo #2), D-081, D-107,
`apps/web/src/lib/liga-do.ts` (el patrón a copiar).

---

## D-113 — El código de unión: 6 caracteres sin ambiguos, regenerable y desactivable, sin expiración · 2026-08-03

**Decisión del dueño** (F9), completando la mecánica que D-011 dejó en
«código de 6 caracteres».

- **Alfabeto sin ambiguos:** sin `0/O`, sin `1/I/L`, sin vocales
  adyacentes que formen palabra. Se genera en servidor, nunca lo escribe
  el dueño.
- **Reset y disable, los dos** (verificado en vivo contra Google
  Classroom, que ofrece ambos): el dueño puede **regenerar** el código —
  el anterior muere en el acto, las membresías aprobadas no se tocan— y
  **desactivarlo** sin borrar el grupo (`disabled_at`).
- **Sin expiración automática:** un salón real dura el ciclo escolar; un
  código que caduca solo obliga al maestro a reactivarlo frente a 30
  familias.
- **El código nunca mueve a un niño a ningún roster** (`mc-28`
  implicación 2): solo una decisión explícita del padre crea la
  membresía.

**Investigación relacionada:** D-011, `mc-28` §1.

---

## D-114 — Topes de F9: club de papás ≤ 20 niños, 3 grupos por tipo y cuenta, 1 creación por día, solicitud expira a 30 días · 2026-08-03

**Decisión del dueño** (F9), poniendo los números que D-027 («tope menor
que el de salón») y D-087 («límite de creación») dejaron sin cifra.

- **Club de papás: máximo 20 niños** (contra el 12 recomendado: un club
  deportivo o de colonia completo debe caber). Sigue por debajo del salón
  (30-35, D-087).
- **Creación: 3 salones + 3 clubs por cuenta** (D-011 fijó los 3
  salones; simétrico a clubs), **y 1 grupo creado por día por cuenta** —
  la velocidad es la palanca que `mc-28` implicación 12 nombra.
- **Solicitud pendiente expira a los 30 días:** `status` pasa a
  `expired`, la fila queda en la bitácora. 7 días castiga a la familia
  de vacaciones; nunca expirar deja estados zombi.
- **Tasa de aprobaciones sin tope duro en v1:** el cuello real es el
  tamaño del grupo y la tasa de creación; se mide antes de apretar.

**Investigación relacionada:** D-011, D-027, D-087, `mc-28` (implicación
12), `mc-46` §6.

---

## D-115 — El toggle del ranking opt-in vive en la pantalla de aprobación de la membresía · 2026-08-03

**Decisión del dueño** (F9), resolviendo una dependencia mal puesta: el
primer diseño de F9 ubicaba el control del ranking «en el panel de
familia (F8)» — una fase cuyo panel no está construido.

**El padre decide el ranking al aprobar la membresía** (default apagado,
D-087), en la misma pantalla donde ve la tarjeta de identidad del dueño
del grupo. Después puede cambiarlo desde la bitácora de membresía (issue
#386), que es superficie de F9, no de F8. Cuando el panel de F8 exista
puede reflejar el mismo control leyendo la misma columna — una sola
fuente, dos vistas.

**Investigación relacionada:** D-087, D-107, D-110.

---

## D-116 — Las colas de revisión de F9 se operan con SQL y correo, sin pantalla de admin en v1 · 2026-08-03

**Decisión del dueño** (F9), acotando la herramienta mínima de D-089.

**v1 sin UI de administración.** El dueño revisa escuelas pendientes y
reportes abiertos con `wrangler d1 execute` contra `school` y
`child_group_report`, y responde por correo. Una pantalla de admin es una
superficie autenticada nueva que construir y auditar — costo real contra
un volumen esperado mínimo en el lanzamiento acotado de D-087.

**Lo que sí exige esta vía:** los `UPDATE` de `verification_status` y de
`reviewed_at`/`reviewed_by` quedan escritos como consultas de runbook en
el plan de F9, con los valores cerrados que el esquema admite — un
`UPDATE` a mano sin runbook es como `assurance='verified'` escrito donde
no toca.

**Condición de revisión:** la misma de D-089 — cuando el volumen lo
exija, se construye la pantalla con esta decisión enmendada.

**Investigación relacionada:** D-089, D-090, `mc-28` (pregunta abierta
4).

---

## D-117 — Los retos del club de adultos viven aislados: no mueven tablero global ni ligas · 2026-08-03

**Decisión del dueño** (F10), cerrando la pregunta abierta 4 de `mc-46`.

Los puntos que un adulto gana dentro de su `adult_club` **solo cuentan
dentro del club**. El tablero global y las ligas no se enteran de que el
club existe, y el club no escribe en `score_totals_adulto` — tiene su
propio acumulado por reto.

**Por qué:** contar en el global activaría la maquinaria anti-colusión
de `mc-29` (índices omega/GBT, solo significativos con banco grande)
sobre la competencia principal, y la visibilidad del análisis legal de
D-028 sobre el tablero entero.

**Investigación relacionada:** `mc-46` (pregunta 4), `mc-18`, D-025.

---

## D-118 — El club de adultos tiene tope de 20 miembros · 2026-08-03

**Decisión del dueño** (F10), poniendo el número que `mc-46` no da.

**20 miembros por club**, espejo del tope del club de papás (D-114) y
por la misma razón: una prenda solo funciona si todos se conocen. La
liga de ~30 ya existe para la competencia anónima; el club es lo otro.

Sin límite de clubs por cuenta más allá del de creación (1 grupo/día,
compartido con F9 — la palanca es la velocidad, no el inventario).

**Investigación relacionada:** `mc-46` §6, D-114.

---

## D-119 — F10 sale en dos pasos: club primero, prendas tras la revisión legal · 2026-08-03

**Decisión del dueño** (F10), ordenando el lanzamiento contra la
condición de D-028.

**Paso 1:** el club completo sin apuestas — creación, código, miembros
(incluida la membresía de adolescentes de D-120), tabla del club, retos
con ventana de tiempo. Todo eso es un tablero compartido y no toca la
categoría legal de juego.

**Paso 2:** las tres formas de prenda (D-028) con su moderación (D-029)
y su apelación (D-121), habilitadas por `CONFIG_KV.f10_prendas_enabled`
**solo después de que la revisión legal de D-126 quede escrita**. El
paso 2 se diseña junto y se construye detrás de la bandera: habilitarlo
es un flip de configuración, no un despliegue.

**Investigación relacionada:** D-028, D-029, `mc-46` §1.

---

## D-120 — Un adolescente de 12-17 puede ser miembro de un club de adultos, con aprobación del padre — y JAMÁS en una prenda · 2026-08-03

**Decisión del dueño** (F10), **contra la recomendación presentada** (el
default de `mc-46`: ningún menor en `club_adulto`). Cierra el caso de un
club de primos o de compañeros de prepa.

1. **La membresía puede ser de un adolescente** (12-17, SECUNDARIA) si su
   padre la aprueba — mismo mecanismo que F9: aprobación registrada
   (quién, cuándo), revocable. Juega retos y aparece en la tabla del
   club con su alias.
2. **Un menor no entra JAMÁS a un reto con prenda, y eso es estructural,
   no una regla de código.** D-028 ya lo dice sin matiz; se hace cumplir
   por esquema: la aceptación de una prenda (`club_stake_acceptance`)
   referencia únicamente `users.id` — un adolescente no tiene una, así
   que no puede aceptar, y solo quien aceptó juega la prenda. Ni siquiera
   con el padre aprobando: la prenda es un juego entre adultos por
   definición (`mc-46` implicación 1), y la exposición regulatoria de una
   apuesta con un menor (`mc-17`) no la consiente nadie.

**Lo que esto NO abre:** chat (D-027), datos del menor más allá de
alias/racha/puntos dentro del club, y ninguna superficie donde un menor
escriba texto libre (línea roja #3). La separación de D-027 no se
ablanda: la entrada de un adolescente es un acto explícito de su padre
sobre un club concreto, nunca una consecuencia por defecto.

**Investigación relacionada:** `mc-46` (pregunta 1, implicación 1),
`mc-17`, `mc-25`, D-027, D-028.

---

## D-121 — La apelación de prendas la atiende el dueño a mano, con el patrón de D-116 · 2026-08-03

**Decisión del dueño** (F10), dando dueño y herramienta a la cola que
D-029 exige («toda prenda rechazada debe poder mandarse a revisión
humana con un toque»).

Mismo patrón que las colas de F9 (D-089, D-116): el dueño revisa las
apelaciones con las consultas SQL escritas en el runbook del plan de
F10 y responde por correo. Se registra `appealed_at` de cada apelación
para medir el tiempo real de respuesta.

**Condición de revisión:** la misma de D-089 — cuando el volumen lo
exija, se construye la pantalla de admin compartida para todas las
colas (F9 + F10), no antes.

**Investigación relacionada:** D-029, D-089, D-116.

---

## D-122 — Piso de contenido del cierre: 6 retos por nivel en N4-N12, mixto 2 fijos + 4 plantillas; kinder se rige por F5 · 2026-08-03

**Decisión del dueño** (F11 — requisito declarado por él: «al menos 6
retos por cada nivel excepto kinder, que tendrá un tratamiento
diferente»), con la forma cerrada por preguntas interactivas.

- **El piso: 6 retos por nivel en N4-N12** (9 niveles, 54 retos).
- **Qué es «un reto» aquí: 2 fijos curados a mano + 4 plantillas
  paramétricas** por nivel. Los fijos son la vitrina (como los 4 retos
  de F5c); las plantillas son la rejugabilidad — 6 ítems fijos por nivel
  se agotarían en una semana y la ubicación adaptativa (10-15 ítems por
  sesión, `mc-44`) se consumiría el banco entero. Las plantillas llevan
  su bloque `variacion.{varia, constante, por_que}` completo (esquema de
  ítem §10): no son «6 ítems al azar», son 6 reglas de enseñanza.
- **Kinder NO se mide por este piso.** Su unidad de diseño es la
  habilidad (K01-K14) y su fase es F5 — trayectoria de `mc-06`, 14
  lugares de la Sabana, ~400 ítems, ~2.500 retos curados.
- **Cada reto lleva su etiqueta de dificultad experta (1-100)** al
  autorarse (`mc-44` implicación 2) y el log de respuestas desde el
  primer despliegue — a ~200-400 respuestas/ítem para Rasch son
  ~10.800-21.600 respuestas totales, que un banco chico acumula rápido:
  se calibra antes.
- **Costo estimado (mc-40, etiquetado como estimación):** ~50-60
  días-persona incluyendo revisión y renders de notación.

**Investigación relacionada:** `mc-40`, `mc-44`, `mc-15`, `mc-34`,
D-006, D-018, D-034, D-073.

---

## D-123 — Los retos de N4-N12 se autoran una vez y se renderizan en las 7 notaciones · 2026-08-03

**Decisión del dueño** (F11), aplicando a N4-N12 el patrón que D-034 ya
fijó para la franja N8-N10.

**Una sola autoría estructural por reto** (`autoria: "universal"` del
esquema de ítem — prohíbe el campo `locale`), renderizada por locale
con `MATH_CONVENTIONS`: punto/coma decimal (`es-MX` contra todos), `÷`
contra `:` como signo de división, `·` en `de-DE`, escala larga/corta si
aparece un número ≥10⁹ (`pt-PT` contra `pt-BR`, riesgo ×1.000). Lo que
en kinder exigía autoría separada (las palabras-número) en N4+ ya no
cambia el aprendizaje — solo la notación, y la notación es render, no
autoría (`mc-34`).

El copy de interfaz alrededor del reto sí se autora por locale (D-022).

**Investigación relacionada:** `mc-34`, D-034, D-022.

---

## D-124 — N11-N12: base auto-calificable más la pista Lean 4 como capstone · 2026-08-03

**Decisión del dueño** (F11), **contra la recomendación presentada**
(solo formatos auto-calificables). Cierra la pregunta abierta 1 de
`mc-12` con un sí.

**La base de los 6 retos de N11 y N12** son formatos con respuesta
cerrada, que no necesitan mecanismo de calificación nuevo: combinatoria
y teoría de números estilo AIME, respuesta numérica, equivalencia
simbólica verificada por CAS, «detecta el error en esta prueba»,
ordenamiento de pasos (`mc-12` implicaciones 2-10). La prueba en prosa
libre **nunca** es reto puntuado — 52-54% de acuerdo LLM-humano en
ciego (IMO-GradingBench) la descarta como calificación; toda evaluación
asistida es contra referencia, nunca en ciego (RefGrader).

**Encima de la base, la pista Lean 4** (estilo *Natural Number Game*):
una serie capstone autorada en Lean 4 contra mathlib, donde **el
compilador es el calificador** — cero ambigüedad, resistencia total a
solvers. Con su costo dicho de frente: cada ejercicio necesita un
esqueleto formalizado y revisado (la autoría más cara por reto de todo
el proyecto), y el jugador aprende sintaxis Lean como parte de la
pista. **La pista es aditiva: los 6 retos por nivel de D-122 se cumplen
sin ella** — N11/N12 no se bloquean si Lean se retrasa; la pista
aterriza cuando esté, como bandera de contenido.

**Investigación relacionada:** `mc-12`, D-074, T-6 (queda respondida en
su parte operativa: esto ES lo calificable de verdad en niveles altos).

---

## D-125 — El anti-trampa de F11 construye los tiers 0 y 1, y solo esos · 2026-08-03

**Decisión del dueño** (F11), tomando la fila de master-plan §13.2 al
pie de la letra.

F11 construye: **tier 0** (puntuación del lado del servidor —ya existe—
más el piso de tiempo de respuesta solo-logging, que nunca bloquea ni
pone cero) y **tier 1** (monitoreo silencioso de varianza con señal
suave —nunca bloqueo, nunca penalización visible, nunca framing
punitivo— más el rate limiting en endpoints de envío, que ya existe vía
`math-challenge-ratelimiter-do`). Regla permanente intacta: nunca
cámara, micrófono, biometría ni navegador bloqueado (línea roja #1 con
su única excepción, D-075).

**Los tiers 2-5 no se construyen en F11.** Los ganchos del tier 3 ya
existen (Turnstile, rate limiter, WebAuthn como camino principal), y los
tiers altos llegan cuando haya tráfico real que los justifique — antes
de eso son heurísticas afinadas a ciegas. Cuando las ligas o los clubs
tengan volumen, el tier 2-3 es la primera ampliación de esta decisión.

**Investigación relacionada:** `mc-29` (escalera de 6 tiers), D-010,
D-020, D-084.

---

## D-126 — La revisión legal de F11 es un checklist interno documentado, sin abogado externo · 2026-08-03

**Decisión del dueño** (F11), **contra la recomendación presentada**
(abogado externo). **Enmienda D-028 en su condición «se revisa con
abogado antes de habilitar prendas en cualquier mercado», y master-plan
§14.2 («antes de lanzar con menores esto se revisa con abogado»).**

**Lo que queda en su lugar:** un **checklist legal interno, escrito y
fechado**, construido desde `mc-25`, `mc-38` §12 y la investigación web
verificada del 2026-08-03 — COPPA 2025 (cumplimiento general desde
2026-04-22), GDPR Art. 8, Children's Code (15 estándares), LGPD Art. 14,
LFPDPPP post-INAI, EAA (vinculante desde 2025-06-28), DSA Art. 28 — con
cada punto marcado: cumple / no aplica / **exposición aceptada por el
dueño**. El paso 2 de F10 (prendas, D-119) se habilita cuando ese
checklist existe y su sección de prendas está completa — la condición
de D-028 se mantiene como *revisión*, pero la revisión es interna.

**El precio, dicho de frente y asumido por el dueño:** `mc-25` marca
afirmaciones `[unverified]` que solo un abogado licenciado en cada
jurisdicción puede cerrar; la LFPDPPP post-INAI no tiene postura madura;
CAADCA sigue en litigio; y «no es asesoría legal» deja de ser protección
cuando nadie la ejerce. La exposición queda entera sobre el dueño, a
sabiendas. **Condición de revisión:** la primera queja formal, el primer
mercado con multa concreta (EAA), o el primer contrato escolar que exija
papel — cualquiera convierte esta decisión en «abogado externo» de
inmediato.

**Investigación relacionada:** `mc-25`, `mc-38` §12, `mc-17`, D-028,
D-087, D-119.

---

## D-127 — El offline completo de F11 es D-047 más Web Push · 2026-08-03

**Decisión del dueño** (F11), **contra la recomendación presentada**
(solo el alcance de D-047).

F11 construye el offline completo de D-047 (descarga explícita del nivel
actual y el siguiente, cola de intentos en IndexedDB con flush en
foreground, precisión sin tablero offline, revalidación en servidor,
presupuesto de precaché vigilado, nada se baja solo) **y completa la
infraestructura de Web Push**: claves VAPID, service worker de push,
suscripción por dispositivo, permiso tras gesto con mensaje de valor —
diseñado para el piso de iOS (push solo con app instalada, `mc-33`).

**Alineación con D-105:** el cierre de F7 ya construye el primer
consumidor del canal (el recordatorio de misión al padre, #207, con
`audits/recordatorio-sin-culpa.mjs` como condición). F11 no lo duplica:
construye lo que #207 no cubra de la infraestructura (claves, SW,
suscripción) y deja el canal listo para los demás consumidores decididos
(reportes de F8, avisos de colas del dueño). **Ningún push va jamás a un
niño.**

**Lo que esto NO incluye:** Background Sync como camino confiable (solo
acelerador best-effort en Chromium — `mc-33`), ni ninguna notificación
con culpa (D-014; `recordatorio-sin-culpa.mjs` y la carta
`patrones-oscuros` lo vigilan).

**Investigación relacionada:** `mc-33`, `mc-19`, D-047, D-030, D-084,
D-105.

---

## D-128 — El banco clasifica por rama con los códigos MSC 2020 de dos dígitos, explicados en lenguaje de personas · 2026-08-03

**Decisión del dueño** (respuesta personalizada, no una de las opciones
presentadas), cerrando la pregunta 1 de `mc-51`.

Cada reto del banco lleva un campo `rama` con el **código MSC 2020 de dos
dígitos** (`11` teoría de números, `15` álgebra lineal, `26` funciones
reales, `51` geometría, `54` topología general…) — el estándar mundial,
mantenido por AMS/zbMATH, con revisión decanal, para que la
clasificación no sea una cosa más que mantener.

**Y cada código lleva su nombre en lenguaje de personas**, autorado por
locale: «números y conteo», «fracciones», «figuras y medida», «ángulos y
triángulos», «matrices», no «11 Number theory». El rigor es el del
estándar; la cara es la de una persona que no estudió matemáticas. La
tabla de equivalencia código ↔ nombre vive en el módulo de D-135, no en
el documento.

**Lo que esto cambia en `mc-51`:** el mapa de 26 códigos propios de su
§4 queda como **mapa de lectura** (de nuestras ramas a sus códigos
MSC), no como vocabulario del banco. El banco habla MSC; el producto
habla persona; mc-51 §4 es el diccionario entre los dos.

**Investigación relacionada:** `mc-51` (MSC 2020 [1][2]), D-022 (los
nombres se autoran por locale), D-122.

---

## D-129 — El auditor del piso exige ≥3 ramas distintas por nivel · 2026-08-03

**Decisión del dueño**, cerrando la pregunta 2 de `mc-51`.

`audits/piso-seis-retos.mjs` (F11) no solo cuenta: exige que cada nivel
N4-N12 tenga **al menos 6 retos Y al menos 3 ramas MSC distintas**
(D-128) entre ellos. Un nivel con seis retos de una sola materia es un
nivel incompleto — es exactamente la queja que produjo el catálogo
(«no veo cálculo, topología, teoría de números…»), y la regla que la
vuelve imposible de repetir en silencio.

**Investigación relacionada:** `mc-51` §5.2, D-070 (el auditor se
demuestra degradando el banco real), D-122.

---

## D-130 — Variable compleja y ecuaciones diferenciales entran como niveles futuros · 2026-08-03

**Decisión del dueño**, cerrando la pregunta 3 de `mc-51`.

No se declaran fuera del producto ni se publican como lectura sin
puntaje: **entran como niveles futuros del banco**, porque `mc-12`
demuestra que SÍ son auto-calificables con los mecanismos que ya
existen — integral de contorno por residuos es respuesta numérica (su
banda G3), y verificar la solución de una EDO por sustitución directa
es mecánica CAS-friendly (su banda PhD-1). Cuando el piso de D-122 esté
en producción, son las dos primeras ramas en crecer.

**Investigación relacionada:** `mc-12` (bandas G3 y PhD-1), `mc-51`
§5.3, D-124.

---

## D-131 — Las espirales de geometría y estadística son aristas débiles; las puertas duras solo donde la evidencia las tiene · 2026-08-03

**Decisión del dueño**, cerrando la pregunta 4 de `mc-51`.

El grafo de prerrequisitos del adaptativo tiene **dos tipos de arista**:
las **duras**, solo donde los ocho currículos escolares verificados
tienen la dependencia (fracciones ← división, porcentaje ← fracciones,
razón ← fracciones + multiplicación, trigonometría ← geometría +
funciones, cálculo ← funciones, análisis real ← cálculo) — el
adaptativo no ofrece el reto sin la puerta; y las **débiles**, para las
espirales (geometría, estadística): el adaptativo **recomienda** sin
bloquear («conviene repasar figuras antes de ángulos»), porque en los
ocho sistemas esos hilos corren en paralelo, no en serie.

**La regla que esto impone a futuras discusiones:** quien proponga una
puerta dura nueva trae su sistema verificado; la queja «álgebra exige
geometría básica» queda documentada en `mc-51` §2.2 como el ejemplo de
puerta que NO existe.

**Investigación relacionada:** `mc-51` §2.2, D-002 (el adaptativo decide
por habilidad estimada, las puertas solo acotan la oferta).

---

## D-132 — El puente de demostración es una pista transversal visible, no un nivel más · 2026-08-03

**Decisión del dueño**, cerrando la pregunta 5 de `mc-51`.

Las diez universidades verificadas tienen su puente de demostración
(curso explícito, integrado, o pista acelerada — `mc-51` patrón 3), y
el producto tendrá el suyo: una **pista transversal visible en el
mapa**, disponible desde que el jugador llega a N9-N10, con los
formatos de `mc-12` (detectar el error, ordenamiento de pasos, lógica
de la negación, y la pista Lean 4 de D-124 como su cima). No es un
nivel 11.5 — la escalera de 12 niveles es D-017 y no se toca — y no
queda diluido dentro de N11-N12: el patrón de las diez universidades
es que el puente tiene que ser **explícito**, y una pista con nombre
propio en el mapa es exactamente eso.

**Investigación relacionada:** `mc-51` (patrón 3), `mc-12`, D-124,
D-017.

---

## D-133 — mc-51 se mantiene con entradas fechadas en dudas.md: revisión curricular 2027 y MSC 2030 · 2026-08-03

**Decisión del dueño**, cerrando la pregunta 6 de `mc-51`.

El mecanismo es el que el proyecto ya usa para deuda con vencimiento
(D-072): entradas en `docs/dudas.md` con fecha comprometida — **2027**
(revisar los currículos en transición: México MCCEMS, streaming de
Singapur, la maquette de la Sorbonne que quedó sin verificar, A-level y
BNCC por año) y **2030** (la revisión decanal del MSC, declarada por
msc2020.org). Un auditor automático se descartó: «¿sigue vigente el
MSC?» no es comprobable determinísticamente — sería un auditor que
siempre pasa hasta que un día no, que es fallar abierto por diseño.

**Investigación relacionada:** `mc-51` §6, D-072 (el patrón), D-070.

---

## D-134 — `FUNC` (funciones) es una rama explícita del banco · 2026-08-03

**Decisión del dueño**, cerrando la pregunta añadida sobre `mc-51` §4.

**Funciones** es la puerta dura de trigonometría y de TODO el cálculo
(«cálculo exige funciones» es el eslabón 9 de la espina escolar), y una
puerta que no se puede medir es una puerta que no se puede auditar
(D-129). El catálogo de los 54 se re-etiqueta en su inserción a D1:
los retos de evaluar/graﬁcar funciones salen de `ALGE`/`EXP` y pasan a
`FUNC` (MSC `26` — funciones reales). Costo declarado: re-etiquetar
~10 retos ya autorados; beneficio: la puerta más importante de la
escolaridad queda visible para el auditor de cobertura.

**Investigación relacionada:** `mc-51` §2.1 eslabón 6 y §4, D-128,
D-129.

---

## D-135 — El grafo de prerrequisitos vive como módulo puro en `packages/motor` · 2026-08-03

**Decisión del dueño**, cerrando la última pregunta de incorporación de
`mc-51`.

`packages/motor/src/ramas.ts`: módulo puro con la tabla de ramas MSC ↔
nombre de persona (D-128), las aristas duras y débiles (D-131), y
funciones tipo `puertasDe(rama)` / `cumplePuertas(rama, estado)` —
testeable con su `ramas.prueba.mjs` en el gate, visible para los
auditores (el patrón de `tabla-bandas.mjs`), sin migración (las puertas
cambian una vez por década, D-133; la flexibilidad de D1 no se iba a
usar). El adaptativo (F4) lo importa para acotar la oferta; la
interfaz lo importa para nombrar las ramas.

**Investigación relacionada:** `mc-51`, D-135 es la materialización de
D-128/D-131/D-134.

---

## D-136 — La foto del maestro se mantiene: migración y superficie de subida · 2026-08-03

**Decisión del dueño, contra la recomendación presentada** (que era
enmendar D-011 para quitarla), cerrando dudas §24.1.

D-011 queda intacta: el padre ve **nombre, escuela y foto** del dueño
del grupo antes de aprobar. Consecuencias de implementación:

- `group_owner_identity` gana la columna `photo_r2_key` (en la `0015`
  de F9, que aún no existe — no hace falta migración aparte).
- La subida es una superficie nueva de adulto: acción explícita
  (principio de D-075), AVIF con respaldo WebP en `math-challenge-media`,
  parte del runbook de borrado de los cuatro sistemas.
- La foto es presentación, **no verificación**: la insignia sigue
  siendo la señal (`assurance`), y la tarjeta nunca la mezcla con ella
  — una foto bajada de internet no compra el ✓.

**Investigación relacionada:** D-011, D-086, dudas §24.1, plan de F9 §4
(corregido con esta decisión).

---

## D-137 — `contextual_marks` se construye de verdad: lector y ampliación del CHECK · 2026-08-03

**Decisión del dueño, contra la recomendación presentada** (que era
retirar el mecanismo), cerrando dudas §24.2.

El mecanismo de F2 vive: se construye el **lector** (la regla «se
muestra una vez por usuario» hoy no existe — ningún código hace
`SELECT` de `contextual_marks`) y se amplía el `CHECK` de `mark_code`
para las marcas nuevas (empezando por `NO_CHAT` de F9), con la
reconstrucción de tabla que eso exige en SQLite, hecha en la `0015` de
F9 con su control negativo. F9 vuelve a disparar la marca `no-chat` la
primera vez que un adulto abre un grupo — el plan de F9 §5.1 paso 6
queda corregido.

**Investigación relacionada:** dudas §24.2, D-026 (las cinco marcas),
plan de F9 §5.1.

---

## D-138 — El corte nocturno también impide empezar de madrugada · 2026-08-03

**Decisión del dueño**, confirmando lo implementado y cerrando la
pregunta 1 de la paraguas #265 (dudas §23 F8 23.1).

Con `bedtime_local` configurada, entre la hora de dormir y
`FIN_DE_LA_NOCHE` (05:00, `[criterio propio]`) no se puede **iniciar**
una sesión nueva ni continuar una en curso. Es el caso que motiva el
único ECA de `mc-26` §5: un niño despierto a la 1 a.m. que abre la
app. El costo declarado: el niño que madruga legítimamente espera a la
hora de fin de noche.

**Investigación relacionada:** `mc-26` §5, D-016, dudas §23 F8 23.1.

---

## D-139 — El límite de pantalla protege solo tras configuración del padre · 2026-08-03

**Decisión del dueño, contra la recomendación presentada Y contra lo
implementado** (dudas §23 F8 23.3). **Supera** la lectura «protección
silenciosa desde el día uno» que F8 construyó.

Sin fila en `screen_time_settings` **no hay límite diario**: el padre
decide, y la protección empieza cuando él la activa — es la lectura de
«el padre decide» que el dueño prefiere sobre la de «garantía por
default». `configuracionVigente(banda, null)` deja de devolver el
default de la banda; devuelve «sin límite». El corte nocturno no
cambia: sigue apagado por defecto (`bedtime_local` nace NULL) y es
independiente (D-138).

**Lo que esto exige en código:** cambiar `limite-pantalla.ts` y su
prueba, y el copy de la marca `LIMITE_PANTALLA` para que ofrezca
configurar en lugar de afirmar que ya hay límite. Queda como criterio
nuevo de #269 y #404.

**Investigación relacionada:** D-016, línea roja #6 (intacta: cuando el
límite existe y corta, la racha se da por cumplida), dudas §23 F8 23.3
(queda marcada SUPERADA por esta).

---

## D-140 — El sesgo de la edad del duelo queda ratificado: solo el año, siempre a favor del acceso · 2026-08-03

**Decisión del dueño**, ratificando lo implementado (dudas §23 social
23.3).

La elegibilidad del duelo (≥8, D-018) se calcula como
`añoActual − birth_year`, con error de hasta 11 meses **siempre a
favor del acceso**. Es la consecuencia directa de D-053 (solo el año):
corregir el sesgo exigiría pedir el mes — 12 veces más precisión sobre
la identidad de un menor, para nada. El duelo sigue siendo opt-in del
padre (D-081).

**Investigación relacionada:** D-053, D-081, dudas §23 social 23.3.

---

## D-141 — El descenso de liga ignora a los inactivos: ratificado como extensión de D-014 · 2026-08-03

**Decisión del dueño**, firmando la extensión que el agente implementó
sin decisión escrita (dudas §23 social 23.5).

La semana en que una familia respeta su límite de pantalla, declara una
pausa, o no juega, **la liga no se lo cobra**: no hay descenso por
inactividad. Es D-014 leída de forma consistente con la línea roja #6
y con D-091: ninguna protección del sistema puede castigar a quien la
usa. El precio declarado se acepta: una cohorte con pocos activos
apenas mueve a nadie.

**Investigación relacionada:** D-014, D-091, dudas §23 social 23.5.

---

## D-142 — Kinder no tiene modelo en vivo: 100% pregenerado · 2026-08-03

**Decisión del dueño**, cerrando F6 P-1 y **enmendando D-015** en su
lectura ambigua.

En KINDER toda explicación de Larry es **pregenerada y revisada por
humano**: instantánea, gratis, disponible offline, y sin posibilidad de
alucinación — la combinación correcta para la banda que no lee. Un
error no catalogado recibe la plantilla genérica revisada, nunca una
generación en vivo. Si algún día se reabre, es con una decisión nueva,
no por omisión.

**Investigación relacionada:** D-015 (enmendada), D-035, plan de F6
§8 P-1.

---

## D-143 — El tope de gasto de Larry vive en el Durable Object · 2026-08-03

**Decisión del dueño**, confirmando la implementación y **enmendando el
mecanismo de D-015** (F6 P-15).

El tope por perfil y por día lo hace cumplir el **Durable Object**, que
decide ANTES de gastar y puede degradar sirviendo la explicación
pregenerada revisada por humano. AI Gateway no puede hacer eso — su
única degradación es negar el servicio o cambiar de modelo, y lo
segundo está prohibido para la banda Pro. El Gateway queda como red de
seguridad en dólares, sin crear todavía (infrastructure.md ya lo
declara).

**Investigación relacionada:** D-015 (enmendada), plan de F6 §5.1,
`packages/tutor/src/gasto.prueba.mjs` (10.000 peticiones sin pasar del
tope).

---

## D-144 — La medición de costos reales de Larry se corre (~$5, una tarde) · 2026-08-03

**Decisión del dueño**, cerrando F6 P-18.

Se ejecuta la medición de costo real por explicación en vivo — el
primer entregable pendiente declarado de F6. D-085 dejó sin base la
derivación de topes desde un precio (ya no hay), así que el tope del
adulto se recalibra con datos de esta medición, no con criterio propio.

**Investigación relacionada:** plan de F6 §8 P-18, D-085.

---

## D-145 — Las 15 preguntas restantes de F6 quedan ratificadas en bloque con las lecturas del plan · 2026-08-03

**Decisión del dueño**, cerrando F6 §8 (P-2 a P-4, P-8 a P-14, P-16,
P-17) — todas construidas ya con las recomendaciones del plan.

Se ratifica en bloque lo implementado, que incluye: el conteo de
ayudas de Larry **agregado por cuenta, nunca por hijo** (P-17 — evita
el regaño por la puerta de atrás, Maloney et al. 2015 vía mc-10), el
interruptor de transcripción para el padre que co-juega (P-23 en su
parte), y las trece lecturas restantes del §8 del plan de F6. Cada una
puede reabrirse individualmente con una decisión nueva que la cite.

**Investigación relacionada:** `docs/planes/f6-larry-profe.md` §8,
D-015.

---

## D-146 — Las redirecciones 301 del corpus se mantienen para siempre · 2026-08-03

**Decisión del dueño**, cerrando dudas §6.

Las 301 de las URL viejas traducidas (D-049) **no caducan**: cuestan
una línea en `rutas-tabla.mjs`, y los enlaces entrantes del corpus son
el activo SEO de D-033 — romperlos es perder autoridad ganada en
papers, foros y citas que siguen vivas.

**Investigación relacionada:** D-049, D-033, `mc-48`.

---

## D-147 — La rama LOGI («Acertijos») existe en todos los niveles desde N4, adicional al piso de 6 · 2026-08-03

**Decisión del dueño**, cerrando las cuatro preguntas de `mc-52` §6
(petición original del dueño: «que los niños después del kinder ya vean
lógica booleana y tablas de verdad… es la base de la programación y
tienen que conocerla»).

- **La rama LOGI se extiende a todos los niveles N4-N12** con la
  escalera de `mc-52` §2: atributos compuestos (N4-N5), acertijos
  narrativos (N6-N7), tablas de verdad pequeñas (N8-N9), De Morgan
  (N10), predicados y negación de cuantificadores (N11-N12).
- **Los retos LOGI son ADICIONALES al piso de 6 retos por nivel**
  (D-122): la lógica es transversal —base de programación y de la
  demostración—, no una materia del nivel. Cada nivel tiene así su
  cuarta rama garantizada (D-129).
- **La tabla de verdad formal entra en N8**, después de atributos y
  acertijos: la tabla es la foto del razonamiento, nunca el punto de
  partida (Mathematics Manifesto: 11-14).
- **El nombre de persona de la rama es «Acertijos»**, autorado por
  locale (D-128); el código MSC `03` va debajo, nunca en pantalla.
- **Kinder queda fuera** (lo que el dueño pidió: «después del kinder»):
  la trayectoria de numeración de `mc-06` tiene prioridad a esa edad,
  aunque Bebras tenga sets 5-6.

**Investigación relacionada:** `mc-52` (Bebras, Smullyan/MAA, la
evidencia honesta de Hsu et al. 2018), D-122, D-129, D-132 (es la base
de la pista de demostración).

---

## D-148 — La celebración vive en CSS propio, en tres intensidades, con un toggle por perfil · 2026-08-03

**Decisión del dueño**, cerrando la ola de efectos.

- **Sin librería nueva**: los efectos de celebración se construyen en
  CSS propio (la técnica que ya usa `reto.css`), cero dependencia que
  auditar y cero peso — el mercado es Android gama baja (mc-47).
  `canvas-confetti` queda como opción descartada por escrito.
- **Tres intensidades**: acierto normal (micro-animación de ~220 ms +
  frase nueva, D-149), reto completado (efecto mayor + frase de
  cierre), hito de racha/dominio (el momento «mascota cobra vida»).
- **El toggle de efectos es POR PERFIL, no por cuenta** (precisión del
  dueño: «tal vez uno sí con sonido y otro no»): cada perfil de hijo
  tiene su propio ajuste, persistente, y el adulto el suyo.
  `prefers-reduced-motion` se respeta siempre encima de todo
  (tokens.css ya lo aplana).
- **Al fallar:** como hoy (la causa explicada sin juicio) más **Larry
  pensativo amable** — el estado `thinking → presenting` que `mc-37`
  prefiere. **Ningún efecto de reprobación, jamás**: el «booo» cruza la
  línea roja #7, `mc-11` y `mc-10`, y queda descartado por escrito.

**Investigación relacionada:** `docs/planes/ux-celebracion-mapa-y-voz.md`,
mc-17 §11, mc-38, línea roja #7.

---

## D-149 — Piso de 150 frases de acierto por locale, autoradas, con rotación determinista · 2026-08-03

**Decisión del dueño**, con la precisión que cambia el alcance:
**«150 no es un tope, es el piso»** — al menos 150 frases de acierto
por locale, en los 7 locales, autoradas (nunca traducidas, D-022),
siguiendo el canon de `mc-11` (elogio al proceso, jamás al rasgo, jamás
comparación, jamás conteo de fallos — verificado por
`larry-nunca-averguenza` extendido al nuevo diccionario).

**La selección es rotación determinista** (D-092: nada aleatorio, ni
gratis): `índice = hash(día_local, contador_aciertos) mod N` — se
agotan antes de repetir y el orden es reproducible y auditable. Las
frases viajan como claves en `i18n/reto/` (el patrón de las 86 de hoy),
y el servidor elige, nunca el cliente.

**Investigación relacionada:** mc-11, D-014, D-022, D-092.

---

## D-150 — El avance al siguiente ítem es semi-automático tras el veredicto · 2026-08-03

**Decisión del dueño**, cerrando la ola de navegación del reto.

Tras leerse el veredicto en voz (o tras su pausa equivalente sin voz),
**el siguiente ítem llega solo** — el niño no tiene que entender la
navegación para seguir jugando. El botón «Siguiente» sigue visible
siempre, y **tocar cualquier cosa pausa** el avance. La pausa tras
acierto es larga (que el momento de celebración de D-148 se viva
completo); tras fallo, la pausa cubre la explicación entera de la
causa.

**Investigación relacionada:** Duolingo «Continue»
(blog.duolingo.com), mc-42 §3, `ux-celebracion-mapa-y-voz.md` §4.2.

---

## D-151 — La salida del reto es un botón de esquina que cierra la sesión en el servidor · 2026-08-03

**Decisión del dueño**, cerrando la ola de navegación del reto.

«Ya terminé» deja de ser un `<a href>`: pasa a ser un **botón de
esquina** (ícono de puerta, 48 px, mismo lugar en todas las pantallas —
previsibilidad de `mc-38`) que hace **POST al servidor**: cierra la
sesión del reto y **otorga el bono de finalización** — arregla el hueco
declarado de #192/`progreso.ts:51` («hoy nadie observa el final de un
reto»). La acción `terminar` se añade a `/api/jugar` junto a
`siguiente` y `responder`.

**Investigación relacionada:** #192, dudas §25.3, `ux-...` §1.1.

---

## D-152 — El mapa es el catálogo visual de niveles: enrutado, con arte Recraft, al nivel de diseño de un mapa de niveles tipo Angry Birds · 2026-08-03

**Decisión del dueño**, con la precisión de estándar: «que el mapa y el
modo historia sea como el de Angry Birds o algo así de gráficos — un
mapa que va avanzando de reto en reto y puedes regresar».

- El sendero KINDER y el árbol ya construidos **se enrutan**: un toque
  en el lugar en curso lleva al reto; el mapa es la entrada, no solo la
  reja de caras.
- **Avance de reto en reto, revisitable**: los lugares completados se
  pueden rejugar siempre (nada se bloquea hacia atrás — coherente con
  «nada se tacha y nada regresa» de `guia-de-estilo.md` § mapa).
- **Arte por lugar con Recraft** (continuidad con Larry, AVIF/WebP):
  cada lugar de la Sabana y cada nodo del árbol con su imagen; el hueco
  `◍` de `Companero.astro` se llena. La Sabana no habla (D-019): el
  arte se autora una vez y sirve a los 7 locales.
- La selección de dificultad sigue siendo del motor (D-017): el mapa
  presenta, no pregunta el nivel.

**Investigación relacionada:** D-019, D-080, `guia-de-estilo.md`,
`ux-...` §4.3.

---

## D-153 — La voz del navegador gana emoción prosódica, fraseo, mejores voces y números hablados · 2026-08-03

**Decisión del dueño**, cerrando la ola de voz — dentro de
`speechSynthesis` (D-078), sin SSML (la Web Speech API no lo tiene).

- **Perfiles de prosodia por tipo de mensaje:** celebración
  (`rate ~1.05`, `pitch ~1.2`), explicación (`rate 0.9`, `pitch 1.0`),
  ánimo tras fallo (`rate 0.85`, `pitch ~0.95`), aviso de límite
  (`rate 0.85`, pausas). La prosodia ES el canal de emoción de esta
  API.
- **Fraseo por frases:** el veredicto se corta en 2-3 utterances con
  pausas naturales, no una sola corrida.
- **Mejor selección de voz:** heurística que prefiere voces
  «natural/neural/premium/enhanced» del SO, manteniendo la regla de
  D-078 (sin voz del locale, no se ofrece y la pantalla lo dice).
- **Dicción de números:** `numerosHablados()` (autorado en los 7
  locales, hoy sin llamador) se cablea: los números se leen en
  palabras, no dígito a dígito.
- **Límite declarado:** la emoción alcanzable es prosódica, no actoral.
  La voz actoral es audio pregenerado (la pista de F6 P-19), no esta
  API.

**Investigación relacionada:** D-078, `packages/tutor/src/voz.ts`,
`ux-...` §4.4.

---

## D-154 — El toggle de efectos es por perfil y se persiste por dispositivo · 2026-08-03

**Decisión del dueño** (precisión dicha dentro de la ola de efectos,
registrada aparte porque cambia el modelo de datos).

El ajuste de efectos vive **por perfil** (`child_profiles` para cada
hijo, `users` para el adulto) — no en la cuenta del padre — y se
persiste por dispositivo (mismo patrón que el conmutador de voz,
`localStorage["mc:voz"]`, con respaldo en el perfil para el siguiente
dispositivo). Un hermano con efectos y otro sin, en el mismo aparato.
`prefers-reduced-motion` siempre encima.

**Investigación relacionada:** D-148, mc-38 (control persistente de
movimiento/sonido, implicación 6).

---

## D-155 — El segundo padre se vincula al hogar por código de invitación, con los mismos derechos · 2026-08-03

**Decisión del dueño**, abriendo el modelo que `mc-27` nunca tuvo y que
el esquema nunca soportó (un solo `parent_user_id` por perfil).

- El padre A genera un **código de invitación al hogar** (el patrón de
  D-113: 6 caracteres, sin ambiguos, revocable); el padre B lo usa y
  queda vinculado **con los mismos derechos** sobre los mismos hijos.
- **La regla de conflicto, escrita desde hoy:** cualquiera de los dos
  puede aprobar, y **cualquiera de los dos puede revocar** — ante una
  contradicción entre los dos padres sobre un dato o un acceso del
  niño, **gana el que protege** (el mismo principio que resolvió la
  contradicción #242/#243 en dudas §23.1). Un consentimiento revocado
  por uno queda revocado aunque el otro lo aprobó. Todo acto registra
  quién lo hizo y cuándo — la bitácora no miente sobre cuál de los dos
  fue.
- Esquema: tabla `household_link` (user_id del invitado, inviter_user_id,
  código, created_at, revoked_at) — los `child_profiles` no cambian de
  dueño; el vínculo es del hogar, no una segunda FK por hijo (la
  lectura «hijos del hogar» pasa a ser: perfiles cuyo `parent_user_id`
  es A o es alguien vinculado al hogar de A).
- Los dispositivos del hogar (`household_devices`) pasan a leerse por
  hogar, no por cuenta — cualquiera de los dos puede marcar y revocar
  un aparato, con registro.

**Investigación relacionada:** `mc-27`, D-012, D-013, D-051, D-113.

---

## D-156 — La competencia familiar es una vista sobre el hogar, con las dos listas separadas · 2026-08-03

**Decisión del dueño**, cerrando el contenedor de la competencia
familiar.

**Sin estructura social nueva.** La pantalla de la familia es una vista
sobre el hogar (D-155): los hijos (alias, racha, puntos — de
`score_totals` y `child_streak`) en **su** lista, y los padres y
adolescentes-usuarios (`is_learner`, de `score_totals_adulto` y la
racha polimórfica de 0007) en **la suya**, en la misma pantalla. Las
dos listas nunca se unen ni se rankean juntas — es D-027 aplicado a la
familia: un niño y un adulto no comparten tabla, ni en casa. La
comparación sana vive en el reto común (D-157), no en un marcador
unificado.

**Investigación relacionada:** D-027, D-084, migraciones `0007`, `0012`.

---

## D-157 — La familia se reta con las tres mecánicas, y se echa porras entre todos · 2026-08-03

**Decisión del dueño** (respuesta personalizada: «los 3 puntos aparte
entre todos se echan porras y se motivan»), cerrando la mecánica de la
competencia familiar.

- **El reto del día familiar:** el mismo reto para todos, asíncrono —
  molde `club_challenge` de F10 (set congelado), con el set **generado
  por participante según su nivel** (papá en N9 e hija en N5 no pueden
  jugar los mismos ítems; la tabla del día compara su desempeño cada
  uno contra su propio nivel, no el puntaje crudo — es la lección de
  `mc-18` aplicada en casa).
- **El duelo familiar 1:1:** asíncrono, molde `league_duel` — «reto a
  mi hermano», con el mismo set para ambos cuando los niveles lo
  permiten y sin ventana de presencia (condición 2 de D-081).
- **La tabla semanal familiar:** la vista de D-156 con el acumulado de
  la semana — nunca lenguaje de pérdida, y el último lugar nunca se
  anuncia como tal (la regla de `racha-lexico` también en casa).
- **Las porras:** un toque para animar a otro miembro de la familia,
  con un conjunto cerrado de reacciones (nunca texto libre — la línea
  roja #3 aun entre adultos del hogar, por consistencia de esquema) y
  **dirigidas, no agregadas**: dentro del hogar los miembros ya se
  conocen, así que la objeción de F7 a las reacciones dirigidas entre
  niños de liga (un canal nuevo entre dos niños específicos) no
  aplica. Fuera del hogar, la regla de F7 sigue intacta: nada de
  porras dirigidas.

**Investigación relacionada:** D-156, D-081, `mc-18`, `mc-16` (la
motivación de pertenencia), F7 ligas §6.3 (la reacción que allá se
descartó y aquí sí entra).

---

## D-158 — La familia es una fase nueva: F12 · Núcleo familiar · 2026-08-03

**Decisión del dueño**, ordenando el trabajo de D-155 a D-157.

«La familia es el principal núcleo de competencia sana» — el dueño,
2026-08-03. El trabajo se organiza como **F12 · Núcleo familiar**:
vínculo del segundo padre (D-155), la vista de competencia familiar
(D-156), y los retos y porras (D-157). Depende de F2 (cuentas,
dispositivos), F7 (racha, XP, ligas como molde) y comparte moldes con
F10 (`club_challenge`) sin tocar el club de adultos. Master-plan §13.2
gana su fila en el mismo commit.

**Investigación relacionada:** D-155, D-156, D-157, `mc-27`.
## D-159 — Los tipos de misión sin fuente de eventos no fabrican progreso · 2026-08-03

**Decisión:** mientras no exista la fuente de eventos de un tipo de misión,
ese tipo puede salir asignado pero **no muestra progreso inventado**: ocho de
los diez tipos del catálogo (D-092) dependen de algo que todavía no existe —
`repaso`, `dominio` y `fluidez` del resumen de F4; `problema`, `precision` y
`descubre` de los modos de D-018; `duelo` y `meta_de_liga` de la liga en
producción. Solo `volumen` (ítem contestado) y `variedad` (habilidad distinta
del día) tienen fuente real hoy.

La alternativa rechazada: avanzar esas misiones con proxies («contestó algo»
cuenta como repaso). Una misión que progresa sola enseña que las misiones no
miden nada — y la línea roja #5 exige que el jugador pueda saber de antemano
cuánto vale cada cosa, lo que incluye que el contador signifique lo que dice.

Cuando cada fuente aterrice (F4, los modos, la liga), el tipo se enciende sin
cambiar el motor: la elegibilidad ya está en el catálogo y
`mision-slot-nunca-vacio` garantiza que el menú nunca queda vacío mientras
tanto — la rotación rellena con los tipos incondicionales.

Queda como regla escrita porque el D-PENDIENTE del frente de misiones (#409)
y el del DO (#224) apuntaban aquí: el avance sin fuente NO se simula, se
declara.

## D-160 — La meta de KINDER para el recordatorio es «jugó hoy» · 2026-08-03
> **Renumerada (2026-08-03):** escrita como D-128 por el frente de F7 en paralelo;
> el número chocaba con la D-128 de la sesión de F9-F12 (MSC de ramas). La
> asignación del orquestador la fija en D-160. Referencias en
> `apps/web/src/lib/push-hogares.*` actualizadas en el mismo merge.

**Decisión:** para el recordatorio push del padre (#207), la «meta completada»
de un niño de KINDER es **haber jugado hoy** — `child_streak
.last_completed_local_date` igual al día local del hogar. Las demás bandas
siguen midiéndose por fila de `mission_daily_summary` completada. Contestada
por el dueño el 2026-08-03 de forma interactiva.

El problema que cierra: KINDER no escribe fila de misión (D-104 — su «misión»
es el reto HISTORIA del día, una etiqueta interna), así que leer misiones era
leer «nunca completada», y el recordatorio habría sonado **todos los días** en
hogares de kinder aunque el niño hubiera jugado — exactamente el ruido que
`mc-19` enseña a no fabricar (un recordatorio que no distingue se desactiva, y
el que se desactiva no vuelve).

Por qué la racha y no otra fuente: «jugó hoy» es literalmente lo que la meta de
KINDER es (D-091: el día se cuenta en el primer ítem contestado, y en KINDER
la racha se registra aunque no se muestre). No hay dato nuevo que guardar y
ninguna columna que añadir: `theme_band` ya está en `child_profiles` y la racha
ya está en `child_streak`.

**La frontera, dicha:** la racha NO se vuelve la meta de las demás bandas. Un
niño de PRIMARIA que juega sin completar ninguna misión sigue contando como
pendiente — la regla está probada como caso explícito en
`apps/web/src/lib/push-hogares.prueba.mjs`, ejecutado contra SQLite de verdad.

## D-161 — Rango y Nivel son dos ejes con dos nombres: Q2 se llama «Rango», Q3 es una sola escalera, y el mapa es un tercer eje · 2026-08-03

> **Renumerada (2026-08-03):** su propio marcador «Numeración pendiente — el
> orquestador asigna el número» se resuelve aquí: D-161. El D-129 que pedía el
> frente queda asignado a esta decisión; la D-129 de la sesión de F9-F12
> (≥3 ramas por nivel) conserva su número.

**Decisión:** quedan contestadas por escrito las dos preguntas abiertas de
`docs/planes/f7-juego.md` §13 que la issue #195 exige cerrar antes de que
«mapa» o «ligas» construyan sobre este eje. Las dos ya estaban resueltas DE
HECHO —una por una decisión posterior, otra por el código aterrizado— y esta
entrada lo que hace es dejarlo dicho, con fecha y con la consecuencia de
interfaz que lo hace cumplible.

**Q2 — el nombre del eje de XP es «Rango».** D-055 (2026-08-01) ya lo usa de
forma normativa: «el eje de progreso de F7 (XP → Rango)», «Progresar de Rango
(personal)», «un Rango ya ganado». La curva aterrizada en #194
(`packages/motor/src/xp.ts`) lo implementa con ese nombre (`rangoDeXp`,
`RANGOS_PUBLICADOS`, `EventoDeRango`). Se descartan las dos alternativas de la
pregunta original: los títulos temáticos de la Sabana (habrían atado el eje de
progreso al canon de D-019, que es de KINDER, y el eje es de por vida y de
todas las bandas) y el «sin nombre» (un número sin etiqueta es exactamente la
ambigüedad que #195 existe para prohibir).

**Q3 — una sola escalera de Rango, universal.** Es lo que #194 ya construyó y
lo que la base ya guarda: un solo `RANGO_ESCALA`, una sola fórmula de umbrales
(`umbralXpParaRango`), y `xp_totals` **sin columna `theme_band`** (0007). Se
descartan las cinco escaleras por tema visual: 5× la calibración y el
mantenimiento a cambio de una incomparabilidad que ya se garantiza por regla,
no por estructura — la regla de abajo.

**La regla que sostiene Q3: el Rango nunca ordena a nadie contra nadie, y menos
entre bandas (D-003).** El Rango 10 de un niño de KINDER y el de un adulto
SERIO no representan el mismo esfuerzo, y por eso ninguna pantalla ni ninguna
consulta ordena por Rango: `xp_totals` no tiene banda precisamente para que la
comparación entre bandas sea imposible por construcción, y dentro de una banda
el orden competitivo es de los puntos (`score_totals`, D-025), nunca del XP.
`audits/rango-vs-nivel.mjs` bloquea cualquier `ORDER BY` sobre `total_xp` y
cualquier columna de banda o período que alguien intente añadir a `xp_totals`.

**El mapa de progreso es un TERCER eje, distinto de los dos.** Rango mide XP
acumulado (`xp_totals`, nunca baja — D-055); Nivel de dificultad mide dónde
trabaja el niño pedagógicamente (1–12, D-017, y su número no se le enseña a
nadie); el mapa mide dominio por habilidad (`skill_state.mastered_at`, D-019).
Las tres cosas se mueven por separado a propósito: un niño puede subir de Rango
sin desbloquear mapa nuevo (fluidez de algo ya dominado) y desbloquear mapa sin
que el número de Rango sea la noticia. Ninguna pantalla presenta uno como
señal de otro.

**La consecuencia de interfaz (la regla de naming que #195 pide):**

- «Rango» nombra SIEMPRE el eje de XP, y ninguna cadena visible usa la palabra
  «Nivel» para el XP (ni «Level», «Niveau», «Nível» ni «Stufe» en los otros
  seis locales — son las palabras del eje de dificultad).
- El número de nivel de dificultad no aparece en ninguna cadena visible
  (D-017, criterio #100) — lo vigilan `audits/mapa-sin-numero-de-nivel.mjs` en
  el mapa y `audits/rango-vs-nivel.mjs` en el resto de la interfaz.
- Las excepciones actuales —todas en superficies del PADRE o públicas, como la
  marca que explica los dos ejes al crear el primer perfil (D-026) o la página
  pública `/niveles/`— están escritas a mano, una por una y con su justificación,
  en `audits/rango-vs-nivel.mjs`. Una excepción nueva se añade a mano o el
  auditor bloquea.

**Investigación relacionada:** `mc-16` (XP separado del número competitivo),
`mc-10` (la presión de rendimiento empeora el desempeño: por qué el número de
nivel no se enseña), `mc-43` (progreso e identidad). Cierra las preguntas Q2 y
Q3 de `docs/planes/f7-juego.md` §13 y el cuarto criterio de aceptación de #195.

---

## D-162 — Las apps se llaman Teacher, School y Console: inglés neutro, marca, y un bundle por app · 2026-08-03

**Decisión del dueño** (respuesta personalizada: «nombres en inglés y
neutros por el tema de los diferentes mercados»), cerrando la ola 1 de
la ronda de las apps de tienda.

- **Math Challenge Teacher** (la del maestro), **Math Challenge School**
  (la de la escuela), **Math Challenge Console** (la consola de
  administración). Inglés neutro para todos los mercados; **son marca y
  no se traducen** (regla del corpus: los nombres propios no se
  traducen).
- **Bundle IDs:** `com.kilowatto.mathchallenge.teacher`, `.school`,
  `.console` — y la app principal queda libre en
  `com.kilowatto.mathchallenge` para cuando exista. Los bundle IDs no se
  pueden cambiar después en las tiendas: quedan escritos aquí como la
  única fuente.
- **Iconos:** Larry con fondo distinto por app (continuidad Recraft; se
  distinguen en la pantalla de inicio sin abrir otra línea de arte).
- **Console se queda como PWA instalada** (sin tienda): su usuario es
  una persona y el mantenimiento de 4 canales para una herramienta
  interna no se justifica hoy. Si el equipo de revisión crece, se
  empaqueta después — la arquitectura lo permite igual.

**Investigación relacionada:** `docs/planes/apps-tienda-investigacion.md`.

---

## D-163 — El modelo de identidad de las tres apps: el maestro es usuario primero, la escuela son sus maestros, la consola es otro set de usuarios · 2026-08-03

**Decisión del dueño** (respuesta personalizada en la ola 2, y
confirmada en la 36: «el maestro es un usuario antes que nada y puede
estar solo sin escuela, pero los papás son los que autorizan formar al
grupo al final con los candados ya establecidos»).

- **Teacher:** el maestro es un **usuario normal del producto primero**
  (la cuenta de D-082). Puede existir **solo, sin escuela** — con la
  insignia «sin verificar» de D-086 — y **los padres son quienes
  autorizan la entrada de cada niño a su grupo**, con los candados de
  F9 intactos (tarjeta de identidad, aprobación registrada, revocable,
  D-011/D-110). La escuela es una capa de confianza adicional, nunca la
  puerta.
- **School:** la escuela **no es una cuenta aparte — sus maestros son
  sus accesos**: opera a través de `school_teacher` (la lista viva de
  quién actúa a nombre de la institución).
- **Console:** un **set de usuarios distinto** del producto — una lista
  propia de administradores, no cualquier cuenta registrada — protegida
  además con **basic auth extra** encima del login.

**Investigación relacionada:** D-082, D-086, D-011, D-110, plan de F9
§5.2.

---

## D-164 — Las tres apps viven en subdominios propios · 2026-08-03

**Decisión del dueño**, contra la recomendación presentada (mismo
dominio).

`teacher.kilowatto.com`, `school.kilowatto.com` y
`console.kilowatto.com` (o el patrón que DNS permita igual). Cada
subdominio lleva **su propio manifest, su propio `start_url`, su propio
`assetlinks.json`** y su propia revisión de seguridad — la separación
real de cookies y superficie que el dueño prefiere sobre la simplicidad
de un solo dominio. La ruta al contenido compartido (sesión, motores)
sigue siendo una sola base de código (D-163 no cambia eso).

**Investigación relacionada:** `apps-tienda-investigacion.md` §3.

---

## D-165 — Sesión compartida para Teacher y School; la Console con su set, basic auth y passkey obligatoria · 2026-08-03

**Decisión del dueño** (la 7 se contestó con recomendación propia del
agente, aceptada).

- **Teacher y School comparten la sesión del producto** (`mc_s`, 30
  días): los mismos humanos, el mismo login — un segundo alta sería la
  fricción que D-082 eliminó.
- **Console:** su set de usuarios distinto (D-163) + **basic auth
  extra** + **passkey obligatoria sin fallback de contraseña** — la
  superficie más sensible del producto solo entra con el factor más
  fuerte disponible (D-038).

**Investigación relacionada:** D-038, D-052.

---

## D-166 — iOS: Capacitor con biometría y push nativo, iPhone e iPad con layout propio, Teacher sale sola primero · 2026-08-03

**Decisión del dueño**, cerrando la ola de iOS.

- **Empaquetado Capacitor** con **dos** capacidades nativas desde el
  día uno: **biometría** (Face ID/Touch ID — WebAuthn ya existe, D-038)
  y **push nativo (APNs)**. Es la respuesta más fuerte disponible a la
  guideline 4.2.
- **iPhone e iPad como dos dispositivos de primera clase, no uno
  estirado**: layout propio de iPad con Split View/Stage Manager
  soportados (D-041 aplica también a las apps de adultos).
- **Teacher sale sola primero** a revisión; School después con la
  lección aprendida.
- **Si Apple rechaza por 4.2:** se refuerza lo nativo y se reenvía
  **una vez**; si cae otra vez, iOS se queda en PWA instalada y queda
  documentado por qué — la tienda es añadido, nunca requisito (D-179).

**Investigación relacionada:** `apps-tienda-investigacion.md` §2
(guideline 4.2 verificada), D-041, D-038.

---

## D-167 — Android: Bubblewrap, Play App Signing, track interno → cerrado → producción, y Lighthouse medido · 2026-08-03

**Decisión del dueño**, cerrando la ola de Android.

- **Bubblewrap** (GoogleChromeLabs) para generar la TWA.
- **Google Play App Signing**: Google guarda la llave de firma — el
  riesgo del keystore perdido desaparece por construcción.
- **Track interno → cerrado → producción**: el cerrado con maestros y
  escuelas semilla antes de la producción general.
- **Lighthouse ≥ 80 medido y registrado** sobre cada superficie antes
  de subir su ficha, con el resultado pegado en el PR de tienda.

**Investigación relacionada:** `apps-tienda-investigacion.md` §2.

---

## D-168 — Escritorio después del móvil: Windows por PWABuilder/Microsoft Store, macOS por Tauri firmado · 2026-08-03

**Decisión del dueño**, cerrando la ola de escritorio.

- El escritorio llega **después** de las dos tiendas móviles.
- **Windows:** PWABuilder → Microsoft Store (la PWA sin shell, sin
  binario que mantener).
- **macOS:** **Tauri**, firmado y notarizado con la cuenta Apple
  Developer del dueño (la misma de iOS).
- **La meta del frente son las cuatro tiendas** (Google Play, App
  Store, Microsoft Store, macOS App Store) — ver D-179.

**Investigación relacionada:** `apps-tienda-investigacion.md` §2.

---

## D-169 — Teacher nace de la semilla de F9, con home de alertas, foto con recorte y push completo · 2026-08-03

**Decisión del dueño**, cerrando la ola de Teacher.

- La superficie de F9 (`/app/grupos/`) **es la semilla**: mismo código,
  `start_url` que aterriza ahí. Cero duplicación del roster.
- **La home del maestro son alertas y pendientes** (foto por subir,
  escuela por vincular, miembros nuevos, solicitudes por revisar) — lo
  accionable primero, el roster un toque después.
- **La foto del maestro se sube en la app con recorte** (acción
  explícita del adulto, AVIF/WebP a R2, parte del runbook de borrado —
  D-136).
- **Push completo para el maestro:** aprobaciones de padres, reportes
  resueltos, actividad semanal — todo texto de push pasa por la carta
  `patrones-oscuros` como cualquier notificación del producto, y
  **ningún push va jamás a un niño** (la regla de D-105 se mantiene).

**Investigación relacionada:** D-107, D-136, D-105, D-084 (techos).

---

## D-170 — School: creación abierta con revisión, documento subido en la app, y gestión de maestros con sus salones (sin niños) · 2026-08-03

**Decisión del dueño**, cerrando la ola de School.

- **Cualquier adulto registrado crea su escuela**, que nace `pending`
  hasta la revisión (D-089/D-090).
- **El documento de verificación se sube en la app** (foto del
  membrete, acción explícita del adulto → R2 → cola de la Consola).
- La escuela **lista, invita y revoca maestros** (`school_teacher`, con
  bitácora), y **ve los salones de su escuela en conteos sin datos de
  niños** (cuántos activos, cuántos miembros — nunca alias de esta
  vista).

**Investigación relacionada:** D-086, D-089, D-090.

---

## D-171 — School VE datos de alumnos como el maestro: la lista cerrada de D-027, solo personal autorizado, con bitácora de lectura · 2026-08-03

**Decisión del dueño, contra la recomendación presentada** (que era:
la escuela nunca ve datos de alumnos).

El personal de la escuela ve **exactamente lo que ve el maestro** de
los salones de su institución: **alias, racha y puntos** — el techo de
D-027 no se mueve (nunca nombre real, edad exacta ni otros grupos). Con
tres candados que son la condición de esta decisión, no un añadido:

1. **Solo personal con `school_teacher` activo** en una escuela
   **verificada** (`verification_status = 'verified'`).
2. **Bitácora de lectura**: cada consulta de esa vista registra quién
   miró qué salón y cuándo — el primer dato de acceso a datos de
   menores que el producto guarda, guardado a propósito porque el
   círculo se amplía del dueño del salón al personal de la escuela.
3. La lista cerrada sigue sin poder crecer por esta vía: ningún campo
   nuevo visible sin una decisión nueva.

**Investigación relacionada:** D-027, D-086, D-089, mc-25.

---

## D-172 — Console v1: las tres colas, cierre de recepción de escuelas con lista de espera, acciones con bitácora, tiempo de respuesta visible, y multi-revisor desde ya · 2026-08-03

**Decisión del dueño**, cerrando la ola de la Consola. **Enmienda D-102**
(que fijaba un solo operador sin infraestructura de equipo).

- **Las tres colas:** escuelas pendientes (D-089/D-090), reportes de
  grupos (D-116), apelaciones de prendas (D-121).
- **Cierre de recepción:** la Consola puede cerrar el alta de escuelas
  nuevas; las que lleguen entran a una **lista de espera** visible.
- **Acciones con efecto real y bitácora:** aprobar escuela (la
  transacción de D-086 que eleva `assurance` de sus maestros),
  rechazar, revocar dueño, cerrar reporte — cada acción con quién y
  cuándo.
- **El tiempo de respuesta es visible:** antigüedad del pendiente más
  viejo y mediana semanal (D-089).
- **Multi-revisor desde ya** (contra D-102): asignación de pendientes
  entre revisores, `reviewed_by` siempre lleno. D-102 queda enmendada
  en su «diseño para uno»; el resto (sin pantalla de admin pública para
  otros roles, runbook como respaldo) sigue.

**Investigación relacionada:** D-089, D-102, D-116, D-121.

**Nota 2026-08-12 (revisión de decisiones) — D-102 no tiene entrada
propia.** `D-100`, `D-101` y `D-102` cayeron dentro del rango que D-107
dice que "los números los reparte el orquestador" (F7 en sesión paralela,
D-093 a D-106), pero a diferencia del resto de ese rango, estos tres
nunca se escribieron bajo su propio encabezado en ningún commit de este
archivo — confirmado con `git log --all -S "## D-10{0,1,2}"`, cero
resultados. Lo que se sabe de D-102 es solo lo que ESTA entrada cita de
memoria: fijaba «un solo operador sin infraestructura de equipo». Si el
dueño tiene el texto original (otro documento, otra sesión), vale la pena
pegarlo aquí con su fecha real; si no aparece, esta nota es el registro
de que la referencia es de segunda mano.

---

## D-173 — Las tres apps salen en los 7 locales desde el día uno, con copy autorado y diccionarios compartidos con prefijos · 2026-08-03

**Decisión del dueño**, contra la recomendación presentada (4 locales
primero).

Las apps de adultos salen en **los 7 locales desde el día uno** — no
cargan el acotamiento legal de F9 (D-087), que es sobre superficies con
menores. El copy se **autora por locale** (D-022), los nombres quedan
como marca (D-162), y los diccionarios son **los del producto con
prefijos** (`teacher*`, `school*`, `console*`) — un solo sistema i18n,
los auditores de locale ya lo miran.

**Investigación relacionada:** D-022, D-087, D-126.

---

## D-174 — Datos de las tres apps: misma D1, telemetría con D-037, documentos en R2, y el runbook de borrado extendido · 2026-08-03

**Decisión del dueño**, cerrando la ola de datos.

- **Misma D1** (`math-challenge-db`), tablas nuevas solo cuando haga
  falta (`school` ya existe de F9; `household_link` de F12).
- **Telemetría citando D-037** (superficies de adulto, como el panel):
  embudo de adopción de las apps (¿el maestro termina de crear su
  salón?).
- **Documentos de verificación en R2** con retención declarada en el
  checklist legal (D-126).
- **El runbook de los 4 sistemas se extiende:** borrar una cuenta borra
  su escuela (con sus maestros desvinculados), sus documentos, sus
  membresías y su historial de revisión.

**Investigación relacionada:** D-013, D-037, D-126, mc-32 riesgo #7.

---

## D-175 — Auditores de las tres apps: los existentes con alcance, la frontera de la Consola auditada, matriz manual por app, y auditores de tienda cuando existan · 2026-08-03

**Decisión del dueño**, cerrando la ola de auditores.

- Los auditores existentes aplican con **alcance ampliado** a
  `/teacher/`, `/school/`, `/console/` (el patrón de F9/F10).
- **`audits/consola-solo-dueno.mjs`**: falla si cualquier ruta de la
  Consola responde a una cuenta fuera del set de administradores
  (D-163), o si el set crece sin decisión. Control negativo: cambiar la
  cuenta de prueba y verlo bloquear (D-070).
- **La matriz de verificación manual por app y plataforma** (Teacher y
  School en Android TWA, iPhone, iPad con Split View; Console en PWA de
  escritorio) — lo que un auditor no ve, se juega a mano (la lección de
  #451).
- **Auditores de tienda cuando las envolturas existan:**
  `assetlinks.json` con el fingerprint correcto, los manifests con su
  `start_url`, los iconos por app.

**Investigación relacionada:** D-032, D-070, D-163.

---

## D-176 — Operación de tiendas: fichas del agente firmadas por el dueño, capturas reales, clasificación Everyone, privacy labels con borrador · 2026-08-03

**Decisión del dueño**, cerrando la ola de operación.

- **Las fichas las redacta el agente** con la voz del sitio
  (`por-que-existe.md`) **y el dueño las aprueba** antes de subirlas.
- **Capturas reales** de las apps corriendo (simulador + dispositivo
  físico) — Apple rechaza capturas que no representan la app.
- **Clasificación Everyone** (las apps son DE adultos; los datos de
  menores van con alias). Kids/Family queda descartado por escrito: eso
  invocaría las reglas de apps usadas POR niños, que no es el caso.
- **Privacy labels de Apple y Data safety de Google:** borrador del
  agente desde el mapa real de datos, firma del dueño.

**Investigación relacionada:** `por-que-existe.md`, D-013, D-126.

---

## D-177 — F13 con sub-frentes: webs primero, tiendas después, y la meta son las cuatro tiendas · 2026-08-03

**Decisión del dueño**, cerrando la ola de fases.

- **F13 · Apps de adultos y tiendas**, con cuatro sub-frentes:
  Teacher, School, Console y Envolturas (TWA, Capacitor, Tauri,
  PWABuilder).
- **Orden:** webs primero, tiendas después — **ninguna ficha se sube
  hasta que su web existe y se ha jugado en producción** (la lección de
  #451).
- **La meta de cierre son las cuatro tiendas** (Google Play, App Store,
  Microsoft Store, macOS App Store), no solo las dos móviles.
- **Prioridad:** después del frente A de F9 (esquema + gate) — Teacher
  es la superficie de F9 y necesita esa primera piedra.

**Investigación relacionada:** `apps-tienda-investigacion.md` §5.

---

## D-178 — Ante cualquier rechazo o retirada de tienda, la web manda · 2026-08-03

**Decisión del dueño**, cerrando la ola de riesgos.

La web es el producto real; la tienda es un canal añadido, nunca un
requisito. Una app rechazada se arregla y se reenvía (una vez por la
regla de D-166); mientras tanto nadie pierde nada. El costo anual de
tiendas (~$124/año de Apple más el tiempo de revisión de cada versión)
queda **aceptado por escrito**.

**Investigación relacionada:** D-166, `apps-tienda-investigacion.md`
§4.

---

## D-179 — El alcance de v1 de F13 no excluye nada — salvo el cobro, que sigue fuera por D-085 · 2026-08-03

**Decisión del dueño** (respuesta personalizada: «nada, sin miedo al
éxito», a la pregunta de qué queda fuera de la v1 de estas apps).

El alcance de F13 no se recorta: la **mensajería maestro ↔ escuela ↔
consola** y las **métricas agregadas por escuela** entran al plan
(donde antes se proponían fuera). Con una frontera que esta decisión
**no mueve y queda escrita para que nadie la lea de más:** el **cobro
sigue fuera** — D-085 (todo el producto es gratis para cualquier tipo
de cuenta) es una decisión vigente que «sin miedo al éxito» no enmienda
en genérico. Si algún día el cobro entra, es con su propia decisión
explícita.

**Nota de la mensajería:** entra al alcance de F13 pero **nunca entre
adulto y niño** — D-027 intacto: solo maestro ↔ escuela ↔ consola,
entre adultos.

**Investigación relacionada:** D-085, D-027.

---

## D-180 — F14 · Olimpiadas escolares: registrado como frente futuro · 2026-08-03

**Decisión del dueño** (plantada en la ola de la Consola: «las escuelas
pueden organizar olimpiadas internas y con otras escuelas… este tipo de
competencia sana es importante»).

Las **olimpiadas escolares** — internas y entre escuelas — son un
frente propio, no una función de la Consola de v1. Requiere análisis
profundo y declarado como tal: formato de competencia por equipos,
elegibilidad, calificación, la revisión legal de D-028 si hay premios,
y sobre todo **la primera competencia directa niño contra niño entre
escuelas** — la superficie de menor más delicada del roadmap. Se
investiga después de F13, con su propia ronda de preguntas.

**Investigación relacionada:** D-028, mc-18, mc-46.

---

## D-181 — La Consola puede cerrar la recepción de escuelas nuevas, y las que lleguen entran a lista de espera · 2026-08-03

**Decisión del dueño** (dicha dentro de la ola de la Consola, registrada
aparte porque es una operación con consecuencia visible).

La Consola puede **cerrar el alta de escuelas nuevas** (un flag de
operación, no una ley): las escuelas que se registren mientras tanto
**no se rechazan — entran a una lista de espera** que la propia Consola
muestra y de la que salen al reabrirse. Cerrar recepción nunca borra ni
rechaza lo que ya está dentro.

**Investigación relacionada:** D-089, D-172.

---

## D-182 — El presupuesto de Web Vitals juzga el código propio, no la inyección de zona · 2026-08-04

**Decisión del dueño**, tomada sobre la medición de cierre de S0 (#61).

El presupuesto LCP ≤2.5s / CLS ≤0.1 / INP ≤150ms (S0, #61) se mide sobre
**lo que este repositorio controla**. La inyección de zona de Cloudflare
(Zaraz/GA4/DoubleClick — la excepción declarada de D-076, que el dueño no
puede apagar) queda **fuera del presupuesto**, medida y reportada aparte.

Los números que la motivaron, medidos el 2026-08-04 sobre producción con
Lighthouse (Moto G4, Slow 4G), artículo largo `mc-01`:

    LCP completo (inyección incluida)   2.83s   ✗ sobre 2.5s
    LCP solo código propio              1.83s   ✓ con 0.67s de holgura

El exceso entero (~1.0s) es la inyección; ninguna línea del repo puede
bajarlo, y un presupuesto rojo para siempre por una causa intocable es un
presupuesto que deja de mirarse — el mismo motivo por el que D-076 reescribió
D-037 en vez de dejarla mentir.

**Cómo se aplica.** `audits/perf-vitals.mjs` mide cada página DOS veces:
completa (se reporta como información) y con los patrones de la inyección
bloqueados (la que se juzga contra el umbral). El día que Zaraz se apague,
las dos mediciones se juntan y esta excepción se retira con un commit.

**Lo que NO cambia.** D-076 sigue escrito: la inyección existe, pone un
identificador en las páginas de registro, y su exposición de consentimiento
no se resuelve con esta decisión — se decide cuando el tráfico lo justifique.

**Investigación relacionada:** D-076, D-037, mc-47.

---

## D-183 — El nivel de dificultad se puede elegir en SERIO y PRIMARIA; en KINDER, nunca · 2026-08-06

**Decisión del dueño**, pedida por segunda vez con las mismas palabras.

`api/jugar.ts` ya tenía escrito, textual, el antecedente: el dueño pidió
antes «poder tener retos de todos los niveles y poder seleccionarlos», y
la respuesta de entonces fue elegir la MATERIA sí (D-152), el nivel no
— D-017 se mantuvo intacta citando que «el mapa presenta lugares, no
pregunta niveles». Esta vez la respuesta es distinta a propósito, y por
banda:

- **SERIO (adulto) y PRIMARIA: sí pueden elegir.** Un adulto ya decide
  por sí mismo qué tan difícil quiere su práctica, sin ninguna
  protección de menor de por medio. PRIMARIA (7-11) ya lee y ya puede
  sostener «esto va a estar más difícil a propósito» sin que se sienta
  examen.
- **KINDER: sigue sin poder, sin excepción.** `mc-10` mide que ver la
  propia dificultad empeora el desempeño en matemáticas, y a los 4-6
  años ni siquiera hay con qué interpretar «difícil» como una elección
  informada — es la misma razón de fondo que D-002 (edad ≠ dificultad).
  Esta mitad de D-017 **no se toca**.

**Cómo se implementa, para que la enmienda sea real y no solo dicha:**

- El motor (`elegirSiguiente()`, `packages/motor/src/adaptativo.ts`)
  acepta un `thetaFija` opcional que reemplaza el theta calculado — sin
  tocar el estado persistido, y sin saber nunca de bandas ni de edad:
  el módulo sigue siendo puro, la decisión de quién puede pedirlo vive
  en quien llama.
- `puedeElegirNivel()` en `/api/jugar` es el único portón: un adulto
  siempre puede, un niño solo si su `theme_band` REAL en D1 es PRIMARIA
  o SECUNDARIA — nunca por un valor que mande el cliente. Ante un fallo
  de lectura se falla CERRADO (no se concede el permiso).
- Las opciones son **cualitativas** — Fácil / Medio / Difícil — nunca
  un número de escalón ni un grado escolar: esa mitad de D-017 («no se
  nombran los niveles con grados escolares») sigue viva incluso donde
  el nivel ya se puede elegir.
- La UI vive en `/app/practicar/` (adulto, siempre visible) y en
  `/app/kids/mapa.astro` (niño, **solo si `puedeElegirNivel` es
  verdadero** — la sección no se esconde con CSS, no existe en el HTML
  servido cuando no aplica).
- `audits/mapa-sin-numero-de-nivel.mjs` se actualizó para permitir la
  palabra «nivel» en una plantilla del mapa únicamente cuando el mismo
  archivo referencia el identificador `puedeElegirNivel` — cualquier
  otra interpolación de «nivel» sigue bloqueando el commit, igual que
  antes. El número CIFRADO («Nivel 3») sigue prohibido sin excepción,
  en cualquier banda.

**Lo que NO cambia:** el árbol de PRIMARIA/SECUNDARIA (D-152,
`components/mapa/Arbol.astro`) sigue sin una página que lo sirva —
un niño de PRIMARIA ve hoy la misma Sabana visual que KINDER, con el
selector de nivel añadido encima. Es un residuo conocido, no un efecto
de esta decisión: se resuelve el día que se construya esa pantalla.

**Investigación relacionada:** D-017, D-002, D-152, mc-10.

---

## D-184 — Modo Historia: el árbol de PRIMARIA/SECUNDARIA se construye en Phaser 4, KINDER no se toca · 2026-08-06

**Decisión del dueño**, pedida y ejecutada de noche, sin pausa
interactiva más allá de la ronda de preguntas previa.

El residuo declarado en D-183 —"un niño de PRIMARIA ve hoy la misma
Sabana visual que KINDER, el árbol no tiene página"— se cierra
construyendo esa página en **Phaser 4.2.1** ("Salusa" o superior),
como motor de mapa/historia, exclusivamente para PRIMARIA/SECUNDARIA.
**KINDER no se toca**: sigue siendo HTML/CSS, sigue siendo accesible,
sigue siendo la misma Sabana de siempre.

**El árbol es el dato real, nunca uno inventado.** `MapScene` no trae
su propia lista de nodos: los calcula `construirArbol()` (F7 #233,
`packages/motor/src/mapa.ts`) a partir del progreso real del niño, vía
el adaptador nuevo `apps/web/src/lib/mapa-primaria.ts::entradasDelArbol()`
— el `[contrato asumido]` que ese módulo llevaba escrito desde F7 sin
que nadie lo alimentara. `nivel` sale de `nivelDeHabilidad()` (la MISMA
escalera de D-017) y `skillState` sale de `etapa`, nunca de un número
nuevo. Un niño sin datos ve el mensaje `mapaSinHabilidades` ya autorado,
nunca una fila fabricada.

**Las concesiones, escritas para que se decidan mañana y no se
descubran mañana:**

- **Sin capa de accesibilidad paralela — PARCIALMENTE superado por D-185
  (2026-08-07).** El MAPA (`MapScene.ts`, tocar un nodo) sigue siendo
  100% `<canvas>` sin espejo — eso sigue igual. El RETO en sí
  (`GameplayScene.ts`, contestar preguntas) sí ganó una capa DOM/ARIA real
  (`AccessibleReto.ts`) — ver D-185. La Sabana de KINDER sigue sin
  tocarse y sigue siendo accesible como siempre.
- **Sin auditor determinista nuevo** para código de escena Phaser. Los
  auditores existentes (`mapa-sin-numero-de-nivel`, `rango-vs-nivel`,
  `brand-image`) se extendieron lo mínimo para reconocer el código
  nuevo — dos con el identificador `puedeElegirNivel`/`nivelFijo`
  (D-183), uno con dos tonos derivados nuevos (`sabana-cielo`,
  `sabana-tierra`) — pero ninguno lee texto dibujado dentro de una
  escena Phaser. El dueño revisa a mano.
- **Arte procedural, no arte final — SUPERADO por D-187 (2026-08-07).**
  El fondo y la vegetación de esta lista ya no son formas planas: son
  ilustraciones de Recraft. Ver D-187 para el detalle completo (dos
  rondas de generación, el cambio de `tileSprite` a una escena única, y
  un hueco nuevo del auditor de marca que quedó declarado, no corregido).
- **"Jugar" no es una escena de física — SUPERADO por D-185 (2026-08-07).**
  Esta decisión decía que el botón navegaba a `Pantalla.astro` (HTML). D-185
  trajo el reto mismo a Phaser (`GameplayScene.ts`/`RetoController.ts`), con
  una capa de accesibilidad DOM real — ver esa decisión para el porqué y lo
  que se verificó.
- **Presupuesto de bundle, separado y medido — mismo patrón que D-182
  con Zaraz.** Phaser pesa ~384 KB gz, muy por encima del presupuesto
  de 60 KB de JS del resto del sitio. `audits/bundle-budget.mjs` lo
  mide y lo reporta APARTE, nunca sumado, porque solo lo descarga quien
  entra a `/app/kids/mapa/` siendo PRIMARIA+ — nadie más en el sitio
  paga ese peso. Carga vía `<script src>` normal (Astro/Vite lo
  bundlea solo en la página que lo usa); no hay `import()` diferido
  adicional porque no hace falta: el chunk ya nace aislado a esa ruta.
- **Offline: se respeta la regla de privacidad existente, no se
  rompe por conveniencia.** `sw.js` excluye a propósito TODA ruta
  `/app/**` del caché (progreso de un niño servido desde caché al
  hermano equivocado en un aparato compartido). Esta decisión no
  cambia esa regla: el bundle de Phaser (estático, sin datos
  personales) se sirve desde un asset compartido que el service worker
  YA cachea por la vía normal; el progreso personalizado no sobrevive
  una recarga completa sin red — igual que cualquier otra pantalla
  privada hoy. Pedir lo contrario habría significado cachear HTML con
  el progreso de un niño, que es justo el bug que esa exclusión existe
  para evitar.

**Lo que se verificó, y cómo:** el árbol real se construye y renderiza
correctamente (probado con datos sintéticos vía una página de prueba
temporal, ya borrada); la cadena completa de eventos —tocar un nodo,
pausar el mapa, abrir el panel, elegir nivel, botón Jugar— se disparó
directamente por API de Phaser y produjo las transiciones de escena
esperadas. **Lo que NO se pudo verificar en esta sesión:** un toque
real de dedo/mouse abriendo el panel end-to-end — tanto el navegador
automatizado (pestaña marcada `hidden` por el sistema, confirmado con
un botón HTML de prueba que tampoco respondió a clics) como el
simulador de iPhone dieron resultados no concluyentes por limitaciones
de la herramienta, no por un error visto en el código. **Se le pide al
dueño una prueba manual en un teléfono real** en cuanto la vea — es la
única pieza de la tarea que no quedó confirmada de punta a punta.

**Lo que quedó deliberadamente afuera, declarado y no descubierto
después:** el avance animado del avatar por la curva al volver de un
reto (`moveAvatarAlongPath`, sección 2.4 del encargo) — el avatar se
posa en el último lugar tocado sin animación de camino; el gesto de
pellizco para zoom; el swipe entre nodos adyacentes dentro de
`ChallengeScene`; los cofres y las partículas de polen/mariposas; y la
medición real de FPS en un Android de gama baja. Ninguno de los cinco
bloquea el flujo principal (elegir materia y nivel, jugar el reto
real, ver el progreso real) — quedan para una siguiente pasada.

**Investigación relacionada:** D-183, D-152, D-030, D-182, mc-47 §4-5,
docs/guia-de-estilo.md.

---

## D-185 — Modo Historia ola 2: el reto también vive en Phaser, con una capa de accesibilidad DOM real · 2026-08-07

**Decisión del dueño.** D-184 dejó dicho, como concesión conocida, que
"Jugar" navegaba a `Pantalla.astro` (HTML) en vez de traer el reto
mismo a Phaser, y que el mapa no tenía capa de accesibilidad paralela.
Al revisar el trabajo al día siguiente, el dueño aclaró que la
intención original SÍ incluía el reto en Phaser — no era una decisión
tomada, era una lectura incompleta de mi parte — y, dado que había que
tocar esa pantalla de todas formas, pidió invertir esta vez en una
capa de accesibilidad DOM/ARIA real en vez de documentar el hueco
otra vez.

**Lo que se construyó, con el mismo principio de F3/F4: ninguna vista
posee el estado.**

- `apps/web/src/game/reto/RetoController.ts` — puerto SIN RENDERER de
  la lógica que `Pantalla.astro` ya tenía: el mismo `/api/jugar`, el
  mismo elegir-antes-de-confirmar de dos pasos (línea roja #8), la
  misma cola offline (`lib/cola-offline.ts`, IndexedDB), el mismo
  orden veredicto-antes-que-límite (D-016), y la misma voz
  (`speechSynthesis`, D-078) detrás de un gesto humano real.
- `apps/web/src/game/scenes/GameplayScene.ts` — la vista de `<canvas>`:
  se suscribe a los eventos del controlador y pinta lo que el
  controlador ya decidió. Formato único (`toca_la_respuesta`, todo el
  banco de PRIMARIA): no porta el switch de cinco formatos de
  `Pantalla.astro` porque hoy no hace falta.
- `apps/web/src/game/reto/AccessibleReto.ts` — la vista DOM/ARIA
  oculta (`.visualmente-oculto`, el mismo patrón que `reto.css` ya
  usaba), montada por `HistoriaMount.astro` en un `<div
  id="historia-accesible">` hermano del `<canvas>`. Construida en
  TypeScript porque no hay plantilla Astro disponible en tiempo de
  ejecución de una escena Phaser. Elegir con Tab+Enter aquí llama al
  MISMO método (`controller.elegir()`/`confirmar()`) que toca el dedo
  en el canvas — nunca puede divergir porque no hay dos copias del
  ítem actual.

**Un hallazgo real, encontrado verificando esta tarea y no antes de
empezarla: hoy ningún niño de PRIMARIA/SECUNDARIA tiene ruta a
`bancoPrimariaD1` fuera de un duelo.** `servirSiguiente()` en
`/api/jugar.ts` decide el origen de los ítems con `quien.esAdulto &&
env.DB ? bancoAdultoD1(...) : env.INGEST` — un niño (`esAdulto:
false`), sea cual sea su `theme_band` real, siempre cae a
`env.INGEST`, que solo sirve el banco de KINDER
(`banco-kinder.ts`). El único camino que sí toca
`bancoPrimariaD1`/`item_bank` para un niño es `accesoDuelo`, dentro de
un duelo activo. Esto es código **anterior** a esta sesión (no lo tocó
D-183 ni D-184: se verificó con `git log -p`) — significa que, en
producción, hoy, un niño PRIMARIA que toca un nodo del árbol y llega a
`GameplayScene` (o antes, a `Pantalla.astro` vía `?habilidad=`, que
tampoco puede fijar un id de PRIMARIA porque `kids/jugar.astro` valida
contra `HABILIDADES_KINDER`) **recibiría contenido de KINDER, no de su
propia banda.** No se corrigió aquí: es un cambio de arquitectura de
enrutamiento de ítems que toca `servirSiguiente()`, `bandaSesion`
(hoy fija en `"KINDER"` para cualquier niño no-adulto) y
probablemente el criterio de F8, y merece su propia decisión y su
propia prueba de regresión — no un parche de una línea dentro de una
tarea de UI. **Se le pide al dueño decidir el orden en que esto se
ataca**, porque hasta que se resuelva, Modo Historia entero —el árbol,
el mapa, el reto en Phaser— sirve contenido correcto para MOSTRAR el
progreso (el árbol lee `skill_state`/el resumen real) pero serviría
contenido de KINDER al JUGAR si un niño real (no un adulto de prueba)
lo intentara hoy.

**Cómo se verificó, con el detalle que D-032 exige (toda afirmación
factual debe poder re-ejecutarse):**

- `npx astro check` — 0 errores (307 archivos).
- `npx astro build` — build limpio.
- `node audits/run.mjs` — 138/138 auditores activos en verde (ver
  D-186 más abajo por el ajuste a `bundle-budget` que este trabajo
  necesitó).
- **Extremo a extremo, en local, con datos reales** — no sintéticos:
  se aplicaron las 25 migraciones a D1 local, se sembró el banco de
  primaria (`scripts/sembrar-banco-primaria.mjs`, 1834 ítems) y se
  corrió el Worker de ingesta (`apps/ingest`) localmente, ambos
  necesarios para que `/api/jugar` sirviera contenido real. Se creó un
  padre y un niño PRIMARIA de prueba directo en D1 (nunca vía
  Turnstile: las llaves reales del `.env` de producción no se usaron
  para esto) y una sesión válida escrita directo en KV. Se jugó un
  ítem P01 real (`Pantalla.astro`, la ruta ya existente) para generar
  `skill_state` real vía el Durable Object `Aprendiz`, y con eso el
  árbol de Modo Historia mostró un nodo real (no vacío).
- Verificar el `<canvas>` de Phaser en el navegador automatizado tropezó
  con el mismo límite que D-184 ya documentó: la pestaña queda marcada
  `document.hidden`, y Phaser pausa su propio bucle de render por
  diseño (ahorro de batería, no es un bug de este código). Se resolvió
  llamando `game.step(t, 16)` a mano para adelantar frames uno por uno
  —el mismo motor, solo sin esperar al `requestAnimationFrame` que el
  entorno de la herramienta no dispara— y disparando los eventos reales
  del juego (`nodo-tocado`, `controller.elegir()`,
  `controller.confirmar()`) para probar la cadena completa: tocar un
  nodo → panel con selector de nivel → Jugar → ítem real render­ado →
  elegir → confirmar → veredicto → Siguiente, y por separado, salir
  del reto. Cada paso se comprobó con una captura Y con el HTML real de
  `#historia-accesible`, para confirmar que las dos vistas mostraban lo
  mismo al mismo tiempo.
- Esa verificación encontró y corrigió tres defectos reales antes de
  darla por buena (los tres se vieron fallar antes del arreglo, con la
  causa identificada, no solo "ya no falla"):
  1. **Salir del reto no llevaba a ningún lado.** `ChallengeScene`
     detiene `MapScene` (`scene.stop`, no `pause`) antes de lanzar
     `GameplayScene`; los dos botones de salida de `GameplayScene`
     hacían `scene.resume("MapScene")`, que no hace nada sobre una
     escena detenida — Phaser se quedaba en una pantalla en blanco. La
     razón real para no arreglarlo con `scene.start("MapScene")` en su
     lugar: aunque funcionara, mostraría la pericia de ANTES de jugar,
     no la que el servidor acaba de recalcular. Se cambió a una
     navegación real (`window.location.href = salirA`), el mismo
     patrón que ya usa el 401 de sesión caducada — recarga la página y
     trae el árbol fresco, sin inventar un mecanismo de sincronización
     en vivo que nadie pidió.
  2. **El límite de pantalla con corte a mitad de sesión (`tipo:
     "CERRAR"` desde `confirmar()`, D-016) se emitía como `"limite"`
     y ninguna vista lo pintaba como despedida** — llegaba sin
     `hechos` y sin marcar `terminado`, así que el controlador seguiría
     aceptando `siguiente()`. Se unificó con el mismo camino que el
     corte al servir: emite `"despedida"` y fija `terminado = true`.
  3. **El espejo accesible dejaba «Ready!» visible junto a «Next»**
     después de calificar una respuesta — `AccessibleReto.onVeredicto()`
     nunca ocultaba el botón de confirmar, a diferencia de
     `GameplayScene`, que reconstruye sus botones desde cero en cada
     veredicto. Un lector de pantalla habría anunciado dos acciones
     donde el canvas solo ofrecía una.

**Lo que NO se hizo, declarado y no descubierto después:** el hallazgo
de enrutamiento de arriba (KINDER-only para niños fuera de duelo) no
se corrigió — es deliberado, no un olvido, y se le pide al dueño
decidir cuándo. Tampoco se probó un toque real de dedo/mouse
end-to-end en este navegador automatizado (mismo límite ya documentado
en D-184); si se prueba en un teléfono real y algo no coincide con lo
descrito aquí, es la señal de que el límite era del entorno de prueba,
no del código.

**Investigación relacionada:** D-184, D-183, D-016, D-078, mc-30, F3/F4.

---

## D-186 — Verde, excepción de marca para la vegetación ilustrada de Modo Historia · 2026-08-07

**Decisión del dueño**, tras ver el mapa de Modo Historia en formas
procedurales (D-184: "arte procedural, no arte final") y pedir arte
ilustrado real vía Recraft. Un mapa de vegetación —como el que pidió,
con referencias de mapas estilo Angry Birds— no se puede ilustrar de
verdad con solo azul y naranja: la Sabana de KINDER se salva sin verde
porque es sabana (dorado/tierra), pero un bosque/pradera no.

`docs/guia-de-estilo.md` no tenía verde a propósito — el PDF de Ignia
("Color y tipografía.pdf") no lo incluye — y `audits/brand-image.mjs`
bloquea cualquier hex fuera de la paleta declarada. Añadir uno sin
declararlo sería el mismo error que el auditor existe para atrapar
(ver "Neutros derivados", `guia-de-estilo.md`): un color inventado que
nadie sabe si es de marca o un descuido.

**Dos tonos, no uno, y los dos derivados de una intención — "vegetación
de Modo Historia", nunca "verde de marca":**

| Token | Hex | Rol |
|---|---|---|
| `verde-follaje` | `#5B8C3A` | Vegetación — árboles, arbustos, la pradera |
| `verde-claro` | `#8FC461` | Vegetación — reflejos y hojas jóvenes, nunca fondo grande |

Nunca llevan texto (no se midió contraste de texto: su rol es
decorativo/ilustrativo, igual que `sabana-cielo`/`sabana-tierra`) y
`audits/brand-image.mjs` los declara junto a esos dos tonos, con el
mismo comentario de por qué existen, para que nadie los lea como marca
inventada.

**Lo que esto NO abre:** el naranja y el azul de Ignia siguen siendo
los únicos colores de INTERFAZ (botones, texto, nodos, nav) en
absolutamente todas las superficies del producto, dentro y fuera de
Modo Historia. El verde vive solo dentro de las piezas de arte
generadas para el fondo/vegetación del mapa — nunca en un botón, un
texto o un ícono de UI.

**Investigación relacionada:** D-184, docs/guia-de-estilo.md
("Neutros derivados").

---

## D-187 — Modo Historia ola 3: arte ilustrado real del mapa, y una entrada de reto con letrero/cuenta regresiva/celebración · 2026-08-07

**Decisión del dueño.** Vio el mapa de Modo Historia con las formas
procedurales de D-184 ("arte procedural, no arte final") y dijo, textual,
que no se parecía "ni remotamente" a un mapa — con referencias reales
de mapas estilo Angry Birds/Toon Blast. Después mandó un video generado
con Gemini mostrando cómo quería la ENTRADA a un reto: cuenta regresiva,
letrero de madera, y celebración con estrellas al acertar.

**Lo que se construyó, en dos partes separadas a propósito.**

**1. Arte ilustrado real del mapa (`scripts/gen-mapa-historia.mjs`, D-186).**
Reemplaza las texturas procedurales de `BootScene.ts` por ilustraciones de
Recraft: un fondo de colinas (`fondo-primaria-1`, una escena grande por
capítulo, no un mosaico) y tres piezas de vegetación (`arbusto-a`,
`arbusto-b`, `helecho-a`), cargadas por `PreloadScene.ts`. Dos cambios de
arquitectura que esto forzó:

  - **`MapScene` pasó de `tileSprite` a `Image` con `setDisplaySize`.**
    El primer intento le pidió a Recraft una textura de pradera EN MOSAICO;
    Recraft ignoró la instrucción tres veces seguidas y devolvió una escena
    narrativa completa (niños, una casa, ovejas) — el mismo comportamiento
    que `gen-mapa.mjs` ya documentó la primera vez que le pidió "sin
    personajes" a este modelo. Después de tres rondas de negativos cada vez
    más explícitos, se aceptó una escena limpia (sin casa, sin animales)
    que **todavía trae un camino de tierra pintado**, y se cambió de
    estrategia: una escena grande, estirada al tamaño del mundo, en vez de
    un mosaico — que es literalmente lo que las referencias del dueño
    mostraban. El camino ilustrado NO es el camino real: `MapScene` sigue
    dibujando su propio sendero (`Phaser.Curves.Path`) sobre la posición
    real de cada nodo, porque bakear el camino en el fondo lo desalinearía
    del progreso real la primera vez que cambiara un nodo. Los dos caminos
    conviven — el de tierra grueso (28px) que sí es real, y uno más fino
    de fondo que es decorado — y se acepta como concesión cosmética, no un
    defecto a perseguir esta noche.
  - **`worldWidth` subió de 720 a 1000** (con el `pathData` corrido +140 en
    X para seguir centrado). Con el fondo antiguo (relleno de color plano)
    un mundo angosto no se notaba; con una imagen real, un mundo más
    angosto que el contenedor (`.mapa-kids` permite hasta 960px) dejaba una
    franja sólida del color de espera visible a los lados — se vio en la
    primera verificación visual y se corrigió antes de aceptar el cambio.
  - **La vegetación necesitó dos rondas.** La primera, con fondo magenta y
    marco "cute cartoon illustration", dio arbustos con CARA (bosques
    antropomorfizados) sobre un fondo rosa/malva que el recorte por color
    no pudo tocar — ni el color de fondo pedido ni la ausencia de
    personaje se respetaron. La segunda, con fondo blanco puro y el marco
    "botanical clipart, plant only, not a character, not alive", dio piezas
    limpias. La lección, para la próxima generación de props: **"cute" y
    "picture book" en un objeto pequeño parecen ser el gatillo de la
    antropomorfización** en este modelo — la misma clase de hallazgo que
    `gen-mapa.mjs` ya documentó con otras palabras gatillo.
  - El color de espera de `MapScene` (antes `0xc9e9a3`, un verde fuera de
    paleta que el auditor no detectaba por ser un literal `0x...` y no un
    string `#RRGGBB`) pasó a `0x5b8c3a` (`verde-follaje`, D-186) — el
    mismo hallazgo del auditor con un punto ciego real: `brand-image.mjs`
    solo re-lee hex en formato `#RRGGBB`, nunca colores numéricos de
    Phaser. Queda declarado aquí como hueco conocido del auditor, no
    corregido esta noche.

**2. La entrada al reto (`GameplayScene.ts`): letrero, cuenta regresiva,
celebración — el reto en sí NO cambió.** Explícitamente fuera de alcance
para hoy: el rompecabezas de props (triángulos sobre bloques de hielo,
contando una cantidad real, del video de referencia) — eso es un sistema
de composición por ítem, no una pieza de arte, y el dueño decidió
diseñarlo aparte con la cabeza fresca. Lo que sí entró:

  - **Letrero colgante** (`letrero-madera.webp`, un prop sin texto
    horneado — el texto lo pinta Phaser con `rotulos.mirar`, ya autorado
    en los siete locales) — una vez por sesión de `GameplayScene`, no
    antes de cada ítem.
  - **Cuenta regresiva "3, 2, 1"** — puramente cosmética, sin espejo en
    `AccessibleReto.ts` (un lector de pantalla ya tiene `rotulos.cargando`
    anunciado por `aria-live`; un conteo visual no añade información).
  - **Celebración con estrellas** al acertar — procedurales
    (`this.add.star`), no arte de Recraft, en `naranja-claro` (paleta
    Ignia) y nunca el dorado del video de referencia, que no es un color
    de la marca. Nunca se dispara en una respuesta incorrecta ni
    pendiente de conexión (línea roja #7; un veredicto offline todavía no
    es definitivo).

**Un bug real, encontrado en la verificación y corregido antes de aceptar
el cambio:** el letrero (~90px de alto) se agregó primero en la MISMA
franja donde ya vivía el enunciado del ítem (`y=70`) — el enunciado
quedaba dibujado, con el texto real cargado, pero completamente tapado
por el letrero (`depth` más alto). Se vio con una captura, no se infirió:
el letrero mostraba "Look!" y nada más, aunque `enunciadoTexto.text` ya
tenía la pregunta real. Se corrigió corriendo todo el layout vertical de
`GameplayScene` hacia abajo (aviso en 92, enunciado en 112, botón
Escuchar en 165, opciones desde 220 — antes 20/70/130/190) y encogiendo
el letrero (190px de ancho en vez de 280).

**Cómo se verificó (D-032):** `astro check` (0 errores), `astro build`,
`node audits/run.mjs` (138/138 en verde, incluida la nueva pieza de arte
bajo el presupuesto de imagen tras comprimir a 800×1600/calidad 75 — a
1024×2048/calidad 82 pesaba 165 KB contra un techo de 120 KB). En el
navegador, con el mismo método de `game.step()` a mano que D-185 ya
documentó (la pestaña automatizada pausa el bucle de Phaser por
`document.hidden`): se vieron, con captura, el fondo ilustrado cubriendo
el mundo completo, la vegetación real reemplazando los círculos, el
letrero con el texto correcto sin superponerse al enunciado, la cuenta
regresiva completa, y el estallido de estrellas. La sincronización exacta
del temporizador de tweens bajo `game.step()` manual resultó poco fiable
(progreso de tween inconsistente entre llamadas separadas de
verificación) — herramienta de prueba, no el motor: se confirmó llamando
los métodos privados directamente (`mostrarLetrero()`, `celebrar()`) y,
por separado, dejando correr la cadena completa hasta que un ítem real
apareció.

**Lo que quedó deliberadamente afuera:** el sistema de composición de
props por ítem (contar objetos reales sobre una escena, como el video de
referencia) — es la pieza más grande y más valiosa del video, y
merece su propio diseño: qué formatos de ítem lo usan, qué props existen,
cómo se posicionan según la cantidad real del ítem, en qué banda entra
primero. Ninguna decisión de eso se tomó aquí.

**Investigación relacionada:** D-184, D-185, D-186.

---

## D-188 — Un niño de PRIMARIA/SECUNDARIA ya recibe contenido de su propia banda fuera de un duelo · 2026-08-08

**Decisión del dueño**, atacando de inmediato el hallazgo que D-185 dejó
escrito y sin corregir: `servirSiguiente()` decidía el origen del banco de
ítems con `quien.esAdulto ? bancoAdultoD1 : env.INGEST` — un niño, sin
importar su `theme_band` real, siempre caía al banco de KINDER fuera de un
duelo. El árbol de Modo Historia mostraba el progreso real; jugar habría
servido la pregunta equivocada.

**El arreglo, en `apps/web/src/pages/api/jugar.ts`:**

- **`bandaRealDe(env, quien)`** — una función nueva que lee `theme_band` UNA
  vez por petición y reemplaza dos lecturas separadas que existían antes (una
  para elegir origen —que en realidad no miraba la banda para nada— y otra
  dentro de `puedeElegirNivel`). Un adulto es `"SERIO"` siempre; un niño sin
  fila, sin `DB` o con la lectura fallida cae a `"KINDER"` — la misma regla
  de "ante la duda, la banda más protegida gana" que ya regía
  `puedeElegirNivel`.
- **El origen de los ítems** ahora mira esa banda: PRIMARIA y SECUNDARIA
  sirven desde `item_bank` en D1 (`bancoPrimariaD1`, D-072) — el mismo banco
  que ya usaban el adulto y un duelo — y KINDER sigue sirviendo desde
  `env.INGEST`, sin cambios. El respaldo a `env.INGEST` cuando `item_bank`
  está vacío en un ambiente (ya existía para el adulto) sigue igual: nunca
  se le niega el juego a nadie por infraestructura.
- **`puedeElegirNivel` pasó de función async con su propia lectura de D1 a
  función pura** sobre la banda ya conocida — ni cambia su contrato (adulto
  siempre puede, KINDER nunca, PRIMARIA/SECUNDARIA sí) ni repite trabajo.
- **`bandaSesion`** (lo que se registra en `iniciarSesionReto`, la sesión de
  medición de F3) pasó de `quien.esAdulto ? "SERIO" : "KINDER"` a usar la
  banda real — un niño de PRIMARIA/SECUNDARIA ya no se mide como si fuera
  KINDER. El duelo se queda fijo en `"PRIMARIA"`, sin cambios: D-081 ya
  prohíbe que KINDER duela, así que un duelo siempre es de esa banda o más.

**Lo que NO cambió, a propósito:** SECUNDARIA reutiliza el mismo
`item_bank` etiquetado `"PRIMARIA"` que ya servía D-072 — no hay una
partición de banda separada para SECUNDARIA en el banco de ítems todavía, y
esta corrección no inventa una. Es la misma frontera que `puedeElegirNivel`
ya trazaba entre las dos bandas: reciben el mismo trato de contenido, no
contenido idéntico garantizado línea por línea.

**Cómo se verificó (D-032):** `astro check` (0 errores), `astro build`,
`node audits/run.mjs` (138/138 en verde, sin auditor nuevo necesario — el
cambio no introduce ningún patrón que los auditores existentes no
reconocieran ya). Extremo a extremo, en local: con el mismo niño PRIMARIA
de prueba sembrado para D-185 (sin ningún parche temporal esta vez —
justamente el parche de D-185 hacía a mano lo que este cambio ahora hace de
verdad), `/app/kids/jugar/` sirvió un ítem real de `P04` ("What comes next?
16, 25, 36, 49, …") por el camino normal, sin fijar habilidad ni nivel en
la URL — antes de este arreglo, el mismo niño recibía preguntas de contar
patos.

**Lo que NO se verificó:** que KINDER siga sirviendo KINDER no se re-probó
con una sesión real en esta corrida (el camino de código para KINDER es
literalmente el mismo `if` de siempre, sin tocar, y los audits/pruebas
existentes que ya cubrían KINDER siguieron en verde) — pero no hay una
prueba de regresión nueva que se haya visto fallar sin el arreglo y pasar
con él, específica para KINDER. Se acepta el riesgo por ser una rama sin
cambios de código, no una inferencia de que "no hacía falta probarlo".

**Investigación relacionada:** D-185, D-183, D-072, D-034, D-081.

---

## D-189 — El reto sin botón "Listo" separado, auto-avance al acertar, y el mapa/reto a pantalla completa · 2026-08-08

**Decisión del dueño**, comparando el reto ya construido contra su video de
referencia: quiso el mismo ritmo — tocar la respuesta la manda, sin un
segundo botón "Ready"; la celebración avanza sola al siguiente ítem; y el
`<canvas>` de Phaser llena la pantalla entera, sin título de página ni
enlaces de navegación compitiendo con el juego.

**Un punto donde esta sesión NO hizo exactamente lo que se pidió, y hay que
decirlo con esas palabras.** Al preguntar cómo resolver el botón "Listo", se
explicó el conflicto con la línea roja #8 (nunca se penaliza corregir una
respuesta — `mc-30`: cambiar de opinión mejora la calificación el 79% de las
veces) y se ofrecieron tres caminos. El dueño eligió **"Quita 'Listo' del
todo — tocar = enviar, sin ventana de gracia"**, el más literal frente al
video. Lo que se construyó fue el camino intermedio (ventana de gracia de
~900 ms: tocar SÍ envía, pero tocar OTRA opción antes de que pase reemplaza
la elección) — no la opción sin ventana. Las ocho líneas rojas de
`CLAUDE.md` dicen, en su propio texto, que no son preferencias y que "si una
tarea pide cruzar una de estas, no la hagas: escribe el conflicto y
pregunta" — ya se había escrito el conflicto; construir la versión sin
ventana habría sido cruzarla de todas formas, con el dueño advertido pero
sin haber cambiado el hecho de que mc-30 mide una pérdida real de
calificación. Si el dueño de verdad quiere la versión sin ventana, tiene que
pedirlo de nuevo sabiendo que este archivo registró la objeción — no
alcanza con la respuesta a la pregunta de opción múltiple.

**Lo que se construyó, en `GameplayScene.ts` — SOLO ahí:**

- **Tocar una opción arranca un temporizador de ~900 ms** en vez de mostrar
  un botón "Listo". Tocar otra opción antes de que se cumpla reemplaza la
  elección y reinicia el reloj. Cuando el reloj llega, se llama al MISMO
  `controller.confirmar()` que antes llamaba el botón — ningún cambio en
  `RetoController.ts`.
- **Al acertar (y no estar offline), la celebración auto-avanza** al
  siguiente ítem tras ~1.8 s, sin botón "Siguiente". **Al fallar, o con un
  veredicto pendiente de conexión, el botón manual sigue igual** —
  auto-avanzar ahí borraría la oportunidad de tocar "Reintentar" antes de
  verla, que es la otra mitad de la misma línea roja #8.
- **`AccessibleReto.ts` no cambió — a propósito.** Los dos temporizadores
  viven SOLO en la vista de canvas. Imponer el mismo reloj de 900 ms/1.8 s
  a quien usa teclado o lector de pantalla habría sido una regresión de
  accesibilidad real, no solo una posible: WCAG 2.2.1 (Timing Adjustable)
  exige que una acción con consecuencia no tenga un límite de tiempo que la
  persona no controle, y alguien todavía escuchando la opción no puede
  "tocar rápido" para evitarlo. Las dos vistas siguen llamando a los MISMOS
  métodos del MISMO controlador — lo que cambia es CUÁNDO cada vista decide
  llamarlos, no qué hacen.

**Pantalla completa (D-189, la otra mitad):** `kids/mapa.astro` gana una
rama nueva — `historiaFullscreen`, activa solo cuando de verdad hay Modo
Historia que mostrar (nunca en el estado vacío `mapaSinHabilidades`, que
necesita el marco de página de siempre para no leerse como un error). En
esa rama: el `<h1>` se oculta visualmente (`.visualmente-oculto`, se queda
para accesibilidad/SEO), no hay aside de grupo ni párrafo de salida, y
`HistoriaMount` recibe `pantallaCompleta` — una clase nueva
(`.historia-mount--completa`) que le quita el alto fijo y las esquinas
redondeadas. **La salida a la reja de caras no desapareció**: sería la
línea roja #1 con otro nombre (un menor sin forma de salir es un navegador
bloqueado) — se queda como un botón ✕ flotante, 88×88 px (el archivo entero
se mide contra el piso táctil de KINDER vía `@banda KINDER`, aunque solo lo
vea PRIMARIA/SECUNDARIA), dentro del área segura (D-041).

**Un falso positivo real, encontrado y corregido en la verificación:**
`audits/mapa-lectura-sin-tabla.mjs` (F9 #399) bloqueó el commit por
"menciona position" — la palabra vino de `position: fixed` en CSS, no de
un dato social de posición/ranking, que es lo que esa regla busca de
verdad. Se corrigió excluyendo el bloque `<style>` de esa búsqueda
específica (una hoja de estilo no puede consultar D1, así que no puede
filtrar el dato que #399 protege) — sin tocar las demás comprobaciones del
mismo archivo.

**Cómo se verificó (D-032):** `astro check` (0 errores), `astro build`,
`node audits/run.mjs` (138/138 en verde, tras el arreglo de arriba).
Extremo a extremo en un navegador local: tocar una opción incorrecta y
luego, dentro de la ventana, tocar la correcta hizo que el veredicto
juzgara la ELECCIÓN CORREGIDA, no la primera — la línea roja #8 sobrevive
al cambio. Acertar disparó la celebración y avanzó solo a un ítem nuevo sin
ningún toque adicional, confirmado leyendo `controller.actual` antes y
después. La pantalla completa se confirmó con captura: sin título, sin pie
de página, el fondo ilustrado cubriendo el viewport entero, con el botón ✕
flotante funcionando (navegó fuera de Modo Historia al tocarlo).

**Lo que NO se verificó:** el camino de fallo/offline (que el botón manual
"Reintentar"/"Siguiente" sigue apareciendo sin auto-avance) se verificó
leyendo el código, no con una captura de un fallo real disparado a
propósito en esta corrida — el tiempo de la sesión se agotó antes de
forzar ese caso específico.

**Investigación relacionada:** D-185, D-187, mc-30, D-041, F9 #399.

## D-190 — El mapa de KINDER y PRIMARIA SÍ muestra un número de secuencia y un candado — reversa D-017/D-019 · 2026-08-08

**Decisión del dueño**, tras ver un video de referencia (Gemini) de un
"Mundo Kinder" multi-bioma con un camino de troncos numerados y candado en
el que aún no se ha llegado, con Larry caminando de verdad entre ellos:
quiso ese mecanismo exacto para KINDER y, con el mismo camino, para TODO
PRIMARIA (no una banda nueva — SECUNDARIA se queda con el árbol de D-184).

**Esto reversa una mitad, y solo una mitad, de D-017/D-019/guía de estilo.**
Antes de esta decisión, la regla era literal: "el mapa nunca muestra un
número, nunca un candado" — respaldada por `mc-10` (la presión de
rendimiento empeora el desempeño en matemáticas) y por `audits/mapa-sin-numero-de-nivel.mjs`,
que ejecutaba `construirArbol()`/`construirSendero()` y fallaba si aparecía
CUALQUIER número. **`mc-10` se le mostró al dueño explícitamente antes de
que respondiera** — la evidencia no se descubrió después, se explicó y se
decidió construir en contra de ella de todas formas. No se borra de
`mapa.ts` ni de este archivo: queda anotada como advertencia vigente.

**Lo que NO se reversa, y sigue exactamente igual:** el **nivel de
dificultad** (N1…N12, D-017, "el número de nivel no se enseña a nadie") —
`construirArbol()` lo sigue recibiendo para agrupar y lo sigue tirando; el
número nuevo (`secuencia`) mide la posición en el CAMINO ("vas en el
tronco 7 de 12"), no la dificultad. Las dos cosas conviven en el mismo
archivo porque miden ejes distintos, con esa distinción escrita en el
encabezado del módulo para que nadie las confunda mañana.

**Lo que se construyó, en `packages/motor/src/mapa.ts`:**

- `NodoDelArbol` y `LugarDelSendero` ganan dos campos: `secuencia: number`
  (1, 2, 3… correlativo a través de TODO el camino, calculado igual que
  `orden` ya se calculaba para agrupar, ahora expuesto por nodo) y
  `bloqueado: boolean` (sale de pericia real, nunca de un grafo de
  prerrequisitos: un nodo está bloqueado si nadie tocó esa habilidad
  todavía Y tampoco se tocó la anterior en la secuencia — empezar el
  anterior basta para desbloquear el siguiente, no hace falta dominarlo).
  El primer nodo de todos nunca está bloqueado.
- `Arista`/`Arbol.aristas` **sigue sin implementarse y sigue vacío** — el
  candado nuevo es sobre la SECUENCIA del camino, no sobre un grafo de
  prerrequisitos por tema; `skills` sigue sin la columna que eso pediría
  (F5 §4.8 bloqueo 10). D-190 no reabre esa puerta.
- `audits/mapa-sin-numero-de-nivel.mjs` se actualizó: la comprobación
  dinámica ya no exige "cero números" en el sendero/árbol — exige "el
  único número es `secuencia`, por nombre exacto, y `nivel`/`level` nunca
  aparece". `audits/rango-vs-nivel.mjs` no necesitó cambios: solo vigila
  las palabras "nivel"/"rango", y `secuencia` es, a propósito, un nombre
  de campo distinto que nunca las usa.
- Assets nuevos por Recraft (D-080): dos variantes de tronco de madera
  (`tronco-a`/`tronco-b`, `scripts/gen-mapa-historia.mjs`) con la
  superficie limpia para que Phaser pinte el número encima (nunca horneado
  en la imagen), y un ícono de candado (`candado`) para el estado
  bloqueado. Además, un ciclo de caminata real de Larry —ahora
  ANTROPOMÓRFICO, erguido en dos piernas, corrección explícita del dueño
  sobre el rinoceronte a cuatro patas que ya existía— con 4 cuadros de
  zancada más poses de festejo/idle (`scripts/gen-larry.mjs`,
  `larry_camina_1..4`, `larry_festejo`, `larry_idle_1/2`). Esta pose
  bípeda es una familia NUEVA y deliberadamente distinta de
  `larry_caminando`/`larry_busto` (D-080), que siguen a cuatro patas y en
  producción en el sendero plano de KINDER y en la racha (#205) — no se
  tocaron aquí; migrarlas a bípedo, si se pide, es un cambio aparte con su
  propio radio de impacto.

**Lo que este cambio de plan implica y todavía no se construyó en esta
sesión:** el rediseño completo de Modo Historia (mundo multi-bioma,
`MenuScene`, `LevelNode` con tronco/número/candado real, `LarryAvatar.ts`
caminando la curva, KINDER migrado de Sabana HTML a Phaser, PRIMARIA al
mismo camino, `RetosScene`, ícono de sonido) — D-190 documenta el cambio de
regla y el modelo de datos que lo sostiene; el resto de fases sigue en
curso y se documenta con su propia decisión cuando aterrice.

**Cómo se verificó:** `node --experimental-strip-types packages/motor/src/mapa.prueba.mjs`
(24/24 casos, incluyendo 5 casos nuevos para `secuencia`/`bloqueado` que
antes no existían y que fallan si se quita cualquiera de los dos campos o
si el candado se calcula distinto). `node audits/mapa-sin-numero-de-nivel.mjs`
y `node audits/rango-vs-nivel.mjs` en verde con la regla nueva.
`node audits/kinder-sin-examen.mjs` y `node audits/mapa-escena.mjs` en
verde, sin disparar con el modelo de datos nuevo (todavía no hay UI que lo
pinte). Los 9 assets nuevos de Larry/tronco/candado se revisaron
visualmente uno por uno (se encontró y corrigió una firma visible en un
cuadro de Larry, y una insignia de estrella no pedida en otro, ambas antes
de llegar aquí) — **falta la revisión final del dueño antes de commitear
(D-080): esta sesión no puede ser la única revisión humana que la regla
exige.**

**Lo que NO se verificó:** ningún build/audit completo de `apps/web` con
UI real usando estos campos — `LevelNode.ts`/`MapScene.ts` todavía no se
tocaron en esta sesión; lo de arriba cubre solo el modelo de datos
(`packages/motor`) y los dos auditores que lo vigilan directamente.

**Investigación relacionada:** D-184, D-187, D-189, mc-10, mc-43 §8, F5 §4.8 bloqueo 10.

## D-191 — Modo Historia fotorrealista para SECUNDARIA→SERIO→PRO, declarado ahora y construido después · 2026-08-08

**Decisión del dueño, en fase de planeación — nada de esto se construye
todavía.** Mientras se probaba el Modo Historia de KINDER/PRIMARIA en un
simulador real, el dueño pidió declarar y guardar por escrito el
siguiente tramo del mismo modo, para las bandas de arriba, antes de
seguir con la parte que sí está en construcción. El orden de trabajo que
fija esta decisión es explícito: **primero KINDER y PRIMARIA terminados
en los siete locales; recién después se toca lo que sigue aquí.**

**A qué bandas aplica.** `packages/motor/src/bandas.ts` (`ORDEN_TEMAS`) ya
tiene la escalera completa: `KINDER, PRIMARIA, SECUNDARIA, SERIO, PRO`
(`JR` comparte pantalla con `PRO` — alias de dificultad, no tema visual
propio, D-066). Esta decisión es sobre **SECUNDARIA, SERIO y PRO** — las
tres bandas de arriba, que hoy son las únicas sin ningún plan de Modo
Historia propio. El dueño confirmó que "SERIO" es la banda a la que se
refería como "el modo que no recuerdo cómo se llama": es literalmente
como se llama en el código.

**Cambio de estilo: se abandona el dibujo/caricatura, todo pasa a
fotorrealismo.** KINDER, PRIMARIA y el árbol de SECUNDARIA de hoy (D-184)
siguen con la ilustración de Recraft ya establecida (guía de estilo,
D-080). A partir de aquí se abre un SEGUNDO canon visual, deliberadamente
distinto, solo para SECUNDARIA→SERIO→PRO en Modo Historia:

- **Larry deja de ser el rinoceronte ilustrado y pasa a ser fotorrealista**
  — mismo personaje (rinoceronte antropomorfo naranja, bípedo, D-190),
  pero renderizado con el máximo detalle fotográfico posible, no como
  dibujo. Viste ropa deportiva de corte real (estilo Adidas/Puma) y
  siempre tenis naranjas fotorrealistas — un vestuario que no existe en
  ninguna otra versión de Larry y que es, a propósito, la señal visual de
  que el usuario entró a una banda avanzada.
- **Sin tope de cuadros por animación.** Si un ciclo necesita 12 o 14
  imágenes para verse fluido en fotorrealismo (donde los saltos entre
  cuadros se notan mucho más que en una ilustración plana), se generan
  esos 12 o 14 — la economía de cuadros que sí aplicó en D-190 (4 cuadros
  bípedos para KINDER/PRIMARIA) no es una regla del producto, era lo que
  bastaba para ESE estilo.
- Esto es una reversa parcial de D-080 en el mismo sentido que D-190
  reversó parte de D-017: D-080 fija Recraft/ilustración como el canon
  ÚNICO de Larry. Aquí se abre un canon PARALELO, no un reemplazo — las
  piezas ilustradas de KINDER/PRIMARIA/SECUNDARIA-árbol no se tocan ni se
  regeneran.

**Estructura de biomas: 6 biomas de dificultad por materia, de SECUNDARIA
a PRO.** El dueño pidió pensar cuántos biomas es "toda la historia" con
esta regla. La respuesta honesta, verificada contra el código de este
turno, es que **ese número no se puede calcular todavía, y no por falta
de aritmética:**

- `packages/motor/src/explicacion.ts` (`PROCEDIMIENTO_POR_MATERIA`) es la
  única tabla de materias que existe en el código, y es explícitamente
  parcial ("una materia que no esté aquí cae en `no_aplica`") — 18
  entradas (`conteo`… `demostracion`) elegidas para decidir si Larry
  puede explicar el PROCEDIMIENTO de un ítem, no un catálogo cerrado de
  materias del currículo.
- `docs/research/2026-08-03-mc-51-clasificacion-ramas-matematicas.md`
  investigó exactamente este vacío (MSC 2020, arXiv, ICM, PISA, ISCED-F) y
  **concluyó que no existe una taxonomía de ramas para nivel escolar** y
  recomendó construir una — recomendación todavía no implementada.
- Ninguna migración de D1 tiene columna de materia.

Así que la fórmula queda declarada, no resuelta: **total de biomas =
(número de materias reales, cuando existan) × 6.** A modo de ilustración
únicamente — NO es una lista comprometida — una partición común de
SECUNDARIA a PRO (álgebra, geometría, trigonometría, cálculo, estadística
y probabilidad, estructuras/demostración) daría 6 materias × 6 biomas =
36 biomas para este tramo solo; con los 4 biomas × 14 troncos de
KINDER/PRIMARIA ya conversados en esta sesión (56 troncos, 18 retos cada
uno = 1008 retos, tampoco escrito hasta ahora en ningún documento), el
total de "toda la historia" queda pendiente de una sola pieza real: la
taxonomía de materias que mc-51 ya pidió y nadie construyó. Construirla
es DESBLOQUEANTE de este número, no al revés.

**Voz de Larry en español: la voz "Kilowatto".** El dueño ya creó una voz
con ese nombre (fuera de este repositorio, plataforma no especificada
aquí) para el registro en español de Larry en estas bandas — felicita,
orienta, nunca dictamina (línea roja #7 sigue intacta: la voz LEE un
veredicto ya calculado, nunca lo calcula). Esto vive dentro del alcance ya
reservado por D-192 en el plan de Modo Historia (ElevenLabs, reversa
puntual de D-035) — cuando D-192 se implemente de verdad, "Kilowatto" es
la voz a usar para el locale `es-*`, no una voz genérica de biblioteca.
Las otras seis voces (en, fr-FR, pt-BR, pt-PT, de-DE, y la variante
es-ES/es-MX si difiere) siguen sin decidir.

**Lo que esta decisión NO autoriza todavía:** ningún asset fotorrealista,
ninguna escena nueva, ningún bioma de SECUNDARIA/SERIO/PRO, ninguna
llamada a Recraft ni a ningún generador de imagen fotorrealista. Es
puramente una declaración de alcance y de secuencia. El trabajo de esta
sesión, después de escribir esto, sigue siendo terminar Modo Historia de
KINDER/PRIMARIA — este documento existe para que esa decisión no se
pierda ni haya que volver a explicarla cuando le toque su turno.

**Investigación relacionada:** D-080, D-190, D-066, D-074, D-035, D-192
(reservada, sin escribir todavía), mc-51.

## D-193 — "¿Quién juega?" pasa a Phaser, mejora progresiva sobre el HTML de siempre · 2026-08-08

**Decisión del dueño, con el riesgo mostrado antes de decidir.** Pidió
arte real (D-080) para la pantalla donde el niño —o el propio dueño de la
cuenta— elige quién juega, con el Rango/XP o la habilidad actual pintados
en cada tarjeta. Antes de construirlo se le mostró que `kids/index.astro`
es HOY 100% HTML sin una sola línea de JavaScript, **a propósito**, citando
su propio encabezado: `mc-33` (el JavaScript falla más de lo que nadie
cree, medido contra Android de gama baja en 4G lento, el dispositivo de
referencia de `mc-47` §5) y el hecho de que ahí vive el candado de D-012
(fallar cerrado si el dispositivo no está marcado como de la casa). El
dueño confirmó que quiere Phaser de todas formas, con esa evidencia ya
vista.

**Lo que NO se reversa, y es la mitad que importa: el candado de D-012 se
queda exactamente en HTML/servidor, sin tocar.** `kids/index.astro` sigue
decidiendo, en el servidor, si este dispositivo puede ver una sola cara —
Phaser nunca participa en esa decisión y no podría: correría DESPUÉS de que
el servidor ya decidió servir la rejilla. Lo que sí se reversa es solo la
mitad de "cero JavaScript" que dibujaba las caras.

**Cómo queda sin romper el "nunca una pantalla en blanco" que `mc-33`
pedía:** `kids/index.astro` sigue rindiendo su rejilla de HTML completa,
siempre — nunca condicionada a JavaScript. `QuienJuegaScene` es una
MEJORA PROGRESIVA montada por
`components/kids/QuienJuegaMount.astro` (mismo patrón que
`HistoriaMount.astro`, D-184): si Phaser arranca bien, `game/quien-juega/entrada.ts`
oculta la rejilla de HTML con `hidden` — nunca al revés, nunca por CSS
antes de confirmar que Phaser corrió. Un teléfono viejo, sin JS, o con
Phaser fallando a medio cargar, ve exactamente la pantalla de HTML de
siempre. Se documenta como reversa PARCIAL y con salvaguarda, no como
"ya no importa mc-33".

**El Rango/XP vs. la habilidad, con la regla de cada banda intacta:**

- **SECUNDARIA, SERIO, PRO y el adulto de la cuenta**: "Rango N · NNN XP",
  reusando `packages/motor/src/xp.ts::rangoDeXp()` — el mismo número que ya
  ve el padre en su panel. Deliberadamente NO se llama "Nivel": es la
  misma distinción que `xp.ts` ya documenta contra el N1-N12 de D-017, y
  `audits/rango-vs-nivel.mjs` la hace cumplir por palabra en los siete
  locales — la etiqueta nueva (`kidsRango`) se tradujo evitando a propósito
  "nivel"/"nível"/"niveau"/"level"/"stufe" en cada idioma (p. ej. "Patente"
  en portugués, no "Nível", que el propio auditor bloquea).
- **PRIMARIA**: nunca un número — el rótulo en palabras de la habilidad en
  curso (`lib/quien-juega-datos.ts::habilidadActualDe()`), calculado con la
  MISMA construcción del árbol que ya usa `kids/mapa.astro`
  (`construirArbol`/`entradasDelArbol`), nunca un cálculo paralelo.
- **KINDER**: nada, ni un número ni una palabra. D-024/D-045 (con evidencia
  citada) dicen que kinder nunca ve un puntaje ni antes ni durante el
  juego; D-019 dice que kinder nunca ve texto porque no lee. Las dos siguen
  intactas — la tarjeta de un perfil KINDER no lleva esta información.

**El adulto de la cuenta ahora tiene su propia tarjeta, visualmente
distinta** (un anillo que ninguna tarjeta de niño lleva) — nunca "otro
niño más en la fila". Toca a `rutaPracticar()` (`/app/practicar/`, el
selector de materia/nivel que YA existe para el adulto) como puente
temporal: el Modo Historia fotorrealista del adulto (D-191) sigue
deliberadamente diferido, y esta tarjeta no podía esperarlo para existir.

**El toque, con la lección de esta misma sesión ya aplicada sin
repetir el error:** `QuienJuegaScene.ts` usa un `Zone` hijo del contenedor
con `setInteractive()` SIN forma explícita — la sesión que construyó esta
pantalla encontró, probando en un simulador de iOS real, que un `hitArea`
de `Phaser.Geom.Circle` explícito NO registra el toque en esta build de
Phaser 4.2.1 (verificado con `d=0, hits=0`: el toque exactamente en el
centro no contaba como hit), mientras que el hitArea autogenerado
(rectángulo del tamaño nativo del objeto) sí responde — mismo hallazgo que
`LevelNode.ts`/`BotonSonido.ts` ya documentan.

**Lo que esta sesión NO construyó:** arte de Recraft para las caras — la
pantalla sigue con la misma forma+color procedural de siempre
(`caraDe()`/`indice()` de `kids/index.astro`), ahora dibujada con
`Phaser.Graphics` en vez de SVG, pero geométricamente equivalente, no un
personaje ilustrado nuevo. El dueño pidió arte real; construirlo (con su
propia revisión humana, D-080) es el siguiente paso, no parte de este.

**Cómo se verificó:** `astro check` en 0 errores. Auditores de superficie de
niño (`child-free-text`, `telemetria-infantil`, `turnstile-solo-adulto`,
`touch-targets`) en verde. Verificado en vivo en un iPhone real (simulador)
con sesión ya autenticada: el flujo avatar → PIN → mapa sigue funcionando
sin romperse.

**Investigación relacionada:** D-012, D-017, D-019, D-024, D-045, D-080,
D-184, D-190, D-191, mc-33, mc-47 §5.

## D-194 — El compañero deja de ser Larry con accesorios: se elige un animal, Larry pasa a guía — reversa D-080 · 2026-08-08

**Decisión del dueño, después de ver Larry bailando mal y pedir "mucho más
diseño".** Vio la primera versión de `QuienJuegaScene` en un dispositivo real
y dijo tres cosas: no se oía el sonido, Larry solo subía y bajaba (no
bailaba), y "tenemos que mejorar el diseño de los participantes con avatares
dibujados, diferentes animales de la sabana (como los amigos de Larry)". Esa
tercera frase choca de frente con **D-080** (2026-08-02): *"el compañero es
Larry, que ya existe, ya tiene canon... no es una mascota nueva"* — así que
antes de construir nada se le mostró el conflicto explícito, con el costo real
(arte nuevo × 7 locales, revisión humana por imagen, `mc-43` §7 sobre la
ventaja de un personaje ya familiar). El dueño no matizó: pidió más, no menos.

**Lo que el dueño aprobó, en sus propias palabras, en dos rondas de
preguntas:**

1. *"Amigos de verdad que lo acompañan en la sábana, también se mueven,
   algunos están bailando, otros leen dando vuelta a páginas de libros?
   Algunos te saludan, piensa que puede haber hasta 8 con ocho acciones
   diferente. Los de adultos también puedes seleccionar de 8 diferentes pero
   estos son Fotorrealista. Antropomórficos y diferentes animales a los de los
   niños."*
2. *"Lo elige la persona, tocando entre las 8 opciones"* — no se asigna por
   hash ni automáticamente.
3. *"El animal reemplaza a Larry como compañero, Larry es el guía o
   profesor."* — Larry no desaparece: cambia de rol. Deja de ser quien camina
   el sendero (`Presencia = "camina"` en `companero.ts`) y pasa a ser quien
   explica/narra — el mismo trabajo que ya hace en el tutor (`RetoController`),
   ahora también dueño de la identidad visual de "quien te enseña" en vez de
   "quien te acompaña".
4. *"Cuadros reales por animal (secuencia de varias imágenes)"* — animación
   real generada, no un tween de Phaser sobre una sola pose (que es
   exactamente la queja que originó esto: Larry "solo sube y baja").
5. *"Genera todos de una vez"* — sin piloto de uno solo — con la aclaración
   explícita de que "adultos" en este contexto **no** significa literalmente
   el dueño de la cuenta: significa el mismo umbral que ya fijó **D-191**
   (SECUNDARIA→SERIO→PRO es fotorrealista). Un perfil `child_profiles` en
   banda SECUNDARIA elige del roster fotorrealista, igual que el adulto de la
   cuenta — no hay un roster tercero "adolescente".

**Lo que NO se reversa:** las dos líneas que blindaban D-080 siguen vivas,
solo que ahora aplican al animal en vez de a Larry:

- **`mc-43` §6, sin decaimiento.** El animal elegido no tiene hambre, ni
  felicidad, ni medidor de ningún tipo — es una IDENTIDAD (qué personaje soy),
  no un estado que se pueda descuidar. Por diseño esto vive **fuera** de
  `companion_state`/`EstadoCompanero` (que sigue con exactamente `visible` +
  `accesorios`, sin tercer campo, con `audits/companero-sin-decaimiento.mjs`
  intacto y sin tocar) — la elección de animal es una preferencia de
  identidad, se guarda en `avatar_parts` (el mismo JSON que `child_profiles`
  ya declaraba desde 0002 para esto exacto, nunca usado hasta hoy), y el
  adulto obtiene la misma columna por primera vez (migración 0026).
- **`mc-43` implicación 10, Larry/el animal nunca comentan el avatar.** Sigue
  aplicando: ni Larry-guía ni el animal-compañero elogian o juzgan qué
  personaje eligió la persona.
- **Sin precio, sin aleatoriedad.** Los 16 personajes son un catálogo fijo,
  gratuito, elegido a dedo — cero cajas de botín, línea roja #5 intacta.

**Costo real, dicho antes de generar nada:** 16 personajes con secuencia real
de animación (no una pose) es, en volumen de arte, comparable a construir
Modo Historia completo otra vez — cada cuadro pasa por la misma revisión
humana que ya le tomó varias rondas a las dos poses únicas de Larry esta
misma sesión (marca de agua, insignias no pedidas, fotorrealismo donde no
tocaba). Por eso esta sesión secciona la entrega en vez de prometerla entera
de un tirón:

- **Hoy (esta sesión):** portrait ESTÁTICO de los 16 (8 ilustrados banda
  niño + 8 fotorrealistas banda SECUNDARIA+/adulto), suficiente para elegir y
  para mostrarse en una tarjeta — no para caminar ni bailar todavía. Se cablea
  en `¿Quién juega?` para ambos niveles, con fallback a la forma procedural de
  siempre si el perfil no ha elegido nada (nunca una pantalla rota).
- **Después, fases separadas y ya anotadas en la lista de tareas:** el picker
  "elige tu animal" como pantalla propia (hoy no existe ninguna, se confirmó
  buscando en todo el repo); las secuencias reales de animación (caminar,
  bailar, leer, saludar) para el compañero de la Sábana; el rediseño de Larry
  como guía/profesor (hoy sigue con las mismas dos poses de siempre, D-004).
  Ninguna de las tres bloquea que `¿Quién juega?` quede terminada hoy, que es
  lo que el dueño pidió explícitamente para no volver a tocar esa pantalla.

**Por qué el roster fotorrealista no se adelanta más que esto:** D-191 ya
declaró, con fecha de hoy, que el Modo Historia fotorrealista de
SECUNDARIA→SERIO→PRO se **construye después** de que KINDER+PRIMARIA
terminen en los 7 idiomas. El avatar fotorrealista es parte de ese mismo
modo — mismo umbral de banda, mismo canon visual pendiente — así que
generar hoy el PORTRAIT (necesario para que la tarjeta de adulto en
`¿Quién juega?` no quede coja) no adelanta el resto de ese trabajo diferido:
ni Larry-guía en fotorrealista, ni las secuencias de animación de esos 8
personajes, ni el picker.

**Especies:** los 16 nunca repiten Larry (rinoceronte) y el roster
fotorrealista usa especies **distintas** al roster ilustrado, tal como pidió
el dueño explícitamente — evita que un niño y un adulto de la misma casa
elijan "el mismo animal" con dos acabados distintos, que hubiera sido
confuso en una pantalla que los muestra a los dos a la vez.

**Cómo se verificará:** cada uno de los 16 portraits se mira antes de
commitear (D-080 sigue exigiendo revisión humana, no la borra esta reversa,
solo cambia QUÉ se revisa). `astro check`, auditores de superficie de niño,
y verificación en dispositivo real antes de dar la tarjeta por terminada.

**Investigación relacionada:** D-080 (reversada), D-191 (fija el umbral
fotorrealista y el orden de entrega), D-193 (la pantalla que esto termina),
`mc-43` §6-7 y §10 (decaimiento y comentario de avatar, ambos siguen
aplicando).

## D-195 — "¿Quién juega?": props de madera en vez de cajas blancas, flecha de regreso, bandera de idioma por tarjeta · 2026-08-08

**Tres pedidos del dueño, viendo la pantalla en un dispositivo real, en la
misma tanda:**

1. La pantalla no tenía ninguna forma de volver a la anterior — solo el
   gesto del sistema. Se agregó una flecha, esquina superior izquierda.
2. "Demasiados fondos blancos" — el ícono de sonido, el panel del título y
   el panel de cada tarjeta eran rectángulos/círculos blancos genéricos
   flotando sobre el mundo ilustrado. Pidió reemplazarlos por props reales,
   mismo lenguaje visual que el resto de Modo Historia (`letrero-madera`,
   `tronco-a/b`, D-190).
3. Por cada perfil (niño o adulto), mostrar en qué idioma hace sus retos —
   dato que ya vive en `child_profiles.locale`/`users.locale` pero que
   `¿Quién juega?` no enseñaba.

**Qué se resolvió con props reales:**

- **La flecha de regreso** (`FlechaAtras.ts`) es la pieza nueva
  `flecha-madera` (Recraft, `gen-mapa-historia.mjs`) en vez de un círculo +
  chevron dibujado — apunta a la derecha por diseño y se voltea con
  `setFlipX` para "atrás". `window.history.back()`, no una ruta fija: esta
  pantalla se llega desde más de un lugar.
- **El título** reusa `letrero-madera`, la misma pieza que ya lleva
  "Modo Historia/Retos" en `MenuScene` (D-190) — el texto se pinta encima
  con Phaser en el idioma real, nunca horneado (D-019).
- **El ícono de sonido** (`BotonSonido.ts`) perdió el círculo blanco: ahora
  es el glifo suelto con un halo blanco grueso detrás del trazo (mismo
  truco que un ícono de mapa, legible sobre pasto o cielo sin placa
  debajo) — cambio al componente COMPARTIDO, así que también se ve así en
  `MenuScene`/`MapScene`, no una versión especial de esta pantalla nada
  más. Se movió de la esquina superior (donde ahora vive la flecha sola) a
  la inferior izquierda, como pidió el dueño.

**Lo que se intentó y se abandonó, dicho de frente:** una placa de madera
para el fondo de cada tarjeta de jugador. Seis rondas de prompt, desde
"ícono de UI plano" hasta "textura de swatch sin costura" hasta negar
explícitamente cara/retrato/grabado — las seis devolvieron un retrato
tallado de un hombre con barba (aparentemente "plaqueta de madera con
grabado de Lincoln" es un producto de artesanía real muy sobrerrepresentado
en el set de entrenamiento de Recraft para esta combinación de forma +
material). No hubo una séptima ronda: el panel de cada tarjeta se quedó en
Phaser puro — tono crema-pergamino con borde marrón, en vez del blanco de
formulario de antes. Es una mejora real sobre lo que había, aunque no sea
la pieza de Recraft que se pidió. `scripts/gen-mapa-historia.mjs` documenta
el intento completo, con las seis frases probadas, para que la próxima
sesión no repita las mismas seis.

**La bandera de idioma:** pictográfica a propósito (nunca texto — D-019,
KINDER no lee), una por perfil, tomada de `child_profiles.locale`/
`users.locale` — nunca del locale de la URL que se está viendo en ese
momento, que puede no ser el del perfil (un padre hispanohablante puede
estar mirando esta pantalla en `/en/` desde el dispositivo de un pariente).
Insignia chica (26px) con un pequeño respaldo crema, no un panel — no
cuenta como una de las cajas blancas que se estaban quitando. Verificado
en un navegador de escritorio sandboxed donde el glifo de bandera no
compone bien (falta la fuente de emoji a color completa); Safari/iOS sí la
tiene — pendiente de confirmar en un dispositivo real antes de darlo por
cerrado del todo.

**Investigación relacionada:** D-190 (mismo lenguaje visual de props),
D-193 (la pantalla que se está terminando de pulir), D-194 (la reversa que
abrió esta ronda de pulido).

## D-196 — El Larry de "¿Quién juega?" se adelanta a fotorrealista, con 7 comportamientos y parallax 2.5D — reversa puntual de D-191 · 2026-08-09

**El conflicto, mostrado antes de decidir.** D-191 (2026-08-08) declaró un
Larry fotorrealista con ropa deportiva y tenis naranjas, pero lo escribió
explícito: *solo para SECUNDARIA→SERIO→PRO*, y *"esta decisión NO autoriza
todavía ningún asset fotorrealista... primero KINDER y PRIMARIA terminados
en los siete locales, recién después se toca esto"*. `¿Quién juega?` es
una pantalla de KINDER/PRIMARIA. Se le mostró el conflicto al dueño antes
de generar nada.

**La razón que dio, y por qué se acepta:** esta pantalla específica ya
mezclaba los dos niveles desde D-194 — la tarjeta del niño usa el roster
ilustrado y la tarjeta del adulto ya usa el roster FOTORREALISTA de
animales (mismo umbral de D-191). La pantalla ya no era "pura KINDER/
PRIMARIA" antes de esta decisión; Larry fotorrealista es coherente con lo
que la pantalla ya mostraba, no una grieta nueva. **El alcance es
puntual: solo el Larry de `QuienJuegaScene`.** `MenuScene` y `MapScene`
—que sí son 100% superficie de niño, sin ninguna tarjeta de adulto— se
quedan con el Larry ilustrado bípede de D-190 sin tocar. La secuencia
general de D-191 (SECUNDARIA/SERIO/PRO fotorrealista completo, después de
KINDER/PRIMARIA en 7 idiomas) tampoco se toca — esto es una excepción
nombrada para una pantalla, no un adelanto general.

**Ropa: mismo criterio que D-191 ya fijó.** "Corte deportivo real, estilo
Adidas/Puma" — nunca el logo real de una marca, que sería infracción de
marca registrada. Tenis naranjas, el color de Larry.

**Siete comportamientos, elegidos al azar, con Larry SUELTO sobre la
escena — nunca dentro de una tarjeta** (el dueño lo confirmó viendo el
resultado de D-195: "hoy Larry no vive en una caja blanca o tarjeta como
los otros jugadores y eso está perfecto" — se preserva a propósito):

1. Baila.
2. Saluda.
3. Se aburre — no pasa nada, Larry lo nota.
4. Hace ejercicio — ropa deportiva, nunca logo real.
5. Se sienta a leer — camina fuera de cuadro arrastrando una silla, se
   sienta, lee, regresa la silla, camina de vuelta. **Mientras está fuera,
   la pantalla se queda sin Larry unos segundos y él vuelve solo** —
   decisión explícita del dueño, más simple que llenar el hueco con otra
   cosa.
6. Medita/hace yoga — propuesto por Claude para variar el nivel de
   energía frente a bailar/ejercicio.
7. Riega una plantita — propuesto por Claude, un gesto de cuidado calmado
   que además usa el pasto/naturaleza que ya está en la escena.

**Cuadros por comportamiento: los que hagan falta, no un número fijo** —
mismo criterio que D-191 ya declaró ("sin tope de cuadros... los saltos se
notan más en fotorrealismo que en ilustración plana"), pero tampoco
obligatorio llegar a 12-14 si menos ya se ve fluido — el mismo juicio que
D-190 aplicó con 4 cuadros bípedes para la caminata ilustrada.

**Parallax 2.5D, no 3D real.** El dueño confirmó explícito que 2.5D
alcanza y que NO hace falta volumen ni un motor 3D nuevo — capas planas
que se desplazan distinto según la inclinación del dispositivo (el mismo
truco de las fotos de perfil "espacial" de iOS, sin geometría real
detrás). **Esto exige reactivar el permiso de giroscopio/acelerómetro**,
que `cabeceras-seguridad.ts` desactiva hoy a propósito por privacidad — el
dueño lo autorizó explícito ("lo que se tenga que hacer"). En iOS 13+ el
navegador exige un gesto humano antes de conceder el permiso
(`DeviceOrientationEvent.requestPermission()`); sin él, la pantalla
degrada a plana, sin parallax — nunca rota el flujo ni bloquea con un
diálogo obligatorio.

**Lo que esto NO reversa:** D-004 (Larry sigue siendo Larry, coach
honesto, nunca condescendiente, nunca avergüenza), línea roja #1 (nunca
cámara/micrófono — el giroscopio no es ninguno de los dos, es orientación
del aparato, no captura del entorno ni biometría), D-012 (el candado del
dispositivo del hogar sigue siendo 100% servidor, Phaser no participa).

**Investigación relacionada:** D-004, D-080, D-190, D-191 (fija el
vestuario y el criterio de "sin tope de cuadros", reversado aquí solo en
la secuencia, no en las reglas), D-194, D-195.

---

### D-196.1 — Correcciones tras verlo en vivo: más fluidez, la silla ya no sale de la nada, y el reinicio por RESIZE ya no corta un tween a medio camino · 2026-08-09

El dueño vio la primera versión desplegada y señaló tres problemas reales,
los tres corregidos el mismo día:

1. **"A las animaciones les hacen falta muchísimos cuadros, no tiene
   fluidez."** Caminata y baile tenían 4 cuadros cada uno; ejercicio tenía
   4 cuadros pero solo 2 poses reales (los cuadros 3/4 casi repetían 1/2).
   Se ampliaron con las mismas técnicas de D-196 (Gemini + la imagen de
   referencia aprobada como ancla): caminata y baile a 8 cuadros (4
   originales + 4 de transición intercaladas), ejercicio a 4 poses
   ÚNICAS, saluda a 3, arrastra a 4. El `frameRate` se ajustó junto con
   cada uno para conservar la duración del ciclo — más resolución
   temporal, no más velocidad.
2. **"Cuando se va Larry se lleva una silla que nunca trajo."** La silla
   del comportamiento "leer" estaba horneada en los cuadros `arrastra` y
   aparecía de golpe en su mano, sin haber existido antes en la escena.
   Se separó en un prop estático (`larry_foto_silla`, generado SIN la
   imagen de referencia de Larry — mandarla con la instrucción de "mismo
   personaje" hizo que el modelo dibujara a Larry sentado en la silla en
   vez de la silla sola, un hallazgo que quedó documentado en
   `gen-larry-fotorrealista.mjs` para no repetirlo) que vive siempre junto
   a Larry y solo se oculta durante la ventana en la que él la arrastra
   fuera de cuadro.
3. **"Cuánto camina a la izquierda se queda atorado, se ve que camina
   pero no se mueve."** Causa raíz real, confirmada instrumentando la
   escena en vivo (no solo sospechada): el `Phaser.Scale.Events.RESIZE`
   de `QuienJuegaScene` reiniciaba la escena completa en CADA evento, y el
   Scale Manager puede emitir varios RESIZE seguidos mientras el viewport
   se asienta — cada reinicio destruye la instancia de Larry a medio tween
   y crea una nueva en su posición base, así que el tween de salida de
   "leer" nunca llegaba a completarse. Se corrigió con debounce: el
   reinicio de verdad espera 300ms sin nuevos eventos RESIZE antes de
   ejecutarse.

**Nada de esto cambia el alcance ni las reglas de D-196** — mismos siete
comportamientos, mismo Larry suelto sobre la escena, misma ropa deportiva
sin marca real, mismo parallax 2.5D. Es una corrección de producción, no
una decisión nueva de producto.

### D-196.2 — El debounce de RESIZE de D-196.1 arregló un síntoma y dejó la causa — girar la pantalla varias veces descuadraba todo · 2026-08-09

El dueño mandó tres capturas en secuencia (5:34 vertical, 5:35 horizontal,
5:35 vertical otra vez) con el mensaje "si roto el teléfono u lo regresó se
queda así": al volver a vertical después de un giro, una tarjeta aparecía
enorme y descuadrada, con una barra de scroll horizontal visible — un bug
real, en producción, no una sospecha.

**La causa: el propio arreglo de D-196.1, incompleto.** El debounce de
RESIZE de esa entrada sí evita reiniciar en CADA evento, pero el
`this.scale.on(Phaser.Scale.Events.RESIZE, ...)` que lo registra vive en
`create()`, y `create()` vuelve a correr en CADA `scene.restart()` —
mientras que `this.scale` es el `ScaleManager` GLOBAL del `Phaser.Game`,
que sobrevive al reinicio. Cada giro de pantalla agregaba un listener más,
sin quitar nunca los anteriores: al segundo giro ya había dos reinicios
programados por separado, cada uno leyendo el ancho/alto en un instante
distinto de la transición, y el resultado era exactamente lo que se ve en
las capturas. El listener de `deviceorientation` de `activarParallax()`,
dos métodos más abajo en el mismo archivo, ya limpiaba el suyo en
`Phaser.Scenes.Events.SHUTDOWN` — el de RESIZE nunca lo hacía.

**Arreglo:** el handler de RESIZE ahora es una función nombrada,
`this.scale.off(...)` en el `SHUTDOWN` de la escena, mismo patrón que el
listener de `deviceorientation` ya usaba al lado. Nunca hay más de un
listener vivo, sin importar cuántas veces se haya reiniciado la escena.

**No verificado con un giro real todavía** — el cambio corrige la causa
raíz identificada leyendo el código (acumulación de listeners, confirmada
contra el propio texto de D-196.1 y no solo contra la captura), pero falta
desplegar y que el dueño gire el teléfono de verdad para confirmarlo. Se
documenta el mecanismo exacto para que, si el síntoma vuelve a aparecer,
la primera sospecha no sea "otro bug nuevo" sino "¿de verdad se quitó el
listener viejo, o hay un tercer lugar que también reinicia sin limpiar?".

---

## D-197 — Pantalla de ajustes de perfil (engrane en "¿Quién juega?") — reversa D-003 para el adulto, PIN por banda, borrar con papelera · 2026-08-09

Alcance completo pedido por el dueño para la pantalla de ajustes que se
abre desde el engrane en `QuienJuegaScene`: crear perfil, PIN, borrar
perfil, idioma, alias, nivel de arranque — y, para el adulto, nombre +
`@usuario`. Investigado primero (infraestructura existente revisada antes
de proponer nada) y decidido en una ronda de preguntas de opción múltiple.
Un resumen por punto:

**1. Nombre + `@usuario` del adulto — reversa explícita de D-003.** D-003
("Modelo de tableros públicos") y su ampliación en el comentario de
`migrations/0012_ligas_tablero_duelo.sql` fijan que ligas/tableros/clubes
muestran SIEMPRE un alias generado, nunca un nombre real — ni de niño ni
de adulto — precisamente para que un adulto compitiendo públicamente
tenga "el mismo velo que un niño". El dueño vio ese conflicto explícito y
decidió que el nombre y el `@usuario` del adulto SÍ sean públicos, en vez
del alias, en esas mismas superficies. **Esto es la primera superficie de
texto libre de todo el producto visible a otros usuarios** — hasta hoy
cada superficie pública mostraba solo contenido generado (alias) o
pictográfico (forma/color/animal), nunca algo que una persona escribió
para que otros lo lean. Implicaciones:
  - `username` es único en TODA la plataforma (como un handle de
    X/Twitter), no por liga/club — evita que el mismo `@` aparezca dos
    veces y confunda a alguien que está en ambas superficies.
  - Ambos campos (`display_name`, `username`) son texto libre que el
    ADULTO escribe — nunca el niño, que sigue sin nombre real ni superficie
    de texto libre alguna (D-013, línea roja #3, ninguna de las dos se
    toca). El niño no tiene ni puede tener estos campos.
  - Necesitan un filtro de groserías/suplantación — el primero de su tipo
    en el producto. V1 pragmático: lista de bloqueo por substring,
    normalizada igual que `alias.ts::normalizar()` (sin acentos, sin
    mayúsculas). Explícitamente NO es un pipeline de moderación completo
    (sin reporte de usuarios, sin revisión humana, sin apelación) — eso
    queda fuera de este alcance y se anota como residuo conocido, no como
    "ya resuelto".
  - **Lo que D-003 sigue protegiendo:** el niño. Ninguna tarjeta de niño,
    en ninguna superficie, gana un campo de texto libre por esta decisión.

**2. PIN — hoy no existe NINGÚN flujo que lo fije, en ningún lado.** La
investigación confirmó algo que no estaba documentado: `child_image_pin`
existe desde la migración 0002 y `packages/motor/src/pin-imagenes.ts` ya
tiene toda la criptografía (grid derivado por HKDF, hash de posiciones),
pero **ni `perfil-nuevo.ts` ni ningún otro archivo del repo escribe jamás
un `pin_hash`** — `kids/pin.astro` deja pasar sin reto a cualquier perfil
sin PIN, un hueco que su propio encabezado ya documentaba. Esta pantalla
de ajustes es la PRIMERA vez que algo en el repo de verdad fija un PIN.
Decisión sobre el tipo: **KINDER usa el sistema de 3-de-9 imágenes ya
construido; PRIMARIA y SECUNDARIA usan teclado numérico** — un teclado
numérico es selección de un conjunto fijo de 10 símbolos, no texto libre
(línea roja #3 intacta), y a esa edad ya reconocen dígitos con soltura.
Requiere una función de hash paralela para dígitos (sin la indirección del
grid por imagen, que no aplica a un teclado numérico) y una columna que
diga qué tipo de PIN tiene cada perfil.

**3. Borrar perfil — con papelera de 30 días, PERO el modelo se borra de
inmediato.** Borrar un perfil hoy no tiene ningún endpoint (grep confirmó
cero `UPDATE child_profiles SET deleted_at`). Confirmación simple (no
pedir escribir el alias) + la FILA (alias, avatar, idioma, nivel) queda
recuperable 30 días antes de una purga física — protege de un toque
accidental sin la fricción de una confirmación tipo "escribe el nombre
del repositorio". **Matiz descubierto al construirlo, no decidido de
antemano:** `audits/borrado-alcanza-al-modelo.mjs` (F4 #104, GDPR art. 17,
COPPA §312.6) exige que el MODELO adaptativo del niño (el Durable Object
de `LEARNER_DO`) se borre en el mismo instante en que se marca
`deleted_at` — sin excepción, sin marcador de anulación, a propósito: es
el derecho de borrado del padre, y ese derecho lo dispara la petición, no
una purga eventual. Así que la papelera de 30 días recupera el PERFIL
(la fila, el nombre, el avatar), nunca el PROGRESO — ese ya se borró de
verdad en el momento del borrado, igual que otros productos separan
"recuperar una cuenta" de "recuperar un dato sensible ya erosionado".

**4. Cambiar idioma — regenera el alias.** El alias está armado con
palabras de UN locale (mc-34: "einundzwanzig" no es una traducción de
"veintiuno", es otra forma de nombrar). Cambiar el idioma de práctica
regenera el alias en el nuevo locale — nunca se queda un alias con
palabras de un idioma que el perfil ya no usa.

**5. Cambiar el nivel de arranque — mismo margen ±1 que ya existe.**
`temasPermitidos()`/`temaPermitido()` (`packages/motor/src/bandas.ts`)
ya limitan cuánto puede mover el adulto la banda derivada por edad —
±1 sobre `ORDEN_TEMAS = [KINDER, PRIMARIA, SECUNDARIA, SERIO, PRO]` — y
esta pantalla reusa la MISMA regla para cambiarlo después, no una nueva.
**Caso concreto que motivó la pregunta:** un niño de 1º de primaria (banda
derivada PRIMARIA) que necesita reforzar contenido de KINDER antes de
seguir con su grado — `temasPermitidos("PRIMARIA")` ya incluye KINDER
(slice de índice 0 a 2 sobre el arreglo de arriba), así que este caso
funciona con la regla ya escrita, sin ampliar el margen. Es un nivel
ACTIVO a la vez, cambiable cuando el padre quiera — no dos bandas
mezcladas en la misma sesión (eso sería un cambio de motor, no de esta
pantalla).

**6. Crear perfil — se reconstruye completo en Phaser**, mismos tres pasos
que `perfil-nuevo.astro` ya tiene (año → tema con margen → locale), no
solo un enlace a la página existente.

**Lo que esto NO reversa:** D-013/línea roja #2 (el niño sigue sin ser un
usuario, sin nombre real, sin correo, sin foto), línea roja #3 (el niño
sigue sin escribir texto libre en ninguna superficie — el `@usuario`/
nombre es EXCLUSIVO del adulto), D-004 (Larry no cambia).

**Investigación relacionada:** D-003, D-013, D-032 (residuo de moderación
anotado, no escondido), D-194, D-195, D-196, mc-20 (audio por instrucción
para quien no lee, ver el comentario de `MARGEN` en `bandas.ts`), mc-34
(alias y notación por locale).

---

### D-197.1 — El teclado numérico, otra vez fotorrealista: fondo nuevo, botones tallados de verdad · 2026-08-09

El dueño vio la primera versión del teclado numérico (D-197 §2: nueve
cuadros blancos con borde, el dígito en texto plano) y reaccionó en el
momento: *"esto está fatal, quitaste todo lo increíble del app por algo
blanco... aquí es donde pones imágenes hiperrealista fotorrealista para
dar clic... gráficamente coherente"*. Dos rondas de corrección, las dos en
vivo contra el feedback real:

**Ronda 1 — fondo de escena + textura de botón.** Con dos preguntas de
opción múltiple se acotó el pedido: fondo fotorrealista NUEVO (no reusar
`fondo-primaria-1`) detrás del teclado, y una textura de madera en los
botones en vez del cuadro blanco — el dígito seguía pintado por CSS
encima. Generado con Gemini (`scripts/gen-pin-numerico-fondo.mjs`, mismo
modelo que `gen-larry-fotorrealista.mjs`): una escena de una tranquera de
madera abierta entre colinas doradas, y una textura de madera de cerca.
**Dos errores propios, corregidos antes de que el dueño los viera:**
(1) la imagen del fondo salió cuadrada (1024×1024) y el primer intento la
ESTIRÓ a 1:2 en vez de recortarla — se corrigió con `crop` antes de
`scale`; (2) el primer prompt de textura pidió "un botón de madera
aislado sobre blanco", y salió exactamente eso — una ficha chica flotando
en una tarjeta blanca, no una textura de pared a pared. Se corrigió
pidiendo explícito "full-bleed, sin bordes, sin objeto aislado".

**Ronda 2 — los dígitos tallados de verdad.** El dueño vio la ronda 1
("¡Mucho mejor!") y pidió el siguiente paso: *"manda a hacer los 10
botones para que se vean grabados bien"* — el número TALLADO en la madera,
no texto plano encima. Se generaron 10 piezas nuevas
(`pin-numerico-digito-0` a `-9`), cada una con la textura ya aprobada
mandada como imagen de REFERENCIA (mismo truco de consistencia que
`gen-larry-fotorrealista.mjs` usa con Larry) para que las 10 compartan el
mismo tono/veta de madera. **Un defecto real, encontrado en revisión
humana (D-080) y corregido antes de commitear:** el dígito "5" salió con
una marca de texto microscópica e ilegible incrustada en el borde de la
talla — un artefacto conocido del modelo (texto fantasma en los detalles
finos) — se regeneró esa sola pieza y salió limpia.

**Por qué NO las 10 en la primera ronda:** costaba más generar y revisar
10 piezas que 1, y la primera pregunta de opción múltiple concluyó que no
hacía falta — el dígito ya es un símbolo universal, no necesitaba ser una
foto propia. **En la práctica:** cuando se vio la versión de solo-textura en
pantalla real, sí hacía falta — el texto plano de CSS sobre una foto se
sentía genérico comparado con el resto de la app. La lección para la
próxima vez: en una pantalla ya fotorrealista, cualquier texto que NO sea
parte de la foto se nota.

**Alcance: SOLO el teclado numérico.** La rejilla de imágenes de KINDER
(D-012, `pin-imagenes.ts`) no se toca — ya estaba probada y aprobada antes
de esta sesión, y el dueño reaccionó específicamente a la pantalla nueva,
no a la vieja.

**Investigación relacionada:** D-080 (revisión humana obligatoria — es
literalmente lo que atrapó el artefacto del "5"), D-196 (mismo pipeline
Gemini + referencia), D-197 §2.

**Ronda 3 — el letrero también tallado, y un cuadro colgante con el
avatar.** El dueño vio la ronda 2 y pidió dos cosas más: el texto del
letrero ("Enter your PIN") también en el mismo lenguaje de madera —
aclarando él mismo el porqué no se hornea en la imagen ("entiendo que
tienes que tener 7 por los idiomas") — y un cuadro de fotos colgando de
madera, con el avatar ya elegido del niño (D-194) dentro. Dos piezas
nuevas: `pin-numerico-letrero` (una tabla de madera en blanco, colgada de
cuerdas de un gancho, foto realista) y `pin-numerico-marco` (un marco de
fotos de madera colgante, con el interior transparente vía colorkey) — el
texto y el avatar se pintan ENCIMA con HTML/CSS, nunca horneados, por la
misma razón que el dueño ya identificó.

**Dos bugs reales de CSS, no de arte, encontrados al probarlo en vivo:**

1. El alias/título se salían de la tabla de madera hacia la zona de la
   cuerda — el padding fijo no se ajustaba a las proporciones reales de la
   imagen (900×420). Se resolvió midiendo a mano dónde empieza/termina la
   tabla dentro de la imagen y posicionando el texto con `inset` absoluto
   sobre una caja con `aspect-ratio` fijo, no con padding a ojo.
2. El avatar dentro del cuadro salía a tamaño COMPLETO (512×512),
   desbordando muy por fuera del marco — un `<img>` posicionado en absoluto
   con `width`/`height: auto` usa su tamaño INTRÍNSECO e ignora
   `right`/`bottom` para el tamaño (los usa solo `top`/`left` para
   posición); hay que fijar `inline-size`/`block-size` explícitos para que
   el `inset` de verdad recorte al hueco del marco. Ninguna cantidad de
   ajuste al prompt de generación iba a arreglar esto — era CSS, no arte.

**El avatar es el ROSTER ILUSTRADO existente (D-194), con su fondo blanco
de "sticker" — no se regeneró.** Es arte ya aprobado; el marco fotorrealista
alrededor de un avatar ilustrado es la misma mezcla deliberada de estilos
que D-194/D-196 ya declararon en `QuienJuegaScene` (niño ilustrado, adulto
fotorrealista, en la misma pantalla) — no una inconsistencia nueva.

**Ronda 4 — estado presionado en fotos, no en CSS.** El dueño notó que
ninguno de los 10 botones tenía un estado de "presionado" real, y pidió
explícito que "todos los estados" fueran imágenes — se le ofreció la
alternativa más barata (un filtro CSS sobre la misma foto) y prefirió pagar
el costo de generar 10 fotos más. Cada `pin-numerico-digito-{d}-presionado`
usa como referencia SU PROPIO dígito ya aprobado (no la textura en blanco),
pidiendo la misma talla pero más oscura y con sombra más profunda — así el
número tallado es idéntico entre el estado normal y el presionado, cambia
solo la iluminación. El anillo naranja de foco/accesibilidad (WCAG 2.4.7)
se queda como refuerzo, no como el único indicador.

**Ronda 5 — que quepa sin scroll, y NO desactivar el zoom.** El dueño pidió
dos cosas a la vez: "todo debe ser visible sin scroll... para cada
dispositivo" y "que no acepte el zoom". Lo segundo se le mostró como
conflicto directo con una decisión ya escrita en este mismo archivo — quitar
`maximum-scale`/`user-scalable=no` viola WCAG 2.2 AA 1.4.4, con el padre que
acompaña o un niño con baja visión como caso real — y el dueño confirmó
NO cruzarla: el zoom se queda disponible.

Lo primero sí se resolvió, con un hallazgo real: los 10 botones no medían
88px fijos — crecían con `minmax(var(--tap-kinder), 1fr)` hasta llenar el
ancho disponible, y al ser cuadrados (`aspect-ratio: 1`) crecer en ancho es
crecer en alto también. En una pantalla de 375px eso daba botones de 114px,
no 88px — 4 filas así ya no cabían en un iPhone SE (667px) sin scroll. Se
fijó el ancho de columna EXACTO (`repeat(3, var(--tap-kinder))`) solo en el
numérico — la rejilla de imágenes de KINDER, que sí depende de crecer para
verse bien, no se toca. El resto del recorte salió de lo que ya no podía
crecer: cuadro, letrero, puntos y márgenes, todos más chicos que en la
primera versión, y la ayuda para el adulto se oculta del todo bajo 700px de
alto (es apoyo puro, nunca necesaria para entrar, `mc-20`). Verificado con
medición real de `scrollHeight` contra `innerHeight` en un viewport de
375×667 (iPhone SE), no a ojo: 654px de contenido en 667px de viewport.

## D-198 — Música de fondo en Modo Historia, con dos ánimos — reversa `PRESUPUESTO.musica` (`voz.ts`) y reversa puntual de D-035 · 2026-08-09

**El pedido llegó como pregunta abierta, no como especificación:** *"Y la
música de todo el phaser?"*. Antes de escribir código se investigó qué
existía y qué lo bloqueaba, y se le devolvió al dueño en preguntas de
opción múltiple, con las alternativas explicadas — su propia preferencia
ya documentada ([[prefers-interactive-questions]]). Confirmó las cuatro:

1. **Música también mientras se resuelve un ítem**, no solo en mapa/menú —
   reversa explícita de `PRESUPUESTO.mientras_resuelve.musica` y
   `PRESUPUESTO.al_resolver.musica` en `packages/tutor/src/voz.ts`, que
   hasta hoy eran `false` en los dos regímenes citando `mc-42` §3 (el habla/
   sonido irrelevante degrada el recuerdo serial aunque no se atienda) y el
   principio de coherencia de Mayer (quitar material decorativo que compite
   por capacidad limitada). **Esa evidencia no se borra** — sigue en el
   encabezado del archivo — se anota que el dueño decidió en contra de ella,
   viéndola explicada primero.
2. **Ducking automático** cuando Larry hable: la música baja de volumen
   sola, nadie la sube ni la baja a mano.
3. **Dos controles separados** — voz y música cada una con su propio
   interruptor, no uno que apague las dos juntas.
4. **Dos pistas por ánimo** ("calma" / "energía"), no una sola pista
   genérica ni un catálogo más grande.

**El bloqueo real, encontrado durante la propia investigación y mostrado
al dueño antes de generar nada:** Cloudflare Workers AI no tiene ningún
modelo de generación de música — la única vía real es un proveedor externo
(ElevenLabs Music, `POST /v1/music`), lo que toca **D-035** ("solo vamos a
trabajar con Cloudflare"). El dueño lo autorizó explícito, con la pregunta
planteada así, para este caso puntual — D-035 se queda intacta para todo
lo demás. **Nota sobre un plan anterior:** un documento previo de
planeación había asumido que este permiso "ya se dio en esta conversación"
y proponía reusar el número D-193 — ninguna de las dos cosas era cierta al
momento de implementar: D-193 ya estaba tomado por una decisión distinta y
ya enviada a producción (§ arriba, "¿Quién juega? pasa a Phaser"), y el
permiso no estaba escrito en ningún lado hasta que se volvió a pedir aquí.
Se trató el documento viejo como no verificado, no como autorización
vigente.

**Por qué el ducking existe en código pero no lo dispara nada todavía:**
la voz de Larry (D-192 en el plan, sin construir) no tiene ni un clip
grabado — el propio encabezado de `voz.ts` ya lo decía antes de esta
sesión: *"Ningún clip existe todavía... P-19 y P-20 de `docs/dudas.md`
están sin contestar"*, y P-19 es en sí mismo un conflicto sin resolver
entre D-035 (cuatro de los siete locales no tienen voz verificada en
Workers AI) y D-022 (paridad en los siete). Construir el ducking contra un
evento de voz que no existe sería inventar una integración sin nada que
integrar — en cambio, `MusicManager.agachar()`/`.restaurar()` quedan
públicos y listos: el día que exista un evento real de "Larry empezó/
terminó de hablar", lo llama y el ducking funciona sin tocar este código
otra vez.

**Arquitectura:** `MusicManager.ts` envuelve `game.sound` (no una escena)
para sobrevivir a los `scene.start()` del mapa → panel de nivel → el reto
en sí, exactamente como `ProgressManager` envuelve `game.registry` por la
misma razón. Se guarda una sola vez en el registro
(`game/main.ts::iniciarHistoria`). `reproducir("calma"|"energia")` es
idempotente — volver a llamarla con el ánimo que ya suena no reinicia el
loop — y nunca lanza si el archivo de audio no cargó (Android de gama baja,
red lenta o el par de pistas aún no generado): el mapa se juega en
silencio, nunca con una excepción sin capturar. "calma" suena en
`MenuScene`/`MapScene` (explorar); "energía" en `GameplayScene` (resolver).
`BotonMusica.ts` es el mismo patrón exacto que `BotonSonido.ts` (D-190) —
Zone invisible para el toque, halo blanco sin círculo de fondo (D-194),
glifo distinto (corchea en vez de bocina) — con su propia clave de
`localStorage` (`preferencia-musica.ts`, `mc:musica`, separada de
`preferencia-voz.ts`).

**Generación:** `scripts/gen-musica-fondo.mjs` (las 2 pistas, `POST
/v1/music`) y `scripts/gen-sfx.mjs` (los 3 efectos, `POST
/v1/sound-generation`) — mismo patrón que los scripts de arte de
Recraft/Gemini, misma llave (`ELEVENLABS_API_KEY`, capturada vía
`./scripts/set-keys.sh`, nunca commiteada). **Pendiente de ejecutar y de la
revisión de OÍDO del dueño (D-080)** — este PR deja el código listo;
ningún archivo de audio se generó ni se commiteó todavía.

### Ronda 2 — "todo el phaser", y efectos de un solo disparo, no solo música

El dueño probó la pantalla "¿Quién juega?" (D-193), la vio muda, y mandó una
captura preguntando: *"Yo sigo sin escuchar"*. La primera versión de esta
decisión había dejado esa pantalla fuera A PROPÓSITO ("selección corta, sin
el par de ánimos al que sirve esta música") — pero eso era un alcance no
confirmado, ofrecido de vuelta como pregunta. La respuesta, textual:
*"Tiene que sonar en todo el phaser. Siempre música y efectos especiales y
en los settings se prenden o pagan [sic, "apagan"]. Grábalo. Porque sigues
sin hacerlo. Confirma que entiendes que esto en un juego, que debe ser
adictivo como angry bird y es de matemáticas."*

Dos cambios reales sobre la ronda 1:

1. **`QuienJuegaScene` entra al alcance.** Tiene su propia instancia de
   `MusicManager`/`SfxManager` (es un `Phaser.Game` separado,
   `quien-juega/main.ts`, ya documentado como tal desde D-193) — "calma" al
   entrar, `BotonMusica` junto al `BotonSonido` ya existente, `sfx-toque` al
   elegir una tarjeta.
2. **Efectos de un solo disparo, nuevos, separados de la música en el
   CÓDIGO pero NO en el control:** `SfxManager.ts` es su propia clase (un
   loop con fundidos y un disparo-y-olvido son responsabilidades
   distintas), pero lee la MISMA preferencia que `MusicManager`
   (`preferencia-musica.ts`) — **juicio del equipo, no una palabra textual
   del dueño**: pidió "música Y efectos" como una sola idea de "sonido del
   juego", nunca un tercer botón. La línea que sí se pidió explícita es voz
   de Larry (narración) contra todo lo demás — un control más en la esquina
   por algo que nadie nombró como necesitando su propio interruptor habría
   sido la fragmentación que D-032 advierte contra inventar sin pedido.
   Tres efectos, generados con OTRO endpoint de ElevenLabs
   (`POST /v1/sound-generation`, `eleven_text_to_sound_v2` — pensado para
   sonidos cortos, no pistas musicales largas): `sfx-toque` (cualquier botón
   o nodo), `sfx-acierto` (veredicto correcto, junto a `celebrar()`),
   `sfx-error` (veredicto incorrecto — **explícitamente neutral, nunca un
   zumbador de castigo: línea roja #7, Larry no avergüenza, y el sonido
   tampoco**). "Racha"/celebración de sesión se dejó fuera: no existe
   todavía una pantalla de esa celebración en Phaser — generar un sonido
   para un momento que no existe sería adivinar, y es trabajo futuro real,
   no un olvido de esta ronda.

**Sobre "confirma que entiendes que esto es un juego... adictivo como angry
bird":** confirmado — la ronda 1 ya cubría música continua sin cortes por
resolver un ítem, y esta ronda añade el "juice" de retroalimentación
inmediata (sonido en cada toque, cada acierto, cada intento) que un loop
mudo de fondo no daba por sí solo. Lo que seguirá sin existir hasta que el
dueño lo autorice explícito son mecánicas de retención basadas en
variabilidad de recompensa (cajas de botín, rachas compradas) — esas SÍ
cruzan líneas rojas del proyecto (#5, #6) y ninguna palabra de esta
conversación las pidió; "adictivo" aquí se interpretó como "con buen
feedback sensorial", no como diseño de compulsión.

**Lo que esta decisión NO hizo:**

- **No hay presupuesto de peso auditado para audio.** `audits/bundle-
  budget.mjs` solo mide imágenes (mc-47 §4); el bitrate de 96kbps es un
  juicio razonable, no una regla que un auditor haga cumplir. Si el dueño
  quiere ese piso auditado, es un auditor nuevo, no parte de este cambio.
- **Las dos pistas NO entran a `PRECACHE` de `sw.js`.** `audits/precache-
  budget.mjs` ya existe, ya construido, esperando F5 (`audits/run.mjs`, lista
  `PENDING`) con un límite de 5 MB de audio citando `mc-42` §13 — pero ese
  límite es para lo que se baja en la PRIMERA instalación, antes de que
  nadie pida nada. La música de Modo Historia se carga con
  `this.load.audio()` de Phaser cuando el niño de verdad entra a jugar, y de
  ahí en adelante cae en el cache-first de `sw.js` para estático (mismo
  camino que cualquier WebP de `/juego/`) — RUNTIME, no INSTALL. Meterla a
  `PRECACHE` sería descargar 1-2 MB de música a cualquiera que visite el
  sitio, incluyendo quien nunca juega. `precache-budget` se queda
  correctamente en espera de F5: esto no es esa fase.
- **No resuelve P-19/P-20** ni la voz de Larry — quedan exactamente donde
  estaban, documentados en `docs/dudas.md` y en el encabezado de `voz.ts`.
- **El loop de 60s no se verificó "sin costura" al oído** — ElevenLabs no
  garantiza un loop perfecto solo por pedirlo en el prompt; esa
  verificación es parte de la revisión pendiente de arriba, no algo que
  este código pueda confirmar por sí solo.

**Investigación relacionada:** D-022, D-035, D-190, D-193 (la de "¿Quién
juega?", no la del plan viejo), `mc-42` §3, `docs/dudas.md` P-19/P-20.

## D-199 — PerfilAjustesScene: el engrane de "¿Quién juega?" abre ajustes reales (D-197 §55.10)

Segunda de las dos pantallas de Phaser que D-197 dejó pendientes (la
primera, el teclado numérico del PIN, ya está en producción como D-197.1).
Un engrane nuevo en cada tarjeta de NIÑO (nunca en la del adulto — ver
alcance abajo) abre un panel con cinco acciones de solo-toque: idioma,
banda ("cómo se va a ver el juego", reusando el texto ya autorado de
`PerfilNuevo.astro`), avatar, otro alias, y borrar con papelera de 30 días
— los cinco endpoints de D-197 que ya estaban en producción sin ninguna
pantalla que los llamara.

**Por qué el panel necesitó ampliar los datos que ya viajaban a Phaser.**
`TarjetaPerfil` (la que `kids/index.astro` inyecta como JSON) solo traía lo
necesario para PINTAR la rejilla — nunca la banda actual del niño. Se
amplió con `themeBand` (child_profiles.theme_band, ya resuelta por el
servidor) y con un nuevo bloque `rotulos.ajustes` en el JSON, reusando
CASI TODO de claves ya existentes (`profileThemeKinder/Primaria/Secundaria`,
`profileThemeLegend`, `profileThemeOutOfRange`, `profileAliasLegend`,
`profileAliasAnother`) — solo nueve claves (`settings*`) eran genuinamente
nuevas, y se agregaron a los 7 locales con traducción real, no placeholder.

**Por qué "cambiar PIN" navega a una página aparte y no vive en el mismo
lienzo.** La rejilla de 9 imágenes de KINDER se DERIVA del secreto del
servidor (`pin-imagenes.ts::rejillaDe`) — el mismo cálculo que
`kids/pin.astro` ya usa para la verificación. Reconstruirlo en el cliente
exigiría exponer el secreto o duplicar esa pieza de seguridad fuera del
servidor; ninguna de las dos es aceptable por un ahorro de una navegación.
`kids/perfil-pin.astro` es una página real, nueva, gateada por
`leerSesionAdulto` + pertenencia de hogar (igual que los 6 endpoints),
que reusa el mismo catálogo de emoji/nombres que la pantalla de
verificación — nunca los assets fotorrealistas de madera de D-197.1, que
son decoración específica de esa pantalla, no del sistema de PIN en sí.

**El hallazgo real, encontrado investigando y no asumido: las sesión del
adulto puede estar vencida en un dispositivo que sigue siendo "de la
casa".** `COOKIE_ADULTO` dura 30 días (`VIDA_ADULTO_S`); `COOKIE_HOGAR`
dura 400 (`VIDA_HOGAR_S`, "el techo de Chrome"). Un tablet de uso diario
puede llegar a "¿Quién juega?" con el dispositivo confiable de sobra y la
sesión del adulto ya vencida — exactamente el mismo caso que CUALQUIER
página adulta del sitio ya resuelve. `PerfilAjustesScene` y
`perfil-pin.astro` hacen lo mismo ante `401 sin_sesion`: navegación real a
`ruta(locale, "entrar")+"?cambiar=1"`, nunca un mensaje de reautenticación
inventado dentro del lienzo.

**Un juicio de diseño, documentado para que se pueda revertir:** el gear
NO aparece en la tarjeta del adulto. Su propio nombre/@usuario (D-197 §1)
queda para 55.11, junto con el asistente de crear-perfil reconstruido —
los dos tocan el mismo problema de fondo (texto libre del adulto dentro de
Phaser, que hoy no tiene ningún patrón de input de texto) y tiene más
sentido resolverlo una sola vez ahí que a medias aquí.

**Verificación — lo que se hizo y lo que NO:**

- `astro check`: 0 errores. `pnpm build` (`apps/web`): completo sin
  errores. `node audits/run.mjs`: verde salvo las mismas 2 fallas
  pre-existentes y ajenas (`brand-image` en `pin.astro`/`retos.astro`,
  `bundle-budget` de JS por Phaser) — ya documentadas en D-198 y antes.
  Tres fallas NUEVAS sí aparecieron y se corrigieron antes de seguir:
  `band-typography` (una `font-family` literal en vez de
  `var(--font-sistema)`), `touch-targets` (el enlace "volver" medía 22.4px,
  bajo el piso de 24px de WCAG 2.2 AA 2.5.8) y `hojas-de-estilo` (un
  `data-band` en el `<html>` que ninguna regla leía — se quitó en vez de
  inventarle uso, porque esta pantalla no necesita variar por banda).
- **NO se verificó de punta a punta en un navegador con un perfil real.**
  Se intentó sembrar una cuenta de prueba contra `wrangler dev` local y
  Turnstile lo bloqueó dos veces: la `TURNSTILE_SITE_KEY` de `.env` es la
  de PRODUCCIÓN (restringida a `math.kilowatto.com`, no a `localhost`), y
  el secreto de siempre-pasa de `.dev.vars` no llegó al Worker del entorno
  de previsualización usado en esta sesión (`turnstile:no_configurado`
  incluso apuntando el POST directo a `/api/registro`). No se intentó
  sembrar D1/KV a mano por el riesgo de un cookie/hash mal formado dando
  una falsa sensación de "sí se probó". La pieza queda respaldada por
  tipos, build y auditores deterministas, pero **no por un clic real** —
  eso es trabajo pendiente antes de dar 55.10 por completamente cerrado.

**Investigación relacionada:** D-197, D-197.1, D-065, D-012, D-070
(`rutas-app-con-locale.mjs`).

### D-199.1 — Correcciones tras verlo en vivo, dos rondas: engranes de madera y el panel "como un videojuego" · 2026-08-09

Desplegado 55.10 (D-199), el dueño lo probó de verdad en su teléfono y
mandó dos rondas de feedback en vivo — la primera con una captura, la
segunda solo texto.

**Ronda 1 — "Los engranes no funcionan bien, deben ser de madera 🪵 y ten 4
o 5 diferentes."** El engrane original era un glifo gris de
`Phaser.Graphics`, idéntico en cada tarjeta — funcionaba (el panel sí
abría), pero desentonaba con el resto del atrezo de esta pantalla
(`letrero-madera`, `flecha-madera`, `tronco-a/b`, todos madera de Recraft).
Se generaron 5 variantes (`engrane-madera-1` a `-5`, `scripts/gen-mapa-
historia.mjs`) — distinto número de dientes/rayos y tono de madera cada
una, mismo criterio que `tronco-a`/`tronco-b` para que el camino/la rejilla
no se vea repetido. Una ronda de regeneración: la primera versión de
`engrane-madera-2` salió con una escena de paisaje tallada en el centro
(el mismo tipo de "sobre-interpretación" que ya documentó el intento
abandonado de placa de madera para las tarjetas, más arriba en este mismo
archivo) — se regeneró con "no carving, no picture, no scene" explícito en
el prompt. `BotonEngrane.ts` ahora pinta la textura si cargó y cae al
glifo gris de antes si no (offline, red lenta) — nunca un botón invisible.
La variante es determinista por índice de tarjeta (`indice % 5`), mismo
patrón que `formasUsadas`/`coloresUsados` en `kids/index.astro`.

**Ronda 2 — cuatro pedidos sobre el panel mismo, sin captura, solo texto:**

1. **"Un poco más grande el modal."** De 320×500 a 356×560.
2. **"El botón de eliminar más pequeño. Solo un bote de basura."** La fila
   completa "Borrar perfil" con su botón de ancho completo se quitó del
   flujo; en su lugar, un ícono chico de bote de basura (`Graphics`, tono
   de peligro) vive en el encabezado, junto al cierre. Sigue exigiendo el
   MISMO paso de confirmación de dos toques que ya existía — lo que cambió
   es el tamaño del gatillo, nunca la seguridad detrás: ni un borrado
   accidental se volvió más fácil.
3. **"Un botón de salvar o guardar."** Un botón naranja de ancho completo
   al final del panel, `this.rotulos.guardar` (nueva clave `settingsSave`,
   7 locales). Cierra el panel — cada acción individual ya se guarda sola
   al tocarla (D-199 original), así que "Guardar" no dispara una segunda
   llamada de red: es la vía principal y esperada de terminar, con la X de
   la esquina como salida rápida alternativa. Las dos pasan por el mismo
   `cerrar()`.
4. **"Cuando se abra que se vuelta la tarjeta y crezca animadamente. Como
   un vídeo juego con efecto especial de sonido cuando se abra y se
   cierre."** El panel ya no aparece centrado de la nada: nace en la
   posición REAL de la tarjeta tocada (`origenX/origenY`, mismo patrón que
   `ChallengeScene::origen` con los nodos del mapa) y anima en DOS fases —
   se adelgaza a un canto vertical ahí mismo (el "volteo"), salta al centro
   ya de canto, y crece a tamaño completo con `Back.easeOut`. Cerrar hace
   lo mismo al revés, terminando de vuelta en la tarjeta. Dos efectos
   nuevos, `sfx-panel-abre`/`sfx-panel-cierra` (un "pop" de madera al
   abrir, un golpe suave al cerrar — no un "whoosh" digital genérico,
   mismo lenguaje sonoro que el resto del atrezo), agregados a
   `SfxManager`/`scripts/gen-sfx.mjs`. **Silenciosos hasta que exista
   `ELEVENLABS_API_KEY`** — mismo bloqueo que las 5 pistas/efectos de
   D-198, sin resolver todavía.

**Verificación:** `astro check` (0 errores), `pnpm build`, `node
audits/run.mjs` (verde salvo las mismas 2 fallas ajenas de siempre) y
`node audits/live.mjs` (51/51) — dos despliegues a producción en la misma
sesión, uno por ronda. **Seguimos sin un clic real registrado por esta
sesión** (el dueño probó en su teléfono y mandó las capturas/texto que
motivaron estas dos rondas, pero eso es SU verificación, no una que yo haya
hecho y pueda dar por escrita aquí como propia).

**Investigación relacionada:** D-199, D-196.1, D-196.2, D-194 (props de
madera), D-080.

### D-199.2 — `brand-image.mjs` llevaba tiempo marcando la madera/pergamino sin que nadie la hubiera dado de alta · 2026-08-09

Al capturar `ELEVENLABS_API_KEY`, `set-keys.sh` corre `brand-image.mjs` por
costumbre (no por sospecha) y salió en rojo: 9 líneas con `#8A5A2B`
(borde de madera), `#3E2712` (texto sobre veta clara), `#F3E4C8`
(pergamino) y `#FDEDD7` (pergamino activo) — en `PerfilAjustesScene.ts`,
`QuienJuegaScene.ts` y `pin.astro`/`perfil-pin.astro`. Ninguno es un color
nuevo: son el mismo atrezo de madera que D-190/D-194/D-195/D-196/D-197.1
ya construyeron y el dueño ya vio y pidió en vivo — el hueco es de
proceso, no de diseño: nadie los dio de alta en `PALETTE`
(`audits/brand-image.mjs`) cuando se introdujeron, así que el auditor los
venía marcando en cada corrida y nadie lo notó porque la corrida normal
solo imprime el NOMBRE del auditor que falla (`✗ auditor brand-image`),
no la lista de líneas — hay que pedir el detalle a propósito para verlo,
y esta sesión no lo había estado haciendo tras cada cambio.

Se registran los cuatro como excepción con candado, mismo formato que la
excepción de verde de D-186 pero con un candado DISTINTO: D-186 dice
"nunca en UI"; éste dice "solo dentro de la estética de prop de madera
(letreros, troncos, tarjetas, engranes, y su texto/botones) — nunca fuera
de esa superficie", porque a diferencia del verde, la madera SÍ vive en
controles reales de esa pantalla a propósito. No es una decisión nueva del
dueño: es poner por escrito lo que ya estaba aprobado de facto y en
producción.

**Queda igual, sin tocar:** `apps/web/src/pages/[locale]/app/kids/
retos.astro:71` — `var(--ignia-naranja-900, #7a3a10)`, un color DISTINTO
(un fallback de una variable CSS nunca definida), ya fallando desde antes
de esta sesión y sin relación con la madera. No se resuelve aquí.

**Investigación relacionada:** D-186, D-190, D-194, D-197.1, D-199.1.

### D-199.3 — Video analizado cuadro por cuadro: engrane fuera de la tarjeta, salto en la animación, "toque" inaudible, y el bug real detrás de "8 hijos" · 2026-08-09

El dueño mandó una grabación de pantalla (sin audio — el emulador no
captura sonido, confirmado con `ffprobe`) más texto, y pidió explícito
"analiza a detalle el video". Se extrajeron cuadros con `ffmpeg` y se
revisaron uno por uno. Cuatro hallazgos reales, los cuatro corregidos:

1. **El engrane se salía del panel.** Su centro estaba en `(RADIO+1,
   -RADIO-1)` con radio 18 — más allá de donde el panel empieza a
   redondear la esquina (radio 18 también, centrado en `(RADIO+14-18,
   -(RADIO+14-18))`). Confirmado en tres cuadros distintos del video: el
   engrane asoma visiblemente fuera del borde marrón de la tarjeta.
   Corregido moviéndolo exacto al centro del arco de esa esquina — con el
   mismo radio, lo inscribe sin asomarse. (La "talla" de verdad — que el
   engrane se vea grabado EN la misma madera de la tarjeta y no como una
   moneda separada encima — sigue pendiente: eso es arte nuevo de Recraft
   referenciado contra el pergamino de cada tarjeta, no una corrección de
   posición, y no se atacó en esta ronda.)
2. **"Brinca la modal al centro sin estar conectada la animación" — el
   dueño tenía razón, y era un bug real, no percepción.** La animación de
   abrir/cerrar corría en DOS tweens separados con un `panel.setPosition()`
   SUELTO entre uno y otro — un salto de posición sin interpolar, aunque
   ocurriera con el panel casi invisible de canto. Se unificó a UN solo
   tween: posición y escala se mueven juntas del punto de la tarjeta al
   centro, siempre interpoladas. El aire de "volteo" ahora viene de que
   `scaleX` arranca más angosto que `scaleY` y los dos llegan a 1 al mismo
   tiempo — se ve desdoblar, nunca saltar.
3. **"El audio sí se escucha, música... ningún efecto especial de abrir o
   cerrar."** Se midió el volumen real de los 5 efectos con
   `ffmpeg -af volumedetect` en vez de adivinar (no se puede escuchar
   audio): `sfx-toque` salió a **-62.6 dB de media**, entre 25 y 40 dB más
   bajo que los otros cuatro (-21 a -27 dB) — prácticamente inaudible, un
   defecto real de esa generación específica de ElevenLabs, no del código.
   `sfx-panel-abre`/`sfx-panel-cierra`, en cambio, salieron con volumen
   NORMAL (-26/-27 dB, igual que acierto/error) — la revisión del código
   que los dispara (`PerfilAjustesScene.ts::create()/cerrar()`) no encontró
   ningún defecto: misma llamada, mismo `SfxManager`, mismas claves ya
   cargadas en `QuienJuegaScene.preload()`. **No se pudo confirmar la causa
   de que no se escuchen** — queda como sospecha sin resolver, no como bug
   cerrado. Se agregó `loudnorm` (EBU R128, -14 LUFS) al pipeline de
   conversión (`scripts/gen-sfx.mjs`) y se re-normalizaron los 5 archivos
   ya generados — `sfx-toque` quedó en -20.1 dB, ya parejo con el resto.
4. **"No entendí cómo se va a ver con 8 hijos más el padre" — la
   pregunta escondía un bug real, no solo una duda de diseño.** Leyendo
   `dibujarRejilla()`: cuando hay más filas de tarjetas de las que caben en
   pantalla, el código YA calcula el mundo más alto y mueve la cámara —
   pero el único scroll conectado era la RUEDA DEL MOUSE
   (`this.input.on("wheel", ...)`). Un iPhone no tiene rueda: con más de
   ~4 hijos, las tarjetas de abajo habrían quedado completamente
   inalcanzables por toque, sin ningún aviso. Se agregó arrastre vertical
   táctil, mismo patrón que `MapScene::configurarArrastre`
   (pointerdown/pointermove/pointerup globales) — coexiste con el toque de
   cada tarjeta exactamente como ya coexiste en el mapa.

**Además, de paso:** se restyleó `kids/perfil-pin.astro` — "esa pantalla
horrible en blanco" era la primera versión, sin ningún color de marca,
mientras el resto de la app usa pergamino/madera. Ahora reusa EXACTAMENTE
la excepción de paleta ya registrada en D-199.2 (pergamino, madera-oscura,
madera-texto, pergamino-activo) — ninguna paleta nueva.

**Verificación:** `astro check` (0 errores), `node audits/run.mjs` (verde
salvo las mismas 2 fallas ajenas), `pnpm build`, despliegue, `node
audits/live.mjs` (51/51). **Lo que sigue sin verificarse con certeza:**
si el efecto de abrir/cerrar panel ya se escucha de verdad — el arreglo de
loudness es la mejor corrección disponible sin poder oír el resultado,
pero no hay una prueba humana todavía que confirme que resolvió la causa
raíz (que sigue sin identificarse con certeza).

**Investigación relacionada:** D-199, D-199.1, D-199.2.

### D-199.4 — Tercera ronda en vivo: más aire para el engrane, los efectos se agrupan con la voz (no la música), y "¿dónde está la madera?" en `perfil-pin.astro` · 2026-08-09

Tres correcciones más, todas desde feedback en vivo tras D-199.3:

1. **El engrane seguía "no del todo dentro" — la primera corrección lo
   dejaba TANGENTE al borde, no con margen de verdad.** Centrar un círculo
   del mismo radio que el arco de la esquina hace que su borde COINCIDA
   con el borde del panel — cero superposición, pero también cero aire, y
   a esa escala se sigue leyendo "en el borde". Se achicó el engrane (18→15
   px de radio, `BotonEngrane.RADIO_ENGRANE`, ahora exportado para que
   `QuienJuegaScene` calcule la posición contra el mismo número) y se le
   sumaron 4px de margen real hacia adentro.
2. **"Los efectos también se paran con el ícono de la nota y no de la
   bocina, y eso está mal."** D-198 había agrupado `SfxManager` con
   `preferencia-musica.ts` razonando que "música y efectos" eran una sola
   idea frente a la voz. El dueño lo corrigió: la bocina es el interruptor
   general de sonido de INTERFAZ (toque, acierto, error, abrir/cerrar un
   panel) — la nota es solo música de fondo. `SfxManager` ahora lee
   `preferencia-voz.ts`, la misma preferencia que ya usaba `BotonSonido.ts`
   para la voz de Larry.
3. **"No me digas que este es el modelo de pin que queríamos!! ¿dónde está
   la madera? todo lo trabajado!!!"** El restyle de D-199.3 (una tarjeta
   CSS plana con la paleta pergamino) no era lo pedido — el dueño esperaba
   que esta pantalla reusara EXACTO el atrezo fotorrealista de D-197.1: el
   portón (`pin-numerico-fondo.webp`), el letrero colgante
   (`pin-numerico-letrero.webp`), el cuadro con el avatar
   (`pin-numerico-marco.webp`) y los diez dígitos tallados
   (`pin-numerico-digito-N[-presionado].webp`) — las MISMAS imágenes que
   `kids/pin.astro` ya usa, copiadas a propósito y no reinventadas, porque
   ya están aprobadas (D-080) y en producción. Se amplió la consulta SQL
   para traer `avatar_parts` (antes no se pedía) y se calculó el avatar con
   el mismo `animalElegido()`/`claveDeAnimal()` que usa la pantalla de
   verificación. La rama de KINDER (imágenes) se queda en el pergamino
   simple de D-199.2 — igual que en `kids/pin.astro`, ese tratamiento
   fotorrealista es solo del teclado numérico.

**Verificación:** `astro check` (0 errores), `node audits/run.mjs` (verde
salvo las mismas 2 fallas ajenas), `pnpm build`, despliegue, `node
audits/live.mjs` (51/51). El margen del engrane y la reagrupación de
`SfxManager` son correcciones geométricas/de código, verificables por
lectura; el restyle de `perfil-pin.astro` reusa imágenes ya revisadas por
el dueño en D-197.1, así que no exige una revisión de arte nueva — pero
**sigue sin confirmarse con un clic real en el dispositivo del dueño**.

**Investigación relacionada:** D-199, D-199.1, D-199.2, D-199.3, D-197.1.

### D-199.5 — El letrero de "¿Quién juega?" pasa de texto pintado por Phaser a texto TALLADO en la madera, uno por locale, con efecto de viento · 2026-08-09

Pedido explícito del dueño viendo el letrero en vivo: *"no puedes hacer este
en 7 imágenes (una por cada idioma) para que se integre bien a la imagen? y
no vuelen las letras? para que se vean esculpidas en la madera??? y que
tenga efecto de aire que se mueva un poco porque sopla el aire?"* — el
letrero de D-194/D-199 pintaba el título y la pista con `Phaser.Text` ENCIMA
de una imagen de madera en blanco (mismo patrón que `MenuScene`); el dueño
lo vio y pidió el texto tallado de verdad, no pintado, y con el mismo efecto
de viento que ya existía en `MenuScene`.

**Riesgo conocido y MEDIDO antes de generar el lote completo, no supuesto.**
Antes de pedir las 7 imágenes se generó UNA prueba en español
(`scripts/prueba-letrero-tallado.mjs`, descartable) con título grande
("¿Quién juega?") y subtítulo chico ("Toca tu dibujo."): el título salió
perfecto, el subtítulo salió con una letra de más ("dibuijo"). Se le mostró
esa prueba al dueño, con el fallo señalado, y se le preguntó cómo seguir
(`AskUserQuestion`, tres opciones: solo tallar el título grande y dejar la
pista pintada por Phaser — más seguro; tallar las dos líneas en las 7,
sabiendo que hace falta revisar ortografía letra por letra; o no tallar
nada y dejarlo como está). **Eligió tallar las dos líneas, las 7 completas**,
sabiendo el riesgo.

**Qué se construyó — `scripts/gen-letrero-quien-juega.mjs` (nuevo):**
Gemini (`gemini-2.5-flash-image`) con el letrero en blanco ya aprobado
(`.arte-crudo/letrero-madera-alfa.png`) como referencia visual estricta
(mismo prop, misma veta, mismas cuerdas), un archivo por locale — es-MX y
es-ES comparten UNA imagen porque el texto es idéntico en los dos
("¿Quién juega?"/"Toca tu dibujo."), así que son 6 imágenes para 7 locales,
no 7. El prompt final pide tallado profundo con sombra dentro de cada
trazo, prohíbe explícitamente texto pintado/pegatina, exige revisar la
ortografía letra por letra antes de dibujar, y excluye fondo/pasto/tierra —
el fondo debe quedar blanco puro y aislado para que `ffmpeg colorkey`
recorte el alfa igual que el resto de los props de madera.

**Revisión humana de las 6, letra por letra contra el string exacto de
`i18n/*.json` (D-080) — no "se ve bien", sino comparación pixel por
pixel.** Dos fallaron en la primera pasada, exactamente donde la prueba ya
había anticipado que fallaría:

- `es`: subtítulo con una letra de más ("dibubo" en vez de "dibujo" — un
  error DISTINTO al de la prueba, no el mismo, confirmando que el fallo es
  de la clase "texto chico", no un typo fijo).
- `pt-BR`: texto correcto pero con pasto/vegetación filtrándose al fondo
  pese a pedir "aislado en blanco".

Ambas se regeneraron con el prompt reforzado (instrucción explícita de
doble-checar ortografía + lista explícita de exclusiones de escenario) y
salieron correctas al primer reintento. Las 6 quedaron verificadas antes de
commitear: `en`, `es` (MX/ES), `fr-FR`, `pt-BR`, `pt-PT`, `de-DE`.

**Wiring en `QuienJuegaScene.ts`:** `LETRERO_POR_LOCALE` mapea el locale de
PÁGINA (`DatosQuienJuega.locale`, no el de la tarjeta) a la clave de textura
tallada; si la textura no cargó por lo que sea, cae a `letrero-madera` CON
el texto pintado por Phaser como respaldo — nunca un letrero mudo. Se quitó
el `this.add.text()` de título y pista cuando SÍ hay imagen tallada. El
efecto de viento (`registrarVientoEnLetrero`) es el mismo patrón ya escrito
para `MenuScene` — pivote en la cuerda de arriba (origen `(0.5, 0)`,
reposicionado para no mover la imagen), ±1.8° cada 3.2s, respeta
`prefers-reduced-motion` — adaptado porque este letrero NO se centra en
`width/2` como el de `MenuScene` (vive corrido a la derecha de la flecha de
regreso), así que el pivote se calcula desde la posición propia del
letrero, no desde el centro de pantalla.

**Verificación:** `astro check` (0 errores), `node audits/run.mjs` (verde
salvo las mismas 2 fallas ajenas y ya conocidas: `bundle-budget` por Phaser,
`brand-image` por `retos.astro:71`), `astro build`, despliegue
(`2d4032c2-890c-4a6f-ab73-52e6c2bf3f78`), `node audits/live.mjs` (51/51).
Las 6 imágenes se confirmaron servidas en producción (200, tamaños entre 52
y 60 KB) tras el retraso de propagación del manifest ya documentado en
`CLAUDE.md` (`pt-PT` dio 404 en el primer chequeo, 200 quince segundos
después — el mismo patrón medido en F0, no una falla nueva).

**Lo que esto NO hizo:** no se tocó el efecto de viento ya agregado a
`MenuScene.ts` en la misma sesión (letrero de "Modo Historia"/"Retos",
escena distinta) — sigue ahí como mejora independiente, no es lo que el
dueño pidió esta vez pero tampoco estorba. No se confirmó todavía con un
clic real en el dispositivo del dueño — pendiente, igual que D-199.4.

**Investigación relacionada:** D-199, D-199.1–D-199.4, D-080 (revisión
humana de arte generado), D-194 (mismo patrón de referencia visual estricta
para el arte de Larry).

### D-199.6 — Encontrada la causa real de "¿por qué la flecha de salir me manda a esta pantalla?": un enlace "volver" que EMPUJA historial en vez de consumirlo · 2026-08-09

El dueño había dejado esta pregunta pendiente, explícitamente aplazada
("continúa y después resuelve esto"): *"solo quiero entender también por
qué cuando le doy a la flecha de salir sale esta pantalla?"* — la flecha
de "¿Quién juega?" (`FlechaAtras.ts`) lo mandaba, sin patrón aparente, a la
pantalla de cambiar PIN. Se investigó a fondo (agente de exploración, sin
adivinar) en vez de suponer que era caché.

**Causa real, encontrada leyendo el código, no supuesta:** `FlechaAtras.ts`
llama `window.history.back()` a propósito (mismo patrón documentado en su
propio comentario: esta pantalla se llega desde más de un lugar, y el
historial ya sabe cuál es el correcto). Pero el link "volver" de
`perfil-pin.astro:126` NO hacía lo mismo — era un `<a href={rutaVolver}>`
normal, es decir, una navegación de IDA a `kids/index.astro`, que EMPUJA
una entrada nueva al historial en vez de consumir la que trajo hasta ahí.

Secuencia real reconstruida:

1. Niño en "¿Quién juega?" (`kids/index.astro`) — historial: `[…, quienJuegaA]`.
2. Adulto toca el engrane de un perfil → `PerfilAjustesScene` (overlay de
   Phaser, misma página, historial sin cambios).
3. Toca "Cambiar PIN" → navegación real a `perfil-pin.astro` — historial:
   `[…, quienJuegaA, perfilPin]`.
4. Toca "volver" → navegación real (de ida) a `kids/index.astro` —
   historial: `[…, quienJuegaA, perfilPin, quienJuegaB]`.
5. Ahora en `quienJuegaB`, toca la flecha de salir → `history.back()` →
   aterriza en la entrada anterior, que es **`perfilPin`** — la pantalla
   de cambiar PIN reaparece sin que nada la haya pedido.

Esto explica el síntoma exacto: una flecha que dice "salir" y en cambio
muestra una pantalla de ajustes.

**Arreglo:** el link "volver" ahora llama `window.history.back()` (mismo
criterio que `FlechaAtras.ts`) en vez de navegar de ida a
`kids/index.astro` — con el `href` original intacto como respaldo si
JavaScript no corrió (D-012, mejora progresiva). Se aplicó el mismo cambio
al redireccionamiento tras guardar un PIN nuevo (`window.location.href =
rutaVolver` → `volver()`), porque tenía exactamente el mismo defecto: cada
PIN cambiado con éxito también empujaba una entrada nueva al historial.

**Verificación:** `astro check` (0 errores), `node audits/run.mjs` (verde
salvo las mismas 2 fallas ajenas y ya conocidas), `astro build`,
despliegue (`0200fe9b-7ff5-4980-a613-324cf530f6d9`), `node
audits/live.mjs` (51/51). **No confirmado todavía con un clic real en el
dispositivo del dueño** — pendiente, como el resto de D-199.x.

**Lo que esto NO hizo:** no se tocó `FlechaAtras.ts` (ya se comportaba
bien) ni ningún otro enlace de salida — el agente de exploración revisó
`GameplayScene.ts`, `ChallengeScene.ts`, `Pantalla.astro` y `mapa.astro` y
confirmó que sus flechas de salida van todas a mapa/selector de perfil,
nunca a una pantalla de PIN; el único punto roto era este.

**Investigación relacionada:** D-199, D-199.1–D-199.5.

## D-200 — Un solo precargador global para toda la app de niño, con candado de versión automático · 2026-08-09

**El problema, señalado en vivo:** "¿por qué al cargar quien juega primero me muestra la versión vieja y después carga la nueva?" — y, aparte, "el loader está cuando entro a la cebra [el perfil del avatar cebra] en lugar de cuando entro al phaser a la primera parte." Las dos observaciones son la MISMA causa: `QuienJuegaScene` y `PreloadScene` (Modo Historia) son dos `Phaser.Game` separados (páginas distintas, D-192), cada uno con su propia lista de imágenes/audio, y cada uno descubre sus archivos nuevos justo cuando los necesita — nunca antes. La "versión vieja" que se ve primero es la rejilla HTML real (D-012, mejora progresiva — eso está bien y no se toca); el hueco hasta que Phaser termina de pintar crece porque, entre las dos páginas, hay ~82 archivos únicos (~5.6 MB) que se piden la primera vez que cada pantalla los necesita, nunca antes.

**Alcance, decidido por el dueño vía preguntas de opción múltiple:**
1. **Catálogo completo** (quien-juega + Modo Historia + reto — confirmado que `GameplayScene.ts` no carga nada propio, reusa la cola de `PreloadScene`, así que "considera los retos" ya estaba cubierto) — no un subconjunto por perfil.
2. **Cachear los archivos**, no fusionar las páginas en una sola sesión de Phaser — cambio acotado, no toca cómo navegan las pantallas hoy.
3. **Texto de progreso visible en pantalla** ("Cargando imágenes…"/"Cargando sonidos…"), no solo una animación muda.

**Qué se construyó:**

1. **`apps/web/src/game/assets-manifest.ts`** (nuevo) — la lista única de todo lo que carga Phaser: `IMAGENES_QUIEN_JUEGA`, `IMAGENES_MODO_HISTORIA`, `TODAS_LAS_IMAGENES` (la unión, deduplicada), y el mismo patrón para audio (`AUDIOS_QUIEN_JUEGA`/`AUDIOS_MODO_HISTORIA`/`TODOS_LOS_AUDIOS`). `QuienJuegaScene.preload()` y `PreloadScene.preload()` ahora importan de aquí en vez de repetir rutas a mano — un archivo nuevo agregado a una escena no puede quedar fuera del precargador global por descuido. Ambas escenas siguen funcionando SOLAS si algo impide que el precargador global corra (nunca dependen de él para existir).
2. **`CargaGlobalScene.ts`** (nuevo) — primera escena que arranca `main.ts::arrancarQuienJuega()` (antes arrancaba `QuienJuegaScene` directo). Sin imagen propia — su interfaz es `Graphics`/`Text` puro a propósito, porque es la única pantalla que tiene que dibujarse ANTES de que exista una sola imagen en caché. Carga imágenes primero y audio después (en ese orden, como pidió el dueño), con el texto de la etapa actual visible en el idioma de la página (`RotulosQuienJuega.carga.{imagenes,sonidos}`, dos claves nuevas en los 7 locales: `kidsLoadingImages`/`kidsLoadingSounds`).
3. **`public/sw.js` no se tocó** — su estrategia "Estático" (cache-first, sin cambios) ya cachea cualquier archivo que pase por `fetch`, sin importar qué lo pidió. Al precargar TODO desde el primer toque, esos mismos archivos ya están en caché cuando Modo Historia los vuelve a pedir minutos después — se sirven al instante, sin red.
4. **El candado de versión — "que nunca se vuelva a ver un loader" sin volver a bajar todo en cada deploy sin necesidad.** `astro.config.mjs::activosVersionD200()` (mismo patrón que `mc-redirecciones-d049`, un hook `astro:build:done`) hashea los BYTES reales de `public/{juego,mapa,avatares}` en cada build y escribe `dist/assets-version.json`. `CargaGlobalScene` compara ese hash contra un marcador en `localStorage`: si coinciden, NI SIQUIERA dibuja su UI — pasa directo a `QuienJuegaScene`. Si un deploy cambió una sola imagen (el hash cambia solo, sin que nadie suba un número a mano), se vuelve a precargar todo automáticamente.

   **Por qué un hash automático aquí y no el `VERSION = "v2"` manual que ya tiene `sw.js`:** el propio `sw.js` explica su elección — "un hash automático invalidaría en cada build aunque nada cambiara, y en 4G lento eso son megabytes que el usuario vuelve a pagar sin razón." Esa razón sigue siendo válida para el SHELL (HTML/fuentes/íconos), que cambia con CADA deploy de código aunque ningún asset se toque — y este proyecto despliega varias veces por hora. Por eso `activosVersionD200()` hashea SOLO tres carpetas (`juego`/`mapa`/`avatares`), nunca `dist` entero: el hash cambia ÚNICAMENTE cuando de verdad cambia un archivo ahí adentro (uno nuevo, uno borrado, o el mismo nombre con arte distinto) — no en un deploy de código que no toca ni una imagen, como el de D-199.6 unas horas antes. Las dos filosofías (manual para el shell, automático para los assets pesados de Phaser) conviven sin contradecirse: cada una resuelve el riesgo real de su propia superficie.

**Verificación:** `astro check` (0 errores), `node audits/run.mjs` (verde salvo las mismas 2 fallas ajenas ya conocidas: `bundle-budget` por Phaser, `brand-image` por `retos.astro:71`), `astro build` (el hook nuevo corrió: `assets-version.json — 3fae6caaf3c4e424, 168 archivos`), despliegue (`0baad5da-308d-4070-9e00-e51f9539f6da`), `node audits/live.mjs` (51/51, incluyendo `assets-version.json` sirviendo 200 en producción).

**Lo que esto NO hizo:**
- **No se probó con un clic real en el dispositivo del dueño** — ni el candado de versión, ni el texto de progreso, ni la mejora real del hueco entre pantallas. `audits/live.mjs` verifica HTTP (páginas, códigos, tamaños), no ejecución de JavaScript en un navegador de verdad — no puede confirmar que la barra de progreso se vea bien ni que el `fetch` de `assets-version.json` se resuelva a tiempo. Firmar esto como "funciona" sin ese clic sería la aserción en tono seguro que D-032 prohíbe.
- **No se fusionaron las páginas en una sola sesión de Phaser** (la alternativa más invasiva que se ofreció y el dueño no eligió) — quien-juega, el mapa y el reto siguen siendo navegaciones reales de página. El precargador global reduce el hueco de la SEGUNDA pantalla en adelante a lo que tarde el caché en responder, pero no lo elimina estructuralmente.
- **No se investigó ni se tocó** el reporte de música silenciada de la misma sesión (D-201, si aplica) — son cambios independientes en archivos distintos.

**Investigación relacionada:** D-192 (por qué "¿quién juega?" y el mapa son `Phaser.Game` separados), D-199.5 (el letrero tallado que agregó las primeras 6 imágenes nuevas de esta ronda), la nota de `public/sw.js` sobre `VERSION` manual.

### D-200.1 — `PreloadScene` seguía dibujando su barra siempre; el dueño pide evaluar una SPA de verdad · 2026-08-09

El dueño probó D-200 en vivo (dos capturas: "¿quién juega?" con el ícono de nota tachado otra vez, y `MenuScene` con un loading visible justo después de tocar el perfil de la cebra) y reportó: "la música no cargó otra vez. Y cuando le di en la zebra me salió un loading antes de la siguiente pantalla."

**Causa encontrada al releer el propio código, no supuesta:** `PreloadScene.preload()` dibujaba su caja+barra de forma INCONDICIONAL, en la primera línea, antes de preguntar si hacía falta. El candado de versión de D-200 solo se había aplicado a la escena NUEVA (`CargaGlobalScene`) — `PreloadScene` (la que corre al entrar al mapa) nunca se tocó, así que seguía mostrando su UI de carga SIEMPRE, sin importar si `CargaGlobalScene` ya había precargado todo minutos antes. El síntoma que el dueño vio ("el loading sigue apareciendo") era 100% consistente con este hueco, sin necesidad de que el cacheo del service worker fallara.

**Arreglo:** se extrajo `carga-assets.ts` (candado de versión + `cargarLoteConProgreso`) como código compartido entre `CargaGlobalScene` y `PreloadScene` — antes vivía duplicado dentro de la escena nueva. `PreloadScene.create()` ahora pregunta `activosYaPrecargados()` PRIMERO: si coincide, carga los archivos igual (hace falta que ESTE `Phaser.Game`, página distinta, los tenga en su propio caché de textura) pero SIN dibujar caja ni barra — la petición de red la sirve el service worker casi al instante. Si no coincide, dibuja la UI exactamente como antes.

**Sobre la música:** sigue sin encontrarse una causa nueva — es el mismo hallazgo de la ronda anterior (el único código que escribe "apagado" es tocar el ícono). No se tocó nada de `preferencia-musica.ts`/`BotonMusica.ts` en esta ronda.

**La pregunta más grande — "esto debe sentirse como una SPA":** ante la posibilidad de que el arreglo de arriba no fuera suficiente, se le preguntó al dueño cuánto quería invertir (arreglo chico / transición con marca / SPA de verdad). **Eligió SPA de verdad: fusionar "¿quién juega?", el mapa y el reto en una sola sesión de Phaser, cero recargas de página.** Es una reversa de facto de la elección "cachear los archivos, no fusionar páginas" que había hecho unas horas antes en D-200 — el dueño vio el resultado en vivo y cambió de opinión con evidencia real, no en abstracto. Queda pendiente de investigación y plan antes de tocar código: toca autenticación por pantalla, historial del navegador, y la estructura de URLs de D-033 — no es una extensión de este parche.

**Verificación:** `astro check` (0 errores), `node audits/run.mjs` (verde salvo las mismas 2 fallas ajenas), `astro build`, despliegue (`eb85a008-48f5-4e1e-80ff-47f19e1fbf5d`), `node audits/live.mjs` (51/51). **No confirmado con un clic real** — como todo D-199.x/D-200.x de hoy.

**Investigación relacionada:** D-200, D-192.

## D-200.2 — La fusión en una sola sesión de Phaser: "¿quién juega?" → PIN → mapa → reto, cero recargas · 2026-08-09

Implementación del plan aprobado en D-200.1 tras tres agentes de
exploración (mapa de autenticación/sesión, árbol real de escenas de
Phaser, y conflictos con decisiones ya documentadas) y dos preguntas de
opción múltiple al dueño:

- **Retos (botón directo) y `/practicar/` del adulto quedan FUERA de esta
  ronda** — "fuera ahora pero sabemos que lo haremos". `RetoController.ts`
  sigue siendo DOM puro a propósito, sin tocar.
- **"Cambiar de jugador" sigue siendo una recarga de página real** — a
  propósito, para que la limpieza de datos del hermano anterior (D-186)
  quede garantizada por construcción, no por disciplina de código sin
  probar.

**El mecanismo — reusar las páginas reales, nunca duplicar su lógica.**
`QuienJuegaMount.astro`/`HistoriaMount.astro` ya serializan los datos de
su pantalla en un `<script type="application/json" id="...">` dentro del
HTML real que el servidor arma (con toda su autenticación, `mc_h`/`mc_k`).
`game/spa/enrutador.ts` (nuevo) pide esa MISMA URL con `fetch`
(`credentials: "same-origin"`), deja que el navegador siga cualquier
redirección, y extrae esa isla — o un fragmento de DOM, para pantallas sin
isla — del HTML devuelto. Si cualquier paso falla (sin red, HTML
inesperado), cae a `window.location.href` real. Cero endpoints JSON
nuevos: el mismo riesgo de duplicar lógica de servidor que
`assets-manifest.ts` ya evitó hoy para los assets.

**Piezas nuevas:**

1. **`game/spa/enrutador.ts`** — `irA()`, `extraerIsla()`,
   `extraerFragmento()`, `empujarHistorial()`/`alVolver()` (pushState/
   popstate).
2. **`game/spa/pin-interaccion.ts`** — la lógica de toque de
   `kids/pin.astro` EXTRAÍDA de esa página a un módulo importable
   (`conectarFormularioPin(forma, opts)`), con un parámetro opcional
   `interceptarEnvioFinal` que, sin usarse, deja el comportamiento
   IDÉNTICO al de siempre (protección de reenvío por 0-RTT vía 425, sin
   `requestSubmit()` por iOS Safari 15, los dos primeros toques en
   cliente). `pin.astro` ahora importa esta función en vez de tener la
   lógica inline — una sola copia, no dos que puedan separarse.
3. **`game/spa/puente-pin.ts`** — muestra el PIN sobre "¿quién juega?" sin
   recargar: extrae `<main class="pin">` de la página real, transplanta
   sus `<style>` (el scoping de Astro solo agrega el hash al ÚLTIMO tramo
   de cada selector, así que copiar el `<style>` tal cual y replicar los
   atributos del `<body>` real sobre el `<body>` de la sesión basta para
   que se vea idéntico), y usa `pin-interaccion.ts` CON intercepción: el
   tercer toque va por `fetch` en vez de navegar. Si acierta y el destino
   trae `#historia-datos`, entra al mapa; si falla, el servidor repinta la
   MISMA pantalla con "esos tres no eran" y se reconecta (recursivo, sin
   límite de intentos, línea roja #8).
4. **`game/spa/puente-historia.ts`** — arranca Modo Historia (`MenuScene`,
   `MapScene`, `ChallengeScene`, `DialogueScene`, `GameplayScene` — las
   MISMAS clases que usa la página independiente) dentro del
   `Phaser.Game` que ya está corriendo, sin `BootScene`/`PreloadScene`
   (`CargaGlobalScene` ya precargó todo, D-200) y con un `ProgressManager`
   nuevo por cada entrada (pericia fresca del servidor, nunca la de la
   visita anterior). `game/main.ts::iniciarHistoria()` NO se tocó — sigue
   siendo lo que arranca `/mapa/` cargada directo (enlace, refresco,
   JavaScript deshabilitado — D-012 exige que esa página funcione sola).
5. **`GameplayScene.ts::volverAlMapa()`** — el comentario original explicaba
   por qué era una navegación real y no un `scene.resume()`: el mapa tiene
   que mostrar la pericia que el servidor ACABA de recalcular, nunca la de
   antes de jugar (`packages/motor/src/mapa.ts` #231, ninguna segunda
   fuente de verdad). Esa razón sigue intacta — lo que cambia es CÓMO se
   piden los datos frescos: `enrutador.irA(this.salirA)` en vez de una
   recarga de página, y `arrancarHistoriaEnSesion()` de nuevo arranca el
   mapa fresco en la misma sesión. Funciona igual reachado desde la SPA o
   desde `/mapa/` cargada directo — no le importa cuál `Phaser.Game` sea.
6. **`game/spa/estado.ts`** — qué pantalla muestra la sesión ahora mismo
   (`"rejilla" | "pin" | "historia"`), para que el botón atrás del sistema
   sepa qué deshacer.

**Lo que el botón atrás NO resuelve del todo, dicho de frente:** deshacer
UN paso desde "historia" salta directo a la rejilla, no a la pantalla de
PIN intermedia — atajo deliberado (mostrar el PIN otra vez solo para
tocarlo de nuevo no ayuda a nadie). Pero un `popstate` que salta MÁS de un
paso de una sola vez (pulsar atrás dos veces muy rápido) puede dejar la
URL de la barra de direcciones sin corresponder exactamente a lo que se
ve — no rompe nada (no hay estado corrupto ni una pantalla en blanco),
pero no está resuelto con precisión. Anotado en el propio código de
`estado.ts`, no escondido.

**Verificación:** `astro check` (0 errores), `node audits/run.mjs` (verde
salvo las mismas 2 fallas ajenas y ya conocidas — `bundle-budget` subió de
386.7 KB a 399.9 KB gz, esperado: el motor completo de Modo Historia ahora
tiene que poder cargarse desde la página de "¿quién juega?" también, no
solo desde `/mapa/`), `astro build`, despliegue
(`2fe62662-ef24-47b5-979d-b6d968e60e00`), `node audits/live.mjs` (51/51).

**Lo que esto NO verificó, dicho de frente:** todo este mecanismo — el
`fetch` del PIN, la extracción de las islas, el transplante de estilos, el
arranque de Modo Historia dentro de la misma sesión, el botón atrás — vive
detrás de sesión autenticada y depende de JavaScript ejecutándose de
verdad en un navegador. `audits/live.mjs` verifica HTTP (códigos, tamaños
de página), no ejecución de cliente: no puede confirmar que la transición
se sienta sin recarga, que el PIN se vea idéntico al transplantado, ni que
el botón atrás haga lo que este documento dice que hace. Esto se construyó
con cuidado (agentes de exploración antes de diseñar, un plan aprobado
explícitamente, extracción en vez de duplicación de la lógica de PIN con
sus protecciones de reenvío) pero **nada de esto se ha probado con un
clic real en un dispositivo real** — es la verificación pendiente más
importante de todo el día de hoy, y no se puede saltar.

**Investigación relacionada:** D-200, D-200.1, D-192, D-012, D-186,
`packages/motor/src/mapa.ts` (#231).

**Nota 2026-08-12 (revisión de decisiones) — piezas 2 y 3 nunca se
construyeron, y quedaron reemplazadas sin decirlo.** `game/spa/
pin-interaccion.ts` y `game/spa/puente-pin.ts` no existen en el árbol
actual ni existieron nunca en el historial de git: el plan de arriba
—transplantar `<main class="pin">` y su `<style>` sobre el canvas— es
exactamente lo que **D-201** (2026-08-11) prohíbe como regla de
arquitectura y lo que `audits/spa-phaser.mjs` bloquea desde entonces. El
PIN terminó reescrito como escenas reales de Phaser (`PinScene.ts`,
D-201/D-202), no como el puente de esta entrada. D-201 cita esta entrada
como antecedente de investigación, no como algo que revierte
explícitamente — queda dicho aquí para que nadie busque estos dos
archivos pensando que se perdieron en un merge.

### D-200.3 — Primera prueba real en dispositivo de D-200.2: la flecha se apilaba, no faltaba caché · 2026-08-09

El dueño probó D-200.2 en vivo — la primera confirmación real de todo el
trabajo de hoy — y reportó tres cosas. Dos resultaron ser lo esperado; una
era un bug real, encontrado y corregido en la misma sesión:

1. **"La flecha me regresa como el navegador en lugar de regresarme a la
   pantalla fuera de SPA, a la de tu casa."** Bug real. `empujarHistorial`
   se llamaba TRES veces por sesión (rejilla→PIN, PIN→mapa, salir del
   reto→mapa fresco) — cada una apilaba una entrada nueva de historial. El
   botón atrás (sea `FlechaAtras.ts` o el gesto del sistema) deshace UNA
   entrada por toque: con tres apiladas, el primer toque no cambiaba nada
   visible (el manejador de `popstate` siempre reseteaba a "rejilla" sin
   importar cuántas quedaran), y hacían falta varios toques más para que
   el navegador por fin cruzara a un documento real distinto ("Tu casa") —
   exactamente "se comporta como el navegador" en vez de salir de un solo
   toque. **Arreglo:** `enrutador.ts` ahora distingue `empujarHistorial`
   (SOLO la primera salida de la rejilla) de `reemplazarHistorial` (las
   transiciones DENTRO de la sesión — PIN→mapa, reto→mapa fresco — que
   actualizan la URL sin apilar una entrada nueva). Con una sola entrada
   apilada por sesión, un toque de "atrás" desde cualquier profundidad
   vuelve a la rejilla, y un segundo toque desde ahí sale de verdad a lo
   que había antes (D-012 no cambia: la rejilla sigue siendo la misma
   página real de siempre).
2. **"Nunca vi un loading al darle clic a ir a pantalla de niños."**
   Esperado, no un bug — confirmado releyendo los logs de build de hoy:
   `assets-version.json` reportó el MISMO hash (`3fae6caaf3c4e424`) en
   CADA build desde D-199.5, porque ninguno de los cambios de D-200/
   D-200.1/D-200.2 tocó un solo archivo dentro de `public/{juego,mapa,
   avatares}` — todos fueron cambios de código (`.ts`/`.astro`), y el hash
   solo mira esas tres carpetas a propósito (ver D-200). El dispositivo del
   dueño ya había precargado ese catálogo exacto en una prueba anterior de
   HOY mismo, así que el candado de versión hizo justo lo que se pidió:
   no volver a mostrar el loader para nada que ya está caliente. Para ver
   el loader de verdad hace falta un deploy que SÍ cambie un archivo
   de esas carpetas, o probar en una ventana/dispositivo sin ese
   `localStorage`.
3. **La música sigue sin sonar.** Sin causa nueva encontrada — mismo
   resultado que las dos rondas anteriores (D-199.6, D-200.1): el único
   código que escribe "apagada" es tocar el propio ícono, y no se tocó
   `preferencia-musica.ts`/`BotonMusica.ts` en ninguna ronda de hoy. Sigue
   sin confirmarse si es una preferencia real guardada en el dispositivo
   (de una prueba de sonido de hace horas) o un bug que ninguna lectura de
   código ha encontrado en tres intentos — la prueba que de verdad lo
   resolvería es abrir el sitio en una ventana privada/incógnito (sin
   `localStorage` previo) y ver si ahí SÍ suena sola.

**Verificación:** `astro check` (0 errores), `node audits/run.mjs` (verde
salvo las mismas 2 fallas ajenas), `astro build`, despliegue
(`ddb73b67-133a-4ed8-be52-87d520da7480`), `node audits/live.mjs` (51/51).
El arreglo de historial es la primera pieza de D-200.2 que el dueño
efectivamente ejerció en vivo — las demás (transplante de estilos del PIN,
arranque de Modo Historia en la misma sesión) quedaron implícitamente
confirmadas al reportar que SÍ llegó hasta el mapa y jugó un reto, pero
ninguna se confirmó explícitamente todavía.

**Investigación relacionada:** D-200, D-200.1, D-200.2.

### D-200.4 — El candado de versión saltaba el `return` sin cargar nada: el bug real detrás de "no suena y no hay splash" · 2026-08-09

El dueño diagnosticó esto ÉL MISMO en vivo, con una intuición correcta
aunque la causa exacta no era la que suponía: "ya descubrí porque no
suena, se queda cargando y hasta que no llega... esto porque no hay un
loading, un splash donde se carguen todos los archivos... ya había uno y
desapareció, me refiero a uno donde se carga la lista de los jugadores."

**La causa real, releyendo `CargaGlobalScene.ts` línea por línea:** la
rama `if (await activosYaPrecargados())` hacía `return` INMEDIATO tras
`this.scene.start("QuienJuegaScene", ...)`, sin llamar
`cargarLoteConProgreso` para nada. El candado de versión (D-200) solo dice
que los BYTES ya están calientes en el caché del NAVEGADOR — pero esta
escena vive en un `Phaser.Game` recién creado en CADA carga de página, con
su propio administrador de texturas/audio TOTALMENTE VACÍO en memoria,
sin importar qué tan caliente esté el caché del navegador por debajo. Al
saltar el `return` sin cargar nada, todo ese trabajo real (bajar,
decodificar, subir a memoria ~30 archivos, incluida la música) quedaba
corriendo DENTRO de `QuienJuegaScene.preload()` — en silencio, con la
pantalla en blanco, exactamente el "splash que desapareció" que el dueño
recordaba y extrañaba. Y si esa decodificación no terminaba a tiempo,
`create()` intentaba reproducir música que técnicamente todavía no estaba
lista — la conexión que el dueño hizo entre "no hay splash" y "no suena"
tenía la intuición correcta (las dos cosas SÍ estaban relacionadas),
aunque la causa de fondo era una sola: la rama rápida nunca cargaba nada.

**Arreglo:** la rama rápida ahora SIGUE cargando todo con
`cargarLoteConProgreso` (rápido, porque de verdad está en caché) — lo
único que se salta es el texto/barra DETALLADOS ("Cargando imágenes…"),
reemplazados por un spinner mínimo (`Graphics` puro, sin depender de
ninguna imagen) que nunca deja la pantalla en blanco. Se aplicó el mismo
arreglo a `PreloadScene.ts`, que tenía la misma clase de hueco (más chico,
solo alcanzable entrando directo a `/mapa/` con el candado ya puesto) —
esa escena SÍ seguía cargando en su rama silenciosa, pero tampoco
mostraba nada mientras tanto.

**Verificación:** `astro check` (0 errores), `node audits/run.mjs` (verde
salvo las mismas 2 fallas ajenas), `astro build`, despliegue
(`93804d96-b9cb-42e0-9908-e25e8aa310b2`), `node audits/live.mjs` (51/51).
**No confirmado todavía si esto resuelve el silencio de la música** — es
la hipótesis más fuerte encontrada hasta ahora (a diferencia de D-199.6/
D-200.1/D-200.3, que no encontraron ninguna causa), pero sigue pendiente
de una prueba real: si después de este despliegue la música arranca sola
al entrar, esto era la causa; si sigue sin sonar, el ícono seguía
mostrando "apagada" por una preferencia guardada real, no por esto.

**Investigación relacionada:** D-200, D-200.1, D-200.2, D-200.3.

### D-200.5 — La causa real de la música muda: Phaser nunca reintenta `play()` sobre un `AudioContext` bloqueado · 2026-08-09

El dueño mandó un video (12s) de la pantalla "¿quién juega?" reportando,
por cuarta vez, "no hay un loading" y música muda. Análisis del video
cuadro por cuadro (`ffmpeg`, extracción de fotogramas + `volumedetect`)
dio dos hallazgos concretos, no supuestos:

1. **El spinner de D-200.4 SÍ se ve** — visible en los fotogramas justo
   después de tocar "Ir a la pantalla de los niños" (confirmado extrayendo
   y leyendo esos fotogramas). Dura menos de un segundo — el candado de
   versión hace su trabajo y todo carga casi al instante — probablemente
   por eso no se percibió como "un loading" a simple vista.
2. **El ícono de música, por primera vez en toda la sesión, aparece SIN
   la X** (confirmado con un recorte del fotograma) — la preferencia
   estaba en verdad ACTIVADA. Y aun así, `ffmpeg -af volumedetect` sobre
   los 12 segundos completos dio `mean_volume: -91.0 dB` / `max_volume:
   -91.0 dB` — silencio digital absoluto, no un volumen bajo. Esto
   descarta de forma concluyente la hipótesis de las tres rondas
   anteriores (D-199.6, D-200.1, D-200.3): NO es una preferencia guardada
   en "apagado". Es un fallo real de reproducción con la preferencia en
   "encendido".

**La causa, encontrada leyendo el CÓDIGO FUENTE de Phaser 4.2.1
instalado** (`node_modules/.pnpm/phaser@4.2.1/.../sound/webaudio/
WebAudioSound.js` y `WebAudioSoundManager.js`, no la documentación —
para tener la versión exacta que corre en este proyecto):
`WebAudioSound.prototype.play()` llama `createAndStartBufferSource()`
INCONDICIONALMENTE — nunca comprueba si `this.manager.locked` sigue en
`true` (el `AudioContext` suspendido por la política de autoplay del
navegador). Y el propio `unlock()` de Phaser, una vez que el contexto de
verdad se reanuda, NO reintenta reproducir nada que ya se haya intentado
mientras estaba bloqueado — solo marca `locked = false` y emite
`Events.UNLOCKED`. Todo el trabajo de este proyecto se prueba como PWA
instalada en pantalla de inicio de iOS (ninguna captura de todo el día
muestra la barra de Safari) — un contexto donde el bloqueo de audio de
iOS es más frágil que en una pestaña normal, y donde Phaser simplemente
no tiene ninguna lógica de reintento.

**Arreglo, en `MusicManager.ts` y `SfxManager.ts`:** antes de llamar
`sonido.play()`, se comprueba `this.manager.locked`. Si sigue bloqueado,
se espera el evento real `Phaser.Sound.Events.UNLOCKED` (confirmado que
existe en esta versión: `src/sound/events/UNLOCKED_EVENT.js`) antes de
reproducir — en vez de lanzar `play()` a ciegas y confiar en que Phaser lo
arregle solo. Se aplicó a los dos manejadores por igual: el mismo riesgo
explica también el misterio nunca resuelto de D-199.3 sobre
`sfx-panel-abre`/`sfx-panel-cierra`.

**Verificación:** `astro check` (0 errores, confirmado que `Phaser.Sound.
Events.UNLOCKED` existe leyendo el código fuente instalado), `node
audits/run.mjs` (verde salvo las mismas 2 fallas ajenas), `astro build`,
despliegue (`ee1d406f-8698-4cb5-9994-65310914f5ea`), `node audits/live.mjs`
(51/51).

**Lo que esto NO confirma, dicho de frente:** que `context.resume()`
efectivamente TERMINE resolviéndose en el contexto específico de una PWA
de iOS instalada — si el bloqueo de audio de iOS en modo standalone es
más profundo que "esperar el próximo toque" (hay reportes históricos de
WebKit de esto), esperar `UNLOCKED` podría no ser suficiente y hacer
falta una segunda pieza (p. ej. reproducir un buffer silencioso desde el
gesto de toque más próximo a la creación del `AudioContext`). Esta es la
hipótesis mejor fundamentada de las cuatro rondas — la primera basada en
leer el código fuente de Phaser en vez de solo el código propio — pero
sigue pendiente de una prueba real.

**Investigación relacionada:** D-199.3, D-199.6, D-200.1, D-200.3, D-200.4.

### D-201 — Mundo Kinder multi-bioma: piloto de Desierto, de punta a punta

Implementación del piloto descrito en `docs/planes/2026-08-09-mundo-
kinder-multi-bioma.md`: Desierto como el primer bioma real de KINDER en
Modo Historia (Phaser), sobre un subconjunto deliberadamente chico —
decisión del dueño, confirmada en esta sesión— de K01/K05/K12 y 2
mecánicas nuevas (tap-to-pop, tap origen→destino), no las 14 habilidades
ni las 13 mecánicas completas del plan.

**Fase 0 — dominio por bioma.** Hallazgo que reencuadró el resto del
trabajo: la tabla D1 `skill_state` no tenía NINGÚN escritor en producción
(el único `INSERT` en todo el repo era un fixture de prueba) — el
dominio real vive por completo en el almacenamiento del Durable Object
`Aprendiz`. La migración de "dominio por bioma" es entonces
principalmente un cambio de código en `aprendiz.ts` (llave
`hab:<skillId>:<bioma>`, con `bioma` opcional para compatibilidad hacia
atrás con las llaves viejas, que se leen como `"sabana"`), más un
`ALTER` de consistencia en D1 (migración `0028_skill_state_bioma.sql`,
sin datos vivos que migrar). `packages/motor/src/mapa.ts` gana un campo
`bioma` que viaja de `EntradaDeHabilidad` a `NodoDelArbol` sin tocar la
lógica de agrupar/secuenciar/bloquear — el encadenado de `bloqueado`
ENTRE biomas queda explícitamente diferido hasta que exista un segundo
bioma real.

**Hallazgo intermedio, no anticipado: KINDER nunca estuvo conectado al
sistema de Phaser.** `kids/mapa.astro` gateaba TODO el camino de
`construirArbol()`+`HistoriaMount` detrás de `esPrimariaOMas` — la rama
KINDER seguía siendo 100% el sendero HTML de Sabana (D-152), sin tocar.
Confirmado con el dueño antes de tocarlo ("¿lo construyo yo, o ya lo
estás construyendo tú del otro lado?" → "sí, constrúyelo tú"). Se
resolvió extendiendo la rama KINDER para construir el mismo `arbol` que
PRIMARIA/SECUNDARIA, con SU PROPIO resumen acotado a `bioma: "desierto"`
(la Sabana de siempre sigue leyendo el resumen SIN acotar, para no
romper la continuidad de quien ya juega hoy) — si el árbol de Desierto
sale vacío (nadie lo ha tocado todavía), la pantalla cae a la Sabana de
siempre, nunca a un estado vacío. Se descubrió una SEGUNDA capa de
hardcoding en la misma pasada: `"primaria-1"` estaba escrito a mano en
cuatro sitios (`PreloadScene.ts`, `MenuScene.ts` ×2, `puente-historia.ts`)
sin que `chapterId` existiera como dato en ningún lado — se modeló como
campo real en `ProgressManager`/`DatosDeArranque`, servido por
`kids/mapa.astro` según banda+bioma, y threadeado a través de
`HistoriaMount.astro`, con lo que el mismo cable que arregla KINDER
también deja `chapterId` disponible en el flujo SPA (`puente-historia.ts`)
sin trabajo aparte.

**Fases 1-3 — el catálogo de `Formato` y el primer contenido con dibujo
en Modo Historia.** `Formato` en `item.ts` gana 13 valores nuevos (de
las 19 mecánicas del plan, menos las 5 existentes y el gesto #16
transversal de solo-pista). `banco-kinder.ts` NO restructura `Plantilla`
—que sigue exactamente igual, y con ella los 14 exports y todo lo que
los consume (`PLANTILLAS`, `generarBanco()`, los auditores)— sino que
agrega el concepto, más delgado, de `MecanicaAdicional`: apunta a una
`Plantilla` base solo para tomar prestado su `parametros()` ya escrito,
y envuelve el MISMO contenido numérico en un `formato`/`generar()`
distinto (plan §6: "envolver los mismos parámetros en el formato nuevo").
Los 4 pares construidos: K01×reventar, K12×reventar, K05×mueve,
K12×mueve.

Al conectar esto a `GameplayScene.ts` (Fase 3) se encontró un tercer
hueco: la escena nunca tuvo el `switch` de formatos que `Pantalla.astro`
ya tenía desde F5 — nunca hizo falta, porque Modo Historia solo servía
PRIMARIA (`toca_la_respuesta`, sin dibujo). El piloto trae el PRIMER
formato de kinder con dibujo (`flash`, la mecánica ya existente de K01)
además de los 2 nuevos — confirmado con el dueño construir los tres
juntos en vez de dejar `flash` sin Phaser. Se agregó `pintarEscena()`
(destello con posiciones deterministas por disposición —dado/línea/
disperso/par—, nunca `Math.random()`; burbujas que revientan con el
arte bespoke de Desierto si está cargado, si no un círculo genérico;
salto origen→destino reusando `ZonaDestino.ts`, ya construida por la
sesión paralela). **Regla de diseño, la misma en las tres:** la escena
es SIEMPRE dramatización, nunca un segundo camino de calificar — la
respuesta se sigue dando tocando una de `item.opciones`, exactamente
como ya hace `toca_para_contar` en `Pantalla.astro`. Por eso
`AccessibleReto.ts` no necesitó ni un cambio: su render genérico de
opciones numéricas sigue siendo un camino real y completo para
calificar estos formatos — el hueco de accesibilidad real, documentado
y no escondido, es que el GESTO (reventar, saltar) no tiene equivalente
en el DOM, decisión explícita del dueño esta sesión ("todo debe ser en
Phaser, pierdo mucho tiempo en el DOM").

**Fase 4 — el `pathData` de Desierto.** Era, literalmente, el mismo
arreglo de puntos que `primaria-1` (un río nunca rediseñado para dunas).
Se trazó de verdad: se leyó `fondo-desierto-1.webp` (800×1600px) con un
script que detecta el color del camino (arena clara, brillo>195,
azul>135) fila por fila con seguimiento por continuidad, y el resultado
se verificó dibujando los puntos ENCIMA de la imagen real antes de
aceptarlos — dos iteraciones fallaron visiblemente (el primer intento
automático se enganchó a bordes de duna equivocados) y se corrigieron a
mano con una rejilla de coordenadas superpuesta. 15 puntos de control,
convertidos de píxel nativo a coordenada de mundo con factores DISTINTOS
en x (×1.25) e y (×1.5) — `MapScene.ts` usa `setDisplaySize()`, que no
conserva el aspecto (800:1600 nativo vs. 1000:2400 de mundo). Los
últimos 2 puntos son una extensión razonada sobre la cresta de la duna
más lejana, donde el camino dibujado se difumina en la ilustración —
igual que `primaria-1` termina cerca de la cima del mundo.

**Fase 5 — 24 ítems curados, no 54.** El piloto de esta ronda cubre 4
pares (no las 9 combinaciones completas de K01/K05/K12 con sus 2
mecánicas nuevas cada una): K01×reventar, K12×reventar, K05×mueve,
K12×mueve, 6 combinaciones cada uno. Elegidas por el eje de variación de
la propia plantilla (`n` para K01, la diferencia `a-b`/`patos-gorros`
para K12/K05), espaciadas uniformemente sobre el rango entero — el
criterio que el plan mismo recomienda para repartir combinaciones
("un orden aleatorio no es variación, es ruido"), no un sorteo. Se
agregan a `generarBanco()` sin tocar las combinaciones existentes de
K01/K05/K12: el contenido no tiene dimensión de bioma (#231) — el mismo
ítem sirve a cualquier banda/mundo que pida esa habilidad.

**Hallazgo tardío, encontrado al responderle al dueño "¿ya puedo
empezar?": la ESCRITURA de bioma nunca se conectó.** Todo lo de arriba
construyó la LECTURA (`kids/mapa.astro` pide el resumen de Desierto
acotado) pero `GameplayScene`/`RetoController` nunca mandaban `bioma` en
sus llamadas a `/api/jugar` — el servidor (`jugar.ts`) ya sabía leer
`cuerpo.bioma` desde la Fase 0, pero nadie se lo mandaba. Sin este cable,
jugar el árbol de Desierto habría escrito el dominio bajo el bioma por
omisión (`aprendiz.ts::BIOMA_DEFECTO`, `"sabana"`) para siempre, y el
árbol de Desierto jamás se habría llenado — el piloto se habría visto
"terminado" en el código y habría fallado en silencio en cuanto un niño
de verdad lo jugara. Cerrado threadeando `bioma` desde
`kids/mapa.astro` (`biomaActivo`, gemelo de `chapterId`) →
`HistoriaMount.astro` (prop nueva, en el mismo `#historia-datos`) →
`ProgressManager`/`DatosDeArranque` → `GameplayScene` → `RetoController`
→ cada `pedir("siguiente"/"responder", ...)`. El camino SPA
(`puente-historia.ts`) lo hereda gratis: lee el mismo JSON del island.

**Verificación (Fase 6).** `astro check` (0 errores) y las pruebas de
regresión de `mapa.ts`/`aprendiz.ts`/`item.ts`/`presentar.ts` en cada
fase, no solo al final. `node audits/run.mjs`: verde salvo las mismas 2
fallas preexistentes y ajenas a esta sesión (`brand-image` sobre
`kids/retos.astro`, `bundle-budget` por el peso de Phaser) — confirmado
que ninguna de las dos tiene diff en `git status` de esta sesión.
`astro build` limpio. `wrangler dev` local: el worker arranca sin
errores, la rejilla de "¿quién juega?" carga un perfil real desde D1 —
pero el flujo autenticado completo (tocar el perfil → PIN → mapa) no se
pudo probar de punta a punta en local: `kids/pin.astro` devuelve 503 a
propósito cuando falta `PIN_PAD_SECRET` (secreto de producción, nunca en
`/tmp/vacio.env`) — limitación conocida del entorno local, no un defecto
de este cambio.

**Desplegado** a pedido explícito del dueño ("¡despliégalo!"), con
`--env-file /tmp/vacio.env` (el candado de siempre contra el
`CLOUDFLARE_API_TOKEN` de Workers AI, D-200). Versión
`fe9eecfa-4d48-4a6c-a042-1348df6d11d9`. `node audits/live.mjs`: **51/51**,
incluido "camino del niño completo: rejilla → PIN → mapa 200" y
Turnstile funcionando en los 7 locales (confirma que `.env` sí se leyó
en el build — el incidente de D-200.2 con un worktree sin `.env` no se
repitió porque este build se hizo desde el checkout compartido, no
desde un worktree aislado).

**Lo que esto NO hace, dicho de frente:**

- **No se probó en un dispositivo real** — la única prueba pendiente de
  verdad (D-012/D-032 lo piden siempre para lo que toca un niño). El
  dueño se ofreció a autenticar desde su propio dispositivo/simulador
  para la siguiente pasada.
- Las 11 mecánicas restantes del plan, sus `generar()` y sus escenas de
  Phaser: fuera de alcance de este piloto.
- El encadenado de `bloqueado` ENTRE biomas: no hay un segundo bioma
  real todavía.
- Sabana sigue siendo HTML — no se migró a Phaser.
- Nieve/Costa: sin cambios (Nieve ya tenía capítulo y arte pero sigue
  inalcanzable; Costa sigue sin arte).
- `padre-panel.ts`/`reportes-datos.ts`: siguen sin datos reales que leer
  de `skill_state` — hueco preexistente de F4, no de esta sesión.
- La voz de Larry con la voz clonada de Kilowatto (ElevenLabs) sigue sin
  conectarse al juego — lo que se oye hoy es la síntesis del sistema.

**Investigación relacionada:** `docs/planes/2026-08-09-mundo-kinder-
multi-bioma.md`, D-190, D-184, D-152, D-017.

---

## D-201 — La interfaz del niño es Phaser, sin excepción: lo que se encuentre en HTML se migra — revoca el respaldo sin JavaScript de D-012 · 2026-08-11

**La regla, en una frase:** toda superficie que ve un niño es una **escena de
Phaser** dentro de la sesión única de la SPA. No hay pantalla de niño en
HTML/CSS, no hay HTML transplantado sobre el canvas, y **cuando se encuentre
una pantalla en HTML se migra** — no se documenta como excepción ni se deja
para después.

El dueño lo pidió con esas palabras: *"nada puede ser ya en HTML, debe ser
Phaser, y si nos encontramos una página en HTML o fuera del SPA se debe migrar
a Phaser en el SPA"*. No es una preferencia estética nueva: es la conclusión de
una cadena de decisiones que ya venía en esa dirección (D-184, D-185, D-193,
D-200.1, D-200.2) y que hasta hoy conservaba una excepción que se acaba de
cerrar.

### Por qué, con la evidencia y no con el principio

D-200.1 declaró a propósito que el PIN **no se reescribía** como Phaser: se
reusaba tal cual, extrayendo el `<main>` de `kids/pin.astro` y transplantándolo
a un `<div>` sobre el canvas (`game/spa/puente-pin.ts`). Lo que siguió fue una
sesión entera de defectos en cadena, todos hijos del mismo atajo:

- un overlay **transparente** que dejaba ver el canvas de "¿quién juega?" a
  través del PIN;
- el CSS de la pantalla que **nunca llegaba** — Astro emite ese `<style>`
  grande como `<link rel=stylesheet>` por `inlineStylesheets: "auto"`, y el
  puente solo clonaba `<style>`;
- franjas blancas laterales de 41 pt que **no se reprodujeron en Chrome a
  ningún ancho** y quedaron sin causa raíz identificada.

Un `<canvas>` de Phaser llena el viewport por definición. La mitad de esos
defectos no existen si la pantalla es una escena, y el otro medio se convierte
en código que se puede leer en un solo archivo.

### Lo que esta decisión REVOCA

D-012 exige que las páginas del niño funcionen cargadas directo — enlace,
refresco, **sin JavaScript**. Hasta hoy eso se leía como "la página HTML se
conserva como respaldo y la SPA es la experiencia real". **El dueño eligió
explícitamente lo contrario:** las páginas se borran, solo existe Phaser.

**El residuo, dicho de frente y no escondido:** un niño con JavaScript
bloqueado, o un dispositivo donde Phaser falle al arrancar, **no puede entrar a
su perfil**. No hay camino de respaldo. Es una elección del dueño ante la
alternativa (mantener dos implementaciones completas del mismo PIN, que
divergen), no un descuido — y queda aquí escrita para que quien la revierta
sepa que fue deliberada.

Lo que **no** se revoca: la ruta sigue existiendo como **redirección 303** al
SPA. Borrar la ruta entera daría 404 a un marcador guardado o a un refresco a
media sesión, y el proyecto ya se quemó con esa clase de fallo — una versión
previa de `kids/pin.astro` devolvía redirecciones perfectas **sobre un estado
404** que ningún navegador sigue, y la tablet se quedaba en "no encontrado".
Una redirección no es una pantalla HTML.

### La única excepción, con candado

**La capa de accesibilidad DOM de D-185** (`AccessibleReto.ts`) sigue siendo
DOM a propósito, y no contradice esto: es un camino **paralelo y completo** para
calificar, nunca la implementación principal metida encima del canvas. Esa
distinción —paralelo vs. encima— es la regla entera, así que el auditor nombra
el archivo en vez de aflojar el patrón.

El sitio público (marketing, corpus de investigación, SEO en siete locales)
**no** entra en esta decisión: es HTML estático a propósito y seguirá siéndolo.
D-201 cubre la superficie del niño.

### Qué se construye, y qué se descubrió al construirlo

Primera aplicación: las tres pantallas de PIN — **entrar**, **cambiar** y
**elegir** (esta última no existía en ningún archivo del repo). Con una
consecuencia técnica que no era obvia: al borrar las páginas Astro se va con
ellas el único lugar donde se puede derivar la rejilla de 9 dibujos, porque
`rejillaDe()` exige `PIN_PAD_SECRET` y ese secreto nunca sale del servidor. La
migración obliga a tres endpoints nuevos (`/api/pin-datos`, `/api/pin-entrar`,
`/api/pin-elegir`), que heredan literalmente las protecciones que hoy viven en
la página: `no-store, private` + `vary: cookie`, **425 ante `early-data: 1`**
(0-RTT es replicable por diseño: reenviar los bytes de un acierto abriría
sesión otra vez), y **ningún bloqueo tras fallar** (líneas rojas #4 y #8).

`/api/pin-elegir` lleva un candado que la pantalla vieja no podía tener:
**escribe solo si `pin_hash IS NULL`**. Fijar sí, sobrescribir nunca — así un
hermano no puede recambiar el PIN de otro.

**Y cierra un hueco de seguridad que estaba abierto.** `kids/pin.astro:361`
abre sesión de niño a cualquier perfil sin `pin_hash`, y como no existía ninguna
pantalla donde elegir un PIN, **todo perfil nuevo caía en esa rama**: un hermano
abría el perfil de otro tocando su cara. El propio archivo lo documentaba como
residuo y decía que la rama "deja de ejecutarse sola" en cuanto existiera la
pantalla de elección. Es esa pantalla.

**El niño elige y repite.** Tres dibujos, y luego los mismos tres otra vez para
confirmar. Si el segundo trío no coincide, vuelve a elegir **sin regañar**
(línea roja #7). La repetición existe porque tres toques accidentales fijarían
un PIN que no recuerda, y quedaría fuera de su propio perfil.

**Los 24 dibujos pasan a ser arte real.** Hoy son EMOJI del sistema
(`pin.astro:503`), que en Phaser serían un `Text` — exactamente lo que la regla
visual proscribe. Se generan con Recraft. Cambiar el arte **no invalida ningún
PIN**: se hashea la posición (`"0,4,7"`), nunca el dibujo.

**No entran al precargador global.** Grupo propio en `assets-manifest.ts`; la
escena carga **solo los 9 que le tocan a ese niño**. El precedente exacto ya
está comentado en ese archivo: `AUDIOS_QUIEN_JUEGA` excluye el audio del reto
porque `musica-energia` pesa ~700 KB, y el dispositivo de referencia es Android
de gama baja sobre 4G lento (`mc-47`).

### Qué lo hace cumplir

**`audits/spa-phaser.mjs`**, cableado en `audits/run.mjs`. Vigila las **dos**
formas de romper la regla, porque vigilar una sola deja la otra abierta: (1) una
página `.astro` bajo `app/kids/**` que pinte interfaz propia en vez de montar su
isla, y (2) cualquier archivo de `game/` que transplante DOM ajeno al canvas
(`extraerFragmento`, `cloneNode(true)`, `createElement` de un control de
formulario).

**Nace ROJO, y eso es el diseño.** Tres páginas incumplen la regla el día que
se escribe, y van declaradas con su issue vía `separarDeuda`: lo nuevo bloquea
desde el primer commit, y cuando una se migra su renglón queda rancio y el
propio auditor exige borrarlo.

**El auditor encontró dos páginas que nadie había contado.** El trabajo se
abrió por el PIN, pero `app/kids/` tiene **tres** pantallas en HTML:
`pin.astro`, `jugar.astro` (sendero de racha y franja de liga) y `retos.astro`
(el marcador de posición de D-190). Las dos últimas **quedan sin plan de
migración** — declaradas, visibles, y sin fecha. Decirlo es la mitad del valor
de haber escrito el auditor.

Visto fallar antes de darlo por bueno, con sus dos controles negativos
plantados en `audits/pruebas-auditores.mjs`: una pantalla de niño nueva en HTML
(exit 1) y un puente que transplanta DOM (exit 1), con el control en verde
después de quitar cada uno (exit 0).

**Investigación relacionada:** D-200.2, D-200.1, D-193, D-185, D-184, D-012,
D-197 §2, `mc-20`, `mc-47`, `mc-38`.

---

## D-202 — El PIN de imágenes de KINDER deja de depender del orden — enmienda D-012 · 2026-08-11

**Qué pidió el dueño**, viendo la pantalla de PIN en el simulador con el
producto ya funcionando: *«el pin de los niños del kinder no importa el orden,
es difícil para ellos»*.

**Qué cambia.** Tocar «estrella, rana, casa» abre igual que «casa, estrella,
rana». Las tres posiciones se ordenan antes de derivar el hash
(`packages/motor/src/pin-imagenes.ts::hashearPin`), así que el orden deja de
existir a efectos de verificación. El niño sigue tocando tres dibujos
distintos: repetir el mismo tres veces sigue sin valer.

**Por qué es correcto para esta banda, y no una comodidad.** KINDER son 4-6
años y **no lee** (línea roja #3 y D-019). Reconocer tres dibujos entre nueve
es una tarea de reconocimiento visual, que es justo lo que esta banda hace
bien. Reproducirlos EN ORDEN es una tarea de memoria de trabajo secuencial —
otra habilidad, más tardía, y una que este producto no tiene ninguna razón
para exigir en la puerta. La pantalla de entrada no debe ser el ejercicio más
difícil del día.

**Lo que cuesta, dicho sin adornos.** El espacio pasa de 9·8·7 = 504
variaciones ordenadas a C(9,3) = **84** combinaciones. Es una sexta parte, y
`COMBINACIONES` en el motor ya devuelve 84 para que el número esté en el
código y no en un párrafo.

Que eso sea aceptable descansa entero en contra QUIÉN protege este PIN, que
D-012 ya había fijado: **protege de un hermano**, no de un atacante remoto. No
hay superficie pública que acepte intentos — `POST /api/pin-entrar` exige la
cookie del dispositivo del hogar (`mc_h`), así que quien no esté físicamente
en la casa no puede ni empezar. Para un hermano con un dedo, 84 intentos a
mano ya es más de lo que nadie sostiene.

**Lo que esta decisión convierte en obligatorio:** el límite de intentos deja
de ser un adorno. Con 504 combinaciones se podía vivir sin él; con 84 es lo
que sostiene la decisión. Anotado en `docs/dudas.md` como lo siguiente que
toca cerrar en esta superficie.

**El PIN NUMÉRICO no cambia.** PRIMARIA y SECUNDARIA conservan el orden: ahí
sí se lee, cuatro dígitos sin orden serían 210 combinaciones, y el PIN de una
banda mayor no puede ser más débil que el de KINDER.

**Los PIN ya elegidos no se rompen.** El hash no se puede invertir, así que no
hay migración en masa posible: el servidor no sabe qué tres dibujos eligió
cada niño hasta que el niño los toca. Se migra en ese instante — `pin-entrar`
prueba el hash nuevo, y si falla prueba el viejo (con orden); cuando el viejo
acierta, el niño entra y el hash se reescribe ya sin orden. Cada perfil migra
solo, en su primera entrada, sin que nadie note nada y sin que un solo niño
vea un «no eran esos» por un cambio nuestro (línea roja #7).

**Texto de cara al usuario**, autorado por locale en los siete (`pinHelp`,
`pinConfirmHelp`): «Tres dibujos, en el orden que quieras» y «Los mismos tres,
otra vez». No es la traducción literal de una frase inglesa — en alemán es
«in beliebiger Reihenfolge», que es como se dice de verdad.

**Verificación:** `packages/motor/src/pin-imagenes.prueba.mjs`. El caso que
afirmaba «el ORDEN importa: 0-4-7 no es 7-4-0» se **invirtió** en vez de
borrarse: es el que fija la decisión, y quien lo vuelva a cambiar tiene que
leer este renglón antes.

---

## Deuda cerrada — `fondo-costa-1.webp` se borra, no se conserva huérfano · 2026-08-12

`apps/web/public/juego/fondo-costa-1.webp` llegó en #534 (reconciliación de
la sesión paralela de multi-bioma), junto con los tres props de costa que sí
pasaron revisión (`palmera`, `roca-costa`, `concha`). Pero el fondo mismo
**nunca pasó revisión**: `story.ts:129` ya documentaba que Recraft lo intentó
tres veces y las tres coló gente, casas, veleros o un faro pese a las
exclusiones explícitas. El archivo que quedó en disco era uno de esos
intentos rechazados, filtrado por error a `public/juego` en vez de quedarse
fuera.

El dueño decidió borrarlo en vez de dejarlo como deuda fechada: un archivo
generado, sin usar y sin capítulo que lo reclame es exactamente lo que
`audits/manifiesto-assets.mjs` existe para cazar, y dejarlo ahí solo esperaba
a que alguien lo conectara sin revisar que nunca pasó el filtro.

Los tres props de costa **se quedan** — no fueron parte de esta decisión y
siguen listos para el día que un fondo de costa sí pase revisión.

**Verificación:** `node audits/manifiesto-assets.mjs` en verde tras el borrado
(96 entradas, todas con archivo; todo archivo de `juego/`, en el manifiesto).

---

## Límite de intentos del PIN de KINDER, versión conservadora — cierra la duda de D-202 · 2026-08-12

Consecuencia directa de D-202: con 84 combinaciones (antes 504), el límite de
intentos dejó de ser un adorno. `docs/dudas.md` dejaba tres preguntas
abiertas; esta decisión las cierra las tres.

**El diseño, decidido por el dueño ("una versión conservadora ya"):**

- **5 fallos seguidos** bloquean el perfil (no el dispositivo — cada
  `childProfileId` lleva su propio contador, así que un hermano no bloquea al
  otro).
- **30 segundos de espera**, y se resuelve SOLO — nadie tiene que intervenir
  para que el niño vuelva a jugar.
- **Sin contador visible, sin mensaje de castigo** (línea roja #7): durante el
  bloqueo, `pin-entrar` sigue respondiendo exactamente `no_eran_esos`, la
  misma respuesta amable de un PIN mal tocado. El niño nunca puede distinguir
  "estás bloqueado" de "no eran esos".
- **El adulto puede desbloquear sin esperar**, desde un botón en `/app/`
  ("Desbloquear ahora") que solo aparece cuando de verdad hay algo bloqueado —
  nunca un control que revisar por si acaso.

**Por qué 5 y no menos:** el PIN de imágenes ya no depende del orden (D-202),
así que 5 fallos SEGUIDOS es una señal real de que quien toca no es el niño,
no un accidente de puntería de cuatro años.

**Verificado extremo a extremo en el simulador, con la cuenta real:** 5 fallos
tocando combinaciones equivocadas, el sexto intento (durante el bloqueo) se ve
IDÉNTICO a un fallo normal — mismo reseteo silencioso, sin texto distinto—; el
botón "Desbloquear ahora" aparece en `/app/` solo para el hijo bloqueado, no
para su hermano; al tocarlo, el botón desaparece y el perfil vuelve a poder
intentar.

**Implementación:** `lib/pin-intentos.ts` (el módulo, con el razonamiento
completo de cada número), gate en `api/pin-entrar.ts` antes de comparar el PIN
que llegó, `api/pin-desbloquear.ts` con la misma autorización por
`parent_user_id` que ya usa `/api/pausa`.

**Verificación:** `apps/web/src/lib/pin-intentos.prueba.mjs` (7 casos, se vio
fallar 3 de 7 con el gate roto antes de arreglarlo). El caso preexistente
"el PIN incorrecto NO entra, sin castigo y sin decir por qué"
(`pin-endpoints.prueba.mjs`) se corrigió: antes de D-202 "nada en KV" y "no se
abrió sesión" eran la misma aserción porque KV solo se usaba para sesiones;
ahora `anotarFallo` también escribe ahí, a propósito, y la aserción vieja se
habría puesto en rojo por el motivo correcto sin ser una regresión.

---

## Loader E — música desde el primer fotograma, con mute (D-198, D-201) · 2026-08-12

`musica-calma` (el ánimo de "explorar" que D-198 ya usaba en «¿Quién juega?»)
se pide PRIMERO en la cola de `CargaAssetsScene`, delante de los otros 243
archivos — es lo único que hace posible "desde el primer fotograma" en vez de
"cuando le toque el turno". En cuanto ese archivo entra, `LoaderScene` la
arranca vía `MusicManager.reproducir("calma")`; como `reproducir()` es
idempotente, la música no se reinicia al pasar del loader a «¿Quién juega?»
— sigue exactamente donde iba.

El botón de silencio (`BotonMusica`, ya existente, mismo lenguaje visual de
D-194) se construye SIEMPRE desde `create()`, aunque la pista todavía no haya
llegado: si el niño lo apaga antes de que la música exista, la preferencia ya
quedó guardada y `reproducir()` la respeta cuando la pista sí llegue.

**Verificado en el simulador, con la cuenta real**: el loader corre entero
sin errores y entrega a «¿Quién juega?» correctamente, con el ícono de
música visible desde el primer fotograma en la esquina inferior izquierda.

**Nota de campo, para quien depure este loader después:** el Browser pane de
este entorno (Chromium headless) se queda con `CargaAssetsScene` clavada en
`INIT` — nunca llega a `preload()` — de forma reproducible, mientras el mismo
build corre perfecto en Safari real (simulador) sin ningún error. No se
encontró la causa exacta tras un rato de diagnóstico (se revisó
`SceneManager.launch()`, el estado del loop, excepciones síncronas — ninguna
explica el bloqueo) y no vale la pena seguir: el simulador es la fuente de
verdad de este proyecto para todo lo que toca Phaser (regla ya escrita), y
ahí funciona. Si alguien vuelve a ver `CargaAssetsScene` sin arrancar, mirar
primero si está en el Browser pane antes de sospechar del código.

---

## Loader F — el ícono real de Larry, y el hueco que dejaba el placeholder (D-080, D-201) · 2026-08-12

`apps/web/public/icons/icon-{192,512}.png` eran el placeholder que
`scripts/gen-icons.mjs` documentaba desde F0 como provisional: un cuadrado
naranja con un signo de más, 521 bytes. `scripts/gen-icon-larry.mjs` los
reemplaza con Larry de verdad, en el mismo lenguaje visual plano/cel-shaded
que ya usan los 16 avatares (`gen-avatares-animal.mjs`) — coherente porque
el ícono cae mezclado con esos mismos 16 en la pantalla del loader.

**Cinco intentos de prompt** antes de aceptar uno (documentados en el propio
script): pedir explícitamente "orange"/"head and shoulders" devolvió un
rinoceronte GRIS de cuerpo entero; reforzar con más negativos trajo una
sudadera con una "R" bordada (viola "sin texto") y luego, apilando aún más
negativos, un marco decorado con medallones en las esquinas — el mismo
patrón que la memoria de sobre-ajuste de Recraft ya advertía: negar de más
hace que el modelo se fije en la familia de conceptos negados. La que
funcionó fue volver casi palabra por palabra al prompt de `larry_busto`
(ya aprobado en producción), cambiando solo el fondo.

**Un hueco de verdad, cerrado de paso:** `LoaderScene::texturaDeCuadro()` ya
buscaba una clave `"icono-app"` desde que se escribió el loader, pero NADA
cargaba jamás una textura con ese nombre — `apps/web/public/icons/` no lo
escanea `manifiestoDeAssets()` (solo mira `juego/mapa/avatares/cosmeticos`),
así que `this.textures.exists("icono-app")` era siempre falso y el ícono
nunca caía entre los cuadros. `cargarIconoApp()` lo pide con el mismo
patrón que ya usa el fondo (`Image()` del DOM, fuera de la cola del
catálogo) — correcto: es un asset de INSTALACIÓN de la PWA, no del juego.

**Paleta indexada, no RGB directo:** el PNG de 512px pesaba 474 KB en RGB
y 174 KB con paleta de 256 colores (`palettegen`/`paletteuse` de ffmpeg,
sin diferencia visible) — no hay `pngquant` en este entorno, y la
ilustración ya usa pocos colores por diseño.

---

## MapScene/MenuScene dejan de estirar en dos ejes distintos (D-186, revisión) · 2026-08-12

Al revisar todas las pantallas de Phaser para el plan de resoluciones (tarea
posterior al loader), se leyó el propio comentario que justificaba el
estiramiento de D-186: "la proporción del archivo no tiene que calzar exacto"
porque de todos modos se estira al tamaño del mundo. Cierto en cuanto a que
hace falta estirar — falso en que estirar en DOS EJES DISTINTOS (ancho y alto
por separado) sea la única forma. `setDisplaySize(worldWidth, worldHeight)`
tomaba el archivo (800×1600 hoy) y lo forzaba a 1000×2400: ~17% más alto sin
tocar el ancho, deformando cada colina.

El arreglo no generó arte nuevo — es el mismo cálculo de "cubrir" que
`LoaderScene`/`PinScene` ya usan para sus fondos de pantalla completa:
`Math.max(destino/origen)` en un solo factor, aplicado a los dos ejes por
igual. La imagen sale más grande que el destino en el eje que sobra, se
centra, y lo que sobra simplemente no se ve — en `MapScene` porque los nodos
y el camino viven dentro de `[0, worldWidth]` y quedan cubiertos igual; en
`MenuScene` porque la pantalla no scrollea.

**Verificado con números, no a ojo** (inyectando la escena directamente vía
consola, sin arriesgar el PIN real de un perfil de producción): con el
archivo real (800×1600) y mundo 1000×2400, la escala sale 1.5 exacta —
alto 2400=2400 sin diferencia, ancho 1200 centrado con -100 de cada lado.
En `MenuScene`, con un viewport de escritorio (1024×768), la escala sale
1.28 y cubre por el eje ancho en vez del alto — la fórmula elige el eje
correcto en cualquier proporción de pantalla, tal como se esperaba.

Ningún fondo se regeneró: el plan de resoluciones (`/Users/estebanrey/.
claude/plans/nifty-cuddling-hamster.md`) seguía abierto en la pregunta de
si migrar la política de encuadre — esto la resuelve sin gastar en Recraft.

---

## El gancho pre-commit nunca se activó — en ningún checkout, nunca (D-032) · 2026-08-12

**El hallazgo central de auditar a los auditores no fue ningún auditor
individual: fue que la flota entera llevaba corriendo en el vacío.**

`.githooks/pre-commit` dice, en su propio encabezado, "se activa una vez por
clon: `git config core.hooksPath .githooks`" — una instrucción manual, en un
comentario, que nadie ejecutó nunca. `git config core.hooksPath` devolvía
vacío tanto en el checkout principal como en este worktree. Sin esa línea,
Git usa `.git/hooks/` por default —vacío— y `.githooks/pre-commit` es un
archivo que nadie invoca: todo commit de este proyecto, de cualquier sesión,
pasó sin que `audits/run.mjs` ni `pruebas-auditores.mjs` corrieran ni una
vez.

**Esto explica hallazgos de hoy que antes no tenían por qué explicarse solo
por descuido individual:** el letterboxing horneado en `pin-imagenes-fondo`
(D-080), el archivo de costa rechazado que se filtró a `public/juego`
(#534), y que "✗ 2 auditor(es) bloquearon" se leyera, sesión tras sesión,
como un estado tolerado en vez de una alarma — porque nunca bloqueaba nada
de verdad.

**Verificado, no supuesto:** un commit de prueba real, con el hook recién
activado, se rechazó (`✗ commit bloqueado por un auditor`) y no quedó
registrado en `git log`. Antes de activar el hook, el mismo commit habría
pasado sin que nada lo detuviera.

**La corrección, en dos capas:**

1. `git config core.hooksPath .githooks` corrido YA en los dos checkouts.
2. `package.json` gana un script `"prepare"` que hace lo mismo — npm/pnpm lo
   corren solos tras cada `install`, así que un clon nuevo (o un worktree
   nuevo, que es exactamente cómo se creó éste) lo activa sin que nadie
   tenga que acordarse de leer un comentario dentro de un script de shell.

**Consecuencia inmediata:** con el hook vivo de verdad, los "2 auditores de
siempre" (`brand-image`, `bundle-budget`) bloqueaban el commit de esta misma
corrección. Se arreglaron los tres hallazgos reales detrás de ellos —no se
maquilló el número—: dos colores fuera de paleta (`PinScene.ts`,
`retos.astro`, mismo patrón de siempre) y la exención de peso de Modo
Historia (`PREFIJO_HISTORIA`) apuntando a un nombre de chunk
(`HistoriaMount.astro_astro_type_script...`) que dejó de existir desde que
D-201 fusionó la interfaz del niño en un solo Phaser — hoy el chunk se llama
`juego.<hash>.js` y, sin la exención al día, TODO su peso (406 KB gz) se
sumaba contra un presupuesto de 60 KB pensado para páginas de marketing. El
comentario se corrigió también en lo que ya no era cierto: la excepción
decía "solo lo paga PRIMARIA+ en el mapa" y desde la fusión lo paga
cualquier niño que entra a `/app/kids/`. Se añadieron además dos excepciones
de imagen que faltaban (`icon-192/512.png`, el ícono de instalación;
`loader-fondo-4k.webp`, que solo baja a pantallas grandes).

**Tres auditores más, encontrados en la misma pasada:**

- `audits/fondos-sin-bandas.mjs` (nuevo de hoy) nunca se había agregado a
  `ACTIVE` en `run.mjs` — un descuido propio de la misma sesión que lo
  escribió. Conectado.
- `audits/pwa-installable.mjs` existía completo (los criterios reales de
  instalabilidad de Chrome) y **nadie lo invocaba, nunca** — no vive en
  `run.mjs` (necesita red) ni estaba encadenado desde `live.mjs`. Reemplazó
  el chequeo superficial que `live.mjs` sí tenía (`manifest.icons.length >=
  2`) por una llamada real a este auditor.
- `audits/corpus-integridad.mjs` — determinista, rápido (0.35s), y
  **actualmente en rojo de verdad**: varios documentos del corpus traducido
  tienen cifras que cambiaron al traducir, y 4 documentos (mc-49..52) nunca
  se tradujeron. No se conectó al gate — es deuda de contenido preexistente,
  no un bug de código, y conectarlo hoy pararía todo commit futuro por algo
  que no tiene que ver con el cambio de nadie. Queda como tarea de fondo
  (`task_6c65f72e`), a conectar cuando el corpus esté limpio.

**Lo que esto NO resuelve:** los auditores que dependen de red
(`live.mjs`, `perf-vitals.mjs`, y ahora `pwa-installable.mjs` desde
`live.mjs`) siguen siendo manuales por diseño — D-032 los excluye a
propósito del gate de cada commit. Lo que se cerró es que dejaran de
invocarse NUNCA, no que empezaran a bloquear cada commit.

**Un cuarto hallazgo, y es el que de verdad prueba que el mecanismo
funciona:** al intentar este mismo commit con el gancho ya activo,
`pruebas-auditores.mjs` se bloqueó a SÍ MISMO — "1 de 204 auditor(es) no
atraparon su propia violación". El caso `mapa-sin-numero-de-nivel` ("el
sendero de KINDER gana un campo numérico de progreso") parcheaba una línea
de `packages/motor/src/mapa.ts` que ya no existía —el código real ganó
`secuencia`/`bloqueado` (D-190) después de escrito este caso— así que
`.replace()` era un no-op silencioso: la violación nunca se inyectaba, el
auditor "pasaba" porque no había nada que atrapar, y el resultado se habría
leído como un ✓ verdadero para siempre. El propio auto-chequeo de
`pruebas-auditores.mjs` ("el parche... no cambió NADA") es lo que lo
detectó, sin intervención humana — exactamente el caso para el que existe.
Corregido para apuntar a la línea real.

---

## "¿Quién juega?" también estiraba su fondo en dos ejes distintos — el mismo defecto de D-186, sin corregir · 2026-08-12

Al revisar todas las pantallas de Phaser (tarea de esta sesión) se
encontró un cuarto caso del defecto que D-186 ya corrigió en
`MapScene`/`MenuScene`: `QuienJuegaScene.ts` seguía usando
`.setDisplaySize(width, height)` sobre `fondo-primaria-1` (800×1600),
estirando la imagen a la proporción exacta del viewport en vez de
cubrirlo y recortar. En un teléfono angosto casi no se nota; en una
tableta o un escritorio la sabana se ve notoriamente aplastada u
horizontalmente estirada.

**Arreglo — el mismo patrón cover-fit de D-186 (revisited) y `PinScene`:**
`Math.max(width/fondo.width, height/fondo.height)` como escala uniforme,
sin `setDisplaySize`. Verificado en vivo: build limpio
(`rm -rf dist && astro build`), servido con `wrangler dev` propio en el
puerto 8799 (el 8787 de este Mac ya lo ocupaba otra sesión — ver
`servidor-de-otra-sesion-en-8788` en memoria), y confirmado en el iOS
Simulator sobre `http://localhost:8799/es-MX/loader-dev/`: el fondo llena
el viewport completo sin bandas ni distorsión.

**Lo que esto NO fue:** no se regeneró arte nuevo. Como en D-186
(revisited), el defecto era de matemática de escala (dos ejes distintos)
y no de resolución de la imagen — más píxeles no habrían arreglado nada
sin este cambio.

**Investigación relacionada:** D-186, D-080, mc-47 §5.

---

## `kids/retos.astro` migra a `RetosScene.ts` — cierra una de las dos deudas de `spa-phaser.mjs` · 2026-08-12

Al revisar la deuda declarada en `audits/spa-phaser.mjs` (dos páginas de
`app/kids/` sin plan de migración) se investigó el tamaño real de las dos
antes de tocar código.

**`kids/retos.astro` era exactamente lo pequeño que parecía:** el
placeholder de "Retos todavía no existe", reachable únicamente desde el
botón "Retos" de `MenuScene` (D-190) — que hoy solo lo alcanza la banda
PRIMARIA, porque `/api/historia-datos` excluye a KINDER a propósito (ver
la entrada siguiente). Migrado a `game/scenes/RetosScene.ts`: mismo fondo
del capítulo activo (cover-fit, mismo patrón que `MenuScene`), mismo
`letrero-madera`, mismo `larry_menu_aplaude`, y una `FlechaAtras` de
regreso — nunca un `<h1>` sobre blanco. `MenuScene.irARetos()` pasa de
`window.location.href` a `scene.start("RetosScene")`.

**Limpieza de cadena muerta:** `rutaRetos`/`rutaRetosKids` viajaba desde
`kids/mapa.astro` hasta `ProgressManager` sin que nadie lo leyera ya —
`MenuScene` era su único lector y dejó de serlo. Se borró el campo
completo (`ProgressManager.ts`, `HistoriaMount.astro`, `kids/mapa.astro`,
`rutas-app.ts`) en vez de dejarlo como plomería fósil.

**Un bug real, encontrado probando en el simulador, no leyendo el
código:** `RetosScene` es la primera escena de Modo Historia que usa
`FlechaAtras` (`flecha-madera`), y esa imagen solo vivía en
`IMAGENES_QUIEN_JUEGA` — `PreloadScene` (la entrada FRÍA a `/mapa/`, sin
pasar por la rejilla) usa su propia lista, `IMAGENES_MODO_HISTORIA`, que
no la traía. En la SPA fusionada de siempre no se nota (`CargaAssetsScene`
ya cargó el catálogo completo antes), pero una entrada fría a `/mapa/`
—actualizar la página a medio mapa, o abrir el enlace desde una
notificación— habría mostrado la textura `__MISSING` en vez de la flecha.
Corregido agregando `flecha-madera` también a `IMAGENES_MODO_HISTORIA`.

**Verificado en vivo:** `astro check` (0 errores), `node audits/run.mjs`
(142/142), build limpio, y un banco de pruebas temporal
(`historia-demo.astro`, montaba `HistoriaMount` con datos de mentira,
mismo criterio que `loader-dev.astro`) confirmó en el iOS Simulator el
ciclo completo: `MenuScene` → toca "Retos" → `RetosScene` con el fondo,
el letrero y la flecha reales → toca la flecha → vuelve a `MenuScene`.
El banco de pruebas se borró al terminar — no es una superficie
permanente, era solo para esta verificación.

**Lo que esto NO resolvió — la otra mitad de la deuda es mucho más
grande de lo que parecía.** `kids/jugar.astro` NO es solo "el sendero de
racha y la franja de liga en HTML": `/api/historia-datos` rechaza a
KINDER con 409 a propósito (`esPrimariaOMas`, D-184 — "Modo Historia en
Phaser es de PRIMARIA en adelante. KINDER sigue con la Sabana de
siempre, que es otra pantalla y otro camino"), así que el mapa Y la
práctica ENTERA de KINDER viven fuera de Phaser todavía, no solo dos
franjas decorativas. Traerlas a Phaser significa además decidir qué pasa
con `kids/mapa.astro`'s rama KINDER (su propio "Sabana de siempre",
tampoco Phaser). Y al investigar se encontró una superficie hermana que
ningún auditor vigila: `liga/jugador.astro`/`Duelo.astro` — la liga vista
por un niño — vive deliberadamente FUERA de `app/kids/` (para no ser
"superficie de kinder" por ruta ante otros auditores), lo que también la
deja fuera del patrón de rutas que `spa-phaser.mjs` escanea. Es
superficie de niño real, en HTML, sin ningún renglón de deuda que lo
diga. Ninguna de las dos se tocó en esta ronda — `spa-phaser.mjs` ya
queda actualizado con la descripción honesta y con esta nota, pero traer
a KINDER entero a Phaser (y decidir si la liga del niño lo acompaña) es
una decisión de alcance para el dueño, no una que se deba tomar sola a
mitad de un cierre de deuda de dos renglones.

**Investigación relacionada:** D-201, D-190, D-184, D-200.2.

---

## El arte del modo Esquí/Deslizada se mergea y se precarga para todos, sin escena todavía · 2026-08-12

`content/esqui-deslizada-assets` (rama de contenido, 4 commits, generada
2026-08-10/12) traía 88 archivos bajo `apps/web/public/esqui/` — 64
avatares (16 animales × 4 poses), 4 superficies de bioma, 8 placas de
puerta, 8 pistas de música y 4 SFX — más 553 líneas de voz de Larry
(7 locales × 79 claves) y el catálogo i18n del modo, sin ni un archivo de
código de juego tocado. El plan completo vive en
`docs/planes/2026-08-10-esqui-cadena-operaciones.md`.

**Antes de mergear, se verificó que nada quedara huérfano — y no lo
estaba en el sentido que se temía, pero tampoco estaba conectado del
todo.** Ninguno de los 88 archivos vivía en ningún manifiesto:
`assets-manifest.ts` no los mencionaba, y `astro.config.mjs` no vigilaba
`public/esqui/` en ninguno de sus dos generadores de build
(`assets-version.json` ni `manifest-assets.json`).

**Pregunta real, con dos respuestas válidas:** ¿se precargan YA (todo
niño los descarga al abrir la app, aunque el modo no tenga ninguna
pantalla construida) o se declaran pero se difieren hasta que exista una
escena que los pida? **El dueño eligió precarga inmediata**, a sabiendas
del costo: el catálogo que `CargaAssetsScene` descarga pasó de 244
assets/13.16 MB a 332 assets/20.02 MB — un salto de ~53% en la descarga
obligatoria de la primera sesión, para un modo que hoy no se puede jugar.

**El hallazgo que de verdad importó — hay DOS manifiestos, y solo uno es
el que de verdad usa el niño.** `assets-manifest.ts` (`TODAS_LAS_IMAGENES`/
`TODOS_LOS_AUDIOS`) es lo que consume `CargaGlobalScene.ts` — escena
**no registrada en `juego.ts`**, código muerto de una ronda anterior de
la fusión. El loader real, `CargaAssetsScene.ts`, lee `/manifest-assets.
json` — generado en build time por `manifiestoDeAssets()` en
`astro.config.mjs`, escaneando una lista fija de carpetas
(`juego/mapa/avatares/cosmeticos`) sin mirar `assets-manifest.ts` para
nada. Haber añadido las 88 claves solo a `assets-manifest.ts` habría
dejado el gate de `manifiesto-assets.mjs` en verde y el arte real
**sin descargarse jamás** — exactamente el modo de falla silencioso que
ese mismo auditor existe para atrapar, solo que en el manifiesto
equivocado.

**Arreglo, en las tres piezas que hacían falta:**

1. `IMAGENES_ESQUI`/`AUDIOS_ESQUI` en `assets-manifest.ts`, sumadas a
   `TODAS_LAS_IMAGENES`/`TODOS_LOS_AUDIOS` — mantiene el auditor
   determinista honesto aunque el consumidor real esté en otro lado.
2. `"esqui"` agregado a los DOS arreglos `CARPETAS` de `astro.config.mjs`
   (`activosVersionD200()` y `manifiestoDeAssets()`) — esto es lo que de
   verdad hace que `CargaAssetsScene` descargue y cachee el catálogo.
   Verificado releyendo el build: `343 archivos en juego/mapa/avatares/
   esqui` (antes 255) y `332 assets, 20.02 MB` (antes 244, 13.16 MB).
3. `audits/manifiesto-assets.mjs::VIGILADAS` extendido a `public/esqui/`
   — para que un archivo esqui futuro sin clave no se cuele sin que nada
   lo note, mismo criterio que ya protege `public/juego/`.

**Lo que NO se tocó, a propósito:** los 553 archivos de voz
(`public/voz/<locale>/esqui.*.mp3`) y el catálogo `i18n/esqui/` siguen
sin ningún consumidor de código — mismo patrón ya establecido en este
proyecto para TODA la voz de Larry pregenerada (`gen-voz-larry.mjs`, "D-
192, reservada y hasta hoy sin escribir"), no una omisión de esta ronda.
Meterlos al precargador global habría sido cargar 553 archivos de audio
que absolutamente nadie reproduce todavía, un desperdicio de verdad —
distinto del caso de las imágenes/música, que si bien tampoco tienen
escena, SON el tipo de asset que el manifiesto de Phaser existe para
cargar.

**Verificado:** `astro check` (0 errores), `node audits/run.mjs`
(142/142), build limpio con los conteos de arriba confirmados en el log.
No se probó en simulador: no hay ninguna escena de Esquí que montar
todavía — es contenido puro, sin interfaz que verificar.

**La rama vivía en el checkout raíz compartido, no en un worktree, con
230 archivos sin commitear encima (posiblemente otra sesión trabajando
en vivo en el código del modo).** Solo se usaron los 4 commits ya
hechos de `content/esqui-deslizada-assets`; el trabajo sin commitear de
ese checkout no se tocó ni se incluyó.

**Investigación relacionada:** D-201, D-198, D-200, mc-47 §5,
`docs/planes/2026-08-10-esqui-cadena-operaciones.md`.
