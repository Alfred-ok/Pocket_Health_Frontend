import { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Select from "../form/Select";
import TextArea from "../form/input/TextArea";
import Input from "../form/input/InputField";
import medicalRequestsApi from "../../api/medicalRequestsApi";
import providersApi from "../../api/providersApi";
import type { MedicalRequest, Provider } from "../../types/pocketHealth";

interface MedicalRequestPanelProps {
  consultationId: string;
  canCreate: boolean;
}

const typeOptions = [
  { value: "prescription", label: "Prescription" },
  { value: "referral", label: "Referral" },
  { value: "lab_order", label: "Lab order" },
];

const typeLabel: Record<string, string> = {
  prescription: "Prescription",
  referral: "Referral",
  lab_order: "Lab order",
};

export default function MedicalRequestPanel({ consultationId, canCreate }: MedicalRequestPanelProps) {
  const [requests, setRequests] = useState<MedicalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [requestType, setRequestType] = useState("prescription");
  const [content, setContent] = useState("");
  const [referralQuery, setReferralQuery] = useState("");
  const [referralResults, setReferralResults] = useState<Provider[]>([]);
  const [selectedReferral, setSelectedReferral] = useState<Provider | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    medicalRequestsApi
      .getByConsultation(consultationId)
      .then(setRequests)
      .finally(() => setLoading(false));
  };

  useEffect(load, [consultationId]);

  useEffect(() => {
    if (requestType !== "referral" || referralQuery.trim().length < 2) {
      setReferralResults([]);
      return;
    }
    let cancelled = false;
    providersApi.search({ query: referralQuery }).then((results) => {
      if (!cancelled) setReferralResults(results);
    });
    return () => {
      cancelled = true;
    };
  }, [requestType, referralQuery]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Add some details for this request.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await medicalRequestsApi.create({
        consultationId,
        requestType,
        content,
        sentToProviderId: requestType === "referral" ? selectedReferral?.providerId : undefined,
      });
      setContent("");
      setReferralQuery("");
      setSelectedReferral(null);
      load();
    } catch {
      setError("Failed to create request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">Medical requests</h3>

      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>}
      {!loading && requests.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No prescriptions, referrals or lab orders yet.</p>
      )}

      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r.requestId} className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <Badge color="primary" size="sm">
                {typeLabel[r.requestType] ?? r.requestType}
              </Badge>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(r.createdAt).toLocaleString()}
              </span>
            </div>
            {r.content && <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{r.content}</p>}
            {r.sentToProvider && (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Referred to {r.sentToProvider.providerName}
              </p>
            )}
          </div>
        ))}
      </div>

      {canCreate && (
        <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-800">
          <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">New request</h4>

          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select options={typeOptions} defaultValue={requestType} onChange={setRequestType} />
            </div>

            {requestType === "referral" && (
              <div className="relative">
                <Label>Refer to provider</Label>
                <Input
                  placeholder="Search provider by name or specialty..."
                  value={selectedReferral ? selectedReferral.providerName : referralQuery}
                  onChange={(e) => {
                    setSelectedReferral(null);
                    setReferralQuery(e.target.value);
                  }}
                />
                {referralResults.length > 0 && !selectedReferral && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-theme-md dark:border-gray-700 dark:bg-gray-900">
                    {referralResults.map((p) => (
                      <button
                        key={p.providerId}
                        type="button"
                        onClick={() => {
                          setSelectedReferral(p);
                          setReferralResults([]);
                        }}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                      >
                        {p.providerName}
                        <span className="ml-1 text-gray-400">{p.specialty ?? p.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <Label>Details</Label>
              <TextArea value={content} onChange={setContent} rows={3} />
            </div>

            {error && <p className="text-sm text-error-500">{error}</p>}

            <Button size="sm" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Sending..." : "Create request"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
