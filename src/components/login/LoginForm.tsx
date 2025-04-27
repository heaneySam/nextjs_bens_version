// Create a simple client-side login form for magic-link
'use client';

import React, { useState } from 'react';
import SubmitButton from '@/components/login/SubmitButton';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/code/request/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      setMessage(
        data.detail ||
          "If that email is registered, you'll receive a magic link shortly."
      );
    } catch (err) {
      console.error('Error requesting magic link:', err);
      setMessage('Error requesting magic link. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded-lg shadow-md w-full space-y-6 text-left"
    >
      <h2 className="text-xl font-semibold">Sign in with Magic Link</h2>
      <label htmlFor="email" className="block text-sm font-medium">
        Email
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <SubmitButton isLoading={isLoading} />
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </form>
  );
} 