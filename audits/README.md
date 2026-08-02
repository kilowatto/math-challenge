# Auditores

**Este proyecto no usa CI.** Nada de GitHub Actions, nada de `.github/workflows`.
Los gates son locales, y esa es una decisión del dueño, no una carencia.

## Cómo se ejecutan

**En cada commit**, vía gancho de git. Se activa una vez por clon:

```
git config core.hooksPath .githooks
```

A partir de ahí, `.githooks/pre-commit` corre la flota y **bloquea el commit** si
algún auditor determinista falla. Saltarlo exige `--no-verify` **y** escribir la
razón en el cuerpo del commit (D-032).

**Después de desplegar**, a mano:

```
node audits/live.mjs
```

Va aparte a propósito: `run.mjs` juzga el cambio que estás por hacer, `live.mjs`
juzga lo que ya está desplegado. Mezclarlos haría que un commit fallara porque el
sitio se cayó, que no es culpa del commit.

**`live.mjs` siembra una sesión de verdad** (#341). Hasta el 2026-08-02 el área
privada no se verificaba nunca: `curl` sin cookie recibe un 302 a `/entrar/` y no
ve nada de `/app/**`, así que los dos bugs que dejaron a toda cuenta nueva sin
salida los encontró el dueño en su teléfono. Ahora la comprobación crea dos
cuentas vacías —una de familia y una de adulto que aprende solo—, escribe su fila
en D1 y su token en KV, pide las páginas con esa cookie, y **las borra al
terminar pase lo que pase**. Si el proceso muere a medias, queda una fila con
correo `auditor-sesion-…@math-challenge.invalid` y la corrida siguiente la barre.

```
node audits/live.mjs --sin-sesion        no siembra nada (y lo dice en voz alta)
node audits/live.mjs http://localhost:8788 --sembrar --local
```

La segunda forma es el **control negativo**: se levanta `wrangler dev`, se
restaura a mano el bug de #341 y se comprueba que la verificación bloquea. Contra
producción no hay manera de ver fallar esto sin rompérsela a alguien.

**Antes de abrir un PR**, a mano:

```
node audits/adversarial.mjs
```

Los 28 auditores adversariales con LLM (F1). Leen el diff de tu rama contra
`main` y juzgan **el cambio**, no producción. Cuestan dinero y segundos, por eso
no están en el gancho: bloquear cada commit con 28 llamadas de LLM es
exactamente cómo una flota se convierte en el ruido que D-032 teme.

**Proveedor: Workers AI** (D-035) — `@cf/moonshotai/kimi-k2.6` primario,
`@cf/openai/gpt-oss-120b` de respaldo. Necesita `CLOUDFLARE_ACCOUNT_ID` y
`CLOUDFLARE_API_TOKEN` en `.env`; los captura `./scripts/set-keys.sh`.

Como **el JSON de Workers AI es best-effort** —su documentación dice que no
puede garantizar que el modelo responda según el esquema— el veredicto se valida
de nuestro lado, con un reintento y luego bajada de modelo. **Un veredicto que no
valida cuenta como auditor fallido, jamás como auditor limpio**, y el corredor
sale con código 1.

**Solo Cloudflare** (D-035): no hay proveedor alterno. Para saber si la flota se
está degradando, planta una violación conocida y comprueba que la caza — es lo
único que distingue "el código está limpio" de "el auditor está ciego". Así se
verificó al construirla: tres violaciones deliberadas de `mc-33` en un archivo
temporal, y `pwa-ios` cazó las tres con las citas correctas.

```
node audits/adversarial.mjs --seco        arma todo, no llama al modelo, estima el costo
node audits/adversarial.mjs --solo kinder,locale-de-DE
node audits/adversarial.mjs --preparado   solo lo que está en el índice
node audits/adversarial.mjs <ref>         contra la referencia que digas
```

Solo despiertan los auditores cuyo alcance toca el diff. Un cambio de
documentación no despierta al de PWA en iOS.

## Las tres capas, y qué juzga cada una

| | qué juzga | cuándo | bloquea |
|---|---|---|---|
| `run.mjs` (42 deterministas) | el cambio | cada commit, gancho | siempre |
| `adversarial.mjs` (28 con LLM) | el cambio | antes del PR, a mano | solo citando línea roja o decisión |
| `live.mjs` | producción desplegada | tras desplegar, a mano | no commitea nada |

Ninguna corre en runtime. Ningún usuario las toca nunca.

## Las dos reglas de D-032, y dónde viven en el código

1. **Cada auditor cita la decisión que hace cumplir.** Uno que no puede señalar
   una decisión de `docs/decisions.md` o un hallazgo de `docs/research/` está
   opinando, y su veredicto no bloquea.

   → `adversarial/citas.mjs` lee los encabezados reales de `decisions.md` y los
   archivos reales de `research/`. Un hallazgo que cite `D-036` cuando las
   decisiones llegan a D-034 se descarta, por convincente que suene. Y un
   auditor solo puede invocar lo que su carta le autoriza: sin ese corte, los 28
   podrían citar cualquier decisión y la división de trabajo sería decorativa.

2. **Anular exige escribir por qué**, y eso queda en el historial.

   → `adversarial/ANULACIONES.md`, commiteado en el mismo PR que lo necesita.
   La razón mínima son 20 caracteres: si valiera una vacía, la regla se
   cumpliría escribiendo un encabezado.

Sin la primera, la flota genera ruido. Sin la segunda, se vuelve un obstáculo que
la gente aprende a rodear en silencio — que es peor que no tenerla.

Ambas se prueban sin gastar una llamada:

```
node audits/adversarial/prueba.mjs   las dos reglas, con veredictos escritos a mano
node audits/adversarial.mjs --cartas las 28 cartas contra el repo
```

## La deuda declarada, y por qué no es una anulación

Un auditor nuevo casi siempre nace ROJO: se escribe porque algo se rompió, y lo
roto sigue roto el día que se escribe. Las dos salidas fáciles son malas —
dejarlo fuera de `run.mjs` «hasta que el producto esté limpio» (así fallaron
abiertos seis auditores sin que nadie lo supiera) o ablandar la regla hasta que
pase (y entonces deja de cazar la clase entera).

La salida es `separarDeuda`, en `lib/repo.mjs`: cada violación conocida se
escribe **dentro del auditor**, con su issue y su porqué, se imprime en cada
corrida, y todo lo demás bloquea. **Un renglón que deje de reproducirse
bloquea**, así que la lista no puede crecer y quedarse. Lo usan hoy
`hojas-de-estilo` (1 renglón) y `opciones-contestables` (4).

## Estado

`node audits/run.mjs` imprime el inventario completo: cuáles corren hoy y cuáles
esperan la fase que los habilita. Un auditor listado como pendiente no está
olvidado; está esperando que exista lo que tiene que revisar.
