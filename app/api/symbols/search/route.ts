import { NextResponse } from "next/server";
import { searchSymbols } from "@/app/lib/symbols";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toUpperCase();

  const symbols = await searchSymbols(q);

  return NextResponse.json({ symbols });
}