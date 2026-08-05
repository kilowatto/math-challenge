/**
 * El renderizador del correo de reportes (F8 #291) y el armador MIME (#289).
 *
 * Recibe el `ReporteHogar` que ya construyó el motor puro
 * (`packages/motor/src/reportes.ts`) y lo vuelve asunto + texto plano + HTML.
 * El motor emite DATOS; aquí y solo aquí se redacta. Dos reglas vienen de la
 * estructura misma del reporte:
 *
 *   · **El orden de `hijos` es el que entregó el motor** (alias, nunca
 *     desempeño). Esta plantilla itera sin reordenar: ningún cliente de
 *     correo reordena por sí solo, así que el orden de salida del motor es el
 *     orden final que ve el padre (#288, enriquecimiento).
 *   · **`null` significa «no hay dato» y la sección se OMITE** — nunca se
 *     imprime un placeholder roto ni un 0 que afirme lo que no se sabe.
 *
 * ─── Todo número pasa por `formatear()` (D-022, mc-34) ─────────────────────
 *
 * El separador de millares no es el mismo en de-DE (punto) que en fr-FR
 * (espacio fino insecable) ni en en/es-MX (coma). Una racha o un XP de cuatro
 * cifras es alcanzable, y un número crudo interpolado sería contenido
 * matemáticamente mal escrito para ese hogar.
 *
 * ─── El HTML: el mínimo común denominador es Outlook de escritorio ─────────
 *
 * Motor de Word: layout con TABLAS (nunca flexbox/grid), una columna de 600
 * px máximo, estilos en línea. Gmail y Outlook invierten colores sin avisar:
 * nada de `#000000`/`#ffffff` puros, colores de rango medio que sobrevivan
 * una inversión forzada (investigación externa citada en #286 §1-2). Apple
 * Mail sí respeta `color-scheme`, así que se declara. El enlace de baja lleva
 * `padding` generoso — un cliente de correo no respeta `min-height` en un
 * enlace sin contenido, así que el área táctil ≥44px se logra con padding
 * (#286 §3). Y el correo es útil con CERO imágenes cargadas: no hay ni una
 * imagen informativa, todo el estado es texto HTML real.
 */

import { formatear } from "../../../../packages/motor/src/numeros.ts";
import type { Locale } from "../../../../packages/motor/src/convenciones.ts";
import type {
  ReporteHogar,
  SeccionHijo,
} from "../../../../packages/motor/src/reportes.ts";

import en from "../i18n/reportes/en.json";
import esMX from "../i18n/reportes/es-MX.json";
import esES from "../i18n/reportes/es-ES.json";
import frFR from "../i18n/reportes/fr-FR.json";
import ptBR from "../i18n/reportes/pt-BR.json";
import ptPT from "../i18n/reportes/pt-PT.json";
import deDE from "../i18n/reportes/de-DE.json";

// Los nombres de habilidad NO se duplican aquí: viven en `i18n/reto/` como
// `habilidad.<skill_id>`, autorados por locale como todo el contenido. Una
// segunda copia sería el sitio donde los dos textos se desincronizan.
import retoEn from "../i18n/reto/en.json";
import retoEsMX from "../i18n/reto/es-MX.json";
import retoEsES from "../i18n/reto/es-ES.json";
import retoFrFR from "../i18n/reto/fr-FR.json";
import retoPtBR from "../i18n/reto/pt-BR.json";
import retoPtPT from "../i18n/reto/pt-PT.json";
import retoDeDE from "../i18n/reto/de-DE.json";

const TEXTOS: Record<Locale, Record<string, string>> = {
  en,
  "es-MX": esMX,
  "es-ES": esES,
  "fr-FR": frFR,
  "pt-BR": ptBR,
  "pt-PT": ptPT,
  "de-DE": deDE,
};

const RETO: Record<Locale, Record<string, unknown>> = {
  en: retoEn,
  "es-MX": retoEsMX,
  "es-ES": retoEsES,
  "fr-FR": retoFrFR,
  "pt-BR": retoPtBR,
  "pt-PT": retoPtPT,
  "de-DE": retoDeDE,
};

/**
 * El locale CON REGIÓN para el formato de fechas. `audits/notacion-locale.mjs`
 * bloquea todo `Intl` con idioma sin región, y tiene razón: `es` a secas no
 * dice si el decimal es punto o coma. Aquí cada etiqueta la lleva.
 */
const LOCALE_CON_REGION: Record<Locale, string> = {
  en: "en-US",
  "es-MX": "es-MX",
  "es-ES": "es-ES",
  "fr-FR": "fr-FR",
  "pt-BR": "pt-BR",
  "pt-PT": "pt-PT",
  "de-DE": "de-DE",
};

/** El remitente del subsistema, sobre el dominio ya dado de alta (#313). */
export const REMITENTE_REPORTES = "Math Challenge <reportes@mail.kilowatto.com>";

