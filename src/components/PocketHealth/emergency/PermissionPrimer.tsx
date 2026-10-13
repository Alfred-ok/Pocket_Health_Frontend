import { useEffect, useState } from "react";
import { useEmergencyPermissions } from "../../../hooks/useEmergencyPermissions";
import Button from "../../ui/button/Button";

/**
 * One-time prompt (per browser) asking for Location + Microphone access up
 * front, so Emergency SOS doesn't have to request them mid-emergency. Shown
 * once after the app shell first loads; dismissing it (either button) marks
 * it primed so it won't reappear.
 */
export default function PermissionPrimer() {
  const { locationStatus, microphoneStatus, requestLocation, requestMicrophone, hasPrimed, markPrimed } =
    useEmergencyPermissions();
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (hasPrimed()) return;
    if (locationStatus === "granted" && microphoneStatus === "granted") return;
    if (locationStatus === "prompt" || microphoneStatus === "prompt" || microphoneStatus === "unsupported") {
      setVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationStatus, microphoneStatus]);

  if (!visible) return null;

  const dismiss = () => {
    markPrimed();
    setVisible(false);
  };

  const enableAccess = async () => {
    setRequesting(true);
    await Promise.all([requestLocation(), requestMicrophone()]);
    setRequesting(false);
    dismiss();
  };

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-500/10">
      <div>
        <p className="text-sm font-semibold text-brand-700 dark:text-brand-400">Enable Emergency SOS access</p>
        <p className="mt-0.5 text-sm text-brand-600 dark:text-brand-300">
          Grant location and microphone access now so an SOS alert can include your location and an optional
          recording without delay in an emergency.
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" variant="outline" onClick={dismiss}>
          Not now
        </Button>
        <Button size="sm" onClick={enableAccess} disabled={requesting}>
          {requesting ? "Requesting..." : "Enable access"}
        </Button>
      </div>
    </div>
  );
}
