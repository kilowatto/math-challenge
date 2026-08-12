#!/usr/bin/env node
// Los tres endpoints de PIN del niño, ejecutados de verdad (D-201).
//
//     node --experimental-strip-types apps/web/src/lib/pin-endpoints.prueba.mjs
//
// ─── Por qué existe ────────────────────────────────────────────────────────
//
// D-201 borra `kids/pin.astro`, y con ella se van las protecciones que vivían
// en su frontmatter: la autorización por dispositivo del hogar, el 425 de
// 0-RTT, el «no eran esos» sin castigo, y la rama que dejaba entrar a un perfil
// sin PIN. Reescribirlas en tres endpoints nuevos es exactamente el momento en
// que una de ellas se pierde sin que nada se vea roto — la pantalla seguiría
// funcionando perfecta con la autorización quitada.
//
// Por eso esto no lee el código: **lo ejecuta**. Los handlers `GET`/`POST`
// reales, con un D1 sobre `node:sqlite`, un KV de mentira y `Request` de
// verdad, sobre el esquema REAL leído de las migraciones del disco (D-070).
//
// ─── La segunda fuente, escrita a mano ─────────────────────────────────────
//
// El PIN correcto de cada caso se fija llamando a `hashearPin` UNA vez, al
// sembrar la base — igual que haría `/api/perfil-pin`. Lo que la prueba afirma
// después no es «el hash coincide» (eso sería la misma función comprobándose a
// sí misma) sino el COMPORTAMIENTO observable: qué código responde, si emite
// `set-cookie`, y qué quedó escrito en la tabla.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { GET as PIN_DATOS } from "../pages/api/pin-datos.ts";
import { POST as PIN_ENTRAR } from "../pages/api/pin-entrar.ts";
import { POST as PIN_ELEGIR } from "../pages/api/pin-elegir.ts";
import { hashearPin } from "../../../../packages/motor/src/pin-imagenes.ts";
import { hashearPinNumerico } from "../../../../packages/motor/src/pin-numerico.ts";

const SECRETO = "secreto-de-prueba-no-es-el-de-produccion";
const TOKEN_HOGAR = "h".repeat(43); // FORMA_TOKEN: 43 caracteres base64url

// El esquema REAL, leído del disco. La 0027 es la que agrega `tipo`, y sin
// ella la mitad numérica de estos endpoints no se podría probar.
const M0002 = readFileSync(new URL("../../../../migrations/0002_child_profiles.sql", import.meta.url), "utf8");
const M0027 = readFileSync(
  new URL("../../../../migrations/0027_nombre_usuario_adulto_y_tipo_pin.sql", import.meta.url),
  "utf8",
);

/**
 * Solo las sentencias que estos endpoints tocan, de las migraciones reales.
 *
 * Los comentarios `--` se quitan ANTES de partir por `;`: si no, el comentario
 * que precede a cada sentencia queda pegado al principio de la siguiente y el
 * `^CREATE TABLE` no reconoce ninguna. El síntoma era «no such table», con las
 * migraciones leídas correctamente del disco.
 */
function sentenciasDe(sql, tablas) {
  return sql
    .replace(/^\s*--[^\n]*$/gm, "")
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s && tablas.some((t) => s.includes(t)))
    .filter((s) => /^(CREATE TABLE|ALTER TABLE|CREATE INDEX|CREATE UNIQUE INDEX)/i.test(s));
}

const ESQUEMA_BASE = `
CREATE TABLE household_devices (
  device_token   TEXT PRIMARY KEY,
  owner_user_id  TEXT NOT NULL,
  label          TEXT NOT NULL,
  revoked_at     INTEGER
);
CREATE TABLE child_profiles (
  id             TEXT PRIMARY KEY,
  parent_user_id TEXT NOT NULL,
  alias          TEXT NOT NULL,
  theme_band     TEXT NOT NULL,
  avatar_parts   TEXT NOT NULL DEFAULT '{}',
  locale         TEXT NOT NULL DEFAULT 'es-MX',
  deleted_at     INTEGER
);
`;

/** El adaptador D1 mínimo sobre node:sqlite (el patrón de alias-unico). */
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
  };
}

/**
 * Una casa con dos hermanos: Ana (KINDER, con PIN de imágenes) y Beto
 * (PRIMARIA, sin PIN todavía). Y Caro, de OTRA casa.
 */
