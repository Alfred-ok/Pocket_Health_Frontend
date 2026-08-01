import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import profilesApi from "../api/profilesApi";
import nextOfKinApi from "../api/nextOfKinApi";
import type { Profile, NextOfKin } from "../types/pocketHealth";

export function useMyProfile() {
  const { user } = useAuthStore();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [dependants, setDependants] = useState<Profile[]>([]);
  const [nextOfKin, setNextOfKin] = useState<NextOfKin[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const profiles = await profilesApi.getByUser(user.userId);

      const primary =
        profiles.find((p) => p.isPrimary) ??
        profiles[0] ??
        null;

      setProfile(primary);

      setDependants(
        profiles.filter((p) => p.profileId !== primary?.profileId)
      );

      if (primary) {
        const kin = await nextOfKinApi.getByProfile(primary.profileId);
        setNextOfKin(kin);
        setError(null);
      } else {
        setNextOfKin([]);
        setError("No patient profile found for this account");
      }
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    profile,
    dependants,
    nextOfKin,
    loading,
    error,
    reload: load,
  };
}