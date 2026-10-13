import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ProviderCard from "../../components/PocketHealth/ProviderCard";
import ProviderCategorySidebar from "../../components/PocketHealth/ProviderCategorySidebar";
import providersApi from "../../api/providersApi";
import reviewsApi from "../../api/reviewsApi";
import { PROVIDER_TYPE_GROUPS } from "../../constants/providerCategories";
import type { Provider } from "../../types/pocketHealth";

const selectClasses =
  "h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function Providers() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "";
  const initialTab =
    PROVIDER_TYPE_GROUPS.find((g) => g.categories.includes(initialCategory))?.key ??
    PROVIDER_TYPE_GROUPS[0].key;

  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [activeTab, setActiveTab] = useState(initialTab);

  const activeGroup = PROVIDER_TYPE_GROUPS.find((g) => g.key === activeTab) ?? PROVIDER_TYPE_GROUPS[0];

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    setCategory("");
  };

  // Build filter option lists / category counts once from the full unfiltered directory.
  useEffect(() => {
    providersApi.search({}).then((all) => {
      setRegions(Array.from(new Set(all.map((p) => p.region).filter((r): r is string => !!r))).sort());
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
        // When no specific category is picked, restrict results to the active tab's group
        // (the server only filters by a single exact category, not a group of them).
        const scoped = category ? results : results.filter((p) => activeGroup.categories.includes(p.category ?? ""));
        setProviders(scoped);
        const ratingEntries = await Promise.all(
          scoped.map(async (p) => {
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
  }, [query, specialty, region, category, activeTab]);

  return (
    <>
      <PageMeta title="Find Providers | PocketHealth" description="Browse and book verified healthcare providers." />
      <PageBreadcrumb pageTitle="Find Providers" />

      <div className="mb-5 flex gap-6 border-b border-gray-200 dark:border-gray-800">
        {PROVIDER_TYPE_GROUPS.map((group) => {
          const groupCount = group.categories.reduce((sum, c) => sum + (categoryCounts[c] ?? 0), 0);
          const isActive = activeTab === group.key;
          return (
            <button
              key={group.key}
              type="button"
              onClick={() => handleTabChange(group.key)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-brand-500 text-brand-500 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {group.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  isActive
                    ? "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400"
                    : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"
                }`}
              >
                {groupCount}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <ProviderCategorySidebar
          selected={category}
          onSelect={setCategory}
          counts={categoryCounts}
          totalCount={activeGroup.categories.reduce((sum, c) => sum + (categoryCounts[c] ?? 0), 0)}
          categoryValues={activeGroup.categories}
          allLabel={`All ${activeGroup.label}`}
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
