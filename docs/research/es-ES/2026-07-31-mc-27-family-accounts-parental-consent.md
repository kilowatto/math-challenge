# Arquitectura de cuentas familiares y UX de consentimiento — Cómo lo hacen los mejores productos

> Investigación Math Challenge — 2026-07-31 — tema 27

## Resumen ejecutivo (ES)

El patrón dominante no es «el niño se registra»: es «el adulto crea una cuenta y añade perfiles de hijos bajo su propio consentimiento», con un inicio de sesión infantil deliberadamente ligero (PIN, imagen o tocar un avatar en un dispositivo ya vinculado) para que un niño de 6 a 10 años entre sin leer. Apple, Google y Microsoft usan **cuentas infantiles reales** dentro de un grupo familiar, con gasto, tiempo de pantalla y contenido controlados por el padre, y una transición a los 13 años (edad de consentimiento digital según COPPA en EE. UU.) y otra en la mayoría de edad. Los servicios de streaming (Netflix, Disney+) y algunos juegos (Nintendo) usan **perfiles**, no cuentas: más ligero, sin identidad propia del niño. Los productos educativos (Prodigy, Google Classroom) añaden un tercer actor, el profesor, que crea un aula y vincula a los estudiantes mediante un código, con el consentimiento de cada padre capturado por separado o delegado a la escuela (excepción FERPA).

Para el consentimiento parental verificable (VPC), la FTC ha mantenido una lista de métodos aceptados bajo COPPA durante más de una década (formulario firmado, cargo a tarjeta de crédito, llamada a línea gratuita, videoconferencia, identificación gubernamental + reconocimiento facial — aprobado en 2015), y ha aprobado individualmente métodos de estimación facial de edad (PRIVO/Yoti, 2023) mediante el proceso 16 CFR 312,12. **No se pudo confirmar con una fuente primaria en esta sesión si la enmienda final de la Regla COPPA de enero de 2025 añadió nuevos métodos directamente al texto de la norma** — ftc.gov bloqueó las consultas automatizadas; verifique antes de citar como hecho jurídico.

Para Math Challenge, el diseño ya decidido coincide con el patrón Apple/Google/Microsoft más el patrón de aula de Google Classroom. Recomendación: perfiles de niños (no cuentas OAuth independientes) con un PIN de 4 dígitos + avatar para tabletas compartidas, un código de aula de 6 caracteres para invitaciones, y un panel de aprobación del lado del padre (nunca del niño) para cualquier incorporación a un aula.

## Executive summary (EN)
El patrón dominante no es «the child signs up» — es «an adult creates an account and adds child profiles under their own consent», con un inicio de sesión infantil deliberadamente ligero (PIN, foto o pulsar un avatar en un dispositivo ya vinculado) de modo que un niño de 6–10 años pueda entrar sin leer. Apple, Google y Microsoft utilizan **real child accounts** dentro de un grupo familiar, con el gasto, el tiempo de pantalla y el contenido controlados por el progenitor, con transición a los 13 años (la edad de consentimiento digital de EE. UU. según la COPPA) y de nuevo a la mayoría de edad legal. Los servicios de streaming (Netflix, Disney+) y algunos juegos (Nintendo) usan **profiles**, no cuentas — más ligeros, pero sin una identidad infantil duradera. Los productos educativos (Prodigy, Google Classroom) añaden un tercer actor, el profesor, que crea una clase y enlaza a los estudiantes mediante un código, con el consentimiento de cada progenitor capturado por separado o delegándose a la escuela (excepción FERPA).

Para el consentimiento parental verificable (VPC), la FTC ha mantenido una lista de métodos aceptados bajo la COPPA durante más de una década (formulario firmado, cargo con tarjeta de crédito, llamada a número gratuito, videoconferencia, identificación gubernamental + coincidencia facial — aprobado en 2015), y ha aprobado individualmente los métodos de estimación de edad facial (PRIVO/Yoti, 2023) mediante el proceso 16 CFR 312,12. **Whether the January 2025 final COPPA Rule amendments added new methods directly to the rule text could not be confirmed against a primary source this session** — ftc.gov blocked automated fetches; verify before citing as legal fact.

Para Math Challenge, el diseño ya decidido coincide con el patrón de Apple/Google/Microsoft más el patrón de aula de Google Classroom. Recomendación: perfiles infantiles (no cuentas OAuth independientes) con un PIN de 4 dígitos + avatar para tabletas compartidas, un código de clase de 6 caracteres para invitaciones, y un panel de aprobación del lado del progenitor (nunca del lado del niño) para cualquier incorporación a una aula.

