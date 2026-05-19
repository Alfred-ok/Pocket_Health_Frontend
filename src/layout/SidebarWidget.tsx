export default function SidebarWidget() {
  return (
    <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.03]">
      <button
        className="w-full rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
}