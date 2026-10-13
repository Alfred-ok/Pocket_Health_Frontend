const LAST_FIX_KEY = "ph_last_location";

export interface LocationFix {
  /** "lat, lng" with 5 decimals (~1 m). */
  coords: string;
  /** Epoch ms when the reading was taken. */
  timestamp: number;
}

export type LocationResult = { ok: true; fix: LocationFix } | { ok: false; reason: string };

function toFix(pos: GeolocationPosition): LocationFix {
  return {
    coords: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
    timestamp: pos.timestamp || Date.now(),
  };
}

function describeError(err: GeolocationPositionError): string {
  if (err.code === err.PERMISSION_DENIED) {
    return window.isSecureContext
      ? "Location access is blocked for this site. Allow it in your browser's site settings."
      : "Location only works over HTTPS (or localhost). Open the app over a secure connection.";
  }
  if (err.code === err.TIMEOUT) return "Timed out getting your location.";
  return "Your location is unavailable right now (check that location services are on).";
}

export function rememberFix(fix: LocationFix) {
  try {
    localStorage.setItem(LAST_FIX_KEY, JSON.stringify(fix));
  } catch {
    /* storage unavailable — the live reading still works */
  }
}

/** Last successful reading saved on this device, if any. */
export function getLastKnownFix(): LocationFix | null {
  try {
    const raw = localStorage.getItem(LAST_FIX_KEY);
    if (!raw) return null;
    const fix = JSON.parse(raw) as LocationFix;
    return typeof fix?.coords === "string" && typeof fix?.timestamp === "number" ? fix : null;
  } catch {
    return null;
  }
}

function requestPosition(options: PositionOptions): Promise<LocationResult> {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const fix = toFix(pos);
        rememberFix(fix);
        resolve({ ok: true, fix });
      },
      (err) => resolve({ ok: false, reason: describeError(err) }),
      options
    );
  });
}

/**
 * Gets the current location, trying a precise (GPS) fix first and falling back to a quicker
 * network-based one — laptops and indoor phones often can't get a GPS fix in time.
 */
export async function getCurrentLocation(): Promise<LocationResult> {
  if (!navigator.geolocation) return { ok: false, reason: "Location isn't available in this browser." };
  const precise = await requestPosition({ enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 });
  if (precise.ok || precise.reason.startsWith("Location access is blocked") || !window.isSecureContext) {
    return precise;
  }
  return requestPosition({ enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 });
}

/** Keeps a fresh reading in the background; returns a stop function. */
export function watchLocation(onFix: (fix: LocationFix) => void): () => void {
  if (!navigator.geolocation) return () => {};
  const id = navigator.geolocation.watchPosition(
    (pos) => {
      const fix = toFix(pos);
      rememberFix(fix);
      onFix(fix);
    },
    () => {},
    { enableHighAccuracy: true, maximumAge: 30_000 }
  );
  return () => navigator.geolocation.clearWatch(id);
}

/** "3 min ago" style age for a fix, used when we fall back to a stored reading. */
export function describeFixAge(fix: LocationFix): string {
  const minutes = Math.round((Date.now() - fix.timestamp) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} h ago`;
  return new Date(fix.timestamp).toLocaleString();
}
