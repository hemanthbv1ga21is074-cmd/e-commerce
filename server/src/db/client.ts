import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

let dbChecked = false;
let dbAvailable = false;

import net from 'net';

export async function isDbAvailable(): Promise<boolean> {
  if (dbChecked) return dbAvailable;

  const url = process.env.DATABASE_URL || '';
  const match = url.match(/@([^:/]+):?(\d+)?/);
  const host = match ? match[1] : 'localhost';
  const port = match && match[2] ? parseInt(match[2], 10) : 5432;

  dbAvailable = await new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ host, port, timeout: 200 });
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
  });

  dbChecked = true;
  if (dbAvailable) {
    logger.info('PostgreSQL server detected. Using Prisma client.');
  } else {
    logger.info('PostgreSQL not detected. Running with in-memory service layer fallback.');
  }
  return dbAvailable;
}

export function setDbAvailable(val: boolean) {
  dbAvailable = val;
  dbChecked = true;
}

export async function connectDb(): Promise<boolean> {
  return isDbAvailable();
}
