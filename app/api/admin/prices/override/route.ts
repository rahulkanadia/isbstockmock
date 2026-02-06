import prisma from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/accessControl";
import { logAuditEvent } from "@/app/lib/auditLog";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  const body = await req.json();

  const price = await prisma.dailyPrice.findFirst({
    where: {
      baseSymbol: body.baseSymbol,
      exchange: body.exchange,
      date: new Date(body.date),
    },
  });

  if (!price) {
    return NextResponse.json(
      { error: "Price not found" },
      { status: 404 }
    );
  }

  const data: { open?: number; close?: number } = {};
  if (body.open != null) data.open = body.open;
  if (body.close != null) data.close = body.close;

  await prisma.dailyPrice.update({
    where: { id: price.id },
    data,
  });

  await logAuditEvent({
    adminId: admin.id,
    action: "PRICE_OVERRIDE",
    message: `${body.baseSymbol} ${body.exchange} ${body.date}`,
  });

  return NextResponse.json({ ok: true });
}
