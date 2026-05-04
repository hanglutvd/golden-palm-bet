import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { trpc } from "@/providers/trpc";

interface AuthUser {
  id: number;
  email: string;
  username: string;
  balance: number;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: { identifier: string; password: string }) => Promise<void>;
  register: (data: { email: string; username: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      setUser(data);
      utils.auth.me.invalidate();
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setUser(data);
      utils.auth.me.invalidate();
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setUser(null);
      utils.invalidate();
    },
  });

  useEffect(() => {
    if (meQuery.data) {
      setUser(meQuery.data);
    } else if (meQuery.isError) {
      setUser(null);
    }
  }, [meQuery.data, meQuery.isError]);

  const login = useCallback(
    async (data: { identifier: string; password: string }) => {
      await loginMutation.mutateAsync(data);
    },
    [loginMutation],
  );

  const register = useCallback(
    async (data: { email: string; username: string; password: string }) => {
      await registerMutation.mutateAsync(data);
    },
    [registerMutation],
  );

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const isLoading = meQuery.isLoading || loginMutation.isPending || registerMutation.isPending;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
