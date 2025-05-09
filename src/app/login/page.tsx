import { Suspense } from "react";
import ClientHomeWrapper from "@/components/auth/LoginContainer.client";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientHomeWrapper />
    </Suspense>
  );
}
