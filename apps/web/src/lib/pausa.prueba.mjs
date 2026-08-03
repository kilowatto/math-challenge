#!/usr/bin/env node
// El camino de la pausa familiar — #204.
//
//     node --experimental-strip-types apps/web/src/lib/pausa.prueba.mjs
//
// Qué defiende, y por qué no lo puede defender el motor. `racha.prueba.mjs` ya
// prueba `declararPausa()` — el rango de 21 días, el tope de 4 al año, la
// ventana de 5, todo eso es puro. Lo que NO puede probar un módulo puro es el
// camino que sí puede hacer daño de verdad:
//
//   · que un padre NO puede declarar la pausa del hijo de OTRO (la línea roja
//     #2 hecha consulta: si la autorización se escribe mal, no da error — da
//     un desconocido tocando la racha de un niño);
//   · que el rechazo al sexto día retroactivo llega intacto hasta la base, con
//     SQL de verdad y no con un simulacro;
//   · que el reenvío del MISMO formulario no gasta dos de las cuatro pausas
//     del año — el motor es puro y siempre cobra; la idempotencia es del
//     cable, y si se rompe no da error: da un padre que perdió una pausa por
//     pulsar dos veces.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { DatabaseSync } from "node:sqlite";
import {
  declararPausaFamiliar,
  leerEstadoRacha,
  perfilPropio,
} from "./progreso.ts";

// El esquema mínimo, con las MISMAS columnas que toca el cable y los mismos
// índices únicos parciales de la migración 0007 — sin ellos, el
// `ON CONFLICT ... WHERE` del upsert no tiene árbitro y la prueba probaría un
// SQL que no es el de producción.
const ESQUEMA = `
CREATE TABLE users (id TEXT PRIMARY KEY, timezone TEXT);
CREATE TABLE child_profiles (
  id TEXT PRIMARY KEY,
  parent_user_id TEXT NOT NULL,
  alias TEXT,
  deleted_at INTEGER
);
CREATE TABLE child_streak (
  id TEXT PRIMARY KEY,
  child_profile_id TEXT,
  user_id TEXT,
  current_streak INTEGER NOT NULL DEFAULT 0,
  max_streak INTEGER NOT NULL DEFAULT 0,
  last_completed_local_date TEXT,
  shields_available INTEGER NOT NULL DEFAULT 0,
  shields_earned_total INTEGER NOT NULL DEFAULT 0,
  shields_earned_this_streak INTEGER NOT NULL DEFAULT 0,
  pause_until_local_date TEXT,
  pause_uses_this_year INTEGER NOT NULL DEFAULT 0,
  pause_year INTEGER,
  days_played_total INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  CHECK ((child_profile_id IS NOT NULL) <> (user_id IS NOT NULL))
);
CREATE UNIQUE INDEX idx_child_streak_perfil ON child_streak (child_profile_id)
  WHERE child_profile_id IS NOT NULL;
CREATE UNIQUE INDEX idx_child_streak_usuario ON child_streak (user_id)
  WHERE user_id IS NOT NULL;
`;

/** El adaptador D1 mínimo sobre node:sqlite (el mismo patrón que push-hogares). */
function adaptar(db) {
  // node:sqlite no admite un parámetro numerado REUSADO (`?1` dos veces) con
  // binding posicional — D1 sí. Se expande: cada `?N` se reemplaza por `?` y
  // el argumento se duplica en su posición. Con `?` posicionales (el estilo de
  // progreso.ts) los argumentos pasan tal cual. Solo vive en la prueba.
  const expandir = (sql, args) => {
    if (!/\?\d+/.test(sql)) return [sql, args];
    const salida = [];
    const nuevo = sql.replace(/\?(\d+)/g, (_, n) => {
      salida.push(args[Number(n) - 1]);
      return "?";
    });
    return [nuevo, salida];
  };
  return {
    prepare(sql) {
      let args = [];
      const bound = {
        bind(...a) {
          args = a;
          return bound;
        },
        async all() {
          const [nuevo, salida] = expandir(sql, args);
          return { results: db.prepare(nuevo).all(...salida) };
        },
        async first() {
          const [nuevo, salida] = expandir(sql, args);
          return db.prepare(nuevo).get(...salida) ?? null;
        },
        async run() {
          const [nuevo, salida] = expandir(sql, args);
          return db.prepare(nuevo).run(...salida);
        },
      };
      return bound;
    },
  };
}

