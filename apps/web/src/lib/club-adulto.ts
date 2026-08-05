import {
  adolescentePuedeEntrar,
  MAX_MIEMBROS_CLUB_ADULTO,
  nivelDeClubValido,
  nombreDeClubValido,
  nuevoCodigoClub,
  ventanaDeRetoValida,
} from "../../../../packages/motor/src/club-adulto.ts";
import { generarBancoAdulto } from "../../../../packages/motor/src/banco-adulto.ts";

export { MAX_MIEMBROS_CLUB_ADULTO, adolescentePuedeEntrar, nivelDeClubValido, nombreDeClubValido };

export async function crearClub(
  db: D1Database,
  userId: string,
  nameKey: string,
  ahora: number,
  azar?: () => number,
): Promise<{ ok: true; id: string; codigo: string } | { ok: false; motivo: string }> {
  if (!nombreDeClubValido("es-MX", nameKey)) return { ok: false, motivo: "nombre_invalido" };
  const [total, hoy] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS n FROM child_group WHERE owner_user_id = ? UNION ALL SELECT COUNT(*) FROM adult_club WHERE owner_user_id = ?")
      .bind(userId, userId).all<{ n: number }>(),
    db.prepare("SELECT COUNT(*) AS n FROM child_group WHERE owner_user_id = ? AND created_at >= ? UNION ALL SELECT COUNT(*) FROM adult_club WHERE owner_user_id = ? AND created_at >= ?")
      .bind(userId, ahora - 86400, userId, ahora - 86400).all<{ n: number }>(),
  ]);
  if ((total.results ?? []).reduce((sum, row) => sum + Number(row.n), 0) >= 3) return { ok: false, motivo: "tope_grupos" };
  if ((hoy.results ?? []).reduce((sum, row) => sum + Number(row.n), 0) >= 1) return { ok: false, motivo: "uno_por_dia" };
  for (let intento = 0; intento < 5; intento++) {
    const id = crypto.randomUUID();
    const codigo = nuevoCodigoClub(azar);
    try {
      await db.prepare("INSERT INTO adult_club (id, owner_user_id, name_key, join_code, max_size, created_at) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(id, userId, nameKey, codigo, MAX_MIEMBROS_CLUB_ADULTO, ahora).run();
      await db.prepare("INSERT INTO adult_club_membership (id, adult_club_id, user_id, joined_at) VALUES (?, ?, ?, ?)")
        .bind(crypto.randomUUID(), id, userId, ahora).run();
      return { ok: true, id, codigo };
    } catch (error) {
      if (!String(error).includes("UNIQUE")) throw error;
    }
  }
  return { ok: false, motivo: "codigo_agotado" };
}

export async function unirseAdulto(db: D1Database, userId: string, codigo: string, ahora: number) {
  const club = await db.prepare("SELECT id, max_size FROM adult_club WHERE join_code = ? AND disabled_at IS NULL").bind(codigo).first<{ id: string; max_size: number }>();
  if (!club) return { ok: false as const, motivo: "club_desconocido" };
  const miembro = await db.prepare("SELECT id FROM adult_club_membership WHERE adult_club_id = ? AND user_id = ? AND left_at IS NULL").bind(club.id, userId).first();
  if (miembro) return { ok: true as const, id: club.id };
  const count = await db.prepare("SELECT COUNT(*) AS n FROM adult_club_membership WHERE adult_club_id = ? AND left_at IS NULL").bind(club.id).first<{ n: number }>();
  if (Number(count?.n ?? 0) >= club.max_size) return { ok: false as const, motivo: "club_lleno" };
  await db.prepare("INSERT INTO adult_club_membership (id, adult_club_id, user_id, joined_at) VALUES (?, ?, ?, ?)").bind(crypto.randomUUID(), club.id, userId, ahora).run();
  return { ok: true as const, id: club.id };
}

export async function solicitarAdolescente(db: D1Database, parentUserId: string, childId: string, codigo: string, ahora: number) {
  const club = await db.prepare("SELECT id, max_size FROM adult_club WHERE join_code = ? AND disabled_at IS NULL").bind(codigo).first<{ id: string; max_size: number }>();
  const child = await db.prepare("SELECT id, theme_band FROM child_profiles WHERE id = ? AND parent_user_id = ? AND deleted_at IS NULL").bind(childId, parentUserId).first<{ id: string; theme_band: string }>();
  if (!club || !child) return { ok: false as const, motivo: "club_o_hijo_desconocido" };
  if (!adolescentePuedeEntrar(child.theme_band)) return { ok: false as const, motivo: "banda_no_admitida" };
  const count = await db.prepare("SELECT COUNT(*) AS n FROM adult_club_membership WHERE adult_club_id = ? AND left_at IS NULL").bind(club.id).first<{ n: number }>();
  if (Number(count?.n ?? 0) >= club.max_size) return { ok: false as const, motivo: "club_lleno" };
  await db.prepare("INSERT INTO adult_club_membership (id, adult_club_id, child_profile_id, approved_by, approved_at, joined_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), club.id, child.id, parentUserId, ahora, ahora).run();
  return { ok: true as const, id: club.id };
}

export async function salirClub(db: D1Database, userId: string, clubId: string, ahora: number) {
  const r = await db.prepare("UPDATE adult_club_membership SET left_at = ? WHERE adult_club_id = ? AND user_id = ? AND left_at IS NULL").bind(ahora, clubId, userId).run();
  return (r.meta?.changes ?? 0) > 0;
}

export async function crearRetoClub(db: D1Database, userId: string, clubId: string, nivel: number, ahora: number) {
  if (!nivelDeClubValido(nivel)) return { ok: false as const, motivo: "nivel_invalido" };
  const membership = await db.prepare("SELECT id FROM adult_club_membership WHERE adult_club_id = ? AND user_id = ? AND left_at IS NULL").bind(clubId, userId).first<{ id: string }>();
  if (!membership) return { ok: false as const, motivo: "sin_membresia" };
  const itemSet = generarBancoAdulto().filter((item) => item.nivel === nivel).slice(0, 10).map((item) => item.id);
  if (itemSet.length === 0) return { ok: false as const, motivo: "sin_contenido" };
  const expires = ahora + 72 * 60 * 60;
  if (!ventanaDeRetoValida(ahora * 1000, expires * 1000)) return { ok: false as const, motivo: "ventana_invalida" };
  const id = crypto.randomUUID();
  await db.prepare("INSERT INTO club_challenge (id, adult_club_id, item_set, nivel, created_by, starts_at, expires_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'open')")
    .bind(id, clubId, JSON.stringify(itemSet), nivel, userId, ahora, expires).run();
  return { ok: true as const, id, expiresAt: expires };
}
