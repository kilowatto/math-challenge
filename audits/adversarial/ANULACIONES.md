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

*(ninguna todavía — F1 acaba de construir la flota)*
