import { useEffect, useState } from "react";
import Button from "../../ui/button/Button";
import UploadDocumentModal from "../UploadDocumentModal";
import { useModal } from "../../../hooks/useModal";
import { useActiveProfile } from "../../../hooks/useActiveProfile";
import documentsApi from "../../../api/documentsApi";
import { FileIcon, PlusIcon } from "../../../icons";
import type { Document } from "../../../types/pocketHealth";

/** Health Insurance > Health Insurance Documents: the active profile's documents of type "insurance". */
export default function InsuranceDocuments() {
  const { activeProfile: profile, loading: profileLoading } = useActiveProfile();
  const uploadModal = useModal();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!profile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    documentsApi
      .getByProfile(profile.profileId, "insurance")
      .then(setDocuments)
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [profile]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Keep policy documents, cover certificates, pre-insurance test results and signed contracts in one place.
        </p>
        {profile && (
          <Button size="sm" startIcon={<PlusIcon className="size-4" />} onClick={uploadModal.openModal}>
            Upload
          </Button>
        )}
      </div>

      {(profileLoading || loading) && <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading...</p>}
      {!profileLoading && !profile && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Complete your profile first to add documents.</p>
      )}
      {!loading && profile && documents.length === 0 && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No insurance documents yet.</p>
      )}

      <div className="mt-4 space-y-3">
        {documents.map((doc) => (
          <a
            key={doc.documentId}
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15">
              <FileIcon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-gray-800 dark:text-white/90">
                {doc.fileName ?? "Untitled document"}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(doc.createdAt).toLocaleDateString()}
              </span>
            </span>
          </a>
        ))}
      </div>

      {profile && (
        <UploadDocumentModal
          isOpen={uploadModal.isOpen}
          onClose={uploadModal.closeModal}
          ownerProfileId={profile.profileId}
          onUploaded={load}
          defaultDocType="insurance"
        />
      )}
    </div>
  );
}
