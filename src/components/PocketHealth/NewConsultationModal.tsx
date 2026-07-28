import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import providersApi from "../../api/providersApi";
import consultationsApi from "../../api/consultationsApi";
import type { Provider } from "../../types/pocketHealth";

interface NewConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientProfileId: string | null;
  onCreated?: () => void;
}

const callTypes = [
  { value: "video", label: "Video call" },
  { value: "audio", label: "Audio call" },
  { value: "chat", label: "Chat" },
];

const selectClasses =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const NewConsultationModal: React.FC<NewConsultationModalProps> = ({
  isOpen,
  onClose,
  patientProfileId,
  onCreated,
}) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerId, setProviderId] = useState("");
  const [callType, setCallType] = useState("video");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) providersApi.search({ available: true }).then(setProviders);
  }, [isOpen]);

  const handleCreate = async () => {
    if (!patientProfileId || !providerId) return;
    setSubmitting(true);
    setError(null);
    try {
      await consultationsApi.create({ patientProfileId, providerId, callType });
      onCreated?.();
      onClose();
    } catch {
      setError("Could not start the consultation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">New Consultation</h3>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Provider</label>
          <select value={providerId} onChange={(e) => setProviderId(e.target.value)} className={selectClasses}>
            <option value="">Select a provider</option>
            {providers.map((p) => (
              <option key={p.providerId} value={p.providerId}>
                {p.providerName} — {p.specialty ?? p.category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Call type</label>
          <select value={callType} onChange={(e) => setCallType(e.target.value)} className={selectClasses}>
            {callTypes.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-error-500">{error}</p>}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleCreate} disabled={!providerId || submitting}>
          {submitting ? "Starting..." : "Start Consultation"}
        </Button>
      </div>
    </Modal>
  );
};

export default NewConsultationModal;
