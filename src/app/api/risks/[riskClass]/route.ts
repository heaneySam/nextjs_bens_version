import { NextResponse, type NextRequest } from 'next/server';
import { headers } from 'next/headers';

// Disable caching and force dynamic rendering for authentication routes
export const dynamic = 'force-dynamic';

// Ensure BACKEND_URL is set in your environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

// Define the expected shape of the params
interface RouteParams {
    params: { riskClass: string };
}

/**
 * GET handler to fetch risks for a specific class from the backend.
 * Dynamically constructs the backend URL based on riskClass param.
 * Forwards cookies and mirrors Set-Cookie headers.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<RouteParams['params']> }) {
    const { riskClass } = await params;

    if (!BACKEND_URL) {
        return NextResponse.json({ error: 'Backend URL not configured' }, { status: 500 });
    }
    if (!riskClass) {
        return NextResponse.json({ error: 'Risk class parameter is missing' }, { status: 400 });
    }

    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');

    // Construct target URL dynamically
    const targetUrl = `${BACKEND_URL}/api/risks/${riskClass}/`;
    console.log(`Proxying GET request to: ${targetUrl}`); // Optional: server-side logging

    try {
        const apiRes = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                ...(cookieHeader && { cookie: cookieHeader }),
            },
            cache: 'no-store',
        });

        if (!apiRes.ok) {
            const errorData = await apiRes.text();
            console.error(`Backend API error at ${targetUrl}: ${apiRes.status} ${apiRes.statusText}`, errorData);
            return NextResponse.json(
                { error: `Backend request failed: ${apiRes.statusText}`, details: errorData },
                { status: apiRes.status }
            );
        }

        const data = await apiRes.json();
        const response = NextResponse.json(data);

        const setCookieHeaders = apiRes.headers.getSetCookie();
        if (setCookieHeaders) {
             setCookieHeaders.forEach((cookie) => {
                 try {
                    response.headers.append('Set-Cookie', cookie);
                 } catch (e) {
                    console.error("Error parsing or setting cookie:", cookie, e);
                 }
             });
        }

        return response;

    } catch (error) {
        console.error(`Error fetching from backend API at ${targetUrl}:`, error);
        return NextResponse.json({ error: `Internal Server Error fetching data from ${riskClass} backend` }, { status: 500 });
    }
}

/**
 * POST handler to create a new risk for a specific class via the backend.
 * Dynamically constructs the backend URL based on riskClass param.
 * Forwards the request body and cookies, mirrors Set-Cookie headers.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<RouteParams['params']> }) {
    const { riskClass } = await params;

    if (!BACKEND_URL) {
        return NextResponse.json({ error: 'Backend URL not configured' }, { status: 500 });
    }
    if (!riskClass) {
        return NextResponse.json({ error: 'Risk class parameter is missing' }, { status: 400 });
    }

    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');

    // Construct target URL dynamically
    const targetUrl = `${BACKEND_URL}/api/risks/${riskClass}/`;
    console.log(`Proxying POST request to: ${targetUrl}`); // Optional: server-side logging

    try {
        const body = await request.json();

        const apiRes = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(cookieHeader && { cookie: cookieHeader }),
            },
            body: JSON.stringify(body),
            cache: 'no-store',
        });

        // Process the backend response before creating the Next response
        const responseData = await apiRes.json();
        const response = NextResponse.json(responseData, { status: apiRes.status });

        const setCookieHeaders = apiRes.headers.getSetCookie();
        if (setCookieHeaders) {
            setCookieHeaders.forEach((cookie) => {
                try {
                    response.headers.append('Set-Cookie', cookie);
                } catch (e) {
                    console.error("Error parsing or setting cookie:", cookie, e);
                }
            });
        }

        return response;

    } catch (error: unknown) {
        console.error(`Error in POST request to backend API at ${targetUrl}:`, error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }
        return NextResponse.json({ error: `Internal Server Error during POST request for ${riskClass}` }, { status: 500 });
    }
}
