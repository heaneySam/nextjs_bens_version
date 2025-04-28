import { Suspense } from 'react';
import ConfirmClient from '@/components/ConfirmClient';

export default function ConfirmPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Confirming your login...</p>}>
      <ConfirmClient />
    </Suspense>
  );
} 