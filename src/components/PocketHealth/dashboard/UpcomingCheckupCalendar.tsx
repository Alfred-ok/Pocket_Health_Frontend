import { useMemo, useState } from "react";
import { BellIcon, ChevronSmallLeft, ChevronSmallRight } from "./icons";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function buildMonthGrid(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  // Convert Sunday(0)..Saturday(6) to a Monday-first index
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = Array(leadingBlanks).fill(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

export default function UpcomingCheckupCalendar() {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const cells = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor]);
  const isCurrentMonth = cursor.year === today.getFullYear() && cursor.month === today.getMonth();

  function shiftMonth(delta: number) {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Upcoming Check Up
        </h3>
        <span className="relative flex size-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400">
          <BellIcon className="size-4.5" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-error-500 ring-2 ring-white dark:ring-gray-900" />
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {MONTH_NAMES[cursor.month]} {cursor.year}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="flex size-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
          >
            <ChevronSmallLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="flex size-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
          >
            <ChevronSmallRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-y-2 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="text-xs font-medium text-gray-400 dark:text-gray-500">
            {d}
          </span>
        ))}

        {cells.map((day, i) => {
          const isToday = isCurrentMonth && day === today.getDate();
          return (
            <div key={i} className="flex items-center justify-center py-0.5">
              {day && (
                <span
                  className={
                    isToday
                      ? "flex size-7 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white"
                      : "flex size-7 items-center justify-center text-xs text-gray-600 dark:text-gray-400"
                  }
                >
                  {day}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
