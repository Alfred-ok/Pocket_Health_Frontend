import { useEffect, useState } from "react";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import TextArea from "../../form/input/TextArea";
import { useActiveProfile } from "../../../hooks/useActiveProfile";
import { useAudioRecorder } from "../../../hooks/useAudioRecorder";
import emergencyAlertsApi from "../../../api/emergencyAlertsApi";
import emergencyContactsApi from "../../../api/emergencyContactsApi";
import nextOfKinApi from "../../../api/nextOfKinApi";
import documentsApi from "../../../api/documentsApi";
import type { EmergencyAlert } from "../../../types/pocketHealth";

type AlertKind = "health" | "life_in_danger";

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

  const [openKind, setOpenKind] = useState<AlertKind | null>(null);
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  const [locating, setLocating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [confirmedContacts, setConfirmedContacts] = useState<string[] | null>(null);

  const [history, setHistory] = useState<EmergencyAlert[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

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

  const resetPanel = () => {
    setOpenKind(null);
    setNotes("");
    setLocation("");
    setSendError(null);
    setConfirmedContacts(null);
    recorder.reset();
  };

  const openPanel = (kind: AlertKind) => {
    resetPanel();
    setOpenKind(kind);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setSendError("Location isn't available in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setLocating(false);
      },
      () => {
        setSendError("Could not get your location.");
        setLocating(false);
      }
    );
  };

  const send = async () => {
    if (!profile || !openKind) return;
    setSending(true);
    setSendError(null);
    try {
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

      await emergencyAlertsApi.create({
        profileId: profile.profileId,
        alertType: openKind,
        notes: notes || undefined,
        location: location || undefined,
        recordingDocumentId,
      });

      const [contacts, kin] = await Promise.all([
        emergencyContactsApi.getByProfile(profile.profileId),
        nextOfKinApi.getByProfile(profile.profileId),
      ]);
      const names = [
        ...kin.map((k) => `${k.fullName} (Next of kin)`),
        ...contacts.map((c) => c.name),
      ];
      setConfirmedContacts(names);
      loadHistory();
    } catch {
      setSendError("Could not log this alert. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const resolveAlert = async (id: string) => {
    await emergencyAlertsApi.update(id, { status: "resolved" });
    loadHistory();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          onClick={() => openPanel("health")}
          className="rounded-2xl border-2 border-warning-300 bg-warning-50 p-6 text-left transition hover:bg-warning-100 dark:border-warning-800 dark:bg-warning-500/10 dark:hover:bg-warning-500/15"
        >
          <h3 className="text-lg font-semibold text-warning-700 dark:text-warning-400">Health Emergency</h3>
          <p className="mt-1 text-sm text-warning-600 dark:text-warning-500">
            Log a medical emergency alert with notes and your location.
          </p>
        </button>
        <button
          onClick={() => openPanel("life_in_danger")}
          className="rounded-2xl border-2 border-error-300 bg-error-50 p-6 text-left transition hover:bg-error-100 dark:border-error-800 dark:bg-error-500/10 dark:hover:bg-error-500/15"
        >
          <h3 className="text-lg font-semibold text-error-700 dark:text-error-400">Life in Danger Emergency</h3>
          <p className="mt-1 text-sm text-error-600 dark:text-error-500">
            Log an alert, optionally with a short audio recording as a record of what's happening.
          </p>
        </button>
      </div>

      {openKind && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          {confirmedContacts ? (
            <div>
              <h4 className="text-base font-semibold text-success-600 dark:text-success-400">
                {kindLabels[openKind]} alert logged
              </h4>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This alert is saved to your account and visible below. It has <strong>not</strong> been sent as an
                SMS or call — Pocket Health has no SMS/telephony integration yet. Your emergency contacts on file:
              </p>
              {confirmedContacts.length > 0 ? (
                <ul className="mt-2 list-inside list-disc text-sm text-gray-700 dark:text-gray-300">
                  {confirmedContacts.map((name) => (
                    <li key={name}>{name}</li>
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
                <Button size="sm" variant="outline" onClick={useMyLocation} disabled={locating}>
                  {locating ? "Getting location..." : "Use my location"}
                </Button>
                {location && <span className="text-sm text-gray-500 dark:text-gray-400">📍 {location}</span>}
              </div>

              {openKind === "life_in_danger" && (
                <div className="mt-4 rounded-lg border border-gray-100 p-4 dark:border-gray-800">
                  <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Record option</p>
                  {recorder.status !== "recording" ? (
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
                </div>
              )}

              {sendError && <p className="mt-3 text-sm text-error-500">{sendError}</p>}

              <div className="mt-5 flex justify-end gap-3">
                <Button variant="outline" onClick={resetPanel}>
                  Cancel
                </Button>
                <Button onClick={send} disabled={sending || !profile}>
                  {sending ? "Logging..." : "Send Alert"}
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
