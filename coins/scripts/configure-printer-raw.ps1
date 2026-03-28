# Attempt to configure printer for raw printing
# This may not work with WSD printers, but worth trying

$PrinterName = "Rollo X1040 (X1202250678)"

Write-Host "Attempting to configure printer for raw printing..." -ForegroundColor Yellow
Write-Host ""

# Check current printer settings
$printer = Get-Printer -Name $PrinterName -ErrorAction SilentlyContinue
if (-not $printer) {
    Write-Host "ERROR: Printer not found" -ForegroundColor Red
    exit 1
}

Write-Host "Current settings:" -ForegroundColor Cyan
Write-Host "  Driver: $($printer.DriverName)" -ForegroundColor White
Write-Host "  Port: $($printer.PortName)" -ForegroundColor White
Write-Host ""

Write-Host "⚠️ WSD printers (Web Services for Devices) typically don't support raw printing." -ForegroundColor Yellow
Write-Host ""
Write-Host "RECOMMENDED SOLUTIONS:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Download Rollo Driver:" -ForegroundColor Cyan
Write-Host "   https://support.rollo.com/hc/en-us/articles/360057471134-Rollo-X1040-Driver-Download" -ForegroundColor White
Write-Host ""
Write-Host "2. Connect via USB (if available):" -ForegroundColor Cyan
Write-Host "   - Disconnect WSD connection" -ForegroundColor White
Write-Host "   - Connect USB cable" -ForegroundColor White
Write-Host "   - Add printer using USB port" -ForegroundColor White
Write-Host ""
Write-Host "3. Use printer's IP address (if on network):" -ForegroundColor Cyan
Write-Host "   - Find printer IP in printer settings" -ForegroundColor White
Write-Host "   - Add printer using TCP/IP port" -ForegroundColor White
Write-Host "   - Select ZPL-compatible driver" -ForegroundColor White
Write-Host ""

# Try to set printer to accept raw data (may not work with WSD)
try {
    # This requires admin privileges and may not work
    Write-Host "Attempting to configure printer properties..." -ForegroundColor Yellow
    
    # Note: Changing printer driver requires admin and may not be possible via PowerShell
    # User needs to do this manually through Windows Settings
    
    Write-Host ""
    Write-Host "To change the driver manually:" -ForegroundColor Cyan
    Write-Host "1. Open Settings → Devices → Printers & scanners" -ForegroundColor White
    Write-Host "2. Click on '$PrinterName'" -ForegroundColor White
    Write-Host "3. Click 'Manage' → 'Printer properties'" -ForegroundColor White
    Write-Host "4. Go to 'Advanced' tab" -ForegroundColor White
    Write-Host "5. Click 'New Driver' or 'Change Driver'" -ForegroundColor White
    Write-Host "6. Select 'Rollo X1040' driver if available" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "Could not configure automatically. Please configure manually." -ForegroundColor Red
}
