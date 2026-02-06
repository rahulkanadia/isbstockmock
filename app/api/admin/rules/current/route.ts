import { getActiveRules } from "@/app/lib/rules";

export async function GET() {
  return Response.json(getActiveRules());
}