# F11 · Cierre — diseño operativo

> **Primera versión, 2026-08-03.** F11 no tenía ni un issue ni un plan.
> Este documento es el primero.
>
> **Estado del repo al medir:** rama `main`, HEAD `a7850dc`
> (`feat(f7): offline sync… (#408)`), árbol limpio.
>
> **Cómo se produjo:** re-lectura completa desde cero: `decisions.md`
> entero, todos los planes, `dudas.md`, `cartas.mjs`, `run.mjs`, y de la
> investigación `mc-33`, `mc-38`, `mc-47`, `mc-12`, `mc-40`, `mc-44`,
> `mc-25`, `mc-15`, `mc-34` completos. Investigación web dirigida
> (2025-2026, citada por sección). **12 preguntas al dueño en 3 olas de
> 4** compartidas con F10 — cuatro contra la recomendación presentada
> (D-122 forma mixta, D-124, D-126, D-127) — volcadas en D-122 a D-127.
> Incluye el requisito nuevo del dueño: **al menos 6 retos por nivel en
> N4-N12, con kinder tratado aparte** (D-122).
>
> **Regla del documento:** todo número dice de dónde sale. `[leído:
> archivo:línea]`, `[medido: comando]`, `[verificado en vivo: URL]` o
> `[criterio propio]`.

El cierre del producto: anti-trampa tier 0-1, accesibilidad auditada,
revisión legal (checklist interno, D-126), offline completo (D-047 +
Web Push, D-127), interfaz adaptativa verificada en las cuatro
plataformas — **y el piso de contenido: 6 retos por nivel en N4-N12**
(D-122). Depende de todas las fases anteriores.

## 0. Qué se leyó antes de diseñar

1. `docs/decisions.md` completo: D-020 (anti-trampa kinder), D-010
   (tiers por banda), D-111 del bloque nuevo (anti-trampa tier 0-1,
   D-125), D-016, D-031/036/041/064/065 (interfaz), D-037/D-076
   (telemetría y Zaraz), D-047 (offline), D-030 (presupuesto de
   rendimiento), D-074/075 (procedimiento, cámara adulto), D-025 (la
   condición de revisión de θ a ≥200 respuestas/ítem), y las nuevas
   D-107 a D-127.
2. `docs/master-plan.md` completo: §8 (escalera anti-trampa), §11 (PWA),
   §13.2 (fila F11), §13.3, §14 (lo que el plan NO hace — el ancla de la
   revisión legal), §15 (métricas de éxito).
3. Investigación completa: `mc-33` (PWA real), `mc-38` (WCAG 2.2, EAA),
   `mc-47` (rendimiento), `mc-12` (qué es calificable en niveles altos),
   `mc-40` (operación del banco, 1.053 días-persona), `mc-44` (CAT,
   calibración), `mc-25` (privacidad infantil, la base del checklist),
   `mc-15` (escaleras de grado), `mc-34` (notación por locale).
4. `audits/run.mjs` y `audits/adversarial/cartas.mjs` completos: qué
   cubre ya la flota (87 deterministas activos + 28 adversariales).
5. `docs/planes/2026-08-02-rezagados.md` completo: GA4/Zaraz sin issue,
   el hueco «nadie ha visto el sitio con los ojos» (dudas §8).
6. Investigación web (2025-2026):
   - Accesibilidad: las herramientas automáticas cubren **~30-40%** de
     los hallazgos WCAG; Deque mide **57.38%** en datos reales de
     13.000+ páginas — la auditoría manual no es opcional
     `[verificado en vivo: deque.com/automated-accessibility-coverage-report/]`.
     Los overlays NO cumplen y han sido citados en demandas ADA
     `[verificado en vivo: allaccessible.org WCAG 2.2 guide 2025]`.
     La EAA está en vigor desde 2025-06-28 con multas reportadas hasta
     €100.000 `[verificado en vivo: senorit.de/en/blog/web-accessibility-2025-wcag-guide]`.
   - Offline: el patrón outbox (IndexedDB + flush en foreground,
     Background Sync solo como acelerador Chromium) sigue siendo el
     estándar 2025-2026 `[verificado en vivo: blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/]`.
   - Legal: el marco premio/azar/consideración sigue vigente; Montana
     SB 555 (2025) muestra endurecimiento estatal
     `[verificado en vivo: ussweeps.com, riverslot.net]`.

