#!/usr/bin/env node
// Auditor determinista — el manifiesto del corpus dice la verdad de hoy
//
// Hace cumplir: D-033 (el sitio publica la investigación completa y citable),
// D-022 (siete locales) y mc-48 §3 (declarar el idioma, no simularlo).
//
// Qué vigila, en una frase: que `apps/web/src/i18n/corpus-verificado.json`
// —la lista de qué documento puede servirse traducido— coincida con lo que
// `corpus-integridad` calcula sobre el corpus **tal como está ahora**.
//
// Por qué hace falta un segundo auditor para esto. El manifiesto se commitea, y
// lo consume el build: `corpus.ts` lo importa y solo mete al bundle los
// documentos que lista. Eso lo convierte en una afirmación congelada sobre
// archivos que siguen cambiando. Los dos modos de falla son opuestos y los dos
// son malos:
//
//   · **Se queda corto.** Alguien arregla una traducción, no regenera, y el
//     sitio sigue publicando ese documento en inglés. Trabajo hecho que no se
//     ve. Molesto, no grave.
//   · **Se queda largo.** Alguien EDITA una traducción ya verificada y le mete
//     una cifra mala. El manifiesto sigue diciendo que ese documento está
//     verificado, el sitio lo publica, y su nota de idioma afirma que "cada
//     número coincide con el original". **Eso es publicar una cita falsa con
//     nuestro nombre encima, con una promesa de verificación al lado.** Es el
//     daño exacto que `corpus-integridad` existe para impedir, entrando por la
//     puerta de atrás.
//
// El segundo es la razón de este archivo. Un manifiesto que envejece falla
// ABIERTO: nada se rompe, nada avisa, y la mentira crece sola. D-032 nombra ese
// modo por su nombre —"seis auditores fallaban abiertos sin que nadie lo
// supiera"— y este repositorio ya lo pagó una vez.
//
// Por qué no basta con correr `corpus-integridad` en el gancho: ese auditor sale
// con 1 mientras exista UN documento con hallazgo, y hoy hay 36. Bloquear cada
// commit por eso haría que todo el mundo usara `--no-verify`, que es como se
// muere una flota de auditores. Este comprueba algo distinto y siempre
// alcanzable: que la lista esté al día. Que haya documentos fuera de ella es
// normal; que la lista mienta, no.
//
// Arreglo, cuando bloquea:
//   node audits/corpus-integridad.mjs --manifiesto

import { readFileSync, existsSync } from "node:fs";
import { calcularManifiesto, RUTA_MANIFIESTO, LOCALES_DESTINO } from "./corpus-integridad.mjs";

function main() {
  if (!existsSync(RUTA_MANIFIESTO)) {
    console.error(`✗ corpus-manifiesto: no existe ${RUTA_MANIFIESTO}`);
    console.error("");
    console.error("  Sin él, `corpus.ts` no puede saber qué traducción es publicable y el");
    console.error("  build entero se cae. Genéralo:");
    console.error("    node audits/corpus-integridad.mjs --manifiesto");
    process.exit(1);
  }

  let enDisco;
  try {
    enDisco = JSON.parse(readFileSync(RUTA_MANIFIESTO, "utf8"));
  } catch (e) {
    console.error(`✗ corpus-manifiesto: ${RUTA_MANIFIESTO} no es JSON válido — ${e.message}`);
    process.exit(1);
  }

  const hoy = calcularManifiesto();

  // Falla cerrado. Si el cálculo no ve ni un documento, algo se movió de sitio
  // —el corpus, la ruta, el glob— y un manifiesto vacío que "coincide" con un
  // disco vacío aprobaría borrar las 246 traducciones sin decir palabra.
  const totalHoy = Object.values(hoy).reduce((a, v) => a + v.length, 0);
  if (totalHoy === 0) {
    console.error("✗ corpus-manifiesto: el cálculo no encontró NI UNA traducción íntegra.");
    console.error("");
    console.error("  Esto es un fallo, no un aprobado: un escáner que no ve nada");
    console.error("  aprueba siempre. Comprueba que docs/research/<locale>/ existe.");
    process.exit(1);
  }

  const problemas = [];
  for (const locale of LOCALES_DESTINO) {
    const a = new Set(enDisco[locale] ?? []);
    const b = new Set(hoy[locale] ?? []);
    const deMas = [...a].filter((f) => !b.has(f)).sort();   // el manifiesto promete de más
    const deMenos = [...b].filter((f) => !a.has(f)).sort(); // trabajo hecho sin publicar
    if (deMas.length || deMenos.length) problemas.push({ locale, deMas, deMenos });
  }

  if (problemas.length) {
    console.error("✗ auditor corpus-manifiesto\n");
    for (const p of problemas) {
      console.error(`  ${p.locale}`);
      for (const f of p.deMas) {
        console.error(`    ✗ el manifiesto lo da por verificado y HOY NO PASA: ${f}`);
      }
      for (const f of p.deMenos) {
        console.error(`    · pasa hoy y el manifiesto no lo lista (traducción sin publicar): ${f}`);
      }
      console.error("");
    }
    console.error("  Hace cumplir: D-033, D-022, mc-48 §3");
    console.error("  Por qué bloquea: la página de un documento del manifiesto afirma que");
    console.error("  su traducción fue verificada contra la fuente. Si el manifiesto está");
    console.error("  viejo, esa afirmación es falsa — y una promesa de verificación falsa");
    console.error("  es peor que no verificar, porque invita a confiar.");
    console.error("");
    console.error("  Arreglo:  node audits/corpus-integridad.mjs --manifiesto");
    process.exit(1);
  }

  const resumen = LOCALES_DESTINO.map((l) => `${l} ${hoy[l].length}`).join(" · ");
  console.log(`✓ corpus-manifiesto — ${totalHoy} traducción(es) publicables, al día (${resumen})`);
}

main();
