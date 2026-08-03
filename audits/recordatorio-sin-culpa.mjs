#!/usr/bin/env node
// Auditor determinista — el recordatorio push es al PADRE, sin culpa, con tope
//
// Hace cumplir: issue #207 (los seis criterios de aceptación), D-014
// («notificaciones con culpa», prohibición por nombre), D-026 (el silencio no
// se re-pregunta), D-105 (se construye en F7), línea roja #2 y #6, mc-19
// rec. #3, #4 y #13.
//
// ─── Por qué es ESTÁTICO y no importa el motor (D-070) ────────────────────
//
// Un auditor que juzga con la misma función que el código usa para decidir no
// puede fallar nunca — pasó dos veces el mismo día en este repo. Este auditor
// NO importa `packages/motor/src/recordatorio.ts`: lee los archivos como texto
// y comprueba las reglas sobre el texto. El motor tiene sus 18 casos en
// `recordatorio.prueba.mjs`; aquí se vigilan las fronteras que una prueba
// unitaria no ve: qué columnas existen, qué cadenas aparecen en qué archivo,
// y quién escribe el silencio.
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Que el envío real funcione. VAPID, el service worker y la suscripción de
//    un aparato de verdad se comprueban en un aparato de verdad — como las
//    voces de F6, esto queda pendiente de oído humano.
//  · Una construcción de culpa que no esté en el léxico. El léxico es un
//    cable trampa, no un juez; el hueco lo cubre la revisión humana por
//    locale y la flota adversarial.

import { readFileSync, existsSync } from "node:fs";
import {
  informar,
  RAIZ,
  archivos,
  leer,
  sinComentarios,
  sqlSinComentarios,
  conFronteraUnicode,
  esDeNino,
} from "./lib/repo.mjs";

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
const problemas = [];
const notas = [];
let revisados = 0;

// ─── 1. La constante de tope, POR NOMBRE (criterio #2) ─────────────────────
//
// `UN_PUSH_POR_HOGAR_POR_DIA = 1` tiene que existir con ese nombre y ese valor:
// el issue prohíbe que sea un valor configurable por experimento. Un nombre
// distinto es la puerta a «subirlo a 3 para la prueba A/B».

const MOTOR = "packages/motor/src/recordatorio.ts";
const textoMotor = sinComentarios(leer(MOTOR) ?? "");
revisados++;
if (!textoMotor) {
  problemas.push(`no existe ${MOTOR} — el decisor del recordatorio es la pieza que este auditor vigila.`);
} else if (!/UN_PUSH_POR_HOGAR_POR_DIA\s*=\s*1\b/.test(textoMotor)) {
  problemas.push(
    `${MOTOR}: no está la constante \`UN_PUSH_POR_HOGAR_POR_DIA = 1\`. El criterio #2 del issue ` +
      "#207 la exige por nombre y como CONSTANTE — un tope configurable es un tope que alguien " +
      "sube «para el experimento», y mc-19 rec. #4 lo fija en uno al día por hogar.",
  );
}

// ─── 2. Ningún archivo del camino de ENVÍO conoce al niño (criterio #1) ────
//
// El destinatario es siempre el canal del `user_id` del adulto. La cadena
// `childProfileId` / `child_profile_id` no puede aparecer —ni en una firma, ni
// en un SQL, ni en una variable— en ninguno de estos archivos:
//
//   · el motor (recibe conteos, nunca identificadores)
//   · el remitente VAPID y la orquestación del cron (resuelven user_id →
//     endpoints y empujan)
//   · la ruta de suscripción (escribe con la sesión del adulto)
//   · el punto de entrada del Worker (el scheduled)
//   · la migración (NINGUNA columna de niño: es literalmente el criterio)
//
// `push-hogares.ts` NO está en esta lista a propósito: es la capa de DATOS de
// la decisión, la única autorizada a leer `child_profiles`, y de ella solo
// salen dos enteros. `push-mensaje.ts` tampoco: compone el copy (lee alias,
// que es la forma pública del niño, D-003) y se vigila aparte en el punto 4.

const CAMINO_DE_ENVIO = [
  "packages/motor/src/recordatorio.ts",
  "apps/web/src/lib/push-vapid.ts",
  "apps/web/src/lib/push-envio.ts",
  "apps/web/src/pages/api/push.ts",
  "apps/web/src/worker.ts",
];

for (const archivo of CAMINO_DE_ENVIO) {
  const texto = sinComentarios(leer(archivo) ?? "");
  revisados++;
  if (!texto) {
    problemas.push(`no existe ${archivo} — el camino de envío del recordatorio está incompleto.`);
    continue;
  }
  if (/childProfileId|child_profile_id/.test(texto)) {
    problemas.push(
      `${archivo}: menciona \`childProfileId\`/\`child_profile_id\` en el camino de ENVÍO del push. ` +
        "Criterio #1 del issue #207 y mc-19 rec. #3: el destinatario del recordatorio es SIEMPRE " +
        "el canal del padre (`user_id`); que un hijo completó o no se decide con CONTEOS " +
        "agregados en `push-hogares.ts`, nunca con un identificador de niño.",
    );
  }
}

