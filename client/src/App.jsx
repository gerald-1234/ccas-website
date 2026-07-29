import { useState } from "react";
import Authentication from "./components/auth/Authentication";
import DoctorDashboard from "./components/dashboards/DoctorDashboard";
import ManagerDashboard from "./components/dashboards/ManagerDashboard";
import ReceptionDashboard from "./components/dashboards/ReceptionDashboard";
import AppointmentBooking from "./components/forms/AppointmentBooking";
import PatientRegistration from "./components/forms/PatientRegistration";
import LandingPage from "./components/landing/LandingPage";
import Sidebar from "./components/layout/Sidebar";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false); // Controls Landing vs Auth View
  const [activeTab, setActiveTab] = useState("dashboard");

  // 1. If not logged in & hasn't clicked "Access Portal", show Landing Page
  if (!currentUser && !isAuthOpen) {
    return <LandingPage onGetStarted={() => setIsAuthOpen(true)} />;
  }

  // 2. If not logged in & clicked "Access Portal", show Authentication Screen
  if (!currentUser && isAuthOpen) {
    return (
      <div className="relative">
        {/* Back to Home Button */}
        <button
          onClick={() => setIsAuthOpen(false)}
          className="absolute top-4 left-4 z-50 flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-teal-400 transition-colors bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-md"
        >
          <span>← Back to Home</span>
        </button>

        <Authentication
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setActiveTab("dashboard");
          }}
        />
      </div>
    );
  }

  const role = currentUser.role?.toLowerCase() || "doctor";

  // 3. Main Dashboard Application (When logged in)
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950">
      <Sidebar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={() => {
          setCurrentUser(null);
          setIsAuthOpen(false); // Return to landing page on logout
        }}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === "dashboard" && role === "doctor" && (
            <DoctorDashboard user={currentUser} />
          )}
          {activeTab === "dashboard" && role === "receptionist" && (
            <ReceptionDashboard />
          )}
          {activeTab === "dashboard" &&
            (role === "manager" || role === "clinic manager") && (
              <ManagerDashboard />
            )}
          {activeTab === "register" && <PatientRegistration />}
          {activeTab === "booking" && <AppointmentBooking />}
        </div>
      </main>
    </div>
  );
}
