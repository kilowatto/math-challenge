/**
 * `math-challenge-learner-do` — el estado vivo del modelo, **un objeto por niño**.
 *
 * F4 · criterios #84, #86, #87, #104 · D-002, D-030, D-043, `mc-32`.
 *
 * ─── Uno por niño, y por qué eso no es un detalle de rendimiento ───────────
 *
 * `idFromName(child_profile_id)`. Un Durable Object global es un antipatrón
 * declarado por Cloudflare y topa alrededor de **500-1.000 peticiones por
 * segundo por objeto** (`mc-32` riesgo #2): un solo objeto para todos los niños
 * convierte el motor adaptativo en un cuello de botella que nadie ve venir
 * hasta que hay tráfico. `audits/do-por-entidad.mjs` bloquea el commit si algún
 * `idFromName` recibe un literal constante.
 *
 * Hay una segunda razón, y es la que importa más: **el borrado**. Con un objeto
 * por niño, borrar el perfil es `deleteAll()` sobre su almacenamiento y no
 * queda nada suyo en ningún lado. Con un objeto compartido habría que buscar y
 * quitar sus filas de dentro, que es la clase de borrado que se hace mal una vez
 * y nadie se entera (criterio #104).
 *
 * ─── Estado DERIVADO, jamás el intento crudo (criterio #86) ────────────────
 *
 * Aquí viven estimaciones, contadores y fechas. **Nunca** el intento crudo, el
 * enunciado, la respuesta que el niño escribió ni flujos de teclas. El intento
 * crudo va a `math-challenge-attempts-ae` (Analytics Engine) y a ningún otro
 * sitio — es F3, criterio #35, y `audits/no-attempts-in-d1.mjs` lo vigila.
 *
 * `mc-32` riesgo #1 nombra el modo de falla: un Durable Object por niño es un
 * sitio comodísimo para ir dejando «solo un campito más», y al cabo de un año
 * es un expediente por menor con historial de teclas. La tensión T-3 la cerró
 * la línea roja #8 — no se guarda el rastro de correcciones — y este archivo
 * hereda esa decisión: `RespuestaFinal` no tiene dónde escribirlo.
 *
 * ─── Lo que este objeto NO hace ────────────────────────────────────────────
 *
 *  · **No calcula.** Llama a `adaptativo.ts` y `programador.ts`, que son puros.
 *    Si la regla viviera aquí no se podría probar sin infraestructura.
 *  · **No decide si el niño puede jugar.** D-063 y criterio #94.
 *  · **No sabe qué edad tiene nadie.** Recibe el nivel semilla ya calculado.
 */

import {
  estadoInicial,
  actualizar,
  nivelDeHabilidad,
  estaUbicando,
  type EstadoDeHabilidad,
} from "../../../../packages/motor/src/adaptativo.ts";
import {
  repasoInicial,
  registrarRepaso,
  etapaDe,
  type EstadoDeRepaso,
} from "../../../../packages/motor/src/programador.ts";

/**
 * Lo que se guarda por `(niño, habilidad)`. Son los dos estados puros y nada
 * más — ni un campo que no venga de un módulo probado.
 */
export interface FilaDeHabilidad {
  habilidad: EstadoDeHabilidad;
  repaso: EstadoDeRepaso;
}

/**
 * El bioma por defecto — Mundo Kinder, antes de que existiera más de uno.
 * Todo lo que no manda `bioma` explícito (PRIMARIA/SECUNDARIA, que no
 * tienen concepto de bioma; o una fila vieja escrita antes de este cambio)
 * cae aquí, nunca en un bioma real inventado.
 */
export const BIOMA_DEFECTO = "sabana";

/** Lo que se le manda al objeto cuando el niño responde. */
export interface Registro {
  skillId: string;
  /** La dificultad del ítem servido, en logits. */
  dificultad: number;
  /** El escalón del ítem servido. */
  nivel: number;
  /** El veredicto sobre la respuesta FINAL. Nada de intentos intermedios. */
  correcto: boolean;
  /** El instante del SERVIDOR. El del cliente no entra aquí. */
  ahora: number;
  banda: string;
  /** Solo cuando la habilidad es nueva: dónde empezar a preguntar (D-060). */
  nivelSemilla: number;
  /**
   * Mundo Kinder multi-bioma: dominar K01 en Desierto NO domina K01 en
   * Sabana — cada bioma trackea su propio progreso. `undefined` cae en
   * `BIOMA_DEFECTO` — PRIMARIA/SECUNDARIA (sin biomas) nunca necesitan
   * mandar esto.
   */
  bioma?: string;
}

