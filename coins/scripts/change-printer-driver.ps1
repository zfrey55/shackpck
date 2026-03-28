# Change printer driver to Rollo Printer driver
# This requires admin privileges

$PrinterName = "Rollo X1040 (X1202250678)"
$NewDriverName = "Rollo Printer"

Write-Host "Changing printer driver to Rollo Printer..." -ForegroundColor Yellow

try {
    # Check if printer exists
    $printer = Get-Printer -Name $PrinterName -ErrorAction SilentlyContinue
    if (-not $printer) {
        Write-Host "ERROR: Printer '$PrinterName' not found." -ForegroundColor Red
        exit 1
    }

    Write-Host "Current driver: $($printer.DriverName)" -ForegroundColor Cyan
    
    # Check if Rollo driver exists
    $rolloDriver = Get-PrinterDriver -Name $NewDriverName -ErrorAction SilentlyContinue
    if (-not $rolloDriver) {
        Write-Host "ERROR: Rollo Printer driver not found." -ForegroundColor Red
        Write-Host "Available drivers:" -ForegroundColor Yellow
        Get-PrinterDriver | Select-Object Name | Format-Table -AutoSize
        exit 1
    }

    Write-Host "Rollo Printer driver found!" -ForegroundColor Green
    
    # Try to set the driver (requires admin)
    try {
        Set-Printer -Name $PrinterName -DriverName $NewDriverName -ErrorAction Stop
        Write-Host "SUCCESS: Printer driver changed to Rollo Printer!" -ForegroundColor Green
        
        # Verify
        $updated = Get-Printer -Name $PrinterName
        Write-Host "New driver: $($updated.DriverName)" -ForegroundColor Cyan
    } catch {
        Write-Host "ERROR: Could not change driver automatically." -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Write-Host ""
        Write-Host "Please change manually:" -ForegroundColor Yellow
        Write-Host "1. Open Settings → Devices → Printers & scanners" -ForegroundColor White
        Write-Host "2. Click on '$PrinterName'" -ForegroundColor White
        Write-Host "3. Click 'Manage' → 'Printer properties'" -ForegroundColor White
        Write-Host "4. Go to 'Advanced' tab" -ForegroundColor White
        Write-Host "5. Click 'New Driver' button" -ForegroundColor White
        Write-Host "6. Select 'Rollo Printer' from the list" -ForegroundColor White
        Write-Host "7. Click OK" -ForegroundColor White
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
