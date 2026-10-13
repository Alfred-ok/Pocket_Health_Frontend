import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useActiveProfile } from "../../../hooks/useActiveProfile";
import insuranceApi from "../../../api/insuranceApi";
import type { Insurance } from "../../../types/pocketHealth";

/** Strips spaces, dashes and brackets so the number works in a tel: link ("+256 (0) 31-2" -> "+2560312"). */
function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/**
 * Health Insurer card action: a "Call My Insurance" button that dials the phone number of
 * the insurer on file. One button per policy that has a number (primary number first).
 */
export default function AlertInsurerButton() {
  const { activeProfile: profile } = useActiveProfile();
  const [policies, setPolicies] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      setPolicies([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    insuranceApi
      .getByProfile(profile.profileId)
      .catch(() => [] as Insurance[])
      .then(setPolicies)
      .finally(() => setLoading(false));
  }, [profile]);

  const callable = policies
    .map((policy) => ({ policy, phone: policy.phone1?.trim() || policy.phone2?.trim() || "" }))
    .filter((entry) => entry.phone);

  if (loading) {
    return (
      <button
        disabled
        className="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-error-500 px-4 py-2.5 text-sm font-medium text-white opacity-50"
      >
        Call My Insurance
      </button>
    );
  }

  if (callable.length === 0) {
    return (
      <div className="mt-4">
        <Link
          to="/insurance"
          className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
        >
          {policies.length === 0 ? "Add your insurer" : "Add your insurer's phone number"}
        </Link>
        {policies.length > 0 && (
          <p className="mt-2 text-xs text-warning-600 dark:text-warning-400">
            Your insurance on file has no phone number, so it can't be called yet.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      {callable.map(({ policy, phone }) => (
        <a
          key={policy.insuranceId}
          href={toTelHref(phone)}
          className="inline-flex w-full flex-col items-center justify-center rounded-lg bg-error-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-error-600"
        >
          <span>Call My Insurance{callable.length > 1 ? ` (${policy.insurerName})` : ""}</span>
          <span className="text-xs font-normal opacity-90">
            {callable.length > 1 ? phone : `${policy.insurerName} · ${phone}`}
          </span>
        </a>
      ))}
    </div>
  );
}
