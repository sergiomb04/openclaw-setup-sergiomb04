#!/usr/bin/env bash
# started/list-started.sh - Skill 5: Mostrar proyectos iniciados (empezados pero sin completar)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../shared/api-client.sh"

4geeks_started_list() {
  echo "🔍 Buscando proyectos que ya iniciaste pero no has terminado..."
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

started_modules = []
total_started = 0

for c in cohorts:
    cohort = c['cohort']
    name = cohort['name']
    slug = cohort['slug']
    completion = c.get('completion', {})

    # Saltar NO_COMPLETION_STRATEGY
    if completion.get('strategy',{}).get('type') == 'NO_COMPLETION_STRATEGY':
        continue

    # Saltar prework
    if cohort.get('stage') == 'PREWORK':
        continue

    # Saltar completados
    if completion.get('is_complete', False):
        continue

    overall = completion.get('overall', {})
    total = overall.get('total', 0)
    completed = overall.get('completed', 0)
    percent = overall.get('percent', 0)

    # Solo nos interesan los que tienen al menos 1 proyecto pero no están completos
    if total > 0 and completed < total:
        missing = completion.get('pending_required_slugs', {}).get('PROJECT', [])
        started_modules.append({
            'name': name,
            'slug': slug,
            'total': total,
            'completed': completed,
            'percent': percent,
            'missing': missing
        })
        total_started += len(missing)

if total_started == 0:
    print('ℹ️  No tienes proyectos iniciados sin completar.')
    print('   O ya los terminaste o aún no los has empezado.')
    sys.exit(0)

print(f'🔶 Tienes {len(started_modules)} módulos con proyectos iniciados ({total_started} pendientes):')
print()

for mod in started_modules:
    pct = mod['percent']
    print(f'📁 {mod[\"name\"]}')
    print(f'   Progreso: {mod[\"completed\"]}/{mod[\"total\"]} ({pct}%)')
    if mod['missing']:
        print(f'   ⬜ Pendientes:')
        for p in mod['missing']:
            print(f'      • {p}')
    print()

print('💡 Pregúntame \"¿Qué me falta por entregar?\" para ver TODO lo pendiente.')
"
}

# Ejecutar si se llama directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  4geeks_started_list
fi