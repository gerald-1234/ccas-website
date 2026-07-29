import React, { useState } from 'react';
import Login from './components/auth/Login';
import Sidebar from './components/layout/Sidebar';
import DoctorDashboard from './components/dashboards/DoctorDashboard';
import ReceptionDashboard from './components/dashboards/ReceptionDashboard';
import ManagerDashboard from './components/dashboards/ManagerDashboard';
import PatientRegistration from './components/forms/PatientRegistration';
import AppointmentBooking from './components/forms/AppointmentBooking';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); // { name, role }
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!currentUser) {
    return <Login onLogin={(user) => { setCurrentUser(user); setActiveTab('dashboard'); }} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && currentUser.role === 'Doctor' && <DoctorDashboard user={currentUser} />}
          {activeTab === 'dashboard' && currentUser.role === 'Receptionist' && <ReceptionDashboard />}
          {activeTab === 'dashboard' && currentUser.role === 'Clinic Manager' && <ManagerDashboard />}
          {activeTab === 'register' && <PatientRegistration />}
          {activeTab === 'booking' && <AppointmentBooking />}
        </div>
      </main>
    </div>
  );
}
