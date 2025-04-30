// app/api/auth/magic/request/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const requestEndpoint = `${apiUrl}/api/auth/code/request/`;
  
  const body = await request.json();
  
  const res = await fetch(requestEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}