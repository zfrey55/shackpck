// Script to test the series API endpoint
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing /api/series endpoint...\n');
    
    const response = await fetch('http://localhost:3000/api/series?active=true');
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.error('\n❌ API Error:', data.error);
      console.log('\n💡 This likely means the database connection is failing.');
      console.log('   The API routes need the DATABASE_URL to work correctly.');
    } else if (Array.isArray(data)) {
      console.log(`\n✅ Found ${data.length} series`);
      if (data.length === 0) {
        console.log('⚠️  No series found. Make sure you ran the seed-data.sql script.');
      } else {
        console.log('\nSeries:');
        data.forEach(s => {
          console.log(`  - ${s.name} (${s.packsRemaining} packs remaining)`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.log('\n💡 Make sure the dev server is running: npm run dev');
  }
}

testAPI();
