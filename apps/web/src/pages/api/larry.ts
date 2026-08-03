/**
 * `POST /api/larry` — el camino EN VIVO. F6 #136, D-004 punto 2 (enmendado por
 * D-035 a Workers AI), D-015 y `docs/planes/f6-larry-profe.md` §2.5, §5, §6.1.
 *
 * ═══ Lo primero, porque condiciona todo lo demás ══════════════════════════
 *
 * **Este endpoint no puede fallar.** No devuelve 500, no devuelve un hueco y no
 * devuelve una disculpa: devuelve una explicación, siempre. Cuando el modelo no
 * contesta, cuando contesta tarde, cuando contesta algo que una compuerta
 * descarta, cuando el tope está agotado, cuando el interruptor de la banda está
 * apagado o cuando no hay binding de IA en absoluto, lo que sale por aquí es la
 * **explicación pregenerada** — la misma que `/api/jugar` ya sirve, compuesta
 * por el mismo módulo, revisada por humano y en el locale de quien juega.
 *
 * Eso es lo que hace que este endpoint sea añadible sin riesgo: **el peor caso
 * es el caso normal**. Y es también el motivo de que el veredicto no pase por
 * aquí — el veredicto lo da `/api/jugar` al instante, y Larry en vivo llega
 * después o no llega (`mc-20` §7: para un niño pequeño el silencio tras un toque
 * se lee como «roto», no como «pensando»).
 *
 * ═══ Cuándo se llama ══════════════════════════════════════════════════════
 *
 * Solo dos disparadores, que son los que D-015 nombra: la persona toca «no
 * entendí», o el error **no está catalogado**. Nunca en un acierto, nunca de
 * oficio, y nunca más de dos veces por ítem (§5.5: el botón vive colgado de un
 * ítem recién calificado, que convierte «distinguir curiosidad de abuso» de un
 * problema de heurística en uno de esquema).
 *
 * ═══ Lo que NO viaja al modelo ════════════════════════════════════════════
 *
 * Ni el id del perfil, ni el alias, ni el año de nacimiento, ni la elección del
 * niño, ni los operandos, ni la respuesta correcta, ni el tiempo, ni los puntos.
 * El mensaje de usuario lo compone `packages/tutor/src/en-vivo.ts` a partir del
 * sobre **sellado por el motor** — la misma `sellarSobre()` del camino
 * pregenerado, no una copia. Línea roja #2 y línea roja #7, y las dos
 * comprobadas por `audits/larry-en-vivo.mjs`.
 *
 * La `banda` y el `locale` **no van dentro del sobre**: son parámetros de ruteo
 * que eligen el prefijo de sistema y el modelo. Van fuera a propósito, porque lo
 * que entra al sobre es lo que Larry puede repetir.
 *
 * ═══ El veredicto se vuelve a calcular aquí ═══════════════════════════════
 *
 * El cliente manda `itemId` y `eleccion`, **jamás un veredicto**. Si el cliente
 * pudiera mandar el veredicto, podría fabricar una causa que el banco no produce
 * y meterla en el prompt — texto elegido por el usuario dentro del mensaje de un
 * modelo, que es la superficie de inyección que D-029 §3.8 mantiene aislada del
 * tutor de niños. El servidor califica otra vez contra el banco, igual que
 * `/api/jugar`, y eso cuesta una llamada RPC en el mismo hilo (D-030).
 */
