#!/usr/bin/env node
// gen-larry-fotorrealista.mjs — el Larry fotorrealista de "¿Quién juega?" (D-196).
//
// Reversa PUNTUAL de D-191 para una sola pantalla: D-191 reservó el
// fotorrealismo para SECUNDARIA→SERIO→PRO, con KINDER/PRIMARIA terminados en
// los 7 locales primero. El dueño vio ese conflicto explícito y decidió que
// `QuienJuegaScene` —que YA mezclaba niño ilustrado + adulto fotorrealista
// desde D-194— puede tener a Larry fotorrealista también, sin esperar. Otras
// pantallas de niño (`MenuScene`, `MapScene`) NO se tocan: siguen con el
// Larry ilustrado bípede de D-190 (`gen-larry.mjs`), sin ningún cambio.
//
// ─── Por qué Gemini/Nano Banana y no Recraft ────────────────────────────────
//
// Primer intento: Recraft (`realistic_image`), mismo generador que el resto
// del proyecto. Después de 8 rondas de prompt (ver el historial de commits
// de este archivo) el resultado seguía fallando de tres formas distintas y
// alternándose entre ellas sin converger: (1) Larry salía con cuerpo humano
// delgado y solo la cabeza de rinoceronte — el dueño lo señaló explícito
// viendo un resultado ("Larry no se puede ver flaco, es un rinoceronte");
// (2) pedir "ropa deportiva estilo Adidas/Puma, sin el logo real" traía el
// logo real de todas formas — nombrar la marca la trae aunque se niegue en
// la misma frase, y quitar el nombre de la marca no evitaba que apareciera
// un símbolo de todas formas reconocible (una estrella tipo Converse, un
// swoosh); (3) apilar más negativos para arreglar (2) rompió (1) más: en una
// corrida terminó generando DOS personajes separados (un humano y un
// rinoceronte de peluche aparte) en vez de uno.
//
// El dueño mostró cómo arma sus propios prompts para Nano Banana (Gemini
// 2.5 Flash Image, ya autorizado en CLAUDE.md § Imágenes para "piezas
// complejas de interfaz") — una frase directa y corta, sin apilar negativos
// — y el resultado fue correcto a la primera: cuerpo grueso de rinoceronte
// de verdad, una marca de ropa FICTICIA con su propio logo inventado (nunca
// una marca real, así que no hay problema de infracción de marca) y fondo
// blanco limpio. Este script usa ese mismo modelo y ese mismo estilo de
// prompt — descriptivo y natural, no una lista de negaciones.
//
// ─── El vestuario: marca ficticia, nunca una real ───────────────────────────
//
// "Rhino Athletics", con su propio escudo inventado — resuelve lo que D-191
// pedía ("ropa deportiva de corte real, estilo Adidas/Puma") sin el riesgo
// legal de un logo real. Colores naranja/blanco, tenis siempre naranjas
// (D-191/D-196).
//
// ─── Siete comportamientos + reposo + caminata ──────────────────────────────
//
//   idle       — 2 cuadros, de pie, respiración/parpadeo.
//   camina     — 8 cuadros, ciclo de caminata completo.
//   baila      — 8 cuadros.
//   saluda     — 3 cuadros.
//   aburrido   — 2 cuadros — pedido explícito del dueño.
//   ejercicio  — 4 cuadros ÚNICOS (jumping-jacks).
//   arrastra   — 4 cuadros, arrastrando una silla ("se sienta a leer"): el
//                dueño simplificó el comportamiento — Larry sale de cuadro
//                arrastrando la silla, la pantalla queda sin Larry unos
//                segundos (sentarse/leer/pararse pasa FUERA de cuadro,
//                nunca visible), y regresa caminando normal (reusa
//                `larry_foto_camina_*`) — así que no hace falta un solo
//                cuadro de sentarse/leer/pararse.
//   medita     — 2 cuadros — propuesto por Claude, contrapeso de energía
//                baja frente a bailar/ejercicio.
//   riega      — 2 cuadros, regando una plantita — propuesto por Claude, un
//                gesto de cuidado calmado, con la regadera y la planta
//                horneadas en el cuadro (no hay prop aparte que alinear).
//
// ─── D-196.1 (2026-08-09) — más cuadros y la silla deja de aparecer de la
// nada ────────────────────────────────────────────────────────────────────
//
// El dueño vio el resultado en vivo y señaló dos problemas reales: (1) "a
// las animaciones les hacen falta muchísimos cuadros, no tiene fluidez" — la
// ronda original tenía ciclos de 2-4 cuadros para movimientos rápidos
// (caminar, bailar, ejercicio), que a las velocidades necesarias para verse
// completos en tiempo real se ven a saltos; (2) "cuando se va Larry se lleva
// una silla que nunca trajo" — la silla de `arrastra` estaba horneada en el
// cuadro y aparecía de golpe en su mano, sin haber existido antes en la
// escena. Ambos se resuelven aquí: caminata/baile pasan a 8 cuadros
// (4 originales + 4 de transición intercaladas), ejercicio pasa a 4 poses
// ÚNICAS (antes 2 poses repetidas, léase el comentario junto a
// `ejercicio_5/6`), saluda gana un tercer cuadro para un vaivén real, y
// arrastra gana dos cuadros de paso. La silla se separa en un prop estático
// nuevo (`larry_foto_silla`) que vive en la escena TODO el tiempo salvo
// mientras Larry está fuera leyendo — ver `LarryFotorrealista.ts`.
//
// Total: 36 piezas (35 cuadros de Larry + 1 prop de silla suelta).
//
// Las llaves NUNCA se commitean: se leen de .env (./scripts/set-keys.sh las
// captura sin eco). Una pieza ya generada no se regenera salvo --forzar.
//
// Uso:   node scripts/gen-larry-fotorrealista.mjs                 genera lo que falte
//        node scripts/gen-larry-fotorrealista.mjs --solo baila    solo ids que casen
//        node scripts/gen-larry-fotorrealista.mjs --forzar        regenera aunque exista
//
// Después de generar, MIRA cada imagen (D-080 sigue exigiendo revisión
// humana, la reversa cambia el estilo, no la regla): que sea Larry — un
// rinoceronte GRUESO y musculoso, nunca un cuerpo humano delgado con
// cabeza de rinoceronte, con la marca ficticia "Rhino Athletics" (nunca una
// marca real), tenis naranjas, sin texto suelto, sin un segundo personaje.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const OUT = join(RAIZ, "apps/web/public/mapa");
const RAW = join(RAIZ, ".arte-crudo");

