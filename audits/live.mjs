#!/usr/bin/env node
// Verificación en vivo — lo desplegado, no lo que está por desplegarse.
//
// Corre a mano después de desplegar:  node audits/live.mjs
//
// Va aparte de la flota de audits/run.mjs a propósito: run.mjs revisa el
// cambio que estás por hacer, esto revisa producción. Mezclarlos haría que un
// commit fallara por una caída del sitio, que no es culpa del commit.

const ORIGIN = process.argv[2] ?? "https://math.kilowatto.com";
const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

const problems = [];
const ok = [];

const get = async (path, init) => {
  // Reintento: un 404 intermitente justo tras desplegar es propagación del
  // manifest de assets entre nodos, no un archivo faltante. Se comprobó
  // midiéndolo: 4 de 5 respuestas correctas, y 15 de 15 al minuto.
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(`${ORIGIN}${path}`, init);
      if (res.ok || i === 2) return res;
    } catch (err) {
      if (i === 2) throw err;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
};

// 1. Los siete locales responden
for (const l of LOCALES) {
  const res = await get(`/${l}/`);
  if (res?.ok) ok.push(`/${l}/`);
  else problems.push(`/${l}/ devolvió ${res?.status ?? "sin respuesta"}`);
}

// 2. Cero peticiones a terceros (mc-25, mc-30)
const html = await (await get("/en/")).text();
const thirdParty = (html.match(/googleapis|gstatic/g) ?? []).length;
if (thirdParty === 0) ok.push("cero peticiones a terceros");
else problems.push(`${thirdParty} referencia(s) a Google en la página`);

// 3. hreflang recíproco: los 7 + x-default, incluida la auto-referencia
const esMX = await (await get("/es-MX/")).text();
const head = esMX.split("</head>")[0];
for (const l of [...LOCALES, "x-default"]) {
  if (head.includes(`hreflang="${l}"`)) ok.push(`hreflang ${l}`);
  else problems.push(`falta hreflang="${l}" en el <head> de es-MX`);
}

// 4. HTTP/3 anunciado (D-030). alt-svc es la evidencia: medir la negociación
// con un curl que no habla h3 mediría la limitación de curl, no del servidor.
const headers = (await get("/en/")).headers;
const altSvc = headers.get("alt-svc") ?? "";
if (altSvc.includes("h3")) ok.push(`HTTP/3 anunciado (${altSvc.split(";")[0]})`);
else problems.push("sin alt-svc con h3: HTTP/3 no está activo en la zona");

// 4b. 0-RTT (D-030). No hay cabecera que inspeccionar: la evidencia está en el
// ticket de sesión de TLS 1.3. Si el servidor anuncia `Max Early Data: 0`, el
// ajuste está apagado, por mucho que HTTP/3 sí esté.
//
// Se mide con openssl porque `fetch` no expone early data. Hay que dejar la
// conexión abierta unos segundos: en TLS 1.3 el NewSessionTicket llega DESPUÉS
// del handshake, y cerrar de inmediato deja el archivo de sesión vacío — que
// fue exactamente cómo esta comprobación falló en silencio la primera vez.
try {
  const { execSync } = await import("node:child_process");
  const host = new URL(ORIGIN).hostname;
  const tmp = `/tmp/mc-0rtt-${process.pid}.pem`;
  execSync(
    `(printf 'GET / HTTP/1.1\\r\\nHost: ${host}\\r\\n\\r\\n'; sleep 4) | ` +
      `openssl s_client -connect ${host}:443 -servername ${host} -tls1_3 -sess_out ${tmp} 2>/dev/null >/dev/null`,
    { shell: "/bin/bash", timeout: 30000 },
  );
  const text = execSync(`openssl sess_id -in ${tmp} -text 2>/dev/null || true`, {
    encoding: "utf8",
    timeout: 15000,
  });
  execSync(`rm -f ${tmp}`);
  const m = text.match(/Max Early Data:\s*(\d+)/i);
  const maxEarly = m ? Number(m[1]) : null;
  if (maxEarly && maxEarly > 0) {
    ok.push(`0-RTT activo (max early data ${maxEarly})`);
  } else {
    problems.push(
      "0-RTT APAGADO (max early data 0) — actívalo en el dashboard: " +
        "Speed → Optimization → Protocol Optimization → 0-RTT Connection Resumption",
    );
  }
} catch (err) {
  problems.push(`0-RTT no se pudo medir: ${err.message}`);
}

