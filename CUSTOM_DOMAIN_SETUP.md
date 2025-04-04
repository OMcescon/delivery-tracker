# Configuración de Dominio Personalizado en Hostinger

Esta guía complementa las instrucciones de despliegue principales y te ayudará a configurar un dominio personalizado para tu aplicación Delivery Tracker en Hostinger.

## Índice
1. [Registrar un dominio](#1-registrar-un-dominio)
2. [Configurar DNS](#2-configurar-dns)
3. [Configurar aplicación para el dominio](#3-configurar-aplicación-para-el-dominio)
4. [Configurar SSL/HTTPS](#4-configurar-sslhttps)
5. [Solución de problemas](#5-solución-de-problemas)

## 1. Registrar un dominio

Si aún no tienes un dominio, puedes registrar uno directamente en Hostinger:

1. Inicia sesión en tu panel de control de Hostinger
2. Ve a la sección "Dominios" > "Registrar un nuevo dominio"
3. Busca y selecciona el dominio que deseas registrar
4. Completa el proceso de compra

Si ya tienes un dominio registrado en otro proveedor, puedes transferirlo a Hostinger o simplemente apuntar los DNS a tu hosting de Hostinger.

## 2. Configurar DNS

### Si el dominio está registrado en Hostinger:

1. Ve a "Dominios" > tu dominio > "DNS / Nameservers"
2. En la sección "Registros DNS", configura los siguientes registros:

   - **Registro A**: Apunta el dominio principal a la IP de tu servidor de Hostinger
     - Nombre: @ (o deja en blanco)
     - Tipo: A
     - Valor: [IP de tu servidor de Hostinger]
     - TTL: Automático

   - **Registro CNAME**: Para el subdominio "www"
     - Nombre: www
     - Tipo: CNAME
     - Valor: @ (o tu dominio principal)
     - TTL: Automático

### Si el dominio está registrado en otro proveedor:

1. Configura los nameservers de tu dominio para que apunten a Hostinger:
   - ns1.hostinger.com
   - ns2.hostinger.com
   - ns3.hostinger.com
   - ns4.hostinger.com

2. O configura los registros DNS en tu proveedor actual siguiendo las mismas instrucciones que en la sección anterior.

## 3. Configurar aplicación para el dominio

### Configurar el dominio en el panel de Hostinger:

1. Ve a "Hosting" > tu hosting > "Sitio web" > "Dominios"
2. Haz clic en "Asignar dominio"
3. Selecciona o ingresa tu dominio
4. Haz clic en "Asignar"

### Configurar la aplicación Next.js para el dominio:

Si necesitas que tu aplicación reconozca el dominio personalizado, puedes actualizar la configuración en `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  swcMinify: true,
  reactStrictMode: true,
  images: {
    domains: ['tu-dominio.com'], // Añade tu dominio aquí si usas imágenes externas
    unoptimized: false
  },
  // Añade esta configuración para el dominio personalizado
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://tu-dominio.com' : '',
};

module.exports = nextConfig;
```

## 4. Configurar SSL/HTTPS

Hostinger ofrece certificados SSL gratuitos con Let's Encrypt:

1. Ve a "Hosting" > tu hosting > "Sitio web" > "SSL"
2. Haz clic en "Configurar" junto a Let's Encrypt
3. Selecciona tu dominio y haz clic en "Instalar"
4. Espera a que se complete la instalación (puede tardar unos minutos)

Una vez instalado el certificado SSL, asegúrate de que tu aplicación redirija todo el tráfico HTTP a HTTPS. Puedes configurar esto en el archivo `server.prod.js` añadiendo el siguiente código:

```javascript
// Añade este código después de crear el servidor HTTP
app.prepare().then(() => {
  const server = createServer((req, res) => {
    // Redirección de HTTP a HTTPS en producción
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    
    // Si estamos en producción y la conexión no es HTTPS, redirigir a HTTPS
    if (process.env.NODE_ENV === 'production' && protocol !== 'https') {
      res.writeHead(301, { Location: `https://${host}${req.url}` });
      res.end();
      return;
    }
    
    // Continuar con el manejo normal de la solicitud
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Servidor en producción ejecutándose en puerto ${PORT}`);
  });
});
```

## 5. Solución de problemas

### El dominio no apunta a mi aplicación:

1. Verifica que los registros DNS estén correctamente configurados
2. Ten en cuenta que los cambios de DNS pueden tardar hasta 48 horas en propagarse
3. Comprueba que el dominio esté correctamente asignado en el panel de Hostinger

### Problemas con el certificado SSL:

1. Asegúrate de que el dominio esté correctamente configurado antes de instalar el certificado SSL
2. Si el certificado no se instala correctamente, intenta eliminarlo y volver a instalarlo
3. Verifica que no haya conflictos con otros certificados SSL

### La redirección HTTPS no funciona:

1. Verifica que el código de redirección en `server.prod.js` esté correctamente implementado
2. Comprueba que el certificado SSL esté correctamente instalado
3. Asegúrate de que el servidor esté configurado para escuchar en el puerto correcto

---

Si sigues teniendo problemas con la configuración del dominio personalizado, no dudes en contactar con el soporte de Hostinger para obtener ayuda específica para tu caso.