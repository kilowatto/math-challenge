// Casos del Durable Object del aprendiz (F4 #84, #86, #87, #104).
//
// Las dos que mandan:
//
//  · **Nada de lo que se guarda es un intento crudo** (criterio #86). Se
//    comprueba serializando TODO el almacenamiento y buscando dentro la
//    respuesta que el niño dio, el enunciado y el rastro de correcciones. Se ve
//    fallar añadiendo `respuestaDelNino: r.respuesta` a la fila.
//  · **Borrar borra de verdad** (criterio #104). Tras `/olvidar` el
//    almacenamiento queda en cero, no «marcado como borrado».

import { Aprendiz } from "./aprendiz.ts";

let fallos = 0;
const ok = (cond, nombre) => {
  console.log(`  ${cond ? "✓" : "✗"} ${nombre}`);
  if (!cond) fallos++;
};

const DIA = 86_400_000;
const T0 = 1_800_000_000_000;

/**
 * Un almacenamiento falso con la misma forma que el del DO. No es un doble del
 * objeto —la clase bajo prueba es la de verdad—: es el disco.
 */
function almacenamientoFalso() {
  const m = new Map();
  return {
    interno: m,
    async get(k) { return m.get(k); },
    async put(k, v) { m.set(k, structuredClone(v)); },
    async list({ prefix }) {
      return new Map([...m].filter(([k]) => k.startsWith(prefix)));
    },
    async deleteAll() { m.clear(); },
  };
}

const nuevo = () => {
  const storage = almacenamientoFalso();
  return { obj: new Aprendiz({ storage }), storage };
};

const registro = (extra = {}) => ({
  skillId: "K03",
  dificultad: 0,
  nivel: 6,
  correcto: true,
  ahora: T0,
  banda: "PRIMARIA",
  nivelSemilla: 6,
  ...extra,
});

console.log("aprendiz — el Durable Object del modelo, uno por niño\n");

// --- registrar y leer -------------------------------------------------------
{
  const { obj } = nuevo();
  const r1 = await obj.registrar(registro());
  ok(r1.skillId === "K03", "devuelve el resumen de la habilidad que se registró");
  ok(typeof r1.nivel === "number" && r1.nivel >= 1 && r1.nivel <= 12, "con el nivel dentro de la escalera");
  ok(r1.ubicando === true, "y diciendo que todavía está ubicando");
  ok(r1.etapa === "practicando", "la etapa arranca en «practicando», no en «aprendido»");

  const antes = r1.nivel;
  for (let i = 0; i < 6; i++) await obj.registrar(registro({ ahora: T0 + i * DIA, correcto: true }));
  const despues = (await obj.resumen())[0];
  ok(despues.nivel > antes, "acertar seguido sube el nivel estimado");
}

// --- la llave es (niño, habilidad) — criterio #87 --------------------------
{
  const { obj } = nuevo();
  await obj.registrar(registro({ skillId: "K01", correcto: true, nivelSemilla: 9 }));
  await obj.registrar(registro({ skillId: "K01", correcto: true }));
  await obj.registrar(registro({ skillId: "K01", correcto: true }));
  await obj.registrar(registro({ skillId: "K09", correcto: false, nivelSemilla: 2 }));
  await obj.registrar(registro({ skillId: "K09", correcto: false }));

  const res = await obj.resumen();
  ok(res.length === 2, "dos habilidades, dos filas");
  const alta = res.find((h) => h.skillId === "K01");
  const baja = res.find((h) => h.skillId === "K09");
  ok(alta.nivel > baja.nivel,
    `el MISMO niño está alto en una habilidad y bajo en otra a la vez (N${alta.nivel} vs N${baja.nivel}) — mc-44 impl. 6-7`);
}

