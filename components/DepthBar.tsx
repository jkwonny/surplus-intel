"use client";

import { fmtCap } from "@/lib/data";

interface DepthBarProps {
  filled: number;
  total: number;
}

export default function DepthBar({ filled, total }: DepthBarProps) {
  const avail = Math.max(0, 1 - filled);
  const low = avail < 0.18;
  return (
    <div className="depth" title={`${fmtCap(total * avail)} available of ${fmtCap(total)}`}>
      <div className="depth-track">
        <div
          className="depth-fill"
          style={{ width: (avail * 100).toFixed(0) + "%" }}
          data-low={low}
        />
      </div>
      <span className="depth-label" data-low={low}>{fmtCap(total * avail)}</span>
    </div>
  );
}
