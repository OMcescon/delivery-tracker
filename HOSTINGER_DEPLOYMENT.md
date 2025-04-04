# Guía de Despliegue en Hostinger para Delivery Tracker

Esta guía te ayudará a desplegar tu aplicación Next.js en Hostinger paso a paso.

## Índice
1. [Preparación del proyecto](#1-preparación-del-proyecto)
2. [Configuración para producción](#2-configuración-para-producción)
3. [Construcción de la aplicación](#3-construcción-de-la-aplicación)
4. [Configuración de PM2](#4-configuración-de-pm2)
5. [Subida de archivos a Hostinger](#5-subida-de-archivos-a-hostinger)
6. [Configuración en el panel de Hostinger](#6-configuración-en-el-panel-de-hostinger)
7. [Verificación y solución de problemas](#7-verificación-y-solución-de-problemas)

## 1. Preparación del proyecto

Antes de desplegar, asegúrate de que tu proyecto esté listo para producción:

1. Verifica que todas las dependencias estén correctamente instaladas:
   ```bash
   npm install
   ```

2. Asegúrate de que tu aplicación funcione correctamente en modo de desarrollo:
   ```bash
   npm run dev
   ```

3. Verifica que no haya errores de linting:
   ```bash
   npm run lint
   ```

## 2. Configuración para producción

La configuración actual de tu proyecto ya incluye algunas optimizaciones para producción en el archivo `next.config.js`, como la opción `output: 'standalone'` que genera una carpeta `.next/standalone` con todo lo necesario para ejecutar la aplicación sin dependencias externas.

Sin embargo, para un despliegue óptimo en Hostinger, crearemos un archivo de servidor específico para producción:

1. Crea un archivo `server.prod.js` en la raíz del proyecto con el siguiente contenido:

```javascript
// server.prod.js - Optimizado para entorno de producción en Hostinger
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

// En producción, siempre usamos el modo de producción
const app = next({ dev: false, dir: path.resolve(__dirname) });
const handle = app.getRequestHandler();

// Puerto configurado en Hostinger (normalmente 3000)
const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    // Manejo de solicitudes HTTP
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Servidor en producción ejecutándose en puerto ${PORT}`);
  });
});
```

2. Actualiza el archivo `package.json` para incluir un script de inicio para producción:

```json
"scripts": {
  "dev": "next dev",
  "dev:mobile": "node server.js",
  "build": "next build",
  "start": "NODE_ENV=production node server.prod.js",
  "start:win": "set NODE_ENV=production&& node server.prod.js",
  "lint": "next lint"
}
```

## 3. Construcción de la aplicación

Ahora, construye la aplicación para producción:

```bash
npm run build
```

Esto generará una carpeta `.next` con la versión optimizada de tu aplicación. Con la configuración `output: 'standalone'` en `next.config.js`, también se creará una carpeta `.next/standalone` que contiene todo lo necesario para ejecutar la aplicación sin dependencias externas.

## 4. Configuración de PM2

PM2 es un gestor de procesos para Node.js que te ayudará a mantener tu aplicación en ejecución en Hostinger. Crea un archivo `ecosystem.config.js` en la raíz del proyecto:

```javascript
module.exports = {
  apps: [
    {
      name: "delivery-tracker",
      script: "server.prod.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      watch: false,
      merge_logs: true,
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};
```

## 5. Subida de archivos a Hostinger

Para subir tu aplicación a Hostinger, necesitarás:

1. Acceder a tu panel de control de Hostinger
2. Ir a la sección de "Hosting" y seleccionar tu dominio
3. Usar el Administrador de Archivos o FTP para subir los archivos

### Usando el Administrador de Archivos:

1. Ve a la sección "Archivos" > "Administrador de archivos"
2. Navega hasta la carpeta donde quieres alojar tu aplicación (normalmente `public_html` o una subcarpeta)
3. Sube los siguientes archivos y carpetas:
   - Carpeta `.next`
   - Carpeta `public`
   - Archivo `package.json`
   - Archivo `server.prod.js`
   - Archivo `ecosystem.config.js`
   - Archivo `next.config.js`

### Usando FTP:

1. Usa un cliente FTP como FileZilla
2. Conéctate a tu servidor usando las credenciales proporcionadas por Hostinger
3. Sube los mismos archivos y carpetas mencionados anteriormente

## 6. Configuración en el panel de Hostinger

### Activar Node.js:

1. En el panel de Hostinger, ve a "Hosting" > tu dominio > "Sitio web" > "Node.js"
2. Activa Node.js
3. Configura la aplicación:
   - **Directorio de la aplicación**: La ruta donde subiste tus archivos (ej. `/public_html/delivery-tracker`)
   - **Punto de entrada**: `server.prod.js`
   - **Versión de Node.js**: Selecciona la versión compatible con tu proyecto (recomendado: 18.x o superior)

### Configurar variables de entorno (si es necesario):

1. En la misma sección de Node.js, busca la opción para configurar variables de entorno
2. Añade las variables necesarias, como:
   - `NODE_ENV=production`
   - `PORT=3000`

### Instalar dependencias y PM2:

1. Accede a tu servidor mediante SSH (las credenciales están en el panel de Hostinger)
2. Navega hasta el directorio de tu aplicación:
   ```bash
   cd /public_html/delivery-tracker
   ```
3. Instala las dependencias:
   ```bash
   npm install --production
   ```
4. Instala PM2 globalmente:
   ```bash
   npm install -g pm2
   ```
5. Inicia tu aplicación con PM2:
   ```bash
   pm2 start ecosystem.config.js
   ```
6. Configura PM2 para iniciar automáticamente después de un reinicio:
   ```bash
   pm2 startup
   pm2 save
   ```

## 7. Verificación y solución de problemas

### Verificar que la aplicación está funcionando:

1. Accede a tu dominio en el navegador
2. Verifica que la aplicación se carga correctamente

### Solución de problemas comunes:

#### La aplicación no se inicia:

1. Verifica los logs de PM2:
   ```bash
   pm2 logs
   ```
2. Asegúrate de que el puerto configurado (3000) está disponible y permitido por Hostinger

#### Errores 502 Bad Gateway:

1. Verifica que Node.js está activado en el panel de Hostinger
2. Comprueba que PM2 está ejecutando tu aplicación:
   ```bash
   pm2 list
   ```
3. Reinicia la aplicación si es necesario:
   ```bash
   pm2 restart delivery-tracker
   ```

#### Problemas con rutas o recursos estáticos:

1. Asegúrate de que la carpeta `public` se ha subido correctamente
2. Verifica que las rutas en tu aplicación son relativas y no absolutas

### Contactar con soporte de Hostinger:

Si continúas teniendo problemas, el soporte de Hostinger puede ayudarte. Proporciona información detallada sobre el error y los pasos que has seguido para facilitar la asistencia.

---

¡Felicidades! Tu aplicación Delivery Tracker debería estar ahora desplegada y funcionando en Hostinger. Si tienes alguna pregunta adicional o encuentras algún problema específico, no dudes en consultar la documentación de Hostinger o contactar con su soporte técnico.