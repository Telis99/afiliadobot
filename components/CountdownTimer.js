import { useState, useEffect } from "react";

function calcularTempo(expiraEm) {
  const total = new Date(expiraEm) - Date.now();
  if (total <= 0) return null;
  const s = Math.floor(total / 1000);
  return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, total: s };
}

export default function CountdownTimer({ expiraEm }) {
  const [t, setT] = useState(null);

  useEffect(() => {
    setT(calcularTempo(expiraEm));
    const id = setInterval(() => setT(calcularTempo(expiraEm)), 1000);
    return () => clearInterval(id);
  }, [expiraEm]);

  if (!t) return null;

  const cor = t.total < 900 ? "#ef4444" : t.total < 3600 ? "#f97316" : "#22c55e";
  const p = (n) => String(n).padStart(2, "0");

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      padding: "4px 9px",
      background: `${cor}15`,
      border: `1px solid ${cor}40`,
      borderRadius: 7,
      width: "fit-content",
    }}>
      <span style={{ fontSize: 10 }}>{t.total < 900 ? "🔥" : t.total < 3600 ? "⏰" : "⏳"}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: cor, fontFamily: "monospace", letterSpacing: 1 }}>
        {t.h > 0 && `${p(t.h)}:`}{p(t.m)}:{p(t.s)}
      </span>
      <span style={{ fontSize: 10, color: cor, opacity: 0.7 }}>restam</span>
    </div>
  );
}