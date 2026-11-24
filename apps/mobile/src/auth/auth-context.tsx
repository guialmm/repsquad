import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { setAuthToken } from "@/api/client";

import { clearSession, loadSession, saveSession, type AuthUser } from "./storage";

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  token: null,
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadSession()
      .then((session) => {
        if (!active) return;
        if (session) {
          setToken(session.token);
          setUser(session.user);
          setAuthToken(session.token);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, _password: string) => {
    // TODO(#4): substituir pelo POST real de login quando a API de auth entrar na main.
    await delay(400);
    const normalizedEmail = email.trim().toLowerCase();
    const demoToken = `demo-token-${Date.now()}`;
    const demoUser: AuthUser = {
      name: normalizedEmail.split("@")[0] || "Atleta",
      email: normalizedEmail,
    };
    await saveSession(demoToken, demoUser);
    setAuthToken(demoToken);
    setToken(demoToken);
    setUser(demoUser);
  }, []);

  const signUp = useCallback(async (name: string, email: string, _password: string) => {
    // TODO(#4): substituir pelo POST real de cadastro quando a API de auth entrar na main.
    await delay(400);
    const demoToken = `demo-token-${Date.now()}`;
    const demoUser: AuthUser = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
    };
    await saveSession(demoToken, demoUser);
    setAuthToken(demoToken);
    setToken(demoToken);
    setUser(demoUser);
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
