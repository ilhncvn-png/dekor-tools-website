import { PrismaClient } from '@prisma/client';

// Standard Next.js serverless-safe singleton: reuses one PrismaClient across
// hot reloads in dev, and across warm serverless invocations in production,
// instead of exhausting the DB connection pool by creating a new client per
// request. See https://pris.ly/d/help/next-js-best-practices
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
