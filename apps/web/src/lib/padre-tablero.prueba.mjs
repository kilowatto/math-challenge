#!/usr/bin/env node
// Casos del camino del tablero global — F7 #247, #250.
//
//     node --experimental-strip-types apps/web/src/lib/padre-tablero.prueba.mjs
//
// Por qué existen. La escalera de visibilidad (D-081) no falla con un error:
// falla en silencio — un niño de PRIMARIA en el puesto 47 que recibe la tabla
// entera, o un perfil sin consentimiento apareciendo en una lista pública.
// Ninguno de los dos se ve leyendo el código; se ve ejecutando la capa de
// datos de verdad contra D1 sobre `node:sqlite`, y la ruta de verdad — el
// handler `POST` de `pages/api/padre-tablero.ts` — con una sesión falsa en un
// KV de mentira.
//
// ─── La segunda fuente, escrita a mano (D-070) ──────────────────────────────
//
// Los números de la escalera — 20 para PRIMARIA, 100 para el resto, tercios
// para KINDER — se escriben aquí A MANO de #247 y D-081, NO se importan del
// motor. Si la prueba leyera `TOP_PRIMARIA` para decidir qué esperar,
// aprobaría su propia violación: un auditor que juzga con la misma función
// que el código usa para decidir no puede fallar nunca.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { DatabaseSync } from "node:sqlite";
import {
  filasDeTablero,
  vistaParaNino,
  vistaParaAdulto,
  PERIODO_GLOBAL,
} from "./tablero-datos.ts";
import {
  activarTablero,
  consentimientoTablero,
  desactivarTablero,
} from "./padre-tablero.ts";
import { POST } from "../pages/api/padre-tablero.ts";

// #247 y D-081, renglón por renglón, a mano. NO importados.
const A_MANO = { TOP_PRIMARIA: 20, TOP_TABLERO: 100 };

const ESQUEMA = `
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  alias TEXT,
  -- D-197: SQL_TOP_ADULTO ahora hace COALESCE(username, alias) — la
  -- columna tiene que existir aquí aunque ningún caso de esta prueba fije un
  -- valor (NULL dispara el mismo fallback al alias que ya se probaba).
  username TEXT,
  deleted_at INTEGER
);
CREATE TABLE child_profiles (
  id TEXT PRIMARY KEY,
  parent_user_id TEXT NOT NULL,
  alias TEXT NOT NULL,
  theme_band TEXT NOT NULL CHECK (theme_band IN ('KINDER','PRIMARIA','SECUNDARIA')),
  created_at INTEGER NOT NULL DEFAULT 0,
  deleted_at INTEGER
);
CREATE TABLE score_totals (
  child_profile_id TEXT NOT NULL,
  period TEXT NOT NULL,
  theme_band TEXT NOT NULL,
  total_score INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (child_profile_id, period)
);
CREATE TABLE score_totals_adulto (
  user_id TEXT NOT NULL,
  period TEXT NOT NULL,
  theme_band TEXT NOT NULL CHECK (theme_band IN ('SECUNDARIA','SERIO','JR','PRO')),
  total_score INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, period)
);
CREATE TABLE consent_type_catalog (
  code TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  required INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT 0,
  current_version TEXT NOT NULL DEFAULT 'v1'
);
INSERT INTO consent_type_catalog (code, description, legal_basis, required, created_at)
  VALUES ('LEADERBOARD', 'Aparecer en el tablero global con un alias generado', 'CONSENT', 0, 0);
CREATE TABLE child_consents (
  child_profile_id TEXT NOT NULL,
  consent_code     TEXT NOT NULL,
  granted_by       TEXT NOT NULL,
  granted_at       INTEGER NOT NULL,
  revoked_at       INTEGER,
  consent_version  TEXT,
  PRIMARY KEY (child_profile_id, consent_code)
);
`;

/** El adaptador D1 mínimo sobre node:sqlite (el mismo patrón que padre-limite). */
function adaptar(db) {
  return {
    prepare(sql) {
      let args = [];
      const bound = {
        bind(...a) {
          args = a;
          return bound;
        },
        async all() {
          return { results: db.prepare(sql).all(...args) };
        },
        async first() {
          return db.prepare(sql).get(...args) ?? null;
        },
        async run() {
          return db.prepare(sql).run(...args);
        },
      };
      return bound;
    },
    async batch(sentencias) {
      for (const s of sentencias) await s.run();
    },
  };
}

