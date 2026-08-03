#!/usr/bin/env node
// Auditor determinista — los tres portones del duelo, y ninguna presencia
//
// Hace cumplir: #244, D-018, D-053, **D-081 condición 2** («sin presencia en
// vivo… no revela si el otro está conectado, y eso es lo que impide que un niño
// se quede esperando»), líneas rojas #2 y #3, `mc-17`, `mc-19`.
//
// ─── Los tres portones ─────────────────────────────────────────────────────
//
// Un duelo solo se puede crear si se cumplen las tres cosas a la vez:
//
//   1. banda distinta de KINDER,
//   2. edad ≥ 8 calculada desde `birth_year` (D-053 quitó el mes),
//   3. opt-in activo — default APAGADO en un perfil de niño, encendido en una
//      cuenta de adulto, que consiente por sí misma.
//
// #244 lo pide con estas palabras: «falla si el código de creación de
// `league_duel` no verifica los tres portones».
//
// ─── Por qué se EJECUTA y no se lee ────────────────────────────────────────
//
// D-070: ninguna comprobación puede ser cierta por construcción. Un auditor que
// buscara la cadena `"KINDER"` en `duelo.ts` pasaría en verde con un
// `puedeRetar` que devuelve `{puede:true}` siempre — la cadena seguiría ahí, en
// el tipo. Así que los portones se ejercitan uno por uno, incluido el caso
// límite de la edad, que es donde D-053 deja una imprecisión conocida.
//
// ─── La presencia ──────────────────────────────────────────────────────────
//
// La condición 2 de D-081 no admite matiz, y es de las que se rompe por
// utilidad: un `last_seen` para «saber si vale la pena retarlo», un `en_linea`
// para pintar un punto verde. Los dos convierten un reto asíncrono en una sala
// de espera, y quien espera es un niño.
//
// LO QUE NO PUEDE COMPROBAR: que la ruta que cree el duelo tenga sesión válida
// del retador. Eso es autenticación y lo cubre otro camino.

import { archivos, leer, informar, SOLO_PRODUCTO, sinComentarios, palabra } from "./lib/repo.mjs";

const problemas = [];
const notas = [];
let comprobaciones = 0;

const duelo = await import("../packages/motor/src/duelo.ts").catch((e) => {
  problemas.push(`no pude importar packages/motor/src/duelo.ts: ${String(e).slice(0, 120)}`);
  return null;
});

// ─── 1. Los tres portones, ejecutados ───────────────────────────────────────

if (duelo) {
  const ANIO = 2026;
  const base = { banda: "PRIMARIA", birth_year: 2015, opt_in: true, pendientes_salientes: 0 };

  const casos = [
    [{ ...base, banda: "KINDER" }, "banda_kinder", "KINDER no duela: es la banda entera, no la edad"],
    [{ ...base, birth_year: ANIO - 7 }, "edad_insuficiente", "edad ≥ 8 desde birth_year (D-053)"],
    [{ ...base, opt_in: false }, "sin_opt_in", "opt-in activo, default apagado en un perfil de niño"],
    [
      { ...base, pendientes_salientes: 3 },
      "tope_de_pendientes",
      "máximo 3 duelos salientes pendientes (#244)",
    ],
  ];

  for (const [retador, motivo, que] of casos) {
    comprobaciones++;
    const r = duelo.puedeRetar(retador, ANIO);
    if (r.puede) {
      problemas.push(
        `\`puedeRetar\` dejó pasar un caso que tenía que rechazar por «${motivo}» — ${que}.`,
      );
    } else if (r.motivo !== motivo) {
      problemas.push(
        `\`puedeRetar\` rechazó por «${r.motivo}» donde tenía que rechazar por «${motivo}» — ${que}. ` +
          "El motivo llega a una pantalla en siete locales; equivocarlo enseña el texto que no es.",
      );
    }
  }

  // El control positivo. Sin él, un `puedeRetar` que rechace SIEMPRE pasaría
  // los cuatro casos de arriba — que es la regla cierta por construcción que
  // D-070 nombra.
  comprobaciones++;
  if (!duelo.puedeRetar(base, ANIO).puede) {
    problemas.push(
      "`puedeRetar` rechaza un caso válido (PRIMARIA, 11 años, opt-in activo, sin pendientes). " +
        "Un portón que cierra siempre pasa todos los casos negativos y no vigila nada (D-070).",
    );
  }

  // Un adulto: `birth_year` es null porque su cuenta ya es de adulto, y no se
  // le pide el año. El portón de edad no puede rechazarlo por eso.
  comprobaciones++;
  const adulto = duelo.puedeRetar(
    { banda: "SERIO", birth_year: null, opt_in: true, pendientes_salientes: 0 },
    ANIO,
  );
  if (!adulto.puede) {
    problemas.push(
      `un adulto aprendiz sin \`birth_year\` fue rechazado por «${adulto.motivo}». D-053 solo pide ` +
        "el año AL NIÑO; una cuenta de adulto no tiene esa columna y no puede quedar fuera por " +
        "no tenerla.",
    );
  }

  // La ventana es de 48 h y el ganador se decide por puntos, jamás por quién
  // terminó antes (#244).
  comprobaciones++;
  const d = duelo.crearDuelo({
    id: "d1",
    cohort_id: "c1",
    challenger_membership_id: "a",
    challenged_membership_id: "b",
    item_set: ["i1", "i2"],
    ahora: 0,
  });
  if (d.expires_at - d.created_at !== 48 * 3600 * 1000) {
    problemas.push(`la ventana del duelo es de ${(d.expires_at - d.created_at) / 3600000} h y #244 pide 48.`);
  }
  const gana = duelo.resolver(d, { challenger: 10, challenged: 90 }, 1);
  if (gana.estado !== "JUGADO" || gana.winner_membership_id !== "b") {
    problemas.push(
      "el ganador no se decidió por puntos del set compartido. #244: nunca por tiempo de " +
        "finalización relativo — eso convierte un reto asíncrono en una carrera, y una carrera " +
        "necesita saber cuándo empezó el otro, que es presencia con otro nombre.",
    );
  }
  const expirado = duelo.resolver(d, { challenger: 10, challenged: null }, d.expires_at);
  if (expirado.estado !== "EXPIRADO") {
    problemas.push("un duelo sin respuesta pasada la ventana no quedó EXPIRADO.");
  }
  if ("winner_membership_id" in expirado) {
    problemas.push(
      "un duelo expirado produjo ganador. Rechazar es silencioso (#244): si expirar diera la " +
        "victoria al retador, el silencio de un niño se convertiría en un premio para otro.",
    );
  }
}

