// De dónde sale la inferencia de la flota.
//
// **Workers AI, y solo Workers AI** (D-035). Decisión del dueño: este proyecto
// corre entero sobre Cloudflare. No hay proveedor alterno ni variable de
// escape — si la hubiera, sería una puerta trasera a una dependencia que la
// decisión eliminó a propósito.
//
// La cadena imita la que Larry ya corre en producción en IOS y que `mc-37`
// documenta con archivo:línea — `kimi-k2.6` primero, `gpt-oss-120b` de
// respaldo.
//
// Lo que hay que reponer a mano por no usar una API que imponga el esquema:
// Workers AI declara su JSON Mode como best-effort — "Workers AI can't
// guarantee that the model responds according to the requested JSON Schema".
// Por eso aquí hay validación propia y reintento, y por eso un veredicto que no
// valida cuenta como **fallo del auditor, nunca como auditor limpio**.
//
// Medido en una corrida real contra violaciones plantadas a propósito:
// `kimi-k2.6` las cazó las tres, citó las decisiones correctas y clasificó bien
// qué bloquea y qué no. La flota no está ciega.

import { validar, extraerJSON } from "./esquema.mjs";

// --- Workers AI ------------------------------------------------------------
// Confirmados disponibles en la cuenta con `npx wrangler ai models`.
export const CADENA_WORKERS_AI = [
  process.env.MC_AUDIT_MODELO ?? "@cf/moonshotai/kimi-k2.6",
  process.env.MC_AUDIT_MODELO_RESPALDO ?? "@cf/openai/gpt-oss-120b",
];

// Precios por millón de tokens, de la página de precios de Workers AI.
// `cacheada` es entrada servida por caché de prefijo, que Workers AI activa
// sola en los modelos compatibles.
export const PRECIOS = {
  "@cf/moonshotai/kimi-k2.6": { entrada: 0.95, cacheada: 0.16, salida: 4.0, contexto: 262_144 },
  "@cf/moonshotai/kimi-k2.7-code": { entrada: 0.95, cacheada: 0.16, salida: 4.0, contexto: 262_144 },
  "@cf/openai/gpt-oss-120b": { entrada: 0.35, cacheada: null, salida: 0.75, contexto: 128_000 },
  "@cf/openai/gpt-oss-20b": { entrada: 0.2, cacheada: null, salida: 0.3, contexto: 128_000 },
};

// Medido: un auditor con 19k tokens de entrada gastó 7,560 de salida —94% de un
// presupuesto de 8,000— casi todo en razonamiento. Ese margen no aguanta un
// auditor con más archivos, así que el default sube. Lo que se cobra es lo que
// se usa, no el tope: subirlo no cuesta si no se ocupa.
export const MAX_TOKENS = Number(process.env.MC_AUDIT_MAX_TOKENS ?? 24_000);
const TOPE_MS = Number(process.env.MC_AUDIT_TOPE_MS ?? 300_000);

const cuenta = () => process.env.CLOUDFLARE_ACCOUNT_ID;
const token = () => process.env.CLOUDFLARE_API_TOKEN;

/**
 * Una sola llamada a Workers AI por el endpoint compatible con OpenAI.
 *
 * Se usa `/ai/v1/chat/completions` y no `/ai/run/{modelo}` porque
 * `response_format` con `json_schema` es una convención de OpenAI: por esa
 * puerta tiene más probabilidad de ser honrada que por la nativa.
 */