/**
 * Siembra `n` niños de una banda, todos con opt-in vigente, con puntos
 * decrecientes: el perfil `c000` es el primero y `c{n-1}` el último. Los ids
 * llevan ceros a la izquierda para que el orden de cadena coincida con el
 * numérico — el desempate del tablero es por `id` ASC.
 */
function sembrarNinos(raw, n, banda, { conConsentimiento = true } = {}) {
  const insP = raw.prepare(
    "INSERT INTO child_profiles (id, parent_user_id, alias, theme_band) VALUES (?, 'padre1', ?, ?)",
  );
  const insS = raw.prepare(
    "INSERT INTO score_totals (child_profile_id, period, theme_band, total_score) VALUES (?, 'all_time', ?, ?)",
  );
  const insC = raw.prepare(
    "INSERT INTO child_consents (child_profile_id, consent_code, granted_by, granted_at) " +
      "VALUES (?, 'LEADERBOARD', 'padre1', 1000)",
  );
  for (let i = 0; i < n; i++) {
    const id = `c${String(i).padStart(3, "0")}`;
    insP.run(id, `Alias${i}`, banda);
    insS.run(id, banda, 10_000 - i * 10);
    if (conConsentimiento) insC.run(id);
  }
}

function baseSembrada() {
  const raw = new DatabaseSync(":memory:");
  raw.exec(ESQUEMA);
  raw.prepare("INSERT INTO users (id, alias) VALUES ('padre1', 'PapaAlias')").run();
  return { raw, db: adaptar(raw) };
}

/** Una sesión de adulto falsa en un KV de mentira (mismo contrato que sesiones.ts). */
const TOKEN = "a".repeat(43); // FORMA_TOKEN: 43 caracteres base64url

function entorno(db, userId) {
  const sesion = userId === null ? null : { userId, creadaEn: 0, intent: "PADRE" };
  const kv = {
    async get(llave) {
      return llave === `s:${TOKEN}` && sesion ? JSON.stringify(sesion) : null;
    },
  };
  return { runtime: { env: { DB: db, SESSION_KV: kv } } };
}

function peticionPost(cuerpo, { formulario = false, conSesion = true } = {}) {
  const cabeceras = {};
  if (conSesion) cabeceras.cookie = `mc_s=${TOKEN}`;
  let cuerpoFinal;
  if (formulario) {
    cabeceras["content-type"] = "application/x-www-form-urlencoded";
    cuerpoFinal = new URLSearchParams(cuerpo).toString();
  } else {
    cabeceras["content-type"] = "application/json";
    cuerpoFinal = JSON.stringify(cuerpo);
  }
  return new Request("https://math.kilowatto.com/api/padre-tablero", {
    method: "POST",
    headers: cabeceras,
    body: cuerpoFinal,
  });
}

let fallos = 0;
let corridos = 0;

async function caso(nombre, fn) {
  corridos++;
  try {
    await fn();
    console.log(`  ✓ ${nombre}`);
  } catch (err) {
    fallos++;
    console.error(`  ✗ ${nombre}`);
    console.error(`      ${err.message}`);
  }
}

const igual = (a, b, msg) => {
  if (a !== b) throw new Error(`${msg ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`);
};

const AHORA = 1_800_000_000;

console.log("\npadre-tablero — el tablero global y su opt-in (F7 #247)\n");

// ─── El opt-in se hace cumplir en la consulta (D-040) ────────────────────────

await caso("un niño SIN consentimiento no aparece en la lista, aunque tenga puntos", async () => {
  const { raw, db } = baseSembrada();
  sembrarNinos(raw, 5, "PRIMARIA");
  // El sexto tiene puntos y NO tiene fila LEADERBOARD.
  raw.prepare(
    "INSERT INTO child_profiles (id, parent_user_id, alias, theme_band) VALUES ('sin', 'padre1', 'SinOptIn', 'PRIMARIA')",
  ).run();
  raw.prepare(
    "INSERT INTO score_totals (child_profile_id, period, theme_band, total_score) VALUES ('sin', 'all_time', 'PRIMARIA', 50000)",
  ).run();
  const filas = await filasDeTablero(db, "nino", "PRIMARIA");
  igual(filas.length, 5, "cinco visibles, no seis");
  if (filas.some((f) => f.id === "sin")) throw new Error("el perfil sin consentimiento apareció, y encima primero");
});

