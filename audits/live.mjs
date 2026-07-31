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
