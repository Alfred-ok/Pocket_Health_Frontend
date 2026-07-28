import { useEffect, useState } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import { useAuthStore } from "../../store/authStore";
import { useMyProvider } from "../../hooks/useMyProvider";
import consultationsApi from "../../api/consultationsApi";
import medicalRequestsApi from "../../api/medicalRequestsApi";
import type { MedicalRequest } from "../../types/pocketHealth";

const typeLabel: Record<string, string> = {
  prescription: "Prescription",
  referral: "Referral",
  lab_order: "Lab order",
};

export default function MedicalRequests() {
  const { user } = useAuthStore();
  const role = user?.userCategory ?? "patient";
  const { provider } = useMyProvider();

  const [requests, setRequests] = useState<MedicalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const loadForProvider = async () => {
      if (!provider) return [];
      const consultations = await consultationsApi.getByProvider(provider.providerId);
      const perConsultation = await Promise.all(
        consultations.map((c) => medicalRequestsApi.getByConsultation(c.consultationId))
      );
      return perConsultation.flat();
    };

    const loadForAdmin = () => medicalRequestsApi.getAll();

    const request = role === "admin" ? loadForAdmin() : loadForProvider();
    request
      .then((all) => all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      .then(setRequests)
      .finally(() => setLoading(false));
  }, [role, provider]);

  return (
    <>
      <PageMeta title="Medical Requests | PocketHealth" description="Prescriptions, referrals and lab orders you've issued." />
      <PageBreadcrumb pageTitle="Medical Requests" />

      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading medical requests...</p>}
      {!loading && requests.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No medical requests yet.</p>
      )}

      <div className="space-y-3">
        {requests.map((r) => (
          <div
            key={r.requestId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div>
              <div className="flex items-center gap-2">
                <Badge color="primary" size="sm">
                  {typeLabel[r.requestType] ?? r.requestType}
                </Badge>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(r.createdAt).toLocaleString()}
                </span>
              </div>
              {r.content && <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{r.content}</p>}
              {r.sentToProvider && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Referred to {r.sentToProvider.providerName}
                </p>
              )}
            </div>
            {r.consultation && (
              <Link
                to={`/consultations/${r.consultation.consultationId}`}
                className="text-sm text-brand-500 hover:text-brand-600"
              >
                View consultation →
              </Link>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
