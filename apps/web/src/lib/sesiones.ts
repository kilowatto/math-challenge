/**
 * Las tres cookies opacas. Criterio #113 de F2, D-052, D-012, `mc-25` impl. 6.
 *
 * ─── Ninguna lleva nada adentro, y eso es el contrato ───────────────────────
 *
 * Las tres son **256 bits aleatorios en base64url**. No un JWT, no un JSON
 * firmado, no un id de usuario cifrado: un token que **indexa** y nada más. Si
 * alguien lee la cookie no aprende quién es el usuario, qué plan tiene, ni
 * cuántos hijos hay en la cuenta — porque no está ahí.
 *
 * `mc-25` impl. 6 prohíbe el perfilado de menores, y esa prohibición es mucho
 * más fácil de sostener cuando **no existe un payload que perfilar**. Un JWT con
 * `child_id` dentro viaja a cada petición, se queda en registros, en cachés y en
 * la barra de herramientas de cualquiera que abra el inspector en la tablet de
 * la sala.
 *
 * ─── Dónde respalda cada una, y por qué no es la misma respuesta ────────────
 *
 *   mc_s   el adulto                 KV    30 días
 *   mc_h   el dispositivo del hogar  D1    400 días   → household_devices
 *   mc_k   el perfil de niño activo  KV    12 horas
 *
 * `mc_h` va a **D1 y no a KV** (D-052) porque `household_devices` ya es una
 * tabla de D1 cuya llave primaria es `device_token`: el dispositivo del hogar no
 * es un dato efímero de alta escritura como una sesión, es un hecho que el
 * adulto declaró una vez y revoca a mano cuando presta o pierde el aparato. Un
 * TTL de KV lo borraría solo, en silencio, y `/app/kids` dejaría de enseñar
 * caras sin que nadie hubiera revocado nada.
 *
 * El comentario final de `0003_accounts_onboarding.sql` decía lo contrario —
 * `mc_d`, y las tres en KV. Estaba mal y lo escribí yo; D-052 lo corrige.
 *
 * ─── 400 días no es un capricho ────────────────────────────────────────────
 *
 * Es el techo. Chrome recorta a 400 días la vida de cualquier cookie desde 2022
 * (RFC 6265bis §4.1.2.2), así que pedir más es pedir 400. Se pide exactamente el
 * techo porque el caso real es la tablet de la casa que nadie vuelve a tocar
 * durante meses de vacaciones, y volver a marcarla es fricción sobre el adulto.
 *
 * Safari/ITP recorta a 7 días las cookies puestas **por JavaScript** vía
 * `document.cookie`. Las tres se ponen con `Set-Cookie` desde el servidor y son
 * `HttpOnly`, así que ese recorte no les aplica. Esa es una de las razones de que
 * sean HttpOnly, además de la obvia.
 */

/** Nombres. En un solo sitio: un nombre escrito dos veces se separa una vez. */
export const COOKIE_ADULTO = "mc_s";
/**
 * La PISTA de sesión. Issue #339.
 *
 * Es la única cookie de este archivo que **no** es `HttpOnly`, y eso es el
 * punto entero: un script tiene que poder leerla.
 *
 * ─── Por qué hace falta ────────────────────────────────────────────────────
 *
 * El dueño llegó a `/es-MX/entrar/` con sesión válida y el sitio le pidió la
 * contraseña como a un desconocido. La causa no es un `if` que falte: esa
 * página está **prerenderizada** (`output: "static"`), o sea que es un archivo
 * HTML escrito en el build, y un archivo no puede leer una cookie porque cuando
 * se generó no había ninguna petición. Es la misma trampa que ya costó tres
 * bugs aquí — `searchParams` vacío, `request.headers` de nadie, la plataforma
 * saliendo siempre `otro`.
 *
 * Las salidas eran tres: hacer la página SSR (y perder el caché de borde en las
 * 7 portadas de entrada), mirar la cookie en el Worker (que **no corre** para
 * una ruta prerenderizada: el enrutador de assets la sirve antes, cosa que este
 * repo aprendió rompiendo el login entero), o esta.
 *
 * ─── Qué contiene, y por qué no es un riesgo ───────────────────────────────
 *
 * Un `1`. Nada más. No es un token, no identifica a nadie, no sirve para
 * autenticar y el servidor **jamás la lee** — quien la falsifique en su propio
 * navegador consigue exactamente una cosa: que le redirijan a una página que
 * le va a pedir sesión y no se la va a dar. `mc_s` sigue siendo `HttpOnly` y
 * sigue siendo la única que decide algo.
 *
 * Viven y mueren juntas: se ponen en la misma respuesta y se borran en la misma
 * respuesta. Por eso `abrirSesionAdulto` devuelve un ARRAY de cookies y no una:
 * con dos valores sueltos, el día que alguien añada una cuarta puerta de
 * entrada se acordaría de la sesión y se olvidaría de la pista, y el síntoma
 * sería este mismo bug otra vez, solo en esa puerta.
 */
