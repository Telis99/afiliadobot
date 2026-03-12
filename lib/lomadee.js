const axios = require("axios");

const BASE_URL = "https://api.lomadee.com/v3";

const LOJAS = [
  { id: "5720",  nome: "kabum"      },
  { id: "18977", nome: "magalu"     },
  { id: "5979",  nome: "americanas" },
  { id: "6390",  nome: "submarino"  },
  { id: "5908",  nome: "shopee"     },
];

const KEYWORDS = [
  "notebook", "smartphone", "monitor", "SSD",
  "headset", "teclado", "mouse", "smartwatch"
];

function formatarOferta(oferta, lojaSlug) {
  const desconto = oferta.priceFrom
    ? Math.round(((oferta.priceFrom - oferta.price) / oferta.priceFrom) * 100)
    : 0;

  return {
    id: `${lojaSlug}_${oferta.id}`,
    titulo: oferta.name || oferta.title || "Produto em promoção",
    imagem: oferta.thumbnail || oferta.image || null,
    precoOriginal: oferta.priceFrom || oferta.price,
    precoAtual: oferta.price,
    desconto,
    linkAfiliado: oferta.link || oferta.url || "#",
    loja: lojaSlug,
    frete_gratis: oferta.freeShipping || false,
    expiraEm: oferta.finalDate
      ? new Date(oferta.finalDate).toISOString()
      : new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  };
}

async function buscarOfertasLoja(loja, descontoMinimo) {
  const token = process.env.LOMADEE_APP_TOKEN;
  const sourceId = process.env.LOMADEE_SOURCE_ID;

  if (!token || token === "SEU_APP_TOKEN_AQUI") return [];

  try {
    const res = await axios.get(`${BASE_URL}/${token}/offer/_all`, {
      params: { sourceId, storeId: loja.id, page: 1, pageSize: 30 },
      timeout: 10000,
    });
    return (res.data?.offers || [])
      .filter(o => {
        if (!o.price || !o.priceFrom) return false;
        const desc = Math.round(((o.priceFrom - o.price) / o.priceFrom) * 100);
        return desc >= descontoMinimo;
      })
      .map(o => formatarOferta(o, loja.nome));
  } catch (err) {
    console.error(`[Lomadee] Erro loja ${loja.nome}:`, err.message);
    return [];
  }
}

async function buscarTodasPromocoes(descontoMinimo = 15) {
  const resultados = [];

  for (const loja of LOJAS) {
    const itens = await buscarOfertasLoja(loja, descontoMinimo);
    resultados.push(...itens);
    await new Promise(r => setTimeout(r, 600));
  }

  const vistos = new Set();
  return resultados.filter(item => {
    if (vistos.has(item.id)) return false;
    vistos.add(item.id);
    return true;
  });
}

module.exports = { buscarTodasPromocoes };