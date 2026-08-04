#!/usr/bin/env node
// ¿Los auditores atrapan lo que dicen atrapar?
//
//     node audits/pruebas-auditores.mjs [nombre-del-auditor]
//
// Por qué existe. CLAUDE.md § Git, regla 3: *"Toda prueba de regresión debe
// haberse visto fallar sin el arreglo. Una prueba que nunca se vio fallar no
// prueba nada."* Trece de estos auditores se escribieron **antes** que el código
// que vigilan (D-032 y la respuesta del dueño del 2026-08-01), así que no hay
// código real que los haga fallar. Sin algo como esto, trece auditores en verde
// serían indistinguibles de trece auditores rotos.
//
// Cómo funciona. Para cada caso: escribe un archivo que VIOLA la regla, corre el
// auditor, y exige que (a) salga distinto de cero y (b) su mensaje mencione lo
// que debía mencionar. Después borra el archivo. Si el auditor pasa en verde con
// la violación delante, el auditor está roto y esto lo dice.
//
// El archivo se escribe sin rastrear en git, que es justo lo que los auditores
// tienen que ver: `git ls-files --others --exclude-standard`. Un auditor ciego a
// archivos nuevos también falla aquí, y ese fallo ya ocurrió dos veces de verdad.

import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;

/**
 * Los casos. Cada uno es una violación mínima y concreta.
 *
 * `espera` es una subcadena que TIENE que aparecer en la salida. Sin eso, un
 * auditor que falle por una razón equivocada —una excepción, un archivo que no
 * encuentra— contaría como éxito, y esa es exactamente la clase de verde falso
 * que este archivo existe para impedir.
 */
