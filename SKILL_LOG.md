# SKILL_LOG.md — Registro de Skills de 4Geeks Student

## Descripción General
Sistema de 6 skills para consultar información de estudiante en 4Geeks Academy, todas basadas en el endpoint `GET /v1/admissions/user/me` con autenticación `Authorization: Token {token}`.

**API Base**: `https://breathecode.herokuapp.com/v1/admissions`
**Token**: `GEEKS_TOKEN` en `~/.openclaw/workspace/.env`
**Creado**: 2026-06-26 | **Propietario**: Sergio (smb23845)

---

## Skill 1 — Verificar autenticación (auth/verify.sh) [✅]
### Prompt en lenguaje natural
> "Verifica mi sesión"
> "¿Estoy autenticado?"
> "Comprueba mi token"

### Descripción
Verifica que el token de acceso sea válido contactando el endpoint `/user/me`. Muestra nombre completo, email, programa principal (AI Engineer), cantidad de módulos completados vs pendientes y confirma que la sesión está activa.

### Resultado de prueba
```
✅ ¡Autenticación exitosa!
👤 Usuario: Sergio MB
📧 Email: correo@hotmail.com
📚 Programa: AI Engineer
📦 Módulos: 19 cohortes/asignaturas
✅ Completados: 7 módulos
⏳ En progreso: 12 módulos
🔑 Sesión activa y funcional
```

---

## Skill 2 — Listar proyectos (projects/list.sh) [✅]
### Prompt en lenguaje natural
> "¿Qué proyectos tengo?"
> "Lista mis proyectos"
> "Muéstrame los proyectos del curso"

### Descripción
Obtiene todos los proyectos agrupados por módulo/asignatura. Cada módulo muestra: nombre, progreso (completados/total), porcentaje y slugs de proyectos pendientes. Incluye resumen global con totales. Acepta filtro opcional por slug de cohorte.

### Resultado de prueba
```
📚 Proyectos por módulo:
  ⏳ Advanced personal assistants with Openclaw
     Progreso: 0/3 (0.0%)
     📌 Pendientes: openclaw-integration, openclaw-memory, openclaw-skills
  ✅ Personal assistants with Openclaw
     Progreso: 2/2 (100.0%)
  ...

📊 Resumen global:
   ✅ Completados: 18
   ⏳ Pendientes: 19
   📦 Total: 37
```

---

## Skill 3 — Trabajo pendiente (pending/get-pending.sh) [✅]
### Prompt en lenguaje natural
> "¿Qué me falta por entregar?"
> "¿Qué tengo pendiente?"
> "¿Cuáles son mis tareas sin entregar?"

### Descripción
Filtra y muestra SOLO los módulos con proyectos incompletos. Lista cada módulo con nombre, slug y todos los proyectos pendientes. Muestra conteo total de pendientes al inicio.

### Resultado de prueba
```
🔴 Tienes 19 proyectos pendientes:

📁 Advanced personal assistants with Openclaw
   ⬜ openclaw-integration
   ⬜ openclaw-memory
   ⬜ openclaw-skills
📁 Managing relational databases with FastAPI
   ⬜ edutrack-data-audit-sql
   ⬜ edutrack-data-audit-sql-related-tables
...
```

---

## Skill 4 — Resumen de progreso (progress/get-summary.sh) [✅]
### Prompt en lenguaje natural
> "¿Cómo va mi progreso?"
> "¿Cuánto llevo del curso?"
> "Resumen de mi avance"

### Descripción
Genera un resumen completo del bootcamp: datos del estudiante, fechas del programa principal, tabla de progreso por módulo con porcentajes, total global, conteo de completados vs pendientes y estado financiero.

### Resultado de prueba
```
👤 Sergio Munera Blasco  |  correo@hotmail.com
📅 Desde: 2026-02-27
🎓 Programa Principal: AI Engineer (72 días / 480h)
📈 Progreso por Asignatura:
  Personal assistants with Openclaw  2/2  ✅ 100.0%
  Coding Fundamentals with Typescript 4/4  ✅ 100.0%
  ...
  TOTAL                              21/40  52%
⏳ Proyectos pendientes: 19
✅ Módulos completados: 7
💰 Estado financiero: UP_TO_DATE
```

