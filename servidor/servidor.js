const fs = require('fs');
const http = require('http');
const path = require('path');
const ofertasDb = require('../dados/ofertas-db');

const PORT = process.env.PORT || 3000;
const BASE = path.join(__dirname, '..');

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);

  if (url.pathname === '/api/ofertas') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ofertas: ofertasDb.ler() }));
    return;
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    const file = path.join(BASE, 'vitrine', 'index.html');
    if (fs.existsSync(file)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(file, 'utf8'));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ erro: 'Não encontrado' }));
});

server.listen(PORT, () => console.log('Vitrine: http://localhost:%d', PORT));
