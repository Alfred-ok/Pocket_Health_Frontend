import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ProviderCard from "../../components/PocketHealth/ProviderCard";
import ProviderCategorySidebar from "../../components/PocketHealth/ProviderCategorySidebar";
import providersApi from "../../api/providersApi";
import reviewsApi from "../../api/reviewsApi";
import type { Provider } from "../../types/pocketHealth";

const selectClasses =
  "h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function Providers() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");

  // Build filter option lists / category counts once from the full unfiltered directory.
  useEffect(() => {
    providersApi.search({}).then((all) => {
      setRegions(Array.from(new Set(all.map((p) => p.region).filter((r): r is string => !!r))).sort());
      setTotalCount(all.length);
      const counts: Record<string, number> = {};
      all.forEach((p) => {
        if (!p.category) return;
        counts[p.category] = (counts[p.category] ?? 0) + 1;
      });
      setCategoryCounts(counts);
    });
    providersApi.getSpecialties().then(setSpecialties);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    providersApi
      .search({
        query: query || undefined,
        specialty: specialty || undefined,
        region: region || undefined,
        category: category || undefined,
      })
      .then(async (results) => {
        if (cancelled) return;
        setProviders(results);
        const ratingEntries = await Promise.all(
          results.map(async (p) => {
            try {
              const r = await reviewsApi.getRating(p.providerId);
              return [p.providerId, r.averageRating] as const;
            } catch {
              return [p.providerId, 0] as const;
            }
          })
        );
        if (!cancelled) setRatings(Object.fromEntries(ratingEntries));
      })
      .catch(() => !cancelled && setError("Failed to load providers"))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [query, specialty, region, category]);

  return (
    <>
      <PageMeta title="Find Providers | PocketHealth" description="Browse and book verified healthcare providers." />
      <PageBreadcrumb pageTitle="Find Providers" />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <ProviderCategorySidebar
          selected={category}
          onSelect={setCategory}
          counts={categoryCounts}
          totalCount={totalCount}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or specialty..."
              className="h-11 w-full max-w-xs rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
            <select value={region} onChange={(e) => setRegion(e.target.value)} className={selectClasses}>
              <option value="">All regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={selectClasses}>
              <option value="">All specialties</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading providers...</p>}
          {error && <p className="text-sm text-error-500">{error}</p>}
          {!loading && !error && providers.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No providers match your search.</p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {providers.map((provider) => (
              <ProviderCard key={provider.providerId} provider={provider} rating={ratings[provider.providerId]} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