## Findings

### Apple: Family Sharing, Child Accounts, Ask to Buy, Declared Age Range API

Un organizador (padre, 18 +, con su Apple ID) designa a los miembros de la familia, incluidos los niños. Las compras del miembro infantil pasan por **Ask to Buy**: las adquisiciones en App Store/iTunes/Books, las compras dentro de la aplicación y las ampliaciones de almacenamiento de iCloud generan una solicitud que el organizador aprueba o rechaza antes de que se complete [1]. Las cuentas infantiles se crean y gestionan bajo el grupo familiar del organizador, nunca se registran por sí mismas.

La más reciente **Declared Age Range API** (iOS/iPadOS/macOS 26, presentada en WWDC 2025) permite a una aplicación leer una *categoría* de edad que preserva la privacidad (menor de 13 / 13–17 / 18 +) en lugar de una fecha de nacimiento. La edad se establece una sola vez, al crear la cuenta o a través de Screen Time/Family Sharing, y las apps la consultan mediante una API Swift sin ver la fecha de nacimiento subyacente [2][3]. Se lanza junto a un mecanismo **Significant Change (PermissionKit)** para volver a solicitar el consentimiento cuando el conjunto de funciones de la app cambia, y a Notificaciones de Servidor cuando un padre revoca el consentimiento. Apple presenta esto como una herramienta de cumplimiento para las leyes de garantía de edad de 2025–2026 (Texas, Luisiana, Utah, Brasil, Australia, Singapur): una señal de edad independiente de la jurisdicción, no un método VPC en sí mismo.

### Google Family Link

Un padre de 18 + crea una cuenta de Google para un niño menor de 13 años (o la edad de consentimiento local) mediante Family Link, en el mismo país que el niño [4]. La cuenta queda marcada como supervisada: el padre aprueba o bloquea instalaciones y compras en Play, establece límites de tiempo de pantalla y horarios de descanso, filtra contenido para adultos y puede ver la ubicación del dispositivo. El inicio de sesión es un inicio de sesión normal de cuenta de Google; en un dispositivo compartido, las cuentas de padre y niño coexisten y el niño cambia mediante el conmutador de cuentas estándar de Android. No se pudo confirmar la mecánica exacta de “graduación” de Google a los 13 años con una fuente primaria obtenida en esta sesión y debe verificarse por separado.

### Microsoft Family Safety / Xbox / Minecraft

Family Safety agrupa la cuenta Microsoft de un padre con cuentas infantiles, ofreciendo límites de tiempo de pantalla, filtrado de contenido y resúmenes de actividad en Windows, Xbox y Android [5]. Minecraft se autentica a través del mismo sistema de cuentas Microsoft, de modo que su superficie parental es el grupo familiar Xbox/Microsoft: la cuenta Microsoft del niño inicia sesión y la configuración familiar controla el acceso a multijugador/Realms, al chat y a las clasificaciones. No se pudieron recuperar los flujos de creación y la mecánica de transición 13/18 de las páginas consultadas en esta sesión (solo se cargó contenido de visión general) y deben volver a verificarse antes de citar detalles específicos.

### Nintendo Switch parental controls

Un padre (18 +) necesita una Nintendo Account y empareja la aplicación gratuita **Nintendo Switch Parental Controls** con la(s) consola(s) del hogar [6]. Controles: filtrado de juegos basado en ESRB, límites diarios/nocturnos de tiempo de juego, restricción de mensajería/GameChat a contactos aprobados, requerimiento de aprobación para videollamadas con menores de 16 años, bloqueo de la compartición de capturas de pantalla en redes sociales y límites de gasto en eShop. Se trata de una restricción a nivel de perfil de consola, no de una identidad infantil con sesión separada; no se necesita una cuenta protegida por contraseña distinta para jugar; un PIN de padre anula las restricciones en la consola compartida.

### Netflix and Disney+ kids profiles

