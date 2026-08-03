#!/usr/bin/env node
// Auditor determinista — el ascenso y el descenso son determinables y reproducibles
//
// Hace cumplir: **D-056** (7/30 suben, 5/30 bajan — las cifras reales de
// Duolingo, no el «10% inferior» sin verificar de master-plan §6), D-014, #241.
//
// ─── Por qué se EJECUTA el motor en vez de leerlo ──────────────────────────
//
// D-070: ninguna comprobación de un auditor puede ser cierta por construcción.
// Un auditor que buscara la cadena «7/30» en `liga.ts` pasaría en verde con un
// `cerrarCiclo` que reparte al azar, siempre que la constante siguiera escrita.
// Y la trampa que se midió el 2026-08-02 es exactamente ésa: **una regla
// escrita "por tipo de evento" nunca puede fallar**.
//
// Así que este auditor importa el módulo y lo corre:
//
//   · las cifras de D-056 se leen de `docs/decisions.md` y se cruzan contra las
//     constantes del motor — el documento manda, y si difieren el auditor no
//     decide cuál tiene razón: dice que difieren y para el commit;
//   · el reparto se ejecuta y se compara contra el resultado esperado;
//   · **el mismo cierre se corre dos veces con las filas barajadas** y tiene
//     que dar exactamente lo mismo. Es lo que #241 pide con «reintentos
//     idempotentes»: un Workflow que reintenta a medias no puede producir un
//     ascenso distinto en el segundo intento;
//   · y el caso que #241 pide por nombre: **una cohorte de 10 con 3 inactivos
//     en último lugar**, verificando que el descenso recae sobre los ACTIVOS
//     peor ubicados y no sobre los inactivos.
//
// Ese último es la extensión razonada de D-014 que el propio issue marca como
// tal: la semana en que una familia respeta el límite de pantalla, la liga no
// puede cobrárselo. **No jugar no es perder.**
//
// LO QUE NO PUEDE COMPROBAR: si las cifras de D-056 son las correctas para este
// producto. `mc-18` recomienda 15-20%/10%, más conservador, y esa objeción está
// escrita en la propia decisión. Aquí se comprueba que el código haga lo que la
// decisión dice, no que la decisión sea buena.

import { informar, leer, archivos, SOLO_PRODUCTO, sinComentarios } from "./lib/repo.mjs";

const problemas = [];
const notas = [];
let comprobaciones = 0;

const liga = await import("../packages/motor/src/liga.ts").catch((e) => {
  problemas.push(`no pude importar packages/motor/src/liga.ts: ${String(e).slice(0, 120)}`);
  return null;
});

// ─── 1. Las cifras salen de la decisión, no de la memoria de nadie ──────────

const decisiones = leer("docs/decisions.md") ?? "";
const seccion = decisiones.slice(decisiones.indexOf("## D-056"), decisiones.indexOf("## D-057"));

if (!seccion) {
  problemas.push(
    "no encontré D-056 en docs/decisions.md. Un auditor que no encuentra su fuente aprueba " +
      "siempre, así que esto es un fallo y no un pase.",
  );
} else if (liga) {
  comprobaciones++;
  // La fracción, tal como D-056 la escribe: «`round(tamaño × 7/30)` para
  // ascender y `round(tamaño × 5/30)` para descender». Se lee la fracción
  // seguida del verbo, no una cifra suelta: el porcentaje del título (23.3%)
  // es la misma cifra redondeada y leerlo daría 23 en vez de 7.
  const suben = Number(seccion.match(/(\d+)\s*\/\s*30\s*\)[^\n]{0,20}?ascender/)?.[1] ?? 0);
  const bajan = Number(seccion.match(/(\d+)\s*\/\s*30\s*\)[^\n]{0,20}?descender/)?.[1] ?? 0);

  if (suben === 0 || bajan === 0) {
    problemas.push(
      "no pude leer las fracciones de ascenso y descenso en D-056. Si la decisión cambió de " +
        "redacción, este auditor tiene que cambiar con ella — no puede seguir aprobando a ciegas.",
    );
  } else {
    if (liga.SUBEN_DE_30 !== suben) {
      problemas.push(
        `D-056 dice ${suben}/30 para ascender y el motor tiene SUBEN_DE_30 = ${liga.SUBEN_DE_30}. ` +
          "Manda el documento.",
      );
    }
    if (liga.BAJAN_DE_30 !== bajan) {
      problemas.push(
        `D-056 dice ${bajan}/30 para descender y el motor tiene BAJAN_DE_30 = ${liga.BAJAN_DE_30}. ` +
          "Manda el documento.",
      );
    }
    notas.push(`D-056 leída del documento: ${suben}/30 suben, ${bajan}/30 bajan`);
  }
}

