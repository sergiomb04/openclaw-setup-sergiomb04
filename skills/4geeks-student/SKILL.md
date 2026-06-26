---
name: "4geeks-student"
description: "Consultar datos de estudiante 4Geeks: auth, proyectos, pendientes y progreso"
---

# Skill: 4geeks-student

## Objetivo
Consultar información de estudiante de 4Geeks Academy: autenticación, proyectos, trabajo pendiente, progreso del curso, proyectos iniciados y siguiente módulo.

## Directorio
`.openclaw/skills/4geeks-student/` — Todos los archivos residen aquí.

## Configuración
- Token en `~/.openclaw/workspace/.env`: `GEEKS_TOKEN=***
- API Base: `https://breathecode.herokuapp.com/v1/admissions`
- Autenticación: `Authorization: Token {token}`

## Endpoints
- `GET /user/me` — Obtiene perfil completo del estudiante con cohorts, proyectos y progreso.

## Skills Hijas (6 skills)

### 1. Verificar autenticación — `auth/verify.sh`
- **Lenguaje natural**: "Verifica mi sesión", "¿Estoy autenticado?", "Comprueba mi token"
- **Comando**: `bash .openclaw/skills/4geeks-student/auth/verify.sh`
- **Qué hace**: Verifica el token contra `/user/me`. Muestra nombre, email, programa y conteo de módulos.

### 2. Listar proyectos — `projects/list.sh`
- **Lenguaje natural**: "¿Qué proyectos tengo?", "Lista mis proyectos", "Muéstrame los proyectos del curso"
- **Comando**: `bash .openclaw/skills/4geeks-student/projects/list.sh [cohort_slug]`
- **Qué hace**: Proyectos agrupados por módulo con estado y progreso porcentual.

### 3. Trabajo pendiente — `pending/get-pending.sh`
- **Lenguaje natural**: "¿Qué me falta por entregar?", "¿Qué tengo pendiente?", "¿Cuáles son mis tareas sin entregar?"
- **Comando**: `bash .openclaw/skills/4geeks-student/pending/get-pending.sh`
- **Qué hace**: Muestra SOLO los proyectos pendientes, agrupados por módulo.

### 4. Resumen de progreso — `progress/get-summary.sh`
- **Lenguaje natural**: "¿Cómo va mi progreso?", "¿Cuánto llevo del curso?", "Resumen de mi avance"
- **Comando**: `bash .openclaw/skills/4geeks-student/progress/get-summary.sh`
- **Qué hace**: Tabla completa de progreso con porcentajes, totales y estado financiero.

### 5. Proyectos iniciados — `started/list-started.sh`
- **Lenguaje natural**: "¿Qué me falta por entregar y está iniciado?", "¿Qué proyectos he empezado pero no terminado?", "Muéstrame solo los que ya empecé"
- **Comando**: `bash .openclaw/skills/4geeks-student/started/list-started.sh`
- **Qué hace**: Filtra módulos con al menos un proyecto iniciado pero incompleto. Muestra progreso parcial.

### 6. Siguiente módulo — `next/get-next-module.sh`
- **Lenguaje natural**: "¿Cuál es mi siguiente módulo?", "¿Qué toca hacer ahora?", "¿Cuál es el próximo submódulo del curso?"
- **Comando**: `bash .openclaw/skills/4geeks-student/next/get-next-module.sh`
- **Qué hace**: Usa el orden real del syllabus (`cohorts_order`), encuentra el primer módulo no completado y muestra timeline completo, proyectos pendientes y estadísticas.

## Archivos
```
.openclaw/skills/4geeks-student/
├── SKILL.md                    ← Este archivo
├── auth/verify.sh              # Skill 1
├── projects/list.sh            # Skill 2
├── pending/get-pending.sh      # Skill 3
├── progress/get-summary.sh     # Skill 4
├── started/list-started.sh     # Skill 5
├── next/get-next-module.sh     # Skill 6
├── scripts/analyze_cohorts.sh  # Análisis auxiliar
└── shared/
    ├── api-client.sh           # Cliente HTTP compartido
    └── config.json             # Configuración centralizada
```

## Dependencias
- `curl` — Para requests HTTP
- `python3` — Para procesar JSON
- `bash` — Entorno de ejecución
- `.env` en workspace raíz con `GEEKS_TOKEN`

## Notas
- Todos los paths son relativos a `.openclaw/skills/4geeks-student/`
- El cliente HTTP busca `.env` en `~/.openclaw/workspace/.env`
- Ejecutar desde el workspace raíz: `bash .openclaw/skills/4geeks-student/auth/verify.sh`
