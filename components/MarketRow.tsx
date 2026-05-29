"use client";

import { Model, fmtPrice, fmtPct, fmtSignedPct, fmtMoney } from "@/lib/data";
import Sparkline from "./Sparkline";
import Provider from "./Provider";
import DepthBar from "./DepthBar";

const TIER_LABEL: Record<string, string> = {
  frontier: "frontier", reasoning: "reasoning", balanced: "balanced", fast: "fast", code: "code",
};

interface MarketRowProps {
  m: Model;
  flash: boolean;
  discViz: string;
  compact: boolean;
  onBuy: (m: Model) => void;
}

export default function MarketRow({ m, flash, discViz, compact, onBuy }: MarketRowProps) {
  const up = m.trend1h >= 0;
  const flashClass = flash ? " flash-" + (m.surplus >= m.prev ? "up" : "down") : "";
  return (
    <div className={"row" + flashClass} onClick={() => onBuy(m)} role="button">
      <div className="c-model">
        <div className="model-name">{m.name}</div>
        <div className="model-sub">
          <Provider name={m.provider} />
          <span className="tier" data-tier={m.tier}>{TIER_LABEL[m.tier]}</span>
          {!compact && <span className="ctx">{m.ctx >= 1000 ? (m.ctx / 1000) + "M" : m.ctx + "K"} ctx</span>}
        </div>
      </div>

      <div className="c-list num">
        <span className="strike">{fmtPrice(m.listPrice)}</span>
        <span className="unit">/1M</span>
      </div>

      <div className="c-surplus num">
        <span className="surplus-price">{fmtPrice(m.surplus)}</span>
        <span className="unit">/1M</span>
      </div>

      <div className="c-disc">
        {discViz === "bar" ? (
          <div className="disc-bar-wrap">
            <div className="disc-bar">
              <div className="disc-bar-fill" style={{ width: (m.discount * 100).toFixed(0) + "%" }} />
            </div>
            <span className="disc-num">−{fmtPct(m.discount)}</span>
          </div>
        ) : discViz === "save" ? (
          <span className="disc-pill" title={`${fmtPct(m.discount)} off list`}>
            save {fmtMoney((m.listPrice - m.surplus) * 1e6 * (m.vol24 / 1000))}
          </span>
        ) : (
          <span className="disc-pill">−{fmtPct(m.discount)}</span>
        )}
      </div>

      <div className="c-spark">
        <Sparkline data={m.hist} up={up} />
      </div>

      <div className={"c-chg num " + (up ? "neg" : "pos")}>
        <span className="arrow">{up ? "▲" : "▼"}</span>{fmtSignedPct(m.trend1h)}
      </div>

      <div className="c-depth">
        {!compact && <DepthBar filled={m.capFilled} total={m.capTotal} />}
      </div>

      <div className="c-action">
        <button className="buy-btn" onClick={(e) => { e.stopPropagation(); onBuy(m); }}>Buy</button>
      </div>
    </div>
  );
}
