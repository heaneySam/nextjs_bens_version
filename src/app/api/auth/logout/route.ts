import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Forward the incoming cookies to the Django logout endpoint
  const cookieHeader = request.headers.get('cookie') || '';
  const backendRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout/`,
    { method: 'POST', headers: { cookie: cookieHeader } }
  );
  // Grab all Set-Cookie headers from backend
  const setCookies = backendRes.headers.get('set-cookie');
  const response = NextResponse.json(await backendRes.json(), { status: backendRes.status });
  if (setCookies) {
    // Forward them verbatim so the browser can act on the Domain attribute
    response.headers.set('Set-Cookie', setCookies);
  }
  return response;
}