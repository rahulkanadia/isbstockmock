import { Card, CardContent } from "@/components/ui/card";

export function TopMovers({
  title,
  rows,
}: {
  title: string;
  rows: { username: string; pnlPercent: number }[];
}) {
  return (
    <Card className="mb-4 bg-zinc-900 border-zinc-800">
      <CardContent className="pt-4">
        <h3 className="font-semibold mb-2">{title}</h3>
        {rows.map((r, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>{r.username}</span>
            <span
              className={r.pnlPercent >= 0 ? "text-green-400" : "text-red-400"}
            >
              {r.pnlPercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
