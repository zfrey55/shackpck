// One-time: normalize every User.email to lower(trim(email)).
// Run with: DATABASE_URL=... npx tsx scripts/lowercase-emails.ts [--dry-run]
//
// Reads DATABASE_URL from the environment ONLY and never prints it, nor any
// email address: output is counts only. The Prisma client is imported after the
// env check and given the URL explicitly, so it cannot fall back to a .env file.
//
// Stops without writing if two users would collide on lower(trim(email)),
// checked before and again inside the transaction. The update runs in one
// transaction and is verified before commit.
//
// Exit codes: 0 done (or dry run), 1 collisions found / verification failed,
// 2 DATABASE_URL missing or a query failed.

export {};

type Counts = { users: number; notNormalized: number; collisionGroups: number; usersInCollisions: number };

async function main(): Promise<number> {
  const dryRun = process.argv.includes('--dry-run');
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error('lowercase-emails: DATABASE_URL is not set in the environment.');
    return 2;
  }
  let target = 'remote';
  try {
    const host = new URL(url).hostname;
    if (host === 'localhost' || host === '127.0.0.1') target = 'local';
  } catch {
    console.error('lowercase-emails: DATABASE_URL is not a valid URL.');
    return 2;
  }

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient({ datasources: { db: { url } }, log: [] });

  type Db = Pick<typeof prisma, '$queryRaw'>;
  const counts = async (db: Db): Promise<Counts> => {
    const [u] = await db.$queryRaw<{ users: number; not_normalized: number }[]>`
      SELECT count(*)::int AS users, count(*) FILTER (WHERE email <> lower(trim(email)))::int AS not_normalized FROM "User"`;
    const [c] = await db.$queryRaw<{ groups: number; users: number }[]>`
      SELECT count(*)::int AS groups, coalesce(sum(n), 0)::int AS users
      FROM (SELECT lower(trim(email)) AS k, count(*) AS n FROM "User" GROUP BY 1 HAVING count(*) > 1) g`;
    return { users: u.users, notNormalized: u.not_normalized, collisionGroups: c.groups, usersInCollisions: c.users };
  };
  const show = (label: string, c: Counts) =>
    console.log(
      `lowercase-emails: ${label}: users=${c.users} to_update=${c.notNormalized} collision_groups=${c.collisionGroups} users_in_collisions=${c.usersInCollisions}`
    );

  try {
    console.log(`lowercase-emails: ${dryRun ? 'DRY RUN on' : 'running on'} the ${target} database.`);
    const before = await counts(prisma);
    show('before', before);
    if (before.collisionGroups > 0) {
      console.error('lowercase-emails: STOP. Normalizing would collide; nothing written.');
      return 1;
    }
    if (dryRun) {
      console.log('lowercase-emails: dry run, nothing written.');
      return 0;
    }
    if (before.notNormalized === 0) {
      console.log('lowercase-emails: nothing to update.');
      return 0;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const inside = await counts(tx);
      if (inside.collisionGroups > 0) throw new Error('collision appeared inside the transaction');
      const n = await tx.$executeRaw`UPDATE "User" SET email = lower(trim(email)) WHERE email <> lower(trim(email))`;
      const after = await counts(tx);
      if (after.notNormalized !== 0 || after.users !== inside.users || n !== inside.notNormalized) {
        throw new Error('verification failed inside the transaction');
      }
      return n;
    });
    console.log(`lowercase-emails: committed, updated=${updated}`);
    show('after', await counts(prisma));
    return 0;
  } catch (err) {
    const e = err as { constructor?: { name?: string }; code?: unknown; message?: string };
    const known = /collision appeared|verification failed/.test(e?.message ?? '') ? `: ${e.message}` : '';
    console.error(`lowercase-emails: failed, rolled back (${e?.constructor?.name ?? 'Error'}${e?.code ? ` ${String(e.code)}` : ''})${known}.`);
    return known ? 1 : 2;
  } finally {
    await prisma.$disconnect();
  }
}

main().then((code) => process.exit(code));
