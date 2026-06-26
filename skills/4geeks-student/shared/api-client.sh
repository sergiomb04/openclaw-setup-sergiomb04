#!/usr/bin/env bash
# shared/api-client.sh - Cliente HTTP para la API de 4Geeks
# Uso: source api-client.sh && geeks_api_get "/user/me"

# ── Configuración ──────────────────────────────────────────
GEEKS_API_BASE="https://breathecode.herokuapp.com/v1/admissions"
# Intentar detectar workspace raíz automáticamente
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ "$SKILL_DIR" == *"/.openclaw/skills/"* ]]; then
  # Estamos dentro de skills, subir hasta workspace
  WORKSPACE_ROOT="$(cd "$SKILL_DIR/../../../.." && pwd 2>/dev/null)"
else
  WORKSPACE_ROOT="$HOME/.openclaw/workspace"
fi
GEEKS_ENV_FILE="${WORKSPACE_ROOT}/.env"

# Fallback al HOME si no se detecta
if [ ! -f "$GEEKS_ENV_FILE" ]; then
  GEEKS_ENV_FILE="$HOME/.openclaw/workspace/.env"
fi
GEEKS_TIMEOUT=10

# ── Leer token del .env ────────────────────────────────────
geeks_load_token() {
  if [ ! -f "$GEEKS_ENV_FILE" ]; then
    echo '{"error":"No se encuentra .env","detail":"Crea ~/.openclaw/workspace/.env con GEEKS_TOKEN=tu_token"}'
    return 1
  fi
  TOKEN=$(grep '^GEEKS_TOKEN=' "$GEEKS_ENV_FILE" | cut -d'=' -f2)
  if [ -z "$TOKEN" ]; then
    echo '{"error":"Token no encontrado","detail":"Agrega GEEKS_TOKEN=tu_token a ~/.openclaw/workspace/.env"}'
    return 1
  fi
  echo "$TOKEN"
}

# ── GET request con autenticación ──────────────────────────
geeks_api_get() {
  local endpoint="$1"
  local params="${2:-}"
  local url="${GEEKS_API_BASE}${endpoint}"

  local TOKEN
  TOKEN=$(geeks_load_token) || return 1

  if [ -n "$params" ]; then
    url="${url}?${params}"
  fi

  curl -s --max-time "$GEEKS_TIMEOUT" \
    -H "Authorization: Token ${TOKEN}" \
    "$url"
}

# ── Verificar si hubo error ────────────────────────────────
geeks_check_error() {
  local json="$1"
  if echo "$json" | grep -q '"status_code":40[0-9]' 2>/dev/null; then
    return 1
  fi
  if echo "$json" | grep -q '"detail"' 2>/dev/null; then
    local detail
    detail=$(echo "$json" | python3 -c "import sys,json; print(json.load(sys.stdin).get('detail',''))" 2>/dev/null)
    if [ -n "$detail" ] && [ "$detail" != "Authentication credentials were not provided." ]; then
      return 1
    fi
  fi
  return 0
}