Ambas plataformas utilizan **perfiles bajo una única cuenta familiar de pago**, sin cuentas infantiles separadas. El perfil Kids de Netflix oculta contenido por encima de una clasificación de madurez configurable y puede protegerse con un PIN numérico de Bloqueo de Perfil; Disney+ ofrece un modo Junior similar más PIN de perfil. Este es el patrón más ligero encontrado: no persiste una identidad infantil fuera de la cuenta familiar, nada que migrar a los 13/18, y el límite de “consentimiento” es el de la compra familiar, no el de la recogida de datos de un menor — ninguna de ellas actúa como operador COPPA que recoja datos personales identificables de un menor para crear una cuenta, por lo que los perfiles son suficientes. (Las páginas de ayuda no fueron accesibles en esta sesión por bloqueo de bots; se trata de funciones estables y bien establecidas, no resumidas a partir de una fuente en vivo — comprobar la copia exacta de la IU si se necesita.)

### Roblox parental controls and age verification

Roblox exige una cuenta para jugar (el modo invitado se eliminó en 2017); desde una revisión de noviembre 2024, un padre puede crear una **cuenta de padre vinculada** que controla el tiempo de pantalla, la mensajería privada y la configuración de comunicaciones. Desde diciembre 2025 (primeros mercados) / enero 2026 (global), Roblox requiere **verificación de edad para cualquier comunicación dentro de la plataforma**, a través del proveedor Persona: carga de documento de identidad oficial o vídeo de estimación facial de edad, con corrección manual si la estimación es errónea; los usuarios verificados se agrupan en bandas de edad (p. ej., un niño de 12 años solo puede enviar mensajes a edades de 9–15) [7]. Este es un ejemplo actual de estimación facial de edad desplegada a escala de consumo para regular la comunicación, no la creación de la cuenta — relevante si Math Challenge alguna vez contempla funciones de chat o redes sociales.

### Khan Academy, Duolingo, Prodigy

Khan Academy Kids (edades 2–7) es una aplicación gratuita independiente; Khan Academy propiamente dicho emplea un modelo de entrenador‑estudiante donde un profesor crea un aula y un flujo separado permite a un padre ver el progreso — no se pudieron confirmar los mecanismos exactos de inicio de sesión infantil con una fuente en vivo en esta sesión. Duolingo ABC (2020, prelectores, sin anuncios ni compras dentro de la app) es totalmente independiente del producto principal; el Super Duolingo Family Plan agrupa suscripciones familiares, pero los mecanismos exactos de vinculación padre‑hijo no pudieron verificarse en una fuente primaria y deben comprobarse directamente antes de usarlos como referencia de diseño.

Prodigy separa la **cuenta de juego del niño** (normalmente creada a través de la escuela para uso en el aula) de una **cuenta de padre** que el progenitor crea de forma independiente y enlaza al niño, desbloqueando un panel de Membresía: informes de progreso en tiempo real y mensuales, establecimiento de objetivos, recompensas dentro del juego y hojas de trabajo imprimibles [8]. Esto se asemeja más al modo docente que se plantea para Math Challenge: la identidad del niño en el aula existe primero, y el padre se asocia después para monitorizar y autorizar, en lugar de crear al niño desde cero.

### Verifiable parental consent (VPC) under COPPA

La FTC ha certificado programas de puerto seguro cuyos miembros diseñan su propio flujo VPC aprobado: TrustArc, ESRB, CARU, PRIVO, Samet Privacy/kidSAFE, iKeepSafe (Aristotle Inc. se retiró en agosto 2021) [9]. Fuera del puerto seguro, **COPPA §312.12** permite a cualquier operador solicitar la aprobación de un método novedoso — el proceso que PRIVO utilizó en 2023 para obtener la aprobación de un método de estimación facial de edad (basado en tecnología Yoti) como herramienta de verificación del consentidor. Los métodos enumerados de referencia son: un formulario firmado (correo/ fax/ escaneo), una transacción monetaria (cargo de tarjeta), un número gratuito con personal capacitado, una videoconferencia con personal entrenado y la verificación de documento de identidad gubernamental cruzada con una foto en vivo — este último, “coincidencia facial con documento de identidad verificado” (FMVPI), recibió aprobación de la FTC el 19 de noviembre de 2015 [9][10]. **Nota de verificación**: las enmiendas finales de la Regla COPPA de enero 2025 (según se informa, vigentes a partir de junio 2025) se describen ampliamente como la incorporación de nuevos métodos enumerados y el endurecimiento del consentimiento de divulgación a terceros, pero las páginas de reglas/comunicados de prensa de ftc.gov devolvieron 403/404 a la extracción automatizada en esta sesión — solo información de contexto, confirmar antes de basarse en ella.

### Age-assurance vendors: k‑ID and Yoti

