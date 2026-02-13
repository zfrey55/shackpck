// Non-interactive script to create admin user
// Usage: npx tsx scripts/create-admin-auto.ts <email> <password> [name]

import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || null;

  if (!email || !password) {
    console.error('Usage: npx tsx scripts/create-admin-auto.ts <email> <password> [name]');
    console.error('Example: npx tsx scripts/create-admin-auto.ts admin@test.com password123 Admin');
    process.exit(1);
  }

  try {
    console.log('Creating admin user...\n');

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.error(`❌ User with email ${email} already exists`);
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        role: 'ADMIN',
        isShadowUser: false,
      },
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log('\n🎉 You can now sign in at http://localhost:3000/auth/signin');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdmin();
