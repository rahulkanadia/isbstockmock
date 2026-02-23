import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  // Use Discord locally AND in production. No more empty arrays.
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      
      // Always fetch the real adminLevel from the database
      if (token.uid) {
         const dbUser = await prisma.user.findUnique({
           where: { id: token.uid as string },
           select: { adminLevel: true, username: true }
         });
         if (dbUser) {
           token.adminLevel = dbUser.adminLevel;
           token.username = dbUser.username;
         }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        session.user.id = token.uid as string;
        session.user.adminLevel = (token.adminLevel as number) || 0;
        session.user.username = (token.username as string) || session.user.name || "";
      }
      return session;
    },
    async signIn({ user, profile }) {
      if (!user.id || !profile) return false;
      
      const discordId = user.id;
      const username = ((profile as any).username || "").toLowerCase();

      const existingUser = await prisma.user.findUnique({ where: { id: discordId } });
      if (existingUser) return true;

      const legacyId = `legacy_${username}`;
      const legacyUser = await prisma.user.findFirst({ where: { id: legacyId } });

      // Reads your Discord ID from .env to make you a Superadmin
      const adminIds = (process.env.ADMIN_IDS || "").split(",");
      const isSuperAdmin = adminIds.includes(discordId);
      const defaultAdminLevel = isSuperAdmin ? 4 : 0;

      if (legacyUser) {
        await prisma.$transaction([
          prisma.user.create({ 
            data: { 
              id: discordId, 
              username: legacyUser.username, 
              avatarUrl: user.image,
              adminLevel: isSuperAdmin ? 4 : legacyUser.adminLevel,
              currentSeasonReturn: legacyUser.currentSeasonReturn,
              currentMonthlyReturn: legacyUser.currentMonthlyReturn
            } 
          }),
          prisma.pick.update({ 
            where: { userId: legacyId }, 
            data: { userId: discordId } 
          }),
          prisma.user.delete({ where: { id: legacyId } })
        ]);
      } else {
        await prisma.user.create({
          data: {
            id: discordId,
            username: (profile as any).username || "New User",
            avatarUrl: user.image,
            adminLevel: defaultAdminLevel, 
            pick: { 
              create: { 
                symbol: "PENDING", 
                entryPrice: 0, 
                entryDate: new Date() 
              } 
            }
          }
        });
      }
      return true;
    }
  }
};