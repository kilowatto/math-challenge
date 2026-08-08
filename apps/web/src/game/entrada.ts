/**
 * entrada.ts — el punto de entrada del `<script src>` de Modo Historia.
 *
 * Separado de `main.ts` a propósito: `main.ts` exporta `iniciarHistoria()`
 * como función pura (fácil de importar desde una prueba); este archivo es el
 * único que se EJECUTA al cargar, leyendo el data island del DOM. Un
 * `<script type="module" src="...">` con una ruta en disco (no una URL) es
 * lo que Astro/Vite bundlea de verdad — ver el encabezado de
 * `HistoriaMount.astro` para el porqué del cambio.
 */
import { iniciarHistoria } from "./main";

const datosCrudos = document.getElementById("historia-datos")?.textContent ?? "{}";
iniciarHistoria("historia-mount", JSON.parse(datosCrudos));
