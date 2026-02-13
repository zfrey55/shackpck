// Helper script to show what connection string format you need
console.log(`
📋 Supabase Connection String Guide
====================================

To fix the API connection issue, you need the correct connection string from Supabase.

Steps:
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to: Settings → Database
4. Scroll to "Connection string" section
5. Select "URI" format
6. Copy the connection string
7. Replace [YOUR-PASSWORD] with your actual database password
8. Update DATABASE_URL in .env file

Common Formats:
---------------
Direct Connection (Port 5432):
postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres

Connection Pooler (Port 6543):
postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

Your Current Connection String:
-------------------------------
Check your .env file for DATABASE_URL

Make sure:
- Password has NO brackets []
- Password is URL-encoded if it has special characters
- Connection string includes ?schema=public at the end

After updating .env:
1. Restart dev server (stop and run: npm run dev)
2. Test: http://localhost:3000/api/series?active=true
`);
