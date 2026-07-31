// Validador de esquema propio, sin dependencias.
//
// Existe por una razón concreta y documentada: **el JSON Mode de Workers AI es
// best-effort, no garantizado.** La documentación de Cloudflare lo dice sin
// rodeos — "Workers AI can't guarantee that the model responds according to the
// requested JSON Schema". La API de Claude validaba en la capa de la
// herramienta y el modelo reintentaba solo; aquí eso hay que hacerlo a mano.
//
// Sin esto, un veredicto mal formado se parsearía a medias y un auditor
// devolvería cero hallazgos por un error de formato. Cero hallazgos por formato
// es indistinguible de cero hallazgos por limpieza, y esa confusión es
// exactamente cómo una flota deja de servir sin que nadie se entere.
//
// Cubre solo lo que usa ESQUEMA_VEREDICTO: object, array, string, integer,
// enum, required, additionalProperties:false. No es un validador de JSON Schema
// general, y no pretende serlo.

export function validar(valor, esquema, ruta = "raíz") {
  const errores = [];

  const tipo = esquema.type;

  if (tipo === "object") {
    if (valor === null || typeof valor !== "object" || Array.isArray(valor)) {
      return [`${ruta}: se esperaba un objeto, llegó ${describir(valor)}`];
    }
    for (const clave of esquema.required ?? []) {
      if (!(clave in valor)) errores.push(`${ruta}: falta la propiedad requerida \`${clave}\``);
    }
    if (esquema.additionalProperties === false) {
      for (const clave of Object.keys(valor)) {
        if (!(clave in (esquema.properties ?? {}))) {
          errores.push(`${ruta}: propiedad no permitida \`${clave}\``);
        }
      }
    }
    for (const [clave, sub] of Object.entries(esquema.properties ?? {})) {
      if (clave in valor) errores.push(...validar(valor[clave], sub, `${ruta}.${clave}`));
    }
    return errores;
  }

  if (tipo === "array") {
    if (!Array.isArray(valor)) return [`${ruta}: se esperaba un arreglo, llegó ${describir(valor)}`];
    valor.forEach((v, i) => errores.push(...validar(v, esquema.items, `${ruta}[${i}]`)));
    return errores;
  }

  if (tipo === "string") {
    if (typeof valor !== "string") return [`${ruta}: se esperaba texto, llegó ${describir(valor)}`];
    if (esquema.enum && !esquema.enum.includes(valor)) {
      return [`${ruta}: \`${valor}\` no está en {${esquema.enum.join(", ")}}`];
    }
    return [];
  }

  if (tipo === "integer") {
    if (!Number.isInteger(valor)) return [`${ruta}: se esperaba un entero, llegó ${describir(valor)}`];
    return [];
  }

  return errores;
}

const describir = (v) =>
  v === null ? "null" : Array.isArray(v) ? "un arreglo" : typeof v === "object" ? "un objeto" : `${typeof v} (${JSON.stringify(v)?.slice(0, 40)})`;

/**
 * Extrae el objeto JSON de una respuesta que puede venir envuelta.
 *
 * Un modelo con JSON garantizado devuelve JSON y ya. Uno best-effort a veces lo
 * envuelve en ```json, lo precede de una frase, o añade texto después. Se
 * intenta parsear tal cual, luego el bloque cercado, luego el primer objeto
 * balanceado. Si nada de eso da un objeto, se devuelve null y quien llama lo
 * trata como fallo — nunca como veredicto vacío.
 */
export function extraerJSON(texto) {
  if (typeof texto !== "string") return null;

  const intentar = (s) => {
    try {
      const v = JSON.parse(s);
      return v && typeof v === "object" && !Array.isArray(v) ? v : null;
    } catch {
      return null;
    }
  };

  const directo = intentar(texto.trim());
  if (directo) return directo;

  const cercado = texto.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (cercado) {
    const v = intentar(cercado[1].trim());
    if (v) return v;
  }

  // Primer objeto con llaves balanceadas, ignorando las que están dentro de
  // cadenas — contar `{` y `}` a secas se rompe con un resumen que traiga una.
  const inicio = texto.indexOf("{");
  if (inicio === -1) return null;
  let profundidad = 0;
  let enCadena = false;
  let escapado = false;
  for (let i = inicio; i < texto.length; i++) {
    const c = texto[i];
    if (escapado) { escapado = false; continue; }
    if (c === "\\") { escapado = true; continue; }
    if (c === '"') { enCadena = !enCadena; continue; }
    if (enCadena) continue;
    if (c === "{") profundidad++;
    else if (c === "}") {
      profundidad--;
      if (profundidad === 0) return intentar(texto.slice(inicio, i + 1));
    }
  }
  return null;
}
