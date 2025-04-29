"use client";
import UserStatus from '@/components/login/UserStatus';

interface HeaderProps {
  title: string;
  email: string;
}

export default function Header({ title, email }: HeaderProps) {
  return (
    <header className="border-b px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <UserStatus email={email} />
      </div>
    </header>
  );
}
