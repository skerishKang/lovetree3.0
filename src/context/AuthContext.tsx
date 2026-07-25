import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef, type ReactNode } from "react";
import { onIdTokenChanged, type User } from "firebase/auth";
import { ensureFirebaseAuthReady, signOutFirebase } from "../api/auth";
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

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    let isMounted = true;

    ensureFirebaseAuthReady()
      .then((auth) => {
        if (!active || !isMounted) {
          return;
        }

        unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
          const callbackGeneration = ++callbackGenerationRef.current;

          if (!firebaseUser) {
            if (active && isMounted && callbackGeneration === callbackGenerationRef.current) {
              setUser(null);
              setTier(null);
              setLoading(false);
            }
            return;
          }

          const authUser = mapFirebaseUserToAuthUser(firebaseUser);
          const userTier = await extractTierFromUser(firebaseUser);

          if (active && isMounted && callbackGeneration === callbackGenerationRef.current) {
            setUser(authUser);
            setTier(userTier);
            setLoading(false);
          }
        });
      })
      .catch(() => {
        if (active && isMounted) {
          setUser(null);
          setTier(null);
          setLoading(false);
        }
      });

    return () => {
      active = false;
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signOut = useCallback(async () => {
    await signOutFirebase();
    callbackGenerationRef.current += 1;
    setUser(null);
    setTier(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      tier,
      signOut,
    }),
    [user, loading, tier, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue | null {
  return useContext(AuthContext);
}
