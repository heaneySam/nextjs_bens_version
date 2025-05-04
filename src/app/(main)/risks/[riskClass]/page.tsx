import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic

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

  // Define a named fallback component
  function DynamicImportErrorFallback() {
    return (
      <p className="text-destructive">
        Error loading content for {title}. Component not found or loading failed.
      </p>
    );
  }
  DynamicImportErrorFallback.displayName = "DynamicImportErrorFallback"; // Assign display name

  // Attempt to dynamically load the component based on the riskClass slug
  const RiskSpecificContent = dynamic(() =>
    import(`@/components/risks/${riskClass}/RiskDashboardContent.tsx`)
      .catch(err => {
         console.error(`Failed to load component for ${riskClass}:`, err);
         // Return the named fallback component
         return DynamicImportErrorFallback;
       })
  );

  // TODO: Fetch actual data for this risk class using the proxy API:
  // const data = await fetch(`/api/risks/${riskClass}`);
  // const risks = await data.json();
  // If you fetch data here, you would pass it to RiskSpecificContent:
  // <RiskSpecificContent fetchedData={risks} /> 

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
         {/* Suspense is handled by the parent, or dynamic can have its own loading state */}
         {/* Pass fetched data as props if needed */} 
         <RiskSpecificContent /> 
      </CardContent>
    </Card>
  );
}
RiskDetails.displayName = "RiskDetails";

export default async function RiskClassPage({ params }: { params: Promise<{ riskClass: string }> }) {
  const { riskClass } = await params;

  if (!riskClass || typeof riskClass !== 'string') {
     return <main className="flex-1 p-4 md:p-6 lg:p-8"><p>Invalid risk class specified.</p></main>;
  }

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background text-foreground">
       {/* The Suspense boundary here will catch the loading state from dynamic import */}
       <Suspense fallback={
         <Card>
           <CardHeader><CardTitle>Loading Content...</CardTitle></CardHeader>
           <CardContent><p>Please wait...</p></CardContent>
         </Card>
       }>
         <RiskDetails riskClass={riskClass} />
       </Suspense>
    </main>
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