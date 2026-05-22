# gcm — Git Commit Message AI

Herramienta CLI para generar mensajes de commit tipo Conventional Commits usando la API de Cerebras/OpenAI.

## Qué hace

- Detecta si estás dentro de un repositorio Git.
- Lee los cambios staged (`git diff --cached`).
- Solicita al modelo `llama3.1-8b` un mensaje de commit estructurado.
- Muestra el título y cuerpo generados.
- Permite confirmar, cancelar o editar antes del commit.
- Ejecuta `git commit` automáticamente si aceptas.

## Requisitos

- Windows 11 (funciona desde cualquier carpeta del sistema).
- Node.js instalado.
- Variable de entorno `CEREBRAS_API_KEY` configurada.
- Repositorio Git existente con cambios staged.

## Instalación local

1. Abre PowerShell en `d:\workspace\test-cerebras\gmc`
2. Instala dependencias:
   ```powershell
   npm install
   ```
3. Configura tu clave de API:
   ```powershell
   setx CEREBRAS_API_KEY "TU_API_KEY_AQUI"
   ```
4. Cierra y vuelve a abrir PowerShell para que la variable esté disponible.

## Uso rápido

Desde cualquier repositorio Git:

1. Agrega cambios al stage:
   ```powershell
   git add .
   ```
2. Ejecuta el CLI:
   ```powershell
   node d:\workspace\test-cerebras\gmc\gcm.js
   ```

## Instalación global

Para usar el comando `gcm` desde cualquier carpeta:

```powershell
cd d:\workspace\test-cerebras\gmc
npm link
```

O instalar globalmente:

```powershell
npm install -g .
```

Luego puedes ejecutar:

```powershell
gcm
```

## Comportamiento interactivo

El CLI pregunta:

- `Y` para crear el commit.
- `N` para cancelar.
- `E` para editar el mensaje de commit antes de ejecutar.

## Notas

- Si no estás en un repositorio git, el script mostrará un error y saldrá.
- Si no hay cambios staged, te pedirá usar `git add`.
- Si la variable `CEREBRAS_API_KEY` no está definida, no se puede consultar la API.

## Archivo principal

- `gcm.js` — script CLI principal.
- `package.json` — configuración del paquete y `bin` para el comando global.

## Extras

- Filtra automáticamente diff de archivos grandes comunes como `package-lock.json`, `dist/`, `node_modules/`.
- Detecta el tipo de commit (`feat`, `fix`, `refactor`, `chore`, etc.) desde el título generado.