k‑ID es una plataforma de cumplimiento: **AgeKit** (clasificación de edad gruesa gratuita), **AgeKit+** (verificación de mayor garantía mediante estimación facial, comprobación de documentos o credenciales reutilizables), **Family Connect** (portal de consentimiento parental con aprobación a nivel de cartera para todos los títulos del cliente, que afirma tasas de finalización de hasta el 96 %), **AgeKey** (credencial de edad reutilizable multiplataforma) y **neimo** (seguimiento regulatorio) — que afirma cobertura en más de 200 jurisdicciones, incluidas COPPA, el Artículo 8 del GDPR, el Código de Diseño Apropiado para la Edad del Reino Unido/Online Safety Act, la ley australiana para menores de 16 años y los equivalentes de Brasil e India [11]. No se pudo obtener directamente el producto de estimación facial de edad de Yoti en esta sesión (403); sus afirmaciones de precisión y certificaciones deben verificarse directamente en yoti.com antes de citarlas.

### Patrones de unión a aulas

Google Classroom: cada clase dispone de un **código de aula** autogenerado, visible de nuevo en Ajustes; un estudiante se une iniciando sesión en classroom.google.com y introduciéndolo [12]. Workspace‑for‑Education tiene límites por clase (50 profesores, 1.000 miembros) mediante Google Groups; las cuentas personales enfrentan límites de actividad, y las invitaciones interdominio están restringidas a menos que se utilice un código/enlace compartible. Clever es una capa de gestión de listas/SSO, no de consentimiento: importa los datos de lista desde el SIS de una escuela y ofrece un único inicio de sesión en las herramientas ed‑tech; la responsabilidad del consentimiento recae en la escuela (a menudo la excepción FERPA de “funcionario escolar”, que permite a la escuela autorizar a un proveedor en su nombre) o en el propio flujo COPPA del proveedor. Kahoot utiliza un **PIN de juego**: el organizador debe registrarse, pero para unirse a una partida en directo solo se necesita el PIN, sin cuenta — el patrón de unión con menor fricción que se ha encuestado, creado para participación anónima y efímera sin identidad persistente ni estado de consentimiento.

## Tabla comparativa de mecanismos de consentimiento

| Método | Fricción (padre) | Coste por consentimiento | Aceptado por | Recomendación |
|---|---|---|---|---|
| Formulario firmado (correo/fax/escaneo) | Alta, lenta | Bajo coste, alto coste operativo | FTC enumerated [9] | No — demasiado lento para la incorporación |
| Microcargo con tarjeta de crédito/débito | Media — requiere una tarjeta | Tarifa del procesador + riesgo de fraude | FTC enumerated [9] | Solo si MC cobra una suscripción |
| Número gratuito, personal formado | Alta — personal real | Alta (laboral) | FTC enumerated [9] | No — no viable a escala PWA |
| Videoconferencia, personal formado | Alta — programación | Alta (laboral) | FTC enumerated [9] | No |
| Documento de identidad gubernamental + coincidencia de foto en vivo (FMVPI) | Media-alta | Tarifa del proveedor (no verificado) | FTC‑approved 2015 [9][10] | No — desproporcionado para una aplicación de matemáticas |
| Estimación facial de edad (Yoti/k‑ID/PRIVO) | Baja-media, segundos | Tarifa del proveedor (no verificado) | FTC‑approved via §312.12 (2023) [9][11] | No necesario para “¿es este un padre?”; relevante solo para futuros filtros de chat/banda de edad |
| Correo electrónico + clic | Baja | Casi nula | Lower COPPA bar (internal use only) | Buena capa base combinada con filtro solo para padres |
| Creación de cuenta con filtro de padre, sin auto‑registro del niño | Baja para el padre, cero para el niño | Casi nula | Elude VPC — el desencadenante de consentimiento es la recogida de datos personales *de un niño*, lo que nunca ocurre aquí | **Patrón principal recomendado** — coincide con Apple/Google/Microsoft/Prodigy |
| Credencial de edad reutilizable (k‑ID AgeKey, rango de edad declarado por Apple) | Muy baja tras la primera comprobación | Amortizado | Emergente; no es en sí un método VPC | Monitorizar, no necesario en el MVP |

## Implicaciones de diseño para Math Challenge

1. Tres entidades: `Parent` (credenciales, correo verificado), `ChildProfile` (pertenece a un único padre, sin credenciales independientes por defecto), `Teacher` (credenciales, crea `Classroom`). Un `Classroom` contiene muchas referencias a `ChildProfile`, cada una con su propio registro de autorización por padre — refleja la identidad infantil centrada en el aula de Prodigy más la vinculación de la cuenta del padre [8], y el flujo de unión mediante código de Google Classroom [12].

