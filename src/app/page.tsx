export default async function Home() {
  // fetch() here runs on the Next.js server
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health/`, { cache: "no-store" });
  const { status } = await res.json();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      {/* show the health status at top */}
      <p className="absolute top-4 right-4 text-sm">Backend health: {status}</p>

      <main className="…">
        {/* … your existing JSX … */}
      </main>

      <footer className="…">
        {/* … your existing footer … */}
      </footer>
    </div>
  );
}