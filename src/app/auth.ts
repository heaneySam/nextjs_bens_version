export async function auth(): Promise<{ user?: any | null }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/session/`,
    { cache: 'no-store', credentials: 'include' }
  );
  if (!res.ok) {
    return { user: null };
  }
  const data = await res.json();
  return data;
} 