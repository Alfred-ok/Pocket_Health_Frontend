import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import type { EventInput, EventContentArg } from "@fullcalendar/core";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { useAuthStore } from "../../store/authStore";
import { useActiveProfile } from "../../hooks/useActiveProfile";
import { useMyProvider } from "../../hooks/useMyProvider";
import appointmentsApi from "../../api/appointmentsApi";
import type { Appointment } from "../../types/pocketHealth";

type StatusFilter = "all" | "pending" | "completed" | "cancelled";

const statusColor: Record<string, "warning" | "success" | "error" | "light"> = {
  pending: "warning",
  completed: "success",
  cancelled: "error",
};

const statusToCalendarClass: Record<string, string> = {
  pending: "warning",
  completed: "success",
  cancelled: "danger",
};

function patientName(appointment: Appointment) {
  const p = appointment.patientProfile;
  return [p.otherNames, p.surname].filter(Boolean).join(" ") || p.surname;
}

export default function Appointments() {
  const { user } = useAuthStore();
  const role = user?.userCategory ?? "patient";
  const { activeProfile: profile } = useActiveProfile();
  const { provider } = useMyProvider();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [actionError, setActionError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    let request: Promise<Appointment[]> | null = null;
    if (role === "provider" && provider) request = appointmentsApi.getByProvider(provider.providerId);
    else if (role === "admin") request = appointmentsApi.getAll();
    else if (profile) request = appointmentsApi.getByProfile(profile.profileId);

    if (!request) {
      setLoading(false);
      return;
    }
    request.then(setAppointments).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, profile?.profileId, provider?.providerId]);

  const filtered = useMemo(
    () => appointments.filter((a) => statusFilter === "all" || a.status === statusFilter),
    [appointments, statusFilter]
  );

  const events: EventInput[] = useMemo(
    () =>
      filtered.map((a) => ({
        id: a.appointmentId,
        title: role === "provider" ? patientName(a) : a.provider.providerName,
        start: a.scheduledAt,
        extendedProps: { calendar: statusToCalendarClass[a.status] ?? "primary" },
      })),
    [filtered, role]
  );

  const handleCancel = async (id: string) => {
    setActionError(null);
    try {
      await appointmentsApi.cancel(id);
      load();
    } catch {
      setActionError("Failed to cancel appointment.");
    }
  };

  const handleComplete = async (id: string) => {
    setActionError(null);
    try {
      await appointmentsApi.update(id, { status: "completed", attended: true });
      load();
    } catch {
      setActionError("Failed to update appointment.");
    }
  };

  return (
    <>
      <PageMeta title="Appointments | PocketHealth" description="Book and manage appointments" />
      <PageBreadcrumb pageTitle="Appointments" />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["all", "pending", "completed", "cancelled"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-sm capitalize transition ${
                statusFilter === s
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={view === "list" ? "primary" : "outline"} onClick={() => setView("list")}>
            List
          </Button>
          <Button size="sm" variant={view === "calendar" ? "primary" : "outline"} onClick={() => setView("calendar")}>
            Calendar
          </Button>
        </div>
      </div>

      {actionError && <p className="mb-3 text-sm text-error-500">{actionError}</p>}
      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading appointments...</p>}

      {!loading && view === "list" && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-800">
              <tr>
                <th className="px-5 py-3">{role === "provider" ? "Patient" : "Provider"}</th>
                <th className="px-5 py-3">Date &amp; Time</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-gray-400 dark:text-gray-500">
                    No appointments found.
                  </td>
                </tr>
              )}
              {filtered.map((a) => (
                <tr key={a.appointmentId} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                    {role === "provider" ? patientName(a) : a.provider.providerName}
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                    {new Date(a.scheduledAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{a.durationSlot} min</td>
                  <td className="px-5 py-3">
                    <Badge color={statusColor[a.status] ?? "light"} size="sm">
                      {a.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      {a.status === "pending" && (role === "provider" || role === "admin") && (
                        <button
                          onClick={() => handleComplete(a.appointmentId)}
                          className="text-sm text-success-600 hover:underline dark:text-success-400"
                        >
                          Mark completed
                        </button>
                      )}
                      {a.status === "pending" && (
                        <button
                          onClick={() => handleCancel(a.appointmentId)}
                          className="text-sm text-error-500 hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && view === "calendar" && (
        <div className="custom-calendar rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: "prev,next", center: "title", right: "dayGridMonth,timeGridWeek" }}
            events={events}
            height="auto"
            eventContent={renderEventContent}
          />
        </div>
      )}
    </>
  );
}

function renderEventContent(eventInfo: EventContentArg) {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar}`;
  return (
    <div className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}>
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
}
