#!/usr/bin/env node
// Casos del motor de grupos infantiles — F9, D-087, D-099, D-100 (reparto).
//
//     node --experimental-strip-types packages/motor/src/grupo.prueba.mjs
//
// Por qué existen. Un código de unión ambiguo no da error — da un padre
// tecleando `O0I1L5` tres veces sin entrar. Un tope mal puesto no da error —
// da un salón de 40 o un club de papás con 35 familias que no se conocen. Y
// la regla del opt-in mal copiada no da error — da un niño en una tabla de
// posiciones cuyo padre nunca lo activó. Ninguno se ve leyendo la función;
// se ve ejecutándola.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import {
  ALFABETO_CODIGO,
  LONGITUD_CODIGO,
  TOPE_DURO_GRUPO,
  TOPE_SALON,
  TOPE_CLUB_PAPAS,
  GRUPOS_POR_CUENTA,
  CODIGOS_DE_REPORTE,
  generarCodigoDeUnion,
  normalizarCodigoDeUnion,
  codigoDeUnionEsValido,
  topePorOrigen,
  maxSizeEsValido,
  visibleEnTablaDePosiciones,
} from "./grupo.ts";

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

const afirma = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
const igual = (a, b, msg) => {
  if (a !== b) throw new Error(`${msg ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`);
};

// Un azar determinista para probar la forma del código sin depender del azar.
const azarDe = (semilla) => {
  let i = 0;
  const valores = Array.isArray(semilla) ? semilla : [semilla];
  return () => valores[i++ % valores.length];
};

caso("el alfabeto no tiene ningún carácter ambiguo", () => {
  for (const c of ["0", "O", "1", "I", "L"]) {
    afirma(!ALFABETO_CODIGO.includes(c), `el alfabeto contiene «${c}», que se confunde`);
  }
});

caso("el alfabeto no repite caracteres", () => {
  igual(new Set(ALFABETO_CODIGO).size, ALFABETO_CODIGO.length, "alfabeto");
});

caso("el código generado tiene exactamente 6 caracteres del alfabeto", () => {
  const codigo = generarCodigoDeUnion(azarDe(0.5));
  igual(codigo.length, LONGITUD_CODIGO, "longitud");
  afirma(codigoDeUnionEsValido(codigo), `«${codigo}» debería ser válido`);
});

caso("el extremo del alfabeto no se sale ni se trunca", () => {
  // r → 1 debe dar el ÚLTIMO carácter, no un índice fuera de rango.
  const codigo = generarCodigoDeUnion(azarDe(0.999999));
  igual(codigo, ALFABETO_CODIGO[ALFABETO_CODIGO.length - 1].repeat(LONGITUD_CODIGO), "extremo");
  // r → 0 debe dar el primero.
  igual(generarCodigoDeUnion(azarDe(0)), ALFABETO_CODIGO[0].repeat(LONGITUD_CODIGO), "inicio");
});

caso("normalizar acepta minúsculas y espacios", () => {
  igual(normalizarCodigoDeUnion("  abc234 "), "ABC234");
});

caso("la validación rechaza lo que no tiene la forma", () => {
  afirma(!codigoDeUnionEsValido("ABC"), "corto");
  afirma(!codigoDeUnionEsValido("ABC2345"), "largo");
  afirma(!codigoDeUnionEsValido("ABC10O"), "con ambiguos");
  afirma(!codigoDeUnionEsValido("ABC-34"), "con símbolo");
  afirma(codigoDeUnionEsValido("ABC234"), "válido");
});

caso("los topes por origen son los de D-087, y el club es menor", () => {
  igual(topePorOrigen("salon"), TOPE_SALON);
  igual(topePorOrigen("club_papas"), TOPE_CLUB_PAPAS);
  afirma(TOPE_CLUB_PAPAS < TOPE_SALON, "el club de papás tiene tope menor (D-027)");
  igual(TOPE_SALON, TOPE_DURO_GRUPO, "el tope duro del esquema es el del salón");
  afirma(GRUPOS_POR_CUENTA >= 1, "el límite de creación existe");
});

caso("maxSizeEsValido aplica el tope DEL ORIGEN, no el duro", () => {
  afirma(maxSizeEsValido("salon", 30), "salón de 30");
  afirma(maxSizeEsValido("salon", 35), "salón de 35");
  afirma(!maxSizeEsValido("salon", 36), "salón de 36 no");
  afirma(maxSizeEsValido("club_papas", TOPE_CLUB_PAPAS), "club en su tope");
  afirma(!maxSizeEsValido("club_papas", TOPE_SALON), "un club con tope de salón no");
  afirma(!maxSizeEsValido("salon", 0), "cero no");
  afirma(!maxSizeEsValido("salon", 30.5), "fraccionario no");
});

caso("la tabla de posiciones solo muestra opt-in = 1", () => {
  afirma(visibleEnTablaDePosiciones(1), "con opt-in sí");
  afirma(!visibleEnTablaDePosiciones(0), "sin opt-in no — el default (D-087)");
});

caso("el catálogo de motivos es cerrado y sin duplicados", () => {
  igual(new Set(CODIGOS_DE_REPORTE).size, CODIGOS_DE_REPORTE.length, "motivos");
  afirma(CODIGOS_DE_REPORTE.includes("OTRO"), "existe el cajón final");
  for (const c of CODIGOS_DE_REPORTE) {
    afirma(/^[A-Z_]+$/.test(c), `«${c}» no es un código ASCII — es un enum, no prosa`);
  }
});

console.log("");
if (fallos > 0) {
  console.error(`✗ ${fallos} de ${corridos} casos fallaron`);
  process.exit(1);
}
console.log(`✓ grupo — ${corridos} casos`);
