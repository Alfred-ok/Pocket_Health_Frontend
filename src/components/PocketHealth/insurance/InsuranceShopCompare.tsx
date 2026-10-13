import { useEffect, useState } from "react";
import { Link } from "react-router";
import Badge from "../../ui/badge/Badge";
import providersApi from "../../../api/providersApi";
import type { Provider } from "../../../types/pocketHealth";

const MAX_COMPARE = 3;

function premium(provider: Provider) {
  return provider.rates != null ? `From KSh ${provider.rates.toLocaleString()}` : "On request";
}

/** Health Insurance > Shop & Compare: insurers registered on PocketHealth, with a side-by-side comparison. */
export default function InsuranceShopCompare() {
  const [insurers, setInsurers] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    providersApi
      .search({ category: "insurer" })
      .then(setInsurers)
      .catch(() => setError("Could not load insurers. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const visible = insurers.filter((i) =>
    [i.providerName, i.region, i.location].some((v) => v?.toLowerCase().includes(query.trim().toLowerCase()))
  );
  const compared = insurers.filter((i) => compareIds.includes(i.providerId));

  const toggleCompare = (id: string) =>
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < MAX_COMPARE ? [...prev, id] : prev
    );

  return (
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Browse health insurers on PocketHealth, compare up to {MAX_COMPARE} side by side, then contact an insurer or
        agent to get a quote and clarify their premium rates and conditions.
      </p>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search insurers by name or region..."
        className="mt-4 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden dark:border-gray-700 dark:text-gray-300"
      />

      {loading && <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading insurers...</p>}
      {error && <p className="mt-4 text-sm text-error-500">{error}</p>}
      {!loading && !error && visible.length === 0 && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {insurers.length === 0 ? "No insurers are registered on PocketHealth yet." : "No insurers match your search."}
        </p>
      )}

      <div className="mt-4 space-y-3">
        {visible.map((insurer) => {
          const checked = compareIds.includes(insurer.providerId);
          const disabled = !checked && compareIds.length >= MAX_COMPARE;
          return (
            <div
              key={insurer.providerId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{insurer.providerName}</p>
                  {insurer.isVerified && (
                    <Badge color="success" size="sm">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {[insurer.location, insurer.region].filter(Boolean).join(", ") || "Location not listed"} ·{" "}
                  {premium(insurer)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label
                  className={`flex items-center gap-2 text-sm ${disabled ? "text-gray-300 dark:text-gray-600" : "text-gray-600 dark:text-gray-300"}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleCompare(insurer.providerId)}
                  />
                  Compare
                </label>
                <Link
                  to={`/providers/${insurer.providerId}`}
                  className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
                >
                  View & contact
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {compared.length >= 2 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-white/5 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Compare</th>
                {compared.map((i) => (
                  <th key={i.providerId} className="px-4 py-3">
                    {i.providerName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 dark:divide-gray-800 dark:text-gray-300">
              <tr>
                <td className="px-4 py-3 text-gray-500">Premium</td>
                {compared.map((i) => (
                  <td key={i.providerId} className="px-4 py-3">
                    {premium(i)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-500">Verified</td>
                {compared.map((i) => (
                  <td key={i.providerId} className="px-4 py-3">
                    {i.isVerified ? "Yes" : "No"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-500">Location</td>
                {compared.map((i) => (
                  <td key={i.providerId} className="px-4 py-3">
                    {[i.location, i.region].filter(Boolean).join(", ") || "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-500">Available now</td>
                {compared.map((i) => (
                  <td key={i.providerId} className="px-4 py-3">
                    {i.isAvailable ? "Yes" : "No"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {compared.length === 1 && (
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">Select at least one more insurer to compare.</p>
      )}
    </div>
  );
}