export const COOKIE_PISTA = "mc_p";
export const COOKIE_HOGAR = "mc_h";
export const COOKIE_NINO = "mc_k";

export const VIDA_ADULTO_S = 30 * 24 * 60 * 60; // 30 días
export const VIDA_HOGAR_S = 400 * 24 * 60 * 60; // 400 días — el techo de Chrome
export const VIDA_NINO_S = 12 * 60 * 60; // 12 horas

/** 32 bytes = 256 bits. Suficiente para que adivinar no sea una estrategia. */
const BYTES_TOKEN = 32;

/**
 * base64url sin relleno: `A-Z a-z 0-9 - _`.
 *
 * Sin `+`, `/` ni `=`, que son los tres caracteres que obligan a escapar una
 * cookie y que producen bugs de comparación cuando alguien decodifica de más.
 */
function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Un token opaco nuevo. 256 bits del CSPRNG del runtime, nada más. */
export function nuevoToken(): string {
  return base64url(crypto.getRandomValues(new Uint8Array(BYTES_TOKEN)));
}

/**
 * Cómo es un token nuestro. 43 caracteres es lo que dan 32 bytes en base64url
 * sin relleno (ceil(32 * 4 / 3) = 43).
 *
 * Se exporta porque el auditor de opacidad lo necesita: comprobar que una cookie
 * es opaca no se puede hacer «mirando si parece aleatoria» —un JWT también lo
 * parece— sino comprobando que **coincide exactamente con la forma que emitimos**
 * y nada más. Cualquier cosa más larga, o con un punto adentro, no es un token
 * nuestro.
 */
export const FORMA_TOKEN = /^[A-Za-z0-9_-]{43}$/;

export function esTokenOpaco(valor: string): boolean {
  return FORMA_TOKEN.test(valor);
}

export interface OpcionesCookie {
  /** Segundos de vida. */
  maxAge: number;
  /** Ruta. Por defecto la raíz: las tres viajan a todo el sitio. */
  path?: string;
  /**
   * Omitir `HttpOnly`. **Solo `mc_p`.**
   *
   * Se pide explícitamente y no se deduce del nombre para que quede en el sitio
   * de la llamada, a la vista de quien lea el código y de quien lo revise.
   */
  legiblePorJs?: boolean;
}

/**
 * Construye el `Set-Cookie`.
 *
 * Los tres atributos no son negociables y van escritos aquí y no en cada sitio
 * que ponga una cookie:
 *
 *  · `HttpOnly` — JavaScript no la lee. Quita de un golpe el robo por XSS y, de
 *    paso, esquiva el recorte de 7 días de ITP.
 *  · `Secure` — solo por HTTPS. El sitio es HTTPS entero; sin esto, un enlace
 *    `http://` la filtraría en claro una vez antes de redirigir.
 *  · `SameSite=Lax` — no viaja en peticiones de otro sitio salvo navegación de
 *    nivel superior. `Strict` rompería el caso de que el adulto abra el enlace
 *    de bienvenida desde su correo y llegue sin sesión.
 */
export function armarCookie(nombre: string, valor: string, o: OpcionesCookie): string {
  const partes = [
    `${nombre}=${valor}`,
    `Path=${o.path ?? "/"}`,
    `Max-Age=${o.maxAge}`,
    // La ÚNICA que se salta esto es `mc_p`, que no lleva secreto y existe
    // justamente para que un script la lea (ver COOKIE_PISTA). Se pide
    // explícitamente con `legibleporJs`, así que nunca se omite por descuido.
    ...(o.legiblePorJs ? [] : ["HttpOnly"]),
    "Secure",
    "SameSite=Lax",
  ];
  return partes.join("; ");
}

