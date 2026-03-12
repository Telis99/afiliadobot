import { useState, useEffect } from "react";
import Head from "next/head";
import ProductCard from "../components/ProductCard";

const FILTROS = [
  { id: "todos",        label: "🔥 Todas",          cor: "#FF4500" },
  { id: "mercadolivre", label: "🛒 Mercado Livre",   cor: "#FFE600" },
  { id: "shopee",       label: "🛍️ Shopee",          cor: "#EE4D2D" },
  { id: "magalu",       label: "💙 Magalu",           cor: "#0086FF" },
  { id: "kabum",        label: "💻 KaBuM",            cor: "#FF6A00" },
  { id: "americanas",   label: "❤️ Americanas",       cor: "#E60014" },
  { id: "submarino",    label: "🌊 Submarino",        cor: "#00ABE4" },
];

const DEMO = [
  { id:"1", titulo:"Notebook Acer Aspire 5 Intel Core i5 8GB 512GB SSD", imagem:null, preco_original:3299, preco_atual:2199, desconto:33, link_afiliado:"#", loja:"magalu",        frete_gratis:true,  expira_em: new Date(Date.now()+6*3600*1000).toISOString() },
  { id:"2", titulo:"Samsung Galaxy A54 5G 128GB Preto", imagem:null,                  preco_original:1999, preco_atual:1199, desconto:40, link_afiliado:"#", loja:"americanas",    frete_gratis:true,  expira_em: new Date(Date.now()+3*3600*1000).toISOString() },
  { id:"3", titulo:"Placa de Vídeo RTX 4060 8GB GDDR6", imagem:null,                  preco_original:2800, preco_atual:1899, desconto:32, link_afiliado:"#", loja:"kabum",         frete_gratis:false, expira_em: new Date(Date.now()+30*60*1000).toISOString() },
  { id:"4", titulo:"Fone JBL Tune 720BT Bluetooth 76h Bateria", imagem:null,          preco_original:399,  preco_atual:219,  desconto:45, link_afiliado:"#", loja:"shopee",        frete_gratis:true,  expira_em: new Date(Date.now()+12*3600*1000).toISOString() },
  { id:"5", titulo:'Monitor Gamer LG 27" Full HD 165Hz IPS 1ms', imagem:null,         preco_original:1799, preco_atual:1099, desconto:39, link_afiliado:"#", loja:"mercadolivre",  frete_gratis:true,  expira_em: new Date(Date.now()+18*3600*1000).toISOString() },
  { id:"6", titulo:"SSD Kingston 1TB NVMe M.2 3.500MB/s", imagem:null,               preco_original:499,  preco_atual:289,  desconto:42, link_afiliado:"#", loja:"submarino",     frete_gratis:true,  expira_em: new Date(Date.now()+9*3600*1000).toISOString() },
];

export default function Home() {
  const [filtro, setFiltro] = useState("todos");
  const [produtos, setProdutos] = useState(DEMO);
  const [carregando, setCarregando] = useState(false);
  const [hora, setHora] = useState("");

  useEffect(() => {
    setHora(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
  }, []);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      try {
        const params = filtro !== "todos" ? `?loja=${filtro}` : "";
        const res = await fetch(`/api/promocoes${params}`);
        const data = await res.json();
        if (data.promocoes?.length > 0) setProdutos(data.promocoes);
        else setProdutos(DEMO);
      } catch {
        setProdutos(DEMO);
      }
      setCarregando(false);
    }
    carregar();
  }, [filtro]);

  const lista = filtro === "todos" ? produtos : produtos.filter(p => p.loja === filtro);
  const descontoMedio = Math.round(lista.reduce((s, p) => s + (p.desconto || 0), 0) / (lista.length || 1));

  return (
    <>
      <Head>
        <title>TechDeals BR — Promoções de Eletrônicos</title>
        <meta name="description" content="As melhores promoções de eletrônicos do Brasil." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;900&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#07070F", color: "#E0E0F0", fontFamily: "'Nunito', sans-serif" }}>

        {/* Header */}
        <header style={{ borderBottom: "1px solid #16162A", padding: "0 20px", position: "sticky", top: 0, background: "#07070FEE", backdropFilter: "blur(14px)", zIndex: 100 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 62 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>⚡</span>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 26, letterSpacing: 2, color: "#FF4500" }}>TechDeals BR</span>
              <span style={{ background: "#FF450020", border: "1px solid #FF450050", color: "#FF4500", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>● AO VIVO</span>
            </div>
            <span style={{ color: "#444", fontSize: 12 }}>🕐 Atualizado às {hora}</span>
          </div>
        </header>

        {/* Hero */}
        <div style={{ textAlign: "center", padding: "50px 20px 36px", background: "radial-gradient(ellipse at 50% 0%, #FF450010 0%, transparent 60%)" }}>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(44px, 8vw, 82px)", margin: "0 0 8px", letterSpacing: 3, lineHeight: 1 }}>
            <span style={{ color: "#FF4500" }}>OFERTAS</span> <span>DE ELETRÔNICOS</span>
          </h1>
          <p style={{ color: "#555", fontSize: 15, maxWidth: 480, margin: "0 auto 20px" }}>
            Promoções reais de Mercado Livre, Shopee, Magalu, KaBuM e Americanas
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
            {[{ v: lista.length, l: "promoções ativas" }, { v: `${descontoMedio}%`, l: "desconto médio" }, { v: "5 lojas", l: "monitoradas" }].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#FF4500" }}>{s.v}</div>
                <div style={{ fontSize: 11, color: "#444" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div style={{ padding: "0 20px 20px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FILTROS.map(f => (
              <button key={f.id} onClick={() => setFiltro(f.id)}
                style={{ padding: "7px 14px", borderRadius: 9, border: `1px solid ${filtro === f.id ? f.cor : "#1A1A2E"}`, background: filtro === f.id ? `${f.cor}20` : "#111118", color: filtro === f.id ? f.cor : "#555", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Nunito', sans-serif", transition: "all .15s" }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <main style={{ padding: "0 20px 80px", maxWidth: 1200, margin: "0 auto" }}>
          {carregando ? (
            <div style={{ textAlign: "center", padding: 80, color: "#444" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
              <p>Buscando promoções...</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 18 }}>
              {lista.map(p => <ProductCard key={p.id} produto={p} />)}
            </div>
          )}
        </main>

        <footer style={{ borderTop: "1px solid #16162A", padding: 20, textAlign: "center", color: "#2A2A3A", fontSize: 12 }}>
          Links de afiliado — ao comprar você apoia o site sem custo adicional 💙
        </footer>
      </div>

      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } a { text-decoration: none; }`}</style>
    </>
  );
}