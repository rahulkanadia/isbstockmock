import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type SessionUser = {
  id: string;
  name?: string | null;
  image?: string | null;
};

type SessionWithUser = {
  user: SessionUser;
};

export async function requireUser(): Promise<SessionUser> {
  const session = (await getServerSession(
    authOptions as any
  )) as SessionWithUser | null;

  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized");
  }

  return session.user;
}