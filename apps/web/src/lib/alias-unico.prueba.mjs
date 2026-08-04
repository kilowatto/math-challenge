#!/usr/bin/env node
// El alias del niño, único por padre — las dos capas (issue #259).
//
//     node --experimental-strip-types apps/web/src/lib/alias-unico.prueba.mjs
//
// Por qué existe. El catch de `perfil-nuevo.ts` que reintentaba con otro alias
// era CÓDIGO MUERTO: su comentario citaba un índice «de la migración 0003» que
// nunca existió, y sin índice D1 no rechaza nada. El índice real llegó en la
// 0006 y la 0021 lo garantiza sobre datos deduplicados. Nada de eso se ve
// leyendo el código: se ve ejecutando la ruta de verdad — el handler `POST`
// con una sesión falsa en un KV de mentira y D1 sobre `node:sqlite` — y
// corriendo la migración REAL, leída del disco, sobre una base con duplicados
// sembrados.
//
// ─── La segunda fuente, escrita a mano (D-070) ──────────────────────────────
//
// Los alias esperados («RinoceronteVeloz1000», «LinceAgudo5500») y el sufijo
// de deduplicación («-BBBBBB») están calculados A MANO aquí abajo, no con
// `generarAlias` ni con la expresión SQL de la migración: si el test usara la
// misma función que el código para decidir qué esperar, aprobaría su propia
// violación y no podría fallar nunca.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { POST } from "../pages/api/perfil-nuevo.ts";

// La migración REAL. Probar una copia a mano del SQL sería probar que el test
// sabe leer un archivo inventado (D-070).
const MIGRACION_0021 = readFileSync(
  new URL("../../../../migrations/0021_alias_unico_por_padre.sql", import.meta.url),
  "utf8",
);

