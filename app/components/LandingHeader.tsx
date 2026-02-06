export function LandingHeader() {
  const monthLabel = new Date().toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <header className="space-y-2">
      <h1 className="text-3xl font-semibold tracking-tight">
        Indian Stock Picking League
      </h1>

      <p className="text-zinc-700 dark:text-zinc-300">
        A monthly Indian stock-picking competition. One stock per person.
      </p>

      <p className="text-sm text-zinc-500">
        {monthLabel} leaderboard · Rankings update daily using closing prices
      </p>
    </header>
  );
}