async function sembrar({ conPinDeAna = true } = {}) {
  const raw = new DatabaseSync(":memory:");
  raw.exec(ESQUEMA_BASE);
  for (const s of sentenciasDe(M0002, ["child_image_pin"])) raw.exec(s + ";");
  for (const s of sentenciasDe(M0027, ["child_image_pin"])) raw.exec(s + ";");

  raw
    .prepare("INSERT INTO household_devices (device_token, owner_user_id, label) VALUES (?, 'padre1', 'tablet')")
    .run(TOKEN_HOGAR);
  raw
    .prepare(
      "INSERT INTO child_profiles (id, parent_user_id, alias, theme_band, locale) VALUES " +
        "('ana', 'padre1', 'PatoVeloz1234', 'KINDER', 'es-MX'), " +
        "('beto', 'padre1', 'LinceAgudo5500', 'PRIMARIA', 'es-MX'), " +
        "('caro', 'padre2', 'RanaSabia7000', 'KINDER', 'es-MX')",
    )
    .run();

  if (conPinDeAna) {
    const hash = await hashearPin(SECRETO, "ana", [0, 4, 7]);
    raw
      .prepare(
        "INSERT INTO child_image_pin (child_profile_id, pin_hash, tipo, created_at, updated_at) " +
          "VALUES ('ana', ?, 'imagenes', 0, 0)",
      )
      .run(hash);
  }
  return { raw, db: adaptar(raw) };
}

const kvFalso = () => {
  const guardado = new Map();
  return {
    async put(k, v) {
      guardado.set(k, v);
    },
    async get(k) {
      return guardado.get(k) ?? null;
    },
    async delete(k) {
      guardado.delete(k);
    },
    _guardado: guardado,
  };
};

function contexto(db, kv, { sinSecreto = false } = {}) {
  return { runtime: { env: { DB: db, SESSION_KV: kv, PIN_PAD_SECRET: sinSecreto ? undefined : SECRETO } } };
}

const conCookie = (token) => (token ? { cookie: `mc_h=${token}` } : {});

function peticionGet(childId, { token = TOKEN_HOGAR } = {}) {
  const url = `https://math.kilowatto.com/api/pin-datos?p=${encodeURIComponent(childId)}`;
  return { request: new Request(url, { headers: conCookie(token) }), url: new URL(url) };
}

function peticionPost(ruta, cuerpo, { token = TOKEN_HOGAR, earlyData = false } = {}) {
  const headers = { "content-type": "application/json", ...conCookie(token) };
  if (earlyData) headers["early-data"] = "1";
  return new Request(`https://math.kilowatto.com/api/${ruta}`, {
    method: "POST",
    headers,
    body: JSON.stringify(cuerpo),
  });
}

// ─── El arnés ────────────────────────────────────────────────────────────────
let fallos = 0;
let corridos = 0;

async function caso(nombre, fn) {
  corridos++;
  try {
    await fn();
    console.log(`  ✓ ${nombre}`);
  } catch (err) {
    fallos++;
    console.error(`  ✗ ${nombre}\n      ${String(err).split("\n")[0]}`);
  }
}

function igual(real, esperado, que) {
  if (real !== esperado) throw new Error(`${que}: esperaba ${JSON.stringify(esperado)}, fue ${JSON.stringify(real)}`);
}

console.log("\npin-datos / pin-entrar / pin-elegir — D-201\n");

// ─── 1. La autorización por dispositivo del hogar (D-012) ────────────────────

await caso("sin cookie de hogar: 403, y no dice si el perfil existe", async () => {
  const { db } = await sembrar();
  const { request, url } = peticionGet("ana", { token: null });
  const res = await PIN_DATOS({ request, locals: contexto(db, kvFalso()), url });
  igual(res.status, 403, "estado");
  igual((await res.json()).error, "sin_permiso", "error");
});

await caso("un hijo de OTRA casa responde igual que uno inexistente (no es oráculo)", async () => {
  const { db } = await sembrar();
  const kv = kvFalso();
  const otra = peticionGet("caro");
  const fantasma = peticionGet("no-existe-jamas");
  const rOtra = await PIN_DATOS({ request: otra.request, locals: contexto(db, kv), url: otra.url });
  const rFantasma = await PIN_DATOS({ request: fantasma.request, locals: contexto(db, kv), url: fantasma.url });
  igual(rOtra.status, rFantasma.status, "los dos estados");
  igual(JSON.stringify(await rOtra.json()), JSON.stringify(await rFantasma.json()), "los dos cuerpos");
  igual(rOtra.status, 403, "estado");
});

await caso("un dispositivo REVOCADO ya no es de la casa", async () => {
  const { raw, db } = await sembrar();
  raw.prepare("UPDATE household_devices SET revoked_at = 1 WHERE device_token = ?").run(TOKEN_HOGAR);
  const { request, url } = peticionGet("ana");
  const res = await PIN_DATOS({ request, locals: contexto(db, kvFalso()), url });
  igual(res.status, 403, "estado");
});