// ─── 2. Toda creación de `league_duel` pasa por `puedeRetar` ────────────────

const fuentes = archivos(/\.(ts|tsx|js|mjs|astro)$/)
  .filter((f) => SOLO_PRODUCTO.test(f))
  .filter((f) => !/\.prueba\.mjs$/.test(f));

let creadores = 0;
for (const archivo of fuentes) {
  const texto = sinComentarios(leer(archivo) ?? "");
  if (!/INSERT\s+INTO\s+league_duel/i.test(texto) && !/crearDuelo\s*\(/.test(texto)) continue;
  if (archivo.endsWith("packages/motor/src/duelo.ts")) continue;
  creadores++;
  comprobaciones++;
  if (!/puedeRetar\s*\(/.test(texto)) {
    problemas.push(
      `${archivo} crea un duelo sin llamar a \`puedeRetar\`. #244 pide los tres portones EN LA ` +
        "creación: la regla no se rompe borrándola, se rompe cuando una segunda ruta crea el " +
        "duelo sin pasar por ella porque «ya se comprobó antes».",
    );
  }
}

// ─── 3. Ninguna señal de presencia (D-081 condición 2) ──────────────────────

const PRESENCIA = palabra(
  "last_seen", "ultima_conexion", "online", "en_linea", "is_online", "connected_at",
  "presence", "presencia", "typing", "escribiendo", "heartbeat", "latido",
);

const sociales = fuentes.filter((f) => /(duel|duelo|liga|league)/i.test(f));
for (const archivo of sociales) {
  comprobaciones++;
  const texto = sinComentarios(leer(archivo) ?? "");
  const m = texto.match(PRESENCIA);
  if (m) {
    problemas.push(
      `${archivo}: señal de presencia (\`${m[0]}\`). D-081 condición 2: el duelo es asíncrono y ` +
        "NO revela si el otro está conectado — es lo que impide que un niño se quede esperando " +
        "delante de la pantalla a que el otro aparezca.",
    );
  }
}

const migraciones = archivos(/^migrations\/.*\.sql$/);
for (const archivo of migraciones) {
  const sql = leer(archivo) ?? "";
  for (const m of sql.matchAll(/CREATE\s+TABLE\s+(league_[a-z_]+)\s*\(([\s\S]*?)\n\);/gi)) {
    comprobaciones++;
    const p = m[2].replace(/--[^\n]*/g, "").match(PRESENCIA);
    if (p) {
      problemas.push(
        `${archivo} · ${m[1]} tiene una columna de presencia (\`${p[0]}\`). Una columna así no ` +
          "está vacía: existe, y se llena. D-081 condición 2.",
      );
    }
  }
}

notas.push(`${comprobaciones} comprobación(es), la mayoría EJECUTADAS sobre el motor`);
notas.push(`${creadores} creador(es) de duelo en el árbol de producto`);
if (creadores === 0) {
  notas.push(
    "todavía no hay ninguna ruta que cree un duelo: el motor está y la superficie no. Este " +
      "auditor bloquea el día que se escriba la primera, que es cuando se comete el error.",
  );
}

informar({
  nombre: "duelo-elegibilidad",
  problemas,
  notas,
  cita: "#244, D-018, D-053, D-081 condición 2, líneas rojas #2 y #3, mc-17, mc-19",
  revisados: comprobaciones,
  resumen: `${comprobaciones} comprobación(es) sobre los portones y la ausencia de presencia`,
  porQueBloquea:
    "los tres portones son lo único que separa un duelo de un canal entre dos menores, y la " +
    "presencia es lo que convierte un reto asíncrono en una espera delante de una pantalla.",
  noComprueba: [
    "que la ruta que crea el duelo tenga sesión válida del retador. Eso es autenticación y lo " +
      "cubre otro camino.",
  ],
});
