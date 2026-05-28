#!/bin/bash
# ================================================================
#  PocketHealth — RBAC Full Patch
#  Follows existing TailAdmin code standards exactly
#  Run from project root (where package.json lives)
# ================================================================

mkdir -p src/components/common src/pages/PocketHealth

# ================================================================
# 1. ROLE BADGE — small reusable status indicator
# ================================================================
cat > src/components/common/RoleBadge.tsx << 'EOF'
type RoleBadgeProps = {
  role: string;
  size?: "sm" | "md";
};

const roleConfig: Record<string, { label: string; dot: string; badge: string }> = {
  patient: {
    label: "Patient",
    dot: "bg-blue-500",
    badge:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
  provider: {
    label: "Provider",
    dot: "bg-success-500",
    badge:
      "bg-success-50 text-success-700 border-success-200 dark:bg-success-900/20 dark:text-success-400 dark:border-success-800",
  },
  admin: {
    label: "Admin",
    dot: "bg-brand-500",
    badge:
      "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-800",
  },
};

const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = "sm" }) => {
  const config = roleConfig[role] ?? roleConfig.patient;

  return (
    <span
      role="status"
      aria-label={`Signed in as ${config.label}`}
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      } ${config.badge}`}
    >
      <span className={`size-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
};

export default RoleBadge;
EOF

# ================================================================
# 2. ROLE GUARD — protects routes from wrong-role access
# ================================================================
cat > src/components/common/RoleGuard.tsx << 'EOF'
import { Navigate } from "react-router";
import { useAuthStore } from "../../store/authStore";

type RoleGuardProps = {
  allowedRoles: string[];
  children: React.ReactNode;
  redirectTo?: string;
};

const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  redirectTo = "/unauthorized",
}) => {
  const { user } = useAuthStore();
  const role = user?.userCategory ?? "patient";

  if (!allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
EOF

# ================================================================
# 3. COMING SOON — placeholder for pages still being built
# ================================================================
cat > src/pages/PocketHealth/ComingSoon.tsx << 'EOF'
import RoleBadge from "../../components/common/RoleBadge";
import { useAuthStore } from "../../store/authStore";

type ComingSoonProps = {
  title: string;
  description?: string;
  icon?: string;
};

const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description,
  icon = "🚧",
}) => {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-6xl mb-6" aria-hidden="true">
        {icon}
      </div>

      <div className="mb-4">
        <RoleBadge role={user?.userCategory ?? "patient"} size="md" />
      </div>

      <h1 className="mb-3 text-2xl font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h1>

      <p className="max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {description ??
          "This module is part of PocketHealth and is currently being built."}
      </p>

      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
        <span
          className="inline-block w-2 h-2 rounded-full bg-brand-500 animate-pulse"
          aria-hidden="true"
        />
        Backend API ready · Frontend in progress
      </div>
    </div>
  );
};

export default ComingSoon;
EOF

# ================================================================
# 4. APP SIDEBAR — role-aware, follows existing code standards
# ================================================================
cat > src/layout/AppSidebar.tsx << 'EOF'
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { useAuthStore } from "../store/authStore";
import RoleBadge from "../components/common/RoleBadge";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// ── PATIENT nav ────────────────────────────────────────────────

const patientNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <UserCircleIcon />,
    name: "Find Providers",
    path: "/providers",
  },
  {
    icon: <CalenderIcon />,
    name: "Consultations",
    path: "/consultations",
  },
  {
    icon: <CalenderIcon />,
    name: "Appointments",
    path: "/appointments",
  },
  {
    icon: <PlugInIcon />,
    name: "Wallet",
    path: "/wallet",
  },
];

const patientOthersItems: NavItem[] = [
  {
    icon: <UserCircleIcon />,
    name: "My Health",
    subItems: [
      { name: "My Profile", path: "/profile" },
      { name: "Health Info", path: "/health-info" },
      { name: "Insurance", path: "/insurance" },
      { name: "Emergency Contacts", path: "/emergency" },
    ],
  },
  {
    icon: <PageIcon />,
    name: "My Records",
    subItems: [
      { name: "Documents", path: "/documents" },
      { name: "Notifications", path: "/notifications" },
    ],
  },
];

