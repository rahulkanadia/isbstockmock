"use client";

import { useState } from "react";

export function PriceOverrideModal({
  symbol,
  onClose,
}: {
  symbol: any;
  onClose: () => void;
}) {
  const [date, setDate] = useState("");
  const [open, setOpen] = useState("");
  const [close, setClose] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (confirm !== "CONFIRM") {
      setError("Type CONFIRM to proceed");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch(
      "/api/admin/prices/override",
      {
        method: "POST",
        body: JSON.stringify({
          baseSymbol: symbol.baseSymbol,
          exchange: symbol.exchange,
          date,
          open: open ? Number(open) : null,
          close: close ? Number(close) : null,
        }),
      }
    );

    if (!res.ok) {
      const j = await res.json();
      setError(j.error ?? "Override failed");
      setLoading(false);
      return;
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-700 p-4 rounded w-96 space-y-3">
        <div className="font-semibold">
          Override Price — {symbol.name}
        </div>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 bg-zinc-800 border"
        />

        <input
          placeholder="Open price"
          value={open}
          onChange={(e) => setOpen(e.target.value)}
          className="w-full p-2 bg-zinc-800 border"
        />

        <input
          placeholder="Close price"
          value={close}
          onChange={(e) => setClose(e.target.value)}
          className="w-full p-2 bg-zinc-800 border"
        />

        <input
          placeholder="Type CONFIRM"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full p-2 bg-zinc-800 border"
        />

        {error && (
          <div className="text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1 border"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="px-3 py-1 bg-amber-600 text-black"
          >
            {loading ? "Saving…" : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}
