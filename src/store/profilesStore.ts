import { create } from "zustand";
import profilesApi from "../api/profilesApi";
import type { Profile } from "../types/pocketHealth";

interface ProfilesState {
  profiles: Profile[];
  loading: boolean;
  error: string | null;
  loadedUserId: string | null;
  fetchProfiles: (userId: string, opts?: { force?: boolean }) => Promise<void>;
  reset: () => void;
}

export const useProfilesStore = create<ProfilesState>((set, get) => ({
  profiles: [],
  loading: false,
  error: null,
  loadedUserId: null,

  fetchProfiles: async (userId, opts) => {
    const { loadedUserId, loading } = get();
    if (!opts?.force && loadedUserId === userId && !loading) return;

    set({ loading: true });
    try {
      const list = await profilesApi.getByUser(userId);
      set({ profiles: list, loading: false, error: null, loadedUserId: userId });
    } catch {
      set({ loading: false, error: "Failed to load profiles" });
    }
  },

  reset: () => set({ profiles: [], loading: false, error: null, loadedUserId: null }),
}));