async function llamarWorkersAI({ modelo, sistema, usuario, esquema, sesion, maxTokens }) {
  // Sin esto, un proveedor que no responde deja al corredor esperando para
  // siempre sin decir nada — y "colgado" es indistinguible de "pensando" cuando
  // el modelo es de razonamiento. Se midió: kimi tarda ~9 s en un caso trivial.
  const ctrl = new AbortController();
  const reloj = setTimeout(() => ctrl.abort(), TOPE_MS);

  let res;
  try {
    res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${cuenta()}/ai/v1/chat/completions`,
    {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        authorization: `Bearer ${token()}`,
        "content-type": "application/json",
        // Manda todas las peticiones de esta corrida a la misma instancia, para
        // que la caché de prefijo de la constitución acierte. Sin esto, los 28
        // pueden caer en instancias distintas y cada uno paga el prefijo entero.
        "x-session-affinity": sesion,
      },
      body: JSON.stringify({
        model: modelo,
        max_tokens: maxTokens,
        messages: [
          // El sistema va primero y es idéntico en los 28: es el prefijo que se
          // cachea. Cualquier cosa variable aquí lo invalidaría.
          { role: "system", content: sistema },
          { role: "user", content: usuario },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "veredicto", schema: esquema, strict: true },
        },
      }),
    },
  );

  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`${modelo} no respondió en ${TOPE_MS / 1000}s (MC_AUDIT_TOPE_MS lo cambia)`);
    }
    throw err;
  } finally {
    clearTimeout(reloj);
  }

  if (!res.ok) {
    const cuerpo = await res.text().catch(() => "");
    const err = new Error(`Workers AI ${res.status} en ${modelo}: ${cuerpo.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }

  const json = await res.json();
  const eleccion = json?.choices?.[0] ?? {};
  const texto = eleccion.message?.content ?? "";
  const uso = json?.usage ?? {};

  // `kimi-k2.6` y `gpt-oss` son modelos de razonamiento: el pensamiento se va en
  // `reasoning_content` y consume el mismo presupuesto que la respuesta. Si se
  // acaba antes de escribir el JSON, `content` llega VACÍO con finish_reason
  // "length". Sin este chequeo eso se leería como "el modelo no devolvió JSON",
  // que manda a reintentar con el mismo presupuesto y vuelve a fallar igual.
  if (eleccion.finish_reason === "length" && !texto.trim()) {
    throw new Error(
      `${modelo} agotó max_tokens (${maxTokens}) razonando y no alcanzó a escribir el veredicto ` +
        `— ${(eleccion.message?.reasoning_content ?? "").length} caracteres de razonamiento. ` +
        `Súbelo con MC_AUDIT_MAX_TOKENS.`,
    );
  }

  return {
    texto,
    uso: {
      entrada: uso.prompt_tokens ?? 0,
      // completion_tokens incluye el razonamiento, que es la mayor parte en
      // estos modelos. Se contabiliza entero porque entero se cobra.
      salida: uso.completion_tokens ?? 0,
      // Workers AI reporta los tokens servidos por caché de prefijo aquí.
      cacheada: uso.prompt_tokens_details?.cached_tokens ?? 0,
    },
  };
}

/**
 * Proveedor Workers AI: cadena de modelos + validación propia + un reintento.
 *
 * El orden importa. Primero se intenta el modelo primario; si la llamada falla
 * o el veredicto no valida contra el esquema, se reintenta **una vez** diciendo
 * qué estuvo mal; si sigue sin validar, se baja al modelo de respaldo. Si
 * ninguno produce un veredicto válido, se lanza — y el corredor ya trata a un
 * auditor que no pudo correr como fallo, no como aprobación.
 */
export async function correrWorkersAI({ sistema, usuario, esquema, sesion, maxTokens = MAX_TOKENS }) {
  if (!cuenta() || !token()) {
    throw new Error("faltan CLOUDFLARE_ACCOUNT_ID y/o CLOUDFLARE_API_TOKEN");
  }

  const problemas = [];

  for (const modelo of CADENA_WORKERS_AI) {
    for (let intento = 0; intento < 2; intento++) {
      let respuesta;
      try {
        respuesta = await llamarWorkersAI({
          modelo,
          sistema,
          usuario:
            intento === 0
              ? usuario
              : `${usuario}\n\n---\n\nTu respuesta anterior no cumplió el esquema:\n${problemas.at(-1)}\n\n` +
                `Responde de nuevo con SOLO el objeto JSON, sin texto alrededor y sin bloque de código.`,
          esquema,
          sesion,
          maxTokens,
        });
      } catch (err) {
        problemas.push(`${modelo}: ${err.message}`);
        break; // error de transporte o de modelo: no reintentar igual, bajar al siguiente
      }

      const objeto = extraerJSON(respuesta.texto);
      if (!objeto) {
        problemas.push(`${modelo}: la respuesta no contenía un objeto JSON`);
        continue;
      }

      const errores = validar(objeto, esquema);
      if (errores.length === 0) {
        return { ...objeto, uso: respuesta.uso, modelo, reintentos: intento };
      }
      problemas.push(`${modelo}: ${errores.slice(0, 4).join("; ")}`);
    }
  }

  throw new Error(`ningún modelo devolvió un veredicto válido — ${problemas.join(" | ")}`);
}

export const PROVEEDOR = "workers-ai";
export const MODELO_PRINCIPAL = CADENA_WORKERS_AI[0];

export const correr = correrWorkersAI;

/** Verificación previa de credenciales, sin gastar tokens de generación. */
export async function verificarCredenciales() {
  if (!cuenta()) throw new Error("falta CLOUDFLARE_ACCOUNT_ID");
  if (!token()) throw new Error("falta CLOUDFLARE_API_TOKEN");
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cuenta()}/ai/models/search?per_page=1`, {
    headers: { authorization: `Bearer ${token()}` },
  });
  if (!res.ok) {
    throw new Error(`el token no pudo listar modelos (HTTP ${res.status}) — ¿tiene permiso \`Workers AI: Read\`?`);
  }
}
