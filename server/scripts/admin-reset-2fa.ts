#!/usr/bin/env tsx
import { prisma, isDbAvailable } from '../src/db/client.js';

async function main() {
  const args = process.argv.slice(2);
  const email = args[0]?.trim().toLowerCase();

  if (!email) {
    console.error('Usage: npm run admin:reset-2fa -- <admin-email>');
    console.error('Example: npm run admin:reset-2fa -- admin@stylebazaar.com');
    process.exit(1);
  }

  const dbActive = await isDbAvailable();
  if (!dbActive) {
    console.error('Error: Database is not accessible.');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`Error: User with email "${email}" was not found.`);
    process.exit(1);
  }

  // Break-glass reset: disable 2FA and clear secrets
  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
      failedLoginAttempts: 0,
      lockoutUntil: null,
    },
  });

  // Immediately revoke all active admin sessions for this user
  const revokedCount = await prisma.adminSession.updateMany({
    where: { userId: user.id },
    data: { isRevoked: true },
  });

  // Audit this break-glass incident
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'BREAKGLASS_CLI_RESET_2FA',
      entityType: 'USER',
      entityId: user.id,
      details: {
        email: user.email,
        reason: 'Break-glass CLI invocation by server operator',
        sessionsRevoked: revokedCount.count,
        timestamp: new Date().toISOString(),
      },
    },
  });

  console.log('====================================================');
  console.log('🚨 [BREAK-GLASS AUDIT] 2FA Reset Executed');
  console.log(`Target Email:      ${user.email}`);
  console.log(`User ID:           ${user.id}`);
  console.log(`Active Sessions:   ${revokedCount.count} revoked`);
  console.log(`Audit Record:      Recorded in audit_logs table`);
  console.log('Status:            2FA disabled. User must re-enroll upon login.');
  console.log('====================================================');
}

main()
  .catch((err) => {
    console.error('Fatal Break-Glass Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
