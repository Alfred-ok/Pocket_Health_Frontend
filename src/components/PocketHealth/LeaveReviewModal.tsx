import { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import TextArea from "../form/input/TextArea";
import reviewsApi from "../../api/reviewsApi";
import { ShootingStarIcon } from "../../icons";

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewerProfileId: string;
  providerId: string;
  providerName: string;
  onSubmitted?: () => void;
}

const ratingFields = [
  { key: "ratingQuality", label: "Quality of care" },
  { key: "ratingHelpful", label: "Helpfulness" },
  { key: "ratingTimely", label: "Timeliness" },
  { key: "ratingCare", label: "Bedside manner" },
] as const;

type RatingKey = (typeof ratingFields)[number]["key"];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="text-warning-500">
          <ShootingStarIcon className={`size-5 ${n <= value ? "opacity-100" : "opacity-25"}`} />
        </button>
      ))}
    </div>
  );
}

const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  isOpen,
  onClose,
  reviewerProfileId,
  providerId,
  providerName,
  onSubmitted,
}) => {
  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    ratingQuality: 5,
    ratingHelpful: 5,
    ratingTimely: 5,
    ratingCare: 5,
  });
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setRatings({ ratingQuality: 5, ratingHelpful: 5, ratingTimely: 5, ratingCare: 5 });
    setReviewText("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await reviewsApi.create({
        reviewerProfileId,
        providerId,
        ...ratings,
        reviewText: reviewText || undefined,
      });
      setSuccess(true);
      onSubmitted?.();
    } catch {
      setError("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-6">
      <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">Leave a review</h3>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">for {providerName}</p>

      {success ? (
        <div className="py-6 text-center">
          <p className="text-success-600 dark:text-success-400">Thanks for your feedback!</p>
          <Button className="mt-4" onClick={handleClose}>
            Done
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {ratingFields.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="mb-0">{label}</Label>
                <StarPicker value={ratings[key]} onChange={(v) => setRatings({ ...ratings, [key]: v })} />
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Label>Comments (optional)</Label>
            <TextArea value={reviewText} onChange={setReviewText} rows={3} />
          </div>

          {error && <p className="mt-3 text-sm text-error-500">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit review"}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default LeaveReviewModal;
