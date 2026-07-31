# AGENTS.md — Math Challenge — Reglas de coordinación

> Este archivo es la fuente de verdad para cualquier agente (Claude, Kimi,
> Antigravity, Cursor) que trabaje en **Math Challenge**. Léelo al inicio de cada
> sesión.
>
> **Este repo es independiente.** No comparte código, locks ni ciclo de vida con
> `ignia-object-storage` (IOS/IMP). Si vienes de ahí: las reglas de allá no
> aplican aquí, y las de aquí no aplican allá. Lo único que se hereda es el
> personaje de Larry y el estándar de calidad.

---

## 1. Qué es esto

**math.kilowatto.com** — un juego de retos matemáticos PWA-first, de los 4 años
al matemático profesional, en cinco idiomas (EN/ES/FR/PT/DE), sobre Cloudflare.

Antes de tocar nada, lee en este orden:

1. [`docs/master-plan.md`](docs/master-plan.md) — el plan integral
2. [`docs/decisions.md`](docs/decisions.md) — las decisiones del dueño, con fecha
3. [`docs/research/README.md`](docs/research/README.md) — índice de 43 investigaciones

**Regla de oro:** si una decisión ya está en `decisions.md`, no se vuelve a
discutir; se implementa o se pide al dueño que la cambie explícitamente. Si algo
no está escrito ahí ni en un issue asignado, no lo toques.

---

## 2. Las líneas que no se cruzan

Estas no son preferencias. Cada una viene de evidencia documentada en
`docs/research/` y varias tienen exposición regulatoria real.

1. **Nunca cámara, nunca micrófono, nunca biometría, nunca navegador bloqueado.**
   A ningún usuario, en ninguna banda, en ningún nivel de anti-trampa.
2. **El niño nunca es un usuario.** Es un perfil dentro de la cuenta del padre.
   No se pide nombre real, correo, foto ni fecha exacta de nacimiento.
3. **Ningún niño escribe texto libre**, en ninguna superficie del producto.
4. **Nunca se cobra por dejar que un niño practique.** Sin corazones, sin vidas,
   sin energía que se agote.
5. **Sin moneda comprable y sin recompensas aleatorias de pago.** Las cajas de
   botín fueron declaradas juego ilegal en Bélgica y Países Bajos.
6. **La racha nunca se rompe por respetar el límite de pantalla**, y la
   protección de racha jamás se vende.
7. **Larry nunca avergüenza a un niño por equivocarse**, y nunca calcula: recibe
   el veredicto ya calculado y solo lo explica.
8. **Nunca se penaliza borrar o corregir una respuesta.** Cambiar una respuesta
   mejora la calificación el 79% de las veces (`mc-30`).

Si una tarea te pide cruzar una de estas, **no la hagas**: escribe el conflicto
y pregúntale al dueño.

---

## 3. Flujo de trabajo

1. `git pull origin main`
2. Rama propia: `agente/tipo/descripcion-corta` — `claude/feat/placement-test`
3. Commits frecuentes, Conventional Commits **en inglés**
4. Push y Pull Request. **Nunca push directo a `main`.**
5. Otro agente revisa antes del merge
6. Tras el merge, borra la rama remota

**Cada agente commitea lo suyo.** No dejes trabajo sin commitear para otro
agente o para el dueño.

**Antes de cada push, verifica en qué rama estás:**
`git rev-parse --abbrev-ref HEAD`. Si varios agentes comparten el árbol, la rama
actual es decisión de alguien más — y un `git push origin main` que responde
"Everything up-to-date" se lee como éxito cuando en realidad tu trabajo quedó en
otra rama. Ya pasó en el repo hermano.

---

## 4. Commits

```
<tipo>(<alcance>): <descripción corta en imperativo, ≤72 caracteres>

<qué cambió>

Why:
<por qué>

Context:
<decisiones, Q&A, archivos relacionados>

Closes #<issue>
```

Tipos: `feat` `fix` `docs` `style` `refactor` `test` `chore` `infra` `content`.

`content` es propio de este proyecto: cambios al banco de ítems o a los retos
curados, que no son código pero sí son el producto.

**Cuatro reglas que no son opcionales:**

