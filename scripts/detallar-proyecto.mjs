#!/usr/bin/env node
// Escribe el cuerpo detallado de cada fase en el proyecto de GitHub.
//
//   node scripts/detallar-proyecto.mjs [numero-de-proyecto]
//
// Por qué el detalle vive aquí y no solo en el master-plan: el master-plan
// explica el proyecto a una persona que llega de cero; esto le dice a quien va
// a construir la fase **cómo sabrá que terminó**. Son dos documentos distintos
// con dos lectores distintos, y confundirlos fue lo que dejó a F0 "cerrada"
// cuando no lo estaba — hasta que alguien preguntó y hubo que comprobar
// criterio por criterio.
//
// Regla de redacción: **todo criterio de aceptación tiene que poder correrse o
// mirarse.** "PWA instalable" no es criterio; "audits/pwa-installable.mjs pasa"
// sí. Si un criterio no se puede verificar, es una intención.
//
// Idempotente: se puede volver a correr tras editar la tabla.

import { execFileSync } from "node:child_process";

const proyecto = process.argv[2] ?? "1";
const DUENO = "kilowatto";
const gh = (...a) => execFileSync("gh", a, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });

const D = (s) => s.trim();

const CUERPOS = {
  "S0": D(`
**Vía:** Sitio abierto · **Depende de:** nada — puede arrancar hoy
**Decisiones:** D-033 · **Investigación:** mc-48

### Qué queda funcionando
El esqueleto de math.kilowatto.com como sitio público: rutas en los 7 locales,
hreflang recíproco con auto-referencia y x-default, JSON-LD por página, y el
aviso de que el proyecto es de código abierto con enlace al repo.

### Criterios de aceptación — todos verificables
- [ ] \`audits/hreflang-recip.mjs\` pasa: los 7 locales + x-default, recíprocos
- [ ] \`audits/jsonld-valid.mjs\` pasa y el JSON-LD **coincide con lo visible**
      (si no coincide, Google ignora el marcado entero — mc-48)
- [ ] Cero peticiones a terceros (verificable en \`audits/live.mjs\`)
- [ ] LCP ≤2.5s / CLS ≤0.1 / INP ≤150ms en Android de gama baja sobre 4G lento
- [ ] Enlace visible a github.com/kilowatto/math-challenge en cada página

### Qué NO incluye
El corpus de investigación (S1) ni la página de origen (S2).
`),
  "S1": D(`
**Vía:** Sitio abierto · **Depende de:** S0
**Decisiones:** D-033 · **Investigación:** mc-48

### Qué queda funcionando
Las 47 investigaciones publicadas e indexables, **con las que contradicen al
producto incluidas**. Esa es la decisión, no un descuido: mc-48 documenta que
la investigación original es el activo de contenido de mayor valor y 2.3× más
probable de ser citada en AI Overviews — y la credibilidad viene de publicar
también lo que incomoda.

### Criterios de aceptación
- [ ] 47 documentos con URL propia, indexable, en los locales que decida el dueño
- [ ] Cada uno con fuentes, limitaciones y marcas \`[unverified]\` **visibles**
- [ ] JSON-LD tipo ScholarlyArticle o Article, coincidente con la página
- [ ] Los pasajes que contradicen decisiones del producto salen publicados
- [ ] Autor firmado (T abierta: quién firma la investigación)

### Riesgo conocido
Publicar en 7 locales multiplica por 7 el trabajo de traducción de ~157,000
palabras. Decidir si son 7 o 2 antes de empezar.
`),
  "S2": D(`
**Vía:** Sitio abierto · **Depende de:** S0
**Decisiones:** D-033

### Qué queda funcionando
La página de origen desde \`docs/por-que-existe.md\`, los 12 niveles explicados,
el propósito, y la arquitectura técnica atribuida a **Ignia sobre Cloudflare**.

### Criterios de aceptación
- [ ] Página de origen publicada, conservando la palabra "adictivo" y lo que la
      investigación le hizo — es lo que hace creíble el resto
- [ ] Los 12 niveles explicados sin nombres de grado escolar (mc-15: las
      fracciones se introducen entre los 6 y 9 años según el país)
- [ ] Atribución "Un proyecto de Ignia, sobre Cloudflare" con enlace a ignia.cloud
- [ ] **Sección de código abierto**: qué licencia, qué se puede reusar, cómo
      contribuir, y enlace al tablero público del plan
`),
  "F0": D(`
**Vía:** Producto · **CERRADA** ✅
**Decisiones:** D-022, D-023, D-030

### Verificado, no afirmado
\`node audits/live.mjs\` → 21 comprobaciones en vivo:
- Worker en math.kilowatto.com, 7 rutas de locale respondiendo 200
- D1 \`math-challenge-db\` con 11 tablas
- Cero peticiones a terceros · hreflang recíproco + x-default
- HTTP/3 (\`alt-svc: h3=":443"\`) **y 0-RTT** (max early data 14336)
- RPC nativo web→ingest→D1 probado en vivo
- 7 auditores deterministas bloqueando en gancho pre-commit
- Página más pesada: 2.1 KB gz

### Lección que dejó
Estuvo marcada "cerrada" con el 0-RTT sin verificar, y solo salió al preguntar
"¿ahora sí está cerrado?". **Una fase no se cierra por criterio propio; se
cierra corriendo sus criterios.**
`),
  "F1": D(`
**Vía:** Producto · **Depende de:** F0 · **CERRADA** ✅
**Decisiones:** D-032, D-035 · **Investigación:** mc-47 §7

### Los 23 auditores, corriendo
Sobre Workers AI (\`kimi-k2.6\` → \`gpt-oss-120b\`), sin CI. Se corren a mano
antes de abrir el PR: \`node audits/adversarial.mjs\`.

Corrida real de cierre: **23 auditores, 0 errores, ~$1.29, ~15 min.**
3 bloquean · 22 reportan · 2 descartados por la regla 1.

### Las dos reglas de D-032, en código y ejercidas
**Regla 1 — citar la decisión.** Tres capas, todas deterministas:
1. \`citas.mjs\` — la cita existe en el repo. Atrapó \`D-036\`, que yo inventé.
2. La cita está **en la carta de ese auditor**. En la corrida real descartó a
   \`anti-trampa\` citando \`LR-3\`: existe, pero no es suya.
3. \`evidencia.mjs\` — **la evidencia citada existe de verdad.** Nació de que un
   auditor citó D-022 (real) y afirmó ver \`"versión"\` donde el archivo dice
   \`"versão"\`. Cita válida, evidencia inventada, veredicto bloqueante.

**Regla 2 — anular por escrito.** Ejercida sobre los 3 bloqueantes reales de la
corrida de cierre: **0 bloquean, 3 anuladas**, cada una con su razón en
\`ANULACIONES.md\`. Al hacerlo salió un defecto: la huella usaba el campo
\`archivo\` crudo, y el modelo escribió ahí dos rutas separadas por coma — una
anulación que no empareja es un mecanismo roto sin avisar. Corregido.

### SARIF 2.1.0 → GitHub code scanning
25 alertas vivas, ancladas a \`archivo:línea\`, con \`D-0nn\`/\`mc-nn\` como
identificadores de regla y \`helpUri\` al documento. Subido por API REST, **sin
GitHub Actions**. Validado contra el esquema oficial de OASIS en cada corrida —
así se detectaron dos defectos que 20 pruebas escritas a mano no podían ver.

Los 22 hallazgos de seguimiento están en Issues, etiquetados por auditor.

### Criterios de cierre
- [x] Segundo filtro determinista de evidencia, probado contra el caso real
- [x] Anulación ejercida de punta a punta sobre bloqueantes reales
- [x] SARIF real subido y procesado: 25 alertas en code scanning
- [x] 61 comprobaciones sin gastar una llamada · pipeline completo en el gancho

### Lo que la flota NO puede hacer, medido
Un auditor que **parafrasea** en vez de citar no deja cadenas que verificar y
pasa sin comprobación. Se detecta la fabricación literal, no la interpretación
equivocada — el mismo \`locale-pt-PT\` afirmó que el portugués europeo no
antepone artículo a nombres propios, cuando es al revés. Eso no tiene arreglo
determinista, y por eso **ningún veredicto de la flota se aplica sin leerlo**.

### Criterio retirado, porque estaba mal especificado
"Caché de prefijo por encima del 7%" no era un defecto: la constitución
compartida son ~1,836 tokens de un turno medio de ~34,000. El 7% es la
aritmética, no una falla.
`),
  "F2": D(`
**Vía:** Producto · **Depende de:** F0
**Decisiones:** D-011, D-012, D-013, D-026 · **Investigación:** mc-25, mc-27, mc-45

### Qué queda funcionando
Las tres puertas de registro de **2 campos**, perfiles de hijo, entrada del niño
con avatar + PIN de imágenes, verificación del maestro antes de crear salón, y
las cinco marcas contextuales (no carrusel — D-026, NN/g).

### Criterios de aceptación
- [ ] Registro en 2 campos, sin carrusel de onboarding
- [ ] El niño entra **sin escribir**: avatar + PIN de imágenes (línea roja #3)
- [ ] \`audits/child-free-text.mjs\` sigue pasando con el esquema nuevo
- [ ] Ninguna tabla de niño guarda nombre real, correo, foto ni fecha exacta
      de nacimiento — solo año y mes (línea roja #2)
- [ ] Cada \`classroom_membership\` guarda **quién aprobó, cuándo y qué se
      comparte**: esa fila es el consentimiento y es auditable
- [ ] Un maestro no puede crear salón sin verificación previa

### Criterios que aportó la flota (issues #17-#22, cerrados aquí)
El auditor \`ux-banda\` levantó seis sobre \`Base.astro\`. Son ciertos y llegaban
antes de tiempo: no hay interfaz de niño que adaptar hasta esta fase.

- [ ] La interfaz varía por banda de edad — los 5 temas visuales de D-017
- [ ] Blancos táctiles: 24px WCAG / 44px HIG / **88px kinder** (\`mc-38\`)
- [ ] Tema oscuro para adolescentes y adultos (\`mc-22\`, \`mc-23\`)
- [ ] Tipografía diferenciada KINDER vs PRIMARIA (\`mc-21\`) — y en KINDER
      **nunca Light**: \`mc-20\` exige alto grosor de trazo
- [ ] El naranja de Ignia **nunca** como texto normal sobre claro: 3.03:1,
      por debajo del 4.5:1 de WCAG. Ya vigilado por \`audits/brand-image.mjs\`
- [ ] Adaptación por plataforma **y** por banda a la vez (D-031 + D-017),
      con la tipografía repartida según D-036

### Por qué importa para la flota
Primera fase donde tocan a la vez esquema de menores, consentimiento y texto
libre. \`privacidad\`, \`lineas-rojas\` y \`child-free-text\` despiertan juntos.
`),
  "F3": D(`
**Vía:** Producto · **Depende de:** F2
**Decisiones:** D-010, D-018, D-024 · **Investigación:** mc-29, mc-36

### Qué queda funcionando
Los 5 formatos táctiles, un reto de práctica de punta a punta, y **puntuación
del lado del servidor**.

### Criterios de aceptación
- [ ] El servidor cronometra y califica. Un puntaje calculado en el cliente y
      sincronizado después es el vector de trampa más obvio (mc-33 impl. 7)
- [ ] Kinder usa \`valor_del_ítem · acc\`, **sin tiempo** — con \`a=0\` la regla
      HSHS da cero para toda respuesta (D-024)
- [ ] De primaria en adelante: \`score = a · (d − RT) · (2·acc − 1)\`
- [ ] Borrar o corregir **nunca** penaliza (línea roja #8, mc-30: cambiar una
      respuesta mejora la calificación el 79% de las veces)
- [ ] El intento crudo va a Analytics Engine, **jamás a D1** (mc-32 riesgo #1);
      \`audits/no-attempts-in-d1.mjs\` lo vigila
- [ ] \`recordAttempt()\` implementado — hoy lanza a propósito
- [ ] Los números se renderizan con la convención del locale activo, consumiendo
      \`MATH_CONVENTIONS\` (hoy la tabla existe y no la usa nadie — anulación
      escrita en \`ANULACIONES.md\` que caduca al arrancar esta fase)

### Criterios que aportó la flota (issues #5-#10, cerrados aquí)
El auditor \`pedagogia\` levantó seis contra el master-plan. El plan sí los
especifica; lo que falta es el código, y el código es esta fase y F5.

- [ ] **Ejemplo trabajado antes de la práctica** (\`mc-04\`, carga cognitiva)
- [ ] **Espaciado e intercalado** implementados, no solo planeados (\`mc-05\`:
      mezclar duele en la sesión y **duplica** el desempeño al día siguiente)
- [ ] La retroalimentación **nombra el error**, no dice solo bien/mal (\`mc-11\`)
      — es lo que exige el arreglo de errores con causa nombrada del ítem
- [ ] La variación entre ítems de una serie es explícita, no azarosa (\`mc-02\`)
- [ ] Los retos traen contexto y apertura, no son cálculo pelón (\`mc-36\`)
- [ ] El modo historia tiene fase de exploración y de síntesis (\`mc-01\`)
`),
  "F4": D(`
**Vía:** Producto · **Depende de:** F3
**Decisiones:** D-002 · **Investigación:** mc-13, mc-44, mc-05

### Criterios de aceptación
- [ ] Ubicación adaptativa por tema, separada de la edad (D-002: la edad manda
      el tema visual, la ubicación manda la dificultad)
- [ ] Un Durable Object por niño para el modelo adaptativo
- [ ] Repaso espaciado e intercalado — mc-05: mezclar duele durante la sesión y
      **duplica** el desempeño al día siguiente
- [ ] La selección del siguiente ítem no repite el mismo error dos veces seguidas
`),
  "F5 ": D(`
**Vía:** Producto · **RUTA CRÍTICA** · **Depende de:** esquema de ítem (§9)
**Decisiones:** D-006, D-009, D-022 · **Investigación:** mc-34, mc-36, mc-40

### Qué queda funcionando
~400 ítems × **7 locales**, 2,500 retos curados, 14 habilidades, arte de la Sabana.

### Por qué es la ruta crítica
Son **siete autores nativos, no cinco**: \`es-MX\` y \`es-ES\` no comparten
separador decimal ni formato de división larga; \`pt-BR\` y \`pt-PT\` no comparten
escala numérica (mc-34, D-022). El contenido matemático **no se traduce, se
autora**.

### Criterios de aceptación
- [ ] Todo ítem guardado como **estructura**, jamás como texto ya formado
- [ ] Todo ítem trae su arreglo de **errores con causa nombrada** — es lo que
      permite que Larry sepa *qué* error se cometió, no solo que falló
- [ ] Todo ítem redactado con IA pasó por revisión humana (mc-40: los modelos
      escriben distractores válidos pero son malos anticipando errores reales)
- [ ] La unidad de diseño es **la serie**, no la pregunta suelta (D-018)
- [ ] \`audits/locales-complete.mjs\` pasa sobre el banco entero
`),
  "F5b": D(`
**Vía:** Producto · **Depende de:** F5
**Decisiones:** D-034 · **Investigación:** mc-12

### Qué queda funcionando
~150 ítems N8-N10, autorados una vez y renderizados en 7 notaciones. Sin Sabana,
sin modo historia.

### ⚠️ Contradicción abierta, encontrada por la flota
El master-plan dice **"sin curaduría por serie"**, y D-018 dice que **"la unidad
de diseño es la serie, no la pregunta suelta"**. El auditor \`pedagogia\` lo marcó
como bloqueante y tiene razón: son incompatibles.

**Hay que resolverlo antes de construir**, y solo hay dos salidas honestas:
curar la franja adulta como series igual que F5, o **enmendar D-018
explícitamente** — no dejar la renuncia escondida en el plan como si fuera una
característica neutral de costo.
`),
  "F6": D(`
**Vía:** Producto · **Depende de:** F3, F5
**Decisiones:** D-004, D-015, D-029, D-035 · **Investigación:** mc-37, mc-11

### Qué queda funcionando
Explicación pregenerada al cerrar el reto + Workers AI en vivo con ruteo por
banda y tope de gasto, voz en los siete locales.

### Criterios de aceptación
- [ ] Larry **nunca calcula**: recibe el veredicto ya calculado y solo lo explica
      (línea roja #7, patrón de \`contador/explain.ts\`)
- [ ] Larry **nunca avergüenza** a un niño por equivocarse
- [ ] Un prompt por locale, no "cada línea escrita dos veces" — ese patrón no
      escala a 7 idiomas (mc-37)
- [ ] En kinder **la voz es la interfaz**: el niño no lee, Larry habla
- [ ] Tope de gasto por perfil y por día vía AI Gateway
- [ ] La explicación pregenerada funciona **offline y sin modelo**

### ⚠️ Condición de la banda Pro (D-035)
Antes de soltar Pro con explicación en vivo hay que **medir \`kimi-k2.6\` contra
explicaciones avanzadas revisadas por humano**. Si no pasa, la salida NO es
volver a Claude —eso lo cierra D-035— sino dejar Pro con explicación
pregenerada. Una explicación de cálculo tensorial incorrecta **enseña error**.
`),
  "F7": D(`
**Vía:** Producto · **Depende de:** F4
**Decisiones:** D-003, D-014, D-016, D-025 · **Investigación:** mc-16, mc-17, mc-18

### Criterios de aceptación
- [ ] La racha **nunca se rompe** por respetar el límite de pantalla, y la
      protección de racha **jamás se vende** (línea roja #6)
- [ ] Sin moneda comprable ni recompensas aleatorias de pago — las cajas de
      botín son juego ilegal en Bélgica y Países Bajos (línea roja #5)
- [ ] Ligas de ~30 pares anónimos, un Durable Object por liga (no uno global)
- [ ] Tablero con **alias generados**: sin nombre real, sin foto, sin ciudad
- [ ] El tablero global ordena por puntos, no por θ (D-025 — divergencia
      documentada respecto a mc-18)
- [ ] Ninguna superficie muestra últimos lugares
`),
  "F8": D(`
**Vía:** Producto · **Depende de:** F2
**Decisiones:** D-016, D-021 · **Investigación:** mc-26, mc-41

### Criterios de aceptación
- [ ] Corte de pantalla **suave**: aviso a los 5 minutos y despedida de Larry.
      Nunca corte seco a media respuesta (D-016)
- [ ] **Nunca se cobra por dejar que un niño practique** (línea roja #4). Se
      cobra el acompañamiento al padre
- [ ] Sin cuenta regresiva de escasez, sin consentimiento preseleccionado, sin
      cancelación más difícil que la suscripción (D-014)
- [ ] Panel con diagnóstico y reportes, sin exponer datos de otros niños
`),
  "F9": D(`
**Vía:** Producto · **Depende de:** F2, F7 · **BLOQUEADA**
**Decisiones:** D-011, D-027 · **Investigación:** mc-28, mc-46

### ⛔ Bloqueada por T-5
Nadie verifica que el adulto que abre un salón o un club sea quien dice ser.
D-011 propone mitigación que **no es garantía**; D-027 acota el daño eliminando
el contacto no supervisado, pero **no verifica al adulto**.

### Criterios de aceptación
- [ ] Salón del maestro y club de papás sobre la misma tabla \`grupo_infantil\`
- [ ] **Sin chat, en ninguna dirección** (D-027). El estándar de salvaguarda
      juvenil exige verificación de antecedentes para contacto no supervisado
      con menores; no podemos correrla, así que se elimina la categoría
- [ ] El dueño del grupo ve solo alias, puntos y racha
- [ ] Cada niño lo aprueba **su propio padre**
- [ ] Bitácora de quién aprobó qué y cuándo
`),
  "F10": D(`
**Vía:** Producto · **Depende de:** F5b, F7
**Decisiones:** D-027, D-028, D-029 · **Investigación:** mc-46

### Criterios de aceptación
- [ ] \`club_adulto\` separado de \`grupo_infantil\` — dos sistemas, no uno (D-027)
- [ ] Las tres formas de prenda, **ninguna con casilla para el último lugar**.
      No hay campo donde un castigo dirigido pueda aterrizar (D-028)
- [ ] Larry modera el texto libre **a prueba de fallos**: si no puede revisar,
      la prenda no se publica (D-029)
- [ ] Ruteo \`gpt-oss-120b\` → escalada a \`kimi-k2.6\` en baja confianza (D-035)
- [ ] Toda prenda rechazada va a revisión humana con un toque — sin eso se
      siente como censura
- [ ] Larry rechaza breve y en personaje, **sin sermón** (mc-11)

### Lo que no se negocia
Prize + chance + consideration son los tres elementos del juego ilegal. Aquí
faltan dos: la matemática es habilidad medible, y la plataforma **nunca toca
valor**. Si la plataforma alguna vez custodia algo, esto se cae.
`),
  "F11": D(`
**Vía:** Producto · **Depende de:** todas
**Decisiones:** D-020, D-031 · **Investigación:** mc-29, mc-38

### Criterios de aceptación
- [ ] Anti-trampa tier 0-1 — y **nunca** cámara, micrófono, biometría ni
      navegador bloqueado, en ninguna banda (línea roja #1)
- [ ] Accesibilidad auditada: \`axe-a11y\`, \`contrast\` y \`touch-targets\` pasando
      (24px WCAG / 44px HIG / **88px kinder**)
- [ ] Revisión legal con abogado real, no con nuestra lectura de la ley
- [ ] Offline completo con presupuesto de precaché respetado
- [ ] Interfaz adaptativa terminada en las cuatro plataformas (D-031)
`),
  "T-5": D(`
**Tensión abierta** · **Bloquea:** F9
**Decisiones:** D-011, D-027 · **Investigación:** mc-28, mc-46

### El problema
Nadie verifica que un adulto que abre un salón o un club sea quien dice ser.

D-011 propone un stack de mitigación que **no es garantía**. D-027 lo acotó
eliminando el contacto no supervisado —sin chat en ninguna dirección, el dueño
del grupo ve solo alias— pero **eso reduce el daño, no verifica al adulto**.

El estándar de salvaguarda juvenil exige verificación de antecedentes para
"contacto no supervisado o uno-a-uno con menores". No podemos correrla.

### Qué la cerraría
Una decisión del dueño sobre una de estas: verificación de identidad de tercero
con costo por maestro, restricción a instituciones con dominio verificado, o
aceptar formalmente el riesgo residual por escrito. **No es una tarea técnica.**
`),
  "T-6": D(`
**Tensión abierta** · **Bloquea:** modo Pro
**Decisiones:** D-034, D-035 · **Investigación:** mc-12

### El problema
Qué se puede calificar automáticamente de verdad a nivel PhD. No bloquea el MVP
—que llega hasta N10 (D-034)— pero define si el modo Pro existe.

### Se cruzó con D-035
Ahora hay una segunda pregunta encima: aunque algo sea auto-calificable, la
banda Pro perdió a Opus 5 y su techo es \`kimi-k2.6\`. Las dos se responden con
la misma evaluación contra explicaciones avanzadas revisadas por humano.

### Qué la cerraría
Un banco de ~50 problemas N11-N12 con solución revisada, y medir: cuántos se
califican bien de forma automática, y cuántas explicaciones de \`kimi-k2.6\`
aguantan revisión de un matemático.
`),
};

