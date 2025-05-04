// src/app/api/risks/[riskClass]/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

async function proxy(request: Request, riskClass: string) {
  const incoming = await headers();
  const cookie = incoming.get('cookie') || '';
  const url = new URL(request.url);
  // forward path and query string, always ensure a trailing slash after the class
  // strip the matched segment (and optional slash)
  const suffix = url.pathname.replace(/^\/api\/risks\/[^/]+\/?/, '');
  // if no suffix, default to a single slash
  const normalizedSuffix = suffix || '/';
  const backendUrl = `${process.env.BACKEND_URL}/api/risks/${riskClass}${normalizedSuffix}${url.search}`;

  const init: RequestInit = {
    method: request.method,
    headers: {
      'Content-Type': request.headers.get('Content-Type') || 'application/json',
      cookie,
    },
    // only forward a body if it's not GET/HEAD
    body: request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.text()
      : null,
    cache: 'no-store',
  };

  const backendRes = await fetch(backendUrl, init);
  const responseData = await backendRes.arrayBuffer();
  const responseHeaders = new Headers(backendRes.headers);
  return new NextResponse(responseData, {
    status: backendRes.status,
    headers: responseHeaders,
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ riskClass: string }> }
) {
  const { riskClass } = await params;
  return proxy(request, riskClass);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ riskClass: string }> }
) {
  const { riskClass } = await params;
  return proxy(request, riskClass);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ riskClass: string }> }
) {
  const { riskClass } = await params;
  return proxy(request, riskClass);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ riskClass: string }> }
) {
  const { riskClass } = await params;
  return proxy(request, riskClass);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ riskClass: string }> }
) {
  const { riskClass } = await params;
  return proxy(request, riskClass);
}