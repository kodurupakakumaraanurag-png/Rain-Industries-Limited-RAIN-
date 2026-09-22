import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function getDatabaseUrl(): string {
  // If explicitly provided via environment variable and not empty
  const rawUrl = process.env.DATABASE_URL?.trim();
  if (rawUrl && rawUrl.length > 0 && !rawUrl.startsWith('file:./') && !rawUrl.startsWith('file:../')) {
    return rawUrl;
  }

  // Detect serverless execution environments (Vercel, AWS Lambda, etc.)
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.NOW_REGION
  );

  if (isServerless) {
    const tmpDbPath = path.join('/tmp', 'dev.db');

    // If /tmp/dev.db does not exist yet, copy it from project assets
    if (!fs.existsSync(tmpDbPath)) {
      const candidatePaths = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.resolve(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
        path.join(__dirname, '..', 'prisma', 'dev.db'),
        path.join('/var/task', 'prisma', 'dev.db'),
      ];

      for (const src of candidatePaths) {
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, tmpDbPath);
            break;
          } catch (err) {
            console.error('[Prisma] Failed to copy db to /tmp:', err);
          }
        }
      }
    }

    return `file:${tmpDbPath}`;
  }

  // Local development fallback
  const localDbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
  return `file:${localDbPath}`;
}

const resolvedDbUrl = getDatabaseUrl();
process.env.DATABASE_URL = resolvedDbUrl;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

