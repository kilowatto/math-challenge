#!/usr/bin/env node
// Casos del formateador por locale — criterio #40 de F3, D-022, mc-34.
//
// Cada caso es una afirmación de `mc-34` que se puede ir a comprobar. La más
// importante, y la que casi nadie cree la primera vez: **México usa punto
// decimal**, como el inglés y a diferencia del resto del mundo hispano.

import {
  formatear, signo, separadorDeLista, formatearLista, operacion, claveDeMagnitud,
} from "./numeros.ts";

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

const es = (a, b, msg) => {
  if (a !== b) throw new Error(`${msg ?? ""}: esperaba «${b}», obtuve «${a}»`);
};

console.log("\n== números por locale — criterio #40, D-022, mc-34 ==\n");

caso("México usa PUNTO decimal — la excepción del mundo hispano (mc-34 §1)", () => {
  es(formatear(43.5, "es-MX", 1), "43.5", "es-MX");
  es(formatear(43.5, "es-ES", 1), "43,5", "es-ES");
  // Si estos dos coincidieran, el producto trataría "es" como un solo idioma,
  // que es exactamente lo que D-022 existe para impedir.
  if (formatear(43.5, "es-MX", 1) === formatear(43.5, "es-ES", 1)) {
    throw new Error("es-MX y es-ES escriben el decimal igual");
  }
});

caso("los millares de cada locale", () => {
  es(formatear(1234567, "es-MX"), "1,234,567", "es-MX");
  es(formatear(1234567, "es-ES"), "1.234.567", "es-ES");
  es(formatear(1234567, "en"), "1,234,567", "en");
  es(formatear(1234567, "pt-BR"), "1.234.567", "pt-BR");
  es(formatear(1234567, "de-DE"), "1.234.567", "de-DE");
});

caso("francés separa millares con espacio fino INSECABLE, no uno normal", () => {
  const fr = formatear(1234567, "fr-FR");
  es(fr, "1 234 567", "fr-FR");
  if (fr.includes(" ")) {
    throw new Error("hay un espacio normal: la línea podría romperse a media cifra");
  }
});

caso("Alemania divide con «:» y multiplica con «·», no con × (mc-34)", () => {
  es(signo("division", "de-DE"), ":", "división de-DE");
  es(signo("multiplicacion", "de-DE"), "·", "multiplicación de-DE");
  // La razón: en un aula alemana el × se lee como la variable x, y un ítem de
  // álgebra escrito con × es ambiguo.
  if (signo("multiplicacion", "de-DE") === "×") throw new Error("de-DE multiplica con ×");
});

caso("el ejemplo de mc-34: 127 : 4 = 31,75 en alemán", () => {
  es(operacion(127, "division", 4, "de-DE"), "127 : 4", "operación");
  es(formatear(31.75, "de-DE", 2), "31,75", "resultado");
});

caso("el mismo problema en inglés usa ÷ y punto", () => {
  es(operacion(127, "division", 4, "en"), "127 ÷ 4", "operación");
  es(formatear(31.75, "en", 2), "31.75", "resultado");
});

caso("donde el decimal es coma, la lista se separa con punto y coma", () => {
  // «1,5, 2,5» es ilegible y ambiguo; por eso esos locales usan «;».
  es(separadorDeLista("es-ES"), ";", "es-ES");
  es(separadorDeLista("fr-FR"), ";", "fr-FR");
  es(separadorDeLista("de-DE"), ";", "de-DE");
  es(separadorDeLista("es-MX"), ",", "es-MX");
  es(separadorDeLista("en"), ",", "en");
});

caso("una lista de decimales no es ambigua en ningún locale", () => {
  es(formatearLista([1.5, 2.5], "es-ES", 1), "1,5; 2,5", "es-ES");
  es(formatearLista([1.5, 2.5], "es-MX", 1), "1.5, 2.5", "es-MX");
});

caso("Brasil usa escala CORTA y Portugal LARGA — mil veces de diferencia", () => {
  es(claveDeMagnitud(9, "pt-BR"), "magnitud.billion", "pt-BR 10⁹");
  es(claveDeMagnitud(9, "pt-PT"), "magnitud.milMillones", "pt-PT 10⁹");
  if (claveDeMagnitud(9, "pt-BR") === claveDeMagnitud(9, "pt-PT")) {
    throw new Error("pt-BR y pt-PT nombran 10⁹ igual: uno de los dos está mil veces mal");
  }
});

caso("«Billion» alemán NO es «billion» inglés", () => {
  es(claveDeMagnitud(12, "de-DE"), "magnitud.billon", "de-DE 10¹²");
  es(claveDeMagnitud(12, "en"), "magnitud.trillion", "en 10¹²");
});

caso("los negativos conservan el signo delante del número agrupado", () => {
  es(formatear(-1234.5, "es-ES", 1), "-1.234,5", "es-ES");
  es(formatear(-1234.5, "es-MX", 1), "-1,234.5", "es-MX");
});

caso("los decimales son explícitos: 0.50 no se convierte en 0.5 solo", () => {
  es(formatear(0.5, "en", 2), "0.50", "dos decimales");
  es(formatear(0.5, "en", 1), "0.5", "uno");
});

caso("un número no finito se rechaza en vez de escribir «NaN» en pantalla", () => {
  for (const malo of [NaN, Infinity, -Infinity]) {
    try {
      formatear(malo, "en", 2);
      throw new Error(`${malo} no lanzó`);
    } catch (err) {
      if (!err.message.includes("formatear")) throw err;
    }
  }
});

caso("los siete locales tienen convención, ninguno cae en un valor por omisión", () => {
  for (const l of ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"]) {
    const s = formatear(1234.5, l, 1);
    if (!s || s.includes("undefined")) throw new Error(`${l} dio «${s}»`);
  }
});

console.log("");
if (fallos > 0) {
  console.error(`✗ números por locale — ${fallos} de ${corridos} caso(s) fallaron\n`);
  process.exit(1);
}
console.log(`✓ números por locale — ${corridos} casos, D-022 y mc-34\n`);
