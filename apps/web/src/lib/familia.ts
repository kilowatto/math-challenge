const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function codigoInvitacion(bytes: Uint8Array): string {
  let codigo = "";
  for (let i = 0; i < 6; i++) codigo += ALFABETO[bytes[i] % ALFABETO.length];
  return codigo;
}

export function hogarIds(rows: Array<{ inviter_user_id: string; user_id: string }>, userId: string): string[] {
  const ids = new Set<string>([userId]);
  for (const row of rows) {
    if (row.inviter_user_id === userId) ids.add(row.user_id);
    if (row.user_id === userId) ids.add(row.inviter_user_id);
  }
  return [...ids];
}

export const REACCIONES_FAMILIA = ["animo", "bien_hecho", "vamos"] as const;
