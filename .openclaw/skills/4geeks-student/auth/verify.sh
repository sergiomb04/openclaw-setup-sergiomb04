#!/usr/bin/env bash
# auth/verify.sh - Skill 1: Verificar autenticación con 4Geeks

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../shared/api-client.sh"

4geeks_auth_verify() {
  echo "🔐 Verificando sesión en 4Geeks..."
  echo ""
  
  local response
  response=$(geeks_api_get "/user/me")
  
  # Verificar HTTP exitoso
  if [ $? -ne 0 ] || [ -z "$response" ]; then
    echo "❌ Error de conexión con la API de 4Geeks"
    return 1
  fi
  
  # Verificar si hay error de autenticación
  if echo "$response" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'status_code' in data and data['status_code'] == 401:
    sys.exit(1)
if 'detail' in data and 'credentials' in data.get('detail','').lower():
    sys.exit(1)
sys.exit(0)
" 2>/dev/null; then
    :
  else
    echo "❌ Token inválido o expirado"
    echo "   Detalle: No se pudo autenticar con la API de 4Geeks"
    echo "   Revisa tu token en ~/.openclaw/workspace/.env"
    return 1
  fi
  
  # Extraer datos del usuario
  local email first_name last_name
  email=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin).get('email',''))" 2>/dev/null)
  first_name=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin).get('first_name',''))" 2>/dev/null)
  last_name=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin).get('last_name',''))" 2>/dev/null)
  
  # Obtener el cohort principal (spain-aie-pt-1)
  local main_cohort
  main_cohort=$(echo "$response" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for c in data.get('cohorts', []):
    if c['cohort']['slug'] == 'spain-aie-pt-1':
        print(c['cohort']['syllabus_version']['name'])
        break
" 2>/dev/null)
  
  local cohorts_count
  cohorts_count=$(echo "$response" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(len(data.get('cohorts', [])))
" 2>/dev/null)
  
  echo "✅ ¡Autenticación exitosa!"
  echo ""
  echo "👤 Usuario: $first_name $last_name"
  echo "📧 Email: $email"
  echo "📚 Programa: $main_cohort"
  echo "📦 Módulos: $cohorts_count cohortes/asignaturas"
  
  # Verificar cohortes completados y pendientes
  echo ""
  local completed pending
  completed=$(echo "$response" | python3 -c "
import sys, json
data = json.load(sys.stdin)
total = 0
for c in data.get('cohorts', []):
    if c.get('completion',{}).get('is_complete', False):
        total += 1
print(total)
" 2>/dev/null)
  pending=$(echo "$response" | python3 -c "
import sys, json
data = json.load(sys.stdin)
total = 0
for c in data.get('cohorts', []):
    if not c.get('completion',{}).get('is_complete', False) and c['cohort'].get('syllabus_version',{}).get('duration_in_days',0) > 0:
        total += 1
print(total)
" 2>/dev/null)
  
  echo "✅ Completados: $completed módulos"
  echo "⏳ En progreso: $pending módulos"
  
  echo ""
  echo "🔑 Sesión activa y funcional"
}

# Ejecutar si se llama directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  4geeks_auth_verify
fi