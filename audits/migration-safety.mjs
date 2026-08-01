#!/usr/bin/env node
// Auditor determinista 09 — migraciones sin borrado destructivo
//
// Hace cumplir: mc-32 (riesgos #1, #7 y #12), mc-25, D-013, y la regla de
// CLAUDE.md § Cloudflare — "quien crea un recurso escribe su renglón en la
// bitácora de infrastructure.md en el mismo PR".
//
// Por qué existe. Una migración es el único código de este repo que corre UNA
// vez, contra datos que no se pueden regenerar, y que después nadie vuelve a
// leer. Un `DROP COLUMN` que en local no borra nada —porque la base local está
// vacía— en producción borra el consentimiento firmado de miles de padres, y
// `consent_records` es precisamente la fila que prueba el cumplimiento de COPPA
// y de la LGPD (mc-25, D-013). mc-32 riesgo #7 ya advierte que borrar a un menor
// toca cuatro sistemas; una migración destructiva vuelve ese borrado
// irreversible en el primero de los cuatro, y sin registro de que ocurrió.
//
// El matiz de SQLite que este auditor tiene que entender para no ser inútil:
// SQLite no sabe cambiar el tipo de una columna, ni quitarle una restricción, ni
// reordenarla. La única forma es el procedimiento de 12 pasos de la
// documentación oficial: crear la tabla nueva, copiar las filas, BORRAR la
// vieja, renombrar la nueva. Ese `DROP TABLE` es legítimo y aparece en toda
// migración seria. Un auditor que solo busque la palabra DROP grita en cada una
// de ellas, y a las tres semanas se anula por costumbre — que es exactamente el
// ruido que D-032 quiere evitar. Así que aquí el DROP se juzga por su contexto:
// se exige la firma completa (copia hacia afuera + renombre hacia adentro) antes
// de considerarlo una reconstrucción.
//
// Cuando un borrado SÍ es lo que se quiere, se declara en el archivo:
//
//     -- migration-safety: <razón de al menos 20 caracteres>
//     DROP TABLE tabla_muerta;
//
// Mismo espíritu que `adversarial/ANULACIONES.md`: anular exige escribir por
// qué, y queda en el historial. Con dos excepciones que NO se pueden anular con
// un comentario —`consent_records` y `child_profiles`—, porque ahí el borrado
// tiene camino propio (el runbook de erasure de mc-32 riesgo #7) y ese camino no
// es una migración.
//
// Lo que este auditor NO puede comprobar, dicho antes de que alguien lo suponga:
//   · si la migración YA se aplicó al D1 remoto. El repo no guarda ese estado;
//     lo guarda la tabla interna de d1_migrations y el renglón a mano de
//     docs/infrastructure.md. Aquí se usa "está commiteada" como equivalente
//     conservador de "puede estar en producción".
//   · si un CHECK nuevo lo violan las filas que ya existen. Eso solo se sabe
//     corriendo la migración contra datos reales.
//   · si la lista de columnas del INSERT ... SELECT de una reconstrucción está
//     desalineada. Se compara la forma de las tablas, no el orden del SELECT.
//   · lo que hay dentro del BEGIN ... END de un trigger. El cuerpo se trata como
//     una sola sentencia opaca a propósito, porque un DELETE ahí adentro no
//     borra nada al migrar: define lo que pasará después, en tiempo de ejecución,
//     y eso es materia de otro auditor.
//   · nada de lo que se ejecute fuera de migrations/ — un `wrangler d1 execute`
//     a mano no deja rastro en este repo, y por eso es el modo de falla que
//     ningún auditor de archivos puede cerrar.

import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const raiz = new URL("..", import.meta.url).pathname;
const DIR = "migrations";
const INFRA = "docs/infrastructure.md";

// Tablas cuyo borrado no se puede anular con un comentario. No es que sean más
// importantes: es que su borrado tiene otro camino documentado y auditable.
const INTOCABLES = new Set(["consent_records", "child_profiles"]);

// Palabras que ya no son parte del tipo declarado de una columna.
const FIN_DE_TIPO = new Set([
  "NOT", "NULL", "PRIMARY", "UNIQUE", "CHECK", "DEFAULT", "REFERENCES",
  "COLLATE", "GENERATED", "AS", "CONSTRAINT", "AUTOINCREMENT", "ASC", "DESC", "ON",
]);

const problemas = [];
const anulaciones = [];

// ---------------------------------------------------------------------------
// Utilidades de identificadores y de tipos
// ---------------------------------------------------------------------------

