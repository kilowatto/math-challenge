#!/usr/bin/env node
// Auditor determinista — el `rp.id` de las passkeys no se toca
//
// Hace cumplir: D-038, criterio #112, issue #263.
//
// Por qué existe, y por qué merece un auditor propio para UNA constante.
//
// `rp.id` decide en qué orígenes funciona una passkey. Cambiarlo **invalida
// todas las que existan**: no hay migración, no hay aviso, la llave deja de
// ofrecerse y la persona se queda fuera de su propia cuenta. Es un cambio de una
// palabra con consecuencia permanente y sin síntoma inmediato — nada falla al
// desplegar, y el daño aparece cuando alguien intenta entrar.
//
// El dueño encontró el problema que lo motiva mirando su teléfono: 1Password
// ofrecía «contraseña de kilowatto.com» dentro de math.kilowatto.com, porque los
// gestores agrupan por dominio registrable. Las contraseñas no se pueden separar
// —no hay estándar para pedirlo—, pero las passkeys sí, atándolas al subdominio.
//
// Lo que vigila:
//
//   1. `RP_ID` en `apps/web/src/lib/passkeys.ts` vale exactamente el subdominio.
//   2. Nadie escribe otro `rp.id`/`rpId` en el código de producto — ni siquiera
//      uno correcto: tiene que salir de la constante, o hay dos verdades.
//   3. No aparece `/.well-known/webauthn` sin que alguien lo declare por escrito.
//      Ese archivo abre las passkeys a otros orígenes; aparecer sin razón es
//      exactamente lo que no puede pasar en silencio.
//
// Lo que NO puede comprobar: que el servidor valide de verdad el origen de
// `clientDataJSON` cuando la ceremonia exista. Eso es lógica de ejecución.

import { archivos, leer, informar, SOLO_PRODUCTO, sinComentarios } from "./lib/repo.mjs";

const FUENTE = "apps/web/src/lib/passkeys.ts";
const ESPERADO = "math.kilowatto.com";

const problemas = [];
const notas = [];

// --- 1. La constante existe y vale lo que debe -----------------------------
const fuente = leer(FUENTE);
if (fuente === null) {
  // No es un fallo todavía: la ceremonia de passkey aún no está escrita. Pero
  // en cuanto exista el archivo, esto empieza a vigilar.
  notas.push(`todavía no existe ${FUENTE}; el auditor está listo para cuando la ceremonia se escriba (#112)`);
} else {
  const m = /export const RP_ID\s*=\s*["'`]([^"'`]+)["'`]/.exec(fuente);
  if (!m) {
    problemas.push(
      `${FUENTE}: no se encuentra \`export const RP_ID\`. Es la constante que decide en qué ` +
        `orígenes funciona una passkey, y tiene que estar en un solo sitio y con nombre.`,
    );
  } else if (m[1] !== ESPERADO) {
    problemas.push(
      `${FUENTE}: RP_ID vale "${m[1]}" y debe valer "${ESPERADO}" (issue #263). ` +
        `Con el dominio registrable, las passkeys de Math Challenge se ofrecerían en cualquier ` +
        `sitio de kilowatto.com y al revés. Y cambiar este valor INVALIDA todas las passkeys ` +
        `existentes: quien lo toque deja fuera de su cuenta a quien ya tuviera una.`,
    );
  } else {
    notas.push(`RP_ID = "${ESPERADO}" — las passkeys quedan atadas al subdominio (#263)`);
  }
}

// --- 2. Nadie escribe otro rp.id por su cuenta -----------------------------
//
// Se busca un literal de dominio asignado a `rp.id`/`rpId`/`id:` dentro de un
// objeto `rp`. Un valor correcto escrito a mano también se reporta: si hay dos
// sitios donde vive el dominio, se separan en el primer cambio.
const RP_LITERAL = [
  // `rp.id = "…"` y `rpId: "…"`
  /\brp(?:\.id|Id)\s*[:=]\s*["'`]([^"'`]+)["'`]/gi,
  // La forma REAL de WebAuthn, que es la que se escribe de verdad:
  //     rp: { id: "…", name: "…" }
  // El primer patrón no la cazaba, y un auditor que no caza su propio caso es
  // peor que no tenerlo: da verde y nadie vuelve a mirar.
  /\brp\s*:\s*\{[^}]*?\bid\s*:\s*["'`]([^"'`]+)["'`]/gis,
];

for (const archivo of archivos(/\.(ts|tsx|js|jsx|mjs|astro)$/).filter((f) => SOLO_PRODUCTO.test(f))) {
  if (archivo === FUENTE) continue;
  const texto = sinComentarios(leer(archivo) ?? "");
  for (const patron of RP_LITERAL) for (const m of texto.matchAll(patron)) {
    problemas.push(
      `${archivo}: escribe un rp.id literal ("${m[1]}"). Tiene que salir de \`RP_ID\` en ` +
        `${FUENTE}, aunque el valor sea el correcto: dos sitios con el mismo dominio se ` +
        `separan en el primer cambio, y el síntoma sería una passkey que deja de funcionar ` +
        `sin que nada falle al desplegar.`,
    );
  }
}

// --- 3. `/.well-known/webauthn` no aparece sin declararse ------------------
//
// Ese archivo permite que OTROS orígenes usen nuestras passkeys. Es una puerta,
// y una puerta que aparece sola es la definición de lo que no puede pasar.
const wellKnown = archivos(/\.well-known\/webauthn/).filter((f) => SOLO_PRODUCTO.test(f) || f.includes("public/"));
if (wellKnown.length > 0) {
  const declarado = (leer("docs/decisions.md") ?? "").includes("/.well-known/webauthn");
  if (!declarado) {
    problemas.push(
      `${wellKnown.join(", ")}: existe un /.well-known/webauthn y NO está declarado en ` +
        `docs/decisions.md. Ese archivo autoriza a otros orígenes a usar las passkeys de este ` +
        `producto (Related Origin Requests). Cada origen que liste es una puerta abierta, y ` +
        `abrir una sin escribir por qué es justo lo que #263 existe para impedir.`,
    );
  }
}

notas.push(
  "Las CONTRASEÑAS no se pueden separar del dominio padre: no existe estándar para pedirle a " +
    "un gestor que no ofrezca las de kilowatto.com aquí (investigado en #263). Lo que sí se " +
    "separa son las passkeys, que por D-038 son el camino principal.",
);
notas.push(
  "NO comprobado aquí: que el servidor valide clientDataJSON.origin cuando la ceremonia exista. " +
    "Eso es lógica de ejecución, no un literal en un archivo.",
);

informar({
  nombre: "passkey-rp-id",
  problemas,
  notas,
  resumen: fuente === null ? "la ceremonia de passkey todavía no existe" : `RP_ID vigilado en ${FUENTE}`,
  cita: "D-038, criterio #112, issue #263",
  porQueBloquea:
    "Cambiar el rp.id invalida todas las passkeys existentes, sin migración y sin aviso: nada " +
    "falla al desplegar y el daño aparece cuando alguien intenta entrar a su cuenta.",
});
