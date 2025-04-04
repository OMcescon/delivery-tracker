# Despliegue en Hostinger - Guía Rápida

Este documento es un complemento a la guía detallada `HOSTINGER_DEPLOYMENT.md` y proporciona un resumen de los pasos clave para desplegar esta aplicación Next.js en Hostinger.

## Archivos de configuración creados

Para facilitar el despliegue en Hostinger, se han creado los siguientes archivos:

1. `server.prod.js` - Servidor optimizado para producción
2. `ecosystem.config.js` - Configuración para PM2
3. `HOSTINGER_DEPLOYMENT.md` - Guía detallada paso a paso

## Pasos rápidos para el despliegue

1. **Construir la aplicación**:
   ```bash
   npm run build
   ```

2. **Archivos a subir a Hostinger**:
   - Carpeta `.next`
   - Carpeta `public`
   - `package.json`
   - `server.prod.js`
   - `ecosystem.config.js`
   - `next.config.js`

3. **En el panel de Hostinger**:
   - Activar Node.js
   - Configurar el directorio de la aplicación
   - Establecer `server.prod.js` como punto de entrada
   - Configurar variables de entorno: `NODE_ENV=production` y `PORT=3000`

4. **Mediante SSH**:
   ```bash
   cd /public_html/tu-directorio
   npm install --production
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   ```

## Solución de problemas comunes

- **Error 502**: Verificar que PM2 está ejecutando la aplicación con `pm2 list`
- **Aplicación no inicia**: Revisar logs con `pm2 logs`
- **Problemas de conexión**: Verificar que el puerto 3000 está permitido en Hostinger

## Recursos adicionales

- Consulta `HOSTINGER_DEPLOYMENT.md` para instrucciones detalladas
- [Documentación de Next.js sobre despliegue](https://nextjs.org/docs/app/building-your-application/deploying)
- [Documentación de PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)

Para cualquier problema durante el despliegue, consulta la sección de solución de problemas en la guía detallada o contacta al soporte de Hostinger.