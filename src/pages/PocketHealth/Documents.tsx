import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import UploadDocumentModal from "../../components/PocketHealth/UploadDocumentModal";
import { useModal } from "../../hooks/useModal";
import { useMyProfile } from "../../hooks/useMyProfile";
import documentsApi from "../../api/documentsApi";
import { FileIcon, PlusIcon, TrashBinIcon } from "../../icons";
import type { Document } from "../../types/pocketHealth";

const docTypeLabels: Record<string, string> = {
  prescription: "Prescription",
  lab_result: "Lab result",
  scan: "Scan / Imaging",
  referral: "Referral",
  other: "Other",
};

export default function Documents() {
  const { profile, loading: profileLoading } = useMyProfile();
  const uploadModal = useModal();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");

  const load = () => {
    if (!profile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    documentsApi
      .getByProfile(profile.profileId, typeFilter || undefined)
      .then(setDocuments)
      .finally(() => setLoading(false));
  };

  useEffect(load, [profile, typeFilter]);

  const handleDelete = async (id: string) => {
    await documentsApi.remove(id);
    load();
  };

  return (
    <>
      <PageMeta title="Documents | PocketHealth" description="Medical documents, lab results, prescriptions and scans." />
      <PageBreadcrumb pageTitle="Documents" />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter("")}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              typeFilter === ""
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300"
            }`}
          >
            All
          </button>
          {Object.entries(docTypeLabels).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                typeFilter === value
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {profile && (
          <Button size="sm" startIcon={<PlusIcon className="size-4" />} onClick={uploadModal.openModal}>
            Upload
          </Button>
        )}
      </div>

      {(profileLoading || loading) && <p className="text-sm text-gray-500 dark:text-gray-400">Loading documents...</p>}
      {!profileLoading && !profile && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Complete your profile first to add documents.</p>
      )}
      {!loading && profile && documents.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No documents yet.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <div
            key={doc.documentId}
            className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15">
                <FileIcon className="size-5" />
              </span>
              <button
                onClick={() => handleDelete(doc.documentId)}
                className="text-gray-400 hover:text-error-500"
                title="Delete document"
              >
                <TrashBinIcon className="size-4" />
              </button>
            </div>

            <p className="mt-3 truncate text-sm font-medium text-gray-800 dark:text-white/90">
              {doc.fileName ?? "Untitled document"}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Badge color="light" size="sm">
                {docTypeLabels[doc.docType ?? ""] ?? doc.docType ?? "Document"}
              </Badge>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(doc.createdAt).toLocaleDateString()}
              </span>
            </div>

            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-sm font-medium text-brand-500 hover:text-brand-600"
            >
              View document →
            </a>
          </div>
        ))}
      </div>

      {profile && (
        <UploadDocumentModal
          isOpen={uploadModal.isOpen}
          onClose={uploadModal.closeModal}
          ownerProfileId={profile.profileId}
          onUploaded={load}
        />
      )}
    </>
  );
}