2. Nunca auto‑registro del niño — coincide con el diseño decidido y con Apple/Google/Microsoft [1][4][5]. Dado que el niño nunca proporciona datos personales de forma independiente, esto se sitúa en la fila más ligera de “creación con filtro de padre”, no en una ceremonia completa de VPC de COPPA por niño.

3. Inicio de sesión del niño en una tablet compartida, en menos de 5 segundos, sin lectura: cuadrícula de avatares (icono/color elegido por el padre) + teclado numérico de 4 dígitos, sin teclado físico — reproduce la anulación de PIN de Nintendo [6] y el Bloqueo de Perfil de Netflix, adaptado para prelectores; más rápido y más independiente del dispositivo que QR o biometría.

4. Acceso rápido “último perfil” vinculado al dispositivo: en un dispositivo personal, recuerda el último perfil usado y pasa directamente a “tocar para continuar”, recurriendo a la cuadrícula de avatares solo cuando se detecta un segundo perfil — mantiene el caso habitual de un niño por tablet con aproximadamente 1 toque.

5. PIN del padre, separado de los PIN de los niños, para acceder a la configuración de la cuenta, añadir/eliminar niños o aprobar la unión a un aula — con la misma forma que el PIN de anulación de Nintendo [6] y el Bloqueo de Perfil de Netflix, aplicado para proteger acciones exclusivas del padre.

6. Los profesores invitan mediante código de aula, no mediante búsqueda de correo: un código de 6 caracteres (evitando 0/O, 1/I) mostrado como texto/enlace/QR — refleja Google Classroom [12] y el PIN de Kahoot, pero a diferencia de la sesión efímera de Kahoot, debe persistir y estar condicionado a la aprobación del padre.

7. La unión a un aula es un apretón de manos en dos pasos: (a) el padre añade el código desde su propio panel, nunca desde el dispositivo del niño; (b) el estado pasa a pendiente o activo según el modelo de confianza; (c) el padre siempre conserva un control de “Eliminar del aula”, cumpliendo que “cualquier padre puede retirar a su hijo en cualquier momento”.

8. Modelar la autorización como una tabla de unión, no como un booleano: `ClassroomMembership(child_profile_id, classroom_id, parent_id, status: pending|approved|revoked, approved_at, revoked_at)` — un registro de auditoría gratuito si surge alguna disputa de consentimiento.

9. Lógica de banda de edad basada en la edad declarada por el padre, no en una fecha de nacimiento introducida por el niño: almacenar `birth_year_month` en `ChildProfile`, introducido una sola vez por el padre; derivar “menor de 13”/“13 o más” solo en el servidor — refleja la filosofía del Rango de Edad Declarado de Apple de exponer una categoría, no una fecha [2][3].

10. A los 13 años: no es una barrera rígida para una aplicación que recoge datos personales mínimos, pero definir un evento (`child_profile.crossed_13`) que deje de tratar el perfil como “niño” para cualquier práctica futura relevante a COPPA (chat, análisis de marketing) y, opcionalmente, ofrezca al padre un aviso de conversión de cuenta. Modelar la conversión como iniciada por el padre, no automática — el patrón de graduación al alcanzar la edad de consentimiento de Google/Microsoft existe [4][5], pero los mecanismos exactos no fueron confirmados de forma independiente en esta sesión, así que no los reproduzcas a ciegas.

11. A los 18 años (o mayoría local): ofrecer un flujo explícito de “convertir a cuenta independiente” que requiera al usuario ya adulto establecer sus propias credenciales, tras lo cual el perfil se separa y el padre pierde la visibilidad por defecto — la forma general coincide con las salidas de grupos familiares de Apple/Google/Microsoft, aunque ninguna de las fuentes de esta sesión proporcionó un mecanismo preciso; validar con la documentación actual antes de implementar.

12. No desarrollar estimación facial de edad ni consentimiento mediante documento de identidad gubernamental para el MVP. El diseño decidido ya protege todos los datos del niño detrás de una cuenta de padre registrada, por lo que la exposición se asemeja más a “correo electrónico + creación con filtro de padre” que a un operador COPPA que recoge datos personales de un niño sin supervisión. Revisar solo si una futura característica permite al niño proporcionar datos personales a un tercero (p. ej., una tabla de clasificación pública con nombre real) o permite al niño iniciar la creación de cuenta sin supervisión.

