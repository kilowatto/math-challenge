/**
 * Quién puede abrir un grupo de niños. Criterio #118 · D-009 (enmendada), D-011, D-027.
 *
 * ─── El gate NO es un `if`, y esa es la decisión entera ────────────────────
 *
 * El criterio lo dice con esas palabras: «un `if` al principio de una función se
 * olvida de agregar en la segunda ruta que crea salones».
 *
 * Es verdad y es el modo de falla más común de este tipo de control: alguien
 * escribe la comprobación en `crearSalon()`, y seis meses después alguien más
 * añade `importarSalonDesdeCSV()` sin ella. Nada falla. El salón existe. El
 * agujero solo se ve cuando alguien lo busca.
 *
 * Aquí el gate produce un **tipo de marca** que solo `assertCanOwnChildGroup`
 * puede fabricar. Una función que cree grupos lo pide como argumento, y **no
 * compila sin él**. La segunda ruta no puede olvidarse de la comprobación
 * porque no puede escribirse sin ella.
 *
 * La comprobación de este criterio es `npx astro check` / `tsc`, y se le ve
 * fallar con una llamada plantada sin `proof` — está en
 * `apps/web/src/lib/owner-proof.prueba.mjs`.
 *
 * ─── `declared` significa «nadie lo comprobó», y se muestra así ────────────
 *
 * Este producto **no verifica que nadie sea maestro**. T-5 sigue abierta: no hay
 * proveedor de SMS —Cloudflare no ofrece— y D-044 quitó esa vía sin poner otra.
 *
 * Lo único cierto es que una persona escribió que da clases. `assurance` lo dice
 * con ese nombre, y `insigniaPara()` devuelve lo que el padre tiene que leer —
 * la insignia de «sin verificar» de D-027, mostrada tal cual.
 *
 * **La misma barra para el maestro (D-011) y para el papá que abre un club
 * (D-027).** No hay dos niveles de confianza porque no hay dos niveles de
 * comprobación: en los dos casos es una declaración.
 */

/** Qué tan cierto es lo que sabemos. Coincide con el CHECK de la migración 0017. */
export type Assurance = "declared" | "school_domain" | "human_reviewed" | "school_verified";

/**
 * La marca. **No se puede construir desde fuera de este módulo.**
 *
 * El campo privado con `unique symbol` es lo que lo impide: un objeto literal
 * con la misma forma no es asignable, porque no puede tener esa propiedad. Es
 * la única forma en TypeScript de tener un valor que solo una función puede
 * producir.
 *
 * Es un `Symbol()` REAL, no un `declare const`: la versión anterior usaba
 * `declare const marca: unique symbol`, que el compilador borra como
 * declaración de tipos — y al borrarla, `[marca]` referenciaba un identificador
 * inexistente y `assertCanOwnChildGroup` reventaba EN EJECUCIÓN con
 * `ReferenceError: marca is not defined`. Nadie lo vio porque nadie llamaba al
 * gate (issue #402: sin llamador desde F2); lo encontró
 * `padre-grupo.prueba.mjs` el 2026-08-04, la primera ejecución real del
 * módulo. Un `Symbol()` no exportado cumple la misma marca y sí existe en
 * tiempo de ejecución.
 */
const marca: unique symbol = Symbol("OwnerProof");

export interface OwnerProof {
  readonly [marca]: true;
  readonly userId: string;
  readonly assurance: Assurance;
  /** Lo que la persona declaró. Lo escribe un ADULTO, jamás un niño. */
  readonly declaredContext: string | null;
}

export interface FilaDeIdentidad {
  user_id: string;
  assurance: string;
  declared_context: string | null;
}

/**
 * Fabrica la prueba, o dice por qué no.
 *
 * **Devuelve `null` en vez de lanzar**: quien llama tiene que decidir qué
 * enseñarle a la persona, y una excepción convierte «todavía no puedes abrir un
 * salón» en un 500.
 *
 * Hoy la barra es baja a propósito: basta con que exista la fila, o sea con que
 * la persona haya declarado algo. **Subirla no es trabajo de este archivo** —
 * es la decisión de T-5, que sigue abierta. Lo que este archivo garantiza es
 * que el día que suba, sube en UN sitio.
 */
export function assertCanOwnChildGroup(fila: FilaDeIdentidad | null): OwnerProof | null {
  if (!fila) return null;
  const assurance = fila.assurance as Assurance;
  if (!["declared", "school_domain", "human_reviewed", "school_verified"].includes(assurance)) return null;
  return {
    [marca]: true,
    userId: fila.user_id,
    assurance,
    declaredContext: fila.declared_context,
  } as OwnerProof;
}

/**
 * Qué insignia ve el padre. **Se muestra tal cual, sin suavizar.**
 *
 * D-027 pide la insignia de «sin verificar», y el punto es que se lea. Escribir
 * «maestro» a secas sobre alguien a quien nadie comprobó es exactamente lo que
 * el nombre de la tabla evita.
 */
export function insigniaPara(proof: OwnerProof): "sin_verificar" | "dominio_escolar" | "revisado" | "escuela_verificada" {
  switch (proof.assurance) {
    case "school_verified":
      // Su escuela está verificada y su fila de `school_teacher` sigue activa
      // (D-086). Lo escriben los triggers de la 0017 — nunca una ruta a mano,
      // y `audits/school-verification-required.mjs` lo vigila. Es la insignia
      // POSITIVA del patrón Bark: aparece cuando hay verificación, y su
      // ausencia es la señal — nunca un sello rojo de alarma.
      return "escuela_verificada";
    case "school_domain":
      // Prueba que controla ese buzón. **No prueba que dé clases ahí**, y la
      // insignia no debe sugerir lo contrario.
      return "dominio_escolar";
    case "human_reviewed":
      return "revisado";
    default:
      return "sin_verificar";
  }
}
