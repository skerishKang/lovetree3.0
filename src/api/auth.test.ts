import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import authSource from "./auth.ts?raw";
import * as firebaseApp from "firebase/app";
import * as firebaseAuth from "firebase/auth";

const firebaseAuthMocks = vi.hoisted(() => ({
  GoogleAuthProvider: vi.fn(function GoogleAuthProviderMock() {}),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(),
  getApp: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
  setPersistence: vi.fn(),
  browserLocalPersistence: { type: "LOCAL" },
  GoogleAuthProvider: firebaseAuthMocks.GoogleAuthProvider,
  signInWithPopup: firebaseAuthMocks.signInWithPopup,
  signOut: firebaseAuthMocks.signOut,
}));

function stubConfiguredEnv() {
  vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
  vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
  vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
  vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");
}

function setupFirebaseAuth(currentUser: unknown = null) {
  const app = { name: "[DEFAULT]" };
  const auth = { currentUser };

  vi.mocked(firebaseApp.getApps).mockReturnValue([]);
  vi.mocked(firebaseApp.initializeApp).mockReturnValue(app as never);
  vi.mocked(firebaseAuth.getAuth).mockReturnValue(auth as never);
  vi.mocked(firebaseAuth.setPersistence).mockResolvedValue(undefined);

  return { app, auth };
}