if (!process.env.GOOGLE_AI_API_KEY && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}
const llave = () => process.env.GOOGLE_AI_API_KEY;
const MODELO = "gemini-2.5-flash-image";

// El cuerpo/vestuario base, en prosa natural — CANON aprobado por el dueño
// (2026-08-09, tercera ronda de candidatos) tras dos correcciones: "muy
// fuertes" (se bajó de fisicoculturista a sturdy/friendly) y "que la ropa no
// sea naranja más que los tenis" (paso a azul/blanco). Repetido en las 24
// piezas para ayudar a la consistencia entre llamadas — y desde
// `REFERENCIA_ID` además se manda la imagen aprobada como ancla real, no
// solo texto (ver `generar()`).
const LARRY = "a photorealistic, hyperrealistic anthropomorphic orange " +
  "rhinoceros character named Larry. He has a sturdy, friendly, athletic " +
  "rhinoceros body — NOT an extreme bodybuilder, not overly muscular, just " +
  "naturally sturdy and a bit chunky like a real rhino — covered in short " +
  "orange fur, with a rhino head with one horn and a warm friendly smile, " +
  "standing upright on two legs like a person. He wears a SHORT-SLEEVE " +
  "athletic top with real fabric sleeves covering his shoulders and upper " +
  "arms down to mid-bicep (never a sleeveless tank top with bare " +
  "shoulders) and matching shorts, from a fictional brand called \"Rhino " +
  "Athletics\" — a simple circular badge logo with a small rhino head icon " +
  "and the words \"Rhino Athletics\" written clearly and legibly underneath " +
  "in a simple clean sans-serif font (never garbled or misspelled text). " +
  "The clothing is solid deep blue with white trim (NOT orange) — only his " +
  "sneakers are orange";

