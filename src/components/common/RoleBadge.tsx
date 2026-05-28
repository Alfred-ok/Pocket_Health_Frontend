type RoleBadgeProps = {
  role: string;
  size?: "sm" | "md";
};

const roleConfig: Record<string, { label: string; dot: string; badge: string }> = {
  patient: {
    label: "Patient",
    dot: "bg-blue-500",
    badge:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
  provider: {
    label: "Provider",
    dot: "bg-success-500",
    badge:
      "bg-success-50 text-success-700 border-success-200 dark:bg-success-900/20 dark:text-success-400 dark:border-success-800",
  },
  admin: {
    label: "Admin",
    dot: "bg-brand-500",
    badge:
      "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-800",
  },
};

const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = "sm" }) => {
  const config = roleConfig[role] ?? roleConfig.patient;

  return (
    <span
      role="status"
      aria-label={`Signed in as ${config.label}`}
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      } ${config.badge}`}
    >
      <span className={`size-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
};

export default RoleBadge;
