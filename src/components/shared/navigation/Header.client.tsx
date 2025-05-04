"use client";
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserAccountNav from './UserAccountNav.client';

interface HeaderProps {
  title: string;
  email: string;
  onMenuToggle?: () => void;
}

export default function Header({ title, email, onMenuToggle }: HeaderProps) {
  return (
    <header className="border-b px-4 sm:px-6 py-3 bg-gradient-to-r from-background via-background/90 to-background/80 sticky top-0 z-30 h-16 flex items-center">
      <div className="max-w-full mx-auto flex justify-between items-center w-full">
        <div className="flex items-center">
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="mr-2 md:hidden"
              aria-label="Toggle Menu"
            >
              <svg
                className="w-6 h-6 text-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5 text-foreground" />
          </Button>
          <UserAccountNav email={email} />
        </div>
      </div>
    </header>
  );
}
