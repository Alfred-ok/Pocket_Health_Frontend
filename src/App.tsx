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
import Providers from "./pages/PocketHealth/Providers";
import ProviderDetail from "./pages/PocketHealth/ProviderDetail";
import Consultations from "./pages/PocketHealth/Consultations";
import Appointments from "./pages/PocketHealth/Appointments";
import Schedule from "./pages/PocketHealth/Schedule";
import WalletPage from "./pages/PocketHealth/Wallet";
import HealthInfoPage from "./pages/PocketHealth/HealthInfo";
import Documents from "./pages/PocketHealth/Documents";
import Reviews from "./pages/PocketHealth/Reviews";
import ConsultationRoom from "./pages/PocketHealth/ConsultationRoom";
import MedicalRequests from "./pages/PocketHealth/MedicalRequests";
import InsurancePage from "./pages/PocketHealth/Insurance";
import EmergencyContacts from "./pages/PocketHealth/EmergencyContacts";
import Notifications from "./pages/PocketHealth/Notifications";

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

            <Route path="/consultations" element={<Consultations />}/>

            <Route path="/consultations/:id" element={<ConsultationRoom />}/>

            <Route path="/appointments" element={<Appointments />}/>

            <Route path="/documents" element={<Documents />}/>

            <Route path="/notifications" element={<Notifications />}/>

            {/* ── Patient + Admin ────────────────────────────── */}
            <Route path="/providers" element={
              <RoleGuard allowedRoles={["patient","admin"]}>
                <Providers />
              </RoleGuard>
            }/>

            <Route path="/providers/:id" element={
              <RoleGuard allowedRoles={["patient","admin"]}>
                <ProviderDetail />
              </RoleGuard>
            }/>

            <Route path="/wallet" element={
              <RoleGuard allowedRoles={["patient","admin"]}>
                <WalletPage />
              </RoleGuard>
            }/>

            <Route path="/health-info" element={
              <RoleGuard allowedRoles={["patient","admin"]}>
                <HealthInfoPage />
              </RoleGuard>
            }/>

            <Route path="/insurance" element={
              <RoleGuard allowedRoles={["patient","admin"]}>
                <InsurancePage />
              </RoleGuard>
            }/>

            <Route path="/emergency" element={
              <RoleGuard allowedRoles={["patient","admin"]}>
                <EmergencyContacts />
              </RoleGuard>
            }/>

            {/* ── Provider + Admin ───────────────────────────── */}
            <Route path="/schedule" element={
              <RoleGuard allowedRoles={["provider","admin"]}>
                <Schedule />
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
                <MedicalRequests />
              </RoleGuard>
            }/>

            <Route path="/reviews" element={
              <RoleGuard allowedRoles={["provider","admin"]}>
                <Reviews />
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
