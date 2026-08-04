# F13 · Apps de adultos y tiendas — diseño operativo

> **Primera versión, 2026-08-03.** Producido por la ronda de 60
> preguntas del dueño (15 olas de 4), volcadas en D-162 a D-181, sobre
> la investigación de `apps-tienda-investigacion.md` (rutas a tiendas
> verificadas en vivo). Regla del documento: todo número dice de dónde
> sale — `[decisión]`, `[leído]`, `[verificado en vivo]` o
> `[criterio propio]`.

**Las tres apps:** Math Challenge **Teacher** (el maestro), Math
Challenge **School** (la escuela), Math Challenge **Console** (la
administración). Inglés neutro, son marca, no se traducen (D-162).
Console se queda como PWA instalada; Teacher y School van a las cuatro
tiendas (D-163, D-177).

## 1. Qué queda funcionando

Un maestro — usuario normal del producto, con o sin escuela detrás —
abre **Teacher** y ve sus alertas y pendientes: la foto por subir, la
escuela por vincular, los miembros nuevos de sus salones, las
solicitudes. De ahí a su roster (alias, racha, puntos — D-107), sus
códigos (reset/disable), su foto y su insignia. Una escuela abre
**School**, sube su membrete, y cuando la Consola la verifica gestiona
sus maestros (invita, revoca) y ve sus salones — conteos sin niños en
esta vista, y la vista del maestro completa para su personal autorizado
(D-171). El dueño abre **Console** y trabaja las tres colas con
botones que son el runbook hecho producto, cierra la recepción de
escuelas cuando hace falta, y ve su tiempo de respuesta. Las dos apps
de tienda salen en Google Play y App Store, y después en Microsoft
Store y macOS — y ninguna ficha se sube antes de que su web esté
jugada en producción (D-177).

## 2. Las tres superficies

### 2.1 Teacher (`teacher.kilowatto.com`)

- **Identidad:** usuario normal (D-082); puede estar solo, sin escuela,
  con insignia «sin verificar» (D-086, D-163).
- **Home:** alertas y pendientes (D-169): `foto_pendiente`,
  `escuela_pendiente`, `miembros_nuevos`, `solicitudes_por_revisar` —
  cada una con su acción de un toque.
- **Roster y salones:** la semilla de F9 (`/app/grupos/`): alias,
  racha, puntos, ranking opt-in, códigos (D-113).
- **Foto:** subida con recorte, AVIF/WebP a R2, acción explícita
  (D-136, D-169).
- **Push completo** (D-169): aprobaciones de padres, reportes
  resueltos, actividad semanal — todo texto por `patrones-oscuros`;
  ningún push a un niño, jamás (D-105).

### 2.2 School (`school.kilowatto.com`)

- **Acceso:** sus maestros son sus accesos (`school_teacher` activo,
  D-163). Cualquier adulto registrado puede crear una escuela; nace
  `pending` (D-170).
- **Documento:** membrete subido en la app (acción explícita, R2), a la
  cola de la Consola (D-090).
- **Gestión:** lista, invita y revoca maestros con bitácora; ve los
  salones en conteos sin niños (activos, miembros — nunca alias en esta
  vista).
- **La vista del maestro para personal autorizado (D-171):** alias,
  racha, puntos de los salones de su escuela — el techo de D-027 —
  solo con `school_teacher` activo en escuela `verified`, y con
  **bitácora de lectura** (quién miró qué salón y cuándo).

### 2.3 Console (`console.kilowatto.com`, solo PWA)

- **Acceso:** set propio de usuarios administradores (D-163) + basic
  auth extra + passkey obligatoria (D-165). Auditada por
  `consola-solo-dueno.mjs` (D-175).
- **Las tres colas:** escuelas, reportes, apelaciones de prendas
  (D-172), cada una con acciones de efecto real (aprobar con la
  transacción de D-086, rechazar, revocar, cerrar) y bitácora.
- **Cierre de recepción:** flag de operación; las escuelas nuevas
  entran a lista de espera visible, nunca se rechazan ni se borran
  (D-181).
- **Métricas de operación:** antigüedad del pendiente más viejo y
  mediana semanal de respuesta (D-089, D-172).
- **Multi-revisor desde ya** (D-172, enmienda D-102): asignación de
  pendientes entre revisores.

## 3. Arquitectura

**Una sola base** (`apps/web`), tres subdominios con su propio
manifest, `start_url` y `assetlinks.json` (D-164). Sesión compartida
para Teacher y School (`mc_s`, 30 días); la Console con su set propio
(D-165). Datos en la misma D1 (D-174); los 7 locales desde el día uno
con diccionarios compartidos por prefijo (D-173). Auth: passkey en las
tres, obligatoria en Console (D-174 § auth).

**Infraestructura nueva (Cloudflare):** tres subdominios en la zona
`kilowatto.com` con sus rutas al mismo Worker `math-challenge-web`,
tres manifests, y `assetlinks.json` por subdominio — cada uno con su
renglón en `docs/infrastructure.md` en el PR que lo cree.

