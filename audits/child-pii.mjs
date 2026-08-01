#!/usr/bin/env node
// Auditor determinista — ningún dato personal de un niño, en ninguna parte
//
// Hace cumplir: línea roja #2 ("el niño nunca es un usuario"), D-013, D-012,
// `mc-25` (privacidad infantil: COPPA, GDPR-K, LGPD).
//
// Por qué existe, y por qué existe AHORA que no hay código que vigilar.
// `child-free-text` ya cuida que un niño no escriba prosa. Esto es lo otro: que
// el sistema no GUARDE quién es. Son dos huecos distintos y el segundo es el
// caro — un `nombre` en `child_profiles` no rompe ninguna prueba, no se ve en
// ninguna pantalla, y convierte el producto en un tratamiento de datos de menor
// que en la UE exige base legal, evaluación de impacto y un plazo de borrado.
//
// La línea roja dice: "No se pide nombre real, correo, foto ni fecha exacta de
// nacimiento." Este auditor la vuelve mecánica sobre el esquema y sobre el
// código que lo toca.
//
// LO QUE NO PUEDE COMPROBAR, dicho antes de que alguien lo suponga: que un
// campo llamado `alias` no contenga de hecho el nombre real porque el formulario
// pide "¿cómo te llamas?". Eso es una decisión de producto en una cadena
// traducida, y vive en los archivos de mensajes. Aquí se vigila la forma, no la
// intención.

import { archivos, leer, informar, TABLAS_DE_NINO, sqlSinComentarios } from "./lib/repo.mjs";

/**
 * Columnas prohibidas en cualquier tabla de niño.
 *
 * No es una lista de nombres exactos: es lo que cada patrón significa. Un
 * `birth_date` y un `fecha_nacimiento` son el mismo dato personal con dos
 * ortografías, y quien añada el segundo no va a leer la lista del primero.
 */
const COLUMNAS_PROHIBIDAS = [
  [/\b(real_?name|full_?name|first_?name|last_?name|surname|nombre_?real|apellido)\b/i,
   "nombre real"],
  [/\b(e?mail|correo|correo_?electronico)\b/i,
   "correo electrónico"],
  [/\b(photo|foto|avatar_?url|profile_?(pic|image)|imagen_?perfil)\b/i,
   "foto o imagen de perfil"],
  [/\b(birth_?date|date_?of_?birth|dob|fecha_?nacimiento|birthday)\b/i,
   "fecha exacta de nacimiento"],
  [/\b(phone|telefono|celular|mobile_?number|msisdn)\b/i,
   "teléfono"],
  [/\b(address|direccion|street|postal_?code|codigo_?postal|zip)\b/i,
   "domicilio"],
  [/\b(lat|lng|latitude|longitude|latitud|longitud|geo_?point|precise_?location)\b/i,
   "ubicación precisa"],
  [/\b(ip_?address|device_?id|advertising_?id|idfa|gaid|fingerprint)\b/i,
   "identificador de dispositivo o publicidad"],
  [/\b(school_?name|escuela|colegio|classroom_?name)\b/i,
   "nombre de la escuela"],
];

/**
 * Lo que SÍ puede guardarse de un niño, y por qué.
 *
 * Se lista explícitamente para que el auditor no tenga que adivinar y para que
 * la lista de lo permitido sea tan visible como la de lo prohibido. `birth_year`
 * es un año, no una fecha: sirve para la banda de edad y no identifica a nadie.
 */
const PERMITIDO_EXPLICITO = [
  ["alias", "alias generado por el sistema, sin nombre real (D-003)"],
  ["birth_year", "AÑO de nacimiento, no fecha: da la banda sin identificar (D-012)"],
  ["locale", "idioma de la interfaz (D-022)"],
  ["avatar_id", "referencia a un avatar del catálogo, no una imagen subida (D-028)"],
];

const problemas = [];
const notas = [];

// --- 1. El esquema ---------------------------------------------------------
const migraciones = archivos(/migrations\/.*\.sql$/);
let tablasVistas = 0;

