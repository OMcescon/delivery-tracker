# Script PowerShell para crear un acceso directo en el escritorio

# Ruta del archivo batch que inicia la aplicación
$targetPath = "$PSScriptRoot\iniciar-delivery-tracker.bat"

# Ruta del escritorio
$desktopPath = [Environment]::GetFolderPath("Desktop")

# Nombre del acceso directo
$shortcutName = "Delivery Tracker.lnk"

# Ruta completa del acceso directo
$shortcutPath = Join-Path -Path $desktopPath -ChildPath $shortcutName

# Crear el objeto WScript.Shell
$WScriptShell = New-Object -ComObject WScript.Shell

# Crear el acceso directo
$Shortcut = $WScriptShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = $targetPath
$Shortcut.WorkingDirectory = "$PSScriptRoot"
$Shortcut.Description = "Iniciar Delivery Tracker"

# Establecer un icono personalizado (usando uno de los iconos de la aplicación)
$iconPath = "$PSScriptRoot\public\window.svg"
if (Test-Path $iconPath) {
    $Shortcut.IconLocation = $iconPath
}

# Guardar el acceso directo
$Shortcut.Save()

Write-Host "Acceso directo creado en el escritorio: $shortcutPath"