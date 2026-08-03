#!/usr/bin/env node
// Auditor determinista — el tope de gasto de Larry, por perfil y por día
//
// Hace cumplir: líneas rojas #2 y #4, D-015 (enmendada por el plan de F6 §5.1),
// D-021, D-035, D-037, y el criterio #136 de F6.
//
// ─── Qué clase de fallo previene ───────────────────────────────────────────
//
// Todos los de este auditor son fallos **silenciosos**. Ninguno rompe una
// pantalla, ninguno tira una prueba, y el síntoma de cualquiera de ellos es una
// factura o una fila de telemetría que no se puede borrar. Son exactamente el
// tipo de cosa que D-032 dice que no se descubre leyendo:
//
//  · Un medidor que **falla abierto** cuando su objeto no responde: barra libre
//    de inferencia, y nadie se entera hasta que llega el recibo. Es la decisión
//    contraria a la de `consultarLimite`, que falla abierto **a propósito**
//    porque lo que protege es distinto — allí la ausencia deja el formulario
//    lento, aquí dejaría el gasto sin cota.
//  · Un `usage` ausente cobrado como **cero**: el medidor se convierte en un
//    contador de ceros y el tope no dispara nunca. El plan §5.4 lo llama por su
//    nombre: *«un tope que falla abierto en silencio es peor que no tener tope,
//    porque nadie lo revisa»*.
//  · Cobrar **después** en vez de reservar antes: el tope pasa a ser «el tope,
//    más una llamada», y la de más es siempre la más cara.
//  · Un id de niño en la telemetría de costo. Analytics Engine retiene tres
//    meses y **no borra bajo demanda** (`mc-32` riesgo #7), así que lo que entre
//    ahí no sale cuando un padre ejerza su derecho. El inventario llegó a decir
//    literalmente «per-child, per-model».
//
// ─── Las seis cosas que comprueba ──────────────────────────────────────────
//
//  1. Sin `usage`, se cobra el MÁXIMO de la banda. Jamás cero.
//  2. Se RESERVA antes de llamar al modelo, no después.
//  3. El medidor falla CERRADO.
//  4. El plan gratis es cero llamadas y cero dólares (D-021).
//  5. La telemetría de costo no indexa al perfil, ni siquiera hasheado.
//  6. El contador por perfil se borra: tiene alarma, y `borrado-cuatro-sistemas`
//     alcanza al Durable Object.
//
// LO QUE NO PUEDE COMPROBAR: si los números del tope son los correctos. Salen de
// una cuenta sobre D-021 y de un `[estimado]` para la banda adulta, y el propio
// plan §5.4 avisa de que las tres estimaciones de costo que circulan son
// incompatibles entre sí — y que la que decide todo, los tokens de razonamiento,
// este repo ya la falló por 6.3× (D-035 hallazgo 3). Lo que este auditor
// garantiza es que el número, sea el que sea, **se hace cumplir**.

import { leer, existe, informar, sinComentarios } from "./lib/repo.mjs";

const GASTO = "packages/tutor/src/gasto.ts";
const MEDIDOR = "apps/web/src/lib/ratelimiter.ts";
const ENDPOINT = "apps/web/src/pages/api/larry.ts";
const BORRADO = "audits/borrado-cuatro-sistemas.mjs";

const problemas = [];
const notas = [];
let revisados = 0;

// --- 0. Las piezas. Fallar CERRADO -----------------------------------------
const gasto = existe(GASTO) ? leer(GASTO) : null;
const medidor = existe(MEDIDOR) ? leer(MEDIDOR) : null;
const endpoint = existe(ENDPOINT) ? leer(ENDPOINT) : null;

if (!gasto) problemas.push(`no existe \`${GASTO}\`. Es donde vive la aritmética del tope; sin él no hay tope que auditar.`);
if (!medidor) problemas.push(`no existe \`${MEDIDOR}\`. Es el objeto que cuenta sin carrera.`);
if (!endpoint) problemas.push(`no existe \`${ENDPOINT}\`. Es el único sitio que gasta.`);

