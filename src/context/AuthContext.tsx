import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { onIdTokenChanged, type User } from "firebase/auth";
import * as authApi from "../api/auth";
import type { AuthUser, AuthTier, AuthContextValue } from "../types/auth";

const AuthContext = createContext<AuthContextValue | null>(null);

function mapFirebaseUserToAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
}

async function extractTierFromUser(user: User): Promise<AuthTier> {
  try {
    const tokenResult = await user.getIdTokenResult();
    const tier = tokenResult.claims.tier;
    if (typeof tier === "string") {
      return tier;
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<AuthTier>(null);
  const callbackGenerationRef = useRef(0);

  const clearAuthState = useCallback(() => {
    callbackGenerationRef.current += 1;
    setUser(null);
    setTier(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    authApi
      .ensureFirebaseAuthReady()
      .then((auth) => {
        if (!active) {
          return;
        }

        unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
          const callbackGeneration = ++callbackGenerationRef.current;

          if (!firebaseUser) {
            if (active && callbackGeneration === callbackGenerationRef.current) {
              setUser(null);
              setTier(null);
              setLoading(false);
            }
            return;
          }

          const authUser = mapFirebaseUserToAuthUser(firebaseUser);
          const userTier = await extractTierFromUser(firebaseUser);

          if (active && callbackGeneration === callbackGenerationRef.current) {
            setUser(authUser);
            setTier(userTier);
            setLoading(false);
          }
        });
      })
      .catch(() => {
        if (active) {
          clearAuthState();
        }
      });

    return () => {
      active = false;
      callbackGenerationRef.current += 1;
      unsubscribe?.();
    };
  }, [clearAuthState]);

  const signInWithGoogle = useCallback(async () => {
    await authApi.signInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    await authApi.signOutFirebase();
    clearAuthState();
  }, [clearAuthState]);

  const expireSession = useCallback(async () => {
    try {
      await authApi.signOutFirebase();
    } catch {
      // A persistent unauthorized response already means the session is unusable.
      // The application state must still be cleared to prevent a redirect loop.
    } finally {
      clearAuthState();
    }
  }, [clearAuthState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      tier,
      signInWithGoogle,
      signOut,
      expireSession,
    }),
    [user, loading, tier, signInWithGoogle, signOut, expireSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue | null {
  return useContext(AuthContext);
}
