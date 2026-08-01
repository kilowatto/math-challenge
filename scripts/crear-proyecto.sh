#!/usr/bin/env bash
# crear-proyecto.sh — el plan de Math Challenge en GitHub Projects
#
# Uso:   ./scripts/crear-proyecto.sh
#
# Requiere el scope `project`, que es un flujo de navegador y no se puede
# conceder desde aquí:
#
#     gh auth refresh -s project
#
# Qué construye, y por qué así.
#
# Un tablero genérico de "por hacer / haciendo / hecho" desperdiciaría lo único
# que este proyecto tiene de raro: **35 decisiones y 47 investigaciones que
# gobiernan el trabajo**. Así que cada fase carga qué decisiones la mandan y de
# qué depende — la pregunta que de verdad se hace al planear no es "¿qué sigue?"
# sino "¿qué me desbloquea esto, y qué decisión me ata las manos?".
#
# Las dos tensiones abiertas (T-5, T-6) entran como elementos propios, no como
# nota al pie: **bloquean fases**, y una tensión que solo vive en un documento
# es una que nadie ve venir hasta que detiene el trabajo.

set -euo pipefail
cd "$(dirname "$0")/.."

DUENO="kilowatto"
REPO="kilowatto/math-challenge"
TITULO="Math Challenge — plan integral"

if ! gh auth status 2>&1 | grep -q "project"; then
  echo "✗ al token le falta el scope \`project\`."
  echo "  Concédelo (abre el navegador):  gh auth refresh -s project"
  exit 1
fi

echo "── creando el proyecto"
NUM="$(gh project create --owner "$DUENO" --title "$TITULO" --format json | node -pe 'JSON.parse(require("fs").readFileSync(0)).number')"
echo "   proyecto #$NUM"

gh project link "$NUM" --owner "$DUENO" --repo "$REPO" >/dev/null
echo "   enlazado a $REPO"

# --- Campos ----------------------------------------------------------------
# `Estado` ya viene de fábrica. Estos son los que hacen que el tablero diga algo
# que el master-plan no dice de un vistazo.
echo "── campos"
crear_campo() {
  gh project field-create "$NUM" --owner "$DUENO" --name "$1" --data-type "$2" ${3:+--single-select-options "$3"} >/dev/null
  echo "   $1"
}

# Las dos vías de §13 corren en paralelo y no se bloquean entre sí. Verlas
# mezcladas en una sola columna es la forma más rápida de creer que el sitio
# depende del producto, que es falso.
crear_campo "Vía"          SINGLE_SELECT "Producto,Sitio abierto,Transversal"
crear_campo "Depende de"   TEXT
crear_campo "Decisiones"   TEXT
crear_campo "Ruta crítica" SINGLE_SELECT "Sí,No"
crear_campo "Riesgo"       SINGLE_SELECT "Bloqueada,Alto,Medio,Bajo"

# --- Elementos --------------------------------------------------------------
# Se crean como draft issues: el plan existe antes que el código, y forzar un
# issue por fase ahora llenaría el repo de tickets que nadie va a tocar en meses.
# Se promueven a issue cuando la fase arranca.
echo "── fases"
agregar() {
  local titulo="$1" cuerpo="$2"
  gh project item-create "$NUM" --owner "$DUENO" --title "$titulo" --body "$cuerpo" >/dev/null
  echo "   $titulo"
}

agregar "S0 · Cimientos del sitio" \
  $'Vía: Sitio abierto · Depende de: —\nDecisiones: D-033\n\nEl sitio abierto no depende de ninguna fase del producto. Puede arrancar hoy.'
agregar "S1 · El corpus" \
  $'Vía: Sitio abierto · Depende de: S0\nDecisiones: D-033\n\nLas 47 investigaciones publicadas e indexables, con fuentes, limitaciones y [unverified] visibles — incluidas las que contradicen al producto.'
agregar "S2 · La historia y el producto" \
  $'Vía: Sitio abierto · Depende de: S0\nDecisiones: D-033\n\nPágina de origen desde por-que-existe.md, los niveles y el propósito, la arquitectura atribuida a Ignia sobre Cloudflare.'

agregar "F0 · Cimientos y gates ✅ CERRADA" \
  $'Vía: Producto · Depende de: —\nDecisiones: D-022, D-023, D-030\n\nVerificada con audits/live.mjs: 21 comprobaciones en vivo, incluidas HTTP/3 y 0-RTT (max early data 14336).'
