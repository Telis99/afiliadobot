const { buscarPromocoesAtivas } = require("../../lib/supabase");

export default async function handler(req, res) {
  const { loja, pagina = 1, limite = 12 } = req.query;

  try {
    const promocoes = await buscarPromocoesAtivas({
      loja: loja || null,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
    });

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    return res.status(200).json({ promocoes });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}