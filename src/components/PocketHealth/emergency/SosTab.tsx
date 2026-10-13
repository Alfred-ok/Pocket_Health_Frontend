import { useEffect, useRef, useState } from "react";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import TextArea from "../../form/input/TextArea";
import { useActiveProfile } from "../../../hooks/useActiveProfile";
import { useAudioRecorder } from "../../../hooks/useAudioRecorder";
import { usePermissionStatus } from "../../../hooks/usePermissionStatus";
import emergencyAlertsApi from "../../../api/emergencyAlertsApi";
import emergencyContactsApi from "../../../api/emergencyContactsApi";
import nextOfKinApi from "../../../api/nextOfKinApi";
import documentsApi from "../../../api/documentsApi";
import healthInfoApi from "../../../api/healthInfoApi";
import insuranceApi from "../../../api/insuranceApi";
import { buildEmergencyMessage, type EmergencyAlertKind } from "../../../utils/emergencyMessage";
import { getPrimaryContact } from "../../../utils/emergencyContacts";
import { isEmailJsConfigured, sendEmergencyEmails } from "../../../utils/emailjs";
import {
  describeFixAge,
  getCurrentLocation,
  getLastKnownFix,
  watchLocation,
  type LocationFix,
} from "../../../utils/geolocation";
import type { EmergencyAlert, HealthInfo, Insurance } from "../../../types/pocketHealth";

type AlertKind = EmergencyAlertKind;

/** A background reading younger than this is sent as-is instead of waiting for a new one. */
const FRESH_FIX_MS = 2 * 60_000;
/** Longest an alert waits for a new reading before falling back to the last known one. */
const MAX_LOCATION_WAIT_MS = 10_000;

interface ResolvedLocation {
  coords: string;
  /** Set when the coordinates are a stored reading rather than a live one. */
  note?: string;
}

/**
 * How the SOS message reached contacts: "emailed" = EmailJS delivered to every contact with an
 * email, "partial" = some EmailJS sends failed, "mail_app" = fell back to opening the mail app,
 * "none" = nobody on file has an email.
 */
type Delivery =
  | { status: "emailed" }
  | { status: "partial"; failed: string[] }
  | { status: "mail_app" }
  | { status: "none" };

const kindLabels: Record<AlertKind, string> = {
  health: "Health Emergency",
  life_in_danger: "Life in Danger Emergency",
};

function fileToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read recording"));
    reader.readAsDataURL(blob);
  });
}