/** Borra una cookie. `Max-Age=0` y valor vacío, con los mismos atributos. */
export function borrarCookie(nombre: string, path = "/"): string {
  const httpOnly = nombre === COOKIE_PISTA ? "" : "HttpOnly; ";
  return `${nombre}=; Path=${path}; Max-Age=0; ${httpOnly}Secure; SameSite=Lax`;
}

/**
 * Lee las cookies de una petición.
 *
 * Se parte por `;` y se corta en el PRIMER `=`, no en todos: un valor base64url
 * no lleva `=`, pero una cookie ajena del mismo dominio sí puede, y partirla mal
 * haría que una cookie de un tercero envenenara la lectura de la nuestra.
 */
export function leerCookies(cabecera: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cabecera) return out;
  for (const trozo of cabecera.split(";")) {
    const i = trozo.indexOf("=");
    if (i === -1) continue;
    const nombre = trozo.slice(0, i).trim();
    if (!nombre) continue;
    out[nombre] = trozo.slice(i + 1).trim();
  }
  return out;
}

// ---------------------------------------------------------------------------
// Las tres sesiones, cada una con su respaldo
// ---------------------------------------------------------------------------

/** Lo que KV guarda de la sesión de un adulto. Nunca viaja al navegador. */
export interface SesionAdulto {
  userId: string;
  creadaEn: number;
  /** Por qué puerta entró. Intención observada, no declarada (migración 0003). */
  intent: "PADRE" | "MAESTRO" | "ADULTO_APRENDE" | null;
}

/** Lo que KV guarda del perfil de niño activo. */
export interface SesionNino {
  childProfileId: string;
  /** El adulto cuya cuenta lo contiene. El niño nunca es un usuario (línea roja #2). */
  parentUserId: string;
  creadaEn: number;
}

export const llaveAdulto = (token: string) => `s:${token}`;
export const llaveNino = (token: string) => `k:${token}`;

/**
 * Abre la sesión del adulto. Devuelve la cookie ya armada.
 *
 * El token se genera aquí y **solo aquí** se conoce en claro; lo que se guarda
 * en KV está indexado por él. Rotar la sesión es emitir uno nuevo y borrar el
 * viejo, que es lo que hay que hacer al cambiar de contraseña.
 */
export async function abrirSesionAdulto(
  kv: KVNamespace,
  datos: SesionAdulto,
): Promise<{ token: string; cookies: string[] }> {
  const token = nuevoToken();
  await kv.put(llaveAdulto(token), JSON.stringify(datos), { expirationTtl: VIDA_ADULTO_S });
  // DOS cookies, siempre juntas y en la misma respuesta. Ver COOKIE_PISTA: el
  // array existe para que ninguna puerta de entrada pueda poner una y olvidar
  // la otra — un descuido cuyo síntoma sería que esa puerta, y solo esa, siga
  // pidiendo la contraseña a quien ya entró.
  return {
    token,
    cookies: [
      armarCookie(COOKIE_ADULTO, token, { maxAge: VIDA_ADULTO_S }),
      armarCookie(COOKIE_PISTA, "1", { maxAge: VIDA_ADULTO_S, legiblePorJs: true }),
    ],
  };
}

export async function leerSesionAdulto(
  kv: KVNamespace,
  token: string | undefined,
): Promise<SesionAdulto | null> {
  // Se comprueba la FORMA antes de tocar KV. Un valor que no tiene forma de
  // token nuestro no es una sesión expirada: es alguien probando, y no vale una
  // lectura de KV por intento.
  if (!token || !esTokenOpaco(token)) return null;
  const crudo = await kv.get(llaveAdulto(token));
  if (!crudo) return null;
  try {
    return JSON.parse(crudo) as SesionAdulto;
  } catch {
    return null;
  }
}

/**
 * Cierra la sesión del adulto.
 *
 * **Borrar en KV no la cierra al instante en todo el mundo.** KV es
 * eventualmente consistente y un borrado tarda en propagarse entre nodos del
 * borde; hasta que llega, otro nodo puede seguir sirviendo el valor viejo. Para
 * una sesión de adulto en un producto infantil eso es aceptable y hay que
 * decirlo, no esconderlo. El día que haga falta cierre inmediato —revocación
 * tras un robo de cuenta— el mecanismo no es KV: es una lista de revocación en
 * D1 consultada en la misma petición.
 */
