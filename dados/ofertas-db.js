const fs = require('fs');
const path = require('path');

const ARQUIVO = path.join(__dirname, 'ofertas.json');

function lerArquivo() {
  try {
    return JSON.parse(fs.readFileSync(ARQUIVO, 'utf8'));
  } catch {
    return { lastUpdate: null, ofertas: [] };
  }
}

function escreverArquivo(data) {
  const pasta = path.dirname(ARQUIVO);
  if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });
  fs.writeFileSync(ARQUIVO, JSON.stringify(data, null, 2), 'utf8');
}

function ler() {
  const data = lerArquivo();
  return Array.isArray(data.ofertas) ? data.ofertas : [];
}

function salvar(ofertas) {
  escreverArquivo({
    lastUpdate: new Date().toISOString(),
    ofertas: Array.isArray(ofertas) ? ofertas : []
  });
  return ofertas;
}

module.exports = { ler, salvar };

