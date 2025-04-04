// server.prod.js - Optimizado para entorno de producción
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// En producción, siempre usamos el modo de producción
const app = next({ dev: false });
const handle = app.getRequestHandler();

// Puerto configurado (normalmente 3000)
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