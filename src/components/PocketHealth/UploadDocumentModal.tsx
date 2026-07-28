import { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import FileInput from "../form/input/FileInput";
import documentsApi from "../../api/documentsApi";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerProfileId: string;
  onUploaded?: () => void;
}

const docTypes = [
  { value: "prescription", label: "Prescription" },
  { value: "lab_result", label: "Lab result" },
  { value: "scan", label: "Scan / Imaging" },
  { value: "referral", label: "Referral" },
  { value: "other", label: "Other" },
];

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB — fileUrl lands in a DB TEXT column as a data: URL

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  ownerProfileId,
  onUploaded,
}) => {
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [docType, setDocType] = useState("other");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (file.size > MAX_FILE_BYTES) {
      setError("File is too large. Please choose a file under 2MB.");
      e.target.value = "";
      setFileUrl(null);
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setFileUrl(reader.result as string);
    reader.onerror = () => setError("Could not read this file.");
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    setFileName("");
    setFileUrl(null);
    setDocType("other");
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!fileUrl) {
      setError("Choose a file to upload.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await documentsApi.create({ ownerProfileId, docType, fileUrl, fileName });
      setSuccess(true);
      onUploaded?.();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-6">
      <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">Upload Document</h3>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        Lab results, prescriptions, scans and other medical documents.
      </p>

      {success ? (
        <div className="py-6 text-center">
          <p className="text-success-600 dark:text-success-400">Document uploaded successfully.</p>
          <Button className="mt-4" onClick={handleClose}>
            Done
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <Label>File</Label>
            <FileInput onChange={handleFileChange} />
          </div>

          {fileUrl && (
            <>
              <div className="mb-4">
                <Label>File name</Label>
                <Input value={fileName} onChange={(e) => setFileName(e.target.value)} />
              </div>
              <div className="mb-4">
                <Label>Document type</Label>
                <Select options={docTypes} defaultValue={docType} onChange={setDocType} />
              </div>
            </>
          )}

          {error && <p className="mb-3 text-sm text-error-500">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!fileUrl || uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default UploadDocumentModal;
