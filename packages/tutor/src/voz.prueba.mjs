// Casos de la voz de Larry (F6 #135, plan F6 §4, mc-42, mc-20).
//
// Dos cosas que estas pruebas defienden y que no se ven leyendo el código:
//
// 1. Que «mientras resuelve» y «al resolver» sigan siendo presupuestos
//    SEPARADOS. `mc-42` §3 mide que el sonido irrelevante durante la tarea
//    perjudica el desempeño; el día que alguien los unifique «para simplificar»,
//    nada se rompe y el producto empieza a sonar mientras un niño cuenta.
// 2. Que el catálogo hablado no se pueda componer. Si alguien sustituye la
//    tabla de números por una función que pega decenas y unidades, el alemán
//    empieza a decir palabras que no existen, sin fallar.

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import {
  PRESUPUESTO,
  CELEBRACION_DE_SESION_MS,
  elegirFuente,
  coberturaDeVoz,
  ETIQUETA_DE_VOZ,
  validarSenales,
  regimenDeClave,
  nombreDeNumero,
  validarNumeros,
  RANGO_DE_NUMEROS,
  DESBLOQUEO,
  REDUCED_MOTION_NO_SILENCIA,
} from "./voz.ts";
import { LOCALES } from "../../motor/src/convenciones.ts";

let fallos = 0;
const ok = (cond, nombre) => {
  console.log(`  ${cond ? "✓" : "✗"} ${nombre}`);
  if (!cond) fallos++;
};

console.log("larry/voz — dos regímenes, siete catálogos, ninguna entrada de audio\n");

const AQUI = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(AQUI, "../../../apps/web/src/i18n/voz");
const catalogo = {};
for (const archivo of readdirSync(DIR).filter((f) => f.endsWith(".json"))) {
  catalogo[archivo.replace(/\.json$/, "")] = JSON.parse(readFileSync(`${DIR}/${archivo}`, "utf8"));
}

// --- los dos regímenes no son el mismo presupuesto -------------------------
{
  ok(
    PRESUPUESTO.mientras_resuelve.musica === false && PRESUPUESTO.al_resolver.musica === false,
    "ningún régimen permite música de fondo (mc-42 §3: coherencia de Mayer y efecto de sonido irrelevante)",
  );
  ok(
    PRESUPUESTO.mientras_resuelve.espontaneo === false,
    "mientras resuelve, nada suena por su cuenta: el enunciado se pide, no se repite solo",
  );
  ok(
    PRESUPUESTO.al_resolver.espontaneo === true,
    "al resolver sí suena solo: ese es el instante de recompensa, y es lo que mc-42 §1 llama juice",
  );
  ok(
    PRESUPUESTO.al_resolver.audioMs <= 500 && PRESUPUESTO.al_resolver.animacionMs <= 800,
    "la celebración por respuesta cabe en 500 ms de audio y 800 ms de animación (mc-42 §12)",
  );
  ok(CELEBRACION_DE_SESION_MS <= 2_500, "la celebración de sesión cabe en 2.5 s y es saltable");
  ok(
    PRESUPUESTO.mientras_resuelve.animacionMs === 0,
    "mientras resuelve no hay animación de celebración compitiendo por la atención",
  );
  ok(
    PRESUPUESTO.mientras_resuelve.audioMs !== PRESUPUESTO.al_resolver.audioMs,
    "los dos techos son distintos — si alguien los iguala, es que los unificó",
  );
}

// --- el reparto por clave sale de mc-42, no del gusto de nadie -------------
{
  ok(regimenDeClave("k.suma.patos") === "mientras_resuelve", "el enunciado suena mientras resuelve");
  ok(regimenDeClave("error.se_salto_uno") === "al_resolver", "la causa del error suena al resolver");
  ok(regimenDeClave("acierto") === "al_resolver", "el acierto suena al resolver");
  ok(regimenDeClave("inesperada") === "al_resolver", "la respuesta inesperada suena al resolver");
  ok(regimenDeClave("juego.siguiente") === "nunca_suena_solo", "un rótulo de interfaz nunca suena solo");
  ok(regimenDeClave("habilidad.K10") === "nunca_suena_solo", "la etiqueta de habilidad nunca suena sola");
}

