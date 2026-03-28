import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

// POST /api/print-zpl - Print ZPL file directly to printer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zplData, printerName } = body;

    if (!zplData) {
      return NextResponse.json(
        { error: 'ZPL data is required' },
        { status: 400 }
      );
    }

    // Decode base64 ZPL data
    const zplText = Buffer.from(zplData, 'base64').toString('utf-8');

    // Get printer name (default to common Zebra printer names)
    const printer = printerName || await getDefaultZebraPrinter();

    if (!printer) {
      return NextResponse.json(
        { 
          error: 'No Zebra printer found',
          instructions: [
            '1. Make sure your Zebra printer is connected and turned on',
            '2. Install Zebra printer driver from: https://www.zebra.com/us/en/support-downloads.html',
            '3. Add printer in Windows Settings → Printers & scanners',
            '4. Try again after printer is set up'
          ]
        },
        { status: 404 }
      );
    }

    // Create temporary ZPL file
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `fedex-label-${Date.now()}.zpl`);
    
    try {
      // Write ZPL to temporary file
      fs.writeFileSync(tempFile, zplText, 'utf-8');

      // Method 1: Try using Windows print command with raw mode
      try {
        // Use PowerShell to send raw ZPL to printer port directly
        const powershellScript = `
          $printer = Get-Printer -Name "${printer}" -ErrorAction SilentlyContinue
          if ($printer) {
            $port = $printer.PortName
            $zplContent = Get-Content "${tempFile}" -Raw -Encoding UTF8
            try {
              # Try direct port write first (works for USB/COM ports)
              if ($port -match '^(USB|COM)') {
                $portHandle = [System.IO.File]::OpenWrite($port)
                $bytes = [System.Text.Encoding]::ASCII.GetBytes($zplContent)
                $portHandle.Write($bytes, 0, $bytes.Length)
                $portHandle.Close()
                Write-Output "SUCCESS"
              } else {
                # For other ports, try using Out-Printer with raw mode
                $zplBytes = [System.Text.Encoding]::ASCII.GetBytes($zplContent)
                $zplBytes | Out-Printer -Name "${printer}"
                Write-Output "SUCCESS"
              }
            } catch {
              Write-Output "ERROR: $($_.Exception.Message)"
            }
          } else {
            Write-Output "ERROR: Printer not found"
          }
        `;

        const { stdout, stderr } = await execAsync(
          `powershell -Command "${powershellScript.replace(/"/g, '\\"')}"`
        );

        if (stdout.includes('SUCCESS')) {
          // Clean up temp file
          fs.unlinkSync(tempFile);
          return NextResponse.json({
            success: true,
            message: `ZPL label sent successfully to ${printer}`,
            printer,
          });
        } else {
          throw new Error(stdout || stderr || 'Print command failed');
        }
      } catch (printError: any) {
        // Method 2: Fallback - use copy command (works for some printers)
        try {
          // Try using copy command to send to printer port
          const printerPort = await getPrinterPort(printer);
          if (printerPort) {
            await execAsync(`copy /b "${tempFile}" "${printerPort}"`);
            fs.unlinkSync(tempFile);
            return NextResponse.json({
              success: true,
              message: `ZPL label sent successfully to ${printer}`,
              printer,
            });
          }
        } catch (copyError) {
          // Method 3: Return file path and instructions
          return NextResponse.json({
            success: false,
            message: 'Could not send directly. Use manual method.',
            tempFile,
            printer,
            instructions: [
              `1. ZPL file saved to: ${tempFile}`,
              `2. Open Zebra Setup Utilities`,
              `3. Select printer: ${printer}`,
              `4. Click "Send File" and select: ${tempFile}`,
              `5. Or use PowerShell: Get-Content "${tempFile}" | Out-Printer -Name "${printer}"`
            ],
            alternative: {
              method: 'Zebra Setup Utilities',
              steps: [
                '1. Download Zebra Setup Utilities from: https://www.zebra.com/us/en/support-downloads/knowledge-articles/software/printers/zebra-setup-utilities.html',
                '2. Install and open the application',
                `3. Select your printer: ${printer}`,
                `4. Go to "Print" or "Send File" option`,
                `5. Browse to: ${tempFile}`,
                '6. Click "Send" or "Print"'
              ]
            }
          });
        }
      }
    } catch (error: any) {
      // Clean up temp file on error
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Print ZPL error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to print ZPL label',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function to get default Zebra printer
async function getDefaultZebraPrinter(): Promise<string | null> {
  try {
    const { stdout } = await execAsync('powershell -Command "Get-Printer | Where-Object {$_.Name -like \'*Zebra*\' -or $_.Name -like \'*ZPL*\' -or $_.DriverName -like \'*Zebra*\'} | Select-Object -First 1 -ExpandProperty Name"');
    const printer = stdout.trim();
    return printer || null;
  } catch {
    return null;
  }
}

// Helper function to get printer port
async function getPrinterPort(printerName: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync(`powershell -Command "(Get-Printer -Name '${printerName}').PortName"`);
    const port = stdout.trim();
    // Check if it's a valid port (not WSD)
    if (port && !port.includes('WSD') && (port.includes('USB') || port.includes('IP_') || port.includes('COM'))) {
      return port;
    }
    return null;
  } catch {
    return null;
  }
}
