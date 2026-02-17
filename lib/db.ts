import { PrismaClient } from "@prisma/client";

const isLive = process.env.TESTONLIVE === "1";

// DATABASE_URL = Pooled Neon (Reads)
// DIRECT_URL = Direct Neon (Writes/Migrations)
// DATABASE_LOCAL = Local Postgres
const databaseUrl = isLive 
  ? process.env.DATABASE_URL 
  : process.env.DATABASE_LOCAL;

if (!databaseUrl) {
  throw new Error(`Missing ${isLive ? 'DATABASE_URL' : 'DATABASE_LOCAL'} in .env`);
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}