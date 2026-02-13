// Script to update Stripe keys in .env and .env.local
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envLocalPath = path.join(__dirname, '..', '.env.local');

const publishableKey = 'pk_test_your_publishable_key_here';
const secretKey = 'sk_test_your_secret_key_here';

function updateEnvFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update publishable key
    content = content.replace(
      /NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="[^"]*"/,
      `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="${publishableKey}"`
    );
    
    // Update secret key
    content = content.replace(
      /STRIPE_SECRET_KEY="[^"]*"/,
      `STRIPE_SECRET_KEY="${secretKey}"`
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

console.log('Updating Stripe keys...\n');
updateEnvFile(envPath);
updateEnvFile(envLocalPath);
console.log('\n✅ Stripe keys updated in both .env and .env.local files!');
