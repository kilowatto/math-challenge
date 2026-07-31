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

## Las dos reglas de D-032

1. **Cada auditor cita la decisión que hace cumplir.** Uno que no puede señalar
   una decisión de `docs/decisions.md` o un hallazgo de `docs/research/` está
   opinando, y su veredicto no bloquea.
2. **Anular exige escribir por qué**, y eso queda en el historial.

Sin la primera, la flota genera ruido. Sin la segunda, se vuelve un obstáculo que
la gente aprende a rodear en silencio — que es peor que no tenerla.

## Estado

`node audits/run.mjs` imprime el inventario completo: cuáles corren hoy y cuáles
esperan la fase que los habilita. Un auditor listado como pendiente no está
olvidado; está esperando que exista lo que tiene que revisar.