---

## Skill 5 — Proyectos iniciados (started/list-started.sh) [✅]
### Prompt en lenguaje natural
> "¿Qué me falta por entregar y está iniciado?"
> "¿Qué proyectos he empezado pero no terminado?"
> "Muéstrame solo los que ya empecé"

### Descripción
Lista únicamente los módulos que tienen al menos un proyecto iniciado pero incompleto (excluye módulos no empezados y completamente terminados). Muestra progreso parcial y pendientes de cada uno.

### Resultado de prueba
```
🔶 Tienes 8 módulos con proyectos iniciados (19 pendientes):

📁 Advanced personal assistants with Openclaw
   Progreso: 0/3 (0.0%)
   ⬜ openclaw-integration, openclaw-memory, openclaw-skills
📁 Coding fundamentals with Python
   Progreso: 0/1 (0.0%)
   ⬜ todo-list-cli-python
📁 Backend development with Coding Agents
   Progreso: 0/3 (0.0%)
   ⬜ ai-basic-inventory-agent-loop, ai-eng-company-incidents-analysis, voice-to-do-list-api
...
```

---

## Skill 6 — Siguiente módulo (next/get-next-module.sh) [✅]
### Prompt en lenguaje natural
> "¿Cuál es mi siguiente módulo?"
> "¿Qué toca hacer ahora?"
> "¿Cuál es el próximo submódulo del curso?"

### Descripción
Determina el orden real del syllabus del cohorte principal (spain-aie-pt-1) mediante el campo `cohorts_order`. Recorre los micro-cohorts en ese orden, encuentra el primero NO completado y muestra: timeline completo, datos del módulo actual (proyectos pendientes), anterior completado y estadísticas generales.

### Resultado de prueba
```
📍 SIGUIENTE MÓDULO: Advanced personal assistants with Openclaw
   Progreso actual: 0/3 (0.0%)
   Proyectos: openclaw-integration, openclaw-memory, openclaw-skills
✅ Anterior completado: Working with AI coding agents
📊 Progreso general: 6 completados | 7 iniciados | 4 no iniciados (de 17)
```

---

## Orden Real del Syllabus (spain-aie-pt-1)

| # | Módulo | Estado |
|---|--------|--------|
| 1 | Web UI fundamentals with Tailwind | ✅ Completado |
| 2 | Command Line, Git and Github | ✅ Completado |
| 3 | Coding Fundamentals with Typescript | ✅ Completado |
| 4 | Frontend development with Coding Agents | ✅ Completado |
| 5 | Personal assistants with Openclaw | ✅ Completado |
| 6 | Working with AI coding agents | ✅ Completado |
| **7** | **Advanced personal assistants with Openclaw** | **➡️ ACTUAL** |
| 8 | Coding fundamentals with Python | ⏳ Iniciado |
| 9 | Backend development with Coding Agents | ⏳ Iniciado |
| 10 | Authentication in web applications | ⬜ No iniciado |
| 11 | Error handling, debugging and testing | ⬜ No iniciado |
| 12 | Managing relational databases with FastAPI | ⏳ Iniciado |
| 13 | Container applications with Docker | ⏳ Iniciado |
| 14 | Architecture optimization | ⬜ No iniciado |
| 15 | Application telemetry | ⬜ No iniciado |
| 16 | Implementing Data Pipelines | ⏳ Iniciado |
| 17 | Asynchronous processing and offloading | ⏳ Iniciado |

---

## Comandos Rápidos

```bash
# Ejecutar cualquier skill
cd ~/.openclaw/workspace/4geeks-integration

bash auth/verify.sh             # Skill 1: Verificar sesión
bash projects/list.sh           # Skill 2: Listar proyectos
bash pending/get-pending.sh     # Skill 3: Trabajo pendiente
bash progress/get-summary.sh    # Skill 4: Resumen de progreso
bash started/list-started.sh    # Skill 5: Proyectos iniciados
bash next/get-next-module.sh    # Skill 6: Siguiente módulo
```
