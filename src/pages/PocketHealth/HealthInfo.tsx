import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { useMyProfile } from "../../hooks/useMyProfile";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import healthInfoApi, { HealthInfoBody } from "../../api/healthInfoApi";
import type { HealthInfo } from "../../types/pocketHealth";

const emptyForm: HealthInfoBody = {
  bloodGroup: "",
  allergies: "",
  chronicConditions: "",
  mentalConditions: "",
  longTermMeds: "",
  familyHistory: "",
  drugUse: "",
};

function toFormState(info: HealthInfo | null): HealthInfoBody {
  if (!info) return emptyForm;
  return {
    bloodGroup: info.bloodGroup ?? "",
    allergies: info.allergies ?? "",
    chronicConditions: info.chronicConditions ?? "",
    mentalConditions: info.mentalConditions ?? "",
    longTermMeds: info.longTermMeds ?? "",
    familyHistory: info.familyHistory ?? "",
    drugUse: info.drugUse ?? "",
  };
}

export default function HealthInfoPage() {
  const { profile, loading: profileLoading } = useMyProfile();
  const { isOpen, openModal, closeModal } = useModal();

  const [info, setInfo] = useState<HealthInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<HealthInfoBody>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!profile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    healthInfoApi
      .getByProfile(profile.profileId)
      .then(setInfo)
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [profile]);

  const handleOpen = () => {
    setForm(toFormState(info));
    setError(null);
    openModal();
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      if (info) {
        await healthInfoApi.update(info.healthInfoId, form);
      } else {
        await healthInfoApi.create({ ...form, profileId: profile.profileId });
      }
      load();
      closeModal();
    } catch {
      setError("Failed to save health info.");
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, value: string | null | undefined) => (
    <div>
      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-white/90">{value || "—"}</p>
    </div>
  );

  return (
    <>
      <PageMeta title="Health Info | PocketHealth" description="Blood group, allergies, chronic conditions and medications." />
      <PageBreadcrumb pageTitle="Health Info" />

      {(profileLoading || loading) && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading health information...</p>
      )}

      {!profileLoading && !profile && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Complete your profile first before adding health information.
        </p>
      )}

      {!loading && profile && !info && (
        <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No health information on file yet.
          </p>
          <Button size="sm" className="mt-3" onClick={handleOpen}>
            Add health info
          </Button>
        </div>
      )}

      {!loading && info && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Your health information</h3>
            <Button size="sm" variant="outline" onClick={handleOpen}>
              Edit
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {field("Blood group", info.bloodGroup)}
            {field("Allergies", info.allergies)}
            {field("Chronic conditions", info.chronicConditions)}
            {field("Mental health conditions", info.mentalConditions)}
            {field("Long-term medications", info.longTermMeds)}
            {field("Family history", info.familyHistory)}
            {field("Drug use", info.drugUse)}
          </div>
        </div>
      )}

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-xl p-6">
        <h4 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          {info ? "Edit health information" : "Add health information"}
        </h4>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          This is shared with providers you consult to give them fuller context.
        </p>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          <div>
            <Label>Blood group</Label>
            <Input
              placeholder="e.g. O+"
              value={form.bloodGroup}
              onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
            />
          </div>
          <div>
            <Label>Allergies</Label>
            <TextArea value={form.allergies} onChange={(v) => setForm({ ...form, allergies: v })} rows={2} />
          </div>
          <div>
            <Label>Chronic conditions</Label>
            <TextArea
              value={form.chronicConditions}
              onChange={(v) => setForm({ ...form, chronicConditions: v })}
              rows={2}
            />
          </div>
          <div>
            <Label>Mental health conditions</Label>
            <TextArea
              value={form.mentalConditions}
              onChange={(v) => setForm({ ...form, mentalConditions: v })}
              rows={2}
            />
          </div>
          <div>
            <Label>Long-term medications</Label>
            <TextArea
              value={form.longTermMeds}
              onChange={(v) => setForm({ ...form, longTermMeds: v })}
              rows={2}
            />
          </div>
          <div>
            <Label>Family history</Label>
            <TextArea
              value={form.familyHistory}
              onChange={(v) => setForm({ ...form, familyHistory: v })}
              rows={2}
            />
          </div>
          <div>
            <Label>Drug use</Label>
            <TextArea value={form.drugUse} onChange={(v) => setForm({ ...form, drugUse: v })} rows={2} />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-error-500">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
