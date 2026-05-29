"use client";

import { Model, fmtPrice, fmtPct } from "@/lib/data";

interface TickerProps {
  models: Model[];
}

function Strip({ items }: { items: Model[] }) {
  return (
    <div className="ticker-strip">
      {items.map((m) => (
        <span className="tick" key={m.id}>
          <span className="tick-name">{m.name}</span>
          <span className="tick-price">{fmtPrice(m.surplus)}</span>
          <span className={"tick-disc " + (m.trend1h >= 0 ? "neg" : "pos")}>−{fmtPct(m.discount)}</span>
        </span>
      ))}
    </div>
  );
}

export default function Ticker({ models }: TickerProps) {
  const items = [...models].sort((a, b) => b.discount - a.discount);
  return (
    <div className="ticker">
      <div className="ticker-tag">SURPLUS</div>
      <div className="ticker-rail">
        <Strip items={items} />
        <Strip items={items} />
      </div>
    </div>
  );
}
