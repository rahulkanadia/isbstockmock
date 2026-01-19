"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

type SymbolResult = {
  baseSymbol: string;
  exchange: string;
  name: string;
};

export function SymbolSearch({
  onSelect,
}: {
  onSelect: (symbol: SymbolResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolResult[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      return;
    }

    const id = setTimeout(async () => {
      const res = await fetch(`/api/symbols/search?q=${query}`);
      const data = await res.json();
      setResults(data.symbols);
    }, 250);

    return () => clearTimeout(id);
  }, [query]);

  return (
    <div className="relative">
      <input
        className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded"
        placeholder="Search stock (e.g. TCS, Reliance)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value.toUpperCase());
          setOpen(true);
        }}
      />

      {open && results.length > 0 && (
        <Card className="absolute z-50 mt-1 w-full bg-zinc-900 border-zinc-800 max-h-60 overflow-y-auto">
          {results.map((s, i) => (
            <div
              key={i}
              className="px-3 py-2 text-sm hover:bg-zinc-800 cursor-pointer"
              onClick={() => {
                onSelect(s);
                setQuery(`${s.baseSymbol} (${s.exchange})`);
                setOpen(false);
              }}
            >
              <div className="font-medium">
                {s.baseSymbol}{" "}
                <span className="text-xs text-zinc-400">
                  ({s.exchange})
                </span>
              </div>
              <div className="text-xs text-zinc-400 truncate">
                {s.name}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
