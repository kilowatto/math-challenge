# Auditoría del sitio público — 2026-08-01

> Encargo: auditar en detalle toda la parte pública de math.kilowatto.com con
> varios agentes, **uno por uno, secuencial, sin Workflow ni paralelo**, más
> disparar con `node` toda la flota de auditores automáticos que existe hoy.
>
> **Nada de esto se aplicó.** Es un inventario de hallazgos con evidencia real,
> no un conjunto de fixes. Ningún issue de GitHub se abrió todavía — queda
> pendiente decidir el desglose.

Metodología en dos partes:

1. **6 agentes secuenciales contra producción real** (`curl`, y en algunos
   casos Chrome real), uno por uno, cada reporte revisado antes de lanzar el
   siguiente: líneas rojas/patrones oscuros · privacidad infantil/COPPA ·
   personalidad nativa por plataforma · idiomas (7 locales) ·
   rendimiento/PWA/accesibilidad · integridad técnica y estructural.
2. **La flota de `node audits/`**: `run.mjs` (deterministas + pruebas del
   motor), los 5 manuales (`live.mjs`, `perf-vitals.mjs`,
   `corpus-integridad.mjs`, `pwa-installable.mjs`, `pruebas-auditores.mjs`), y
   `adversarial.mjs` (dos corridas, ambas con una limitación real explicada en
   §5).

---

## 0. Los dos hallazgos que más importan

### 0.1 Telemetría de terceros corriendo en producción, invisible en el código fuente

**[BUG GRAVE]** Cloudflare Zaraz inyecta **Google Analytics 4**
(`tid=G-Y6E81PKFYR`) y el beacon de **Cloudflare Web Analytics** a nivel de
borde — configurado en el dashboard de la zona, ausente de todo el HTML
fuente. Confirmado con Chrome real cargando `/en/` y `/en/signup-parent/`:

```
GET https://stats.g.doubleclick.net/g/collect?t=dc&aip=1&...&tid=G-Y6E81PKFYR&cid=313d20c8-...  → 200
GET https://static.cloudflareinsights.com/beacon.min.js/...  → 503
```

El `cid` persiste entre navegaciones — hay seguimiento entre páginas,
incluida la página donde un padre escribe su correo. Confirmado sin
navegador, para descartar una extensión local:

```
$ curl -s https://math.kilowatto.com/cdn-cgi/zaraz/s.js
→ HTTP 400 "Invalid Zaraz parameters"   (no 404: el endpoint existe y está configurado)
```

Contradice D-037 ("la inyección automática del beacon sigue APAGADA") y el
principio de cero terceros (mc-25/mc-30). **`node audits/live.mjs` no lo
detecta** — su comprobación 4c busca las cadenas
`"cloudflareinsights.com"`/`"beacon.min.js"` en el HTML servido vía `curl`;
Zaraz no deja ese texto ahí, así que el auditor reporta en verde
`· sin beacon inyectado por la zona (D-037)` sobre un sitio que sí lo tiene.
Es un hueco real del auditor, no una mentira suya.

**Acción**: revisar Zaraz en el dashboard de Cloudflare de esta zona y apagar
los triggers de GA4/CF Web Analytics. Si algo de Zaraz se mantiene a
propósito, documentarlo en `docs/infrastructure.md`.

### 0.2 El demo interactivo está completamente roto en producción, en los 7 locales

**[BUG GRAVE]** `/reto-demo/` sirve un `<script>` clásico con sintaxis de
TypeScript sin transpilar:

```js
const b = (e.target as HTMLElement).closest("button");
```

```
$ node --check reto-demo-script3.js
SyntaxError: Unexpected identifier 'as'
```

Reproducido en Chrome real (`en`, `es-MX`, `de-DE`) — la excepción revienta
el IIFE completo, así que **ningún** listener se registra: clic en cualquier
respuesta no hace nada, no llama a `/api/reto`, no aparece veredicto. El
escaparate interactivo del producto no funciona para ningún visitante.

El agente 6 corrió `node --check` sobre los **176 `<script>`** de 20 páginas
en 4 locales y confirmó que este es el **único** script roto en todo el
sitio — no es un patrón que se repita en otro lado.