// 4c. La inyección automática del beacon sigue APAGADA (D-037).
//
// Cloudflare puede inyectar el beacon de Web Analytics a nivel de zona, y eso lo
// pondría en TODAS las páginas sin pasar por el código — incluidas las de niños.
// `audits/telemetria-infantil.mjs` vigila el repo y es ciego a esto, porque no
// hay archivo que mirar. La única forma de comprobarlo es leer el HTML servido.
if (html.includes("cloudflareinsights.com") || html.includes("beacon.min.js")) {
  problems.push(
    "el beacon de Cloudflare aparece en el HTML servido — si nadie lo puso en el código, " +
      "la inyección automática de la zona está ENCENDIDA y hay que apagarla (D-037)",
  );
} else {
  ok.push("sin beacon inyectado por la zona (D-037)");
}

// 5. El camino de RPC nativo está vivo (D-030): web → ingest → D1
try {
  const health = await (await get("/api/health")).json();
  if (health?.ingest?.ok && health?.d1?.ok) {
    ok.push(`RPC web→ingest→D1 (${health.ingest.d1Tables} tablas, ${health.elapsedMs}ms)`);
  } else {
    problems.push(`/api/health degradado: ${JSON.stringify(health)}`);
  }
} catch (err) {
  problems.push(`/api/health no respondió: ${err.message}`);
}

// 5b. Turnstile carga de verdad en el formulario de entrar (línea roja #1,
// D-054). Nació de un incidente real: un despliegue desde un worktree limpio
// —aislado a propósito del checkout compartido— nunca tuvo `.env` (está en
// `.gitignore`, nunca se commitea), así que `TURNSTILE_SITE_KEY` quedó vacía
// en el build y el widget entero desapareció de los 7 locales. El servidor
// rechazaba cada intento con "sin_token" y nadie podía entrar ni registrarse,
// en ningún idioma — y `run.mjs` en verde y este mismo archivo antes de este
// punto no lo veían, porque ninguno mira el HTML servido de esta página en
// concreto. Se repite la consulta de las rutas: cada locale trae su propio
// slug (D-049), y "entrar" en inglés es "sign-in", no una traducción literal.
try {
  const { SEGMENTOS } = await import("../apps/web/src/i18n/rutas-tabla.mjs");
  for (const locale of LOCALES) {
    const slug = SEGMENTOS[locale]?.entrar;
    if (!slug) {
      problems.push(`no encontré el segmento "entrar" para ${locale} en rutas-tabla.mjs`);
      continue;
    }
    const paginaEntrar = await (await get(`/${locale}/${slug}/`)).text();
    if (paginaEntrar.includes("cf-turnstile") && paginaEntrar.includes("data-sitekey=")) {
      ok.push(`turnstile en /${locale}/${slug}/`);
    } else {
      problems.push(
        `/${locale}/${slug}/ NO tiene el widget de Turnstile — TURNSTILE_SITE_KEY pudo faltar en el ` +
          "build (revisa que .env viajó al worktree de despliegue) y nadie puede entrar ni registrarse.",
      );
    }
  }
} catch (err) {
  problems.push(`no se pudo comprobar Turnstile en /entrar/: ${err.message}`);
}

