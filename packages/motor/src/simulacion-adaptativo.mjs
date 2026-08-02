// Simulación del motor adaptativo con alumnos sintéticos (F4 · mc-44, mc-13, D-002).
//
// ─── Por qué esto existe como archivo propio ────────────────────────────────
//
// `mc-44` es explícito sobre la única defensa que hay contra un motor adaptativo
// mal calibrado: **simular antes de desplegar**. Un motor mal calibrado no
// falla. Coloca. El niño termina en un nivel demasiado alto y se frustra, o
// demasiado bajo y se aburre, y en los dos casos el sistema informa que todo va
// bien — hay intentos, hay puntajes, hay progresión. El daño es invisible desde
// dentro.
//
// Está separado de `adaptativo.prueba.mjs` a propósito. La prueba comprueba
// invariantes —el signo de la ventana, que corregir no penaliza, que el banco
// agotado devuelve `null`—; esto MIDE, y lo que mide son cifras que hay que
// poder mirar sin que fallen. Se corre a mano así:
//
//     node --experimental-strip-types packages/motor/src/simulacion-adaptativo.mjs
//
// ─── El sesgo del alumno sintético, que hay que decir ──────────────────────
//
// Las respuestas se generan con **el mismo modelo logístico que usa el motor**.
// Eso quiere decir que esta simulación puede confirmar que el estimador es
// consistente consigo mismo, y NO puede decir nada sobre si niños reales se
// comportan así. `mc-13` lo advierte y aquí se repite porque es la limitación
// que más fácil se olvida al leer un número bonito.
//
// Lo que sí prueba, y es lo que F4 necesita: que la estimación converge a la
// habilidad verdadera **desde semillas de edad muy distintas**. Si la edad
// mandara, no convergería — y eso es D-002.

import {
  estadoInicial,
  actualizar,
  elegirSiguiente,
  esperado,
  nivelSemilla,
  nivelDeHabilidad,
  dificultadDeNivel,
  NIVEL_MAXIMO,
} from "./adaptativo.ts";

/** Un escalón de la escalera de D-017, en logits. */
export const ESCALON = 6 / (NIVEL_MAXIMO - 1);

/** Un banco uniforme sobre toda la escala. No modela un banco real: lo acota. */
export function bancoUniforme(cuantos = 80) {
  return Array.from({ length: cuantos }, (_, i) => ({
    id: `sim-${i}`,
    dificultad: -3 + (i / (cuantos - 1)) * 6,
  }));
}

/**
 * Generador reproducible. **No se usa `Math.random()`** para que dos perfiles
 * puedan compartir exactamente la misma suerte y lo único que difiera entre
 * ellos sea `birth_year` — que es la variable que D-002 pone a prueba.
 */
export function generador(semilla) {
  let s = semilla;
  return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
}

/**
 * Sirve `cuantos` ítems a un alumno sintético de habilidad verdadera conocida.
 *
 * Devuelve la trayectoria de la estimación y los escalones servidos — el
 * segundo es lo que el niño *siente*, y es el que importa para saber si el
 * motor da tumbos.
 */
export function correrAlumno({ anioNacimiento, habilidadVerdadera, aleatorio, cuantos, banco = bancoUniforme() }) {
  let estado = estadoInicial(nivelSemilla(anioNacimiento, 2026));
  const vistos = new Set();
  const trayectoria = [estado.habilidad];
  const nivelesServidos = [];

  for (let i = 0; i < cuantos; i++) {
    const item = elegirSiguiente(banco, estado, vistos, aleatorio);
    if (!item) break;
    vistos.add(item.id);
    nivelesServidos.push(nivelDeHabilidad(item.dificultad));
    // La respuesta sale de la habilidad VERDADERA, no de una cadena dictada.
    const correcto = aleatorio() < esperado(habilidadVerdadera, item.dificultad);
    estado = actualizar(estado, {
      dificultad: item.dificultad,
      correcto,
      nivel: nivelDeHabilidad(item.dificultad),
    });
    trayectoria.push(estado.habilidad);
  }
  return { trayectoria, nivelesServidos, estado };
}

