/**
 * Request a magic link for login. Triggers the backend to send a magic link to the user's email.
 * @param email The user's email address
 * @returns The backend response (usually a detail message)
 */
export async function login(email: string): Promise<{ detail: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/code/request/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });
  return await res.json();
}

/**
 * Log out the current user by clearing authentication cookies on the backend.
 * @returns void
 */
export async function logout(): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout/`, {
    method: 'POST',
    credentials: 'include',
  });
}

/**
 * Silently refresh the access token using the refresh token in the cookie.
 * @returns void
 */
export async function refreshToken(): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/token/refresh/`, {
    method: 'POST',
    credentials: 'include',
  });
}