import type { APIRoute } from "astro";
import {
  COOKIE_NINO,
  COOKIE_ADULTO,
  leerCookies,
  leerSesionNino,
  leerSesionAdulto,
} from "../../lib/sesiones";
import { medirTutor, type MedidaTutor } from "../../lib/ratelimiter";
import {
  sellarEnVivo,
  mensajeDeUsuario,
  juzgarSalida,
  decidirLlamada,
  interruptores,
  modeloDe,
  LLAVE_INTERRUPTORES,
  TOPE_TOKENS_SALIDA,
} from "../../../../../packages/tutor/src/en-vivo.ts";
import { compilarCatalogo } from "../../../../../packages/tutor/src/lexico.ts";
import { componerPrefijo } from "../../../../../packages/tutor/src/prefijo.ts";
import { bandaDePrompt } from "../../../../../packages/tutor/src/banda.ts";
import type { BloqueLocale } from "../../../../../packages/tutor/src/catalogo.ts";
import {
  diaDelTope,
  seudonimoDiario,
  topeDe,
  peldano,
  costoReal,
  debeAbrirse,
  type Plan,
} from "../../../../../packages/tutor/src/gasto.ts";
import {
  sellarSobre,
  explicarEnLocale,
} from "../../../../../packages/motor/src/explicacion.ts";
import { temaPorEdad, edadDesdeAnio, type TemaVisual } from "../../../../../packages/motor/src/bandas.ts";
import { isLocale, DEFAULT_LOCALE, type Locale } from "../../i18n";

import retoEN from "../../i18n/reto/en.json";
import retoESMX from "../../i18n/reto/es-MX.json";
import retoESES from "../../i18n/reto/es-ES.json";
import retoFRFR from "../../i18n/reto/fr-FR.json";
import retoPTBR from "../../i18n/reto/pt-BR.json";
import retoPTPT from "../../i18n/reto/pt-PT.json";
import retoDEDE from "../../i18n/reto/de-DE.json";

const RETO: Record<string, Record<string, unknown>> = {
  "en": retoEN,
  "es-MX": retoESMX,
  "es-ES": retoESES,
  "fr-FR": retoFRFR,
  "pt-BR": retoPTBR,
  "pt-PT": retoPTPT,
  "de-DE": retoDEDE,
};

/*
 * ─── Los siete bloques de locale, y los siete léxicos, en el SERVIDOR ──────
 *
 * Se importan como JSON igual que los diccionarios del reto: el prefijo se
 * compone en el Worker y el navegador nunca ve el prompt de sistema. Que el
 * cliente pudiera leerlo sería regalarle el contrato de seguridad entero a
 * quien quisiera buscarle la vuelta — y, sobre todo, el navegador no elige
 * modelo, no elige banda y no compone mensajes.
 */
import larryEN from "../../i18n/larry/en.json";
import larryESMX from "../../i18n/larry/es-MX.json";
import larryESES from "../../i18n/larry/es-ES.json";
import larryFRFR from "../../i18n/larry/fr-FR.json";
import larryPTBR from "../../i18n/larry/pt-BR.json";
import larryPTPT from "../../i18n/larry/pt-PT.json";
import larryDEDE from "../../i18n/larry/de-DE.json";

const BLOQUES: Record<Locale, BloqueLocale> = {
  "en": larryEN as BloqueLocale,
  "es-MX": larryESMX as BloqueLocale,
  "es-ES": larryESES as BloqueLocale,
  "fr-FR": larryFRFR as BloqueLocale,
  "pt-BR": larryPTBR as BloqueLocale,
  "pt-PT": larryPTPT as BloqueLocale,
  "de-DE": larryDEDE as BloqueLocale,
};

import lexEN from "../../../../../packages/tutor/src/lexico/en.json";
import lexESMX from "../../../../../packages/tutor/src/lexico/es-MX.json";
import lexESES from "../../../../../packages/tutor/src/lexico/es-ES.json";
import lexFRFR from "../../../../../packages/tutor/src/lexico/fr-FR.json";
import lexPTBR from "../../../../../packages/tutor/src/lexico/pt-BR.json";
import lexPTPT from "../../../../../packages/tutor/src/lexico/pt-PT.json";
import lexDEDE from "../../../../../packages/tutor/src/lexico/de-DE.json";

/**
 * El léxico, compilado UNA vez al cargar el módulo y no por petición.
 *
 * Son ~90 expresiones regulares en los siete locales. Compilarlas en cada
 * respuesta las volvería a compilar en el camino caliente para no ganar nada:
 * el archivo no cambia mientras el Worker vive.
 */
