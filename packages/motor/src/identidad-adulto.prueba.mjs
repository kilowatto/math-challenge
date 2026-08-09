// Casos del filtro de nombre/@usuario del adulto (D-197).

import {
  normalizarParaFiltro,
  contieneBloqueado,
  validarUsername,
  validarDisplayName,
} from "./identidad-adulto.ts";

let fallos = 0;
const ok = (cond, nombre) => {
  console.log(`  ${cond ? "✓" : "✗"} ${nombre}`);
  if (!cond) fallos++;
};

console.log("identidad-adulto — nombre/@usuario del adulto, D-197\n");

// --- normalización, misma técnica que alias.ts -----------------------------
ok(normalizarParaFiltro("Pató-LOCO ") === "patoloco", "normaliza acentos, signos, espacios y mayúsculas");

// --- lista de bloqueo, con y sin acento/mayúscula/guion ---------------------
ok(contieneBloqueado("pendejo123"), "bloquea una palabra de la lista");
ok(contieneBloqueado("PENDEJO123"), "sin importar mayúsculas");
ok(contieneBloqueado("p-e-n-d-e-j-o"), "ni guiones intercalados");
ok(contieneBloqueado("larry_oficial"), "bloquea suplantación de la mascota");
ok(!contieneBloqueado("kilowatto"), "\"kilowatto\" NO se bloquea: es la marca real del dueño, no una suplantación");
ok(!contieneBloqueado("esteban"), "un nombre común no bloqueado pasa limpio");

// --- username: formato --------------------------------------------------
ok(validarUsername("kilowatto").valido, "\"kilowatto\" es formato válido");
ok(!validarUsername("").valido, "vacío no es válido");
ok(validarUsername("").razon === "vacio", "  razón: vacio");
ok(!validarUsername("ab").valido, "menos de 3 caracteres no es válido");
ok(!validarUsername("Kilowatto").valido, "mayúsculas no son válidas en el username");
ok(!validarUsername("1kilowatto").valido, "no puede empezar con un dígito");
ok(!validarUsername("kilo__watto").valido, "guiones bajos consecutivos no son válidos");
ok(validarUsername("kilo_watto_99").valido, "un guion bajo simple + dígitos es válido");
ok(validarUsername("k".repeat(20)).valido, "20 caracteres es el máximo permitido");
ok(!validarUsername("k".repeat(21)).valido, "21 caracteres ya no es válido");

// --- username: bloqueo ------------------------------------------------------
ok(!validarUsername("admin").valido, "\"admin\" se bloquea (suplantación)");
ok(validarUsername("admin").razon === "bloqueado", "  razón: bloqueado");
ok(!validarUsername("puta123").valido, "una grosería se bloquea");

// --- display_name: menos restringido en formato, mismo filtro --------------
ok(validarDisplayName("Esteban Rey").valido, "un nombre real con espacio y mayúsculas es válido");
ok(validarDisplayName("Núñez").valido, "acentos/eñes son válidos en el nombre");
ok(!validarDisplayName("   ").valido, "solo espacios cuenta como vacío");
ok(!validarDisplayName("a".repeat(41)).valido, "más de 40 caracteres no es válido");
ok(validarDisplayName("a".repeat(40)).valido, "40 caracteres es el máximo permitido");
ok(!validarDisplayName("Admin Oficial").valido, "el filtro de bloqueo también aplica al nombre para mostrar");

console.log(fallos === 0 ? "\n✓ identidad-adulto — todos los casos" : `\n✗ identidad-adulto — ${fallos} caso(s) fallaron`);
process.exit(fallos === 0 ? 0 : 1);
