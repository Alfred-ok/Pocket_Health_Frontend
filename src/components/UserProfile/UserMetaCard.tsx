import { useAuthStore } from "../../store/authStore";
import { useMyProfile } from "../../hooks/useMyProfile";
import RoleBadge from "../common/RoleBadge";
import Badge from "../ui/badge/Badge";

export default function UserMetaCard() {
  const { user } = useAuthStore();
  const { profile } = useMyProfile();

  const fullName = profile ? [profile.otherNames, profile.surname].filter(Boolean).join(" ") : null;
  const location = profile ? [profile.residence, profile.region].filter(Boolean).join(", ") : null;

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
        <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
          <img src="/images/user/owner.jpg" alt="Profile avatar" />
        </div>
        <div className="text-center xl:text-left">
          <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
            {fullName ?? user?.email ?? "Your profile"}
          </h4>
          <div className="flex flex-col items-center gap-2 xl:flex-row">
            <RoleBadge role={user?.userCategory ?? "patient"} size="sm" />
            {user?.status && (
              <Badge color={user.status === "active" ? "success" : "light"} size="sm">
                {user.status}
              </Badge>
            )}
            {location && (
              <>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{location}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
