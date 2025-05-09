import { NextRequest, NextResponse } from 'next/server';

// Ensure responses are not cached by default for API routes, especially auth-related or dynamic data.
export const dynamic = 'force-dynamic';

interface RouteParams {
  riskClass: string;
  riskId: string;
}

export async function GET(request: NextRequest, context: { params: Promise<RouteParams> }) {
  const { riskClass, riskId } = await context.params;

  if (!riskClass || !riskId) {
    return NextResponse.json({ error: 'Missing riskClass or riskId in path' }, { status: 400 });
  }

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!BACKEND_URL) {
    console.error('Error: BACKEND_URL environment variable is not set.');
    return NextResponse.json({ error: 'Internal server configuration error' }, { status: 500 });
  }

  // --- Simplified Cookie Handling: Forward the raw Cookie header from the browser --- 
  // This aligns with the HttpOnly cookie JWT pattern where Django's custom auth class inspects cookies.
  const incomingCookieHeader = request.headers.get('cookie') || '';
  console.log(`All available cookies from browser (to be forwarded): "${incomingCookieHeader}"`);
  // --- End Simplified Cookie Handling ---

  console.log(`Proxying GET request for attachments: /api/risks/${riskClass}/${riskId}/attachments/`);
  const backendServiceUrl = `${BACKEND_URL}/api/risks/${riskClass}/${riskId}/attachments/`;
  console.log(`Constructed backend URL for attachments: ${backendServiceUrl}`);
  
  // Log what is being sent specifically for the Cookie header to the backend
  if (incomingCookieHeader) {
    console.log(`Sending 'Cookie' header to backend: "${incomingCookieHeader}"`);
  } else {
    console.warn("No 'Cookie' header received from browser to forward to backend.");
  }

  try {
    const apiResponse = await fetch(backendServiceUrl, {
      method: 'GET',
      headers: {
        // Forward the entire cookie header as received from the browser
        // Only include the Cookie header if it has a value
        ...(incomingCookieHeader && { 'Cookie': incomingCookieHeader }),
        'Content-Type': 'application/json', // Optional for GET, but can be good practice
        'Accept': 'application/json', // Good to specify expected response type
      },
      cache: 'no-store',
    });

    // Create a new Headers object for the NextResponse
    const responseHeaders = new Headers(apiResponse.headers);
    // It's crucial to remove any Set-Cookie headers from the backend that we don't want to simply pass through raw.
    // Instead, we let NextResponse handle them if they need to be set on the browser.
    responseHeaders.delete('Set-Cookie'); 

    const nextResponse = new NextResponse(apiResponse.body, {
      status: apiResponse.status,
      statusText: apiResponse.statusText,
      headers: responseHeaders, // Use the headers object that had Set-Cookie removed
    });

    // Forward Set-Cookie headers from the backend to the browser correctly.
    // apiResponse.headers.getSetCookie() is the standard way.
    try {
        const setCookieValues = apiResponse.headers.getSetCookie(); // Returns an array of cookie strings
        if (setCookieValues && setCookieValues.length > 0) {
            console.log('Backend responded with Set-Cookie headers:', setCookieValues);
            setCookieValues.forEach(cookieString => {
                // Append raw Set-Cookie string. NextResponse doesn't have a direct method 
                // to parse and set from a full string like `res.cookie` in Express.
                // Appending the raw string is the most reliable way to preserve all attributes.
                nextResponse.headers.append('Set-Cookie', cookieString);
            });
        }
    } catch (e) {
        console.warn("Could not process Set-Cookie headers using getSetCookie() from backend. Error:", e);
        // Fallback for environments where getSetCookie() might not be available on Headers:
        // Manually iterate and append if needed, though getSetCookie() is standard.
        // Example: 
        // for (const [key, value] of apiResponse.headers.entries()) {
        //   if (key.toLowerCase() === 'set-cookie') {
        //     nextResponse.headers.append('Set-Cookie', value);
        //   }
        // }
    }

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text(); 
      console.error(`Backend API error for attachments (${apiResponse.status}) from ${backendServiceUrl}: ${errorBody}`);
      return NextResponse.json(
        { error: `Failed to fetch attachments from backend. Status: ${apiResponse.status}`, details: errorBody }, 
        { status: apiResponse.status }
      );
    }

    return nextResponse;

  } catch (error) {
    console.error(`Error proxying request to backend service ${backendServiceUrl} for attachments:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to connect to backend service for attachments', details: errorMessage }, { status: 503 });
  }
}