export async function cerrarSesionAdulto(kv: KVNamespace, token: string | undefined): Promise<string[]> {
  if (token && esTokenOpaco(token)) await kv.delete(llaveAdulto(token));
  return [borrarCookie(COOKIE_ADULTO), borrarCookie(COOKIE_PISTA)];
}

/**
 * Marca este dispositivo como de la casa (D-012). Respalda en **D1**.
 *
 * El identificador es un token opaco que ponemos nosotros, **jamás una huella
 * del dispositivo**: una huella es biometría de comportamiento y la línea roja
 * #1 la prohíbe. El apodo lo escribe el ADULTO —«la tablet de la sala»—, nunca
 * un niño, así que no cruza la línea roja #3.
 */
export async function marcarDispositivoDelHogar(
  db: D1Database,
  ownerUserId: string,
  etiqueta: string,
  ahora: number,
): Promise<{ token: string; cookie: string }> {
  const token = nuevoToken();
  await db
    .prepare(
      "INSERT INTO household_devices (device_token, owner_user_id, label, approved_at) VALUES (?, ?, ?, ?)",
    )
    .bind(token, ownerUserId, etiqueta, ahora)
    .run();
  return { token, cookie: armarCookie(COOKIE_HOGAR, token, { maxAge: VIDA_HOGAR_S }) };
}

export interface DispositivoDelHogar {
  ownerUserId: string;
  etiqueta: string;
}

/**
 * ¿Es este un dispositivo de la casa, y de quién?
 *
 * El `WHERE revoked_at IS NULL` usa el índice parcial `idx_devices_activos` de
 * la migración 0003. Un dispositivo revocado no es un error: es alguien que
 * prestó la tablet y la desmarcó, y el resultado correcto es «no».
 */
export async function leerDispositivoDelHogar(
  db: D1Database,
  token: string | undefined,
): Promise<DispositivoDelHogar | null> {
  if (!token || !esTokenOpaco(token)) return null;
  const fila = await db
    .prepare(
      "SELECT owner_user_id, label FROM household_devices WHERE device_token = ? AND revoked_at IS NULL",
    )
    .bind(token)
    .first<{ owner_user_id: string; label: string }>();
  if (!fila) return null;
  return { ownerUserId: fila.owner_user_id, etiqueta: fila.label };
}

/**
 * Abre la sesión de un perfil de niño. 12 horas.
 *
 * **Doce horas y no treinta días, y el caso que lo decide son dos hermanos y una
 * tablet.** Si `mc_k` durara lo que `mc_s`, el segundo hermano heredaría el
 * perfil del primero al abrir la app por la mañana y practicaría sobre el
 * progreso de otro. Doce horas cubre una tarde entera de un niño y caduca antes
 * del día siguiente.
 *
 * Cambiar de perfil **sobrescribe** la cookie con un token nuevo y borra el
 * anterior de KV: no se acumulan sesiones de niño abiertas en un dispositivo.
 */
export async function abrirSesionNino(
  kv: KVNamespace,
  datos: SesionNino,
  tokenAnterior?: string,
): Promise<{ token: string; cookie: string }> {
  if (tokenAnterior && esTokenOpaco(tokenAnterior)) await kv.delete(llaveNino(tokenAnterior));
  const token = nuevoToken();
  await kv.put(llaveNino(token), JSON.stringify(datos), { expirationTtl: VIDA_NINO_S });
  return { token, cookie: armarCookie(COOKIE_NINO, token, { maxAge: VIDA_NINO_S }) };
}

export async function leerSesionNino(
  kv: KVNamespace,
  token: string | undefined,
): Promise<SesionNino | null> {
  if (!token || !esTokenOpaco(token)) return null;
  const crudo = await kv.get(llaveNino(token));
  if (!crudo) return null;
  try {
    return JSON.parse(crudo) as SesionNino;
  } catch {
    return null;
  }
}

/**
 * Cierra la sesión del adulto Y la del niño.
 *
 * Van juntas a propósito: si el adulto cierra sesión y el perfil del niño sigue
 * abierto, el dispositivo queda con una superficie de niño viva bajo una cuenta
 * que ya no está autenticada. Es el caso de la tablet que se presta.
 */
export function cerrarTodo(): string[] {
  return [borrarCookie(COOKIE_ADULTO), borrarCookie(COOKIE_PISTA), borrarCookie(COOKIE_NINO)];
}
