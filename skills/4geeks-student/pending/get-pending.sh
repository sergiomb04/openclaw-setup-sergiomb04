#!/usr/bin/env bash
# pending/get-pending.sh - Skill 3: Mostrar trabajo pendiente

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../shared/api-client.sh"

4geeks_pending_get() {
  echo "⏳ Consultando trabajo pendiente en 4Geeks..."
  echo ""
  
  local response
  response=$(geeks_api_get "/user/me")
  
  if [ $? -ne 0 ] || [ -z "$response" ]; then
    echo "❌ Error al obtener datos"
    return 1
  fi
  
  echo "$response" | python3 -c "
import sys, json

data = json.load(sys.stdin)
cohorts = data.get('cohorts', [])

all_pending = []
total_pending_count = 0

for c in cohorts:
    cohort = c['cohort']
    slug = cohort['slug']
    name = cohort['name']
    completion = c.get('completion', {})
    
    # Saltar cohortes sin estrategia de proyectos
    strategy_type = completion.get('strategy',{}).get('type', '')
    if strategy_type == 'NO_COMPLETION_STRATEGY':
        continue
    
    # Saltar prework
    if cohort.get('stage') == 'PREWORK':
        continue
    
    # Saltar completados
    if completion.get('is_complete', False):
        continue
    
    pending_slugs = completion.get('pending_required_slugs', {})
    proj_pending = pending_slugs.get('PROJECT', [])
    
    if len(proj_pending) == 0:
        continue
    
    all_pending.append({
        'name': name,
        'slug': slug,
        'pending': proj_pending,
        'count': completion.get('pending_required_count', 0)
    })
    total_pending_count += len(proj_pending)

if total_pending_count == 0:
    print('🎉 ¡No tienes trabajo pendiente! Todos los proyectos están completados.')
    sys.exit(0)

print(f'🔴 Tienes {total_pending_count} proyectos pendientes:\\n')

for mod in all_pending:
    print(f'📁 {mod[\"name\"]} ({mod[\"slug\"]})')
    for p in mod['pending']:
        print(f'   ⬜ {p}')
    print()

print('💡 Pregúntame \"¿Qué me falta entregar?\" para recordarte estos pendientes.')
"
}

# Ejecutar si se llama directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  4geeks_pending_get
fi