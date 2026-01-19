"use client";

import { useEffect, useState } from "react";
import Fuse from "fuse.js";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type RawSymbol = {
  baseSymbol: string;
  exchange: string;
  name: string;
};

type GroupedSymbol = {
  baseSymbol: string;
  name: string;
  exchanges: string[];
  resolvedExchange: string;
};

const EXCHANGE_PRIORITY = ["NSE", "BSE", "NSE_SME", "BSE_SME"];

function resolveExchange(exchanges: string[]): string {
  return (
    EXCHANGE_PRIORITY.find((e) => exchanges.includes(e)) ??
    exchanges[0]
  );
}

export function SymbolSearch({
  onSelect,
}: {
  onSelect: (symbol: { baseSymbol: string; exchange: string }) => void;
}) {
  const [query, setQuery] = useState("");
  const [raw, setRaw] = useState<RawSymbol[]>([]);
  const [results, setResults] = useState<GroupedSymbol[]>([]);
  const [open, setOpen] = useState(false);

  // Fetch candidates
  useEffect(() => {
    if (query.length < 1) {
      setRaw([]);
      setResults([]);
      return;
    }

    const id = setTimeout(async () => {
      const res = await fetch(`/api/symbols/search?q=${query}`);
      const data = await res.json();
      setRaw(data.symbols);
    }, 250);

    return () => clearTimeout(id);
  }, [query]);

  // Fuzzy + group
  useEffect(() => {
    if (raw.length === 0) {
      setResults([]);
      return;
    }

    const fuse = new Fuse(raw, {
      keys: ["baseSymbol", "name"],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });

    const matches = fuse.search(query).map((r) => r.item);

    const grouped = Object.values(
      matches.reduce<Record<string, GroupedSymbol>>((acc, cur) => {
        if (!acc[cur.baseSymbol]) {
          acc[cur.baseSymbol] = {
            baseSymbol: cur.baseSymbol,
            name: cur.name,
            exchanges: [],
            resolvedExchange: "",
          };
        }
        acc[cur.baseSymbol].exchanges.push(cur.exchange);
        return acc;
      }, {})
    ).map((g) => ({
      ...g,
      exchanges: Array.from(new Set(g.exchanges)),
      resolvedExchange: resolveExchange(g.exchanges),
    }));

    setResults(grouped.slice(0, 20));
  }, [raw, query]);

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
        <Card className="absolute z-50 mt-1 w-full bg-zinc-900 border-zinc-800 max-h-72 overflow-y-auto">
          {results.map((s) => (
            <div
              key={s.baseSymbol}
              className="px-3 py-3 hover:bg-zinc-800 cursor-pointer"
              onClick={() => {
                onSelect({
                  baseSymbol: s.baseSymbol,
                  exchange: s.resolvedExchange,
                });
                setQuery(s.baseSymbol);
                setOpen(false);
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">
                    {s.baseSymbol}
                  </div>
                  <div className="text-xs text-zinc-400 truncate">
                    {s.name}
                  </div>
                </div>

                <div className="flex gap-1">
                  {s.exchanges.map((ex) => (
                    <Badge
                      key={ex}
                      variant={
                        ex === s.resolvedExchange
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {ex.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
