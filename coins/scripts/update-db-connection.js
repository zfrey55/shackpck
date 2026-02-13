// Script to update database connection string in .env and .env.local
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envLocalPath = path.join(__dirname, '..', '.env.local');

// Password: GoGators2025!
// URL-encoded: GoGators2025%21 (! becomes %21)
const password = 'GoGators2025%21';
const connectionString = `postgresql://postgres:${password}@db.jhbpldycyiamdtuguxys.supabase.co:5432/postgres?schema=public`;

function updateEnvFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update DATABASE_URL
    const dbUrlRegex = /DATABASE_URL="[^"]*"/;
    if (dbUrlRegex.test(content)) {
      content = content.replace(dbUrlRegex, `DATABASE_URL="${connectionString}"`);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated ${path.basename(filePath)}`);
      return true;
    } else {
      // Add DATABASE_URL if it doesn't exist
      content += `\nDATABASE_URL="${connectionString}"\n`;
      fs.writeFileSync(filePath, content);
      console.log(`✅ Added DATABASE_URL to ${path.basename(filePath)}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error updating ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

console.log('Updating database connection string...\n');
updateEnvFile(envPath);
updateEnvFile(envLocalPath);
console.log('\n✅ Database connection string updated!');
console.log('\n📝 Next: Restart the dev server for changes to take effect.');
