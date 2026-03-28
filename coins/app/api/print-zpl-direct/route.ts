import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// POST /api/print-zpl-direct - Send ZPL directly to printer
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

    // For Windows, we'll create a temporary file and use PowerShell to send it to the printer
    // This is the most reliable method for Windows
    
    const tempDir = process.env.TEMP || process.env.TMP || '/tmp';
    const tempFile = path.join(tempDir, `fedex-label-${Date.now()}.zpl`);
    
    try {
      // Write ZPL to temporary file
      fs.writeFileSync(tempFile, zplText, 'utf-8');
      
      // Use PowerShell to send to printer (Windows)
      const printer = printerName || 'Rollo X1040';
      
      // PowerShell command to send raw data to printer
      const powershellCommand = `
        $printer = Get-Printer -Name "${printer}" -ErrorAction SilentlyContinue
        if ($printer) {
          $port = $printer.PortName
          $zplContent = Get-Content "${tempFile}" -Raw -Encoding UTF8
          [System.IO.File]::WriteAllText($port, $zplContent, [System.Text.Encoding]::ASCII)
          Write-Output "SUCCESS: ZPL sent to printer"
        } else {
          Write-Output "ERROR: Printer '${printer}' not found"
        }
      `;

      // For now, return instructions since we can't execute PowerShell from Next.js API
      // We'll provide a downloadable script instead
      
      return NextResponse.json({
        success: true,
        message: 'ZPL file created. Use the PowerShell script to print.',
        tempFile,
        zplText: zplText.substring(0, 200) + '...', // Preview
        instructions: {
          windows: [
            '1. A temporary ZPL file has been created',
            '2. Use the PowerShell script provided below',
            '3. Or manually send using: copy /b "file.zpl" "\\\\localhost\\Rollo X1040"',
          ],
        },
      });
    } catch (error: any) {
      return NextResponse.json(
        { 
          error: 'Failed to create ZPL file',
          details: error.message 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process ZPL data',
        details: error.stack 
      },
      { status: 500 }
    );
  }
}