## 1. Qué queda funcionando — los seis frentes

| # | Frente | Entregable | Decisión |
|---|---|---|---|
| 1 | **Contenido: el piso de 6 retos por nivel** | 54 retos en N4-N12 (2 fijos + 4 plantillas por nivel), autoría única renderizada en 7 notaciones, etiqueta de dificultad experta en cada reto | D-122, D-123, D-124 |
| 2 | **Anti-trampa tier 0-1** | Piso de tiempo de respuesta solo-logging, monitoreo silencioso de varianza con señal suave, rate limiting ya existente verificado | D-125 |
| 3 | **Accesibilidad auditada** | Auditoría manual WCAG 2.2 AA sobre todas las pantallas (la automática ya corre en el gate), con informe escrito y correcciones | D-033, D-041 |
| 4 | **Revisión legal** | El checklist legal interno, escrito y fechado, con cada punto marcado cumple / no aplica / exposición aceptada | D-126 |
| 5 | **Offline completo** | D-047 entero (modo avión con descarga explícita, cola con revalidación) + infraestructura Web Push | D-127, D-105 |
| 6 | **Interfaz adaptativa verificada** | La verificación de las 4 plataformas sobre lo ya construido (el impuesto ya se pagó por fase; aquí se comprueba) | D-031, D-064, D-065 |

## 2. Frente 1 — El piso de contenido: 6 retos por nivel (D-122, D-123, D-124)

### 2.1 La tabla de niveles

9 niveles × 6 retos = **54 retos**, autorados ya en el catálogo
[`f11-contenido-retos.md`](f11-contenido-retos.md) (2 fijos con JSON
completo + 4 plantillas con instancia verificada por nivel, en **20
ramas**). Contenido por nivel, con los
formatos que son auto-calificables de verdad (mc-12, mc-36) — la unidad
de diseño es la serie (D-018), y cada plantilla lleva su bloque
`variacion.{varia, constante, por_que}` completo (esquema de ítem §10):

| Nivel | Banda | Materia (mc-15, neutral al país) | Formatos dominantes |
|---|---|---|---|
| N4 | PRIMARIA | Multiplicación y división de varios dígitos | `toca_la_respuesta`, fluidez con plantilla |
| N5 | PRIMARIA | Fracciones: equivalencia, comparación, suma | Fracción visual + numérica (las 13 causas de mc-07) |
| N6 | PRIMARIA/SECUNDARIA | Decimales, porcentaje, razón | Número con notación por locale (mc-34) |
| N7 | SECUNDARIA | Pre-álgebra: patrones, ecuación de un paso | Ejemplo resuelto con paso en blanco (mc-04) |
| N8 | SECUNDARIA/SERIO | Álgebra: sustitución, sistemas pequeños | Equivalencia simbólica (las 9 causas de mc-08) |
| N9 | SERIO | Funciones, geometría analítica | Numérica + gráfica descrita con gramática fija (mc-38) |
| N10 | SERIO | Cálculo diferencial básico, trigonometría | Numérica con tolerancia declarada |
| N11 | JR | Combinatoria y teoría de números estilo AIME | Respuesta cerrada única (mc-12 banda U6) |
| N12 | PRO | Análisis/álgebra abstracta básica + pista Lean | Numérica/CAS + «detecta el error» + ordenamiento de pasos |

Los niveles N8-N10 ya tienen la franja F5b (D-034, ~150 ítems
planeados): los 6 retos por nivel **absorben** esa franja — F5b se
cumple dentro de este piso, no como trabajo aparte (la franja nació
para que F10 tuviera de qué competir; el piso de D-122 la contiene).

### 2.2 Cómo se producen los 54 (pipeline, costo y revisión)

Por nivel, los 6 retos son **2 fijos curados a mano + 4 plantillas
paramétricas** (D-122):

