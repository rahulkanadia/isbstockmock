import { RulesCard } from "./components/RulesCard";
import { PickModal } from "./components/PickModal";
import { LeaderboardTable } from "./components/LeaderboardTable";
import { TopMovers } from "./components/TopMovers";

async function getLeaderboard() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/leaderboard`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function Page() {
  const data = await getLeaderboard();

  return (
    <>
      <RulesCard />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <TopMovers title="Top Winners" rows={[]} />
          <TopMovers title="Top Losers" rows={[]} />
        </div>

        <div className="md:col-span-2">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold">Leaderboard</h2>
            <PickModal />
          </div>

          <LeaderboardTable rows={data.leaderboard} />
        </div>
      </div>
    </>
  );
}
