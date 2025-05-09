import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Disable caching for this auth-related proxy
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Extract incoming cookies to forward
  const incomingHeaders = await headers();
  const cookieHeader = incomingHeaders.get('cookie') || '';
  // Read body from client
  const body = await request.text();

  // Proxy the request to the backend
  const backendRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/guidelines/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader,
      },
      body,
      cache: 'no-store',
    }
  );

  // Return proxied JSON response
  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}

export async function GET(request: Request) {
  // Extract incoming cookies and forward any query parameters
  const incoming = await headers();
  const cookie = incoming.get('cookie') || '';
  const url = new URL(request.url);
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/guidelines${url.search}`;
  const backendRes = await fetch(backendUrl, {
    headers: { cookie },
    cache: 'no-store',
  });
  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}