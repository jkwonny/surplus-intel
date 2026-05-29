export interface Model {
  id: string;
  name: string;
  provider: string;
  listPrice: number;
  ctx: number;
  tier: string;
  surplus: number;
  prev: number;
  discount: number;
  hist: number[];
  capTotal: number;
  capFilled: number;
  vol24: number;
  latency: number;
  uptime: number;
  trend1h: number;
}

const RAW: [string, string, number, number, string][] = [
  ["GPT-4o",            "OpenAI",     2.50,  128, "frontier"],
  ["GPT-4o mini",       "OpenAI",     0.15,  128, "fast"],
  ["o1",                "OpenAI",    15.00,  200, "reasoning"],
  ["o1-mini",           "OpenAI",     3.00,  128, "reasoning"],
  ["o3-mini",           "OpenAI",     1.10,  200, "reasoning"],
  ["Claude 3.5 Sonnet", "Anthropic",  3.00,  200, "frontier"],
  ["Claude 3.5 Haiku",  "Anthropic",  0.80,  200, "fast"],
  ["Claude 3 Opus",     "Anthropic", 15.00,  200, "frontier"],
  ["Gemini 1.5 Pro",    "Google",     1.25, 2000, "frontier"],
  ["Gemini 1.5 Flash",  "Google",     0.075,1000, "fast"],
  ["Gemini 2.0 Flash",  "Google",     0.10, 1000, "fast"],
  ["Llama 3.1 405B",    "Meta",       2.70,  128, "frontier"],
  ["Llama 3.3 70B",     "Meta",       0.59,  128, "balanced"],
  ["Llama 3.1 70B",     "Meta",       0.59,  128, "balanced"],
  ["Llama 3.1 8B",      "Meta",       0.05,  128, "fast"],
  ["Mistral Large",     "Mistral",    2.00,  128, "frontier"],
  ["Mistral Small",     "Mistral",    0.20,  128, "fast"],
  ["Mixtral 8x7B",      "Mistral",    0.24,   32, "balanced"],
  ["DeepSeek V3",       "DeepSeek",   0.27,   64, "balanced"],
  ["DeepSeek R1",       "DeepSeek",   0.55,   64, "reasoning"],
  ["Qwen 2.5 72B",      "Alibaba",    0.35,  128, "balanced"],
  ["Qwen 2.5 Coder 32B","Alibaba",    0.18,  128, "code"],
  ["Command R+",        "Cohere",     2.50,  128, "balanced"],
  ["Command R",         "Cohere",     0.15,  128, "fast"],
  ["Phi-3 Medium",      "Microsoft",  0.17,  128, "fast"],
  ["Gemma 2 27B",       "Google",     0.27,    8, "balanced"],
  ["Yi Large",          "01.AI",      3.00,   32, "frontier"],
  ["Grok 2",            "xAI",        2.00,  128, "frontier"],
  ["Nova Pro",          "Amazon",     0.80,  300, "balanced"],
  ["Nova Lite",         "Amazon",     0.06,  300, "fast"],
  ["Jamba 1.5 Large",   "AI21",       2.00,  256, "balanced"],
  ["Solar Pro",         "Upstage",    0.25,    4, "balanced"],
];

const HIST = 40;
let seed = 1337;
function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }

export const MODELS: Model[] = RAW.map((r, i) => {
  const [name, provider, listPrice, ctx, tier] = r;
  const discount = 0.24 + rnd() * 0.42;
  const surplus = listPrice * (1 - discount);
  const hist: number[] = [];
  let p = surplus * (0.9 + rnd() * 0.2);
  for (let k = 0; k < HIST; k++) {
    p += (surplus - p) * 0.08 + (rnd() - 0.5) * surplus * 0.05;
    p = Math.max(surplus * 0.55, p);
    hist.push(p);
  }
  hist[hist.length - 1] = surplus;
  const capTotal = Math.round((8 + rnd() * 240));
  return {
    id: "m" + i,
    name, provider, listPrice, ctx, tier,
    surplus,
    prev: surplus,
    discount,
    hist,
    capTotal,
    capFilled: 0.18 + rnd() * 0.7,
    vol24: Math.round(2 + rnd() * 180),
    latency: Math.round(180 + rnd() * 900),
    uptime: 99.0 + rnd() * 0.98,
    trend1h: (rnd() - 0.45) * 0.12,
  };
});

export const PROVIDERS = [...new Set(MODELS.map(m => m.provider))];

export function tick(): string[] {
  const n = 4 + Math.floor(rnd() * 5);
  const touched: string[] = [];
  for (let j = 0; j < n; j++) {
    const m = MODELS[Math.floor(rnd() * MODELS.length)];
    m.prev = m.surplus;
    const drift = (rnd() - 0.5) * m.surplus * 0.04;
    m.surplus = Math.max(m.listPrice * 0.1, m.surplus + drift);
    m.discount = 1 - m.surplus / m.listPrice;
    m.hist = m.hist.slice(1).concat(m.surplus);
    m.trend1h = (m.surplus - m.hist[0]) / m.hist[0];
    m.capFilled = Math.min(0.98, Math.max(0.05, m.capFilled + (rnd() - 0.48) * 0.06));
    touched.push(m.id);
  }
  return touched;
}

export const fmtPrice = (v: number) => v >= 1 ? "$" + v.toFixed(2) : "$" + v.toFixed(3);
export const fmtPct = (v: number) => (v * 100).toFixed(v * 100 >= 10 ? 0 : 1) + "%";
export const fmtSignedPct = (v: number) => (v >= 0 ? "+" : "") + (v * 100).toFixed(1) + "%";
export const fmtCap = (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + "B" : v.toFixed(0) + "M";
export const fmtMoney = (v: number) => {
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
  if (v >= 1e3) return "$" + (v / 1e3).toFixed(1) + "K";
  return "$" + v.toFixed(0);
};
