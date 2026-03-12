const ofertasDb = require('../dados/ofertas-db');

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function topOfertas(n = 3) {
  return ofertasDb.ler()
    .sort((a, b) => (b.desconto || 0) - (a.desconto || 0))
    .slice(0, n);
}

function gerarTexto(ofertas) {
  if (ofertas.length === 0) {
    return 'Nenhuma oferta no momento. Rode: npm run buscar';
  }
  const linhas = ['🔥 *TOP OFERTAS DO DIA* 🔥', ''];
  ofertas.forEach((o, i) => {
    const titulo = (o.titulo || 'Produto').slice(0, 60) + (o.titulo?.length > 60 ? '...' : '');
    linhas.push(`${i + 1}. ${titulo}`);
    linhas.push(`   💰 De ${formatarMoeda(o.preco_antigo)} por ${formatarMoeda(o.preco_novo)} (${o.desconto}% OFF)`);
    linhas.push(`   👉 ${o.link}`, '');
  });
  linhas.push('Confira mais no site!');
  return linhas.join('\n');
}

async function enviarWebhook(url, texto) {
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: texto })
    });
    if (res.ok) console.log('Webhook enviado.');
    else console.error('Webhook:', res.status);
  } catch (err) {
    console.error('Webhook:', err.message);
  }
}

if (require.main === module) {
  const top = topOfertas(3);
  const texto = gerarTexto(top);
  console.log('--- Copie para WhatsApp/Telegram ---\n');
  console.log(texto);
  console.log('\n--- Fim ---');
  const webhook = process.env.WEBHOOK_URL || '';
  if (webhook) enviarWebhook(webhook, texto).catch(console.error);
}
