import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { prisma } from './db/client.js';

const server = app.listen(env.PORT, () => {
  logger.info(`StyleBazaar Backend API running at http://localhost:${env.PORT}`);
  logger.info(`Health check: http://localhost:${env.PORT}/api/health`);
  logger.info(`Config endpoint: http://localhost:${env.PORT}/api/config`);
  logger.info(`Environment: ${env.NODE_ENV}`);
  logger.info(`COD Only Launch: onlinePaymentsEnabled=${env.ONLINE_PAYMENTS_ENABLED}, authPhoneOtpEnabled=${env.AUTH_PHONE_OTP_ENABLED}`);
});

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await prisma.$disconnect();
      logger.info('Database connection closed.');
    } catch {
      // Disconnect error ignored during shutdown
    }
    process.exit(0);
  });

  // Force close after 10s if hanging
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
