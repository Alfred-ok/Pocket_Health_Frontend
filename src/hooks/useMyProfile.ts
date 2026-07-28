import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import profilesApi from "../api/profilesApi";
import type { Profile } from "../types/pocketHealth";

/** Resolves the logged-in patient's primary profile (profileId is required to book appointments/consultations). */
export function useMyProfile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dependants, setDependants] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    profilesApi
      .getByUser(user.userId)
      .then((profiles) => {
        const primary = profiles.find((p) => p.isPrimary) ?? profiles[0] ?? null;
        setProfile(primary);
        setDependants(profiles.filter((p) => p.profileId !== primary?.profileId));
        setError(primary ? null : "No patient profile found for this account");
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [user?.userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { profile, dependants, loading, error, reload: load };
}
