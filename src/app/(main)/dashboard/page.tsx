import DashboardClientWrapper from '@/components/dashboard/DashboardClientWrapper';

export default function DashboardPage() {
  return (
    <DashboardClientWrapper>
      <p className="mb-4 text-lg text-foreground">
        Welcome to your dashboard.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </DashboardClientWrapper>
  );
}
