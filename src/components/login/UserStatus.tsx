"use client";

import { useState, FC } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, LogOut } from "lucide-react";

interface UserStatusProps {
  email: string;
}

const UserStatus: FC<UserStatusProps> = ({ email }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setIsLoading(false);
    router.push("/");
  };

  return (
    <div className="flex items-center space-x-2">
      <UserIcon className="w-6 h-6 text-muted-foreground" />
      <span className="text-base text-foreground">{email}</span>
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
};

export default UserStatus;