const LEXICO = compilarCatalogo({
  "en": lexEN,
  "es-MX": lexESMX,
  "es-ES": lexESES,
  "fr-FR": lexFRFR,
  "pt-BR": lexPTBR,
  "pt-PT": lexPTPT,
  "de-DE": lexDEDE,
});

export const prerender = false;

interface Ingest {
  calificarContraBanco(itemId: string, eleccion: number | string): Promise<{
    acc: 0 | 1; causa: string | null; razonAlterna: string | null;
    inesperada: boolean; nivel: number; habilidad: string;
  }>;
}

interface Env {
  INGEST: Ingest;
  SESSION_KV: KVNamespace;
  CONFIG_KV?: KVNamespace;
  RATE_LIMITER?: DurableObjectNamespace;
  DB?: D1Database;
  /** Workers AI. Ausente en desarrollo local: entonces no hay camino en vivo. */
  AI?: { run(modelo: string, entrada: unknown, opciones?: unknown): Promise<unknown> };
  /** El id del AI Gateway. Sin él se llama sin gateway y se dice en la respuesta. */
  AI_GATEWAY_ID?: string;
  /** El secreto del HMAC de `pd`. Sin él no se llama: no habría tope por perfil. */
  TUTOR_PD_SECRET?: string;
  TUTOR_AE?: { writeDataPoint(punto: unknown): void };
}

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Lleva la explicación de UNA persona sobre UN error. No se cachea jamás.
      "cache-control": "no-store",
    },
  });

/**
 * Cuánto se espera al modelo antes de rendirse.
 *
 * T2 del plan §1.6 pone «completo ≤4 s» y lo marca `[estimado]`, con una nota de
 * honestidad que conviene repetir: D-035 midió `kimi-k2.6` en 8.9 s, pero eso fue
 * una prueba de esquema con `max_tokens` 24,000, no un turno de tutor. Como cota
 * total puede ser pesimista; como cota de primer token, optimista. Aquí se corta
 * a cuatro segundos porque **rendirse es barato**: lo que se sirve al rendirse es
 * la explicación revisada por humano, que ya está compuesta antes de llamar.
 */
