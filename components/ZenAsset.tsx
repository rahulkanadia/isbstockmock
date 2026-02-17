"use client";
import { cn } from "@/lib/utils";

export const ZEN_TOOLS = [
  { id: 'sand', icon: '⏳', label: 'Sand' },
  { id: 'water', icon: '💧', label: 'Water' },
  { id: 'grass', icon: '🌱', label: 'Grass' },
  { id: 'tree', icon: '🌳', label: 'Tree' },
  { id: 'plant', icon: '🌸', label: 'Flower' },
  { id: 'bush', icon: '🌿', label: 'Bush' },
  { id: 'bench', icon: '🪑', label: 'Bench' },
  { id: 'log', icon: '🪵', label: 'Log' },
  { id: 'eraser', icon: '🧹', label: 'Clear' }
];

export default function ZenAsset({ type }: { type: string }) {
  const assets: Record<string, string> = {
    tree: "🌳",
    plant: "🌸",
    bush: "🌿",
    bench: "🪑",
    log: "🪵",
    grass: "🌱",
    water: "💧",
    sand: "⏳"
  };

  return (
    <div className="text-2xl select-none animate-in zoom-in duration-300">
      {assets[type] || "❓"}
    </div>
  );
}
