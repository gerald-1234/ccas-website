import React, { useState } from 'react';
import LandingPage from './components/landing/LandingPage';
import Authentication from './components/auth/Authentication';
import Sidebar from './components/layout/Sidebar';
import DoctorDashboard from './components/dashboards/DoctorDashboard';
import ReceptionDashboard from './components/dashboards/ReceptionDashboard';
import ManagerDashboard from './components/dashboards/ManagerDashboard';
import PatientRegistration from './components/forms/PatientRegistration';
import AppointmentBooking from './components/forms/AppointmentBooking';
import PatientDirectory from './components/patients/PatientDirectory';

// Initial Mock Seed Data
const INITIAL_PATIENTS = [
  {
    id: 'P-101',
    name: 'Marcus Vance',
    age: 42,
    gender: 'Male',
    phone: '+1 (555) 019-2834',
    email: 'marcus.vance@example.com',
    bloodGroup: 'O+',
    allergies: 'Penicillin',
    medicalHistory: 'Hypertension (2021)',
    emergencyContact: 'Sarah Vance (Wife) - +1 (555) 019-9988',
    status: 'Waiting',
    assignedDoctor: 'Dr. Sarah Jenkins',
    reason: 'Severe Chest Discomfort & Shortness of Breath',
    arrivalTime: '08:45 AM',
  },
  {
    id: 'P-102',
    name: 'Elena Rostova',
    age: 29,
    gender: 'Female',
    phone: '+1 (555) 014-8821',
    email: 'elena.r@example.com',
    bloodGroup: 'A-',
    allergies: 'None',
    medicalHistory: 'Asthma',
    emergencyContact: 'Dmitri Rostov (Brother) - +1 (555) 014-1122',
    status: 'In Consultation',
    assignedDoctor: 'Dr. Sarah Jenkins',
    reason: 'Routine Follow-up & Prescription Renewal',
    arrivalTime: '09:15 AM',
  },
  {
    id: 'P-103',
    name: 'David Kalu',
    age: 35,
    gender: 'Male',
    phone: '+1 (555) 018-3344',
    email: 'david.kalu@example.com',
    bloodGroup: 'B+',
    allergies: 'Latex',
    medicalHistory: 'Type 2 Diabetes',
    emergencyContact: 'Grace Kalu (Sister) - +1 (555) 018-7766',
    status: 'Completed',
    assignedDoctor: 'Dr. Sarah Jenkins',
    reason: 'Fasting Blood Sugar Check',
    arrivalTime: '07:30 AM',
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Shared application state
  const [patients, setPatients] = useState(INITIAL_PATIENTS);

  // Handlers to pass to forms
  const handleRegisterPatient = (newPatientData) => {
    const createdPatient = {
      id: `P-${100 + patients.length + 1}`,
      ...newPatientData,
      status: 'Waiting',
      arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setPatients((prev) => [createdPatient, ...prev]);
    setActiveTab('dashboard');
  };

  const handleBookAppointment = (bookingData) => {
    // Update or add patient into active waiting list
    setPatients((prev) =>
      prev.map((p) =>
        p.id === bookingData.patientId
          ? { ...p, status: 'Waiting', assignedDoctor: bookingData.doctor, reason: bookingData.reason }
          : p
      )
    );
    setActiveTab('dashboard');
  };

  // 1. Landing Page View
  if (!currentUser && !isAuthOpen) {
    return <LandingPage onGetStarted={() => setIsAuthOpen(true)} />;
  }

  // 2. Authentication View
  if (!currentUser && isAuthOpen) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsAuthOpen(false)}
          className="absolute top-4 left-4 z-50 flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-teal-400 transition-colors bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-md"
        >
          <span>← Back to Home</span>
        </button>

        <Authentication
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setActiveTab('dashboard');
          }}
        />
      </div>
    );
  }

  const role = currentUser.role?.toLowerCase() || 'doctor';

  // 3. Main Dashboard Workspace
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950">
      <Sidebar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={() => {
          setCurrentUser(null);
          setIsAuthOpen(false);
        }}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && role === 'doctor' && (
            <DoctorDashboard user={currentUser} patients={patients} setPatients={setPatients} />
          )}
          {activeTab === 'dashboard' && role === 'receptionist' && (
            <ReceptionDashboard patients={patients} setPatients={setPatients} />
          )}
          {activeTab === 'dashboard' && (role === 'manager' || role === 'clinic manager') && (
            <ManagerDashboard patients={patients} />
          )}

          {activeTab === 'patients' && (
            <PatientDirectory patients={patients} />
          )}
          {activeTab === 'register' && (
            <PatientRegistration onSubmitPatient={handleRegisterPatient} />
          )}
          {activeTab === 'booking' && (
            <AppointmentBooking patients={patients} onSubmitBooking={handleBookAppointment} />
          )}
        </div>
      </main>
    </div>
  );
}
