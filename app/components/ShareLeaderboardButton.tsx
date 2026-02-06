type Props = {
  text: string;
};

export function ShareLeaderboardButton({ text }: Props) {
  async function copy() {
    await navigator.clipboard.writeText(text);
    alert("Leaderboard copied to clipboard");
  }

  return (
    <button
      onClick={copy}
      className="text-sm underline text-zinc-600 hover:text-zinc-900"
    >
      Copy leaderboard
    </button>
  );
}