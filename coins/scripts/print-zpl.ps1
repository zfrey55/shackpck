# PowerShell script to print ZPL file to Rollo X1040 printer
# Usage: .\print-zpl.ps1 -ZplFile "path\to\file.zpl" -PrinterName "Rollo X1040"

param(
    [Parameter(Mandatory=$true)]
    [string]$ZplFile,
    
    [Parameter(Mandatory=$false)]
    [string]$PrinterName = "Rollo X1040"
)

# Check if file exists
if (-not (Test-Path $ZplFile)) {
    Write-Host "ERROR: ZPL file not found: $ZplFile" -ForegroundColor Red
    exit 1
}

# Check if printer exists
$printer = Get-Printer -Name $PrinterName -ErrorAction SilentlyContinue
if (-not $printer) {
    Write-Host "ERROR: Printer '$PrinterName' not found." -ForegroundColor Red
    Write-Host "Available printers:" -ForegroundColor Yellow
    Get-Printer | Select-Object Name | Format-Table -AutoSize
    exit 1
}

Write-Host "Found printer: $($printer.Name)" -ForegroundColor Green
Write-Host "Port: $($printer.PortName)" -ForegroundColor Cyan

# Get printer port
$portName = $printer.PortName

# Method 1: Try to send directly to printer port (for USB printers)
if ($portName -like "USB*" -or $portName -like "COM*") {
    Write-Host "Attempting to send ZPL to port: $portName" -ForegroundColor Yellow
    
    try {
        # Read ZPL file content
        $zplContent = Get-Content $ZplFile -Raw -Encoding UTF8
        
        # Convert to bytes (ZPL uses ASCII)
        $bytes = [System.Text.Encoding]::ASCII.GetBytes($zplContent)
        
        # Try to open port and send data
        $port = New-Object System.IO.Ports.SerialPort($portName, 9600, None, 8, One)
        $port.Open()
        $port.Write($zplContent)
        $port.Close()
        
        Write-Host "SUCCESS: ZPL sent to printer via port $portName" -ForegroundColor Green
        exit 0
    } catch {
        Write-Host "Failed to send via port. Trying alternative method..." -ForegroundColor Yellow
    }
}

# Method 2: Use Windows print command with raw data
Write-Host "Attempting to print using Windows print command..." -ForegroundColor Yellow

try {
    # Use copy command to send raw data to printer
    $printerPath = "\\localhost\$PrinterName"
    
    # Check if printer share exists
    if (Test-Path $printerPath) {
        Copy-Item $ZplFile -Destination $printerPath -Force
        Write-Host "SUCCESS: ZPL sent to printer using copy command" -ForegroundColor Green
        exit 0
    } else {
        # Try alternative: Use net use or direct port access
        Write-Host "Trying alternative method..." -ForegroundColor Yellow
        
        # Use Out-Printer with raw mode (if supported)
        Get-Content $ZplFile -Raw | Out-Printer -Name $PrinterName -Raw
        Write-Host "SUCCESS: ZPL sent to printer" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "ERROR: Failed to print ZPL file" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative methods:" -ForegroundColor Yellow
    Write-Host "1. Install Rollo Print Software from https://www.rollo.com/pages/rollo-print-software"
    Write-Host "2. Use the printer's web interface (if available)"
    Write-Host "3. Check printer port settings in Control Panel > Devices and Printers"
    exit 1
}
