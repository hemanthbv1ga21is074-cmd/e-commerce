#!/usr/bin/env tsx
import argon2 from 'argon2';
import { prisma, isDbAvailable } from '../src/db/client.js';

function parseArg(flag: string): string | null {
  const args = process.argv.slice(2);
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1];
  }
  return null;
}

async function main() {
  const email = parseArg('--email')?.trim().toLowerCase() || process.env.ADMIN_EMAIL || 'admin@stylebazaar.com';
  const name = parseArg('--name')?.trim() || 'System Super Administrator';
  const password = parseArg('--password') || 'AdminSuperSecure123!';

  console.log(`Setting up SUPER_ADMIN for email: ${email}...`);

  const dbActive = await isDbAvailable();
  if (!dbActive) {
    console.error('Error: Database is not accessible.');
    process.exit(1);
  }

  const passwordHash = await argon2.hash(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'SUPER_ADMIN',
      isActive: true,
      isEmailVerified: true,
      passwordHash,
      failedLoginAttempts: 0,
      lockoutUntil: null,
    },
    create: {
      email,
      name,
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
      isEmailVerified: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'BREAKGLASS_CLI_CREATE_SUPER_ADMIN',
      entityType: 'USER',
      entityId: user.id,
      details: {
        email: user.email,
        role: 'SUPER_ADMIN',
        timestamp: new Date().toISOString(),
      },
    },
  });

  console.log('====================================================');
  console.log('🛡️ [BREAK-GLASS AUDIT] Super Administrator Provisioned');
  console.log(`Email:       ${user.email}`);
  console.log(`Name:        ${user.name}`);
  console.log(`Role:        ${user.role}`);
  console.log(`Password:    ${password}`);
  console.log(`User ID:     ${user.id}`);
  console.log(`Audit Log:   Logged into database`);
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