/** Lo que el objeto devuelve. Es lo que el panel del padre puede leer. */
export interface Resumen {
  skillId: string;
  /** El bioma de ESTA fila — ver `Registro.bioma`. */
  bioma: string;
  nivel: number;
  ubicando: boolean;
  etapa: "sin_ver" | "practicando" | "provisional" | "aprendido";
  venceEn: number | null;
  /**
   * La estimación cruda en logits y cuántos ítems se han respondido.
   *
   * ─── Por qué SÍ salen del objeto, si el criterio #86 pide minimizar ──────
   *
   * Porque son **estado derivado**, que es exactamente lo que este objeto puede
   * guardar y exponer. Lo que no sale —ni existe— es el intento crudo.
   *
   * Y hacen falta: el selector vive en el Worker web y necesita reconstruir el
   * estado para elegir. Sin `respondidos`, `kPara()` recibe siempre 0 y el motor
   * usa K de arranque para siempre; sin `habilidad`, el nivel redondeado a
   * escalón pierde hasta medio escalón en cada ida y vuelta y la estimación
   * camina sola. Las dos cosas se escribieron mal primero y se vieron en la
   * prueba del ida y vuelta.
   */
  habilidad: number;
  respondidos: number;
  /** Fallos consecutivos; permite detectar el descenso lateral sin recalcularlo. */
  fallosSeguidos: number;
}

const PREFIJO = "hab:";

/**
 * La llave de almacenamiento: `hab:<skill_id>:<bioma>` (Mundo Kinder
 * multi-bioma). El `skill_id` nunca lleva `:` (K01…K14), así que separar
 * por el PRIMER `:` después del prefijo es seguro y reversible.
 */
function llaveDe(skillId: string, bioma: string): string {
  return `${PREFIJO}${skillId}:${bioma}`;
}

/**
 * Deshace `llaveDe()`. Una llave escrita ANTES de este cambio no tiene
 * `:<bioma>` — cae en `BIOMA_DEFECTO`, nunca revienta ni inventa un bioma.
 */
function partirLlave(llave: string): { skillId: string; bioma: string } {
  const resto = llave.slice(PREFIJO.length);
  const i = resto.indexOf(":");
  return i === -1
    ? { skillId: resto, bioma: BIOMA_DEFECTO }
    : { skillId: resto.slice(0, i), bioma: resto.slice(i + 1) };
}

/**
 * El objeto. Una instancia por `child_profile_id`.
 *
 * El almacenamiento es el de SQLite del propio DO, y las llaves son
 * `hab:<skill_id>:<bioma>` — la llave compuesta `(child_profile_id,
 * skill_id, bioma)` del criterio #87 (ampliado para Mundo Kinder) sale de
 * que el `child_profile_id` **es el objeto**: no hace falta repetirlo en
 * cada fila, y no repetirlo es lo que impide que alguien escriba
 * accidentalmente el estado de un niño dentro del objeto de otro.
 */
export class Aprendiz {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    switch (url.pathname) {
      case "/registrar": {
        const r = (await request.json()) as Registro;
        return Response.json(await this.registrar(r));
      }
      case "/resumen": {
        const bioma = url.searchParams.get("bioma") ?? undefined;
        return Response.json(await this.resumen(bioma));
      }
      case "/olvidar": {
        // Criterio #104: borrar el perfil borra el modelo. `deleteAll()` sobre
        // el almacenamiento del objeto no deja ni una fila, y como el objeto ES
        // el niño, no hay nada suyo en ningún otro objeto que buscar.
        await this.state.storage.deleteAll();
        return Response.json({ ok: true, borrado: "todo" });
      }
      default:
        return Response.json({ ok: false, motivo: "ruta_desconocida" }, { status: 404 });
    }
  }

  /**
   * Registra una respuesta y devuelve el resumen de esa habilidad.
   *
   * Lectura y escritura en el mismo turno: el DO serializa sus peticiones, así
   * que no hace falta `blockConcurrencyWhile` — lo que sí hace falta es no
   * partir esto en dos llamadas, y no está partido.
   */
  async registrar(r: Registro): Promise<Resumen> {
    const bioma = r.bioma ?? BIOMA_DEFECTO;
    const llave = llaveDe(r.skillId, bioma);
    const previa = await this.state.storage.get<FilaDeHabilidad>(llave);

    const fila: FilaDeHabilidad = previa ?? {
      habilidad: estadoInicial(r.nivelSemilla),
      repaso: repasoInicial(),
    };

    const nueva: FilaDeHabilidad = {
      // La respuesta FINAL y nada más — línea roja #8. Lo que no se le pasa a
      // `actualizar` no se le puede pasar después: no hay campo donde meterlo.
      habilidad: actualizar(fila.habilidad, {
        dificultad: r.dificultad,
        correcto: r.correcto,
        nivel: r.nivel,
      }),
      repaso: registrarRepaso(fila.repaso, {
        correcto: r.correcto,
        ahora: r.ahora,
        banda: r.banda,
      }),
    };

    await this.state.storage.put(llave, nueva);
    return this.resumirFila(r.skillId, bioma, nueva);
  }

  /**
   * Todo lo que el objeto sabe de este niño. Es lo que lee el panel.
   *
   * `bioma`, si se da, filtra a solo ese mundo — es lo que pide el mapa de
   * un bioma específico (D-200.x, Mundo Kinder). Sin él, devuelve TODO
   * (los 4 biomas juntos), para cuando haga falta verlos a la vez.
   */
  async resumen(bioma?: string): Promise<Resumen[]> {
    const todas = await this.state.storage.list<FilaDeHabilidad>({ prefix: PREFIJO });
    const salida: Resumen[] = [];
    for (const [llave, fila] of todas) {
      const { skillId, bioma: biomaDeFila } = partirLlave(llave);
      if (bioma && biomaDeFila !== bioma) continue;
      salida.push(this.resumirFila(skillId, biomaDeFila, fila));
    }
    return salida;
  }

  private resumirFila(skillId: string, bioma: string, fila: FilaDeHabilidad): Resumen {
    return {
      skillId,
      bioma,
      nivel: nivelDeHabilidad(fila.habilidad.habilidad),
      ubicando: estaUbicando(fila.habilidad),
      etapa: etapaDe(fila.repaso),
      venceEn: fila.repaso.venceEn,
      habilidad: fila.habilidad.habilidad,
      respondidos: fila.habilidad.respondidos,
      fallosSeguidos: fila.habilidad.fallosSeguidos,
    };
  }
}

