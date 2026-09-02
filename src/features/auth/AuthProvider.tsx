import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Profile, UserRole } from "../../types/database";

interface LocalUser {
  id: string;
  email: string;
}

interface LocalSession {
  user: LocalUser;
}

interface AuthContextValue {
  session: LocalSession | null;
  user: LocalUser | null;
  profile: Profile | null;
  loading: boolean;
  signInAsDemo: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateLocalProfile: (updates: { full_name?: string; phone?: string | null }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "smartpark.dev-auth";

const demoProfiles: Record<"user" | "admin", { user: LocalUser; profile: Profile }> = {
  user: {
    user: {
      id: "11111111-1111-4111-8111-111111111111",
      email: "user@smartpark.local",
    },
    profile: {
      id: "11111111-1111-4111-8111-111111111111",
      role: "user",
      full_name: "Yuan Chavez",
      phone: null,
      created_at: new Date(0).toISOString(),
      updated_at: new Date(0).toISOString(),
    },
  },
  admin: {
    user: {
      id: "22222222-2222-4222-8222-222222222222",
      email: "admin@smartpark.local",
    },
    profile: {
      id: "22222222-2222-4222-8222-222222222222",
      role: "admin",
      full_name: "SmartPark Admin",
      phone: null,
      created_at: new Date(0).toISOString(),
      updated_at: new Date(0).toISOString(),
    },
  },
};

type StoredAuth = {
  user: LocalUser;
  profile: Profile;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setAuth(JSON.parse(stored) as StoredAuth);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  function persist(next: StoredAuth | null) {
    setAuth(next);
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  }

  async function signInAsDemo(role: UserRole) {
    // Staff authentication will be introduced later. For now, staff falls back
    // to the normal parking-user demo profile.
    const preset = role === "admin" ? demoProfiles.admin : demoProfiles.user;
    persist({
      user: { ...preset.user },
      profile: { ...preset.profile },
    });
  }

  async function signOut() {
    persist(null);
  }

  async function refreshProfile() {
    // Local development auth has no remote profile to refresh.
    return;
  }

  async function updateLocalProfile(updates: { full_name?: string; phone?: string | null }) {
    if (!auth) return;
    persist({
      ...auth,
      profile: {
        ...auth.profile,
        ...updates,
        updated_at: new Date().toISOString(),
      },
    });
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session: auth ? { user: auth.user } : null,
      user: auth?.user ?? null,
      profile: auth?.profile ?? null,
      loading,
      signInAsDemo,
      signOut,
      refreshProfile,
      updateLocalProfile,
    }),
    [auth, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