const MIGRACION = "migrations/0014_push_recordatorio_padre.sql";
const sql = sqlSinComentarios(leer(MIGRACION) ?? "");
revisados++;
if (!sql) {
  problemas.push(`no existe ${MIGRACION} — la migración del recordatorio es parte del criterio.`);
} else if (/child_profile_id/i.test(sql)) {
  problemas.push(
    `${MIGRACION}: una columna \`child_profile_id\` en las tablas del push. No es que esté vacía: ` +
      "no puede EXISTIR. La suscripción es del ADULTO; una columna de niño aquí es el vector por " +
      "el que un push terminaría dirigido a un menor (issue #207, línea roja #2).",
  );
}

// ─── 3. El silencio es de una sola vía (criterio #5, D-026) ────────────────
//
// `silenciado_at` solo se PONE (en la ruta del padre, por acción explícita) y
// NADA lo limpia: la cadena `silenciado_at = NULL` no puede aparecer en
// ningún archivo de producto, y ningún otro archivo puede escribir la columna.

const RUTA_SILENCIO = "apps/web/src/pages/api/push.ts";
let escritoresDelSilencio = 0;
for (const archivo of archivos(/\.(ts|astro|sql)$/).filter((f) =>
  /^(apps\/|packages\/|migrations\/)/.test(f),
)) {
  const texto = sinComentarios(leer(archivo) ?? "");
  if (!texto.includes("silenciado_at")) continue;
  revisados++;
  if (/silenciado_at\s*=\s*NULL/i.test(texto)) {
    problemas.push(
      `${archivo}: escribe \`silenciado_at = NULL\`. El silencio del recordatorio es PERMANENTE ` +
        "(D-026, criterio #5 del issue #207): lo descartado no reaparece, y reactivarlo sin una " +
        "acción explícita del padre es nagging (mc-17, FTC 2022).",
    );
  }
  if (/INSERT INTO push_recordatorio|UPDATE push_recordatorio/i.test(texto)) {
    escritoresDelSilencio++;
    if (archivo !== RUTA_SILENCIO && archivo !== "apps/web/src/lib/push-envio.ts") {
      problemas.push(
        `${archivo}: escribe en \`push_recordatorio\` fuera de las dos rutas autorizadas ` +
          `(${RUTA_SILENCIO} pone el silencio; push-envio.ts marca el envío del día). Una tercera ` +
          "escritura es donde el silencio se limpia «sin querer».",
      );
    }
  }
}

// ─── 4. La ruta del copy es de SOLO LECTURA y no es un remitente ───────────

const RUTA_MENSAJE = "apps/web/src/pages/api/push-mensaje.ts";
const textoMensaje = sinComentarios(leer(RUTA_MENSAJE) ?? "");
revisados++;
if (!textoMensaje) {
  problemas.push(`no existe ${RUTA_MENSAJE} — el service worker la necesita para componer el copy.`);
} else {
  if (/push-vapid|enviarTickle/.test(textoMensaje)) {
    problemas.push(
      `${RUTA_MENSAJE}: importa al remitente. La ruta del copy LEE; la que empuja es ` +
        "push-envio.ts. Juntarlas convierte un endpoint sin sesión en una ruta de envío.",
    );
  }
  if (/INSERT INTO|UPDATE\s+\w+\s+SET|DELETE FROM/i.test(textoMensaje)) {
    problemas.push(
      `${RUTA_MENSAJE}: escribe en la base. Es una ruta de solo lectura — la llama el service ` +
        "worker sin sesión, y una escritura aquí sería una escritura sin autenticar.",
    );
  }
}

// ─── 5. Las plantillas pasan el léxico de la racha, en los 7 locales ───────
//
// El mismo escaneo que `racha-lexico.mjs`, compilado aquí de forma
// INDEPENDIENTE (D-070): si aquel auditor se apaga, este sigue vigilando las
// plantillas del push. Y además se verifica que aquel lo incluya (criterio
// #4), que es la otra mitad del requisito.

