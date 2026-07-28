import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import NewConsultationModal from "../../components/PocketHealth/NewConsultationModal";
import LeaveReviewModal from "../../components/PocketHealth/LeaveReviewModal";
import { useModal } from "../../hooks/useModal";
import { useAuthStore } from "../../store/authStore";
import { useMyProfile } from "../../hooks/useMyProfile";
import { useMyProvider } from "../../hooks/useMyProvider";
import consultationsApi from "../../api/consultationsApi";
import { VideoIcon, AudioIcon, ChatIcon, PlusIcon } from "../../icons";
import type { Consultation } from "../../types/pocketHealth";

type StatusFilter = "all" | "scheduled" | "completed" | "cancelled";

const statusColor: Record<string, "warning" | "success" | "error" | "light"> = {
  scheduled: "warning",
  completed: "success",
  cancelled: "error",
};

const callTypeIcon: Record<string, React.FC<{ className?: string }>> = {
  video: VideoIcon,
  audio: AudioIcon,
  chat: ChatIcon,
};

function patientName(c: Consultation) {
  const p = c.patientProfile;
  return [p.otherNames, p.surname].filter(Boolean).join(" ") || p.surname;
}

export default function Consultations() {
  const { user } = useAuthStore();
  const role = user?.userCategory ?? "patient";
  const { profile } = useMyProfile();
  const { provider } = useMyProvider();
  const newConsultationModal = useModal();
  const reviewModal = useModal();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [actionError, setActionError] = useState<string | null>(null);
  const [reviewingConsultation, setReviewingConsultation] = useState<Consultation | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const openReviewModal = (c: Consultation) => {
    setReviewingConsultation(c);
    reviewModal.openModal();
  };

  const load = () => {
    setLoading(true);
    let request: Promise<Consultation[]> | null = null;
    if (role === "provider" && provider) request = consultationsApi.getByProvider(provider.providerId);
    else if (role === "admin") request = consultationsApi.getAll();
    else if (profile) request = consultationsApi.getByProfile(profile.profileId);

    if (!request) {
      setLoading(false);
      return;
    }
    request.then(setConsultations).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, profile?.profileId, provider?.providerId]);

  const filtered = useMemo(
    () => consultations.filter((c) => statusFilter === "all" || c.status === statusFilter),
    [consultations, statusFilter]
  );

  const handleStart = async (id: string) => {
    setActionError(null);
    try {
      await consultationsApi.update(id, { startedAt: new Date().toISOString() });
      load();
    } catch {
      setActionError("Failed to start consultation.");
    }
  };

  const handleEnd = async (c: Consultation) => {
    setActionError(null);
    try {
      await consultationsApi.update(c.consultationId, {
        status: "completed",
        endedAt: new Date().toISOString(),
        amountCharged: c.provider.rates ?? undefined,
      });
      load();
    } catch {
      setActionError("Failed to end consultation.");
    }
  };

  const handleCancel = async (id: string) => {
    setActionError(null);
    try {
      await consultationsApi.update(id, { status: "cancelled" });
      load();
    } catch {
      setActionError("Failed to cancel consultation.");
    }
  };

  const canStartNew = role === "patient" || role === "admin";

  return (
    <>
      <PageMeta title="Consultations | PocketHealth" description="Video, audio and chat consultations" />
      <PageBreadcrumb pageTitle="Consultations" />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["all", "scheduled", "completed", "cancelled"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-sm capitalize transition ${
                statusFilter === s
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {canStartNew && (
          <Button size="sm" startIcon={<PlusIcon className="size-4" />} onClick={newConsultationModal.openModal}>
            New Consultation
          </Button>
        )}
      </div>

      {actionError && <p className="mb-3 text-sm text-error-500">{actionError}</p>}
      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading consultations...</p>}
      {!loading && filtered.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No consultations found.</p>
      )}

      <div className="space-y-3">
        {filtered.map((c) => {
          const Icon = callTypeIcon[c.callType] ?? ChatIcon;
          return (
            <div
              key={c.consultationId}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 dark:bg-white/[0.03] ${
                highlightId === c.consultationId
                  ? "border-brand-400 bg-brand-50 dark:border-brand-500"
                  : "border-gray-200 bg-white dark:border-gray-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {role === "provider" ? patientName(c) : c.provider.providerName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{c.callType} call</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {c.amountCharged != null && (
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    KES {Number(c.amountCharged).toLocaleString()}
                  </span>
                )}
                <Badge color={statusColor[c.status] ?? "light"} size="sm">
                  {c.status}
                </Badge>

                <Link
                  to={`/consultations/${c.consultationId}`}
                  className="text-sm text-gray-500 hover:text-gray-700 hover:underline dark:text-gray-400"
                >
                  Open
                </Link>

                {role === "provider" && c.status === "scheduled" && !c.startedAt && (
                  <button
                    onClick={() => handleStart(c.consultationId)}
                    className="text-sm text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Start
                  </button>
                )}
                {role === "provider" && c.status === "scheduled" && c.startedAt && (
                  <button
                    onClick={() => handleEnd(c)}
                    className="text-sm text-success-600 hover:underline dark:text-success-400"
                  >
                    End
                  </button>
                )}
                {c.status === "scheduled" && (
                  <button onClick={() => handleCancel(c.consultationId)} className="text-sm text-error-500 hover:underline">
                    Cancel
                  </button>
                )}
                {role === "patient" && c.status === "completed" && !reviewedIds.has(c.consultationId) && (
                  <button
                    onClick={() => openReviewModal(c)}
                    className="text-sm text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Leave a review
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <NewConsultationModal
        isOpen={newConsultationModal.isOpen}
        onClose={newConsultationModal.closeModal}
        patientProfileId={profile?.profileId ?? null}
        onCreated={load}
      />

      {reviewingConsultation && profile && (
        <LeaveReviewModal
          isOpen={reviewModal.isOpen}
          onClose={reviewModal.closeModal}
          reviewerProfileId={profile.profileId}
          providerId={reviewingConsultation.provider.providerId}
          providerName={reviewingConsultation.provider.providerName}
          onSubmitted={() => setReviewedIds((prev) => new Set(prev).add(reviewingConsultation.consultationId))}
        />
      )}
    </>
  );
}