const PLAZO_MS = 4_000;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env: Env } }).runtime?.env;
  if (!env?.INGEST) return json({ error: "sin ingesta" }, 503);

  // ─── La puerta. Sin sesión no hay perfil, y sin perfil no hay tope ───────
  //
  // El plan §9.4 lo nombra como prerrequisito de todo §5: sin identidad no hay
  // a quién contarle las llamadas. Aquí se falla CERRADO — a diferencia del
  // veredicto, que nunca se le niega a nadie, una llamada al modelo sin cuenta
  // sería gasto que nadie puede acotar.
  const cookies = leerCookies(request.headers.get("cookie"));
  const nino = await leerSesionNino(env.SESSION_KV, cookies[COOKIE_NINO]);
  let quien: { id: string; esAdulto: boolean } | null = nino
    ? { id: nino.childProfileId, esAdulto: false }
    : null;
  if (!quien) {
    const adulto = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
    if (adulto) quien = { id: adulto.userId, esAdulto: true };
  }
  if (!quien) return json({ error: "sin_sesion" }, 401);

  let cuerpo: Record<string, unknown>;
  try {
    cuerpo = (await request.json()) as Record<string, unknown>;
  } catch {
    cuerpo = {};
  }

  const itemId = typeof cuerpo.itemId === "string" ? cuerpo.itemId : null;
  const eleccion = cuerpo.eleccion;
  if (!itemId) return json({ error: "falta_itemId" }, 400);
  if (typeof eleccion !== "string" && typeof eleccion !== "number") {
    return json({ error: "eleccion_invalida" }, 400);
  }
  // La misma cota de bytes que `/api/jugar` y `/api/reto`: la línea roja #3
  // hecha límite, no solo intención. Aquí importa el doble, porque lo que entra
  // por este endpoint acaba cerca de un prompt.
  if (typeof eleccion === "string" && eleccion.length > 32) {
    return json({ error: "eleccion_larga" }, 400);
  }

  const locale: Locale = isLocale(cuerpo.locale) ? (cuerpo.locale as Locale) : DEFAULT_LOCALE;
  const toques = typeof cuerpo.toques === "number" ? cuerpo.toques : 1;

  // ─── El servidor califica. Otra vez, y contra el banco ───────────────────
  //
  // Es el único punto de este endpoint donde un fallo NO se puede convertir en
  // una explicación: sin veredicto no hay causa, y sin causa no hay nada que
  // explicar sin inventarlo. Se responde 503 y se acabó — que es honesto y es
  // lo que el auditor permite ANTES del veredicto y prohíbe después.
  //
  // Sin el `try`, un Worker de ingesta caído dejaba escapar la excepción y Astro
  // devolvía un 500 con traza. Se vio de verdad, corriendo `wrangler dev` sin
  // levantar `math-challenge-ingest`.
  let veredicto: Awaited<ReturnType<Ingest["calificarContraBanco"]>>;
  try {
    veredicto = await env.INGEST.calificarContraBanco(itemId, eleccion);
  } catch {
    return json({ error: "sin_veredicto" }, 503);
  }

  // ─── El piso, compuesto ANTES de mirar si hay modelo ─────────────────────
  //
  // El orden importa y es deliberado: la respuesta que se va a servir existe
  // completa antes de que nadie llame a nada. Así no hay ningún camino de
  // error en el que quede sin componerse — que es como se acaba sirviendo un
  // hueco cuando el `catch` está en el sitio equivocado.
  const pregenerada = explicarEnLocale(
    sellarSobre(veredicto as unknown as Record<string, unknown>),
    locale,
    RETO,
  );

  const banda = await bandaDelPerfil(env, quien.id, quien.esAdulto);

  // ─── El disparador lo decide el VEREDICTO, no el cliente ─────────────────
  //
  // La primera versión aceptaba `cuerpo.disparador`, y eso era un campo elegido
  // por quien llama a un palmo del prompt. No abría gasto —el tope es el mismo—
  // pero sí dejaba **saltarse el peldaño P1**, donde solo sobrevive el error no
  // catalogado: bastaba con decir que lo era. Ahora se deriva: hay error no
  // catalogado cuando el motor no nombró causa y marcó `inesperada`, y eso lo
  // dice el veredicto que acaba de calcular el servidor.
  const disparador = veredicto.causa === null && veredicto.inesperada ? "no_catalogado" : "no_entendi";
  const sobre = sellarEnVivo(veredicto as unknown as Record<string, unknown>, disparador);

  // ─── ¿Se llama? Cinco condiciones, y el tope decide antes de gastar ──────
  const conmutadores = interruptores(await leerConfig(env, LLAVE_INTERRUPTORES));
  const plan: Plan = await planDeLaCuenta(env, quien.id, quien.esAdulto);
  const tope = topeDe(plan, banda);
  const dia = diaDelTope(Date.now());

  // El orden de estos tres pasos no es casual. Se CONSULTA sin escribir, se
  // decide, y solo entonces se reserva: si la consulta escribiera, una petición
  // que acaba sin llamar al modelo —porque el interruptor está apagado, o porque
  // el peldaño ya no llama— consumiría cuota igual. Y la cuota ya es regresiva
  // por construcción (§5.5, objeción 1): las llamadas se disparan por error, así
  // que quien más se equivoca agota primero. Cobrarle además por lo que no se
  // llamó sería empeorar la única objeción pedagógica seria de esta dimensión.
  const tema = bandaDePrompt(banda);
  let pd = "";
  let medida: MedidaTutor = { llamadas: 0, gastado: 0, reservado: 0, permitido: false, motivo: "sin_medidor" };
  if (env.TUTOR_PD_SECRET) {
    pd = await seudonimoDiario(env.TUTOR_PD_SECRET, dia, quien.id);
    medida = await medirTutor(env.RATE_LIMITER, { pd, banda: tema, tope, accion: "consultar" });
  }

  const escalon = peldano(medida.gastado, tope, medida.llamadas);
  const decision = decidirLlamada({
    banda,
    interruptores: conmutadores,
    peldano: escalon,
    disparador: sobre.disparador,
    paseDelInterruptorAutomatico: !(await interruptorAbierto(env, tema, locale)),
    toquesEnEsteItem: toques,
  });

  // Sin binding de IA, sin secreto de `pd` o sin peldaño que llame: se sirve el
  // piso. No es un caso de error — es el 95% de las veces (D-004 punto 1).
  if (!env.AI || !env.TUTOR_PD_SECRET || !decision.llama) {
    return json({
      ok: true,
      explicacion: pregenerada,
      via: "pregenerada",
      motivo: !env.AI ? "sin_binding_ai" : !env.TUTOR_PD_SECRET ? "sin_secreto_pd" : decision.motivo,
    });
  }

  // La reserva. Aparta el costo MÁXIMO de la banda antes de llamar, así que el
  // tope es una cota superior de verdad y no «el tope, más una llamada».
  const reserva = await medirTutor(env.RATE_LIMITER, { pd, banda: tema, tope, accion: "reservar" });
  if (!reserva.permitido) {
    return json({ ok: true, explicacion: pregenerada, via: "pregenerada", motivo: `tope:${reserva.motivo}` });
  }

  // ─── La llamada ──────────────────────────────────────────────────────────
  const modelo = modeloDe(banda);
  const prefijo = componerPrefijo({ locale, banda: tema, bloque: BLOQUES[locale] });

  let texto = "";
  let uso: Record<string, number> | null = null;
  let fallo: string | null = null;
  try {
    const respuesta = (await Promise.race([
      env.AI.run(
        modelo.id,
        {
          messages: [
            { role: "system", content: prefijo.texto },
            { role: "user", content: mensajeDeUsuario(sobre) },
          ],
          // D-035 hallazgo 1: son modelos de razonamiento y el pensamiento
          // consume el mismo presupuesto que la respuesta. Con un presupuesto
          // corto la respuesta llega VACÍA con `finish_reason: "length"`, y la
          // reacción correcta no es reintentar ni cambiar de modelo: es haber
          // dado presupuesto suficiente desde el principio.
          max_tokens: TOPE_TOKENS_SALIDA[tema],
          // Temperatura cero, igual que `contador/explain.ts:67-75` en IOS
          // (`mc-37`). No hay nada creativo que pedirle a un turno de tutor.
          temperature: 0,
        },
        env.AI_GATEWAY_ID
          ? {
              gateway: {
                id: env.AI_GATEWAY_ID,
                // El prefijo de este par `(locale, banda)`. Nunca por perfil del
                // niño: cada niño pagaría el prefijo frío en su PRIMERA
                // explicación —el peor momento posible— y además metería el
                // identificador de un menor en una cabecera HTTP hacia un
                // proveedor de inferencia (línea roja #2, D-037).
                cacheKey: prefijo.llave,
                // `pd` es un HMAC con sal secreta que rota cada día. Es lo que
                // permite que el Gateway ponga un presupuesto en DÓLARES por
                // perfil sin saber de quién es el perfil.
                metadata: { pd, banda: tema, locale },
              },
            }
          : undefined,
      ),
      new Promise((_, rechazar) => setTimeout(() => rechazar(new Error("plazo")), PLAZO_MS)),
    ])) as Record<string, unknown>;

    texto = extraerTexto(respuesta);
    uso = (respuesta?.usage as Record<string, number>) ?? null;
  } catch (e) {
    fallo = String(e).slice(0, 80);
  }

  // ─── Se liquida SIEMPRE, haya o no haya texto ────────────────────────────
  //
  // Un fallo del proveedor puede haber consumido tokens igual, y `usage` ausente
  // se cobra al MÁXIMO de la banda, jamás a cero (plan §5.4). Un tope que falla
  // abierto en silencio es peor que no tener tope, porque nadie lo revisa.
  const costo = costoReal(banda, uso);
  await medirTutor(env.RATE_LIMITER, { pd, banda: tema, tope, accion: "liquidar", microdolares: costo });

  if (fallo || texto.trim() === "") {
    return json({ ok: true, explicacion: pregenerada, via: "pregenerada", motivo: fallo ?? "vacia" });
  }

  // ─── Las compuertas. Quien falla, falla entero ───────────────────────────
  // Un locale sin construcciones no es un locale limpio: es un locale sin
  // vigilancia. La salida se descarta antes de mirarla — es la misma dirección
  // de fallo que el resto del archivo, hacia la explicación revisada por humano.
  const construcciones = LEXICO[locale] ?? [];
  const descartes =
    construcciones.length === 0
      ? [{ compuerta: "lexica" as const, porque: `sin léxico para ${locale}` }]
      : juzgarSalida({ texto, locale, banda: tema, lexico: construcciones });
  if (descartes.length > 0) {
    await contarDescarte(env, tema, locale);
    return json({
      ok: true,
      explicacion: pregenerada,
      via: "pregenerada",
      motivo: `descarte:${descartes[0].compuerta}`,
    });
  }

  // Telemetría de uso: `banda|locale|modelo` y NADA más. Nunca el perfil, ni
  // siquiera hasheado — Analytics Engine retiene tres meses y no borra bajo
  // demanda (`mc-32` riesgo #7), así que lo que entre ahí no se puede sacar
  // cuando un padre ejerza su derecho de borrado.
  try {
    env.TUTOR_AE?.writeDataPoint({
      indexes: [`${tema}|${locale}|${modelo.id}`],
      blobs: [tema, locale, modelo.id, "servida"],
      doubles: [costo],
    });
  } catch {
    // La telemetría nunca interrumpe a nadie.
  }

  return json({
    ok: true,
    // La pregenerada viaja SIEMPRE, incluso cuando hay texto en vivo. El plan
    // §6.6 dejó abierto si el modelo añade o sustituye (P-3), y mandar las dos
    // deja esa decisión en la pantalla, que es donde se puede cambiar sin tocar
    // el servidor. Lo que queda cerrado en cualquier caso: la pregenerada nunca
    // desaparece.
    explicacion: pregenerada,
    enVivo: texto,
    via: "en_vivo",
    motivo: decision.motivo,
  });
};

