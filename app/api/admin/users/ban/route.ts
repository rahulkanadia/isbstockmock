import { requireAdmin, banUser } from "@/app/lib/accessControl";
import { logAuditEvent } from "@/app/lib/auditLog";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  const { userId } = await req.json();

  banUser(userId);

  await logAuditEvent({
    adminId: admin.id,
    action: "USER_BAN",
    message: `User ${userId} banned`,
    success: true,
  });

  return Response.json({ ok: true });
}
