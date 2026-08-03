// Casos del tope de gasto por perfil y por día (F6 #136, plan F6 §5).
//
// Lo que esta prueba tiene que demostrar, y no solo describir: **que el tope es
// una cota superior**. No «aproximadamente», no «en condiciones normales»: que
// no existe una secuencia de peticiones que lo rebase, ni siquiera cuando el
// proveedor deja de mandar `usage` y cada llamada se cobra al máximo.
//
// Es la razón de que el medidor reserve ANTES de llamar. Sin reserva previa, la
// última llamada del día podría rebasar el tope por su cuenta, y el tope sería
// «el tope, más una llamada» — que es como se descubre por la factura.
//
// La segunda cosa que defiende: que el plan gratis sea CERO. D-021 dice que el
// plan gratis tiene explicaciones pregeneradas y el Plan Familia «Larry en vivo
// ilimitado». Un diseño de F6 propuso doce llamadas gratis sin notar que la
// decisión ya estaba tomada.

import {
  diaDelTope,
  seudonimoDiario,
  topeDe,
  peldano,
  costoDe,
  costoMaximo,
  costoReal,
  alcanza,
  debeAbrirse,
  ESTADO_VACIO,
  TOPES,
  TOPE_DIARIO_NINO,
  TOPE_DIARIO_ADULTO,
  PRECIO_FAMILIA_MES,
  PERFILES_POR_CUENTA,
  PARTE_DE_LARRY,
  UMBRAL_DESCARTES,
  INDICE_TELEMETRIA,
} from "./gasto.ts";
import { MODELOS, TOPE_TOKENS_ENTRADA, TOPE_TOKENS_SALIDA } from "./en-vivo.ts";
import { ORDEN_TEMAS } from "./banda.ts";

let fallos = 0;
const ok = (cond, nombre) => {
  console.log(`  ${cond ? "✓" : "✗"} ${nombre}`);
  if (!cond) fallos++;
};

console.log("larry/gasto — el tope por perfil y por día, demostrado y no descrito\n");

// ── 1 · El día está definido, y las dos capas usan la misma función ─────────
{
  const t = Date.UTC(2026, 7, 2, 23, 59, 59);
  ok(diaDelTope(t) === "2026-08-02", "el día es UTC y se lee de una sola función");
  ok(diaDelTope(t + 1_000) === "2026-08-03", "un segundo después cambia el día");
  ok(diaDelTope(t) === diaDelTope(t), "la función es determinista — un tope irreproducible no es un tope");
}

// ── 2 · `pd` — determinista, y distinto por perfil y por día ────────────────
{
  const a = await seudonimoDiario("secreto", "2026-08-02", "perfil-1");
  const b = await seudonimoDiario("secreto", "2026-08-02", "perfil-1");
  const c = await seudonimoDiario("secreto", "2026-08-02", "perfil-2");
  const d = await seudonimoDiario("secreto", "2026-08-03", "perfil-1");

  ok(a === b, "el mismo perfil el mismo día da el MISMO `pd` — si no, el tope se multiplicaría por el número de sales vivas y fallaría abierto en silencio");
  ok(a !== c, "dos perfiles no comparten `pd`, así que no comparten contador");
  ok(a !== d, "el `pd` de ayer no es el de hoy: los contadores de ayer dejan de ser vinculables");
  ok(!a.includes("perfil-1") && a.length === 24, "`pd` es un hash truncado, no el identificador con otro nombre");
  ok((await seudonimoDiario("otro", "2026-08-02", "perfil-1")) !== a, "sin el secreto, `pd` no se puede reproducir desde fuera");
}

