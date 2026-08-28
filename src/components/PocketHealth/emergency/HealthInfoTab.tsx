import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useActiveProfile } from "../../../hooks/useActiveProfile";
import healthInfoApi from "../../../api/healthInfoApi";
import type { HealthInfo } from "../../../types/pocketHealth";

function age(dateOfBirth: string | null): string | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const diff = Date.now() - dob.getTime();
  const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  return `${years} yrs`;
}

const field = (label: string, value: string | null | undefined, emphasize = false) => (
  <div>
    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
    <p
      className={
        emphasize
          ? "text-base font-semibold text-error-600 dark:text-error-400"
          : "text-sm font-medium text-gray-800 dark:text-white/90"
      }
    >
      {value || "—"}
    </p>
  </div>
);

export default function HealthInfoTab() {
  const { activeProfile: profile, loading: profileLoading } = useActiveProfile();
  const [info, setInfo] = useState<HealthInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [profile]);

  if (profileLoading || loading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading emergency health information...</p>;
  }

  if (!profile) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Complete your profile first.</p>;
  }

  const fullName = [profile.otherNames, profile.surname].filter(Boolean).join(" ");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Emergency health snapshot</h3>
        <Link
          to="/health-info"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          Edit
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {field("Name", fullName)}
        {field("Age", age(profile.dateOfBirth))}
        {field("Gender", profile.gender)}
        {field("Blood group", info?.bloodGroup, true)}
        {field("Allergies", info?.allergies, true)}
        {field("Chronic conditions", info?.chronicConditions, true)}
        {field("Long-term medications", info?.longTermMeds)}
        {field("Mental health conditions", info?.mentalConditions)}
        {field("Family history", info?.familyHistory)}
      </div>

      {!info && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          No additional health information on file yet — add it so responders have full context in an emergency.
        </p>
      )}
    </div>
  );
}
