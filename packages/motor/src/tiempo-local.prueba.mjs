#!/usr/bin/env node
// Casos de la puerta única instante→día/hora — #268.
//
//     node --experimental-strip-types packages/motor/src/tiempo-local.prueba.mjs
//
// Por qué existen. Este módulo es el ÚNICO calendario del producto: la racha
// (F7), el corte nocturno (F8) y las misiones cuentan el día con él. Un error
// aquí no rompe nada visible — produce un día contado dos veces a las 23:00
// locales, o una ventana nocturna que se abre a la hora equivocada tras un
// vuelo. Nadie ve un error 500; se ve una racha que amanece movida.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { zonaValida, diaEfectivo, horaLocal } from "./tiempo-local.ts";
import { diaEfectivo as diaEfectivoDeRacha } from "./racha.ts";
import { diaEfectivo as diaEfectivoDeLimite, horaLocal as horaLocalDeLimite } from "./limite-pantalla.ts";

let fallos = 0;
let corridos = 0;

function caso(nombre, fn) {
  corridos++;
  try {
    fn();
    console.log(`  ✓ ${nombre}`);
  } catch (err) {
    fallos++;
    console.error(`  ✗ ${nombre}`);
    console.error(`      ${err.message}`);
  }
}

const igual = (a, b, msg) => {
  if (a !== b) throw new Error(`${msg ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuvo ${JSON.stringify(a)}`);
};
const cierto = (v, msg) => {
  if (!v) throw new Error(msg ?? "se esperaba verdadero");
};
const lanza = (fn, fragmento) => {
  try {
    fn();
  } catch (err) {
    if (fragmento && !String(err.message).includes(fragmento)) {
      throw new Error(`lanzó, pero por otra razón: "${err.message}"`);
    }
    return err;
  }
  throw new Error("no lanzó");
};

console.log("\ntiempo-local — la puerta única instante→día/hora (#268)\n");

caso("racha.ts y limite-pantalla.ts reexportan LA MISMA función, no copias", () => {
  cierto(diaEfectivo === diaEfectivoDeRacha, "racha.ts tiene otro calendario");
  cierto(diaEfectivo === diaEfectivoDeLimite, "limite-pantalla.ts tiene otro calendario");
  cierto(horaLocal === horaLocalDeLimite, "limite-pantalla.ts tiene otro reloj");
});

caso("el cruce de medianoche local es el día correcto, no el día UTC", () => {
  // 2026-08-02T04:30:00Z: en UTC ya es día 2, en Ciudad de México (UTC-6 en
  // verano) todavía son las 22:30 del día 1. Contarlo en UTC le regalaría —
  // o le robaría— un día de racha a medio país.
  const t = Date.parse("2026-08-02T04:30:00Z");
  igual(diaEfectivo(t, "America/Mexico_City"), "2026-08-01");
  igual(diaEfectivo(t, "UTC"), "2026-08-02");
});

caso("el cambio de huso por viaje mueve el día con la familia, no con el aparato", () => {
  // El mismo instante, dos hogares: la zona la da `users.timezone` del padre,
  // nunca el reloj del dispositivo del niño.
  const t = Date.parse("2026-01-15T11:30:00Z");
  igual(diaEfectivo(t, "Europe/Madrid"), "2026-01-15");
  igual(diaEfectivo(t, "America/Mexico_City"), "2026-01-15");
  igual(diaEfectivo(t, "Pacific/Auckland"), "2026-01-16");
});

caso("horaLocal da 24 horas y cruza la medianoche sin «24:xx»", () => {
  igual(horaLocal(Date.parse("2026-08-02T00:00:00Z"), "UTC"), "00:00");
  igual(horaLocal(Date.parse("2026-08-02T04:30:00Z"), "America/Mexico_City"), "22:30");
  igual(horaLocal(Date.parse("2026-08-02T02:30:00Z"), "Europe/Madrid"), "04:30");
});

caso("los instantes y zonas imposibles lanzan, no devuelven un día inventado", () => {
  lanza(() => diaEfectivo(Number.NaN, "UTC"), "instante no finito");
  lanza(() => horaLocal(Number.NaN, "UTC"), "instante no finito");
  lanza(() => diaEfectivo(Date.now(), "Marte/Olympus"), "zona horaria desconocida");
  lanza(() => horaLocal(Date.now(), "Marte/Olympus"), "zona horaria desconocida");
});

caso("zonaValida distingue una zona IANA real de una cadena parecida", () => {
  cierto(zonaValida("America/Mexico_City"), "Mexico_City debería ser válida");
  cierto(zonaValida("UTC"), "UTC debería ser válida");
  cierto(!zonaValida("Mexico City"), "«Mexico City» con espacio no es IANA");
  cierto(!zonaValida(""), "la cadena vacía no es una zona");
});

if (fallos > 0) {
  console.error(`\n✗ ${fallos} de ${corridos} casos fallaron`);
  process.exit(1);
}
console.log(`\n✓ ${corridos} casos`);
