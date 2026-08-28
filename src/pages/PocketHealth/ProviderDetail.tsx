import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import BookingModal from "../../components/PocketHealth/BookingModal";
import ReviewList from "../../components/PocketHealth/ReviewList";
import { useModal } from "../../hooks/useModal";
import { useAuthStore } from "../../store/authStore";
import { useActiveProfile } from "../../hooks/useActiveProfile";
import providersApi from "../../api/providersApi";
import reviewsApi from "../../api/reviewsApi";
import consultationsApi from "../../api/consultationsApi";
import { categoryLabels, feeLabel } from "../../constants/providerCategories";
import { ShootingStarIcon, VideoIcon, AudioIcon, ChatIcon } from "../../icons";
import type { Provider, Review } from "../../types/pocketHealth";
import type { ProviderRating } from "../../api/reviewsApi";

const callTypes = [
  { value: "video", label: "Video call", icon: VideoIcon },
  { value: "audio", label: "Audio call", icon: AudioIcon },
  { value: "chat", label: "Chat", icon: ChatIcon },
];

export default function ProviderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeProfile: profile } = useActiveProfile();
  const bookingModal = useModal();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<ProviderRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingCall, setStartingCall] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([providersApi.getById(id), reviewsApi.getByProvider(id), reviewsApi.getRating(id)])
      .then(([p, r, rt]) => {
        setProvider(p);
        setReviews(r);
        setRating(rt);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const startConsultation = async (callType: string) => {
    if (!id || !profile) return;
    setStartingCall(true);
    setCallError(null);
    try {
      const consultation = await consultationsApi.create({
        patientProfileId: profile.profileId,
        providerId: id,
        callType,
      });
      navigate(`/consultations?highlight=${consultation.consultationId}`);
    } catch {
      setCallError("Could not start a consultation right now.");
    } finally {
      setStartingCall(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-500 dark:text-gray-400">Loading provider...</p>;
  if (!provider) return <p className="text-sm text-error-500">Provider not found.</p>;

  const canBook = user?.userCategory === "patient" || user?.userCategory === "admin";

  return (
    <>
      <PageMeta title={`${provider.providerName} | PocketHealth`} description="Provider profile and booking" />
      <PageBreadcrumb pageTitle="Provider Profile" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">{provider.providerName}</h1>
              {provider.isVerified && (
                <Badge color="success" size="sm">
                  Verified
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {provider.specialty ?? (provider.category ? categoryLabels[provider.category] ?? provider.category : null)}
            </p>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
              {[provider.location, provider.region].filter(Boolean).join(", ")}
            </p>
            <div className="mt-2 flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
              <ShootingStarIcon className="size-4 text-warning-500" />
              {rating && rating.totalReviews > 0
                ? `${rating.averageRating.toFixed(1)} (${rating.totalReviews} reviews)`
                : "No reviews yet"}
            </div>
          </div>

          {provider.rates != null && (
            <div className="text-right">
              <p className="text-xs text-gray-400 dark:text-gray-500">{feeLabel(provider.category)}</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                KES {Number(provider.rates).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {canBook && (
          <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={bookingModal.openModal} disabled={!provider.isAvailable}>
                Book Appointment
              </Button>
              {callTypes.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant="outline"
                  startIcon={<Icon className="size-4" />}
                  onClick={() => startConsultation(value)}
                  disabled={startingCall || !profile}
                >
                  {label}
                </Button>
              ))}
            </div>
            {!provider.isAvailable && (
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                This provider is not currently accepting appointments.
              </p>
            )}
            {callError && <p className="mt-2 text-sm text-error-500">{callError}</p>}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">Reviews</h3>
        <ReviewList reviews={reviews} />
      </div>

      <BookingModal
        isOpen={bookingModal.isOpen}
        onClose={bookingModal.closeModal}
        providerId={provider.providerId}
        providerName={provider.providerName}
        patientProfileId={profile?.profileId ?? null}
      />
    </>
  );
}
