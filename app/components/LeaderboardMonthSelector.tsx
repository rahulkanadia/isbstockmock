type Props = {
  months: string[]; // YYYY-MM
  selected: string;
  onChange: (month: string) => void;
};

export function LeaderboardMonthSelector({
  months,
  selected,
  onChange,
}: Props) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded px-2 py-1 text-sm"
    >
      {months.map((m) => (
        <option key={m} value={m}>
          {new Date(m + "-01").toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })}
        </option>
      ))}
    </select>
  );
}