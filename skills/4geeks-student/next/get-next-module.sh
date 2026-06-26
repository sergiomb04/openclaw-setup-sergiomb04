#!/usr/bin/env bash
# next/get-next-module.sh - Skill 6: Mostrar el siguiente módulo/submódulo a cursar

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../shared/api-client.sh"

4geeks_next_module() {
  echo "🔮 Calculando tu siguiente módulo en el programa..."
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

# Buscar cohorte principal
main_cohort = None
for c in data.get('cohorts', []):
    if c['cohort']['slug'] == 'spain-aie-pt-1':
        main_cohort = c
        break

if not main_cohort:
    print('❌ No se encontró el cohorte principal (spain-aie-pt-1)')
    sys.exit(1)

mc = main_cohort['cohort']
orders_str = mc.get('cohorts_order', '')
orders = orders_str.split(',') if orders_str else []
id_to_mc = {str(m['id']): m for m in mc.get('micro_cohorts', [])}

print(f'🎓 Programa: {mc[\"syllabus_version\"][\"name\"]}')
print(f'📅 Día actual del curso: {mc.get(\"current_day\", \"?\")}')
print()

# Mapa de slugs -> estado
slug_status = {}
slug_name = {}
slug_progress = {}
for uc in data.get('cohorts', []):
    ucs = uc['cohort']['slug']
    ucs_base = ucs.replace('-', '')
    slug_status[ucs_base] = uc.get('completion',{}).get('is_complete', False)
    slug_name[ucs_base] = uc['cohort']['name']
    overall = uc.get('completion',{}).get('overall', {})
    slug_progress[ucs_base] = overall

# Recorrer en orden del syllabus
next_found = False
next_name = None
next_after = None
before = None

for oid in orders:
    m = id_to_mc.get(oid)
    if not m:
        continue
    
    slug_base = m['slug'].replace('-', '')
    is_done = slug_status.get(slug_base, False)
    
    if not is_done:
        if not next_found:
            next_name = m['name']
            next_slug = m['slug']
            next_progress = slug_progress.get(slug_base, {})
            next_total = next_progress.get('total', 0)
            next_completed = next_progress.get('completed', 0)
            next_percent = next_progress.get('percent', 0)
            next_found = True
            
            # Buscar el módulo completado inmediatamente anterior
            prev_oid_idx = orders.index(oid) - 1
            if prev_oid_idx >= 0:
                prev_m = id_to_mc.get(orders[prev_oid_idx])
                if prev_m:
                    next_after = prev_m['name']
        else:
            # No nos interesan más, ya tenemos el primero no completado
            pass

    if next_found and before is None and m['slug'] != (next_slug if next_found else ''):
        before = m['name']

# Si ya encontramos el primero no completado
# Buscar el completado anterior
prev_completed_name = None
for oid in orders:
    m = id_to_mc.get(oid)
    if not m:
        continue
    slug_base = m['slug'].replace('-', '')
    is_done = slug_status.get(slug_base, False)
    if m['name'] == next_name:
        break
    if is_done:
        prev_completed_name = m['name']

# Contar completados, iniciados, no iniciados
total_modules = 0
completed_count = 0
started_count = 0
not_started_count = 0
for oid in orders:
    m = id_to_mc.get(oid)
    if not m:
        continue
    slug_base = m['slug'].replace('-', '')
    is_done = slug_status.get(slug_base, False)
    total_modules += 1
    if is_done:
        completed_count += 1
    else:
        total_proj = slug_progress.get(slug_base, {}).get('total', 0)
        if total_proj > 0:
            started_count += 1
        else:
            not_started_count += 1

# Mostrar timeline completo
print('📈 Timeline del programa:')
print()

for oid in orders:
    m = id_to_mc.get(oid)
    if not m:
        continue
    
    slug_base = m['slug'].replace('-', '')
    is_done = slug_status.get(slug_base, False)
    progress = slug_progress.get(slug_base, {})
    total = progress.get('total', 0)
    completed = progress.get('completed', 0)
    
    if is_done:
        icon = '✅'
    elif m['name'] == next_name:
        icon = '📍➡️'
    elif total > 0:
        icon = '⏳'
    else:
        icon = '⬜'
    
    label = m['name']
    if len(label) > 40:
        label = label[:37] + '...'
    
    if is_done:
        print(f'  {icon} {label}')
    elif m['name'] == next_name:
        print(f'  🟢🔜➡️ {label} ← ¡AQUÍ!')
    else:
        print(f'  {icon} {label}')
    
    # Mostrar proyectos pendientes del siguiente
    if m['name'] == next_name:
        # Buscar missing de este módulo
        for uc in data.get('cohorts', []):
            ucs = uc['cohort']['slug']
            if ucs.replace('-','') == slug_base:
                missing = uc.get('completion',{}).get('pending_required_slugs',{}).get('PROJECT',[])
                if missing:
                    for p in missing:
                        print(f'         ⬜ {p}')
                break

print()
print('=' * 50)
print(f'📍 SIGUIENTE MÓDULO: {next_name}')
if next_total > 0:
    print(f'   Progreso actual: {next_completed}/{next_total} ({next_percent}%)')
else:
    print(f'   Estado: No iniciado')
print()
if prev_completed_name:
    print(f'✅ Anterior completado: {prev_completed_name}')
print()
print(f'📊 Progreso general:')
print(f'   {completed_count} completados | {started_count} iniciados | {not_started_count} no iniciados (de {total_modules})')
"
}

# Ejecutar si se llama directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  4geeks_next_module
fi