const FONDO = "Full body shot from head to feet, isolated on a plain " +
  "solid white background filling the whole frame, no other characters, " +
  "no people, no scenery, no props, no watermark";

const PIEZAS = [
  ["larry_foto_idle_1", `${LARRY}, standing still facing forward, both arms relaxed at the sides, calm friendly neutral expression. ${FONDO}.`],
  ["larry_foto_idle_2", `${LARRY}, standing still facing forward, both arms relaxed at the sides, calm friendly expression mid-blink. ${FONDO}.`],

  // Ciclo de caminata — 8 cuadros (D-196.1). Los 4 originales (contacto/paso)
  // se quedan; se añaden 4 de transición (bajada/subida del cuerpo) para que
  // el ciclo tenga las 8 fases estándar de una caminata realista en vez de
  // solo 4 — el dueño lo señaló explícito: "les hacen falta muchísimos
  // cuadros, no tiene fluidez". Orden real en `LarryFotorrealista.ts`:
  // 1,5,2,6,3,7,4,8 (contacto-baja-paso-sube, alternando pierna).
  ["larry_foto_camina_1", `${LARRY}, full body side profile facing right, walk cycle frame 1 of 8: contact pose, right leg stepping forward touching the ground, left leg stretched back, arms swinging opposite the legs. ${FONDO}.`],
  ["larry_foto_camina_5", `${LARRY}, full body side profile facing right, walk cycle frame 2 of 8: down pose right after the right foot contact, body dipping slightly lower, weight settling onto the right leg, left leg starting to lift off the ground behind. ${FONDO}.`],
  ["larry_foto_camina_2", `${LARRY}, full body side profile facing right, walk cycle frame 3 of 8: passing pose, legs close together mid-step under the body, body at its highest point. ${FONDO}.`],
  ["larry_foto_camina_6", `${LARRY}, full body side profile facing right, walk cycle frame 4 of 8: the left leg swinging forward through the air about to reach contact, right leg pushing off behind. ${FONDO}.`],
  ["larry_foto_camina_3", `${LARRY}, full body side profile facing right, walk cycle frame 5 of 8: contact pose, left leg stepping forward touching the ground, right leg stretched back — mirror of frame 1. ${FONDO}.`],
  ["larry_foto_camina_7", `${LARRY}, full body side profile facing right, walk cycle frame 6 of 8: down pose right after the left foot contact, body dipping slightly lower, weight settling onto the left leg, right leg starting to lift off the ground behind — mirror of frame 2. ${FONDO}.`],
  ["larry_foto_camina_4", `${LARRY}, full body side profile facing right, walk cycle frame 7 of 8: passing pose, legs close together mid-step under the body, body at its highest point — mirror of frame 3. ${FONDO}.`],
  ["larry_foto_camina_8", `${LARRY}, full body side profile facing right, walk cycle frame 8 of 8: the right leg swinging forward through the air about to reach contact (loops back to frame 1), left leg pushing off behind — mirror of frame 4. ${FONDO}.`],

  // Baile — 8 cuadros (D-196.1): 4 originales + 4 de transición intercaladas
  // (orden real 1,5,2,6,3,7,4,8) para que el paso de una pose a otra no se
  // sienta como un corte.
  ["larry_foto_baila_1", `${LARRY}, energetic dance pose: one arm raised high, opposite knee lifted, joyful open expression. ${FONDO}.`],
  ["larry_foto_baila_5", `${LARRY}, energetic dance pose, transition frame: mid-turn starting to spin, one arm coming down from overhead while the other starts rising out to the side, knee lowering back down, joyful open expression. ${FONDO}.`],
  ["larry_foto_baila_2", `${LARRY}, energetic dance pose: both arms out to the sides mid-spin, joyful open expression. ${FONDO}.`],
  ["larry_foto_baila_6", `${LARRY}, energetic dance pose, transition frame: starting to crouch down, arms bending inward from out-to-the-sides toward the chest, playful expression. ${FONDO}.`],
  ["larry_foto_baila_3", `${LARRY}, energetic dance pose: crouched low with both arms bent close to the chest, playful expression. ${FONDO}.`],
  ["larry_foto_baila_7", `${LARRY}, energetic dance pose, transition frame: pushing up out of the crouch, legs extending, arms starting to swing upward from the chest, joyful expression. ${FONDO}.`],
  ["larry_foto_baila_4", `${LARRY}, energetic dance pose: jumping up with both arms raised straight overhead, joyful open expression. ${FONDO}.`],
  ["larry_foto_baila_8", `${LARRY}, energetic dance pose, transition frame: landing back down from the jump, one arm lowering from overhead, opposite knee starting to lift again (loops back to frame 1), joyful open expression. ${FONDO}.`],

  // Saluda — 3 cuadros (D-196.1): se añade un tercero con la muñeca inclinada
  // al lado contrario del cuadro 2, para que el saludo se vea de lado a lado
  // en vez de solo subir el brazo una vez.
  ["larry_foto_saluda_1", `${LARRY}, facing the viewer, one arm starting to raise up beside the body, warm friendly smile. ${FONDO}.`],
  ["larry_foto_saluda_2", `${LARRY}, facing the viewer, one arm raised high waving with an open palm tilted to one side, warm friendly smile. ${FONDO}.`],
  ["larry_foto_saluda_3", `${LARRY}, facing the viewer, one arm raised high waving with an open palm tilted to the OTHER side (mirror wrist angle of the other waving frame), warm friendly smile. ${FONDO}.`],

  ["larry_foto_aburrido_1", `${LARRY}, facing the viewer, slouched posture, arms crossed over the chest, unimpressed bored expression looking off to the side. ${FONDO}.`],
  ["larry_foto_aburrido_2", `${LARRY}, facing the viewer, slouched posture, resting his chin on one hand with the elbow propped up, sleepy bored expression. ${FONDO}.`],

  // Ejercicio — 4 cuadros ÚNICOS (D-196.1): los 2 nuevos son las posiciones
  // intermedias de abrir/cerrar — antes los cuadros 3/4 repetían casi
  // exactamente 1/2, así que el ciclo solo tenía 2 poses reales alternando.
  // Orden real: 1(cerrado),5(abriendo),2(abierto),6(cerrando) — 4 poses
  // distintas en el loop, no 2.
  ["larry_foto_ejercicio_1", `${LARRY}, jumping jack exercise, closed position: standing with feet together and arms down at the sides, focused athletic expression. ${FONDO}.`],
  ["larry_foto_ejercicio_5", `${LARRY}, jumping jack exercise, opening transition: legs starting to spread apart and arms swinging outward and upward, midway between closed and fully open, focused athletic expression. ${FONDO}.`],
  ["larry_foto_ejercicio_2", `${LARRY}, jumping jack exercise, open position: mid-jump with legs spread wide and both arms raised overhead, focused athletic expression. ${FONDO}.`],
  ["larry_foto_ejercicio_6", `${LARRY}, jumping jack exercise, closing transition: legs starting to come back together and arms swinging inward and downward, midway between open and closed (loops back to closed), focused athletic expression. ${FONDO}.`],

  // Arrastra ("se sienta a leer") — 4 cuadros (D-196.1): se añaden dos
  // poses de paso intercaladas (orden real 1,3,2,4) para que el arrastre de
  // la silla se vea como caminar de verdad, no un salto entre dos poses.
  ["larry_foto_arrastra_1", `${LARRY}, full body side profile facing left, walking while dragging a small simple wooden folding chair with one hand, leaning forward to pull it, determined focused expression, right leg stepping forward touching the ground. ${FONDO}.`],
  ["larry_foto_arrastra_3", `${LARRY}, full body side profile facing left, walking while dragging a small simple wooden folding chair with one hand, leaning forward to pull it, determined focused expression, legs passing close together mid-step under the body. ${FONDO}.`],
  ["larry_foto_arrastra_2", `${LARRY}, full body side profile facing left, walking while dragging a small simple wooden folding chair with one hand, leaning forward to pull it, determined focused expression, left leg stepping forward touching the ground — mirror of the first contact frame. ${FONDO}.`],
  ["larry_foto_arrastra_4", `${LARRY}, full body side profile facing left, walking while dragging a small simple wooden folding chair with one hand, leaning forward to pull it, determined focused expression, legs passing close together mid-step under the body — mirror of the other passing frame. ${FONDO}.`],

  ["larry_foto_medita_1", `${LARRY}, sitting cross-legged on the ground, both hands resting on his knees, eyes closed, calm peaceful expression, breathing in. ${FONDO}.`],
  ["larry_foto_medita_2", `${LARRY}, sitting cross-legged on the ground, both hands resting on his knees, eyes closed, calm peaceful expression, shoulders slightly raised, breathing out. ${FONDO}.`],

  ["larry_foto_riega_1", `${LARRY}, holding a small metal watering can with one hand, tilting it toward a small potted plant on the ground beside his feet, gentle caring expression. ${FONDO}.`],
  ["larry_foto_riega_2", `${LARRY}, holding a small metal watering can with one hand, tilted further down with water pouring onto a small potted plant on the ground beside his feet, gentle caring expression. ${FONDO}.`],

  // La silla — prop ESTÁTICO (D-196.1): antes la silla de `arrastra` aparecía
  // de la nada en la mano de Larry al primer cuadro de ese comportamiento —
  // el dueño lo señaló explícito ("se lleva una silla que nunca trajo").
  // Ahora vive dibujada suelta en la escena, en el mismo lugar donde Larry
  // reposa, y se oculta/reaparece sincronizada con la animación de arrastre
  // (`LarryFotorrealista.ts::ejecutarLeer/regresarDeLeer`) — mismo diseño de
  // silla de madera que los cuadros de `arrastra`, para que sea, a la vista,
  // la MISMA silla.
  //
  // NUNCA lleva la imagen de referencia de Larry (ver `REFERENCIA_EXCLUIDA`
  // más abajo) — la primera corrida SÍ la mandó, y el modelo dibujó a Larry
  // sentado en la silla en vez de la silla sola, porque el texto de
  // referencia dice explícito "using this exact same character". Un prop sin
  // personaje no debe llevar esa instrucción.
  ["larry_foto_silla", "A small simple wooden folding chair with a slatted seat and back, X-frame wooden legs, plain natural wood color, no cushion, no decoration. The chair is EMPTY — no character, no person, no animal, no rhinoceros, nothing sitting on or near it, just the empty chair by itself. " + FONDO + "."],
];

