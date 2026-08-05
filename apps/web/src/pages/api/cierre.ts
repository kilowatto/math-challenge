import type { APIRoute } from "astro";
import { COOKIE_ADULTO, COOKIE_NINO, leerCookies, leerSesionAdulto, leerSesionNino } from "../../lib/sesiones";
import { bancoCierreD1 } from "../../lib/banco-cierre-d1";
import retoEN from "../../i18n/reto/en.json";
import retoESMX from "../../i18n/reto/es-MX.json";
import retoESES from "../../i18n/reto/es-ES.json";
import retoFRFR from "../../i18n/reto/fr-FR.json";
import retoPTBR from "../../i18n/reto/pt-BR.json";
import retoPTPT from "../../i18n/reto/pt-PT.json";
import retoDEDE from "../../i18n/reto/de-DE.json";

const MENSAJES = {
  en: retoEN,
  "es-MX": retoESMX,
  "es-ES": retoESES,
  "fr-FR": retoFRFR,
  "pt-BR": retoPTBR,
  "pt-PT": retoPTPT,
  "de-DE": retoDEDE,
};

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  if (!env?.DB || !(await tieneSesion(env, request))) return json({ error: "sin_sesion" }, 401);
  const url = new URL(request.url);
  const itemId = url.searchParams.get("itemId");
  const locale = url.searchParams.get("locale") ?? "en";
  if (!itemId) return json({ error: "falta itemId" }, 400);
  const item = await bancoCierreD1(env.DB, MENSAJES).presentarItem(itemId, locale);
  return item ? json(item) : json({ error: "item_no_disponible" }, 404);
};

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  if (!env?.DB || !(await tieneSesion(env, request))) return json({ error: "sin_sesion" }, 401);
  let cuerpo: { itemId?: unknown; eleccion?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return json({ error: "cuerpo_ilegible" }, 400);
  }
  if (typeof cuerpo.itemId !== "string") return json({ error: "falta_itemId" }, 400);
  if (typeof cuerpo.eleccion !== "number" && typeof cuerpo.eleccion !== "string") return json({ error: "eleccion_invalida" }, 400);
  if (typeof cuerpo.eleccion === "string" && cuerpo.eleccion.length > 32) return json({ error: "eleccion_demasiado_larga" }, 400);
  const veredicto = await bancoCierreD1(env.DB, MENSAJES).calificarContraBanco(cuerpo.itemId, cuerpo.eleccion);
  return veredicto ? json(veredicto) : json({ error: "item_no_disponible" }, 404);
};

async function tieneSesion(env: any, request: Request): Promise<boolean> {
  const cookies = leerCookies(request.headers.get("cookie"));
  const adulto = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (adulto) return true;
  const nino = await leerSesionNino(env.SESSION_KV, cookies[COOKIE_NINO]);
  return Boolean(nino);
}

const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
