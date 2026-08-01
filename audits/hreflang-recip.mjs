#!/usr/bin/env node
// Auditor determinista 09 — hreflang recíproco entre los 7 locales + x-default
//
// Hace cumplir: D-022 (siete locales, no cinco idiomas), mc-48 §3 y §7 punto 5,
// mc-34 (es-MX y es-ES no son la misma página traducida).
//
// Corre contra producción:
//     node audits/hreflang-recip.mjs
//     node audits/hreflang-recip.mjs http://127.0.0.1:4321   (otro origen)
//
// Por qué existe, y por qué no basta con la comprobación que ya hace live.mjs.
// live.mjs mira UNA página —es-MX— y comprueba que la cadena `hreflang="xx"`
// aparezca en su <head>. Eso detecta que a alguien se le olvidó un locale, y
// nada más. No detecta lo único que a Google realmente le importa:
//
//   · que cada página se apunte a SÍ MISMA. Sin auto-referencia el grupo no
//     tiene ancla y Google lo descarta entero.
//   · que la relación sea RECÍPROCA: si /en/ dice que /de-DE/ es su alternativa
//     en alemán, /de-DE/ tiene que decir que /en/ es su alternativa en inglés.
//     Un enlace de ida sin vuelta se ignora, y arrastra al grupo con él.
//   · que las URLs declaradas EXISTAN. Este es el fallo que ya tuvo este repo:
//     con `build.format: "file"` Astro generaba /en.html mientras el canonical
//     y los hreflang decían /en/. El navegador llegaba igual —Cloudflare Pages
//     resuelve ambas— así que nadie lo notó mirando el sitio. Pero la URL
//     declarada y la URL real eran distintas, el ciclo no cerraba, y el grupo
//     de idiomas entero quedaba invalidado. Por eso aquí no se comprueba que la
//     URL esté escrita: se comprueba que responda 200 sin redirigir.
//
// El castigo por fallar esto no es "peor posicionamiento en un locale". Es que
// Google ignore el grupo COMPLETO — los siete a la vez (mc-48 §3). Un producto
// que existe en siete locales precisamente porque la notación matemática no se
// traduce (mc-34) no puede permitirse que los siete se traten como duplicados.
//
// Lo que este auditor NO puede comprobar, dicho aquí en vez de fingir que sí:
//
//   1. Si Google efectivamente indexó el grupo. Eso solo lo dice Search Console
//      semanas después, y ninguna API lo expone de forma verificable.
//   2. Que el CONTENIDO de cada locale sea realmente distinto. Declarar es-MX y
//      es-ES apuntando a dos URLs con el mismo texto sería técnicamente válido
//      y factualmente incorrecto (mc-48 §3). Esto mide la topología, no la
//      autoría.
//   3. El hreflang servido por cabecera HTTP `Link:` o por sitemap XML. Este
//      sitio los declara en el <head> y solo ahí; si algún día se mueven, este
//      auditor deja de ver la mitad del cuadro y hay que ampliarlo.
//   4. Nada de lo que pase en las páginas que aún no existen. Hoy el grupo son
//      las siete portadas. Cuando haya /es-MX/retos/, cada nueva ruta necesita
//      su propio ciclo y este auditor solo mirará las que le enumeren abajo.

const ORIGEN = (process.argv[2] ?? "https://math.kilowatto.com").replace(/\/$/, "");

// Los siete de D-022. No son cinco idiomas: es-MX y es-ES no comparten
// separador decimal, pt-BR y pt-PT no comparten escala numérica (mc-34).
const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

// Las rutas que forman un grupo de hreflang. Hoy solo la portada de cada
// locale. Cada entrada nueva es un grupo nuevo que tiene que cerrar por su
// cuenta: /es-MX/retos/ no cierra ciclo con /en/, cierra con /en/retos/.
const GRUPOS = [{ nombre: "portada", ruta: (l) => `/${l}/` }];

const problemas = [];
const bien = [];

// Reintento igual que live.mjs: un 404 intermitente justo tras desplegar es la
// propagación del manifest de assets entre nodos, no un archivo que falta.
const pedir = async (url, init = {}) => {
  let ultimo = null;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(15000),
        headers: { "user-agent": "math-challenge-audit/hreflang-recip" },
        ...init,
      });
      if (res.status === 200 || i === 2) return res;
      ultimo = res;
    } catch (err) {
      ultimo = err;
      if (i === 2) return err;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return ultimo;
};

