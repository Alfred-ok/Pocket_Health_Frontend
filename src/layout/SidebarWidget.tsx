import { useNavigate } from "react-router";
import { useAuthStore } from "../store/authStore";

export default function SidebarWidget() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.03]">
      {/* User email */}
      {user?.email && (
        <p
          className="mb-3 truncate text-center text-xs text-gray-500 dark:text-gray-400"
          title={user.email}
        >
          {user.email}
        </p>
      )}

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full rounded-lg bg-red-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
        aria-label="Sign out of PocketHealth"
      >
        Sign Out
      </button>
    </div>
  );
}
