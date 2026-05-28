import RoleBadge from "../../components/common/RoleBadge";
import { useAuthStore } from "../../store/authStore";

type ComingSoonProps = {
  title: string;
  description?: string;
  icon?: string;
};

const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description,
  icon = "🚧",
}) => {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-6xl mb-6" aria-hidden="true">
        {icon}
      </div>

      <div className="mb-4">
        <RoleBadge role={user?.userCategory ?? "patient"} size="md" />
      </div>

      <h1 className="mb-3 text-2xl font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h1>

      <p className="max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {description ??
          "This module is part of PocketHealth and is currently being built."}
      </p>

      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
        <span
          className="inline-block w-2 h-2 rounded-full bg-brand-500 animate-pulse"
          aria-hidden="true"
        />
        Backend API ready · Frontend in progress
      </div>
    </div>
  );
};

export default ComingSoon;
