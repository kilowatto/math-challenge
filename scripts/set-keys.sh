#!/usr/bin/env bash
# set-keys.sh — captura llaves de API sin que toquen el historial ni git
#
# Uso:   ./scripts/set-keys.sh          capturar en .env local
#        ./scripts/set-keys.sh --remote capturar y además subir a Cloudflare
#
# Por qué existe: pegar una llave en el chat, en un commit o en la línea de
# comandos la quema. Este script la lee sin eco, la escribe solo en .env (que
# .gitignore bloquea) con permisos 600, y nunca la vuelve a imprimir.
#
# Hace cumplir: CLAUDE.md § Cloudflare ("nunca commitees un secreto") y
# § Imágenes ("las llaves viven en .env local y nunca se commitean").

set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE=".env"
REMOTE=false
[[ "${1:-}" == "--remote" ]] && REMOTE=true

# --- Fallar cerrado: si .env no está ignorado, no se escribe nada ----------
if ! git check-ignore -q "$ENV_FILE" 2>/dev/null; then
  echo "✗ .gitignore no está ignorando $ENV_FILE."
  echo "  No escribo una llave donde git la pueda ver. Arregla .gitignore primero."
  exit 1
fi

# --- Las llaves que el proyecto usa ---------------------------------------
# nombre|para qué|dónde se saca
KEYS=(
  "RECRAFT_API_KEY|Arte de Larry y de la Sabana (herramienta oficial)|recraft.ai → Perfil → API"
  "GOOGLE_AI_API_KEY|Piezas complejas de interfaz (Gemini / Nano Banana)|aistudio.google.com → API keys"
  "ANTHROPIC_API_KEY|Larry Profe: tutor y moderación de prendas|console.anthropic.com"
)

echo
echo "Captura de llaves — no se muestran al escribir, no quedan en el historial."
echo "Enter en blanco = dejar la que ya está (o saltar)."
echo

touch "$ENV_FILE"
chmod 600 "$ENV_FILE"

written=0
skipped=0

for entry in "${KEYS[@]}"; do
  IFS='|' read -r name purpose where <<< "$entry"

  existing=""
  if grep -q "^${name}=" "$ENV_FILE" 2>/dev/null; then
    existing=" [ya hay una guardada]"
  fi

  echo "── ${name}${existing}"
  echo "   ${purpose}"
  echo "   ${where}"
  printf "   pega la llave (o Enter para saltar): "

  # -r no interpreta backslashes, -s no hace eco.
  IFS= read -rs value
  echo

  if [[ -z "$value" ]]; then
    echo "   · saltada"
    echo
    skipped=$((skipped + 1))
    continue
  fi

  # Reescribir el archivo sin la línea vieja, luego agregar la nueva.
  tmp="$(mktemp)"
  grep -v "^${name}=" "$ENV_FILE" > "$tmp" 2>/dev/null || true
  printf '%s=%s\n' "$name" "$value" >> "$tmp"
  mv "$tmp" "$ENV_FILE"
  chmod 600 "$ENV_FILE"

  # Solo la longitud y los últimos 4 — nunca la llave.
  echo "   ✓ guardada (${#value} caracteres, termina en ...${value: -4})"

  if $REMOTE; then
    printf "   subiendo a Cloudflare... "
    # printf por tubería: el valor nunca aparece en argv ni en el historial.
    if printf '%s' "$value" | npx wrangler secret put "$name" >/dev/null 2>&1; then
      echo "✓"
    else
      echo "✗ falló — súbela a mano con: npx wrangler secret put $name"
    fi
  fi

  unset value
  echo
  written=$((written + 1))
done

echo "── ${written} guardada(s), ${skipped} saltada(s) en $ENV_FILE (permisos 600)"
$REMOTE || echo "   Para producción, vuelve a correr con --remote"
echo

# --- Verificación final: que de verdad no se escapó nada ------------------
if node audits/secrets.mjs >/dev/null 2>&1 && node audits/brand-image.mjs >/dev/null 2>&1; then
  echo "✓ auditores de secretos y de imagen: limpio"
else
  echo "✗ un auditor detectó algo. Corre:  node audits/run.mjs"
  exit 1
fi
