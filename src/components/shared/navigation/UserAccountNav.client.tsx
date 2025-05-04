"use client";

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback /*, AvatarImage */ } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { logout } from '@/app/auth-client';
import { useTransition } from 'react';

interface UserAccountNavProps {
  email: string;
}

export default function UserAccountNav({ email }: UserAccountNavProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logout();
        // Redirect to home after logout
        window.location.href = '/';
      } catch (error) {
        console.error("Logout failed:", error);
        // Optionally, show an error message to the user
      }
    });
  };

  const getInitials = (userEmail: string | undefined | null): string => {
    if (!userEmail) return '?';
    return userEmail.charAt(0).toUpperCase();
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                aria-label="User Menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials(email)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{email || "User Email"}</p>
          </TooltipContent>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Account</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {email || 'No email provided'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={isPending}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isPending ? 'Logging out...' : 'Log out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    </TooltipProvider>
  );
}
