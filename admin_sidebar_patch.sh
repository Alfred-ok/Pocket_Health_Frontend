#!/bin/bash
# ================================================================
#  PocketHealth — Admin Global Sidebar Patch
#  Admin sees all modules from blueprint — patient + provider combined
#  Run from project root (where package.json lives)
# ================================================================

# ================================================================
# AppSidebar — adds full admin nav arrays
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
                      isOpen ? "rotate-180 text-brand-500" : ""
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
      {/* Logo */}
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

      {/* Role badge */}
      {showText && (
        <div className="mb-4 px-1">
          <RoleBadge role={role} />
        </div>
      )}

      {/* Nav */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6" aria-label="Sidebar navigation">
          <div className="flex flex-col gap-4">

            {/* Main / Core section */}
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

        {showText && <SidebarWidget />}
      </div>
    </aside>
  );
};

export default AppSidebar;
EOF

# ================================================================
# App.tsx — remove RoleGuard from routes so admin passes through
# ================================================================
cat > src/App.tsx << 'EOF'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useAuthStore } from "./store/authStore";
import RoleGuard from "./components/common/RoleGuard";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import Home from "./pages/Dashboard/Home";
import UserProfiles from "./pages/UserProfiles";
import ComingSoon from "./pages/PocketHealth/ComingSoon";

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

          {/* Protected layout */}
          <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>

            {/* ── All roles ──────────────────────────────────── */}
            <Route index path="/" element={<Home />} />

            <Route path="/profile" element={<UserProfiles />} />

            <Route path="/consultations" element={
              <ComingSoon title="Consultations" icon="🩺"
                description="Video, audio and chat consultations." />
            }/>

            <Route path="/appointments" element={
              <ComingSoon title="Appointments" icon="📅"
                description="Book and manage in-person or virtual appointments." />
            }/>

            <Route path="/documents" element={
              <ComingSoon title="Documents" icon="📄"
                description="Medical documents, lab results, prescriptions and scans." />
            }/>

            <Route path="/notifications" element={
              <ComingSoon title="Notifications" icon="🔔"
                description="Your alerts, reminders and payment confirmations." />
            }/>

            {/* ── Patient + Admin ────────────────────────────── */}
            <Route path="/providers" element={
              <RoleGuard allowedRoles={["patient","admin"]}>
                <ComingSoon title="Find Providers" icon="👨‍⚕️"
                  description="Browse and book verified healthcare providers near you." />
              </RoleGuard>
            }/>

            <Route path="/wallet" element={
              <RoleGuard allowedRoles={["patient","admin"]}>
                <ComingSoon title="My Wallet" icon="💰"
                  description="Top up via M-Pesa, view balance and transaction history." />
              </RoleGuard>
            }/>

            <Route path="/health-info" element={
              <RoleGuard allowedRoles={["patient","admin"]}>
                <ComingSoon title="Health Info" icon="❤️"
                  description="Blood group, allergies, chronic conditions and medications." />
              </RoleGuard>
            }/>

            <Route path="/insurance" element={
              <RoleGuard allowedRoles={["patient","admin"]}>
                <ComingSoon title="Insurance" icon="🛡️"
                  description="Manage NHIF, Jubilee, AAR and other cover details." />
              </RoleGuard>
            }/>

            <Route path="/emergency" element={
              <RoleGuard allowedRoles={["patient","admin"]}>
                <ComingSoon title="Emergency Contacts" icon="🚨"
                  description="Emergency contacts ordered by priority." />
              </RoleGuard>
            }/>

            {/* ── Provider + Admin ───────────────────────────── */}
            <Route path="/schedule" element={
              <RoleGuard allowedRoles={["provider","admin"]}>
                <ComingSoon title="My Schedule" icon="🗓️"
                  description="Manage availability, time slots and upcoming appointments." />
              </RoleGuard>
            }/>

            <Route path="/earnings" element={
              <RoleGuard allowedRoles={["provider","admin"]}>
                <ComingSoon title="Earnings" icon="💵"
                  description="Consultation earnings, payment history and KES balance." />
              </RoleGuard>
            }/>

            <Route path="/medical-requests" element={
              <RoleGuard allowedRoles={["provider","admin"]}>
                <ComingSoon title="Medical Requests" icon="💊"
                  description="Create prescriptions, referrals and lab orders." />
              </RoleGuard>
            }/>

            <Route path="/reviews" element={
              <RoleGuard allowedRoles={["provider","admin"]}>
                <ComingSoon title="Reviews" icon="⭐"
                  description="Patient ratings across quality, helpfulness, timeliness and care." />
              </RoleGuard>
            }/>

            {/* Unauthorized */}
            <Route path="/unauthorized" element={
              <ComingSoon title="Access Restricted" icon="🔒"
                description="You do not have permission to view this section." />
            }/>

          </Route>

          {/* Public */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>
    </>
  );
}
EOF

# ================================================================
# RoleGuard — admin always passes through
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

  // Admin always has global access
  if (role === "admin" || allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  return <Navigate to={redirectTo} replace />;
};

export default RoleGuard;
EOF

echo ""
echo "✅ Admin global sidebar patch done!"
echo ""
echo "Admin sidebar layout:"
echo ""
echo "  PLATFORM (main section)"
echo "  ├── Dashboard"
echo "  ├── Consultations"
echo "  ├── Appointments"
echo "  ├── Find Providers"
echo "  ├── Wallet"
echo "  ├── My Schedule"
echo "  └── Earnings"
echo ""
echo "  MANAGEMENT (secondary section)"
echo "  ├── Patients"
echo "  │   ├── User Profiles"
echo "  │   ├── Health Info"
echo "  │   ├── Insurance"
echo "  │   └── Emergency Contacts"
echo "  ├── Clinical"
echo "  │   ├── Medical Requests"
echo "  │   ├── Documents"
echo "  │   └── Reviews"
echo "  └── System"
echo "      └── Notifications"
echo ""
echo "Register an admin account to test:"
echo "  curl -X POST http://localhost:8080/api/v1/auth/register \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"admin@pockethealth.co.ke\",\"pin\":\"1234\",\"userCategory\":\"admin\"}'"
