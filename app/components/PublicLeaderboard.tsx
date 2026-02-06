import { getActiveLeaderboard } from "@/app/lib/leaderboard";

export async function PublicLeaderboard({ darkTheme = false }: { darkTheme?: boolean }) {
  const leaderboard = await getActiveLeaderboard();

  if (leaderboard.length === 0) {
    return <div className="p-6 text-center italic text-zinc-500">No active trades yet.</div>;
  }

  const cardBg = darkTheme ? "bg-white/5 border-zinc-800" : "bg-white border-zinc-100";
  const textColor = darkTheme ? "text-zinc-300" : "text-zinc-600";
  const nameColor = darkTheme ? "text-white" : "text-zinc-900";

  return (
    <div className="space-y-3">
      {leaderboard.map((user, i) => (
        <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${cardBg}`}>
          <div className="flex items-center gap-3">
            <div className={`font-mono text-sm font-bold ${i < 3 ? "text-purple-500" : "text-zinc-500"}`}>
              #{user.rank}
            </div>
            <div>
              <div className={`font-bold text-sm ${nameColor}`}>{user.username}</div>
              <div className={`text-[10px] uppercase tracking-wider ${textColor}`}>{user.symbol}</div>
            </div>
          </div>
          <div className={`font-mono font-bold ${user.pnlPercent >= 0 ? "text-green-500" : "text-red-500"}`}>
            {user.pnlPercent > 0 ? "+" : ""}{user.pnlPercent.toFixed(2)}%
          </div>
        </div>
      ))}
    </div>
  );
}