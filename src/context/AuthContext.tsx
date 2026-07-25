import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from "react";
import { onIdTokenChanged, type User } from "firebase/auth";
import { getFirebaseAuth, signOutFirebase } from "../api/auth";
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
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const auth = getFirebaseAuth();
    let currentGeneration = generation;

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      const thisGeneration = currentGeneration;

      if (!firebaseUser) {
        if (thisGeneration === generation) {
          setUser(null);
          setTier(null);
          setLoading(false);
        }
        return;
      }

      const authUser = mapFirebaseUserToAuthUser(firebaseUser);
      const userTier = await extractTierFromUser(firebaseUser);

      if (thisGeneration === generation) {
        setUser(authUser);
        setTier(userTier);
        setLoading(false);
      }
    });

    return () => {
      currentGeneration++;
      setGeneration(currentGeneration);
      unsubscribe();
    };
  }, [generation]);

  const signOut = useCallback(async () => {
    try {
      await signOutFirebase();
      setUser(null);
      setTier(null);
    } catch {
      // Do not create false logout state on failure
      // Firebase auth state remains unchanged
    }
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
