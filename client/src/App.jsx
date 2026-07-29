import React, { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import DoctorDashboard from "./components/dashboards/DoctorDashboard";
import ReceptionDashboard from "./components/dashboards/ReceptionDashboard";
import ManagerDashboard from "./components/dashboards/ManagerDashboard";
import PatientRegistration from "./components/forms/PatientRegistration";
import AppointmentBooking from "./components/forms/AppointmentBooking";
import Authentication from "./components/auth/Authentication";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!currentUser) {
    return (
      <Authentication
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab("dashboard");
        }}
      />
    );
  }

  const role = currentUser.role?.toLowerCase() || "doctor";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Main Content Viewport */}
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
