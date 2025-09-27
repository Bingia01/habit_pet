import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.CLARIFAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        status: 'Not Required',
        message: 'CLARIFAI_API_KEY not found, but using simple API that works without it',
        keyLength: 0,
        keyPreview: 'N/A - Using simple API'
      });
    }
    
    return NextResponse.json({
      status: 'Configured',
      keyLength: apiKey.length,
      keyPreview: `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
    });
    
  } catch (error) {
    return NextResponse.json({
      error: `Check failed: ${error}`
    }, { status: 500 });
  }
}
