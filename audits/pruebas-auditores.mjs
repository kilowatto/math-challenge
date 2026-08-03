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
    parche: (t) => t.replace('"Multiplicaste en vez de sumar.",', '"Los demás niños ya lo lograron.",'),
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
