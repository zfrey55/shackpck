# PowerShell script to set up .env.local for testing
# This script adds all required environment variables for testing

$envFile = Join-Path $PSScriptRoot ".." ".env.local"
$envContent = @"

# ============================================
# FEATURE FLAGS - ENABLE FOR TESTING
# ============================================
NEXT_PUBLIC_ENABLE_CHECKOUT=true
NEXT_PUBLIC_ENABLE_ACCOUNTS=true
NEXT_PUBLIC_ENABLE_DIRECT_PURCHASE=true

# ============================================
# DATABASE
# ============================================
# DATABASE_URL=postgresql://user:password@host:port/database?schema=public

# ============================================
# NEXTAUTH (Authentication)
# ============================================
NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# ============================================
# STRIPE TEST KEYS
# ============================================
# Get from: https://dashboard.stripe.com/test/apikeys
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET= (optional for testing)

# ============================================
# SENDGRID (Email)
# ============================================
# SENDGRID_API_KEY=SG.your_api_key_here
FROM_EMAIL=noreply@shackpck.com
FROM_NAME=Shackpack
# ADMIN_EMAIL=your_admin_email@example.com

# ============================================
# FEDEX TEST CREDENTIALS
# ============================================
# Get from: https://developer.fedex.com/
# FEDEX_API_KEY=your_test_api_key
# FEDEX_API_SECRET=your_test_secret
FEDEX_ACCOUNT_NUMBER=740561073
# FEDEX_METER_NUMBER= (optional for test environment)
FEDEX_ENVIRONMENT=test

# Shipper Information (Your Business)
FEDEX_SHIPPER_NAME=Shackpack
FEDEX_SHIPPER_PHONE=5618704222
FEDEX_SHIPPER_ADDRESS_LINE1=345 W Palmetto Park Rd
FEDEX_SHIPPER_CITY=Boca Raton
FEDEX_SHIPPER_STATE=FL
FEDEX_SHIPPER_POSTAL_CODE=33432
FEDEX_SHIPPER_COUNTRY=US

# Package Defaults
FEDEX_DEFAULT_WEIGHT=1
FEDEX_DEFAULT_LENGTH=6
FEDEX_DEFAULT_WIDTH=4
FEDEX_DEFAULT_HEIGHT=2

# ============================================
# INVENTORY APP API
# ============================================
COIN_INVENTORY_API_BASE_URL=https://us-central1-coin-inventory-8b79d.cloudfunctions.net

# ============================================
# CONTACT INFORMATION
# ============================================
NEXT_PUBLIC_CONTACT_EMAIL=info@shackpck.com
NEXT_PUBLIC_CONTACT_PHONE=(561) 870-4222
"@

# Check if file exists
if (Test-Path $envFile) {
    Write-Host "`.env.local already exists. Reading existing file..."
    $existing = Get-Content $envFile -Raw
    
    # Check what's missing and add it
    $linesToAdd = @()
    
    if ($existing -notmatch "NEXT_PUBLIC_ENABLE_CHECKOUT") {
        $linesToAdd += "NEXT_PUBLIC_ENABLE_CHECKOUT=true"
    }
    if ($existing -notmatch "NEXT_PUBLIC_ENABLE_ACCOUNTS") {
        $linesToAdd += "NEXT_PUBLIC_ENABLE_ACCOUNTS=true"
    }
    if ($existing -notmatch "NEXT_PUBLIC_ENABLE_DIRECT_PURCHASE") {
        $linesToAdd += "NEXT_PUBLIC_ENABLE_DIRECT_PURCHASE=true"
    }
    if ($existing -notmatch "FROM_EMAIL=noreply@shackpck.com") {
        $linesToAdd += "FROM_EMAIL=noreply@shackpck.com"
    }
    if ($existing -notmatch "FROM_NAME=Shackpack") {
        $linesToAdd += "FROM_NAME=Shackpack"
    }
    if ($existing -notmatch "FEDEX_ENVIRONMENT=test") {
        $linesToAdd += "FEDEX_ENVIRONMENT=test"
    }
    if ($existing -notmatch "FEDEX_ACCOUNT_NUMBER=740561073") {
        $linesToAdd += "FEDEX_ACCOUNT_NUMBER=740561073"
    }
    
    if ($linesToAdd.Count -gt 0) {
        Write-Host "Adding missing variables..."
        Add-Content $envFile "`n# Added by setup script`n"
        $linesToAdd | ForEach-Object { Add-Content $envFile $_ }
        Write-Host "Added $($linesToAdd.Count) missing variables"
    } else {
        Write-Host "All required variables appear to be present"
    }
} else {
    Write-Host "Creating new .env.local file..."
    Set-Content $envFile $envContent
    Write-Host ".env.local created with all required variables"
}

Write-Host "`nNext steps:"
Write-Host "1. Open coins/.env.local and fill in any values marked with #"
Write-Host "2. Make sure DATABASE_URL, Stripe keys, SendGrid key, and FedEx credentials are set"
Write-Host "3. Run: npm run dev"