const rellenar = (plantilla: string, valores: Record<string, string>): string =>
  plantilla.replace(/\{(\w+)\}/g, (_, clave) => valores[clave] ?? `{${clave}}`);

/** El nombre autorado de una habilidad, o null si el id no tiene texto. */
function nombreHabilidad(skillId: string, locale: Locale): string | null {
  const value = RETO[locale][`habilidad.${skillId}`];
  return typeof value === "string" ? value : null;
}

/** La fecha de una pausa, `YYYY-MM-DD`, en el formato largo del locale. */
function fechaLegible(diaLocal: string, locale: Locale): string {
  const [a, m, d] = diaLocal.split("-").map(Number);
  return new Intl.DateTimeFormat(LOCALE_CON_REGION[locale], {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(a, m - 1, d)));
}

const escapar = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export interface EnlacesReporte {
  /** Pantalla de preferencias dentro de la app (reactivar y cambiar cadencia). */
  preferencias: string;
  /** Baja de un toque con el token del hogar. */
  baja: string;
}

export interface CorreoRenderizado {
  asunto: string;
  texto: string;
  html: string;
}

/** Las líneas de la sección de UN hijo, ya redactadas y formateadas. */
function lineasHijo(hijo: SeccionHijo, t: Record<string, string>, locale: Locale): string[] {
  const lineas: string[] = [];
  lineas.push(
    hijo.puntosGanados > 0
      ? rellenar(t["reportes.hijo.puntos"], {
          alias: hijo.alias,
          puntos: formatear(hijo.puntosGanados, locale),
        })
      : rellenar(t["reportes.hijo.puntos_cero"], { alias: hijo.alias }),
  );
  if (hijo.xpTotal !== null) {
    lineas.push(
      rellenar(t["reportes.hijo.xp"], {
        xp: formatear(hijo.xpTotal, locale),
        ganado: formatear(hijo.xpGanado ?? 0, locale),
      }),
    );
  }
  if (hijo.rachaActual !== null) {
    lineas.push(
      rellenar(t["reportes.hijo.racha"], {
        actual: formatear(hijo.rachaActual, locale),
        max: formatear(hijo.rachaMaxima ?? hijo.rachaActual, locale),
      }),
    );
  }
  if (hijo.enPausaHasta !== null) {
    // La pausa se NOMBRA (decisión del dueño, 2026-08-02): sin la fecha, una
    // racha que no avanza se lee como una racha rota sin explicación.
    lineas.push(
      rellenar(t["reportes.hijo.pausa"], { fecha: fechaLegible(hijo.enPausaHasta, locale) }),
    );
  }
  const dominadas = hijo.habilidadesDominadas
    .map((id) => nombreHabilidad(id, locale))
    .filter((n): n is string => n !== null);
  if (dominadas.length > 0) {
    lineas.push(rellenar(t["reportes.hijo.dominadas"], { lista: dominadas.join(", ") }));
  }
  if (hijo.repasosPendientes > 0) {
    lineas.push(
      rellenar(
        hijo.repasosPendientes === 1
          ? t["reportes.hijo.repaso.uno"]
          : t["reportes.hijo.repaso.varios"],
        { n: formatear(hijo.repasosPendientes, locale) },
      ),
    );
  }
  if (hijo.minutosPracticados !== null && hijo.diasActivos !== null) {
    lineas.push(
      rellenar(t["reportes.hijo.tiempo"], {
        minutos: formatear(hijo.minutosPracticados, locale),
        dias: formatear(hijo.diasActivos, locale),
      }),
    );
  }
  return lineas;
}

/**
 * El correo completo: asunto, texto plano y HTML. El texto plano NO es
 * opcional — la guía de deliverability de Cloudflare Email Service lo pide
 * junto al HTML (#291).
 */
