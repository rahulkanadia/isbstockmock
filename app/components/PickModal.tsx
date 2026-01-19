"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SymbolSearch } from "./SymbolSearch";

type SelectedSymbol = {
  baseSymbol: string;
  exchange: string;
};

export function PickModal() {
  const [selected, setSelected] = useState<SelectedSymbol | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!selected) return;

    setLoading(true);
    await fetch("/api/pick/create", {
      method: "POST",
      body: JSON.stringify(selected),
    });
    setLoading(false);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Select Stock</Button>
      </DialogTrigger>

      <DialogContent className="bg-zinc-900 border-zinc-800">
        <h3 className="font-semibold mb-4">Pick your stock</h3>

        <SymbolSearch onSelect={setSelected} />

        <Button
          className="mt-4 w-full"
          disabled={!selected || loading}
          onClick={submit}
        >
          {loading ? "Saving..." : "Confirm Pick"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
