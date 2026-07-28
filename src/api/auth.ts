import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type Auth,
} from "firebase/auth";
import type { AccessTokenProvider } from "../types/api";
import {
  hasValidEmailShape,
  hasValidPasswordLength,
  normalizeEmailInput,
} from "../utils/emailAuthValidation";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
}

export type GoogleSignInFailureReason =
  | "popup-closed"
  | "popup-cancelled"
  | "popup-blocked"
  | "config-unavailable"
  | "auth-failed";

export class GoogleSignInError extends Error {
  readonly reason: GoogleSignInFailureReason;

  constructor(reason: GoogleSignInFailureReason) {
    super("Google sign-in could not be completed");
    this.name = "GoogleSignInError";
    this.reason = reason;
  }
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

  try {
    const auth = getFirebaseAuth();
    authReadyPromise = setPersistence(auth, browserLocalPersistence)
      .then(() => auth)
      .catch(() => {
        throw new Error("Firebase authentication persistence initialization failed");
      });
  } catch {
    authReadyPromise = Promise.reject(
      new Error("Firebase authentication persistence initialization failed")
    );
  }

  return authReadyPromise;
}

function readFirebaseErrorCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return null;
}

function classifyGoogleSignInError(error: unknown): GoogleSignInFailureReason {
  const code = readFirebaseErrorCode(error);

  switch (code) {
    case "auth/popup-closed-by-user":
      return "popup-closed";
    case "auth/cancelled-popup-request":
      return "popup-cancelled";
    case "auth/popup-blocked":
      return "popup-blocked";
    case "auth/invalid-api-key":
    case "auth/invalid-auth-domain":
    case "auth/configuration-not-found":
    case "auth/operation-not-allowed":
      return "config-unavailable";
    default:
      return "auth-failed";
  }
}

export async function signInWithGoogle(): Promise<void> {
  if (!getFirebaseAuthConfigStatus().configured) {
    throw new GoogleSignInError("config-unavailable");
  }

  try {
    const auth = await ensureFirebaseAuthReady();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (error) {
    if (error instanceof GoogleSignInError) {
      throw error;
    }

    throw new GoogleSignInError(classifyGoogleSignInError(error));
  }
}

export type EmailAuthFailureReason =
  | "invalid-email"
  | "empty-password"
  | "input-too-long"
  | "user-not-found"
  | "wrong-password"
  | "invalid-credential"
  | "email-already-in-use"
  | "weak-password"
  | "too-many-requests"
  | "network-request-failed"
  | "operation-not-allowed"
  | "config-unavailable"
  | "auth-failed";

export class EmailAuthError extends Error {
  readonly reason: EmailAuthFailureReason;

  constructor(reason: EmailAuthFailureReason) {
    super("Email authentication could not be completed");
    this.name = "EmailAuthError";
    this.reason = reason;
  }
}

function classifyEmailAuthError(error: unknown): EmailAuthFailureReason {
  const code = readFirebaseErrorCode(error);

  switch (code) {
    case "auth/invalid-email":
      return "invalid-email";
    case "auth/user-not-found":
      return "user-not-found";
    case "auth/wrong-password":
      return "wrong-password";
    case "auth/invalid-credential":
      return "invalid-credential";
    case "auth/email-already-in-use":
      return "email-already-in-use";
    case "auth/weak-password":
      return "weak-password";
    case "auth/too-many-requests":
      return "too-many-requests";
    case "auth/network-request-failed":
      return "network-request-failed";
    case "auth/operation-not-allowed":
      return "operation-not-allowed";
    default:
      return "auth-failed";
  }
}

function assertEmailAuthInput(email: string, password: string): void {
  if (!hasValidEmailShape(email)) {
    throw new EmailAuthError("invalid-email");
  }

  if (password.length === 0) {
    throw new EmailAuthError("empty-password");
  }

  if (!hasValidPasswordLength(password)) {
    throw new EmailAuthError("input-too-long");
  }
}

async function runEmailAuthAction(
  action: (auth: Auth, email: string, password: string) => Promise<unknown>,
  email: string,
  password: string
): Promise<void> {
  assertEmailAuthInput(email, password);

  if (!getFirebaseAuthConfigStatus().configured) {
    throw new EmailAuthError("config-unavailable");
  }

  try {
    const auth = await ensureFirebaseAuthReady();
    await action(auth, normalizeEmailInput(email), password);
  } catch (error) {
    if (error instanceof EmailAuthError) {
      throw error;
    }

    throw new EmailAuthError(classifyEmailAuthError(error));
  }
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  await runEmailAuthAction(
    (auth, normalizedEmail, rawPassword) =>
      signInWithEmailAndPassword(auth, normalizedEmail, rawPassword),
    email,
    password
  );
}

export async function signUpWithEmail(email: string, password: string): Promise<void> {
  await runEmailAuthAction(
    (auth, normalizedEmail, rawPassword) =>
      createUserWithEmailAndPassword(auth, normalizedEmail, rawPassword),
    email,
    password
  );
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
  await signOut(auth);
}