- **Las 4 plantillas por nivel** (36 en total): diseño estilo WeBWorK
  PG con radicales e incidentales declarados (esquema de ítem §1).
  Costo de `mc-40`: 0,5 día por plantilla ≈ **18 días**, más el motor
  de parametrización **si no existe aún** (~15 días, una vez — F5c ya
  tiene 4 modelos paramétricos funcionando en D1 `[leído:
  docs/planes/2026-08-02-f5c-contenido-primaria.md]`, así que el motor
  existe en su forma inicial).
- **Los 2 fijos por nivel** (18 en total): autoría directa con
  revisión, 0,5 día por reto en bandas medias y 1 día en N11-N12 ≈
  **~12 días**.
- **Revisión humana obligatoria de distractores** (arXiv 2404.02124
  vía `mc-40`: los LLM generan distractores válidos pero ciegos a
  errores reales) — nada entra al banco sin ella.
- **Renders de notación**: una autoría, 7 renders (D-123). Revisión
  spot-check por locale (0,05 día × 54 × 7 ≈ **~19 días**), con las
  trampas de `mc-34` nombradas en cada reto que las toque: división
  larga con 4 renderers en N4-N6, `:` en `de-DE` y `pt-PT` vs `÷`,
  escala larga/corta si aparece ≥10⁹.
- **Etiqueta de dificultad experta (1-100)** por reto al autorarse
  (mc-44 implicación 2) y log de respuestas desde el primer despliegue.

**Total estimado: ~50-60 días-persona** `[estimado de mc-40,
etiquetado como tal]` — dos órdenes de magnitud por debajo del banco
completo (1.053 días). El riesgo no es el costo: es la delgadez
adaptativa (§2.4).

### 2.3 N11-N12 y la pista Lean 4 (D-124)

La base auto-calificable cubre el piso sin depender de ningún mecanismo
nuevo. Encima, la **pista Lean 4** (estilo *Natural Number Game*):
serie capstone de ejercicios autorados en Lean 4 contra mathlib, donde
el compilador es el calificador. Es aditiva: **N11/N12 se cumplen sin
ella**; la pista aterriza como bandera de contenido cuando esté. Lo que
hay que construir para ella: render de Lean en la PWA (CodeMirror con
resaltado, servidor que corre `lean` sobre el esqueleto — **fuera del
Worker**: el verificado corre en un servicio aparte por tiempo de CPU,
y esa es la primera pieza de infraestructura fuera de Cloudflare del
proyecto — se decide su proveedor en la issue, no aquí). La prueba en
prosa libre queda como *worked example* de solo lectura, nunca reto
puntuado (52-54% de acuerdo LLM-humano en ciego, IMO-GradingBench).

### 2.4 Lo que este piso NO resuelve, dicho de frente

- **La ubicación adaptativa no cabe en 6 retos por nivel.** mc-44 pide
  10-15 ítems por sesión de ubicación por tema. Con el piso, la
  ubicación consume variantes de las plantillas (que son infinitas),
  no ítems fijos — y un nivel se «termina» rápido para un jugador
  intenso. El piso es eso: un piso de dignidad del cierre, no el banco.
- **Kinder no entra aquí** (D-122): su contenido es F5 (habilidades
  K01-K14, ~400 ítems, ~2.500 retos curados), y sigue aplazado por
  D-073. El cierre no lo desbloquea.
- **La calibración es posterior al lanzamiento** (mc-44: Rasch real a
  ~200-400 respuestas/ítem ≈ 10.800-21.600 respuestas totales para los
  54). La ventaja del banco chico: se calibra antes.

## 3. Frente 2 — Anti-trampa tier 0-1 (D-125)

Lo que se construye (y lo que no):

