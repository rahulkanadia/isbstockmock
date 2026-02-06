"use client";

import { useEffect, useState } from "react";

export function PriceStatusCard() {
  const [status, setStatus] = useState<any>(null);
  const [running, setRunning] = useState(false);

  async function refresh() {
    const r = await fetch("/api/status/prices");
    setStatus(await r.json());
  }

  async function runNow() {
    setRunning(true);
    await fetch("/api/cron/prices");
    await refresh();
    setRunning(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  if (!status) return null;

  const last = status.lastUpdatedAt
    ? new Date(status.lastUpdatedAt)
    : null;

  const stale =
    last &&
    Date.now() - last.getTime() > 24 * 3600 * 1000;

  return (
    <div className="border border-zinc-700 rounded p-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium">
            Price Status
          </div>
          <div
            className={`text-sm ${
              stale ? "text-red-400" : "text-zinc-400"
            }`}
          >
            Last update:{" "}
            {last
              ? last.toLocaleString("en-IN")
              : "Never"}
            {stale && " (STALE)"}
          </div>
        </div>

        <button
          onClick={runNow}
          disabled={running}
          className="px-3 py-1 bg-amber-600 text-black rounded text-sm disabled:opacity-50"
        >
          {running ? "Updating…" : "Update prices now"}
        </button>
      </div>
    </div>
  );
}
