import { PROVIDER_CATEGORIES, categoryColors } from "../../constants/providerCategories";
import type { BadgeColor } from "../ui/badge/Badge";

const chipClasses: Record<BadgeColor, string> = {
  primary: "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400",
  success: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
  error: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
  warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400",
  info: "bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500",
  light: "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80",
  dark: "bg-gray-500 text-white dark:bg-white/5 dark:text-white",
};

interface ProviderCategorySidebarProps {
  selected: string;
  onSelect: (value: string) => void;
  counts: Record<string, number>;
  totalCount: number;
}

export default function ProviderCategorySidebar({
  selected,
  onSelect,
  counts,
  totalCount,
}: ProviderCategorySidebarProps) {
  const rows = [{ value: "", label: "All categories", initial: "All" }, ...PROVIDER_CATEGORIES.map((c) => ({
    value: c.value,
    label: c.label,
    initial: c.label.slice(0, 2).toUpperCase(),
  }))];

  return (
    <aside className="w-full shrink-0 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] lg:w-64">
      <h4 className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
        Categories
      </h4>
      <ul className="flex flex-col gap-1">
        {rows.map((row) => {
          const isActive = selected === row.value;
          const count = row.value === "" ? totalCount : counts[row.value] ?? 0;
          const chipClass = row.value === "" ? chipClasses.light : chipClasses[categoryColors[row.value] ?? "light"];

          return (
            <li key={row.value || "all"}>
              <button
                type="button"
                onClick={() => onSelect(row.value)}
                className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-brand-500 text-white shadow-theme-xs"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isActive ? "bg-white/20 text-white" : chipClass
                  }`}
                >
                  {row.initial}
                </span>
                <span className="flex-1 truncate font-medium">{row.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
