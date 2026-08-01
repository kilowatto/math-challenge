#!/usr/bin/env node
// Escribe el cuerpo detallado de cada fase en el proyecto de GitHub.
//
//   node scripts/detallar-proyecto.mjs [numero-de-proyecto]
//
// Por qué el detalle vive aquí y no solo en el master-plan: el master-plan
// explica el proyecto a una persona que llega de cero; esto le dice a quien va
// a construir la fase **cómo sabrá que terminó**. Son dos documentos distintos
// con dos lectores distintos, y confundirlos fue lo que dejó a F0 "cerrada"
// cuando no lo estaba — hasta que alguien preguntó y hubo que comprobar
// criterio por criterio.
//
// Regla de redacción: **todo criterio de aceptación tiene que poder correrse o
// mirarse.** "PWA instalable" no es criterio; "audits/pwa-installable.mjs pasa"
// sí. Si un criterio no se puede verificar, es una intención.
//
// Idempotente: se puede volver a correr tras editar la tabla.

import { execFileSync } from "node:child_process";

const proyecto = process.argv[2] ?? "1";
const DUENO = "kilowatto";
const gh = (...a) => execFileSync("gh", a, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });

const D = (s) => s.trim();

const CUERPOS = {
  "S0": D(`
**Vía:** Sitio abierto · **Depende de:** nada — puede arrancar hoy
**Decisiones:** D-033 · **Investigación:** mc-48

### Qué queda funcionando
El esqueleto de math.kilowatto.com como sitio público: rutas en los 7 locales,
hreflang recíproco con auto-referencia y x-default, JSON-LD por página, y el
aviso de que el proyecto es de código abierto con enlace al repo.

### Criterios de aceptación — todos verificables
- [ ] \`audits/hreflang-recip.mjs\` pasa: los 7 locales + x-default, recíprocos
- [ ] \`audits/jsonld-valid.mjs\` pasa y el JSON-LD **coincide con lo visible**
      (si no coincide, Google ignora el marcado entero — mc-48)
- [ ] Cero peticiones a terceros (verificable en \`audits/live.mjs\`)
- [ ] LCP ≤2.5s / CLS ≤0.1 / INP ≤150ms en Android de gama baja sobre 4G lento
- [ ] Enlace visible a github.com/kilowatto/math-challenge en cada página

### Qué NO incluye
El corpus de investigación (S1) ni la página de origen (S2).

### Auditoría de cierre — decisión del dueño
Al terminar esta fase se corre **la flota entera**, no solo los auditores a los que
les toca por alcance:

\`\`\`
node audits/adversarial.mjs --todos
node audits/adversarial/subir-sarif.mjs
\`\`\`

Por qué \`--todos\` y no la corrida normal: por defecto solo despierta el auditor que
tiene algo que revisar, y eso es correcto en el día a día. **Al cerrar una fase la
pregunta es otra** — no "¿qué toca este diff?" sino "¿esta fase entera aguanta a la
flota entera?". Un auditor dormido es un área sin revisar que nadie declaró, y ese
fue exactamente el error de F0: cerrada con un criterio sin verificar.

Cuesta ~$1.30 y ~15 min. Un cierre de fase al mes lo justifica; cada commit no.
`),
  "S1": D(`
**Vía:** Sitio abierto · **Depende de:** S0
**Decisiones:** D-033 · **Investigación:** mc-48

### Qué queda funcionando
Las 47 investigaciones publicadas e indexables, **con las que contradicen al
producto incluidas**. Esa es la decisión, no un descuido: mc-48 documenta que
la investigación original es el activo de contenido de mayor valor y 2.3× más
probable de ser citada en AI Overviews — y la credibilidad viene de publicar
también lo que incomoda.

### Criterios de aceptación
- [ ] 47 documentos con URL propia, indexable, en los locales que decida el dueño
- [ ] Cada uno con fuentes, limitaciones y marcas \`[unverified]\` **visibles**
- [ ] JSON-LD tipo ScholarlyArticle o Article, coincidente con la página
- [ ] Los pasajes que contradicen decisiones del producto salen publicados
- [ ] Autor firmado (T abierta: quién firma la investigación)

### Riesgo conocido
Publicar en 7 locales multiplica por 7 el trabajo de traducción de ~157,000
palabras. Decidir si son 7 o 2 antes de empezar.

### Auditoría de cierre — decisión del dueño
Al terminar esta fase se corre **la flota entera**, no solo los auditores a los que
les toca por alcance:

\`\`\`
node audits/adversarial.mjs --todos
node audits/adversarial/subir-sarif.mjs
\`\`\`

Por qué \`--todos\` y no la corrida normal: por defecto solo despierta el auditor que
tiene algo que revisar, y eso es correcto en el día a día. **Al cerrar una fase la
pregunta es otra** — no "¿qué toca este diff?" sino "¿esta fase entera aguanta a la
flota entera?". Un auditor dormido es un área sin revisar que nadie declaró, y ese
fue exactamente el error de F0: cerrada con un criterio sin verificar.

Cuesta ~$1.30 y ~15 min. Un cierre de fase al mes lo justifica; cada commit no.
`),
  "S2": D(`
**Vía:** Sitio abierto · **Depende de:** S0
**Decisiones:** D-033

### Qué queda funcionando
La página de origen desde \`docs/por-que-existe.md\`, los 12 niveles explicados,
el propósito, y la arquitectura técnica atribuida a **Ignia sobre Cloudflare**.

### Criterios de aceptación
- [ ] Página de origen publicada, conservando la palabra "adictivo" y lo que la
      investigación le hizo — es lo que hace creíble el resto
- [ ] Los 12 niveles explicados sin nombres de grado escolar (mc-15: las
      fracciones se introducen entre los 6 y 9 años según el país)
- [ ] Atribución "Un proyecto de Ignia, sobre Cloudflare" con enlace a ignia.cloud
- [ ] **Sección de código abierto**: qué licencia, qué se puede reusar, cómo
      contribuir, y enlace al tablero público del plan

### Auditoría de cierre — decisión del dueño
Al terminar esta fase se corre **la flota entera**, no solo los auditores a los que
les toca por alcance:

\`\`\`
node audits/adversarial.mjs --todos
node audits/adversarial/subir-sarif.mjs
\`\`\`

Por qué \`--todos\` y no la corrida normal: por defecto solo despierta el auditor que
tiene algo que revisar, y eso es correcto en el día a día. **Al cerrar una fase la
pregunta es otra** — no "¿qué toca este diff?" sino "¿esta fase entera aguanta a la
flota entera?". Un auditor dormido es un área sin revisar que nadie declaró, y ese
fue exactamente el error de F0: cerrada con un criterio sin verificar.

Cuesta ~$1.30 y ~15 min. Un cierre de fase al mes lo justifica; cada commit no.
`),
  "F0": D(`
**Vía:** Producto · **CERRADA** ✅
**Decisiones:** D-022, D-023, D-030

### Verificado, no afirmado
\`node audits/live.mjs\` → 21 comprobaciones en vivo:
- Worker en math.kilowatto.com, 7 rutas de locale respondiendo 200
- D1 \`math-challenge-db\` con 11 tablas
- Cero peticiones a terceros · hreflang recíproco + x-default
- HTTP/3 (\`alt-svc: h3=":443"\`) **y 0-RTT** (max early data 14336)
- RPC nativo web→ingest→D1 probado en vivo
- 7 auditores deterministas bloqueando en gancho pre-commit
- Página más pesada: 2.1 KB gz

### Lección que dejó
Estuvo marcada "cerrada" con el 0-RTT sin verificar, y solo salió al preguntar
"¿ahora sí está cerrado?". **Una fase no se cierra por criterio propio; se
cierra corriendo sus criterios.**
`),
  "F1": D(`
**Vía:** Producto · **Depende de:** F0 · **CERRADA** ✅
**Decisiones:** D-032, D-035 · **Investigación:** mc-47 §7

### Los 23 auditores, corriendo
Sobre Workers AI (\`kimi-k2.6\` → \`gpt-oss-120b\`), sin CI. Se corren a mano
antes de abrir el PR: \`node audits/adversarial.mjs\`.

Corrida real de cierre: **23 auditores, 0 errores, ~$1.29, ~15 min.**
3 bloquean · 22 reportan · 2 descartados por la regla 1.

### Las dos reglas de D-032, en código y ejercidas
**Regla 1 — citar la decisión.** Tres capas, todas deterministas:
1. \`citas.mjs\` — la cita existe en el repo. Atrapó \`D-036\`, que yo inventé.
2. La cita está **en la carta de ese auditor**. En la corrida real descartó a
   \`anti-trampa\` citando \`LR-3\`: existe, pero no es suya.
3. \`evidencia.mjs\` — **la evidencia citada existe de verdad.** Nació de que un
   auditor citó D-022 (real) y afirmó ver \`"versión"\` donde el archivo dice
   \`"versão"\`. Cita válida, evidencia inventada, veredicto bloqueante.

**Regla 2 — anular por escrito.** Ejercida sobre los 3 bloqueantes reales de la
corrida de cierre: **0 bloquean, 3 anuladas**, cada una con su razón en
\`ANULACIONES.md\`. Al hacerlo salió un defecto: la huella usaba el campo
\`archivo\` crudo, y el modelo escribió ahí dos rutas separadas por coma — una
anulación que no empareja es un mecanismo roto sin avisar. Corregido.

### SARIF 2.1.0 → GitHub code scanning
25 alertas vivas, ancladas a \`archivo:línea\`, con \`D-0nn\`/\`mc-nn\` como
identificadores de regla y \`helpUri\` al documento. Subido por API REST, **sin
GitHub Actions**. Validado contra el esquema oficial de OASIS en cada corrida —
así se detectaron dos defectos que 20 pruebas escritas a mano no podían ver.

Los 22 hallazgos de seguimiento están en Issues, etiquetados por auditor.

### Criterios de cierre
- [x] Segundo filtro determinista de evidencia, probado contra el caso real
- [x] Anulación ejercida de punta a punta sobre bloqueantes reales
- [x] SARIF real subido y procesado: 25 alertas en code scanning
- [x] 61 comprobaciones sin gastar una llamada · pipeline completo en el gancho

### Lo que la flota NO puede hacer, medido
Un auditor que **parafrasea** en vez de citar no deja cadenas que verificar y
pasa sin comprobación. Se detecta la fabricación literal, no la interpretación
equivocada — el mismo \`locale-pt-PT\` afirmó que el portugués europeo no
antepone artículo a nombres propios, cuando es al revés. Eso no tiene arreglo
determinista, y por eso **ningún veredicto de la flota se aplica sin leerlo**.

### Criterio retirado, porque estaba mal especificado
"Caché de prefijo por encima del 7%" no era un defecto: la constitución
compartida son ~1,836 tokens de un turno medio de ~34,000. El 7% es la
aritmética, no una falla.
`),
  "F2": D(`
**Vía:** Producto · **Depende de:** F0 · **T-5 en ruta crítica** (enmienda a D-009)
**Decisiones:** D-011, D-012, D-013, D-026, D-038, D-040, D-017, D-031, D-036, D-041, D-037
**Investigación:** mc-25, mc-27, mc-45, mc-20, mc-21, mc-22, mc-23, mc-34
**Plan de archivo ya escrito:** \`docs/planes/f2-cuentas-onboarding.md\` — esta fase
lo **construye**, no lo rediseña. Los 22 criterios de abajo son ese plan
convertido en unidades cerrables.

### Qué queda funcionando
Las tres puertas de registro de **2 campos** (adulto, papá, maestro), perfiles de
hijo con año y mes, entrada del niño con avatar + PIN de imágenes sin teclado, la
identidad declarada del maestro **antes** de que exista una ruta que cree salón, y
el mecanismo completo de las cinco marcas contextuales (sin carrusel — D-026).

### Las tres líneas rojas que esta fase puede cruzar sin querer
No son avisos: son restricciones de diseño, y cada una tiene abajo su propio
criterio verificable. **#2** el niño nunca es un usuario — es un perfil dentro de
la cuenta del padre, sin nombre real, correo, foto ni fecha exacta (solo año y
mes). **#3** ningún niño escribe texto libre, en ninguna superficie. **#4** nunca
se cobra por dejar que un niño practique.

### Criterios de aceptación — todos verificables

**Los auditores primero: es lo que hace que el código nazca cumpliendo.**
- [ ] \`audits/child-free-text.mjs\` **aprende dos cosas que hoy no ve** (línea
      roja #3): \`ALTER TABLE <tabla_de_niño> ADD COLUMN\` —hoy solo parsea
      cuerpos de \`CREATE TABLE\`, y F2 es la primera fase que agrega una tercera
      migración tocando tablas de niño— y el árbol de \`app/kids/**\`,
      \`components/kids/**\` y \`KidShell.astro\`, donde falla ante cualquier
      \`<input>\` que no sea \`hidden\`, cualquier \`<textarea>\` y cualquier
      \`contenteditable\`. **Se le ve fallar antes** con una columna plantada por
      \`ALTER\` y un \`<input type="text">\` plantado bajo \`kids/\`, y la salida se
      pega en el PR (regla 3 de CLAUDE.md)
**El esquema y las tres puertas.**
- [ ] **\`migrations/0003_accounts_onboarding.sql\` aplicada en local y remoto**,
      con \`audits/migration-safety.mjs\` en verde (F2 es "cuando haya más de una"):
      \`country\`, \`timezone\`, \`data_region\` y \`signup_intent\` en \`users\` —las
      cuatro **derivadas de la petición, ninguna preguntada**, el formulario
      sigue teniendo dos campos—, \`consent_type_catalog\` con su trigger
      \`RAISE(ABORT)\` **visto abortar** ante un tipo desconocido, el índice
      parcial de consentimiento por niño, y \`bedtime_local\` en
      \`screen_time_settings\` (sin la hora de dormir, el corte nocturno de D-016
      no se puede calcular). Renglón en la bitácora de \`docs/infrastructure.md\`
      en el **mismo PR**
- [ ] **Ninguna tabla de niño guarda nombre real, correo, foto ni fecha exacta —
      solo año y mes** (línea roja #2, D-013). \`0003\` no le agrega a
      \`child_profiles\` ni una columna, solo el índice único de alias por padre.
      **Auditor que falta: \`audits/child-pii.mjs\`.** \`child-free-text\` busca
      TEXT sin dominio acotado y **no cazaría** un \`birth_date INTEGER\` ni un
      \`photo_url TEXT\` con un CHECK tonto; este prohíbe **por nombre** en
      \`child_profiles\`, \`child_image_pin\`, \`skill_state\` y toda tabla de niño
      nueva \`name|nombre|email|correo|mail|photo|foto|picture|avatar_url|birth_date|birthday|dob|day|phone|tel|address\`,
      con lista blanca explícita de \`alias\`, \`avatar_parts\`, \`birth_year\` y
      \`birth_month\`. Visto fallar contra un \`birth_date\` plantado
- [ ] **Registro en 2 campos, sin carrusel** (D-026), con las tres puertas
      compartiendo **exactamente el mismo formulario**: lo que cambia es dónde
      aterriza el usuario, no cuántos campos llena. Bajar de 4 campos a 3 subió
      la conversión ~50% en 40,000 formularios de HubSpot y el despeñadero está
      entre 5 y 7 (mc-45). **Ninguna casilla preseleccionada y ninguna de
      marketing en esta pantalla.** **Auditor que falta:
      \`audits/signup-two-fields.mjs\`**, que falla si la ruta de registro tiene
      más de dos \`<input>\` visibles (excluyendo \`hidden\`, \`submit\`, \`button\` y
      el token de Turnstile) o si aparece cualquier carrusel
      (\`carousel|slider|swiper|onboarding-slide|step-1-of\`) en el árbol de
      \`app/\` — NN/g lo desaconseja **por nombre** y midió que no mejora el
      desempeño en la tarea
- [ ] **Passkey primero, contraseña de respaldo** (D-038): \`user_passkeys\` es el
      camino principal y \`user_password\` existe porque el mercado objetivo
      incluye Android de gama baja donde el autenticador falla o no está. El
      hash es **PBKDF2 por WebCrypto** —Argon2id no corre nativo en Workers sin
      WASM— y **el costo de CPU de las iteraciones se mide dentro del límite del
      Worker antes de fijar el número**; hoy nadie lo ha medido. **La cita falsa
      de \`0001_identity.sql:6\` se corrige a D-038 en este PR**: decía D-035, que
      es "Workers AI como proveedor de inferencia"
- [ ] **Sesiones: tres cookies opacas, ninguna con datos adentro.** \`mc_s\`
      (adulto, KV, 30 días), \`mc_h\` (dispositivo del hogar, D1, 400 días) y
      \`mc_k\` (perfil de niño activo, KV, 12 h). Las tres \`HttpOnly; Secure;
      SameSite=Lax\`. Un token opaco que indexa KV no filtra nada si alguien lee
      la cookie, y mc-25 impl. 6 —nada de perfilado sobre menores— es más fácil
      de sostener cuando no hay payload que perfilar. **Auditor que falta:**
      ampliación de \`audits/live.mjs\` que lea los \`Set-Cookie\` reales tras
      desplegar y falle si alguno lleva payload decodificable. **En la misma
      unidad, los objetos que las sostienen:**
      \`math-challenge-turnstile-signup\` y \`math-challenge-ratelimiter-do\` ya
      están inventariados pero **no creados**; \`math-challenge-funnel-ae\` es
      **objeto nuevo** y sube el inventario de 27 a 28. Los tres con su renglón
      en \`docs/infrastructure.md\` en el mismo PR, y \`audits/cf-prefix.mjs\` en
      verde con el inventario actualizado. Turnstile es defensa de bots sobre un
      formulario público — **no verificación de edad ni biometría**, no roza la
      línea roja #1
- [ ] **Puerta del padre: año y mes en dos \`<select>\`, jamás un selector de
      fecha** (línea roja #2). Un \`<input type="date">\` *tiene* día, y el día no
      se pide; queda prohibido por auditor en esa ruta. \`theme_band\` se
      **deriva** de la edad y se muestra ya elegida, movible dentro de un rango
      (D-002 y D-017: edad y dificultad son ejes separados). Cada paso de
      configuración es **saltable con "Ahora no"** y trae default sano. Se
      inserta \`consent_records\` con \`consent_type='child_profile_creation'\` y
      \`child_profile_id\` lleno — **esa fila es lo que hace auditable la posición
      de D-013**
- [ ] **Alias generados por locale, autorados y no traducidos** (D-003, mc-34):
      siete listas más siete listas de bloqueo, con validación de la **cadena
      combinada** —"Pato"+"Loco" puede ser inocente por separado y no serlo
      junto, y eso cambia entre \`es-MX\` y \`es-ES\`— y sufijo numérico
      **aleatorio, nunca secuencial**: \`Conejo07\` no debe delatar el orden de
      registro. **Auditor que falta:** ampliación de \`locales-complete.mjs\` con
      umbral de similitud entre pares de locales (>80% de entradas iguales
      falla), porque el modo de falla real no es olvidar un idioma sino **copiar
      \`es-ES\` en \`es-MX\`**
- [ ] **El niño entra sin escribir** (línea roja #3, D-012): rejilla de avatares
      operable **sin leer** —alias debajo como apoyo, no como requisito— y PIN de
      3 imágenes de 9, tocadas en orden. Las 9 se **derivan** con
      \`HKDF(PIN_PAD_SECRET, child_profile_id)\`, no se guardan: así el esquema no
      crece con una columna JSON en una tabla de niño y no hay que anular
      \`child-free-text\` para meterla. **Nunca hay bloqueo**: tras 5 fallos se
      vuelve a la rejilla con 30 s de espera, sin pantalla punitiva, sin mensaje
      de culpa, y sin impedir que otro perfil juegue mientras tanto
- [ ] **\`household_devices\`: D-012 convertido en una fila.** \`/app/kids\` **no
      renderiza una sola cara** si el dispositivo no trae \`mc_h\` válido y no
      revocado; si no lo trae, redirige a \`/app/signin\` — **nunca a un
      formulario dirigido a un niño**. Es lo que D-012 llama "la protección real
      contra un extraño la da el dispositivo vinculado al hogar", vuelto
      condición evaluable
- [ ] **La verificación previa del maestro, que es criterio de F2 y no de F9**
      (enmienda a D-009: T-5 sube a ruta crítica y el MVP no sale sin resolver
      quién verifica al adulto que abre un salón). La tabla se llama
      \`group_owner_identity\` y **no \`teacher_verification\`**, porque este
      producto no verifica que nadie sea maestro: \`assurance='declared'\`
      significa *lo escribió esta persona y nadie lo comprobó*, y **se le muestra
      al padre tal cual**, que es la insignia de "sin verificar" de D-027. Sirve
      igual al maestro (D-011) y al papá que abre club (D-027) — la misma barra.
      El teléfono queda con \`phone_verified_at\` NULL: **Cloudflare no ofrece
      SMS** y no hay proveedor decidido.
      **Y el gate no es un \`if\`:** un \`if\` al principio de una función se
      olvida de agregar en la segunda ruta que crea salones. El gate produce un
      **tipo de marca**
      (\`OwnerProof\`) que solo \`assertCanOwnChildGroup\` puede fabricar, y en F9
      \`createChildGroup(proof: OwnerProof, …)\` no compila sin él. **La
      comprobación es \`pnpm typecheck\`**, que ya existe, y se le ve fallar con
      una llamada plantada sin proof
- [ ] **El tablero global es opt-in por hijo** (D-040): al crear el perfil **no
      se inserta** la fila \`global_leaderboard\`; se inserta cuando el padre lo
      enciende, registrando quién, cuándo y qué se comparte. Ausencia de fila =
      **no otorgado**. Un alias sigue siendo dato personal mientras nosotros
      guardemos el mapeo alias→identidad (GDPR recital 26): "anónimo hacia
      afuera" no es "anónimo"
- [ ] **El tope de perfiles nunca detiene la práctica** (línea roja #4, D-021).
      El tope vive como bandera en \`CONFIG_KV\` (\`max_child_profiles_free\`) y se
      queda en **6** mientras F8 no tenga Stripe, para que el camino de código
      exista y el número sea configurable. Dos reglas cuando entre en vigor: el
      tope **jamás** detiene a un perfil que ya existe, y el límite se muestra
      **antes** de que el padre llene el formulario — mostrar el costo tarde es
      el patrón oscuro que \`patrones-oscuros\` caza por carta
- [ ] **Las cinco marcas contextuales: mecanismo completo, dos disparadas.**
      Tabla, componente, ruta de descarte y textos en los siete locales para las
      cinco; se disparan \`age-vs-difficulty\` y \`profile-not-user\` en
      \`setup/child\`. Las otras tres viven en F4, F9 y F10 y **F2 no las puede
      encender** — decirlo importa porque "las cinco marcas" en verde sería una
      aserción en tono seguro que no se puede re-ejecutar. \`onboarding_marks\`
      **no tiene columna \`shown_count\` ni \`last_shown\`**, y eso es el diseño:
      sin contador, el *nagging* que la FTC nombra (mc-17) no tiene dónde
      aterrizar. Una marca se ve **inequívocamente como anotación y no como
      control** (mc-45): sin fondo elevado, sin borde de botón, sin el naranja
      como fondo, y con la "×" como único elemento tocable
- [ ] **El embudo mide al adulto, y declara por qué no alcanza a un niño**
      (D-037). Se escribe **desde el servidor**, en el Worker: nada de
      \`navigator.sendBeacon\` ni \`PerformanceObserver\`, los dos patrones que
      \`telemetria-infantil.mjs\` caza. **Nunca un identificador de niño en el
      embudo** — "primer reto terminado" se registra como evento del adulto. El
      beacon de Web Analytics va en \`AppShell.astro\` y **jamás** en
      \`KidShell.astro\`. F2 es la primera fase que crea rutas que
      \`SUPERFICIES_DE_NINO\` reconoce: hasta hoy ese auditor vigilaba un conjunto
      vacío

### Criterios que aportó la flota (issues #17-#22, cerrados aquí)
El auditor \`ux-banda\` levantó seis sobre \`Base.astro\`. Son ciertos y llegaban
antes de tiempo: no hay interfaz de niño que adaptar hasta esta fase.

- [ ] **La interfaz varía por banda de edad — los 5 temas visuales de D-017**,
      como cinco \`band-*.css\` que **sobrescriben tokens**, no cinco hojas
      completas. \`data-band\` sale del perfil activo **en el servidor, nunca de
      JS**: estas rutas ya son \`prerender = false\`. \`touch-targets\` y
      \`band-typography\` leen los cinco y **fallan si falta uno**
- [ ] **Blancos táctiles: 24px WCAG / 44px HIG / 88px kinder** (\`mc-20\`: 23.7 mm
      para 90% de acierto a los 4 años; \`mc-38\`), verificados por
      \`audits/touch-targets.mjs\` **por banda**, leyendo \`--tap-min\` de cada
      \`band-*.css\`. **Los 88 px no se relajan en iPad** porque haya más pantalla
      (D-041)
- [ ] **Tema oscuro para adolescentes y adultos** (\`mc-22\`, \`mc-23\`), y
      \`data-theme\` **gana sobre \`prefers-color-scheme\` en las dos
      direcciones** — hoy \`tokens.css\` solo tiene
      \`@media (prefers-color-scheme: dark)\` y le faltan las dos anulaciones
      \`:root[data-theme="dark"]\` y \`:root[data-theme="light"]\`. Sin ellas, las
      bandas SECUNDARIA/SERIO/PRO no pueden ser oscuras por defecto con el
      sistema en claro. \`audits/contrast.mjs\` corre **dos veces**, en claro y en
      oscuro
- [ ] **Tipografía diferenciada KINDER vs PRIMARIA** (\`mc-21\`) — y en KINDER
      **nunca Light**: \`mc-20\` exige alto grosor de trazo de 3 a 6 años.
      **Auditor que falta: \`audits/band-typography.mjs\`**, que falla si
      \`band-kinder.css\` define cualquier \`font-weight\` menor a 500, si no fija
      los controles a \`var(--font-marca)\` —la excepción de kinder que D-036
      manda sobre su propia tabla— o si los numerales caen por debajo de 24 px.
      Cierra lo que \`guia-de-estilo.md\` dejó pendiente por escrito
- [ ] **El naranja de Ignia nunca como texto normal sobre claro**: \`#F36B1C\` da
      **3.03:1**, por debajo del 4.5:1 de WCAG. Solo títulos grandes, botones y
      gráficos. \`audits/brand-image.mjs\` ya lo recuerda en cada commit;
      \`audits/contrast.mjs\` lo comprueba **en pantalla**, que es distinto
- [ ] **Adaptación por plataforma y por banda a la vez** (D-031 + D-017 + D-041),
      con la tipografía repartida según D-036 —marca en Raleway, controles en la
      voz del sistema—. \`data-platform\` sale del *client hint*
      \`Sec-CH-UA-Platform\` leído en el Worker, con respaldo CSS para iOS Safari;
      **el soporte de \`Critical-CH\` en el borde de Cloudflare no está verificado
      y se comprueba con \`curl -I\` en el primer despliegue de F2**. Requiere
      además **agregar \`D-036\` al arreglo \`cita\` de la carta de \`ux-banda\`**
      (\`audits/adversarial/cartas.mjs\`): hoy no lo autoriza, y \`citas.mjs\`
      tiraría a la basura un hallazgo correcto suyo sobre tipografía
- [ ] **Los cuatro auditores que esperaban esta fase pasan de \`PENDING\` a
      \`ACTIVE\` en \`audits/run.mjs\` y bloquean en el gancho**: \`axe-a11y\`,
      \`contrast\`, \`touch-targets\` y \`migration-safety\`. Más
      \`audits/ipad-usabilidad.mjs\` en verde sobre la interfaz nueva, en
      **horizontal y en vertical** — D-041 no bloquea la orientación, así que el
      auditor comprueba las dos

### Qué NO incluye — dicho antes de que alguien lo suponga
- **El criterio de \`classroom_membership\` no se cierra aquí.** El tablero pedía
  en F2 que cada membresía guarde quién aprobó, cuándo y qué se comparte; esa
  tabla es de **F9** (\`0001\` dice que grupos y clubs van en sus propias
  migraciones). F2 cierra la mitad que sí le toca: \`group_owner_identity\` y el
  gate. El criterio se movió a F9 en vez de fingirse cumplido
- **Tres de las cinco marcas no se disparan.** El mecanismo queda completo; los
  disparadores son F4, F9 y F10
- **El botón "Empezar" del adulto no lleva a una pregunta.** No hay motor de reto
  hasta F3 ni franja adulta hasta F5b. F2 aterriza en un panel honesto
- **No hay componentes nativos por plataforma**, solo tokens, tipografía, insets
  y radios. La barra de Material 3 contra la *tab bar* de HIG es un componente
  distinto, no un token distinto: F3 en adelante
- **No hay residencia de datos europea.** \`data_region\` registra la intención en
  el único momento en que se puede tomar la decisión —el registro—; la segunda
  base D1 no existe y la jurisdicción se fija al crear
- **T-5 no se cierra, se acota.** F2 escribe \`assurance='declared'\` y se lo
  muestra al padre; **nadie verifica que el adulto sea maestro**
- **El INP ≤150 ms de D-030 nunca se va a medir de campo en la rejilla de
  avatares ni en el tablero del PIN.** Son superficies de niño y D-037 lo
  prohíbe. Solo laboratorio con estrangulamiento, etiquetado como laboratorio.
  No es un pendiente que se cierre después: es una medición que no vamos a tener

### Lo que hay que decidir antes de construir (cambia lo que se construye)
1. **¿El padre necesita su propio PIN para salir del modo niño?** \`mc-27\`
   impl. 5 lo recomienda (patrón Nintendo/Netflix); no está en ninguna decisión.
   Si sí, es otra tabla y otra pantalla en esta fase
2. **¿Qué proveedor de SMS, o se difiere el teléfono a F9?** D-027 exige teléfono
   verificado y Cloudflare no ofrece SMS. Diferirlo es gratis hoy; decidirlo
   tarde bloquea F9
3. **¿Se enruta a UE/RU a una base europea desde el día uno?** La jurisdicción de
   D1 se fija **al crear** y \`math-challenge-db\` es WNAM. Si la respuesta es sí,
   el registro decide a qué base escribe, y eso es arquitectura de F2
4. **¿Las cinco marcas se autoran por idioma o se traducen?** Son siete textos ×5,
   no cinco. Una explicación breve traducida literal es donde suena
   condescendiente (\`mc-45\`)
5. **¿Cómo se nombran los grupos en el esquema?** D-027 dice \`grupo_infantil\` y
   \`club_adulto\`, el master-plan dice \`classroom\`, y CLAUDE.md manda nombres en
   inglés. Propuesta: \`child_group\` / \`child_group_membership\` / \`adult_club\`,
   conservando lo único que D-027 protege — que sean **dos estructuras
   separadas**. Se decide en F2 porque el gate nombra el tipo

### Por qué importa para la flota
Primera fase donde tocan a la vez esquema de menores, consentimiento, interfaz de
niño y telemetría. \`privacidad\`, \`lineas-rojas\`, \`ux-banda\`, \`patrones-oscuros\` y
\`kinder\` despiertan juntos, y \`child-free-text\`, \`child-pii\` y
\`telemetria-infantil\` dejan de vigilar conjuntos vacíos.

### Auditoría de cierre — decisión del dueño
Al terminar esta fase se corre **la flota entera**, no solo los auditores a los que
les toca por alcance:

\`\`\`
node audits/adversarial.mjs --todos
node audits/adversarial/subir-sarif.mjs
\`\`\`

Por qué \`--todos\`: por defecto solo despierta el auditor que tiene algo que revisar.
**Al cerrar una fase la pregunta es otra** — no "¿qué toca este diff?" sino "¿esta
fase entera aguanta a la flota entera?". Un auditor dormido es un área sin revisar
que nadie declaró, y ese fue exactamente el error de F0: cerrada con el 0-RTT sin
verificar hasta que el dueño preguntó.
`),
  "F3": D(`
**Vía:** Producto · **Depende de:** F2, y de los pasos 2-3 de
[\`docs/planes/esquema-item.md\`](docs/planes/esquema-item.md) §14 (mover
\`MATH_CONVENTIONS\` a su propio módulo y fijar el esquema en \`content/\`)
**Decisiones:** D-005, D-010, D-018, D-020, D-022, D-024
**Investigación:** mc-29, mc-30, mc-31, mc-33, mc-34, mc-36 — y mc-01, mc-02,
mc-04, mc-05, mc-11 en los seis criterios de pedagogía

### Qué queda funcionando
Los 5 formatos táctiles, un reto de práctica de kinder de punta a punta, y la
puntuación **calculada y cronometrada en el servidor**: la regla de precisión de
kinder (D-024) y la HSHS de primaria a Pro (D-010) por el mismo camino de
código, con \`recordAttempt()\` implementado de verdad.

Es la primera fase donde el producto **calcula algo sobre un niño**. Por eso
lleva 20 criterios y no cuatro: cada línea roja que esta fase puede cruzar sin
querer tiene aquí su propio auditor.

### Criterios de aceptación
- [ ] \`audits/motor-puntuacion.mjs\` escrito, en \`ACTIVE\` de \`audits/run.mjs\`,
      y **visto fallar** antes del arreglo: una tabla de vectores dorados —las 6
      bandas × acierto/fallo × rápido/lento— contra el módulo real. Su primer
      vector es el control positivo de D-024: si la banda KINDER se rutea a
      HSHS con \`a=0\`, **todo da cero** y el auditor lo caza. Ese es el bug que
      D-024 existe para evitar, y una prueba que nunca se vio fallar no prueba
      nada (CLAUDE.md § Git, regla 3)
- [ ] Kinder puntúa \`valor_del_ítem · acc\` y **la firma de esa ruta no recibe
      tiempo**: no es que lo ignore en tiempo de ejecución, es que pasarle un
      \`RT\` no compila (D-024, y la línea roja del cronómetro que T-2 cerró).
      Sin resta al fallar, sin reloj visible ni invisible
- [ ] De primaria a Pro: \`score = a · (d − RT) · (2·acc − 1)\`, con \`d\`, \`a\` y
      el valor del ítem \`10 × 1.6^(nivel−1)\` en **una sola constante**, y
      \`audits/tabla-bandas.mjs\` cruzándola contra la tabla de D-010 en
      \`docs/decisions.md\` — el mismo patrón de \`citas.mjs\`. Existe porque esa
      tabla ya se desincronizó una vez: un niño de 7 años caía en dos bandas
      según qué documento se leyera. Vectores: N1 = 10, N2 = 16, N8 = 268,
      N9 = 429, N12 = 1,759
- [ ] El servidor cronometra con **dos sellos suyos** —ítem servido y respuesta
      recibida—, guardados del lado del servidor. \`audits/puntaje-servidor.mjs\`
      falla si el esquema de la petición acepta \`score\`, \`rt\` o \`tiempo\`, o si
      el módulo de puntuación aparece en el bundle de cliente. Un puntaje
      calculado en el cliente y sincronizado después es el vector de trampa más
      obvio (mc-33 impl. 7, mc-29 impl. 12)
- [ ] La sesión de reto es del servidor y es **idempotente**: reenviar la misma
      respuesta con la misma llave \`(sesión, orden)\` no vuelve a puntuar
      (mc-33 impl. 6 y 8). Prueba: dos envíos idénticos, un solo punto. La
      sesión expone además el **punto seguro de corte** que F8 necesita para
      que el límite de pantalla nunca corte a media respuesta (D-016)
- [ ] \`recordAttempt()\` implementado en \`apps/ingest/src/index.ts\` — hoy lanza
      a propósito para que nadie invente otro contrato. Cierra sobre la forma de
      \`AttemptInput\` que F0 ya fijó, escribe a \`ATTEMPTS_AE\` y devuelve el
      veredicto. Evidencia: la llamada RPC web→ingest corriendo, con su salida
      pegada en el PR — no la afirmación de que corre
- [ ] El intento crudo va a Analytics Engine y **jamás a D1**:
      \`audits/no-attempts-in-d1.mjs\` sigue pasando con la migración de esta
      fase, y lo único que F3 escribe a D1 es el rollup de \`score_totals\` por
      lotes, nunca por intento (mc-32 riesgo #1). D1 topa en 10 GB y es el único
      límite que se alcanza por error de diseño, no por crecimiento
- [ ] Borrar o corregir **nunca** penaliza (línea roja #8):
      \`audits/sin-penalizacion.mjs\` falla ante cualquier campo de intentos
      permitidos, penalización por cambio o conteo de borrados que entre al
      puntaje, y una prueba comprueba que la misma respuesta con cinco
      correcciones y con ninguna dan **el mismo puntaje**. mc-30: cambiar una
      respuesta mejora la calificación el 79% de las veces, y mc-30 impl. 4 pide
      tratarlo como neutral-a-positivo, jamás como bandera roja
- [ ] El piso de tiempo de respuesta es **solo bitácora**, nunca castigo ni
      mensaje al niño (mc-29 impl. 2, tier 0 de D-020): por debajo del piso el
      puntaje es idéntico y solo se enciende una señal derivada. Sin bloqueos,
      sin advertencias, y la palabra "trampa" no aparece en ninguna superficie
      de niño. Nada de dinámica de tecleo ni de modelo de ritmo por niño — esa
      es la raya del art. 9 del GDPR (mc-30 impl. 8, línea roja #1)
- [ ] El veredicto **nombra la causa**: el servidor compara la respuesta contra
      el arreglo \`errores\` del ítem y devuelve \`causa\` + la llave de la
      explicación pregenerada, o \`null\` si el error no está catalogado. Larry
      recibe el veredicto ya calculado y nunca el número (línea roja #7).
      Vector dorado con \`K04-numeral-17-de-DE\`: tocar 7 → \`elige_la_unidad\`.
      Este criterio es el **contrato del servidor**; lo que ve el niño es el
      criterio de retroalimentación de la sección siguiente
- [ ] Los cinco formatos táctiles responden de verdad —\`toca_la_respuesta\`,
      \`toca_para_contar\`, \`flash\`, \`arma_el_numero\`, \`cual_sobra\`— con
      \`audits/touch-targets.mjs\` en **88 px** para kinder y \`audits/axe-a11y.mjs\`
      limpio. \`flash_ms\` es exposición del estímulo y **no** reloj: no puntúa,
      no se muestra y no corre hacia atrás (\`esquema-item.md\` §18.2)
- [ ] Los números se renderizan **y se leen** con \`MATH_CONVENTIONS\` y con nada
      más: la tabla se mueve a \`apps/web/src/i18n/math-conventions.ts\` sin
      dependencias, y \`audits/notacion-locale.mjs\` falla ante \`toLocaleString\`
      con locale fijo o un separador decimal escrito a mano. Al entrar hay que
      normalizar a mano porque \`Intl\` formatea pero **no parsea** (mc-34
      impl. 2): un adulto en \`de-DE\` teclea \`1543,2\`. En kinder no aplica, no
      hay teclado (D-012). **La anulación \`locale-fr-FR\` de \`ANULACIONES.md\` se
      retira en el mismo PR**: caducó al arrancar esta fase
- [ ] El reto se juega sin conexión y **el servidor recalcula al sincronizar**
      (mc-33 impl. 6-8): cola en IndexedDB con llave de idempotencia, vaciado
      disparado por \`visibilitychange\`/foco —nunca confiando en Background
      Sync—, y el puntaje queda **pendiente** hasta que el servidor lo revalida.
      ⚠️ Falta decisión del dueño para las bandas cronometradas: sin servidor no
      hay reloj confiable (ver preguntas)
- [ ] El motor cabe en el presupuesto: \`audits/bundle-budget.mjs\` sigue pasando
      con los 5 formatos dentro — **60 KB gz para TODO el JS de cliente**
      (\`audits/bundle-budget.mjs:24\`), y el build local de hoy son 2.57 KB gz.
      Es el primer criterio que este motor puede reventar. El INP ≤150 ms de
      D-030 se mide **en laboratorio con estrangulamiento de CPU y red**, nunca
      de campo: la pantalla de un reto es superficie de niño (D-037)

### Criterios que aportó la flota (issues #5-#10, cerrados aquí)
El auditor \`pedagogia\` levantó seis contra el master-plan. El plan sí los
especifica; lo que falta es el código, y el código es esta fase y F5. Aquí van
con lo que los hace comprobables, porque como estaban escritos eran intenciones.

- [ ] **Ejemplo trabajado antes de la práctica** (\`mc-04\`, carga cognitiva): la
      primera vez que un perfil toca una habilidad, el reto arranca con un
      ejemplo resuelto, y **se desvanece** conforme sube \`skill_state\` — el
      efecto se invierte con la pericia (\`mc-04\` §3), así que un ejemplo que no
      se desvanece es un defecto y no una cortesía. Prueba: el mismo reto con
      estado nuevo y con estado dominado produce dos composiciones distintas
- [ ] **Espaciado e intercalado implementados, no solo planeados** (\`mc-05\`:
      mezclar duele en la sesión y **duplica** el desempeño al día siguiente).
      Lo que F3 hace cumplir es la composición servida: un reto \`PRACTICA\` no
      sirve seguidos todos los ítems de la misma habilidad ni del mismo modelo,
      y el motor **respeta el orden declarado** de la serie sin reordenarlo.
      Quién agenda el repaso en el tiempo es F4
- [ ] La retroalimentación **nombra el error**, no dice solo bien/mal (\`mc-11\`),
      llega de inmediato y jamás avergüenza (línea roja #7). Es el criterio del
      veredicto visto desde el lado del niño: la superficie muestra la causa y
      el siguiente paso, nunca elogio a la capacidad (\`mc-11\` §6) ni un
      marcador desnudo. Kluger & DeNisi: la retroalimentación mal dada empeora
      el desempeño, así que "hay feedback" no es el criterio
- [ ] La variación entre ítems de una serie es **explícita, no azarosa**
      (\`mc-02\`): el motor exige \`variacion.{varia, constante, por_que}\` para
      servir un reto y **rechaza** el que no lo trae. La tercera opción —"toma
      N ítems al azar del nivel"— no se puede expresar en el esquema
      (\`esquema-item.md\` §10, control positivo #5). Se le tiene que ver rechazar
- [ ] Los retos traen **contexto y apertura**, no cálculo pelón (\`mc-36\`): el
      motor exige \`proposito\` —los cinco de Swan— y no sirve un reto sin él;
      los formatos con más de una respuesta legítima (\`cual_sobra\`) puntúan
      \`acc = 1\` para cualquiera de las elecciones autoradas, que es lo que hace
      valioso al formato. ⚠️ Depende de la pregunta 3 de \`esquema-item.md\` §15,
      sin contestar
- [ ] El modo historia tiene fase de **exploración y de síntesis** (\`mc-01\`): el
      reto \`HISTORIA\` es una máquina de estados de tres fases —exploración,
      práctica, síntesis (*neriage*)— y el motor **no permite saltar la
      síntesis**, que es donde la lección japonesa consolida lo aprendido
      (\`mc-01\` §2) y la fase más fácil de recortar al implementarla. F3
      construye la máquina; el arte y los 14 lugares de la Sabana son F5 y D-019

### La tensión que esta fase tiene que resolver
**D-024 dice "sin reloj visible ni invisible" en kinder. mc-29 impl. 1-2 pide,
en el tier 0, que el servidor selle los tiempos y registre el piso de tiempo de
respuesta.** En el mismo intento no pueden ser ciertas las dos sin decir cuál
manda dónde.

La lectura que estos criterios implementan: **el sello del servidor existe y el
puntaje no lo ve nunca.** No es un reloj contra el que el niño corra —no se
muestra, no cuenta hacia atrás, no entra a la fórmula, no aparece en ninguna
pantalla—, es la señal de integridad y de fluidez que mc-30 llama derivada. Si
el dueño lee D-024 más estricto que eso, \`AttemptInput.responseTimeMs\` tiene
que volverse opcional y quedar en \`null\` para KINDER. Es una decisión suya, no
del implementador (pregunta 4).

### Qué NO incluye
- **El banco de ítems** (F5) ni la franja adulta (F5b). F3 sirve retos armados
  con un puñado de ítems semilla, los de \`esquema-item.md\`.
- **La selección adaptativa y el programador de repaso** (F4). F3 sirve el reto
  que le den y respeta su composición; quién elige el siguiente es F4.
- **Larry en vivo** (F6). El veredicto trae la \`causa\` y la llave de la
  explicación pregenerada; quien la convierte en voz y en frase es F6.
- **Ligas, XP y tablero** (F7). F3 escribe \`score_totals\` por lotes; quién lo
  ordena y lo muestra es F7. \`DUELO\` no entra: necesita ligas.
- **El límite de pantalla y el panel del padre** (F8). F3 solo deja el punto
  seguro de corte y emite la señal derivada que ese panel mostrará.

### Preguntas al dueño — solo las que cambian lo que se construye
1. **Offline en bandas cronometradas.** Kinder no se cronometra y juega offline
   sin problema. La franja adulta N8-N10 sí usa \`d − RT\`, y sin servidor no hay
   reloj confiable (mc-33 impl. 7). ¿El intento offline de un adulto (a) puntúa
   solo por precisión y no cuenta para el tablero, (b) no se permite en modo
   cronometrado, o (c) acepta el reloj del cliente marcado como no verificado?
2. **\`cual_sobra\` y \`acc\`** — es la pregunta 3 de \`esquema-item.md\` §15, sin
   contestar, y F3 la necesita para poder puntuar: ¿todas las elecciones
   autoradas valen \`acc = 1\`, o se recorta a una sola correcta?
3. **Redondeo del puntaje.** \`10 × 1.6^(nivel−1)\` da 268.44 en N8. ¿El puntaje
   se guarda entero o real? Decidirlo en dos lugares distintos produce una
   discrepancia entre el veredicto y el tablero, y se descubre en producción.
4. **El sello de tiempo en kinder** (ver la tensión de arriba): ¿existe como
   señal derivada que el puntaje nunca ve, o \`responseTimeMs\` queda en \`null\`
   para KINDER?

### Auditoría de cierre — decisión del dueño
Al terminar esta fase se corre **la flota entera**, no solo los auditores a los que
les toca por alcance:

\`\`\`
node audits/adversarial.mjs --todos
node audits/adversarial/subir-sarif.mjs
\`\`\`

Por qué \`--todos\` y no la corrida normal: por defecto solo despierta el auditor que
tiene algo que revisar, y eso es correcto en el día a día. **Al cerrar una fase la
pregunta es otra** — no "¿qué toca este diff?" sino "¿esta fase entera aguanta a la
flota entera?". Un auditor dormido es un área sin revisar que nadie declaró, y ese
fue exactamente el error de F0: cerrada con un criterio sin verificar.
`),
  "F4": D(`
**Vía:** Producto · **Depende de:** F3
**Decisiones:** D-002, D-017, D-020, D-024, D-025 · **Investigación:** mc-13,
mc-44, mc-05, mc-02, mc-32 · **Líneas rojas:** #2, #3, #4, #6, #7, #8

### Qué queda funcionando
El motor que decide **qué ítem va después**. Tres piezas que se construyen
juntas porque comparten estado: la **ubicación adaptativa por tema** (Elo estilo
Math Garden, sin banco calibrado), el **programador de repaso espaciado**
(FSRS-lite con arranque Leitner sobre \`skill_state\`) y el **intercalado** entre
habilidades. El estado vivo vive en \`math-challenge-learner-do\`, **un Durable
Object por niño**; el registro durable vive en \`skill_state\` (D1) y el crudo en
\`math-challenge-attempts-ae\`.

### Los dos ejes, que es lo que esta fase tiene que probar
D-002 separa a propósito **edad → tema visual** y **ubicación → dificultad**. Un
niño de 8 años que va en álgebra sigue viendo el tema de primaria. La fase no
está bien hecha si al final la dificultad se puede predecir desde la edad: eso
sería la escalera de D-017 disfrazada de adaptativo.

### Criterios de aceptación — 21, todos verificables
- [ ] \`math-challenge-learner-do\` creado, **un objeto por niño** (\`idFromName\`
      sobre \`child_profile_id\`), con su renglón en la bitácora de
      \`docs/infrastructure.md\` en el mismo PR, y \`audits/cf-prefix.mjs\` pasando
      contra el inventario (CLAUDE.md § Cloudflare)
- [ ] \`audits/do-por-entidad.mjs\` **(hay que escribirlo)**: falla si algún
      \`idFromName\` recibe un literal constante. Un DO global es antipatrón
      declarado por Cloudflare y topa en ~500-1,000 req/s **por objeto**
      (mc-32 riesgo #2). Sirve también a F7 y F9 cuando lleguen
- [ ] El DO guarda **estado derivado** — estimaciones, contadores, próximas
      fechas — y **jamás** el intento crudo ni flujos de teclas.
      \`audits/no-attempts-in-d1.mjs\` extendido a la clase del DO (mc-32
      riesgo #1, tensión T-3 cerrada por línea roja #8)
- [ ] La habilidad estimada es **por tema**, no un escalar global: la tabla del
      DO tiene llave \`(child_profile_id, skill_id)\` y el motor puede ubicar a un
      mismo niño en N5 de conteo y N1 de formas a la vez (mc-44 impl. 6-7)
- [ ] **La edad siembra el ítem 1 y nada más.** Prueba de regresión: dos perfiles
      con la misma cadena de respuestas y \`birth_year\` distinto convergen a la
      misma dificultad para el ítem 3 en adelante (D-002, mc-44 impl. 13)
- [ ] La dificultad **asignada por autor** (escala 1-100) se guarda en columna
      distinta de la **calificación Elo viva**, y solo se usa como prior de
      arranque en frío. Sin eso, un ítem mal etiquetado nunca llega a los niños
      que revelarían su dificultad real (mc-13 impl. 8)
- [ ] Selección del siguiente ítem: se eligen los que dejan
      \`expected(habilidad, dificultad)\` en **[0.70, 0.80]** —Math Garden validó
      .75 con niños reales— y se **muestrea entre los 3-5 más cercanos**, no
      siempre el más cercano; ningún ítem se repite dentro de una sesión
      (mc-13 impl. 6, mc-44 impl. 11)
- [ ] El bucle de ubicación cierra: **K decreciente** (grande los primeros 3-4
      ítems, chico después), **tope duro de 15 ítems** y **parada temprana desde
      el 8** si las últimas 4 respuestas alternan en el mismo escalón ±1
      (mc-44 impl. 4-5, mc-13 impl. 4)
- [ ] **Subir y bajar de nivel está escrito como regla con histéresis, y el niño
      atorado tiene salida:** tras N fallos seguidos el motor baja de escalón
      antes de insistir, y nunca encadena más de N fallos. Si el patrón es
      imposible para la edad, **no sube el nivel y deja nota suave en el panel
      del padre — sin bloqueo y sin advertencia al niño** (D-020)
- [ ] **Corregir o borrar nunca empeora la estimación.** El actualizador recibe
      la respuesta final, no el rastro de correcciones — cambiar una respuesta
      mejora la calificación el 79% de las veces (línea roja #8, mc-30). Prueba
      que se vio fallar antes del arreglo
- [ ] **El programador nunca dice "vuelve mañana".** Si no hay nada vencido, el
      selector sirve práctica igual. Un cronograma que agota el contenido del día
      es una vida disfrazada, y cobrarlo sería línea roja #4
- [ ] Un corte por **límite de pantalla** no cuenta el ítem sin contestar como
      fallo ni deja el modelo a medio actualizar: la sesión se cierra en estado
      consistente (D-016, línea roja #6)
- [ ] Programador **FSRS-lite con arranque Leitner** (1 → 3 → 7 → 16 → 35 días)
      por nodo de habilidad, retención objetivo **0.90** y **0.85 en kinder**,
      escribiendo \`stability\`, \`difficulty\` y \`due_at\` en \`skill_state\` — que
      hoy existe vacía. Todo repaso es **recuperación**: el niño produce
      respuesta antes de ver explicación, nunca re-exposición pasiva
      (mc-05 impl. 2 y 6)
- [ ] **Maestría en dos etapas:** 3 correctas seguidas marcan \`provisional_at\`;
      \`mastered_at\` solo se escribe tras **un repaso correcto a ≥3 días**. Tres
      seguidas en el momento no prueban nada durable (mc-05 impl. 3)
- [ ] \`audits/intercalado.mjs\` **(hay que escribirlo)**: sobre sesiones
      generadas, falla si con 2+ habilidades en rotación aparecen bloques de la
      misma habilidad; verifica la mezcla **40-60% nuevo / 40-60% de repaso** y,
      en KINDER, **70/30 con ≤2 habilidades** por límite de memoria de trabajo
      (mc-05 impl. 4-5)
- [ ] **El intercalado mezcla entre retos, nunca dentro de una serie curada.**
      D-018 hace de la serie la unidad de diseño y mc-05 pide mezclar: el orden
      interno de una serie de F5 es intocable, el mezclador opera un escalón
      arriba. Escrito como regla, no como convención (D-018, mc-02)
- [ ] **La ubicación de kinder no se llama prueba ni lo parece:** sin puntaje
      visible, sin reloj, sin pantalla de resultados, sin la palabra "examen" en
      ninguno de los 7 locales — es el primer paseo por la Sabana.
      \`audits/kinder-sin-examen.mjs\` **(hay que escribirlo)** más
      \`audits/child-free-text.mjs\` y \`audits/locales-complete.mjs\` pasando
      (mc-44 impl. 12, D-024, líneas rojas #3 y #7)
- [ ] Cada respuesta se registra en \`math-challenge-attempts-ae\` con los campos
      de **jump-start**: ítem, habilidad, dificultad etiquetada, dificultad Elo
      antes/después, habilidad antes/después, K usado, RT, índice en la sesión.
      Sin esto desde el día uno, la recalibración Rasch arranca tarde
      (mc-13 impl. 7, mc-44 impl. 8)
- [ ] \`audits/adaptativo-simulacion.mjs\` **(hay que escribirlo)** — la única
      forma de cerrar esta fase sin caja negra. Cohorte sintética con habilidad
      verdadera conocida; falla si: (a) la ubicación no recupera la habilidad
      dentro de ±1 escalón en ≥80% de los casos en ≤15 ítems, (b) la tasa de
      acierto observada se sale de 70-80%, (c) **machacar respuestas rápidas al
      azar supera al juego genuino** (mc-13 impl. 12)
- [ ] **Las dos firmas de Rohrer, medidas por separado:** acierto en sesión y
      acierto al día siguiente. Se espera que el intercalado **baje** el primero
      y **duplique** el segundo, y queda escrito que un bajón en sesión **no**
      revierte a bloques. Además existe el modo **escalera fija** como
      alternativa real, para poder comparar contra ella antes de atribuirle nada
      al adaptativo (mc-05 impl. 10, mc-13 impl. 11)
- [ ] **El borrado alcanza al modelo.** Borrar el perfil borra el DO del niño:
      \`deleteAll()\` sobre su almacenamiento y baja del namespace, no solo la
      fila de D1. El runbook enumera **los cuatro sistemas** — D1, DO, Analytics
      Engine y Vectorize — y \`audits/borrado-cuatro-sistemas.mjs\`
      **(hay que escribirlo)** falla si el camino de borrado omite alguno
      (mc-32 riesgo #7, línea roja #2)

### Qué NO incluye
- **BKT, PFA ni DKT.** Necesitan ajuste de parámetros por habilidad antes de
  portarse bien; Elo actualiza en O(1) sin calibración previa, que es lo único
  viable con un banco recién nacido (mc-13 impl. 1 y 10).
- **Calibración Rasch real, 2PL o 3PL.** Se difieren hasta ≥200-400 respuestas
  por ítem — que es también el disparador de revisión de D-025 para el tablero
  (mc-44 impl. 9-10).
- **Control de exposición** Sympson-Hetter o randomesque. En v1 basta con no
  repetir dentro de la sesión; se agrega cuando la telemetría muestre unos pocos
  ítems dominando (mc-44 impl. 11).
- **Ordenar el tablero por habilidad estimada.** F4 la produce; D-025 dice que
  F7 ordena por puntos y no por ella, a sabiendas de que mc-18 y mc-44 piden lo
  contrario.
- **Selección offline.** El servidor decide y califica (F3, mc-33 impl. 7); el
  modo sin conexión es de F11.
- **El panel del padre** que distingue "practicado" de "aprendido". F4 produce la
  señal de dos etapas; mostrarla es F8 (mc-05 impl. 11).
- **Embeddings por niño en Vectorize.** Prohibido: el borrado ya toca cuatro
  sistemas y esto lo volvería cinco sin historia limpia de borrado
  (mc-32 riesgo #8, D-035).

### Lo que hay que preguntar al dueño antes de construir
Cuatro respuestas cambian lo que se construye, no cómo se documenta:
1. ¿La ubicación es **obligatoria** antes de la primera práctica, o **opcional**
   con la edad como default y un botón de "recalibrar" después? (mc-44 Q1)
2. Cuando la ubicación **contradice fuerte a la edad** —un niño de 5 años
   ubicando en N5— ¿se muestra tal cual, se suaviza, o lo confirma el padre?
   Toca D-002 de frente. (mc-44 Q5)
3. ¿**Re-ubicación periódica** en v1 (cada N semanas o tras M fallos en el
   escalón actual), o se difiere? (mc-44 Q6)
4. ¿La maestría en dos etapas **bloquea el avance** al siguiente nodo, o solo
   afecta el calendario de repaso mientras el avance va por otro umbral?
   (mc-05 Q5)

### Por qué importa para la flota
Es la primera fase donde un algoritmo decide qué ve un niño. Despiertan juntos
\`pedagogia\`, \`kinder\`, \`privacidad\` y \`anti-humillacion\`: el motor puede
avergonzar sin decir una palabra, simplemente sirviendo diez ítems seguidos que
el niño falla.
`),
  "F5 ": D(`
**Vía:** Producto · **RUTA CRÍTICA** · **Depende de:** esquema de ítem (§9)
**Decisiones:** D-006, D-009, D-022 · **Investigación:** mc-34, mc-36, mc-40

### Qué queda funcionando
~400 ítems × **7 locales**, 2,500 retos curados, 14 habilidades, arte de la Sabana.

### Por qué es la ruta crítica
Son **siete autores nativos, no cinco**: \`es-MX\` y \`es-ES\` no comparten
separador decimal ni formato de división larga; \`pt-BR\` y \`pt-PT\` no comparten
escala numérica (mc-34, D-022). El contenido matemático **no se traduce, se
autora**.

### Criterios de aceptación
- [ ] Todo ítem guardado como **estructura**, jamás como texto ya formado
- [ ] Todo ítem trae su arreglo de **errores con causa nombrada** — es lo que
      permite que Larry sepa *qué* error se cometió, no solo que falló
- [ ] Todo ítem redactado con IA pasó por revisión humana (mc-40: los modelos
      escriben distractores válidos pero son malos anticipando errores reales)
- [ ] La unidad de diseño es **la serie**, no la pregunta suelta (D-018)
- [ ] \`audits/locales-complete.mjs\` pasa sobre el banco entero
`),
  "F5b": D(`
**Vía:** Producto · **Depende de:** F5
**Decisiones:** D-034 · **Investigación:** mc-12

### Qué queda funcionando
~150 ítems N8-N10, autorados una vez y renderizados en 7 notaciones. Sin Sabana,
sin modo historia.

### ⚠️ Contradicción abierta, encontrada por la flota
El master-plan dice **"sin curaduría por serie"**, y D-018 dice que **"la unidad
de diseño es la serie, no la pregunta suelta"**. El auditor \`pedagogia\` lo marcó
como bloqueante y tiene razón: son incompatibles.

**Hay que resolverlo antes de construir**, y solo hay dos salidas honestas:
curar la franja adulta como series igual que F5, o **enmendar D-018
explícitamente** — no dejar la renuncia escondida en el plan como si fuera una
característica neutral de costo.
`),
  "F6": D(`
**Vía:** Producto · **Depende de:** F3, F5
**Decisiones:** D-004, D-015, D-029, D-035 · **Investigación:** mc-37, mc-11

### Qué queda funcionando
Explicación pregenerada al cerrar el reto + Workers AI en vivo con ruteo por
banda y tope de gasto, voz en los siete locales.

### Criterios de aceptación
- [ ] Larry **nunca calcula**: recibe el veredicto ya calculado y solo lo explica
      (línea roja #7, patrón de \`contador/explain.ts\`)
- [ ] Larry **nunca avergüenza** a un niño por equivocarse
- [ ] Un prompt por locale, no "cada línea escrita dos veces" — ese patrón no
      escala a 7 idiomas (mc-37)
- [ ] En kinder **la voz es la interfaz**: el niño no lee, Larry habla
- [ ] Tope de gasto por perfil y por día vía AI Gateway
- [ ] La explicación pregenerada funciona **offline y sin modelo**

### ⚠️ Condición de la banda Pro (D-035)
Antes de soltar Pro con explicación en vivo hay que **medir \`kimi-k2.6\` contra
explicaciones avanzadas revisadas por humano**. Si no pasa, la salida NO es
volver a Claude —eso lo cierra D-035— sino dejar Pro con explicación
pregenerada. Una explicación de cálculo tensorial incorrecta **enseña error**.
`),
  "F7": D(`
**Vía:** Producto · **Depende de:** F4
**Decisiones:** D-003, D-014, D-016, D-025 · **Investigación:** mc-16, mc-17, mc-18

### Criterios de aceptación
- [ ] La racha **nunca se rompe** por respetar el límite de pantalla, y la
      protección de racha **jamás se vende** (línea roja #6)
- [ ] Sin moneda comprable ni recompensas aleatorias de pago — las cajas de
      botín son juego ilegal en Bélgica y Países Bajos (línea roja #5)
- [ ] Ligas de ~30 pares anónimos, un Durable Object por liga (no uno global)
- [ ] Tablero con **alias generados**: sin nombre real, sin foto, sin ciudad
- [ ] El tablero global ordena por puntos, no por θ (D-025 — divergencia
      documentada respecto a mc-18)
- [ ] Ninguna superficie muestra últimos lugares
`),
  "F8": D(`
**Vía:** Producto · **Depende de:** F2
**Decisiones:** D-016, D-021 · **Investigación:** mc-26, mc-41

### Criterios de aceptación
- [ ] Corte de pantalla **suave**: aviso a los 5 minutos y despedida de Larry.
      Nunca corte seco a media respuesta (D-016)
- [ ] **Nunca se cobra por dejar que un niño practique** (línea roja #4). Se
      cobra el acompañamiento al padre
- [ ] Sin cuenta regresiva de escasez, sin consentimiento preseleccionado, sin
      cancelación más difícil que la suscripción (D-014)
- [ ] Panel con diagnóstico y reportes, sin exponer datos de otros niños
`),
  "F9": D(`
**Vía:** Producto · **Depende de:** F2, F7 · **BLOQUEADA**
**Decisiones:** D-011, D-027 · **Investigación:** mc-28, mc-46

### ⛔ Bloqueada por T-5
Nadie verifica que el adulto que abre un salón o un club sea quien dice ser.
D-011 propone mitigación que **no es garantía**; D-027 acota el daño eliminando
el contacto no supervisado, pero **no verifica al adulto**.

### Criterios de aceptación
- [ ] Salón del maestro y club de papás sobre la misma tabla \`grupo_infantil\`
- [ ] **Sin chat, en ninguna dirección** (D-027). El estándar de salvaguarda
      juvenil exige verificación de antecedentes para contacto no supervisado
      con menores; no podemos correrla, así que se elimina la categoría
- [ ] El dueño del grupo ve solo alias, puntos y racha
- [ ] Cada niño lo aprueba **su propio padre**
- [ ] Bitácora de quién aprobó qué y cuándo
`),
  "F10": D(`
**Vía:** Producto · **Depende de:** F5b, F7
**Decisiones:** D-027, D-028, D-029 · **Investigación:** mc-46

### Criterios de aceptación
- [ ] \`club_adulto\` separado de \`grupo_infantil\` — dos sistemas, no uno (D-027)
- [ ] Las tres formas de prenda, **ninguna con casilla para el último lugar**.
      No hay campo donde un castigo dirigido pueda aterrizar (D-028)
- [ ] Larry modera el texto libre **a prueba de fallos**: si no puede revisar,
      la prenda no se publica (D-029)
- [ ] Ruteo \`gpt-oss-120b\` → escalada a \`kimi-k2.6\` en baja confianza (D-035)
- [ ] Toda prenda rechazada va a revisión humana con un toque — sin eso se
      siente como censura
- [ ] Larry rechaza breve y en personaje, **sin sermón** (mc-11)

### Lo que no se negocia
Prize + chance + consideration son los tres elementos del juego ilegal. Aquí
faltan dos: la matemática es habilidad medible, y la plataforma **nunca toca
valor**. Si la plataforma alguna vez custodia algo, esto se cae.
`),
  "F11": D(`
**Vía:** Producto · **Depende de:** todas
**Decisiones:** D-020, D-031 · **Investigación:** mc-29, mc-38

### Criterios de aceptación
- [ ] Anti-trampa tier 0-1 — y **nunca** cámara, micrófono, biometría ni
      navegador bloqueado, en ninguna banda (línea roja #1)
- [ ] Accesibilidad auditada: \`axe-a11y\`, \`contrast\` y \`touch-targets\` pasando
      (24px WCAG / 44px HIG / **88px kinder**)
- [ ] Revisión legal con abogado real, no con nuestra lectura de la ley
- [ ] Offline completo con presupuesto de precaché respetado
- [ ] Interfaz adaptativa terminada en las cuatro plataformas (D-031)
`),
  "T-5": D(`
**Tensión abierta** · **Bloquea:** F9
**Decisiones:** D-011, D-027 · **Investigación:** mc-28, mc-46

### El problema
Nadie verifica que un adulto que abre un salón o un club sea quien dice ser.

D-011 propone un stack de mitigación que **no es garantía**. D-027 lo acotó
eliminando el contacto no supervisado —sin chat en ninguna dirección, el dueño
del grupo ve solo alias— pero **eso reduce el daño, no verifica al adulto**.

El estándar de salvaguarda juvenil exige verificación de antecedentes para
"contacto no supervisado o uno-a-uno con menores". No podemos correrla.

### Qué la cerraría
Una decisión del dueño sobre una de estas: verificación de identidad de tercero
con costo por maestro, restricción a instituciones con dominio verificado, o
aceptar formalmente el riesgo residual por escrito. **No es una tarea técnica.**
`),
  "T-6": D(`
**Tensión abierta** · **Bloquea:** modo Pro
**Decisiones:** D-034, D-035 · **Investigación:** mc-12

### El problema
Qué se puede calificar automáticamente de verdad a nivel PhD. No bloquea el MVP
—que llega hasta N10 (D-034)— pero define si el modo Pro existe.

### Se cruzó con D-035
Ahora hay una segunda pregunta encima: aunque algo sea auto-calificable, la
banda Pro perdió a Opus 5 y su techo es \`kimi-k2.6\`. Las dos se responden con
la misma evaluación contra explicaciones avanzadas revisadas por humano.

### Qué la cerraría
Un banco de ~50 problemas N11-N12 con solución revisada, y medir: cuántos se
califican bien de forma automática, y cuántas explicaciones de \`kimi-k2.6\`
aguantan revisión de un matemático.
`),
};

