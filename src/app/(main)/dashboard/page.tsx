// import DashboardClientWrapper from '@/components/dashboard/DashboardClientWrapper';
import CreateRiskForm from '@/components/risks/CreateRiskForm.client';
// Using ShadCN Card components for better structure and styling
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    // Adjusted padding, using theme variables for background
    <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background text-foreground">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Sidebar-like panel for form - using Card */}
        <Card className="lg:col-span-1 bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Create New Risk</CardTitle> {/* Added title */}
          </CardHeader>
          <CardContent>
            <CreateRiskForm />
          </CardContent>
        </Card>

        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Welcome to your dashboard. Here you can manage your risks.
              </p>
            </CardContent>
          </Card>

          {/* Responsive card grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
              <Card key={n} className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle>Placeholder Card {n}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This is a placeholder card for future content.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
