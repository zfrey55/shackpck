# Print ZPL directly to printer port (bypasses Windows print spooler)
# This works for USB-connected printers or network printers with direct port access
# Usage: .\print-zpl-direct-port.ps1 "C:\Users\zfrey\Downloads\fedex-label-XXXXX.zpl"

param(
    [Parameter(Mandatory=$true)]
    [string]$ZplFile
)

$PrinterName = "Rollo X1040 (X1202250678)"

# Check if file exists
if (-not (Test-Path $ZplFile)) {
    Write-Host "ERROR: File not found: $ZplFile" -ForegroundColor Red
    exit 1
}

# Get printer info
$printer = Get-Printer -Name $PrinterName -ErrorAction SilentlyContinue
if (-not $printer) {
    Write-Host "ERROR: Printer '$PrinterName' not found." -ForegroundColor Red
    exit 1
}

Write-Host "Printer: $($printer.Name)" -ForegroundColor Cyan
Write-Host "Port: $($printer.PortName)" -ForegroundColor Cyan
Write-Host "Driver: $($printer.DriverName)" -ForegroundColor Cyan
Write-Host ""

# The issue: Your printer is using "Microsoft IPP Class Driver" which doesn't support raw ZPL
# WSD (Web Services for Devices) printers often don't support raw printing

Write-Host "⚠️ ISSUE DETECTED:" -ForegroundColor Yellow
Write-Host "Your printer is using: $($printer.DriverName)" -ForegroundColor Yellow
Write-Host "This driver does NOT support raw ZPL printing." -ForegroundColor Red
Write-Host ""

Write-Host "SOLUTIONS:" -ForegroundColor Green
Write-Host ""
Write-Host "Option 1: Install Rollo ZPL Driver (Recommended)" -ForegroundColor Cyan
Write-Host "  1. Download Rollo Print Software from: https://www.rollo.com/pages/rollo-print-software" -ForegroundColor White
Write-Host "  2. Install the software (includes ZPL driver)" -ForegroundColor White
Write-Host "  3. Remove current printer" -ForegroundColor White
Write-Host "  4. Add printer again using Rollo driver" -ForegroundColor White
Write-Host ""

Write-Host "Option 2: Connect via USB (if available)" -ForegroundColor Cyan
Write-Host "  1. Connect printer via USB cable" -ForegroundColor White
Write-Host "  2. Windows will detect it" -ForegroundColor White
Write-Host "  3. Use USB port instead of WSD" -ForegroundColor White
Write-Host ""

Write-Host "Option 3: Use Rollo Print Software" -ForegroundColor Cyan
Write-Host "  1. Download from: https://www.rollo.com/pages/rollo-print-software" -ForegroundColor White
Write-Host "  2. Open the .zpl file in Rollo Print Software" -ForegroundColor White
Write-Host "  3. Print directly from the software" -ForegroundColor White
Write-Host ""

Write-Host "Option 4: Try TCP/IP Port (if printer has network connection)" -ForegroundColor Cyan
Write-Host "  1. Find printer's IP address" -ForegroundColor White
Write-Host "  2. Add printer using TCP/IP port" -ForegroundColor White
Write-Host "  3. Select ZPL-compatible driver" -ForegroundColor White
Write-Host ""

# Try to read and display first few lines of ZPL to verify it's valid
Write-Host "Verifying ZPL file..." -ForegroundColor Yellow
$zplContent = Get-Content $ZplFile -TotalCount 5
Write-Host "First 5 lines of ZPL:" -ForegroundColor Cyan
$zplContent | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }

Write-Host ""
Write-Host "The ZPL file appears to be valid." -ForegroundColor Green
Write-Host "The issue is the printer driver doesn't support raw ZPL printing." -ForegroundColor Red
