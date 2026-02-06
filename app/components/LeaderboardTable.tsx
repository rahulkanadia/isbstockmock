"use client";
import { useEffect, useState } from "react";

export function LeaderboardTable() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/leaderboard").then(r => r.json()).then(setRows);
  }, []);
  return (
    <table className="w-full">
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td>{r.symbol}</td>
            <td>{r.pnl.toFixed(2)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}