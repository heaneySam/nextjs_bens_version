// import DashboardClientWrapper from '@/components/dashboard/DashboardClientWrapper';
import CreateRiskForm from '@/components/risks/CreateRiskForm.client';

export default function DashboardPage() {
  return (
    <main className="pt-8 pb-16 max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
        {/* Sidebar-like panel for form */}
        <aside className="bg-white rounded-lg p-6 shadow-lg">
          <CreateRiskForm />
        </aside>

        {/* Main content: welcome text + responsive card grid */}
        <div className="space-y-6">
          <p className="text-lg text-foreground">
            Welcome to your dashboard.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-6 bg-background/5 rounded-lg shadow">
                <h2 className="mb-2 text-xl font-semibold text-foreground">
                  Placeholder {n}
                </h2>
                <p className="text-muted-foreground">
                  This is a placeholder card.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
