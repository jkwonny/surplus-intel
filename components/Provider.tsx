"use client";

const INITIALS: Record<string, string> = {
  OpenAI: "OA", Anthropic: "AN", Google: "GG", Meta: "MT", Mistral: "MS",
  DeepSeek: "DS", Alibaba: "QW", Cohere: "CO", Microsoft: "MS", "01.AI": "YI",
  xAI: "X", Amazon: "AZ", AI21: "J", Upstage: "UP",
};

export default function Provider({ name }: { name: string }) {
  const initials = INITIALS[name] || name.slice(0, 2).toUpperCase();
  return (
    <span className="prov" data-prov={name}>
      <span className="prov-dot">{initials}</span>
      <span className="prov-name">{name}</span>
    </span>
  );
}
