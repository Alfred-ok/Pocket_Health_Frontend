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
