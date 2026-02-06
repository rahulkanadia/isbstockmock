import { requireUser } from "@/app/lib/auth";
import { getUserStats } from "@/app/lib/userStats";

export async function GET() {
  const user = await requireUser();
  const stats = await getUserStats(user.id);
  return Response.json(stats);
}