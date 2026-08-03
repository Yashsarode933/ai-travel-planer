import { PrismaClient } from '@/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

declare global {
  // eslint-disable-next-line no-undef
  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaBetterSqlite3(process.env.DATABASE_URL!);

export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;