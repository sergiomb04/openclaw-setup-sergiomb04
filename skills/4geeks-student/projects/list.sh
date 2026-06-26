#!/usr/bin/env bash
# projects/list.sh - Skill 2: Obtener proyectos y su estado

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../shared/api-client.sh"

4geeks_projects_list() {
  local cohort_slug="${1:-}"  # Opcional: filtrar por cohorte específico
  
  echo "📋 Consultando proyectos en 4Geeks..."
  echo ""
  
  local response
  response=$(geeks_api_get "/user/me")
  
  if [ $? -ne 0 ] || [ -z "$response" ]; then
    echo "❌ Error al obtener datos"
    return 1
  fi
  
  # Extraer y mostrar todos los proyectos con sus estados
  echo "$response" | python3 -c "
import sys, json

data = json.load(sys.stdin)
cohorts = data.get('cohorts', [])

total_projects = 0
total_completed = 0
total_pending = 0
target_cohort = '${cohort_slug}'

print(f'📚 Proyectos por módulo:\\n')

for c in cohorts:
    cohort = c['cohort']
    slug = cohort['slug']
    name = cohort['name']
    completion = c.get('completion', {})
    overall = completion.get('overall', {})
    
    # Saltar cohortes sin proyectos (NO_COMPLETION_STRATEGY)
    if completion.get('strategy',{}).get('type') == 'NO_COMPLETION_STRATEGY':
        continue
    
    # Saltar prework
    if cohort.get('stage') == 'PREWORK':
        continue
    
    # Filtrar por slug si se especificó
    if target_cohort and target_cohort not in slug:
        continue
    
    req = completion.get('required', {})
    proj_req = req.get('PROJECT', {})
    
    proj_total = overall.get('total', 0)
    proj_completed = overall.get('completed', 0)
    proj_percent = overall.get('percent', 0)
    
    missing = proj_req.get('missing', [])
    
    if proj_total == 0:
        continue
    
    total_projects += proj_total
    total_completed += proj_completed
    total_pending += len(missing)
    
    status_icon = '✅' if proj_completed == proj_total else '⏳'
    print(f'  {status_icon} {name}')
    print(f'     Progreso: {proj_completed}/{proj_total} ({proj_percent}%)')
    
    if missing:
        print(f'     📌 Pendientes:')
        for m in missing:
            print(f'        • {m}')
    
    print()

print(f'\\n📊 Resumen global:')
print(f'   ✅ Completados: {total_completed}')
print(f'   ⏳ Pendientes: {total_pending}')
print(f'   📦 Total: {total_projects}')
"
}

# Ejecutar si se llama directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  4geeks_projects_list "$@"
fi