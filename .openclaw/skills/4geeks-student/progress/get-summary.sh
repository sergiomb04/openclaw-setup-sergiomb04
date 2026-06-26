#!/usr/bin/env bash
# progress/get-summary.sh - Skill 4: Resumen de progreso del curso

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../shared/api-client.sh"

4geeks_progress_summary() {
  echo "📊 Generando resumen de progreso en 4Geeks..."
  echo ""
  
  local response
  response=$(geeks_api_get "/user/me")
  
  if [ $? -ne 0 ] || [ -z "$response" ]; then
    echo "❌ Error al obtener datos"
    return 1
  fi
  
  echo "$response" | python3 -c "
import sys, json
from datetime import datetime

data = json.load(sys.stdin)
cohorts = data.get('cohorts', [])

print('=' * 50)
print('  📊 RESUMEN DE PROGRESO - 4GEEKS')
print('=' * 50)
print()

# ── Información del estudiante ──
first = data.get('first_name', '')
last = data.get('last_name', '')
email = data.get('email', '')
joined = data.get('date_joined', '')[:10]
print(f'👤 {first} {last}  |  {email}')
print(f'📅 Desde: {joined}')
print()

# ── Cohorte principal ──
main_cohort = None
for c in cohorts:
    if c['cohort']['slug'] == 'spain-aie-pt-1':
        main_cohort = c
        break

if main_cohort:
    mc = main_cohort['cohort']
    print(f'🎓 Programa Principal: {mc[\"syllabus_version\"][\"name\"]}')
    print(f'   Duración: {mc[\"syllabus_version\"][\"duration_in_days\"]} días ({mc[\"syllabus_version\"][\"duration_in_hours\"]}h)')
    print(f'   Academia: {mc[\"academy\"][\"name\"]}')
    
    kickoff = mc.get('kickoff_date','')[:10]
    ending = mc.get('ending_date','')[:10] if mc.get('ending_date') else 'TBD'
    print(f'   Inicio: {kickoff}  |  Fin: {ending}')
    print()

# ── Progreso por módulo ──
print('📈 Progreso por Asignatura:')
print(f'{\"Asignatura\":30} {\"Proyectos\":15} {\"Estado\":10}')
print('-' * 55)

total_projects = 0
total_completed = 0

for c in cohorts:
    cohort = c['cohort']
    name = cohort['name']
    completion = c.get('completion', {})
    
    # Saltar NO_COMPLETION
    if completion.get('strategy',{}).get('type') == 'NO_COMPLETION_STRATEGY':
        continue
    
    overall = completion.get('overall', {})
    proj_total = overall.get('total', 0)
    proj_completed = overall.get('completed', 0)
    
    if proj_total == 0:
        continue
    
    total_projects += proj_total
    total_completed += proj_completed
    
    is_done = completion.get('is_complete', False)
    status = '✅' if is_done else '⏳'
    percent = overall.get('percent', 0)
    
    if len(name) > 28:
        name = name[:25] + '...'
    
    print(f'{name:30} {proj_completed}/{proj_total:<9} {status} {percent}%')

print('-' * 55)
overall_percent = (total_completed / total_projects * 100) if total_projects > 0 else 0
print(f'{\"TOTAL\":30} {total_completed}/{total_projects:<9} {overall_percent:.0f}%')
print()

# ── Pendientes ──
pending_count = 0
for c in cohorts:
    pending_count += c.get('completion',{}).get('pending_required_count', 0)

if pending_count > 0:
    print(f'⏳ Proyectos pendientes: {pending_count}')
else:
    print('🎉 Todos los proyectos completados!')

# ── Cohortes completados ──
completed_cohorts = [c for c in cohorts if c.get('completion',{}).get('is_complete', False)]
print(f'✅ Módulos completados: {len(completed_cohorts)}')
print()

# ── Estado financiero y educativo ──
fin_status = c.get('finantial_status', '')
if fin_status:
    fin_icon = '💰' if fin_status == 'UP_TO_DATE' else '⚠️'
    print(f'{fin_icon} Estado financiero: {fin_status}')

print()
print('💡 Comandos disponibles:')
print('   • \"¿Qué me falta por entregar?\" - Ver pendientes')
print('   • \"¿Qué proyectos tengo?\" - Listar todos los proyectos')
print('   • \"¿Cómo va mi progreso?\" - Este resumen')
"
}

# Ejecutar si se llama directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  4geeks_progress_summary
fi