// 5-bis. Un formulario de verdad puede enviarse — no solo `fetch`
//
// Se añade después de romper la entrada en producción durante 45 minutos con
// una línea de configuración de tres palabras. `not_found_handling: "404-page"`
// hace que el enrutador de assets de Cloudflare reclame las peticiones de
// NAVEGACIÓN antes de que corra el Worker, y para un POST contesta **405 Method
// Not Allowed** sin que el Worker se entere. Ni `/api/entrar` ni `/api/registro`
// llegaban a ejecutarse: nadie podía entrar ni crear cuenta, en los 7 locales.
//
// Lo que hace esto tan malo de cazar es que **`curl` no lo reproduce**. La
// diferencia entera está en `Sec-Fetch-Mode: navigate`, que un navegador manda
// al enviar un `<form>` y `curl` no manda nunca:
//
//     curl pelado             → 303   (correcto)
//     curl + sec-fetch-mode   → 405   (roto)
//
// Así que se comprueba con las cabeceras de una navegación de verdad. Un 405, o
// cualquier `content-type: application/json`, significa que el formulario está
// roto — en Safari eso se ve como un diálogo ofreciendo DESCARGAR «entrar».
//
// Se manda a propósito una contraseña que no existe: lo que se comprueba es la
// FORMA de la respuesta, no que alguien entre. Nunca credenciales reales aquí.
for (const [ruta, nombre] of [["/api/entrar", "entrar"], ["/api/registro", "registro"]]) {
  try {
    const res = await fetch(`${ORIGIN}${ruta}`, {
      method: "POST",
      redirect: "manual",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "origin": ORIGIN,
        "referer": `${ORIGIN}/es-MX/entrar/`,
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
        "sec-fetch-site": "same-origin",
      },
      body: "correo=no-existe@ejemplo.invalid&clave=contrasena-que-no-es",
    });
    const tipo = res.headers.get("content-type") ?? "";
    if (res.status === 405) {
      problems.push(
        `POST ${ruta} desde un formulario devuelve 405: el enrutador de assets se está comiendo ` +
          "la petición y el Worker no corre. NADIE puede " +
          `${nombre === "entrar" ? "entrar" : "crear cuenta"}. Revisa \`not_found_handling\` en wrangler.jsonc.`,
      );
    } else if (res.status >= 300 && res.status < 400) {
      ok.push(`POST ${ruta} desde formulario → ${res.status} a ${res.headers.get("location")}`);
    } else if (tipo.includes("application/json")) {
      problems.push(
        `POST ${ruta} desde un formulario devuelve JSON (${res.status}). El navegador lo DESCARGA ` +
          "en vez de navegar — en Safari sale un diálogo ofreciendo guardar un archivo. " +
          "Usa `terminarBien`/`terminarMal` de lib/respuesta-de-formulario.ts.",
      );
    } else {
      problems.push(`POST ${ruta} desde un formulario devuelve ${res.status} (${tipo || "sin content-type"}), y se esperaba una redirección.`);
    }
  } catch (err) {
    problems.push(`no se pudo comprobar el envío de formulario a ${ruta}: ${err.message}`);
  }
}

// 5-ter. Una URL que no existe devuelve NUESTRA 404, no la de Astro
try {
  const res = await fetch(`${ORIGIN}/de-DE/esta-ruta-no-existe-nunca/`);
  const cuerpo = await res.text();
  if (res.status !== 404) {
    problems.push(`una URL inexistente devolvió ${res.status} en vez de 404`);
  } else if (cuerpo.includes("404: Not Found")) {
    problems.push(
      "una URL inexistente devuelve la página POR DEFECTO de Astro —gris, en inglés, sin marca y " +
        "sin enlace de vuelta— en vez de `src/pages/404.astro`.",
    );
  } else {
    ok.push("404 propia servida en una ruta inexistente");
  }
} catch (err) {
  problems.push(`no se pudo comprobar la 404: ${err.message}`);
}

// 6. Instalabilidad
const { default: _ } = { default: null };
const manifest = await (await get("/manifest.webmanifest")).json();
const sw = await get("/sw.js");
if (manifest?.icons?.length >= 2) ok.push("manifest con íconos");
else problems.push("manifest sin los íconos requeridos");
if (sw?.ok) ok.push("service worker servido");
else problems.push(`/sw.js devolvió ${sw?.status}`);

console.log(`Verificación en vivo — ${ORIGIN}\n`);
for (const p of problems) console.error(`  ✗ ${p}`);
if (problems.length === 0) {
  console.log(`  ✓ ${ok.length} comprobaciones`);
  for (const o of ok) console.log(`    · ${o}`);
} else {
  console.error(`\n  ${problems.length} problema(s), ${ok.length} bien`);
  process.exit(1);
}
