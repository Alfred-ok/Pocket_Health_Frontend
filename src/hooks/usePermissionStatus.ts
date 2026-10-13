import { useEffect, useState } from "react";

export type PermissionStatusValue = "granted" | "denied" | "prompt" | "unsupported";

/**
 * Tracks a browser permission's live state (geolocation, microphone, ...).
 * Falls back to "unsupported" when the Permissions API can't report on it
 * (e.g. Safari for "microphone") — callers should treat that like "prompt".
 */
export function usePermissionStatus(name: PermissionName | "microphone" | "geolocation"): PermissionStatusValue {
  const [status, setStatus] = useState<PermissionStatusValue>("prompt");

  useEffect(() => {
    let cancelled = false;
    let permissionStatus: PermissionStatus | null = null;

    if (!navigator.permissions?.query) {
      setStatus("unsupported");
      return;
    }

    navigator.permissions
      .query({ name: name as PermissionName })
      .then((result) => {
        if (cancelled) return;
        permissionStatus = result;
        setStatus(result.state as PermissionStatusValue);
        result.onchange = () => setStatus(result.state as PermissionStatusValue);
      })
      .catch(() => {
        if (!cancelled) setStatus("unsupported");
      });

    return () => {
      cancelled = true;
      if (permissionStatus) permissionStatus.onchange = null;
    };
  }, [name]);

  return status;
}
