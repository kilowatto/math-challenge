# F10 · Runbook de apelaciones de prendas

La cola la atiende el dueño a mano. Una apelación no publica la prenda
automáticamente: solo deja constancia de que debe revisarse.

## Consultar la cola

```sql
SELECT l.id, l.stake_id, l.texto, l.veredicto, l.modelo, l.confianza,
       l.appealed_at
FROM stake_moderation_log l
WHERE l.appealed_at IS NOT NULL AND l.human_verdict IS NULL
ORDER BY l.appealed_at ASC;
```

## Aprobar una apelación

Leer el texto y el contexto del reto fuera de la base. Si es una prenda
aceptable entre adultos, ejecutar la actualización dentro de una transacción:

```sql
BEGIN;
UPDATE stake_moderation_log
SET human_verdict = 'pasa', reviewed_at = unixepoch()
WHERE id = '<id>' AND appealed_at IS NOT NULL AND human_verdict IS NULL;
UPDATE club_stake
SET moderacion = 'aprobada'
WHERE id = (SELECT stake_id FROM stake_moderation_log WHERE id = '<id>')
  AND moderacion = 'rechazada';
COMMIT;
```

## Mantener el rechazo

```sql
BEGIN;
UPDATE stake_moderation_log
SET human_verdict = 'rechaza', reviewed_at = unixepoch()
WHERE id = '<id>' AND appealed_at IS NOT NULL AND human_verdict IS NULL;
COMMIT;
```

No se envía texto libre desde el panel: la respuesta al autor usa una
plantilla autorada por locale. Nunca se añade un perdedor, penalización,
forfeit o consecuencia económica.
