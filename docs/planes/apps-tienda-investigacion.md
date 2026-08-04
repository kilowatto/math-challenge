# Tres apps de tienda — investigación previa a la sesión de planeación

> **Tarea del 2026-08-03, para planeación del 2026-08-04.** El dueño pidió
> tres aplicaciones — la de la escuela, la del maestro y la consola de
> administración — como web **y** como apps nativas de tienda en
> PC/Mac/iOS/Android. Este documento propone los nombres, los usuarios de
> cada una, y las rutas reales a cada tienda con sus requisitos y costos,
> investigado en vivo el 2026-08-03.

## 1. Los nombres (propuesta — el dueño puede cambiarlos mañana)

| App | Nombre | Quién la usa | Qué hace |
|---|---|---|---|
| La del maestro | **«Profe»** | El maestro, dueño de salones (F9) | Crea y administra sus salones, ve su roster (alias, racha, puntos — D-107), rankings opt-in, códigos de unión (reset/disable, D-113), la identidad que los padres ven de él (foto, D-136) |
| La de la escuela | **«Dirección»** | La escuela como institución (F9, D-086) | Verifica y administra a sus maestros (`school_teacher`), su estado de verificación (`school`), documentos de la escuela (D-090) |
| La consola | **«Consola»** | El dueño del producto (D-089/D-102/D-116/D-121) | Las colas de revisión: escuelas pendientes, reportes de grupos, apelaciones de prendas (F10), todo lo que hoy es «SQL + correo» |

**Por qué estos nombres:** «Profe» es la voz del producto (Larry Profe —
el maestro no confunde su app con la de los niños). «Dirección» es como
se llama la administración de una escuela en español real, y deja claro
que NO es una app de alumnos. «Consola» es lo que es: una consola de
operación, sin épica que no tiene. Las tres viven bajo Math Challenge:
**Math Challenge Profe**, **Math Challenge Dirección**, **Math Challenge
Consola**.

**El dato que cambia el diseño de las tres:** sus usuarios son **todos
adultos**. Ninguna de las tres toca a un niño directamente — eso simplifica
tiendas (sin Kids Category), aunque los datos que muestran sí son de
menores (alias, racha, puntos), así que las protecciones de esquema
siguen igual.

## 2. Las rutas a cada tienda, verificadas

### Android — Google Play: TWA (Bubblewrap / PWABuilder)

- La vía estándar: **Trusted Web Activity**, una vista Chrome a pantalla
  completa de la PWA `[verificado en vivo: youngju.dev PWA guide 2026,
  github.com/GoogleChromeLabs/bubblewrap]`.
- Requisitos: **`/.well-known/assetlinks.json`** con el fingerprint
  SHA-256 del certificado de firma; keystore de Android; build AAB vía
  `npx @nicolo-ribaudo/bubblewrap init/build`; ficha de tienda; cuenta de
  desarrollador (**$25, una vez**) `[verificado en vivo: youngju.dev]`.
- Se reporta un umbral de **Lighthouse ≥ 80** `[verificado en vivo:
  mobiloud.com/blog/publishing-pwa-app-store]`.
- Compatible con nuestra arquitectura: ya somos PWA instalable; la TWA
  es el mismo manifest con otra envoltura.

### iOS — App Store: Capacitor con capacidad nativa real (la única vía segura)

- **La guideline 4.2 rechaza sitios web envueltos** («not sufficiently
  different from a web browsing experience») — es la razón de rechazo #1
  para apps WebView `[verificado en vivo: developer.apple.com/app-store/review/guidelines/,
  code2native.com 4.2 guide]`.
- Lo que Apple pide para dejarla pasar: **integración nativa real** —
  Face ID/Touch ID, push nativo, APIs del sistema `[verificado en vivo:
  code2native.com]`. Capacitor con plugins nativos es la vía documentada
  `[verificado en vivo: capacitorjs.com/docs/ios/deploying-to-app-store,
  capgo.app 2025 policy updates]`.
- **Ventaja de estas tres apps:** al ser de adultos (no de niños), no
  aplican las reglas de Kids Category (1.3, 5.1.4) que complicarían el
  caso — mc-33 las documenta para la app principal.
- Costo: cuenta de desarrollador Apple (**$99/año**), revisión de App
  Store por versión.

### PC/Mac — escritorio

- **Microsoft Store:** acepta PWA directamente vía **PWABuilder** (sin
  shell) `[verificado en vivo: youngju.dev]`.
- **macOS App Store:** no hay vía PWA directa; se necesita shell. Las
  opciones 2025-2026: **Tauri** (Rust, webview del sistema, binarios de
  ~5-20 MB, es la elección moderna) o Electron (Chromium completo,
  pesado) `[verificado en vivo: dolthub.com/blog/2025-11-13-electron-vs-tauri/]`.
  La vía sin tienda: Safari 17+ «Añadir al Dock» (mc-33), que para la
  Consola puede bastar.
