import { useEffect, useState } from "react";
import { useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import MedicalRequestPanel from "../../components/PocketHealth/MedicalRequestPanel";
import LeaveReviewModal from "../../components/PocketHealth/LeaveReviewModal";
import { useModal } from "../../hooks/useModal";
import { useAuthStore } from "../../store/authStore";
import { useMyProfile } from "../../hooks/useMyProfile";
import consultationsApi from "../../api/consultationsApi";
import { VideoIcon, AudioIcon, ChatIcon } from "../../icons";
import type { Consultation } from "../../types/pocketHealth";

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

export default function ConsultationRoom() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { profile } = useMyProfile();
  const role = user?.userCategory ?? "patient";
  const reviewModal = useModal();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    consultationsApi
      .getById(id)
      .then(setConsultation)
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleStart = async () => {
    if (!consultation) return;
    setActionError(null);
    try {
      await consultationsApi.update(consultation.consultationId, { startedAt: new Date().toISOString() });
      load();
    } catch {
      setActionError("Failed to start consultation.");
    }
  };

  const handleEnd = async () => {
    if (!consultation) return;
    setActionError(null);
    try {
      await consultationsApi.update(consultation.consultationId, {
        status: "completed",
        endedAt: new Date().toISOString(),
        amountCharged: consultation.provider.rates ?? undefined,
      });
      load();
    } catch {
      setActionError("Failed to end consultation.");
    }
  };

  const handleCancel = async () => {
    if (!consultation) return;
    setActionError(null);
    try {
      await consultationsApi.update(consultation.consultationId, { status: "cancelled" });
      load();
    } catch {
      setActionError("Failed to cancel consultation.");
    }
  };

  if (loading) return <p className="text-sm text-gray-500 dark:text-gray-400">Loading consultation...</p>;
  if (!consultation) return <p className="text-sm text-error-500">Consultation not found.</p>;

  const Icon = callTypeIcon[consultation.callType] ?? ChatIcon;
  const canManage = role === "provider" || role === "admin";

  return (
    <>
      <PageMeta title="Consultation | PocketHealth" description="Consultation session details and medical requests." />
      <PageBreadcrumb pageTitle="Consultation" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15">
              <Icon className="size-5" />
            </span>
            <div>
              <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90 capitalize">
                {consultation.callType} consultation
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {role === "provider" ? patientName(consultation) : consultation.provider.providerName}
              </p>
            </div>
          </div>
          <Badge color={statusColor[consultation.status] ?? "light"} size="md">
            {consultation.status}
          </Badge>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 dark:border-gray-800 sm:grid-cols-4">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Started</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {consultation.startedAt ? new Date(consultation.startedAt).toLocaleString() : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Ended</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {consultation.endedAt ? new Date(consultation.endedAt).toLocaleString() : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Amount charged</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {consultation.amountCharged != null ? `KES ${Number(consultation.amountCharged).toLocaleString()}` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Call type</p>
            <p className="text-sm capitalize text-gray-700 dark:text-gray-300">{consultation.callType}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-white/5 dark:text-gray-400">
          Live video/audio calling isn't wired up yet — this room tracks session status and lets your provider
          issue prescriptions, referrals and lab orders below.
        </div>

        {actionError && <p className="mt-3 text-sm text-error-500">{actionError}</p>}

        <div className="mt-4 flex flex-wrap gap-3">
          {canManage && consultation.status === "scheduled" && !consultation.startedAt && (
            <Button size="sm" onClick={handleStart}>
              Start session
            </Button>
          )}
          {canManage && consultation.status === "scheduled" && consultation.startedAt && (
            <Button size="sm" onClick={handleEnd}>
              End session
            </Button>
          )}
          {consultation.status === "scheduled" && (
            <Button size="sm" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          )}
          {role === "patient" && consultation.status === "completed" && !reviewed && (
            <Button size="sm" variant="outline" onClick={reviewModal.openModal}>
              Leave a review
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <MedicalRequestPanel consultationId={consultation.consultationId} canCreate={canManage} />
      </div>

      {profile && (
        <LeaveReviewModal
          isOpen={reviewModal.isOpen}
          onClose={reviewModal.closeModal}
          reviewerProfileId={profile.profileId}
          providerId={consultation.provider.providerId}
          providerName={consultation.provider.providerName}
          onSubmitted={() => setReviewed(true)}
        />
      )}
    </>
  );
}
