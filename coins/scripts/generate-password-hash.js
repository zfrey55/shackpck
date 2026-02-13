// Script to generate bcrypt password hash
// Usage: node scripts/generate-password-hash.js <password>

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/generate-password-hash.js <password>');
  console.error('Example: node scripts/generate-password-hash.js password123');
  process.exit(1);
}

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('\n✅ Password hash generated:');
    console.log(hash);
    console.log('\n📝 Use this hash in the SQL script to create your admin user.');
    console.log('   Or use the create-admin-auto.ts script once database connection is fixed.\n');
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
