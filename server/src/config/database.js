import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

export const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' }
  ]
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma warning:', e);
});

prisma.$on('error', (e) => {
  logger.error('Prisma error:', e);
});

// ✅ Export all Prisma models individually
export const outlet = prisma.outlet;
export const journalist = prisma.journalist;
export const article = prisma.article;
export const topic = prisma.topic;
export const scrapeJob = prisma.scrapeJob;
