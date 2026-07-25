import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, type Auth } from "firebase/auth";
import type { AccessTokenProvider } from "../types/api";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
}

function getFirebaseConfig(): FirebaseConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim();
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
  const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim();

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  const config: FirebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    appId,
  };

  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim();
  if (storageBucket) {
    config.storageBucket = storageBucket;
  }

  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim();
  if (messagingSenderId) {
    config.messagingSenderId = messagingSenderId;
  }

  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.trim();
  if (measurementId) {
    config.measurementId = measurementId;
  }

  return config;
}

export function getFirebaseAuthConfigStatus(): {
  configured: boolean;
  missingKeys: readonly string[];
} {
  const missingKeys: string[] = [];

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim();
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
  const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim();

  if (!apiKey) {
    missingKeys.push("VITE_FIREBASE_API_KEY");
  }
  if (!authDomain) {
    missingKeys.push("VITE_FIREBASE_AUTH_DOMAIN");
  }
  if (!projectId) {
    missingKeys.push("VITE_FIREBASE_PROJECT_ID");
  }
  if (!appId) {
    missingKeys.push("VITE_FIREBASE_APP_ID");
  }

  return {
    configured: missingKeys.length === 0,
    missingKeys: Object.freeze(missingKeys),
  };
}

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let authReadyPromise: Promise<Auth> | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseApp = getApp();
    return firebaseApp;
  }

  const config = getFirebaseConfig();
  if (!config) {
    const status = getFirebaseAuthConfigStatus();
    throw new Error(
      `Firebase configuration incomplete. Missing required keys: ${status.missingKeys.join(", ")}`
    );
  }

  firebaseApp = initializeApp(config);
  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  if (firebaseAuth) {
    return firebaseAuth;
  }

  const app = getFirebaseApp();
  firebaseAuth = getAuth(app);
  return firebaseAuth;
}

export function ensureFirebaseAuthReady(): Promise<Auth> {
  if (authReadyPromise) {
    return authReadyPromise;
  }

  const auth = getFirebaseAuth();
  authReadyPromise = setPersistence(auth, browserLocalPersistence)
    .then(() => auth)
    .catch((error) => {
      authReadyPromise = null;
      throw new Error(
        `Firebase persistence setup failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    });

  return authReadyPromise;
}

export const firebaseAccessTokenProvider: AccessTokenProvider = {
  async getAccessToken(options?: { forceRefresh?: boolean }): Promise<string | null> {
    const auth = await ensureFirebaseAuthReady();
    const user = auth.currentUser;

    if (!user) {
      return null;
    }

    const token = await user.getIdToken(options?.forceRefresh === true);

    if (!token || token.length === 0) {
      throw new Error("Firebase returned empty token");
    }

    if (/[\r\n]/.test(token)) {
      throw new Error("Firebase returned token with CR/LF characters");
    }

    return token;
  },
};

export async function signOutFirebase(): Promise<void> {
  const auth = await ensureFirebaseAuthReady();
  const { signOut } = await import("firebase/auth");
  await signOut(auth);
}
