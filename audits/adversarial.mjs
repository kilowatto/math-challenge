#!/usr/bin/env node
// La flota adversarial — corredor (D-032, fase F1)
//
// 23 auditores con LLM, cada uno con su carta, cada uno obligado a citar la
// decisión que hace cumplir. Juzgan **el cambio**, no producción: leen el diff
// de tu rama y dicen qué no debería llegar a un usuario.
//
//   node audits/adversarial.mjs                  la rama contra main
//   node audits/adversarial.mjs --preparado      solo lo que está en el índice
//   node audits/adversarial.mjs <ref>            contra la referencia que digas
//   node audits/adversarial.mjs --solo kinder,locale-de-DE
//   node audits/adversarial.mjs --seco           arma todo y NO llama al modelo
//   node audits/adversarial.mjs --simular        pipeline completo con veredictos falsos
//   node audits/adversarial.mjs --todos          los 23 aunque no les toque — al cerrar fase
//   node audits/adversarial.mjs --cartas         valida las 23 cartas y sale
//
// Va aparte del gancho pre-commit a propósito. Los deterministas de
// audits/run.mjs cuestan milisegundos y bloquean cada commit; estos cuestan
// dinero y segundos, y bloquear cada commit con 23 llamadas de LLM es
// exactamente cómo una flota se vuelve el ruido que D-032 teme. Se corre antes
// de abrir el PR.

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { CARTAS, POR_ID } from "./adversarial/cartas.mjs";
import { cargarUniverso, verificarCartas, verificarCita, textoDecision, resumenInvestigacion } from "./adversarial/citas.mjs";
import { construirConstitucion } from "./adversarial/constitucion.mjs";
import { auditar, PROVEEDOR, MODELO_PRINCIPAL, PRECIOS } from "./adversarial/cliente.mjs";
import { verificarCredenciales, CADENA_WORKERS_AI } from "./adversarial/proveedores.mjs";
import { leerAnulaciones, plantilla } from "./adversarial/anulaciones.mjs";
import { clasificar } from "./adversarial/reglas.mjs";
import { escribirInforme } from "./adversarial/informe.mjs";

const raiz = new URL("..", import.meta.url).pathname;
const git = (...args) => execFileSync("git", args, { cwd: raiz, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });

// Presupuesto de diff por auditor. Recortar en silencio haría que "sin
// hallazgos" significara "no lo vio" — se recorta y se dice, en el prompt y en
// el informe.
const TOPE_DIFF = Number(process.env.MC_AUDIT_TOPE_DIFF ?? 120_000);
const CONCURRENCIA = Number(process.env.MC_AUDIT_CONCURRENCIA ?? 4);

// Archivos que ningún auditor debe leer nunca. No es ahorro cosmético: el diff
// de un lockfile o de una fuente binaria son miles de tokens que no contienen
// un solo juicio posible, y los paga cada uno de los 23. Lo que sí importa de
// un asset —peso, formato, paleta— ya lo revisan `bundle-budget` y
// `brand-image`, que son deterministas y cuestan milisegundos.
const IGNORADOS = [
  /(^|\/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock)$/,
  /\.(woff2?|ttf|otf|eot)$/i,
  /\.(png|jpe?g|gif|webp|avif|ico|mp3|mp4|wav|ogg|pdf|zip)$/i,
  /(^|\/)(node_modules|dist|\.astro|\.wrangler|\.git)\//,
];

// ---------------------------------------------------------------- argumentos
const argv = process.argv.slice(2);
const tiene = (f) => argv.includes(f);
const valorDe = (f) => {
  const i = argv.indexOf(f);
  return i === -1 ? null : argv[i + 1];
};
const soloCartas = tiene("--cartas");
const seco = tiene("--seco");
// `--simular` recorre el pipeline COMPLETO —clasificación, anulaciones,
// informe, SARIF, validación— con veredictos inventados y cero llamadas al
// modelo. Existe porque el bug que tiró una corrida de 18 minutos y $1.34
// vivía en el camino del informe, que solo se ejecuta tras una corrida real:
// ninguna prueba podía tocarlo. Ahora cuesta un segundo.
const simular = tiene("--simular");
// `--todos` despierta a los 23 aunque su alcance no toque el diff.
//
// Por defecto solo despierta el que tiene algo que revisar, y eso es lo correcto
// para el día a día: 23 llamadas por un cambio de documentación son el ruido que
// D-032 teme. Pero al CERRAR una fase la pregunta es otra — no "¿qué toca este
// diff?" sino "¿esta fase entera aguanta a la flota entera?", y ahí un auditor
// dormido es un área sin revisar que nadie declaró.
const todos = tiene("--todos");
const preparado = tiene("--preparado");
const filtro = valorDe("--solo")?.split(",").map((s) => s.trim()).filter(Boolean) ?? null;
const refExplicita = argv.find((a) => !a.startsWith("--") && a !== valorDe("--solo")) ?? null;

