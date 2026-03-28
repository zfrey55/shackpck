@echo off
REM Simple batch file to print ZPL to Rollo X1040
REM Usage: print-zpl-simple.bat "path\to\file.zpl"

if "%1"=="" (
    echo ERROR: Please provide the path to the ZPL file
    echo Usage: print-zpl-simple.bat "path\to\file.zpl"
    exit /b 1
)

set ZPL_FILE=%1
set PRINTER_NAME=Rollo X1040 (X1202250678)

echo Printing ZPL file to %PRINTER_NAME%...
echo File: %ZPL_FILE%

REM Method 1: Try copy command (works if printer is shared)
copy /b "%ZPL_FILE%" "\\localhost\%PRINTER_NAME%" 2>nul
if %errorlevel%==0 (
    echo SUCCESS: ZPL sent to printer
    exit /b 0
)

REM Method 2: Try using PowerShell
powershell -Command "Get-Content '%ZPL_FILE%' -Raw | Out-Printer -Name '%PRINTER_NAME%' -Raw" 2>nul
if %errorlevel%==0 (
    echo SUCCESS: ZPL sent to printer via PowerShell
    exit /b 0
)

echo ERROR: Could not print ZPL file
echo.
echo Please try:
echo 1. Install Rollo Print Software
echo 2. Check that printer name is correct: %PRINTER_NAME%
echo 3. Run: wmic printer get name
echo    to see available printers
exit /b 1
