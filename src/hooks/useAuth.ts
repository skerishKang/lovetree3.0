import { useAuthContext } from "../context/AuthContext";
import type { AuthContextValue } from "../types/auth";

export function useAuth(): AuthContextValue {
  const context = useAuthContext();
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
