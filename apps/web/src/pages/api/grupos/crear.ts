/**
 * `/api/grupos/crear` — crear un salón o club (F9 · #381/#383, D-086).
 *
 * El formulario de `/[locale]/app/grupos/nuevo` llega aquí. La validación es
 * del SERVIDOR con las mismas funciones del motor que limita el HTML
 * (`maxSizeEsValido()`, `topePorOrigen()`): no se confía en el navegador.
 *
 * El gate es el de siempre, ahora con su primer llamador real:
 * `assertCanOwnChildGroup` fabrica el `OwnerProof` y `crearGrupo()` no
 * compila sin él (criterio #118, issue #402). Sin fila de identidad, se
 * redirige a declararla — es el paso previo del flujo, no un error.
 */
import type { APIRoute } from "astro";
import { COOKIE_ADULTO, leerCookies, leerSesionAdulto } from "../../../lib/sesiones.ts";
import { terminarBien, terminarMal } from "../../../lib/respuesta-de-formulario.ts";
import { f9Habilitado } from "../../../lib/grupo-flag.ts";
import { crearGrupo, identidadDe } from "../../../lib/grupo-duenio.ts";
import { assertCanOwnChildGroup } from "../../../lib/owner-proof.ts";
import type { OrigenDeGrupo } from "../../../../../packages/motor/src/grupo.ts";

export const prerender = false;

interface Env {
  DB: D1Database;
  SESSION_KV: KVNamespace;
  CONFIG_KV: KVNamespace;
}

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

export const POST: APIRoute = async ({ request, locals }) => {
  let locale = "en";
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!env?.DB || !env?.SESSION_KV) {
    return terminarMal(request, `/${locale}/app/grupos/nuevo/`, "sin_bindings", 503);
  }

  if (request.headers.get("early-data") === "1") {
    return terminarMal(request, `/${locale}/app/grupos/nuevo/`, "reintenta", 425);
  }

  const cookies = leerCookies(request.headers.get("cookie"));
  const sesion = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!sesion) return terminarMal(request, `/${locale}/app/`, "sin_sesion", 401);

  let origen = "";
  let maxSize = NaN;
  let schoolId = "";
  try {
    const f = await request.formData();
    origen = String(f.get("origen") ?? "");
    maxSize = Number(f.get("max_size"));
    schoolId = String(f.get("school_id") ?? "");
    locale = String(f.get("locale") ?? "");
  } catch {
    return terminarMal(request, `/${locale}/app/grupos/nuevo/`, "cuerpo_ilegible");
  }
  if (!LOCALES.includes(locale)) locale = "en";

  const volverA = `/${locale}/app/grupos/nuevo/`;

  // La bandera de mercado también en la escritura (#387): una petición
  // directa no puede encender F9 en un locale apagado.
  if (!(await f9Habilitado(env.CONFIG_KV, locale))) {
    return terminarMal(request, volverA, "apagado", 404);
  }

  if (origen !== "salon" && origen !== "club_papas") {
    return terminarMal(request, volverA, "origen_invalido");
  }

  // El gate: sin identidad declarada, a declararla — es el flujo, no un error.
  const fila = await identidadDe(env.DB, sesion.userId);
  const proof = assertCanOwnChildGroup(fila);
  if (!proof) {
    return terminarBien(request, `/${locale}/app/grupos/identidad/`, [], { ok: true });
  }

  const resultado = await crearGrupo(env.DB, proof, {
    origen: origen as OrigenDeGrupo,
    maxSize,
    schoolId: schoolId.length > 0 ? schoolId : null,
    ahora: Math.floor(Date.now() / 1000),
  });

  if (!resultado.ok) return terminarMal(request, volverA, resultado.motivo);

  return terminarBien(
    request,
    `/${locale}/app/grupos/${resultado.id}/?creado=1`,
    [],
    { ok: true, id: resultado.id },
  );
};
