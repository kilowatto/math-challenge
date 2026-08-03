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
  ok.push("sin beacon RUM de Cloudflare en el HTML servido");
}

// 4-bis. Zaraz — la inyección que el HTML NO delata
//
// La comprobación de arriba busca cadenas en el HTML, y durante meses pasó en
// verde diciendo «sin beacon inyectado por la zona (D-037)». Era mentira:
// **Zaraz se inyecta en el borde y no deja ninguna cadena que buscar.** Un
// auditor que no puede ver lo que vigila y aun así pasa en verde es peor que no
// tenerlo — da confianza falsa. Es lo que D-070 llama una aserción cierta por
// construcción, con otra cara.
//
// La única forma de saberlo desde fuera es preguntarle al endpoint: si Zaraz
// está apagado en la zona, `/cdn-cgi/zaraz/s.js` da 404. Si está encendido, da
// 400 «Invalid Zaraz parameters» — el endpoint existe.
//
// D-076: el dueño decidió que Zaraz SE QUEDA porque no puede apagarlo. Así que
// esto ya no bloquea; informa. Lo que NO se acepta es volver a no saberlo: el
// día que se pueda apagar, esta línea lo dirá.
try {
  const z = await fetch(`${ORIGIN}/cdn-cgi/zaraz/s.js`);
  if (z.status === 404) {
    ok.push("Zaraz apagado en la zona (404) — se puede cerrar #369 y revisar D-076");
  } else {
    ok.push(`Zaraz ENCENDIDO en la zona (${z.status}) — aceptado por D-076, no es un hallazgo nuevo`);
  }
} catch (err) {
  problems.push(`no se pudo comprobar el estado de Zaraz: ${err.message}`);
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

// ───────────────────────────────────────────────────────────────────────────
// 5-quater. Una cuenta RECIÉN CREADA llega a la acción principal de su tipo
//
// Hace cumplir: #341 bug 2, D-026, D-034, D-065.
//
// ─── Por qué esto no se puede comprobar leyendo código ─────────────────────
//
// `esFamilia` valía `hijos.length > 0`. Un padre con cero hijos —**el estado de
// TODA cuenta recién creada**— no era ni familia ni aprendiz: se quedaba con
// una sola pestaña, `Privada.astro` esconde la franja cuando solo hay una (un
// menú de un elemento no es un menú), aterrizaba en sus propios ajustes de
// contraseña, y **no había ninguna forma de crear el primer perfil de hijo**
// porque ese botón vive en la pestaña que no existía. La pantalla vacía
// correcta ya estaba escrita y era inalcanzable.
//
// Lo que falló no fue el arreglo: fue la verificación. Se comprobó con `curl`
// sin sesión, y sin sesión `/app/**` responde 302 a `/entrar/` y no se ve nada.
// Por eso esto SIEMBRA una sesión de verdad contra producción.
//
// ─── Por qué no puede ser cierto por construcción (D-070) ──────────────────
//
// Las dos fuentes son de sistemas distintos: el TIPO de cuenta se escribe en
// D1 (`users.is_learner`) desde aquí, y la ACCIÓN PRINCIPAL se lee del HTML que
// el Worker sirve. Nada del producto participa en la primera. Se comprueba
// además cruzado: la cuenta de familia tiene que poder crear un perfil y la de
// aprendiz tiene que poder practicar, así que un panel que enseñara siempre lo
// mismo fallaría uno de los dos casos por definición.
//
// ─── LO QUE ESTA COMPROBACIÓN NO HACE ──────────────────────────────────────
//
//  · NO pasa por el registro real. Siembra la fila y el token directamente, así
//    que un `/api/registro` roto —Turnstile, contraseña, correo duplicado— no
//    lo ve. Eso es la comprobación 5-bis, que sí manda el formulario.
//  · NO comprueba que la acción principal FUNCIONE al pulsarla: comprueba que
//    existe y que su página responde. Crear un perfil de verdad dejaría un
//    niño en la base de producción.
//  · NO mide los siete locales: siembra en `en`. Las rutas de `/app/**` no se
//    traducen (`rutas-app.ts`), así que el locale no cambia la estructura.
//  · Escribe en producción — D1 y KV — y borra al terminar, pase lo que pase.
//    Si el proceso muere entre la siembra y el borrado, queda una fila con
//    correo `auditor-sesion-…@math-challenge.invalid`; la corrida siguiente la
//    barre antes de empezar.
// ───────────────────────────────────────────────────────────────────────────

// Por defecto solo se siembra contra producción: es lo único que este archivo
// juzga. `--sembrar` lo fuerza contra cualquier origen, y existe para el CONTROL
// NEGATIVO: se levanta `wrangler dev --remote` con el bug de #341 restaurado a
// mano y se comprueba que esto lo caza. Sin esa vía no habría forma de ver
// fallar la comprobación sin desplegar el bug a producción.
const SEMBRAR =
  !process.argv.includes("--sin-sesion") &&
  (ORIGIN.includes("math.kilowatto.com") || process.argv.includes("--sembrar"));

if (!SEMBRAR) {
  // Un salto silencioso es exactamente cómo estos dos bugs llegaron al teléfono
  // del dueño. Si no se siembra, se dice.
  console.log(
    "○ sesión sembrada: OMITIDA " +
      (ORIGIN.includes("math.kilowatto.com") ? "(--sin-sesion)" : "(origen que no es producción)") +
      " — el área privada NO se verificó.",
  );
} else {
  const { execFileSync } = await import("node:child_process");
  const { writeFileSync } = await import("node:fs");
  const crypto = await import("node:crypto");

  // wrangler carga `.env` por su cuenta, y el `CLOUDFLARE_API_TOKEN` de Workers
  // AI que vive ahí ECLIPSA la sesión OAuth: sin esto, todo falla con
  // `Authentication error [code: 10000]`. Es la misma trampa de CLAUDE.md.
  const VACIO = `/tmp/mc-live-vacio-${process.pid}.env`;
  writeFileSync(VACIO, "");

  const RAIZ = new URL("..", import.meta.url).pathname;
  const wrangler = (args) =>
    execFileSync("npx", ["wrangler", ...args, `--env-file=${VACIO}`], {
      cwd: RAIZ,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 120000,
    });

  // El id del namespace y el nombre de la base salen de `wrangler.jsonc`, no de
  // una constante aquí: dos copias del mismo id es cómo una se queda vieja.
  const conf = (await import("node:fs")).readFileSync(`${RAIZ}wrangler.jsonc`, "utf8");
  const sinComentarios = conf.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/[^\n]*$/gm, "");
  const KV_SESIONES = JSON.parse(sinComentarios).kv_namespaces.find((n) => n.binding === "SESSION_KV")?.id;
  const BASE = JSON.parse(sinComentarios).d1_databases.find((d) => d.binding === "DB")?.database_name;

  // `--local` siembra en el estado de `wrangler dev` en vez de en producción.
  // Existe para el CONTROL NEGATIVO: levantar el sitio con el bug de #341
  // restaurado a mano y ver esta comprobación BLOQUEAR, sin desplegarle el bug
  // a nadie. Contra producción no hay forma de ver fallar esto sin romperla.
  const ALMACEN = process.argv.includes("--local") ? "--local" : "--remote";
  const d1 = (sql) => wrangler(["d1", "execute", BASE, ALMACEN, "--command", sql]);
  const CORREO = "auditor-sesion-";

  /** Una cuenta y su token de sesión. `intent` es solo intención observada. */
  const cuentas = [
    {
      nombre: "familia recién creada (0 hijos)",
      learner: 0,
      intent: "PADRE",
      // La acción principal de una cuenta a cargo de alguien: crear el primer
      // perfil. Vive en la pestaña «Hijos», que es justo la que desapareció.
      vista: "hijos",
      espera: "/en/app/perfil-nuevo/",
      queEs: "crear el primer perfil de hijo",
    },
    {
      nombre: "adulto que aprende solo (is_learner=1)",
      learner: 1,
      intent: "ADULTO_APRENDE",
      vista: "practicar",
      espera: "/en/app/practicar/",
      queEs: "ponerse a practicar",
    },
  ];

  const sembradas = [];
  try {
    // Barrido de restos de una corrida que muriera a medias.
    try {
      d1(`DELETE FROM users WHERE email LIKE '${CORREO}%'`);
    } catch {
      /* si la base no responde lo dirá la siembra, con mejor mensaje */
    }

    for (const c of cuentas) {
      c.userId = crypto.randomUUID();
      c.token = crypto.randomBytes(32).toString("base64url");
      const ahora = Date.now();
      d1(
        `INSERT INTO users (id, email, email_verified, locale, is_learner, created_at, updated_at) ` +
          `VALUES ('${c.userId}', '${CORREO}${c.token.slice(0, 12)}@math-challenge.invalid', 0, 'en', ${c.learner}, ${ahora}, ${ahora})`,
      );
      wrangler([
        "kv", "key", "put",
        `s:${c.token}`,
        JSON.stringify({ userId: c.userId, creadaEn: ahora, intent: c.intent }),
        "--namespace-id", KV_SESIONES, ALMACEN, "--ttl", "300",
      ]);
      sembradas.push(c);
    }

    for (const c of sembradas) {
      const cabeceras = { Cookie: `mc_s=${c.token}; mc_p=1` };

      const casa = await fetch(`${ORIGIN}/en/app/`, { headers: cabeceras, redirect: "manual" });
      if (casa.status !== 200) {
        problems.push(
          `una cuenta ${c.nombre} pide /en/app/ con sesión válida y recibe ${casa.status}` +
            `${casa.headers.get("location") ? ` → ${casa.headers.get("location")}` : ""}. ` +
            "Con sesión sembrada en KV eso es la casa echando a quien acaba de entrar.",
        );
        continue;
      }
      const html = await casa.text();

      // 1. Hay MENÚ. `Privada.astro` esconde la franja con una sola pestaña, y
      //    «sin menú» fue literalmente cómo el dueño reportó el bug.
      const pestanas = new Set([...html.matchAll(/\/en\/app\/\?vista=([a-z]+)/g)].map((m) => m[1]));
      if (pestanas.size < 2) {
        problems.push(
          `una cuenta ${c.nombre} ve ${pestanas.size} pestaña(s) en /en/app/. Con una sola, Privada.astro ` +
            "no pinta la franja: es el «sin menú» de #341, y con él no hay forma de llegar a nada.",
        );
      } else {
        ok.push(`${c.nombre}: ${pestanas.size} pestañas (${[...pestanas].join(", ")})`);
      }

      // 2. No aterriza en sus propios ajustes. Entrar y caer en contraseñas y
      //    llaves de acceso es el aterrizaje equivocado que ya se corrigió una
      //    vez y volvió.
      const activa = html.match(/\/en\/app\/\?vista=([a-z]+)"[^>]*aria-current="page"/);
      if (activa && activa[1] === "cuenta") {
        problems.push(
          `una cuenta ${c.nombre} aterriza en la vista «cuenta» — contraseñas y llaves de acceso. ` +
            "Nadie se registra para administrar su contraseña.",
        );
      } else if (activa) {
        ok.push(`${c.nombre}: aterriza en «${activa[1]}», no en ajustes`);
      }

      // 3. La acción principal EXISTE y su página responde.
      const conVista = await fetch(`${ORIGIN}/en/app/?vista=${c.vista}`, { headers: cabeceras });
      const htmlVista = conVista.ok ? await conVista.text() : "";
      if (!htmlVista.includes(`href="${c.espera}"`)) {
        problems.push(
          `una cuenta ${c.nombre} no encuentra su acción principal (${c.queEs}): ningún enlace a ` +
            `${c.espera} en /en/app/?vista=${c.vista}. La pantalla existe y es inalcanzable — que es ` +
            "exactamente el bug 2 de #341, y el mismo tipo que `funcion-sin-llamar` caza en el código.",
        );
        continue;
      }

      const destino = await fetch(`${ORIGIN}${c.espera}`, { headers: cabeceras, redirect: "manual" });
      if (destino.status !== 200) {
        problems.push(
          `la acción principal de una cuenta ${c.nombre} (${c.espera}) devuelve ${destino.status} con ` +
            "sesión válida. El enlace existe y no lleva a ningún sitio.",
        );
      } else {
        const cuerpo = await destino.text();
        if (cuerpo.trim().length === 0) {
          problems.push(
            `${c.espera} devuelve 200 con CERO BYTES. Es el síntoma de un componente usado sin importar ` +
              "(`audits/componente-sin-importar.mjs`), y no lo ve ni el build ni el despliegue.",
          );
        } else {
          ok.push(`${c.nombre}: ${c.queEs} → ${c.espera} 200 (${cuerpo.length} bytes)`);
        }
      }
    }
  } catch (err) {
    problems.push(
      `no se pudo sembrar la sesión de prueba: ${String(err.message ?? err).split("\n")[0]}. ` +
        "Sin esto el área privada NO se verificó — que es cómo los dos bugs de #341 llegaron al " +
        "teléfono del dueño. Hace falta `wrangler` autenticado. Para saltarlo a propósito: --sin-sesion.",
    );
  } finally {
    // Se borra pase lo que pase. Una fila de prueba olvidada en producción es
    // peor que no haber probado.
    for (const c of sembradas) {
      try {
        wrangler(["kv", "key", "delete", `s:${c.token}`, "--namespace-id", KV_SESIONES, ALMACEN]);
      } catch { /* el TTL de 300s lo remata igual */ }
    }
    try {
      d1(`DELETE FROM users WHERE email LIKE '${CORREO}%'`);
      ok.push("las cuentas sembradas se borraron de D1 y KV");
    } catch (err) {
      problems.push(
        `NO se pudieron borrar las cuentas sembradas de D1: ${String(err.message ?? err).split("\n")[0]}. ` +
          `Bórralas a mano: DELETE FROM users WHERE email LIKE '${CORREO}%'`,
      );
    }
  }
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
