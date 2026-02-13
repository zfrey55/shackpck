import { NextResponse } from 'next/server';

// GET /api/basic-test - Basic test to see if API routes work
export async function GET() {
  return NextResponse.json({
    message: 'API route is working',
    timestamp: new Date().toISOString(),
  });
}
