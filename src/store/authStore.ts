import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useActiveProfileStore } from "./activeProfileStore";
import { useProfilesStore } from "./profilesStore";

export interface AuthUser {
  userId: string;
  email: string;
  userCategory: string;
  status: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem("ph_access_token", token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("ph_access_token");
        useActiveProfileStore.getState().setActiveProfileId(null);
        useProfilesStore.getState().reset();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "pockethealth-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
