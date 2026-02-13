// FedEx API integration for shipping label generation
// This is a simplified implementation - adjust based on your FedEx API version

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
  labelData?: string; // Base64 encoded label if needed
}

export async function generateFedExLabel(
  shippingAddress: ShippingAddress
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
    throw new Error('Failed to authenticate with FedEx API');
  }

  const { access_token } = await tokenResponse.json();

  // Create shipment request
  // This is a simplified example - adjust based on FedEx API documentation
  const shipmentRequest = {
    labelResponseOptions: 'URL_ONLY',
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
            phoneNumber: shippingAddress.phone || '',
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
      serviceType: 'STANDARD_OVERNIGHT', // Adjust based on your needs
      packagingType: 'YOUR_PACKAGING',
      pickupType: 'USE_SCHEDULED_PICKUP',
      blockInsightVisibility: false,
      shippingChargesPayment: {
        paymentType: 'SENDER',
      },
      labelSpecification: {
        imageType: 'PDF',
        labelStockType: 'PAPER_4X6',
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
      accountNumber: {
        value: accountNumber,
      },
    },
  };

  // Create shipment
  const shipmentResponse = await fetch(
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

  if (!shipmentResponse.ok) {
    const error = await shipmentResponse.json();
    throw new Error(
      `FedEx API error: ${JSON.stringify(error)}`
    );
  }

  const shipmentData = await shipmentResponse.json();

  // Extract tracking number and label URL
  const trackingNumber =
    shipmentData.output?.transactionShipments?.[0]?.masterTrackingNumber ||
    shipmentData.output?.transactionShipments?.[0]?.trackingNumber;

  const labelUrl =
    shipmentData.output?.transactionShipments?.[0]?.label?.url;

  if (!trackingNumber || !labelUrl) {
    throw new Error('Failed to extract tracking number or label from FedEx response');
  }

  return {
    trackingNumber,
    labelUrl,
  };
}