export function renderizarCorreoReporte(
  reporte: ReporteHogar,
  locale: Locale,
  cadencia: "WEEKLY" | "MONTHLY",
  enlaces: EnlacesReporte,
): CorreoRenderizado {
  const t = TEXTOS[locale] ?? TEXTOS.en;
  const clave = cadencia === "MONTHLY" ? "mensual" : "semanal";

  const asunto = t[`reportes.asunto.${clave}`];
  const intro = t[`reportes.intro.${clave}`];

  const secciones = reporte.hijos.map((hijo) => lineasHijo(hijo, t, locale));

  // ─── Texto plano ──────────────────────────────────────────────────────────
  const plano: string[] = [t["reportes.saludo"], "", intro, ""];
  for (const lineas of secciones) {
    for (const linea of lineas) plano.push(`· ${linea}`);
    plano.push("");
  }
  plano.push(t["reportes.cierre"], "", t["reportes.pie"]);
  plano.push(`${t["reportes.enlace.preferencias"]}: ${enlaces.preferencias}`);
  plano.push(`${t["reportes.enlace.baja"]}: ${enlaces.baja}`);

  // ─── HTML: una tabla, una columna, 600px ──────────────────────────────────
  const filas = secciones
    .map((lineas, i) => {
      const celdas = lineas
        .map(
          (linea) =>
            `<p style="margin:0 0 6px 0;font-size:15px;line-height:1.5;color:#434547;">${escapar(linea)}</p>`,
        )
        .join("");
      const borde =
        i < secciones.length - 1
          ? ' style="border-bottom:1px solid #A4A6A8;padding:16px 0;"'
          : ' style="padding:16px 0;"';
      return `<tr><td${borde}>${celdas}</td></tr>`;
    })
    .join("");

  // Los colores son SOLO de la paleta Ignia (`audits/brand-image.mjs` lo
  // hace cumplir hex a hex): gris-900 para texto, gris-600 para lo muted,
  // gris-400 para bordes, superficie-clara de fondo y azul-ignia en los
  // enlaces. Ninguno es `#000000` ni `#FFFFFF` puro en el fondo de página —
  // Gmail y Outlook invierten colores sin avisar (#286 §1), y el gris muy
  // claro sobrevive la inversión mejor que el blanco absoluto.
  const html = `<!doctype html>
<html lang="${escapar(LOCALE_CON_REGION[locale])}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapar(asunto)}</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F7F8;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F7F8;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background-color:#FFFFFF;border-radius:8px;">
<tr><td style="padding:24px 24px 8px 24px;">
<p style="margin:0 0 12px 0;font-size:15px;line-height:1.5;color:#434547;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">${escapar(t["reportes.saludo"])}</p>
<p style="margin:0;font-size:15px;line-height:1.5;color:#434547;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">${escapar(intro)}</p>
</td></tr>
<tr><td style="padding:0 24px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${filas}</table>
</td></tr>
<tr><td style="padding:8px 24px 24px 24px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
<p style="margin:0 0 16px 0;font-size:15px;line-height:1.5;color:#434547;">${escapar(t["reportes.cierre"])}</p>
<p style="margin:0 0 12px 0;font-size:12px;line-height:1.5;color:#727476;">${escapar(t["reportes.pie"])}</p>
<p style="margin:0;font-size:13px;line-height:1.5;">
<a href="${escapar(enlaces.preferencias)}" style="display:inline-block;padding:12px 16px;color:#0B6AB0;">${escapar(t["reportes.enlace.preferencias"])}</a>
<a href="${escapar(enlaces.baja)}" style="display:inline-block;padding:12px 16px;color:#0B6AB0;">${escapar(t["reportes.enlace.baja"])}</a>
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  return { asunto, texto: plano.join("\n"), html };
}

// ─── El mensaje MIME ─────────────────────────────────────────────────────────

/** UTF-8 → base64, el único transporte que no muerde acentos ni emojis. */
function aBase64Utf8(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let crudo = "";
  for (const b of bytes) crudo += String.fromCharCode(b);
  return btoa(crudo);
}

/** El asunto viaja como encoded-word RFC 2047 si trae algo fuera de ASCII. */
function codificarCabecera(s: string): string {
  return /[^\x20-\x7e]/.test(s) ? `=?UTF-8?B?${aBase64Utf8(s)}?=` : s;
}

export interface PiezasMime {
  de: string;
  para: string;
  asunto: string;
  texto: string;
  html: string;
  /** La URL de baja de un toque: va en List-Unsubscribe (RFC 8058, #289). */
  urlBaja: string;
}

/**
 * Arma el mensaje crudo para `EmailMessage`. Multipart/alternative con las
 * dos partes en base64, y las cabeceras de baja de un toque que la propia
 * guía de deliverability de Cloudflare Email Service exige para correo
 * recurrente: `List-Unsubscribe` y `List-Unsubscribe-Post: List-Unsubscribe=One-Click`.
 */
export function armarMime(p: PiezasMime): string {
  const frontera = `----mc-reportes-${aBase64Utf8(p.para + p.asunto).replace(/[^a-zA-Z0-9]/g, "").slice(0, 24)}`;
  return [
    `From: ${p.de}`,
    `To: ${p.para}`,
    `Subject: ${codificarCabecera(p.asunto)}`,
    `MIME-Version: 1.0`,
    `List-Unsubscribe: <${p.urlBaja}>`,
    `List-Unsubscribe-Post: List-Unsubscribe=One-Click`,
    `Content-Type: multipart/alternative; boundary="${frontera}"`,
    ``,
    `--${frontera}`,
    `Content-Type: text/plain; charset=utf-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    aBase64Utf8(p.texto),
    `--${frontera}`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    aBase64Utf8(p.html),
    `--${frontera}--`,
    ``,
  ].join("\r\n");
}
