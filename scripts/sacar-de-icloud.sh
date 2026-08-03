#!/usr/bin/env bash
#
# Saca este repositorio de iCloud Drive moviéndolo fuera de ~/Documents.
#
# ─── Por qué mover y no «excluir» ──────────────────────────────────────────
#
# iCloud Drive estaba sincronizando `~/Documents/dev/math-challenge` y creando
# copias de conflicto —«index 2.html», «wrangler 2.jsonc», «jugar 2.ts»— que
# rompieron el build y tres auditores, y costaron horas repartidas en varias
# sesiones. La causa se confirmó midiendo, no suponiendo:
#
#     xattr -p com.apple.file-provider-domain-id ~/Documents
#     → com.apple.CloudDocs.iCloudDriveFileProvider/971E3542-…
#
#     brctl status | grep math-challenge
#     → Under /Documents/dev/math-challenge/.git … losers:{69b5u, 64d96}
#
# «losers» es la palabra del propio servicio de sincronización para las
# versiones que pierden un conflicto. Estaban dentro de este repositorio.
#
# Las tres formas de excluirlo SIN moverlo se descartaron por escrito:
#
#   · Renombrar la carpeta a `…​.nosync` — funciona, y rompe todas las rutas
#     absolutas del proyecto (CLAUDE.md, los auditores, el despliegue).
#   · El atributo `com.apple.fileprovider.ignore#P` — documentado como no
#     fiable desde macOS Sequoia; esta máquina va en una versión posterior.
#   · Un enlace simbólico desde `~/Documents` — `Documents` y `Desktop` son
#     carpetas especiales en macOS moderno y ya no se pueden redirigir así.
#
# Una carpeta creada por ti fuera de `~/Documents` iCloud no la mira. Eso es
# todo lo que hace falta, y es lo único que no depende de comportamiento no
# documentado que una actualización pueda cambiar.
#
# ─── Qué hace, y qué NO hace ───────────────────────────────────────────────
#
# Mueve el repositorio a `~/dev/math-challenge` y verifica que llegó entero.
# **No borra nada** y **no toca git**: si algo sale mal, el repositorio sigue
# donde estaba.
#
# NO actualiza las rutas absolutas del proyecto. Eso queda para después de
# comprobar que todo funciona en la ubicación nueva — el script te dice cuáles
# son al terminar.
#
#     bash scripts/sacar-de-icloud.sh              # dice qué haría
#     bash scripts/sacar-de-icloud.sh --hazlo      # lo hace
#
set -euo pipefail

ORIGEN="$HOME/Documents/dev/math-challenge"
DESTINO="$HOME/dev/math-challenge"
HAZLO="${1:-}"

echo "── Sacar math-challenge de iCloud Drive ──"
echo

# 1. ¿Está donde creemos?
if [ ! -d "$ORIGEN/.git" ]; then
  echo "✗ No encuentro un repositorio en $ORIGEN"
  echo "  Puede que ya lo hayas movido. Nada que hacer."
  exit 1
fi

# 2. ¿Está de verdad dentro de iCloud? Si no lo está, el script sobra.
if xattr -p com.apple.file-provider-domain-id "$HOME/Documents" >/dev/null 2>&1; then
  echo "· ~/Documents SÍ está sincronizado por iCloud — mover tiene sentido."
else
  echo "· ~/Documents no parece estar en iCloud. Quizá ya lo desactivaste."
  echo "  Si es así, este script no hace falta."
fi

# 3. Trabajo sin guardar. Mover con cambios pendientes es seguro, pero hay que
#    saberlo: si algo sale mal después, conviene tenerlos commiteados.
PENDIENTES=$(cd "$ORIGEN" && git status --porcelain | wc -l | tr -d ' ')
if [ "$PENDIENTES" != "0" ]; then
  echo "· ⚠ Hay $PENDIENTES archivo(s) sin commitear. El movimiento los conserva,"
  echo "    pero si puedes, commitea o guarda antes."
fi

# 4. ¿Hay algo corriendo? Mover un repo con un build a medias deja basura.
if pgrep -f "$ORIGEN" >/dev/null 2>&1; then
  echo "· ⚠ Hay procesos corriendo dentro del repositorio. Ciérralos antes:"
  pgrep -fl "$ORIGEN" | head -5 | sed 's/^/      /'
fi

# 5. El destino tiene que estar libre. Nunca se sobrescribe nada.
if [ -e "$DESTINO" ]; then
  echo "✗ $DESTINO ya existe. No lo toco."
  echo "  Muévelo o bórralo tú, y vuelve a correr esto."
  exit 1
fi

echo
echo "  De:    $ORIGEN"
echo "  A:     $DESTINO"
echo

if [ "$HAZLO" != "--hazlo" ]; then
  echo "Esto fue un ensayo. Para hacerlo de verdad:"
  echo
  echo "    bash scripts/sacar-de-icloud.sh --hazlo"
  exit 0
fi

# 6. Mover. `mv` dentro del mismo disco es atómico: o está entero o no se movió.
mkdir -p "$(dirname "$DESTINO")"
echo "· Moviendo…"
mv "$ORIGEN" "$DESTINO"

# 7. Comprobar que llegó entero, sin dar nada por hecho.
echo "· Comprobando…"
cd "$DESTINO"
RAMA=$(git rev-parse --abbrev-ref HEAD)
COMMIT=$(git rev-parse --short HEAD)
AHORA=$(git status --porcelain | wc -l | tr -d ' ')

echo "    rama:          $RAMA"
echo "    commit:        $COMMIT"
echo "    sin commitear: $AHORA (antes: $PENDIENTES)"

if [ -f "$DESTINO/.env" ]; then
  echo "    .env:          presente"
else
  echo "    .env:          ✗ FALTA — sin él el build omite Turnstile y NADIE"
  echo "                   puede entrar ni registrarse (CLAUDE.md § Cloudflare)."
fi

echo
echo "✓ Movido. iCloud ya no lo mira."
echo
echo "── Lo que falta, y lo tienes que hacer tú ──"
echo
echo "  1. Abre una terminal NUEVA en $DESTINO."
echo "     La sesión actual sigue apuntando a la ruta vieja, que ya no existe."
echo
echo "  2. Comprueba que todo sigue vivo:"
echo "       cd $DESTINO && node audits/run.mjs"
echo
echo "  3. Actualiza las rutas absolutas. Están aquí:"
grep -rl "Documents/dev/math-challenge" "$DESTINO" \
  --include="*.md" --include="*.mjs" --include="*.sh" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git 2>/dev/null \
  | sed "s|$DESTINO|       .|" | head -20 || true
echo
echo "  4. Cuando confirmes que funciona, borra el hueco que quedó:"
echo "       rmdir ~/Documents/dev 2>/dev/null || true"
