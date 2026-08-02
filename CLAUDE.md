# CLAUDE.md — Math Challenge

> Reglas del proyecto. Léelas al inicio de cada sesión.

## Qué es esto

**math.kilowatto.com** — un juego de retos matemáticos PWA-first, de los 4 años
al matemático profesional, en cinco idiomas (EN/ES/FR/PT/DE), sobre Cloudflare.

Antes de tocar nada, lee en este orden:

1. [`docs/master-plan.md`](docs/master-plan.md) — el plan integral
2. [`docs/decisions.md`](docs/decisions.md) — las decisiones del dueño, con fecha
3. [`docs/research/README.md`](docs/research/README.md) — índice de 43 investigaciones

**Si una decisión ya está en `decisions.md`, no se vuelve a discutir:** se
implementa, o se le pide al dueño que la cambie explícitamente. Toda decisión
nueva se anota ahí con fecha y con la investigación que la respalda **o la
contradice**.

---

## Las ocho líneas que no se cruzan

No son preferencias. Cada una viene de evidencia documentada en
`docs/research/`, y varias tienen exposición regulatoria real.

1. **Nunca cámara, nunca micrófono, nunca biometría, nunca navegador bloqueado.**
   A nadie, en ninguna banda, en ningún nivel de anti-trampa.
2. **El niño nunca es un usuario.** Es un perfil dentro de la cuenta del padre.
   No se pide nombre real, correo, foto ni fecha exacta de nacimiento.
3. **Ningún niño escribe texto libre**, en ninguna superficie del producto.
4. **Nunca se cobra por dejar que un niño practique.** Sin corazones, sin vidas,
   sin energía que se agote.
5. **Sin moneda comprable y sin recompensas aleatorias de pago.** Las cajas de
   botín fueron declaradas juego ilegal en Bélgica y Países Bajos.
6. **La racha nunca se rompe por respetar el límite de pantalla**, y la
   protección de racha jamás se vende.
7. **Larry nunca avergüenza a un niño por equivocarse**, y nunca calcula: recibe
   el veredicto ya calculado y solo lo explica.
8. **Nunca se penaliza borrar o corregir una respuesta.** Cambiar una respuesta
   mejora la calificación el 79% de las veces (`mc-30`).

Si una tarea pide cruzar una de estas, **no la hagas**: escribe el conflicto y
pregunta.

---

## Antes de implementar algo no trivial

Investiga primero, y después hazle al dueño **preguntas de opción múltiple con
las alternativas explicadas**, en olas de 4 (límite de la herramienta). Haz todas
las preguntas cuya respuesta cambie lo que vas a construir — si son 3, son 3; si
son 40, son 40. No inventes preguntas de relleno para llegar a un número.

El dueño prefiere preguntas interactivas sobre prosa, y prefiere que sigas
avanzando en lo que la respuesta no bloquea mientras contesta.

---

## Git

- Rama por trabajo: `feat/`, `fix/`, `docs/`, `content/` + descripción corta.
- **Nunca push directo a `main`.** Todo pasa por PR.
- Commits en **Conventional Commits, en inglés**, con cuerpo que explique el qué,
  el porqué y el contexto.
- Tipos: `feat` `fix` `docs` `style` `refactor` `test` `chore` `infra` `content`.
  `content` es propio de este proyecto: cambios al banco de ítems o a los retos
  curados, que no son código pero sí son el producto.

**Cuatro reglas de commit que no son opcionales:**

1. **Nombra cada archivo borrado.** Lee `git status` antes de commitear.
2. **Toda afirmación factual debe poder re-ejecutarse.** "Gate verde, 300 tests"
   sin la salida del comando es una aserción en tono seguro, no un hecho.
3. **Toda prueba de regresión debe haberse visto fallar sin el arreglo**, con la
   evidencia pegada en el PR. Una prueba que nunca se vio fallar no prueba nada.
4. **Di lo que el cambio NO hizo.** Alcance diferido, residuos conocidos, cosas
   dejadas rotas a propósito.

---

## Idiomas

- **Código, comentarios, nombres y commits:** inglés.
- **Textos de cara al usuario:** los idiomas del producto.
- **Documentación interna:** español o inglés, lo que sea más claro. La
  investigación está en inglés con resumen ejecutivo en español.

**Para traducir el corpus de investigación, la especificación completa está en
[`AGENTS.md`](AGENTS.md)**: dónde está cada archivo, qué falta, las diez reglas
absolutas, la ficha de los siete locales, cómo se corre y cómo se verifica. Ese
archivo es autosuficiente a propósito — lo lee un agente que no conoce el
proyecto.

**Advertencia propia de este producto:** el contenido matemático **no se traduce,
se autora**. En alemán el 21 es "einundzwanzig" (uno-y-veinte) y en francés el 90
es "quatre-vingt-dix"; México usa punto decimal y el resto del mundo hispano usa
coma; `pt-PT` y `pt-BR` son dos locales distintos. Ver
`docs/research/2026-07-31-mc-34-i18n-math-notation.md`.