// ─── 2. La escalera de cupos de #241, ejecutada ─────────────────────────────

if (liga) {
  const esperado = [
    [4, 0, 0, "menos de 5 activos: la cohorte se congela"],
    [5, 1, 1, "de 5 a 9: uno sube, uno baja"],
    [9, 1, 1, "de 5 a 9: uno sube, uno baja"],
    [10, 2, 2, "de 10 a 29: round(n×7/30) y round(n×5/30), mínimo 1"],
    [30, 7, 5, "cohorte completa: las cifras verificadas de Duolingo (D-056)"],
  ];
  for (const [n, suben, bajan, que] of esperado) {
    comprobaciones++;
    const r = liga.cupos(n);
    if (r.suben !== suben || r.bajan !== bajan) {
      problemas.push(
        `cupos(${n}) dio ${r.suben}/${r.bajan} y #241 pide ${suben}/${bajan} — ${que}.`,
      );
    }
  }
}

// ─── 3. El descenso no alcanza a un inactivo (#241, extensión de D-014) ─────

if (liga) {
  comprobaciones++;
  // Diez miembros: siete activos con puntos decrecientes, y tres inactivos al
  // fondo de la tabla cruda. El caso que #241 pide por nombre.
  const miembros = [];
  for (let i = 0; i < 7; i++) {
    miembros.push({
      id: `activo-${i}`,
      child_profile_id: `c${i}`,
      user_id: null,
      points_this_week: 1000 - i * 10,
      active_days: 3,
      joined_at: 1000 + i,
    });
  }
  for (let i = 0; i < 3; i++) {
    miembros.push({
      id: `inactivo-${i}`,
      child_profile_id: `d${i}`,
      user_id: null,
      points_this_week: 0,
      active_days: 0,
      joined_at: 2000 + i,
    });
  }

  const r = liga.cerrarCiclo(5, miembros);
  const bajan = r.filter((x) => x.outcome === "BAJA").map((x) => x.membership_id);

  if (bajan.some((id) => id.startsWith("inactivo"))) {
    problemas.push(
      `el descenso alcanzó a un inactivo (${bajan.filter((i) => i.startsWith("inactivo")).join(", ")}). ` +
        "#241: el descenso se calcula SOLO sobre miembros activos. Es la extensión razonada de " +
        "D-014 — la semana en que una familia respeta el límite de pantalla, la liga no puede " +
        "cobrárselo. No jugar no es perder.",
    );
  }
  if (bajan.length === 0) {
    problemas.push(
      "con 7 activos nadie descendió. La escalera de #241 pide 1 descenso entre 5 y 9 activos: " +
        "un auditor que solo comprueba «no bajó ningún inactivo» aprobaría un motor que no baja " +
        "a nadie nunca, y eso es una regla cierta por construcción (D-070).",
    );
  }
  if (!bajan.every((id) => id.startsWith("activo"))) {
    problemas.push(`el descenso recayó sobre ${bajan.join(", ")}, y solo puede alcanzar a activos.`);
  }
  // Y sobre el PEOR activo, no sobre cualquiera.
  if (bajan.length === 1 && bajan[0] !== "activo-6") {
    problemas.push(
      `descendió ${bajan[0]} y el activo peor ubicado es activo-6. El descenso recae sobre los ` +
        "activos peor ubicados, no sobre los que quedan al final de la tabla cruda.",
    );
  }

  // 4. Idempotencia: mismo cierre, filas barajadas, resultado idéntico.
  comprobaciones++;
  const barajadas = [...miembros].reverse();
  const r2 = liga.cerrarCiclo(5, barajadas);
  const clave = (x) => `${x.membership_id}:${x.final_rank}:${x.outcome}:${x.escalon_siguiente}`;
  const a = r.map(clave).sort().join("|");
  const b = r2.map(clave).sort().join("|");
  if (a !== b) {
    problemas.push(
      "el mismo cierre con las filas en otro orden dio otro resultado. #241 pide reintentos " +
        "idempotentes: un Workflow que reintenta a medias no puede producir un ascenso distinto " +
        "en el segundo intento. Falta un desempate determinista.",
    );
  }

  // 5. Desde el escalón tope no se asciende; desde el primero no se desciende.
  comprobaciones++;
  const tope = liga.cerrarCiclo(liga.ESCALON_TOPE, miembros);
  if (tope.some((x) => x.outcome === "SUBE")) {
    problemas.push(`alguien ascendió desde el escalón tope (${liga.ESCALON_TOPE}). #241: desde ahí no se asciende.`);
  }
  if (!tope.some((x) => x.outcome === "BAJA")) {
    problemas.push("desde el escalón tope nadie descendió. #241: el tope es un techo, no un refugio.");
  }
  const piso = liga.cerrarCiclo(liga.ESCALON_MINIMO, miembros);
  if (piso.some((x) => x.outcome === "BAJA")) {
    problemas.push("alguien descendió desde el primer escalón, y no hay dónde descender.");
  }
}

