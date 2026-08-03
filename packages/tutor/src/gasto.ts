/**
 * EL TOPE DE GASTO por perfil y por día — F6 #136.
 *
 * `docs/planes/f6-larry-profe.md` §5. Enmienda declarada a D-015.
 *
 * ═══ Dónde vive el tope: se sigue el PLAN, no el issue ════════════════════
 *
 * El issue #136 se titula «Tope de gasto por perfil y por día **vía AI
 * Gateway**», y eso viene de D-015. El plan de F6 §5.1 lo enmienda y mueve el
 * limitador real al **Durable Object**, y esa enmienda es la pregunta P-15,
 * todavía sin contestar. Se sigue el plan, por una razón que no es de gusto:
 *
 * | Capa | Cuenta | Puede |
 * |---|---|---|
 * | Durable Object | **llamadas** | Decidir ANTES de gastar, y degradar con criterio pedagógico |
 * | AI Gateway | **dólares** | Ver el costo real por tokens y frenar cuando lo roto es la lógica del Worker |
 *
 * El argumento con el que el diseño original defendió esto era falso y hay que
 * decirlo: «el Gateway solo sabe devolver 429» **no es cierto** — `mc-32` dice
 * que su ruteo dinámico puede caer a un modelo más barato al tocar presupuesto.
 * La conclusión se sostiene por otra razón: el Gateway puede **cambiar de
 * modelo**, y este producto no quiere eso. Bajar de modelo bajo presión es
 * exactamente lo que D-035 prohíbe para la banda Pro —*«una explicación de
 * cálculo tensorial incorrecta enseña error»*— y lo que el Gateway **no** puede
 * hacer es servir la explicación pregenerada revisada por humano, que es el
 * peldaño al que este producto degrada.
 *
 * El Gateway se queda como red de seguridad en dólares. Los dos, con reparto
 * explícito, que es lo que dice el plan.
 *
 * ═══ Qué se raciona, y qué NO ═════════════════════════════════════════════
 *
 * Se raciona **una variante** de la explicación. El piso —pregenerada, con causa
 * nombrada, instantánea, gratis, offline y revisada por humano— **no depende de
 * presupuesto, ni de red, ni de modelo, y no tiene tope**. Si tuviera tope, la
 * línea roja #4 estaría cruzada: nunca se cobra por dejar que un niño practique.
 *
 * ═══ Este módulo es PURO ══════════════════════════════════════════════════
 *
 * No abre el Durable Object, no llama a ningún modelo y no lee el reloj: recibe
 * el instante como parámetro. Lo impuro vive en `apps/web/src/lib/ratelimiter.ts`
 * (el objeto) y en `apps/web/src/pages/api/larry.ts` (la llamada). Esa frontera
 * es lo que permite probar el tope sin gastar un centavo, que es justo lo que
 * hay que poder hacer con un tope.
 */

import { bandaDePrompt, type TemaVisual } from "./banda.ts";
import { MODELO_POR_BANDA, TOPE_TOKENS_ENTRADA, TOPE_TOKENS_SALIDA, type Modelo } from "./en-vivo.ts";
import type { Banda } from "../../motor/src/puntuacion.ts";

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · EL DÍA — definido, porque un tope sin día es irreproducible
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * El día del tope es **UTC**, y hay que decir lo que eso cuesta.
 *
 * El plan §5.2 avisa: *««día» necesita zona horaria. El DO y el Gateway tienen
 * que coincidir en cuándo empieza el día; D-016 tiene cortes nocturnos que son
 * hora LOCAL, y UTC parte el día a media tarde en México.»* Es cierto, y aun así
 * aquí se elige UTC:
 *
 *  · **Es reproducible.** Las dos capas —el objeto y la metadata del Gateway—
 *    llaman a esta misma función, así que el corte es el mismo en las dos y el
 *    tope se puede comprobar sumando.
 *  · **La alternativa exige un dato que no tenemos.** La zona horaria del perfil
 *    no se guarda, y no se va a guardar por un contador: del niño se pide el AÑO
 *    de nacimiento y nada más (D-013, D-053). Derivarla del locale sería
 *    inventarla: `fr-FR` y `pt-BR` no comparten idioma ni huso, y `es-MX` cubre
 *    cuatro husos.
 *  · **Lo que se pierde es acotado.** El corte cae a media tarde en México, así
 *    que una sesión larga de tarde puede cruzarlo y estrenar cuota. Eso da MÁS
 *    explicación de la presupuestada un día concreto, nunca menos, y nunca deja
 *    a nadie sin la pregenerada. El error va hacia el lado seguro.
 *
 * D-016 no se toca: sus cortes nocturnos son de límite de pantalla y son hora
 * local. Son dos relojes distintos para dos cosas distintas, y mezclarlos sería
 * el error.
 */
