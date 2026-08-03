/**
 * El tiempo civil del hogar. Un solo módulo, neutral (#268).
 *
 * Aquí vive la ÚNICA puerta entre un instante y un día u hora locales. Ni
 * `racha.ts` ni `limite-pantalla.ts` declaran copia propia: los dos importan
 * (y reexportan) de aquí, y `audits/limite-pantalla-motor-unico.mjs` comprueba
 * la identidad por referencia — una copia sería un segundo calendario.
 *
 * Las reglas son las mismas que `racha.ts` fijó para su puerta, y se heredan
 * enteras:
 *
 *   · Un día es un día LOCAL del hogar. La zona IANA llega como parámetro —
 *     `users.timezone` del padre dueño del perfil (D-016). Este módulo no la
 *     adivina, no lee `Date.now()`, y JAMÁS lee el reloj del dispositivo del
 *     niño: si pudiera, la tentación sería comparar en UTC, y una familia en
 *     `America/Mexico_City` que juega a las 19:00 vería su día contado como el
 *     siguiente durante media vida del producto.
 *   · Quien llama mide el instante. Estas funciones solo traducen.
 *
 * Hasta #268 estas funciones vivían en `racha.ts` (donde nació la puerta) y en
 * `limite-pantalla.ts` (donde nació `horaLocal`). Se extraen aquí porque
 * importar aritmética de husos desde un archivo llamado «racha» confunde a
 * quien lo lea dentro de un año — y porque F7 y F8 necesitan el MISMO
 * calendario sin que ninguno de los dos sea dueño del otro.
 */

/** Un día local del hogar, `YYYY-MM-DD`. Nunca un instante, nunca UTC crudo. */
export type DiaLocal = string;

/** Una hora local del hogar, `HH:MM`. Nunca un instante, nunca UTC crudo. */
export type HoraLocal = string;

/** ¿Es `zona` una zona IANA que este runtime entiende? */
export function zonaValida(zona: string): boolean {
  try {
    // El locale lleva región (`en-US`) aunque aquí sea irrelevante: lo único
    // que se prueba es si el runtime conoce la zona. `audits/notacion-locale.mjs`
    // bloquea todo `Intl` con idioma sin región, y tiene razón en general —
    // `es-MX` y `es-ES` no comparten separador decimal (mc-34 §1). Escribirlo
    // completo cuesta tres caracteres y evita la excepción que mañana alguien
    // copia a un sitio donde sí importa.
    new Intl.DateTimeFormat("en-US", { timeZone: zona });
    return true;
  } catch {
    return false;
  }
}

/**
 * El día local del hogar para un instante dado.
 *
 * @param instanteUTC milisegundos desde la época — lo mide quien llama, no esto
 * @param zonaIana    `users.timezone` del padre dueño del perfil, p.ej. `America/Mexico_City`
 *
 * Se arma con `formatToParts` y no con `toLocaleDateString("en-CA")`. El truco
 * de `en-CA` da `YYYY-MM-DD` en la mayoría de los ICU pero no es una garantía
 * del estándar: depende de los datos de locale del runtime, y este código corre
 * en un Worker cuyo ICU no elegimos nosotros. `formatToParts` pide año, mes y
 * día por nombre, y el orden lo decidimos aquí.
 */
export function diaEfectivo(instanteUTC: number, zonaIana: string): DiaLocal {
  if (!Number.isFinite(instanteUTC)) {
    throw new RangeError(`instante no finito: ${instanteUTC}`);
  }
  if (!zonaValida(zonaIana)) {
    throw new RangeError(
      `zona horaria desconocida: "${zonaIana}". Quien llama decide el respaldo ` +
        `(el último users.timezone conocido, o ZONA_DE_RESPALDO); este módulo no lo adivina.`,
    );
  }
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: zonaIana,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(instanteUTC));

  const de = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
  const anio = de("year").padStart(4, "0");
  const mes = de("month").padStart(2, "0");
  const dia = de("day").padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

/**
 * La hora local del hogar para un instante dado.
 *
 * Hermana de `diaEfectivo` y con las mismas reglas: recibe la zona IANA de
 * `users.timezone`, no la adivina y **jamás la lee del dispositivo del niño**.
 *
 * Se arma con `formatToParts` y `hourCycle: "h23"` por la misma razón que
 * `diaEfectivo` no usa `toLocaleDateString("en-CA")`: el formato depende de los
 * datos de locale del runtime, y este código corre en un Worker cuyo ICU no
 * elegimos. `h23` es explícito porque `en-US` da 12 horas con AM/PM por
 * defecto, y `"08:30"` de la noche y `"08:30"` de la mañana serían la misma
 * cadena — que en un corte nocturno es la diferencia entre cortar la tarde y no
 * cortar nunca.
 */
export function horaLocal(instanteUTC: number, zonaIana: string): HoraLocal {
  if (!Number.isFinite(instanteUTC)) {
    throw new RangeError(`instante no finito: ${instanteUTC}`);
  }
  if (!zonaValida(zonaIana)) {
    throw new RangeError(
      `zona horaria desconocida: "${zonaIana}". Quien llama decide el respaldo ` +
        "(el último users.timezone conocido); este módulo no lo adivina y NUNCA lee la del dispositivo.",
    );
  }
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: zonaIana,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(instanteUTC));

  const de = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
  // `h23` da 00-23, pero algunos ICU devuelven "24" para medianoche en `h24`.
  // Normalizarlo aquí cuesta una línea y evita una hora imposible corriente
  // abajo, donde ya nadie sabría de dónde salió.
  const hora = de("hour") === "24" ? "00" : de("hour").padStart(2, "0");
  const minuto = de("minute").padStart(2, "0");
  return `${hora}:${minuto}`;
}
