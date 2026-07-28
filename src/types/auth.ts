export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export type AuthTier = string | null;

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  tier: AuthTier;
  signInWithGoogle(): Promise<void>;
  signInWithEmail(email: string, password: string): Promise<void>;
  signUpWithEmail(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  expireSession(): Promise<void>;
}

export function isAuthExemptPath(pathname: string): boolean {
  if (pathname === "/login") {
    return true;
  }
  if (pathname === "/community" || pathname === "/community/") {
    return true;
  }
  if (pathname.startsWith("/community/")) {
    return true;
  }
  return false;
}