/** Base en memoria con dos padres y un hijo del primero. */
function base() {
  const raw = new DatabaseSync(":memory:");
  raw.exec(ESQUEMA);
  raw.prepare("INSERT INTO users (id, timezone) VALUES ('padre', 'UTC'), ('otro', 'UTC')").run();
  raw.prepare(
    "INSERT INTO child_profiles (id, parent_user_id, alias) VALUES ('hijo1', 'padre', 'Conejo')",
  ).run();
  const env = { DB: adaptar(raw) };
  return { raw, env };
}

/** Siembra una racha para el hijo (o para el adulto, con `user:`). */
function sembrarRacha(raw, duenio, campos) {
  const columna = duenio.user ? "user_id" : "child_profile_id";
  const id = duenio.user ?? duenio.child;
  raw.prepare(
    `INSERT INTO child_streak (id, ${columna}, current_streak, max_streak, last_completed_local_date, pause_uses_this_year, pause_year)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    crypto.randomUUID(),
    id,
    campos.racha ?? 5,
    campos.racha ?? 5,
    campos.ultimo ?? null,
    campos.usadas ?? 0,
    campos.anio ?? null,
  );
}

// Mediodía UTC del día que la prueba trata como «hoy»: 2026-08-03.
const AHORA = Date.UTC(2026, 7, 3, 12);

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

console.log("\npausa familiar — el camino de la ruta (#204)\n");

await caso("el padre dueño declara una pausa prospectiva y aterriza en la base", async () => {
  const { raw, env } = base();
  sembrarRacha(raw, { child: "hijo1" }, { ultimo: "2026-08-02" });
  const r = await declararPausaFamiliar(env, "padre", {
    hijoId: "hijo1",
    desde: "2026-08-10",
    hasta: "2026-08-20",
    ahora: AHORA,
  });
  igual(r.ok, true, "declarada");
  igual(r.estado.pause_until_local_date, "2026-08-20", "hasta");
  igual(r.estado.pause_uses_this_year, 1, "un uso");
  const fila = raw.prepare("SELECT pause_until_local_date, pause_uses_this_year FROM child_streak WHERE child_profile_id = 'hijo1'").get();
  igual(fila.pause_until_local_date, "2026-08-20", "escrita en la base");
  igual(fila.pause_uses_this_year, 1, "uso escrito en la base");
});

await caso("otro padre NO puede declarar la pausa de un hijo ajeno (sin_permiso, y nada se escribe)", async () => {
  const { raw, env } = base();
  sembrarRacha(raw, { child: "hijo1" }, { ultimo: "2026-08-02" });
  const r = await declararPausaFamiliar(env, "otro", {
    hijoId: "hijo1",
    desde: "2026-08-10",
    hasta: "2026-08-20",
    ahora: AHORA,
  });
  igual(r.ok, false, "rechazada");
  igual(r.motivo, "sin_permiso", "motivo");
  const fila = raw.prepare("SELECT pause_until_local_date FROM child_streak WHERE child_profile_id = 'hijo1'").get();
  igual(fila.pause_until_local_date, null, "la base no se tocó");
});

await caso("un perfil que no existe tampoco da permiso (fallar cerrado, no fallar abierto)", async () => {
  const { env } = base();
  const r = await declararPausaFamiliar(env, "padre", {
    hijoId: "fantasma",
    desde: "2026-08-10",
    hasta: "2026-08-20",
    ahora: AHORA,
  });
  igual(r.ok, false, "rechazada");
  igual(r.motivo, "sin_permiso", "motivo");
});

await caso("una pausa de 22 días se rechaza citando el tope (pausa_demasiado_larga)", async () => {
  const { raw, env } = base();
  sembrarRacha(raw, { child: "hijo1" }, {});
  const r = await declararPausaFamiliar(env, "padre", {
    hijoId: "hijo1",
    desde: "2026-08-01",
    hasta: "2026-08-22",
    ahora: AHORA,
  });
  igual(r.ok, false, "rechazada");
  igual(r.motivo, "pausa_demasiado_larga", "motivo");
  if (!r.mensaje.includes("21")) throw new Error(`el mensaje no cita el tope: ${r.mensaje}`);
});

await caso("la quinta pausa del año se rechaza citando el tope anual (tope_anual)", async () => {
  const { raw, env } = base();
  sembrarRacha(raw, { child: "hijo1" }, { usadas: 4, anio: 2026, ultimo: "2026-08-02" });
  const r = await declararPausaFamiliar(env, "padre", {
    hijoId: "hijo1",
    desde: "2026-08-10",
    hasta: "2026-08-12",
    ahora: AHORA,
  });
  igual(r.ok, false, "rechazada");
  igual(r.motivo, "tope_anual", "motivo");
  if (!r.mensaje.includes("4")) throw new Error(`el mensaje no cita el tope: ${r.mensaje}`);
});

await caso("el contador es por año calendario: 4 usadas en 2025 no descuentan 2026", async () => {
  const { raw, env } = base();
  sembrarRacha(raw, { child: "hijo1" }, { usadas: 4, anio: 2025, ultimo: "2026-08-02" });
  const r = await declararPausaFamiliar(env, "padre", {
    hijoId: "hijo1",
    desde: "2026-08-10",
    hasta: "2026-08-12",
    ahora: AHORA,
  });
  igual(r.ok, true, "aceptada en el año nuevo");
  igual(r.estado.pause_uses_this_year, 1, "el contador volvió a empezar");
  igual(r.estado.pause_year, 2026, "año anotado");
});

await caso("retroactiva al QUINTO día desde el último cumplido: se acepta", async () => {
  const { raw, env } = base();
  sembrarRacha(raw, { child: "hijo1" }, { ultimo: "2026-07-29" }); // hoy - 5
  const r = await declararPausaFamiliar(env, "padre", {
    hijoId: "hijo1",
    desde: "2026-07-30",
    hasta: "2026-08-02",
    ahora: AHORA,
  });
  igual(r.ok, true, "aceptada dentro de la ventana");
});

await caso("retroactiva al SEXTO día desde el último cumplido: se rechaza (fuera_de_la_ventana)", async () => {
  const { raw, env } = base();
  sembrarRacha(raw, { child: "hijo1" }, { ultimo: "2026-07-28" }); // hoy - 6
  const r = await declararPausaFamiliar(env, "padre", {
    hijoId: "hijo1",
    desde: "2026-07-29",
    hasta: "2026-08-02",
    ahora: AHORA,
  });
  igual(r.ok, false, "rechazada");
  igual(r.motivo, "fuera_de_la_ventana", "motivo");
  const fila = raw.prepare("SELECT pause_until_local_date FROM child_streak WHERE child_profile_id = 'hijo1'").get();
  igual(fila.pause_until_local_date, null, "la base no se tocó");
});

await caso("retroactiva sin ningún día cumplido: sin_dia_que_reparar", async () => {
  const { raw, env } = base();
  sembrarRacha(raw, { child: "hijo1" }, { ultimo: null });
  const r = await declararPausaFamiliar(env, "padre", {
    hijoId: "hijo1",
    desde: "2026-07-29",
    hasta: "2026-08-02",
    ahora: AHORA,
  });
  igual(r.ok, false, "rechazada");
  igual(r.motivo, "sin_dia_que_reparar", "motivo");
});

await caso("el MISMO envío dos veces gasta UNA pausa, no dos (idempotencia del transporte)", async () => {
  const { raw, env } = base();
  sembrarRacha(raw, { child: "hijo1" }, { ultimo: "2026-08-02" });
  const entrada = { hijoId: "hijo1", desde: "2026-08-10", hasta: "2026-08-20", ahora: AHORA };
  const primera = await declararPausaFamiliar(env, "padre", entrada);
  igual(primera.ok, true, "primera aceptada");
  igual(primera.yaCubierta, false, "primera sí escribió");
  const segunda = await declararPausaFamiliar(env, "padre", entrada);
  igual(segunda.ok, true, "el reenvío no es un error");
  igual(segunda.yaCubierta, true, "el reenvío es un no-op");
  const fila = raw.prepare("SELECT pause_uses_this_year FROM child_streak WHERE child_profile_id = 'hijo1'").get();
  igual(fila.pause_uses_this_year, 1, "una sola pausa gastada");
});

await caso("una pausa NUEVA que llega más lejos sí gasta su uso (el atajo no la traga)", async () => {
  const { raw, env } = base();
  sembrarRacha(raw, { child: "hijo1" }, { ultimo: "2026-08-02" });
  await declararPausaFamiliar(env, "padre", {
    hijoId: "hijo1", desde: "2026-08-10", hasta: "2026-08-12", ahora: AHORA,
  });
  const r = await declararPausaFamiliar(env, "padre", {
    hijoId: "hijo1", desde: "2026-08-10", hasta: "2026-08-20", ahora: AHORA,
  });
  igual(r.ok, true, "aceptada");
  igual(r.yaCubierta, false, "no es un eco: extiende");
  igual(r.estado.pause_uses_this_year, 2, "dos usos");
  igual(r.estado.pause_until_local_date, "2026-08-20", "queda la más larga");
});

await caso("rango invertido: rango_invertido", async () => {
  const { raw, env } = base();
  sembrarRacha(raw, { child: "hijo1" }, { ultimo: "2026-08-02" });
  const r = await declararPausaFamiliar(env, "padre", {
    hijoId: "hijo1",
    desde: "2026-08-20",
    hasta: "2026-08-10",
    ahora: AHORA,
  });
  igual(r.ok, false, "rechazada");
  igual(r.motivo, "rango_invertido", "motivo");
});

await caso("una fecha mal formada: fecha_invalida, sin tocar la base", async () => {
  const { raw, env } = base();
  sembrarRacha(raw, { child: "hijo1" }, { ultimo: "2026-08-02" });
  const r = await declararPausaFamiliar(env, "padre", {
    hijoId: "hijo1",
    desde: "10/08/2026",
    hasta: "2026-08-20",
    ahora: AHORA,
  });
  igual(r.ok, false, "rechazada");
  igual(r.motivo, "fecha_invalida", "motivo");
});

await caso("el adulto aprendiz se autodeclara (user_id, sin hijo, sin terceros)", async () => {
  const { raw, env } = base();
  sembrarRacha(raw, { user: "padre" }, { ultimo: "2026-08-02" });
  const r = await declararPausaFamiliar(env, "padre", {
    hijoId: null,
    desde: "2026-08-10",
    hasta: "2026-08-20",
    ahora: AHORA,
  });
  igual(r.ok, true, "declarada");
  const fila = raw.prepare("SELECT pause_until_local_date, pause_uses_this_year FROM child_streak WHERE user_id = 'padre'").get();
  igual(fila.pause_until_local_date, "2026-08-20", "escrita por la llave del adulto");
  igual(fila.pause_uses_this_year, 1, "un uso");
});

await caso("perfilPropio devuelve el alias solo al padre dueño", async () => {
  const { env } = base();
  const propio = await perfilPropio(env, "hijo1", "padre");
  igual(propio?.alias, "Conejo", "el dueño ve su perfil");
  const ajeno = await perfilPropio(env, "hijo1", "otro");
  igual(ajeno, null, "el ajeno no ve nada");
});

await caso("leerEstadoRacha devuelve el estado sembrado, por las dos llaves", async () => {
  const { raw, env } = base();
  sembrarRacha(raw, { child: "hijo1" }, { ultimo: "2026-08-02", usadas: 2, anio: 2026 });
  const e1 = await leerEstadoRacha(env, { id: "hijo1", esAdulto: false });
  igual(e1.pause_uses_this_year, 2, "usadas del hijo");
  sembrarRacha(raw, { user: "padre" }, { ultimo: "2026-08-01" });
  const e2 = await leerEstadoRacha(env, { id: "padre", esAdulto: true });
  igual(e2.last_completed_local_date, "2026-08-01", "estado del adulto");
});

if (fallos > 0) {
  console.error(`\n✗ ${fallos} de ${corridos} casos fallaron`);
  process.exit(1);
}
console.log(`\n✓ ${corridos} casos`);