// Ordenadas de más larga a más corta: `"F10".startsWith("F1")` es verdadero,
// así que emparejar en orden de inserción le daba a F10 y F11 los datos de F1.
// El fallo era silencioso — el script decía "✓" sobre el elemento equivocado.
const CLAVES = Object.keys(CUERPOS).sort((a, b) => b.length - a.length);

const items = JSON.parse(
  gh("project", "item-list", proyecto, "--owner", DUENO, "--format", "json", "--limit", "100"),
).items;

let hechos = 0;
for (const item of items) {
  const clave = CLAVES.find((k) => item.title.startsWith(k));
  if (!clave) {
    console.log(`  ? sin detalle: ${item.title}`);
    continue;
  }
  // Editar el cuerpo de un draft exige el ID del **contenido** (`DI_…`), no el
  // del elemento del proyecto (`PVTI_…`). Son dos objetos distintos y la CLI
  // solo lo dice cuando le pasas el equivocado. El título se reenvía tal cual
  // porque `--body` sin `--title` también es rechazado.
  gh("project", "item-edit", "--id", item.content.id, "--title", item.title, "--body", CUERPOS[clave]);
  console.log(`  ✓ ${item.title.slice(0, 50)}  (${CUERPOS[clave].length} car.)`);
  hechos++;
}

console.log(`\n✓ ${hechos} elemento(s) detallados`);
console.log(`  https://github.com/users/${DUENO}/projects/${proyecto}`);
