@echo off
setlocal enabledelayedexpansion
echo Iniciando Delivery Tracker...

:: Navegar al directorio del proyecto
cd /d "c:\Users\PC\Trae IA\delivery-tracker"

:: Verificar si hay procesos usando el puerto 3000 y terminarlos
echo Verificando si el puerto 3000 está en uso...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    set PID=%%a
    if not "!PID!"=="" (
        echo Terminando proceso con PID !PID! que está usando el puerto 3000
        taskkill /F /PID !PID!
        if !errorlevel! equ 0 (
            echo Proceso terminado exitosamente
        ) else (
            echo No se pudo terminar el proceso. Puede requerir permisos de administrador.
        )
    )
)

:: Eliminar el archivo de puerto si existe
if exist current_port.txt del current_port.txt

:: Iniciar el servidor en segundo plano
echo Iniciando servidor...
start cmd /c "npm run dev:mobile"

:: Esperar unos segundos para que el servidor inicie completamente
timeout /t 5 /nobreak

:: Verificar si se creó el archivo con el puerto
if exist current_port.txt (
    :: Leer el puerto desde el archivo
    set /p PORT=<current_port.txt
    echo Usando puerto: !PORT!
    
    :: Abrir el navegador con la URL correcta
    start http://localhost:!PORT!
) else (
    :: Si no se creó el archivo, intentar con el puerto predeterminado
    echo No se pudo determinar el puerto, intentando con el puerto predeterminado 3000
    start http://localhost:3000
)

echo Delivery Tracker iniciado correctamente.