// Script to create an admin user
// Run with: npx tsx scripts/create-admin.ts

import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  try {
    console.log('Creating admin user...\n');

    const email = await question('Email: ');
    const password = await question('Password: ');
    const name = await question('Name (optional): ');

    if (!email || !password) {
      console.error('Email and password are required');
      process.exit(1);
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.error('User with this email already exists');
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
    console.log(`User ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);

    process.exit(0);
  } catch (error: any) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createAdmin();
