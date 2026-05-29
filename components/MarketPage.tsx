"use client";

import { useState, useEffect, useMemo } from "react";
import { MODELS, PROVIDERS, tick, fmtPct, fmtMoney, fmtCap, Model } from "@/lib/data";
import Ticker from "./Ticker";
import MarketRow from "./MarketRow";
import Sparkline from "./Sparkline";
import Provider from "./Provider";
import OrderPanel from "./OrderPanel";

const SORTS: Record<string, { label: string; fn: (a: Model, b: Model) => number }> = {
  disc:  { label: "Biggest discount", fn: (a, b) => b.discount - a.discount },
  price: { label: "Cheapest first",   fn: (a, b) => a.surplus - b.surplus },
  vol:   { label: "Most traded 24h",  fn: (a, b) => b.vol24 - a.vol24 },
  mover: { label: "Top movers",       fn: (a, b) => Math.abs(b.trend1h) - Math.abs(a.trend1h) },
  name:  { label: "Name A–Z",         fn: (a, b) => a.name.localeCompare(b.name) },
};

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={"stat" + (accent ? " stat-accent" : "")}>
      <div className="stat-label">{label}</div>
      <div className="stat-value num">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function MarketPage() {
  const [, bump] = useState(0);
  const [flash, setFlash] = useState<Record<string, boolean>>({});
  const [q, setQ] = useState("");
  const [prov, setProv] = useState("all");
  const [sort, setSort] = useState("disc");
  const [sel, setSel] = useState<Model | null>(null);
  const [paused, setPaused] = useState(false);
  const [liveMotion, setLiveMotion] = useState(true);
  const [view, setView] = useState<"board" | "cards">("board");
  const [density, setDensity] = useState<"regular" | "compact">("regular");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (paused || !liveMotion) return;
    const iv = setInterval(() => {
      const touched = tick();
      const f: Record<string, boolean> = {};
      touched.forEach(id => f[id] = true);
      setFlash(f);
      bump(x => x + 1);
      setTimeout(() => setFlash({}), 700);
    }, 2300);
    return () => clearInterval(iv);
  }, [paused, liveMotion]);

  const list = useMemo(() => {
    const r = MODELS.filter(m =>
      (prov === "all" || m.provider === prov) &&
      (q === "" || (m.name + " " + m.provider).toLowerCase().includes(q.toLowerCase()))
    );
    return [...r].sort(SORTS[sort].fn);
  }, [q, prov, sort, flash]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => {
    const ms = MODELS;
    const avgDisc = ms.reduce((s, m) => s + m.discount, 0) / ms.length;
    const surplusUsd = ms.reduce((s, m) => s + (m.listPrice - m.surplus) * 1e6 * (m.capTotal * (1 - m.capFilled)) / 1e6, 0);
    const vol = ms.reduce((s, m) => s + m.vol24, 0);
    const best = [...ms].sort((a, b) => b.discount - a.discount)[0];
    return { avgDisc, surplusUsd, vol, best };
  }, [flash]); // eslint-disable-line react-hooks/exhaustive-deps

  const compact = density === "compact";

  return (
    <div className="app">
      <Ticker models={MODELS} />

      <header className="head">
        <div className="brand">
          <span className="brand-mark">◢◤</span>
          <span className="brand-name">SURPLUS<span className="brand-thin">INTELLIGENCE</span></span>
        </div>
        <nav className="nav">
          <a>Buy</a>
          <a>Sell</a>
          <a className="on">Marketplace</a>
          <a>Analytics</a>
        </nav>
        <div className="head-right">
          <div className="balance">
            <span className="bal-label">BALANCE</span>
            <span className="bal-num num">$2,480.50</span>
          </div>
          <button className="connect">0x7a…3f2e</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <h1>Inference, on sale.</h1>
          <p>Live spot market for surplus AI capacity. The same models you already use — sold below list while providers have idle GPUs.</p>
        </div>
        <div className="hero-stats">
          <Stat accent label="AVG DISCOUNT" value={"−" + fmtPct(stats.avgDisc)} sub="across 32 models" />
          <Stat label="SURPLUS AVAILABLE" value={fmtMoney(stats.surplusUsd)} sub="of inference, right now" />
          <Stat label="24H VOLUME" value={fmtCap(stats.vol) + " tok"} sub={"$" + (stats.vol * 0.0012).toFixed(0) + "K traded"} />
          <Stat label="BEST DEAL" value={"−" + fmtPct(stats.best.discount)} sub={stats.best.name} />
        </div>
      </section>

      <div className="toolbar">
        <div className="search">
          <span className="search-i">⌕</span>
          <input
            placeholder="Search models or providers"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <div className="chips">
          <button className={"chip" + (prov === "all" ? " on" : "")} onClick={() => setProv("all")}>All</button>
          {PROVIDERS.map(p => (
            <button key={p} className={"chip" + (prov === p ? " on" : "")} onClick={() => setProv(p)}>{p}</button>
          ))}
        </div>
        <div className="tools-right">
          <div
            className={"live-dot" + (paused || !liveMotion ? " off" : "")}
            onClick={() => setPaused(p => !p)}
            title={paused ? "Resume live prices" : "Pause live prices"}
          >
            <span className="dot" />{paused || !liveMotion ? "PAUSED" : "LIVE"}
          </div>
          <select className="sortsel" value={sort} onChange={e => setSort(e.target.value)}>
            {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {view === "board" ? (
        <div className={"board" + (compact ? " compact" : "")}>
          <div className="board-head">
            <div>Model</div>
            <div className="num">List</div>
            <div className="num">Surplus</div>
            <div>Discount</div>
            <div>Trend</div>
            <div className="num">1h Δ</div>
            <div>Available</div>
            <div />
          </div>
          <div className="board-body">
            {list.map(m => (
              <MarketRow
                key={m.id}
                m={m}
                flash={!!flash[m.id]}
                discViz="pill"
                compact={compact}
                onBuy={setSel}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="cards">
          {list.map(m => {
            const up = m.trend1h >= 0;
            return (
              <div className="card" key={m.id} onClick={() => setSel(m)}>
                <div className="card-top">
                  <div>
                    <div className="model-name">{m.name}</div>
                    <div className="model-sub"><Provider name={m.provider} /></div>
                  </div>
                  <span className="disc-pill big">−{fmtPct(m.discount)}</span>
                </div>
                <div className="card-spark">
                  <Sparkline data={m.hist} up={up} w={260} h={48} />
                </div>
                <div className="card-prices">
                  <div>
                    <div className="cp-label">SURPLUS</div>
                    <div className="surplus-price num">{m.surplus >= 1 ? "$" + m.surplus.toFixed(2) : "$" + m.surplus.toFixed(3)}<span className="unit">/1M</span></div>
                  </div>
                  <div className="cp-list">
                    <div className="cp-label">LIST</div>
                    <div className="num strike">{m.listPrice >= 1 ? "$" + m.listPrice.toFixed(2) : "$" + m.listPrice.toFixed(3)}</div>
                  </div>
                  <button className="buy-btn" onClick={(e) => { e.stopPropagation(); setSel(m); }}>Buy</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <footer className="foot">
        <span>{list.length} models · prices in $/1M input tokens · settled in USDC</span>
        <span>a redesign concept · not affiliated with surplusintelligence.ai</span>
      </footer>

      {sel && <OrderPanel m={sel} onClose={() => setSel(null)} />}

      {/* Settings bar */}
      <div style={{
        position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
        background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: 8,
        padding: "8px 16px", display: "flex", gap: 12, alignItems: "center",
        fontSize: 12, fontFamily: "var(--mono)", zIndex: 50,
      }}>
        <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
          style={{ background: "var(--bg3)", border: "1px solid var(--line)", borderRadius: 4,
            padding: "4px 10px", cursor: "pointer", color: "var(--muted)", fontSize: 11 }}>
          {theme === "dark" ? "☀ Light" : "◑ Dark"}
        </button>
        <button onClick={() => setView(v => v === "board" ? "cards" : "board")}
          style={{ background: "var(--bg3)", border: "1px solid var(--line)", borderRadius: 4,
            padding: "4px 10px", cursor: "pointer", color: "var(--muted)", fontSize: 11 }}>
          {view === "board" ? "⊞ Cards" : "≡ Board"}
        </button>
        <button onClick={() => setDensity(d => d === "regular" ? "compact" : "regular")}
          style={{ background: "var(--bg3)", border: "1px solid var(--line)", borderRadius: 4,
            padding: "4px 10px", cursor: "pointer", color: "var(--muted)", fontSize: 11 }}>
          {density === "regular" ? "⊟ Compact" : "⊞ Regular"}
        </button>
        <button onClick={() => setLiveMotion(v => !v)}
          style={{ background: "var(--bg3)", border: "1px solid var(--line)", borderRadius: 4,
            padding: "4px 10px", cursor: "pointer", color: "var(--muted)", fontSize: 11 }}>
          {liveMotion ? "⏸ Pause sim" : "▶ Live sim"}
        </button>
      </div>
    </div>
  );
}
