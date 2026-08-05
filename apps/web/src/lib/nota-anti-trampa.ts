/** Escribe la señal global de velocidad sin duplicarla ni exponerla al niño. */
export async function escribirNotaPatronInusual(
  db: D1Database,
  childProfileId: string,
  ahora: number,
  id = crypto.randomUUID(),
): Promise<void> {
  await db.prepare(
    "INSERT INTO child_diagnostic_notes (id, child_profile_id, cause_code, skill_id, created_at, seen_at) " +
      "SELECT ?, ?, 'PATRON_INUSUAL_PARA_EDAD', NULL, ?, NULL " +
      "WHERE NOT EXISTS (SELECT 1 FROM child_diagnostic_notes " +
      "WHERE child_profile_id = ? AND cause_code = 'PATRON_INUSUAL_PARA_EDAD' AND created_at >= ?)",
  )
    .bind(id, childProfileId, ahora, childProfileId, ahora - 86_400_000)
    .run();
}
