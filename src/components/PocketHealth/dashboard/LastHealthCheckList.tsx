import { Link } from "react-router";

const checks = [
  { icon: "🦷", iconBg: "bg-blue-light-50 dark:bg-blue-light-500/15", title: "Dental Health", date: "08 Nov 2025" },
  { icon: "🧠", iconBg: "bg-brand-50 dark:bg-brand-500/15", title: "Brain IQ Test", date: "20 Oct 2025" },
  { icon: "🫘", iconBg: "bg-success-50 dark:bg-success-500/15", title: "Regular Kidney Check", date: "19 Aug 2025" },
];

export default function LastHealthCheckList() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Your Last Health Check
        </h3>
      </div>

      <div className="mt-4 space-y-4">
        {checks.map(({ icon, iconBg, title, date }) => (
          <div key={title} className="flex items-center gap-3">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-full text-lg ${iconBg}`}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{date}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/documents"
        className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600"
      >
        View all
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