await caso("un consentimiento REVOCADO saca al niño de la lista al instante", async () => {
  const { raw, db } = baseSembrada();
  sembrarNinos(raw, 5, "PRIMARIA");
  igual((await filasDeTablero(db, "nino", "PRIMARIA")).length, 5, "antes de revocar");
  raw.prepare(
    "UPDATE child_consents SET revoked_at = 2000 WHERE child_profile_id = 'c000' AND consent_code = 'LEADERBOARD'",
  ).run();
  const filas = await filasDeTablero(db, "nino", "PRIMARIA");
  igual(filas.length, 4, "después de revocar");
  if (filas.some((f) => f.id === "c000")) throw new Error("el revocado sigue en la lista");
});

// ─── La escalera de visibilidad (D-081), contra la tabla escrita a mano ─────

await caso("PRIMARIA puesto 47: recibe SOLO su total — ni tabla, ni rango, ni vecinos", async () => {
  const { raw, db } = baseSembrada();
  sembrarNinos(raw, 60, "PRIMARIA");
  // c046 es el puesto 47: 10_000 − 46·10 = 9 540 puntos.
  const { vista } = await vistaParaNino(db, { id: "c046", theme_band: "PRIMARIA" });
  igual(vista.lista.length, 0, "la tabla NO viaja");
  igual(vista.mi_posicion, null, "el rango NO viaja");
  igual(vista.mi_total, 9540, "su propio total sí");
  if (JSON.stringify(vista).includes("c045") || JSON.stringify(vista).includes("c047")) {
    throw new Error("un vecino viajó en la respuesta");
  }
});

await caso("PRIMARIA puesto 3: SÍ ve el top 20, con su fila marcada (control positivo, D-070)", async () => {
  const { raw, db } = baseSembrada();
  sembrarNinos(raw, 60, "PRIMARIA");
  const { vista } = await vistaParaNino(db, { id: "c002", theme_band: "PRIMARIA" });
  igual(vista.lista.length, A_MANO.TOP_PRIMARIA, "el top 20 — ni 19 ni 60");
  igual(vista.mi_posicion?.forma, "exacta", "posición exacta dentro del top");
  igual(vista.mi_posicion?.rank, 3, "puesto 3");
  igual(vista.lista.filter((e) => e.soy_yo).length, 1, "exactamente un «tú estás aquí»");
});

await caso("SECUNDARIA puesto 147: posición EXACTA y «tú estás aquí» fuera del top 100", async () => {
  const { raw, db } = baseSembrada();
  sembrarNinos(raw, 200, "SECUNDARIA");
  const { vista } = await vistaParaNino(db, { id: "c146", theme_band: "SECUNDARIA" });
  igual(vista.mi_posicion?.forma, "exacta", "exacta");
  igual(vista.mi_posicion?.rank, 147, "el número viaja, para esta banda");
  igual(vista.lista.length, A_MANO.TOP_TABLERO, "la lista publicada es el top 100");
  if (vista.lista.some((e) => e.soy_yo)) throw new Error("el puesto 147 no puede estar marcado dentro del top 100");
  igual(vista.mi_total, 10_000 - 146 * 10, "su total");
});

await caso("SECUNDARIA puesto 147 con la VENTANA forzada a 50: el espejo da el mismo 147", async () => {
  const { raw, db } = baseSembrada();
  sembrarNinos(raw, 200, "SECUNDARIA");
  // Con la ventana por debajo del puesto del mirador, `armarTablero` no puede
  // verlo: lo resuelve el espejo con el COUNT — y tiene que dar lo mismo que
  // el motor da con la ventana completa.
  const { vista } = await vistaParaNino(db, { id: "c146", theme_band: "SECUNDARIA" }, PERIODO_GLOBAL, 50);
  igual(vista.mi_posicion?.forma, "exacta", "exacta");
  igual(vista.mi_posicion?.rank, 147, "el rango del COUNT coincide con el del motor");
  // La lista no puede pasar de la ventana que se trajo (50 < top 100): lo que
  // el espejo garantiza es el «tú estás aquí», no filas que no se consultaron.
  igual(vista.lista.length, 50, "la ventana entera, y nunca un vecino inventado");
  igual(vista.mi_total, 10_000 - 146 * 10, "su total");
});

