import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useActiveProfileStore } from "../store/activeProfileStore";
import { useProfilesStore } from "../store/profilesStore";

export function useActiveProfile() {
  const { user } = useAuthStore();
  const { activeProfileId, setActiveProfileId } = useActiveProfileStore();
  const { profiles, loading, error, fetchProfiles } = useProfilesStore();

  useEffect(() => {
    if (user?.userId) fetchProfiles(user.userId);
  }, [user?.userId, fetchProfiles]);

  useEffect(() => {
    if (profiles.length === 0) return;
    if (!activeProfileId || !profiles.some((p) => p.profileId === activeProfileId)) {
      const primary = profiles.find((p) => p.isPrimary) ?? profiles[0] ?? null;
      setActiveProfileId(primary?.profileId ?? null);
    }
  }, [profiles, activeProfileId, setActiveProfileId]);

  const activeProfile =
    profiles.find((p) => p.profileId === activeProfileId) ??
    profiles.find((p) => p.isPrimary) ??
    profiles[0] ??
    null;

  return {
    activeProfile,
    profiles,
    loading,
    error,
    switchProfile: setActiveProfileId,
    reload: () => (user?.userId ? fetchProfiles(user.userId, { force: true }) : Promise.resolve()),
  };
}
