import { Link } from "react-router";
import { EMERGENCY_SERVICES } from "../../../constants/emergencyServices";

export default function ServicesTab() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {EMERGENCY_SERVICES.map((service) => (
        <div
          key={service.name}
          className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div>
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">{service.name}</h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{service.description}</p>
          </div>

          {service.phone ? (
            <a
              href={`tel:${service.phone}`}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-error-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-error-600"
            >
              Call {service.phone}
            </a>
          ) : service.link ? (
            <Link
              to={service.link}
              className="mt-4 inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Find providers
            </Link>
          ) : null}
        </div>
      ))}
    </div>
  );
}