13. Reservar la vía §312.12/puerto seguro solo si el asesor legal determina que se aplica plenamente la VPC de COPPA — Netflix, Disney+ y Nintendo utilizan perfiles en lugar de cuentas específicamente para evitar ser un “operador que recoge datos personales de un niño” bajo COPPA; el modelo de Math Challenge donde el padre crea el perfil debería aspirar a la misma forma legal.

14. La gestión de listas Clever/ClassLink es fase 2+, no MVP: resuelve la importación masiva desde SIS y SSO, relevante solo cuando Math Challenge cuente con clientes institucionales/distritales; el modelo de código de aula (punto 6) es suficiente para arrancar, coincidiendo con el modo de funcionamiento de Kahoot y Google Classroom antes de que exista cualquier integración SIS.

## Preguntas abiertas para el responsable del proyecto

1. ¿Debe el “PIN del padre para salir del modo infantil” compartirse entre todos los hijos del padre, o ser por hijo?  
2. ¿Debe la unión a un aula requerir también la confirmación del profesor (apretón de manos bidireccional), o basta con la aprobación del padre?  
3. A los 13 años, ¿debe Math Challenge incitar proactivamente a la conversión de cuenta, o dejarlo indefinidamente hasta que el usuario/padre lo inicie?  
4. ¿Alguna característica prevista (chat, tabla de clasificación con nombre real, contenido generado por usuarios) podría elevar el nivel de COPPA/VPC más allá de la “creación de perfil con filtro de padre”, lo que modificaría la validez de los puntos 12‑13?  
5. ¿Deben las tablets compartidas en el aula soportar varios niños mediante la cuadrícula de avatar+PIN, o se asume una tablet por niño para el despliegue inicial?

## Fuentes

1. Apple Support — Visión general de Family Sharing: https://support.apple.com/en-us/105121  
2. Apple Developer — Documentación de Declared Age Range: https://developer.apple.com/documentation/declaredagerange  
3. Apple Developer — Soporte/Preguntas y respuestas de Age assurance: https://developer.apple.com/support/age-assurance  
4. Google Support — Family Link, configurar la cuenta de un menor: https://support.google.com/families/answer/7101025  
5. Microsoft — Visión general del producto Family Safety: https://www.microsoft.com/en-us/microsoft-365/family-safety  
6. Nintendo — Controles parentales de Switch: https://www.nintendo.com/us/switch/parental-controls/  
7. Wikipedia — Roblox (historia de verificación de edad y controles parentales, Nov 2024 / Dec 2025–Jan 2026 rollout, Persona vendor): https://en.wikipedia.org/wiki/Roblox  
8. Prodigy — Página de destino para padres (Membership/parent dashboard): https://webflow.prodigygame.com/main-en/parents  
9. FTC — Cumplir con COPPA: Preguntas frecuentes (safe‑harbor programs, enumerated VPC methods): https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions  
10. Wikipedia — Children's Online Privacy Protection Act (FMVPI approval Nov 19, 2015; COPPA 2,0 legislative status): https://en.wikipedia.org/wiki/Children%27s_Online_Privacy_Protection_Act  
11. k-ID — Visión general de la empresa/producto (AgeKit, AgeKit+, Family Connect, AgeKey, neimo): https://www.k-id.com/  
12. Google Support — Unirse a una clase con un código de clase: https://support.google.com/edu/classroom/answer/6020282  
13. Wikipedia — Clever (empresa): https://en.wikipedia.org/wiki/Clever_(company)  
14. Wikipedia — Kahoot! (PIN del juego, registro de anfitrión vs. jugador): https://en.wikipedia.org/wiki/Kahoot!  
15. Wikipedia — Family Sharing (Apple) referencia cruzada: https://en.wikipedia.org/wiki/Family_Sharing  

**Nota de verificación**: varias páginas oficiales de proveedores (ftc.gov, xbox.com, yoti.com, help.netflix.com, help.disneyplus.com, centro de ayuda de controles parentales de Roblox) devolvieron HTTP 403/404 a la extracción automatizada en esta sesión (bloqueo de bots o rutas obsoletas). Las afirmaciones basadas únicamente en Wikipedia o conocimientos generales están marcadas como tales en línea y deben volver a verificarse contra la página primaria del proveedor o regulador antes de utilizarlas para decisiones legales o de cumplimiento.