- **Tier 0 — piso de tiempo de respuesta, solo logging.** Un mínimo
  plausible por tipo de ítem (`mc-29` implicación 2): si una respuesta
  llega por debajo, se registra la señal derivada en Analytics Engine
  (nunca el flujo crudo, `mc-30`) y **nada más**. Nunca bloquea, nunca
  pone cero, nunca se le dice nada al niño. Aparece solo en el panel
  del padre como nota suave (el `PATRON_INUSUAL_PARA_EDAD` de F8 —
  cablearlo es la issue #389 de F4, abierta hoy).
- **Tier 1 — monitoreo silencioso de varianza.** Desviación súbita de
  rendimiento → señal suave (dificultad adaptativa ligeramente más
  cautelosa), nunca bloqueo ni penalización visible. `D-061` manda:
  la nota suave es solo por **velocidad sobrehumana sostenida**, nunca
  por nivel alto — `adaptativo-simulacion.mjs` debe demostrar que la
  nota no se dispara por nivel.
- **Rate limiting en endpoints de envío** — ya existe
  (`math-challenge-ratelimiter-do`, F2); F11 lo verifica sobre las
  rutas de envío de respuestas, no lo reconstruye.
- **Lo que NO se construye:** tiers 2-5 (D-125), nada de cámara,
  micrófono, biometría ni navegador bloqueado (línea roja #1 con la
  única excepción D-075, que no es de esta fase).

## 4. Frente 3 — Accesibilidad auditada (D-033)

La flota ya cubre lo automatizable (`axe-a11y`, `touch-targets`,
`contrast`, `espaciado-tolerante`, `ipad-usabilidad` — todos ACTIVE en
`run.mjs`). Lo que falta es lo que ninguna herramienta ve:

1. **Auditoría manual WCAG 2.2 AA** sobre las pantallas reales del
   producto (no el sitio público, ya auditado en 2026-08-01): el flujo
   de reto por banda, `/app/kids/**`, las pantallas de padre, y las
   nuevas de F8/F9/F10 al aterrizar. Método: teclado completo, lector
   de pantalla (VoiceOver + TalkBack), zoom 200%, `prefers-reduced-motion`,
   simulación de daltonismo — con informe escrito por pantalla. La
   cobertura automática (~30-57%) deja fuera exactamente estas
   comprobaciones `[verificado en vivo: deque.com coverage report]`.
2. **Los puntos calientes conocidos, de la investigación:** 2.2.1
   (modo sin reloj como camino de cumplimiento — los modos cronometrados
   son opt-in por construcción, `mc-38`), 2.5.8 (blancos), 1.4.1 (color
   nunca único canal), 2.4.7 (foco visible), MathML o descripción con
   gramática fija para notación — nunca glifo solo-canvas.
3. **El hueco declarado más grande del proyecto** (dudas §8): «nadie ha
   visto el sitio con los ojos». F11 lo cierra para el producto: cada
   pantalla del flujo principal se mira en un aparato real de cada
   plataforma (el teléfono del dueño ya encontró 7 fallos que ningún
   auditor vio — #341).
4. **VPAT autoeditado** contra EN 301 549 (lo pedirán los distritos,
   mc-38 §12) — queda como documento del sitio.

## 5. Frente 4 — El checklist legal interno (D-126)

Un documento escrito y fechado (`docs/legal-checklist.md`, vivo — se
re-fecha en cada cambio de mercado), con cada punto marcado **cumple /
no aplica / exposición aceptada por el dueño**:

| Sección | Puntos |
|---|---|
| COPPA 2025 (exigible desde 2026-04-22) | VPC parental directo (F2/F9 lo implementan), política de retención escrita, programa de seguridad escrito, VPC separado antes de divulgar a terceros, nada de biometría |
| GDPR Art. 8 + Children's Code (15 estándares) | Defaults de máxima privacidad, sin nudge, sin profiling, DPIA — **desbloquea `fr-FR`/`pt-PT`/`de-DE` de D-087 cuando esta sección está completa** |
| LGPD Art. 14 (Brasil) | Consentimiento específico y destacado del padre, no condicionar el juego a datos innecesarios (§4), esfuerzos razonables de verificación (§5) |
| LFPDPPP post-INAI (México) | Aviso de privacidad, doctrina de capacidad civil; la transición institucional se marca `[unverified]` |
| EAA (vinculante desde 2025-06-28) | WCAG 2.2 AA (frente 3) como conformidad técnica; D-085 mantiene el producto gratis — sin tienda, la exposición de e-commerce se reduce |
| Prendas (condición de D-028/D-119) | Los tres elementos (premio/azar/consideración), por qué faltan dos de tres, el mapa estatal de EE.UU. al día (Montana SB 555), la línea «la plataforma nunca toca valor» |
| Zaraz/GA4 (D-076) | La excepción declarada con su exposición de consentimiento en la UE, escrita en lugar abierto |

**La condición de revisión de D-126, repetida aquí porque es la que
convierte esto en «abogado»:** primera queja formal, primer mercado con
multa concreta, o primer contrato escolar que exija papel.

## 6. Frente 5 — Offline completo (D-127, D-105)

- **D-047 entero:** descarga explícita del nivel actual y el siguiente
  (modo avión — el niño avanza durante el vuelo); cola de intentos en
  IndexedDB con clave de idempotencia y flush en `visibilitychange`/
  `focus` (Background Sync solo como acelerador, `mc-33`); un intento
  offline puntúa solo por precisión y **no cuenta para tablero ni
  ligas** hasta revalidación en servidor («un puntaje no verificable
  nunca compite contra uno verificado»); nada se baja solo; presupuesto
  de precaché vigilado (`precache-budget` pasa de PENDING a ACTIVE
  cuando haya audio).
- **Web Push:** claves VAPID (`wrangler secret put`), service worker de
  push, tabla de suscripciones por dispositivo, permiso tras gesto con
  mensaje de valor — diseñado para el piso de iOS (push solo instalada,
  `mc-33`). **Alineación con D-105:** el cierre de F7 ya construye el
  primer consumidor (recordatorio de misión al padre, #207, con
  `audits/recordatorio-sin-culpa.mjs` como condición de cierre); F11
  completa la infraestructura que #207 no cubra y deja el canal listo
  para los reportes de F8 y los avisos de colas. **Ningún push va a un
  niño, nunca.**
- Migración para suscripciones push: **`0020_push_subscriptions.sql`**
  (reparto: `0013`/`0014` F8, `0015` F9, `0016` F10, `0020` ésta).

## 7. Frente 6 — Interfaz adaptativa: verificación en 4 plataformas

El impuesto ya se pagó por fase (D-031/D-036/D-041/D-064/D-065); aquí
se **comprueba**, no se construye: recorrido del flujo principal en
Android (gama baja real), iPhone, iPad (Split View a un tercio), macOS
y Windows — con la checklist de cada carta `nativo-*` como guía de
revisión, y la flota adversarial completa corrida al final
(`node audits/adversarial.mjs`, el criterio de cierre de fase que ya
usan F7/F8).

## 8. Migraciones, infraestructura y auditores

**Migraciones:** `0020_push_subscriptions.sql` (add-only). Nada más en
esta fase — el contenido vive en D1 por el camino que F5c ya abrió
(D-072), no en una migración de esquema nueva.

**Objetos Cloudflare nuevos:** ninguno estructural. VAPID son secretos
(`math-challenge-secrets` ya inventariado). El servicio de verificado
Lean (§2.3) sería el primero fuera de Cloudflare — decisión de su
issue, con su renglón si entra.

**Auditores nuevos/extendidos:**

- `audits/tiempo-piso-solo-logging.mjs` — el piso de tiempo del tier 0
  nunca bloquea ni cambia un puntaje: ejecuta respuestas por debajo del
  piso y exige puntaje intacto + señal registrada (D-125, D-020).
- `audits/nota-solo-por-velocidad.mjs` — cruza el monitoreo contra
  D-061: la nota suave no puede dispararse por nivel alto (la trampa de
  «aprobar su propia violación» se evita con la tabla de precondiciones
  escrita a mano, D-070).
- `audits/push-nunca-al-nino.mjs` — ninguna ruta de push toma
  `childProfileId` (la condición de D-105 generalizada); hermano de
  `recordatorio-sin-culpa`.
- `audits/piso-seis-retos.mjs` — el piso de D-122 hecho auditor: para
  cada nivel N4-N12, al menos 6 retos en el banco (2 `modo: serie`
  fijos + 4 plantillas con `variacion` completa), cada uno con
  `dificultad_experta` etiquetada. Falla si un nivel queda por debajo —
  es la única forma de que el piso no se erosione en silencio.
- `precache-budget` pasa de PENDING a ACTIVE cuando haya audio (§6).
- Cartas: `pwa-offline` y `nativo-*` ya cubren el frente 6 sin cambio;
  `anti-trampa.cita` gana D-125; `privacidad.cita` gana D-126.

## 9. Qué NO incluye este documento

- **Tiers 2-5 de anti-trampa** (D-125) — llegan con tráfico real.
- **Kinder** — su contenido es F5, su fase sigue su camino (D-073).
- **El abogado externo** — D-126 lo sustituye con el checklist y su
  condición de revisión explícita.
- **Tiendas (TWA/Capacitor)** — `mc-33` las deja como fase posterior
  opcional; el wrapping no es del cierre.
- **La revisión de θ del tablero global** — su disparador es de datos
  (≥200 respuestas/ítem, D-025), no de fase.
- **Mergear o desplegar algo** — este documento diseña; cada frente
  tiene sus PRs.

## 10. Lo que no se pudo verificar

- **El estado actual del litigio CAADCA** (reportes de 2024-2026 no se
  reconcilian en una línea de tiempo consistente — `mc-25`); el
  checklist lo marca `[unverified]` en vez de fingir una postura.
- **La cobertura real de axe-core sobre las pantallas de reto**
  (canvas/SVG de ítems): la cifra 30-57% es de sitios generales; las
  pantallas de juego pueden quedar peor cubiertas.
- **El costo real del servicio de verificado Lean** — no hay proveedor
  elegido; es la única pieza del cierre sin dueño técnico.
- **El comportamiento de Web Push en iOS 2026** más allá de `mc-33`
  (Apple movió esta frontera dos veces; reverificar en la issue).

## 11. Segunda pasada desconfiando de este documento

1. **Verificado contra el repo:** los auditores citados como ACTIVE
   existen en `run.mjs` `[leído]`; `precache-budget` está en PENDING y
   su activación es trabajo de esta fase; `ratelimiter-do` existe (F2);
   #389 (PATRON_INUSUAL_PARA_EDAD) está abierta y es de F4 — el frente
   2 la consume, no la duplica; #207 (push) está en construcción por el
   cierre de F7 (D-105) — el frente 5 completa, no repite.
2. **Lo que F11 le pide a fases hermanas que ellas no saben:** a F8,
   la nota suave del tier 0-1 aterriza en SU panel (`child_diagnostic_notes`
   — tabla de la migración `0013`, suya); a F7, nada que no esté
   escrito en D-105/D-127; a F10, el checklist que habilita su paso 2.
3. **Campos declarados pero nunca exigidos:** el piso de 6 retos tiene
   auditor propio (§8) precisamente porque «6 por nivel» declarado sin
   auditor es una promesa que se erosiona en silencio.
4. **El número de migración:** `0020` sigue al reparto confirmado; si
   otra rama lo toma antes, se renumera ANTES de commitear.

## 12. Issues propuestas (1 paraguas + 10)

1. **[PARAGUAS]** F11 · Cierre
2. F11 · Contenido: 6 retos por nivel N4-N7 (2 fijos + 4 plantillas, D-122/D-123)
3. F11 · Contenido: 6 retos por nivel N8-N10 (absorbe la franja F5b)
4. F11 · Contenido: 6 retos por nivel N11-N12 auto-calificables (D-124)
5. F11 · Pista Lean 4 capstone (aditiva, con su proveedor por decidir)
6. F11 · Anti-trampa tier 0-1: piso de tiempo solo-logging + monitoreo silencioso (D-125)
7. F11 · Auditoría manual WCAG 2.2 AA del producto + VPAT (frente 3)
8. F11 · Checklist legal interno escrito y fechado (D-126)
9. F11 · Offline: D-047 completo — modo avión, cola, revalidación
10. F11 · Web Push: VAPID, SW, suscripciones (`0020`) — completando #207 (D-127)
11. F11 · Verificación de interfaz en las 4 plataformas + flota adversarial completa

## 13. Ejecución en paralelo (swarm) — territorios, y quién no toca qué

Los seis frentes son naturalmente paralelos (no comparten archivos
casi en nada), con tres excepciones escritas abajo. Migraciones ya
repartidas: `0020` es de esta fase; el contenido no lleva migración de
esquema.

| Frente | Issues | Archivos SUYOS | NO toca |
|---|---|---|---|
| **A · Contenido N4-N7** | #2 | `content/` (ítems, plantillas), revisión de renders `es-MX`/`es-ES` | el motor de parametrización (existe de F5c), N8+ |
| **B · Contenido N8-N12 + Lean** | #3, #4, #5 | `content/` de las bandas altas, la pista Lean y su servicio | A (mismos directorios: **reparten por nivel, nunca editan el archivo del otro** — cada nivel es un archivo) |
| **C · Anti-trampa** | #6 | `packages/motor/src/` (módulo nuevo de piso/monitoreo), `audits/tiempo-piso-solo-logging.mjs`, `audits/nota-solo-por-velocidad.mjs` | el panel de F8 (la nota se entrega vía #389, no se escribe ahí) |
| **D · Accesibilidad** | #7 | el informe por pantalla + las correcciones en `apps/web/src` que salgan de él | las pantallas de fases vivas (F8/F9/F10) hasta que aterricen — audita lo que existe |
| **E · Legal** | #8 | `docs/legal-checklist.md` (nuevo, único dueño) | código — es un frente de documento |
| **F · Offline + Push** | #9, #10 | `apps/web/public/sw.js`, `migrations/0020_push_subscriptions.sql`, cola IndexedDB en `apps/web/src/lib/`, VAPID vía `wrangler secret` | `wrangler.jsonc` hasta el cierre (registro compartido), #207 de F7 (completa, no reescribe) |
| **G · Verificación plataformas** | #11 | el informe de recorrido + correcciones menores | corre la flota AL FINAL, cuando A-F hayan aterrizado |

**Los archivos que NO se paralelizan:** `apps/web/public/sw.js` (solo
F), `migrations/0020*` (solo F), `docs/legal-checklist.md` (solo E),
`audits/run.mjs` + `audits/pruebas-auditores.mjs` (los registra cada
frente al final, solo añadiendo; el orquestador resuelve el merge), y
`content/`: A y B comparten directorio, así que la regla es **un nivel
= un archivo = un dueño**, jamás edición compartida.

**El encargo de cada agente:** la plantilla de AGENTS.md §1 — qué leer
numerado (para A/B: `mc-40`, `mc-44`, `mc-34`, el esquema de ítem y los
4 modelos de F5c; para C: `mc-29`, D-020/D-061, `limite-pantalla.ts`
como patrón de motor puro; para D: `mc-38` y la checklist de SC; para
E: `mc-25` completo y D-126; para F: `mc-33`, D-047, D-105, #207) · su
territorio y el de los demás · las líneas rojas citadas por número ·
qué cuenta como prueba (gate verde pegado, control negativo visto
fallar, y para D y G: la pantalla **vista en un aparato real**, no solo
en el gate) · las cinco trampas medidas · cierre: rama, Conventional
Commits, PR sin mergear, y decir lo que el cambio NO hizo.

## Preguntas al dueño — resueltas en esta sesión

| # | Pregunta | Respuesta | Decisión |
|---|---|---|---|
| 1 | ¿Qué es «un reto» para el piso? | Mixto: 2 fijos + 4 plantillas por nivel | D-122 |
| 2 | ¿Autoría por locale o única? | Una autoría, 7 renders | D-123 |
| 3 | ¿Qué contienen N11-N12? | Base auto-calificable + pista Lean 4 | D-124 |
| 4 | ¿Tratamiento de kinder? | Kinder = F5; piso solo N4-N12 | D-122 |
| 5 | ¿Alcance anti-trampa? | Solo tier 0-1 | D-125 |
| 6 | ¿Revisión legal? | Checklist interno documentado, sin abogado | D-126 |
| 7 | ¿Alcance offline? | D-047 + Web Push | D-127 |