await caso("sin PIN_PAD_SECRET: 503, nunca una rejilla inventada", async () => {
  const { db } = await sembrar();
  const { request, url } = peticionGet("ana");
  const res = await PIN_DATOS({ request, locals: contexto(db, kvFalso(), { sinSecreto: true }), url });
  igual(res.status, 503, "estado");
  igual((await res.json()).error, "sin_bindings", "error");
});

// ─── 2. pin-datos devuelve lo justo ──────────────────────────────────────────

await caso("KINDER recibe 9 dibujos de los 24, y ningún hash", async () => {
  const { db } = await sembrar();
  const { request, url } = peticionGet("ana");
  const res = await PIN_DATOS({ request, locals: contexto(db, kvFalso()), url });
  const cuerpo = await res.json();
  igual(res.status, 200, "estado");
  igual(cuerpo.tipo, "imagenes", "tipo");
  igual(cuerpo.dibujos.length, 9, "cuántos dibujos");
  igual(new Set(cuerpo.dibujos).size, 9, "dibujos distintos");
  igual(cuerpo.yaTienePin, true, "yaTienePin");
  igual(cuerpo.alias, "PatoVeloz1234", "alias");
  if (JSON.stringify(cuerpo).includes("pin_hash")) throw new Error("el hash salió en la respuesta");
});

await caso("dos hermanos ven rejillas DISTINTAS", async () => {
  const { raw, db } = await sembrar();
  // Beto pasa a KINDER solo para que también derive rejilla.
  raw.prepare("UPDATE child_profiles SET theme_band = 'KINDER' WHERE id = 'beto'").run();
  const kv = kvFalso();
  const a = peticionGet("ana");
  const b = peticionGet("beto");
  const ra = await (await PIN_DATOS({ request: a.request, locals: contexto(db, kv), url: a.url })).json();
  const rb = await (await PIN_DATOS({ request: b.request, locals: contexto(db, kv), url: b.url })).json();
  if (JSON.stringify(ra.dibujos) === JSON.stringify(rb.dibujos)) {
    throw new Error("los dos hermanos vieron la MISMA rejilla: la derivación no usa el childProfileId");
  }
});

await caso("PRIMARIA no recibe rejilla: el teclado no se deriva de nada", async () => {
  const { db } = await sembrar();
  const { request, url } = peticionGet("beto");
  const cuerpo = await (await PIN_DATOS({ request, locals: contexto(db, kvFalso()), url })).json();
  igual(cuerpo.tipo, "numerico", "tipo");
  igual(cuerpo.dibujos.length, 0, "dibujos");
  igual(cuerpo.yaTienePin, false, "yaTienePin");
});

// ─── 3. pin-entrar ───────────────────────────────────────────────────────────

await caso("el PIN correcto entra y emite la cookie de niño", async () => {
  const { db } = await sembrar();
  const kv = kvFalso();
  const res = await PIN_ENTRAR({
    request: peticionPost("pin-entrar", { childId: "ana", posiciones: [0, 4, 7] }),
    locals: contexto(db, kv),
  });
  const cuerpo = await res.json();
  igual(res.status, 200, "estado");
  igual(cuerpo.ok, true, "ok");
  igual(cuerpo.destino, "/es-MX/app/kids/mapa/", "destino");
  const cookie = res.headers.get("set-cookie") ?? "";
  if (!cookie.startsWith("mc_k=")) throw new Error(`sin cookie de niño: ${cookie}`);
  if (!cookie.includes("HttpOnly")) throw new Error("la cookie de niño no es HttpOnly");
  igual(kv._guardado.size, 1, "sesiones abiertas en KV");
});

