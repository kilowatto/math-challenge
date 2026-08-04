/**
 * El registro de una escuela y sus dos caminos de verificación (F9 · #381,
 * D-086, D-089, D-090).
 *
 * ─── Los dos caminos, nunca ambiguos ─────────────────────────────────────────
 *
 *  1. **Atajo de dominio.** Si el correo del registrante pertenece a un
 *     dominio institucional ya reconocido (la lista vive en
 *     `CONFIG_KV.f9_dominios_escuela`, un JSON de dominios — contenido que se
 *     decide con datos, nunca una constante inventada en el código, como dice
 *     la cabecera de la 0017), la escuela nace `verified` con
 *     `verification_method = 'domain_shortcut'` y `verified_by = 'auto'`, y
 *     el registrante queda de alta como maestro EN EL MISMO batch: el trigger
 *     `trg_school_teacher_alta` de la 0017 escribe su
 *     `assurance = 'school_verified'`. **Ese valor jamás lo escribe esta
 *     ruta a mano** — es la regla de UN solo escritor que
 *     `audits/school-verification-required.mjs` hace cumplir.
 *  2. **Revisión humana.** Sin dominio reconocido, el documento es
 *     OBLIGATORIO: se sube a `math-challenge-media` bajo el prefijo
 *     `escuela/` y la escuela queda `pending`. La cola la atiende el dueño a
 *     mano (D-089/D-116: SQL + correo, sin UI de administración — el runbook
 *     del plan F9 §17), y al verificarla con el UPDATE del runbook el trigger
 *     `trg_school_verificada` eleva a sus maestros activos en la MISMA
 *     transacción. El `user_id` del registrante viaja en los metadatos del
 *     objeto R2: la tabla `school` no tiene columna para él, y sin ella el
 *     revisor no sabría a quién dar de alta como maestro.
 *
 * Si el dominio coincide, el documento NO se pide: los dos caminos nunca se
 * ofrecen a la vez de forma ambigua (issue #381, criterio literal).
 *
 * ─── El estándar de documento es laxo y universal (D-090) ────────────────────
 *
 * El formulario no distingue por país: mismo campo, mismo criterio (membrete,
 * nombre, dirección, revisado a ojo) para los cuatro mercados de lanzamiento.
 * Esta es la PRIMERA capa de mitigación, no la única: las capas reales son el
 * tope de tamaño/creación (D-087) y la aprobación del padre por niño (D-011).
 *
 * ─── Lo que este módulo NO hace ──────────────────────────────────────────────
 *
 *  · **No revisa documentos.** Guarda y deja la fila pendiente; revisar es
 *    del dueño, a mano.
 *  · **No valida contra registros oficiales por país** (CCT/SEP, INEP…):
 *    D-090 lo descartó para los cuatro mercados de lanzamiento.
 *  · **No escribe `assurance` ni crea grupos.** Los triggers y
 *    `grupo-duenio.ts`, respectivamente.
 */

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

/** Los tipos que acepta el documento (issue #381: AVIF/PDF). */
const TIPOS_DE_DOCUMENTO = ["image/avif", "application/pdf"];

/** Tope del documento: 5 MB sobran para una constancia escaneada en AVIF/PDF. */
const TOPE_BYTES_DOCUMENTO = 5 * 1024 * 1024;

/** La llave de CONFIG_KV con la lista de dominios institucionales conocidos. */
const LLAVE_DOMINIOS = "f9_dominios_escuela";

/**
 * La lista de dominios reconocidos. Vacía por construcción: una llave
 * ausente o un JSON inválido no reconocen ningún dominio — el atajo se
 * enciende escribiendo la lista, nunca por accidente.
 */
export async function dominiosConocidos(kv: KVNamespace | undefined): Promise<string[]> {
  if (!kv) return [];
  try {
    const crudo = await kv.get(LLAVE_DOMINIOS);
    const lista = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(lista)
      ? lista.filter((d): d is string => typeof d === "string").map((d) => d.toLowerCase())
      : [];
  } catch {
    return [];
  }
}

