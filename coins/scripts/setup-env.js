// Script to create .env.local and .env files
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envLocalPath = path.join(__dirname, '..', '.env.local');
const envPath = path.join(__dirname, '..', '.env');

// Generate random NEXTAUTH_SECRET
const nextAuthSecret = crypto.randomBytes(32).toString('base64');

const envContent = `# Database Connection
# Replace [YOUR-PASSWORD] with your actual Supabase database password
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.jhbpldycyiamdtuguxys.supabase.co:5432/postgres?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${nextAuthSecret}"

# Stripe Configuration (Get from https://dashboard.stripe.com/test/apikeys)
# Use TEST keys for local development (they start with sk_test_ and pk_test_)
STRIPE_SECRET_KEY="sk_test_YOUR_STRIPE_SECRET_KEY"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_STRIPE_PUBLISHABLE_KEY"
STRIPE_WEBHOOK_SECRET=""

# FedEx API (Optional - can skip for local testing)
FEDEX_API_KEY=""
FEDEX_API_SECRET=""
FEDEX_ACCOUNT_NUMBER=""
FEDEX_METER_NUMBER=""
FEDEX_PRODUCTION="false"
FEDEX_SHIPPER_NAME="Shackpack"
FEDEX_SHIPPER_ADDRESS_LINE1="123 Main St"
FEDEX_SHIPPER_CITY="City"
FEDEX_SHIPPER_STATE="ST"
FEDEX_SHIPPER_POSTAL_CODE="12345"
FEDEX_SHIPPER_COUNTRY="US"
FEDEX_SHIPPER_PHONE="1234567890"
FEDEX_DEFAULT_WEIGHT="1"
FEDEX_DEFAULT_LENGTH="6"
FEDEX_DEFAULT_WIDTH="4"
FEDEX_DEFAULT_HEIGHT="2"

# Email Service (Optional - can skip for local testing)
EMAIL_SERVICE=""
EMAIL_API_ENDPOINT=""
EMAIL_API_KEY=""
ADMIN_EMAIL="admin@shackpack.com"

# Loyalty Points Configuration
LOYALTY_POINTS_PER_DOLLAR="1"
`;

try {
  // Create .env.local (for Next.js)
  fs.writeFileSync(envLocalPath, envContent);
  console.log('✅ Created .env.local file!');
  
  // Create .env (for Prisma CLI)
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file!');
  
  console.log('\n📝 Next steps:');
  console.log('   1. Open .env (or .env.local) and replace [YOUR-PASSWORD] with your Supabase password');
  console.log('   2. Add your Stripe test keys from https://dashboard.stripe.com/test/apikeys');
  console.log('   3. Run: npm run db:push');
  console.log('\n💡 Tip: Both .env and .env.local have the same content. Update both if you change the password.');
} catch (error) {
  console.error('❌ Error creating env files:', error.message);
  process.exit(1);
}
