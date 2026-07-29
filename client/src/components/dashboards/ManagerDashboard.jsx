import { useState } from "react";

// Static mock data for Manager Dashboard
const METRICS = {
  totalRevenueToday: "$4,280",
  occupancyRate: "82%",
  activeDoctors: 14,
  totalPatientsServed: 48,
};

const DEPARTMENT_WORKLOAD = [
  { department: "General Medicine", patients: 18, capacity: "85%" },
  { department: "Cardiology", patients: 8, capacity: "60%" },
  { department: "Pediatrics", patients: 14, capacity: "90%" },
  { department: "Orthopedics", patients: 8, capacity: "50%" },
];

const STAFF_STATUS = [
  {
    id: "s1",
    name: "Dr. Sarah Jenkins",
    role: "General Practitioner",
    status: "On Duty",
    room: "Consultation 1",
  },
  {
    id: "s2",
    name: "Dr. Marcus Vance",
    role: "Cardiologist",
    status: "In Surgery",
    room: "OR 2",
  },
  {
    id: "s3",
    name: "Dr. Elena Rostova",
    role: "Pediatrician",
    status: "On Duty",
    room: "Consultation 3",
  },
  {
    id: "s4",
    name: "Nurse Clara Oswald",
    role: "Head Nurse",
    status: "On Break",
    room: "Staff Lounge",
  },
];

export default function ManagerDashboard() {
  const [staff, setStaff] = useState(STAFF_STATUS);

  const toggleStaffStatus = (id) => {
    setStaff((prev) =>
      prev.map((member) => {
        if (member.id === id) {
          const nextStatus =
            member.status === "On Duty" ? "On Break" : "On Duty";
          return { ...member, status: nextStatus };
        }
        return member;
      }),
    );
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Management & Operations Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          High-level overview of facility performance, department load, and
          staff availability.
        </p>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Today's Revenue
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {METRICS.totalRevenueToday}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Bed Occupancy
          </p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {METRICS.occupancyRate}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Active Doctors
          </p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {METRICS.activeDoctors}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Visits Today
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {METRICS.totalPatientsServed}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Capacity Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            Department Capacity & Workload
          </h2>
          <div className="space-y-3">
            {DEPARTMENT_WORKLOAD.map((dept) => (
              <div key={dept.department} className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-700 dark:text-slate-300">
                    {dept.department}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {dept.patients} Patients ({dept.capacity})
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: dept.capacity }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Availability Roster */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            Staff Roster Status
          </h2>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {staff.map((member) => (
              <div
                key={member.id}
                className="py-2.5 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                    {member.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {member.role} • {member.room}
                  </p>
                </div>
                <button
                  onClick={() => toggleStaffStatus(member.id)}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium border transition-colors ${
                    member.status === "On Duty"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
                      : member.status === "In Surgery"
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
                        : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                  }`}
                >
                  {member.status}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
