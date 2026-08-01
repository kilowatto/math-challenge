# Anulaciones de la flota adversarial

Este archivo es la regla 2 de [D-032](../../docs/decisions.md):

> **Anular a un auditor exige escribir por qué**, y esa razón queda en el
> historial.

El historial es git. Una anulación se escribe aquí y **se commitea en el mismo
PR que la necesita** — así queda fechada, firmada y junto al cambio que la
provocó. Una anulación que solo vive en la cabeza de quien la decidió no es una
anulación, es un olvido.

---

## Cómo se anula

Cuando `node audits/adversarial.mjs` bloquea un hallazgo con el que no estás de
acuerdo, el corredor imprime el encabezado exacto que hay que pegar. Tiene esta
forma:

```md
### `auditor` · `ruta/del/archivo` · `CITA` · AAAA-MM-DD · quién

Razón: por qué este hallazgo no detiene el trabajo.
```

Tres cosas que el parser exige, y por qué:

1. **La razón mínima son 20 caracteres.** Si se aceptara vacía, la regla 2 se
   cumpliría escribiendo un encabezado, y eso no es escribir por qué.
2. **La huella es `auditor · archivo · cita`, sin el texto del hallazgo.** El
   modelo lo redacta distinto cada corrida; una huella que cambia entre
   corridas dejaría de reconocer su propia anulación mañana.
3. **La anulación es puntual, no general.** Anula ese hallazgo, en ese archivo,
   por esa cita. Si el mismo auditor encuentra otra cosa en otro archivo, vuelve
   a bloquear — como debe.

## Cuándo NO se anula

Si el hallazgo cita una **línea roja** (`LR-1` … `LR-8`), la anulación no es una
decisión técnica: es cambiar el producto. CLAUDE.md lo dice sin margen — «si una
tarea pide cruzar una de estas, no la hagas: escribe el conflicto y pregunta».
Anular una línea roja aquí sin que el dueño la haya cambiado en `decisions.md`
es saltarse el proceso con papeleo.

---

## Anulaciones vigentes

### `pwa-android` · `apps/web/public/manifest.webmanifest` · `D-031` · 2026-07-31 · Esteban

Razón: falso positivo, comprobable con aritmética. El auditor asume que el arte
del ícono ocupa todo el lienzo y por eso se recortaría en un recorte maskable.
No es el caso: `scripts/gen-icons.mjs` dibuja el "+" con `arm = 0.44·size`
centrado, así que el glifo ocupa del 28% al 72% del lienzo — holgadamente dentro
del área segura del 80% que Android garantiza. El fondo naranja cubre el lienzo
entero **a propósito**, que es justo el diseño correcto para un maskable, y está
escrito en el comentario del generador. Compartir archivo entre `any` y
`maskable` es un olor válido en general y aquí no aplica.

Se revisará cuando entre el arte definitivo de Recraft: si ese arte no respeta
el área segura, esta anulación deja de valer y hay que borrarla.

## Anulaciones retiradas

### ~~`pwa-android` · `apps/web/src/styles/fonts.css` · `D-031`~~ — RETIRADA 2026-07-31

Se anuló porque destapaba un conflicto entre D-031 ("tipografía del sistema") y
la guía de estilo (Raleway), y esa era una decisión del dueño, no mía. **T-8 se
cerró el mismo día con D-036**, así que la anulación caducó según sus propios
términos.

**El hallazgo se arregló**, no se dejó pasar: `--font-marca` para títulos y
cuerpo, `--font-sistema` para botones, campos y navegación. Se deja aquí el
registro en vez de borrarlo, porque una anulación retirada cuenta la historia
de por qué el código cambió — y esta fue la primera tensión que levantó la
flota en vez de una persona.

### ~~`locale-fr-FR` · `apps/web/src/i18n/index.ts` · `D-005`~~ — RETIRADA 2026-08-01

Se anuló el 2026-07-31 porque el hallazgo era correcto y llegaba antes de tiempo:
`MATH_CONVENTIONS` estaba definido y no lo consumía nadie, porque no había
interfaz que mostrara números. La anulación **caducaba al arrancar F3**, con estas
palabras: *"si para entonces sigue sin aplicarse, el hallazgo vuelve a bloquear y
con razón"*.

F3 arrancó y se aplicó. La tabla se mudó a `packages/motor/src/convenciones.ts`
—`packages/` no puede depender de `apps/`, y el archivo de i18n importa JSON con
sintaxis de Vite que Node en ESM rechaza— y `apps/web/src/i18n/index.ts` la
reexporta, así que sigue habiendo un solo lugar donde está escrita.

`packages/motor/src/numeros.ts` la consume: formatea, elige el signo de división
y multiplicación por locale, y **parsea de vuelta**, que es la mitad que faltaba
—`Intl` formatea pero no parsea (`mc-34` impl. 2), y un adulto en `de-DE` teclea
`1543,2`. 14 casos, incluido el ejemplo literal de `mc-34`: `127 : 4 = 31,75` en
alemán contra `127 ÷ 4 = 31.75` en inglés.

**El hallazgo se arregló, no se dejó pasar**, y la anulación caducó según sus
propios términos sin que nadie tuviera que acordarse.
