#!/usr/bin/env bash
# analyze_cohorts.sh - Analizar estructura del cohort principal

TOKEN=*** '^GEEKS_TOKEN=' "$(dirname "$0")/../.env" | cut -d'=' -f2)

curl -s -H "Authorization: Token ${TOKEN}" \
  "https://breathecode.herokuapp.com/v1/admissions/user/me" | python3 -c "
import sys, json

data = json.load(sys.stdin)

for c in data.get('cohorts', []):
    if c['cohort']['slug'] == 'spain-aie-pt-1':
        mc = c['cohort']
        print('=== MAIN COHORT ===')
        print(f'Micro-cohorts slugs in order:')
        for m in mc.get('micro_cohorts', []):
            sv = m.get('syllabus_version', {})
            print(f'  - {m[\"slug\"]}  ({m[\"name\"]})')
        
        print()
        print('=== ESTADO DE CADA SUBMODULO ===')
        orders = mc.get('cohorts_order', '').split(',')
        print(f'Orden de cohortes: {orders}')
        print()
        
        # Mapear cada micro_cohort a estado real
        for m in mc.get('micro_cohorts', []):
            slug = m['slug']
            user_slug = None
            
            # Encontrar el slug del usuario que coincide
            for uc in data.get('cohorts', []):
                ucs = uc['cohort']['slug']
                # Coincidencia exacta o fuzzy para slugs con guiones
                if ucs == slug or slug in ucs or ucs.replace('-','') == slug.replace('-',''):
                    user_slug = ucs
                    comp = uc.get('completion', {})
                    overall = comp.get('overall', {})
                    is_done = comp.get('is_complete', False)
                    total = overall.get('total', 0)
                    completed = overall.get('completed', 0)
                    percent = overall.get('percent', 0)
                    pending = comp.get('pending_required_count', 0)
                    missing = comp.get('pending_required_slugs', {}).get('PROJECT', [])
                    
                    status = '✅ COMPLETADO' if is_done else f'⏳ {completed}/{total} ({percent}%) pend={pending}'
                    print(f'{status} | {m[\"name\"]}')
                    if not is_done and missing:
                        for p in missing:
                            print(f'        ⬜ {p}')
                    break
            else:
                print(f'❓ NO ENCONTRADO | {m[\"name\"]} (slug: {slug})')
        
        print()
        # Mostrar education_status
        print(f'Educational status: {c.get(\"educational_status\")}')
        print(f'Current module index: {mc.get(\"current_module\")}')
        print(f'Current day: {mc.get(\"current_day\")}')
        break
"