export interface PedidoDeEscuela {
  readonly userId: string;
  /** El correo de la sesión: de su dominio sale el atajo, si existe. */
  readonly email: string;
  readonly nombre: string;
  /** ISO 3166-1 alfa-2. Se valida la FORMA, no contra un registro (D-090). */
  readonly pais: string;
  readonly locale: string;
  /** El documento subido, o null. Obligatorio salvo atajo de dominio. */
  readonly documento: File | null;
  /** Sello del servidor, en segundos UNIX. */
  readonly ahora: number;
}

export type ResultadoDeEscuela =
  | { readonly ok: true; readonly via: "dominio" | "documento" }
  | { readonly ok: false; readonly motivo: string };

/**
 * Registra la escuela y, según el dominio del correo, la verifica o la deja
 * pendiente con su documento guardado.
 *
 * En el camino de dominio, la escuela y el alta del maestro viajan EN EL
 * MISMO `batch`: o están las dos o no está ninguna — una escuela verificada
 * sin maestro que la invocó sería el estado a medias que la corrección de
 * D-086 (2026-08-03) prohibió.
 */
export async function registrarEscuela(
  db: D1Database,
  r2: R2Bucket | undefined,
  kv: KVNamespace | undefined,
  pedido: PedidoDeEscuela,
): Promise<ResultadoDeEscuela> {
  const nombre = pedido.nombre.trim();
  if (nombre.length < 2 || nombre.length > 160) return { ok: false, motivo: "nombre_invalido" };
  const pais = pedido.pais.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(pais)) return { ok: false, motivo: "pais_invalido" };
  if (!LOCALES.includes(pedido.locale)) return { ok: false, motivo: "locale_invalido" };

  const dominio = (pedido.email.split("@")[1] ?? "").toLowerCase();
  const conocido = dominio.length > 0 && (await dominiosConocidos(kv)).includes(dominio);

  const id = crypto.randomUUID();

  if (conocido) {
    // ─── El atajo: verificada de inmediato, maestro de alta en el mismo batch
    await db.batch([
      db
        .prepare(
          "INSERT INTO school (" +
            "id, name, country, locale, verification_status, verification_method, " +
            "verified_by, verified_at, created_at" +
            ") VALUES (?, ?, ?, ?, 'verified', 'domain_shortcut', 'auto', ?, ?)",
        )
        .bind(id, nombre, pais, pedido.locale, pedido.ahora, pedido.ahora),
      // El alta del maestro: el trigger `trg_school_teacher_alta` escribe su
      // assurance al insertar — nunca se escribe a mano desde aquí (D-086).
      db
        .prepare(
          "INSERT INTO school_teacher (school_id, user_id, invited_at) VALUES (?, ?, ?)",
        )
        .bind(id, pedido.userId, pedido.ahora),
    ]);
    return { ok: true, via: "dominio" };
  }

  // ─── La revisión humana: el documento es obligatorio
  const doc = pedido.documento;
  if (!doc || doc.size === 0) return { ok: false, motivo: "documento_faltante" };
  if (!TIPOS_DE_DOCUMENTO.includes(doc.type)) return { ok: false, motivo: "tipo_documento" };
  if (doc.size > TOPE_BYTES_DOCUMENTO) return { ok: false, motivo: "documento_grande" };
  if (!r2) return { ok: false, motivo: "sin_almacenamiento" };

  await db
    .prepare(
      "INSERT INTO school (id, name, country, locale, verification_status, created_at) " +
        "VALUES (?, ?, ?, ?, 'pending', ?)",
    )
    .bind(id, nombre, pais, pedido.locale, pedido.ahora)
    .run();

  // El documento y, en los metadatos, QUIÉN lo subió: la tabla no tiene
  // columna para el registrante, y sin él el revisor no sabría a quién dar de
  // alta como maestro al verificar.
  await r2.put(`escuela/${id}/documento`, doc.stream(), {
    httpMetadata: { contentType: doc.type },
    customMetadata: { registrante: pedido.userId },
  });

  return { ok: true, via: "documento" };
}
