type Row = {
  user: string;
  symbol: string;
  pnlPercent: number;
};

type Props = {
  month: string;
  rows: Row[];
};

export function LeaderboardSnapshot({ month, rows }: Props) {
  return (
    <div className="border rounded p-4 space-y-2 text-sm">
      <div className="font-medium">
        {month} Leaderboard
      </div>

      <ul className="space-y-1">
        {rows.map((r, i) => (
          <li key={i}>
            {i + 1}. {r.user} — {r.symbol} ({r.pnlPercent}%)
          </li>
        ))}
      </ul>
    </div>
  );
}