// Normaliza para COMPARAR, no para arreglar. El esquema y el host se pasan a
// minúsculas porque son insensibles a mayúsculas por RFC 3986; la ruta NO se
// toca, porque /es-mx/ y /es-MX/ son dos rutas distintas y confundirlas sería
// esconder justo el tipo de error que este auditor busca. La barra final
// tampoco se normaliza: /en y /en/ son URLs distintas, y esa distinción es
// literalmente el fallo de `build.format: "file"` que motivó todo esto.
const canonizar = (crudo, base) => {
  try {
    const u = new URL(crudo, base);
    u.hash = "";
    return u.toString();
  } catch {
    return null;
  }
};

// Extractor de <link>. Se hace a mano en vez de con un parser de HTML porque
// meter una dependencia para leer cuatro atributos no se justifica, y porque el
// HTML que genera Astro es predecible. Si algún día el <head> se vuelve HTML
// que un regex no puede leer, esto tiene que cambiar a un parser de verdad —
// no ampliarse con más regex.
const ATRIBUTO = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;

const leerEnlaces = (html) => {
  // Solo el <head>. Google exige los <link rel="alternate"> en la cabecera; uno
  // en el <body> lo escribió alguien que creía estar declarando el grupo y no
  // lo estaba.
  const corte = html.toLowerCase().indexOf("</head>");
  const cabeza = corte === -1 ? "" : html.slice(0, corte);
  const cuerpo = corte === -1 ? html : html.slice(corte);

  const sacar = (trozo) => {
    const salida = [];
    for (const etiqueta of trozo.match(/<link\b[^>]*>/gi) ?? []) {
      const attrs = {};
      for (const m of etiqueta.matchAll(ATRIBUTO)) {
        attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
      }
      salida.push(attrs);
    }
    return salida;
  };

  const deCabeza = sacar(cabeza);
  return {
    huboCabeza: corte !== -1,
    alternos: deCabeza.filter((a) => (a.rel ?? "").toLowerCase() === "alternate" && a.hreflang),
    canonical: deCabeza.find((a) => (a.rel ?? "").toLowerCase() === "canonical")?.href ?? null,
    alternosFueraDeCabeza: sacar(cuerpo).filter(
      (a) => (a.rel ?? "").toLowerCase() === "alternate" && a.hreflang,
    ),
  };
};

// El código de hreflang es insensible a mayúsculas por especificación, así que
// para EMPAREJAR se normaliza. Pero se guarda el original: escribir "es-mx"
// funciona para Google y aun así es una desviación de D-022 que conviene ver,
// porque el mismo descuido en la RUTA sí rompe (Cloudflare Pages sirve rutas
// sensibles a mayúsculas).
const clave = (codigo) => codigo.trim().toLowerCase();
const CANONICO = new Map([...LOCALES, "x-default"].map((l) => [clave(l), l]));

let paginasVivas = 0;
let alternosTotales = 0;