- **Alternativa honesta para la Consola:** es una herramienta de una
  persona (el dueño, D-102). El costo de mantener 4 paquetes de tienda
  para una consola de operación interna es difícil de justificar —
  candidata a quedarse como PWA instalada, con tienda solo si el equipo
  de revisión crece.

## 3. Arquitectura propuesta (para discutir mañana)

**Una sola base de código, tres entradas.** Las tres apps son superficies
de adulto sobre el mismo `apps/web` (mismo `Privada.astro`, mismos
motores, mismas sesiones):

- `/[locale]/profe/` — hoy el área `/app/grupos/` de F9 es su semilla.
- `/[locale]/direccion/` — nueva, sobre `school`/`school_teacher`.
- `/[locale]/consola/` — nueva, protegida a la cuenta del dueño (hoy
  son consultas SQL del runbook de F9 §17 y F10 §9).

Las envolturas de tienda (TWA Android, Capacitor iOS, Tauri/PWABuilder
escritorio) empaquetan **la misma PWA con `start_url` distinto por app**.
Tres `manifest` (o tres builds con start_url distinto) = tres apps de
tienda que comparten despliegue. Cada una lleva su propio
`assetlinks.json`/signing y su propia ficha.

**Lo que hay que construir antes de cualquier tienda:**

1. Las tres superficies web funcionando (F9 para Profe; Dirección y
   Consola son nuevas — hoy sus funciones son runbook SQL).
2. `assetlinks.json` en producción + keystore Android + cuenta Google
   Play.
3. Capacitor con al menos una capacidad nativa real (candidata:
   biometría Face ID/Touch ID para el login de adultos — WebAuthn ya
   existe, D-038) + cuenta Apple.
4. Decisión de escritorio: PWABuilder/Microsoft Store vs. Tauri para
   macOS vs. solo PWA.

## 4. Costos y tiempos honestos

| Pieza | Costo | Nota |
|---|---|---|
| Google Play Console | $25 una vez | revisión de días la primera vez |
| Apple Developer | $99/año | revisión de días-semanas; 4.2 es el riesgo real |
| Microsoft Store | gratis la cuenta básica | PWABuilder genera el paquete |
| Tauri macOS | tiempo de build + firma/notarización Apple | notarizar exige la cuenta de $99 igual |
| Mantener 3 apps × 4 canales | el costo real: 12 frentes de actualización | por eso una sola base y `start_url` distinto |

## 5. Preguntas para la sesión de mañana

1. ¿Los nombres quedan (Profe / Dirección / Consola) o cambian?
2. ¿Las tres a tienda, o la Consola se queda PWA solamente (su usuario
   es una persona, D-102)?
3. ¿Qué capacidad nativa ofrece la app de iOS para pasar la 4.2 —
   Face ID/Touch ID (WebAuthn ya existe), push nativo, o ambas?
4. ¿Escritorio con PWABuilder/Microsoft Store y Tauri para macOS, o se
   difiere el escritorio a una segunda vuelta?
5. ¿Las tres comparten `apps/web` con `start_url` distinto (propuesta)
   o se separan en paquetes propios?
6. ¿Qué fase son? ¿F13 (Profe primero, porque F9 ya la sembró) o
   parte de F9/F10?

## Fuentes

1. youngju.dev — PWA Complete Guide 2025 (TWA, Bubblewrap, assetlinks,
   Microsoft Store) — https://www.youngju.dev/blog/culture/2026-03-24-pwa-progressive-web-apps-complete-guide-2025.en
2. MobiLoud — Publishing a PWA to the App Store and Google Play (2026) —
   https://www.mobiloud.com/blog/publishing-pwa-app-store
3. GoogleChromeLabs/bubblewrap — https://github.com/GoogleChromeLabs/bubblewrap
4. Apple — App Review Guidelines — https://developer.apple.com/app-store/review/guidelines/
5. Code2Native — How to Pass Apple App Store Guideline 4.2 in 2025 —
   https://code2native.com/blog/pass-app-store-guideline-42-review
6. Capacitor — Deploying to App Store — https://capacitorjs.com/docs/ios/deploying-to-app-store
7. capgo.app — Apple Policy Updates for Capacitor Apps 2025 —
   https://capgo.app/blog/apple-policy-updates-for-capacitor-apps-2025/
8. Dolthub — Electron vs. Tauri (2025) — https://www.dolthub.com/blog/2025-11-13-electron-vs-tauri/
9. mc-33 (interno) — la matriz PWA del proyecto: instalación iOS manual,
   TWA/Bubblewrap para Android, Capacitor para iOS, Kids Category.
