type Props = {
  percentile: number; // 0–100
};

export function RelativeMetricsBadge({ percentile }: Props) {
  return (
    <span className="inline-block text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
      Top {percentile}%
    </span>
  );
}