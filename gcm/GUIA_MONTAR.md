========================================================
📌 Cómo hacer tu herramienta de commits (gcm) un comando
   global en Windows y Linux (como git, npm, etc.)
========================================================

Actualmente ejecutas:
  node d:\workspace\test-cerebras\gcm\gcm.js

Objetivo:
  poder ejecutar simplemente:
  gcm
  o incluso: git gcm (opcional)

--------------------------------------------------------
1. 🔧 OPCIÓN RECOMENDADA: npm global package (la mejor)
--------------------------------------------------------

✔ Ventajas:
- Funciona igual en Windows / Linux / macOS
- No necesitas rutas absolutas
- Fácil de actualizar
- Estándar en herramientas Node.js

📁 Estructura del proyecto:

gcm/
 ├─ bin/
 │   └─ gcm.js
 ├─ package.json
 └─ .env

--------------------------------------------------------
📌 1.1 Añade "bin" en package.json

{
  "name": "gcm",
  "version": "1.0.0",
  "bin": {
    "gcm": "./bin/gcm.js"
  }
}

--------------------------------------------------------
📌 1.2 Añade shebang en tu archivo JS

En la primera línea de bin/gcm.js:

#!/usr/bin/env node

console.log("GCM running...");

--------------------------------------------------------
📌 1.3 Da permisos en Linux / macOS

chmod +x bin/gcm.js

--------------------------------------------------------
📌 1.4 Instalar globalmente (modo desarrollo)

Dentro del proyecto:

npm link

Esto crea un comando global:
  gcm

Para desinstalar:
  npm unlink -g gcm

--------------------------------------------------------
📌 1.5 Instalación real (producción)

Cuando lo publiques:

npm install -g gcm

--------------------------------------------------------
2. 🪟 OPCIÓN WINDOWS ONLY: PATH + .cmd wrapper
--------------------------------------------------------

Si NO quieres npm:

📁 Crea carpeta:
  C:\tools\gcm\

Coloca:
  gcm.js

--------------------------------------------------------
📌 2.1 Crear archivo gcm.cmd:

@echo off
node C:\tools\gcm\gcm.js %*

--------------------------------------------------------
📌 2.2 Añadir al PATH:

1. Inicio → "Editar variables de entorno"
2. Variables del sistema → PATH
3. Añadir:
   C:\tools\gcm\

Ahora puedes ejecutar:
  gcm

--------------------------------------------------------
3. 🐧 OPCIÓN LINUX MANUAL (sin npm)
--------------------------------------------------------

📁 Colocar script:

/usr/local/bin/gcm

--------------------------------------------------------
📌 3.1 Crear archivo:

sudo nano /usr/local/bin/gcm

Contenido:

#!/usr/bin/env node
node /home/user/gcm/gcm.js "$@"

--------------------------------------------------------
📌 3.2 Dar permisos:

sudo chmod +x /usr/local/bin/gcm

--------------------------------------------------------
4. ⚡ OPCIÓN AVANZADA: alias (rápido pero limitado)
--------------------------------------------------------

Linux / macOS:
  alias gcm="node ~/gcm/gcm.js"

PowerShell:
  Set-Alias gcm "node D:\workspace\gcm\gcm.js"

⚠️ No es persistente si no lo guardas en perfil.

--------------------------------------------------------
5. 🧠 RECOMENDACIÓN FINAL
--------------------------------------------------------

✔ Mejor opción: npm bin + npm link
✔ Más profesional y portable
✔ Escala a CI/CD y publicación

--------------------------------------------------------
6. 🚀 BONUS (idea para mejorar tu tool)
--------------------------------------------------------

Puedes mejorar aún más tu CLI:

- gcm --edit
- gcm --no-commit
- gcm --type fix|feat|refactor
- gcm --scope auto-detect
- gcm init (setup repo hooks)

========================================================