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

### `locale-fr-FR` · `apps/web/src/i18n/index.ts` · `D-005` · 2026-07-31 · Esteban

Razón: el hallazgo es correcto y llega antes de tiempo. `MATH_CONVENTIONS` está
definido y hoy no lo consume nadie porque **no existe todavía interfaz que
muestre números** — el sitio actual es texto. La tabla es el contrato, no la
implementación, y aplicarla exige el motor de reto.

No se pierde: F3 lleva el criterio explícito de que la puntuación y los ítems se
rendericen con la convención del locale, y F5 lo lleva para el banco de ítems.
Esta anulación caduca cuando F3 arranque; si para entonces sigue sin aplicarse,
el hallazgo vuelve a bloquear y con razón.

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