// ─── 6. Ni azar ni reloj en el camino del ciclo ─────────────────────────────

const AZAR = /(Math\.random|crypto\.getRandomValues|Date\.now\s*\(|new\s+Date\s*\(\s*\))/;
const delCiclo = archivos(/\.(ts|mjs)$/)
  .filter((f) => SOLO_PRODUCTO.test(f))
  .filter((f) => /(liga|league)/i.test(f))
  .filter((f) => !/\.prueba\.mjs$/.test(f));

for (const archivo of delCiclo) {
  comprobaciones++;
  const texto = sinComentarios(leer(archivo) ?? "");
  const m = texto.match(AZAR);
  if (m) {
    problemas.push(
      `${archivo}: usa \`${m[1]}\` en el camino del ciclo de liga. Un desempate «que da igual» ` +
        "resuelto con azar, o un corte que lee el reloj, hace que el mismo cierre dé dos " +
        "resultados distintos — y entonces no hay con qué discutirle a un padre.",
    );
  }
}

notas.push(`${comprobaciones} comprobación(es) EJECUTADAS sobre el motor, no leídas de su código`);
notas.push(`${delCiclo.length} archivo(s) del ciclo sin azar ni reloj`);

informar({
  nombre: "liga-ascenso-determinista",
  problemas,
  notas,
  cita: "D-056, D-014, #241, D-070, mc-18",
  revisados: comprobaciones,
  resumen: `${comprobaciones} comprobación(es) sobre el ciclo semanal`,
  porQueBloquea:
    "un reparto que cambia entre dos corridas del mismo Workflow no se puede explicar ni " +
    "reproducir, y el primer afectado es un niño al que le tocó la corrida mala.",
  noComprueba: [
    "si las cifras de D-056 son las correctas para este producto. `mc-18` recomienda 15-20%/10%, " +
      "más conservador, y esa objeción está escrita en la propia decisión.",
  ],
});
