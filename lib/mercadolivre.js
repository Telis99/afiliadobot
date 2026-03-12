const axios = require("axios");

const BASE_URL = "https://api.mercadolibre.com";

const CATEGORIAS = [
  { id: "MLB1648", nome: "Computação" },
  { id: "MLB1051", nome: "Celulares" },
  { id: "MLB1000", nome: "Eletrônicos" },
  { id: "MLB1144", nome: "TVs" },
  { id: "MLB3697", nome: "Games" },
  { id: "MLB1132", nome: "Câmeras" },
];

const KEYWORDS = [
  "notebook", "smartphone", "monitor", "SSD",
  "headset", "fone bluetooth", "smartwatch", "placa de video"
];

function montarLinkAfiliado(url) {
  return `${url}?matt_tool=15279975&matt_source=15279975`;
}

function formatarItem(item) {
  const desconto = item.original_price
    ? Math.round(((item.original_price - item.price) / item.original_price) * 100)
    : 0;

  return {
    id: `ml_${item.id}`,
    titulo: item.title,
    imagem: item.thumbnail?.replace("I.jpg", "O.jpg") || null,
    precoOriginal: item.original_price,
    precoAtual: item.price,
    desconto,
    linkAfiliado: montarLinkAfiliado(item.permalink),
    loja: "mercadolivre",
    frete_gratis: item.shipping?.free_shipping || false,
    expiraEm: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

async function buscarDescontosCategoria(categoriaId, descontoMinimo) {
  try {
    const res = await axios.get(`${BASE_URL}/sites/MLB/search`, {
      params: { category: categoriaId, sort: "price_asc", condition: "new", limit: 20 },
      timeout: 8000,
    });
    return (res.data?.results || [])
      .filter(item => {
        if (!item.price || !item.original_price || item.original_price <= item.price) return false;
        const desc = Math.round(((item.original_price - item.price) / item.original_price) * 100);
        return desc >= descontoMinimo;
      })
      .map(formatarItem);
  } catch (err) {
    console.error(`[ML] Erro categoria ${categoriaId}:`, err.message);
    return [];
  }
}

async function buscarPorKeyword(keyword, descontoMinimo) {
  try {
    const res = await axios.get(`${BASE_URL}/sites/MLB/search`, {
      params: { q: keyword, sort: "price_asc", condition: "new", limit: 20 },
      timeout: 8000,
    });
    return (res.data?.results || [])
      .filter(item => {
        if (!item.price || !item.original_price) return false;
        const desc = Math.round(((item.original_price - item.price) / item.original_price) * 100);
        return desc >= descontoMinimo;
      })
      .map(formatarItem);
  } catch (err) {
    console.error(`[ML] Erro keyword "${keyword}":`, err.message);
    return [];
  }
}

async function buscarTodasPromocoes(descontoMinimo = 15) {
  const resultados = [];

  for (const cat of CATEGORIAS) {
    const itens = await buscarDescontosCategoria(cat.id, descontoMinimo);
    resultados.push(...itens);
    await new Promise(r => setTimeout(r, 500));
  }

  for (const kw of KEYWORDS) {
    const itens = await buscarPorKeyword(kw, descontoMinimo);
    resultados.push(...itens);
    await new Promise(r => setTimeout(r, 400));
  }

  const vistos = new Set();
  return resultados.filter(item => {
    if (vistos.has(item.id)) return false;
    vistos.add(item.id);
    return true;
  });
}

module.exports = { buscarTodasPromocoes };