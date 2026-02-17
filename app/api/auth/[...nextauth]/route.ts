import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@/lib/db";

const IS_LOCAL = process.env.TESTONLIVE !== "1";
// Grabs the first ID in your ADMIN_IDS list
const PRIMARY_ADMIN_ID = (process.env.ADMIN_IDS || "").split(",")[0];
// Grabs the username from .env (defaults to 'Admin' if missing)
const DEV_NAME = process.env.DEV_USERNAME || "Admin";

export const authOptions: NextAuthOptions = {
  // Only enable Discord in Live mode
  providers: IS_LOCAL ? [] : [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      const adminIds = (process.env.ADMIN_IDS || "").split(",");

      if (IS_LOCAL) {
        // PURE LOCAL BYPASS: Uses .env values exclusively
        session.user = {
          ...session.user,
          id: PRIMARY_ADMIN_ID, 
          username: DEV_NAME,
          isAdmin: true,
        } as any;
        return session;
      }

      if (session.user && token.uid) {
        session.user.id = token.uid as string;
        session.user.isAdmin = adminIds.includes(token.uid as string);
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      return token;
    },
    async signIn({ user, profile }) {
      // Local mode auto-approves
      if (IS_LOCAL) return true;
      if (!user.id || !profile) return false;
      
      const discordId = user.id;
      const username = ((profile as any).username || "").toLowerCase();

      const existingUser = await prisma.user.findUnique({ where: { id: discordId } });
      if (existingUser) return true;

      // Check for legacy data to migrate
      const legacyId = `legacy_${username}`;
      const legacyUser = await prisma.user.findFirst({ where: { id: legacyId } });

      if (legacyUser) {
        await prisma.$transaction([
          prisma.user.create({ 
            data: { 
              id: discordId, 
              username: legacyUser.username, 
              avatarUrl: user.image 
            } 
          }),
          prisma.pick.update({ 
            where: { userId: legacyId }, 
            data: { userId: discordId } 
          }),
          prisma.user.delete({ where: { id: legacyId } })
        ]);
      } else {
        // Standard New User Setup
        await prisma.user.create({
          data: {
            id: discordId,
            username: (profile as any).username || "New User",
            avatarUrl: user.image,
            pick: { 
              create: { 
                symbol: "PENDING", 
                entryPrice: 0, 
                entryDate: new Date("2026-01-16T16:00:00+05:30") 
              } 
            }
          }
        });
      }
      return true;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };