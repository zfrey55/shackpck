# Print ZPL file as RAW data to Rollo X1040
# This sends the ZPL commands directly to the printer without interpretation
# Usage: .\print-zpl-raw.ps1 "C:\Users\zfrey\Downloads\fedex-label-XXXXX.zpl"

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
    exit 1
}

Write-Host "Printing ZPL file as RAW data to $PrinterName..." -ForegroundColor Green
Write-Host "File: $ZplFile" -ForegroundColor Cyan

try {
    # Read ZPL file as raw bytes (ASCII encoding)
    $zplContent = Get-Content $ZplFile -Raw -Encoding ASCII
    
    # Convert to bytes
    $bytes = [System.Text.Encoding]::ASCII.GetBytes($zplContent)
    
    # Method 1: Try using Windows Print Spooler API with RAW data type
    Add-Type -TypeDefinition @"
        using System;
        using System.Runtime.InteropServices;
        using System.Text;
        
        public class RawPrinterHelper {
            [DllImport("winspool.drv", CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
            public static extern bool OpenPrinter([MarshalAs(UnmanagedType.LPStr)] string szPrinter, out IntPtr hPrinter, IntPtr pd);
            
            [DllImport("winspool.drv", CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
            public static extern bool ClosePrinter(IntPtr hPrinter);
            
            [DllImport("winspool.drv", CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
            public static extern bool StartDocPrinter(IntPtr hPrinter, int level, [In, MarshalAs(UnmanagedType.LPStruct)] DOCINFOA di);
            
            [DllImport("winspool.drv", CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
            public static extern bool EndDocPrinter(IntPtr hPrinter);
            
            [DllImport("winspool.drv", CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
            public static extern bool StartPagePrinter(IntPtr hPrinter);
            
            [DllImport("winspool.drv", CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
            public static extern bool EndPagePrinter(IntPtr hPrinter);
            
            [DllImport("winspool.drv", CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
            public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, int dwCount, out int dwWritten);
            
            [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
            public class DOCINFOA {
                public Int16 pDocName;
                public Int16 pOutputFile;
                public Int16 pDataType;
            }
        }
"@
    
    # Try to open printer
    $hPrinter = [IntPtr]::Zero
    $opened = [RawPrinterHelper]::OpenPrinter($PrinterName, [ref]$hPrinter, [IntPtr]::Zero)
    
    if ($opened) {
        try {
            # Create document info
            $di = New-Object RawPrinterHelper+DOCINFOA
            $di.pDocName = [Marshal]::StringToHGlobalAnsi("FedEx Label")
            $di.pOutputFile = [IntPtr]::Zero
            $di.pDataType = [Marshal]::StringToHGlobalAnsi("RAW")
            
            # Start document
            [RawPrinterHelper]::StartDocPrinter($hPrinter, 1, $di)
            [RawPrinterHelper]::StartPagePrinter($hPrinter)
            
            # Allocate unmanaged memory and copy bytes
            $pBytes = [Marshal]::AllocHGlobal($bytes.Length)
            [Marshal]::Copy($bytes, 0, $pBytes, $bytes.Length)
            
            # Write to printer
            $written = 0
            $success = [RawPrinterHelper]::WritePrinter($hPrinter, $pBytes, $bytes.Length, [ref]$written)
            
            # Cleanup
            [Marshal]::FreeHGlobal($pBytes)
            [Marshal]::FreeHGlobal($di.pDocName)
            [Marshal]::FreeHGlobal($di.pDataType)
            
            [RawPrinterHelper]::EndPagePrinter($hPrinter)
            [RawPrinterHelper]::EndDocPrinter($hPrinter)
            
            if ($success) {
                Write-Host "SUCCESS: ZPL sent as RAW data to printer!" -ForegroundColor Green
                exit 0
            } else {
                throw "WritePrinter failed"
            }
        } finally {
            [RawPrinterHelper]::ClosePrinter($hPrinter)
        }
    } else {
        throw "Failed to open printer"
    }
} catch {
    Write-Host "ERROR: Failed to print using RAW method" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    
    # Alternative: Use print command with RAW data type
    try {
        # Create a temporary print job using cmd
        $tempFile = [System.IO.Path]::GetTempFileName()
        Copy-Item $ZplFile $tempFile -Force
        
        # Use print command (this might not work for WSD printers)
        cmd /c "print /D:`"$PrinterName`" `"$tempFile`""
        
        Start-Sleep -Seconds 2
        Remove-Item $tempFile -ErrorAction SilentlyContinue
        
        Write-Host "Alternative method attempted. Check printer." -ForegroundColor Yellow
    } catch {
        Write-Host "All methods failed. You may need to:" -ForegroundColor Red
        Write-Host "1. Connect printer via USB instead of WSD" -ForegroundColor Yellow
        Write-Host "2. Use Rollo Print Software" -ForegroundColor Yellow
        Write-Host "3. Share the printer on the network" -ForegroundColor Yellow
        exit 1
    }
}
