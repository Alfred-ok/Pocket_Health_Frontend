import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useActiveProfile } from "../../../hooks/useActiveProfile";
import healthInfoApi from "../../../api/healthInfoApi";
import insuranceApi from "../../../api/insuranceApi";
import { ageFromDob } from "../../../utils/emergencyMessage";
import type { HealthInfo, Insurance } from "../../../types/pocketHealth";

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
  const [policies, setPolicies] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      healthInfoApi.getByProfile(profile.profileId).catch(() => null),
      insuranceApi.getByProfile(profile.profileId).catch(() => []),
    ])
      .then(([healthInfoResult, policiesResult]) => {
        setInfo(healthInfoResult);
        setPolicies(policiesResult);
      })
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
        {field("Age", ageFromDob(profile.dateOfBirth))}
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

      <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Health insurer
          </h4>
          <Link
            to="/insurance"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/5 dark:hover:text-gray-300"
          >
            Edit
          </Link>
        </div>

        {policies.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            No insurance on file yet — add your insurer so responders can reach them directly.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {policies.map((policy) => (
              <div key={policy.insuranceId}>
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Insurer</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{policy.insurerName}</p>
                {policy.policyNumber && (
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Policy #{policy.policyNumber}</p>
                )}
                {(policy.phone1 || policy.phone2 || policy.email) && (
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {[policy.phone1, policy.phone2, policy.email].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
