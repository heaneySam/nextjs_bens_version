import { notFound } from 'next/navigation';
import { headers } from 'next/headers'; // Import headers
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Added for Card layout
import { Separator } from "@/components/ui/separator"; // Added for visual separation
import { Paperclip, AlertCircle } from "lucide-react"; // Icons for attachments and errors

// Define the expected shape of the params
interface RiskDetailPageParams {
    params: Promise<{
        riskClass: string;
        riskId: string;
    }>;
    // searchParams: Promise<{  // Removed as it's unused
    //     [key: string]: string | string[] | undefined
    // }>;
}

// --- Updated RiskDetail interface to include all fields from CreditPoliticalRisk model ---
interface RiskDetail {
    id: string;
    name?: string | null;
    description?: string | null;
    insured?: string | null;
    country_of_insured?: string | null;
    counterparty?: string | null;
    country_of_counterparty?: string | null;
    product?: string | null;
    country_of_risk?: string | null;
    creation_date?: string | null; // Business creation date
    inception_date?: string | null;
    expiry_date?: string | null;
    status?: string | null;
    score?: number | null;
    created_at?: string | null; // Record created_at
    updated_at?: string | null; // Record updated_at
    source_system?: string | null;
    source_record_id?: string | null;
    unstructured_data?: Record<string, unknown> | null;
    // 'class' is likely added by the backend serializer based on riskClass from URL
    class: string; 
    // created_by could be an object or ID, assuming string ID for now.
    // The backend serializer for CreditPoliticalRisk would determine how created_by (ForeignKey) is represented.
    // Example: created_by_username?: string | null; or created_by_id?: string | null;
    // For now, let's assume it's not directly available or handled by one of the other fields.
    attachments_count?: number | null; // If available from the detail endpoint
}

// --- New interface for Attachment details ---
interface AttachmentDetail {
    id: string;
    original_filename: string;
    file_url?: string | null; // Added to hold the pre-signed download URL
    // Add other relevant attachment fields if needed, e.g., created_at
}

// --- Helper function to format date strings ---
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        console.warn(`Failed to parse date string "${dateString}":`, e); // Log the warning
        return dateString; // Return original if parsing fails
    }
};