// ------------------------------------------------- 1. validar las 23 cartas
// Antes de gastar una sola llamada: una carta que cite un documento inventado
// debe fallar aquí, no a mitad de una revisión. (Fue así como se detectó que la
// carta de pedagogía citaba D-036, que no existe.)
const universo = cargarUniverso();
const rotas = verificarCartas(CARTAS, universo);
if (rotas.length > 0) {
  console.error("✗ cartas con citas inexistentes — la regla 1 de D-032 falla en el origen:\n");
  for (const r of rotas) console.error(`  · \`${r.carta}\` cita \`${r.cita}\`, que no está en el repo`);
  console.error(
    `\n  Hay ${universo.decisiones.size} decisiones (hasta ${[...universo.decisiones.keys()].pop()}) ` +
      `y ${universo.investigacion.size} investigaciones.`,
  );
  process.exit(1);
}

if (soloCartas) {
  console.log(`✓ ${CARTAS.length} cartas — todas citan documentos que existen`);
  console.log(`  ${universo.lineasRojas.size} líneas rojas · ${universo.decisiones.size} decisiones · ${universo.investigacion.size} investigaciones`);
  for (const c of CARTAS) console.log(`  · ${c.id.padEnd(18)} ${c.cita.join(" ")}`);
  process.exit(0);
}

// ----------------------------------------------------------- 2. el diff base
function elegirBase() {
  if (refExplicita) return { modo: "ref", base: refExplicita };
  if (preparado) return { modo: "preparado", base: null };

  const rama = git("rev-parse", "--abbrev-ref", "HEAD").trim();
  if (rama !== "main") {
    const base = git("merge-base", "main", "HEAD").trim();
    return { modo: "rama", base, rama };
  }
  // En main no hay rama contra la que comparar. Se juzga lo que aún no está
  // commiteado; si no hay nada, el último commit.
  const sucio = git("status", "--porcelain").trim();
  if (sucio) return { modo: "trabajo", base: "HEAD" };
  return { modo: "ultimo-commit", base: "HEAD~1" };
}

const { modo, base, rama } = elegirBase();
const argsDiff = preparado ? ["diff", "--cached"] : ["diff", base];

/**
 * Diff de un archivo que git todavía no rastrea.
 *
 * `git diff HEAD` es CIEGO a los archivos nuevos sin `git add`, y un archivo
 * nuevo es lo más común que hay que revisar: una flota que no ve el archivo que
 * acabas de escribir diría "sin hallazgos" sobre nada. `--no-index` sale con
 * código 1 cuando hay diferencias —que aquí es siempre— así que la salida se
 * lee del error, no del retorno.
 */
