import { useCallback } from "react";
import { usePermissionStatus } from "./usePermissionStatus";

const PRIMED_KEY = "ph_permissions_primed";

/**
 * Location + microphone access for Emergency SOS. Web apps have no true
 * "on install" permission hook, so this is requested proactively the first
 * time the authenticated app shell loads (see PermissionPrimer), rather than
 * waiting until a real emergency to ask.
 */
export function useEmergencyPermissions() {
  const locationStatus = usePermissionStatus("geolocation");
  const microphoneStatus = usePermissionStatus("microphone");

  const requestLocation = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if (!navigator.geolocation) return resolve(false);
      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false)
      );
    });
  }, []);

  const requestMicrophone = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      return false;
    }
  }, []);

  const hasPrimed = () => localStorage.getItem(PRIMED_KEY) === "1";
  const markPrimed = () => localStorage.setItem(PRIMED_KEY, "1");

  return {
    locationStatus,
    microphoneStatus,
    requestLocation,
    requestMicrophone,
    hasPrimed,
    markPrimed,
  };
}
