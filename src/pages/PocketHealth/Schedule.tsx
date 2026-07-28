import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { TrashBinIcon, PlusIcon } from "../../icons";
import { useMyProvider } from "../../hooks/useMyProvider";
import availabilityApi from "../../api/availabilityApi";
import type { ProviderAvailability } from "../../types/pocketHealth";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const inputClasses =
  "h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

function formatTime(t: string) {
  return t.slice(0, 5);
}

export default function Schedule() {
  const { provider, loading: providerLoading, error: providerError } = useMyProvider();
  const [windows, setWindows] = useState<ProviderAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(30);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!provider) return;
    setLoading(true);
    availabilityApi
      .getByProvider(provider.providerId)
      .then(setWindows)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider?.providerId]);

  const handleAdd = async () => {
    if (!provider) return;
    setSaving(true);
    setError(null);
    try {
      await availabilityApi.create(provider.providerId, { dayOfWeek, startTime, endTime, slotDurationMinutes });
      load();
    } catch {
      setError("Failed to add availability window. Check that the end time is after the start time.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (w: ProviderAvailability) => {
    await availabilityApi.update(w.availabilityId, { isActive: !w.isActive });
    load();
  };

  const handleDelete = async (id: string) => {
    await availabilityApi.remove(id);
    load();
  };

  if (providerLoading) return <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>;
  if (providerError || !provider) {
    return <p className="text-sm text-error-500">No provider profile is associated with this account.</p>;
  }

  return (
    <>
      <PageMeta title="My Schedule | PocketHealth" description="Manage your weekly availability" />
      <PageBreadcrumb pageTitle="My Schedule" />

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">Add availability window</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-400">Day</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className={inputClasses}
            >
              {dayNames.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-400">Start</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-400">End</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-400">Slot length (min)</label>
            <input
              type="number"
              min={5}
              step={5}
              value={slotDurationMinutes}
              onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
              className={`${inputClasses} w-24`}
            />
          </div>
          <Button startIcon={<PlusIcon className="size-4" />} onClick={handleAdd} disabled={saving}>
            {saving ? "Adding..." : "Add window"}
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-error-500">{error}</p>}
      </div>

      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading schedule...</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {dayNames.map((dayName, day) => {
          const dayWindows = windows.filter((w) => w.dayOfWeek === day);
          return (
            <div
              key={dayName}
              className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <h4 className="mb-3 font-medium text-gray-800 dark:text-white/90">{dayName}</h4>
              {dayWindows.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500">No availability set.</p>
              )}
              <div className="space-y-2">
                {dayWindows.map((w) => (
                  <div
                    key={w.availabilityId}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-white/5"
                  >
                    <span className={w.isActive ? "text-gray-700 dark:text-gray-300" : "text-gray-400 line-through"}>
                      {formatTime(w.startTime)}–{formatTime(w.endTime)} · {w.slotDurationMinutes}min slots
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggle(w)}
                        className="text-xs text-brand-600 hover:underline dark:text-brand-400"
                      >
                        {w.isActive ? "Disable" : "Enable"}
                      </button>
                      <button onClick={() => handleDelete(w.availabilityId)} aria-label="Delete window">
                        <TrashBinIcon className="size-4 text-error-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
