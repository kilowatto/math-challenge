/**
 * La cola sin conexión, en IndexedDB. Criterio #41 de F3, `mc-33` impl. 6-8.
 *
 * Tres decisiones que el criterio nombra y que no son intercambiables:
 *
 *  1. **IndexedDB y no `localStorage`.** `localStorage` es síncrono: escribir
 *     ahí bloquea el hilo principal justo cuando el niño acaba de contestar, que
 *     es el momento en que INP se está midiendo (`mc-47` §4). Y tiene ~5 MB
 *     compartidos con todo lo demás del origen.
 *
 *  2. **El vaciado lo dispara `visibilitychange` y el foco, NUNCA Background
 *     Sync.** Background Sync no existe en Safari —ni en iOS, donde todo
 *     navegador es Safari por dentro— y el mercado objetivo incluye iPad como
 *     primera clase (D-041). Una cola que solo se vacía con una API que la mitad
 *     de los dispositivos no tiene es una cola que pierde datos en la mitad de
 *     los dispositivos.
 *
 *  3. **El puntaje queda PENDIENTE hasta que el servidor lo revalida.** No se
 *     muestra un número que después cambie: eso es peor que no mostrar nada,
 *     porque el niño ya lo leyó.
 *
 * La llave de idempotencia es `(sesión, orden)`, la misma que usa el Durable
 * Object. Reenviar lo ya sincronizado no rompe nada gracias a esa idempotencia,
 * pero gasta batería y datos de alguien que ya pagó por ellos.
 */

const BASE = "math-challenge-cola";
const ALMACEN = "intentos";
const VERSION = 1;

/**
 * Lo que se encola. **No hay campo de puntaje, y esa ausencia es el contrato.**
 *
 * Sin servidor no hay reloj confiable (`mc-33` impl. 7), así que un puntaje
 * calculado en el avión no se puede verificar. Lo que viaja es la elección.
 */
export interface IntentoPendiente {
  /** `${sesionId}·${orden}` — la llave de idempotencia, y la llave primaria. */
  llave: string;
  sesionId: string;
  orden: number;
  itemId: string;
  eleccion: number | string;
  /** Reloj del dispositivo. Sirve para ordenar y para diagnóstico, no para puntuar. */
  contestadoEn: number;
  /** Cuántas veces se ha intentado sincronizar. Para no reintentar para siempre. */
  intentos: number;
  payload?: { url: string; body: string };
}

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(BASE, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(ALMACEN)) {
        // `llave` como keyPath: encolar dos veces el mismo (sesión, orden)
        // sobrescribe en vez de duplicar. La idempotencia empieza aquí, antes
        // de que nada salga del dispositivo.
        db.createObjectStore(ALMACEN, { keyPath: "llave" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const enTransaccion = async <T>(modo: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
  const db = await abrir();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(ALMACEN, modo);
    const req = fn(tx.objectStore(ALMACEN));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
};

export const llaveDe = (sesionId: string, orden: number) => `${sesionId}·${orden}`;

/** Encola un intento. Si ya existe esa llave, lo sustituye en vez de duplicar. */
export async function encolar(
  i: Omit<IntentoPendiente, "llave" | "intentos">,
): Promise<void> {
  await enTransaccion("readwrite", (s) =>
    s.put({ ...i, llave: llaveDe(i.sesionId, i.orden), intentos: 0 }),
  );
}

export async function pendientes(): Promise<IntentoPendiente[]> {
  return enTransaccion("readonly", (s) => s.getAll() as IDBRequest<IntentoPendiente[]>);
}

export async function quitar(llave: string): Promise<void> {
  await enTransaccion("readwrite", (s) => s.delete(llave) as unknown as IDBRequest<undefined>);
}

/** Cuántas veces se reintenta antes de dejar de gastar batería. */
export const MAX_INTENTOS = 5;

/**
 * Vacía la cola contra el servidor.
 *
 * Devuelve cuántos se sincronizaron y cuántos se quedaron. **No lanza**: se
 * llama desde un manejador de eventos y una excepción ahí no la ve nadie.
 *
 * El servidor **recalcula**: lo que se manda es la elección, y lo que vuelve es
 * el veredicto. El tiempo local no viaja para puntuar.
 */
export async function vaciar(
  enviar: (i: IntentoPendiente) => Promise<boolean>,
): Promise<{ sincronizados: number; quedan: number }> {
  let sincronizados = 0;
  let cola: IntentoPendiente[];
  try {
    cola = await pendientes();
  } catch {
    return { sincronizados: 0, quedan: 0 };
  }

  for (const i of cola) {
    // Un intento que ya falló demasiadas veces deja de reintentarse, pero **no
    // se borra**: se queda para que alguien pueda mirarlo. Borrarlo sería
    // perder en silencio el trabajo de un niño, que es justo lo que D-047
    // existe para impedir.
    if (i.intentos >= MAX_INTENTOS) continue;

    let ok = false;
    try {
      ok = await enviar(i);
    } catch {
      ok = false;
    }

    if (ok) {
      await quitar(i.llave).catch(() => {});
      sincronizados++;
    } else {
      await enTransaccion("readwrite", (s) => s.put({ ...i, intentos: i.intentos + 1 })).catch(() => {});
    }
  }

  const quedan = (await pendientes().catch(() => [])).length;
  return { sincronizados, quedan };
}

/**
 * Engancha el vaciado a los eventos que de verdad existen en todas partes.
 *
 * **No usa Background Sync**, y el criterio lo pide así: no existe en Safari ni
 * en iOS, donde todo navegador es Safari por dentro, y el iPad es primera clase
 * (D-041). Una cola que solo se vacía con una API que la mitad de los
 * dispositivos no tiene pierde datos en la mitad de los dispositivos.
 *
 * `visibilitychange` cubre el caso real: el niño cierra la pestaña, va a otra
 * app, o el padre bloquea el teléfono, y al volver hay conexión.
 */
export function engancharVaciado(enviar: (i: IntentoPendiente) => Promise<boolean>): () => void {
  const intentar = () => {
    if (document.visibilityState !== "visible") return;
    if (!navigator.onLine) return;
    void vaciar(enviar);
  };

  document.addEventListener("visibilitychange", intentar);
  window.addEventListener("focus", intentar);
  window.addEventListener("online", intentar);
  intentar();

  return () => {
    document.removeEventListener("visibilitychange", intentar);
    window.removeEventListener("focus", intentar);
    window.removeEventListener("online", intentar);
  };
}

/**
 * Lo que se le enseña al niño mientras el puntaje no está confirmado.
 *
 * `"pendiente"` y no un número: mostrar un puntaje que después cambia es peor
 * que no mostrar ninguno, porque el niño ya lo leyó. La respuesta se guarda,
 * eso sí se le dice, y el número llega cuando el servidor lo revalida.
 */
export type EstadoDePuntaje = "pendiente" | "confirmado";
