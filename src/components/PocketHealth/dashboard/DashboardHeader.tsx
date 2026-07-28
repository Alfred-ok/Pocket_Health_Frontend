import { Link } from "react-router";
import { useAuthStore } from "../../../store/authStore";
import { PlusIconSmall, SearchIcon } from "./icons";

function displayName(email?: string | null) {
  if (!email) return "there";
  const local = email.split("@")[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export default function DashboardHeader() {
  const { user } = useAuthStore();

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Hi {displayName(user?.email)},
        </p>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Welcome Back!
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/providers"
          title="Find a provider"
          className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
        >
          <PlusIconSmall className="size-5" />
        </Link>
        <button
          type="button"
          title="Search"
          className="flex size-10 items-center justify-center rounded-full bg-brand-500 text-white transition hover:bg-brand-600"
        >
          <SearchIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
