import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Disable caching for this proxy
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Forward cookies and query params to the backend
  const incoming = await headers();
  const cookie = incoming.get('cookie') || '';
  const url = new URL(request.url);

  console.log('[PROXY_ROUTE] Incoming request.url:', request.url);

  // Ensure a trailing slash before query parameters
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/guidelines/minimal/${url.search}`;
  console.log('[PROXY_ROUTE] Constructed backendUrl:', backendUrl);

  const backendRes = await fetch(backendUrl, {
    headers: {
      cookie,
      'Accept': 'application/json',
    },
    cache: 'no-store',
  });

  // Log the raw response text
  const responseText = await backendRes.text();
  console.log('Backend response status:', backendRes.status);
  console.log('Backend response text:', responseText);

  // Try to parse as JSON
  try {
    const data = JSON.parse(responseText);
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('Error parsing JSON:', error);
    // Return the raw text and original status if JSON parsing fails
    return new NextResponse(responseText, { status: backendRes.status });
  }
}