**Acción**: identificar el pipeline de build que sirve este script sin pasar
por el transpilador de Astro/esbuild y corregirlo. Es la página más
interactiva del sitio y lleva rota un tiempo indeterminado.

---

## 1. Líneas rojas y patrones oscuros (agente 1/6)

Metodología: `curl` contra 12+ URLs en 5-7 locales, pruebas en vivo contra
`POST /api/reto` (correcta, incorrecta repetida, corrección).

**[RIESGO — línea roja #1]** `/entrar/`, en **los 5 locales revisados**, dice
literalmente que un niño entra *"tocando su cara"* (en: *"by tapping their
face"*; fr: *"en touchant leur visage"*; de: *"indem sie ihr Gesicht
antippen"*). El código está limpio — sin `getUserMedia`, sin permiso de
cámara; "tocar su cara" es tocar un ícono/avatar de caricatura — pero el
**texto**, en la misma página que explica cómo entra un niño, usa la palabra
exacta que la portada promete un clic antes no cruzar nunca. Un padre o
regulador que lea solo esa página razonablemente lo leería como
reconocimiento facial. Es deliberado en los 5 idiomas, no accidente de
traducción. Recomendación del agente: "tocando su avatar/ícono".

**[BIEN]**, verificado con evidencia real: cero campos de identidad de niño
en los 3 registros, cero texto libre en el demo, el servidor nunca recibe ni
envía la fórmula de puntaje, dos intentos incorrectos seguidos no bloquean
nada, cero cookies, cero mención de precio.

**Menor, no bloqueante**: 2 de los 5 formatos del demo no están conectados a
calificación real todavía (la página ya avisa que es demo sin puntaje).

---

## 2. Privacidad infantil y consentimiento — COPPA/GDPR-K (agente 2/6)

Metodología: `curl`/`curl -I` contra 23 URLs reales (7 portadas + 8 subpáginas
es-MX + registro-padre en 5 locales + robots/manifest/sitemap).

**[BIEN]** Cero peticiones a terceros en las 23 páginas *vía HTML fuente*
(ver §0.1 — Chrome real sí encontró Zaraz; la diferencia es la técnica de
verificación, no una contradicción del agente). Cero cookies, incluida
`POST /api/reto`. RUM first-party, sin identificador, siempre
`banda="PUBLICO"`. Los 3 registros son exactamente correo+contraseña, sin
campo oculto ni checkbox premarcado.

**[RIESGO — bajo]** `/reto-demo/` es alcanzable sin sesión y sí llama al
servidor real (`POST /api/reto`); no se pudo verificar desde afuera la
retención de logs del servidor.

**[RIESGO — medio]** Cero cabeceras de seguridad (`Content-Security-Policy`,
`Permissions-Policy`, `X-Frame-Options`) en las 23 páginas. Hoy no hay
explotación porque el código está limpio, pero "cero cámara/mic" y "cero
terceros" dependen solo de disciplina de código, no de algo que el navegador
imponga — y las páginas de registro/entrar son enmarcables (clickjacking)
sin `X-Frame-Options`.

**Límite explícito, no asumido**: el consentimiento real y el selector de
año de nacimiento viven detrás de sesión autenticada — no auditables con
`curl` anónimo.

**[BIEN]**: `/entrar/` explica el mecanismo de login infantil per D-012, sin
datos personales en JSON-LD, robots/sitemap/manifest no exponen nada
privado.

---

## 3. Personalidad nativa por plataforma (agente 3/6)

Contexto: el mismo día se encontró y corrigió en producción un bug real
(`nav.sitio`/`footer` cayendo al azul-subrayado por default del navegador
por falta de `color`/`text-decoration` propios — PR #296). Este agente buscó
con más cuidado si quedaba algo del mismo patrón.

**[BUG]** El mismo patrón sigue vivo en `<nav class="migas">` (breadcrumbs)
de **3 páginas** (`/origen/`, `/investigacion/`, `/arquitectura/`) en las 3
variantes de CSS compilado (`dv65ifoy`, `cjrlu4nh`, `sjm5b4zz`) — ninguna
declara `color` en su `a`. El único selector `a` que alcanza el enlace es el
genérico `a{color:var(--color-text-brand)}` de `tokens.css`, sin
`text-decoration`.

**[BUG]** El enlace **"Crear cuenta" en `/entrar/`** (una de las páginas de
conversión del producto) no tiene reglas propias — mismo defecto, dentro de
una oración gris.

**[BUG]** Los radios de los botones de respuesta en `/reto-demo/` están
fijos (`border-radius:1rem`/`.5rem`/`50%`), ignoran `var(--radius)` por
completo — deberían ser 12px iOS, cápsula Android, 4px Windows, 6px macOS;
hoy son idénticos en las 5 plataformas. `Instalar.astro` sí usa
`var(--radius-control, var(--radius))` — el patrón correcto existe en el
código, solo no se aplicó en `Reto.astro`, la pantalla donde el niño
responde.

**[BUG/RIESGO]** Falta `:hover` en el botón "Entrar" mientras su hermano
"Registro" (mismo contenedor) sí lo tiene; también ausente en los 6 enlaces
del nav y en el footer — pega directo con lo que la carta adversarial
`nativo-macos` caza (mouse como entrada primaria sin feedback).

**[RIESGO]** La lista "Sigue leyendo" de la portada (`.explorar`) tiene el
mismo hueco de color — ambiguo si es contenido tipo-prosa o interfaz.

**[BIEN]**, con evidencia real: fallback de `backdrop-filter` en iOS vía
`@supports`; barra inferior correctamente oculta en macOS/Windows; iPad
hereda HIG de iOS a propósito (comentado explícitamente en el script de
detección de `Base.astro`); ícono maskable con margen seguro verificado
visualmente; regla global
`button,input,select,textarea{font-family:var(--font-sistema)}` que blinda
contra que la fuente de marca se cuele en un control.

---

## 4. Idiomas — los 7 locales en todo el sitio público (agente 4/6)

Metodología: `curl` de portada/niveles/entrar/registro-padre en los 7
locales, comparación de `<head>` completo y cuerpo.

**[BUG]** `pt-PT` mezcla su propia convención de millares: la portada dice
**"157 000"** (espacio, forma francesa), mientras el registro del mismo
locale dice correctamente **"40.000"** (punto). Coincide byte a byte con
cómo lo escribe `fr-FR` — parece copiado sin reformatear.

**[BUG]** `fr-FR` **sin espacio fino insecable en absoluto** — cero casos
correctos en portada/niveles/registro: ni en millares, ni antes de `: ; ! ?`,
ni dentro de `« »`. Transversal, no aislado.

**[BUG]** `fr-FR` con **apóstrofo recto en vez de tipográfico**, inconsistente
dentro del propio locale: 75/75 rectos en `/fr-FR/niveaux/`, pero
`/fr-FR/connexion/` sí usa el tipográfico correctamente — el sitio demuestra
que sabe hacerlo bien y no lo aplica parejo.

**[BUG]** La sección "Sigue leyendo" de la portada usa **slugs en español
hardcodeados** (`/origen/`, `/niveles/`, `/arquitectura/`, `/codigo-abierto/`)
en **5 de 7 locales** (`en`, `fr-FR`, `pt-BR`, `pt-PT`, `de-DE`), mientras el
nav superior de la misma página sí usa el slug localizado correcto. Cloudflare
responde 301 y redirige bien (confirmado single-hop por el agente 6, sin
cadena), pero cuesta un salto HTTP innecesario en cada clic — justo el costo
que la carta `red-lenta` vigila.

**[RIESGO]** La distinción "Serious" (tema) / "adult" (edad) se colapsa en la
misma palabra en 4 locales no ingleses (fr-FR, pt-BR, pt-PT, de-DE).

**[RIESGO]** Género gramatical de "padre/adulto" inconsistente entre locales
y dentro de `es-ES` mismo (alterna entre neutro y masculino en sus propias 3
páginas sin patrón aparente) — decisión de estilo pendiente del dueño, no
violación.

**[BIEN]**: hreflang recíproco completo y correcto en las 21 páginas
revisadas; `lang`/`og:locale`/`inLanguage` correctos con región; selector de
idioma del footer siempre en nombre nativo; pt-BR/pt-PT léxicamente bien
diferenciados (tela/ecrã, usuário/utilizador, gerundio vs. "a + infinitivo").

---

## 5. Rendimiento, PWA/offline y accesibilidad (agente 5/6)

Ver §0.1 y §0.2 para los dos hallazgos graves de esta sección.

**[BUG]** `Cache-Control: public, max-age=0, must-revalidate` en **todos**
los assets estáticos con nombre hasheado (CSS, fuentes, manifest, `sw.js`).
El hash ya garantiza invalidación — debería llevar
`max-age=31536000, immutable`. Cada visita fuerza revalidación condicional,
el round-trip que `mc-47` §4 marca como el que más pesa en 4G lento.

**[BUG]** La página de respaldo offline (sin red y sin locale cacheado) está
codificada en **español fijo, sin `<html lang>`**, rompiendo la disciplina
de idioma que el resto del sitio respeta.

**[RIESGO]** Turnstile es una petición de terceros adicional en el registro
(no bloquea render, pero es un round-trip más en red lenta).

**[RIESGO]** Ícono maskable solo en 512×512, no en 192×192.

**[RIESGO]** Campo de contraseña sin `aria-describedby` hacia su pista de
requisitos — invisible para lector de pantalla, y ningún auditor determinista
lo cazaría (no es regla estándar de axe-core para esta relación).

**[RIESGO]** Plantilla 404 con `<html lang="en">` fijo sin importar el
locale pedido.

**[RIESGO]** Botones 🦆 de "Tap each duck" sin `aria-label` con posición (a
diferencia de "Complete to 7", que sí la tiene) — lector de pantalla
anunciará "duck, button" seis veces indistinguibles.

**[BIEN]**: pesos muy por debajo de presupuesto con Brotli activo
(`bundle-budget.mjs`); `manifest.webmanifest` completo y correcto sin
`orientation` forzado; `sw.js` bien diseñado (network-first HTML,
cache-first estático, precaché acotado); foco visible consistente, cero
`outline:none` huérfano; jerarquía de encabezados correcta; formularios con
`label for`/`id` bien asociados en 2 locales; ARIA del demo bien diseñado en
intención (`aria-pressed`, `aria-live`, `role="group"`) — solo roto por el
bug de sintaxis de §0.2.

---

## 6. Integridad técnica y estructural (agente 6/6)

**[BUG] JSON-LD internamente contradictorio en 52 páginas.** El bloque
`WebSite`/`WebPage` declara `inLanguage: locale` sin condición; el bloque
`ScholarlyArticle` de la misma página calcula honestamente
`ARTICLE_LANG = effectiveHasTranslation ? locale : "en"`. Cuando la
traducción no está verificada, la misma página declara el mismo texto en dos
idiomas distintos al mismo tiempo. Ejemplo real,
`/fr-FR/recherche/mc-05-spacing-retrieval-interleaving/`:

```
WebSite/WebPage    inLanguage= fr-FR
ScholarlyArticle    inLanguage= en      (mismo name, mismo texto)
```

**Causa raíz**: `apps/web/src/layouts/Base.astro:121-147` hardcodea
`inLanguage: locale`; `apps/web/src/pages/[locale]/[seccion]/[slug].astro:197`
sí calcula la caída honesta, pero **solo para el `ScholarlyArticle`**.

**Por qué el gate no lo agarra**: `audits/jsonld-valid.mjs:372-380` valida
`inLanguage` contra el locale de la ruta, pero exime de esa regla al
`ScholarlyArticle` en caída honesta. El nodo `WebSite`/`WebPage` nunca puede
fallar la comprobación porque siempre escribe `locale` — la aserción es
tautológicamente cierta en sintaxis y falsa en contenido. Es un hueco real
del gate, no solo de producción.

**Alcance medido** (cruzando `corpus-verificado.json` contra 47 documentos):

| locale | docs verificados | páginas afectadas |
|---|---|---|
| fr-FR | 29/47 | 18 |
| de-DE | 37/47 | 10 |
| es-ES | 38/47 | 9 |
| pt-BR | 41/47 | 6 |
| pt-PT | 41/47 | 6 |
| es-MX | 44/47 | 3 |
| **total** | | **52** |

**[BUG] `sitemap.xml` da 404.** No existe en el repo, no hay integración
`@astrojs/sitemap`, ningún generador propio — pero
`apps/web/astro.config.mjs:30` tiene un comentario que da por hecho que
existe ("Estas URLs se publicaron y están en el sitemap"). Para 329+ páginas
en 7 locales cuya estrategia de SEO es el corpus de investigación (mc-48), es
una laguna real de descubribilidad.

**[RIESGO] `robots.txt` no es un archivo del proyecto.** Responde 200 pero es
la plantilla boilerplate de "Content Signals" de Cloudflare — sin una sola
línea `User-agent:`/`Disallow:`/`Allow:`/`Sitemap:` propia. No filtra nada
indebido (`/en/app/perfil-nuevo/` → 302 a sign-in, sin fuga).

**[BIEN]**: cero 404/500 en 222 enlaces internos crawleados a 2 niveles desde
3 portadas; exactamente 20 devuelven 301 (el bug de §4, confirmado
independientemente, single-hop); los 13 enlaces externos citados
(Cloudflare, GitHub, grpc.github.io, ignia.cloud) resuelven; canonical
correcto en todas las páginas probadas, sin bleed de locale; hreflang
recíproco correcto también a nivel de artículo, no solo portada; JSON-LD
parsea correctamente en el 100% de los 8 documentos probados y `BreadcrumbList`
coincide con las migas visibles; `<title>` únicos dentro de `en`.

---

## 7. La flota de `node audits/`

### 7.1 `node audits/run.mjs` — verde

31 auditores deterministas + 14 pruebas del motor de puntuación, todos en
verde. Sin novedad frente al estado conocido del repo.

### 7.2 `node audits/live.mjs` — 22/22 verde, con una ceguera real

Ver §0.1: reporta `· sin beacon inyectado por la zona (D-037)` en verde
sobre un sitio que en Chrome real sí tiene Zaraz inyectando GA4. El auditor
valida HTML vía `curl`; Zaraz inyecta en el borde, invisible a esa técnica.
No es un auditor mentiroso — es un auditor con un punto ciego estructural
que hoy nadie más cubre.

### 7.3 `node audits/perf-vitals.mjs` — reprobó

Lighthouse real contra producción (perfil Moto G4 / Slow 4G):

```
✗ portada: LCP 2.50s, por encima de 2.5s
✗ artículo largo (mc-01, 4002 palabras): LCP 2.98s, por encima de 2.5s
```

### 7.4 `node audits/corpus-integridad.mjs` — reprobó (estado ya conocido)

36 de 282 documentos con hallazgo, concentrados en `pt-PT`/`de-DE`: cifras
CFR perdidas o alteradas (`16 CFR 312.12` → desaparece o se trunca a
`16 CFR 312`), y varios números que no siguen la convención decimal del
locale (`0.21` en vez de `0,21` en de-DE, `1,234,567` en vez de
`1.234.567` en pt-PT). No es nuevo — ya estaba documentado como el estado
actual en `audits/run.mjs`; esta corrida solo lo confirma.

### 7.5 `node audits/pwa-installable.mjs` — 12/12 verde

### 7.6 `node audits/pruebas-auditores.mjs` — verde

25/25 casos sintéticos bloquearon por la razón correcta — los auditores
atrapan lo que dicen atrapar.

### 7.7 `node audits/adversarial.mjs` — dos corridas, ambas de alcance limitado

**Hallazgo de proceso, no de producto**: `adversarial.mjs` es un auditor de
**diff**, por diseño (D-032 — 28 llamadas de LLM en cada commit sería el
ruido que la flota quiere evitar). No existe un modo que lo apunte al sitio
completo; ni siquiera `--todos` lo hace — ese flag solo fuerza a que las 28
cartas despierten sin importar si su `alcance` toca el diff, pero lo que
miran sigue siendo un diff.

- **Corrida 1** (sin `--todos`): `modo trabajo · base HEAD`. Mientras
  corría, otra sesión concurrente mergeó el PR #300 (ceremonia de passkey),
  así que lo que se auditó fue ese PR, no el sitio. 25/28 cartas despertaron
  (alcance tocaba esos archivos), 0 hallazgos, ~$0.64 reales.
- **Corrida 2** (`--todos`): `modo rama (fix/contraste-y-espaciado) · base
  2e944e2`. Rama y base que no correspondían a trabajo mío ni del dueño en
  esta sesión — otra sesión concurrente tenía esa rama activa en el mismo
  checkout compartido. 28/28 cartas despertaron, 0 hallazgos, ~$0.52 reales.
  **Momentos después, `git status` mostró un tercer estado**
  (`feat/f4-motor-adaptativo`, archivos sin commitear distintos) — confirma
  que hubo al menos una sesión más trabajando en el mismo directorio en
  tiempo real durante esta auditoría.

**Ninguna de las dos corridas cubre lo que este documento reporta** (§0-6):
esos hallazgos vienen de auditar producción desplegada, no un diff de
código. El único mecanismo que existe hoy para auditar el sitio completo
—no un cambio— son los 6 agentes secuenciales de §1-6.

---

## 8. Lo que no se cubrió

- Flujos autenticados (`/app/`) — fuera del alcance de "sitio público".
- Reflow real a 320px y contraste renderizado píxel a píxel — el agente 5 lo
  intentó con Chrome, no logró confirmarlo visualmente.
- Consentimiento real y selector de año de nacimiento del niño — viven
  detrás de sesión, no auditables con `curl` anónimo (agente 2).
- Un tercer intento de correr `adversarial.mjs` contra "todo el sitio" no se
  hizo — no existe la opción, ver §7.7.

---

## 9. Resumen, de más a menos urgente

| # | Hallazgo | Severidad | Seción |
|---|---|---|---|
| 1 | GA4/CF Web Analytics vía Zaraz, invisible en código, seguimiento entre páginas | BUG GRAVE | §0.1 |
| 2 | `/reto-demo/` completamente roto (sintaxis TS sin transpilar), 7 locales | BUG GRAVE | §0.2 |
| 3 | JSON-LD contradictorio en 52 páginas, hueco real en el gate | BUG | §6 |
| 4 | Enlace sin color propio en 3 lugares más (migas ×3, "Crear cuenta", radios fijos en reto-demo) | BUG | §3 |
| 5 | `pt-PT` mezcla convención de millares con `fr-FR` | BUG | §4 |
| 6 | `fr-FR` sin espacio insecable ni apóstrofo tipográfico | BUG | §4 |
| 7 | Slugs español hardcodeados, 301 innecesario en 5 locales | BUG | §4, §6 |
| 8 | `sitemap.xml` 404, no existe | BUG | §6 |
| 9 | `Cache-Control` sin `immutable` en assets hasheados | BUG | §5 |
| 10 | Página offline sin `lang`, español fijo | BUG | §5 |
| 11 | LCP portada 2.50s y artículo largo 2.98s, sobre presupuesto | BUG | §7.3 |
| 12 | Corpus traducido: 36/282 docs con hallazgo (conocido) | BUG (conocido) | §7.4 |
| 13 | Cero cabeceras de seguridad (CSP, Permissions-Policy, X-Frame-Options) | RIESGO medio | §2 |
| 14 | `live.mjs` ciego a inyección de borde (Zaraz) | RIESGO del gate | §7.2 |
| 15 | `robots.txt` no es del proyecto, sin `Sitemap:` | RIESGO | §6 |
| 16 | Falta `:hover` asimétrico (Entrar vs Registro) | RIESGO | §3 |
| 17 | "tocando su cara" — línea roja #1, texto no código | RIESGO | §1 |
| 18 | Campo de contraseña sin `aria-describedby` | RIESGO | §5 |
| 19 | Varios menores de accesibilidad/i18n (404 lang fijo, patos sin aria-label, ícono maskable 512-only, género gramatical inconsistente, "Serious"/"adult" colapsado) | RIESGO | §3-5 |

**Cero violaciones confirmadas de las ocho líneas rojas de CLAUDE.md.** El
código nunca pide cámara/mic/biometría ni cobra por practicar; el hallazgo
más cercano a una línea roja es textual (§1), no de código.

**Pendiente de decidir contigo**: el desglose en issues de GitHub — por
severidad, por página, o por agente. Ninguno se abrió todavía.