export function diaDelTope(ahoraMs: number): string {
  return new Date(ahoraMs).toISOString().slice(0, 10);
}

/**
 * `pd` — el seudónimo del perfil para ESE día. HMAC, truncado, determinista.
 *
 * **Determinista y no aleatorio, y esto no es un detalle.** Si la sal se generara
 * al azar y se guardara, dos nodos producirían `pd` distintos para el mismo
 * perfil el mismo día; y como el presupuesto del Gateway es **por valor de
 * metadata**, el tope efectivo se multiplicaría por el número de sales vivas.
 * Fallaría **abierto, en silencio**, que es el modo de falla que este repo ya
 * sufrió con los auditores (D-032: seis fallaban abiertos sin que nadie lo
 * supiera).
 *
 * La rotación diaria sale gratis —coincide con la ventana del tope— y hace que
 * los contadores de ayer dejen de ser vinculables con los de hoy.
 *
 * **Nada de esto identifica al niño ante el proveedor de inferencia**: lo que
 * viaja es un hash con sal secreta que cambia cada día. Línea roja #2 y `mc-25`.
 */
export async function seudonimoDiario(
  secreto: string,
  dia: string,
  profileId: string,
): Promise<string> {
  const enc = new TextEncoder();
  const llave = await crypto.subtle.importKey(
    "raw",
    enc.encode(secreto),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const firma = await crypto.subtle.sign("HMAC", llave, enc.encode(`${dia}|${profileId}`));
  const bytes = new Uint8Array(firma);
  let hex = "";
  for (const b of bytes.slice(0, 12)) hex += b.toString(16).padStart(2, "0");
  return hex;
}

/* ══════════════════════════════════════════════════════════════════════════
 * 2 · LOS TOPES — con la aritmética escrita, no con un número caído del cielo
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * El precio del Plan Familia, en micro-dólares al mes. D-021: **$8-10 USD**.
 * Se toma el **piso** del rango: un tope calculado sobre el techo sería un tope
 * más alto por una razón que no es del producto.
 */
export const PRECIO_FAMILIA_MES = 8_000_000;

/** D-021 dimensiona el Plan Familia para **seis** perfiles. */
export const PERFILES_POR_CUENTA = 6;

/**
 * Qué parte del ingreso por perfil puede consumir Larry en vivo. `[estimado]`.
 *
 * El plan §5.5 no da número y avisa por qué: las tres estimaciones de costo que
 * circulan son incompatibles entre sí, y la que decide todo —los tokens de
 * razonamiento— este repo ya la falló por **6.3×** una vez (D-035 hallazgo 3).
 * Lo que sí está escrito es el criterio: *«un tope que está 5× arriba del precio
 * no es tope económico, es permiso»*.
 *
 * Un quinto del ingreso por perfil deja cuatro quintos para todo lo demás
 * —cómputo, almacenamiento, arte, la persona que revisa el contenido— y es un
 * número que se puede defender en voz alta. **No está medido y no pretende
 * estarlo:** es lo primero que la medición de P-18 tiene que sustituir.
 */
export const PARTE_DE_LARRY = 0.2;

/** Se cuenta el mes como treinta días. Para un tope diario, el matiz no cambia nada. */
export const DIAS_DEL_MES = 30;

/**
 * El tope diario de un perfil de NIÑO, derivado y no tecleado.
 *
 *     8_000_000 µ$ / 6 perfiles / 30 días × 0.20 = 8_888 µ$ ≈ $0.0089
 *
 * Está escrito como cuenta y no como constante para que se vea de dónde sale:
 * un número tecleado no se puede discutir, una división sí.
 */
export const TOPE_DIARIO_NINO = Math.floor(
  (PRECIO_FAMILIA_MES / PERFILES_POR_CUENTA / DIAS_DEL_MES) * PARTE_DE_LARRY,
);

/**
 * El tope diario de un perfil ADULTO. `[estimado]`, y con una duda declarada.
 *
 * **No hay precio de adulto en ninguna decisión.** D-021 fija el Plan Familia
 * ($8-10 para seis) y D-034 hace del adulto que practica solo un caso de primera
 * clase, pero nadie ha decidido qué paga. Sin ese número no hay de dónde derivar
 * este tope, así que se pone uno explícito —$0.06 al día, ~$1.80 al mes— que es
 * un quinto de una suscripción individual del orden de $9 al mes.
 *
 * Es más alto que el de un niño porque el modelo es otro: `kimi-k2.6` cuesta
 * $4.00/M de salida contra $0.75/M de `gpt-oss-120b` (D-035), o sea 5.3× más por
 * token. Un tope idéntico para los dos no sería equidad: dejaría a la banda
 * adulta sin ni una llamada.
 *
 * **Va a `docs/dudas.md`.** El día que haya precio de adulto, este número se
 * deriva igual que el de arriba y deja de ser tecleado.
 */
export const TOPE_DIARIO_ADULTO = 60_000;

/** El plan de la cuenta. D-021 los nombra así. */
export type Plan = "gratis" | "familia";

/**
 * Cuánto puede gastar un perfil en un día, por banda y por plan.
 *
 * **El plan gratis es CERO, y eso no es tacañería: es lo que D-021 dice.** El
 * plan gratis tiene «Larry con explicaciones pregeneradas» y el Plan Familia
 * «Larry en vivo ilimitado». Un diseño de F6 propuso doce llamadas gratis sin
 * notar que la decisión ya estaba tomada; la recomendación de la pregunta P-5 es
 * cero, y cero es lo que está aquí. Si el dueño quiere un gusto en el gratis, es
 * una **enmienda a D-021**, no un número que se elige aquí.
 *
 * **Y «ilimitado» en D-021 es una promesa de producto, no de infraestructura.**
 * Lo que este tope raciona no es la explicación —que sigue siendo instantánea,
 * gratis y completa— sino la variante generada en vivo. El niño no ve nada
 * cuando se cruza (§5.5 y la recomendación de P-16): sin aviso, sin contador y
 * sin mención del plan de pago, porque cualquier aviso convertiría el tope en
 * superficie de monetización apuntada a un menor.
 */
export const TOPES: Record<Plan, Record<TemaVisual, { llamadas: number; microdolares: number }>> = {
  gratis: {
    KINDER: { llamadas: 0, microdolares: 0 },
    PRIMARIA: { llamadas: 0, microdolares: 0 },
    SECUNDARIA: { llamadas: 0, microdolares: 0 },
    SERIO: { llamadas: 0, microdolares: 0 },
    PRO: { llamadas: 0, microdolares: 0 },
  },
  familia: {
    KINDER: { llamadas: 8, microdolares: TOPE_DIARIO_NINO },
    PRIMARIA: { llamadas: 12, microdolares: TOPE_DIARIO_NINO },
    SECUNDARIA: { llamadas: 12, microdolares: TOPE_DIARIO_ADULTO },
    SERIO: { llamadas: 12, microdolares: TOPE_DIARIO_ADULTO },
    PRO: { llamadas: 8, microdolares: TOPE_DIARIO_ADULTO },
  },
};

export function topeDe(plan: Plan, banda: Banda | TemaVisual): { llamadas: number; microdolares: number } {
  return TOPES[plan][bandaDePrompt(banda as Banda)];
}

/* ══════════════════════════════════════════════════════════════════════════
 * 3 · EL COSTO — se RESERVA el máximo antes, se liquida el real después
 * ════════════════════════════════════════════════════════════════════════ */

/** Lo que devuelve el proveedor cuando devuelve algo. */
export interface Uso {
  prompt_tokens?: number;
  completion_tokens?: number;
  /** Algunos endpoints lo llaman así. Se acepta y se normaliza. */
  input_tokens?: number;
  output_tokens?: number;
}

/**
 * El costo máximo posible de una llamada de esta banda, en µ$.
 *
 * Es lo que se **reserva antes de llamar**, y es lo que hace que el tope sea una
 * cota superior de verdad y no una aproximación: si lo que queda no alcanza para
 * el peor caso, no se llama. Sin reserva previa, la última llamada del día podría
 * rebasar el tope por su cuenta y el tope sería «el tope, más una llamada».
 */
export function costoMaximo(banda: Banda | TemaVisual): number {
  const tema = bandaDePrompt(banda as Banda);
  const modelo = MODELO_POR_BANDA[tema];
  return costoDe(modelo, TOPE_TOKENS_ENTRADA, TOPE_TOKENS_SALIDA[tema]);
}

/** Tokens × precio ÷ un millón, redondeando **hacia arriba**. Nunca a favor. */
export function costoDe(modelo: Modelo, entrada: number, salida: number): number {
  return Math.ceil((entrada * modelo.entrada + salida * modelo.salida) / 1_000_000);
}

/**
 * Lo que de verdad costó. **Si no viene `usage`, se cobra el máximo, jamás cero.**
 *
 * Es la regla que el plan §5.4 marca como no opcional: *«un tope que falla
 * abierto en silencio es peor que no tener tope, porque nadie lo revisa»*. Un
 * proveedor que deja de mandar `usage` —o un cambio de endpoint que lo mueve de
 * sitio— convertiría el medidor en un contador de ceros, y el síntoma sería una
 * factura, no un error.
 */
export function costoReal(banda: Banda | TemaVisual, uso: Uso | null | undefined): number {
  const tema = bandaDePrompt(banda as Banda);
  const modelo = MODELO_POR_BANDA[tema];
  const entrada = uso?.prompt_tokens ?? uso?.input_tokens;
  const salida = uso?.completion_tokens ?? uso?.output_tokens;
  if (typeof entrada !== "number" || typeof salida !== "number") return costoMaximo(banda);
  return costoDe(modelo, entrada, salida);
}

/* ══════════════════════════════════════════════════════════════════════════
 * 4 · LA ESCALERA — se degrada hacia texto humano, nunca hacia un modelo peor
 * ════════════════════════════════════════════════════════════════════════ */

export type Peldano = "P0" | "P1" | "P2" | "P3";

/** Los cortes de §5.5, como fracción del tope consumida. */
export const CORTES = { p1: 0.6, p2: 0.85 } as const;

/**
 * En qué peldaño está un perfil.
 *
 * P0 camino completo · P1 solo error no catalogado · P2 cero llamadas, caché
 * revisada y variantes autoradas · P3 idéntico a P2 **para la persona**, distinto
 * solo en telemetría.
 *
 * **Un tope de cero cae directo en P3**, y es lo correcto: el plan gratis no
 * tiene camino en vivo, así que no está «al 0% de su presupuesto», está fuera.
 */
export function peldano(gastado: number, tope: { llamadas: number; microdolares: number }, llamadas = 0): Peldano {
  if (tope.microdolares <= 0 || tope.llamadas <= 0) return "P3";
  if (gastado > tope.microdolares || llamadas >= tope.llamadas) return "P3";
  const fraccion = gastado / tope.microdolares;
  const fraccionLlamadas = llamadas / tope.llamadas;
  const peor = Math.max(fraccion, fraccionLlamadas);
  if (peor >= CORTES.p2) return "P2";
  if (peor >= CORTES.p1) return "P1";
  return "P0";
}

/** Lo que el objeto guarda de un perfil en un día. Nada más que esto. */
export interface EstadoDelDia {
  /** Llamadas ya hechas. */
  llamadas: number;
  /** Gastado y liquidado, en µ$. */
  gastado: number;
  /** Reservado y todavía sin liquidar, en µ$. */
  reservado: number;
}

export const ESTADO_VACIO: EstadoDelDia = { llamadas: 0, gastado: 0, reservado: 0 };

/**
 * ¿Alcanza para una llamada más? Se decide **antes** de gastar.
 *
 * La cota que esta función garantiza, y que `gasto.prueba.mjs` comprueba con
 * miles de peticiones seguidas: **`gastado` nunca supera `tope.microdolares`, y
 * `llamadas` nunca supera `tope.llamadas`**, pase lo que pase con el proveedor —
 * incluido que deje de mandar `usage`, porque entonces se cobra el máximo.
 */
export function alcanza(
  estado: EstadoDelDia,
  banda: Banda | TemaVisual,
  tope: { llamadas: number; microdolares: number },
): boolean {
  if (estado.llamadas >= tope.llamadas) return false;
  return estado.gastado + estado.reservado + costoMaximo(banda) <= tope.microdolares;
}

/* ══════════════════════════════════════════════════════════════════════════
 * 5 · EL INTERRUPTOR AUTOMÁTICO POR TASA DE DESCARTE (§2.5, P-14)
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * Cuántos descartes en cuántas salidas apagan el camino en vivo de un par
 * `(banda, locale)`.
 *
 * **Un solo umbral absoluto y pequeño**, que es la recomendación de P-14. Los
 * umbrales que proponía el diseño —«>2% en 1,000 rodantes, >5 en 100»— son
 * incoherentes entre sí (cinco de cien es 5%, más del doble del otro) y **la
 * ventana de mil tarda semanas en llenarse** con el volumen del MVP: el guardián
 * no observaría nada durante exactamente el periodo en que nadie lo vigila.
 */
export const UMBRAL_DESCARTES = { descartes: 5, ventana: 100 } as const;

/**
 * ¿Hay que abrir el interruptor de este par `(banda, locale)`?
 *
 * **La reactivación es A MANO**, borrando la llave de `CONFIG_KV`. Un apagado
 * que se cura solo esconde un problema que empeora, y aquí el problema que
 * escondería es que el modelo está diciéndole algo a un niño que una compuerta
 * tuvo que tirar.
 */
export function debeAbrirse(descartes: number): boolean {
  return descartes >= UMBRAL_DESCARTES.descartes;
}

/**
 * Las dimensiones de la telemetría de uso. **Y las que NO están.**
 *
 * `math-challenge-tutor-usage-ae` estaba inventariado como «per-child,
 * per-model», que contradice la línea roja #2 y esta decisión a la vez. El índice
 * es `banda|locale|modelo` y **nunca el perfil, ni siquiera hasheado**: Analytics
 * Engine retiene tres meses y no borra bajo demanda (`mc-32` riesgo #7), así que
 * lo que entre ahí no se puede sacar cuando un padre ejerza su derecho de
 * borrado. Con este índice no hay nada del niño que borrar.
 *
 * El contador POR perfil vive en el Durable Object, siete días, y sí se borra —
 * por eso `audits/borrado-cuatro-sistemas.mjs` tiene que alcanzarlo.
 */
export const INDICE_TELEMETRIA = ["banda", "locale", "modelo"] as const;