// --- la elección de fuente: el clip primero, la muda siempre válida --------
{
  const base = {
    clipDisponible: true,
    vozDelSistema: "exacta",
    silenciado: false,
    audioDesbloqueado: true,
  };
  ok(elegirFuente(base) === "clip", "con clip disponible se usa el clip, no la síntesis del sistema");
  ok(
    elegirFuente({ ...base, clipDisponible: false }) === "sintesis_del_sistema",
    "sin clip y con voz exacta, la síntesis del sistema es la red de última instancia",
  );
  ok(
    elegirFuente({ ...base, clipDisponible: false, vozDelSistema: "misma_lengua_otra_region" }) === "muda",
    "una voz de otra región NO se acepta en silencio: una voz de pt-BR leyendo pt-PT cambia la fonología",
  );
  ok(
    elegirFuente({ ...base, clipDisponible: false, vozDelSistema: "ninguna" }) === "muda",
    "sin voz del sistema se cae a la vía muda, que es de primera clase",
  );
  ok(elegirFuente({ ...base, silenciado: true }) === "muda", "silenciado gana sobre todo lo demás");
  ok(
    elegirFuente({ ...base, audioDesbloqueado: false }) === "muda",
    "antes del gesto del usuario no suena nada: la política de autoplay no da error, da silencio (mc-42 §9)",
  );
}

// --- la sonda de voces distingue exacta de aproximada ---------------------
{
  ok(
    coberturaDeVoz([{ lang: "pt-PT" }], "pt-PT") === "exacta",
    "una voz pt-PT para texto pt-PT es cobertura exacta",
  );
  ok(
    coberturaDeVoz([{ lang: "pt-BR" }], "pt-PT") === "misma_lengua_otra_region",
    "una voz pt-BR para texto pt-PT es otra región, y se devuelve como categoría propia",
  );
  ok(coberturaDeVoz([{ lang: "de-DE" }], "fr-FR") === "ninguna", "sin voz de la lengua, ninguna");
  ok(
    coberturaDeVoz([], "en") === "ninguna",
    "la lista vacía da `ninguna` — y por eso la sonda espera a `voiceschanged` antes de llamar",
  );
  ok(
    coberturaDeVoz([{ lang: "es_MX" }], "es-MX") === "exacta",
    "la etiqueta con guion bajo se normaliza: algunos sistemas la devuelven así",
  );
  ok(ETIQUETA_DE_VOZ.en === "en-GB", "`en` se expande a en-GB: los textos ya autorados son ortografía británica");
  ok(
    LOCALES.every((l) => typeof ETIQUETA_DE_VOZ[l] === "string"),
    "los siete locales tienen etiqueta de voz",
  );
}

// --- ninguna señal va solo por sonido --------------------------------------
{
  ok(
    validarSenales([{ clave: "acierto", regimen: "al_resolver", visual: "chispa" }]).length === 0,
    "una señal con equivalente visual pasa",
  );
  ok(
    validarSenales([{ clave: "acierto", regimen: "al_resolver", visual: "" }]).length > 0,
    "una señal sin equivalente visual bloquea (WCAG 1.2.1, mc-42 §10)",
  );
  ok(
    validarSenales([
      { clave: "acierto", regimen: "al_resolver", visual: "a" },
      { clave: "acierto", regimen: "al_resolver", visual: "b" },
    ]).length > 0,
    "una señal declarada dos veces bloquea",
  );
}

