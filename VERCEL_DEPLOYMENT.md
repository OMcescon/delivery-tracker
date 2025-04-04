# Guía de Despliegue en Vercel para Delivery Tracker

Esta guía te ayudará a desplegar tu aplicación Next.js en Vercel paso a paso.

## Índice
1. [Preparación del proyecto](#1-preparación-del-proyecto)
2. [Configuración para Vercel](#2-configuración-para-vercel)
3. [Despliegue en Vercel](#3-despliegue-en-vercel)
4. [Configuración de dominio personalizado](#4-configuración-de-dominio-personalizado)
5. [Verificación y solución de problemas](#5-verificación-y-solución-de-problemas)

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

## 2. Configuración para Vercel

Tu proyecto ya incluye la configuración necesaria para Vercel en el archivo `next.config.js` con la opción `output: 'standalone'` y otras optimizaciones. También tienes un archivo `vercel.json` con la configuración básica.

Asegúrate de tener el archivo `.env.local` con las variables de entorno necesarias:

```
# Variables de entorno para Vercel
NEXT_PUBLIC_VERCEL_ENV=production
```

## 3. Despliegue en Vercel

Hay dos formas de desplegar tu aplicación en Vercel: a través de la interfaz web o usando la CLI de Vercel.

### Opción 1: Despliegue a través de la interfaz web

1. Crea una cuenta en [Vercel](https://vercel.com) si aún no tienes una.

2. Conecta tu repositorio de GitHub, GitLab o Bitbucket donde está alojado tu proyecto.

3. Importa tu proyecto desde el repositorio:
   - Ve a tu [Dashboard de Vercel](https://vercel.com/dashboard)
   - Haz clic en "New Project"
   - Selecciona tu repositorio
   - Configura las opciones de despliegue (Vercel detectará automáticamente que es un proyecto Next.js)
   - Haz clic en "Deploy"

### Opción 2: Despliegue usando la CLI de Vercel

1. Instala la CLI de Vercel globalmente:
   ```bash
   npm install -g vercel
   ```

2. Inicia sesión en tu cuenta de Vercel:
   ```bash
   vercel login
   ```

3. Navega al directorio de tu proyecto y ejecuta el comando de despliegue:
   ```bash
   cd path/to/delivery-tracker
   vercel
   ```

4. Sigue las instrucciones en pantalla para completar el despliegue.

5. Para desplegar a producción, usa:
   ```bash
   vercel --prod
   ```

## 4. Configuración de dominio personalizado

Para configurar un dominio personalizado en Vercel:

1. Ve a tu [Dashboard de Vercel](https://vercel.com/dashboard)

2. Selecciona tu proyecto

3. Ve a la pestaña "Settings" > "Domains"

4. Agrega tu dominio personalizado

5. Sigue las instrucciones para configurar los registros DNS:
   - Si tu dominio está registrado en otro proveedor, necesitarás configurar los registros DNS en ese proveedor
   - Si tu dominio está registrado en Vercel, la configuración será automática

### Configuración de registros DNS (si tu dominio está en otro proveedor):

1. Configura un registro A que apunte a las IPs de Vercel:
   ```
   A     @     76.76.21.21
   ```

2. Configura un registro CNAME para el subdominio "www":
   ```
   CNAME  www   [tu-proyecto].vercel.app
   ```

## 5. Verificación y solución de problemas

### Verificar que la aplicación está funcionando:

1. Accede a la URL proporcionada por Vercel (o tu dominio personalizado)
2. Verifica que la aplicación se carga correctamente

### Solución de problemas comunes:

#### La aplicación no se despliega correctamente:

1. Verifica los logs de despliegue en el Dashboard de Vercel
2. Asegúrate de que todas las dependencias están correctamente instaladas
3. Verifica que no hay errores en el proceso de construcción

#### Problemas con variables de entorno:

1. Verifica que has configurado correctamente las variables de entorno en el Dashboard de Vercel (Settings > Environment Variables)
2. Asegúrate de que las variables de entorno están siendo utilizadas correctamente en tu código

#### Problemas con el dominio personalizado:

1. Verifica que los registros DNS están correctamente configurados
2. Ten en cuenta que los cambios en DNS pueden tardar hasta 48 horas en propagarse completamente

### Ventajas de Vercel sobre Hostinger para aplicaciones Next.js:

- Optimización específica para Next.js (Vercel es el creador de Next.js)
- Despliegues automáticos con cada push a tu repositorio
- Previews automáticas para pull requests
- Escalado automático sin configuración adicional
- CDN global integrado para mejor rendimiento
- Certificados SSL automáticos y gratuitos
- No es necesario configurar PM2 ni otros gestores de procesos