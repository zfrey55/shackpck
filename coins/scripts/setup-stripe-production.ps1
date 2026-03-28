# PowerShell script to set up Stripe production integration
# This script uploads all Stripe environment variables to Netlify

Write-Host "=== Stripe Production Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if Netlify CLI is installed
try {
    $netlifyVersion = netlify --version 2>&1
    Write-Host "✅ Netlify CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Netlify CLI not found" -ForegroundColor Red
    Write-Host "Installing Netlify CLI..." -ForegroundColor Yellow
    npm install -g netlify-cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Netlify CLI" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Netlify CLI installed" -ForegroundColor Green
}

# Check if logged in
Write-Host "Checking Netlify login status..." -ForegroundColor Cyan
$status = netlify status 2>&1
if ($status -match "Not logged in" -or $status -match "You are not logged in") {
    Write-Host "⚠️  Not logged in to Netlify" -ForegroundColor Yellow
    Write-Host "Opening Netlify login..." -ForegroundColor Cyan
    netlify login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to login to Netlify" -ForegroundColor Red
        exit 1
    }
}

# Check if site is linked
Write-Host "Checking if site is linked..." -ForegroundColor Cyan
$linkStatus = netlify status 2>&1
if ($linkStatus -match "No site linked" -or $linkStatus -match "No linked site") {
    Write-Host "⚠️  No site linked" -ForegroundColor Yellow
    Write-Host "Linking site..." -ForegroundColor Cyan
    netlify link
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to link site" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Site is linked" -ForegroundColor Green
Write-Host ""

# Stripe production values must come from your environment (never commit real keys).
# Example: set them in this PowerShell session, then run the script:
#   $env:NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_live_..."
#   $env:STRIPE_SECRET_KEY = "sk_live_..."
#   $env:STRIPE_WEBHOOK_SECRET = "whsec_..."
$stripeVars = @{
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" = $env:NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    "STRIPE_SECRET_KEY" = $env:STRIPE_SECRET_KEY
    "STRIPE_WEBHOOK_SECRET" = $env:STRIPE_WEBHOOK_SECRET
}
foreach ($key in @("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET")) {
    if ([string]::IsNullOrWhiteSpace($stripeVars[$key])) {
        Write-Host "Missing environment variable: $key" -ForegroundColor Red
        Write-Host "Set it in this session (see comments above) or use Netlify/Stripe Dashboard manually." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "=== Uploading Stripe Environment Variables ===" -ForegroundColor Green
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($key in $stripeVars.Keys) {
    $value = $stripeVars[$key]
    Write-Host "Setting: $key" -ForegroundColor Cyan
    
    try {
        $result = netlify env:set $key "$value" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Set successfully" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  ❌ Failed: $result" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "  ❌ Error: $_" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "=== Upload Summary ===" -ForegroundColor Cyan
Write-Host "✅ Successfully uploaded: $successCount" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "❌ Failed: $failCount" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Green
Write-Host ""
Write-Host "1. ✅ Stripe variables uploaded to Netlify" -ForegroundColor White
Write-Host ""
Write-Host "2. Verify webhook endpoint in Stripe Dashboard:" -ForegroundColor Yellow
Write-Host "   - Go to: https://dashboard.stripe.com/webhooks" -ForegroundColor White
Write-Host "   - Ensure endpoint is: https://yourdomain.com/api/webhooks/stripe" -ForegroundColor White
Write-Host "   - Verify signing secret matches STRIPE_WEBHOOK_SECRET in Netlify" -ForegroundColor White
Write-Host ""
Write-Host "3. Redeploy your site:" -ForegroundColor Yellow
Write-Host "   netlify deploy --prod" -ForegroundColor White
Write-Host "   OR" -ForegroundColor Gray
Write-Host "   Go to Netlify Dashboard → Deploys → Trigger deploy" -ForegroundColor White
Write-Host ""
Write-Host "4. Test the integration:" -ForegroundColor Yellow
Write-Host "   - Make a test purchase on your production site" -ForegroundColor White
Write-Host "   - Check Stripe Dashboard → Payments for the transaction" -ForegroundColor White
Write-Host "   - Check Stripe Dashboard → Webhooks for webhook delivery status" -ForegroundColor White
Write-Host ""
Write-Host "✅ Stripe production setup complete!" -ForegroundColor Green
Write-Host ""