// SQLite no distingue mayúsculas en los nombres, y admite comillas dobles,
// backticks, corchetes y prefijo de esquema. Todo eso se normaliza o el mismo
// nombre escrito de dos formas parecería dos tablas distintas.
const limpiar = (nombre) =>
  String(nombre)
    .trim()
    .replace(/[;,()]+$/, "")
    .split(".")
    .pop()
    .replace(/^["`[]|["`\]]$/g, "")
    .toLowerCase();

// Afinidad de tipo según las reglas de la documentación de SQLite, en su orden.
const afinidad = (tipo) => {
  const t = (tipo || "").toUpperCase();
  if (t.includes("INT")) return "INTEGER";
  if (/CHAR|CLOB|TEXT/.test(t)) return "TEXT";
  if (t.includes("BLOB") || t === "") return "BLOB";
  if (/REAL|FLOA|DOUB/.test(t)) return "REAL";
  return "NUMERIC";
};

// Cuánto cabe en cada afinidad. Sirve para responder una sola pregunta: ¿lo que
// había cabe en lo que va a haber? SQLite es laxo y no trunca al copiar —guarda
// lo que le den, sin importar la afinidad declarada—, así que esto no detecta
// pérdida física de bytes: detecta que la migración DECLARA una intención más
// estrecha que la anterior, y es la aplicación la que después rompe.
const ANCHO = { BLOB: 4, TEXT: 3, NUMERIC: 2, REAL: 2, INTEGER: 1 };

// ---------------------------------------------------------------------------
// Partidor de SQL
// ---------------------------------------------------------------------------
// No es un parser de SQL y no pretende serlo. Es lo mínimo para no confundirse:
// respeta cadenas, identificadores entrecomillados y comentarios, y no corta en
// el `;` que va dentro del BEGIN ... END de un trigger. Un `.split(";")` a secas
// parte los triggers a la mitad y hace que el auditor lea sentencias que nadie
// escribió.
function sentencias(texto) {
  const salida = [];
  let buf = "";
  let comentarios = [];
  let linea = 1;
  let inicio = 1;
  let i = 0;

  const avanzar = (n) => {
    for (let k = 0; k < n; k++) if (texto[i + k] === "\n") linea++;
    i += n;
  };
  const dentroDeTrigger = () =>
    /\bCREATE\s+(?:TEMP(?:ORARY)?\s+)?TRIGGER\b/i.test(buf) && !/\bEND\s*$/i.test(buf.trim());

  while (i < texto.length) {
    const c = texto[i];
    const d = texto[i + 1];

    if (c === "-" && d === "-") {
      let fin = texto.indexOf("\n", i);
      if (fin === -1) fin = texto.length;
      comentarios.push(texto.slice(i, fin));
      avanzar(fin - i);
      continue;
    }
    if (c === "/" && d === "*") {
      let fin = texto.indexOf("*/", i + 2);
      fin = fin === -1 ? texto.length : fin + 2;
      comentarios.push(texto.slice(i, fin));
      avanzar(fin - i);
      continue;
    }
    if (c === "'" || c === '"' || c === "`") {
      let j = i + 1;
      while (j < texto.length) {
        if (texto[j] === c) {
          if (texto[j + 1] === c) j += 2;
          else break;
        } else j++;
      }
      const trozo = texto.slice(i, Math.min(j + 1, texto.length));
      if (buf.trim() === "") inicio = linea;
      buf += trozo;
      avanzar(trozo.length);
      continue;
    }
    if (c === ";" && !dentroDeTrigger()) {
      if (buf.trim() !== "") salida.push(hacerSentencia(buf, inicio, comentarios));
      buf = "";
      comentarios = [];
      avanzar(1);
      continue;
    }
    if (buf.trim() === "" && !/\s/.test(c)) inicio = linea;
    buf += c;
    avanzar(1);
  }
  // Última sentencia sin `;` final. Se acepta y se analiza igual: si alguien
  // olvidó el punto y coma, el problema es de D1, no nuestro.
  if (buf.trim() !== "") salida.push(hacerSentencia(buf, inicio, comentarios));
  return salida;
}

function hacerSentencia(sql, linea, comentarios) {
  return {
    sql,
    linea,
    // Los comentarios que van desde el final de la sentencia anterior hasta el
    // final de ésta. La anulación se busca aquí, así que vale tanto arriba de la
    // sentencia como en la misma línea.
    comentarios: comentarios.slice(),
    norm: sql.replace(/\s+/g, " ").trim(),
  };
}

// La razón mínima son 20 caracteres, igual que en ANULACIONES.md: si valiera una
// vacía, la regla se cumpliría escribiendo el encabezado.
const anulada = (st) =>
  st.comentarios.some((c) => /migration-safety\s*:\s*\S.{19,}/i.test(c));

const razonAnulacion = (st) => {
  for (const c of st.comentarios) {
    const m = c.match(/migration-safety\s*:\s*(.+)$/i);
    if (m && m[1].trim().length >= 20) return m[1].trim();
  }
  return "";
};

// ---------------------------------------------------------------------------
// Clasificador de sentencias
// ---------------------------------------------------------------------------

