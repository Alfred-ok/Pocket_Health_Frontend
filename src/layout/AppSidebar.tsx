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

const roleDot: Record<string, string> = {
  patient: "bg-blue-300",
  provider: "bg-emerald-300",
  admin: "bg-amber-300",
};

const roleLabel: Record<string, string> = {
  patient: "Patient",
  provider: "Provider",
  admin: "Admin",
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// ================================================================
// PATIENT nav
// ================================================================
const patientNavItems: NavItem[] = [
  { icon: <GridIcon />,        name: "Dashboard",       path: "/"             },
  { icon: <UserCircleIcon />,  name: "Find Providers",  path: "/providers"    },
  { icon: <CalenderIcon />,    name: "Consultations",   path: "/consultations"},
  { icon: <CalenderIcon />,    name: "Appointments",    path: "/appointments" },
  { icon: <PlugInIcon />,      name: "Wallet",          path: "/wallet"       },
];

const patientOthersItems: NavItem[] = [
  {
    icon: <UserCircleIcon />,
    name: "My Health",
    subItems: [
      { name: "My Profile",          path: "/profile"   },
      { name: "Health Info",         path: "/health-info"},
      { name: "Insurance",           path: "/insurance"  },
      { name: "Emergency Contacts",  path: "/emergency"  },
    ],
  },
  {
    icon: <PageIcon />,
    name: "My Records",
    subItems: [
      { name: "Documents",     path: "/documents"    },
      { name: "Notifications", path: "/notifications"},
    ],
  },
];

// ================================================================
// PROVIDER nav
// ================================================================
const providerNavItems: NavItem[] = [
  { icon: <GridIcon />,     name: "Dashboard",     path: "/"             },
  { icon: <CalenderIcon />, name: "Consultations", path: "/consultations"},
  { icon: <CalenderIcon />, name: "Appointments",  path: "/appointments" },
  { icon: <TableIcon />,    name: "My Schedule",   path: "/schedule"     },
  { icon: <PieChartIcon />, name: "Earnings",      path: "/earnings"     },
];

const providerOthersItems: NavItem[] = [
  {
    icon: <ListIcon />,
    name: "Practice",
    subItems: [
      { name: "Medical Requests",  path: "/medical-requests"},
      { name: "Patient Documents", path: "/documents"       },
      { name: "My Reviews",        path: "/reviews"         },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Account",
    subItems: [
      { name: "My Profile",    path: "/profile"      },
      { name: "Notifications", path: "/notifications"},
    ],
  },
];

// ================================================================
// ADMIN nav — global view of all modules from the blueprint
// Core (P1): Dashboard, Consultations, Appointments, Providers,
//            Wallet, Schedule, Earnings
// Secondary (P2): Patient records, Clinical tools, Finance, System
// ================================================================
const adminNavItems: NavItem[] = [
  { icon: <GridIcon />,        name: "Dashboard",      path: "/"              },
  { icon: <CalenderIcon />,    name: "Consultations",  path: "/consultations" },
  { icon: <CalenderIcon />,    name: "Appointments",   path: "/appointments"  },
  { icon: <UserCircleIcon />,  name: "Find Providers", path: "/providers"     },
  { icon: <PlugInIcon />,      name: "Wallet",         path: "/wallet"        },
  { icon: <TableIcon />,       name: "My Schedule",    path: "/schedule"      },
  { icon: <PieChartIcon />,    name: "Earnings",       path: "/earnings"      },
];

const adminOthersItems: NavItem[] = [
  {
    icon: <UserCircleIcon />,
    name: "Patients",
    subItems: [
      { name: "User Profiles",       path: "/profile"    },
      { name: "Health Info",         path: "/health-info"},
      { name: "Insurance",           path: "/insurance"  },
      { name: "Emergency Contacts",  path: "/emergency"  },
    ],
  },
  {
    icon: <ListIcon />,
    name: "Clinical",
    subItems: [
      { name: "Medical Requests", path: "/medical-requests"},
      { name: "Documents",        path: "/documents"       },
      { name: "Reviews",          path: "/reviews"         },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "System",
    subItems: [
      { name: "Notifications", path: "/notifications"},
    ],
  },
];

// ================================================================
// Section labels per role
// ================================================================
const sectionLabels: Record<string, { main: string; others: string }> = {
  patient:  { main: "Health",    others: "My Records" },
  provider: { main: "Clinical",  others: "Practice"   },
  admin:    { main: "Platform",  others: "Management" },
};

// ================================================================
// AppSidebar component
// ================================================================
const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { user } = useAuthStore();

  const role = user?.userCategory ?? "patient";

  // Select nav arrays based on role
  const navItems =
    role === "provider" ? providerNavItems
    : role === "admin"  ? adminNavItems
    : patientNavItems;

  const othersItems =
    role === "provider" ? providerOthersItems
    : role === "admin"  ? adminOthersItems
    : patientOthersItems;

  const labels = sectionLabels[role] ?? sectionLabels.patient;

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Auto-expand submenu containing the active route
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

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
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
              // Submenu trigger
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
                    isOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"
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
                      isOpen ? "rotate-180 text-indigo-700" : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              // Direct link
              nav.path && (
                <Link
                  to={nav.path}
                  aria-current={isActive(nav.path) ? "page" : undefined}
                  className={`menu-item group ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
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

            {/* Submenu items */}
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
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-indigo-700 dark:bg-indigo-900 text-white h-screen transition-all duration-300 ease-in-out z-50 border-r border-indigo-600/40 dark:border-indigo-950
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
      {/* Logo / header */}
      <div
        className={`flex items-center py-8 ${
          !showText ? "lg:justify-center" : "gap-3"
        }`}
      >
        <Link to="/" aria-label="Go to dashboard" className="flex items-center gap-3">
          <img src="/images/logo/logo-icon.svg" alt="" width={36} height={36} className="shrink-0" />
          {showText && (
            <span className="text-lg font-semibold leading-tight text-white">
              Pocket Health
            </span>
          )}
        </Link>
      </div>

      {/* Role indicator */}
      {showText && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
          <span className={`size-2 rounded-full ${roleDot[role] ?? roleDot.patient}`} aria-hidden="true" />
          <span className="text-sm font-medium text-white">{roleLabel[role] ?? "Patient"}</span>
        </div>
      )}

      {/* Nav */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6" aria-label="Sidebar navigation">
          <div className="flex flex-col gap-4">

            {/* Main / Core section */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-indigo-200/70 ${
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-indigo-200/70 ${
                  !showText ? "lg:justify-center" : "justify-start"
                }`}
              >
                {showText ? labels.others : <HorizontaLDots />}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>

          </div>
        </nav>

        {showText && <SidebarWidget />}
      </div>
    </aside>
  );
};

export default AppSidebar;
