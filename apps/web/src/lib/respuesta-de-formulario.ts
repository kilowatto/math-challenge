/**
 * Qué contesta un endpoint según **quién** le preguntó.
 *
 * ─── El bug que este archivo existe para no repetir ────────────────────────
 *
 * El dueño creó una cuenta en su teléfono y la pantalla le enseñó esto:
 *
 *     {"ok":true}
 *
 * Y nada más. Sin botón, sin siguiente paso, sin manera de volver. El registro
 * había funcionado —la cuenta se creó, la sesión se abrió— y aun así el producto
 * estaba roto, porque **el formulario es un `<form method="post">` de HTML y el
 * endpoint contestaba JSON**. El navegador hace lo que se le pide: pinta el
 * cuerpo de la respuesta.
 *
 * No lo atrapó ninguna prueba ni ningún auditor, y no es casualidad: todas las
 * pruebas llamaban al endpoint con `fetch` y JSON, que es el camino que sí
 * funcionaba. La forma de falla es la costura entre dos piezas correctas.
 *
 * ─── La regla ──────────────────────────────────────────────────────────────
 *
 * **Si preguntó un formulario, se responde con una redirección 303.** Si
 * preguntó `fetch`, se responde JSON. El signo es el `content-type` de la
 * petición, que es el mismo por el que estos endpoints ya deciden cómo leer el
 * cuerpo — así que no hay una segunda fuente de verdad que se pueda desincronizar.
 *
 * **303 y no 302**: obliga al navegador a hacer GET sobre el destino. Con 302
 * algunos repiten el POST, y repetir el POST de un registro es crear la cuenta
 * dos veces.
 *
 * ─── Los errores también redirigen ─────────────────────────────────────────
 *
 * Un `{"ok":false,"motivo":"credenciales"}` en pantalla completa es el mismo bug
 * con peor cara: la persona escribió mal su contraseña y el producto le contesta
 * con un objeto. Vuelve al formulario con `?e=<motivo>`, y la página lo pinta.
 *
 * El motivo viaja en la URL y por eso **nunca puede llevar dato personal**: ni el
 * correo, ni lo que se escribió. Son claves cortas de un conjunto cerrado
 * (`credenciales`, `reintenta`, `demasiados_intentos`), y eso es también lo que
 * impide que alguien construya un enlace con un mensaje inventado.
 */

/** ¿Vino de un `<form>` de HTML y no de `fetch`? */
export function esEnvioDeFormulario(request: Request): boolean {
  const tipo = request.headers.get("content-type") ?? "";
  return (
    tipo.includes("application/x-www-form-urlencoded") || tipo.includes("multipart/form-data")
  );
}

/**
 * La respuesta buena: redirección para un formulario, JSON para `fetch`.
 *
 * `cookies` se adjunta en los dos casos. Una redirección que pierde el
 * `set-cookie` deja a la persona autenticada sin sesión, que es un fallo peor
 * que el que se está arreglando — por eso las cabeceras se arman a mano y no con
 * `Response.redirect`, que **descarta** las que se le pasan.
 */
export function terminarBien(
  request: Request,
  destino: string,
  cookies: string[] = [],
  datos: Record<string, unknown> = { ok: true },
): Response {
  const h = new Headers();
  for (const c of cookies) h.append("set-cookie", c);

  if (esEnvioDeFormulario(request)) {
    h.set("location", destino);
    // Sin cuerpo: un 303 con JSON dentro es el bug otra vez, esperando a que
    // alguien mire la respuesta con las herramientas de desarrollo.
    return new Response(null, { status: 303, headers: h });
  }

  h.set("content-type", "application/json; charset=utf-8");
  // `destino` viaja también en el JSON para que el cliente con JS sepa a dónde
  // ir sin tener que repetir la ruta — un literal en dos sitios es un literal
  // que un día cambia en uno.
  return new Response(JSON.stringify({ ...datos, destino }), { status: 200, headers: h });
}

/**
 * El error: de vuelta al formulario con la clave del motivo, o JSON.
 *
 * `volverA` es la página del formulario, no el endpoint. Mandar a alguien de
 * vuelta al endpoint le enseñaría un 405.
 */
export function terminarMal(
  request: Request,
  volverA: string,
  motivo: string,
  estado = 400,
): Response {
  if (esEnvioDeFormulario(request)) {
    // ─── Solo la RAÍZ del motivo entra a la URL ─────────────────────────────
    //
    // Los motivos llevan sufijo tras `:` para la bitácora
    // (`turnstile:sin_token`, `clave_fuera_de_rango:8-64`). Ese sufijo no le
    // sirve a nadie que esté mirando la pantalla, así que se corta aquí y a la
    // URL va `turnstile` a secas.
    //
    // La primera versión limpiaba a `[a-z_]` SIN cortar antes, y el resultado
    // fue `?e=turnstilesin_token` — una clave que no está en ninguna tabla, así
    // que la página caía al mensaje genérico y el motivo real se perdía.
    // Se vio en la primera petición contra producción.
    const clave = motivo.split(":")[0].replace(/[^a-z_]/gi, "").slice(0, 40);
    const separador = volverA.includes("?") ? "&" : "?";
    return new Response(null, {
      status: 303,
      headers: { location: `${volverA}${separador}e=${clave}` },
    });
  }
  return new Response(JSON.stringify({ ok: false, motivo }), {
    status: estado,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