1. **Nombra cada archivo borrado.** Lee `git status` antes de commitear.
2. **Toda afirmación factual debe poder re-ejecutarse.** "Gate verde, 300 tests"
   sin la salida del comando es una aserción en tono seguro.
3. **Toda prueba de regresión debe haberse visto fallar sin el arreglo**, y la
   evidencia va pegada en el PR. Una prueba que nunca se vio fallar no prueba
   nada.
4. **Di lo que el cambio NO hizo.** Alcance diferido, residuos conocidos, cosas
   dejadas rotas a propósito.

---

## 5. Antes de implementar algo no trivial

Investiga y hazle al dueño **preguntas de opción múltiple con explicación de las
alternativas**, en olas de 4 (límite de la herramienta). Haz todas las preguntas
cuya respuesta cambie lo que vas a construir; si son 3, son 3; si son 40, son 40.
No inventes preguntas de relleno.

Las respuestas se registran en `docs/decisions.md` con fecha, incluyendo la
investigación que las respalda **o las contradice**.

---

## 6. Idiomas

- **Código, comentarios, nombres y commits:** inglés.
- **Documentación de cara al usuario** (README, ayuda, textos de interfaz):
  los cinco idiomas del producto.
- **Documentación interna** (este archivo, planes, investigación): español o
  inglés, lo que sea más claro. La investigación está en inglés con resumen
  ejecutivo en español.

**Advertencia específica de este producto:** el contenido matemático **no se
traduce, se autora**. En alemán el 21 es "einundzwanzig" y en francés el 90 es
"quatre-vingt-dix"; México usa punto decimal y el resto del mundo hispano usa
coma; `pt-PT` y `pt-BR` son dos locales distintos. Ver `docs/research/2026-07-31-mc-34-i18n-math-notation.md`.

---

## 7. Cloudflare

- **Todo objeto lleva prefijo `math-challenge-`.** Sin excepción, ni en pruebas
  (ahí se sufija: `math-challenge-db-dev`).
- El inventario completo con nombre, tipo, propósito EN/ES y binding vive en
  [`docs/infrastructure.md`](docs/infrastructure.md).
- **Quien cree un recurso escribe su renglón en la bitácora de
  `infrastructure.md` en el mismo PR.** Un recurso creado y no documentado es un
  recurso que nadie va a poder borrar dentro de un año.
- El despliegue es automático al mergear a `main`. `wrangler` se usa solo para
  migraciones, secretos y diagnóstico.
- **Nunca commitees un secreto.** `wrangler secret put` o el dashboard.

---

## 8. Contenido

El banco de ítems es producto, no datos de prueba. Aplican reglas propias:

- Un ítem se guarda como **estructura**, jamás como texto ya formado. Ver el
  esquema en `docs/master-plan.md` §9.
- Todo ítem trae su arreglo de **errores con causa nombrada** — es lo que permite
  que Larry sepa *qué* error cometió el alumno y no solo que falló.
- Un ítem redactado con ayuda de IA **siempre** pasa por revisión humana antes de
  entrar. Los modelos escriben distractores matemáticamente válidos pero son
  malos anticipando los errores que los alumnos reales cometen (`mc-40`).
- **La unidad de diseño es la serie, no la pregunta suelta.**

---

## 9. Antes del PR

- [ ] Corre el gate completo y pega la salida
- [ ] Documentación actualizada si cambió un contrato
- [ ] Commits en Conventional Commits, en inglés
- [ ] Ningún secreto commiteado
- [ ] El PR enlaza su issue (`Closes #123`)
- [ ] Cada prueba de regresión se vio fallar sin el arreglo, con evidencia pegada
- [ ] Si tocaste algo de las líneas de la §2, explica por qué no las cruzaste

---

## 10. Locks

Este repo arranca con **un solo agente activo**, así que no hay tabla de locks
todavía. Si en algún momento trabajan dos o más en paralelo, se agrega aquí una
tabla `Agente | Área | Tipo | Desde | Hasta` y aplica la misma disciplina que en
el repo hermano: **se toma el lock antes de tocar, y se quita al terminar.**

Una tabla de locks con renglones muertos deja de leerse, y una tabla que nadie
lee es peor que no tener tabla.

---

## 11. Cambiar este archivo

Vía PR, aprobado por alguien más. Nunca directo en `main`.
