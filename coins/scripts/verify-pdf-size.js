// Script to verify PDF dimensions
// Usage: node verify-pdf-size.js "path/to/file.pdf"

const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.error('Usage: node verify-pdf-size.js "path/to/file.pdf"');
  process.exit(1);
}

const pdfPath = process.argv[2];

if (!fs.existsSync(pdfPath)) {
  console.error(`File not found: ${pdfPath}`);
  process.exit(1);
}

// Read PDF file
const pdfBuffer = fs.readFileSync(pdfPath);

// Parse PDF to find page dimensions
// PDF page size is in the MediaBox or CropBox in the page object
// Format: [llx lly urx ury] where urx-llx = width, ury-lly = height
// For 4x6 inches at 72 DPI: width = 288 points (4*72), height = 432 points (6*72)

let foundMediaBox = false;
let dimensions = null;

// Simple regex search for MediaBox or CropBox
const mediaBoxRegex = /MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/;
const cropBoxRegex = /CropBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/;

const pdfText = pdfBuffer.toString('binary');

const mediaBoxMatch = pdfText.match(mediaBoxRegex);
const cropBoxMatch = pdfText.match(cropBoxRegex);

if (mediaBoxMatch || cropBoxMatch) {
  const match = mediaBoxMatch || cropBoxMatch;
  const x0 = parseFloat(match[1]);
  const y0 = parseFloat(match[2]);
  const x1 = parseFloat(match[3]);
  const y1 = parseFloat(match[4]);
  
  const widthPoints = x1 - x0;
  const heightPoints = y1 - y0;
  
  // Convert points to inches (1 point = 1/72 inch)
  const widthInches = widthPoints / 72;
  const heightInches = heightPoints / 72;
  
  dimensions = {
    widthPoints,
    heightPoints,
    widthInches: widthInches.toFixed(2),
    heightInches: heightInches.toFixed(2),
  };
  
  foundMediaBox = true;
}

if (foundMediaBox) {
  console.log('\n📄 PDF Dimensions:');
  console.log(`   Width:  ${dimensions.widthInches}" (${dimensions.widthPoints} points)`);
  console.log(`   Height: ${dimensions.heightInches}" (${dimensions.heightPoints} points)`);
  console.log('');
  
  // Check if it's 4x6 inches (with small tolerance)
  const is4x6 = Math.abs(parseFloat(dimensions.widthInches) - 4) < 0.1 && 
                Math.abs(parseFloat(dimensions.heightInches) - 6) < 0.1;
  
  if (is4x6) {
    console.log('✅ PDF is correctly sized at 4x6 inches!');
  } else {
    console.log('❌ PDF is NOT 4x6 inches!');
    console.log(`   Expected: 4" x 6"`);
    console.log(`   Actual:   ${dimensions.widthInches}" x ${dimensions.heightInches}"`);
    console.log('');
    console.log('⚠️  This may cause printing issues. The PDF needs to be regenerated with correct dimensions.');
  }
} else {
  console.log('⚠️  Could not determine PDF dimensions from file.');
  console.log('   The PDF may be encrypted or use a non-standard format.');
  console.log('   Try opening the PDF in a PDF viewer and check Properties → Page Size');
}
