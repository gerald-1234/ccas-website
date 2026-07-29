import { useState } from "react";

// Static mock data for Doctor Dashboard
const INITIAL_STATS = {
  totalPatientsToday: 12,
  pendingConsultations: 4,
  completedConsultations: 7,
  prescriptionsIssued: 9,
};

const INITIAL_APPOINTMENTS = [
  {
    id: "apt-101",
    patientName: "Sarah Connor",
    age: 34,
    gender: "Female",
    time: "09:00 AM",
    reason: "Routine Checkup & Blood Work",
    status: "Completed",
    urgency: "Normal",
  },
  {
    id: "apt-102",
    patientName: "Michael Scott",
    age: 45,
    gender: "Male",
    time: "10:30 AM",
    reason: "Persistent Migraines",
    status: "In Progress",
    urgency: "High",
  },
  {
    id: "apt-103",
    patientName: "David Miller",
    age: 29,
    gender: "Male",
    time: "01:15 PM",
    reason: "Follow-up on Knee Injury",
    status: "Waiting",
    urgency: "Normal",
  },
  {
    id: "apt-104",
    patientName: "Elena Rostova",
    age: 52,
    gender: "Female",
    time: "02:30 PM",
    reason: "Hypertension Consultation",
    status: "Waiting",
    urgency: "Medium",
  },
];

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [stats, setStats] = useState(INITIAL_STATS);

  const handleStatusChange = (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt)),
    );

    if (newStatus === "Completed") {
      setStats((prev) => ({
        ...prev,
        completedConsultations: prev.completedConsultations + 1,
        pendingConsultations: Math.max(0, prev.pendingConsultations - 1),
      }));
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case "High":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
      case "Medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";
      case "In Progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Doctor's Portal
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Overview of today's schedule, patient queue, and consultations.
        </p>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Patients Today
          </p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {stats.totalPatientsToday}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Pending Queue
          </p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {stats.pendingConsultations}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Completed
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.completedConsultations}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Prescriptions
          </p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {stats.prescriptionsIssued}
          </p>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            Patient Queue
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Static Live View
          </span>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {apt.patientName}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({apt.age} yrs, {apt.gender})
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${getUrgencyBadge(apt.urgency)}`}
                  >
                    {apt.urgency} Priority
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-300">
                    Reason:
                  </strong>{" "}
                  {apt.reason}
                </p>
                <p className="text-xs text-slate-400">
                  Scheduled Time: {apt.time}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadge(apt.status)}`}
                >
                  {apt.status}
                </span>

                {apt.status !== "Completed" && (
                  <div className="flex space-x-2">
                    {apt.status === "Waiting" && (
                      <button
                        onClick={() =>
                          handleStatusChange(apt.id, "In Progress")
                        }
                        className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition-colors"
                      >
                        Call Patient
                      </button>
                    )}
                    {apt.status === "In Progress" && (
                      <button
                        onClick={() => handleStatusChange(apt.id, "Completed")}
                        className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