const CASOS = [
  {
    auditor: "child-pii",
    que: "una columna de correo añadida con ALTER TABLE a una tabla de niño",
    archivo: "migrations/9999_prueba_pii.sql",
    contenido: "ALTER TABLE child_profiles ADD COLUMN email TEXT;\n",
    espera: "correo electrónico",
  },
  {
    auditor: "child-pii",
    que: "una fecha de nacimiento exacta en el CREATE TABLE",
    archivo: "migrations/9999_prueba_dob.sql",
    contenido: "CREATE TABLE child_profiles (\n  id TEXT PRIMARY KEY,\n  birth_date TEXT NOT NULL\n);\n",
    espera: "fecha exacta de nacimiento",
  },
  {
    auditor: "child-free-text",
    que: "una columna de texto libre añadida con ALTER TABLE",
    archivo: "migrations/9999_prueba_texto.sql",
    contenido: "ALTER TABLE child_profiles ADD COLUMN nota TEXT;\n",
    espera: "child_profiles",
  },
  {
    auditor: "sin-penalizacion",
    que: "una penalización por borrar una respuesta",
    archivo: "apps/web/src/lib/prueba-penalizacion.ts",
    contenido: "export function calificar(borrados: number) {\n  return 1 - borrados * 0.1; // penaliza borrar\n}\n",
    espera: "penaliz",
  },
  {
    auditor: "puntaje-servidor",
    que: "un puntaje que llega del cliente y se guarda tal cual",
    archivo: "apps/web/src/pages/api/prueba-puntaje.ts",
    contenido:
      "export async function POST({ request }: any) {\n" +
      "  const { score } = await request.json();\n" +
      "  await guardarPuntaje(score);\n" +
      "  return new Response(null, { status: 204 });\n" +
      "}\n",
    espera: "cliente",
  },
  {
    auditor: "kinder-sin-examen",
    que: "un examen de ubicación obligatorio en kinder",
    archivo: "apps/web/src/lib/prueba-kinder.ts",
    contenido:
      "export const KINDER_PLACEMENT_REQUIRED = true;\n" +
      "export function examenObligatorioKinder() { return true; }\n",
    espera: "kinder",
  },
  {
    auditor: "notacion-locale",
    que: "un formateador de números que asume un solo separador decimal",
    archivo: "apps/web/src/lib/prueba-numeros.ts",
    contenido:
      "export function formatear(n: number) {\n" +
      "  return n.toFixed(2).replace('.', ',');\n" +
      "}\n",
    espera: "decimal",
  },
  {
    auditor: "do-por-entidad",
    que: "un Durable Object global en vez de uno por entidad",
    archivo: "apps/web/src/lib/prueba-do.ts",
    contenido:
      "export function idDelObjeto(env: any) {\n" +
      "  return env.SALON.idFromName('global');\n" +
      "}\n",
    espera: "global",
  },
  {
    auditor: "telemetria-infantil",
    que: "un beacon en una superficie de niño",
    archivo: "apps/web/src/components/RetoKinder.astro",
    contenido: "---\n---\n<script src=\"https://static.cloudflareinsights.com/beacon.min.js\"></script>\n",
    espera: "superficie de niño",
  },
  {
    auditor: "motor-puntuacion",
    que: "el tiempo entrando al puntaje de kinder",
    archivo: "apps/web/src/lib/prueba-motor.ts",
    contenido:
      "export function puntajeKinder(rt: number) {\n" +
      "  let score = 1;\n" +
      "  score = score * (1000 / rt); // kinder\n" +
      "  return score;\n" +
      "}\n",
    espera: "kinder",
  },
  {
    auditor: "motor-puntuacion",
    que: "un puntaje que depende de si el usuario paga",
    archivo: "apps/web/src/lib/prueba-premium.ts",
    contenido: "export function score(base: number, premium: boolean) {\n  return premium ? base * 2 : base;\n}\n",
    espera: "línea roja #4",
  },
  {
    auditor: "tabla-bandas",
    que: "un tope de nivel por edad",
    archivo: "apps/web/src/lib/prueba-bandas.ts",
    contenido: "export const nivel_max_por_edad = { 5: 2, 6: 3 };\n",
    espera: "edad",
  },
  {
    auditor: "intercalado",
    que: "una serie ordenada por tema",
    archivo: "apps/web/src/lib/prueba-serie.ts",
    contenido:
      "export const CONSULTA_SERIE = `SELECT * FROM items ORDER BY topic ASC LIMIT 10`;\n",
    espera: "tema",
  },
  {
    auditor: "adaptativo-simulacion",
    que: "un motor adaptativo que ajusta theta sin acotar el paso",
    archivo: "apps/web/src/lib/prueba-adaptativo.ts",
    contenido:
      "export function actualizar(theta: number, acierto: number) {\n" +
      "  theta += 0.4 * (acierto - 0.5);\n" +
      "  return theta;\n" +
      "}\n",
    espera: "acotar",
  },
  {
    auditor: "signup-dos-campos",
    que: "un registro con cuatro campos",
    archivo: "apps/web/src/components/RegistroPrueba.astro",
    contenido:
      "---\n---\n<form>\n" +
      '  <input name="email" />\n' +
      '  <input name="password" />\n' +
      '  <input name="nombre" />\n' +
      '  <input name="pais" />\n' +
      "</form>\n",
    espera: "4 campos",
  },
  {
    auditor: "signup-dos-campos",
    que: "el MISMO formulario en un componente que no se llama registro",
    // El punto ciego que se midió: reconocer las pantallas solo por el nombre
    // del archivo dejaba pasar cuatro campos dentro de un `TwoFieldForm.astro`,
    // que es justo el nombre que el plan de F2 proponía.
    archivo: "apps/web/src/components/CampoDobleParaPrueba.astro",
    contenido:
      "---\n---\n<form>\n" +
      '  <input name="a" autocomplete="username webauthn" />\n' +
      '  <input name="b" autocomplete="new-password" />\n' +
      '  <input name="c" />\n' +
      '  <input name="d" />\n' +
      "</form>\n",
    espera: "4 campos",
  },
  {
    auditor: "signup-dos-campos",
    que: "un selector de fecha en la pantalla que crea el perfil del nino",
    // Linea roja #2: un <input type="date"> TIENE dia, y el dia no se pide.
    // D-053 dejo solo el año. Antes de este caso, los tres auditores que
    // deberian haberlo visto pasaban en verde.
    archivo: "apps/web/src/components/PerfilParaPrueba.astro",
    contenido: '---\n---\n<input type="date" name="nacimiento" />\n',
    espera: "type=\"date\"",
  },
  {
    auditor: "band-typography",
    que: "una familia tipográfica literal en vez del token",
    archivo: "apps/web/src/styles/prueba-tipografia.css",
    contenido: ".titulo { font-family: Comic Sans MS, cursive; }\n",
    espera: "literal",
  },
  {
    auditor: "borrado-cuatro-sistemas",
    que: "un runbook de borrado que solo cubre D1",
    archivo: "docs/prueba-erasure.md",
    contenido: "# Borrado\n\nSe corre `DELETE FROM child_profiles WHERE id = ?` en la base D1.\n",
    espera: "R2",
  },
  {
    auditor: "sin-penalizacion",
    que: "la palabra «trampa» en una superficie de niño",
    archivo: "apps/web/src/components/RetoKinderPrueba.astro",
    contenido: '---\n---\n<p>Eso fue muy rápido, ¿hiciste trampa?</p>\n',
    espera: "acusación visible",
  },
  {
    auditor: "sin-penalizacion",
    que: "un modelo de dinámica de tecleo (art. 9 del GDPR)",
    archivo: "apps/web/src/lib/prueba-ritmo.ts",
    contenido: "export function perfil(keystroke_intervals: number[]) {\n  return keystroke_intervals.reduce((a, b) => a + b, 0);\n}\n",
    espera: "biométrico",
  },
  {
    auditor: "notacion-locale",
    que: "toLocaleString con un locale de idioma sin región",
    archivo: "apps/web/src/lib/prueba-intl.ts",
    contenido: "export const f = (n: number) => n.toLocaleString('es');\n",
    espera: "sin región",
  },
  {
    auditor: "notacion-locale",
    que: "un separador decimal declarado fuera de MATH_CONVENTIONS",
    archivo: "apps/web/src/lib/prueba-sep.ts",
    contenido: "export const DECIMAL = ',';\n",
    espera: "separador fuera",
  },
  // Los tres de #321/#322. Ninguno es código: son cadenas que escribió una
  // persona, y estuvieron en producción en los siete locales sin romper nada.
  {
    // Solo corre con `dist/` construido; sin él el auditor sale en verde
    // diciéndolo, y este caso fallaría por la razón equivocada. Es el mismo
    // trato que ya tienen `axe-a11y` y `jsonld-valid`.
    auditor: "sitemap-completo",
    que: "una página construida que el sitemap no anuncia",
    archivo: "apps/web/dist/prueba-huerfana/index.html",
    contenido: "<!doctype html><html lang=\"en\"><title>huérfana</title>\n",
    espera: "el sitemap no la anuncia",
  },
  {
    auditor: "notacion-locale",
    que: "un texto pt-PT que agrupa los millares con espacio en vez de punto",
    archivo: "apps/web/src/i18n/paginas/prueba-millares.json",
    contenido: JSON.stringify({ "pt-PT": { x: "cerca de 157 000 palavras" } }, null, 2) + "\n",
    espera: "agrupa con espacio normal",
  },
  {
    auditor: "notacion-locale",
    que: "un texto fr-FR con apóstrofo recto en vez del tipográfico",
    archivo: "apps/web/src/i18n/paginas/prueba-apostrofo.json",
    contenido: JSON.stringify({ "fr-FR": { x: "un jeu d'enfant" } }, null, 2) + "\n",
    espera: "apóstrofo recto",
  },
  {
    auditor: "notacion-locale",
    que: "un texto fr-FR con espacio normal antes de un signo doble",
    archivo: "apps/web/src/i18n/paginas/prueba-espacio.json",
    contenido: JSON.stringify({ "fr-FR": { x: "Deux axes distincts : voici pourquoi" } }, null, 2) + "\n",
    espera: "espacio NORMAL antes de",
  },
  {
    auditor: "ipad-usabilidad",
    que: "un min-width de 900px sin acotar por media query",
    archivo: "apps/web/src/styles/prueba-ancho.css",
    contenido: ".panel { min-width: 900px; }\n",
    espera: "Split View",
  },
  {
    auditor: "retro-completa",
    que: "retroalimentación que elogia la capacidad en vez del proceso",
    archivo: "apps/web/src/i18n/reto/prueba.json",
    contenido: '{ "error.x": ["\u00a1Qu\u00e9 listo eres!", "sigue as\u00ed"] }\n',
    espera: "elogia la capacidad",
  },
  {
    auditor: "navegacion-unica",
    que: "un import de una librería de navegación nativa que D-064 descartó explícitamente",
    archivo: "apps/web/src/components/PruebaLibreriaNav.astro",
    contenido: '---\nimport Framework7 from "framework7";\n---\n<div></div>\n',
    espera: "framework7",
  },
  {
    auditor: "area-privada",
    que: "una pantalla de /app/ que importa el layout público en vez del privado",
    archivo: "apps/web/src/pages/[locale]/app/prueba-layout.astro",
    contenido: '---\nimport Base from "../../../layouts/Base.astro";\n---\n<Base locale="en" seccion={null} title="x" description="x"></Base>\n',
    espera: "Base.astro",
  },
  {
    // El auditor se llama `script-cliente-sin-ts`, no `scripts-inline-validos`.
    // Dos sesiones encontraron el mismo bug el mismo día —TypeScript dentro de
    // un `<script define:vars>`, que viaja crudo al navegador y mata el script
    // entero— y una registró un auditor que nunca escribió. Ese renglón muerto
    // reventaba `run.mjs` con MODULE_NOT_FOUND y bloqueaba el commit de todos.
    // El caso se conserva tal cual y apunta al auditor que sí existe.
    auditor: "script-cliente-sin-ts",
    que: "un <script define:vars> con sintaxis de TypeScript que el navegador no puede parsear",
    archivo: "apps/web/src/components/PruebaScriptTS.astro",
    contenido: '---\n---\n<script define:vars={{ x: 1 }}>\n  const el = (document.body as HTMLElement);\n</script>\n',
    espera: "lleva TypeScript",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Los duplicados de sincronización — el único auditor con la causa FUERA
  //
  // Aquí el caso de prueba no es inventado aunque se escriba a mano: el
  // archivo que aparece es literalmente lo que iCloud Drive fabrica al perder
  // un conflicto, con ese mismo nombre. Reproducirlo ES el fallo.
  //
  // El primero copia una PÁGINA, que es el caso caro: para Astro,
  // `…/app/index 2.astro` es una ruta más y se despliega. El segundo es
  // `wrangler 2.jsonc`, que es el que apareció de verdad el 2026-08-02.
  // ─────────────────────────────────────────────────────────────────────────
  {
    auditor: "archivos-duplicados",
    que: "una página fantasma dentro de apps/web/src/ — una ruta de más, servida en producción",
    archivo: "apps/web/src/pages/[locale]/app/index 2.astro",
    contenido: "---\nconst locale = 'en';\n---\n<p>copia perdedora de un conflicto de sincronización</p>\n",
    espera: "duplicado de sincronización",
  },
  {
    auditor: "archivos-duplicados",
    que: "una segunda configuración de despliegue en la raíz",
    archivo: "wrangler 2.jsonc",
    contenido: '{ "name": "math-challenge-web-copia-perdedora" }\n',
    espera: "la raíz del repositorio",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Los cuatro de #341, y por qué casi todos son de DEGRADACIÓN
  //
  // D-070: «el control negativo no basta si el caso de prueba se escribe a
  // mano». Los cuatro fallos que estos auditores existen para cazar ocurrieron
  // en archivos que siguen aquí, así que el control honesto es quitarle a ESE
  // archivo la línea que de verdad faltó — no inventar un archivo que viole.
  // ─────────────────────────────────────────────────────────────────────────

  {
    // El bug real, dos veces: `Privada.astro` sin `tokens.css`. La segunda vez
    // fue un `git checkout --theirs` resolviendo un conflicto de merge.
    auditor: "hojas-de-estilo",
    que: "el layout privado sin tokens.css — el bug que volvió con un merge",
    archivo: "apps/web/src/layouts/Privada.astro",
    parche: (t) => t.replace(/^import\s+["'].*styles\/tokens\.css["'];?\s*$/m, ""),
    espera: "NO importa styles/tokens.css",
  },
  {
    // El otro, en la pantalla del reto: no es un layout, así que la parte 1 no
    // lo cubre. Lo caza el cruce de los tokens que el CSS usa contra los que
    // sus hojas definen.
    auditor: "hojas-de-estilo",
    que: "la pantalla del reto sin tokens.css, con reto.css pidiendo --color-surface",
    archivo: "apps/web/src/components/reto/Pantalla.astro",
    parche: (t) => t.replace(/^import\s+["'].*styles\/tokens\.css["'];?\s*$/m, ""),
    espera: "sin que ninguna hoja de su cierre lo defina",
  },
  {
    // La tercera parte: un `data-*` en el <html> que ninguna hoja lee. Es el
    // modo de romperlo que, en palabras del encabezado de `bandas.css`, «no
    // deja rastro».
    auditor: "hojas-de-estilo",
    que: "una pantalla que emite data-band y no carga bandas.css",
    archivo: "apps/web/src/pages/[locale]/app/kids/index.astro",
    parche: (t) => t.replace(/^import\s+["'].*styles\/bandas\.css["'];?\s*$/m, ""),
    espera: "escribe data-band en su <html>",
  },
  {
    auditor: "componente-sin-importar",
    que: "el <Marca> sin importar que sirvió 200 con cero bytes y dejó imposible crear un perfil",
    archivo: "apps/web/src/components/paginas/PerfilNuevo.astro",
    parche: (t) => t.replace(/^import\s+Marca\s+from\s+["'][^"']*["'];?\s*$/m, ""),
    espera: "usa <Marca>",
  },
  {
    // Y además uno de archivo NUEVO, porque los dos fallos que ya ocurrieron en
    // este repo con auditores ciegos fueron con archivos sin rastrear.
    auditor: "componente-sin-importar",
    que: "un componente nuevo que usa una etiqueta que no liga",
    archivo: "apps/web/src/components/PruebaSinImportar.astro",
    contenido: "---\nconst x = 1;\n---\n<div>{x}<Marca locale=\"en\" /></div>\n",
    espera: "usa <Marca>",
  },
  // ─── `opciones-contestables`: siete casos, y ninguno toca un archivo de
  //     mentira ────────────────────────────────────────────────────────────
  //
  // El auditor cruza cuatro fuentes que escriben personas distintas —el banco,
  // `Pantalla.astro`, `presentarItem` y los catálogos del reto— porque la
  // comprobación de una sola («toda opción no numérica trae glifo») es la que
  // `validarItem` ya hace, y sería el banco comparado consigo mismo (D-070).
  //
  // Estos casos son la prueba de que cada cruce muerde: cuatro degradan el
  // banco, dos la pantalla y uno la ingesta. Si alguno pasara en verde, la
  // fuente que degrada no se estaría leyendo de verdad.
  {
    // Regresión directa de #349: sin `dibujos`, `presentarItem` cae a
    // `texto: String(v)` y el botón vuelve a decir `casilla3` — que es
    // literalmente lo que el dueño vio en su teléfono.
    auditor: "opciones-contestables",
    que: "una opción de cadena que se serviría como su identificador interno",
    archivo: "packages/motor/src/banco-kinder.ts",
    parche: (t) => t.replace("      dibujos,\n", "      dibujos: {},\n"),
    espera: "K13 · opción servida como su identificador",
  },
  {
    // #347, tal cual ocurrió: un glifo escrito en la pantalla es una segunda
    // lista del mismo hecho, y las dos listas se separan sin que nada falle.
    // No se toca el banco: se degrada el RENDERIZADOR.
    auditor: "opciones-contestables",
    que: "la pantalla vuelve a escribir un glifo suyo en vez de dibujar el del ítem",
    archivo: "apps/web/src/components/reto/Pantalla.astro",
    parche: (t) => t.replace("b.textContent = glifo;", 'b.textContent = "🦆";'),
    espera: "la pantalla inventa el glifo",
  },
  {
    // El lado banco del mismo cruce: la pantalla lee `vars.glifo` y el ítem
    // deja de traerlo. No falla, no avisa — cae al respaldo y dibuja un punto
    // negro donde el enunciado dijo «piedrita».
    auditor: "opciones-contestables",
    que: "el banco deja de mandar el glifo que la pantalla lee",
    archivo: "packages/motor/src/banco-kinder.ts",
    parche: (t) => t.replace("vars: { n, glifo: GLIFOS_CONTAR[cosa] ?? GLIFOS_CONTAR[0] },", "vars: { n },"),
    espera: "K03 · la pantalla dibuja esta escena con vars.glifo",
  },
  {
    // Y el mismo cruce degradando el otro lado: la pantalla empieza a leer una
    // variable que nadie manda. El auditor tiene que verlo sin que nadie le
    // diga que la pantalla cambió.
    auditor: "opciones-contestables",
    que: "la pantalla empieza a leer una variable de glifo que el banco no manda",
    archivo: "apps/web/src/components/reto/Pantalla.astro",
    parche: (t) => t.replace('glifoDe(v, "glifoB")', 'glifoDe(v, "glifoC")'),
    espera: "K05 · la pantalla dibuja esta escena con vars.glifoC",
  },
  {
    // El bug silencioso de #347: la fila del patrón se dibuja con una lista y
    // las opciones con otra. Las dos son correctas por separado, y la respuesta
    // correcta no está en pantalla.
    auditor: "opciones-contestables",
    que: "la opción dibuja una figura que no aparece en la escena",
    archivo: "packages/motor/src/banco-kinder.ts",
    parche: (t) => t.replace('glifo: GLIFO_DE_FORMA[figurasDelCiclo[k]] ?? "●",', 'glifo: "★",'),
    espera: "K14 · la opción dibuja algo que no está en la escena",
  },
  {
    // El cable entre el ítem y el botón. Renombrar un campo en la ingesta no
    // rompe nada visible: sale `undefined` y el montón se dibuja con una sola
    // figura, así que «¿de qué lado hay más?» vuelve a ser una moneda al aire.
    auditor: "opciones-contestables",
    que: "la ingesta renombra un campo del dibujo y la pantalla sigue leyendo el viejo",
    archivo: "apps/ingest/src/index.ts",
    parche: (t) => t.replace("cuantos: dib.cuantos ?? 1,", "repite: dib.cuantos ?? 1,"),
    espera: "la pantalla lee `o.dibujo.cuantos`",
  },
  {
    // Fallar CERRADO. Si la pantalla cambia de forma, el auditor no puede
    // comprobar nada — y entonces bloquea, en vez de pasar en verde sobre el
    // banco entero. Es el caso que abrió esta reescritura: la tabla `FIGURAS`
    // que el auditor anterior leía desapareció, porque ERA el bug.
    auditor: "opciones-contestables",
    que: "el renderizador cambia de forma y el auditor se queda sin segunda fuente",
    archivo: "apps/web/src/components/reto/Pantalla.astro",
    parche: (t) => t.replace("function pintarEscena", "function pintarLaEscena"),
    espera: "no pude leer una de las fuentes",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // F6 · la explicación pregenerada — los seis controles negativos
  //
  // Los seis son de DEGRADACIÓN (D-070). Los dos auditores nacieron verdes
  // porque el módulo se construyó con ellos delante, y eso es exactamente el
  // caso donde un control negativo escrito a mano no vale: probaría que el
  // auditor sabe leer un archivo inventado, no que habría cazado la erosión.
  // Aquí se le quita al archivo REAL la propiedad que lo hace seguro.
  // ─────────────────────────────────────────────────────────────────────────

  {
    // La lista blanca crece con un campo que trae los operandos. Es el modo de
    // falla más probable de todos: nadie escribe `calcular()`, alguien añade un
    // campo «que hace falta para explicar mejor».
    auditor: "larry-nunca-calcula",
    que: "los operandos entran al sobre de Larry por un campo nuevo en la lista blanca",
    archivo: "packages/motor/src/explicacion.ts",
    parche: (t) => t.replace('  "materia",\n', '  "materia",\n  "vars",\n'),
    espera: "un campo `vars`",
  },
  {
    // Aritmética en el camino de explicación. La resta de aquí es inocente y
    // hace lo mismo que el `some()` que sustituye — y ese es el punto: la regla
    // no es «no calcules mal», es «no calcules».
    auditor: "larry-nunca-calcula",
    que: "una operación aritmética dentro del módulo de explicación",
    archivo: "packages/motor/src/explicacion.ts",
    parche: (t) =>
      t.replace(
        "const describeSinDictaminar = pasos.some((p) => !p.dictamina);",
        "const describeSinDictaminar = pasos.length - pasos.filter((p) => p.dictamina).length > 0;",
      ),
    espera: "hace aritmética: una resta",
  },
  {
    // El llamador se salta el sellado. El tipo de TypeScript no lo impide en
    // tiempo de ejecución: el veredicto llega de otro Worker por RPC, así que lo
    // que ese Worker añada mañana viajaría entero.
    auditor: "larry-nunca-calcula",
    que: "el endpoint compone la explicación sin sellar el sobre",
    archivo: "apps/web/src/pages/api/jugar.ts",
    parche: (t) =>
      t.replace(
        "sellarSobre(veredicto as unknown as Record<string, unknown>),",
        "(veredicto as unknown as Record<string, unknown>),",
      ),
    espera: "sin sellar el sobre",
  },
  {
    // Comparación normativa en un texto real, en un solo locale. Se eligió una
    // construcción que el regex de `retro-completa` NO caza —no lleva ninguna
    // palabra de capacidad— para que el caso demuestre lo que este auditor
    // añade y no lo que ya estaba cubierto.
    auditor: "larry-nunca-averguenza",
    que: "un texto de error que compara al niño con los demás, en es-MX y solo ahí",
    archivo: "apps/web/src/i18n/reto/es-MX.json",
    parche: (t) => t.replace('"Se saltó uno.",', '"Los demás niños ya lo lograron.",'),
    espera: "comparacion",
  },
  {
    // El marcador desnudo. Shute (`mc-11` §5): decir que hubo un fallo sin decir
    // qué hacer con él es de los tipos de retroalimentación más pobres medidos.
    // El JSON sigue impecable — se rompe QUIEN LO JUNTA, que es justo lo que
    // `retro-completa` no puede ver.
    auditor: "larry-nunca-averguenza",
    que: "la segunda frase se pierde al componer y el fallo llega como marcador desnudo",
    archivo: "packages/motor/src/explicacion.ts",
    parche: (t) => t.replace("      siguiente: texto[1],", '      siguiente: "",'),
    espera: "marcador desnudo",
  },
  {
    // #349 otra vez, en otra superficie: cuando falta texto se imprime el
    // identificador. Es literalmente lo que un niño de cuatro años vio en su
    // teléfono — tres botones que decían `casilla3`, `casilla0` y `casilla1`.
    auditor: "larry-nunca-averguenza",
    que: "una causa sin autorar se pinta como su clave en vez del genérico",
    archivo: "packages/motor/src/explicacion.ts",
    parche: (t) =>
      t.replace(
        "    titulo: generico ? generico[0] : RESPALDO.titulo,",
        "    titulo: sobre.causa ?? (generico ? generico[0] : RESPALDO.titulo),",
      ),
    espera: "imprime la CLAVE",
  },

  // ─── Los tres de F7: cosméticos deterministas y la racha ─────────────────
  //
  // Ocho casos, y la mayoría son de DEGRADACIÓN (D-070) sobre `racha.ts` y
  // `cosmeticos.ts` reales. Los dos motores se escribieron con sus auditores
  // delante, así que nacieron verdes — y ése es justo el caso donde un archivo
  // de prueba inventado no vale: probaría que el auditor sabe leer un archivo
  // que nadie va a escribir, no que habría cazado la erosión del que sí existe.
  //
  // Los tres casos que SÍ plantan un archivo son los del esquema y los de una
  // ruta, porque la tabla del catálogo (#253) y la ruta de cierre de sesión
  // todavía no existen. Sin ellos, tres de las reglas del auditor estarían
  // en verde sin haber mirado nunca una fila — que es exactamente lo que D-070
  // llama una comprobación decorativa.

  {
    // El azar más probable de todos, y el más inocente de escribir: un
    // desempate «que da igual» en el orden de salida. mc-17 §7: una sorpresa,
    // aunque sea gratis y aunque sea cosmética, cae en el radio de las cajas
    // de botín que Bélgica y Países Bajos declararon juego ilegal.
    auditor: "cosmeticos-deterministas",
    que: "un Math.random() en el camino que otorga un cosmético",
    archivo: "packages/motor/src/cosmeticos.ts",
    parche: (t) => t.replace("return [...ganados].sort();", "return [...ganados].sort(() => Math.random() - 0.5);"),
    espera: "azar en el camino",
  },
  {
    // El eje DINÁMICO por separado, sin una sola palabra que un grep pueda
    // encontrar: se quita el `.sort()` y la salida pasa a depender del orden en
    // que D1 devolvió las filas. El auditor estático no puede ver esto; el que
    // ejecuta el módulo con las reglas barajadas, sí.
    auditor: "cosmeticos-deterministas",
    que: "la salida depende del orden de las reglas, sin ningún generador de azar",
    archivo: "packages/motor/src/cosmeticos.ts",
    parche: (t) => t.replace("return [...ganados].sort();", "return [...ganados];"),
    espera: "NO es determinista",
  },
  {
    auditor: "cosmeticos-deterministas",
    que: "una columna de precio en la tabla del catálogo de cosméticos",
    archivo: "migrations/9999_prueba_cosmetico_precio.sql",
    contenido:
      "CREATE TABLE cosmetic_catalog (\n" +
      "  id TEXT PRIMARY KEY,\n" +
      "  es_inicial INTEGER NOT NULL DEFAULT 0,\n" +
      "  price_cents INTEGER NOT NULL DEFAULT 0\n" +
      ");\n",
    espera: "moneda comprable",
  },
  {
    auditor: "cosmeticos-deterministas",
    que: "un cosmético que no es inicial y no tiene ninguna regla de desbloqueo",
    archivo: "migrations/9999_prueba_cosmetico_huerfano.sql",
    contenido:
      "INSERT INTO cosmetic_catalog (id, es_inicial) VALUES\n" +
      "  ('melena_dorada', 0),\n" +
      "  ('marco_sabana', 1);\n" +
      "INSERT INTO cosmetic_unlock_rules (cosmetic_id, tipo_evento, parametro, umbral) VALUES\n" +
      "  ('marco_sabana', 'primer_intento', NULL, NULL);\n",
    espera: "camino de obtención",
  },
  {
    auditor: "cosmeticos-deterministas",
    que: "una regla con un tipo de evento fuera del enum cerrado",
    archivo: "migrations/9999_prueba_cosmetico_evento.sql",
    contenido:
      "INSERT INTO cosmetic_catalog (id, es_inicial) VALUES ('gorro_cumple', 0);\n" +
      "INSERT INTO cosmetic_unlock_rules (cosmetic_id, tipo_evento, parametro, umbral) VALUES\n" +
      "  ('gorro_cumple', 'cumpleanios', NULL, NULL);\n",
    espera: "enum cerrado",
  },
  {
    // Nadie escribe `venderEscudo()`. Alguien agrega «un parámetro que hace
    // falta», y es exactamente el patrón que mc-16 documenta en Duolingo: las
    // vías de obtención del Streak Freeze se mezclan con gemas comprables.
    auditor: "racha-nunca-se-vende",
    que: "ganarEscudos gana un parámetro de pago",
    archivo: "packages/motor/src/racha.ts",
    parche: (t) =>
      t.replace(
        "export function ganarEscudos(estado: EstadoRacha): EstadoRacha {",
        "export function ganarEscudos(estado: EstadoRacha, precioEnCentavos: number): EstadoRacha {",
      ),
    espera: "parámetro de pago",
  },
  {
    // La otra forma, sin tocar ninguna firma: una constante de precio al lado
    // del tope de escudos. Es cómo se ve una tienda antes de ser una tienda.
    auditor: "racha-nunca-se-vende",
    que: "una constante de precio junto al tope de escudos",
    archivo: "packages/motor/src/racha.ts",
    parche: (t) =>
      t.replace(
        "export const TOPE_ESCUDOS = 2;",
        "export const TOPE_ESCUDOS = 2;\nexport const PRECIO_ESCUDO_EXTRA = 0.99;",
      ),
    espera: "dinero a",
  },
  {
    // D-014, textual: «si el límite de pantalla corta la sesión, la racha del
    // día se da por cumplida». Aquí se le mete al motor la rama que trata
    // distinto al límite — y se le mete a FAVOR de romper, que es la dirección
    // que nadie escribiría a propósito y todos escribirían por descuido.
    auditor: "racha-limite-no-rompe",
    que: "el motor trata distinto al límite de pantalla y le reinicia la racha",
    archivo: "packages/motor/src/racha.ts",
    parche: (t) =>
      t.replace(
        "  if (brecha === 1) {\n",
        '  if (brecha === 1) {\n' +
          '    if (motivo.tipo === "LIMITE_DE_PANTALLA_CORTO_LA_SESION") {\n' +
          "      return conDia(estado, dia, 1, estado.shields_available);\n" +
          "    }\n",
      ),
    espera: "ENTRA en la aritmética",
  },
  {
    // El motor puede ser perfecto y la racha romperse igual, porque quien
    // cierra la sesión decidió por su cuenta. Es el eje que el barrido del
    // motor no puede ver.
    auditor: "racha-limite-no-rompe",
    que: "una ruta que reinicia la racha cuando el corte fue del límite de pantalla",
    archivo: "apps/web/src/lib/prueba-racha-limite.ts",
    contenido:
      "export async function cerrarSesion(db: any, id: string, cortadaPorLimite: boolean) {\n" +
      "  if (cortadaPorLimite === true) {\n" +
      "    await db.prepare('UPDATE child_streak SET current_streak = 0 WHERE id = ?').bind(id).run();\n" +
      "  }\n" +
      "}\n",
    espera: "reinicia la racha",
  },

  // ─── Los dos de la segunda tanda: XP y el léxico de la racha ────────────
  //
  // Seis casos más, cinco de ellos degradando los archivos REALES. `xp.ts` y
  // los siete JSON de racha se escribieron con sus auditores delante, así que
  // nacieron verdes: un caso inventado probaría que el auditor sabe leer un
  // archivo falso, no que habría cazado la erosión del verdadero.

  {
    // La mezcla que D-055 existe para impedir, y que ya se intentó una vez en
    // este repo: alguien afirma que «XP es el mismo número que los puntos». En
    // KINDER coinciden por construcción, así que nada se rompe a la vista.
    auditor: "motor-xp",
    que: "una expresión que suma el XP con los puntos del tablero",
    archivo: "apps/web/src/lib/prueba-xp-mezcla.ts",
    contenido:
      "export function totalDelNino(fila: any) {\n" +
      "  return fila.total_xp + fila.total_score;\n" +
      "}\n",
    espera: "dos monedas",
  },
  {
    // El reloj entrando al XP. D-055: el XP no ve el tiempo en NINGUNA banda,
    // ni siquiera en PRO donde el puntaje sí lo usa.
    auditor: "motor-xp",
    que: "el tiempo de respuesta entra en la fórmula de XP",
    archivo: "packages/motor/src/xp.ts",
    parche: (t) =>
      t.replace(
        "export function xpDeItem(nivel: number, acc: 0 | 1): number {",
        "export function xpDeItem(nivel: number, acc: 0 | 1, rtMs: number): number {",
      ),
    espera: "no depende del reloj",
  },
  {
    // La tabla publicada dejando de coincidir con la fórmula. Una tabla que
    // miente sobre el umbral es una caja sorpresa con otro nombre.
    auditor: "motor-xp",
    que: "la tabla publicada de rangos deja de salir de la fórmula",
    archivo: "packages/motor/src/xp.ts",
    parche: (t) =>
      t.replace(
        "      xpParaEntrar,\n",
        "      xpParaEntrar: xpParaEntrar + 1,\n",
      ),
    espera: "tabla publicada",
  },
  {
    // Azar en el otorgamiento de XP. mc-17 (implicación 3) y mc-43 (hallazgo
    // 5): el refuerzo de razón variable no necesita dinero para dañar a un niño.
    auditor: "motor-xp",
    que: "la recompensa de XP varía entre llamadas",
    archivo: "packages/motor/src/xp.ts",
    parche: (t) =>
      t.replace(
        "export function xpDeTipo(tipo: string): number {\n  const v = XP_POR_TIPO[tipo];",
        "export function xpDeTipo(tipo: string): number {\n  const v = XP_POR_TIPO[tipo] + Math.floor(Math.random() * 5);",
      ),
    espera: "azar",
  },
  {
    // El copy exacto que mc-17 §83 manda sustituir, en un solo locale.
    auditor: "racha-lexico",
    que: "«no pierdas tu racha» en es-MX y solo ahí",
    archivo: "apps/web/src/i18n/racha/es-MX.json",
    parche: (t) => t.replace('"Hoy ya cuenta"', '"No pierdas tu racha: hoy todavía cuenta"'),
    espera: "perdida",
  },
  {
    // La otra categoría nombrada por la FTC, en otro locale, para que el caso
    // demuestre que las siete listas están vivas y no solo la española.
    auditor: "racha-lexico",
    que: "una cuenta regresiva en el texto de de-DE",
    archivo: "apps/web/src/i18n/racha/de-DE.json",
    parche: (t) => t.replace('"Heute zählt"', '"Nur noch 3 Stunden, dann läuft ab"'),
    espera: "urgencia",
  },

  // ─── La voz (#135, D-078) ────────────────────────────────────────────────
  //
  // Cinco casos, y los cinco son degradaciones del archivo REAL. La razón está
  // en D-070: un archivo inventado prueba que el auditor sabe leer un archivo
  // inventado. Lo que hay que probar aquí es otra cosa — que entre
  // `speechSynthesis` (permitido, es salida) y `SpeechRecognition` (prohibido,
  // es el micrófono) el auditor sabe cuál es cuál, cuando se escriben casi
  // igual y viven en el mismo objeto `window`.
  {
    auditor: "voz-solo-salida",
    que: "el micrófono entra en la pantalla del reto disfrazado de voz",
    archivo: "apps/web/src/components/reto/Pantalla.astro",
    parche: (t) =>
      t.replace(
        "const sintesis = typeof window.speechSynthesis !== \"undefined\" ? window.speechSynthesis : null;",
        "const sintesis = typeof window.SpeechRecognition !== \"undefined\" ? window.SpeechRecognition : null;",
      ),
    espera: "MICRÓFONO",
  },
  {
    auditor: "voz-solo-salida",
    que: "Larry dice en voz alta algo que no está escrito en la pantalla",
    archivo: "apps/web/src/components/reto/Pantalla.astro",
    parche: (t) => t.replace("      decir(actual.enunciado);", '      decir("A ver si esta vez sí.");'),
    espera: "línea roja #7",
  },
  {
    auditor: "voz-solo-salida",
    que: "los botones de voz se ofrecen en un aparato que no tiene voz",
    archivo: "apps/web/src/components/reto/Pantalla.astro",
    parche: (t) => t.replace('<div id="voz" class="voz" hidden>', '<div id="voz" class="voz">'),
    espera: "nacen con `hidden`",
  },
  {
    auditor: "voz-solo-salida",
    que: "el cliente acepta una voz de otra región — `pt-BR` leyendo a un niño de `pt-PT`",
    archivo: "apps/web/src/components/reto/Pantalla.astro",
    parche: (t) =>
      t.replace(
        "      return voces.find((v) => normalizar(v.lang) === objetivo) || null;",
        "      return voces.find((v) => normalizar(v.lang).startsWith(objetivo.slice(0, 2))) || null;",
      ),
    espera: "coincidencias PARCIALES",
  },
  {
    auditor: "voz-solo-salida",
    que: "un locale se queda sin rótulo de voz y le habla en inglés a quien no lo lee",
    archivo: "apps/web/src/i18n/reto/de-DE.json",
    parche: (t) => t.replace(/^\s*"juego\.sinVoz":.*\n/m, ""),
    espera: "falta `juego.sinVoz`",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // F6 #136 — el camino EN VIVO y el tope de gasto.
  //
  // Los ocho casos DEGRADAN el archivo real, por lo mismo que los de arriba: el
  // camino en vivo se construyó con sus auditores delante, así que un archivo
  // inventado probaría que el auditor sabe leer un archivo inventado, no que
  // habría cazado la erosión (D-070).
  //
  // Y cada degradación es una que alguien haría de buena fe. Ninguna es
  // sabotaje: son «un campo más que hace falta para explicar mejor», «reservar
  // después de llamar, que queda más limpio», «si no viene `usage` no cobramos
  // nada, que es lo justo». Ésas son las que llegan a producción.
  // ─────────────────────────────────────────────────────────────────────────

  {
    // El sobre en vivo deja de ser el sobre del motor y pasa a copiarle los
    // campos. Es el momento exacto en que nacen dos listas blancas.
    auditor: "larry-en-vivo",
    que: "el sobre en vivo copia los campos del sobre sellado en vez de contenerlo",
    archivo: "packages/tutor/src/en-vivo.ts",
    parche: (t) =>
      t.replace(
        "export interface SobreEnVivo {\n  /** Sellado por el motor. La MISMA lista blanca, no una copia de ella. */\n  sobre: SobreParaLarry;",
        "export interface SobreEnVivo {\n  acc: 0 | 1;\n  sobre: SobreParaLarry;",
      ),
    espera: "SobreEnVivo",
  },
  {
    // El campo que trae los operandos, otra vez, en el otro camino. Es el modo
    // de falla más probable de los dos: nadie escribe `calcular()`.
    auditor: "larry-en-vivo",
    que: "los operandos entran al camino en vivo por un campo nuevo",
    archivo: "packages/tutor/src/en-vivo.ts",
    parche: (t) => t.replace("  /** Por qué se llama. Cerrado a dos valores. */", "  vars: Record<string, string>;\n  /** Por qué se llama. Cerrado a dos valores. */"),
    espera: "campo `vars`",
  },
  {
    // El endpoint devuelve un error donde tenía que devolver la pregenerada. Es
    // el fallo que deja un hueco en la pantalla de un niño que pidió ayuda.
    auditor: "larry-en-vivo",
    que: "una respuesta del camino en vivo se queda sin la explicación pregenerada",
    archivo: "apps/web/src/pages/api/larry.ts",
    parche: (t) =>
      t.replace(
        'return json({ ok: true, explicacion: pregenerada, via: "pregenerada", motivo: fallo ?? "vacia" });',
        'return json({ ok: true, via: "pregenerada", motivo: fallo ?? "vacia" });',
      ),
    espera: "sin `explicacion`",
  },
  {
    // El id del niño en la metadata del gateway. Nadie lo pondría a propósito;
    // se pone porque «así se puede depurar qué perfil falló».
    auditor: "larry-en-vivo",
    que: "el id del perfil viaja en la metadata del AI Gateway",
    archivo: "apps/web/src/pages/api/larry.ts",
    parche: (t) => t.replace("metadata: { pd, banda: tema, locale }", "metadata: { pd, banda: tema, locale, perfil: quien.id }"),
    espera: "metadata del AI Gateway",
  },
  {
    // La compuerta de salida se queda escrita y sin llamar. Es el bug de
    // `funcion-sin-llamar`: la regla parece viva porque tiene prueba.
    auditor: "larry-en-vivo",
    que: "la compuerta de salida deja de llamarse desde el endpoint",
    archivo: "apps/web/src/pages/api/larry.ts",
    parche: (t) =>
      t.replace(
        ": juzgarSalida({ texto, locale, banda: tema, lexico: construcciones });",
        ": [];",
      ),
    espera: "juzgarSalida",
  },
  {
    // Sin `usage` no se cobra nada. Es la degradación que suena JUSTA y que
    // convierte el medidor en un contador de ceros.
    auditor: "larry-tope-gasto",
    que: "una llamada sin `usage` se cobra a cero en vez de al máximo de la banda",
    archivo: "packages/tutor/src/gasto.ts",
    parche: (t) =>
      t.replace(
        '  if (typeof entrada !== "number" || typeof salida !== "number") return costoMaximo(banda);',
        '  if (typeof entrada !== "number" || typeof salida !== "number") return 0;',
      ),
    espera: "contador de ceros",
  },
  {
    // Reservar después de llamar. Queda más limpio de leer y convierte el tope
    // en «el tope, más una llamada» — y la de más es siempre la más cara.
    auditor: "larry-tope-gasto",
    que: "el endpoint reserva después de llamar al modelo en vez de antes",
    archivo: "apps/web/src/pages/api/larry.ts",
    parche: (t) =>
      t.replace(
        'const reserva = await medirTutor(env.RATE_LIMITER, { pd, banda: tema, tope, accion: "reservar" });',
        "const reserva = { permitido: true, motivo: \"sin_reserva\" };",
      ),
    espera: "no reserva antes de llamar",
  },
  {
    // El plan gratis con un gusto. D-021 ya lo respondió y un diseño de F6 lo
    // propuso igual, sin notarlo.
    auditor: "larry-tope-gasto",
    que: "el plan gratis recibe llamadas en vivo, contra D-021",
    archivo: "packages/tutor/src/gasto.ts",
    parche: (t) =>
      t.replace(
        "    PRIMARIA: { llamadas: 0, microdolares: 0 },\n    SECUNDARIA: { llamadas: 0, microdolares: 0 },",
        "    PRIMARIA: { llamadas: 12, microdolares: 3000 },\n    SECUNDARIA: { llamadas: 0, microdolares: 0 },",
      ),
    espera: "D-021",
  },
  {
    // El medidor falla ABIERTO. Es la copia mecánica de `consultarLimite`, que
    // sí falla abierto y a propósito — y aquí eso es barra libre de inferencia.
    auditor: "larry-tope-gasto",
    que: "el medidor de gasto falla ABIERTO cuando su objeto no responde",
    archivo: "apps/web/src/lib/ratelimiter.ts",
    parche: (t) =>
      t.replace(
        'const cerrado: MedidaTutor = { ...ESTADO_VACIO, permitido: false, motivo: "sin_medidor" };',
        'const cerrado: MedidaTutor = { ...ESTADO_VACIO, permitido: true, motivo: "sin_medidor" };',
      ),
    espera: "fallar CERRADO",
  },
  // ─────────────────────────────────────────────────────────────────────────
  // F7 · Ligas, tablero y duelo (#237-#250, D-081)
  //
  // Los doce DEGRADAN el archivo real, salvo los dos que tienen que crear uno
  // que no existe. La razón es D-070 y es la misma que en las tandas de arriba:
  // el subsistema social se construyó CON sus auditores delante, así que un
  // archivo inventado probaría que el auditor sabe leer un archivo inventado.
  //
  // Y cada degradación es una que alguien haría de buena fe: «guardo el
  // `total_xp` aquí para no consultarlo dos veces», «pongo el nombre, que se
  // entiende mejor», «un `last_seen` para saber si vale la pena retarlo».
  // Ninguna es sabotaje, y ésas son las que llegan a producción.
  // ─────────────────────────────────────────────────────────────────────────

  {
    // La condición 1 de D-081 se rompe por el import, antes que por la llamada.
    auditor: "liga-no-quita",
    que: "el motor de liga importa el de racha",
    archivo: "packages/motor/src/liga.ts",
    parche: (t) =>
      t.replace(
        'import { NIVELES_POR_BANDA, type Banda } from "./puntuacion.ts";',
        'import { NIVELES_POR_BANDA, type Banda } from "./puntuacion.ts";\nimport { ganarEscudos } from "./racha.ts";',
      ),
    espera: "motor de racha",
  },
  {
    // «Guardo el XP aquí para no consultarlo dos veces». Una semana después,
    // alguien lo actualiza desde aquí.
    auditor: "liga-no-quita",
    que: "la tabla de membresía gana una columna de XP",
    archivo: "migrations/0012_ligas_tablero_duelo.sql",
    parche: (t) =>
      t.replace(
        "  points_this_week INTEGER NOT NULL DEFAULT 0,",
        "  points_this_week INTEGER NOT NULL DEFAULT 0,\n  total_xp         INTEGER NOT NULL DEFAULT 0,",
      ),
    espera: "total_xp",
  },
  {
    // «Pon el nombre, que se entiende mejor». La primera pantalla que alguien
    // maquete de una liga.
    auditor: "alias-nunca-nombre",
    que: "el tablero publica un nombre escrito en vez del alias generado",
    archivo: "packages/motor/src/tablero.ts",
    parche: (t) =>
      t.replace(
        "export interface FilaDeTablero {\n  readonly alias: string;",
        "export interface FilaDeTablero {\n  readonly display_name: string;",
      ),
    espera: "display_name",
  },
  {
    // El descenso deja de respetar a quien no jugó. Es la extensión razonada de
    // D-014 que #241 marca como tal: no jugar no es perder.
    auditor: "liga-ascenso-determinista",
    que: "el descenso vuelve a alcanzar a los inactivos",
    archivo: "packages/motor/src/liga.ts",
    parche: (t) => t.replace("  const activos = tabla.filter(estaActivo);", "  const activos = tabla;"),
    espera: "inactivo",
  },
  {
    // La partición que no está en ninguna decisión, y por eso es la que se
    // pierde en la primera refactorización.
    auditor: "liga-sin-fusion-cohorte",
    que: "la llave de cohorte deja de distinguir niño de adulto",
    archivo: "packages/motor/src/liga.ts",
    parche: (t) =>
      t.replace(
        "  return `${banda}|${tipo}|e${escalon}|${weekStart}`;",
        "  return `${banda}|e${escalon}|${weekStart}`;",
      ),
    espera: "no distingue niño de adulto",
  },
  {
    // El portón que un `if` mal escrito abre sin dar ningún error.
    auditor: "duelo-elegibilidad",
    que: "el portón de KINDER deja de cerrarse",
    archivo: "packages/motor/src/duelo.ts",
    parche: (t) =>
      t.replace(
        'if (retador.banda === "KINDER") return { puede: false, motivo: "banda_kinder" };',
        'if (retador.banda === "NINGUNA") return { puede: false, motivo: "banda_kinder" };',
      ),
    espera: "banda_kinder",
  },
  {
    // «Un `last_seen` para saber si vale la pena retarlo». Convierte un reto
    // asíncrono en una sala de espera, y quien espera es un niño (D-081 cond. 2).
    auditor: "duelo-elegibilidad",
    que: "el duelo gana una columna de presencia",
    archivo: "migrations/0012_ligas_tablero_duelo.sql",
    parche: (t) =>
      t.replace(
        "  item_set                 TEXT NOT NULL,",
        "  item_set                 TEXT NOT NULL,\n  last_seen                INTEGER,",
      ),
    espera: "presencia",
  },
  {
    // El opt-in del tablero desaparece de la consulta. D-040 se hace cumplir en
    // el JOIN justamente porque un filtro en código se olvida en la segunda ruta.
    auditor: "tablero-orden-puntos",
    que: "la consulta del tablero de niños pierde el cruce con el consentimiento",
    archivo: "packages/motor/src/tablero.ts",
    parche: (t) =>
      t.replace(
        "JOIN child_consents c\n  ON c.child_profile_id = p.id\n AND c.consent_code = 'LEADERBOARD'\n AND c.revoked_at IS NULL\n",
        "",
      ),
    espera: "child_consents",
  },
  {
    // El Durable Object empieza a guardar el intento crudo. A diferencia de D1,
    // un DO no topa en 10 GB: crece sin que nada avise (mc-32 riesgo #1).
    auditor: "no-attempts-in-d1",
    que: "el Durable Object de la liga guarda el itemId del intento",
    archivo: "apps/web/src/lib/liga-do.ts",
    parche: (t) =>
      t.replace(
        "  points_this_week: number;\n  active_days: number;",
        "  points_this_week: number;\n  item_id: string;\n  active_days: number;",
      ),
    espera: "item_id",
  },
  {
    // Lenguaje de pérdida en un texto de liga, CON ACENTO — que es justo lo que
    // el `\b` de JavaScript no cazaba: /\bse acab[oó]\b/ no encuentra «Se acabó».
    auditor: "racha-lexico",
    que: "un texto de liga habla de que algo se acabó (con acento)",
    archivo: "apps/web/src/i18n/liga/es-MX.json",
    parche: (t) =>
      t.replace('"liga.se_queda": "Se queda en esta liga",', '"liga.se_queda": "Se acabó tu racha",'),
    espera: "perdida",
  },
  {
    // Una pantalla de kinder que pinta el número de posición. D-081: tercios,
    // nunca el número exacto.
    auditor: "kinder-sin-examen",
    que: "una superficie de kinder pinta la posición exacta",
    archivo: "apps/web/src/components/kids/TableroKinder.astro",
    contenido:
      "---\nconst { posicion } = Astro.props;\n---\n<p>Vas en el lugar {posicion.rank}</p>\n",
    espera: "posición exacta",
  },
  {
    // La reserva de número caduca sola: en cuanto el archivo reservado existe,
    // el renglón sobra y bloquea. Sin eso, un hueco excusado lo queda para
    // siempre.
    auditor: "migration-safety",
    que: "aparece la migración cuyo número estaba declarado como reservado",
    archivo: "migrations/0009_prueba_reserva.sql",
    contenido: "CREATE TABLE prueba_reserva (id TEXT PRIMARY KEY);\n",
    espera: "reserva",
  },

  // ─── F7 frente A: el cable entre los motores y una persona ───────────────
  //
  // Los cuatro auditores de racha y XP miraban el MOTOR, y el motor estaba
  // perfecto: escrito, probado y sin un solo llamador. Los tres casos de abajo
  // degradan el archivo REAL que cierra ese hueco —`lib/progreso.ts`— porque un
  // archivo inventado solo probaría que el auditor sabe leer un archivo
  // inventado (D-070).
  {
    // El bug de #311 otra vez, en F7. Si el motor deja de llamarse, no hay
    // error, no hay pantalla rota y no hay auditor rojo: hay una tabla vacía,
    // y se descubre semanas después por un padre.
    //
    // REAPUNTADO el 2026-08-03, no borrado: el parche degradaba la llamada a
    // `registrarDia`, y #209 le dio a `registrarDia` un SEGUNDO llamador de
    // producto —`offline.ts::sincronizarReto`, que alimenta la racha con los
    // días de vuelo—. Quitar la llamada de `progreso.ts` ya no deja cero
    // llamadores, y el caso corría en verde sin degradar nada: un auditor
    // apagado en silencio, que el arnés cazó al integrar. Se reapunta a
    // `ganarEscudos`, que sigue teniendo UN solo llamador y es el mismo
    // archivo: la clase de bug vigilada (motor de F7 perfecto y sin llamador,
    // #311) no cambia.
    auditor: "funcion-sin-llamar",
    que: "el motor de racha vuelve a quedarse sin ningún llamador",
    archivo: "apps/web/src/lib/progreso.ts",
    // REAPUNTADO por segunda vez el 2026-08-03: #404 le dio a `ganarEscudos`
    // un SEGUNDO llamador en el mismo archivo (`registrarDiaPorLimite`, que
    // repite la misma línea de `registrarItem`), así que el parche con
    // `replace` degradaba una llamada y la otra seguía viva — el caso corría
    // en verde sin degradar nada, otra vez. Ahora degrada LAS DOS con
    // `replaceAll`: la clase de bug vigilada (motor perfecto y sin llamador,
    // #311) es la misma; lo que cambia es cuántas llamadas hay que quitar
    // para dejarla en cero.
    parche: (t) =>
      t.replaceAll(
        "    const despues = conDia === antes ? antes : ganarEscudos(conDia);",
        "    const despues = conDia;",
      ),
    espera: "ganarEscudos",
  },
  {
    // La línea roja #6 escrita como una columna. Nadie escribe `venderEscudo()`;
    // alguien añade «un campo que hace falta» al lado del banco de escudos, y
    // `mc-16` documenta el producto donde eso ya pasó.
    auditor: "racha-nunca-se-vende",
    que: "un precio a una línea del banco de escudos en el cable de la racha",
    archivo: "apps/web/src/lib/progreso.ts",
    parche: (t) =>
      t.replace(
        "  shields_available: number;\n  shields_earned_total: number;",
        "  shields_available: number;\n  precio_del_escudo: number;\n  shields_earned_total: number;",
      ),
    espera: "línea roja #6",
  },
  {
    // #225 y D-055. En KINDER los dos ejes coinciden por construcción, así que
    // mezclarlos NO se vería hasta que hubiera filas en producción calculadas
    // con la fórmula equivocada — que es cuando ya no hay dónde separarlos.
    auditor: "motor-xp",
    que: "el XP acumulado se suma con los puntos del tablero",
    archivo: "apps/web/src/lib/progreso.ts",
    parche: (t) =>
      t.replace(
        "    const total = (filaXp?.total_xp ?? 0) + ganado;",
        "    const total = filaXp.total_xp + fila.total_score;",
      ),
    espera: "dos monedas",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // F7 · Misiones diarias (#211, #214, #216, #217, #219, #221, #228).
  //
  // Los ocho casos DEGRADAN archivos REALES —el motor, la migración 0009 y la
  // pantalla del reto—, por lo mismo que los de arriba: los cuatro auditores de
  // misiones se escribieron CON el módulo delante, así que un archivo inventado
  // probaría que el auditor sabe leer un archivo inventado y no que habría
  // cazado la erosión (D-070).
  //
  // Y cada degradación es una que alguien haría de buena fe. Ninguna es
  // sabotaje: son «un desempate que da igual», «el catálogo se lee mejor con el
  // número escrito», «el esquema acepta un tipo más por si acaso», «el duelo ya
  // pide estar en liga, el opt-in sobra», «importemos el tipo de F4 para no
  // duplicarlo», «pongamos el contador de la misión en la esquina de la
  // pantalla». Ésas son las que llegan a producción.
  // ─────────────────────────────────────────────────────────────────────────

  {
    // El azar entrando por la puerta más pequeña que hay: la semilla. Con esto
    // la selección deja de ser reproducible y «¿por qué le tocó esta misión a mi
    // hijo?» pasa a no tener respuesta.
    auditor: "mision-recompensa-deterministica",
    que: "un grano de azar en la semilla del día",
    archivo: "packages/motor/src/misiones.ts",
    parche: (t) =>
      t.replace(
        "  let h = 0x811c9dc5;",
        "  let h = 0x811c9dc5 + Math.floor(Math.random() * 3);",
      ),
    espera: "azar",
  },
  {
    // El catálogo deja de derivar su XP de la tabla publicada y escribe el
    // número a mano. Es el momento en que nacen dos precios para la misma cosa.
    auditor: "mision-recompensa-deterministica",
    que: "una misión vale algo distinto de lo que la tabla publicada promete",
    archivo: "packages/motor/src/misiones.ts",
    parche: (t) =>
      t.replace(
        "    xp: xpDeTipo(claveDeXp(tipo)),",
        '    xp: tipo === "volumen" ? 42 : xpDeTipo(claveDeXp(tipo)),',
      ),
    espera: "tabla publicada",
  },
  {
    // El esquema acepta un tipo que el módulo no conoce. La fila existiría en la
    // base y el motor no sabría completarla nunca.
    auditor: "mision-recompensa-deterministica",
    que: "la migración acepta un tipo de misión fuera del catálogo cerrado",
    archivo: "migrations/0009_misiones_diarias.sql",
    parche: (t) =>
      t.replace(
        "'fluidez', 'precision', 'descubre', 'duelo', 'meta_de_liga'",
        "'fluidez', 'precision', 'descubre', 'duelo', 'meta_de_liga', 'cofre_diario'",
      ),
    espera: "catálogo cerrado",
  },
  {
    // La columna de precio «por si acaso». Nadie la cobra el primer año; existe,
    // y el día que exista un plan de pago ya está el hueco hecho.
    auditor: "mision-recompensa-deterministica",
    que: "una columna de precio en la tabla de misiones",
    archivo: "migrations/0009_misiones_diarias.sql",
    parche: (t) =>
      t.replace(
        "  updated_at       INTEGER NOT NULL,",
        "  price_cents      INTEGER,\n  updated_at       INTEGER NOT NULL,",
      ),
    espera: "precio",
  },
  {
    // «El duelo ya exige estar en una liga; el opt-in sobra». D-018 dice que no,
    // y #218 prohíbe hasta enseñarlo bloqueado.
    auditor: "mision-slot-nunca-vacio",
    que: "`duelo` deja de exigir el opt-in y le sale a quien nunca lo pidió",
    archivo: "packages/motor/src/misiones.ts",
    parche: (t) =>
      t.replace(
        'def("duelo", 1, true, (_r, l) => l.dueloOptIn === true && l.enLiga === true),',
        'def("duelo", 1, true, (_r, l) => l.enLiga === true),',
      ),
    espera: "opt-in",
  },
  {
    // `fluidez` sin nada dominado: una misión formalmente asignada e imposible
    // de cumplir. Es la que demuestra que el auditor NO puede juzgarse con la
    // misma función que el motor usa para elegir — si lo hiciera, ablandar la
    // precondición ablandaría también al guardián y esto pasaría en verde.
    auditor: "mision-slot-nunca-vacio",
    que: "`fluidez` se asigna a un niño que no domina nada todavía",
    archivo: "packages/motor/src/misiones.ts",
    parche: (t) =>
      t.replace(
        'def("fluidez", 1, true, (r) => r !== null && r.habilidadesDominadas.length > 0),',
        'def("fluidez", 1, true, SIEMPRE),',
      ),
    espera: "cumplible",
  },
  {
    // El tipo de F4 importado «para no duplicarlo». Es el import que convierte
    // dos subsistemas con dueños distintos en uno solo.
    auditor: "misiones-sin-do-ajeno",
    que: "el motor de misiones importa el árbol de F4 en vez de recibir el sobre",
    archivo: "packages/motor/src/misiones.ts",
    parche: (t) =>
      t.replace(
        'import type { Banda } from "./puntuacion.ts";',
        'import type { Banda } from "./puntuacion.ts";\nimport { kPara } from "./adaptativo.ts";',
      ),
    espera: "F4",
  },
  {
    // «Un campo más, para poder afinar la misión». Es el momento exacto en que
    // el sobre deja de ser un sobre.
    auditor: "misiones-sin-do-ajeno",
    que: "la lista blanca del contrato con F4 crece un campo",
    archivo: "packages/motor/src/misiones.ts",
    parche: (t) =>
      t.replace(
        "  readonly habilidadesDominadas: readonly string[];",
        "  readonly habilidadesDominadas: readonly string[];\n  readonly thetaActual: number;",
      ),
    espera: "lista blanca",
  },
  {
    // El contador de misión en la pantalla del reto. No rompe nada: solo hace
    // que se aprenda peor (`mc-42` §3), que es el daño que ninguna prueba ve.
    auditor: "mision-silenciosa",
    que: "la pantalla del reto activo importa el motor de misiones",
    archivo: "apps/web/src/components/reto/Pantalla.astro",
    parche: (t) =>
      t.replace(
        "---\n",
        '---\nimport { elegirMisionesDelDia } from "../../../../../packages/motor/src/misiones.ts";\n',
      ),
    espera: "reto activo",
  },

  // ─── El mapa y el compañero (F7, #230-#235) ──────────────────────────────
  //
  // Los siete casos son de DEGRADACIÓN sobre archivos REALES (D-070). Ninguno
  // es un archivo inventado a propósito: los tres auditores nacieron verdes
  // porque el mapa se construyó con ellos delante, así que un caso escrito a
  // mano solo probaría que el auditor sabe leer un archivo falso.
  //
  // Cada degradación es una que alguien haría de verdad, con buena intención.
  {
    // La tabla de caché. Es la degradación que suena a mejora: componer el mapa
    // cuesta cuatro lecturas, «lo guardamos y ya». El precio son dos verdades
    // sobre lo que un niño sabe, y se cobra meses después.
    auditor: "mapa-lectura-sin-tabla",
    que: "el mapa gana una tabla propia para cachear el progreso",
    archivo: "migrations/0010_mapa_companero.sql",
    parche: (t) =>
      t + "\nCREATE TABLE map_progress (\n  id TEXT PRIMARY KEY,\n  skill_id TEXT NOT NULL,\n  fill REAL NOT NULL\n);\n",
    espera: "no tiene tabla propia",
  },
  {
    // Los cortes copiados a mano. Compila, pasa cualquier revisión, y se
    // descubre el día que alguien mueva el corte en `serie.ts`.
    auditor: "mapa-lectura-sin-tabla",
    que: "los cortes de pericia se copian a mano en vez de reusar serie.ts",
    archivo: "packages/motor/src/mapa.ts",
    parche: (t) =>
      t.replace(
        "  const ejemplo = ejemploSegunPericia(skillState);\n  if (ejemplo === 1) return \"asomando\";\n  if (ejemplo === 0.5) return \"en_camino\";\n  return \"dominada\";",
        "  if (skillState <= 0.2) return \"asomando\";\n  if (skillState <= 0.6) return \"en_camino\";\n  return \"dominada\";",
      ),
    espera: "0.2 o 0.6",
  },
  {
    // El módulo del mapa aprende a escribir. Un solo INSERT y ya hay una
    // segunda fuente de verdad del progreso.
    auditor: "mapa-lectura-sin-tabla",
    que: "el módulo del mapa escribe progreso en vez de solo leerlo",
    archivo: "packages/motor/src/mapa.ts",
    parche: (t) =>
      t.replace(
        "export const HABILIDADES_SIN_FUENTE = true;",
        'export const SQL_GUARDAR_MAPA = "INSERT INTO map_progress (id) VALUES (?)";\nexport const HABILIDADES_SIN_FUENTE = true;',
      ),
    espera: "CAPA DE LECTURA",
  },
  {
    // El nivel de vuelta en el modelo de vista. Es el descuido más barato del
    // repo: una línea, compila, y pinta «Nivel 3» delante de un niño.
    auditor: "mapa-sin-numero-de-nivel",
    que: "el árbol devuelve el número de nivel junto al orden correlativo",
    archivo: "packages/motor/src/mapa.ts",
    parche: (t) => t.replace("    orden: i + 1,", "    orden: i + 1,\n    nivel,"),
    espera: "criterio #100",
  },
  {
    // Un porcentaje en el sendero de kinder. Suena útil —«así el padre ve cómo
    // va»— y convierte un camino en una evaluación para alguien de cuatro años.
    auditor: "mapa-sin-numero-de-nivel",
    que: "el sendero de KINDER gana un campo numérico de progreso",
    archivo: "packages/motor/src/mapa.ts",
    parche: (t) =>
      t.replace(
        "    lugares.push({ lugar, estado, aqui });",
        "    lugares.push({ lugar, estado, aqui, porcentaje: Math.round((i / orden.length) * 100) });",
      ),
    espera: "cuatro años",
  },
  {
    // El medidor de humor, con el nombre más inocente posible. No dice
    // «hambre»: dice `mood`, y por eso la comprobación principal es el CONTEO
    // de claves y no una lista de palabras.
    auditor: "companero-sin-decaimiento",
    que: "el compañero gana un tercer campo de estado que puede decaer",
    archivo: "packages/motor/src/companero.ts",
    parche: (t) =>
      t.replace(
        "  return { visible: VISIBLE_AL_CREAR[tema], accesorios: [] };",
        "  return { visible: VISIBLE_AL_CREAR[tema], accesorios: [], mood: 100 };",
      ),
    espera: "POR CONSTRUCCIÓN",
  },
  {
    // El compañero encendido para el adulto. Nadie lo nota, y el adulto que
    // abre una herramienta de estudio se encuentra un rinoceronte saludándolo.
    auditor: "companero-sin-decaimiento",
    que: "el compañero nace encendido en SERIO, contra el criterio 1 de #234",
    archivo: "packages/motor/src/companero.ts",
    parche: (t) => t.replace("  SERIO: false,\n  PRO: false,", "  SERIO: true,\n  PRO: false,"),
    espera: "#234",
  },

  // ─── Los tres de F8, y por qué ocho de sus nueve casos DEGRADAN ─────────
  //
  // El motor del límite de pantalla se construyó con sus tres auditores
  // delante, así que nacieron verdes. D-070 lo dice sin rodeos: un caso escrito
  // a mano probaría que el auditor sabe leer un archivo inventado, no que
  // habría cazado la erosión del verdadero. Los ocho parches de aquí abajo
  // rompen `packages/motor/src/limite-pantalla.ts` de las ocho formas en que se
  // rompería de verdad, y el noveno planta el único archivo que todavía no
  // existe: la ruta de cierre que nadie ha cableado.

  {
    // La divergencia clásica: alguien «ajusta» un número en el código y la
    // tabla de D-016 se queda como estaba. El síntoma no es un error — es un
    // niño al que el servidor corta a los 25 minutos con el control de su padre
    // marcando 20.
    auditor: "limite-pantalla-motor-unico",
    que: "el default de KINDER se mueve en el código y no en D-016",
    archivo: "packages/motor/src/limite-pantalla.ts",
    parche: (t) =>
      t.replace(
        "KINDER: Object.freeze({ defaultMin: 20,",
        "KINDER: Object.freeze({ defaultMin: 25,",
      ),
    espera: "Manda el documento",
  },
  {
    // El corte nocturno es la única columna con evidencia experimental detrás
    // (el ECA de Bath), y la más fácil de tocar sin querer porque D-016 la
    // escribe en horas y el código en minutos.
    auditor: "limite-pantalla-motor-unico",
    que: "el corte nocturno de SECUNDARIA pasa de 30 a 60 minutos",
    archivo: "packages/motor/src/limite-pantalla.ts",
    parche: (t) =>
      t.replace(
        "descansoCadaMin: 25, corteNocturnoMinAntes: 30",
        "descansoCadaMin: 25, corteNocturnoMinAntes: 60",
      ),
    espera: "corteNocturnoMinAntes",
  },
  {
    // Un DEFAULT en el esquema es un cuarto sitio donde vive la tabla de D-016,
    // en un lenguaje donde nadie la va a buscar. La 0002 lo dice en su propio
    // comentario y aun así es lo primero que alguien añadiría «por comodidad».
    auditor: "limite-pantalla-motor-unico",
    que: "una columna de minutos con DEFAULT en el esquema",
    archivo: "migrations/9999_prueba_limite_default.sql",
    contenido:
      "ALTER TABLE screen_time_settings ADD COLUMN daily_minutes_v2 INTEGER NOT NULL DEFAULT 30;\n",
    espera: "los defaults por edad los pone la aplicación",
  },

  {
    // **El caso que da nombre a la fase.** No hace falta escribir
    // `current_streak = 0` para romper la línea roja #6: basta con que un
    // camino del corte no produzca motivo. Sin motivo nadie llama a la racha,
    // el día no se registra, y el contador amanece en 1 sin que ningún grep
    // encuentre nada. Es la omisión, no el reinicio.
    auditor: "limite-no-rompe-el-dia",
    que: "el corte nocturno deja de dar el día por cumplido",
    archivo: "packages/motor/src/limite-pantalla.ts",
    parche: (t) =>
      t.replace(
        "  void cierre;\n  return { tipo: \"LIMITE_DE_PANTALLA_CORTO_LA_SESION\" };",
        "  if (cierre === \"BEDTIME\") return null as never;\n  return { tipo: \"LIMITE_DE_PANTALLA_CORTO_LA_SESION\" };",
      ),
    espera: "SIN SU DÍA",
  },
  {
    // El otro extremo: el motor del límite empieza a saber de rachas. Una rama
    // sobre `current_streak` dentro del límite es la que después se escribe mal.
    auditor: "limite-no-rompe-el-dia",
    que: "el motor del límite toca el contador de la racha",
    archivo: "packages/motor/src/limite-pantalla.ts",
    parche: (t) =>
      t.replace(
        "export function decidir(entrada: EntradaDeDecision): Decision {",
        "export function decidir(entrada: EntradaDeDecision & { current_streak?: number }): Decision {\n" +
          "  if (entrada.current_streak === 0) return SEGUIR;",
      ),
    espera: "toca el contador de la racha",
  },
  {
    // #271, textual: «sin bloqueo cronometrado». El descanso con una cuenta
    // regresiva de la que no se puede salir es la fricción punitiva que D-016
    // evita, y `mc-21` marca los cronómetros encendidos por defecto como
    // antipatrón. Se escribe en dos líneas y no rompe ninguna prueba.
    auditor: "limite-no-rompe-el-dia",
    que: "el descanso se convierte en una espera cronometrada",
    archivo: "packages/motor/src/limite-pantalla.ts",
    parche: (t) =>
      t.replace(
        "export function reiniciarDescanso(uso: UsoDelDia): UsoDelDia {",
        "export const SEGUNDOS_DE_ESPERA = 30;\nexport function reiniciarDescanso(uso: UsoDelDia): UsoDelDia {",
      ),
    espera: "sin bloqueo cronometrado",
  },
  {
    // Línea roja #1, que para un menor no admite excepción. El corte «de
    // verdad» con pantalla completa forzada es lo que haría cualquier producto
    // de control parental, y es exactamente lo que este no puede hacer.
    auditor: "limite-no-rompe-el-dia",
    que: "el corte fuerza pantalla completa sobre el aparato de un menor",
    archivo: "packages/motor/src/sesion.ts",
    parche: (t) =>
      t.replace(
        "export function cerrarPorLimite(estado: EstadoSesion): EstadoSesion {",
        "export function cerrarPorLimite(estado: EstadoSesion): EstadoSesion {\n" +
          "  document.documentElement.requestFullscreen();",
      ),
    espera: "secuestra el aparato",
  },
  {
    // La vergüenza no llega como un insulto: llega como una explicación. «Se
    // acabó la racha» en la despedida del límite es la línea roja #7 rota sin
    // una sola palabra técnica, y en un solo locale de los siete.
    //
    // **Este caso encontró un fallo real en `racha-lexico`**, no solo en el
    // auditor nuevo: salía en verde con la violación delante porque `\b` de
    // JavaScript solo conoce ASCII y la `ó` de «acabó» no le hace frontera.
    // Se dejó ADREDE con acento, que es como se escribe de verdad. Ver
    // `conFronteraUnicode` en `audits/lib/repo.mjs`.
    auditor: "limite-no-rompe-el-dia",
    que: "la despedida usa lenguaje de pérdida CON ACENTO, en un solo locale",
    archivo: "apps/web/src/i18n/limite-pantalla/es-MX.json",
    parche: (t) =>
      t.replace(
        '"limite.despedida.lector": "Buen trabajo hoy. Nos vemos mañana."',
        '"limite.despedida.lector": "Se acabó la racha de hoy. Nos vemos mañana."',
      ),
    espera: "construcción de perdida",
  },
  {
    // El mismo acento, sobre el auditor que ya existía. Sin la reparación de
    // `conFronteraUnicode`, este caso sale en verde con «Se rompió la racha»
    // delante — y ése era el estado del repositorio hasta hoy.
    auditor: "racha-lexico",
    que: "una construcción de pérdida con acento, que `\\b` de ASCII no veía",
    archivo: "apps/web/src/i18n/racha/es-MX.json",
    parche: (t) =>
      t.replace('"racha.ninguno": ', '"racha.rota": "Se rompió la racha.",\n  "racha.ninguno": '),
    espera: "perdida",
  },
  {
    // El eje que `racha-limite-no-rompe` declara que NO puede ver: la ruta de
    // cierre que escribe en la base y sencillamente no registra el día. No hay
    // reinicio que buscar, hay una llamada que falta.
    auditor: "limite-no-rompe-el-dia",
    que: "una ruta cierra por el límite, escribe en D1 y no registra el día",
    archivo: "apps/web/src/lib/prueba-cierre-limite.ts",
    contenido:
      "export async function cerrar(db: any, sesion: any, id: string) {\n" +
      "  await sesion.cerrarPorLimite('DAILY_LIMIT');\n" +
      "  await db.prepare('UPDATE screen_time_daily_usage SET ended_reason = ? WHERE child_profile_id = ?')\n" +
      "    .bind('DAILY_LIMIT', id).run();\n" +
      "}\n",
    espera: "omisión silenciosa",
  },

  {
    // Nadie escribe `venderMinutos()`. Alguien agrega un campo que «hace
    // falta», y el límite deja de aplicar para quien paga sin que aparezca la
    // palabra dinero en ninguna parte. Solo el eje que EJECUTA lo ve.
    auditor: "limite-nunca-se-levanta-pagando",
    que: "una bandera de plan premium desactiva el límite diario",
    archivo: "packages/motor/src/limite-pantalla.ts",
    parche: (t) =>
      t.replace(
        "  if (uso.minutes_used >= config.daily_minutes) {",
        "  if (uso.minutes_used >= config.daily_minutes && !(entrada as { premium?: boolean }).premium) {",
      ),
    espera: "MUEVE la decisión",
  },
  {
    // La otra forma, sin tocar ninguna rama: un campo en la interfaz de
    // entrada. Es cómo se ve un paywall antes de ser un paywall.
    auditor: "limite-nunca-se-levanta-pagando",
    que: "la entrada de la decisión gana un campo de suscripción",
    archivo: "packages/motor/src/limite-pantalla.ts",
    parche: (t) =>
      t.replace(
        "  readonly puntoSeguro: boolean;\n}",
        "  readonly puntoSeguro: boolean;\n  readonly plan: \"gratis\" | \"familia\";\n}",
      ),
    espera: "campo de pago",
  },
  {
    // Y la más barata de todas: el precio junto al límite en un archivo de
    // producto. Seis líneas es el radio en el que cabe un objeto de
    // configuración, que es donde esto aparecería de verdad.
    auditor: "limite-nunca-se-levanta-pagando",
    que: "un precio para ensanchar el límite, en una ruta de producto",
    archivo: "apps/web/src/lib/prueba-limite-precio.ts",
    contenido:
      "export const MINUTOS_EXTRA = {\n" +
      "  daily_minutes: 30,\n" +
      "  precio: 0.99,\n" +
      "};\n",
    espera: "dinero a",
  },

  // ─── El hueco declarado de la numeración, sus dos mitades ───────────────
  //
  // La mitad que permite (una reserva legítima no bloquea) no necesita caso:
  // `migration-safety` pasa en verde con la 0011 delante, y eso se ve en cada
  // corrida. Lo que sí necesita caso son las dos mitades que TIENEN que seguir
  // bloqueando, porque son las que un mecanismo de excepción suele romper.

  {
    // El fallo que el hueco existe para cazar, y que ninguna reserva declara:
    // una migración que ya corrió en algún ambiente y se borró del repo.
    //
    // Reapuntado a 0016 el 2026-08-03: con la 0013 (sendero kinder) y la 0014
    // (recordatorio push) ya aterrizadas, una sonda en 0016 deja la 0015 sin
    // declarar, y ese es el hueco que tiene que cazar. El número se mueve con
    // cada migración que aterriza, y eso es a propósito: el caso apunta al
    // PRIMER hueco libre por delante de la última migración. Reapuntado, no
    // borrado (un control cuyo objetivo se movió es un auditor apagado).
    // Reapuntado otra vez a 0017 cuando la 0015 (cosméticos kinder) aterrizó:
    // con ella presente, una sonda en 0016 queda contigua y el caso corría en
    // verde sin degradar nada — el auditor apagado en silencio de siempre.
    // Reapuntado a 0019 cuando la 0017 (grupos infantiles, F9) aterrizó: con
    // la 0016 (F5c) y la 0017 presentes, el primer hueco libre no declarado es
    // el 0018, y la sonda que lo caza es el archivo 0019. El archivo va
    // siempre UN número por encima del primer hueco libre no declarado.
    // Reapuntado a 0021 cuando la 0019 (reportes por correo, F8) aterrizó: con
    // la 0018 reservada al frente del panel (marcador `migration-safety-reserva`
    // en la propia 0019), el primer hueco libre NO declarado es el 0020, y la
    // sonda que lo caza es el archivo 0021. Una sonda en 0020 quedaría contigua
    // a la 0019 real y correría en verde sin degradar nada — el auditor apagado
    // en silencio de siempre. (El encargo decía 0020; la aritmética del propio
    // mecanismo —sonda = primer hueco no declarado + 1— da 0021, y el arnés lo
    // confirma: con 0020 el caso corre en verde.)
    // Reapuntado a 0022 cuando la 0020 (arte de los 6 cosméticos que quedaban
    // sin él, #255) aterrizó: con la 0018 reservada al frente del panel y la
    // 0020 presente, el primer hueco libre NO declarado es el 0021, y la sonda
    // que lo caza es el archivo 0022 — la aritmética de siempre: sonda = primer
    // hueco no declarado + 1.
    // Reapuntado a 0023 cuando la 0021 (alias único por padre, #259) aterrizó:
    // con ella presente, el primer hueco libre NO declarado es el 0022, y la
    // sonda que lo caza es el archivo 0023. Una sonda en 0022 quedaría contigua
    // a la 0021 real y correría en verde sin degradar nada — el auditor apagado
    // en silencio de siempre.
    auditor: "migration-safety",
    que: "un hueco de numeración que nadie declaró",
    archivo: "migrations/0023_prueba_hueco.sql",
    contenido: "CREATE TABLE prueba_hueco (id TEXT PRIMARY KEY);\n",
    espera: "hueco en la numeración",
  },
  {
    // Y la otra mitad, la que impide que la excepción se vuelva permanente:
    // una reserva sobre un número que ya existe es un renglón rancio, y una
    // lista de excepciones que nadie vacía es cómo un gate se apaga sin que
    // nadie lo decida (mismo criterio que `separarDeuda` en lib/repo.mjs).
    auditor: "migration-safety",
    que: "una reserva de numeración rancia, sobre una migración que ya existe",
    archivo: "migrations/0011_screen_time_daily_usage.sql",
    // El parche apuntaba a «0009, 0010» y ese texto murió cuando la 0010 del
    // mapa aterrizó de verdad y el auditor exigió estrechar la reserva. El caso
    // falló al integrar, que es exactamente lo que tiene que hacer un control
    // negativo cuyo objetivo se movió — un parche que ya no cambia nada corre en
    // verde sin degradar nada, y eso es un auditor apagado en silencio.
    // El parche PLANTA la reserva rancia en vez de editarla, y ese cambio no es
    // cosmético: las reservas reales ya se borraron —la 0009 y la 0010
    // aterrizaron, el auditor lo exigió, y no queda ninguna en el repositorio—.
    // Un caso que editara un texto inexistente correría en verde sin degradar
    // nada, que es un auditor apagado en silencio. El arnés lo cazó al integrar.
    parche: (t) => "-- migration-safety-reserva: 0008 — reserva rancia plantada a propósito por el arnés\n" + t,
    espera: "La reserva sobra",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // F7 · Misiones diarias — la superficie (#220, #222, #227, #229).
  //
  // Los cuatro casos DEGRADAN archivos REALES —el componente del resumen y los
  // JSON de locale que este PR introduce— por la misma razón que los del
  // motor (D-070): el auditor nació verde porque la superficie se construyó
  // con él delante, y un archivo inventado solo probaría que sabe leer un
  // archivo inventado.
  //
  // Cada degradación es una que alguien haría de buena fe: «pongamos cuántas
  // van para que se vea el avance», «el bono merece más emoción», «el tres ya
  // lo sabemos, escríbelo», «al alemán le sobra la meta».
  // ─────────────────────────────────────────────────────────────────────────

  {
    // El «para que se vea el avance» del resumen. Es la degradación más
    // natural de todas: el menú SÍ muestra «2 de 3», así que llevarlo al
    // resumen parece consistencia — y es exactamente el «0/3» que #222
    // prohíbe: el veredicto de lo que faltó, con la voz del contador.
    auditor: "mision-resumen-sin-ceros",
    que: "el resumen de fin de día recibe el progreso y puede pintar un «0 de 3»",
    archivo: "apps/web/src/components/misiones/ResumenMisiones.astro",
    parche: (t) =>
      t.replace(
        "  /** XP total del día por misiones, bono incluido. */\n  xpTotal: number;",
        "  /** XP total del día por misiones, bono incluido. */\n  xpTotal: number;\n  progreso: number;",
      ),
    espera: "denominador",
  },
  {
    // La emoción del bono. «Que se sienta como un premio» es como entra la
    // metáfora siempre — y #220 la prohíbe aunque el contenido sea conocido:
    // abrir algo SUGIERE azar (mc-43, hallazgo 5).
    auditor: "mision-resumen-sin-ceros",
    que: "el bono del día se presenta como un cofre que se abre",
    archivo: "apps/web/src/i18n/misiones/en.json",
    parche: (t) =>
      t.replace(
        '"misiones.resumen.bono": "All of today\'s missions done — that\'s {xp} XP more"',
        '"misiones.resumen.bono": "Open your chest — {xp} XP inside"',
      ),
    espera: "cofre",
  },
  {
    // El número escrito a mano. «La meta es tres, todos lo sabemos» — y el
    // día que la meta cambie a cuatro, es-MX sigue diciendo tres mientras los
    // demás locales preguntan al motor. #227: todo número visible pasa por
    // `numeros.ts`, nunca se escribe a mano.
    auditor: "mision-resumen-sin-ceros",
    que: "una meta escrita a mano en el texto de es-MX en vez de un marcador",
    archivo: "apps/web/src/i18n/misiones/es-MX.json",
    parche: (t) =>
      t.replace(
        '"mision.volumen.progreso": "{n} de {meta} ejercicios contestados"',
        '"mision.volumen.progreso": "{n} de 3 ejercicios contestados"',
      ),
    espera: "dígito",
  },
  {
    // El marcador que se pierde entre locales. «Al alemán le queda largo,
    // quita lo de la meta» — y de-DE deja de mostrar la meta para siempre, en
    // silencio, con el gate verde.
    auditor: "mision-resumen-sin-ceros",
    que: "de-DE pierde el marcador {meta} que los demás locales sí muestran",
    archivo: "apps/web/src/i18n/misiones/de-DE.json",
    parche: (t) =>
      t.replace(
        '"mision.volumen.progreso": "{n} von {meta} Aufgaben beantwortet"',
        '"mision.volumen.progreso": "{n} Aufgaben beantwortet"',
      ),
    espera: "marcadores",
  },
  {
    // Y el que vigila que el léxico de la racha también cubra los textos de
    // misión (D-081 condición 3 extendida a misiones): la urgencia fabricada
    // no deja de serlo porque diga «misión» en vez de «racha».
    auditor: "racha-lexico",
    que: "una cuenta regresiva de misión en el texto de es-MX",
    archivo: "apps/web/src/i18n/misiones/es-MX.json",
    parche: (t) =>
      t.replace(
        '"misiones.titulo": "Las misiones de hoy"',
        '"misiones.titulo": "Te quedan unas horas para tus misiones"',
      ),
    espera: "urgencia",
  },
  {
    // La excepción de D-106 es POR MARCADOR: sin el renglón escrito, nombrar
    // `current_streak` en el DO de liga vuelve a ser exactamente lo que la
    // condición 1 de D-081 prohíbe. El parche borra el marcador y deja el campo.
    auditor: "liga-no-quita",
    que: "la difusión de la racha pierde su marcador de D-106",
    archivo: "apps/web/src/lib/liga-do.ts",
    parche: (t) =>
      t.replace(
        "liga-no-quita-difusion: current_streak — D-106 (2026-08-03)",
        "difusion sin decision escrita",
      ),
    espera: "current_streak",
  },
  {
    // Y con el marcador intacto, la excepción es ESTRECHA: autoriza NOMBRAR la
    // racha para difundirla, nunca escribirla. Un UPDATE a la tabla de la racha
    // desde el subsistema social bloquea igual, marcador o no.
    auditor: "liga-no-quita",
    que: "un UPDATE a child_streak dentro del DO de liga, con el marcador puesto",
    archivo: "apps/web/src/lib/liga-do.ts",
    parche: (t) =>
      t.replace(
        'import type { Banda } from "../../../../packages/motor/src/puntuacion.ts";',
        'import type { Banda } from "../../../../packages/motor/src/puntuacion.ts";\nconst _SQL_PROHIBIDO = "UPDATE child_streak SET current_streak = 0";',
      ),
    espera: "child_streak",
  },
  {
    // F7 #207, criterio #1. El caso real que este auditor existe para cazar:
    // alguien añade la columna de niño a la tabla de suscripciones «para
    // personalizar», y un push termina dirigido a un menor.
    auditor: "recordatorio-sin-culpa",
    que: "una columna child_profile_id en la migración del push",
    archivo: "migrations/0014_push_recordatorio_padre.sql",
    parche: (t) =>
      t.replace(
        "  user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,",
        "  user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  child_profile_id TEXT,",
      ),
    espera: "child_profile_id",
  },
  {
    // F7 #207, criterio #2. El tope deja de llamarse por su nombre — la puerta
    // a volverlo configurable «para el experimento». El auditor lo exige por
    // nombre, así que renombrarlo tiene que bloquear.
    auditor: "recordatorio-sin-culpa",
    que: "el tope UN_PUSH_POR_HOGAR_POR_DIA renombrado en el motor",
    archivo: "packages/motor/src/recordatorio.ts",
    parche: (t) => t.replace("UN_PUSH_POR_HOGAR_POR_DIA = 1", "TOPE_PUSH_DIARIO = 1"),
    espera: "UN_PUSH_POR_HOGAR_POR_DIA",
  },
  {
    // F7 #207, criterio #5 y D-026. La forma escrita del nagging: una ruta que
    // limpia el silencio. El parche convierte el upsert del silencio en su
    // borrado, y el auditor tiene que decir que el silencio es permanente.
    auditor: "recordatorio-sin-culpa",
    que: "una escritura `silenciado_at = NULL` en la ruta del padre",
    archivo: "apps/web/src/pages/api/push.ts",
    parche: (t) => t.replace("silenciado_at = excluded.silenciado_at,", "silenciado_at = NULL,"),
    espera: "silenciado_at",
  },

  // ─── F7 · El sendero de racha de KINDER (#205) ───────────────────────────
  {
    // La degradación es exactamente la que el issue prohíbe: el componente cuyo
    // único trabajo es NO mostrar un número, mostrándolo. Se degrada el archivo
    // REAL por lo mismo que los casos de misiones de arriba — uno inventado
    // solo probaría que el auditor sabe leer un archivo inventado (D-070).
    auditor: "kinder-sin-examen",
    que: "el sendero de kinder pinta el acumulado de días como cifra",
    archivo: "apps/web/src/components/racha/SenderoRacha.astro",
    parche: (t) => t.replace("</ol>", "<span>{diasJugadosTotal}</span>\n</ol>"),
    espera: "cifra de racha",
  },


  // ─── F7 · El catálogo de cosméticos de KINDER (#255) ─────────────────────
  {
    // La degradación es la que el cruce nuevo de `locales-complete` existe
    // para cazar: alguien edita los textos de cosméticos en seis locales y se
    // le pasa el séptimo. La clave sigue en la migración, la pantalla muestra
    // la clave cruda, y solo en ese idioma. Se degrada el archivo REAL (D-070).
    auditor: "locales-complete",
    que: "una clave del catálogo de cosméticos sin texto en es-MX",
    archivo: "apps/web/src/i18n/cosmeticos/es-MX.json",
    parche: (t) =>
      t.replace('  "cosmetico.av_gorra_pato.nombre": "Gorra de patito",\n', ""),
    espera: "cosmetico.av_gorra_pato.nombre",
  },
  // ─── F7 · La pausa familiar (#204) ───────────────────────────────────────
  {
    // La degradación es el copy exacto que mc-19 rec. #8 prohíbe junto a esta
    // pantalla: la pausa convertida en confesión, con culpa. Va en UN solo
    // locale y sobre el archivo REAL por lo mismo que los casos de arriba
    // (D-070): un archivo inventado probaría solo que el auditor sabe leer un
    // archivo inventado. El auditor debe escanear `i18n/pausa` — si alguien lo
    // quita de DIRS_TEXTOS, este caso sale en verde con la violación delante.
    auditor: "racha-lexico",
    que: "«no dejes que se pierda» en el copy de la pausa, en un solo locale",
    archivo: "apps/web/src/i18n/pausa/es-MX.json",
    parche: (t) =>
      t.replace(
        '"pausa.cta": "Declarar la pausa"',
        '"pausa.cta": "Declarar la pausa: no dejes que se pierda la racha"',
      ),
    espera: "perdida",
  },
  // ─── F7 · El guardarraíl de naming Rango vs Nivel (#195) ─────────────────
  //
  // Los cuatro degradan archivos REALES (D-070): la erosión de verdad sería
  // una cadena editada en un locale, un ORDER BY de más en una consulta que ya
  // existe, o una interpolación de más en una plantilla que ya se pinta.
  {
    // La trampa clásica: llamar «Level» al eje de XP, como hace Duolingo. Aquí
    // «Level» ya tiene dueño — la dificultad de D-017 — y la clave no está en
    // la lista blanca escrita a mano.
    auditor: "rango-vs-nivel",
    que: "el XP se etiqueta «Level», la palabra del eje de dificultad",
    archivo: "apps/web/src/i18n/en.json",
    parche: (t) => t.replace('"mapaXp": "Experience"', '"mapaXp": "Level"'),
    espera: "mapaXp",
  },
  {
    // Una clave PERMITIDA que gana el número: «Niveles» → «Nivel 3». La lista
    // blanca autoriza la palabra en superficies del padre, nunca la cifra.
    auditor: "rango-vs-nivel",
    que: "una clave de la lista blanca escribe el número de nivel",
    archivo: "apps/web/src/i18n/es-MX.json",
    parche: (t) => t.replace('"navLevels": "Niveles"', '"navLevels": "Nivel 3"'),
    espera: "#100",
  },
  {
    // El Rango convertido en ranking con once caracteres. Compila, no da
    // error, y ordena a un niño de KINDER contra un adulto SERIO por un número
    // que no mide lo mismo (D-003).
    auditor: "rango-vs-nivel",
    que: "la consulta de XP ordena por total_xp",
    archivo: "apps/web/src/lib/progreso.ts",
    parche: (t) =>
      t.replace(
        "SELECT total_xp FROM xp_totals WHERE child_profile_id = ?",
        "SELECT total_xp FROM xp_totals WHERE child_profile_id = ? ORDER BY total_xp DESC",
      ),
    espera: "D-003",
  },
  {
    // El descuido de una línea en una plantilla: interpola `nivel` y lo pinta
    // delante de quien no debe verlo nunca (D-017, #100).
    auditor: "rango-vs-nivel",
    que: "el tablero de SERIO interpola el nivel de dificultad",
    archivo: "apps/web/src/components/mapa/Tablero.astro",
    parche: (t) =>
      t.replace(
        '<span class="tablero__pericia">{textoPericia(f.pericia)}</span>',
        '<span class="tablero__pericia">{textoPericia(f.pericia)}{(f as any).nivel}</span>',
      ),
    espera: "interpola",
  },
  // ─── F7 #257 · Larry nunca comenta avatar, alias ni cosméticos ───────────
  //
  // Los cuatro casos degradan archivos REALES (D-070), uno por cada mitad que
  // el auditor vigila: el import que le daría el catálogo al tutor, la función
  // del alias, el campo que abriría el sobre, y el texto autorado que cruzaría
  // la frontera con la voz de Larry.
  {
    // La violación exacta del criterio 1 del issue: el camino en vivo del
    // tutor importando el evaluador de cosméticos «para felicitar al niño por
    // el marco que acaba de ganar».
    auditor: "larry-sin-cosmeticos",
    que: "un import de cosmeticos.ts plantado en el camino en vivo del tutor",
    archivo: "packages/tutor/src/en-vivo.ts",
    parche: (t) =>
      t.replace(
        'import { sellarSobre, type SobreParaLarry } from "../../motor/src/explicacion.ts";',
        'import { sellarSobre, type SobreParaLarry } from "../../motor/src/explicacion.ts";\n' +
          'import { cosmeticosQueDesbloquea } from "../../motor/src/cosmeticos.ts";',
      ),
    espera: "cosmeticos.ts",
  },
  {
    // La otra puerta: el catálogo de alias. Quien puede nombrar `generarAlias`
    // puede hablar del nombre público del niño.
    auditor: "larry-sin-cosmeticos",
    que: "un import de alias.ts plantado en el catálogo de prompts del tutor",
    archivo: "packages/tutor/src/catalogo.ts",
    parche: (t) =>
      t.replace(
        'import { LOCALES, type Locale } from "../../motor/src/convenciones.ts";',
        'import { LOCALES, type Locale } from "../../motor/src/convenciones.ts";\n' +
          'import { generarAlias } from "../../motor/src/alias.ts";',
      ),
    espera: "alias.ts",
  },
  {
    // El campo que abriría el sobre. Mismo mecanismo que el caso `vars` de
    // `larry-nunca-calcula`: un campo nuevo en la lista blanca viaja solo.
    auditor: "larry-sin-cosmeticos",
    que: "un campo `avatar` añadido a la lista blanca del sobre",
    archivo: "packages/motor/src/explicacion.ts",
    parche: (t) => t.replace('  "materia",\n', '  "materia",\n  "avatar",\n'),
    espera: "avatar",
  },
  {
    // El texto autorado cruzando la frontera. Se degrada una cadena real del
    // i18n de Larry: si «qué bonito avatar» llega a la voz pregenerada, el
    // auditor tiene que decirlo con la palabra.
    auditor: "larry-sin-cosmeticos",
    que: "un «qué bonito avatar» en el i18n de Larry, en es-MX",
    archivo: "apps/web/src/i18n/larry/es-MX.json",
    parche: (t) =>
      t.replace(
        '"idiomaNombre": "español de México"',
        '"idiomaNombre": "español de México, qué bonito avatar"',
      ),
    espera: "avatar",

  },


  // ─────────────────────────────────────────────────────────────────────────
  // F9 · Grupos infantiles — la superficie (issues #380-#387, #401).
  //
  // Dos casos DEGRADAN archivos REALES de este PR —el Durable Object del
  // grupo— por la misma razón que los del motor (D-070): los auditores
  // nacieron verdes porque la superficie se construyó con ellos delante, y un
  // archivo inventado solo probaría que saben leer un archivo inventado. Los
  // demás plantan la violación mínima: la columna libre en la tabla de
  // membresía, el compositor de mensajes en la pantalla del grupo, la ruta
  // que aprueba sin ser el módulo autorizado, el que escribe la insignia a
  // mano.
  // ─────────────────────────────────────────────────────────────────────────

  {
    // La deuda de #401, cerrada: las tablas de grupo están en CHILD_TABLES
    // desde este PR. La violación es la de siempre en una tabla nueva — un
    // campo de texto libre donde un adulto convive con datos de niños.
    auditor: "child-free-text",
    que: "una columna de texto libre en la tabla de membresía de grupo",
    archivo: "migrations/9999_prueba_grupo_texto.sql",
    contenido: "ALTER TABLE child_group_membership ADD COLUMN nota TEXT;\n",
    espera: "child_group_membership",
  },
  {
    // El compositor. Un `<textarea>` en la pantalla del grupo no es un campo
    // de formulario — es un chat esperando a que alguien lo lea (línea roja
    // #3, en cualquier dirección).
    auditor: "grupo-sin-chat",
    que: "un <textarea> en una superficie de grupo",
    archivo: "apps/web/src/components/grupos/PruebaChat.astro",
    contenido: "---\n---\n<textarea name=\"mensaje\"></textarea>\n",
    espera: "textarea",
  },
  {
    // La segunda ruta. La que alguien añade dentro de seis meses «solo para
    // importar», sin las tres condiciones de D-011 — la membresía pending, el
    // niño de la cuenta, la firma de quién decidió.
    auditor: "grupo-aprobacion-padre",
    que: "una ruta que aprueba una membresía fuera del módulo autorizado",
    archivo: "apps/web/src/pages/api/grupo-aprobar-prueba.ts",
    contenido:
      "export async function POST({ request }: any) {\n" +
      "  const { membership_id } = await request.json();\n" +
      "  await (globalThis as any).env.DB.prepare(\"UPDATE child_group_membership SET status = 'approved' WHERE id = ?\").bind(membership_id).run();\n" +
      "  return new Response(null, { status: 204 });\n" +
      "}\n",
    espera: "fuera del módulo autorizado",
  },
  {
    // La insignia escrita a mano. `school_verified` es lo que un padre lee
    // antes de dejar entrar a su hijo; solo lo escriben los triggers de la
    // 0017 (D-086).
    auditor: "school-verification-required",
    que: "un assurance = 'school_verified' escrito fuera de la migración",
    archivo: "apps/web/src/lib/prueba-assurance.ts",
    contenido:
      "export async function subir(db: any, userId: string) {\n" +
      "  await db.prepare(\"UPDATE group_owner_identity SET assurance = 'school_verified' WHERE user_id = ?\").bind(userId).run();\n" +
      "}\n",
    espera: "ESCRIBE",
  },
  {
    // El filtro quitado. Es una línea, y el síntoma es invisible: un niño
    // aparece en la tabla de posiciones de su salón y su padre nunca activó
    // el ranking (D-087).
    auditor: "grupo-visibilidad-minima",
    que: "la tabla del grupo deja de filtrar por opt-in",
    archivo: "apps/web/src/lib/classroom-do.ts",
    parche: (t) => t.replace(".filter((f) => visibleEnTablaDePosiciones(f.opt_in))", ""),
    espera: "visibleEnTablaDePosiciones",
  },
  {
    // El campo de más. `banda` se almacena para calcular la posición visible;
    // proyectarla publica a todo el grupo un dato que D-027 no autoriza.
    auditor: "grupo-visibilidad-minima",
    que: "la proyección del grupo publica la banda del niño",
    archivo: "apps/web/src/lib/classroom-do.ts",
    parche: (t) => t.replace("        puntos: f.puntos,", "        puntos: f.puntos,\n        banda: f.banda,"),
    espera: "banda",
  },
  // ─── F5c · Los dos auditores del banco de PRIMARIA (#358, #359) ──────────
  //
  // Los cinco casos DEGRADAN archivos REALES (D-070): los catálogos de los
  // locales, la plantilla y el guion de siembra que este PR introduce. Un
  // archivo inventado solo probaría que el auditor sabe leer un archivo
  // inventado.
  {
    // La de #358 literal: una opción cuya plantilla no existe en i18n. Se
    // borra la clave del catálogo alemán — el fallo exacto de «seis locales
    // editados y el séptimo quedó atrás».
    auditor: "banco-primaria-i18n",
    que: "un enunciado de primaria sin plantilla en de-DE",
    archivo: "apps/web/src/i18n/reto/de-DE.json",
    parche: (t) => t.replace('  "p.fluidez.suma": "Was ist {a} + {b}?",\n', ""),
    espera: "p.fluidez.suma",
  },
  {
    // Y la otra punta del mismo cruce: la PLANTILLA nombra una clave que
    // ningún catálogo tiene. Se degrada la fuente, no el catálogo.
    auditor: "banco-primaria-i18n",
    que: "la plantilla P01 apunta a una clave que no existe en ningún locale",
    archivo: "packages/motor/src/banco-primaria.ts",
    parche: (t) => t.replace('"p.fluidez.suma"', '"p.fluidez.suma_inexistente"'),
    espera: "p.fluidez.suma_inexistente",
  },
  {
    // El cable de Kalyuga cortado en la siembra (#354): el guion deja de
    // escribir el techo en `hasta_nivel` y el modelo se sirve para siempre
    // sin que nada visible se rompa. El auditor tiene que nombrar la pieza.
    auditor: "banco-primaria-i18n",
    que: "la siembra deja de escribir el techo por nivel en D1",
    archivo: "scripts/sembrar-banco-primaria.mjs",
    parche: (t) => t.replace("TECHO_POR_HABILIDAD[item.habilidad]", "null"),
    espera: "hasta_nivel = 4",
  },
  {
    // #359 en español: «niños» en el copy que sirve primaria. La cadena
    // degradada es la real, y el auditor tiene que decir la palabra.
    auditor: "primaria-sin-ninos",
    que: "«niños» en un enunciado de primaria, en es-MX",
    archivo: "apps/web/src/i18n/reto/es-MX.json",
    parche: (t) =>
      t.replace(
        '"p.comparar.mayor": "\\u00bfCu\\u00e1l n\\u00famero es el mayor?"',
        '"p.comparar.mayor": "\\u00bfCu\\u00e1l n\\u00famero es el mayor, ni\\u00f1os?"',
      ),
    espera: "niños",
  },
  {
    // #359 en alemán: «Kinder» es la misma palabra y la misma trampa — un
    // barrido solo en español e inglés dejaría el locale sin vigilancia.
    auditor: "primaria-sin-ninos",
    que: "«Kinder» en un enunciado de primaria, en de-DE",
    archivo: "apps/web/src/i18n/reto/de-DE.json",
    parche: (t) =>
      t.replace(
        '"p.comparar.mayor": "Welche Zahl ist die gr\\u00f6\\u00dfte?"',
        '"p.comparar.mayor": "Welche Zahl ist die gr\\u00f6\\u00dfte, Kinder?"',
      ),
    espera: "Kinder",
  },
  {

    // D-051: el alta sin `granted_by` no demuestra quién consintió. Se quita
    // la columna del INSERT REAL del opt-in del tablero (#247).
    auditor: "tablero-optin",
    que: "el INSERT del consentimiento LEADERBOARD sin granted_by",
    archivo: "apps/web/src/lib/padre-tablero.ts",
    parche: (t) =>
      t.replace(
        "(child_profile_id, consent_code, granted_by, granted_at, consent_version)",
        "(child_profile_id, consent_code, granted_at, consent_version)",
      ),
    espera: "granted_by",
  },
  {
    // La baja que borra en vez de revocar. Se degrada la revocación REAL:
    // un DELETE es la desaparición de la prueba ante un regulador (D-051),
    // y además es la forma silenciosa de «desactivar borra los puntos».
    auditor: "tablero-optin",
    que: "la baja del opt-in como DELETE en vez de revoked_at",
    archivo: "apps/web/src/lib/padre-tablero.ts",
    parche: (t) =>
      t.replace("UPDATE child_consents SET revoked_at = ? ", "DELETE FROM child_consents "),
    espera: "DELETE",
  },
  {
    // #247: sin el desvío, el tablero de un niño de cinco años se PINTA — no
    // da ningún error. Se borra el guarda REAL de la pantalla del niño.
    auditor: "tablero-sin-kinder-publico",
    que: "el desvío de KINDER borrado de la pantalla del niño",
    archivo: "apps/web/src/pages/[locale]/app/tablero/nino.astro",
    parche: (t) =>
      t.replace(
        'if (hijo.theme_band === "KINDER") return Astro.redirect(rutaJugar(locale));',
        "",
      ),
    espera: "KINDER",
  },
  {
    // La otra mitad de #247: el tablero nombrado dentro del árbol del niño.
    auditor: "tablero-sin-kinder-publico",
    que: "un enlace al tablero plantado bajo /app/kids/",
    archivo: "apps/web/src/pages/[locale]/app/kids/tablero-falso.astro",
    contenido: '<a href="/en/app/tablero/nino/">tablero</a>\n',
    espera: "KINDER",
  },
  {
    // F7 #224. El reparto del Durable Object de misiones, degradado sobre el
    // archivo REAL: si `idFromName` recibe un literal, todo el producto haría
    // cola detrás de un solo hilo (mc-32 riesgo #2).
    auditor: "do-por-entidad",
    que: "el DO de misiones repartido con un literal global en vez de por niño",
    archivo: "apps/web/src/lib/missions-do.ts",
    parche: (t) => t.replace("ns.idFromName(perfilId)", 'ns.idFromName("global")'),
    espera: "global",
  },
  {
    // F7 #224. El reloj en el camino de misión, sobre el archivo REAL del DO:
    // el día lo calcula quien llama con `diaEfectivo()`, y un `Date.now()`
    // aquí haría que dos llamadas el mismo día vieran menús distintos.
    auditor: "mision-recompensa-deterministica",
    que: "un Date.now() dentro del Durable Object de misiones",
    archivo: "apps/web/src/lib/missions-do.ts",
    parche: (t) =>
      t.replace(
        "const habilidadNueva = !dia.habilidades.includes(p.habilidad);",
        "const habilidadNueva = Date.now() > 0 && !dia.habilidades.includes(p.habilidad);",
      ),
    espera: "reloj",
  },
  {
    // #451. La protección de gestos, sobre el reto.css REAL: sin la
    // declaración de overscroll-behavior-x el swipe-back vuelve a sacar al
    // jugador del reto en Chrome/Firefox/Edge, y nada visible se rompe — la
    // página se ve perfecta y el gesto sigue siendo del navegador.
    auditor: "gestos-reto",
    que: "reto.css sin overscroll-behavior-x: none",
    archivo: "apps/web/src/styles/reto.css",
    parche: (t) => t.replace("  overscroll-behavior-x: none;\n", ""),
    espera: "overscroll-behavior-x",
  },
  {
    // #451. La otra mitad, sobre la Pantalla.astro REAL: sin el listener de
    // touchstart no hay guardia de borde, y en Safari de iOS el CSS no basta
    // (WebKit bug 240183) — el bug entero vuelve solo en ese navegador.
    auditor: "gestos-reto",
    que: "Pantalla.astro sin la guardia de borde para iOS",
    archivo: "apps/web/src/components/reto/Pantalla.astro",
    parche: (t) => t.replace('"touchstart"', '"tocado"'),
    espera: "touchstart",


  },

  {
    // F8 #285. El fallo que este auditor existe para cazar: un archivo NUEVO
    // en la ruta del panel que lee el binding de Analytics Engine. Plantado,
    // no degradado — el archivo real no lo referencia.
    auditor: "panel-sin-detalle-de-intento",
    que: "una página del panel leyendo ATTEMPTS_AE",
    archivo: "apps/web/src/pages/[locale]/app/parent/panel/sonda-ae.astro",
    contenido:
      "---\nexport const prerender = false;\n" +
      "const ae = (Astro.locals as any).runtime?.env?.ATTEMPTS_AE;\n---\n<p>{ae ? 'sí' : 'no'}</p>\n",
    espera: "ATTEMPTS_AE",
  },
  {
    // F8 #285. La otra mitad, sobre la capa de datos REAL (D-070): un
    // writeDataPoint en `padre-panel.ts` convertiría cada apertura del panel
    // en una escritura al dataset de intentos — y la pantalla se vería igual.
    auditor: "panel-sin-detalle-de-intento",
    que: "un writeDataPoint en la capa de datos real del panel",
    archivo: "apps/web/src/lib/padre-panel.ts",
    parche: (t) =>
      t.replace(
        "export async function leerDatosDelPanel(",
        "const sonda = (env) => env.ATTEMPTS_AE?.writeDataPoint({ blobs: ['panel'] });\n" +
          "export async function leerDatosDelPanel(",
      ),
    espera: "writeDataPoint",
  },
  {
    // F8 #278, criterio explícito: `child_diagnostic_notes` entra a
    // CHILD_TABLES con su control visto fallar. La columna de texto libre que
    // la línea roja #3 prohíbe en una tabla de niño, plantada como ALTER.
    auditor: "child-free-text",
    que: "una columna de texto libre añadida a child_diagnostic_notes",
    archivo: "migrations/9998_prueba_notas_texto.sql",
    contenido: "ALTER TABLE child_diagnostic_notes ADD COLUMN nota TEXT;\n",
    espera: "sin dominio acotado",
  },
  {
    // F8 #283. La causa sin plantilla, sobre el archivo REAL de mensajes:
    // si en.json pierde la plantilla de PATRON_INUSUAL_PARA_EDAD, la nota de
    // D-020 mostraría la clave cruda solo en inglés — el modo de fallo de D-022.
    auditor: "notas-diagnostico-completas",
    que: "la plantilla de PATRON_INUSUAL_PARA_EDAD borrada del inglés",
    archivo: "apps/web/src/i18n/padre/en.json",
    parche: (t) =>
      t.replace(
        /  "padre\.nota\.PATRON_INUSUAL_PARA_EDAD": "[^"]*",\n/,
        "",
      ),
    espera: "PATRON_INUSUAL_PARA_EDAD",
  },
  {
    // F8 #283. La otra dirección, sobre la migración REAL (D-070): una causa
    // nueva en el CHECK sin plantilla en ningún locale. Las causas se leen de
    // la migración a mano, así que esto bloquea aunque el motor se sincronice.
    auditor: "notas-diagnostico-completas",
    que: "una causa nueva en la 0018 sin plantilla en ningún locale",
    archivo: "migrations/0018_child_diagnostic_notes.sql",
    parche: (t) =>
      t.replace(
        "'PATRON_INUSUAL_PARA_EDAD'     -- D-020: anti-trampa tier 0",
        "'PATRON_INUSUAL_PARA_EDAD',     -- D-020: anti-trampa tier 0\n" +
          "                       'CAUSA_SIN_PLANTILLA'",
      ),
    espera: "CAUSA_SIN_PLANTILLA",
  },
  {
    // F8 #283. La voz de Larry degradada, sobre el archivo REAL de mensajes:
    // una plantilla que humilla («los demás niños», categoría comparación del
    // léxico de es-MX) tiene que bloquear igual que en la superficie del niño.
    auditor: "notas-diagnostico-completas",
    que: "una plantilla de nota que compara con los demás niños",
    archivo: "apps/web/src/i18n/padre/es-MX.json",
    parche: (t) =>
      t.replace(
        /"padre\.nota\.PATRON_INUSUAL_PARA_EDAD": "[^"]*"/,
        '"padre.nota.PATRON_INUSUAL_PARA_EDAD": "Te habla Larry. {alias} no responde como los demás niños de su edad."',
      ),
    espera: "comparacion",
  },


  // ─────────────────────────────────────────────────────────────────────────
  // F8 · Reportes por correo al padre (#287, #292).
  //
  // Los tres casos DEGRADAN archivos REALES —el motor puro, una plantilla de
  // locale y la migración 0019 que este PR introduce— por la misma razón que
  // los del resto del repo (D-070): el auditor nació verde porque el código se
  // construyó con él delante, y un archivo inventado solo probaría que sabe
  // leer un archivo inventado.

  {
    // #292. La violación por excelencia del subsistema: una resta entre las
    // secciones de dos hermanos, plantada al final del motor REAL. Es la
    // comparación implícita que mc-18 documenta como riesgo del correo
    // familiar — y la forma que tomaría un cambio de buena fe («ordenémosles
    // por lo que ganaron»).
    auditor: "reporte-sin-comparacion",
    que: "una resta entre las secciones de dos hermanos en el motor del reporte",
    archivo: "packages/motor/src/reportes.ts",
    parche: (t) =>
      t +
      "\nconst _diferenciaEntreHermanos = (hijos: SeccionHijo[]) =>\n" +
      "  hijos[0].puntosGanados - hijos[1].puntosGanados;\n",
    espera: "comparación entre hermanos",
  },
  {
    // #292. El mismo principio en la plantilla REAL de un locale: un «mejor
    // que su hermano» redactado con naturalidad, que es exactamente cómo se
    // escribiría el defecto — nadie añade una comparación llamándola así.
    auditor: "reporte-sin-comparacion",
    que: "un «mejor que su hermano» en la plantilla del correo",
    archivo: "apps/web/src/i18n/reportes/es-MX.json",
    parche: (t) =>
      t.replace(
        "{alias} ganó {puntos} puntos.",
        "{alias} ganó {puntos} puntos, mejor que su hermano.",
      ),
    espera: "mejor que",
  },
  {
    // #287. `child_report_state` entra a `CHILD_TABLES` de `child-free-text`
    // en este mismo PR, y el caso demuestra que la línea roja #3 se aplica a
    // la tabla nueva: una columna `TEXT` sin `CHECK` ligada a
    // `child_profile_id` tiene que bloquear aquí igual que en `child_profiles`.
    auditor: "child-free-text",
    que: "una columna de texto libre en child_report_state",
    archivo: "migrations/0019_reportes_correo.sql",
    parche: (t) =>
      t.replace(
        "  updated_at          INTEGER NOT NULL\n);",
        "  nota_del_padre      TEXT,\n  updated_at          INTEGER NOT NULL\n);",
      ),
    espera: "child_report_state",
  },
  // ─── F7 #208 · El roster del dueño del grupo, degradado sobre el archivo REAL ─
  //
  // Los tres casos DEGRADAN `grupo-roster.ts` (D-070): la columna de presencia
  // que viaja en silencio, el filtro de revocación quitado, y la racha
  // ordenando. Un archivo inventado solo probaría que el auditor sabe leer un
  // archivo inventado.
  {
    // La columna de más. `max_streak` está en la misma fila de la base, así que
    // añadirla al SELECT es una línea — y la mejor marca personal del niño
    // viaja a 35 familias sin que nada falle (#208 la prohíbe por nombre).
    auditor: "racha-salones-minima",
    que: "el SELECT del roster devuelve también max_streak",
    archivo: "apps/web/src/lib/grupo-roster.ts",
    parche: (t) =>
      t.replace(
        '"COALESCE(r.current_streak, 0) AS current_streak " +',
        '"COALESCE(r.current_streak, 0) AS current_streak, r.max_streak AS max_streak " +',
      ),
    espera: "max_streak",
  },
  {
    // El filtro de status quitado. Es la mitad de un WHERE, y el síntoma es
    // invisible: un niño REMOVIDO sigue exponiendo su racha al grupo — la
    // revocación que #208 exige inmediata deja de cortar.
    auditor: "racha-salones-minima",
    que: "la consulta del roster deja de filtrar status = 'approved'",
    archivo: "apps/web/src/lib/grupo-roster.ts",
    parche: (t) => t.replace(" AND m.status IN ('approved')", ""),
    espera: "approved",
  },
  {
    // La racha ordenando. Un ORDER BY por racha convierte la lista informativa
    // en un ranking de constancia — D-025 lo prohíbe y #208 lo repite.
    auditor: "racha-salones-minima",
    que: "el roster ordenado por racha en vez de por alias",
    archivo: "apps/web/src/lib/grupo-roster.ts",
    parche: (t) => t.replace("ORDER BY p.alias ASC, p.id ASC", "ORDER BY r.current_streak DESC"),
    espera: "ORDER BY",
  },

  // ─── `distractores-explicables`: tres casos, y los tres DEGRADAN el
  // `banco-kinder.ts` REAL (D-070) — ninguno planta un banco inventado,
  // porque los tres bugs de verdad (el negativo de K12, la colisión del
  // `.find()`, la causa borrada que vuelve) vivían en ese archivo.
  {
    // El bug literal del rezagado §7: `b − a` con b < a siempre era un
    // número negativo en el 100% de K12, y sobrevivió una ronda de
    // auditorías porque era un número y no una cadena. Hoy la plantilla se
    // defiende con un filtro `>= 0`, así que la degradación reproduce el
    // bug completo: el distractor Y el filtro que lo tragaba.
    auditor: "distractores-explicables",
    que: "el distractor negativo de K12 (b − a) reintroducido",
    archivo: "packages/motor/src/banco-kinder.ts",
    parche: (t) =>
      t
        .replace(
          '        { valor: a - b + 1, causa: "error.se_salto_uno" },',
          '        { valor: b - a, causa: "error.se_salto_uno" },',
        )
        .replace(
          "]).filter((e) => e.valor !== a - b && e.valor >= 0),",
          "]).filter((e) => e.valor !== a - b),",
        ),
    espera: "NEGATIVA",
  },
  {
    // La colisión del plan F5 §4.1: dos causas sobre el mismo valor, y el
    // `.find()` de `calificarRespuesta` devuelve la primera — la segunda es
    // código muerto que Larry puede usar para explicar lo que no pasó. Las
    // plantillas de hoy pasan por `sinColision`, así que la degradación
    // imita a una plantilla NUEVA escrita sin ella: quita el dedupe (que
    // está primero en K11) y duplica el valor.
    auditor: "distractores-explicables",
    que: "dos causas de K11 con el mismo valor",
    archivo: "packages/motor/src/banco-kinder.ts",
    parche: (t) =>
      t
        .replace("errores: sinColision([", "errores: ([")
        .replace(
          '        { valor: a + b + 1, causa: "error.conto_uno_dos_veces" },',
          '        { valor: a + b - 1, causa: "error.conto_uno_dos_veces" },',
        ),
    espera: "mismo valor",
  },
  {
    // La causa borrada que vuelve. La tabla BORRADAS se copió a mano del
    // plan §3.4j justo para esto: si el comodín `eligio_al_azar` reaparece,
    // `inesperada` vuelve a apagarse en silencio.
    auditor: "distractores-explicables",
    que: "la causa borrada error.eligio_al_azar resucita en K13",
    archivo: "packages/motor/src/banco-kinder.ts",
    parche: (t) => t.replace("error.mismo_aspecto_global", "error.eligio_al_azar"),
    espera: "causa borrada",
  },
  // ─── F9 #383 · La pantalla del roster, degradada sobre los archivos REALES ─
  //
  // La segunda sección de `grupo-visibilidad-minima` vigila que la pantalla
  // del dueño no añada datos por su cuenta. Los dos casos DEGRADAN los
  // archivos REALES de esta superficie (D-070): la página que «solo añade una
  // consultita» dejando de usar el módulo vigilado, y la vista ordenada que
  // pierde el filtro de opt-in.
  {
    // La página sin el módulo. Si el roster deja de salir de
    // `rosterDelGrupo`, la consulta que `racha-salones-minima` vigila deja de
    // ser la que la pantalla pinta — y nadie mira la nueva.
    auditor: "grupo-visibilidad-minima",
    que: "la pantalla del roster deja de usar rosterDelGrupo",
    archivo: "apps/web/src/pages/[locale]/app/grupos/[id].astro",
    parche: (t) => t.replace("rosterDelGrupo(env.DB, sesion.userId, id)", "[]"),
    espera: "rosterDelGrupo",
  },
  {
    // El filtro quitado en la vista ordenada. Es una línea, y el síntoma es
    // invisible: un niño aparece en la tabla de posiciones de su grupo y su
    // padre nunca activó el ranking (D-087).
    auditor: "grupo-visibilidad-minima",
    que: "la vista ordenada del grupo deja de filtrar por opt-in",
    archivo: "apps/web/src/lib/grupo-tabla.ts",
    parche: (t) => t.replace(".filter((f) => visibleEnTablaDePosiciones(f.opt_in))", ""),
    espera: "visibleEnTablaDePosiciones",
  },

  // ─── F5 · `kinder-enunciados-i18n`, degradando el catálogo REAL (D-070) ──
  //
  // El auditor nació porque al autorar 25 claves en siete archivos a mano,
  // ninguna comprobación hubiera visto una olvidada. La degradación borra una
  // clave del `de-DE.json` REAL: es el olvido literal, en el archivo literal.
  {
    auditor: "kinder-enunciados-i18n",
    que: "una clave de enunciado del banco sin texto en de-DE",
    archivo: "apps/web/src/i18n/reto/de-DE.json",
    parche: (t) =>
      t.replace(
        '  "k.recta.saltos": "Wie viele Sprünge sind es von der {a} bis zur Lücke?",\n',
        "",
      ),
    espera: "k.recta.saltos",
  },
  {
    // La otra cara: la clave existe, pero la plantilla pide una variable que
    // el ítem no trae, y el niño ve «{a}» literal en mitad de la frase. Se
    // degrada el catálogo REAL añadiendo un hueco a una plantilla viva.
    auditor: "kinder-enunciados-i18n",
    que: "una plantilla pide {llenas} y el ítem no la trae",
    archivo: "apps/web/src/i18n/reto/es-MX.json",
    parche: (t) =>
      t.replace(
        '"k.recta.saltos": "¿Cuántos saltos hay del {a} hasta el hueco?"',
        '"k.recta.saltos": "¿Cuántos saltos hay del {a} hasta el hueco? Piensa en las {llenas}."',
      ),
    espera: "{llenas}",
  },

  // ─── F5b · Los dos auditores de la franja adulta (#159–#167) ─────────────
  //
  // Los seis casos DEGRADAN archivos REALES (D-070): los catálogos de los
  // locales, la plantilla y el guion de siembra que este PR introduce. Un
  // archivo inventado solo probaría que el auditor sabe leer un archivo
  // inventado.
  {
    // La de #162 literal: un enunciado de la franja sin plantilla en alemán.
    // Es el fallo de «seis locales editados y el séptimo quedó atrás».
    auditor: "banco-adulto-i18n",
    que: "un enunciado de la franja sin plantilla en de-DE",
    archivo: "apps/web/src/i18n/reto/de-DE.json",
    parche: (t) => t.replace('  "a.pct.de": "Wie viel sind {p} % von {n}?",\n', ""),
    espera: "a.pct.de",
  },
  {
    // La otra punta del mismo cruce: la PLANTILLA nombra una clave que
    // ningún catálogo tiene. Se degrada la fuente, no el catálogo.
    auditor: "banco-adulto-i18n",
    que: "la plantilla A01 apunta a una clave que no existe en ningún locale",
    archivo: "packages/motor/src/banco-adulto.ts",
    parche: (t) => t.replace('"a.pct.de"', '"a.pct.inexistente"'),
    espera: "a.pct.inexistente",
  },
  {
    // El cable de la siembra cortado (#159): el guion siembra la franja con
    // la banda de primaria — 150 filas en D1, cero visibles para el adulto,
    // y nada visible se rompe. El auditor tiene que nombrar la banda.
    auditor: "banco-adulto-i18n",
    que: "la siembra escribe la franja con banda PRIMARIA",
    archivo: "scripts/sembrar-banco-adulto.mjs",
    parche: (t) => t.replace('sql("SERIO")', 'sql("PRIMARIA")'),
    espera: "SERIO",
  },
  {
    // #161, el barandal principal de D-034: la franja crece a 204 ítems y
    // «mínima» se convierte en una segunda banda. Se degrada la lista de
    // parámetros REAL de A01 con una tanda extra plausible.
    auditor: "franja-adulta",
    que: "la franja crece por encima de 200 ítems",
    archivo: "packages/motor/src/banco-adulto.ts",
    parche: (t) =>
      t.replace(
        "      [25, 200], [25, 400], [50, 160], [50, 240], [75, 200], [75, 400],",
        "      [25, 200], [25, 400], [50, 160], [50, 240], [75, 200], [75, 400],\n" +
        "      [5, 800], [5, 1000], [10, 300], [10, 500], [20, 350], [20, 450],\n" +
        "      [25, 300], [25, 500], [50, 180], [50, 260], [75, 240], [75, 280],\n" +
        "      [5, 1200], [5, 1400], [10, 600], [10, 700], [20, 550], [20, 650],\n" +
        "      [25, 600], [25, 700], [50, 300], [50, 320], [75, 320], [75, 360],\n" +
        "      [5, 1600], [5, 1800], [10, 800], [10, 900], [20, 750], [20, 850],\n" +
        "      [25, 800], [25, 900], [50, 340], [50, 360], [75, 440], [75, 480],\n" +
        "      [5, 2000], [5, 2200], [10, 1100], [10, 1200], [20, 950], [20, 1050],\n" +
        "      [25, 1000], [25, 1100], [50, 380], [50, 420], [75, 520], [75, 560],\n" +
        "      [5, 2400], [5, 2600], [10, 1300], [10, 1400], [20, 1150], [20, 1250],\n" +
        "      [25, 1200], [25, 1300], [50, 440], [50, 460], [75, 600], [75, 640],",
      ),
    espera: "segunda banda",
  },
  {
    // #163: la Sabana colada en la franja. La clave degradada es la real y
    // el auditor tiene que decir «Sabana» — un ítem del club no puede
    // referenciar el sendero de kinder.
    auditor: "franja-adulta",
    que: "una clave de la franja referencia la Sabana",
    archivo: "packages/motor/src/banco-adulto.ts",
    parche: (t) => t.replace('"a.sec.sigue"', '"a.sabana.sigue"'),
    espera: "Sabana",
  },
  {
    // #162, la notación: de-DE con × es el error de mc-34 en su forma pura —
    // en un aula alemana el × se lee como la variable x. Se degrada el
    // catálogo alemán REAL.
    auditor: "franja-adulta",
    que: "el catálogo de-DE multiplica con × en vez de ·",
    archivo: "apps/web/src/i18n/reto/de-DE.json",
    parche: (t) => t.replace('"a.orden.suma_mult": "Wie viel ist {a} + {b} · {c}?"', '"a.orden.suma_mult": "Wie viel ist {a} + {b} × {c}?"'),
    espera: "de-DE",
  },

  // ─── #259 · El índice único del alias, y la forma en que volvería a morir ─
  //
  // El bug original fue un índice que nunca existió mientras el código juraba
  // que sí. La forma en que reaparecería hoy —con la 0006 y la 0021 en el
  // repo— no es que alguien borre esos archivos (migration-safety lo
  // bloquea): es una migración NUEVA con un `DROP INDEX`, que es exactamente
  // lo que este caso planta. El auditor recorre las migraciones en orden y
  // exige el índice VIVO al final, así que el DROP lo apaga aquí.
  {
    auditor: "alias-unico",
    que: "una migración posterior tira el índice único del alias",
    archivo: "migrations/9999_prueba_alias.sql",
    contenido:
      "-- migration-safety: caso de control negativo del auditor alias-unico —\n" +
      "-- una migración que tira el índice sin reponerlo, la forma exacta en\n" +
      "-- que el bug de #259 reaparecería.\n" +
      "DROP INDEX idx_alias_por_padre;\n",
    espera: "UNIQUE",
  },
  {
    // El modo de fallo del que nace el auditor: alguien endurece (o ablanda)
    // una cabecera en UNO de los dos sitios y los textos se separan en
    // silencio. La degradación cambia el valor en el módulo del Worker y
    // deja `_headers` intacto.
    auditor: "cabeceras-ssr",
    que: "X-Frame-Options vale distinto en el Worker que en _headers",
    archivo: "apps/web/src/lib/cabeceras-seguridad.ts",
    parche: (t) => t.replace('"x-frame-options": "DENY"', '"x-frame-options": "SAMEORIGIN"'),
    espera: "vale distinto en _headers que en cabeceras-seguridad.ts",
  },
  {
    // El patrón «correcto pero sin llamador»: el módulo existe y los valores
    // coinciden, pero el middleware deja de ponerlos — y las rutas SSR vuelven
    // a quedar desnudas sin que ningún valor cambie.
    auditor: "cabeceras-ssr",
    que: "el middleware deja de importar el módulo de cabeceras",
    archivo: "apps/web/src/middleware.ts",
    parche: (t) => t.replace('from "./lib/cabeceras-seguridad"', 'from "./lib/ratelimiter"'),
    espera: "no importa cabeceras-seguridad.ts",
  },
];

const soloEste = process.argv[2] ?? null;
const casos = soloEste ? CASOS.filter((c) => c.auditor === soloEste) : CASOS;

if (casos.length === 0) {
  console.error(`✗ no hay casos para "${soloEste}".`);
  console.error(`  Auditores con caso: ${[...new Set(CASOS.map((c) => c.auditor))].join(", ")}`);
  process.exit(2);
}

console.log(`\n== ¿los auditores atrapan lo que dicen atrapar? — ${casos.length} caso(s) ==\n`);

let fallos = 0;

for (const caso of casos) {
  const ruta = `${RAIZ}${caso.archivo}`;
  const existiaAntes = existsSync(ruta);
  const original = existiaAntes ? readFileSync(ruta, "utf8") : null;

  if (caso.parche) {
    // ─── Caso de DEGRADACIÓN, no de archivo nuevo ─────────────────────────
    //
    // D-070 lo dice con todas sus letras: «el control negativo no basta si el
    // caso de prueba se escribe a mano». Un archivo inventado prueba que el
    // auditor sabe leer un archivo inventado. Degradar el archivo REAL —quitar
    // el import que de verdad faltó— prueba que habría cazado el bug que de
    // verdad ocurrió.
    //
    // El archivo TIENE que existir: si no, el caso apunta a una ruta que se
    // movió y estaría probando el vacío.
    if (!existiaAntes) {
      console.error(`  ✗ ${caso.auditor}: ${caso.archivo} NO EXISTE y el caso lo degrada.`);
      console.error(`      Un parche sobre un archivo ausente no prueba nada. ¿Se movió?`);
      fallos++;
      continue;
    }
    const degradado = caso.parche(original);
    if (degradado === original) {
      console.error(`  ✗ ${caso.auditor}: el parche sobre ${caso.archivo} no cambió NADA.`);
      console.error(`      El texto que buscaba ya no está: el caso corría en verde sin degradar nada.`);
      fallos++;
      continue;
    }
    writeFileSync(ruta, degradado, "utf8");
  } else {
    // Un caso que sobrescribiera un archivo real y luego lo restaurara mal sería
    // peor que no probar nada. Se aborta antes de tocarlo.
    if (existiaAntes) {
      console.error(`  ✗ ${caso.auditor}: ${caso.archivo} YA EXISTE. El caso lo sobrescribiría.`);
      fallos++;
      continue;
    }

    mkdirSync(dirname(ruta), { recursive: true });
    writeFileSync(ruta, caso.contenido, "utf8");
  }

  let r;
  try {
    // `--experimental-strip-types` para todos, igual que en `run.mjs`: hay
    // auditores que importan el motor, que es TypeScript. Mantener aquí una
    // lista de cuáles lo necesitan se desincronizaría el día que un auditor
    // nuevo importe código de producto — y el síntoma sería un caso que
    // "bloquea" por un error de sintaxis en vez de por la violación.
    r = spawnSync("node", ["--experimental-strip-types", "--no-warnings", `audits/${caso.auditor}.mjs`], {
      cwd: RAIZ,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    });
  } finally {
    if (caso.parche) writeFileSync(ruta, original, "utf8");
    else {
      rmSync(ruta, { force: true });
      if (original !== null) writeFileSync(ruta, original, "utf8");
    }
  }

  const salida = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  const bloqueo = r.status !== 0;
  const menciona = salida.toLowerCase().includes(caso.espera.toLowerCase());

  if (bloqueo && menciona) {
    console.log(`  ✓ ${caso.auditor.padEnd(22)} atrapó: ${caso.que}`);
  } else {
    fallos++;
    console.error(`  ✗ ${caso.auditor.padEnd(22)} NO atrapó: ${caso.que}`);
    if (!bloqueo) console.error(`      salió 0 con la violación delante`);
    if (bloqueo && !menciona) console.error(`      bloqueó pero no dijo "${caso.espera}" — ¿falló por otra razón?`);
    console.error(`      salida: ${salida.split("\n").filter(Boolean).slice(0, 3).join(" | ").slice(0, 200)}`);
  }
}

console.log("");
if (fallos > 0) {
  console.error(`✗ ${fallos} de ${casos.length} auditor(es) no atraparon su propia violación.\n`);
  console.error("  Un auditor que no se vio fallar no prueba nada (CLAUDE.md § Git, regla 3).");
  process.exit(1);
}
console.log(`✓ los ${casos.length} casos bloquearon, y por la razón correcta\n`);
