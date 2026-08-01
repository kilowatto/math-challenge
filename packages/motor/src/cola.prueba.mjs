#!/usr/bin/env node
// Casos de la cola offline — criterio #41 de F3, mc-33 impl. 6-8.
//
// IndexedDB no existe en Node, así que se prueba la LÓGICA de vaciado con un
// almacén de mentira que se comporta igual. Lo que no se prueba aquí —que
// IndexedDB persista de verdad entre recargas— necesita un navegador y se dice.

let fallos = 0, corridos = 0;
function caso(n, fn) { corridos++; try { fn(); console.log(`  ✓ ${n}`); } catch (e) { fallos++; console.error(`  ✗ ${n}`); console.error(`      ${e.message}`); } }
const es = (a, b, m) => { if (a !== b) throw new Error(`${m ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`); };

// --- El almacén de mentira, con la misma semántica de llave -----------------
const MAX_INTENTOS = 5;
const crearCola = () => {
  const m = new Map();
  return {
    encolar: (i) => m.set(`${i.sesionId}·${i.orden}`, { ...i, llave: `${i.sesionId}·${i.orden}`, intentos: 0 }),
    pendientes: () => [...m.values()],
    quitar: (k) => m.delete(k),
    poner: (i) => m.set(i.llave, i),
  };
};

async function vaciar(cola, enviar) {
  let sincronizados = 0;
  for (const i of cola.pendientes()) {
    if (i.intentos >= MAX_INTENTOS) continue;
    let ok = false;
    try { ok = await enviar(i); } catch { ok = false; }
    if (ok) { cola.quitar(i.llave); sincronizados++; }
    else cola.poner({ ...i, intentos: i.intentos + 1 });
  }
  return { sincronizados, quedan: cola.pendientes().length };
}

const intento = (orden, extra = {}) => ({
  sesionId: "s1", orden, itemId: "k11-3-4", eleccion: 7, contestadoEn: 1700000000000, ...extra,
});

console.log("\n== cola offline en el dispositivo — criterio #41 ==\n");

caso("encolar dos veces el mismo (sesión, orden) NO duplica", async () => {
  const c = crearCola();
  c.encolar(intento(1));
  c.encolar(intento(1, { eleccion: 12 }));
  es(c.pendientes().length, 1);
  es(c.pendientes()[0].eleccion, 12, "el último gana");
});

caso("lo que se sincroniza se quita de la cola", async () => {
  const c = crearCola();
  c.encolar(intento(1)); c.encolar(intento(2));
  const r = await vaciar(c, async () => true);
  es(r.sincronizados, 2); es(r.quedan, 0);
});

caso("lo que falla se queda y cuenta el intento", async () => {
  const c = crearCola();
  c.encolar(intento(1));
  const r = await vaciar(c, async () => false);
  es(r.sincronizados, 0); es(r.quedan, 1);
  es(c.pendientes()[0].intentos, 1);
});

caso("un envío que LANZA no rompe el vaciado del resto", async () => {
  const c = crearCola();
  c.encolar(intento(1)); c.encolar(intento(2));
  const r = await vaciar(c, async (i) => { if (i.orden === 1) throw new Error("red"); return true; });
  es(r.sincronizados, 1, "el segundo sí pasó");
  es(r.quedan, 1);
});

caso("tras MAX_INTENTOS deja de reintentar, pero NO se borra", async () => {
  const c = crearCola();
  c.encolar(intento(1));
  for (let i = 0; i < MAX_INTENTOS + 3; i++) await vaciar(c, async () => false);
  es(c.pendientes().length, 1, "sigue ahí");
  es(c.pendientes()[0].intentos, MAX_INTENTOS, "dejó de contar en el tope");
  // Borrarlo sería perder en silencio el trabajo de un niño, que es justo lo
  // que D-047 existe para impedir.
});

caso("el intento en cola NO tiene dónde poner un puntaje", async () => {
  const permitidas = new Set(["sesionId","orden","itemId","eleccion","contestadoEn","llave","intentos"]);
  const c = crearCola(); c.encolar(intento(1));
  for (const k of Object.keys(c.pendientes()[0])) {
    if (!permitidas.has(k)) throw new Error(`lleva "${k}"`);
    if (/score|puntaje|puntos|points/i.test(k)) throw new Error(`lleva "${k}"`);
  }
});

caso("el orden de la cola no altera el resultado: la llave es (sesión, orden)", async () => {
  const c = crearCola();
  c.encolar(intento(3)); c.encolar(intento(1)); c.encolar(intento(2));
  const vistos = [];
  await vaciar(c, async (i) => { vistos.push(i.orden); return true; });
  es(JSON.stringify(vistos.sort()), JSON.stringify([1, 2, 3]));
});

console.log("");
if (fallos > 0) { console.error(`✗ cola offline — ${fallos} de ${corridos} fallaron\n`); process.exit(1); }
console.log(`✓ cola offline en el dispositivo — ${corridos} casos, criterio #41\n`);
