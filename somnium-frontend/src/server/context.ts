import { type User } from "@/lib/validations/auth";

export interface Context {
  user: User | null;
  token: string | null;
  headers: Headers;
}

export async function createContext(opts: {
  headers: Headers;
}): Promise<Context> {
  const authHeader = opts.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "") ?? null;

  if (!token) {
    return { user: null, token: null, headers: opts.headers };
  }

  // Validate token with backend
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return { user: null, token: null, headers: opts.headers };
    }

    const user = await res.json();
    return { user, token, headers: opts.headers };
  } catch {
    return { user: null, token: null, headers: opts.headers };
  }
}