await caso("el PIN incorrecto NO entra, sin castigo y sin decir por qué", async () => {
  const { db } = await sembrar();
  const kv = kvFalso();
  const res = await PIN_ENTRAR({
    request: peticionPost("pin-entrar", { childId: "ana", posiciones: [1, 2, 3] }),
    locals: contexto(db, kv),
  });
  igual(res.status, 200, "estado (nunca 401/403: sería un oráculo)");
  igual((await res.json()).ok, false, "ok");
  igual(res.headers.get("set-cookie"), null, "no se emite cookie");
  /**
   * Desde D-202 esto ya NO significa "no se escribió nada en KV" — significa
   * "no se abrió sesión". Antes de D-202 las dos frases eran la misma
   * aserción porque KV solo se usaba para sesiones; ahora `anotarFallo`
   * (`lib/pin-intentos.ts`) también escribe ahí, a propósito, y es lo que
   * sostiene el límite de intentos obligatorio desde ese mismo D-202. La
   * aserción vieja (`kv._guardado.size === 0`) se habría puesto en rojo por
   * el motivo correcto — el fallo SÍ se cuenta— y hubiera leído como una
   * regresión sin serlo. Se corrige a lo que de verdad importa: sin llave de
   * sesión (`k:`), y con exactamente el contador de fallos que toca.
   */
  const llaves = [...kv._guardado.keys()];
  if (llaves.some((k) => k.startsWith("k:"))) throw new Error("se abrió sesión con un PIN incorrecto");
  igual(llaves.length, 1, "entradas en KV — solo el contador de fallos");
  igual(llaves[0], "pin-fallos:ana", "la clave es el contador de D-202, no una sesión");
});

await caso("tres toques a la MISMA casilla no son un PIN válido", async () => {
  const { db } = await sembrar();
  const res = await PIN_ENTRAR({
    request: peticionPost("pin-entrar", { childId: "ana", posiciones: [4, 4, 4] }),
    locals: contexto(db, kvFalso()),
  });
  igual((await res.json()).ok, false, "ok");
});

await caso("EL HUECO CERRADO: un perfil sin PIN ya no entra de largo", async () => {
  const { db } = await sembrar({ conPinDeAna: false });
  const kv = kvFalso();
  const res = await PIN_ENTRAR({
    request: peticionPost("pin-entrar", { childId: "ana", posiciones: [0, 4, 7] }),
    locals: contexto(db, kv),
  });
  const cuerpo = await res.json();
  igual(cuerpo.ok, false, "ok");
  igual(cuerpo.error, "sin_pin", "error");
  igual(res.headers.get("set-cookie"), null, "no se emite cookie");
  igual(kv._guardado.size, 0, "NO se abrió sesión para un perfil sin PIN");
});

await caso("0-RTT: early-data se rechaza con 425 y no toca la base", async () => {
  const { db } = await sembrar();
  const kv = kvFalso();
  const res = await PIN_ENTRAR({
    request: peticionPost("pin-entrar", { childId: "ana", posiciones: [0, 4, 7] }, { earlyData: true }),
    locals: contexto(db, kv),
  });
  igual(res.status, 425, "estado");
  igual(kv._guardado.size, 0, "no se abrió sesión");
});

await caso("un PIN numérico no sirve para un perfil de imágenes", async () => {
  const { db } = await sembrar();
  const res = await PIN_ENTRAR({
    request: peticionPost("pin-entrar", { childId: "ana", digitos: [1, 2, 3, 4] }),
    locals: contexto(db, kvFalso()),
  });
  igual((await res.json()).ok, false, "ok");
});

await caso("el tipo lo manda la BASE, no el cliente", async () => {
  // Beto es PRIMARIA pero con un PIN de IMÁGENES ya guardado (un perfil que
  // cambió de banda después de fijarlo). Debe verificarse como imágenes.
  const { raw, db } = await sembrar();
  const hash = await hashearPin(SECRETO, "beto", [1, 3, 5]);
  raw
    .prepare(
      "INSERT INTO child_image_pin (child_profile_id, pin_hash, tipo, created_at, updated_at) " +
        "VALUES ('beto', ?, 'imagenes', 0, 0)",
    )
    .run(hash);
  const res = await PIN_ENTRAR({
    request: peticionPost("pin-entrar", { childId: "beto", posiciones: [1, 3, 5] }),
    locals: contexto(db, kvFalso()),
  });
  igual((await res.json()).ok, true, "entra con el tipo guardado, no con el de su banda");
});

// ─── 4. pin-elegir ───────────────────────────────────────────────────────────

await caso("un perfil sin PIN puede fijar el suyo, y entra", async () => {
  const { raw, db } = await sembrar({ conPinDeAna: false });
  const kv = kvFalso();
  const res = await PIN_ELEGIR({
    request: peticionPost("pin-elegir", { childId: "ana", posiciones: [2, 5, 8] }),
    locals: contexto(db, kv),
  });
  const cuerpo = await res.json();
  igual(res.status, 200, "estado");
  igual(cuerpo.ok, true, "ok");
  igual(cuerpo.tipo, "imagenes", "tipo");
  if (!(res.headers.get("set-cookie") ?? "").startsWith("mc_k=")) throw new Error("no entró tras elegir");

  const fila = raw.prepare("SELECT pin_hash, tipo FROM child_image_pin WHERE child_profile_id='ana'").get();
  if (!fila) throw new Error("no quedó fila en child_image_pin");
  igual(fila.tipo, "imagenes", "tipo guardado");
  igual(fila.pin_hash, await hashearPin(SECRETO, "ana", [2, 5, 8]), "hash guardado");
});

