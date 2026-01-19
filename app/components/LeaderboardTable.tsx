"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Row = {
  username: string;
  baseSymbol: string;
  exchange: string;
  entryPrice: number;
  pnlPercent: number;
};

export function LeaderboardTable({ rows }: { rows: Row[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Entry</TableHead>
          <TableHead>P&amp;L %</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i}>
            <TableCell>{r.username}</TableCell>
            <TableCell>
              {r.baseSymbol} <span className="text-xs text-zinc-400">({r.exchange})</span>
            </TableCell>
            <TableCell>₹{r.entryPrice.toFixed(2)}</TableCell>
            <TableCell
              className={r.pnlPercent >= 0 ? "text-green-400" : "text-red-400"}
            >
              {r.pnlPercent.toFixed(2)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
