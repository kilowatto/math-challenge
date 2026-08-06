# F11 — verificación preliminar de accesibilidad y plataformas

Fecha: 2026-08-06  
Estado: evidencia automatizada recopilada; revisión humana pendiente

## Accesibilidad automatizada

| Comprobación | Resultado | Alcance y límite |
|---|---:|---|
| `node audits/axe-a11y.mjs` | PASS | 436 páginas, 59 reglas, 76.304 nodos; no calcula layout, contraste compuesto, foco ni lectores de pantalla |
| `node audits/contrast.mjs` | PASS | 48 pares en 3 temas; mínimo 3,03:1; no sustituye contraste compuesto en cada pantalla |
| `node audits/touch-targets.mjs` | PASS | 165 blancos táctiles y 19 casos sintéticos; no mide espaciado real entre vecinos ni estados JS |
| `node audits/ipad-usabilidad.mjs` | PASS | safe areas, orientación y Split View declarados; no mide overflow, foco ni tabulación |

## Contenido LOGI

- 9 retos N4–N12, rama MSC `03`, validados con `banco-logi.prueba.mjs`.
- 7 locales con claves de enunciado, figuras, opciones, causas y razón alternativa.
- `audits/banco-logi-i18n.mjs` y `audits/piso-seis-retos.mjs` pasan.
- Los 9 ítems están sembrados en D1 producción: N4–N7 en `PRIMARIA`; N8–N12 en `SERIO`.
- Falta revisión humana de contenido por locale antes de cerrar #438.

## Matriz de plataformas

| Superficie | Evidencia automatizada disponible | Evidencia humana requerida |
|---|---|---|
| Desktop Chrome/Safari | HTML, axe, contraste y touch-targets | teclado, foco visible, zoom 200 %, flujo completo |
| Android | ninguna instancia local instalada | Android gama baja, TalkBack, teclado, 320 px, gestos |
| iPhone | ninguna instancia local instalada | VoiceOver, Safari, audio, safe areas, teclado |
| iPad Split View | CSS/manifest auditados | ancho a un tercio, overflow, foco y rotación |
| Windows | ninguna instancia local instalada | Edge, teclado, zoom, lector de pantalla |

## Criterio de cierre

Este documento no afirma que #426 o #430 estén cerrados. La automatización cubre
la fracción medible; el cierre exige adjuntar el recorrido por pantalla y la
matriz de dispositivo real, además de resolver cualquier hallazgo de la flota
adversarial completa.
