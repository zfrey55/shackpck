# Quick print script for Rollo X1040 (X1202250678)
# Usage: .\print-zpl-rollo.ps1 "C:\Users\zfrey\Downloads\fedex-label-XXXXX.zpl"

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

# Check if printer exists
$printer = Get-Printer -Name $PrinterName -ErrorAction SilentlyContinue
if (-not $printer) {
    Write-Host "ERROR: Printer '$PrinterName' not found." -ForegroundColor Red
    Write-Host "Available printers:" -ForegroundColor Yellow
    Get-Printer | Select-Object Name | Format-Table -AutoSize
    exit 1
}

Write-Host "Printing ZPL file to $PrinterName..." -ForegroundColor Green
Write-Host "File: $ZplFile" -ForegroundColor Cyan

try {
    # Method 1: Try Out-Printer with raw data
    Get-Content $ZplFile -Raw -Encoding ASCII | Out-Printer -Name $PrinterName
    Write-Host "SUCCESS: ZPL sent to printer!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to print" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