for (const archivo of migraciones) {
  const sql = sqlSinComentarios(leer(archivo) ?? "");

  for (const tabla of TABLAS_DE_NINO) {
    // CREATE y ALTER, los dos. `child-free-text` era ciego a ALTER TABLE y por
    // eso una columna de texto libre en una tabla de niño pasaba en verde.
    const bloques = [];
    const creado = sql.match(new RegExp(`CREATE\\s+TABLE(?:\\s+IF\\s+NOT\\s+EXISTS)?\\s+${tabla}\\s*\\(([\\s\\S]*?)\\n\\s*\\);`, "i"));
    if (creado) {
      bloques.push(creado[1]);
      tablasVistas++;
    }
    for (const m of sql.matchAll(new RegExp(`ALTER\\s+TABLE\\s+${tabla}\\s+ADD\\s+(?:COLUMN\\s+)?([^;]+);`, "gi"))) {
      bloques.push(m[1]);
      tablasVistas++;
    }

    for (const bloque of bloques) {
      for (const [re, que] of COLUMNAS_PROHIBIDAS) {
        const m = bloque.match(re);
        if (m) {
          problemas.push(
            `${archivo}: la tabla \`${tabla}\` declara \`${m[0]}\` — ${que}. ` +
              "La línea roja #2 y D-013 lo prohíben sin excepción: el niño no es un usuario, " +
              "es un perfil dentro de la cuenta del padre.",
          );
        }
      }
    }
  }
}

if (migraciones.length === 0) {
  notas.push("todavía no hay migraciones; el auditor está listo para la primera");
} else if (tablasVistas === 0) {
  notas.push(`${migraciones.length} migración(es), ninguna toca aún una tabla de niño`);
} else {
  notas.push(`${tablasVistas} declaración(es) sobre tablas de niño, ninguna con dato personal`);
}

// --- 2. El código que pide datos ------------------------------------------
// Un campo de formulario en una superficie de niño que pida cualquiera de estos
// datos es el mismo problema antes de llegar a la base.
const fuentes = archivos(/\.(astro|tsx|jsx|ts|js|svelte|vue)$/);
let superficiesDeNino = 0;

for (const archivo of fuentes) {
  const texto = leer(archivo) ?? "";
  // Solo se mira dentro de atributos de formulario: buscar la palabra "email"
  // en un comentario o en una constante de mensajes daría falsas alarmas sin
  // parar, que es cómo un auditor se vuelve ruido que la gente apaga.
  const campos = [...texto.matchAll(/(?:name|id|type|autocomplete)\s*=\s*["'{`]([^"'}`]+)/gi)].map((m) => m[1]);
  if (campos.length === 0) continue;

  const deNino = /child|kinder|nino|primaria/i.test(archivo);
  if (deNino) superficiesDeNino++;
  if (!deNino) continue;

  for (const campo of campos) {
    for (const [re, que] of COLUMNAS_PROHIBIDAS) {
      if (re.test(campo)) {
        problemas.push(
          `${archivo}: campo de formulario \`${campo}\` en una superficie de niño — ${que}. ` +
            "Línea roja #2 y D-013.",
        );
      }
    }
  }
}

if (superficiesDeNino > 0) notas.push(`${superficiesDeNino} superficie(s) de niño con formulario, todas limpias`);

notas.push(`permitido explícitamente: ${PERMITIDO_EXPLICITO.map(([c]) => c).join(", ")}`);

informar({
  nombre: "child-pii",
  problemas,
  notas,
  cita: "línea roja #2, D-013, D-012, mc-25",
  revisados: migraciones.length + fuentes.length,
  resumen: `${migraciones.length} migración(es) y ${fuentes.length} archivo(s) de código`,
  porQueBloquea:
    "un campo personal en una tabla de niño no rompe ninguna prueba y no se ve en " +
    "ninguna pantalla; convierte el producto en un tratamiento de datos de menor con " +
    "base legal, evaluación de impacto y plazo de borrado (mc-25).",
  noComprueba: [
    "que un campo llamado `alias` no contenga el nombre real porque el formulario " +
      "pregunta «¿cómo te llamas?». Eso vive en los mensajes traducidos, no en la forma.",
  ],
});
