import { NextResponse, type NextRequest } from 'next/server';
import { headers } from 'next/headers';

// Disable caching and force dynamic rendering for authentication routes
export const dynamic = 'force-dynamic';

// Ensure BACKEND_URL is set in your environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

// Define the expected shape of the params for this specific route
interface RiskDetailRouteParams {
    params: {
        riskClass: string;
        riskId: string;
    };
}

/**
 * GET handler to fetch details for a specific risk from the backend.
 * Dynamically constructs the backend URL based on riskClass and riskId params.
 * Forwards cookies and mirrors Set-Cookie headers.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<RiskDetailRouteParams['params']> }) {
    const { riskClass, riskId } = await params;

    if (!BACKEND_URL) {
        console.error('Backend URL not configured');
        return NextResponse.json({ error: 'Backend URL not configured' }, { status: 500 });
    }
    if (!riskClass) {
        return NextResponse.json({ error: 'Risk class parameter is missing' }, { status: 400 });
    }
    if (!riskId) {
        return NextResponse.json({ error: 'Risk ID parameter is missing' }, { status: 400 });
    }

    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');

    // Construct target URL dynamically for the specific risk
    const targetUrl = `${BACKEND_URL}/api/risks/${riskClass}/${riskId}/`; // Ensure trailing slash if backend expects it
    console.log(`Proxying GET request for risk details to: ${targetUrl}`);

    try {
        const apiRes = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                ...(cookieHeader && { cookie: cookieHeader }),
            },
            cache: 'no-store', // Ensure fresh data for details
        });

        // Handle non-OK responses from the backend
        if (!apiRes.ok) {
            const errorData = await apiRes.text();
            console.error(`Backend API error at ${targetUrl}: ${apiRes.status} ${apiRes.statusText}`, errorData);
            // Forward the backend's status code and error message if possible
            return NextResponse.json(
                { error: `Backend request failed: ${apiRes.statusText}`, details: errorData },
                { status: apiRes.status }
            );
        }

        // Parse the JSON data from the backend response
        const data = await apiRes.json();

        // Create the Next.js response with the fetched data
        const response = NextResponse.json(data);

        // Mirror any Set-Cookie headers from the backend response
        const setCookieHeaders = apiRes.headers.getSetCookie();
        if (setCookieHeaders) {
            setCookieHeaders.forEach((cookie) => {
                try {
                    // Use append to handle multiple Set-Cookie headers correctly
                    response.headers.append('Set-Cookie', cookie);
                } catch (e) {
                    console.error("Error parsing or setting cookie:", cookie, e);
                }
            });
        }

        return response;

    } catch (error) {
        console.error(`Error fetching from backend API at ${targetUrl}:`, error);
        return NextResponse.json({ error: `Internal Server Error fetching data for risk ${riskId} from ${riskClass} backend` }, { status: 500 });
    }
}

// You might add PUT/PATCH/DELETE handlers here later if needed
// export async function PUT(...) { ... }
// export async function DELETE(...) { ... } 