/**
 * El texto de la respuesta, sea cual sea la forma que traiga.
 *
 * Workers AI devuelve `response` por el binding y `choices[].message.content`
 * por el endpoint compatible con OpenAI, y D-035 usó el segundo para las pruebas
 * de esquema. Se aceptan las dos y **cualquier otra cosa devuelve cadena vacía**,
 * que la compuerta de forma convierte en descarte y en explicación pregenerada.
 */
function extraerTexto(respuesta: Record<string, unknown> | null): string {
  if (!respuesta) return "";
  if (typeof respuesta.response === "string") return respuesta.response;
  const opciones = respuesta.choices;
  if (Array.isArray(opciones) && opciones.length > 0) {
    const mensaje = (opciones[0] as Record<string, unknown>)?.message as Record<string, unknown>;
    if (typeof mensaje?.content === "string") return mensaje.content;
  }
  return "";
}

/**
 * La banda del perfil. Se **deriva** con las funciones que ya existen.
 *
 * `temaPorEdad(edadDesdeAnio(...))` es la única tabla de edad→banda del repo
 * (`bandas.ts`), y `audits/tabla-bandas.mjs` bloquea la segunda. Un adulto no
 * tiene año de nacimiento guardado —no se le pregunta— y cae en `SERIO`, que es
 * donde la tabla acaba: D-034 hace del adulto que practica solo un caso de
 * primera clase, no un caso raro.
 */
