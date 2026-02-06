"use client";

import { useState } from "react";
import { SymbolSearch } from "./SymbolSearch";
import { PickModalConfirm } from "./PickModalConfirm";

export function PickModal() {
  const [symbol, setSymbol] = useState<{
    baseSymbol: string;
    exchange: string;
    name: string;
  } | null>(null);

  const [confirming, setConfirming] = useState(false);

  async function createPick() {
    if (!symbol) return;

    await fetch("/api/pick/create", {
      method: "POST",
      body: JSON.stringify({
        baseSymbol: symbol.baseSymbol,
        exchange: symbol.exchange,
      }),
    });

    setConfirming(false);
  }

  if (confirming && symbol) {
    return (
      <PickModalConfirm
        symbol={symbol.name}
        onConfirm={createPick}
        onCancel={() => setConfirming(false)}
      />
    );
  }

  return (
    <SymbolSearch
      onSelect={(s) => {
        setSymbol(s);
        setConfirming(true);
      }}
    />
  );
}