// --- Mundo Kinder multi-bioma: dominar K01 en un bioma NO domina K01 en otro ---
//
// SE VE FALLAR: antes de este cambio, la llave era `hab:<skillId>` sin bioma
// — las dos series de abajo habrían escrito la MISMA fila, y `res.length`
// habría dado 1 en vez de 2, con el nivel de Desierto pisando el de Sabana.
{
  const { obj } = nuevo();
  // K01 en desierto: seis aciertos seguidos — debería subir mucho.
  await obj.registrar(registro({ skillId: "K01", bioma: "desierto", correcto: true, nivelSemilla: 6 }));
  for (let i = 0; i < 5; i++) {
    await obj.registrar(registro({ skillId: "K01", bioma: "desierto", ahora: T0 + i * DIA, correcto: true }));
  }
  // K01 en sabana: nunca se tocó — no debe existir fila, y mucho menos
  // heredar el progreso de desierto.
  const res = await obj.resumen();
  ok(res.length === 1, "sin tocar sabana, solo existe la fila de desierto");
  ok(res[0].bioma === "desierto", "y trae el bioma correcto en el resumen");

  // Ahora sí se toca K01 en sabana, con fallos — debe arrancar de CERO, no
  // heredar el nivel alto que ya tiene en desierto.
  await obj.registrar(registro({ skillId: "K01", bioma: "sabana", correcto: false, nivelSemilla: 6 }));
  const res2 = await obj.resumen();
  ok(res2.length === 2, "K01 en desierto y K01 en sabana son DOS filas, no una");
  const enDesierto = res2.find((h) => h.bioma === "desierto");
  const enSabana = res2.find((h) => h.bioma === "sabana");
  ok(enDesierto.nivel > enSabana.nivel,
    `el mismo skillId (K01) está alto en desierto y bajo en sabana a la vez (N${enDesierto.nivel} vs N${enSabana.nivel}) — dominio independiente por bioma`);

  // `resumen(bioma)` filtra a un solo mundo — lo que pide el mapa de un bioma específico.
  const soloDesierto = await obj.resumen("desierto");
  ok(soloDesierto.length === 1 && soloDesierto[0].bioma === "desierto",
    "resumen(bioma) trae solo ese mundo, no los dos");
}

// --- una fila escrita ANTES de Mundo Kinder multi-bioma (sin `:bioma` en la llave) ---
{
  const { obj, storage } = nuevo();
  // Simula una fila de la era pre-bioma: llave vieja, sin sufijo.
  storage.interno.set("hab:K07", {
    habilidad: { habilidad: 0, respondidos: 3, fallosSeguidos: 0, ultimosNiveles: [4] },
    repaso: { rachaCorrectas: 0, venceEn: null },
  });
  const res = await obj.resumen();
  const fila = res.find((h) => h.skillId === "K07");
  ok(fila?.bioma === "sabana", "una llave vieja sin bioma se lee como sabana, nunca revienta");
}

// ---------------------------------------------------------------------------
// CRITERIO #86: estado DERIVADO, jamás el intento crudo
// ---------------------------------------------------------------------------
//
// SE VE FALLAR: añade `respuestaDelNino: r.correcto ? "12" : "9"` a la `fila`
// que `registrar()` guarda, y la búsqueda de abajo lo encuentra.
{
  const { obj, storage } = nuevo();
  // Se registran respuestas con datos que NO deben acabar guardados. Si el
  // objeto los guardara, estarían en el volcado.
  await obj.registrar({
    ...registro(),
    // Campos de más: un llamador descuidado los manda y el objeto los ignora.
    respuestaDelNino: "cuarenta-y-dos",
    enunciado: "¿cuántos elefantes hay?",
    teclas: ["4", "backspace", "4", "2"],
    correccionesAntesDeEnviar: 3,
  });

  const volcado = JSON.stringify([...storage.interno.entries()]);
  console.log(`     lo guardado: ${volcado.slice(0, 150)}…`);

  for (const prohibido of ["cuarenta-y-dos", "elefantes", "backspace", "correcciones", "teclas", "enunciado"]) {
    ok(!volcado.includes(prohibido),
      `nada llamado «${prohibido}» llega al almacenamiento (criterio #86, mc-32 riesgo #1)`);
  }

  // Y lo que SÍ está es derivado: números y fechas, ni una cadena del niño.
  // La llave lleva bioma desde Mundo Kinder multi-bioma — "sabana" es el
  // que cae por defecto cuando `registro()` no manda uno explícito.
  const fila = storage.interno.get("hab:K03:sabana");
  ok(typeof fila.habilidad.habilidad === "number", "lo que se guarda es la estimación, un número");
  ok(typeof fila.repaso.venceEn === "number", "y la fecha del próximo repaso");
  const claves = [...Object.keys(fila.habilidad), ...Object.keys(fila.repaso)];
  ok(!claves.some((k) => /respuesta|texto|enunciado|tecla|correccion/i.test(k)),
    "ninguna clave guardada suena a contenido del niño");
}

