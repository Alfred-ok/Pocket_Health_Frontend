import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ReviewList from "../../components/PocketHealth/ReviewList";
import { useMyProvider } from "../../hooks/useMyProvider";
import reviewsApi, { ProviderRating } from "../../api/reviewsApi";
import { ShootingStarIcon } from "../../icons";
import type { Review } from "../../types/pocketHealth";

export default function Reviews() {
  const { provider, loading: providerLoading } = useMyProvider();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<ProviderRating | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!provider) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([reviewsApi.getByProvider(provider.providerId), reviewsApi.getRating(provider.providerId)])
      .then(([r, rt]) => {
        setReviews(r);
        setRating(rt);
      })
      .finally(() => setLoading(false));
  }, [provider]);

  return (
    <>
      <PageMeta title="Reviews | PocketHealth" description="Ratings and feedback from your patients." />
      <PageBreadcrumb pageTitle="My Reviews" />

      {(providerLoading || loading) && <p className="text-sm text-gray-500 dark:text-gray-400">Loading reviews...</p>}
      {!providerLoading && !provider && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No provider record found for this account.</p>
      )}

      {!loading && provider && (
        <>
          <div className="mb-6 flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <span className="flex size-14 items-center justify-center rounded-full bg-warning-50 text-warning-500 dark:bg-warning-500/15">
              <ShootingStarIcon className="size-6" />
            </span>
            <div>
              <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                {rating && rating.totalReviews > 0 ? rating.averageRating.toFixed(1) : "—"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {rating?.totalReviews ?? 0} review{rating?.totalReviews === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">Patient feedback</h3>
            <ReviewList reviews={reviews} />
          </div>
        </>
      )}
    </>
  );
}