await caso("el desempate es puntos desc y luego id ASC — en la consulta y en el COUNT", async () => {
  const { raw, db } = baseSembrada();
  sembrarNinos(raw, 3, "SECUNDARIA");
  // c003 y c004 empatan a 9 700; el id menor gana el empate.
  raw.prepare(
    "INSERT INTO child_profiles (id, parent_user_id, alias, theme_band) VALUES ('c003', 'padre1', 'EmpateA', 'SECUNDARIA')",
  ).run();
  raw.prepare(
    "INSERT INTO child_profiles (id, parent_user_id, alias, theme_band) VALUES ('c004', 'padre1', 'EmpateB', 'SECUNDARIA')",
  ).run();
  for (const id of ["c003", "c004"]) {
    raw.prepare(
      `INSERT INTO score_totals (child_profile_id, period, theme_band, total_score) VALUES ('${id}', 'all_time', 'SECUNDARIA', 9700)`,
    ).run();
    raw.prepare(
      `INSERT INTO child_consents (child_profile_id, consent_code, granted_by, granted_at) VALUES ('${id}', 'LEADERBOARD', 'padre1', 1000)`,
    ).run();
  }
  const { vista } = await vistaParaNino(db, { id: "c004", theme_band: "SECUNDARIA" });
  igual(vista.mi_posicion?.rank, 5, "c004 va detrás de c003 con los mismos puntos");
});

await caso("KINDER: la posición llega en TERCIOS y ningún número de rango viaja", async () => {
  const { raw, db } = baseSembrada();
  sembrarNinos(raw, 60, "KINDER");
  // c040 es el puesto 41 de 60: tercio de abajo.
  const { vista } = await vistaParaNino(db, { id: "c040", theme_band: "KINDER" });
  igual(vista.mi_posicion?.forma, "tercio", "tercio, no número");
  igual(vista.mi_posicion?.tercio, "bottom", "el puesto 41 de 60 está en el tercio de abajo");
  if (/"rank"\s*:/.test(JSON.stringify(vista))) {
    throw new Error("un rank numérico viajó en la respuesta de KINDER");
  }
  // La lista publicada es el tercio de arriba: 20 de 60. Jamás el fondo de la
  // tabla — «never show the literal last-place rank» (mc-18, implicación 7).
  igual(vista.lista.length, 20, "el tercio de arriba");
  igual(vista.lista.every((e) => e.posicion.forma === "tercio"), true, "todas las filas en tercios");
});

await caso("sin opt-in: el niño ve SU total propio (su dato), sin lista ni posición", async () => {
  const { raw, db } = baseSembrada();
  sembrarNinos(raw, 30, "PRIMARIA");
  raw.prepare(
    "DELETE FROM child_consents WHERE child_profile_id = 'c010' AND consent_code = 'LEADERBOARD'",
  ).run();
  const { vista } = await vistaParaNino(db, { id: "c010", theme_band: "PRIMARIA" });
  igual(vista.mi_total, 10_000 - 10 * 10, "su total es suyo, con o sin tablero");
  igual(vista.mi_posicion, null, "sin consentimiento no hay posición");
  igual(vista.lista.length, 0, "y PRIMARIA fuera de la lista no recibe la tabla");
});

// ─── El tablero del adulto (SQL_TOP_ADULTO — jamás un UNION, #250) ───────────

