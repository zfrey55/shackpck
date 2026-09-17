// Guard: every table in schema public must have row level security enabled.
// Run with: DATABASE_URL=... npx tsx scripts/check-rls.ts
//
// Supabase grants the anon and authenticated roles full privileges on every new
// public table, so a table created by `prisma db push` is exposed through the
// Data API until RLS is enabled on it. The site itself connects as a role that
// bypasses RLS, so enabling it (with no policies) does not affect the app.
//
// Exit codes: 0 all tables have RLS on, 1 at least one table has RLS off,
// 2 DATABASE_URL missing or the query failed.
//
// DATABASE_URL is read from the environment ONLY and is never printed. The
// Prisma client is imported after that check and given the URL explicitly, so
// it cannot fall back to a local .env file.

export {};

async function main(): Promise<number> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error('check-rls: DATABASE_URL is not set in the environment.');
    return 2;
  }

  let target = 'remote';
  try {
    const host = new URL(url).hostname;
    if (host === 'localhost' || host === '127.0.0.1') target = 'local';
  } catch {
    console.error('check-rls: DATABASE_URL is not a valid URL.');
    return 2;
  }

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient({ datasources: { db: { url } }, log: [] });
  try {
    const tables = await prisma.$queryRaw<{ table: string; rls: boolean }[]>`
      SELECT c.relname::text AS "table", c.relrowsecurity AS rls
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
      ORDER BY c.relname`;
    const off = tables.filter((t) => !t.rls).map((t) => t.table);

    console.log(`check-rls: ${tables.length} public table(s) on the ${target} database.`);
    if (off.length > 0) {
      console.log(`check-rls: RLS is OFF on ${off.length} table(s):`);
      for (const t of off) console.log(`  - ${t}`);
      console.log(`check-rls: fix with ALTER TABLE "<table>" ENABLE ROW LEVEL SECURITY; for each.`);
      return 1;
    }
    console.log('check-rls: RLS is ON for every public table.');
    return 0;
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? ` ${String((err as { code?: unknown }).code)}` : '';
    console.error(`check-rls: query failed (${(err as Error)?.constructor?.name ?? 'Error'}${code}).`);
    return 2;
  } finally {
    await prisma.$disconnect();
  }
}

main().then((code) => process.exit(code));
