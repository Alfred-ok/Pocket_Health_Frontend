import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import walletApi from "../api/walletApi";
import type { Wallet } from "../types/pocketHealth";

/** Resolves the logged-in user's wallet, lazily provisioning one if it doesn't exist yet. */
export function useMyWallet() {
  const { user } = useAuthStore();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    walletApi
      .getByUser(user.userId)
      .catch(() => walletApi.create(user.userId))
      .then(setWallet)
      .catch(() => setError("Failed to load wallet"))
      .finally(() => setLoading(false));
  }, [user?.userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { wallet, loading, error, reload: load };
}