// ── 3 · Los topes salen de una cuenta, no de un número tecleado ─────────────
{
  ok(
    TOPE_DIARIO_NINO === Math.floor((PRECIO_FAMILIA_MES / PERFILES_POR_CUENTA / 30) * PARTE_DE_LARRY),
    `el tope de un niño se DERIVA de D-021: $8/mes ÷ ${PERFILES_POR_CUENTA} perfiles ÷ 30 días × ${PARTE_DE_LARRY} = ${TOPE_DIARIO_NINO} µ$`,
  );
  ok(TOPE_DIARIO_NINO === 8_888, `el tope diario de un perfil de niño es ${TOPE_DIARIO_NINO} µ$ ≈ $0.0089`);
  ok(TOPE_DIARIO_ADULTO === 60_000, `el tope diario de un perfil adulto es ${TOPE_DIARIO_ADULTO} µ$ = $0.06`);
  ok(
    TOPE_DIARIO_ADULTO > TOPE_DIARIO_NINO,
    "el tope adulto es mayor porque el modelo es otro: `kimi-k2.6` cuesta 5.3× más por token de salida que `gpt-oss-120b` (D-035)",
  );

  // Y la comprobación que impide que el tope sea decorativo: tiene que alcanzar
  // para al menos una llamada de su banda, o la banda no tiene camino en vivo.
  for (const tema of ORDEN_TEMAS) {
    ok(
      TOPES.familia[tema].microdolares >= costoMaximo(tema),
      `${tema}: el tope (${TOPES.familia[tema].microdolares} µ$) alcanza para al menos una llamada (${costoMaximo(tema)} µ$)`,
    );
  }
}

// ── 4 · El plan gratis es CERO, tal como dice D-021 ─────────────────────────
{
  for (const tema of ORDEN_TEMAS) {
    const tope = topeDe("gratis", tema);
    ok(tope.llamadas === 0 && tope.microdolares === 0, `gratis · ${tema}: cero llamadas y cero dólares (D-021, P-5)`);
    ok(peldano(0, tope, 0) === "P3", `gratis · ${tema}: el peldaño es P3 desde la primera petición, no P0`);
    ok(!alcanza(ESTADO_VACIO, tema, tope), `gratis · ${tema}: nunca alcanza`);
  }
}

// ── 5 · El costo: aritmética entera, redondeo en contra, y `usage` ausente ──
{
  ok(costoDe(MODELOS.chico, 1_000_000, 1_000_000) === 1_100_000, "un millón de cada uno en el modelo chico cuesta entrada + salida");
  ok(costoDe(MODELOS.chico, 1, 1) === 2, "se redondea HACIA ARRIBA: una llamada mínima no cuesta cero");
  ok(
    costoMaximo("PRO") === costoDe(MODELOS.grande, TOPE_TOKENS_ENTRADA, TOPE_TOKENS_SALIDA.PRO),
    "el costo máximo de una banda es su presupuesto de tokens al precio de su modelo",
  );

  // LA regla de §5.4 que no es opcional.
  ok(costoReal("SERIO", null) === costoMaximo("SERIO"), "sin `usage` se cobra el MÁXIMO de la banda, jamás cero");
  ok(costoReal("SERIO", {}) === costoMaximo("SERIO"), "un `usage` vacío se cobra al máximo");
  ok(costoReal("SERIO", { prompt_tokens: 10 }) === costoMaximo("SERIO"), "un `usage` a medias se cobra al máximo");
  ok(
    costoReal("SERIO", { prompt_tokens: 1_000, completion_tokens: 100 }) < costoMaximo("SERIO"),
    "un `usage` completo se cobra por lo que dice",
  );
  ok(
    costoReal("SERIO", { input_tokens: 1_000, output_tokens: 100 }) ===
      costoReal("SERIO", { prompt_tokens: 1_000, completion_tokens: 100 }),
    "los dos nombres del mismo dato se aceptan — el binding y el endpoint compatible no los llaman igual",
  );
}

