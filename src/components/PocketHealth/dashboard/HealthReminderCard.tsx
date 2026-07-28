import { Link } from "react-router";

export default function HealthReminderCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-500 to-indigo-700 dark:from-bg-indigo-900 to dark:to-indigo-950 px-6 py-6 sm:px-8 sm:py-7">
      <div className="relative z-10 max-w-[65%] sm:max-w-[60%]">
        <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90">
          Reminder
        </span>
        <h2 className="mt-3 text-xl font-semibold leading-snug text-white sm:text-2xl">
          Have You Had a Routine Health Check this Month?
        </h2>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            to="/providers"
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-[#0B7A88] transition hover:bg-white/90"
          >
            Check Now
          </Link>
          <Link
            to="/documents"
            className="rounded-lg border border-white/40 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            View Report
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-0 h-[92%] w-[54%] min-w-35 sm:right-2 sm:w-[46%]">
        <img
          src="/images/banner/appointmentdoctors.png"
          alt="Doctors reviewing an appointment schedule"
          className="h-full w-full object-contain object-bottom"
        />
      </div>
    </div>
  );
}
