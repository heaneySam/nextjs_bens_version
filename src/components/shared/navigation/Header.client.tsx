"use client";
import UserStatus from '@/components/auth/UserStatus.client';

interface HeaderProps {
  title: string;
  email: string;
  onMenuToggle?: () => void;
}

export default function Header({ title, email, onMenuToggle }: HeaderProps) {
  return (
    <header className="border-b px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          {onMenuToggle && (
            <button
              type="button"
              onClick={onMenuToggle}
              className="mr-4 md:hidden"
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
            </button>
          )}
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </div>
        <UserStatus email={email} />
      </div>
    </header>
  );
}
