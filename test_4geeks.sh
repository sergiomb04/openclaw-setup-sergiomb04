#!/bin/bash

TOKEN=*** '^GEEKS_TOKEN=' "$(dirname "$0")/../.env" | cut -d'=' -f2)

echo "Probando diferentes endpoints de 4Geeks API..."

# Lista de endpoints comunes para probar
ENDPOINTS=(
    "https://api.4geeks.io/v1/me"
    "https://api.4geeks.io/v1/profile"
    "https://api.4geeks.io/v1/user"
    "https://sandbox.4geeks.io/api/v1/me"
    "https://sandbox.4geeks.io/api/v1/profile"
    "https://sandbox.4geeks.io/api/v1/user"
    "https://api.4geeks.com/v1/me"
    "https://api.4geeks.com/v1/profile"
    "https://student.4geeks.io/api/v1/me"
    "https://student.4geeks.io/api/v1/profile"
)

for endpoint in "${ENDPOINTS[@]}"; do
    echo -e "\nProbando: $endpoint"
    response=$(curl -s -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$endpoint")
    status_code=${response: -3}
    body=${response:0:-3}
    
    if [[ "$status_code" =~ ^[2-3][0-9][0-9]$ ]]; then
        echo "✅ Éxito! Status: $status_code"
        echo "Respuesta: $body" | head -c 200
        break
    else
        echo "❌ Falló: $status_code"
    fi
done

echo -e "\nPruebas completadas."