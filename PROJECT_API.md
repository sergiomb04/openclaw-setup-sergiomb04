# PROJECT_API.md - Integración con 4Geeks Academy

## Estado del Proyecto
**Fecha**: 2026-06-26  
**Objetivo**: Conectar OpenClaw a la cuenta de estudiante de 4Geeks usando accessToken  
**Propietario**: Sergio (smb23845)  
**Status**: ✅ IMPLEMENTADO - Skills funcionales y probadas

## Contexto
Sergio tiene un access token almacenado en `~/.openclaw/workspace/.env` como `GEEKS_TOKEN`.  
El token es un string alfanumérico que autentica contra la API de breathecode.

## Skills Implementadas
1. **[✅] 4geeks-auth** - Verificar token y sesión activa
2. **[✅] 4geeks-projects** - Obtener lista de proyectos con estados
3. **[✅] 4geeks-pending** - Identificar trabajo pendiente
4. **[✅] 4geeks-progress** - Resumen de progreso del curso

## Información Técnica

### API Endpoint
- **URL**: `https://breathecode.herokuapp.com/v1/admissions/user/me`
- **Método**: `GET`
- **Autenticación**: `Authorization: Token {GEEKS_TOKEN}`
- **Formato**: REST API (JSON)

### Variables de Entorno
```bash
# ~/.openclaw/workspace/.env
GEEKS_TOKEN=ffea9e2b9845438d873f94fdacbb8717...  # Token de acceso
```

### Estructura de la Respuesta (campos clave)
```json
{
  "id": 21065,
  "email": "correo@hotmail.com",
  "first_name": "Nombre",
  "last_name": "Apellido1 Apellido2",
  "date_joined": "2026-02-27T13:28:16.348430Z",
  "cohorts": [
    {
      "cohort": { "slug": "spain-aie-pt-1", "name": "spain-aie-pt-1", "stage": "STARTED" },
      "role": "STUDENT",
      "finantial_status": "UP_TO_DATE",
      "educational_status": "ACTIVE",
      "completion": {
        "strategy": { "type": "LEGACY_PROJECTS" },
        "is_complete": false,
        "overall": { "total": N, "completed": N, "percent": N },
        "required": {
          "PROJECT": {
            "total": N, "completed": N, "min_percent": 100,
            "is_met": false,
            "missing": ["slug1", "slug2"]
          }
        },
        "pending_required_slugs": { "PROJECT": ["slug1", "slug2"] },
        "pending_required_count": N
      }
    }
  ]
}
```

## Estructura de Archivos (Implementada)
```
4geeks-integration/
├── README.md                  # Descripción del proyecto
├── auth/
│   └── verify.sh              # Skill 1: Verificar autenticación ✅
├── projects/
│   └── list.sh                # Skill 2: Listar proyectos con estados ✅
├── pending/
│   └── get-pending.sh         # Skill 3: Trabajo pendiente ✅
├── progress/
│   └── get-summary.sh         # Skill 4: Resumen de progreso ✅
└── shared/
    ├── api-client.sh           # Cliente HTTP compartido ✅
    └── config.json             # Configuración centralizada ✅
```

## Datos de Sergio (2026-06-26)
- **Programa**: AI Engineer (spain-aie-pt-1)
- **Inicio**: 2026-04-07 → **Fin**: 2026-11-13
- **Duración**: 72 días / 480h
- **Academia**: 4Geeks Madrid
- **Estado financiero**: UP_TO_DATE ✅
- **Cohortes**: 19 asignaturas/módulos
  - **Completados**: 7 módulos
  - **En progreso**: 12 módulos
- **Proyectos totales**: ~40
  - **Completados**: ~21
  - **Pendientes**: ~19

### Proyectos Pendientes Clave
1. **spain-aie-pt-1** (7 pendientes): milestone-web-fundamentals, terminal-challenge, collaborative-project, artist-landing, dashboard, todo-list-cli, cinema-seat-manager
2. **Advanced personal assistants** (3): openclaw-integration, openclaw-memory, openclaw-skills
3. **Backend development** (3): inventory-agent, incidents-analysis, voice-to-do-list
4. **Managing relational databases** (2): edutrack-data-audit-sql, edutrack-data-audit-sql-related-tables
5. **Others** (4): launch-ready-containerized-mvp, designing-data-pipeline, triage-queue, todo-list-cli-python

## Dependencias
- `curl` - Para hacer requests HTTP
- `python3` - Para procesar JSON
- `bash` - Para ejecutar scripts

## Comandos de Uso
```bash
# Verificar sesión
bash auth/verify.sh

# Listar proyectos
bash projects/list.sh
bash projects/list.sh "spain-aie-pt-1"  # Filtrar por cohorte

# Ver pendientes
bash pending/get-pending.sh

# Resumen de progreso
bash progress/get-summary.sh
```

## Notas Importantes
- ✅ Token renombrado de `4GEEKS_ACCESS_TOKEN` a `GEEKS_TOKEN` (evita problemas con shell)
- ✅ Autenticación funciona con `Authorization: Token` (no Bearer)
- ✅ Un solo endpoint (`/user/me`) provee datos para las 4 skills
- ✅ La respuesta ya incluye proyectos pendientes, completados y porcentajes
- Mantener seguridad del token (no exponer en logs)
- Cachear respuestas ocasionalmente para no saturar la API

## Próximos Pasos
1. Crear skill oficial en OpenClaw (Skill Workshop)
2. Añadir más endpoints si es necesario (detalles de proyectos individuales)
3. Integrar como comandos naturales en la conversación

## Contacto
- Sergio: Telegram @smb23845
- Token almacenado: ~/.openclaw/workspace/.env