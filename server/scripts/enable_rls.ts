import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
  },
});

async function main() {
  console.log('--- Enabling Row Level Security (RLS) on all public tables ---');
  
  const tables: Array<{ tablename: string }> = await prisma.$queryRawUnsafe(`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public';
  `);

  console.log(`Found ${tables.length} tables in public schema.`);

  for (const t of tables) {
    const name = t.tablename;
    if (name.startsWith('_')) continue;
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "public"."${name}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`✔ RLS enabled: ${name}`);
    } catch (err: any) {
      console.error(`Failed on ${name}:`, err.message);
    }
  }

  console.log('--- All tables secured with RLS! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
