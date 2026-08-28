import { useActiveProfile } from "../../hooks/useActiveProfile";
import Badge from "../ui/badge/Badge";
import type { Profile } from "../../types/pocketHealth";

function profileName(profile: Profile) {
  return [profile.otherNames, profile.surname].filter(Boolean).join(" ") || profile.surname;
}

function initials(profile: Profile) {
  const name = profileName(profile);
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

interface ProfileSwitcherProps {
  onSwitch?: () => void;
}

export default function ProfileSwitcher({ onSwitch }: ProfileSwitcherProps) {
  const { activeProfile, profiles, switchProfile } = useActiveProfile();

  if (profiles.length < 2) return null;

  return (
    <div className="border-b border-gray-200 pb-3 pt-3 dark:border-gray-800">
      <span className="block px-1 pb-2 text-theme-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        Switch profile
      </span>
      <ul className="flex flex-col gap-1">
        {profiles.map((p) => {
          const isActive = p.profileId === activeProfile?.profileId;
          return (
            <li key={p.profileId}>
              <button
                type="button"
                onClick={() => {
                  switchProfile(p.profileId);
                  onSwitch?.();
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-theme-sm transition-colors ${
                  isActive
                    ? "bg-brand-50 dark:bg-brand-500/10"
                    : "hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {initials(p)}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium text-gray-700 dark:text-gray-300">
                    {profileName(p)}
                  </span>
                  <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                    {p.isPrimary ? "You" : p.relation ?? "Dependant"}
                  </span>
                </span>
                {isActive && (
                  <Badge size="sm" color="primary">
                    Active
                  </Badge>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
