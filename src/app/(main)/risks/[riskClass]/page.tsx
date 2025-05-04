import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense, ComponentType } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { headers } from 'next/headers'; // Import headers
// Import the specific data type from the table component path
import type { CreditRiskEntry } from '@/components/risks/credit-political/credit_political_risks_table';

// --- Define expected props for the dynamically loaded component ---
interface RiskDashboardContentProps {
  fetchedData: CreditRiskEntry[];
  riskClass: string;
}
// ------------------------------------------------------------------

// --- Define Fallback Component Outside --- 
function DynamicImportErrorFallback() {
  // We need the title here, so maybe pass it as a prop, or keep the component inside
  // For simplicity now, let's hardcode a generic message or remove title dependency
  return (
    <p className="text-destructive">
      Error loading risk content. Component not found or loading failed.
    </p>
  );
}
DynamicImportErrorFallback.displayName = "DynamicImportErrorFallback";
// -----------------------------------------

// --- Define Fallback for Dynamic Import Error ---
const DynamicImportLoadError = () => <DynamicImportErrorFallback />;
DynamicImportLoadError.displayName = "DynamicImportLoadError";
// ---------------------------------------------

// Helper to convert slug back to title (replace with actual data fetching later)
function getRiskClassTitle(slug: string): string {
  switch (slug) {
    case 'credit-political': return 'Credit & Political Risk';
    case 'directors-officers': return 'Directors & Officers';
    default: return 'Unknown Risk Class'; // Keep a default for the title
  }
}

// Component to load and display risk-specific content dynamically
async function RiskDetails({ riskClass }: { riskClass: string }) {
  const title = getRiskClassTitle(riskClass);

  // --- Construct absolute URL for server-side fetch ---
  const headersList = await headers(); // Read headers - AWAIT ADDED
  const host = headersList.get('host') || '';
  const cookieHeader = headersList.get('cookie'); // Get cookie from incoming request
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const apiUrl = `${protocol}://${host}/api/risks/${riskClass}`;
  console.log(`RiskDetails: Fetching data from: ${apiUrl}`); // Optional logging
  // ---------------------------------------------------

  // Fetch data from the dynamic proxy API route
  let risksData: CreditRiskEntry[] = []; // Use specific type
  let fetchError: string | null = null;
  try {
    // Use the absolute URL for server-side fetch
    const res = await fetch(apiUrl, {
      cache: 'no-store', // Ensure fresh data, matching the API route
      // --- Forward cookie header for server-side fetch ---
      headers: {
        ...(cookieHeader && { cookie: cookieHeader }),
      },
      // --------------------------------------------------
    });

    console.log(`RiskDetails: Fetch response status: ${res.status} ${res.statusText}`);

    if (!res.ok) {
       throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
    }
    risksData = await res.json();
    console.log('RiskDetails: Successfully parsed risksData:', risksData);
  } catch (error: unknown) {
      console.error(`Error fetching data for ${riskClass}:`, error);
      // Type guard for Error object
      fetchError = error instanceof Error ? error.message : "An unknown error occurred during data fetching.";
      // You might want to render an error state based on this
  }

  // Attempt to dynamically load the component based on the riskClass slug
  const RiskSpecificContent = dynamic(() =>
    import(`@/components/risks/${riskClass}/RiskDashboardContent.tsx`)
      .catch(err => {
         console.error(`Failed to load component for ${riskClass}:`, err);
         // Return the named fallback component
         return DynamicImportLoadError;
       })
  );

  // --- Explicitly type the dynamically loaded component ---
  const TypedRiskSpecificContent = RiskSpecificContent as ComponentType<RiskDashboardContentProps>;
  // ------------------------------------------------------

  // If there was a fetch error, display it instead of trying to render the component
  if (fetchError) {
    return (
        <Card>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent>
                <p className="text-destructive">Error loading data: {fetchError}</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
         {/* Add placeholder introductory text */}
         <div className="mb-6 space-y-3 text-sm text-muted-foreground">
            <p>
                This section provides a comprehensive overview of the current {title.toLowerCase()} portfolio.
                Use the table below to review active deals, track their status, and manage associated risks.
                You can sort, filter (coming soon!), and select individual entries for detailed actions.
            </p>
            <p>
                Key metrics and summaries related to this risk class will be displayed here in future updates.
                Please ensure all data is kept up-to-date for accurate reporting and analysis.
            </p>
         </div>

         {/* Suspense is handled by the parent, or dynamic can have its own loading state */}
         {/* Pass the fetched data AND riskClass as props to the typed component */}
         <TypedRiskSpecificContent fetchedData={risksData} riskClass={riskClass} />
      </CardContent>
    </Card>
  );
}
RiskDetails.displayName = "RiskDetails";

export default async function RiskClassPage({ params }: { params: Promise<{ riskClass: string }> }) {
  const { riskClass } = await params;

  if (!riskClass || typeof riskClass !== 'string') {
     // Keep the main tag here for the error case, or wrap in a simple div
     return <div className="flex-1 p-4 md:p-6 lg:p-8"><p>Invalid risk class specified.</p></div>;
  }

  // Remove the <main> wrapper from the successful render path
  return (
    // The parent MainLayoutClient provides the main container and padding
    <Suspense fallback={
      <Card>
        <CardHeader>
          {/* Skeleton for Title */}
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          {/* Skeleton for content area (e.g., table loading) */}
          <Skeleton className="h-10 w-full mb-4" /> {/* Example: Controls */}
          <Skeleton className="h-64 w-full" />      {/* Example: Table */}
        </CardContent>
      </Card>
    }>
      <RiskDetails riskClass={riskClass} />
    </Suspense>
  );
}
RiskClassPage.displayName = "RiskClassPage";

// Optional: If you know the classes beforehand and want SSG/ISR
// export async function generateStaticParams() {
//   // Replace with actual fetch from backend if possible
//   const riskClasses = ['credit-political-risk', 'directors-officers'];
//   return riskClasses.map((riskClass) => ({
//     riskClass,
//   }));
// } 