async function bandaDelPerfil(env: Env, id: string, esAdulto: boolean): Promise<TemaVisual> {
  if (esAdulto) return "SERIO";
  if (!env.DB) return "KINDER";
  try {
    const fila = await env.DB.prepare("SELECT birth_year FROM child_profiles WHERE id = ?")
      .bind(id)
      .first<{ birth_year: number }>();
    const anio = fila?.birth_year ?? 0;
    if (!anio) return "KINDER";
    return temaPorEdad(edadDesdeAnio(anio, new Date().getUTCFullYear()));
  } catch {
    return "KINDER";
  }
}

/**
 * El plan de la cuenta. **Falla a `gratis`, que es el que no gasta.**
 *
 * Hoy no hay tabla de suscripciones (D-021 está decidida, F8 no está
 * construida), así que esto devuelve `gratis` salvo que `CONFIG_KV` diga otra
 * cosa. La consecuencia es honesta y hay que decirla: **con el repo de hoy,
 * ningún perfil tiene camino en vivo hasta que exista la facturación**, y el
 * gasto máximo real del producto es cero. Cuando F8 llegue, lo que cambia es
 * esta función y nada más.
 */
async function planDeLaCuenta(env: Env, id: string, esAdulto: boolean): Promise<Plan> {
  if (!env.CONFIG_KV) return "gratis";
  try {
    const v = await env.CONFIG_KV.get(`plan:${esAdulto ? "u" : "c"}:${id}`);
    return v === "familia" ? "familia" : "gratis";
  } catch {
    return "gratis";
  }
}