for (const grupo of GRUPOS) {
  // ── 1. Traer las siete páginas del grupo ───────────────────────────────
  const paginas = new Map(); // url canónica -> { locale, url, enlaces }

  for (const locale of LOCALES) {
    const url = canonizar(grupo.ruta(locale), ORIGEN + "/");
    const res = await pedir(url);

    if (res instanceof Error) {
      problemas.push(`${grupo.nombre} · ${url} no respondió: ${res.message}`);
      continue;
    }
    if (res.status !== 200) {
      const destino = res.headers.get("location");
      problemas.push(
        `${grupo.nombre} · ${url} devolvió ${res.status}` +
          (destino ? ` → ${destino}` : "") +
          `. Una página del grupo que no existe en su propia URL no puede cerrar ciclo.`,
      );
      continue;
    }

    paginasVivas++;
    const html = await res.text();
    const enlaces = leerEnlaces(html);
    if (!enlaces.huboCabeza) {
      problemas.push(`${grupo.nombre} · ${url}: no se encontró </head>, no hay cabecera que leer.`);
      continue;
    }
    alternosTotales += enlaces.alternos.length;
    paginas.set(url, { locale, url, ...enlaces });
  }

  // Falla cerrado. Si no se pudo leer ninguna página, este auditor no comprobó
  // nada — y un auditor que no comprueba nada NO pasa. Fue un bug real de este
  // repo (audits/secrets.mjs, ciego en un clon sin commits) y no se repite.
  if (paginas.size === 0) {
    problemas.push(
      `${grupo.nombre} · 0 páginas legibles en ${ORIGEN}. ` +
        `Un escáner que no ve nada pasa siempre; este falla.`,
    );
    continue;
  }
  if (paginas.size < LOCALES.length) {
    problemas.push(
      `${grupo.nombre} · solo ${paginas.size} de ${LOCALES.length} páginas legibles. ` +
        `El grupo se juzga completo o no se juzga.`,
    );
  }

  // ── 2. Cada página: auto-referencia, cobertura, canonical ──────────────
  for (const pagina of paginas.values()) {
    const etiqueta = `${grupo.nombre} · ${pagina.locale}`;

    if (pagina.alternos.length === 0) {
      problemas.push(`${etiqueta}: ni un solo <link rel="alternate" hreflang> en el <head>.`);
      continue;
    }
    if (pagina.alternosFueraDeCabeza.length > 0) {
      problemas.push(
        `${etiqueta}: ${pagina.alternosFueraDeCabeza.length} hreflang fuera del <head>. ` +
          `Google solo lee los de la cabecera: esos no cuentan, aunque se vean en el HTML.`,
      );
    }

    // Declarados de esta página: código normalizado -> URL absoluta.
    const declara = new Map();
    for (const a of pagina.alternos) {
      const k = clave(a.hreflang);

      if (!CANONICO.has(k)) {
        problemas.push(
          `${etiqueta}: declara hreflang="${a.hreflang}", que no es ninguno de los siete de ` +
            `D-022 ni x-default. Un código de más contamina el grupo igual que uno de menos.`,
        );
        continue;
      }
      if (CANONICO.get(k) !== a.hreflang.trim()) {
        problemas.push(
          `${etiqueta}: hreflang="${a.hreflang}" debería escribirse "${CANONICO.get(k)}" (D-022). ` +
            `El código lo tolera Google, pero la misma mayúscula equivocada en la RUTA no la ` +
            `tolera Cloudflare Pages.`,
        );
      }

      // Google exige URL completamente calificada. Una relativa funciona en el
      // navegador y no funciona para el rastreador.
      if (!/^https?:\/\//i.test(a.href ?? "")) {
        problemas.push(
          `${etiqueta}: hreflang="${a.hreflang}" apunta a "${a.href}", que no es una URL ` +
            `absoluta. hreflang exige URL completa con esquema y host.`,
        );
      }

      const destino = canonizar(a.href ?? "", pagina.url);
      if (!destino) {
        problemas.push(`${etiqueta}: hreflang="${a.hreflang}" tiene un href ilegible: "${a.href}".`);
        continue;
      }
      if (declara.has(k) && declara.get(k) !== destino) {
        problemas.push(
          `${etiqueta}: declara hreflang="${a.hreflang}" dos veces con URLs distintas ` +
            `(${declara.get(k)} y ${destino}). Google no elige: descarta.`,
        );
      }
      declara.set(k, destino);
    }
    pagina.declara = declara;

    // Auto-referencia. Es la comprobación que más se olvida y la que más caro
    // cuesta: sin ella el grupo entero se ignora, no solo esta página.
    const propio = declara.get(clave(pagina.locale));
    if (!propio) {
      problemas.push(
        `${etiqueta}: NO se auto-referencia — falta hreflang="${pagina.locale}". ` +
          `Sin auto-referencia Google ignora el grupo completo, los siete.`,
      );
    } else if (propio !== pagina.url) {
      problemas.push(
        `${etiqueta}: se auto-referencia a ${propio} pero se sirve en ${pagina.url}. ` +
          `Son URLs distintas: el ciclo no cierra.`,
      );
    }

    // Cobertura: los siete más x-default.
    for (const esperado of [...LOCALES, "x-default"]) {
      if (!declara.has(clave(esperado))) {
        problemas.push(`${etiqueta}: falta hreflang="${esperado}" (D-022 + x-default, mc-48 §3).`);
      }
    }

    // El canonical tiene que coincidir con la URL servida. Este es el fallo de
    // `build.format: "file"` en su forma exacta: /en.html servido, canonical
    // /en/. Un canonical que apunta a otra URL le dice a Google "indexa aquella,
    // no esta" — y aquella no es la que declara el grupo.
    if (!pagina.canonical) {
      problemas.push(`${etiqueta}: sin <link rel="canonical">. hreflang y canonical se leen juntos.`);
    } else {
      const can = canonizar(pagina.canonical, pagina.url);
      if (can !== pagina.url) {
        problemas.push(
          `${etiqueta}: canonical ${can} ≠ URL servida ${pagina.url}. ` +
            `El canonical manda sobre el hreflang: apuntar fuera del grupo lo anula.`,
        );
      }
    }
  }

  // ── 3. Reciprocidad: si A dice B, B tiene que decir A ──────────────────
  for (const a of paginas.values()) {
    if (!a.declara) continue;
    const suPropia = a.declara.get(clave(a.locale)) ?? a.url;

    for (const [codigo, destino] of a.declara) {
      if (codigo === "x-default") continue; // x-default se juzga aparte: es un alias, no un miembro.

      const b = paginas.get(destino);
      if (!b) {
        problemas.push(
          `${grupo.nombre} · ${a.locale} → hreflang="${CANONICO.get(codigo)}" apunta a ${destino}, ` +
            `que no es ninguna de las páginas del grupo. Un enlace hacia fuera no vuelve.`,
        );
        continue;
      }
      if (!b.declara) continue;

      const vuelta = b.declara.get(clave(a.locale));
      if (!vuelta) {
        problemas.push(
          `${grupo.nombre} · ${a.locale} → ${b.locale}, pero ${b.locale} NO declara ` +
            `hreflang="${a.locale}". Un enlace de ida sin vuelta se ignora, y arrastra al grupo.`,
        );
      } else if (vuelta !== suPropia) {
        problemas.push(
          `${grupo.nombre} · ${a.locale} → ${b.locale} → ${vuelta}, pero ${a.locale} se declara ` +
            `en ${suPropia}. La vuelta llega a otra URL: no es recíproco.`,
        );
      }
    }
  }

  // ── 4. x-default: uno solo, el mismo para todos ────────────────────────
  const xdefaults = new Set();
  for (const p of paginas.values()) {
    const x = p.declara?.get("x-default");
    if (x) xdefaults.add(x);
  }
  if (xdefaults.size > 1) {
    problemas.push(
      `${grupo.nombre} · x-default apunta a ${xdefaults.size} URLs distintas según la página ` +
        `(${[...xdefaults].join(", ")}). El grupo tiene que declarar el mismo respaldo desde todas.`,
    );
  }

  // ── 5. Que las URLs declaradas EXISTAN de verdad ───────────────────────
  //
  // Escribir la URL correcta y servir otra es el fallo que este repo ya tuvo.
  // Por eso `redirect: "manual"`: un 301 significa que la URL declarada NO es
  // la URL final, y declarar una URL que redirige es declarar la equivocada.
  const urls = new Set();
  for (const p of paginas.values()) for (const u of p.declara?.values() ?? []) urls.add(u);

  if (urls.size === 0) {
    problemas.push(`${grupo.nombre} · ninguna URL declarada que comprobar. Falla cerrado.`);
  }

  const resultados = await Promise.all(
    [...urls].map(async (u) => [u, await pedir(u, { method: "GET" })]),
  );
  for (const [u, res] of resultados) {
    if (res instanceof Error) {
      problemas.push(`${grupo.nombre} · URL declarada ${u} no respondió: ${res.message}`);
    } else if (res.status >= 300 && res.status < 400) {
      problemas.push(
        `${grupo.nombre} · URL declarada ${u} responde ${res.status} → ${res.headers.get("location")}. ` +
          `Está escrita bien y sirve otra cosa: exactamente el fallo de \`build.format: "file"\` ` +
          `(/en.html servido, /en/ declarado). El navegador llega; el ciclo no cierra.`,
      );
    } else if (res.status !== 200) {
      problemas.push(`${grupo.nombre} · URL declarada ${u} responde ${res.status}, no existe.`);
    }
  }

  if (problemas.length === 0) {
    bien.push(
      `${grupo.nombre}: ${paginas.size} páginas, ${LOCALES.length} locales + x-default, ` +
        `${urls.size} URL(s) declaradas y todas en 200`,
    );
  }
}

// Segundo guardia de falla cerrada, a nivel de todo el auditor.
if (paginasVivas === 0 || alternosTotales === 0) {
  problemas.push(
    `0 páginas o 0 hreflang leídos en ${ORIGEN}. No se comprobó nada, así que no se pasa.`,
  );
}

if (problemas.length > 0) {
  console.error("✗ hreflang-recip\n");
  for (const p of problemas) console.error(`  · ${p}`);
  console.error(`\n  Hace cumplir: D-022, mc-48 §3, mc-34`);
  console.error(`  Origen medido: ${ORIGEN}`);
  console.error(`  El castigo no es un locale peor posicionado: Google descarta el`);
  console.error(`  grupo de idiomas COMPLETO, los siete a la vez (mc-48 §3).`);
  process.exit(1);
}

console.log(
  `✓ hreflang-recip — ${LOCALES.length} locales + x-default, recíproco y con auto-referencia en ${ORIGEN}`,
);
for (const b of bien) console.log(`  · ${b}`);
console.log(`  · cada URL declarada devuelve 200 sin redirigir (la trampa de build.format: "file")`);
console.log(`  · no comprueba: que Google lo haya indexado, ni que el contenido de cada locale sea distinto`);
