import { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { useMyProfile } from "../../hooks/useMyProfile";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import nextOfKinApi, { NextOfKinBody } from "../../api/nextOfKinApi";

const priorityOptions = [
  { value: 1, label: "Primary" },
  { value: 2, label: "Secondary" },
  { value: 3, label: "Other" },
];

const emptyForm: NextOfKinBody = {
  profileId: "",
  fullName: "",
  relationship: "",
  phone1: "",
  phone2: "",
  emergencyType: "",
  priority: 1,
};

export default function NextOfKinCard() {
  const { profile, nextOfKin, loading, reload } = useMyProfile();
  const { isOpen, openModal, closeModal } = useModal();

  const [form, setForm] = useState<NextOfKinBody>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    if (!profile) return;

    setForm({
      ...emptyForm,
      profileId: profile.profileId,
    });

    setError(null);
    openModal();
  };

  const handleSave = async () => {
    if (!profile) return;

    if (!form.fullName || !form.relationship || !form.phone1) {
      setError("Full name, relationship and phone are required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await nextOfKinApi.create(form);

      reload();
      closeModal();
    } catch {
      setError("Failed to save next of kin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">

      <div className="flex items-start justify-between gap-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Next of Kin
        </h4>

        {profile && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleOpen}
          >
            Add Next of Kin
          </Button>
        )}
      </div>

      {loading && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Loading...
        </p>
      )}

      {!loading && nextOfKin.length === 0 && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          We capture the basic fundamental aspects of your next of kin
          information here for emergency contact purposes.
        </p>
      )}

      <div className="mt-4 space-y-3">

        {nextOfKin.map((k) => (

          <div
            key={k.nextOfKinId}
            className="rounded-lg border border-gray-100 p-3 dark:border-gray-800"
          >

            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {k.fullName}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {k.relationship}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {k.phone1}
            </p>

            {k.phone2 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {k.phone2}
              </p>
            )}

            {k.emergencyType && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {k.emergencyType}
              </p>
            )}

            <p className="text-xs font-medium text-brand-500 mt-1">
              Priority {k.priority}
            </p>

          </div>

        ))}

      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-md p-6"
      >

        <h4 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          Add Next of Kin
        </h4>

        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          Add the person to be contacted during a medical emergency.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="sm:col-span-2">
            <Label>Full Name</Label>

            <Input
              value={form.fullName}
              onChange={(e) =>
                setForm({
                  ...form,
                  fullName: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label>Relationship</Label>

            <Input
              placeholder="Father, Mother, Brother..."
              value={form.relationship}
              onChange={(e) =>
                setForm({
                  ...form,
                  relationship: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label>Emergency Type</Label>

            <Input
              placeholder="Medical Emergency"
              value={form.emergencyType}
              onChange={(e) =>
                setForm({
                  ...form,
                  emergencyType: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label>Primary Phone</Label>

            <Input
              value={form.phone1}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone1: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label>Alternative Phone</Label>

            <Input
              value={form.phone2}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone2: e.target.value,
                })
              }
            />
          </div>

          <div className="sm:col-span-2">

            <Label>Priority</Label>

            <Select
              options={priorityOptions}
              defaultValue={form.priority}
              placeholder="Select priority"
              onChange={(value) =>
                setForm({
                  ...form,
                  priority: Number(value),
                })
              }
            />

          </div>

        </div>

        {error && (
          <p className="mt-3 text-sm text-error-500">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">

          <Button
            variant="outline"
            onClick={closeModal}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>

        </div>

      </Modal>

    </div>
  );
}