## 4. Las envolturas de tienda

| Canal | Herramienta | Requisitos | Estado |
|---|---|---|---|
| Google Play | Bubblewrap (TWA) | `assetlinks.json` + Play App Signing + track interno→cerrado→prod + Lighthouse ≥80 registrado | D-167 |
| App Store iOS | Capacitor | biometría + push nativo desde el día uno; iPhone e iPad con layout propio (Split View); Teacher sola primero; si rechaza → reforzar y reenviar una vez | D-166 |
| Microsoft Store | PWABuilder | después del móvil | D-168 |
| macOS App Store | Tauri | firma + notarización con la cuenta Apple del dueño; después del móvil | D-168 |

**Fichas:** redactadas por el agente con la voz del sitio, aprobadas
por el dueño; capturas reales; clasificación Everyone; privacy labels
con borrador del agente y firma del dueño (D-176).

## 5. Auditores

- Existentes con alcance ampliado a las tres rutas (D-175).
- **`audits/consola-solo-dueno.mjs`** (nuevo): la Consola solo responde
  al set de administradores; el set no crece sin decisión. Control
  negativo: cambiar la cuenta de prueba (D-070).
- **Matriz manual por app y plataforma** (la lección de #451): Teacher
  y School en Android TWA, iPhone, iPad Split View; Console en PWA de
  escritorio.
- **Auditores de tienda** cuando existan las envolturas: assetlinks,
  manifests, iconos.

## 6. Orden de ejecución y ejecución en paralelo

1. **Teacher web** (semilla F9 — depende del frente A de F9: #380 +
   #402).
2. **School web** (depende de `school`/`school_teacher` de F9 — la
   migración `0018`).
3. **Console web** (las tres colas sobre esquema ya decidido).
4. **Envolturas** — solo cuando las webs estén jugadas en producción.

| Frente | Territorio | NO toca |
|---|---|---|
| **A · Teacher web** | `pages/[locale]/teacher/**`, componentes `teacher/*`, foto/upload | F9 (`/app/grupos/`), school, console |
| **B · School web** | `pages/[locale]/school/**`, componentes `school/*`, la vista del maestro autorizada + bitácora de lectura | teacher, console, el roster de F9 |
| **C · Console web** | `pages/[locale]/console/**`, las tres colas, acciones, flag de recepción | teacher, school, runbook SQL existente (se queda como respaldo) |
| **D · Auth y set** | set de administradores, basic auth extra, passkey obligatoria | las tres superficies (las consume) |
| **E · Envolturas** | manifests, assetlinks, Bubblewrap/Capacitor/Tauri/PWABuilder, fichas | se activa al final, con A-C jugadas |
| **F · Auditores e i18n** | `consola-solo-dueno.mjs`, alcances, diccionarios `teacher*`/`school*`/`console*` | registros compartidos solo al final |

Los archivos que NO se paralelizan: `wrangler.jsonc`, `astro.config.mjs`,
`audits/run.mjs` + `audits/pruebas-auditores.mjs` (registros, solo al
final y el orquestador resuelve), y `docs/infrastructure.md` (bitácora).

## 7. Qué NO incluye v1

- **El cobro** — D-085 intacta (D-179 lo dice explícitamente).
- **Mensajería o contacto con menores** — D-027 intacto; la mensajería
  de F13 es solo entre adultos (maestro ↔ escuela ↔ consola).
- **F14 · Olimpiadas escolares** — frente propio, registrado (D-180).
- **La consola en tiendas** — solo PWA (D-162).

## 8. Issues

1. **[PARAGUAS]** F13 · Apps de adultos y tiendas
2. F13 · Teacher web — semilla F9, home de alertas, foto, push
3. F13 · School web — creación, documento, maestros, vista autorizada
4. F13 · Console web — las tres colas, acciones, recepción, métricas
5. F13 · Auth: set de administradores + basic auth + passkey obligatoria
6. F13 · Subdominios, manifests y assetlinks por app
7. F13 · Envoltura Android — Bubblewrap, Play App Signing, tracks
8. F13 · Envoltura iOS — Capacitor, biometría + push, iPad
9. F13 · Escritorio — PWABuilder Windows y Tauri macOS
10. F13 · Auditor `consola-solo-dueno` + alcances + matriz manual

## Preguntas al dueño — las 60, resueltas

Volcadas en D-162 a D-181. Las que fueron contra la recomendación o
respuesta personalizada: nombres en inglés (D-162), identidad de las
tres apps (D-163), subdominios (D-164), biometría + push en iOS
(D-166), home de alertas y push completo en Teacher (D-169), la escuela
viendo datos de alumnos como el maestro con sus tres candados (D-171),
multi-revisor desde ya (D-172, enmienda D-102), los 7 locales desde el
día uno (D-173), las cuatro tiendas como meta (D-177), y el alcance sin
recortes salvo el cobro (D-179).