function diffNuevo(archivo) {
  try {
    return execFileSync("git", ["diff", "--no-index", "--", "/dev/null", archivo], {
      cwd: raiz,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (err) {
    if (typeof err.stdout === "string" && err.stdout.length > 0) return err.stdout;
    return `diff --git a/${archivo} b/${archivo}\n[archivo nuevo; el diff no se pudo generar: ${err.message}]\n`;
  }
}

const rastreados = git(...argsDiff, "--name-only").split("\n").map((s) => s.trim()).filter(Boolean);

// En --preparado los archivos nuevos ya están en el índice, así que `git diff
// --cached` sí los ve. En los demás modos hay que pedirlos aparte.
const nuevos = preparado
  ? []
  : git("ls-files", "--others", "--exclude-standard").split("\n").map((s) => s.trim()).filter(Boolean);

const todosLosTocados = [...rastreados, ...nuevos];
const ignorados = todosLosTocados.filter((a) => IGNORADOS.some((re) => re.test(a)));
const archivosCambiados = todosLosTocados.filter((a) => !IGNORADOS.some((re) => re.test(a)));

if (archivosCambiados.length === 0) {
  console.log("Flota adversarial — no hay cambios que revisar.");
  console.log(`  modo: ${modo}${base ? ` · base: ${base}` : ""}`);
  process.exit(0);
}

const diffPorArchivo = new Map();
for (const archivo of archivosCambiados) {
  diffPorArchivo.set(archivo, nuevos.includes(archivo) ? diffNuevo(archivo) : git(...argsDiff, "--", archivo));
}

// ------------------------------------------- 3. qué auditores despiertan
const enAlcance = (carta) => archivosCambiados.filter((a) => carta.alcance.some((re) => re.test(a)));

let plan = todos
  ? CARTAS.map((carta) => {
      const propios = enAlcance(carta);
      // Al forzar, un auditor sin alcance propio ve el cambio completo: se le
      // pregunta por su especialidad sobre todo, no sobre nada.
      return { carta, archivos: propios.length ? propios : archivosCambiados, forzado: propios.length === 0 };
    })
  : CARTAS.map((carta) => ({ carta, archivos: enAlcance(carta) })).filter((p) => p.archivos.length > 0);

if (filtro) {
  const desconocidos = filtro.filter((f) => !POR_ID.has(f));
  if (desconocidos.length) {
    console.error(`✗ auditor(es) desconocido(s): ${desconocidos.join(", ")}`);
    console.error(`  ids válidos: ${CARTAS.map((c) => c.id).join(", ")}`);
    process.exit(1);
  }
  // --solo obliga a correr aunque el alcance no coincida: es una orden directa.
  plan = filtro.map((id) => {
    const carta = POR_ID.get(id);
    const archivos = enAlcance(carta);
    return { carta, archivos: archivos.length ? archivos : archivosCambiados, forzado: archivos.length === 0 };
  });
}

const dormidos = CARTAS.length - plan.length;

console.log("Flota adversarial — D-032, F1\n");
console.log(`  modo      ${modo}${rama ? ` (${rama})` : ""}${base ? ` · base ${base}` : ""}`);
if (todos) console.log(`  modo      TODOS los 23 forzados (cierre de fase)`);
console.log(
  `  cambio    ${archivosCambiados.length} archivo(s) revisables` +
    `${ignorados.length ? ` · ${ignorados.length} binario(s)/lockfile(s) excluidos` : ""}`,
);
console.log(`  flota     ${plan.length} despiertan · ${dormidos} sin nada que revisar en este diff`);
console.log(
  `  proveedor ${PROVEEDOR}${PROVEEDOR === "workers-ai" ? ` · cadena ${CADENA_WORKERS_AI.join(" → ")}` : ` · ${MODELO_PRINCIPAL}`}`,
);
const ctx = PRECIOS[MODELO_PRINCIPAL]?.contexto;
if (ctx) console.log(`  contexto  ${ctx.toLocaleString("es-MX")} tokens`);
console.log();

// --------------------------------------------- 4. armar el turno por auditor
const constitucion = construirConstitucion(universo);

function armarTurno({ carta, archivos, forzado }) {
  const citas = carta.cita
    .map((id) => {
      const v = verificarCita(id, universo);
      const cuerpo = id.startsWith("D-")
        ? textoDecision(id)
        : id.startsWith("mc-")
          ? resumenInvestigacion(id)
          : `${id} — ${v.titulo}`;
      return `## ${id}${v.puedeBloquear ? " (puede bloquear)" : " (no bloquea: es investigación)"}\n\n${cuerpo}`;
    })
    .join("\n\n---\n\n");

  let usados = 0;
  const incluidos = [];
  const omitidos = [];
  for (const archivo of archivos) {
    const d = diffPorArchivo.get(archivo) ?? "";
    if (usados + d.length > TOPE_DIFF && incluidos.length > 0) {
      omitidos.push(archivo);
      continue;
    }
    usados += d.length;
    incluidos.push(archivo);
  }

  const diff = incluidos.map((a) => diffPorArchivo.get(a)).join("\n");

  const aviso = omitidos.length
    ? `\n\n**No viste estos archivos** (el diff excedió el presupuesto de ${TOPE_DIFF.toLocaleString("es-MX")} caracteres): ` +
      `${omitidos.join(", ")}. Dilo en \`nota\`: no puedes afirmar que están limpios.`
    : "";

  const nota_forzado = forzado
    ? "\n\nSe te invocó con `--solo` aunque ninguno de los archivos cae en tu alcance habitual. " +
      "Revisa de todos modos, y si de verdad no hay nada de tu incumbencia, devuelve cero hallazgos.\n"
    : "";

  return `# Tu carta: \`${carta.id}\` — ${carta.titulo}

## Qué cazas

${carta.caza}

## Qué NO es asunto tuyo

${carta.ciega_a}

## Lo único que tienes autoridad para citar

${carta.cita.join(", ")}

Cualquier otro id se descarta al validar contra el repo, y el hallazgo deja de bloquear.
${nota_forzado}
---

# Los documentos que citas, íntegros

${citas}

---

# El cambio a revisar

${incluidos.length} archivo(s) de tu alcance, de ${archivosCambiados.length} que tocó el cambio completo.${aviso}

\`\`\`diff
${diff}
\`\`\`
`;
}

const trabajos = plan.map((p) => ({ ...p, turno: armarTurno(p) }));

/**
 * Estimación de costo ANTES de gastarlo.
 *
 * Es aritmética sobre caracteres, no una medición: ~3.6 caracteres por token en
 * español y código. Sirve para decidir si vale la pena, no para contabilidad.
 * El número real se mide con `count_tokens`, y la corrida imprime el uso
 * efectivo al terminar.
 */
function estimar() {
  const propios = trabajos.reduce((n, t) => n + t.turno.length, 0) / 3.6;
  const prefijo = constitucion.length / 3.6;
  // Medido en una corrida real: `pwa-ios` con 19,531 tokens de entrada gastó
  // 7,560 de salida. En kimi y gpt-oss la mayor parte es razonamiento, que se
  // cobra igual que la respuesta. Suponer 1,200 —lo que gasta un informe sin
  // razonar— subestimaba el costo a la mitad.
  const salida = trabajos.length * 7500;
  const p = PRECIOS[MODELO_PRINCIPAL];

  // El prefijo lo paga entero el primero y lo leen cacheado los demás. Si el
  // modelo no publica precio de entrada cacheada, se asume precio completo:
  // más vale sobreestimar el gasto que prometer un ahorro que no llega.
  const precioCacheada = p?.cacheada ?? p?.entrada;
  const costo = !p
    ? null
    : (propios / 1e6) * p.entrada +
      (prefijo / 1e6) * p.entrada +
      ((prefijo * (trabajos.length - 1)) / 1e6) * precioCacheada +
      (salida / 1e6) * p.salida;

  return { propios, prefijo, salida, costo };
}

const est = estimar();
const dinero = est.costo === null
  ? `costo desconocido (${MODELO_PRINCIPAL} no está en la tabla de precios de proveedores.mjs)`
  : `~$${est.costo.toFixed(2)} USD`;

// --------------------------------------------------------- 5. modo seco
if (seco) {
  console.log("Modo seco — se armó todo y no se llamó al modelo.\n");
  for (const t of trabajos) {
    console.log(`  ${t.carta.id.padEnd(18)} ${String(t.archivos.length).padStart(3)} archivo(s)  ${String(t.turno.length).padStart(7)} car.`);
  }
  console.log(`\n  constitución compartida (se cachea): ${constitucion.length.toLocaleString("es-MX")} caracteres`);
  console.log(`  turnos propios (no se cachean):      ${trabajos.reduce((n, t) => n + t.turno.length, 0).toLocaleString("es-MX")} caracteres`);
  console.log(`\n  ~${Math.round(est.propios).toLocaleString("es-MX")} tokens de entrada propios · ~${Math.round(est.prefijo).toLocaleString("es-MX")} de prefijo cacheado · ${dinero}`);
  console.log(`\n  Entrada: aritmética sobre caracteres (~3.6 por token). Salida: 7,500/auditor,`);
  console.log(`  medido en una corrida real — en estos modelos casi todo es razonamiento.`);
  console.log(`  La corrida de verdad imprime el uso efectivo que reporta el proveedor.`);
  process.exit(0);
}

// --------------------------------------------------------- 6. correr la flota
if (!process.env.CLOUDFLARE_API_TOKEN && existsSync(`${raiz}.env`)) {
  process.loadEnvFile(`${raiz}.env`);
}

// Verificación previa. Sin esto, una credencial ausente daría 23 auditores "que
// no encontraron nada", indistinguible de una flota que corrió limpia.
try {
  if (!simular) await verificarCredenciales();
} catch (err) {
  console.error(`\n✗ no se pudo autenticar contra Workers AI: ${err.message}\n`);
  console.error(`  Guarda las credenciales sin que toquen git ni el historial:  ./scripts/set-keys.sh`);
  console.error(`  Pide CLOUDFLARE_ACCOUNT_ID y CLOUDFLARE_API_TOKEN (permiso \`Workers AI: Read\`).`);
  console.error(`  El token se crea en: dash.cloudflare.com → Manage Account → API Tokens`);
  console.error(`\n  Para ver qué se habría mandado, sin gastar nada:  node audits/adversarial.mjs --seco`);
  process.exit(1);
}

// Un identificador estable por corrida: manda los 23 a la misma instancia para
// que la caché de prefijo de la constitución acierte. Cambiarlo entre auditores
// haría que cada uno pagara el prefijo entero.
const sesion = `mc-audit-${process.pid}-${archivosCambiados.length}`;

/** Veredicto inventado para `--simular`: uno bloqueante, uno que solo reporta. */
function veredictoFalso(carta) {
  const conDecision = carta.cita.find((c) => !c.startsWith("mc-"));
  const conInvestigacion = carta.cita.find((c) => c.startsWith("mc-"));
  const base = { archivo: "SIMULADO.md", linea: 1, evidencia: "simulado", arreglo: "simulado" };
  return {
    hallazgos: [
      conDecision && { ...base, gravedad: "bloqueante", resumen: `simulado bloqueante de ${carta.id}`, cita_tipo: "decision", cita_id: conDecision },
      conInvestigacion && { ...base, gravedad: "menor", resumen: `simulado menor de ${carta.id}`, cita_tipo: "investigacion", cita_id: conInvestigacion },
    ].filter(Boolean),
    nota: "veredicto simulado, sin llamada al modelo",
    uso: { entrada: 1000, salida: 500, cacheada: 100 },
    modelo: MODELO_PRINCIPAL,
    reintentos: 0,
  };
}

async function correr(trabajo) {
  try {
    const v = simular
      ? veredictoFalso(trabajo.carta)
      : await auditar({ constitucion, turnoUsuario: trabajo.turno, sesion });
    return { ...trabajo, ...v };
  } catch (err) {
    return { ...trabajo, error: err, hallazgos: [], nota: "" };
  }
}

console.log(
  simular
    ? `  MODO SIMULADO — ${trabajos.length} auditor(es), veredictos falsos, sin llamadas\n`
    : `  ${trabajos.length} llamada(s) · estimado ${dinero}\n`,
);

// La primera va sola. Una entrada de caché solo se puede leer después de que la
// primera respuesta empieza a llegar; disparar las 23 a la vez haría que las 23
// pagaran precio completo por la constitución.
const describirResultado = (r, ms) => {
  const t = `${(ms / 1000).toFixed(1)}s`;
  if (r.error) return `error tras ${t}: ${r.error.message}`;
  const reint = r.reintentos ? `, ${r.reintentos} reintento(s)` : "";
  const modelo = r.modelo === CADENA_WORKERS_AI[0] ? "" : ` [${r.modelo}]`;
  return `${r.hallazgos.length} hallazgo(s) en ${t}${reint}${modelo}`;
};

// Estos modelos razonan antes de responder y tardan segundos o minutos. Sin
// tiempo en pantalla, "pensando" y "colgado" se ven idénticos — que fue
// exactamente cómo la primera corrida real pareció trabarse.
process.stdout.write(`  ${trabajos[0].carta.id}… `);
const t0 = Date.now();
const resultados = [await correr(trabajos[0])];
console.log(describirResultado(resultados[0], Date.now() - t0));

const cola = trabajos.slice(1);
for (let i = 0; i < cola.length; i += CONCURRENCIA) {
  const lote = cola.slice(i, i + CONCURRENCIA);
  const tLote = Date.now();
  const hechos = await Promise.all(lote.map(correr));
  const msLote = Date.now() - tLote;
  for (const r of hechos) console.log(`  ${r.carta.id.padEnd(18)} ${describirResultado(r, msLote)}`);
  resultados.push(...hechos);
}

// ------------------------------------- 7. las dos reglas, aplicadas al final
const anulaciones = leerAnulaciones();
const hoy = new Date().toISOString().slice(0, 10);

const bloqueantes = [];
const reportados = [];
const invalidos = [];
const anulados = [];

for (const r of resultados) {
  const c = clasificar(r.hallazgos, r.carta, universo, anulaciones, r.turno, r.archivos);
  bloqueantes.push(...c.bloqueantes);
  reportados.push(...c.reportados);
  invalidos.push(...c.invalidos);
  anulados.push(...c.anulados);
}

const conError = resultados.filter((r) => r.error);
const declinados = resultados.filter((r) => r.declinado);

// ------------------------------------------------------------- 8. el informe
const imprimir = (h) => {
  const marca = h.evidenciaNoVerificable
    ? "  ⚠ EVIDENCIA NO VERIFICABLE"
    : h.archivoNoMostrado
      ? "  ⚠ ARCHIVO NO MOSTRADO"
      : "";
  console.log(`\n  ${h.auditor} · ${h.archivo}${h.linea ? `:${h.linea}` : ""}  [${h.cita_id}]${marca}`);
  if (h.evidenciaNoVerificable) {
    console.log(`    degradado: citó ${h.citasFaltantes.map((c) => `"${c.slice(0, 48)}"`).join(", ")}`);
    console.log(`    y eso no aparece en nada de lo que se le mostró. No bloquea.`);
  }
  if (h.archivoNoMostrado) {
    console.log(`    degradado: este auditor nunca vio ese archivo. No bloquea.`);
  }
  console.log(`    ${h.resumen}`);
  console.log(`    evidencia: ${h.evidencia}`);
  console.log(`    arreglo:   ${h.arreglo}`);
};

console.log("\n" + "─".repeat(72));

if (bloqueantes.length) {
  console.log(`\n✗ ${bloqueantes.length} hallazgo(s) BLOQUEANTE(S)`);
  bloqueantes.forEach(imprimir);
  console.log(`\n  Para anular alguno, D-032 exige escribir por qué. Pega esto en`);
  console.log(`  audits/adversarial/ANULACIONES.md y commitéalo en este mismo PR:\n`);
  console.log(plantilla(bloqueantes[0], hoy).split("\n").map((l) => `      ${l}`).join("\n"));
}

if (reportados.length) {
  console.log(`\n· ${reportados.length} hallazgo(s) que reportan sin detener`);
  reportados.forEach(imprimir);
}

if (anulados.length) {
  console.log(`\n· ${anulados.length} bloqueante(s) anulado(s) por escrito`);
  for (const h of anulados) {
    console.log(`\n  ${h.auditor} · ${h.archivo} [${h.cita_id}]`);
    console.log(`    ${h.resumen}`);
    console.log(`    anulado ${h.anulacion.fecha} por ${h.anulacion.quien}: ${h.anulacion.razon.split("\n")[0]}`);
  }
}

if (invalidos.length) {
  console.log(`\n· ${invalidos.length} hallazgo(s) descartado(s) por la regla 1 (opinión sin cita válida)`);
  for (const h of invalidos) console.log(`    ${h.auditor}: ${h.resumen} — ${h.motivo}`);
}

for (const r of declinados) console.log(`\n· ${r.carta.id}: ${r.nota}`);
for (const r of conError) console.log(`\n✗ ${r.carta.id} no pudo correr: ${r.error.message}`);

const uso = resultados.reduce(
  (a, r) => ({
    entrada: a.entrada + (r.uso?.entrada ?? 0),
    cacheada: a.cacheada + (r.uso?.cacheada ?? 0),
    salida: a.salida + (r.uso?.salida ?? 0),
    reintentos: a.reintentos + (r.reintentos ?? 0),
  }),
  { entrada: 0, cacheada: 0, salida: 0, reintentos: 0 },
);

// El informe se escribe SIEMPRE, incluso sin hallazgos: una corrida limpia que
// no deja rastro no se puede citar en un PR, y CLAUDE.md pide que toda
// afirmación factual se pueda re-ejecutar.
// El costo se calcula ANTES del informe porque el informe lo lleva dentro.
// Estaba después, y `costo: real` reventaba con "Cannot access 'real' before
// initialization" — al final de una corrida de 18 minutos y $1.34, que se
// perdió entera. El error no apareció en ninguna prueba porque el informe solo
// se escribe tras una corrida real, y las pruebas usan datos a mano.
const p = PRECIOS[MODELO_PRINCIPAL];
const real = p
  ? ((uso.entrada - uso.cacheada) / 1e6) * p.entrada +
    (uso.cacheada / 1e6) * (p.cacheada ?? p.entrada) +
    (uso.salida / 1e6) * p.salida
  : null;

const { diff, rutaMd, rutaSarif, erroresSarif } = escribirInforme({
  bloqueantes,
  reportados,
  anulados,
  invalidos,
  fallidos: conError.map((r) => ({ auditor: r.carta.id, error: r.error.message })),
  meta: {
    fecha: new Date().toISOString().slice(0, 19).replace("T", " "),
    modo,
    base,
    auditores: resultados.length,
    archivos: archivosCambiados.length,
    modelo: MODELO_PRINCIPAL,
    tokensEntrada: uso.entrada,
    tokensSalida: uso.salida,
    costo: real ?? 0,
  },
  universo,
  cartas: POR_ID,
  simulado: simular,
});

console.log(`\n${"─".repeat(72)}`);
console.log(`  ${resultados.length} auditor(es) · ${bloqueantes.length} bloquean · ${reportados.length} reportan · ${invalidos.length} descartados`);
if (!diff.primera) {
  console.log(`  contra la corrida anterior: ${diff.nuevos.length} nuevo(s) · ${diff.resueltos.length} resuelto(s) · ${diff.persistentes.length} abierto(s)`);
}
console.log(`  plan de remediación: ${rutaMd.replace(raiz, "")}`);
console.log(
  `  SARIF 2.1.0 (OASIS): ${rutaSarif.replace(raiz, "")}` +
    `${erroresSarif.length === 0 ? " · válido contra el esquema oficial" : ""}`,
);
if (erroresSarif.length) {
  console.error(`  ⚠ el SARIF NO cumple el esquema oficial:`);
  for (const e of erroresSarif.slice(0, 5)) console.error(`    · ${e}`);
}
console.log(
  `  tokens: ${uso.entrada.toLocaleString("es-MX")} entrada (${uso.cacheada.toLocaleString("es-MX")} de caché) · ` +
    `${uso.salida.toLocaleString("es-MX")} salida${real === null ? "" : ` · ~$${real.toFixed(3)} USD`}`,
);
if (uso.cacheada === 0 && resultados.length > 1) {
  console.log(`  ⚠ cero tokens de caché con ${resultados.length} llamadas: algo varía el prefijo, o el modelo no cachea.`);
}
if (uso.reintentos > 0) {
  console.log(
    `  ⚠ ${uso.reintentos} reintento(s) por veredicto mal formado. El JSON de Workers AI es best-effort;`,
  );
  console.log(`    si esto sube, el esquema le está quedando grande al modelo.`);
}

// En `--simular` los hallazgos son entrada, no resultado: se inventaron para
// ejercitar la clasificación. Lo que se está comprobando es que el PIPELINE
// funcione —que clasifique, escriba el informe y produzca SARIF válido—, así
// que solo falla si algo se rompió de verdad.
if (simular) {
  const roto = erroresSarif.length > 0 || conError.length > 0;
  console.log(roto ? "\n✗ el camino del informe está roto" : "\n✓ pipeline completo: clasificación, informe y SARIF válido");
  process.exit(roto ? 1 : 0);
}

// Un auditor que no pudo correr no es un auditor que aprobó.
if (bloqueantes.length > 0 || conError.length > 0) process.exit(1);
console.log(`\n✓ la flota adversarial no encontró nada que detenga este cambio`);
