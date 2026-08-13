// guion-esqui.mjs — guion de voz de Larry para el modo "Esquí / Deslizada"
// (docs/planes/2026-08-10-esqui-cadena-operaciones.md).
//
// Módulo de DATOS PURO, intencionalmente sin efectos secundarios: no hace
// `import`, no llama `fetch`, no ejecuta ninguna función al cargarse — solo
// declara `export const`. Así se puede importar desde cualquier script (por
// ejemplo un futuro `gen-voz-esqui.mjs`, siguiendo el patrón de
// `gen-voz-larry.mjs`) sin disparar generación real de audio por accidente.
//
// TODA línea de este archivo tiene `revisadoPor: null`: es borrador de
// primera pasada, sin revisión humana todavía (CLAUDE.md §Contenido — un
// ítem redactado con ayuda de IA siempre pasa por revisión humana antes de
// grabarse o publicarse).
//
// Reglas de tono seguidas aquí (calibradas contra
// scripts/gen-voz-larry.mjs::CAUSAS/ACIERTOS y el plan §1.1):
//   - "safe" nunca dice "mal" / "no sabes" / "fallaste" / "perdiste" /
//     "no pudiste"; abre o incluye siempre un giro de aliento, y al
//     descalificar apunta a LA CADENA/LA CORRIDA, nunca al jugador.
//   - "arcade" (solo esqui.descalifica.arcade.*) es dramático pero sigue
//     apuntando a la cadena/la pista, nunca a la persona ("eres malo en
//     esto" está prohibido aunque el tono sea de choque).
//   - La narración en vivo (esqui.envivo.cadena.*) es SIEMPRE safe/neutra,
//     incluso en PRO, y nunca lleva `{n}` (evita desincronizarse del juego).
//
// Regla técnica de `{n}`: el catálogo de números hablados
// (`packages/tutor/src/voz.ts`) solo cubre 0-21 y 25, y el empalme
// (`partirEnDos()` en gen-voz-larry.mjs) corta la frase en un clip "antes" y
// un clip "después" fijo que no concuerda en género/plural para cualquier
// n. Por eso, en toda línea con `{n}`, el número es literalmente lo último
// del texto, inmediatamente antes del punto final — nunca en medio, nunca
// seguido de una palabra que tenga que concordar con él.

