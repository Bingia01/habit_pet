import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.CLARIFAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        error: 'CLARIFAI_API_KEY not configured'
      }, { status: 400 });
    }
    
    // Test a simple API call to Clarifai
    const response = await fetch('https://api.clarifai.com/v2/models', {
      method: 'GET',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        error: `Clarifai API test failed: ${response.status} - ${errorText}`
      }, { status: 400 });
    }
    
    const result = await response.json();
    
    return NextResponse.json({
      message: 'Clarifai API connection successful',
      modelsCount: result.models?.length || 0
    });
    
  } catch (error) {
    return NextResponse.json({
      error: `Test failed: ${error}`
    }, { status: 500 });
  }
}
