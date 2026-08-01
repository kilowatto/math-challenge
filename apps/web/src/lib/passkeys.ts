/**
 * El alcance de las passkeys. Criterio #112, issue #263, D-038.
 *
 * ─── UNA CONSTANTE, Y ES IRREVERSIBLE ──────────────────────────────────────
 *
 * `RP_ID` decide en qué orígenes funciona una passkey de este producto, y
 * **cambiarlo después invalida todas las que existan**. Quien lo toque deja
 * fuera de su propia cuenta a cada persona que ya tuviera una: no hay migración,
 * no hay aviso, la llave simplemente deja de ofrecerse.
 *
 * Por eso vive aquí sola, con su razón, y por eso hay un auditor
 * —`audits/passkey-rp-id.mjs`— que bloquea el commit si aparece cualquier otro
 * valor. Es un cambio de una palabra con consecuencia permanente, que es
 * exactamente lo que un guardián determinista debe vigilar.
 *
 * ─── Por qué el subdominio y no el dominio ─────────────────────────────────
 *
 * Verificado en `web.dev/articles/webauthn-related-origin-requests`:
 *
 *   · `rp.id = "kilowatto.com"`      → la passkey funciona en CUALQUIER
 *                                      subdominio de kilowatto.com
 *   · `rp.id = "math.kilowatto.com"` → funciona SOLO aquí
 *
 * El dueño lo vio en su teléfono: 1Password ofrecía «contraseña de
 * kilowatto.com» dentro de Math Challenge, porque los gestores agrupan por
 * dominio registrable y `math.kilowatto.com` y `kilowatto.com` lo son el mismo.
 *
 * Las contraseñas no se pueden separar —no existe estándar para pedirle a un
 * gestor que no ofrezca las del dominio padre—, pero **las passkeys sí**, y
 * son el camino principal por D-038. Así que se separan.
 *
 * ─── Si algún día hiciera falta compartirlas ───────────────────────────────
 *
 * Existe **Related Origin Requests**: un archivo en
 * `https://math.kilowatto.com/.well-known/webauthn` con
 * `{"origins": ["https://otro.dominio"]}`, servido como `application/json`.
 * Chrome y Safari lo soportan; Firefox lo está considerando.
 *
 * **Hoy no hace falta y no se pone.** Ese archivo es una puerta: cada origen que
 * se añada podrá usar las passkeys de este producto.
 */

/**
 * El Relying Party ID. **No se cambia sin leer el bloque de arriba entero.**
 *
 * Es un dominio, no una URL: sin esquema, sin puerto, sin barra final.
 */
export const RP_ID = "math.kilowatto.com";

/** El nombre que ve la persona en el diálogo de su sistema al crear la llave. */
export const RP_NAME = "Math Challenge";

/**
 * El origen que el navegador va a comprobar contra `RP_ID`.
 *
 * Tiene que ser un sufijo válido: el origen `https://math.kilowatto.com`
 * pertenece a `math.kilowatto.com`. Se exporta para que el servidor pueda
 * validar `clientDataJSON.origin` cuando la ceremonia exista — un origen que no
 * case es un intento de usar la llave desde otro sitio.
 */
export const ORIGEN_ESPERADO = `https://${RP_ID}`;

/**
 * ¿Es este origen aceptable para nuestras passkeys?
 *
 * Estricto a propósito: solo el origen exacto. No se acepta un subdominio de
 * `math.kilowatto.com` porque no existe ninguno, y aceptar los que pudieran
 * existir mañana sería abrir la puerta antes de que nadie la pida.
 */
export function origenValido(origen: string): boolean {
  return origen === ORIGEN_ESPERADO;
}
