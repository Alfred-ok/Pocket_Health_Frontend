import { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { useMyProfile } from "../../hooks/useMyProfile";
import { useAuthStore } from "../../store/authStore";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import profilesApi, { ProfileBody } from "../../api/profilesApi";

const emptyForm: ProfileBody = {
  surname: "",
  otherNames: "",
  relation: "",
  dateOfBirth: "",
  phone1: "",
};

export default function DependantsCard() {
  const { user } = useAuthStore();
  const { profile, dependants, loading, reload } = useMyProfile();
  const { isOpen, openModal, closeModal } = useModal();

  const [form, setForm] = useState<ProfileBody>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    setForm(emptyForm);
    setError(null);
    openModal();
  };

  const handleSave = async () => {
    if (!user?.userId || !form.surname) {
      setError("Surname is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await profilesApi.create({ ...form, userId: user.userId, isPrimary: false });
      reload();
      closeModal();
    } catch {
      setError("Failed to add dependant.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex items-start justify-between gap-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Dependants</h4>
        {profile && (
          <Button size="sm" variant="outline" onClick={handleOpen}>
            Add dependant
          </Button>
        )}
      </div>

      {loading && <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading...</p>}
      {!loading && dependants.length === 0 && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          No dependants added yet. Add a family member to manage their appointments too.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {dependants.map((d) => (
          <div
            key={d.profileId}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 p-3 dark:border-gray-800"
          >
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {[d.otherNames, d.surname].filter(Boolean).join(" ")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {d.relation ?? "Dependant"}
                {d.phone1 ? ` · ${d.phone1}` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md p-6">
        <h4 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">Add dependant</h4>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          Add a family member's profile to manage on their behalf.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Surname</Label>
            <Input value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} />
          </div>
          <div>
            <Label>Other names</Label>
            <Input value={form.otherNames} onChange={(e) => setForm({ ...form, otherNames: e.target.value })} />
          </div>
          <div>
            <Label>Relation</Label>
            <Input
              placeholder="e.g. Child, Spouse"
              value={form.relation}
              onChange={(e) => setForm({ ...form, relation: e.target.value })}
            />
          </div>
          <div>
            <Label>Date of birth</Label>
            <Input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Phone (optional)</Label>
            <Input value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-error-500">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Add dependant"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
