"use client";

import { useEffect, useState } from "react";

type ApiResponse = {
  lastUpdatedAt: string | null;
};

export function LastUpdatedBadge() {
  const [date, setDate] = useState<Date | null>(null);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    fetch("/api/status/prices")
      .then((r) => r.json())
      .then((json: ApiResponse) => {
        if (!json.lastUpdatedAt) return;

        const d = new Date(json.lastUpdatedAt);
        setDate(d);

        const hours =
          (Date.now() - d.getTime()) / (1000 * 60 * 60);
        if (hours > 24) setStale(true);
      })
      .catch(() => {});
  }, []);

  if (!date) {
    return (
      <div className="text-xs text-zinc-400">
        Price update unavailable
      </div>
    );
  }

  return (
    <div
      className={`text-xs ${
        stale ? "text-red-600" : "text-zinc-500"
      }`}
    >
      Last updated:{" "}
      {date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })}
      {stale && " (stale)"}
    </div>
  );
}