// --- 1. Sin `usage`, el MÁXIMO. Jamás cero --------------------------------
if (gasto) {
  revisados++;
  const codigo = sinComentarios(gasto);

  const fn = codigo.match(/export function costoReal[\s\S]*?\n\}/);
  if (!fn) {
    problemas.push(`\`${GASTO}\` no exporta \`costoReal\`. Es la función que decide qué se cobra cuando el proveedor calla.`);
  } else {
    if (!/return costoMaximo\(/.test(fn[0])) {
      problemas.push(
        "`costoReal` no cae en `costoMaximo` cuando falta `usage`. Un `usage` ausente cobrado como cero " +
          "convierte el medidor en un contador de ceros: el tope no dispara nunca y el síntoma es la " +
          "factura, no un error (plan §5.4).",
      );
    }
    if (/return 0\b/.test(fn[0])) {
      problemas.push("`costoReal` puede devolver cero. Un tope que falla abierto en silencio es peor que no tener tope.");
    }
  }

  // La reserva tiene que mirar el máximo, no una media.
  const alcanzaFn = codigo.match(/export function alcanza[\s\S]*?\n\}/);
  if (!alcanzaFn || !/costoMaximo\(/.test(alcanzaFn[0])) {
    problemas.push(
      "`alcanza` no reserva el costo MÁXIMO de la banda. Sin reserva previa el tope es «el tope, más " +
        "una llamada», y la de más es siempre la más cara.",
    );
  }

  // El redondeo va en contra nuestra, nunca a favor.
  if (!/Math\.ceil/.test(codigo)) {
    problemas.push(
      "`costoDe` no redondea hacia arriba. Miles de llamadas redondeadas a la baja son un tope que se " +
        "queda corto exactamente en la dirección que nadie revisa.",
    );
  }

  // --- 4. El plan gratis es cero (D-021) ----------------------------------
  const gratis = codigo.match(/gratis:\s*\{([\s\S]*?)\n  \}/);
  if (!gratis) {
    problemas.push("no encuentro el bloque `gratis` en la tabla de topes. D-021 le da al plan gratis explicaciones PREGENERADAS.");
  } else {
    const cifras = [...gratis[1].matchAll(/llamadas:\s*(\d+),\s*microdolares:\s*([\w.]+)/g)];
    if (cifras.length === 0) {
      problemas.push("el bloque `gratis` no declara llamadas y microdólares por banda");
    }
    for (const c of cifras) {
      if (c[1] !== "0" || c[2] !== "0") {
        problemas.push(
          `el plan gratis tiene un tope distinto de cero (\`llamadas: ${c[1]}, microdolares: ${c[2]}\`). ` +
            "D-021 dice que el plan gratis tiene «Larry con explicaciones pregeneradas» y el Plan " +
            "Familia «Larry en vivo ilimitado». Un diseño de F6 propuso doce llamadas gratis sin notar " +
            "que la decisión ya estaba tomada: si el dueño quiere un gusto en el gratis, es una " +
            "ENMIENDA a D-021, no un número que se elige aquí.",
        );
      }
    }
  }

  // --- 5. La telemetría no indexa al perfil -------------------------------
  const indice = codigo.match(/INDICE_TELEMETRIA\s*=\s*\[([^\]]*)\]/);
  if (!indice) {
    problemas.push("no encuentro `INDICE_TELEMETRIA`. Es lo que declara qué dimensiones tiene la telemetría de costo.");
  } else {
    for (const prohibido of ["perfil", "profile", "child", "nino", "niño", "pd", "alias", "sesion", "session"]) {
      if (new RegExp(`"${prohibido}"`, "i").test(indice[1])) {
        problemas.push(
          `la telemetría de costo indexa por \`${prohibido}\`. El índice es \`banda|locale|modelo\` y NUNCA ` +
            "el perfil, ni siquiera hasheado: Analytics Engine retiene tres meses y no borra bajo " +
            "demanda (`mc-32` riesgo #7), así que lo que entre ahí no se puede sacar cuando un padre " +
            "ejerza su derecho de borrado. El inventario llegó a decir «per-child, per-model» " +
            "(línea roja #2, D-037).",
        );
      }
    }
  }
}

// --- 2 y 3. La reserva va ANTES, y el medidor falla CERRADO ---------------
if (medidor) {
  revisados++;
  const codigo = sinComentarios(medidor);

  const fn = codigo.match(/export async function medirTutor[\s\S]*?\n\}/);
  if (!fn) {
    problemas.push(`\`${MEDIDOR}\` no exporta \`medirTutor\`. Es el único camino al medidor.`);
  } else {
    const captura = fn[0].match(/catch[\s\S]*?\n\s{2}\}/);
    if (!/permitido:\s*false/.test(fn[0])) {
      problemas.push(
        "`medirTutor` nunca devuelve `permitido: false`. Tiene que fallar CERRADO: un objeto caído " +
          "que deje pasar la llamada es barra libre de inferencia hasta que llegue la factura. Es la " +
          "decisión CONTRARIA a la de `consultarLimite`, y a propósito — allí la ausencia deja el " +
          "formulario lento, aquí dejaría el gasto sin cota.",
      );
    }
    if (captura && /permitido:\s*true/.test(captura[0])) {
      problemas.push("`medirTutor` falla ABIERTO en su `catch`. Ver arriba: aquí eso es gasto sin cota.");
    }
  }

  if (!/setAlarm/.test(codigo)) {
    problemas.push(
      `\`${MEDIDOR}\` no programa ninguna alarma para el contador del tutor. Sin alarma, cada perfil ` +
        "que pida una explicación deja un objeto con estado para siempre — y ese estado es un contador " +
        "POR PERFIL, que es justo lo que el plan §5.3 acota a siete días.",
    );
  }
}