// ---------------------------------------------------------------------------
// El acceso desde una ruta
// ---------------------------------------------------------------------------

/**
 * Abre el objeto de UN niño.
 *
 * `childProfileId` es un parámetro y nunca un literal, que es exactamente lo que
 * `audits/do-por-entidad.mjs` comprueba. Si algún día alguien escribe
 * `idFromName("global")` aquí, el commit se detiene antes de que exista el
 * cuello de botella.
 */
function objetoDe(ns: DurableObjectNamespace, childProfileId: string) {
  return ns.get(ns.idFromName(childProfileId));
}

/**
 * Registra una respuesta en el modelo del niño.
 *
 * **Falla ABIERTO**, igual que el limitador de tasa y por la misma clase de
 * razón: si el objeto no responde, el niño ya contestó y su respuesta ya se
 * calificó (F3, el servidor califica). Lo que se pierde es la actualización del
 * modelo, y eso significa que el siguiente ítem estará un poco peor elegido —
 * no que el niño se quede sin jugar. Fallar cerrado aquí convertiría un fallo de
 * infraestructura en una pantalla de error delante de un niño de 4 años.
 *
 * La consecuencia, dicha: respuestas perdidas empeoran la estimación en
 * silencio. No hay reintento en v1.
 */
export async function registrarEnModelo(
  ns: DurableObjectNamespace | undefined,
  childProfileId: string,
  registro: Registro,
): Promise<Resumen | null> {
  if (!ns) return null;
  try {
    const stub = objetoDe(ns, childProfileId);
    const r = await stub.fetch("https://aprendiz/registrar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(registro),
    });
    return (await r.json()) as Resumen;
  } catch {
    return null;
  }
}

/**
 * Lo que el panel del padre —o el mapa de un bioma— puede leer. Devuelve
 * vacío si el objeto no está. `bioma`, si se da, filtra a solo ese mundo
 * (Mundo Kinder multi-bioma); sin él, trae los 4 biomas juntos.
 */
export async function leerModelo(
  ns: DurableObjectNamespace | undefined,
  childProfileId: string,
  bioma?: string,
): Promise<Resumen[]> {
  if (!ns) return [];
  try {
    const stub = objetoDe(ns, childProfileId);
    const url = bioma ? `https://aprendiz/resumen?bioma=${encodeURIComponent(bioma)}` : "https://aprendiz/resumen";
    return (await (await stub.fetch(url)).json()) as Resumen[];
  } catch {
    return [];
  }
}

/**
 * **Borra el modelo del niño** (criterio #104).
 *
 * ─── Ésta NO falla abierto, y es la única que no ─────────────────────────────
 *
 * Devuelve `false` si no pudo borrar, y quien la llama **tiene que tratarlo como
 * un fallo del borrado**, no seguir adelante. Un borrado que dice que sí sin
 * haber borrado es la peor forma de este error: el padre recibe la confirmación,
 * el perfil desaparece de la interfaz, y el modelo del niño sigue vivo en un
 * objeto que ya nadie sabe cómo encontrar porque el `child_profile_id` que abría
 * ese objeto se borró de D1.
 *
 * Ese es el orden que hay que respetar: **primero el DO, después la fila de
 * D1.** Si se hace al revés y el DO falla, la llave para volver a intentarlo ya
 * no existe.
 */
export async function olvidarModelo(
  ns: DurableObjectNamespace | undefined,
  childProfileId: string,
): Promise<boolean> {
  // Sin binding no hay nada que borrar, y decir que sí es correcto: no existe.
  if (!ns) return true;
  const stub = objetoDe(ns, childProfileId);
  const r = await stub.fetch("https://aprendiz/olvidar");
  return r.ok;
}
