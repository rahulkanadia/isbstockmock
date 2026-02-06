import { requireAdmin, unbanUser } from "@/app/lib/accessControl";
import { logAuditEvent } from "@/app/lib/auditLog";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  const { userId } = await req.json();

  unbanUser(userId);

  await logAuditEvent({
    adminId: admin.id,
    action: "USER_UNBAN",
    message: `User ${userId} unbanned`,
    success: true,
  });

  return Response.json({ ok: true });
}