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
| T-6 | Nivel PhD: qué se puede calificar automáticamente de verdad y qué no | **Abierta.** No bloquea el MVP, que llega hasta N10 (D-034), pero define si el modo Pro es viable | `mc-12-advanced-proof-olympiad-phd.md` |
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

### Lo que NO cambia

- **Los niños siguen sin escribir texto libre** (línea roja #3). Esto es de
  bandas avanzadas: SECUNDARIA hacia arriba, donde quien juega ya escribe.
- **Larry sigue sin calcular.** Recibe más juicios, no la facultad de emitirlos.
