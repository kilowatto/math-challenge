// La tabla de segmentos de URL por locale (D-049). Datos puros, sin tipos.
//
// Por qué es un `.mjs` y no vive dentro de `rutas.ts`. Esta tabla la necesitan
// dos mundos que no comparten cargador: las páginas (TypeScript, compilado por
// Vite) y `astro.config.mjs`, que corre en Node antes de que exista un pipeline
// de TS y que la usa para generar las redirecciones 301.
//
// La alternativa era escribirla dos veces. Una tabla de rutas duplicada se
// desincroniza en el primer cambio, y el síntoma sería una redirección que
// manda a un 404 — invisible en desarrollo, visible solo en los registros de
// producción semanas después.
//
// `rutas.ts` la importa y le pone los tipos encima. Este archivo es la fuente.

/** @type {Record<string, Record<string, string>>} */
export const SEGMENTOS = {
  "en": {
    "investigacion": "research",
    "arquitectura": "architecture",
    "codigo-abierto": "open-source",
    "niveles": "levels",
    "origen": "origin",
    "registro-padre": "signup-parent",
    "registro-maestro": "signup-teacher",
    "registro-aprendo": "signup-learner",
    "entrar": "sign-in",
  },
  "es-MX": {
    "investigacion": "investigacion",
    "arquitectura": "arquitectura",
    "codigo-abierto": "codigo-abierto",
    "niveles": "niveles",
    "origen": "origen",
    "registro-padre": "registro-padre",
    "registro-maestro": "registro-maestro",
    "registro-aprendo": "registro-aprendo",
    "entrar": "entrar",
  },
  "es-ES": {
    "investigacion": "investigacion",
    "arquitectura": "arquitectura",
    "codigo-abierto": "codigo-abierto",
    "niveles": "niveles",
    "origen": "origen",
    "registro-padre": "registro-padre",
    "registro-maestro": "registro-maestro",
    "registro-aprendo": "registro-aprendo",
    "entrar": "entrar",
  },
  "fr-FR": {
    "investigacion": "recherche",
    "arquitectura": "architecture",
    "codigo-abierto": "open-source",
    "niveles": "niveaux",
    "origen": "origine",
    "registro-padre": "inscription-parent",
    "registro-maestro": "inscription-enseignant",
    "registro-aprendo": "inscription-apprendre",
    "entrar": "connexion",
  },
  "pt-BR": {
    "investigacion": "pesquisa",
    "arquitectura": "arquitetura",
    "codigo-abierto": "codigo-aberto",
    "niveles": "niveis",
    "origen": "origem",
    "registro-padre": "cadastro-responsavel",
    "registro-maestro": "cadastro-professor",
    "registro-aprendo": "cadastro-aprender",
    "entrar": "entrar",
  },
  "pt-PT": {
    // pt-PT dice "investigação" donde Brasil dice "pesquisa": no es la misma
    // palabra con otra ortografía, es otra palabra. Sin cedilla ni tilde — un
    // carácter no-ASCII en una ruta se porcentualiza a `investiga%C3%A7%C3%A3o`,
    // y una URL porcentualizada es peor de leer, compartir y citar.
    "investigacion": "investigacao",
    "arquitectura": "arquitetura",
    "codigo-abierto": "codigo-aberto",
    "niveles": "niveis",
    "origen": "origem",
    "registro-padre": "registo-encarregado",
    "registro-maestro": "registo-professor",
    "registro-aprendo": "registo-aprender",
    "entrar": "entrar",
  },
  "de-DE": {
    "investigacion": "forschung",
    "arquitectura": "architektur",
    "codigo-abierto": "quelloffen",
    "niveles": "stufen",
    "origen": "ursprung",
    "registro-padre": "anmeldung-eltern",
    "registro-maestro": "anmeldung-lehrkraft",
    "registro-aprendo": "anmeldung-lernen",
    "entrar": "anmelden",
  },
};

/** Las secciones, en el orden en que se declararon. */
export const SECCIONES = Object.keys(SEGMENTOS["en"]);

/**
 * Las cinco secciones que existían ANTES de D-049, y solo ellas.
 *
 * Importa por una razón concreta: `redirecciones()` emite un 301 desde la URL
 * vieja de cada sección, y una sección que nunca tuvo URL vieja no tiene de
 * dónde redirigir. Sin esta lista, las tres puertas de registro generarían
 * `/de-DE/registro-padre/ → /de-DE/anmeldung-eltern/` — un 301 desde una URL que
 * jamás se publicó, o sea una regla que no puede acertar nunca y que alguien
 * tendría que entender dentro de un año.
 */
const SECCIONES_PREVIAS_A_D049 = ["investigacion", "arquitectura", "codigo-abierto", "niveles", "origen"];

/**
 * Las redirecciones 301 desde las URLs anteriores a D-049.
 *
 * Antes de D-049 los siete locales compartían el segmento español, así que
 * `/de-DE/investigacion/` existió y está en el `sitemap.xml`. Llevan horas
 * publicadas, no meses — pero un 404 en una URL que ya publicamos es un 404
 * igual, y las redirecciones cuestan una línea.
 *
 * Se omite el locale cuyo segmento no cambió (es-MX, es-ES): redirigir una URL
 * a sí misma es un bucle, y Cloudflare lo rechaza.
 *
 * El comodín del corpus va ANTES de la regla exacta a propósito — `_redirects`
 * aplica la primera coincidencia, y sin ese orden `/de-DE/investigacion/mc-05/`
 * caería en la regla de la portada de sección y perdería el documento.
 */
export function redirecciones() {
  const lineas = [];
  for (const [locale, tabla] of Object.entries(SEGMENTOS)) {
    for (const seccion of SECCIONES_PREVIAS_A_D049) {
      const nuevo = tabla[seccion];
      if (nuevo === seccion) continue;
      if (seccion === "investigacion") {
        lineas.push(`/${locale}/${seccion}/* /${locale}/${nuevo}/:splat 301`);
      }
      lineas.push(`/${locale}/${seccion}/ /${locale}/${nuevo}/ 301`);
    }
  }
  return lineas;
}