await caso("adulto SERIO: posición exacta fuera del top 100; el sin alias no aparece", async () => {
  const { raw, db } = baseSembrada();
  const insU = raw.prepare("INSERT INTO users (id, alias) VALUES (?, ?)");
  const insS = raw.prepare(
    "INSERT INTO score_totals_adulto (user_id, period, theme_band, total_score) VALUES (?, 'all_time', 'SERIO', ?)",
  );
  for (let i = 0; i < 150; i++) {
    const id = `a${String(i).padStart(3, "0")}`;
    insU.run(id, `Adulto${i}`);
    insS.run(id, 20_000 - i * 10);
  }
  // Uno con puntos pero SIN alias (todavía no compite, 0012): no puede salir.
  insU.run("sinAlias", null);
  insS.run("sinAlias", 99999);
  const { vista } = await vistaParaAdulto(db, "a120");
  igual(vista.banda, "SERIO", "la banda sale de su fila");
  igual(vista.mi_posicion?.rank, 121, "posición exacta fuera del top 100");
  igual(vista.lista.length, A_MANO.TOP_TABLERO, "top 100");
  if (vista.lista.some((f) => f.alias === "Adulto0" && f.puntos === 0)) throw new Error("dato roto");
  const filas = await filasDeTablero(db, "adulto", "SERIO");
  if (filas.some((f) => f.id === "sinAlias")) throw new Error("un adulto sin alias apareció en el tablero");
});

await caso("adulto sin fila todavía: ve el tablero de SERIO, sin posición propia", async () => {
  const { raw, db } = baseSembrada();
  raw.prepare("INSERT INTO users (id, alias) VALUES ('nuevo', 'NuevoAlias')").run();
  const { vista } = await vistaParaAdulto(db, "nuevo");
  igual(vista.banda, "SERIO", "SERIO es la banda adulta con contenido (D-034)");
  igual(vista.mi_total, 0, "sin puntos todavía");
  igual(vista.mi_posicion, null, "sin posición");
});

// ─── El gobierno del consentimiento (D-051) ──────────────────────────────────

await caso("activar: INSERT con granted_by y consent_version del catálogo", async () => {
  const { raw, db } = baseSembrada();
  sembrarNinos(raw, 1, "KINDER");
  const hijo = { id: "c000", alias: "Alias0", theme_band: "KINDER" };
  await activarTablero(db, { hijo, parentUserId: "padre1", ahora: AHORA });
  // c000 ya venía con fila de la siembra: el estado no se reescribe.
  const antes = raw.prepare(
    "SELECT granted_at FROM child_consents WHERE child_profile_id = 'c000' AND consent_code = 'LEADERBOARD'",
  ).get();
  igual(antes.granted_at, 1000, "un consentimiento vigente no se reescribe (idempotente)");

  raw.prepare("DELETE FROM child_consents WHERE child_profile_id = 'c000'").run();
  await activarTablero(db, { hijo, parentUserId: "padre1", ahora: AHORA });
  const fila = raw.prepare(
    "SELECT granted_by, granted_at, revoked_at, consent_version FROM child_consents " +
      "WHERE child_profile_id = 'c000' AND consent_code = 'LEADERBOARD'",
  ).get();
  igual(fila.granted_by, "padre1", "quién consintió");
  igual(fila.granted_at, AHORA, "cuándo");
  igual(fila.revoked_at, null, "vigente");
  igual(fila.consent_version, "v1", "qué texto aceptó");
});

await caso("desactivar REVOCA: la fila queda, los puntos quedan, y el niño sale de la lista", async () => {
  const { raw, db } = baseSembrada();
  sembrarNinos(raw, 3, "PRIMARIA");
  const hijo = { id: "c000", alias: "Alias0", theme_band: "PRIMARIA" };
  await desactivarTablero(db, { hijo, parentUserId: "padre1", ahora: AHORA });
  const fila = raw.prepare(
    "SELECT revoked_at FROM child_consents WHERE child_profile_id = 'c000' AND consent_code = 'LEADERBOARD'",
  ).get();
  igual(fila.revoked_at, AHORA, "revoked_at puesto — la fila NO se borró");
  igual(
    raw.prepare("SELECT total_score FROM score_totals WHERE child_profile_id = 'c000'").get().total_score,
    10_000,
    "los puntos son del niño, no del tablero",
  );
  const filas = await filasDeTablero(db, "nino", "PRIMARIA");
  if (filas.some((f) => f.id === "c000")) throw new Error("el revocado sigue en la lista");

  // Segunda baja: idempotente, conserva el PRIMER revoked_at.
  await desactivarTablero(db, { hijo, parentUserId: "padre1", ahora: AHORA + 60 });
  igual(
    raw.prepare("SELECT revoked_at FROM child_consents WHERE child_profile_id = 'c000'").get().revoked_at,
    AHORA,
    "el primer revoked_at es el que vale",
  );
});