export default function SosTab() {
  const { activeProfile: profile } = useActiveProfile();
  const recorder = useAudioRecorder();
  const microphoneStatus = usePermissionStatus("microphone");
  const locationStatus = usePermissionStatus("geolocation");
  const liveFix = useRef<LocationFix | null>(null);

  const [openKind, setOpenKind] = useState<AlertKind | null>(null);
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  const [locationNote, setLocationNote] = useState<string | undefined>(undefined);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [confirmedContacts, setConfirmedContacts] = useState<{ name: string; email: string | null }[] | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [healthInfo, setHealthInfo] = useState<HealthInfo | null>(null);
  const [insurancePolicies, setInsurancePolicies] = useState<Insurance[]>([]);

  const [history, setHistory] = useState<EmergencyAlert[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      setHealthInfo(null);
      setInsurancePolicies([]);
      return;
    }
    healthInfoApi.getByProfile(profile.profileId).then(setHealthInfo).catch(() => setHealthInfo(null));
    insuranceApi.getByProfile(profile.profileId).then(setInsurancePolicies).catch(() => setInsurancePolicies([]));
  }, [profile]);

  const loadHistory = () => {
    if (!profile) {
      setHistoryLoading(false);
      return;
    }
    setHistoryLoading(true);
    emergencyAlertsApi
      .getByProfile(profile.profileId)
      .then(setHistory)
      .finally(() => setHistoryLoading(false));
  };

  useEffect(loadHistory, [profile]);

  // Once location access is granted, keep a fresh reading ready so a one-tap SOS doesn't have
  // to wait for (or miss) a GPS fix.
  useEffect(() => {
    if (locationStatus !== "granted") return;
    return watchLocation((fix) => {
      liveFix.current = fix;
    });
  }, [locationStatus]);

  /**
   * Best available location: a fresh background reading, else a new reading, else the last
   * reading saved on this device (flagged as such). Empty coords when nothing is available.
   */
  const resolveLocation = async (): Promise<ResolvedLocation & { error?: string }> => {
    const background = liveFix.current;
    if (background && Date.now() - background.timestamp < FRESH_FIX_MS) return { coords: background.coords };

    const result = await Promise.race([
      getCurrentLocation(),
      new Promise<{ ok: false; reason: string }>((resolve) =>
        setTimeout(() => resolve({ ok: false, reason: "Timed out getting your location." }), MAX_LOCATION_WAIT_MS)
      ),
    ]);
    if (result.ok) return { coords: result.fix.coords };

    const stored = getLastKnownFix();
    if (stored) {
      return { coords: stored.coords, note: `last known location, recorded ${describeFixAge(stored)}`, error: result.reason };
    }
    return { coords: "", error: result.reason };
  };

  const applyResolvedLocation = (resolved: ResolvedLocation & { error?: string }) => {
    setLocation(resolved.coords);
    setLocationNote(resolved.note);
    setLocationError(resolved.error ?? null);
  };

  const resetPanel = () => {
    setOpenKind(null);
    setNotes("");
    setLocation("");
    setLocationNote(undefined);
    setLocationError(null);
    setSendError(null);
    setConfirmedContacts(null);
    setDelivery(null);
    recorder.reset();
  };

  const locateNow = async () => {
    setLocating(true);
    applyResolvedLocation(await resolveLocation());
    setLocating(false);
  };

  const openPanel = (kind: AlertKind) => {
    resetPanel();
    setOpenKind(kind);
    // Start locating straight away so the alert carries a location even if "Use my location"
    // isn't pressed.
    locateNow();
  };

  const performSend = async (
    kind: AlertKind,
    notesText: string,
    providedLocation: string,
    providedLocationNote?: string
  ) => {
    if (!profile) return;
    setSending(true);
    setSendError(null);
    try {
      // Never send without trying for a location, unless a lookup for this alert already failed.
      if (!providedLocation && !locationError) {
        setLocating(true);
        const resolved = await resolveLocation();
        setLocating(false);
        applyResolvedLocation(resolved);
        providedLocation = resolved.coords;
        providedLocationNote = resolved.note;
      }

      let recordingDocumentId: string | undefined;
      if (recorder.audioBlob) {
        const dataUrl = await fileToDataUrl(recorder.audioBlob);
        const doc = await documentsApi.create({
          ownerProfileId: profile.profileId,
          docType: "emergency_recording",
          fileUrl: dataUrl,
          fileName: `emergency-recording-${Date.now()}.webm`,
        });
        recordingDocumentId = doc.documentId;
      }

      // Location: prefer a live reading; if none was captured, fall back to the profile's
      // address on file; if neither is available, the field is left blank in the message.
      const effectiveLocation = providedLocation || profile.residence || "";

      await emergencyAlertsApi.create({
        profileId: profile.profileId,
        alertType: kind,
        notes: notesText || undefined,
        location: effectiveLocation || undefined,
        recordingDocumentId,
      });

      const [contacts, kin] = await Promise.all([
        emergencyContactsApi.getByProfile(profile.profileId),
        nextOfKinApi.getByProfile(profile.profileId),
      ]);
      // Health Emergency goes to the primary contact only; other alerts go to everyone on file.
      const primary = getPrimaryContact(contacts);
      const targetContacts = kind === "health" ? (primary ? [primary] : []) : contacts;
      const recipients = [
        ...(kind === "health"
          ? []
          : kin.map((k) => ({ name: `${k.fullName} (Next of kin)`, email: null as string | null }))),
        ...targetContacts.map((c) => ({ name: c.name, email: c.email })),
      ];
      setConfirmedContacts(recipients);

      const emailRecipients = targetContacts
        .filter((c) => !!c.email)
        .map((c) => ({ name: c.name, email: c.email as string }));
      const { subject, body, mailto } = buildEmergencyMessage({
        alertKind: kind,
        profile,
        healthInfo,
        insurancePolicies,
        notes: notesText,
        // The message reports current location and residence separately, so it only gets the
        // live (or last known) reading — never the residence dressed up as a location.
        location: providedLocation,
        locationNote: providedLocation ? providedLocationNote : undefined,
        recipientEmails: emailRecipients.map((r) => r.email),
      });

      if (emailRecipients.length === 0) {
        setDelivery({ status: "none" });
      } else if (!isEmailJsConfigured) {
        window.location.href = mailto;
        setDelivery({ status: "mail_app" });
      } else {
        const fromName = [profile.otherNames, profile.surname].filter(Boolean).join(" ") || "PocketHealth user";
        try {
          const { sent, failed } = await sendEmergencyEmails(emailRecipients, { subject, message: body, fromName });
          if (sent.length === 0) {
            // EmailJS is unreachable — don't leave the person stranded, hand off to the mail app.
            window.location.href = mailto;
            setDelivery({ status: "mail_app" });
          } else if (failed.length > 0) {
            setDelivery({ status: "partial", failed: failed.map((f) => f.name) });
          } else {
            setDelivery({ status: "emailed" });
          }
        } catch {
          window.location.href = mailto;
          setDelivery({ status: "mail_app" });
        }
      }

      loadHistory();
    } catch {
      setSendError("Could not log this alert. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const send = () => {
    if (!openKind) return;
    return performSend(openKind, notes, location, locationNote);
  };

  /** One-tap SOS: skips the compose panel, grabs a quick location fix, and sends immediately. */
  const activateNow = async (kind: AlertKind) => {
    resetPanel();
    setOpenKind(kind);

    await performSend(kind, "", "");
  };

  const resolveAlert = async (id: string) => {
    await emergencyAlertsApi.update(id, { status: "resolved" });
    loadHistory();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <button
            onClick={() => openPanel("health")}
            className="rounded-2xl border-2 border-warning-300 bg-warning-50 p-6 text-left transition hover:bg-warning-100 dark:border-warning-800 dark:bg-warning-500/10 dark:hover:bg-warning-500/15"
          >
            <h3 className="text-lg font-semibold text-warning-700 dark:text-warning-400">Health Emergency</h3>
            <p className="mt-1 text-sm text-warning-600 dark:text-warning-500">
              Send your location and health information to your primary emergency contact.
            </p>
          </button>
          <button
            onClick={() => activateNow("health")}
            disabled={sending || !profile}
            className="w-full rounded-xl bg-error-600 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-theme-xs transition hover:bg-error-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Activate Health Emergency Now!
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => openPanel("life_in_danger")}
            className="rounded-2xl border-2 border-error-300 bg-error-50 p-6 text-left transition hover:bg-error-100 dark:border-error-800 dark:bg-error-500/10 dark:hover:bg-error-500/15"
          >
            <h3 className="text-lg font-semibold text-error-700 dark:text-error-400">Life in Danger Emergency</h3>
            <p className="mt-1 text-sm text-error-600 dark:text-error-500">
              Log an alert, optionally with a short audio recording as a record of what's happening.
            </p>
          </button>
          <button
            onClick={() => activateNow("life_in_danger")}
            disabled={sending || !profile}
            className="w-full rounded-xl bg-error-600 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-theme-xs transition hover:bg-error-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Activate Life in Danger Emergency Now!
          </button>
        </div>
      </div>

      {openKind && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          {confirmedContacts ? (
            <div>
              <h4 className="text-base font-semibold text-success-600 dark:text-success-400">
                {kindLabels[openKind]} alert logged
              </h4>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This alert is saved to your account and visible below.{" "}
                {delivery?.status === "emailed" &&
                  "Your emergency message with your location and health information has been emailed."}
                {delivery?.status === "partial" &&
                  `Your emergency message was emailed, but could not be delivered to: ${delivery.failed.join(", ")}.`}
                {delivery?.status === "mail_app" &&
                  "Automatic sending isn't available right now, so the message was opened in your mail app — review it and hit send."}
                {delivery?.status === "none" &&
                  (openKind === "health"
                    ? "It has not been emailed — your primary contact has no email on file."
                    : "It has not been emailed — none of your contacts has an email on file.")}{" "}
                {openKind === "health" ? "Your primary contact:" : "Your emergency contacts on file:"}
              </p>
              {confirmedContacts.length > 0 ? (
                <ul className="mt-2 list-inside list-disc text-sm text-gray-700 dark:text-gray-300">
                  {confirmedContacts.map((c) => (
                    <li key={c.name}>
                      {c.name}
                      {!c.email && <span className="text-warning-600 dark:text-warning-400"> (no email on file)</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-warning-600 dark:text-warning-400">
                  You don't have any emergency contacts on file yet — add some in the Contacts tab.
                </p>
              )}
              <Button size="sm" className="mt-4" variant="outline" onClick={resetPanel}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
                Send {kindLabels[openKind]} Alert
              </h4>

              <TextArea
                placeholder="What's happening? (optional but helpful)"
                value={notes}
                onChange={setNotes}
                rows={3}
              />

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button size="sm" variant="outline" onClick={locateNow} disabled={locating}>
                  {locating ? "Getting location..." : location ? "Refresh location" : "Use my location"}
                </Button>
                {location ? (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    📍 {location}
                    {locationNote && ` (${locationNote})`}
                  </span>
                ) : locating ? null : profile?.residence ? (
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    Will use your address on file: {profile.residence}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    No location available — this field will be left blank.
                  </span>
                )}
              </div>

              {locationError && !locating && (
                <p className="mt-2 text-sm text-warning-600 dark:text-warning-400">{locationError}</p>
              )}

              {openKind === "life_in_danger" && (
                <div className="mt-4 rounded-lg border border-gray-100 p-4 dark:border-gray-800">
                  <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Record option</p>
                  {microphoneStatus === "denied" ? (
                    <p className="text-sm text-error-500">
                      Microphone access is blocked for this site. Enable it in your browser's site settings to record.
                    </p>
                  ) : microphoneStatus !== "granted" ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <Button size="sm" variant="outline" onClick={recorder.start}>
                        Activate microphone access
                      </Button>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Not activated yet — grant access to attach a recording.
                      </span>
                    </div>
                  ) : recorder.status !== "recording" ? (
                    <Button size="sm" variant="outline" onClick={recorder.start}>
                      ● Start recording
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={recorder.stop}>
                      ■ Stop recording ({recorder.elapsedSeconds}s / {recorder.maxSeconds}s)
                    </Button>
                  )}
                  {recorder.error && <p className="mt-2 text-sm text-error-500">{recorder.error}</p>}
                  {recorder.audioBlob && (
                    <audio className="mt-3 w-full" controls src={URL.createObjectURL(recorder.audioBlob)} />
                  )}
                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    Recordings are saved to your account as a document; the automated email doesn't include a
                    recording link.
                  </p>
                </div>
              )}

              {sendError && <p className="mt-3 text-sm text-error-500">{sendError}</p>}

              <div className="mt-5 flex justify-end gap-3">
                <Button variant="outline" onClick={resetPanel}>
                  Cancel
                </Button>
                <Button onClick={send} disabled={sending || !profile}>
                  {sending ? "Sending..." : "Send Alert"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <div>
        <h4 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">Alert history</h4>
        {historyLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>}
        {!historyLoading && history.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">No emergency alerts logged yet.</p>
        )}
        <div className="space-y-3">
          {history.map((alert) => (
            <div
              key={alert.alertId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge color={alert.alertType === "life_in_danger" ? "error" : "warning"} size="sm">
                    {kindLabels[alert.alertType as AlertKind] ?? alert.alertType}
                  </Badge>
                  <Badge color={alert.status === "resolved" ? "success" : "light"} size="sm">
                    {alert.status}
                  </Badge>
                </div>
                {alert.notes && <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{alert.notes}</p>}
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {new Date(alert.createdAt).toLocaleString()}
                  {alert.location ? ` · ${alert.location}` : ""}
                  {alert.recordingDocument ? " · has audio recording" : ""}
                </p>
              </div>
              {alert.status !== "resolved" && (
                <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.alertId)}>
                  Mark resolved
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
