'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export default function SubmitButton({
  isLoading = false,
  children = 'Send Magic Link',
  ...props
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={isLoading} {...props}>
      {isLoading ? 'Sending…' : children}
    </Button>
  );
} 