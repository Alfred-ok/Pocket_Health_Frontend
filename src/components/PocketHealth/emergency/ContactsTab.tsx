import { useEffect, useState } from "react";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import { useActiveProfile } from "../../../hooks/useActiveProfile";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Select from "../../form/Select";
import emergencyContactsApi, { EmergencyContactBody } from "../../../api/emergencyContactsApi";
import nextOfKinApi from "../../../api/nextOfKinApi";
import { PlusIcon, TrashBinIcon, PencilIcon } from "../../../icons";
import type { EmergencyContact, NextOfKin } from "../../../types/pocketHealth";

const MAX_CONTACTS = 3;
const emptyForm: EmergencyContactBody = { name: "", phone1: "", phone2: "", priority: 1, emergencyType: "family" };

const priorityOptions = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `Priority ${n}` }));
const typeOptions = ["family", "friend", "doctor", "neighbor", "other"].map((t) => ({
  value: t,
  label: t.charAt(0).toUpperCase() + t.slice(1),
}));

export default function ContactsTab() {
  const { activeProfile: profile, loading: profileLoading } = useActiveProfile();
  const { isOpen, openModal, closeModal } = useModal();

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [nextOfKin, setNextOfKin] = useState<NextOfKin | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [form, setForm] = useState<EmergencyContactBody>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!profile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      emergencyContactsApi.getByProfile(profile.profileId).then((list) => list.sort((a, b) => a.priority - b.priority)),
      nextOfKinApi.getByProfile(profile.profileId),
    ])
      .then(([contactList, kinList]) => {
        setContacts(contactList);
        setNextOfKin(kinList[0] ?? null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [profile]);

  const handleOpenAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    openModal();
  };

  const handleOpenEdit = (contact: EmergencyContact) => {
    setEditing(contact);
    setForm({
      name: contact.name,
      phone1: contact.phone1,
      phone2: contact.phone2 ?? "",
      priority: contact.priority,
      emergencyType: contact.emergencyType ?? "family",
    });
    setError(null);
    openModal();
  };

  const handleUseNextOfKin = () => {
    if (!nextOfKin) return;
    setForm({
      ...form,
      name: nextOfKin.fullName,
      phone1: nextOfKin.phone1,
      phone2: nextOfKin.phone2 ?? "",
      emergencyType: "family",
    });
  };

  const handleSave = async () => {
    if (!profile || !form.name || !form.phone1) {
      setError("Name and phone number are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await emergencyContactsApi.update(editing.contactId, form);
      } else {
        await emergencyContactsApi.create({ ...form, profileId: profile.profileId });
      }
      load();
      closeModal();
    } catch {
      setError("Failed to save contact. You may already have the maximum of 3 emergency contacts.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await emergencyContactsApi.remove(id);
    load();
  };

  const atMax = contacts.length >= MAX_CONTACTS;

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {contacts.length}/{MAX_CONTACTS} contacts &middot; keep 2-3 people who can be reached in an emergency.
        </p>
        {profile && !atMax && (
          <Button size="sm" startIcon={<PlusIcon className="size-4" />} onClick={handleOpenAdd}>
            Add contact
          </Button>
        )}
      </div>

      {(profileLoading || loading) && <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>}
      {!profileLoading && !profile && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Complete your profile first to add emergency contacts.</p>
      )}
      {!loading && profile && contacts.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No emergency contacts added yet.</p>
      )}

      <div className="space-y-3">
        {contacts.map((contact) => (
          <div
            key={contact.contactId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{contact.name}</p>
                <Badge color="light" size="sm">
                  Priority {contact.priority}
                </Badge>
                {contact.emergencyType && (
                  <Badge color="info" size="sm">
                    {contact.emergencyType}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {[contact.phone1, contact.phone2].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => handleOpenEdit(contact)} className="text-gray-400 hover:text-brand-500">
                <PencilIcon className="size-4" />
              </button>
              <button onClick={() => handleDelete(contact.contactId)} className="text-gray-400 hover:text-error-500">
                <TrashBinIcon className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md p-6">
        <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
          {editing ? "Edit contact" : "Add emergency contact"}
        </h4>

        {!editing && nextOfKin && (
          <button
            type="button"
            onClick={handleUseNextOfKin}
            className="mb-4 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-left text-sm text-brand-600 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-500/10 dark:text-brand-400"
          >
            Use my Next of Kin ({nextOfKin.fullName}) as this contact
          </button>
        )}

        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Phone 1</Label>
            <Input value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} />
          </div>
          <div>
            <Label>Phone 2 (optional)</Label>
            <Input value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select
                options={priorityOptions}
                defaultValue={String(form.priority)}
                onChange={(v) => setForm({ ...form, priority: Number(v) })}
              />
            </div>
            <div>
              <Label>Relationship</Label>
              <Select
                options={typeOptions}
                defaultValue={form.emergencyType}
                onChange={(v) => setForm({ ...form, emergencyType: v })}
              />
            </div>
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
