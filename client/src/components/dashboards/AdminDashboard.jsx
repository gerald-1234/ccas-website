import { useEffect, useState } from "react";
import { Notifications } from "../shared/Notifications";
import { Account } from "../shared/Account";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { apiRequest } from "../../config/api";
import { PatientDirectory } from "../patients/PatientDirectory";

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split("/")[2] || "overview";

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "patients", label: "Patients" },
    { key: "reports", label: "Reports" },
    { key: "admin", label: "Administration" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Clinic Administration
          </h1>
          <p className="text-sm text-slate-500">
            System metrics, schedule management, and user registry.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => navigate(`/dashboard/${tab.key}`)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === tab.key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <Routes>
        <Route path="notifications" element={<Notifications />} />
        <Route path="account" element={<Account />} />
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<AdminOverview />} />
        <Route path="patients" element={<PatientDirectory />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="admin" element={<UserManagement />} />
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Routes>
    </div>
  );
};

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [aptRes, usersRes] = await Promise.all([
        apiRequest("/appointments"),
        apiRequest("/admin/users"),
      ]);

      const aptList = aptRes.appointments || aptRes || [];
      const userList = usersRes.users || usersRes || [];

      setAppointments(aptList);

      setStats({
        totalAppointments: aptRes.pagination?.total ?? aptList.length,
        totalPatients: userList.filter((u) => u.role === "patient").length,
        totalDoctors: userList.filter((u) => u.role === "doctor").length,
      });
    } catch (err) {
      console.error("Failed to load admin stats:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-slate-500">
        Loading administrative overview...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Patients
          </p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {stats.totalPatients}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Active Doctors
          </p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {stats.totalDoctors}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Appointments
          </p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {stats.totalAppointments}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Clinic Master Schedule
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Doctor</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-medium text-slate-900">
                    {apt.patient_name || apt.patient?.full_name || "N/A"}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    Dr.{" "}
                    {apt.doctor_name || apt.doctor?.full_name || "Unassigned"}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {apt.appointment_date} at {apt.appointment_time}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        apt.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {apt.status || "scheduled"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AdminReports = () => {
  const [summary, setSummary] = useState(null);
  const [utilization, setUtilization] = useState([]);
  const [range, setRange] = useState(() => {
    const to = new Date().toISOString().split("T")[0];
    const from = new Date(Date.now() - 30 * 86400000)
      .toISOString()
      .split("T")[0];
    return { from, to };
  });
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [summaryRes, utilRes] = await Promise.all([
        apiRequest(`/reports/summary?from=${range.from}&to=${range.to}`),
        apiRequest(
          `/reports/doctor-utilization?from=${range.from}&to=${range.to}`,
        ),
      ]);
      setSummary(summaryRes);
      setUtilization(utilRes.doctors || utilRes || []);
    } catch (err) {
      console.error("Failed to load reports:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [range.from, range.to]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            From
          </label>
          <input
            type="date"
            value={range.from}
            onChange={(e) => setRange({ ...range, from: e.target.value })}
            className="px-3 py-1.5 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            To
          </label>
          <input
            type="date"
            value={range.to}
            onChange={(e) => setRange({ ...range, to: e.target.value })}
            className="px-3 py-1.5 border rounded-lg text-sm"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading reports...</p>
      ) : (
        <>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Attendance Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Stat label="Total" value={summary?.total ?? 0} />
              <Stat
                label="Completed"
                value={summary?.status_counts?.completed ?? 0}
              />
              <Stat
                label="No-Shows"
                value={summary?.status_counts?.no_show ?? 0}
              />
              <Stat
                label="Attendance Rate"
                value={
                  summary?.attendance_rate != null
                    ? `${summary.attendance_rate}%`
                    : "N/A"
                }
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Doctor Utilization
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                    <th className="py-2.5 px-3">Doctor</th>
                    <th className="py-2.5 px-3">Appointments</th>
                    <th className="py-2.5 px-3">Completed</th>
                    <th className="py-2.5 px-3">Booked Minutes</th>
                    <th className="py-2.5 px-3">Completion %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {utilization.map((d) => (
                    <tr key={d.doctor_id || d.id}>
                      <td className="py-3 px-3 font-medium text-slate-900">
                        Dr. {d.first_name} {d.last_name}
                      </td>
                      <td className="py-3 px-3">{d.appointment_count ?? 0}</td>
                      <td className="py-3 px-3">{d.completed_count ?? 0}</td>
                      <td className="py-3 px-3">{d.booked_minutes ?? 0}</td>
                      <td className="py-3 px-3">
                        {d.completion_percentage != null
                          ? `${d.completion_percentage}%`
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div>
    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
      {label}
    </p>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const query = roleFilter ? `&role=${roleFilter}` : "";
      const res = await apiRequest(`/admin/users?page=1&limit=50${query}`);
      setUsers(res.users || res || []);
    } catch (err) {
      console.error("Failed to load users:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const toggleStatus = async (userId, isActive) => {
    try {
      await apiRequest(`/admin/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !isActive }),
      });
      fetchUsers();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-900">Staff Accounts</h2>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm"
        >
          <option value="">All Roles</option>
          <option value="receptionist">Receptionist</option>
          <option value="doctor">Doctor</option>
          <option value="nurse">Nurse</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 py-4">Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-medium text-slate-900">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{u.email}</td>
                  <td className="py-3 px-3 text-slate-600 capitalize">
                    {u.role}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        u.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => toggleStatus(u.id, u.is_active)}
                      className="px-2.5 py-1 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold"
                    >
                      {u.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
