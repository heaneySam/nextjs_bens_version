export type AuthResponse = { user: unknown | null };

export async function auth(): Promise<AuthResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/session/`,
    { cache: 'no-store', credentials: 'include' }
  );
  if (!res.ok) {
    return { user: null };
  }
  const data = (await res.json()) as AuthResponse;
  return data;
} 