# Navegación del área autenticada de la app: panel del padre y futuras superficies de juego de niño/adulto

> Investigación Math Challenge — 2026-08-02 — tema 50

## Resumen ejecutivo (ES)

El dueño encontró, con una captura real, que el panel del padre ("Tu casa")
heredaba `Base.astro` — el nav de MARKETING, con "Entrar"/"Crear cuenta" como
acciones para alguien que ya inició sesión. La investigación interna confirmó
que esto era omisión, no decisión: los tres archivos de `app/kids/**` tienen
razonamiento extenso y citado para NO usar `Base.astro` (cero telemetría,
cero navegación de marca, cero JavaScript — línea roja #2, D-037), pero
`app/index.astro` y `app/signin.astro` eran los dos únicos archivos bajo
`/app/**` sin ningún comentario que explicara su elección de layout. Ni
`docs/master-plan.md` ni `docs/decisions.md` contienen una sola decisión
sobre qué navegación debe tener el área autenticada del adulto — D-064 y
`mc-49` cubren exclusivamente el sitio público.

El hallazgo más profundo no fue de layout sino de modelo de datos: la
pantalla asumía que todo adulto es un padre. `users.is_learner` existe desde
la migración 0001 —"¿este adulto usa el producto para sí mismo?"— y nada
downstream lo leía nunca. Un adulto que se registró por `registro-aprendo`
veía la sección "Tus hijos" vacía y sin sentido, y **no tiene ningún lugar a
donde ir**: no existe pantalla de práctica para un adulto que aprende solo
—F5b (contenido N8-N10) y F10 (clubs de adultos) siguen sin construirse—, así
que el hueco de navegación era en realidad dos huecos: el layout equivocado y
una función que no existe todavía.

La investigación externa converge en un patrón conocido: Google Family
Link —el análogo real más cercano, un adulto gestionando el uso de un
menor— usa exactamente 3 pestañas fijas (Resumen/Controles/Ubicación), no un
nav de sitio de marketing [1]. La literatura de UX confirma que pestañas
fijas sirven cuando hay 3-5 destinos igual de importantes [2][3], y que un
panel con más de eso se vuelve una lista de una sola pantalla en vez de
pestañas [4] — la misma regla de HIG/Material 3 que ya fijó D-064 en 5.

Sobre las superficies de NIÑO en bandas futuras (PRIMARIA, SECUNDARIA): la
investigación de `mc-20`/`mc-21` ya deja esto resuelto — navegación máxima de
2 toques, cero menú, la rejilla de caras ES la navegación [5][6]. `mc-21`
agrega, para PRIMARIA, una franja ligera de "dónde estoy en la sesión" (no un
menú) [7]. `mc-22` (secundaria) es la única que sugiere un patrón de
navegación distinto: **riel lateral persistente solo en escritorio**, teclado
numérico anclado abajo en móvil — pero está descrito como densidad de
contenido dentro de la pantalla de práctica, no como app-chrome de cuenta
[8]. `mc-23` (adulto/pro) pide navegación de salto VISIBLE dentro de la
práctica (saltar de tema), en vez de un flujo lineal fijo — de nuevo, dentro
de la pantalla de resolver problemas, no un menú de cuenta [9].

## Executive summary (EN)

The owner found, via a real screenshot, that the parent dashboard ("Tu
casa") inherited `Base.astro` — the MARKETING nav, with "Sign in"/"Sign up"
as actions for someone already logged in. Internal research confirmed this
was omission, not decision: the three `app/kids/**` files carry extensive,
cited reasoning for NOT using `Base.astro` (zero telemetry, zero brand nav,
zero JavaScript — red line #2, D-037), but `app/index.astro` and
`app/signin.astro` were the only two files under `/app/**` with no comment
explaining their layout choice. Neither `master-plan.md` nor `decisions.md`
contains a single decision about what navigation the authenticated adult
area should have — D-064 and `mc-49` cover the public site exclusively.

The deeper finding wasn't about layout but about the data model: the screen
assumed every adult is a parent. `users.is_learner` has existed since
migration 0001 — "does this adult use the product for themselves?" — and
nothing downstream ever read it. An adult who registered via
`registro-aprendo` saw the same empty, meaningless "Your children" section,
and **has nowhere to go**: no practice screen exists for a solo adult
learner — F5b (N8-N10 content) and F10 (adult clubs) remain unbuilt — so the
navigation gap was really two gaps: the wrong layout, and a feature that
doesn't exist yet.

External research converges on a known pattern: Google Family Link — the
closest real analogue, an adult managing a minor's usage — uses exactly 3
fixed tabs (Highlights/Controls/Location), not a marketing-site nav [1]. UX
literature confirms fixed tabs work for 3-5 equally-important destinations
[2][3], and that a panel with more than that becomes a single scrollable
list instead of tabs [4] — the same HIG/Material 3 rule D-064 already fixed
at 5. On future CHILD-facing bands (PRIMARIA, SECUNDARIA): `mc-20`/`mc-21`
already settle this — maximum 2-tap navigation, zero menu, the avatar grid
IS the navigation [5][6]. `mc-21` adds, for PRIMARIA, a lightweight
in-session "where am I" strip (not a menu) [7]. `mc-22` (teens) is the only
one suggesting a different navigation pattern: **persistent sidebar,
desktop-only**, docked numeric keypad on phone — but framed as in-screen
content density, not account-level chrome [8]. `mc-23` (adult/pro) asks for
visible jump navigation inside practice (skip to topic), instead of a fixed
linear flow — again inside the problem-solving screen, not an account menu
[9].

---

## Hallazgos

**1. La estructura de pestañas de Google Family Link.** Tres pestañas
fijas: Resumen (uso de hoy, app más usada), Controles (tiempo de pantalla /
límites por app), Ubicación — más un centro de notificaciones compartido.
Los hogares con varios menores tienen cambio rápido de perfil desde la
misma envoltura [1]. Arquitectónicamente es el producto real más cercano a
"Tu casa": una cuenta de adulto gestionando menores, no un sitio de
marketing.

**2. Pestañas vs. lista de una sola pantalla, y dónde está la línea.** Las
pestañas inferiores sirven para 3-5 destinos primarios que se visitan con
frecuencia [2]. En pantallas de configuración específicamente: las pestañas
funcionan cuando los destinos son igual de importantes y no subordinados
entre sí; cuando un destino es claramente primario y el resto secundario, o
cuando hay más categorías variadas que eso, una sola lista desplazable
sirve mejor [3][4]. La navegación de barra lateral es la decisión correcta
para productos con 15-40 secciones (paneles de administración, dashboards
SaaS) — no aplica a la escala de esta pantalla (2-5 secciones) [10].

**3. Hallazgos de navegación de `mc-20` (KINDER), reformulados para esta
tarea.** Máximo 2 toques desde abrir la app hasta "estar respondiendo un
reto". Toque 1: elegir avatar. Toque 2: tocar la mascota/Jugar. Antipatrón
explícito: "deep or hidden navigation (hamburger menus, multi-level
settings) inside the child-facing surface" [5]. Aplica a KINDER por diseño;
el código hoy reutiliza este mismo patrón de cero chrome para TODAS las
bandas de niño vía `kids/jugar.astro` (documentado explícitamente como una
simplificación: "en esta rejilla conviven las tres bandas de niño... manda
el piso más alto de los tres").

**4. Hallazgos de navegación de `mc-21` (PRIMARIA).** Cambio de perfil
rápido y sin teclear; ninguna asunción de un login personal persistido
(tablets familiares compartidas, Chromebooks escolares) [6]. Un elemento
nuevo frente a KINDER: una franja ligera de contexto dentro de la sesión
(indicador de progreso/racha) — la primera banda donde se recomienda algo
de "dónde estoy en esta sesión", pero todavía no un menú [7].

**5. Hallazgos de navegación de `mc-22` (SECUNDARIA/adolescentes).** La
única idea de chrome directamente transferible entre los cuatro documentos
de banda: *"Tablet: two-pane (problem + scratch/graph). Desktop: persistent
skill-tree sidebar that phone omits — the 'not a kids app' signal on
desktop leans toward Desmos/Khan-Academy-style utility density."* [8]
Planteado explícitamente como densidad por superficie dentro de la pantalla
de práctica, no como navegación de app a nivel de cuenta. El modo oscuro
por defecto de esta banda ya está implementado en `bandas.css`.

**6. Hallazgos de navegación de `mc-23` (adulto/experto).** *"Expose
explicit learner control over path: visible skip/reorder/jump-to-topic...
honoring the self-concept assumption that adults disengage when the system
controls sequencing."* [9] También dentro de la pantalla de práctica —
densidad multipanel (problema, área de borrador, historial de intentos),
no un menú de configuración/cuenta.

**7. Lo que ninguno de los cuatro documentos de banda aborda.** Un menú de
navegación persistente, de primer nivel, orientado a la cuenta, para el
área autenticada. KINDER/PRIMARIA quieren cero chrome por diseño. Los
hallazgos de SECUNDARIA/adulto tratan de densidad de contenido dentro de
la práctica. Esto confirma que el hueco de navegación del área privada que
este documento aborda no tenía ninguna cobertura de investigación previa
— la misma conclusión a la que llegó `mc-49` para el sitio público antes
de D-064.

**8. El hueco del modelo de datos.** `migrations/0001_identity.sql`,
comentario sobre la ausencia deliberada de una columna `role`: *"Sin
columna `role`... una persona puede ser las tres cosas a la vez: el propio
dueño es papá y aprendiz adulto (por-que-existe.md). Un rol excluyente
obligaría a mentir."* Las capacidades se derivan: padre ⇐ tiene filas en
`child_profiles`; maestro ⇐ tiene una fila en `group_owner_identity` (F9,
sin construir); aprendiz ⇐ `users.is_learner = 1`, **la única bandera
explícita**, fijada en el registro desde la puerta `registro-aprendo` pero
nunca leída downstream antes de esta pasada.

## Implicaciones de diseño

1. **El área autenticada del adulto tiene su propio layout, no
   `Base.astro`.** El mismo principio que `app/kids/**` ya estableció para
   las superficies de niño, extendido al único hueco que quedaba (D-065).
2. **Franja fija de pestañas arriba, no la maquinaria de cuatro contextos
   de D-064.** Esta pantalla tiene 2-5 destinos, no "6 secciones + overflow
   compitiendo con un nav de marketing" — el problema que resuelve la
   complejidad de D-064 aquí no existe. Una fila de pestañas sticky simple,
   presente sin importar el `display-mode` (no hay ninguna navegación
   pestaña-de-navegador-vs-instalada con la que evitar apilarse), coincide
   tanto con el precedente de Family Link como con el instinto del propio
   producto de "no construir maquinaria que un problema no necesita".
3. **Las pestañas se derivan de lo que la cuenta realmente tiene, no de
   por qué puerta se registró.** `esFamilia` = tiene ≥1 perfil de niño.
   `esSolo` = `users.is_learner = 1`. No son mutuamente excluyentes. Tope
   de 5 (HIG/Material 3, la propia cita de mc-49, reaplicada aquí).
4. **"Cuenta" (passkey/contraseña/cerrar sesión) está siempre presente y
   siempre es real** — es el único destino que nunca depende del tipo de
   cuenta, y garantiza que el panel nunca sea un callejón sin salida ni
   para una cuenta sin hijos ni `is_learner` (ej. solo-maestro, F9 sin
   construir).
5. **La pestaña de aterrizaje es la primera pestaña REAL (no
   "próximamente")**, no simplemente la primera en orden de despliegue —
   un aprendiz solo no debería abrir la app en un placeholder de
   "próximamente" cuando "Cuenta" tiene contenido real y funcionando.
6. **La banda RUM es `SERIO`, no `PUBLICO`.** D-037 permite medir las
   superficies de adulto; `PUBLICO` mezcla tráfico de marketing con uso
   autenticado del producto en el mismo saco de métricas.
7. **Para las futuras bandas de niño (PRIMARIA, SECUNDARIA): cero chrome
   a nivel de cuenta, siempre — este es el lineamiento que el dueño pidió
   fijar ahora en vez de aplazar.** El patrón de cero navegación con la
   rejilla de caras como entrada que `kids/**` ya implementa para KINDER
   sigue siendo el patrón de todas las bandas de niño. Lo que cambia por
   banda es la *densidad de contenido dentro de la pantalla de juego*,
   nunca la navegación a nivel de app: PRIMARIA añade una franja ligera
   de progreso dentro de la sesión (no un menú); la pantalla de práctica
   de escritorio de SECUNDARIA puede llevar un riel lateral persistente
   de árbol de habilidades, el teléfono sigue anclando el teclado sin
   chrome añadido; ninguna de las tres tiene jamás menú hamburguesa, barra
   inferior de pestañas ni ninguna estructura que exija más de 2 toques
   desde abrir hasta "estar respondiendo un reto". Un niño nunca llega a
   `layouts/Privada.astro` — ese layout es solo para adultos por
   construcción (D-065).
8. **Para la futura superficie de autoestudio adulto/pro (F5b/F10, sin
   construir):** cuando se construya, vive como una pestaña "Practicar"
   **real** dentro de esta misma envoltura `Privada.astro` (no un layout
   nuevo) — la navegación visible de salto/saltar-de-tema de `mc-23`
   ocurre *dentro* de esa pantalla, igual que dentro de cualquier pantalla
   de práctica, no como un segundo sistema de navegación a nivel de
   cuenta.

## Preguntas abiertas para el dueño del proyecto

Ya resueltas en esta sesión, registradas aquí para trazabilidad:

1. *Cuentas solo vs. familia, y cómo debe diferir el menú* → resuelto: se
   deriva de los datos reales (`is_learner`, conteo de hijos), no de la
   puerta de registro; las pestañas son la unión de lo que aplica.
2. *Si anticipar ya las pestañas de F8* → resuelto: sí, como pestañas
   visibles de "Próximamente", en vez de reconstruir la navegación dos
   veces.
3. *Si escribir el lineamiento de bandas futuras ahora o aplazarlo* →
   resuelto: ahora (implicación de diseño #7 de arriba).

Siguen abiertas, para quien construya F5b/F9/F10:

1. Cuando la pestaña "Practicar" del adulto pase de placeholder a real,
   ¿reutiliza el modelado de entidades estilo `child_profiles`, o una
   tabla separada indexada directamente por `users.id`? (Fuera del alcance
   de la navegación; es una pregunta de contenido/datos para F5b.)
2. Cuando F9 (maestro/salón) se construya, ¿el maestro recibe una 6ª
   pestaña aquí, o un área `/app/maestro/` completamente separada? El tope
   de 5 pestañas de este documento asume padre+aprendiz; una pestaña de
   maestro necesitaría su propia decisión de alcance en ese momento.

## Fuentes

1. Documentación de producto y páginas de soporte de Google Families /
   Family Link — estructura de pestañas (Resumen/Controles/Ubicación),
   cambio de perfil con varios menores —
   https://support.google.com/families/answer/7103340 ,
   https://families.google/familylink/ (consultado el 2026-08-02)
2. UXPin, "Mobile Navigation Patterns: Pros and Cons" —
   https://www.uxpin.com/studio/blog/mobile-navigation-patterns-pros-and-cons/
   (consultado el 2026-08-02)
3. LogRocket Blog, "Tabbed navigation in UX: Where and when to use it" —
   https://blog.logrocket.com/ux-design/tabs-ux-best-practices/ (consultado
   el 2026-08-02)
4. Cursa, "Tab Navigation Patterns and When to Use Them" —
   https://cursa.app/en/page/tab-navigation-patterns-and-when-to-use-them
   (consultado el 2026-08-02)
5. Investigación interna de Math Challenge, `docs/research/2026-07-31-mc-20-ui-ages-3-6-kinder.md`
   §8, implicaciones de diseño #8-#9.
6. Investigación interna de Math Challenge, `docs/research/2026-07-31-mc-21-ui-ages-7-11-primary.md`
   §10, implicación de diseño #13.
7. Igual que [6], implicación de diseño #4.
8. Investigación interna de Math Challenge, `docs/research/2026-07-31-mc-22-ui-teens-12-17.md`,
   implicación de diseño #13.
9. Investigación interna de Math Challenge, `docs/research/2026-07-31-mc-23-ui-adult-expert.md`,
   implicaciones de diseño #8, #10.
10. AlfDesignGroup, "Sidebar Design for Web Apps: UX Best Practices (2026
    Guide)" — https://www.alfdesigngroup.com/post/improve-your-sidebar-design-for-web-apps
    (consultado el 2026-08-02)
11. Código/decisiones internas de Math Challenge — `migrations/0001_identity.sql`
    (comentario del esquema sobre `role` vs. capacidades derivadas, columna
    `is_learner`), `apps/web/src/pages/[locale]/app/kids/index.astro`
    (§"Por qué esta pantalla NO usa `layouts/Base.astro`"),
    `docs/decisions.md` D-034, D-064.
