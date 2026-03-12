const { buscarTodasPromocoes: buscarML } = require("../../lib/mercadolivre");
const { buscarTodasPromocoes: buscarLomadee } = require("../../lib/lomadee");
const { salvarPromocao, desativarPromocoesExpiradas } = require("../../lib/supabase");

export default async function handler(req, res) {
  const secret = req.headers["x-cron-secret"] || req.query.secret;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ erro: "Não autorizado" });
  }

  const descontoMin = parseInt(process.env.DESCONTO_MINIMO || "15");
  const resultado = { ml: 0, lomadee: 0, salvos: 0, erros: [] };

  try {
    await desativarPromocoesExpiradas();

    console.log("🔍 Buscando Mercado Livre...");
    try {
      const produtos = await buscarML(descontoMin);
      resultado.ml = produtos.length;
      for (const p of produtos) {
        const ok = await salvarPromocao(p);
        if (ok) resultado.salvos++;
      }
    } catch (e) {
      resultado.erros.push(`ML: ${e.message}`);
    }

    console.log("🔍 Buscando Lomadee...");
    try {
      const produtos = await buscarLomadee(descontoMin);
      resultado.lomadee = produtos.length;
      for (const p of produtos) {
        const ok = await salvarPromocao(p);
        if (ok) resultado.salvos++;
      }
    } catch (e) {
      resultado.erros.push(`Lomadee: ${e.message}`);
    }

    console.log(`✅ ML=${resultado.ml} | Lomadee=${resultado.lomadee} | Salvos=${resultado.salvos}`);
    return res.status(200).json({ sucesso: true, ...resultado, timestamp: new Date().toISOString() });

  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}