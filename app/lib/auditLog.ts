import prisma from "@/app/lib/prisma";

export type AuditAction =
  | "PRICE_OVERRIDE"
  | "PRICE_OVERRIDE_FAILED"
  | "PRICE_UPDATE"
  | "PRICE_UPDATE_FAILED"
  | "PICK_OVERRIDE"
  | "USER_BAN"
  | "USER_UNBAN"
  | "SYSTEM_ERROR";

export async function logAuditEvent(params: {
  adminId?: string;
  action: AuditAction;
  message: string;
  success?: boolean;
  meta?: any;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        message: params.message,
        success: params.success ?? true,
        meta: params.meta ?? {},
      },
    });
  } catch (e) {
    console.error("Failed to write audit log:", e);
  }
}

export async function getAuditLogs(limit = 50) {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return logs.map((log) => ({
    id: log.id,
    time: log.createdAt.toISOString(),
    adminId: log.adminId ?? "System",
    action: log.action,
    status: log.success ? "SUCCESS" : "FAILED",
    target: log.message, // Using message as target/description for now
  }));
}