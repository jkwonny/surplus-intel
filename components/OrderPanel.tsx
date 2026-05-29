"use client";

import { useState } from "react";
import { Model, fmtPrice, fmtPct, fmtCap } from "@/lib/data";
import Provider from "./Provider";

const TIER_LABEL: Record<string, string> = {
  frontier: "frontier", reasoning: "reasoning", balanced: "balanced", fast: "fast", code: "code",
};

interface OrderPanelProps {
  m: Model;
  onClose: () => void;
}

export default function OrderPanel({ m, onClose }: OrderPanelProps) {
  const [usd, setUsd] = useState(25);
  const presets = [5, 25, 100, 500];
  const tokens = (usd / m.surplus) * 1e6;
  const listCost = (tokens / 1e6) * m.listPrice;
  const saved = listCost - usd;

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="order">
        <div className="order-head">
          <div>
            <div className="order-eyebrow">PLACE ORDER</div>
            <div className="order-title">{m.name}</div>
            <div className="order-sub">
              <Provider name={m.provider} />
              <span className="tier" data-tier={m.tier}>{TIER_LABEL[m.tier]}</span>
            </div>
          </div>
          <button className="x" onClick={onClose} aria-label="close">✕</button>
        </div>

        <div className="order-priceline">
          <div>
            <div className="opl-label">SURPLUS</div>
            <div className="opl-big num">{fmtPrice(m.surplus)}<span className="unit">/1M</span></div>
          </div>
          <div className="opl-vs">vs</div>
          <div>
            <div className="opl-label">LIST</div>
            <div className="opl-strike num">{fmtPrice(m.listPrice)}<span className="unit">/1M</span></div>
          </div>
          <div className="opl-save">−{fmtPct(m.discount)}</div>
        </div>

        <div className="order-field">
          <label>You spend</label>
          <div className="usd-input">
            <span>$</span>
            <input
              type="number"
              min="1"
              value={usd}
              onChange={(e) => setUsd(Math.max(0, parseFloat(e.target.value) || 0))}
            />
            <span className="usd-suffix">USDC</span>
          </div>
          <div className="presets">
            {presets.map(p => (
              <button key={p} className={"preset" + (usd === p ? " on" : "")} onClick={() => setUsd(p)}>${p}</button>
            ))}
          </div>
        </div>

        <div className="order-summary">
          <div className="os-row">
            <span>You receive</span>
            <span className="num">{fmtCap(tokens / 1e6)} tokens</span>
          </div>
          <div className="os-row">
            <span>Cost at list price</span>
            <span className="num strike">{fmtPrice(listCost)}</span>
          </div>
          <div className="os-row big">
            <span>You save</span>
            <span className="num pos">{fmtPrice(saved)}</span>
          </div>
          <div className="os-row sub">
            <span>Avail. capacity</span>
            <span className="num">{fmtCap(m.capTotal * (1 - m.capFilled))} tokens</span>
          </div>
          <div className="os-row sub">
            <span>Time to first token</span>
            <span className="num">{m.latency}ms</span>
          </div>
        </div>

        <button className="place-btn">
          Fill order · {fmtPrice(usd)} <span className="place-sub">settles in USDC</span>
        </button>
        <div className="order-foot">
          Live price · refreshes every block. Order fills at or below the displayed surplus rate.
        </div>
      </aside>
    </>
  );
}