agregar "F1 · La flota adversarial ✅ CERRADA" \
  $'Vía: Producto · Depende de: F0\nDecisiones: D-032, D-035\nRiesgo: Alto\n\nLos 23 auditores existen y corren. NO está cerrada: la primera corrida completa dio 50% de falsos positivos en hallazgos bloqueantes — uno fabricó su evidencia citando una cadena que no está en el archivo. La regla 1 no puede atraparlo: la cita era real, lo inventado fue la evidencia.\n\nPendiente: segundo filtro determinista que verifique que la evidencia citada exista en el diff.'
agregar "F2 · Cuentas y onboarding" \
  $'Vía: Producto · Depende de: F0\nDecisiones: D-011, D-012, D-013, D-026\n\nPrimera fase donde la flota se gana el sueldo: toca esquema de menores, consentimiento y texto libre a la vez.'
agregar "F3 · Motor de reto" \
  $'Vía: Producto · Depende de: F2\nDecisiones: D-010, D-018, D-024\n\nPuntuación del lado del servidor. Kinder usa valor·acc, sin tiempo — con a=0 la regla HSHS da cero para toda respuesta.'
agregar "F4 · Adaptativo" \
  $'Vía: Producto · Depende de: F3\nDecisiones: D-002, D-044\n\nUbicación por tema, siguiente ítem, repaso espaciado, modelo por niño en su Durable Object.'
agregar "F5 · Contenido kinder — RUTA CRÍTICA" \
  $'Vía: Producto · Depende de: esquema de ítem (§9)\nDecisiones: D-006, D-009, D-022\nRuta crítica: Sí\n\n~400 ítems × 7 locales. Son SIETE autores nativos, no cinco: es-MX y es-ES no comparten separador decimal, pt-BR y pt-PT no comparten escala numérica.'
agregar "F5b · Franja adulta" \
  $'Vía: Producto · Depende de: F5\nDecisiones: D-034\nRiesgo: Medio\n\n⚠️ La flota encontró que el master-plan dice «sin curaduría por serie», lo que contradice D-018 («la unidad de diseño es la serie»). Hay que resolver la contradicción o enmendar D-018 explícitamente.'
agregar "F6 · Larry Profe" \
  $'Vía: Producto · Depende de: F3, F5\nDecisiones: D-004, D-015, D-035\nRiesgo: Medio\n\n⚠️ La banda Pro tiene condición: medir kimi-k2.6 contra explicaciones avanzadas revisadas ANTES de soltarla en vivo. Si no pasa, se deja con explicación pregenerada — no se vuelve a Claude (D-035).'
agregar "F7 · Juego" \
  $'Vía: Producto · Depende de: F4\nDecisiones: D-003, D-014, D-016, D-025'
agregar "F8 · Padres" \
  $'Vía: Producto · Depende de: F2\nDecisiones: D-016, D-021'
agregar "F9 · Grupos infantiles" \
  $'Vía: Producto · Depende de: F2, F7\nDecisiones: D-011, D-027\nRiesgo: Bloqueada\n\n⚠️ BLOQUEADA por T-5: nadie verifica que un adulto que abre un salón o un club sea quien dice ser.'
agregar "F10 · Clubs de adultos" \
  $'Vía: Producto · Depende de: F5b, F7\nDecisiones: D-027, D-028, D-029'
agregar "F11 · Cierre" \
  $'Vía: Producto · Depende de: todas\nDecisiones: D-020, D-031\n\nAnti-trampa tier 0-1, accesibilidad auditada, revisión legal con abogado, offline completo.'

echo "── tensiones abiertas"
agregar "T-5 · Nadie verifica al adulto que abre un salón o un club" \
  $'Vía: Transversal · Bloquea: F9\nDecisiones: D-011, D-027\nRiesgo: Bloqueada\n\nD-011 propone un stack de mitigación que no es garantía. D-027 lo acota eliminando el contacto no supervisado, pero NO verifica al adulto. Investigación: mc-28, mc-46.'
agregar "T-6 · Qué es auto-calificable de verdad a nivel PhD" \
  $'Vía: Transversal · Bloquea: modo Pro\nDecisiones: D-034\nRiesgo: Medio\n\nNo bloquea el MVP (llega a N10), pero define si el modo Pro existe. Ahora se cruza con la condición de la banda Pro de D-035. Investigación: mc-12.'

echo
echo "✓ proyecto creado y enlazado"
gh project view "$NUM" --owner "$DUENO" --web 2>/dev/null || true
echo "  https://github.com/users/$DUENO/projects/$NUM"
echo
echo "Falta a mano (la API no lo expone): crear las vistas Roadmap y Board,"
echo "y activar los workflows de auto-añadir y auto-archivar en Settings."
