// Script to verify database connection
const { PrismaClient } = require('@prisma/client');

// Prisma automatically loads .env, so we don't need dotenv
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...\n');
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      // Mask password in output
      const masked = dbUrl.replace(/:[^:@]+@/, ':****@');
      console.log('Connection string:', masked);
    } else {
      console.log('❌ DATABASE_URL not found in environment');
      process.exit(1);
    }
    
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query successful!');
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.error('\n💡 Possible issues:');
      console.error('   1. Password in .env file is incorrect');
      console.error('   2. Password still contains [YOUR-PASSWORD] placeholder');
      console.error('   3. Database password was reset in Supabase');
      console.error('   4. Connection string format might be wrong');
      console.error('\n📝 To fix:');
      console.error('   1. Go to Supabase Dashboard → Settings → Database');
      console.error('   2. Check or reset your database password');
      console.error('   3. Make sure DATABASE_URL in .env has the correct password (no brackets)');
      console.error('   4. Format should be: postgresql://postgres:YOUR_PASSWORD@host:5432/postgres?schema=public');
    }
    
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

testConnection();
