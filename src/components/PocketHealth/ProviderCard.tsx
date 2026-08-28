import { Link } from "react-router";
import { DollarLineIcon, ShootingStarIcon, TimeIcon } from "../../icons";
import Badge from "../ui/badge/Badge";
import { categoryLabels, categoryColors } from "../../constants/providerCategories";
import type { Provider } from "../../types/pocketHealth";

const FALLBACK_AVATAR = "/images/ClinicsAvatar.jpg";

interface ProviderCardProps {
  provider: Provider;
  rating?: number;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, rating }) => {
  const categoryLabel = categoryLabels[provider.category ?? ""] ?? provider.category ?? "Provider";
  const metaLine = [provider.region, provider.location].filter(Boolean).join(" · ");

  return (
    <Link
      to={`/providers/${provider.providerId}`}
      className="relative flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-5 text-center transition hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-theme-xs ring-1 ring-gray-100 dark:bg-gray-800 dark:text-white/90 dark:ring-gray-700">
        <ShootingStarIcon className="size-3.5 text-warning-500" />
        {rating ? rating.toFixed(1) : "New"}
      </span>

      <img
        src={FALLBACK_AVATAR}
        alt={provider.providerName}
        className="size-16 rounded-full object-cover ring-4 ring-gray-50 dark:ring-white/5"
      />

      <h3 className="mt-3 text-base font-semibold text-gray-800 dark:text-white/90">
        {provider.providerName}
      </h3>
      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
        {provider.specialty ?? categoryLabel}
      </p>
      {metaLine && (
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{metaLine}</p>
      )}

      <Badge color={categoryColors[provider.category ?? ""] ?? "light"} size="sm">
        {categoryLabel.toUpperCase()}
      </Badge>

      <div className="mt-4 grid w-full grid-cols-2 divide-x divide-gray-100 border-t border-gray-100 pt-3 dark:divide-gray-800 dark:border-gray-800">
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <TimeIcon className={`size-4 ${provider.isAvailable ? "text-success-500" : "text-gray-400"}`} />
          {provider.isAvailable ? "Available" : "Unavailable"}
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <DollarLineIcon className="size-4 text-gray-400" />
          {provider.rates != null ? `KES ${Number(provider.rates).toLocaleString()}` : "Rate on request"}
        </div>
      </div>
    </Link>
  );
};

export default ProviderCard;
