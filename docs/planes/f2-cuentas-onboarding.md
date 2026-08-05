# F2 · Cuentas y onboarding — diseño a nivel de archivo

> **Estado: plan, no implementación.** Este documento se escribió para que una
> persona lo revise antes de que exista una sola línea de código de F2. No se
> commiteó código, no se creó ningún objeto de Cloudflare, no se tocó el
> tablero, y el SQL de la migración vive **dentro de este documento**, no en
> `migrations/`, a propósito.
>
> Fecha: 2026-07-31 · Gobierna: D-011, D-012, D-013, D-026, D-017, D-031,
> D-036, y **D-037** (llegó al árbol de trabajo mientras esto se escribía; ver
> §0) · Investigación: `mc-25`, `mc-27`, `mc-45`, `mc-20`, `mc-21`, `mc-22`,
> `mc-23`, `mc-38`, `mc-43`.

---

## 0. Cómo leer esto

La fase tiene doce criterios de aceptación en el tablero: seis del alcance
original y seis que aportó el auditor `ux-banda` sobre `Base.astro` (issues
#17-#22). Los doce están mapeados en la §9, cada uno contra el auditor
determinista que lo comprueba, o contra el auditor que **hay que escribir**.

Tres cosas que este plan hace y que conviene saber de entrada:

1. **No reescribe `0001_identity.sql` ni `0002_child_profiles.sql`.** Los leí
   completos. La §4 dice qué falta y por qué, no qué cambiaría.
2. **Nombra lo que F2 no puede terminar.** Tres de las cinco marcas
   contextuales de D-026 se disparan en fases que no existen todavía; el
   mecanismo se construye aquí, el disparador no. Está dicho en la §6 y repetido
   en la §11.
3. **Levanta ocho preguntas que cambian lo que se construye** (§10), y cinco
   choques reales entre documentos vigentes (§10.B). Ninguna es de relleno.

**Evidencia re-ejecutable.** Todo lo que este documento afirma sobre el estado
actual del repositorio salió de estos comandos, corridos el 2026-07-31:

```bash
node audits/run.mjs
gh project item-list 1 --owner kilowatto --format json
node audits/adversarial.mjs --cartas
```

Salida relevante de la primera, pegada porque de eso se trata la regla:

```
✓ cf-prefix — 38 objeto(s) con prefijo correcto
✓ child-free-text — 3 tabla(s) de niño sin texto libre
✓ locales-complete — los 7 locales presentes
✓ no-attempts-in-d1 — 9 tabla(s), ninguna por intento
✓ secrets — 40 archivo(s) limpios
✓ brand-image — paleta, formatos y llaves limpios
✓ bundle-budget — 8 página(s), la más pesada 2.1 KB gz
✓ telemetria-infantil — ninguna telemetría en superficie de niño
31 construidos · 8 esperando fase · 39 planeados (D-032)
```

> **El repositorio cambió mientras se escribía este plan.** Al empezar,
> `git status` estaba limpio. Al terminar, el árbol de trabajo tenía **sin
> commitear** una decisión nueva (**D-037 — Rendimiento medido, y nunca sobre un
> niño**), un auditor nuevo (`audits/telemetria-infantil.mjs`, ya activo y
> bloqueando) y cambios en `audits/run.mjs`, `audits/live.mjs`,
> `audits/adversarial.mjs` y `scripts/detallar-proyecto.mjs`. No son míos: no
> commiteé, no hice push y no toqué esos archivos. **D-037 sí toca a F2** —
> cambia cómo se instrumenta el embudo (§7) y agrega un auditor a la lista de
> los que F2 debe mantener en verde (§8) — y este plan ya lo incorpora. Si esos
> cambios se revierten antes de construir, las §7, §8 y §9 hay que releerlas.



---

## 1. Lo que ya existe y no se vuelve a escribir

`migrations/0001_identity.sql` y `0002_child_profiles.sql` están aplicadas en
local y remoto (`docs/infrastructure.md`, bitácora del 2026-07-31), y son
**nueve tablas**:

| Tabla | Qué resuelve de F2 | Qué le falta para F2 |
|---|---|---|
| `users` | correo, `email_verified`, `locale` de 7, `is_learner`, borrado suave | país, huso, región de datos, puerta de entrada (§4.1) |
| `user_passkeys` | WebAuthn con varias credenciales por usuario | nada de esquema; falta la **decisión** (§10.A-1) |
| `user_password` | respaldo, cadena PHC completa | nada de esquema; falta el algoritmo real en Workers (§3.4) |
| `consent_records` | la fila que **es** el consentimiento, con versión, locale y hash de IP | dominio de `consent_type` e índice por niño (§4.2) |
| `child_profiles` | alias generado, año **y mes** sin día, `theme_band`, `avatar_parts`, locale | unicidad de alias por padre (§4.5) |
| `child_image_pin` | el PIN de tres imágenes, hasheado | nada de esquema — el conjunto de imágenes se deriva, no se guarda (§3.3) |
| `screen_time_settings` | minutos diarios, descanso, corte nocturno | **la hora de dormir** — sin ella el corte nocturno no se puede calcular (§4.4) |
| `skill_state` | maestría por habilidad | nada en F2; es de F4 |
| `score_totals` | rollup del tablero | nada en F2; es de F7 |

**Lo que estas dos migraciones ya hacen bien y este plan preserva sin tocar:**
no hay columna `role` (0001 explica por qué: una persona es papá, maestro y
aprendiz a la vez); no hay una sola columna donde un niño pueda escribir; y el
día de nacimiento no existe en ninguna parte.

---

## 2. Arquitectura de la fase, en una página

### 2.1 Dónde vive la app dentro del sitio

D-033 fija **mismo host**: el sitio abierto en la raíz, la app en rutas
autenticadas. Eso ya está en `wrangler.jsonc`. La app va bajo
`/[locale]/app/…`.

`apps/web/astro.config.mjs` tiene `output: "static"`. **No se cambia a
`"server"`**: eso deoptimizaría las páginas del sitio abierto, que son el activo
de S0-S2. En su lugar, cada ruta de app lleva `export const prerender = false`,
que es exactamente el patrón que `apps/web/src/pages/api/health.ts:14` ya usa y
que ya se probó vivo contra bindings.

**Todas las rutas de app llevan `<meta name="robots" content="noindex,
nofollow">` y ningún `hreflang`.** No son traducciones de una página pública:
son la misma app en siete idiomas, y meterlas al grupo de `hreflang` de S0
ensuciaría el ciclo recíproco que `mc-48` §3 marca como todo-o-nada.

**Los segmentos de ruta van en inglés** (`/es-MX/app/signup`, no
`/es-MX/app/registro`). CLAUDE.md pone código y nombres en inglés; los textos
visibles van en los siete locales. Localizar siete juegos de slugs para rutas
`noindex` es costo sin retorno de SEO, que es la única razón por la que un slug
localizado vale la pena.

### 2.2 Sesiones: tres cookies, ninguna con datos dentro

| Cookie | Qué guarda | Dónde vive el estado | Vida |
|---|---|---|---|
| `mc_s` | token opaco de sesión de adulto | `SESSION_KV` | 30 días deslizante |
| `mc_h` | token opaco del **dispositivo del hogar** | D1, `household_devices` | 400 días (tope de Chrome) |
| `mc_k` | token opaco de perfil de niño activo | `SESSION_KV` | 12 h o hasta el corte de pantalla |

Las tres: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`. **Ninguna lleva datos
adentro** — ni id de niño, ni banda, ni nada. Un token opaco que indexa KV no
filtra nada si alguien lee la cookie, y `mc-25` implicación 6 (nada de perfilado
sobre menores) es más fácil de sostener cuando no hay payload que perfilar.

`mc_h` va en D1 y no en KV a propósito: el padre tiene que poder ver y revocar
la lista de dispositivos (F8), y eso es una lectura por padre, no por petición.
El volumen es una fila por tableta, no por intento — no roza `mc-32` riesgo #1.

**Advertencia heredada de `wrangler.jsonc`:** `SESSION_KV` es solo para tokens
efímeros hasta que Cloudflare confirme la residencia de KV (`mc-25` la dejó sin
confirmar porque la página 404). El valor guardado en KV para `mc_k` es
`{childProfileId, householdId, exp}` — un identificador opaco de un perfil que
no contiene datos personales. Si el dueño decide que eso ya es demasiado, la
alternativa es un Durable Object por hogar, y cuesta una llamada más por
navegación.

### 2.3 Interfaz adaptativa: banda × plataforma, sin JavaScript en la primera pintura

Los seis criterios de `ux-banda` piden dos adaptaciones simultáneas (D-017 ×
D-031) y D-036 prohíbe explícitamente detectar la plataforma en JavaScript,
*"fallaría justo en la primera pintura, que es donde importa"*.

La salida es hacer las dos en el servidor, porque estas rutas ya son
`prerender = false`:

```html
<html lang="es-MX" data-band="KINDER" data-platform="android" data-theme="dark">
```

- **`data-band`** sale del perfil activo (o de `SERIO` para un adulto). Nunca de
  JS. Los cinco temas de D-017 son cinco archivos de CSS que **sobrescriben
  tokens**, no cinco hojas de estilo completas.
- **`data-platform`** sale del *client hint* `Sec-CH-UA-Platform`, leído en el
  Worker. Requiere responder `Accept-CH: Sec-CH-UA-Platform` y
  `Critical-CH: Sec-CH-UA-Platform`. Safari y Firefox no lo mandan → caen a
  `other`, y para iOS Safari hay respaldo puramente en CSS con
  `@supports (-webkit-touch-callout: none)`.
  **Esto es una hipótesis de implementación, no un hecho medido:** no verifiqué
  el soporte real de `Critical-CH` en el borde de Cloudflare. Se comprueba en
  el primer despliegue de F2 con `curl -I` y el encabezado en la respuesta.
- **`data-theme`** solo aparece cuando el usuario tocó el interruptor; se guarda
  en cookie y **gana sobre `prefers-color-scheme` en las dos direcciones**, que
  es la regla que `tokens.css` todavía no tiene (hoy solo hay
  `@media (prefers-color-scheme: dark)`).

**Lo que esto NO resuelve, dicho de frente.** `data-platform` da tipografía,
gestos, insets seguros y radios correctos. **No** da componentes nativos: la
diferencia entre una barra inferior de Material 3 y una *tab bar* de HIG es un
componente distinto, no un token distinto. El plan maestro §13.3 ya lo llama
*"un impuesto, no una fase"*; F2 paga la primera cuota — cascarón, navegación y
modales — y las siguientes se pagan en F3-F10.

---

## 3. Las tres puertas, paso a paso

> **Enmendado por D-082 (2026-08-02) y EJECUTADO por #390: esto deja de ser
> tres puertas simétricas.** Lo que sigue describe el modelo original
> (`?as=learner|parent|teacher` como elección en la puerta), conservado como
> registro histórico. El flujo real hoy:
>
> - **Una sola alta.** `POST /api/registro` inserta SIEMPRE `is_learner = 1`
>   (literal en `apps/web/src/lib/registro-nucleo.ts`), venga de la puerta que
>   venga, y aterriza en la casa del adulto (`rutaCasa`) — la pantalla del
>   aprendiz solo de §3.1. Las tres URLs localizadas
>   (`registro-padre|registro-maestro|registro-aprendo`) se quedan como CTAs de
>   marketing con el mismo formulario de 2 campos (D-026 no cambia).
> - **`signup_intent` es dato de embudo, no bifurcación.** Se conserva (qué CTA
>   trajo a la persona, D-037), es opcional —una alta sin `intent` es válida y
>   la columna queda NULL— y no condiciona ni el INSERT ni el aterrizaje.
> - **«Agregar un hijo» y «Crear un salón» son acciones de la casa**, visibles
>   y opcionales en la vista «Practicar» de `/{locale}/app/`. Disparan los
>   flujos ya construidos —`setup/child` (§3.2) y `owner/identity` (§3.3, hoy
>   `grupos/identidad` vía `grupos/nuevo`)— sin ningún cambio interno. El salón
>   se ofrece solo donde la bandera de mercado de F9 está encendida (#387).
> - `esFamilia`/`esSolo` (D-065) siguen derivándose de datos reales
>   (`hijos.length > 0`), nunca de `signup_intent`.
>
> Nota de implementación: el `DoorPicker.astro` y la ruta `join.astro` que el
> diseño original proponía ya no existían en el código cuando #390 se ejecutó
> — las tres puertas eran las tres URLs localizadas de arriba— así que no hubo
> componente que retirar, solo la bifurcación que eliminar.

Las tres comparten **exactamente el mismo formulario de dos campos** (D-026). La
puerta no cambia el formulario: cambia a dónde aterriza el usuario después. Eso
es lo que permite que el registro tenga 2 campos y no 3.

### 3.0 El registro, que es común a las tres

```
GET  /[locale]/app/join?as=learner|parent|teacher   → DoorPicker + TwoFieldForm
POST /[locale]/app/signup
```

1. **Turnstile** (`math-challenge-turnstile-signup`, aún no creado) delante del
   POST. Es defensa de bots sobre un formulario público, no verificación de
   edad ni biometría — no roza la línea roja #1.
2. **Límite de tasa** en `math-challenge-ratelimiter-do` (aún no creado): por IP
   y por correo.
3. `INSERT INTO users` con: `email`, `locale` (del prefijo de URL),
   `is_learner = (as === 'learner')`, `country` de `request.cf.country`,
   `timezone` del hint del cliente si llegó, `signup_intent = as`.
   **`country` y `timezone` no son campos del formulario**: se derivan. El
   formulario sigue teniendo dos.
4. `INSERT INTO consent_records` × 2 (`terms`, `privacy`) con
   `consent_version`, `locale` y `ip_hash`. **Ninguna casilla preseleccionada**
   y ninguna casilla de marketing en esta pantalla — `patrones-oscuros` caza
   consentimiento preseleccionado por carta, y D-026 no incluye marketing en los
   dos campos.
5. Sesión en KV, cookie `mc_s`, `302` a `/app/home`.
6. Correo de verificación **en cola, sin bloquear la entrada**. `email_verified`
   solo hace falta para abrir un grupo infantil (§3.3) y para recuperar la
   cuenta. Poner la verificación de correo en el camino crítico del registro es
   agregar un salto al correo a media activación (`mc-45`, pregunta abierta 1).

**Sin carrusel, en ninguna de las tres.** D-026 y `mc-45` §3 lo desaconsejan por
nombre. El auditor de §9 lo verifica mecánicamente.

### 3.1 Puerta A · el adulto que aprende para sí mismo

`/app/home` con `is_learner = 1` y sin hijos muestra **un botón**. La prueba de
fuego de `mc-45` implicación 6 es que el adulto llegue a su primera pregunta sin
otro formulario después del registro.

**En F2 ese botón todavía no puede llevar a una pregunta**: la franja adulta es
F5b y la ubicación es F4. F2 aterriza en un panel honesto que dice qué falta y
enlaza al sitio abierto. Se dice aquí para que no se reporte como terminado algo
que no lo está.

### 3.2 Puerta B · el padre

```
GET/POST /[locale]/app/setup/child          año y mes, deriva theme_band
GET/POST /[locale]/app/setup/child-alias    3-5 alias generados, se toca
GET/POST /[locale]/app/setup/child-avatar   piezas predefinidas
GET/POST /[locale]/app/setup/child-pin      3 de 9 imágenes, en orden
GET/POST /[locale]/app/setup/screen-time    defaults de D-016, saltable
```

**Cada paso es saltable con "Ahora no", y cada uno tiene default sano.** Es
D-026 literal: registrarse y configurarse son dos cosas.

`setup/child` es la pantalla más delicada del producto:

- **Dos `<select>`: año y mes.** Nunca un selector de fecha, porque un selector
  de fecha *tiene* día, y la línea roja #2 dice que el día no se pide. Lo mismo
  vale para `<input type="date">`: queda prohibido en esta ruta y el auditor de
  §9 lo verifica.
- `theme_band` se **deriva** de la edad y se muestra ya elegida; el padre puede
  moverla dentro de un rango, porque `0002` guarda la columna precisamente para
  eso.
- Aquí se disparan **dos** de las cinco marcas contextuales (§6).
- `INSERT INTO consent_records` con `consent_type = 'child_profile_creation'` y
  `child_profile_id` lleno. Esa fila es lo que hace auditable la posición de
  D-013.

`setup/child-alias` sirve alias **generados por locale**, de listas curadas —
`master-plan` §7: *"listas curadas por idioma, no traducidas, con validación de
la cadena combinada"*. El sufijo numérico se aleatoriza, nunca se secuencia
(`0002` lo pide en su comentario: `Conejo07` no debe delatar el orden de
registro).

`setup/child-pin`: el niño toca 3 imágenes de 9, en orden, y confirma
repitiendo. Sin teclado y sin `<input>` de texto. Los toques mandan índices.

Al terminar el primer hijo, **el dispositivo queda vinculado al hogar**: se
emite `mc_h` y se escribe una fila en `household_devices`. Desde entonces
`/app/kids` responde en ese dispositivo sin sesión de adulto. Es lo que D-012
llama *"la protección real contra un extraño la da el dispositivo vinculado al
hogar"*, convertido en una fila.

**Tope de perfiles.** D-021 da 1 perfil gratis y hasta 6 en Plan Familia. F2 lee
el tope de `CONFIG_KV` (`max_child_profiles_free`) y lo deja en **6** mientras
F8 no tenga Stripe, para que el camino de código exista y el número sea una
bandera. Dos reglas que no se negocian cuando el tope entre en vigor: **el tope
nunca detiene la práctica de un perfil que ya existe** (línea roja #4), y el
límite se muestra **antes** de que el padre llene el formulario, no después —
mostrar el costo tarde es el patrón oscuro que `patrones-oscuros` caza por
carta.

### 3.3 Puerta C · el maestro

D-011 y `mc-45` implicación 7 mandan lo mismo: **la fricción de identidad va
antes de crear un salón, no antes de registrarse**.

```
GET  /[locale]/app/home              tarjeta con los requisitos, VISIBLES antes de empezar
GET/POST /[locale]/app/owner/identity  nombre completo, escuela, foto
GET  /[locale]/app/owner/status        qué falta y qué ve un padre
```

1. Registro idéntico de 2 campos.
2. La tarjeta de `/app/home` **enumera los requisitos antes** de que el maestro
   empiece a llenar nada.
3. `owner/identity` captura nombre completo, escuela declarada y foto. Todo es
   dato del **adulto**: ni la línea roja #2 ni `child-free-text` aplican aquí.
   La foto va a `math-challenge-media` bajo `identity/<user_id>.avif`, en AVIF
   con respaldo WebP (`guia-de-estilo.md` § Formato).
4. **La verificación de correo es obligatoria aquí**, no en el registro.
5. **El teléfono es un problema abierto.** D-027 exige *"correo y teléfono
   verificados"* para abrir un grupo infantil, y **Cloudflare no ofrece SMS**.
   No hay proveedor decidido en ninguna decisión ni en `infrastructure.md`. F2
   captura el teléfono y deja `phone_verified = 0`; el gate lo exige solo si
   `CONFIG_KV.require_phone_for_groups` está activo. Ver pregunta §10.A-4.

**El gate, y por qué no es un `if`.** El criterio dice *"un maestro no puede
crear salón sin verificación previa"*. Un `if` al principio de una función se
olvida de agregar en la segunda ruta que crea salones. En su lugar:

```ts
// apps/web/src/server/groups/gate.ts
declare const brand: unique symbol;
/** Solo `assertCanOwnChildGroup` puede producir uno de estos. */
export type OwnerProof = { readonly [brand]: "OwnerProof"; userId: string };

export async function assertCanOwnChildGroup(
  db: D1Database, kv: KVNamespace, userId: string,
): Promise<OwnerProof> { /* … lanza si falta algo … */ }
```

y en F9, `createChildGroup(proof: OwnerProof, …)`. **Sin identidad completa no
compila una ruta que cree un salón**, y la verificación es `pnpm typecheck`, que
ya existe en `package.json`. Un tipo de marca es la única forma de que este
criterio se cumpla en F9 sin que nadie tenga que acordarse.

**Honestidad sobre el nombre.** `0001` menciona en un comentario una tabla
`teacher_verification` para F9. Este plan propone llamarla
`group_owner_identity`, por dos razones: sirve igual al maestro (D-011) y al
papá que abre club (D-027), y **la palabra "verification" afirma algo que el
producto no hace** — T-5 sigue abierta, nadie verifica que el adulto sea
maestro. Una tabla que se llama "verificación" y solo guarda declaraciones es
exactamente lo que `rigor-cientifico` caza por carta.

### 3.4 La cuarta entrada, que no es una puerta: el niño

```
GET  /[locale]/app/kids           rejilla de avatares
GET  /[locale]/app/kids/pin       9 imágenes, se tocan 3
POST /[locale]/app/kids/enter
```

- `/app/kids` **solo responde si el dispositivo trae `mc_h` válido y no
  revocado**. Si no lo trae, redirige a `/app/signin` — nunca a un formulario
  dirigido a un niño.
- La rejilla se opera **sin leer**: avatar grande, alias debajo como apoyo, no
  como requisito. Blancos de 88 px en banda KINDER (`mc-20`: 23.7 mm para 90% de
  acierto a los 4 años).
- **Cero `<input>`, cero `<textarea>`, cero `contenteditable`** en todo el árbol
  de `kids/`. El auditor de §9 lo verifica sobre los archivos, no sobre la
  intención.
- **El conjunto de 9 imágenes se deriva, no se guarda**:
  `HKDF(PIN_PAD_SECRET, child_profile_id)` → 9 índices del catálogo. Así el
  esquema no crece con una columna JSON en una tabla de niño, y no hace falta
  anular `child-free-text` para meterla.
- `pin_hash` se calcula como `HMAC-SHA-256(PIN_PAD_SECRET, child_id ‖ índices
  en orden)`. Con 9 imágenes y 3 en orden hay 504 combinaciones: **esto no es
  autenticación y el esquema de `0002` ya lo dice**. Lo que lo hace suficiente
  es que solo se puede intentar desde un dispositivo del hogar.
- **Nunca hay bloqueo.** Tras 5 intentos fallidos se vuelve a la rejilla con una
  espera de 30 s. No hay pantalla punitiva, no hay mensaje de culpa, y no hay
  nada que le impida a otro perfil jugar mientras tanto.

**Contraseñas de adulto en Workers, dicho de frente.** `0001` guarda una cadena
PHC completa "para poder migrar de algoritmo". En el runtime de Workers, sin
WASM, lo que hay es **PBKDF2 vía WebCrypto**: Argon2id no está disponible de
forma nativa. PBKDF2 es más débil frente a hardware dedicado, y la mitigación
real son las passkeys, el límite de tasa y Turnstile. **No verifiqué el costo de
CPU** de un PBKDF2 con iteraciones altas dentro del límite de un Worker; hay que
medirlo antes de fijar el número, y eso es trabajo de la primera semana de F2,
no una nota al pie.

---

## 4. El esquema que falta — `migrations/0003_accounts_onboarding.sql`

Lo que sigue es el archivo completo, propuesto. **No se creó en `migrations/`
a propósito**: lo revisa una persona primero.

Tres construcciones se verificaron contra SQLite real antes de escribirlas
(sqlite3 3.51.0, `sqlite3 --version`):

```bash
# 1. ALTER TABLE ... ADD COLUMN admite CHECK
sqlite3 :memory: "CREATE TABLE t(a TEXT); ALTER TABLE t ADD COLUMN b TEXT CHECK (b IN ('x','y')); INSERT INTO t VALUES('1','z');"
# → Error: CHECK constraint failed: b IN ('x','y')  ✓ la restricción aplica

# 2. Trigger BEFORE INSERT con RAISE(ABORT) contra tabla de catálogo
# → Error: consent_type desconocido  ✓

# 3. Índice único PARCIAL sobre (parent_user_id, alias) WHERE deleted_at IS NULL
# → Error: UNIQUE constraint failed  ✓
```

**No verificado:** que la versión de SQLite de D1 se comporte igual. Se
comprueba con `pnpm db:migrate:local` antes de tocar remoto.

```sql
-- 0003_accounts_onboarding.sql — las tres puertas, el dispositivo del hogar
-- y las cinco marcas contextuales
--
-- Decisiones que este esquema hace cumplir:
--   D-026  registro de 2 campos: nada de lo que se agrega aquí se PREGUNTA en
--          el formulario. country y timezone se derivan de la petición.
--   D-012  el dispositivo vinculado al hogar es la protección real del niño.
--   D-011  el maestro declara identidad ANTES de crear salón (D-027 extiende
--          la misma barra al papá que abre club).
--   D-013  el niño sigue sin ser un usuario: nada de lo que se agrega aquí
--          cuelga de child_profiles salvo un índice de unicidad.
--   D-016  el corte nocturno necesita saber a qué hora se duerme.
--   mc-25  §11 residencia por jurisdicción, decidida AL REGISTRARSE.
--   mc-45  §9 instrumentar el embudo desde el primer día.
--
-- Lo que deliberadamente NO está aquí:
--   - salones y clubs: F9/F10, sus propias migraciones (D-027 los quiere en
--     estructuras separadas, y separar es más fácil que despegar).
--   - tokens de verificación de correo: efímeros, viven en SESSION_KV.
--   - eventos del embudo: van a Analytics Engine, jamás a D1 (mc-32 riesgo #1).

-- ---------------------------------------------------------------------------
-- users — cuatro columnas que NO son campos del formulario
-- ---------------------------------------------------------------------------
-- Las cuatro se derivan de la petición o de la URL. El formulario sigue
-- teniendo dos campos, que es lo que D-026 decidió.

-- ISO-3166-1 alpha-2, de request.cf.country. Sirve para localizar la edad de
-- consentimiento digital por país declarado del padre (mc-25 implicación 13),
-- no para publicidad ni para segmentar a nadie.
ALTER TABLE users ADD COLUMN country TEXT;

-- IANA, del navegador. Sin huso no se puede calcular ni el corte nocturno de
-- D-016 ni el día de la racha, y "el día" de una racha decidido en UTC rompe
-- para medio planeta.
ALTER TABLE users ADD COLUMN timezone TEXT;

-- mc-25 §11: la jurisdicción de D1 se fija AL CREAR la base y no se puede
-- cambiar. math-challenge-db es WNAM. Esta columna NO implementa residencia
-- europea: registra a qué región se enrutó la familia para que, el día que
-- exista una segunda base `eu`, la decisión esté tomada en el momento correcto
-- —el registro— y no se intente rellenar después. Ver pregunta 10.A-5.
ALTER TABLE users ADD COLUMN data_region TEXT NOT NULL DEFAULT 'wnam'
  CHECK (data_region IN ('wnam', 'eu'));

-- Por cuál de las tres puertas entró. NO ES UN ROL, y por eso no se llama
-- `role`: 0001 quitó esa columna a propósito porque una persona es papá,
-- maestro y aprendiz a la vez. Las capacidades se siguen derivando de los
-- datos. Esto solo sirve para aterrizar al usuario y para leer el embudo.
ALTER TABLE users ADD COLUMN signup_intent TEXT
  CHECK (signup_intent IN ('learner', 'parent', 'teacher'));

-- ---------------------------------------------------------------------------
-- consent_type_catalog — dominio para consent_records.consent_type
-- ---------------------------------------------------------------------------
-- 0001 dejó consent_type como TEXT libre. En la tabla de un adulto eso no
-- dispara child-free-text, pero un consentimiento cuyo tipo se escribe a mano
-- es un consentimiento que no se puede contar, y COPPA-2025 exige poder
-- demostrar qué se consintió (mc-25). SQLite no puede agregar un CHECK a una
-- columna existente sin reconstruir la tabla; un catálogo con trigger da el
-- mismo dominio sin tocar los datos que ya hay.
CREATE TABLE consent_type_catalog (
  consent_type TEXT PRIMARY KEY,
  is_child     INTEGER NOT NULL CHECK (is_child IN (0, 1)),
  notes        TEXT NOT NULL
);

INSERT INTO consent_type_catalog (consent_type, is_child, notes) VALUES
  ('terms',                  0, 'Terminos del servicio, aceptados por el adulto al registrarse'),
  ('privacy',                0, 'Aviso de privacidad, misma pantalla, version y locale registrados'),
  ('child_profile_creation', 1, 'El adulto declara ser el padre o tutor de este perfil (D-013)'),
  ('global_leaderboard',     1, 'Opt-in por hijo al tablero global. AUSENTE = no otorgado (mc-25 impl. 5)'),
  ('classroom_join',         1, 'Aprobacion de un salon concreto, revocable. Se llena en F9 (D-011)'),
  ('marketing_email',        0, 'Nunca preseleccionado, nunca en la pantalla de registro (D-026)');

CREATE TRIGGER trg_consent_type_known
BEFORE INSERT ON consent_records
BEGIN
  SELECT RAISE(ABORT, 'consent_type desconocido: agregalo a consent_type_catalog en una migracion')
  WHERE NOT EXISTS (
    SELECT 1 FROM consent_type_catalog c WHERE c.consent_type = NEW.consent_type
  );
END;

-- El borrado COPPA/GDPR toca cuatro sistemas (mc-32 riesgo #7). En D1 empieza
-- por aqui, y sin este indice el runbook hace un table scan por cada niño.
CREATE INDEX idx_consent_child ON consent_records (child_profile_id)
  WHERE child_profile_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- household_devices — D-012 convertido en una fila
-- ---------------------------------------------------------------------------
-- "El PIN de imagenes separa hermanos; la proteccion real contra un extraño la
-- da el dispositivo vinculado al hogar." Sin esta tabla esa frase es una
-- intencion; con ella es una condicion que /app/kids evalua antes de renderizar
-- una sola cara.
--
-- NO es una tabla de niño: pertenece al padre, y `label` lo escribe el ADULTO
-- ("tableta de la sala"). Aun asi se declara aqui por escrito, porque el
-- auditor child-free-text va a crecer en esta fase y quien lo lea va a
-- preguntarse por esta columna.
CREATE TABLE household_devices (
  id              TEXT PRIMARY KEY,
  parent_user_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Hash del token de la cookie mc_h. El token en claro nunca toca D1: si
  -- alguien lee la tabla, no se lleva una llave utilizable.
  token_hash      TEXT NOT NULL UNIQUE,

  -- Escrito por el adulto, opcional. Nunca autogenerado con datos del
  -- dispositivo: eso seria una huella que no necesitamos (misma regla que
  -- user_passkeys.nickname en 0001).
  label           TEXT,

  platform_hint   TEXT CHECK (platform_hint IN ('android','ios','macos','windows','other')),

  created_at      INTEGER NOT NULL,
  last_seen_at    INTEGER,
  revoked_at      INTEGER
);

CREATE INDEX idx_devices_parent ON household_devices (parent_user_id)
  WHERE revoked_at IS NULL;

-- ---------------------------------------------------------------------------
-- group_owner_identity — la identidad que un padre ve ANTES de aprobar
-- ---------------------------------------------------------------------------
-- Sirve al maestro (D-011) y al papa que abre club (D-027): "la misma barra".
--
-- NO se llama teacher_verification, que es como la nombraba un comentario de
-- 0001, porque este producto NO VERIFICA que nadie sea maestro. T-5 sigue
-- abierta. `assurance` dice exactamente hasta donde llega cada fila, y ningun
-- valor de esa columna significa "comprobamos que trabaja en esa escuela".
CREATE TABLE group_owner_identity (
  user_id        TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Datos del ADULTO. Nada de esto es dato de un menor.
  full_name      TEXT NOT NULL,
  school_name    TEXT,
  photo_r2_key   TEXT,          -- identity/<user_id>.avif en math-challenge-media

  -- Telefono: D-027 lo exige verificado. Cloudflare no ofrece SMS y no hay
  -- proveedor decidido; hasta que lo haya, phone_verified_at se queda NULL y
  -- el gate lo exige solo si CONFIG_KV.require_phone_for_groups esta activo.
  phone_e164        TEXT,
  phone_verified_at INTEGER,

  -- Lo que el padre ve como insignia. 'declared' significa: lo escribio esta
  -- persona y nadie lo comprobo. Es lo que D-027 llama la insignia de "sin
  -- verificar", y se muestra literalmente asi.
  assurance      TEXT NOT NULL DEFAULT 'declared'
                 CHECK (assurance IN ('declared','email_verified','phone_verified')),

  submitted_at   INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL,

  -- Revocacion administrativa tras un reporte (D-011: boton de reporte de un
  -- toque y bitacora completa). Un adulto revocado no puede tener grupos.
  revoked_at     INTEGER,
  revoked_reason TEXT
);

-- ---------------------------------------------------------------------------
-- onboarding_marks — las cinco marcas de D-026
-- ---------------------------------------------------------------------------
-- Una fila SIGNIFICA descartada. No hay columna `shown_count` ni `last_shown`,
-- y eso es el diseño, no una omision: sin un contador de veces mostradas, el
-- patron de nagging que la FTC nombra (mc-17) no tiene donde aterrizar. Es la
-- misma tecnica que D-028 usa con las prendas — la humillacion no se prohibe,
-- se queda sin casilla.
CREATE TABLE onboarding_marks (
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mark         TEXT NOT NULL CHECK (mark IN (
                 'age-vs-difficulty',    -- 1. edad y dificultad son ejes separados (D-002, D-017)
                 'profile-not-user',     -- 2. el niño es un perfil, no un usuario (D-013)
                 'placement-not-exam',   -- 3. la ubicacion no es un examen (D-002, mc-44)
                 'no-chat',              -- 4. los grupos no tienen chat, nunca (D-011, D-027)
                 'stakes-no-loser'       -- 5. las prendas no tienen perdedor (D-028)
               )),
  dismissed_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, mark)
);

-- ---------------------------------------------------------------------------
-- screen_time_settings — la hora que faltaba
-- ---------------------------------------------------------------------------
-- 0002 guarda bedtime_cutoff_min, "minutos antes de dormir". Pero no guarda a
-- que hora se duerme, asi que el corte nocturno de D-016 no se puede calcular
-- con lo que hay hoy. Con la hora local aqui y el huso en users, si se puede.
ALTER TABLE screen_time_settings ADD COLUMN bedtime_local TEXT;  -- 'HH:MM' 24h

-- ---------------------------------------------------------------------------
-- child_profiles — un indice, ninguna columna
-- ---------------------------------------------------------------------------
-- Dos hermanos no pueden tener el mismo alias dentro de la misma cuenta: la
-- rejilla de avatares de D-012 se vuelve ambigua justo en el caso que el PIN de
-- imagenes existe para resolver. Parcial sobre deleted_at para que borrar y
-- volver a crear siga siendo posible.
CREATE UNIQUE INDEX idx_child_alias_per_parent
  ON child_profiles (parent_user_id, alias)
  WHERE deleted_at IS NULL;
```

### 4.6 Lo que NO va a D1, y por qué

| Dato | Dónde va | Por qué |
|---|---|---|
| Token de verificación de correo | `SESSION_KV`, prefijo `everify:` | efímero, de un adulto, sin valor histórico |
| Sesión de adulto y de niño | `SESSION_KV` | ya decidido en `infrastructure.md` |
| Eventos del embudo (registro iniciado → completo → primer perfil → primer reto) | Analytics Engine | `mc-45` implicación 9 los pide; `mc-32` riesgo #1 los prohíbe en D1. **Requiere un dataset nuevo** — ver §7 |
| Conjunto de 9 imágenes del PIN | derivado con HKDF | evita una columna JSON en una tabla de niño |
| Intentos de PIN fallidos | `math-challenge-ratelimiter-do` | es estado efímero de control de tasa, no historia |

---

## 5. Archivos a crear

### 5.1 Rutas (`apps/web/src/pages/[locale]/app/`)

Todas con `export const prerender = false` y `noindex`.

```
join.astro                  las tres puertas (?as=learner|parent|teacher)
signup.ts                   POST — 2 campos, Turnstile, límite de tasa
signin.astro / signin.ts    entrar
signout.ts                  POST
verify-email.ts             GET — consume token de KV
home.astro                  aterrizaje; el contenido varía por lo que el usuario ES
setup/child.astro|.ts       año + mes, deriva theme_band, marcas 1 y 2
setup/child-alias.astro|.ts alias generados por locale
setup/child-avatar.astro|.ts piezas predefinidas
setup/child-pin.astro|.ts   3 de 9 imágenes
setup/screen-time.astro|.ts defaults de D-016, saltable
owner/identity.astro|.ts    nombre, escuela, foto, teléfono (D-011, D-027)
owner/status.astro          qué falta, y qué verá un padre
kids/index.astro            rejilla de avatares — exige mc_h
kids/pin.astro              9 imágenes
kids/enter.ts               POST — abre mc_k
marks/dismiss.ts            POST — descarta una marca, para siempre
api/alias-suggestions.ts    GET — 3-5 alias del locale
```

### 5.2 Componentes

```
apps/web/src/layouts/AppShell.astro     cascarón de adulto (data-band, data-platform, data-theme)
apps/web/src/layouts/KidShell.astro     cascarón de niño; prohíbe por construcción cualquier <input>
apps/web/src/components/app/
  DoorPicker.astro          las tres puertas
  TwoFieldForm.astro        correo + credencial, y nada más
  ContextualMark.astro      anotación, NUNCA control (mc-45: regla visual explícita)
  SkippableStep.astro       "Ahora no" en cada paso de configuración
  BandSelect.astro          año y mes; jamás <input type="date">
apps/web/src/components/kids/
  AvatarGrid.astro          se opera sin leer
  ImagePinPad.astro         9 imágenes, blancos de 88 px
  AliasPicker.astro         se toca, no se escribe
  AvatarBuilder.astro       piezas predefinidas, jamás cámara (línea roja #1)
```

### 5.3 Servidor

```
apps/web/src/server/
  auth/session.ts        KV, cookies, rotación de token
  auth/password.ts       PBKDF2/WebCrypto, cadena PHC (§3.4)
  auth/passkey.ts        WebAuthn — depende de la pregunta 10.A-1
  auth/turnstile.ts      siteverify
  identity/gate.ts       assertCanOwnChildGroup → OwnerProof (tipo de marca)
  child/alias.ts         generador por locale + validación de la cadena combinada
  child/pin.ts           HKDF del tablero + HMAC del PIN
  household/device.ts    emisión, validación y revocación de mc_h
  marks/marks.ts         las cinco, y su descarte permanente
  funnel/track.ts        escritura a Analytics Engine — DESDE EL SERVIDOR, y cita D-037
```

### 5.4 Estilos

```
apps/web/src/styles/tokens.css        SE EXTIENDE (data-theme gana en ambas direcciones)
apps/web/src/styles/band-kinder.css   --tap-min:88px, pesos ≥500, numerales 24-32px
apps/web/src/styles/band-primaria.css --tap-min:48px, títulos Medium
apps/web/src/styles/band-secundaria.css oscuro por defecto (mc-22)
apps/web/src/styles/band-serio.css    oscuro por defecto, densidad mayor (mc-23)
apps/web/src/styles/band-pro.css      densidad máxima
apps/web/src/styles/platform.css      insets seguros, radios y gestos por data-platform
```

**El cambio de `tokens.css` que hoy falta**, y que los criterios de `ux-banda`
exigen: hoy el tema oscuro solo existe dentro de
`@media (prefers-color-scheme: dark)`. Hacen falta las dos anulaciones —
`:root[data-theme="dark"]` y `:root[data-theme="light"]` — para que las bandas
SECUNDARIA/SERIO/PRO puedan ser **oscuras por defecto** aunque el sistema diga
claro, y para que el interruptor del usuario gane en las dos direcciones.

### 5.5 Contenido

```
apps/web/src/content/alias/{en,es-MX,es-ES,fr-FR,pt-BR,pt-PT,de-DE}.json
apps/web/src/content/alias/blocklist/{…los siete…}.json
apps/web/src/content/avatar-parts.json
apps/web/src/content/pin-images.json
```

Las listas de alias **se autoran por locale, no se traducen** (`master-plan` §7).
La validación es de la **cadena combinada**: "Pato" + "Loco" puede ser inocente
por separado y no serlo junto, y eso cambia entre `es-MX` y `es-ES`.

---

## 6. Las cinco marcas contextuales, y cuáles puede disparar F2

D-026 fija cinco, cada una disparada *cuando su función se vuelve accionable*.
Tres de esas funciones no existen todavía:

| # | Marca | Dónde se dispara | ¿En F2? |
|---|---|---|---|
| 1 | `age-vs-difficulty` | `setup/child`, cuando aparece la banda ya derivada del año de nacimiento | **Sí** |
| 2 | `profile-not-user` | `setup/child`, anclada al formulario — es donde el padre busca un correo que no está | **Sí** |
| 3 | `placement-not-exam` | justo antes de la primera ubicación | **No** — F4 |
| 4 | `no-chat` | la primera vez que un adulto abre un grupo | **No** — F9 |
| 5 | `stakes-no-loser` | la primera vez que un adulto abre el creador de prendas | **No** — F10 |

**F2 construye el mecanismo completo para las cinco** (tabla, componente, ruta
de descarte, textos en los siete locales) **y dispara dos.** Decirlo así importa
porque el criterio del tablero dice "las cinco marcas contextuales", y cerrar F2
afirmando que las cinco están vivas sería una aserción en tono seguro que no se
puede re-ejecutar.

**Regla visual, de `mc-45` §3, que el auditor de contraste debe poder ver:** una
marca tiene que verse **inequívocamente como anotación y no como elemento
interactivo**. En la práctica: sin fondo de superficie elevada, sin borde de
botón, sin el naranja de acento como fondo, y con el único elemento tocable
siendo la "×" que la descarta.

---

## 7. Objetos de Cloudflare que F2 necesita y que **no existen**

`docs/infrastructure.md` dice "5 de 27 objetos creados". F2 necesita tres más, y
la regla de CLAUDE.md es que **quien los cree escribe su renglón en la bitácora
en el mismo PR**:

| Objeto | Tipo | Para qué en F2 | ¿Está en el inventario? |
|---|---|---|---|
| `math-challenge-ratelimiter-do` | Durable Object | límite de tasa de registro, entrada y PIN | **Sí**, ya inventariado |
| `math-challenge-turnstile-signup` | Turnstile | bots en el registro | **Sí**, ya inventariado |
| `math-challenge-funnel-ae` | Analytics Engine dataset | embudo de `mc-45` §9 | **No — objeto nuevo** |

El tercero sube el inventario de 27 a 28 y `audits/cf-prefix.mjs` lo va a exigir
en `infrastructure.md`. La alternativa sin objeto nuevo es
`math-challenge-web-analytics` (ya inventariado, tampoco creado), pero muestrea
al 10% después de 7 días y no permite comparar cohortes de registro, que es
justo lo que `mc-45` §1 pide medir por ser una hipótesis y no un axioma.

### 7.1 El embudo bajo D-037

D-037 (agregada el mismo día que este plan, ver §0) permite medir de campo en el
sitio abierto, el panel de padres y las bandas adultas, y lo **prohíbe sin
excepción en cualquier pantalla de niño**. El embudo de `mc-45` §9 encaja porque
mide al adulto, pero solo si se construye con tres reglas explícitas:

1. **El embudo se escribe desde el servidor**, en el Worker, no con un beacon del
   navegador. Nada de `navigator.sendBeacon` ni de `PerformanceObserver` — los
   dos patrones que `audits/telemetria-infantil.mjs` caza por expresión regular.
2. **Nunca se escribe un identificador de niño en el embudo.** Los cuatro pasos
   de `mc-45` §9 se miden con el id del adulto; "primer reto terminado" se
   registra como un evento del adulto ("un hijo suyo terminó un reto"), no del
   niño. Eso cuesta granularidad y se acepta: es exactamente la asimetría que
   D-037 declara y compensa con laboratorio.
3. **`funnel/track.ts` cita D-037 en su encabezado.** El auditor falla ante
   telemetría *en cualquier parte* que no declare por qué no alcanza a un niño,
   no solo ante telemetría en rutas de niño.

**El beacon de Web Analytics va en `AppShell.astro` y jamás en `KidShell.astro`,
y nunca en un layout del que `KidShell` herede.** `SUPERFICIES_DE_NINO` del
auditor incluye `/\/(…|child|kid)/i`, así que las rutas `app/kids/**` de este
plan ya caen dentro de su alcance sin tocar el auditor. La inyección automática
de zona se queda apagada (D-037), y eso lo verifica `audits/live.mjs`, no el
gancho.

---

## 8. Auditores: cuatro que ya estaban esperando y tres nuevos

`audits/run.mjs` ya lista cuatro deterministas como "esperando la fase que los
habilita · F2":

| Auditor | Qué comprueba | Nota |
|---|---|---|
| `axe-a11y` | axe-core sin violaciones | primera fase con interfaz de app |
| `contrast` | 4.5:1 texto, 3:1 gráficos | `brand-image.mjs` recuerda hoy que `#F36B1C` da 3.03:1; este lo comprueba **en pantalla** |
| `touch-targets` | 24 px WCAG / 48 px primaria / 88 px kinder | por banda, leyendo `--tap-min` de cada `band-*.css` |
| `migration-safety` | migraciones sin borrado destructivo | con 0003 ya hay tres migraciones |

Y tres que este plan propone agregar, con la autorización que D-032 se dio a sí
misma: *"cuando el código encuentra un auditor que faltaba, manda el código"*.

**`audits/signup-two-fields.mjs`** — hace cumplir D-026.
Falla si la ruta de registro tiene más de dos `<input>` visibles (excluyendo
`hidden`, `submit`, `button` y el token de Turnstile), o si aparece cualquier
componente de carrusel (`carousel|slider|swiper|onboarding-slide|step-1-of`) en
el árbol de `app/`. Es el criterio "registro en 2 campos, sin carrusel"
convertido en algo mecánico.

**`audits/child-pii.mjs`** — hace cumplir la línea roja #2.
`child-free-text.mjs` busca **TEXT sin dominio acotado**. No cazaría una columna
`birth_date INTEGER` ni `photo_url TEXT` si alguien la agregara con un CHECK
tonto. Este auditor prohíbe por nombre, en `child_profiles`, `child_image_pin`,
`skill_state` y cualquier tabla nueva de niño, columnas que casen con
`/(^|_)(name|nombre|email|correo|mail|photo|foto|picture|avatar_url|birth_?date|birthday|dob|day|phone|tel|address|direccion)($|_)/`,
con lista blanca explícita para `alias`, `avatar_parts`, `birth_year`,
`birth_month`.

**`audits/band-typography.mjs`** — cierra lo que `guia-de-estilo.md` deja
pendiente por escrito: *"que los pesos de Raleway respeten la excepción de
kinder (F2)"*. Falla si `band-kinder.css` define cualquier `font-weight` menor a
500, si no fija los controles a `var(--font-marca)` (la excepción de kinder de
D-036), o si el tamaño de numerales cae por debajo de 24 px.

### 8.1 Dos ampliaciones a auditores que ya existen

**`child-free-text.mjs` tiene un hueco que F2 va a abrir.** Hoy solo parsea
cuerpos de `CREATE TABLE`:

```js
const re = new RegExp(`CREATE\\s+TABLE\\s+${table}\\s*\\(([\\s\\S]*?)\\n\\);`, "i");
```

Una columna agregada con `ALTER TABLE child_profiles ADD COLUMN …` **es
invisible para él**. F2 es la primera fase que agrega una tercera migración
tocando tablas de niño, así que el hueco deja de ser teórico. Hay que enseñarle
`ALTER TABLE <tabla_de_niño> ADD COLUMN`.

Y el propio archivo ya anuncia la segunda mitad: *"Cuando haya interfaz (F2+),
este auditor crece para buscar `<input type=text>` y `<textarea>` en las rutas
de niño."* Alcance concreto: `apps/web/src/pages/[locale]/app/kids/**`,
`apps/web/src/components/kids/**` y `KidShell.astro`; falla ante cualquier
`<input>` que no sea `hidden`, cualquier `<textarea>`, cualquier
`contenteditable`.

**`telemetria-infantil.mjs`** ya está activo y bloqueando (D-037). F2 no lo
modifica: lo mantiene en verde con las tres reglas de §7.1. Merece mención aquí
porque F2 es la primera fase que **crea rutas que su lista
`SUPERFICIES_DE_NINO` reconoce** (`app/kids/**`), así que a partir de esta fase
el auditor deja de vigilar un conjunto vacío.

**`locales-complete.mjs`** debe cubrir también las listas de alias: los siete
archivos presentes, y **ningún par de listas idéntico**. El modo de falla que
`mc-34` documenta no es olvidar un idioma, es copiar `es-ES` en `es-MX`; un
umbral de coincidencia (p. ej. >80% de entradas iguales entre dos locales) lo
caza mecánicamente.

### 8.2 La carta de `ux-banda` no puede citar D-036

Verificado con `node audits/adversarial.mjs --cartas`:

```
· ux-banda           D-017 D-031 mc-21 mc-22 mc-23 mc-38 mc-43
```

El criterio del tablero dice *"con la tipografía repartida según D-036"*, pero
`audits/adversarial/cartas.mjs:264` no autoriza a `ux-banda` a invocar D-036, y
`audits/adversarial/citas.mjs` descarta mecánicamente lo que una carta no
autoriza. **Un hallazgo correcto de este auditor sobre tipografía se tiraría a
la basura.** Hay que agregar `D-036` a su arreglo `cita` en el mismo PR. Es una
línea, y sin ella el criterio no tiene quién lo haga cumplir.

### 8.3 Dos scripts de `package.json` apuntan a archivos que no existen

```bash
$ ls audits/i18n-complete.mjs audits/migrations.mjs
ls: audits/i18n-complete.mjs: No such file or directory
ls: audits/migrations.mjs: No such file or directory
```

`"audit:i18n"` debería apuntar a `audits/locales-complete.mjs`, y
`"audit:migrations"` es el `migration-safety` que F2 va a escribir. No bloquean
nada hoy porque el gancho corre `audits/run.mjs`, no estos scripts — pero un
script roto en `package.json` es una trampa para la siguiente persona.

---

## 9. Cómo se verifica cada criterio del tablero

Los seis originales:

| Criterio | Cómo se comprueba |
|---|---|
| Registro en 2 campos, sin carrusel de onboarding | **`audits/signup-two-fields.mjs`** (nuevo, §8) |
| El niño entra **sin escribir**: avatar + PIN de imágenes | **`child-free-text.mjs` ampliado** a las rutas de `kids/` (§8.1) |
| `audits/child-free-text.mjs` sigue pasando con el esquema nuevo | `node audits/run.mjs` tras aplicar 0003 — y con el parseo de `ALTER TABLE` agregado, para que "sigue pasando" signifique algo |
| Ninguna tabla de niño guarda nombre real, correo, foto ni fecha exacta | **`audits/child-pii.mjs`** (nuevo, §8) |
| Cada membresía guarda **quién aprobó, cuándo y qué se comparte** | **No se puede cerrar en F2**: la tabla de membresía es de F9 (§10.B-2). F2 cierra la mitad que sí le toca — `group_owner_identity` y el gate |
| Un maestro no puede crear salón sin verificación previa | **`pnpm typecheck`**: `createChildGroup` exige un `OwnerProof` que solo el gate produce (§3.3) |

Los seis de `ux-banda`:

| Criterio | Cómo se comprueba |
|---|---|
| La interfaz varía por banda — los 5 temas de D-017 | `band-typography.mjs` + `touch-targets` leen los cinco `band-*.css`; falla si falta uno |
| Blancos táctiles 24 / 44 / **88 px kinder** | **`touch-targets`** (ya planeado en `run.mjs`), por banda |
| Tema oscuro para adolescentes y adultos | **`contrast`**, corriendo dos veces: con `data-theme="dark"` y con `light`. Hoy `tokens.css` no tiene las anulaciones por `data-theme` (§5.4) |
| Tipografía diferenciada KINDER vs PRIMARIA, y en KINDER **nunca Light** | **`band-typography.mjs`** (nuevo) |
| El naranja de Ignia nunca como texto normal sobre claro | **`brand-image.mjs`** ya recuerda el 3.03:1 en cada corrida; **`contrast`** lo comprueba en pantalla |
| Adaptación por plataforma **y** por banda a la vez, tipografía según D-036 | `band-typography.mjs` verifica el reparto Raleway/sistema; el eje de plataforma lo juzga `ux-banda`, **que primero necesita poder citar D-036** (§8.2) |

Un criterio que el tablero no pide y que D-037 agrega a esta fase:

| Criterio implícito (D-037) | Cómo se comprueba |
|---|---|
| Ninguna telemetría alcanza al niño; el embudo del adulto declara por qué no lo alcanza | **`audits/telemetria-infantil.mjs`**, ya activo, sobre las rutas `app/kids/**` que F2 estrena (§7.1) |

**Nada de esto cuenta si la prueba no se vio fallar primero.** Regla 3 de
CLAUDE.md: cada auditor nuevo se ejercita contra una violación plantada —una
banda kinder con `font-weight: 300`, un `<input type="text">` bajo `kids/`, un
tercer campo en el registro— y la salida del fallo se pega en el PR. Es el mismo
método del "control positivo" que D-035 describe para la flota adversarial.

---

## 10. Lo que hay que resolver antes de construir

### 10.A · Preguntas para el dueño (cambian lo que se construye)

1. **¿Passkey, contraseña o las dos?** `0001_identity.sql:6` dice
   *"D-035 passkey primero, contraseña como respaldo"* — pero **D-035 es
   "Workers AI como proveedor de inferencia"**, y no existe ninguna decisión
   sobre passkeys en `decisions.md`. `mc-45` deja la pregunta explícitamente
   abierta. Cambia el trabajo: WebAuthn es ~3× el trabajo de un formulario, y
   PBKDF2 en Workers (§3.4) es más débil de lo que sería Argon2id.
2. **¿Cuál es el default del tablero global por hijo?** D-003 lo crea; `mc-25`
   implicación 5 dice que el global se abre solo con opt-in por hijo. Ningún
   documento fija el default. La respuesta cambia si `global_leaderboard` se
   inserta al crear el perfil o solo cuando el padre lo activa.
3. **¿El padre necesita su propio PIN para salir del modo niño?** `mc-27`
   implicación 5 lo recomienda (patrón Nintendo/Netflix). No está en ninguna
   decisión. Si sí, es otra tabla y otra pantalla en F2.
4. **¿Qué proveedor de SMS, o se difiere el teléfono a F9?** D-027 exige
   teléfono verificado y Cloudflare no ofrece SMS. Difierirlo es gratis hoy
   porque los salones son F9; decidirlo tarde bloquea F9.
5. **¿Se enruta a los usuarios de UE/RU a una base europea desde el día uno?**
   `math-challenge-db` es WNAM y **la jurisdicción se fija al crear**
   (`infrastructure.md`). Si la respuesta es sí, el registro tiene que decidir a
   qué base escribe, y eso es arquitectura de F2, no de F11.
6. **¿Las cinco marcas se autoran por idioma o se traducen?** `mc-45` pregunta
   abierta 3: una explicación breve traducida literalmente es donde suena
   condescendiente. Autorarlas son siete textos ×5, no cinco.
7. **¿Cómo se nombran los grupos infantiles en el esquema?** D-027 dice
   `grupo_infantil` y `club_adulto`; `master-plan` §3.3 y el tablero dicen
   `classroom` y `classroom_membership`; CLAUDE.md dice que los nombres van en
   inglés. Propuesta: `child_group` / `child_group_membership` / `adult_club`,
   conservando lo que D-027 protege — que sean **dos estructuras separadas**.
   Se decide en F2 porque el gate de §3.3 nombra el tipo.
8. **¿`teacher_verification` o `group_owner_identity`?** El primero es como lo
   llama un comentario de `0001`; el segundo es lo que la tabla realmente hace y
   sirve igual al club de papás de D-027. Renombrar cuesta una línea hoy y una
   migración después.

### 10.B · Choques entre documentos vigentes

1. **`0001_identity.sql:6` cita D-035 para justificar passkeys.** D-035 no habla
   de passkeys. La cita es falsa aunque la implementación sea razonable, y
   `rigor-cientifico` la caza por carta. Se corrige la cita o se crea la
   decisión que falta.
2. **El criterio de `classroom_membership` está en F2, pero la tabla es de
   F9.** El tablero pide en F2 que *"cada `classroom_membership` guarde quién
   aprobó, cuándo y qué se comparte"*; `0001` dice que grupos y clubs van en
   *"sus propias migraciones, en sus propias fases"*, y `master-plan` §13.2 pone
   los grupos infantiles en F9. F2 no puede cerrar ese criterio salvo que se
   mueva la tabla a esta fase.
3. **`ux-banda` no puede citar D-036** aunque el criterio se lo exija (§8.2).
4. **D-027 nombra tablas en español** contra la regla de nombres en inglés de
   CLAUDE.md (§10.A-7).
5. **D-021 limita a 1 perfil gratis y F8 trae Stripe.** Si F2 activa el tope
   antes de que exista el plan de pago, un padre con dos hijos se queda sin
   camino. Mitigación propuesta: bandera en `CONFIG_KV` en 6 hasta F8 (§3.2).

**Ninguna línea roja se cruza en este plan.** Las tres que la fase podía cruzar
sin querer quedan así:

- **#2, el niño nunca es usuario:** `0003` no le agrega ni una columna a
  `child_profiles` salvo un índice de unicidad; el año y mes se capturan con dos
  `<select>` y `<input type="date">` queda prohibido por auditor; la foto que se
  guarda es la del maestro, un adulto.
- **#3, ningún niño escribe texto libre:** el árbol de `kids/` no tiene ni un
  `<input>`, el alias se toca, el avatar se arma de piezas y el tablero de 9
  imágenes se deriva en vez de guardarse — lo que evita meter una columna JSON
  en una tabla de niño.
- **#4, nunca se cobra por practicar:** el tope de perfiles nunca detiene a un
  perfil que ya existe, y el precio se muestra antes del formulario, no después.

---

## 11. Lo que esta fase deja sin hacer, a propósito

- **Tres de las cinco marcas contextuales no se disparan** (§6). El mecanismo
  queda completo; los disparadores viven en F4, F9 y F10.
- **El botón "Empezar" del adulto no lleva a una pregunta.** No hay motor de
  reto hasta F3 ni franja adulta hasta F5b.
- **No hay salones.** F2 entrega la identidad y el gate; la tabla de membresía,
  el código de 6 caracteres y la aprobación del padre son F9.
- **No hay verificación real de que un adulto sea maestro.** T-5 sigue abierta y
  este plan no la cierra: la acota escribiendo `assurance = 'declared'` y
  mostrándoselo al padre tal cual.
- **No hay componentes nativos por plataforma**, solo tokens y tipografía
  (§2.3). La barra de Material 3 contra la *tab bar* de HIG es F3 en adelante.
- **No hay residencia de datos europea.** `data_region` registra la intención;
  la segunda base D1 no existe.
- **No hay Larry.** En kinder la voz es la interfaz (D-015), y eso es F6. El
  árbol de `kids/` de F2 se opera sin leer y sin oír.
- **El presupuesto de INP ≤150 ms de D-030 no se va a poder medir de campo en la
  rejilla de avatares ni en el tablero del PIN.** Son superficies de niño y
  D-037 lo prohíbe. Solo hay laboratorio con estrangulamiento, etiquetado como
  laboratorio. Es la asimetría que D-037 declara, aplicada a las dos primeras
  pantallas infantiles del producto — y no es un pendiente que se pueda cerrar
  después, es una medición que nunca vamos a tener.

---

## 12. Orden de construcción sugerido

| # | Bloque | Por qué va aquí |
|---|---|---|
| 1 | Ampliar `child-free-text.mjs` (ALTER TABLE + rutas de niño) y escribir `child-pii.mjs` | los auditores antes del código: es lo que hace que el código nazca cumpliendo (`master-plan` §13.3) |
| 2 | Migración 0003 + `pnpm db:migrate:local` | todo lo demás cuelga del esquema |
| 3 | Sesiones, cookies, Turnstile, límite de tasa | ninguna ruta se puede probar sin esto |
| 4 | Registro de 2 campos + `signup-two-fields.mjs` | la puerta común a las tres |
| 5 | `tokens.css` con `data-theme`, cinco `band-*.css`, `band-typography.mjs` | los seis criterios de `ux-banda` cuelgan de aquí |
| 6 | Puerta del padre completa (perfil, alias, avatar, PIN, pantalla) | es la que crea los datos que todo lo demás consume |
| 7 | Entrada del niño + `household_devices` | depende de que exista un perfil |
| 8 | Puerta del maestro + gate con tipo de marca | la única que no bloquea a las otras dos |
| 9 | Marcas contextuales 1 y 2, en los siete locales | necesitan las pantallas donde se anclan |
| 10 | `axe-a11y`, `contrast`, `touch-targets`, `migration-safety` | cierran la fase, y no pueden correr antes de que haya interfaz |
| 11 | Embudo del adulto (§7.1) | va al final a propósito: es lo único de la fase que es telemetría, y D-037 exige que se decida con las pantallas ya construidas para saber cuáles son de niño |
```
