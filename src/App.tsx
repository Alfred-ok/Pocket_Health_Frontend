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
