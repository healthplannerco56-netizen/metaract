import { create } from "zustand";
import { authApi } from "@/lib/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  fetchMe: () => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  loading: false,

  setToken: (token) => {
    localStorage.setItem("access_token", token);
    set({ token });
  },

  setUser: (user) => set({ user }),

  fetchMe: async () => {
    set({ loading: true });
    try {
      const res = await authApi.me();
      set({ user: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    set({ user: null, token: null });
    window.location.href = "/auth/login";
  },

  isAuthenticated: () => {
    const token = get().token;
    return !!token;
  },
}));
