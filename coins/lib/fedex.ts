// FedEx API integration for shipping label generation
// This is a simplified implementation - adjust based on your FedEx API version

import { PDFDocument } from 'pdf-lib';

interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface FedExLabelResult {
  trackingNumber: string;
  labelUrl: string;
  labelData?: string; // Base64 encoded label (PDF or ZPLII)
  labelFormat: 'PDF' | 'ZPLII'; // PDF or ZPLII format
}

export async function generateFedExLabel(
  shippingAddress: ShippingAddress,
  labelFormat: 'PDF' | 'ZPLII' = 'PDF'
): Promise<FedExLabelResult> {
  // FedEx API credentials from environment variables
  const apiKey = process.env.FEDEX_KEY || process.env.FEDEX_API_KEY;
  const apiSecret = process.env.FEDEX_PASSWORD || process.env.FEDEX_API_SECRET;
  const accountNumber = process.env.FEDEX_ACCOUNT_NUMBER;
  const meterNumber = process.env.FEDEX_METER_NUMBER;
  const environment = process.env.FEDEX_ENVIRONMENT || (process.env.FEDEX_PRODUCTION === 'true' ? 'production' : 'test');
  const isProduction = environment === 'production';

  if (!apiKey || !apiSecret || !accountNumber) {
    throw new Error('FedEx API credentials not configured. Required: FEDEX_KEY, FEDEX_PASSWORD, FEDEX_ACCOUNT_NUMBER');
  }

  // FedEx API endpoint (adjust based on your API version)
  const baseUrl = isProduction
    ? 'https://apis.fedex.com'
    : 'https://apis-sandbox.fedex.com';

  // Get OAuth token
  const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: apiSecret,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    let errorDetails;
    try {
      errorDetails = JSON.parse(errorText);
    } catch {
      errorDetails = { raw: errorText };
    }
    
    const errorInfo = {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      error: errorDetails,
      baseUrl,
      hasKey: !!apiKey,
      hasSecret: !!apiSecret,
      keyLength: apiKey?.length,
      keyPrefix: apiKey?.substring(0, 5) || 'N/A',
    };
    
    console.error('FedEx OAuth Error:', errorInfo);
    
    // Create a more detailed error message
    const errorMessage = `Failed to authenticate with FedEx API: ${tokenResponse.status} ${tokenResponse.statusText}. ${JSON.stringify(errorInfo)}`;
    const error = new Error(errorMessage) as any;
    error.fedexErrorDetails = errorInfo;
    throw error;
  }

  const { access_token } = await tokenResponse.json();

  // Create shipment request - Support both PDF and ZPLII formats
  const shipmentRequest = {
    labelResponseOptions: labelFormat === 'ZPLII' ? 'LABEL' : 'URL_ONLY', // ZPLII uses LABEL (embedded), PDF uses URL
    accountNumber: {
      value: accountNumber,
    },
    requestedShipment: {
      shipper: {
        contact: {
          personName: process.env.FEDEX_SHIPPER_NAME || 'Shackpack',
          phoneNumber: process.env.FEDEX_SHIPPER_PHONE || '',
        },
        address: {
          streetLines: [process.env.FEDEX_SHIPPER_ADDRESS_LINE1 || ''],
          city: process.env.FEDEX_SHIPPER_CITY || '',
          stateOrProvinceCode: process.env.FEDEX_SHIPPER_STATE || '',
          postalCode: process.env.FEDEX_SHIPPER_POSTAL_CODE || '',
          countryCode: process.env.FEDEX_SHIPPER_COUNTRY || 'US',
        },
      },
      recipients: [
        {
          contact: {
            personName: shippingAddress.fullName,
            phoneNumber: shippingAddress.phone || '5551234567', // Default test phone if not provided
          },
          address: {
            streetLines: [
              shippingAddress.line1,
              ...(shippingAddress.line2 ? [shippingAddress.line2] : []),
            ],
            city: shippingAddress.city,
            stateOrProvinceCode: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            countryCode: shippingAddress.country || 'US',
          },
        },
      ],
      shipDatestamp: new Date().toISOString().split('T')[0],
      serviceType: 'FEDEX_GROUND', // Standard domestic ground shipping
      packagingType: 'YOUR_PACKAGING',
      pickupType: 'USE_SCHEDULED_PICKUP',
      blockInsightVisibility: false,
      shippingChargesPayment: {
        paymentType: 'SENDER',
      },
      labelSpecification: {
        imageType: labelFormat === 'ZPLII' ? 'ZPLII' : 'PDF',
        // For ZPLII: Try STOCK_4X6 (simpler thermal stock type without suffix)
        // For PDF: Use PAPER_4X6 (standard paper stock)
        labelStockType: labelFormat === 'ZPLII' 
          ? 'STOCK_4X6'  // Try simpler thermal stock type for ZPLII
          : 'PAPER_4X6',  // Paper stock for PDF
      },
      requestedPackageLineItems: [
        {
          weight: {
            value: parseFloat(process.env.FEDEX_DEFAULT_WEIGHT || '1'),
            units: 'LB',
          },
          dimensions: {
            length: parseInt(process.env.FEDEX_DEFAULT_LENGTH || '6'),
            width: parseInt(process.env.FEDEX_DEFAULT_WIDTH || '4'),
            height: parseInt(process.env.FEDEX_DEFAULT_HEIGHT || '2'),
            units: 'IN',
          },
        },
      ],
    },
  };

  // Log the request for debugging
  console.log('FedEx API Request:', JSON.stringify({
    labelFormat: labelFormat,
    labelSize: '4x6 inches',
    labelStockType: shipmentRequest.requestedShipment.labelSpecification.labelStockType || 'N/A (ZPLII - handled by FedEx)',
    imageType: shipmentRequest.requestedShipment.labelSpecification.imageType,
    serviceType: shipmentRequest.requestedShipment.serviceType,
    labelSpecification: shipmentRequest.requestedShipment.labelSpecification,
  }, null, 2));

  // Retry logic for internal server errors (often transient)
  let shipmentResponse;
  let lastError;
  const maxRetries = 2;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      console.log(`Retrying FedEx API request (attempt ${attempt + 1}/${maxRetries + 1})...`);
      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    shipmentResponse = await fetch(
      `${baseUrl}/ship/v1/shipments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(shipmentRequest),
      }
    );

    if (shipmentResponse.ok) {
      break; // Success, exit retry loop
    }
    
    const errorText = await shipmentResponse.text();
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { message: errorText, rawResponse: errorText };
    }
    
    lastError = error;
    
    // If it's an internal server error and we have retries left, continue
    if (error.errors && error.errors.some((e: any) => e.code === 'INTERNAL.SERVER.ERROR') && attempt < maxRetries) {
      console.warn(`FedEx internal server error on attempt ${attempt + 1}, will retry...`);
      continue;
    }
    
    // Log full error details for debugging
    console.error('FedEx API Error Response:', JSON.stringify(error, null, 2));
    console.error('FedEx API Request that failed:', JSON.stringify(shipmentRequest, null, 2));
    
    throw new Error(
      `FedEx API error: ${JSON.stringify(error)}`
    );
  }

  if (!shipmentResponse.ok) {
    throw new Error(
      `FedEx API error after ${maxRetries + 1} attempts: ${JSON.stringify(lastError)}`
    );
  }

  const shipmentData = await shipmentResponse.json();

  // Log the full response for debugging
  console.log('FedEx API Response:', JSON.stringify(shipmentData, null, 2));

  // Extract tracking number and label URL - try multiple possible response structures
  let trackingNumber: string | undefined;
  let labelUrl: string | undefined;
  let labelData: string | undefined; // PDF label data (4x6 inches)

  // Check for errors in response (but allow warnings)
  if (shipmentData.errors && shipmentData.errors.length > 0) {
    const criticalErrors = shipmentData.errors.filter((e: any) => e.alertType !== 'WARNING');
    if (criticalErrors.length > 0) {
      throw new Error(
        `FedEx API error: ${JSON.stringify(criticalErrors)}`
      );
    }
  }

  // Try different response structure paths
  if (shipmentData.output?.transactionShipments?.[0]) {
    const shipment = shipmentData.output.transactionShipments[0];
    
    // Get tracking number from multiple possible locations
    trackingNumber = 
      shipment.masterTrackingNumber || 
      shipment.trackingNumber ||
      shipment.trackingNumbers?.[0]?.trackingNumber ||
      shipment.completedShipmentDetail?.masterTrackingId?.trackingNumber;
    
    // Get label from pieceResponses (PDF or ZPLII format)
    if (shipment.pieceResponses && shipment.pieceResponses.length > 0) {
      const pieceResponse = shipment.pieceResponses[0];
      if (pieceResponse.packageDocuments && pieceResponse.packageDocuments.length > 0) {
        if (labelFormat === 'ZPLII') {
          // ZPLII format - label data is embedded in response
          const labelDoc = pieceResponse.packageDocuments.find(
            (doc: any) => doc.contentType === 'LABEL' || doc.docType === 'ZPLII' || doc.encodedLabel
          );
          if (labelDoc) {
            // ZPLII is base64 encoded in the response
            if (labelDoc.encodedLabel) {
              labelData = labelDoc.encodedLabel;
            } else if (labelDoc.content) {
              labelData = labelDoc.content;
            } else if (labelDoc.url) {
              // Sometimes ZPLII is at a URL too
              labelUrl = labelDoc.url;
            }
            console.log('✅ ZPLII label extracted from response (ready for 600 DPI printing)');
          }
        } else {
          // PDF format - use URL
          const labelDoc = pieceResponse.packageDocuments.find(
            (doc: any) => doc.contentType === 'LABEL' || doc.docType === 'PDF'
          );
          if (labelDoc && labelDoc.url) {
            labelUrl = labelDoc.url;
          }
        }
      }
    }
    
    // Fallback: try old structure
    if (!labelUrl) {
      labelUrl = 
        shipment.label?.url ||
        shipment.label?.urls?.[0] ||
        shipment.label?.urls?.[0]?.url;
    }
  }

  // Alternative response structure
  if (!trackingNumber && shipmentData.output?.masterTrackingNumber) {
    trackingNumber = shipmentData.output.masterTrackingNumber;
  }
  if (labelFormat === 'ZPLII' && !labelData) {
    // Try alternative ZPLII extraction paths
    if (shipmentData.output?.label?.encodedLabel) {
      labelData = shipmentData.output.label.encodedLabel;
    } else if (shipmentData.output?.label?.content) {
      labelData = shipmentData.output.label.content;
    }
  }
  if (labelFormat === 'PDF' && !labelUrl && shipmentData.output?.label?.url) {
    labelUrl = shipmentData.output.label.url;
  }

  // For PDF format, we need labelUrl (labels are always 4x6 inches)
  if (!trackingNumber) {
    const errorMessage = `Failed to extract tracking number from FedEx response. Tracking: missing. Response structure: ${JSON.stringify(shipmentData, null, 2)}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  // For ZPLII, labelData should be present; for PDF, labelUrl should be present
  if (labelFormat === 'ZPLII' && !labelData) {
    const errorMessage = `Failed to extract ZPLII label from FedEx response. Response structure: ${JSON.stringify(shipmentData, null, 2)}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  if (labelFormat === 'PDF' && !labelUrl && !labelData) {
    const errorMessage = `Failed to extract PDF label from FedEx response. Label URL: ${labelUrl || 'missing'}, Label Data: ${labelData ? 'present' : 'missing'}. Response structure: ${JSON.stringify(shipmentData, null, 2)}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Download PDF label from URL (URLs expire quickly)
  // PDF labels may need resizing to 4x6 inches
  if (labelFormat === 'PDF' && !labelData && labelUrl) {
    try {
      const labelResponse = await fetch(labelUrl, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      if (labelResponse.ok) {
        // PDF is binary format - FedEx may return wrong size (11.33x14.67"), so we'll resize it to 4x6 inches
        const labelBuffer = await labelResponse.arrayBuffer();
        
        try {
          // Load the PDF
          const pdfDoc = await PDFDocument.load(labelBuffer);
          const pages = pdfDoc.getPages();
          
          if (pages.length > 0) {
            const firstPage = pages[0];
            const { width: currentWidth, height: currentHeight } = firstPage.getSize();
            
            // Target size: 4x6 inches in points (1 inch = 72 points)
            const targetWidth = 4 * 72;  // 288 points
            const targetHeight = 6 * 72; // 432 points
            
            const currentWidthInches = currentWidth / 72;
            const currentHeightInches = currentHeight / 72;
            
            console.log(`Original PDF size: ${currentWidthInches.toFixed(2)}" x ${currentHeightInches.toFixed(2)}"`);
            
            // If PDF is not 4x6, resize it
            if (Math.abs(currentWidth - targetWidth) > 1 || Math.abs(currentHeight - targetHeight) > 1) {
              console.log('⚠️ PDF is not 4x6 inches. Resizing to correct dimensions...');
              
              // Create a new PDF with correct 4x6 inch size
              const newPdfDoc = await PDFDocument.create();
              
              // Copy the page from original PDF
              const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [0]);
              
              // Calculate scale to fit content within 4x6 while maintaining aspect ratio
              const scaleX = targetWidth / currentWidth;
              const scaleY = targetHeight / currentHeight;
              const scale = Math.min(scaleX, scaleY); // Use smaller scale to ensure content fits
              
              // Add a new page with correct 4x6 inch size
              const newPage = newPdfDoc.addPage([targetWidth, targetHeight]);
              
              // Calculate scaled dimensions and centered position
              const scaledWidth = currentWidth * scale;
              const scaledHeight = currentHeight * scale;
              const xOffset = (targetWidth - scaledWidth) / 2;
              const yOffset = (targetHeight - scaledHeight) / 2;
              
              // Draw the copied page scaled and centered on the new 4x6 page
              newPage.drawPage(copiedPage, {
                x: xOffset,
                y: yOffset,
                xScale: scale,
                yScale: scale,
              });
              
              // Get the resized PDF
              const resizedPdfBytes = await newPdfDoc.save();
              labelData = Buffer.from(resizedPdfBytes).toString('base64');
              
              console.log(`✅ PDF resized to: 4" x 6" (${targetWidth} x ${targetHeight} points)`);
              console.log(`   Content scaled by: ${(scale * 100).toFixed(1)}% to fit within 4x6 inches`);
            } else {
              // PDF is already correct size
              labelData = Buffer.from(labelBuffer).toString('base64');
              console.log('✅ PDF is already 4x6 inches - no resize needed');
            }
          } else {
            // Fallback if PDF processing fails
            labelData = Buffer.from(labelBuffer).toString('base64');
            console.warn('Could not process PDF pages, using original');
          }
        } catch (pdfError: any) {
          // If PDF processing fails, use original
          console.warn('Error processing PDF, using original:', pdfError?.message || pdfError);
          labelData = Buffer.from(labelBuffer).toString('base64');
        }
        
        console.log('⚠️ IMPORTANT: Print at 100% scale (actual size), 600 DPI minimum for FedEx validation');
      } else {
        console.warn('Failed to download label from URL, but URL is available:', labelUrl);
      }
    } catch (error) {
      console.warn('Error downloading label, but URL is available:', labelUrl, error);
      // Don't fail - URL is still available for immediate use
    }
  }

  return {
    trackingNumber,
    labelUrl,
    labelData, // Base64 encoded label (PDF or ZPLII)
    labelFormat: labelFormat, // PDF or ZPLII format
  };
}