// El esquema de `child_profiles` tal como quedó tras la 0006, escrito a mano:
// sin el índice único. La migración 0021 es la que lo crea — sembrar los
// duplicados ANTES de aplicarla es la única forma de que puedan existir.
const ESQUEMA = `
CREATE TABLE users (id TEXT PRIMARY KEY, timezone TEXT);
CREATE TABLE child_profiles (
  id             TEXT PRIMARY KEY,
  parent_user_id TEXT NOT NULL,
  alias          TEXT NOT NULL,
  alias_locale   TEXT NOT NULL DEFAULT 'es-MX',
  birth_year     INTEGER NOT NULL DEFAULT 0,
  theme_band     TEXT NOT NULL CHECK (theme_band IN ('KINDER','PRIMARIA','SECUNDARIA')),
  avatar_parts   TEXT NOT NULL DEFAULT '{}',
  locale         TEXT NOT NULL DEFAULT 'es-MX',
  created_at     INTEGER NOT NULL DEFAULT 0,
  updated_at     INTEGER NOT NULL DEFAULT 0,
  deleted_at     INTEGER
);
CREATE TABLE consent_type_catalog (
  code TEXT PRIMARY KEY,
  current_version TEXT NOT NULL DEFAULT 'v1'
);
INSERT INTO consent_type_catalog (code) VALUES ('CHILD_PROFILE');
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
      // D1 corre el batch en una transacción implícita; aquí basta con
      // ejecutarlas en orden. En los casos de choque de alias es la PRIMERA
      // sentencia la que falla, así que no queda nada escrito a medias.
      for (const s of sentencias) await s.run();
    },
  };
}

/** Base en memoria CON la 0021 ya aplicada (índice único creado). */
function baseConIndice() {
  const raw = new DatabaseSync(":memory:");
  raw.exec(ESQUEMA);
  raw.prepare("INSERT INTO users (id, timezone) VALUES ('padre1', 'America/Mexico_City')").run();
  raw.prepare("INSERT INTO users (id, timezone) VALUES ('padre2', 'Europe/Madrid')").run();
  raw.exec(MIGRACION_0021);
  return { raw, db: adaptar(raw) };
}

/** Base en memoria SIN el índice: como quedó un ambiente de la era del bug. */
function baseSinIndice() {
  const raw = new DatabaseSync(":memory:");
  raw.exec(ESQUEMA);
  raw.prepare("INSERT INTO users (id, timezone) VALUES ('padre1', 'America/Mexico_City')").run();
  raw.prepare("INSERT INTO users (id, timezone) VALUES ('padre2', 'Europe/Madrid')").run();
  return raw;
}

// ─── Sesión falsa y peticiones (mismo contrato que sesiones.ts) ──────────────
const TOKEN = "a".repeat(43); // FORMA_TOKEN: 43 caracteres base64url

function entorno(db, userId = "padre1") {
  const sesion = { userId, creadaEn: 0, intent: "PADRE" };
  const kv = {
    async get(llave) {
      return llave === `s:${TOKEN}` ? JSON.stringify(sesion) : null;
    },
  };
  return { runtime: { env: { DB: db, SESSION_KV: kv } } };
}

function peticion() {
  return new Request("https://math.kilowatto.com/api/perfil-nuevo", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      cookie: `mc_s=${TOKEN}`,
    },
    // Sin año: el adulto se saltó el paso con «Ahora no» (línea roja #4) y la
    // banda derivada es KINDER — el camino más simple, y válido, para llegar
    // a la inserción.
    body: JSON.stringify({ locale: "es-MX" }),
  });
}

/**
 * `generarAlias` pide tres números por intento: nombre, adjetivo y sufijo.
 * Con la lista es-MX y los valores de abajo, A MANO:
//
//   [0, 0, 0]     → nombres[0] "Rinoceronte" + adjetivos[0] "Veloz"
//                   + sufijo 1000+floor(0·9000)=1000  → "RinoceronteVeloz1000"
//   [0.5, 0.5, 0.5] → nombres[6] "Lince" + adjetivos[5] "Agudo"
//                   + sufijo 1000+floor(0.5·9000)=5500 → "LinceAgudo5500"
 */
function amarrarAzar(valores) {
  const original = Math.random;
  let i = 0;
  Math.random = () => valores[i++ % valores.length];
  return () => {
    Math.random = original;
  };
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
const cierto = (v, msg) => {
  if (!v) throw new Error(msg ?? "se esperaba verdadero");
};

console.log("\nalias-unico — el alias del niño, único por padre (issue #259)\n");

// ─── Capa 1: la base misma rechaza ───────────────────────────────────────────

await caso("mismo padre y mismo alias: la segunda inserción directa FALLA por UNIQUE", async () => {
  const { raw } = baseConIndice();
  const insertar = (id, padre) =>
    raw
      .prepare("INSERT INTO child_profiles (id, parent_user_id, alias, theme_band) VALUES (?, ?, 'PandaVeloz4821', 'KINDER')")
      .run(id, padre);
  insertar("hijo-1", "padre1");
  let error = null;
  try {
    insertar("hijo-2", "padre1");
  } catch (e) {
    error = e;
  }
  cierto(error && /UNIQUE/i.test(error.message), `se esperaba un error UNIQUE, obtuve: ${error?.message ?? "ninguno"}`);
});

await caso("padres DISTINTOS con el mismo alias: permitido", async () => {
  const { raw } = baseConIndice();
  raw.prepare("INSERT INTO child_profiles (id, parent_user_id, alias, theme_band) VALUES ('h1', 'padre1', 'PandaVeloz4821', 'KINDER')").run();
  raw.prepare("INSERT INTO child_profiles (id, parent_user_id, alias, theme_band) VALUES ('h2', 'padre2', 'PandaVeloz4821', 'KINDER')").run();
  igual(raw.prepare("SELECT COUNT(*) AS n FROM child_profiles WHERE alias = 'PandaVeloz4821'").get().n, 2, "dos familias, un alias");
});

await caso("un perfil BORRADO no bloquea el alias de un hermano nuevo (índice parcial)", async () => {
  const { raw } = baseConIndice();
  raw.prepare("INSERT INTO child_profiles (id, parent_user_id, alias, theme_band, deleted_at) VALUES ('viejo', 'padre1', 'PandaVeloz4821', 'KINDER', 1)").run();
  raw.prepare("INSERT INTO child_profiles (id, parent_user_id, alias, theme_band) VALUES ('nuevo', 'padre1', 'PandaVeloz4821', 'KINDER')").run();
  igual(raw.prepare("SELECT COUNT(*) AS n FROM child_profiles").get().n, 2, "el borrado no estorba");
});

// ─── Capa 2: la deduplicación de la 0021, explícita y determinista ───────────

await caso("la migración renombra el duplicado con el sufijo calculado a mano, y conserva al más antiguo", async () => {
  const raw = baseSinIndice();
  // Dos hijos del MISMO padre con el mismo alias (la era del bug), y uno de
  // otro padre con ese mismo alias (lícito). El más antiguo de padre1 se
  // queda; al nuevo se le renombra.
  raw.prepare("INSERT INTO child_profiles (id, parent_user_id, alias, theme_band, created_at) VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'padre1', 'PandaVeloz4821', 'KINDER', 100)").run();
  raw.prepare("INSERT INTO child_profiles (id, parent_user_id, alias, theme_band, created_at) VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'padre1', 'PandaVeloz4821', 'PRIMARIA', 200)").run();
  raw.prepare("INSERT INTO child_profiles (id, parent_user_id, alias, theme_band, created_at) VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'padre2', 'PandaVeloz4821', 'KINDER', 150)").run();

  raw.exec(MIGRACION_0021);

  const porId = (id) => raw.prepare("SELECT alias FROM child_profiles WHERE id = ?").get(id).alias;
  igual(porId("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), "PandaVeloz4821", "el más antiguo conserva su alias");
  // A MANO: replace(id,'-','') = 'bbbbbbbb...' → substr(1,6) = 'bbbbbb' →
  // upper = 'BBBBBB'. No se calcula con el SQL de la migración (D-070).
  igual(porId("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), "PandaVeloz4821-BBBBBB", "el duplicado se renombra de forma determinista");
  igual(porId("cccccccc-cccc-cccc-cccc-cccccccccccc"), "PandaVeloz4821", "el de otra familia no se toca");
  // Y ningún perfil se borró: tres entran, tres salen.
  igual(raw.prepare("SELECT COUNT(*) AS n FROM child_profiles").get().n, 3, "ningún perfil borrado");
});

await caso("tras deduplicar, el índice queda creado y la base rechaza el próximo duplicado", async () => {
  const raw = baseSinIndice();
  raw.prepare("INSERT INTO child_profiles (id, parent_user_id, alias, theme_band, created_at) VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'padre1', 'PandaVeloz4821', 'KINDER', 100)").run();
  raw.prepare("INSERT INTO child_profiles (id, parent_user_id, alias, theme_band, created_at) VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'padre1', 'PandaVeloz4821', 'KINDER', 200)").run();
  raw.exec(MIGRACION_0021);
  let error = null;
  try {
    raw.prepare("INSERT INTO child_profiles (id, parent_user_id, alias, theme_band) VALUES ('nuevo', 'padre1', 'PandaVeloz4821', 'KINDER')").run();
  } catch (e) {
    error = e;
  }
  cierto(error && /UNIQUE/i.test(error.message), "después de la migración, el duplicado ya no entra");
});

await caso("la migración corre DOS veces sin romperse y sin tocar nada la segunda", async () => {
  const raw = baseSinIndice();
  raw.prepare("INSERT INTO child_profiles (id, parent_user_id, alias, theme_band, created_at) VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'padre1', 'PandaVeloz4821', 'KINDER', 100)").run();
  raw.prepare("INSERT INTO child_profiles (id, parent_user_id, alias, theme_band, created_at) VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'padre1', 'PandaVeloz4821', 'KINDER', 200)").run();
  raw.exec(MIGRACION_0021);
  const despuesDeUna = raw.prepare("SELECT id, alias FROM child_profiles ORDER BY id").all();
  raw.exec(MIGRACION_0021); // la segunda corrida
  const despuesDeDos = raw.prepare("SELECT id, alias FROM child_profiles ORDER BY id").all();
  igual(JSON.stringify(despuesDeDos), JSON.stringify(despuesDeUna), "idempotente: la segunda corrida es un no-op");
});

await caso("los duplicados entre BORRADOS no se renombran ni impiden el índice", async () => {
  const raw = baseSinIndice();
  // Mismo padre, mismo alias, pero uno de los dos está borrado (baja lógica):
  // el índice parcial no los ve como conflicto, y la deduplicación tampoco.
  raw.prepare("INSERT INTO child_profiles (id, parent_user_id, alias, theme_band, created_at) VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'padre1', 'NutriaLista1234', 'KINDER', 100)").run();
  raw.prepare("INSERT INTO child_profiles (id, parent_user_id, alias, theme_band, created_at, deleted_at) VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'padre1', 'NutriaLista1234', 'KINDER', 200, 1)").run();
  raw.exec(MIGRACION_0021);
  const porId = (id) => raw.prepare("SELECT alias FROM child_profiles WHERE id = ?").get(id).alias;
  igual(porId("dddddddd-dddd-dddd-dddd-dddddddddddd"), "NutriaLista1234", "el vivo conserva su alias");
  igual(porId("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"), "NutriaLista1234", "el borrado tampoco se renombra");
});

// ─── Capa 3: el endpoint — el catch que era código muerto, ahora vivo ────────

await caso("POST: el choque de alias reintenta solo y el segundo perfil nace con OTRO alias", async () => {
  const { raw, db } = baseConIndice();
  // Primer perfil: azar fijo → "RinoceronteVeloz1000" (calculado a mano arriba).
  let soltar = amarrarAzar([0, 0, 0]);
  let res;
  try {
    res = await POST({ request: peticion(), locals: entorno(db) });
  } finally {
    soltar();
  }
  igual(res.status, 201, "el primer perfil nace");
  igual((await res.json()).alias, "RinoceronteVeloz1000", "alias del primero");

  // Segundo perfil: el azar produce el MISMO alias dos veces (dos choques) y
  // a la tercera uno distinto. Si el catch siguiera muerto, esto sería un 409.
  soltar = amarrarAzar([0, 0, 0, 0, 0, 0, 0.5, 0.5, 0.5]);
  try {
    res = await POST({ request: peticion(), locals: entorno(db) });
  } finally {
    soltar();
  }
  igual(res.status, 201, "el segundo nace tras reintentar, sin error para el padre");
  igual((await res.json()).alias, "LinceAgudo5500", "el alias reintentado es otro");

  const perfiles = raw.prepare("SELECT alias FROM child_profiles ORDER BY alias").all();
  igual(perfiles.length, 2, "dos perfiles en la base");
  cierto(perfiles[0].alias !== perfiles[1].alias, "con alias distintos");
  // Y los dos con su consentimiento: o están los dos o no está ninguno (D-013).
  igual(raw.prepare("SELECT COUNT(*) AS n FROM child_consents WHERE consent_code = 'CHILD_PROFILE'").get().n, 2, "dos consentimientos");
});

await caso("POST: tres choques seguidos devuelven 409 honesto y NO escriben nada", async () => {
  const { raw, db } = baseConIndice();
  // Un perfil previo con el alias que el azar amarrado va a producir siempre.
  raw.prepare("INSERT INTO child_profiles (id, parent_user_id, alias, theme_band) VALUES ('previo', 'padre1', 'RinoceronteVeloz1000', 'KINDER')").run();
  const soltar = amarrarAzar([0, 0, 0]); // cada intento: el mismo alias
  let res;
  try {
    res = await POST({ request: peticion(), locals: entorno(db) });
  } finally {
    soltar();
  }
  igual(res.status, 409, "tres choques: error honesto");
  igual((await res.json()).motivo, "alias_repetido:reintenta", "el motivo dice qué pasó");
  igual(raw.prepare("SELECT COUNT(*) AS n FROM child_profiles").get().n, 1, "no se escribió ningún perfil fantasma");
  igual(raw.prepare("SELECT COUNT(*) AS n FROM child_consents").get().n, 0, "ni consentimientos huérfanos");
});

await caso("POST: un error que NO es de alias no se reintenta ni se disfraza de 409", async () => {
  const raw = new DatabaseSync(":memory:");
  raw.exec(ESQUEMA);
  raw.prepare("INSERT INTO users (id, timezone) VALUES ('padre1', 'America/Mexico_City')").run();
  raw.exec(MIGRACION_0021);
  raw.exec("DROP TABLE child_consents"); // la base rota por otra causa
  const db = adaptar(raw);
  const soltar = amarrarAzar([0, 0, 0]);
  let error = null;
  try {
    await POST({ request: peticion(), locals: entorno(db) });
  } catch (e) {
    error = e;
  } finally {
    soltar();
  }
  cierto(error && !/UNIQUE/i.test(error.message), `el error real tenía que subir tal cual, obtuve: ${error?.message ?? "nada"}`);
});

console.log("");
if (fallos > 0) {
  console.error(`✗ ${fallos} de ${corridos} casos fallaron.`);
  process.exit(1);
}
console.log(`✓ alias-unico: ${corridos} casos`);