// --- el catálogo hablado: siete, completos, y no compuestos ---------------
{
  const problemas = validarNumeros(catalogo);
  ok(problemas.length === 0, `los siete catálogos hablados validan${problemas.length ? `: ${problemas[0]}` : ""}`);
  ok(Object.keys(catalogo).length === LOCALES.length, `hay ${LOCALES.length} catálogos hablados`);
  ok(RANGO_DE_NUMEROS.includes(21) && RANGO_DE_NUMEROS.includes(25), "el rango cubre el 21 y el 25, que el banco produce");

  const sinFrances = { ...catalogo };
  delete sinFrances["fr-FR"];
  ok(validarNumeros(sinFrances).some((p) => p.includes("fr-FR")), "falta un locale y se detecta");

  const conHueco = { ...catalogo, en: { numeros: { ...catalogo.en.numeros } } };
  delete conHueco.en.numeros["17"];
  ok(
    validarNumeros(conHueco).some((p) => p.includes("17")),
    "falta un número del rango y se detecta — un ítem lo va a pedir y no sonaría nada",
  );

  // El control que importa: la firma de una composición mecánica.
  const compuesto = {
    ...catalogo,
    "de-DE": { numeros: { ...catalogo["de-DE"].numeros, "21": "zwanzig eins" } },
  };
  ok(
    validarNumeros(compuesto).some((p) => p.includes("einundzwanzig")),
    "un 21 alemán con espacio bloquea: en alemán es UNA palabra con la unidad delante",
  );
}

// --- lo que el catálogo prueba de D-022 ------------------------------------
{
  ok(catalogo["de-DE"].numeros["21"] === "einundzwanzig", "de-DE: einundzwanzig, la unidad delante");
  ok(catalogo["fr-FR"].numeros["21"] === "vingt et un", "fr-FR: vingt et un");
  ok(
    catalogo["pt-BR"].numeros["16"] !== catalogo["pt-PT"].numeros["16"],
    "pt-BR dice dezesseis y pt-PT dezasseis — no es ortografía, es otra palabra",
  );
  ok(
    catalogo["pt-BR"].numeros["14"] !== catalogo["pt-PT"].numeros["14"],
    "pt-BR dice quatorze y pt-PT catorze",
  );
  ok(
    catalogo["es-MX"].numeros["21"] === catalogo["es-ES"].numeros["21"],
    "es-MX y es-ES SÍ coinciden hasta el 25, y aun así son dos archivos: lo que los separa entra más arriba",
  );
  ok(nombreDeNumero(catalogo["de-DE"].numeros, 25) === "fünfundzwanzig", "el 25 alemán sale del catálogo");
  ok(nombreDeNumero(catalogo["en"].numeros, 99) === null, "fuera de rango devuelve null en vez de inventar");
  ok(nombreDeNumero(undefined, 3) === null, "sin catálogo devuelve null en vez de lanzar");
}

// --- Larry nunca escucha (línea roja #1) -----------------------------------
{
  const fuente = readFileSync(resolve(AQUI, "voz.ts"), "utf8");
  const entradas = ["getUserMedia", "mediaDevices", "SpeechRecognition", "MediaRecorder", "AudioWorkletNode"];
  const encontradas = entradas.filter((api) => fuente.includes(api));
  ok(
    encontradas.length === 0,
    `el módulo de voz no nombra ninguna API de entrada de audio${encontradas.length ? `: ${encontradas.join(", ")}` : ""} — línea roja #1, sin matiz de edad`,
  );
  ok(
    fuente.includes("Larry NUNCA escucha") || fuente.includes("nunca escucha"),
    "el módulo dice explícitamente que la voz es solo de salida: el criterio de #135 no lo decía y un hueco textual en una línea roja es como se cruza",
  );
}

// --- el desbloqueo del audio -----------------------------------------------
{
  ok(DESBLOQUEO.sinPalabras === true, "el gesto de desbloqueo no lleva texto: el usuario no lee");
  ok(DESBLOQUEO.ladoMinimoPx >= 88, "el mosaico mide al menos 88 px (mc-20)");
  ok(DESBLOQUEO.cebaElContexto === true, "el mismo toque ceba el AudioContext, para que el primer sonido no llegue tarde");
  ok(DESBLOQUEO.memoria === "dispositivo", "la elección se recuerda por dispositivo, no por perfil del niño (línea roja #2)");
  ok(REDUCED_MOTION_NO_SILENCIA === true, "prefers-reduced-motion nunca se reutiliza para silenciar: no existe prefers-reduced-sound");
}

console.log(`\n${fallos === 0 ? "✓ todo verde" : `✗ ${fallos} fallo(s)`}`);
process.exit(fallos === 0 ? 0 : 1);
