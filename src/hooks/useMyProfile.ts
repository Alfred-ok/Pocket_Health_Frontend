import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useProfilesStore } from "../store/profilesStore";
import nextOfKinApi from "../api/nextOfKinApi";
import type { NextOfKin } from "../types/pocketHealth";

export function useMyProfile() {
  const { user } = useAuthStore();
  const { profiles, loading, error: profilesError, fetchProfiles } = useProfilesStore();

  const [nextOfKin, setNextOfKin] = useState<NextOfKin[]>([]);
  const [nextOfKinError, setNextOfKinError] = useState<string | null>(null);

  const primary = profiles.find((p) => p.isPrimary) ?? profiles[0] ?? null;
  const dependants = profiles.filter((p) => p.profileId !== primary?.profileId);

  const load = useCallback(async () => {
    if (!user?.userId) return;
    await fetchProfiles(user.userId, { force: true });
  }, [user?.userId, fetchProfiles]);

  useEffect(() => {
    if (user?.userId) fetchProfiles(user.userId);
  }, [user?.userId, fetchProfiles]);

  useEffect(() => {
    if (!primary) {
      setNextOfKin([]);
      return;
    }
    nextOfKinApi
      .getByProfile(primary.profileId)
      .then((kin) => {
        setNextOfKin(kin);
        setNextOfKinError(null);
      })
      .catch(() => setNextOfKinError("Failed to load next of kin"));
  }, [primary?.profileId]);

  return {
    profile: primary,
    dependants,
    nextOfKin,
    loading,
    error: profilesError ?? (primary ? nextOfKinError : "No patient profile found for this account"),
    reload: load,
  };
}
