// Create a simple client-side login form for magic-link
'use client';

import React, { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');

  const requestCode = async () => {
    console.log('Requesting magic link code for:', email);
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
      console.log('Request code response:', data);
      setMessage(data.detail || JSON.stringify(data));
    } catch (err) {
      console.error('Error requesting code:', err);
      setMessage('Error requesting code');
    }
  };

  const confirmCode = async () => {
    console.log('Confirming code for:', email, 'code:', code);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/code/confirm/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, code }),
        }
      );
      const data = await res.json();
      console.log('Confirm code response:', data);
      if (data.key) {
        setToken(data.key);
        setMessage('Login successful! Token received.');
      } else {
        setMessage('Login failed: ' + JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error confirming code:', err);
      setMessage('Error confirming code');
    }
  };

  return (
    <div className="p-4 border rounded max-w-md mx-auto">
      <h2 className="text-xl mb-4">Magic Link Login</h2>
      <div className="mb-4">
        <label className="block mb-1">Email:</label>
        <input
          className="w-full p-2 border rounded"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={requestCode}
        >
          Request Code
        </button>
      </div>
      <div className="mb-4">
        <label className="block mb-1">Code:</label>
        <input
          className="w-full p-2 border rounded"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
          onClick={confirmCode}
        >
          Confirm Code
        </button>
      </div>
      {message && <p className="mt-2 text-gray-700">{message}</p>}
      {token && (
        <pre className="mt-2 p-2 bg-gray-100 rounded break-all">{token}</pre>
      )}
    </div>
  );
} 