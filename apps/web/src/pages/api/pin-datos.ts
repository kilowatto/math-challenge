/**
 * `GET /api/pin-datos?p=<childId>` — lo que `PinScene` necesita para pintarse
 * (D-201).
 *
 * ─── Por qué este endpoint tiene que existir ───────────────────────────────
 *
 * La rejilla de nueve dibujos **no se puede derivar en el cliente**:
 * `rejillaDe()` recibe `PIN_PAD_SECRET`, que va con `wrangler secret put` y
 * nunca sale del servidor. Hasta D-201 la única forma de obtenerla era el
 * frontmatter de `kids/pin.astro` — o sea, servir la pantalla entera como
 * HTML. Al borrar esa página (D-201) la escena de Phaser necesita un canal, y
 * este es ese canal: **solo los datos**, nunca marcado.
 *
 * Reconstruir la derivación en el cliente exigiría exponer el secreto o
 * duplicar una pieza de criptografía fuera del servidor. Ninguna de las dos es
 * aceptable, y las dos estaban ya descartadas por escrito en
 * `PerfilAjustesScene.ts` y en `perfil-pin.astro` antes de que existiera esta
 * ruta.
 *
 * ─── Qué NO devuelve ───────────────────────────────────────────────────────
 *
 * El `pin_hash` no sale de aquí, ni entero ni en trozos. Lo único que se dice
 * del PIN guardado es **si existe** (`yaTienePin`), que es lo que decide si la
 * escena abre en modo «entrar» o en modo «elegir». Y `dibujos` viene vacío
 * para un perfil numérico: el teclado de diez dígitos no se deriva de nada.
 */
import type { APIRoute } from "astro";
import { accesoAlPin, json, localeSeguro, tipoDePin, type Env } from "../../lib/pin-acceso.ts";
import { rejillaDe } from "../../../../../packages/motor/src/pin-imagenes.ts";
import { animalElegido, claveDeAnimal } from "../../lib/avatares-animal.ts";
import { rutaMapaKids } from "../../lib/mapa-kids.ts";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals, url }) => {
  const env = (locals as any).runtime?.env as Env | undefined;
  const acceso = await accesoAlPin(env, request, url.searchParams.get("p") ?? "");
  if ("respuesta" in acceso) return acceso.respuesta;

  const { perfil, secreto } = acceso;
  const tipo = tipoDePin(perfil);

  // Solo la rama de imágenes deriva algo. Nueve de los veinticuatro, siempre
  // los mismos para este niño y distintos de los de su hermano.
  const dibujos = tipo === "imagenes" ? await rejillaDe(secreto, perfil.id) : [];

  // El idioma sale del PERFIL, no de la URL ni del navegador: en una tablet
  // compartida `Accept-Language` diría el idioma de la casa, que no siempre es
  // el del niño.
  const locale = localeSeguro(perfil.locale);

  // El animal es opcional (D-194 lo dejó así), y un cuadro vacío se vería como
  // un hueco y no como una elección pendiente: sin animal, sin cuadro.
  const animal = animalElegido(perfil.avatar_parts, perfil.theme_band);

  return json({
    ok: true,
    tipo,
    dibujos,
    alias: perfil.alias,
    banda: perfil.theme_band,
    locale,
    avatarUrl: animal ? `/avatares/${claveDeAnimal(animal)}.webp` : null,
    yaTienePin: perfil.pin_hash !== null,
    // A dónde va el niño cuando entra: su casa dentro de la aplicación. El
    // mapa decide él solo, por banda real, si eso es la Sabana de KINDER o el
    // menú de PRIMARIA/SECUNDARIA (D-184/D-190).
    destino: rutaMapaKids(locale),
  });
};
