"use client";

import { useEffect, useState } from "react";
import Fuse from "fuse.js";
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
  const [rawResults, setRawResults] = useState<SymbolResult[]>([]);
  const [results, setResults] = useState<SymbolResult[]>([]);
  const [open, setOpen] = useState(false);

  // Fetch candidates
  useEffect(() => {
    if (query.length < 1) {
      setRawResults([]);
      setResults([]);
      return;
    }

    const id = setTimeout(async () => {
      const res = await fetch(`/api/symbols/search?q=${query}`);
      const data = await res.json();
      setRawResults(data.symbols);
    }, 250);

    return () => clearTimeout(id);
  }, [query]);

  // Fuzzy match
  useEffect(() => {
    if (rawResults.length === 0) {
      setResults([]);
      return;
    }

    const fuse = new Fuse(rawResults, {
      keys: ["baseSymbol", "name"],
      threshold: 0.35, // 🔹 tight = fewer garbage matches
      ignoreLocation: true,
      minMatchCharLength: 2,
    });

    const fuzzy = fuse.search(query).slice(0, 20);
    setResults(fuzzy.map((r) => r.item));
  }, [rawResults, query]);

  return (
    <div className="relative">
      <input
        className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded"
        placeholder="Search stock (e.g. TCS, Reliance, Infy)"
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
              key={`${s.baseSymbol}-${s.exchange}-${i}`}
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
