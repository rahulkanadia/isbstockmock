import { requireAdmin } from "@/app/lib/accessControl";
import { updateRules } from "@/app/lib/rules";

export async function POST(req: Request) {
  await requireAdmin();
  const { rules } = await req.json();
  updateRules(rules);
  return Response.json({ ok: true });
}