const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function salvarPromocao(produto) {
  const { error } = await supabase.from("promocoes").upsert(
    {
      id: produto.id,
      titulo: produto.titulo,
      imagem: produto.imagem,
      preco_original: produto.precoOriginal,
      preco_atual: produto.precoAtual,
      desconto: produto.desconto,
      link_afiliado: produto.linkAfiliado,
      loja: produto.loja,
      frete_gratis: produto.frete_gratis || false,
      expira_em: produto.expiraEm,
      ativo: true,
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) console.error("Erro ao salvar:", error.message);
  return !error;
}

async function buscarPromocoesAtivas({ loja = null, limite = 12, pagina = 1 } = {}) {
  const agora = new Date().toISOString();
  let query = supabase
    .from("promocoes")
    .select("*")
    .eq("ativo", true)
    .gt("expira_em", agora)
    .order("desconto", { ascending: false })
    .range((pagina - 1) * limite, pagina * limite - 1);

  if (loja) query = query.eq("loja", loja);
  const { data, error } = await query;
  if (error) console.error("Erro ao buscar:", error.message);
  return data || [];
}

async function desativarPromocoesExpiradas() {
  const { error } = await supabase
    .from("promocoes")
    .update({ ativo: false })
    .lt("expira_em", new Date().toISOString());
  if (error) console.error("Erro ao desativar:", error.message);
}

async function buscarNaoEnviadasWhatsApp() {
  const { data, error } = await supabase
    .from("promocoes")
    .select("*")
    .eq("ativo", true)
    .eq("enviado_whatsapp", false)
    .gt("expira_em", new Date().toISOString())
    .order("desconto", { ascending: false })
    .limit(50);
  if (error) console.error("Erro:", error.message);
  return data || [];
}

async function marcarEnviadaWhatsApp(id) {
  await supabase.from("promocoes").update({ enviado_whatsapp: true }).eq("id", id);
}

module.exports = {
  supabase,
  salvarPromocao,
  buscarPromocoesAtivas,
  desativarPromocoesExpiradas,
  buscarNaoEnviadasWhatsApp,
  marcarEnviadaWhatsApp,
};