import { DropletIcon, HeartPulseIcon, LungsIcon } from "./icons";

const stats = [
  {
    icon: HeartPulseIcon,
    label: "Heart Rate",
    value: "80 beats / min",
    iconBg: "bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15",
  },
  {
    icon: LungsIcon,
    label: "Lung Capacity",
    value: "4.75 liters",
    iconBg: "bg-success-50 text-success-600 dark:bg-success-500/15",
  },
  {
    icon: DropletIcon,
    label: "Blood Cells",
    value: "5 million / ml",
    iconBg: "bg-error-50 text-error-600 dark:bg-error-500/15",
  },
];

export default function VitalStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map(({ icon: Icon, label, value, iconBg }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div className={`flex size-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