if (endpoint) {
  revisados++;
  const codigo = sinComentarios(endpoint);

  const dondeReserva = codigo.indexOf('accion: "reservar"');
  const dondeLlama = codigo.indexOf("AI.run(");
  const dondeLiquida = codigo.indexOf('accion: "liquidar"');

  if (dondeReserva < 0) {
    problemas.push(
      `${ENDPOINT} no reserva antes de llamar. La reserva previa es lo que hace del tope una cota ` +
        "superior: sin ella, la última llamada del día lo rebasa por su cuenta.",
    );
  }
  if (dondeLlama < 0) {
    problemas.push(`${ENDPOINT} no llama a \`AI.run\`. ¿Cambió la forma de llamar al modelo, o dejó de haber camino en vivo?`);
  }
  if (dondeReserva >= 0 && dondeLlama >= 0 && dondeReserva > dondeLlama) {
    problemas.push(
      `${ENDPOINT} reserva DESPUÉS de llamar al modelo. Cobrar después es enterarse después: el tope ` +
        "pasa a ser «el tope, más una llamada».",
    );
  }
  if (dondeLiquida < 0) {
    problemas.push(
      `${ENDPOINT} no liquida el costo real. Sin liquidar, la reserva se queda apartada para siempre y ` +
        "el perfil se queda sin cuota aunque la llamada haya costado la décima parte.",
    );
  }
  if (dondeLiquida >= 0 && dondeLlama >= 0 && dondeLiquida < dondeLlama) {
    problemas.push(`${ENDPOINT} liquida antes de llamar, así que cobra un costo que todavía no existe.`);
  }

  // La liquidación tiene que ocurrir TAMBIÉN cuando la llamada falla: un fallo
  // del proveedor puede haber consumido tokens igual.
  if (dondeLiquida >= 0) {
    const antesDeLiquidar = codigo.slice(dondeLlama, dondeLiquida);
    if (!/catch/.test(antesDeLiquidar)) {
      problemas.push(
        `${ENDPOINT} liquida sin haber capturado el fallo de la llamada. Un proveedor que revienta a ` +
          "medio camino puede haber consumido tokens igual, y una liquidación que solo corre en el " +
          "camino feliz deja ese gasto sin apuntar.",
      );
    }
  }

  // El secreto del HMAC no puede ser opcional en el camino que gasta: sin `pd`
  // no hay contador por perfil y el tope no existe.
  if (!/TUTOR_PD_SECRET/.test(codigo)) {
    problemas.push(
      `${ENDPOINT} no usa ningún secreto para derivar el seudónimo diario. Sin \`pd\` determinista, ` +
        "distintos nodos producirían contadores distintos para el mismo perfil el mismo día y el tope " +
        "se multiplicaría por el número de sales vivas — fallando abierto, en silencio (plan §5.2).",
    );
  }
}

// --- 6. El borrado alcanza al contador por perfil --------------------------
{
  const borrado = leer(BORRADO);
  if (borrado) {
    revisados++;
    // No basta con que el archivo NOMBRE los Durable Objects — su prosa podría
    // nombrarlos y su lista no mirarlos, que es exactamente como estaba. Lo que
    // se comprueba es que haya una fila en `SISTEMAS`.
    const lista = borrado.match(/const SISTEMAS\s*=\s*\[([\s\S]*?)\n\];/);
    if (!lista || !/\["Durable Objects"/.test(lista[1])) {
      problemas.push(
        `\`${BORRADO}\` no tiene a los Durable Objects en su lista de sistemas. El contador del tutor guarda estado POR PERFIL ` +
          "siete días, y el plan §5.3 ya avisa de que ese auditor enumera D1, KV, R2 y Analytics — no " +
          "el objeto. Nota aparte que el plan también hace: este repo tiene DOS listas distintas de " +
          "«los cuatro sistemas», la del auditor y la de D-035 (D1, DO, AE, Vectorize), y nadie lo " +
          "había notado.",
      );
    }
  }
}

if (revisados > 0) {
  notas.push("el tope se hace cumplir reservando el máximo ANTES de llamar, no cobrando después");
  notas.push("`usage` ausente se cobra al máximo de la banda, nunca a cero");
}

informar({
  nombre: "larry-tope-gasto",
  problemas,
  notas,
  cita: "líneas rojas #2 y #4, D-015 (enmendada por el plan F6 §5.1), D-021, D-035, D-037, criterio #136",
  revisados,
  resumen: `${GASTO} + ${MEDIDOR} + ${ENDPOINT}`,
  porQueBloquea:
    "todos los fallos que vigila son silenciosos: ninguno rompe una pantalla y el síntoma de " +
    "cualquiera de ellos es una factura, o una fila de telemetría de un menor que ya no se puede " +
    "borrar porque Analytics Engine retiene tres meses y no borra bajo demanda.",
  noComprueba: [
    "si los números del tope son los correctos. Salen de una cuenta sobre D-021 y de un `[estimado]` " +
      "para la banda adulta, y el plan §5.4 avisa de que las tres estimaciones de costo que circulan " +
      "son incompatibles entre sí. Lo que esto garantiza es que el número, sea el que sea, se cumple.",
    "que el AI Gateway calcule costo para modelos `@cf/`. Si no está en su base de precios, el tope " +
      "en DÓLARES no dispara nunca y el Gateway deja de ser red de seguridad (plan §5.4). Se " +
      "comprueba llamando, no leyendo, y es parte de la medición de P-18.",
  ],
});
