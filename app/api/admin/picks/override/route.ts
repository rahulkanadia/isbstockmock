import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/accessControl";
import { logAuditEvent } from "@/app/lib/auditLog";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  const { pickId, exitDate } = await req.json();

  const pick = await prisma.pick.findUnique({ where: { id: pickId } });

  if (!pick) {
    return NextResponse.json({ error: "Pick not found" }, { status: 404 });
  }

  await prisma.pick.update({
    where: { id: pickId },
    data: { exitDate: new Date(exitDate), active: false },
  });

  await logAuditEvent({
    adminId: admin.id,
    action: "PICK_OVERRIDE",
    message: `Pick ${pickId} force-closed`,
  });

  return NextResponse.json({ ok: true });
}