// Ordenadas de más larga a más corta: `"F10".startsWith("F1")` es verdadero,
// así que emparejar en orden de inserción le daba a F10 y F11 los datos de F1.
// El fallo era silencioso — el script decía "✓" sobre el elemento equivocado.
const CLAVES = Object.keys(CUERPOS).sort((a, b) => b.length - a.length);

const items = JSON.parse(
  gh("project", "item-list", proyecto, "--owner", DUENO, "--format", "json", "--limit", "100"),
).items;

let hechos = 0;
for (const item of items) {
  const clave = CLAVES.find((k) => item.title.startsWith(k));
  if (!clave) {
    console.log(`  ? sin detalle: ${item.title}`);
    continue;
  }
  // Editar el cuerpo de un draft exige el ID del **contenido** (`DI_…`), no el
  // del elemento del proyecto (`PVTI_…`). Son dos objetos distintos y la CLI
  // solo lo dice cuando le pasas el equivocado. El título se reenvía tal cual
  // porque `--body` sin `--title` también es rechazado.
  gh("project", "item-edit", "--id", item.content.id, "--title", item.title, "--body", CUERPOS[clave]);
  console.log(`  ✓ ${item.title.slice(0, 50)}  (${CUERPOS[clave].length} car.)`);
  hechos++;
}

console.log(`\n✓ ${hechos} elemento(s) detallados`);
console.log(`  https://github.com/users/${DUENO}/projects/${proyecto}`);
