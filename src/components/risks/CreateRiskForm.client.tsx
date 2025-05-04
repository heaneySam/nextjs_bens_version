'use client';

import { useState, FormEvent, useEffect } from 'react';

export default function CreateRiskForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [riskClass, setRiskClass] = useState<string>('');
  const [riskClasses, setRiskClasses] = useState<string[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!riskClass) {
      setError('Please select a risk class');
      return;
    }
    setIsLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/risks/${riskClass}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create risk');
      }
      const data = await res.json();
      setMessage(`Created Risk: ${data.id}`);
      setName('');
      setDescription('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch risk classes for dropdown
  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch('/api/risks');
        if (!res.ok) throw new Error('Could not load risk classes');
        const json = await res.json();
        setRiskClasses(json.risk_classes || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchClasses();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-background/5 rounded-lg shadow-md mb-6 max-w-md">
      <h2 className="text-lg font-semibold mb-4">Create a New Risk</h2>
      <div className="mb-4">
        <label htmlFor="risk-class" className="block text-sm font-medium text-foreground">
          Risk Class
        </label>
        <select
          id="risk-class"
          value={riskClass}
          onChange={(e) => setRiskClass(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          required
        >
          <option value="" disabled>Select class...</option>
          {riskClasses.map((cls) => (
            <option key={cls} value={cls}>{cls.replace('-', ' ')}</option>
          ))}
        </select>
      </div>
      {message && <p className="text-green-600 mb-2">{message}</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <div className="mb-4">
        <label htmlFor="risk-name" className="block text-sm font-medium text-foreground">Name</label>
        <input
          id="risk-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="risk-description" className="block text-sm font-medium text-foreground">Description</label>
        <textarea
          id="risk-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          rows={3}
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-primary text-white rounded-md"
      >
        {isLoading ? 'Creating...' : 'Create Risk'}
      </button>
    </form>
  );
} 