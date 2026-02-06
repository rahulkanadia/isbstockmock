"use client";

type Props = {
  symbol: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function PickModalConfirm({ symbol, onConfirm, onCancel }: Props) {
  return (
    <div className="space-y-4 rounded border p-4 bg-white dark:bg-black">
      <h3 className="text-lg font-semibold">Confirm your pick</h3>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        You are about to lock <strong>{symbol}</strong> as your stock pick.
      </p>

      <ul className="text-sm list-disc ml-4 space-y-1 text-zinc-600 dark:text-zinc-400">
        <li>If the market is open, entry price is the current market price</li>
        <li>If the market is closed, entry price is the last closing price</li>
        <li>You can change your pick only once per calendar month</li>
      </ul>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black"
        >
          Confirm Pick
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded border text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}