// Recorta el cuerpo entre paréntesis balanceados de un CREATE TABLE.
function cuerpoDeTabla(sql) {
  const abre = sql.indexOf("(");
  if (abre === -1) return "";
  let prof = 0;
  for (let i = abre; i < sql.length; i++) {
    const c = sql[i];
    if (c === "'" || c === '"' || c === "`") {
      let j = i + 1;
      while (j < sql.length && sql[j] !== c) j++;
      i = j;
      continue;
    }
    if (c === "(") prof++;
    else if (c === ")") {
      prof--;
      if (prof === 0) return sql.slice(abre + 1, i);
    }
  }
  return sql.slice(abre + 1);
}

// Parte por comas de primer nivel, respetando paréntesis y cadenas.
function partesDeNivel(cuerpo) {
  const partes = [];
  let buf = "";
  let prof = 0;
  for (let i = 0; i < cuerpo.length; i++) {
    const c = cuerpo[i];
    if (c === "'" || c === '"' || c === "`") {
      let j = i + 1;
      while (j < cuerpo.length && cuerpo[j] !== c) j++;
      buf += cuerpo.slice(i, j + 1);
      i = j;
      continue;
    }
    if (c === "(") prof++;
    if (c === ")") prof--;
    if (c === "," && prof === 0) {
      partes.push(buf);
      buf = "";
      continue;
    }
    buf += c;
  }
  if (buf.trim()) partes.push(buf);
  return partes;
}