describe("Firebase auth module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe("configuration and initialization", () => {
    it("reports configured only when all required values exist", async () => {
      stubConfiguredEnv();
      const { getFirebaseAuthConfigStatus } = await import("./auth");
      expect(getFirebaseAuthConfigStatus()).toEqual({
        configured: true,
        missingKeys: [],
      });
    });

    it("treats empty required values as missing without exposing values", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "  ");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "secret.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "secret-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "secret-app-id");

      const { getFirebaseAuthConfigStatus } = await import("./auth");
      const status = getFirebaseAuthConfigStatus();
      const serialized = JSON.stringify(status);

      expect(status.configured).toBe(false);
      expect(status.missingKeys).toContain("VITE_FIREBASE_API_KEY");
      expect(serialized).not.toContain("secret.firebaseapp.com");
      expect(serialized).not.toContain("secret-project");
      expect(serialized).not.toContain("secret-app-id");
    });

    it("imports safely without build configuration", async () => {
      await expect(import("./auth")).resolves.toBeDefined();
    });

    it("initializes app and auth at most once", async () => {
      stubConfiguredEnv();
      const { auth } = setupFirebaseAuth();

      const { getFirebaseApp, getFirebaseAuth } = await import("./auth");
      expect(getFirebaseApp()).toBe(getFirebaseApp());
      expect(getFirebaseAuth()).toBe(auth);
      expect(getFirebaseAuth()).toBe(auth);
      expect(firebaseApp.initializeApp).toHaveBeenCalledTimes(1);
      expect(firebaseAuth.getAuth).toHaveBeenCalledTimes(1);
    });

    it("reuses an existing Firebase app", async () => {
      stubConfiguredEnv();
      const app = { name: "[DEFAULT]" };
      vi.mocked(firebaseApp.getApps).mockReturnValue([app as never]);
      vi.mocked(firebaseApp.getApp).mockReturnValue(app as never);

      const { getFirebaseApp } = await import("./auth");
      expect(getFirebaseApp()).toBe(app);
      expect(firebaseApp.initializeApp).not.toHaveBeenCalled();
    });

    it("uses browserLocalPersistence and shares one readiness promise", async () => {
      stubConfiguredEnv();
      const { auth } = setupFirebaseAuth();
      let resolvePersistence: () => void = () => undefined;
      vi.mocked(firebaseAuth.setPersistence).mockReturnValue(
        new Promise<void>((resolve) => {
          resolvePersistence = resolve;
        })
      );

      const { ensureFirebaseAuthReady } = await import("./auth");
      const first = ensureFirebaseAuthReady();
      const second = ensureFirebaseAuthReady();

      expect(first).toBe(second);
      expect(firebaseAuth.setPersistence).toHaveBeenCalledWith(
        auth,
        firebaseAuth.browserLocalPersistence
      );
      expect(firebaseAuth.setPersistence).toHaveBeenCalledTimes(1);

      resolvePersistence();
      await first;
    });

    it("bounds persistence failures and caches the rejection", async () => {
      stubConfiguredEnv();
      setupFirebaseAuth();
      vi.mocked(firebaseAuth.setPersistence).mockRejectedValue(
        new Error("SECRET_INTERNAL_FIREBASE_ERROR")
      );

      const { ensureFirebaseAuthReady } = await import("./auth");
      const first = ensureFirebaseAuthReady();
      const error = await first.catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe(
        "Firebase authentication persistence initialization failed"
      );
      expect((error as Error).message).not.toContain("SECRET_INTERNAL_FIREBASE_ERROR");
      await expect(ensureFirebaseAuthReady()).rejects.toThrow(
        "Firebase authentication persistence initialization failed"
      );
      expect(firebaseAuth.setPersistence).toHaveBeenCalledTimes(1);
    });
  });

  describe("Google popup sign-in", () => {
    it("uses one provider and one popup after auth readiness", async () => {
      stubConfiguredEnv();
      const { auth } = setupFirebaseAuth();
      firebaseAuthMocks.signInWithPopup.mockResolvedValue({ user: { uid: "u1" } });

      const { signInWithGoogle } = await import("./auth");
      await signInWithGoogle();

      expect(firebaseAuth.setPersistence).toHaveBeenCalledTimes(1);
      expect(firebaseAuthMocks.GoogleAuthProvider).toHaveBeenCalledTimes(1);
      expect(firebaseAuthMocks.signInWithPopup).toHaveBeenCalledTimes(1);
      expect(firebaseAuthMocks.signInWithPopup).toHaveBeenCalledWith(
        auth,
        expect.anything()
      );
    });

    it("does not call popup when configuration is missing", async () => {
      const { signInWithGoogle } = await import("./auth");

      await expect(signInWithGoogle()).rejects.toMatchObject({
        reason: "config-unavailable",
      });
      expect(firebaseAuthMocks.GoogleAuthProvider).not.toHaveBeenCalled();
      expect(firebaseAuthMocks.signInWithPopup).not.toHaveBeenCalled();
    });

    it.each([
      ["auth/popup-closed-by-user", "popup-closed"],
      ["auth/cancelled-popup-request", "popup-cancelled"],
      ["auth/popup-blocked", "popup-blocked"],
      ["auth/invalid-api-key", "config-unavailable"],
      ["auth/operation-not-allowed", "config-unavailable"],
      ["auth/internal-error", "auth-failed"],
    ])("maps %s to bounded reason %s", async (code, reason) => {
      stubConfiguredEnv();
      setupFirebaseAuth();
      firebaseAuthMocks.signInWithPopup.mockRejectedValue({
        code,
        message: "RAW_FIREBASE_SECRET_DETAIL",
      });

      const { signInWithGoogle } = await import("./auth");
      const error = await signInWithGoogle().catch((caught: unknown) => caught);

      expect(error).toMatchObject({
        name: "GoogleSignInError",
        reason,
        message: "Google sign-in could not be completed",
      });
      expect(JSON.stringify(error)).not.toContain("RAW_FIREBASE_SECRET_DETAIL");
    });

    it("does not create token or credential cache from popup result", async () => {
      stubConfiguredEnv();
      setupFirebaseAuth();
      const storageSet = vi.spyOn(Storage.prototype, "setItem");
      firebaseAuthMocks.signInWithPopup.mockResolvedValue({
        user: { uid: "u1", accessToken: "raw-token" },
        credential: { accessToken: "credential-token" },
      });

      const { signInWithGoogle } = await import("./auth");
      const result = await signInWithGoogle();

      expect(result).toBeUndefined();
      expect(storageSet).not.toHaveBeenCalled();
    });
  });

  describe("access token provider", () => {
    it("returns null when signed out", async () => {
      stubConfiguredEnv();
      setupFirebaseAuth(null);

      const { firebaseAccessTokenProvider } = await import("./auth");
      await expect(firebaseAccessTokenProvider.getAccessToken()).resolves.toBeNull();
    });

    it("requests fresh tokens on every call and supports force refresh", async () => {
      stubConfiguredEnv();
      const user = {
        getIdToken: vi
          .fn()
          .mockResolvedValueOnce("token-1")
          .mockResolvedValueOnce("token-2"),
      };
      setupFirebaseAuth(user);

      const { firebaseAccessTokenProvider } = await import("./auth");
      await expect(firebaseAccessTokenProvider.getAccessToken()).resolves.toBe("token-1");
      await expect(
        firebaseAccessTokenProvider.getAccessToken({ forceRefresh: true })
      ).resolves.toBe("token-2");

      expect(user.getIdToken).toHaveBeenNthCalledWith(1, false);
      expect(user.getIdToken).toHaveBeenNthCalledWith(2, true);
    });

    it.each(["", "token\nwith-newline", "token\rwith-return"])(
      "rejects unsafe token value",
      async (token) => {
        stubConfiguredEnv();
        setupFirebaseAuth({ getIdToken: vi.fn().mockResolvedValue(token) });

        const { firebaseAccessTokenProvider } = await import("./auth");
        await expect(firebaseAccessTokenProvider.getAccessToken()).rejects.toThrow();
      }
    );
  });

  describe("sign-out and source security", () => {
    it("waits for readiness and signs out the current auth instance", async () => {
      stubConfiguredEnv();
      const { auth } = setupFirebaseAuth();
      firebaseAuthMocks.signOut.mockResolvedValue(undefined);

      const { signOutFirebase } = await import("./auth");
      await signOutFirebase();

      expect(firebaseAuthMocks.signOut).toHaveBeenCalledWith(auth);
    });

    it("does not add LoveTree-owned storage or unrelated Firebase products", () => {
      expect(authSource).not.toContain("localStorage");
      expect(authSource).not.toContain("sessionStorage");
      expect(authSource).not.toContain("document.cookie");
      expect(authSource).not.toContain("firebase/compat");
      expect(authSource).not.toContain("firebase/analytics");
      expect(authSource).not.toContain("firebase/firestore");
    });
  });
});
