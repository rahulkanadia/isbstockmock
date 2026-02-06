export function buildShareText(params: {
  month: string;
  top: { user: string; symbol: string; pnlPercent: number }[];
}) {
  const lines = [
    `🏆 ${params.month} Stock Picking League`,
  ];

  params.top.forEach((r, i) => {
    lines.push(
      `${i + 1}. ${r.user} — ${r.symbol} ${r.pnlPercent}%`
    );
  });

  return lines.join("\n");
}