import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { useMyProfile } from "../../hooks/useMyProfile";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import insuranceApi, { InsuranceBody } from "../../api/insuranceApi";
import { PlusIcon, TrashBinIcon, PencilIcon } from "../../icons";
import type { Insurance } from "../../types/pocketHealth";

const emptyForm: InsuranceBody = { insurerName: "", policyNumber: "", phone1: "", phone2: "" };

export default function InsurancePage() {
  const { profile, loading: profileLoading } = useMyProfile();
  const { isOpen, openModal, closeModal } = useModal();

  const [policies, setPolicies] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Insurance | null>(null);
  const [form, setForm] = useState<InsuranceBody>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!profile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    insuranceApi.getByProfile(profile.profileId).then(setPolicies).finally(() => setLoading(false));
  };

  useEffect(load, [profile]);

  const handleOpenAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    openModal();
  };

  const handleOpenEdit = (policy: Insurance) => {
    setEditing(policy);
    setForm({
      insurerName: policy.insurerName,
      policyNumber: policy.policyNumber ?? "",
      phone1: policy.phone1 ?? "",
      phone2: policy.phone2 ?? "",
    });
    setError(null);
    openModal();
  };

  const handleSave = async () => {
    if (!profile || !form.insurerName) {
      setError("Insurer name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await insuranceApi.update(editing.insuranceId, form);
      } else {
        await insuranceApi.create({ ...form, profileId: profile.profileId });
      }
      load();
      closeModal();
    } catch {
      setError("Failed to save insurance details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await insuranceApi.remove(id);
    load();
  };

  return (
    <>
      <PageMeta title="Insurance | PocketHealth" description="NHIF, private cover details, policy numbers and contacts." />
      <PageBreadcrumb pageTitle="Insurance" />

      <div className="mb-5 flex justify-end">
        {profile && (
          <Button size="sm" startIcon={<PlusIcon className="size-4" />} onClick={handleOpenAdd}>
            Add insurance
          </Button>
        )}
      </div>

      {(profileLoading || loading) && <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>}
      {!profileLoading && !profile && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Complete your profile first to add insurance cover.</p>
      )}
      {!loading && profile && policies.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No insurance policies on file yet.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {policies.map((policy) => (
          <div
            key={policy.insuranceId}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{policy.insurerName}</p>
                {policy.policyNumber && (
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Policy #{policy.policyNumber}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleOpenEdit(policy)} className="text-gray-400 hover:text-brand-500">
                  <PencilIcon className="size-4" />
                </button>
                <button onClick={() => handleDelete(policy.insuranceId)} className="text-gray-400 hover:text-error-500">
                  <TrashBinIcon className="size-4" />
                </button>
              </div>
            </div>
            {(policy.phone1 || policy.phone2) && (
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                {[policy.phone1, policy.phone2].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md p-6">
        <h4 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
          {editing ? "Edit insurance" : "Add insurance"}
        </h4>

        <div className="space-y-4">
          <div>
            <Label>Insurer name</Label>
            <Input
              placeholder="e.g. NHIF, Jubilee, AAR"
              value={form.insurerName}
              onChange={(e) => setForm({ ...form, insurerName: e.target.value })}
            />
          </div>
          <div>
            <Label>Policy number</Label>
            <Input
              value={form.policyNumber}
              onChange={(e) => setForm({ ...form, policyNumber: e.target.value })}
            />
          </div>
          <div>
            <Label>Phone 1</Label>
            <Input value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} />
          </div>
          <div>
            <Label>Phone 2 (optional)</Label>
            <Input value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} />
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
