# Guía de estilo — Math Challenge

> Paleta y tipografía de Ignia, aplicadas a un producto que va de los 4 años al
> matemático profesional en siete locales, y que tiene que cumplir WCAG 2.2 AA.
>
> **Origen:** `Imagen Ignia / Color y tipografia.pdf`. Las cifras de contraste de
> este documento las calcula `audits/brand-image.mjs`, no están escritas a mano —
> corre `node audits/brand-image.mjs --tabla` para reproducirlas.

---

## La paleta

| Color | Hex | Rol |
|---|---|---|
| Naranja Ignia | `#F36B1C` | Principal · **el color de Larry** |
| Azul Ignia | `#0B6AB0` | Principal |
| Naranja claro | `#F8A337` | Complementario |
| Naranja oscuro | `#CE4912` | Complementario |
| Gris 900 | `#434547` | Grises |
| Gris 600 | `#727476` | Grises |
| Gris 400 | `#A4A6A8` | Grises |
| Negro | `#000000` | Grises |
| Blanco | `#FFFFFF` | Grises |

## Contraste — lo que la paleta puede y no puede hacer

Calculado contra WCAG 2.2: **4.5:1** para texto normal, **3:1** para texto grande
(≥18.66 px negrita o ≥24 px) y para gráficos y controles.

| Color | Sobre blanco | Sobre negro | Texto normal sobre blanco |
|---|---|---|---|
| `#F36B1C` naranja Ignia | **3.03** | 6.93 | **No.** Solo texto grande y gráficos |
| `#0B6AB0` azul Ignia | **5.67** | 3.70 | Sí |
| `#F8A337` naranja claro | **2.04** | 10.29 | **No.** Decorativo únicamente |
| `#CE4912` naranja oscuro | **4.58** | 4.59 | Sí — el único que sirve en ambos |
| `#434547` gris 900 | **9.63** | 2.18 | Sí — el gris de texto |
| `#727476` gris 600 | **4.69** | 4.48 | Sí, apenas |
| `#A4A6A8` gris 400 | **2.44** | 8.60 | **No.** Bordes y decoración |

### La consecuencia que hay que aceptar

**El naranja de Ignia no puede llevar texto normal sobre fondo claro.** Es el
color de la marca y el de Larry, y da 3.03:1 — por debajo del 4.5:1 que exige
WCAG 2.2 AA. Esto no es un error a corregir: es un hecho de la marca.

Lo que sí puede: títulos grandes, botones, íconos, fondos, el propio Larry, y
cualquier gráfico o control (donde el umbral es 3:1 y lo pasa). Lo que no:
párrafos, etiquetas chicas, texto de ayuda.

**Para texto de marca sobre claro se usa `#0B6AB0` (azul) o `#CE4912` (naranja
oscuro).** El naranja oscuro conserva la familia cromática de Ignia y pasa el
umbral; es el sustituto natural cuando el diseño pide naranja y hay texto.

### Y la consecuencia que sale gratis

**El naranja de Ignia mejora en oscuro: 6.93:1.** El naranja claro llega a 10.29.
Eso encaja con dos hallazgos independientes: `mc-22` documenta que el modo oscuro
es ya expectativa de diseño para adolescentes, y `mc-23` recomienda tema
oscuro-primero para la banda adulta/experta.

La marca se ve mejor exactamente donde el producto ya quería ir.

## Neutros derivados — los que no vienen del PDF

**El PDF de Ignia no cubre tema oscuro.** Su gris más oscuro es `#434547`, que a
9.63:1 sobre blanco es un texto excelente pero es demasiado claro para servir de
fondo. Así que hubo que derivar cuatro neutros, y se declaran como derivados
para que nadie los confunda con color de marca:

| Token | Hex | Para qué | Verificación |
|---|---|---|---|
| `superficie-clara` | `#F7F7F8` | Superficie en tema claro | Texto `#434547` encima: **8.99:1** ✓ |
| `fondo-oscuro` | `#16181A` | Fondo en tema oscuro | — |
| `superficie-oscura` | `#1F2224` | Superficie en tema oscuro | 1.11:1 contra el fondo — separación, nunca texto |
| `texto-oscuro` | `#ECEDEE` | Texto en tema oscuro | **15.19:1** ✓ |

Sobre `#16181A`, la paleta de marca queda así: naranja Ignia **5.88:1** (aquí sí
lleva texto normal), naranja claro **8.72:1**, gris 400 **7.29:1**.

**Este bloque nació de que el auditor bloqueó un commit.** `brand-image.mjs`
marcó cuatro hex fuera de paleta en `tokens.css` — eran estos. La respuesta
correcta no era relajar el auditor sino declarar los colores y justificar su
contraste, que es lo que está arriba.