// --- Helper component to render detail items consistently ---
const DetailItem = ({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) => (
    <div className={`mb-3 ${className}`}>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-md">{value ?? <span className="text-slate-500">N/A</span>}</p>
    </div>
);

// Fetch data for a specific risk
async function getRiskDetails(riskClass: string, riskId: string): Promise<RiskDetail> {
    console.log(`Fetching details for riskClass: ${riskClass}, riskId: ${riskId} from API`);

    const headersList = await headers();
    const host = headersList.get('host') || '';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const absoluteApiUrl = `${protocol}://${host}/api/risks/${riskClass}/${riskId}`;
    console.log(`Constructed absolute URL for risk details: ${absoluteApiUrl}`);

    try {
        const res = await fetch(absoluteApiUrl, {
            cache: 'no-store',
            headers: {
                cookie: headersList.get('cookie') || '',
            },
        });

        if (!res.ok) {
            if (res.status === 404) {
                console.log(`Risk not found (404) at ${absoluteApiUrl}`);
                notFound();
            }
            const errorText = await res.text();
            console.error(`API Error for risk details (${res.status}) at ${absoluteApiUrl}: ${errorText}`);
            throw new Error(`Failed to fetch risk ${riskId}. Status: ${res.status}`);
        }

        const data: RiskDetail = await res.json();
        console.log("Received risk data from API:", data);
        return data;

    } catch (error) {
        console.error(`Network or fetch error calling for risk details ${absoluteApiUrl}:`, error);
        throw new Error(`Could not fetch risk details for ${riskId} from ${absoluteApiUrl}. Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// --- New function to fetch attachments for a specific risk ---
async function getRiskAttachments(riskClass: string, riskId: string): Promise<AttachmentDetail[]> {
    console.log(`Fetching attachments for riskClass: ${riskClass}, riskId: ${riskId}`);

    const headersList = await headers();
    const host = headersList.get('host') || '';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    // Assuming an endpoint like /api/risks/{riskClass}/{riskId}/attachments
    const absoluteApiUrl = `${protocol}://${host}/api/risks/${riskClass}/${riskId}/attachments`;
    console.log(`Constructed absolute URL for attachments: ${absoluteApiUrl}`);

    try {
        const res = await fetch(absoluteApiUrl, {
            cache: 'no-store',
            headers: {
                cookie: headersList.get('cookie') || '',
            },
        });

        if (!res.ok) {
            // It might be okay for attachments to be missing (e.g., 404 if no attachments endpoint or empty list)
            // For now, log error but don't necessarily throw a page-breaking error unless it's a server fault.
            // If a 404 means "no attachments found", we can return an empty array.
            if (res.status === 404) {
                console.log(`No attachments found (404) or endpoint not available at ${absoluteApiUrl}`);
                return []; // Return empty array if 404 means no attachments
            }
            const errorText = await res.text();
            console.error(`API Error for attachments (${res.status}) at ${absoluteApiUrl}: ${errorText}`);
            // Depending on requirements, you might throw an error or return empty list.
            // For now, returning empty list on error other than 404 to allow page to render.
            return [];
        }
        const data: AttachmentDetail[] = await res.json();
        console.log("Received attachments data from API:", data);
        return data;
    } catch (error) {
        console.error(`Network or fetch error calling for attachments ${absoluteApiUrl}:`, error);
        // Return empty list on error to allow the rest of the page to load.
        return [];
    }
}


export default async function RiskDetailPage({ params }: RiskDetailPageParams) {
    const resolvedParams = await params;
    const { riskClass, riskId } = resolvedParams;

    console.log('Page Params:', resolvedParams);
    // const resolvedSearchParams = await searchParams; // This line is fully removed
    // console.log('Resolved Search Params:', resolvedSearchParams); // This line is fully removed

    if (!riskClass || !riskId) {
        notFound();
    }

    // Fetch risk data and attachments in parallel
    let riskData: RiskDetail;
    let attachments: AttachmentDetail[];

    try {
        [riskData, attachments] = await Promise.all([
            getRiskDetails(riskClass, riskId),
            getRiskAttachments(riskClass, riskId)
        ]);
    } catch (error) {
        console.error("Error in RiskDetailPage while fetching data:", error);
        // Render a more user-friendly error message or rely on Next.js error.tsx
        return (
            <div className="container mx-auto py-8 text-center">
                <Card className="max-w-lg mx-auto">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center justify-center">
                            <AlertCircle className="mr-2 h-6 w-6" /> Error Loading Risk Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>We encountered an issue trying to load the details for this risk.</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Please try again later or contact support if the problem persists.
                        </p>
                        {error instanceof Error && <p className="mt-4 text-xs text-red-400">Details: {error.message}</p>}
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const riskDisplayName = riskData.name || `Risk ID: ${riskData.id}`;

    return (
        <div className="container mx-auto py-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{riskDisplayName}</CardTitle>
                    {riskData.description && (
                        <CardDescription className="pt-1">{riskData.description}</CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                        <DetailItem label="Risk Class" value={riskData.class} />
                        <DetailItem label="Status" value={riskData.status} />
                        <DetailItem label="Product" value={riskData.product} />
                        <DetailItem label="Score" value={riskData.score} />
                        <DetailItem label="Country of Risk" value={riskData.country_of_risk} />
                    </div>
                    <Separator className="my-4" />
                     <h3 className="text-lg font-semibold mb-2 text-primary">Parties Involved</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                        <DetailItem label="Insured" value={riskData.insured} />
                        <DetailItem label="Country of Insured" value={riskData.country_of_insured} />
                        <DetailItem label="Counterparty" value={riskData.counterparty} />
                        <DetailItem label="Country of Counterparty" value={riskData.country_of_counterparty} />
                    </div>
                    <Separator className="my-4" />
                    <h3 className="text-lg font-semibold mb-2 text-primary">Key Dates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                        <DetailItem label="Business Creation Date" value={formatDate(riskData.creation_date)} />
                        <DetailItem label="Inception Date" value={formatDate(riskData.inception_date)} />
                        <DetailItem label="Expiry Date" value={formatDate(riskData.expiry_date)} />
                        <DetailItem label="Record Created At" value={formatDate(riskData.created_at)} />
                        <DetailItem label="Record Updated At" value={formatDate(riskData.updated_at)} />
                    </div>
                    <Separator className="my-4" />
                     <h3 className="text-lg font-semibold mb-2 text-primary">Source Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                        <DetailItem label="Source System" value={riskData.source_system} />
                        <DetailItem label="Source Record ID" value={riskData.source_record_id} />
                    </div>

                    {riskData.unstructured_data && (
                        <>
                            <Separator className="my-4" />
                            <h3 className="text-lg font-semibold mb-2 text-primary">Unstructured Data</h3>
                            <div className="bg-muted p-3 rounded-md">
                                <pre className="text-xs whitespace-pre-wrap break-all">
                                    {JSON.stringify(riskData.unstructured_data, null, 2)}
                                </pre>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Paperclip className="mr-2 h-5 w-5 text-primary" /> Attachments
                    </CardTitle>
                    <CardDescription>
                        Associated files for this risk entry.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {attachments && attachments.length > 0 ? (
                        <ul className="space-y-2">
                            {attachments.map((att) => (
                                <li key={att.id} className="p-3 bg-muted rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{att.original_filename}</p>
                                        <p className="text-xs text-muted-foreground">ID: {att.id}</p>
                                    </div>
                                    {att.file_url ? (
                                        <a 
                                            href={att.file_url}
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="ml-4 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                                        >
                                            Download
                                        </a>
                                    ) : (
                                        <span className="ml-4 text-sm text-muted-foreground">(No download link)</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">No attachments found for this risk.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Optional: Add generateMetadata if needed
// export async function generateMetadata({ params }: RiskDetailPageParams) {
//   const resolvedParams = await params;
//   const riskData = await getRiskDetails(resolvedParams.riskClass, resolvedParams.riskId); // Fetch data for metadata
//   return { title: riskData.name || `Risk ${resolvedParams.riskId}` };
// }

// Optional: Add generateStaticParams if you want to pre-render specific risk pages
// export async function generateStaticParams() {
//   // Example: return [{ riskClass: 'credit-political', riskId: 'some-id' }];
//   return [];
// }
