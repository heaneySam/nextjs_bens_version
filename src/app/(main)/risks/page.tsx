import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function RisksPage() {
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background text-foreground">
      <Card>
        <CardHeader>
          <CardTitle>Select a Risk Class</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Please choose a risk class from the sidebar menu to view details.
          </p>
          {/* Optionally add direct links here too */}
          <div className="space-y-2">
             <Link href="/risks/credit-political-risk" className="block text-primary hover:underline">Credit & Political Risk</Link>
             <Link href="/risks/directors-officers" className="block text-primary hover:underline">Directors & Officers</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
} 