const args = process.argv.slice(2);
const solo = args.includes("--solo") ? args[args.indexOf("--solo") + 1] : null;
const forzar = args.includes("--forzar");

// La REFERENCIA — `larry_foto_idle_1`, ya aprobada — se manda como imagen de
// entrada en las otras 23 llamadas. Probado en esta sesión: describir a
// Larry desde cero en cada llamada (24 prompts de texto independientes) daba
// variación real de cuerpo/logo/color entre cuadros; mandar la referencia
// como imagen y pedir "el MISMO personaje, cambia solo la pose" la mantiene.
const REFERENCIA_ID = "larry_foto_idle_1";

// Piezas que NUNCA llevan la imagen de referencia — no son "el mismo
// personaje en otra pose", son props sueltos. Mandar la referencia con su
// instrucción de "same character" hace que el modelo dibuje a Larry encima
// del prop en vez del prop solo (visto con `larry_foto_silla`, primera
// corrida: salió Larry sentado en la silla, no la silla vacía).
const SIN_REFERENCIA = new Set(["larry_foto_silla"]);

function referenciaBase64() {
  const ruta = join(RAW, `${REFERENCIA_ID}.png`);
  if (!existsSync(ruta)) return null;
  return readFileSync(ruta).toString("base64");
}

async function generar(prompt, refB64) {
  const parts = refB64
    ? [
        {
          text:
            "Using this exact same character as a strict visual reference " +
            "(identical body, fur color, face, fictional Rhino Athletics " +
            "outfit and logo, and sneakers — change ONLY the pose described " +
            `below): ${prompt}`,
        },
        { inline_data: { mime_type: "image/png", data: refB64 } },
      ]
    : [{ text: prompt }];
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${llave()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
      signal: AbortSignal.timeout(180_000),
    },
  );
  if (!res.ok) {
    throw new Error(`Gemini respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const json = await res.json();
  const parte = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  const b64 = parte?.inlineData?.data;
  if (!b64) throw new Error(`respuesta sin imagen: ${JSON.stringify(json).slice(0, 300)}`);
  return Buffer.from(b64, "base64");
}

// Con alfa (colorkey sobre blanco) — estas piezas se pintan sueltas sobre la
// escena ilustrada de `QuienJuegaScene`, nunca dentro de un círculo/tarjeta
// propia. Mismo patrón que `PIEZAS_DE_JUEGO_CON_ALFA` de `gen-larry.mjs`.
function convertirConAlfa(id, extension) {
  const crudo = join(RAW, `${id}.${extension}`);
  const png = join(RAW, `${id}-alfa.png`);
  const webp = join(OUT, `${id}.webp`);
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-i", crudo,
    "-vf", "colorkey=0xFFFFFF:0.15:0.08,scale=512:512",
    png,
  ]);
  execFileSync("cwebp", ["-q", "90", "-alpha_q", "100", png, "-o", webp]);
}

if (!llave()) {
  console.error("error: falta GOOGLE_AI_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });

const refB64 = referenciaBase64();
if (!refB64) {
  console.log(`aviso: no hay ${REFERENCIA_ID}.png en ${RAW} todavía — las piezas se generarán sin imagen de referencia (menos consistentes).`);
}

let hechas = 0;
for (const [id, prompt] of PIEZAS) {
  if (solo && !id.includes(solo)) continue;
  const yaExiste = existsSync(join(OUT, `${id}.webp`));
  if (yaExiste && !forzar) {
    console.log(`· ${id} — ya existe, se salta (--forzar para regenerar)`);
    continue;
  }
  // La referencia nunca se manda como su propia imagen de entrada — se
  // generaría "a partir de sí misma" sin sentido — ni a props sueltos sin
  // personaje (ver `SIN_REFERENCIA`).
  const ref = id === REFERENCIA_ID || SIN_REFERENCIA.has(id) ? null : refB64;
  process.stdout.write(`… ${id} — generando${ref ? " (con referencia)" : ""}\n`);
  try {
    const img = await generar(prompt, ref);
    writeFileSync(join(RAW, `${id}.png`), img);
    convertirConAlfa(id, "png");
    hechas++;
    console.log(`✓ ${id} — ${(img.length / 1024).toFixed(0)} KB crudo, WebP con alfa en ${OUT}`);
  } catch (err) {
    console.error(`✗ ${id} — ${err.message}`);
  }
}

console.log(`\n${hechas} pieza(s) generada(s). Revisión humana pendiente antes de commitear (D-080).`);
