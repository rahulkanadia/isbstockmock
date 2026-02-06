"use client";
import { useState } from "react";

type SymbolRow = {
  baseSymbol: string;
  exchange: string;
  name: string;
};

export function SymbolSearch({
  onSelect,
}: {
  onSelect: (s: SymbolRow) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SymbolRow[]>([]);

  async function search(v: string) {
    setQ(v);
    const r = await fetch(
      `/api/symbols/search?q=${v}`
    ).then((r) => r.json());
    setResults(r.symbols ?? []);
  }

  return (
    <div>
      <input
        value={q}
        onChange={(e) => search(e.target.value)}
        className="border p-2 w-full"
      />
      <ul>
        {results.map((r) => (
          <li
            key={`${r.baseSymbol}-${r.exchange}`}
            onClick={() => onSelect(r)}
            className="cursor-pointer"
          >
            {r.name} ({r.exchange})
          </li>
        ))}
      </ul>
    </div>
  );
}