async function leerConfig(env: Env, llave: string): Promise<unknown> {
  if (!env.CONFIG_KV) return null;
  try {
    return await env.CONFIG_KV.get(llave, "json");
  } catch {
    return null;
  }
}

/**
 * ¿Está abierto el interruptor automático de este par `(banda, locale)`?
 *
 * Se apaga solo cuando las compuertas descartan de más, y **se vuelve a encender
 * a mano** borrando la llave (recomendación de P-14). Un apagado que se cura
 * solo esconde un problema que empeora — y aquí el problema que escondería es
 * que el modelo está diciéndole a alguien algo que una compuerta tuvo que tirar.
 */
async function interruptorAbierto(env: Env, banda: TemaVisual, locale: Locale): Promise<boolean> {
  if (!env.CONFIG_KV) return false;
  try {
    return (await env.CONFIG_KV.get(`larry:abierto:${banda}|${locale}`)) !== null;
  } catch {
    return false;
  }
}

/**
 * Cuenta un descarte. El contador vive en `CONFIG_KV` por par `(banda, locale)`.
 *
 * **Sin id de niño, sin id de sesión y sin la respuesta de nadie**, que son
 * exactamente las tres dimensiones que el plan §2.5 prohíbe en este contador. Lo
 * que se guarda es un número por par, y el par tiene treinta y cinco valores
 * posibles en la escalera completa.
 */
async function contarDescarte(env: Env, banda: TemaVisual, locale: Locale): Promise<void> {
  if (!env.CONFIG_KV) return;
  const llave = `larry:descartes:${banda}|${locale}`;
  try {
    const previo = Number((await env.CONFIG_KV.get(llave)) ?? "0");
    const ahora = previo + 1;
    await env.CONFIG_KV.put(llave, String(ahora), { expirationTtl: 86_400 });
    // El umbral vive en `gasto.ts` para que el auditor lo lea de un solo sitio.
    if (debeAbrirse(ahora)) {
      await env.CONFIG_KV.put(`larry:abierto:${banda}|${locale}`, String(ahora));
    }
  } catch {
    // Un contador que no se puede escribir no puede dejar a nadie sin
    // explicación: ya se sirvió la pregenerada antes de llegar aquí.
  }
}
