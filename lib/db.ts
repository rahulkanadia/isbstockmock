import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  // Automatically routes localhost to your local postgres, and production to Neon
  const isLocal = process.env.NODE_ENV === 'development';
  const url = isLocal 
    ? (process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL) 
    : process.env.DATABASE_URL;

  return new PrismaClient({
    datasources: {
      db: { url }
    }
  });
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma