// Custom server script to make Next.js accessible from other devices
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const net = require('net');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Función para encontrar un puerto disponible
const findAvailablePort = (startPort, callback) => {
  const server = net.createServer();
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Puerto ${startPort} en uso, intentando con el siguiente...`);
      findAvailablePort(startPort + 1, callback);
    } else {
      callback(err);
    }
  });
  
  server.listen(startPort, '0.0.0.0', () => {
    const port = server.address().port;
    server.close(() => {
      callback(null, port);
    });
  });
};

// Puerto preferido
const PREFERRED_PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  // Buscar un puerto disponible comenzando con el puerto preferido
  findAvailablePort(PREFERRED_PORT, (err, PORT) => {
    if (err) throw err;
    
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(PORT, '0.0.0.0', (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${PORT}`);
      
      // Guardar el puerto actual en un archivo para que otros scripts puedan leerlo
      fs.writeFileSync('current_port.txt', PORT.toString());
      
      // Get the local IP address to display for mobile access
      const { networkInterfaces } = require('os');
      const nets = networkInterfaces();
      
      for (const name of Object.keys(nets)) {
        for (const netInterface of nets[name]) {
          // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
          if (netInterface.family === 'IPv4' && !netInterface.internal) {
            console.log(`> Access from mobile device: http://${netInterface.address}:${PORT}`);
          }
        }
      }
    });
  });
});