---

## Tipografía

**Raleway**, en tres pesos: Light para títulos, Medium para subtítulos, Regular
para textos.

### La excepción de kinder, que no es negociable

`mc-20` establece para 3-6 años: sans-serif redondeada, numerales de **24-32 px
mínimo**, y **alto grosor de trazo** para que se distingan de un vistazo.

**Raleway Light contradice el grosor de trazo.** En la banda KINDER:

- **Nunca Light.** Medium es el peso mínimo; Bold para numerales.
- Numerales a 24-32 px mínimo — son el contenido, no decoración.
- El niño no lee: toda instrucción lleva audio, y el texto es apoyo (`mc-20`).

### Las otras bandas

| Banda | Títulos | Cuerpo | Mínimos |
|---|---|---|---|
| KINDER 4-6 | Raleway Medium/Bold | Medium | Numerales 24-32 px |
| PRIMARIA 7-11 | Raleway Medium | Regular | Problema 18-20 px, etiquetas 16 px (`mc-21`) |
| SECUNDARIA 12-17 | Raleway Light/Medium | Regular | Legible en escaneo rápido; oscuro por defecto (`mc-22`) |
| SERIO / PRO | Raleway Light | Regular | Densidad mayor, oscuro-primero (`mc-23`) |

### Dislexia

`mc-21` documenta parámetros verificables: interlineado 1.5×, espaciado entre
letras 0.12em, entre palabras 0.16em, línea de 45-100 caracteres, alineado a la
izquierda, sin cursivas ni versalitas en cuerpo de texto.

**No se construye ni licencia una "fuente para dislexia".** `mc-38` recopila la
evidencia: Rello y Baeza-Yates no encontraron mejora en tiempo de lectura con
OpenDyslexic; un estudio de 2016 encontró que los lectores disléxicos
**prefirieron Arial**; uno de 2023 encontró preferencia estética pero ninguna
diferencia en resultados. La British Dyslexia Association recomienda sans-serif
ordinarias. El esfuerzo va al espaciado, no a la tipografía.

---

## Imágenes

**Recraft es la herramienta oficial** para arte generado — mantiene la
continuidad del avatar de Larry, que se generó ahí (`CLAUDE.md` § Imágenes).
**Google (Gemini / Nano Banana)** para las piezas complejas de interfaz.

### Formato

**AVIF con respaldo WebP.** Da 25-50% menos peso que PNG/JPG (`mc-47` §5), y el
mercado objetivo es Android de gama baja sobre 4G lento. Excepción: los íconos
de instalación del manifest siguen siendo PNG por compatibilidad.

En la imagen de LCP de cada pantalla, `fetchpriority="high"`.

### Las llaves

**Las llaves de Recraft y de Google nunca se commitean.** Van en `.env` local
(que `.gitignore` bloquea) o en `wrangler secret put`. Los nombres de variable
están en `.env.example`; los valores, jamás.

`audits/brand-image.mjs` busca patrones de llave de Recraft y de Google en cada
commit, y `audits/secrets.mjs` hace el barrido general. Una llave commiteada
sigue en el historial de git aunque se borre después: **se rota, no se borra**.

### Larry

El arte de Larry se genera en Recraft para conservar la continuidad del avatar.
Su canon está en `mc-37` y D-004: rinoceronte naranja, coach honesto, humor solo
sobre sí mismo, nunca condescendiente, y **nunca avergüenza a un niño**.

`mc-37` señala además que el estado `denying` del avatar existente —lenguaje
corporal de negación con la cabeza— se lee como "estás mal" y no debería
dispararse hacia un niño; para correcciones se prefiere `thinking` → `presenting`.

### La Sabana no habla

El arte del mundo de juego **no contiene texto** (D-019). Por eso se autora una
vez y sirve a los siete locales sin volver a generarse — es la palanca de peso
más barata que tiene el producto, y la razón de que 30 piezas de arte no se
multipliquen por siete.

---

## Lo que hace cumplir el auditor

`audits/brand-image.mjs`, en cada commit:

1. Todo hex en el código fuente pertenece a la paleta Ignia.
2. Ninguna imagen en PNG/JPG salvo íconos de instalación.
3. Ningún patrón de llave de Recraft o Google en archivos rastreados o nuevos.
4. Recuerda, en cada corrida, el contraste real del naranja sobre blanco.

Lo que **todavía no** verifica, y toca a las fases que lo habilitan: que el
naranja no se use para texto chico en una pantalla real (F2, junto con
`contrast` y `axe-a11y`), y que los pesos de Raleway respeten la excepción de
kinder (F2).
