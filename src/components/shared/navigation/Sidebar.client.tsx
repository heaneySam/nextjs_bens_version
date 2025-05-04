'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Home, LayoutDashboard, BriefcaseBusiness, ShieldCheck, Users, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

// Keep the icon map, using the string slugs as keys
const riskIconMap: { [key: string]: LucideIcon } = {
  'credit-political': ShieldCheck, // Adjusted key based on logs
  'directors-officers': Users,
  default: BriefcaseBusiness,
};

// Helper to format slug string into a readable label
function formatSlugAsLabel(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  // State to hold fetched risk class slugs (strings)
  const [fetchedRiskSlugs, setFetchedRiskSlugs] = useState<string[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const pathname = usePathname();
  const params = useParams();
  const activeRiskClass = params?.riskClass as string | undefined;

  const isRisksSectionActive = pathname.startsWith('/risks');

  useEffect(() => {
    async function fetchClasses() {
      setIsLoadingClasses(true);
      setFetchError(null);
      try {
        const res = await fetch('/api/risks');
        if (!res.ok) {
          throw new Error(`Failed to fetch risk classes: ${res.statusText}`);
        }
        const data = await res.json();

        // Expect an array of strings based on logs
        console.log('Fetched Risk Classes (raw):', data);
        const slugs = Array.isArray(data) ? data : (Array.isArray(data?.risk_classes) ? data.risk_classes : []);

        // Validate that items are strings
        if (slugs.every((item: unknown) => typeof item === 'string')) {
           setFetchedRiskSlugs(slugs as string[]);
        } else {
            console.error("Fetched data is not an array of strings:", slugs);
            setFetchedRiskSlugs([]);
            throw new Error('Unexpected data format for risk classes - expected string array');
        }
      } catch (err: unknown) {
        console.error(err);
        setFetchError(err instanceof Error ? err.message : String(err));
        setFetchedRiskSlugs([]);
      } finally {
        setIsLoadingClasses(false);
      }
    }
    fetchClasses();
  }, []);

  // Use fetchedRiskSlugs state for rendering
  const risksBaseHref = fetchedRiskSlugs.length > 0 ? `/risks/${fetchedRiskSlugs[0]}` : '/risks';

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: risksBaseHref, label: 'Risks', icon: BriefcaseBusiness, isSection: true },
  ];

  return (
    <>
      <aside
        className={cn(
          'fixed top-16 bottom-0 left-0 z-20 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out md:sticky md:top-16 h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
      >
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isTopLevelActive = item.isSection
              ? isRisksSectionActive
              : pathname === item.href;

            return (
              <div key={item.label}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isTopLevelActive &&
                      !item.isSection &&
                      'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground'
                  )}
                  aria-current={isTopLevelActive && !item.isSection ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>

                {item.isSection && isRisksSectionActive && (
                  <div className="mt-1 ml-4 pl-5 border-l border-sidebar-border/50 space-y-1">
                    {isLoadingClasses && (
                      <span className="block px-3 py-1.5 text-sm text-sidebar-foreground/60 italic">
                        Loading classes...
                      </span>
                    )}
                    {fetchError && (
                      <span className="block px-3 py-1.5 text-sm text-red-500">
                        Error: {fetchError}
                      </span>
                    )}
                    {!isLoadingClasses && !fetchError && fetchedRiskSlugs.length === 0 && (
                      <span className="block px-3 py-1.5 text-sm text-sidebar-foreground/60">
                        No risk classes found.
                      </span>
                    )}
                    {fetchedRiskSlugs.map((slug) => {
                      // Use the slug directly for mapping and key
                      const SubIcon = riskIconMap[slug] || riskIconMap.default;
                      const isSubItemActive = activeRiskClass === slug;
                      const label = formatSlugAsLabel(slug); // Generate label
                      return (
                        <Link
                          key={slug} // Use the slug string as the key
                          href={`/risks/${slug}`}
                          onClick={onClose}
                          className={cn(
                            'flex items-center gap-3 rounded-md px-3 py-1.5 text-sm text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            isSubItemActive &&
                              'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          )}
                          aria-current={isSubItemActive ? 'page' : undefined}
                        >
                          <SubIcon className="h-4 w-4 flex-shrink-0" />
                          {/* Use the formatted label */}
                          <span className="flex-1 truncate">{label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {isOpen && onClose && (
        <div
          className="fixed top-16 inset-x-0 bottom-0 z-10 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
} 