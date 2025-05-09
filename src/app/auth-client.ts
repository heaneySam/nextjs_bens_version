/**
 * Request a magic link for login. Triggers the backend to send a magic link to the user's email.
 * @param email The user's email address
 * @returns The backend response (usually a detail message)
 */
export async function login(email: string): Promise<{ detail: string }> {
  // Only allow login for the authorized email
  const allowedEmails = ['heaney.sam@gmail.com', 'heaney.ben@gmail.com']; // <-- Add your new email here
  if (!allowedEmails.map(e => e.toLowerCase()).includes(email.toLowerCase())) {
    return { detail: 'This email is not authorized to log in.' };
  }
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
