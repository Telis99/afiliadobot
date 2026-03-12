const config = require('./config');
const ofertasDb = require('../dados/ofertas-db');
const oauth = require('./ml-oauth');

const BASE_API = 'https://api.mercadolibre.com';
const USER_AGENT = 'AfiliadoBot/1.0';
const ITEM_ATTRIBUTES = 'id,price,original_price,title,thumbnail,permalink,category_id';

function paraLinkAfiliado(urlProduto, itemId) {
  if (!urlProduto) return `https://www.mercadolivre.com.br/${itemId}`;
  try {
    const url = new URL(urlProduto);
    url.searchParams.set('matt_tool', config.AFILIADO_ID);
    url.searchParams.set('matt_tool_ver', '1');
    return url.toString();
  } catch {
    return `https://www.mercadolivre.com.br/${itemId}`;
  }
}

function montarOferta(dados, categoriaNome) {
  const original = dados.original_price;
  const precoAtual = dados.price;
  if (!original || original <= 0 || !precoAtual) return null;
  const desconto = Math.round(((original - precoAtual) / original) * 100);
  if (desconto < config.DESCONTO_MINIMO) return null;

  const link = dados.permalink || `https://www.mercadolivre.com.br/${dados.id}`;
  return {
    id: dados.id,
    titulo: dados.title || 'Produto',
    preco_antigo: original,
    preco_novo: precoAtual,
    desconto,
    thumbnail: dados.thumbnail,
    link: paraLinkAfiliado(link, dados.id),
    categoria_nome: categoriaNome,
    data_busca: new Date().toISOString()
  };
}

async function fetchML(url, { tryAuth = true } = {}) {
  const headers = { 'User-Agent': USER_AGENT, Accept: 'application/json' };
  let res = await fetch(url, { headers });

  if ((res.status === 401 || res.status === 403) && tryAuth) {
    const token = await oauth.getValidAccessToken().catch(() => null);
    if (token) {
      res = await fetch(url, { headers: { ...headers, Authorization: `Bearer ${token}` } });
    }
  }

  return res;
}

async function buscarPorCategoria(categoriaId, limite = 50) {
  const url = `${BASE_API}/sites/${config.SITE_ID}/search?category=${categoriaId}&limit=${limite}&sort=price_asc`;
  const res = await fetchML(url);
  if (!res.ok) throw new Error(`API ML: ${res.status}`);
  return res.json();
}

async function detalhesItens(ids) {
  if (ids.length === 0) return [];
  const url = `${BASE_API}/items?ids=${ids.join(',')}&attributes=${ITEM_ATTRIBUTES}`;
  const res = await fetchML(url);
  if (!res.ok) throw new Error(`API items: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

function ofertasDaBusca(results, categoriaNome) {
  const ofertas = [];
  for (const r of results || []) {
    if (!r.id) continue;
    const oferta = montarOferta(
      {
        id: r.id,
        title: r.title,
        price: r.price,
        original_price: r.original_price ?? null,
        thumbnail: r.thumbnail,
        permalink: r.permalink
      },
      categoriaNome
    );
    if (oferta) ofertas.push(oferta);
  }
  return ofertas;
}

function ofertasDosDetalhes(detalhes, categoriaNome) {
  const ofertas = [];
  for (const d of detalhes) {
    const body = d.body || d;
    if (!body.id) continue;
    const oferta = montarOferta(body, categoriaNome);
    if (oferta) ofertas.push(oferta);
  }
  return ofertas;
}

async function buscarTodasOfertas() {
  const todas = [];
  const idsVistos = new Set();

  for (const [nomeCat, catId] of Object.entries(config.CATEGORIAS)) {
    try {
      const busca = await buscarPorCategoria(catId, 50);
      const results = busca.results || [];

      for (const o of ofertasDaBusca(results, nomeCat)) {
        if (!idsVistos.has(o.id)) {
          idsVistos.add(o.id);
          todas.push(o);
        }
      }

      const idsParaDetalhe = results
        .map(r => r.id)
        .filter(Boolean)
        .filter(id => !idsVistos.has(id));

      for (let i = 0; i < idsParaDetalhe.length; i += 20) {
        const lote = idsParaDetalhe.slice(i, i + 20);
        const detalhes = await detalhesItens(lote);
        for (const o of ofertasDosDetalhes(detalhes, nomeCat)) {
          if (!idsVistos.has(o.id)) {
            idsVistos.add(o.id);
            todas.push(o);
          }
        }
        await new Promise(r => setTimeout(r, 200));
      }
    } catch (err) {
      const msg = err?.message || String(err);
      console.error(`Erro em ${nomeCat}: ${msg}`);
    }
  }

  return todas;
}

function salvarOfertas(novasOfertas) {
  const existentes = ofertasDb.ler();
  const porId = new Map(existentes.map(o => [o.id, o]));
  for (const o of novasOfertas) porId.set(o.id, o);
  return ofertasDb.salvar(Array.from(porId.values()));
}

function dicaOAuthSe403() {
  console.log('\nSe você está vendo 403, a API pode estar bloqueada no seu ambiente.');
  console.log('Solução: use OAuth (sem Postman):');
  console.log('- Crie uma aplicação no DevCenter: https://developers.mercadolivre.com.br/pt_br/crie-uma-aplicacao-no-mercado-livre');
  console.log('- Defina ML_CLIENT_ID, ML_CLIENT_SECRET e ML_REDIRECT_URI no ambiente.');
  console.log('- Rode: npm run ml:auth:url e abra a URL no navegador');
  console.log('- Copie o parâmetro ?code=... do redirect e rode: npm run ml:auth:code\n');
}

async function executar() {
  console.log('Buscando ofertas (desconto >= %d%%)...', config.DESCONTO_MINIMO);
  const ofertas = await buscarTodasOfertas();

  if (ofertas.length === 0) {
    dicaOAuthSe403();
  }

  console.log('Encontradas %d ofertas.', ofertas.length);
  const salvas = salvarOfertas(ofertas);
  console.log('Salvas %d ofertas em dados/ofertas.json\n', salvas.length);
  return salvas;
}

if (require.main === module) {
  executar().catch(err => {
    console.error(err);
    dicaOAuthSe403();
    process.exit(1);
  });
}

module.exports = { executar };

