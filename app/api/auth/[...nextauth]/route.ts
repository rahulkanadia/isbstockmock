import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import prisma from "@/app/lib/prisma";

// 1. Prepare Admin IDs for fast lookup
const envAdmins = (process.env.ADMIN_IDS || "").split(",");
const ADMIN_DISCORD_IDS = new Set<string>(envAdmins.map((id) => id.trim()));

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: 'identify' } },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider !== "discord") return true;

      const realId = account.providerAccountId;
      const discordUsername = profile.username || user.name;

      // 1. Check if Real User exists
      const existingRealUser = await prisma.user.findUnique({
        where: { id: realId },
        include: { picks: true }
      });

      // TRIGGER CONDITION: User is new OR User exists but has NO picks (empty account)
      if (!existingRealUser || existingRealUser.picks.length === 0) {
        
        // 2. Search for Legacy User (Case-Insensitive)
        const legacyUser = await prisma.user.findFirst({
          where: {
            username: { equals: discordUsername, mode: "insensitive" },
            id: { startsWith: "legacy_" }
          },
        });

        if (legacyUser) {
           console.log(`🔗 Linking Legacy ${legacyUser.id} -> Real ${realId}`);
           
           await prisma.$transaction(async (tx) => {
              // A. If Real User doesn't exist yet, Create them
              if (!existingRealUser) {
                  await tx.user.create({
                      data: {
                          id: realId,
                          username: discordUsername,
                          avatarUrl: user.image ?? null,
                      }
                  });
              }

              // B. Move Picks to Real ID
              await tx.pick.updateMany({
                  where: { userId: legacyUser.id },
                  data: { userId: realId }
              });

              // C. Move Monthly Changes
              await tx.monthlyChange.updateMany({
                where: { userId: legacyUser.id },
                data: { userId: realId }
              });

              // D. Delete Legacy User
              await tx.user.delete({
                  where: { id: legacyUser.id }
              });
           });
           
           return true;
        }
      }

      // 3. Standard Login (Upsert)
      await prisma.user.upsert({
        where: { id: realId },
        update: {
          username: discordUsername,
          avatarUrl: user.image ?? null,
        },
        create: {
          id: realId,
          username: discordUsername,
          avatarUrl: user.image ?? null,
        },
      });

      return true;
    },

    async session({ session, token }: any) {
      if (token.sub && session.user) {
        (session.user as any).id = token.sub;
        // INJECT ADMIN STATUS HERE
        (session.user as any).isAdmin = ADMIN_DISCORD_IDS.has(token.sub);
      }
      return session;
    },

    async jwt({ token, account, user }: any) {
      if (account?.providerAccountId) {
        token.sub = account.providerAccountId;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