await caso("EL CANDADO: un hermano no puede recambiar el PIN de otro", async () => {
  const { raw, db } = await sembrar(); // Ana YA tiene PIN [0,4,7]
  const antes = raw.prepare("SELECT pin_hash FROM child_image_pin WHERE child_profile_id='ana'").get().pin_hash;
  const res = await PIN_ELEGIR({
    request: peticionPost("pin-elegir", { childId: "ana", posiciones: [1, 2, 3] }),
    locals: contexto(db, kvFalso()),
  });
  igual(res.status, 409, "estado");
  igual((await res.json()).error, "ya_tiene_pin", "error");
  const despues = raw.prepare("SELECT pin_hash FROM child_image_pin WHERE child_profile_id='ana'").get().pin_hash;
  igual(despues, antes, "el hash NO cambió");
});

await caso("el PIN viejo sigue entrando después de un intento de recambio", async () => {
  const { db } = await sembrar();
  await PIN_ELEGIR({
    request: peticionPost("pin-elegir", { childId: "ana", posiciones: [1, 2, 3] }),
    locals: contexto(db, kvFalso()),
  });
  const res = await PIN_ENTRAR({
    request: peticionPost("pin-entrar", { childId: "ana", posiciones: [0, 4, 7] }),
    locals: contexto(db, kvFalso()),
  });
  igual((await res.json()).ok, true, "el PIN original sigue siendo el bueno");
});

await caso("PRIMARIA fija un PIN numérico de 4 dígitos, repetidos permitidos", async () => {
  const { raw, db } = await sembrar();
  const res = await PIN_ELEGIR({
    request: peticionPost("pin-elegir", { childId: "beto", digitos: [1, 1, 1, 1] }),
    locals: contexto(db, kvFalso()),
  });
  igual((await res.json()).ok, true, "ok");
  const fila = raw.prepare("SELECT pin_hash, tipo FROM child_image_pin WHERE child_profile_id='beto'").get();
  igual(fila.tipo, "numerico", "tipo guardado");
  igual(fila.pin_hash, await hashearPinNumerico(SECRETO, "beto", [1, 1, 1, 1]), "hash guardado");
});

await caso("un PIN mal formado no se guarda: 422 y la tabla sigue vacía", async () => {
  const { raw, db } = await sembrar({ conPinDeAna: false });
  const res = await PIN_ELEGIR({
    request: peticionPost("pin-elegir", { childId: "ana", posiciones: [0, 1] }),
    locals: contexto(db, kvFalso()),
  });
  igual(res.status, 422, "estado");
  igual(raw.prepare("SELECT COUNT(*) c FROM child_image_pin").get().c, 0, "filas escritas");
});

await caso("elegir el PIN de un hijo de otra casa: 403, y nada escrito", async () => {
  const { raw, db } = await sembrar();
  const res = await PIN_ELEGIR({
    request: peticionPost("pin-elegir", { childId: "caro", posiciones: [1, 2, 3] }),
    locals: contexto(db, kvFalso()),
  });
  igual(res.status, 403, "estado");
  igual(raw.prepare("SELECT COUNT(*) c FROM child_image_pin WHERE child_profile_id='caro'").get().c, 0, "filas");
});

await caso("0-RTT también se rechaza al elegir", async () => {
  const { raw, db } = await sembrar({ conPinDeAna: false });
  const res = await PIN_ELEGIR({
    request: peticionPost("pin-elegir", { childId: "ana", posiciones: [2, 5, 8] }, { earlyData: true }),
    locals: contexto(db, kvFalso()),
  });
  igual(res.status, 425, "estado");
  igual(raw.prepare("SELECT COUNT(*) c FROM child_image_pin").get().c, 0, "filas escritas");
});

// ─── 5. Las cabeceras que se heredaron de kids/pin.astro ─────────────────────

await caso("ninguna respuesta se puede cachear, y varían por cookie", async () => {
  const { db } = await sembrar();
  const { request, url } = peticionGet("ana");
  const res = await PIN_DATOS({ request, locals: contexto(db, kvFalso()), url });
  igual(res.headers.get("cache-control"), "no-store, private", "cache-control");
  igual(res.headers.get("vary"), "cookie", "vary");
  igual(res.headers.get("referrer-policy"), "same-origin", "referrer-policy");
});

console.log(`\n${corridos - fallos}/${corridos} casos\n`);
if (fallos > 0) process.exit(1);