// --- línea roja #8 desde el objeto -----------------------------------------
{
  // Dos niños con la misma respuesta FINAL, uno habiendo dudado. El objeto no
  // recibe el rastro porque `Registro` no tiene dónde ponerlo, y por eso los dos
  // acaban idénticos.
  const a = nuevo(), b = nuevo();
  for (const c of [true, false, true, true]) {
    await a.obj.registrar(registro({ correcto: c }));
    await b.obj.registrar({ ...registro({ correcto: c }), correccionesAntesDeEnviar: 5 });
  }
  const ra = (await a.obj.resumen())[0], rb = (await b.obj.resumen())[0];
  ok(ra.nivel === rb.nivel,
    "quien corrigió cinco veces acaba en el MISMO nivel que quien no (línea roja #8, mc-30)");
}

// ---------------------------------------------------------------------------
// CRITERIO #104: el borrado alcanza al modelo
// ---------------------------------------------------------------------------
{
  const { obj, storage } = nuevo();
  for (const s of ["K01", "K02", "K03", "K07"]) {
    await obj.registrar(registro({ skillId: s }));
  }
  ok(storage.interno.size === 4, "hay 4 habilidades guardadas");

  const r = await obj.fetch(new Request("https://aprendiz/olvidar"));
  const cuerpo = await r.json();
  ok(cuerpo.ok === true && cuerpo.borrado === "todo", "`/olvidar` dice que borró todo");
  ok(storage.interno.size === 0,
    "y el almacenamiento queda EN CERO, no «marcado como borrado» (criterio #104)");
  ok((await obj.resumen()).length === 0, "el resumen posterior está vacío");

  // Volver a registrar tras el borrado empieza de cero, no resucita nada.
  const despues = await obj.registrar(registro({ skillId: "K01" }));
  ok(despues.etapa === "practicando" && despues.ubicando === true,
    "y volver a empezar arranca de cero: nada resucita");
}

// --- las rutas --------------------------------------------------------------
{
  const { obj } = nuevo();
  const r = await obj.fetch(new Request("https://aprendiz/lo-que-sea"));
  ok(r.status === 404, "una ruta desconocida NO se atiende en silencio");

  const post = await obj.fetch(new Request("https://aprendiz/registrar", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify(registro()),
  }));
  ok(post.ok, "`/registrar` responde por HTTP igual que por llamada directa");
  ok((await (await obj.fetch(new Request("https://aprendiz/resumen"))).json()).length === 1,
    "`/resumen` devuelve lo registrado");
}

// --- uno por niño, comprobado sobre la fuente (criterio #84) ---------------
{
  const fuente = await (await import("node:fs/promises")).readFile(
    new URL("./aprendiz.ts", import.meta.url), "utf8",
  );
  const sinComentarios = fuente.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  const llamadas = sinComentarios.match(/idFromName\(([^)]*)\)/g) ?? [];
  ok(llamadas.length === 1, `hay UNA sola llamada a idFromName (hay ${llamadas.length})`);
  ok(!/idFromName\(\s*["'`]/.test(sinComentarios),
    "y no recibe un literal: un DO global topa en 500-1.000 req/s (mc-32 riesgo #2)");
  ok(/idFromName\(childProfileId\)/.test(sinComentarios),
    "recibe el `child_profile_id` — un objeto por niño, que es lo que hace que el borrado sea `deleteAll()`");
}

console.log(fallos === 0 ? "\n✓ aprendiz — todos los casos" : `\n✗ aprendiz — ${fallos} caso(s) fallaron`);
process.exit(fallos === 0 ? 0 : 1);
