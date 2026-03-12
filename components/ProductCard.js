import CountdownTimer from "./CountdownTimer";

const LOJAS = {
  mercadolivre: { nome: "Mercado Livre", cor: "#FFE600", bg: "#FFE60015", textoCor: "#000" },
  shopee:       { nome: "Shopee",        cor: "#EE4D2D", bg: "#EE4D2D15", textoCor: "#fff" },
  magalu:       { nome: "Magalu",        cor: "#0086FF", bg: "#0086FF15", textoCor: "#fff" },
  kabum:        { nome: "KaBuM",         cor: "#FF6A00", bg: "#FF6A0015", textoCor: "#fff" },
  americanas:   { nome: "Americanas",    cor: "#E60014", bg: "#E6001415", textoCor: "#fff" },
  submarino:    { nome: "Submarino",     cor: "#00ABE4", bg: "#00ABE415", textoCor: "#fff" },
};

const fmt = (v) => v?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) || "—";

export default function ProductCard({ produto }) {
  const loja = LOJAS[produto.loja] || { nome: produto.loja, cor: "#888", bg: "#88888815", textoCor: "#fff" };
  const economia = (produto.preco_original || 0) - (produto.preco_atual || 0);

  return (
    <div
      style={{ background: "#0F0F1A", border: "1px solid #1A1A2E", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", transition: "all .2s", cursor: "pointer" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = loja.cor + "66"; e.currentTarget.style.boxShadow = `0 16px 40px ${loja.cor}18`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "#1A1A2E"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ position: "relative", height: 180, background: "#080812", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {produto.imagem
          ? <img src={produto.imagem} alt={produto.titulo} style={{ maxHeight: 165, maxWidth: "90%", objectFit: "contain" }} />
          : <span style={{ fontSize: 56, opacity: .25 }}>🛒</span>
        }
        <div style={{ position: "absolute", top: 10, left: 10, background: "#ef4444", color: "#fff", borderRadius: 7, padding: "3px 9px", fontWeight: 900, fontSize: 14 }}>
          -{produto.desconto}%
        </div>
        <div style={{ position: "absolute", top: 10, right: 10, background: loja.bg, border: `1px solid ${loja.cor}44`, color: loja.cor, borderRadius: 7, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
          {loja.nome}
        </div>
        {produto.frete_gratis && (
          <div style={{ position: "absolute", bottom: 8, left: 8, background: "#22c55e22", border: "1px solid #22c55e44", color: "#22c55e", borderRadius: 5, padding: "2px 7px", fontSize: 10, fontWeight: 700 }}>
            🚚 Frete grátis
          </div>
        )}
      </div>

      <div style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ color: "#D0D0E8", fontSize: 13, fontWeight: 600, lineHeight: 1.4, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {produto.titulo}
        </p>

        <div>
          <span style={{ color: "#444", fontSize: 12, textDecoration: "line-through", display: "block" }}>De {fmt(produto.preco_original)}</span>
          <span style={{ color: "#22c55e", fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>{fmt(produto.preco_atual)}</span>
          <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 700, marginLeft: 7 }}>economia de {fmt(economia)}</span>
        </div>

        <CountdownTimer expiraEm={produto.expira_em} />

        <a
          href={produto.link_afiliado}
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginTop: "auto", background: loja.cor, color: loja.textoCor, borderRadius: 9, padding: "11px 14px", fontWeight: 800, fontSize: 13, textAlign: "center", display: "block", textDecoration: "none", transition: "opacity .2s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = ".82"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          🛒 Ver oferta →
        </a>
      </div>
    </div>
  );
}