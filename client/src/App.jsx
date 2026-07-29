import { useState } from "react";
import { AuthProvider } from "./AuthContext";
import { Authentication } from "./components/auth/Authentication";
import { LandingPage } from "./components/landing/LandingPage";
import { Sidebar } from "./components/layout/Sidebar";
import { useAuth } from "./useAuth";

// Dashboards
import { DoctorDashboard } from "./components/dashboards/DoctorDashboard";
import { ManagerDashboard } from "./components/dashboards/ManagerDashboard";
import { ReceptionDashboard } from "./components/dashboards/ReceptionDashboard";

// Forms & Pages
import { AppointmentBooking } from "./components/forms/AppointmentBooking";
import { PatientRegistration } from "./components/forms/PatientRegistration";
import { PatientDirectory } from "./components/patients/PatientDirectory";

const MainLayout = () => {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
        Loading CareConnect Workspace...
      </div>
    );
  }

  if (!user) {
    if (showAuth) {
      return <Authentication onCancelLanding={() => setShowAuth(false)} />;
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "registration":
        return (
          <PatientRegistration onSuccess={() => setActiveTab("dashboard")} />
        );
      case "booking":
        return (
          <AppointmentBooking onSuccess={() => setActiveTab("dashboard")} />
        );
      case "patients":
        return <PatientDirectory />;
      case "dashboard":
      default:
        switch (user.role) {
          case "receptionist":
            return <ReceptionDashboard />;
          case "doctor":
            return <DoctorDashboard />;
          case "manager":
            return <ManagerDashboard />;
          case "patient":
            return <AppointmentBooking />;
          default:
            return (
              <div className="p-6 bg-white rounded-xl">
                Welcome to CareConnect Workspace.
              </div>
            );
        }
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-10 overflow-y-auto">{renderContent()}</main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