export const GUION_ESQUI = {
  "es-MX": [
    // ── Instrucción de inicio, bandas con cadena (se dice una sola vez) ──
    {
      clave: "esqui.inicio.instruccion",
      texto:
        "Vas a deslizarte sin parar. En cada puerta, elige el carril con el resultado correcto de la cadena. Un solo error termina la corrida, así que fíjate bien antes de decidir.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },

    // ── Instrucción de inicio, KINDER (una por habilidad, más la de formas) ──
    {
      clave: "esqui.inicio.kinder.K01",
      texto:
        "Vas a deslizarte sin parar. Toca las puertas que tengan la cantidad exacta que te diga Larry, de un solo vistazo.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K02",
      texto:
        "Vas a deslizarte sin parar. Reconoce la cantidad al instante y toca esa puerta, sin necesitar contar.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K03",
      texto:
        "Vas a deslizarte sin parar. Cuenta cada punto tocándolo una sola vez, y elige la puerta con ese total.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K06",
      texto:
        "Vas a deslizarte sin parar. El último número que cuentes es cuántos hay en total: elige la puerta con ese número.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K07",
      texto:
        "Vas a deslizarte sin parar. Fíjate cuál montón tiene más, sin necesitar contar los dos, y toca esa puerta.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K13",
      texto:
        "Vas a deslizarte sin parar. Busca la forma que no es igual a las demás y toca esa puerta.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.figura",
      texto: "Vas a deslizarte sin parar. Tienes que pasar por los triángulos.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Aliento en tiempo real, KINDER (muy corto, se repite mucho) ──
    {
      clave: "esqui.kinder.aliento.1",
      texto: "¡Vas muy bien!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.2",
      texto: "¡Así, sigue así!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.3",
      texto: "Ojo con la siguiente.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.4",
      texto: "¡Qué buena racha!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.5",
      texto: "Fíjate bien, ahí viene otra.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.6",
      texto: "¡Eso, tú puedes!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.7",
      texto: "Sigue deslizándote, vas genial.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.8",
      texto: "¡Se ve fácil para ti!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.9",
      texto: "Una más, con calma.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.10",
      texto: "¡Me encanta cómo vas!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Cierre de corrida, KINDER: perfecto (sin ninguna figura perdida) ──
    {
      clave: "esqui.kinder.cierre.perfecto.1",
      texto:
        "¡Increíble! No se te fue ninguna figura. Larry está muy orgulloso de ti.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.perfecto.2",
      texto: "¡Perfecto! Tocaste todas las figuras correctas, sin fallar una sola.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Cierre de corrida, KINDER: casi perfecto (pocas figuras perdidas) ──
    {
      clave: "esqui.kinder.cierre.casi.1",
      texto: "Casi perfecto. Figuras que se te fueron: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.casi.2",
      texto: "¡Muy buena corrida! Figuras que no alcanzaste a tocar: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.casi.3",
      texto:
        "Estuvo muy bien. La próxima vez, fíjate un poco más. Figuras que se te fueron: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Cierre de corrida, KINDER: oportunidad (varias figuras perdidas) ──
    {
      clave: "esqui.kinder.cierre.oportunidad.1",
      texto:
        "Fue una buena práctica, y cada intento ayuda a mejorar. Figuras que se te fueron: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.oportunidad.2",
      texto:
        "Vas aprendiendo con cada corrida. Figuras que no alcanzaste a tocar: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.oportunidad.3",
      texto:
        "Buen intento, la próxima puede salir aún mejor. Figuras que se te fueron: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Descalificación, tono Larry-safe (PRIMARIA tardía) ──
    {
      clave: "esqui.descalifica.safe.1",
      texto: "Está bien, la cadena se rompió aquí. Puertas superadas: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.2",
      texto: "No fue esta vez, pero vas progresando. Puertas superadas: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.3",
      texto: "La cadena se detuvo en esta puerta. Puertas superadas: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.4",
      texto:
        "Casi. La próxima corrida trae números frescos, y puedes intentarlo de nuevo.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.5",
      texto: "Aquí se cerró esta corrida. Puertas superadas: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.6",
      texto: "Buen esfuerzo. Esta cadena llegó hasta aquí. Puertas superadas: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.7",
      texto:
        "La corrida terminó en esta puerta, pero cada intento es una cadena nueva.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.8",
      texto:
        "Está bien, esta vez no se completó la cadena. Puertas superadas: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },

    // ── Descalificación, tono arcade opt-in (SECUNDARIA+/PRO) ──
    {
      clave: "esqui.descalifica.arcade.1",
      texto: "¡CHOCASTE! La cadena se rompió en seco.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.2",
      texto: "¡Boom! La pista te venció esta vez. Puertas superadas: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.3",
      texto:
        "¡Fin de la corrida! La cadena no aguantó el ritmo. Puertas superadas: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.4",
      texto: "¡Se acabó! Esta cadena se estrelló contra la puerta equivocada.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.5",
      texto: "¡CHOCASTE! La pista reclama esta ronda. Puertas superadas: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.6",
      texto:
        "¡Game over para esta corrida! La cadena cayó aquí. Puertas superadas: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.7",
      texto: "¡Impacto total! La cadena no llegó más lejos esta vez.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.8",
      texto: "¡La pista gana esta ronda! La cadena se rompió.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },

    // ── Victoria: cadena completa (todas las bandas con cadena) ──
    {
      clave: "esqui.victoria.1",
      texto: "¡Lo lograste! Completaste la cadena entera.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.2",
      texto: "¡Cadena completa! Puertas superadas: {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.3",
      texto: "¡Increíble deslizada! Pasaste cada puerta sin problema.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.4",
      texto: "¡Meta! Terminaste la corrida completa, de principio a fin.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.5",
      texto: "¡Perfecto! Cruzaste todas las puertas. Total: {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.6",
      texto: "¡Campeón de la pista! Puertas superadas: {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },

    // ── Cuenta atrás antes de arrancar (todas las bandas) ──
    {
      clave: "esqui.cuenta.tres",
      texto: "Tres.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.dos",
      texto: "Dos.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.uno",
      texto: "Uno.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.ya",
      texto: "¡Ya!",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },

    // ── Narración en vivo durante la cadena (siempre safe, sin {n}) ──
    {
      clave: "esqui.envivo.cadena.1",
      texto: "Vas muy bien encadenado.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.2",
      texto: "La cadena sigue firme.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.3",
      texto: "Vas a la mitad del camino.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.4",
      texto: "Buen ritmo, sigue así.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.5",
      texto: "La racha se mantiene fuerte.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.6",
      texto: "Ya llevas un buen tramo.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.7",
      texto: "Sigue concentrado, vas avanzando.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.8",
      texto: "La cadena avanza sin problemas.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // en (mapped to en-GB for synthesis — British spelling used below)
  // ═══════════════════════════════════════════════════════════════════
  en: [
    // ── Start instruction, bands with chain (said once) ──
    {
      clave: "esqui.inicio.instruccion",
      texto:
        "You're going to keep sliding without stopping. At each gate, pick the lane with the correct answer in the chain. A single mistake ends the run, so look carefully before you decide.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },

    // ── Start instruction, KINDER (one per skill, plus the shapes one) ──
    {
      clave: "esqui.inicio.kinder.K01",
      texto:
        "You're going to keep sliding without stopping. Touch the gates that show the exact amount Larry tells you, in a single glance.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K02",
      texto:
        "You're going to keep sliding without stopping. Recognise the amount straight away and touch that gate, without needing to count.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K03",
      texto:
        "You're going to keep sliding without stopping. Count each dot by touching it just once, and pick the gate with that total.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K06",
      texto:
        "You're going to keep sliding without stopping. The last number you count is the total: pick the gate with that number.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K07",
      texto:
        "You're going to keep sliding without stopping. Spot which pile has more, without needing to count both, and touch that gate.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K13",
      texto:
        "You're going to keep sliding without stopping. Find the shape that's different from the rest and touch that gate.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.figura",
      texto: "You're going to keep sliding without stopping. You need to pass through the triangles.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Real-time encouragement, KINDER (very short, repeats a lot) ──
    {
      clave: "esqui.kinder.aliento.1",
      texto: "You're doing great!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.2",
      texto: "That's it, keep it up!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.3",
      texto: "Watch out for the next one.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.4",
      texto: "What a great streak!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.5",
      texto: "Look closely, here comes another one.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.6",
      texto: "That's it, you can do it!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.7",
      texto: "Keep sliding, you're doing brilliantly.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.8",
      texto: "You're making it look easy!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.9",
      texto: "One more, take your time.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.10",
      texto: "I love how you're doing!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Run close, KINDER: perfect (no shape missed) ──
    {
      clave: "esqui.kinder.cierre.perfecto.1",
      texto: "Incredible! You didn't miss a single shape. Larry is really proud of you.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.perfecto.2",
      texto: "Perfect! You touched every correct shape, without missing a single one.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Run close, KINDER: almost perfect (few shapes missed) ──
    {
      clave: "esqui.kinder.cierre.casi.1",
      texto: "Almost perfect. Shapes you missed: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.casi.2",
      texto: "Great run! Shapes you didn't manage to touch: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.casi.3",
      texto: "That was really good. Next time, look a bit more closely. Shapes you missed: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Run close, KINDER: opportunity (several shapes missed) ──
    {
      clave: "esqui.kinder.cierre.oportunidad.1",
      texto: "That was good practice, and every attempt helps you improve. Shapes you missed: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.oportunidad.2",
      texto: "You're learning with every run. Shapes you didn't manage to touch: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.oportunidad.3",
      texto: "Good try, next time could go even better. Shapes you missed: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Disqualification, Larry-safe tone (late PRIMARIA) ──
    {
      clave: "esqui.descalifica.safe.1",
      texto: "That's okay, the chain broke here. Gates cleared: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.2",
      texto: "Not this time, but you're making progress. Gates cleared: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.3",
      texto: "The chain stopped at this gate. Gates cleared: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.4",
      texto: "So close. The next run brings fresh numbers, and you can give it another go.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.5",
      texto: "This run ended here. Gates cleared: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.6",
      texto: "Good effort. This chain made it this far. Gates cleared: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.7",
      texto: "The run ended at this gate, but every attempt is a brand-new chain.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.8",
      texto: "That's okay, the chain wasn't completed this time. Gates cleared: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },

    // ── Disqualification, opt-in arcade tone (SECUNDARIA+/PRO) ──
    {
      clave: "esqui.descalifica.arcade.1",
      texto: "CRASH! The chain snapped clean off.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.2",
      texto: "Boom! The slope beat you this time. Gates cleared: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.3",
      texto: "End of the run! The chain couldn't keep up the pace. Gates cleared: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.4",
      texto: "That's it! This chain crashed into the wrong gate.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.5",
      texto: "CRASH! The slope claims this round. Gates cleared: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.6",
      texto: "Game over for this run! The chain went down here. Gates cleared: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.7",
      texto: "Total impact! The chain didn't make it any further this time.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.8",
      texto: "The slope wins this round! The chain broke.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },

    // ── Victory: full chain (all bands with chain) ──
    {
      clave: "esqui.victoria.1",
      texto: "You did it! You completed the whole chain.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.2",
      texto: "Chain complete! Gates cleared: {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.3",
      texto: "Incredible run! You cleared every gate with no trouble.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.4",
      texto: "Finish line! You completed the whole run, start to finish.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.5",
      texto: "Perfect! You crossed every gate. Total: {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.6",
      texto: "Champion of the slope! Gates cleared: {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },

    // ── Countdown before starting (all bands) ──
    {
      clave: "esqui.cuenta.tres",
      texto: "Three.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.dos",
      texto: "Two.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.uno",
      texto: "One.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.ya",
      texto: "Go!",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },

    // ── Live narration during the chain (always safe, no {n}) ──
    {
      clave: "esqui.envivo.cadena.1",
      texto: "You're chaining these together nicely.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.2",
      texto: "The chain is holding strong.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.3",
      texto: "You're halfway there.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.4",
      texto: "Good pace, keep it up.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.5",
      texto: "The streak is staying strong.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.6",
      texto: "You've covered a good stretch already.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.7",
      texto: "Stay focused, you're making progress.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.8",
      texto: "The chain is moving along smoothly.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // es-ES (peninsular Spanish — no "vosotros", no es-MX regionalisms;
  // "corrida" from es-MX becomes "carrera" here as one lexical marker)
  // ═══════════════════════════════════════════════════════════════════
  "es-ES": [
    // ── Start instruction, bands with chain (said once) ──
    {
      clave: "esqui.inicio.instruccion",
      texto:
        "Vas a deslizarte sin parar. En cada puerta, elige el carril con el resultado correcto de la cadena. Fallar una sola vez termina la carrera, así que fíjate bien antes de decidir.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },

    // ── Start instruction, KINDER (one per skill, plus the shapes one) ──
    {
      clave: "esqui.inicio.kinder.K01",
      texto:
        "Vas a deslizarte sin parar. Toca las puertas que tengan la cantidad exacta que te diga Larry, de un solo vistazo.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K02",
      texto:
        "Vas a deslizarte sin parar. Reconoce la cantidad al instante y toca esa puerta, sin necesidad de contar.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K03",
      texto:
        "Vas a deslizarte sin parar. Cuenta cada punto tocándolo una sola vez, y elige la puerta con ese total.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K06",
      texto:
        "Vas a deslizarte sin parar. El último número que cuentes es el total: elige la puerta con ese número.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K07",
      texto:
        "Vas a deslizarte sin parar. Fíjate en qué montón tiene más, sin necesidad de contar los dos, y toca esa puerta.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K13",
      texto:
        "Vas a deslizarte sin parar. Busca la forma que es distinta a las demás y toca esa puerta.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.figura",
      texto: "Vas a deslizarte sin parar. Tienes que pasar por los triángulos.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Real-time encouragement, KINDER (very short, repeats a lot) ──
    {
      clave: "esqui.kinder.aliento.1",
      texto: "¡Lo estás haciendo genial!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.2",
      texto: "¡Eso es, sigue así!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.3",
      texto: "Atención con la siguiente.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.4",
      texto: "¡Qué buena racha llevas!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.5",
      texto: "Fíjate bien, ahí viene otra.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.6",
      texto: "¡Vamos, tú puedes!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.7",
      texto: "Sigue deslizándote, lo estás haciendo fenomenal.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.8",
      texto: "¡Se te ve fácil!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.9",
      texto: "Una más, con calma.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.10",
      texto: "¡Me encanta cómo lo estás haciendo!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Run close, KINDER: perfect (no shape missed) ──
    {
      clave: "esqui.kinder.cierre.perfecto.1",
      texto:
        "¡Increíble! No se te ha escapado ninguna figura. Larry está muy orgulloso de ti.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.perfecto.2",
      texto: "¡Perfecto! Has tocado todas las figuras correctas, sin fallar ni una.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Run close, KINDER: almost perfect (few shapes missed) ──
    {
      clave: "esqui.kinder.cierre.casi.1",
      texto: "Casi perfecto. Figuras que se te han escapado: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.casi.2",
      texto: "¡Muy buena carrera! Figuras que no has llegado a tocar: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.casi.3",
      texto:
        "Ha estado muy bien. La próxima vez, fíjate un poco más. Figuras que se te han escapado: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Run close, KINDER: opportunity (several shapes missed) ──
    {
      clave: "esqui.kinder.cierre.oportunidad.1",
      texto:
        "Ha sido una buena práctica, y cada intento ayuda a mejorar. Figuras que se te han escapado: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.oportunidad.2",
      texto:
        "Vas aprendiendo con cada carrera. Figuras que no has llegado a tocar: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.oportunidad.3",
      texto:
        "Buen intento, la próxima puede salir aún mejor. Figuras que se te han escapado: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Disqualification, Larry-safe tone (late PRIMARIA) ──
    {
      clave: "esqui.descalifica.safe.1",
      texto: "No pasa nada, la cadena se ha roto aquí. Puertas superadas: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.2",
      texto: "No ha sido esta vez, pero vas progresando. Puertas superadas: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.3",
      texto: "La cadena se ha detenido en esta puerta. Puertas superadas: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.4",
      texto:
        "Casi. La próxima carrera trae números nuevos, y puedes intentarlo de nuevo.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.5",
      texto: "Aquí se ha cerrado esta carrera. Puertas superadas: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.6",
      texto: "Buen esfuerzo. Esta cadena ha llegado hasta aquí. Puertas superadas: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.7",
      texto:
        "La carrera ha terminado en esta puerta, pero cada intento es una cadena nueva.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.8",
      texto:
        "No pasa nada, esta vez no se ha completado la cadena. Puertas superadas: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },

    // ── Disqualification, opt-in arcade tone (SECUNDARIA+/PRO) ──
    {
      clave: "esqui.descalifica.arcade.1",
      texto: "¡Choque! La cadena se ha roto en seco.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.2",
      texto: "¡Boom! La pista te ha ganado esta vez. Puertas superadas: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.3",
      texto:
        "¡Fin de la carrera! La cadena no ha aguantado el ritmo. Puertas superadas: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.4",
      texto: "¡Se ha acabado! Esta cadena se ha estrellado contra la puerta equivocada.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.5",
      texto: "¡Choque! La pista se lleva esta ronda. Puertas superadas: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.6",
      texto:
        "¡Se acabó la partida para esta carrera! La cadena ha caído aquí. Puertas superadas: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.7",
      texto: "¡Impacto total! La cadena no ha llegado más lejos esta vez.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.8",
      texto: "¡La pista gana esta ronda! La cadena se ha roto.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },

    // ── Victory: full chain (all bands with chain) ──
    {
      clave: "esqui.victoria.1",
      texto: "¡Lo has logrado! Has completado la cadena entera.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.2",
      texto: "¡Cadena completa! Puertas superadas: {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.3",
      texto: "¡Qué carrera increíble! Has pasado cada puerta sin problema.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.4",
      texto: "¡Meta! Has terminado la carrera completa, de principio a fin.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.5",
      texto: "¡Perfecto! Has cruzado todas las puertas. Total: {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.6",
      texto: "¡Campeón de la pista! Puertas superadas: {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },

    // ── Countdown before starting (all bands) ──
    {
      clave: "esqui.cuenta.tres",
      texto: "Tres.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.dos",
      texto: "Dos.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.uno",
      texto: "Uno.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.ya",
      texto: "¡Ya!",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },

    // ── Live narration during the chain (always safe, no {n}) ──
    {
      clave: "esqui.envivo.cadena.1",
      texto: "Vas encadenando muy bien.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.2",
      texto: "La cadena sigue firme.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.3",
      texto: "Vas por la mitad del camino.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.4",
      texto: "Buen ritmo, sigue así.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.5",
      texto: "La racha se mantiene fuerte.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.6",
      texto: "Ya llevas un buen tramo.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.7",
      texto: "Sigue concentrado, vas avanzando.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.8",
      texto: "La cadena avanza sin problemas.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // fr-FR — every {n}-final line uses "Label : {n}." so the audio cut
  // never lands on an elision/liaison boundary.
  // ═══════════════════════════════════════════════════════════════════
  "fr-FR": [
    // ── Start instruction, bands with chain (said once) ──
    {
      clave: "esqui.inicio.instruccion",
      texto:
        "Tu vas glisser sans arrêt. À chaque porte, choisis le couloir avec le bon résultat de la chaîne. Une seule erreur termine la descente, alors regarde bien avant de décider.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },

    // ── Start instruction, KINDER (one per skill, plus the shapes one) ──
    {
      clave: "esqui.inicio.kinder.K01",
      texto:
        "Tu vas glisser sans arrêt. Touche les portes qui ont la quantité exacte que Larry te donne, d'un seul coup d'œil.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K02",
      texto:
        "Tu vas glisser sans arrêt. Reconnais la quantité tout de suite et touche cette porte, sans avoir besoin de compter.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K03",
      texto:
        "Tu vas glisser sans arrêt. Compte chaque point en le touchant une seule fois, et choisis la porte avec ce total.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K06",
      texto:
        "Tu vas glisser sans arrêt. Le dernier nombre que tu comptes est le total : choisis la porte avec ce nombre.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K07",
      texto:
        "Tu vas glisser sans arrêt. Repère quel tas en a le plus, sans avoir besoin de compter les deux, et touche cette porte.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K13",
      texto:
        "Tu vas glisser sans arrêt. Trouve la forme qui n'est pas comme les autres et touche cette porte.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.figura",
      texto: "Tu vas glisser sans arrêt. Tu dois passer par les triangles.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Real-time encouragement, KINDER (very short, repeats a lot) ──
    {
      clave: "esqui.kinder.aliento.1",
      texto: "Tu te débrouilles très bien !",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.2",
      texto: "Voilà, continue comme ça !",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.3",
      texto: "Attention à la suivante.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.4",
      texto: "Quelle belle série !",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.5",
      texto: "Regarde bien, une autre arrive.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.6",
      texto: "Allez, tu peux le faire !",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.7",
      texto: "Continue de glisser, tu es formidable.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.8",
      texto: "On dirait que c'est facile pour toi !",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.9",
      texto: "Encore une, tranquillement.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.10",
      texto: "J'adore comment tu t'y prends !",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Run close, KINDER: perfect (no shape missed) ──
    {
      clave: "esqui.kinder.cierre.perfecto.1",
      texto: "Incroyable ! Tu n'as raté aucune forme. Larry est très fier de toi.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.perfecto.2",
      texto: "Parfait ! Tu as touché toutes les bonnes formes, sans en manquer une seule.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Run close, KINDER: almost perfect (few shapes missed) ──
    {
      clave: "esqui.kinder.cierre.casi.1",
      texto: "Presque parfait. Formes ratées : {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.casi.2",
      texto: "Très belle descente ! Formes que tu n'as pas réussi à toucher : {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.casi.3",
      texto:
        "C'était très bien. La prochaine fois, regarde d'un peu plus près. Formes ratées : {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Run close, KINDER: opportunity (several shapes missed) ──
    {
      clave: "esqui.kinder.cierre.oportunidad.1",
      texto:
        "C'était un bon entraînement, et chaque essai t'aide à progresser. Formes ratées : {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.oportunidad.2",
      texto: "Tu apprends à chaque descente. Formes que tu n'as pas réussi à toucher : {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.oportunidad.3",
      texto: "Bon essai, la prochaine fois peut être encore mieux. Formes ratées : {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Disqualification, Larry-safe tone (late PRIMARIA) ──
    {
      clave: "esqui.descalifica.safe.1",
      texto: "Ce n'est rien, la chaîne s'est brisée ici. Portes franchies : {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.2",
      texto: "Ce n'était pas la bonne fois, mais tu progresses. Portes franchies : {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.3",
      texto: "La chaîne s'est arrêtée à cette porte. Portes franchies : {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.4",
      texto:
        "Presque. La prochaine descente apporte des nombres tout neufs, et tu peux réessayer.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.5",
      texto: "C'est ici que cette descente s'est terminée. Portes franchies : {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.6",
      texto: "Bel effort. Cette chaîne est allée jusque-là. Portes franchies : {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.7",
      texto:
        "La descente s'est arrêtée à cette porte, mais chaque essai est une chaîne toute neuve.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.8",
      texto: "Ce n'est rien, la chaîne ne s'est pas terminée cette fois. Portes franchies : {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },

    // ── Disqualification, opt-in arcade tone (SECUNDARIA+/PRO) ──
    {
      clave: "esqui.descalifica.arcade.1",
      texto: "CRASH ! La chaîne s'est brisée net.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.2",
      texto: "Boum ! La piste t'a battu cette fois. Portes franchies : {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.3",
      texto: "Fin de la descente ! La chaîne n'a pas tenu le rythme. Portes franchies : {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.4",
      texto: "C'est fini ! Cette chaîne s'est écrasée sur la mauvaise porte.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.5",
      texto: "CRASH ! La piste remporte cette manche. Portes franchies : {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.6",
      texto: "Game over pour cette descente ! La chaîne est tombée ici. Portes franchies : {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.7",
      texto: "Impact total ! La chaîne n'est pas allée plus loin cette fois.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.8",
      texto: "La piste gagne cette manche ! La chaîne s'est brisée.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },

    // ── Victory: full chain (all bands with chain) ──
    {
      clave: "esqui.victoria.1",
      texto: "Tu l'as fait ! Tu as complété toute la chaîne.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.2",
      texto: "Chaîne complète ! Portes franchies : {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.3",
      texto: "Descente incroyable ! Tu as passé chaque porte sans problème.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.4",
      texto: "Arrivée ! Tu as terminé toute la descente, du début à la fin.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.5",
      texto: "Parfait ! Tu as franchi toutes les portes. Total : {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.6",
      texto: "Champion de la piste ! Portes franchies : {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },

    // ── Countdown before starting (all bands) ──
    {
      clave: "esqui.cuenta.tres",
      texto: "Trois.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.dos",
      texto: "Deux.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.uno",
      texto: "Un.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.ya",
      texto: "Vas-y !",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },

    // ── Live narration during the chain (always safe, no {n}) ──
    {
      clave: "esqui.envivo.cadena.1",
      texto: "Tu enchaînes très bien.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.2",
      texto: "La chaîne tient bon.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.3",
      texto: "Tu es à mi-chemin.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.4",
      texto: "Bon rythme, continue comme ça.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.5",
      texto: "La série reste solide.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.6",
      texto: "Tu as déjà parcouru un bon bout de chemin.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.7",
      texto: "Reste concentré, tu avances.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.8",
      texto: "La chaîne avance sans problème.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // pt-BR (Brazilian Portuguese — "você" address form)
  // ═══════════════════════════════════════════════════════════════════
  "pt-BR": [
    // ── Start instruction, bands with chain (said once) ──
    {
      clave: "esqui.inicio.instruccion",
      texto:
        "Você vai deslizar sem parar. Em cada portão, escolha a pista com o resultado certo da cadeia. Um único erro encerra a corrida, então preste bastante atenção antes de decidir.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },

    // ── Start instruction, KINDER (one per skill, plus the shapes one) ──
    {
      clave: "esqui.inicio.kinder.K01",
      texto:
        "Você vai deslizar sem parar. Toque nos portões que tiverem a quantidade exata que o Larry disser, em uma única olhada.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K02",
      texto:
        "Você vai deslizar sem parar. Reconheça a quantidade na hora e toque nesse portão, sem precisar contar.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K03",
      texto:
        "Você vai deslizar sem parar. Conte cada ponto tocando nele uma única vez, e escolha o portão com esse total.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K06",
      texto:
        "Você vai deslizar sem parar. O último número que você contar é o total: escolha o portão com esse número.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K07",
      texto:
        "Você vai deslizar sem parar. Perceba qual monte tem mais, sem precisar contar os dois, e toque nesse portão.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K13",
      texto:
        "Você vai deslizar sem parar. Ache a forma que é diferente das outras e toque nesse portão.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.figura",
      texto: "Você vai deslizar sem parar. Você precisa passar pelos triângulos.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Real-time encouragement, KINDER (very short, repeats a lot) ──
    {
      clave: "esqui.kinder.aliento.1",
      texto: "Você está indo muito bem!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.2",
      texto: "Isso, continue assim!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.3",
      texto: "Atenção com a próxima.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.4",
      texto: "Que ótima sequência!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.5",
      texto: "Preste atenção, vem outra.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.6",
      texto: "Isso, você consegue!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.7",
      texto: "Continue deslizando, você está arrasando.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.8",
      texto: "Parece fácil para você!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.9",
      texto: "Mais uma, com calma.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.10",
      texto: "Eu adoro como você está indo!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Run close, KINDER: perfect (no shape missed) ──
    {
      clave: "esqui.kinder.cierre.perfecto.1",
      texto:
        "Incrível! Você não perdeu nenhuma forma. O Larry está muito orgulhoso de você.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.perfecto.2",
      texto: "Perfeito! Você tocou todas as formas certas, sem errar nenhuma.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Run close, KINDER: almost perfect (few shapes missed) ──
    {
      clave: "esqui.kinder.cierre.casi.1",
      texto: "Quase perfeito. Formas que passaram: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.casi.2",
      texto: "Ótima corrida! Formas que você não conseguiu tocar: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.casi.3",
      texto:
        "Foi muito bem. Na próxima vez, preste um pouco mais de atenção. Formas que passaram: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Run close, KINDER: opportunity (several shapes missed) ──
    {
      clave: "esqui.kinder.cierre.oportunidad.1",
      texto:
        "Foi um bom treino, e cada tentativa ajuda a melhorar. Formas que passaram: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.oportunidad.2",
      texto: "Você está aprendendo em cada corrida. Formas que você não conseguiu tocar: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.oportunidad.3",
      texto: "Boa tentativa, na próxima pode sair ainda melhor. Formas que passaram: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Disqualification, Larry-safe tone (late PRIMARIA) ──
    {
      clave: "esqui.descalifica.safe.1",
      texto: "Tudo bem, a cadeia quebrou aqui. Portões superados: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.2",
      texto: "Não foi dessa vez, mas você está progredindo. Portões superados: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.3",
      texto: "A cadeia parou neste portão. Portões superados: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.4",
      texto:
        "Quase. A próxima corrida traz números novinhos, e você pode tentar de novo.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.5",
      texto: "Foi aqui que essa corrida terminou. Portões superados: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.6",
      texto: "Bom esforço. Essa cadeia chegou até aqui. Portões superados: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.7",
      texto:
        "A corrida terminou neste portão, mas cada tentativa é uma cadeia nova.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.8",
      texto:
        "Tudo bem, essa cadeia não foi completada dessa vez. Portões superados: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },

    // ── Disqualification, opt-in arcade tone (SECUNDARIA+/PRO) ──
    {
      clave: "esqui.descalifica.arcade.1",
      texto: "BATEU! A cadeia quebrou na hora.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.2",
      texto: "Bum! A pista venceu você dessa vez. Portões superados: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.3",
      texto: "Fim da corrida! A cadeia não aguentou o ritmo. Portões superados: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.4",
      texto: "Acabou! Essa cadeia se espatifou no portão errado.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.5",
      texto: "BATEU! A pista fica com essa rodada. Portões superados: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.6",
      texto: "Game over para essa corrida! A cadeia caiu aqui. Portões superados: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.7",
      texto: "Impacto total! A cadeia não chegou mais longe dessa vez.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.8",
      texto: "A pista ganha essa rodada! A cadeia quebrou.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },

    // ── Victory: full chain (all bands with chain) ──
    {
      clave: "esqui.victoria.1",
      texto: "Você conseguiu! Completou a cadeia inteira.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.2",
      texto: "Cadeia completa! Portões superados: {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.3",
      texto: "Corrida incrível! Você passou por cada portão sem problema.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.4",
      texto: "Chegada! Você terminou a corrida inteira, do início ao fim.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.5",
      texto: "Perfeito! Você cruzou todos os portões. Total: {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.6",
      texto: "Campeão da pista! Portões superados: {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },

    // ── Countdown before starting (all bands) ──
    {
      clave: "esqui.cuenta.tres",
      texto: "Três.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.dos",
      texto: "Dois.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.uno",
      texto: "Um.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.ya",
      texto: "Já!",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },

    // ── Live narration during the chain (always safe, no {n}) ──
    {
      clave: "esqui.envivo.cadena.1",
      texto: "Você está encadeando muito bem.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.2",
      texto: "A cadeia continua firme.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.3",
      texto: "Você está na metade do caminho.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.4",
      texto: "Bom ritmo, continue assim.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.5",
      texto: "A sequência continua forte.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.6",
      texto: "Você já percorreu um bom trecho.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.7",
      texto: "Continue concentrado, você está avançando.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.8",
      texto: "A cadeia avança sem problemas.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // pt-PT (European Portuguese — "tu" address form, personal infinitive;
  // written independently from pt-BR, not copied and tweaked)
  // ═══════════════════════════════════════════════════════════════════
  "pt-PT": [
    // ── Start instruction, bands with chain (said once) ──
    {
      clave: "esqui.inicio.instruccion",
      texto:
        "Vais deslizar sem parar. Em cada portão, escolhe a pista com o resultado certo da cadeia. Um único erro termina a corrida, por isso presta bem atenção antes de decidires.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },

    // ── Start instruction, KINDER (one per skill, plus the shapes one) ──
    {
      clave: "esqui.inicio.kinder.K01",
      texto:
        "Vais deslizar sem parar. Toca nos portões que tenham a quantidade exata que o Larry disser, num único olhar.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K02",
      texto:
        "Vais deslizar sem parar. Reconhece a quantidade de imediato e toca nesse portão, sem precisares de contar.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K03",
      texto:
        "Vais deslizar sem parar. Conta cada ponto tocando-lhe uma única vez, e escolhe o portão com esse total.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K06",
      texto:
        "Vais deslizar sem parar. O último número que contares é o total: escolhe o portão com esse número.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K07",
      texto:
        "Vais deslizar sem parar. Repara em qual monte tem mais, sem precisares de contar os dois, e toca nesse portão.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K13",
      texto:
        "Vais deslizar sem parar. Encontra a forma que é diferente das outras e toca nesse portão.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.figura",
      texto: "Vais deslizar sem parar. Tens de passar pelos triângulos.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Real-time encouragement, KINDER (very short, repeats a lot) ──
    {
      clave: "esqui.kinder.aliento.1",
      texto: "Estás a ir muito bem!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.2",
      texto: "Boa, continua assim!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.3",
      texto: "Atenção à próxima.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.4",
      texto: "Que sequência fantástica!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.5",
      texto: "Presta atenção, vem aí outra.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.6",
      texto: "Força, tu consegues!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.7",
      texto: "Continua a deslizar, estás fantástico.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.8",
      texto: "Parece fácil para ti!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.9",
      texto: "Mais uma, com calma.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.10",
      texto: "Adoro a forma como estás a ir!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Run close, KINDER: perfect (no shape missed) ──
    {
      clave: "esqui.kinder.cierre.perfecto.1",
      texto:
        "Incrível! Não te escapou nenhuma forma. O Larry está muito orgulhoso de ti.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.perfecto.2",
      texto: "Perfeito! Tocaste em todas as formas certas, sem falhar nenhuma.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Run close, KINDER: almost perfect (few shapes missed) ──
    {
      clave: "esqui.kinder.cierre.casi.1",
      texto: "Quase perfeito. Formas que te escaparam: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.casi.2",
      texto: "Ótima corrida! Formas que não conseguiste tocar: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.casi.3",
      texto:
        "Correu muito bem. Da próxima vez, presta um pouco mais de atenção. Formas que te escaparam: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Run close, KINDER: opportunity (several shapes missed) ──
    {
      clave: "esqui.kinder.cierre.oportunidad.1",
      texto:
        "Foi um bom treino, e cada tentativa ajuda a melhorar. Formas que te escaparam: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.oportunidad.2",
      texto: "Estás a aprender com cada corrida. Formas que não conseguiste tocar: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.oportunidad.3",
      texto: "Boa tentativa, da próxima pode correr ainda melhor. Formas que te escaparam: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Disqualification, Larry-safe tone (late PRIMARIA) ──
    {
      clave: "esqui.descalifica.safe.1",
      texto: "Não faz mal, a cadeia quebrou aqui. Portões superados: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.2",
      texto: "Não foi desta vez, mas estás a progredir. Portões superados: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.3",
      texto: "A cadeia parou neste portão. Portões superados: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.4",
      texto:
        "Quase. A próxima corrida traz números novos, e podes tentar outra vez.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.5",
      texto: "Foi aqui que esta corrida terminou. Portões superados: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.6",
      texto: "Bom esforço. Esta cadeia chegou até aqui. Portões superados: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.7",
      texto:
        "A corrida terminou neste portão, mas cada tentativa é uma cadeia nova.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.8",
      texto:
        "Não faz mal, esta cadeia não se completou desta vez. Portões superados: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },

    // ── Disqualification, opt-in arcade tone (SECUNDARIA+/PRO) ──
    {
      clave: "esqui.descalifica.arcade.1",
      texto: "BATESTE! A cadeia quebrou-se num instante.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.2",
      texto: "Bum! A pista venceu-te desta vez. Portões superados: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.3",
      texto: "Fim da corrida! A cadeia não aguentou o ritmo. Portões superados: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.4",
      texto: "Acabou! Esta cadeia despenhou-se no portão errado.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.5",
      texto: "BATESTE! A pista fica com esta ronda. Portões superados: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.6",
      texto: "Game over para esta corrida! A cadeia caiu aqui. Portões superados: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.7",
      texto: "Impacto total! A cadeia não foi mais longe desta vez.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.8",
      texto: "A pista ganha esta ronda! A cadeia quebrou-se.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },

    // ── Victory: full chain (all bands with chain) ──
    {
      clave: "esqui.victoria.1",
      texto: "Conseguiste! Completaste a cadeia toda.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.2",
      texto: "Cadeia completa! Portões superados: {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.3",
      texto: "Corrida incrível! Passaste por todos os portões sem problema.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.4",
      texto: "Meta! Terminaste a corrida completa, do início ao fim.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.5",
      texto: "Perfeito! Atravessaste todos os portões. Total: {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.6",
      texto: "Campeão da pista! Portões superados: {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },

    // ── Countdown before starting (all bands) ──
    {
      clave: "esqui.cuenta.tres",
      texto: "Três.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.dos",
      texto: "Dois.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.uno",
      texto: "Um.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.ya",
      texto: "Já!",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },

    // ── Live narration during the chain (always safe, no {n}) ──
    {
      clave: "esqui.envivo.cadena.1",
      texto: "Estás a encadear muito bem.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.2",
      texto: "A cadeia continua firme.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.3",
      texto: "Estás a meio caminho.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.4",
      texto: "Bom ritmo, continua assim.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.5",
      texto: "A sequência mantém-se forte.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.6",
      texto: "Já percorreste um bom trecho.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.7",
      texto: "Continua concentrado, estás a avançar.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.8",
      texto: "A cadeia avança sem problemas.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // de-DE — {n}-final lines use "Label: {n}." so the number always sits
  // last, with no case-inflected word following it.
  // ═══════════════════════════════════════════════════════════════════
  "de-DE": [
    // ── Start instruction, bands with chain (said once) ──
    {
      clave: "esqui.inicio.instruccion",
      texto:
        "Du gleitest ohne Halt. An jedem Tor wählst du die Spur mit dem richtigen Ergebnis der Kette. Ein einziger Fehler beendet den Lauf, also schau genau hin, bevor du dich entscheidest.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },

    // ── Start instruction, KINDER (one per skill, plus the shapes one) ──
    {
      clave: "esqui.inicio.kinder.K01",
      texto:
        "Du gleitest ohne Halt. Berühre die Tore mit der genauen Menge, die Larry dir sagt, auf einen einzigen Blick.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K02",
      texto:
        "Du gleitest ohne Halt. Erkenne die Menge sofort und berühre dieses Tor, ohne zählen zu müssen.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K03",
      texto:
        "Du gleitest ohne Halt. Zähle jeden Punkt, indem du ihn genau einmal berührst, und wähle das Tor mit dieser Gesamtzahl.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K06",
      texto:
        "Du gleitest ohne Halt. Die letzte Zahl, die du zählst, ist die Gesamtzahl: wähle das Tor mit dieser Zahl.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K07",
      texto:
        "Du gleitest ohne Halt. Erkenne, welcher Haufen mehr hat, ohne beide zählen zu müssen, und berühre dieses Tor.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.K13",
      texto:
        "Du gleitest ohne Halt. Suche die Form, die anders ist als die anderen, und berühre dieses Tor.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.inicio.kinder.figura",
      texto: "Du gleitest ohne Halt. Du musst durch die Dreiecke fahren.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Real-time encouragement, KINDER (very short, repeats a lot) ──
    {
      clave: "esqui.kinder.aliento.1",
      texto: "Du machst das super!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.2",
      texto: "Genau so, weiter so!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.3",
      texto: "Pass auf beim nächsten.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.4",
      texto: "Was für eine tolle Serie!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.5",
      texto: "Schau genau hin, gleich kommt das nächste.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.6",
      texto: "Los, du schaffst das!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.7",
      texto: "Gleite weiter, du bist großartig.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.8",
      texto: "Das sieht so leicht aus für dich!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.9",
      texto: "Noch eins, ganz in Ruhe.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.aliento.10",
      texto: "Ich liebe, wie du das machst!",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Run close, KINDER: perfect (no shape missed) ──
    {
      clave: "esqui.kinder.cierre.perfecto.1",
      texto: "Unglaublich! Dir ist keine einzige Form entgangen. Larry ist sehr stolz auf dich.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.perfecto.2",
      texto: "Perfekt! Du hast alle richtigen Formen berührt, ohne eine einzige zu verpassen.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Run close, KINDER: almost perfect (few shapes missed) ──
    {
      clave: "esqui.kinder.cierre.casi.1",
      texto: "Fast perfekt. Verpasste Formen: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.casi.2",
      texto: "Sehr guter Lauf! Formen, die du nicht berühren konntest: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.casi.3",
      texto: "Das war sehr gut. Schau nächstes Mal etwas genauer hin. Verpasste Formen: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Run close, KINDER: opportunity (several shapes missed) ──
    {
      clave: "esqui.kinder.cierre.oportunidad.1",
      texto:
        "Das war eine gute Übung, und jeder Versuch hilft dir, besser zu werden. Verpasste Formen: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.oportunidad.2",
      texto: "Du lernst mit jedem Lauf. Formen, die du nicht berühren konntest: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },
    {
      clave: "esqui.kinder.cierre.oportunidad.3",
      texto: "Guter Versuch, nächstes Mal kann es noch besser laufen. Verpasste Formen: {n}.",
      tono: "safe",
      banda: "kinder",
      revisadoPor: null,
    },

    // ── Disqualification, Larry-safe tone (late PRIMARIA) ──
    {
      clave: "esqui.descalifica.safe.1",
      texto: "Kein Problem, die Kette ist hier gerissen. Erreichte Tore: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.2",
      texto: "Diesmal hat es nicht geklappt, aber du machst Fortschritte. Erreichte Tore: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.3",
      texto: "Die Kette ist an diesem Tor stehen geblieben. Erreichte Tore: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.4",
      texto:
        "Fast. Der nächste Lauf bringt frische Zahlen, und du kannst es noch einmal versuchen.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.5",
      texto: "Hier ist dieser Lauf zu Ende gegangen. Erreichte Tore: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.6",
      texto: "Gute Leistung. Diese Kette ist bis hierher gekommen. Erreichte Tore: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.7",
      texto:
        "Der Lauf ist an diesem Tor zu Ende gegangen, aber jeder Versuch ist eine neue Kette.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.safe.8",
      texto: "Kein Problem, diesmal wurde die Kette nicht vollendet. Erreichte Tore: {n}.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },

    // ── Disqualification, opt-in arcade tone (SECUNDARIA+/PRO) ──
    {
      clave: "esqui.descalifica.arcade.1",
      texto: "CRASH! Die Kette ist abrupt gerissen.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.2",
      texto: "Bumm! Die Piste hat dich diesmal geschlagen. Erreichte Tore: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.3",
      texto: "Ende des Laufs! Die Kette konnte das Tempo nicht halten. Erreichte Tore: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.4",
      texto: "Vorbei! Diese Kette ist am falschen Tor zerschellt.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.5",
      texto: "CRASH! Die Piste holt sich diese Runde. Erreichte Tore: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.6",
      texto: "Game Over für diesen Lauf! Die Kette ist hier gefallen. Erreichte Tore: {n}.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.7",
      texto: "Voller Aufprall! Die Kette ist diesmal nicht weiter gekommen.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },
    {
      clave: "esqui.descalifica.arcade.8",
      texto: "Die Piste gewinnt diese Runde! Die Kette ist gerissen.",
      tono: "arcade",
      banda: "secundaria-pro",
      revisadoPor: null,
    },

    // ── Victory: full chain (all bands with chain) ──
    {
      clave: "esqui.victoria.1",
      texto: "Du hast es geschafft! Du hast die ganze Kette vollendet.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.2",
      texto: "Kette vollständig! Erreichte Tore: {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.3",
      texto: "Unglaublicher Lauf! Du bist durch jedes Tor gekommen, ohne Probleme.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.4",
      texto: "Ziel! Du hast den ganzen Lauf beendet, von Anfang bis Ende.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.5",
      texto: "Perfekt! Du hast alle Tore durchquert. Gesamt: {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.victoria.6",
      texto: "Champion der Piste! Erreichte Tore: {n}.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },

    // ── Countdown before starting (all bands) ──
    {
      clave: "esqui.cuenta.tres",
      texto: "Drei.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.dos",
      texto: "Zwei.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.uno",
      texto: "Eins.",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },
    {
      clave: "esqui.cuenta.ya",
      texto: "Los!",
      tono: "safe",
      banda: "todas",
      revisadoPor: null,
    },

    // ── Live narration during the chain (always safe, no {n}) ──
    {
      clave: "esqui.envivo.cadena.1",
      texto: "Du reihst das sehr gut aneinander.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.2",
      texto: "Die Kette hält stabil.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.3",
      texto: "Du bist auf halbem Weg.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.4",
      texto: "Gutes Tempo, weiter so.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.5",
      texto: "Die Serie bleibt stark.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.6",
      texto: "Du hast schon eine gute Strecke geschafft.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.7",
      texto: "Bleib konzentriert, du kommst voran.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
    {
      clave: "esqui.envivo.cadena.8",
      texto: "Die Kette läuft ohne Probleme weiter.",
      tono: "safe",
      banda: "primaria-tardia",
      revisadoPor: null,
    },
  ],
};
