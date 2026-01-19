"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PickModal() {
  const [baseSymbol, setBaseSymbol] = useState("");
  const [exchange, setExchange] = useState("NSE");

  async function submit() {
    await fetch("/api/pick/create", {
      method: "POST",
      body: JSON.stringify({ baseSymbol, exchange }),
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Select Stock</Button>
      </DialogTrigger>

      <DialogContent className="bg-zinc-900 border-zinc-800">
        <h3 className="font-semibold mb-4">Pick your stock</h3>

        <input
          className="w-full mb-3 p-2 bg-zinc-800 border border-zinc-700 rounded"
          placeholder="Stock symbol (e.g. TCS)"
          value={baseSymbol}
          onChange={(e) => setBaseSymbol(e.target.value.toUpperCase())}
        />

        <Select value={exchange} onValueChange={setExchange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NSE">NSE</SelectItem>
            <SelectItem value="BSE">BSE</SelectItem>
            <SelectItem value="NSE_SME">NSE SME</SelectItem>
            <SelectItem value="BSE_SME">BSE SME</SelectItem>
          </SelectContent>
        </Select>

        <Button className="mt-4 w-full" onClick={submit}>
          Confirm Pick
        </Button>
      </DialogContent>
    </Dialog>
  );
}