const DIR_PUSH = "apps/web/src/i18n/push";
let cadenasPush = 0;
for (const loc of LOCALES) {
  const rutaTextos = `${RAIZ}${DIR_PUSH}/${loc}.json`;
  const rutaLexico = `${RAIZ}audits/lib/racha-lexico/${loc}.json`;
  if (!existsSync(rutaTextos)) {
    problemas.push(`falta ${DIR_PUSH}/${loc}.json — las plantillas del recordatorio se autoran en los 7 locales (D-022).`);
    continue;
  }
  if (!existsSync(rutaLexico)) {
    problemas.push(`falta audits/lib/racha-lexico/${loc}.json — sin léxico no hay vigilancia para ${loc}.`);
    continue;
  }
  revisados++;
  const textos = JSON.parse(readFileSync(rutaTextos, "utf8"));
  const lexico = JSON.parse(readFileSync(rutaLexico, "utf8"));
  const reglas = (lexico.construcciones ?? []).map((c) => ({
    ...c,
    // `conFronteraUnicode`, no `new RegExp(patron, "iu")`: `\b` de JavaScript
    // solo conoce ASCII y «Se acabó» pasaba de largo — la trampa está medida.
    re: new RegExp(conFronteraUnicode(c.patron), "iu"),
  }));
  for (const [clave, valor] of Object.entries(textos)) {
    if (typeof valor !== "string") continue;
    cadenasPush++;
    for (const c of reglas) {
      if (c.re.test(valor)) {
        problemas.push(
          `${DIR_PUSH}/${loc}.json · ${clave}: léxico de ${c.categoria} — "${valor}". ${c.porque} ` +
            "El recordatorio es al padre, pero la regla es la misma (issue #207: «nunca con culpa»): " +
            "intención-implementación (mc-19 §1.3), sin racha, sin urgencia, sin comparación.",
        );
      }
    }
  }
}

// Criterio #4: `racha-lexico.mjs` también escanea las plantillas del push.
const textoRachaLexico = leer("audits/racha-lexico.mjs") ?? "";
revisados++;
if (!textoRachaLexico.includes(`${DIR_PUSH}`)) {
  problemas.push(
    "audits/racha-lexico.mjs no escanea `apps/web/src/i18n/push`. El criterio #4 del issue #207 " +
      "pide que ESE auditor también mire las plantillas del push — este punto 5 es la segunda " +
      "fuente, no el reemplazo.",
  );
}

// ─── 6. Ninguna superficie de niño referencia el recordatorio (línea #3) ───
//
// El push es del padre, pero la defensa completa es que nada de esta
// maquinaria sea alcanzable desde una pantalla donde pueda haber un niño.

for (const archivo of archivos(/\.(astro|ts|tsx|css)$/).filter((f) => esDeNino(f))) {
  const texto = sinComentarios(leer(archivo) ?? "");
  if (!texto) continue;
  revisados++;
  if (/RecordatorioPush|\/api\/push|push_recordatorio|push_subscription/.test(texto)) {
    problemas.push(
      `${archivo}: una superficie de NIÑO referencia el recordatorio push. El recordatorio es ` +
        "del padre y vive en su área; un niño no tiene sesión de adulto y nada suyo puede tocar " +
        "esta maquinaria (línea roja #3, issue #207).",
    );
  }
}

notas.push(
  `${cadenasPush} cadena(s) de plantilla push revisadas contra el léxico en ${LOCALES.length} locales ` +
    "(segunda fuente independiente de racha-lexico, D-070)",
);
notas.push(
  `camino de envío sin \`childProfileId\`: ${CAMINO_DE_ENVIO.length} archivos + la migración 0014 ` +
    "(la capa de datos, `push-hogares.ts`, devuelve conteos y el alias público del copy, D-003 — " +
    "nunca un identificador)",
);
notas.push(
  "silencio de una vía: `silenciado_at` solo se pone en /api/push y `silenciado_at = NULL` " +
    "no existe en el repositorio",
);
notas.push("tope por nombre: `UN_PUSH_POR_HOGAR_POR_DIA = 1`, constante, no flag de experimento");

informar({
  nombre: "recordatorio-sin-culpa",
  problemas,
  notas,
  cita: "issue #207 (criterios 1-5), D-014, D-026, D-105, líneas rojas #2, #3 y #6, mc-19 rec. #3, #4, #13",
  revisados,
  resumen: `${revisados} archivo(s) del recordatorio push al padre: envío, silencio, plantillas y superficie`,
  porQueBloquea:
    "un push dirigido a un niño, o con lenguaje de pérdida, o sin tope diario, es exactamente la " +
    "mecánica que la FTC nombra en su informe de 2022 y que D-014 prohíbe por nombre — y el " +
    "destinatario aquí tiene entre 4 y 17 años.",
  noComprueba: [
    "que el envío real funcione en un aparato de verdad (VAPID, suscripción, iOS con PWA " +
      "instalada). Queda pendiente de prueba humana, como las voces de F6.",
    "una construcción de culpa que no esté en el léxico. Es un cable trampa: el hueco lo cubren " +
      "la revisión humana por locale (D-022) y la flota adversarial.",
  ],
});
