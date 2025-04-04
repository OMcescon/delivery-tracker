# Pasos para Desplegar en Vercel usando PowerShell

Esta guía proporciona los comandos específicos de PowerShell para desplegar tu aplicación Delivery Tracker en Vercel.

## Requisitos Previos

- Tener una cuenta en [Vercel](https://vercel.com)
- Tener instalado Node.js y npm
- Tener Git instalado (opcional, pero recomendado)

## Pasos para el Despliegue

### 1. Instalar la CLI de Vercel

Abre PowerShell y ejecuta:

```powershell
npm install -g vercel
```

### 2. Iniciar Sesión en Vercel

```powershell
vercel login
```

Sigue las instrucciones en pantalla para completar el inicio de sesión.

### 3. Navegar al Directorio del Proyecto

```powershell
cd "C:\Users\PC\Trae IA\delivery-tracker"
```

### 4. Verificar que el Proyecto está Listo

```powershell
npm run lint
```

Asegúrate de que no hay errores de linting.

### 5. Desplegar en Vercel

```powershell
vercel
```

Sigue las instrucciones en pantalla. Vercel te hará algunas preguntas:

- **¿Configurar y desplegar?** Selecciona "Y" (Sí)
- **¿En qué ámbito deseas desplegar?** Selecciona tu cuenta personal o equipo
- **¿Vincular a un proyecto existente?** Si es la primera vez, selecciona "N" (No)
- **¿Cuál es el nombre del proyecto?** Puedes usar "delivery-tracker" o el nombre que prefieras
- **¿En qué directorio está tu código?** Presiona Enter para usar el directorio actual
- **¿Quieres sobrescribir la configuración?** Selecciona "N" (No) ya que tienes un archivo vercel.json
- **¿Quieres modificar estas configuraciones?** Selecciona "N" (No) para usar la configuración predeterminada

### 6. Desplegar a Producción

Una vez que hayas verificado que el despliegue de vista previa funciona correctamente, puedes desplegar a producción:

```powershell
vercel --prod
```

### 7. Abrir la Aplicación Desplegada

Vercel proporcionará una URL al finalizar el despliegue. Puedes abrirla directamente desde PowerShell:

```powershell
Start-Process "https://delivery-tracker.vercel.app" # Reemplaza con tu URL real
```

## Configuración de Variables de Entorno

Si necesitas configurar variables de entorno adicionales, puedes hacerlo a través de la interfaz web de Vercel o mediante la CLI:

```powershell
vercel env add NOMBRE_VARIABLE
```

Sigue las instrucciones para ingresar el valor de la variable.

## Configuración de Dominio Personalizado

Para configurar un dominio personalizado mediante la CLI:

```powershell
vercel domains add midominio.com
```

Sigue las instrucciones para completar la configuración del dominio.

## Actualización de la Aplicación

Cuando realices cambios en tu aplicación y quieras actualizarla en Vercel, simplemente ejecuta:

```powershell
vercel
```

Y para actualizar la versión de producción:

```powershell
vercel --prod
```

## Solución de Problemas

### Ver Logs de la Aplicación

```powershell
vercel logs delivery-tracker
```

### Eliminar un Despliegue

```powershell
vercel remove delivery-tracker
```

### Obtener Ayuda

```powershell
vercel --help
```