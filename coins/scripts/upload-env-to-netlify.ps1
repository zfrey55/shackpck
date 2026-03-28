# PowerShell script to upload environment variables to Netlify
# This script reads from env.production.template and sets variables in Netlify

param(
    [Parameter(Mandatory=$false)]
    [string]$SiteName = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false
)

Write-Host "=== Netlify Environment Variables Upload ===" -ForegroundColor Cyan
Write-Host ""

# Check if Netlify CLI is installed
try {
    $netlifyVersion = netlify --version 2>&1
    Write-Host "✅ Netlify CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Netlify CLI not found. Installing..." -ForegroundColor Yellow
    Write-Host "Run: npm install -g netlify-cli" -ForegroundColor Yellow
    Write-Host "Then run: netlify login" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
try {
    $whoami = netlify status 2>&1
    if ($whoami -match "Not logged in") {
        Write-Host "❌ Not logged in to Netlify" -ForegroundColor Red
        Write-Host "Run: netlify login" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Logged in to Netlify" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not verify login status" -ForegroundColor Yellow
}

# Read environment template
$templatePath = Join-Path $PSScriptRoot ".." "env.production.template"
if (-not (Test-Path $templatePath)) {
    Write-Host "❌ Template file not found: $templatePath" -ForegroundColor Red
    exit 1
}

Write-Host "Reading template file..." -ForegroundColor Cyan
$envContent = Get-Content $templatePath -Raw

# Parse environment variables (skip comments and empty lines)
$variables = @{}
$lines = $envContent -split "`n"
foreach ($line in $lines) {
    $line = $line.Trim()
    # Skip comments and empty lines
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $parts = $line -split "=", 2
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            # Skip TODO items
            if (-not $value.StartsWith("#") -and $value -ne "") {
                $variables[$key] = $value
            }
        }
    }
}

Write-Host "Found $($variables.Count) variables in template" -ForegroundColor Cyan
Write-Host ""

function Test-IsPlaceholderEnvValue([string]$val) {
    if ([string]::IsNullOrWhiteSpace($val)) { return $true }
    return $val -match "your_publishable_key_here|your_secret_key_here|your_webhook_signing_secret_here"
}

# Link site if needed
if ($SiteName) {
    Write-Host "Linking to site: $SiteName" -ForegroundColor Cyan
    if (-not $DryRun) {
        netlify link --name $SiteName 2>&1 | Out-Null
    }
} else {
    Write-Host "Checking if site is linked..." -ForegroundColor Cyan
    $linkStatus = netlify status 2>&1
    if ($linkStatus -match "No site linked") {
        Write-Host "⚠️  No site linked. Run: netlify link" -ForegroundColor Yellow
        Write-Host "Or provide site name with: -SiteName 'your-site-name'" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Uploading variables from template ===" -ForegroundColor Green
Write-Host ""

$uploaded = 0
$skipped = 0
foreach ($key in $variables.Keys) {
    $value = $variables[$key]
    if (Test-IsPlaceholderEnvValue $value) {
        Write-Host "Skipping (placeholder): $key" -ForegroundColor Yellow
        $skipped++
        continue
    }
    Write-Host "Setting: $key" -ForegroundColor Cyan
    if ($DryRun) {
        Write-Host "  [DRY RUN] Would set: $key" -ForegroundColor Yellow
    } else {
        try {
            netlify env:set $key "$value" 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Set successfully" -ForegroundColor Green
                $uploaded++
            } else {
                Write-Host "  ❌ netlify env:set failed (exit $LASTEXITCODE)" -ForegroundColor Red
            }
        } catch {
            Write-Host "  ❌ Failed to set: $_" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Uploaded: $uploaded  Skipped placeholders: $skipped" -ForegroundColor White
Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Green
Write-Host "1. Replace placeholders in env.production.template (or set vars in Netlify UI), then re-run if needed" -ForegroundColor White
Write-Host "2. Add other required variables (DATABASE_URL, NEXTAUTH_SECRET, etc.)" -ForegroundColor White
Write-Host "3. Redeploy your site: netlify deploy --prod" -ForegroundColor White
Write-Host "4. Verify webhook endpoint is configured in Stripe Dashboard" -ForegroundColor White
Write-Host ""
