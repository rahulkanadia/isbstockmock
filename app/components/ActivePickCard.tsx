type Props = {
  symbol: string;
  entryDate: string; // ISO
};

export function ActivePickCard({ symbol, entryDate }: Props) {
  const entry = new Date(entryDate);
  const now = new Date();

  const daysHeld = Math.floor(
    (now.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)
  );

  const nextChangeDate = new Date(entry);
  nextChangeDate.setMonth(entry.getMonth() + 1);
  nextChangeDate.setDate(1);

  return (
    <div className="rounded border p-4 space-y-2 bg-white dark:bg-black">
      <h3 className="font-semibold text-lg">Your Active Pick</h3>

      <div className="text-sm">
        <div>
          <strong>{symbol}</strong>
        </div>
        <div className="text-zinc-600 dark:text-zinc-400">
          Days held: {daysHeld}
        </div>
        <div className="text-zinc-600 dark:text-zinc-400">
          Next change on or after{" "}
          <strong>
            {nextChangeDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </strong>
        </div>
      </div>
    </div>
  );
}