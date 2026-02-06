export function buildDiscordShare(params: {
  month: string;
  top: { user: string; symbol: string; pnlPercent: number }[];
}) {
  const lines = [
    `**🏆 ${params.month} Stock Picking League**`,
  ];

  params.top.forEach((r, i) => {
    const medal = ["🥇", "🥈", "🥉"][i] ?? "🔹";
    lines.push(
      `${medal} **${r.user}** — ${r.symbol} **${r.pnlPercent}%**`
    );
  });

  return lines.join("\n");
}