// ── 6 · LA PRUEBA: el tope es una cota superior ─────────────────────────────
//
// Se simula un perfil que pide explicación en vivo diez mil veces seguidas. En
// la mitad de las llamadas el proveedor no manda `usage`, que es el caso caro. En
// ningún momento, con ninguna secuencia, el gastado puede pasar del tope.
{
  for (const tema of ORDEN_TEMAS) {
    const tope = topeDe("familia", tema);
    const estado = { ...ESTADO_VACIO };
    let atendidas = 0;

    for (let i = 0; i < 10_000; i++) {
      if (!alcanza(estado, tema, tope)) continue;
      // Reservar.
      estado.llamadas += 1;
      estado.reservado += costoMaximo(tema);
      // Liquidar. La mitad de las veces el proveedor calla y se cobra el máximo.
      const uso = i % 2 === 0 ? null : { prompt_tokens: 900, completion_tokens: 120 };
      estado.reservado = Math.max(0, estado.reservado - costoMaximo(tema));
      estado.gastado += costoReal(tema, uso);
      atendidas++;
    }

    ok(
      estado.gastado <= tope.microdolares,
      `${tema}: tras 10.000 peticiones se gastaron ${estado.gastado} µ$ y el tope es ${tope.microdolares} µ$ (${atendidas} llamadas atendidas)`,
    );
    ok(estado.llamadas <= tope.llamadas, `${tema}: ${estado.llamadas} llamadas contra un tope de ${tope.llamadas}`);
    ok(atendidas > 0, `${tema}: el tope deja pasar al menos una llamada — si no, la banda no tendría camino en vivo`);
  }
}

// ── 7 · El peor caso: `usage` NUNCA llega ──────────────────────────────────
//
// El escenario que convierte un medidor en un contador de ceros. Aquí tiene que
// seguir topando, y además tiene que topar ANTES, no después.
{
  for (const tema of ORDEN_TEMAS) {
    const tope = topeDe("familia", tema);
    const estado = { ...ESTADO_VACIO };
    for (let i = 0; i < 1_000; i++) {
      if (!alcanza(estado, tema, tope)) break;
      estado.llamadas += 1;
      estado.gastado += costoReal(tema, undefined);
    }
    ok(
      estado.gastado <= tope.microdolares && estado.llamadas <= tope.llamadas,
      `${tema}: con \`usage\` siempre ausente, ${estado.gastado} µ$ ≤ ${tope.microdolares} µ$`,
    );
  }
}

// ── 8 · La escalera P0-P3 ──────────────────────────────────────────────────
{
  const tope = { llamadas: 100, microdolares: 1_000 };
  ok(peldano(0, tope) === "P0", "sin gasto, P0");
  ok(peldano(599, tope) === "P0", "por debajo del 60%, P0");
  ok(peldano(600, tope) === "P1", "al 60%, P1 — solo el error no catalogado llama");
  ok(peldano(849, tope) === "P1", "por debajo del 85%, P1");
  ok(peldano(850, tope) === "P2", "al 85%, P2 — cero llamadas en vivo");
  ok(peldano(1_000, tope) === "P2", "al 100% justo, todavía P2");
  ok(peldano(1_001, tope) === "P3", "por encima del tope, P3");
  ok(peldano(0, tope, 100) === "P3", "agotar las LLAMADAS también lleva a P3, aunque sobren dólares");
  ok(peldano(0, tope, 60) === "P1", "las llamadas y los dólares se miran los dos, y manda el peor");
}

// ── 9 · El interruptor automático por tasa de descarte (P-14) ──────────────
{
  ok(UMBRAL_DESCARTES.descartes === 5, "cinco descartes abren el interruptor — un umbral absoluto y pequeño, no una ventana de mil que tarda semanas en llenarse");
  ok(!debeAbrirse(4), "cuatro descartes no abren nada");
  ok(debeAbrirse(5), "cinco sí");
  ok(debeAbrirse(50), "y sigue abierto: la reactivación es a mano, porque un apagado que se cura solo esconde un problema que empeora");
}

// ── 10 · La telemetría no puede indexar al niño ────────────────────────────
{
  ok(
    !INDICE_TELEMETRIA.includes("perfil") && !INDICE_TELEMETRIA.includes("pd") && !INDICE_TELEMETRIA.includes("nino"),
    "el índice de telemetría es banda|locale|modelo y NADA del niño — Analytics Engine retiene tres meses y no borra bajo demanda (`mc-32` riesgo #7)",
  );
  ok(INDICE_TELEMETRIA.length === 3, "tres dimensiones, contadas");
}

console.log("");
if (fallos > 0) {
  console.error(`✗ ${fallos} caso(s) fallaron\n`);
  process.exit(1);
}
console.log("✓ el tope es una cota superior, y está demostrado\n");