// ── PROVIDER nav ───────────────────────────────────────────────

const providerNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <CalenderIcon />,
    name: "Consultations",
    path: "/consultations",
  },
  {
    icon: <CalenderIcon />,
    name: "Appointments",
    path: "/appointments",
  },
  {
    icon: <TableIcon />,
    name: "My Schedule",
    path: "/schedule",
  },
  {
    icon: <PieChartIcon />,
    name: "Earnings",
    path: "/earnings",
  },
];

const providerOthersItems: NavItem[] = [
  {
    icon: <ListIcon />,
    name: "Practice",
    subItems: [
      { name: "Medical Requests", path: "/medical-requests" },
      { name: "Patient Documents", path: "/documents" },
      { name: "My Reviews", path: "/reviews" },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Account",
    subItems: [
      { name: "My Profile", path: "/profile" },
      { name: "Notifications", path: "/notifications" },
    ],
  },
];

// ── Role labels ────────────────────────────────────────────────

const sectionLabels: Record<string, { main: string; others: string }> = {
  patient: { main: "Health", others: "My Records" },
  provider: { main: "Clinical", others: "Practice" },
  admin: { main: "Menu", others: "Others" },
};

// ── Sidebar component ──────────────────────────────────────────

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { user } = useAuthStore();

  const role = user?.userCategory ?? "patient";
  const navItems = role === "provider" ? providerNavItems : patientNavItems;
  const othersItems =
    role === "provider" ? providerOthersItems : patientOthersItems;
  const labels = sectionLabels[role] ?? sectionLabels.patient;

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Auto-expand submenu for the active route
  useEffect(() => {
    let matched = false;
    (["main", "others"] as const).forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        nav.subItems?.forEach((sub) => {
          if (isActive(sub.path)) {
            setOpenSubmenu({ type: menuType, index });
            matched = true;
          }
        });
      });
    });
    if (!matched) setOpenSubmenu(null);
  }, [location, isActive, navItems, othersItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight ?? 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (
    index: number,
    menuType: "main" | "others"
  ) => {
    setOpenSubmenu((prev) => {
      if (prev?.type === menuType && prev?.index === index) return null;
      return { type: menuType, index };
    });
  };

  const showText = isExpanded || isHovered || isMobileOpen;

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        const isOpen =
          openSubmenu?.type === menuType && openSubmenu?.index === index;

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              // ── Submenu trigger ──────────────────────────────
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                aria-expanded={isOpen}
                className={`menu-item group w-full ${
                  isOpen ? "menu-item-active" : "menu-item-inactive"
                } cursor-pointer ${
                  !showText ? "lg:justify-center" : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isOpen
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {showText && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {showText && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-brand-500" : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              // ── Direct link ──────────────────────────────────
              nav.path && (
                <Link
                  to={nav.path}
                  aria-current={isActive(nav.path) ? "page" : undefined}
                  className={`menu-item group ${
                    isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {showText && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}

            {/* ── Submenu items ────────────────────────────────── */}
            {nav.subItems && showText && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: isOpen
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.path}
                        aria-current={
                          isActive(subItem.path) ? "page" : undefined
                        }
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span
                              className={`ml-auto menu-dropdown-badge ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              }`}
                            >
                              new
                            </span>
                          )}
                          {subItem.pro && (
                            <span
                              className={`ml-auto menu-dropdown-badge ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              }`}
                            >
                              pro
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Main navigation"
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div
        className={`py-8 flex ${
          !showText ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" aria-label="Go to dashboard">
          {showText ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="PocketHealth"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="PocketHealth"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="PocketHealth"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      {/* ── Role badge (visible when expanded) ───────────────── */}
      {showText && (
        <div className="mb-4 px-1">
          <RoleBadge role={role} />
        </div>
      )}

      {/* ── Nav ──────────────────────────────────────────────── */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6" aria-label="Sidebar navigation">
          <div className="flex flex-col gap-4">

            {/* Main section */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !showText ? "lg:justify-center" : "justify-start"
                }`}
              >
                {showText ? labels.main : <HorizontaLDots className="size-6" />}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            {/* Secondary section */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !showText ? "lg:justify-center" : "justify-start"
                }`}
              >
                {showText ? labels.others : <HorizontaLDots />}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>

          </div>
        </nav>

        {/* ── Sidebar widget (sign out) ─────────────────────── */}
        {showText && <SidebarWidget />}
      </div>
    </aside>
  );
};

export default AppSidebar;
EOF

# ================================================================
# 5. SIDEBAR WIDGET — wired logout + user info
# ================================================================
cat > src/layout/SidebarWidget.tsx << 'EOF'
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
EOF

# ================================================================
# 6. APP HEADER — adds role badge, keeps original structure
# ================================================================
cat > src/layout/AppHeader.tsx << 'EOF'
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";
import { useAuthStore } from "../store/authStore";
import RoleBadge from "../components/common/RoleBadge";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user } = useAuthStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  // ⌘K / Ctrl+K → focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b"
      role="banner"
    >
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">

        {/* ── Top row (mobile + desktop left) ─────────────────── */}
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">

          {/* Sidebar toggle */}
          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          {/* Mobile logo */}
          <Link to="/" className="lg:hidden">
            <img className="dark:hidden" src="./images/logo/logo.svg" alt="PocketHealth" />
            <img className="hidden dark:block" src="./images/logo/logo-dark.svg" alt="PocketHealth" />
          </Link>

          {/* Mobile menu dots */}
          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Open application menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* Desktop search */}
          <div className="hidden lg:block">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
                  <svg
                    className="fill-gray-500 dark:fill-gray-400"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                    />
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search PocketHealth..."
                  aria-label="Search"
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
                  aria-label="Keyboard shortcut: Command K"
                >
                  <span>⌘</span>
                  <span>K</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Right side (theme, notifications, role, user) ──── */}
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            <ThemeToggleButton />
            <NotificationDropdown />
          </div>

          {/* Role badge — HCI: always-visible system status */}
          {user && (
            <RoleBadge role={user.userCategory} />
          )}

          <UserDropdown />
        </div>

      </div>
    </header>
  );
};

export default AppHeader;
EOF

# ================================================================
# 7. APP.TSX — PrivateRoute + RoleGuard on all routes
# ================================================================
cat > src/App.tsx << 'EOF'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useAuthStore } from "./store/authStore";
import RoleGuard from "./components/common/RoleGuard";

// Layout
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

// Auth pages
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";

// Shared pages
import NotFound from "./pages/OtherPage/NotFound";
import Home from "./pages/Dashboard/Home";
import UserProfiles from "./pages/UserProfiles";

// PocketHealth placeholder pages
import ComingSoon from "./pages/PocketHealth/ComingSoon";

// Redirects to /signin if not authenticated
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/signin" replace />;
}

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>

          {/* ── Protected layout (requires login) ─────────────── */}
          <Route
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            {/* Shared by all roles */}
            <Route index path="/" element={<Home />} />

            <Route path="/profile" element={<UserProfiles />} />

            <Route
              path="/consultations"
              element={
                <ComingSoon
                  title="Consultations"
                  icon="🩺"
                  description="Video, audio and chat consultations with your healthcare provider."
                />
              }
            />

            <Route
              path="/appointments"
              element={
                <ComingSoon
                  title="Appointments"
                  icon="📅"
                  description="Book and manage your in-person or virtual appointments."
                />
              }
            />

            <Route
              path="/documents"
              element={
                <ComingSoon
                  title="Documents"
                  icon="📄"
                  description="Your medical documents, lab results, prescriptions and scans."
                />
              }
            />

            <Route
              path="/notifications"
              element={
                <ComingSoon
                  title="Notifications"
                  icon="🔔"
                  description="Your alerts, reminders and payment confirmations."
                />
              }
            />

            {/* ── Patient only ──────────────────────────────────── */}
            <Route
              path="/providers"
              element={
                <RoleGuard allowedRoles={["patient", "admin"]}>
                  <ComingSoon
                    title="Find Providers"
                    icon="👨‍⚕️"
                    description="Browse and book verified healthcare providers near you in Kenya."
                  />
                </RoleGuard>
              }
            />

            <Route
              path="/wallet"
              element={
                <RoleGuard allowedRoles={["patient", "admin"]}>
                  <ComingSoon
                    title="My Wallet"
                    icon="💰"
                    description="Top up via M-Pesa, view balance and transaction history."
                  />
                </RoleGuard>
              }
            />

            <Route
              path="/health-info"
              element={
                <RoleGuard allowedRoles={["patient", "admin"]}>
                  <ComingSoon
                    title="Health Info"
                    icon="❤️"
                    description="Your blood group, allergies, chronic conditions and medications."
                  />
                </RoleGuard>
              }
            />

            <Route
              path="/insurance"
              element={
                <RoleGuard allowedRoles={["patient", "admin"]}>
                  <ComingSoon
                    title="Insurance"
                    icon="🛡️"
                    description="Manage your NHIF, Jubilee, AAR and other cover details."
                  />
                </RoleGuard>
              }
            />

            <Route
              path="/emergency"
              element={
                <RoleGuard allowedRoles={["patient", "admin"]}>
                  <ComingSoon
                    title="Emergency Contacts"
                    icon="🚨"
                    description="Your emergency contacts ordered by priority."
                  />
                </RoleGuard>
              }
            />

            {/* ── Provider only ─────────────────────────────────── */}
            <Route
              path="/schedule"
              element={
                <RoleGuard allowedRoles={["provider", "admin"]}>
                  <ComingSoon
                    title="My Schedule"
                    icon="🗓️"
                    description="Manage your availability, time slots and upcoming appointments."
                  />
                </RoleGuard>
              }
            />

            <Route
              path="/earnings"
              element={
                <RoleGuard allowedRoles={["provider", "admin"]}>
                  <ComingSoon
                    title="Earnings"
                    icon="💵"
                    description="View consultation earnings, payment history and KES balance."
                  />
                </RoleGuard>
              }
            />

            <Route
              path="/medical-requests"
              element={
                <RoleGuard allowedRoles={["provider", "admin"]}>
                  <ComingSoon
                    title="Medical Requests"
                    icon="💊"
                    description="Create prescriptions, referrals and lab orders for your patients."
                  />
                </RoleGuard>
              }
            />

            <Route
              path="/reviews"
              element={
                <RoleGuard allowedRoles={["provider", "admin"]}>
                  <ComingSoon
                    title="My Reviews"
                    icon="⭐"
                    description="Patient ratings across quality, helpfulness, timeliness and care."
                  />
                </RoleGuard>
              }
            />

            {/* Wrong-role catch-all */}
            <Route
              path="/unauthorized"
              element={
                <ComingSoon
                  title="Access Restricted"
                  icon="🔒"
                  description="You do not have permission to view this section. Use the sidebar to navigate to your modules."
                />
              }
            />
          </Route>

          {/* ── Public auth routes ─────────────────────────────── */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>
    </>
  );
}
EOF

echo ""
echo "✅ RBAC full patch done!"
echo ""
echo "Files created / modified:"
echo "  ✅ src/components/common/RoleBadge.tsx    — Role status indicator"
echo "  ✅ src/components/common/RoleGuard.tsx    — Route-level role protection"
echo "  ✅ src/pages/PocketHealth/ComingSoon.tsx  — Placeholder for unbuilt pages"
echo "  ✅ src/layout/AppSidebar.tsx              — Clean role-aware sidebar"
echo "  ✅ src/layout/SidebarWidget.tsx           — Wired logout + user email"
echo "  ✅ src/layout/AppHeader.tsx               — Role badge added"
echo "  ✅ src/App.tsx                            — PrivateRoute + RoleGuard routes"
echo ""
echo "Patient login → sees: Dashboard, Find Providers, Consultations,"
echo "                       Appointments, Wallet | My Health, My Records"
echo ""
echo "Provider login → sees: Dashboard, Consultations, Appointments,"
echo "                        My Schedule, Earnings | Practice, Account"
