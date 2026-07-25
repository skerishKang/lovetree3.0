import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as firebaseApp from "firebase/app";
import * as firebaseAuth from "firebase/auth";

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(),
  getApp: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
  setPersistence: vi.fn(),
  browserLocalPersistence: {},
  signOut: vi.fn(),
}));

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

  describe("getFirebaseAuthConfigStatus", () => {
    it("returns configured true when all required env present", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const { getFirebaseAuthConfigStatus } = await import("./auth");
      const status = getFirebaseAuthConfigStatus();

      expect(status.configured).toBe(true);
      expect(status.missingKeys).toEqual([]);
    });

    it("returns configured false when VITE_FIREBASE_API_KEY missing", async () => {
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const { getFirebaseAuthConfigStatus } = await import("./auth");
      const status = getFirebaseAuthConfigStatus();

      expect(status.configured).toBe(false);
      expect(status.missingKeys).toContain("VITE_FIREBASE_API_KEY");
    });

    it("returns configured false when VITE_FIREBASE_AUTH_DOMAIN missing", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const { getFirebaseAuthConfigStatus } = await import("./auth");
      const status = getFirebaseAuthConfigStatus();

      expect(status.configured).toBe(false);
      expect(status.missingKeys).toContain("VITE_FIREBASE_AUTH_DOMAIN");
    });

    it("returns configured false when VITE_FIREBASE_PROJECT_ID missing", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const { getFirebaseAuthConfigStatus } = await import("./auth");
      const status = getFirebaseAuthConfigStatus();

      expect(status.configured).toBe(false);
      expect(status.missingKeys).toContain("VITE_FIREBASE_PROJECT_ID");
    });

    it("returns configured false when VITE_FIREBASE_APP_ID missing", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");

      const { getFirebaseAuthConfigStatus } = await import("./auth");
      const status = getFirebaseAuthConfigStatus();

      expect(status.configured).toBe(false);
      expect(status.missingKeys).toContain("VITE_FIREBASE_APP_ID");
    });

    it("allows optional keys missing", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const { getFirebaseAuthConfigStatus } = await import("./auth");
      const status = getFirebaseAuthConfigStatus();

      expect(status.configured).toBe(true);
      expect(status.missingKeys).toEqual([]);
    });

    it("does not expose env values in error messages", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "secret-key-12345");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "secret.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "secret-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "secret-app-id");

      const { getFirebaseAuthConfigStatus } = await import("./auth");
      const status = getFirebaseAuthConfigStatus();

      const statusString = JSON.stringify(status);
      expect(statusString).not.toContain("secret-key-12345");
      expect(statusString).not.toContain("secret.firebaseapp.com");
      expect(statusString).not.toContain("secret-project");
      expect(statusString).not.toContain("secret-app-id");
    });
  });

  describe("getFirebaseApp", () => {
    it("initializes app max 1 time", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const mockApp = { name: "[DEFAULT]" };
      vi.mocked(firebaseApp.getApps).mockReturnValue([]);
      vi.mocked(firebaseApp.initializeApp).mockReturnValue(mockApp as any);

      const { getFirebaseApp } = await import("./auth");
      const app1 = getFirebaseApp();
      const app2 = getFirebaseApp();

      expect(firebaseApp.initializeApp).toHaveBeenCalledTimes(1);
      expect(app1).toBe(app2);
    });

    it("reuses existing app", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const mockApp = { name: "[DEFAULT]" };
      vi.mocked(firebaseApp.getApps).mockReturnValue([mockApp as any]);
      vi.mocked(firebaseApp.getApp).mockReturnValue(mockApp as any);

      const { getFirebaseApp } = await import("./auth");
      const app = getFirebaseApp();

      expect(firebaseApp.initializeApp).not.toHaveBeenCalled();
      expect(firebaseApp.getApp).toHaveBeenCalled();
      expect(app).toBe(mockApp);
    });

    it("throws bounded config error when required env missing", async () => {
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      vi.mocked(firebaseApp.getApps).mockReturnValue([]);

      const { getFirebaseApp } = await import("./auth");

      expect(() => getFirebaseApp()).toThrow(/Firebase configuration incomplete/);
      expect(() => getFirebaseApp()).toThrow(/VITE_FIREBASE_API_KEY/);
    });

    it("does not throw on module import when env missing", async () => {
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      await expect(import("./auth")).resolves.toBeDefined();
    });
  });

  describe("getFirebaseAuth", () => {
    it("reuses Auth instance", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const mockApp = { name: "[DEFAULT]" };
      const mockAuth = { currentUser: null };
      vi.mocked(firebaseApp.getApps).mockReturnValue([]);
      vi.mocked(firebaseApp.initializeApp).mockReturnValue(mockApp as any);
      vi.mocked(firebaseAuth.getAuth).mockReturnValue(mockAuth as any);
      vi.mocked(firebaseAuth.setPersistence).mockResolvedValue(undefined);

      const { getFirebaseAuth } = await import("./auth");
      const auth1 = getFirebaseAuth();
      const auth2 = getFirebaseAuth();

      expect(firebaseAuth.getAuth).toHaveBeenCalledTimes(1);
      expect(auth1).toBe(auth2);
    });

    it("sets persistence max 1 time", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const mockApp = { name: "[DEFAULT]" };
      const mockAuth = { currentUser: null };
      vi.mocked(firebaseApp.getApps).mockReturnValue([]);
      vi.mocked(firebaseApp.initializeApp).mockReturnValue(mockApp as any);
      vi.mocked(firebaseAuth.getAuth).mockReturnValue(mockAuth as any);
      vi.mocked(firebaseAuth.setPersistence).mockResolvedValue(undefined);

      const { ensureFirebaseAuthReady } = await import("./auth");
      await ensureFirebaseAuthReady();
      await ensureFirebaseAuthReady();

      expect(firebaseAuth.setPersistence).toHaveBeenCalledTimes(1);
    });

    it("uses browserLocalPersistence", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const mockApp = { name: "[DEFAULT]" };
      const mockAuth = { currentUser: null };
      vi.mocked(firebaseApp.getApps).mockReturnValue([]);
      vi.mocked(firebaseApp.initializeApp).mockReturnValue(mockApp as any);
      vi.mocked(firebaseAuth.getAuth).mockReturnValue(mockAuth as any);
      vi.mocked(firebaseAuth.setPersistence).mockResolvedValue(undefined);

      const { ensureFirebaseAuthReady } = await import("./auth");
      await ensureFirebaseAuthReady();

      expect(firebaseAuth.setPersistence).toHaveBeenCalledWith(
        mockAuth,
        firebaseAuth.browserLocalPersistence
      );
    });
  });

  describe("firebaseAccessTokenProvider", () => {
    it("returns null when no currentUser", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const mockApp = { name: "[DEFAULT]" };
      const mockAuth = { currentUser: null };
      vi.mocked(firebaseApp.getApps).mockReturnValue([]);
      vi.mocked(firebaseApp.initializeApp).mockReturnValue(mockApp as any);
      vi.mocked(firebaseAuth.getAuth).mockReturnValue(mockAuth as any);
      vi.mocked(firebaseAuth.setPersistence).mockResolvedValue(undefined);

      const { firebaseAccessTokenProvider } = await import("./auth");
      const token = await firebaseAccessTokenProvider.getAccessToken();

      expect(token).toBeNull();
    });

    it("calls getIdToken(false) for normal token", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const mockUser = {
        getIdToken: vi.fn().mockResolvedValue("test-token"),
      };
      const mockApp = { name: "[DEFAULT]" };
      const mockAuth = { currentUser: mockUser };
      vi.mocked(firebaseApp.getApps).mockReturnValue([]);
      vi.mocked(firebaseApp.initializeApp).mockReturnValue(mockApp as any);
      vi.mocked(firebaseAuth.getAuth).mockReturnValue(mockAuth as any);
      vi.mocked(firebaseAuth.setPersistence).mockResolvedValue(undefined);

      const { firebaseAccessTokenProvider } = await import("./auth");
      const token = await firebaseAccessTokenProvider.getAccessToken();

      expect(mockUser.getIdToken).toHaveBeenCalledWith(false);
      expect(token).toBe("test-token");
    });

    it("calls getIdToken(true) for force refresh", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const mockUser = {
        getIdToken: vi.fn().mockResolvedValue("refreshed-token"),
      };
      const mockApp = { name: "[DEFAULT]" };
      const mockAuth = { currentUser: mockUser };
      vi.mocked(firebaseApp.getApps).mockReturnValue([]);
      vi.mocked(firebaseApp.initializeApp).mockReturnValue(mockApp as any);
      vi.mocked(firebaseAuth.getAuth).mockReturnValue(mockAuth as any);
      vi.mocked(firebaseAuth.setPersistence).mockResolvedValue(undefined);

      const { firebaseAccessTokenProvider } = await import("./auth");
      const token = await firebaseAccessTokenProvider.getAccessToken({ forceRefresh: true });

      expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
      expect(token).toBe("refreshed-token");
    });

    it("propagates getIdToken throw", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const mockUser = {
        getIdToken: vi.fn().mockRejectedValue(new Error("Token error")),
      };
      const mockApp = { name: "[DEFAULT]" };
      const mockAuth = { currentUser: mockUser };
      vi.mocked(firebaseApp.getApps).mockReturnValue([]);
      vi.mocked(firebaseApp.initializeApp).mockReturnValue(mockApp as any);
      vi.mocked(firebaseAuth.getAuth).mockReturnValue(mockAuth as any);
      vi.mocked(firebaseAuth.setPersistence).mockResolvedValue(undefined);

      const { firebaseAccessTokenProvider } = await import("./auth");

      await expect(firebaseAccessTokenProvider.getAccessToken()).rejects.toThrow("Token error");
    });

    it("rejects empty token", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const mockUser = {
        getIdToken: vi.fn().mockResolvedValue(""),
      };
      const mockApp = { name: "[DEFAULT]" };
      const mockAuth = { currentUser: mockUser };
      vi.mocked(firebaseApp.getApps).mockReturnValue([]);
      vi.mocked(firebaseApp.initializeApp).mockReturnValue(mockApp as any);
      vi.mocked(firebaseAuth.getAuth).mockReturnValue(mockAuth as any);
      vi.mocked(firebaseAuth.setPersistence).mockResolvedValue(undefined);

      const { firebaseAccessTokenProvider } = await import("./auth");

      await expect(firebaseAccessTokenProvider.getAccessToken()).rejects.toThrow(/empty token/);
    });

    it("rejects CR/LF token", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const mockUser = {
        getIdToken: vi.fn().mockResolvedValue("token\nwith\nnewlines"),
      };
      const mockApp = { name: "[DEFAULT]" };
      const mockAuth = { currentUser: mockUser };
      vi.mocked(firebaseApp.getApps).mockReturnValue([]);
      vi.mocked(firebaseApp.initializeApp).mockReturnValue(mockApp as any);
      vi.mocked(firebaseAuth.getAuth).mockReturnValue(mockAuth as any);
      vi.mocked(firebaseAuth.setPersistence).mockResolvedValue(undefined);

      const { firebaseAccessTokenProvider } = await import("./auth");

      await expect(firebaseAccessTokenProvider.getAccessToken()).rejects.toThrow(/CR\/LF/);
    });

    it("does not cache token", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const mockUser = {
        getIdToken: vi.fn()
          .mockResolvedValueOnce("token-1")
          .mockResolvedValueOnce("token-2"),
      };
      const mockApp = { name: "[DEFAULT]" };
      const mockAuth = { currentUser: mockUser };
      vi.mocked(firebaseApp.getApps).mockReturnValue([]);
      vi.mocked(firebaseApp.initializeApp).mockReturnValue(mockApp as any);
      vi.mocked(firebaseAuth.getAuth).mockReturnValue(mockAuth as any);
      vi.mocked(firebaseAuth.setPersistence).mockResolvedValue(undefined);

      const { firebaseAccessTokenProvider } = await import("./auth");
      const token1 = await firebaseAccessTokenProvider.getAccessToken();
      const token2 = await firebaseAccessTokenProvider.getAccessToken();

      expect(mockUser.getIdToken).toHaveBeenCalledTimes(2);
      expect(token1).toBe("token-1");
      expect(token2).toBe("token-2");
    });
  });

  describe("signOutFirebase", () => {
    it("calls Firebase signOut", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const mockApp = { name: "[DEFAULT]" };
      const mockAuth = { currentUser: null };
      vi.mocked(firebaseApp.getApps).mockReturnValue([]);
      vi.mocked(firebaseApp.initializeApp).mockReturnValue(mockApp as any);
      vi.mocked(firebaseAuth.getAuth).mockReturnValue(mockAuth as any);
      vi.mocked(firebaseAuth.setPersistence).mockResolvedValue(undefined);
      vi.mocked(firebaseAuth.signOut).mockResolvedValue(undefined);

      const { signOutFirebase } = await import("./auth");
      await signOutFirebase();

      expect(firebaseAuth.signOut).toHaveBeenCalledWith(mockAuth);
    });
  });

  describe("no forbidden imports", () => {
    it("does not import compat/analytics/firestore", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const authPath = path.join(process.cwd(), "src/api/auth.ts");
      const authSource = fs.readFileSync(authPath, "utf-8");

      expect(authSource).not.toContain("firebase/compat");
      expect(authSource).not.toContain("firebase/analytics");
      expect(authSource).not.toContain("firebase/firestore");
    });
  });

  describe("controlled persistence tests", () => {
    it("concurrent ensureFirebaseAuthReady returns exact same Promise", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const mockApp = { name: "[DEFAULT]" };
      const mockAuth = { currentUser: null };
      vi.mocked(firebaseApp.getApps).mockReturnValue([]);
      vi.mocked(firebaseApp.initializeApp).mockReturnValue(mockApp as any);
      vi.mocked(firebaseAuth.getAuth).mockReturnValue(mockAuth as any);

      let resolvePersistence: any;
      const persistencePromise = new Promise((resolve) => { resolvePersistence = resolve; });
      vi.mocked(firebaseAuth.setPersistence).mockReturnValue(persistencePromise as any);

      const { ensureFirebaseAuthReady } = await import("./auth");
      const p1 = ensureFirebaseAuthReady();
      const p2 = ensureFirebaseAuthReady();

      expect(p1).toBe(p2);
      expect(firebaseAuth.setPersistence).toHaveBeenCalledTimes(1);

      resolvePersistence();
      await p1;
    });

    it("persistence pending delays getIdToken", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const mockUser = { getIdToken: vi.fn().mockResolvedValue("token") };
      const mockApp = { name: "[DEFAULT]" };
      const mockAuth = { currentUser: mockUser };
      vi.mocked(firebaseApp.getApps).mockReturnValue([]);
      vi.mocked(firebaseApp.initializeApp).mockReturnValue(mockApp as any);
      vi.mocked(firebaseAuth.getAuth).mockReturnValue(mockAuth as any);

      let resolvePersistence: any;
      const persistencePromise = new Promise((resolve) => { resolvePersistence = resolve; });
      vi.mocked(firebaseAuth.setPersistence).mockReturnValue(persistencePromise as any);

      const { firebaseAccessTokenProvider } = await import("./auth");

      let tokenResolved = false;
      const tokenPromise = firebaseAccessTokenProvider.getAccessToken().then(t => {
        tokenResolved = true;
        return t;
      });

      await new Promise(r => setTimeout(r, 10));
      expect(tokenResolved).toBe(false);
      expect(mockUser.getIdToken).not.toHaveBeenCalled();

      resolvePersistence();
      const token = await tokenPromise;

      expect(tokenResolved).toBe(true);
      expect(mockUser.getIdToken).toHaveBeenCalledTimes(1);
      expect(token).toBe("token");
    });

    it("persistence pending delays signOut", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const mockApp = { name: "[DEFAULT]" };
      const mockAuth = { currentUser: null };
      vi.mocked(firebaseApp.getApps).mockReturnValue([]);
      vi.mocked(firebaseApp.initializeApp).mockReturnValue(mockApp as any);
      vi.mocked(firebaseAuth.getAuth).mockReturnValue(mockAuth as any);

      let resolvePersistence: any;
      const persistencePromise = new Promise((resolve) => { resolvePersistence = resolve; });
      vi.mocked(firebaseAuth.setPersistence).mockReturnValue(persistencePromise as any);
      vi.mocked(firebaseAuth.signOut).mockResolvedValue(undefined);

      const { signOutFirebase } = await import("./auth");

      let signoutResolved = false;
      const signoutPromise = signOutFirebase().then(() => { signoutResolved = true; });

      await new Promise(r => setTimeout(r, 10));
      expect(signoutResolved).toBe(false);
      expect(firebaseAuth.signOut).not.toHaveBeenCalled();

      resolvePersistence();
      await signoutPromise;

      expect(signoutResolved).toBe(true);
      expect(firebaseAuth.signOut).toHaveBeenCalledTimes(1);
    });

    it("persistence rejection exposes only generic message and caches rejection", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const mockApp = { name: "[DEFAULT]" };
      const mockAuth = { currentUser: null };
      vi.mocked(firebaseApp.getApps).mockReturnValue([]);
      vi.mocked(firebaseApp.initializeApp).mockReturnValue(mockApp as any);
      vi.mocked(firebaseAuth.getAuth).mockReturnValue(mockAuth as any);

      vi.mocked(firebaseAuth.setPersistence).mockRejectedValue(new Error("SECRET_INTERNAL_FIREBASE_ERROR"));

      const { ensureFirebaseAuthReady, firebaseAccessTokenProvider, signOutFirebase } = await import("./auth");

      const p1 = ensureFirebaseAuthReady();
      await expect(p1).rejects.toThrow("Firebase authentication persistence initialization failed");

      const err = await p1.catch(e => e);
      expect(err.message).not.toContain("SECRET_INTERNAL_FIREBASE_ERROR");

      const p2 = ensureFirebaseAuthReady();
      await expect(p2).rejects.toThrow("Firebase authentication persistence initialization failed");
      expect(firebaseAuth.setPersistence).toHaveBeenCalledTimes(1);

      await expect(firebaseAccessTokenProvider.getAccessToken()).rejects.toThrow("Firebase authentication persistence initialization failed");

      await expect(signOutFirebase()).rejects.toThrow("Firebase authentication persistence initialization failed");
    });

    it("empty/whitespace env keys are treated as missing", async () => {
      vi.stubEnv("VITE_FIREBASE_API_KEY", "   \t\n ");
      vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
      vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-project");
      vi.stubEnv("VITE_FIREBASE_APP_ID", "test-app-id");

      const { getFirebaseAuthConfigStatus } = await import("./auth");
      const status = getFirebaseAuthConfigStatus();

      expect(status.configured).toBe(false);
      expect(status.missingKeys).toContain("VITE_FIREBASE_API_KEY");
    });
  });
});
