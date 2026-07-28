import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import providersApi from "../api/providersApi";
import type { Provider } from "../types/pocketHealth";

/** Resolves the logged-in provider's own Provider record (providerId is needed for schedule/appointments/consultations). */
export function useMyProvider() {
  const { user } = useAuthStore();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.userId || user.userCategory === "patient") {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    providersApi
      .getByUserId(user.userId)
      .then((p) => !cancelled && setProvider(p))
      .catch(() => !cancelled && setError("Failed to load provider record"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user?.userId]);

  return { provider, loading, error };
}