// De un CREATE TABLE saca columnas (nombre, tipo, nulabilidad, default) y las
// referencias declaradas, tanto en línea como en cláusulas FOREIGN KEY.
function definicionDeTabla(sql) {
  const columnas = new Map();
  const refs = [];
  for (const parte of partesDeNivel(cuerpoDeTabla(sql))) {
    const t = parte.trim();
    if (!t) continue;
    const ref = t.match(/REFERENCES\s+([^\s(,]+)\s*(?:\(\s*([^)]*)\))?/i);
    if (/^(PRIMARY|UNIQUE|CHECK|FOREIGN|CONSTRAINT)\b/i.test(t)) {
      if (ref) refs.push({ tabla: limpiar(ref[1]), columna: ref[2] ? limpiar(ref[2].split(",")[0]) : null });
      continue;
    }
    const m = t.match(/^([^\s(]+)\s*([\s\S]*)$/);
    if (!m) continue;
    const nombre = limpiar(m[1]);
    const resto = m[2] || "";
    const tipo = [];
    for (const tk of resto.split(/\s+/)) {
      const w = tk.replace(/\(.*/, "").toUpperCase();
      if (!w || FIN_DE_TIPO.has(w)) break;
      tipo.push(w);
    }
    columnas.set(nombre, {
      tipo: tipo.join(" "),
      notNull: /\bNOT\s+NULL\b/i.test(resto),
      tieneDefault: /\bDEFAULT\b/i.test(resto),
    });
    if (ref) refs.push({ tabla: limpiar(ref[1]), columna: ref[2] ? limpiar(ref[2].split(",")[0]) : null });
  }
  return { columnas, refs };
}

function clasificar(st) {
  const s = st.norm;
  let m;

  if ((m = s.match(/^CREATE\s+(TEMP(?:ORARY)?\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([^\s(]+)/i))) {
    return { tipo: "crear_tabla", tabla: limpiar(m[2]), temporal: !!m[1], ...definicionDeTabla(s) };
  }
  if ((m = s.match(/^CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?([^\s(]+)\s+ON\s+([^\s(]+)/i))) {
    return { tipo: "crear_indice", indice: limpiar(m[1]), tabla: limpiar(m[2]) };
  }
  if ((m = s.match(/^DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?([^\s;]+)/i))) {
    return { tipo: "borrar_tabla", tabla: limpiar(m[1]) };
  }
  if ((m = s.match(/^DROP\s+INDEX\s+(?:IF\s+EXISTS\s+)?([^\s;]+)/i))) {
    return { tipo: "borrar_indice", indice: limpiar(m[1]) };
  }
  if ((m = s.match(/^ALTER\s+TABLE\s+([^\s]+)\s+([\s\S]+)$/i))) {
    const tabla = limpiar(m[1]);
    const resto = m[2];
    let a;
    if ((a = resto.match(/^RENAME\s+TO\s+([^\s;]+)/i))) {
      return { tipo: "renombrar_tabla", tabla, nueva: limpiar(a[1]) };
    }
    if ((a = resto.match(/^RENAME\s+(?:COLUMN\s+)?([^\s]+)\s+TO\s+([^\s;]+)/i))) {
      return { tipo: "renombrar_columna", tabla, columna: limpiar(a[1]), nueva: limpiar(a[2]) };
    }
    if ((a = resto.match(/^ADD\s+(?:COLUMN\s+)?([\s\S]+)$/i))) {
      const def = a[1].trim();
      const nombre = limpiar(def.split(/\s+/)[0]);
      const tipoTok = [];
      for (const tk of def.split(/\s+/).slice(1)) {
        const w = tk.replace(/\(.*/, "").toUpperCase();
        if (!w || FIN_DE_TIPO.has(w)) break;
        tipoTok.push(w);
      }
      return {
        tipo: "agregar_columna",
        tabla,
        columna: nombre,
        def: {
          tipo: tipoTok.join(" "),
          notNull: /\bNOT\s+NULL\b/i.test(def),
          tieneDefault: /\bDEFAULT\b/i.test(def),
        },
      };
    }
    if ((a = resto.match(/^DROP\s+(?:COLUMN\s+)?([^\s;]+)/i))) {
      return { tipo: "borrar_columna", tabla, columna: limpiar(a[1]) };
    }
    if (/^(ALTER|MODIFY|CHANGE)\b/i.test(resto)) {
      return { tipo: "cambiar_tipo", tabla };
    }
    return { tipo: "alter_otro", tabla };
  }
  if ((m = s.match(/^INSERT\s+(?:OR\s+\w+\s+)?INTO\s+([^\s(]+)/i))) {
    const origen = s.match(/\bFROM\s+([^\s;(,]+)/i);
    return { tipo: "insertar", destino: limpiar(m[1]), origen: origen ? limpiar(origen[1]) : null };
  }
  if ((m = s.match(/^DELETE\s+FROM\s+([^\s;]+)/i))) {
    return { tipo: "borrar_filas", tabla: limpiar(m[1]), conWhere: /\bWHERE\b/i.test(s) };
  }
  if ((m = s.match(/^UPDATE\s+(?:OR\s+\w+\s+)?([^\s]+)\s+SET\s+([\s\S]+)$/i))) {
    const set = m[2].split(/\bWHERE\b/i)[0];
    const columnas = partesDeNivel(set)
      .map((p) => limpiar(p.split("=")[0]))
      .filter(Boolean);
    return { tipo: "actualizar", tabla: limpiar(m[1]), conWhere: /\bWHERE\b/i.test(s), columnas };
  }
  if (/^TRUNCATE\b/i.test(s)) {
    const t = s.match(/^TRUNCATE\s+(?:TABLE\s+)?([^\s;]+)/i);
    return { tipo: "truncar", tabla: t ? limpiar(t[1]) : "?" };
  }
  if (/^PRAGMA\b/i.test(s)) return { tipo: "pragma", texto: s };
  return { tipo: "otro" };
}

// ---------------------------------------------------------------------------
// Reconstrucción de 12 pasos: la firma completa, no la palabra suelta
// ---------------------------------------------------------------------------
// Para que un DROP TABLE cuente como reconstrucción legítima tienen que estar
// las tres piezas, en orden, en el MISMO archivo:
//   1. se creó una tabla nueva antes,
//   2. se copiaron las filas de la vieja a la nueva antes del DROP,
//   3. la nueva se renombró con el nombre de la vieja después del DROP.
// Faltando cualquiera de las tres, lo que hay es un borrado con buena prensa.
function reconstrucciones(clases) {
  const mapa = new Map();
  for (let k = 0; k < clases.length; k++) {
    const c = clases[k];
    if (c.tipo !== "borrar_tabla") continue;

    const copia = clases.findIndex(
      (x, j) => j < k && x.tipo === "insertar" && x.origen === c.tabla && x.destino !== c.tabla,
    );
    if (copia === -1) continue;
    const nueva = clases[copia].destino;

    const creada = clases.some((x, j) => j < copia && x.tipo === "crear_tabla" && x.tabla === nueva);
    if (!creada) continue;

    const renombre = clases.findIndex(
      (x, j) => j > k && x.tipo === "renombrar_tabla" && x.tabla === nueva && x.nueva === c.tabla,
    );
    if (renombre === -1) continue;

    mapa.set(k, { tabla: c.tabla, nueva, copia, renombre });
  }
  return mapa;
}

// ---------------------------------------------------------------------------
// 1. Inventario de archivos — falla cerrado
// ---------------------------------------------------------------------------
// `--cached --others --exclude-standard` y no `git ls-files` a secas: con la
// forma corta el auditor es ciego a la migración recién escrita, es decir ciego
// exactamente en el momento en que sirve. Fue un bug real de audits/secrets.mjs.

let archivos;
try {
  archivos = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "--", DIR],
    { cwd: raiz, encoding: "utf8" },
  )
    .split("\n")
    .map((s) => s.trim())
    .filter((f) => f.endsWith(".sql"))
    .sort();
} catch {
  console.error("✗ migration-safety — no es un repositorio git.");
  console.error("  Sin git no se puede saber qué migración ya se aplicó, y esa es");
  console.error("  media razón de ser de este auditor. Falla cerrado.");
  process.exit(1);
}

if (archivos.length === 0) {
  console.error("✗ migration-safety — 0 migraciones que revisar.");
  console.error("  Un escáner que no ve nada pasa siempre. Revisa que migrations/");
  console.error("  exista y que los .sql no estén ignorados por .gitignore.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 2. Numeración: sin huecos, sin duplicados, empezando en 0001
// ---------------------------------------------------------------------------
// D1 aplica las migraciones en orden lexicográfico de nombre. Un hueco no rompe
// nada por sí solo, pero casi siempre significa una migración borrada del repo
// que YA corrió en algún ambiente — y entonces local y remoto dejan de ser el
// mismo esquema sin que nadie lo note. Un duplicado es peor: dos archivos
// distintos compitiendo por el mismo renglón de d1_migrations.

const numerados = [];
for (const archivo of archivos) {
  const base = archivo.split("/").pop();
  const m = base.match(/^(\d{4})_([a-z0-9_]+)\.sql$/);
  if (!m) {
    problemas.push(`${archivo}: el nombre no es NNNN_descripcion.sql (cuatro dígitos, minúsculas y guiones bajos)`);
    continue;
  }
  numerados.push({ archivo, num: Number(m[1]), etiqueta: m[1] });
}

const vistos = new Map();
for (const { archivo, num, etiqueta } of numerados) {
  if (vistos.has(num)) problemas.push(`${archivo}: número ${etiqueta} duplicado, ya lo usa ${vistos.get(num)}`);
  else vistos.set(num, archivo);
}
const ordenados = [...vistos.keys()].sort((a, b) => a - b);
if (ordenados.length > 0 && ordenados[0] !== 1) {
  problemas.push(`la numeración empieza en ${String(ordenados[0]).padStart(4, "0")} y no en 0001`);
}
for (let i = 1; i < ordenados.length; i++) {
  if (ordenados[i] !== ordenados[i - 1] + 1) {
    problemas.push(
      `hueco en la numeración: de ${String(ordenados[i - 1]).padStart(4, "0")} salta a ${String(ordenados[i]).padStart(4, "0")}. ` +
        `Un hueco casi siempre es una migración que ya corrió en algún ambiente y se borró del repo`,
    );
  }
}

// ---------------------------------------------------------------------------
// 3. Lectura y análisis, migración por migración, en orden
// ---------------------------------------------------------------------------

const vivas = new Map(); // nombre -> { columnas, refs, archivo }
let totalSentencias = 0;
let reconstruccionesVistas = 0;

for (const { archivo } of numerados.sort((a, b) => a.num - b.num)) {
  // Rastreada por git pero ausente del disco: alguien borró una migración. Si ya
  // estaba commiteada, ya pudo haber corrido en algún ambiente, y borrarla del
  // repo no la deshace — solo hace que local y remoto dejen de ser el mismo
  // esquema, en silencio.
  if (!existsSync(join(raiz, archivo))) {
    problemas.push(
      `${archivo}: git la tiene rastreada pero no está en el disco. Una migración que ya se commiteó no se borra: ` +
        `lo que ya corrió en un ambiente sigue ahí, y el repo deja de describir el esquema real`,
    );
    continue;
  }
  const texto = readFileSync(join(raiz, archivo), "utf8");
  const lista = sentencias(texto);
  const clases = lista.map(clasificar);
  totalSentencias += lista.length;

  const recon = reconstrucciones(clases);
  const cierresDeRecon = new Set([...recon.values()].map((r) => r.renombre));
  const creadasAqui = new Set();

  // "Recién creada" solo vale dentro del archivo que la creó. Sin este borrado,
  // una columna añadida en la 0003 seguiría contando como nueva en la 0009, y el
  // UPDATE sin WHERE que allí la rellene ya estaría pisando datos de verdad.
  for (const [, tabla] of vivas) tabla.nuevasEnEsteArchivo = new Set();

  for (let k = 0; k < lista.length; k++) {
    const st = lista[k];
    const c = clases[k];
    const donde = `${archivo}:${st.linea}`;

    // Una anulación escrita vale para todo menos para las tablas intocables.
    const tablaTocada = c.tabla || c.destino || null;
    const intocable = tablaTocada && INTOCABLES.has(tablaTocada);
    const perdonada = anulada(st) && !intocable;
    const registrar = (mensaje) => {
      if (perdonada) anulaciones.push(`${donde} — ${mensaje} · anulado: "${razonAnulacion(st)}"`);
      else problemas.push(`${donde} — ${mensaje}${intocable && anulada(st) ? " · la anulación por comentario NO aplica aquí" : ""}`);
    };

    switch (c.tipo) {
      case "crear_tabla": {
        if (vivas.has(c.tabla)) {
          problemas.push(`${donde} — CREATE TABLE ${c.tabla}, pero esa tabla ya existe desde ${vivas.get(c.tabla).archivo}`);
        }
        vivas.set(c.tabla, { columnas: c.columnas, refs: c.refs, archivo });
        creadasAqui.add(c.tabla);
        break;
      }

      case "borrar_tabla": {
        const r = recon.get(k);
        if (r) {
          // Reconstrucción legítima. Lo que sí se revisa es si la tabla nueva
          // perdió columnas o las estrechó: ahí es donde se pierden datos sin
          // que aparezca la palabra DROP en ninguna parte.
          reconstruccionesVistas++;
          const antes = vivas.get(c.tabla);
          const despues = vivas.get(r.nueva);
          if (antes && despues) {
            for (const [nombre, viejo] of antes.columnas) {
              const nuevo = despues.columnas.get(nombre);
              if (!nuevo) {
                registrar(
                  `la reconstrucción de ${c.tabla} deja fuera la columna "${nombre}": es un DROP COLUMN escrito de otra forma`,
                );
                continue;
              }
              const av = afinidad(viejo.tipo);
              const an = afinidad(nuevo.tipo);
              if (ANCHO[an] < ANCHO[av]) {
                registrar(
                  `${c.tabla}.${nombre} pasa de ${viejo.tipo || "(sin tipo)"} a ${nuevo.tipo || "(sin tipo)"} (${av} → ${an}): el tipo nuevo declara menos de lo que había`,
                );
              }
              if (nuevo.notNull && !viejo.notNull && !nuevo.tieneDefault) {
                registrar(
                  `${c.tabla}.${nombre} se vuelve NOT NULL sin DEFAULT y antes admitía NULL: la copia aborta con la primera fila nula`,
                );
              }
            }
          }
          break;
        }
        if (creadasAqui.has(c.tabla)) break; // tabla de trabajo creada y borrada aquí mismo
        registrar(
          `DROP TABLE ${c.tabla} sin la firma de reconstrucción (crear nueva → copiar filas → borrar vieja → renombrar). ` +
            `Tal como está, las filas se pierden`,
        );
        vivas.delete(c.tabla);
        break;
      }

      case "borrar_columna": {
        registrar(`ALTER TABLE ${c.tabla} DROP COLUMN ${c.columna}: los datos de esa columna no vuelven`);
        const t = vivas.get(c.tabla);
        if (t) t.columnas.delete(c.columna);
        break;
      }

      case "truncar": {
        registrar(`TRUNCATE ${c.tabla}: borra la tabla entera, y además SQLite no lo soporta — D1 rechazará la migración`);
        break;
      }

      case "borrar_filas": {
        if (!c.conWhere) {
          registrar(`DELETE FROM ${c.tabla} sin WHERE: vacía la tabla completa`);
        }
        break;
      }

      case "actualizar": {
        // Un UPDATE sin WHERE es legítimo cuando rellena una columna que esta
        // misma migración acaba de crear: no hay nada que pisar. Si toca una
        // columna que ya existía, está sobrescribiendo datos de producción.
        if (!c.conWhere) {
          const t = vivas.get(c.tabla);
          const nuevas = t && t.nuevasEnEsteArchivo ? t.nuevasEnEsteArchivo : new Set();
          const pisadas = c.columnas.filter((col) => !nuevas.has(col) && !creadasAqui.has(c.tabla));
          if (pisadas.length > 0) {
            registrar(
              `UPDATE ${c.tabla} SET ${pisadas.join(", ")} sin WHERE sobre columna(s) preexistente(s): sobrescribe todas las filas`,
            );
          }
        }
        break;
      }

      case "cambiar_tipo": {
        problemas.push(
          `${donde} — ALTER TABLE ${c.tabla} con ALTER/MODIFY/CHANGE COLUMN: SQLite no lo soporta y D1 rechaza la migración. ` +
            `El camino es la reconstrucción de 12 pasos`,
        );
        break;
      }

      case "agregar_columna": {
        const t = vivas.get(c.tabla);
        if (!t) {
          problemas.push(`${donde} — ALTER TABLE ${c.tabla} ADD COLUMN sobre una tabla que no existe en el esquema acumulado`);
          break;
        }
        if (c.def.notNull && !c.def.tieneDefault && !creadasAqui.has(c.tabla)) {
          registrar(
            `ADD COLUMN ${c.tabla}.${c.columna} NOT NULL sin DEFAULT: SQLite falla si la tabla ya tiene filas, y la migración queda a medias`,
          );
        }
        t.columnas.set(c.columna, c.def);
        if (!t.nuevasEnEsteArchivo) t.nuevasEnEsteArchivo = new Set();
        t.nuevasEnEsteArchivo.add(c.columna);
        break;
      }

      case "renombrar_tabla": {
        if (cierresDeRecon.has(k)) {
          const nueva = vivas.get(c.tabla);
          if (nueva) {
            vivas.set(c.nueva, { ...nueva, archivo });
            vivas.delete(c.tabla);
          }
          break;
        }
        // Fuera de una reconstrucción, el renombre deja mintiendo a todo
        // REFERENCES que apunte al nombre viejo. SQLite reescribe el esquema
        // vivo, pero los archivos de este repo —y las migraciones que se
        // escriban después leyéndolos— se quedan con el nombre que ya no existe.
        const quienesApuntan = [...vivas.entries()]
          .filter(([n, t]) => n !== c.tabla && t.refs.some((r) => r.tabla === c.tabla))
          .map(([n]) => n);
        if (quienesApuntan.length > 0) {
          registrar(
            `ALTER TABLE ${c.tabla} RENAME TO ${c.nueva} deja huérfanas las referencias de: ${quienesApuntan.join(", ")}`,
          );
        }
        const t = vivas.get(c.tabla);
        if (t) {
          vivas.set(c.nueva, t);
          vivas.delete(c.tabla);
        }
        for (const [, tabla] of vivas) {
          for (const r of tabla.refs) if (r.tabla === c.tabla) r.tabla = c.nueva;
        }
        break;
      }

      case "renombrar_columna": {
        const huerfanas = [...vivas.entries()]
          .filter(([n, t]) => n !== c.tabla && t.refs.some((r) => r.tabla === c.tabla && r.columna === c.columna))
          .map(([n]) => n);
        if (huerfanas.length > 0) {
          registrar(
            `RENAME COLUMN ${c.tabla}.${c.columna} → ${c.nueva} deja huérfanas las referencias de: ${huerfanas.join(", ")}`,
          );
        }
        const t = vivas.get(c.tabla);
        if (t && t.columnas.has(c.columna)) {
          t.columnas.set(c.nueva, t.columnas.get(c.columna));
          t.columnas.delete(c.columna);
        }
        for (const [, tabla] of vivas) {
          for (const r of tabla.refs) if (r.tabla === c.tabla && r.columna === c.columna) r.columna = c.nueva;
        }
        break;
      }

      case "borrar_indice": {
        // Un índice no guarda datos: se puede reconstruir. Lo que no se puede
        // reconstruir es acordarse. mc-32 riesgo #12 dice que una consulta a
        // score_totals sin su índice compuesto termina pegando en el modo de
        // falla de tiempo de CPU de D1 conforme crece la tabla — y eso no falla
        // el día del despliegue, falla meses después. Así que borrar un índice
        // se permite, pero se declara.
        const recreado = clases.some((x, j) => j > k && x.tipo === "crear_indice" && x.indice === c.indice);
        if (!recreado && !anulada(st)) {
          problemas.push(
            `${donde} — DROP INDEX ${c.indice} y no se vuelve a crear en esta migración, sin escribir por qué. ` +
              `Añade "-- migration-safety: <razón>" arriba (mc-32 riesgo #12)`,
          );
        } else if (!recreado) {
          anulaciones.push(`${donde} — DROP INDEX ${c.indice} · anulado: "${razonAnulacion(st)}"`);
        }
        break;
      }

      case "pragma": {
        if (/legacy_alter_table\s*=\s*(1|on|true)/i.test(c.texto)) {
          problemas.push(
            `${donde} — PRAGMA legacy_alter_table encendido: con eso un RENAME deja de reescribir los REFERENCES ` +
              `de las demás tablas y las claves foráneas apuntan a un nombre que ya no existe`,
          );
        }
        break;
      }
    }
  }

  // Al cerrar cada archivo, el esquema acumulado tiene que ser coherente: toda
  // referencia declarada apunta a una tabla viva y a una columna que existe. Se
  // valida por archivo y no al final, porque una referencia que solo se resuelve
  // tres migraciones después estuvo rota en producción todo ese tiempo.
  for (const [nombre, tabla] of vivas) {
    for (const r of tabla.refs) {
      const destino = vivas.get(r.tabla);
      if (!destino) {
        problemas.push(
          `${archivo}: después de esta migración, ${nombre} referencia la tabla "${r.tabla}", que ya no existe en el esquema`,
        );
      } else if (r.columna && destino.columnas.size > 0 && !destino.columnas.has(r.columna)) {
        problemas.push(
          `${archivo}: después de esta migración, ${nombre} referencia ${r.tabla}(${r.columna}), y esa columna ya no existe`,
        );
      }
    }
  }
}

// Segunda guardia de ceguera, después de la del inventario: hay archivos, pero
// no salió de ellos ni una sentencia ni una tabla. Eso es el partidor de SQL
// roto, no un esquema limpio, y un auditor que no entiende lo que lee aprueba
// todo. Se apunta como problema en vez de salir aquí para no tragarse los
// hallazgos que ya se habían acumulado.
if (totalSentencias === 0 || vivas.size === 0) {
  problemas.push(
    `${archivos.length} archivo(s) leídos y ${totalSentencias} sentencia(s), ${vivas.size} tabla(s) entendidas: ` +
      `el auditor no está viendo nada, y uno que no ve nada aprueba siempre`,
  );
}

// ---------------------------------------------------------------------------
// 4. Una migración commiteada no se edita nunca más
// ---------------------------------------------------------------------------
// D1 lleva el control en su tabla d1_migrations por NOMBRE de archivo, no por
// contenido. Editar un archivo ya aplicado no lo vuelve a correr: deja el remoto
// con el esquema viejo y el repo diciendo otra cosa, y esa divergencia se
// descubre meses después con una consulta que falla solo en producción. La
// corrección siempre es una migración nueva.
//
// "Commiteada" es el equivalente conservador de "aplicada": el repo no guarda el
// estado del D1 remoto, así que se asume que todo lo que ya está en el historial
// pudo haber corrido.

let hayHead = true;
try {
  execFileSync("git", ["rev-parse", "--verify", "HEAD"], { cwd: raiz, stdio: "ignore" });
} catch {
  hayHead = false;
}

let congeladas = 0;
if (hayHead) {
  for (const { archivo } of numerados) {
    let enHead;
    try {
      // stderr silenciado: para una migración nueva, `git show` grita "path
      // exists on disk, but not in HEAD", y eso no es un hallazgo, es el caso
      // normal de estar escribiéndola.
      enHead = execFileSync("git", ["show", `HEAD:${archivo}`], {
        cwd: raiz,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
    } catch {
      continue; // migración nueva, todavía no commiteada: se puede seguir editando
    }
    congeladas++;
    // Si no está en el disco ya se reportó arriba como migración borrada; aquí
    // no hay nada que comparar.
    if (!existsSync(join(raiz, archivo))) continue;
    const enDisco = readFileSync(join(raiz, archivo), "utf8");
    if (enHead !== enDisco) {
      problemas.push(
        `${archivo}: editada después de haberse commiteado. D1 lleva el control por nombre de archivo, ` +
          `así que este cambio NO se va a aplicar al remoto: corrige con una migración nueva`,
      );
    }
    const commits = execFileSync("git", ["log", "--format=%h", "--", archivo], { cwd: raiz, encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
    if (commits.length > 1) {
      problemas.push(
        `${archivo}: la tocaron ${commits.length} commits (${commits.join(", ")}). ` +
          `Una migración se escribe una vez; después solo se corrige con otra migración`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Una migración no documentada es un esquema que nadie va a poder borrar
// ---------------------------------------------------------------------------
// CLAUDE.md § Cloudflare: quien crea un recurso escribe su renglón en la
// bitácora en el MISMO PR. Una migración crea tablas dentro de math-challenge-db
// —un recurso de Cloudflare— y dentro de un año nadie va a saber qué migración
// creó qué, ni podrá cumplir el runbook de erasure de mc-32 riesgo #7 sin
// leerse los .sql uno por uno.

const infra = join(raiz, INFRA);
if (!existsSync(infra)) {
  problemas.push(`no existe ${INFRA}: sin bitácora no hay forma de comprobar que las migraciones estén documentadas`);
} else {
  const texto = readFileSync(infra, "utf8");
  for (const { archivo, etiqueta } of numerados) {
    const base = archivo.split("/").pop();
    if (!texto.includes(base) && !new RegExp(`\\b${etiqueta}\\b`).test(texto)) {
      problemas.push(
        `${archivo}: no aparece en ${INFRA}. Quien crea un recurso escribe su renglón en la bitácora, ` +
          `en el mismo PR (CLAUDE.md § Cloudflare)`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Veredicto
// ---------------------------------------------------------------------------

if (problemas.length > 0) {
  console.error("✗ migration-safety\n");
  for (const p of problemas) console.error(`  · ${p}`);
  if (anulaciones.length > 0) {
    console.error("\n  anulaciones declaradas (no bloquean):");
    for (const a of anulaciones) console.error(`  · ${a}`);
  }
  console.error(`\n  Hace cumplir: mc-32 (riesgos #1, #7 y #12), mc-25, D-013, D-032`);
  console.error(`  CLAUDE.md § Cloudflare — la bitácora se escribe en el mismo PR.`);
  console.error(`\n  Una migración corre una vez, contra datos que no se regeneran.`);
  console.error(`  Si el borrado es a propósito, escríbelo en el archivo:`);
  console.error(`      -- migration-safety: <razón de 20 caracteres o más>`);
  console.error(`  Sobre ${[...INTOCABLES].join(" y ")} no vale: el borrado de datos de`);
  console.error(`  un menor va por el runbook de erasure, que toca cuatro sistemas`);
  console.error(`  (mc-32 riesgo #7), no por una migración.`);
  process.exit(1);
}

const rango = ordenados.length
  ? `${String(ordenados[0]).padStart(4, "0")}..${String(ordenados[ordenados.length - 1]).padStart(4, "0")}`
  : "-";

console.log(
  `✓ migration-safety — ${numerados.length} migración(es) ${rango}, ${vivas.size} tabla(s) vivas, ningún borrado destructivo`,
);
console.log(`  · ${totalSentencias} sentencia(s) leídas · ${reconstruccionesVistas} reconstrucción(es) de 12 pasos reconocidas`);
console.log(`  · ${congeladas} ya commiteada(s) y sin editar después · todas nombradas en ${INFRA}`);
if (anulaciones.length > 0) {
  console.log(`  · ${anulaciones.length} anulación(es) declarada(s) en los archivos:`);
  for (const a of anulaciones) console.log(`    ${a}`);
}
