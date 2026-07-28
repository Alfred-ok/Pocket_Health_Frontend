import { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import transactionsApi from "../../api/transactionsApi";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletId: string;
  onToppedUp?: () => void;
}

const paymentMethods = [
  { value: "mpesa", label: "M-Pesa" },
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
];

const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose, walletId, onToppedUp }) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [mpesaReference, setMpesaReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setAmount("");
    setPaymentMethod("mpesa");
    setMpesaReference("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async () => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await transactionsApi.create({
        walletId,
        amount: numericAmount,
        type: "top_up",
        paymentMethod,
        mpesaReference: mpesaReference || undefined,
        status: "completed",
      });
      setSuccess(true);
      onToppedUp?.();
    } catch {
      setError("Top up failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-6">
      <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">Top Up Wallet</h3>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        Add funds to your PocketHealth wallet.
      </p>

      {success ? (
        <div className="py-6 text-center">
          <p className="text-success-600 dark:text-success-400">Wallet topped up successfully.</p>
          <Button className="mt-4" onClick={handleClose}>
            Done
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <Label>Amount (KES)</Label>
            <Input type="number" placeholder="e.g. 1000" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="mb-4">
            <Label>Payment method</Label>
            <Select
              options={paymentMethods}
              defaultValue={paymentMethod}
              onChange={setPaymentMethod}
              placeholder="Select payment method"
            />
          </div>

          {paymentMethod === "mpesa" && (
            <div className="mb-4">
              <Label>M-Pesa reference (optional)</Label>
              <Input
                placeholder="e.g. QGH7XJ2K"
                value={mpesaReference}
                onChange={(e) => setMpesaReference(e.target.value)}
              />
            </div>
          )}

          {error && <p className="mb-3 text-sm text-error-500">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Processing..." : "Top Up"}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default TopUpModal;
