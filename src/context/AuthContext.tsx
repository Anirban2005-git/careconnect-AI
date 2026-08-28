import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { firebaseLogin, firebaseGoogleLogin, firebaseRegister, firebaseResetPassword, firebaseLogout, isFirebaseConfigured } from "../services/firebase";
import { UserProfile } from "../types";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  demoMode: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, fullName: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (profile: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(api.getToken());
  const [isLoading, setIsLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(true);

  const loadProfile = useCallback(async () => {
    const stored = api.getToken();
    if (!stored) {
      setIsLoading(false);
      return;
    }
    try {
      const profile = await api.getProfile();
      setUser(profile);
      setToken(stored);
    } catch {
      api.clearToken();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured() && password) {
        const idToken = await firebaseLogin(email, password);
        const result = await api.firebaseAuth(idToken);
        api.setToken(result.token);
        setToken(result.token);
        setUser(result.user);
        setDemoMode(false);
      } else {
        const result = await api.login(email, password);
        api.setToken(result.token);
        setToken(result.token);
        setUser(result.user);
        setDemoMode(result.demoMode);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, fullName: string, password?: string) => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured() && password) {
        const idToken = await firebaseRegister(email, password);
        const result = await api.firebaseAuth(idToken);
        api.setToken(result.token);
        setToken(result.token);
        setUser(result.user);
        setDemoMode(false);
      } else {
        const result = await api.register(email, fullName, password);
        api.setToken(result.token);
        setToken(result.token);
        setUser(result.user);
        setDemoMode(result.demoMode);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      if (!isFirebaseConfigured()) throw new Error("Google sign-in requires Firebase configuration.");
      const idToken = await firebaseGoogleLogin();
      const result = await api.firebaseAuth(idToken);
      api.setToken(result.token);
      setToken(result.token);
      setUser(result.user);
      setDemoMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await firebaseLogout().catch(() => {});
    api.clearToken();
    setUser(null);
    setToken(null);
  };

  const resetPassword = async (email: string) => {
    if (isFirebaseConfigured()) {
      await firebaseResetPassword(email);
    } else {
      throw new Error("Password reset requires Firebase configuration.");
    }
  };

  const updateUser = async (profile: UserProfile) => {
    const updated = await api.updateProfile(profile);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user && token),
        demoMode,
        login,
        loginWithGoogle,
        register,
        logout,
        resetPassword,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