---

## Cloudflare

- **Todo objeto lleva prefijo `math-challenge-`.** Sin excepción, ni en pruebas
  (ahí se sufija: `math-challenge-db-dev`).
- El inventario completo — nombre, tipo, propósito EN/ES, binding — vive en
  [`docs/infrastructure.md`](docs/infrastructure.md).
- **Quien crea un recurso escribe su renglón en la bitácora de
  `infrastructure.md` en el mismo PR.** Un recurso creado y no documentado es un
  recurso que nadie va a poder borrar dentro de un año.
- **No hay despliegue automático. Tú despliegas.** Este proyecto no usa CI, así
  que nada ocurre al mergear a `main`: el sitio sigue sirviendo la versión
  anterior hasta que alguien corre `wrangler deploy`. Esta línea decía lo
  contrario y era falsa — se descubrió al mergear S2 y ver cuatro páginas nuevas
  en 404 con `main` ya actualizado.

  ```
  cd apps/web && npx wrangler deploy --env-file /tmp/vacio.env
  ```

  El `--env-file` vacío no es superstición: wrangler carga `.env` solo, y el
  `CLOUDFLARE_API_TOKEN` de Workers AI que vive ahí **eclipsa** su sesión OAuth y
  hace fallar el despliegue con `Authentication error [code: 10000]`.

- **Si compilas desde un worktree aislado (recomendado para no pisar el
  checkout compartido), copia `.env` ahí ANTES de `astro build` — es un
  archivo distinto del `--env-file` de arriba, y falta de la misma manera.**
  `.env` vive en `.gitignore` a propósito (nunca se commitea), así que un
  `git worktree add` limpio **no lo trae**. `TURNSTILE_SITE_KEY` se hornea en
  el HTML en tiempo de build (`import.meta.env`, no algo que el Worker lea
  después), así que un build sin `.env` no falla — compila perfecto y
  despliega perfecto — y sencillamente omite el widget entero de Turnstile en
  las tres puertas de registro y en `/entrar/`, en los siete locales. El
  servidor rechaza cada intento con `turnstile:sin_token`, y nadie puede
  entrar ni registrarse. Pasó de verdad, en producción, el 2026-08-02: un
  despliegue desde worktree sin este paso rompió el login del sitio entero
  durante el tiempo que tardó en notarse. `node audits/live.mjs` ahora
  comprueba el widget en las 7 rutas reales de `/entrar/` — pero es más barato
  no olvidar el archivo que confiar en que el auditor lo atrape después.

  ```
  cp /Users/estebanrey/Documents/dev/math-challenge/.env <ruta-del-worktree>/.env
  ```

- **Tras desplegar, verifica.** `node audits/live.mjs`. Los primeros segundos
  dan 404 intermitentes en rutas nuevas: es propagación del manifest de assets
  entre nodos, no un archivo faltante — se midió en F0 y se confirmó asentado al
  minuto.
- **Nunca commitees un secreto.** `wrangler secret put` o el dashboard.

---

## Contenido

El banco de ítems es producto, no datos de prueba:

- Un ítem se guarda como **estructura**, jamás como texto ya formado. Esquema en
  `docs/master-plan.md` §9.
- Todo ítem trae su arreglo de **errores con causa nombrada** — es lo que permite
  que Larry sepa *qué* error cometió el alumno y no solo que falló.
- Un ítem redactado con ayuda de IA **siempre** pasa por revisión humana. Los
  modelos escriben distractores matemáticamente válidos pero son malos
  anticipando los errores que los alumnos reales cometen (`mc-40`).
- **La unidad de diseño es la serie, no la pregunta suelta.**

---

## Imágenes

**Recraft** es la herramienta oficial para generar arte (mantiene la continuidad
del avatar de Larry, que se generó ahí). **Gemini / Nano Banana** para las piezas
complejas de interfaz.

**Las llaves nunca se commitean.** Se capturan con `./scripts/set-keys.sh`, que
las lee sin eco para que no toquen el historial del shell, y viven en `.env`
local o en `wrangler secret put`. Una llave que se pega en un chat, un commit o
la línea de comandos **está quemada: se rota, no se borra** — un secreto
commiteado sigue en el historial de git para siempre.

**Formato: AVIF con respaldo WebP**, salvo los íconos de instalación del
manifest. Da 25-50% menos peso, y el mercado objetivo es Android de gama baja
(`mc-47` §5).

La paleta y la tipografía están en [`docs/guia-de-estilo.md`](docs/guia-de-estilo.md).
El dato que sorprende a todos la primera vez: **el naranja de Ignia (`#F36B1C`),
que es el color de Larry, da 3.03:1 sobre blanco y no alcanza para texto
normal** — solo títulos grandes, botones y gráficos. `audits/brand-image.mjs` lo
verifica en cada commit.
