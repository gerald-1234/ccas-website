import { useState } from "react";

// Static mock data for Receptionist Dashboard
const INITIAL_APPOINTMENTS = [
  {
    id: "apt-101",
    patientName: "Sarah Connor",
    phone: "+1 555-0192",
    doctor: "Dr. Sarah Jenkins",
    time: "09:00 AM",
    status: "Checked In",
  },
  {
    id: "apt-102",
    patientName: "Michael Scott",
    phone: "+1 555-0143",
    doctor: "Dr. Marcus Vance",
    time: "10:30 AM",
    status: "In Consultation",
  },
  {
    id: "apt-103",
    patientName: "David Miller",
    phone: "+1 555-0188",
    doctor: "Dr. Elena Rostova",
    time: "01:15 PM",
    status: "Scheduled",
  },
  {
    id: "apt-104",
    patientName: "Elena Rostova",
    phone: "+1 555-0177",
    doctor: "Dr. Sarah Jenkins",
    time: "02:30 PM",
    status: "Scheduled",
  },
];

export default function ReceptionDashboard() {
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCheckIn = (id) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, status: "Checked In" } : apt,
      ),
    );
  };

  const handleCancel = (id) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
  };

  const filteredAppointments = appointments.filter(
    (apt) =>
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.phone.includes(searchQuery) ||
      apt.doctor.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "Checked In":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";
      case "In Consultation":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
      case "Scheduled":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Reception Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage daily check-ins, patient arrivals, and appointment statuses.
          </p>
        </div>

        {/* Quick Action Badges */}
        <div className="flex space-x-2">
          <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg">
            Total Today: {appointments.length}
          </span>
          <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-lg">
            Checked In:{" "}
            {appointments.filter((a) => a.status === "Checked In").length}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by patient name, phone, or doctor..."
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      {/* Appointment Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            Today's Schedule
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Time</th>
                <th className="p-3.5">Patient</th>
                <th className="p-3.5">Doctor</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                  >
                    <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                      {apt.time}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {apt.patientName}
                      </div>
                      <div className="text-xs text-slate-400">{apt.phone}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">
                      {apt.doctor}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadge(apt.status)}`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      {apt.status === "Scheduled" && (
                        <button
                          onClick={() => handleCheckIn(apt.id)}
                          className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium transition-colors"
                        >
                          Check In
                        </button>
                      )}
                      <button
                        onClick={() => handleCancel(apt.id)}
                        className="px-2.5 py-1 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-slate-400 text-sm"
                  >
                    No matching appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
