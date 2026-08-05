#!/usr/bin/env node
// Auditor determinista — las rutas de la app se arman con `rutas-app.ts`
//
// Hace cumplir: el bug reportado por el dueño el 2026-08-04 en producción —
// tocar la cara de un niño en `/app/kids/` llevaba a `/app/kids/pin?p=…`
// escrito a mano, SIN el segmento de locale, y cualquier ruta sin locale
// devuelve 404. Ningún niño podía entrar a jugar, en ninguna banda. El mismo
// literal roto estaba en el `action` del formulario del PIN.
//
// Por qué existe: las dos pantallas se VEÍAN perfectas. La rejilla pintaba,
// el PIN pintaba, y sus enlaces morían al tocarse — y ninguna prueba los
// siguió, porque el camino completo exige dispositivo marcado + perfil
// sembrado. `lib/rutas-app.ts` existe justamente para que estas URL tengan
// un solo autor; un literal `/app/…` escrito a mano en cualquier otro
// archivo es exactamente la forma de este bug.
//
// Qué comprueba: en código de producto (sin comentarios), ningún literal de
// cadena que empiece con `/app/` fuera de `lib/rutas-app.ts`. Las rutas de
// API (`/api/…`) no llevan locale y NO se flaguean.
//
// LO QUE NO PUEDE COMPROBAR: URLs armadas por concatenación de partes
// (`"/" + "app/" + …`). Nadie escribe eso por accidente; el bug real fue un
// literal completo, y es lo que este auditor vigila.

import { archivos, leer, sinComentarios, informar } from "./lib/repo.mjs";

const problems = [];
let revisados = 0;

for (const archivo of archivos(/^apps\/web\/src\/.*\.(astro|ts|mjs)$/)) {
  if (archivo.endsWith("lib/rutas-app.ts")) continue;
  const limpio = sinComentarios(leer(archivo));
  revisados++;
  const coincidencias = limpio.match(/["'`]\/app(\/|["'`?])/g) ?? [];
  for (const c of coincidencias) {
    problems.push(
      `${archivo}: literal ${c}… escrito a mano — las rutas de la app salen de ` +
        `lib/rutas-app.ts (rutaCasa, rutaKids, rutaPin, rutaJugar, …), que ponen ` +
        `el locale delante. Sin locale la ruta es un 404, y la pantalla que lo ` +
        `enlaza se ve perfecta (bug del 2026-08-04, encontrado por el dueño).`,
    );
  }
}

informar({
  nombre: "rutas-app-con-locale",
  problemas: problems,
  revisados,
  resumen: `${revisados} archivos de producto sin literales /app/ a mano`,
  cita: "bug 2026-08-04 (kids → pin 404), D-012",
  porQueBloquea:
    "Una ruta de la app sin segmento de locale es un 404 garantizado, y la página " +
    "que lo enlaza se ve correcta — el defecto solo aparece cuando un niño toca. " +
    "El helper de rutas existe para que esto no se escriba a mano nunca.",
});
