/**
 * `/api/reportes` — la preferencia y la baja del reporte por correo (F8 #290).
 *
 * Acciones:
 *
 *   · **`?accion=estado`** (POST, sesión `mc_s`) — la cadencia actual y la
 *     hora de envío, para que la pantalla de preferencias pinte su estado.
 *   · **`?accion=cadencia`** (POST, sesión) — cambia la cadencia
 *     (`WEEKLY`/`MONTHLY`/`OFF`). Es la ÚNICA vía de reactivación tras una
 *     baja: una acción explícita del padre dentro de la app (D-026).
 *   · **`?accion=baja&token=…`** (GET, SIN sesión) — la baja de un toque
 *     desde el propio correo. Un solo clic pone `cadence='OFF'` y ya: sin
 *     «¿estás seguro?», sin oferta de reducir la frecuencia (ese patrón
 *     concreto es lo que la carta `patrones-oscuros` caza, D-014) y sin
 *     pedir la sesión — un padre debe poder darse de baja desde su bandeja
 *     sin iniciar sesión primero, el estándar de cualquier lista de correo
 *     legítima. Responde una página de confirmación en el locale del hogar.
 *   · **`?accion=baja`** (POST con el token en la URL o en el cuerpo, SIN
 *     sesión) — el `List-Unsubscribe-Post: List-Unsubscribe=One-Click` de
 *     RFC 8058 que los clientes de correo llaman solos (#289).
 *
 * ─── El niño no existe en esta ruta ────────────────────────────────────────
 *
 * El destinatario es siempre la cuenta del adulto: la sesión para las
 * acciones con sesión, el token opaco para la baja. No hay parámetro de
 * perfil de niño, ni directo ni indirecto — la misma frontera que
 * `api/push.ts` (línea roja #2, mc-19 rec. #3).
 *
 * Después de la baja NINGÚN correo vuelve a salir preguntando «¿seguro?»:
 * una decisión tomada no se re-pregunta (D-026, mc-17).
 */
import type { APIRoute } from "astro";
import {
  COOKIE_ADULTO,
  esTokenOpaco,
  leerCookies,
  leerSesionAdulto,
} from "../../lib/sesiones";
import {
  bajaPorToken,
  cambiarCadencia,
  leerPreferencia,
  localeDelToken,
} from "../../lib/reportes-preferencia";

import en from "../../i18n/reportes/en.json";
import esMX from "../../i18n/reportes/es-MX.json";
import esES from "../../i18n/reportes/es-ES.json";
import frFR from "../../i18n/reportes/fr-FR.json";
import ptBR from "../../i18n/reportes/pt-BR.json";
import ptPT from "../../i18n/reportes/pt-PT.json";
import deDE from "../../i18n/reportes/de-DE.json";

export const prerender = false;

interface Env {
  DB?: D1Database;
  SESSION_KV: KVNamespace;
}

const TEXTOS: Record<string, Record<string, string>> = {
  en,
  "es-MX": esMX,
  "es-ES": esES,
  "fr-FR": frFR,
  "pt-BR": ptBR,
  "pt-PT": ptPT,
  "de-DE": deDE,
};

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // La respuesta depende de la cookie de sesión o del token: jamás se cachea.
      "cache-control": "no-store",
      vary: "Cookie",
    },
  });

const escapar = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** La página mínima que ve el padre tras el clic de baja. Sin ofertas. */
function paginaBaja(locale: string, titulo: string, texto: string): Response {
  const html = `<!doctype html>
<html lang="${escapar(locale)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapar(titulo)}</title>
</head>
<body style="margin:0;background-color:#F7F7F8;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
<main style="max-width:34rem;margin:4rem auto;padding:2rem;background-color:#FFFFFF;border-radius:8px;">
<h1 style="font-size:1.25rem;color:#434547;">${escapar(titulo)}</h1>
<p style="font-size:1rem;line-height:1.6;color:#434547;">${escapar(texto)}</p>
</main>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

async function atenderBaja(env: Env, token: string | null): Promise<{
  resultado: "apagada" | "token_desconocido";
  locale: string;
}> {
  if (!env.DB || !token || !esTokenOpaco(token)) {
    return { resultado: "token_desconocido", locale: "en" };
  }
  const locale = (await localeDelToken(env.DB, token)) ?? "en";
  const resultado = await bajaPorToken(env.DB, token);
  return { resultado, locale };
}

/** La baja de un toque, desde el correo. Sin sesión, sin confirmación. */
export const GET: APIRoute = async ({ locals, url }) => {
  const env = (locals as { runtime?: { env: Env } }).runtime?.env;
  if (url.searchParams.get("accion") !== "baja") {
    return new Response("not found", { status: 404 });
  }
  const { resultado, locale } = await atenderBaja(env ?? {}, url.searchParams.get("token"));
  const t = TEXTOS[locale] ?? TEXTOS.en;
  return resultado === "apagada"
    ? paginaBaja(locale, t["baja.hecho.titulo"], t["baja.hecho.texto"])
    : paginaBaja(locale, t["baja.invalido.titulo"], t["baja.invalido.texto"]);
};

export const POST: APIRoute = async ({ request, locals, url }) => {
  const env = (locals as { runtime?: { env: Env } }).runtime?.env;
  const accion = url.searchParams.get("accion");

  // La vía RFC 8058: el cliente de correo hace POST con el token en la URL.
  if (accion === "baja") {
    const { resultado } = await atenderBaja(env ?? {}, url.searchParams.get("token"));
    return json({ ok: resultado === "apagada" });
  }

  if (!env?.SESSION_KV) return json({ error: "sin_bindings" }, 503);
  const cookies = leerCookies(request.headers.get("cookie"));
  const sesion = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!sesion) return json({ error: "sin_sesion" }, 401);

  if (accion === "estado") {
    if (!env.DB) return json({ error: "sin_base" }, 503);
    const preferencia = await leerPreferencia(env.DB, sesion.userId);
    return json(preferencia);
  }

  if (accion === "cadencia") {
    if (!env.DB) return json({ error: "sin_base" }, 503);
    let cuerpo: { cadence?: unknown };
    try {
      cuerpo = await request.json();
    } catch {
      return json({ error: "cuerpo_invalido" }, 400);
    }
    const cadence = cuerpo.cadence;
    if (cadence !== "WEEKLY" && cadence !== "MONTHLY" && cadence !== "OFF") {
      return json({ error: "cadencia_invalida" }, 400);
    }
    await cambiarCadencia(env.DB, sesion.userId, cadence);
    return json({ ok: true });
  }

  return json({ error: "accion_desconocida" }, 400);
};
