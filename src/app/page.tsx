import Image from 'next/image';
import { auth } from './auth';
import LoginForm from '@/components/login/LoginForm';
import ToasterProvider from '@/components/providers/ToasterProvider';

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ToasterProvider />
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-7xl mx-auto py-12 sm:py-16 md:py-24 lg:py-32 flex flex-col lg:flex-row lg:items-center lg:gap-x-10">
          {/* Content column */}
          <div className="w-full lg:w-1/2 flex-shrink-0 mb-12 lg:mb-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Credit Insurance Syndications. Solved.
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground">
            Comprehensive management of non-payment insurance portfolios.            </p>
            {!session?.user && (
              <div className="mt-8 sm:mt-10">
                <LoginForm />
              </div>
            )}
          </div>

          {/* Image column - hidden on very small screens */}
          <div className="w-full lg:w-1/2 flex-shrink-0 hidden sm:block">
            <div className="rounded-md bg-background/5 shadow-2xl ring-1 ring-foreground/10 overflow-hidden">
              <Image
                src="/images/dashboard-preview.png"
                alt="App screenshot"
                width={2432}
                height={1442}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}