await caso("re-activar: alta NUEVA con su quién y su cuándo, nunca DELETE en el camino", async () => {
  const { raw, db } = baseSembrada();
  sembrarNinos(raw, 1, "KINDER");
  const hijo = { id: "c000", alias: "Alias0", theme_band: "KINDER" };
  await desactivarTablero(db, { hijo, parentUserId: "padre1", ahora: AHORA });
  igual((await consentimientoTablero(db, "c000")).vigente, false, "revocado");
  await activarTablero(db, { hijo, parentUserId: "padre1", ahora: AHORA + 300 });
  const estado = await consentimientoTablero(db, "c000");
  igual(estado.vigente, true, "vigente de nuevo");
  igual(estado.grantedAt, AHORA + 300, "el alta nueva registra SU cuándo");
  igual(
    raw.prepare("SELECT COUNT(*) AS n FROM child_consents WHERE child_profile_id = 'c000'").get().n,
    1,
    "una sola fila — la llave primaria no admite dos",
  );
});

// ─── El camino de la ruta, de punta a punta ──────────────────────────────────

await caso("POST activar de formulario: 303 de vuelta a la pantalla del hijo, con ?guardado=1", async () => {
  const { raw, db } = baseSembrada();
  sembrarNinos(raw, 1, "KINDER", { conConsentimiento: false });
  const res = await POST({
    request: peticionPost({ hijo: "c000", accion: "activar", locale: "es-MX" }, { formulario: true }),
    locals: entorno(db, "padre1"),
  });
  igual(res.status, 303, "estado");
  igual(res.headers.get("location"), "/es-MX/app/parent/tablero/c000?guardado=1", "destino");
  const fila = raw.prepare(
    "SELECT granted_by FROM child_consents WHERE child_profile_id = 'c000' AND consent_code = 'LEADERBOARD'",
  ).get();
  igual(fila.granted_by, "padre1", "el consentimiento quedó escrito");
});

await caso("POST con acción inventada: no escribe nada y vuelve con la clave de error", async () => {
  const { raw, db } = baseSembrada();
  sembrarNinos(raw, 1, "KINDER", { conConsentimiento: false });
  const res = await POST({
    request: peticionPost({ hijo: "c000", accion: "borrar", locale: "es-MX" }, { formulario: true }),
    locals: entorno(db, "padre1"),
  });
  igual(res.status, 303, "estado");
  igual(
    res.headers.get("location"),
    "/es-MX/app/parent/tablero/c000?e=accion_desconocida",
    "destino con la clave",
  );
  igual(
    raw.prepare("SELECT COUNT(*) AS n FROM child_consents").get().n,
    0,
    "«borrar» no encontró ninguna función que borre — borrar no existe",
  );
});

await caso("POST de OTRO padre: 404, y nada se escribe en la base", async () => {
  const { raw, db } = baseSembrada();
  sembrarNinos(raw, 1, "KINDER", { conConsentimiento: false });
  raw.prepare("INSERT INTO users (id, alias) VALUES ('padre2', 'OtroAlias')").run();
  const res = await POST({
    request: peticionPost({ hijo: "c000", accion: "activar", locale: "es-MX" }),
    locals: entorno(db, "padre2"),
  });
  igual(res.status, 404, "estado");
  igual(raw.prepare("SELECT COUNT(*) AS n FROM child_consents").get().n, 0, "no se escribió nada");
});

await caso("POST sin sesión: 401, y la base intacta", async () => {
  const { raw, db } = baseSembrada();
  sembrarNinos(raw, 1, "KINDER", { conConsentimiento: false });
  const res = await POST({
    request: peticionPost({ hijo: "c000", accion: "activar", locale: "es-MX" }, { conSesion: false }),
    locals: entorno(db, null),
  });
  igual(res.status, 401, "estado");
  igual(raw.prepare("SELECT COUNT(*) AS n FROM child_consents").get().n, 0, "no se escribió nada");
});

if (fallos > 0) {
  console.error(`\n✗ ${fallos} de ${corridos} casos fallaron`);
  process.exit(1);
}
console.log(`\n✓ ${corridos} casos`);