/**
 * Mide el **sesgo de la edad**: cuánto separa `birth_year` a dos alumnos que
 * tienen exactamente la misma habilidad verdadera y la misma suerte.
 *
 * Es la medición que sostiene D-002 y el criterio #88. Al empezar vale 7
 * escalones —la edad manda, y ésa es su única puerta—; si el motor funciona,
 * cae a ≤1 en el ítem 3 y a ~0.1 en el ítem 8. Si alguien toca `kPara()` y el
 * sesgo se queda arriba, la dificultad se puede volver a predecir desde la edad
 * y eso es la escalera de D-017 con otro nombre.
 */
export function medirSesgoDeEdad({ nivelVerdadero, simulaciones = 800, items = 16 }) {
  const habilidadVerdadera = dificultadDeNivel(nivelVerdadero);
  const sesgo = new Array(items + 1).fill(0);
  let errorFinal = 0;
  let saltoMaximo = 0;

  for (let s = 0; s < simulaciones; s++) {
    // La MISMA semilla para los dos: comparten la suerte, difieren en la edad.
    const joven = correrAlumno({
      anioNacimiento: 2019, habilidadVerdadera, aleatorio: generador(s * 7919 + 13), cuantos: items,
    });
    const mayor = correrAlumno({
      anioNacimiento: 2011, habilidadVerdadera, aleatorio: generador(s * 7919 + 13), cuantos: items,
    });

    for (let i = 0; i <= items; i++) sesgo[i] += mayor.trayectoria[i] - joven.trayectoria[i];
    errorFinal +=
      Math.abs(joven.trayectoria[items] - habilidadVerdadera) +
      Math.abs(mayor.trayectoria[items] - habilidadVerdadera);

    for (const perfil of [joven, mayor]) {
      for (let i = 1; i < perfil.nivelesServidos.length; i++) {
        saltoMaximo = Math.max(saltoMaximo, Math.abs(perfil.nivelesServidos[i] - perfil.nivelesServidos[i - 1]));
      }
    }
  }

  return {
    /** El sesgo en ESCALONES tras `i` ítems. `enEscalones(0)` es la semilla pura. */
    enEscalones: (i) => sesgo[i] / simulaciones / ESCALON,
    /** Cuánto se equivoca la estimación final, en escalones. */
    errorFinal: errorFinal / simulaciones / 2 / ESCALON,
    /** El salto más grande entre dos ítems seguidos. Es lo que el niño siente. */
    saltoMaximo,
  };
}

// Corriéndolo directo imprime la tabla. Es la que está pegada en `kPara()`.
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("simulación del motor adaptativo — sesgo de la edad (D-002, criterio #88)\n");
  console.log("  nivel     ítem 0   ítem 3   ítem 8  ítem 16   |error|  salto máx");
  for (const nivelVerdadero of [3, 6, 9]) {
    const m = medirSesgoDeEdad({ nivelVerdadero, simulaciones: 3000, items: 16 });
    console.log(
      `  N${String(nivelVerdadero).padEnd(2)}    ` +
        [0, 3, 8, 16].map((i) => m.enEscalones(i).toFixed(2).padStart(8)).join("") +
        m.errorFinal.toFixed(2).padStart(10) +
        String(m.saltoMaximo).padStart(11),
    );
  }
  console.log(
    "\n  Todo en escalones de la escalera de D-017. El ítem 0 es la semilla pura:\n" +
      "  ahí la edad SÍ manda, y es lo único que se le permite (D-060).\n" +
      "\n  SESGO DE ESTA SIMULACIÓN: los alumnos sintéticos responden con el mismo\n" +
      "  modelo logístico que usa el motor. Prueba que el estimador es consistente\n" +
      "  consigo mismo; NO prueba nada sobre niños reales (mc-13).",
  );
}
