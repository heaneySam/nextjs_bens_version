'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

/**
 * Server Action to create a new Credit & Political Risk entry.
 * Sends a POST request to the internal Next.js API proxy route,
 * which then forwards it to the Django backend.
 */
export async function createCreditPoliticalRisk() {
  console.log("Server Action: createCreditPoliticalRisk invoked");

  // The API route handler needs the full URL, including the host.
  // We can construct it using headers().
  const headersList = await headers();
  const host = headersList.get('host') || ''; // e.g., 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const apiUrl = `${protocol}://${host}/api/risks/credit-political`;

  // Explicitly get cookies to forward from Server Action to API Route
  const cookieHeader = headersList.get('cookie');

  console.log(`Server Action: Posting to internal API route: ${apiUrl}`);

  // Minimal data for creating a new risk - adapt as needed
  // The backend might require specific fields or handle defaults.
  // The `created_by` field should be automatically handled by the backend view based on the authenticated user.
  const newRiskData = {
    name: "New CPR Deal", // Placeholder name
    description: "Created via frontend button",
    // Add other required fields with default/empty values if necessary
    // based on the backend serializer/model constraints.
    // e.g., product: 'trade_credit', status: 'new_deal'
    status: 'new_deal',
  };

  try {
    // Fetch from the internal Next.js API proxy route, not the direct backend URL.
    // The proxy handler will forward cookies automatically.
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Explicitly forward the cookie header to the internal API route
        ...(cookieHeader && { cookie: cookieHeader }),
      },
      body: JSON.stringify(newRiskData),
      cache: 'no-store',
    });

    if (!res.ok) {
      // Attempt to parse error from the API route response
      let errorBody = '';
      try {
          errorBody = await res.json();
      } catch {
          errorBody = await res.text(); // Fallback to text
      }
      console.error("Server Action: API route failed", { status: res.status, body: errorBody });
      // Re-throw or return an error object for the client component to handle
      return {
        success: false,
        error: `API Error: ${res.status} ${res.statusText}`,
        details: errorBody
      };
    }

    const createdRisk = await res.json();
    console.log("Server Action: Risk created successfully", createdRisk);

    // Revalidate the path to refresh the data displayed in the table
    revalidatePath('/risks/credit-political');

    return {
      success: true,
      data: createdRisk
    };

  } catch (error: unknown) {
    console.error("Server Action: Error creating risk:", error);
    return {
      success: false,
      // Type guard for Error object
      error: error instanceof Error ? error.message : "An unknown error occurred."
    };
  }
} 