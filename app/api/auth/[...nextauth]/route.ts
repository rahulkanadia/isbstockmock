import NextAuth, { NextAuthOptions, Session, DefaultSession } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaClient } from "@prisma/client";

// Extend Session type to include custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      username: string;
    } & DefaultSession["user"];
  }
}

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      if (!user.id || !profile) return false;

      // @ts-ignore - Discord profile has username
      const discordUsername = (profile.username as string).toLowerCase();
      const discordId = user.id;
      const avatarUrl = user.image;

      // 1. Check if this User ID already exists in our DB
      const existingUser = await prisma.user.findUnique({
        where: { id: discordId },
        include: { pick: true },
      });

      // 2. If User exists and has a pick, we are good.
      if (existingUser && existingUser.pick) {
        return true;
      }

      // 3. THE MERGE LOGIC
      // If user doesn't exist OR exists but has no pick...
      // Search for a 'legacy' user matching the username
      const legacyId = `legacy_${discordUsername}`;
      
      const legacyUser = await prisma.user.findUnique({
        where: { id: legacyId },
        include: { pick: true },
      });

      if (legacyUser && legacyUser.pick) {
        console.log(`Found Legacy User: ${legacyId}. Merging to ${discordId}...`);
        
        // Transaction to move data safely
        await prisma.$transaction(async (tx) => {
          // A. Delete the legacy pick (so we can recreate it attached to new ID)
          // We can't just 'update' the userId because it's a relation key, 
          // usually easier to create new and delete old to avoid constraints.
          
          // Actually, update is cleaner if foreign keys allow. 
          // Let's try updating the Pick to point to the new User ID.
          // First, ensure the new User record exists.
          
          if (!existingUser) {
             await tx.user.create({
                data: {
                  id: discordId,
                  username: profile.name || discordUsername,
                  avatarUrl: avatarUrl,
                }
             });
          }

          // Move the pick
          await tx.pick.update({
            where: { userId: legacyId },
            data: { userId: discordId }
          });

          // Delete the old legacy user placeholder
          await tx.user.delete({
            where: { id: legacyId }
          });
        });
        
        return true;
      }

      // 4. If no legacy user found, create a new basic user (viewer only)
      if (!existingUser) {
        await prisma.user.create({
          data: {
            id: discordId,
            username: profile.name || discordUsername,
            avatarUrl: avatarUrl,
          },
        });
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.username = session.user.name || "";
        
        // Admin Check
        const adminIds = (process.env.ADMIN_IDS || "").split(",");
        session.user.isAdmin = adminIds.includes(token.sub);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };