#!/usr/bin/env node
// Auditor determinista — ningún archivo duplicado de sincronización en el código
//
// Hace cumplir: CLAUDE.md § Git regla 1 («nombra cada archivo borrado»), y el
// commit `ae73db1`, donde 193 de estos rompieron tres auditores y el build.
//
// ─── Qué es un «duplicado de sincronización» ──────────────────────────────
//
// `wrangler 2.jsonc`, `robots 2.txt`, `jugar 2.ts`: el nombre original con un
// espacio y un número antes de la extensión. No los escribe nadie. Los fabrica
// iCloud Drive cuando dos escritores tocan el mismo archivo y el servicio no
// puede decidir cuál gana: guarda la versión perdedora al lado, con el mismo
// contenido o con uno anterior, en modo 600 y sin los xattr del original.
//
// Este repo vive en `~/Documents`, que en esta máquina está bajo iCloud Drive
// («Escritorio y Documentos»). Se confirmó leyendo el sistema, no suponiendo:
//
//     xattr ~/Documents
//       → com.apple.file-provider-domain-id:
//         com.apple.CloudDocs.iCloudDriveFileProvider/971E3542-…
//
//     brctl status | grep "Under /Documents/dev/math-challenge"
//       → …/.git  up:needs-upload  ct{… losers:{69b5u, 64d96} …}
//
// `losers` es la palabra que usa el propio servicio para las versiones que
// pierden un conflicto — es decir, exactamente estos archivos, y estaban dentro
// de este repositorio. Aparecen y desaparecen solos según drena la cola de
// sincronización: durante esta investigación se contaron 8, después 15, y
// después 0 sin que nadie borrara nada.
//
// ─── Por qué esto BLOQUEA en unas carpetas y en otras no ──────────────────
//
// En `dist/` o `.wrangler/` un duplicado es basura de compilación: molesta,
// pero se borra sola en el siguiente `rm -rf dist`. En el CÓDIGO no:
//
//   · `apps/web/src/pages/api/jugar 2.ts` es, para el enrutador de Astro, la
//     ruta `/api/jugar 2` — un endpoint fantasma desplegado a producción, con
//     una copia vieja de la lógica detrás.
//   · `audits/live 2.mjs` es un auditor que nadie corre y que se queda con la
//     versión de ayer de una regla.
//   · `wrangler 2.jsonc` en la raíz es una configuración de despliegue de más,
//     a un paso de que alguien la edite creyendo que es la buena.
//
// Por eso las cuatro zonas vigiladas son la raíz, `apps/web/src/`, `packages/`
// y `audits/`: donde un archivo fantasma se convierte en producto.
//
// ─── LO QUE ESTE AUDITOR NO HACE ──────────────────────────────────────────
//
//  · NO impide que se creen. La causa está fuera del repositorio (el servicio
//    de sincronización del sistema operativo); lo único que se puede hacer
//    desde aquí es que no lleguen a un commit ni a un despliegue.
//  · NO mira `dist/`, `.astro/`, `.wrangler/` ni `node_modules/` — ahí son
//    basura de compilación, y hacer fallar un commit por ellos sería el ruido
//    que apaga a un auditor.
//  · NO mira `.githooks/`. Un `pre-commit 2` también aparece, pero git ejecuta
//    el nombre exacto del gancho, así que la copia no corre nunca y no cambia
//    el comportamiento de nadie.
//  · NO distingue un duplicado de sincronización de un archivo que alguien
//    llamó así a propósito. En estas cuatro carpetas nadie debería.

import { execFileSync } from "node:child_process";
import { informar, RAIZ } from "./lib/repo.mjs";

/**
 * Las cuatro zonas donde un archivo fantasma es producto, no basura.
 *
 * La raíz se comprueba con «sin ninguna barra en la ruta», que es lo que la
 * hace la raíz.
 */
const ZONAS = [
  ["la raíz del repositorio", (f) => !f.includes("/")],
  ["apps/web/src/", (f) => f.startsWith("apps/web/src/")],
  ["packages/", (f) => f.startsWith("packages/")],
  ["audits/", (f) => f.startsWith("audits/")],
];

/**
 * El nombre de un duplicado, en las formas que fabrican los servicios de
 * sincronización y el Finder.
 *
 *   `wrangler 2.jsonc`   → espacio, número, extensión
 *   `pre-commit 2`       → espacio y número, sin extensión
 *   `tokens copy.css`    → el Finder en inglés
 *   `tokens copia.css`   → el Finder en español
 *
 * El número va anclado al final del nombre BASE, no en cualquier sitio: un
 * archivo legítimo como `mc-47 §5.md` no lleva un número suelto ahí, y
 * `2026-08-02-mc-50-algo.md` no tiene espacios.
 */
const DUPLICADO = /(?: \d+| cop(?:y|ia)(?: \d+)?)(?:\.[^./]+)?$/;

const problemas = [];
let revisados = 0;

/*
 * `git ls-files --cached --others --exclude-standard` es la lista correcta:
 * lo rastreado MÁS lo nuevo sin rastrear, MENOS lo ignorado. Los tres trozos
 * importan aquí — un duplicado recién aparecido nunca está rastreado (es el
 * caso normal), y `dist/` sale solo por estar en `.gitignore`.
 *
 * No se usa `archivos()` de `lib/repo.mjs` porque ese ayudante filtra
 * `audits/` para que un auditor no se encuentre a sí mismo. Aquí `audits/` es
 * una de las cuatro zonas vigiladas, y este auditor mira NOMBRES de archivo,
 * no su contenido: no puede autodenunciarse leyendo su propia cadena.
 */
const listados = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { cwd: RAIZ, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
)
  .split("\0")
  .filter(Boolean);

for (const archivo of listados) {
  const zona = ZONAS.find(([, dentro]) => dentro(archivo));
  if (!zona) continue;
  revisados++;

  const base = archivo.slice(archivo.lastIndexOf("/") + 1);
  if (!DUPLICADO.test(base)) continue;

  problemas.push(
    `«${archivo}» es un duplicado de sincronización en ${zona[0]}. Bórralo: no lo escribió nadie, ` +
      "lo fabrica iCloud Drive al resolver un conflicto sobre este repositorio, y aquí no es basura " +
      "de compilación — es una ruta, un componente o un auditor fantasma con una copia vieja detrás.",
  );
}

informar({
  nombre: "archivos-duplicados",
  problemas,
  cita: "CLAUDE.md § Git regla 1, commit ae73db1",
  revisados,
  resumen: `${revisados} archivos en la raíz, apps/web/src/, packages/ y audits/ — ningún duplicado`,
  porQueBloquea:
    "`apps/web/src/pages/api/jugar 2.ts` sería la ruta `/api/jugar 2` en producción, sirviendo una " +
    "copia vieja de la lógica. En `ae73db1` 193 de estos rompieron tres auditores y el build.",
  noComprueba: [
    "no puede impedir que aparezcan — la causa es el servicio de sincronización del sistema, fuera del repo",
    "no mira dist/, .astro/, .wrangler/ ni node_modules/: ahí son basura de compilación y se van con `rm -rf`",
    "no mira .githooks/: git ejecuta el nombre exacto del gancho, así que una copia no corre nunca",
  ],
});
