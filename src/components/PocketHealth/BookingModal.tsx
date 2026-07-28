import { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import DatePicker from "../form/date-picker";
import availabilityApi from "../../api/availabilityApi";
import appointmentsApi from "../../api/appointmentsApi";
import type { AvailableSlot } from "../../types/pocketHealth";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
  patientProfileId: string | null;
  onBooked?: () => void;
}

function formatSlotTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  providerId,
  providerName,
  patientProfileId,
  onBooked,
}) => {
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDateChange = async (dateStr: string) => {
    setDate(dateStr);
    setSelectedSlot(null);
    setError(null);
    setLoadingSlots(true);
    try {
      const result = await availabilityApi.getSlots(providerId, dateStr);
      setSlots(result);
    } catch {
      setError("Failed to load available slots for this date");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirm = async () => {
    if (!patientProfileId || !selectedSlot) return;
    setBooking(true);
    setError(null);
    try {
      await appointmentsApi.book({
        patientProfileId,
        providerId,
        scheduledAt: selectedSlot.startTime,
        durationSlot: selectedSlot.durationMinutes,
      });
      setSuccess(true);
      onBooked?.();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Could not book this slot. It may have just been taken.";
      setError(message);
    } finally {
      setBooking(false);
    }
  };

  const handleClose = () => {
    setDate(null);
    setSlots([]);
    setSelectedSlot(null);
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-6">
      <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">Book Appointment</h3>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">with {providerName}</p>

      {success ? (
        <div className="py-6 text-center">
          <p className="text-success-600 dark:text-success-400">Appointment booked successfully.</p>
          <Button className="mt-4" onClick={handleClose}>
            Done
          </Button>
        </div>
      ) : !patientProfileId ? (
        <p className="text-sm text-error-500">No patient profile found on your account.</p>
      ) : (
        <>
          <DatePicker
            id="booking-date-picker"
            label="Choose a date"
            placeholder="Select a date"
            onChange={(_, dateStr) => handleDateChange(dateStr)}
          />

          {date && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Available slots</p>
              {loadingSlots && <p className="text-sm text-gray-500 dark:text-gray-400">Loading slots...</p>}
              {!loadingSlots && slots.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No open slots on this date.</p>
              )}
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.startTime}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      selectedSlot?.startTime === slot.startTime
                        ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    {formatSlotTime(slot.startTime)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-error-500">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedSlot || booking}>
              {booking ? "Booking..." : "Confirm booking"}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default BookingModal;
