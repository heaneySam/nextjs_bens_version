import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const incomingHeaders = await headers();
  const cookieHeader = incomingHeaders.get('cookie') || '';
  const { id } = await paramsPromise;
  console.log('DELETE called for id:', id);

  const backendRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/guidelines/${id}/`,
    {
      method: 'DELETE',
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    }
  );
  const backendText = await backendRes.text();
  console.log('Backend status:', backendRes.status, 'body:', backendText);

  if (backendRes.status === 204) {
    // No Content: must not include a body
    return new NextResponse(null, { status: 204 });
  } else {
    return new NextResponse(backendText, { status: backendRes.status });
  }
}