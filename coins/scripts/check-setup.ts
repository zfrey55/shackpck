// Script to check if setup is complete
// Run with: npx tsx scripts/check-setup.ts

import { prisma } from '../lib/db';

async function checkSetup() {
  const issues: string[] = [];
  const warnings: string[] = [];

  console.log('🔍 Checking setup...\n');

  // Check database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connection: OK');
  } catch (error: any) {
    issues.push('Database connection failed');
    console.log('❌ Database connection: FAILED');
    console.log(`   Error: ${error.message}`);
    console.log('   Make sure DATABASE_URL is set correctly in .env\n');
    return;
  }

  // Check environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ];

  console.log('\n📋 Checking environment variables:');
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: Set`);
    } else {
      issues.push(`Missing environment variable: ${envVar}`);
      console.log(`❌ ${envVar}: Missing`);
    }
  }

  // Check optional environment variables
  const optionalEnvVars = [
    'STRIPE_WEBHOOK_SECRET',
    'FEDEX_API_KEY',
    'EMAIL_SERVICE',
  ];

  console.log('\n📋 Optional environment variables:');
  for (const envVar of optionalEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: Set`);
    } else {
      warnings.push(`Optional variable not set: ${envVar}`);
      console.log(`⚠️  ${envVar}: Not set (optional)`);
    }
  }

  // Check database tables
  console.log('\n🗄️  Checking database tables:');
  try {
    const tables = [
      'User',
      'Series',
      'Order',
      'OrderItem',
      'SeriesPurchase',
      'Address',
    ];

    for (const table of tables) {
      try {
        // Try to query the table
        await (prisma as any)[table.toLowerCase()].findFirst();
        console.log(`✅ ${table}: Exists`);
      } catch (error: any) {
        if (error.message.includes('does not exist')) {
          issues.push(`Table ${table} does not exist`);
          console.log(`❌ ${table}: Missing`);
          console.log('   Run: npm run db:push');
        } else {
          console.log(`✅ ${table}: Exists`);
        }
      }
    }
  } catch (error: any) {
    console.log('⚠️  Could not verify all tables');
  }

  // Check for admin user
  console.log('\n👤 Checking for admin user:');
  try {
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (adminUser) {
      console.log(`✅ Admin user found: ${adminUser.email}`);
    } else {
      warnings.push('No admin user found');
      console.log('⚠️  No admin user found');
      console.log('   Run: npx tsx scripts/create-admin.ts');
    }
  } catch (error: any) {
    console.log('⚠️  Could not check for admin user');
  }

  // Check for test series
  console.log('\n📦 Checking for series:');
  try {
    const seriesCount = await prisma.series.count();
    if (seriesCount > 0) {
      console.log(`✅ Found ${seriesCount} series`);
    } else {
      warnings.push('No series found');
      console.log('⚠️  No series found');
      console.log('   Run: npx tsx scripts/seed-test-data.ts');
    }
  } catch (error: any) {
    console.log('⚠️  Could not check for series');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (issues.length === 0 && warnings.length === 0) {
    console.log('✨ Setup looks good! You\'re ready to go!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:3000');
  } else {
    if (issues.length > 0) {
      console.log('\n❌ Issues found:');
      issues.forEach((issue) => console.log(`   - ${issue}`));
    }
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach((warning) => console.log(`   - ${warning}`));
    }
  }
  console.log('='.repeat(50) + '\n');

  await prisma.$disconnect();
  process.exit(issues.length > 0 ? 1 : 0);
}

checkSetup();
