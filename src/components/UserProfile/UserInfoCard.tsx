import { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { useMyProfile } from "../../hooks/useMyProfile";
import { useAuthStore } from "../../store/authStore";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import profilesApi, { ProfileBody } from "../../api/profilesApi";
import type { Profile } from "../../types/pocketHealth";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

function toFormState(profile: Profile | null): ProfileBody {
  return {
    surname: profile?.surname ?? "",
    otherNames: profile?.otherNames ?? "",
    dateOfBirth: profile?.dateOfBirth ?? "",
    gender: profile?.gender ?? "",
    phone1: profile?.phone1 ?? "",
    residence: profile?.residence ?? "",
    region: profile?.region ?? "",
  };
}

export default function UserInfoCard() {
  const { user } = useAuthStore();
  const { profile, loading, error, reload } = useMyProfile();
  const { isOpen, openModal, closeModal } = useModal();

  const [form, setForm] = useState<ProfileBody>(() => toFormState(profile));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleOpen = () => {
    setForm(toFormState(profile));
    setSaveError(null);
    openModal();
  };

  const handleSave = async () => {
    if (!user?.userId) return;
    setSaving(true);
    setSaveError(null);
    try {
      if (profile) {
        await profilesApi.update(profile.profileId, form);
      } else {
        await profilesApi.create({ ...form, userId: user.userId, isPrimary: true });
      }
      reload();
      closeModal();
    } catch {
      setSaveError("Failed to save profile. Please check your details and try again.");
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, value: string | null | undefined) => (
    <div>
      <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-white/90">{value || "—"}</p>
    </div>
  );

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>}

          {!loading && !profile && (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {error ?? "You haven't completed your profile yet."} Add your details so you can book
                appointments and consultations.
              </p>
              <Button size="sm" className="mt-3" onClick={handleOpen}>
                Complete profile
              </Button>
            </div>
          )}

          {!loading && profile && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              {field("Surname", profile.surname)}
              {field("Other names", profile.otherNames)}
              {field("Email", user?.email)}
              {field("Phone", profile.phone1)}
              {field("Date of birth", profile.dateOfBirth)}
              {field("Gender", profile.gender)}
              {field("Residence", profile.residence)}
              {field("Region", profile.region)}
            </div>
          )}
        </div>

        {profile && (
          <button
            onClick={handleOpen}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            Edit
          </button>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {profile ? "Edit Personal Information" : "Complete Your Profile"}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <div className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Surname</Label>
                  <Input
                    value={form.surname}
                    onChange={(e) => setForm({ ...form, surname: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Other names</Label>
                  <Input
                    value={form.otherNames}
                    onChange={(e) => setForm({ ...form, otherNames: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={form.phone1}
                    onChange={(e) => setForm({ ...form, phone1: e.target.value })}
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
                <div>
                  <Label>Gender</Label>
                  <Select
                    options={genderOptions}
                    defaultValue={form.gender}
                    onChange={(value) => setForm({ ...form, gender: value })}
                    placeholder="Select gender"
                  />
                </div>
                <div>
                  <Label>Residence</Label>
                  <Input
                    value={form.residence}
                    onChange={(e) => setForm({ ...form, residence: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Region</Label>
                  <Input
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                  />
                </div>
              </div>
              {saveError && <p className="mt-4 text-sm text-error-500">{saveError}</p>}
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
