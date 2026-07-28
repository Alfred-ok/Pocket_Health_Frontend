import { ShootingStarIcon } from "../../icons";
import type { Review } from "../../types/pocketHealth";

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No reviews yet.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.reviewId} className="border-b border-gray-100 pb-4 last:border-0 dark:border-gray-800">
          <div className="flex items-center gap-1 text-sm text-warning-500">
            <ShootingStarIcon className="size-4" />
            {((r.ratingQuality + r.ratingHelpful + r.ratingTimely + r.ratingCare) / 4).toFixed(1)}
          </div>
          {r.reviewText && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{r.reviewText}</p>}
        </div>
      ))}
    </div>
  );
}
