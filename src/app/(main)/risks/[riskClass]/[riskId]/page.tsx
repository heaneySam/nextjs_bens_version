import { notFound } from 'next/navigation';
import { headers } from 'next/headers'; // Import headers

// Define the expected shape of the params
interface RiskDetailPageParams {
    params: Promise<{ 
        riskClass: string;
        riskId: string;
    }>;
    searchParams: Promise<{ 
        [key: string]: string | string[] | undefined 
    }>;
}

// Define the structure for the risk detail data
interface RiskDetail {
    id: string;
    class: string; // Or consider a more specific type if available
    name?: string | null;
    status?: string | null;
    description?: string | null;
    // Add other expected fields from your backend API response here
    // e.g., insured?: string, counterparty?: string, product?: string, etc.
}

// Fetch data for a specific risk
async function getRiskDetails(riskClass: string, riskId: string): Promise<RiskDetail> {
    console.log(`Fetching details for riskClass: ${riskClass}, riskId: ${riskId} from API`);

    // --- Construct absolute URL for server-side fetch --- 
    const headersList = await headers(); // Needs to be awaited
    const host = headersList.get('host') || ''; // Get host from headers
    // Determine protocol based on environment (or headers if available/reliable)
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'; 
    const absoluteApiUrl = `${protocol}://${host}/api/risks/${riskClass}/${riskId}`;
    console.log(`Constructed absolute URL: ${absoluteApiUrl}`);
    // ----------------------------------------------------

    try {
        // Use the absolute URL for the server-side fetch
        const res = await fetch(absoluteApiUrl, { 
            cache: 'no-store', // Ensure fresh data, matches proxy setting
            // Headers are automatically forwarded by the browser/fetch in this same-origin context
            // BUT for server-to-server fetch (like here), we NEED to forward cookies manually
            headers: {
                // Forward necessary headers like Cookie
                cookie: headersList.get('cookie') || '', // Forward cookie header
            },
        });

        if (!res.ok) {
            if (res.status === 404) {
                console.log(`Risk not found (404) at ${absoluteApiUrl}`);
                notFound(); // Trigger Next.js 404 page
            }
            const errorText = await res.text();
            console.error(`API Error (${res.status}) at ${absoluteApiUrl}: ${errorText}`);
            throw new Error(`Failed to fetch risk ${riskId}. Status: ${res.status}`);
        }

        const data: RiskDetail = await res.json();
        console.log("Received risk data from API:", data);
        return data;

    } catch (error) {
        console.error(`Network or fetch error calling ${absoluteApiUrl}:`, error);
        // Include the URL in the error message for better debugging
        throw new Error(`Could not fetch risk details for ${riskId} from ${absoluteApiUrl}. Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export default async function RiskDetailPage({ params, searchParams }: RiskDetailPageParams) {
    // Destructure params asynchronously (as required in Next.js 15+)
    const resolvedParams = await params;
    const { riskClass, riskId } = resolvedParams;

    // Await searchParams if needed, otherwise pass the promise or handle as needed
    // For now, we are just logging, so accessing it directly might log the Promise itself.
    // If you need the actual searchParams object, you should await it:
    // const resolvedSearchParams = await searchParams;
    // console.log('Resolved Search Params:', resolvedSearchParams);
    console.log('Page Params:', resolvedParams);
    console.log('Search Params (raw):', searchParams); // Logging the promise might not be useful

    if (!riskClass || !riskId) {
        // Should ideally be caught by routing, but good to double-check
        notFound();
    }

    // Fetch the specific risk data, explicitly typing the variable
    let riskData: RiskDetail;
    try {
        riskData = await getRiskDetails(riskClass, riskId);
    } catch (error) {
        // Optionally render a specific error message here, but usually error.tsx is preferred
        console.error("Error in RiskDetailPage while fetching data:", error);
        // Re-throwing or letting error.tsx handle is common
        // For now, we let it bubble up or be handled by Next.js default error page
        // You could return an error component: return <ErrorComponent message={...} />;
        throw error; // Ensure error boundary catches it
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-4">Risk Details</h1>
            <div className="bg-card text-card-foreground p-6 rounded-lg shadow">
                <p className="mb-2"><strong className="font-semibold">Risk Class:</strong> {riskData.class}</p>
                <p className="mb-2"><strong className="font-semibold">Risk ID:</strong> {riskData.id}</p>
                <p className="mb-2"><strong className="font-semibold">Name:</strong> {riskData.name ?? 'N/A'}</p>
                <p className="mb-2"><strong className="font-semibold">Status:</strong> {riskData.status ?? 'N/A'}</p>
                <p><strong className="font-semibold">Description:</strong></p>
                <p className="mt-1 text-muted-foreground">{riskData.description ?? 'No description provided.'}</p>
                {/* TODO: Add more fields as needed */}
            </div>
        </div>
    );
}

// Optional: Add generateMetadata if needed
// export async function generateMetadata({ params }: RiskDetailPageParams) {
//   const resolvedParams = await params;
//   return { title: `Risk ${resolvedParams.riskId}` };
// }

// Optional: Add generateStaticParams if you want to pre-render specific risk pages
// export async function generateStaticParams() {
//   // Fetch a list of risk IDs for a specific class (or multiple classes)
//   // Example for 'credit-political':
//   // const risks = await fetch('/api/risks/credit-political').then(res => res.json());
//   // return risks.map(risk => ({ riskClass: 'credit-political', riskId: risk.id }));
//   return [];
// } 