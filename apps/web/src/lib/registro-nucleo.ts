/**
 * El núcleo del alta de cuenta — lo que `POST /api/registro` hace una vez el
 * cuerpo está validado, Turnstile pasó y el limitador dio cupo.
 *
 * ─── Por qué existe como módulo aparte ─────────────────────────────────────
 *
 * La ruta (`pages/api/registro.ts`) importa `i18n/rutas` para saber a qué
 * página devolver a quien falla, y `i18n/index.ts` carga los siete JSON sin
 * atributos de importación: `node --experimental-strip-types` no puede cargar
 * ese grafo. El patrón del repo para probar un endpoint de verdad contra
 * `node:sqlite` (como hace `padre-limite.prueba.mjs`) exige un módulo sin esa
 * dependencia, y ESTE es: aquí vive la decisión de qué se escribe, y la ruta
 * se queda con lo HTTP — leer el cuerpo, Turnstile, el limitador, la
 * redirección.
 *
 * ─── D-082: toda cuenta nace con `is_learner = 1` ──────────────────────────
 *
 * Antes de #390 el INSERT llevaba `intent === 'ADULTO_APRENDE' ? 1 : 0`: la
 * puerta por la que entró la persona decidía qué tipo de cuenta nacía. D-082
 * lo elimina — no hay tres puertas simétricas, hay una sola alta que siempre
 * nace en modo solo, y «agregar un hijo» / «crear un salón» son acciones que
 * el adulto toma después desde su casa. `is_learner` aquí es un `1` literal y
 * la prueba (`registro.prueba.mjs`) lo exige para las tres intenciones y para
 * el alta sin intención.
 *
 * `signup_intent` sobrevive como DATO DE EMBUDO: qué CTA de marketing trajo a
 * la persona (D-037). No condiciona nada de lo que se escribe — y por eso es
 * OPCIONAL: una alta sin `intent` es igual de válida, y la columna queda NULL
 * (el CHECK de la migración 0003 admite NULL en SQLite, y la prueba lo
 * demuestra contra el CHECK real).
 */
import type { Locale } from "../i18n";
import { hashear } from "./passwords.ts";
import { abrirSesionAdulto } from "./sesiones.ts";
import { anotarPaso } from "./embudo.ts";

/** Las puertas conocidas. Cerrada a propósito: coincide con el CHECK de 0003. */
const INTENCIONES = new Set(["PADRE", "MAESTRO", "ADULTO_APRENDE"]);
export type Intent = "PADRE" | "MAESTRO" | "ADULTO_APRENDE";

/**
 * La intención del `hidden` del formulario.
 *
 * Ausente o vacía → `null` (alta válida, embudo sin dato: la puerta ya no es
 * una elección, así que exigirla sería rechazar altas por telemetría). Si
 * viene, tiene que ser de la lista cerrada — un valor inventado no crea una
 * cuenta con un dato raro; falla.
 */
export function intentDeFormulario(
  crudo: string,
): { ok: true; intent: Intent | null } | { ok: false } {
  if (crudo === "") return { ok: true, intent: null };
  return INTENCIONES.has(crudo)
    ? { ok: true, intent: crudo as Intent }
    : { ok: false };
}

export interface DatosAlta {
  correo: string;
  clave: string;
  locale: Locale;
  intent: Intent | null;
  pais: string | null;
  zona: string | null;
}

export type ResultadoAlta =
  | { estado: "creada"; userId: string; cookies: string[] }
  | { estado: "duplicado" };

/**
 * Escribe la cuenta: hash, usuario, contraseña, sesión, embudo.
 *
 * ─── MISMO_TIEMPO ──────────────────────────────────────────────────────────
 *
 * El hash se calcula ANTES de mirar si el correo existe, y se calcula siempre.
 * Es lo que hace que las dos ramas —correo nuevo y correo repetido— cuesten lo
 * mismo: sin eso, la rama del correo repetido volvería ~36 ms antes y el
 * formulario sería un oráculo de enumeración de cuentas, medible con un
 * cronómetro (el encabezado de la ruta cuenta el resto).
 */
export async function registrarCuentaNueva(
  env: { DB: D1Database; SESSION_KV: KVNamespace; FUNNEL_AE?: AnalyticsEngineDataset },
  d: DatosAlta,
): Promise<ResultadoAlta> {
  const hash = await hashear(d.clave);

  const ya = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(d.correo)
    .first<{ id: string }>();
  if (ya) return { estado: "duplicado" };

  const ahora = Math.floor(Date.now() / 1000);
  const userId = crypto.randomUUID();
  // `EU` manda a la base europea (D-042). Se deriva del país y **una vez
  // escrita no se cambia sola**: mover datos de menores entre jurisdicciones
  // es un problema legal, no técnico.
  const region = d.pais && PAISES_UE.has(d.pais) ? "EU" : "GLOBAL";

  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO users (id, email, email_verified, locale, is_learner, created_at, updated_at, country, timezone, data_region, signup_intent) " +
        "VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?)",
    // `is_learner` es un 1 LITERAL (D-082): no hay puerta que decida otra cosa.
    ).bind(userId, d.correo, d.locale, 1, ahora, ahora, d.pais, d.zona, region, d.intent),
    env.DB.prepare(
      "INSERT INTO user_password (user_id, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?)",
    ).bind(userId, hash, ahora, ahora),
  ]);

  const { cookies } = await abrirSesionAdulto(env.SESSION_KV, {
    userId,
    creadaEn: ahora,
    intent: d.intent,
  });

  // El embudo: un adulto creó una cuenta. Sin identificador de nadie — ver
  // `lib/embudo.ts`. No lanza, así que no puede impedir el registro.
  anotarPaso(env.FUNNEL_AE, "registro", { pais: d.pais, locale: d.locale, intent: d.intent });

  return { estado: "creada", userId, cookies };
}

/**
 * Los 27 de la Unión Europea, para `data_region` (D-042).
 *
 * No incluye Reino Unido —salió— ni Suiza ni Noruega, que tienen sus propios
 * regímenes. Es una lista de países, no una geolocalización: `mc-25` distingue
 * las dos cosas, y aquí solo se usa para decidir en qué base vive el dato.
 */
const PAISES_UE = new Set([
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HR",
  "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK",
]);
