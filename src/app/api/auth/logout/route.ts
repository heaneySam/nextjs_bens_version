import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Forward the incoming cookies to the Django logout endpoint
  const cookieHeader = request.headers.get('cookie') || '';
  await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout/`,
    { method: 'POST', headers: { cookie: cookieHeader } }
  );

  // Clear the JWT cookies for the client
  const response = NextResponse.json({ success: true });
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
  return response;
} 